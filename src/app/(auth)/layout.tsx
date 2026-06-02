export default function AuthLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen" style={{ background: '#F7F8FA' }}>
      <div className="relative z-10">
        {children}
      </div>
    </div>
  )
}
/* ✓ REDISEÑADO: Auth layout light — fondo #F7F8FA, sin orbs ni grid overlay */
