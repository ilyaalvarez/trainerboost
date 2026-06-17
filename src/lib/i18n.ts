/**
 * Minimal i18n wrapper — Phase 12 preparation.
 *
 * Currently only supports Spanish (es). When multi-language support is added:
 * 1. Replace the `es` import with a dynamic loader based on the user's locale.
 * 2. Wrap the app in a context provider that sets `currentLocale`.
 * 3. All call sites of `t()` are already in place — no refactoring needed.
 *
 * Usage:
 *   import { t } from '@/lib/i18n'
 *   <h1>{t('dashboard.title')}</h1>
 */

import es from '../../locales/es.json'

type Translations = typeof es

function getNestedValue(obj: Record<string, unknown>, path: string): string {
  const keys = path.split('.')
  let current: unknown = obj
  for (const key of keys) {
    if (current == null || typeof current !== 'object') return path
    current = (current as Record<string, unknown>)[key]
  }
  return typeof current === 'string' ? current : path
}

export function t(key: keyof Translations | string, params?: Record<string, string | number>): string {
  let str = getNestedValue(es as unknown as Record<string, unknown>, key as string)
  if (params) {
    Object.entries(params).forEach(([k, v]) => {
      str = str.replace(new RegExp(`\\{\\{${k}\\}\\}`, 'g'), String(v))
    })
  }
  return str
}
