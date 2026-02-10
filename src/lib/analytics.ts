// Simple, provider-agnostic analytics helper.
// Sends pageview beacons to an optional endpoint configured via Vite env.
//
// Usage:
//  - Set VITE_ANALYTICS_BEACON_URL to a serverless endpoint that
//    records page views (e.g. /api/analytics/pageview).
//  - The endpoint will receive small JSON payloads via navigator.sendBeacon.
//
// This runs entirely on the client and does not expose any secret keys.

const BEACON_URL = import.meta.env.VITE_ANALYTICS_BEACON_URL as string | undefined;

export interface PageViewPayload {
  path: string;
  referrer?: string;
  ts: string;
  userAgent?: string;
}

export function trackPageView(path: string) {
  if (!BEACON_URL || typeof navigator === "undefined" || typeof window === "undefined") {
    // No endpoint configured or not in a browser environment.
    return;
  }

  const payload: PageViewPayload = {
    path,
    referrer: document.referrer || undefined,
    ts: new Date().toISOString(),
    userAgent: navigator.userAgent,
  };

  try {
    const blob = new Blob([JSON.stringify(payload)], { type: "application/json" });
    navigator.sendBeacon(BEACON_URL, blob);
  } catch {
    // Silently ignore failures; analytics should never break the app.
  }
}

