<script lang="ts">
  import { enhance } from '$app/forms'
  import type { PageData } from './$types'
  import * as m from '$lib/paraglide/messages'
  import { formatPrice } from '$lib/links'
  import { getLocale } from '$lib/paraglide/runtime'

  let { data }: { data: PageData } = $props()
</script>

<svelte:head>
  <title>{m.wishlist_title()} · {m.brand_somnium()}</title>
  <meta name="robots" content="noindex" />
</svelte:head>

<section class="mx-auto max-w-2xl px-4 py-12">
  <h1 class="text-3xl font-extrabold tracking-tight">{m.wishlist_title()}</h1>

  {#if !data.identified}
    <p class="mt-6 text-[var(--color-ink-soft)]">{m.wishlist_login_prompt()}</p>
    <div class="mt-6 flex flex-wrap gap-3">
      <a class="font-semibold" style="color: var(--color-accent)" href="/account">{m.account_login()}</a>
      <a class="font-semibold" style="color: var(--color-accent)" href="/screening">{m.nav_screening()}</a>
    </div>
  {:else if data.products.length === 0}
    <p class="mt-6 text-[var(--color-muted)]">{m.wishlist_empty()}</p>
    <a class="mt-6 inline-block font-semibold" style="color: var(--color-accent)" href="/somnium/shop">
      {m.continue_shopping()}
    </a>
  {:else}
    <ul class="mt-8 divide-y divide-[var(--color-line)]">
      {#each data.products as p (p.id)}
        <li class="flex items-center gap-4 py-4">
          <div class="flex-1">
            <a class="font-semibold hover:underline" href={`/somnium/shop/${p.handle}`}>{p.title}</a>
            <p class="text-sm text-[var(--color-muted)]">{formatPrice(p.amount, p.currency, getLocale())}</p>
          </div>
          <form method="POST" action="?/add" use:enhance>
            <input type="hidden" name="variantId" value={p.variantId} />
            <button type="submit" disabled={!p.variantId}
              class="rounded-lg px-4 py-2 text-sm font-semibold text-white disabled:opacity-60"
              style="background-color: var(--color-accent)">
              {m.add_to_cart()}
            </button>
          </form>
          <form method="POST" action="?/remove" use:enhance>
            <input type="hidden" name="handle" value={p.handle} />
            <button type="submit" class="text-sm text-red-600 hover:underline">{m.wishlist_remove()}</button>
          </form>
        </li>
      {/each}
    </ul>
  {/if}
</section>
