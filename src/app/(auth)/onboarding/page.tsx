'use client'

import { useState, useEffect, useMemo } from 'react'
import { useRouter } from 'next/navigation'
import { toast } from 'sonner'
import {
  Zap, ArrowRight, Loader2, X, Users, Dumbbell, BarChart2,
  CheckCircle2, MessageSquare, CalendarDays,
} from 'lucide-react'
import { createClient } from '@/lib/supabase/client'
import { FREE_MAX_CLIENTS } from '@/lib/plans'

const SPECIALTIES = [
  'Fuerza y musculación', 'Pérdida de peso', 'Atletismo', 'CrossFit',
  'Yoga', 'Pilates', 'Nutrición deportiva', 'Rehabilitación',
  'Running', 'Natación', 'Funcional', 'Mindfulness',
]

const TRAINER_BENEFITS = [
  { icon: Users,          color: 'text-sky-400',    bg: 'rgba(14,165,233,0.15)',  title: 'Gestión de clientes',  desc: 'Perfil completo, historial y seguimiento' },
  { icon: Dumbbell,       color: 'text-violet-400', bg: 'rgba(124,58,237,0.15)', title: 'Rutinas y nutrición',  desc: 'Crea y asigna en segundos' },
  { icon: CalendarDays,   color: 'text-amber-400',  bg: 'rgba(245,158,11,0.15)', title: 'Agenda de citas',      desc: 'Sesiones confirmadas con un clic' },
  { icon: MessageSquare,  color: 'text-emerald-400',bg: 'rgba(16,185,129,0.15)', title: 'Chat en tiempo real',  desc: 'Comunícate directamente con clientes' },
  { icon: BarChart2,      color: 'text-pink-400',   bg: 'rgba(236,72,153,0.15)', title: 'Analytics',           desc: 'Evolución de peso, grasa y rendimiento' },
]

