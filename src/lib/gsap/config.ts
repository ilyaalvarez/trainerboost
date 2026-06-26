// GSAP is always dynamic-imported in client components — never at module level.
// Import this file only inside useEffect or event handlers.
// All Club plugins are available in gsap@3.11+ npm package.

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
  const [{ gsap }, { ScrollTrigger }, { SplitText }, { ScrambleTextPlugin }, { DrawSVGPlugin }, { Observer }] =
    await Promise.all([
      import('gsap'),
      import('gsap/ScrollTrigger'),
      import('gsap/SplitText'),
      import('gsap/ScrambleTextPlugin'),
      import('gsap/DrawSVGPlugin'),
      import('gsap/Observer'),
    ])
  gsap.registerPlugin(ScrollTrigger, SplitText, ScrambleTextPlugin, DrawSVGPlugin, Observer)
  return { gsap, ScrollTrigger, SplitText, ScrambleTextPlugin, DrawSVGPlugin, Observer }
}

export async function getGSAPCinematic() {
  const [
    { gsap },
    { ScrollTrigger },
    { ScrollSmoother },
    { SplitText },
    { ScrambleTextPlugin },
    { DrawSVGPlugin },
    { CustomEase },
    { Observer },
  ] = await Promise.all([
    import('gsap'),
    import('gsap/ScrollTrigger'),
    import('gsap/ScrollSmoother'),
    import('gsap/SplitText'),
    import('gsap/ScrambleTextPlugin'),
    import('gsap/DrawSVGPlugin'),
    import('gsap/CustomEase'),
    import('gsap/Observer'),
  ])

  gsap.registerPlugin(
    ScrollTrigger,
    ScrollSmoother,
    SplitText,
    ScrambleTextPlugin,
    DrawSVGPlugin,
    CustomEase,
    Observer,
  )

  // Gym-specific eases — defined once, reused across all animations
  CustomEase.create('gym.power', 'M0,0,C0.126,0,0.242,0.444,0.27,0.562,0.312,0.726,0.354,0.958,0.36,1,0.37,0.978,0.514,0.988,1,1')
  CustomEase.create('gym.strike', 'M0,0,C0.55,0,0.056,0.666,0.5,0.75,0.7,0.8,1,1,1,1')

  return { gsap, ScrollTrigger, ScrollSmoother, SplitText, ScrambleTextPlugin, DrawSVGPlugin, CustomEase, Observer }
}
