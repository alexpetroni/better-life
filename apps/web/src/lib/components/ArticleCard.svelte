<script lang="ts">
  import type { Article } from '@better-life/contracts'
  import { articleHref, formatDate } from '$lib/links'
  import { getLocale } from '$lib/paraglide/runtime'
  import * as m from '$lib/paraglide/messages'
  import PillarBadge from './PillarBadge.svelte'

  let {
    article,
    pillarName = '',
    accent = '#4f46e5',
  }: { article: Article; pillarName?: string; accent?: string } = $props()
</script>

<article
  class="flex h-full flex-col rounded-xl border border-[var(--color-line)] bg-[var(--color-surface)] p-5 transition-shadow hover:shadow-md"
>
  <div class="mb-3 flex items-center gap-2">
    {#if pillarName}
      <PillarBadge name={pillarName} {accent} />
    {/if}
    {#if article.publishedAt}
      <span class="text-xs text-[var(--color-muted)]">{formatDate(article.publishedAt, getLocale())}</span>
    {/if}
  </div>
  <h3 class="mb-2 text-lg font-bold leading-snug">
    <a href={articleHref(article)} class="hover:underline">{article.title}</a>
  </h3>
  {#if article.excerpt}
    <p class="mb-4 flex-1 text-sm leading-relaxed text-[var(--color-ink-soft)]">{article.excerpt}</p>
  {/if}
  <a href={articleHref(article)} class="text-sm font-semibold" style="color: {accent}">
    {m.read_article()} <span aria-hidden="true">→</span>
  </a>
</article>
