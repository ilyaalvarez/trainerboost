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

export const CLIENTS = [
  {
    variant: 1,
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
    variant: 2,
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
    variant: 3,
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
    variant: 4,
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
] as const satisfies readonly ClientData[]

export const HERO_CLIENT: ClientData = CLIENTS[2] as ClientData
