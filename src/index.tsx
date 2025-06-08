import React from "react";

import {
  CookieConsentConfig,
  GetGtagAdsPropsT,
  Props,
  IGetGtagAdsPropsNonDefault,
  PreferenceType,
} from "./types";

const Banner: React.FC<{
  mergedConfig: Required<CookieConsentConfig>;
  handleSavePreferences: (prefType: PreferenceType) => void;
  setShowPreferences: React.Dispatch<React.SetStateAction<boolean>>;
}> = ({ mergedConfig, handleSavePreferences, setShowPreferences }) => {
  const { position, title, links, button, className } = mergedConfig.banner;

  return (
    <div className={`cookie-banner-wrapper ${position}`}>
      <div className={`cookie-banner${className ? ` ${className}` : ""}`}>
        <p>
          {title}
          <a href={links.cookiePolicy?.url} target="_blank" rel="noreferrer">
            {links.cookiePolicy?.title}
          </a>
        </p>

        <div className="cookie-buttons">
          <button onClick={() => handleSavePreferences("all")}>
            {button.acceptAlText}
          </button>
          <button onClick={() => handleSavePreferences("essential")}>
            {button.rejectNonEssentialText}
          </button>
          <button
            onClick={() => setShowPreferences(true)}
            className="btn-outline"
          >
            {button.preferencesText}
          </button>
        </div>

        <div>
          <a href={links.privacyPolicy?.url} target="_blank" rel="noreferrer">
            {links.privacyPolicy?.title}
          </a>
          <span>-</span>
          <a href={links.terms?.url} target="_blank" rel="noreferrer">
            {links.terms?.title}
          </a>
          {links.moreLinks?.map((ml, i) => {
            return (
              <>
                <span>-</span>
                <a key={i} href={ml?.url} target="_blank" rel="noreferrer">
                  {ml?.title}
                </a>
              </>
            );
          })}
        </div>
      </div>
    </div>
  );
};

const CookieModal: React.FC<{
  mergedConfig: Required<CookieConsentConfig>;
  togglePreference: (key: string) => void;
  handleSavePreferences: (prefType: PreferenceType) => void;
  handleClose: React.MouseEventHandler<HTMLButtonElement>;
  preferences: Record<string, boolean>;
}> = ({
  mergedConfig,
  togglePreference,
  handleSavePreferences,
  handleClose,
  preferences,
}) => {
  const { button, title, para } = mergedConfig.preferences;

  return (
    <div className="cookie-modal">
      <div className="cookie-modal-content">
        <span className="cookie-modal__close" onClick={handleClose}>
          &times;
        </span>
        <h3>{title}</h3>
        {para && <p>{para}</p>}
        <ul>
          {mergedConfig.preferences.options?.map((opt) => (
            <li key={opt.key}>
              <label>
                <input
                  type="checkbox"
                  disabled={opt.alwaysEnabled}
                  checked={preferences[opt.key]}
                  onChange={() => togglePreference(opt.key)}
                />
                {opt.label}
              </label>
              <p>{opt.description}</p>
            </li>
          ))}
        </ul>
        <div className="cookie-modal__btn">
          <button className="btn-outline" onClick={handleClose}>
            {button?.goBackText}
          </button>
          <button onClick={handleSavePreferences}>
            {button?.savePreferencesText}
          </button>
        </div>
      </div>
    </div>
  );
};

