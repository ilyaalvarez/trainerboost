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
        <filter id="tb-peak-glow" x="-80%" y="-80%" width="260%" height="260%">
          <feGaussianBlur stdDeviation="2.5" result="blur" />
          <feMerge>
            <feMergeNode in="blur" />
            <feMergeNode in="SourceGraphic" />
          </feMerge>
        </filter>
        <filter id="tb-bar3-glow" x="-20%" y="-10%" width="140%" height="120%">
          <feGaussianBlur stdDeviation="1.5" result="blur" />
          <feMerge>
            <feMergeNode in="blur" />
            <feMergeNode in="SourceGraphic" />
          </feMerge>
        </filter>
      </defs>

      {/* Bar 1 — lowest, darkest */}
      <rect x="2" y="27" width="10" height="11" rx="2" fill="#7B1C10" />

      {/* Bar 2 — middle */}
      <rect x="15" y="18" width="10" height="20" rx="2" fill="#A8281B" />

      {/* Bar 3 — tallest, full crimson with glow */}
      <rect x="28" y="9" width="10" height="29" rx="2" fill="#C0392B" filter="url(#tb-bar3-glow)" />

      {/* Trend line connecting bar tops */}
      <polyline
        points="7,27 20,18 33,9"
        stroke="rgba(240,236,230,0.32)"
        strokeWidth="1.4"
        strokeLinecap="round"
        strokeLinejoin="round"
      />

      {/* Peak indicator — bright accent dot */}
      <circle
        cx="33" cy="9" r="2.8"
        fill="#E74C3C"
        filter="url(#tb-peak-glow)"
        className={animated ? 'logo-peak-pulse' : undefined}
      />
    </svg>
  )
}
