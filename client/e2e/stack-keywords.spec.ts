import { mkdirSync } from 'node:fs'
import { join } from 'node:path'
import { expect, test } from '@playwright/test'
import type { APIRequestContext, Locator, Page } from '@playwright/test'

// A stack of tokens shows its keywords. The ×N pill and the keyword discs
// both start in a tile's top-left corner, and the pill, drawn later, covered
// the first disc: a stack of Pegasus tokens showed no flying at all (a bug
// report, 2026-11-18). The discs now start under the pill, and wrap into a
// second column before they reach the chip in the corner below.
//
// Room KWSTK is in server/scripts/dev-scenarios.mjs. Set E2E_SHOTS_DIR to
// also save a screenshot at each screen size.

const CONTROL = `http://127.0.0.1:${process.env.E2E_CONTROL_PORT ?? 4099}`
const SHOTS = process.env.E2E_SHOTS_DIR
const SIZES = [
  { width: 1366, height: 768 },
  { width: 1920, height: 1080 },
  { width: 2560, height: 1440 },
] as const

interface Box {
  readonly x: number
  readonly y: number
  readonly width: number
  readonly height: number
}

async function control<T>(request: APIRequestContext, data: Record<string, unknown>): Promise<T> {
  const response = await request.post(CONTROL, { data })
  expect(response.ok()).toBe(true)
  return (await response.json()) as T
}

/** One of alice's permanents of this name on the battlefield, as the engine
 * holds it (tokens of a kind may be several objects the board draws as one
 * tile). */
async function permanent(request: APIRequestContext, room: string, name: string): Promise<string> {
  const objects = await control<readonly { readonly id: string; readonly zone: string }[]>(request, {
    op: 'objects',
    room,
    names: [name],
    player: 'alice',
  })
  const onBoard = objects.filter((o) => o.zone === 'battlefield')
  expect(onBoard.length).toBeGreaterThan(0)
  return onBoard[0].id
}

async function boxOf(locator: Locator): Promise<Box> {
  const box = await locator.boundingBox()
  expect(box).not.toBeNull()
  return box as Box
}

const overlap = (a: Box, b: Box): boolean =>
  a.x < b.x + b.width && b.x < a.x + a.width && a.y < b.y + b.height && b.y < a.y + a.height

/** The board tile holding the object `id` (a tile lists every id it stands for). */
const tileOf = (page: Page, id: string) => page.locator(`[data-obj-ids~="${id}"]`)

/** Every keyword disc of the tile is on its art, clear of the ×N pill and of
 * the summoning-sick chip in the corner below (the tokens are new). */
async function expectDiscsShown(tile: Locator, keywords: readonly string[]): Promise<void> {
  const pill = await boxOf(tile.locator('.card-stack'))
  const chip = await boxOf(tile.locator('.card-flags'))
  const art = await boxOf(tile.locator('.mt-art'))
  for (const keyword of keywords) {
    const disc = await boxOf(tile.locator('.mt-kw').getByRole('img', { name: keyword, exact: true }))
    expect(overlap(disc, pill), `${keyword} is behind the pill`).toBe(false)
    expect(overlap(disc, chip), `${keyword} is behind the summoning-sick chip`).toBe(false)
    expect(disc.y, `${keyword} is above the art`).toBeGreaterThanOrEqual(art.y)
    expect(disc.y + disc.height, `${keyword} is below the art`).toBeLessThanOrEqual(art.y + art.height + 0.5)
    expect(disc.x + disc.width, `${keyword} is off the art's side`).toBeLessThanOrEqual(art.x + art.width + 0.5)
  }
}

test('KWSTK: a stack of tokens shows its keyword discs beside its ×N pill', async ({ page, request }) => {
  const room = 'KWSTK'
  await control(request, { op: 'reset', room })
  const errors: string[] = []
  page.on('pageerror', (error) => errors.push(error.message))
  await page.goto(`/?room=${room}`)
  await expect(page.getByText(`room ${room}`)).toBeVisible()

  const pegasi = tileOf(page, await permanent(request, room, 'Pegasus Token'))
  const vampires = tileOf(page, await permanent(request, room, 'Vampire Token (Hungry for More)'))
  const angel = tileOf(page, await permanent(request, room, 'Serra Angel'))
  await expect(pegasi.locator('.card-stack')).toHaveText('×5')
  await expect(vampires.locator('.card-stack')).toHaveText('×3')

  for (const size of SIZES) {
    await page.setViewportSize(size)
    // Let the layout settle at the new size (card widths are viewport-derived).
    await page.waitForTimeout(400)
    await expectDiscsShown(pegasi, ['flying'])
    await expectDiscsShown(vampires, ['trample', 'lifelink', 'haste'])
    // A tile with no pill keeps its discs in the corner.
    const art = await boxOf(angel.locator('.mt-art'))
    const flying = await boxOf(angel.locator('.mt-kw').getByRole('img', { name: 'flying', exact: true }))
    expect(flying.y - art.y).toBeLessThan(6)
    if (SHOTS !== undefined) {
      mkdirSync(SHOTS, { recursive: true })
      await page.screenshot({ path: join(SHOTS, `${room}-${size.width}x${size.height}.png`) })
    }
  }
  expect(errors).toEqual([])
})
