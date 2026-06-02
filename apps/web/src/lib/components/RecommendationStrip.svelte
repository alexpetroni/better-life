<script lang="ts">
  import type { StoreProduct } from '$lib/server/medusa'
  import { formatPrice } from '$lib/links'
  import { getLocale } from '$lib/paraglide/runtime'

  // Compact, read-only cross-sell / recommendation strip. Clicking a card goes to
  // the product page (where add-to-cart + "why this fits you" live). Renders
  // nothing when there are no products, so callers can drop it in unconditionally.
  let { heading, products }: { heading: string; products: StoreProduct[] } = $props()
</script>

{#if products.length}
  <section class="mt-12">
    <h2 class="text-xl font-bold">{heading}</h2>
    <div class="mt-4 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
      {#each products as p (p.id)}
        <a
          href={`/somnium/shop/${p.handle}`}
          class="flex h-full flex-col rounded-xl border border-[var(--color-line)] bg-[var(--color-surface)] p-5 transition-shadow hover:shadow-md"
        >
          <h3 class="font-bold leading-snug">{p.title}</h3>
          <span class="mt-3 text-lg font-extrabold" style="color: var(--color-accent)">
            {formatPrice(p.amount, p.currency, getLocale())}
          </span>
        </a>
      {/each}
    </div>
  </section>
{/if}
