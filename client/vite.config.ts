/// <reference types="vitest/config" />
import { readFileSync, writeFileSync } from 'node:fs'
import { fileURLToPath } from 'node:url'
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
      // The card catalog's pieces, the same way (`cardCatalog` below).
      const catalog: string[] = []
      for (const output of Object.values(ctx.bundle ?? {})) {
        if (output.type !== 'chunk') continue
        const shard = /[\\/]cards[\\/]shards[\\/]shard-(\d+)\.js$/.exec(output.facadeModuleId ?? '')
        if (shard !== null) files[Number(shard[1])] = output.fileName
        const piece = output.facadeModuleId ?? ''
        if (piece.startsWith(CATALOG_MODULE)) catalog[Number(piece.slice(CATALOG_MODULE.length))] = output.fileName
      }
      if (files.length === 0) throw new Error('card-shard-files: no card shard chunks in the bundle')
      if (catalog.length === 0) throw new Error('card-catalog-files: no card catalog chunks in the bundle')
      return [
        {
          tag: 'script',
          attrs: { type: 'application/json', id: 'card-shard-files' },
          children: JSON.stringify(files),
          injectTo: 'head',
        },
        {
          tag: 'script',
          attrs: { type: 'application/json', id: 'card-catalog-files' },
          children: JSON.stringify(catalog),
          injectTo: 'head',
        },
      ]
    },
  },
})

// The card catalog (`engine`'s `cards/catalog.ts`): the whole pool with its
// behaviour cut away, which is what the library and the deck builder load
// (`src/cards/catalogChunks.ts`). It's made here, from the built engine's
// pool, the first time a page asks for a piece of it — so it always matches
// `engine/dist`, with no generated file to keep in step — and each piece is
// served as a module that is one `JSON.parse` of a string: data is parsed
// several times faster than the same thing as an object literal is run.
// (Each id ends in the name its built file gets: "card-catalog-3".)
const CATALOG_ID = 'virtual:card-catalog/card-catalog-'
const CATALOG_MODULE = `\0${CATALOG_ID}`
const cardCatalog = (): Plugin => {
  let pieces: Promise<readonly string[]> | null = null
  const make = async (): Promise<readonly string[]> => {
    // The engine's barrel, and with it every card: imported only now, so a
    // dev server that never opens the library never pays for it.
    const engine = await import('engine')
    return engine.buildCardCatalog(engine.POOL_CARDS, engine.TOKEN_CARDS).map((piece) => JSON.stringify(piece))
  }
  return {
    name: 'deckblitz:card-catalog',
    resolveId(id) {
      return id.startsWith(CATALOG_ID) ? `\0${id}` : null
    },
    async load(id) {
      if (!id.startsWith(CATALOG_MODULE)) return null
      pieces ??= make()
      const piece = (await pieces)[Number(id.slice(CATALOG_MODULE.length))]
      if (piece === undefined) throw new Error(`card-catalog: no piece "${id.slice(CATALOG_MODULE.length)}"`)
      return `export default JSON.parse(${JSON.stringify(piece)})`
    },
  }
}

// The library's dev-only "Build ASAP" flags (`src/library/buildAsap.ts`): the
// cards not in the pool yet that the user wants built ahead of EDHREC rank,
// kept in `engine/data/build-asap.json`, which `npm run cards:needs -w engine`
// puts first. The dev server only (`apply: 'serve'`): a build has no endpoint,
// and the page shows no flags without one. GET reads the list; POST
// `{ name, on }` flags or unflags one card and answers with the new list.
const BUILD_ASAP_FILE = fileURLToPath(new URL('../engine/data/build-asap.json', import.meta.url))
type AsapFlag = { readonly name: string; readonly flagged: string }
const readAsap = (): AsapFlag[] => {
  try {
    const cards = (JSON.parse(readFileSync(BUILD_ASAP_FILE, 'utf8')) as { cards?: AsapFlag[] }).cards
    return Array.isArray(cards) ? cards : []
  } catch {
    return []
  }
}
// One card a line, by name, so a diff shows exactly which flags changed.
const writeAsap = (cards: readonly AsapFlag[]): void => {
  const sorted = [...cards].sort((a, b) => a.name.localeCompare(b.name))
  const body = sorted.map((c) => JSON.stringify(c)).join(',\n')
  writeFileSync(BUILD_ASAP_FILE, `{"cards":[${sorted.length > 0 ? `\n${body}\n` : ''}]}\n`, 'utf8')
}
const buildAsap = (): Plugin => ({
  name: 'deckblitz:build-asap',
  apply: 'serve',
  configureServer(server) {
    server.middlewares.use('/__build-asap', (req, res) => {
      const reply = (status: number, body: unknown) => {
        res.statusCode = status
        res.setHeader('Content-Type', 'application/json')
        res.end(JSON.stringify(body))
      }
      if (req.method === 'GET') return reply(200, { cards: readAsap() })
      if (req.method !== 'POST') return reply(405, { error: 'GET or POST' })
      let raw = ''
      req.on('data', (chunk: Buffer) => {
        raw += chunk.toString('utf8')
      })
      req.on('end', () => {
        let name: unknown
        let on: unknown
        try {
          ;({ name, on } = JSON.parse(raw) as { name?: unknown; on?: unknown })
        } catch {
          return reply(400, { error: 'not JSON' })
        }
        if (typeof name !== 'string' || name === '' || name.length > 200 || typeof on !== 'boolean') {
          return reply(400, { error: 'expected { name: string, on: boolean }' })
        }
        const rest = readAsap().filter((c) => c.name !== name)
        // Today here, not in UTC: an evening's flag dated tomorrow misleads.
        const now = new Date()
        const today = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-${String(now.getDate()).padStart(2, '0')}`
        const cards = on ? [...rest, readAsap().find((c) => c.name === name) ?? { name, flagged: today }] : rest
        writeAsap(cards)
        reply(200, { cards: readAsap() })
      })
    })
  },
})

// https://vite.dev/config/
export default defineConfig({
  plugins: [react(), engineLocal(), cardCatalog(), shardFiles(), buildAsap()],
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
