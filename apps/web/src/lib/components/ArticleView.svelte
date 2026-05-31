<script lang="ts">
  import type { Article, Pillar } from '@better-life/contracts'
  import { page } from '$app/state'
  import * as m from '$lib/paraglide/messages'
  import { formatDate } from '$lib/links'
  import { getLocale } from '$lib/paraglide/runtime'
  import PillarBadge from './PillarBadge.svelte'
  import Disclaimer from './Disclaimer.svelte'

  let {
    article,
    pillar,
    breadcrumbs,
  }: {
    article: Article
    pillar?: Pillar | null
    breadcrumbs: { name: string; path: string }[]
  } = $props()

  const accent = $derived(pillar?.accentColor ?? '#4f46e5')
  const origin = $derived(page.url.origin)
  const description = $derived(article.seo?.metaDescription ?? article.excerpt ?? '')

  const jsonLd = $derived(
    JSON.stringify([
      {
        '@context': 'https://schema.org',
        '@type': 'Article',
        headline: article.title,
        description,
        author: article.author ? { '@type': 'Organization', name: article.author } : undefined,
        datePublished: article.publishedAt,
        image: article.heroImageUrl || article.seo?.ogImageUrl || undefined,
        mainEntityOfPage: origin + page.url.pathname,
      },
      {
        '@context': 'https://schema.org',
        '@type': 'BreadcrumbList',
        itemListElement: breadcrumbs.map((b, i) => ({
          '@type': 'ListItem',
          position: i + 1,
          name: b.name,
          item: origin + b.path,
        })),
      },
    ])
  )
</script>

<svelte:head>
  <title>{article.seo?.metaTitle ?? article.title}</title>
  <meta name="description" content={description} />
  <link rel="canonical" href={origin + page.url.pathname} />
  <meta property="og:type" content="article" />
  <meta property="og:title" content={article.seo?.metaTitle ?? article.title} />
  <meta property="og:description" content={description} />
  {#if article.heroImageUrl || article.seo?.ogImageUrl}
    <meta property="og:image" content={article.heroImageUrl ?? article.seo?.ogImageUrl} />
  {/if}
  <meta name="twitter:card" content="summary_large_image" />
  <meta name="twitter:title" content={article.seo?.metaTitle ?? article.title} />
  <meta name="twitter:description" content={description} />
  {@html `<script type="application/ld+json">${jsonLd}</script>`}
</svelte:head>

<article class="mx-auto max-w-2xl px-4 py-10">
  <nav aria-label="breadcrumb" class="mb-6 text-sm text-[var(--color-muted)]">
    <ol class="flex flex-wrap items-center gap-1.5">
      {#each breadcrumbs as crumb, i (crumb.path)}
        <li class="flex items-center gap-1.5">
          {#if i < breadcrumbs.length - 1}
            <a class="hover:underline" href={crumb.path}>{crumb.name}</a>
            <span aria-hidden="true">/</span>
          {:else}
            <span aria-current="page" class="text-[var(--color-ink-soft)]">{crumb.name}</span>
          {/if}
        </li>
      {/each}
    </ol>
  </nav>

  <header class="mb-8">
    <div class="mb-3 flex items-center gap-2">
      {#if pillar}<PillarBadge name={pillar.name} {accent} />{/if}
      {#if article.publishedAt}
        <span class="text-sm text-[var(--color-muted)]">{formatDate(article.publishedAt, getLocale())}</span>
      {/if}
    </div>
    <h1 class="text-3xl font-extrabold leading-tight tracking-tight sm:text-4xl">{article.title}</h1>
    {#if article.author}
      <p class="mt-3 text-sm text-[var(--color-muted)]">{m.article_by({ author: article.author })}</p>
    {/if}
  </header>

  {#if article.heroImageUrl}
    <img src={article.heroImageUrl} alt="" class="mb-8 w-full rounded-xl" />
  {/if}

  <div class="prose-body">
    {@html article.bodyHtml ?? ''}
  </div>

  <div class="mt-10">
    <Disclaimer text={m.footer_disclaimer()} />
  </div>
</article>
