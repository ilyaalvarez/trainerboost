export interface ClientData {
  variant: 1 | 2 | 3 | 4
  name: string
  city: string
  goal: string
  progress: number
  weeks: number
  metrics: { weight: string; strength: string; label: string }
  badge: string
  bg: string
  nextSession: string
  adherence: number
  totalSessions: number
}

const CLIENTS_ES = [
  {
    variant: 1 as const,
    name: 'Alejandro M.',
    city: 'Madrid',
    goal: 'Pérdida de peso',
    progress: 12,
    weeks: 2,
    metrics: { weight: '-1.2kg', strength: '+0%', label: 'Empezando' },
    badge: 'NUEVO',
    bg: 'radial-gradient(ellipse 60% 40% at 50% 60%, rgba(143,212,58,0.04) 0%, transparent 70%)',
    nextSession: 'Lun, 30 jun',
    adherence: 75,
    totalSessions: 4,
  },
  {
    variant: 2 as const,
    name: 'Sara L.',
    city: 'Barcelona',
    goal: 'Ganancia muscular',
    progress: 45,
    weeks: 10,
    metrics: { weight: '+2.1kg', strength: '+28%', label: 'En progreso' },
    badge: 'EN PROGRESO',
    bg: 'radial-gradient(ellipse 60% 40% at 50% 60%, rgba(143,212,58,0.08) 0%, transparent 70%)',
    nextSession: 'Mié, 2 jul',
    adherence: 88,
    totalSessions: 22,
  },
  {
    variant: 3 as const,
    name: 'Carlos R.',
    city: 'Valencia',
    goal: 'Rendimiento deportivo',
    progress: 78,
    weeks: 24,
    metrics: { weight: '-12kg', strength: '+41%', label: 'Transformando' },
    badge: 'TRANSFORMANDO',
    bg: 'radial-gradient(ellipse 70% 50% at 50% 60%, rgba(143,212,58,0.14) 0%, transparent 70%)',
    nextSession: 'Mar, 1 jul',
    adherence: 92,
    totalSessions: 67,
  },
  {
    variant: 4 as const,
    name: 'María G.',
    city: 'Sevilla',
    goal: 'Maratón completado',
    progress: 100,
    weeks: 32,
    metrics: { weight: '-15kg', strength: '×2', label: 'Objetivo cumplido' },
    badge: 'COMPLETADO',
    bg: 'radial-gradient(ellipse 70% 50% at 50% 60%, rgba(180,220,80,0.18) 0%, transparent 70%)',
    nextSession: 'Objetivo alcanzado',
    adherence: 96,
    totalSessions: 92,
  },
] satisfies ClientData[]

const CLIENTS_EN = [
  {
    variant: 1 as const,
    name: 'Alex M.',
    city: 'Madrid',
    goal: 'Weight loss',
    progress: 12,
    weeks: 2,
    metrics: { weight: '-1.2kg', strength: '+0%', label: 'Starting' },
    badge: 'NEW',
    bg: 'radial-gradient(ellipse 60% 40% at 50% 60%, rgba(143,212,58,0.04) 0%, transparent 70%)',
    nextSession: 'Mon, Jun 30',
    adherence: 75,
    totalSessions: 4,
  },
  {
    variant: 2 as const,
    name: 'Sara L.',
    city: 'Barcelona',
    goal: 'Muscle gain',
    progress: 45,
    weeks: 10,
    metrics: { weight: '+2.1kg', strength: '+28%', label: 'In progress' },
    badge: 'IN PROGRESS',
    bg: 'radial-gradient(ellipse 60% 40% at 50% 60%, rgba(143,212,58,0.08) 0%, transparent 70%)',
    nextSession: 'Wed, Jul 2',
    adherence: 88,
    totalSessions: 22,
  },
  {
    variant: 3 as const,
    name: 'Carlos R.',
    city: 'Valencia',
    goal: 'Athletic performance',
    progress: 78,
    weeks: 24,
    metrics: { weight: '-12kg', strength: '+41%', label: 'Transforming' },
    badge: 'TRANSFORMING',
    bg: 'radial-gradient(ellipse 70% 50% at 50% 60%, rgba(143,212,58,0.14) 0%, transparent 70%)',
    nextSession: 'Tue, Jul 1',
    adherence: 92,
    totalSessions: 67,
  },
  {
    variant: 4 as const,
    name: 'María G.',
    city: 'Seville',
    goal: 'Marathon completed',
    progress: 100,
    weeks: 32,
    metrics: { weight: '-15kg', strength: '×2', label: 'Goal reached' },
    badge: 'COMPLETED',
    bg: 'radial-gradient(ellipse 70% 50% at 50% 60%, rgba(180,220,80,0.18) 0%, transparent 70%)',
    nextSession: 'Goal achieved',
    adherence: 96,
    totalSessions: 92,
  },
] satisfies ClientData[]

// Backwards-compatible exports (español por defecto)
export const CLIENTS = CLIENTS_ES
export const HERO_CLIENT: ClientData = CLIENTS_ES[2]

// Locale-aware getters
export function getClients(locale: string = 'es'): ClientData[] {
  return locale === 'en' ? CLIENTS_EN : CLIENTS_ES
}
export function getHeroClient(locale: string = 'es'): ClientData {
  return getClients(locale)[2]
}
