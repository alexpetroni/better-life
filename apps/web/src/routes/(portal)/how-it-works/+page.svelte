<script lang="ts">
  import * as m from '$lib/paraglide/messages'

  const steps = $derived([
    { title: m.hiw_step1_title(), body: m.hiw_step1_body() },
    { title: m.hiw_step2_title(), body: m.hiw_step2_body() },
    { title: m.hiw_step3_title(), body: m.hiw_step3_body() },
  ])
</script>

<svelte:head>
  <title>{m.hiw_meta_title()}</title>
  <meta name="description" content={m.hiw_intro()} />
</svelte:head>

<section class="mx-auto max-w-3xl px-4 py-16">
  <h1 class="text-3xl font-extrabold tracking-tight">{m.hiw_title()}</h1>
  <p class="mt-3 text-lg text-[var(--color-ink-soft)]">{m.hiw_intro()}</p>

  <ol class="mt-10 space-y-6">
    {#each steps as step, i (step.title)}
      <li class="flex gap-4">
        <span
          class="flex h-9 w-9 flex-none items-center justify-center rounded-full bg-[var(--color-accent)] font-bold text-white"
          aria-hidden="true"
        >
          {i + 1}
        </span>
        <div>
          <h2 class="text-xl font-bold">{step.title}</h2>
          <p class="mt-1 text-[var(--color-ink-soft)]">{step.body}</p>
        </div>
      </li>
    {/each}
  </ol>

  <a
    href="/screening"
    class="mt-10 inline-block rounded-lg bg-[var(--color-accent)] px-6 py-3 font-semibold text-white"
  >
    {m.screening_start()}
  </a>
</section>
