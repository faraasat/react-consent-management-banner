import React from "react";

import "./style.css";

import {
  BannerPosition,
  ConsentStorage,
  CookieConsentConfig,
  DeepPartialConfig,
  GetGtagAdsPropsT,
  PreferenceType,
  Props,
  StoredConsent,
} from "./types";

const DEFAULT_STORAGE_KEY = "cookiePreferences";

/** Consent Mode keys that gtag actually understands. */
const GTAG_CONSENT_KEYS = new Set([
  "ad_storage",
  "ad_personalization",
  "ad_user_data",
  "analytics_storage",
  "functionality_storage",
  "personalization_storage",
  "security_storage",
]);

/**
 * Merges a caller config onto the defaults one level deep.
 *
 * A plain `{ ...defaults, ...config }` replaced whole sections: passing
 * `{ banner: { title } }` dropped `banner.button` and `banner.links`, and the
 * component then crashed reading `button.acceptAlText`.
 */
const mergeConfig = (
  defaults: Required<CookieConsentConfig>,
  incoming?: DeepPartialConfig
): Required<CookieConsentConfig> => {
  if (!incoming) return defaults;

  const out = { ...defaults } as Record<string, unknown>;
  const isPlainObject = (v: unknown) =>
    typeof v === "object" && v !== null && !Array.isArray(v);

  for (const [key, value] of Object.entries(incoming)) {
    if (value === undefined) continue;
    const base = (defaults as Record<string, unknown>)[key];
    out[key] =
      isPlainObject(base) && isPlainObject(value)
        ? { ...(base as object), ...(value as object) }
        : value;
  }
  return out as Required<CookieConsentConfig>;
};

/** localStorage, but tolerant of Safari private mode and blocked storage. */
const safeLocalStorage: ConsentStorage = {
  getItem: (k) => {
    try {
      return typeof localStorage === "undefined" ? null : localStorage.getItem(k);
    } catch {
      return null;
    }
  },
  setItem: (k, v) => {
    try {
      localStorage?.setItem(k, v);
    } catch {
      /* storage blocked — consent simply will not persist */
    }
  },
  removeItem: (k) => {
    try {
      localStorage?.removeItem(k);
    } catch {
      /* ignore */
    }
  },
};

/**
 * Dumping every visitor's consent choices to the console is noise in
 * production (and a poor look for a privacy component), so keep it to dev.
 */
const logPreferences = (isDefault: boolean, resolved: unknown) => {
  if (typeof process !== "undefined" && process.env?.NODE_ENV === "production")
    return;
  console.info(
    `Selected ${isDefault ? "default" : "custom"} preferences:`,
    resolved
  );
};

const CookieIcon = (props: React.SVGProps<SVGSVGElement>) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    fill="none"
    stroke="currentColor"
    viewBox="0 0 512 512"
    aria-hidden="true"
    focusable="false"
    {...props}
  >
    <path d="M257.5 27.6c-.8-5.4-4.9-9.8-10.3-10.6c-22.1-3.1-44.6 .9-64.4 11.4l-74 39.5C89.1 78.4 73.2 94.9 63.4 115L26.7 190.6c-9.8 20.1-13 42.9-9.1 64.9l14.5 82.8c3.9 22.1 14.6 42.3 30.7 57.9l60.3 58.4c16.1 15.6 36.6 25.6 58.7 28.7l83 11.7c22.1 3.1 44.6-.9 64.4-11.4l74-39.5c19.7-10.5 35.6-27 45.4-47.2l36.7-75.5c9.8-20.1 13-42.9 9.1-64.9c-.9-5.3-5.3-9.3-10.6-10.1c-51.5-8.2-92.8-47.1-104.5-97.4c-1.8-7.6-8-13.4-15.7-14.6c-54.6-8.7-97.7-52-106.2-106.8zM208 144a32 32 0 1 1 0 64 32 32 0 1 1 0-64zM144 336a32 32 0 1 1 64 0 32 32 0 1 1 -64 0zm224-64a32 32 0 1 1 0 64 32 32 0 1 1 0-64z" />
  </svg>
);

