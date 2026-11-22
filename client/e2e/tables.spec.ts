import { expect, test } from '@playwright/test'
import type { APIRequestContext, Browser, Page } from '@playwright/test'

// A game played on its players' own devices (on wherever solo games are
// played in the browser; `?tables=0` turns it off,
// `docs/plans/replicated-rooms.md`, step 4): two people in two browser
// contexts and a bot, each page's worker holding a copy of the game, the
// server holding only the order of what they do. The lobby is the server's
// as ever; the game starts as a table when every page in it can hold a copy,
// and as a game on the server when one can't.

/** dev-rooms' loopback command port (`E2E_CONTROL_PORT`, playwright.config.ts). */
const CONTROL = `http://127.0.0.1:${process.env.E2E_CONTROL_PORT ?? 4099}`

interface TableStatus {
  readonly id: string
  readonly gameNumber: number
  readonly inputs: number
  readonly connected: number
  readonly watching: number
  readonly host: string | null
}

interface Status {
  readonly rooms: readonly { readonly id: string; readonly stage: string }[]
  readonly tables?: readonly TableStatus[]
}

/** The server's own account of what it holds (`RoomHost.status`). */
async function status(request: APIRequestContext): Promise<Status> {
  const response = await request.post(CONTROL, { data: { op: 'status' } })
  expect(response.ok()).toBe(true)
  return (await response.json()) as Status
}

const tableOf = async (request: APIRequestContext, room: string): Promise<TableStatus | undefined> =>
  (await status(request)).tables?.find((t) => t.id === room)

const roomOf = (page: Page): Promise<string | null> =>
  page.evaluate(() => new URL(window.location.href).searchParams.get('room'))

function pageErrors(page: Page): string[] {
  const errors: string[] = []
  page.on('pageerror', (error) => errors.push(error.message))
  return errors
}

/** What a page's socket to the server carried, by type, each way. */
interface Traffic {
  readonly sent: string[]
  readonly received: string[]
  /** For each `table-start` it was sent: whether it came with the game as
   * another device holds it, and how many inputs came with it to apply. */
  readonly starts: { readonly state: boolean; readonly resync: boolean; readonly inputs: number }[]
}

function watchTraffic(page: Page): Traffic {
  const traffic: Traffic = { sent: [], received: [], starts: [] }
  const typeOf = (payload: string | Buffer): string | null => {
    const match = /"type":"([a-z-]+)"/.exec(String(payload))
    return match === null ? null : match[1]
  }
  page.on('websocket', (ws) => {
    ws.on('framesent', (frame) => {
      const type = typeOf(frame.payload)
      if (type !== null) traffic.sent.push(type)
    })
    ws.on('framereceived', (frame) => {
      const type = typeOf(frame.payload)
      if (type !== null) traffic.received.push(type)
      if (type === 'table-start') {
        const start = JSON.parse(String(frame.payload)) as { state?: string; resync?: boolean; log: unknown[] }
        traffic.starts.push({ state: typeof start.state === 'string', resync: start.resync === true, inputs: start.log.length })
      }
    })
  })
  return traffic
}

const paced = { timeout: 45_000 }
const keepPrompt = (page: Page) => page.getByText('Keep your opening hand?')
const resultPanel = (page: Page) => page.getByRole('dialog', { name: 'Game over' })

/** A page that can hold a copy of a game: one that plays solo games in its
 * browser, which the dev server does only when asked. Tables are on with
 * that by default; `tables=0` is how a page says it won't. */
const CAPABLE = 'local=1'

interface Seated {
  readonly page: Page
  readonly errors: string[]
  readonly traffic: Traffic
}

/** A delay on a page's connection to the server, each way: set `ms` at any
 * time, and messages sent from then on wait that long. */
interface Lag {
  ms: number
  /** While set, the server can't be reached: a connection the page opens is
   * closed at once. */
  down?: boolean
  /** Closes the page's open connections, as a network going away does. */
  drop?: () => void
}

