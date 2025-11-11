import React from 'react';

interface KeywordsDisplayProps {
  keywords: string[];
}

export function KeywordsDisplay({ keywords }: KeywordsDisplayProps) {
  if (keywords.length === 0) {
    return null;
  }
  return (
  <div className="fixed bottom-8 left-8 bg-white/20 backdrop-blur-lg rounded-2xl shadow-2xl border border-white/30 p-6 max-w-md z-10">
    <h3 className="text-sm font-semibold text-gray-900 mb-3">
      Keywords
    </h3>
    <div className="flex flex-wrap gap-2">
      {keywords.map((keyword, index) => (
        <span
        key={`${keyword}-${index}`}
        className="px-3 py-1.5 bg-white/40 text-gray-900 rounded-full text-sm font-medium border border-white/50"
        >
          {keyword}
        </span>
      ))}
    </div>
  </div>
  )
}