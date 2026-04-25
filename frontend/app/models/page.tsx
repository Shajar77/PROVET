"use client"

import { Navbar } from "@/components/navbar"
import { motion, AnimatePresence } from "framer-motion"
import { useState, useMemo, useEffect } from "react"
import { Search, Filter, ChevronLeft, ChevronRight, X } from "lucide-react"
import { createProvet } from "@/lib/sdk"
import type { Model } from "@/lib/types"

const ease = [0.22, 1, 0.36, 1] as const
const ITEMS_PER_PAGE = 8

// Fallback mock data - used when contract isn't deployed or no models exist
const MOCK_MODELS = [
  { id: "0x1234567890abcdef1234567890abcdef1234567890abcdef1234567890abcd01" as `0x${string}`, name: "Fraud Detection v2.1", currentVersion: "v2.1.0", owner: "0x89ac...4c100" as `0x${string}`, registeredAt: BigInt(1705276800), isActive: true, modelHash: "0x00" as `0x${string}`, metadataURI: "", updatedAt: BigInt(0), totalVersions: BigInt(1), attestationsCount: BigInt(12) },
  { id: "0xabcdef0123456789abcdef0123456789abcdef0123456789abcdef01234567" as `0x${string}`, name: "Credit Risk Model", currentVersion: "v1.5.2", owner: "0x742d...8f901" as `0x${string}`, registeredAt: BigInt(1705017600), isActive: true, modelHash: "0x00" as `0x${string}`, metadataURI: "", updatedAt: BigInt(0), totalVersions: BigInt(3), attestationsCount: BigInt(45) },
  { id: "0x9876543210fedcba9876543210fedcba9876543210fedcba9876543210fedc" as `0x${string}`, name: "Content Moderator", currentVersion: "v3.0.1", owner: "0x1234...5678" as `0x${string}`, registeredAt: BigInt(1704844800), isActive: true, modelHash: "0x00" as `0x${string}`, metadataURI: "", updatedAt: BigInt(0), totalVersions: BigInt(5), attestationsCount: BigInt(128) },
  { id: "0x2468ace013579bdf2468ace013579bdf2468ace013579bdf2468ace013579b" as `0x${string}`, name: "Sentiment Analysis", currentVersion: "v4.2.0", owner: "0x5678...9def0" as `0x${string}`, registeredAt: BigInt(1704672000), isActive: true, modelHash: "0x00" as `0x${string}`, metadataURI: "", updatedAt: BigInt(0), totalVersions: BigInt(2), attestationsCount: BigInt(89) },
  { id: "0x1357bd2468ace0f1357bd2468ace0f1357bd2468ace0f1357bd2468ace0f13" as `0x${string}`, name: "Price Prediction", currentVersion: "v2.0.3", owner: "0xabcd...12345" as `0x${string}`, registeredAt: BigInt(1704412800), isActive: false, modelHash: "0x00" as `0x${string}`, metadataURI: "", updatedAt: BigInt(0), totalVersions: BigInt(1), attestationsCount: BigInt(0) },
  { id: "0x9f8e7d6c5b4a39281706050403020100f1e2d3c4b5a69788796a5b4c3d2e" as `0x${string}`, name: "Document Classifier", currentVersion: "v1.8.5", owner: "0xdef0...67890" as `0x${string}`, registeredAt: BigInt(1704240000), isActive: true, modelHash: "0x00" as `0x${string}`, metadataURI: "", updatedAt: BigInt(0), totalVersions: BigInt(4), attestationsCount: BigInt(67) },
  { id: "0x5a4b3c2d1e0f9a8b7c6d5e4f3a2b1c0d9e8f7a6b5c4d3e2f1a0b9c8d7e6f" as `0x${string}`, name: "Image Recognition", currentVersion: "v5.1.0", owner: "0x1357...9aceb" as `0x${string}`, registeredAt: BigInt(1703721600), isActive: true, modelHash: "0x00" as `0x${string}`, metadataURI: "", updatedAt: BigInt(0), totalVersions: BigInt(6), attestationsCount: BigInt(234) },
  { id: "0x246ab8f37e9c1d0a5b4c3d2e1f0a9b8c7d6e5f4a3b2c1d0e9f8a7b6c5d4e" as `0x${string}`, name: "Medical Diagnosis", currentVersion: "v3.4.1", owner: "0xfedc...ba987" as `0x${string}`, registeredAt: BigInt(1703462400), isActive: true, modelHash: "0x00" as `0x${string}`, metadataURI: "", updatedAt: BigInt(0), totalVersions: BigInt(2), attestationsCount: BigInt(56) },
  { id: "0x7e8f9a0b1c2d3e4f5a6b7c8d9e0f1a2b3c4d5e6f7a8b9c0d1e2f3a4b5c6d" as `0x${string}`, name: "Spam Filter Pro", currentVersion: "v6.0.0", owner: "0x2468...13579" as `0x${string}`, registeredAt: BigInt(1702944000), isActive: false, modelHash: "0x00" as `0x${string}`, metadataURI: "", updatedAt: BigInt(0), totalVersions: BigInt(1), attestationsCount: BigInt(0) },
  { id: "0xc4d5e6f78a9b0c1d2e3f4a5b6c7d8e9f0a1b2c3d4e5f6a7b8c9d0e1f2a3b" as `0x${string}`, name: "Recommendation Engine", currentVersion: "v2.3.4", owner: "0xa1b2...c3d4e" as `0x${string}`, registeredAt: BigInt(1702771200), isActive: true, modelHash: "0x00" as `0x${string}`, metadataURI: "", updatedAt: BigInt(0), totalVersions: BigInt(3), attestationsCount: BigInt(178) },
]