const defaultConfig: Required<CookieConsentConfig> = {
  banner: {
    title:
      "We use cookies on our site to enhance your user experience, provide personalized content, and analyze our traffic.",
    position: "bottom",
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
    options: [
      {
        key: "necessary_storage",
        label: "Necessary",
        alwaysEnabled: true,
        description:
          "These cookies are necessary for the website to function properly and cannot be switched off. They help with things like logging in and setting your privacy preferences.",
      },
      {
        key: "security_storage",
        label: "Security",
        alwaysEnabled: true,
        description:
          "These cookies are security for the website to function properly and cannot be switched off.",
      },
      {
        key: "functionality_storage",
        label: "Functionality",
        alwaysEnabled: true,
        description:
          "These cookies allow the website to remember choices you make, such as your language or region, and provide enhanced, more personalized features. They may also enable services like video playback or live chats",
      },
      {
        key: "ad_storage",
        label: "Advertisement Storage",
        description:
          "These cookies are used to deliver advertisements that are more relevant to you. They may also limit how often you see an ad and help measure the effectiveness of advertising campaigns.",
      },
      {
        key: "ad_personalization",
        label: "Advertisement Personalization",
        description:
          "These cookies allow the website to deliver personalized ads based on your interests, browsing behavior, or previous interactions. They help tailor advertising content to make it more relevant to you.",
      },
      {
        key: "ad_user_data",
        label: "Advertisement User Data",
        description:
          "These cookies enable the collection of user data for advertising purposes, such as demographics or engagement metrics. This data supports ad measurement, targeting, and optimization.",
      },
      {
        key: "analytics_storage",
        label: "Analytics",
        description:
          "These cookies help us understand how visitors interact with the website by collecting and reporting information anonymously. They enable us to improve site performance and user experience.",
      },
      {
        key: "personalization_storage",
        label: "Personalization",
        description:
          "These cookies enable the website to tailor content and recommendations based on your behavior and preferences, providing a more customized browsing experience.",
      },
    ],
  },
  cookieFloatingButton: {
    position: "bottom-right",
    Component: (props: React.SVGProps<SVGSVGElement>) => (
      <svg
        xmlns="http://www.w3.org/2000/svg"
        fill="none"
        stroke="currentColor"
        viewBox="0 0 512 512"
        {...props}
      >
        <path d="M257.5 27.6c-.8-5.4-4.9-9.8-10.3-10.6c-22.1-3.1-44.6 .9-64.4 11.4l-74 39.5C89.1 78.4 73.2 94.9 63.4 115L26.7 190.6c-9.8 20.1-13 42.9-9.1 64.9l14.5 82.8c3.9 22.1 14.6 42.3 30.7 57.9l60.3 58.4c16.1 15.6 36.6 25.6 58.7 28.7l83 11.7c22.1 3.1 44.6-.9 64.4-11.4l74-39.5c19.7-10.5 35.6-27 45.4-47.2l36.7-75.5c9.8-20.1 13-42.9 9.1-64.9c-.9-5.3-5.3-9.3-10.6-10.1c-51.5-8.2-92.8-47.1-104.5-97.4c-1.8-7.6-8-13.4-15.7-14.6c-54.6-8.7-97.7-52-106.2-106.8zM208 144a32 32 0 1 1 0 64 32 32 0 1 1 0-64zM144 336a32 32 0 1 1 64 0 32 32 0 1 1 -64 0zm224-64a32 32 0 1 1 0 64 32 32 0 1 1 0-64z"></path>
      </svg>
    ),
    show: true,
  },
  backgroundColor: "#fff",
  linkColor: "#6ac3ff",
  buttonBackgroundColor: "#0073e6",
  textColor: "#000",
  onPreferencesChange: () => {},
  getConsentGiven: () => {},
  getConsentPreferences: () => {},
};

