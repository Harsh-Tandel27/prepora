'use client'

import { Card, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Mic, Brain, Target, Clock, TrendingUp, Users } from "lucide-react"

const features = [
  {
    icon: Mic,
    title: "Voice-Based Practice",
    description: "Practice speaking naturally with our advanced voice recognition technology. Get real-time transcription and analysis."
  },
  {
    icon: Brain,
    title: "AI-Powered Feedback",
    description: "Receive detailed analysis of your answers, body language, and communication style with actionable improvement suggestions."
  },
  {
    icon: Target,
    title: "Industry-Specific Questions",
    description: "Access thousands of real interview questions tailored to your industry, role, and experience level."
  },
  {
    icon: Clock,
    title: "Flexible Practice Sessions",
    description: "Practice anytime, anywhere with sessions ranging from quick 10-minute drills to full-length mock interviews."
  },
  {
    icon: TrendingUp,
    title: "Progress Tracking",
    description: "Monitor your improvement over time with detailed analytics, performance metrics, and skill assessments."
  },
  {
    icon: Users,
    title: "Expert Community",
    description: "Join a community of professionals and get tips, share experiences, and learn from others' success stories."
  }
]

export function FeaturesSection() {
  return (
    <section id="features" className="py-20 md:py-32">
      <div className="container mx-auto px-4">
        <div className="mb-16 text-center">
          <h2 className="mb-4 text-3xl font-bold tracking-tight text-foreground md:text-4xl">
            Everything You Need to Ace Your Interview
          </h2>
          <p className="mx-auto max-w-2xl text-lg text-muted-foreground">
            Our AI-powered platform provides comprehensive interview preparation with real-time feedback and personalized coaching.
          </p>
        </div>
        <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-3">
          {features.map((feature, index) => (
            <Card key={index} className="group border-border bg-[var(--gradient-card)] shadow-[var(--shadow-card)] transition-all duration-300 hover:shadow-[var(--shadow-elegant)] hover:scale-[1.02]">
              <CardHeader>
                <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-lg bg-primary/10">
                  <feature.icon className="h-6 w-6 text-primary" />
                </div>
                <CardTitle>{feature.title}</CardTitle>
                <CardDescription>
                  {feature.description}
                </CardDescription>
              </CardHeader>
            </Card>
          ))}
        </div>
      </div>
    </section>
  )
}
