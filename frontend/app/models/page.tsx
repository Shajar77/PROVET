"use client"

import { Navbar } from "@/components/navbar"
import { motion, AnimatePresence } from "framer-motion"
import { useState, useMemo, useEffect } from "react"
import { Search, Filter, ChevronLeft, ChevronRight, X, ExternalLink, Copy, Check, ShieldCheck, ArrowRight, Layers } from "lucide-react"
import { createRovet } from "@/lib/sdk"
import type { Model } from "@/lib/types"
import Link from "next/link"
import toast from "react-hot-toast"

const ease = [0.22, 1, 0.36, 1] as const
const ITEMS_PER_PAGE = 8

// Fallback mock data - used when contract isn't deployed or no models exist
const MOCK_MODELS: Model[] = [
  { id: "0x301651c55623e5b022b35e22d7c3935b3fafbc8f000000000000000000000001" as `0x${string}`, name: "Fraud Detection v2.1", currentVersion: "v2.1.0", owner: "0x89ac76734399Bf2501b929a19fdB6A5565A4c100" as `0x${string}`, registeredAt: BigInt(1705276800), isActive: true, modelHash: "0x8f2d4e8b91c0e3a5f7823901bcda901238475619283746501928374650192837" as `0x${string}`, metadataURI: "ipfs://bafybeigdyrzt5sfp7udm7hu76uh7y26nf3efuylqabf3oclgtqy55fbzdi", updatedAt: BigInt(1705363200), totalVersions: BigInt(2), attestationsCount: BigInt(12) },
  { id: "0xabcdef0123456789abcdef0123456789abcdef0123456789abcdef0123456789" as `0x${string}`, name: "Credit Risk Scoring Engine", currentVersion: "v1.5.2", owner: "0x742d35Cc6634C0532925a3b844Bc454e4438f44e" as `0x${string}`, registeredAt: BigInt(1705017600), isActive: true, modelHash: "0x3a4b5c6d7e8f9a0b1c2d3e4f5a6b7c8d9e0f1a2b3c4d5e6f7a8b9c0d1e2f3a4b" as `0x${string}`, metadataURI: "ipfs://bafybeic54u3x4y7w6v5u4t3s2r1q0p9o8n7m6l5k4j3i2h1g0f", updatedAt: BigInt(1705104000), totalVersions: BigInt(3), attestationsCount: BigInt(45) },
  { id: "0x9876543210fedcba9876543210fedcba9876543210fedcba9876543210fedcba" as `0x${string}`, name: "Medical Oncology Classifier", currentVersion: "v3.0.1", owner: "0x1234567890123456789012345678901234567890" as `0x${string}`, registeredAt: BigInt(1704844800), isActive: true, modelHash: "0x11223344556677889900aabbccddeeff0011223344556677889900aabbccddee" as `0x${string}`, metadataURI: "ipfs://bafybeid9876543210fedcba9876543210fedcba", updatedAt: BigInt(1704931200), totalVersions: BigInt(5), attestationsCount: BigInt(128) },
  { id: "0x2468ace013579bdf2468ace013579bdf2468ace013579bdf2468ace013579bdf" as `0x${string}`, name: "Sentiment Analysis Transformer", currentVersion: "v4.2.0", owner: "0x5678901234567890123456789012345678901234" as `0x${string}`, registeredAt: BigInt(1704672000), isActive: true, modelHash: "0x99887766554433221100ffeeddccbbaa99887766554433221100ffeeddccbbaa" as `0x${string}`, metadataURI: "", updatedAt: BigInt(0), totalVersions: BigInt(2), attestationsCount: BigInt(89) },
  { id: "0x1357bd2468ace0f1357bd2468ace0f1357bd2468ace0f1357bd2468ace0f1357" as `0x${string}`, name: "DeFi Liquidity Predictor", currentVersion: "v2.0.3", owner: "0xabcdef1234567890abcdef1234567890abcdef12" as `0x${string}`, registeredAt: BigInt(1704412800), isActive: false, modelHash: "0x0000000000000000000000000000000000000000000000000000000000000000" as `0x${string}`, metadataURI: "", updatedAt: BigInt(0), totalVersions: BigInt(1), attestationsCount: BigInt(0) },
  { id: "0x9f8e7d6c5b4a39281706050403020100f1e2d3c4b5a69788796a5b4c3d2e1f00" as `0x${string}`, name: "Document Regulatory Extractor", currentVersion: "v1.8.5", owner: "0xdef01234567890abcdef1234567890abcdef1234" as `0x${string}`, registeredAt: BigInt(1704240000), isActive: true, modelHash: "0x556677889900aabbccddeeff0011223344556677889900aabbccddeeff001122" as `0x${string}`, metadataURI: "", updatedAt: BigInt(0), totalVersions: BigInt(4), attestationsCount: BigInt(67) },
]

