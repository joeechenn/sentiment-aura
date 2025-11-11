import { DeepgramResponse } from '../types';

export class DeepgramService {
    private socket: WebSocket | null = null;
    private stream: MediaStream | null = null;
    private audioContext: AudioContext | null = null;
    private source: MediaStreamAudioSourceNode | null = null;
    private scriptProcessor: ScriptProcessorNode | null = null;
    
    async startTranscription(
        apiKey: string,
        onTranscript: (text: string, isFinal: boolean) => void,
        onError?: (error: Error) => void
    ): Promise<void> {
        try {
            this.stream = await navigator.mediaDevices.getUserMedia({ audio: true });

            const wsUrl = 'wss://api.deepgram.com/v1/listen?encoding=linear16&sample_rate=16000&channels=1';
            this.socket = new WebSocket(wsUrl, ['token', apiKey]);

            this.socket.onmessage = (event) => {
                const data: DeepgramResponse = JSON.parse(event.data);
                const transcript = data.channel?.alternatives?.[0]?.transcript;
                
                if (transcript && transcript.trim() !== '') {
                    onTranscript(transcript, data.is_final || false);
                }
            };

            this.socket.onerror = (error) => {
                console.error('❌ WebSocket error:', error);
                onError?.(new Error('WebSocket connection failed'));
            };

            this.socket.onclose = (event) => {
            };

            await new Promise((resolve, reject) => {
                if (!this.socket) {
                    return reject(new Error('WebSocket not initialized'));
                }
                this.socket.addEventListener('open', () => resolve(null), { once: true });
                this.socket.addEventListener('error', (err) => reject(err), { once: true });
            });
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
                    this.socket.send(pcm16.buffer);
                }
            };
            this.source.connect(this.scriptProcessor);
            this.scriptProcessor.connect(this.audioContext.destination);
        }
        catch (error) {
            console.error('❌ Error starting transcription:', error);
            onError?.(error as Error);
            throw error;
        }
    }

    stopTranscription(): void {
        if (this.scriptProcessor) {
            this.scriptProcessor.disconnect();
            this.scriptProcessor = null;
        }

        if (this.source) {
            this.source.disconnect();
            this.source = null;
        }

        if (this.audioContext) {
            this.audioContext.close();
            this.audioContext = null;
        }

        if (this.stream) {
            this.stream.getTracks().forEach(track => track.stop());
            this.stream = null;
        }

        if (this.socket && this.socket.readyState === WebSocket.OPEN) {
            this.socket.close();
        }

        this.socket = null;
    }
}