import type { Metadata } from "next";
import "./globals.css";
import { ClerkProvider } from "@clerk/nextjs";
import { dark } from "@clerk/themes";

export const metadata: Metadata = {
  title: "Araştır - High-conversion landing page",
  description: "Piyasa Araştırmasında 2 Saati 10 Dakikaya İndirin",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <ClerkProvider
      appearance={{
        baseTheme: dark,
        variables: {
          colorPrimary: '#22c55e',
          colorBackground: '#0a0a0a',
          colorInputBackground: '#111111',
          colorInputText: '#f8fafc',
          colorText: '#f8fafc',
          colorTextSecondary: '#94a3b8',
          borderRadius: '0.5rem',
          fontFamily: "'Inter', sans-serif",
          fontFamilyButtons: "'Inter', sans-serif",
        },
        elements: {
          card: 'bg-[#0a0a0a] border border-[#22c55e]/20 shadow-[0_0_40px_rgba(34,197,94,0.08)]',
          userButtonPopoverCard: 'bg-[#0a0a0a] border border-[#22c55e]/20 shadow-[0_4px_32px_rgba(0,0,0,0.8)]',
          userButtonPopoverActionButton: 'text-[#e2e8f0] hover:bg-[#22c55e]/10',
          userButtonPopoverActionButtonText: 'text-[#e2e8f0]',
          userButtonPopoverActionButtonIcon: 'text-[#94a3b8]',
          userButtonPopoverFooter: 'hidden',
          userPreviewMainIdentifier: 'text-[#f8fafc] font-medium',
          userPreviewSecondaryIdentifier: 'text-[#94a3b8]',
          avatarBox: 'border-2 border-[#22c55e]/40',
        },
      }}
    >
      <html lang="tr" className="dark">
        <head>
          <link
            href="https://fonts.googleapis.com/css2?family=Material+Symbols+Outlined:wght,FILL@100..700,0..1&display=swap"
            rel="stylesheet"
          />
          <link
            href="https://fonts.googleapis.com/css2?family=Inter:wght@400;600&family=Montserrat:wght@600;700&family=JetBrains+Mono:wght@400;500;700&display=swap"
            rel="stylesheet"
          />
        </head>
        <body className="bg-[#0A121E] text-on-background font-body-md antialiased">
          {children}
        </body>
      </html>
    </ClerkProvider>
  );
}
