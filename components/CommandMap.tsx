'use client';
import {useEffect,useMemo,useState} from 'react';
import {geoEqualEarth,geoPath} from 'd3-geo';
import {feature} from 'topojson-client';
import world from 'world-atlas/countries-110m.json';

type Layer='ransomware'|'malware'|'ddos'|'phishing'|'botnet'|'exploit'|'warfare'|'outage';
type EventPoint={lat:number;lon:number;layer:Layer;name:string;severity:'critical'|'high'|'elevated';count:number};
const layers:Layer[]=['ransomware','malware','ddos','phishing','botnet','exploit','warfare','outage'];
const palette:Record<Layer,string>={ransomware:'#ff4f67',malware:'#ff8d4d',ddos:'#58a8ff',phishing:'#c76cff',botnet:'#4ee6d2',exploit:'#ffd65a',warfare:'#ff3aa8',outage:'#9aa8b5'};
const events:EventPoint[]=[
 {lat:38,lon:-97,layer:'ransomware',name:'United States',severity:'critical',count:184},
 {lat:51,lon:10,layer:'malware',name:'Germany',severity:'high',count:132},
 {lat:55,lon:-3,layer:'phishing',name:'United Kingdom',severity:'high',count:121},
 {lat:49,lon:32,layer:'warfare',name:'Ukraine',severity:'critical',count:97},
 {lat:39,lon:35,layer:'exploit',name:'Türkiye',severity:'high',count:83},
 {lat:21,lon:78,layer:'botnet',name:'India',severity:'elevated',count:151},
 {lat:36,lon:138,layer:'malware',name:'Japan',severity:'high',count:88},
 {lat:35,lon:104,layer:'ddos',name:'China',severity:'high',count:143},
 {lat:1.35,lon:103.8,layer:'exploit',name:'Singapore',severity:'elevated',count:61},
 {lat:-10,lon:-55,layer:'ransomware',name:'Brazil',severity:'high',count:79},
 {lat:-30,lon:25,layer:'ddos',name:'South Africa',severity:'elevated',count:58},
 {lat:-25,lon:133,layer:'ransomware',name:'Australia',severity:'elevated',count:49},
 {lat:24,lon:54,layer:'outage',name:'United Arab Emirates',severity:'elevated',count:35}
];
const links=[[0,1],[0,2],[3,4],[7,6],[5,8],[9,0],[4,8],[7,5],[11,8],[10,4]] as const;
const topology=world as any;
const worldFeature=feature(topology,topology.objects.countries) as any;

export default function CommandMap({compact=false}:{compact?:boolean}){
 const[active,setActive]=useState<Layer[]>(['ransomware','malware','phishing','warfare','exploit']);
 const[window,setWindow]=useState('24H');
 const[pulse,setPulse]=useState(0);
 const[selected,setSelected]=useState<EventPoint|null>(null);
 useEffect(()=>{const id=setInterval(()=>setPulse(x=>(x+1)%1000),1200);return()=>clearInterval(id)},[]);
 const projection=useMemo(()=>geoEqualEarth().fitExtent([[12,12],[988,488]],worldFeature),[]);
 const path=useMemo(()=>geoPath(projection),[projection]);
 const countries=useMemo(()=>worldFeature.features||[],[]);
 const visible=useMemo(()=>events.filter(p=>active.includes(p.layer)),[active]);
 const total=visible.reduce((a,b)=>a+b.count,0);
 const ranked=[...visible].sort((a,b)=>b.count-a.count).slice(0,5);
 function toggle(l:Layer){setActive(a=>a.includes(l)?a.filter(x=>x!==l):[...a,l])}
 return <section className={`command-map threatmap ${compact?'compact':''}`}>
   <div className="map-toolbar"><div><span className="live-dot"/> LIVE CYBER THREAT MAP <span className="demo-flag">PUBLIC INTEL + MODELED TELEMETRY</span></div><div className="time-control">{['1H','6H','24H','7D'].map(t=><button className={window===t?'active':''} onClick={()=>setWindow(t)} key={t}>{t}</button>)}</div></div>
   {!compact&&<div className="layer-bar">{layers.map(l=><button key={l} className={active.includes(l)?'on':''} style={active.includes(l)?{borderColor:palette[l],color:palette[l]}:undefined} onClick={()=>toggle(l)}><i style={{background:palette[l]}}/>{l}</button>)}</div>}
   <div className="map-stage threat-stage">
     <svg viewBox="0 0 1000 500" aria-label="Geographic global cyber threat map">
       <defs><filter id="streamGlow"><feGaussianBlur stdDeviation="2.6" result="b"/><feMerge><feMergeNode in="b"/><feMergeNode in="SourceGraphic"/></feMerge></filter></defs>
       <rect width="1000" height="500" fill="#03070c"/>
       <g>{countries.map((geo:any,i:number)=><path key={geo.id||i} d={path(geo)||''} className="real-country"/>)}</g>
       {links.map(([a,b],i)=>{const s=events[a],t=events[b];if(!active.includes(s.layer)&&!active.includes(t.layer))return null;const p1=projection([s.lon,s.lat]);const p2=projection([t.lon,t.lat]);if(!p1||!p2)return null;const mx=(p1[0]+p2[0])/2,my=Math.min(p1[1],p2[1])-Math.max(18,Math.abs(p2[0]-p1[0])*.08);return <path key={i} className="live-stream" style={{stroke:palette[s.layer],animationDelay:`-${i*.7}s`}} d={`M${p1[0]} ${p1[1]} Q${mx} ${my} ${p2[0]} ${p2[1]}`}/>})}
       {visible.map((p,i)=>{const xy=projection([p.lon,p.lat]);if(!xy)return null;const r=Math.min(7,3+p.count/65);return <g key={p.name+p.layer} transform={`translate(${xy[0]} ${xy[1]})`} onClick={()=>setSelected(p)} style={{cursor:'pointer'}} filter="url(#streamGlow)"><circle r={r+5+(pulse%2)} fill="none" stroke={palette[p.layer]} strokeOpacity=".28"/><circle r={r} fill={palette[p.layer]} stroke="#f4fbff" strokeWidth=".7"/><text x={r+5} y="-3" className="map-label">{p.name}</text><text x={r+5} y="8" className="map-sub">{p.layer.toUpperCase()} • {p.count}</text></g>})}
     </svg>
     <aside className="threat-total"><small>DETECTIONS / SIGNALS</small><strong>{total.toLocaleString()}</strong><span>selected window • {window}</span></aside>
     <aside className="target-board"><small>TOP OBSERVED REGIONS</small>{ranked.map((p,i)=><div key={p.name}><b>{i+1}</b><span>{p.name}</span><strong>{p.count}</strong></div>)}</aside>
     <div className="map-legend threat-legend">{active.slice(0,6).map(l=><span key={l}><i style={{background:palette[l]}}/>{l}</span>)}</div>
     {selected&&<aside className="map-event-card"><button className="x" onClick={()=>setSelected(null)}>×</button><span className="eyebrow">LIVE MAP DOSSIER</span><h3>{selected.name}</h3><strong style={{color:palette[selected.layer]}}>{selected.count}</strong><p>{selected.layer.toUpperCase()} intelligence signals in the selected {window} view.</p><small>{selected.severity.toUpperCase()} confidence tier • visualization does not imply a confirmed attack in progress</small></aside>}
   </div>
 </section>
}
