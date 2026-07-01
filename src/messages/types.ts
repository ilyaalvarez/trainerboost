export interface Messages {
  nav: {
    howItWorks: string
    faq: string
    waitlist: string
    ariaLabel: string
    goToTop: string
  }
  hero: {
    h1: string
    sub: string
    hint: string
  }
  pain: {
    sectionTitle: string
    items: Array<{ bad: string; good: string }>
    closeTitle: string
  }
  faq: {
    sectionTitle: string
    items: Array<{ q: string; a: string }>
  }
  cta: {
    h2: string
    sub: string
  }
  footer: {
    copy: string
    ariaLabel: string
    legalLinks: string
  }
  form: {
    placeholder: string
    buttonText: string
    ariaEmail: string
    ariaSubmit: string
    errorDefault: string
    errorNetwork: string
    successNew: string
    successAlready: string
    spotsLeft: string
  }
  a11y: {
    skipToContent: string
    mainContent: string
    painLabel: string
    ctaLabel: string
  }
}

export type Locale = 'es' | 'en'
export const LOCALES: Locale[] = ['es', 'en']
export const DEFAULT_LOCALE: Locale = 'es'
