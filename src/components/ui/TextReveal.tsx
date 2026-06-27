'use client'
import { useLayoutEffect, useRef } from 'react'
import gsap from 'gsap'
import ScrollTrigger from 'gsap/ScrollTrigger'

interface Props {
  children: string
  as?: 'h1' | 'h2' | 'h3'
  delay?: number
  style?: React.CSSProperties
  className?: string
}

export function TextReveal({ children, as: Tag = 'h2', delay = 0, style, className }: Props) {
  const ref = useRef<HTMLElement>(null)

  useLayoutEffect(() => {
    const el = ref.current
    if (!el) return

    el.innerHTML = children
      .split('\n')
      .map(line =>
        `<span style="display:block;overflow:hidden;line-height:1.15"><span class="tr-line" style="display:block">${line}</span></span>`
      )
      .join('')

    const ctx = gsap.context(() => {
      gsap.from(el.querySelectorAll('.tr-line'), {
        y: '108%',
        duration: 0.85,
        stagger: 0.1,
        ease: 'expo.out',
        delay,
        scrollTrigger: { trigger: el, start: 'top 88%', once: true },
      })
    }, el)

    return () => ctx.revert()
  }, [children, delay])

  return (
    <Tag ref={ref as React.Ref<HTMLHeadingElement>} style={style} className={className}>
      {children}
    </Tag>
  )
}
