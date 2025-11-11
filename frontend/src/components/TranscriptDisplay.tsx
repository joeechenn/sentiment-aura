import React from 'react';
import { Controls } from './Controls';

interface TranscriptDisplayProps {
    transcript: string;
    isRecording: boolean;
    onStart: () => void;
    onStop: () => void;
}

export function TranscriptDisplay({ transcript, isRecording, onStart, onStop }: TranscriptDisplayProps) {
    return (
    <div className="fixed bottom-8 left-1/2 transform -translate-x-1/2 w-96 bg-white/20 backdrop-blur-lg rounded-2xl shadow-2xl border border-white/30 overflow-hidden z-10">
        <div className="bg-white/10 backdrop-blur-sm px-6 py-4 border-b border-white/20">
            <div className="flex items-center gap-2">
                <h2 className="text-sm font-semibold text-gray-900 ml-2">
                    Live Transcript
                </h2>
            </div>
        </div>
        
        <div className="p-6 max-h-80 overflow-y-auto relative">
            <p className="text-gray-900 whitespace-pre-wrap leading-relaxed text-sm pr-16">
                {transcript || 'Start speaking to see transcript...'}
            </p>
            <div className="absolute bottom-4 right-4">
                <Controls
                isRecording={isRecording}
                onStart={onStart}
                onStop={onStop}
                />
            </div>
        </div>
    </div>
    )
}