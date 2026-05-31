'use client'

import { useCallback, useEffect, useRef, useState } from 'react'
import Link from 'next/link'
import { toast } from 'sonner'
import {
  User, Phone, FileText, Tag, CreditCard, Trash2, KeyRound,
  Camera, Loader2, Plus, X, ShieldAlert, ExternalLink, Save,
} from 'lucide-react'
import { createClient } from '@/lib/supabase/client'
import { cn } from '@/lib/utils'
import Avatar from '@/components/ui/Avatar'
import Modal from '@/components/ui/Modal'
import type { Profile, Subscription, SubscriptionPlan } from '@/types/database'
import { PLAN_PRICES } from '@/types/database'

// ─── Plan display helpers ─────────────────────────────────────────────────────

const PLAN_LABELS: Record<SubscriptionPlan, string> = {
  starter:   'Starter',
  pro:       'Pro',
  unlimited: 'Unlimited',
}

const PLAN_COLORS: Record<SubscriptionPlan, { pill: string; badge: string }> = {
  starter:   { pill: 'bg-sky-500/15 text-sky-400 ring-sky-500/30',         badge: 'text-sky-400'     },
  pro:       { pill: 'bg-violet-500/15 text-violet-400 ring-violet-500/30', badge: 'text-violet-400' },
  unlimited: { pill: 'bg-amber-500/15 text-amber-400 ring-amber-500/30',    badge: 'text-amber-400'  },
}

const ALL_SPECIALTIES = [
  'Fuerza', 'Cardio', 'Pérdida de peso', 'Ganancia muscular',
  'Crossfit', 'Yoga', 'Pilates', 'Rehabilitación', 'Nutrición deportiva',
  'Running', 'Natación', 'Flexibilidad', 'Funcional', 'HIIT',
]

// ─── Section wrapper ──────────────────────────────────────────────────────────

function Section({ title, description, children }: {
  title: string
  description?: string
  children: React.ReactNode
}) {
  return (
    <section className="card p-6 space-y-5">
      <div>
        <h2 className="font-semibold text-white text-base">{title}</h2>
        {description && <p className="text-slate-400 text-sm mt-0.5">{description}</p>}
      </div>
      <div className="border-t border-[#334155]" />
      {children}
    </section>
  )
}

// ─── Component ────────────────────────────────────────────────────────────────

