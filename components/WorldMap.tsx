'use client'

import {useEffect,useMemo,useState} from 'react'
import {geoEqualEarth,geoPath} from 'd3-geo'
import {feature} from 'topojson-client'
import world from 'world-atlas/countries-110m.json'
import type {RansomwareVictim} from '@/lib/ransomware'
import styles from './WorldMap.module.css'

type Coord={lat:number;lon:number;label:string}
type Hotspot=Coord&{count:number;countryKey:string}

const worldFeature=feature(world as any,(world as any).objects.countries) as any

const coords:Record<string,Coord>={
 US:{lat:38,lon:-97,label:'United States'},USA:{lat:38,lon:-97,label:'United States'},'UNITED STATES':{lat:38,lon:-97,label:'United States'},
 GB:{lat:55,lon:-3,label:'United Kingdom'},UK:{lat:55,lon:-3,label:'United Kingdom'},'UNITED KINGDOM':{lat:55,lon:-3,label:'United Kingdom'},
 CA:{lat:56,lon:-106,label:'Canada'},CANADA:{lat:56,lon:-106,label:'Canada'},DE:{lat:51,lon:10,label:'Germany'},GERMANY:{lat:51,lon:10,label:'Germany'},
 FR:{lat:46,lon:2,label:'France'},FRANCE:{lat:46,lon:2,label:'France'},IT:{lat:42.5,lon:12.5,label:'Italy'},ITALY:{lat:42.5,lon:12.5,label:'Italy'},
 ES:{lat:40,lon:-4,label:'Spain'},SPAIN:{lat:40,lon:-4,label:'Spain'},NL:{lat:52.2,lon:5.3,label:'Netherlands'},NETHERLANDS:{lat:52.2,lon:5.3,label:'Netherlands'},
 BE:{lat:50.8,lon:4.5,label:'Belgium'},BELGIUM:{lat:50.8,lon:4.5,label:'Belgium'},CH:{lat:46.8,lon:8.2,label:'Switzerland'},SWITZERLAND:{lat:46.8,lon:8.2,label:'Switzerland'},
 AU:{lat:-25,lon:133,label:'Australia'},AUSTRALIA:{lat:-25,lon:133,label:'Australia'},JP:{lat:36,lon:138,label:'Japan'},JAPAN:{lat:36,lon:138,label:'Japan'},
 IN:{lat:21,lon:78,label:'India'},INDIA:{lat:21,lon:78,label:'India'},SG:{lat:1.35,lon:103.8,label:'Singapore'},SINGAPORE:{lat:1.35,lon:103.8,label:'Singapore'},
 BR:{lat:-10,lon:-55,label:'Brazil'},BRAZIL:{lat:-10,lon:-55,label:'Brazil'},MX:{lat:23,lon:-102,label:'Mexico'},MEXICO:{lat:23,lon:-102,label:'Mexico'},
 ZA:{lat:-30,lon:25,label:'South Africa'},'SOUTH AFRICA':{lat:-30,lon:25,label:'South Africa'},PL:{lat:52,lon:19,label:'Poland'},POLAND:{lat:52,lon:19,label:'Poland'},
 SE:{lat:62,lon:15,label:'Sweden'},SWEDEN:{lat:62,lon:15,label:'Sweden'},NO:{lat:61,lon:8,label:'Norway'},NORWAY:{lat:61,lon:8,label:'Norway'},
 DK:{lat:56,lon:10,label:'Denmark'},DENMARK:{lat:56,lon:10,label:'Denmark'},UA:{lat:49,lon:32,label:'Ukraine'},UKRAINE:{lat:49,lon:32,label:'Ukraine'}
}

const fallbackHotspots:Hotspot[]=[
 {lat:38,lon:-97,label:'United States',count:12,countryKey:'US'},
 {lat:51,lon:10,label:'Germany',count:8,countryKey:'DE'},
 {lat:55,lon:-3,label:'United Kingdom',count:7,countryKey:'GB'},
 {lat:36,lon:138,label:'Japan',count:6,countryKey:'JP'},
 {lat:21,lon:78,label:'India',count:5,countryKey:'IN'},
 {lat:-10,lon:-55,label:'Brazil',count:4,countryKey:'BR'}
]

const normalizeCountry=(s:string)=>s.trim().toUpperCase()

