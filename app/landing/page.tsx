"use client"

import { useEffect, useMemo, useRef, useState } from "react"
import { getCurrentUser } from "@/lib/actions/auth.action"
import { Navbar } from "@/components/navigation/Navbar"
import { HeroSection } from "@/components/landing/HeroSection"
import { FeaturesSection } from "@/components/landing/FeaturesSection"
import { CTASection } from "@/components/landing/CTASection"
import { Footer } from "@/components/navigation/Footer"
import {
  Star,
  PlayCircle,
  Mic,
  Sparkles,
  Brain,
  Activity,
  ListChecks,
  BarChart3,
  MessageSquare,
  Wand2,
  ChevronLeft,
  ChevronRight,
} from "lucide-react"
import Link from "next/link"

export default function LandingPage() {
  const [activeTestimonial, setActiveTestimonial] = useState(0)
  const [yearly, setYearly] = useState(true)
  const [countersStarted, setCountersStarted] = useState(false)
  const statsRef = useRef<HTMLDivElement | null>(null)

  useEffect(() => {
    const id = setInterval(() => {
      setActiveTestimonial((t) => (t + 1) % testimonials.length)
    }, 5000)
    return () => clearInterval(id)
  }, [])

  useEffect(() => {
    const obs = new IntersectionObserver(
      (entries) => {
        entries.forEach((e) => {
          if (e.isIntersecting) setCountersStarted(true)
        })
      },
      { threshold: 0.3 }
    )
    if (statsRef.current) obs.observe(statsRef.current)
    return () => obs.disconnect()
  }, [])

  const userPromise = useMemo(() => getCurrentUser(), [])

  return (
    <div className="min-h-screen bg-[#0f172a] text-white relative overflow-hidden">
      {/* Top Navigation */}
      <Navbar user={undefined} />

      {/* Global background gradients for consistent animation/theme */}
      <div className="pointer-events-none fixed inset-0 -z-10 animate-[bgShift_12s_ease-in-out_infinite]">
        <div className="absolute inset-0 bg-[radial-gradient(600px_300px_at_10%_10%,#3b82f6_18%,transparent_60%),radial-gradient(500px_300px_at_90%_20%,#8b5cf6_14%,transparent_50%)] opacity-25" />
        <div className="absolute inset-0 bg-[radial-gradient(900px_600px_at_50%_120%,#3b82f6_0%,transparent_65%)] opacity-20" />
      </div>

      {/* Legacy Hero preserved for original style */}
      <HeroSection />

      {/* Legacy feature section preserved */}
      <FeaturesSection />

      {/* Interactive demo section removed by request; background kept globally above */}

      {/* HOW IT WORKS */}
      <section id="how" className="container mx-auto px-4 py-20">
        <h2 className="text-3xl md:text-4xl font-bold text-center">How It Works</h2>
        <p className="mt-3 text-center text-slate-300">A simple, effective flow to level up fast</p>
        <div className="relative mt-10 grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
          {steps.map((s, i) => (
            <div key={s.title} className="relative group rounded-2xl border border-white/10 bg-white/5 p-6 hover:shadow-[0_0_30px_-10px_rgba(59,130,246,0.5)] transition">
              <div className="flex items-center justify-between">
                <div className="h-12 w-12 rounded-xl bg-gradient-to-br from-purple-500 to-indigo-500 flex items-center justify-center">
                  <s.icon className="w-6 h-6" />
                </div>
                <span className="text-sm text-slate-400">0{i + 1}</span>
              </div>
              <h3 className="mt-4 text-lg font-semibold">{s.title}</h3>
              <p className="mt-2 text-sm text-slate-300">{s.desc}</p>
            </div>
          ))}
          {/* dotted connector */}
          <div className="pointer-events-none absolute left-0 right-0 top-16 hidden lg:block">
            <div className="mx-8 h-0 border-t-2 border-dotted border-slate-600" />
          </div>
        </div>
      </section>

      {/* FEATURES GRID */}
      <section id="features" className="container mx-auto px-4 py-20">
        <h2 className="text-3xl md:text-4xl font-bold text-center">Everything you need</h2>
        <p className="mt-3 text-center text-slate-300">Powerful features to prepare with confidence</p>
        <div className="mt-10 grid gap-6 md:grid-cols-3">
          {features.map((f) => (
            <div key={f.title} className="rounded-2xl border border-white/10 bg-white/5 p-6 transition hover:-translate-y-1 hover:shadow-[0_0_35px_-10px_rgba(139,92,246,0.6)]">
              <div className="h-12 w-12 rounded-xl bg-gradient-to-br from-indigo-500 to-purple-500 flex items-center justify-center mb-3">
                <f.icon className="w-6 h-6" />
              </div>
              <div className="font-semibold">{f.title}</div>
              <p className="mt-2 text-sm text-slate-300">{f.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* TESTIMONIALS */}
      <section id="testimonials" className="container mx-auto px-4 py-20">
        <h2 className="text-3xl md:text-4xl font-bold text-center">What users say</h2>
        <div className="relative mt-10 rounded-2xl border border-white/10 bg-white/5 p-6">
          <div className="flex items-center justify-between">
            <button aria-label="Previous" className="p-2 rounded-lg border border-white/10 hover:bg-white/10" onClick={() => setActiveTestimonial((t) => (t - 1 + testimonials.length) % testimonials.length)}>
              <ChevronLeft className="w-5 h-5" />
            </button>
            <div className="max-w-3xl text-center">
              <div className="flex justify-center gap-1 text-yellow-300">
                {Array.from({ length: 5 }).map((_, i) => <Star key={i} className="w-4 h-4 fill-current" />)}
              </div>
              <p className="mt-4 text-lg text-slate-100">{testimonials[activeTestimonial].quote}</p>
              <div className="mt-3 text-sm text-slate-300">{testimonials[activeTestimonial].name} • {testimonials[activeTestimonial].role} @ {testimonials[activeTestimonial].company}</div>
            </div>
            <button aria-label="Next" className="p-2 rounded-lg border border-white/10 hover:bg-white/10" onClick={() => setActiveTestimonial((t) => (t + 1) % testimonials.length)}>
              <ChevronRight className="w-5 h-5" />
            </button>
          </div>
          <div className="mt-4 flex justify-center gap-2">
            {testimonials.map((_, i) => (
              <button key={i} aria-label={`Go to testimonial ${i + 1}`} className={`h-2 w-2 rounded-full ${i === activeTestimonial ? "bg-white" : "bg-white/30"}`} onClick={() => setActiveTestimonial(i)} />
            ))}
          </div>
        </div>
      </section>

      {/* STATS */}
      <section id="stats" ref={statsRef} className="relative overflow-hidden py-20">
        <div className="absolute inset-0 -z-10 bg-gradient-to-b from-transparent via-indigo-900/20 to-transparent" />
        <div className="container mx-auto px-4 grid gap-6 md:grid-cols-4">
          {stats.map((s) => (
            <div key={s.label} className="rounded-2xl border border-white/10 bg-white/5 p-6 text-center">
              <div className="text-4xl font-extrabold tracking-tight">
                {countersStarted ? <AnimatedNumber value={s.value} suffix={s.suffix} /> : `0${s.suffix || ''}`}
              </div>
              <div className="mt-2 text-slate-300">{s.label}</div>
            </div>
          ))}
        </div>
      </section>

      {/* PRICING */}
      <section id="pricing" className="container mx-auto px-4 py-20">
        <div className="flex items-center justify-between">
          <h2 className="text-3xl md:text-4xl font-bold">Pricing</h2>
          <div className="flex items-center gap-2 text-sm">
            <span className={!yearly ? "text-white" : "text-slate-400"}>Monthly</span>
            <button aria-label="Toggle pricing" onClick={() => setYearly(!yearly)} className="relative h-6 w-12 rounded-full bg-white/10">
              <span className={`absolute top-1 h-4 w-4 rounded-full bg-white transition ${yearly ? "right-1" : "left-1"}`} />
            </button>
            <span className={yearly ? "text-white" : "text-slate-400"}>Yearly</span>
          </div>
        </div>
        <div className="mt-10 grid gap-6 md:grid-cols-3">
          {pricing.map((p, idx) => (
            <div key={p.tier} className={`rounded-2xl border ${p.popular ? "border-purple-400/50 shadow-[0_0_35px_-12px_rgba(139,92,246,0.8)]" : "border-white/10"} bg-white/5 p-6`}>
              {p.popular && <div className="mb-3 inline-block rounded-full bg-gradient-to-r from-purple-500 to-indigo-500 px-3 py-1 text-xs font-semibold">Most Popular</div>}
              <div className="text-xl font-semibold">{p.tier}</div>
              <div className="mt-2 text-3xl font-extrabold">{yearly ? p.priceY : p.priceM}</div>
              <ul className="mt-4 space-y-2 text-sm text-slate-300">
                {p.features.map((f) => (
                  <li key={f} className="flex items-center gap-2"><span className="h-1.5 w-1.5 rounded-full bg-purple-400" />{f}</li>
                ))}
              </ul>
              <Link href="/sign-up" className="mt-6 inline-flex w-full items-center justify-center rounded-xl border border-white/20 px-4 py-3 hover:bg-white/10">Get Started</Link>
            </div>
          ))}
        </div>
      </section>

      {/* FAQ */}
      <section id="faq" className="container mx-auto px-4 py-20">
        <h2 className="text-3xl md:text-4xl font-bold text-center">Frequently asked questions</h2>
        <div className="mx-auto mt-8 max-w-3xl divide-y divide-white/10 rounded-2xl border border-white/10 bg-white/5">
          {faqs.map((f, i) => (
            <details key={i} className="group p-6">
              <summary className="flex cursor-pointer list-none items-center justify-between text-left text-lg font-medium">
                {f.q}
                <span className="ml-4 transition group-open:rotate-180">⌄</span>
              </summary>
              <p className="mt-2 text-slate-300">{f.a}</p>
            </details>
          ))}
        </div>
      </section>

      {/* Legacy CTA preserved */}
      <CTASection />

      <Footer />
    </div>
  )
}

/* Helpers & Data */
function AnimatedNumber({ value, suffix }: { value: number; suffix?: string }) {
  const [display, setDisplay] = useState(0)
  useEffect(() => {
    let start = 0
    const end = value
    const duration = 1200
    const startTime = performance.now()
    const step = (t: number) => {
      const p = Math.min((t - startTime) / duration, 1)
      setDisplay(Math.floor(start + (end - start) * p))
      if (p < 1) requestAnimationFrame(step)
    }
    const raf = requestAnimationFrame(step)
    return () => cancelAnimationFrame(raf)
  }, [value])
  return <span>{display}{suffix}</span>
}

function TypingQuestion() {
  const q = "Tell me about a challenging problem you solved recently and how you approached it."
  const [text, setText] = useState("")
  useEffect(() => {
    let i = 0
    const id = setInterval(() => {
      setText(q.slice(0, ++i))
      if (i >= q.length) clearInterval(id)
    }, 20)
    return () => clearInterval(id)
  }, [])
  return <p className="text-slate-100">{text}<span className="animate-pulse">▍</span></p>
}

const feedbackCards = [
  { icon: Brain, title: "AI Feedback", desc: "Get instant, targeted feedback on clarity, structure, and depth." },
  { icon: Activity, title: "Speech Analysis", desc: "Real-time signal for pace, filler words, and confidence." },
  { icon: Wand2, title: "Personalized Tips", desc: "Actionable next steps to improve each answer." },
]

const steps = [
  { icon: MessageSquare, title: "Practice", desc: "Answer curated questions tailored to your role and level." },
  { icon: Sparkles, title: "Analyze", desc: "PREPORA breaks down delivery, content, and structure." },
  { icon: BarChart3, title: "Track", desc: "See your strengths and gaps across key dimensions." },
  { icon: ListChecks, title: "Improve", desc: "Follow guided drills and tips to level up quickly." },
]

const features = [
  { icon: Brain, title: "AI Feedback", desc: "Detailed guidance on each answer to boost quality fast." },
  { icon: Activity, title: "Real-time Analysis", desc: "Live signals for pace, filler words, and energy." },
  { icon: MessageSquare, title: "Industry Questions", desc: "Thousands of role-specific, up-to-date questions." },
  { icon: BarChart3, title: "Progress Tracking", desc: "Metrics and trends that show real improvement." },
  { icon: Mic, title: "Mock Interviews", desc: "Voice-first sessions that feel like the real thing." },
  { icon: Wand2, title: "Personalized Tips", desc: "Tailored drills to strengthen weak areas." },
]

const testimonials = [
  { name: "Aarav S.", role: "SWE", company: "Acme", quote: "PREPORA helped me structure answers and reduce filler words. I landed two offers." },
  { name: "Diya K.", role: "Data Scientist", company: "Globex", quote: "The AI feedback is spot on. My confidence went way up in a week." },
  { name: "Rohan M.", role: "PM", company: "Innotech", quote: "Mock interviews + analytics = chef’s kiss. Highly recommend." },
]

const stats = [
  { label: "Interviews Completed", value: 120000, suffix: "+" },
  { label: "Success Rate", value: 82, suffix: "%" },
  { label: "Avg. Score Improvement", value: 37, suffix: "%" },
  { label: "Active Users", value: 10000, suffix: "+" },
]

const pricing = [
  { tier: "Free", priceM: "$0", priceY: "$0", features: ["5 mock interviews", "Basic analytics", "Community access"], popular: false },
  { tier: "Pro", priceM: "$19", priceY: "$180", features: ["Unlimited interviews", "Advanced analytics", "AI feedback & tips", "Priority support"], popular: true },
  { tier: "Enterprise", priceM: "Contact", priceY: "Contact", features: ["Team dashboard", "Custom questions", "SSO & security", "Dedicated CSM"], popular: false },
]

const faqs = [
  { q: "How accurate is the AI feedback?", a: "Our models are trained on thousands of interviews and refined with human-in-the-loop reviews." },
  { q: "Can I use it for behavioral + system design?", a: "Yes. PREPORA supports behavioral, technical, and system design tracks." },
  { q: "Is there a free trial?", a: "Yes. Start for free with limited sessions and upgrade anytime." },
  { q: "Do I need special hardware?", a: "No. A standard mic/headset in your browser works great." },
  { q: "Can teams use PREPORA?", a: "Yes. Our Enterprise plan includes SSO, admin controls, and team analytics." },
  { q: "Do you support mobile?", a: "Absolutely. The experience is responsive across devices." },
]

/* Keyframes */
// eslint-disable-next-line @next/next/no-sync-scripts
; (globalThis as any).document && (() => {
  const id = "fadeSlideIn-keyframes"
  if (!document.getElementById(id)) {
    const style = document.createElement("style")
    style.id = id
    style.innerHTML = `@keyframes fadeSlideIn{from{opacity:0;transform:translateY(8px)}to{opacity:1;transform:translateY(0)}}@keyframes bgShift{0%{transform:translate3d(0,0,0)}50%{transform:translate3d(0,-20px,0)}100%{transform:translate3d(0,0,0)}}`
    document.head.appendChild(style)
  }
})()
