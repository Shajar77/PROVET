"use client"

import { useState } from "react"
import { LazyMotion, domAnimation, m, AnimatePresence } from "framer-motion"
import { Plus, Minus } from "lucide-react"
import { BlinkDot } from "@/components/blink-dot"

const ease = [0.22, 1, 0.36, 1] as const



const FAQS = [
  {
    question: "WHAT IS A MODEL REGISTRY?",
    answer: "A model registry is an on-chain database that stores cryptographic hashes of AI models. When you register a model, its unique fingerprint (hash) is permanently recorded on the blockchain, creating an immutable provenance record that anyone can verify."
  },
  {
    question: "HOW DO ATTESTATIONS WORK?",
    answer: "Attestations are cryptographically signed predictions. When your model makes a prediction, you create an EIP-712 signature that proves which specific model version produced that output. This signature can be verified by anyone without revealing sensitive model weights or proprietary data."
  },
  {
    question: "WHAT IS EIP-712?",
    answer: "EIP-712 is an Ethereum standard for structured data signing. It allows users to see exactly what they're signing in a human-readable format, rather than obscure hexadecimal strings. This makes the verification process transparent and secure."
  },
  {
    question: "IS ROVET FREE TO USE?",
    answer: "Yes, the protocol itself is free. You only pay gas fees on Base Sepolia (fractions of a cent per transaction). Registering a model costs ~$0.001, and creating an attestation costs even less. We're committed to making AI verification accessible to everyone."
  },
  {
    question: "WHO CAN VERIFY MY MODELS?",
    answer: "Anyone. All registrations and attestations are public on the blockchain. Third parties - users, auditors, regulators, or customers - can cryptographically verify that a prediction came from your registered model without trusting any intermediary."
  },
  {
    question: "DO I EXPOSE MY MODEL WEIGHTS?",
    answer: "No. Only a cryptographic hash of your model is stored on-chain. Your actual weights, architecture, and training data remain private. The hash acts like a fingerprint - it proves identity without revealing the underlying model."
  }
]

function FaqItem({ question, answer, index }: { question: string; answer: string; index: number }) {
  const [isOpen, setIsOpen] = useState(false)

  return (
    <m.div
      initial={{ opacity: 0, y: 16 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-30px" }}
      transition={{ delay: 0.1 + index * 0.08, duration: 0.5, ease }}
      className="border-2 border-foreground"
    >
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="w-full flex items-center justify-between px-5 py-4 text-left hover:bg-foreground/5 transition-colors"
      >
        <div className="flex items-center gap-3">
          <span className="text-[10px] font-mono text-muted-foreground tracking-widest">
            {String(index + 1).padStart(2, '0')}
          </span>
          <span className="text-xs sm:text-sm font-mono tracking-[0.1em] uppercase font-semibold">
            {question}
          </span>
        </div>
        <div className="flex-shrink-0 ml-4 w-8 h-8 border border-foreground/20 flex items-center justify-center">
          {isOpen ? (
            <Minus size={14} strokeWidth={1.5} className="text-[#ea580c]" />
          ) : (
            <Plus size={14} strokeWidth={1.5} className="text-foreground" />
          )}
        </div>
      </button>
      
      <AnimatePresence initial={false}>
        {isOpen && (
          <m.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.3, ease }}
            className="overflow-hidden border-t-2 border-foreground"
          >
            <div className="px-5 py-4 bg-foreground/[0.02]">
              <p className="text-[11px] sm:text-xs font-mono text-muted-foreground leading-relaxed max-w-3xl">
                {answer}
              </p>
            </div>
          </m.div>
        )}
      </AnimatePresence>
    </m.div>
  )
}

export function FaqSection() {
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
          {"// SECTION: FREQUENTLY_ASKED_QUESTIONS"}
        </span>
        <div className="flex-1 border-t border-border" />
        <BlinkDot />
        <span className="text-[10px] tracking-[0.2em] uppercase text-muted-foreground font-mono hidden sm:inline">
          006
        </span>
      </m.div>

      {/* Header */}
      <m.div
        initial={{ opacity: 0, y: 16 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, margin: "-30px" }}
        transition={{ duration: 0.5, ease }}
        className="mb-8 sm:mb-10"
      >
        <h2 className="text-xl sm:text-2xl lg:text-3xl font-mono font-bold tracking-tight uppercase">
          Questions?
          <span className="text-[#ea580c]"> Answered.</span>
        </h2>
      </m.div>

      {/* FAQ Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {FAQS.map((faq, i) => (
          <FaqItem key={faq.question} {...faq} index={i} />
        ))}
      </div>

      {/* Bottom CTA */}
      <m.div
        initial={{ opacity: 0, y: 16 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, margin: "-30px" }}
        transition={{ delay: 0.4, duration: 0.5, ease }}
        className="mt-8 sm:mt-10 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 p-5 border-2 border-foreground"
      >
        <div className="flex items-center gap-3">
          <span className="h-1.5 w-1.5 bg-[#ea580c]" />
          <span className="text-xs font-mono tracking-[0.1em] uppercase text-muted-foreground">
            STILL HAVE QUESTIONS?
          </span>
        </div>
        <a 
          href="#" 
          className="text-xs font-mono tracking-[0.1em] uppercase text-foreground hover:text-[#ea580c] transition-colors border-b border-foreground hover:border-[#ea580c]"
        >
          READ DOCUMENTATION →
        </a>
      </m.div>
    </section>
    </LazyMotion>
  )
}
