'use client'
import { useMemo } from 'react'
import type { Locale } from '@/messages/types'

interface PreviewApt {
  dayOffset:   number
  time:        string
  client:      string
  borderColor: string
  bg:          string
}

const PREVIEW_APTS: PreviewApt[] = [
  { dayOffset: 0, time: '09:00', client: 'Ana García',   borderColor: '#0EA5E9', bg: 'rgba(14,165,233,0.12)'  },
  { dayOffset: 0, time: '17:00', client: 'Pedro López',  borderColor: '#7C3AED', bg: 'rgba(124,58,237,0.12)'  },
  { dayOffset: 1, time: '10:30', client: 'María Fdez.',  borderColor: '#10B981', bg: 'rgba(16,185,129,0.12)'  },
  { dayOffset: 2, time: '09:00', client: 'Ana García',   borderColor: '#0EA5E9', bg: 'rgba(14,165,233,0.12)'  },
  { dayOffset: 2, time: '11:00', client: 'Sofía M.',     borderColor: '#F43F5E', bg: 'rgba(244,63,94,0.12)'   },
  { dayOffset: 3, time: '09:00', client: 'Ana García',   borderColor: '#0EA5E9', bg: 'rgba(14,165,233,0.12)'  },
  { dayOffset: 3, time: '11:30', client: 'Pedro López',  borderColor: '#7C3AED', bg: 'rgba(124,58,237,0.12)'  },
  { dayOffset: 3, time: '16:00', client: 'María Fdez.',  borderColor: '#10B981', bg: 'rgba(16,185,129,0.12)'  },
  { dayOffset: 4, time: '09:00', client: 'Sofía M.',     borderColor: '#F43F5E', bg: 'rgba(244,63,94,0.12)'   },
  { dayOffset: 4, time: '17:30', client: 'Pedro López',  borderColor: '#7C3AED', bg: 'rgba(124,58,237,0.12)'  },
]

const CALLOUTS = [
  {
    title: 'Sin más WhatsApps para quedar',
    desc:  'Cada cita de la semana en un solo sitio. Presencial, online o llamada — con el tipo, la hora y el cliente de un vistazo.',
  },
  {
    title: 'El cliente reserva, tú recibes la notificación',
    desc:  'Tus clientes gestionan sus citas desde su portal móvil. Cuando reservan o cambian, te llega una notificación al momento.',
  },
  {
    title: 'Planifica la semana en segundos',
    desc:  'Navega entre semanas, ve tu carga de trabajo real y detecta huecos para nuevos clientes sin revisar nada más.',
  },
]

const DAY_LABELS = ['L', 'M', 'X', 'J', 'V', 'S', 'D']

const NAV_ITEMS = [
  { active: false }, { active: false }, { active: false },
  { active: true  }, { active: false }, { active: false },
]

