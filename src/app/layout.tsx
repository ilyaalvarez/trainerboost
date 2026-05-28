import type { Metadata } from 'next'
import { Toaster } from 'sonner'
import './globals.css'

export const metadata: Metadata = {
  title: 'TrainerBoost — Gestión de clientes para entrenadores',
  description: 'La plataforma SaaS para entrenadores personales que quieren escalar su negocio.',
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="es" className="dark">
      <body>
        {children}
        <Toaster
          theme="dark"
          position="top-right"
          toastOptions={{
            style: {
              background: '#1E293B',
              border: '1px solid #334155',
              color: '#F1F5F9',
            },
          }}
        />
      </body>
    </html>
  )
}