async function open(browser: Browser, url: string, lag?: Lag): Promise<Seated> {
  const page = await (await browser.newContext()).newPage()
  const seated = { page, errors: pageErrors(page), traffic: watchTraffic(page) }
  if (lag !== undefined) {
    // Through the test, so it can be slowed: a routed socket isn't seen by
    // `watchTraffic`, so what it carries is noted here.
    const typeOf = (message: string | Buffer): string | null => /"type":"([a-z-]+)"/.exec(String(message))?.[1] ?? null
    const live = new Set<() => void>()
    lag.drop = () => {
      for (const close of [...live]) close()
      live.clear()
    }
    await page.routeWebSocket(/^ws:/, (ws) => {
      // The dev server's own socket (hot reload) is on the page's port, and
      // is left alone: a drop of it reloads the page.
      const rooms = new URL(ws.url()).port !== new URL(page.url()).port
      if (rooms && lag.down === true) {
        void ws.close()
        return
      }
      const server = ws.connectToServer()
      if (rooms) {
        live.add(() => {
          void ws.close()
          void server.close()
        })
      }
      ws.onMessage((message) => {
        const type = typeOf(message)
        if (type !== null) seated.traffic.sent.push(type)
        setTimeout(() => server.send(message), lag.ms)
      })
      server.onMessage((message) => {
        const type = typeOf(message)
        if (type !== null) seated.traffic.received.push(type)
        if (type === 'table-start') {
          const start = JSON.parse(String(message)) as { state?: string; resync?: boolean; log: unknown[] }
          seated.traffic.starts.push({ state: typeof start.state === 'string', resync: start.resync === true, inputs: start.log.length })
        }
        setTimeout(() => ws.send(message), lag.ms)
      })
    })
  }
  await page.goto(url)
  return seated
}

/**
 * A host's waiting room with a guest seated and a bot in a third seat,
 * everyone ready. Each page's flags are its query string: `CAPABLE` is a
 * page that can hold a copy.
 */
async function lobby(
  browser: Browser,
  hostFlags: string,
  guestFlags: string,
  guestLag?: Lag,
): Promise<{ host: Seated; guest: Seated; room: string }> {
  const host = await open(browser, `/?${hostFlags}`)
  await host.page.getByRole('button', { name: 'Create a game' }).click()
  await expect(host.page.getByRole('button', { name: 'Ready', exact: true })).toBeVisible()
  const room = await roomOf(host.page)
  if (room === null) throw new Error('no room code')
  const guest = await open(browser, `/?room=${room}&${guestFlags}`, guestLag)
  await expect(guest.page.getByRole('button', { name: 'Ready', exact: true })).toBeVisible()
  // A third seat, for a bot.
  await host.page.locator('.seat-board-grid').getByRole('button', { name: /Add player/ }).first().click()
  await expect(host.page.locator('.seat-board-grid .seat-panel')).toHaveCount(3)
  await host.page.getByRole('button', { name: 'Ready', exact: true }).click()
  await guest.page.getByRole('button', { name: 'Ready', exact: true }).click()
  await host.page.getByRole('group', { name: 'Add a bot' }).getByRole('button').first().click()
  await expect(host.page.getByRole('button', { name: 'Start game' })).toBeEnabled()
  return { host, guest, room }
}

/** Waits until every one of `pages` has told the server it can hold a copy:
 * its worker, started by the waiting room, has the card pool in. A start
 * before then is a game on the server. */
async function capable(...pages: readonly Seated[]): Promise<void> {
  await expect.poll(() => pages.every((p) => p.traffic.sent.includes('table-capable')), paced).toBe(true)
}

/** The turn of the game a page shows, from the turn banner's tooltip. */
async function turnOf(page: Page): Promise<number> {
  const title = await page.locator('.turn-banner-round').getAttribute('title')
  const match = /turn (\d+) of the game/.exec(title ?? '')
  return match === null ? 0 : Number(match[1])
}

/** What the top strip says of the turn: whose, and which step. */
const bannerOf = async (page: Page): Promise<string> =>
  (await page.locator('.turn-banner').innerText()).replace(/\s+/g, ' ').trim()

/**
 * One thing a person does to get on with the game, if their page offers it:
 * a discard down to hand size (a turn passed with nothing played ends a card
 * over), else passing the turn. Each click gives up quickly: the board
 * remounts with every frame, and a button found a moment ago may be gone, or
 * not this page's to press.
 */
async function getOn(page: Page): Promise<void> {
  const quick = { timeout: 700 }
  if (await page.getByText(/Discard to hand size/).isVisible().catch(() => false)) {
    await page.locator('.hand-card').first().click({ ...quick, force: true }).catch(() => {})
    await page.getByRole('button', { name: 'Discard', exact: true }).click(quick).catch(() => {})
    return
  }
  await page.getByRole('button', { name: 'Pass turn' }).click(quick).catch(() => {})
}

