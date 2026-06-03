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
          primary:   '#A3FF4A',
          secondary: '#7C3AED',
          accent:    '#10B981',
        },
        surface: {
          DEFAULT: '#141414',
          2:       '#1A1A1A',
          3:       '#222222',
        },
        background: '#0A0A0A',
        border: {
          DEFAULT: '#222222',
          bright:  '#333333',
        },
        success: '#10B981',
        warning: '#F59E0B',
        danger:  '#EF4444',
        'surface-light': '#F7F8FA',
      },
      fontFamily: {
        sans:    ['var(--font-sans)',    'system-ui', 'sans-serif'],
        mono:    ['var(--font-mono)',    'monospace'],
        display: ['var(--font-display)', 'system-ui', 'sans-serif'],
      },
      backgroundImage: {
        'gradient-primary': 'linear-gradient(135deg, #A3FF4A 0%, #7C3AED 100%)',
        'gradient-accent':  'linear-gradient(135deg, #10B981 0%, #A3FF4A 100%)',
        'hero-mesh':        'radial-gradient(ellipse at 20% 50%, rgba(163,255,74,0.06) 0%, transparent 55%), radial-gradient(ellipse at 80% 20%, rgba(124,58,237,0.04) 0%, transparent 50%), radial-gradient(ellipse at 60% 80%, rgba(163,255,74,0.03) 0%, transparent 45%)',
      },
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
        'glow':          'glowPulse 2.5s ease-in-out infinite',
        'pulse-ring':    'pulseRing 2s cubic-bezier(0.4, 0, 0.6, 1) infinite',
        'scale-in':      'scaleIn 0.25s cubic-bezier(0.34, 1.56, 0.64, 1)',
        'border-glow':   'borderGlow 3s ease-in-out infinite',
        'gradient-x':    'gradientX 4s ease infinite',
        'spin-slow':     'spin 12s linear infinite',
        'modal-in':      'modalIn 0.25s cubic-bezier(0.16, 1, 0.3, 1)',
      },
      keyframes: {
        fadeIn:      { from: { opacity: '0' }, to: { opacity: '1' } },
        slideUp:     { from: { transform: 'translateY(10px)', opacity: '0' }, to: { transform: 'translateY(0)', opacity: '1' } },
        slideUpLg:   { from: { transform: 'translateY(24px)', opacity: '0' }, to: { transform: 'translateY(0)', opacity: '1' } },
        slideLeft:   { from: { transform: 'translateX(-14px)', opacity: '0' }, to: { transform: 'translateX(0)', opacity: '1' } },
        slideRight:  { from: { transform: 'translateX(14px)', opacity: '0' }, to: { transform: 'translateX(0)', opacity: '1' } },
        shimmer:     { '100%': { transform: 'translateX(100%)' } },
        float:       { '0%, 100%': { transform: 'translateY(0px)' }, '50%': { transform: 'translateY(-8px)' } },
        glowPulse:   { '0%, 100%': { opacity: '0.4' }, '50%': { opacity: '1' } },
        pulseRing:   {
          '0%': { transform: 'scale(1)', opacity: '1' },
          '100%': { transform: 'scale(1.6)', opacity: '0' },
        },
        scaleIn:     { from: { transform: 'scale(0.9)', opacity: '0' }, to: { transform: 'scale(1)', opacity: '1' } },
        borderGlow:  {
          '0%, 100%': { boxShadow: '0 0 0 0 rgba(163,255,74,0)' },
          '50%': { boxShadow: '0 0 20px 2px rgba(163,255,74,0.25)' },
        },
        gradientX:   {
          '0%, 100%': { backgroundPosition: '0% 50%' },
          '50%': { backgroundPosition: '100% 50%' },
        },
        modalIn:     { from: { transform: 'translateY(8px) scale(0.98)', opacity: '0' }, to: { transform: 'translateY(0) scale(1)', opacity: '1' } },
      },
      boxShadow: {
        'glow-primary':   '0 0 24px rgba(163,255,74,0.25), 0 0 8px rgba(163,255,74,0.12)',
        'glow-secondary': '0 0 24px rgba(124,58,237,0.2), 0 0 8px rgba(124,58,237,0.1)',
        'glow-accent':    '0 0 24px rgba(16,185,129,0.2), 0 0 8px rgba(16,185,129,0.1)',
        'glow-sm':        '0 0 12px rgba(163,255,74,0.18)',
        'glow-md':        '0 0 20px rgba(163,255,74,0.28)',
        'glow-green':     '0 0 32px rgba(163,255,74,0.35), 0 0 12px rgba(163,255,74,0.2)',
        'card':           '0 4px 6px -1px rgba(0,0,0,0.3), 0 1px 3px rgba(0,0,0,0.2)',
        'card-hover':     '0 12px 28px -4px rgba(0,0,0,0.5), 0 4px 8px rgba(0,0,0,0.25)',
        'card-elevated':  '0 20px 40px -10px rgba(0,0,0,0.5)',
        'inner-glow':     'inset 0 1px 0 rgba(255,255,255,0.04)',
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
