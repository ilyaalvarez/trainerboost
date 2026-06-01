import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Contacto y Demo',
  description: 'Solicita una demo personalizada de TrainerBoost o escríbenos tu consulta. Te respondemos en menos de 24 horas.',
}

export default function ContactLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>
}
