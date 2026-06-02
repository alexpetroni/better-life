<script lang="ts">
  import type { PageData } from './$types'
  import QuizFlow from '$lib/components/QuizFlow.svelte'

  let { data, form }: { data: PageData; form: Record<string, any> | null } = $props()
</script>

<svelte:head>
  <title>{data.def.title}</title>
  {#if data.def.hook}<meta name="description" content={data.def.hook} />{/if}
</svelte:head>

<QuizFlow def={data.def} accent={data.accent} {form} restartHref={`/pillars/${data.pillarSlug}/screening`} />
