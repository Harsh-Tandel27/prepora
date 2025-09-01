"use client";

import { useState, useRef, useEffect } from 'react';

interface VoiceInterviewProps {
  questions: string[];
  userName: string;
  onComplete: (transcript: string) => void;
}

export default function VoiceInterview({ questions, userName, onComplete }: VoiceInterviewProps) {
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [isListening, setIsListening] = useState(false);
  const [transcript, setTranscript] = useState<string[]>([]);
  const [status, setStatus] = useState('Ready to start');
  
  const recognitionRef = useRef<any>(null);

  // Initialize speech recognition
  useEffect(() => {
    if (typeof window !== 'undefined' && 'webkitSpeechRecognition' in window) {
      recognitionRef.current = new (window as any).webkitSpeechRecognition();
      recognitionRef.current.continuous = false;
      recognitionRef.current.interimResults = false;
      recognitionRef.current.lang = 'en-US';
      
      recognitionRef.current.onresult = (event: any) => {
        const userAnswer = event.results[0][0].transcript;
        setTranscript(prev => [...prev, userAnswer]);
        setStatus(`Got answer: "${userAnswer}"`);
        
        // Move to next question after user answers
        setTimeout(() => {
          if (currentQuestionIndex < questions.length - 1) {
            setCurrentQuestionIndex(prev => prev + 1);
            setStatus(`Question ${currentQuestionIndex + 2}: ${questions[currentQuestionIndex + 1]}`);
          } else {
            // Interview complete
            setStatus('Interview complete!');
            onComplete(transcript.join(' '));
          }
        }, 2000); // Wait 2 seconds before next question
      };

      recognitionRef.current.onerror = (event: any) => {
        console.error('Speech recognition error:', event.error);
        setStatus(`Error: ${event.error}`);
        setIsListening(false);
      };
    }
  }, [currentQuestionIndex, questions, onComplete]);

  const startListening = () => {
    if (recognitionRef.current) {
      recognitionRef.current.start();
      setIsListening(true);
      setStatus('Listening...');
    }
  };

  const stopListening = () => {
    if (recognitionRef.current) {
      recognitionRef.current.stop();
      setIsListening(false);
      setStatus('Stopped listening');
    }
  };

  const startInterview = () => {
    setCurrentQuestionIndex(0);
    setTranscript([]);
    setStatus(`Question 1: ${questions[0]}`);
  };

  const nextQuestion = () => {
    if (currentQuestionIndex < questions.length - 1) {
      setCurrentQuestionIndex(prev => prev + 1);
      setStatus(`Question ${currentQuestionIndex + 2}: ${questions[currentQuestionIndex + 1]}`);
    } else {
      setStatus('Interview complete!');
      onComplete(transcript.join(' '));
    }
  };

  const completeInterview = () => {
    onComplete(transcript.join(' '));
  };

  return (
    <div className="max-w-4xl mx-auto p-6 bg-white rounded-lg shadow-lg">
      <div className="text-center mb-8">
        <h2 className="text-3xl font-bold text-gray-800 mb-2">
          Voice Interview with {userName}
        </h2>
        <p className="text-gray-600">
          {questions.length} questions • {currentQuestionIndex + 1} of {questions.length}
        </p>
      </div>

      <div className="bg-gray-50 p-6 rounded-lg mb-6">
        <h3 className="text-xl font-semibold text-gray-800 mb-4">
          Current Question:
        </h3>
        <p className="text-lg text-gray-700 mb-4">
          {questions[currentQuestionIndex]}
        </p>
        <div className="text-sm text-gray-500">
          Status: {status}
        </div>
      </div>

      <div className="flex flex-wrap gap-4 justify-center mb-6">
        {currentQuestionIndex === 0 && (
          <button
            onClick={startInterview}
            className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            Start Interview
          </button>
        )}
        
        <button
          onClick={startListening}
          disabled={isListening}
          className="px-6 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors disabled:opacity-50"
        >
          {isListening ? 'Listening...' : 'Start Listening'}
        </button>
        
        <button
          onClick={stopListening}
          disabled={!isListening}
          className="px-6 py-3 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors disabled:opacity-50"
        >
          Stop Listening
        </button>
        
        <button
          onClick={nextQuestion}
          disabled={currentQuestionIndex >= questions.length - 1}
          className="px-6 py-3 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors disabled:opacity-50"
        >
          Next Question
        </button>
        
        <button
          onClick={completeInterview}
          className="px-6 py-3 bg-orange-600 text-white rounded-lg hover:bg-orange-700 transition-colors"
        >
          Complete Interview
        </button>
      </div>

      <div className="bg-gray-50 p-6 rounded-lg">
        <h3 className="text-xl font-semibold text-gray-800 mb-4">
          Your Answers ({transcript.length}):
        </h3>
        {transcript.length === 0 ? (
          <p className="text-gray-500">No answers recorded yet.</p>
        ) : (
          <div className="space-y-3">
            {transcript.map((answer, index) => (
              <div key={index} className="bg-white p-3 rounded border">
                <span className="font-medium text-gray-700">Q{index + 1}:</span>
                <span className="text-gray-600 ml-2">{answer}</span>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
