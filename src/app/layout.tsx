import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

const APP_URL = process.env.NEXT_PUBLIC_APP_URL ?? "https://enjo-com.vercel.app";

export const metadata: Metadata = {
  title: "炎上.com — SNS炎上シミュレーター",
  description: "あなたの投稿、炎上しますか？AIが本気で燃やします🔥",
  metadataBase: new URL(APP_URL),
  openGraph: {
    title: "炎上.com — SNS炎上シミュレーター",
    description: "あなたの投稿、炎上しますか？AIが本気で燃やします🔥",
    url: APP_URL,
    siteName: "炎上.com",
    locale: "ja_JP",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "炎上.com — SNS炎上シミュレーター",
    description: "あなたの投稿、炎上しますか？AIが本気で燃やします🔥",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="ja"
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}
      suppressHydrationWarning
    >
      <body className="min-h-full flex flex-col" suppressHydrationWarning>{children}</body>
    </html>
  );
}
