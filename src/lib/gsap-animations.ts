import { gsap, ScrollTrigger, SplitText } from "@/lib/gsap";

let heroSplit: SplitText | null = null;
const _intervals: ReturnType<typeof setInterval>[] = [];

export function animateHero(): void {
  if (typeof window === "undefined") return;

  const tl = gsap.timeline({ defaults: { ease: "power3.out" } });

  tl.from(".hero-badge", { opacity: 0, y: -16, duration: 0.5 });

  const h1 = document.querySelector(".hero-h1");
  if (h1) {
    heroSplit = new SplitText(h1, { type: "lines" });
    gsap.set(h1, { perspective: 600 });
    tl.from(heroSplit.lines, {
      opacity: 0,
      y: 48,
      stagger: 0.1,
      duration: 0.75,
    }, "-=0.2");
  }

  const accentLine = document.querySelector(".hero-h1-accent");
  if (accentLine) {
    tl.from(accentLine, { opacity: 0, y: 20, duration: 0.6 }, "-=0.4");
  }

  tl.from(".hero-subheadline", { opacity: 0, y: 20, duration: 0.6 }, "-=0.4");

  tl.from(".hero-avatar", {
    opacity: 0,
    scale: 0.6,
    x: -8,
    stagger: 0.08,
    duration: 0.4,
  }, "-=0.35");

  tl.from(".hero-cta-primary", { opacity: 0, scale: 0.95, duration: 0.4 }, "-=0.2");
  tl.from(".hero-cta-secondary", { opacity: 0, x: -10, duration: 0.3 }, "-=0.2");
  tl.from(".hero-trust", { opacity: 0, y: 8, duration: 0.4 }, "-=0.2");

  tl.from(".hero-dashboard", {
    opacity: 0,
    y: 60,
    rotateX: 6,
    transformPerspective: 1000,
    duration: 1.1,
    ease: "power2.out",
  }, "-=0.7");
}

export function animateDashboardNumbers(): void {
  if (typeof window === "undefined") return;

  const counters: Array<{ el: string; end: number; suffix?: string; format?: boolean }> = [
    { el: ".stat-clientes",  end: 24 },
    { el: ".stat-citas",     end: 6 },
    { el: ".stat-mensajes",  end: 8 },
    { el: ".stat-ingresos",  end: 2800, suffix: "€", format: true },
  ];

  counters.forEach(({ el, end, suffix = "", format = false }) => {
    const element = document.querySelector(el);
    if (!element) return;

    const obj = { val: 0 };
    gsap.to(obj, {
      val: end,
      duration: 1.5,
      ease: "power2.out",
      onUpdate() {
        const v = Math.round(obj.val);
        element.textContent = format
          ? v.toLocaleString("es-ES") + suffix
          : String(v) + suffix;
      },
      scrollTrigger: {
        trigger: el,
        start: "top 80%",
        once: true,
      },
    });
  });

  gsap.to(".progress-rutinas", {
    width: "75%", duration: 1.2, ease: "power2.out",
    scrollTrigger: { trigger: ".progress-rutinas", start: "top 80%", once: true },
  });
  gsap.to(".progress-nutri", {
    width: "60%", duration: 1.2, ease: "power2.out", delay: 0.15,
    scrollTrigger: { trigger: ".progress-nutri", start: "top 80%", once: true },
  });
  gsap.to(".progress-seguimiento", {
    width: "90%", duration: 1.2, ease: "power2.out", delay: 0.3,
    scrollTrigger: { trigger: ".progress-seguimiento", start: "top 80%", once: true },
  });

  const pulse = setInterval(() => {
    const el = document.querySelector<HTMLElement>(".stat-mensajes");
    if (!el) return;
    gsap.to(el, {
      scale: 1.15,
      color: "#8FD43A",
      duration: 0.2,
      yoyo: true,
      repeat: 1,
      onComplete: () => {
        el.textContent = String(Math.floor(Math.random() * 4) + 7);
      },
    });
  }, 4000);
  _intervals.push(pulse);

  const avatarPulse = setInterval(() => {
    const ring = document.querySelector(".hero-avatar-pulse");
    if (!ring) return;
    gsap.fromTo(
      ring,
      { scale: 1, opacity: 0.8 },
      { scale: 2.5, opacity: 0, duration: 1, ease: "power2.out" }
    );
  }, 3000);
  _intervals.push(avatarPulse);
}

