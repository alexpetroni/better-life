<script lang="ts">
  import * as m from '$lib/paraglide/messages'

  let { brandLabel }: { brandLabel: string } = $props()
  const year = new Date().getFullYear()
</script>

<footer class="mt-16 border-t border-[var(--color-line)] bg-[var(--color-surface)]">
  <div class="mx-auto max-w-5xl px-4 py-10">
    <p class="max-w-2xl text-sm leading-relaxed text-[var(--color-muted)]">
      {m.footer_disclaimer()}
    </p>
    <div class="mt-6 flex flex-wrap items-center gap-x-6 gap-y-2 text-sm">
      <a class="font-medium text-[var(--color-ink-soft)] hover:text-[var(--color-ink)]" href="/newsletter">
        {m.footer_newsletter()}
      </a>
      <span class="text-[var(--color-muted)]">© {year} {brandLabel}. {m.footer_rights()}</span>
    </div>
  </div>
</footer>
