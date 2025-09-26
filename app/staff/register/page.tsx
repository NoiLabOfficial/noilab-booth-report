'use client';
import { useState } from 'react';

export default function RegisterPage() {
  const [form, setForm] = useState({ name:'', age:'', gender:'', mbti:'' });
  const [result, setResult] = useState<{reportUrl?:string, token?:string}|null>(null);
  const [loading, setLoading] = useState(false);
  const onChange = (k:string, v:string)=> setForm(prev=>({...prev, [k]:v}));

  const submit = async () => {
    setLoading(true);
    setResult(null);
    try {
      const res = await fetch('/api/register', {
        method:'POST',
        headers:{ 'Content-Type':'application/json' },
        body: JSON.stringify({ 
          name: form.name.trim(),
          age: Number(form.age),
          gender: form.gender || null,
          mbti: form.mbti || null // 내부 저장만, 출력 금지
        })
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data?.error || '등록 실패');
      setResult({ reportUrl: data.session.reportUrl, token: data.session.token });
    } catch (e:any) {
      alert(e?.message ?? '에러');
    } finally {
      setLoading(false);
    }
  };

  return (
    <main style={{maxWidth:560, margin:'40px auto', padding:24}}>
      <h1 style={{marginBottom:8}}>참가자 등록</h1>
      <p style={{color:'#666', marginBottom:16}}>이름/나이 필수, 성별/MBTI는 선택(출력엔 미반영)</p>

      <div style={{display:'grid', gap:12}}>
        <input placeholder="이름*" value={form.name} onChange={e=>onChange('name', e.target.value)} />
        <input placeholder="나이*" inputMode="numeric" value={form.age} onChange={e=>onChange('age', e.target.value)} />
        <input placeholder="성별" value={form.gender} onChange={e=>onChange('gender', e.target.value)} />
        <input placeholder="MBTI(내부용)" value={form.mbti} onChange={e=>onChange('mbti', e.target.value)} />
        <button onClick={submit} disabled={loading || !form.name || !form.age}>
          {loading ? '등록 중...' : '등록하기'}
        </button>
      </div>

      {result?.reportUrl && (
        <div style={{marginTop:24, padding:16, border:'1px solid #eee', borderRadius:8}}>
          <b>리포트 링크</b>
          <div><a href={result.reportUrl} target="_blank" rel="noreferrer">{result.reportUrl}</a></div>
          <div style={{fontSize:12, color:'#666'}}>token: {result.token}</div>
        </div>
      )}
    </main>
  );
}
