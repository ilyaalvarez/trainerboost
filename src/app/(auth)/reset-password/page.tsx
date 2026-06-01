'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { toast } from 'sonner'
import { Lock, ArrowRight, Loader2, Zap, CheckCircle2, Eye, EyeOff } from 'lucide-react'
import { createClient } from '@/lib/supabase/client'

export default function ResetPasswordPage() {
  const router   = useRouter()
  const supabase = createClient()

  const [ready, setReady]         = useState(false)
  const [newPwd, setNewPwd]       = useState('')
  const [confirm, setConfirm]     = useState('')
  const [loading, setLoading]     = useState(false)
  const [done, setDone]           = useState(false)
  const [showPwd, setShowPwd]     = useState(false)

  useEffect(() => {
    const { data: { subscription } } = supabase.auth.onAuthStateChange((event) => {
      if (event === 'PASSWORD_RECOVERY') {
        setReady(true)
      }
    })
    return () => subscription.unsubscribe()
  }, [supabase])

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (newPwd.length < 8) { toast.error('La contraseña debe tener al menos 8 caracteres'); return }
    if (newPwd !== confirm) { toast.error('Las contraseñas no coinciden'); return }
    setLoading(true)
    try {
      const { error } = await supabase.auth.updateUser({ password: newPwd })
      if (error) { toast.error(error.message); return }
      setDone(true)
      toast.success('Contraseña actualizada correctamente')
      setTimeout(() => router.push('/dashboard'), 2000)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-4 relative overflow-hidden">

      {/* Background orbs */}
      <div className="absolute top-1/4 right-1/4 w-64 h-64 rounded-full pointer-events-none animate-float"
           style={{ background: 'radial-gradient(circle, rgba(14,165,233,0.08) 0%, transparent 70%)', animationDuration: '9s' }} />
      <div className="absolute bottom-1/3 left-1/4 w-72 h-72 rounded-full pointer-events-none animate-float"
           style={{ background: 'radial-gradient(circle, rgba(124,58,237,0.06) 0%, transparent 70%)', animationDuration: '11s', animationDelay: '1s' }} />

      {/* Subtle grid */}
      <div className="absolute inset-0 pointer-events-none opacity-[0.025]"
           style={{
             backgroundImage: 'linear-gradient(#94a3b8 1px, transparent 1px), linear-gradient(90deg, #94a3b8 1px, transparent 1px)',
             backgroundSize: '64px 64px',
           }} />

      <div className="relative w-full max-w-md animate-fade-in-up">
        <div className="flex items-center justify-center gap-3 mb-8">
          <div className="w-10 h-10 rounded-xl flex items-center justify-center shadow-glow-sm"
               style={{ background: 'linear-gradient(135deg, #0EA5E9, #7C3AED)' }}>
            <Zap className="w-5 h-5 text-white" />
          </div>
          <span className="text-xl font-bold text-white tracking-tight">TrainerBoost</span>
        </div>

        <div className="card p-8" style={{ boxShadow: '0 20px 60px -15px rgba(0,0,0,0.6), 0 0 0 1px rgba(255,255,255,0.04)' }}>
          {done ? (
            <div className="text-center py-4 animate-fade-in">
              <div className="w-14 h-14 rounded-2xl flex items-center justify-center mx-auto mb-4"
                   style={{ background: 'linear-gradient(135deg, rgba(16,185,129,0.15), rgba(14,165,233,0.1))' }}>
                <CheckCircle2 className="w-7 h-7 text-emerald-400" />
              </div>
              <h1 className="text-xl font-bold text-white mb-2">¡Contraseña actualizada!</h1>
              <p className="text-slate-400 text-sm">Redirigiendo al dashboard...</p>
            </div>
          ) : !ready ? (
            <div className="text-center py-8 animate-fade-in">
              <Loader2 className="w-8 h-8 animate-spin text-brand-primary mx-auto mb-4" />
              <p className="text-slate-400 text-sm">Verificando enlace de recuperación...</p>
              <p className="text-xs text-slate-500 mt-2">
                Si este mensaje no desaparece, el enlace puede haber expirado.{' '}
                <a href="/forgot-password" className="text-brand-primary hover:underline">
                  Solicitar uno nuevo
                </a>
              </p>
            </div>
          ) : (
            <div className="animate-fade-in">
              <h1 className="text-2xl font-bold text-white mb-1">Nueva contraseña</h1>
              <p className="text-slate-400 text-sm mb-6">Elige una contraseña segura para tu cuenta.</p>

              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <label className="label">Nueva contraseña</label>
                  <div className="relative">
                    <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500 pointer-events-none" />
                    <input
                      type={showPwd ? 'text' : 'password'}
                      value={newPwd}
                      onChange={e => setNewPwd(e.target.value)}
                      className="input pl-9 pr-10"
                      placeholder="Mínimo 8 caracteres"
                      required
                      autoComplete="new-password"
                    />
                    <button type="button" onClick={() => setShowPwd(v => !v)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-500 hover:text-slate-300 transition-colors">
                      {showPwd ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  </div>
                </div>
                <div>
                  <label className="label">Confirmar contraseña</label>
                  <div className="relative">
                    <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500 pointer-events-none" />
                    <input
                      type={showPwd ? 'text' : 'password'}
                      value={confirm}
                      onChange={e => setConfirm(e.target.value)}
                      className="input pl-9"
                      placeholder="Repite la contraseña"
                      required
                      autoComplete="new-password"
                    />
                  </div>
                </div>
                {newPwd && confirm && (
                  <p className={`text-xs font-medium ${newPwd === confirm ? 'text-emerald-400' : 'text-red-400'}`}>
                    {newPwd === confirm ? '✓ Las contraseñas coinciden' : '✗ Las contraseñas no coinciden'}
                  </p>
                )}

                <button type="submit" disabled={loading} className="btn-gradient w-full py-2.5">
                  {loading
                    ? <><Loader2 className="w-4 h-4 animate-spin" /> Guardando...</>
                    : <><ArrowRight className="w-4 h-4" /> Guardar contraseña</>}
                </button>
              </form>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
