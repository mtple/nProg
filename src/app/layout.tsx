import type { Metadata } from "next";
import Image from "next/image";
import { Geist, Geist_Mono, Playfair_Display } from "next/font/google";
import "./globals.css";
import QueryProvider from "@/providers/QueryProvider";
import AuthProvider from "@/providers/AuthProvider";
import AudioProvider from "@/providers/AudioProvider";
import Header from "@/components/Layout/Header";
import AudioPlayer from "@/components/AudioPlayer/AudioPlayer";
import FarcasterSDK from "@/components/FarcasterSDK";

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
  description: "The sounds of In Process",
  icons: {
    icon: [
      { url: "/favicon-96x96.png", sizes: "96x96", type: "image/png" },
    ],
    apple: "/apple-touch-icon.png",
  },
  manifest: "/site.webmanifest",
  openGraph: {
    title: "nProg",
    description: "The sounds of In Process",
    images: [{ url: "/embed.png", width: 1200, height: 800 }],
    type: "website",
  },
  other: {
    "fc:frame": JSON.stringify({
      version: "1",
      imageUrl: "/embed.png",
      button: {
        title: "Listen Now",
        action: {
          type: "launch_frame",
          name: "nProg",
          splashImageUrl: "/favicon-96x96.png",
          splashBackgroundColor: "#131112",
        },
      },
    }),
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="dark">
      <body
        className={`${geistSans.variable} ${geistMono.variable} ${playfair.variable} antialiased text-zinc-50`}
      >
        <QueryProvider>
          <AuthProvider>
            <AudioProvider>
              <Header />
              <main className="pb-24">
                {children}
                <div className="mx-auto w-full max-w-6xl px-4 py-16">
                  <Image
                    src="/logo.png"
                    alt="nProg"
                    width={1200}
                    height={1200}
                    className="w-full opacity-40"
                    priority={false}
                  />
                </div>
              </main>
              <AudioPlayer />
              <FarcasterSDK />
            </AudioProvider>
          </AuthProvider>
        </QueryProvider>
      </body>
    </html>
  );
}
