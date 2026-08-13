import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { Toaster } from "@/components/ui/toaster";
import { Providers } from "@/components/providers";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Aïmane Affagnon — Catalogue & Offres",
  description:
    "Aïmane Affagnon — entrepreneur, formation et accompagnement business. Découvrez le catalogue de produits et de programmes.",
  keywords: [
    "Aïmane Affagnon",
    "catalogue",
    "formation business",
    "entrepreneuriat",
  ],
  authors: [{ name: "Aïmane Affagnon" }],
  icons: {
    icon: "/logo.svg",
  },
  openGraph: {
    title: "Aïmane Affagnon — Catalogue & Offres",
    description:
      "Catalogue de produits et de programmes par Aïmane Affagnon.",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "Aïmane Affagnon — Catalogue & Offres",
    description:
      "Catalogue de produits et de programmes par Aïmane Affagnon.",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="fr" className="dark" suppressHydrationWarning>
      <body
        className={`${geistSans.variable} ${geistMono.variable} min-h-screen flex flex-col`}
      >
        <Providers>
          {children}
          <Toaster />
        </Providers>
      </body>
    </html>
  );
}
