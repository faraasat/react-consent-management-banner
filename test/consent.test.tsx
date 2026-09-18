import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { CookieConsent } from "../src";

const GA = "G-TEST123";
const STORAGE_KEY = "cookiePreferences";

describe("CookieConsent", () => {
  beforeEach(() => {
    localStorage.clear();
    delete (window as any).gtag;
    delete (window as any).dataLayer;
  });
  afterEach(() => vi.restoreAllMocks());

  it("shows the banner on a first visit", async () => {
    render(<CookieConsent GA_TRACKING_ID={GA} />);
    expect(await screen.findByText(/Accept All/i)).toBeInTheDocument();
  });

  it("stays hidden when a choice was already stored", async () => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify({ analytics_storage: true }));
    render(<CookieConsent GA_TRACKING_ID={GA} />);
    await waitFor(() => expect(screen.queryByText(/Accept All/i)).not.toBeInTheDocument());
  });

  it("persists every category as granted when accepting all", async () => {
    render(<CookieConsent GA_TRACKING_ID={GA} />);
    await userEvent.click(await screen.findByText(/Accept All/i));
    const saved = JSON.parse(localStorage.getItem(STORAGE_KEY)!);
    expect(saved.analytics_storage).toBe(true);
    expect(saved.ad_storage).toBe(true);
  });

  it("keeps only always-enabled categories when rejecting non-essentials", async () => {
    render(<CookieConsent GA_TRACKING_ID={GA} />);
    await userEvent.click(await screen.findByText(/Reject Non-Essentials/i));
    const saved = JSON.parse(localStorage.getItem(STORAGE_KEY)!);
    expect(saved.necessary_storage).toBe(true);
    expect(saved.analytics_storage).toBe(false);
    expect(saved.ad_storage).toBe(false);
  });

  it("denies non-essential consent to gtag before any choice is made", async () => {
    render(<CookieConsent GA_TRACKING_ID={GA} />);
    await waitFor(() => expect(window.dataLayer?.length).toBeGreaterThan(0));
    const call = (window.dataLayer as any[]).find((a) => a[0] === "consent" && a[1] === "default");
    expect(call[2].analytics_storage).toBe("denied");
    expect(call[2].necessary_storage).toBe("granted");
  });

  it("opens the preferences modal from the banner", async () => {
    render(<CookieConsent GA_TRACKING_ID={GA} />);
    await userEvent.click(await screen.findByText(/Preferences/i));
    expect(await screen.findByText(/Customize your cookie preferences/i)).toBeInTheDocument();
  });

  it("reports a missing tracking id instead of failing silently", async () => {
    const spy = vi.spyOn(console, "error").mockImplementation(() => {});
    render(<CookieConsent GA_TRACKING_ID={"" as string} />);
    await waitFor(() => expect(spy).toHaveBeenCalled());
  });

  it("survives a partial config without losing banner defaults", async () => {
    // A caller overriding only the title must not wipe out `button` / `links`.
    render(<CookieConsent GA_TRACKING_ID={GA} config={{ banner: { title: "Custom notice" } } as any} />);
    expect(await screen.findByText(/Custom notice/)).toBeInTheDocument();
    expect(screen.getByText(/Accept All/i)).toBeInTheDocument();
  });
});
