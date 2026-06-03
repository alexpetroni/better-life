// Client-side product analytics (Umami). No-ops unless Umami is loaded — i.e. the
// visitor granted analytics consent AND PUBLIC_UMAMI_SRC is configured (the script
// is injected by CookieConsent). Analytics must never break the UX, so every call
// is guarded and swallowed. Demo-relevant events: pillar engagement, the quiz
// funnel by pillar, and the conversion funnel.
export function track(event: string, data?: Record<string, unknown>): void {
  if (typeof window === 'undefined') return
  const umami = (window as unknown as { umami?: { track?: (e: string, d?: Record<string, unknown>) => void } })
    .umami
  try {
    umami?.track?.(event, data)
  } catch {
    /* analytics is best-effort */
  }
}
