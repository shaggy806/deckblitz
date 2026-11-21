import { expect, test } from '@playwright/test'
import type { Browser, Page } from '@playwright/test'

// Click to frame on a slowed connection (`docs/plans/replicated-rooms.md`,
// step 4): how long a player waits to see their own move, in a game on the
// server and in the same game played as a table, with the page's connection
// to the server delayed each way. A measurement, not a check of the build:
// it runs only when asked (`TABLE_LATENCY=1 npx playwright test
// table-latency`), prints its numbers and keeps them as JSON in the test's
// output directory.
//
// What is timed is the page's own message for a move leaving it (to the
// server, or to its worker) and the next frame of the game arriving: the
// part of click-to-screen that differs between the two. Drawing the frame is
// the same either way.

test.skip(process.env.TABLE_LATENCY !== '1', 'a measurement: run with TABLE_LATENCY=1')

/** One-way delays, in milliseconds: none, a good line, a poor one, a bad one. */
const LAGS = [0, 75, 150, 300] as const
/** Moves timed in each game. */
const MOVES = 14

interface Wire {
  /** Whether this page told the server it can hold a copy. */
  capable: boolean
  /** Whether the server started the room's game as a table. */
  table: boolean
}

/** A page whose socket to the server is delayed by `lag` each way, and
 * which times its own moves (`window.__latency`). */
async function open(browser: Browser, url: string, lag: number): Promise<{ page: Page; wire: Wire }> {
  const page = await (await browser.newContext()).newPage()
  const wire: Wire = { capable: false, table: false }
  await page.routeWebSocket(/^ws:/, (ws) => {
    const server = ws.connectToServer()
    ws.onMessage((message) => {
      if (String(message).includes('"table-capable"')) wire.capable = true
      setTimeout(() => server.send(message), lag)
    })
    server.onMessage((message) => {
      if (String(message).includes('"type":"table-start"')) wire.table = true
      setTimeout(() => ws.send(message), lag)
    })
  })
  await page.addInitScript(() => {
    const latency = { pending: null as number | null, samples: [] as number[] }
    ;(window as unknown as { __latency: typeof latency }).__latency = latency
    const note = (direction: 'out' | 'in', data: unknown): void => {
      if (typeof data !== 'string') return
      if (direction === 'out' && data.includes('"type":"dispatch"')) latency.pending = performance.now()
      else if (direction === 'in' && latency.pending !== null && data.includes('"type":"state"')) {
        latency.samples.push(performance.now() - latency.pending)
        latency.pending = null
      }
    }
    // A move to the server, a frame from it.
    const NativeSocket = window.WebSocket
    window.WebSocket = class extends NativeSocket {
      constructor(url: string | URL, protocols?: string | string[]) {
        super(url, protocols)
        this.addEventListener('message', (event) => note('in', event.data))
      }
      send(data: Parameters<WebSocket['send']>[0]): void {
        note('out', data)
        super.send(data)
      }
    }
    // A move to this page's worker, a frame from it (`local/localSocket.ts`).
    const NativeWorker = window.Worker
    window.Worker = class extends NativeWorker {
      constructor(url: string | URL, options?: WorkerOptions) {
        super(url, options)
        this.addEventListener('message', (event) => {
          const message = event.data as { kind?: string; data?: unknown } | null
          if (message?.kind === 'message') note('in', message.data)
        })
      }
      postMessage(message: unknown, ...rest: unknown[]): void {
        const sent = message as { kind?: string; data?: unknown } | null
        if (sent?.kind === 'send') note('out', sent.data)
        ;(super.postMessage as (...args: unknown[]) => void)(message, ...rest)
      }
    }
  })
  await page.goto(url)
  return { page, wire }
}

const samplesOf = (page: Page): Promise<number[]> =>
  page.evaluate(() => (window as unknown as { __latency: { samples: number[] } }).__latency.samples)

const median = (values: readonly number[]): number => {
  const sorted = [...values].sort((a, b) => a - b)
  return sorted.length === 0 ? Number.NaN : sorted[Math.floor(sorted.length / 2)]
}

/** Two people at one table, no bot: the game starts as a table when both
 * pages can hold a copy (`flags`), on the server otherwise. Each then makes
 * moves of their own, timed, until `MOVES` are in. */
