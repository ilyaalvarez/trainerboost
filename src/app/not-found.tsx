import Link from 'next/link'
import { Zap, ArrowLeft } from 'lucide-react'

export default function NotFound() {
  return (
    <div className="min-h-screen bg-background flex flex-col items-center justify-center text-center p-8">
      <div className="w-20 h-20 rounded-2xl bg-brand-primary/10 border border-brand-primary/20 flex items-center justify-center mb-8">
        <Zap className="w-10 h-10 text-brand-primary" />
      </div>
      <h1 className="text-6xl font-bold font-mono text-brand-primary mb-4">404</h1>
      <h2 className="text-2xl font-bold text-white mb-3">Página no encontrada</h2>
      <p className="text-slate-400 text-sm mb-8 max-w-sm">
        La página que buscas no existe o ha sido movida.
      </p>
      <Link href="/dashboard" className="btn-primary">
        <ArrowLeft className="w-4 h-4" /> Volver al dashboard
      </Link>
    </div>
  )
}
