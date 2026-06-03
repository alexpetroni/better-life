<script lang="ts">
  import type { Article, Pillar, PillarLandingBlock } from '@better-life/contracts'
  import * as m from '$lib/paraglide/messages'
  import ArticleCard from './ArticleCard.svelte'

  // Renders a pillar's composable landing sections (below the hero). `articleList`
  // blocks arrive with their articles already resolved server-side.
  type ResolvedBlock = PillarLandingBlock & { articles?: Article[] }
  let {
    blocks,
    pillar,
    accent,
    quizHref,
  }: { blocks: ResolvedBlock[]; pillar: Pillar; accent: string; quizHref: string | null } = $props()
</script>

{#each blocks as block, i (i)}
  {#if block.type === 'richText'}
    <section class="mx-auto max-w-3xl px-4 py-10">
      <div class="prose-body">{@html block.html}</div>
    </section>
  {:else if block.type === 'articleList'}
    <section class="mx-auto max-w-5xl px-4 py-10">
      <h2 class="text-2xl font-bold">{block.heading ?? m.nav_articles()}</h2>
      {#if block.articles?.length}
        <div class="mt-6 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {#each block.articles as article (article.slug)}
            <ArticleCard {article} pillarName={pillar.name} {accent} />
          {/each}
        </div>
      {:else}
        <p class="mt-6 text-[var(--color-muted)]">{m.articles_empty()}</p>
      {/if}
    </section>
  {:else if block.type === 'quizCta' && quizHref}
    <section class="mx-auto max-w-3xl px-4 py-10">
      <div class="rounded-2xl border border-[var(--color-line)] p-8 text-center" style="border-top: 4px solid {accent};">
        {#if block.heading}<h2 class="text-2xl font-bold">{block.heading}</h2>{/if}
        {#if block.body}<p class="mt-3 text-[var(--color-ink-soft)]">{block.body}</p>{/if}
        <a
          href={quizHref}
          class="mt-6 inline-block rounded-lg px-6 py-3 font-semibold text-white"
          style="background-color: {accent};"
        >
          {block.ctaLabel ?? m.landing_take_quiz()}
        </a>
      </div>
    </section>
  {:else if block.type === 'stat'}
    <section class="mx-auto max-w-3xl px-4 py-8 text-center">
      <p class="text-4xl font-extrabold" style="color: {accent}">{block.value}</p>
      {#if block.label}<p class="mt-2 text-[var(--color-ink-soft)]">{block.label}</p>{/if}
    </section>
  {:else if block.type === 'quote'}
    <section class="mx-auto max-w-3xl px-4 py-8">
      <blockquote class="border-l-4 pl-5 text-lg italic text-[var(--color-ink-soft)]" style="border-color: {accent};">
        {block.text}
        {#if block.attribution}<footer class="mt-2 text-sm not-italic text-[var(--color-muted)]">— {block.attribution}</footer>{/if}
      </blockquote>
    </section>
  {/if}
{/each}
