'use client'

import { useState } from 'react'
import Link from 'next/link'
import { toast } from 'sonner'
import { Mail, ArrowLeft, Loader2, Zap, CheckCircle2 } from 'lucide-react'
import { createClient } from '@/lib/supabase/client'

export const dynamic = 'force-dynamic'

export default function ForgotPasswordPage() {
  const supabase = createClient()
  const [email, setEmail]     = useState('')
  const [loading, setLoading] = useState(false)
  const [sent, setSent]       = useState(false)

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!email.trim()) return
    setLoading(true)
    try {
      const { error } = await supabase.auth.resetPasswordForEmail(email.trim(), {
        redirectTo: `${window.location.origin}/reset-password`,
      })
      if (error) { toast.error(error.message); return }
      setSent(true)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-4 relative overflow-hidden">

      {/* Background orbs */}
      <div className="absolute top-1/4 left-1/4 w-64 h-64 rounded-full pointer-events-none animate-float"
           style={{ background: 'radial-gradient(circle, rgba(14,165,233,0.08) 0%, transparent 70%)', animationDuration: '8s' }} />
      <div className="absolute bottom-1/4 right-1/4 w-72 h-72 rounded-full pointer-events-none animate-float"
           style={{ background: 'radial-gradient(circle, rgba(124,58,237,0.06) 0%, transparent 70%)', animationDuration: '10s', animationDelay: '2s' }} />
      <div className="absolute top-1/2 left-1/3 w-32 h-32 rounded-full pointer-events-none animate-float"
           style={{ background: 'radial-gradient(circle, rgba(16,185,129,0.06) 0%, transparent 70%)', animationDuration: '14s', animationDelay: '3s' }} />
      <div className="absolute bottom-1/3 right-1/3 w-48 h-48 rounded-full pointer-events-none animate-float"
           style={{ background: 'radial-gradient(circle, rgba(124,58,237,0.08) 0%, transparent 70%)', animationDuration: '11s', animationDelay: '6s' }} />

      {/* Subtle grid */}
      <div className="absolute inset-0 pointer-events-none opacity-[0.025]"
           style={{
             backgroundImage: 'linear-gradient(#94a3b8 1px, transparent 1px), linear-gradient(90deg, #94a3b8 1px, transparent 1px)',
             backgroundSize: '64px 64px',
           }} />

      <div className="relative w-full max-w-md animate-fade-in-up">
        <Link href="/login" className="inline-flex items-center gap-1.5 text-sm text-slate-500 hover:text-white transition-colors mb-8 group">
          <ArrowLeft className="w-3.5 h-3.5 group-hover:-translate-x-1 transition-transform duration-200" />
          Volver al inicio de sesión
        </Link>

        <div className="flex items-center justify-center gap-3 mb-8">
          <div className="w-10 h-10 rounded-xl flex items-center justify-center shadow-glow-sm"
               style={{ background: 'linear-gradient(135deg, #0EA5E9, #7C3AED)' }}>
            <Zap className="w-5 h-5 text-white" />
          </div>
          <span className="text-xl font-bold text-white tracking-tight">TrainerBoost</span>
        </div>

        <div className="glass-card p-8">
          {sent ? (
            <div className="text-center py-4 animate-fade-in">
              <div className="w-14 h-14 rounded-2xl flex items-center justify-center mx-auto mb-4"
                   style={{ background: 'linear-gradient(135deg, rgba(16,185,129,0.15), rgba(14,165,233,0.1))' }}>
                <CheckCircle2 className="w-7 h-7 text-emerald-400" />
              </div>
              <h1 className="text-xl font-bold text-white mb-2">Email enviado</h1>
              <p className="text-slate-400 text-sm leading-relaxed mb-6">
                Si existe una cuenta con <span className="text-white font-medium">{email}</span>,
                recibirás un enlace para restablecer tu contraseña en breve.
              </p>
              <p className="text-xs text-slate-500">
                ¿No te ha llegado? Revisa la carpeta de spam o{' '}
                <button
                  onClick={() => setSent(false)}
                  className="text-brand-primary hover:underline"
                >
                  vuelve a intentarlo
                </button>
                .
              </p>
            </div>
          ) : (
            <div className="animate-fade-in">
              <h1 className="text-2xl font-bold text-white mb-1">Recuperar contraseña</h1>
              <p className="text-slate-400 text-sm mb-6">
                Introduce tu email y te enviaremos un enlace para crear una nueva contraseña.
              </p>

              <form onSubmit={handleSubmit} className="space-y-4">
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

                <button type="submit" disabled={loading} className="btn-gradient w-full py-2.5">
                  {loading
                    ? <><Loader2 className="w-4 h-4 animate-spin" /> Enviando...</>
                    : 'Enviar enlace de recuperación'}
                </button>
              </form>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
