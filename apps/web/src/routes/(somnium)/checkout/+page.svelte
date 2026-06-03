<script lang="ts">
  import { enhance } from '$app/forms'
  import type { PageData, ActionData } from './$types'
  import * as m from '$lib/paraglide/messages'
  import { formatPrice } from '$lib/links'
  import { getLocale } from '$lib/paraglide/runtime'
  import Disclaimer from '$lib/components/Disclaimer.svelte'
  import { track } from '$lib/analytics'

  let { data, form }: { data: PageData; form: ActionData } = $props()
  let submitting = $state(false)
  $effect(() => {
    if ((form as any)?.order) track('order', { id: (form as any).order.displayId })
  })

  // Arm abandoned-cart recovery once the shopper provides a valid email, before
  // they finish. Fire-and-forget; failures are silent and never block checkout.
  let identified = $state(false)
  async function identifyCheckout(e: Event) {
    const email = (e.currentTarget as HTMLInputElement).value.trim()
    if (identified || !email.includes('@')) return
    identified = true
    try {
      const body = new FormData()
      body.set('email', email)
      await fetch('?/identify', { method: 'POST', body })
    } catch {
      identified = false
    }
  }

  const items = $derived(data.cart?.items ?? [])
  const currency = $derived(data.cart?.currency_code ?? 'ron')
  const v = $derived((form as any)?.values ?? {})
</script>

<svelte:head>
  <title>{m.checkout_title()} · {m.brand_somnium()}</title>
  <meta name="robots" content="noindex" />
</svelte:head>

<section class="mx-auto max-w-2xl px-4 py-12">
  {#if (form as any)?.order}
    <div class="rounded-2xl border border-green-200 bg-green-50 p-8 text-center" role="status">
      <h1 class="text-2xl font-extrabold text-green-800">{m.order_confirmed_title()}</h1>
      <p class="mt-3 text-green-900">{m.order_confirmed_body({ number: (form as any).order.displayId })}</p>
      <a class="mt-6 inline-block font-semibold" style="color: var(--color-accent)" href="/somnium/shop">
        {m.continue_shopping()}
      </a>
    </div>
  {:else if items.length === 0}
    <h1 class="text-3xl font-extrabold tracking-tight">{m.checkout_title()}</h1>
    <p class="mt-6 text-[var(--color-muted)]">{m.checkout_empty()}</p>
    <a class="mt-6 inline-block font-semibold" style="color: var(--color-accent)" href="/somnium/shop">
      {m.back_to_shop()}
    </a>
  {:else}
    <h1 class="text-3xl font-extrabold tracking-tight">{m.checkout_title()}</h1>

    <!-- Order summary -->
    <div class="mt-6 rounded-xl border border-[var(--color-line)] bg-[var(--color-surface)] p-5">
      <h2 class="text-sm font-semibold uppercase tracking-wide text-[var(--color-muted)]">{m.checkout_summary()}</h2>
      <ul class="mt-3 space-y-1 text-sm">
        {#each items as item (item.id)}
          <li class="flex justify-between">
            <span>{item.quantity} × {item.product_title ?? item.title}</span>
            <span>{formatPrice(item.subtotal, currency, getLocale())}</span>
          </li>
        {/each}
      </ul>
      <div class="mt-3 flex justify-between border-t border-[var(--color-line)] pt-3 font-bold">
        <span>{m.checkout_total()}</span>
        <span>{formatPrice(data.cart?.total ?? data.cart?.subtotal, currency, getLocale())}</span>
      </div>
    </div>

    {#if (form as any)?.error && (form as any).error !== 'empty'}
      <p role="alert" class="mt-4 text-sm text-red-600">{m.checkout_error()}</p>
    {/if}

    <form
      method="POST"
      action="?/place"
      class="mt-6 space-y-5"
      use:enhance={() => {
        submitting = true
        return async ({ update }) => {
          submitting = false
          await update()
        }
      }}
    >
      <fieldset class="rounded-xl border border-[var(--color-line)] p-5">
        <legend class="px-1 text-sm font-semibold">{m.checkout_contact()}</legend>
        <label class="mt-2 block text-sm font-medium" for="co-email">{m.checkout_email()}</label>
        <input id="co-email" name="email" type="email" required autocomplete="email" value={v.email ?? ''}
          onblur={identifyCheckout}
          class="mt-1 w-full rounded-lg border border-[var(--color-line)] px-3 py-2" />
        <label class="mt-3 block text-sm font-medium" for="co-phone">{m.checkout_phone()}</label>
        <input id="co-phone" name="phone" type="tel" autocomplete="tel" value={v.phone ?? ''}
          class="mt-1 w-full rounded-lg border border-[var(--color-line)] px-3 py-2" />
      </fieldset>

      <fieldset class="rounded-xl border border-[var(--color-line)] p-5">
        <legend class="px-1 text-sm font-semibold">{m.checkout_shipping()}</legend>
        <div class="grid gap-3 sm:grid-cols-2">
          <div>
            <label class="block text-sm font-medium" for="co-first">{m.checkout_first_name()}</label>
            <input id="co-first" name="first_name" autocomplete="given-name" value={v.first_name ?? ''}
              class="mt-1 w-full rounded-lg border border-[var(--color-line)] px-3 py-2" />
          </div>
          <div>
            <label class="block text-sm font-medium" for="co-last">{m.checkout_last_name()}</label>
            <input id="co-last" name="last_name" autocomplete="family-name" value={v.last_name ?? ''}
              class="mt-1 w-full rounded-lg border border-[var(--color-line)] px-3 py-2" />
          </div>
        </div>
        <label class="mt-3 block text-sm font-medium" for="co-addr">{m.checkout_address()}</label>
        <input id="co-addr" name="address" required autocomplete="street-address" value={v.address_1 ?? ''}
          class="mt-1 w-full rounded-lg border border-[var(--color-line)] px-3 py-2" />
        <div class="mt-3 grid gap-3 sm:grid-cols-2">
          <div>
            <label class="block text-sm font-medium" for="co-city">{m.checkout_city()}</label>
            <input id="co-city" name="city" required autocomplete="address-level2" value={v.city ?? ''}
              class="mt-1 w-full rounded-lg border border-[var(--color-line)] px-3 py-2" />
          </div>
          <div>
            <label class="block text-sm font-medium" for="co-postal">{m.checkout_postal()}</label>
            <input id="co-postal" name="postal" autocomplete="postal-code" value={v.postal_code ?? ''}
              class="mt-1 w-full rounded-lg border border-[var(--color-line)] px-3 py-2" />
          </div>
        </div>
      </fieldset>

      <Disclaimer text={m.checkout_payment_note()} />

      <button type="submit" disabled={submitting}
        class="rounded-lg px-6 py-3 font-semibold text-white disabled:opacity-60"
        style="background-color: var(--color-accent)">
        {m.checkout_place_order()}
      </button>
    </form>
  {/if}
</section>
