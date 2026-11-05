"use client"

import { useState } from "react"
import { ArrowRight, Check, Code2, ExternalLink, Copy } from "lucide-react"
import { LazyMotion, domAnimation, m } from "framer-motion"
import Link from "next/link"
import toast from "react-hot-toast"

const ease = [0.22, 1, 0.36, 1] as const

const PROTOCOL_TIERS = [
  {
    name: "PUBLIC VERIFICATION",
    fee: "FREE",
    period: "PERPETUAL",
    tag: "FOR AUDITORS & USERS",
    description: "Permissionless query layer for anyone to verify whether an AI output was authentically generated.",
    features: [
      "Query Base Sepolia AttestationRegistry",
      "Instant EIP-712 cryptographic check",
      "No wallet connection or token required",
      "Public The Graph Subgraph GraphQL API",
      "Full model version & certification history",
    ],
    cta: "Verify a Prediction",
    href: "/verify",
    highlighted: false,
  },
  {
    name: "MODEL CREATOR STUDIO",
    fee: "0 PROTOCOL FEE",
    period: "(BASE L2 GAS ONLY)",
    tag: "MOST ACTIVE",
    description: "Register AI models, issue signed prediction attestations, and commit model version updates.",
    features: [
      "Permanent model identity & weight commit",
      "Zero protocol tax (only standard L2 gas)",
      "EIP-712 structured wallet signing",
      "Full version changelogs & IPFS metadata",
      "Deactivate & reactivate model controls",
    ],
    cta: "Open Creator Studio",
    href: "/dashboard",
    highlighted: true,
  },
  {
    name: "ENTERPRISE & VERIFIERS",
    fee: "DECENTRALIZED",
    period: "OPEN STANDARD",
    tag: "COMPLIANCE",
    description: "Third-party certification, regulatory compliance pipelines, and automated batch attestations.",
    features: [
      "Third-party verifier certification role",
      "High-throughput batch registration",
      "Automated CI/CD inference integration",
      "Immutable audit trails for regulators",
      "Open source TypeScript & Python SDKs",
    ],
    cta: "Explore Models",
    href: "/models",
    highlighted: false,
  },
]

const SAMPLE_CODE = `import { createRovet } from "@/lib/sdk";
import { keccak256, toBytes } from "viem";

// 1. Initialize PROVET SDK on Base Sepolia
const provet = createRovet({ chain: "baseSepolia" });

// 2. Compute inference hashes
const inputHash = keccak256(toBytes("Patient MRI Scan #1042"));
const outputHash = keccak256(toBytes("Benign. Confidence 99.2%"));

// 3. Model owner signs EIP-712 typed receipt
const signature = await provet.generateAttestationSignature(
  modelId, inputHash, outputHash
);

// 4. Record attestation permanently on-chain
await provet.createAttestation({
  modelId, inputHash, outputHash,
  deadline: signature.deadline,
  v: signature.v, r: signature.r, s: signature.s
});

// 5. Downstream public verification (0 gas)
const { isValid } = await provet.verifyAttestation(
  modelId, inputHash, outputHash
);`;

