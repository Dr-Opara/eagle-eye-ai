export type IntelSeverity = 'critical' | 'high' | 'medium' | 'low'
export type IntelSource = 'CISA KEV' | 'NVD' | 'ThreatFox' | 'EagleEye Demo'

export type IntelItem = {
  id: string
  title: string
  summary: string
  tag: 'KEV' | 'CVE' | 'ADVISORY' | 'IOC' | 'RANSOMWARE' | 'OSINT'
  severity: IntelSeverity
  source: IntelSource
  sourceUrl: string
  publishedAt: string
  observedAt: string
  confidence: 'Confirmed' | 'High' | 'Medium' | 'Demo'
  provenance: 'Official Government Feed' | 'Public Vulnerability Database' | 'Simulated'
  cve?: string
  vendor?: string
  product?: string
  ransomwareUse?: boolean
}

export const demoIntel: IntelItem[] = [
  {
    id: 'demo-ransomware-1',
    title: 'Modeled ransomware infrastructure activity across multiple regions',
    summary: 'Simulated signal used when live upstream intelligence is temporarily unavailable.',
    tag: 'RANSOMWARE', severity: 'critical', source: 'EagleEye Demo', sourceUrl: '',
    publishedAt: new Date(0).toISOString(), observedAt: new Date().toISOString(),
    confidence: 'Demo', provenance: 'Simulated', ransomwareUse: true,
  },
  {
    id: 'demo-ioc-1',
    title: 'Modeled command-and-control indicators correlated to an intrusion set',
    summary: 'Prototype-only intelligence event. Not a verified real-world attack.',
    tag: 'IOC', severity: 'high', source: 'EagleEye Demo', sourceUrl: '',
    publishedAt: new Date(0).toISOString(), observedAt: new Date().toISOString(),
    confidence: 'Demo', provenance: 'Simulated',
  },
]

const severityFromCvss = (score?: number): IntelSeverity => {
  if (score == null) return 'medium'
  if (score >= 9) return 'critical'
  if (score >= 7) return 'high'
  if (score >= 4) return 'medium'
  return 'low'
}

export async function fetchCisaKev(limit = 12): Promise<IntelItem[]> {
  const url = 'https://www.cisa.gov/sites/default/files/feeds/known_exploited_vulnerabilities.json'
  const res = await fetch(url, { next: { revalidate: 900 }, headers: { 'User-Agent': 'EagleEye/0.1 defensive-security-research' } })
  if (!res.ok) throw new Error(`CISA KEV ${res.status}`)
  const data = await res.json() as { vulnerabilities?: Array<any> }
  const now = new Date().toISOString()
  return (data.vulnerabilities ?? [])
    .slice()
    .sort((a, b) => String(b.dateAdded).localeCompare(String(a.dateAdded)))
    .slice(0, limit)
    .map((v) => ({
      id: `cisa-${v.cveID}`,
      title: `${v.cveID}: ${v.vulnerabilityName || 'Known exploited vulnerability'}`,
      summary: v.shortDescription || `${v.vendorProject || 'Vendor'} ${v.product || 'product'} is listed in CISA's Known Exploited Vulnerabilities Catalog.`,
      tag: 'KEV' as const,
      severity: v.knownRansomwareCampaignUse === 'Known' ? 'critical' : 'high',
      source: 'CISA KEV' as const,
      sourceUrl: url,
      publishedAt: v.dateAdded ? new Date(`${v.dateAdded}T00:00:00Z`).toISOString() : now,
      observedAt: now,
      confidence: 'Confirmed' as const,
      provenance: 'Official Government Feed' as const,
      cve: v.cveID,
      vendor: v.vendorProject,
      product: v.product,
      ransomwareUse: v.knownRansomwareCampaignUse === 'Known',
    }))
}

