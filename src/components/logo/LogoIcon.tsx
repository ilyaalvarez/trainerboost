import type { SVGProps } from 'react'

interface LogoIconProps extends SVGProps<SVGSVGElement> {
  size?: number
  animated?: boolean
}

export default function LogoIcon({ size = 32, animated = true, ...props }: LogoIconProps) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 40 40"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      aria-hidden="true"
      {...props}
    >
      <defs>
        <filter id="tb-acc-glow" x="-80%" y="-80%" width="260%" height="260%">
          <feGaussianBlur stdDeviation="2.5" result="blur" />
          <feMerge>
            <feMergeNode in="blur" />
            <feMergeNode in="SourceGraphic" />
          </feMerge>
        </filter>
        <filter id="tb-disc-glow" x="-20%" y="-15%" width="140%" height="130%">
          <feGaussianBlur stdDeviation="1.5" result="blur" />
          <feMerge>
            <feMergeNode in="blur" />
            <feMergeNode in="SourceGraphic" />
          </feMerge>
        </filter>
      </defs>

      {/* Base — suelo, más oscuro */}
      <rect x="11" y="34" width="18" height="4" rx="2" fill="#2D6A05" />

      {/* Stem */}
      <rect x="17" y="24" width="6" height="12" rx="2" fill="#4A8B12" />

      {/* Saddle — cuerpo principal de la seta */}
      <rect x="3" y="19" width="34" height="11" rx="5.5" fill="#6CB52A" filter="url(#tb-disc-glow)" />

      {/* Left pommel — en sombra, retrocede */}
      <rect x="8" y="10" width="8" height="12" rx="3" fill="#5A9B1A" />

      {/* Right pommel — verde marca, avanza */}
      <rect x="24" y="10" width="8" height="12" rx="3" fill="#8FD43A" />

      {/* Accent dot — punto más alto, pulsando */}
      <circle
        cx="28"
        cy="11"
        r="2.5"
        fill="#B4F060"
        filter="url(#tb-acc-glow)"
        className={animated ? 'logo-peak-pulse' : undefined}
      />
    </svg>
  )
}
