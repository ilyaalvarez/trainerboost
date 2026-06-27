import type { SVGProps } from 'react'

interface LogoVerticalProps extends SVGProps<SVGSVGElement> {
  width?: number
  dark?: boolean
}

export default function LogoVertical({ width = 96, dark = true, ...props }: LogoVerticalProps) {
  const textColor = dark ? '#F1F5F9' : '#0A0A0A'
  const height = Math.round(width * 1.2)

  return (
    <svg
      width={width}
      height={height}
      viewBox="0 0 96 116"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      role="img"
      aria-label="TrainerBoost"
      {...props}
    >
      {/* Icon centered */}
      <path d="M48 4L76 18V50L48 64L20 50V18L48 4Z" fill="#8FD43A" />
      <path d="M52 10L38 38h12l-4 18 20-28H52L52 10Z" fill="#0A0A0A" />

      {/* TRAINER */}
      <text
        x="48"
        y="88"
        textAnchor="middle"
        fontFamily="'Barlow Condensed', 'Arial Narrow', sans-serif"
        fontWeight="800"
        fontSize="16"
        letterSpacing="0.05em"
        fill={textColor}
      >
        TRAINER
      </text>
      {/* BOOST */}
      <text
        x="48"
        y="108"
        textAnchor="middle"
        fontFamily="'Barlow Condensed', 'Arial Narrow', sans-serif"
        fontWeight="800"
        fontSize="16"
        letterSpacing="0.05em"
        fill="#8FD43A"
      >
        BOOST
      </text>
    </svg>
  )
}
