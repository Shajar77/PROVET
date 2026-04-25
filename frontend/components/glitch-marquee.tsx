"use client"

import { LazyMotion, domAnimation, m } from "framer-motion"

const ease = [0.22, 1, 0.36, 1] as const

const PARTNERS = [
  "BASE_NETWORK",
  "EIP_712",
  "ETHEREUM",
  "VERIFICATION",
  "ATTESTATION",
  "SIGNATURES",
  "TRANSPARENCY",
  "ACCOUNTABILITY",
  "ON_CHAIN",
  "PROVENANCE",
]

function LogoBlock({ name, glitch }: { name: string; glitch: boolean }) {
  return (
    <div
      className={`flex items-center justify-center px-4 sm:px-6 lg:px-8 py-3 sm:py-4 border-r-2 border-foreground shrink-0 ${
        glitch ? "animate-glitch" : ""
      }`}
    >
      <span className="text-xs sm:text-sm font-mono tracking-[0.15em] uppercase text-foreground whitespace-nowrap">
        {name}
      </span>
    </div>
  )
}

export function GlitchMarquee() {
  const glitchIndices = [2, 6]

  return (
    <LazyMotion features={domAnimation}>
    <section className="w-full py-12 sm:py-16 px-4 sm:px-6 lg:px-12">
      {/* Section label */}
      <m.div
        initial={{ opacity: 0, x: -20 }}
        whileInView={{ opacity: 1, x: 0 }}
        viewport={{ once: true, margin: "-80px" }}
        transition={{ duration: 0.5, ease }}
        className="flex items-center gap-2 sm:gap-4 mb-6 sm:mb-8"
      >
        <span className="text-[10px] tracking-[0.2em] uppercase text-muted-foreground font-mono">
          {"// PROTOCOL: KEY_COMPONENTS"}
        </span>
        <div className="flex-1 border-t border-border" />
        <span className="text-[10px] tracking-[0.2em] uppercase text-muted-foreground font-mono hidden sm:inline">008</span>
      </m.div>

      {/* Marquee */}
      <m.div
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, margin: "-40px" }}
        transition={{ duration: 0.6, ease }}
        className="overflow-hidden border-2 border-foreground"
      >
        <div className="flex animate-marquee" style={{ width: "max-content" }}>
          {[...PARTNERS, ...PARTNERS].map((name, i) => (
            <LogoBlock
              key={`${name}-${i}`}
              name={name}
              glitch={glitchIndices.includes(i % PARTNERS.length)}
            />
          ))}
        </div>
      </m.div>
    </section>
    </LazyMotion>
  )
}
