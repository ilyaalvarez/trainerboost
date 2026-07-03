'use client'

import { useState, useEffect, useRef, useMemo } from 'react'
import Link from 'next/link'
import {
  Zap, LayoutDashboard, Users, Dumbbell, UtensilsCrossed, CalendarDays,
  MessageSquare, Settings, CreditCard, BarChart2, Clock, TrendingUp, Plus,
  Check, Flame, ArrowUpRight, Award, ChevronRight, Activity,
  Video, MapPin, Trophy, Search, X, Send, ChevronDown, GripVertical, Phone,
  Mail, Trash2, ArrowLeft, List,
} from 'lucide-react'
import StatsCard from '@/components/ui/StatsCard'
import Badge from '@/components/ui/Badge'
import Modal from '@/components/ui/Modal'
import DemoWaitlistCTA from '@/components/demo/DemoWaitlistCTA'

// ─── Types ────────────────────────────────────────────────────────────────────
type ClientStatus = 'active' | 'paused'
type AptStatus    = 'confirmed' | 'pending' | 'done'
type AptType      = 'Online' | 'Presencial' | 'Llamada'
type StatusFilter = 'all' | 'active' | 'paused'

interface Client {
  id: number; initials: string; name: string; status: ClientStatus
  since: string; plan: string; sessions: number; goal: number
  weightLoss: number; streak: number; nextApt: string; routine: string
  colorClass: string; ringColor: string; email: string; phone: string
}
interface Exercise { name: string; sets: number; reps: number; rest: number; notes: string | null }
interface Routine  { id: number; name: string; days: string; clients: number; level: string; exercises: Exercise[]; completion: number }
interface NutritionMeal { time: string; name: string; kcal: number; p: number; c: number; f: number }
interface NutritionPlan { clientId: number; kcal: number; protein: number; carbs: number; fat: number; meals: NutritionMeal[] }
interface Appointment   { id: number; client: string; initials: string; colorClass: string; time: string; date: string; duration: number; type: AptType; status: AptStatus }
interface ChatMessage   { from: 'trainer' | 'client'; text: string; time: string }
interface Conversation  { id: number; initials: string; colorClass: string; name: string; unread: boolean; lastTime: string; thread: ChatMessage[] }
interface NewExercise   { name: string; sets: string; reps: string; rest: string }
interface CalApt       { id: number; dayOffset: number; time: string; client: string; initials: string; colorClass: string; borderColor: string; type: AptType; duration: number }
interface MonthApt     { id: number; monthOffset: number; time: string; client: string; initials: string; borderColor: string }
type ViewMode          = 'list' | 'week' | 'month'

// ─── Hooks ────────────────────────────────────────────────────────────────────
function useCountUp(target: number, dur = 1000): number {
  const [v, setV] = useState(0)
  useEffect(() => {
    let s: number | null = null
    const step = (ts: number) => { if (!s) s = ts; const p = Math.min((ts - s) / dur, 1); setV(Math.round(p * target)); if (p < 1) requestAnimationFrame(step) }
    const id = requestAnimationFrame(step)
    return () => cancelAnimationFrame(id)
  }, [target, dur])
  return v
}

// ─── SVG Ring ─────────────────────────────────────────────────────────────────
function Ring({ pct, size = 52, stroke = 5, color = '#0EA5E9' }: { pct: number; size?: number; stroke?: number; color?: string }) {
  const r = (size - stroke * 2) / 2, c = 2 * Math.PI * r
  return (
    <svg width={size} height={size} className="shrink-0" style={{ transform: 'rotate(-90deg)' }}>
      <circle cx={size/2} cy={size/2} r={r} fill="none" stroke="rgba(255,255,255,0.06)" strokeWidth={stroke} />
      <circle cx={size/2} cy={size/2} r={r} fill="none" stroke={color} strokeWidth={stroke}
        strokeDasharray={c} strokeDashoffset={c - (pct/100)*c}
        style={{ transition: 'stroke-dashoffset 1s ease', strokeLinecap: 'round' }} />
    </svg>
  )
}

// ─── Mock Data ────────────────────────────────────────────────────────────────
const NAV = [
  { icon: LayoutDashboard, label: 'Panel',     key: 'dashboard' },
  { icon: Users,           label: 'Clientes',  key: 'clients'   },
  { icon: Dumbbell,        label: 'Rutinas',   key: 'routines'  },
  { icon: UtensilsCrossed, label: 'Nutrición', key: 'nutrition' },
  { icon: CalendarDays,    label: 'Citas',     key: 'appointments' },
  { icon: MessageSquare,   label: 'Mensajes',  key: 'messages', badge: true },
  { icon: BarChart2,       label: 'Analytics', key: 'analytics' },
]

const ALL_CLIENTS: Client[] = [
  { id: 1, initials: 'AG', name: 'Ana García',      status: 'active', since: '12 Ene 2025', plan: 'Pro',    sessions: 18, goal: 20, weightLoss: 2.8, streak: 12, nextApt: 'Hoy · 11:30', routine: 'Fuerza + Hipertrofia', colorClass: 'bg-sky-500/20 text-sky-300',        ringColor: '#0EA5E9', email: 'ana@email.com',   phone: '+34 600 111 222' },
  { id: 2, initials: 'PL', name: 'Pedro López',     status: 'active', since: '3 Feb 2025',  plan: 'Pro',    sessions: 14, goal: 20, weightLoss: 1.2, streak: 8,  nextApt: 'Vie · 09:00', routine: 'Cardio + Core',         colorClass: 'bg-violet-500/20 text-violet-300',  ringColor: '#7C3AED', email: 'pedro@email.com', phone: '+34 655 333 444' },
  { id: 3, initials: 'MF', name: 'María Fernández', status: 'active', since: '20 Feb 2025', plan: 'Básico', sessions: 10, goal: 12, weightLoss: 0.8, streak: 5,  nextApt: 'Hoy · 16:00', routine: 'Full Body Express',      colorClass: 'bg-emerald-500/20 text-emerald-300',ringColor: '#10B981', email: 'maria@email.com', phone: '+34 677 555 666' },
  { id: 4, initials: 'JR', name: 'Jorge Ruiz',      status: 'paused', since: '5 Mar 2025',  plan: 'Pro',    sessions: 6,  goal: 20, weightLoss: 0,   streak: 0,  nextApt: '—',           routine: '—',                     colorClass: 'bg-amber-500/20 text-amber-300',    ringColor: '#F59E0B', email: 'jorge@email.com', phone: '+34 622 777 888' },
]

const INIT_ROUTINES: Routine[] = [
  { id: 1, name: 'Fuerza + Hipertrofia', days: 'Lun · Mié · Vie', clients: 2, level: 'Intermedio',  completion: 87,
    exercises: [
      { name: 'Press de banca',  sets: 4, reps: 10, rest: 90,  notes: 'Bajar controlado, 2s excéntrico' },
      { name: 'Sentadilla libre',sets: 4, reps: 8,  rest: 120, notes: 'Profundidad paralela' },
      { name: 'Remo con barra',  sets: 3, reps: 12, rest: 75,  notes: 'Codos pegados al cuerpo' },
      { name: 'Press militar',   sets: 3, reps: 10, rest: 90,  notes: null },
      { name: 'Fondos en barra', sets: 3, reps: 12, rest: 60,  notes: 'Ligera inclinación' },
    ] },
  { id: 2, name: 'Cardio + Core', days: 'Mar · Jue', clients: 1, level: 'Principiante', completion: 92,
    exercises: [
      { name: 'Plancha',          sets: 3, reps: 0,  rest: 60, notes: '45 segundos por serie' },
      { name: 'Burpees',          sets: 4, reps: 10, rest: 60, notes: 'Ritmo constante' },
      { name: 'Mountain climbers',sets: 3, reps: 0,  rest: 45, notes: '30 segundos por serie' },
      { name: 'Abdominales',      sets: 3, reps: 20, rest: 45, notes: null },
    ] },
  { id: 3, name: 'Full Body Express', days: 'Lun · Mié', clients: 1, level: 'Avanzado', completion: 75,
    exercises: [
      { name: 'Peso muerto', sets: 4, reps: 6,  rest: 120, notes: 'Espalda recta' },
      { name: 'Dominadas',   sets: 3, reps: 8,  rest: 90,  notes: 'Agarre pronado' },
      { name: 'Zancadas',    sets: 3, reps: 12, rest: 60,  notes: 'Alternadas por pierna' },
      { name: 'Core total',  sets: 3, reps: 0,  rest: 60,  notes: '1 minuto de circuito' },
    ] },
]

const INIT_NUTRITION: NutritionPlan[] = [
  { clientId: 1, kcal: 2800, protein: 155, carbs: 310, fat: 70,
    meals: [
      { time: '08:00', name: 'Avena + proteína + plátano',    kcal: 420, p: 35, c: 58, f: 9  },
      { time: '13:00', name: 'Pollo + arroz + ensalada',      kcal: 680, p: 52, c: 72, f: 14 },
      { time: '17:00', name: 'Yogur griego + frutos secos',   kcal: 280, p: 20, c: 18, f: 16 },
      { time: '20:30', name: 'Merluza + verduras + patata',   kcal: 510, p: 45, c: 38, f: 12 },
    ] },
  { clientId: 2, kcal: 2400, protein: 130, carbs: 260, fat: 65,
    meals: [
      { time: '07:30', name: 'Tostadas + huevos + aguacate',  kcal: 380, p: 28, c: 42, f: 12 },
      { time: '13:00', name: 'Lentejas + arroz integral',     kcal: 550, p: 24, c: 88, f: 8  },
      { time: '19:30', name: 'Salmón + espárragos + quinoa',  kcal: 480, p: 42, c: 38, f: 18 },
    ] },
  { clientId: 3, kcal: 1800, protein: 110, carbs: 200, fat: 55,
    meals: [
      { time: '08:30', name: 'Smoothie proteico + tostada',   kcal: 320, p: 28, c: 38, f: 6  },
      { time: '14:00', name: 'Pechuga + quinoa + verduras',   kcal: 490, p: 42, c: 52, f: 10 },
      { time: '20:00', name: 'Tortilla francesa + ensalada',  kcal: 360, p: 28, c: 18, f: 20 },
    ] },
]

const INIT_APPOINTMENTS: Appointment[] = [
  { id: 1, client: 'Ana García',  initials: 'AG', colorClass: 'bg-sky-500/20 text-sky-300',        date: 'Hoy',        time: '09:00', duration: 60, type: 'Online',     status: 'confirmed' },
  { id: 2, client: 'Pedro López', initials: 'PL', colorClass: 'bg-violet-500/20 text-violet-300',  date: 'Hoy',        time: '11:30', duration: 45, type: 'Presencial', status: 'pending'   },
  { id: 3, client: 'María Fdez.', initials: 'MF', colorClass: 'bg-emerald-500/20 text-emerald-300',date: 'Hoy',        time: '16:00', duration: 60, type: 'Online',     status: 'confirmed' },
  { id: 4, client: 'Ana García',  initials: 'AG', colorClass: 'bg-sky-500/20 text-sky-300',        date: 'Lun 2 Jun', time: '10:00', duration: 90, type: 'Presencial', status: 'pending'   },
  { id: 5, client: 'Pedro López', initials: 'PL', colorClass: 'bg-violet-500/20 text-violet-300',  date: 'Vie 6 Jun', time: '09:00', duration: 60, type: 'Online',     status: 'pending'   },
]

