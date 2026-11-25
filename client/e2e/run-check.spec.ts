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
  /** A scenario's JSON to play in place of a manual check's board. */
  readonly scenario?: string
  /** The window's size, where the config's 1366x768 isn't what's wanted. */
  readonly size?: { readonly width: number; readonly height: number }
  /** Never pass priority for the seat: the run is about how the stack
   * resolves (`pass`, `click:Resolve stack`), so each pass is a step. */
  readonly hold?: boolean
}

interface Snapshot {
  readonly title: string
  readonly banner: string
  readonly popups: readonly string[]
  readonly badges: readonly string[]
  readonly players: readonly string[]
  readonly stack: readonly string[]
  /** The stack as drawn, top first: each entry's label, card and targets —
   * a "prompted by" card among them, which isn't on the stack. */
  readonly drawn: readonly string[]
  readonly log: readonly string[]
  /** The log's lines since the snapshot printed before this one (the last 40
   * at most), and the newest event's `seq`. */
  readonly newLog: readonly string[]
  readonly logSeq: number
  /** "turn 3, Bob's, declare-attackers". */
  readonly turn: string
  /** Each player's permanents, one line a player: name, power/toughness,
   * and what marks it (tapped, counters, attached to, summoning sick). */
  readonly board: readonly string[]
  /** The cards in this seat's hand, and its unspent mana. */
  readonly hand: string
  readonly mana: string
  /** Each graveyard and exile with anything in it, by owner. */
  readonly piles: readonly string[]
  /** An open menu's items (an ability menu, a tap-for-mana choice), with
   * `(off)` on one that can't be picked. */
  readonly menus: readonly string[]
  /** What this seat is told while it waits on another: the line by the pass
   * buttons, and each panel's. */
  readonly waiting: readonly string[]
  /** What changes when anything does: the settle loop waits on it. */
  readonly key: string
  /** A decision is this seat's. */
  readonly deciding: boolean
  /** This seat holds priority. */
  readonly holding: boolean
  /** The top of the stack is this seat's. */
  readonly ownTop: boolean
  /** A frame is still playing out: the view is ahead of the screen (a
   * decision's banner isn't up yet). */
  readonly playing: boolean
}

/** Text as a case-blind pattern, a hyphen matching a minus sign too (the
 * loyalty costs are written −6). */
