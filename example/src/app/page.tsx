"use client";

import { useState } from "react";
import { CookieConsent } from "react-consent-management-banner";
import type { BannerLayout, BannerPosition } from "react-consent-management-banner";
import { Hero } from "@/components/hero";
import { Footer } from "@/components/footer";
import { Code } from "@/components/code";
import { track } from "@/components/analytics";

// No placeholder fallback: a bogus id would silently send the demo's consent
// signals to a property that does not exist. Missing config should be visible.
const GA_ID = process.env.NEXT_PUBLIC_GA_MEASUREMENT_ID ?? null;

const POSITIONS: BannerPosition[] = [
  "bottom",
  "top",
  "bottom-right",
  "bottom-left",
  "top-right",
];

export default function Home() {
  const [prefs, setPrefs] = useState<Record<string, boolean>>({});
  const [given, setGiven] = useState(false);
  const [remount, setRemount] = useState(0);
  const [position, setPosition] = useState<BannerPosition>("bottom");
  const [layout, setLayout] = useState<BannerLayout>("bar");
  const [scheme, setScheme] = useState<"auto" | "light" | "dark">("auto");

  const reset = () => {
    localStorage.removeItem("cookiePreferences");
    setPrefs({});
    setGiven(false);
    setRemount((r) => r + 1);
    track("consent_reset");
  };

  return (
    <main className="wrap">
      <Hero />

      <CookieConsent
        key={`${remount}-${position}-${layout}-${scheme}`}
        GA_TRACKING_ID={GA_ID}
        config={{
          // A partial config: deep-merged onto the defaults, so the standard
          // buttons, links and eight categories are all preserved.
          banner: {
            title: "This demo uses cookies to show you how the banner behaves.",
            position,
            layout,
          },
          colorScheme: scheme,
          backgroundColor: scheme === "light" ? "#ffffff" : "#131a26",
          textColor: scheme === "light" ? "#0b0f17" : "#e8eef8",
          buttonBackgroundColor: "#6aa9ff",
          onPreferencesChange: (preferences, consentGiven) => {
            setPrefs(preferences);
            setGiven(consentGiven);
            if (consentGiven) track("consent_saved");
          },
        }}
      />

      <section className="card">
        <h2>Live consent state</h2>
        <p className="sub">
          Updates as you accept, reject or save preferences. The same values go
          to Google Consent Mode v2.
        </p>
        <dl className="state">
          <dt>consent given</dt>
          <dd>
            <span className={`pill ${given ? "on" : "off"}`}>
              {given ? "yes" : "not yet"}
            </span>
          </dd>
          {Object.entries(prefs).map(([k, v]) => (
            <div key={k} style={{ display: "contents" }}>
              <dt>{k}</dt>
              <dd>
                <span className={`pill ${v ? "on" : "off"}`}>
                  {v ? "granted" : "denied"}
                </span>
              </dd>
            </div>
          ))}
        </dl>
        <div className="row" style={{ marginTop: 18 }}>
          <button className="demo primary" onClick={reset}>
            Reset consent &amp; show banner
          </button>
        </div>
      </section>

      <section className="card">
        <h2>Layout &amp; position</h2>
        <p className="sub">
          Below 600px every layout collapses to a bottom sheet — corner cards
          are unusable at phone widths. Resize this page to see it.
        </p>
        <div className="field">
          <label>Layout</label>
          <div className="row">
            {(["bar", "card"] as BannerLayout[]).map((l) => (
              <button
                key={l}
                className={`demo${layout === l ? " primary" : ""}`}
                onClick={() => { setLayout(l); reset(); }}
              >
                {l}
              </button>
            ))}
          </div>
        </div>
        <div className="field">
          <label>Position</label>
          <div className="row">
            {POSITIONS.map((p) => (
              <button
                key={p}
                className={`demo${position === p ? " primary" : ""}`}
                onClick={() => { setPosition(p); reset(); }}
              >
                {p}
              </button>
            ))}
          </div>
        </div>
        <div className="field">
          <label>Colour scheme</label>
          <div className="row">
            {(["auto", "light", "dark"] as const).map((s) => (
              <button
                key={s}
                className={`demo${scheme === s ? " primary" : ""}`}
                onClick={() => { setScheme(s); reset(); }}
              >
                {s}
              </button>
            ))}
          </div>
        </div>
      </section>

      <section className="card">
        <h2>Re-asking for consent</h2>
        <p className="sub">
          Bump <code>version</code> when your categories change, and{" "}
          <code>expiryDays</code> to refresh consent periodically. A stored
          choice failing either check is treated as absent.
        </p>
        <Code language="tsx">{`<CookieConsent
  GA_TRACKING_ID="G-XXXXXXXXXX"
  config={{ version: 2, expiryDays: 365 }}
/>`}</Code>
      </section>

      <section className="card">
        <h2>Usage</h2>
        <Code language="tsx">{`import { CookieConsent } from "react-consent-management-banner";
import "react-consent-management-banner/style.css";

<CookieConsent
  GA_TRACKING_ID="G-XXXXXXXXXX"
  config={{
    banner: { layout: "card", position: "bottom-right" },
    onPreferencesChange: (prefs, given) => console.log(prefs, given),
  }}
/>`}</Code>
      </section>

      <Footer />
    </main>
  );
}
