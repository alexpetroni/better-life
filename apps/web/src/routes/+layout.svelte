<script lang="ts">
  import '../app.css'
  import * as m from '$lib/paraglide/messages'
  import CookieConsent from '$lib/components/CookieConsent.svelte'

  let { children, data } = $props()
</script>

<a href="#main" class="skip-link">{m.skip_to_content()}</a>
{@render children?.()}
<CookieConsent umamiSrc={data?.umami?.src ?? ''} umamiWebsiteId={data?.umami?.websiteId ?? ''} />
