import { expect, test } from '@playwright/test'
import type { APIRequestContext, Locator, Page } from '@playwright/test'

// Choosing who attackers attack, by clicking an opponent's board rather than
// only their panel: an empty part of the board or a creature on it means the
// player, a legal planeswalker or battle means itself, and one these attackers
// can't attack means nothing, never its controller. Dev rooms FOURP (goad makes
// the legal defenders differ, every opponent has a planeswalker) and TWOPW.

const CONTROL = `http://127.0.0.1:${process.env.E2E_CONTROL_PORT ?? 4099}`
// Each attacker by name, with what it's attacking: a player's id or a permanent's name.
const ATTACKING = `const o = game.state.objects; return Object.fromEntries(Object.values(o).filter((a) => a.attacking).map((a) => [a.cardName, o[a.attacking]?.cardName ?? a.attacking]))`

test.describe.configure({ timeout: 90_000 })

async function control<T>(request: APIRequestContext, body: object): Promise<T> {
  const response = await request.post(CONTROL, { data: body })
  expect(response.ok()).toBe(true)
  return (await response.json()) as T
}

const seat = (page: Page, player: string): Locator => page.locator(`.quadrant-cell:has([data-player-id="${player}"])`)
const tile = (page: Page, player: string, name: string): Locator =>
  seat(page, player).locator('.mini-tile-wrap', { hasText: name }).first()
const declared = (page: Page, attackers: number) => page.getByText(`Declare attackers — ${attackers} attacking`)

/** An empty corner of a seat's board, clear of its tiles and its side rail. */
const clickEmptyBoard = async (page: Page, player: string) => {
  const body = seat(page, player).locator('.quadrant-body')
  const box = await body.boundingBox()
  if (box === null) throw new Error(`no board for ${player}`)
  await body.click({ position: { x: box.width * 0.6, y: box.height - 8 } })
}

/** Into the room and on to declaring attackers. */
const toAttackers = async (page: Page, room: string) => {
  await page.setViewportSize({ width: 1366, height: 768 })
  await page.goto(`/?room=${room}`)
  const pass = page.getByRole('button', { name: 'Pass (space)' })
  await expect(pass).toBeEnabled({ timeout: 20_000 })
  await pass.click()
  await expect(page.getByText(/Declare attackers/)).toBeVisible({ timeout: 20_000 })
}

test('FOURP: a board means its player, a planeswalker or battle means itself', async ({ page, request }) => {
  const errors: string[] = []
  page.on('pageerror', (e) => errors.push(e.message))
  await control(request, { op: 'reset', room: 'FOURP' })
  const [kaladesh] = await control<string[]>(request, {
    op: 'spawn',
    room: 'FOURP',
    player: 'bob',
    cards: ['Invasion of Kaladesh'],
  })
  const [zendikar] = await control<string[]>(request, {
    op: 'spawn',
    room: 'FOURP',
    player: 'bob',
    cards: ['Invasion of Zendikar'],
  })
  await control(request, {
    op: 'eval',
    room: 'FOURP',
    js: `game.state.objects[${JSON.stringify(kaladesh)}].protector = "carol"; game.state.objects[${JSON.stringify(zendikar)}].protector = "alice"; return 0`,
  })
  await toAttackers(page, 'FOURP')

  const angel = tile(page, 'alice', 'Serra Angel')
  const dreadmaw = tile(page, 'alice', 'Colossal Dreadmaw')
  const bears = tile(page, 'alice', 'Grizzly Bears')
  const giant = tile(page, 'alice', 'Hill Giant')

  // Nothing waiting: no board is a target, and a click on one does nothing.
  // (Craw Wurm, goaded by Carol and Dave, starts at Bob: its only legal target.)
  await expect(page.locator('.quadrant-cell.attack-target')).toHaveCount(0)
  await clickEmptyBoard(page, 'carol')
  await expect(declared(page, 1)).toBeVisible()

  // An empty part of a board.
  await angel.click()
  await expect(page.locator('.quadrant-cell.attack-target')).toHaveCount(3)
  await expect(seat(page, 'alice')).not.toHaveClass(/attack-target/)
  await page.screenshot({ path: test.info().outputPath('targets.png') })
  await clickEmptyBoard(page, 'carol')
  await expect(angel).toContainText('Carol')
  await expect(declared(page, 2)).toBeVisible()

  // A battle protected by an opponent: itself, not the player whose board it's on.
  await dreadmaw.click()
  await tile(page, 'bob', 'Invasion of Kaladesh').click()
  await expect(dreadmaw).toContainText('Invasion')
  await expect(dreadmaw).not.toContainText('Bob')

  // A planeswalker: the same.
  await bears.click()
  await tile(page, 'bob', 'Garruk').click()
  await expect(bears).toContainText('Garruk')
  await expect(bears).not.toContainText('Bob')
  await expect(declared(page, 4)).toBeVisible()

  // The goaded Giant must attack a player other than Bob: Bob's board isn't a
  // target at all, and Chandra is no click on Carol, whose board it's on.
  await giant.click()
  await expect(seat(page, 'carol')).toHaveClass(/attack-target/)
  await expect(seat(page, 'bob')).not.toHaveClass(/attack-target/)
  await tile(page, 'carol', 'Chandra').click()
  await clickEmptyBoard(page, 'bob')
  await expect(declared(page, 4)).toBeVisible()

  // A creature on a board means its player.
  await tile(page, 'dave', 'Hill Giant').click()
  await expect(giant).toContainText('Dave')

  // The whole declaration goes through, each attacker where it was sent.
  await page.locator('.controls').getByRole('button', { name: 'Attack with 5' }).click()
  await expect(page.getByText(/Declare attackers —/)).toHaveCount(0, { timeout: 20_000 })
  const attacking = await control<Record<string, string>>(request, {
    op: 'eval',
    room: 'FOURP',
    js: ATTACKING,
  })
  expect(attacking).toMatchObject({
    'Serra Angel': 'carol',
    'Colossal Dreadmaw': 'Invasion of Kaladesh',
    'Grizzly Bears': 'Garruk Wildspeaker',
    'Craw Wurm': 'bob',
    'Hill Giant': 'dave',
  })
  expect(errors).toEqual([])
})

