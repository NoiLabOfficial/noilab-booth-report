import { NextRequest, NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabaseAdmin';

export async function POST(req: NextRequest) {
  try {
    const { sessionId, test1, test2 } = await req.json();
    // test1 = { accuracy: number, rt: number }, test2 = { accuracy: number, rt: number }
    if (!sessionId || !test1 || !test2) return NextResponse.json({ error: '필드 누락' }, { status: 400 });

    // 두 테스트 upsert 대신 insert (간단)
    const rows = [
      { session_id: sessionId, test_no: 1, accuracy_count: test1.accuracy, avg_reaction_ms: test1.rt },
      { session_id: sessionId, test_no: 2, accuracy_count: test2.accuracy, avg_reaction_ms: test2.rt },
    ];
    const { error } = await supabaseAdmin.from('raw_results').insert(rows);
    if (error) throw error;

    return NextResponse.json({ ok: true });
  } catch (e:any) {
    return NextResponse.json({ error: e?.message ?? 'unknown' }, { status: 500 });
  }
}
