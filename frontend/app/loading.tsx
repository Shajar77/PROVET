import { Navbar } from "@/components/navbar"

export default function Loading() {
  return (
    <div className="min-h-screen dot-grid-bg">
      <Navbar />
      <main className="w-full px-4 sm:px-6 py-8 sm:py-12 lg:px-12">
        {/* Skeleton section label */}
        <div className="flex items-center gap-4 mb-8">
          <div className="h-3 w-48 bg-foreground/10 animate-pulse" />
          <div className="flex-1 border-t border-border" />
          <div className="h-3 w-8 bg-foreground/10 animate-pulse" />
        </div>

        {/* Skeleton header */}
        <div className="mb-12">
          <div className="h-10 w-64 bg-foreground/10 animate-pulse mb-4" />
          <div className="h-4 w-96 max-w-full bg-foreground/10 animate-pulse" />
        </div>

        {/* Skeleton content blocks */}
        <div className="space-y-4 max-w-2xl">
          <div className="border-2 border-foreground/20 p-6 space-y-4">
            <div className="h-3 w-20 bg-foreground/10 animate-pulse" />
            <div className="h-10 w-full bg-foreground/10 animate-pulse" />
            <div className="h-3 w-20 bg-foreground/10 animate-pulse" />
            <div className="h-10 w-full bg-foreground/10 animate-pulse" />
            <div className="h-10 w-full bg-foreground/15 animate-pulse" />
          </div>
        </div>
      </main>
    </div>
  )
}
