import type { Metadata } from "next";

import { CookieConsent } from "./layout.client";

import "react-consent-management-banner/dist/index.css";

import "./globals.css";
import Script from "next/script";

export const metadata: Metadata = {
  title: "Example for react-consent-management-banner",
  description: "Example for react-consent-management-banner",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={`antialiased`} suppressHydrationWarning>
        {children}

        <Script
          id="gg-sc"
          src={`https://www.googletagmanager.com/gtag/js?id=${process.env
            .NEXT_PUBLIC_GOOGLE_TAG!}`}
          async
        ></Script>

        <CookieConsent GA_TRACKING_ID={process.env.NEXT_PUBLIC_GOOGLE_TAG!} />
      </body>
    </html>
  );
}
