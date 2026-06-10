'use client'

import { useState, useEffect, useMemo } from 'react'
import { useRouter } from 'next/navigation'
import { toast } from 'sonner'
import {
  Zap, ArrowRight, Loader2, X, Users, Dumbbell, BarChart2,
  CheckCircle2, MessageSquare, CalendarDays, Mail, Sparkles,
  ChevronRight,
} from 'lucide-react'
import { createClient } from '@/lib/supabase/client'
import { FREE_MAX_CLIENTS } from '@/lib/plans'

export const dynamic = 'force-dynamic'

const SPECIALTIES = [
  'Fuerza y musculación', 'Pérdida de peso', 'CrossFit', 'Running',
  'Yoga / Pilates', 'Nutrición deportiva', 'Funcional', 'Rehabilitación',
  'Atletismo', 'Natación', 'Mindfulness', 'Otro',
]

// ─── Trainer wizard: 3 steps (0=welcome, 1=specialties, 2=invite) ─────────────

function TrainerWizard({ firstName, userId }: { firstName: string; userId: string }) {
  const router   = useRouter()
  const supabase = useMemo(() => createClient(), [])
  const [step,           setStep]           = useState(0)
  const [selectedSpec,   setSelectedSpec]   = useState<string[]>([])
  const [savingSpec,     setSavingSpec]     = useState(false)
  const [inviteEmail,    setInviteEmail]    = useState('')
  const [inviting,       setInviting]       = useState(false)
  const [inviteSent,     setInviteSent]     = useState(false)
  const [inviteCode,     setInviteCode]     = useState('')
  const [goingToBoard,   setGoingToBoard]   = useState(false)

  function toggleSpec(spec: string) {
    setSelectedSpec(prev => prev.includes(spec) ? prev.filter(s => s !== spec) : [...prev, spec])
  }

  async function saveSpecialties() {
    setSavingSpec(true)
    await supabase.from('profiles').update({ specialties: selectedSpec }).eq('id', userId)
    await supabase.from('subscriptions').upsert(
      { user_id: userId, status: 'inactive', max_clients: FREE_MAX_CLIENTS },
      { onConflict: 'user_id' }
    )
    setSavingSpec(false)
    setStep(2)
  }

  async function sendInvite(e: React.FormEvent) {
    e.preventDefault()
    const email = inviteEmail.trim().toLowerCase()
    if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      toast.error('Introduce un email válido')
      return
    }
    setInviting(true)
    try {
      // Create invitation
      const { data: inv, error: invErr } = await supabase
        .from('invitations')
        .insert({ trainer_id: userId, email })
        .select('id, code')
        .single()

      if (invErr || !inv) { toast.error('Error al crear la invitación'); return }

      setInviteCode(inv.code)

      // Send email
      const res = await fetch('/api/invite/send', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ invitationId: inv.id }),
      })

      if (res.ok) {
        setInviteSent(true)
        toast.success(`Invitación enviada a ${email}`)
      } else {
        // Email failed but invitation exists — show code
        setInviteSent(true)
        toast.success('Invitación creada. Comparte el código manualmente.')
      }
    } finally {
      setInviting(false)
    }
  }

  async function goToDashboard() {
    setGoingToBoard(true)
    // Ensure subscription is created even if user skipped step 1
    await supabase.from('subscriptions').upsert(
      { user_id: userId, status: 'inactive', max_clients: FREE_MAX_CLIENTS },
      { onConflict: 'user_id' }
    )
    router.push('/dashboard')
  }

  // ── Progress bar ─────────────────────────────────────────────────────────
  const STEPS = ['Bienvenida', 'Especialidades', 'Primer cliente']
  const progressPct = step === 0 ? 0 : step === 1 ? 33 : step === 2 ? 66 : 100

  return (
    <div className="min-h-screen bg-background flex flex-col">
      {/* Ambient */}
      <div className="fixed inset-0 pointer-events-none">
        <div className="absolute top-0 left-1/3 w-[500px] h-[400px]"
             style={{ background: 'radial-gradient(ellipse, rgba(14,165,233,0.07) 0%, transparent 70%)' }} />
        <div className="absolute bottom-0 right-1/3 w-[400px] h-[350px]"
             style={{ background: 'radial-gradient(ellipse, rgba(124,58,237,0.06) 0%, transparent 70%)' }} />
      </div>

      {/* Header */}
      <div className="relative z-10 h-14 flex items-center px-6 border-b border-border/40">
        <div className="flex items-center gap-2.5">
          <div className="w-7 h-7 rounded-lg flex items-center justify-center"
               style={{ background: '#8FD43A' }}>
            <Zap className="w-3.5 h-3.5 text-black" />
          </div>
          <span className="font-bold text-white text-sm tracking-tight">TrainerBoost</span>
        </div>

        {/* Progress steps (hidden on step 0) */}
        {step > 0 && (
          <div className="ml-auto flex items-center gap-3">
            {STEPS.map((label, i) => {
              const done    = i + 1 < step
              const current = i + 1 === step
              return (
                <div key={label} className="flex items-center gap-1.5">
                  {i > 0 && <div className="w-6 h-px bg-border/60 hidden sm:block" />}
                  <div className="flex items-center gap-1.5">
                    <div className={`w-5 h-5 rounded-full flex items-center justify-center text-[9px] font-bold transition-all ${
                      done    ? 'bg-brand-primary/20 border border-brand-primary/40' :
                      current ? 'bg-brand-primary' :
                                'bg-surface-2 border border-border/60'
                    }`}>
                      {done
                        ? <CheckCircle2 className="w-3 h-3 text-brand-primary" />
                        : <span className={current ? 'text-white' : 'text-slate-600'}>{i + 1}</span>}
                    </div>
                    <span className={`text-xs hidden sm:block ${current ? 'text-white font-medium' : 'text-slate-500'}`}>
                      {label}
                    </span>
                  </div>
                </div>
              )
            })}
          </div>
        )}
      </div>

      {/* Progress bar */}
      {step > 0 && (
        <div className="relative z-10 h-0.5 bg-surface-2">
          <div className="h-full transition-all duration-500 ease-out"
               style={{ width: `${progressPct}%`, background: 'linear-gradient(90deg,#0EA5E9,#7C3AED)' }} />
        </div>
      )}

      <div className="relative z-10 flex items-center justify-center flex-1 p-4 py-8">
        <div className="w-full max-w-lg animate-fade-in-up">

          {/* ─────────────── STEP 0 — Welcome ─────────────────────────── */}
          {step === 0 && (
            <div className="card p-8 text-center">
              <div className="w-16 h-16 rounded-2xl flex items-center justify-center mx-auto mb-6"
                   style={{ background: 'linear-gradient(135deg, rgba(14,165,233,0.2), rgba(124,58,237,0.15))', border: '1px solid rgba(14,165,233,0.3)' }}>
                <Sparkles className="w-8 h-8 text-brand-primary" />
              </div>
              <h1 className="text-2xl font-bold text-white mb-2">
                Hola, {firstName} 👋
              </h1>
              <p className="text-slate-400 mb-8 leading-relaxed">
                Vamos a configurar tu cuenta en <strong className="text-white">menos de 3 minutos</strong>.
                Solo 2 pasos y ya tienes tu dashboard listo.
              </p>

              <div className="space-y-3 mb-8 text-left">
                {[
                  { icon: Dumbbell,      color: 'text-violet-400', bg: 'rgba(124,58,237,0.15)', text: 'Tus especialidades — para que tus clientes te encuentren' },
                  { icon: Users,         color: 'text-sky-400',    bg: 'rgba(14,165,233,0.15)',  text: 'Invita a tu primer cliente — recibirá el acceso por email' },
                  { icon: BarChart2,     color: 'text-emerald-400',bg: 'rgba(16,185,129,0.15)', text: 'Dashboard activo — rutinas, citas y mensajes te esperan' },
                ].map(({ icon: Icon, color, bg, text }) => (
                  <div key={text} className="flex items-center gap-3 p-3 rounded-xl border border-border/40 bg-surface/40">
                    <div className="w-8 h-8 rounded-lg flex items-center justify-center shrink-0" style={{ background: bg }}>
                      <Icon className={`w-4 h-4 ${color}`} />
                    </div>
                    <span className="text-sm text-slate-300">{text}</span>
                    <CheckCircle2 className="w-4 h-4 text-brand-accent ml-auto shrink-0" />
                  </div>
                ))}
              </div>

              <button onClick={() => setStep(1)} className="btn-gradient w-full py-3 text-base">
                Empezar <ArrowRight className="w-4 h-4" />
              </button>

              <p className="text-xs text-slate-600 mt-3">Plan gratuito · Hasta {FREE_MAX_CLIENTS} clientes · Sin tarjeta</p>
            </div>
          )}

          {/* ─────────────── STEP 1 — Especialidades ─────────────────── */}
          {step === 1 && (
            <div className="card p-8">
              <div className="mb-6">
                <p className="text-xs font-semibold text-brand-primary uppercase tracking-widest mb-1">Paso 1 de 2</p>
                <h2 className="text-xl font-bold text-white mb-1">¿En qué te especializas?</h2>
                <p className="text-slate-400 text-sm">Selecciona las que apliquen. Puedes cambiarlas después.</p>
              </div>

              <div className="flex flex-wrap gap-2 mb-8">
                {SPECIALTIES.map(spec => (
                  <button key={spec} type="button" onClick={() => toggleSpec(spec)}
                          className={`px-3 py-1.5 rounded-full text-xs font-medium transition-all border ${
                            selectedSpec.includes(spec)
                              ? 'bg-brand-primary text-white border-brand-primary shadow-sm'
                              : 'bg-surface border-border text-slate-400 hover:border-slate-500 hover:text-slate-300'
                          }`}>
                    {selectedSpec.includes(spec) && <X className="inline w-3 h-3 mr-1 -mt-0.5" />}
                    {spec}
                  </button>
                ))}
              </div>

              <div className="flex gap-3">
                <button type="button" onClick={() => setStep(2)}
                        className="btn-secondary flex-1 py-2.5 text-sm">
                  Saltar
                </button>
                <button type="button" onClick={saveSpecialties} disabled={savingSpec}
                        className="btn-gradient flex-1 py-2.5">
                  {savingSpec
                    ? <><Loader2 className="w-4 h-4 animate-spin" /> Guardando...</>
                    : <>Siguiente <ChevronRight className="w-4 h-4" /></>}
                </button>
              </div>
            </div>
          )}

          {/* ─────────────── STEP 2 — Invite first client ────────────── */}
          {step === 2 && (
            <div className="card p-8">
              <div className="mb-6">
                <p className="text-xs font-semibold text-brand-primary uppercase tracking-widest mb-1">Paso 2 de 2</p>
                <h2 className="text-xl font-bold text-white mb-1">Invita a tu primer cliente</h2>
                <p className="text-slate-400 text-sm">
                  Introduce su email y le llegará un acceso directo. Solo necesita hacer clic.
                </p>
              </div>

              {!inviteSent ? (
                <form onSubmit={sendInvite} className="space-y-4">
                  <div>
                    <label className="label">Email del cliente</label>
                    <div className="relative">
                      <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
                      <input
                        type="email"
                        value={inviteEmail}
                        onChange={e => setInviteEmail(e.target.value)}
                        className="input pl-9"
                        placeholder="cliente@email.com"
                        autoFocus
                      />
                    </div>
                  </div>

                  <div className="flex gap-3">
                    <button type="button" onClick={goToDashboard} disabled={goingToBoard}
                            className="btn-secondary flex-1 py-2.5 text-sm">
                      {goingToBoard ? <Loader2 className="w-4 h-4 animate-spin" /> : 'Hacer después'}
                    </button>
                    <button type="submit" disabled={inviting || !inviteEmail.trim()}
                            className="btn-gradient flex-1 py-2.5 disabled:opacity-40">
                      {inviting
                        ? <><Loader2 className="w-4 h-4 animate-spin" /> Enviando...</>
                        : <><Mail className="w-4 h-4" /> Enviar invitación</>}
                    </button>
                  </div>
                </form>
              ) : (
                /* Invitation sent state */
                <div className="space-y-5">
                  <div className="text-center py-4">
                    <div className="w-14 h-14 rounded-full bg-emerald-500/20 border border-emerald-500/30 flex items-center justify-center mx-auto mb-3">
                      <CheckCircle2 className="w-7 h-7 text-emerald-400" />
                    </div>
                    <h3 className="font-semibold text-white mb-1">Invitación enviada</h3>
                    <p className="text-sm text-slate-400">
                      {inviteEmail} recibirá un email con su acceso.
                    </p>
                  </div>

                  {/* Code as fallback */}
                  <div className="rounded-xl p-4 border border-border/60 bg-surface-2">
                    <p className="text-xs text-slate-500 mb-2">Código manual (por si no le llega el email):</p>
                    <div className="font-mono text-xl font-bold text-brand-primary tracking-[0.3em] text-center">
                      {inviteCode.toUpperCase()}
                    </div>
                    <p className="text-[10px] text-slate-600 text-center mt-1">
                      Válido 7 días · <a href="/onboarding" className="underline">trainerboost.es/onboarding</a>
                    </p>
                  </div>

                  <button onClick={goToDashboard} disabled={goingToBoard}
                          className="btn-gradient w-full py-3">
                    {goingToBoard
                      ? <><Loader2 className="w-4 h-4 animate-spin" /> Cargando...</>
                      : <>Ir a mi dashboard <ArrowRight className="w-4 h-4" /></>}
                  </button>
                </div>
              )}

              <div className="mt-5 p-3 rounded-xl border border-border/40 bg-surface/40">
                <p className="text-xs text-slate-500 flex items-start gap-2">
                  <MessageSquare className="w-3.5 h-3.5 text-slate-600 shrink-0 mt-0.5" />
                  Tu cliente recibirá un email para crear su cuenta y acceder a su portal personalizado.
                </p>
              </div>
            </div>
          )}

        </div>
      </div>
    </div>
  )
}