function pattern(text: string): RegExp {
  // "=Search your hand": the whole text, where another button's holds it too.
  const whole = text.startsWith('=')
  const escaped = (whole ? text.slice(1) : text).replace(/[.*+?^${}()|[\]\\]/g, '\\$&').replace(/[-−]/g, '[-−]')
  return new RegExp(whole ? `^\\s*${escaped}\\s*$` : escaped, 'i')
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
      answering?: string
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
    const drawn = [...document.querySelectorAll('.stack-overlay .stack-entry')].map((entry) =>
      [line(entry.querySelector('.stack-entry-label')), tileName(entry), line(entry.querySelector('.stack-targets'))]
        .filter((part) => part !== '')
        .join(' | '),
    )
    const log = dv?.log ?? []
    // Everything below is for a reader with no screen: an agent judging a
    // manual check from this text alone (.claude/manual-checks/agent-guide.md).
    type Full = {
      activePlayer?: string
      turn?: { number: number; step: string }
      zones: { battlefield: string[]; hands: Record<string, string[]>; graveyards: Record<string, string[]> }
      players: Record<string, { manaPool?: Record<string, number> }>
      objects: Record<string, {
        cardName: string; copyOf?: string | null; controller: string; owner?: string; types?: string[]; power: number | null; toughness: number | null
        loyalty?: number | null; tapped?: boolean; counters?: Record<string, number>; summoningSick?: boolean; attachedTo?: string | null
        stackCount?: number | null; faceDown?: unknown; keywords?: string[]
      }>
    }
    const full = view as unknown as Full | null
    const describe = (id: string): string => {
      const o = full?.objects[id]
      if (o === undefined) return 'face-down'
      const marks: string[] = []
      if (o.tapped === true) marks.push('tapped')
      if (o.summoningSick === true && o.types?.includes('creature') === true) marks.push('sick')
      for (const [kind, n] of Object.entries(o.counters ?? {})) if (n > 0 && kind !== 'loyalty') marks.push(`${n} ${kind}`)
      if (o.attachedTo != null) marks.push(`on ${nameOf(o.attachedTo)}`)
      if (o.faceDown !== undefined) marks.push('face-down')
      if ((o.keywords ?? []).length > 0) marks.push(o.keywords!.join(' '))
      const size = o.power !== null && o.toughness !== null ? ` ${o.power}/${o.toughness}` : o.loyalty != null ? ` [${o.loyalty}]` : ''
      const many = (o.stackCount ?? 1) > 1 ? ` x${o.stackCount}` : ''
      return `${nameOf(id)}${many}${size}${marks.length > 0 ? ` (${marks.join(', ')})` : ''}`
    }
    const order = view?.turnOrder ?? []
    const board = full === null ? [] : order.map((p) => `${p}: ${full.zones.battlefield.filter((id) => full.objects[id]?.controller === p).map(describe).join('; ') || '—'}`)
    const mine = dv?.seat ?? ''
    const hand = full === null ? '' : (full.zones.hands[mine] ?? []).map(nameOf).join(', ')
    const mana = full === null ? '' : Object.entries(full.players[mine]?.manaPool ?? {}).filter(([, n]) => typeof n === 'number' && n > 0).map(([c, n]) => `${n} ${c}`).join(', ')
    const piles = full === null ? [] : order.flatMap((p) => {
      const graveyard = (full.zones.graveyards[p] ?? []).map(nameOf)
      const exiled = (view?.zones.exile ?? []).filter((x) => view?.zones.exileOwners[x] === p).map(nameOf)
      return [
        ...(graveyard.length > 0 ? [`${p}'s graveyard: ${graveyard.slice(-12).join(', ')}`] : []),
        ...(exiled.length > 0 ? [`${p}'s exile: ${exiled.slice(-12).join(', ')}`] : []),
      ]
    })
    // A mana symbol is an image: its alt text ("{G}") stands for it.
    const words = (el: Element): string => {
      const copy = el.cloneNode(true) as HTMLElement
      for (const img of copy.querySelectorAll('img[alt]')) img.replaceWith(img.getAttribute('alt') ?? '')
      return (copy.textContent ?? '').replace(/\s+/g, ' ').trim()
    }
    const menus = [...document.querySelectorAll('[role="menu"]')]
      .filter((menu) => (menu as HTMLElement).offsetParent !== null || menu.getClientRects().length > 0)
      .map((menu) => {
        const items = [...menu.querySelectorAll('[role="menuitem"], button')].map(
          (item) => `${words(item)}${(item as HTMLButtonElement).disabled === true ? ' (off)' : ''}`,
        )
        return `"${menu.getAttribute('aria-label') ?? ''}": ${[...new Set(items)].join(' | ')}`
      })
    const turn = full?.turn === undefined ? '' : `turn ${full.turn.number}, ${full.activePlayer ?? '?'}'s, ${full.turn.step}`
    const logSince = (dv as unknown as { logSince?: (seq: number, max: number) => { seq: number; text: string }[] } | undefined)?.logSince
    const since = (window as Window & { runCheckLogSeq?: number }).runCheckLogSeq ?? -1
    const fresh = logSince === undefined ? [] : logSince.call(dv, since, 40)
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
      drawn,
      log,
      newLog: fresh.map((l) => l.text),
      logSeq: fresh.length > 0 ? fresh[fresh.length - 1].seq : since,
      turn,
      board,
      hand,
      mana,
      piles,
      menus,
      waiting: [...document.querySelectorAll('.priority-waiting, .pp-waiting')].map(line),
      key,
      // Another player's decision this seat makes is its own to answer (rule 723).
      deciding: seat !== null && view?.awaiting != null && (view.answering ?? view.awaiting.player) === seat,
      holding: seat !== null && view?.priority.active === true && (view.answering ?? view.priority.holder) === seat,
      ownTop: seat !== null && view?.objects[view.zones.stack.at(-1) ?? '']?.controller === seat,
      // The top strip says so while a frame's animations play.
      playing: document.querySelector('.ts-acting')?.textContent?.trim() === 'Resolving…',
    }
  })
}

