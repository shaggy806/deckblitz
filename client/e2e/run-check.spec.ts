import { expect, test, type Page } from '@playwright/test'
import { mkdirSync } from 'node:fs'
import { join } from 'node:path'

// Plays one of the scenario builder's manual checks (builder/manualChecks.ts)
// by a list of steps and prints, after each, what's on screen as plain text,
// with a screenshot's path. Run by `e2e/run-check.mjs`, which says what to
// play through RUN_CHECK; skipped in the suite.

const raw = process.env.RUN_CHECK
test.skip(raw === undefined, 'run by e2e/run-check.mjs')

interface RunCheck {
  readonly check: string
  readonly steps: readonly string[]
  readonly shots: string
}

interface Snapshot {
  readonly title: string
  readonly banner: string
  readonly popups: readonly string[]
  readonly badges: readonly string[]
  readonly players: readonly string[]
  readonly stack: readonly string[]
  readonly log: readonly string[]
  /** What changes when anything does: the settle loop waits on it. */
  readonly key: string
  /** A decision is this seat's. */
  readonly deciding: boolean
  /** This seat holds priority. */
  readonly holding: boolean
  /** The top of the stack is this seat's. */
  readonly ownTop: boolean
}

/** Text as a case-blind pattern, a hyphen matching a minus sign too (the
 * loyalty costs are written −6). */
function pattern(text: string): RegExp {
  const escaped = text.replace(/[.*+?^${}()|[\]\\]/g, '\\$&').replace(/[-−]/g, '[-−]')
  return new RegExp(escaped, 'i')
}

/** Everything the run prints, read in the page from the DOM and the dev
 * build's `window.deckblitzView`. */
function snapshot(page: Page): Promise<Snapshot> {
  return page.evaluate(() => {
    type View = {
      turnOrder: string[]
      players: Record<string, { life: number; handSize: number; graveyardSize: number; librarySize: number; hasLost: boolean }>
      objects: Record<string, { cardName: string; copyOf?: string | null; controller: string }>
      zones: { stack: string[]; exile: string[]; exileOwners: Record<string, string> }
      priority: { active: boolean; holder: string | null }
      awaiting: { player?: string } | null
    }
    const dv = (window as Window & { deckblitzView?: { view: View | null; seat: string | null; log: string[] } }).deckblitzView
    const view = dv?.view ?? null
    const line = (el: Element | null) => (el === null ? '' : (el as HTMLElement).innerText.replace(/\s+/g, ' ').trim())
    const nameOf = (id: string) => (view?.objects[id] ? (view.objects[id].copyOf ?? view.objects[id].cardName) : 'face-down')
    const tileName = (el: Element) => line(el.querySelector('.ct-name')) || (el.querySelector('.card-back') ? 'face-down' : '?')
    const popups = [...document.querySelectorAll('.zone-viewer-box[role="dialog"]')].map((box) => {
      const title = box.getAttribute('aria-label') ?? line(box.querySelector('h2'))
      const piles = [...box.querySelectorAll('.pile-section')]
      const groups = piles.length > 0
        ? piles.map((p) => `${line(p.querySelector('.pile-head strong'))} (${[...p.querySelectorAll('.zone-viewer-cards > *')].filter((c) => !c.matches('.muted')).map(tileName).join(', ') || 'empty'})`)
        : [[...box.querySelectorAll('.zone-viewer-card, .card-back')].map(tileName).join(', ')]
      return `"${title}": ${groups.join(' | ')}`
    })
    // A tile is one object (`data-obj-id`) or a stack of them (`data-obj-ids`).
    const badges = [...document.querySelectorAll('.board :is(.card-badge, .mt-badge)')].map((badge) => {
      const tile = badge.closest('[data-obj-id], [data-obj-ids]')
      const id = tile?.getAttribute('data-obj-id') ?? tile?.getAttribute('data-obj-ids')?.split(' ')[0]
      return `${id === undefined ? '?' : nameOf(id)}: ${line(badge)}`
    })
    const players = view === null ? [] : view.turnOrder.map((id) => {
      const p = view.players[id]
      const exile = view.zones.exile.filter((x) => view.zones.exileOwners[x] === id).length
      return `${id}${id === dv?.seat ? ' (you)' : ''}: life ${p.life}, hand ${p.handSize}, graveyard ${p.graveyardSize}, exile ${exile}, library ${p.librarySize}${p.hasLost ? ', lost' : ''}`
    })
    const stack = view === null ? [] : view.zones.stack.map(nameOf)
    const log = dv?.log ?? []
    const banner = line(document.querySelector('.decision-banner'))
    const title = line(document.querySelector('.bp-check-title'))
    const key = JSON.stringify([banner, popups, badges, players, stack, view?.priority, view?.awaiting])
    const seat = dv?.seat ?? null
    return {
      title,
      banner,
      popups,
      badges,
      players,
      stack,
      log,
      key,
      deciding: seat !== null && view?.awaiting?.player === seat,
      holding: seat !== null && view?.priority.active === true && view.priority.holder === seat,
      ownTop: seat !== null && view?.objects[view.zones.stack.at(-1) ?? '']?.controller === seat,
    }
  })
}