const defaultConfig: Required<CookieConsentConfig> = {
  banner: {
    title:
      "We use cookies on our site to enhance your user experience, provide personalized content, and analyze our traffic.",
    position: "bottom",
    layout: "bar",
    className: undefined,
    button: {
      acceptAlText: "Accept All",
      rejectNonEssentialText: "Reject Non-Essentials",
      preferencesText: "Preferences",
    },
    links: {
      cookiePolicy: { title: "Cookie Policy", url: "/cookie-policy" },
      privacyPolicy: { title: "Privacy Policy", url: "/privacy-policy" },
      terms: { title: "Terms & Conditions", url: "/terms-and-conditions" },
      moreLinks: [],
    },
  },
  preferences: {
    title: "Customize your cookie preferences",
    para: "We respect your right to privacy. You can choose not to allow some types of cookies. Your cookie preferences will apply across our website.",
    button: { savePreferencesText: "Save Preferences", goBackText: "Go Back" },
    className: undefined,
    closeLabel: "Close",
    options: [
      { key: "necessary_storage", label: "Necessary", alwaysEnabled: true, description: "These cookies are necessary for the website to function properly and cannot be switched off. They help with things like logging in and setting your privacy preferences." },
      { key: "security_storage", label: "Security", alwaysEnabled: true, description: "These cookies keep the site secure and cannot be switched off." },
      { key: "functionality_storage", label: "Functionality", alwaysEnabled: true, description: "These cookies allow the website to remember choices you make, such as your language or region, and provide enhanced, more personalized features." },
      { key: "ad_storage", label: "Advertisement Storage", description: "These cookies are used to deliver advertisements that are more relevant to you, limit how often you see an ad, and measure campaign effectiveness." },
      { key: "ad_personalization", label: "Advertisement Personalization", description: "These cookies allow the website to deliver personalized ads based on your interests and browsing behaviour." },
      { key: "ad_user_data", label: "Advertisement User Data", description: "These cookies enable the collection of user data for advertising purposes, supporting ad measurement, targeting and optimization." },
      { key: "analytics_storage", label: "Analytics", description: "These cookies help us understand how visitors interact with the website by collecting and reporting information anonymously." },
      { key: "personalization_storage", label: "Personalization", description: "These cookies tailor content and recommendations based on your behaviour and preferences." },
    ],
  },
  cookieFloatingButton: {
    position: "bottom-right",
    Component: CookieIcon,
    show: true,
    label: "Cookie preferences",
  },

  backgroundColor: "#fff",
  linkColor: "#6ac3ff",
  buttonBackgroundColor: "#0073e6",
  textColor: "#000",
  colorScheme: "light",
  zIndex: 99999,

  version: 1,
  expiryDays: 365,
  storageKey: DEFAULT_STORAGE_KEY,
  storage: safeLocalStorage,

  onPreferencesChange: () => {},
  getConsentGiven: () => false,
  getConsentPreferences: () => ({}),
};

/** Reads stored consent, discarding it when stale or from an older version. */
const readStoredConsent = (
  storage: ConsentStorage,
  key: string,
  version: number,
  expiryDays: number
): Record<string, boolean> | null => {
  const raw = storage.getItem(key);
  if (!raw) return null;

  try {
    const parsed = JSON.parse(raw) as StoredConsent | Record<string, boolean>;

    // Consent written by older versions of this package was a bare
    // preferences map with no metadata. Honour it rather than re-prompting
    // everyone on upgrade.
    if (!("preferences" in parsed) || typeof parsed.preferences !== "object") {
      return parsed as Record<string, boolean>;
    }

    const stored = parsed as StoredConsent;

    // Categories changed since this choice was made, so it no longer covers
    // what we would be asking for.
    if (stored.version !== version) return null;

    if (expiryDays > 0 && stored.timestamp) {
      const age = Date.now() - stored.timestamp;
      if (age > expiryDays * 24 * 60 * 60 * 1000) return null;
    }

    return stored.preferences;
  } catch {
    return null;
  }
};

const FOCUSABLE =
  'a[href],button:not([disabled]),textarea,input,select,[tabindex]:not([tabindex="-1"])';

