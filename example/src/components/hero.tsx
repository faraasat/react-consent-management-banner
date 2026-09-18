export function Hero() {
  const base = process.env.NEXT_PUBLIC_BASE_PATH ?? "";
  return (
    <header className="hero">
      <img src={`${base}/banner.svg`} alt="react-consent-management-banner" />
      <h1>react-consent-management-banner</h1>
      <p>GDPR / ePrivacy cookie consent for React, wired into Google Consent Mode v2.</p>
      <nav className="links">
        <a href="https://www.npmjs.com/package/react-consent-management-banner">npm</a>
        <a href="https://github.com/faraasat/react-consent-management-banner">GitHub</a>
        <a href="https://github.com/faraasat/react-consent-management-banner#readme">Docs</a>
      </nav>
    </header>
  );
}
