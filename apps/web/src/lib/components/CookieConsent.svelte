<script lang="ts">
  import * as m from '$lib/paraglide/messages'

  let { umamiSrc = '', umamiWebsiteId = '' }: { umamiSrc?: string; umamiWebsiteId?: string } = $props()

  const COOKIE = 'bl_cookie_consent'
  let visible = $state(false)
  let showSettings = $state(false)
  let analytics = $state(false)
  let marketing = $state(false)

  function readConsent(): { analytics: boolean; marketing: boolean } | null {
    const match = document.cookie.split('; ').find((c) => c.startsWith(`${COOKIE}=`))
    if (!match) return null
    try {
      return JSON.parse(decodeURIComponent(match.split('=').slice(1).join('=')))
    } catch {
      return null
    }
  }

  function loadUmami(enabled: boolean) {
    if (!enabled || !umamiSrc) return
    if (document.querySelector('script[data-bl-umami]')) return
    const s = document.createElement('script')
    s.src = umamiSrc
    s.async = true
    s.defer = true
    s.setAttribute('data-bl-umami', '')
    if (umamiWebsiteId) s.setAttribute('data-website-id', umamiWebsiteId)
    document.head.appendChild(s)
  }

  function persist(consent: { analytics: boolean; marketing: boolean }) {
    document.cookie = `${COOKIE}=${encodeURIComponent(JSON.stringify({ necessary: true, ...consent }))}; path=/; max-age=${60 * 60 * 24 * 180}; samesite=lax`
    visible = false
    loadUmami(consent.analytics)
  }

  $effect(() => {
    const existing = readConsent()
    if (existing) {
      loadUmami(existing.analytics)
    } else {
      visible = true
    }
  })
</script>

{#if visible}
  <div
    role="dialog"
    aria-label={m.cookie_title()}
    class="fixed inset-x-0 bottom-0 z-50 border-t border-[var(--color-line)] bg-[var(--color-surface)] shadow-lg"
  >
    <div class="mx-auto max-w-4xl px-4 py-4">
      <p class="font-semibold">{m.cookie_title()}</p>
      <p class="mt-1 text-sm text-[var(--color-ink-soft)]">{m.cookie_body()}</p>

      {#if showSettings}
        <div class="mt-3 space-y-2 text-sm">
          <label class="flex items-center gap-2 text-[var(--color-muted)]">
            <input type="checkbox" checked disabled /> {m.cookie_cat_necessary()}
          </label>
          <label class="flex items-center gap-2">
            <input type="checkbox" bind:checked={analytics} /> {m.cookie_cat_analytics()}
          </label>
          <label class="flex items-center gap-2">
            <input type="checkbox" bind:checked={marketing} /> {m.cookie_cat_marketing()}
          </label>
        </div>
      {/if}

      <div class="mt-4 flex flex-wrap gap-2">
        <button
          class="rounded-lg px-4 py-2 text-sm font-semibold text-white"
          style="background-color: var(--color-accent)"
          onclick={() => persist({ analytics: true, marketing: true })}
        >
          {m.cookie_accept_all()}
        </button>
        {#if showSettings}
          <button class="rounded-lg border border-[var(--color-line)] px-4 py-2 text-sm font-semibold" onclick={() => persist({ analytics, marketing })}>
            {m.cookie_save()}
          </button>
        {:else}
          <button class="rounded-lg border border-[var(--color-line)] px-4 py-2 text-sm font-semibold" onclick={() => (showSettings = true)}>
            {m.cookie_settings()}
          </button>
        {/if}
        <button class="rounded-lg border border-[var(--color-line)] px-4 py-2 text-sm font-semibold" onclick={() => persist({ analytics: false, marketing: false })}>
          {m.cookie_necessary_only()}
        </button>
      </div>
    </div>
  </div>
{/if}
