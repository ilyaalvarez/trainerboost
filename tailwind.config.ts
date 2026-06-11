import type { Config } from 'tailwindcss'

// ─────────────────────────────────────────────────────────────────────────────
// TrainerBoost Design System — fuente única de verdad para tokens visuales.
//
// Namespaces:
//   brand.*     → colores de marca (primary, accent, secondary)
//   surface.*   → fondos y capas de elevación (dark-only)
//   border.*    → bordes en escala de visibilidad
//   fg.*        → texto y foreground (reemplazan slate-* en código nuevo)
//   semantic.*  → estados funcionales: success/warning/error/info + variantes text
//
// Backwards compat:
//   surface.2/.3/.4, border.bright, success, warning, danger
//   → mantenidos con los mismos valores para no romper código existente.
// ─────────────────────────────────────────────────────────────────────────────

const config: Config = {
  content: [
    './src/pages/**/*.{js,ts,jsx,tsx,mdx}',
    './src/components/**/*.{js,ts,jsx,tsx,mdx}',
    './src/app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {

      // ── COLORES ──────────────────────────────────────────────────────────
      colors: {

        // ── Marca ──────────────────────────────────────────────────────────
        brand: {
          primary:          '#8FD43A',  // Lima viva. Identidad TrainerBoost.
          'primary-hover':  '#9EE048',  // +8% luminosidad — hover sin chirriar.
          secondary:        '#7C3AED',  // Violeta. Solo badges premium y estados especiales.
          'secondary-text': '#C4B5FD',  // Texto violeta sobre dark — grasa macro, medidas.
          accent:           '#10B981',  // Esmeralda. Progreso, rachas, éxito secundario.
          rose:             '#F9A8D4',  // Rosa — medida pecho en tabla de progreso.
        },

        // ── Fondos y capas de elevación (dark-only) ───────────────────────
        // Jerarquía visual: background < surface < surface-2 < surface-3 < surface-4
        surface: {
          DEFAULT: '#111111',  // Cards de primer nivel.
          2:       '#161616',  // Elementos elevados sobre surface.
          3:       '#1C1C1C',  // Rows de tabla en hover, inputs de fondo.
          4:       '#222222',  // Cuarta capa — uso muy específico.
          light:   '#F7F8FA',  // Reservado para contextos light (no usado en dark theme).
        },

        background: '#0A0A0A',  // Fondo global. Near-black con calidez mínima.

        // ── Bordes en escala de visibilidad ──────────────────────────────
        border: {
          DEFAULT: '#1E1E1E',  // Borde estándar — sutil sobre surface.
          subtle:  '#181818',  // Separadores internos dentro de una card.
          bright:  '#2C2C2C',  // Kept — backwards compat. Alias de strong.
          strong:  '#2E2E2E',  // Borde visible: hover de cards, focus sin color.
        },

        // ── Texto y foreground (reemplazan slate-* en código nuevo) ───────
        // Uso: text-fg-primary, text-fg-muted, etc.
        fg: {
          primary:   '#EAEAEA',  // Texto principal. Off-white — menos fatiga que #FFF.
          secondary: '#94A3B8',  // Soporte, descripciones, labels. Contraste 6.2:1.
          muted:     '#64748B',  // Meta-info, captions, placeholders. Contraste 4.6:1.
          disabled:  '#475569',  // Elementos no interactivos — sin requisito mínimo.
        },

        // ── Estados semánticos para badges, alerts e iconos de estado ────
        // Patrón en dark: bg-semantic-X/10 + text-semantic-X-text + border-semantic-X/20
        semantic: {
          success:        '#22C55E',  // Verde puro. Iconos y dots de estado activo.
          'success-text': '#4ADE80',  // Texto verde sobre dark. Contraste 5.2:1 sobre surface.
          warning:        '#F59E0B',  // Ámbar. Alertas y estados de pausa.
          'warning-text': '#FCD34D',  // Texto ámbar sobre dark. Contraste 9.1:1.
          error:          '#EF4444',  // Rojo. Estados de error y cancelación.
          'error-text':   '#FC8181',  // Texto rojo sobre dark. Contraste 5.5:1.
          info:           '#0EA5E9',  // Azul cielo. Confirmaciones y tipo Online.
          'info-text':    '#38BDF8',  // Texto info sobre dark. Contraste 6.8:1.
        },

        // ── Kept — backwards compat (código existente los usa directamente) ─
        success: '#22C55E',  // Corregido: era #10B981 (= accent, duplicado incorrecto).
        warning: '#F59E0B',
        danger:  '#EF4444',
      },

      // ── TIPOGRAFÍA ───────────────────────────────────────────────────────
      fontFamily: {
        sans:    ['var(--font-sans)',    'system-ui', 'sans-serif'],
        mono:    ['var(--font-mono)',    'monospace'],
        display: ['var(--font-display)', 'system-ui', 'sans-serif'],
        // Inter (sans), JetBrains Mono (mono), Barlow Condensed (display).
        // Barlow Condensed → KPIs, hero, números grandes. Nunca para texto corrido.
      },

      // ── ESCALA TIPOGRÁFICA ───────────────────────────────────────────────
      // Los tamaños por debajo de caption (0.75rem) están PROHIBIDOS en UI real.
      // text-[8px]/[9px]/[10px] solo se permiten en mocks estáticos (landing preview).
      fontSize: {
        // display     → Solo landing hero h1. Con font-display (Barlow Condensed 800).
        'display':   ['3.5rem',  { lineHeight: '1',    letterSpacing: '-0.03em', fontWeight: '800' }],
        // kpi         → Métricas del dashboard. Con font-display (Barlow Condensed 700).
        'kpi':       ['3rem',    { lineHeight: '1',    letterSpacing: '-0.02em', fontWeight: '700' }],
        // title scale → Headings de sección, con font-display o font-sans según nivel.
        'title-2xl': ['2.5rem',  { lineHeight: '1.05', letterSpacing: '-0.02em', fontWeight: '700' }],
        'title-xl':  ['1.75rem', { lineHeight: '1.1',  letterSpacing: '-0.01em', fontWeight: '700' }],
        'title-lg':  ['1.25rem', { lineHeight: '1.3',  letterSpacing: '-0.01em', fontWeight: '600' }],
        'title':     ['1.125rem',{ lineHeight: '1.4',  fontWeight: '600' }],
        // data        → Números en tablas, precios, métricas. Con font-mono.
        'data':      ['0.875rem',{ lineHeight: '1.4',  fontWeight: '400' }],
        'data-lg':   ['1.5rem',  { lineHeight: '1.2',  fontWeight: '600' }],
      },

      // ── ANIMACIONES ──────────────────────────────────────────────────────
      animation: {
        'fade-in':      'fadeIn 0.2s ease-out',
        'fade-in-slow': 'fadeIn 0.5s ease-out',
        'slide-up':     'slideUp 0.35s cubic-bezier(0.16, 1, 0.3, 1)',
        'slide-up-lg':  'slideUpLg 0.5s cubic-bezier(0.16, 1, 0.3, 1)',
        'slide-left':   'slideLeft 0.35s cubic-bezier(0.16, 1, 0.3, 1)',
        'slide-right':  'slideRight 0.4s cubic-bezier(0.16, 1, 0.3, 1)',
        'shimmer':      'shimmer 1.6s infinite',
        'float':        'float 6s ease-in-out infinite',
        'float-slow':   'float 9s ease-in-out infinite',
        'scale-in':     'scaleIn 0.25s cubic-bezier(0.34, 1.56, 0.64, 1)',
        'modal-in':     'modalIn 0.25s cubic-bezier(0.16, 1, 0.3, 1)',
        'spin-slow':    'spin 12s linear infinite',
        'pulse-ring':   'pulseRing 2s cubic-bezier(0.4, 0, 0.6, 1) infinite',
      },

      // ── KEYFRAMES ────────────────────────────────────────────────────────
      keyframes: {
        fadeIn:    {
          from: { opacity: '0' },
          to:   { opacity: '1' },
        },
        slideUp:   {
          from: { transform: 'translateY(10px)', opacity: '0' },
          to:   { transform: 'translateY(0)',    opacity: '1' },
        },
        slideUpLg: {
          from: { transform: 'translateY(24px)', opacity: '0' },
          to:   { transform: 'translateY(0)',    opacity: '1' },
        },
        slideLeft: {
          from: { transform: 'translateX(-14px)', opacity: '0' },
          to:   { transform: 'translateX(0)',     opacity: '1' },
        },
        slideRight: {
          from: { transform: 'translateX(14px)', opacity: '0' },
          to:   { transform: 'translateX(0)',    opacity: '1' },
        },
        shimmer: {
          '100%': { transform: 'translateX(100%)' },
        },
        float: {
          '0%, 100%': { transform: 'translateY(0px)' },
          '50%':       { transform: 'translateY(-8px)' },
        },
        pulseRing: {
          '0%':   { transform: 'scale(1)',   opacity: '1' },
          '100%': { transform: 'scale(1.6)', opacity: '0' },
        },
        scaleIn: {
          from: { transform: 'scale(0.9)', opacity: '0' },
          to:   { transform: 'scale(1)',   opacity: '1' },
        },
        modalIn: {
          from: { transform: 'translateY(8px) scale(0.98)', opacity: '0' },
          to:   { transform: 'translateY(0) scale(1)',      opacity: '1' },
        },
      },

      // ── SOMBRAS ──────────────────────────────────────────────────────────
      boxShadow: {
        // Glows — solo en estados focus/active, nunca decorativos.
        'glow-primary':   '0 0 12px rgba(143,212,58,0.12), 0 0 4px rgba(143,212,58,0.06)',
        'glow-secondary': '0 0 12px rgba(124,58,237,0.12), 0 0 4px rgba(124,58,237,0.05)',
        'glow-accent':    '0 0 12px rgba(16,185,129,0.12), 0 0 4px rgba(16,185,129,0.05)',
        'glow-sm':        '0 0 6px rgba(143,212,58,0.08)',
        'glow-md':        '0 0 12px rgba(143,212,58,0.12)',
        // Cards — escala de elevación.
        'card':           '0 1px 3px rgba(0,0,0,0.3)',
        'card-hover':     '0 8px 20px rgba(0,0,0,0.4)',
        'card-elevated':  '0 12px 32px rgba(0,0,0,0.4)',
        'inner-glow':     'inset 0 1px 0 rgba(255,255,255,0.03)',
        // Modal — panel flotante oscuro sobre overlay.
        'modal':          '0 24px 64px -16px rgba(0,0,0,0.7), inset 0 1px 0 rgba(255,255,255,0.04)',
      },

      // ── CURVAS DE TRANSICIÓN ─────────────────────────────────────────────
      transitionTimingFunction: {
        'spring':       'cubic-bezier(0.34, 1.56, 0.64, 1)',  // Resorte — elementos que entran.
        'smooth-out':   'cubic-bezier(0.16, 1, 0.3, 1)',      // Suave — la mayoría de hover.
        'smooth-inout': 'cubic-bezier(0.65, 0, 0.35, 1)',     // Simétrico — modales que salen.
      },

    },
  },
  plugins: [],
}

export default config
