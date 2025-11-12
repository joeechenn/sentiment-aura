import React, { useEffect, useState, useRef } from 'react';
import { Controls } from './Controls';

interface TranscriptDisplayProps {
    transcript: string;
    isRecording: boolean;
    onStart: () => void;
    onStop: () => void;
}

interface TranscriptSegment {
    text: string;
    id: string;
    isNew: boolean;
}

export function TranscriptDisplay({ transcript, isRecording, onStart, onStop }: TranscriptDisplayProps) {
    const [segments, setSegments] = useState<TranscriptSegment[]>([]);
    const prevTranscriptRef = useRef('');
    const scrollRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        if (transcript !== prevTranscriptRef.current) {
            const newText = transcript.slice(prevTranscriptRef.current.length);
            
            if (newText) {
                const newSegment: TranscriptSegment = {
                    text: newText,
                    id: `segment-${Date.now()}`,
                    isNew: true
                };

                setSegments(prev => [...prev, newSegment]);

                setTimeout(() => {
                    setSegments(prev =>
                        prev.map(seg =>
                            seg.id === newSegment.id ? { ...seg, isNew: false } : seg
                        )
                    );
                }, 50);

                setTimeout(() => {
                    if (scrollRef.current) {
                        scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
                    }
                }, 100);
            }

            prevTranscriptRef.current = transcript;
        }
    }, [transcript]);

    useEffect(() => {
        if (!isRecording && transcript === '') {
            setSegments([]);
            prevTranscriptRef.current = '';
        }
    }, [isRecording, transcript]);

    return (
        <div className="fixed bottom-8 left-1/2 transform -translate-x-1/2 w-96 bg-white/20 backdrop-blur-lg rounded-2xl shadow-2xl border border-white/30 overflow-hidden z-10">
            <div className="bg-white/10 backdrop-blur-sm px-2 py-2 border-b border-white/20">
                <div className="flex items-center gap-2">
                    <h2 className="text-sm font-semibold text-gray-900 ml-2">
                        Live Transcript
                    </h2>
                </div>
            </div>
            
            <div ref={scrollRef} className="p-8 max-h-80 overflow-y-auto relative">
                <div className="text-gray-900 whitespace-pre-wrap leading-relaxed text-sm pr-16">
                    {segments.length === 0 ? (
                        'Start speaking to see transcript...'
                    ) : (
                        segments.map((segment) => (
                            <span
                                key={segment.id}
                                className={`inline transition-all duration-500 ease-out ${
                                    segment.isNew
                                        ? 'opacity-0 translate-y-2'
                                        : 'opacity-100 translate-y-0'
                                }`}
                                style={{ display: 'inline-block' }}
                            >
                                {segment.text}
                            </span>
                        ))
                    )}
                </div>
                <div className="absolute bottom-4 right-4">
                    <Controls
                        isRecording={isRecording}
                        onStart={onStart}
                        onStop={onStop}
                    />
                </div>
            </div>
        </div>
    );
}