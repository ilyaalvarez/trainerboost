import { createClient } from '@/lib/supabase/server'
import { NextResponse } from 'next/server'

export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'

export async function GET() {
  const start = Date.now()

  let dbStatus: 'ok' | 'error' = 'ok'
  try {
    const supabase = await createClient()
    const { error } = await supabase.from('profiles').select('id').limit(1)
    if (error) dbStatus = 'error'
  } catch {
    dbStatus = 'error'
  }

  const status = dbStatus === 'ok' ? 'ok' : 'degraded'
  const code = status === 'ok' ? 200 : 503

  return NextResponse.json(
    {
      status,
      db: dbStatus,
      latency_ms: Date.now() - start,
      timestamp: new Date().toISOString(),
    },
    { status: code },
  )
}
