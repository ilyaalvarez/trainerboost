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
        <radialGradient id="tb-core" cx="50%" cy="50%" r="50%">
          <stop offset="0%"   stopColor="#F0C040" />
          <stop offset="100%" stopColor="#C07020" />
        </radialGradient>
        <filter id="tb-glow" x="-40%" y="-40%" width="180%" height="180%">
          <feGaussianBlur stdDeviation="1.8" result="blur" />
          <feMerge>
            <feMergeNode in="blur" />
            <feMergeNode in="SourceGraphic" />
          </feMerge>
        </filter>
      </defs>

      {/* Outer orbit — dashed ring, slow clockwise */}
      <g className={animated ? 'logo-orbit-outer' : undefined}>
        <circle cx="20" cy="20" r="18" stroke="#D4892A" strokeWidth="0.6"
          fill="none" strokeDasharray="5 3.5" opacity="0.28" />
      </g>

      {/* Inner orbit + satellite dot — counter-clockwise */}
      <g className={animated ? 'logo-orbit-inner' : undefined}>
        <circle cx="20" cy="20" r="13" stroke="#D4892A" strokeWidth="0.9"
          fill="none" opacity="0.52" />
        <circle cx="20" cy="7" r="1.8" fill="#F0C040" filter="url(#tb-glow)" />
      </g>

      {/* Core — the boost canister */}
      <circle cx="20" cy="20" r="9" fill="url(#tb-core)" filter="url(#tb-glow)" />

      {/* Double chevron UP */}
      <path d="M15 22.5l5-5 5 5"
        stroke="#080810" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round" />
      <path d="M15 26l5-5 5 5"
        stroke="#080810" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round"
        opacity="0.32" />
    </svg>
  )
}
