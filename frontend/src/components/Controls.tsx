import React from 'react';

interface ControlsProps {
    isRecording: boolean;
    onStart: () => void;
    onStop: () => void;
}

export function Controls({ isRecording, onStart, onStop }: ControlsProps) {
    return (
        <div className="fixed bottom-8 left-1/2 transform -translate-x-1/2 z-20">
            <button
            onClick={isRecording ? onStop : onStart}
            className={`px-8 py-4 rounded-full text-xl font-bold transition-all duration-300 ${
                isRecording 
                ? 'bg-red-500 hover:bg-red-600 animate-pulse' 
                : 'bg-green-500 hover:bg-green-600'
            }`}
            >
                {isRecording ? 'Stop Recording' : 'Start Recording'}
            </button>
        </div>
    )
}