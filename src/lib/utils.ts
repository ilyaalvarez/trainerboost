import { type ClassValue, clsx } from 'clsx'
import { twMerge } from 'tailwind-merge'
import { format, formatDistanceToNow, isToday, isTomorrow } from 'date-fns'
import { es } from 'date-fns/locale'

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function formatDate(date: string | Date, fmt = 'dd MMM yyyy') {
  return format(new Date(date), fmt, { locale: es })
}

export function formatRelative(date: string | Date) {
  const d = new Date(date)
  if (isToday(d)) return `Hoy ${format(d, 'HH:mm')}`
  if (isTomorrow(d)) return `Mañana ${format(d, 'HH:mm')}`
  return format(d, "EEE dd MMM · HH:mm", { locale: es })
}

export function timeAgo(date: string | Date) {
  return formatDistanceToNow(new Date(date), { locale: es, addSuffix: true })
}

export function getInitials(name: string) {
  return name
    .split(' ')
    .slice(0, 2)
    .map(n => n[0])
    .join('')
    .toUpperCase()
}

export function formatCurrency(amount: number, currency = 'EUR') {
  return new Intl.NumberFormat('es-ES', {
    style: 'currency',
    currency,
    minimumFractionDigits: 0,
  }).format(amount)
}

export function slugify(text: string) {
  return text
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/(^-|-$)/g, '')
}

export function calculateMacroCalories(protein: number, carbs: number, fat: number) {
  return protein * 4 + carbs * 4 + fat * 9
}
