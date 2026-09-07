export type RansomwareVictim = {
  id: string
  victim: string
  group: string
  country: string
  sector?: string
  discoveredAt: string
  attackDate?: string
  source: 'Ransomware.live'
  sourceUrl: string
  confidence: 'OSINT Claim'
}

const pick = (o:any, ...keys:string[]) => keys.map(k=>o?.[k]).find(v=>v != null && v !== '')

function normalizeRows(payload:any): any[] {
  if (Array.isArray(payload)) return payload
  for (const key of ['victims','data','results','posts']) if (Array.isArray(payload?.[key])) return payload[key]
  return []
}

function normalizeVictim(row:any, i:number): RansomwareVictim {
  const victim = String(pick(row,'victim','post_title','name','company') || 'Undisclosed victim')
  const group = String(pick(row,'group_name','group','ransomware_group') || 'Unknown group')
  const country = String(pick(row,'country','country_code','countrycode') || 'Unknown')
  const discovered = String(pick(row,'discovered','published','date','created_at','timestamp') || new Date().toISOString())
  return {
    id: String(pick(row,'id','post_id') || `${group}-${victim}-${discovered}-${i}`),
    victim,
    group,
    country,
    sector: pick(row,'sector','activity','industry'),
    discoveredAt: new Date(discovered).toString() === 'Invalid Date' ? new Date().toISOString() : new Date(discovered).toISOString(),
    attackDate: pick(row,'attackdate','attack_date'),
    source: 'Ransomware.live',
    sourceUrl: 'https://www.ransomware.live/',
    confidence: 'OSINT Claim',
  }
}

export async function fetchRansomwareLive(limit=100): Promise<{items:RansomwareVictim[]; backend:string}> {
  const proKey = process.env.RANSOMWARELIVE_API_KEY
  const candidates: Array<{url:string; headers?:Record<string,string>; backend:string}> = []
  if (proKey) candidates.push({url:'https://api-pro.ransomware.live/victims/recent',headers:{'X-API-KEY':proKey},backend:'API PRO'})
  candidates.push(
    {url:'https://data.ransomware.live/posts.json',backend:'Public data feed'},
    {url:'https://api.ransomware.live/v2/recentvictims',backend:'API v2'}
  )
  let lastError = 'No backend attempted'
  for (const candidate of candidates) {
    try {
      const res = await fetch(candidate.url, { next:{revalidate:300}, headers:{'User-Agent':'EagleEye/0.1 defensive-security-research',...(candidate.headers||{})} })
      if (!res.ok) { lastError = `${candidate.backend} ${res.status}`; continue }
      const payload = await res.json()
      const rows = normalizeRows(payload)
      if (!rows.length) { lastError = `${candidate.backend} empty`; continue }
      const items = rows.map(normalizeVictim).sort((a,b)=>Date.parse(b.discoveredAt)-Date.parse(a.discoveredAt)).slice(0,limit)
      return {items, backend:candidate.backend}
    } catch (e) { lastError = String(e) }
  }
  throw new Error(lastError)
}
