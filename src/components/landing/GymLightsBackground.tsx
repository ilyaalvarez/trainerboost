'use client'
import { useEffect, useRef } from 'react'
import gsap from 'gsap'

const SEGMENTS: [number, number, number, number][] = [
  [0, 15, 35, 45],
  [100, 10, 65, 40],
  [10, 55, 40, 55],
  [60, 50, 95, 50],
  [20, 30, 20, 60],
  [80, 25, 80, 55],
  [30, 20, 50, 20],
  [55, 70, 75, 70],
  [5, 75, 25, 75],
  [70, 15, 85, 15],
]

export function GymLightsBackground() {
  const svgRef = useRef<SVGSVGElement>(null)

  useEffect(() => {
    const ctx = gsap.context(() => {
      gsap.from('.gym-segment', {
        opacity: 0,
        duration: 1.5,
        stagger: { amount: 1.2, from: 'random' },
        ease: 'expo.out',
        delay: 0.3,
      })

      gsap.to('.gym-segment', {
        opacity: () => 0.5 + Math.random() * 0.4,
        duration: () => 2 + Math.random() * 2,
        repeat: -1,
        yoyo: true,
        ease: 'sine.inOut',
        stagger: { amount: 3, from: 'random' },
      })
    }, svgRef)

    return () => ctx.revert()
  }, [])

  return (
    <svg
      ref={svgRef}
      style={{
        position: 'absolute', inset: 0,
        width: '100%', height: '100%',
        pointerEvents: 'none',
        zIndex: 0,
      }}
      viewBox="0 0 100 100"
      preserveAspectRatio="xMidYMid slice"
    >
      <defs>
        <filter id="glow-brand">
          <feGaussianBlur stdDeviation="0.4" result="blur" />
          <feComposite in="SourceGraphic" in2="blur" operator="over" />
        </filter>
      </defs>
      {SEGMENTS.map(([x1, y1, x2, y2], i) => {
        const depth = y1 / 100
        const opacity = 0.3 + depth * 0.6
        const strokeWidth = 0.08 + depth * 0.12
        return (
          <line
            key={i}
            className="gym-segment"
            x1={x1} y1={y1} x2={x2} y2={y2}
            stroke="#8FD43A"
            strokeWidth={strokeWidth}
            strokeLinecap="round"
            opacity={opacity}
            filter="url(#glow-brand)"
            style={{
              filter: `drop-shadow(0 0 ${0.3 + depth * 0.4}px #8FD43A) drop-shadow(0 0 ${0.8 + depth}px rgba(143,212,58,0.4))`,
            }}
          />
        )
      })}
    </svg>
  )
}
