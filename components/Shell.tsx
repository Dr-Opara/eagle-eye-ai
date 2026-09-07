'use client'
import Link from 'next/link'
import {usePathname} from 'next/navigation'
import {nav} from '@/lib/data'
import {useEffect,useState} from 'react'

export function Shell({children}:{children:React.ReactNode}){
  const pathname=usePathname(); const [clock,setClock]=useState('')
  useEffect(()=>{const tick=()=>setClock(new Date().toISOString().slice(11,19)+' UTC');tick();const i=setInterval(tick,1000);return()=>clearInterval(i)},[])
  return <main className="app-shell">
    <header className="topbar">
      <Link href="/" className="brand"><span className="eagle">◢</span><span><b>EagleEye</b><small>AI GLOBAL CYBER INTELLIGENCE</small></span></Link>
      <nav className="nav">{nav.map(([n,h])=><Link key={h} href={h} className={pathname===h?'active':''}>{n}</Link>)}</nav>
      <div className="status"><span className="pulse green"/>LIVE <b>{clock}</b></div>
    </header>
    <div className="demo-ribbon"><span>DEMO INTELLIGENCE</span> Simulated signals for product validation — not verified real-world attack telemetry.</div>
    {children}
  </main>
}