export function CookieConsent({
  GA_TRACKING_ID,
  config = defaultConfig,
}: Props) {
  const [showBanner, setShowBanner] = React.useState(false);
  const [showPreferences, setShowPreferences] = React.useState(false);
  const [preferences, setPreferences] = React.useState<Record<string, boolean>>(
    {}
  );
  const [consentGiven, setConsentGiven] = React.useState(false);
  const mergedConfig: Required<CookieConsentConfig> = {
    ...defaultConfig,
    ...config,
  };

  const setTheme = React.useCallback(() => {
    const root = document.documentElement;
    root.style.setProperty(
      "--cookie-consent-background-color",
      mergedConfig.backgroundColor
    );
    root.style.setProperty(
      "--cookie-consent-link-color",
      mergedConfig.linkColor
    );
    root.style.setProperty(
      "--cookie-consent-button-background-color",
      mergedConfig.buttonBackgroundColor
    );
    root.style.setProperty(
      "--cookie-consent-text-color",
      mergedConfig.textColor
    );
  }, [
    mergedConfig.backgroundColor,
    mergedConfig.linkColor,
    mergedConfig.buttonBackgroundColor,
    mergedConfig.textColor,
  ]);

  // const getGtag = () => {
  //   if (window) {
  //     if (!window?.gtag || typeof window?.gtag != "function") {
  //       console.error(
  //         "Google Tag Manager is not initialized. Please ensure GTM is set up correctly."
  //       );
  //       return null;
  //     }

  //     return window.gtag;
  //   }
  // };

  const getGtagAds = (props: GetGtagAdsPropsT) => {
    if (props.isDefault) {
      return {
        ad_storage: "denied",
        analytics_storage: "denied",
        functionality_storage: "granted",
        personalization_storage: "denied",
        security_storage: "granted",
        necessary_storage: "granted",
      };
    }

    props = props as IGetGtagAdsPropsNonDefault;

    return {
      ad_storage: props?.ad_storage ? "granted" : "denied",
      analytics_storage: props?.analytics_storage ? "granted" : "denied",
      functionality_storage: props?.functionality_storage
        ? "granted"
        : "denied",
      personalization_storage: props?.personalization_storage
        ? "granted"
        : "denied",
      security_storage: props?.security_storage ? "granted" : "denied",
      necessary_storage: props?.necessary_storage ? "granted" : "denied",
    };
  };

  const updateScript = (config: any, isDefault: boolean = false) => {
    if (!window.gtag) {
      window.dataLayer = window.dataLayer || [];
      const gtag = (...args: any[]) => {
        window.dataLayer.push(args);
      };
      window.gtag = gtag;

      const script = document.createElement("script");
      script.src = `https://www.googletagmanager.com/gtag/js?id=${GA_TRACKING_ID}`;
      script.async = false;
      document.head.appendChild(script);

      script.onload = () => {
        console.log("Google Tag Manager script loaded");
        gtag("js", new Date());
        gtag("config", GA_TRACKING_ID);
        console.info(
          `Selected ${isDefault ? "default" : "custom"} preferences:`,
          config
        );
        gtag("consent", isDefault ? "default" : "update", config);
      };
    } else {
      const gtag = window?.gtag;
      console.info(
        `Selected ${isDefault ? "default" : "custom"} preferences:`,
        config
      );
      gtag("consent", isDefault ? "default" : "update", config);
    }
  };

  React.useEffect(() => {
    setTheme();

    if (!GA_TRACKING_ID) {
      console.error("GA_TRACKING_ID is required for Google Analytics.");
      return;
    }

    const saved = localStorage.getItem("cookiePreferences");

    if (!saved) {
      handleSavePreferences("essential", true);
      setShowBanner(true);
    } else {
      const preference = JSON.parse(saved);
      setPreferences(preference);
      setConsentGiven(true);
    }
  }, [setTheme, mergedConfig.preferences.options]);

  const handleSavePreferences = (
    prefType?: PreferenceType,
    isDefault: boolean = false
  ) => {
    let prefToSave: Record<string, boolean> = {};

    if (prefType == "all") {
      mergedConfig.preferences.options.forEach((opt) => {
        prefToSave[opt.key] = true;
      });
    } else if (prefType == "essential") {
      mergedConfig.preferences.options?.forEach((opt) => {
        prefToSave[opt.key] = !!opt.alwaysEnabled;
      });
    } else {
      prefToSave = { ...preferences };
      mergedConfig.preferences.options
        ?.filter((opt) => opt?.alwaysEnabled)
        .forEach((opt) => {
          prefToSave[opt.key] = !!opt.alwaysEnabled;
        });
    }

    if (isDefault) {
      updateScript(prefToSave, true);
      setPreferences(prefToSave);
      config.onPreferencesChange(prefToSave, false);
    } else {
      const pref = getGtagAds(prefToSave);
      updateScript(prefToSave);
      localStorage.setItem("cookiePreferences", JSON.stringify(prefToSave));
      setShowPreferences(false);
      setShowBanner(false);
      setConsentGiven(true);
      setPreferences(prefToSave);
      config.onPreferencesChange(prefToSave, true);
    }
  };

  const togglePreference = (key: string) => {
    setPreferences((prev) => ({ ...prev, [key]: !prev[key] }));
  };

  config.getConsentGiven = React.useCallback(() => {
    return consentGiven;
  }, [consentGiven]);

  config.getConsentPreferences = React.useCallback(() => {
    return preferences;
  }, [preferences]);

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

      {mergedConfig.cookieFloatingButton?.show && consentGiven && (
        <button
          className={`cookie-settings-button ${mergedConfig.cookieFloatingButton.position}`}
          onClick={() => setShowPreferences(true)}
        >
          <mergedConfig.cookieFloatingButton.Component />
        </button>
      )}
    </>
  );
}

export type {
  IPreferenceOption,
  IMoreLinks,
  CookieConsentConfig,
  Props,
  IGetGtagAdsPropsDefault,
  IGetGtagAdsPropsNonDefault,
  GetGtagAdsPropsT,
  PreferenceType,
} from "./types";
