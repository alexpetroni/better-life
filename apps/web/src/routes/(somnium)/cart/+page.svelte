<script lang="ts">
  import { enhance } from '$app/forms'
  import type { PageData } from './$types'
  import * as m from '$lib/paraglide/messages'
  import { formatPrice } from '$lib/links'
  import { getLocale } from '$lib/paraglide/runtime'

  let { data }: { data: PageData } = $props()
  const items = $derived(data.cart?.items ?? [])
  const currency = $derived(data.cart?.currency_code ?? 'ron')
</script>

<svelte:head>
  <title>{m.cart_title()} · {m.brand_somnium()}</title>
  <meta name="robots" content="noindex" />
</svelte:head>

<section class="mx-auto max-w-2xl px-4 py-12">
  <h1 class="text-3xl font-extrabold tracking-tight">{m.cart_title()}</h1>

  {#if items.length === 0}
    <p class="mt-6 text-[var(--color-muted)]">{m.cart_empty()}</p>
    <a class="mt-6 inline-block font-semibold" style="color: var(--color-accent)" href="/somnium/shop">
      {m.continue_shopping()}
    </a>
  {:else}
    <ul class="mt-8 divide-y divide-[var(--color-line)]">
      {#each items as item (item.id)}
        <li class="flex items-center gap-4 py-4">
          <div class="flex-1">
            <p class="font-semibold">{item.product_title ?? item.title}</p>
            <p class="text-sm text-[var(--color-muted)]">{formatPrice(item.unit_price, currency, getLocale())}</p>
          </div>

          <form method="POST" action="?/update" use:enhance class="flex items-center gap-1">
            <input type="hidden" name="lineId" value={item.id} />
            <label class="sr-only" for={`qty-${item.id}`}>{m.cart_qty()}</label>
            <input
              id={`qty-${item.id}`}
              name="quantity"
              type="number"
              min="1"
              value={item.quantity}
              class="w-16 rounded border border-[var(--color-line)] px-2 py-1"
              onchange={(e) => e.currentTarget.form?.requestSubmit()}
            />
          </form>

          <span class="w-24 text-right font-semibold">{formatPrice(item.subtotal, currency, getLocale())}</span>

          <form method="POST" action="?/remove" use:enhance>
            <input type="hidden" name="lineId" value={item.id} />
            <button type="submit" class="text-sm text-red-600 hover:underline">{m.cart_remove()}</button>
          </form>
        </li>
      {/each}
    </ul>

    <div class="mt-6 flex items-center justify-between border-t border-[var(--color-line)] pt-4">
      <span class="text-[var(--color-muted)]">{m.cart_subtotal()}</span>
      <span class="text-xl font-extrabold">{formatPrice(data.cart?.subtotal, currency, getLocale())}</span>
    </div>

    <div class="mt-6 flex flex-wrap gap-3">
      <a
        href="/checkout"
        class="rounded-lg px-6 py-3 font-semibold text-white"
        style="background-color: var(--color-accent)"
      >
        {m.cart_checkout()}
      </a>
      <a
        href="/somnium/shop"
        class="rounded-lg border border-[var(--color-line)] px-6 py-3 font-semibold"
      >
        {m.continue_shopping()}
      </a>
    </div>
  {/if}
</section>
