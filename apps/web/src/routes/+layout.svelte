<script lang="ts">
  import '../app.css'
  import * as m from '$lib/paraglide/messages'

  let { children } = $props()
</script>

<a href="#main" class="skip-link">{m.skip_to_content()}</a>
{@render children?.()}
