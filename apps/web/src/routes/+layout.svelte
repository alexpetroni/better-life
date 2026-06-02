<script lang="ts">
  import '../app.css'
  import * as m from '$lib/paraglide/messages'
  import CookieConsent from '$lib/components/CookieConsent.svelte'

  let { children, data } = $props()
</script>

<svelte:head>
  {#if data?.gscVerification}
    <meta name="google-site-verification" content={data.gscVerification} />
  {/if}
</svelte:head>

<a href="#main" class="skip-link">{m.skip_to_content()}</a>
{@render children?.()}
<CookieConsent umamiSrc={data?.umami?.src ?? ''} umamiWebsiteId={data?.umami?.websiteId ?? ''} />
