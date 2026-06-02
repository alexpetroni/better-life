<script lang="ts">
  import { enhance } from '$app/forms'
  import type { QuizDefinition } from '@better-life/contracts'
  import * as m from '$lib/paraglide/messages'
  import Disclaimer from './Disclaimer.svelte'

  // Pillar-agnostic screening flow (quiz → result → email capture → confirmation),
  // fully driven by the quiz `def` + accent + the route's `?/submit` and `?/capture`
  // actions. Reused by every pillar's screening route. `restartHref` points back to
  // the pillar's own screening URL.
  let {
    def,
    accent,
    form,
    restartHref,
  }: {
    def: QuizDefinition
    accent: string
    form: Record<string, any> | null
    restartHref: string
  } = $props()

  const step = $derived(form?.step ?? 'quiz')
  const missing = $derived(new Set<string>(form?.missing ?? []))
  const profile = $derived(
    form?.profileKey ? def.profiles.find((p) => p.key === form.profileKey) : undefined
  )

  let submitting = $state(false)
</script>

<section class="mx-auto max-w-2xl px-4 py-12">
  {#if step === 'quiz'}
    <h1 class="text-3xl font-extrabold tracking-tight">{def.title}</h1>
    {#if def.hook}<p class="mt-2 text-[var(--color-ink-soft)]">{def.hook}</p>{/if}

    <div class="mt-6">
      <Disclaimer text={def.disclaimer ?? m.disclaimer_screening()} />
    </div>

    <form
      method="POST"
      action="?/submit"
      class="mt-8 space-y-8"
      use:enhance={() => {
        submitting = true
        return async ({ update }) => {
          submitting = false
          await update()
        }
      }}
    >
      {#each def.questions as q, i (q.key)}
        <fieldset
          class="rounded-xl border p-5"
          class:border-red-300={missing.has(q.key)}
          class:border-[var(--color-line)]={!missing.has(q.key)}
        >
          <legend class="px-1 text-sm font-semibold text-[var(--color-muted)]">
            {m.screening_progress({ current: i + 1, total: def.questions.length })}
          </legend>
          <p class="text-lg font-bold">{q.text}</p>
          {#if q.helpText}<p class="mt-1 text-sm text-[var(--color-muted)]">{q.helpText}</p>{/if}

          <div class={q.displayVariant === 'card' ? 'mt-4 grid gap-2 sm:grid-cols-2' : 'mt-4 space-y-2'}>
            {#each q.options as opt (opt.value)}
              <label
                class="flex cursor-pointer items-center gap-3 rounded-lg border border-[var(--color-line)] px-4 py-3 hover:bg-[var(--color-bg)] has-[:checked]:border-current"
                style="--tw-text-opacity:1; accent-color: {accent};"
              >
                <input
                  type="radio"
                  name={q.key}
                  value={opt.value}
                  required
                  checked={form?.answers?.[q.key] === opt.value}
                  class="h-4 w-4"
                />
                <span class="text-sm">{opt.label}</span>
              </label>
            {/each}
          </div>
        </fieldset>
      {/each}

      {#if form?.error === 'incomplete'}
        <p role="alert" class="text-sm text-red-600">{m.error_generic()}</p>
      {/if}

      <button
        type="submit"
        disabled={submitting}
        class="rounded-lg px-6 py-3 font-semibold text-white disabled:opacity-60"
        style="background-color: {accent};"
      >
        {m.screening_see_results()}
      </button>
    </form>
  {/if}

  {#if (step === 'result' || step === 'captured') && profile}
    <div class="rounded-2xl border border-[var(--color-line)] bg-[var(--color-surface)] p-6 sm:p-8">
      <p class="text-sm font-semibold uppercase tracking-wide" style="color: {accent}">
        {m.screening_your_profile()}
      </p>
      <h1 class="mt-2 text-2xl font-extrabold sm:text-3xl">{profile.title}</h1>
      <p class="mt-3 leading-relaxed text-[var(--color-ink-soft)]">{profile.description}</p>

      {#if profile.tip}
        <div class="mt-5 rounded-lg p-4" style="background-color: {accent}12;">
          <p class="text-sm font-semibold" style="color: {accent}">{m.screening_tip_title()}</p>
          <p class="mt-1 text-[var(--color-ink-soft)]">{profile.tip}</p>
        </div>
      {/if}

      {#if profile.recommendations.length}
        <h2 class="mt-6 text-lg font-bold">{m.screening_recommendations_title()}</h2>
        <ul class="mt-3 space-y-3">
          {#each profile.recommendations as rec (rec.title)}
            <li class="rounded-lg border border-[var(--color-line)] p-4">
              <p class="font-semibold">{rec.title}</p>
              <p class="mt-1 text-sm text-[var(--color-ink-soft)]">{rec.body}</p>
            </li>
          {/each}
        </ul>
      {/if}
    </div>

    <div class="mt-4">
      <Disclaimer text={def.resultDisclaimer ?? m.disclaimer_result()} />
    </div>
  {/if}

  {#if step === 'result'}
    <!-- Email capture with granular, unticked GDPR consent -->
    <div class="mt-8 rounded-2xl border border-[var(--color-line)] bg-[var(--color-surface)] p-6 sm:p-8">
      <h2 class="text-xl font-bold">{m.capture_title()}</h2>
      <p class="mt-1 text-[var(--color-ink-soft)]">{m.capture_subtitle()}</p>

      <form
        method="POST"
        action="?/capture"
        class="mt-6 space-y-5"
        use:enhance={() => {
          submitting = true
          return async ({ update }) => {
            submitting = false
            await update()
          }
        }}
      >
        <input type="hidden" name="leadId" value={form?.leadId ?? ''} />
        <input type="hidden" name="profileKey" value={form?.profileKey ?? ''} />

        <div>
          <label class="block text-sm font-medium" for="cap-email">{m.capture_email_label()}</label>
          <input
            id="cap-email"
            name="email"
            type="email"
            required
            autocomplete="email"
            placeholder={m.capture_email_placeholder()}
            value={form?.email ?? ''}
            aria-invalid={form?.error === 'email' ? 'true' : undefined}
            class="mt-1 w-full rounded-lg border border-[var(--color-line)] px-3 py-2"
          />
          {#if form?.error === 'email'}<p class="mt-1 text-sm text-red-600">{m.capture_email_invalid()}</p>{/if}
        </div>

        <div class="flex items-start gap-3">
          <input id="cap-results" name="consent_results" type="checkbox" class="mt-1 h-4 w-4" />
          <label class="text-sm text-[var(--color-ink-soft)]" for="cap-results">
            {m.capture_consent_results()}
            <span class="mt-0.5 block text-xs text-[var(--color-muted)]">{m.capture_consent_results_required()}</span>
          </label>
        </div>

        <div class="flex items-start gap-3">
          <input id="cap-marketing" name="consent_marketing" type="checkbox" class="mt-1 h-4 w-4" />
          <label class="text-sm text-[var(--color-ink-soft)]" for="cap-marketing">
            {m.capture_consent_marketing()}
          </label>
        </div>

        {#if form?.error === 'consent'}<p role="alert" class="text-sm text-red-600">{m.capture_consent_required()}</p>{/if}

        <p class="text-xs text-[var(--color-muted)]">{m.capture_privacy_note()}</p>

        <button
          type="submit"
          disabled={submitting}
          class="rounded-lg px-6 py-3 font-semibold text-white disabled:opacity-60"
          style="background-color: {accent};"
        >
          {m.capture_submit()}
        </button>
      </form>
    </div>
  {/if}

  {#if step === 'captured'}
    <div class="mt-6 rounded-lg border border-green-200 bg-green-50 px-4 py-3 text-green-800" role="status">
      <p class="font-semibold">{m.capture_success_title()}</p>
      <p class="text-sm">{m.capture_success_body()}</p>
    </div>
    <a class="mt-6 inline-block text-sm font-semibold" style="color: {accent}" href={restartHref}>
      {m.screening_restart()}
    </a>
  {/if}
</section>
