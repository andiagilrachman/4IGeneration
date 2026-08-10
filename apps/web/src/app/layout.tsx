import type { Metadata } from "next";
import { Inter, Space_Grotesk, JetBrains_Mono } from "next/font/google";
import { Providers } from "./providers";
import "./globals.css";

const inter = Inter({ subsets: ["latin"], variable: "--font-inter" });
const spaceGrotesk = Space_Grotesk({ subsets: ["latin"], variable: "--font-space-grotesk" });
const jetbrainsMono = JetBrains_Mono({ subsets: ["latin"], variable: "--font-jetbrains" });

export const metadata: Metadata = {
  title: {
    default: "4IGeneration — AI Intelligence Platform for Smart Investing",
    template: "%s — 4IGeneration",
  },
  description:
    "AI-native platform untuk analisis dan screening saham Indonesia. Simple AI Infrastructure for Developers.",
  keywords: [
    "saham Indonesia",
    "screener saham",
    "analisis saham AI",
    "IDX",
    "investasi",
    "API saham",
  ],
  authors: [{ name: "4IGeneration" }],
  openGraph: {
    title: "4IGeneration — AI Intelligence Platform for Smart Investing",
    description:
      "AI-native platform untuk analisis dan screening saham Indonesia. Simple AI Infrastructure for Developers.",
    type: "website",
    locale: "id_ID",
    siteName: "4IGeneration",
  },
  robots: {
    index: true,
    follow: true,
  },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="id">
      <body className={`${inter.variable} ${spaceGrotesk.variable} ${jetbrainsMono.variable}`}>
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