/** Traps focus inside the preferences dialog and restores it on close. */
const useFocusTrap = (
  ref: React.RefObject<HTMLDivElement | null>,
  onEscape: () => void
) => {
  React.useEffect(() => {
    const node = ref.current;
    if (!node) return;

    const previouslyFocused = document.activeElement as HTMLElement | null;
    // Visibility via computed style: `offsetParent` is null for any
    // position:fixed element, which would empty this list inside the dialog.
    const focusables = () =>
      Array.from(node.querySelectorAll<HTMLElement>(FOCUSABLE)).filter((el) => {
        const s = window.getComputedStyle(el);
        return s.display !== "none" && s.visibility !== "hidden";
      });

    focusables()[0]?.focus();

    const onDocKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") onEscape();
    };
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key !== "Tab") return;
      const items = focusables();
      if (!items.length) return;
      const first = items[0];
      const last = items[items.length - 1];
      if (e.shiftKey && document.activeElement === first) {
        e.preventDefault();
        last.focus();
      } else if (!e.shiftKey && document.activeElement === last) {
        e.preventDefault();
        first.focus();
      }
    };

    node.addEventListener("keydown", onKeyDown);
    document.addEventListener("keydown", onDocKeyDown);
    return () => {
      node.removeEventListener("keydown", onKeyDown);
      document.removeEventListener("keydown", onDocKeyDown);
      previouslyFocused?.focus?.();
    };
  }, [ref, onEscape]);
};

const Banner: React.FC<{
  mergedConfig: Required<CookieConsentConfig>;
  handleSavePreferences: (prefType: PreferenceType) => void;
  setShowPreferences: React.Dispatch<React.SetStateAction<boolean>>;
}> = ({ mergedConfig, handleSavePreferences, setShowPreferences }) => {
  const { position, layout, title, links, button, className } = mergedConfig.banner;

  const extraLinks = links.moreLinks ?? [];

  return (
    <div
      className={`ccb-wrapper ccb-wrapper--${position as BannerPosition} ccb-wrapper--${layout}`}
      style={{ zIndex: mergedConfig.zIndex }}
    >
      <section
        className={`ccb-banner${className ? ` ${className}` : ""}`}
        role="region"
        aria-label="Cookie consent"
      >
        <p className="ccb-banner__text">
          {title}{" "}
          {links.cookiePolicy?.url ? (
            <a href={links.cookiePolicy.url} target="_blank" rel="noreferrer">
              {links.cookiePolicy.title}
            </a>
          ) : null}
        </p>

        <div className="ccb-banner__actions">
          <button type="button" className="ccb-btn ccb-btn--primary" onClick={() => handleSavePreferences("all")}>
            {button.acceptAlText}
          </button>
          <button type="button" className="ccb-btn ccb-btn--primary" onClick={() => handleSavePreferences("essential")}>
            {button.rejectNonEssentialText}
          </button>
          <button type="button" className="ccb-btn ccb-btn--ghost" onClick={() => setShowPreferences(true)}>
            {button.preferencesText}
          </button>
        </div>

        <div className="ccb-banner__links">
          {links.privacyPolicy?.url ? (
            <a href={links.privacyPolicy.url} target="_blank" rel="noreferrer">
              {links.privacyPolicy.title}
            </a>
          ) : null}
          {links.terms?.url ? (
            <a href={links.terms.url} target="_blank" rel="noreferrer">
              {links.terms.title}
            </a>
          ) : null}
          {/* key belongs on the outermost element of the map, which used to be
              an unkeyed fragment */}
          {extraLinks.map((ml, i) => (
            <a key={`${ml?.url}-${i}`} href={ml?.url} target="_blank" rel="noreferrer">
              {ml?.title}
            </a>
          ))}
        </div>
      </section>
    </div>
  );
};