const CALENDAR_WEEK: CalApt[] = [
  { id: 1,  dayOffset: 0, time: '09:00', client: 'Ana García',      initials: 'AG', colorClass: 'bg-sky-500/10',      borderColor: '#0EA5E9', type: 'Online',     duration: 60 },
  { id: 2,  dayOffset: 0, time: '17:00', client: 'Pedro López',     initials: 'PL', colorClass: 'bg-violet-500/10',   borderColor: '#7C3AED', type: 'Presencial', duration: 60 },
  { id: 3,  dayOffset: 1, time: '10:30', client: 'María Fdez.',     initials: 'MF', colorClass: 'bg-emerald-500/10',  borderColor: '#10B981', type: 'Presencial', duration: 45 },
  { id: 4,  dayOffset: 2, time: '09:00', client: 'Ana García',      initials: 'AG', colorClass: 'bg-sky-500/10',      borderColor: '#0EA5E9', type: 'Online',     duration: 60 },
  { id: 5,  dayOffset: 2, time: '11:00', client: 'Sofía Martín',    initials: 'SM', colorClass: 'bg-rose-500/10',     borderColor: '#F43F5E', type: 'Online',     duration: 45 },
  { id: 6,  dayOffset: 3, time: '09:00', client: 'Ana García',      initials: 'AG', colorClass: 'bg-sky-500/10',      borderColor: '#0EA5E9', type: 'Online',     duration: 60 },
  { id: 7,  dayOffset: 3, time: '11:30', client: 'Pedro López',     initials: 'PL', colorClass: 'bg-violet-500/10',   borderColor: '#7C3AED', type: 'Presencial', duration: 45 },
  { id: 8,  dayOffset: 3, time: '16:00', client: 'María Fdez.',     initials: 'MF', colorClass: 'bg-emerald-500/10',  borderColor: '#10B981', type: 'Online',     duration: 60 },
  { id: 9,  dayOffset: 4, time: '09:00', client: 'Sofía Martín',    initials: 'SM', colorClass: 'bg-rose-500/10',     borderColor: '#F43F5E', type: 'Presencial', duration: 60 },
  { id: 10, dayOffset: 4, time: '17:30', client: 'Pedro López',     initials: 'PL', colorClass: 'bg-violet-500/10',   borderColor: '#7C3AED', type: 'Online',     duration: 60 },
]

const MONTH_APTS: MonthApt[] = [
  // Semana -2
  { id:101, monthOffset:-10, time:'09:00', client:'Ana García',    initials:'AG', borderColor:'#0EA5E9' },
  { id:102, monthOffset:-10, time:'10:30', client:'María Fdez.',   initials:'MF', borderColor:'#10B981' },
  { id:103, monthOffset: -9, time:'17:00', client:'Pedro López',   initials:'PL', borderColor:'#7C3AED' },
  { id:104, monthOffset: -9, time:'16:00', client:'Sofía Martín',  initials:'SM', borderColor:'#F43F5E' },
  { id:105, monthOffset: -8, time:'09:00', client:'Ana García',    initials:'AG', borderColor:'#0EA5E9' },
  { id:106, monthOffset: -7, time:'11:00', client:'Jorge Ruiz',    initials:'JR', borderColor:'#F59E0B' },
  { id:107, monthOffset: -7, time:'17:00', client:'Pedro López',   initials:'PL', borderColor:'#7C3AED' },
  { id:108, monthOffset: -6, time:'09:00', client:'Ana García',    initials:'AG', borderColor:'#0EA5E9' },
  { id:109, monthOffset: -6, time:'16:00', client:'Sofía Martín',  initials:'SM', borderColor:'#F43F5E' },
  // Semana -1
  { id:110, monthOffset: -3, time:'09:00', client:'Ana García',    initials:'AG', borderColor:'#0EA5E9' },
  { id:111, monthOffset: -3, time:'10:30', client:'María Fdez.',   initials:'MF', borderColor:'#10B981' },
  { id:112, monthOffset: -2, time:'17:00', client:'Pedro López',   initials:'PL', borderColor:'#7C3AED' },
  { id:113, monthOffset: -2, time:'16:00', client:'Sofía Martín',  initials:'SM', borderColor:'#F43F5E' },
  { id:114, monthOffset: -1, time:'09:00', client:'Ana García',    initials:'AG', borderColor:'#0EA5E9' },
  { id:115, monthOffset: -1, time:'10:30', client:'María Fdez.',   initials:'MF', borderColor:'#10B981' },
  // Esta semana
  { id:116, monthOffset:  0, time:'11:00', client:'Jorge Ruiz',    initials:'JR', borderColor:'#F59E0B' },
  { id:117, monthOffset:  0, time:'17:00', client:'Pedro López',   initials:'PL', borderColor:'#7C3AED' },
  { id:118, monthOffset:  1, time:'09:00', client:'Ana García',    initials:'AG', borderColor:'#0EA5E9' },
  { id:119, monthOffset:  1, time:'16:00', client:'Sofía Martín',  initials:'SM', borderColor:'#F43F5E' },
  // Semana +1
  { id:120, monthOffset:  4, time:'09:00', client:'Ana García',    initials:'AG', borderColor:'#0EA5E9' },
  { id:121, monthOffset:  4, time:'10:30', client:'María Fdez.',   initials:'MF', borderColor:'#10B981' },
  { id:122, monthOffset:  5, time:'17:00', client:'Pedro López',   initials:'PL', borderColor:'#7C3AED' },
  { id:123, monthOffset:  5, time:'16:00', client:'Sofía Martín',  initials:'SM', borderColor:'#F43F5E' },
  { id:124, monthOffset:  6, time:'09:00', client:'Ana García',    initials:'AG', borderColor:'#0EA5E9' },
  { id:125, monthOffset:  6, time:'10:30', client:'María Fdez.',   initials:'MF', borderColor:'#10B981' },
  { id:126, monthOffset:  7, time:'11:00', client:'Jorge Ruiz',    initials:'JR', borderColor:'#F59E0B' },
  { id:127, monthOffset:  7, time:'17:00', client:'Pedro López',   initials:'PL', borderColor:'#7C3AED' },
  { id:128, monthOffset:  8, time:'09:00', client:'Ana García',    initials:'AG', borderColor:'#0EA5E9' },
  { id:129, monthOffset:  8, time:'16:00', client:'Sofía Martín',  initials:'SM', borderColor:'#F43F5E' },
  // Semana +2
  { id:130, monthOffset: 11, time:'09:00', client:'Ana García',    initials:'AG', borderColor:'#0EA5E9' },
  { id:131, monthOffset: 11, time:'10:30', client:'María Fdez.',   initials:'MF', borderColor:'#10B981' },
  { id:132, monthOffset: 12, time:'17:00', client:'Pedro López',   initials:'PL', borderColor:'#7C3AED' },
  { id:133, monthOffset: 13, time:'09:00', client:'Ana García',    initials:'AG', borderColor:'#0EA5E9' },
  { id:134, monthOffset: 14, time:'11:00', client:'Jorge Ruiz',    initials:'JR', borderColor:'#F59E0B' },
  { id:135, monthOffset: 15, time:'16:00', client:'Sofía Martín',  initials:'SM', borderColor:'#F43F5E' },
]

const INIT_CONVERSATIONS: Conversation[] = [
  { id: 1, initials: 'AG', colorClass: 'bg-sky-500/20 text-sky-300',        name: 'Ana García',      unread: true,  lastTime: '10:32',
    thread: [
      { from: 'trainer', text: '¡Hola Ana! He revisado tus medidas y vamos muy bien 💪', time: '09:15' },
      { from: 'client',  text: 'Gracias Carlos! Me noto con más energía que nunca.', time: '09:32' },
      { from: 'trainer', text: 'Perfecto. Esta semana intenta dormir 8h, es clave para la recuperación muscular.', time: '09:35' },
      { from: 'client',  text: '¡La nueva rutina está genial! Me encantó el circuito de fuerza 🔥', time: '10:32' },
    ] },
  { id: 2, initials: 'PL', colorClass: 'bg-violet-500/20 text-violet-300',  name: 'Pedro López',     unread: true,  lastTime: '09:15',
    thread: [
      { from: 'trainer', text: '¡Buenos días, Pedro! ¿Cómo te fue con el nuevo plan de cardio?', time: '08:00' },
      { from: 'client',  text: '¿Podemos cambiar la cita del jueves al viernes?', time: '09:15' },
    ] },
  { id: 3, initials: 'MF', colorClass: 'bg-emerald-500/20 text-emerald-300',name: 'María Fernández', unread: false, lastTime: 'Ayer',
    thread: [
      { from: 'trainer', text: '¡Buenos días, María! ¿Cómo te fue con la rutina de ayer?', time: '08:00' },
      { from: 'client',  text: 'Ya hice las medidas esta mañana, te las mando ahora. ¡−0.8 kg!', time: 'Ayer' },
      { from: 'trainer', text: '¡Increíble! Sigue así con la alimentación esta semana 🙌', time: 'Ayer' },
    ] },
]

const REVENUE = [480, 560, 640, 720, 680, 760]
const MONTHS  = ['Dic', 'Ene', 'Feb', 'Mar', 'Abr', 'May']
const WEEK    = [
  { day: 'L', p: 3, d: 3, today: false },
  { day: 'M', p: 2, d: 2, today: false },
  { day: 'X', p: 3, d: 2, today: false },
  { day: 'J', p: 3, d: 0, today: true  },
  { day: 'V', p: 2, d: 0, today: false },
  { day: 'S', p: 1, d: 0, today: false },
  { day: 'D', p: 0, d: 0, today: false },
]
const ACTIVITY = [
  { id: 1, type: 'message',  client: 'Ana García',  initials: 'AG', colorClass: 'bg-sky-500/20 text-sky-300',        text: 'envió un mensaje nuevo',        time: '10:32' },
  { id: 2, type: 'check',    client: 'Pedro López', initials: 'PL', colorClass: 'bg-violet-500/20 text-violet-300',  text: 'completó su rutina del día',    time: '08:45' },
  { id: 3, type: 'progress', client: 'María Fdez.', initials: 'MF', colorClass: 'bg-emerald-500/20 text-emerald-300',text: 'registró 59.1 kg (−0.8 kg)',    time: 'Ayer'  },
  { id: 4, type: 'fire',     client: 'Ana García',  initials: 'AG', colorClass: 'bg-sky-500/20 text-sky-300',        text: '¡Racha de 12 días conseguida!', time: 'Ayer'  },
]

