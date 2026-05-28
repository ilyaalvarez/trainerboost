'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { toast } from 'sonner'
import { Dumbbell, ArrowRight, Loader2, X } from 'lucide-react'
import { createClient } from '@/lib/supabase/client'

const SPECIALTIES = [
  'Fuerza y musculación', 'Pérdida de peso', 'Atletismo', 'CrossFit',
  'Yoga', 'Pilates', 'Nutrición deportiva', 'Rehabilitación',
  'Running', 'Natación', 'Funcional', 'Mindfulness',
]

export default function OnboardingPage() {
  const router = useRouter()
  const supabase = createClient()

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
  }, [])

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
        // Create free subscription
        await supabase.from('subscriptions').upsert({
          user_id: user.id,
          status: 'inactive',
          max_clients: 0,
        })
        toast.success('¡Perfil configurado!')
        router.push('/dashboard')
      } else {
        // Client: validate invite code
        if (!inviteCode.trim()) { toast.error('Introduce el código de invitación'); return }
        const { data: inv, error: invErr } = await supabase
          .from('invitations')
          .select('*, trainer:trainer_id(id, full_name)')
          .eq('code', inviteCode.trim().toLowerCase())
          .is('used_at', null)
          .gte('expires_at', new Date().toISOString())
          .single()

        if (invErr || !inv) { toast.error('Código inválido o expirado'); return }

        // Mark invitation used + create trainer_client relation
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
    <div className="min-h-screen bg-background flex items-center justify-center p-4">
      <div className="w-full max-w-lg">
        <div className="flex items-center justify-center gap-3 mb-8">
          <div className="w-10 h-10 rounded-xl bg-brand-primary/20 border border-brand-primary/30 flex items-center justify-center">
            <Dumbbell className="w-5 h-5 text-brand-primary" />
          </div>
          <span className="text-xl font-bold text-white">TrainerBoost</span>
        </div>

        <div className="card p-8">
          <h1 className="text-2xl font-bold text-white mb-1">
            {role === 'trainer' ? 'Configura tu perfil' : 'Únete con tu entrenador'}
          </h1>
          <p className="text-slate-400 text-sm mb-6">
            {role === 'trainer'
              ? 'Cuéntanos sobre ti para que tus clientes te conozcan'
              : 'Introduce el código que te ha dado tu entrenador'}
          </p>

          <form onSubmit={handleSubmit} className="space-y-5">
            {role === 'trainer' ? (
              <>
                <div>
                  <label className="label">Teléfono (opcional)</label>
                  <input
                    type="tel"
                    value={phone}
                    onChange={e => setPhone(e.target.value)}
                    className="input"
                    placeholder="+34 600 000 000"
                  />
                </div>
                <div>
                  <label className="label">Bio profesional</label>
                  <textarea
                    value={bio}
                    onChange={e => setBio(e.target.value)}
                    className="input min-h-[80px] resize-none"
                    placeholder="Cuéntales a tus clientes tu experiencia, metodología..."
                    rows={3}
                  />
                </div>
                <div>
                  <label className="label">Especialidades</label>
                  <div className="flex flex-wrap gap-2">
                    {SPECIALTIES.map(spec => (
                      <button
                        key={spec}
                        type="button"
                        onClick={() => toggleSpec(spec)}
                        className={`px-3 py-1.5 rounded-full text-xs font-medium transition-all ${
                          selectedSpec.includes(spec)
                            ? 'bg-brand-primary text-white'
                            : 'bg-surface border border-border text-slate-400 hover:border-border-bright'
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
                    className="input font-mono text-lg tracking-widest text-center"
                    placeholder="xxxxxxxxxxxxxxxx"
                    maxLength={16}
                  />
                  <p className="text-xs text-slate-500 mt-2">
                    Tu entrenador te dará este código de 16 caracteres
                  </p>
                </div>
                <div>
                  <label className="label">Teléfono (opcional)</label>
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

            <button type="submit" disabled={loading} className="btn-primary w-full">
              {loading
                ? <><Loader2 className="w-4 h-4 animate-spin" /> Guardando...</>
                : <><ArrowRight className="w-4 h-4" /> {role === 'trainer' ? 'Ir al dashboard' : 'Unirme'}</>}
            </button>
          </form>
        </div>
      </div>
    </div>
  )
}
