import React from "react";

export interface IPreferenceOption {
  key: string;
  label: string;
  description: string;
  alwaysEnabled?: boolean;
}

export interface IMoreLinks {
  title: string;
  url: string;
}

export type CookieConsentConfig = {
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

export type Props = {
  config?: Partial<CookieConsentConfig>;
  GA_TRACKING_ID: string;
};

export interface IGetGtagAdsPropsDefault {
  isDefault: true;
}

export interface IGetGtagAdsPropsNonDefault {
  ad_storage: boolean;
  analytics_storage: boolean;
  functionality_storage: boolean;
  personalization_storage: boolean;
  security_storage: boolean;
  necessary_storage: boolean;
}

export type GetGtagAdsPropsT =
  | IGetGtagAdsPropsDefault
  | (Partial<IGetGtagAdsPropsDefault> & IGetGtagAdsPropsNonDefault)
  | Record<string, boolean>;

declare global {
  interface Window {
    gtag?: Function;
    dataLayer?: any;
  }
}

export type PreferenceType = "all" | "essential";
