import { NextRequest, NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabaseAdmin';
import { accT1, accT2, spdT1, spdT2, metricsFromRaw, risks, ci, brainAge } from '@/lib/scoring';

export async function POST(req: NextRequest) {
  try {
    const { sessionId } = await req.json();
    if (!sessionId) return NextResponse.json({ error: 'sessionId 필요' }, { status: 400 });

    const { data: session, error: sErr } = await supabaseAdmin.from('v2.sessions').select('id, token, participant_id').eq('id', sessionId).single();
    if (sErr || !session) throw sErr || new Error('세션 없음');

    const { data: participant } = await supabaseAdmin.from('v2.participants').select('age').eq('id', session.participant_id).single();

    const { data: raws } = await supabaseAdmin.from('v2.raw_results').select('*').eq('session_id', sessionId).order('test_no');
    if (!raws || raws.length < 2) return NextResponse.json({ error: '원자료 부족' }, { status: 400 });

    const r1 = raws.find(r=>r.test_no===1)!; const r2 = raws.find(r=>r.test_no===2)!;
    const a1 = accT1(r1.accuracy_count||0), s1 = spdT1(r1.avg_reaction_ms||0);
    const a2 = accT2(r2.accuracy_count||0), s2 = spdT2(r2.avg_reaction_ms||0);
    const m  = metricsFromRaw(a1, s1, a2, s2);
    const R  = risks(m);

    // 동나이대 평균(아직 seed 없으면 70 사용)
    const age = participant?.age ?? 60;
    const min = age - 5, max = age + 5;
    let ciPeer = 70;

    // 실제 데이터 기반 CI 동나이대 평균 (간단 집계)
    const { data: peerSessions } = await supabaseAdmin
      .rpc('get_peer_ci_avg', { min_age: min, max_age: max }) // 함수 없으면 아래 fallback 사용
      .catch(()=>({ data:null }));

    if (peerSessions && typeof peerSessions === 'number') ciPeer = peerSessions;

    const myCi = ci(m);
    const bAge = brainAge(myCi, ciPeer, age);

    const up = await supabaseAdmin.from('v2.metrics').upsert({
      session_id: sessionId,
      memory: m.memory, comprehension: m.comprehension, focus: m.focus, judgment: m.judgment, agility: m.agility, endurance: m.endurance,
      risk_adhd: R.r_adhd, risk_stress: R.r_stress, risk_dementia: R.r_dementia, risk_forgetful: R.r_forget,
      brain_age: bAge,
      overall_comment: '', detail_analysis: '', routine: {}
    });
    if (up.error) throw up.error;

    const base = process.env.REPORT_BASE_URL ?? '';
    const reportUrl = base ? `${base}/${session.token}` : `/report/${session.token}`;
    return NextResponse.json({ ok:true, reportUrl });
  } catch (e:any) {
    return NextResponse.json({ error: e?.message ?? 'unknown' }, { status: 500 });
  }
}
