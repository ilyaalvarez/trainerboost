'use client'

import { useMemo } from 'react'

interface Props {
  /** ISO date strings like "2025-05-31T..." from progress_logs.logged_at */
  logDates: string[]
  /** Number of weeks to show (default 16) */
  weeks?: number
}

const DAYS = ['L', 'M', 'X', 'J', 'V', 'S', 'D'] // Mon–Sun labels

function toLocalISODate(d: Date) {
  const y = d.getFullYear()
  const m = String(d.getMonth() + 1).padStart(2, '0')
  const day = String(d.getDate()).padStart(2, '0')
  return `${y}-${m}-${day}`
}

export function ActivityHeatmap({ logDates, weeks = 16 }: Props) {
  const { grid, monthLabels } = useMemo(() => {
    const logSet = new Set(logDates.map(d => d.slice(0, 10)))

    // Build a grid of `weeks` × 7 days ending today
    const today = new Date()
    today.setHours(0, 0, 0, 0)

    // Align end date to Sunday (end of current week)
    const dayOfWeek = today.getDay() // 0=Sun, 1=Mon … 6=Sat
    // We want Mon as start of week. Move today to end of current Mon-Sun week (Sunday).
    const daysToSunday = dayOfWeek === 0 ? 0 : 7 - dayOfWeek
    const endDate = new Date(today)
    endDate.setDate(today.getDate() + daysToSunday)

    const totalDays = weeks * 7
    const startDate = new Date(endDate)
    startDate.setDate(endDate.getDate() - totalDays + 1)

    // Build columns (each column = one week Mon-Sun)
    const cols: { date: string; hasLog: boolean; isFuture: boolean }[][] = []
    const todayStr = toLocalISODate(today)
    const months: { label: string; colIdx: number }[] = []
    let prevMonth = -1

    for (let w = 0; w < weeks; w++) {
      const col: { date: string; hasLog: boolean; isFuture: boolean }[] = []
      for (let d = 0; d < 7; d++) {
        const date = new Date(startDate)
        date.setDate(startDate.getDate() + w * 7 + d)
        const dateStr = toLocalISODate(date)
        col.push({
          date: dateStr,
          hasLog: logSet.has(dateStr),
          isFuture: dateStr > todayStr,
        })
        if (d === 0 && date.getMonth() !== prevMonth) {
          months.push({ label: date.toLocaleString('es-ES', { month: 'short' }), colIdx: w })
          prevMonth = date.getMonth()
        }
      }
      cols.push(col)
    }

    return { grid: cols, monthLabels: months }
  }, [logDates, weeks])

  function cellColor(cell: { hasLog: boolean; isFuture: boolean }) {
    if (cell.isFuture) return 'rgba(30,41,59,0.3)'
    if (cell.hasLog)   return '#10B981'
    return 'rgba(51,65,85,0.6)'
  }

  return (
    <div className="overflow-x-auto">
      <div className="min-w-max">
        {/* Month labels */}
        <div className="flex mb-1 pl-6">
          {grid.map((_, colIdx) => {
            const m = monthLabels.find(ml => ml.colIdx === colIdx)
            return (
              <div key={colIdx} className="w-[14px] mr-[3px] text-[9px] text-slate-500 capitalize truncate">
                {m ? m.label : ''}
              </div>
            )
          })}
        </div>

        {/* Grid */}
        <div className="flex gap-0">
          {/* Day labels */}
          <div className="flex flex-col gap-[3px] mr-1.5 pt-0.5">
            {DAYS.map((day, i) => (
              <div key={i} className="h-[14px] text-[9px] text-slate-600 flex items-center">
                {i % 2 === 0 ? day : ''}
              </div>
            ))}
          </div>

          {/* Cells */}
          {grid.map((col, colIdx) => (
            <div key={colIdx} className="flex flex-col gap-[3px] mr-[3px]">
              {col.map((cell, rowIdx) => (
                <div
                  key={rowIdx}
                  title={cell.date + (cell.hasLog ? ' · registro de progreso' : '')}
                  className="w-[14px] h-[14px] rounded-[3px] transition-colors cursor-default"
                  style={{ background: cellColor(cell) }}
                />
              ))}
            </div>
          ))}
        </div>

        {/* Legend */}
        <div className="flex items-center gap-2 mt-2 pl-6">
          <span className="text-[10px] text-slate-600">Menos</span>
          {['rgba(51,65,85,0.6)', 'rgba(16,185,129,0.3)', 'rgba(16,185,129,0.6)', '#10B981'].map((c, i) => (
            <div key={i} className="w-[12px] h-[12px] rounded-sm" style={{ background: c }} />
          ))}
          <span className="text-[10px] text-slate-600">Más</span>
        </div>
      </div>
    </div>
  )
}
