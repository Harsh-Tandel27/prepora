"use client";

import { useState, useRef, useEffect } from 'react';
// We'll import ElevenLabs dynamically to avoid SSR issues

interface VoiceInterviewProps {
  questions: string[];
  userName: string;
  onComplete: (transcript: string) => void;
}

interface ConversationEntry {
  role: 'interviewer' | 'candidate';
  content: string;
  timestamp: Date;
}

export default function VoiceInterview({ questions, userName, onComplete }: VoiceInterviewProps) {
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [isListening, setIsListening] = useState(false);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [isInterviewActive, setIsInterviewActive] = useState(false);
  const [transcript, setTranscript] = useState<string[]>([]);
  const [conversation, setConversation] = useState<ConversationEntry[]>([]);
  const [status, setStatus] = useState('Ready to start your interview');
  const [audioLevel, setAudioLevel] = useState(0);
  const [showAnswerPrompt, setShowAnswerPrompt] = useState(false);
  const [isWaitingForAnswer, setIsWaitingForAnswer] = useState(false);
  const [currentAnswer, setCurrentAnswer] = useState('');
  const [isAnswerComplete, setIsAnswerComplete] = useState(false);
  const [accumulatedSpeech, setAccumulatedSpeech] = useState('');
  const [selectedVoice, setSelectedVoice] = useState('pNInz6obpgDQGcFmaJgB'); // Default to Adam
  const [availableVoices, setAvailableVoices] = useState<any[]>([]);
  const [showVoiceSelector, setShowVoiceSelector] = useState(false);
  
  const recognitionRef = useRef<any>(null);
  const audioRef = useRef<HTMLAudioElement>(null);
  const audioContextRef = useRef<AudioContext | null>(null);
  const analyserRef = useRef<AnalyserNode | null>(null);
  const animationFrameRef = useRef<number | null>(null);

  // Get first name only
  const getFirstName = (fullName: string) => {
    return fullName.split(' ')[0];
  };

  const firstName = getFirstName(userName);

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
    if (isListening && audioContextRef.current && typeof window !== 'undefined' && navigator?.mediaDevices?.getUserMedia) {
      navigator.mediaDevices.getUserMedia({ audio: true })
        .then(stream => {
          const source = audioContextRef.current!.createMediaStreamSource(stream);
          analyserRef.current = audioContextRef.current!.createAnalyser();
          analyserRef.current.fftSize = 256;
          source.connect(analyserRef.current);
          
          const dataArray = new Uint8Array(analyserRef.current.frequencyBinCount);
          
          const updateAudioLevel = () => {
            if (analyserRef.current && isListening) {
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
          // Don't show error to user, just disable audio level visualization
          setAudioLevel(0);
        });
    } else {
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current);
      }
      setAudioLevel(0);
    }
  }, [isListening]);

  // Initialize speech recognition
  useEffect(() => {
    if (typeof window !== 'undefined' && 'webkitSpeechRecognition' in window && !isInterviewActive) {
      try {
        recognitionRef.current = new (window as any).webkitSpeechRecognition();
        recognitionRef.current.continuous = true;
        recognitionRef.current.interimResults = true;
        recognitionRef.current.lang = 'en-US';
        recognitionRef.current.maxAlternatives = 1;
        
        // Configure for better capture of filler words and pauses
        recognitionRef.current.continuous = true;
        recognitionRef.current.interimResults = true;
        
        recognitionRef.current.onresult = (event: any) => {
          let finalTranscript = '';
          let interimTranscript = '';
          
          // Process all results to build complete transcript
          for (let i = event.resultIndex; i < event.results.length; i++) {
            const transcript = event.results[i][0].transcript;
            if (event.results[i].isFinal) {
              finalTranscript += transcript + ' ';
            } else {
              interimTranscript += transcript;
            }
          }
          
          // Update current answer with interim results
          if (interimTranscript) {
            setCurrentAnswer(accumulatedSpeech + ' ' + interimTranscript);
          }
          
          // If we have final results, append to accumulated speech
          if (finalTranscript) {
            const newAccumulated = accumulatedSpeech + ' ' + finalTranscript;
            setAccumulatedSpeech(newAccumulated);
            setCurrentAnswer(newAccumulated);
            setIsAnswerComplete(true);
            setStatus('Answer recorded. Press "Submit Answer" when ready to continue.');
          }
        };

        recognitionRef.current.onerror = (event: any) => {
          console.error('Speech recognition error:', event.error);
          setStatus(`Error: ${event.error}`);
          setIsListening(false);
        };

        recognitionRef.current.onend = () => {
          // Don't stop listening automatically - let user control it
          if (isWaitingForAnswer && !isSpeaking) {
            // Restart recognition if it ends unexpectedly
            setTimeout(() => {
              if (isWaitingForAnswer && !isListening && !isSpeaking) {
                startListening();
              }
            }, 100);
          }
        };
      } catch (error) {
        console.error('Error initializing speech recognition:', error);
        setStatus('Speech recognition not available in this browser');
      }
    }
  }, [currentQuestionIndex, questions, isInterviewActive]);

  const speakText = async (text: string): Promise<void> => {
    return new Promise((resolve, reject) => {
      try {
        setIsSpeaking(true);
        setStatus('AI is speaking...');
        
        // Stop listening while AI is speaking to prevent capturing AI voice
        if (isListening) {
          stopListening();
        }
        
        // Use our API endpoint for TTS
        fetch('/api/tts/speak', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ 
            text,
            voiceId: selectedVoice,
            voiceSettings: {
              stability: 0.5,
              similarityBoost: 0.5,
              style: 0.0,
              useSpeakerBoost: true
            }
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
              setIsSpeaking(false);
              URL.revokeObjectURL(audioUrl);
              resolve(); // Resolve when audio finishes
            };
            
            audioRef.current.onerror = () => {
              setIsSpeaking(false);
              URL.revokeObjectURL(audioUrl);
              reject(new Error('Audio playback failed'));
            };
          } else {
            setIsSpeaking(false);
            resolve();
          }
        })
        .catch(error => {
          console.error('Error with TTS:', error);
          setIsSpeaking(false);
          
          // Fallback to browser speech synthesis
          const utterance = new SpeechSynthesisUtterance(text);
          utterance.rate = 0.9;
          utterance.pitch = 1;
          utterance.volume = 0.8;
          
          utterance.onstart = () => {
            setIsSpeaking(true);
            // Stop listening while AI is speaking to prevent capturing AI voice
            if (isListening) {
              stopListening();
            }
          };
          utterance.onend = () => {
            setIsSpeaking(false);
            resolve(); // Resolve when speech synthesis finishes
          };
          utterance.onerror = () => {
            setIsSpeaking(false);
            reject(new Error('Speech synthesis failed'));
          };
          
          speechSynthesis.speak(utterance);
        });
      } catch (error) {
        console.error('Error in speakText:', error);
        setIsSpeaking(false);
        reject(error);
      }
    });
  };

  const askNextQuestion = async () => {
    if (currentQuestionIndex < questions.length) {
      const question = questions[currentQuestionIndex];
      const interviewerEntry: ConversationEntry = {
        role: 'interviewer',
        content: question,
        timestamp: new Date()
      };
      setConversation(prev => [...prev, interviewerEntry]);
      
      setStatus(`Question ${currentQuestionIndex + 1} of ${questions.length} - Listening for your answer...`);
      
      // Start speaking and set up listening to start when AI finishes
      speakText(question).then(() => {
        // This will be called when AI finishes speaking
        setShowAnswerPrompt(true);
        setIsWaitingForAnswer(true);
        setCurrentAnswer('');
        setAccumulatedSpeech('');
        setIsAnswerComplete(false);
        startListening(); // Start listening immediately after AI finishes
      });
    }
  };

  const submitAnswer = () => {
    if (currentAnswer.trim()) {
      const newEntry: ConversationEntry = {
        role: 'candidate',
        content: currentAnswer.trim(),
        timestamp: new Date()
      };
      setConversation(prev => [...prev, newEntry]);
      setTranscript(prev => [...prev, currentAnswer.trim()]);
      
      // Stop listening and clear current answer
      stopListening();
      setCurrentAnswer('');
      setAccumulatedSpeech('');
      setIsAnswerComplete(false);
      setShowAnswerPrompt(false);
      setIsWaitingForAnswer(false);
      
      // Move to next question
      moveToNextQuestion();
    }
  };

  const moveToNextQuestion = async () => {
    if (currentQuestionIndex < questions.length - 1) {
      const nextIndex = currentQuestionIndex + 1;
      setCurrentQuestionIndex(nextIndex);
      
      // Ask the next question with the new index
      const question = questions[nextIndex];
      const interviewerEntry: ConversationEntry = {
        role: 'interviewer',
        content: question,
        timestamp: new Date()
      };
      setConversation(prev => [...prev, interviewerEntry]);
      
      setStatus(`Question ${nextIndex + 1} of ${questions.length} - Listening for your answer...`);
      
      // Start speaking and set up listening to start when AI finishes
      speakText(question).then(() => {
        // This will be called when AI finishes speaking
        setShowAnswerPrompt(true);
        setIsWaitingForAnswer(true);
        setCurrentAnswer('');
        setAccumulatedSpeech('');
        setIsAnswerComplete(false);
        startListening(); // Start listening immediately after AI finishes
      });
    } else {
      endInterview();
    }
  };

  const startInterview = async () => {
    setIsInterviewActive(true);
    setConversation([]);
    setTranscript([]);
    setCurrentQuestionIndex(0);
    setStatus('Starting interview...');
    
    // Welcome message with first name only
    const welcomeMessage = `Hello ${firstName}! Welcome to your interview. I'll be asking you ${questions.length} questions. Please answer each one as thoroughly as you can. When you're done answering, press the "Submit Answer" button to continue. Let's begin with the first question.`;
    
    const welcomeEntry: ConversationEntry = {
      role: 'interviewer',
      content: welcomeMessage,
      timestamp: new Date()
    };
    setConversation([welcomeEntry]);
    
    await speakText(welcomeMessage);
    
    // Start with first question after welcome
    askNextQuestion();
  };

  const startListening = () => {
    if (recognitionRef.current && !isListening && !isSpeaking && typeof window !== 'undefined') {
      try {
        recognitionRef.current.start();
        setIsListening(true);
        setStatus('Listening for your answer...');
        
        // Restart recognition every 45 seconds to avoid timeouts for longer answers with pauses
        setTimeout(() => {
          if (isListening && recognitionRef.current && isWaitingForAnswer) {
            recognitionRef.current.stop();
            setTimeout(() => {
              if (isWaitingForAnswer && !isSpeaking) {
                recognitionRef.current.start();
                setStatus('Listening for your answer... (continued)');
              }
            }, 100);
          }
        }, 45000);
      } catch (error) {
        console.error('Error starting speech recognition:', error);
        setStatus('Error starting speech recognition');
        setIsListening(false);
      }
    }
  };

  const stopListening = () => {
    if (recognitionRef.current && isListening) {
      recognitionRef.current.stop();
      setIsListening(false);
      setStatus('Stopped listening');
    }
  };

  const endInterview = async () => {
    setIsInterviewActive(false);
    setIsListening(false);
    setIsSpeaking(false);
    setShowAnswerPrompt(false);
    setIsWaitingForAnswer(false);
    setStatus('Interview completed!');
    
    const endMessage = `Thank you for completing the interview, ${firstName}. Your responses have been recorded and will be analyzed for feedback.`;
    const endEntry: ConversationEntry = {
      role: 'interviewer',
      content: endMessage,
      timestamp: new Date()
    };
    setConversation(prev => [...prev, endEntry]);
    
    await speakText(endMessage);
    
    // Complete the interview with full transcript after a delay
    setTimeout(() => {
      const fullTranscript = conversation
        .filter(entry => entry.role === 'candidate')
        .map(entry => entry.content)
        .join(' ');
      
      onComplete(fullTranscript);
    }, 3000);
  };

  const pauseInterview = () => {
    if (isListening) {
      stopListening();
    }
    if (isSpeaking) {
      speechSynthesis.cancel();
      setIsSpeaking(false);
    }
    setStatus('Interview paused');
  };

  const resumeInterview = () => {
    if (currentQuestionIndex < questions.length) {
      setStatus('Resuming interview...');
      askNextQuestion();
    }
  };

  const skipToNextQuestion = () => {
    if (isWaitingForAnswer) {
      setShowAnswerPrompt(false);
      setIsWaitingForAnswer(false);
      stopListening();
      setCurrentAnswer('');
      setAccumulatedSpeech('');
      setIsAnswerComplete(false);
      moveToNextQuestion();
    }
  };

  return (
    <div className="max-w-4xl mx-auto p-6 bg-dark-200 rounded-lg border border-primary-200/20">
      {/* Header */}
      <div className="text-center mb-8">
        <h2 className="text-3xl font-bold text-white mb-2">
          🎤 Interactive Voice Interview
        </h2>
        <p className="text-gray-300">
          {questions.length} questions • {currentQuestionIndex + 1} of {questions.length}
        </p>
        
        {/* Voice Selector */}
        {!isInterviewActive && (
          <div className="mt-4">
            <button
              onClick={() => setShowVoiceSelector(!showVoiceSelector)}
              className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors flex items-center gap-2 mx-auto"
            >
              🎵 Change AI Voice
            </button>
            
            {showVoiceSelector && (
              <div className="mt-4 bg-dark-300 p-4 rounded-lg border border-gray-600">
                <h3 className="text-white font-semibold mb-3">Select AI Voice Tone:</h3>
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
        
        <div className="mt-4">
          <div className={`inline-flex items-center px-4 py-2 rounded-full text-sm font-medium ${
            isInterviewActive 
              ? isSpeaking 
                ? 'bg-blue-500 text-white' 
                : isListening 
                  ? 'bg-green-500 text-white' 
                  : 'bg-yellow-500 text-white'
              : 'bg-gray-500 text-white'
          }`}>
            {isSpeaking && '🔊 AI Speaking'}
            {isListening && '🎤 Listening'}
            {!isSpeaking && !isListening && isInterviewActive && '⏸️ Ready'}
            {!isInterviewActive && '⏹️ Not Started'}
          </div>
        </div>
      </div>

      {/* Audio Level Indicator */}
      {isListening && (
        <div className="mb-6">
          <div className="flex items-center justify-center space-x-2">
            <span className="text-gray-300 text-sm">Audio Level:</span>
            <div className="flex space-x-1">
              {Array.from({ length: 10 }, (_, i) => (
                <div
                  key={i}
                  className={`w-2 h-6 rounded ${
                    audioLevel > i * 25 ? 'bg-green-500' : 'bg-gray-600'
                  }`}
                />
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Browser Compatibility Warning */}
      {!isInterviewActive && typeof window !== 'undefined' && !('webkitSpeechRecognition' in window) && (
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

      {/* Current Question Display */}
      {isInterviewActive && currentQuestionIndex < questions.length && (
        <div className="bg-dark-300 p-6 rounded-lg mb-6 border border-gray-600">
          <h3 className="text-xl font-semibold text-white mb-4">
            Current Question:
          </h3>
          <p className="text-lg text-gray-300 mb-4">
            {questions[currentQuestionIndex]}
          </p>
          <div className="text-sm text-gray-400">
            Status: {status}
          </div>
        </div>
      )}

      {/* Answer Prompt */}
      {showAnswerPrompt && isWaitingForAnswer && (
        <div className="bg-gradient-to-r from-green-500/20 to-green-600/20 border border-green-500/30 rounded-2xl p-6 mb-6">
          <div className="text-center">
            <div className="flex items-center justify-center space-x-3 mb-4">
              <div className="w-12 h-12 bg-green-500 rounded-full flex items-center justify-center animate-pulse">
                <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11a7 7 0 01-7 7m0 0a7 7 0 01-7-7m7 7v4m0 0H8m4 0h4m-4-8a3 3 0 01-3-3V5a3 3 0 116 0v6a3 3 0 01-3 3z" />
                </svg>
              </div>
              <h3 className="text-xl font-bold text-white">Your Turn to Answer</h3>
            </div>
            <p className="text-gray-300 mb-4">
              Please speak your answer clearly. You can take your time and provide a detailed response. When you're finished, press "Submit Answer" to continue.
            </p>
            
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
                onClick={skipToNextQuestion}
                className="px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors flex items-center space-x-2"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                </svg>
                <span>Skip Question</span>
              </button>
              <button
                onClick={stopListening}
                className="px-6 py-3 bg-gray-600 hover:bg-gray-700 text-white rounded-lg transition-colors flex items-center space-x-2"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 9v6m4-6v6m7-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                <span>Stop Listening</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Control Buttons */}
      <div className="flex flex-wrap gap-4 justify-center mb-6">
        {!isInterviewActive && (
          <button
            onClick={startInterview}
            className="px-8 py-4 bg-primary-500 hover:bg-primary-600 text-white rounded-lg font-semibold transition-colors flex items-center gap-2"
          >
            🎯 Start Interview
          </button>
        )}
        
        {isInterviewActive && (
          <>
            <button
              onClick={pauseInterview}
              disabled={!isSpeaking && !isListening}
              className="px-6 py-3 bg-yellow-600 hover:bg-yellow-700 text-white rounded-lg transition-colors disabled:opacity-50 flex items-center gap-2"
            >
              ⏸️ Pause
            </button>
            
            <button
              onClick={resumeInterview}
              disabled={isSpeaking || isListening}
              className="px-6 py-3 bg-green-600 hover:bg-green-700 text-white rounded-lg transition-colors disabled:opacity-50 flex items-center gap-2"
            >
              ▶️ Resume
            </button>
            
            <button
              onClick={endInterview}
              className="px-6 py-3 bg-red-600 hover:bg-red-700 text-white rounded-lg transition-colors flex items-center gap-2"
            >
              🏁 End Interview
            </button>
          </>
        )}
      </div>

      {/* Interview Completion Message */}
      {!isInterviewActive && transcript.length > 0 && (
        <div className="bg-gradient-to-r from-green-500/20 to-green-600/20 border border-green-500/30 rounded-2xl p-8 mb-6 text-center">
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
            Total answers recorded: {transcript.length}
          </div>
        </div>
      )}

      {/* Conversation History */}
      <div className="bg-dark-300 p-6 rounded-lg border border-gray-600">
        <h3 className="text-xl font-semibold text-white mb-4">
          Conversation History ({conversation.length} messages):
        </h3>
        {conversation.length === 0 ? (
          <p className="text-gray-400">No conversation yet. Start the interview to begin!</p>
        ) : (
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
                </div>
                <p className="text-gray-200">{entry.content}</p>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Hidden audio element for ElevenLabs playback */}
      <audio ref={audioRef} />
    </div>
  );
}
