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

      {/* Base — planta, la mas oscura */}
      <rect x="11" y="34" width="18" height="4" rx="2" fill="#2D6A05" />

      {/* Stem */}
      <rect x="17" y="26" width="6" height="10" rx="2" fill="#4A8B12" />

      {/* Saddle — oval, cuerpo principal de la seta */}
      <ellipse cx="20" cy="23" rx="17" ry="8" fill="#6CB52A" filter="url(#tb-disc-glow)" />

      {/* Accent dot — cima del ovalo, pulsando */}
      <circle
        cx="28"
        cy="16"
        r="2.5"
        fill="#B4F060"
        filter="url(#tb-acc-glow)"
        className={animated ? 'logo-peak-pulse' : undefined}
      />
    </svg>
  )
}
