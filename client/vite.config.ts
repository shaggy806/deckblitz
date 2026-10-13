/// <reference types="vitest/config" />
import react from '@vitejs/plugin-react'
import { defineConfig } from 'vite'
import type { Plugin } from 'vite'
import { engineLocalPlugin } from 'engine/local-plugin'

// The local room worker (`src/local/room-worker.ts`) runs a game with
// `engine/local`: this resolves the engine's fallback registry — the whole
// card pool — to a stub, so the pool never lands in the worker's bundle (the
// cards come from the shards instead). The page itself never imports it, so
// the swap only ever touches the worker. In `plugins` for the dev server,
// which serves the worker through them, and in `worker.plugins` for a build.
const engineLocal = (): Plugin => engineLocalPlugin() as unknown as Plugin

// https://vite.dev/config/
export default defineConfig({
  plugins: [react(), engineLocal()],
  worker: {
    // ES module workers, so the worker can load the card shards as chunks.
    format: 'es',
    plugins: () => [engineLocal()],
  },
  // Unit tests only: the Playwright suite in e2e/ runs on its own
  // (`test:e2e`), and vitest's default pattern would pick its specs up too.
  test: {
    include: ['src/**/*.test.ts'],
  },
})
