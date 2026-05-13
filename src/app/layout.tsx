import type { Metadata } from "next";
import "./globals.css";
import { ClerkProvider } from "@clerk/nextjs";

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
    <ClerkProvider>
      <html lang="tr" className="dark">
        <head>
          <link
            href="https://fonts.googleapis.com/css2?family=Material+Symbols+Outlined:wght,FILL@100..700,0..1&display=swap"
            rel="stylesheet"
          />
          <link
            href="https://fonts.googleapis.com/css2?family=Inter:wght@400;600&family=Montserrat:wght@600;700&display=swap"
            rel="stylesheet"
          />
        </head>
        <body className="bg-background text-on-background font-body-md antialiased pt-20">
          {children}
        </body>
      </html>
    </ClerkProvider>
  );
}
