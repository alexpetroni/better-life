<script lang="ts">
  import type { PageData } from './$types'
  import * as m from '$lib/paraglide/messages'
  import { formatPrice } from '$lib/links'
  import { getLocale } from '$lib/paraglide/runtime'

  let { data }: { data: PageData } = $props()
</script>

<svelte:head>
  <title>{m.shop_title()} · {m.brand_somnium()}</title>
  <meta name="description" content={m.shop_subtitle()} />
</svelte:head>

<section class="mx-auto max-w-5xl px-4 py-12">
  <h1 class="text-3xl font-extrabold tracking-tight">{m.shop_title()}</h1>
  <p class="mt-2 text-[var(--color-muted)]">{m.shop_subtitle()}</p>

  <nav aria-label="Categorii" class="mt-6 flex flex-wrap gap-2">
    <a
      href="/somnium/shop"
      class="rounded-full border px-3 py-1 text-sm"
      class:border-[var(--color-accent)]={!data.activeCat}
      class:font-semibold={!data.activeCat}
      class:border-[var(--color-line)]={data.activeCat}
    >
      {m.shop_all()}
    </a>
    {#each data.categories as cat (cat.id)}
      <a
        href={`/somnium/shop?cat=${cat.id}`}
        class="rounded-full border px-3 py-1 text-sm"
        class:border-[var(--color-accent)]={data.activeCat === cat.id}
        class:font-semibold={data.activeCat === cat.id}
        class:border-[var(--color-line)]={data.activeCat !== cat.id}
      >
        {cat.name}
      </a>
    {/each}
  </nav>

  {#if data.products.length}
    <div class="mt-8 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
      {#each data.products as p (p.id)}
        <a
          href={`/somnium/shop/${p.handle}`}
          class="flex h-full flex-col rounded-xl border border-[var(--color-line)] bg-[var(--color-surface)] p-5 transition-shadow hover:shadow-md"
        >
          <h2 class="text-lg font-bold leading-snug">{p.title}</h2>
          {#if p.description}<p class="mt-2 flex-1 text-sm text-[var(--color-ink-soft)]">{p.description}</p>{/if}
          <span class="mt-4 text-lg font-extrabold" style="color: var(--color-accent)">
            {formatPrice(p.amount, p.currency, getLocale())}
          </span>
        </a>
      {/each}
    </div>
  {:else}
    <p class="mt-8 text-[var(--color-muted)]">{m.shop_empty()}</p>
  {/if}
</section>