export function PricingSection() {
  const [copiedCode, setCopiedCode] = useState(false)

  const handleCopyCode = () => {
    navigator.clipboard.writeText(SAMPLE_CODE)
    setCopiedCode(true)
    toast.success("SDK code copied to clipboard!")
    setTimeout(() => setCopiedCode(false), 2000)
  }

  return (
    <LazyMotion features={domAnimation}>
      <section className="w-full px-4 sm:px-6 md:px-8 lg:px-16 xl:px-24 py-12 sm:py-16 lg:py-24 border-t-2 border-foreground">
        {/* Section Header */}
        <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 mb-10 sm:mb-14">
          <div>
            <m.div
              initial={{ opacity: 0, x: -16 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, ease }}
              className="flex items-center gap-2 mb-3"
            >
              <span className="text-[10px] tracking-[0.2em] uppercase text-muted-foreground font-mono">
                {"// PROTOCOL: ARCHITECTURE_&_ACCESS"}
              </span>
            </m.div>
            <h2 className="font-pixel text-2xl sm:text-4xl lg:text-5xl tracking-tight text-foreground">
              PROTOCOL ACCESS & ECONOMICS
            </h2>
          </div>

          <div className="text-right">
            <span className="text-xs font-mono text-muted-foreground block">
              NETWORK: BASE SEPOLIA (ETHEREUM L2)
            </span>
            <span className="text-[10px] font-mono text-[#ea580c] uppercase tracking-wider">
              ZERO PROTOCOL TAX // OPEN STANDARD
            </span>
          </div>
        </div>

        {/* 3 Protocol Pillars Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 lg:gap-6 mb-12">
          {PROTOCOL_TIERS.map((tier, index) => (
            <m.div
              key={tier.name}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: index * 0.1, duration: 0.5, ease }}
              className={`flex flex-col justify-between border-2 border-foreground p-6 ${
                tier.highlighted ? "bg-foreground text-background" : "bg-background text-foreground"
              }`}
            >
              <div>
                <div className="flex items-center justify-between pb-3 border-b border-current/20 mb-4">
                  <span className="text-[10px] font-mono tracking-widest uppercase font-bold">
                    {tier.name}
                  </span>
                  {tier.tag && (
                    <span className="text-[9px] font-mono uppercase px-2 py-0.5 bg-[#ea580c] text-white font-bold">
                      {tier.tag}
                    </span>
                  )}
                </div>

                <div className="mb-4">
                  <div className="text-2xl font-mono font-bold">{tier.fee}</div>
                  <span className="text-[10px] font-mono opacity-60 uppercase">{tier.period}</span>
                </div>

                <p className="text-xs font-mono leading-relaxed opacity-80 mb-6">
                  {tier.description}
                </p>

                <div className="space-y-2 mb-8">
                  {tier.features.map((feat) => (
                    <div key={feat} className="flex items-center gap-2 text-xs font-mono">
                      <Check size={14} className="text-[#ea580c] flex-shrink-0" />
                      <span>{feat}</span>
                    </div>
                  ))}
                </div>
              </div>

              <Link
                href={tier.href}
                className={`w-full py-3 text-center text-xs font-mono font-bold uppercase tracking-wider transition-colors inline-flex items-center justify-center gap-2 ${
                  tier.highlighted
                    ? "bg-[#ea580c] text-white hover:bg-[#c2410c]"
                    : "border-2 border-foreground hover:bg-foreground hover:text-background"
                }`}
              >
                {tier.cta}
                <ArrowRight size={14} />
              </Link>
            </m.div>
          ))}
        </div>

        {/* Developer Integration Code Block */}
        <m.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6, ease }}
          className="border-2 border-foreground bg-background overflow-hidden"
        >
          <div className="flex items-center justify-between px-5 py-3 bg-foreground text-background border-b-2 border-foreground">
            <div className="flex items-center gap-2">
              <Code2 size={16} className="text-[#ea580c]" />
              <span className="text-[10px] font-mono tracking-widest uppercase font-bold">
                DEVELOPER_SDK // INFERENCE_INTEGRATION.TS
              </span>
            </div>

            <button
              onClick={handleCopyCode}
              className="text-[10px] font-mono uppercase tracking-wider text-background/80 hover:text-white flex items-center gap-1 cursor-pointer"
            >
              {copiedCode ? <Check size={12} className="text-green-400" /> : <Copy size={12} />}
              {copiedCode ? "Copied" : "Copy Code"}
            </button>
          </div>

          <div className="p-4 sm:p-6 bg-[#0f0f0f] text-[#F2F1EA] overflow-x-auto">
            <pre className="font-mono text-xs leading-relaxed text-[#F2F1EA]/90">
              <code>{SAMPLE_CODE}</code>
            </pre>
          </div>

          <div className="px-5 py-3 border-t border-foreground/20 bg-background flex flex-col sm:flex-row items-center justify-between gap-3 text-xs font-mono">
            <span className="text-muted-foreground text-[11px]">
              EIP-712 Standard: Compatible with Python Web3.py, Node.js Viem, and Ethers.js
            </span>
            <div className="flex items-center gap-4">
              <a
                href="https://sepolia.basescan.org/address/0x301651C55623E5B022b35e22d7c3935b3fAfBc8F"
                target="_blank"
                rel="noopener noreferrer"
                className="text-[#ea580c] hover:underline flex items-center gap-1"
              >
                ModelRegistry on BaseScan
                <ExternalLink size={12} />
              </a>
              <a
                href="https://sepolia.basescan.org/address/0x3337BA7Ea7E2dEAd933d2d716407C0Bf003bD247"
                target="_blank"
                rel="noopener noreferrer"
                className="text-[#ea580c] hover:underline flex items-center gap-1"
              >
                AttestationRegistry on BaseScan
                <ExternalLink size={12} />
              </a>
            </div>
          </div>
        </m.div>
      </section>
    </LazyMotion>
  )
}
