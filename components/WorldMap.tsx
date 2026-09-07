'use client'
import {useEffect,useMemo,useState} from 'react'
import {hotspots as demoHotspots} from '@/lib/data'
import type {RansomwareVictim} from '@/lib/ransomware'

type Coord={lat:number;lon:number;label:string}
const coords:Record<string,Coord>={
 US:{lat:38,lon:-97,label:'United States'},USA:{lat:38,lon:-97,label:'United States'},'UNITED STATES':{lat:38,lon:-97,label:'United States'},
 GB:{lat:55,lon:-3,label:'United Kingdom'},UK:{lat:55,lon:-3,label:'United Kingdom'},'UNITED KINGDOM':{lat:55,lon:-3,label:'United Kingdom'},
 CA:{lat:56,lon:-106,label:'Canada'},DE:{lat:51,lon:10,label:'Germany'},GERMANY:{lat:51,lon:10,label:'Germany'},FR:{lat:46,lon:2,label:'France'},FRANCE:{lat:46,lon:2,label:'France'},
 IT:{lat:42.5,lon:12.5,label:'Italy'},ES:{lat:40,lon:-4,label:'Spain'},NL:{lat:52.2,lon:5.3,label:'Netherlands'},BE:{lat:50.8,lon:4.5,label:'Belgium'},CH:{lat:46.8,lon:8.2,label:'Switzerland'},
 AU:{lat:-25,lon:133,label:'Australia'},AUSTRALIA:{lat:-25,lon:133,label:'Australia'},JP:{lat:36,lon:138,label:'Japan'},JAPAN:{lat:36,lon:138,label:'Japan'},IN:{lat:21,lon:78,label:'India'},INDIA:{lat:21,lon:78,label:'India'},
 SG:{lat:1.35,lon:103.8,label:'Singapore'},BR:{lat:-10,lon:-55,label:'Brazil'},BRAZIL:{lat:-10,lon:-55,label:'Brazil'},MX:{lat:23,lon:-102,label:'Mexico'},ZA:{lat:-30,lon:25,label:'South Africa'},
 PL:{lat:52,lon:19,label:'Poland'},SE:{lat:62,lon:15,label:'Sweden'},NO:{lat:61,lon:8,label:'Norway'},DK:{lat:56,lon:10,label:'Denmark'},UA:{lat:49,lon:32,label:'Ukraine'}
}
const xy=(lat:number,lon:number)=>({x:(lon+180)/360*1000,y:(90-lat)/180*500})
const normalizeCountry=(s:string)=>s.trim().toUpperCase()

export function WorldMap({expanded=false}:{expanded?:boolean}){
 const [victims,setVictims]=useState<RansomwareVictim[]>([])
 const [backend,setBackend]=useState('Connecting')
 const [live,setLive]=useState(false)
 useEffect(()=>{let on=true;const load=async()=>{try{const r=await fetch('/api/ransomware',{cache:'no-store'});const d=await r.json();if(on){setVictims(d.items||[]);setBackend(d.backend||'Unknown');setLive(Boolean(d.live))}}catch{if(on)setBackend('Unavailable')}};load();const t=setInterval(load,5*60*1000);return()=>{on=false;clearInterval(t)}},[])
 const realHotspots=useMemo(()=>{const counts=new Map<string,number>();for(const v of victims){const key=normalizeCountry(v.country);if(coords[key])counts.set(key,(counts.get(key)||0)+1)}return [...counts.entries()].map(([key,count])=>({...coords[key],count})).sort((a,b)=>b.count-a.count).slice(0,16)},[victims])
 return <div className={'worldmap '+(expanded?'expanded':'')}>
   <div className="map-head"><div><span className={live?'eyebrow red':'eyebrow'}>● {live?'OSINT LIVE':'DEMO MODE'}</span><h2>Global Ransomware Disclosures</h2></div><div className="legend"><i className="l-red"/> Recent claim <i className="l-amber"/> KEV/ransomware <i className="l-blue"/> OSINT <i className="l-green"/> Customer protected</div></div>
   <svg viewBox="0 0 1000 500" preserveAspectRatio="none" aria-label="Global ransomware intelligence map">
     <defs><filter id="glow"><feGaussianBlur stdDeviation="5" result="b"/><feMerge><feMergeNode in="b"/><feMergeNode in="SourceGraphic"/></feMerge></filter></defs>
     <path className="continents" d="M57 134l71-38 91 16 44 55-35 49-69 8-23 81-44-55-41-7zm257 210 54-84 51 18 38 61-17 108-45 31-36-72zm53-229 102-57 83 27 40 51-24 44-85-5-44-36zm105 93 68-25 64 48-7 71-54 23-47-48zm124-131 132-20 105 49 38 61-47 48-81-5-28-52-91 12-43-44zm184 276 56-39 64 21 22 41-48 32-74-10z"/>
     {[...Array(14)].map((_,i)=>{const x1=110+(i*67)%760,y1=120+(i*43)%230,x2=140+(i*113)%700,y2=100+(i*71)%260;return <path key={i} className={i%3===0?'arc danger':'arc'} d={`M${x1} ${y1} Q ${(x1+x2)/2} ${Math.min(y1,y2)-100} ${x2} ${y2}`}/>})}
     {realHotspots.length?realHotspots.map((h,i)=>{const p=xy(h.lat,h.lon),r=Math.min(18,6+h.count*.75);return <g key={h.label} transform={`translate(${p.x} ${p.y})`} filter="url(#glow)"><circle r={r+10} className="ring"><animate attributeName="r" values={`${r+4};${r+17};${r+4}`} dur={`${2.3+i*.12}s`} repeatCount="indefinite"/></circle><circle r={r} className="node danger"/><text x={14} y={-6}>{h.label}</text><text x={14} y={11} className="count">{h.count} recent claims</text></g>}):demoHotspots.map((h,i)=><g key={h.label} transform={`translate(${h.x*10} ${h.y*5})`} filter="url(#glow)"><circle r={h.r+10} className="ring"/><circle r={h.r} className={i%2?'node danger':'node'}/><text x={14} y={-6}>{h.label}</text><text x={14} y={11} className="count">DEMO • {h.count}</text></g>)}
   </svg>
   <div className="map-foot"><span>{live?`${victims.length} recent disclosures loaded`:'Simulated geographic activity'}</span><span>Source: {backend} • disclosure ≠ intrusion time</span><span className="muted">Refresh 5m</span></div>
 </div>
}
