import { siteConfig } from '../../../config/site'

export function getSoftwareAppSchema() {
  return {
    '@context': 'https://schema.org',
    '@type': 'SoftwareApplication',
    name: siteConfig.name,
    applicationCategory: 'BusinessApplication',
    operatingSystem: 'Web, iOS, Android',
    url: siteConfig.url,
    description: siteConfig.description,
    offers: [
      { '@type': 'Offer', name: 'Gratis',   price: '0',                         priceCurrency: 'EUR' },
      { '@type': 'Offer', name: 'Starter',  price: String(siteConfig.pricing.starter),  priceCurrency: 'EUR' },
      { '@type': 'Offer', name: 'Pro',      price: String(siteConfig.pricing.pro),       priceCurrency: 'EUR' },
      { '@type': 'Offer', name: 'Business', price: String(siteConfig.pricing.business),  priceCurrency: 'EUR' },
    ],
    inLanguage: 'es',
    countryOfOrigin: 'ES',
  }
}

export function getOrganizationSchema() {
  return {
    '@context': 'https://schema.org',
    '@type': 'Organization',
    name: siteConfig.name,
    url: siteConfig.url,
    logo: `${siteConfig.url}/brand/logo-full.svg`,
    sameAs: [
      siteConfig.social.instagram,
      siteConfig.social.tiktok,
      siteConfig.social.twitter,
    ],
    contactPoint: {
      '@type': 'ContactPoint',
      contactType: 'customer support',
      availableLanguage: 'Spanish',
    },
  }
}

export function getFAQSchema(faqs: Array<{ q: string; a: string }>) {
  return {
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    mainEntity: faqs.map(({ q, a }) => ({
      '@type': 'Question',
      name: q,
      acceptedAnswer: { '@type': 'Answer', text: a },
    })),
  }
}
