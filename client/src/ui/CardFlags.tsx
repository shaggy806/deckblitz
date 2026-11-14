import type { CSSProperties } from 'react'
import type { VisibleObject } from 'engine/client'

/** A player who goaded a creature, as a tile draws them: their seat colour
 * class (`seatClassOf`) and display name. */
export interface Goader {
  readonly seat: string
  readonly name: string
}

/** A chosen colour is stored as its mana letter (Heraldic Banner's `"U"`). */
const COLOR_WORD: Readonly<Record<string, string>> = {
  W: 'White',
  U: 'Blue',
  B: 'Black',
  R: 'Red',
  G: 'Green',
}

/**
 * The small chips along a permanent's bottom-left corner: summoning sickness,
 * and the designations nothing else on the tile shows — goaded (rule 701.15)
 * suspected (701.60), saddled (702.171b), solved (719.3b), harnessed (701.64) and Ring-bearer (701.54). A designation isn't an ability, so it isn't in the
 * keyword icons; suspect's menace and can't-block are, but not the fact that
 * it's suspected. Also how many cards it holds in exile (`holding` — a
 * Banishing Light's), which the hover card shows, and what was chosen as it
 * entered (`chosen` — Frostcliff Siege's "Jeskai" or "Temur"), since that
 * decides which of its abilities it has and nothing else on the card says.
 *
 * A goad chip is drawn in its goader's seat colour and names them, because
 * who goaded it is the part that matters: it has to attack someone else.
 * `compact` is the battlefield tile's short form ("Z", "Goad", "Sus").
 *
 * A Curse names the player it enchants (`enchanting`), in their seat colour:
 * it sits on its controller's board but is attached to someone else. A
 * battle names its protector (`protectedBy` — rule 310.9) the same way: a
 * Siege sits on its controller's board, defended by an opponent. So does a
 * permanent's chosen player (`chosenPlayer` — Black Vise's opponent).
 */
/** Marks (or unmarks) the board tile of `id` as a paired partner being
 * pointed at: App.css's `.paired-lit`. A class on the tile's own element, so
 * nothing above has to re-render for a hover. */
export function lightPartner(id: string | undefined, on: boolean): void {
  if (id === undefined) return
  for (const el of document.querySelectorAll(`.board [data-obj-id="${id}"]`)) el.classList.toggle('paired-lit', on)
}

/** What `CardFlags` and `flagNotes` read. */
export interface FlagSources {
  readonly obj: VisibleObject
  readonly goaders: readonly Goader[]
  /** The player this Aura is attached to (a Curse), or null. */
  readonly enchanting?: Goader | null
  /** This battle's protector, or null. */
  readonly protectedBy?: Goader | null
  /** The player chosen for this permanent, or null. */
  readonly chosenPlayer?: Goader | null
}

/** One flag: its chip (`compact` on a board tile, `long` elsewhere), and the
 * heading and sentence the hover card's tips column gives it (`flagNotes`). */
interface Flag {
  readonly key: string
  readonly className: string
  readonly compact: string
  readonly long: string
  readonly name: string
  readonly text: string
  readonly seat?: string
}