type FilterType = "all" | "active" | "inactive"

function shortenHash(hash: string, chars = 6): string {
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
  const [dataSource, setDataSource] = useState<"chain" | "mock">("mock")

  // Fetch models from chain on mount
  useEffect(() => {
    async function fetchModels() {
      setIsLoading(true)
      try {
        const sdk = createProvet({ chain: "baseSepolia" })
        const chainModels = await sdk.getAllModels()
        
        if (chainModels.length > 0) {
          setModels(chainModels)
          setDataSource("chain")
        } else {
          // No models on chain, use mock data
          setModels(MOCK_MODELS as unknown as Model[])
          setDataSource("mock")
        }
      } catch (error) {
        console.error("Failed to fetch from chain, using mock data:", error)
        setModels(MOCK_MODELS as unknown as Model[])
        setDataSource("mock")
      } finally {
        setIsLoading(false)
      }
    }

    fetchModels()
  }, [])

  // Filter & search logic
  const filteredModels = useMemo(() => {
    let result = [...models]

    // Apply status filter
    if (filterType === "active") {
      result = result.filter((m) => m.isActive)
    } else if (filterType === "inactive") {
      result = result.filter((m) => !m.isActive)
    }

    // Apply search
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
  useEffect(() => {
    setCurrentPage(1)
  }, [searchQuery, filterType])

  const activeCount = models.filter((m) => m.isActive).length
  const inactiveCount = models.filter((m) => !m.isActive).length

  return (
    <div className="min-h-screen dot-grid-bg">
      <Navbar />
      <main className="w-full px-4 sm:px-6 py-8 sm:py-12 lg:px-12">
        {/* Section label */}
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.5, ease }}
          className="flex items-center gap-2 sm:gap-4 mb-6 sm:mb-8"
        >
          <span className="text-[10px] tracking-[0.2em] uppercase text-muted-foreground font-mono">
            {"// SECTION: REGISTERED_MODELS"}
          </span>
          <div className="flex-1 border-t border-border" />
          {dataSource === "chain" && (
            <span className="text-[9px] tracking-[0.15em] uppercase text-[#ea580c] font-mono">ON-CHAIN</span>
          )}
          <span className="text-[10px] tracking-[0.2em] uppercase text-muted-foreground font-mono">
            010
          </span>
        </motion.div>

        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.1, ease }}
          className="mb-6 sm:mb-8"
        >
          <h1 className="font-pixel text-2xl sm:text-3xl lg:text-5xl tracking-tight text-foreground mb-3 sm:mb-4">
            MODEL REGISTRY
          </h1>
          <p className="text-xs lg:text-sm text-muted-foreground max-w-lg font-mono">
            Browse all AI models registered on-chain. Each model is cryptographically hashed and version-controlled.
          </p>
        </motion.div>

        {/* Search & Filter Bar */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.15, ease }}
          className="mb-6"
        >
          <div className="flex flex-col sm:flex-row gap-3">
            {/* Search input */}
            <div className="flex-1 flex items-center border-2 border-foreground">
              <span className="flex items-center justify-center w-10 h-10 border-r-2 border-foreground flex-shrink-0">
                <Search size={14} strokeWidth={1.5} className="text-muted-foreground" />
              </span>
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search by name, version, ID, or owner..."
                className="flex-1 px-3 py-2 bg-transparent text-xs font-mono focus:outline-none min-w-0"
              />
              {searchQuery && (
                <button
                  onClick={() => setSearchQuery("")}
                  className="px-3 text-muted-foreground hover:text-foreground transition-colors"
                >
                  <X size={14} />
                </button>
              )}
            </div>

            {/* Filter toggle */}
            <button
              onClick={() => setShowFilters(!showFilters)}
              className={`flex items-center gap-2 px-4 py-2 border-2 text-xs font-mono tracking-wider uppercase transition-colors flex-shrink-0 ${
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

          {/* Filter options */}
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
                      className={`text-[10px] font-mono tracking-wider px-3 py-1.5 border transition-colors ${
                        filterType === f.value
                          ? "border-[#ea580c] bg-[#ea580c] text-background"
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
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="border-2 border-foreground p-12 flex flex-col items-center gap-4"
          >
            <span className="h-6 w-6 border-2 border-foreground/30 border-t-[#ea580c] rounded-full animate-spin" />
            <span className="text-xs font-mono tracking-widest uppercase text-muted-foreground">
              QUERYING BLOCKCHAIN...
            </span>
          </motion.div>
        ) : (
          <>
            {/* Empty state */}
            {filteredModels.length === 0 ? (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="border-2 border-foreground/30 p-8 sm:p-12 text-center"
              >
                <span className="text-xs font-mono tracking-widest uppercase text-muted-foreground">
                  {searchQuery || filterType !== "all"
                    ? "NO MODELS MATCH YOUR CRITERIA"
                    : "NO MODELS REGISTERED YET"
                  }
                </span>
                {(searchQuery || filterType !== "all") && (
                  <button
                    onClick={() => { setSearchQuery(""); setFilterType("all") }}
                    className="mt-4 block mx-auto text-[10px] font-mono tracking-wider uppercase text-[#ea580c] hover:underline"
                  >
                    CLEAR FILTERS
                  </button>
                )}
              </motion.div>
            ) : (
              <>
                {/* Desktop Table */}
                <motion.div
                  initial={{ opacity: 0, y: 30 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.6, delay: 0.2, ease }}
                  className="hidden md:block border-2 border-foreground overflow-x-auto"
                >
                  <div className="grid grid-cols-12 gap-0 border-b-2 border-foreground bg-foreground text-background min-w-[650px]">
                    <div className="col-span-3 px-4 py-3 text-[10px] tracking-[0.2em] uppercase font-mono">Model ID</div>
                    <div className="col-span-3 px-4 py-3 text-[10px] tracking-[0.2em] uppercase font-mono">Name</div>
                    <div className="col-span-2 px-4 py-3 text-[10px] tracking-[0.2em] uppercase font-mono">Version</div>
                    <div className="col-span-3 px-4 py-3 text-[10px] tracking-[0.2em] uppercase font-mono">Owner</div>
                    <div className="col-span-1 px-4 py-3 text-[10px] tracking-[0.2em] uppercase font-mono">Status</div>
                  </div>
                  {paginatedModels.map((model, i) => (
                    <motion.div
                      key={model.id}
                      initial={{ opacity: 0, x: -10 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: i * 0.03, duration: 0.3, ease }}
                      className="grid grid-cols-12 gap-0 border-b border-foreground/30 hover:bg-foreground/5 transition-colors min-w-[650px]"
                    >
                      <div className="col-span-3 px-4 py-4 text-xs font-mono text-muted-foreground truncate">{shortenHash(model.id)}</div>
                      <div className="col-span-3 px-4 py-4 text-sm font-mono font-semibold truncate">{model.name}</div>
                      <div className="col-span-2 px-4 py-4 text-xs font-mono text-muted-foreground">{model.currentVersion}</div>
                      <div className="col-span-3 px-4 py-4 text-xs font-mono text-muted-foreground truncate">{shortenHash(model.owner)}</div>
                      <div className="col-span-1 px-4 py-4">
                        <span className="inline-flex items-center gap-1.5">
                          <span className={`h-1.5 w-1.5 rounded-full ${model.isActive ? "bg-green-500" : "bg-red-500"}`} />
                          <span className="text-[10px] font-mono uppercase">{model.isActive ? "Active" : "Inactive"}</span>
                        </span>
                      </div>
                    </motion.div>
                  ))}
                </motion.div>

                {/* Mobile Card Layout */}
                <motion.div
                  initial={{ opacity: 0, y: 30 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.6, delay: 0.2, ease }}
                  className="md:hidden flex flex-col gap-3"
                >
                  {paginatedModels.map((model, i) => (
                    <motion.div
                      key={model.id}
                      initial={{ opacity: 0, y: 16 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: i * 0.04, duration: 0.3, ease }}
                      className="border-2 border-foreground"
                    >
                      <div className="flex items-center justify-between px-4 py-2.5 border-b border-foreground/30 bg-foreground text-background">
                        <span className="text-xs font-mono font-semibold truncate mr-2">{model.name}</span>
                        <span className="inline-flex items-center gap-1.5 flex-shrink-0">
                          <span className={`h-1.5 w-1.5 rounded-full ${model.isActive ? "bg-green-400" : "bg-red-400"}`} />
                          <span className="text-[10px] font-mono uppercase">{model.isActive ? "Active" : "Inactive"}</span>
                        </span>
                      </div>
                      <div className="px-4 py-3 space-y-2">
                        <div className="flex items-center justify-between gap-2">
                          <span className="text-[10px] tracking-[0.15em] uppercase text-muted-foreground font-mono">ID</span>
                          <span className="text-xs font-mono text-muted-foreground truncate">{shortenHash(model.id, 8)}</span>
                        </div>
                        <div className="flex items-center justify-between gap-2">
                          <span className="text-[10px] tracking-[0.15em] uppercase text-muted-foreground font-mono">Version</span>
                          <span className="text-xs font-mono">{model.currentVersion}</span>
                        </div>
                        <div className="flex items-center justify-between gap-2">
                          <span className="text-[10px] tracking-[0.15em] uppercase text-muted-foreground font-mono">Owner</span>
                          <span className="text-xs font-mono text-muted-foreground truncate">{shortenHash(model.owner)}</span>
                        </div>
                        <div className="flex items-center justify-between gap-2">
                          <span className="text-[10px] tracking-[0.15em] uppercase text-muted-foreground font-mono">Attestations</span>
                          <span className="text-xs font-mono font-semibold">{String(model.attestationsCount)}</span>
                        </div>
                      </div>
                    </motion.div>
                  ))}
                </motion.div>

                {/* Pagination */}
                {totalPages > 1 && (
                  <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 0.3, duration: 0.4 }}
                    className="flex items-center justify-between mt-6 gap-4"
                  >
                    <span className="text-[10px] font-mono tracking-wider uppercase text-muted-foreground">
                      PAGE {currentPage} OF {totalPages} • {filteredModels.length} RESULT{filteredModels.length !== 1 ? "S" : ""}
                    </span>
                    <div className="flex items-center gap-0">
                      <button
                        onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}
                        disabled={currentPage === 1}
                        className="w-9 h-9 flex items-center justify-center border-2 border-foreground disabled:opacity-30 disabled:cursor-not-allowed hover:bg-foreground/5 transition-colors"
                      >
                        <ChevronLeft size={14} />
                      </button>
                      {Array.from({ length: Math.min(totalPages, 5) }, (_, i) => {
                        let page: number
                        if (totalPages <= 5) {
                          page = i + 1
                        } else if (currentPage <= 3) {
                          page = i + 1
                        } else if (currentPage >= totalPages - 2) {
                          page = totalPages - 4 + i
                        } else {
                          page = currentPage - 2 + i
                        }
                        return (
                          <button
                            key={page}
                            onClick={() => setCurrentPage(page)}
                            className={`w-9 h-9 flex items-center justify-center border-y-2 border-r-2 border-foreground text-[10px] font-mono transition-colors ${
                              page === currentPage
                                ? "bg-foreground text-background"
                                : "hover:bg-foreground/5"
                            }`}
                          >
                            {page}
                          </button>
                        )
                      })}
                      <button
                        onClick={() => setCurrentPage(Math.min(totalPages, currentPage + 1))}
                        disabled={currentPage === totalPages}
                        className="w-9 h-9 flex items-center justify-center border-2 border-l-0 border-foreground disabled:opacity-30 disabled:cursor-not-allowed hover:bg-foreground/5 transition-colors"
                      >
                        <ChevronRight size={14} />
                      </button>
                    </div>
                  </motion.div>
                )}
              </>
            )}

            {/* Stats */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.5, ease }}
              className="flex flex-wrap items-center gap-4 sm:gap-6 mt-6 sm:mt-8"
            >
              <div className="flex items-center gap-2">
                <span className="text-[10px] tracking-[0.2em] uppercase text-muted-foreground font-mono">TOTAL:</span>
                <span className="text-sm font-mono font-bold">{models.length}</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="h-1.5 w-1.5 bg-green-500 rounded-full" />
                <span className="text-[10px] tracking-[0.2em] uppercase text-muted-foreground font-mono">ACTIVE:</span>
                <span className="text-sm font-mono font-bold">{activeCount}</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="h-1.5 w-1.5 bg-red-500 rounded-full" />
                <span className="text-[10px] tracking-[0.2em] uppercase text-muted-foreground font-mono">INACTIVE:</span>
                <span className="text-sm font-mono font-bold">{inactiveCount}</span>
              </div>
              <div className="flex-1 border-t border-border" />
              <span className="text-[9px] font-mono tracking-wider uppercase text-muted-foreground">
                SOURCE: {dataSource === "chain" ? "BASE_SEPOLIA" : "MOCK_DATA"}
              </span>
            </motion.div>
          </>
        )}
      </main>
    </div>
  )
}