type FilterType = "all" | "active" | "inactive"

function shortenHash(hash: string, chars = 6): string {
  if (!hash) return ""
  if (hash.length <= chars * 2 + 2) return hash
  return `${hash.slice(0, chars + 2)}...${hash.slice(-chars)}`
}

export default function ModelsPage() {
  const [models, setModels] = useState<Model[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [searchQuery, setSearchQuery] = useState("")
  const [filterType, setFilterType] = useState<FilterType>("all")
  const [currentPage, setCurrentPage] = useState(1)
  const [showFilters, setShowFilters] = useState(false)
  const [selectedModel, setSelectedModel] = useState<Model | null>(null)
  const [copiedId, setCopiedId] = useState(false)

  // Fetch models from chain on mount
  useEffect(() => {
    async function fetchModels() {
      setIsLoading(true)
      try {
        const sdk = createRovet({ chain: "baseSepolia" })
        const chainModels = await sdk.getAllModels()
        
        if (chainModels && chainModels.length > 0) {
          setModels(chainModels)
        } else {
          setModels(MOCK_MODELS)
        }
      } catch (error) {
        console.warn("Could not fetch models from RPC, loading fallback models:", error)
        setModels(MOCK_MODELS)
      } finally {
        setIsLoading(false)
      }
    }

    fetchModels()
  }, [])

  // Filter & search logic
  const filteredModels = useMemo(() => {
    let result = [...models]

    if (filterType === "active") {
      result = result.filter((m) => m.isActive)
    } else if (filterType === "inactive") {
      result = result.filter((m) => !m.isActive)
    }

    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase()
      result = result.filter(
        (m) =>
          m.name.toLowerCase().includes(query) ||
          m.currentVersion.toLowerCase().includes(query) ||
          m.id.toLowerCase().includes(query) ||
          m.owner.toLowerCase().includes(query)
      )
    }

    return result
  }, [models, filterType, searchQuery])

  // Pagination
  const totalPages = Math.max(1, Math.ceil(filteredModels.length / ITEMS_PER_PAGE))
  const paginatedModels = filteredModels.slice(
    (currentPage - 1) * ITEMS_PER_PAGE,
    currentPage * ITEMS_PER_PAGE
  )

  // Reset page when filters change
  const [prevFilterState, setPrevFilterState] = useState({ query: searchQuery, filter: filterType })
  if (prevFilterState.query !== searchQuery || prevFilterState.filter !== filterType) {
    setPrevFilterState({ query: searchQuery, filter: filterType })
    setCurrentPage(1)
  }

  const activeCount = models.filter((m) => m.isActive).length
  const inactiveCount = models.filter((m) => !m.isActive).length

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text)
    setCopiedId(true)
    toast.success("Model ID copied to clipboard!")
    setTimeout(() => setCopiedId(false), 2000)
  }

  return (
    <div className="min-h-screen dot-grid-bg">
      <Navbar />
      <main className="w-full px-4 sm:px-6 py-8 sm:py-12 lg:px-12 max-w-7xl mx-auto">
        {/* Section label */}
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.5, ease }}
          className="flex items-center gap-2 sm:gap-4 mb-6 sm:mb-8"
        >
          <span className="text-[10px] tracking-[0.2em] uppercase text-muted-foreground font-mono">
            {"// REGISTRY: GLOBAL_MODEL_EXPLORER"}
          </span>
          <div className="flex-1 border-t border-border" />
          <span className="text-[10px] tracking-[0.2em] uppercase text-[#ea580c] font-mono">
            BASE SEPOLIA
          </span>
        </motion.div>

        {/* Header & Stats Banner */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.1, ease }}
          className="mb-8"
        >
          <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-6 mb-6">
            <div>
              <h1 className="font-pixel text-2xl sm:text-3xl lg:text-5xl tracking-tight text-foreground mb-3">
                MODEL REGISTRY
              </h1>
              <p className="text-xs lg:text-sm text-muted-foreground max-w-xl font-mono">
                Explore registered AI models on Base. Inspect weight commitments, version histories, and verifiable attestations.
              </p>
            </div>

            <div className="flex flex-wrap items-center gap-3">
              <Link
                href="/dashboard?tab=register"
                className="flex items-center gap-2 px-4 py-2.5 bg-foreground text-background text-xs font-mono font-bold uppercase tracking-wider hover:bg-[#ea580c] hover:text-white transition-colors"
              >
                Register Your Model
                <ArrowRight size={14} />
              </Link>
            </div>
          </div>
        </motion.div>

        {/* Search & Filter Bar */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.15, ease }}
          className="mb-6"
        >
          <div className="flex flex-col sm:flex-row gap-3">
            <div className="flex-1 flex items-center border-2 border-foreground bg-background">
              <span className="flex items-center justify-center w-10 h-10 border-r-2 border-foreground flex-shrink-0">
                <Search size={14} strokeWidth={1.5} className="text-muted-foreground" />
              </span>
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search by model name, version, ID, or owner address..."
                className="flex-1 px-3 py-2 bg-transparent text-xs font-mono focus:outline-none min-w-0"
              />
              {searchQuery && (
                <button
                  onClick={() => setSearchQuery("")}
                  className="px-3 text-muted-foreground hover:text-foreground transition-colors cursor-pointer"
                >
                  <X size={14} />
                </button>
              )}
            </div>

            <button
              onClick={() => setShowFilters(!showFilters)}
              className={`flex items-center gap-2 px-4 py-2 border-2 text-xs font-mono tracking-wider uppercase transition-colors flex-shrink-0 cursor-pointer ${
                showFilters || filterType !== "all"
                  ? "border-[#ea580c] text-[#ea580c]"
                  : "border-foreground text-foreground hover:bg-foreground/5"
              }`}
            >
              <Filter size={14} />
              FILTER
              {filterType !== "all" && (
                <span className="bg-[#ea580c] text-background text-[9px] px-1.5 py-0.5">
                  {filterType.toUpperCase()}
                </span>
              )}
            </button>
          </div>

          <AnimatePresence>
            {showFilters && (
              <motion.div
                initial={{ height: 0, opacity: 0 }}
                animate={{ height: "auto", opacity: 1 }}
                exit={{ height: 0, opacity: 0 }}
                transition={{ duration: 0.2, ease }}
                className="overflow-hidden"
              >
                <div className="flex flex-wrap gap-2 mt-3 pt-3 border-t border-foreground/20">
                  {[
                    { value: "all" as FilterType, label: "ALL", count: models.length },
                    { value: "active" as FilterType, label: "ACTIVE", count: activeCount },
                    { value: "inactive" as FilterType, label: "INACTIVE", count: inactiveCount },
                  ].map((f) => (
                    <button
                      key={f.value}
                      onClick={() => setFilterType(f.value)}
                      className={`text-[10px] font-mono tracking-wider px-3 py-1.5 border transition-colors cursor-pointer ${
                        filterType === f.value
                          ? "border-[#ea580c] bg-[#ea580c] text-background font-bold"
                          : "border-foreground/30 text-muted-foreground hover:border-foreground/60"
                      }`}
                    >
                      {f.label} ({f.count})
                    </button>
                  ))}
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </motion.div>

        {/* Loading state */}
        {isLoading ? (
          <div className="border-2 border-foreground p-12 flex flex-col items-center gap-4 bg-background">
            <span className="h-6 w-6 border-2 border-foreground/30 border-t-[#ea580c] rounded-full animate-spin" />
            <span className="text-xs font-mono tracking-widest uppercase text-muted-foreground">
              QUERYING BASE SEPOLIA REGISTRY...
            </span>
          </div>
        ) : filteredModels.length === 0 ? (
          <div className="border-2 border-foreground p-12 text-center bg-background">
            <Layers size={32} className="mx-auto text-muted-foreground mb-3" />
            <div className="text-sm font-mono font-bold mb-1">No matching models found</div>
            <p className="text-xs font-mono text-muted-foreground max-w-sm mx-auto mb-4">
              Try adjusting your search terms or clearing your status filters.
            </p>
            <button
              onClick={() => {
                setSearchQuery("")
                setFilterType("all")
              }}
              className="text-xs font-mono text-[#ea580c] hover:underline uppercase cursor-pointer"
            >
              Reset Filters
            </button>
          </div>
        ) : (
          <>
            {/* Desktop Table View */}
            <div className="hidden md:block border-2 border-foreground overflow-x-auto bg-background">
              <div className="grid grid-cols-12 gap-0 border-b-2 border-foreground bg-foreground text-background min-w-[750px]">
                <div className="col-span-3 px-4 py-3 text-[10px] tracking-[0.2em] uppercase font-mono font-bold">Model ID</div>
                <div className="col-span-3 px-4 py-3 text-[10px] tracking-[0.2em] uppercase font-mono font-bold">Name</div>
                <div className="col-span-2 px-4 py-3 text-[10px] tracking-[0.2em] uppercase font-mono font-bold">Version</div>
                <div className="col-span-2 px-4 py-3 text-[10px] tracking-[0.2em] uppercase font-mono font-bold">Attestations</div>
                <div className="col-span-2 px-4 py-3 text-[10px] tracking-[0.2em] uppercase font-mono font-bold text-right">Actions</div>
              </div>

              {paginatedModels.map((model) => (
                <div
                  key={model.id}
                  onClick={() => setSelectedModel(model)}
                  className="grid grid-cols-12 gap-0 border-b border-foreground/20 hover:bg-[#ea580c]/5 transition-colors cursor-pointer min-w-[750px] items-center"
                >
                  <div className="col-span-3 px-4 py-4 text-xs font-mono text-muted-foreground truncate flex items-center gap-1.5">
                    <span className={`h-1.5 w-1.5 rounded-full flex-shrink-0 ${model.isActive ? "bg-green-500" : "bg-red-500"}`} />
                    <span className="truncate">{shortenHash(model.id, 6)}</span>
                  </div>
                  <div className="col-span-3 px-4 py-4 text-sm font-mono font-bold truncate text-foreground">
                    {model.name}
                  </div>
                  <div className="col-span-2 px-4 py-4 text-xs font-mono text-[#ea580c] font-semibold">
                    {model.currentVersion}
                  </div>
                  <div className="col-span-2 px-4 py-4 text-xs font-mono font-bold">
                    {String(model.attestationsCount)}
                  </div>
                  <div className="col-span-2 px-4 py-4 flex items-center justify-end gap-2 text-[10px] font-mono">
                    <button
                      onClick={(e) => {
                        e.stopPropagation()
                        setSelectedModel(model)
                      }}
                      className="px-2.5 py-1 border border-foreground/40 hover:border-foreground hover:bg-foreground hover:text-background transition-colors uppercase"
                    >
                      Details
                    </button>
                    <Link
                      href={`/verify?modelId=${model.id}`}
                      onClick={(e) => e.stopPropagation()}
                      className="px-2.5 py-1 bg-foreground text-background hover:bg-[#ea580c] transition-colors uppercase font-bold"
                    >
                      Verify
                    </Link>
                  </div>
                </div>
              ))}
            </div>

            {/* Mobile Card View */}
            <div className="md:hidden flex flex-col gap-3">
              {paginatedModels.map((model) => (
                <div
                  key={model.id}
                  onClick={() => setSelectedModel(model)}
                  className="border-2 border-foreground bg-background cursor-pointer active:scale-[0.99] transition-transform"
                >
                  <div className="flex items-center justify-between px-4 py-2.5 border-b border-foreground/20 bg-foreground text-background">
                    <span className="text-xs font-mono font-bold truncate mr-2">{model.name}</span>
                    <span className="inline-flex items-center gap-1 text-[10px] font-mono uppercase">
                      <span className={`h-1.5 w-1.5 rounded-full ${model.isActive ? "bg-green-400" : "bg-red-400"}`} />
                      {model.isActive ? "Active" : "Inactive"}
                    </span>
                  </div>
                  <div className="p-4 space-y-2 text-xs font-mono">
                    <div className="flex justify-between">
                      <span className="text-muted-foreground uppercase text-[10px]">Version:</span>
                      <span className="font-semibold text-[#ea580c]">{model.currentVersion}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground uppercase text-[10px]">Model ID:</span>
                      <span className="text-muted-foreground">{shortenHash(model.id, 6)}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground uppercase text-[10px]">Attestations:</span>
                      <span className="font-bold">{String(model.attestationsCount)}</span>
                    </div>
                    <div className="pt-2 flex gap-2 border-t border-foreground/10">
                      <button
                        onClick={(e) => {
                          e.stopPropagation()
                          setSelectedModel(model)
                        }}
                        className="flex-1 py-1.5 border border-foreground text-[10px] font-mono uppercase text-center"
                      >
                        Inspect
                      </button>
                      <Link
                        href={`/verify?modelId=${model.id}`}
                        onClick={(e) => e.stopPropagation()}
                        className="flex-1 py-1.5 bg-foreground text-background text-[10px] font-mono uppercase text-center font-bold"
                      >
                        Verify
                      </Link>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {/* Pagination Controls */}
            {totalPages > 1 && (
              <div className="flex items-center justify-between mt-6 border-t border-foreground/20 pt-4">
                <span className="text-xs font-mono text-muted-foreground">
                  Page {currentPage} of {totalPages} ({filteredModels.length} models)
                </span>
                <div className="flex gap-2">
                  <button
                    onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                    disabled={currentPage === 1}
                    className="p-2 border border-foreground disabled:opacity-30 cursor-pointer"
                  >
                    <ChevronLeft size={16} />
                  </button>
                  <button
                    onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
                    disabled={currentPage === totalPages}
                    className="p-2 border border-foreground disabled:opacity-30 cursor-pointer"
                  >
                    <ChevronRight size={16} />
                  </button>
                </div>
              </div>
            )}
          </>
        )}

        {/* Model Detail Drawer / Modal */}
        <AnimatePresence>
          {selectedModel && (
            <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs">
              <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.95 }}
                transition={{ duration: 0.2 }}
                className="w-full max-w-2xl border-2 border-foreground bg-background shadow-2xl max-h-[90vh] overflow-y-auto"
              >
                <div className="flex items-center justify-between px-5 py-3 border-b-2 border-foreground bg-foreground text-background">
                  <div className="flex items-center gap-2">
                    <span className="text-[10px] tracking-widest font-mono uppercase font-bold">
                      MODEL_SPECIFICATION_CARD
                    </span>
                  </div>
                  <button
                    onClick={() => setSelectedModel(null)}
                    className="text-background hover:text-[#ea580c] transition-colors cursor-pointer"
                  >
                    <X size={18} />
                  </button>
                </div>

                <div className="p-6 space-y-6">
                  <div>
                    <div className="flex items-center justify-between mb-1">
                      <h2 className="text-xl font-mono font-bold">{selectedModel.name}</h2>
                      <span className="text-xs font-mono px-2 py-0.5 border border-foreground uppercase font-semibold">
                        {selectedModel.currentVersion}
                      </span>
                    </div>
                    <span className="inline-flex items-center gap-1.5 text-xs font-mono">
                      <span className={`h-2 w-2 rounded-full ${selectedModel.isActive ? "bg-green-500" : "bg-red-500"}`} />
                      {selectedModel.isActive ? "Active Protocol Model" : "Deactivated"}
                    </span>
                  </div>

                  <div className="space-y-3 border border-foreground/20 p-4 bg-foreground/5 text-xs font-mono">
                    <div>
                      <span className="text-[10px] text-muted-foreground uppercase block mb-0.5">Model ID</span>
                      <div className="flex items-center justify-between gap-2 bg-background border p-2">
                        <span className="font-mono text-[11px] break-all">{selectedModel.id}</span>
                        <button
                          onClick={() => copyToClipboard(selectedModel.id)}
                          className="p-1 hover:text-[#ea580c] cursor-pointer flex-shrink-0"
                          title="Copy ID"
                        >
                          {copiedId ? <Check size={14} className="text-green-500" /> : <Copy size={14} />}
                        </button>
                      </div>
                    </div>

                    <div>
                      <span className="text-[10px] text-muted-foreground uppercase block mb-0.5">Owner Address</span>
                      <a
                        href={`https://sepolia.basescan.org/address/${selectedModel.owner}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-[#ea580c] hover:underline flex items-center gap-1 break-all"
                      >
                        {selectedModel.owner}
                        <ExternalLink size={12} />
                      </a>
                    </div>

                    <div>
                      <span className="text-[10px] text-muted-foreground uppercase block mb-0.5">Weights Hash (Commitment)</span>
                      <span className="break-all text-muted-foreground">{selectedModel.modelHash}</span>
                    </div>

                    {selectedModel.metadataURI && (
                      <div>
                        <span className="text-[10px] text-muted-foreground uppercase block mb-0.5">Metadata URI</span>
                        <span className="break-all text-muted-foreground">{selectedModel.metadataURI}</span>
                      </div>
                    )}

                    <div className="grid grid-cols-2 gap-4 pt-2 border-t border-foreground/10">
                      <div>
                        <span className="text-[10px] text-muted-foreground uppercase block">Attestations Recorded</span>
                        <span className="text-sm font-bold">{String(selectedModel.attestationsCount)}</span>
                      </div>
                      <div>
                        <span className="text-[10px] text-muted-foreground uppercase block">Versions Released</span>
                        <span className="text-sm font-bold">{String(selectedModel.totalVersions)}</span>
                      </div>
                    </div>
                  </div>

                  {/* Actions inside Modal */}
                  <div className="flex flex-col sm:flex-row gap-3 pt-2">
                    <Link
                      href={`/verify?modelId=${selectedModel.id}`}
                      className="flex-1 py-3 bg-foreground text-background text-xs font-mono uppercase font-bold tracking-wider hover:bg-[#ea580c] hover:text-white transition-colors text-center inline-flex items-center justify-center gap-2"
                    >
                      <ShieldCheck size={14} />
                      Verify Prediction
                    </Link>
                    <Link
                      href={`/attest?modelId=${selectedModel.id}`}
                      className="flex-1 py-3 border-2 border-foreground text-foreground text-xs font-mono uppercase font-bold tracking-wider hover:bg-foreground hover:text-background transition-colors text-center inline-flex items-center justify-center gap-2"
                    >
                      Issue Attestation
                      <ArrowRight size={14} />
                    </Link>
                  </div>
                </div>
              </motion.div>
            </div>
          )}
        </AnimatePresence>
      </main>
    </div>
  )
}
