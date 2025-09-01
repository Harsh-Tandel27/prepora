"use client";

import VoiceInterview from './VoiceInterview';

interface InterviewWrapperProps {
  questions: string[];
  userName: string;
}

export default function InterviewWrapper({ questions, userName }: InterviewWrapperProps) {
  const handleComplete = (transcript: string) => {
    // For now, just log the transcript
    // In a real app, you'd save this to Firebase
    console.log('Interview complete:', transcript);
    console.log('Transcript:', transcript);
  };

  return (
    <VoiceInterview
      questions={questions}
      userName={userName}
      onComplete={handleComplete}
    />
  );
}