/**
 * Both people pass their way through turns, each whenever their own page
 * offers it, until the game reaches `turn` on every page given.
 */
async function playTo(turn: number, players: readonly Page[], everyone: readonly Page[] = players): Promise<void> {
  const deadline = Date.now() + 120_000
  for (;;) {
    const turns = await Promise.all(everyone.map(turnOf))
    if (turns.every((t) => t >= turn)) return
    if (Date.now() > deadline) throw new Error(`the game never reached turn ${turn}: the pages show ${turns.join(', ')}`)
    for (const page of players) await getOn(page)
    await players[0].waitForTimeout(250)
  }
}

/** The page is at the board in a seat of its own: its hand is there (a
 * watcher has none), whatever the game is asking of it just now. */
async function seatedAtBoard(page: Page): Promise<void> {
  await expect(page.locator('.turn-banner')).toBeVisible({ timeout: 45_000 })
  await expect(page.locator('.hand-card').first()).toBeVisible({ timeout: 45_000 })
  await expect(page.locator('.ts-spectating')).toHaveCount(0)
}

/** Every page shows the same turn and step, once what is in flight lands. */
async function agree(pages: readonly Page[]): Promise<void> {
  await expect
    .poll(async () => {
      const banners = await Promise.all(pages.map(bannerOf))
      const turns = await Promise.all(pages.map(turnOf))
      return new Set(banners.map((b, i) => `${turns[i]} ${b}`)).size
    }, paced)
    .toBe(1)
}

