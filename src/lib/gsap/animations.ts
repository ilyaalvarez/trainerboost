// All functions are called only after GSAP is loaded inside useEffect.
// Each function returns a cleanup function or void.

import type { gsap as GSAPType } from 'gsap'

type GSAP = typeof GSAPType

// Fade-up reveal for sections
export function createScrollFadeUp(gsap: GSAP) {
  return gsap.utils.toArray<HTMLElement>('.gsap-fade-up').map((el) =>
    gsap.fromTo(
      el,
      { opacity: 0, y: 32 },
      {
        opacity: 1,
        y: 0,
        duration: 0.7,
        ease: 'power2.out',
        scrollTrigger: {
          trigger: el,
          start: 'top 88%',
          once: true,
        },
      }
    )
  )
}

// Stagger reveal for bento cards
export function createBentoReveal(gsap: GSAP) {
  return gsap.fromTo(
    '.achievement-card',
    { opacity: 0, scale: 0.92, y: 20 },
    {
      opacity: 1,
      scale: 1,
      y: 0,
      duration: 0.55,
      ease: 'back.out(1.4)',
      stagger: 0.1,
      scrollTrigger: {
        trigger: '.achievement-grid',
        start: 'top 85%',
        once: true,
      },
    }
  )
}

// Hero headline split-text entrance
export function animateHeroHeadline(gsap: GSAP) {
  const el = document.querySelector<HTMLElement>('.hero-headline')
  if (!el) return

  gsap.fromTo(
    el,
    { opacity: 0, y: 40 },
    { opacity: 1, y: 0, duration: 0.9, ease: 'power3.out', delay: 0.1 }
  )
}

// Waitlist form shake on error
export function shakeElement(gsap: GSAP, selector: string) {
  gsap.to(selector, {
    keyframes: [
      { x: -8 }, { x: 8 }, { x: -6 },
      { x: 6 }, { x: -4 }, { x: 4 }, { x: 0 },
    ],
    duration: 0.5,
    ease: 'none',
  })
}

// FOMO counter count-up
export function countUp(
  gsap: GSAP,
  el: HTMLElement,
  from: number,
  to: number,
  duration = 1.2
) {
  const obj = { val: from }
  gsap.to(obj, {
    val: to,
    duration,
    ease: 'power2.out',
    onUpdate() {
      el.textContent = String(Math.round(obj.val))
    },
  })
}
