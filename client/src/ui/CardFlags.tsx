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

export function CardFlags({
  obj,
  goaders,
  compact,
  enchanting = null,
  protectedBy = null,
  chosenPlayer = null,
}: {
  readonly obj: VisibleObject
  readonly goaders: readonly Goader[]
  readonly compact: boolean
  /** The player this Aura is attached to (a Curse), or null. */
  readonly enchanting?: Goader | null
  /** This battle's protector, or null. */
  readonly protectedBy?: Goader | null
  /** The player chosen for this permanent, or null. */
  readonly chosenPlayer?: Goader | null
}) {
  const sick = obj.summoningSick && obj.power !== null && obj.toughness !== null
  const held = obj.holding?.length ?? 0
  const chosen = obj.chosen === undefined ? null : (COLOR_WORD[obj.chosen] ?? obj.chosen)
  const level = obj.classLevel ?? null
  if (
    !sick &&
    goaders.length === 0 &&
    !obj.suspected &&
    !obj.saddled &&
    obj.solved !== true &&
    obj.harnessed !== true &&
    !obj.ringBearer &&
    obj.preparedSpell === undefined &&
    held === 0 &&
    chosen === null &&
    enchanting === null &&
    protectedBy === null &&
    chosenPlayer === null &&
    obj.secretChoice === undefined &&
    obj.pairedWith === undefined &&
    level === null
  ) {
    return null
  }
  return (
    <span className="card-flags">
      {sick ? <span className="card-flag sick">{compact ? 'Z' : 'sick'}</span> : null}
      {enchanting !== null ? (
        <span
          className="card-flag enchanting"
          style={{ '--goader': `var(--${enchanting.seat})` } as CSSProperties}
          title={`Enchanting ${enchanting.name}`}
        >
          {compact ? `→ ${enchanting.name}` : `on ${enchanting.name}`}
        </span>
      ) : null}
      {protectedBy !== null ? (
        <span
          className="card-flag enchanting"
          style={{ '--goader': `var(--${protectedBy.seat})` } as CSSProperties}
          title={`Protected by ${protectedBy.name}: they defend it when it's attacked`}
        >
          {compact ? `🛡 ${protectedBy.name}` : `protected by ${protectedBy.name}`}
        </span>
      ) : null}
      {chosenPlayer !== null ? (
        <span
          className="card-flag enchanting"
          style={{ '--goader': `var(--${chosenPlayer.seat})` } as CSSProperties}
          title={`The chosen player: ${chosenPlayer.name}`}
        >
          {compact ? `◎ ${chosenPlayer.name}` : `chose ${chosenPlayer.name}`}
        </span>
      ) : null}
      {obj.secretChoice !== undefined ? (
        <span
          className="card-flag chosen"
          title={
            obj.secretChoice === 'yours'
              ? 'Your secret choice: only you can see it until you reveal it'
              : 'A secret choice: hidden until its controller reveals it'
          }
        >
          {obj.secretChoice === 'yours' ? 'secret' : compact ? '◎ ?' : 'chose secretly'}
        </span>
      ) : null}
      {goaders.map((g) => (
        <span
          key={g.seat}
          className="card-flag goad"
          style={{ '--goader': `var(--${g.seat})` } as CSSProperties}
          title={`Goaded by ${g.name}: it attacks each combat if able, and a player other than ${g.name} if able`}
        >
          {compact ? 'Goad' : 'goaded'}
        </span>
      ))}
      {obj.suspected ? (
        <span className="card-flag suspect" title="Suspected: it has menace and can't block">
          {compact ? 'Sus' : 'suspected'}
        </span>
      ) : null}
      {obj.solved === true ? (
        <span className="card-flag solved" title="Solved (rule 719.3b): its Solved ability works now">
          {compact ? 'Slv' : 'solved'}
        </span>
      ) : null}
      {obj.harnessed === true ? (
        <span className="card-flag harnessed" title="Harnessed (rule 701.64): its ∞ ability works now">
          {compact ? 'Hrn' : 'harnessed'}
        </span>
      ) : null}
      {obj.pairedWith !== undefined ? (
        // Soulbond (rule 702.95): which two are paired matters when two
        // soulbond creatures are out. Hovering its tile lights the partner
        // (`MiniTile`).
        <span className="card-flag paired" title="Paired (soulbond): its partner lights up while you hover this">
          {compact ? '∞' : 'paired'}
        </span>
      ) : null}
      {obj.saddled ? (
        <span className="card-flag saddled" title="Saddled until end of turn: its abilities that work while it's saddled apply">
          {compact ? 'Sdl' : 'saddled'}
        </span>
      ) : null}
      {obj.ringBearer ? (
        <span
          className="card-flag ring"
          title="Ring-bearer: it's legendary and can't be blocked by creatures with greater power — the Ring emblem says what else"
        >
          {compact ? 'Ring' : 'Ring-bearer'}
        </span>
      ) : null}
      {obj.preparedSpell !== undefined ? (
        <span
          className="card-flag prepared"
          title="Prepared: its controller may cast a copy of its spell — open its menu. Doing so unprepares it."
        >
          {compact ? 'Prep' : 'prepared'}
        </span>
      ) : null}
      {level !== null ? (
        <span className="card-flag level" title={`Class level ${level}: it has the abilities of level ${level} and below`}>
          {compact ? `Lv ${level}` : `level ${level}`}
        </span>
      ) : null}
      {chosen !== null ? (
        <span className="card-flag chosen" title={`Chosen as it entered: ${chosen}`}>
          {compact ? chosen : `chose ${chosen}`}
        </span>
      ) : null}
      {held > 0 ? (
        <span
          className="card-flag holding"
          title={`Holding ${held} card${held === 1 ? '' : 's'} in exile — hover to see`}
        >
          {compact ? `Ex ${held}` : `${held} exiled`}
        </span>
      ) : null}
    </span>
  )
}
