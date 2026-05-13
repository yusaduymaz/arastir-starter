import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Araştır Projesi",
  description: "AI-Powered Research Agent",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="tr">
      <body>{children}</body>
    </html>
  );
}
