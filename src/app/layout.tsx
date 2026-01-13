import type { Metadata, Viewport } from "next";
import { Inter } from "next/font/google";
import "./globals.css";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "Smart Field: Asphalt Calculator by Mehdi Lakhouane",
  description: "Advanced field assistant for asphalt professionals. Developed by Mehdi Lakhouane, featuring German Standards (RStO), Logistics planning, and Quality Control tools.",
  applicationName: "Smart Field",
  authors: [{ name: "Mehdi Lakhouane", url: "https://mehdi-lakhouanes-projects.vercel.app" }],
  keywords: ["Asphalt Calculator", "Mehdi Lakhouane", "Smart Field", "Construction App", "Bitumen", "RStO", "German Standards", "Paving Tools"],
  manifest: "/manifest.json",
  icons: {
    apple: "/icon.png",
  },
  openGraph: {
    title: "Smart Field by Mehdi Lakhouane",
    description: "The ultimate Asphalt & Logistics calculator for professionals.",
    siteName: "Smart Field",
    type: "website",
  }
};

export const viewport: Viewport = {
  themeColor: "#0a0a0a",
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
  userScalable: false, // Often desired for app-like feel
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="dark">
      <body className={`${inter.className} antialiased`}>
        {children}
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify({
              "@context": "https://schema.org",
              "@type": "SoftwareApplication",
              "name": "Smart Field: Asphalt Calculator",
              "operatingSystem": "Web, iOS, Android",
              "applicationCategory": "ConstructionApplication",
              "author": {
                "@type": "Person",
                "name": "Mehdi Lakhouane",
                "jobTitle": "Software Engineer & Builder",
                "url": "https://mehdi-lakhouanes-projects.vercel.app"
              },
              "offers": {
                "@type": "Offer",
                "price": "0",
                "priceCurrency": "USD"
              },
              "description": "Professional asphalt calculator with German Standards, logistics tracking, and quality control tools. Created by Mehdi Lakhouane."
            }),
          }}
        />
      </body>
    </html>
  );
}
