<script lang="ts">
  import SiteHeader from '$lib/components/SiteHeader.svelte'
  import SiteFooter from '$lib/components/SiteFooter.svelte'
  import * as m from '$lib/paraglide/messages'
  import { pillarHref } from '$lib/links'

  let { children, data } = $props()

  const links = $derived([
    { href: '/', label: m.nav_home() },
    ...data.nav.map((p) => ({ href: pillarHref(p), label: p.name })),
    { href: '/articles', label: m.nav_articles() },
    { href: '/screening', label: m.nav_screening() },
    { href: '/newsletter', label: m.nav_newsletter() },
  ])
</script>

<SiteHeader brandLabel={m.brand_betterlife()} brandHref="/" links={links} />
<main id="main">
  {@render children?.()}
</main>
<SiteFooter brandLabel={m.brand_betterlife_full()} />
