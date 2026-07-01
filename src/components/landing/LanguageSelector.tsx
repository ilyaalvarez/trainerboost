'use client'
import { useRouter } from 'next/navigation'
import type { Locale } from '@/messages/types'

interface Props {
  locale: Locale
}

export function LanguageSelector({ locale }: Props) {
  const router = useRouter()

  const handleChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const next = e.target.value as Locale
    document.cookie = `tb-locale=${next};path=/;max-age=31536000;samesite=lax;secure`
    router.push(`/${next}/`)
  }

  return (
    <select
      value={locale}
      onChange={handleChange}
      className="lang-select"
      aria-label="Language / Idioma"
    >
      <option value="es">ES</option>
      <option value="en">EN</option>
    </select>
  )
}
