export default function ReportPage({ params }: { params: { token: string } }) {
  return (
    <main style={{maxWidth:720, margin:'40px auto', padding:24}}>
      <h1>뇌지컬 리포트</h1>
      <p>토큰: {params.token}</p>
      <p>다음 단계에서 레이더/반원 도넛/종합평가를 붙일게요.</p>
    </main>
  );
}
