import type { Metadata } from "next";
import { Analytics } from "@/components/analytics";
import "react-consent-management-banner/style.css";
import "./globals.css";

export const metadata: Metadata = {
  title: "react-consent-management-banner — live demo",
  description:
    "GDPR / ePrivacy cookie consent for React, wired into Google Consent Mode v2.",
};

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body suppressHydrationWarning>
        {children}
        {/*
          Only Aptabase is mounted here. Google Analytics is deliberately left
          to CookieConsent itself, which loads gtag and sets Consent Mode v2
          according to the visitor's choice — that is the whole point of the
          package, so the demo must not load GA behind its back.
        */}
        <Analytics packageName="react-consent-management-banner" />
      </body>
    </html>
  );
}
