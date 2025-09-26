'use client';
import QRCode from 'qrcode';
import { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';

export default function QRPage() {
  const { token } = useParams<{token:string}>();
  const base = process.env.NEXT_PUBLIC_REPORT_BASE || '';
  const link = base ? `${base}/${token}` : `/report/${token}`;
  const [img, setImg] = useState<string>('');

  useEffect(()=>{ QRCode.toDataURL(link, { width: 260, margin: 1 }).then(setImg); }, [link]);
  return (
    <main style={{display:'grid', placeItems:'center', minHeight:'70vh', padding:24}}>
      <img src={img} alt="QR" />
      <p style={{marginTop:12}}><a href={link} target="_blank">{link}</a></p>
    </main>
  );
}
