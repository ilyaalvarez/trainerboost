'use client'

import Image from 'next/image'
import { getInitials } from '@/lib/utils'
import { cn } from '@/lib/utils'

interface AvatarProps {
  name: string
  url?: string | null
  size?: 'sm' | 'md' | 'lg' | 'xl'
  className?: string
}

// Pixel dimensions for each size variant
const sizeMap: Record<NonNullable<AvatarProps['size']>, { px: number; cls: string; text: string }> = {
  sm: { px: 28, cls: 'w-7 h-7',   text: 'text-[10px]' },
  md: { px: 36, cls: 'w-9 h-9',   text: 'text-xs'     },
  lg: { px: 44, cls: 'w-11 h-11', text: 'text-sm'     },
  xl: { px: 60, cls: 'w-[60px] h-[60px]', text: 'text-base' },
}

// Color palette cycling based on the char-code of the first letter
const colorPalette: string[] = [
  'bg-sky-600      text-sky-100',     // a, i, q, y
  'bg-violet-600   text-violet-100',  // b, j, r, z
  'bg-emerald-600  text-emerald-100', // c, k, s
  'bg-amber-600    text-amber-100',   // d, l, t
  'bg-rose-600     text-rose-100',    // e, m, u
  'bg-cyan-600     text-cyan-100',    // f, n, v
  'bg-orange-600   text-orange-100',  // g, o, w
  'bg-pink-600     text-pink-100',    // h, p, x
]

function getColorClass(name: string): string {
  const char = name.trim().toLowerCase().charCodeAt(0)
  const index = isNaN(char) ? 0 : char % colorPalette.length
  return colorPalette[index]
}

export default function Avatar({
  name,
  url,
  size = 'md',
  className = '',
}: AvatarProps) {
  const { px, cls, text } = sizeMap[size]
  const initials = getInitials(name)
  const colorClass = getColorClass(name)

  const base = cn(
    'relative rounded-full shrink-0 overflow-hidden select-none',
    cls,
    className,
  )

  if (url) {
    return (
      <div className={base}>
        <Image
          src={url}
          alt={name}
          width={px}
          height={px}
          className="w-full h-full object-cover"
          unoptimized
        />
      </div>
    )
  }

  return (
    <div className={cn(base, colorClass, 'flex items-center justify-center font-semibold', text)}>
      {initials}
    </div>
  )
}
