import { sveltekit } from '@sveltejs/kit/vite'
import { paraglideVitePlugin } from '@inlang/paraglide-js'
import tailwindcss from '@tailwindcss/vite'
import { defineConfig } from 'vite'

export default defineConfig({
  // Single source of truth for env: the repo-root .env (shared with CMS, seed, migrations).
  envDir: '../../',
  plugins: [
    // Tailwind plugin must come before SvelteKit.
    tailwindcss(),
    paraglideVitePlugin({
      project: './project.inlang',
      outdir: './src/lib/paraglide',
      strategy: ['cookie', 'baseLocale'],
    }),
    sveltekit(),
  ],
  ssr: {
    // The email package ships compiled JS that imports React/Resend (Node libs);
    // keep it external so Vite doesn't try to bundle it for SSR.
    external: ['@better-life/emails'],
  },
})
