<script lang="ts">
  import { enhance } from '$app/forms'
  import type { PageData, ActionData } from './$types'
  import * as m from '$lib/paraglide/messages'
  import { formatPrice } from '$lib/links'
  import { getLocale } from '$lib/paraglide/runtime'

  let { data, form }: { data: PageData; form: ActionData } = $props()
  let submitting = $state(false)
</script>

<svelte:head>
  <title>{data.product.title} · {m.brand_somnium()}</title>
  <meta name="description" content={data.product.description ?? data.product.title} />
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
</section>
