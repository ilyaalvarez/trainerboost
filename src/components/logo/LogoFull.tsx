import LogoIcon from './LogoIcon'
import type { HTMLAttributes } from 'react'

interface LogoFullProps extends HTMLAttributes<HTMLDivElement> {
  height?: number
  animated?: boolean
}

export default function LogoFull({ height = 28, animated = true, className = '', ...props }: LogoFullProps) {
  const iconSize = Math.round(height * 1.15)
  const fontSize = Math.round(height * 0.62)

  return (
    <div className={`flex items-center gap-2 select-none ${className}`} {...props}>
      <LogoIcon size={iconSize} animated={animated} />
      <div
        style={{
          fontFamily: 'var(--font-display, "Barlow Condensed", sans-serif)',
          fontWeight: 800,
          fontSize: `${fontSize}px`,
          letterSpacing: '-0.01em',
          textTransform: 'uppercase',
          lineHeight: 1,
        }}
      >
        <span style={{ color: '#E8FFD8' }}>TRAINER</span>
        <span style={{ color: '#C8FF47' }}>BOOST</span>
      </div>
    </div>
  )
}
