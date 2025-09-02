"use client";

import { useState, useRef, useEffect, useCallback } from 'react';

interface VoiceInterviewProps {
  questions: string[];
  userName: string;
  onComplete: (transcript: string) => void;
}

interface ConversationEntry {
  role: 'interviewer' | 'candidate';
  content: string;
  timestamp: Date;
  questionIndex?: number;
}

interface InterviewState {
  phase: 'preparation' | 'welcome' | 'question' | 'listening' | 'processing' | 'complete';
  currentQuestionIndex: number;
  isSpeaking: boolean;
  isListening: boolean;
  isProcessing: boolean;
}

export default function VoiceInterview({ questions, userName, onComplete }: VoiceInterviewProps) {
  // Core state
  const [interviewState, setInterviewState] = useState<InterviewState>({
    phase: 'preparation',
    currentQuestionIndex: 0,
    isSpeaking: false,
    isListening: false,
    isProcessing: false
  });
  
  const [conversation, setConversation] = useState<ConversationEntry[]>([]);
  const [currentAnswer, setCurrentAnswer] = useState('');
  const [selectedVoice, setSelectedVoice] = useState('pNInz6obpgDQGcFmaJgB');
  const [availableVoices, setAvailableVoices] = useState<any[]>([]);
  const [audioLevel, setAudioLevel] = useState(0);
  const [error, setError] = useState<string | null>(null);
  const [showVoiceSelector, setShowVoiceSelector] = useState(false);
  
  // Refs
  const recognitionRef = useRef<any>(null);
  const audioRef = useRef<HTMLAudioElement>(null);
  const audioContextRef = useRef<AudioContext | null>(null);
  const analyserRef = useRef<AnalyserNode | null>(null);
  const animationFrameRef = useRef<number | null>(null);
  const restartTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  const firstName = userName.split(' ')[0];

  // Function to clean up speech recognition transcriptions
  const cleanTranscription = (text: string): string => {
    if (!text) return '';
    
    return text
      // Remove common speech recognition artifacts and repetition
      .replace(/\b(N|Np|Npm|water|pip|pack|package|manage|managed|like|and|the|is|used|to)\b/gi, '')
      // Remove excessive whitespace
      .replace(/\s+/g, ' ')
      // Remove leading/trailing whitespace
      .trim()
      // Remove empty strings
      .replace(/^\s*$/, '');
  };



  // Fetch available voices
  useEffect(() => {
    const fetchVoices = async () => {
      try {
        const response = await fetch('/api/tts/speak');
        if (response.ok) {
          const data = await response.json();
          setAvailableVoices(data.voices);
        }
      } catch (error) {
        console.error('Error fetching voices:', error);
      }
    };
    fetchVoices();
  }, []);

  // Initialize audio context for visual feedback
  useEffect(() => {
    if (typeof window !== 'undefined') {
      audioContextRef.current = new (window.AudioContext || (window as any).webkitAudioContext)();
    }
  }, []);

  // Audio level monitoring
  useEffect(() => {
    if (interviewState.isListening && audioContextRef.current && typeof window !== 'undefined' && navigator?.mediaDevices?.getUserMedia) {
      navigator.mediaDevices.getUserMedia({ audio: true })
        .then(stream => {
          const source = audioContextRef.current!.createMediaStreamSource(stream);
          analyserRef.current = audioContextRef.current!.createAnalyser();
          analyserRef.current.fftSize = 256;
          source.connect(analyserRef.current);
          
          const dataArray = new Uint8Array(analyserRef.current.frequencyBinCount);
          
          const updateAudioLevel = () => {
            if (analyserRef.current && interviewState.isListening) {
              analyserRef.current.getByteFrequencyData(dataArray);
              const average = dataArray.reduce((a, b) => a + b) / dataArray.length;
              setAudioLevel(average);
              animationFrameRef.current = requestAnimationFrame(updateAudioLevel);
            }
          };
          updateAudioLevel();
        })
        .catch(err => {
          console.error('Error accessing microphone:', err);
          setAudioLevel(0);
        });
    } else {
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current);
      }
      setAudioLevel(0);
    }
  }, [interviewState.isListening]);

  // Initialize speech recognition
  useEffect(() => {
    if (typeof window !== 'undefined' && 'webkitSpeechRecognition' in window) {
      try {
        recognitionRef.current = new (window as any).webkitSpeechRecognition();
        recognitionRef.current.continuous = true;
        recognitionRef.current.interimResults = true;
        recognitionRef.current.lang = 'en-US';
        recognitionRef.current.maxAlternatives = 1;
        
        recognitionRef.current.onresult = (event: any) => {
          let finalTranscript = '';
          let interimTranscript = '';
          
          for (let i = event.resultIndex; i < event.results.length; i++) {
            const transcript = event.results[i][0].transcript;
            if (event.results[i].isFinal) {
              finalTranscript += transcript + ' ';
            } else {
              interimTranscript += transcript;
            }
          }
          
          // Clean up the transcriptions to reduce repetition and noise
          if (interimTranscript) {
            const cleanedInterim = cleanTranscription(interimTranscript);
            setCurrentAnswer(prev => {
              const baseAnswer = prev.replace(/\[interim\].*$/, ''); // Remove previous interim text
              return baseAnswer + (cleanedInterim ? ` [interim]${cleanedInterim}` : '');
            });
          }
          
          if (finalTranscript) {
            const cleanedFinal = cleanTranscription(finalTranscript);
            setCurrentAnswer(prev => {
              const baseAnswer = prev.replace(/\[interim\].*$/, ''); // Remove interim text
              return baseAnswer + ' ' + cleanedFinal;
            });
          }
        };

        recognitionRef.current.onerror = (event: any) => {
          console.error('Speech recognition error:', event.error);
          if (event.error === 'no-speech') {
            restartRecognition();
          } else {
            setError(`Speech recognition error: ${event.error}`);
            setInterviewState(prev => ({ ...prev, isListening: false }));
          }
        };

        recognitionRef.current.onend = () => {
          if (interviewState.phase === 'listening') {
            restartRecognition();
          }
        };
      } catch (error) {
        console.error('Error initializing speech recognition:', error);
        setError('Speech recognition not available in this browser');
      }
    }
  }, [interviewState.phase]);

  const restartRecognition = useCallback(() => {
    if (recognitionRef.current && interviewState.phase === 'listening' && !interviewState.isSpeaking) {
      try {
        recognitionRef.current.start();
      } catch (error) {
        console.error('Error restarting recognition:', error);
      }
    }
  }, [interviewState.phase, interviewState.isSpeaking]);

  const speakText = async (text: string): Promise<void> => {
    return new Promise((resolve, reject) => {
      try {
        setInterviewState(prev => ({ ...prev, isSpeaking: true }));
        
        if (interviewState.isListening) {
          stopListening();
        }
        
        fetch('/api/tts/speak', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ 
            text,
            voiceId: selectedVoice
          }),
        })
        .then(response => {
          if (response.ok) {
            return response.blob();
          } else {
            throw new Error('TTS API failed');
          }
        })
        .then(audioBlob => {
          const audioUrl = URL.createObjectURL(audioBlob);
          
          if (audioRef.current) {
            audioRef.current.src = audioUrl;
            audioRef.current.play();
            
            audioRef.current.onended = () => {
              setInterviewState(prev => ({ ...prev, isSpeaking: false }));
              URL.revokeObjectURL(audioUrl);
              resolve();
            };
            
            audioRef.current.onerror = () => {
              setInterviewState(prev => ({ ...prev, isSpeaking: false }));
              URL.revokeObjectURL(audioUrl);
              reject(new Error('Audio playback failed'));
            };
          } else {
            setInterviewState(prev => ({ ...prev, isSpeaking: false }));
            resolve();
          }
        })
        .catch(error => {
          console.error('Error with TTS:', error);
          setInterviewState(prev => ({ ...prev, isSpeaking: false }));
          
          const utterance = new SpeechSynthesisUtterance(text);
          utterance.rate = 0.9;
          utterance.pitch = 1;
          utterance.volume = 0.8;
          
          utterance.onstart = () => {
            setInterviewState(prev => ({ ...prev, isSpeaking: true }));
          };
          utterance.onend = () => {
            setInterviewState(prev => ({ ...prev, isSpeaking: false }));
            resolve();
          };
          utterance.onerror = () => {
            setInterviewState(prev => ({ ...prev, isSpeaking: false }));
            reject(new Error('Speech synthesis failed'));
          };
          
          speechSynthesis.speak(utterance);
        });
      } catch (error) {
        console.error('Error in speakText:', error);
        setInterviewState(prev => ({ ...prev, isSpeaking: false }));
        reject(error);
      }
    });
  };

  const startListening = useCallback(() => {
    if (recognitionRef.current && !interviewState.isListening && !interviewState.isSpeaking) {
      try {
        recognitionRef.current.start();
        setInterviewState(prev => ({ ...prev, isListening: true }));
        
        restartTimeoutRef.current = setTimeout(() => {
          if (interviewState.phase === 'listening') {
            recognitionRef.current?.stop();
          }
        }, 30000);
      } catch (error) {
        console.error('Error starting speech recognition:', error);
        setError('Error starting speech recognition');
      }
    }
  }, [interviewState.isListening, interviewState.isSpeaking, interviewState.phase]);

  const stopListening = useCallback(() => {
    if (recognitionRef.current && interviewState.isListening) {
      recognitionRef.current.stop();
      setInterviewState(prev => ({ ...prev, isListening: false }));
      if (restartTimeoutRef.current) {
        clearTimeout(restartTimeoutRef.current);
      }
    }
  }, [interviewState.isListening]);

  const submitAnswer = useCallback(() => {
    if (currentAnswer.trim()) {
      setInterviewState(prev => ({ ...prev, isProcessing: true }));
      
      const newEntry: ConversationEntry = {
        role: 'candidate',
        content: currentAnswer.trim(),
        timestamp: new Date(),
        questionIndex: interviewState.currentQuestionIndex
      };
      setConversation(prev => [...prev, newEntry]);
      
      stopListening();
      setCurrentAnswer('');
      
      setTimeout(() => {
        moveToNextQuestion();
      }, 1000);
    }
  }, [currentAnswer, interviewState.currentQuestionIndex, stopListening]);

  const moveToNextQuestion = useCallback(async () => {
    if (interviewState.currentQuestionIndex < questions.length - 1) {
      const nextIndex = interviewState.currentQuestionIndex + 1;
      setInterviewState(prev => ({ 
        ...prev, 
        currentQuestionIndex: nextIndex,
        phase: 'question',
        isProcessing: false
      }));
      
      const question = questions[nextIndex];
      const interviewerEntry: ConversationEntry = {
        role: 'interviewer',
        content: question,
        timestamp: new Date(),
        questionIndex: nextIndex
      };
      setConversation(prev => [...prev, interviewerEntry]);
      
      await speakText(question);
      setInterviewState(prev => ({ ...prev, phase: 'listening' }));
      startListening();
    } else {
      endInterview();
    }
  }, [interviewState.currentQuestionIndex, questions, speakText, startListening]);

  const startInterview = useCallback(async () => {
    setInterviewState(prev => ({ ...prev, phase: 'welcome' }));
    setConversation([]);
    setError(null);
    
    const welcomeMessage = `Hello ${firstName}! Welcome to your interview. I'll be asking you ${questions.length} questions. Please answer each one as thoroughly as you can. When you're done answering, press the "Submit Answer" button to continue. Let's begin with the first question.`;
    
    const welcomeEntry: ConversationEntry = {
      role: 'interviewer',
      content: welcomeMessage,
      timestamp: new Date()
    };
    setConversation([welcomeEntry]);
    
    await speakText(welcomeMessage);
    
    const question = questions[0];
    const questionEntry: ConversationEntry = {
      role: 'interviewer',
      content: question,
      timestamp: new Date(),
      questionIndex: 0
    };
    setConversation(prev => [...prev, questionEntry]);
    
    setInterviewState(prev => ({ 
      ...prev, 
      phase: 'question',
      currentQuestionIndex: 0
    }));
    
    await speakText(question);
    setInterviewState(prev => ({ ...prev, phase: 'listening' }));
    startListening();
  }, [firstName, questions, speakText, startListening]);

  const endInterview = useCallback(async () => {
    setInterviewState(prev => ({ 
      ...prev, 
      phase: 'complete',
      isListening: false,
      isSpeaking: false,
      isProcessing: false
    }));
    
    stopListening();
    
    const endMessage = `Thank you for completing the interview, ${firstName}. Your responses have been recorded and will be analyzed for feedback.`;
    const endEntry: ConversationEntry = {
      role: 'interviewer',
      content: endMessage,
      timestamp: new Date()
    };
    setConversation(prev => [...prev, endEntry]);
    
    await speakText(endMessage);
    
    setTimeout(() => {
      const fullTranscript = conversation
        .filter(entry => entry.role === 'candidate')
        .map(entry => entry.content)
        .join(' ');
      
      onComplete(fullTranscript);
    }, 2000);
  }, [firstName, conversation, speakText, stopListening, onComplete]);

  const skipQuestion = useCallback(() => {
    if (interviewState.phase === 'listening') {
      stopListening();
      setCurrentAnswer('');
      moveToNextQuestion();
    }
  }, [interviewState.phase, stopListening, moveToNextQuestion]);

  // Keyboard shortcuts
  useEffect(() => {
    const handleKeyPress = (event: KeyboardEvent) => {
      if (event.key === 'Enter' && (event.ctrlKey || event.metaKey)) {
        event.preventDefault();
        if (interviewState.phase === 'listening' && currentAnswer.trim()) {
          submitAnswer();
        }
      } else if (event.key === 'Escape') {
        if (interviewState.phase === 'listening') {
          skipQuestion();
        }
      }
    };

    window.addEventListener('keydown', handleKeyPress);
    return () => window.removeEventListener('keydown', handleKeyPress);
  }, [interviewState.phase, currentAnswer, submitAnswer, skipQuestion]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (restartTimeoutRef.current) {
        clearTimeout(restartTimeoutRef.current);
      }
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current);
      }
      stopListening();
    };
  }, [stopListening]);

  const getPhaseMessage = () => {
    switch (interviewState.phase) {
      case 'preparation':
        return 'Ready to start your interview';
      case 'welcome':
        return 'Welcome to your interview';
      case 'question':
        return 'AI is asking the question';
      case 'listening':
        return 'Listening for your answer...';
      case 'processing':
        return 'Processing your answer...';
      case 'complete':
        return 'Interview completed!';
      default:
        return '';
    }
  };

  const getProgressPercentage = () => {
    if (interviewState.phase === 'preparation' || interviewState.phase === 'welcome') {
      return 0;
    }
    return ((interviewState.currentQuestionIndex + 1) / questions.length) * 100;
  };

  return (
    <div className="max-w-4xl mx-auto p-6 bg-dark-200 rounded-lg border border-primary-200/20">
      {/* Header with Progress */}
      <div className="text-center mb-8">
        <h2 className="text-3xl font-bold text-white mb-4">
          🎤 Interactive Voice Interview
        </h2>
        
        {/* Progress Bar */}
        <div className="mb-6">
          <div className="flex justify-between text-sm text-gray-400 mb-2">
            <span>Question {interviewState.currentQuestionIndex + 1} of {questions.length}</span>
            <span>{Math.round(getProgressPercentage())}% Complete</span>
          </div>
          <div className="w-full bg-gray-700 rounded-full h-3">
            <div
              className="bg-gradient-to-r from-blue-500 to-green-500 h-3 rounded-full transition-all duration-500"
              style={{ width: `${getProgressPercentage()}%` }}
            />
          </div>
        </div>

        {/* Status Indicator */}
        <div className="mb-6">
          <div className={`inline-flex items-center px-4 py-2 rounded-full text-sm font-medium ${
            interviewState.phase === 'complete' ? 'bg-green-500 text-white' :
            interviewState.isSpeaking ? 'bg-blue-500 text-white' :
            interviewState.isListening ? 'bg-green-500 text-white' :
            interviewState.isProcessing ? 'bg-yellow-500 text-white' :
            'bg-gray-500 text-white'
          }`}>
            {interviewState.phase === 'complete' && '✅ Complete'}
            {interviewState.isSpeaking && '🔊 AI Speaking'}
            {interviewState.isListening && '🎤 Listening'}
            {interviewState.isProcessing && '⏳ Processing'}
            {!interviewState.isSpeaking && !interviewState.isListening && !interviewState.isProcessing && interviewState.phase !== 'complete' && '⏸️ Ready'}
          </div>
        </div>

        {/* Voice Selector */}
        {interviewState.phase === 'preparation' && (
          <div className="mb-6">
            <button
              onClick={() => setShowVoiceSelector(!showVoiceSelector)}
              className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors flex items-center gap-2 mx-auto"
            >
              🎵 Change AI Voice & Style
            </button>
            
            {showVoiceSelector && (
              <div className="mt-4 bg-dark-300 p-4 rounded-lg border border-gray-600">
                <h3 className="text-white font-semibold mb-3">Select AI Voice:</h3>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                  {availableVoices.map((voice) => (
                    <button
                      key={voice.id}
                      onClick={() => {
                        setSelectedVoice(voice.id);
                        setShowVoiceSelector(false);
                      }}
                      className={`p-3 rounded-lg border-2 transition-all ${
                        selectedVoice === voice.id
                          ? 'border-primary-500 bg-primary-500/20 text-white'
                          : 'border-gray-600 bg-dark-200 text-gray-300 hover:border-primary-400'
                      }`}
                    >
                      <div className="font-medium">{voice.name}</div>
                      <div className="text-xs text-gray-400">{voice.tone}</div>
                    </button>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Error Display */}
      {error && (
        <div className="mb-6 bg-red-500/20 border border-red-500/30 rounded-lg p-4">
          <div className="flex items-center space-x-2">
            <svg className="w-5 h-5 text-red-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z" />
            </svg>
            <span className="text-red-300 font-medium">Error</span>
          </div>
          <p className="text-red-200 text-sm mt-1">{error}</p>
          <button
            onClick={() => setError(null)}
            className="mt-2 text-red-300 hover:text-red-200 text-sm underline"
          >
            Dismiss
          </button>
        </div>
      )}

      {/* Browser Compatibility Warning */}
      {interviewState.phase === 'preparation' && typeof window !== 'undefined' && !('webkitSpeechRecognition' in window) && (
        <div className="mb-6 bg-yellow-500/20 border border-yellow-500/30 rounded-lg p-4">
          <div className="flex items-center space-x-2">
            <svg className="w-5 h-5 text-yellow-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z" />
            </svg>
            <span className="text-yellow-300 font-medium">Browser Compatibility</span>
          </div>
          <p className="text-yellow-200 text-sm mt-1">
            Voice recognition may not work in this browser. Please use Chrome, Edge, or Safari for the best experience.
          </p>
        </div>
      )}

      {/* Main Content Area */}
      <div className="space-y-6">
        {/* Current Question Display */}
        {interviewState.phase !== 'preparation' && interviewState.phase !== 'complete' && (
          <div className="bg-dark-300 p-6 rounded-lg border border-gray-600">
            <h3 className="text-xl font-semibold text-white mb-4">
              Current Question:
            </h3>
            <p className="text-lg text-gray-300 mb-4">
              {questions[interviewState.currentQuestionIndex]}
            </p>
            <div className="text-sm text-gray-400">
              {getPhaseMessage()}
            </div>
          </div>
        )}

        {/* Answer Input Area */}
        {interviewState.phase === 'listening' && (
          <div className="bg-gradient-to-r from-green-500/20 to-green-600/20 border border-green-500/30 rounded-2xl p-6">
            <div className="text-center">
              <div className="flex items-center justify-center space-x-3 mb-4">
                <div className="w-12 h-12 bg-green-500 rounded-full flex items-center justify-center">
                  <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11a7 7 0 01-7 7m0 0a7 7 0 01-7-7m7 7v4m0 0H8m4 0h4m-4-8a3 3 0 01-3-3V5a3 3 0 116 0v6a3 3 0 01-3 3z" />
                  </svg>
                </div>
                <h3 className="text-xl font-bold text-white">Your Turn to Answer</h3>
              </div>
              
              {/* Audio Level Indicator */}
              {interviewState.isListening && (
                <div className="mb-4">
                  <div className="flex items-center justify-center space-x-1">
                    {Array.from({ length: 10 }, (_, i) => (
                      <div
                        key={i}
                        className={`w-2 h-6 rounded transition-all duration-100 ${
                          audioLevel > i * 25 ? 'bg-green-500' : 'bg-gray-600'
                        }`}
                        style={{ height: audioLevel > i * 25 ? '24px' : '6px' }}
                      />
                    ))}
                  </div>
                </div>
              )}
              
              {/* Current Answer Display */}
              {currentAnswer && (
                <div className="bg-dark-300/50 rounded-lg p-4 mb-4 text-left">
                  <h4 className="text-white font-semibold mb-2">Your Answer:</h4>
                  <p className="text-gray-200">{currentAnswer}</p>
                  <div className="mt-2 text-sm text-green-400">
                    ✓ Continuously listening - speak as much as you need
                  </div>
                </div>
              )}
              
              {/* Action Buttons */}
              <div className="flex flex-wrap gap-3 justify-center">
                <button
                  onClick={submitAnswer}
                  disabled={!currentAnswer.trim()}
                  className="px-6 py-3 bg-green-600 hover:bg-green-700 disabled:bg-gray-600 disabled:text-gray-400 text-white rounded-lg transition-colors flex items-center space-x-2"
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                  <span>Submit Answer</span>
                </button>
                <button
                  onClick={skipQuestion}
                  className="px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors flex items-center space-x-2"
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                  </svg>
                  <span>Skip Question</span>
                </button>
              </div>
              
              {/* Keyboard Shortcuts */}
              <div className="mt-4 text-xs text-gray-400">
                <p>💡 Tip: Press Ctrl+Enter to submit, Esc to skip</p>
              </div>
            </div>
          </div>
        )}

        {/* Processing State */}
        {interviewState.phase === 'processing' && (
          <div className="bg-gradient-to-r from-yellow-500/20 to-yellow-600/20 border border-yellow-500/30 rounded-2xl p-6 text-center">
            <div className="flex items-center justify-center space-x-3 mb-4">
              <div className="w-12 h-12 bg-yellow-500 rounded-full flex items-center justify-center animate-spin">
                <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                </svg>
              </div>
              <h3 className="text-xl font-bold text-white">Processing Your Answer</h3>
            </div>
            <p className="text-gray-300">Preparing the next question...</p>
          </div>
        )}

        {/* Interview Completion */}
        {interviewState.phase === 'complete' && (
          <div className="bg-gradient-to-r from-green-500/20 to-green-600/20 border border-green-500/30 rounded-2xl p-8 text-center">
            <div className="w-16 h-16 bg-green-500 rounded-full flex items-center justify-center mx-auto mb-4">
              <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <h3 className="text-2xl font-bold text-white mb-2">Interview Completed!</h3>
            <p className="text-gray-300 mb-4">
              You've successfully completed all {questions.length} questions. Your responses are being processed.
            </p>
            <div className="text-sm text-gray-400">
              Total answers recorded: {conversation.filter(entry => entry.role === 'candidate').length}
            </div>
          </div>
        )}

        {/* Control Buttons */}
        <div className="flex flex-wrap gap-4 justify-center">
          {interviewState.phase === 'preparation' && (
            <button
              onClick={startInterview}
              className="px-8 py-4 bg-primary-500 hover:bg-primary-600 text-white rounded-lg font-semibold transition-colors flex items-center gap-2"
            >
              🎯 Start Interview
            </button>
          )}
          
          {interviewState.phase !== 'preparation' && interviewState.phase !== 'complete' && (
            <button
              onClick={endInterview}
              className="px-6 py-3 bg-red-600 hover:bg-red-700 text-white rounded-lg transition-colors flex items-center gap-2"
            >
              🏁 End Interview
            </button>
          )}
        </div>

        {/* Conversation History */}
        {conversation.length > 0 && (
          <div className="bg-dark-300 p-6 rounded-lg border border-gray-600">
            <h3 className="text-xl font-semibold text-white mb-4">
              Conversation History ({conversation.length} messages)
            </h3>
            <div className="space-y-4 max-h-96 overflow-y-auto">
              {conversation.map((entry, index) => (
                <div
                  key={index}
                  className={`p-4 rounded-lg ${
                    entry.role === 'interviewer'
                      ? 'bg-blue-500/20 border-l-4 border-blue-500'
                      : 'bg-green-500/20 border-l-4 border-green-500'
                  }`}
                >
                  <div className="flex items-center gap-2 mb-2">
                    <span className={`font-semibold ${
                      entry.role === 'interviewer' ? 'text-blue-300' : 'text-green-300'
                    }`}>
                      {entry.role === 'interviewer' ? '🤖 AI Interviewer' : '👤 You'}
                    </span>
                    <span className="text-xs text-gray-400">
                      {entry.timestamp.toLocaleTimeString()}
                    </span>
                    {entry.questionIndex !== undefined && (
                      <span className="text-xs text-gray-500">
                        Q{entry.questionIndex + 1}
                      </span>
                    )}
                  </div>
                  <p className="text-gray-200">{entry.content}</p>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Hidden audio element for ElevenLabs playback */}
      <audio ref={audioRef} />
    </div>
  );
}
