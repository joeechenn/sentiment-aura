export interface SentimentData {
    sentiment: number;
    keywords: string[];
}

export interface TranscriptSegment {
    text: string;
    isFinal: boolean;
    timestamp: number;
}

export interface DeepgramResponse {
    channel: {
        alternatives: Array<{
            transcript: string;
        }>;
    };
    is_final: boolean;
}