// ─── Client form (unchanged flow) ─────────────────────────────────────────────

function ClientForm({ userId }: { userId: string }) {
  const router   = useRouter()
  const supabase = useMemo(() => createClient(), [])
  const [inviteCode, setInviteCode] = useState('')
  const [phone,      setPhone]      = useState('')
  const [loading,    setLoading]    = useState(false)

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    const trimmedCode = inviteCode.trim().toLowerCase()
    if (!trimmedCode || trimmedCode.length < 6 || trimmedCode.length > 64 || !/^[a-z0-9_-]+$/.test(trimmedCode)) {
      toast.error('Código de invitación inválido')
      return
    }
    setLoading(true)
    try {
      const { data: inv, error: invErr } = await supabase
        .from('invitations')
        .select('*, trainer:trainer_id(id, full_name)')
        .eq('code', trimmedCode)
        .is('used_at', null)
        .gte('expires_at', new Date().toISOString())
        .single()

      if (invErr || !inv) { toast.error('Código inválido o expirado'); return }

      const [{ data: trainerSub }, { count: trainerClientCount }] = await Promise.all([
        supabase.from('subscriptions').select('max_clients').eq('user_id', inv.trainer_id).single(),
        supabase.from('trainer_clients').select('*', { count: 'exact', head: true })
          .eq('trainer_id', inv.trainer_id).eq('status', 'active'),
      ])
      if ((trainerClientCount ?? 0) >= (trainerSub?.max_clients ?? 0)) {
        toast.error('Tu entrenador ha alcanzado el límite de clientes. Pídele que actualice su plan.')
        return
      }

      await Promise.all([
        supabase.from('invitations').update({ used_at: new Date().toISOString() }).eq('id', inv.id),
        supabase.from('trainer_clients').insert({ trainer_id: inv.trainer_id, client_id: userId }),
        phone ? supabase.from('profiles').update({ phone }).eq('id', userId) : Promise.resolve(),
      ])

      toast.success(`¡Te has unido con ${(inv.trainer as { full_name: string }).full_name}!`)
      router.push('/client')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-background flex flex-col">
      <div className="fixed inset-0 pointer-events-none">
        <div className="absolute top-0 left-1/3 w-[500px] h-[400px]"
             style={{ background: 'radial-gradient(ellipse, rgba(16,185,129,0.06) 0%, transparent 70%)' }} />
      </div>

      <div className="relative z-10 h-14 flex items-center px-6 border-b border-border/40">
        <div className="flex items-center gap-2.5">
          <div className="w-7 h-7 rounded-lg flex items-center justify-center"
               style={{ background: 'linear-gradient(135deg, #10B981, #0EA5E9)' }}>
            <Zap className="w-3.5 h-3.5 text-white" />
          </div>
          <span className="font-bold text-white text-sm tracking-tight">TrainerBoost</span>
        </div>
        <div className="ml-auto flex items-center gap-2 text-xs text-slate-500">
          <CheckCircle2 className="w-3.5 h-3.5 text-brand-primary" />
          <span>Cuenta creada</span>
          <div className="w-6 h-px bg-border/60" />
          <div className="w-5 h-5 rounded-full bg-brand-primary flex items-center justify-center">
            <span className="text-[9px] font-bold text-white">2</span>
          </div>
          <span className="text-white font-medium">Unirte</span>
        </div>
      </div>

      <div className="relative z-10 flex items-center justify-center flex-1 p-4 py-8">
        <div className="w-full max-w-lg grid md:grid-cols-2 gap-8 items-start">
          <div className="card p-8 animate-fade-in-up">
            <div className="mb-6">
              <h1 className="text-2xl font-bold text-white mb-1">Únete con tu entrenador</h1>
              <p className="text-slate-400 text-sm">Introduce el código que te ha dado tu entrenador</p>
            </div>
            <form onSubmit={handleSubmit} className="space-y-5">
              <div>
                <label className="label">Código de invitación</label>
                <input value={inviteCode} onChange={e => setInviteCode(e.target.value)}
                       className="input font-mono text-lg tracking-widest text-center uppercase"
                       placeholder="XXXXXXXX" maxLength={12} autoFocus />
                <p className="text-xs text-slate-500 mt-2">Tu entrenador te dará este código o lo recibirás por email</p>
              </div>
              <div>
                <label className="label">Teléfono <span className="text-slate-600">(opcional)</span></label>
                <input type="tel" value={phone} onChange={e => setPhone(e.target.value)}
                       className="input" placeholder="+34 600 000 000" />
              </div>
              <button type="submit" disabled={loading || !inviteCode.trim()} className="btn-gradient w-full py-3 disabled:opacity-40">
                {loading
                  ? <><Loader2 className="w-4 h-4 animate-spin" /> Verificando...</>
                  : <><ArrowRight className="w-4 h-4" /> Unirme a mi entrenador</>}
              </button>
            </form>
          </div>

          <div className="hidden md:block animate-fade-in-up" style={{ animationDelay: '0.1s' }}>
            <div className="card p-6 text-center">
              <div className="w-14 h-14 rounded-2xl flex items-center justify-center mx-auto mb-4"
                   style={{ background: 'linear-gradient(135deg, rgba(16,185,129,0.2), rgba(14,165,233,0.1))' }}>
                <Users className="w-7 h-7 text-brand-accent" />
              </div>
              <h3 className="font-semibold text-white mb-2">Tu portal personal</h3>
              <p className="text-sm text-slate-400 leading-relaxed mb-4">
                Accede a tu rutina, nutrición, citas y mensajes — todo en un solo lugar.
              </p>
              <div className="space-y-2 text-left">
                {['Rutina del día con timer', 'Plan nutricional y macros', 'Registro de progreso', 'Chat directo con tu PT', 'Rachas y logros'].map(f => (
                  <div key={f} className="flex items-center gap-2 text-xs text-slate-400">
                    <CheckCircle2 className="w-3.5 h-3.5 text-brand-accent shrink-0" />
                    {f}
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

// ─── Root component ────────────────────────────────────────────────────────────

export default function OnboardingPage() {
  const router   = useRouter()
  const supabase = useMemo(() => createClient(), [])

  const [role,         setRole]         = useState<'trainer' | 'client' | null>(null)
  const [userId,       setUserId]       = useState<string | null>(null)
  const [firstName,    setFirstName]    = useState('')
  const [fetchingRole, setFetchingRole] = useState(true)

  useEffect(() => {
    async function fetchRole() {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) { router.push('/login'); return }
      setUserId(user.id)

      const { data: p } = await supabase.from('profiles').select('role, full_name').eq('id', user.id).single()
      setRole(p?.role ?? 'trainer')
      setFirstName((p?.full_name ?? '').split(' ')[0] || 'hola')
      setFetchingRole(false)
    }
    fetchRole()
  }, [router, supabase])

  if (fetchingRole || !userId) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-brand-primary" />
      </div>
    )
  }

  if (role === 'trainer') return <TrainerWizard firstName={firstName} userId={userId} />
  return <ClientForm userId={userId} />
}