export default function SettingsPage() {
  const supabase = createClient()

  // Auth + data
  const [userId,       setUserId]       = useState<string | null>(null)
  const [userEmail,    setUserEmail]    = useState<string | null>(null)
  const [profile,      setProfile]      = useState<Profile | null>(null)
  const [subscription, setSubscription] = useState<Subscription | null>(null)
  const [loading,      setLoading]      = useState(true)

  // ── Profile form ─────────────────────────────────────────────────────────
  const [fullName,    setFullName]    = useState('')
  const [phone,       setPhone]       = useState('')
  const [bio,         setBio]         = useState('')
  const [specialties, setSpecialties] = useState<string[]>([])
  const [customSpec,  setCustomSpec]  = useState('')
  const [avatarUrl,   setAvatarUrl]   = useState('')
  const [savingProfile, setSavingProfile] = useState(false)
  const [avatarUploading, setAvatarUploading] = useState(false)
  const avatarInputRef = useRef<HTMLInputElement>(null)

  // ── Password form ────────────────────────────────────────────────────────
  const [currentPwd,    setCurrentPwd]    = useState('')
  const [newPwd,        setNewPwd]        = useState('')
  const [confirmPwd,    setConfirmPwd]    = useState('')
  const [savingPwd,     setSavingPwd]     = useState(false)
  const [pwdError,      setPwdError]      = useState<string | null>(null)

  // ── Active sessions ──────────────────────────────────────────────────────
  const [signingOut,    setSigningOut]    = useState(false)

  // ── Delete account ───────────────────────────────────────────────────────
  const [deleteOpen,    setDeleteOpen]    = useState(false)
  const [deleteConfirm, setDeleteConfirm] = useState('')
  const [deleting,      setDeleting]      = useState(false)

  // ── Fetch ────────────────────────────────────────────────────────────────

  const fetchData = useCallback(async () => {
    setLoading(true)
    try {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) return
      setUserId(user.id)
      setUserEmail(user.email ?? null)

      const [{ data: p }, { data: s }] = await Promise.all([
        supabase.from('profiles').select('*').eq('id', user.id).single(),
        supabase.from('subscriptions').select('*').eq('user_id', user.id).single(),
      ])

      if (p) {
        const prof = p as Profile
        setProfile(prof)
        setFullName(prof.full_name ?? '')
        setPhone(prof.phone ?? '')
        setBio(prof.bio ?? '')
        setSpecialties(prof.specialties ?? [])
        setAvatarUrl(prof.avatar_url ?? '')
      }
      if (s) setSubscription(s as Subscription)
    } catch (err: unknown) {
      toast.error('Error al cargar los ajustes')
      console.error(err)
    } finally {
      setLoading(false)
    }
  }, [supabase])

  useEffect(() => { fetchData() }, [fetchData])

  // ── Save profile ─────────────────────────────────────────────────────────

  async function saveProfile(e: React.FormEvent) {
    e.preventDefault()
    if (!userId) return

    if (!fullName.trim()) {
      toast.error('El nombre no puede estar vacío')
      return
    }

    setSavingProfile(true)
    try {
      const { error } = await supabase
        .from('profiles')
        .update({
          full_name:  fullName.trim(),
          phone:      phone.trim()  || null,
          bio:        bio.trim()    || null,
          specialties,
          avatar_url: avatarUrl.trim() || null,
          updated_at: new Date().toISOString(),
        })
        .eq('id', userId)

      if (error) throw error
      toast.success('Perfil actualizado correctamente')
    } catch (err: unknown) {
      const msg = (err as { message?: string }).message ?? 'Error al guardar el perfil'
      toast.error(msg)
    } finally {
      setSavingProfile(false)
    }
  }

  // ── Specialties ──────────────────────────────────────────────────────────

  function toggleSpecialty(s: string) {
    setSpecialties(prev =>
      prev.includes(s) ? prev.filter(x => x !== s) : [...prev, s]
    )
  }

  function addCustomSpecialty() {
    const s = customSpec.trim()
    if (!s || specialties.includes(s)) { setCustomSpec(''); return }
    setSpecialties(prev => [...prev, s])
    setCustomSpec('')
  }

  // ── Change password ──────────────────────────────────────────────────────

  async function changePassword(e: React.FormEvent) {
    e.preventDefault()
    setPwdError(null)

    if (!currentPwd) { setPwdError('Introduce tu contraseña actual'); return }
    if (!newPwd) { setPwdError('Escribe una nueva contraseña'); return }
    if (newPwd.length < 8) { setPwdError('Mínimo 8 caracteres'); return }
    if (newPwd !== confirmPwd) { setPwdError('Las contraseñas no coinciden'); return }

    setSavingPwd(true)
    try {
      // Re-authenticate with the current password before changing it.
      if (userEmail) {
        const { error: authErr } = await supabase.auth.signInWithPassword({
          email: userEmail,
          password: currentPwd,
        })
        if (authErr) { setPwdError('La contraseña actual no es correcta'); setSavingPwd(false); return }
      }

      const { error } = await supabase.auth.updateUser({ password: newPwd })
      if (error) throw error

      toast.success('Contraseña actualizada correctamente')
      setCurrentPwd('')
      setNewPwd('')
      setConfirmPwd('')
    } catch (err: unknown) {
      const msg = (err as { message?: string }).message ?? 'Error al cambiar la contraseña'
      setPwdError(msg)
      toast.error(msg)
    } finally {
      setSavingPwd(false)
    }
  }

  // ── Sign out all devices ─────────────────────────────────────────────────

  async function signOutAllDevices() {
    setSigningOut(true)
    try {
      const { error } = await supabase.auth.signOut({ scope: 'global' })
      if (error) throw error
      toast.success('Sesión cerrada en todos los dispositivos')
      window.location.href = '/login'
    } catch (err: unknown) {
      const msg = (err as { message?: string }).message ?? 'Error al cerrar las sesiones'
      toast.error(msg)
    } finally {
      setSigningOut(false)
    }
  }

  // ── Delete account ───────────────────────────────────────────────────────

  async function deleteAccount() {
    if (deleteConfirm !== 'ELIMINAR') return
    setDeleting(true)
    try {
      // Server route cancels the Stripe subscription and deletes the auth user.
      const res = await fetch('/api/account/delete', { method: 'POST' })
      if (!res.ok) {
        const { error } = await res.json().catch(() => ({ error: null }))
        throw new Error(error || 'No se pudo eliminar la cuenta')
      }

      await supabase.auth.signOut()
      toast.success('Tu cuenta y tu suscripción han sido eliminadas.')
      window.location.href = '/'
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Error al eliminar la cuenta'
      toast.error(msg)
      console.error(err)
    } finally {
      setDeleting(false)
    }
  }

  // ── Render ───────────────────────────────────────────────────────────────

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="w-6 h-6 text-slate-500 animate-spin" />
      </div>
    )
  }

  const plan = subscription?.plan ?? null
  const maxClients = subscription?.max_clients ?? 0

  return (
    <div className="animate-fade-in space-y-6 max-w-2xl">

      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-white">Ajustes</h1>
        <p className="text-slate-400 text-sm mt-0.5">Gestiona tu perfil y preferencias de cuenta.</p>
      </div>

      {/* ══════════════════════════════════════════════════════
          SECTION 1 — Profile
      ══════════════════════════════════════════════════════ */}
      <Section title="Perfil" description="Tu información visible para los clientes.">
        <form onSubmit={saveProfile} className="space-y-5">

          {/* Avatar row */}
          <div className="flex items-center gap-4">
            <Avatar
              name={fullName || profile?.full_name || '?'}
              url={avatarUrl || null}
              size="xl"
            />
            <div className="flex-1 min-w-0">
              <label className="label">URL del avatar</label>
              <div className="flex gap-2">
                <input
                  type="url"
                  value={avatarUrl}
                  onChange={e => setAvatarUrl(e.target.value)}
                  placeholder="https://..."
                  className="input"
                />
                <input
                  ref={avatarInputRef}
                  type="file"
                  accept="image/*"
                  className="hidden"
                  onChange={async e => {
                    const file = e.target.files?.[0]
                    if (!file || !userId) return
                    if (!file.type.startsWith('image/')) { toast.error('Solo se permiten imágenes'); return }
                    if (file.size > 5 * 1024 * 1024) { toast.error('Imagen demasiado grande (máx 5MB)'); return }
                    const ext = file.name.split('.').pop() ?? 'jpg'
                    const path = `${userId}.${ext}`
                    setAvatarUploading(true)
                    const { error } = await supabase.storage.from('avatars').upload(path, file, { upsert: true })
                    setAvatarUploading(false)
                    if (error) { toast.error('Error al subir la imagen'); return }
                    const { data: { publicUrl } } = supabase.storage.from('avatars').getPublicUrl(path)
                    setAvatarUrl(publicUrl + '?t=' + Date.now())
                    toast.success('Foto de perfil actualizada ✓')
                  }}
                />
                <button
                  type="button"
                  onClick={() => avatarInputRef.current?.click()}
                  disabled={avatarUploading}
                  className="btn-secondary shrink-0 px-3 disabled:opacity-60"
                  title="Subir imagen"
                >
                  {avatarUploading
                    ? <Loader2 className="w-4 h-4 animate-spin" />
                    : <Camera className="w-4 h-4" />}
                </button>
              </div>
            </div>
          </div>

          {/* Full name */}
          <div>
            <label className="label">
              <span className="flex items-center gap-1.5">
                <User className="w-3 h-3" /> Nombre completo *
              </span>
            </label>
            <input
              type="text"
              value={fullName}
              onChange={e => setFullName(e.target.value)}
              className="input"
              placeholder="Tu nombre"
              required
            />
          </div>

          {/* Phone */}
          <div>
            <label className="label">
              <span className="flex items-center gap-1.5">
                <Phone className="w-3 h-3" /> Teléfono
              </span>
            </label>
            <input
              type="tel"
              value={phone}
              onChange={e => setPhone(e.target.value)}
              className="input"
              placeholder="+34 600 000 000"
            />
          </div>

          {/* Bio */}
          <div>
            <label className="label">
              <span className="flex items-center gap-1.5">
                <FileText className="w-3 h-3" /> Biografía
              </span>
            </label>
            <textarea
              rows={3}
              value={bio}
              onChange={e => setBio(e.target.value)}
              className="input resize-none"
              placeholder="Cuéntanos sobre ti y tu experiencia..."
              maxLength={500}
            />
            <p className={cn('text-xs text-right mt-1', bio.length > 450 ? 'text-amber-400' : 'text-slate-600')}>{bio.length}/500</p>
          </div>

          {/* Specialties */}
          <div>
            <label className="label">
              <span className="flex items-center gap-1.5">
                <Tag className="w-3 h-3" /> Especialidades
              </span>
            </label>
            {/* Preset chips */}
            <div className="flex flex-wrap gap-1.5 mb-2">
              {ALL_SPECIALTIES.map(s => {
                const selected = specialties.includes(s)
                return (
                  <button
                    key={s}
                    type="button"
                    onClick={() => toggleSpecialty(s)}
                    className={cn(
                      'px-2.5 py-1 rounded-full text-xs font-medium border transition-all',
                      selected
                        ? 'bg-[#0EA5E9] border-[#0EA5E9] text-white'
                        : 'bg-[#0F172A] border-[#334155] text-slate-400 hover:border-slate-400'
                    )}
                  >
                    {s}
                  </button>
                )
              })}
            </div>

            {/* Custom specialty input */}
            <div className="flex gap-2">
              <input
                type="text"
                value={customSpec}
                onChange={e => setCustomSpec(e.target.value)}
                onKeyDown={e => { if (e.key === 'Enter') { e.preventDefault(); addCustomSpecialty() }}}
                placeholder="Añadir especialidad personalizada..."
                className="input"
              />
              <button
                type="button"
                onClick={addCustomSpecialty}
                disabled={!customSpec.trim()}
                className="btn-secondary px-3 shrink-0 disabled:opacity-40"
              >
                <Plus className="w-4 h-4" />
              </button>
            </div>

            {/* Selected chips (custom ones) */}
            {specialties.filter(s => !ALL_SPECIALTIES.includes(s)).length > 0 && (
              <div className="flex flex-wrap gap-1.5 mt-2">
                {specialties.filter(s => !ALL_SPECIALTIES.includes(s)).map(s => (
                  <span
                    key={s}
                    className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-medium bg-[#10B981]/10 text-[#10B981] border border-[#10B981]/20"
                  >
                    {s}
                    <button
                      type="button"
                      onClick={() => toggleSpecialty(s)}
                      className="hover:text-white transition-colors"
                    >
                      <X className="w-3 h-3" />
                    </button>
                  </span>
                ))}
              </div>
            )}
          </div>

          {/* Save */}
          <div className="pt-1">
            <button type="submit" disabled={savingProfile} className="btn-primary">
              {savingProfile
                ? <><Loader2 className="w-4 h-4 animate-spin" /> Guardando…</>
                : <><Save className="w-4 h-4" /> Guardar cambios</>
              }
            </button>
          </div>
        </form>
      </Section>

      {/* ══════════════════════════════════════════════════════
          SECTION 2 — Subscription
      ══════════════════════════════════════════════════════ */}
      <Section title="Suscripción" description="Tu plan actual y límites de uso.">
        <div className="space-y-4">
          {/* Plan badge */}
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-slate-400">Plan activo</p>
              {plan ? (
                <span className={cn(
                  'inline-flex items-center gap-1.5 mt-1 px-3 py-1 rounded-full text-sm font-semibold ring-1 ring-inset',
                  PLAN_COLORS[plan].pill
                )}>
                  <CreditCard className="w-3.5 h-3.5" />
                  {PLAN_LABELS[plan]}
                </span>
              ) : (
                <span className="inline-flex items-center gap-1.5 mt-1 px-3 py-1 rounded-full text-sm font-semibold ring-1 ring-inset bg-slate-700/50 text-slate-300 ring-slate-600">
                  Gratuito
                </span>
              )}
            </div>
            {plan && (
              <div className="text-right">
                <p className="text-xs text-slate-500">Precio mensual</p>
                <p className="text-xl font-bold text-white">{PLAN_PRICES[plan]}€<span className="text-sm text-slate-400 font-normal">/mes</span></p>
              </div>
            )}
          </div>

          {/* Limits */}
          <div className="grid grid-cols-2 gap-3">
            <div className="bg-[#0F172A] border border-[#334155] rounded-xl p-4">
              <p className="text-xs text-slate-500 mb-1">Clientes permitidos</p>
              <p className="text-2xl font-bold text-white font-mono">
                {maxClients === 999999 ? '∞' : maxClients}
              </p>
            </div>
            <div className="bg-[#0F172A] border border-[#334155] rounded-xl p-4">
              <p className="text-xs text-slate-500 mb-1">Estado</p>
              <p className={cn(
                'text-sm font-semibold mt-1',
                subscription?.status === 'active' ? 'text-[#10B981]' : 'text-amber-400'
              )}>
                {subscription?.status === 'active' ? 'Activo' :
                 subscription?.status === 'past_due' ? 'Pago pendiente' :
                 subscription?.status === 'cancelled' ? 'Cancelado' : 'Inactivo'}
              </p>
            </div>
          </div>

          {/* Renews */}
          {subscription?.current_period_end && (
            <p className="text-xs text-slate-500">
              Se renueva el{' '}
              <span className="text-slate-300">
                {new Date(subscription.current_period_end).toLocaleDateString('es-ES', {
                  day: 'numeric', month: 'long', year: 'numeric',
                })}
              </span>
            </p>
          )}

          {/* Upgrade CTA */}
          <div className="pt-1">
            <Link
              href="/pricing"
              className={cn(
                'inline-flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-semibold',
                'bg-[#1E293B] border border-[#334155] text-slate-200',
                'hover:border-[#0EA5E9] hover:text-[#0EA5E9] transition-all'
              )}
            >
              <ExternalLink className="w-4 h-4" />
              {plan === 'unlimited' ? 'Ver detalles del plan' : 'Actualizar plan'}
            </Link>
          </div>
        </div>
      </Section>

      {/* ══════════════════════════════════════════════════════
          SECTION 3 — Password
      ══════════════════════════════════════════════════════ */}
      <Section title="Cambiar contraseña" description="Actualiza tu contraseña de acceso.">
        <form onSubmit={changePassword} className="space-y-4">
          <div>
            <label className="label">Contraseña actual</label>
            <input
              type="password"
              value={currentPwd}
              onChange={e => { setCurrentPwd(e.target.value); setPwdError(null) }}
              className="input"
              placeholder="••••••••"
              autoComplete="current-password"
            />
          </div>
          <div>
            <label className="label">Nueva contraseña</label>
            <input
              type="password"
              value={newPwd}
              onChange={e => { setNewPwd(e.target.value); setPwdError(null) }}
              className="input"
              placeholder="Mínimo 8 caracteres"
              autoComplete="new-password"
              minLength={8}
            />
          </div>
          <div>
            <label className="label">Confirmar contraseña</label>
            <input
              type="password"
              value={confirmPwd}
              onChange={e => { setConfirmPwd(e.target.value); setPwdError(null) }}
              className="input"
              placeholder="Repite la nueva contraseña"
              autoComplete="new-password"
            />
          </div>

          {/* Inline match indicator */}
          {newPwd && confirmPwd && (
            <p className={cn(
              'text-xs font-medium',
              newPwd === confirmPwd ? 'text-[#10B981]' : 'text-red-400'
            )}>
              {newPwd === confirmPwd ? '✓ Las contraseñas coinciden' : '✗ Las contraseñas no coinciden'}
            </p>
          )}

          {pwdError && (
            <p className="text-sm text-red-400 bg-red-500/10 border border-red-500/20 rounded-lg px-3 py-2">
              {pwdError}
            </p>
          )}

          <button
            type="submit"
            disabled={savingPwd || !newPwd || !confirmPwd}
            className="btn-primary"
          >
            {savingPwd
              ? <><Loader2 className="w-4 h-4 animate-spin" /> Cambiando…</>
              : <><KeyRound className="w-4 h-4" /> Cambiar contraseña</>
            }
          </button>
        </form>
      </Section>

      {/* ══════════════════════════════════════════════════════
          SECTION 4 — Active sessions
      ══════════════════════════════════════════════════════ */}
      <div className="card p-5">
        <h3 className="text-sm font-semibold text-white mb-1">Sesiones activas</h3>
        <p className="text-xs text-slate-400 mb-4">Cierra sesión en todos los dispositivos si crees que tu cuenta está comprometida.</p>
        <button
          onClick={signOutAllDevices}
          disabled={signingOut}
          className="btn-danger text-sm py-2 px-4"
        >
          {signingOut ? 'Cerrando...' : 'Cerrar todas las sesiones'}
        </button>
      </div>

      {/* ══════════════════════════════════════════════════════
          SECTION 5 — Danger zone
      ══════════════════════════════════════════════════════ */}
      <section className="card p-6 border-red-500/30">
        <div className="flex items-start gap-3">
          <ShieldAlert className="w-5 h-5 text-red-400 shrink-0 mt-0.5" />
          <div className="flex-1 space-y-4">
            <div>
              <h2 className="font-semibold text-white text-base">Zona de peligro</h2>
              <p className="text-slate-400 text-sm mt-0.5">
                Las acciones de esta sección son irreversibles. Procede con cuidado.
              </p>
            </div>
            <div className="border-t border-red-500/20" />
            <div className="flex items-center justify-between gap-4 flex-wrap">
              <div>
                <p className="text-sm font-medium text-white">Eliminar cuenta</p>
                <p className="text-xs text-slate-500 mt-0.5">
                  Borra todos tus datos permanentemente.
                </p>
              </div>
              <button
                onClick={() => { setDeleteConfirm(''); setDeleteOpen(true) }}
                className="btn-danger shrink-0"
              >
                <Trash2 className="w-4 h-4" />
                Eliminar cuenta
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* ── Delete confirmation modal ── */}
      <Modal
        isOpen={deleteOpen}
        onClose={() => setDeleteOpen(false)}
        title="Eliminar cuenta"
        size="sm"
      >
        <div className="space-y-5">
          <div className="flex items-start gap-3 p-3 bg-red-500/10 border border-red-500/20 rounded-xl">
            <ShieldAlert className="w-5 h-5 text-red-400 shrink-0 mt-0.5" />
            <p className="text-sm text-red-300 leading-relaxed">
              Esta acción <strong>no se puede deshacer</strong>. Se eliminarán
              todos tus clientes, rutinas, citas y mensajes permanentemente.
            </p>
          </div>

          <div>
            <label className="label">
              Escribe <span className="text-red-400 font-bold">ELIMINAR</span> para confirmar
            </label>
            <input
              type="text"
              value={deleteConfirm}
              onChange={e => setDeleteConfirm(e.target.value)}
              className="input border-red-500/30 focus:border-red-500"
              placeholder="ELIMINAR"
            />
          </div>

          <div className="flex gap-3">
            <button
              onClick={() => setDeleteOpen(false)}
              className="btn-secondary flex-1"
            >
              Cancelar
            </button>
            <button
              onClick={deleteAccount}
              disabled={deleteConfirm !== 'ELIMINAR' || deleting}
              className="btn-danger flex-1 disabled:opacity-40 disabled:cursor-not-allowed"
            >
              {deleting
                ? <><Loader2 className="w-4 h-4 animate-spin" /> Eliminando…</>
                : <><Trash2 className="w-4 h-4" /> Confirmar eliminación</>
              }
            </button>
          </div>
        </div>
      </Modal>
    </div>
  )
}
