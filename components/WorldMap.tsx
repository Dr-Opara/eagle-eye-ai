'use client'

import {useEffect,useMemo,useState} from 'react'
import {
  ComposableMap,
  Geographies,
  Geography,
  Graticule,
  Marker,
  ZoomableGroup,
} from '@cherubinbila/react-simple-maps'
import world from 'world-atlas/countries-110m.json'
import type {RansomwareVictim} from '@/lib/ransomware'

type Coord={lat:number;lon:number;label:string}
type Hotspot=Coord&{count:number;countryKey:string}

const coords:Record<string,Coord>={
 US:{lat:38,lon:-97,label:'United States'},USA:{lat:38,lon:-97,label:'United States'},'UNITED STATES':{lat:38,lon:-97,label:'United States'},
 GB:{lat:55,lon:-3,label:'United Kingdom'},UK:{lat:55,lon:-3,label:'United Kingdom'},'UNITED KINGDOM':{lat:55,lon:-3,label:'United Kingdom'},
 CA:{lat:56,lon:-106,label:'Canada'},CANADA:{lat:56,lon:-106,label:'Canada'},
 DE:{lat:51,lon:10,label:'Germany'},GERMANY:{lat:51,lon:10,label:'Germany'},
 FR:{lat:46,lon:2,label:'France'},FRANCE:{lat:46,lon:2,label:'France'},
 IT:{lat:42.5,lon:12.5,label:'Italy'},ITALY:{lat:42.5,lon:12.5,label:'Italy'},
 ES:{lat:40,lon:-4,label:'Spain'},SPAIN:{lat:40,lon:-4,label:'Spain'},
 NL:{lat:52.2,lon:5.3,label:'Netherlands'},NETHERLANDS:{lat:52.2,lon:5.3,label:'Netherlands'},
 BE:{lat:50.8,lon:4.5,label:'Belgium'},BELGIUM:{lat:50.8,lon:4.5,label:'Belgium'},
 CH:{lat:46.8,lon:8.2,label:'Switzerland'},SWITZERLAND:{lat:46.8,lon:8.2,label:'Switzerland'},
 AU:{lat:-25,lon:133,label:'Australia'},AUSTRALIA:{lat:-25,lon:133,label:'Australia'},
 JP:{lat:36,lon:138,label:'Japan'},JAPAN:{lat:36,lon:138,label:'Japan'},
 IN:{lat:21,lon:78,label:'India'},INDIA:{lat:21,lon:78,label:'India'},
 SG:{lat:1.35,lon:103.8,label:'Singapore'},SINGAPORE:{lat:1.35,lon:103.8,label:'Singapore'},
 BR:{lat:-10,lon:-55,label:'Brazil'},BRAZIL:{lat:-10,lon:-55,label:'Brazil'},
 MX:{lat:23,lon:-102,label:'Mexico'},MEXICO:{lat:23,lon:-102,label:'Mexico'},
 ZA:{lat:-30,lon:25,label:'South Africa'},'SOUTH AFRICA':{lat:-30,lon:25,label:'South Africa'},
 PL:{lat:52,lon:19,label:'Poland'},POLAND:{lat:52,lon:19,label:'Poland'},
 SE:{lat:62,lon:15,label:'Sweden'},SWEDEN:{lat:62,lon:15,label:'Sweden'},
 NO:{lat:61,lon:8,label:'Norway'},NORWAY:{lat:61,lon:8,label:'Norway'},
 DK:{lat:56,lon:10,label:'Denmark'},DENMARK:{lat:56,lon:10,label:'Denmark'},
 UA:{lat:49,lon:32,label:'Ukraine'},UKRAINE:{lat:49,lon:32,label:'Ukraine'}
}

const normalizeCountry=(s:string)=>s.trim().toUpperCase()
const fallbackHotspots:Hotspot[]=[
  {lat:38,lon:-97,label:'United States',count:12,countryKey:'US'},
  {lat:51,lon:10,label:'Germany',count:8,countryKey:'DE'},
  {lat:55,lon:-3,label:'United Kingdom',count:7,countryKey:'GB'},
  {lat:36,lon:138,label:'Japan',count:6,countryKey:'JP'},
  {lat:21,lon:78,label:'India',count:5,countryKey:'IN'},
  {lat:-10,lon:-55,label:'Brazil',count:4,countryKey:'BR'},
]

