import React, { useState } from 'react';
import { Controls } from './components/Controls';
import { TranscriptDisplay } from './components/TranscriptDisplay';
import './App.css';

function App() {
  const [isRecording, setIsRecording] = useState(false);
  const [transcript, setTranscript] = useState(
    "I'm feeling great today. This is a test of live transcript display. The weather is amazing and I'm excited about this project."
  )

  const handleStart = () => {
    setIsRecording(true);
    console.log('Recording started');
  };

  const handleStop = () => {
    setIsRecording(false);
    console.log('Recording stopped');
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
    </div>
  )
}

export default App;