/** Until the screen stops changing for 700 ms, passing priority while this
 * seat's own spell or ability is on top of the stack (what a check looks at
 * comes as it resolves), and stopping at a decision of this seat's or its
 * priority over anything else. `wait` also waits out the bots, as long as
 * 30 s; any other step stops once the screen is still. */
async function settle(page: Page, forBots: boolean, hold = false): Promise<Snapshot> {
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
    // Never settled mid-animation: the snapshot's view has the decision
    // before its banner is drawn, which read as a stall (a cast triggering
    // its caster's own targeted ability, 2026-10-30).
    if (now.playing) continue
    if (sawStack && now.stack.length === 0 && !now.deciding) return now
    // (Unless the run passes for itself, `hold`.)
    if (!hold && now.holding && now.ownTop && !now.deciding) {
      // Not there or not enabled yet: the next round tries again.
      await page.getByRole('button', { name: /^Pass \(/ }).click({ timeout: 2_000 }).catch(() => undefined)
      since = Date.now()
    } else if (!forBots || now.deciding || now.holding) return now
  }
  return last
}

/** What the last print said of the board, hand and piles: a line is printed
 * again only where it has changed, so a long run stays short to read. */
const printed = new Map<string, string>()

async function print(page: Page, label: string, s: Snapshot, shot: string): Promise<void> {
  const out = [`== ${label}`, `  ${s.turn}`, `  banner: ${s.banner || '—'}`]
  for (const p of s.popups) out.push(`  popup ${p}`)
  for (const m of s.menus) out.push(`  menu ${m}`)
  if (s.badges.length > 0) out.push(`  badges: ${s.badges.join('; ')}`)
  for (const p of s.players) out.push(`  ${p}`)
  const changed = (key: string, text: string): boolean => {
    if (printed.get(key) === text) return false
    printed.set(key, text)
    return true
  }
  for (const b of s.board) if (changed(`board ${b.split(':')[0]}`, b)) out.push(`  board ${b}`)
  if (changed('hand', s.hand)) out.push(`  hand: ${s.hand || '—'}`)
  const manaBefore = printed.get('mana') ?? ''
  if (changed('mana', s.mana) && (s.mana !== '' || manaBefore !== '')) out.push(`  mana: ${s.mana || '—'}`)
  if (changed('piles', s.piles.join(' / '))) for (const p of s.piles) out.push(`  ${p}`)
  out.push(`  stack: ${s.stack.length > 0 ? s.stack.join(', ') : '—'}`)
  if (s.drawn.length > 0) out.push(`  stack drawn (top first): ${s.drawn.join(' / ')}`)
  if (s.waiting.length > 0) out.push(`  waiting: ${s.waiting.join(' / ')}`)
  // Every line the log gained since the last print, so nothing a step did
  // scrolls away unread.
  if (s.newLog.length > 0) out.push(`  log (+${s.newLog.length}): ${s.newLog.join(' / ')}`)
  else out.push('  log: nothing new')
  await page.evaluate((seq) => {
    ;(window as Window & { runCheckLogSeq?: number }).runCheckLogSeq = seq
  }, s.logSeq)
  out.push(`  shot: ${shot}`)
  console.log(out.join('\n'))
}

/** The id of the first object in one of the view's id lists named `name`
 * (a piece of the name will do). */
