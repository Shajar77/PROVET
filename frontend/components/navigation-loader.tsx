"use client"

import { useEffect, useState, useRef } from "react"
import { usePathname, useSearchParams } from "next/navigation"
import { motion, AnimatePresence } from "framer-motion"

export function NavigationLoader() {
  const pathname = usePathname()
  const searchParams = useSearchParams()
  const [isLoading, setIsLoading] = useState(false)
  const isFirstRender = useRef(true)

  useEffect(() => {
    if (isFirstRender.current) {
      isFirstRender.current = false
      return
    }
    const raf = requestAnimationFrame(() => {
      setIsLoading(true)
    })
    const timeout = setTimeout(() => setIsLoading(false), 400)
    return () => {
      cancelAnimationFrame(raf)
      clearTimeout(timeout)
    }
  }, [pathname, searchParams])

  return (
    <AnimatePresence>
      {isLoading && (
        <motion.div
          initial={{ scaleX: 0 }}
          animate={{ scaleX: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
          className="fixed top-0 left-0 right-0 z-[200] h-[2px] bg-[#ea580c] origin-left"
        />
      )}
    </AnimatePresence>
  )
}