test('two people and a bot play a table: a copy in each browser, only the order on the server', async ({ browser, request }) => {
  test.setTimeout(300_000)
  const { host, guest, room } = await lobby(browser, CAPABLE, CAPABLE)
  await capable(host, guest)
  await host.page.getByRole('button', { name: 'Start game' }).click()
  await expect(keepPrompt(host.page)).toBeVisible(paced)
  await expect(keepPrompt(guest.page)).toBeVisible(paced)

  // The server holds a table under the room's code, and no game.
  const started = await status(request)
  expect(started.rooms.map((r) => r.id)).not.toContain(room)
  expect(started.tables?.find((t) => t.id === room)).toMatchObject({ gameNumber: 1, connected: 2, watching: 0 })
  // Each page was sent the table once and no frame of a game after it: its
  // frames come from its own worker.
  for (const seated of [host, guest]) {
    expect(seated.traffic.received.filter((type) => type === 'table-start')).toHaveLength(1)
    const afterStart = seated.traffic.received.slice(seated.traffic.received.indexOf('table-start'))
    expect(afterStart).not.toContain('state')
  }

  // Both keep; an opening hand is everyone's to decide at once, so each
  // waits for the server to place it.
  await host.page.getByRole('button', { name: 'Keep', exact: true }).click()
  await guest.page.getByRole('button', { name: 'Keep', exact: true }).click()
  await expect(keepPrompt(host.page)).toHaveCount(0, paced)
  await expect(keepPrompt(guest.page)).toHaveCount(0, paced)
  await expect(host.page.getByRole('button', { name: 'History' })).toBeVisible(paced)

  // They and the bot play three turns; every page shows the same game.
  await playTo(4, [host.page, guest.page])
  await agree([host.page, guest.page])
  const played = await tableOf(request, room)
  expect(played?.inputs).toBeGreaterThan(10)
  expect(host.traffic.sent).toContain('table-input')
  expect(guest.traffic.sent).toContain('table-input')
  // Nothing the pages played went to the server as a room's message.
  for (const seated of [host, guest]) {
    for (const type of ['dispatch', 'pass-turn', 'ack']) expect(seated.traffic.sent).not.toContain(type)
  }

  // Every connection drops, as on a network that went away for a moment:
  // each page finds its way back to its seat at the table, and they play on.
  const dropped = await turnOf(host.page)
  await request.post(CONTROL, { data: { op: 'drop' } })
  await expect.poll(async () => (await tableOf(request, room))?.connected, paced).toBe(2)
  for (const seated of [host, guest]) {
    await expect.poll(() => seated.traffic.sent.filter((type) => type === 'table-join').length, paced).toBe(1)
    await seatedAtBoard(seated.page)
  }
  await playTo(dropped + 2, [host.page, guest.page])
  await agree([host.page, guest.page])
  expect((await status(request)).rooms.map((r) => r.id)).not.toContain(room)

  // Someone comes to watch by the room's code: told the table is full, and
  // watching it is a copy of their own.
  const watcher = await open(browser, `/?room=${room}&${CAPABLE}`)
  await expect(watcher.page.getByText('Room is full.')).toBeVisible(paced)
  await watcher.page.getByRole('button', { name: 'Spectate' }).click()
  await expect(watcher.page.locator('.ts-spectating')).toBeVisible(paced)
  await expect(watcher.page.locator('.hand-card')).toHaveCount(0)
  expect(await tableOf(request, room)).toMatchObject({ connected: 2, watching: 1 })
  await agree([host.page, guest.page, watcher.page])
  await host.page.screenshot({ path: test.info().outputPath('table-host.png') })
  await guest.page.screenshot({ path: test.info().outputPath('table-guest.png') })
  await watcher.page.screenshot({ path: test.info().outputPath('table-watcher.png') })

  // The guest reloads mid-game: back in the same seat, hand and all, from
  // the table's log, and the game goes on.
  const before = await turnOf(guest.page)
  await guest.page.reload()
  await seatedAtBoard(guest.page)
  expect(await turnOf(guest.page)).toBeGreaterThanOrEqual(before)
  await expect.poll(async () => (await tableOf(request, room))?.connected, paced).toBe(2)
  await playTo(before + 2, [host.page, guest.page], [host.page, guest.page, watcher.page])
  await agree([host.page, guest.page, watcher.page])

  // Both people concede; the bot has won, and the host deals a rematch that
  // every device is dealt, the watcher's too.
  for (const seated of [guest, host]) {
    await seated.page.getByRole('button', { name: 'Game', exact: true }).click()
    await seated.page.getByRole('button', { name: 'Concede…' }).click(paced)
    await seated.page.getByRole('button', { name: 'Concede', exact: true }).click()
  }
  await expect(resultPanel(host.page)).toBeVisible(paced)
  await expect(resultPanel(guest.page)).toBeVisible(paced)
  await expect(resultPanel(guest.page).getByRole('button', { name: 'Rematch' })).toHaveCount(0)
  await resultPanel(host.page).getByRole('button', { name: 'Rematch' }).click()
  for (const page of [host.page, guest.page]) {
    await expect(keepPrompt(page)).toBeVisible(paced)
    await expect(resultPanel(page)).toHaveCount(0)
    expect(await roomOf(page)).toBe(room)
  }
  expect(await tableOf(request, room)).toMatchObject({ gameNumber: 2, connected: 2, watching: 1 })
  expect((await status(request)).rooms.map((r) => r.id)).not.toContain(room)

  for (const seated of [host, guest, watcher]) {
    expect(seated.errors).toEqual([])
    await expect(seated.page.locator('.toast.bad')).toHaveCount(0)
    await seated.page.context().close()
  }
})

