import { expect, test } from '@playwright/test'
import type { Page } from '@playwright/test'

// Blitzing from the landing page: the list on the clipboard (or pasted, when
// the clipboard can't be read), through the import, into a started game
// against three bots, with no seat board in between.
//
// The import itself is stubbed: dev-rooms serves no `/import-deck`, and the
// real one asks Scryfall about every card the engine lacks. What this
// covers is everything after the import answers — the room, the seats, the
// start and the report — against the real room server.

const LIST = ['Commander', '1 Ghalta, Primal Hunger', '', 'Deck', '1 Tooth and Nail', '1 Grizzly Bears', '30 Forest'].join(
  '\n',
)

/** The import endpoint's answer to LIST: Tooth and Nail stood in for. */
async function stubImport(page: Page): Promise<void> {
  const card = (name: string, count = 1, extra: Record<string, unknown> = {}) => ({
    name,
    count,
    implemented: true,
    found: true,
    manaCost: null,
    typeLine: '',
    suggestedReplacement: null,
    replacements: [],
    printingId: null,
    ...extra,
  })
  const lines = [
    { type: 'progress', done: 4, total: 4, name: 'Forest' },
    {
      type: 'result',
      cards: [
        card('Ghalta, Primal Hunger'),
        card('Tooth and Nail', 1, { implemented: false, suggestedReplacement: 'Natural Order' }),
        card('Grizzly Bears'),
        card('Forest', 30),
      ],
      format: { legal: false, violations: [], identity: 'G', commanders: ['Ghalta, Primal Hunger'] },
    },
  ]
  await page.route('**/import-deck', (route) =>
    route.fulfill({
      status: 200,
      contentType: 'application/x-ndjson',
      body: lines.map((l) => JSON.stringify(l)).join('\n') + '\n',
      headers: { 'Access-Control-Allow-Origin': '*' },
    }),
  )
}

async function expectBlitzStarted(page: Page, dismiss: 'click' | 'wait'): Promise<void> {
  // Straight into the game, with no seat board on the way: four players at
  // the table (the bots are named for their decks' commanders).
  await expect(page.getByRole('button', { name: 'History' })).toBeVisible({ timeout: 20_000 })
  await expect(page.locator('.seat-board')).toHaveCount(0)
  expect(await page.evaluate(() => new URL(window.location.href).searchParams.get('room'))).toMatch(/^[A-Z0-9]{5}$/)
  // What the import changed, over the board as the game opens: gone on a
  // click, or by itself after 12 seconds (a bug report: it used to stay).
  const report = page.locator('.blitz-report')
  await expect(report).toContainText('Imported: Ghalta, Primal Hunger: 1 stand-in')
  await expect(report).toContainText('Tooth and Nail → Natural Order')
  if (dismiss === 'click') {
    await report.click()
    await expect(report).toHaveCount(0)
  } else {
    await expect(report).toBeVisible()
    await expect(report).toHaveCount(0, { timeout: 15_000 })
  }
}

test('blitzing the clipboard starts a game against three bots', async ({ page, context }) => {
  await context.grantPermissions(['clipboard-read', 'clipboard-write'])
  await stubImport(page)
  const errors: string[] = []
  page.on('pageerror', (error) => errors.push(error.message))

  await page.goto('/')
  await page.evaluate((text) => navigator.clipboard.writeText(text), LIST)
  await page.getByRole('button', { name: 'Blitz against Bracket 3' }).click()

  await expectBlitzStarted(page, 'click')
  // Blitzing saves nothing: the result screen offers to keep the deck.
  const saved = await page.evaluate(() => window.localStorage.getItem('mtg-engine:decks'))
  expect(saved ?? '').not.toContain('Imported: Ghalta, Primal Hunger')
  expect(errors).toEqual([])
})

