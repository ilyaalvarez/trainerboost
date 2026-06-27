'use client'
import { useEffect, useRef } from 'react'
import gsap from 'gsap'

const SEGS: [number, number, number, number][] = [
  [0,18,38,46], [100,12,62,42],
  [8,35,8,65],  [92,28,92,58],
  [12,54,42,54],[58,50,90,50],
  [28,22,48,22],[55,68,78,68],
  [3,72,22,72], [76,16,88,16],
  [15,80,35,55],[65,78,88,60],
]

export function GymLights() {
  const ref = useRef<SVGSVGElement>(null)

  useEffect(() => {
    const ctx = gsap.context(() => {
      gsap.from('.gl-seg', {
        opacity: 0,
        duration: 1.4,
        stagger: { amount: 1.0, from: 'random' },
        ease: 'expo.out',
        delay: 0.2,
      })
      gsap.to('.gl-seg', {
        opacity: () => 0.4 + Math.random() * 0.5,
        duration: () => 2 + Math.random() * 2.5,
        repeat: -1,
        yoyo: true,
        ease: 'sine.inOut',
        stagger: { amount: 4, from: 'random' },
      })
    }, ref)
    return () => ctx.revert()
  }, [])

  return (
    <svg
      ref={ref}
      viewBox="0 0 100 100"
      preserveAspectRatio="xMidYMid slice"
      aria-hidden="true"
      style={{
        position: 'absolute',
        inset: 0,
        width: '100%',
        height: '100%',
        pointerEvents: 'none',
        zIndex: 0,
      }}
    >
      <defs>
        <linearGradient id="gym-fade" x1="0" y1="0" x2="0" y2="1">
          <stop offset="55%" stopColor="#050805" stopOpacity="0" />
          <stop offset="100%" stopColor="#050805" stopOpacity="1" />
        </linearGradient>
      </defs>
      {SEGS.map(([x1, y1, x2, y2], i) => {
        const d = (y1 + y2) / 200
        return (
          <line
            key={i}
            className="gl-seg"
            x1={x1} y1={y1} x2={x2} y2={y2}
            stroke="#8FD43A"
            strokeWidth={0.06 + d * 0.14}
            strokeLinecap="round"
            opacity={0.2 + d * 0.55}
            style={{
              filter: `drop-shadow(0 0 ${0.2 + d * 0.4}px #8FD43A) drop-shadow(0 0 ${0.6 + d}px rgba(143,212,58,0.3))`,
            }}
          />
        )
      })}
      <rect x="0" y="0" width="100" height="100" fill="url(#gym-fade)" />
    </svg>
  )
}
