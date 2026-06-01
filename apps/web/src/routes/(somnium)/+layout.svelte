<script lang="ts">
  // Somnium shell — standalone-capable: imports only the shared design system,
  // never the (portal) group. A reverse proxy maps the domain in Phase 2.
  import SiteHeader from '$lib/components/SiteHeader.svelte'
  import SiteFooter from '$lib/components/SiteFooter.svelte'
  import * as m from '$lib/paraglide/messages'

  let { children, data } = $props()

  const somnium = $derived(data.nav.find((p) => p.slug === 'somnium'))
  const accent = $derived(somnium?.accentColor ?? '#4f46e5')
  const links = $derived([
    { href: '/somnium', label: m.nav_home() },
    { href: '/somnium/shop', label: m.nav_shop() },
    { href: '/somnium/blog', label: m.nav_articles() },
    { href: '/screening', label: m.nav_screening() },
    { href: '/cart', label: m.cart_view() },
    { href: '/account', label: m.account_title() },
  ])
</script>

<SiteHeader brandLabel={m.brand_somnium()} brandHref="/somnium" {accent} {links} />
<main id="main">
  {@render children?.()}
</main>
<SiteFooter brandLabel={m.brand_somnium()} />
