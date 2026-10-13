import { mkdirSync } from 'node:fs'
import { join } from 'node:path'
import { expect, test } from '@playwright/test'
import type { APIRequestContext, Page } from '@playwright/test'

// A land played beside identical lands joins their tile at once. Every
// permanent enters "summoning sick" until its controller's next turn, which
// only a creature minds (rule 302.6), and the board used to keep a Forest
// played this turn on a tile of its own until then (the user, 2026-10-12).
//
// Rooms LANDS and LAND4 are in server/scripts/dev-scenarios.mjs. Set
// E2E_SHOTS_DIR to also save screenshots at three screen sizes.

const CONTROL = `http://127.0.0.1:${process.env.E2E_CONTROL_PORT ?? 4099}`
const SHOTS = process.env.E2E_SHOTS_DIR
const SIZES = [
  { width: 1366, height: 768 },
  { width: 1920, height: 1080 },
  { width: 2560, height: 1440 },
] as const

async function control<T>(request: APIRequestContext, data: Record<string, unknown>): Promise<T> {
  const response = await request.post(CONTROL, { data })
  expect(response.ok()).toBe(true)
  return (await response.json()) as T
}

/** alice's Forests, by zone, as the engine holds them. */
async function forests(request: APIRequestContext, room: string): Promise<{ hand: string[]; battlefield: string[] }> {
  const objects = await control<readonly { readonly id: string; readonly zone: string }[]>(request, {
    op: 'objects',
    room,
    names: ['Forest'],
    player: 'alice',
  })
  return {
    hand: objects.filter((o) => o.zone === 'hand').map((o) => o.id),
    battlefield: objects.filter((o) => o.zone === 'battlefield').map((o) => o.id),
  }
}

async function screenshots(page: Page, name: string): Promise<void> {
  if (SHOTS === undefined) return
  mkdirSync(SHOTS, { recursive: true })
  for (const size of SIZES) {
    await page.setViewportSize(size)
    // Let the layout settle at the new size (card widths are viewport-derived).
    await page.waitForTimeout(400)
    await page.screenshot({ path: join(SHOTS, `${name}-${size.width}x${size.height}.png`) })
  }
  await page.setViewportSize(SIZES[0])
}

/** The board tile holding the object `id` (a tile lists every id it stands for). */
const tileOf = (page: Page, id: string) => page.locator(`[data-obj-ids~="${id}"]`)

for (const room of ['LANDS', 'LAND4']) {
  test(`${room}: a Forest played beside two Forests joins their tile at once`, async ({ page, request }) => {
    await control(request, { op: 'reset', room })
    const errors: string[] = []
    page.on('pageerror', (error) => errors.push(error.message))
    await page.goto(`/?room=${room}`)
    await page.getByRole('button', { name: 'Ready', exact: true }).click()
    await expect(page.getByText(`room ${room}`)).toBeVisible()

    const before = await forests(request, room)
    expect(before.battlefield).toHaveLength(2)
    expect(before.hand).toHaveLength(1)
    await expect(tileOf(page, before.battlefield[0]).locator('.card-stack')).toHaveText('×2')
    await screenshots(page, `${room}-before`)

    const played = before.hand[0]
    await expect(page.getByRole('button', { name: 'Pass (space)' })).toBeEnabled({ timeout: 20_000 })
    await page.locator(`.hand-card[data-obj-id="${played}"] .card-tile`).dispatchEvent('click')
    await expect.poll(async () => (await forests(request, room)).battlefield.length).toBe(3)

    // One tile for all three, on this turn.
    const tile = tileOf(page, played)
    await expect(tile.locator('.card-stack')).toHaveText('×3', { timeout: 20_000 })
    for (const id of before.battlefield) await expect(tileOf(page, id)).toHaveCount(1)
    expect(await tile.getAttribute('data-obj-ids')).toContain(before.battlefield[0])
    await screenshots(page, `${room}-after`)
    // Still the turn it was played on (the Llanowar Elves in hand keeps the
    // client from passing alice on): on her next, the sickness is gone anyway.
    expect(await control<{ readonly turn: number }>(request, { op: 'state', room })).toEqual(
      expect.objectContaining({ turn: 1 }),
    )
    expect(errors).toEqual([])
  })
}
