import axios, { AxiosError } from 'axios';
import { SentimentData } from '../types';

const BACKEND_URL = 'http://localhost:8000';
const MAX_RETRIES = 2;
const RETRY_DELAY = 1000;

async function delay(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms));
}

export async function analyzeSentiment(text: string): Promise<SentimentData> {
    let lastError: Error | null = null;

    for (let attempt = 0; attempt <= MAX_RETRIES; attempt++) {
        try {
            const response = await axios.post<SentimentData>(
                `${BACKEND_URL}/api/process_text`,
                { text },
                { timeout: 10000 }
            );
            return response.data;
        } catch (error) {
            lastError = error as Error;
            const axiosError = error as AxiosError;

            if (axiosError.response?.status === 429) {
                throw new Error('API rate limit exceeded. Please try again later.');
            }

            if (axiosError.response?.status === 500) {
                console.error(`Backend error (attempt ${attempt + 1}/${MAX_RETRIES + 1}):`, error);
                
                if (attempt < MAX_RETRIES) {
                    await delay(RETRY_DELAY * (attempt + 1));
                    continue;
                }
            }

            if (axiosError.code === 'ECONNABORTED') {
                throw new Error('Request timeout. The AI service is taking too long to respond.');
            }

            if (axiosError.code === 'ERR_NETWORK') {
                throw new Error('Cannot connect to backend. Please ensure the server is running.');
            }

            if (attempt < MAX_RETRIES) {
                console.log(`Retrying sentiment analysis (attempt ${attempt + 2}/${MAX_RETRIES + 1})...`);
                await delay(RETRY_DELAY * (attempt + 1));
            }
        }
    }

    console.error('Error analyzing sentiment after retries:', lastError);
    throw new Error('Sentiment analysis failed after multiple attempts. Please try again.');
}