'use client';
import { useEffect, useState } from 'react';

const KEY = 'noilab_staff_ok';
const PUBLIC_PIN = process.env.NEXT_PUBLIC_STAFF_PIN || '1234';

export default function PinGate({ children }: { children: React.ReactNode }) {
  const [ok, setOk] = useState(false);
  const [pin, setPin] = useState('');
  const [err, setErr] = useState('');

  useEffect(() => {
    setOk(sessionStorage.getItem(KEY) === '1');
  }, []);

  const submit = () => {
    if ((pin || '').trim() === PUBLIC_PIN) {
      sessionStorage.setItem(KEY, '1');
      setOk(true);
      setErr('');
    } else {
      setErr('잘못된 PIN 입니다');
    }
  };

  if (!ok) {
    return (
      <main style={{maxWidth:420, margin:'80px auto', padding:24}}>
        <h2 style={{marginBottom:12}}>스태프 전용</h2>
        <input
          type="password" inputMode="numeric" placeholder="4자리 PIN"
          value={pin} onChange={e=>setPin(e.target.value)}
          style={{width:'100%', padding:12, border:'1px solid #ddd', borderRadius:8}}
        />
        <button onClick={submit} style={{marginTop:12, padding:'10px 14px', borderRadius:8}}>
          입장
        </button>
        {err && <p style={{color:'crimson', marginTop:8}}>{err}</p>}
      </main>
    );
  }
  return <>{children}</>;
}
