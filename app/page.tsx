import { Header } from '@/components/header'
import { HeroSection } from '@/components/hero-section'
import { PopularRoutes } from '@/components/popular-routes'
import { BenefitsSection } from '@/components/benefits-section'
import { CTASection } from '@/components/cta-section'
import { Footer } from '@/components/footer'

export default function HomePage() {
  return (
    <main className="min-h-screen">
      <Header />
      <HeroSection />
      <PopularRoutes />
      <BenefitsSection />
      <CTASection />
      <Footer />
    </main>
  )
}
