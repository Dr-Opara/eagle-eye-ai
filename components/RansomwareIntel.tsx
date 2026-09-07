'use client'
import {useEffect,useState} from 'react'
import type {RansomwareVictim} from '@/lib/ransomware'

export function RansomwareIntel(){
 const [items,setItems]=useState<RansomwareVictim[]>([]);const [backend,setBackend]=useState('Connecting');const [live,setLive]=useState(false)
 useEffect(()=>{fetch('/api/ransomware',{cache:'no-store'}).then(r=>r.json()).then(d=>{setItems(d.items||[]);setBackend(d.backend||'Unknown');setLive(Boolean(d.live))}).catch(()=>setBackend('Unavailable'))},[])
 return <div className="card panel"><div className="panel-head"><div><span className="eyebrow red">RANSOMWARE OSINT</span><h3>Recent Victim Disclosures</h3></div><span className="badge">{live?'LIVE SOURCE':'OFFLINE'}</span></div><div className="source-line">Source: Ransomware.live • {backend} • publication/claim time may differ from intrusion time</div><div className="feed">{items.slice(0,8).map(v=><div className="feed-row" key={v.id}><time>{new Date(v.discoveredAt).toLocaleDateString(undefined,{month:'short',day:'numeric'})}</time><div><b>{v.victim}</b><small>{v.group} • {v.country}{v.sector?` • ${v.sector}`:''} • OSINT claim</small></div><span className="badge critical">RANSOMWARE</span></div>)}{!items.length&&<div className="source-line">No live ransomware disclosure records are available from the upstream source right now.</div>}</div></div>
}
