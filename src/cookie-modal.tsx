import React, { FC, MouseEventHandler } from "react";

import { CookieConsentConfig } from ".";

const CookieModal: FC<{
  mergedConfig: Required<CookieConsentConfig>;
  togglePreference: (key: string) => void;
  handleSavePreferences: () => void;
  handleClose: MouseEventHandler<HTMLButtonElement>;
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

export { CookieModal };