test("a player's connection drops mid-game: a small mark, the board still theirs to play, the move sent when it is back", async ({ browser, request }) => {
  test.setTimeout(240_000)
  const link: Lag = { ms: 0 }
  const { host, guest, room } = await lobby(browser, CAPABLE, CAPABLE, link)
  await capable(host, guest)
  await host.page.getByRole('button', { name: 'Start game' }).click()
  for (const { page } of [host, guest]) {
    await expect(keepPrompt(page)).toBeVisible(paced)
    await page.getByRole('button', { name: 'Keep', exact: true }).click()
  }
  await expect(keepPrompt(guest.page)).toHaveCount(0, paced)

  // Until the move is the guest's to make: the host passes, the bot plays.
  const guestPass = guest.page.getByRole('button', { name: 'Pass (space)' })
  const deadline = Date.now() + 120_000
  const asked = async (): Promise<boolean> => {
    if (!(await guestPass.isEnabled().catch(() => false))) return false
    await guest.page.waitForTimeout(800)
    return guestPass.isEnabled().catch(() => false)
  }
  while (!(await asked())) {
    if (Date.now() > deadline) throw new Error('the guest was never asked')
    await getOn(host.page)
    if (await guest.page.getByText(/Discard to hand size/).isVisible().catch(() => false)) await getOn(guest.page)
    await host.page.waitForTimeout(250)
  }

  // The guest's connection goes, and stays gone.
  link.down = true
  link.drop?.()
  const mark = guest.page.locator('.connection-mark')
  await expect(mark).toBeVisible(paced)
  await expect(mark).toContainText('Reconnecting')
  await expect(mark).toHaveAttribute('title', /Your moves are kept/)
  // Nothing over the board: it is still there, hand and all, and no seat
  // picker or "lost the connection" box took its place.
  await expect(guest.page.locator('.overlay')).toHaveCount(0)
  await seatedAtBoard(guest.page)
  await guest.page.screenshot({ path: test.info().outputPath('reconnecting-mark.png') })
  const inputs = (await tableOf(request, room))?.inputs ?? 0

  // Their move is made at once on their own board, the server none the wiser.
  await expect(guestPass).toBeEnabled()
  await guestPass.click()
  await expect(guestPass).toBeDisabled({ timeout: 4000 })
  await expect(mark).toBeVisible()

  // Back: the mark goes, by itself, and the game is one game again.
  link.down = false
  await expect(mark).toHaveCount(0, paced)
  await expect.poll(async () => (await tableOf(request, room))?.connected, paced).toBe(2)
  await expect.poll(async () => (await tableOf(request, room))?.inputs ?? 0, paced).toBeGreaterThan(inputs)
  // The copy was kept, not dealt again: the table was asked for from where
  // the copy stood, and what came back was only what it had missed.
  expect(guest.traffic.sent).toContain('table-join')
  expect(guest.traffic.starts.at(-1)).toMatchObject({ state: false, resync: false })
  expect(guest.traffic.starts.at(-1)?.inputs).toBeLessThan((await tableOf(request, room))?.inputs ?? 0)
  await seatedAtBoard(guest.page)
  const turn = await turnOf(host.page)
  await playTo(turn + 2, [host.page, guest.page])
  await agree([host.page, guest.page])
  expect(guest.errors).toEqual([])
  expect(host.errors).toEqual([])
})

test("a connection drops in the waiting room: a small mark, the room still up, and what was changed is sent when it is back", async ({ browser }) => {
  test.setTimeout(120_000)
  const link: Lag = { ms: 0 }
  const host = await open(browser, `/?${CAPABLE}`, link)
  await host.page.getByRole('button', { name: 'Create a game' }).click()
  await expect(host.page.getByRole('button', { name: 'Ready', exact: true })).toBeVisible()
  const seats = host.page.locator('.seat-board-grid .seat-panel')
  const before = await seats.count()

  link.down = true
  link.drop?.()
  const mark = host.page.locator('.connection-mark')
  await expect(mark).toBeVisible(paced)
  await expect(mark).toHaveAttribute('title', /What you change is sent/)
  // The waiting room is still there, with nothing over it.
  await expect(host.page.getByRole('alertdialog')).toHaveCount(0)
  await expect(seats).toHaveCount(before)
  await host.page.screenshot({ path: test.info().outputPath('reconnecting-lobby.png') })
  // A seat asked for with the connection down.
  await host.page.locator('.seat-board-grid').getByRole('button', { name: /Add player/ }).first().click()
  await host.page.waitForTimeout(1500)
  await expect(seats).toHaveCount(before)

  link.down = false
  await expect(mark).toHaveCount(0, paced)
  await expect(seats).toHaveCount(before + 1, paced)
  await expect(host.page.getByRole('button', { name: 'Ready', exact: true })).toBeVisible()
  expect(host.errors).toEqual([])
})

