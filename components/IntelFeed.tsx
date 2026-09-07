'use client'

import { useEffect, useMemo, useState } from 'react'
import type { IntelItem } from '@/lib/intelligence'
import { demoIntel } from '@/lib/intelligence'

type Payload = { items: IntelItem[]; liveSources: string[]; errors: string[]; generatedAt: string }

function relativeTime(iso: string) {
  const ms = Date.now() - Date.parse(iso)
  if (!Number.isFinite(ms)) return '—'
  const mins = Math.max(0, Math.floor(ms / 60000))
  if (mins < 60) return `${mins}m`
  const hrs = Math.floor(mins / 60)
  if (hrs < 24) return `${hrs}h`
  return `${Math.floor(hrs / 24)}d`
}

export function IntelFeed({limit=10}:{limit?:number}) {
  const [data, setData] = useState<Payload>({items: demoIntel, liveSources: [], errors: [], generatedAt: new Date().toISOString()})
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    let active = true
    const load = async () => {
      try {
        const res = await fetch('/api/intelligence', { cache: 'no-store' })
        if (!res.ok) throw new Error(`Feed ${res.status}`)
        const next = await res.json() as Payload
        if (active) setData(next)
      } catch {
      } finally {
        if (active) setLoading(false)
      }
    }
    load()
    const timer = setInterval(load, 5 * 60 * 1000)
    return () => { active = false; clearInterval(timer) }
  }, [])

  const items = useMemo(() => data.items.slice(0, limit), [data.items, limit])
  const isLive = data.liveSources.length > 0

  return <div className="card panel">
    <div className="panel-head">
      <div><span className="eyebrow">OSINT INTELLIGENCE</span><h3>Intelligence Stream</h3></div>
      <div className="feed-status"><span className={isLive ? 'pulse green' : 'pulse amber-dot'}/><b>{loading ? 'CONNECTING' : isLive ? 'LIVE SOURCES' : 'DEMO FALLBACK'}</b></div>
    </div>
    <div className="source-line">{isLive ? `Connected: ${data.liveSources.join(' • ')}` : 'No upstream feed available • showing simulated data'}</div>
    <div className="feed">{items.map(x => <div className="feed-row" key={x.id}>
      <time>{relativeTime(x.publishedAt)}</time>
      <div><b>{x.title}</b><small>{x.source} • {x.confidence} • {x.provenance}{x.ransomwareUse ? ' • known ransomware use' : ''}</small></div>
      <span className={'badge '+x.severity}>{x.tag}</span>
    </div>)}</div>
  </div>
}
