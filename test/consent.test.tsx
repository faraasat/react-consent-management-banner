import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { CookieConsent } from "../src";
import type { ConsentStorage } from "../src";

const GA = "G-TEST123";
const KEY = "cookiePreferences";

const readStored = () => JSON.parse(localStorage.getItem(KEY)!);
const consentCalls = () =>
  (window.dataLayer ?? []).filter((a) => (a as IArguments)[0] === "consent");

beforeEach(() => {
  localStorage.clear();
  delete (window as { gtag?: unknown }).gtag;
  delete (window as { dataLayer?: unknown }).dataLayer;
  document.documentElement.removeAttribute("data-ccb-scheme");
});
afterEach(() => vi.restoreAllMocks());

describe("first visit", () => {
  it("shows the banner", async () => {
    render(<CookieConsent GA_TRACKING_ID={GA} />);
    expect(await screen.findByText(/Accept All/i)).toBeInTheDocument();
  });

  it("denies non-essential consent to gtag before any choice", async () => {
    render(<CookieConsent GA_TRACKING_ID={GA} />);
    await waitFor(() => expect(consentCalls().length).toBeGreaterThan(0));
    const call = consentCalls()[0] as unknown as [string, string, Record<string, string>];
    expect(call[1]).toBe("default");
    expect(call[2].analytics_storage).toBe("denied");
    expect(call[2].security_storage).toBe("granted");
  });

  it("only forwards keys Consent Mode understands", async () => {
    render(
      <CookieConsent
        GA_TRACKING_ID={GA}
        config={{
          preferences: {
            title: "Prefs",
            button: {},
            options: [
              { key: "analytics_storage", label: "A", description: "" },
              { key: "my_custom_thing", label: "B", description: "" },
            ],
          },
        }}
      />
    );
    await waitFor(() => expect(consentCalls().length).toBeGreaterThan(0));
    const payload = (consentCalls()[0] as unknown as unknown[])[2] as Record<string, string>;
    expect(payload).toHaveProperty("analytics_storage");
    expect(payload).not.toHaveProperty("my_custom_thing");
  });
});

describe("making a choice", () => {
  it("grants everything on accept all", async () => {
    render(<CookieConsent GA_TRACKING_ID={GA} />);
    await userEvent.click(await screen.findByText(/Accept All/i));
    const saved = readStored();
    expect(saved.preferences.analytics_storage).toBe(true);
    expect(saved.preferences.ad_storage).toBe(true);
  });

  it("keeps only always-enabled categories on reject", async () => {
    render(<CookieConsent GA_TRACKING_ID={GA} />);
    await userEvent.click(await screen.findByText(/Reject Non-Essentials/i));
    const saved = readStored();
    expect(saved.preferences.necessary_storage).toBe(true);
    expect(saved.preferences.analytics_storage).toBe(false);
  });

  it("sends a consent update to gtag", async () => {
    render(<CookieConsent GA_TRACKING_ID={GA} />);
    await userEvent.click(await screen.findByText(/Accept All/i));
    await waitFor(() => {
      const update = consentCalls().find((c) => (c as unknown as unknown[])[1] === "update");
      expect(update).toBeTruthy();
    });
  });

  it("reports the choice through onPreferencesChange", async () => {
    const onPreferencesChange = vi.fn();
    render(<CookieConsent GA_TRACKING_ID={GA} config={{ onPreferencesChange }} />);
    await userEvent.click(await screen.findByText(/Accept All/i));
    await waitFor(() =>
      expect(onPreferencesChange).toHaveBeenCalledWith(expect.any(Object), true)
    );
  });

  it("hides the banner afterwards and shows the re-open button", async () => {
    render(<CookieConsent GA_TRACKING_ID={GA} />);
    await userEvent.click(await screen.findByText(/Accept All/i));
    await waitFor(() => expect(screen.queryByText(/Accept All/i)).not.toBeInTheDocument());
    expect(screen.getByLabelText("Cookie preferences")).toBeInTheDocument();
  });
});

