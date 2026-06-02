<script lang="ts">
  import type { PageData } from './$types'
  let { data }: { data: PageData } = $props()
</script>

<svelte:head>
  <title>Dezabonare</title>
  <meta name="robots" content="noindex" />
</svelte:head>

<section class="mx-auto max-w-xl px-4 py-16">
  {#if data.ok}
    <h1 class="text-3xl font-extrabold tracking-tight">Te-ai dezabonat</h1>
    <p class="mt-3 text-[var(--color-ink-soft)]">
      Nu îți vom mai trimite emailuri de marketing. Vei primi în continuare emailuri legate de comenzile tale.
    </p>
  {:else}
    <h1 class="text-3xl font-extrabold tracking-tight">Link invalid</h1>
    <p class="mt-3 text-[var(--color-ink-soft)]">
      Linkul de dezabonare nu este valid sau a expirat. Dacă vrei să te dezabonezi, scrie-ne și ne ocupăm noi.
    </p>
  {/if}
  <a class="mt-8 inline-block font-semibold" style="color: var(--color-accent)" href="/">Înapoi la pagina principală</a>
</section>
