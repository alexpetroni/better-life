<script lang="ts">
  import { enhance } from '$app/forms'
  import type { PageData, ActionData } from './$types'
  import * as m from '$lib/paraglide/messages'
  import { formatPrice, formatDate } from '$lib/links'
  import { getLocale } from '$lib/paraglide/runtime'

  let { data, form }: { data: PageData; form: ActionData } = $props()
</script>

<svelte:head>
  <title>{m.account_title()} · {m.brand_somnium()}</title>
  <meta name="robots" content="noindex" />
</svelte:head>

<section class="mx-auto max-w-xl px-4 py-12">
  {#if data.customer}
    <h1 class="text-3xl font-extrabold tracking-tight">{m.account_title()}</h1>
    <p class="mt-2 text-[var(--color-ink-soft)]">{m.account_welcome({ email: data.customer.email })}</p>

    <h2 class="mt-8 text-xl font-bold">{m.account_orders()}</h2>
    {#if data.orders.length}
      <ul class="mt-3 divide-y divide-[var(--color-line)]">
        {#each data.orders as o (o.display_id)}
          <li class="flex justify-between py-3">
            <span>#{o.display_id} · {formatDate(o.created_at, getLocale())}</span>
            <span class="font-semibold">{formatPrice(o.total, o.currency_code ?? 'ron', getLocale())}</span>
          </li>
        {/each}
      </ul>
    {:else}
      <p class="mt-3 text-[var(--color-muted)]">{m.account_no_orders()}</p>
    {/if}

    <form method="POST" action="?/logout" use:enhance class="mt-8">
      <button class="rounded-lg border border-[var(--color-line)] px-5 py-2 font-semibold">{m.account_logout()}</button>
    </form>
  {:else}
    <h1 class="text-3xl font-extrabold tracking-tight">{m.account_title()}</h1>

    <div class="mt-8 grid gap-8 sm:grid-cols-2">
      <!-- Login -->
      <form method="POST" action="?/login" use:enhance class="space-y-3">
        <h2 class="text-lg font-bold">{m.account_login()}</h2>
        <input name="email" type="email" required placeholder={m.checkout_email()}
          value={(form as any)?.mode === 'login' ? (form as any).email : ''}
          class="w-full rounded-lg border border-[var(--color-line)] px-3 py-2" />
        <input name="password" type="password" required placeholder={m.account_password()}
          class="w-full rounded-lg border border-[var(--color-line)] px-3 py-2" />
        {#if (form as any)?.mode === 'login' && (form as any)?.error}
          <p class="text-sm text-red-600">{m.account_error()}</p>
        {/if}
        <button class="w-full rounded-lg px-4 py-2 font-semibold text-white" style="background-color: var(--color-accent)">
          {m.account_login_cta()}
        </button>
      </form>

      <!-- Register -->
      <form method="POST" action="?/register" use:enhance class="space-y-3">
        <h2 class="text-lg font-bold">{m.account_register()}</h2>
        <input name="email" type="email" required placeholder={m.checkout_email()}
          value={(form as any)?.mode === 'register' ? (form as any).email : ''}
          class="w-full rounded-lg border border-[var(--color-line)] px-3 py-2" />
        <input name="password" type="password" required minlength="8" placeholder={m.account_password()}
          class="w-full rounded-lg border border-[var(--color-line)] px-3 py-2" />
        {#if (form as any)?.mode === 'register' && (form as any)?.error}
          <p class="text-sm text-red-600">{m.account_register_error()}</p>
        {/if}
        <button class="w-full rounded-lg border border-[var(--color-line)] px-4 py-2 font-semibold">
          {m.account_register_cta()}
        </button>
      </form>
    </div>
  {/if}
</section>
