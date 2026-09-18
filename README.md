<p align="center">
  <img src="https://raw.githubusercontent.com/faraasat/react-consent-management-banner/main/.github/assets/banner.svg" alt="react-consent-management-banner" width="100%" />
</p>

<p align="center">
  GDPR / ePrivacy cookie consent for React — beautiful, fully customizable, and wired into Google Consent Mode v2.
</p>

<p align="center">
  <a href="https://www.npmjs.com/package/react-consent-management-banner"><img alt="npm version" src="https://img.shields.io/npm/v/react-consent-management-banner?color=cb3837&label=npm&logo=npm"></a>
  <a href="https://www.npmjs.com/package/react-consent-management-banner"><img alt="downloads" src="https://img.shields.io/npm/dm/react-consent-management-banner?color=cb3837&label=downloads"></a>
  <a href="https://bundlephobia.com/package/react-consent-management-banner"><img alt="bundle size" src="https://img.shields.io/bundlephobia/minzip/react-consent-management-banner?label=minzipped"></a>
  <a href="https://github.com/faraasat/react-consent-management-banner/actions/workflows/ci.yml"><img alt="CI" src="https://github.com/faraasat/react-consent-management-banner/actions/workflows/ci.yml/badge.svg"></a>
  <img alt="types" src="https://img.shields.io/badge/types-included-3178c6?logo=typescript&logoColor=white">
  <a href="https://github.com/faraasat/react-consent-management-banner/blob/main/LICENSE"><img alt="license" src="https://img.shields.io/npm/l/react-consent-management-banner?color=blue"></a>
</p>

<p align="center">
  <a href="https://faraasat.github.io/react-consent-management-banner/"><b>Live demo</b></a> ·
  <a href="https://www.npmjs.com/package/react-consent-management-banner">npm</a> ·
  <a href="https://github.com/faraasat/react-consent-management-banner/blob/main/CHANGELOG.md">Changelog</a> ·
  <a href="https://github.com/faraasat/react-consent-management-banner/issues">Issues</a>
</p>

---

## Why

Most consent banners either look like a default Bootstrap alert or cost a
subscription. This one is a single component: it renders the banner and the
preferences modal, persists the visitor's choice, loads `gtag` for you, and
keeps Google Consent Mode v2 in sync — with eight consent categories out of the
box.

## Installation

```bash
npm install react-consent-management-banner
```

<details>
<summary>yarn / pnpm / bun</summary>

```bash
yarn add react-consent-management-banner
pnpm add react-consent-management-banner
bun add react-consent-management-banner
```
</details>

**Peer dependency:** `react >= 17`.

## Quick start

```tsx
import { CookieConsent } from "react-consent-management-banner";
import "react-consent-management-banner/style.css";

export default function Layout({ children }) {
  return (
    <>
      {children}
      <CookieConsent GA_TRACKING_ID="G-XXXXXXXXXX" />
    </>
  );
}
```

You do **not** need to add the `gtag` snippet yourself. The component injects it
after setting the default consent state, so nothing is measured before the
visitor has chosen.

> **Next.js App Router:** the package ships the `"use client"` directive.

## Consent Mode v2

On a first visit, before any interaction, the component calls:

```js
gtag("consent", "default", {
  necessary_storage: "granted",
  security_storage: "granted",
  functionality_storage: "granted",
  ad_storage: "denied",
  ad_personalization: "denied",
  ad_user_data: "denied",
  analytics_storage: "denied",
  personalization_storage: "denied",
});
```

Once a choice is saved it issues a `consent` `update` with the visitor's actual
selection, and persists it to `localStorage` under `cookiePreferences`.

## Configuration

`config` is **deep-merged onto the defaults one level down**, so overriding a
single field keeps its siblings:

```tsx
// Keeps the default buttons, links and all eight categories.
<CookieConsent
  GA_TRACKING_ID="G-XXXXXXXXXX"
  config={{ banner: { title: "We use cookies." } }}
/>
```

| Option | Type | Description |
| --- | --- | --- |
| `banner.title` | `string` | Banner copy. |
| `banner.position` | `"top" \| "bottom"` | Where the banner sits. Default `"bottom"`. |
| `banner.button.*` | `string` | Labels for accept / reject / preferences. |
| `banner.links.*` | `{ title, url }` | Cookie policy, privacy policy, terms, plus `moreLinks[]`. |
| `preferences.title` | `string` | Modal heading. |
| `preferences.para` | `string` | Modal intro copy. |
| `preferences.options` | `IPreferenceOption[]` | The consent categories. Replace to define your own. |
| `cookieFloatingButton.show` | `boolean` | Show the re-open button after a choice is made. |
| `cookieFloatingButton.position` | `"top-left" \| "top-right" \| "bottom-left" \| "bottom-right"` | Where it sits. |
| `cookieFloatingButton.Component` | `ComponentType<SVGProps>` | Your own icon. |
| `backgroundColor` / `textColor` / `linkColor` / `buttonBackgroundColor` | `string` | Theme colours, applied as CSS custom properties. |
| `onPreferencesChange` | `(prefs, consentGiven) => void` | Fires on every change. |

### Reading consent back

```tsx
const config = {
  onPreferencesChange: (prefs, consentGiven) => {
    if (prefs.analytics_storage) startAnalytics();
  },
};

<CookieConsent GA_TRACKING_ID="G-XXXXXXXXXX" config={config} />;
// config.getConsentGiven() and config.getConsentPreferences() are populated
// on the object you passed in.
```

### Custom categories

```tsx
<CookieConsent
  GA_TRACKING_ID="G-XXXXXXXXXX"
  config={{
    preferences: {
      title: "Your choices",
      button: { savePreferencesText: "Save", goBackText: "Cancel" },
      options: [
        { key: "necessary_storage", label: "Essential", alwaysEnabled: true, description: "Required for the site to work." },
        { key: "analytics_storage", label: "Analytics", description: "Helps us improve the site." },
      ],
    },
  }}
/>
```

## Styling

```tsx
import "react-consent-management-banner/style.css";
```

Colours are exposed as CSS custom properties, so you can theme without
overriding rules:

```css
:root {
  --cookie-consent-background-color: #fff;
  --cookie-consent-text-color: #000;
  --cookie-consent-link-color: #6ac3ff;
  --cookie-consent-button-background-color: #0073e6;
}
```

## Disclaimer

This component gives you the mechanics of collecting and honouring consent. It
is not legal advice, and shipping it does not by itself make a site GDPR
compliant — that depends on what you actually do with the data.

## Contributing

Issues and pull requests are welcome.

```bash
git clone https://github.com/faraasat/react-consent-management-banner.git
cd react-consent-management-banner
npm install
npm test          # vitest
npm run typecheck # tsc --noEmit
npm run build     # tsup
```

To run the demo site against your local build:

```bash
npm run example:dev
```

Releases are manual — nothing publishes on a push to `main`. Maintainers run
the **Release** workflow from the Actions tab.

## Privacy

The published package contains **no telemetry**. The demo site at
[faraasat.github.io/react-consent-management-banner](https://faraasat.github.io/react-consent-management-banner/) uses
Google Analytics and Aptabase; the library itself never phones home.

## License

[MIT](./LICENSE) © [Farasat Ali](https://github.com/faraasat)
