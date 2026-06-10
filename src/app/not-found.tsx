import Link from 'next/link'
import { Zap, Home, LayoutDashboard } from 'lucide-react'

export default function NotFound() {
  return (
    <div className="min-h-screen bg-background flex flex-col items-center justify-center text-center p-8">
      <div
        className="w-16 h-16 rounded-2xl flex items-center justify-center mb-8 shadow-glow-primary"
        style={{ background: '#8FD43A' }}
      >
        <Zap className="w-8 h-8 text-white" />
      </div>

      <div className="text-8xl font-bold font-mono gradient-text mb-4 leading-none">404</div>
      <h1 className="text-2xl font-bold text-white mb-3">Página no encontrada</h1>
      <p className="text-slate-400 text-sm mb-10 max-w-sm leading-relaxed">
        La página que buscas no existe o ha sido movida a otra dirección.
      </p>

      <div className="flex flex-col sm:flex-row gap-3">
        <Link href="/" className="btn-gradient px-6 py-2.5">
          <Home className="w-4 h-4" /> Ir al inicio
        </Link>
        <Link href="/dashboard" className="btn-secondary px-6 py-2.5">
          <LayoutDashboard className="w-4 h-4" /> Ir al dashboard
        </Link>
      </div>
    </div>
  )
}