test('with no list on the clipboard, a box to paste it into', async ({ page, context }) => {
  await context.grantPermissions(['clipboard-read', 'clipboard-write'])
  await stubImport(page)

  await page.goto('/')
  await page.evaluate(() => navigator.clipboard.writeText('not a decklist'))
  await page.getByRole('button', { name: 'Blitz against Bracket 3' }).click()

  await expect(page.getByText("Your clipboard doesn't hold a decklist")).toBeVisible()
  await page.locator('#landing-blitz-list').fill(LIST)
  await page.getByRole('button', { name: 'Blitz against Bracket 3', exact: true }).click()

  await expectBlitzStarted(page, 'wait')
})

// A list that doesn't say which card is its commander (an alphabetical
// export) used to have it guessed. The import now lists the cards that could
// be, the page asks, and the list is imported again with the answer.
test('a list with no commander named asks which card it is', async ({ page, context }) => {
  await context.grantPermissions(['clipboard-read', 'clipboard-write'])
  const card = (name: string, count = 1) => ({
    name,
    count,
    implemented: true,
    found: true,
    manaCost: null,
    typeLine: '',
    suggestedReplacement: null,
    replacements: [],
    printingId: null,
  })
  const cards = [card('Ghalta, Primal Hunger'), card('Goreclaw, Terror of Qal Sisma'), card('Grizzly Bears'), card('Forest', 30)]
  const candidate = (name: string, manaCost: string) => ({
    name,
    implemented: true,
    manaCost,
    typeLine: 'legendary creature — Elder Dinosaur',
    pairsWith: [],
  })
  const asked: (readonly string[] | null)[] = []
  await page.route('**/import-deck', (route) => {
    const body = route.request().postDataJSON() as { commanders?: string[] }
    asked.push(body.commanders ?? null)
    const format =
      body.commanders === undefined
        ? {
            legal: false,
            violations: [],
            identity: 'G',
            commanders: ['Ghalta, Primal Hunger'],
            commanderCandidates: [
              candidate('Ghalta, Primal Hunger', '{10}{G}{G}'),
              candidate('Goreclaw, Terror of Qal Sisma', '{3}{G}'),
            ],
          }
        : { legal: false, violations: [], identity: 'G', commanders: body.commanders }
    return route.fulfill({
      status: 200,
      contentType: 'application/x-ndjson',
      body: JSON.stringify({ type: 'result', cards, format }) + '\n',
      headers: { 'Access-Control-Allow-Origin': '*' },
    })
  })

  await page.goto('/')
  await page.evaluate(() => navigator.clipboard.writeText('1 Ghalta, Primal Hunger\n1 Goreclaw, Terror of Qal Sisma\n1 Grizzly Bears\n30 Forest'))
  await page.getByRole('button', { name: 'Blitz against Bracket 3' }).click()

  const picker = page.getByRole('dialog', { name: 'Choose the commander' })
  await expect(picker.getByRole('button', { name: /Ghalta, Primal Hunger/ })).toBeVisible()
  // Nothing has started: the question comes first.
  await expect(page.getByRole('button', { name: 'History' })).toHaveCount(0)
  await picker.getByRole('button', { name: /Goreclaw, Terror of Qal Sisma/ }).click()

  // The second import carries the answer, and the game opens with it.
  await expect(page.getByRole('button', { name: 'History' })).toBeVisible({ timeout: 20_000 })
  expect(asked).toEqual([null, ['Goreclaw, Terror of Qal Sisma']])
  await expect(page.locator('.blitz-report')).toContainText('Imported: Goreclaw, Terror of Qal Sisma')
})

