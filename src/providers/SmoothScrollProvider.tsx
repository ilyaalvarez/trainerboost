'use client'
import { useEffect } from 'react'
import Lenis from 'lenis'
import gsap from 'gsap'
import ScrollTrigger from 'gsap/ScrollTrigger'

// Module-level registration: runs before any useEffect in any child component.
// If inside useEffect, React runs child effects BEFORE parent effects —
// ScrollTrigger would not be registered when child components animate.
gsap.registerPlugin(ScrollTrigger)

export function SmoothScrollProvider({ children }: { children: React.ReactNode }) {
  useEffect(() => {
    const lenis = new Lenis({ lerp: 0.06, smoothWheel: true, wheelMultiplier: 0.8 })
    lenis.on('scroll', ScrollTrigger.update)
    const tick = (time: number) => { lenis.raf(time * 1000) }
    gsap.ticker.add(tick)
    gsap.ticker.lagSmoothing(0)
    return () => {
      lenis.destroy()
      gsap.ticker.remove(tick)
    }
  }, [])

  return <>{children}</>
}
