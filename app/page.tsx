import {Shell} from '@/components/Shell'
import CommandMap from '@/components/CommandMap'
import SituationBrief from '@/components/SituationBrief'
import {IntelFeed} from '@/components/IntelFeed'
import {Copilot} from '@/components/Copilot'
import Link from 'next/link'

export default function Home(){return <Shell><main className="page">
  <section className="ee-hero">
    <div><span className="ee-kicker">Global observation active</span><h1>See the threat landscape before it becomes your incident.</h1><p>EagleEye fuses global cyber intelligence, ransomware activity, vulnerabilities, public OSINT, customer telemetry, and AI analysis into one continuously updated operational picture.</p><div className="hero-actions"><Link href="/live-map" className="primary-btn">Enter Global Watch</Link><Link href="/ransomware" className="secondary-btn">Open Ransomware Defense</Link></div></div>
    <div className="ee-hero-side"><div className="ee-stat"><span>Intelligence state</span><strong>LIVE</strong></div><div className="ee-stat"><span>Threat layers</span><strong>08</strong></div><div className="ee-stat"><span>Commercial focus</span><strong>Ransomware</strong></div><div className="ee-stat"><span>Evidence policy</span><strong>Provenance first</strong></div></div>
  </section>
  <section className="ee-section"><div className="ee-section-head"><div><span className="ee-kicker">Global watch</span><h2>Current operating picture</h2></div><p>Public intelligence + clearly labeled simulation</p></div><div className="ee-grid two"><CommandMap compact/><div className="right-stack"><SituationBrief/><div className="ee-callout"><strong>What EagleEye does differently.</strong><br/>It does not stop at showing activity. It correlates global intelligence to your technologies, attack surface, identities, and recovery posture.</div></div></div></section>
  <section className="ee-section"><div className="ee-command-strip"><div><span>Ransomware ecosystem</span><b className="red-text">Elevated</b></div><div><span>Known exploitation</span><b>Active</b></div><div><span>Cyber warfare</span><b>Monitored</b></div><div><span>Critical infrastructure</span><b>Watch</b></div></div></section>
  <section className="ee-section"><div className="ee-section-head"><div><span className="ee-kicker">Intelligence fusion</span><h2>What changed and why it matters</h2></div><Link href="/intelligence" className="secondary-btn">Open Intelligence Center</Link></div><div className="ee-grid two"><IntelFeed/><SituationBrief/></div></section>
</main><Copilot/></Shell>}
