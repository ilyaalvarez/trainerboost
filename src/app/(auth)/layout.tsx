export default function AuthLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen bg-surface-light">
      <div className="relative z-10">
        {children}
      </div>
    </div>
  )
}
