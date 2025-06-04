# 🍪 Advanced Cookie Consent Banner

A fully configurable and lightweight cookie consent banner for React applications. Supports customizable layout, button text, and preference modal with persistent storage in localStorage.

## 📦 Installation

```bash
npm i react-consent-management-banner

yarn add react-consent-management-banner

pnpm i react-consent-management-banner

bun add react-consent-management-banner
```

## ⚙️ Demo

Banner

![Banner](https://github.com/faraasat/react-consent-management-banner/blob/main/github-imgs/banner.png)

Preferences

![preferences](https://github.com/faraasat/react-consent-management-banner/blob/main/github-imgs/preferences.png)

## 🚀 Features

- ✅ Accept all cookies or reject non-essential ones
- ⚙️ Fully configurable preference modal
- 📍 Banner position (top / bottom)
- 📌 Settings button position (top-left, top-right, bottom-left, bottom-right)
- 🧠 Smart persistence via localStorage
- 📜 Links to Cookie Policy, Privacy Policy, and Terms
- ✨ Lightweight and easy to style

## 🧑‍💻 Usage

For React:

```jsx
import React from "react";
import { CookieConsent } from "react-consent-management-banner";

import "react-consent-management-banner/dist/style.css";

function App() {
  return (
    <div>
      <CookieConsent />
    </div>
  );
}

export default App;
```

For Next.js (Pages Router):

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

      <CookieConsent />
    </React.Fragment>
  );
}

export default MyApp;
```

For Next.js (App Router):

```jsx
// layout.jsx|tsx
import React from "react";
import { CookieConsent } from "react-consent-management-banner";

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

        <CookieConsent />
      </body>
    </html>
  );
}

export default RootLayout;
```

## 🛠 Configuration Options

You can pass a custom config prop to override defaults:

```jsx
<CookieConsent config={customConfig} />
```

## 🔧 Config object structure

```ts
type CookieConsentConfig = {
  banner: {
    className?: CSSProperties;
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
    className?: CSSProperties;
    button: { savePreferencesText?: string; goBackText?: string };
    options: Array<IPreferenceOption>;
  };
  cookieFloatingButton: {
    position: "top-left" | "top-right" | "bottom-left" | "bottom-right";
    Component: JSX.Element | JSX.Element[];
    show: boolean;
  };
  backgroundColor: string;
  linkColor: string;
  buttonBackgroundColor: string;
  textColor: string;
};
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
  "necessary": true,
  "advertisement": false,
  "analytical": true
}
```

Only `alwaysEnabled: true` options are locked on and non-toggle-able.

## ❓FAQ

### Q: Does this banner block cookies automatically?

A: No, it simply records preferences. You must use these values in your app logic to conditionally load scripts or send tracking data.

### Q: Is it compliant with GDPR/CCPA?

A: It provides necessary UX components, but legal compliance depends on how you use stored preferences to enable/disable cookies.

### Q: Can I add custom preference categories?

A: Yes! Just add entries in preferencesOptions with your desired key and label.

## 🧑‍🎓 Credits

Developed with ❤️ by **[Farasat Ali](https://github.com/faraasat)**
Feedback and contributions welcome!
