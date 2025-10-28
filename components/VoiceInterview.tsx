"use client";

import { useState, useRef, useEffect, useCallback } from 'react';

interface VoiceInterviewProps {
  questions: string[];
  userName: string;
  onComplete: (transcript: string) => void;
  interviewData?: { role: string; level: string; techstack: string[]; type: string };
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

export default function VoiceInterview({ questions, userName, onComplete, interviewData }: VoiceInterviewProps) {
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
  const [selectedVoice, setSelectedVoice] = useState('');
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
  // IMPORTANT: Preserves filler words (um, ahh, like, you know) for speech analysis and evaluation
  const cleanTranscription = (text: string): string => {
    if (!text) return '';
    
    return text
      // CRITICAL: Preserve ALL filler words and natural speech patterns for evaluation
      // These are important for speech analysis, confidence assessment, and interview evaluation
      
      // Only remove obvious speech recognition artifacts that don't represent actual speech
      .replace(/\b(N|Np|Npm)\b/gi, '') // Remove only obvious artifacts
      
      // Preserve natural speech patterns:
      // - "um", "uh", "ah", "ahh" (hesitation sounds)
      // - "like", "you know", "I mean" (filler phrases)
      // - "so", "well", "basically" (transition words)
      // - All other natural speech elements are kept intact
      
      // Add pause detection for natural speech patterns
      .replace(/\s*\.\.\.\s*/g, ' -- ') // Convert ... to pauses
      .replace(/\s*\.\s*/g, ' -- ') // Convert single dots to pauses
      
      // Remove excessive whitespace but preserve single spaces
      .replace(/\s+/g, ' ')
      
      // Remove leading/trailing whitespace
      .trim()
      
      // Remove empty strings
      .replace(/^\s*$/, '');
  };



  // Pick a random voice ID each session (server will accept empty to default too)
  useEffect(() => {
    const defaultVoices = [
      'pNInz6obpgDQGcFmaJgB', '21m00Tcm4TlvDq8ikWAM', 'AZnzlk1XvdvUeBnXmlld', 'EXAVITQu4vr4xnSDxMaL'
    ];
    const random = defaultVoices[Math.floor(Math.random() * defaultVoices.length)];
    setSelectedVoice(random);
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
        console.log('🎤 Initializing speech recognition...');
        recognitionRef.current = new (window as any).webkitSpeechRecognition();
        recognitionRef.current.continuous = true;
        recognitionRef.current.interimResults = true;
        recognitionRef.current.lang = 'en-US';
        recognitionRef.current.maxAlternatives = 3;
        
        // Add pause detection
        let pauseTimeout: NodeJS.Timeout | null = null;
        let lastSpeechTime = Date.now();
        
        recognitionRef.current.onstart = () => {
          console.log('🎤 Speech recognition started');
          setError(null);
        };
        
        recognitionRef.current.onresult = (event: any) => {
          console.log('🎤 Speech recognition result:', event);
          let finalTranscript = '';
          let interimTranscript = '';
          
          // Update last speech time
          lastSpeechTime = Date.now();
          
          for (let i = event.resultIndex; i < event.results.length; i++) {
            const transcript = event.results[i][0].transcript;
            if (event.results[i].isFinal) {
              finalTranscript += transcript + ' ';
            } else {
              interimTranscript += transcript;
            }
          }
          
          console.log('🎤 Final transcript:', finalTranscript);
          console.log('🎤 Interim transcript:', interimTranscript);
          
          // Clean up the transcriptions while preserving filler words
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
          
          // Clear any existing pause timeout
          if (pauseTimeout) {
            clearTimeout(pauseTimeout);
          }
          
          // Set pause detection (2 seconds of silence = pause)
          pauseTimeout = setTimeout(() => {
            if (Date.now() - lastSpeechTime > 2000) {
              setCurrentAnswer(prev => {
                if (prev && !prev.endsWith(' -- ')) {
                  return prev + ' -- ';
                }
                return prev;
              });
            }
          }, 2000);
        };

        recognitionRef.current.onerror = (event: any) => {
          console.error('❌ Speech recognition error:', event.error);
          if (event.error === 'no-speech') {
            console.log('🔄 No speech detected, restarting...');
            restartRecognition();
          } else {
            setError(`Speech recognition error: ${event.error}`);
            setInterviewState(prev => ({ ...prev, isListening: false }));
          }
        };

        recognitionRef.current.onend = () => {
          console.log('🎤 Speech recognition ended');
          if (interviewState.phase === 'listening') {
            console.log('🔄 Restarting speech recognition...');
            restartRecognition();
          }
        };
        
        console.log('✅ Speech recognition initialized successfully');
      } catch (error) {
        console.error('❌ Error initializing speech recognition:', error);
        setError('Speech recognition not available in this browser');
      }
    } else {
      console.error('❌ Speech recognition not supported in this browser');
      setError('Speech recognition not supported in this browser');
    }
  }, []); // Remove interviewState.phase dependency

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
        // Don't speak if user is actively answering
        if (interviewState.phase === 'listening' && currentAnswer.trim()) {
          console.log('User is answering, skipping AI speech');
          resolve();
          return;
        }
        
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
    console.log('🎤 Attempting to start listening...');
    console.log('🎤 Recognition ref exists:', !!recognitionRef.current);
    console.log('🎤 Currently listening:', interviewState.isListening);
    console.log('🎤 Currently speaking:', interviewState.isSpeaking);
    
    if (recognitionRef.current && !interviewState.isListening && !interviewState.isSpeaking) {
      try {
        console.log('🎤 Starting speech recognition...');
        recognitionRef.current.start();
        setInterviewState(prev => ({ ...prev, isListening: true }));
        
        restartTimeoutRef.current = setTimeout(() => {
          if (interviewState.phase === 'listening') {
            console.log('🎤 Timeout reached, stopping recognition');
            recognitionRef.current?.stop();
          }
        }, 30000);
      } catch (error) {
        console.error('❌ Error starting speech recognition:', error);
        setError('Error starting speech recognition');
      }
    } else {
      console.log('❌ Cannot start listening - conditions not met');
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
      console.log('Manual answer submission triggered');
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
      
      // Only proceed to next question after manual submission
      setTimeout(() => {
        moveToNextQuestion();
      }, 1000);
    } else {
      console.log('Cannot submit empty answer');
    }
  }, [currentAnswer, interviewState.currentQuestionIndex, stopListening]);

  const moveToNextQuestion = useCallback(async () => {
    // Safety check: don't proceed if user is still answering
    if (interviewState.phase === 'listening' && currentAnswer.trim()) {
      console.log('User is still answering, cannot proceed to next question');
      return;
    }
    
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
  }, [interviewState.currentQuestionIndex, questions, speakText, startListening, interviewState.phase, currentAnswer]);

  const startInterview = useCallback(async () => {
    setInterviewState(prev => ({ ...prev, phase: 'welcome' }));
    setConversation([]);
    setError(null);
    
    const welcomeMessage = `Hello ${firstName}! Welcome to your interview. I'll be asking you ${questions.length} questions. Please answer each one as thoroughly as you can. When you're done answering, press Enter or click the "Press Enter When Finished Answering" button to continue. The interview will not proceed until you manually submit your answer. Let's begin with the first question.`;
    
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

  // Add pause manually
  const addPause = useCallback(() => {
    if (interviewState.phase === 'listening') {
      setCurrentAnswer(prev => {
        if (prev && !prev.endsWith(' -- ')) {
          return prev + ' -- ';
        }
        return prev;
      });
    }
  }, [interviewState.phase]);



  // Keyboard shortcuts
  useEffect(() => {
    const handleKeyPress = (event: KeyboardEvent) => {
      if (event.key === 'Enter' && !event.ctrlKey && !event.metaKey) {
        event.preventDefault();
        if (interviewState.phase === 'listening' && currentAnswer.trim()) {
          submitAnswer();
        }
      } else if (event.key === 'Escape') {
        if (interviewState.phase === 'listening') {
          skipQuestion();
        }
      } else if (event.key === ' ' && event.ctrlKey) {
        // Ctrl+Space to add pause
        event.preventDefault();
        if (interviewState.phase === 'listening') {
          addPause();
        }
      }
    };

    window.addEventListener('keydown', handleKeyPress);
    return () => window.removeEventListener('keydown', handleKeyPress);
  }, [interviewState.phase, currentAnswer, submitAnswer, skipQuestion, addPause]);

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
        {/* Voice selector removed; random voice is used per session */}
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
        {/* Summary of selected configuration */}
        {interviewState.phase === 'preparation' && interviewData && (
          <div className="bg-dark-300 p-6 rounded-lg border border-gray-600">
            <h3 className="text-xl font-semibold text-white mb-2">Interview Setup</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-gray-300">
              <div><span className="text-gray-400">Type:</span> {interviewData.type}</div>
              <div><span className="text-gray-400">Role:</span> {interviewData.role}</div>
              <div><span className="text-gray-400">Level:</span> {interviewData.level}</div>
              <div><span className="text-gray-400">Tech Stack:</span> {interviewData.techstack && interviewData.techstack.length ? interviewData.techstack.join(', ') : 'General'}</div>
              <div><span className="text-gray-400">Questions:</span> {questions.length}</div>
            </div>
          </div>
        )}
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
                  <div className="mt-2 text-sm text-yellow-400 font-semibold">
                    ⚠️ Press Enter or click the button above when you're finished answering
                  </div>
                  <div className="mt-2 text-sm text-blue-400">
                    💡 You can continue speaking to add more to your answer
                  </div>
                  <div className="mt-2 text-sm text-purple-400 font-semibold">
                    🎯 Filler words (um, ahh, like) and pauses (--) are preserved for speech analysis
                  </div>
                </div>
              )}
              
              {/* Instructions when no answer yet */}
              {!currentAnswer && (
                <div className="bg-blue-500/20 rounded-lg p-4 mb-4 text-center">
                  <div className="text-blue-300 text-sm">
                    🎤 Start speaking to answer the question. The system will continuously listen to your response.
                  </div>
                  <div className="text-purple-300 text-sm mt-2">
                    ✨ Enhanced: Filler words (um, ahh, like) and natural pauses are preserved for realistic speech analysis and evaluation.
                  </div>
                </div>
              )}
              
              {/* Action Buttons */}
              <div className="flex flex-col gap-3 justify-center items-center">
                {/* Primary Submit Button - Large and Prominent */}
                <button
                  onClick={submitAnswer}
                  disabled={!currentAnswer.trim()}
                  className="px-8 py-4 bg-green-600 hover:bg-green-700 disabled:bg-gray-600 disabled:text-gray-400 text-white rounded-lg transition-all duration-200 flex items-center space-x-3 text-lg font-semibold shadow-lg hover:shadow-xl transform hover:scale-105 disabled:transform-none disabled:scale-100"
                >
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                  <span>✅ Press Enter When Finished Answering</span>
                </button>
                
                {/* Secondary Actions */}
                <div className="flex gap-3">
                  <button
                    onClick={skipQuestion}
                    className="px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors flex items-center space-x-2"
                  >
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                    </svg>
                    <span>Next Question</span>
                  </button>
                  
                  <button
                    onClick={addPause}
                    className="px-6 py-3 bg-purple-600 hover:bg-purple-700 text-white rounded-lg transition-colors flex items-center space-x-2"
                  >
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                    <span>Add Pause (--)</span>
                  </button>
                  
                  <button
                    onClick={() => setCurrentAnswer('')}
                    className="px-6 py-3 bg-gray-600 hover:bg-gray-700 text-white rounded-lg transition-colors flex items-center space-x-2"
                  >
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                    </svg>
                    <span>Clear Answer</span>
                  </button>
                </div>
              </div>
              
              {/* Keyboard Shortcuts */}
              <div className="mt-4 text-xs text-gray-400">
                <p>💡 Tip: Press Enter to submit answer, Esc to skip question, Ctrl+Space to add pause (--)</p>
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
