<script lang="ts">
  import type { PageData } from './$types'
  import * as m from '$lib/paraglide/messages'

  let { data }: { data: PageData } = $props()
</script>

<svelte:head>
  <title>{m.claim_meta_title()}</title>
  <meta name="robots" content="noindex" />
</svelte:head>

<section class="mx-auto max-w-xl px-4 py-20 text-center">
  {#if data.valid}
    <h1 class="text-3xl font-extrabold tracking-tight">{m.claim_title()}</h1>
    <p class="mt-3 text-[var(--color-ink-soft)]">{m.claim_body()}</p>
  {:else}
    <h1 class="text-2xl font-bold">{m.claim_no_token()}</h1>
    <a class="mt-6 inline-block font-semibold text-[var(--color-accent)]" href="/screening">
      {m.screening_start()}
    </a>
  {/if}
</section>
