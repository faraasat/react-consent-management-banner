"use client";

import { useState } from "react";
import { CookieConsent } from "react-consent-management-banner";
import { Hero } from "@/components/hero";
import { Footer } from "@/components/footer";
import { track } from "@/components/analytics";

const GA_ID = process.env.NEXT_PUBLIC_GA_MEASUREMENT_ID || "G-XXXXXXXXXX";

export default function Home() {
  const [prefs, setPrefs] = useState<Record<string, boolean>>({});
  const [given, setGiven] = useState(false);
  const [remount, setRemount] = useState(0);

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
        key={remount}
        GA_TRACKING_ID={GA_ID}
        config={{
          // A partial config: the component deep-merges it onto the defaults,
          // so the standard buttons, links and categories are all preserved.
          banner: { title: "This demo uses cookies to show you how the banner behaves." },
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
          Updates as you accept, reject or save preferences. The same values are
          pushed to Google Consent Mode v2.
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
        <h2>Usage</h2>
        <pre>{`import { CookieConsent } from "react-consent-management-banner";
import "react-consent-management-banner/style.css";

export default function Layout({ children }) {
  return (
    <>
      {children}
      <CookieConsent
        GA_TRACKING_ID="G-XXXXXXXXXX"
        config={{
          banner: { title: "We use cookies." },
          onPreferencesChange: (prefs, given) => console.log(prefs, given),
        }}
      />
    </>
  );
}`}</pre>
      </section>

      <section className="card">
        <h2>Partial configs are safe</h2>
        <p className="sub">
          Overriding one field keeps every sibling default — this page only sets{" "}
          <code>banner.title</code> and still gets the standard buttons, links
          and eight consent categories.
        </p>
      </section>

      <Footer />
    </main>
  );
}
