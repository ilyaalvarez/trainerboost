'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { toast } from 'sonner'
import { Mail, Lock, User, ArrowRight, Loader2, Users, Zap, ArrowLeft, CheckCircle2 } from 'lucide-react'
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
    <div className="min-h-screen bg-background flex items-center justify-center p-4 relative overflow-hidden">

      {/* Animated background orbs */}
      <div className="absolute top-1/4 right-1/4 w-72 h-72 rounded-full pointer-events-none animate-float"
           style={{ background: 'radial-gradient(circle, rgba(14,165,233,0.07) 0%, transparent 70%)', animationDuration: '9s' }} />
      <div className="absolute bottom-1/3 left-1/4 w-64 h-64 rounded-full pointer-events-none animate-float"
           style={{ background: 'radial-gradient(circle, rgba(124,58,237,0.06) 0%, transparent 70%)', animationDuration: '11s', animationDelay: '1s' }} />
      <div className="absolute top-1/2 right-1/3 w-48 h-48 rounded-full pointer-events-none animate-float"
           style={{ background: 'radial-gradient(circle, rgba(16,185,129,0.05) 0%, transparent 70%)', animationDuration: '7s', animationDelay: '3s' }} />

      {/* Subtle grid */}
      <div className="absolute inset-0 pointer-events-none opacity-[0.025]"
           style={{
             backgroundImage: `linear-gradient(#94a3b8 1px, transparent 1px), linear-gradient(90deg, #94a3b8 1px, transparent 1px)`,
             backgroundSize: '64px 64px',
           }} />

      <div className="relative w-full max-w-md animate-fade-in-up">

        {/* Back */}
        <Link href="/" className="inline-flex items-center gap-1.5 text-sm text-slate-500 hover:text-white transition-colors mb-8 group">
          <ArrowLeft className="w-3.5 h-3.5 group-hover:-translate-x-1 transition-transform duration-200" />
          Volver al inicio
        </Link>

        {/* Logo */}
        <div className="flex items-center justify-center gap-3 mb-8">
          <div className="w-10 h-10 rounded-xl flex items-center justify-center shadow-glow-sm"
               style={{ background: 'linear-gradient(135deg, #0EA5E9, #7C3AED)' }}>
            <Zap className="w-5 h-5 text-white" />
          </div>
          <span className="text-xl font-bold text-white tracking-tight">TrainerBoost</span>
        </div>

        {/* Step indicator */}
        <div className="flex items-center gap-2 justify-center mb-6">
          {([1, 2] as Step[]).map(s => (
            <div key={s} className="flex items-center gap-2">
              <div className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold transition-all duration-300 ${
                step >= s
                  ? 'text-white shadow-glow-sm'
                  : 'bg-surface border border-border text-slate-500'
              }`}
              style={step >= s ? { background: 'linear-gradient(135deg, #0EA5E9, #7C3AED)' } : {}}>
                {step > s ? <CheckCircle2 className="w-4 h-4" /> : s}
              </div>
              {s < 2 && (
                <div className={`w-8 h-px transition-colors duration-300 ${step > s ? 'bg-brand-primary' : 'bg-border'}`} />
              )}
            </div>
          ))}
        </div>

        <div className="glass-card p-8">

          {step === 1 ? (
            <div className="animate-fade-in">
              <h1 className="text-2xl font-bold text-white mb-1">Crea tu cuenta</h1>
              <p className="text-slate-400 text-sm mb-6">¿Cómo vas a usar TrainerBoost?</p>

              <div className="grid grid-cols-2 gap-3 mb-6">
                <button
                  onClick={() => setRole('trainer')}
                  className={`p-4 rounded-xl border-2 transition-all duration-200 text-left group ${
                    role === 'trainer'
                      ? 'border-brand-primary bg-brand-primary/10 shadow-glow-sm'
                      : 'border-border bg-surface/50 hover:border-border-bright hover:bg-surface'
                  }`}
                >
                  <div className={`w-9 h-9 rounded-lg flex items-center justify-center mb-3 transition-all duration-200 ${
                    role === 'trainer' ? 'shadow-glow-sm' : ''
                  }`}
                  style={{ background: role === 'trainer' ? 'linear-gradient(135deg, #0EA5E9, #7C3AED)' : '#263548' }}>
                    <Zap className="w-4 h-4 text-white" />
                  </div>
                  <div className={`font-semibold text-sm mb-0.5 transition-colors ${role === 'trainer' ? 'text-white' : 'text-slate-200'}`}>
                    Soy entrenador
                  </div>
                  <div className="text-xs text-slate-400">Gestiono clientes y rutinas</div>
                </button>

                <button
                  onClick={() => setRole('client')}
                  className={`p-4 rounded-xl border-2 transition-all duration-200 text-left group ${
                    role === 'client'
                      ? 'border-brand-primary bg-brand-primary/10 shadow-glow-sm'
                      : 'border-border bg-surface/50 hover:border-border-bright hover:bg-surface'
                  }`}
                >
                  <div className={`w-9 h-9 rounded-lg flex items-center justify-center mb-3 transition-all duration-200 ${
                    role === 'client' ? 'shadow-glow-sm' : ''
                  }`}
                  style={{ background: role === 'client' ? 'linear-gradient(135deg, #0EA5E9, #7C3AED)' : '#263548' }}>
                    <Users className="w-4 h-4 text-white" />
                  </div>
                  <div className={`font-semibold text-sm mb-0.5 transition-colors ${role === 'client' ? 'text-white' : 'text-slate-200'}`}>
                    Soy cliente
                  </div>
                  <div className="text-xs text-slate-400">Sigo el plan de mi entrenador</div>
                </button>
              </div>

              <button onClick={() => setStep(2)} className="btn-gradient w-full py-2.5">
                <ArrowRight className="w-4 h-4" />
                Continuar como {role === 'trainer' ? 'entrenador' : 'cliente'}
              </button>
            </div>
          ) : (
            <div className="animate-fade-in">
              <button
                onClick={() => setStep(1)}
                className="text-sm text-slate-400 hover:text-white mb-5 flex items-center gap-1.5 transition-colors group"
              >
                <ArrowLeft className="w-3.5 h-3.5 group-hover:-translate-x-0.5 transition-transform" />
                Cambiar rol
              </button>

              <h1 className="text-2xl font-bold text-white mb-1">Tus datos</h1>
              <p className="text-slate-400 text-sm mb-6">
                {role === 'trainer' ? 'Configura tu perfil de entrenador' : 'Únete con el código de tu entrenador después'}
              </p>

              <form onSubmit={handleRegister} className="space-y-4">
                <div>
                  <label className="label">Nombre completo</label>
                  <div className="relative">
                    <User className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500 pointer-events-none" />
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
                    <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500 pointer-events-none" />
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
                    <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500 pointer-events-none" />
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

                <button type="submit" disabled={loading} className="btn-gradient w-full py-2.5">
                  {loading
                    ? <><Loader2 className="w-4 h-4 animate-spin" /> Creando cuenta...</>
                    : <><ArrowRight className="w-4 h-4" /> Crear cuenta</>}
                </button>
              </form>
            </div>
          )}
        </div>

        <p className="text-center text-sm text-slate-400 mt-6">
          ¿Ya tienes cuenta?{' '}
          <Link href="/login" className="text-brand-primary hover:underline font-medium transition-colors">
            Inicia sesión
          </Link>
        </p>
      </div>
    </div>
  )
}
