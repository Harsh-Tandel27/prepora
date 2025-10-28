"use client";

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import VoiceInterview from './VoiceInterview';
import AnalysisResults from './AnalysisResults';
import { createFeedback } from '@/lib/actions/general.action';

interface InterviewWrapperProps {
  questions: string[];
  userName: string;
  interviewId: string;
  userId: string;
  interviewData: {
    role: string;
    level: string;
    techstack: string[];
    type: string;
  };
}

export default function InterviewWrapper({ questions, userName, interviewId, userId, interviewData }: InterviewWrapperProps) {
  const [isCompleted, setIsCompleted] = useState(false);
  const [showAnalysis, setShowAnalysis] = useState(false);
  const [finalTranscript, setFinalTranscript] = useState('');
  const [isGeneratingFeedback, setIsGeneratingFeedback] = useState(false);
  const [feedbackId, setFeedbackId] = useState<string | null>(null);
  const router = useRouter();

  const handleComplete = async (transcript: string) => {
    console.log('Interview completed!');
    console.log('Full transcript:', transcript);
    
    setFinalTranscript(transcript);
    setIsCompleted(true);
    setShowAnalysis(true);
  };

  const handleContinueToFeedback = async () => {
    if (finalTranscript.trim()) {
      setIsGeneratingFeedback(true);
      console.log('Generating ML-powered feedback...');
      
      try {
        // Convert transcript to the format expected by createFeedback
        const transcriptMessages = finalTranscript.split('.').map((sentence, index) => ({
          role: 'candidate' as const,
          content: sentence.trim(),
          timestamp: new Date().toISOString(),
          questionIndex: Math.floor(index / 2) // Approximate question index
        })).filter(msg => msg.content.length > 0);

        const result = await createFeedback({
          interviewId,
          userId,
          transcript: transcriptMessages,
          feedbackId: null
        });

        if (result.success && result.feedbackId) {
          setFeedbackId(result.feedbackId);
          console.log('✅ Feedback generated successfully:', result.feedbackId);
          
          // Redirect to feedback page after a short delay
          setTimeout(() => {
            router.push(`/interview/${interviewId}/feedback`);
          }, 2000);
        } else {
          console.error('❌ Failed to generate feedback');
        }
      } catch (error) {
        console.error('❌ Error generating feedback:', error);
      } finally {
        setIsGeneratingFeedback(false);
      }
    }
  };

  const handleRetakeInterview = () => {
    setIsCompleted(false);
    setShowAnalysis(false);
    setFinalTranscript('');
    setFeedbackId(null);
  };

  if (isCompleted && showAnalysis) {
    return (
      <AnalysisResults
        transcript={finalTranscript}
        interviewData={interviewData}
        onContinue={handleContinueToFeedback}
        onRetake={handleRetakeInterview}
      />
    );
  }

  if (isCompleted && isGeneratingFeedback) {
    return (
      <div className="max-w-4xl mx-auto p-6 bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 rounded-lg border border-white/20">
        <div className="text-center">
          <h2 className="text-3xl font-bold text-white mb-4">
            🎉 Interview Completed!
          </h2>
          
          <div className="space-y-4">
            <div className="flex items-center justify-center gap-3">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-purple-400"></div>
              <p className="text-gray-300 text-lg">
                Generating detailed feedback...
              </p>
            </div>
            <p className="text-gray-400 text-sm">
              Creating your personalized feedback report
            </p>
          </div>
        </div>
      </div>
    );
  }

  if (isCompleted && feedbackId) {
    return (
      <div className="max-w-4xl mx-auto p-6 bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 rounded-lg border border-white/20">
        <div className="text-center">
          <h2 className="text-3xl font-bold text-white mb-4">
            🎉 Interview Completed!
          </h2>
          
          <div className="space-y-4">
            <p className="text-green-400 text-lg font-semibold">
              ✅ Feedback generated successfully!
            </p>
            <p className="text-gray-300">
              Redirecting to your personalized feedback...
            </p>
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
      interviewData={interviewData}
    />
  );
}
