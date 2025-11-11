import axios from 'axios';
import { SentimentData } from '../types';

const BACKEND_URL = 'http://localhost:8000';

export async function analyzeSentiment(text: string): Promise<SentimentData> {
    try {
        const response = await axios.post<SentimentData>(
            '${BACKEND_URL}/process_text',
            { text }
        );
        return response.data;
    }
    catch (error) {
        console.error('Error analyazing sentiment:', error);
        throw error;
    }
}