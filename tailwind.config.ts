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
          primary:   '#0EA5E9',
          secondary: '#7C3AED',
          accent:    '#10B981',
        },
        surface: {
          DEFAULT: '#1E293B',
          2:       '#263548',
          3:       '#2d3f55',
        },
        background: '#0F172A',
        border: {
          DEFAULT: '#334155',
          bright:  '#475569',
        },
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', 'sans-serif'],
        mono: ['JetBrains Mono', 'monospace'],
      },
      backgroundImage: {
        'gradient-primary': 'linear-gradient(135deg, #0EA5E9 0%, #7C3AED 100%)',
        'gradient-accent':  'linear-gradient(135deg, #10B981 0%, #0EA5E9 100%)',
        'hero-mesh':        'radial-gradient(ellipse at 20% 50%, rgba(14,165,233,0.07) 0%, transparent 55%), radial-gradient(ellipse at 80% 20%, rgba(124,58,237,0.05) 0%, transparent 50%), radial-gradient(ellipse at 60% 80%, rgba(16,185,129,0.04) 0%, transparent 45%)',
      },
      animation: {
        'fade-in':  'fadeIn 0.2s ease-out',
        'slide-up': 'slideUp 0.3s ease-out',
        'shimmer':  'shimmer 1.6s infinite',
        'float':    'float 6s ease-in-out infinite',
        'glow':     'glowPulse 2.5s ease-in-out infinite',
      },
      keyframes: {
        fadeIn:    { from: { opacity: '0' }, to: { opacity: '1' } },
        slideUp:   { from: { transform: 'translateY(8px)', opacity: '0' }, to: { transform: 'translateY(0)', opacity: '1' } },
        shimmer:   { '100%': { transform: 'translateX(100%)' } },
        float:     { '0%, 100%': { transform: 'translateY(0px)' }, '50%': { transform: 'translateY(-6px)' } },
        glowPulse: { '0%, 100%': { opacity: '0.4' }, '50%': { opacity: '1' } },
      },
      boxShadow: {
        'glow-primary':   '0 0 24px rgba(14,165,233,0.2), 0 0 8px rgba(14,165,233,0.1)',
        'glow-secondary': '0 0 24px rgba(124,58,237,0.2), 0 0 8px rgba(124,58,237,0.1)',
        'glow-accent':    '0 0 24px rgba(16,185,129,0.2), 0 0 8px rgba(16,185,129,0.1)',
        'glow-sm':        '0 0 12px rgba(14,165,233,0.15)',
        'card':           '0 4px 6px -1px rgba(0,0,0,0.3), 0 1px 3px rgba(0,0,0,0.2)',
        'card-hover':     '0 10px 25px -3px rgba(0,0,0,0.4), 0 4px 6px rgba(0,0,0,0.2)',
        'card-elevated':  '0 20px 40px -10px rgba(0,0,0,0.5)',
      },
    },
  },
  plugins: [],
}

export default config