// ─── Component ────────────────────────────────────────────────────────────────
export default function TrainerDemoPage() {
  const [activeKey, setActiveKey] = useState('appointments')

  // Animated counters (always top-level)
  const cClients   = useCountUp(24)
  const cRevenue   = useCountUp(2840)
  const cSessions  = useCountUp(14)
  const cRetention = useCountUp(83)

  // Clients
  const [search, setSearch]             = useState('')
  const [statusFilter, setStatusFilter] = useState<StatusFilter>('all')
  const [selectedClient, setSelectedClient] = useState<Client | null>(null)
  const [clientNotes, setClientNotes]   = useState<Record<number, string>>({})

  // Routines
  const [routines, setRoutines]           = useState<Routine[]>(INIT_ROUTINES)
  const [expandedR, setExpandedR]         = useState<Set<number>>(new Set())
  const [showRoutineModal, setShowRM]     = useState(false)
  const [rName, setRName]                 = useState('')
  const [rDays, setRDays]                 = useState<string[]>([])
  const [rLevel, setRLevel]               = useState('Intermedio')
  const [rExercises, setRExercises]       = useState<NewExercise[]>([{ name: '', sets: '3', reps: '10', rest: '60' }])

  // Nutrition
  const [expandedN, setExpandedN] = useState<Set<number>>(new Set())

  // Appointments
  const [appointments, setAppointments] = useState<Appointment[]>(INIT_APPOINTMENTS)
  const [showAptModal, setShowAM]       = useState(false)
  const [aptClient, setAptClient]       = useState('Ana García')
  const [aptDate, setAptDate]           = useState('')
  const [aptTime, setAptTime]           = useState('10:00')
  const [aptDur, setAptDur]             = useState(60)
  const [aptType, setAptType]           = useState<AptType>('Online')
  const [viewMode, setViewMode]         = useState<ViewMode>('week')

  const weekDays = useMemo(() => {
    const today = new Date()
    const dow   = today.getDay()
    const mon   = new Date(today)
    mon.setDate(today.getDate() - (dow === 0 ? 6 : dow - 1))
    mon.setHours(0, 0, 0, 0)
    return Array.from({ length: 7 }, (_, i) => {
      const d = new Date(mon)
      d.setDate(mon.getDate() + i)
      return d
    })
  }, [])

  const { monthCells, monthAptsMap } = useMemo(() => {
    const today = new Date()
    const yr = today.getFullYear(), mo = today.getMonth()
    const firstDow = new Date(yr, mo, 1).getDay()
    const startOffset = firstDow === 0 ? -6 : 1 - firstDow
    const daysInMonth = new Date(yr, mo + 1, 0).getDate()
    const totalCells  = Math.ceil((daysInMonth - startOffset) / 7) * 7
    const cells = Array.from({ length: totalCells }, (_, i) => new Date(yr, mo, 1 + startOffset + i))

    const map: Record<string, MonthApt[]> = {}
    MONTH_APTS.forEach(apt => {
      const d = new Date(today)
      d.setDate(today.getDate() + apt.monthOffset)
      const key = `${d.getFullYear()}-${d.getMonth()}-${d.getDate()}`
      if (!map[key]) map[key] = []
      map[key].push(apt)
    })
    return { monthCells: cells, monthAptsMap: map }
  }, [])

  // Messages
  const [conversations, setConversations] = useState<Conversation[]>(INIT_CONVERSATIONS)
  const [selConvId, setSelConvId]         = useState(1)
  const [replyText, setReplyText]         = useState('')
  const [readIds, setReadIds]             = useState<Set<number>>(new Set([3]))
  const [mobileShowChat, setMobileShowChat] = useState(false)
  const chatEndRef = useRef<HTMLDivElement>(null)

  // Analytics tooltip
  const [hoveredBar, setHoveredBar] = useState<number | null>(null)

  // Derived
  const unreadCount = conversations.filter(c => c.unread && !readIds.has(c.id)).length
  const selConv     = conversations.find(c => c.id === selConvId)
  const filteredCl  = ALL_CLIENTS.filter(c =>
    c.name.toLowerCase().includes(search.toLowerCase()) &&
    (statusFilter === 'all' || c.status === statusFilter)
  )

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [conversations, selConvId])

  // ─── Handlers ──────────────────────────────────────────────────────────────
  const nav = (k: string) => setActiveKey(k)

  function toggleR(id: number) { setExpandedR(prev => { const n = new Set(prev); if (n.has(id)) n.delete(id); else n.add(id); return n }) }
  function toggleN(id: number) { setExpandedN(prev => { const n = new Set(prev); if (n.has(id)) n.delete(id); else n.add(id); return n }) }
  function toggleDay(d: string) { setRDays(prev => prev.includes(d) ? prev.filter(x => x !== d) : [...prev, d]) }
  function addEx()    { setRExercises(p => [...p, { name: '', sets: '3', reps: '10', rest: '60' }]) }
  function removeEx(i: number) { setRExercises(p => p.filter((_, x) => x !== i)) }
  function updateEx(i: number, k: keyof NewExercise, v: string) { setRExercises(p => p.map((e, x) => x === i ? { ...e, [k]: v } : e)) }

  function openConv(id: number) {
    setSelConvId(id)
    setMobileShowChat(true)
    setReadIds(prev => { const n = new Set(prev); n.add(id); return n })
  }

  function sendReply(e: React.FormEvent) {
    e.preventDefault()
    if (!replyText.trim()) return
    const t = `${new Date().getHours().toString().padStart(2,'0')}:${new Date().getMinutes().toString().padStart(2,'0')}`
    const msg: ChatMessage = { from: 'trainer', text: replyText.trim(), time: t }
    setConversations(prev => prev.map(c => c.id === selConvId ? { ...c, thread: [...c.thread, msg], lastTime: t, unread: false } : c))
    setReplyText('')
  }

  function submitRoutine(e: React.FormEvent) {
    e.preventDefault()
    if (!rName.trim()) return
    const newR: Routine = {
      id: Date.now(), name: rName,
      days: rDays.length ? rDays.join(' · ') : 'Sin días asignados',
      clients: 0, level: rLevel, completion: 0,
      exercises: rExercises.filter(ex => ex.name.trim()).map(ex => ({
        name: ex.name, sets: Number(ex.sets) || 3, reps: Number(ex.reps) || 10, rest: Number(ex.rest) || 60, notes: null,
      })),
    }
    setRoutines(p => [newR, ...p])
    setShowRM(false)
    setRName(''); setRDays([]); setRLevel('Intermedio')
    setRExercises([{ name: '', sets: '3', reps: '10', rest: '60' }])
  }

  function submitApt(e: React.FormEvent) {
    e.preventDefault()
    const cl = ALL_CLIENTS.find(c => c.name === aptClient) ?? ALL_CLIENTS[0]
    setAppointments(p => [...p, {
      id: Date.now(), client: aptClient, initials: cl.initials, colorClass: cl.colorClass,
      date: aptDate ? new Date(aptDate).toLocaleDateString('es-ES', { weekday: 'short', day: 'numeric', month: 'short' }) : 'Próximamente',
      time: aptTime, duration: aptDur, type: aptType, status: 'pending',
    }])
    setShowAM(false)
    setAptDate(''); setAptTime('10:00'); setAptDur(60); setAptType('Online')
  }

  // ─── Sidebar ───────────────────────────────────────────────────────────────
  const Sidebar = (
    <aside className="w-64 bg-surface border-r border-border flex flex-col shrink-0 overflow-y-auto hidden md:flex">
      <div className="p-5 border-b border-border">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl flex items-center justify-center shadow-glow-sm shrink-0"
               style={{ background: '#8FD43A' }}>
            <Zap className="w-4 h-4 text-white" />
          </div>
          <div>
            <div className="font-bold text-white text-sm tracking-tight">TrainerBoost</div>
            <div className="text-xs text-slate-500">Dashboard</div>
          </div>
        </div>
      </div>
      <div className="mx-4 mt-3 px-3 py-2.5 rounded-lg border"
           style={{ background: 'linear-gradient(135deg,rgba(14,165,233,0.08),rgba(124,58,237,0.05))', borderColor: 'rgba(14,165,233,0.25)' }}>
        <div className="flex items-center justify-between mb-1.5">
          <span className="text-xs font-semibold text-brand-primary flex items-center gap-1"><Zap className="w-3 h-3" /> Plan Pro</span>
          <span className="text-xs text-slate-400">24 / 30</span>
        </div>
        <div className="h-1 bg-surface-2 rounded-full overflow-hidden">
          <div className="h-full rounded-full" style={{ width: '80%', background: 'linear-gradient(90deg,#0EA5E9,#7C3AED)' }} />
        </div>
        <p className="text-[10px] text-slate-500 mt-1">24 de 30 clientes · Plan Pro activo</p>
      </div>
      <nav className="flex-1 p-3 space-y-0.5 mt-2">
        {NAV.map(item => {
          const isActive = item.key === activeKey
          const badge = item.key === 'messages' ? unreadCount : 0
          return (
            <button key={item.key} onClick={() => nav(item.key)}
                    className="w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium relative cursor-pointer transition-all"
                    style={isActive ? { background: 'linear-gradient(90deg,rgba(14,165,233,0.12),transparent)' } : {}}>
              {isActive && <span className="absolute left-0 top-1/2 -translate-y-1/2 w-1 h-6 rounded-r-full" style={{ background: 'linear-gradient(180deg,#38BDF8,#7C3AED)' }} />}
              <item.icon className={`w-4 h-4 shrink-0 ${isActive ? 'text-brand-primary' : 'text-slate-500'}`} />
              <span className={isActive ? 'text-brand-primary' : 'text-slate-400'}>{item.label}</span>
              {badge > 0 && <span className="ml-auto bg-brand-primary text-white text-xs font-bold px-1.5 py-0.5 rounded-full animate-pulse">{badge}</span>}
            </button>
          )
        })}
      </nav>
      <div className="p-3 border-t border-border space-y-0.5">
        {[{ icon: Settings, label: 'Ajustes' }, { icon: CreditCard, label: 'Plan' }].map(item => (
          <div key={item.label} className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm text-slate-500 cursor-default">
            <item.icon className="w-4 h-4" /> {item.label}
          </div>
        ))}
        <div className="pt-2 mt-1 border-t border-border/50">
          <div className="flex items-center gap-3 px-3 py-2">
            <div className="w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold text-sky-300 shrink-0"
                 style={{ background: 'linear-gradient(135deg,rgba(14,165,233,0.2),rgba(124,58,237,0.15))', border: '1px solid rgba(14,165,233,0.3)' }}>
              CM
            </div>
            <div className="flex-1 min-w-0">
              <div className="text-xs font-semibold text-white truncate">Carlos Martínez</div>
              <div className="text-[10px] text-slate-500">Entrenador Personal</div>
            </div>
          </div>
        </div>
      </div>
    </aside>
  )

  return (
    <div className="min-h-screen bg-background flex flex-col">

      {/* ── Demo banner ── */}
      <div className="w-full px-4 py-3 flex items-center justify-between gap-4 text-sm sticky top-0 z-50 border-b border-brand-primary/20"
           style={{ background: 'linear-gradient(90deg,rgba(14,165,233,0.12),rgba(124,58,237,0.08))' }}>
        <div className="flex items-center gap-2.5">
          <span className="px-2 py-0.5 rounded-full text-xs font-bold" style={{ background: 'linear-gradient(135deg,#0EA5E9,#7C3AED)', color: 'white' }}>DEMO</span>
          <span className="text-slate-300 hidden sm:block">Panel de entrenador — 100% interactivo, crea rutinas, citas y envía mensajes</span>
          <span className="text-slate-300 sm:hidden">Panel entrenador · Demo</span>
        </div>
        <div className="flex items-center gap-2 shrink-0">
          <Link href="/demo" className="text-xs text-slate-400 hover:text-white transition-colors">← Volver</Link>
        </div>
      </div>

      {/* ── Layout ── */}
      <div className="flex flex-1 overflow-hidden" style={{ height: 'calc(100vh - 49px)' }}>
        {Sidebar}

        <main className="flex-1 overflow-y-auto">
          {/* Mobile tabs */}
          <div className="md:hidden flex overflow-x-auto border-b border-border bg-surface sticky top-0 z-10">
            {NAV.map(item => (
              <button key={item.key} onClick={() => nav(item.key)}
                      className={`flex items-center gap-1.5 px-3 py-3 text-xs font-medium whitespace-nowrap border-b-2 transition-colors relative ${activeKey === item.key ? 'border-brand-primary text-brand-primary' : 'border-transparent text-slate-400'}`}>
                <item.icon className="w-3.5 h-3.5" />{item.label}
                {item.key === 'messages' && unreadCount > 0 && <span className="w-1.5 h-1.5 rounded-full bg-brand-primary absolute top-2 right-1" />}
              </button>
            ))}
          </div>

          <div className="max-w-5xl mx-auto p-5 lg:p-8 space-y-6">

            {/* ══════ DASHBOARD ══════ */}
            {activeKey === 'dashboard' && (
              <>
                <div className="flex items-start justify-between animate-fade-in-up">
                  <div>
                    <p className="text-xs text-brand-accent font-semibold uppercase tracking-widest mb-1">Buenos días 👋</p>
                    <h1 className="text-2xl font-bold text-white">Carlos Martínez</h1>
                    <p className="text-slate-400 text-sm mt-0.5">Jueves, 29 Mayo · 3 citas programadas hoy</p>
                  </div>
                  <button onClick={() => nav('clients')} className="btn-primary text-sm">
                    <Plus className="w-4 h-4" /> Añadir cliente
                  </button>
                </div>

                <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 animate-fade-in-up delay-75">
                  <StatsCard label="Clientes activos" value={cClients}    change={{ value: '+1 este mes', positive: true }} icon={<Users className="w-5 h-5" />}        color="primary" />
                  <StatsCard label="Ingresos mes"     value={`${cRevenue}€`} change={{ value: '+18%', positive: true }}     icon={<TrendingUp className="w-5 h-5" />}   color="accent" />
                  <StatsCard label="Sesiones sem."    value={cSessions}   change={{ value: '+4', positive: true }}          icon={<Dumbbell className="w-5 h-5" />}     color="secondary" />
                  <StatsCard label="Retención"        value={`${cRetention}%`}                                               icon={<Award className="w-5 h-5" />}        color="warning" />
                </div>

                {/* Quick actions */}
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 animate-fade-in-up delay-150">
                  {[
                    { icon: CalendarDays, label: 'Nueva cita',     color: 'text-sky-400',     bg: 'border-sky-500/20 bg-sky-500/5',     action: () => { nav('appointments'); setShowAM(true) } },
                    { icon: Users,        label: 'Invitar cliente', color: 'text-violet-400',  bg: 'border-violet-500/20 bg-violet-500/5', action: () => nav('clients') },
                    { icon: Dumbbell,     label: 'Nueva rutina',   color: 'text-emerald-400', bg: 'border-emerald-500/20 bg-emerald-500/5', action: () => { nav('routines'); setShowRM(true) } },
                    { icon: MessageSquare,label: 'Mensajes',        color: 'text-amber-400',   bg: 'border-amber-500/20 bg-amber-500/5',  action: () => nav('messages') },
                  ].map(a => (
                    <button key={a.label} onClick={a.action} className={`flex flex-col items-center gap-2.5 p-4 rounded-xl border cursor-pointer transition-all hover:scale-[1.03] hover:shadow-card-hover group ${a.bg}`}>
                      <a.icon className={`w-6 h-6 ${a.color} transition-transform group-hover:scale-110`} />
                      <span className="text-xs font-semibold text-slate-300">{a.label}</span>
                    </button>
                  ))}
                </div>

                {/* Revenue + Weekly */}
                <div className="grid lg:grid-cols-2 gap-6 animate-fade-in-up delay-200">
                  <div className="card p-6">
                    <div className="flex items-center justify-between mb-5">
                      <div><h2 className="font-semibold text-white">Ingresos mensuales</h2><p className="text-xs text-slate-500 mt-0.5">Últimos 6 meses</p></div>
                      <span className="text-emerald-400 text-sm font-bold flex items-center gap-1"><ArrowUpRight className="w-4 h-4" /> +58%</span>
                    </div>
                    <div className="flex items-end gap-2 h-28 relative">
                      {REVENUE.map((v, i) => (
                        <div key={i} className="flex-1 flex flex-col items-center gap-2 group relative" onMouseEnter={() => setHoveredBar(i)} onMouseLeave={() => setHoveredBar(null)}>
                          {hoveredBar === i && (
                            <div className="absolute -top-8 left-1/2 -translate-x-1/2 bg-surface border border-border rounded-lg px-2 py-1 text-xs font-mono text-white whitespace-nowrap z-10 shadow-lg">
                              {v}€
                            </div>
                          )}
                          <span className="text-[9px] text-slate-600 font-mono">{v}€</span>
                          <div className="w-full rounded-t-sm cursor-pointer transition-all duration-200"
                               style={{ height:`${(v/760)*100}%`, minHeight:'4px',
                                 background: i===5 ? 'linear-gradient(180deg,#0EA5E9,#7C3AED)' : hoveredBar===i ? 'rgba(14,165,233,0.4)' : 'rgba(14,165,233,0.2)',
                                 boxShadow: i===5 ? '0 0 10px rgba(14,165,233,0.35)' : 'none' }} />
                        </div>
                      ))}
                    </div>
                    <div className="flex mt-2">
                      {MONTHS.map((m,i) => <span key={m} className={`flex-1 text-center text-[10px] ${i===5?'text-brand-primary font-semibold':'text-slate-600'}`}>{m}</span>)}
                    </div>
                  </div>

                  <div className="card p-6">
                    <div className="flex items-center justify-between mb-5">
                      <div><h2 className="font-semibold text-white">Esta semana</h2><p className="text-xs text-slate-500 mt-0.5">Sesiones planificadas vs completadas</p></div>
                      <span className="text-xs font-semibold text-slate-400">7 / 14 completadas</span>
                    </div>
                    <div className="flex items-end gap-2 h-24">
                      {WEEK.map(day => (
                        <div key={day.day} className="flex-1 flex flex-col justify-end" style={{ height:'100%' }}>
                          {day.p > 0
                            ? <div className="w-full rounded-t-sm" style={{ height:`${(day.p/3)*100}%`, minHeight:'8px',
                                background: day.today ? 'linear-gradient(180deg,#0EA5E9,#7C3AED)' : day.d===day.p ? 'rgba(16,185,129,0.4)' : 'rgba(14,165,233,0.15)',
                                border: day.today ? '1px solid rgba(14,165,233,0.4)' : 'none',
                                boxShadow: day.today ? '0 0 8px rgba(14,165,233,0.25)' : 'none' }} />
                            : <div className="w-full h-2 rounded-t-sm bg-surface-2" />}
                        </div>
                      ))}
                    </div>
                    <div className="flex gap-2 mt-2">
                      {WEEK.map(d => <span key={d.day} className={`flex-1 text-center text-[10px] ${d.today?'text-brand-primary font-bold':'text-slate-600'}`}>{d.day}</span>)}
                    </div>
                    <div className="mt-4 pt-4 border-t border-border/50 grid grid-cols-3 gap-2 text-center">
                      {[['7','Completadas','text-emerald-400'],['3','Hoy','text-brand-primary'],['7','Pendientes','text-slate-400']].map(([v,l,c]) => (
                        <div key={l}><div className={`text-lg font-bold font-mono ${c}`}>{v}</div><div className="text-[10px] text-slate-500">{l}</div></div>
                      ))}
                    </div>
                  </div>
                </div>

                {/* Client rings */}
                <div className="card p-6 animate-fade-in-up delay-300">
                  <div className="flex items-center justify-between mb-5">
                    <h2 className="font-semibold text-white">Progreso de clientes</h2>
                    <button onClick={() => nav('clients')} className="text-xs text-brand-primary hover:underline font-medium flex items-center gap-1">Ver todos <ChevronRight className="w-3 h-3" /></button>
                  </div>
                  <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                    {ALL_CLIENTS.map(c => {
                      const pct = Math.round((c.sessions/c.goal)*100)
                      return (
                        <button key={c.id} onClick={() => setSelectedClient(c)}
                                className="flex flex-col items-center gap-3 p-4 rounded-xl bg-surface-2 hover:bg-surface-3 transition-colors cursor-pointer">
                          <div className="relative">
                            <Ring pct={pct} size={60} stroke={5} color={c.ringColor} />
                            <div className="absolute inset-0 flex items-center justify-center">
                              <span className="text-xs font-bold text-white">{pct}%</span>
                            </div>
                          </div>
                          <div className="text-center">
                            <div className="text-sm font-semibold text-white">{c.name.split(' ')[0]}</div>
                            <div className="text-[10px] text-slate-500 mt-0.5">{c.sessions}/{c.goal} sesiones</div>
                          </div>
                          <Badge status={c.status} />
                        </button>
                      )
                    })}
                  </div>
                </div>

                {/* Activity */}
                <div className="card p-6 animate-fade-in-up delay-400">
                  <div className="flex items-center justify-between mb-5">
                    <h2 className="font-semibold text-white">Actividad reciente</h2>
                    <span className="text-xs px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">En vivo</span>
                  </div>
                  <div className="space-y-1">
                    {ACTIVITY.map((item,i) => {
                      const Icon = item.type==='message' ? MessageSquare : item.type==='check' ? Check : item.type==='fire' ? Flame : TrendingUp
                      const ic   = item.type==='message' ? 'text-brand-primary' : item.type==='check' ? 'text-emerald-400' : item.type==='fire' ? 'text-amber-400' : 'text-violet-400'
                      return (
                        <div key={item.id} className="flex items-center gap-3 py-2.5 border-b border-border/40 last:border-0 animate-fade-in-up" style={{ animationDelay:`${i*80}ms` }}>
                          <div className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold shrink-0 ${item.colorClass}`}>{item.initials}</div>
                          <div className="flex-1 min-w-0">
                            <span className="text-sm text-white font-medium">{item.client} </span>
                            <span className="text-sm text-slate-400">{item.text}</span>
                          </div>
                          <div className="flex items-center gap-1.5 shrink-0">
                            <Icon className={`w-3.5 h-3.5 ${ic}`} />
                            <span className="text-xs text-slate-500">{item.time}</span>
                          </div>
                        </div>
                      )
                    })}
                  </div>
                </div>
              </>
            )}

            {/* ══════ CLIENTES ══════ */}
            {activeKey === 'clients' && (
              <>
                <div className="flex items-center justify-between animate-fade-in-up">
                  <div><h1 className="text-2xl font-bold text-white">Mis clientes</h1><p className="text-slate-400 text-sm mt-0.5">3 activos · 1 en pausa</p></div>
                  <button className="btn-primary text-sm" disabled><Plus className="w-4 h-4" /> Invitar cliente</button>
                </div>

                <div className="flex gap-3 animate-fade-in-up delay-75">
                  <div className="relative flex-1">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
                    <input value={search} onChange={e => setSearch(e.target.value)} className="input pl-9" placeholder="Buscar cliente..." />
                  </div>
                  <div className="flex rounded-lg border border-border overflow-hidden shrink-0">
                    {(['all','active','paused'] as StatusFilter[]).map(f => (
                      <button key={f} onClick={() => setStatusFilter(f)}
                              className={`px-3 py-2 text-xs font-medium transition-colors ${statusFilter===f ? 'bg-brand-primary text-white' : 'text-slate-400 hover:text-white'}`}>
                        {f==='all'?'Todos':f==='active'?'Activos':'Pausados'}
                      </button>
                    ))}
                  </div>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                  {filteredCl.map((c,i) => {
                    const pct = Math.round((c.sessions/c.goal)*100)
                    return (
                      <button key={c.id} onClick={() => setSelectedClient(c)} className="card p-5 text-left hover:border-border-bright transition-all hover:-translate-y-0.5 hover:shadow-card-hover animate-fade-in-up" style={{ animationDelay:`${i*70}ms` }}>
                        <div className="flex items-start gap-4 mb-4">
                          <div className="relative shrink-0">
                            <div className={`w-12 h-12 rounded-full flex items-center justify-center text-sm font-bold ${c.colorClass}`}>{c.initials}</div>
                            {c.streak > 0 && <span className="absolute -top-1 -right-1 w-5 h-5 rounded-full bg-amber-500 flex items-center justify-center text-[9px] font-bold text-white">{c.streak}</span>}
                          </div>
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center justify-between gap-2">
                              <span className="font-semibold text-white">{c.name}</span>
                              <Badge status={c.status} />
                            </div>
                            <div className="text-xs text-slate-400 mt-0.5">Desde {c.since} · {c.plan}</div>
                          </div>
                        </div>
                        <div className="mb-4">
                          <div className="flex justify-between text-xs mb-1.5">
                            <span className="text-slate-400">Sesiones del mes</span>
                            <span className="font-mono font-semibold text-white">{c.sessions}/{c.goal}</span>
                          </div>
                          <div className="h-1.5 bg-surface-2 rounded-full overflow-hidden">
                            <div className="h-full rounded-full transition-all duration-700" style={{ width:`${pct}%`, background:'linear-gradient(90deg,#10B981,#0EA5E9)' }} />
                          </div>
                        </div>
                        <div className="grid grid-cols-3 gap-3 pt-4 border-t border-border/50">
                          <div className="text-center"><div className="flex items-center justify-center gap-1"><TrendingUp className="w-3 h-3 text-emerald-400" /><span className="text-sm font-bold font-mono text-emerald-400">−{c.weightLoss}kg</span></div><div className="text-[10px] text-slate-500 mt-0.5">Pérdida</div></div>
                          <div className="text-center"><div className="flex items-center justify-center gap-1"><Flame className="w-3 h-3 text-amber-400" /><span className="text-sm font-bold font-mono text-amber-400">{c.streak}d</span></div><div className="text-[10px] text-slate-500 mt-0.5">Racha</div></div>
                          <div className="text-center"><span className="text-sm font-bold font-mono text-white">{pct}%</span><div className="text-[10px] text-slate-500 mt-0.5">Completado</div></div>
                        </div>
                        <div className="mt-4 pt-3 border-t border-border/50 flex items-center justify-between">
                          <span className="flex items-center gap-1.5 text-xs text-slate-400"><CalendarDays className="w-3.5 h-3.5" />{c.nextApt}</span>
                          <span className="flex items-center gap-1.5 text-xs text-slate-400"><Dumbbell className="w-3.5 h-3.5" /><span className="truncate max-w-[120px]">{c.routine}</span></span>
                        </div>
                        <div className="mt-3 text-center text-xs text-brand-primary font-medium">Toca para ver perfil completo →</div>
                      </button>
                    )
                  })}
                  {filteredCl.length === 0 && <div className="col-span-2 text-center py-12 text-slate-500">No se encontraron clientes</div>}
                </div>
              </>
            )}

            {/* ══════ RUTINAS ══════ */}
            {activeKey === 'routines' && (
              <>
                <div className="flex items-center justify-between animate-fade-in-up">
                  <div><h1 className="text-2xl font-bold text-white">Rutinas</h1><p className="text-slate-400 text-sm mt-0.5">{routines.length} rutinas · gestiona y crea nuevas</p></div>
                  <button onClick={() => setShowRM(true)} className="btn-primary text-sm"><Plus className="w-4 h-4" /> Nueva rutina</button>
                </div>
                <div className="space-y-4">
                  {routines.map((r, i) => {
                    const lc = r.level==='Avanzado' ? 'text-red-400 bg-red-500/10 border-red-500/20' : r.level==='Intermedio' ? 'text-amber-400 bg-amber-500/10 border-amber-500/20' : 'text-emerald-400 bg-emerald-500/10 border-emerald-500/20'
                    const isOpen = expandedR.has(r.id)
                    return (
                      <div key={r.id} className="card overflow-hidden animate-fade-in-up" style={{ animationDelay:`${i*80}ms` }}>
                        <button onClick={() => toggleR(r.id)} className="w-full flex items-center gap-4 p-5 text-left hover:bg-surface-2/50 transition-colors">
                          <div className="w-12 h-12 rounded-xl flex items-center justify-center shrink-0" style={{ background:'rgba(124,58,237,0.1)', border:'1px solid rgba(124,58,237,0.2)' }}>
                            <Dumbbell className="w-6 h-6 text-violet-400" />
                          </div>
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-3 flex-wrap">
                              <h3 className="font-semibold text-white">{r.name}</h3>
                              <span className={`text-xs font-semibold px-2.5 py-0.5 rounded-full border ${lc}`}>{r.level}</span>
                              {r.clients===0 && <span className="text-xs text-brand-primary bg-brand-primary/10 px-2 py-0.5 rounded-full">Nueva</span>}
                            </div>
                            <div className="flex flex-wrap items-center gap-4 mt-1 text-sm text-slate-400">
                              <span className="flex items-center gap-1.5"><CalendarDays className="w-3.5 h-3.5" />{r.days}</span>
                              <span className="flex items-center gap-1.5"><Users className="w-3.5 h-3.5" />{r.clients} clientes</span>
                              <span className="flex items-center gap-1.5"><Activity className="w-3.5 h-3.5" />{r.exercises.length} ejercicios</span>
                            </div>
                          </div>
                          <div className="flex items-center gap-3 shrink-0">
                            {r.completion > 0 && (
                              <div className="relative">
                                <Ring pct={r.completion} size={44} stroke={4} color="#10B981" />
                                <div className="absolute inset-0 flex items-center justify-center">
                                  <span className="text-[9px] font-bold text-emerald-400">{r.completion}%</span>
                                </div>
                              </div>
                            )}
                            <ChevronDown className={`w-5 h-5 text-slate-500 transition-transform duration-200 ${isOpen?'rotate-180':''}`} />
                          </div>
                        </button>
                        {isOpen && (
                          <div className="border-t border-border/50 px-5 pb-5">
                            <div className="mt-4 overflow-x-auto">
                              <table className="w-full text-sm">
                                <thead><tr className="border-b border-border">
                                  <th className="text-left pb-2 text-xs font-semibold text-slate-500 uppercase tracking-wide w-8"></th>
                                  <th className="text-left pb-2 text-xs font-semibold text-slate-500 uppercase tracking-wide">Ejercicio</th>
                                  <th className="text-center pb-2 text-xs font-semibold text-slate-500 uppercase tracking-wide">Series</th>
                                  <th className="text-center pb-2 text-xs font-semibold text-slate-500 uppercase tracking-wide">Reps</th>
                                  <th className="text-center pb-2 text-xs font-semibold text-slate-500 uppercase tracking-wide">Descanso</th>
                                  <th className="text-left pb-2 text-xs font-semibold text-slate-500 uppercase tracking-wide hidden sm:table-cell">Notas</th>
                                </tr></thead>
                                <tbody className="divide-y divide-border/30">
                                  {r.exercises.map((ex, ei) => (
                                    <tr key={ei} className="group hover:bg-surface-2/50 transition-colors">
                                      <td className="py-2.5"><GripVertical className="w-4 h-4 text-slate-600 cursor-grab" /></td>
                                      <td className="py-2.5 font-medium text-white">{ex.name}</td>
                                      <td className="py-2.5 text-center font-mono text-slate-300">{ex.sets}</td>
                                      <td className="py-2.5 text-center font-mono text-slate-300">{ex.reps || '—'}</td>
                                      <td className="py-2.5 text-center font-mono text-slate-300">{ex.rest}s</td>
                                      <td className="py-2.5 text-slate-400 text-xs italic hidden sm:table-cell">{ex.notes || '—'}</td>
                                    </tr>
                                  ))}
                                </tbody>
                              </table>
                            </div>
                          </div>
                        )}
                      </div>
                    )
                  })}
                </div>
              </>
            )}

            {/* ══════ NUTRICIÓN ══════ */}
            {activeKey === 'nutrition' && (
              <>
                <div className="animate-fade-in-up">
                  <h1 className="text-2xl font-bold text-white">Nutrición</h1>
                  <p className="text-slate-400 text-sm mt-0.5">Planes nutricionales activos de tus clientes</p>
                </div>
                <div className="space-y-4">
                  {INIT_NUTRITION.map((plan, i) => {
                    const cl = ALL_CLIENTS.find(c => c.id === plan.clientId)
                    if (!cl) return null
                    const isOpen = expandedN.has(plan.clientId)
                    const macros = [
                      { label: 'Proteína', value: plan.protein, max: plan.protein+20, color: '#0EA5E9', unit: 'g' },
                      { label: 'Carbos',   value: plan.carbs,   max: plan.carbs+40,   color: '#7C3AED', unit: 'g' },
                      { label: 'Grasas',   value: plan.fat,     max: plan.fat+15,     color: '#F59E0B', unit: 'g' },
                    ]
                    return (
                      <div key={plan.clientId} className="card overflow-hidden animate-fade-in-up" style={{ animationDelay:`${i*80}ms` }}>
                        <button onClick={() => toggleN(plan.clientId)} className="w-full flex items-center gap-4 p-5 text-left hover:bg-surface-2/50 transition-colors">
                          <div className={`w-10 h-10 rounded-full flex items-center justify-center text-sm font-bold shrink-0 ${cl.colorClass}`}>{cl.initials}</div>
                          <div className="flex-1">
                            <div className="font-semibold text-white">{cl.name}</div>
                            <div className="text-xs text-slate-400 mt-0.5">{plan.kcal} kcal · {plan.protein}g prot · {plan.carbs}g carbos · {plan.fat}g grasa</div>
                          </div>
                          <span className="text-xs font-semibold text-emerald-400 bg-emerald-500/10 px-2.5 py-1 rounded-full border border-emerald-500/20 shrink-0">Activo</span>
                          <ChevronDown className={`w-5 h-5 text-slate-500 transition-transform ${isOpen?'rotate-180':''} shrink-0`} />
                        </button>
                        {isOpen && (
                          <div className="border-t border-border/50 px-5 pb-5">
                            <div className="mt-4 space-y-3 mb-5">
                              {macros.map(m => (
                                <div key={m.label}>
                                  <div className="flex justify-between text-xs mb-1.5">
                                    <span className="text-slate-400">{m.label}</span>
                                    <span className="font-mono font-semibold text-white">{m.value}{m.unit} / {m.max}{m.unit}</span>
                                  </div>
                                  <div className="h-1.5 bg-surface-2 rounded-full overflow-hidden">
                                    <div className="h-full rounded-full transition-all duration-700" style={{ width:`${(m.value/m.max)*100}%`, background:m.color }} />
                                  </div>
                                </div>
                              ))}
                            </div>
                            <p className="text-xs text-slate-500 uppercase tracking-widest font-semibold mb-3">Comidas del día</p>
                            <div className="space-y-2">
                              {plan.meals.map(meal => (
                                <div key={meal.name} className="flex items-center gap-3 p-3 rounded-xl bg-surface-2">
                                  <span className="text-xs font-mono text-slate-500 w-12 shrink-0">{meal.time}</span>
                                  <span className="flex-1 text-sm text-white truncate">{meal.name}</span>
                                  <span className="text-xs text-amber-400 font-mono shrink-0">{meal.kcal} kcal</span>
                                  <span className="text-xs text-sky-400 hidden sm:block shrink-0">{meal.p}g P</span>
                                </div>
                              ))}
                            </div>
                          </div>
                        )}
                      </div>
                    )
                  })}
                </div>
              </>
            )}

            {/* ══════ CITAS ══════ */}
            {activeKey === 'appointments' && (
              <>
                {/* Header */}
                <div className="flex items-center justify-between animate-fade-in-up">
                  <div>
                    <h1 className="text-2xl font-bold text-white">Citas</h1>
                    <p className="text-slate-400 text-sm mt-0.5">
                      {weekDays[0].toLocaleDateString('es-ES', { day: 'numeric', month: 'short' })} — {weekDays[6].toLocaleDateString('es-ES', { day: 'numeric', month: 'short' })} · {CALENDAR_WEEK.length} citas esta semana
                    </p>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="inline-flex rounded-lg border border-border/60 p-1 bg-surface">
                      {([['list','Lista',List],['week','Semana',CalendarDays],['month','Mes',CalendarDays]] as const).map(([mode, label, Icon]) => (
                        <button key={mode} onClick={() => setViewMode(mode)}
                          className={`px-3 py-1.5 rounded-md text-xs font-medium transition-colors flex items-center gap-1.5 ${viewMode === mode ? 'bg-sky-500 text-white' : 'text-slate-400 hover:text-white'}`}>
                          <Icon className="w-3.5 h-3.5" />{label}
                        </button>
                      ))}
                    </div>
                    <button onClick={() => setShowAM(true)} className="btn-primary text-sm"><Plus className="w-4 h-4" /> Nueva cita</button>
                  </div>
                </div>

                {/* Calendar week view */}
                {viewMode === 'week' && (
                  <div className="card p-4 animate-fade-in-up delay-75">
                    <div className="overflow-x-auto">
                      <div className="grid grid-cols-7 gap-2 min-w-[700px]">
                        {weekDays.map((day, idx) => {
                          const isToday = day.toDateString() === new Date().toDateString()
                          const dayApts = CALENDAR_WEEK.filter(a => a.dayOffset === idx)
                          return (
                            <div key={idx} className="min-h-[140px]">
                              <div className={`text-center mb-2 pb-2 border-b ${isToday ? 'border-sky-500' : 'border-border/40'}`}>
                                <p className="text-[10px] text-slate-500 uppercase tracking-wide">
                                  {day.toLocaleDateString('es-ES', { weekday: 'short' })}
                                </p>
                                <p className={`text-lg font-bold leading-tight ${isToday ? 'text-sky-400' : 'text-white'}`}>
                                  {day.getDate()}
                                </p>
                                {isToday && <span className="text-[9px] text-sky-400 font-semibold uppercase tracking-wide">Hoy</span>}
                              </div>
                              <div className="space-y-1.5">
                                {dayApts.length === 0 && (
                                  <p className="text-[10px] text-slate-600 text-center pt-2">—</p>
                                )}
                                {dayApts.map(apt => (
                                  <div
                                    key={apt.id}
                                    className="w-full text-left p-2 rounded-lg text-xs transition-transform hover:scale-[1.03] cursor-default"
                                    style={{ background: apt.colorClass.replace('/10', '/15').replace('bg-', 'rgba(').replace('-500', ''), borderLeft: `2px solid ${apt.borderColor}`, backgroundColor: `${apt.borderColor}18` }}
                                  >
                                    <p className="font-bold text-white leading-none">{apt.time}</p>
                                    <p className="text-slate-300 truncate mt-0.5">{apt.client}</p>
                                    <p className="text-slate-500 mt-0.5">{apt.duration}min</p>
                                  </div>
                                ))}
                              </div>
                            </div>
                          )
                        })}
                      </div>
                    </div>
                    {/* Legend */}
                    <div className="flex items-center gap-4 mt-4 pt-3 border-t border-border/40">
                      <span className="text-[10px] text-slate-500 uppercase tracking-wide font-semibold">Tipo:</span>
                      {([['#0EA5E9','Online'],['#7C3AED','Presencial'],['#F59E0B','Llamada']] as const).map(([color, label]) => (
                        <span key={label} className="flex items-center gap-1.5 text-xs text-slate-400">
                          <span className="w-2.5 h-2.5 rounded-sm shrink-0" style={{ backgroundColor: `${color}40`, border: `1px solid ${color}` }} />
                          {label}
                        </span>
                      ))}
                    </div>
                  </div>
                )}

                {/* Month view */}
                {viewMode === 'month' && (
                  <div className="card p-4 animate-fade-in-up delay-75">
                    {/* Month header */}
                    <p className="text-sm font-semibold text-white mb-4 capitalize">
                      {new Date().toLocaleDateString('es-ES', { month: 'long', year: 'numeric' })}
                    </p>
                    {/* Day headers */}
                    <div className="grid grid-cols-7 gap-1 mb-1">
                      {['Lun','Mar','Mié','Jue','Vie','Sáb','Dom'].map(d => (
                        <div key={d} className="text-center text-[10px] font-semibold text-slate-500 uppercase tracking-wide py-1">{d}</div>
                      ))}
                    </div>
                    {/* Days grid */}
                    <div className="grid grid-cols-7 gap-1">
                      {monthCells.map((day, idx) => {
                        const isCurrentMonth = day.getMonth() === new Date().getMonth()
                        const isToday        = day.toDateString() === new Date().toDateString()
                        const key            = `${day.getFullYear()}-${day.getMonth()}-${day.getDate()}`
                        const dayApts        = monthAptsMap[key] ?? []
                        return (
                          <div key={idx} className={`min-h-[72px] rounded-lg p-1.5 border transition-colors ${isToday ? 'border-sky-500/60 bg-sky-500/5' : 'border-border/30 bg-surface/50'} ${!isCurrentMonth ? 'opacity-30' : ''}`}>
                            <p className={`text-xs font-bold leading-none mb-1.5 ${isToday ? 'text-sky-400' : 'text-slate-300'}`}>
                              {day.getDate()}
                            </p>
                            <div className="space-y-0.5">
                              {dayApts.slice(0, 3).map(apt => (
                                <div key={apt.id} className="flex items-center gap-1 text-[10px] truncate rounded px-1 py-0.5"
                                  style={{ backgroundColor: `${apt.borderColor}18`, borderLeft: `2px solid ${apt.borderColor}` }}>
                                  <span className="font-bold text-white shrink-0">{apt.time}</span>
                                  <span className="text-slate-400 truncate">{apt.initials}</span>
                                </div>
                              ))}
                              {dayApts.length > 3 && (
                                <p className="text-[10px] text-slate-500 pl-1">+{dayApts.length - 3} más</p>
                              )}
                            </div>
                          </div>
                        )
                      })}
                    </div>
                    {/* Legend */}
                    <div className="flex items-center gap-4 mt-4 pt-3 border-t border-border/40">
                      <span className="text-[10px] text-slate-500 uppercase tracking-wide font-semibold">Clientes:</span>
                      {([['#0EA5E9','AG','Ana García'],['#7C3AED','PL','Pedro López'],['#10B981','MF','María Fdez.'],['#F43F5E','SM','Sofía Martín'],['#F59E0B','JR','Jorge Ruiz']] as const).map(([color,initials,name]) => (
                        <span key={initials} className="flex items-center gap-1 text-[10px] text-slate-400">
                          <span className="w-4 h-4 rounded-full flex items-center justify-center text-[8px] font-bold shrink-0" style={{ backgroundColor: `${color}25`, border: `1px solid ${color}`, color }}>{initials}</span>
                          {name}
                        </span>
                      ))}
                    </div>
                  </div>
                )}

                {/* List view */}
                {viewMode === 'list' && (
                  <>
                    <div className="animate-fade-in-up delay-100">
                      <p className="text-xs font-semibold text-slate-500 uppercase tracking-widest mb-3">Hoy</p>
                      <div className="relative">
                        <div className="absolute left-[27px] top-4 bottom-4 w-px bg-border/50" />
                        <div className="space-y-4">
                          {appointments.filter(a => a.date==='Hoy').map((apt,i) => (
                            <div key={apt.id} className="flex items-center gap-4 relative animate-fade-in-up" style={{ animationDelay:`${i*80}ms` }}>
                              <div className="w-14 h-14 rounded-xl flex flex-col items-center justify-center shrink-0 z-10" style={{ background:'rgba(14,165,233,0.08)', border:'1px solid rgba(14,165,233,0.2)' }}>
                                <span className="text-xl font-bold font-mono text-brand-primary leading-none">{apt.time.split(':')[0]}</span>
                                <span className="text-[10px] text-slate-500">:{apt.time.split(':')[1]}</span>
                              </div>
                              <div className="flex-1 card p-4 hover:border-border-bright transition-all hover:-translate-y-0.5">
                                <div className="flex items-center justify-between gap-3">
                                  <div className="flex items-center gap-3">
                                    <div className={`w-9 h-9 rounded-full flex items-center justify-center text-xs font-bold shrink-0 ${apt.colorClass}`}>{apt.initials}</div>
                                    <div>
                                      <div className="font-semibold text-white">{apt.client}</div>
                                      <div className="text-xs text-slate-400 flex items-center gap-2 mt-0.5">
                                        <Clock className="w-3 h-3" /> {apt.duration}min · {apt.type==='Online'?<><Video className="w-3 h-3" /> Online</>:<><MapPin className="w-3 h-3" /> Presencial</>}
                                      </div>
                                    </div>
                                  </div>
                                  <Badge status={apt.status} />
                                </div>
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    </div>

                    {appointments.filter(a => a.date!=='Hoy').length > 0 && (
                      <div className="animate-fade-in-up delay-200">
                        <p className="text-xs font-semibold text-slate-500 uppercase tracking-widest mb-3">Próximas citas</p>
                        <div className="space-y-3">
                          {appointments.filter(a => a.date!=='Hoy').map(apt => (
                            <div key={apt.id} className="card p-4 flex items-center gap-4 hover:border-border-bright transition-all">
                              <div className="text-center shrink-0 w-20">
                                <div className="text-xs font-semibold text-slate-300">{apt.date}</div>
                                <div className="text-sm font-bold font-mono text-brand-primary">{apt.time}</div>
                              </div>
                              <div className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold shrink-0 ${apt.colorClass}`}>{apt.initials}</div>
                              <div className="flex-1 min-w-0">
                                <div className="font-medium text-sm text-white">{apt.client}</div>
                                <div className="text-xs text-slate-400">{apt.duration}min · {apt.type}</div>
                              </div>
                              <Badge status={apt.status} />
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                  </>
                )}
              </>
            )}

            {/* ══════ MENSAJES ══════ */}
            {activeKey === 'messages' && (
              <>
                <div className="animate-fade-in-up">
                  <h1 className="text-2xl font-bold text-white">Mensajes</h1>
                  <p className="text-slate-400 text-sm mt-0.5">{unreadCount > 0 ? `${unreadCount} sin leer` : 'Todo leído'} · Responde directamente desde aquí</p>
                </div>
                <div className="grid lg:grid-cols-[280px_1fr] gap-0 border border-border rounded-xl overflow-hidden animate-fade-in-up delay-75" style={{ height:'500px' }}>
                  {/* Conversation list */}
                  <div className={`border-r border-border flex flex-col overflow-hidden bg-surface-2 ${mobileShowChat ? 'hidden lg:flex' : 'flex'}`}>
                    <div className="p-3 border-b border-border">
                      <p className="text-xs font-semibold text-slate-400 uppercase tracking-widest">Conversaciones</p>
                    </div>
                    <div className="overflow-y-auto flex-1">
                      {conversations.map(conv => {
                        const isUnread = conv.unread && !readIds.has(conv.id)
                        const isSelected = conv.id === selConvId
                        return (
                          <button key={conv.id} onClick={() => openConv(conv.id)}
                                  className={`w-full flex items-start gap-3 p-4 text-left border-b border-border/40 transition-colors ${isSelected ? 'bg-brand-primary/10' : 'hover:bg-surface-3'}`}>
                            <div className={`w-9 h-9 rounded-full flex items-center justify-center text-xs font-bold shrink-0 ${conv.colorClass}`}>{conv.initials}</div>
                            <div className="flex-1 min-w-0">
                              <div className="flex items-center justify-between gap-1">
                                <span className={`text-sm font-semibold ${isSelected ? 'text-brand-primary' : 'text-white'}`}>{conv.name}</span>
                                <span className="text-[10px] text-slate-500 shrink-0">{conv.lastTime}</span>
                              </div>
                              <div className="text-xs text-slate-400 truncate mt-0.5">{conv.thread[conv.thread.length-1]?.text}</div>
                            </div>
                            {isUnread && <span className="w-2 h-2 rounded-full bg-brand-primary shrink-0 mt-1.5 animate-pulse" />}
                          </button>
                        )
                      })}
                    </div>
                  </div>

                  {/* Chat thread */}
                  <div className={`flex flex-col overflow-hidden ${mobileShowChat ? 'flex' : 'hidden lg:flex'}`}>
                    {selConv ? (
                      <>
                        <div className="p-4 border-b border-border flex items-center gap-3 bg-surface shrink-0">
                          <button onClick={() => setMobileShowChat(false)} aria-label="Volver a conversaciones" className="lg:hidden text-slate-400 hover:text-white mr-1"><ArrowLeft className="w-4 h-4" /></button>
                          <div className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold ${selConv.colorClass}`}>{selConv.initials}</div>
                          <div>
                            <div className="text-sm font-semibold text-white">{selConv.name}</div>
                            <div className="text-[10px] text-emerald-400">Activo recientemente</div>
                          </div>
                        </div>
                        <div ref={chatEndRef} className="flex-1 overflow-y-auto p-4 space-y-4">
                          {selConv.thread.map((msg, i) => (
                            <div key={i} className={`flex gap-2 ${msg.from==='trainer' ? 'flex-row-reverse' : ''}`}>
                              <div className={`w-7 h-7 rounded-full flex items-center justify-center text-[10px] font-bold shrink-0 ${msg.from==='trainer' ? 'bg-brand-primary/20 text-brand-primary' : selConv.colorClass}`}>
                                {msg.from==='trainer' ? 'CM' : selConv.initials}
                              </div>
                              <div className={`max-w-[75%] flex flex-col gap-1 ${msg.from==='trainer' ? 'items-end' : 'items-start'}`}>
                                <div className={`px-3.5 py-2.5 rounded-2xl text-sm leading-relaxed ${msg.from==='trainer' ? 'text-white rounded-tr-sm' : 'bg-surface-2 text-white rounded-tl-sm'}`}
                                     style={msg.from==='trainer' ? { background:'linear-gradient(135deg,#0EA5E9,#7C3AED)' } : {}}>
                                  {msg.text}
                                </div>
                                <span className="text-[10px] text-slate-600 px-1">{msg.time}</span>
                              </div>
                            </div>
                          ))}
                        </div>
                        <form onSubmit={sendReply} className="p-3 border-t border-border flex gap-2 bg-surface shrink-0">
                          <input value={replyText} onChange={e => setReplyText(e.target.value)} className="input flex-1 text-sm" placeholder={`Responder a ${selConv.name}...`} />
                          <button type="submit" disabled={!replyText.trim()} className="btn-gradient px-4 disabled:opacity-40">
                            <Send className="w-4 h-4" />
                          </button>
                        </form>
                      </>
                    ) : (
                      <div className="flex-1 flex items-center justify-center text-slate-500 text-sm">Selecciona una conversación</div>
                    )}
                  </div>
                </div>
              </>
            )}

            {/* ══════ ANALYTICS ══════ */}
            {activeKey === 'analytics' && (
              <>
                <div className="animate-fade-in-up">
                  <h1 className="text-2xl font-bold text-white">Analytics</h1>
                  <p className="text-slate-400 text-sm mt-0.5">Rendimiento · Mayo 2025</p>
                </div>
                <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 animate-fade-in-up delay-75">
                  <StatsCard label="Clientes activos" value={24}      change={{ value: '+3',  positive: true }} icon={<Users className="w-5 h-5" />}        color="primary" />
                  <StatsCard label="Ingresos mes"     value="2.840€" change={{ value: '+18%', positive: true }} icon={<TrendingUp className="w-5 h-5" />}   color="accent" />
                  <StatsCard label="Sesiones sem."    value={14}     change={{ value: '+2',  positive: true }} icon={<CalendarDays className="w-5 h-5" />} color="secondary" />
                  <StatsCard label="Retención"        value="83%"    icon={<Trophy className="w-5 h-5" />}                                                 color="warning" />
                </div>

                <div className="card p-6 animate-fade-in-up delay-150">
                  <div className="flex items-center justify-between mb-5">
                    <div><h2 className="font-semibold text-white">Evolución de ingresos</h2><p className="text-xs text-slate-500 mt-0.5">Dic 2024 — May 2025</p></div>
                    <span className="text-sm font-bold text-emerald-400 flex items-center gap-1"><ArrowUpRight className="w-4 h-4" /> +58% en 6 meses</span>
                  </div>
                  <div className="flex items-end gap-3 h-36 relative">
                    {REVENUE.map((v, i) => (
                      <div key={i} className="flex-1 flex flex-col items-center gap-2 group relative"
                           onMouseEnter={() => setHoveredBar(i)} onMouseLeave={() => setHoveredBar(null)}>
                        {hoveredBar === i && (
                          <div className="absolute -top-8 left-1/2 -translate-x-1/2 bg-slate-800 border border-border rounded-lg px-2 py-1 text-xs font-mono text-white whitespace-nowrap z-10">
                            {v}€ · {MONTHS[i]}
                          </div>
                        )}
                        <span className="text-[10px] text-slate-500 font-mono">{v}€</span>
                        <div className="w-full rounded-t-md transition-all duration-200 cursor-pointer"
                             style={{ height:`${(v/760)*100}%`, minHeight:'4px',
                               background: hoveredBar===i ? 'linear-gradient(180deg,#38BDF8,#818CF8)' : i===5 ? 'linear-gradient(180deg,#0EA5E9,#7C3AED)' : 'rgba(14,165,233,0.22)',
                               boxShadow: i===5 ? '0 0 12px rgba(14,165,233,0.35)' : 'none' }} />
                      </div>
                    ))}
                  </div>
                  <div className="flex mt-2">
                    {MONTHS.map((m,i) => <span key={m} className={`flex-1 text-center text-xs ${i===5?'text-brand-primary font-semibold':'text-slate-600'}`}>{m}</span>)}
                  </div>
                </div>

                <div className="grid lg:grid-cols-2 gap-6 animate-fade-in-up delay-200">
                  <div className="card p-6">
                    <h2 className="font-semibold text-white mb-5">Sesiones completadas por cliente</h2>
                    <div className="space-y-4">
                      {ALL_CLIENTS.map(c => {
                        const pct = Math.round((c.sessions/c.goal)*100)
                        return (
                          <div key={c.id}>
                            <div className="flex justify-between text-xs mb-1.5">
                              <div className="flex items-center gap-2">
                                <div className={`w-5 h-5 rounded-full flex items-center justify-center text-[9px] font-bold ${c.colorClass}`}>{c.initials.charAt(0)}</div>
                                <span className="text-slate-300">{c.name.split(' ').slice(0,2).join(' ')}</span>
                              </div>
                              <span className="font-mono font-semibold text-white">{pct}%</span>
                            </div>
                            <div className="h-1.5 bg-surface-2 rounded-full overflow-hidden">
                              <div className="h-full rounded-full transition-all duration-700" style={{ width:`${pct}%`, background:c.ringColor }} />
                            </div>
                          </div>
                        )
                      })}
                    </div>
                  </div>
                  <div className="card p-6">
                    <h2 className="font-semibold text-white mb-5">Crecimiento de clientes</h2>
                    <div className="flex items-end gap-2 h-28">
                      {[1,1,2,2,3,4].map((v,i) => (
                        <div key={i} className="flex-1 rounded-t-md" style={{ height:`${(v/4)*100}%`, minHeight:'4px', background:i===5?'linear-gradient(180deg,#0EA5E9,#7C3AED)':'rgba(14,165,233,0.2)' }} />
                      ))}
                    </div>
                    <div className="flex mt-2">
                      {MONTHS.map(m => <span key={m} className="flex-1 text-center text-[10px] text-slate-600">{m}</span>)}
                    </div>
                    <div className="mt-4 pt-4 border-t border-border/50 flex items-center justify-between">
                      <div><div className="text-2xl font-bold font-mono gradient-text">+33%</div><div className="text-xs text-slate-500">Crecimiento anual</div></div>
                      <div className="text-right"><div className="text-2xl font-bold font-mono text-white">24</div><div className="text-xs text-slate-500">Clientes activos</div></div>
                    </div>
                  </div>
                </div>
              </>
            )}

            {/* CTA — waitlist */}
            <div id="demo-cta" className="rounded-2xl p-8 border border-brand-primary/20 animate-fade-in-up"
                 style={{ background:'linear-gradient(135deg,rgba(14,165,233,0.07),rgba(124,58,237,0.05))' }}>
              <DemoWaitlistCTA
                title="¿Listo para empezar?"
                subtitle="Apúntate a la lista de espera y te avisamos el día que abramos. Gratis, sin tarjeta."
              />
            </div>

          </div>
        </main>
      </div>

      {/* ── Client detail side panel ── */}
      {selectedClient && (
        <>
          <div className="fixed inset-0 bg-background/70 backdrop-blur-sm z-40 animate-fade-in" onClick={() => setSelectedClient(null)} />
          <div className="fixed right-0 top-0 bottom-0 w-full max-w-md bg-surface border-l border-border z-50 flex flex-col overflow-y-auto shadow-2xl">
            <div className="flex items-center justify-between p-5 border-b border-border shrink-0">
              <h2 className="font-semibold text-white">Perfil del cliente</h2>
              <button onClick={() => setSelectedClient(null)} aria-label="Cerrar perfil" className="w-7 h-7 rounded-lg bg-surface-2 hover:bg-surface-3 flex items-center justify-center transition-colors"><X className="w-4 h-4 text-slate-400" /></button>
            </div>
            <div className="p-5 space-y-5 flex-1">
              {/* Header */}
              <div className="flex items-start gap-4">
                <div className="relative shrink-0">
                  <div className={`w-16 h-16 rounded-full flex items-center justify-center text-xl font-bold ${selectedClient.colorClass}`}>{selectedClient.initials}</div>
                  {selectedClient.streak > 0 && <span className="absolute -top-1 -right-1 w-6 h-6 rounded-full bg-amber-500 flex items-center justify-center text-xs font-bold text-white">{selectedClient.streak}</span>}
                </div>
                <div className="flex-1">
                  <div className="font-bold text-white text-lg">{selectedClient.name}</div>
                  <div className="text-sm text-slate-400 mt-0.5">Desde {selectedClient.since} · Plan {selectedClient.plan}</div>
                  <Badge status={selectedClient.status} />
                </div>
              </div>

              {/* Contact */}
              <div className="space-y-2">
                <a href={`mailto:${selectedClient.email}`} className="flex items-center gap-3 p-3 rounded-xl bg-surface-2 hover:bg-surface-3 transition-colors group">
                  <Mail className="w-4 h-4 text-slate-500 group-hover:text-brand-primary transition-colors" />
                  <span className="text-sm text-slate-300 group-hover:text-white transition-colors">{selectedClient.email}</span>
                </a>
                <a href={`tel:${selectedClient.phone}`} className="flex items-center gap-3 p-3 rounded-xl bg-surface-2 hover:bg-surface-3 transition-colors group">
                  <Phone className="w-4 h-4 text-slate-500 group-hover:text-brand-primary transition-colors" />
                  <span className="text-sm text-slate-300 group-hover:text-white transition-colors">{selectedClient.phone}</span>
                </a>
              </div>

              {/* Stats */}
              <div className="grid grid-cols-3 gap-3">
                {[
                  { label: 'Sesiones', value: `${selectedClient.sessions}/${selectedClient.goal}`, color: 'text-brand-primary' },
                  { label: 'Pérdida',  value: `−${selectedClient.weightLoss}kg`,                  color: 'text-emerald-400' },
                  { label: 'Racha',    value: `${selectedClient.streak}d`,                         color: 'text-amber-400' },
                ].map(s => (
                  <div key={s.label} className="card p-3 text-center">
                    <div className={`text-lg font-bold font-mono ${s.color}`}>{s.value}</div>
                    <div className="text-[10px] text-slate-500 mt-0.5">{s.label}</div>
                  </div>
                ))}
              </div>

              {/* Progress ring */}
              <div className="card p-4 flex items-center gap-4">
                <div className="relative shrink-0">
                  <Ring pct={Math.round((selectedClient.sessions/selectedClient.goal)*100)} size={64} stroke={6} color={selectedClient.ringColor} />
                  <div className="absolute inset-0 flex items-center justify-center">
                    <span className="text-sm font-bold text-white">{Math.round((selectedClient.sessions/selectedClient.goal)*100)}%</span>
                  </div>
                </div>
                <div>
                  <div className="font-medium text-white">Progreso del mes</div>
                  <div className="text-xs text-slate-400 mt-0.5">{selectedClient.sessions} de {selectedClient.goal} sesiones completadas</div>
                  <div className="text-xs text-slate-400 mt-0.5 flex items-center gap-1"><CalendarDays className="w-3 h-3" /> Próxima: {selectedClient.nextApt}</div>
                </div>
              </div>

              {/* Routine & nutrition */}
              {[
                { icon: Dumbbell, label: 'Rutina asignada', value: selectedClient.routine, color: 'text-violet-400', bg: 'bg-violet-500/10' },
              ].map(item => (
                <div key={item.label} className="flex items-center gap-3 p-4 rounded-xl border border-border">
                  <div className={`w-9 h-9 rounded-lg flex items-center justify-center shrink-0 ${item.bg}`}><item.icon className={`w-5 h-5 ${item.color}`} /></div>
                  <div><div className="text-xs text-slate-500">{item.label}</div><div className="text-sm font-medium text-white mt-0.5">{item.value}</div></div>
                </div>
              ))}

              {/* Notes */}
              <div>
                <label className="label mb-2">Notas del entrenador</label>
                <textarea
                  value={clientNotes[selectedClient.id] ?? ''}
                  onChange={e => setClientNotes(prev => ({ ...prev, [selectedClient.id]: e.target.value }))}
                  className="input min-h-[80px] resize-none text-sm"
                  placeholder="Añade notas sobre este cliente..."
                  rows={3}
                />
                {clientNotes[selectedClient.id] && (
                  <p className="text-xs text-emerald-400 mt-1.5 flex items-center gap-1"><Check className="w-3 h-3" /> Guardado automáticamente</p>
                )}
              </div>
            </div>
          </div>
        </>
      )}

      {/* ── Nueva rutina modal ── */}
      <Modal isOpen={showRoutineModal} onClose={() => setShowRM(false)} title="Nueva rutina" size="lg">
        <form onSubmit={submitRoutine} className="space-y-5">
          <div>
            <label className="label">Nombre de la rutina</label>
            <input value={rName} onChange={e => setRName(e.target.value)} className="input" placeholder="Ej: Fuerza y potencia" required />
          </div>
          <div>
            <label className="label">Días de entrenamiento</label>
            <div className="flex gap-2 flex-wrap">
              {['Lun','Mar','Mié','Jue','Vie','Sáb','Dom'].map(d => (
                <button key={d} type="button" onClick={() => toggleDay(d)}
                        className={`px-3 py-1.5 rounded-lg text-xs font-semibold border transition-all ${rDays.includes(d) ? 'bg-brand-primary text-white border-brand-primary' : 'border-border text-slate-400 hover:border-border-bright'}`}>
                  {d}
                </button>
              ))}
            </div>
          </div>
          <div>
            <label className="label">Nivel</label>
            <select value={rLevel} onChange={e => setRLevel(e.target.value)} className="input">
              <option>Principiante</option><option>Intermedio</option><option>Avanzado</option>
            </select>
          </div>
          <div>
            <div className="flex items-center justify-between mb-2">
              <label className="label mb-0">Ejercicios</label>
              <button type="button" onClick={addEx} className="text-xs text-brand-primary hover:underline font-medium flex items-center gap-1"><Plus className="w-3 h-3" /> Añadir ejercicio</button>
            </div>
            <div className="space-y-2">
              {rExercises.map((ex, i) => (
                <div key={i} className="grid grid-cols-[1fr_60px_60px_60px_32px] gap-2 items-center">
                  <input value={ex.name} onChange={e => updateEx(i,'name',e.target.value)} className="input text-sm" placeholder="Nombre del ejercicio" />
                  <input value={ex.sets} onChange={e => updateEx(i,'sets',e.target.value)} className="input text-sm text-center" placeholder="Ser." />
                  <input value={ex.reps} onChange={e => updateEx(i,'reps',e.target.value)} className="input text-sm text-center" placeholder="Rep." />
                  <input value={ex.rest} onChange={e => updateEx(i,'rest',e.target.value)} className="input text-sm text-center" placeholder="Des." />
                  <button type="button" onClick={() => removeEx(i)} aria-label="Eliminar ejercicio" className="w-8 h-8 rounded-lg flex items-center justify-center text-red-400 hover:bg-red-500/10 transition-colors"><Trash2 className="w-3.5 h-3.5" /></button>
                </div>
              ))}
              <div className="grid grid-cols-[1fr_60px_60px_60px_32px] gap-2 text-[10px] text-slate-500 px-1">
                <span>Ejercicio</span><span className="text-center">Series</span><span className="text-center">Reps</span><span className="text-center">Descanso (s)</span>
              </div>
            </div>
          </div>
          <div className="flex gap-3 pt-2">
            <button type="button" onClick={() => setShowRM(false)} className="btn-secondary flex-1">Cancelar</button>
            <button type="submit" className="btn-primary flex-1"><Check className="w-4 h-4" /> Crear rutina</button>
          </div>
        </form>
      </Modal>

      {/* ── Nueva cita modal ── */}
      <Modal isOpen={showAptModal} onClose={() => setShowAM(false)} title="Nueva cita">
        <form onSubmit={submitApt} className="space-y-4">
          <div>
            <label className="label">Cliente</label>
            <select value={aptClient} onChange={e => setAptClient(e.target.value)} className="input">
              {ALL_CLIENTS.map(c => <option key={c.id}>{c.name}</option>)}
            </select>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="label">Fecha</label>
              <input type="date" value={aptDate} onChange={e => setAptDate(e.target.value)} className="input" />
            </div>
            <div>
              <label className="label">Hora</label>
              <input type="time" value={aptTime} onChange={e => setAptTime(e.target.value)} className="input" />
            </div>
          </div>
          <div>
            <label className="label">Duración</label>
            <div className="flex gap-2 flex-wrap">
              {[30,45,60,90].map(d => (
                <button key={d} type="button" onClick={() => setAptDur(d)}
                        className={`px-4 py-2 rounded-lg text-sm font-semibold border transition-all ${aptDur===d ? 'bg-brand-primary text-white border-brand-primary' : 'border-border text-slate-400 hover:border-border-bright'}`}>
                  {d} min
                </button>
              ))}
            </div>
          </div>
          <div>
            <label className="label">Tipo</label>
            <div className="flex gap-2">
              {(['Online','Presencial','Llamada'] as AptType[]).map(t => (
                <button key={t} type="button" onClick={() => setAptType(t)}
                        className={`flex-1 py-2 rounded-lg text-sm font-semibold border transition-all ${aptType===t ? 'bg-brand-primary text-white border-brand-primary' : 'border-border text-slate-400 hover:border-border-bright'}`}>
                  {t}
                </button>
              ))}
            </div>
          </div>
          <div className="flex gap-3 pt-2">
            <button type="button" onClick={() => setShowAM(false)} className="btn-secondary flex-1">Cancelar</button>
            <button type="submit" className="btn-primary flex-1"><CalendarDays className="w-4 h-4" /> Crear cita</button>
          </div>
        </form>
      </Modal>
    </div>
  )
}
