<script lang="ts">
  import type { PageData } from './$types'
  import { page as pageState } from '$app/state'

  let { data }: { data: PageData } = $props()
  const description = $derived(data.page.seo?.metaDescription ?? '')
</script>

<svelte:head>
  <title>{data.page.seo?.metaTitle ?? data.page.title}</title>
  {#if description}<meta name="description" content={description} />{/if}
  <link rel="canonical" href={pageState.url.origin + pageState.url.pathname} />
</svelte:head>

<article class="mx-auto max-w-3xl px-4 py-12">
  <h1 class="text-3xl font-extrabold tracking-tight sm:text-4xl">{data.page.title}</h1>
  <div class="prose-body mt-6">
    {@html data.page.bodyHtml}
  </div>
</article>
