import { sveltekit } from '@sveltejs/kit/vite'
import { paraglideVitePlugin } from '@inlang/paraglide-js'
import tailwindcss from '@tailwindcss/vite'
import { defineConfig, type PluginOption } from 'vite'

// The Medusa workspace pulls a second Vite copy (v5) into the monorepo, so the
// plugins and `defineConfig` can type against different Vite module identities.
// This is cosmetic (dev + build both work); assert the plugin array to the local
// PluginOption type to keep type-checking clean.
const plugins = [
  // Tailwind plugin must come before SvelteKit.
  tailwindcss(),
  paraglideVitePlugin({
    project: './project.inlang',
    outdir: './src/lib/paraglide',
    strategy: ['cookie', 'baseLocale'],
  }),
  sveltekit(),
] as unknown as PluginOption[]

export default defineConfig({
  // Single source of truth for env: the repo-root .env (shared with CMS, seed, migrations).
  envDir: '../../',
  plugins,
  ssr: {
    // The email package ships compiled JS that imports React/Resend (Node libs);
    // keep it external so Vite doesn't try to bundle it for SSR.
    external: ['@better-life/emails'],
  },
})