describe("persistence", () => {
  const store = (prefs: Record<string, boolean>, extra: object = {}) =>
    localStorage.setItem(
      KEY,
      JSON.stringify({ preferences: prefs, version: 1, timestamp: Date.now(), ...extra })
    );

  it("stays hidden when a valid choice is stored", async () => {
    store({ analytics_storage: true });
    render(<CookieConsent GA_TRACKING_ID={GA} />);
    await waitFor(() => expect(screen.queryByText(/Accept All/i)).not.toBeInTheDocument());
  });

  it("re-asks when the config version has moved on", async () => {
    store({ analytics_storage: true }, { version: 1 });
    render(<CookieConsent GA_TRACKING_ID={GA} config={{ version: 2 }} />);
    expect(await screen.findByText(/Accept All/i)).toBeInTheDocument();
  });

  it("re-asks once the stored choice has expired", async () => {
    const twoYearsAgo = Date.now() - 730 * 24 * 60 * 60 * 1000;
    store({ analytics_storage: true }, { timestamp: twoYearsAgo });
    render(<CookieConsent GA_TRACKING_ID={GA} config={{ expiryDays: 365 }} />);
    expect(await screen.findByText(/Accept All/i)).toBeInTheDocument();
  });

  it("honours a choice written by an older release", async () => {
    // Older versions stored a bare preferences map with no metadata.
    localStorage.setItem(KEY, JSON.stringify({ analytics_storage: true }));
    render(<CookieConsent GA_TRACKING_ID={GA} />);
    await waitFor(() => expect(screen.queryByText(/Accept All/i)).not.toBeInTheDocument());
  });

  it("accepts a custom storage implementation", async () => {
    const mem = new Map<string, string>();
    const storage: ConsentStorage = {
      getItem: (k) => mem.get(k) ?? null,
      setItem: (k, v) => void mem.set(k, v),
      removeItem: (k) => void mem.delete(k),
    };
    render(<CookieConsent GA_TRACKING_ID={GA} config={{ storage }} />);
    await userEvent.click(await screen.findByText(/Accept All/i));
    expect(mem.has(KEY)).toBe(true);
    expect(localStorage.getItem(KEY)).toBeNull();
  });

  it("survives storage being unavailable", async () => {
    vi.spyOn(Storage.prototype, "getItem").mockImplementation(() => {
      throw new Error("blocked");
    });
    expect(() => render(<CookieConsent GA_TRACKING_ID={GA} />)).not.toThrow();
  });
});

describe("preferences modal", () => {
  it("opens from the banner", async () => {
    render(<CookieConsent GA_TRACKING_ID={GA} />);
    await userEvent.click(await screen.findByText(/Preferences/i));
    expect(await screen.findByRole("dialog")).toBeInTheDocument();
  });

  it("is an accessible dialog", async () => {
    render(<CookieConsent GA_TRACKING_ID={GA} />);
    await userEvent.click(await screen.findByText(/Preferences/i));
    const dialog = await screen.findByRole("dialog");
    expect(dialog).toHaveAttribute("aria-modal", "true");
    expect(dialog).toHaveAccessibleName(/Customize your cookie preferences/i);
  });

  it("closes on Escape", async () => {
    render(<CookieConsent GA_TRACKING_ID={GA} />);
    await userEvent.click(await screen.findByText(/Preferences/i));
    await screen.findByRole("dialog");
    await userEvent.keyboard("{Escape}");
    await waitFor(() => expect(screen.queryByRole("dialog")).not.toBeInTheDocument());
  });

  it("locks background scrolling while open", async () => {
    render(<CookieConsent GA_TRACKING_ID={GA} />);
    await userEvent.click(await screen.findByText(/Preferences/i));
    await screen.findByRole("dialog");
    expect(document.body.style.overflow).toBe("hidden");
  });

  it("disables always-on categories", async () => {
    render(<CookieConsent GA_TRACKING_ID={GA} />);
    await userEvent.click(await screen.findByText(/Preferences/i));
    const necessary = await screen.findByRole("checkbox", { name: /Necessary/i });
    expect(necessary).toBeDisabled();
    expect(necessary).toBeChecked();
  });

  it("saves individual toggles", async () => {
    render(<CookieConsent GA_TRACKING_ID={GA} />);
    await userEvent.click(await screen.findByText(/Preferences/i));
    await userEvent.click(await screen.findByRole("checkbox", { name: /^Analytics/i }));
    await userEvent.click(screen.getByText(/Save Preferences/i));
    await waitFor(() => expect(readStored().preferences.analytics_storage).toBe(true));
  });
});

