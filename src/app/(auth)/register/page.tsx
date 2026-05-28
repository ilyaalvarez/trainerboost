'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { toast } from 'sonner'
import { Mail, Lock, User, ArrowRight, Loader2, Users, Zap, ArrowLeft } from 'lucide-react'
import { createClient } from '@/lib/supabase/client'

type Step = 1 | 2
type Role = 'trainer' | 'client'

export default function RegisterPage() {
  const router = useRouter()
  const supabase = createClient()

  const [step, setStep]         = useState<Step>(1)
  const [role, setRole]         = useState<Role>('trainer')
  const [name, setName]         = useState('')
  const [email, setEmail]       = useState('')
  const [password, setPassword] = useState('')
  const [loading, setLoading]   = useState(false)

  async function handleRegister(e: React.FormEvent) {
    e.preventDefault()
    if (password.length < 6) { toast.error('La contraseña debe tener al menos 6 caracteres'); return }
    setLoading(true)
    try {
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: { full_name: name, role },
        },
      })
      if (error) { toast.error(error.message); return }
      if (data.user) {
        // Upsert profile explicitly
        await supabase.from('profiles').upsert({
          id: data.user.id,
          full_name: name,
          role,
        })
        toast.success('¡Cuenta creada! Completa tu perfil')
        router.push('/onboarding')
      }
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        {/* Back */}
        <Link href="/" className="inline-flex items-center gap-1.5 text-sm text-slate-500 hover:text-white transition-colors mb-8 group">
          <ArrowLeft className="w-3.5 h-3.5 group-hover:-translate-x-0.5 transition-transform" />
          Volver al inicio
        </Link>

        <div className="flex items-center justify-center gap-3 mb-8">
          <div className="w-10 h-10 rounded-xl flex items-center justify-center shadow-glow-sm"
               style={{ background: 'linear-gradient(135deg, #0EA5E9, #7C3AED)' }}>
            <Zap className="w-5 h-5 text-white" />
          </div>
          <span className="text-xl font-bold text-white">TrainerBoost</span>
        </div>

        {step === 1 ? (
          <div className="card p-8">
            <h1 className="text-2xl font-bold text-white mb-1">Crea tu cuenta</h1>
            <p className="text-slate-400 text-sm mb-6">¿Cómo vas a usar TrainerBoost?</p>

            <div className="grid grid-cols-2 gap-3 mb-6">
              <button
                onClick={() => setRole('trainer')}
                className={`p-4 rounded-xl border-2 transition-all text-left ${
                  role === 'trainer'
                    ? 'border-brand-primary bg-brand-primary/10'
                    : 'border-border bg-surface hover:border-border-bright'
                }`}
              >
                <Zap className={`w-6 h-6 mb-2 ${role === 'trainer' ? 'text-brand-primary' : 'text-slate-400'}`} />
                <div className="font-semibold text-sm text-white">Soy entrenador</div>
                <div className="text-xs text-slate-400 mt-0.5">Gestiono clientes y rutinas</div>
              </button>
              <button
                onClick={() => setRole('client')}
                className={`p-4 rounded-xl border-2 transition-all text-left ${
                  role === 'client'
                    ? 'border-brand-primary bg-brand-primary/10'
                    : 'border-border bg-surface hover:border-border-bright'
                }`}
              >
                <Users className={`w-6 h-6 mb-2 ${role === 'client' ? 'text-brand-primary' : 'text-slate-400'}`} />
                <div className="font-semibold text-sm text-white">Soy cliente</div>
                <div className="text-xs text-slate-400 mt-0.5">Sigo el plan de mi entrenador</div>
              </button>
            </div>

            <button onClick={() => setStep(2)} className="btn-primary w-full">
              <ArrowRight className="w-4 h-4" />
              Continuar como {role === 'trainer' ? 'entrenador' : 'cliente'}
            </button>
          </div>
        ) : (
          <div className="card p-8">
            <button onClick={() => setStep(1)} className="text-sm text-slate-400 hover:text-white mb-4 flex items-center gap-1 transition-colors">
              ← Cambiar rol
            </button>
            <h1 className="text-2xl font-bold text-white mb-1">Tus datos</h1>
            <p className="text-slate-400 text-sm mb-6">
              {role === 'trainer' ? 'Configura tu perfil de entrenador' : 'Únete con el código de tu entrenador después'}
            </p>

            <form onSubmit={handleRegister} className="space-y-4">
              <div>
                <label className="label">Nombre completo</label>
                <div className="relative">
                  <User className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
                  <input
                    value={name}
                    onChange={e => setName(e.target.value)}
                    className="input pl-9"
                    placeholder="Tu nombre"
                    required
                    autoComplete="name"
                  />
                </div>
              </div>
              <div>
                <label className="label">Email</label>
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
                  <input
                    type="email"
                    value={email}
                    onChange={e => setEmail(e.target.value)}
                    className="input pl-9"
                    placeholder="tu@email.com"
                    required
                    autoComplete="email"
                  />
                </div>
              </div>
              <div>
                <label className="label">Contraseña</label>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
                  <input
                    type="password"
                    value={password}
                    onChange={e => setPassword(e.target.value)}
                    className="input pl-9"
                    placeholder="Mín. 6 caracteres"
                    required
                    autoComplete="new-password"
                  />
                </div>
              </div>

              <button type="submit" disabled={loading} className="btn-primary w-full">
                {loading
                  ? <><Loader2 className="w-4 h-4 animate-spin" /> Creando cuenta...</>
                  : <><ArrowRight className="w-4 h-4" /> Crear cuenta</>}
              </button>
            </form>
          </div>
        )}

        <p className="text-center text-sm text-slate-400 mt-6">
          ¿Ya tienes cuenta?{' '}
          <Link href="/login" className="text-brand-primary hover:underline font-medium">
            Inicia sesión
          </Link>
        </p>
      </div>
    </div>
  )
}
