import type { Metadata } from "next";
import localFont from "next/font/local";
import "./globals.css";
import { SiteHeader } from "@/components/header";

const geistSans = localFont({
  src: "./fonts/GeistVF.woff",
  variable: "--font-geist-sans",
  weight: "100 900",
});
const geistMono = localFont({
  src: "./fonts/GeistMonoVF.woff",
  variable: "--font-geist-mono",
  weight: "100 900",
});

export const metadata: Metadata = {
  title: "Sentinel — Pre-Shift Risk for Phoebe",
  description:
    "12 hours ahead of the callout. A predictive layer for the Phoebe scheduling agent.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased font-sans`}
      >
        <SiteHeader />
        <main className="max-w-[1200px] mx-auto px-6 py-6 lg:py-8">
          {children}
        </main>
        <footer className="max-w-[1200px] mx-auto px-6 py-8 text-[11px] text-ink-faint num flex items-center justify-between border-t border-line mt-8">
          <span>Sentinel · prototype · synthetic data · {new Date().getFullYear()}</span>
          <span className="text-ink-muted">a portfolio piece for phoebe.work</span>
        </footer>
      </body>
    </html>
  );
}
