<script lang="ts">
  import type { PageData } from './$types'
  import * as m from '$lib/paraglide/messages'
  import ArticleCard from '$lib/components/ArticleCard.svelte'

  let { data }: { data: PageData } = $props()
  const accent = $derived(data.pillar.accentColor ?? '#4f46e5')
</script>

<svelte:head>
  <title>{data.pillar.name} — {data.pillar.tagline}</title>
  <meta name="description" content={data.pillar.hero?.subheading ?? data.pillar.tagline ?? ''} />
</svelte:head>

<section class="border-b border-[var(--color-line)] bg-[var(--color-surface)]" style="border-top: 4px solid {accent};">
  <div class="mx-auto max-w-5xl px-4 py-16 sm:py-20">
    <h1 class="max-w-2xl text-4xl font-extrabold tracking-tight sm:text-5xl">
      {data.pillar.hero?.heading ?? data.pillar.name}
    </h1>
    <p class="mt-5 max-w-xl text-lg text-[var(--color-ink-soft)]">
      {data.pillar.hero?.subheading ?? data.pillar.tagline ?? ''}
    </p>
    <a
      href="/screening"
      class="mt-8 inline-block rounded-lg px-6 py-3 font-semibold text-white"
      style="background-color: {accent};"
    >
      {data.pillar.hero?.ctaLabel ?? m.screening_start()}
    </a>
  </div>
</section>

<section class="mx-auto max-w-5xl px-4 py-12">
  <h2 class="text-2xl font-bold">{m.articles_title()}</h2>
  <div class="mt-6 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
    {#each data.articles as article (article.slug)}
      <ArticleCard {article} pillarName={data.pillar.name} {accent} />
    {/each}
  </div>
</section>
