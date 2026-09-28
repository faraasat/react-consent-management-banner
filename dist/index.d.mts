import React from 'react';

interface IPreferenceOption {
    /** Consent Mode key, e.g. `analytics_storage`. */
    key: string;
    label: string;
    description: string;
    /** Always granted and not togglable (strictly necessary cookies). */
    alwaysEnabled?: boolean;
}
interface IMoreLinks {
    title: string;
    url: string;
}
/** Where the banner sits. */
type BannerPosition = "top" | "bottom" | "bottom-left" | "bottom-right" | "top-left" | "top-right";
/** Banner shape: a full-width bar, or a compact floating card. */
type BannerLayout = "bar" | "card";
interface ConsentStorage {
    getItem: (key: string) => string | null;
    setItem: (key: string, value: string) => void;
    removeItem: (key: string) => void;
}
/** What gets persisted. */
interface StoredConsent {
    preferences: Record<string, boolean>;
    /** Config version this choice was made against. */
    version: number;
    /** When consent was given, as an epoch milliseconds timestamp. */
    timestamp: number;
}
type CookieConsentConfig = {
    banner: {
        className?: string;
        title?: string;
        /** Default `"bottom"`. Corner values pair naturally with `layout: "card"`. */
        position?: BannerPosition;
        /** Default `"bar"`. */
        layout?: BannerLayout;
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
        button: {
            savePreferencesText?: string;
            goBackText?: string;
        };
        options: Array<IPreferenceOption>;
        /** Accessible label for the close control. Default `"Close"`. */
        closeLabel?: string;
    };
    cookieFloatingButton: {
        position: "top-left" | "top-right" | "bottom-left" | "bottom-right";
        Component: React.ComponentType<React.SVGProps<SVGSVGElement>>;
        show: boolean;
        /** Accessible label. Default `"Cookie preferences"`. */
        label?: string;
    };
    backgroundColor: string;
    linkColor: string;
    buttonBackgroundColor: string;
    textColor: string;
    /**
     * Text colour for primary buttons.
     *
     * Leave unset and it is chosen automatically — black or white, whichever
     * contrasts better with `buttonBackgroundColor`. Without that, picking a
     * light accent left white-on-light buttons that fail WCAG AA.
     */
    buttonTextColor?: string;
    /** `"auto"` follows `prefers-color-scheme`. Default `"light"` for back-compat. */
    colorScheme?: "auto" | "light" | "dark";
    /** Stacking order for the banner and modal. Default `99999`. */
    zIndex?: number;
    /**
     * Bump this whenever the consent categories change.
     *
     * A stored choice made against an older version is treated as absent, so
     * visitors are asked again rather than silently carrying consent they never
     * gave for the new categories. Default `1`.
     */
    version?: number;
    /**
     * Re-ask after this many days. Default `365`; supervisory authorities
     * generally expect consent to be refreshed at least annually.
     */
    expiryDays?: number;
    /** Key used for persistence. Default `"cookiePreferences"`. */
    storageKey?: string;
    /**
     * Where consent is stored. Defaults to `localStorage`.
     *
     * Supply a cookie-backed implementation if you need the choice shared
     * across subdomains, which `localStorage` cannot do.
     */
    storage?: ConsentStorage;
    onPreferencesChange?: (preferences: Record<string, boolean>, consentGiven: boolean) => void;
    getConsentGiven?: () => boolean;
    getConsentPreferences?: () => Record<string, boolean>;
};
/**
 * A caller-supplied config. Every level is optional: the component deep-merges
 * it onto the defaults, so `{ banner: { title } }` keeps the default buttons
 * and links rather than replacing the whole `banner` object.
 */
type DeepPartialConfig = {
    [K in keyof CookieConsentConfig]?: CookieConsentConfig[K] extends object ? CookieConsentConfig[K] extends Array<unknown> ? CookieConsentConfig[K] : Partial<CookieConsentConfig[K]> : CookieConsentConfig[K];
};
type Props = {
    config?: DeepPartialConfig;
    /** GA4 measurement id. Pass `null` to manage gtag yourself. */
    GA_TRACKING_ID: string | null;
};
interface IGetGtagAdsPropsDefault {
    isDefault: true;
}
interface IGetGtagAdsPropsNonDefault {
    ad_storage: boolean;
    analytics_storage: boolean;
    functionality_storage: boolean;
    personalization_storage: boolean;
    security_storage: boolean;
    necessary_storage: boolean;
}
type GetGtagAdsPropsT = IGetGtagAdsPropsDefault | (Partial<IGetGtagAdsPropsDefault> & IGetGtagAdsPropsNonDefault) | Record<string, boolean>;
declare global {
    interface Window {
        gtag?: (...args: unknown[]) => void;
        dataLayer?: unknown[];
    }
}
type PreferenceType = "all" | "essential";
/**
 * The config after defaults have been applied.
 *
 * `buttonTextColor` stays optional: leaving it unset is meaningful, and is
 * what triggers the automatic contrast choice.
 */
type ResolvedConsentConfig = Required<Omit<CookieConsentConfig, "buttonTextColor">> & Pick<CookieConsentConfig, "buttonTextColor">;

declare function CookieConsent({ GA_TRACKING_ID, config }: Props): React.JSX.Element;

export { type BannerLayout, type BannerPosition, type ConsentStorage, CookieConsent, type CookieConsentConfig, type DeepPartialConfig, type GetGtagAdsPropsT, type IGetGtagAdsPropsDefault, type IGetGtagAdsPropsNonDefault, type IMoreLinks, type IPreferenceOption, type PreferenceType, type Props, type ResolvedConsentConfig, type StoredConsent };
