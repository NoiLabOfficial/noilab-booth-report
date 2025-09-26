import { NextRequest, NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabaseAdmin';
import { accT1, accT2, spdT1, spdT2, metricsFromRaw, risks, ci, brainAge } from '@/lib/scoring';

export async function POST(req: NextRequest) {
  try {
    const { sessionId } = await req.json();
    if (!sessionId) {
      return NextResponse.json({ error: 'sessionId 필요' }, { status: 400 });
    }

    // 세션 + 참가자 나이
    const { data: session, error: sErr } = await supabaseAdmin
      .from('sessions')
      .select('id, token, participant_id')
      .eq('id', sessionId)
      .single();
    if (sErr || !session) throw sErr || new Error('세션 없음');

    const { data: participant, error: pErr } = await supabaseAdmin
      .from('participants')
      .select('age')
      .eq('id', session.participant_id)
      .single();
    if (pErr || !participant) throw pErr || new Error('참가자 정보 없음');

    // 원자료 조회
    const { data: raws, error: rErr } = await supabaseAdmin
      .from('raw_results')
      .select('*')
      .eq('session_id', sessionId);
    if (rErr) throw rErr;
    if (!raws || raws.length < 2) {
      return NextResponse.json({ error: '원자료 부족' }, { status: 400 });
    }

    const r1 = raws.find(r => r.test_no === 1);
    const r2 = raws.find(r => r.test_no === 2);
    if (!r1 || !r2) return NextResponse.json({ error: '테스트 데이터 누락' }, { status: 400 });

    // 점수 계산
    const a1 = accT1(r1.accuracy_count || 0);
    const s1 = spdT1(r1.avg_reaction_ms || 0);
    const a2 = accT2(r2.accuracy_count || 0);
    const s2 = spdT2(r2.avg_reaction_ms || 0);

    const m = metricsFromRaw(a1, s1, a2, s2);
    const R = risks(m);

    // 동나이대 평균: cohort 테이블에서 age±5 구간 찾기 (없으면 70)
    const age = participant.age ?? 60;
    let ciPeer = 70;
    const { data: cohort, error: cErr } = await supabaseAdmin
      .from('age_cohort_stats')
      .select('ci_avg, age_min, age_max')
      .lte('age_min', age)
      .gte('age_max', age)
      .maybeSingle();
    // cErr 는 무시하고, 데이터가 있으면 사용
    if (cohort && typeof cohort.ci_avg === 'number') {
      ciPeer = Number(cohort.ci_avg);
    }

    const myCi = ci(m);
    const bAge = brainAge(myCi, ciPeer, age);

    // metrics upsert
    const { error: upErr } = await supabaseAdmin.from('metrics').upsert({
      session_id: sessionId,
      memory: m.memory,
      comprehension: m.comprehension,
      focus: m.focus,
      judgment: m.judgment,
      agility: m.agility,
      endurance: m.endurance,
      risk_adhd: R.r_adhd,
      risk_stress: R.r_stress,
      risk_dementia: R.r_dementia,
      risk_forgetful: R.r_forget,
      brain_age: bAge,
      overall_comment: '',
      detail_analysis: '',
      routine: {}
    });
    if (upErr) throw upErr;

    const base = process.env.REPORT_BASE_URL ?? '';
    const reportUrl = base ? `${base}/${session.token}` : `/report/${session.token}`;

    return NextResponse.json({ ok: true, reportUrl });
  } catch (e: any) {
    return NextResponse.json({ error: e?.message ?? 'unknown' }, { status: 500 });
  }
}
