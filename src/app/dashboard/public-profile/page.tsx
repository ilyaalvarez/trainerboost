'use client'

import { useState, useEffect, useCallback } from 'react'
import { createClient } from '@/lib/supabase/client'
import { toast } from 'sonner'
import {
  Globe, Eye, EyeOff, Save, Plus, Trash2, ExternalLink,
  Star, ChevronDown, ChevronUp, BarChart2, Loader2,
} from 'lucide-react'
import type { TrainerPublicProfile, PublicService, PublicTestimonial } from '@/types/database'
import EmptyState from '@/components/ui/EmptyState'

const BLANK_SERVICE: PublicService = { name: '', description: '', price: null, duration: null, type: 'presencial' }
const BLANK_TESTIMONIAL: PublicTestimonial = { name: '', text: '', stars: 5, avatar_url: null, verified: false }

export default function PublicProfilePage() {
  const supabase = createClient()

  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [profile, setProfile] = useState<Partial<TrainerPublicProfile>>({
    slug: '',
    headline: '',
    about: '',
    services: [],
    testimonials: [],
    booking_enabled: true,
    contact_method: 'form',
    contact_value: '',
    social_links: {},
    seo_title: '',
    seo_description: '',
    is_published: false,
  })
  const [trainerId, setTrainerId] = useState<string | null>(null)

  const load = useCallback(async () => {
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return
    setTrainerId(user.id)

    const { data } = await supabase
      .from('trainer_public_profiles')
      .select('*')
      .eq('trainer_id', user.id)
      .single()

    if (data) setProfile(data as TrainerPublicProfile)
    else {
      // Generar slug sugerido desde el nombre del perfil
      const { data: prof } = await supabase
        .from('profiles')
        .select('full_name')
        .eq('id', user.id)
        .single()
      if (prof?.full_name) {
        const suggestedSlug = prof.full_name
          .toLowerCase()
          .normalize('NFD')
          .replace(/[̀-ͯ]/g, '')
          .replace(/[^a-z0-9]+/g, '-')
          .replace(/^-|-$/g, '')
        setProfile(p => ({ ...p, slug: suggestedSlug }))
      }
    }
    setLoading(false)
  }, [supabase])

  useEffect(() => { load() }, [load])

  const set = <K extends keyof TrainerPublicProfile>(key: K, value: TrainerPublicProfile[K]) =>
    setProfile(p => ({ ...p, [key]: value }))

  async function save() {
    if (!trainerId) return
    if (!profile.slug) { toast.error('El enlace (slug) es obligatorio'); return }
    setSaving(true)
    const payload = { ...profile, trainer_id: trainerId }
    const { error } = await supabase
      .from('trainer_public_profiles')
      .upsert(payload, { onConflict: 'trainer_id' })
    if (error) {
      toast.error(error.message.includes('unique') ? 'Ese enlace ya está en uso, elige otro' : error.message)
    } else {
      toast.success('Perfil guardado')
      await load()
    }
    setSaving(false)
  }

  function addService() { set('services', [...(profile.services ?? []), { ...BLANK_SERVICE }]) }
  function removeService(i: number) { set('services', (profile.services ?? []).filter((_, x) => x !== i)) }
  function updateService(i: number, k: keyof PublicService, v: string | number | null) {
    const updated = [...(profile.services ?? [])]
    updated[i] = { ...updated[i], [k]: v }
    set('services', updated)
  }

  function addTestimonial() { set('testimonials', [...(profile.testimonials ?? []), { ...BLANK_TESTIMONIAL }]) }
  function removeTestimonial(i: number) { set('testimonials', (profile.testimonials ?? []).filter((_, x) => x !== i)) }
  function updateTestimonial(i: number, k: keyof PublicTestimonial, v: string | number | boolean | null) {
    const updated = [...(profile.testimonials ?? [])]
    updated[i] = { ...updated[i], [k]: v }
    set('testimonials', updated)
  }

  if (loading) return (
    <div className="flex items-center justify-center h-64">
      <Loader2 className="w-6 h-6 animate-spin text-fg-muted" />
    </div>
  )

  const publicUrl = profile.slug ? `${typeof window !== 'undefined' ? window.location.origin : ''}/p/${profile.slug}` : ''

  return (
    <div className="max-w-3xl mx-auto space-y-6 pb-10">
      {/* Header */}
      <div className="flex items-start justify-between gap-4 flex-wrap">
        <div>
          <h1 className="text-2xl font-bold text-fg-primary">Mi página pública</h1>
          <p className="text-fg-muted text-sm mt-1">
            Tu enlace en bio — donde los clientes te encuentran y te contactan.
          </p>
        </div>
        <div className="flex items-center gap-2 flex-wrap">
          {profile.slug && profile.is_published && (
            <a href={publicUrl} target="_blank" rel="noopener noreferrer"
               className="btn-secondary text-sm flex items-center gap-1.5">
              <ExternalLink className="w-3.5 h-3.5" /> Ver pública
            </a>
          )}
          <button onClick={save} disabled={saving}
                  className="btn-primary text-sm flex items-center gap-1.5 disabled:opacity-60">
            {saving ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Save className="w-3.5 h-3.5" />}
            Guardar
          </button>
        </div>
      </div>

      {/* Estado publicación */}
      <div className={`card p-4 flex items-center justify-between gap-4 ${profile.is_published ? 'border-emerald-500/20 bg-emerald-500/5' : 'border-amber-500/20 bg-amber-500/5'}`}>
        <div className="flex items-center gap-3">
          {profile.is_published ? (
            <Eye className="w-4 h-4 text-emerald-400" />
          ) : (
            <EyeOff className="w-4 h-4 text-amber-400" />
          )}
          <div>
            <div className={`text-sm font-semibold ${profile.is_published ? 'text-emerald-400' : 'text-amber-400'}`}>
              {profile.is_published ? 'Página publicada' : 'Página no publicada'}
            </div>
            {profile.slug && (
              <div className="text-xs text-fg-disabled">trainerboost.es/p/{profile.slug}</div>
            )}
          </div>
        </div>
        <button onClick={() => set('is_published', !profile.is_published)}
                className={`text-sm font-medium px-4 py-1.5 rounded-lg border transition-all ${profile.is_published ? 'border-emerald-500/30 text-emerald-400 hover:bg-emerald-500/10' : 'border-amber-500/30 text-amber-400 hover:bg-amber-500/10'}`}>
          {profile.is_published ? 'Despublicar' : 'Publicar'}
        </button>
      </div>

      {/* Stats */}
      {profile.is_published && (
        <div className="grid grid-cols-2 gap-4">
          <div className="card p-4 text-center">
            <div className="text-2xl font-bold font-mono text-fg-primary">{profile.views_count ?? 0}</div>
            <div className="text-xs text-fg-muted mt-1 flex items-center justify-center gap-1">
              <BarChart2 className="w-3 h-3" /> Visitas totales
            </div>
          </div>
          <div className="card p-4 text-center">
            <div className="text-2xl font-bold font-mono text-brand-primary">{profile.leads_count ?? 0}</div>
            <div className="text-xs text-fg-muted mt-1 flex items-center justify-center gap-1">
              <Star className="w-3 h-3" /> Solicitudes recibidas
            </div>
          </div>
        </div>
      )}

      {/* ── Sección: Enlace y SEO ── */}
      <Section title="Enlace y visibilidad">
        <Field label="Tu enlace personalizado *">
          <div className="flex items-center gap-0">
            <span className="bg-surface-2 border border-r-0 border-border rounded-l-lg px-3 py-2.5 text-xs text-fg-disabled whitespace-nowrap">
              trainerboost.es/p/
            </span>
            <input className="input rounded-l-none flex-1"
                   placeholder="alvaro-trainer"
                   value={profile.slug ?? ''}
                   onChange={e => set('slug', e.target.value.toLowerCase().replace(/[^a-z0-9-]/g, '-'))} />
          </div>
        </Field>
        <Field label="Título para Google (SEO)">
          <input className="input w-full" maxLength={60}
                 placeholder="Álvaro García · Entrenador Personal en Sevilla"
                 value={profile.seo_title ?? ''}
                 onChange={e => set('seo_title', e.target.value)} />
        </Field>
        <Field label="Descripción para Google (SEO)">
          <textarea className="input w-full resize-none" rows={2} maxLength={160}
                    placeholder="Entrenador personal certificado en Sevilla. Especializado en pérdida de peso y ganancia muscular. Primera sesión gratis."
                    value={profile.seo_description ?? ''}
                    onChange={e => set('seo_description', e.target.value)} />
        </Field>
      </Section>

      {/* ── Sección: Tu perfil ── */}
      <Section title="Tu presentación">
        <Field label="Titular (aparece bajo tu nombre)">
          <input className="input w-full" maxLength={100}
                 placeholder="Transforma tu físico en 90 días. Primera sesión gratis."
                 value={profile.headline ?? ''}
                 onChange={e => set('headline', e.target.value)} />
        </Field>
        <Field label="Sobre mí">
          <textarea className="input w-full resize-none" rows={5}
                    placeholder="Cuéntales quién eres, qué te diferencia y por qué deberían elegirte..."
                    value={profile.about ?? ''}
                    onChange={e => set('about', e.target.value)} />
        </Field>
      </Section>

      {/* ── Sección: Redes sociales ── */}
      <Section title="Redes sociales">
        <div className="grid sm:grid-cols-2 gap-3">
          {([
            { key: 'instagram', placeholder: 'tu_usuario' },
            { key: 'youtube',   placeholder: 'https://youtube.com/@tucanal' },
            { key: 'tiktok',    placeholder: 'tu_usuario' },
            { key: 'web',       placeholder: 'https://tuweb.com' },
          ] as const).map(({ key, placeholder }) => (
            <Field key={key} label={key.charAt(0).toUpperCase() + key.slice(1)}>
              <input className="input w-full" placeholder={placeholder}
                     value={(profile.social_links as Record<string, string>)?.[key] ?? ''}
                     onChange={e => set('social_links', { ...(profile.social_links ?? {}), [key]: e.target.value })} />
            </Field>
          ))}
        </div>
      </Section>

      {/* ── Sección: Servicios ── */}
      <Section title={`Servicios (${(profile.services ?? []).length})`}
               action={<button onClick={addService} className="btn-secondary text-xs flex items-center gap-1"><Plus className="w-3 h-3" /> Añadir</button>}>
        {(profile.services ?? []).length === 0 && (
          <p className="text-sm text-fg-disabled text-center py-4">Sin servicios. Añade los servicios que ofreces.</p>
        )}
        {(profile.services ?? []).map((s, i) => (
          <div key={i} className="card p-4 space-y-3">
            <div className="flex items-center justify-between gap-2">
              <input className="input flex-1 font-medium" placeholder="Nombre del servicio"
                     value={s.name} onChange={e => updateService(i, 'name', e.target.value)} />
              <button onClick={() => removeService(i)} className="w-8 h-8 flex items-center justify-center rounded-lg border border-semantic-error/20 text-semantic-error-text hover:bg-semantic-error/10 transition-colors shrink-0">
                <Trash2 className="w-3.5 h-3.5" />
              </button>
            </div>
            <textarea className="input w-full resize-none text-sm" rows={2} placeholder="Descripción breve"
                      value={s.description} onChange={e => updateService(i, 'description', e.target.value)} />
            <div className="grid grid-cols-3 gap-2">
              <Field label="Precio (€)">
                <input className="input w-full" type="number" min={0} placeholder="80"
                       value={s.price ?? ''} onChange={e => updateService(i, 'price', e.target.value ? Number(e.target.value) : null)} />
              </Field>
              <Field label="Duración (min)">
                <input className="input w-full" type="number" min={0} placeholder="60"
                       value={s.duration ?? ''} onChange={e => updateService(i, 'duration', e.target.value ? Number(e.target.value) : null)} />
              </Field>
              <Field label="Modalidad">
                <select className="input w-full" value={s.type}
                        onChange={e => updateService(i, 'type', e.target.value as PublicService['type'])}>
                  <option value="presencial">Presencial</option>
                  <option value="online">Online</option>
                </select>
              </Field>
            </div>
          </div>
        ))}
      </Section>

      {/* ── Sección: Testimonios ── */}
      <Section title={`Testimonios (${(profile.testimonials ?? []).length})`}
               action={<button onClick={addTestimonial} className="btn-secondary text-xs flex items-center gap-1"><Plus className="w-3 h-3" /> Añadir</button>}>
        {(profile.testimonials ?? []).length === 0 && (
          <p className="text-sm text-fg-disabled text-center py-4">Sin testimonios. Añade reseñas de tus clientes.</p>
        )}
        {(profile.testimonials ?? []).map((t, i) => (
          <div key={i} className="card p-4 space-y-3">
            <div className="flex items-center justify-between gap-2">
              <input className="input flex-1" placeholder="Nombre del cliente"
                     value={t.name} onChange={e => updateTestimonial(i, 'name', e.target.value)} />
              <button onClick={() => removeTestimonial(i)} className="w-8 h-8 flex items-center justify-center rounded-lg border border-semantic-error/20 text-semantic-error-text hover:bg-semantic-error/10 transition-colors shrink-0">
                <Trash2 className="w-3.5 h-3.5" />
              </button>
            </div>
            <textarea className="input w-full resize-none text-sm" rows={3} placeholder="Testimonio..."
                      value={t.text} onChange={e => updateTestimonial(i, 'text', e.target.value)} />
            <div className="flex items-center gap-4">
              <Field label="Valoración">
                <div className="flex gap-1">
                  {[1, 2, 3, 4, 5].map(s => (
                    <button key={s} onClick={() => updateTestimonial(i, 'stars', s)}
                            className={`text-lg transition-transform hover:scale-110 ${s <= t.stars ? 'text-semantic-warning-text' : 'text-border-bright'}`}>
                      ★
                    </button>
                  ))}
                </div>
              </Field>
              <label className="flex items-center gap-2 text-sm text-fg-muted cursor-pointer select-none">
                <input type="checkbox" checked={t.verified}
                       onChange={e => updateTestimonial(i, 'verified', e.target.checked)}
                       className="accent-brand-primary" />
                Cliente verificado
              </label>
            </div>
          </div>
        ))}
      </Section>

      {/* ── Sección: Formulario de contacto ── */}
      <Section title="Contacto y reservas">
        <label className="flex items-center gap-3 cursor-pointer">
          <input type="checkbox" checked={profile.booking_enabled ?? true}
                 onChange={e => set('booking_enabled', e.target.checked)}
                 className="accent-brand-primary" />
          <span className="text-sm text-fg-secondary">Mostrar formulario de contacto en la página</span>
        </label>
        {profile.booking_enabled && profile.calendly_url !== undefined && (
          <Field label="Link de Calendly (opcional)">
            <input className="input w-full" placeholder="https://calendly.com/tu-usuario"
                   value={profile.calendly_url ?? ''}
                   onChange={e => set('calendly_url', e.target.value)} />
          </Field>
        )}
      </Section>

      {/* Guardar (pie) */}
      <div className="flex justify-end">
        <button onClick={save} disabled={saving}
                className="btn-primary flex items-center gap-2 disabled:opacity-60">
          {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
          Guardar cambios
        </button>
      </div>
    </div>
  )
}

function Section({ title, children, action }: { title: string; children: React.ReactNode; action?: React.ReactNode }) {
  const [open, setOpen] = useState(true)
  return (
    <div className="card overflow-hidden">
      <button onClick={() => setOpen(o => !o)}
              className="w-full flex items-center justify-between p-5 text-left hover:bg-surface-2/50 transition-colors">
        <span className="font-semibold text-fg-primary text-sm">{title}</span>
        <div className="flex items-center gap-2">
          {action && <span onClick={e => e.stopPropagation()}>{action}</span>}
          {open ? <ChevronUp className="w-4 h-4 text-fg-disabled" /> : <ChevronDown className="w-4 h-4 text-fg-disabled" />}
        </div>
      </button>
      {open && <div className="px-5 pb-5 space-y-4 border-t border-border/40">{children}</div>}
    </div>
  )
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div>
      <label className="block text-xs font-medium text-fg-muted mb-1.5">{label}</label>
      {children}
    </div>
  )
}
