"use client"

import { useState } from "react"
import { LazyMotion, domAnimation, m } from "framer-motion"
import { ShieldCheck, ShieldAlert, ArrowRight, Database, KeyRound, Check, Sparkles } from "lucide-react"
import Link from "next/link"

const ease = [0.22, 1, 0.36, 1] as const

const STEPS = [
  {
    step: "01",
    tag: "REGISTRATION",
    title: "Register Model Architecture",
    contract: "ModelRegistry.sol",
    summary: "Developers register model identity and commit an immutable cryptographic hash of model weights to Base Sepolia.",
    points: [
      "Permanent model identity & versioning (v1.0.0, v2.0.0)",
      "Weights commitment prevents stealth model swapping",
      "Certified third-party verifier authorization",
    ],
    ctaText: "Explore Model Registry",
    ctaHref: "/models",
    icon: Database,
  },
  {
    step: "02",
    tag: "ATTESTATION",
    title: "Sign Inference with EIP-712",
    contract: "AttestationRegistry.sol",
    summary: "When the model produces an output, the owner signs the prompt and prediction with an EIP-712 structured cryptographic receipt.",
    points: [
      "EIP-712 typed signature prevents forgery and tampering",
      "Cryptographic deadline prevents replay attacks",
      "Permanent timestamped receipt logged on Base L2",
    ],
    ctaText: "Issue an Attestation",
    ctaHref: "/attest",
    icon: KeyRound,
  },
  {
    step: "03",
    tag: "VERIFICATION",
    title: "Trustless Zero-Gas Public Audit",
    contract: "Public Verification Layer",
    summary: "Anyone worldwide can verify if an inference output genuinely came from that accredited model version with zero gas.",
    points: [
      "100% free read queries — no wallet or token required",
      "Instant cryptographic validation in under 1 millisecond",
      "Auditable by downstream smart contracts and regulators",
    ],
    ctaText: "Verify a Prediction",
    ctaHref: "/verify",
    icon: ShieldCheck,
  },
]

const SPECS = [
  {
    tag: "BASE_SEPOLIA_L2",
    stat: "< $0.001",
    title: "Sub-Cent Settlement",
    desc: "Negligible transaction gas and instant finality powered by Base Ethereum L2 rollups.",
  },
  {
    tag: "PUBLIC_AUDIT_LAYER",
    stat: "0 GAS",
    title: "Free Public Verification",
    desc: "Anyone can verify predictions on-chain without paying gas or holding native tokens.",
  },
  {
    tag: "ETHEREUM_STANDARD",
    stat: "EIP-712",
    title: "Universal Compatibility",
    desc: "Structured typed data signing supported natively by Python Web3, TypeScript, and Viem.",
  },
]