function findId(page: Page, zone: 'hand' | 'battlefield' | 'command', name: string): Promise<string | null> {
  return page.evaluate(
    ([zone, name]) => {
      const dv = (window as Window & { deckblitzView?: { view: { perspective?: string; objects: Record<string, { cardName: string; copyOf?: string | null }>; zones: { battlefield: string[]; command: string[]; hands: Record<string, string[]> } } | null; seat: string | null } }).deckblitzView
      const view = dv?.view
      if (!view) return null
      const ids = zone === 'hand' ? (view.zones.hands[view.perspective ?? dv?.seat ?? ''] ?? []) : zone === 'command' ? view.zones.command : view.zones.battlefield
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
      // The tile stays disabled while the last spell's frames play: a second
      // cast straight after a first would be lost. It may be disabled for good
      // (nothing to do with that card now), so this only waits a while.
      const tile = `.hand-card[data-obj-id="${id}"] .card-tile`
      await page.locator(`${tile}:not([disabled])`).waitFor({ timeout: 5_000 }).catch(() => {})
      // The fan overlaps its cards: a click sent to the tile itself.
      await page.locator(tile).dispatchEvent('click')
      return true
    }
    case 'hover': {
      // The pointer left on a card for the shot: a hand card raised out of
      // its tray, or a permanent's hover card.
      const inHand = await findId(page, 'hand', arg)
      if (inHand !== null) {
        const tile = page.locator(`.hand-card[data-obj-id="${inHand}"] .card-tile`)
        // The tray sits under the screen's edge until the pointer is on it:
        // onto the strip that shows first, then onto the card once it's up.
        await tile.hover({ position: { x: 12, y: 4 }, force: true, timeout: 3_000 })
        await page.waitForTimeout(700)
        await tile.hover({ force: true, timeout: 3_000 })
        await page.waitForTimeout(900)
        return true
      }
      const onBoard = await findId(page, 'battlefield', arg)
      if (onBoard === null) return false
      await page.locator(`.board [data-obj-id="${onBoard}"]`).first().hover({ timeout: 3_000 })
      await page.waitForTimeout(900)
      return true
    }
    case 'card': {
      // A card in an open popup first (it's over the board), then the board,
      // then the hand, then the command zone.
      const inPopup = page.locator('.zone-viewer-card', { has: page.locator('.ct-name', { hasText: pattern(arg) }) })
      // The popup waits out a long animation (ten cards exiled), as `click:` does.
      for (const limit = Date.now() + 25_000; ; await page.waitForTimeout(250)) {
        if (await visibleFirst(inPopup.locator('.card-tile'))) return true
        const id = await findId(page, 'battlefield', arg)
        if (id !== null) {
          // An attachment sits behind its host: only its strip below can be clicked.
          const attached = page.locator(`.board .attachments [data-obj-id="${id}"]`).first()
          const box = (await attached.count()) === 0 ? null : await attached.boundingBox()
          if (box !== null) {
            // Its tile stays disabled while the last frames play, as a hand card's does.
            await attached.locator('button:not([disabled])').waitFor({ timeout: 5_000 }).catch(() => {})
            await attached.click({ position: { x: box.width / 2, y: box.height - 3 }, timeout: 3_000 })
            return true
          }
          return visibleFirst(page.locator(`.board [data-obj-id="${id}"]`))
        }
        if ((await findId(page, 'hand', arg)) !== null) return runStep(page, `hand:${arg}`)
        const commander = await findId(page, 'command', arg)
        if (commander !== null) return visibleFirst(page.locator(`.commander-tile-wrap[data-obj-id="${commander}"] .commander-tile`))
        // A library's top card where it's shown (Courser of Kruphix).
        const top = page.locator('.library-top', { has: page.locator('.ct-name', { hasText: pattern(arg) }) })
        if (await visibleFirst(top.locator('.card-tile'))) return true
        if (Date.now() > limit) return false
      }
    }
    case 'click':
      // The decision bar's own buttons first: a card tile is a button too,
      // and a mode's text is also its card's (Fiery Confluence in hand). The
      // view moves on ahead of the screen: a long animation (ten cards exiled)
      // is still playing when the snapshot says the decision has come, so the
      // button gets a while to appear.
      for (const limit = Date.now() + 25_000; ; await page.waitForTimeout(250)) {
        if (
          (await visibleFirst(page.locator('.controls button', { hasText: pattern(arg) }))) ||
          // Then a real button before a tile, whose rules text may say the same
          // ("Cycling—Pay 2 life", under the card in hand).
          (await visibleFirst(page.locator('button:not(.card-tile):not(:has(.card-tile))', { hasText: pattern(arg) }))) ||
          (await visibleFirst(page.locator('button, [role="menuitem"], [role="button"]', { hasText: pattern(arg) }))) ||
          // A cost is mana symbols, images whose alt text is only in the name
          // ("Equip {0}" beside "Equip {2}").
          (await visibleFirst(page.getByRole('menuitem', { name: pattern(arg) }).or(page.getByRole('button', { name: pattern(arg) })))) ||
          // Last, a labelled box: a setting ("Order my own triggers").
          (await visibleFirst(page.locator('label', { hasText: pattern(arg) })))
        ) {
          return true
        }
        if (Date.now() > limit) return false
      }
    case 'stack':
      // An entry on the stack, whose source may be on the board too.
      return visibleFirst(page.locator('.stack-entry', { hasText: pattern(arg) }).locator('.stack-card .card-tile'))
    case 'player':
      return visibleFirst(page.locator('[data-player-id]', { has: page.locator('.pp-name', { hasText: pattern(arg) }) }))
    case 'pass':
      return visibleFirst(page.getByRole('button', { name: /^Pass/ }))
    case 'wait':
      return true
    case 'x': {
      // The choose-X box: its default is the most, which may leave no choice to see.
      const box = page.locator('.controls input[type="number"]').filter({ visible: true }).first()
      if ((await box.count()) === 0) return false
      await box.fill(arg)
      return true
    }
    case 'unfollow': {
      // Stay in this seat while another of yours must act, to see what it sees.
      // The toggle is on the builder's panel, hidden as the run starts.
      await page.getByRole('button', { name: /^Builder/ }).click({ timeout: 5_000 })
      const follow = page.locator('.bp-seat-follow input')
      if ((await follow.count()) === 0) return false
      await follow.setChecked(false)
      await page.getByTitle('Hide the builder').click({ timeout: 3_000 })
      return true
    }
    default:
      throw new Error(`unknown step "${step}": cast:, hand:, card:, stack:, click:, player:, pass, wait, unfollow`)
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

  if (run.size !== undefined) await page.setViewportSize(run.size)
  const panel = page.locator('.builder-panel')
  let title = 'a scenario'
  if (run.scenario !== undefined) {
    // A board of its own, through the builder's Import.
    await page.goto('/')
    await page.getByRole('button', { name: /Scenario builder/ }).click()
    await expect(panel.locator('.bp-mode')).toHaveText('Building', { timeout: 30_000 })
    await panel.getByRole('button', { name: 'Import…' }).click()
    await panel.locator('.bp-import textarea').fill(run.scenario)
    await panel.locator('.bp-import').getByRole('button', { name: 'Load it' }).click()
    await expect(panel.locator('.bp-import')).toHaveCount(0, { timeout: 10_000 })
    await panel.getByRole('button', { name: /Start play/ }).click()
  } else {
    await page.goto(`/?check=${encodeURIComponent(run.check)}`)
    await expect(panel.locator('.bp-check-title')).toBeVisible({ timeout: 30_000 })
    title = (await panel.locator('.bp-check-title').innerText()).replace(/^✓\s*/, '').trim()
    if (!title.toLowerCase().includes(run.check.trim().toLowerCase())) {
      console.log(`FAILED: no manual check's title contains "${run.check}"`)
      throw new Error('no such manual check')
    }
  }
  await expect(panel.locator('.bp-mode')).toHaveText('Playing', { timeout: 30_000 })
  // The drawer covers the board's right side: out of the way.
  // (A board that starts on a popup, a companion to reveal, has it in front.)
  const hide = panel.getByTitle('Hide the builder')
  await hide.click({ timeout: 3_000 }).catch(() => hide.dispatchEvent('click'))
  console.log(`check: ${title}`)
  await print(page, 'start', await settle(page, true, run.hold), await shoot(0, 'start'))

  for (const [i, step] of run.steps.entries()) {
    const found = await runStep(page, step)
    // Off the board, so a hover card doesn't cover the next target — but a
    // `hover:` step's shot is of the card under the pointer.
    if (!/^\s*hover\s*:/i.test(step)) await page.mouse.move(1, 1)
    const s = await settle(page, step.trim().toLowerCase() === 'wait', run.hold)
    const shot = await shoot(i + 1, step)
    if (!found) {
      console.log(`FAILED step ${i + 1} "${step}": nothing to act on\n  banner: ${s.banner || '—'}\n  shot: ${shot}`)
      throw new Error(`step ${i + 1} found no target`)
    }
    await print(page, `${i + 1} ${step}`, s, shot)
  }
})
