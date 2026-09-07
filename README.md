# EagleEye

AI Global Cyber Intelligence & Ransomware Defense — prototype codebase.

## Current live-data layer

EagleEye now includes server-side ingestion adapters for:

- **CISA Known Exploited Vulnerabilities (KEV)** — official JSON feed, including the `knownRansomwareCampaignUse` signal.
- **NIST NVD CVE API 2.0** — recent vulnerability records and CVSS-derived severity where available.
- **ThreatFox (optional)** — recent vetted IOC feed when `THREATFOX_AUTH_KEY` is configured.
- **Ransomware.live** — recent ransomware victim-disclosure OSINT. The adapter prefers API PRO when `RANSOMWARELIVE_API_KEY` is configured and falls back to public data/API endpoints when available.

All feeds are normalized inside `lib/` and exposed to the UI through Next.js route handlers in `app/api/`.

## Intelligence integrity

- A ransomware leak-site post is displayed as an **OSINT claim/disclosure**, not proof an attack is happening at that exact moment.
- CISA KEV entries are marked as official-government-feed intelligence.
- NVD records are marked as public vulnerability-database intelligence.
- If live sources are unavailable, the UI falls back to clearly labeled simulated/demo data rather than fabricating live intelligence.
- The world map only plots ransomware disclosure locations when a recognized country location is present in the upstream data.

## Optional environment variables

```bash
RANSOMWARELIVE_API_KEY=your_api_pro_key
THREATFOX_AUTH_KEY=your_abuse_ch_auth_key
```

No key is required for CISA KEV or NVD. ThreatFox requires an abuse.ch Auth-Key. NVD may enforce public rate limits; the application caches server-side responses.

## Run

```bash
npm install
npm run dev
```

Production build:

```bash
npm run build
npm start
```

## Next integrations

Planned adapters: CISA advisories, additional CERT feeds, threat/IOC feeds, authorized public-camera sources, Supabase persistence/realtime, OpenAI intelligence summaries, and Stripe Support payments.
