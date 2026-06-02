import { defineConfig } from 'vitest/config'

export default defineConfig({
  test: {
    environment: 'node',
    include: ['src/**/*.test.ts'],
    // Integration tests hit the local app schema; run serially for a clean row.
    fileParallelism: false,
  },
})
