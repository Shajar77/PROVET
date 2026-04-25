"use client"

import { useState } from "react"
import { LazyMotion, domAnimation, m, AnimatePresence } from "framer-motion"
import { ArrowRight, ChevronRight } from "lucide-react"
import Link from "next/link"
import { BlinkDot } from "@/components/blink-dot"

const ease = [0.22, 1, 0.36, 1] as const



const FEATURES = [
  {
    num: "001",
    title: "On-Chain Registry",
    subtitle: "PERMANENT MODEL FINGERPRINTS",
    description: "Register AI model hashes on Base Sepolia. Every version tracked, immutable, publicly verifiable.",
    specs: ["Gas: ~0.001 ETH", "Time: ~2s", "Finality: Instant"],
  },
  {
    num: "002",
    title: "EIP-712 Attestations",
    subtitle: "CRYPTOGRAPHIC PREDICTION SIGNING",
    description: "Sign predictions with human-readable structured data. Users see exactly what they're signing before verification.",
    specs: ["Standard: EIP-712", "Typed Data", "On-chain Verify"],
  },
  {
    num: "003",
    title: "Zero-Knowledge Proofs",
    subtitle: "PRIVACY-PRESERVING VERIFICATION",
    description: "Verify model identity without exposing weights or architecture. Hash proves identity, data stays private.",
    specs: ["Hash: SHA-256", "Data: Private", "Proof: Public"],
  },
  {
    num: "004",
    title: "Layer 2 Scalability",
    subtitle: "BASE SEPOLIA INFRASTRUCTURE",
    description: "Negligible gas costs and instant finality. Enterprise scale without enterprise fees on Optimistic Rollups.",
    specs: ["Network: Base", "Cost: <$0.001", "TPS: 2,000+"],
  },
  {
    num: "005",
    title: "Immutable Provenance",
    subtitle: "COMPLETE AUDIT TRAIL",
    description: "Every prediction linked to registered model version. From training to deployment to inference — all on-chain.",
    specs: ["Chain: Immutable", "History: Complete", "Trust: Cryptographic"],
  },
  {
    num: "006",
    title: "Subgraph Indexing",
    subtitle: "GRAPHQL QUERY LAYER",
    description: "Lightning-fast queries via The Graph. Real-time model lookups, attestation history, analytics.",
    specs: ["Query: GraphQL", "Sync: Real-time", "Latency: <100ms"],
  },
]

