import { NextRequest, NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabaseAdmin';
import crypto from 'node:crypto';

export async function POST(req: NextRequest) {
  try {
    const { name, age, gender, mbti } = await req.json();
    if (!name || !age) {
      return NextResponse.json({ error: 'name, age는 필수' }, { status: 400 });
    }

    const { data: p, error: pErr } = await supabaseAdmin
      .from('participants')
      .insert([{ name, age, gender: gender ?? null, mbti: mbti ?? null }])
      .select().single();
    if (pErr) throw pErr;

    const token = crypto.randomBytes(24).toString('base64url');
    const { data: s, error: sErr } = await supabaseAdmin
      .from('sessions')
      .insert([{ participant_id: p.id, round_no: 1, token }])
      .select().single();
    if (sErr) throw sErr;

    const base = process.env.REPORT_BASE_URL ?? '';
    const reportUrl = base ? `${base}/${token}` : `/report/${token}`;

    return NextResponse.json({
      participant: { id: p.id, name: p.name, age: p.age },
      session: { id: s.id, token, reportUrl },
    });
  } catch (e:any) {
    return NextResponse.json({ error: e?.message ?? 'unknown' }, { status: 500 });
  }
}
