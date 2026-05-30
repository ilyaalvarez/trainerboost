import type {
  Routine, RoutineExercise, MealPlan, Meal,
  Profile, TrainerClient, ProgressLog, ClientStatus,
} from '@/types/database'

async function getPdfLibs() {
  const [{ default: jsPDF }, { default: html2canvas }] = await Promise.all([
    import('jspdf'),
    import('html2canvas'),
  ])
  return { jsPDF, html2canvas }
}

// ─── Color palette matching dark design system ────────────────────────────────

const C = {
  bg:      [15,  23, 42] as [number, number, number],
  surface: [30,  41, 59] as [number, number, number],
  primary: [14, 165,233] as [number, number, number],
  text:    [248,250,252] as [number, number, number],
  muted:   [148,163,184] as [number, number, number],
  accent:  [16, 185,129] as [number, number, number],
}

type Doc = InstanceType<typeof import('jspdf').default>

function setupPage(doc: Doc) {
  doc.setFillColor(...C.bg)
  doc.rect(0, 0, 210, 297, 'F')
}

function pageHeader(doc: Doc, title: string, clientName: string): number {
  doc.setFillColor(...C.primary)
  doc.rect(0, 0, 210, 14, 'F')
  doc.setFontSize(10)
  doc.setTextColor(255, 255, 255)
  doc.setFont('helvetica', 'bold')
  doc.text('TrainerBoost', 10, 9)
  doc.setFont('helvetica', 'normal')
  doc.text(
    new Date().toLocaleDateString('es-ES', { day: 'numeric', month: 'long', year: 'numeric' }),
    200, 9, { align: 'right' },
  )

  doc.setFontSize(20)
  doc.setFont('helvetica', 'bold')
  doc.setTextColor(...C.text)
  doc.text(title, 10, 30)

  doc.setFontSize(11)
  doc.setFont('helvetica', 'normal')
  doc.setTextColor(...C.muted)
  if (clientName) doc.text(`Cliente: ${clientName}`, 10, 37)

  return clientName ? 47 : 38
}

function pageFooter(doc: Doc) {
  doc.setFontSize(8)
  doc.setTextColor(...C.muted)
  doc.text('Generado por TrainerBoost · app.trainerboost.es', 105, 290, { align: 'center' })
}

// ─── Routine PDF ──────────────────────────────────────────────────────────────

export async function exportRoutinePdf(
  routine: Routine & { exercises: RoutineExercise[] },
  clientName: string,
) {
  const { jsPDF } = await getPdfLibs()
  const doc = new jsPDF({ orientation: 'portrait', unit: 'mm', format: 'a4' })

  setupPage(doc)
  let y = pageHeader(doc, routine.title, clientName)

  if (routine.description) {
    doc.setFontSize(9)
    doc.setTextColor(...C.muted)
    const lines = doc.splitTextToSize(routine.description, 190) as string[]
    doc.text(lines, 10, y)
    y += lines.length * 5 + 4
  }

  const exercises = routine.exercises ?? []

  if (exercises.length === 0) {
    doc.setFontSize(10)
    doc.setTextColor(...C.muted)
    doc.text('Sin ejercicios asignados.', 10, y + 8)
  } else {
    y += 4
    // Table header
    doc.setFillColor(...C.surface)
    doc.roundedRect(10, y, 190, 8, 2, 2, 'F')
    doc.setFontSize(8)
    doc.setFont('helvetica', 'bold')
    doc.setTextColor(...C.muted)
    doc.text('#',           14,  y + 5.5)
    doc.text('Ejercicio',   22,  y + 5.5)
    doc.text('Series',     120,  y + 5.5)
    doc.text('Reps',       145,  y + 5.5)
    doc.text('Descanso',   168,  y + 5.5)
    y += 10

    exercises.forEach((ex, idx) => {
      if (y > 270) {
        doc.addPage()
        setupPage(doc)
        y = 20
      }
      if (idx % 2 === 0) {
        doc.setFillColor(...C.surface)
        doc.roundedRect(10, y - 1, 190, 8, 1, 1, 'F')
      }
      doc.setFont('helvetica', 'normal')
      doc.setFontSize(9)
      doc.setTextColor(...C.text)
      doc.text(String(idx + 1), 14, y + 4.5)
      doc.text(doc.splitTextToSize(ex.name, 95) as string[], 22, y + 4.5)
      doc.setTextColor(...C.primary)
      doc.text(ex.sets != null ? String(ex.sets) : '—', 120, y + 4.5)
      doc.text(ex.reps != null ? String(ex.reps) : '—', 145, y + 4.5)
      doc.setTextColor(...C.muted)
      doc.text(ex.rest_seconds != null ? `${ex.rest_seconds}s` : '—', 168, y + 4.5)
      if (ex.notes) {
        doc.setFontSize(7)
        doc.setTextColor(...C.muted)
        doc.text(ex.notes, 22, y + 8.5)
        y += 4
      }
      y += 8
    })
  }

  pageFooter(doc)
  doc.save(`rutina-${routine.title.toLowerCase().replace(/\s+/g, '-')}.pdf`)
}

