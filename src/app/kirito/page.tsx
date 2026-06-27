import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import Link from 'next/link'
import {
  AlertCircle, CheckCircle2, Clock, Zap, Database,
  Users, CreditCard, ExternalLink, GitBranch, Package,
  ShieldAlert, Terminal, TrendingUp, BookOpen
} from 'lucide-react'

export const metadata = { title: 'Kirito OS — TrainerBoost' }

const TASKS_MAX = [
  { text: 'DEPLOY a producción — lleva semanas pendiente', xp: '+200 XP' },
  { text: 'Demo carga con datos vacíos — blocker crítico de conversión', xp: 'P1' },
  { text: '13 API routes sin validación Zod', xp: 'SEC' },
  { text: '4 vulnerabilidades npm high (Next.js DoS + glob injection)', xp: 'SEC' },
]

const TASKS_SPRINT = [
  { text: 'Sistema de waitlist con infraestructura funcional', done: false },
  { text: 'Botón "Ver demo en vivo" — bajo contraste, añadir borde', done: false },
  { text: 'Progress bars dashboard — flashean 0% hasta que GSAP inicializa', done: false },
  { text: 'Landing redesign v7 — nivel ForgeTales', done: true },
  { text: 'GSAP 3.15 + SplitText + ScrollTrigger', done: true },
  { text: 'Página /kirito dashboard de control', done: true },
  { text: 'Ciclo de memoria Kirito OS activado', done: true },
]

const TECH_DEBT = [
  { severity: 'high', text: '13 API routes sin validación Zod' },
  { severity: 'high', text: '4 vulnerabilidades npm high → npm audit fix' },
  { severity: 'med', text: '33 console.log activos en producción' },
  { severity: 'med', text: 'Sin security headers en next.config' },
  { severity: 'low', text: '1 uso de `as any` en api/invite/[code]/route.ts:39' },
  { severity: 'low', text: '2 componentes >1400 líneas (routines, clients/[id])' },
  { severity: 'low', text: '4 componentes con `use client` innecesario' },
]

const PAGES = [
  { path: '/', label: 'Landing' },
  { path: '/pricing', label: 'Pricing' },
  { path: '/demo', label: 'Demo' },
  { path: '/demo/trainer', label: 'Demo Trainer' },
  { path: '/demo/client', label: 'Demo Cliente' },
  { path: '/login', label: 'Login' },
  { path: '/register', label: 'Register' },
  { path: '/dashboard', label: 'Dashboard' },
  { path: '/client', label: 'Client' },
]

const EXTERNAL = [
  { label: 'Supabase', url: 'https://supabase.com/dashboard' },
  { label: 'Vercel', url: 'https://vercel.com/dashboard' },
  { label: 'Sentry', url: 'https://sentry.io' },
  { label: 'Stripe', url: 'https://dashboard.stripe.com' },
  { label: 'GitHub', url: 'https://github.com' },
]

const XP = 750
const XP_NEXT = 1500
const XP_PCT = Math.round((XP / XP_NEXT) * 100)

const ADMIN_EMAIL = process.env.KIRITO_ADMIN_EMAIL ?? 'ilyaalvarez66@gmail.com'

