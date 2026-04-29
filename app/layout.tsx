import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { ThemeProvider } from "./components/ThemeProvider";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: {
    template: "%s | MRR Stories",
    default: "MRR Stories - Indie Hacker & Solopreneur Success Stories",
  },
  description: "Discover how indie hackers and solopreneurs made their first dollar and built profitable businesses. Real founders, real products, real revenue.",
  openGraph: {
    title: "MRR Stories - Indie Hacker & Solopreneur Success Stories",
    description: "Discover how indie hackers and solopreneurs made their first dollar and built profitable businesses.",
    url: "https://www.mrrstory.com",
    siteName: "MRR Stories",
    locale: "en_US",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "MRR Stories - Indie Hacker & Solopreneur Success Stories",
    description: "Discover how indie hackers and solopreneurs made their first dollar and built profitable businesses.",
  },
  icons: {
    icon: "/favicon.ico",
  },
  verification: {
    google: "oryD3hnuW3o3E_kY4AjFmNTK2NnsyZJaCJwtLFj1OSA",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={inter.className} suppressHydrationWarning>
        <ThemeProvider attribute="data-theme" defaultTheme="system" enableSystem disableTransitionOnChange>
          {children}
        </ThemeProvider>
      </body>
    </html>
  );
}