// ─── Nutrition PDF ────────────────────────────────────────────────────────────

export async function exportNutritionPdf(
  plan: MealPlan & { meals: Meal[] },
  clientName: string,
) {
  const { jsPDF } = await getPdfLibs()
  const doc = new jsPDF({ orientation: 'portrait', unit: 'mm', format: 'a4' })

  setupPage(doc)
  let y = pageHeader(doc, plan.title, clientName)

  // Macro summary boxes
  const macros: Array<{ label: string; value: string; color: [number,number,number] }> = [
    { label: 'Calorías', value: plan.calories_target ? `${plan.calories_target} kcal` : '—', color: C.primary },
    { label: 'Proteína', value: plan.protein_target  ? `${plan.protein_target}g`        : '—', color: C.accent },
    { label: 'Carbos',   value: plan.carbs_target    ? `${plan.carbs_target}g`          : '—', color: [245,158,11] },
    { label: 'Grasas',   value: plan.fat_target      ? `${plan.fat_target}g`            : '—', color: [239, 68,68] },
  ]

  y += 2
  const boxW = 44
  macros.forEach((m, i) => {
    const x = 10 + i * (boxW + 3)
    doc.setFillColor(...C.surface)
    doc.roundedRect(x, y, boxW, 16, 3, 3, 'F')
    doc.setFontSize(13)
    doc.setFont('helvetica', 'bold')
    doc.setTextColor(...m.color)
    doc.text(m.value, x + boxW / 2, y + 8, { align: 'center' })
    doc.setFontSize(8)
    doc.setFont('helvetica', 'normal')
    doc.setTextColor(...C.muted)
    doc.text(m.label, x + boxW / 2, y + 13, { align: 'center' })
  })
  y += 22

  const meals = plan.meals ?? []

  if (meals.length === 0) {
    doc.setFontSize(10)
    doc.setTextColor(...C.muted)
    doc.text('Sin comidas asignadas.', 10, y + 8)
  } else {
    for (const meal of meals) {
      if (y > 260) {
        doc.addPage()
        setupPage(doc)
        y = 20
      }

      doc.setFillColor(...C.primary)
      doc.roundedRect(10, y, 190, 9, 2, 2, 'F')
      doc.setFontSize(10)
      doc.setFont('helvetica', 'bold')
      doc.setTextColor(255, 255, 255)
      doc.text(meal.name, 14, y + 6)
      if (meal.time) {
        doc.setFontSize(8)
        doc.setFont('helvetica', 'normal')
        doc.text(meal.time, 196, y + 6, { align: 'right' })
      }
      y += 12

      // Food items
      if (meal.foods?.length) {
        meal.foods.forEach((food, fi) => {
          if (fi % 2 === 0) {
            doc.setFillColor(...C.surface)
            doc.roundedRect(10, y - 1, 190, 7, 1, 1, 'F')
          }
          doc.setFont('helvetica', 'normal')
          doc.setFontSize(8.5)
          doc.setTextColor(...C.text)
          doc.text(food.name, 14, y + 4)
          doc.setTextColor(...C.muted)
          doc.text(`${food.grams}g`, 130, y + 4)
          doc.text(`${food.calories} kcal`, 155, y + 4)
          doc.text(`P:${food.protein}g`, 180, y + 4)
          y += 7
        })
      }
      y += 4
    }
  }

  if (plan.notes) {
    if (y > 265) { doc.addPage(); setupPage(doc); y = 20 }
    doc.setFontSize(9)
    doc.setFont('helvetica', 'bold')
    doc.setTextColor(...C.text)
    doc.text('Notas:', 10, y)
    y += 6
    doc.setFont('helvetica', 'normal')
    doc.setTextColor(...C.muted)
    const lines = doc.splitTextToSize(plan.notes, 190) as string[]
    doc.text(lines, 10, y)
  }

  pageFooter(doc)
  doc.save(`plan-nutricional-${plan.title.toLowerCase().replace(/\s+/g, '-')}.pdf`)
}

// ─── Progress Report PDF ──────────────────────────────────────────────────────

const STATUS_LABEL: Record<ClientStatus, string> = {
  active: 'Activo',
  paused: 'En pausa',
  ended:  'Finalizado',
}

function sectionTitle(doc: Doc, label: string, y: number): number {
  doc.setFillColor(...C.primary)
  doc.rect(10, y, 3, 6, 'F')
  doc.setFontSize(12)
  doc.setFont('helvetica', 'bold')
  doc.setTextColor(...C.text)
  doc.text(label, 16, y + 5)
  return y + 12
}

