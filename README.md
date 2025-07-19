# 🍪 Advanced Cookie Consent Banner

A fully configurable and lightweight cookie consent banner for React applications. Supports customizable layout, button text, and preference modal with persistent storage in localStorage — full integration with GTag, Google Analytics, and AdSense.

![npm version](https://img.shields.io/npm/v/react-consent-management-banner.svg)
![package size minified](https://img.shields.io/bundlephobia/min/react-consent-management-banner?style=plastic)
[![jsDeliver](https://data.jsdelivr.com/v1/package/npm/react-consent-management-banner/badge)](https://www.jsdelivr.com/package/npm/react-consent-management-banner)
[![JavaScript Style Guide](https://img.shields.io/badge/code_style-standard-brightgreen.svg)](https://standardjs.com)

![total downloads](https://img.shields.io/npm/dt/react-consent-management-banner.svg)
![total downloads per year](https://img.shields.io/npm/dy/react-consent-management-banner.svg)
![total downloads per week](https://img.shields.io/npm/dw/react-consent-management-banner.svg)
![total downloads per month](https://img.shields.io/npm/dm/react-consent-management-banner.svg)

[download-image]: https://img.shields.io/npm/dm/react-consent-management-banner.svg
[download-url]: https://npmjs.org/package/react-consent-management-banner

[![react-consent-management-banner](https://nodei.co/npm/react-consent-management-banner.png)](https://npmjs.org/package/react-consent-management-banner)

## 📦 Installation

```bash
npm i react-consent-management-banner

yarn add react-consent-management-banner

pnpm i react-consent-management-banner

bun add react-consent-management-banner
```

## ⚙️ Demo

Access Demo at: [Demo](https://react-consent-management-banner.vercel.app/)

### Banner

![Banner](https://github.com/faraasat/react-consent-management-banner/blob/main/github-imgs/banner.png)

### Preferences

![preferences](https://github.com/faraasat/react-consent-management-banner/blob/main/github-imgs/preferences.png)

### Integrated with Google Tag Assistant

![googletag assistant](https://github.com/faraasat/react-consent-management-banner/blob/main/github-imgs/googletag-assistant.png)

## 🚀 Features

- ✅ Accept all cookies or reject non-essential ones
- ⚙️ Fully configurable preference modal
- 📍 Banner position (top / bottom)
- 📌 Settings button position (top-left, top-right, bottom-left, bottom-right)
- 🧠 Smart persistence via localStorage
- 📜 Links to Cookie Policy, Privacy Policy, and Terms
- ✨ Lightweight and easy to style

## 🧑‍💻 Usage

### For React

```jsx
import React from "react";
import { CookieConsent } from "react-consent-management-banner";

import "react-consent-management-banner/dist/style.css";

function App() {
  return (
    <div>
      <CookieConsent GA_TRACKING_ID="<YOUR_TRACKING_ID>" />
    </div>
  );
}

export default App;
```

### For Next.js (Pages Router)

```jsx
// _app.jsx|tsx
import React from "react";
import type { AppProps } from "next/app";
import { CookieConsent } from "react-consent-management-banner";

import "react-consent-management-banner/dist/style.css";

function MyApp({ Component, pageProps }: AppProps) {
  return (
    <React.Fragment>
      <Component {...pageProps} />

      <CookieConsent GA_TRACKING_ID="<YOUR_TRACKING_ID>" />
    </React.Fragment>
  );
}

export default MyApp;
```

### For Next.js (App Router)

For App Router, we have to first export it from the client component and for this make a new file with any name and do this:

```jsx
// layout.client.ts
"use client";

import { CookieConsent } from "react-consent-management-banner";

export { CookieConsent };
```

```jsx
// layout.jsx|tsx
import React from "react";

import { CookieConsent } from "layout.client.ts";

import "react-consent-management-banner/dist/style.css";

function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode,
}>) {
  return (
    <html lang="en">
      <body>
        {children}

        <CookieConsent GA_TRACKING_ID="<YOUR_TRACKING_ID>" />
      </body>
    </html>
  );
}

export default RootLayout;
```

## 🛠 Configuration Options

You can pass a custom config prop to override defaults:

```jsx
<CookieConsent config={customConfig} GA_TRACKING_ID="<YOUR_TRACKING_ID>" />
```

## 🔧 Config object structure

```ts
type CookieConsentConfig = {
  banner: {
    className?: string;
    title?: string;
    position?: "top" | "bottom";
    button: {
      acceptAlText?: string;
      rejectNonEssentialText?: string;
      preferencesText?: string;
    };
    links: {
      cookiePolicy?: IMoreLinks;
      privacyPolicy?: IMoreLinks;
      terms?: IMoreLinks;
      moreLinks?: Array<IMoreLinks>;
    };
  };
  preferences: {
    title: string;
    para?: string;
    className?: string;
    button: { savePreferencesText?: string; goBackText?: string };
    options: Array<IPreferenceOption>;
  };
  cookieFloatingButton: {
    position: "top-left" | "top-right" | "bottom-left" | "bottom-right";
    Component: React.JSX.Element | React.JSX.Element[] | React.ReactNode;
    show: boolean;
  };
  backgroundColor: string;
  linkColor: string;
  buttonBackgroundColor: string;
  textColor: string;
  onPreferencesChange?: (
    preferences: Record<string, boolean>,
    consentGiven: boolean
  ) => void;
  getConsentGiven?: () => void;
  getConsentPreferences?: () => void;
};

interface IMoreLinks {
  title: string;
  url: string;
}
```

## 🧠 How It Works

- On initial load, if no preferences are stored, the banner is shown.
- Clicking Accept All enables all cookie types.
- Clicking Reject Non-Essentials enables only alwaysEnabled options (e.g., Necessary).
- Preferences are stored in localStorage under the key cookiePreferences.
- A floating settings button appears after consent is given, allowing users to adjust preferences later.

## 🗂 Local Storage Structure

```json
{
  "ad_personalization": true,
  "ad_storage": true,
  "ad_user_data": true,
  "analytics_storage": true,
  "functionality_storage": true,
  "necessary_storage": true,
  "personalization_storage": true,
  "security_storage": true
}
```

Only `alwaysEnabled: true` options are locked on and non-toggle-able.

## ❓FAQ

### Q: Does this banner block cookies automatically?

A: No, it simply records preferences and send them to the GTag.

### Q: Is it compliant with GDPR/CCPA?

A: It provides necessary UX components, but legal compliance depends on how you use stored preferences to enable/disable cookies.

### Q: Can I add custom preference categories?

A: Yes!

## 🧑‍🎓 Credits

Developed with ❤️ by **[Farasat Ali](https://github.com/faraasat)**
Feedback and contributions welcome!