/** Until the screen stops changing for 700 ms, passing priority while this
 * seat's own spell or ability is on top of the stack (what a check looks at
 * comes as it resolves), and stopping at a decision of this seat's or its
 * priority over anything else. `wait` also waits out the bots, as long as
 * 30 s; any other step stops once the screen is still. */
async function settle(page: Page, forBots: boolean): Promise<Snapshot> {
  const limit = Date.now() + (forBots ? 30_000 : 10_000)
  let last = await snapshot(page)
  let since = Date.now()
  // The client passes for you when you've nothing to do, so `wait` would
  // run on into later turns: it stops once a stack it saw has emptied.
  let sawStack = last.stack.length > 0
  while (Date.now() < limit) {
    await page.waitForTimeout(150)
    const now = await snapshot(page)
    if (now.key !== last.key) {
      last = now
      since = Date.now()
      sawStack ||= now.stack.length > 0
      continue
    }
    if (Date.now() - since < 700) continue
    if (sawStack && now.stack.length === 0 && !now.deciding) return now
    if (now.holding && now.ownTop && !now.deciding) {
      // Not there or not enabled yet: the next round tries again.
      await page.getByRole('button', { name: /^Pass \(/ }).click({ timeout: 2_000 }).catch(() => undefined)
      since = Date.now()
    } else if (!forBots || now.deciding || now.holding) return now
  }
  return last
}

function print(label: string, s: Snapshot, shot: string): void {
  const out = [`== ${label}`, `  banner: ${s.banner || '—'}`]
  for (const p of s.popups) out.push(`  popup ${p}`)
  if (s.badges.length > 0) out.push(`  badges: ${s.badges.join('; ')}`)
  for (const p of s.players) out.push(`  ${p}`)
  out.push(`  stack: ${s.stack.length > 0 ? s.stack.join(', ') : '—'}`)
  if (s.log.length > 0) out.push(`  log: ${s.log.join(' / ')}`)
  out.push(`  shot: ${shot}`)
  console.log(out.join('\n'))
}

/** The id of the first object in one of the view's id lists named `name`
 * (a piece of the name will do). */
function findId(page: Page, zone: 'hand' | 'battlefield', name: string): Promise<string | null> {
  return page.evaluate(
    ([zone, name]) => {
      const dv = (window as Window & { deckblitzView?: { view: { objects: Record<string, { cardName: string; copyOf?: string | null }>; zones: { battlefield: string[]; hands: Record<string, string[]> } } | null; seat: string | null } }).deckblitzView
      const view = dv?.view
      if (!view) return null
      const ids = zone === 'hand' ? (view.zones.hands[dv?.seat ?? ''] ?? []) : view.zones.battlefield
      const wanted = name.toLowerCase()
      const exact = ids.find((id) => view.objects[id]?.cardName.toLowerCase() === wanted)
      return exact ?? ids.find((id) => view.objects[id]?.cardName.toLowerCase().includes(wanted)) ?? null
    },
    [zone, name] as const,
  )
}

/** Runs one step; false when it finds nothing to act on. */
async function runStep(page: Page, step: string): Promise<boolean> {
  const colon = step.indexOf(':')
  const kind = (colon < 0 ? step : step.slice(0, colon)).trim().toLowerCase()
  const arg = colon < 0 ? '' : step.slice(colon + 1).trim()
  const visibleFirst = async (sel: ReturnType<Page['locator']>) => {
    const loc = sel.filter({ visible: true }).first()
    if ((await loc.count()) === 0) return false
    // A hover card or an animation over it: the click sent to it directly.
    await loc.click({ timeout: 3_000 }).catch(() => loc.dispatchEvent('click'))
    return true
  }
  switch (kind) {
    case 'cast':
    case 'hand': {
      const id = await findId(page, 'hand', arg)
      if (id === null) return false
      // The fan overlaps its cards: a click sent to the tile itself.
      await page.locator(`.hand-card[data-obj-id="${id}"] .card-tile`).dispatchEvent('click')
      return true
    }
    case 'card': {
      // A card in an open popup first (it's over the board), then the board,
      // then the hand.
      const inPopup = page.locator('.zone-viewer-card', { has: page.locator('.ct-name', { hasText: pattern(arg) }) })
      if (await visibleFirst(inPopup.locator('.card-tile'))) return true
      const id = await findId(page, 'battlefield', arg)
      if (id !== null) return visibleFirst(page.locator(`.board [data-obj-id="${id}"]`))
      return runStep(page, `hand:${arg}`)
    }
    case 'click':
      // The decision bar's own buttons first: a card tile is a button too,
      // and a mode's text is also its card's (Fiery Confluence in hand).
      return (
        (await visibleFirst(page.locator('.controls button', { hasText: pattern(arg) }))) ||
        visibleFirst(page.locator('button, [role="menuitem"], [role="button"]', { hasText: pattern(arg) }))
      )
    case 'player':
      return visibleFirst(page.locator('[data-player-id]', { has: page.locator('.pp-name', { hasText: pattern(arg) }) }))
    case 'pass':
      return visibleFirst(page.getByRole('button', { name: /^Pass/ }))
    case 'wait':
      return true
    default:
      throw new Error(`unknown step "${step}": cast:, hand:, card:, click:, player:, pass, wait`)
  }
}

test('run a manual check', async ({ page }) => {
  const run = JSON.parse(raw ?? '{}') as RunCheck
  test.setTimeout(60_000 + run.steps.length * 40_000)
  mkdirSync(run.shots, { recursive: true })
  const shoot = async (n: number, name: string) => {
    const path = join(run.shots, `${String(n).padStart(2, '0')}-${name.replace(/[^a-z0-9]+/gi, '-').slice(0, 40)}.png`)
    await page.screenshot({ path })
    return path
  }

  await page.goto(`/?check=${encodeURIComponent(run.check)}`)
  const panel = page.locator('.builder-panel')
  await expect(panel.locator('.bp-check-title')).toBeVisible({ timeout: 30_000 })
  const title = (await panel.locator('.bp-check-title').innerText()).replace(/^✓\s*/, '').trim()
  if (!title.toLowerCase().includes(run.check.trim().toLowerCase())) {
    console.log(`FAILED: no manual check's title contains "${run.check}"`)
    throw new Error('no such manual check')
  }
  await expect(panel.locator('.bp-mode')).toHaveText('Playing', { timeout: 30_000 })
  // The drawer covers the board's right side: out of the way.
  await panel.getByTitle('Hide the builder').click()
  console.log(`check: ${title}`)
  print('start', await settle(page, true), await shoot(0, 'start'))

  for (const [i, step] of run.steps.entries()) {
    const found = await runStep(page, step)
    // Off the board, so a hover card doesn't cover the next target.
    await page.mouse.move(1, 1)
    const s = await settle(page, step.trim().toLowerCase() === 'wait')
    const shot = await shoot(i + 1, step)
    if (!found) {
      console.log(`FAILED step ${i + 1} "${step}": nothing to act on\n  banner: ${s.banner || '—'}\n  shot: ${shot}`)
      throw new Error(`step ${i + 1} found no target`)
    }
    print(`${i + 1} ${step}`, s, shot)
  }
})
