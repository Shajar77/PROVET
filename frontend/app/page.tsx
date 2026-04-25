import dynamic from "next/dynamic"
import { Navbar } from "@/components/navbar"
import { HeroSection } from "@/components/hero-section"
import { FeatureGrid } from "@/components/feature-grid"

// Lazy load below-fold components
const AboutSection = dynamic(() => import("@/components/about-section").then(mod => ({ default: mod.AboutSection })), {
  loading: () => <div className="h-[600px]" />,
})
const PricingSection = dynamic(() => import("@/components/pricing-section").then(mod => ({ default: mod.PricingSection })), {
  loading: () => <div className="h-[500px]" />,
})
const GlitchMarquee = dynamic(() => import("@/components/glitch-marquee").then(mod => ({ default: mod.GlitchMarquee })), {
  loading: () => <div className="h-[150px]" />,
})
const FaqSection = dynamic(() => import("@/components/faq-section").then(mod => ({ default: mod.FaqSection })), {
  loading: () => <div className="h-[600px]" />,
})
const ProtocolFeatures = dynamic(() => import("@/components/protocol-features").then(mod => ({ default: mod.ProtocolFeatures })), {
  loading: () => <div className="h-[800px]" />,
})

export default function Page() {
  return (
    <div className="min-h-screen dot-grid-bg">
      <Navbar />
      <main>
        <HeroSection />
        <FeatureGrid />
        <AboutSection />
        <ProtocolFeatures />
        <PricingSection />
        <FaqSection />
        <GlitchMarquee />
      </main>
    </div>
  )
}
