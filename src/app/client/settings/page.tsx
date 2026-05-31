'use client'

import { useCallback, useEffect, useRef, useState } from 'react'
import { toast } from 'sonner'
import { Camera, Loader2, Save, KeyRound, LogOut } from 'lucide-react'
import { createClient } from '@/lib/supabase/client'
import { useRouter } from 'next/navigation'
import Avatar from '@/components/ui/Avatar'
import type { Profile } from '@/types/database'

export default function ClientSettingsPage() {
  const supabase   = useRef(createClient()).current
  const router     = useRouter()
  const avatarRef  = useRef<HTMLInputElement>(null)

  const [profile,       setProfile]       = useState<Profile | null>(null)
  const [fullName,      setFullName]      = useState('')
  const [avatarUrl,     setAvatarUrl]     = useState('')
  const [uploadingAvatar, setUploadingAvatar] = useState(false)
  const [savingProfile, setSavingProfile] = useState(false)

  const [currentPwd,  setCurrentPwd]  = useState('')
  const [newPwd,      setNewPwd]      = useState('')
  const [confirmPwd,  setConfirmPwd]  = useState('')
  const [savingPwd,   setSavingPwd]   = useState(false)
  const [pwdError,    setPwdError]    = useState<string | null>(null)

  const load = useCallback(async () => {
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) { router.push('/login'); return }
    const { data } = await supabase.from('profiles').select('*').eq('id', user.id).single()
    if (data) {
      setProfile(data as Profile)
      setFullName(data.full_name ?? '')
      setAvatarUrl(data.avatar_url ?? '')
    }
  }, [supabase, router])

  useEffect(() => { load() }, [load])

  async function uploadAvatar(file: File) {
    if (!profile) return
    if (!file.type.startsWith('image/')) { toast.error('Solo se permiten imágenes'); return }
    if (file.size > 3 * 1024 * 1024) { toast.error('Imagen demasiado grande (máx 3 MB)'); return }
    setUploadingAvatar(true)
    const ext  = file.name.split('.').pop() ?? 'jpg'
    const path = `${profile.id}/avatar.${ext}`
    const { error: upErr } = await supabase.storage.from('avatars').upload(path, file, { upsert: true })
    if (upErr) { toast.error('Error al subir imagen'); setUploadingAvatar(false); return }
    const { data: { publicUrl } } = supabase.storage.from('avatars').getPublicUrl(path)
    const url = `${publicUrl}?t=${Date.now()}`
    await supabase.from('profiles').update({ avatar_url: url }).eq('id', profile.id)
    setAvatarUrl(url)
    setUploadingAvatar(false)
    toast.success('Foto actualizada ✓')
  }

  async function saveProfile(e: React.FormEvent) {
    e.preventDefault()
    if (!profile || !fullName.trim()) { toast.error('El nombre no puede estar vacío'); return }
    setSavingProfile(true)
    const { error } = await supabase.from('profiles').update({ full_name: fullName.trim() }).eq('id', profile.id)
    setSavingProfile(false)
    if (error) { toast.error(error.message); return }
    toast.success('Perfil actualizado ✓')
  }

  async function changePassword(e: React.FormEvent) {
    e.preventDefault()
    if (newPwd !== confirmPwd) { setPwdError('Las contraseñas no coinciden'); return }
    if (newPwd.length < 8)    { setPwdError('Mínimo 8 caracteres'); return }
    setSavingPwd(true)
    setPwdError(null)
    const { error } = await supabase.auth.updateUser({ password: newPwd })
    setSavingPwd(false)
    if (error) { setPwdError(error.message); return }
    toast.success('Contraseña actualizada ✓')
    setCurrentPwd(''); setNewPwd(''); setConfirmPwd('')
  }

  async function logout() {
    await supabase.auth.signOut()
    router.push('/login')
  }

  if (!profile) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="w-8 h-8 animate-spin text-brand-primary" />
      </div>
    )
  }

  return (
    <div className="max-w-lg mx-auto space-y-6 animate-fade-in">
      <h1 className="text-2xl font-bold text-white">Mi perfil</h1>

      {/* ── Avatar + name ─────────────────────────────────────────── */}
      <section className="card p-6 space-y-5">
        <h2 className="font-semibold text-white">Información personal</h2>
        <div className="border-t border-border/60" />

        {/* Avatar */}
        <div className="flex items-center gap-4">
          <div className="relative group">
            <Avatar name={fullName} url={avatarUrl} size="lg" />
            <button
              onClick={() => avatarRef.current?.click()}
              disabled={uploadingAvatar}
              className="absolute inset-0 flex items-center justify-center rounded-full bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity"
            >
              {uploadingAvatar
                ? <Loader2 className="w-5 h-5 text-white animate-spin" />
                : <Camera className="w-5 h-5 text-white" />}
            </button>
          </div>
          <div>
            <p className="text-sm font-medium text-white">{fullName}</p>
            <button
              onClick={() => avatarRef.current?.click()}
              disabled={uploadingAvatar}
              className="text-xs text-brand-primary hover:underline mt-1 transition-colors"
            >
              {uploadingAvatar ? 'Subiendo...' : 'Cambiar foto'}
            </button>
          </div>
        </div>
        <input ref={avatarRef} type="file" accept="image/*" className="hidden"
          onChange={e => { const f = e.target.files?.[0]; if (f) uploadAvatar(f); e.target.value = '' }} />

        {/* Name */}
        <form onSubmit={saveProfile} className="space-y-4">
          <div>
            <label className="label">Nombre completo</label>
            <input
              type="text"
              value={fullName}
              onChange={e => setFullName(e.target.value)}
              className="input"
              required
            />
          </div>
          <button type="submit" disabled={savingProfile} className="btn-primary">
            {savingProfile
              ? <><Loader2 className="w-4 h-4 animate-spin" /> Guardando…</>
              : <><Save className="w-4 h-4" /> Guardar cambios</>}
          </button>
        </form>
      </section>

      {/* ── Password ──────────────────────────────────────────────── */}
      <section className="card p-6 space-y-5">
        <h2 className="font-semibold text-white">Cambiar contraseña</h2>
        <div className="border-t border-border/60" />
        <form onSubmit={changePassword} className="space-y-4">
          <div>
            <label className="label">Contraseña actual</label>
            <input type="password" value={currentPwd} onChange={e => { setCurrentPwd(e.target.value); setPwdError(null) }}
              className="input" placeholder="••••••••" autoComplete="current-password" />
          </div>
          <div>
            <label className="label">Nueva contraseña</label>
            <input type="password" value={newPwd} onChange={e => { setNewPwd(e.target.value); setPwdError(null) }}
              className="input" placeholder="Mínimo 8 caracteres" autoComplete="new-password" minLength={8} />
          </div>
          <div>
            <label className="label">Confirmar contraseña</label>
            <input type="password" value={confirmPwd} onChange={e => { setConfirmPwd(e.target.value); setPwdError(null) }}
              className="input" placeholder="Repite la nueva contraseña" autoComplete="new-password" />
          </div>
          {newPwd && confirmPwd && (
            <p className={`text-xs font-medium ${newPwd === confirmPwd ? 'text-emerald-400' : 'text-red-400'}`}>
              {newPwd === confirmPwd ? '✓ Las contraseñas coinciden' : '✗ Las contraseñas no coinciden'}
            </p>
          )}
          {pwdError && (
            <p className="text-sm text-red-400 bg-red-500/10 border border-red-500/20 rounded-lg px-3 py-2">{pwdError}</p>
          )}
          <button type="submit" disabled={savingPwd || !newPwd || !confirmPwd} className="btn-primary">
            {savingPwd
              ? <><Loader2 className="w-4 h-4 animate-spin" /> Cambiando…</>
              : <><KeyRound className="w-4 h-4" /> Cambiar contraseña</>}
          </button>
        </form>
      </section>

      {/* ── Logout ────────────────────────────────────────────────── */}
      <section className="card p-6">
        <div className="flex items-center justify-between gap-4 flex-wrap">
          <div>
            <p className="text-sm font-medium text-white">Cerrar sesión</p>
            <p className="text-xs text-slate-500 mt-0.5">Salir de tu cuenta en este dispositivo.</p>
          </div>
          <button onClick={logout} className="btn-secondary flex items-center gap-2 text-sm">
            <LogOut className="w-4 h-4" />
            Cerrar sesión
          </button>
        </div>
      </section>
    </div>
  )
}
