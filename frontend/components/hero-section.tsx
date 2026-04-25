"use client"

import dynamic from "next/dynamic"
import { ArrowRight } from "lucide-react"
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
          className="text-[11px] sm:text-xs md:text-sm text-muted-foreground max-w-xs sm:max-w-sm md:max-w-md mb-5 sm:mb-6 leading-relaxed font-mono px-2 sm:px-0"
        >
          ROVET is the on-chain registry for AI model provenance. Register models, attest to predictions with EIP-712 signatures, and prove which AI made every decision.
        </motion.p>

        {/* CTA Button */}
        <Link href="/models">
          <motion.button
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.6, ease }}
            whileHover={{ scale: 1.03 }}
            whileTap={{ scale: 0.97 }}
            className="group flex items-center gap-0 bg-foreground text-background text-xs sm:text-sm font-mono tracking-wider uppercase cursor-pointer"
          >
            <span className="flex items-center justify-center w-9 h-9 sm:w-10 sm:h-10 bg-[#ea580c]">
              <motion.span
                className="inline-flex"
                whileHover={{ x: 3 }}
                transition={{ type: "spring", stiffness: 400, damping: 20 }}
              >
                <ArrowRight size={16} strokeWidth={2} className="text-background" />
              </motion.span>
            </span>
            <span className="px-4 sm:px-5 py-2 sm:py-2.5">
              Browse Models
            </span>
          </motion.button>
        </Link>
      </div>
    </section>
  )
}
