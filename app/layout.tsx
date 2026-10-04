import type { Metadata, Viewport } from "next";
import { Andika, Fredoka, Patrick_Hand } from "next/font/google";
import { SiteHeader } from "@/components/SiteHeader";
import "./globals.css";

const fredoka = Fredoka({ subsets: ["latin"], weight: ["400", "500", "600", "700"], variable: "--font-fredoka", display: "swap" });
const hand = Patrick_Hand({ subsets: ["latin"], weight: "400", variable: "--font-hand", display: "swap" });
const andika = Andika({ subsets: ["latin"], weight: ["400", "700"], variable: "--font-andika", display: "swap" });

export const metadata: Metadata = {
  title: "Fichtre !",
  description: "Révise la lecture et le calcul avec des fiches à retourner.",
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  themeColor: "#8ec5ee",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="fr" className={`${andika.variable} ${fredoka.variable} ${hand.variable}`}>
      <body>
        <SiteHeader />
        {children}
      </body>
    </html>
  );
}
