"use client"

import { Navbar } from "@/components/navbar"
import { motion } from "framer-motion"
import { useState, useEffect, useCallback, Suspense } from "react"
import { Plus, RefreshCw, Layers, ShieldCheck, Power } from "lucide-react"
import { useAccount } from "wagmi"
import { keccak256, toBytes, Hash } from "viem"
import { createRovet } from "@/lib/sdk"
import { useTransaction } from "@/hooks/use-transaction"
import { useWeb3Context } from "@/app/web3-context"
import { useSearchParams } from "next/navigation"
import type { Model } from "@/lib/types"
import toast from "react-hot-toast"
import Link from "next/link"

const ease = [0.22, 1, 0.36, 1] as const

type StudioTab = "my-models" | "register" | "new-version"

function DashboardContent() {
  const searchParams = useSearchParams()
  const initialTab = (searchParams.get("tab") as StudioTab) || "my-models"

  const { enableWeb3 } = useWeb3Context()
  const { isConnected, address } = useAccount()

  const [activeTab, setActiveTab] = useState<StudioTab>(initialTab)
  const [myModels, setMyModels] = useState<Model[]>([])
  const [loadingModels, setLoadingModels] = useState(false)
  const [selectedModelId, setSelectedModelId] = useState<string>("")

  // Form states
  const [registerForm, setRegisterForm] = useState({
    name: "",
    version: "v1.0.0",
    rawWeightsDesc: "",
    metadataURI: "ipfs://",
    tags: "llm, transformer, fraud-detection",
  })

  const [versionForm, setVersionForm] = useState({
    modelId: "",
    newVersion: "v1.1.0",
    changeNotes: "Model weights retrained on expanded dataset; accuracy improved to 99.1%",
    rawWeightsDesc: "",
    metadataURI: "ipfs://",
  })

  // Load models owned by current wallet
  const fetchMyModels = useCallback(async () => {
    if (!isConnected || !address) return
    setLoadingModels(true)
    try {
      const sdk = createRovet({ chain: "baseSepolia" })
      const modelIds = await sdk.getOwnerModels(address as `0x${string}`)
      const modelsData = await Promise.all(
        modelIds.map(async (id) => {
          const m = await sdk.getModel(id)
          return m
        })
      )
      const validModels = modelsData.filter((m): m is Model => m !== null)
      setMyModels(validModels)
      if (validModels.length > 0 && !selectedModelId) {
        setSelectedModelId(validModels[0].id)
        setVersionForm((prev) => ({ ...prev, modelId: validModels[0].id }))
      }
    } catch (err) {
      console.warn("Could not fetch owner models:", err)
    } finally {
      setLoadingModels(false)
    }
  }, [isConnected, address, selectedModelId])

  useEffect(() => {
    if (!isConnected) return
    const timer = setTimeout(() => {
      fetchMyModels()
    }, 0)
    return () => clearTimeout(timer)
  }, [isConnected, fetchMyModels])

  // Handle Model Registration
  const { isLoading: isRegistering, execute: executeRegister } = useTransaction({
    successMessage: "Model registered successfully on Base Sepolia!",
    errorMessage: "Failed to register model",
    onSuccess: () => {
      fetchMyModels()
      setActiveTab("my-models")
      setRegisterForm({
        name: "",
        version: "v1.0.0",
        rawWeightsDesc: "",
        metadataURI: "ipfs://",
        tags: "",
      })
    },
  })

  const handleRegisterSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!registerForm.name || !registerForm.version) return

    if (!isConnected) {
      enableWeb3()
      toast.error("Please connect your wallet first")
      return
    }

    const sdk = createRovet({ chain: "baseSepolia" })
    const seed = registerForm.rawWeightsDesc.trim() || `${registerForm.name}:${registerForm.version}:${Date.now()}`
    const modelHash = keccak256(toBytes(seed))
    const tagsArray = registerForm.tags
      .split(",")
      .map((t) => t.trim())
      .filter(Boolean)

    await executeRegister(async () => {
      return await sdk.registerModel({
        name: registerForm.name,
        version: registerForm.version,
        modelHash,
        metadataURI: registerForm.metadataURI,
        tags: tagsArray,
      })
    })
  }

  // Handle Version Update
  const { isLoading: isUpdatingVersion, execute: executeVersionUpdate } = useTransaction({
    successMessage: "Model version released on-chain!",
    errorMessage: "Failed to update version",
    onSuccess: () => {
      fetchMyModels()
      setActiveTab("my-models")
    },
  })

  const handleVersionSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!versionForm.modelId || !versionForm.newVersion) return

    const sdk = createRovet({ chain: "baseSepolia" })
    const seed = versionForm.rawWeightsDesc.trim() || `${versionForm.modelId}:${versionForm.newVersion}:${Date.now()}`
    const newVersionHash = keccak256(toBytes(seed))

    await executeVersionUpdate(async () => {
      return await sdk.updateModelVersion(versionForm.modelId as Hash, {
        newVersion: versionForm.newVersion,
        newVersionHash,
        changeNotes: versionForm.changeNotes,
        newMetadataURI: versionForm.metadataURI,
      })
    })
  }

  // Handle Toggle Active/Inactive
  const handleToggleStatus = async (model: Model) => {
    const sdk = createRovet({ chain: "baseSepolia" })
    try {
      if (model.isActive) {
        toast.loading("Deactivating model on-chain...", { id: "toggle" })
        const res = await sdk.deactivateModel(model.id)
        if (res.success) {
          toast.success("Model deactivated", { id: "toggle" })
          fetchMyModels()
        } else {
          toast.error(res.error || "Failed to deactivate", { id: "toggle" })
        }
      } else {
        toast.loading("Reactivating model on-chain...", { id: "toggle" })
        const res = await sdk.reactivateModel(model.id)
        if (res.success) {
          toast.success("Model reactivated", { id: "toggle" })
          fetchMyModels()
        } else {
          toast.error(res.error || "Failed to reactivate", { id: "toggle" })
        }
      }
    } catch {
      toast.error("Status update failed", { id: "toggle" })
    }
  }

  return (
    <div className="w-full px-4 sm:px-6 py-8 sm:py-12 lg:px-12 max-w-6xl mx-auto">
      {/* Section label */}
      <motion.div
        initial={{ opacity: 0, x: -20 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ duration: 0.5, ease }}
        className="flex items-center gap-2 sm:gap-4 mb-6 sm:mb-8"
      >
        <span className="text-[10px] tracking-[0.2em] uppercase text-muted-foreground font-mono">
          {"// STUDIO: CREATOR_CONTROL_CENTER"}
        </span>
        <div className="flex-1 border-t border-border" />
        <span className="text-[10px] tracking-[0.2em] uppercase text-[#ea580c] font-mono">
          MODEL MANAGEMENT
        </span>
      </motion.div>

      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, delay: 0.1, ease }}
        className="mb-8"
      >
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h1 className="font-pixel text-2xl sm:text-3xl lg:text-5xl tracking-tight text-foreground mb-3">
              CREATOR STUDIO
            </h1>
            <p className="text-xs lg:text-sm text-muted-foreground max-w-xl font-mono">
              Register new neural architectures, release verifiable version upgrades, and monitor on-chain attestations.
            </p>
          </div>

          <div className="flex items-center gap-2">
            <Link
              href="/attest"
              className="flex items-center gap-2 px-3.5 py-2.5 bg-[#ea580c] text-white text-xs font-mono font-bold uppercase tracking-wider hover:bg-[#c2410c] transition-colors"
            >
              <ShieldCheck size={14} />
              Issue Attestation
            </Link>
          </div>
        </div>
      </motion.div>

      {/* Wallet Guard Banner */}
      {!isConnected && (
        <div className="border-2 border-foreground bg-foreground/5 p-6 mb-8 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 text-xs font-mono font-bold uppercase mb-1">
              <span className="h-2 w-2 bg-yellow-500 rounded-full" />
              WALLET DISCONNECTED
            </div>
            <p className="text-xs font-mono text-muted-foreground">
              Connect your Web3 wallet to manage your AI models and sign inference attestations.
            </p>
          </div>
          <button
            onClick={enableWeb3}
            className="px-5 py-2.5 bg-foreground text-background text-xs font-mono font-bold uppercase tracking-wider hover:bg-[#ea580c] hover:text-white transition-colors cursor-pointer"
          >
            Connect Wallet
          </button>
        </div>
      )}

      {/* Tabs */}
      <div className="flex border-b-2 border-foreground mb-8 overflow-x-auto">
        <button
          onClick={() => setActiveTab("my-models")}
          className={`flex items-center gap-2 px-6 py-3 text-xs font-mono uppercase tracking-wider transition-colors cursor-pointer whitespace-nowrap ${
            activeTab === "my-models"
              ? "bg-foreground text-background font-bold"
              : "text-muted-foreground hover:text-foreground"
          }`}
        >
          <Layers size={14} />
          My Models ({myModels.length})
        </button>
        <button
          onClick={() => setActiveTab("register")}
          className={`flex items-center gap-2 px-6 py-3 text-xs font-mono uppercase tracking-wider transition-colors cursor-pointer whitespace-nowrap ${
            activeTab === "register"
              ? "bg-foreground text-background font-bold"
              : "text-muted-foreground hover:text-foreground"
          }`}
        >
          <Plus size={14} />
          Register New Model
        </button>
        <button
          onClick={() => setActiveTab("new-version")}
          className={`flex items-center gap-2 px-6 py-3 text-xs font-mono uppercase tracking-wider transition-colors cursor-pointer whitespace-nowrap ${
            activeTab === "new-version"
              ? "bg-foreground text-background font-bold"
              : "text-muted-foreground hover:text-foreground"
          }`}
        >
          <RefreshCw size={14} />
          Release Version Update
        </button>
      </div>

      {/* Tab 1: My Models */}
      {activeTab === "my-models" && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.3 }}
          className="space-y-4"
        >
          <div className="flex items-center justify-between">
            <span className="text-[10px] font-mono tracking-widest uppercase text-muted-foreground">
              MODELS REGISTERED BY YOUR WALLET
            </span>
            <button
              onClick={fetchMyModels}
              disabled={loadingModels}
              className="text-[10px] font-mono uppercase text-[#ea580c] hover:underline flex items-center gap-1 cursor-pointer"
            >
              <RefreshCw size={10} className={loadingModels ? "animate-spin" : ""} />
              Refresh
            </button>
          </div>

          {loadingModels ? (
            <div className="border-2 border-foreground p-12 text-center font-mono text-xs text-muted-foreground">
              <span className="h-5 w-5 border-2 border-foreground/30 border-t-[#ea580c] rounded-full animate-spin inline-block mb-3" />
              <div>Fetching your models from Base Sepolia...</div>
            </div>
          ) : myModels.length === 0 ? (
            <div className="border-2 border-foreground p-12 text-center space-y-4">
              <Layers size={32} className="mx-auto text-muted-foreground/60" />
              <div className="text-sm font-mono font-bold">No models found for this wallet</div>
              <p className="text-xs font-mono text-muted-foreground max-w-md mx-auto">
                You haven&apos;t registered any models yet with {address ? `${address.slice(0, 6)}...${address.slice(-4)}` : "this wallet"}.
                Register your first model to begin issuing cryptographic attestations.
              </p>
              <button
                onClick={() => setActiveTab("register")}
                className="inline-flex items-center gap-2 px-5 py-2.5 bg-foreground text-background text-xs font-mono font-bold uppercase tracking-wider hover:bg-[#ea580c] hover:text-white transition-colors cursor-pointer"
              >
                <Plus size={14} />
                Register First Model
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {myModels.map((model) => (
                <div key={model.id} className="border-2 border-foreground p-5 space-y-4 bg-background">
                  <div className="flex items-start justify-between gap-2">
                    <div>
                      <h3 className="text-base font-mono font-bold truncate">{model.name}</h3>
                      <span className="text-xs font-mono text-[#ea580c] font-semibold">{model.currentVersion}</span>
                    </div>
                    <span className="inline-flex items-center gap-1.5 px-2 py-1 border text-[10px] font-mono uppercase">
                      <span className={`h-1.5 w-1.5 rounded-full ${model.isActive ? "bg-green-500" : "bg-red-500"}`} />
                      {model.isActive ? "ACTIVE" : "INACTIVE"}
                    </span>
                  </div>

                  <div className="space-y-1.5 text-xs font-mono text-muted-foreground">
                    <div className="truncate">
                      <span className="text-[10px] uppercase text-foreground font-semibold">ID: </span>
                      {model.id}
                    </div>
                    <div className="flex items-center justify-between text-foreground">
                      <span>Total Attestations:</span>
                      <span className="font-bold">{String(model.attestationsCount)}</span>
                    </div>
                    <div className="flex items-center justify-between text-foreground">
                      <span>Total Versions:</span>
                      <span className="font-bold">{String(model.totalVersions)}</span>
                    </div>
                  </div>

                  <div className="flex flex-wrap gap-2 pt-2 border-t border-foreground/10">
                    <Link
                      href={`/attest?modelId=${model.id}`}
                      className="px-3 py-1.5 bg-foreground text-background text-[11px] font-mono uppercase tracking-wider hover:bg-[#ea580c] hover:text-white transition-colors inline-flex items-center gap-1"
                    >
                      <ShieldCheck size={12} />
                      Attest
                    </Link>
                    <button
                      onClick={() => {
                        setVersionForm((prev) => ({ ...prev, modelId: model.id }))
                        setActiveTab("new-version")
                      }}
                      className="px-3 py-1.5 border border-foreground text-[11px] font-mono uppercase tracking-wider hover:bg-foreground hover:text-background transition-colors cursor-pointer"
                    >
                      New Version
                    </button>
                    <button
                      onClick={() => handleToggleStatus(model)}
                      className="px-3 py-1.5 border border-foreground/30 text-[11px] font-mono uppercase tracking-wider hover:text-red-500 hover:border-red-500 transition-colors ml-auto cursor-pointer"
                      title={model.isActive ? "Deactivate model" : "Reactivate model"}
                    >
                      <Power size={12} />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </motion.div>
      )}

      {/* Tab 2: Register New Model */}
      {activeTab === "register" && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.3 }}
          className="border-2 border-foreground bg-background"
        >
          <div className="flex items-center justify-between px-5 py-3 border-b-2 border-foreground bg-foreground text-background">
            <span className="text-[10px] tracking-[0.2em] uppercase font-mono font-bold">
              NEW_MODEL_SPECIFICATION
            </span>
            <span className="text-[10px] font-mono text-[#ea580c] uppercase">BASE SEPOLIA</span>
          </div>

          <form onSubmit={handleRegisterSubmit} className="p-6 space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <label className="text-[10px] tracking-[0.2em] uppercase text-muted-foreground font-mono">
                  MODEL_NAME *
                </label>
                <input
                  type="text"
                  value={registerForm.name}
                  onChange={(e) => setRegisterForm({ ...registerForm, name: e.target.value })}
                  placeholder="e.g., Llama-3-MedGuard"
                  required
                  className="w-full px-4 py-3 bg-transparent border-2 border-foreground text-xs font-mono focus:outline-none focus:border-[#ea580c]"
                />
              </div>

              <div className="space-y-2">
                <label className="text-[10px] tracking-[0.2em] uppercase text-muted-foreground font-mono">
                  INITIAL_VERSION *
                </label>
                <input
                  type="text"
                  value={registerForm.version}
                  onChange={(e) => setRegisterForm({ ...registerForm, version: e.target.value })}
                  placeholder="v1.0.0"
                  required
                  className="w-full px-4 py-3 bg-transparent border-2 border-foreground text-xs font-mono focus:outline-none focus:border-[#ea580c]"
                />
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-[10px] tracking-[0.2em] uppercase text-muted-foreground font-mono">
                MODEL_WEIGHTS_COMMITMENT (OPTIONAL SEED OR HASH)
              </label>
              <input
                type="text"
                value={registerForm.rawWeightsDesc}
                onChange={(e) => setRegisterForm({ ...registerForm, rawWeightsDesc: e.target.value })}
                placeholder="SHA-256 of checkpoint weights file or leave empty to auto-generate unique hash"
                className="w-full px-4 py-3 bg-transparent border-2 border-foreground text-xs font-mono focus:outline-none focus:border-[#ea580c]"
              />
              <span className="text-[10px] font-mono text-muted-foreground block">
                A keccak256 hash is computed and stored permanently as the model&apos;s identity on Base.
              </span>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <label className="text-[10px] tracking-[0.2em] uppercase text-muted-foreground font-mono">
                  TAGS (COMMA SEPARATED)
                </label>
                <input
                  type="text"
                  value={registerForm.tags}
                  onChange={(e) => setRegisterForm({ ...registerForm, tags: e.target.value })}
                  placeholder="e.g., vision, fraud, medical"
                  className="w-full px-4 py-3 bg-transparent border-2 border-foreground text-xs font-mono focus:outline-none focus:border-[#ea580c]"
                />
              </div>

              <div className="space-y-2">
                <label className="text-[10px] tracking-[0.2em] uppercase text-muted-foreground font-mono">
                  METADATA_URI (IPFS)
                </label>
                <input
                  type="text"
                  value={registerForm.metadataURI}
                  onChange={(e) => setRegisterForm({ ...registerForm, metadataURI: e.target.value })}
                  placeholder="ipfs://Qm..."
                  className="w-full px-4 py-3 bg-transparent border-2 border-foreground text-xs font-mono focus:outline-none focus:border-[#ea580c]"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={isRegistering || !registerForm.name || !registerForm.version}
              className="w-full flex items-center justify-center gap-2 py-3.5 bg-foreground text-background text-xs font-mono font-bold uppercase tracking-wider hover:bg-[#ea580c] hover:text-white transition-colors disabled:opacity-50 cursor-pointer"
            >
              {isRegistering ? (
                <>
                  <span className="h-4 w-4 border-2 border-background border-t-transparent rounded-full animate-spin" />
                  CONFIRMING ON BASE SEPOLIA...
                </>
              ) : (
                <>
                  <Plus size={16} />
                  REGISTER MODEL ARCHITECTURE ON-CHAIN
                </>
              )}
            </button>
          </form>
        </motion.div>
      )}

      {/* Tab 3: Release Version Update */}
      {activeTab === "new-version" && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.3 }}
          className="border-2 border-foreground bg-background"
        >
          <div className="flex items-center justify-between px-5 py-3 border-b-2 border-foreground bg-foreground text-background">
            <span className="text-[10px] tracking-[0.2em] uppercase font-mono font-bold">
              RELEASE_NEW_VERSION
            </span>
            <span className="text-[10px] font-mono text-[#ea580c] uppercase">IMMUTABLE LOG</span>
          </div>

          <form onSubmit={handleVersionSubmit} className="p-6 space-y-6">
            <div className="space-y-2">
              <label className="text-[10px] tracking-[0.2em] uppercase text-muted-foreground font-mono">
                SELECT_MODEL_TO_UPDATE *
              </label>
              {myModels.length > 0 ? (
                <select
                  value={versionForm.modelId}
                  onChange={(e) => setVersionForm({ ...versionForm, modelId: e.target.value })}
                  className="w-full px-4 py-3 bg-background border-2 border-foreground text-xs font-mono focus:outline-none focus:border-[#ea580c]"
                >
                  <option value="">-- Choose registered model --</option>
                  {myModels.map((m) => (
                    <option key={m.id} value={m.id}>
                      {m.name} (Current: {m.currentVersion}) — {m.id.slice(0, 12)}...
                    </option>
                  ))}
                </select>
              ) : (
                <input
                  type="text"
                  value={versionForm.modelId}
                  onChange={(e) => setVersionForm({ ...versionForm, modelId: e.target.value.trim() })}
                  placeholder="Paste Model ID (0x...)"
                  required
                  className="w-full px-4 py-3 bg-transparent border-2 border-foreground text-xs font-mono focus:outline-none focus:border-[#ea580c]"
                />
              )}
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <label className="text-[10px] tracking-[0.2em] uppercase text-muted-foreground font-mono">
                  NEW_VERSION_LABEL *
                </label>
                <input
                  type="text"
                  value={versionForm.newVersion}
                  onChange={(e) => setVersionForm({ ...versionForm, newVersion: e.target.value })}
                  placeholder="v1.1.0"
                  required
                  className="w-full px-4 py-3 bg-transparent border-2 border-foreground text-xs font-mono focus:outline-none focus:border-[#ea580c]"
                />
              </div>

              <div className="space-y-2">
                <label className="text-[10px] tracking-[0.2em] uppercase text-muted-foreground font-mono">
                  NEW_WEIGHTS_COMMITMENT
                </label>
                <input
                  type="text"
                  value={versionForm.rawWeightsDesc}
                  onChange={(e) => setVersionForm({ ...versionForm, rawWeightsDesc: e.target.value })}
                  placeholder="SHA-256 / keccak hash of new weights"
                  className="w-full px-4 py-3 bg-transparent border-2 border-foreground text-xs font-mono focus:outline-none focus:border-[#ea580c]"
                />
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-[10px] tracking-[0.2em] uppercase text-muted-foreground font-mono">
                CHANGELOG_NOTES *
              </label>
              <textarea
                rows={3}
                value={versionForm.changeNotes}
                onChange={(e) => setVersionForm({ ...versionForm, changeNotes: e.target.value })}
                placeholder="Describe what changed in this version (fine-tuning dataset, quantization, safety alignment)..."
                required
                className="w-full px-4 py-3 bg-transparent border-2 border-foreground text-xs font-mono focus:outline-none focus:border-[#ea580c]"
              />
            </div>

            <button
              type="submit"
              disabled={isUpdatingVersion || !versionForm.modelId || !versionForm.newVersion}
              className="w-full flex items-center justify-center gap-2 py-3.5 bg-foreground text-background text-xs font-mono font-bold uppercase tracking-wider hover:bg-[#ea580c] hover:text-white transition-colors disabled:opacity-50 cursor-pointer"
            >
              {isUpdatingVersion ? (
                <>
                  <span className="h-4 w-4 border-2 border-background border-t-transparent rounded-full animate-spin" />
                  RECORDING VERSION ON BASE...
                </>
              ) : (
                <>
                  <RefreshCw size={16} />
                  COMMIT NEW MODEL VERSION ON-CHAIN
                </>
              )}
            </button>
          </form>
        </motion.div>
      )}
    </div>
  )
}

export default function DashboardPage() {
  return (
    <div className="min-h-screen dot-grid-bg">
      <Navbar />
      <main>
        <Suspense
          fallback={
            <div className="p-12 text-center font-mono text-xs text-muted-foreground">
              Loading Creator Studio...
            </div>
          }
        >
          <DashboardContent />
        </Suspense>
      </main>
    </div>
  )
}
