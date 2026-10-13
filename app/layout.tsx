import type { Metadata, Viewport } from "next";
import { Figtree, Fraunces } from "next/font/google";
import "lenis/dist/lenis.css";
import "./globals.css";

const display = Fraunces({
  subsets: ["latin"],
  axes: ["SOFT", "opsz"],
  variable: "--font-display",
  display: "swap",
});

const text = Figtree({
  subsets: ["latin"],
  variable: "--font-text",
  display: "swap",
});

export const metadata: Metadata = {
  metadataBase: new URL(process.env.NEXT_PUBLIC_SITE_URL || "https://onistore.vercel.app"),
  title: {
    default: "OniStore · Pijamas y todo para dormir bonito",
    template: "%s · OniStore",
  },
  description:
    "Pijamas suaves, antifaces, almohadas y pequeños rituales para dormir mejor. Elige en el catálogo y pide por WhatsApp.",
  openGraph: {
    title: "OniStore · Duerme bonito",
    description: "Pijamas suaves y pequeños rituales para dormir mejor. Pide por WhatsApp.",
    locale: "es_419",
    type: "website",
  },
};

export const viewport: Viewport = {
  themeColor: "#0A0A33",
  width: "device-width",
  initialScale: 1,
  viewportFit: "cover",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="es" className={`${display.variable} ${text.variable}`} suppressHydrationWarning>
      <body>{children}</body>
    </html>
  );
}
