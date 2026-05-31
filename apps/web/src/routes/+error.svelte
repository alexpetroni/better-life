<script lang="ts">
  import { page } from '$app/state'
  import * as m from '$lib/paraglide/messages'
</script>

<main id="main" class="mx-auto max-w-2xl px-4 py-24 text-center">
  <p class="text-sm font-semibold text-[var(--color-muted)]">{page.status}</p>
  <h1 class="mt-2 text-3xl font-bold">{m.not_found_title()}</h1>
  <p class="mt-3 text-[var(--color-muted)]">{m.not_found_body()}</p>
  <a class="mt-6 inline-block font-semibold" style="color: var(--color-accent)" href="/">
    {m.not_found_home()}
  </a>
</main>