test("a move made as someone concedes is taken back on the mover's page, which says why", async ({ browser, request }) => {
  test.setTimeout(240_000)
  // The guest's connection can be slowed, so a move of theirs is still on
  // its way when the host's concession reaches the server.
  const lag: Lag = { ms: 0 }
  const { host, guest, room } = await lobby(browser, CAPABLE, CAPABLE, lag)
  await capable(host, guest)
  await host.page.getByRole('button', { name: 'Start game' }).click()
  for (const { page } of [host, guest]) {
    await expect(keepPrompt(page)).toBeVisible(paced)
    await page.getByRole('button', { name: 'Keep', exact: true }).click()
  }
  await expect(keepPrompt(guest.page)).toHaveCount(0, paced)

  // Until the move is the guest's to make: the host passes, the bot plays.
  const guestPass = guest.page.getByRole('button', { name: 'Pass (space)' })
  const deadline = Date.now() + 120_000
  // Asked, and still asked a moment later: the button is lit for an instant
  // on a window the room then passes for them, as its frames play.
  const asked = async (): Promise<boolean> => {
    if (!(await guestPass.isEnabled().catch(() => false))) return false
    await guest.page.waitForTimeout(800)
    return guestPass.isEnabled().catch(() => false)
  }
  while (!(await asked())) {
    if (Date.now() > deadline) throw new Error('the guest was never asked')
    await getOn(host.page)
    // A guest dealt nothing to play is passed for all the way to their own
    // cleanup, where the one thing asked of them is a discard: made here, or
    // the game waits on it for good.
    if (await guest.page.getByText(/Discard to hand size/).isVisible().catch(() => false)) await getOn(guest.page)
    await host.page.waitForTimeout(250)
  }
  // The host's menu is opened first, so the concession is two quick clicks.
  await host.page.getByRole('button', { name: 'Game', exact: true }).click()
  await host.page.getByRole('button', { name: 'Concede…' }).click(paced)
  const inputs = (await tableOf(request, room))?.inputs ?? 0

  lag.ms = 6000
  await guestPass.click()
  // Made at once on the guest's own board, with nothing back from the server.
  await expect(guestPass).toBeDisabled({ timeout: 4000 })
  expect((await tableOf(request, room))?.inputs).toBe(inputs)
  await host.page.getByRole('button', { name: 'Concede', exact: true }).click()

  // The concession lands first; the guest's move was made for its place.
  await expect(guest.page.locator('.toast.info').filter({ hasText: 'conceded just as you moved' })).toBeVisible(paced)
  // The toast names the player, not the seat's id.
  await expect(guest.page.locator('.toast.info').filter({ hasText: /Player 1 conceded just as you moved/ })).toBeVisible()
  await expect(guest.page.locator('.toast.bad')).toHaveCount(0)
  await guest.page.screenshot({ path: test.info().outputPath('undo-notice.png') })
  lag.ms = 0

  // The game goes on between the guest and the bot, the same on every page.
  await agree([host.page, guest.page])
  const turn = await turnOf(guest.page)
  await playTo(turn + 1, [guest.page], [host.page, guest.page])
  await agree([host.page, guest.page])
  for (const seated of [host, guest]) {
    expect(seated.errors).toEqual([])
    await seated.page.context().close()
  }
})

test("the host's tab closes mid-game: the bots, and the game, carry on from the other player's device", async ({ browser, request }) => {
  test.setTimeout(300_000)
  const { host, guest, room } = await lobby(browser, CAPABLE, CAPABLE)
  await capable(host, guest)
  await host.page.getByRole('button', { name: 'Start game' }).click()
  for (const { page } of [host, guest]) {
    await expect(keepPrompt(page)).toBeVisible(paced)
    await page.getByRole('button', { name: 'Keep', exact: true }).click()
  }
  await playTo(2, [host.page, guest.page])
  // The creator's device runs the bots, and only its page has their controls.
  const pause = (page: Page) => page.getByRole('button', { name: 'Pause the bots' })
  expect(await tableOf(request, room)).toMatchObject({ host: 'alice', connected: 2 })
  await expect(pause(host.page)).toBeVisible()
  await expect(pause(guest.page)).toHaveCount(0)

  // The host reloads: back before the server gives the bots to anyone else,
  // and they are still hers.
  await host.page.reload()
  await seatedAtBoard(host.page)
  await expect(pause(host.page)).toBeVisible(paced)
  expect(await tableOf(request, room)).toMatchObject({ host: 'alice', connected: 2 })
  await expect(pause(guest.page)).toHaveCount(0)
  const reloaded = await turnOf(guest.page)
  await playTo(reloaded + 1, [host.page, guest.page])
  await agree([host.page, guest.page])

  // Then her tab closes, on a turn that isn't hers: all she has left in it
  // is passing, which nobody is there to do.
  const deadline = Date.now() + 120_000
  while (/player 1/i.test(await bannerOf(guest.page))) {
    if (Date.now() > deadline) throw new Error("the turn never left the host's")
    await getOn(host.page)
    await getOn(guest.page)
    await guest.page.waitForTimeout(250)
  }
  const closed = await turnOf(guest.page)
  const inputs = (await tableOf(request, room))?.inputs ?? 0
  await host.page.context().close()

  // The server waits a few seconds for her, then the bots are the guest's
  // device's: its page is told it hosts, and shows her as gone.
  await expect.poll(async () => (await tableOf(request, room))?.connected, paced).toBe(1)
  await expect.poll(async () => (await tableOf(request, room))?.host, paced).toBe('bob')
  await expect(pause(guest.page)).toBeVisible(paced)
  await expect(guest.page.locator('.pp-online-dot.offline')).toHaveCount(1)

  // The game goes on: the turn ends and the next begins, which takes the
  // bot's moves and the passes of the player who left, all made on the
  // guest's device now.
  await playTo(closed + 1, [guest.page])
  expect((await tableOf(request, room))?.inputs).toBeGreaterThan(inputs)
  await guest.page.screenshot({ path: test.info().outputPath('host-gone.png') })
  expect(guest.traffic.sent).toContain('table-input')
  expect((await status(request)).rooms.map((r) => r.id)).not.toContain(room)
  await expect(guest.page.locator('.toast.bad')).toHaveCount(0)
  expect(guest.errors).toEqual([])
  expect(host.errors).toEqual([])
  await guest.page.context().close()
})

