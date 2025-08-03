import "@repo/ui/styles.css";
import "./globals.css";
import type { Metadata } from "next";
import { Geist } from "next/font/google";

const geist = Geist({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "Supametrics: Privacy-First Web Analytics",
  description:
    "Take control of your website data with Supametrics, an open-source analytics platform. A lightweight and privacy-friendly alternative to Google Analytics, designed for self-hosting and complete data ownership.",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <head>
        <link
          rel="stylesheet"
          href="https://api.fontshare.com/v2/css?f[]=switzer@100,200,300,400,500,600,700,800,900&display=swap"
        />
      </head>
      <body className={geist.className}>{children}</body>
    </html>
  );
}