export function FeatureGrid() {
  const [activeStepIndex, setActiveStepIndex] = useState(0)
  const currentStep = STEPS[activeStepIndex]
  const StepIcon = currentStep.icon

  return (
    <LazyMotion features={domAnimation}>
      <section className="w-full px-4 sm:px-6 py-16 sm:py-20 lg:px-12">
        {/* Section label */}
        <m.div
          initial={{ opacity: 0, x: -20 }}
          whileInView={{ opacity: 1, x: 0 }}
          viewport={{ once: true, margin: "-80px" }}
          transition={{ duration: 0.5, ease }}
          className="flex items-center gap-2 sm:gap-4 mb-6 sm:mb-8"
        >
          <span className="text-[10px] tracking-[0.2em] uppercase text-muted-foreground font-mono">
            {"// PROTOCOL: ARCHITECTURE_&_LIFECYCLE"}
          </span>
          <div className="flex-1 border-t border-border" />
          <span className="text-[10px] tracking-[0.2em] uppercase text-[#ea580c] font-mono">
            HOW PROVET WORKS
          </span>
        </m.div>

        {/* Section Header */}
        <m.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-80px" }}
          transition={{ duration: 0.6, ease }}
          className="mb-8 sm:mb-12"
        >
          <h2 className="font-pixel text-2xl sm:text-4xl lg:text-5xl tracking-tight text-foreground mb-3">
            HOW PROVET SECURES ARTIFICIAL INTELLIGENCE
          </h2>
          <p className="text-xs sm:text-sm text-muted-foreground max-w-2xl font-mono leading-relaxed">
            AI decisions are black boxes that cannot be audited or trusted. PROVET cryptographically binds every inference prediction to registered model weights on Base L2.
          </p>
        </m.div>

        {/* Top Row: 2 Big Feature Cards */}
        <div className="grid grid-cols-1 lg:grid-cols-2 border-2 border-foreground bg-background mb-6">
          {/* Card 1: 3-Step Interactive Lifecycle */}
          <div className="border-b-2 lg:border-b-0 lg:border-r-2 border-foreground flex flex-col justify-between">
            {/* Terminal Header */}
            <div className="flex items-center justify-between px-4 sm:px-5 py-3 border-b-2 border-foreground bg-foreground text-background">
              <div className="flex items-center gap-2">
                <span className="h-2 w-2 bg-[#ea580c]" />
                <span className="text-[10px] tracking-widest uppercase font-mono font-bold">
                  THE_PROVENANCE_LIFECYCLE
                </span>
              </div>
              <span className="text-[10px] font-mono text-[#ea580c] uppercase">
                3-STEP PROTOCOL
              </span>
            </div>

            <div className="p-5 sm:p-6 lg:p-8 flex-1 flex flex-col justify-between space-y-6">
              {/* Step Navigation Tabs */}
              <div className="grid grid-cols-3 gap-2 border-b border-foreground/20 pb-4">
                {STEPS.map((s, idx) => (
                  <button
                    key={s.step}
                    onClick={() => setActiveStepIndex(idx)}
                    className={`py-2 px-2 text-center text-xs font-mono uppercase tracking-wider font-bold transition-all cursor-pointer border ${
                      idx === activeStepIndex
                        ? "bg-[#ea580c] text-white border-[#ea580c]"
                        : "border-foreground/30 text-muted-foreground hover:border-foreground hover:text-foreground"
                    }`}
                  >
                    {s.step}. {s.tag}
                  </button>
                ))}
              </div>

              {/* Active Step Details */}
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <StepIcon size={18} className="text-[#ea580c]" />
                    <h3 className="text-base sm:text-lg font-mono font-bold text-foreground">
                      {currentStep.title}
                    </h3>
                  </div>
                  <span className="text-[10px] font-mono px-2 py-0.5 border border-foreground/30 uppercase text-muted-foreground">
                    {currentStep.contract}
                  </span>
                </div>

                <p className="text-xs font-mono text-muted-foreground leading-relaxed">
                  {currentStep.summary}
                </p>

                <div className="space-y-2 pt-2 border-t border-foreground/15">
                  {currentStep.points.map((pt) => (
                    <div key={pt} className="flex items-start gap-2 text-xs font-mono">
                      <Check size={14} className="text-[#ea580c] mt-0.5 flex-shrink-0" />
                      <span className="text-foreground">{pt}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Action Button */}
              <div className="pt-4 border-t border-foreground/15">
                <Link
                  href={currentStep.ctaHref}
                  className="w-full flex items-center justify-between px-4 py-3 bg-foreground text-background text-xs font-mono font-bold uppercase tracking-wider hover:bg-[#ea580c] hover:text-white transition-colors"
                >
                  <span>{currentStep.ctaText}</span>
                  <ArrowRight size={14} />
                </Link>
              </div>
            </div>
          </div>

          {/* Card 2: The Two Realities (Opaque AI vs Verifiable AI) */}
          <div className="flex flex-col justify-between">
            {/* Header */}
            <div className="flex items-center justify-between px-4 sm:px-5 py-3 border-b-2 border-foreground bg-foreground text-background">
              <div className="flex items-center gap-2">
                <Sparkles size={14} className="text-[#ea580c]" />
                <span className="text-[10px] tracking-widest uppercase font-mono font-bold">
                  WHY_PROVET_MATTERS
                </span>
              </div>
              <span className="text-[10px] font-mono text-[#ea580c] uppercase">
                THE TWO REALITIES
              </span>
            </div>

            <div className="p-5 sm:p-6 lg:p-8 flex-1 flex flex-col justify-between space-y-5">
              {/* Box 1: Without PROVET */}
              <div className="border-2 border-red-500/40 bg-red-500/5 p-4 sm:p-5 space-y-2">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2 text-red-500 font-mono text-xs font-bold uppercase tracking-wider">
                    <ShieldAlert size={16} />
                    Traditional AI (Opaque Black Box)
                  </div>
                  <span className="text-[9px] font-mono uppercase px-2 py-0.5 bg-red-500/20 text-red-400 font-bold">
                    Risk: Unverifiable
                  </span>
                </div>
                <p className="text-xs font-mono text-muted-foreground leading-relaxed">
                  Anyone can claim a model produced a decision. Stealth model swaps, hallucinated outputs, and prompt tampering cannot be disproven or audited.
                </p>
              </div>

              {/* Box 2: With PROVET */}
              <div className="border-2 border-green-500/40 bg-green-500/5 p-4 sm:p-5 space-y-2">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2 text-green-500 font-mono text-xs font-bold uppercase tracking-wider">
                    <ShieldCheck size={16} />
                    PROVET Protocol (Verifiable AI)
                  </div>
                  <span className="text-[9px] font-mono uppercase px-2 py-0.5 bg-green-500/20 text-green-400 font-bold">
                    Cryptographically Proven
                  </span>
                </div>
                <p className="text-xs font-mono text-muted-foreground leading-relaxed">
                  Every prediction is mathematically signed by the model owner and anchored on Base L2. Tampering with even one character breaks the proof instantly.
                </p>
              </div>

              <div className="pt-3 border-t border-foreground/15 flex items-center justify-between text-[11px] font-mono text-muted-foreground">
                <span>Non-repudiable AI Accountability</span>
                <span className="text-[#ea580c] font-semibold">Zero Trust Architecture</span>
              </div>
            </div>
          </div>
        </div>

        {/* Bottom Row: 3 Clean Modern Feature & Infrastructure Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 border-2 border-foreground bg-background">
          {SPECS.map((spec, index) => (
            <div
              key={spec.stat}
              className={`p-6 flex flex-col justify-between ${
                index !== SPECS.length - 1 ? "border-b-2 md:border-b-0 md:border-r-2 border-foreground" : ""
              }`}
            >
              <div>
                <span className="text-[10px] font-mono uppercase tracking-widest text-muted-foreground block mb-2">
                  {spec.tag}
                </span>
                <div className="text-3xl sm:text-4xl font-mono font-bold text-foreground mb-3">
                  {spec.stat}
                </div>
                <h4 className="text-sm font-mono font-bold uppercase mb-2 text-[#ea580c]">
                  {spec.title}
                </h4>
                <p className="text-xs font-mono text-muted-foreground leading-relaxed">
                  {spec.desc}
                </p>
              </div>
            </div>
          ))}
        </div>
      </section>
    </LazyMotion>
  )
}
