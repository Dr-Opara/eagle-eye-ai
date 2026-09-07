import {NextResponse} from 'next/server'
import {fetchWindyCameras} from '@/lib/cameras'

export const runtime='nodejs'

export async function GET(request:Request){
  try{
    const url=new URL(request.url)
    const limit=Number(url.searchParams.get('limit')||50)
    const offset=Number(url.searchParams.get('offset')||0)
    const payload=await fetchWindyCameras(limit,offset)
    return NextResponse.json(payload,{headers:{'Cache-Control':'public, s-maxage=300, stale-while-revalidate=600'}})
  }catch(error){
    return NextResponse.json({cameras:[],total:0,live:false,provider:'Windy Webcams',generatedAt:new Date().toISOString(),note:String(error)},{status:200,headers:{'Cache-Control':'public, s-maxage=60'}})
  }
}
