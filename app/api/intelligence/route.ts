import { NextResponse } from 'next/server'
import { getLiveIntel } from '@/lib/intelligence'

export const runtime = 'nodejs'

export async function GET() {
  const payload = await getLiveIntel()
  return NextResponse.json(payload, {
    headers: {
      'Cache-Control': 'public, s-maxage=300, stale-while-revalidate=900',
    },
  })
}