function FeatureRow({ feature, index, isActive, onClick }: { 
  feature: typeof FEATURES[0]; 
  index: number; 
  isActive: boolean;
  onClick: () => void;
}) {
  return (
    <m.div
      initial={{ opacity: 0, x: -20 }}
      whileInView={{ opacity: 1, x: 0 }}
      viewport={{ once: true, margin: "-30px" }}
      transition={{ delay: 0.1 + index * 0.08, duration: 0.5, ease }}
      onClick={onClick}
      className={`group cursor-pointer border-b-2 border-foreground transition-all duration-300 ${
        isActive ? 'bg-foreground text-background' : 'hover:bg-foreground/5'
      }`}
    >
      <div className="flex items-stretch">
        {/* Number */}
        <div className={`flex items-center justify-center w-16 sm:w-24 border-r-2 border-foreground py-6 sm:py-8 ${
          isActive ? 'border-background/20' : ''
        }`}>
          <span className={`text-2xl sm:text-4xl font-mono font-bold tracking-tighter ${
            isActive ? 'text-[#ea580c]' : 'text-foreground/30 group-hover:text-foreground/50'
          }`}>
            {feature.num}
          </span>
        </div>
        
        {/* Content */}
        <div className="flex-1 flex flex-col sm:flex-row sm:items-center justify-between py-4 sm:py-6 px-4 sm:px-6 gap-3">
          <div className="flex flex-col gap-1">
            <span className={`text-[9px] sm:text-[10px] font-mono tracking-[0.2em] uppercase ${
              isActive ? 'text-background/60' : 'text-muted-foreground'
            }`}>
              {feature.subtitle}
            </span>
            <h3 className={`text-sm sm:text-lg font-mono font-bold tracking-tight uppercase ${
              isActive ? 'text-background' : 'text-foreground'
            }`}>
              {feature.title}
            </h3>
          </div>
          
          {/* Arrow + Specs preview */}
          <div className="flex items-center gap-4 sm:gap-8">
            <div className={`hidden sm:flex items-center gap-3 ${
              isActive ? 'text-background/60' : 'text-muted-foreground'
            }`}>
              {feature.specs.slice(0, 2).map((spec) => (
                <span key={spec} className="text-[9px] font-mono tracking-wider">
                  {spec}
                </span>
              ))}
            </div>
            <div className={`w-8 h-8 sm:w-10 sm:h-10 border flex items-center justify-center transition-all duration-300 ${
              isActive 
                ? 'border-background/30 bg-background/10 rotate-90' 
                : 'border-foreground/20 group-hover:border-[#ea580c] group-hover:text-[#ea580c]'
            }`}>
              <ChevronRight size={16} strokeWidth={1.5} />
            </div>
          </div>
        </div>
      </div>
      
      {/* Expandable description */}
      <AnimatePresence initial={false}>
        {isActive && (
          <m.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.3, ease }}
            className="overflow-hidden"
          >
            <div className="border-t-2 border-background/20 bg-background text-foreground">
              <div className="flex items-stretch">
                <div className="hidden sm:flex items-center justify-center w-24 border-r-2 border-foreground py-6">
                  <span className="text-xs font-mono text-muted-foreground tracking-widest rotate-180" style={{ writingMode: 'vertical-rl' }}>
                    DESCRIPTION
                  </span>
                </div>
                <div className="flex-1 py-5 px-4 sm:px-6">
                  <p className="text-xs sm:text-sm font-mono leading-relaxed text-muted-foreground max-w-2xl">
                    {feature.description}
                  </p>
                  <div className="flex flex-wrap gap-2 mt-4">
                    {feature.specs.map((spec) => (
                      <span 
                        key={spec}
                        className="text-[9px] font-mono tracking-wider px-2 py-1 border border-foreground/20 text-foreground/60"
                      >
                        {spec}
                      </span>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </m.div>
        )}
      </AnimatePresence>
    </m.div>
  )
}

export function ProtocolFeatures() {
  const [activeIndex, setActiveIndex] = useState<number | null>(null)

  return (
    <LazyMotion features={domAnimation}>
    <section className="w-full px-4 sm:px-6 py-16 sm:py-20 lg:px-12">
      {/* Section label */}
      <m.div
        initial={{ opacity: 0, x: -20 }}
        whileInView={{ opacity: 1, x: 0 }}
        viewport={{ once: true, margin: "-80px" }}
        transition={{ duration: 0.5, ease }}
        className="flex items-center gap-2 sm:gap-4 mb-8 sm:mb-12"
      >
        <span className="text-[10px] tracking-[0.2em] uppercase text-muted-foreground font-mono">
          {"// SECTION: PROTOCOL_FEATURES"}
        </span>
        <div className="flex-1 border-t border-border" />
        <BlinkDot />
        <span className="text-[10px] tracking-[0.2em] uppercase text-muted-foreground font-mono hidden sm:inline">
          007
        </span>
      </m.div>

      {/* Header with large typography */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 lg:gap-12 mb-10 sm:mb-16">
        <m.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-30px" }}
          transition={{ duration: 0.6, ease }}
        >
          <h2 className="text-2xl sm:text-3xl lg:text-4xl xl:text-5xl font-mono font-bold tracking-tight uppercase leading-none">
            Protocol
            <br />
            <span className="text-[#ea580c]">Primitives.</span>
          </h2>
        </m.div>
        
        <m.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-30px" }}
          transition={{ delay: 0.1, duration: 0.6, ease }}
          className="flex flex-col justify-end"
        >
          <p className="text-xs sm:text-sm font-mono text-muted-foreground leading-relaxed max-w-md mb-6">
            Six interconnected systems enabling trustless AI verification. 
            From immutable on-chain registration to cryptographic attestation protocols.
          </p>
          <Link 
            href="/models"
            className="group inline-flex items-center gap-3 text-xs font-mono tracking-[0.15em] uppercase w-fit"
          >
            <span className="border-2 border-foreground px-4 py-2 group-hover:bg-foreground group-hover:text-background transition-all duration-200">
              Explore Registry
            </span>
            <ArrowRight size={14} strokeWidth={1.5} className="group-hover:translate-x-1 transition-transform" />
          </Link>
        </m.div>
      </div>

      {/* Vertical connecting line */}
      <div className="relative">
        <div className="absolute left-0 sm:left-24 top-0 bottom-0 w-px bg-foreground/20 hidden sm:block" />
        
        {/* Feature Rows */}
        <div className="border-t-2 border-foreground">
          {FEATURES.map((feature, i) => (
            <FeatureRow 
              key={feature.num} 
              feature={feature} 
              index={i}
              isActive={activeIndex === i}
              onClick={() => setActiveIndex(activeIndex === i ? null : i)}
            />
          ))}
        </div>
      </div>

    </section>
    </LazyMotion>
  )
}
