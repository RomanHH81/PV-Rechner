import type { Metadata, Viewport } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { ThemeProvider } from "@/components/ThemeProvider";

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
});

export const metadata: Metadata = {
  title: {
    default: "PV Wirtschaftlichkeitsrechner - Photovoltaik Analyse",
    template: "%s | PV Rechner"
  },
  description:
    "Berechnen Sie die Rentabilität und Autarkie Ihrer Photovoltaikanlage in Echtzeit. Detaillierte Analyse von Ertrag, Eigenverbrauch und Amortisation.",
  keywords: ["PV Rechner", "Photovoltaik", "Wirtschaftlichkeit", "Solarrechner", "Eigenverbrauch", "Amortisation"],
  authors: [{ name: "PV-Rechner Team" }],
  creator: "PV-Rechner",
  openGraph: {
    type: "website",
    locale: "de_DE",
    url: "https://pv-rechner-pro.vercel.app", // Adjust if domain is different
    title: "PV Wirtschaftlichkeitsrechner - Kostenlose Analyse",
    description: "Modernes Dashboard zur Analyse Ihrer Solaranlage. Berechnen Sie Ersparnisse und Autarkie in Sekunden.",
    siteName: "PV Rechner",
  },
  twitter: {
    card: "summary_large_image",
    title: "PV Wirtschaftlichkeitsrechner",
    description: "Detaillierte Photovoltaik-Analyse in Echtzeit.",
  },
  robots: {
    index: true,
    follow: true,
  },
};

export const viewport: Viewport = {
  themeColor: [
    { media: "(prefers-color-scheme: light)", color: "#f1f5f9" },
    { media: "(prefers-color-scheme: dark)", color: "#020617" },
  ],
  width: "device-width",
  initialScale: 1,
  maximumScale: 5,
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="de" suppressHydrationWarning className={`${inter.variable} h-full antialiased`}>
      <body className="min-h-full font-sans">
        <ThemeProvider>
          {children}
        </ThemeProvider>
      </body>
    </html>
  );
}