export function initScrollAnimations(): void {
  if (typeof window === "undefined") return;

  gsap.utils.toArray<HTMLElement>(".section-fade-up").forEach((el) => {
    gsap.from(el, {
      opacity: 0,
      y: 50,
      duration: 0.8,
      ease: "power2.out",
      scrollTrigger: { trigger: el, start: "top 85%", once: true },
    });
  });

  gsap.from(".after-panel", {
    clipPath: "inset(0 100% 0 0)",
    duration: 1.2,
    ease: "power3.inOut",
    scrollTrigger: {
      trigger: ".before-after-section",
      start: "top 60%",
      once: true,
    },
  });

  gsap.from(".feature-card", {
    opacity: 0,
    y: 40,
    stagger: 0.1,
    duration: 0.6,
    ease: "power2.out",
    scrollTrigger: { trigger: ".features-grid", start: "top 70%", once: true },
  });

  gsap.from(".metric-card", {
    opacity: 0,
    y: 30,
    stagger: 0.12,
    duration: 0.6,
    ease: "power2.out",
    scrollTrigger: { trigger: ".metrics-grid", start: "top 70%", once: true },
  });

  gsap.utils.toArray<HTMLElement>(".step-number-bg").forEach((el) => {
    gsap.to(el, {
      yPercent: -30,
      ease: "none",
      scrollTrigger: {
        trigger: el,
        start: "top bottom",
        end: "bottom top",
        scrub: 1,
      },
    });
  });

  const path = document.querySelector<SVGPathElement>(".steps-connector-path");
  if (path) {
    const length = path.getTotalLength();
    gsap.set(path, { strokeDasharray: length, strokeDashoffset: length });
    gsap.to(path, {
      strokeDashoffset: 0,
      ease: "none",
      scrollTrigger: {
        trigger: ".steps-section",
        start: "top 70%",
        end: "bottom 30%",
        scrub: 0.5,
      },
    });
  }

  ScrollTrigger.create({
    start: "top -80",
    onEnter: () =>
      gsap.to(".navbar", {
        backgroundColor: "rgba(10,10,10,0.9)",
        backdropFilter: "blur(12px)",
        duration: 0.3,
      }),
    onLeaveBack: () =>
      gsap.to(".navbar", {
        backgroundColor: "transparent",
        backdropFilter: "blur(0px)",
        duration: 0.3,
      }),
  });
}

export function initMicroInteractions(): void {
  if (typeof window === "undefined") return;

  document.querySelectorAll<HTMLElement>(".btn-primary").forEach((btn) => {
    btn.addEventListener("mouseenter", () =>
      gsap.to(btn, { scale: 1.02, duration: 0.2, ease: "power2.out" })
    );
    btn.addEventListener("mouseleave", () =>
      gsap.to(btn, { scale: 1, duration: 0.2, ease: "power2.out" })
    );
  });

  document.querySelectorAll<HTMLElement>(".feature-card").forEach((card) => {
    const icon = card.querySelector<HTMLElement>(".feature-icon");
    card.addEventListener("mouseenter", () => {
      gsap.to(card, { borderColor: "#8FD43A", duration: 0.25 });
      if (icon) gsap.to(icon, { y: -4, duration: 0.3, ease: "power2.out" });
    });
    card.addEventListener("mouseleave", () => {
      gsap.to(card, { borderColor: "#1F1F1F", duration: 0.25 });
      if (icon) gsap.to(icon, { y: 0, duration: 0.3, ease: "power2.out" });
    });
  });

  const proCard = document.querySelector<HTMLElement>(".pricing-card-pro");
  if (proCard) {
    const quickX = gsap.quickTo(proCard, "--mouse-x", { duration: 0.6 });
    const quickY = gsap.quickTo(proCard, "--mouse-y", { duration: 0.6 });
    proCard.addEventListener("mousemove", (e: MouseEvent) => {
      const rect = proCard.getBoundingClientRect();
      quickX(e.clientX - rect.left);
      quickY(e.clientY - rect.top);
    });
  }

  document.querySelectorAll<HTMLElement>(".demo-card").forEach((card) => {
    const quickRotX = gsap.quickTo(card, "rotateX", { duration: 0.4, ease: "power3.out" });
    const quickRotY = gsap.quickTo(card, "rotateY", { duration: 0.4, ease: "power3.out" });
    card.style.transformStyle = "preserve-3d";
    card.addEventListener("mousemove", (e: MouseEvent) => {
      const rect = card.getBoundingClientRect();
      const x = (e.clientX - rect.left) / rect.width - 0.5;
      const y = (e.clientY - rect.top) / rect.height - 0.5;
      quickRotY(x * 8);
      quickRotX(-y * 8);
    });
    card.addEventListener("mouseleave", () => {
      quickRotX(0);
      quickRotY(0);
    });
  });
}

export function cleanupAnimations(): void {
  _intervals.forEach(clearInterval);
  _intervals.length = 0;
  if (heroSplit) {
    heroSplit.revert();
    heroSplit = null;
  }
}
