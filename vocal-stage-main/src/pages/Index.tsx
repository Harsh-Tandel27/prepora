import { Button } from "@/components/ui/button";
import { Card, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Mic, Brain, Target, TrendingUp, Users, Clock } from "lucide-react";
import { HeroSection } from "@/components/ui/hero-section-dark";
import dashboardLight from "@/assets/dashboard-light.png";
import dashboardDark from "@/assets/dashboard-dark.png";

const Index = () => {
  return (
    <div className="min-h-screen bg-background">
      {/* Navbar */}
      <nav className="sticky top-0 z-50 border-b border-border bg-background/80 backdrop-blur-lg">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-gradient-to-br from-primary to-accent">
                <Mic className="h-6 w-6 text-primary-foreground" />
              </div>
              <span className="text-xl font-bold text-foreground">InterviewAI</span>
            </div>
            <div className="hidden items-center gap-8 md:flex">
              <a href="#features" className="text-sm font-medium text-muted-foreground transition-colors hover:text-foreground">
                Features
              </a>
              <a href="#how-it-works" className="text-sm font-medium text-muted-foreground transition-colors hover:text-foreground">
                How it Works
              </a>
              <a href="#pricing" className="text-sm font-medium text-muted-foreground transition-colors hover:text-foreground">
                Pricing
              </a>
            </div>
            <div className="flex items-center gap-4">
              <Button variant="ghost" size="sm">
                Sign In
              </Button>
              <Button size="sm">Get Started</Button>
            </div>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <HeroSection
        title="🚀 AI-Powered Interview Practice"
        subtitle={{
          regular: "Master Your Next Interview with ",
          gradient: "Voice AI",
        }}
        description="Practice real interview scenarios with our advanced AI interviewer. Get instant feedback, improve your confidence, and land your dream job."
        ctaText="Start Free Trial"
        ctaHref="#"
        bottomImage={{
          light: dashboardLight,
          dark: dashboardDark,
        }}
        gridOptions={{
          angle: 65,
          opacity: 0.4,
          cellSize: 50,
          lightLineColor: "#a855f7",
          darkLineColor: "#7c3aed",
        }}
      />

      {/* Features Section */}
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
            <Card className="group border-border bg-[var(--gradient-card)] shadow-[var(--shadow-card)] transition-all duration-300 hover:shadow-[var(--shadow-elegant)] hover:scale-[1.02]">
              <CardHeader>
                <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-lg bg-primary/10">
                  <Mic className="h-6 w-6 text-primary" />
                </div>
                <CardTitle>Voice-Based Practice</CardTitle>
                <CardDescription>
                  Practice speaking naturally with our advanced voice recognition technology. Get real-time transcription and analysis.
                </CardDescription>
              </CardHeader>
            </Card>

            <Card className="group border-border bg-[var(--gradient-card)] shadow-[var(--shadow-card)] transition-all duration-300 hover:shadow-[var(--shadow-elegant)] hover:scale-[1.02]">
              <CardHeader>
                <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-lg bg-primary/10">
                  <Brain className="h-6 w-6 text-primary" />
                </div>
                <CardTitle>AI-Powered Feedback</CardTitle>
                <CardDescription>
                  Receive detailed analysis of your answers, body language, and communication style with actionable improvement suggestions.
                </CardDescription>
              </CardHeader>
            </Card>

            <Card className="group border-border bg-[var(--gradient-card)] shadow-[var(--shadow-card)] transition-all duration-300 hover:shadow-[var(--shadow-elegant)] hover:scale-[1.02]">
              <CardHeader>
                <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-lg bg-primary/10">
                  <Target className="h-6 w-6 text-primary" />
                </div>
                <CardTitle>Industry-Specific Questions</CardTitle>
                <CardDescription>
                  Access thousands of real interview questions tailored to your industry, role, and experience level.
                </CardDescription>
              </CardHeader>
            </Card>

            <Card className="group border-border bg-[var(--gradient-card)] shadow-[var(--shadow-card)] transition-all duration-300 hover:shadow-[var(--shadow-elegant)] hover:scale-[1.02]">
              <CardHeader>
                <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-lg bg-primary/10">
                  <Clock className="h-6 w-6 text-primary" />
                </div>
                <CardTitle>Flexible Practice Sessions</CardTitle>
                <CardDescription>
                  Practice anytime, anywhere with sessions ranging from quick 10-minute drills to full-length mock interviews.
                </CardDescription>
              </CardHeader>
            </Card>

            <Card className="group border-border bg-[var(--gradient-card)] shadow-[var(--shadow-card)] transition-all duration-300 hover:shadow-[var(--shadow-elegant)] hover:scale-[1.02]">
              <CardHeader>
                <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-lg bg-primary/10">
                  <TrendingUp className="h-6 w-6 text-primary" />
                </div>
                <CardTitle>Progress Tracking</CardTitle>
                <CardDescription>
                  Monitor your improvement over time with detailed analytics, performance metrics, and skill assessments.
                </CardDescription>
              </CardHeader>
            </Card>

            <Card className="group border-border bg-[var(--gradient-card)] shadow-[var(--shadow-card)] transition-all duration-300 hover:shadow-[var(--shadow-elegant)] hover:scale-[1.02]">
              <CardHeader>
                <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-lg bg-primary/10">
                  <Users className="h-6 w-6 text-primary" />
                </div>
                <CardTitle>Expert Community</CardTitle>
                <CardDescription>
                  Join a community of professionals and get tips, share experiences, and learn from others' success stories.
                </CardDescription>
              </CardHeader>
            </Card>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="relative overflow-hidden bg-[var(--gradient-primary)] py-20 text-primary-foreground">
        <div className="container mx-auto px-4">
          <div className="mx-auto max-w-3xl text-center">
            <h2 className="mb-6 text-3xl font-bold tracking-tight md:text-4xl lg:text-5xl">
              Ready to Transform Your Interview Skills?
            </h2>
            <p className="mb-8 text-lg opacity-90 md:text-xl">
              Join thousands of successful candidates who used our platform to land their dream jobs. Start your free trial today.
            </p>
            <div className="flex flex-col gap-4 sm:flex-row sm:justify-center">
              <Button size="lg" className="bg-background text-foreground hover:bg-background/90">
                Get Started Free
              </Button>
              <Button size="lg" variant="outline" className="border-2 border-primary-foreground bg-transparent text-primary-foreground hover:bg-primary-foreground hover:text-primary">
                Schedule a Demo
              </Button>
            </div>
            <p className="mt-6 text-sm opacity-75">No credit card required • 7-day free trial • Cancel anytime</p>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-border bg-secondary/30 py-12">
        <div className="container mx-auto px-4">
          <div className="grid gap-8 md:grid-cols-4">
            <div className="space-y-4">
              <div className="flex items-center gap-2">
                <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-gradient-to-br from-primary to-accent">
                  <Mic className="h-6 w-6 text-primary-foreground" />
                </div>
                <span className="text-xl font-bold text-foreground">InterviewAI</span>
              </div>
              <p className="text-sm text-muted-foreground">
                Empowering professionals to ace their interviews with AI-powered practice and feedback.
              </p>
            </div>
            <div>
              <h3 className="mb-4 font-semibold text-foreground">Product</h3>
              <ul className="space-y-2 text-sm text-muted-foreground">
                <li>
                  <a href="#" className="transition-colors hover:text-foreground">
                    Features
                  </a>
                </li>
                <li>
                  <a href="#" className="transition-colors hover:text-foreground">
                    Pricing
                  </a>
                </li>
                <li>
                  <a href="#" className="transition-colors hover:text-foreground">
                    How it Works
                  </a>
                </li>
                <li>
                  <a href="#" className="transition-colors hover:text-foreground">
                    Demo
                  </a>
                </li>
              </ul>
            </div>
            <div>
              <h3 className="mb-4 font-semibold text-foreground">Company</h3>
              <ul className="space-y-2 text-sm text-muted-foreground">
                <li>
                  <a href="#" className="transition-colors hover:text-foreground">
                    About Us
                  </a>
                </li>
                <li>
                  <a href="#" className="transition-colors hover:text-foreground">
                    Careers
                  </a>
                </li>
                <li>
                  <a href="#" className="transition-colors hover:text-foreground">
                    Blog
                  </a>
                </li>
                <li>
                  <a href="#" className="transition-colors hover:text-foreground">
                    Contact
                  </a>
                </li>
              </ul>
            </div>
            <div>
              <h3 className="mb-4 font-semibold text-foreground">Legal</h3>
              <ul className="space-y-2 text-sm text-muted-foreground">
                <li>
                  <a href="#" className="transition-colors hover:text-foreground">
                    Privacy Policy
                  </a>
                </li>
                <li>
                  <a href="#" className="transition-colors hover:text-foreground">
                    Terms of Service
                  </a>
                </li>
                <li>
                  <a href="#" className="transition-colors hover:text-foreground">
                    Cookie Policy
                  </a>
                </li>
              </ul>
            </div>
          </div>
          <div className="mt-12 border-t border-border pt-8 text-center text-sm text-muted-foreground">
            <p>© 2024 InterviewAI. All rights reserved.</p>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default Index;
