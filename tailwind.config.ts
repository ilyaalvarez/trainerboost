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
      animation: {
        'fade-in':  'fadeIn 0.2s ease-out',
        'slide-up': 'slideUp 0.3s ease-out',
        'shimmer':  'shimmer 1.6s infinite',
      },
      keyframes: {
        fadeIn:  { from: { opacity: '0' }, to: { opacity: '1' } },
        slideUp: { from: { transform: 'translateY(8px)', opacity: '0' }, to: { transform: 'translateY(0)', opacity: '1' } },
        shimmer: { '100%': { transform: 'translateX(100%)' } },
      },
      boxShadow: {
        'glow-primary': '0 0 20px rgba(14,165,233,0.15)',
        'glow-accent':  '0 0 20px rgba(16,185,129,0.15)',
        'card':         '0 4px 6px -1px rgba(0,0,0,0.3)',
        'card-hover':   '0 10px 15px -3px rgba(0,0,0,0.4)',
      },
    },
  },
  plugins: [],
}

export default config
