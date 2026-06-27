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

      {/* Left disc — darker, receding */}
      <rect x="2" y="11" width="9" height="18" rx="2.5" fill="#7B1C10" />

      {/* Left collar */}
      <rect x="11" y="15" width="3.5" height="10" rx="1.5" fill="#A8281B" />

      {/* Center bar */}
      <rect x="14.5" y="18" width="11" height="4" rx="2" fill="#A8281B" />

      {/* Right collar */}
      <rect x="25.5" y="15" width="3.5" height="10" rx="1.5" fill="#A8281B" />

      {/* Right disc — brighter, coming forward */}
      <rect x="29" y="11" width="9" height="18" rx="2.5" fill="#C0392B" filter="url(#tb-disc-glow)" />

      {/* Accent dot — top corner of right disc */}
      <circle
        cx="33"
        cy="14"
        r="2.8"
        fill="#E74C3C"
        filter="url(#tb-acc-glow)"
        className={animated ? 'logo-peak-pulse' : undefined}
      />
    </svg>
  )
}
