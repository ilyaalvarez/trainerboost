'use client'

import { useState } from 'react'
import { toast } from 'sonner'
import Link from 'next/link'
import {
  Zap, ArrowLeft, Mail, Clock, CheckCircle2, Loader2,
  CalendarCheck, HelpCircle, Star,
} from 'lucide-react'

const INQUIRY_TYPES = [
  { value: 'demo',    label: 'Solicitar demo',       emoji: '📅', desc: 'Te mostramos todo en vivo, 30 min' },
  { value: 'pricing', label: 'Dudas sobre precios',  emoji: '💳', desc: 'Planes, pagos y facturación' },
  { value: 'support', label: 'Soporte técnico',      emoji: '🔧', desc: 'Problema con tu cuenta' },
  { value: 'other',   label: 'Otro',                 emoji: '💬', desc: 'Cualquier otra consulta' },
]

export default function ContactPage() {
  const [name, setName]       = useState('')
  const [email, setEmail]     = useState('')
  const [type, setType]       = useState('demo')
  const [message, setMessage] = useState('')
  const [sending, setSending] = useState(false)
  const [sent, setSent]       = useState(false)

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!name.trim() || !email.trim() || !message.trim()) return
    setSending(true)
    try {
      const res = await fetch('/api/contact', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name, email, type, message }),
      })
      if (!res.ok) {
        toast.error('Error al enviar. Escríbenos directamente a hola@trainerboost.es')
        return
      }
      setSent(true)
    } catch {
      toast.error('Error de red. Escríbenos a hola@trainerboost.es')
    } finally {
      setSending(false)
    }
  }

  return (
    <div className="min-h-screen bg-background overflow-x-hidden">
      {/* Ambient */}
      <div className="fixed inset-0 pointer-events-none z-0">
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[700px] h-64"
             style={{ background: 'radial-gradient(ellipse, rgba(14,165,233,0.08) 0%, transparent 70%)' }} />
        <div className="absolute bottom-0 right-0 w-[400px] h-[400px]"
             style={{ background: 'radial-gradient(ellipse at 100% 100%, rgba(124,58,237,0.05) 0%, transparent 70%)' }} />
      </div>

      {/* Nav */}
      <nav className="relative z-10 border-b border-border/50 bg-background/85 backdrop-blur-xl sticky top-0">
        <div className="max-w-5xl mx-auto px-6 h-16 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl flex items-center justify-center shadow-glow-sm"
                 style={{ background: '#8FD43A' }}>
              <Zap className="w-4 h-4 text-black" />
            </div>
            <span className="font-bold text-base tracking-tight gradient-text">TrainerBoost</span>
          </Link>
          <Link href="/" className="flex items-center gap-1.5 text-sm text-slate-400 hover:text-white transition-colors group">
            <ArrowLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform duration-200" />
            Volver al inicio
          </Link>
        </div>
      </nav>

      <div className="relative z-10 max-w-5xl mx-auto px-6 py-16">

        {/* Header */}
        <div className="text-center mb-14 animate-fade-in-up">
          <div className="chip mb-5 mx-auto w-fit">Contacto</div>
          <h1 className="text-4xl md:text-5xl font-bold text-white mb-4 tracking-tight">
            ¿Hablamos?
          </h1>
          <p className="text-lg text-slate-400 max-w-md mx-auto leading-relaxed">
            Cuéntanos en qué podemos ayudarte.<br />
            Respondemos en menos de 24 horas.
          </p>
        </div>

        <div className="grid lg:grid-cols-5 gap-10 items-start">

          {/* ── Form ─────────────────────────────────────────────────────── */}
          <div className="lg:col-span-3 animate-fade-in-up delay-100">
            {sent ? (
              <div className="card p-12 text-center">
                <div className="w-16 h-16 rounded-2xl mx-auto mb-6 flex items-center justify-center"
                     style={{ background: 'linear-gradient(135deg, rgba(16,185,129,0.2), rgba(14,165,233,0.1))' }}>
                  <CheckCircle2 className="w-8 h-8 text-brand-accent" />
                </div>
                <h2 className="text-xl font-bold text-white mb-3">¡Mensaje enviado!</h2>
                <p className="text-slate-400 text-sm leading-relaxed mb-8">
                  Hemos recibido tu mensaje. Te contestaremos en menos de 24 horas en{' '}
                  <span className="text-white font-medium">{email}</span>.
                </p>
                <div className="flex flex-col sm:flex-row gap-3 justify-center">
                  <Link href="/" className="btn-secondary text-sm py-2.5 px-6">
                    Volver al inicio
                  </Link>
                  <Link href="/demo" className="btn-gradient text-sm py-2.5 px-6">
                    Ver demo ahora
                  </Link>
                </div>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="card p-8 space-y-6">
                <div className="grid sm:grid-cols-2 gap-5">
                  <div>
                    <label className="label">Nombre *</label>
                    <input
                      type="text"
                      required
                      value={name}
                      onChange={e => setName(e.target.value)}
                      className="input"
                      placeholder="Tu nombre"
                      autoComplete="name"
                    />
                  </div>
                  <div>
                    <label className="label">Email *</label>
                    <input
                      type="email"
                      required
                      value={email}
                      onChange={e => setEmail(e.target.value)}
                      className="input"
                      placeholder="tu@email.com"
                      autoComplete="email"
                    />
                  </div>
                </div>

                <div>
                  <label className="label">¿En qué te podemos ayudar?</label>
                  <div className="grid sm:grid-cols-2 gap-2.5 mt-2">
                    {INQUIRY_TYPES.map(t => (
                      <button
                        key={t.value}
                        type="button"
                        onClick={() => setType(t.value)}
                        className={`text-left px-4 py-3.5 rounded-xl border transition-all duration-150 ${
                          type === t.value
                            ? 'border-brand-primary/60 bg-brand-primary/10 text-white'
                            : 'border-border/60 text-slate-400 hover:border-border-bright hover:bg-surface/60 hover:text-slate-200'
                        }`}
                      >
                        <div className="text-sm font-medium">{t.emoji} {t.label}</div>
                        <div className="text-xs text-slate-500 mt-0.5">{t.desc}</div>
                      </button>
                    ))}
                  </div>
                </div>

                <div>
                  <label className="label">Mensaje *</label>
                  <textarea
                    required
                    value={message}
                    onChange={e => setMessage(e.target.value)}
                    className="input min-h-[130px] resize-none"
                    placeholder={
                      type === 'demo'
                        ? 'Cuéntanos sobre tu negocio: ¿cuántos clientes tienes, qué herramientas usas ahora, qué te gustaría mejorar...'
                        : 'Escribe tu mensaje aquí...'
                    }
                    rows={5}
                    maxLength={2000}
                  />
                  <p className="text-xs text-slate-600 mt-1.5 text-right">{message.length}/2000</p>
                </div>

                <button
                  type="submit"
                  disabled={sending || !name.trim() || !email.trim() || !message.trim()}
                  className="btn-gradient w-full py-3.5"
                >
                  {sending
                    ? <><Loader2 className="w-4 h-4 animate-spin" /> Enviando...</>
                    : <><Mail className="w-4 h-4" /> Enviar mensaje</>
                  }
                </button>

                <p className="text-center text-xs text-slate-500">
                  O escríbenos directamente a{' '}
                  <a href="mailto:hola@trainerboost.es" className="text-brand-primary hover:underline">
                    hola@trainerboost.es
                  </a>
                </p>
              </form>
            )}
          </div>

          {/* ── Info sidebar ─────────────────────────────────────────────── */}
          <div className="lg:col-span-2 space-y-4 animate-fade-in-up delay-200">

            {/* Demo info */}
            <div className="card p-6">
              <div className="flex items-center gap-3 mb-5">
                <div className="w-10 h-10 rounded-xl flex items-center justify-center shrink-0"
                     style={{ background: 'linear-gradient(135deg, rgba(14,165,233,0.2), rgba(124,58,237,0.1))' }}>
                  <CalendarCheck className="w-5 h-5 text-brand-primary" />
                </div>
                <div>
                  <p className="font-semibold text-white text-sm">Demo personalizada</p>
                  <p className="text-xs text-slate-500">30 min · Sin compromiso · Gratis</p>
                </div>
              </div>
              <ul className="space-y-2.5">
                {[
                  'Te mostramos todo en directo',
                  'Resolvemos tus dudas al instante',
                  'Configuramos tu cuenta contigo',
                  'Descuento especial si te registras',
                ].map(item => (
                  <li key={item} className="flex items-center gap-2 text-xs text-slate-400">
                    <CheckCircle2 className="w-3.5 h-3.5 text-brand-accent shrink-0" />
                    {item}
                  </li>
                ))}
              </ul>
            </div>

            {/* Response time */}
            <div className="card p-5 flex items-center gap-4">
              <div className="w-10 h-10 rounded-xl bg-amber-500/10 border border-amber-500/20 flex items-center justify-center shrink-0">
                <Clock className="w-5 h-5 text-amber-400" />
              </div>
              <div>
                <p className="font-semibold text-white text-sm">Respuesta en &lt;24h</p>
                <p className="text-xs text-slate-500">Lunes a viernes, 9–18h CET</p>
              </div>
            </div>

            {/* Testimonial */}
            <div className="card p-5">
              <div className="flex gap-0.5 mb-3">
                {Array.from({ length: 5 }).map((_, i) => (
                  <Star key={i} className="w-3.5 h-3.5 text-amber-400 fill-amber-400" />
                ))}
              </div>
              <p className="text-xs text-slate-400 leading-relaxed italic mb-4">
                &ldquo;La demo fue decisiva. En 30 minutos entendí exactamente cómo TrainerBoost podía ayudarme y ese mismo día me suscribí.&rdquo;
              </p>
              <div className="flex items-center gap-2.5">
                <div className="w-7 h-7 rounded-full bg-violet-500/20 border border-violet-500/30 flex items-center justify-center text-[10px] font-bold text-violet-300 shrink-0">
                  MR
                </div>
                <div>
                  <p className="text-xs font-semibold text-white">Marta R.</p>
                  <p className="text-[10px] text-slate-500">Coach online · Sevilla</p>
                </div>
              </div>
            </div>

            {/* FAQ hint */}
            <div className="flex items-start gap-3 px-4 py-3.5 rounded-xl border border-border/40 bg-surface/30">
              <HelpCircle className="w-4 h-4 text-slate-500 shrink-0 mt-0.5" />
              <div>
                <p className="text-xs text-slate-400 mb-0.5">¿Buscas respuestas rápidas?</p>
                <Link href="/#precios" className="text-xs text-brand-primary hover:underline">
                  Consulta las preguntas frecuentes →
                </Link>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
