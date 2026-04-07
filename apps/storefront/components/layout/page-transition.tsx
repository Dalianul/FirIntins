"use client"

import { m } from "motion/react"

export function PageTransition({ children }: { children: React.ReactNode }) {
  return (
    <m.main
      className="relative z-0 min-h-screen pt-16"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.2 }}
    >
      {children}
    </m.main>
  )
}
