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

You do **not** need to add the `gtag` snippet yourself. The component sets the
denied-by-default consent state *first*, then injects Google's script — so
nothing is measured before the visitor has chosen.

Already manage gtag yourself? Pass `GA_TRACKING_ID={null}` and the component
will set Consent Mode state without injecting anything.

> **Next.js App Router:** the package ships the `"use client"` directive.

## Consent Mode v2

Before any interaction:

```js
gtag("consent", "default", {
  ad_storage: "denied",
  ad_personalization: "denied",
  ad_user_data: "denied",
  analytics_storage: "denied",
  personalization_storage: "denied",
  functionality_storage: "granted",
  security_storage: "granted",
});
```

Then a `consent` `update` once a choice is saved. Only keys Consent Mode
actually understands are forwarded — your own custom categories are yours to
act on via `onPreferencesChange`.

## Layout & position

| `layout` | `position` | Result |
| --- | --- | --- |
| `"bar"` (default) | `"bottom"` / `"top"` | Full-width bar, horizontal above 880px |
| `"card"` | `"bottom-right"`, `"bottom-left"`, `"top-right"`, `"top-left"` | Compact 420px corner panel |

```tsx
<CookieConsent
  GA_TRACKING_ID="G-XXXXXXXXXX"
  config={{ banner: { layout: "card", position: "bottom-right" } }}
/>
```

**On screens under 600px every layout collapses to a bottom sheet** — full
width, top-rounded, safe-area aware, with stacked full-width buttons. Corner
cards are unusable at phone widths.

## Re-asking for consent

Two mechanisms, both important for staying compliant:

```tsx
<CookieConsent
  GA_TRACKING_ID="G-XXXXXXXXXX"
  config={{
    version: 2,      // bump whenever you change your categories
    expiryDays: 365, // re-ask at least annually
  }}
/>
```

| Option | Default | Why |
| --- | --- | --- |
| `version` | `1` | A choice made against older categories does not cover new ones. Bumping it treats stored consent as absent, so visitors are asked again rather than silently carrying consent they never gave. |
| `expiryDays` | `365` | Supervisory authorities generally expect consent to be refreshed at least annually. |

Consent written by earlier releases of this package (a bare preferences map) is
still honoured, so upgrading does not re-prompt everyone.

## Storage

Defaults to `localStorage`, wrapped so blocked storage (Safari private mode,
strict privacy settings) degrades to "not persisted" rather than throwing.

`localStorage` is **not shared across subdomains**. If you need one choice to
cover `www.` and `app.`, supply a cookie-backed store:

```tsx
const cookieStorage = {
  getItem: (k) =>
    document.cookie.match(new RegExp(`(^| )${k}=([^;]+)`))?.[2] ?? null,
  setItem: (k, v) => {
    document.cookie = `${k}=${v};domain=.example.com;path=/;max-age=31536000;SameSite=Lax`;
  },
  removeItem: (k) => {
    document.cookie = `${k}=;domain=.example.com;path=/;max-age=0`;
  },
};

<CookieConsent GA_TRACKING_ID="G-XXXX" config={{ storage: cookieStorage }} />;
```

| Option | Type | Default | Description |
| --- | --- | --- | --- |
| `storage` | `ConsentStorage` | `localStorage` | `{ getItem, setItem, removeItem }`. |
| `storageKey` | `string` | `"cookiePreferences"` | Key used for persistence. |

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
| `banner.position` | `BannerPosition` | See layout table above. |
| `banner.layout` | `"bar" \| "card"` | Shape. |
| `banner.button.*` | `string` | Accept / reject / preferences labels. |
| `banner.links.*` | `{ title, url }` | Cookie policy, privacy policy, terms, plus `moreLinks[]`. |
| `preferences.title` / `para` | `string` | Modal copy. |
| `preferences.options` | `IPreferenceOption[]` | Your consent categories. |
| `preferences.closeLabel` | `string` | Accessible label for the close button. |
| `cookieFloatingButton.show` | `boolean` | Re-open button after a choice is made. |
| `cookieFloatingButton.position` | corner | Where it sits. |
| `cookieFloatingButton.Component` | `ComponentType<SVGProps>` | Your own icon. |
| `cookieFloatingButton.label` | `string` | Its accessible name. |
| `colorScheme` | `"auto" \| "light" \| "dark"` | `auto` follows `prefers-color-scheme`. |
| `zIndex` | `number` | Stacking order. Default `99999`. |
| `onPreferencesChange` | `(prefs, consentGiven) => void` | Fires on every change. |

### Reading consent back

```tsx
const config = {
  onPreferencesChange: (prefs, consentGiven) => {
    if (prefs.analytics_storage) startAnalytics();
  },
};

<CookieConsent GA_TRACKING_ID="G-XXXX" config={config} />;
// config.getConsentGiven() and config.getConsentPreferences() are populated
// on the object you passed in.
```

### Custom categories

```tsx
<CookieConsent
  GA_TRACKING_ID="G-XXXXXXXXXX"
  config={{
    version: 2, // bump, because the categories changed
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

## Theming

Four public custom properties drive everything else:

```css
:root {
  --cookie-consent-background-color: #fff;
  --cookie-consent-text-color: #000;
  --cookie-consent-link-color: #6ac3ff;
  --cookie-consent-button-background-color: #0073e6;
}
```

Or via config:

```tsx
<CookieConsent
  GA_TRACKING_ID="G-XXXX"
  config={{
    colorScheme: "dark",
    backgroundColor: "#131a26",
    textColor: "#e8eef8",
    buttonBackgroundColor: "#6aa9ff",
  }}
/>
```

### Button text is chosen for you

Button text defaults to white, and automatically flips to black when white
would fall below the WCAG AA contrast minimum of 4.5:1 against your accent —
so a light `buttonBackgroundColor` cannot silently produce unreadable buttons.

Override it explicitly when you want to:

```tsx
config={{ buttonBackgroundColor: "#6aa9ff", buttonTextColor: "#04101f" }}
```

| Option | Type | Default | Description |
| --- | --- | --- | --- |
| `buttonTextColor` | `string` | auto | Text on primary buttons. Unset means "pick whichever of black/white meets AA". |

## Accessibility

- The banner is a labelled `role="region"`, so screen-reader users can find it.
- The preferences modal is a real `role="dialog"` with `aria-modal`, labelled
  by its heading.
- **Focus is trapped** in the modal and restored on close; **Escape** closes it.
- Background scrolling is locked while the modal is open.
- Every control is a real `<button>` or `<input>`, keyboard operable, with
  visible focus rings.
- Honours `prefers-reduced-motion` and `prefers-color-scheme`.

## Styling

```tsx
import "react-consent-management-banner/style.css";
```

| Class | Element |
| --- | --- |
| `.ccb-wrapper` | Positioning shell |
| `.ccb-banner` | Banner surface |
| `.ccb-btn--primary` / `.ccb-btn--ghost` | Buttons |
| `.ccb-modal` / `.ccb-modal__panel` | Preferences dialog |
| `.ccb-option` | One consent category |
| `.ccb-fab` | Floating re-open button |

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
npm test          # vitest unit tests
npm run typecheck # tsc --noEmit
npm run build     # tsup
```

End-to-end tests run against the built demo in a real browser (desktop and
mobile viewports), and cover the things unit tests cannot: layout, CSS and
keyboard behaviour.

```bash
npm run build && npm --prefix example install && npm --prefix example run build
npm run test:e2e      # playwright
npm run test:e2e:ui   # interactive
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
