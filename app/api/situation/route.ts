import { NextRequest, NextResponse } from 'next/server';
import { answerSituationQuestion, buildSituationBrief } from '../../../lib/situation';
export const dynamic = 'force-dynamic';
export async function GET() { const brief = await buildSituationBrief(); return NextResponse.json(brief, { headers: { 'Cache-Control': 's-maxage=120, stale-while-revalidate=300' } }); }
export async function POST(req: NextRequest) { const body = await req.json().catch(() => ({})); const brief = await buildSituationBrief(); const question = typeof body?.question === 'string' ? body.question : 'What is happening globally right now?'; return NextResponse.json({ answer: answerSituationQuestion(question, brief), generatedAt: brief.generatedAt, mode: brief.mode }); }
