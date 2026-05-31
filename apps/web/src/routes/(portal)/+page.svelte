<script lang="ts">
  import type { PageData } from './$types'
  import * as m from '$lib/paraglide/messages'
  import { pillarHref } from '$lib/links'
  import ArticleCard from '$lib/components/ArticleCard.svelte'

  let { data }: { data: PageData } = $props()
</script>

<svelte:head>
  <title>{m.home_meta_title()}</title>
  <meta name="description" content={m.home_meta_description()} />
  <meta property="og:title" content={m.home_meta_title()} />
  <meta property="og:description" content={m.home_meta_description()} />
  <meta property="og:type" content="website" />
  <meta name="twitter:card" content="summary_large_image" />
</svelte:head>

<!-- Hero -->
<section class="border-b border-[var(--color-line)] bg-[var(--color-surface)]">
  <div class="mx-auto max-w-5xl px-4 py-16 sm:py-24">
    <h1 class="max-w-3xl text-4xl font-extrabold tracking-tight sm:text-5xl">
      {m.home_hero_title()}
    </h1>
    <p class="mt-5 max-w-2xl text-lg leading-relaxed text-[var(--color-ink-soft)]">
      {m.home_hero_subtitle()}
    </p>
  </div>
</section>

<!-- Pillars (live only — status gating) -->
<section class="mx-auto max-w-5xl px-4 py-12">
  <h2 class="text-sm font-semibold uppercase tracking-wide text-[var(--color-muted)]">
    {m.home_pillars_title()}
  </h2>
  <ul class="mt-4 grid gap-4 sm:grid-cols-2">
    {#each data.live as pillar (pillar.slug)}
      <li>
        <a
          href={pillarHref(pillar)}
          class="block rounded-xl border border-[var(--color-line)] bg-[var(--color-surface)] p-6 transition-shadow hover:shadow-md"
          style="border-left: 4px solid {pillar.accentColor};"
        >
          <span class="text-xl font-bold" style="color: {pillar.accentColor}">{pillar.name}</span>
          {#if pillar.tagline}
            <p class="mt-1 text-sm text-[var(--color-ink-soft)]">{pillar.tagline}</p>
          {/if}
        </a>
      </li>
    {/each}
  </ul>
</section>

<!-- Featured articles (latest from live pillars) -->
<section class="mx-auto max-w-5xl px-4 py-8">
  <h2 class="text-2xl font-bold">{m.home_featured_title()}</h2>
  <p class="mt-1 text-[var(--color-muted)]">{m.home_featured_subtitle()}</p>
  {#if data.featured.length}
    <div class="mt-6 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
      {#each data.featured as article (article.slug)}
        <ArticleCard
          {article}
          pillarName={data.nameBySlug[article.pillarSlug]}
          accent={data.accentBySlug[article.pillarSlug]}
        />
      {/each}
    </div>
  {:else}
    <p class="mt-6 text-[var(--color-muted)]">{m.articles_empty()}</p>
  {/if}
</section>

<!-- featured_product: rendered hidden until Phase 2 (no product exists yet) -->
{#if data.featuredProduct}
  <!-- Phase 2 will render the featured product here. -->
{/if}

<!-- Quiz invitation -->
{#if data.quizPillar}
  <section class="mx-auto max-w-5xl px-4 py-12">
    <div
      class="rounded-2xl px-8 py-10 text-center"
      style="background-color: {data.accentBySlug[data.quizPillar.slug]}12;"
    >
      <h2 class="text-2xl font-bold">{m.home_quiz_invitation_title()}</h2>
      <p class="mx-auto mt-2 max-w-xl text-[var(--color-ink-soft)]">{m.home_quiz_invitation_body()}</p>
      <a
        href="/screening"
        class="mt-6 inline-block rounded-lg px-6 py-3 font-semibold text-white"
        style="background-color: {data.accentBySlug[data.quizPillar.slug]};"
      >
        {m.home_quiz_invitation_cta()}
      </a>
    </div>
  </section>
{/if}
