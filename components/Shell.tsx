'use client'
import Link from 'next/link'
import {usePathname} from 'next/navigation'
import {useEffect,useState} from 'react'

const primary=[
  ['⌁','Global Watch','/'],['◎','Live Map','/live-map'],['◉','Ransomware','/ransomware'],['◇','Intelligence','/intelligence'],['◌','Cameras','/cameras'],['▣','Environment','/my-environment']
] as const
const utility=[['⚔','Cyber Warfare','/cyber-warfare'],['◆','Pricing','/pricing'],['♡','Donate','/donate'],['i','About','/about']] as const

export function Shell({children}:{children:React.ReactNode}){
  const pathname=usePathname()
  const[clock,setClock]=useState('')
  const immersive=pathname==='/live-map'
  useEffect(()=>{const tick=()=>setClock(new Date().toISOString().slice(11,19)+' UTC');tick();const id=setInterval(tick,1000);return()=>clearInterval(id)},[])
  const current=[...primary,...utility].find(x=>x[2]===pathname)?.[1]||'EagleEye'
  return <main className={`app-shell ${immersive?'immersive-map-mode':''}`}>
    <div className="ee-layout">
      <aside className="ee-rail">
        <Link href="/" className="ee-brand"><img src="/eagleeye-mark.svg" alt="EagleEye eagle head"/><span><strong>Eagle<span>Eye</span></strong><small>Global Cyber Intelligence</small></span></Link>
        <nav className="ee-nav">{primary.map(([icon,label,href])=><Link key={href} href={href} className={pathname===href?'active':''}><span className="icon">{icon}</span><span className="label">{label}</span></Link>)}</nav>
        <div className="ee-util">{utility.map(([icon,label,href])=><Link key={href} href={href} className={pathname===href?'active':''}><span className="icon">{icon}</span><span className="label">{label}</span></Link>)}</div>
      </aside>
      <section className="ee-main">
        <header className="ee-topbar">
          <div className="ee-breadcrumb">EagleEye / {current}</div>
          <div className="ee-search"><input aria-label="Search EagleEye" placeholder="Search threats, actors, CVEs, locations, intelligence…"/><span>⌕</span></div>
          <div className="ee-top-actions"><div className="ee-live"><i/>GLOBAL OBSERVATION <b>{clock}</b></div><Link className="ee-donate" href="/donate">Donate</Link><Link className="ee-demo" href="/demo">Request Demo</Link></div>
        </header>
        {children}
      </section>
    </div>
  </main>
}
