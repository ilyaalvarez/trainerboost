import type { Config } from 'tailwindcss'

const config: Config = {
  content: [
    './src/pages/**/*.{js,ts,jsx,tsx,mdx}',
    './src/components/**/*.{js,ts,jsx,tsx,mdx}',
    './src/app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        brand: {
          primary:   '#8FD43A',  // single source of truth — no #A3FF4A anywhere
          secondary: '#7C3AED',  // only for badges/states, never in gradients
          accent:    '#10B981',
        },
        surface: {
          DEFAULT: '#111111',
          2:       '#161616',
          3:       '#1C1C1C',
          4:       '#222222',
          light:   '#F7F8FA',
        },
        background: '#0A0A0A',
        border: {
          DEFAULT: '#1E1E1E',
          bright:  '#2C2C2C',
        },
        success: '#10B981',
        warning: '#F59E0B',
        danger:  '#EF4444',
      },
      fontFamily: {
        sans:    ['var(--font-sans)',    'system-ui', 'sans-serif'],
        mono:    ['var(--font-mono)',    'monospace'],
        display: ['var(--font-display)', 'system-ui', 'sans-serif'],
      },
      fontSize: {
        'kpi': ['3rem', { lineHeight: '1', letterSpacing: '-0.02em', fontWeight: '700' }],
      },
      // No gradient background utilities — gradients should be deliberate, not a default pattern
      animation: {
        'fade-in':       'fadeIn 0.2s ease-out',
        'fade-in-slow':  'fadeIn 0.5s ease-out',
        'slide-up':      'slideUp 0.35s cubic-bezier(0.16, 1, 0.3, 1)',
        'slide-up-lg':   'slideUpLg 0.5s cubic-bezier(0.16, 1, 0.3, 1)',
        'slide-left':    'slideLeft 0.35s cubic-bezier(0.16, 1, 0.3, 1)',
        'slide-right':   'slideRight 0.4s cubic-bezier(0.16, 1, 0.3, 1)',
        'shimmer':       'shimmer 1.6s infinite',
        'float':         'float 6s ease-in-out infinite',
        'float-slow':    'float 9s ease-in-out infinite',
        'scale-in':      'scaleIn 0.25s cubic-bezier(0.34, 1.56, 0.64, 1)',
        'modal-in':      'modalIn 0.25s cubic-bezier(0.16, 1, 0.3, 1)',
        'spin-slow':     'spin 12s linear infinite',
        'pulse-ring':    'pulseRing 2s cubic-bezier(0.4, 0, 0.6, 1) infinite',
      },
      keyframes: {
        fadeIn:      { from: { opacity: '0' }, to: { opacity: '1' } },
        slideUp:     { from: { transform: 'translateY(10px)', opacity: '0' }, to: { transform: 'translateY(0)', opacity: '1' } },
        slideUpLg:   { from: { transform: 'translateY(24px)', opacity: '0' }, to: { transform: 'translateY(0)', opacity: '1' } },
        slideLeft:   { from: { transform: 'translateX(-14px)', opacity: '0' }, to: { transform: 'translateX(0)', opacity: '1' } },
        slideRight:  { from: { transform: 'translateX(14px)', opacity: '0' }, to: { transform: 'translateX(0)', opacity: '1' } },
        shimmer:     { '100%': { transform: 'translateX(100%)' } },
        float:       { '0%, 100%': { transform: 'translateY(0px)' }, '50%': { transform: 'translateY(-8px)' } },
        pulseRing:   {
          '0%':   { transform: 'scale(1)', opacity: '1' },
          '100%': { transform: 'scale(1.6)', opacity: '0' },
        },
        scaleIn:     { from: { transform: 'scale(0.9)', opacity: '0' }, to: { transform: 'scale(1)', opacity: '1' } },
        modalIn:     { from: { transform: 'translateY(8px) scale(0.98)', opacity: '0' }, to: { transform: 'translateY(0) scale(1)', opacity: '1' } },
      },
      boxShadow: {
        // Brand glows — use sparingly, only on focused/active states
        'glow-primary':   '0 0 12px rgba(143,212,58,0.12), 0 0 4px rgba(143,212,58,0.06)',
        'glow-secondary': '0 0 12px rgba(124,58,237,0.12), 0 0 4px rgba(124,58,237,0.05)',
        'glow-accent':    '0 0 12px rgba(16,185,129,0.12), 0 0 4px rgba(16,185,129,0.05)',
        'glow-sm':        '0 0 6px rgba(143,212,58,0.08)',
        'glow-md':        '0 0 12px rgba(143,212,58,0.12)',
        // Card shadows — deliberate, not decorative
        'card':           '0 1px 3px rgba(0,0,0,0.3)',
        'card-hover':     '0 8px 20px rgba(0,0,0,0.4)',
        'card-elevated':  '0 12px 32px rgba(0,0,0,0.4)',
        'inner-glow':     'inset 0 1px 0 rgba(255,255,255,0.03)',
      },
      transitionTimingFunction: {
        'spring':       'cubic-bezier(0.34, 1.56, 0.64, 1)',
        'smooth-out':   'cubic-bezier(0.16, 1, 0.3, 1)',
        'smooth-inout': 'cubic-bezier(0.65, 0, 0.35, 1)',
      },
    },
  },
  plugins: [],
}

export default config
