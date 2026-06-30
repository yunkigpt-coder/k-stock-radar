import type { Metadata } from "next";
import type { ReactNode } from "react";
import "./globals.css";

export const metadata: Metadata = {
  title: "K-Stock Radar",
  description: "국내 주식 뉴스, 공시, 재무, 주가 데이터를 결합한 투자 판단 보조용 리서치 Agent"
};

export default function RootLayout({ children }: Readonly<{ children: ReactNode }>) {
  return (
    <html lang="ko">
      <body>{children}</body>
    </html>
  );
}
