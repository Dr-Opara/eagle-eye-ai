import { getLiveIntel, type IntelItem } from './intelligence';
import { fetchRansomwareLive } from './ransomware';

export type SituationBrief = {
  generatedAt: string;
  mode: 'live-backed' | 'mixed' | 'demo';
  headline: string;
  summary: string;
  priorities: string[];
  stats: { label: string; value: string; detail: string }[];
  sectors: { name: string; risk: 'critical'|'high'|'elevated'|'guarded'; reason: string }[];
  regions: { name: string; score: number; reason: string }[];
  sources: string[];
};

function count(items: IntelItem[], pred: (i: IntelItem) => boolean) { return items.reduce((n, i) => n + (pred(i) ? 1 : 0), 0); }

export async function buildSituationBrief(): Promise<SituationBrief> {
  const [intel, rwResult] = await Promise.all([getLiveIntel(), fetchRansomwareLive(80).catch(() => ({items: [], backend: 'fallback'}))]);
  const rw = rwResult;
  const critical = count(intel.items, i => i.severity === 'critical');
  const high = count(intel.items, i => i.severity === 'high');
  const ransomwareLinked = count(intel.items, i => i.ransomwareUse === true || i.tag === 'RANSOMWARE');
  const realSources = new Set(intel.items.filter(i => i.provenance !== 'Simulated').map(i => i.source));
  const liveBacked = realSources.size > 0 || rw.backend !== 'fallback';
  const mode: SituationBrief['mode'] = liveBacked ? 'live-backed' : 'demo';
  const priorities = [
    ransomwareLinked ? `${ransomwareLinked} current intelligence items are associated with ransomware or known ransomware exploitation.` : 'No ransomware-linked vulnerability signal is currently elevated in the normalized feed.',
    critical ? `${critical} critical-severity intelligence items require analyst review.` : `${high} high-severity items remain under observation.`,
    rw.items.length ? `Recent ransomware disclosures span ${new Set(rw.items.map(x => x.group).filter(Boolean)).size || 'multiple'} tracked actor/group labels.` : 'Ransomware disclosure feed is currently operating in fallback mode.',
    'Correlate external intelligence with customer asset inventory before taking any containment action.'
  ];
  const top = intel.items.slice(0, 3).map(x => x.title).join(' • ');
  return {
    generatedAt: new Date().toISOString(), mode,
    headline: critical ? 'Elevated global cyber risk posture' : ransomwareLinked ? 'Ransomware-linked exploitation remains active' : 'Global cyber activity remains under continuous observation',
    summary: `${critical + high} high-impact signals are currently present in the normalized intelligence view. ${ransomwareLinked} are ransomware-linked or ransomware-category observations. ${top ? `Top signals: ${top}.` : ''} EagleEye separates public OSINT, official vulnerability intelligence, and customer detections so analysts can judge confidence before acting.`,
    priorities,
    stats: [
      { label: 'High-impact signals', value: String(critical + high), detail: 'Critical + high normalized intelligence items' },
      { label: 'Ransomware-linked', value: String(ransomwareLinked), detail: 'Known ransomware exploitation or ransomware category' },
      { label: 'Intel sources', value: String(realSources.size || 1), detail: liveBacked ? 'Live/public sources currently contributing' : 'Demo fallback active' },
      { label: 'Recent disclosures', value: String(rw.items.length), detail: 'Ransomware claims/disclosures, not attack-time proof' }
    ],
    sectors: [
      { name: 'Healthcare', risk: ransomwareLinked ? 'critical' : 'high', reason: 'High operational impact and persistent extortion targeting.' },
      { name: 'Government', risk: critical ? 'critical' : 'high', reason: 'Exploitation of internet-facing infrastructure and identity services.' },
      { name: 'Financial Services', risk: 'high', reason: 'Credential abuse, data theft, and business interruption risk.' },
      { name: 'Manufacturing', risk: 'elevated', reason: 'IT/OT convergence increases blast-radius concerns.' }
    ],
    regions: [
      { name: 'North America', score: 86, reason: 'High ransomware disclosure volume and broad enterprise attack surface.' },
      { name: 'Europe', score: 79, reason: 'Active extortion ecosystem and vulnerability exploitation.' },
      { name: 'Asia-Pacific', score: 73, reason: 'Large internet-facing footprint and diverse threat campaigns.' },
      { name: 'Middle East & Africa', score: 62, reason: 'Growing geopolitical and critical-infrastructure targeting.' }
    ], sources: [...realSources]
  };
}

export function answerSituationQuestion(q: string, brief: SituationBrief) {
  const s = q.toLowerCase();
  if (s.includes('ransomware')) return `${brief.stats[1].value} ransomware-linked intelligence signals are in the current normalized view. ${brief.priorities[0]}`;
  if (s.includes('global') || s.includes('happening') || s.includes('right now')) return `${brief.headline}. ${brief.summary}`;
  if (s.includes('sector')) return `Highest concern: ${brief.sectors.slice(0,2).map(x => `${x.name} (${x.risk})`).join(', ')}. ${brief.sectors[0].reason}`;
  if (s.includes('region') || s.includes('country')) return `Current regional watch: ${brief.regions.slice(0,3).map(x => `${x.name} ${x.score}/100`).join(', ')}.`;
  if (s.includes('environment') || s.includes('company')) return 'EagleEye should correlate these external signals with your asset inventory, identities, EDR/SIEM events, exposed services, and backup posture before ranking relevance.';
  if (s.includes('attack path')) return 'Attack-path analysis starts at the initial access point, follows credential use and lateral movement, identifies encryption or exfiltration nodes, then estimates downstream blast radius.';
  return `${brief.headline}. Priority: ${brief.priorities[0]}`;
}
