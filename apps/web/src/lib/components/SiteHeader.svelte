<script lang="ts">
  import * as m from '$lib/paraglide/messages'

  let {
    brandLabel,
    brandHref = '/',
    accent = '#4f46e5',
    links = [],
  }: {
    brandLabel: string
    brandHref?: string
    accent?: string
    links?: { href: string; label: string }[]
  } = $props()
</script>

<header class="border-b border-[var(--color-line)] bg-[var(--color-surface)]">
  <div class="mx-auto flex max-w-5xl flex-wrap items-center justify-between gap-3 px-4 py-4">
    <a href={brandHref} class="text-lg font-extrabold tracking-tight" style="color: {accent}">
      {brandLabel}
    </a>
    <nav aria-label={m.nav_home()}>
      <ul class="flex flex-wrap items-center gap-x-5 gap-y-1 text-sm font-medium">
        {#each links as link (link.href)}
          <li><a class="text-[var(--color-ink-soft)] hover:text-[var(--color-ink)]" href={link.href}>{link.label}</a></li>
        {/each}
      </ul>
    </nav>
  </div>
</header>