export default async function KiritoPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  // Página de administración — solo accesible para el admin del sistema
  if (user.email !== ADMIN_EMAIL) redirect('/dashboard')

  const { data: profile } = await supabase
    .from('profiles')
    .select('role, full_name')
    .eq('id', user.id)
    .single()

  if (!profile) redirect('/onboarding')

  const [
    { count: trainerCount },
    { count: clientCount },
    { count: activeSubCount },
    { data: planBreakdown },
  ] = await Promise.all([
    supabase.from('profiles').select('*', { count: 'exact', head: true }).eq('role', 'trainer'),
    supabase.from('profiles').select('*', { count: 'exact', head: true }).eq('role', 'client'),
    supabase.from('subscriptions').select('*', { count: 'exact', head: true }).eq('status', 'active'),
    supabase.from('subscriptions')
      .select('plan')
      .eq('status', 'active'),
  ])

  const plans = (planBreakdown ?? []).reduce<Record<string, number>>((acc, s) => {
    acc[s.plan] = (acc[s.plan] ?? 0) + 1
    return acc
  }, {})

  return (
    <div className="min-h-screen bg-[#0A0A0A] text-white font-mono">
      <div className="max-w-5xl mx-auto px-6 py-10 space-y-8">

        {/* Header */}
        <div className="border border-[#8FD43A]/30 rounded-lg p-5 bg-[#8FD43A]/5">
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-3">
              <Zap className="text-[#8FD43A]" size={20} />
              <span className="text-[#8FD43A] font-bold tracking-widest text-sm uppercase">
                KIRITO OS v3.1 · TrainerBoost
              </span>
            </div>
            <span className="text-zinc-500 text-xs">
              {new Date().toLocaleDateString('es-ES', { weekday: 'short', day: '2-digit', month: 'short' })}
            </span>
          </div>

          <div className="flex items-center gap-6 text-sm text-zinc-400 mb-4">
            <span className="flex items-center gap-1.5">
              <GitBranch size={13} />
              feature/waitlist-hero
            </span>
            <span className="flex items-center gap-1.5">
              <TrendingUp size={13} />
              Nivel 2 · Builder
            </span>
            <span className="flex items-center gap-1.5">
              <BookOpen size={13} />
              6 artículos · knowledge/
            </span>
          </div>

          {/* XP bar */}
          <div>
            <div className="flex justify-between text-xs text-zinc-500 mb-1.5">
              <span>{XP} XP</span>
              <span>{XP_NEXT} XP → Craftsman</span>
            </div>
            <div className="h-1.5 bg-zinc-800 rounded-full overflow-hidden">
              <div
                className="h-full bg-[#8FD43A] rounded-full transition-all"
                style={{ width: `${XP_PCT}%` }}
              />
            </div>
          </div>
        </div>

        {/* Grid: tareas + métricas */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">

          {/* Prioridad máxima */}
          <div className="border border-red-900/40 rounded-lg p-5 bg-red-950/10">
            <h2 className="text-xs uppercase tracking-widest text-red-400 mb-4 flex items-center gap-2">
              <AlertCircle size={13} /> Prioridad Máxima
            </h2>
            <ul className="space-y-3">
              {TASKS_MAX.map((t, i) => (
                <li key={i} className="flex items-start gap-2.5 text-sm">
                  <span className="mt-0.5 w-2 h-2 rounded-full bg-red-500 flex-shrink-0" />
                  <div>
                    <span className="text-zinc-200">{t.text}</span>
                    <span className="ml-2 text-red-400 text-xs">{t.xp}</span>
                  </div>
                </li>
              ))}
            </ul>
          </div>

          {/* Métricas DB */}
          <div className="border border-zinc-800 rounded-lg p-5">
            <h2 className="text-xs uppercase tracking-widest text-zinc-500 mb-4 flex items-center gap-2">
              <Database size={13} /> Métricas · Supabase EU
            </h2>
            <div className="space-y-3">
              <div className="flex justify-between text-sm">
                <span className="flex items-center gap-2 text-zinc-400">
                  <Users size={13} /> Trainers registrados
                </span>
                <span className="text-white font-medium">{trainerCount ?? '—'}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="flex items-center gap-2 text-zinc-400">
                  <Users size={13} /> Clientes registrados
                </span>
                <span className="text-white font-medium">{clientCount ?? '—'}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="flex items-center gap-2 text-zinc-400">
                  <CreditCard size={13} /> Subscripciones activas
                </span>
                <span className="text-[#8FD43A] font-medium">{activeSubCount ?? '—'}</span>
              </div>
              {Object.entries(plans).length > 0 && (
                <div className="pt-2 border-t border-zinc-800 space-y-1.5">
                  {Object.entries(plans).map(([plan, count]) => (
                    <div key={plan} className="flex justify-between text-xs text-zinc-500">
                      <span className="capitalize">{plan}</span>
                      <span>{count}</span>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Sprint actual */}
        <div className="border border-zinc-800 rounded-lg p-5">
          <h2 className="text-xs uppercase tracking-widest text-zinc-500 mb-4 flex items-center gap-2">
            <Terminal size={13} /> Sprint Actual · feature/waitlist-hero
          </h2>
          <ul className="space-y-2">
            {TASKS_SPRINT.map((t, i) => (
              <li key={i} className="flex items-start gap-2.5 text-sm">
                {t.done ? (
                  <CheckCircle2 size={14} className="text-[#8FD43A] mt-0.5 flex-shrink-0" />
                ) : (
                  <Clock size={14} className="text-zinc-600 mt-0.5 flex-shrink-0" />
                )}
                <span className={t.done ? 'text-zinc-600 line-through' : 'text-zinc-300'}>
                  {t.text}
                </span>
              </li>
            ))}
          </ul>
        </div>

        {/* Deuda técnica */}
        <div className="border border-amber-900/30 rounded-lg p-5 bg-amber-950/5">
          <h2 className="text-xs uppercase tracking-widest text-amber-500/70 mb-4 flex items-center gap-2">
            <ShieldAlert size={13} /> Deuda Técnica · codeflow 2026-06-04
          </h2>
          <ul className="space-y-2">
            {TECH_DEBT.map((t, i) => (
              <li key={i} className="flex items-start gap-2.5 text-sm">
                <span className={`mt-1 w-1.5 h-1.5 rounded-full flex-shrink-0 ${
                  t.severity === 'high' ? 'bg-red-500' :
                  t.severity === 'med' ? 'bg-amber-500' : 'bg-zinc-600'
                }`} />
                <span className="text-zinc-400">{t.text}</span>
              </li>
            ))}
          </ul>
        </div>

        {/* Links rápidos — páginas */}
        <div className="border border-zinc-800 rounded-lg p-5">
          <h2 className="text-xs uppercase tracking-widest text-zinc-500 mb-4 flex items-center gap-2">
            <Package size={13} /> Páginas del Proyecto
          </h2>
          <div className="flex flex-wrap gap-2">
            {PAGES.map((p) => (
              <Link
                key={p.path}
                href={p.path}
                className="px-3 py-1.5 bg-zinc-900 border border-zinc-700 rounded text-xs text-zinc-300 hover:border-[#8FD43A]/50 hover:text-[#8FD43A] transition-colors"
              >
                {p.label}
              </Link>
            ))}
          </div>
        </div>

        {/* Links externos */}
        <div className="border border-zinc-800 rounded-lg p-5">
          <h2 className="text-xs uppercase tracking-widest text-zinc-500 mb-4 flex items-center gap-2">
            <ExternalLink size={13} /> Herramientas Externas
          </h2>
          <div className="flex flex-wrap gap-2">
            {EXTERNAL.map((e) => (
              <a
                key={e.label}
                href={e.url}
                target="_blank"
                rel="noopener noreferrer"
                className="px-3 py-1.5 bg-zinc-900 border border-zinc-700 rounded text-xs text-zinc-300 hover:border-[#8FD43A]/50 hover:text-[#8FD43A] transition-colors flex items-center gap-1.5"
              >
                {e.label}
                <ExternalLink size={10} />
              </a>
            ))}
          </div>
        </div>

        {/* Footer */}
        <div className="text-center text-xs text-zinc-700 py-2">
          KIRITO OS v3.1 · /kirito solo visible para trainers autenticados ·{' '}
          <Link href="/dashboard" className="hover:text-zinc-500 transition-colors">
            Ir al dashboard →
          </Link>
        </div>

      </div>
    </div>
  )
}
