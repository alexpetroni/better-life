<script lang="ts">
  import { enhance } from '$app/forms'
  import type { PageData, ActionData } from './$types'
  import * as m from '$lib/paraglide/messages'
  import { formatPrice } from '$lib/links'
  import { getLocale } from '$lib/paraglide/runtime'
  import RecommendationStrip from '$lib/components/RecommendationStrip.svelte'

  let { data, form }: { data: PageData; form: ActionData } = $props()
  let submitting = $state(false)

  // Wishlist toggle state: seed from the server, then follow action results.
  let saved = $derived((form as any)?.saved ?? data.saved)

  const jsonLd = $derived(
    JSON.stringify({
      '@context': 'https://schema.org',
      '@type': 'Product',
      name: data.product.title,
      description: data.product.description ?? data.product.title,
      offers: {
        '@type': 'Offer',
        price: data.product.amount ?? undefined,
        priceCurrency: (data.product.currency ?? 'ron').toUpperCase(),
        availability: 'https://schema.org/InStock',
      },
    })
  )
</script>

<svelte:head>
  <title>{data.product.title} · {m.brand_somnium()}</title>
  <meta name="description" content={data.product.description ?? data.product.title} />
  <meta property="og:type" content="product" />
  <meta property="og:title" content={data.product.title} />
  <meta property="og:description" content={data.product.description ?? data.product.title} />
  {@html `<script type="application/ld+json">${jsonLd}</script>`}
</svelte:head>

<section class="mx-auto max-w-2xl px-4 py-12">
  <a class="text-sm text-[var(--color-muted)] hover:underline" href="/somnium/shop">← {m.back_to_shop()}</a>

  <h1 class="mt-4 text-3xl font-extrabold tracking-tight">{data.product.title}</h1>
  <p class="mt-3 text-2xl font-extrabold" style="color: var(--color-accent)">
    {formatPrice(data.product.amount, data.product.currency, getLocale())}
  </p>
  {#if data.product.description}
    <p class="mt-4 leading-relaxed text-[var(--color-ink-soft)]">{data.product.description}</p>
  {/if}

  {#if data.why}
    <div class="mt-6 rounded-xl border border-[var(--color-line)] bg-[var(--color-surface)] p-5">
      <p class="text-sm font-bold" style="color: var(--color-accent)">{m.product_why_title()}</p>
      <p class="mt-1 text-sm text-[var(--color-ink-soft)]">{m.product_why_body()}</p>
    </div>
  {/if}

  {#if form?.added}
    <p role="status" class="mt-6 rounded-lg border border-green-200 bg-green-50 px-4 py-3 text-green-800">
      {m.added_to_cart()} — <a class="font-semibold underline" href="/cart">{m.cart_view()}</a>
    </p>
  {:else}
    <form
      method="POST"
      action="?/add"
      class="mt-6"
      use:enhance={() => {
        submitting = true
        return async ({ update }) => {
          submitting = false
          await update({ reset: false })
        }
      }}
    >
      <input type="hidden" name="variantId" value={data.product.variantId} />
      <button
        type="submit"
        disabled={submitting || !data.product.variantId}
        class="rounded-lg px-6 py-3 font-semibold text-white disabled:opacity-60"
        style="background-color: var(--color-accent)"
      >
        {m.add_to_cart()}
      </button>
    </form>
  {/if}

  {#if data.canSave}
    <form method="POST" action="?/save" class="mt-3" use:enhance={() => ({ update }) => update({ reset: false })}>
      <input type="hidden" name="remove" value={saved ? 'true' : 'false'} />
      <button type="submit" class="text-sm font-semibold underline" style="color: var(--color-accent)">
        {saved ? m.wishlist_saved() : m.wishlist_save()}
      </button>
    </form>
  {/if}

  <RecommendationStrip heading={m.recommend_crosssell()} products={data.crossSell} />
</section>
