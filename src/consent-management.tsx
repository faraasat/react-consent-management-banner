import React, { useState, useEffect, useCallback } from "react";

import Cookie from "./cookie";
import { Banner } from "./banner";
import { CookieModal } from "./cookie-modal";

import "./style.css";

import { CookieConsentConfig, Props } from "./types";

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
        key: "necessary",
        label: "Necessary",
        alwaysEnabled: true,
        description:
          "These cookies are necessary for the website to function properly and cannot be switched off. They help with things like logging in and setting your privacy preferences.",
      },
      {
        key: "advertisement",
        label: "Advertisement",
        description:
          "These cookies provide extra features and personalization to improve your experience. They may be set by us or by partners whose services we use.",
      },
      {
        key: "analytical",
        label: "Analytical",
        description:
          "These cookies help us improve the site by tracking which pages are most popular and how visitors move around the site.",
      },
    ],
  },
  cookieFloatingButton: {
    position: "bottom-right",
    Component: <Cookie />,
    show: true,
  },
  backgroundColor: "#fff",
  linkColor: "#6ac3ff",
  buttonBackgroundColor: "#0073e6",
  textColor: "#000",
};

export default function CookieConsent({ config = defaultConfig }: Props) {
  const [showBanner, setShowBanner] = useState(false);
  const [showPreferences, setShowPreferences] = useState(false);
  const [preferences, setPreferences] = useState<Record<string, boolean>>({});
  const [consentGiven, setConsentGiven] = useState(false);
  const mergedConfig: Required<CookieConsentConfig> = {
    ...defaultConfig,
    ...config,
  };

  const setTheme = useCallback(() => {
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

  useEffect(() => {
    setTheme();
    const saved = localStorage.getItem("cookiePreferences");
    if (!saved) {
      const essentials: Record<string, boolean> = {};
      mergedConfig.preferences.options?.forEach((opt) => {
        essentials[opt.key] = !!opt.alwaysEnabled;
      });
      setPreferences({ ...essentials });
      setShowBanner(true);
    } else {
      setPreferences(JSON.parse(saved));
      setConsentGiven(true);
    }
  }, [setTheme, mergedConfig.preferences.options]);

  const handleAcceptAll = () => {
    const allPrefs: Record<string, boolean> = {};
    mergedConfig.preferences.options.forEach((opt) => {
      allPrefs[opt.key] = true;
    });
    localStorage.setItem("cookiePreferences", JSON.stringify(allPrefs));
    setPreferences(allPrefs);
    setShowBanner(false);
    setConsentGiven(true);
  };

  const handleRejectNonEssential = () => {
    const essentials: Record<string, boolean> = {};
    mergedConfig.preferences.options?.forEach((opt) => {
      essentials[opt.key] = !!opt.alwaysEnabled;
    });
    localStorage.setItem("cookiePreferences", JSON.stringify(essentials));
    setPreferences(essentials);
    setShowBanner(false);
    setConsentGiven(true);
  };

  const handleSavePreferences = () => {
    localStorage.setItem("cookiePreferences", JSON.stringify(preferences));
    setShowPreferences(false);
    setShowBanner(false);
    setConsentGiven(true);
  };

  const togglePreference = (key: string) => {
    setPreferences((prev) => ({ ...prev, [key]: !prev[key] }));
  };

  return (
    <>
      {!showPreferences && showBanner && (
        <Banner
          mergedConfig={mergedConfig}
          handleAcceptAll={handleAcceptAll}
          handleRejectNonEssential={handleRejectNonEssential}
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
          <Cookie />
        </button>
      )}
    </>
  );
}
