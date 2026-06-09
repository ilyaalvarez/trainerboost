import { ImageResponse } from 'next/og'

export const runtime = 'edge'
export const alt = 'TrainerBoost — Gestiona tu negocio de entrenamiento personal'
export const size = { width: 1200, height: 630 }
export const contentType = 'image/png'

export default function OGImage() {
  return new ImageResponse(
    (
      <div
        style={{
          background: '#0A0A0A',
          width: '100%',
          height: '100%',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'flex-start',
          justifyContent: 'center',
          padding: '80px',
          fontFamily: 'system-ui, sans-serif',
          position: 'relative',
          overflow: 'hidden',
        }}
      >
        <div style={{
          position: 'absolute', top: -100, left: -100,
          width: 600, height: 600, borderRadius: '50%',
          background: 'radial-gradient(circle, rgba(143,212,58,0.12) 0%, transparent 70%)',
        }} />
        <div style={{
          position: 'absolute', bottom: -150, right: -100,
          width: 500, height: 500, borderRadius: '50%',
          background: 'radial-gradient(circle, rgba(124,58,237,0.10) 0%, transparent 70%)',
        }} />

        <div style={{ display: 'flex', alignItems: 'center', gap: 16, marginBottom: 48 }}>
          <div style={{
            width: 56, height: 56, borderRadius: 16,
            background: 'linear-gradient(135deg, #8FD43A, #7C3AED)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
          }}>
            <span style={{ color: 'black', fontSize: 28, fontWeight: 900 }}>⚡</span>
          </div>
          <span style={{ color: 'white', fontSize: 32, fontWeight: 800, letterSpacing: '-1px' }}>
            TrainerBoost
          </span>
        </div>

        <div style={{
          fontSize: 62, fontWeight: 800, color: 'white',
          lineHeight: 1.1, letterSpacing: '-2px', marginBottom: 24, maxWidth: 900,
        }}>
          {'Deja de gestionar clientes'}
          <span style={{ color: '#8FD43A' }}>{' por WhatsApp'}</span>
        </div>

        <div style={{
          fontSize: 26, color: '#94A3B8', maxWidth: 700,
          lineHeight: 1.4, marginBottom: 56,
        }}>
          La plataforma para entrenadores personales. Rutinas, nutrición, citas y pagos en un solo lugar.
        </div>

        <div style={{ display: 'flex', gap: 16 }}>
          {['Gratis para empezar', 'Desde 19€/mes', 'Hecho en España'].map(pill => (
            <div key={pill} style={{
              padding: '10px 20px', borderRadius: 100,
              background: 'rgba(255,255,255,0.06)',
              border: '1px solid rgba(255,255,255,0.12)',
              color: '#CBD5E1', fontSize: 18, fontWeight: 600,
            }}>
              {pill}
            </div>
          ))}
        </div>

        <div style={{
          position: 'absolute', bottom: 48, right: 80,
          color: '#475569', fontSize: 20, fontWeight: 500,
        }}>
          trainerboost.es
        </div>
      </div>
    ),
    { ...size }
  )
}
