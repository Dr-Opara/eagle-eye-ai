import {Shell} from '@/components/Shell'
import RansomwareCommand from '@/components/RansomwareCommand'
import {RansomwareIntel} from '@/components/RansomwareIntel'
import {Copilot} from '@/components/Copilot'
import Link from 'next/link'
export default function Page(){return <Shell><main className="page">
<section className="ee-hero"><div><span className="ee-kicker">Ransomware defense</span><h1>Contain the attack before the business stops.</h1><p>Detect ransomware behavior, trace patient zero, understand blast radius, coordinate containment, preserve evidence, and drive recovery from one command workspace.</p><div className="hero-actions"><Link href="/demo" className="primary-btn">Request Enterprise Demo</Link><Link href="/my-environment" className="secondary-btn">View Protected Environment</Link></div></div><div className="ee-hero-side"><div className="ee-stat"><span>Incident state</span><strong className="red-text">Critical</strong></div><div className="ee-stat"><span>Systems exposed</span><strong>23</strong></div><div className="ee-stat"><span>Compromised</span><strong>04</strong></div><div className="ee-stat"><span>Backups</span><strong>Protected</strong></div></div></section>
<section className="ee-section"><div className="ee-section-head"><div><span className="ee-kicker">Incident command</span><h2>Active containment simulation</h2></div><span className="demo-flag">SIMULATED CUSTOMER INCIDENT</span></div><RansomwareCommand/></section>
<section className="ee-section"><div className="ee-grid two"><RansomwareIntel/><div className="ee-callout"><strong>From global intelligence to your environment.</strong><br/>EagleEye is designed to correlate external ransomware intelligence with customer-authorized endpoint, identity, cloud, SIEM, vulnerability, and backup telemetry—then explain why the threat matters and what action is safest next.</div></div></section>
</main><Copilot/></Shell>}
