import type { SVGProps } from 'react'

interface LogoIconProps extends SVGProps<SVGSVGElement> {
  size?: number
}

export default function LogoIcon({ size = 32, ...props }: LogoIconProps) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 32 32"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      aria-hidden="true"
      {...props}
    >
      {/* Hexagonal badge — gaming identity */}
      <path
        d="M16 2L28 8.5V23.5L16 30L4 23.5V8.5L16 2Z"
        fill="#8FD43A"
      />
      {/* Lightning bolt — fitness power */}
      <path
        d="M18.5 6L11 17h6l-1.5 9 9-12h-6.5L18.5 6Z"
        fill="#0A0A0A"
        strokeLinejoin="round"
      />
    </svg>
  )
}
