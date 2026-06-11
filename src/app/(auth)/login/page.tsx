'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { toast } from 'sonner'
import { Zap, Mail, Lock, ArrowRight, Loader2, ArrowLeft, Eye, EyeOff, AlertTriangle } from 'lucide-react'
import { createClient } from '@/lib/supabase/client'

export const dynamic = 'force-dynamic'

function getAuthError(error: string): string {
  if (error.includes('Invalid login credentials')) return 'Email o contraseña incorrectos'
  if (error.includes('Email not confirmed')) return 'Confirma tu email antes de entrar'
  if (error.includes('Too many requests')) return 'Demasiados intentos. Espera unos minutos'
  return 'Error al iniciar sesión. Inténtalo de nuevo'
}

export default function LoginPage() {
  const router = useRouter()
  const supabase = createClient()
  const [email, setEmail]             = useState('')
  const [password, setPassword]       = useState('')
  const [loading, setLoading]         = useState(false)
  const [showPassword, setShowPassword] = useState(false)
  const [attempts, setAttempts]       = useState(0)
  const [rememberMe, setRememberMe]   = useState(true)

  async function handleLogin(e: React.FormEvent) {
    e.preventDefault()
    setLoading(true)
    try {
      const { error } = await supabase.auth.signInWithPassword({ email, password })
      if (error) {
        setAttempts(prev => prev + 1)
        toast.error(getAuthError(error.message))
        return
      }

      const { data: { user } } = await supabase.auth.getUser()
      if (!user) return

      const { data: profile } = await supabase
        .from('profiles').select('role').eq('id', user.id).single()

      if (!profile) { router.push('/onboarding'); return }
      router.push(profile.role === 'client' ? '/client' : '/dashboard')
    } finally {
      setLoading(false)
    }
  }

  async function handleGoogle() {
    const { error } = await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: { redirectTo: `${window.location.origin}/auth/callback` },
    })
    if (error) toast.error(error.message)
  }

  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-4 relative overflow-hidden">

      {/* Animated background orbs */}
      <div className="absolute top-1/4 left-1/4 w-64 h-64 rounded-full pointer-events-none animate-float"
           style={{ background: 'radial-gradient(circle, rgba(14,165,233,0.08) 0%, transparent 70%)', animationDuration: '8s' }} />
      <div className="absolute bottom-1/4 right-1/4 w-80 h-80 rounded-full pointer-events-none animate-float"
           style={{ background: 'radial-gradient(circle, rgba(124,58,237,0.06) 0%, transparent 70%)', animationDuration: '10s', animationDelay: '2s' }} />
      <div className="absolute top-3/4 left-1/2 w-48 h-48 rounded-full pointer-events-none animate-float"
           style={{ background: 'radial-gradient(circle, rgba(16,185,129,0.05) 0%, transparent 70%)', animationDuration: '12s', animationDelay: '4s' }} />

      {/* Subtle grid */}
      <div className="absolute inset-0 pointer-events-none opacity-[0.025]"
           style={{
             backgroundImage: `linear-gradient(#94a3b8 1px, transparent 1px), linear-gradient(90deg, #94a3b8 1px, transparent 1px)`,
             backgroundSize: '64px 64px',
           }} />

      <div className="relative w-full max-w-md animate-fade-in-up">

        {/* Back */}
        <Link href="/" className="inline-flex items-center gap-1.5 text-sm text-fg-muted hover:text-fg-primary transition-colors mb-8 group">
          <ArrowLeft className="w-3.5 h-3.5 group-hover:-translate-x-1 transition-transform duration-200" />
          Volver al inicio
        </Link>

        {/* Logo */}
        <div className="flex items-center justify-center gap-3 mb-8">
          <div className="w-10 h-10 rounded-xl flex items-center justify-center shadow-glow-sm"
               style={{ background: '#8FD43A' }}>
            <Zap className="w-5 h-5 text-black" />
          </div>
          <span className="text-xl font-bold text-fg-primary tracking-tight">TrainerBoost</span>
        </div>

        <div className="glass-card p-8">
          <h1 className="text-2xl font-bold text-fg-primary mb-1">Bienvenido de nuevo</h1>
          <p className="text-fg-secondary text-sm mb-6">Inicia sesión en tu cuenta</p>

          {/* Rate limiting warning */}
          {attempts >= 3 && (
            <div className="flex items-start gap-2.5 p-3 mb-4 bg-semantic-warning/10 border border-semantic-warning/20 rounded-xl">
              <AlertTriangle className="w-4 h-4 text-semantic-warning-text shrink-0 mt-0.5" />
              <p className="text-sm text-semantic-warning-text">
                Demasiados intentos. Espera unos segundos antes de volver a intentarlo.
              </p>
            </div>
          )}

          {/* Google OAuth */}
          <button
            onClick={handleGoogle}
            className="btn-secondary w-full mb-4"
          >
            <svg className="w-4 h-4" viewBox="0 0 24 24">
              <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
              <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
              <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
              <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
            </svg>
            Continuar con Google
          </button>

          <div className="flex items-center gap-3 mb-4">
            <div className="flex-1 h-px bg-border" />
            <span className="text-xs text-fg-muted">o con email</span>
            <div className="flex-1 h-px bg-border" />
          </div>

          <form onSubmit={handleLogin} className="space-y-4">
            <div>
              <label className="label">Email</label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-fg-muted pointer-events-none" />
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
              <div className="flex items-center justify-between mb-1">
                <label className="label mb-0">Contraseña</label>
                <Link href="/forgot-password" className="text-xs text-fg-muted hover:text-brand-primary transition-colors">
                  ¿Olvidaste tu contraseña?
                </Link>
              </div>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-fg-muted pointer-events-none" />
                <input
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={e => setPassword(e.target.value)}
                  className="input pl-9 pr-10"
                  placeholder="••••••••"
                  required
                  autoComplete="current-password"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(prev => !prev)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-fg-muted hover:text-fg-secondary transition-colors"
                  tabIndex={-1}
                  aria-label={showPassword ? 'Ocultar contraseña' : 'Mostrar contraseña'}
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            {/* Remember me */}
            <label className="flex items-center gap-2.5 cursor-pointer group">
              <input
                type="checkbox"
                checked={rememberMe}
                onChange={e => setRememberMe(e.target.checked)}
                className="w-4 h-4 rounded border-border bg-surface accent-brand-primary cursor-pointer"
              />
              <span className="text-sm text-fg-secondary group-hover:text-fg-primary transition-colors">Recordarme</span>
            </label>

            <button
              type="submit"
              disabled={loading}
              className="btn-gradient w-full py-2.5"
            >
              {loading
                ? <><Loader2 className="w-4 h-4 animate-spin" /> Iniciando sesión...</>
                : <><ArrowRight className="w-4 h-4" /> Iniciar sesión</>}
            </button>
          </form>
        </div>

        <p className="text-center text-sm text-fg-secondary mt-6">
          ¿No tienes cuenta?{' '}
          <Link href="/register" className="text-brand-primary hover:underline font-medium transition-colors">
            Regístrate gratis
          </Link>
        </p>
        <p className="text-center text-xs text-fg-muted mt-3">
          ¿Quieres verlo antes?{' '}
          <Link href="/demo" className="text-fg-secondary hover:text-fg-primary transition-colors">
            Explorar demo →
          </Link>
        </p>
      </div>
    </div>
  )
}
