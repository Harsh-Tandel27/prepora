'use client'

import { Button } from "@/components/ui/button"
import Link from "next/link"

export function CTASection() {
  return (
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
            <Button asChild size="lg" className="bg-background text-foreground hover:bg-background/90">
              <Link href="/sign-up">
                Get Started Free
              </Link>
            </Button>
            <Button asChild size="lg" variant="outline" className="border-2 border-primary-foreground bg-transparent text-primary-foreground hover:bg-primary-foreground hover:text-primary">
              <Link href="/interview">
                Schedule a Demo
              </Link>
            </Button>
          </div>
          <p className="mt-6 text-sm opacity-75">No credit card required • 7-day free trial • Cancel anytime</p>
        </div>
      </div>
    </section>
  )
}
