'use client'

// NOTE: Requires the 'progress-photos' Supabase Storage bucket to be created
// via the Supabase dashboard (Storage → New bucket → "progress-photos", public).

import { useState, useRef } from 'react'
import Image from 'next/image'
import { createClient } from '@/lib/supabase/client'
import { toast } from 'sonner'
import { Camera, X, Loader2 } from 'lucide-react'

interface Props {
  logId: string
  existing: string[]
  onUpdated: (urls: string[]) => void
  onPhotoClick?: (url: string) => void
}

export function PhotoUpload({ logId, existing, onUpdated, onPhotoClick }: Props) {
  const [uploading, setUploading] = useState(false)
  const fileRef = useRef<HTMLInputElement>(null)
  const supabase = createClient()

  const upload = async (file: File) => {
    if (!file.type.startsWith('image/')) { toast.error('Solo se permiten imágenes'); return }
    if (file.size > 5 * 1024 * 1024) { toast.error('Imagen demasiado grande (máx 5MB)'); return }
    setUploading(true)
    const ext = file.name.split('.').pop() ?? 'jpg'
    const path = `progress/${logId}/${Date.now()}.${ext}`
    const { error: upErr } = await supabase.storage.from('progress-photos').upload(path, file, { upsert: false })
    if (upErr) { toast.error('Error al subir foto'); setUploading(false); return }
    const { data: { publicUrl } } = supabase.storage.from('progress-photos').getPublicUrl(path)
    const newUrls = [...existing, publicUrl]
    const { error: dbErr } = await supabase.from('progress_logs').update({ photos: newUrls }).eq('id', logId)
    if (dbErr) { toast.error('Error al guardar'); setUploading(false); return }
    onUpdated(newUrls)
    toast.success('Foto guardada ✓')
    setUploading(false)
  }

  const remove = async (url: string) => {
    const newUrls = existing.filter(u => u !== url)
    await supabase.from('progress_logs').update({ photos: newUrls }).eq('id', logId)
    onUpdated(newUrls)
  }

  return (
    <div>
      <div className="flex flex-wrap gap-2 mb-2">
        {existing.map(url => (
          <div key={url} className="relative group">
            <button onClick={() => onPhotoClick?.(url)} className="block focus:outline-none focus:ring-2 focus:ring-sky-500 rounded-xl">
              <Image src={url} alt="Progreso" width={80} height={80} className="object-cover rounded-xl border border-slate-700 hover:border-sky-500 transition-colors cursor-zoom-in" />
            </button>
            <button onClick={() => remove(url)}
              className="absolute -top-1.5 -right-1.5 w-5 h-5 bg-red-500 rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity z-10">
              <X className="w-3 h-3 text-white" />
            </button>
          </div>
        ))}
        <button onClick={() => fileRef.current?.click()} disabled={uploading}
          className="w-20 h-20 rounded-xl border-2 border-dashed border-slate-600 hover:border-sky-500 flex flex-col items-center justify-center gap-1 transition-colors text-slate-500 hover:text-sky-400">
          {uploading ? <Loader2 className="w-5 h-5 animate-spin" /> : <Camera className="w-5 h-5" />}
          <span className="text-[10px]">{uploading ? 'Subiendo' : 'Añadir'}</span>
        </button>
      </div>
      <input ref={fileRef} type="file" accept="image/*" capture="environment" className="hidden"
        onChange={e => { const f = e.target.files?.[0]; if (f) upload(f); e.target.value = '' }} />
    </div>
  )
}
