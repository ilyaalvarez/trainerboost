import LogoIcon from './LogoIcon'
import type { HTMLAttributes } from 'react'

interface LogoFullProps extends HTMLAttributes<HTMLDivElement> {
  height?: number
  animated?: boolean
}

export default function LogoFull({ height = 28, animated = true, className = '', ...props }: LogoFullProps) {
  const iconSize = Math.round(height * 1.2)

  return (
    <div className={`flex items-center gap-2.5 select-none ${className}`} {...props}>
      <LogoIcon size={iconSize} animated={animated} />
      <div
        style={{
          fontFamily: 'var(--font-wordmark, "Space Grotesk", sans-serif)',
          lineHeight: 1,
          display: 'flex',
          flexDirection: 'column',
          gap: '1px',
        }}
      >
        <span
          style={{
            display: 'block',
            fontWeight: 500,
            fontSize: `${Math.round(height * 0.45)}px`,
            letterSpacing: '0.18em',
            textTransform: 'uppercase',
            color: 'rgba(240,236,230,0.55)',
          }}
        >
          Trainer
        </span>
        <span
          style={{
            display: 'block',
            fontWeight: 700,
            fontSize: `${Math.round(height * 0.68)}px`,
            letterSpacing: '-0.01em',
            textTransform: 'uppercase',
            color: '#8FD43A',
            marginTop: '-1px',
          }}
        >
          Boost
        </span>
      </div>
    </div>
  )
}
