import React from 'react';

interface TranscriptDisplayProps {
    transcript: string
}

export function TranscriptDisplay({ transcript }: TranscriptDisplayProps) {
    return (
        <div className="fixed top-8 right-8 w-96 max-h-80 bg-black bg-opacity-60 backdrop-blur-lg rounded-xl p-6 overflow-y-auto z-10"> 
            <h2 className="text-xl font-bold mb-4 text-white">
                Live Transcript
            </h2>
            <p className="text-gray-200 whitespace-pre-wrap leading-relaxed">
                {transcript || 'Start speaking to see transcript...'}
            </p>
        </div>
    )
}