describe("configuration", () => {
  it("survives a partial config without losing banner defaults", async () => {
    render(
      <CookieConsent GA_TRACKING_ID={GA} config={{ banner: { title: "Custom notice" } }} />
    );
    expect(await screen.findByText(/Custom notice/)).toBeInTheDocument();
    expect(screen.getByText(/Accept All/i)).toBeInTheDocument();
  });

  it("applies the configured position and layout", async () => {
    const { container } = render(
      <CookieConsent
        GA_TRACKING_ID={GA}
        config={{ banner: { position: "bottom-right", layout: "card" } }}
      />
    );
    await screen.findByText(/Accept All/i);
    const wrapper = container.querySelector(".ccb-wrapper")!;
    expect(wrapper.className).toContain("ccb-wrapper--bottom-right");
    expect(wrapper.className).toContain("ccb-wrapper--card");
  });

  it("applies the colour scheme to the document", async () => {
    render(<CookieConsent GA_TRACKING_ID={GA} config={{ colorScheme: "dark" }} />);
    await waitFor(() =>
      expect(document.documentElement.getAttribute("data-ccb-scheme")).toBe("dark")
    );
  });

  it("renders extra links without duplicate-key warnings", async () => {
    const warn = vi.spyOn(console, "error").mockImplementation(() => {});
    render(
      <CookieConsent
        GA_TRACKING_ID={GA}
        config={{
          banner: {
            links: {
              moreLinks: [
                { title: "Imprint", url: "/imprint" },
                { title: "DPA", url: "/dpa" },
              ],
            },
          },
        }}
      />
    );
    expect(await screen.findByText("Imprint")).toBeInTheDocument();
    expect(warn).not.toHaveBeenCalledWith(expect.stringContaining("unique \"key\""), expect.anything(), expect.anything());
  });

  it("sets consent without injecting gtag when the id is null", async () => {
    render(<CookieConsent GA_TRACKING_ID={null} />);
    await waitFor(() => expect(consentCalls().length).toBeGreaterThan(0));
    expect(document.querySelector("script[src*='googletagmanager']")).toBeNull();
  });
});

describe("button contrast", () => {
  const buttonTextVar = () =>
    document.documentElement.style.getPropertyValue(
      "--cookie-consent-button-text-color"
    );

  it("uses white text on the dark default accent", async () => {
    render(<CookieConsent GA_TRACKING_ID={GA} />);
    await screen.findByText(/Accept All/i);
    expect(buttonTextVar()).toBe("#ffffff");
  });

  // A configurable accent with hardcoded white text left any light accent
  // below the WCAG AA 4.5:1 minimum, with no way to correct it.
  it("switches to black text on a light accent", async () => {
    render(
      <CookieConsent GA_TRACKING_ID={GA} config={{ buttonBackgroundColor: "#6aa9ff" }} />
    );
    await screen.findByText(/Accept All/i);
    expect(buttonTextVar()).toBe("#000000");
  });

  it("honours an explicit buttonTextColor", async () => {
    render(
      <CookieConsent
        GA_TRACKING_ID={GA}
        config={{ buttonBackgroundColor: "#6aa9ff", buttonTextColor: "#123456" }}
      />
    );
    await screen.findByText(/Accept All/i);
    expect(buttonTextVar()).toBe("#123456");
  });

  it("falls back to white for an unparseable accent", async () => {
    render(
      <CookieConsent GA_TRACKING_ID={GA} config={{ buttonBackgroundColor: "rebeccapurple" }} />
    );
    await screen.findByText(/Accept All/i);
    expect(buttonTextVar()).toBe("#ffffff");
  });
});