export default function OnboardingPage() {
  const router = useRouter()
  const supabase = useMemo(() => createClient(), [])

  const [role, setRole]                 = useState<'trainer' | 'client' | null>(null)
  const [bio, setBio]                   = useState('')
  const [phone, setPhone]               = useState('')
  const [selectedSpec, setSelectedSpec] = useState<string[]>([])
  const [inviteCode, setInviteCode]     = useState('')
  const [loading, setLoading]           = useState(false)
  const [fetchingRole, setFetchingRole] = useState(true)

  useEffect(() => {
    async function fetchRole() {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) { router.push('/login'); return }
      const { data: p } = await supabase.from('profiles').select('role').eq('id', user.id).single()
      setRole(p?.role || 'trainer')
      setFetchingRole(false)
    }
    fetchRole()
  }, [router, supabase])

  function toggleSpec(spec: string) {
    setSelectedSpec(prev =>
      prev.includes(spec) ? prev.filter(s => s !== spec) : [...prev, spec]
    )
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setLoading(true)
    try {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) return

      if (role === 'trainer') {
        const { error } = await supabase.from('profiles').update({
          bio,
          phone,
          specialties: selectedSpec,
        }).eq('id', user.id)
        if (error) { toast.error(error.message); return }
        await supabase.from('subscriptions').upsert({
          user_id: user.id,
          status: 'inactive',
          max_clients: FREE_MAX_CLIENTS,
        }, { onConflict: 'user_id' })
        toast.success('¡Perfil configurado!')
        router.push('/dashboard')
      } else {
        if (!inviteCode.trim()) { toast.error('Introduce el código de invitación'); return }
        const { data: inv, error: invErr } = await supabase
          .from('invitations')
          .select('*, trainer:trainer_id(id, full_name)')
          .eq('code', inviteCode.trim().toLowerCase())
          .is('used_at', null)
          .gte('expires_at', new Date().toISOString())
          .single()

        if (invErr || !inv) { toast.error('Código inválido o expirado'); return }

        const [{ data: trainerSub }, { count: trainerClientCount }] = await Promise.all([
          supabase.from('subscriptions').select('max_clients').eq('user_id', inv.trainer_id).single(),
          supabase.from('trainer_clients')
            .select('*', { count: 'exact', head: true })
            .eq('trainer_id', inv.trainer_id)
            .eq('status', 'active'),
        ])
        const trainerMax = trainerSub?.max_clients ?? 0
        if ((trainerClientCount ?? 0) >= trainerMax) {
          toast.error('Tu entrenador ha alcanzado el límite de clientes de su plan. Pídele que actualice su plan.')
          return
        }

        await Promise.all([
          supabase.from('invitations').update({ used_at: new Date().toISOString() }).eq('id', inv.id),
          supabase.from('trainer_clients').insert({ trainer_id: inv.trainer_id, client_id: user.id }),
          supabase.from('profiles').update({ phone }).eq('id', user.id),
        ])
        toast.success(`¡Te has unido con ${(inv.trainer as { full_name: string }).full_name}!`)
        router.push('/client')
      }
    } finally {
      setLoading(false)
    }
  }

  if (fetchingRole) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-brand-primary" />
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Ambient background */}
      <div className="fixed inset-0 pointer-events-none">
        <div className="absolute top-0 left-1/3 w-[500px] h-[400px]"
             style={{ background: 'radial-gradient(ellipse, rgba(14,165,233,0.07) 0%, transparent 70%)' }} />
        <div className="absolute bottom-0 right-1/3 w-[400px] h-[350px]"
             style={{ background: 'radial-gradient(ellipse, rgba(124,58,237,0.06) 0%, transparent 70%)' }} />
      </div>

      {/* Top nav */}
      <div className="relative z-10 h-14 flex items-center px-6 border-b border-border/40">
        <div className="flex items-center gap-2.5">
          <div className="w-7 h-7 rounded-lg flex items-center justify-center"
               style={{ background: 'linear-gradient(135deg, #0EA5E9, #7C3AED)' }}>
            <Zap className="w-3.5 h-3.5 text-white" />
          </div>
          <span className="font-bold text-white text-sm tracking-tight">TrainerBoost</span>
        </div>
        {/* Step indicator */}
        <div className="ml-auto flex items-center gap-2 text-xs text-slate-500">
          <div className="flex items-center gap-1.5">
            <div className="w-5 h-5 rounded-full bg-brand-primary/20 border border-brand-primary/40 flex items-center justify-center">
              <CheckCircle2 className="w-3 h-3 text-brand-primary" />
            </div>
            <span>Cuenta creada</span>
          </div>
          <div className="w-8 h-px bg-border/60" />
          <div className="flex items-center gap-1.5">
            <div className="w-5 h-5 rounded-full bg-brand-primary flex items-center justify-center">
              <span className="text-[9px] font-bold text-white">2</span>
            </div>
            <span className="text-white font-medium">Tu perfil</span>
          </div>
          <div className="w-8 h-px bg-border/60" />
          <div className="flex items-center gap-1.5">
            <div className="w-5 h-5 rounded-full bg-surface-2 border border-border/60 flex items-center justify-center">
              <span className="text-[9px] text-slate-600">3</span>
            </div>
            <span>Dashboard</span>
          </div>
        </div>
      </div>

      <div className="relative z-10 flex items-center justify-center min-h-[calc(100vh-3.5rem)] p-4 py-8">
        <div className="w-full max-w-4xl grid md:grid-cols-2 gap-8 items-start">

          {/* ── Form ──────────────────────────────────────────────────── */}
          <div className="card p-8 animate-fade-in-up">
            <div className="mb-6">
              <h1 className="text-2xl font-bold text-white mb-1">
                {role === 'trainer' ? 'Configura tu perfil' : 'Únete con tu entrenador'}
              </h1>
              <p className="text-slate-400 text-sm">
                {role === 'trainer'
                  ? 'Cuéntanos sobre ti para que tus clientes te conozcan'
                  : 'Introduce el código que te ha dado tu entrenador'}
              </p>
            </div>

            <form onSubmit={handleSubmit} className="space-y-5">
              {role === 'trainer' ? (
                <>
                  <div>
                    <label className="label">Teléfono <span className="text-slate-600">(opcional)</span></label>
                    <input
                      type="tel"
                      value={phone}
                      onChange={e => setPhone(e.target.value)}
                      className="input"
                      placeholder="+34 600 000 000"
                    />
                  </div>
                  <div>
                    <label className="label">Bio profesional <span className="text-slate-600">(opcional)</span></label>
                    <textarea
                      value={bio}
                      onChange={e => setBio(e.target.value)}
                      className="input min-h-[80px] resize-none"
                      placeholder="Cuéntales a tus clientes tu experiencia, metodología..."
                      rows={3}
                    />
                  </div>
                  <div>
                    <label className="label">Especialidades <span className="text-slate-600">(opcional)</span></label>
                    <div className="flex flex-wrap gap-2">
                      {SPECIALTIES.map(spec => (
                        <button
                          key={spec}
                          type="button"
                          onClick={() => toggleSpec(spec)}
                          className={`px-3 py-1.5 rounded-full text-xs font-medium transition-all ${
                            selectedSpec.includes(spec)
                              ? 'bg-brand-primary text-white shadow-sm'
                              : 'bg-surface border border-border text-slate-400 hover:border-slate-600 hover:text-slate-300'
                          }`}
                        >
                          {selectedSpec.includes(spec) && <X className="inline w-3 h-3 mr-1" />}
                          {spec}
                        </button>
                      ))}
                    </div>
                  </div>
                </>
              ) : (
                <>
                  <div>
                    <label className="label">Código de invitación</label>
                    <input
                      value={inviteCode}
                      onChange={e => setInviteCode(e.target.value)}
                      className="input font-mono text-lg tracking-widest text-center uppercase"
                      placeholder="xxxxxxxx"
                      maxLength={8}
                    />
                    <p className="text-xs text-slate-500 mt-2">
                      Tu entrenador te dará este código de 8 caracteres
                    </p>
                  </div>
                  <div>
                    <label className="label">Teléfono <span className="text-slate-600">(opcional)</span></label>
                    <input
                      type="tel"
                      value={phone}
                      onChange={e => setPhone(e.target.value)}
                      className="input"
                      placeholder="+34 600 000 000"
                    />
                  </div>
                </>
              )}

              <button type="submit" disabled={loading} className="btn-gradient w-full py-3">
                {loading
                  ? <><Loader2 className="w-4 h-4 animate-spin" /> Guardando...</>
                  : <><ArrowRight className="w-4 h-4" /> {role === 'trainer' ? 'Acceder al dashboard' : 'Unirme a mi entrenador'}</>}
              </button>

              {role === 'trainer' && (
                <p className="text-center text-xs text-slate-500">
                  Puedes completar estos datos más tarde desde tu perfil
                </p>
              )}
            </form>
          </div>

          {/* ── Benefits (trainer) ────────────────────────────────────── */}
          {role === 'trainer' && (
            <div className="hidden md:block space-y-5 animate-fade-in-up" style={{ animationDelay: '0.1s' }}>
              <div>
                <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-3">
                  Lo que desbloqueas ahora mismo
                </p>
                <div className="space-y-3">
                  {TRAINER_BENEFITS.map(b => (
                    <div key={b.title} className="flex items-center gap-3 p-3 rounded-xl border border-border/40 bg-surface/40">
                      <div className="w-9 h-9 rounded-xl flex items-center justify-center shrink-0" style={{ background: b.bg }}>
                        <b.icon className={`w-4.5 h-4.5 ${b.color}`} />
                      </div>
                      <div>
                        <p className="text-sm font-medium text-white">{b.title}</p>
                        <p className="text-xs text-slate-500 mt-0.5">{b.desc}</p>
                      </div>
                      <CheckCircle2 className="w-4 h-4 text-brand-accent ml-auto shrink-0" />
                    </div>
                  ))}
                </div>
              </div>

              <div className="rounded-xl p-4 border"
                   style={{ background: 'linear-gradient(135deg, rgba(14,165,233,0.06), rgba(124,58,237,0.04))', borderColor: 'rgba(14,165,233,0.2)' }}>
                <p className="text-xs text-slate-400 leading-relaxed">
                  <span className="font-semibold text-white">Plan gratuito incluido.</span>{' '}
                  Gestiona hasta {FREE_MAX_CLIENTS} clientes sin tarjeta de crédito. Actualiza cuando quieras.
                </p>
              </div>
            </div>
          )}

          {role === 'client' && (
            <div className="hidden md:block animate-fade-in-up" style={{ animationDelay: '0.1s' }}>
              <div className="card p-6 text-center">
                <div className="w-16 h-16 rounded-2xl flex items-center justify-center mx-auto mb-4"
                     style={{ background: 'linear-gradient(135deg, rgba(16,185,129,0.2), rgba(14,165,233,0.1))' }}>
                  <Users className="w-8 h-8 text-brand-accent" />
                </div>
                <h3 className="font-semibold text-white mb-2">Tu portal personal</h3>
                <p className="text-sm text-slate-400 leading-relaxed">
                  Accede a tu rutina del día, plan de nutrición, citas y mensajes con tu entrenador — todo en un solo lugar.
                </p>
                <div className="mt-4 space-y-2 text-left">
                  {['Rutina del día con timer', 'Plan nutricional y macros', 'Registro de progreso', 'Chat directo con tu PT'].map(f => (
                    <div key={f} className="flex items-center gap-2 text-xs text-slate-400">
                      <CheckCircle2 className="w-3.5 h-3.5 text-brand-accent shrink-0" />
                      {f}
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