test("FOURP: a battle these attackers can't attack is no click on its controller", async ({ page, request }) => {
  await control(request, { op: 'reset', room: 'FOURP' })
  const [battle] = await control<string[]>(request, {
    op: 'spawn',
    room: 'FOURP',
    player: 'bob',
    cards: ['Invasion of Zendikar'],
  })
  await control(request, {
    op: 'eval',
    room: 'FOURP',
    js: `game.state.objects[${JSON.stringify(battle)}].protector = "alice"; return 0`,
  })
  await toAttackers(page, 'FOURP')
  const angel = tile(page, 'alice', 'Serra Angel')
  await angel.click()
  await expect(seat(page, 'bob')).toHaveClass(/attack-target/)
  // Alice protects this battle, so she can't attack it, and the click isn't Bob.
  await tile(page, 'bob', 'Invasion of Zendikar').click()
  await expect(declared(page, 1)).toBeVisible()
  // A hover card is portalled out of the board, but React bubbles its clicks
  // through the board all the same: that's no click on the board.
  await tile(page, 'bob', 'Grizzly Bears').hover()
  const hover = page.locator('.mini-tile-popover').first()
  await expect(hover).toBeVisible()
  await hover.dispatchEvent('click')
  await expect(declared(page, 1)).toBeVisible()
  // Bob's board is still his to be attacked through.
  await clickEmptyBoard(page, 'bob')
  await expect(angel).toContainText('Bob')
})

test('TWOPW: at two players a board and its planeswalker are still two targets', async ({ page, request }) => {
  await control(request, { op: 'reset', room: 'TWOPW' })
  await toAttackers(page, 'TWOPW')
  const angel = tile(page, 'alice', 'Serra Angel')
  const dreadmaw = tile(page, 'alice', 'Colossal Dreadmaw')
  await angel.click()
  await clickEmptyBoard(page, 'bob')
  await expect(angel).toContainText('Bob')
  await dreadmaw.click()
  await tile(page, 'bob', 'Garruk').click()
  await expect(dreadmaw).toContainText('Garruk')
  await expect(dreadmaw).not.toContainText('Bob')
})

test("a long name's word stays whole on the stack and on a hover card", async ({ page, request }) => {
  await control(request, { op: 'reset', room: 'TWOPW' })
  await control(request, {
    op: 'spawn',
    room: 'TWOPW',
    player: 'alice',
    cards: ['Sphinx of Enlightenment', 'Island', 'Island', 'Island', 'Island', 'Island', 'Island'],
  })
  // In hand before the game opens: with nothing to cast, the turn moves on.
  await control(request, { op: 'move', room: 'TWOPW', names: ['Sphinx of Enlightenment'], to: 'hand' })
  await control(request, { op: 'spawn', room: 'TWOPW', player: 'bob', cards: ['Sphinx of Enlightenment'] })
  await page.setViewportSize({ width: 1366, height: 768 })
  await page.goto('/?room=TWOPW')
  await expect(page.getByRole('button', { name: 'Pass (space)' })).toBeEnabled({ timeout: 20_000 })

  const lines = (name: Locator) =>
    name.evaluate((el) => {
      const style = getComputedStyle(el)
      return {
        lines: Math.round(el.getBoundingClientRect().height / parseFloat(style.lineHeight)),
        fits: el.scrollWidth <= el.clientWidth,
      }
    })

  await tile(page, 'bob', 'Sphinx of Enlightenment').hover()
  const hover = page.locator('.mini-tile-popover .ct-name').first()
  await expect(hover).toBeVisible()
  expect((await lines(hover)).fits).toBe(true)
  await page.mouse.move(683, 200)

  const card = page.locator('.hand-cards button', { hasText: 'Sphinx of Enlightenment' })
  await expect(card).toBeVisible()
  await card.hover({ force: true })
  // The tray rises under the pointer: click once it's done moving.
  await page.waitForTimeout(500)
  await card.click({ force: true })
  const name = page.locator('.stack-entry .ct-name').first()
  await expect(name).toBeVisible({ timeout: 15_000 })
  expect(await lines(name)).toEqual({ lines: 2, fits: true })
  await page.screenshot({ path: test.info().outputPath('stack-name.png') })
})
