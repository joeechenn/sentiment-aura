import { DeepgramResponse } from '../types';

export class DeepgramService {
    private socket: WebSocket | null = null;
    private stream: MediaStream | null = null;
    private audioContext: AudioContext | null = null;
    private source: MediaStreamAudioSourceNode | null = null;
    private scriptProcessor: ScriptProcessorNode | null = null;
    private isManualClose: boolean = false;
    private onErrorCallback?: (error: Error) => void;
    
    async startTranscription(
        apiKey: string,
        onTranscript: (text: string, isFinal: boolean) => void,
        onError?: (error: Error) => void
    ): Promise<void> {
        this.isManualClose = false;
        this.onErrorCallback = onError;

        try {
            this.stream = await navigator.mediaDevices.getUserMedia({ audio: true });
        } catch (error) {
            const err = error as Error;
            if (err.name === 'NotAllowedError') {
                onError?.(new Error('Microphone access denied. Please allow microphone permissions.'));
            } else if (err.name === 'NotFoundError') {
                onError?.(new Error('No microphone found. Please connect a microphone.'));
            } else {
                onError?.(new Error('Failed to access microphone: ' + err.message));
            }
            throw error;
        }

        const wsUrl = 'wss://api.deepgram.com/v1/listen?encoding=linear16&sample_rate=16000&channels=1';
        
        try {
            this.socket = new WebSocket(wsUrl, ['token', apiKey]);
        } catch (error) {
            onError?.(new Error('Failed to create WebSocket connection'));
            throw error;
        }

        this.socket.onmessage = (event) => {
            try {
                const data: DeepgramResponse = JSON.parse(event.data);
                const transcript = data.channel?.alternatives?.[0]?.transcript;
                
                if (transcript && transcript.trim() !== '') {
                    onTranscript(transcript, data.is_final || false);
                }
            } catch (error) {
                console.error('Error parsing transcription data:', error);
            }
        };

        this.socket.onerror = (event) => {
            console.error('WebSocket error:', event);
            if (!this.isManualClose) {
                onError?.(new Error('WebSocket connection error'));
            }
        };

        this.socket.onclose = (event) => {
            console.log('WebSocket closed:', event.code, event.reason);
            
            if (!this.isManualClose) {
                if (event.code === 1006) {
                    onError?.(new Error('WebSocket connection lost unexpectedly'));
                } else if (event.code === 1008) {
                    onError?.(new Error('WebSocket connection rejected. Check API key.'));
                } else if (event.code !== 1000) {
                    onError?.(new Error(`WebSocket closed with code ${event.code}`));
                }
            }

            this.cleanupAudioResources();
        };

        await new Promise<void>((resolve, reject) => {
            if (!this.socket) {
                return reject(new Error('WebSocket not initialized'));
            }

            const timeout = setTimeout(() => {
                reject(new Error('WebSocket connection timeout'));
            }, 10000);

            this.socket.addEventListener('open', () => {
                clearTimeout(timeout);
                resolve();
            }, { once: true });

            this.socket.addEventListener('error', (err) => {
                clearTimeout(timeout);
                reject(new Error('WebSocket connection failed'));
            }, { once: true });
        });

        try {
            this.audioContext = new AudioContext({ sampleRate: 16000 });
            this.source = this.audioContext.createMediaStreamSource(this.stream);
            
            const bufferSize = 4096;
            this.scriptProcessor = this.audioContext.createScriptProcessor(bufferSize, 1, 1);
            
            this.scriptProcessor.onaudioprocess = (audioProcessingEvent) => {
                if (this.socket?.readyState === WebSocket.OPEN) {
                    const inputBuffer = audioProcessingEvent.inputBuffer;
                    const inputData = inputBuffer.getChannelData(0);
                    
                    const pcm16 = new Int16Array(inputData.length);
                    for (let i = 0; i < inputData.length; i++) {
                        const s = Math.max(-1, Math.min(1, inputData[i]));
                        pcm16[i] = s < 0 ? s * 0x8000 : s * 0x7FFF;
                    }
                    
                    try {
                        this.socket.send(pcm16.buffer);
                    } catch (error) {
                        console.error('Error sending audio data:', error);
                    }
                }
            };

            this.source.connect(this.scriptProcessor);
            this.scriptProcessor.connect(this.audioContext.destination);
        } catch (error) {
            console.error('Error setting up audio processing:', error);
            onError?.(error as Error);
            throw error;
        }
    }

    private cleanupAudioResources(): void {
        if (this.scriptProcessor) {
            try {
                this.scriptProcessor.disconnect();
            } catch (e) {}
            this.scriptProcessor = null;
        }

        if (this.source) {
            try {
                this.source.disconnect();
            } catch (e) {}
            this.source = null;
        }

        if (this.audioContext) {
            try {
                this.audioContext.close();
            } catch (e) {}
            this.audioContext = null;
        }

        if (this.stream) {
            this.stream.getTracks().forEach(track => track.stop());
            this.stream = null;
        }
    }

    stopTranscription(): void {
        this.isManualClose = true;

        if (this.socket) {
            if (this.socket.readyState === WebSocket.OPEN) {
                try {
                    this.socket.close(1000, 'Normal closure');
                } catch (error) {
                    console.error('Error closing WebSocket:', error);
                }
            }
            this.socket = null;
        }

        this.cleanupAudioResources();
    }
}