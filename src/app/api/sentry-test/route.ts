import { NextResponse } from 'next/server'

export async function GET() {
  throw new Error('Sentry test error — TrainerBoost production verify')
  return NextResponse.json({ ok: true })
}
