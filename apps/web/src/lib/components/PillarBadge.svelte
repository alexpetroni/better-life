<script lang="ts">
  let { name, accent = '#4f46e5' }: { name: string; accent?: string } = $props()
</script>

<span
  class="inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-semibold"
  style="color: {accent}; background-color: {accent}1a;"
>
  {name}
</span>
