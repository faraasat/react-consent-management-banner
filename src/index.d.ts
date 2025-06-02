import { CSSProperties, JSX } from "react";

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

export type Props = {
  config?: Partial<CookieConsentConfig>;
};
