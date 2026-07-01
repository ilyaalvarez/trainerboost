import type { BlogArticle } from './types'
import comoOrganizar from './como-organizar-clientes-entrenamiento-personal'
import fichaCliente from './ficha-cliente-entrenador-personal'
import comoCobrar from './como-cobrar-clientes-entrenamiento-personal'
import mejorSoftware from './mejor-software-entrenador-personal'
import cuantoCobra from './cuanto-cobra-entrenador-personal-espana'

export const ARTICLES: BlogArticle[] = [
  cuantoCobra,   // mayor volumen de búsquedas
  comoOrganizar,
  fichaCliente,
  comoCobrar,
  mejorSoftware,
]

export function getArticle(slug: string): BlogArticle | undefined {
  return ARTICLES.find(a => a.slug === slug)
}

export function getRelatedArticles(slug: string): BlogArticle[] {
  const article = getArticle(slug)
  if (!article) return []
  return article.relatedSlugs
    .map(s => getArticle(s))
    .filter((a): a is BlogArticle => a !== undefined)
    .slice(0, 3)
}
