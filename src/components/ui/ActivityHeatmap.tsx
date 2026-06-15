'use client'

import { useMemo, useRef, useEffect, useState } from 'react'

interface Props {
  /** ISO date strings like "2025-05-31T..." from progress_logs.logged_at */
  logDates: string[]
  /** Number of weeks to show (default 16) */
  weeks?: number
}

const DAYS = ['L', 'M', 'X', 'J', 'V', 'S', 'D']

function toLocalISODate(d: Date) {
  const y = d.getFullYear()
  const m = String(d.getMonth() + 1).padStart(2, '0')
  const day = String(d.getDate()).padStart(2, '0')
  return `${y}-${m}-${day}`
}

export function ActivityHeatmap({ logDates, weeks = 16 }: Props) {
  const containerRef = useRef<HTMLDivElement>(null)
  const [cellSize, setCellSize] = useState(14)

  // Measure container width and derive cell size
  useEffect(() => {
    const DAY_LABEL_W = 22
    const GAP = 3

    function measure() {
      if (!containerRef.current) return
      const available = containerRef.current.clientWidth - DAY_LABEL_W - GAP
      const size = Math.floor((available - (weeks - 1) * GAP) / weeks)
      setCellSize(Math.max(10, Math.min(size, 18)))
    }

    measure()
    const ro = new ResizeObserver(measure)
    if (containerRef.current) ro.observe(containerRef.current)
    return () => ro.disconnect()
  }, [weeks])

  const { grid, monthLabels } = useMemo(() => {
    const logSet = new Set(logDates.map(d => d.slice(0, 10)))

    const today = new Date()
    today.setHours(0, 0, 0, 0)

    // Align end to Sunday so each column is a full Mon–Sun week
    const dayOfWeek = today.getDay()
    const daysToSunday = dayOfWeek === 0 ? 0 : 7 - dayOfWeek
    const endDate = new Date(today)
    endDate.setDate(today.getDate() + daysToSunday)

    const startDate = new Date(endDate)
    startDate.setDate(endDate.getDate() - weeks * 7 + 1)

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
        col.push({ date: dateStr, hasLog: logSet.has(dateStr), isFuture: dateStr > todayStr })
        if (d === 0 && date.getMonth() !== prevMonth) {
          // Remove trailing dot from Spanish short month names (e.g. "ene." → "ene")
          const label = date.toLocaleString('es-ES', { month: 'short' }).replace('.', '')
          months.push({ label, colIdx: w })
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

  const GAP = 3
  const DAY_LABEL_W = 22
  const cellTotal = cellSize + GAP

  return (
    <div ref={containerRef} className="w-full">

      {/* Month labels — absolutely positioned so they never truncate */}
      <div className="relative h-4 mb-1" style={{ paddingLeft: DAY_LABEL_W + GAP }}>
        {monthLabels.map((m, i) => (
          <span
            key={i}
            className="absolute text-[10px] text-slate-500 capitalize whitespace-nowrap"
            style={{ left: DAY_LABEL_W + GAP + m.colIdx * cellTotal }}
          >
            {m.label}
          </span>
        ))}
      </div>

      {/* Grid */}
      <div className="flex">

        {/* Day labels — match cell height exactly */}
        <div className="flex flex-col shrink-0" style={{ width: DAY_LABEL_W, gap: GAP, marginRight: GAP }}>
          {DAYS.map((day, i) => (
            <div
              key={i}
              className="text-[10px] text-slate-600 flex items-center justify-end"
              style={{ height: cellSize }}
            >
              {i % 2 === 0 ? day : ''}
            </div>
          ))}
        </div>

        {/* Cells */}
        <div className="flex" style={{ gap: GAP }}>
          {grid.map((col, colIdx) => (
            <div key={colIdx} className="flex flex-col" style={{ gap: GAP }}>
              {col.map((cell, rowIdx) => (
                <div
                  key={rowIdx}
                  title={`${cell.date}${cell.hasLog ? ' · registro de progreso' : ''}`}
                  className="rounded-[2px] cursor-default transition-opacity hover:opacity-80"
                  style={{ width: cellSize, height: cellSize, background: cellColor(cell) }}
                />
              ))}
            </div>
          ))}
        </div>
      </div>

      {/* Legend */}
      <div className="flex items-center gap-2 mt-2" style={{ paddingLeft: DAY_LABEL_W + GAP }}>
        <span className="text-[10px] text-slate-600">Menos</span>
        {['rgba(51,65,85,0.6)', 'rgba(16,185,129,0.3)', 'rgba(16,185,129,0.6)', '#10B981'].map((c, i) => (
          <div key={i} className="rounded-sm" style={{ width: 12, height: 12, background: c }} />
        ))}
        <span className="text-[10px] text-slate-600">Más</span>
      </div>
    </div>
  )
}
