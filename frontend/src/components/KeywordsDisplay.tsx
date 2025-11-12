import React, { useEffect, useState } from 'react';

interface KeywordsDisplayProps {
  keywords: string[];
}

interface AnimatedKeyword {
  text: string;
  id: string;
  isNew: boolean;
}

export function KeywordsDisplay({ keywords }: KeywordsDisplayProps) {
  const [animatedKeywords, setAnimatedKeywords] = useState<AnimatedKeyword[]>([]);

  useEffect(() => {
    const newKeywords = keywords.map((keyword, index) => ({
      text: keyword,
      id: `${keyword}-${Date.now()}-${index}`,
      isNew: true
    }));

    setAnimatedKeywords(newKeywords);

    const timer = setTimeout(() => {
      setAnimatedKeywords(prev =>
        prev.map(kw => ({ ...kw, isNew: false }))
      );
    }, 50);

    return () => clearTimeout(timer);
  }, [keywords]);

  if (animatedKeywords.length === 0) {
    return null;
  }

  return (
    <div className="fixed bottom-8 left-8 bg-white/20 backdrop-blur-lg rounded-2xl shadow-2xl border border-white/30 p-6 max-w-md z-10">
      <h3 className="text-sm font-semibold text-gray-900 mb-3">
        Keywords
      </h3>
      <div className="flex flex-wrap gap-2">
        {animatedKeywords.map((keyword, index) => (
          <span
            key={keyword.id}
            className={`px-3 py-1.5 bg-white/40 text-gray-900 rounded-full text-sm font-medium border border-white/50 transition-all duration-700 ease-out ${
              keyword.isNew
                ? 'opacity-0 translate-y-8 scale-90'
                : 'opacity-100 translate-y-0 scale-100'
            }`}
            style={{
              transitionDelay: `${index * 100}ms`
            }}
          >
            {keyword.text}
          </span>
        ))}
      </div>
    </div>
  );
}