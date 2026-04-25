"use client"

import { LazyMotion, domAnimation, m } from "framer-motion"
import { Github, Twitter, ArrowRight } from "lucide-react"
import Link from "next/link"

const ease = [0.22, 1, 0.36, 1] as const

const socialLinks = [
  { name: "GitHub", href: "#" },
  { name: "Twitter", href: "#" },
  { name: "Discord", href: "#" },
]

const legalLinks = [
  { name: "Privacy Policy", href: "#" },
  { name: "Terms", href: "#" },
]

export function Footer() {
  return (
    <LazyMotion features={domAnimation}>
      <footer className="w-full bg-[#ea580c] text-black relative overflow-hidden">
        {/* Top Row - Links */}
        <div className="w-full px-4 sm:px-6 lg:px-12 py-8 border-b border-black/20">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-6">
            {/* Left: Logo + CTA */}
            <m.div
              initial={{ opacity: 0, y: 10 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, ease }}
              className="flex items-center gap-4"
            >
              {/* Logo - Same as navbar but larger */}
              <Link href="/" className="flex-shrink-0">
                <svg width="48" height="48" viewBox="0 0 72 72" className="shrink-0">
                  <circle cx="36" cy="36" r="34" fill="none" stroke="black" strokeWidth="2" />
                  <line x1="36" y1="18" x2="36" y2="54" stroke="black" strokeWidth="3" />
                  <line x1="18" y1="36" x2="54" y2="36" stroke="black" strokeWidth="3" />
                  <line x1="24" y1="24" x2="48" y2="48" stroke="black" strokeWidth="2" />
                  <line x1="48" y1="24" x2="24" y2="48" stroke="black" strokeWidth="2" />
                </svg>
              </Link>
              <div className="flex flex-col gap-1">
                <span className="text-[10px] font-mono tracking-[0.2em] uppercase text-black/60">
                  REGISTER MODELS ON-CHAIN
                </span>
                <Link 
                  href="/models"
                  className="group inline-flex items-center gap-2 text-xs font-mono tracking-[0.1em] uppercase font-semibold text-black"
                >
                  EXPLORE REGISTRY
                  <ArrowRight size={14} strokeWidth={2} className="group-hover:translate-x-1 transition-transform" />
                </Link>
              </div>
            </m.div>

            {/* Right Side - Pages, Social, Legal */}
            <div className="flex flex-col sm:flex-row items-start sm:items-start gap-8 sm:gap-12 lg:gap-16">
              {/* Pages */}
              <m.div
                initial={{ opacity: 0, y: 10 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: 0.1, duration: 0.5, ease }}
                className="flex flex-col gap-1"
              >
                <span className="text-[9px] font-mono tracking-[0.15em] uppercase text-black/40 mb-1">
                  Pages
                </span>
                {[
                  { name: "Home", href: "/" },
                  { name: "Models", href: "/models" },
                  { name: "Verify", href: "/verify" },
                  { name: "Dashboard", href: "/dashboard" },
                ].map((link) => (
                  <Link
                    key={link.name}
                    href={link.href}
                    className="text-[11px] font-mono tracking-[0.1em] uppercase hover:text-black/60 transition-colors"
                  >
                    {link.name}
                  </Link>
                ))}
              </m.div>

              {/* Social */}
              <m.div
                initial={{ opacity: 0, y: 10 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: 0.2, duration: 0.5, ease }}
                className="flex flex-col gap-1"
              >
                <span className="text-[9px] font-mono tracking-[0.15em] uppercase text-black/40 mb-1">
                  Social
                </span>
                {socialLinks.map((link) => (
                  <a
                    key={link.name}
                    href={link.href}
                    className="text-[11px] font-mono tracking-[0.1em] uppercase hover:text-black/60 transition-colors flex items-center gap-1"
                  >
                    {link.name}
                    <ArrowRight size={10} strokeWidth={2} />
                  </a>
                ))}
              </m.div>

              {/* Legal */}
              <m.div
                initial={{ opacity: 0, y: 10 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: 0.3, duration: 0.5, ease }}
                className="flex flex-col gap-1"
              >
                <span className="text-[9px] font-mono tracking-[0.15em] uppercase text-black/40 mb-1">
                  Legal
                </span>
                {legalLinks.map((link) => (
                  <a
                    key={link.name}
                    href={link.href}
                    className="text-[11px] font-mono tracking-[0.1em] uppercase hover:text-black/60 transition-colors flex items-center gap-1"
                  >
                    {link.name}
                    <ArrowRight size={10} strokeWidth={2} />
                  </a>
                ))}
              </m.div>
            </div>
          </div>
        </div>

      </footer>
    </LazyMotion>
  )
}
