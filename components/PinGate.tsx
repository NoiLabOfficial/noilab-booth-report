'use client';
import { useEffect, useState } from 'react';
import { useRouter, usePathname } from 'next/navigation';

const KEY = 'noilab_staff_ok';

export default function PinGate({ children }: { children: React.ReactNode }) {
  const [ok, setOk] = useState(false);
  const [pin, setPin] = useState('');
  const [err, setErr] = useState('');
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    const saved = sessionStorage.getItem(KEY);
    setOk(saved === '1');
  }, [pathname]);

  const submit = () => {
    const expected = process.env.NEXT_PUBLIC_DUMMY ?? ''; // 클라이언트에선 ENV 못 씀
    // 서버 ENV는 노출 금지라, 간단하게 4자리만 체크 → 1234 기본
    const right = (pin || '').trim() === (process.env.NEXT_PUBLIC_STAFF_PIN ?? '1234');
    if (right) {
      sessionStorage.setItem(KEY, '1');
      setOk(true);
      setErr('');
    } else {
      setErr('잘못된 PIN 입니다');
    }
  };

  if (!ok) {
    return (
      <div style={{maxWidth:420, margin:'80px auto', padding:24, border:'1px solid #eee', borderRadius:12}}>
        <h2 style={{marginBottom:12}}>스태프 전용</h2>
        <input
          type="password" inputMode="numeric" placeholder="4자리 PIN"
          value={pin} onChange={e=>setPin(e.target.value)}
          style={{width:'100%', padding:12, border:'1px solid #ddd', borderRadius:8}}
        />
        <button onClick={submit} style={{marginTop:12, padding:'10px 14px', borderRadius:8}}>
          입장
        </button>
        {err ? <p style={{color:'crimson', marginTop:8}}>{err}</p> : null}
        <p style={{fontSize:12, color:'#666', marginTop:10}}>브라우저를 닫으면 다시 PIN이 필요합니다.</p>
      </div>
    );
  }
  return <>{children}</>;
}
