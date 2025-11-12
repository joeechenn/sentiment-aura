import React, { useState, useRef } from 'react';
import { TranscriptDisplay } from './components/TranscriptDisplay';
import { KeywordsDisplay } from './components/KeywordsDisplay';
import { AuraVisualization } from './components/AuraVisualization';
import { DeepgramService } from './services/DeepgramService';
import { analyzeSentiment } from './services/BackendService';
import './App.css';

type ConnectionStatus = 'disconnected' | 'connecting' | 'connected' | 'error';

function App() {
  const [isRecording, setIsRecording] = useState(false);
  const [transcript, setTranscript] = useState('');
  const [sentiment, setSentiment] = useState<number>(0);
  const [keywords, setKeywords] = useState<string[]>([]);
  const [connectionStatus, setConnectionStatus] = useState<ConnectionStatus>('disconnected');
  const [error, setError] = useState<string | null>(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const deepgramService = useRef(new DeepgramService());
  const deepgramApiKey = process.env.REACT_APP_DEEPGRAM_API_KEY || '';
  const reconnectAttempts = useRef(0);
  const maxReconnectAttempts = 3;

  const clearError = () => {
    setError(null);
  };

  const attemptReconnect = async () => {
    if (reconnectAttempts.current >= maxReconnectAttempts) {
      setError('Unable to connect after multiple attempts. Please check your connection and try again.');
      setConnectionStatus('error');
      setIsRecording(false);
      return;
    }

    reconnectAttempts.current += 1;
    setConnectionStatus('connecting');
    setError(`Reconnecting... (Attempt ${reconnectAttempts.current}/${maxReconnectAttempts})`);

    setTimeout(async () => {
      try {
        await handleStart();
        reconnectAttempts.current = 0;
        clearError();
      } catch (err) {
        attemptReconnect();
      }
    }, 2000);
  };

  const handleStart = async () => {
    if (!deepgramApiKey) {
      setError('Deepgram API key is missing. Please add it to your .env file.');
      setConnectionStatus('error');
      return;
    }

    setIsRecording(true);
    setTranscript('');
    setConnectionStatus('connecting');
    clearError();
    
    try {
      await deepgramService.current.startTranscription(
        deepgramApiKey,
        async (text: string, isFinal: boolean) => {
          if (connectionStatus !== 'connected') {
            setConnectionStatus('connected');
            reconnectAttempts.current = 0;
          }

          setTranscript((prev) => {
            if (isFinal) {
              return prev + ' ' + text;
            } else {
              return prev + ' ' + text;
            }
          });

          if (isFinal && text.trim() !== '') {
            setIsAnalyzing(true);
            try {
              const sentimentData = await analyzeSentiment(text);
              setSentiment(sentimentData.sentiment);
              setKeywords(sentimentData.keywords);
              setIsAnalyzing(false);
            } catch (error) {
              console.error('Failed to analyze sentiment:', error);
              setIsAnalyzing(false);
              setError('Sentiment analysis temporarily unavailable. Transcription continues.');
              setTimeout(clearError, 5000);
            }
          }
        },
        (error: Error) => {
          console.error('Transcription error:', error);
          setConnectionStatus('error');
          
          if (error.message.includes('WebSocket')) {
            setError('Connection lost. Attempting to reconnect...');
            attemptReconnect();
          } else {
            setError(`Error: ${error.message}`);
            handleStop();
          }
        }
      );
      
      setConnectionStatus('connected');
    } catch (error) {
      console.error('Failed to start transcription:', error);
      setIsRecording(false);
      setConnectionStatus('error');
      setError('Failed to start recording. Please check your microphone permissions.');
    }
  };

  const handleStop = () => {
    deepgramService.current.stopTranscription();
    setIsRecording(false);
    setConnectionStatus('disconnected');
    reconnectAttempts.current = 0;
    clearError();
  };

  return (
    <div className="min-h-screen bg-white">
      <AuraVisualization sentiment={sentiment} keywords={keywords} />
      
      {error && (
        <div className="fixed top-4 left-1/2 transform -translate-x-1/2 z-50">
          <div className="bg-red-500/90 backdrop-blur-lg text-white px-6 py-3 rounded-lg shadow-2xl flex items-center gap-3 animate-in fade-in slide-in-from-top duration-300">
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
            </svg>
            <span className="text-sm font-medium">{error}</span>
            <button onClick={clearError} className="ml-2 hover:bg-red-600 rounded p-1">
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
        </div>
      )}

      {connectionStatus !== 'disconnected' && connectionStatus !== 'error' && (
        <div className="fixed top-4 right-4 z-50">
          <div className={`px-4 py-2 rounded-lg shadow-lg flex items-center gap-2 ${
            connectionStatus === 'connected' 
              ? 'bg-green-500/90 text-white' 
              : 'bg-yellow-500/90 text-white'
          }`}>
            {connectionStatus === 'connecting' ? (
              <>
                <div className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent" />
                <span className="text-sm font-medium">Connecting...</span>
              </>
            ) : (
              <>
                <div className="w-2 h-2 bg-white rounded-full animate-pulse" />
                <span className="text-sm font-medium">Connected</span>
              </>
            )}
          </div>
        </div>
      )}

      {isAnalyzing && (
        <div className="fixed top-4 left-4 z-50">
          <div className="bg-blue-500/90 backdrop-blur-lg text-white px-4 py-2 rounded-lg shadow-lg flex items-center gap-2">
            <div className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent" />
            <span className="text-sm font-medium">Analyzing sentiment...</span>
          </div>
        </div>
      )}
      
      <TranscriptDisplay 
        transcript={transcript}
        isRecording={isRecording}
        onStart={handleStart}
        onStop={handleStop}
      />
      <KeywordsDisplay keywords={keywords} />
    </div>
  );
}

export default App;