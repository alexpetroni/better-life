import adapter from '@sveltejs/adapter-node'
import { vitePreprocess } from '@sveltejs/vite-plugin-svelte'

/** @type {import('@sveltejs/kit').Config} */
const config = {
  preprocess: vitePreprocess(),
  kit: {
    // SSR for SEO, plus the BFF. Node host (no edge/Workers runtime).
    adapter: adapter(),
    alias: {
      $components: 'src/lib/components',
    },
  },
}

export default config
