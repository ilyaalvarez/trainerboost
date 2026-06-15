'use client'

import { useMemo, useRef, useEffect, useState } from 'react'
import { Flame, CalendarDays } from 'lucide-react'

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

function calcStreak(logSet: Set<string>): { current: number; max: number } {
  const today = new Date()
  today.setHours(0, 0, 0, 0)
  const todayStr = toLocalISODate(today)

  // Current streak: walk back from today (or yesterday if today has no log)
  const startFrom = new Date(today)
  if (!logSet.has(todayStr)) startFrom.setDate(startFrom.getDate() - 1)
  let current = 0
  const check = new Date(startFrom)
  while (logSet.has(toLocalISODate(check))) {
    current++
    check.setDate(check.getDate() - 1)
  }

  // Max streak across all dates
  const sorted = Array.from(logSet).sort()
  let max = 0
  let streak = 0
  for (let i = 0; i < sorted.length; i++) {
    if (i === 0) { streak = 1 }
    else {
      const prev = new Date(sorted[i - 1] + 'T00:00:00')
      const curr = new Date(sorted[i] + 'T00:00:00')
      const diff = Math.round((curr.getTime() - prev.getTime()) / 86400000)
      streak = diff === 1 ? streak + 1 : 1
    }
    if (streak > max) max = streak
  }
  if (current > max) max = current

  return { current, max }
}

export function ActivityHeatmap({ logDates, weeks = 16 }: Props) {
  const containerRef = useRef<HTMLDivElement>(null)
  const [cellSize, setCellSize] = useState(14)

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

  const { grid, monthLabels, stats, totalActive } = useMemo(() => {
    // Count entries per day for intensity
    const logMap = new Map<string, number>()
    logDates.forEach(d => {
      const key = d.slice(0, 10)
      logMap.set(key, (logMap.get(key) ?? 0) + 1)
    })
    const logSet = new Set(logMap.keys())

    const today = new Date()
    today.setHours(0, 0, 0, 0)
    const todayStr = toLocalISODate(today)

    // Align end to Sunday so each column is a full Mon–Sun week
    const dayOfWeek = today.getDay()
    const daysToSunday = dayOfWeek === 0 ? 0 : 7 - dayOfWeek
    const endDate = new Date(today)
    endDate.setDate(today.getDate() + daysToSunday)

    const startDate = new Date(endDate)
    startDate.setDate(endDate.getDate() - weeks * 7 + 1)
    const startStr = toLocalISODate(startDate)

    const cols: { date: string; count: number; isFuture: boolean; isToday: boolean }[][] = []
    const months: { label: string; colIdx: number }[] = []
    let prevMonth = -1
    let windowActive = 0

    for (let w = 0; w < weeks; w++) {
      const col: { date: string; count: number; isFuture: boolean; isToday: boolean }[] = []
      for (let d = 0; d < 7; d++) {
        const date = new Date(startDate)
        date.setDate(startDate.getDate() + w * 7 + d)
        const dateStr = toLocalISODate(date)
        const count = logMap.get(dateStr) ?? 0
        if (count > 0 && dateStr >= startStr && dateStr <= todayStr) windowActive++
        col.push({ date: dateStr, count, isFuture: dateStr > todayStr, isToday: dateStr === todayStr })
        if (d === 0 && date.getMonth() !== prevMonth) {
          const label = date.toLocaleString('es-ES', { month: 'short' }).replace('.', '')
          months.push({ label, colIdx: w })
          prevMonth = date.getMonth()
        }
      }
      cols.push(col)
    }

    return { grid: cols, monthLabels: months, stats: calcStreak(logSet), totalActive: windowActive }
  }, [logDates, weeks])

  function cellColor(count: number, isFuture: boolean): string {
    if (isFuture) return 'rgba(30,41,59,0.2)'
    if (count === 0) return 'rgba(51,65,85,0.45)'
    if (count === 1) return 'rgba(16,185,129,0.40)'
    if (count <= 2) return 'rgba(16,185,129,0.65)'
    return '#10B981'
  }

  const GAP = 3
  const DAY_LABEL_W = 22
  const cellTotal = cellSize + GAP

  return (
    <div ref={containerRef} className="w-full space-y-3">

      {/* Stats row */}
      <div className="flex items-center gap-4 flex-wrap">
        <div className="flex items-center gap-1.5">
          <Flame
            size={13}
            className={stats.current > 0 ? 'text-orange-400' : 'text-slate-600'}
          />
          <span className="text-xs text-slate-400">
            Racha:{' '}
            <span className={`font-semibold ${stats.current > 0 ? 'text-orange-400' : 'text-slate-500'}`}>
              {stats.current}d
            </span>
          </span>
        </div>
        <div className="flex items-center gap-1.5">
          <CalendarDays size={13} className="text-slate-600" />
          <span className="text-xs text-slate-400">
            <span className="font-semibold text-slate-300">{totalActive}</span>{' '}
            {totalActive === 1 ? 'día activo' : 'días activos'}
          </span>
        </div>
        {stats.max > 1 && (
          <span className="text-[11px] text-slate-600">
            · máx. racha <span className="text-slate-500">{stats.max}d</span>
          </span>
        )}
      </div>

      {/* Month labels — absolutely positioned so they never truncate */}
      <div className="relative h-4" style={{ paddingLeft: DAY_LABEL_W + GAP }}>
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
                  title={`${cell.date}${cell.count > 0 ? ` · ${cell.count} registro${cell.count > 1 ? 's' : ''}` : ''}`}
                  className="rounded-sm cursor-default transition-opacity hover:opacity-75"
                  style={{
                    width: cellSize,
                    height: cellSize,
                    background: cellColor(cell.count, cell.isFuture),
                    outline: cell.isToday ? '2px solid rgba(255,255,255,0.4)' : undefined,
                    outlineOffset: cell.isToday ? '1px' : undefined,
                  }}
                />
              ))}
            </div>
          ))}
        </div>
      </div>

      {/* Legend */}
      <div className="flex items-center gap-1.5" style={{ paddingLeft: DAY_LABEL_W + GAP }}>
        <span className="text-[10px] text-slate-600">Menos</span>
        {[
          'rgba(51,65,85,0.45)',
          'rgba(16,185,129,0.40)',
          'rgba(16,185,129,0.65)',
          '#10B981',
        ].map((c, i) => (
          <div key={i} className="rounded-sm" style={{ width: 11, height: 11, background: c }} />
        ))}
        <span className="text-[10px] text-slate-600">Más</span>
      </div>
    </div>
  )
}
