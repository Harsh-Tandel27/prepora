"use client";

import { useState } from 'react';
import VoiceInterview from './VoiceInterview';

interface InterviewWrapperProps {
  questions: string[];
  userName: string;
}

export default function InterviewWrapper({ questions, userName }: InterviewWrapperProps) {
  const [isCompleted, setIsCompleted] = useState(false);
  const [finalTranscript, setFinalTranscript] = useState('');

  const handleComplete = (transcript: string) => {
    console.log('Interview completed!');
    console.log('Full transcript:', transcript);
    
    setFinalTranscript(transcript);
    setIsCompleted(true);
    
    // Here you could save the transcript to Firebase
    // For now, we'll just log it
    if (transcript.trim()) {
      // TODO: Save to Firebase and generate feedback
      console.log('Saving transcript to database...');
    }
  };

  if (isCompleted) {
    return (
      <div className="max-w-4xl mx-auto p-6 bg-dark-200 rounded-lg border border-primary-200/20">
        <div className="text-center">
          <h2 className="text-3xl font-bold text-white mb-4">
            🎉 Interview Completed!
          </h2>
          <p className="text-gray-300 mb-6">
            Thank you for completing the interview. Your responses have been recorded.
          </p>
          
          <div className="bg-dark-300 p-6 rounded-lg border border-gray-600 mb-6">
            <h3 className="text-xl font-semibold text-white mb-4">
              Your Interview Summary:
            </h3>
            <div className="text-left space-y-2 text-gray-300">
              <p><strong>Questions Answered:</strong> {questions.length}</p>
              <p><strong>Total Responses:</strong> {finalTranscript.split('.').length - 1}</p>
              <p><strong>Interview Duration:</strong> ~{Math.ceil(questions.length * 2)} minutes</p>
            </div>
          </div>
          
          <div className="flex gap-4 justify-center">
            <button
              onClick={() => window.location.href = '/interview'}
              className="px-6 py-3 bg-primary-500 hover:bg-primary-600 text-white rounded-lg transition-colors"
            >
              Create New Interview
            </button>
            <button
              onClick={() => window.location.href = '/'}
              className="px-6 py-3 bg-gray-600 hover:bg-gray-700 text-white rounded-lg transition-colors"
            >
              Back to Dashboard
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <VoiceInterview
      questions={questions}
      userName={userName}
      onComplete={handleComplete}
    />
  );
}
