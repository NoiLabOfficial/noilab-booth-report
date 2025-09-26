'use client';
import { useState, useEffect } from 'react';
import { useParams } from 'next/navigation';
import QRCode from 'qrcode';

export default function SessionPage() {
  const { id } = useParams<{id:string}>();
  const [t1, setT1] = useState({ accuracy:'', rt:'' });
  const [t2, setT2] = useState({ accuracy:'', rt:'' });
  const [qr, setQr] = useState<string>('');
  const [reportUrl, setReportUrl] = useState<string>('');
  const [loading, setLoading] = useState(false);

  const handleSave = async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/results', {
        method:'POST',
        headers:{ 'Content-Type':'application/json' },
        body: JSON.stringify({
          sessionId: id,
          test1: { accuracy: Number(t1.accuracy), rt: Number(t1.rt) },
          test2: { accuracy: Number(t2.accuracy), rt: Number(t2.rt) },
        })
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data?.error || '저장 실패');

      const c = await fetch('/api/compute', {
        method:'POST',
        headers:{ 'Content-Type':'application/json' },
        body: JSON.stringify({ sessionId: id })
      });
      const d = await c.json();
      if (!c.ok) throw new Error(d?.error || '계산 실패');

      setReportUrl(d.reportUrl);
      const png = await QRCode.toDataURL(d.reportUrl, { width: 240, margin: 1 });
      setQr(png);
    } catch (e:any) {
      alert(e?.message ?? '에러');
    } finally { setLoading(false); }
  };

  return (
    <main style={{maxWidth:640, margin:'40px auto', padding:24}}>
      <h1>결과 입력</h1>
      <p style={{color:'#666'}}>Test1: 최대 15 / 평균 RT≈2500ms · Test2: 최대 22 / 평균 RT≈650ms</p>

      <section style={{display:'grid', gap:8, marginTop:16}}>
        <h3>Test 1</h3>
        <input placeholder="정확도(개)" inputMode="numeric" value={t1.accuracy} onChange={e=>setT1(s=>({...s, accuracy:e.target.value}))}/>
        <input placeholder="평균 반응시간(ms)" inputMode="numeric" value={t1.rt} onChange={e=>setT1(s=>({...s, rt:e.target.value}))}/>
      </section>

      <section style={{display:'grid', gap:8, marginTop:16}}>
        <h3>Test 2</h3>
        <input placeholder="정확도(개)" inputMode="numeric" value={t2.accuracy} onChange={e=>setT2(s=>({...s, accuracy:e.target.value}))}/>
        <input placeholder="평균 반응시간(ms)" inputMode="numeric" value={t2.rt} onChange={e=>setT2(s=>({...s, rt:e.target.value}))}/>
      </section>

      <button onClick={handleSave} disabled={loading} style={{marginTop:16}}>
        {loading ? '계산 중…' : '저장 & 리포트 생성'}
      </button>

      {reportUrl && (
        <div style={{marginTop:24, display:'flex', gap:16, alignItems:'center'}}>
          <div>
            <b>리포트 링크</b>
            <div><a href={reportUrl} target="_blank">{reportUrl}</a></div>
          </div>
          {qr && <img src={qr} alt="QR" width={160} height={160}/>}
        </div>
      )}
    </main>
  );
}
