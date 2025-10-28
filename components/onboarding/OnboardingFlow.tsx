'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { ArrowRight, CheckCircle, Mic, Brain, Target, Users } from 'lucide-react'
import Link from 'next/link'

const steps = [
  {
    id: 1,
    title: "Welcome to Prepora",
    description: "Your AI-powered interview preparation platform",
    icon: Mic,
    content: "Get ready to master your interviews with our advanced AI technology"
  },
  {
    id: 2,
    title: "Choose Your Role",
    description: "Select your target position and experience level",
    icon: Target,
    content: "We'll customize questions based on your specific role and career level"
  },
  {
    id: 3,
    title: "Practice with AI",
    description: "Conduct realistic voice interviews",
    icon: Brain,
    content: "Practice with our AI interviewer using natural voice conversations"
  },
  {
    id: 4,
    title: "Get Feedback",
    description: "Receive detailed analysis and improvement suggestions",
    icon: Users,
    content: "Get instant feedback on your performance and areas for improvement"
  }
]

interface OnboardingFlowProps {
  onComplete: () => void
}

export function OnboardingFlow({ onComplete }: OnboardingFlowProps) {
  const [currentStep, setCurrentStep] = useState(1)

  const nextStep = () => {
    if (currentStep < steps.length) {
      setCurrentStep(currentStep + 1)
    } else {
      onComplete()
    }
  }

  const prevStep = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1)
    }
  }

  const currentStepData = steps[currentStep - 1]

  return (
    <div className="min-h-screen bg-slate-900 flex items-center justify-center p-4">
      <div className="max-w-4xl w-full">
        {/* Progress Bar */}
        <div className="mb-8">
          <div className="flex items-center justify-between mb-4">
            {steps.map((step, index) => (
              <div key={step.id} className="flex items-center">
                <div className={`w-8 h-8 rounded-full flex items-center justify-center ${
                  currentStep >= step.id 
                    ? 'bg-blue-600 text-white' 
                    : 'bg-gray-700 text-gray-400'
                }`}>
                  {currentStep > step.id ? (
                    <CheckCircle className="h-4 w-4" />
                  ) : (
                    <span className="text-sm font-semibold">{step.id}</span>
                  )}
                </div>
                {index < steps.length - 1 && (
                  <div className={`w-16 h-1 mx-2 ${
                    currentStep > step.id ? 'bg-blue-600' : 'bg-gray-700'
                  }`} />
                )}
              </div>
            ))}
          </div>
          <div className="text-center text-gray-400">
            Step {currentStep} of {steps.length}
          </div>
        </div>

        {/* Main Content */}
        <Card className="bg-slate-800 border-gray-700">
          <CardHeader className="text-center">
            <div className="mx-auto w-16 h-16 bg-gradient-to-r from-blue-600 to-purple-600 rounded-full flex items-center justify-center mb-4">
              <currentStepData.icon className="h-8 w-8 text-white" />
            </div>
            <CardTitle className="text-3xl font-bold text-white">
              {currentStepData.title}
            </CardTitle>
            <CardDescription className="text-xl text-gray-300">
              {currentStepData.description}
            </CardDescription>
          </CardHeader>
          
          <CardContent className="text-center">
            <p className="text-gray-400 mb-8 text-lg">
              {currentStepData.content}
            </p>

            {/* Step-specific content */}
            {currentStep === 1 && (
              <div className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="p-4 bg-slate-700 rounded-lg">
                    <Mic className="h-6 w-6 text-blue-400 mx-auto mb-2" />
                    <h3 className="font-semibold text-white">Voice Interviews</h3>
                    <p className="text-sm text-gray-400">Natural conversation practice</p>
                  </div>
                  <div className="p-4 bg-slate-700 rounded-lg">
                    <Brain className="h-6 w-6 text-purple-400 mx-auto mb-2" />
                    <h3 className="font-semibold text-white">AI Analysis</h3>
                    <p className="text-sm text-gray-400">Real-time feedback</p>
                  </div>
                  <div className="p-4 bg-slate-700 rounded-lg">
                    <Target className="h-6 w-6 text-green-400 mx-auto mb-2" />
                    <h3 className="font-semibold text-white">Personalized</h3>
                    <p className="text-sm text-gray-400">Role-specific questions</p>
                  </div>
                </div>
              </div>
            )}

            {currentStep === 2 && (
              <div className="space-y-4">
                <div className="text-left max-w-2xl mx-auto">
                  <h4 className="font-semibold text-white mb-4">What you'll need to set up:</h4>
                  <ul className="space-y-2 text-gray-300">
                    <li className="flex items-center">
                      <CheckCircle className="h-4 w-4 text-green-400 mr-2" />
                      Your target job role (e.g., Software Engineer, Data Scientist)
                    </li>
                    <li className="flex items-center">
                      <CheckCircle className="h-4 w-4 text-green-400 mr-2" />
                      Experience level (Junior, Mid-level, Senior)
                    </li>
                    <li className="flex items-center">
                      <CheckCircle className="h-4 w-4 text-green-400 mr-2" />
                      Technology stack you work with
                    </li>
                    <li className="flex items-center">
                      <CheckCircle className="h-4 w-4 text-green-400 mr-2" />
                      Interview type preference
                    </li>
                  </ul>
                </div>
              </div>
            )}

            {currentStep === 3 && (
              <div className="space-y-4">
                <div className="text-left max-w-2xl mx-auto">
                  <h4 className="font-semibold text-white mb-4">How the interview works:</h4>
                  <div className="space-y-3">
                    <div className="flex items-start">
                      <div className="w-6 h-6 bg-blue-600 rounded-full flex items-center justify-center mr-3 mt-1">
                        <span className="text-xs font-bold text-white">1</span>
                      </div>
                      <p className="text-gray-300">AI interviewer asks questions using natural voice</p>
                    </div>
                    <div className="flex items-start">
                      <div className="w-6 h-6 bg-blue-600 rounded-full flex items-center justify-center mr-3 mt-1">
                        <span className="text-xs font-bold text-white">2</span>
                      </div>
                      <p className="text-gray-300">You respond using your microphone</p>
                    </div>
                    <div className="flex items-start">
                      <div className="w-6 h-6 bg-blue-600 rounded-full flex items-center justify-center mr-3 mt-1">
                        <span className="text-xs font-bold text-white">3</span>
                      </div>
                      <p className="text-gray-300">AI analyzes your speech in real-time</p>
                    </div>
                    <div className="flex items-start">
                      <div className="w-6 h-6 bg-blue-600 rounded-full flex items-center justify-center mr-3 mt-1">
                        <span className="text-xs font-bold text-white">4</span>
                      </div>
                      <p className="text-gray-300">Move to next question or complete interview</p>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {currentStep === 4 && (
              <div className="space-y-4">
                <div className="text-left max-w-2xl mx-auto">
                  <h4 className="font-semibold text-white mb-4">You'll receive feedback on:</h4>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <div className="flex items-center">
                        <CheckCircle className="h-4 w-4 text-green-400 mr-2" />
                        <span className="text-gray-300">Communication Skills</span>
                      </div>
                      <div className="flex items-center">
                        <CheckCircle className="h-4 w-4 text-green-400 mr-2" />
                        <span className="text-gray-300">Technical Knowledge</span>
                      </div>
                      <div className="flex items-center">
                        <CheckCircle className="h-4 w-4 text-green-400 mr-2" />
                        <span className="text-gray-300">Confidence Level</span>
                      </div>
                    </div>
                    <div className="space-y-2">
                      <div className="flex items-center">
                        <CheckCircle className="h-4 w-4 text-green-400 mr-2" />
                        <span className="text-gray-300">Speech Quality</span>
                      </div>
                      <div className="flex items-center">
                        <CheckCircle className="h-4 w-4 text-green-400 mr-2" />
                        <span className="text-gray-300">Problem Solving</span>
                      </div>
                      <div className="flex items-center">
                        <CheckCircle className="h-4 w-4 text-green-400 mr-2" />
                        <span className="text-gray-300">Areas for Improvement</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Navigation Buttons */}
            <div className="flex justify-between mt-8">
              <Button
                onClick={prevStep}
                variant="outline"
                className="border-gray-600 text-gray-300 hover:bg-gray-800"
                disabled={currentStep === 1}
              >
                Previous
              </Button>
              
              <Button
                onClick={nextStep}
                className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700"
              >
                {currentStep === steps.length ? 'Get Started' : 'Next'}
                <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
