import { NextRequest, NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabaseAdmin';
import crypto from 'node:crypto';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { name, age, gender, mbti } = body || {};
    if (!name || !age) {
      return NextResponse.json({ error: 'name, age는 필수' }, { status: 400 });
    }

    // 참가자 upsert (동명이인 대비: name+age+created_at이 다르면 다른 사람으로 취급)
    const { data: p, error: pErr } = await supabaseAdmin
      .from('v2.participants')
      .insert([{ name, age, gender: gender ?? null, mbti: mbti ?? null }])
      .select()
      .single();
    if (pErr) throw pErr;

    // 세션 + 토큰
    const token = crypto.randomBytes(24).toString('base64url'); // URL-safe
    const { data: s, error: sErr } = await supabaseAdmin
      .from('v2.sessions')
      .insert([{ participant_id: p.id, round_no: 1, token }])
      .select()
      .single();
    if (sErr) throw sErr;

    const reportBase = process.env.REPORT_BASE_URL ?? '';
    const reportUrl = reportBase ? `${reportBase}/${token}` : `/report/${token}`;

    return NextResponse.json({
      participant: { id: p.id, name: p.name, age: p.age },
      session: { id: s.id, token, reportUrl },
    });
  } catch (e:any) {
    return NextResponse.json({ error: e?.message ?? 'unknown' }, { status: 500 });
  }
}
