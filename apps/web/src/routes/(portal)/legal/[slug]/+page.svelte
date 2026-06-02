<script lang="ts">
  import type { PageData } from './$types'
  import * as m from '$lib/paraglide/messages'

  let { data }: { data: PageData } = $props()

  const titles: Record<string, () => string> = {
    terms: m.legal_terms,
    privacy: m.legal_privacy,
    returns: m.legal_returns,
    shipping: m.legal_shipping,
    contact: m.legal_contact,
    anpc: m.legal_anpc,
  }
  const title = $derived((titles[data.slug] ?? m.legal_terms)())
</script>

<svelte:head>
  <title>{title} · {m.brand_betterlife()}</title>
</svelte:head>

<section class="mx-auto max-w-2xl px-4 py-12">
  <h1 class="text-3xl font-extrabold tracking-tight">{title}</h1>
  <div class="prose-body mt-6">
    {#each data.sections as block (block)}
      {#if block.startsWith('## ')}
        <h2>{block.slice(3)}</h2>
      {:else}
        <p>{block}</p>
      {/if}
    {/each}
  </div>
</section>
