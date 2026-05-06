import type { Metadata } from "next";
import { Inter } from "next/font/google";
import Script from "next/script";
import "./globals.css";
import { ThemeProvider } from "./components/ThemeProvider";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  metadataBase: new URL('https://www.mrrstory.com'),
  title: {
    template: "%s | MRR Story",
    default: "MRR Story - Indie Hacker & Solopreneur Success Stories",
  },
  description: "Discover how indie hackers and solopreneurs made their first dollar and built profitable businesses. Real founders, real products, real revenue.",
  openGraph: {
    title: "MRR Story - Indie Hacker & Solopreneur Success Stories",
    description: "Discover how indie hackers and solopreneurs made their first dollar and built profitable businesses.",
    url: "https://www.mrrstory.com",
    siteName: "MRR Story",
    locale: "en_US",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    site: "@mrrstory",
    creator: "@mrrstory",
    title: "MRR Story - Indie Hacker & Solopreneur Success Stories",
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
          <script
            type="application/ld+json"
            dangerouslySetInnerHTML={{
              __html: JSON.stringify({
                "@context": "https://schema.org",
                "@graph": [
                  {
                    "@type": "WebSite",
                    "@id": "https://www.mrrstory.com/#website",
                    "url": "https://www.mrrstory.com",
                    "name": "MRR Story",
                    "description": "Discover how indie hackers and solopreneurs made their first dollar and built profitable businesses.",
                    "publisher": {
                      "@id": "https://www.mrrstory.com/#organization"
                    }
                  },
                  {
                    "@type": "Organization",
                    "@id": "https://www.mrrstory.com/#organization",
                    "name": "MRR Story",
                    "url": "https://www.mrrstory.com",
                    "logo": {
                      "@type": "ImageObject",
                      "url": "https://www.mrrstory.com/favicon.ico"
                    }
                  }
                ]
              })
            }}
          />
          {children}
        </ThemeProvider>

        {/* Google Analytics */}
        <Script
          src="https://www.googletagmanager.com/gtag/js?id=G-N1FD35QQ75"
          strategy="afterInteractive"
        />
        <Script id="google-analytics" strategy="afterInteractive">
          {`
            window.dataLayer = window.dataLayer || [];
            function gtag(){window.dataLayer.push(arguments);}
            gtag('js', new Date());

            gtag('config', 'G-N1FD35QQ75');
          `}
        </Script>
      </body>
    </html>
  );
}
