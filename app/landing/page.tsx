import { Footer } from "@/components/navigation/Footer"
import { HeroSection } from "@/components/landing/HeroSection"
import { FeaturesSection } from "@/components/landing/FeaturesSection"
import { CTASection } from "@/components/landing/CTASection"
import { BottomNavBar } from "@/components/ui/top-nav-bar"
import { getCurrentUser } from "@/lib/actions/auth.action"

export default async function LandingPage() {
  const user = await getCurrentUser()

  return (
    <div className="min-h-screen bg-background">
      {/* Fixed Top Navigation */}
      <BottomNavBar stickyTop />
      
      {/* Main content with top padding for fixed nav */}
      <div className="pt-20">
        <HeroSection />
        <FeaturesSection />
        <CTASection />
        <Footer />
      </div>
    </div>
  )
}
