'use client'
import { useRef, useState } from 'react'
import gsap from 'gsap'

interface Item { q: string; a: string }

export function Accordion({ items }: { items: Item[] }) {
  const [open, setOpen] = useState<number | null>(null)
  const bodyRefs = useRef<(HTMLDivElement | null)[]>([])

  const toggle = (i: number) => {
    const bodyEl = bodyRefs.current[i]
    if (!bodyEl) return

    if (open === i) {
      gsap.to(bodyEl, { height: 0, opacity: 0, duration: 0.35, ease: 'expo.out' })
      setOpen(null)
    } else {
      if (open !== null && bodyRefs.current[open]) {
        gsap.to(bodyRefs.current[open], { height: 0, opacity: 0, duration: 0.25, ease: 'expo.out' })
      }
      setOpen(i)
      gsap.set(bodyEl, { height: 'auto', opacity: 1 })
      const h = bodyEl.offsetHeight
      gsap.fromTo(bodyEl,
        { height: 0, opacity: 0 },
        { height: h, opacity: 1, duration: 0.4, ease: 'expo.out' }
      )
    }
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '0' }}>
      {items.map((item, i) => (
        <div
          key={i}
          style={{
            borderBottom: '1px solid var(--tb-border)',
            borderTop: i === 0 ? '1px solid var(--tb-border)' : undefined,
          }}
        >
          <button
            onClick={() => toggle(i)}
            style={{
              width: '100%',
              padding: 'clamp(16px, 2vw, 22px) 0',
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              background: 'transparent',
              border: 'none',
              fontFamily: 'var(--font-body)',
              fontWeight: 500,
              fontSize: '15px',
              color: 'var(--tb-text)',
              cursor: 'pointer',
              textAlign: 'left',
              gap: '16px',
            }}
          >
            {item.q}
            <span style={{
              color: 'var(--tb-brand)',
              transform: open === i ? 'rotate(45deg)' : 'rotate(0)',
              transition: 'transform 300ms cubic-bezier(0.16, 1, 0.3, 1)',
              fontSize: '20px',
              lineHeight: 1,
              flexShrink: 0,
              display: 'inline-block',
            }}>
              +
            </span>
          </button>
          <div
            ref={(el) => { bodyRefs.current[i] = el }}
            style={{ height: 0, overflow: 'hidden', opacity: 0 }}
          >
            <p style={{
              padding: '0 0 clamp(16px, 2vw, 22px)',
              fontFamily: 'var(--font-body)',
              fontSize: '14px',
              color: 'var(--tb-muted)',
              lineHeight: 1.75,
              margin: 0,
            }}>
              {item.a}
            </p>
          </div>
        </div>
      ))}
    </div>
  )
}
