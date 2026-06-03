<script lang="ts">
  let { name, accent = '#4f46e5' }: { name: string; accent?: string } = $props()
</script>

<!-- Solid accent + white text: meets WCAG AA for any sufficiently-dark accent
     (a tinted bg + accent text dropped below 4.5:1 for lighter accents). -->
<span
  class="inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-semibold text-white"
  style="background-color: {accent};"
>
  {name}
</span>
