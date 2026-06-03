<script lang="ts">
  import type { PageData } from './$types'
  import * as m from '$lib/paraglide/messages'
  import ArticleCard from '$lib/components/ArticleCard.svelte'
  import LandingBlocks from '$lib/components/LandingBlocks.svelte'
  import { track } from '$lib/analytics'

  let { data }: { data: PageData } = $props()
  const accent = $derived(data.pillar.accentColor ?? '#4f46e5')
  $effect(() => track('pillar_view', { pillar: data.pillar.slug }))
  const hero = $derived(data.pillar.hero)
  const heroCta = $derived(hero?.ctaLabel && hero?.ctaHref ? { label: hero.ctaLabel, href: hero.ctaHref } : null)
  const hasBlocks = $derived((data.blocks?.length ?? 0) > 0)
</script>

<svelte:head>
  <title>{data.pillar.name} · {m.brand_betterlife()}</title>
  <meta name="description" content={data.pillar.tagline ?? data.pillar.name} />
</svelte:head>

<section class="border-b border-[var(--color-line)] bg-[var(--color-surface)]" style="border-top: 4px solid {accent};">
  <div class="mx-auto max-w-5xl px-4 py-16">
    <h1 class="text-4xl font-extrabold tracking-tight" style="color: {accent}">
      {hero?.heading ?? data.pillar.name}
    </h1>
    <p class="mt-4 max-w-2xl text-lg text-[var(--color-ink-soft)]">
      {hero?.subheading ?? data.pillar.tagline ?? ''}
    </p>
    {#if heroCta}
      <a
        href={heroCta.href}
        class="mt-6 inline-block rounded-lg px-6 py-3 font-semibold text-white"
        style="background-color: {accent};"
      >
        {heroCta.label}
      </a>
    {/if}
  </div>
</section>

{#if hasBlocks}
  <!-- CMS-composed landing -->
  <LandingBlocks blocks={data.blocks} pillar={data.pillar} {accent} quizHref={data.quizHref} />
{:else}
  <!-- Default landing: this pillar's articles -->
  <section class="mx-auto max-w-5xl px-4 py-12">
    <h2 class="text-2xl font-bold">{m.pillar_articles_title({ pillar: data.pillar.name })}</h2>
    {#if data.articles.length}
      <div class="mt-6 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
        {#each data.articles as article (article.slug)}
          <ArticleCard {article} pillarName={data.pillar.name} {accent} />
        {/each}
      </div>
    {:else}
      <p class="mt-6 text-[var(--color-muted)]">{m.articles_empty()}</p>
    {/if}
  </section>
{/if}
