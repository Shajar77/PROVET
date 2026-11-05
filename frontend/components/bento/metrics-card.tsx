"use client"

import { ExternalLink, Database } from "lucide-react"

const CONTRACTS = [
  {
    name: "ModelRegistry.sol",
    address: "0x301651C55623E5B022b35e22d7c3935b3fAfBc8F",
    role: "Architectures, versioning, weight commitments & certified verifiers",
    url: "https://sepolia.basescan.org/address/0x301651C55623E5B022b35e22d7c3935b3fAfBc8F",
  },
  {
    name: "AttestationRegistry.sol",
    address: "0x3337BA7Ea7E2dEAd933d2d716407C0Bf003bD247",
    role: "EIP-712 typed signature validation, replay deadlines & prediction receipts",
    url: "https://sepolia.basescan.org/address/0x3337BA7Ea7E2dEAd933d2d716407C0Bf003bD247",
  },
]

const SPECS = [
  { label: "SETTLEMENT LAYER", value: "Base Sepolia L2" },
  { label: "VERIFICATION COST", value: "0 Gas (Public)" },
  { label: "PROTOCOL TAX", value: "0% Free Standard" },
  { label: "SIGNATURE FORMAT", value: "EIP-712 Typed" },
]

export function MetricsCard() {
  return (
    <div className="flex flex-col h-full bg-background">
      {/* Header */}
      <div className="flex items-center justify-between border-b-2 border-foreground px-4 py-2.5 bg-foreground text-background">
        <div className="flex items-center gap-2">
          <Database size={12} className="text-[#ea580c]" />
          <span className="text-[10px] tracking-widest uppercase font-mono font-bold">
            ONCHAIN_TOPOLOGY
          </span>
        </div>
        <span className="text-[10px] font-mono text-[#ea580c] uppercase">
          BASE L2 INFRASTRUCTURE
        </span>
      </div>

      <div className="flex-1 p-4 sm:p-5 flex flex-col justify-between space-y-4">
        {/* Deployed Contracts List */}
        <div className="space-y-2.5">
          <span className="text-[10px] font-mono text-muted-foreground uppercase tracking-widest block">
            Verified Protocol Contracts:
          </span>

          {CONTRACTS.map((c) => (
            <div
              key={c.name}
              className="border border-foreground/20 p-2.5 bg-foreground/5 space-y-1 text-xs font-mono"
            >
              <div className="flex items-center justify-between">
                <span className="font-bold text-foreground text-[11px] flex items-center gap-1.5">
                  <span className="h-1.5 w-1.5 rounded-full bg-green-500" />
                  {c.name}
                </span>
                <a
                  href={c.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-[10px] text-[#ea580c] hover:underline flex items-center gap-1"
                >
                  BaseScan
                  <ExternalLink size={10} />
                </a>
              </div>
              <div className="text-[10px] text-muted-foreground break-all">
                {c.address.slice(0, 18)}...{c.address.slice(-10)}
              </div>
              <p className="text-[10px] text-muted-foreground/90 leading-tight">
                {c.role}
              </p>
            </div>
          ))}
        </div>

        {/* Protocol Engine Specs */}
        <div className="grid grid-cols-2 gap-2 pt-2 border-t border-foreground/15">
          {SPECS.map((s) => (
            <div key={s.label} className="border border-foreground/15 p-2 bg-background">
              <span className="text-[9px] font-mono uppercase text-muted-foreground block">
                {s.label}
              </span>
              <span className="text-xs font-mono font-bold text-foreground">
                {s.value}
              </span>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
