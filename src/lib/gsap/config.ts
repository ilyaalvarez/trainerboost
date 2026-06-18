// GSAP is always dynamic-imported in client components — never at module level.
// Import this file only inside useEffect or event handlers.

export async function getGSAP() {
  const [{ gsap }, { ScrollTrigger }] = await Promise.all([
    import('gsap'),
    import('gsap/ScrollTrigger'),
  ])
  gsap.registerPlugin(ScrollTrigger)
  return { gsap, ScrollTrigger }
}

export async function getGSAPWithSplit() {
  const [{ gsap }, { ScrollTrigger }, { SplitText }] = await Promise.all([
    import('gsap'),
    import('gsap/ScrollTrigger'),
    import('gsap/SplitText'),
  ])
  gsap.registerPlugin(ScrollTrigger, SplitText)
  return { gsap, ScrollTrigger, SplitText }
}

export async function getGSAPFull() {
  const [{ gsap }, { ScrollTrigger }, { SplitText }, { ScrambleTextPlugin }, { DrawSVGPlugin }] =
    await Promise.all([
      import('gsap'),
      import('gsap/ScrollTrigger'),
      import('gsap/SplitText'),
      import('gsap/ScrambleTextPlugin'),
      import('gsap/DrawSVGPlugin'),
    ])
  gsap.registerPlugin(ScrollTrigger, SplitText, ScrambleTextPlugin, DrawSVGPlugin)
  return { gsap, ScrollTrigger, SplitText, ScrambleTextPlugin, DrawSVGPlugin }
}
