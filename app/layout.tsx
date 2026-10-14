import type { Metadata, Viewport } from "next";
import { Inter } from "next/font/google";
import "./globals.css";

// En iPhone y Mac se usa la letra del sistema (SF Pro); Inter la reemplaza en el resto.
const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
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
  themeColor: "#FFFFFF",
  width: "device-width",
  initialScale: 1,
  viewportFit: "cover",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="es" className={inter.variable} suppressHydrationWarning>
      <body>{children}</body>
    </html>
  );
}
