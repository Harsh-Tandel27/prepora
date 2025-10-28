'use client'

import { useState, useEffect, useRef } from 'react'
import { Card, CardContent } from "@/components/ui/card"
import { Users, Target, Clock, TrendingUp, Sparkles, Star } from "lucide-react"

const stats = [
  {
    icon: Users,
    value: "10,000+",
    label: "Active Users",
    description: "Join thousands of professionals improving their interview skills",
    color: "text-blue-400",
    bgColor: "from-blue-500/20 to-blue-400/10",
    iconBg: "from-blue-500/30 to-blue-400/20"
  },
  {
    icon: Target,
    value: "95%",
    label: "Success Rate",
    description: "Users report higher interview success rates after practice",
    color: "text-green-400",
    bgColor: "from-green-500/20 to-green-400/10",
    iconBg: "from-green-500/30 to-green-400/20"
  },
  {
    icon: Clock,
    value: "5 min",
    label: "Average Setup",
    description: "Get started with personalized interviews in minutes",
    color: "text-purple-400",
    bgColor: "from-purple-500/20 to-purple-400/10",
    iconBg: "from-purple-500/30 to-purple-400/20"
  },
  {
    icon: TrendingUp,
    value: "40%",
    label: "Confidence Boost",
    description: "Average increase in interview confidence after practice",
    color: "text-orange-400",
    bgColor: "from-orange-500/20 to-orange-400/10",
    iconBg: "from-orange-500/30 to-orange-400/20"
  }
]

export function StatsSection() {
  const [isVisible, setIsVisible] = useState(false)
  const [counters, setCounters] = useState([0, 0, 0, 0])
  const sectionRef = useRef<HTMLElement>(null)

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsVisible(true)
        }
      },
      { threshold: 0.1 }
    )

    if (sectionRef.current) {
      observer.observe(sectionRef.current)
    }

    return () => observer.disconnect()
  }, [])

  useEffect(() => {
    if (isVisible) {
      const targets = [10000, 95, 5, 40]
      const duration = 2000
      const steps = 60
      const stepDuration = duration / steps

      const intervals = targets.map((target, index) => {
        let current = 0
        const increment = target / steps

        return setInterval(() => {
          current += increment
          if (current >= target) {
            current = target
            clearInterval(intervals[index])
          }
          setCounters(prev => {
            const newCounters = [...prev]
            newCounters[index] = Math.floor(current)
            return newCounters
          })
        }, stepDuration)
      })

      return () => intervals.forEach(clearInterval)
    }
  }, [isVisible])

  return (
    <section ref={sectionRef} id="stats" className="py-24 bg-gradient-to-br from-blue-600 via-purple-600 to-pink-600 relative overflow-hidden">
      {/* Enhanced background */}
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-white/10 via-transparent to-transparent" />
      <div className="absolute top-0 left-0 w-full h-full bg-gradient-to-b from-transparent via-white/5 to-transparent" />
      
      {/* Animated elements */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute top-1/4 left-1/4 w-32 h-32 bg-white/10 rounded-full blur-xl animate-pulse" />
        <div className="absolute bottom-1/4 right-1/4 w-40 h-40 bg-white/10 rounded-full blur-xl animate-pulse delay-1000" />
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-60 h-60 bg-white/5 rounded-full blur-2xl animate-pulse delay-500" />
      </div>
      
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        <div className={`text-center mb-16 transition-all duration-1000 ${isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'}`}>
          <div className="inline-flex items-center px-4 py-2 rounded-full bg-white/10 border border-white/20 backdrop-blur-sm mb-6">
            <Sparkles className="h-4 w-4 text-white mr-2" />
            <span className="text-sm font-medium text-white">Success Stories</span>
          </div>
          <h2 className="text-4xl md:text-6xl font-bold text-white mb-6">
            Trusted by Professionals
            <span className="block bg-gradient-to-r from-yellow-300 to-orange-300 bg-clip-text text-transparent">
              Worldwide
            </span>
          </h2>
          <p className="text-xl text-blue-100 max-w-3xl mx-auto leading-relaxed">
            Join the growing community of successful job seekers who've mastered their interviews with Prepora.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          {stats.map((stat, index) => (
            <div
              key={index}
              className={`group transition-all duration-700 hover:scale-105 ${
                isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'
              }`}
              style={{ transitionDelay: `${index * 150}ms` }}
            >
              <Card className={`text-center bg-gradient-to-br ${stat.bgColor} backdrop-blur-sm border-white/20 hover:border-white/40 hover:bg-white/15 transition-all duration-500 group-hover:shadow-2xl group-hover:shadow-white/10`}>
                <CardContent className="p-8">
                  <div className="flex justify-center mb-6">
                    <div className={`p-5 bg-gradient-to-r ${stat.iconBg} rounded-2xl group-hover:scale-110 group-hover:rotate-3 transition-all duration-300 shadow-lg`}>
                      <stat.icon className={`h-10 w-10 ${stat.color}`} />
                    </div>
                  </div>
                  <div className="text-5xl font-bold text-white mb-3 group-hover:scale-110 transition-transform duration-300">
                    {index === 0 ? `${counters[index].toLocaleString()}+` : 
                     index === 1 ? `${counters[index]}%` :
                     index === 2 ? `${counters[index]} min` :
                     `${counters[index]}%`}
                  </div>
                  <div className="text-xl font-bold text-white mb-3 group-hover:text-yellow-300 transition-colors duration-300">
                    {stat.label}
                  </div>
                  <div className="text-sm text-blue-100 leading-relaxed">
                    {stat.description}
                  </div>
                  
                  {/* Animated progress bar */}
                  <div className="mt-4 w-full bg-white/20 rounded-full h-1 overflow-hidden">
                    <div 
                      className={`h-full bg-gradient-to-r ${stat.iconBg} rounded-full transition-all duration-2000 ease-out`}
                      style={{ 
                        width: isVisible ? '100%' : '0%',
                        transitionDelay: `${index * 200}ms`
                      }}
                    />
                  </div>
                </CardContent>
              </Card>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