function fmtDate(value: string): string {
  return new Date(value).toLocaleDateString('es-ES', {
    day: 'numeric', month: 'short', year: 'numeric',
  })
}

export async function exportProgressReportPdf(
  client: Profile,
  relation: TrainerClient,
  progressLogs: ProgressLog[],
  routines: (Routine & { exercises: RoutineExercise[] })[],
  mealPlan: MealPlan | null,
) {
  const { jsPDF } = await getPdfLibs()
  const doc = new jsPDF({ orientation: 'portrait', unit: 'mm', format: 'a4' })

  const ensureSpace = (needed: number, y: number): number => {
    if (y + needed > 285) {
      doc.addPage()
      setupPage(doc)
      return 20
    }
    return y
  }

  setupPage(doc)
  let y = pageHeader(doc, `Informe de Progreso`, client.full_name)

  // ── Client info row ──────────────────────────────────────────────
  y += 2
  const infoCards: Array<{ label: string; value: string }> = [
    { label: 'Estado',         value: STATUS_LABEL[relation.status] },
    { label: 'Cliente desde',  value: fmtDate(relation.started_at) },
    { label: 'Registros',      value: String(progressLogs.length) },
  ]
  const infoW = 60
  infoCards.forEach((c, i) => {
    const x = 10 + i * (infoW + 3)
    doc.setFillColor(...C.surface)
    doc.roundedRect(x, y, infoW, 16, 3, 3, 'F')
    doc.setFontSize(12)
    doc.setFont('helvetica', 'bold')
    doc.setTextColor(...C.text)
    doc.text(c.value, x + 5, y + 8)
    doc.setFontSize(8)
    doc.setFont('helvetica', 'normal')
    doc.setTextColor(...C.muted)
    doc.text(c.label.toUpperCase(), x + 5, y + 13)
  })
  y += 24

  // ── Progress summary ─────────────────────────────────────────────
  const weightLogs = progressLogs.filter(l => l.weight_kg != null)
  const firstWeight = weightLogs[0]?.weight_kg ?? null
  const lastWeight  = weightLogs[weightLogs.length - 1]?.weight_kg ?? null
  const weightDelta = firstWeight != null && lastWeight != null
    ? lastWeight - firstWeight
    : null
  const lastBodyFat = [...progressLogs].reverse().find(l => l.body_fat_pct != null)?.body_fat_pct ?? null

  y = sectionTitle(doc, 'Resumen de progreso', y)

  const summary: Array<{ label: string; value: string; color: [number, number, number] }> = [
    {
      label: 'Peso actual',
      value: lastWeight != null ? `${lastWeight} kg` : '—',
      color: C.primary,
    },
    {
      label: 'Variación',
      value: weightDelta != null
        ? `${weightDelta > 0 ? '+' : ''}${weightDelta.toFixed(1)} kg`
        : '—',
      color: weightDelta != null && weightDelta < 0 ? C.accent : [245, 158, 11],
    },
    {
      label: 'Grasa corporal',
      value: lastBodyFat != null ? `${lastBodyFat}%` : '—',
      color: [239, 68, 68],
    },
  ]
  const sumW = 60
  summary.forEach((s, i) => {
    const x = 10 + i * (sumW + 3)
    doc.setFillColor(...C.surface)
    doc.roundedRect(x, y, sumW, 18, 3, 3, 'F')
    doc.setFontSize(15)
    doc.setFont('helvetica', 'bold')
    doc.setTextColor(...s.color)
    doc.text(s.value, x + sumW / 2, y + 9, { align: 'center' })
    doc.setFontSize(8)
    doc.setFont('helvetica', 'normal')
    doc.setTextColor(...C.muted)
    doc.text(s.label, x + sumW / 2, y + 14, { align: 'center' })
  })
  y += 26

  // ── Progress history table ───────────────────────────────────────
  y = ensureSpace(20, y)
  y = sectionTitle(doc, 'Historial de progreso', y)

  if (progressLogs.length === 0) {
    doc.setFontSize(10)
    doc.setFont('helvetica', 'normal')
    doc.setTextColor(...C.muted)
    doc.text('Sin registros de progreso.', 10, y + 4)
    y += 12
  } else {
    doc.setFillColor(...C.surface)
    doc.roundedRect(10, y, 190, 8, 2, 2, 'F')
    doc.setFontSize(8)
    doc.setFont('helvetica', 'bold')
    doc.setTextColor(...C.muted)
    doc.text('Fecha',        14, y + 5.5)
    doc.text('Peso',         65, y + 5.5)
    doc.text('Grasa',        93, y + 5.5)
    doc.text('Músculo',     118, y + 5.5)
    doc.text('Cintura',     143, y + 5.5)
    doc.text('Pecho',       163, y + 5.5)
    doc.text('Brazo',       183, y + 5.5)
    y += 10

    const ordered = [...progressLogs].sort(
      (a, b) => new Date(b.logged_at).getTime() - new Date(a.logged_at).getTime(),
    )
    ordered.forEach((log, idx) => {
      y = ensureSpace(8, y)
      if (idx % 2 === 0) {
        doc.setFillColor(...C.surface)
        doc.roundedRect(10, y - 1, 190, 7, 1, 1, 'F')
      }
      doc.setFont('helvetica', 'normal')
      doc.setFontSize(8.5)
      doc.setTextColor(...C.text)
      doc.text(fmtDate(log.logged_at), 14, y + 4)
      doc.setTextColor(...C.primary)
      doc.text(log.weight_kg != null ? `${log.weight_kg}kg` : '—', 65, y + 4)
      doc.setTextColor(...C.muted)
      doc.text(log.body_fat_pct != null ? `${log.body_fat_pct}%` : '—', 93, y + 4)
      doc.text(log.muscle_mass_kg != null ? `${log.muscle_mass_kg}kg` : '—', 118, y + 4)
      doc.text(log.waist_cm != null ? `${log.waist_cm}cm` : '—', 143, y + 4)
      doc.text(log.chest_cm != null ? `${log.chest_cm}cm` : '—', 163, y + 4)
      doc.text(log.arm_cm != null ? `${log.arm_cm}cm` : '—', 183, y + 4)
      y += 7
    })
    y += 4
  }

  // ── Active routines ──────────────────────────────────────────────
  const activeRoutines = routines.filter(r => r.status === 'active')
  y = ensureSpace(20, y)
  y = sectionTitle(doc, 'Rutinas activas', y)

  if (activeRoutines.length === 0) {
    doc.setFontSize(10)
    doc.setFont('helvetica', 'normal')
    doc.setTextColor(...C.muted)
    doc.text('Sin rutinas activas.', 10, y + 4)
    y += 12
  } else {
    activeRoutines.forEach(r => {
      y = ensureSpace(9, y)
      doc.setFillColor(...C.surface)
      doc.roundedRect(10, y, 190, 8, 2, 2, 'F')
      doc.setFontSize(9.5)
      doc.setFont('helvetica', 'bold')
      doc.setTextColor(...C.text)
      doc.text(r.title, 14, y + 5.5)
      doc.setFont('helvetica', 'normal')
      doc.setTextColor(...C.muted)
      doc.text(`${r.exercises.length} ejercicios`, 196, y + 5.5, { align: 'right' })
      y += 10
    })
    y += 2
  }

  // ── Active meal plan ─────────────────────────────────────────────
  y = ensureSpace(30, y)
  y = sectionTitle(doc, 'Plan nutricional activo', y)

  if (!mealPlan) {
    doc.setFontSize(10)
    doc.setFont('helvetica', 'normal')
    doc.setTextColor(...C.muted)
    doc.text('Sin plan nutricional activo.', 10, y + 4)
    y += 12
  } else {
    doc.setFillColor(...C.primary)
    doc.roundedRect(10, y, 190, 9, 2, 2, 'F')
    doc.setFontSize(10)
    doc.setFont('helvetica', 'bold')
    doc.setTextColor(255, 255, 255)
    doc.text(mealPlan.title, 14, y + 6)
    y += 13

    const macros: Array<{ label: string; value: string; color: [number, number, number] }> = [
      { label: 'Calorías', value: mealPlan.calories_target != null ? `${mealPlan.calories_target} kcal` : '—', color: C.primary },
      { label: 'Proteína', value: mealPlan.protein_target  != null ? `${mealPlan.protein_target}g`        : '—', color: C.accent },
      { label: 'Carbos',   value: mealPlan.carbs_target    != null ? `${mealPlan.carbs_target}g`          : '—', color: [245, 158, 11] },
      { label: 'Grasas',   value: mealPlan.fat_target      != null ? `${mealPlan.fat_target}g`            : '—', color: [239, 68, 68] },
    ]
    const boxW = 44
    macros.forEach((m, i) => {
      const x = 10 + i * (boxW + 3)
      doc.setFillColor(...C.surface)
      doc.roundedRect(x, y, boxW, 16, 3, 3, 'F')
      doc.setFontSize(12)
      doc.setFont('helvetica', 'bold')
      doc.setTextColor(...m.color)
      doc.text(m.value, x + boxW / 2, y + 8, { align: 'center' })
      doc.setFontSize(8)
      doc.setFont('helvetica', 'normal')
      doc.setTextColor(...C.muted)
      doc.text(m.label, x + boxW / 2, y + 13, { align: 'center' })
    })
    y += 20
  }

  pageFooter(doc)
  doc.save(`informe-${client.full_name.replace(/\s+/g, '-').toLowerCase()}.pdf`)
}
