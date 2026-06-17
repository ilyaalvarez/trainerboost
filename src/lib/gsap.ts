import { gsap } from "gsap";
import { useGSAP } from "@gsap/react";

// Core plugins (incluidos en gsap, sin licencia extra)
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { ScrollSmoother } from "gsap/ScrollSmoother";
import { Draggable } from "gsap/Draggable";
import { Flip } from "gsap/Flip";
import { Observer } from "gsap/Observer";
import { TextPlugin } from "gsap/TextPlugin";
import { MotionPathPlugin } from "gsap/MotionPathPlugin";
import { SplitText } from "gsap/SplitText";

// Registrar todos de una vez
gsap.registerPlugin(
  useGSAP,
  ScrollTrigger,
  ScrollSmoother,
  Draggable,
  Flip,
  Observer,
  TextPlugin,
  MotionPathPlugin,
  SplitText
);

// Eases predefinidos más útiles
export const eases = {
  // Suaves
  smooth: "power2.inOut",
  smoothOut: "power2.out",
  smoothIn: "power2.in",

  // Más pronunciados
  strong: "power4.out",
  strongIn: "power4.in",
  strongInOut: "power4.inOut",

  // Elásticos
  elastic: "elastic.out(1, 0.3)",
  elasticLight: "elastic.out(0.5, 0.4)",
  bounce: "bounce.out",

  // Back (overshooting)
  back: "back.out(1.7)",
  backIn: "back.in(1.7)",
  backInOut: "back.inOut(1.7)",

  // Circulares
  circ: "circ.out",
  circIn: "circ.in",

  // Exponenciales
  expo: "expo.out",
  expoIn: "expo.in",
  expoInOut: "expo.inOut",

  // Sinusoidal (muy suave)
  sine: "sine.inOut",
  sineOut: "sine.out",

  // Lineal
  linear: "none",

  // Custom eases de alta calidad (CustomEase equivalentes via string)
  spring: "power1.out",
  snappy: "power3.out",
  dramatic: "expo.inOut",
} as const;

// Duraciones estándar
export const durations = {
  fast: 0.2,
  normal: 0.4,
  slow: 0.7,
  verySlow: 1.2,
} as const;

// ScrollTrigger defaults recomendados
export const scrollDefaults = {
  toggleActions: "play none none reverse" as const,
  start: "top 85%",
  end: "bottom 15%",
};

export {
  gsap,
  useGSAP,
  ScrollTrigger,
  ScrollSmoother,
  Draggable,
  Flip,
  Observer,
  TextPlugin,
  MotionPathPlugin,
  SplitText,
};
