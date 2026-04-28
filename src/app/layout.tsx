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
  metadataBase: new URL("https://phoebe-prototype.vercel.app"),
  title: "Sentinel — Pre-Shift Risk for Phoebe",
  description:
    "12 hours ahead of the callout. A queue ranker for the Phoebe scheduling agent — pre-warms backups before the callout fires.",
  openGraph: {
    title: "Sentinel — Pre-Shift Risk for Phoebe",
    description:
      "Pre-warmed backups for the Phoebe Scheduler. Same agents. Warmer pool. Higher fill rate.",
    url: "https://phoebe-prototype.vercel.app",
    siteName: "Sentinel",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "Sentinel — Pre-Shift Risk for Phoebe",
    description:
      "Pre-warmed backups for the Phoebe Scheduler. Same agents. Warmer pool. Higher fill rate.",
  },
  robots: {
    index: true,
    follow: true,
  },
};

export const viewport = {
  themeColor: "#FAF7F1",
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
