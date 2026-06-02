<script lang="ts">
  import type { Article, Pillar } from '@better-life/contracts'
  import { page } from '$app/state'
  import * as m from '$lib/paraglide/messages'
  import { formatDate, articleHref } from '$lib/links'
  import { getLocale } from '$lib/paraglide/runtime'
  import PillarBadge from './PillarBadge.svelte'
  import Disclaimer from './Disclaimer.svelte'

  // Normalize a YouTube/Vimeo watch URL to its privacy-friendly embed form.
  function toEmbed(url: string): string | null {
    const yt = url.match(/(?:youtube\.com\/watch\?v=|youtu\.be\/|youtube\.com\/embed\/)([\w-]+)/)
    if (yt) return `https://www.youtube-nocookie.com/embed/${yt[1]}`
    const vm = url.match(/vimeo\.com\/(?:video\/)?(\d+)/)
    if (vm) return `https://player.vimeo.com/video/${vm[1]}`
    return null
  }

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
  const embed = $derived(article.videoUrl ? toEmbed(article.videoUrl) : null)
  const related = $derived(article.relatedArticles ?? [])

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
    <img src={article.heroImageUrl} alt="" loading="lazy" class="mb-8 w-full rounded-xl" />
  {/if}

  {#if article.callout}
    <aside class="mb-8 rounded-xl border-l-4 bg-[var(--color-surface)] p-5" style="border-color: {accent}">
      <p class="leading-relaxed text-[var(--color-ink-soft)]">{article.callout}</p>
    </aside>
  {/if}

  <div class="prose-body">
    {@html article.bodyHtml ?? ''}
  </div>

  {#if embed}
    <div class="mt-8 aspect-video w-full overflow-hidden rounded-xl">
      <iframe
        src={embed}
        title={article.title}
        class="h-full w-full"
        loading="lazy"
        allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
        allowfullscreen
      ></iframe>
    </div>
  {/if}

  {#if article.audioUrl}
    <audio controls preload="none" class="mt-8 w-full" src={article.audioUrl}></audio>
  {/if}

  {#if related.length}
    <section class="mt-12 border-t border-[var(--color-line)] pt-6">
      <h2 class="text-lg font-bold">{m.article_read_next()}</h2>
      <ul class="mt-3 space-y-2">
        {#each related as r (r.slug)}
          <li>
            <a class="font-semibold hover:underline" style="color: {accent}" href={articleHref(r)}>{r.title}</a>
            {#if r.excerpt}<p class="text-sm text-[var(--color-muted)]">{r.excerpt}</p>{/if}
          </li>
        {/each}
      </ul>
    </section>
  {/if}

  <div class="mt-10">
    <Disclaimer text={m.footer_disclaimer()} />
  </div>
</article>
