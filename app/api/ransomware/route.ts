import { NextResponse } from 'next/server'
import { fetchRansomwareLive } from '@/lib/ransomware'

export const runtime = 'nodejs'

export async function GET() {
  try {
    const result = await fetchRansomwareLive(100)
    return NextResponse.json({...result, live:true, generatedAt:new Date().toISOString()}, {headers:{'Cache-Control':'public, s-maxage=300, stale-while-revalidate=900'}})
  } catch (error) {
    return NextResponse.json({items:[], live:false, backend:'Unavailable', error:String(error), generatedAt:new Date().toISOString()}, {status:200,headers:{'Cache-Control':'public, s-maxage=60'}})
  }
}
