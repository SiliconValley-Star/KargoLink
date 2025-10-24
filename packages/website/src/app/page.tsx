import { PremiumHeroSection } from '@/components/sections/premium-hero-section'
import { StatsSection } from '@/components/sections/stats-section'
import { FeaturesSection } from '@/components/sections/features-section'
import { HowItWorksSection } from '@/components/sections/how-it-works-section'
import { PricingSection } from '@/components/sections/pricing-section'
import { TestimonialsSection } from '@/components/sections/testimonials-section'
import { CTASection } from '@/components/sections/cta-section'

export default function HomePage() {
  return (
    <main className="min-h-screen">
      {/* Premium Landing Page */}
      <PremiumHeroSection />
      <StatsSection />
      <FeaturesSection />
      <HowItWorksSection />
      <PricingSection />
      <TestimonialsSection />
      <CTASection />
    </main>
  )
}