const CookieModal: React.FC<{
  mergedConfig: Required<CookieConsentConfig>;
  togglePreference: (key: string) => void;
  handleSavePreferences: (prefType?: PreferenceType) => void;
  handleClose: () => void;
  preferences: Record<string, boolean>;
}> = ({ mergedConfig, togglePreference, handleSavePreferences, handleClose, preferences }) => {
  const { button, title, para, closeLabel } = mergedConfig.preferences;
  const dialogRef = React.useRef<HTMLDivElement>(null);
  const titleId = React.useRef(`ccb-title-${Math.random().toString(36).slice(2, 8)}`);

  useFocusTrap(dialogRef, handleClose);

  React.useEffect(() => {
    const previous = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = previous;
    };
  }, []);

  return (
    <div
      className="ccb-modal"
      style={{ zIndex: (mergedConfig.zIndex ?? 99999) + 1 }}
      onMouseDown={(e) => {
        if (e.target === e.currentTarget) handleClose();
      }}
    >
      <div
        className={`ccb-modal__panel${mergedConfig.preferences.className ? ` ${mergedConfig.preferences.className}` : ""}`}
        role="dialog"
        aria-modal="true"
        aria-labelledby={titleId.current}
        ref={dialogRef}
      >
        <button type="button" className="ccb-modal__close" onClick={handleClose} aria-label={closeLabel}>
          <svg width="16" height="16" viewBox="0 0 16 16" aria-hidden="true" focusable="false">
            <path d="M2 2l12 12M14 2L2 14" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
          </svg>
        </button>

        <h2 className="ccb-modal__title" id={titleId.current}>
          {title}
        </h2>
        {para && <p className="ccb-modal__para">{para}</p>}

        <ul className="ccb-options">
          {mergedConfig.preferences.options?.map((opt) => (
            <li className="ccb-option" key={opt.key}>
              <label className="ccb-option__row">
                <input
                  type="checkbox"
                  className="ccb-option__input"
                  disabled={opt.alwaysEnabled}
                  checked={!!preferences[opt.key]}
                  onChange={() => togglePreference(opt.key)}
                />
                <span className="ccb-option__label">{opt.label}</span>
                {opt.alwaysEnabled && <span className="ccb-option__badge">Always on</span>}
              </label>
              <p className="ccb-option__desc">{opt.description}</p>
            </li>
          ))}
        </ul>

        <div className="ccb-modal__actions">
          <button type="button" className="ccb-btn ccb-btn--ghost" onClick={handleClose}>
            {button?.goBackText}
          </button>
          <button type="button" className="ccb-btn ccb-btn--primary" onClick={() => handleSavePreferences()}>
            {button?.savePreferencesText}
          </button>
        </div>
      </div>
    </div>
  );
};