async function measure(browser: Browser, flags: string, lag: number): Promise<{ table: boolean; samples: number[] }> {
  const paced = { timeout: 60_000 }
  const host = await open(browser, `/?${flags}`, lag)
  await host.page.getByRole('button', { name: 'Create a game' }).click()
  await expect(host.page.getByRole('button', { name: 'Ready', exact: true })).toBeVisible(paced)
  const room = await host.page.evaluate(() => new URL(window.location.href).searchParams.get('room'))
  const guest = await open(browser, `/?room=${room}&${flags}`, lag)
  await expect(guest.page.getByRole('button', { name: 'Ready', exact: true })).toBeVisible(paced)
  // On a slow line a click made while the last is still on its way goes
  // nowhere (the seat board waits for the server's answer): each Ready is
  // pressed until it has taken.
  const start = host.page.getByRole('button', { name: 'Start game' })
  for (let tries = 0; tries < 20 && !(await start.isEnabled()); tries += 1) {
    for (const { page } of [host, guest]) {
      await page.getByRole('button', { name: 'Ready', exact: true }).click({ timeout: 700 }).catch(() => {})
    }
    await host.page.waitForTimeout(2 * lag + 400)
  }
  if (flags.includes('tables=1')) await expect.poll(() => host.wire.capable && guest.wire.capable, paced).toBe(true)
  // The word is on its way to the server for `lag` yet.
  await host.page.waitForTimeout(lag + 300)
  await expect(start).toBeEnabled(paced)
  await host.page.getByRole('button', { name: 'Start game' }).click()
  for (const { page } of [host, guest]) {
    await expect(page.getByText('Keep your opening hand?')).toBeVisible(paced)
    await page.getByRole('button', { name: 'Keep', exact: true }).click()
  }
  await expect(host.page.getByText('Keep your opening hand?')).toHaveCount(0, paced)
  await expect(guest.page.getByText('Keep your opening hand?')).toHaveCount(0, paced)
  // The opening hands are everyone's to decide at once and wait for the
  // server in either kind of game: not what is being compared.
  const skip = await Promise.all([host, guest].map(({ page }) => samplesOf(page).then((s) => s.length)))

  const quick = { timeout: 700 }
  const deadline = Date.now() + 150_000
  const taken = async (): Promise<number[]> => {
    const all = await Promise.all([host, guest].map(({ page }) => samplesOf(page)))
    return all.flatMap((samples, i) => samples.slice(skip[i]))
  }
  for (;;) {
    const samples = await taken()
    if (samples.length >= MOVES) break
    if (Date.now() > deadline) throw new Error(`only ${samples.length} moves timed at ${lag} ms`)
    for (const { page } of [host, guest]) {
      if (await page.getByText(/Discard to hand size/).isVisible().catch(() => false)) {
        await page.locator('.hand-card').first().click({ ...quick, force: true }).catch(() => {})
        await page.getByRole('button', { name: 'Discard', exact: true }).click(quick).catch(() => {})
      } else {
        await page.getByRole('button', { name: 'Pass (space)' }).click(quick).catch(() => {})
      }
      // Let the move land everywhere before the next: one move in flight at
      // a time, so each frame timed is its own move's.
      await page.waitForTimeout(2 * lag + 350)
    }
  }
  const samples = (await taken()).slice(0, MOVES)
  const table = host.wire.table
  await host.page.context().close()
  await guest.page.context().close()
  return { table, samples }
}

test('click to frame, on the server and at a table, as the connection slows', async ({ browser }) => {
  test.setTimeout(30 * 60_000)
  const rows: { lag: number; where: string; medianMs: number; worstMs: number; moves: number }[] = []
  for (const lag of LAGS) {
    for (const [where, flags] of [
      ['server', 'local=1'],
      ['table', 'local=1&tables=1'],
    ] as const) {
      const { table, samples } = await measure(browser, flags, lag)
      expect(table).toBe(where === 'table')
      rows.push({
        lag,
        where,
        medianMs: Math.round(median(samples)),
        worstMs: Math.round(Math.max(...samples)),
        moves: samples.length,
      })
      console.log(`lag ${lag} ms each way, ${where}: median ${rows.at(-1)?.medianMs} ms, worst ${rows.at(-1)?.worstMs} ms over ${samples.length} moves`)
    }
  }
  await test.info().attach('table-latency.json', { body: JSON.stringify(rows, null, 2), contentType: 'application/json' })
  // The point of the table: a move's own frame doesn't wait for the server.
  const at = (lag: number, where: string): number => rows.find((r) => r.lag === lag && r.where === where)?.medianMs ?? Number.NaN
  expect(at(300, 'server')).toBeGreaterThanOrEqual(600)
  expect(at(300, 'table')).toBeLessThan(200)
})
