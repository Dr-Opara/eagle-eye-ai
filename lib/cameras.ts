export type PublicCamera={
  id:string
  title:string
  city:string
  region:string
  country:string
  countryCode:string
  continent:string
  lat:number
  lon:number
  live:boolean
  imageUrl?:string
  playerUrl?:string
  detailUrl:string
  categories:string[]
  provider:'Windy Webcams'
}

export type CameraPayload={
  cameras:PublicCamera[]
  total:number
  live:boolean
  provider:string
  generatedAt:string
  note?:string
}

export async function fetchWindyCameras(limit=50,offset=0):Promise<CameraPayload>{
  const key=process.env.WINDY_WEBCAMS_API_KEY
  if(!key)return {cameras:[],total:0,live:false,provider:'Windy Webcams',generatedAt:new Date().toISOString(),note:'WINDY_WEBCAMS_API_KEY is not configured.'}
  const safeLimit=Math.max(1,Math.min(50,limit))
  const safeOffset=Math.max(0,offset)
  const url=`https://api.windy.com/webcams/api/v3/webcams?limit=${safeLimit}&offset=${safeOffset}&include=categories,images,location,player,urls&lang=en`
  const res=await fetch(url,{headers:{'X-WINDY-API-KEY':key},cache:'no-store'})
  if(!res.ok)throw new Error(`Windy Webcams API ${res.status}`)
  const data=await res.json() as any
  const webcams=Array.isArray(data.webcams)?data.webcams:[]
  const cameras:PublicCamera[]=webcams.flatMap((w:any)=>{
    const loc=w.location||{}
    if(!Number.isFinite(loc.latitude)||!Number.isFinite(loc.longitude))return []
    return [{
      id:String(w.webcamId),title:String(w.title||'Public webcam'),city:String(loc.city||''),region:String(loc.region||''),country:String(loc.country||''),countryCode:String(loc.country_code||''),continent:String(loc.continent||''),lat:Number(loc.latitude),lon:Number(loc.longitude),live:Boolean(w.player?.live),imageUrl:w.images?.current?.preview||w.images?.current?.small||w.images?.current?.icon,playerUrl:w.player?.live||w.player?.day,detailUrl:String(w.urls?.detail||'https://www.windy.com/webcams'),categories:Array.isArray(w.categories)?w.categories.map((c:any)=>String(c.name||c.id)).filter(Boolean):[],provider:'Windy Webcams' as const
    }]
  })
  return {cameras,total:Number(data.total||cameras.length),live:true,provider:'Windy Webcams',generatedAt:new Date().toISOString()}
}
