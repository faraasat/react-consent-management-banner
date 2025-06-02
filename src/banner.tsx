import React, { Dispatch, FC, SetStateAction } from "react";

import { CookieConsentConfig } from ".";

const Banner: FC<{
  mergedConfig: Required<CookieConsentConfig>;
  handleAcceptAll: () => void;
  handleRejectNonEssential: () => void;
  setShowPreferences: Dispatch<SetStateAction<boolean>>;
}> = ({
  mergedConfig,
  handleAcceptAll,
  handleRejectNonEssential,
  setShowPreferences,
}) => {
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
          <button onClick={handleAcceptAll}>{button.acceptAlText}</button>
          <button onClick={handleRejectNonEssential}>
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

export { Banner };
