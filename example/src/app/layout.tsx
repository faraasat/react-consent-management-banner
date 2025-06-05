import type { Metadata } from "next";

import { CookieConsent } from "./layout.client";

import "react-consent-management-banner/dist/style.css";

import "./globals.css";

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

        <CookieConsent />
      </body>
    </html>
  );
}
