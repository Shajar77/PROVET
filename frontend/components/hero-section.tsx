"use client"

import dynamic from "next/dynamic"
import { ArrowRight, ShieldCheck, CheckCircle2 } from "lucide-react"
import { motion } from "framer-motion"
import Link from "next/link"

// Lazy load the heavy workflow diagram
const WorkflowDiagram = dynamic(() => import("@/components/workflow-diagram").then(mod => ({ default: mod.WorkflowDiagram })), {
  ssr: false,
  loading: () => <div className="h-[300px] w-full" />,
})

const ease = [0.22, 1, 0.36, 1] as const

export function HeroSection() {
  return (
    <section className="relative w-full px-4 sm:px-6 md:px-8 lg:px-16 xl:px-24 pt-4 sm:pt-6 pb-8 sm:pb-12 lg:pt-10 lg:pb-16">
      <div className="flex flex-col items-center text-center">
        {/* Top headline: PROVE. VERIFY. -- Geist Pixel Grid */}
        <motion.h1
          initial={{ opacity: 0, y: 30, filter: "blur(8px)" }}
          animate={{ opacity: 1, y: 0, filter: "blur(0px)" }}
          transition={{ duration: 0.7, ease }}
          className="font-pixel text-3xl sm:text-5xl md:text-6xl lg:text-7xl xl:text-8xl tracking-tight text-foreground mb-2 select-none"
        >
          PROVE. VERIFY.
        </motion.h1>

        {/* Central Workflow Diagram */}
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.6, delay: 0.15, ease }}
          className="w-full max-w-xl sm:max-w-2xl my-3 sm:my-4 lg:my-6 px-2 sm:px-0"
        >
          <WorkflowDiagram />
        </motion.div>

        {/* Bottom headline: TRUST. -- Geist Pixel Grid */}
        <motion.h1
          initial={{ opacity: 0, y: 30, filter: "blur(8px)" }}
          animate={{ opacity: 1, y: 0, filter: "blur(0px)" }}
          transition={{ duration: 0.7, delay: 0.25, ease }}
          className="font-pixel text-3xl sm:text-5xl md:text-6xl lg:text-7xl xl:text-8xl tracking-tight text-foreground mb-3 sm:mb-4 select-none"
          aria-hidden="true"
        >
          TRUST.
        </motion.h1>

        {/* Sub-headline */}
        <motion.p
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.45, ease }}
          className="text-[11px] sm:text-xs md:text-sm text-muted-foreground max-w-md sm:max-w-lg mb-6 leading-relaxed font-mono px-2 sm:px-0"
        >
          The on-chain provenance standard for AI systems. Register neural architectures, record cryptographic EIP-712 inference receipts, and verify model accountability on Base.
        </motion.p>

        {/* Action Button Group */}
        <motion.div
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.6, ease }}
          className="flex flex-wrap items-center justify-center gap-3 sm:gap-4"
        >
          {/* Primary CTA */}
          <Link href="/models">
            <button className="group flex items-center gap-0 bg-foreground text-background text-xs sm:text-sm font-mono tracking-wider uppercase cursor-pointer hover:bg-[#ea580c] transition-colors">
              <span className="flex items-center justify-center w-9 h-9 sm:w-10 sm:h-10 bg-[#ea580c] group-hover:bg-foreground transition-colors">
                <ArrowRight size={16} strokeWidth={2} className="text-white" />
              </span>
              <span className="px-4 sm:px-5 py-2 sm:py-2.5 font-bold">
                Explore Registry
              </span>
            </button>
          </Link>

          {/* Secondary CTA */}
          <Link href="/verify">
            <button className="flex items-center gap-2 px-4 sm:px-5 py-2.5 border-2 border-foreground text-foreground text-xs sm:text-sm font-mono tracking-wider uppercase cursor-pointer hover:bg-foreground hover:text-background transition-colors">
              <ShieldCheck size={16} strokeWidth={2} />
              Verify Prediction
            </button>
          </Link>

          {/* Tertiary CTA */}
          <Link href="/attest">
            <button className="flex items-center gap-2 px-4 sm:px-5 py-2.5 border border-foreground/30 text-muted-foreground hover:text-foreground hover:border-foreground text-xs sm:text-sm font-mono tracking-wider uppercase cursor-pointer transition-colors">
              <CheckCircle2 size={16} />
              Issue Attestation
            </button>
          </Link>
        </motion.div>
      </div>
    </section>
  )
}