function flagsOf({ obj, goaders, enchanting = null, protectedBy = null, chosenPlayer = null }: FlagSources): Flag[] {
  const flags: Flag[] = []
  const held = obj.holding?.length ?? 0
  const chosen = obj.chosen === undefined ? null : (COLOR_WORD[obj.chosen] ?? obj.chosen)
  const level = obj.classLevel ?? null
  if (obj.summoningSick && obj.power !== null && obj.toughness !== null) {
    flags.push({
      key: 'sick',
      className: 'sick',
      compact: 'Z',
      long: 'sick',
      name: 'Summoning sick',
      text: "It came under its controller's control this turn: it can't attack or use {T} abilities until their next turn, unless it has haste.",
    })
  }
  if (enchanting !== null) {
    flags.push({
      key: 'enchanting',
      className: 'enchanting',
      compact: `→ ${enchanting.name}`,
      long: `on ${enchanting.name}`,
      name: `On ${enchanting.name}`,
      text: `Enchanting ${enchanting.name}: attached to the player, not to a permanent.`,
      seat: enchanting.seat,
    })
  }
  if (protectedBy !== null) {
    flags.push({
      key: 'protected',
      className: 'enchanting',
      compact: `🛡 ${protectedBy.name}`,
      long: `protected by ${protectedBy.name}`,
      name: `Protected by ${protectedBy.name}`,
      text: `${protectedBy.name} defends it when it's attacked.`,
      seat: protectedBy.seat,
    })
  }
  if (chosenPlayer !== null) {
    flags.push({
      key: 'chosen-player',
      className: 'enchanting',
      compact: `◎ ${chosenPlayer.name}`,
      long: `chose ${chosenPlayer.name}`,
      name: `Chose ${chosenPlayer.name}`,
      text: `The chosen player: ${chosenPlayer.name}.`,
      seat: chosenPlayer.seat,
    })
  }
  if (obj.secretChoice !== undefined) {
    const yours = obj.secretChoice === 'yours'
    flags.push({
      key: 'secret',
      className: 'chosen',
      compact: yours ? 'secret' : '◎ ?',
      long: yours ? 'secret' : 'chose secretly',
      name: 'Secret choice',
      text: yours
        ? 'Your secret choice: only you can see it until you reveal it.'
        : 'A secret choice: hidden until its controller reveals it.',
    })
  }
  for (const g of goaders) {
    flags.push({
      key: `goad-${g.seat}`,
      className: 'goad',
      compact: 'Goad',
      long: 'goaded',
      name: `Goaded by ${g.name}`,
      text: `It attacks each combat if able, and a player other than ${g.name} if able.`,
      seat: g.seat,
    })
  }
  if (obj.suspected) {
    flags.push({ key: 'suspected', className: 'suspect', compact: 'Sus', long: 'suspected', name: 'Suspected', text: "It has menace and can't block." })
  }
  if (obj.solved === true) {
    flags.push({ key: 'solved', className: 'solved', compact: 'Slv', long: 'solved', name: 'Solved', text: 'Its Solved ability works now (rule 719.3b).' })
  }
  if (obj.harnessed === true) {
    flags.push({ key: 'harnessed', className: 'harnessed', compact: 'Hrn', long: 'harnessed', name: 'Harnessed', text: 'Its ∞ ability works now (rule 701.64).' })
  }
  if (obj.pairedWith !== undefined) {
    // Soulbond (rule 702.95): which two are paired matters when two soulbond
    // creatures are out. Hovering its tile lights the partner (`MiniTile`).
    flags.push({ key: 'paired', className: 'paired', compact: '∞', long: 'paired', name: 'Paired', text: 'Paired by soulbond: its partner lights up while you hover this.' })
  }
  if (obj.saddled) {
    flags.push({ key: 'saddled', className: 'saddled', compact: 'Sdl', long: 'saddled', name: 'Saddled', text: "Saddled until end of turn: its abilities that work while it's saddled apply." })
  }
  if (obj.ringBearer) {
    flags.push({
      key: 'ring',
      className: 'ring',
      compact: 'Ring',
      long: 'Ring-bearer',
      name: 'Ring-bearer',
      text: "It's legendary and can't be blocked by creatures with greater power; the Ring emblem says what else.",
    })
  }
  if (obj.preparedSpell !== undefined) {
    flags.push({
      key: 'prepared',
      className: 'prepared',
      compact: 'Prep',
      long: 'prepared',
      name: 'Prepared',
      text: 'Its controller may cast a copy of its spell: open its menu. Doing so unprepares it.',
    })
  }
  if (level !== null) {
    flags.push({
      key: 'level',
      className: 'level',
      compact: `Lv ${level}`,
      long: `level ${level}`,
      name: `Level ${level}`,
      text: `A Class at level ${level}: it has the abilities of level ${level} and below.`,
    })
  }
  if (chosen !== null) {
    flags.push({ key: 'chosen', className: 'chosen', compact: chosen, long: `chose ${chosen}`, name: `Chose ${chosen}`, text: `Chosen as it entered: ${chosen}.` })
  }
  if (obj.storedResults !== undefined && obj.storedResults.length > 0) {
    const dice = obj.storedResults.join(' ')
    flags.push({
      key: 'stored',
      className: 'chosen',
      compact: `🎲 ${dice}`,
      long: `stored ${dice}`,
      name: `Stored results: ${dice}`,
      text: `Die results stored on it, oldest first: ${dice}.`,
    })
  }
  if (held > 0) {
    flags.push({
      key: 'holding',
      className: 'holding',
      compact: `Ex ${held}`,
      long: `${held} exiled`,
      name: `${held} exiled`,
      text: `Holding ${held} card${held === 1 ? '' : 's'} in exile, shown beside it.`,
    })
  }
  return flags
}

/** The flags as the hover card's tips column gives them (`KeywordTips`'s
 * `notes`): beside the card with what each means, rather than as chips along
 * its bottom (the user, 2026-11-11). */
export function flagNotes(sources: FlagSources): { key: string; name: string; text: string }[] {
  return flagsOf(sources).map((f) => ({ key: `flag-${f.key}`, name: f.name, text: f.text }))
}

export function CardFlags({ compact, ...sources }: FlagSources & { readonly compact: boolean }) {
  const flags = flagsOf(sources)
  if (flags.length === 0) return null
  return (
    <span className="card-flags">
      {flags.map((f) => (
        <span
          key={f.key}
          className={`card-flag ${f.className}`}
          style={f.seat !== undefined ? ({ '--goader': `var(--${f.seat})` } as CSSProperties) : undefined}
          title={`${f.name}: ${f.text}`}
        >
          {compact ? f.compact : f.long}
        </span>
      ))}
    </span>
  )
}