export function CookieConsent({ GA_TRACKING_ID, config }: Props) {
  const [showBanner, setShowBanner] = React.useState(false);
  const [showPreferences, setShowPreferences] = React.useState(false);
  const [preferences, setPreferences] = React.useState<Record<string, boolean>>({});
  const [consentGiven, setConsentGiven] = React.useState(false);

  const mergedConfig = React.useMemo(
    () => mergeConfig(defaultConfig, config),
    [config]
  );

  const {
    storage = safeLocalStorage,
    storageKey = DEFAULT_STORAGE_KEY,
    version = 1,
    expiryDays = 365,
  } = mergedConfig;

  const setTheme = React.useCallback(() => {
    const root = document.documentElement;
    root.style.setProperty("--cookie-consent-background-color", mergedConfig.backgroundColor);
    root.style.setProperty("--cookie-consent-link-color", mergedConfig.linkColor);
    root.style.setProperty("--cookie-consent-button-background-color", mergedConfig.buttonBackgroundColor);
    root.style.setProperty("--cookie-consent-text-color", mergedConfig.textColor);
    root.setAttribute("data-ccb-scheme", mergedConfig.colorScheme ?? "light");
  }, [
    mergedConfig.backgroundColor,
    mergedConfig.linkColor,
    mergedConfig.buttonBackgroundColor,
    mergedConfig.textColor,
    mergedConfig.colorScheme,
  ]);

  const getGtagConsent = React.useCallback(
    (props: GetGtagAdsPropsT) => {
      const options = mergedConfig.preferences.options;
      const isDefault = (props as { isDefault?: boolean }).isDefault === true;
      const given = props as Record<string, boolean>;

      return options.reduce<Record<string, string>>((acc, curr) => {
        // Only forward keys Consent Mode actually understands; custom
        // categories are yours to act on via onPreferencesChange.
        if (!GTAG_CONSENT_KEYS.has(curr.key)) return acc;
        const granted = isDefault ? !!curr.alwaysEnabled : !!given[curr.key];
        acc[curr.key] = granted ? "granted" : "denied";
        return acc;
      }, {});
    },
    [mergedConfig.preferences.options]
  );

  const updateScript = React.useCallback(
    (consent: Record<string, string>, isDefault = false) => {
      if (typeof window === "undefined") return;

      if (!window.gtag) {
        window.dataLayer = window.dataLayer || [];
        window.gtag = function gtag() {
          // eslint-disable-next-line prefer-rest-params
          window.dataLayer!.push(arguments);
        };

        logPreferences(isDefault, consent);
        window.gtag("consent", "default", consent);

        // A null id means the host page manages gtag itself; we still set the
        // consent state, we just do not inject Google's script.
        if (!GA_TRACKING_ID) return;

        const script = document.createElement("script");
        script.src = `https://www.googletagmanager.com/gtag/js?id=${GA_TRACKING_ID}`;
        script.async = true;
        document.head.appendChild(script);

        script.onload = () => {
          window.gtag?.("js", new Date());
          window.gtag?.("config", GA_TRACKING_ID);
        };
        return;
      }

      logPreferences(isDefault, consent);
      window.gtag("consent", isDefault ? "default" : "update", consent);
    },
    [GA_TRACKING_ID]
  );

  const persist = React.useCallback(
    (prefs: Record<string, boolean>) => {
      const payload: StoredConsent = {
        preferences: prefs,
        version,
        timestamp: Date.now(),
      };
      storage.setItem(storageKey, JSON.stringify(payload));
    },
    [storage, storageKey, version]
  );

  const handleSavePreferences = React.useCallback(
    (prefType?: PreferenceType, isDefault = false) => {
      const options = mergedConfig.preferences.options;
      let prefToSave: Record<string, boolean> = {};

      if (prefType === "all") {
        options.forEach((opt) => {
          prefToSave[opt.key] = true;
        });
      } else if (prefType === "essential") {
        options.forEach((opt) => {
          prefToSave[opt.key] = !!opt.alwaysEnabled;
        });
      } else {
        prefToSave = { ...preferences };
        options
          .filter((opt) => opt?.alwaysEnabled)
          .forEach((opt) => {
            prefToSave[opt.key] = true;
          });
      }

      if (isDefault) {
        updateScript(getGtagConsent({ isDefault: true }), true);
        setPreferences(prefToSave);
        mergedConfig.onPreferencesChange?.(prefToSave, false);
        return;
      }

      updateScript(getGtagConsent(prefToSave));
      persist(prefToSave);
      setShowPreferences(false);
      setShowBanner(false);
      setConsentGiven(true);
      setPreferences(prefToSave);
      mergedConfig.onPreferencesChange?.(prefToSave, true);
    },
    [mergedConfig, preferences, updateScript, getGtagConsent, persist]
  );

  // Kept in a ref so the mount effect below does not re-run on every render.
  const saveRef = React.useRef(handleSavePreferences);
  saveRef.current = handleSavePreferences;

  React.useEffect(() => {
    setTheme();

    const saved = readStoredConsent(storage, storageKey, version, expiryDays);

    if (!saved) {
      // Consent Mode requires a denied-by-default state before anything is
      // measured.
      saveRef.current("essential", true);
      setShowBanner(true);
      return;
    }

    setPreferences(saved);
    setConsentGiven(true);
    updateScript(getGtagConsent(saved));
  }, [setTheme, storage, storageKey, version, expiryDays, updateScript, getGtagConsent]);

  const togglePreference = React.useCallback((key: string) => {
    setPreferences((prev) => ({ ...prev, [key]: !prev[key] }));
  }, []);

  // The caller reads these back through the object it handed in. Assigning in
  // an effect (rather than during render) keeps render side-effect free.
  React.useEffect(() => {
    if (!config) return;
    config.getConsentGiven = () => consentGiven;
    config.getConsentPreferences = () => preferences;
  }, [config, consentGiven, preferences]);

  const FloatingIcon = mergedConfig.cookieFloatingButton.Component;

  return (
    <>
      {!showPreferences && showBanner && (
        <Banner
          mergedConfig={mergedConfig}
          handleSavePreferences={handleSavePreferences}
          setShowPreferences={setShowPreferences}
        />
      )}

      {showPreferences && (
        <CookieModal
          mergedConfig={mergedConfig}
          togglePreference={togglePreference}
          handleSavePreferences={handleSavePreferences}
          handleClose={() => setShowPreferences(false)}
          preferences={preferences}
        />
      )}

      {mergedConfig.cookieFloatingButton?.show && consentGiven && !showPreferences && (
        <button
          type="button"
          className={`ccb-fab ccb-fab--${mergedConfig.cookieFloatingButton.position}`}
          style={{ zIndex: mergedConfig.zIndex }}
          onClick={() => setShowPreferences(true)}
          aria-label={mergedConfig.cookieFloatingButton.label}
        >
          <FloatingIcon />
        </button>
      )}
    </>
  );
}

export type {
  IPreferenceOption,
  IMoreLinks,
  CookieConsentConfig,
  DeepPartialConfig,
  Props,
  IGetGtagAdsPropsDefault,
  IGetGtagAdsPropsNonDefault,
  GetGtagAdsPropsT,
  PreferenceType,
  BannerPosition,
  BannerLayout,
  ConsentStorage,
  StoredConsent,
} from "./types";
