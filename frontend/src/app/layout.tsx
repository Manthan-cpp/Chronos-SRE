import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { SmoothScroll } from "../components/SmoothScroll";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Chronos-SRE — Autonomous Incident Time-Travel Engine",
  description: "Autonomous root-cause analysis and deterministic regression-tested healing for modern software systems.",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className={`${geistSans.variable} ${geistMono.variable} antialiased`} style={{ backgroundColor: '#06070a', color: '#f8fafc' }}>
      <body className="min-h-screen flex flex-col antialiased" style={{ backgroundColor: '#06070a', color: '#f8fafc', margin: 0, padding: 0 }}>
        <SmoothScroll>{children}</SmoothScroll>
      </body>
    </html>
  );
}
