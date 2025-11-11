import React from 'react';

interface ControlsProps {
    isRecording: boolean;
    onStart: () => void;
    onStop: () => void;
}

export function Controls({ isRecording, onStart, onStop }: ControlsProps) {
    return (
    <button
    onClick={isRecording ? onStop : onStart}
    className={`w-12 h-12 rounded-full shadow-lg transition-all duration-300 flex items-center justify-center ${
        isRecording 
        ? 'bg-red-500 hover:bg-red-600 animate-pulse' 
        : 'bg-blue-500 hover:bg-blue-600'
    }`}
    aria-label={isRecording ? 'Stop Recording' : 'Start Recording'}
    >
        {isRecording ? (
            <svg 
            width="20" 
            height="20" 
            viewBox="0 0 24 24" 
            fill="none" 
            stroke="white" 
            strokeWidth="2"
            >
                <rect x="6" y="6" width="12" height="12" fill="white" />
            </svg>
            ) : (
            <svg 
            width="20" 
            height="20" 
            viewBox="0 0 24 24" 
            fill="none" 
            stroke="white" 
            strokeWidth="2" 
            strokeLinecap="round" 
            strokeLinejoin="round"
            >
                <path d="M12 2a3 3 0 0 0-3 3v7a3 3 0 0 0 6 0V5a3 3 0 0 0-3-3Z" />
                <path d="M19 10v2a7 7 0 0 1-14 0v-2" />
                <line x1="12" y1="19" x2="12" y2="22" />
            </svg>
        )}
        </button>
    )
}