export const metadata = { title: "NoiLab Booth Report v2" };

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="ko">
      <body style={{ fontFamily: "system-ui, -apple-system, Segoe UI, Roboto, 'Noto Sans KR', sans-serif" }}>
        {children}
      </body>
    </html>
  );
}