export function ProductPreview({ locale: _locale }: { locale: Locale }) {
  const weekDays = useMemo(() => {
    const today = new Date()
    const dow   = today.getDay()
    const mon   = new Date(today)
    mon.setDate(today.getDate() - (dow === 0 ? 6 : dow - 1))
    mon.setHours(0, 0, 0, 0)
    return Array.from({ length: 7 }, (_, i) => {
      const d = new Date(mon)
      d.setDate(mon.getDate() + i)
      return d
    })
  }, [])

  const todayStr = new Date().toDateString()

  return (
    <section style={{ padding: 'var(--gap-3xl) 0' }} aria-label="Vista previa de la agenda semanal">
      <div className="lp-container">

        {/* Título */}
        <div style={{ marginBottom: '48px', textAlign: 'center' }}>
          <h2 style={{
            fontFamily:  'var(--display)',
            fontWeight:  700,
            fontSize:    'clamp(1.9rem, 3.8vw, 2.8rem)',
            lineHeight:  1.1,
            color:       'var(--text)',
            marginBottom: '16px',
          }}>
            Tu semana completa,{' '}
            <span style={{ color: 'var(--brand)' }}>de un vistazo</span>
          </h2>
          <p style={{
            color:      'var(--text-dim)',
            maxWidth:   '520px',
            margin:     '0 auto',
            lineHeight: 1.65,
            fontSize:   '1rem',
          }}>
            La vista de agenda semanal que faltaba en el mercado.
            Todos tus clientes, todas tus citas — sin abrir WhatsApp.
          </p>
        </div>

        {/* Ventana de la app */}
        <div style={{
          border:       '1px solid var(--border-mid)',
          borderRadius: '12px',
          overflow:     'hidden',
          background:   'var(--surface)',
          boxShadow:    '0 0 80px rgba(143,212,58,0.05), 0 32px 64px rgba(0,0,0,0.55)',
        }}>
          {/* Chrome */}
          <div style={{
            display:       'flex',
            alignItems:    'center',
            gap:           '8px',
            padding:       '10px 16px',
            borderBottom:  '1px solid var(--border)',
            background:    'var(--surface-up)',
          }}>
            <span style={{ width: 10, height: 10, borderRadius: '50%', background: '#FF5F56', display: 'inline-block', flexShrink: 0 }} />
            <span style={{ width: 10, height: 10, borderRadius: '50%', background: '#FFBD2E', display: 'inline-block', flexShrink: 0 }} />
            <span style={{ width: 10, height: 10, borderRadius: '50%', background: '#27C93F', display: 'inline-block', flexShrink: 0 }} />
            <div style={{ flex: 1, display: 'flex', justifyContent: 'center' }}>
              <span style={{
                background:   'var(--void)',
                border:       '1px solid var(--border)',
                borderRadius: '6px',
                padding:      '3px 20px',
                fontSize:     '11px',
                color:        'var(--text-dim)',
                fontFamily:   'var(--mono)',
              }}>
                trainerboost.es/dashboard/citas
              </span>
            </div>
          </div>

          {/* Contenido */}
          <div style={{ display: 'flex', minHeight: '420px' }}>

            {/* Sidebar */}
            <div style={{
              width:          '52px',
              borderRight:    '1px solid var(--border)',
              background:     'var(--void)',
              display:        'flex',
              flexDirection:  'column',
              alignItems:     'center',
              padding:        '16px 0',
              gap:            '6px',
              flexShrink:     0,
            }}>
              <div style={{
                width: 28, height: 28, borderRadius: '6px',
                background: 'var(--brand)', marginBottom: '10px',
              }} />
              {NAV_ITEMS.map((item, i) => (
                <div key={i} style={{
                  width:        32,
                  height:       32,
                  borderRadius: '8px',
                  background:   item.active ? 'rgba(143,212,58,0.12)' : 'transparent',
                  border:       item.active ? '1px solid rgba(143,212,58,0.22)' : '1px solid transparent',
                  display:      'flex',
                  alignItems:   'center',
                  justifyContent: 'center',
                }}>
                  <div style={{
                    width:        14,
                    height:       2,
                    background:   item.active ? 'var(--brand)' : 'var(--text-faint)',
                    borderRadius: 2,
                  }} />
                </div>
              ))}
            </div>

            {/* Calendario */}
            <div style={{ flex: 1, padding: '20px', overflowX: 'auto' }}>

              {/* Cabecera */}
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '16px', gap: '12px', flexWrap: 'wrap' }}>
                <div>
                  <p style={{ fontWeight: 700, fontSize: '1.05rem', color: 'var(--text)', lineHeight: 1.2 }}>Citas</p>
                  <p style={{ fontSize: '11px', color: 'var(--text-dim)', marginTop: '3px' }}>
                    {weekDays[0].toLocaleDateString('es-ES', { day: 'numeric', month: 'short' })}
                    {' — '}
                    {weekDays[6].toLocaleDateString('es-ES', { day: 'numeric', month: 'short' })}
                    {' · '}{PREVIEW_APTS.length} citas esta semana
                  </p>
                </div>
                <div style={{ display: 'flex', gap: '4px', flexShrink: 0 }}>
                  {(['Lista', 'Semana', 'Mes'] as const).map(label => (
                    <span key={label} style={{
                      fontSize:     '11px',
                      padding:      '4px 10px',
                      borderRadius: '6px',
                      fontWeight:   label === 'Semana' ? 600 : 400,
                      background:   label === 'Semana' ? 'var(--brand)' : 'transparent',
                      color:        label === 'Semana' ? '#0A0A0A' : 'var(--text-dim)',
                      border:       label === 'Semana' ? 'none' : '1px solid var(--border)',
                    }}>
                      {label}
                    </span>
                  ))}
                </div>
              </div>

              {/* Grid semanal */}
              <div style={{
                display:             'grid',
                gridTemplateColumns: 'repeat(7, 1fr)',
                gap:                 '6px',
                minWidth:            '560px',
              }}>
                {weekDays.map((day, idx) => {
                  const isToday = day.toDateString() === todayStr
                  const dayApts = PREVIEW_APTS.filter(a => a.dayOffset === idx)

                  return (
                    <div key={idx} style={{ minHeight: '160px' }}>
                      {/* Cabecera del día */}
                      <div style={{
                        textAlign:    'center',
                        marginBottom: '8px',
                        paddingBottom: '8px',
                        borderBottom: `1px solid ${isToday ? '#8FD43A' : 'var(--border)'}`,
                      }}>
                        <p style={{
                          fontSize:      '10px',
                          color:         'var(--text-dim)',
                          textTransform: 'uppercase',
                          letterSpacing: '0.06em',
                          marginBottom:  '2px',
                        }}>
                          {DAY_LABELS[idx]}
                        </p>
                        <p style={{
                          fontSize:   '17px',
                          fontWeight: 700,
                          color:      isToday ? '#8FD43A' : 'var(--text)',
                          lineHeight: 1.2,
                        }}>
                          {day.getDate()}
                        </p>
                        {isToday && (
                          <p style={{
                            fontSize:      '8px',
                            color:         '#8FD43A',
                            fontWeight:    600,
                            textTransform: 'uppercase',
                            letterSpacing: '0.08em',
                          }}>
                            Hoy
                          </p>
                        )}
                      </div>

                      {/* Citas del día */}
                      <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                        {dayApts.length === 0 && (
                          <p style={{ fontSize: '10px', color: 'var(--text-faint)', textAlign: 'center', marginTop: '4px' }}>—</p>
                        )}
                        {dayApts.map((apt, ai) => (
                          <div key={ai} style={{
                            borderRadius: '5px',
                            padding:      '5px 6px',
                            borderLeft:   `2px solid ${apt.borderColor}`,
                            background:   apt.bg,
                          }}>
                            <p style={{ fontSize: '11px', fontWeight: 700, color: 'var(--text)', lineHeight: 1 }}>{apt.time}</p>
                            <p style={{
                              fontSize:     '10px',
                              color:        'rgba(238,245,238,0.55)',
                              marginTop:    '2px',
                              whiteSpace:   'nowrap',
                              overflow:     'hidden',
                              textOverflow: 'ellipsis',
                            }}>
                              {apt.client}
                            </p>
                          </div>
                        ))}
                      </div>
                    </div>
                  )
                })}
              </div>
            </div>
          </div>
        </div>

        {/* Callouts */}
        <div style={{
          display:             'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))',
          gap:                 '20px',
          marginTop:           '32px',
        }}>
          {CALLOUTS.map(c => (
            <div key={c.title} style={{
              padding:      '20px 24px',
              border:       '1px solid var(--border)',
              borderRadius: '10px',
              background:   'var(--surface)',
            }}>
              <p style={{ fontWeight: 700, color: 'var(--brand)', marginBottom: '8px', fontSize: '0.9rem' }}>
                {c.title}
              </p>
              <p style={{ color: 'var(--text-dim)', fontSize: '0.83rem', lineHeight: 1.65 }}>
                {c.desc}
              </p>
            </div>
          ))}
        </div>

      </div>
    </section>
  )
}
