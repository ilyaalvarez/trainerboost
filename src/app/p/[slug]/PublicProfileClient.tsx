'use client'

import { useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { toast } from 'sonner'
import {
  Star, MapPin, Zap, Phone, Mail,
  Globe, CheckCircle2, Send, ArrowRight, Calendar, Link2,
} from 'lucide-react'
import type { TrainerPublicProfile, Profile } from '@/types/database'

interface Props {
  pub: TrainerPublicProfile
  profile: Pick<Profile, 'full_name' | 'avatar_url' | 'bio' | 'specialties'>
}

const GOALS = [
  'Perder peso', 'Ganar músculo', 'Mejorar resistencia',
  'Rehabilitación', 'Preparación física', 'Otro',
]

export default function PublicProfileClient({ pub, profile }: Props) {
  const router = useRouter()
  const [form, setForm] = useState({ name: '', email: '', phone: '', goal: '', message: '' })
  const [sending, setSending] = useState(false)
  const [sent, setSent] = useState(false)

  const avgStars = pub.testimonials.length
    ? pub.testimonials.reduce((s, t) => s + t.stars, 0) / pub.testimonials.length
    : 0

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!form.name || !form.email) {
      toast.error('Nombre y email son obligatorios')
      return
    }
    setSending(true)
    try {
      const res = await fetch('/api/contact', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...form,
          trainer_id: pub.trainer_id,
          source: 'public_profile',
          slug: pub.slug,
        }),
      })
      if (!res.ok) throw new Error()
      setSent(true)
      toast.success('¡Solicitud enviada! El entrenador se pondrá en contacto contigo.')
    } catch {
      toast.error('Error al enviar. Inténtalo de nuevo.')
    } finally {
      setSending(false)
    }
  }

  return (
    <div className="min-h-screen bg-background text-fg-primary">
      {/* ── Nav ── */}
      <nav className="border-b border-border/40 bg-background/90 backdrop-blur-xl sticky top-0 z-50">
        <div className="max-w-4xl mx-auto px-6 h-14 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2 text-fg-muted hover:text-fg-primary transition-colors">
            <div className="w-6 h-6 rounded-md bg-brand-primary flex items-center justify-center">
              <Zap className="w-3.5 h-3.5 text-black" />
            </div>
            <span className="text-sm font-semibold">TrainerBoost</span>
          </Link>
          <Link href="/register" className="btn-primary text-sm py-1.5 px-4">
            <Zap className="w-3.5 h-3.5" /> Crea tu perfil gratis
          </Link>
        </div>
      </nav>

      <main className="max-w-4xl mx-auto px-6 py-12 space-y-16">

        {/* ── Hero ── */}
        <section className="text-center">
          {profile.avatar_url ? (
            <img src={profile.avatar_url} alt={profile.full_name}
                 className="w-28 h-28 rounded-full object-cover mx-auto mb-5 border-4 border-brand-primary/20 shadow-card-elevated" />
          ) : (
            <div className="w-28 h-28 rounded-full bg-brand-primary/10 border-4 border-brand-primary/20 flex items-center justify-center mx-auto mb-5 shadow-card-elevated">
              <span className="text-3xl font-bold text-brand-primary">
                {profile.full_name?.slice(0, 2).toUpperCase()}
              </span>
            </div>
          )}

          <h1 className="text-3xl font-bold text-fg-primary mb-2">{profile.full_name}</h1>

          {pub.headline && (
            <p className="text-lg text-fg-muted mb-4 max-w-xl mx-auto">{pub.headline}</p>
          )}

          {/* Badges */}
          <div className="flex flex-wrap items-center justify-center gap-3 mb-6">
            {pub.testimonials.length > 0 && (
              <div className="flex items-center gap-1.5 bg-semantic-warning/10 border border-semantic-warning/20 rounded-full px-3 py-1">
                <Star className="w-3.5 h-3.5 text-semantic-warning-text fill-current" />
                <span className="text-sm font-semibold text-semantic-warning-text">
                  {avgStars.toFixed(1)} · {pub.testimonials.length} reseñas
                </span>
              </div>
            )}
            {profile.specialties?.length > 0 && profile.specialties.slice(0, 3).map(s => (
              <span key={s} className="bg-surface border border-border rounded-full px-3 py-1 text-xs text-fg-muted">{s}</span>
            ))}
          </div>

          {/* CTA hero */}
          {pub.booking_enabled && (
            <a href="#contacto"
               className="btn-primary inline-flex items-center gap-2 text-base px-8 py-3">
              <Calendar className="w-4 h-4" /> Pide tu sesión gratuita
            </a>
          )}

          {/* Social links */}
          {Object.keys(pub.social_links ?? {}).length > 0 && (
            <div className="flex items-center justify-center gap-3 mt-5">
              {pub.social_links.instagram && (
                <a href={`https://instagram.com/${pub.social_links.instagram}`} target="_blank" rel="noopener noreferrer"
                   className="w-8 h-8 rounded-lg bg-surface border border-border flex items-center justify-center text-fg-muted hover:text-fg-primary hover:border-border-bright transition-all">
                  <Link2 className="w-4 h-4" />
                </a>
              )}
              {pub.social_links.youtube && (
                <a href={pub.social_links.youtube} target="_blank" rel="noopener noreferrer"
                   className="w-8 h-8 rounded-lg bg-surface border border-border flex items-center justify-center text-fg-muted hover:text-fg-primary hover:border-border-bright transition-all">
                  <Link2 className="w-4 h-4" />
                </a>
              )}
              {pub.social_links.web && (
                <a href={pub.social_links.web} target="_blank" rel="noopener noreferrer"
                   className="w-8 h-8 rounded-lg bg-surface border border-border flex items-center justify-center text-fg-muted hover:text-fg-primary hover:border-border-bright transition-all">
                  <Globe className="w-4 h-4" />
                </a>
              )}
            </div>
          )}
        </section>

        {/* ── Sobre mí ── */}
        {pub.about && (
          <section>
            <h2 className="text-xl font-semibold text-fg-primary mb-4">Sobre mí</h2>
            <div className="card p-6">
              <p className="text-fg-muted leading-relaxed whitespace-pre-line">{pub.about}</p>
            </div>
          </section>
        )}

        {/* ── Servicios ── */}
        {pub.services?.length > 0 && (
          <section>
            <h2 className="text-xl font-semibold text-fg-primary mb-4">Servicios</h2>
            <div className="grid sm:grid-cols-2 gap-4">
              {pub.services.map((service, i) => (
                <div key={i} className="card p-5 hover:-translate-y-0.5 transition-transform">
                  <div className="flex items-start justify-between gap-3 mb-2">
                    <h3 className="font-semibold text-fg-primary">{service.name}</h3>
                    {service.price != null && (
                      <span className="text-brand-primary font-bold font-mono shrink-0">{service.price}€</span>
                    )}
                  </div>
                  {service.description && (
                    <p className="text-sm text-fg-muted mb-3">{service.description}</p>
                  )}
                  <div className="flex items-center gap-3 text-xs text-fg-disabled">
                    {service.duration && <span>{service.duration} min</span>}
                    <span className="capitalize">{service.type}</span>
                  </div>
                  <a href="#contacto" className="mt-3 text-sm text-brand-primary font-medium hover:underline flex items-center gap-1">
                    Me interesa <ArrowRight className="w-3.5 h-3.5" />
                  </a>
                </div>
              ))}
            </div>
          </section>
        )}

        {/* ── Galería ── */}
        {pub.gallery_urls?.length > 0 && (
          <section>
            <h2 className="text-xl font-semibold text-fg-primary mb-4">Resultados</h2>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
              {pub.gallery_urls.map((url, i) => (
                <img key={i} src={url} alt={`Resultado ${i + 1}`}
                     className="rounded-xl object-cover aspect-square w-full border border-border" />
              ))}
            </div>
          </section>
        )}

        {/* ── Testimonios ── */}
        {pub.testimonials?.length > 0 && (
          <section>
            <h2 className="text-xl font-semibold text-fg-primary mb-4">Lo que dicen mis clientes</h2>
            <div className="grid sm:grid-cols-2 gap-4">
              {pub.testimonials.map((t, i) => (
                <div key={i} className="card p-5 flex flex-col gap-3">
                  <div className="flex items-center gap-0.5">
                    {Array.from({ length: 5 }).map((_, s) => (
                      <Star key={s} className={`w-3.5 h-3.5 ${s < t.stars ? 'text-semantic-warning-text fill-current' : 'text-border-bright'}`} />
                    ))}
                  </div>
                  <p className="text-sm text-fg-secondary leading-relaxed">&ldquo;{t.text}&rdquo;</p>
                  <div className="flex items-center gap-2 pt-2 border-t border-border/50">
                    {t.avatar_url ? (
                      <img src={t.avatar_url} alt={t.name} className="w-7 h-7 rounded-full object-cover" />
                    ) : (
                      <div className="w-7 h-7 rounded-full bg-surface-3 border border-border-bright flex items-center justify-center text-xs font-bold text-fg-muted">
                        {t.name.slice(0, 2).toUpperCase()}
                      </div>
                    )}
                    <div className="flex items-center gap-1.5">
                      <span className="text-sm font-medium text-fg-primary">{t.name}</span>
                      {t.verified && (
                        <CheckCircle2 className="w-3.5 h-3.5 text-brand-primary" aria-label="Cliente verificado" />
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </section>
        )}

        {/* ── Formulario de contacto ── */}
        {pub.booking_enabled && (
          <section id="contacto">
            <h2 className="text-xl font-semibold text-fg-primary mb-2">Pide información</h2>
            <p className="text-fg-muted text-sm mb-6">
              Rellena el formulario y me pondré en contacto contigo lo antes posible.
            </p>

            {sent ? (
              <div className="card p-8 text-center">
                <div className="text-4xl mb-3">✅</div>
                <h3 className="text-lg font-semibold text-fg-primary mb-2">¡Solicitud enviada!</h3>
                <p className="text-fg-muted text-sm">
                  {profile.full_name} ha recibido tu solicitud y se pondrá en contacto contigo en breve.
                </p>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="card p-6 space-y-4">
                <div className="grid sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-medium text-fg-muted mb-1.5">Tu nombre *</label>
                    <input className="input w-full" placeholder="Ana García"
                           value={form.name} onChange={e => setForm(f => ({ ...f, name: e.target.value }))} />
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-fg-muted mb-1.5">Tu email *</label>
                    <input className="input w-full" type="email" placeholder="ana@email.com"
                           value={form.email} onChange={e => setForm(f => ({ ...f, email: e.target.value }))} />
                  </div>
                </div>

                <div className="grid sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-medium text-fg-muted mb-1.5">Teléfono</label>
                    <input className="input w-full" type="tel" placeholder="+34 600 000 000"
                           value={form.phone} onChange={e => setForm(f => ({ ...f, phone: e.target.value }))} />
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-fg-muted mb-1.5">Tu objetivo</label>
                    <select className="input w-full" value={form.goal}
                            onChange={e => setForm(f => ({ ...f, goal: e.target.value }))}>
                      <option value="">Selecciona un objetivo</option>
                      {GOALS.map(g => <option key={g} value={g}>{g}</option>)}
                    </select>
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-medium text-fg-muted mb-1.5">Cuéntame más (opcional)</label>
                  <textarea className="input w-full resize-none" rows={3}
                            placeholder="¿Cuándo puedes entrenar? ¿Tienes alguna lesión? ¿Buscas presencial u online?"
                            value={form.message} onChange={e => setForm(f => ({ ...f, message: e.target.value }))} />
                </div>

                <button type="submit" disabled={sending}
                        className="btn-primary w-full justify-center py-3 disabled:opacity-60">
                  {sending ? (
                    <span className="flex items-center gap-2"><span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" /> Enviando...</span>
                  ) : (
                    <><Send className="w-4 h-4" /> Enviar solicitud</>
                  )}
                </button>

                <p className="text-xs text-fg-disabled text-center">
                  Al enviar aceptas nuestra{' '}
                  <Link href="/privacy" className="text-brand-primary hover:underline">política de privacidad</Link>.
                </p>
              </form>
            )}
          </section>
        )}

        {/* ── Pie ── */}
        <footer className="border-t border-border/40 pt-8 text-center">
          <p className="text-xs text-fg-disabled">
            Perfil gestionado con{' '}
            <Link href="/" className="text-brand-primary hover:underline">TrainerBoost</Link>
            {' '}· La plataforma para entrenadores personales
          </p>
          <p className="text-xs text-fg-disabled mt-1">
            ¿Eres entrenador?{' '}
            <Link href="/register" className="text-brand-primary hover:underline">Crea tu perfil gratis →</Link>
          </p>
        </footer>
      </main>
    </div>
  )
}
