import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import QueryProvider from "@/providers/QueryProvider";
import AudioProvider from "@/providers/AudioProvider";
import Header from "@/components/Layout/Header";
import AudioPlayer from "@/components/AudioPlayer/AudioPlayer";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "nProg",
  description: "Music from the InProcess timeline",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="dark">
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased bg-zinc-950 text-zinc-50`}
      >
        <QueryProvider>
          <AudioProvider>
            <Header />
            <main className="pb-24">{children}</main>
            <AudioPlayer />
          </AudioProvider>
        </QueryProvider>
      </body>
    </html>
  );
}
