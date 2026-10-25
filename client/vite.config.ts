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

// Writes each card shard's built file into index.html, in shard order, so a
// shard whose request hangs can be asked for again by URL
// (`src/cards/shardFiles.ts`, which reads it by this id). index.html is never
// cached, so the list always names the files deployed beside it.
const shardFiles = (): Plugin => ({
  name: 'deckblitz:card-shard-files',
  apply: 'build',
  transformIndexHtml: {
    order: 'post',
    handler(_html, ctx) {
      const files: string[] = []
      for (const output of Object.values(ctx.bundle ?? {})) {
        if (output.type !== 'chunk') continue
        const shard = /[\\/]cards[\\/]shards[\\/]shard-(\d+)\.js$/.exec(output.facadeModuleId ?? '')
        if (shard !== null) files[Number(shard[1])] = output.fileName
      }
      if (files.length === 0) throw new Error('card-shard-files: no card shard chunks in the bundle')
      return [
        {
          tag: 'script',
          attrs: { type: 'application/json', id: 'card-shard-files' },
          children: JSON.stringify(files),
          injectTo: 'head',
        },
      ]
    },
  },
})

// https://vite.dev/config/
export default defineConfig({
  plugins: [react(), engineLocal(), shardFiles()],
  // The landing page's dev menu of test rooms (`src/lobby/devRooms.ts`)
  // reads dev-rooms' command port (`server/scripts/dev-rooms.mjs`) through
  // this: same-origin, so no CORS, and the dev server only — a build has
  // neither. dev-rooms' port, unless $CONTROL_PORT moved it as it does there.
  server: {
    proxy: {
      '/__dev-rooms': {
        target: `http://127.0.0.1:${process.env.CONTROL_PORT ?? 4099}`,
        rewrite: () => '/',
      },
    },
  },
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
