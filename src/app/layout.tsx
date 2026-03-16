import type { Metadata } from "next";
import { Geist, Geist_Mono, Playfair_Display } from "next/font/google";
import "./globals.css";
import QueryProvider from "@/providers/QueryProvider";
import AuthProvider from "@/providers/AuthProvider";
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

const playfair = Playfair_Display({
  variable: "--font-serif",
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
        className={`${geistSans.variable} ${geistMono.variable} ${playfair.variable} antialiased bg-zinc-950 text-zinc-50`}
      >
        <QueryProvider>
          <AuthProvider>
            <AudioProvider>
              <Header />
              <main className="pb-24">{children}</main>
              <AudioPlayer />
            </AudioProvider>
          </AuthProvider>
        </QueryProvider>
      </body>
    </html>
  );
}
