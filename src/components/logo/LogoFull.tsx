import type { SVGProps } from 'react'

interface LogoFullProps extends SVGProps<SVGSVGElement> {
  height?: number
  dark?: boolean
}

export default function LogoFull({ height = 32, dark = true, ...props }: LogoFullProps) {
  const textColor = dark ? '#F1F5F9' : '#0A0A0A'
  const width = Math.round(height * 4.5)

  return (
    <svg
      width={width}
      height={height}
      viewBox="0 0 144 32"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      role="img"
      aria-label="TrainerBoost"
      {...props}
    >
      {/* Icon */}
      <path d="M16 2L28 8.5V23.5L16 30L4 23.5V8.5L16 2Z" fill="#8FD43A" />
      <path d="M18.5 6L11 17h6l-1.5 9 9-12h-6.5L18.5 6Z" fill="#0A0A0A" />

      {/* Wordmark — uses system font stack at render, SVG text for portability */}
      <text
        x="36"
        y="22"
        fontFamily="'Barlow Condensed', 'Arial Narrow', sans-serif"
        fontWeight="800"
        fontSize="18"
        letterSpacing="-0.02em"
        fill={textColor}
      >
        TRAINER
      </text>
      <text
        x="95"
        y="22"
        fontFamily="'Barlow Condensed', 'Arial Narrow', sans-serif"
        fontWeight="800"
        fontSize="18"
        letterSpacing="-0.02em"
        fill="#8FD43A"
      >
        BOOST
      </text>
    </svg>
  )
}
