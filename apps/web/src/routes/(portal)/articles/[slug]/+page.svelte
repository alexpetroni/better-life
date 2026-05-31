<script lang="ts">
  import type { PageData } from './$types'
  import * as m from '$lib/paraglide/messages'
  import ArticleView from '$lib/components/ArticleView.svelte'

  let { data }: { data: PageData } = $props()

  const breadcrumbs = $derived([
    { name: m.breadcrumb_home(), path: '/' },
    { name: m.articles_title(), path: '/articles' },
    { name: data.article.title, path: `/articles/${data.article.slug}` },
  ])
</script>

<ArticleView article={data.article} pillar={data.pillar} {breadcrumbs} />
