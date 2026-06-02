<script lang="ts">
  import * as m from '$lib/paraglide/messages'

  let { brandLabel }: { brandLabel: string } = $props()
  const year = new Date().getFullYear()

  const legalLinks = [
    { href: '/legal/terms', label: m.legal_terms() },
    { href: '/legal/privacy', label: m.legal_privacy() },
    { href: '/legal/returns', label: m.legal_returns() },
    { href: '/legal/shipping', label: m.legal_shipping() },
    { href: '/legal/contact', label: m.legal_contact() },
    { href: '/legal/anpc', label: m.legal_anpc() },
  ]
</script>

<footer class="mt-16 border-t border-[var(--color-line)] bg-[var(--color-surface)]">
  <div class="mx-auto max-w-5xl px-4 py-10">
    <p class="max-w-2xl text-sm leading-relaxed text-[var(--color-muted)]">
      {m.footer_disclaimer()}
    </p>
    <nav aria-label={m.footer_legal()} class="mt-6 flex flex-wrap gap-x-5 gap-y-2 text-sm">
      <a class="font-medium text-[var(--color-ink-soft)] hover:text-[var(--color-ink)]" href="/newsletter">
        {m.footer_newsletter()}
      </a>
      {#each legalLinks as link (link.href)}
        <a class="text-[var(--color-muted)] hover:text-[var(--color-ink)]" href={link.href}>{link.label}</a>
      {/each}
    </nav>
    <p class="mt-4 text-sm text-[var(--color-muted)]">© {year} {brandLabel}. {m.footer_rights()}</p>
  </div>
</footer>