/** Every player's life total as a page shows it, lowest first (each page
 * draws the table from its own seat, so the order on screen differs). */
const lifeOf = async (page: Page): Promise<number[]> =>
  (await page.locator('.pp-life').allInnerTexts()).map(Number).sort((a, b) => a - b)

/** How much higher each life total is on `page` than on `other`: one number
 * if they differ by the same amount all round, `null` if not. */
async function lifeAhead(page: Page, other: Page): Promise<number | null> {
  const [mine, theirs] = await Promise.all([lifeOf(page), lifeOf(other)])
  const gaps = new Set(mine.map((life, i) => life - theirs[i]))
  return mine.length === theirs.length && gaps.size === 1 ? [...gaps][0] : null
}

test('the copies check each other: one that drifts is put back on the host\u2019s, and a page coming back starts from the host\u2019s game', async ({
  browser,
  request,
}) => {
  test.setTimeout(300_000)
  const { host, guest, room } = await lobby(browser, CAPABLE, CAPABLE)
  await capable(host, guest)
  await host.page.getByRole('button', { name: 'Start game' }).click()
  for (const { page } of [host, guest]) {
    await expect(keepPrompt(page)).toBeVisible(paced)
    await page.getByRole('button', { name: 'Keep', exact: true }).click()
  }
  await playTo(3, [host.page, guest.page])
  // Dealt once each, from the recipe: nobody had the game yet.
  expect(guest.traffic.starts).toEqual([{ state: false, resync: false, inputs: 0 }])
  const inputs = (await tableOf(request, room))?.inputs ?? 0
  expect(inputs).toBeGreaterThan(20)

  // The guest reloads, as a page on another build of the site (one loaded
  // after a deploy): it is dealt the game as the host's device holds it and
  // the few inputs since, not the log to play through again.
  await guest.page.goto(`/?room=${room}&build=after-a-deploy`)
  await seatedAtBoard(guest.page)
  expect(guest.traffic.starts).toHaveLength(2)
  expect(guest.traffic.starts[1]).toMatchObject({ state: true, resync: false })
  expect(guest.traffic.starts[1].inputs).toBeLessThan(inputs)
  await expect.poll(async () => (await tableOf(request, room))?.connected, paced).toBe(2)
  const turn = await turnOf(guest.page)
  await playTo(turn + 1, [host.page, guest.page])
  await agree([host.page, guest.page])
  await expect.poll(() => lifeAhead(guest.page, host.page), paced).toBe(0)

  // The guest's copy comes to hold another game (a test's hook: every life
  // total a point up), as a browser that worked something out differently
  // would. Its own page shows it; the host's doesn't.
  await guest.page.evaluate((code) => {
    ;(window as unknown as { deckblitzLocal: { corrupt: (roomId: string) => void } }).deckblitzLocal.corrupt(code)
  }, room)
  await expect.poll(() => lifeAhead(guest.page, host.page), paced).toBe(1)

  // They play on. At the next place the copies compare, the server finds the
  // guest's isn't the host's and deals it the host's: the page says so, and
  // shows the table's game again.
  const drifted = guest.page.locator('.toast.info').filter({ hasText: 'had drifted from the table' })
  const deadline = Date.now() + 150_000
  while (!(await drifted.isVisible().catch(() => false))) {
    if (Date.now() > deadline) throw new Error('the drifted copy was never put right')
    await getOn(host.page)
    await getOn(guest.page)
    await guest.page.waitForTimeout(250)
  }
  await expect.poll(() => lifeAhead(guest.page, host.page), paced).toBe(0)
  await guest.page.screenshot({ path: test.info().outputPath('drift-notice.png') })
  expect(guest.traffic.starts.at(-1)).toMatchObject({ state: true, resync: true })
  expect(guest.traffic.sent).toContain('table-digest')
  expect(host.traffic.sent).toContain('table-digest')
  expect(host.traffic.sent).toContain('table-state')
  // The host was never dealt again: its game is the table's.
  expect(host.traffic.starts).toHaveLength(1)
  const after = await turnOf(guest.page)
  await playTo(after + 1, [host.page, guest.page])
  await agree([host.page, guest.page])
  for (const seated of [host, guest]) {
    await expect(seated.page.locator('.toast.bad')).toHaveCount(0)
    expect(seated.errors).toEqual([])
    await seated.page.context().close()
  }
})

