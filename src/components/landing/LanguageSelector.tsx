'use client'
import { useRouter } from 'next/navigation'
import type { Locale } from '@/messages/types'

interface Props {
  locale: Locale
}

export function LanguageSelector({ locale }: Props) {
  const router = useRouter()

  const switchTo = (next: Locale) => {
    if (next === locale) return
    document.cookie = `tb-locale=${next};path=/;max-age=31536000;samesite=lax;secure`
    router.push(`/${next}/`)
  }

  return (
    <div className="lang-selector" aria-label="Idioma / Language">
      <button
        onClick={() => switchTo('es')}
        className={`lang-selector-btn${locale === 'es' ? ' lang-selector-btn--active' : ''}`}
        aria-current={locale === 'es' ? 'true' : undefined}
        aria-label="Español"
      >
        ES
      </button>
      <span className="lang-selector-sep" aria-hidden="true">/</span>
      <button
        onClick={() => switchTo('en')}
        className={`lang-selector-btn${locale === 'en' ? ' lang-selector-btn--active' : ''}`}
        aria-current={locale === 'en' ? 'true' : undefined}
        aria-label="English"
      >
        EN
      </button>
    </div>
  )
}
