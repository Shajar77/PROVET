import Link from "next/link"
import { ArrowRight } from "lucide-react"
import { Navbar } from "@/components/navbar"

export default function NotFound() {
  return (
    <div className="min-h-screen dot-grid-bg">
      <Navbar />
      <main className="w-full px-4 sm:px-6 lg:px-12 flex flex-col items-center justify-center min-h-[70vh]">
        {/* Error code */}
        <div className="flex flex-col items-center text-center">
          <span className="text-[10px] font-mono tracking-[0.2em] uppercase text-muted-foreground mb-4">
            // ERROR: PAGE_NOT_FOUND
          </span>
          
          <h1 className="font-pixel text-6xl sm:text-8xl lg:text-9xl tracking-tight text-foreground mb-2 select-none">
            404
          </h1>

          <div className="flex items-center gap-3 mb-6">
            <span className="h-1.5 w-1.5 bg-red-500 rounded-full" />
            <span className="text-xs font-mono tracking-[0.15em] uppercase text-muted-foreground">
              ROUTE_UNRESOLVED
            </span>
          </div>

          <p className="text-xs sm:text-sm font-mono text-muted-foreground leading-relaxed max-w-sm mb-8 px-4">
            The requested resource could not be located on the network. 
            It may have been moved or does not exist.
          </p>

          {/* Terminal-style error */}
          <div className="border-2 border-foreground w-full max-w-md mb-8">
            <div className="flex items-center gap-2 px-4 py-2 bg-foreground text-background border-b-2 border-foreground">
              <span className="h-2 w-2 bg-red-400" />
              <span className="h-2 w-2 bg-foreground/50" />
              <span className="h-2 w-2 border border-background/30" />
              <span className="ml-auto text-[10px] tracking-widest uppercase">error.log</span>
            </div>
            <div className="p-4 bg-foreground text-background">
              <p className="text-xs font-mono opacity-60">{"> GET /unknown-route"}</p>
              <p className="text-xs font-mono opacity-60">{"> Status: 404 NOT FOUND"}</p>
              <p className="text-xs font-mono opacity-60">{"> Timestamp: " + new Date().toISOString().split("T")[0]}</p>
              <p className="text-xs font-mono text-red-400 mt-2">{"> Error: Route does not match any registered path"}</p>
              <span className="text-xs text-[#ea580c] font-mono animate-blink inline-block mt-1">_</span>
            </div>
          </div>

          {/* CTA */}
          <Link href="/">
            <button className="group flex items-center gap-0 bg-foreground text-background text-xs sm:text-sm font-mono tracking-wider uppercase cursor-pointer">
              <span className="flex items-center justify-center w-9 h-9 sm:w-10 sm:h-10 bg-[#ea580c]">
                <ArrowRight size={16} strokeWidth={2} className="text-background" />
              </span>
              <span className="px-4 sm:px-5 py-2 sm:py-2.5">
                Return Home
              </span>
            </button>
          </Link>
        </div>
      </main>
    </div>
  )
}