test('a start pressed before a page has the card pool in waits for it, and is still a table', async ({ browser, request }) => {
  test.setTimeout(180_000)
  // No waiting for the pages to say they can hold a copy: the host starts as
  // soon as everyone is ready, as a quick host would. Each page has said it
  // will be able to shortly, so the server holds the start for them.
  const { host, guest, room } = await lobby(browser, CAPABLE, CAPABLE)
  await host.page.getByRole('button', { name: 'Start game' }).click()
  for (const { page } of [host, guest]) await expect(keepPrompt(page)).toBeVisible(paced)
  const started = await status(request)
  expect(started.tables?.map((t) => t.id)).toContain(room)
  expect(started.rooms.map((r) => r.id)).not.toContain(room)
  for (const seated of [host, guest]) {
    expect(seated.traffic.sent).toContain('table-capable')
    expect(seated.errors).toEqual([])
    await seated.page.context().close()
  }
})

test('two builds of the page in one lobby: the game starts on the server', async ({ browser, request }) => {
  test.setTimeout(120_000)
  // Both can hold a copy, but not of the same engine: copies of one game
  // must run one build.
  const { host, guest, room } = await lobby(browser, CAPABLE, `${CAPABLE}&build=another`)
  await capable(host, guest)
  await host.page.getByRole('button', { name: 'Start game' }).click()
  for (const { page } of [host, guest]) await expect(keepPrompt(page)).toBeVisible(paced)
  const started = await status(request)
  expect(started.rooms.find((r) => r.id === room)).toMatchObject({ stage: 'playing' })
  expect(started.tables?.map((t) => t.id) ?? []).not.toContain(room)
  for (const seated of [host, guest]) {
    expect(seated.errors).toEqual([])
    await seated.page.context().close()
  }
})

test('one page that cannot hold a copy, and the same lobby starts as a game on the server', async ({ browser, request }) => {
  test.setTimeout(120_000)
  // The guest's page plays solo games in its browser but not tables.
  const { host, guest, room } = await lobby(browser, CAPABLE, 'local=1&tables=0')
  await capable(host)
  await host.page.getByRole('button', { name: 'Start game' }).click()
  for (const page of [host.page, guest.page]) {
    await expect(keepPrompt(page)).toBeVisible(paced)
    await page.getByRole('button', { name: 'Keep', exact: true }).click()
  }
  const started = await status(request)
  expect(started.rooms.find((r) => r.id === room)).toMatchObject({ stage: 'playing' })
  expect(started.tables?.map((t) => t.id) ?? []).not.toContain(room)
  // The game is the server's: frames come down the socket, moves go up it.
  expect(guest.traffic.sent).not.toContain('table-capable')
  expect(host.traffic.received).toContain('state')
  expect(host.traffic.received).not.toContain('table-start')
  await playTo(2, [host.page, guest.page])
  const played = [...host.traffic.sent, ...guest.traffic.sent]
  expect(played.some((type) => type === 'pass-turn' || type === 'dispatch')).toBe(true)
  expect(played).not.toContain('table-input')
  for (const seated of [host, guest]) {
    expect(seated.errors).toEqual([])
    await seated.page.context().close()
  }
})
