'use client';
import { useState } from 'react';
import Link from 'next/link';

export default function RegisterPage() {
  const [form, setForm] = useState({ name:'', age:'', gender:'', mbti:'' });
  const [res, setRes] = useState<{sessionId?:string, reportUrl?:string, token?:string} | null>(null);
  const [loading, setLoading] = useState(false);
  const onChange = (k:string, v:string)=> setForm(prev=>({...prev, [k]:v}));

  const submit = async () => {
    setLoading(true);
    setRes(null);
    try {
      const r = await fetch('/api/register', {
        method:'POST',
        headers:{ 'Content-Type':'application/json' },
        body: JSON.stringify({ 
          name: form.name.trim(),
          age: Number(form.age),
          gender: form.gender || null,
          mbti: form.mbti || null
        })
      });
      const data = await r.json();
      if (!r.ok) throw new Error(data?.error || '등록 실패');
      setRes({ sessionId: data.session.id, reportUrl: data.session.reportUrl, token: data.session.token });
    } catch (e:any) {
      alert(e?.message ?? '에러');
    } finally { setLoading(false); }
  };

  return (
    <main style={{maxWidth:560, margin:'40px auto', padding:24}}>
      <h1>참가자 등록</h1>
      <div style={{display:'grid', gap:12, marginTop:12}}>
        <input placeholder="이름*" value={form.name} onChange={e=>onChange('name', e.target.value)} />
        <input placeholder="나이*" inputMode="numeric" value={form.age} onChange={e=>onChange('age', e.target.value)} />
        <input placeholder="성별" value={form.gender} onChange={e=>onChange('gender', e.target.value)} />
        <input placeholder="MBTI(내부용)" value={form.mbti} onChange={e=>onChange('mbti', e.target.value)} />
        <button onClick={submit} disabled={loading || !form.name || !form.age}>
          {loading ? '등록 중...' : '등록하기'}
        </button>
      </div>

      {res && (
        <div style={{marginTop:24, padding:16, border:'1px solid #eee', borderRadius:8}}>
          <div style={{marginBottom:8}}><b>리포트 링크</b><div><a href={res.reportUrl} target="_blank">{res.reportUrl}</a></div></div>
          <div style={{display:'flex', gap:8}}>
            <Link href={`/staff/session/${res.sessionId}`}><button>결과 입력으로 이동</button></Link>
            <Link href={`/qr/${res.token}`} target="_blank"><button>QR 보기</button></Link>
          </div>
        </div>
      )}
    </main>
  );
}
