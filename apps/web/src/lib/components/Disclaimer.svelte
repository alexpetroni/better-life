<script lang="ts">
  let { text }: { text: string } = $props()
</script>

<aside
  role="note"
  class="rounded-lg border border-amber-200 bg-amber-50 px-4 py-3 text-sm leading-relaxed text-amber-900"
>
  {text}
</aside>
