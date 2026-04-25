"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import { usePathname } from "next/navigation"
import { motion, AnimatePresence } from "framer-motion"
import { Menu, X } from "lucide-react"
import { ThemeToggle } from "@/components/theme-toggle"
import { ConnectWalletButton } from "@/components/connect-wallet"

const navLinks = [
  { name: "Home", href: "/" },
  { name: "Browse", href: "/models" },
  { name: "Verify", href: "/verify" },
  { name: "Dashboard", href: "/dashboard" },
]

export function Navbar() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)
  const pathname = usePathname()

  // Close mobile menu on route change
  useEffect(() => {
    setMobileMenuOpen(false)
  }, [pathname])

  // Prevent body scroll when mobile menu is open
  useEffect(() => {
    if (mobileMenuOpen) {
      document.body.style.overflow = "hidden"
    } else {
      document.body.style.overflow = ""
    }
    return () => {
      document.body.style.overflow = ""
    }
  }, [mobileMenuOpen])

  return (
    <motion.div
      initial={{ opacity: 0, y: -20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
      className="w-full px-3 sm:px-4 pt-3 sm:pt-4 lg:px-6 lg:pt-6 relative z-50"
    >
      <nav className="w-full border border-foreground/20 bg-background/80 backdrop-blur-sm px-3 sm:px-4 py-3 md:px-6 lg:px-8">
        <div className="flex items-center justify-between">
          {/* Logo - Left */}
          <Link href="/" className="flex-shrink-0">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.2, duration: 0.4 }}
              className="cursor-pointer"
            >
              <svg width="32" height="32" viewBox="0 0 72 72" className="shrink-0 sm:w-9 sm:h-9">
                {/* Orange circle ring */}
                <circle cx="36" cy="36" r="34" fill="none" stroke="#ea580c" strokeWidth="2" />
                {/* Asterisk/star shape */}
                <line x1="36" y1="18" x2="36" y2="54" stroke="hsl(var(--foreground))" strokeWidth="3" />
                <line x1="18" y1="36" x2="54" y2="36" stroke="hsl(var(--foreground))" strokeWidth="3" />
                <line x1="24" y1="24" x2="48" y2="48" stroke="hsl(var(--foreground))" strokeWidth="2" />
                <line x1="48" y1="24" x2="24" y2="48" stroke="hsl(var(--foreground))" strokeWidth="2" />
              </svg>
            </motion.div>
          </Link>

          {/* Center nav links - Desktop only */}
          <div className="hidden md:flex items-center gap-6 lg:gap-10">
            {navLinks.map((link, i) => {
              const isActive = pathname === link.href
              return (
                <motion.div
                  key={link.name}
                  initial={{ opacity: 0, y: -8 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.3 + i * 0.06, duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
                >
                  <Link
                    href={link.href}
                    className={`text-xs font-mono tracking-[0.15em] uppercase transition-colors duration-200 ${
                      isActive 
                        ? "text-[#ea580c] font-semibold" 
                        : "text-muted-foreground hover:text-foreground"
                    }`}
                  >
                    {link.name}
                  </Link>
                </motion.div>
              )
            })}
          </div>

          {/* Right side: Theme + Wallet + Mobile Menu */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.5, duration: 0.4 }}
            className="flex items-center gap-2 sm:gap-3 flex-shrink-0"
          >
            <ThemeToggle />
            
            {/* Desktop Wallet Button - hidden below md */}
            <div className="hidden md:block">
              <ConnectWalletButton />
            </div>

            {/* Mobile Menu Button - visible below md */}
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="md:hidden p-2 border border-foreground/20 hover:bg-foreground/5 transition-colors"
              aria-label="Toggle menu"
            >
              {mobileMenuOpen ? <X size={18} /> : <Menu size={18} />}
            </button>
          </motion.div>
        </div>

        {/* Mobile Menu */}
        <AnimatePresence>
          {mobileMenuOpen && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: "auto" }}
              exit={{ opacity: 0, height: 0 }}
              transition={{ duration: 0.3, ease: [0.22, 1, 0.36, 1] }}
              className="md:hidden border-t border-foreground/20 mt-3 pt-3 overflow-hidden"
            >
              <div className="flex flex-col gap-1">
                {navLinks.map((link, i) => {
                  const isActive = pathname === link.href
                  return (
                    <motion.div
                      key={link.name}
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: i * 0.08, duration: 0.3 }}
                    >
                      <Link
                        href={link.href}
                        onClick={() => setMobileMenuOpen(false)}
                        className={`block py-3 px-3 text-xs font-mono tracking-widest uppercase transition-colors ${
                          isActive
                            ? "text-[#ea580c] font-semibold bg-[#ea580c]/5"
                            : "text-muted-foreground hover:text-foreground hover:bg-foreground/5"
                        }`}
                      >
                        {link.name}
                      </Link>
                    </motion.div>
                  )
                })}
                {/* Mobile Wallet Button */}
                <div className="mt-2 pt-2 border-t border-foreground/20">
                  <ConnectWalletButton />
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </nav>
    </motion.div>
  )
}