export function WorldMap({expanded=false}:{expanded?:boolean}){
 const [victims,setVictims]=useState<RansomwareVictim[]>([])
 const [backend,setBackend]=useState('Connecting')
 const [live,setLive]=useState(false)
 const [zoom,setZoom]=useState(1)
 const [selected,setSelected]=useState<Hotspot|null>(null)

 useEffect(()=>{let on=true;const load=async()=>{try{const r=await fetch('/api/ransomware',{cache:'no-store'});const d=await r.json();if(on){setVictims(d.items||[]);setBackend(d.backend||'Unknown');setLive(Boolean(d.live))}}catch{if(on)setBackend('Unavailable')}};load();const t=setInterval(load,5*60*1000);return()=>{on=false;clearInterval(t)}},[])

 const projection=useMemo(()=>geoEqualEarth().fitExtent([[18,18],[962,452]],worldFeature),[])
 const path=useMemo(()=>geoPath(projection),[projection])
 const countries=useMemo(()=>worldFeature.features||[],[])
 const realHotspots=useMemo(()=>{const counts=new Map<string,number>();for(const v of victims){const key=normalizeCountry(v.country);if(coords[key])counts.set(key,(counts.get(key)||0)+1)}return [...counts.entries()].map(([key,count])=>({...coords[key],count,countryKey:key})).sort((a,b)=>b.count-a.count).slice(0,28)},[victims])
 const hotspots=realHotspots.length?realHotspots:fallbackHotspots

 return <div className={`${styles.worldmap} ${expanded?styles.expanded:''}`}>
   <div className={styles.mapHead}>
     <div><span className={live?'eyebrow red':'eyebrow'}>● {live?'OSINT LIVE':'DEMO FALLBACK'}</span><h2>Global Ransomware Intelligence Map</h2></div>
     <div className={styles.controls}><button className="secondary-btn" onClick={()=>setZoom(z=>Math.min(3.5,z+.35))}>Zoom +</button><button className="secondary-btn" onClick={()=>setZoom(z=>Math.max(1,z-.35))}>Zoom −</button><button className="secondary-btn" onClick={()=>{setZoom(1);setSelected(null)}}>Reset</button></div>
   </div>
   <div className={styles.canvas}>
     <svg viewBox="0 0 980 470" role="img" aria-label="Geographic world map with country boundaries and ransomware disclosure markers">
       <defs><filter id="eeGlow"><feGaussianBlur stdDeviation="3" result="g"/><feMerge><feMergeNode in="g"/><feMergeNode in="SourceGraphic"/></feMerge></filter></defs>
       <rect width="980" height="470" fill="#03101b"/>
       <g transform={`translate(${490*(1-zoom)} ${235*(1-zoom)}) scale(${zoom})`}>
         {countries.map((geo:any,i:number)=><path key={geo.id||i} d={path(geo)||''} fill="#0a2435" stroke="#28516a" strokeWidth={0.42/zoom}/>) }
         {hotspots.map((h,i)=>{const p=projection([h.lon,h.lat]);if(!p)return null;const r=Math.min(8,3.2+h.count*.42);return <g key={`${h.label}-${i}`} transform={`translate(${p[0]} ${p[1]})`} onClick={()=>setSelected(h)} style={{cursor:'pointer'}} filter="url(#eeGlow)"><circle r={r+7} fill="rgba(255,83,105,.08)" stroke="rgba(255,83,105,.22)" strokeWidth={.7/zoom}/><circle r={r} className={styles.threatDot}/><text x={r+5} y={-3} className={styles.geoLabel}>{h.label}</text><text x={r+5} y={8} className={styles.geoCount}>{live?`${h.count} recent claims`:`DEMO • ${h.count}`}</text></g>})}
       </g>
     </svg>
     <div className={styles.scale}><span>REAL WORLD GEOGRAPHY</span><b>{zoom.toFixed(1)}×</b></div>
     {selected&&<aside className={styles.dossier}><button className="x" onClick={()=>setSelected(null)}>×</button><span className="eyebrow red">INTELLIGENCE DOSSIER</span><h3>{selected.label}</h3><strong>{selected.count}</strong><p>{live?'Recent ransomware victim disclosures associated with this geography. Publication time may differ from intrusion time.':'Demo geographic activity shown because the live feed did not return geocoded records.'}</p><small>Source: {backend}</small></aside>}
   </div>
   <div className={styles.foot}><span>{live?`${victims.length} recent disclosures loaded`:'Demo geographic activity'}</span><span>Natural Earth country boundaries • Equal Earth projection</span><span>Source: {backend}</span></div>
 </div>
}
