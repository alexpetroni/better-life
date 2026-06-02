import { defineConfig } from 'vitest/config'

// Standalone Vitest config (does NOT load the SvelteKit/Tailwind/paraglide
// plugins) for server-side integration tests that hit the local app schema.
export default defineConfig({
  test: {
    environment: 'node',
    include: ['src/lib/server/**/*.test.ts'],
    fileParallelism: false,
  },
})
