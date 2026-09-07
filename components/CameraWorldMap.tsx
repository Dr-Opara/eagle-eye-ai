'use client'

import {useEffect,useMemo,useState} from 'react'
import {geoEqualEarth,geoPath} from 'd3-geo'
import {feature} from 'topojson-client'
import world from 'world-atlas/countries-110m.json'
import type {PublicCamera,CameraPayload} from '@/lib/cameras'
import styles from './WorldMap.module.css'

type TopologyLike={objects:{countries:unknown}}
const worldFeature=feature(world as unknown as TopologyLike,(world as unknown as TopologyLike).objects.countries) as any

export function CameraWorldMap(){
  const [payload,setPayload]=useState<CameraPayload>({cameras:[],total:0,live:false,provider:'Windy Webcams',generatedAt:new Date().toISOString()})
  const [selected,setSelected]=useState<PublicCamera|null>(null)
  const [offset,setOffset]=useState(0)
  const [onlyLive,setOnlyLive]=useState(false)
  const [query,setQuery]=useState('')

  useEffect(()=>{let on=true;fetch(`/api/cameras?limit=50&offset=${offset}`,{cache:'no-store'}).then(r=>r.json()).then(d=>{if(on)setPayload(d)}).catch(()=>{});return()=>{on=false}},[offset])

  const projection=useMemo(()=>geoEqualEarth().fitExtent([[18,18],[962,452]],worldFeature),[])
  const path=useMemo(()=>geoPath(projection),[projection])
  const countries=useMemo(()=>worldFeature.features||[],[])
  const cameras=useMemo(()=>payload.cameras.filter(c=>(!onlyLive||c.live)&&(!query||`${c.title} ${c.city} ${c.region} ${c.country} ${c.categories.join(' ')}`.toLowerCase().includes(query.toLowerCase()))),[payload.cameras,onlyLive,query])

  return <div className={styles.worldmap}>
    <div className={styles.mapHead}>
      <div><span className={payload.live?'eyebrow':'eyebrow red'}>● {payload.live?'GLOBAL CAMERA INDEX LIVE':'CAMERA API NOT CONFIGURED'}</span><h2>Worldwide Public Camera Network</h2></div>
      <div className={styles.controls}><input value={query} onChange={e=>setQuery(e.target.value)} placeholder="Search country, city, category…" style={{background:'#06131f',border:'1px solid #21435a',color:'white',borderRadius:7,padding:'8px 10px',minWidth:220}}/><button className="secondary-btn" onClick={()=>setOnlyLive(v=>!v)}>{onlyLive?'All Cameras':'Live Only'}</button></div>
    </div>
    <div className={styles.canvas}>
      <svg viewBox="0 0 980 470" role="img" aria-label="World map of public live webcams">
        <rect width="980" height="470" fill="#03101b"/>
        {countries.map((geo:any,i:number)=><path key={geo.id||i} d={path(geo)||''} fill="#0a2435" stroke="#28516a" strokeWidth={.42}/>)}
        {cameras.map((c,i)=>{const p=projection([c.lon,c.lat]);if(!p)return null;return <g key={`${c.id}-${i}`} transform={`translate(${p[0]} ${p[1]})`} onClick={()=>setSelected(c)} style={{cursor:'pointer'}}><circle r={c.live?4.6:3.2} fill={c.live?'#48f0ad':'#54dcff'} stroke="#dffaff" strokeWidth={.65}/>{c.live&&<circle r={8} fill="none" stroke="rgba(72,240,173,.25)"/>}</g>})}
      </svg>
      <div className={styles.scale}><span>{payload.live?`${cameras.length} cameras on this page`:'API key required'}</span><b>{payload.total?`${payload.total.toLocaleString()} indexed`:''}</b></div>
      {selected&&<aside className={styles.dossier}><button className="x" onClick={()=>setSelected(null)}>×</button><span className={selected.live?'live-badge':'source-badge'}>{selected.live?'● LIVE':'PUBLIC CAMERA'}</span><h3>{selected.title}</h3><p>{[selected.city,selected.region,selected.country].filter(Boolean).join(', ')}</p>{selected.imageUrl&&<img src={selected.imageUrl} alt={`Preview from ${selected.title}`} style={{width:'100%',borderRadius:8,border:'1px solid #173850'}}/>}<p>{selected.categories.join(' • ')||'Uncategorized'}</p><a className="primary-btn" href={selected.playerUrl||selected.detailUrl} target="_blank" rel="noreferrer">OPEN LIVE CAMERA</a><small style={{display:'block',marginTop:10}}>Webcams provided by Windy.com. Feed availability and embedding rights remain with the provider.</small></aside>}
    </div>
    <div className={styles.foot}><span>Provider: {payload.provider}</span><span>{payload.note||'Public/authorized cameras only'}</span><span><button className="secondary-btn" disabled={offset===0} onClick={()=>setOffset(Math.max(0,offset-50))}>Previous</button> <button className="secondary-btn" onClick={()=>setOffset(offset+50)}>Next 50</button></span></div>
  </div>
}
