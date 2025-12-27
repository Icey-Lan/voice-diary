import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "AI 语音日记本",
  description: "温暖的 AI 日记伙伴，用声音记录生活",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="zh-CN">
      <body className="antialiased">
        {children}
      </body>
    </html>
  );
}