export async function fetchNvdRecent(limit = 10): Promise<IntelItem[]> {
  const endpoint = `https://services.nvd.nist.gov/rest/json/cves/2.0?resultsPerPage=${Math.min(limit, 20)}`
  const res = await fetch(endpoint, { next: { revalidate: 1800 }, headers: { 'User-Agent': 'EagleEye/0.1 defensive-security-research' } })
  if (!res.ok) throw new Error(`NVD ${res.status}`)
  const data = await res.json() as { vulnerabilities?: Array<any> }
  const now = new Date().toISOString()
  return (data.vulnerabilities ?? []).slice(0, limit).map(({ cve }) => {
    const desc = (cve.descriptions || []).find((d: any) => d.lang === 'en')?.value || 'New CVE record published by NVD.'
    const m = cve.metrics || {}
    const score = m.cvssMetricV40?.[0]?.cvssData?.baseScore ?? m.cvssMetricV31?.[0]?.cvssData?.baseScore ?? m.cvssMetricV30?.[0]?.cvssData?.baseScore ?? m.cvssMetricV2?.[0]?.cvssData?.baseScore
    return {
      id: `nvd-${cve.id}`,
      title: `${cve.id}: ${desc.length > 110 ? desc.slice(0, 107) + '…' : desc}`,
      summary: desc,
      tag: 'CVE' as const,
      severity: severityFromCvss(score),
      source: 'NVD' as const,
      sourceUrl: `https://nvd.nist.gov/vuln/detail/${cve.id}`,
      publishedAt: cve.published || now,
      observedAt: now,
      confidence: 'High' as const,
      provenance: 'Public Vulnerability Database' as const,
      cve: cve.id,
    }
  })
}

export async function fetchThreatFox(limit = 12): Promise<IntelItem[]> {
  const auth = process.env.THREATFOX_AUTH_KEY
  if (!auth) return []
  const endpoint = 'https://threatfox-api.abuse.ch/api/v1/'
  const res = await fetch(endpoint, {
    method: 'POST',
    next: { revalidate: 900 },
    headers: { 'Content-Type': 'application/json', 'Auth-Key': auth, 'User-Agent': 'EagleEye/0.1 defensive-security-research' },
    body: JSON.stringify({ query: 'get_iocs', days: 1 }),
  })
  if (!res.ok) throw new Error(`ThreatFox ${res.status}`)
  const payload = await res.json() as { query_status?: string; data?: Array<any> }
  if (payload.query_status !== 'ok') throw new Error(`ThreatFox ${payload.query_status || 'query failed'}`)
  const now = new Date().toISOString()
  return (payload.data ?? []).slice(0, limit).map((ioc) => ({
    id: `threatfox-${ioc.id || ioc.ioc}`,
    title: `${ioc.malware_printable || ioc.malware || 'Malware'} IOC: ${ioc.ioc}`,
    summary: ioc.threat_type_desc || ioc.ioc_type_desc || 'Community-vetted indicator of compromise from ThreatFox.',
    tag: 'IOC' as const,
    severity: 'high' as const,
    source: 'ThreatFox' as const,
    sourceUrl: 'https://threatfox.abuse.ch/',
    publishedAt: ioc.first_seen ? new Date(String(ioc.first_seen).replace(' ', 'T') + 'Z').toISOString() : now,
    observedAt: now,
    confidence: 'High' as const,
    provenance: 'Public Vulnerability Database' as const,
  }))
}

export async function getLiveIntel(): Promise<{ items: IntelItem[]; liveSources: string[]; errors: string[]; generatedAt: string }> {
  const results = await Promise.allSettled([fetchCisaKev(14), fetchNvdRecent(8), fetchThreatFox(12)])
  const items: IntelItem[] = []
  const errors: string[] = []
  const liveSources: string[] = []
  if (results[0].status === 'fulfilled') { items.push(...results[0].value); liveSources.push('CISA KEV') } else errors.push(String(results[0].reason))
  if (results[1].status === 'fulfilled') { items.push(...results[1].value); liveSources.push('NVD') } else errors.push(String(results[1].reason))
  if (results[2].status === 'fulfilled' && results[2].value.length) { items.push(...results[2].value); liveSources.push('ThreatFox') } else if (results[2].status === 'rejected') errors.push(String(results[2].reason))
  items.sort((a,b) => Date.parse(b.publishedAt) - Date.parse(a.publishedAt))
  return { items: items.length ? items : demoIntel, liveSources, errors, generatedAt: new Date().toISOString() }
}
