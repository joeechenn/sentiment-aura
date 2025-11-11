import { DeepgramResponse } from '../types';

export class DeepgramService {
    private socket: WebSocket | null = null;
    private mediaRecorder: MediaRecorder | null = null;
    private stream: MediaStream | null = null;

    async startTranscription(
        apiKey: string,
        onTranscript: (text: string, isFinal: boolean) => void,
        onError?: (error: Error) => void
    ): Promise<void> {
        try {
            this.stream = await navigator.mediaDevices.getUserMedia({ audio: true });

            const wsUrl = 'wss://api.deepgram.com/v2/listen?model=flux-general-en&encoding=linear16&sample_rate=16000&punctuate=true'
            this.socket = new WebSocket(wsUrl, ['token', apiKey]);

            this.socket.onmessage = (event) => {
                const data: DeepgramResponse = JSON.parse(event.data);
                const transcript = data.channel?.alternatives[0]?.transcript;
                if (transcript && transcript.trim() !== '') {
                    onTranscript(transcript, data.is_final)
                }
            };

            this.socket.onerror = (error) => {
                console.error('WebSocket error:', error);
                onError?.(new Error('WebSocket connection failed'))
            };

            await new Promise((resolve, reject) => {
                if (!this.socket) {
                    return reject(new Error('WebSocket not initialized'));
                }
                this.socket.onopen = resolve;
                this.socket.onerror = reject;
            });

            this.mediaRecorder = new MediaRecorder(this.stream, {
                mimeType: 'audio/webm'
            });

            this.mediaRecorder.addEventListener('dataavailable', (event) => {
                if (event.data.size > 0 && this.socket?.readyState === WebSocket.OPEN) {
                    this.socket.send(event.data);
                }
            });

            this.mediaRecorder.start(250)
        }
        catch (error) {
            console.error('Error starting transcription:', error);
            onError?.(error as Error);
            throw error;
        }
    }

    stopTranscript(): void {
        if (this.mediaRecorder && this.mediaRecorder.state !== 'inactive') {
            this.mediaRecorder.stop();
        }

        if (this.stream) {
            this.stream.getTracks().forEach(track => track.stop());
        }

        this.socket = null;
        this.mediaRecorder = null;
        this.stream = null;
    }
}