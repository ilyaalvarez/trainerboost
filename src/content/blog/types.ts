export interface BlogSection {
  type: 'h2' | 'h3' | 'p' | 'ul' | 'ol' | 'callout' | 'cta'
  text?: string
  items?: string[]
  variant?: 'tip' | 'info'
}

export interface BlogArticle {
  slug: string
  title: string
  description: string
  datePublished: string
  dateModified: string
  category: string
  categorySlug: string
  readingTime: number
  faqs: { q: string; a: string }[]
  sections: BlogSection[]
  relatedSlugs: string[]
}