export function WorldMap({expanded=false}:{expanded?:boolean}){
  const [victims,setVictims]=useState<RansomwareVictim[]>([])
  const [backend,setBackend]=useState('Connecting')
  const [live,setLive]=useState(false)
  const [zoom,setZoom]=useState(1)
  const [center,setCenter]=useState<[number,number]>([0,12])
  const [selected,setSelected]=useState<Hotspot|null>(null)

  useEffect(()=>{
    let on=true
    const load=async()=>{
      try{
        const r=await fetch('/api/ransomware',{cache:'no-store'})
        const d=await r.json()
        if(on){setVictims(d.items||[]);setBackend(d.backend||'Unknown');setLive(Boolean(d.live))}
      }catch{if(on)setBackend('Unavailable')}
    }
    load()
    const t=setInterval(load,5*60*1000)
    return()=>{on=false;clearInterval(t)}
  },[])

  const realHotspots=useMemo(()=>{
    const counts=new Map<string,number>()
    for(const v of victims){
      const key=normalizeCountry(v.country)
      if(coords[key]) counts.set(key,(counts.get(key)||0)+1)
    }
    return [...counts.entries()]
      .map(([key,count])=>({...coords[key],count,countryKey:key}))
      .sort((a,b)=>b.count-a.count)
      .slice(0,24)
  },[victims])

  const hotspots=realHotspots.length?realHotspots:fallbackHotspots
  const focus=(h:Hotspot)=>{setSelected(h);setCenter([h.lon,h.lat]);setZoom(2.4)}
  const reset=()=>{setSelected(null);setCenter([0,12]);setZoom(1)}

  return <div className={'worldmap geographic '+(expanded?'expanded':'')}>
    <div className="map-head">
      <div>
        <span className={live?'eyebrow red':'eyebrow'}>● {live?'OSINT LIVE':'DEMO FALLBACK'}</span>
        <h2>Global Ransomware Intelligence Map</h2>
      </div>
      <div className="map-controls">
        <button type="button" className="ghost" onClick={()=>setZoom(z=>Math.min(5,z+.5))}>+</button>
        <button type="button" className="ghost" onClick={()=>setZoom(z=>Math.max(1,z-.5))}>−</button>
        <button type="button" className="ghost" onClick={reset}>Reset</button>
      </div>
    </div>

    <div className="map-canvas" aria-label="Real geographic world map showing ransomware intelligence activity">
      <ComposableMap projection="geoEqualEarth" projectionConfig={{scale:155}} width={980} height={470}>
        <ZoomableGroup center={center} zoom={zoom} minZoom={1} maxZoom={5} onMoveEnd={({coordinates,zoom:nextZoom}:any)=>{setCenter(coordinates);setZoom(nextZoom)}}>
          <Graticule stroke="#173149" strokeWidth={0.35}/>
          <Geographies geography={world as any}>
            {({geographies}:any)=><>{geographies.map((geo:any)=><Geography
              key={geo.rsmKey}
              geography={geo}
              fill="#0b2130"
              stroke="#234258"
              strokeWidth={0.55}
              style={{default:{outline:'none'},hover:{fill:'#113249',outline:'none'},pressed:{outline:'none'}}}
            />)}</>}
          </Geographies>
          {hotspots.map((h,i)=>{
            const radius=Math.min(9,3.5+h.count*.45)
            return <Marker key={`${h.label}-${i}`} coordinates={[h.lon,h.lat]} onClick={()=>focus(h)}>
              <circle r={radius+8} fill="rgba(255,77,93,.08)" stroke="rgba(255,77,93,.22)" strokeWidth={1}/>
              <circle r={radius} className="geo-threat-dot"/>
              <text x={radius+5} y={-4} className="geo-label">{h.label}</text>
              <text x={radius+5} y={9} className="geo-count">{live?`${h.count} recent claims`:`DEMO • ${h.count}`}</text>
            </Marker>
          })}
        </ZoomableGroup>
      </ComposableMap>

      <div className="map-scale"><span>WORLD VIEW</span><b>{zoom.toFixed(1)}×</b></div>

      {selected&&<aside className="map-dossier card">
        <button type="button" className="x" onClick={()=>setSelected(null)}>×</button>
        <span className="eyebrow red">INTELLIGENCE DOSSIER</span>
        <h3>{selected.label}</h3>
        <strong>{selected.count}</strong>
        <p>{live?'Recent ransomware victim disclosures associated with this geography.':'Demo activity used when no live geocoded source data is available.'}</p>
        <small>Source: {backend}</small>
      </aside>}
    </div>

    <div className="map-foot">
      <span>{live?`${victims.length} recent disclosures loaded`:'Demo geographic activity'}</span>
      <span>Real Natural Earth country boundaries • Equal Earth projection</span>
      <span>Source: {backend} • disclosure ≠ intrusion time</span>
    </div>
  </div>
}