// A commander that can share the command zone with another card of the list
// (Partner, a Background) asks a second question: with which, or alone.
test('a commander with a partner in the list can be picked as a pair, or alone', async ({ page, context }) => {
  await context.grantPermissions(['clipboard-read', 'clipboard-write'])
  const card = (name: string, count = 1) => ({
    name,
    count,
    implemented: true,
    found: true,
    manaCost: null,
    typeLine: '',
    suggestedReplacement: null,
    replacements: [],
    printingId: null,
  })
  const cards = [
    card('Krenko, Mob Boss'),
    card('Thrasios, Triton Hero'),
    card('Tymna the Weaver'),
    card('Sol Ring'),
    card('Forest', 10),
    card('Island', 10),
    card('Plains', 10),
    card('Swamp', 10),
  ]
  const candidate = (name: string, manaCost: string, pairsWith: readonly string[]) => ({
    name,
    implemented: true,
    manaCost,
    typeLine: 'legendary creature — Human',
    pairsWith,
  })
  const asked: (readonly string[] | null)[] = []
  await page.route('**/import-deck', (route) => {
    const body = route.request().postDataJSON() as { commanders?: string[] }
    asked.push(body.commanders ?? null)
    const format =
      body.commanders === undefined
        ? {
            legal: false,
            violations: [],
            identity: 'R',
            commanders: ['Krenko, Mob Boss'],
            commanderCandidates: [
              candidate('Krenko, Mob Boss', '{2}{R}{R}', []),
              candidate('Thrasios, Triton Hero', '{G}{U}', ['Tymna the Weaver']),
              candidate('Tymna the Weaver', '{1}{W}{B}', ['Thrasios, Triton Hero']),
            ],
          }
        : { legal: false, violations: [], identity: 'WUBG', commanders: body.commanders }
    return route.fulfill({
      status: 200,
      contentType: 'application/x-ndjson',
      body: JSON.stringify({ type: 'result', cards, format }) + '\n',
      headers: { 'Access-Control-Allow-Origin': '*' },
    })
  })

  await page.goto('/')
  await page.evaluate(() => navigator.clipboard.writeText('1 Krenko, Mob Boss\n1 Thrasios, Triton Hero\n1 Tymna the Weaver\n1 Sol Ring\n40 Forest'))
  await page.getByRole('button', { name: 'Blitz against Bracket 3' }).click()

  const picker = page.getByRole('dialog', { name: 'Choose the commander' })
  // Only the two that can pair say so.
  await expect(picker.getByRole('button', { name: /Thrasios, Triton Hero/ })).toContainText('Can have a partner from this list.')
  await expect(picker.getByRole('button', { name: /Krenko, Mob Boss/ })).not.toContainText('partner')
  await picker.getByRole('button', { name: /Thrasios, Triton Hero/ }).click()
  // The second question: its partner, or nobody. Back returns to the first.
  await expect(picker.getByRole('heading')).toHaveText('Thrasios, Triton Hero: with a partner?')
  await expect(picker.getByRole('button', { name: /Tymna the Weaver/ })).toBeVisible()
  await expect(picker.getByRole('button', { name: /No partner/ })).toBeVisible()
  await expect(picker.getByRole('button', { name: /Krenko, Mob Boss/ })).toHaveCount(0)
  await picker.getByRole('button', { name: 'Back' }).click()
  await expect(picker.getByRole('button', { name: /Krenko, Mob Boss/ })).toBeVisible()
  await picker.getByRole('button', { name: /Thrasios, Triton Hero/ }).click()
  await picker.getByRole('button', { name: /Tymna the Weaver/ }).click()

  // Both names go back with the list, and both lead the deck.
  await expect(page.getByRole('button', { name: 'History' })).toBeVisible({ timeout: 20_000 })
  expect(asked).toEqual([null, ['Thrasios, Triton Hero', 'Tymna the Weaver']])
  await expect(page.locator('.blitz-report')).toContainText('Imported: Thrasios, Triton Hero & Tymna the Weaver')
  const commanders = page.locator('.quadrant-cell.self .commander-tile-wrap')
  await expect(commanders).toHaveCount(2)
})

// The deck builder's Blitz button: a deck from the list, straight into a game
// against three bots, the same blitz the landing page starts (`blitzUrl`).
test("a deck builder deck's Blitz button starts a game against three bots", async ({ page }) => {
  const errors: string[] = []
  page.on('pageerror', (error) => errors.push(error.message))
  await page.goto('/deck-builder')
  await page.getByRole('button', { name: 'Blitz First Flight', exact: true }).click({ timeout: 60_000 })
  await expect(page.getByRole('button', { name: 'History' })).toBeVisible({ timeout: 30_000 })
  await expect(page.locator('.seat-board')).toHaveCount(0)
  // The hand-off is taken off the URL, so a reload doesn't blitz again.
  expect(await page.evaluate(() => new URL(window.location.href).searchParams.has('blitz'))).toBe(false)
  // A saved deck plays as it is: nothing imported, so nothing to report.
  await expect(page.locator('.blitz-report')).toHaveCount(0)
  expect(errors).toEqual([])
})

