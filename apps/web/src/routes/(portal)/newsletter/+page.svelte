<script lang="ts">
  import { enhance } from '$app/forms'
  import type { ActionData } from './$types'
  import * as m from '$lib/paraglide/messages'

  let { form }: { form: ActionData } = $props()
  let submitting = $state(false)
</script>

<svelte:head>
  <title>{m.newsletter_meta_title()}</title>
  <meta name="description" content={m.newsletter_subtitle()} />
</svelte:head>

<section class="mx-auto max-w-xl px-4 py-16">
  <h1 class="text-3xl font-extrabold tracking-tight">{m.newsletter_title()}</h1>
  <p class="mt-3 text-[var(--color-ink-soft)]">{m.newsletter_subtitle()}</p>

  {#if form?.success}
    <p role="status" class="mt-8 rounded-lg border border-green-200 bg-green-50 px-4 py-3 text-green-800">
      {m.newsletter_success()}
    </p>
  {:else}
    <form
      method="POST"
      class="mt-8 space-y-5"
      use:enhance={() => {
        submitting = true
        return async ({ update }) => {
          submitting = false
          await update()
        }
      }}
    >
      <div>
        <label class="block text-sm font-medium" for="nl-email">{m.newsletter_email_label()}</label>
        <input
          id="nl-email"
          name="email"
          type="email"
          required
          autocomplete="email"
          value={form?.email ?? ''}
          aria-invalid={form?.error === 'email' ? 'true' : undefined}
          class="mt-1 w-full rounded-lg border border-[var(--color-line)] px-3 py-2"
        />
        {#if form?.error === 'email'}
          <p class="mt-1 text-sm text-red-600">{m.capture_email_invalid()}</p>
        {/if}
      </div>

      <div class="flex items-start gap-3">
        <input id="nl-consent" name="consent" type="checkbox" class="mt-1 h-4 w-4" />
        <label class="text-sm text-[var(--color-ink-soft)]" for="nl-consent">{m.newsletter_consent()}</label>
      </div>
      {#if form?.error === 'consent'}
        <p class="text-sm text-red-600">{m.newsletter_consent_required()}</p>
      {/if}

      <button
        type="submit"
        disabled={submitting}
        class="rounded-lg bg-[var(--color-accent)] px-6 py-3 font-semibold text-white disabled:opacity-60"
      >
        {m.newsletter_submit()}
      </button>
    </form>
  {/if}
</section>
