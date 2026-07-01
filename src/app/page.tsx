import { redirect } from 'next/navigation'
import { cookies } from 'next/headers'
import { DEFAULT_LOCALE, LOCALES, type Locale } from '@/messages/types'

export default async function RootPage() {
  const cookieStore = await cookies()
  const pref = cookieStore.get('tb-locale')?.value as Locale | undefined
  const locale = pref && LOCALES.includes(pref) ? pref : DEFAULT_LOCALE
  redirect(`/${locale}/`)
}