test("a deck that can't be blitzed says why, and stays in the deck builder", async ({ page }) => {
  const decks = [
    { id: 'nocmdr', name: 'Half-built deck', commanders: [], cards: ['Sol Ring'] },
    { id: 'gone', name: 'Old deck', commanders: ['Ghalta, Primal Hunger'], cards: ['Not A Real Card Name', 'Forest'] },
  ]
  await page.addInitScript((value) => window.localStorage.setItem('mtg-engine:decks', value), JSON.stringify(decks))
  await page.goto('/deck-builder')
  await page.getByRole('button', { name: 'Blitz Half-built deck' }).click({ timeout: 60_000 })
  await expect(page.getByRole('alert')).toHaveText(/This deck has no commander yet/)
  await page.getByRole('button', { name: 'Blitz Old deck' }).click()
  await expect(page.getByRole('alert')).toHaveText(/A card this engine no longer has \(Not A Real Card Name\)/)
  expect(new URL(page.url()).pathname).toBe('/deck-builder')
})

// A room's deck picker imports a pasted list itself (its Import list tab), so
// a player needn't visit the deck builder first; the deck is saved, as one
// imported there is.
test("the lobby's deck picker imports a pasted list, saves it and brings it to the seat", async ({ page }) => {
  await stubImport(page)
  await page.goto('/')
  await page.getByRole('button', { name: 'Create a game' }).click()
  await page.getByText('Pick a deck').first().click()
  const picker = page.locator('.deck-picker-box')
  await picker.getByRole('tab', { name: 'Import list' }).click()
  await picker.locator('#deck-picker-import-list').fill(LIST)
  await picker.getByRole('button', { name: 'Import', exact: true }).click()
  // The import swapped a card, so it says what before the deck is brought.
  await expect(picker).toContainText('Tooth and Nail → Natural Order')
  await picker.getByRole('button', { name: 'Bring this deck' }).click()
  await expect(picker).toHaveCount(0)
  await expect(page.locator('.seat-board')).toContainText('Imported: Ghalta, Primal Hunger')
  const saved = await page.evaluate(() => window.localStorage.getItem('mtg-engine:decks'))
  expect(saved ?? '').toContain('Imported: Ghalta, Primal Hunger')
  expect(saved ?? '').toContain('Natural Order')
})

// Each bracket's button deals the bots that bracket's decks: Bracket 4's are
// the averages, named "<commander> (Average)", and the decks a player gave,
// named "<commander> by <creator>". Read off the
// `add-bot` messages, so on the room server (`?local=0`), not in the page.
test("a bracket's blitz button deals the bots that bracket's decks", async ({ page, context }) => {
  await context.grantPermissions(['clipboard-read', 'clipboard-write'])
  await stubImport(page)
  const bots: string[] = []
  page.on('websocket', (ws) => {
    if (ws.url().includes('?token=')) return // Vite's hot reload
    ws.on('framesent', (frame) => {
      const message = JSON.parse(String(frame.payload)) as { type?: string; deck?: { name?: string } }
      if (message.type === 'add-bot') bots.push(message.deck?.name ?? '')
    })
  })
  await page.goto('/?local=0')
  await page.evaluate((text) => navigator.clipboard.writeText(text), LIST)
  await page.getByRole('button', { name: 'Blitz against Bracket 4' }).click()
  await expect(page.getByRole('button', { name: 'History' })).toBeVisible({ timeout: 20_000 })
  expect(bots).toHaveLength(3)
  for (const name of bots) expect(name).toMatch(/ by | \(Average\)$/)
})
