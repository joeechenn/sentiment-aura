import React, { useState, useRef } from 'react';
import { Controls } from './components/Controls';
import { TranscriptDisplay } from './components/TranscriptDisplay';
import { KeywordsDisplay } from './components/KeywordsDisplay';
import { DeepgramService } from './services/DeepgramService';
import { analyzeSentiment } from './services/BackendService';
import './App.css';

function App() {
  const [isRecording, setIsRecording] = useState(false);
  const [transcript, setTranscript] = useState('');
  const [sentiment, setSentiment] = useState<number>(0);
  const [keywords, setKeywords] = useState<string[]>([]);

  const deepgramService = useRef(new DeepgramService());
  const deepgramApiKey = process.env.REACT_APP_DEEPGRAM_API_KEY || '';

  const handleStart = async () => {

    if (!deepgramApiKey) {
      alert('Deepgram API key is missing.')
      return;
    }

    setIsRecording(true);
    setTranscript('');
    
    try {
      await deepgramService.current.startTranscription(
        deepgramApiKey,
        async (text: string, isFinal: boolean) => {
          
          setTranscript((prev) => {
            if (isFinal) {
              return prev + ' ' + text;
            }
            else {
              return prev + ' ' + text;
            }
          });

          if (isFinal && text.trim() !== '') {
            try {
              const sentimentData = await analyzeSentiment(text);
              setSentiment(sentimentData.sentiment);
              setKeywords(sentimentData.keywords);
            }
            catch (error) {
              console.error('Failed to analyze sentiment:', error);
            }
          }
        },
        (error: Error) => {
          console.error('Transcription error:', error);
          alert(`Error: ${error.message}`);
          handleStop();
        }
      );
    }
    catch (error) {
      console.error('Failed to start transcription:', error);
      setIsRecording(false);
    }
  };

  const handleStop = () => {
    deepgramService.current.stopTranscription();
    setIsRecording(false);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-900 via-blue-900 to-indigo-900">
      <div className="fixed inset-0 z-0 bg-black opacity-20"> 
      </div>
      <TranscriptDisplay transcript={transcript} />
      <Controls
      isRecording={isRecording}
      onStart={handleStart}
      onStop={handleStop}
      />
      <div className="fixed bottom-4 left-4 text-white text-sm bg-black bg-opacity-50 p-2 rounded">
        <p>
          Sentiment: {sentiment.toFixed(2)}
        </p>
        <p>
          Keywords: {keywords.length}
        </p>
      </div>
    </div>
  )
}

export default App;
