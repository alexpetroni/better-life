<script lang="ts">
  import type { PageData } from './$types'
  import * as m from '$lib/paraglide/messages'
  import ArticleCard from '$lib/components/ArticleCard.svelte'

  let { data }: { data: PageData } = $props()
  const accent = $derived(data.pillar?.accentColor ?? '#4f46e5')
</script>

<svelte:head>
  <title>{m.articles_title()} · {m.brand_somnium()}</title>
  <meta name="description" content={m.articles_subtitle()} />
</svelte:head>

<section class="mx-auto max-w-5xl px-4 py-12">
  <h1 class="text-3xl font-extrabold tracking-tight">{m.articles_title()}</h1>
  {#if data.articles.length}
    <div class="mt-8 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
      {#each data.articles as article (article.slug)}
        <ArticleCard {article} pillarName={data.pillar?.name ?? ''} {accent} />
      {/each}
    </div>
  {:else}
    <p class="mt-8 text-[var(--color-muted)]">{m.articles_empty()}</p>
  {/if}
</section>
