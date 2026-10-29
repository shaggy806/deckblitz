import { Suspense, lazy, useCallback, useEffect, useLayoutEffect, useMemo, useRef, useState } from 'react'
import type { CSSProperties, ReactNode } from 'react'
import type {
  Action,
  CastVia,
  GraveyardGrant,
  LegalAction,
  ManaType,
  ObjectId,
  PlayerId,
  PlayerView,
  TapCostOffer,
  TargetCountRange,
  TargetFacts,
  TargetRef,
  TargetSpec,
  VisibleObject,
  WaterbendOffer,
} from 'engine/client'
import {
  anyNumberSlot,
  attackingViolations,
  blockingViolations,
  concatModeSpecs,
  damageAssignmentViolations,
  describeTargetSpec,
  distinctTargetCount,
  fitsTogether,
  groupBounds,
  groupPowerExceeded,
  isOptionalSpec,
  manaValue,
  parseManaCost,
  publicNameAt,
  rangeTargetCount,
  slotOptions,
  specsAtX,
  defaultAssignment,
  tapPicksPower,
  targetCountAtX,
  waterbendAt,
} from 'engine/client'
import type { SeatStatus } from 'protocol'
import { useNetworkGame } from './net/useNetworkGame.ts'
import type { BlitzReport, NetworkGame } from './net/useNetworkGame.ts'
import { rematchOffer } from './net/rematch.ts'
import type { RematchOffer } from './net/rematch.ts'
import { stackShowsSomething } from './game/decisionSource.ts'
import { fitWidth } from './game/boardFit.ts'
import { waitingLabel } from './game/waitingLabel.ts'
import { gameStats } from './game/gameStats.ts'
import { cueLengthMs, playSound } from './game/sound.ts'
import { useMusic } from './game/music.ts'
import { mulliganLive, tableActions } from './game/tableActions.ts'
import { abilitiesBySource as abilitiesBySourceOf } from './game/abilityMenu.ts'
import type { AbilityAction } from './game/abilityMenu.ts'
import { useEscape } from './ui/useEscape.ts'
import { computeBoardEntries } from './game/board.ts'
import { applyBoardOrder } from './game/boardOrder.ts'
import { useBoardDrag, type BoardDragControls } from './game/useBoardDrag.ts'
import { aimedEntry, useResolveState } from './game/resolveAims.ts'
import type { ResolveAims } from './game/resolveAims.ts'
import { Symbols } from './ui/Symbols.tsx'
import type { BoardEntry } from './game/board.ts'
import { blockPairs, freeBlocker, leastBlocked, setPairCount } from './game/blockGroups.ts'
import { attackPairs, freeAttacker, setAttackPairCount } from './game/attackGroups.ts'
import {
  collapseAttacks,
  blockEntries,
  collapseBlocks,
  extraBlocks,
  expandAttackOffer,
  expandBlockOffer,
  expandIds,
  realId,
} from './game/stackMembers.ts'
import type { Members } from './game/stackMembers.ts'
import { CountStepper } from './ui/CountStepper.tsx'
import {
  addToGroup,
  clickMembers,
  deathCount,
  groupBlockers,
  lethalCount,
  setGroupTotal,
  spareOne,
  survivorsOf,
  totalOf,
  unassigned,
} from './game/damageAssignment.ts'
import { setShare } from './game/divideShares.ts'
import { StableLabel } from './ui/StableLabel.tsx'
import { usePlayback } from './game/usePlayback.ts'
import { AnimationBus } from './game/animationBus.ts'
import { describeEvent, isDetailOnlyEvent, playerLabel, seatClassOf, withNames } from './format.ts'
import { PhaseTrack } from './ui/PhaseTrack.tsx'
import { TurnBanner } from './ui/TurnBanner.tsx'
import { AnimationLayer } from './ui/AnimationLayer.tsx'
import { ArrowLayer } from './ui/ArrowLayer.tsx'
import { highlightEvent } from './ui/highlight.ts'
import { SeatMenu } from './ui/SeatMenu.tsx'
import { TriggerOrder } from './ui/TriggerOrder.tsx'
import { usePassSettings } from './game/passSettings.ts'
import { MotionControl } from './ui/MotionControl.tsx'
import { PlayerPanel } from './ui/PlayerPanel.tsx'
import { CardTile } from './ui/CardTile.tsx'
import { MiniTile } from './ui/MiniTile.tsx'
import { KeywordTips } from './ui/KeywordTips.tsx'
import { OtherFace } from './ui/OtherFace.tsx'
import { CommanderTile } from './ui/CommanderTile.tsx'
import { AbilityMenu } from './ui/AbilityMenu.tsx'
import { Stack } from './ui/Stack.tsx'
import { EventLog } from './ui/EventLog.tsx'
import { CapturePanel } from './ui/CapturePanel.tsx'
import { ZoneViewer } from './ui/ZoneViewer.tsx'
import { PileViewer } from './ui/PileViewer.tsx'
import { DungeonViewer } from './ui/DungeonViewer.tsx'
import { emblemToVisible } from './ui/defToVisible.ts'
import { CreatureTypePicker } from './ui/CreatureTypePicker.tsx'
import { carryHover } from './ui/hoverCarry.ts'
import { handPlacesBefore, slideHand } from './ui/handMotion.ts'
import { watchHandSweep } from './ui/handSweep.ts'
import { motionPrefs } from './game/motionPrefs.ts'
import { LibraryTopCard } from './ui/LibraryTopCard.tsx'
import { SeatBoard } from './lobby/SeatBoard.tsx'
import { LandingScreen } from './lobby/LandingScreen.tsx'
import { CornerToolbar } from './ui/CornerToolbar.tsx'
import { CoachLayer } from './tutorial/CoachLayer.tsx'
import type { PageId } from './tutorial/types.ts'
import { lessonAnchor } from './tutorial/anchors.ts'
import { lessonUrl, useLessonCoach } from './tutorial/lesson.ts'
import type { LessonControls } from './tutorial/lesson.ts'
import { InviteLink } from './lobby/InviteLink.tsx'
import './App.css'

// Symmetric fan for the hand tray (P8): card i's offset from the hand's
// center is i - (N-1)/2; rotation and lift both scale off that same offset,
// so the fan stays symmetric regardless of hand size. Always applied,
// including the collapsed peek (priority mode, not raised) and the mulligan
// popup -- the hand should read as the same tray whether it's peeking,
// raised, or shown inside a decision popup, not switch between a flat and a
// fanned look depending on which.
const HAND_FAN_STEP_DEG = 4.4
const HAND_FAN_STEP_Y = 5.2
// The per-card step above is tuned against the mockup's own tested range (up
// to 14 cards -- see the mockup source linked from BOARD_REDESIGN_PLAN.md), where the
// outermost card lands well under these caps and nothing here changes
// anything. Applied unscaled, a hand bigger than that (draw effects easily
// push a hand past 14-20 before a discard step) grows the outermost card's
// rotation without bound -- past ~20 cards the edges approach 90 degrees and
// stop reading as a fan at all. These caps bound the *total sweep*, not each
// card's own rotation, so a large hand compresses its per-card step instead
// of blowing past a sane maximum -- same "shrink only once actually needed"
// shape as HAND_CARD_GAP's overlap floor below.
const HAND_FAN_MAX_ROT_DEG = 32
const HAND_FAN_MAX_LIFT_PX = 38

// The hand row never wraps to a second line and never shrinks card width
// below its normal --card-w size -- once N cards no longer fit the row at
// their natural width and this default gap, cards overlap (a shrinking, even
// negative, margin-left) instead. cw is measured from an actual rendered
// card (not a duplicated copy of --card-w's clamp() bounds), so this stays
// correct if that token ever changes. -cw*0.82 caps how far cards can
// overlap so at least a sliver of each stays visible in a huge hand.
const HAND_CARD_GAP = 8
const HAND_OVERLAP_FLOOR = 0.82

// Past this many cards the fan stops being a way to pick one. Measured at
// 1366x768: 32 cards leaves each one a 24px sliver of its 122px width, and
// hovering to check a card scales it 1.65x over the neighbour you were
// aiming at. The grid ("All cards") is always available; this is only the
// point at which it stops being worth hiding.
const HAND_GRID_THRESHOLD = 12

// Battlefield tiles are sized to the board they sit on: as wide as that
// board's share of its quadrant allows, wrapping to as many rows as that
// width needs (multiple rows of creatures is normal, same as a physical
// table), so a sparse board's permanents grow into the room they have and a
// crowded one's shrink. See recomputeBoardMiniW below. The ceiling is a card
// in hand's own width, and lives in App.css's `.board` rule rather than here.
// Below this floor a tile stops shrinking and the board's own scroll
// (already there regardless -- .quadrant-body's overflow-y:auto) takes over.
const MINI_SHRINK_FLOOR = 40

/** The tile width each seat's board last settled on: where its next search
 * starts (`recomputeBoardMiniW`). Kept out here because `Table` remounts with
 * every frame shown. Only ever a starting guess — the search checks it — so a
 * width left from another game costs a full search at worst. */
const boardFitWidths = new Map<PlayerId, number>()
/** What each seat's board was fitted for (its room and its rows): the same
 * again, and its width stands without a search. */
const boardFitKeys = new Map<PlayerId, string>()

// A stable reference (not `[]` inline at each use) so passing it as `Table`'s
// `actions` prop while `useDelayedView` reports `busy` doesn't itself count
// as a changed prop across re-renders.
const EMPTY_ACTIONS: readonly LegalAction[] = []

type CastAction = Extract<LegalAction, { kind: 'cast-spell' }>
type ConvokeOffer = NonNullable<CastAction['convoke']>

/** A button label for one way of playing a card from a graveyard or exile.
 * The tile above already names the card, so the label says only what tells
 * this way apart from the others: the permanent type a Muldrotha-style
 * allowance spends, the face, and — when more than one permanent grants the
 * card — which one this uses. */
function graveyardVariantLabel(
  a: CastAction | LandAction,
  view: PlayerView,
  showSource: boolean,
): string {
  const verb = a.kind === 'play-land' ? 'Play' : 'Cast'
  const parts: string[] = []
  const grant = a.graveyardGrant
  if (grant?.asType !== undefined) parts.push(`as ${grant.asType}`)
  if (showSource && grant !== undefined && grant.source !== a.card) {
    const source = view.objects[grant.source]?.cardName
    if (source !== undefined) parts.push(`via ${source}`)
  }
  if (a.kind === 'cast-spell') {
    if (a.via !== undefined && a.via !== 'graveyard-permission') parts.push(a.via === 'flashback' && a.altCostText !== undefined ? a.altCostText : a.via)
    if (a.kicked) parts.push(`${a.kickerKeyword ?? 'kicked'} ${a.kickerCost ?? ''}`.trim())
    if (a.xCost?.minX !== undefined && a.xCost.minX === a.xCost.maxX) parts.push(`X=${a.xCost.maxX}`)
    if (a.prototype) parts.push(`prototype ${a.prototypeCost ?? ''}`.trim())
    if (a.offspring) parts.push(`offspring ${a.offspringCost ?? ''}`.trim())
    if (a.splice) parts.push(`splicing ${a.splice.map((s) => `${s.cardName} ${s.cost}`).join(' and ')}`)
    if (a.evoke) parts.push(a.altCostText !== undefined ? `evoke: ${a.altCostText}` : `evoke ${a.evokeCost ?? ''}`.trim())
    if (a.altCost && a.altCostText !== undefined) parts.push(a.altCostText)
    if (a.harmonizeTap) parts.push(`tapping ${a.harmonizeTap.cardName} (−${a.harmonizeTap.power})`)
    if (a.sneakReturn) parts.push(`returning ${a.sneakReturn.cardName}`)
    if (a.webSlingingReturn) parts.push(`returning ${a.webSlingingReturn.cardName}`)
  }
  return parts.length > 0 ? `${verb} ${parts.join(', ')}` : verb
}

/** The "which variant of this cast" fields a `cast-spell` action carries all
 * the way from `legalActions` back into the dispatched action. */
const castExtras = (cast: CastAction) => ({
  ...(cast.via !== undefined ? { via: cast.via } : {}),
  ...(cast.face !== undefined ? { face: cast.face } : {}),
  ...(cast.kicked === true ? { kicked: true } : {}),
  ...(cast.kickCount !== undefined ? { kickCount: cast.kickCount } : {}),
  ...(cast.prototype === true ? { prototype: true } : {}),
  ...(cast.offspring === true ? { offspring: true } : {}),
  ...(cast.evoke === true ? { evoke: true, evokeCost: cast.evokeCost } : {}),
  ...(cast.overload === true ? { overload: true } : {}),
  ...(cast.free === true ? { free: true } : {}),
  // Each is a variant of its own too: without the flag the engine reads the
  // cast as the ordinary one (Sephara at its full cost), and a choice of
  // additional costs that names no branch is refused outright.
  ...(cast.altCost === true ? { altCost: true } : {}),
  ...(cast.costOption !== undefined ? { costOption: cast.costOption } : {}),
  // Splice (rule 702.47): the offer names the cards; the cast echoes their ids.
  ...(cast.splice !== undefined ? { splice: cast.splice.map((s) => s.object) } : {}),
  // Which graveyard permission pays for it, when several could.
  ...(cast.graveyardGrant !== undefined ? { graveyardGrant: cast.graveyardGrant } : {}),
  ...(cast.tapCost !== undefined ? { tapCost: cast.tapCost } : {}),
  // A harmonize variant's creature to tap (rule 702.180a): its own offer.
  ...(cast.harmonizeTap !== undefined ? { tap: [cast.harmonizeTap.object] } : {}),
  // A sneak variant's creature to return (rule 702.190a): its own offer.
  ...(cast.sneakReturn !== undefined ? { sneakReturn: cast.sneakReturn.object } : {}),
  // A web-slinging variant's tapped creature to return (rule 702.188a): its own offer.
  ...(cast.webSlingingReturn !== undefined ? { webSlingingReturn: cast.webSlingingReturn.object } : {}),
  // "4 damage divided as you choose" (Magma Opus): asked once the targets are in.
  ...(cast.divide !== undefined ? { divide: cast.divide } : {}),
  ...(cast.phyrexianPips !== undefined ? { phyrexianPips: cast.phyrexianPips } : {}),
  // Not echoed either: how many distinct targets are affordable, which the
  // targeting steps keep inside (`currentSlotOptions`).
  ...(cast.targetCount !== undefined ? { targetCount: cast.targetCount } : {}),
  // Not `escapeExile`: that's an offer to pick from, not a field to echo.
  // `startCast` asks for the picks and carries them as `CastPicks`.
  ...(cast.convoke !== undefined && cast.convoke.candidates.length > 0
    ? { convokeOffer: cast.convoke }
    : {}),
  // What may tap for a waterbend part of the cost (rule 701.67a): asked
  // once the targets are in, at the X chosen.
  ...(cast.waterbend !== undefined && cast.waterbend.choices.length > 0
    ? { waterbendOffer: cast.waterbend }
    : {}),
})

/** The costs of a cast already chosen before its modes / X / targets, carried
 * through each of those steps into the dispatched action: the permanent an
 * additional sacrifice cost takes (rule 601.2f — Harrow), and the cards an
 * escape cast exiles from the graveyard (rule 702.139a). */
interface CastPicks {
  readonly sacrifice?: ObjectId
  readonly escapeExile?: readonly ObjectId[]
  /** The graveyard cards delve exiles (rule 702.66a), each paying {1}. */
  readonly delve?: readonly ObjectId[]
  /** A modal spell's chosen modes (rule 601.2b: announced before X), so its
   * targets are theirs at the X chosen. */
  readonly modes?: readonly number[]
}

/** Every permanent a tap-cost offer stands for, a stack's id once per token
 * — the whole offer, for when there's exactly as much as the cost needs. */
const allTapChoices = (offer: TapCostOffer): ObjectId[] =>
  offer.choices.flatMap((id) => Array<ObjectId>(offer.copies?.[id] ?? 1).fill(id))

/** "Sacrifice a land", "Sacrifice another creature" — the thing an ability's
 * sacrifice cost names, as printed. */
const SACRIFICE_CLAUSE = /\bSacrifice (?:an? |another )([^,:.]+?)(?=[,:.]|$)/i
/** What a sacrifice cost asks for, for its prompt: the ability's own words
 * when it prints them (Hearthhull's "a land"), otherwise the type every
 * choice shares (a spell's additional cost), otherwise "permanent". */
function sacrificeNoun(
  action: AbilityAction | CastAction,
  view: PlayerView,
  choices: readonly ObjectId[],
): string {
  const printed = action.kind === 'activate-ability' ? SACRIFICE_CLAUSE.exec(action.text)?.[1] : undefined
  if (printed !== undefined) return printed
  for (const type of ['land', 'creature', 'artifact', 'enchantment', 'planeswalker'] as const) {
    if (choices.length > 0 && choices.every((id) => view.objects[id]?.types.includes(type))) return type
  }
  return 'permanent'
}
type LandAction = Extract<LegalAction, { kind: 'play-land' }>
type SuspendAction = Extract<LegalAction, { kind: 'suspend' }>
type ForetellAction = Extract<LegalAction, { kind: 'foretell' }>
type PlotAction = Extract<LegalAction, { kind: 'plot' }>
type CycleAction = Extract<LegalAction, { kind: 'cycle' }>
type AttackAction = Extract<LegalAction, { kind: 'declare-attackers' }>
type EnterAttackingAction = Extract<LegalAction, { kind: 'enter-attacking' }>
type BlockAction = Extract<LegalAction, { kind: 'declare-blockers' }>
type DiscardAction = Extract<LegalAction, { kind: 'discard' }>
type ZoneChoiceAction = Extract<LegalAction, { kind: 'choose-from-zone' }>
type MulliganAction = Extract<LegalAction, { kind: 'mulligan' }>
type BottomAction = Extract<LegalAction, { kind: 'put-on-bottom' }>
type CommanderChoiceAction = Extract<LegalAction, { kind: 'commander-replacement' }>
type ShockChoiceAction = Extract<LegalAction, { kind: 'pay-life-for-untapped' }>
type MiracleChoiceAction = Extract<LegalAction, { kind: 'miracle-reveal' }>
type RevealChoiceAction = Extract<LegalAction, { kind: 'reveal-for-untapped' }>
type CopyChoiceAction = Extract<LegalAction, { kind: 'choose-copy' }>
type EnchantChoiceAction = Extract<LegalAction, { kind: 'choose-enchant' }>
type LegendRuleAction = Extract<LegalAction, { kind: 'legend-rule' }>
type TriggerOrderAction = Extract<LegalAction, { kind: 'order-triggers' }>
type CreatureTypeChoiceAction = Extract<LegalAction, { kind: 'choose-creature-type' }>
type CardNameChoiceAction = Extract<LegalAction, { kind: 'choose-card-name' }>
type ModesChoiceAction = Extract<LegalAction, { kind: 'choose-modes' }>
type SacrificeAction = Extract<LegalAction, { kind: 'sacrifice' }>
type ProliferateAction = Extract<LegalAction, { kind: 'proliferate' }>
type SplitManaAction = Extract<LegalAction, { kind: 'split-mana' }>
type TimeTravelAction = Extract<LegalAction, { kind: 'time-travel' }>
type RemoveCountersAction = Extract<LegalAction, { kind: 'remove-counters' }>

/**
 * A click on a permanent while choosing counters to remove: one more of its
 * first kind with room left, within the offer's `max`, its `perObject` and,
 * for `single`, only this permanent's (another's picks give way). With no
 * room left on it, its picks are cleared — a second click undoes.
 */
function nextCounterPick(
  offer: RemoveCountersAction,
  picks: Readonly<Record<string, number>>,
  id: string,
): Readonly<Record<string, number>> {
  const entry = offer.eligible.find((e) => e.object === id)
  if (entry === undefined) return picks
  const mine = (key: string): boolean => key.startsWith(`${id}|`)
  const base =
    offer.single === true ? Object.fromEntries(Object.entries(picks).filter(([key]) => mine(key))) : { ...picks }
  const sum = Object.values(base).reduce((n, c) => n + c, 0)
  const share = Object.entries(base)
    .filter(([key]) => mine(key))
    .reduce((n, [, c]) => n + c, 0)
  const kind = Object.entries(entry.counters).find(
    ([k, has]) => (base[`${id}|${k}`] ?? 0) < has,
  )?.[0]
  if (kind === undefined || sum >= offer.max || (offer.perObject !== undefined && share >= offer.perObject)) {
    return Object.fromEntries(Object.entries(base).filter(([key]) => !mine(key)))
  }
  return { ...base, [`${id}|${kind}`]: (base[`${id}|${kind}`] ?? 0) + 1 }
}
type VentureAction = Extract<LegalAction, { kind: 'venture' }>
type ChoosePermanentsAction = Extract<LegalAction, { kind: 'choose-permanents' }>
type SeparatePilesAction = Extract<LegalAction, { kind: 'separate-piles' }>
type ChoosePileAction = Extract<LegalAction, { kind: 'choose-pile' }>
type ScryAction = Extract<LegalAction, { kind: 'scry' }>
type CastNowAction = Extract<LegalAction, { kind: 'cast-now' }>
type AssignDamageAction = Extract<LegalAction, { kind: 'assign-combat-damage' }>
type ChooseTargetsAction = Extract<LegalAction, { kind: 'choose-targets' }>

/** What a `choose-from-zone` popup asks: where the chosen cards go, and for
 * cards going back on top, that the order picked is the order they go. */
function zoneChoiceTitle(action: ZoneChoiceAction, nameOf: (player: PlayerId) => string): string {
  const n = action.max === action.min ? `${action.max}` : `up to ${action.max}`
  const together = action.together
  // A rule over the set says what to pick: "up to 2 cards that share a land
  // type", "a Forest card and a Plains card".
  const cards =
    together?.rule === 'one-each'
      ? together.text
      : `${action.max === 1 ? 'a card' : `${n} cards`}${together ? ` ${together.text}` : ''}`
  if (action.split === true) return `Choose ${cards}`
  // Rule 103.6a, before turn 1: the Leylines in an opening hand, or the
  // Chancellors to reveal from it (rule 103.6b).
  if (action.openingHand === true && action.destination === 'reveal') return 'Opening hand: choose any of these to reveal'
  if (action.openingHand === true) return 'Opening hand: choose any of these to begin the game with on the battlefield'
  // Choosing for someone else (Tasigur: an opponent picks for its controller),
  // or from their zones (a search of target opponent's library — Extract).
  const whose = action.forPlayer === undefined ? 'your' : `${nameOf(action.forPlayer)}'s`
  // "All cards with that name": the graveyard's are found whatever is picked
  // (rule 701.23b).
  const also = action.alsoTaken && action.alsoTaken.length > 0
    ? ` — the ${action.alsoTaken.length} in the graveyard go too`
    : ''
  const from = action.forPlayer === undefined ? '' : ` from ${whose} cards`
  switch (action.destination) {
    case 'hand':
      return `Choose ${cards} to put into ${whose} hand`
    case 'battlefield':
      return `Choose ${cards}${from} to put onto the battlefield${action.forPlayer === undefined ? '' : ' under your control'}`
    case 'graveyard':
      return `Choose ${cards} to put into ${whose} graveyard`
    case 'library-top':
      return 'Put them back on top in the order you pick: the first you pick goes on top'
    case 'library-bottom':
      // The order picked is the order they go: the last one picked ends up
      // on the very bottom.
      return action.order === true
        ? 'Put them on the bottom in the order you pick: the last you pick goes on the very bottom'
        : `Choose ${cards} to put on the bottom of your library, in order: the last you pick goes on the very bottom`
    case 'exile':
      // "Behold an Elf and exile it" (the Champions, rule 701.4a).
      return action.behold === true
        ? `Behold and exile ${cards} — from your hand or a permanent you control`
        : `Choose ${cards}${from} to exile${also}`
    case 'exile-playable':
      return `Choose ${cards} you may play`
    case 'exile-face-down':
      return `Choose ${cards}${from} to exile face down`
    case 'stay':
      // Knowledge Exploitation: the find is offered to cast where it is.
      return `Choose ${cards}${from}`
    case 'behold':
      // Behold (rule 701.4a): nothing moves — a hand card is revealed, a
      // permanent is just pointed at.
      return `Choose ${cards} to behold — reveal it from your hand or pick a permanent you control`
    case 'reveal':
      // "Reveal any number of green cards in your hand" (the Scents): they
      // stay in hand.
      return `Choose any number of cards to reveal from your hand`
    case 'discard':
      // "Look at target player's hand" (Glasses of Urza): nothing to pick.
      if (action.max === 0) return `Looking at ${whose} hand`
      // "You choose a card from it. That player discards that card" (Duress).
      return `Choose ${cards} from ${whose} hand for them to discard`
    case 'manifest':
      // Manifest dread (rule 701.62a): the rest go to the graveyard.
      return `Manifest dread: choose ${cards} to put onto the battlefield face down as a 2/2 — the rest go to your graveyard`
  }
}

/** Whether one board permanent is a legal proliferate choice right now. */
const eligibleToProliferate = (action: ProliferateAction, id: ObjectId): boolean =>
  action.eligible.some((t) => t.kind === 'object' && t.object === id)

interface Targeting {
  readonly kind: 'cast' | 'activate' | 'choose-targets'
  readonly source: ObjectId
  readonly abilityIndex: number
  readonly label: string
  readonly specs: readonly TargetSpec[]
  readonly options: readonly (readonly TargetRef[])[]
  /** One entry per slot filled so far; `null` is an optional slot the player
   * chose to skip ("up to one target creature"). */
  readonly picked: readonly (TargetRef | null)[]
  /** The cast or ability divides `total` among the targets from slot `slot`
   * on (rules 601.2d, 603.3d — Magma Opus, Dragonlord Atarka): asked once
   * they're chosen, before it goes out. */
  readonly divide?: {
    readonly total: number
    readonly slot: number
    readonly of?: string
    readonly x?: true
    readonly upTo?: true
  }
  /** How many of its cost's Phyrexian pips could be paid with 2 life each
   * (rule 107.4f): asked once the targets are in, before it goes out. */
  readonly phyrexianPips?: number
  /** New targets for a copy of a spell (Twincast, Shiko and Narset): the
   * target each slot has now, which a Keep button takes — it may not be on
   * the board to click any more. */
  readonly current?: readonly TargetRef[]
  /** What a relation among the targets reads — who controls one, its power
   * ("controlled by different players", "total power 10 or less") — off the
   * view the choice began on (`viewTargetFacts`). */
  readonly facts?: TargetFacts
  /** Chosen modes for a targeted modal spell (Phase 11 EG-2). */
  readonly modes?: readonly number[]
  /** Chosen value for `{X}`, when casting an X spell. */
  readonly xValue?: number
  /** Permanent chosen to pay a "sacrifice a creature you control" ability cost. */
  readonly sacrifice?: ObjectId
  /** The other graveyard cards an escape cast exiles (rule 702.139a), picked
   * from the variant's `escapeExile` offer before any of this — see
   * `pendingEscape`. */
  readonly escapeExile?: readonly ObjectId[]
  /** The graveyard cards delve exiles (rule 702.66a), picked from the
   * variant's `delve` offer — see `pendingDelve`. */
  readonly delve?: readonly ObjectId[]
  /** Alternative casting permission (Phase 6) — flashback / escape / foretell. */
  readonly via?: CastVia
  /** Which face of a multi-face card is being cast (Phase 10). */
  readonly face?: number
  /** Casting this for its kicker cost (rule 702.33 — P8). The engine offers
   * kicked and unkicked as separate `cast-spell` actions; this just echoes
   * which one the player picked. */
  readonly kicked?: boolean
  /** How many times a multikicker is paid (rule 702.33c) — echoed like `kicked`. */
  readonly kickCount?: number
  /** A prototyped cast (rule 718) — echoed back like `kicked`. */
  readonly prototype?: boolean
  /** Paying a granted offspring cost too (Zinnia) — echoed back like `kicked`. */
  readonly offspring?: boolean
  /** Casting this for its evoke cost (rule 702.74) — echoed back like `kicked`,
   * with which evoke cost when it has more than one. */
  readonly evoke?: boolean
  readonly evokeCost?: string
  /** Casting this for its overload cost (rule 702.126) instead of its mana
   * cost — no targets are chosen for this variant. */
  readonly overload?: boolean
  /** Casting this for free under a `CardDefinition.freeCastIf` permission
   * instead of paying the mana cost. Targets are unchanged. */
  readonly free?: boolean
  /** The colour(s) picked for an "add one mana of any color" ability. The
   * engine lists one action per colour, so this just echoes which one. */
  readonly manaColors?: readonly ManaType[]
  /** Casting for the card's alternative cost (Sephara) — its own variant,
   * echoed back like `kicked`. */
  readonly altCost?: boolean
  /** The branch of a choice of additional costs this variant pays (Bitter
   * Triumph's "discard a card or pay 3 life"), echoed back. */
  readonly costOption?: number
  /** The cards spliced onto this cast (rule 702.47) — echoed back like `kicked`. */
  readonly splice?: readonly ObjectId[]
  /** The graveyard permission this cast spends (Muldrotha's type, which
   * grantor), echoed back. */
  readonly graveyardGrant?: GraveyardGrant
  /** A "tap N untapped … you control" cost still to pick for, once the
   * targets are in — see `pendingTap`. */
  readonly tapCost?: TapCostOffer
  /** A harmonize cast's creature to tap (rule 702.180a), echoed back as the
   * cast's `tap`. */
  readonly tap?: readonly ObjectId[]
  /** A sneak cast's unblocked creature to return (rule 702.190a), echoed
   * back as the cast's `sneakReturn`. */
  readonly sneakReturn?: ObjectId
  /** A web-slinging cast's tapped creature to return (rule 702.188a),
   * echoed back as the cast's `webSlingingReturn`. */
  readonly webSlingingReturn?: ObjectId
  /** A convoke spell's creatures still to pick, once the targets are in —
   * see `pendingConvoke`. */
  readonly convokeOffer?: ConvokeOffer
  /** What may tap to pay a waterbend cost — a spell's or an ability's —
   * still to pick, once the targets are in — see `pendingWaterbend`. */
  readonly waterbendOffer?: WaterbendOffer
  /** How many distinct targets the cast is affordable with, under a "for
   * each target" cost (Hinata, Dawn-Crowned) — see `currentSlotOptions`. */
  readonly targetCount?: TargetCountRange
}

/** In a choice of one player (a `choose-modes` whose modes each name one —
 * "choose an opponent", a gift's opponent), the mode `pid`'s panel picks, so
 * the player is picked on the board as well as by the banner's buttons. */
function modePlayerIndex(
  action: ModesChoiceAction | undefined,
  mode: string,
  pid: PlayerId,
): number | null {
  if (mode !== 'choose-modes' || action === undefined || action.maxModes !== 1) return null
  const i = action.modePlayers?.indexOf(pid) ?? -1
  return i >= 0 ? i : null
}

/**
 * The options for the slot being filled: what `slotOptions` allows ("another
 * target" leaves out what an earlier slot took), less any that would leave
 * the cast unaffordable. Under a "for each target" cost only some numbers of
 * distinct targets are payable (`targetCount`), so an option that takes the
 * count past the most, or leaves too few slots to reach the fewest, is out.
 */
function currentSlotOptions(t: Targeting): readonly TargetRef[] {
  const i = t.picked.length
  const options = slotOptions(t.specs, t.options, i, t.picked, t.facts)
  const range = t.targetCount
  if (range === undefined) return options
  // Inside an "any number of" group, the fewest is Done's to check
  // (`mayFinishGroup`): another member never takes the count away from it.
  if (inTargetGroup(t)) {
    return options.filter((ref) => rangeTargetCount([...t.picked, ref], range) <= range.max)
  }
  // A range of an X group's members (`from` — Spinning Wheel Kick): the
  // slots before the group are outside it.
  if (range.from !== undefined) return options
  const later = t.specs.length - i - 1
  return options.filter((ref) => {
    const n = distinctTargetCount([...t.picked, ref], range.copies)
    return n <= range.max && n + later >= range.min
  })
}

/** Who controls an object, its power and its mana value, as the view shows
 * them — a creature card's in a graveyard too — for a relation among
 * targets. */
const viewTargetFacts = (view: PlayerView): TargetFacts => ({
  controllerOf: (ref) => (ref.kind === 'object' ? view.objects[ref.object]?.controller : undefined),
  powerOf: (ref) => (ref.kind === 'object' ? (view.objects[ref.object]?.power ?? 0) : 0),
  manaValueOf: (ref) => {
    const cost = ref.kind === 'object' ? view.objects[ref.object]?.manaCost : null
    return cost === null || cost === undefined ? 0 : manaValue(parseManaCost(cost))
  },
})

/** Whether the next pick is another member of an "any number of target …"
 * group — always the last slot, and every pick past its start. */
function inTargetGroup(t: Pick<Targeting, 'specs' | 'picked'>): boolean {
  const group = anyNumberSlot(t.specs)
  return group >= 0 && t.picked.length >= group
}

/** Whether an "any number of" group may end with what's picked: at least
 * its fewest ("exile X target creatures" — Curse of the Swine, its specs
 * fixed at the X chosen), and the fewest distinct targets the cast allows. */
function mayFinishGroup(t: Pick<Targeting, 'specs' | 'picked' | 'targetCount'>): boolean {
  const group = anyNumberSlot(t.specs)
  if (group < 0) return true
  if (t.picked.length - group < groupBounds(t.specs[group]).min) return false
  const range = t.targetCount
  return range === undefined || rangeTargetCount(t.picked, range) >= range.min
}

/** The spec the next pick fills: the group's, once inside it. */
function currentSpec(t: Pick<Targeting, 'specs' | 'picked'>): TargetSpec | undefined {
  const group = anyNumberSlot(t.specs)
  return group >= 0 && t.picked.length >= group ? t.specs[group] : t.specs[t.picked.length]
}

/** Whether an optional slot may be skipped: not when the slots after it
 * could no longer reach the fewest distinct targets the cast is affordable
 * with. */
function maySkipSlot(t: Targeting): boolean {
  const range = t.targetCount
  if (range === undefined || range.from !== undefined) return true
  const later = t.specs.length - t.picked.length - 1
  return distinctTargetCount(t.picked, range.copies) + later >= range.min
}

/**
 * Whoever the engine is actually waiting on right now — a pending
 * declaration (attackers/blockers/discard/...) if there is one,
 * else the current priority holder. NOT the same as "my seat": each device
 * only ever represents one seat, so unlike the old hot-seat client, "my
 * seat" and "whoever must act" are frequently different players.
 */
function actingPlayer(view: PlayerView): PlayerId | null {
  if (view.awaiting !== null) return view.awaiting.player
  return view.priority.active ? view.priority.holder : null
}

const AWAITING_LABEL: Record<NonNullable<PlayerView['awaiting']>['kind'], string> = {
  attackers: 'declare attackers',
  blockers: 'declare blockers',
  discard: 'discard',
  'choose-from-zone': 'look at cards',
  mulligan: 'decide on a mulligan',
  'commander-replacement': 'decide where their commander goes',
  'pay-life-for-untapped': 'decide on a shock land',
  'miracle-reveal': 'decide on a miracle',
  'reveal-for-untapped': 'decide on a reveal land',
  'choose-copy': 'choose what to copy',
  'choose-enchant': 'choose what an Aura enchants',
  'legend-rule': 'choose which legend to keep',
  'order-triggers': 'order their triggers',
  'choose-creature-type': 'choose a creature type',
  'choose-card-name': 'choose a card name',
  'separate-piles': 'separate piles',
  'choose-pile': 'choose a pile',
  'choose-modes': 'choose a mode',
  'choose-targets': 'choose targets',
  'cast-now': 'decide whether to cast a spell',
  'assign-combat-damage': 'assign combat damage',
  sacrifice: 'choose what to sacrifice',
  proliferate: 'choose what to proliferate',
  'split-mana': 'choose their mana',
  'time-travel': 'time travel',
  'remove-counters': 'remove counters',
  'choose-permanents': 'choose permanents',
  'enter-attacking': 'choose what their creatures attack',
  scry: 'scry',
  venture: 'venture into the dungeon',
}
/** What happens to a pile (rule 700.3), in words — "into the hand". */
const PILE_FATE_TEXT: Record<SeparatePilesAction['fates']['chosen'], string> = {
  hand: 'goes into the hand',
  graveyard: 'goes into the graveyard',
  exile: 'is exiled',
  battlefield: 'goes onto the battlefield',
  lose: 'is lost',
  other: 'is affected',
}

/** "The chosen pile goes into the hand, the other into the graveyard." */
function pileFatesText(fates: SeparatePilesAction['fates']): string {
  return `the chosen pile ${PILE_FATE_TEXT[fates.chosen]}${
    fates.rest !== undefined ? `; the other ${PILE_FATE_TEXT[fates.rest]}` : ''
  }`
}

/** A colour named as a permanent enters ("As this Aura enters, choose a
 * color" — Flickering Ward, Utopia Sprawl) arrives as its letter. */
/** The five basic land types: a fixed menu of them is "choose a basic land
 * type" (Convincing Mirage as it enters, Tideshaper Mystic as it resolves). */
const BASIC_LAND_TYPES: ReadonlySet<string> = new Set(['Plains', 'Island', 'Swamp', 'Mountain', 'Forest'])

const COLOR_CHOICE_NAMES: Readonly<Record<string, string>> = {
  W: 'White',
  U: 'Blue',
  B: 'Black',
  R: 'Red',
  G: 'Green',
}
/** A hand ability's button: its text up to its reminder or its effect —
 * "Ninjutsu {1}{U}", "Channel — {1}{G}, Discard this card". */
function handAbilityLabel(text: string): string {
  return text.split(' (')[0].split(':')[0].trim()
}


export default function App() {
  const game = useNetworkGame()
  // Music in a room's lobby too (the user, 2026-10-10), here rather than in
  // its two screens so moving from one to the other doesn't fade it; it
  // carries on into the game, whose own `useMusic` takes over.
  useMusic(game.status === 'choosing-seat' || game.status === 'waiting-for-players')
  // A dev build hangs the newest board, its seat and the log's last lines
  // (worked out only when read) on `window`, for e2e/run-check.mjs.
  const { view, seat, nameOf, seats } = game
  useEffect(() => {
    if (!import.meta.env.DEV) return
    ;(window as Window & { deckblitzView?: unknown }).deckblitzView = {
      view,
      seat,
      get log() {
        return (view?.events ?? []).filter((e) => !isDetailOnlyEvent(e)).slice(-5).map((e) => describeEvent(e, nameOf, seats))
      },
    }
  }, [view, seat, nameOf, seats])

  return (
    <>
      <AppScreen game={game} />
      {/* The tutorials' coach marks, over whichever screen is up. */}
      <CoachLayer page={coachPageOf(game.status)} />
    </>
  )
}

/** Which of the tutorials' pages a connection status is. Connecting and
 * reconnecting count as the game: the layer stays quiet over them, and picks
 * a saved tour up once the landing page or the lobby is actually there. */
function coachPageOf(status: NetworkGame['status']): PageId {
  switch (status) {
    case 'no-room':
    case 'room-not-found':
      return 'landing'
    case 'choosing-seat':
    case 'waiting-for-players':
      return 'lobby'
    default:
      return 'game'
  }
}

type ShownStatus = Exclude<NetworkGame['status'], 'connecting' | 'disconnected'>

/**
 * The screen for the connection's status. A connection lost after it was
 * made keeps the last screen up, dimmed under a "Reconnecting…" box, rather
 * than swapping the whole page for one (the user, 2026-10-20): the board is
 * still what it was, and it's back the moment the socket is. A first visit
 * that never got through has no screen to keep.
 */
function AppScreen({ game }: { readonly game: NetworkGame }) {
  const [lastShown, setLastShown] = useState<ShownStatus | null>(null)
  const connected = game.status !== 'connecting' && game.status !== 'disconnected'
  // Remembered as it renders (React's "storing information from previous
  // renders"), so the first dimmed frame already has it.
  if (connected && lastShown !== game.status) setLastShown(game.status as ShownStatus)
  const held = connected ? null : lastShown

  if (!connected && held === null) {
    if (game.status === 'connecting') return <CenteredScreen title="Connecting…" />
    // A first visit that never got through fails exactly like a mid-game
    // drop — `onerror` then `onclose` — but telling someone who has only just
    // arrived that they "lost the connection" is untrue and reads as though
    // they broke something. The retry loop behind it is the same.
    return (
      <CenteredScreen title="Waiting for the server…">
        <p className="muted">
          The room server isn't answering yet. Still trying — this page will
          carry on by itself once it comes up.
        </p>
        <button type="button" onClick={game.reconnect}>
          Retry now
        </button>
      </CenteredScreen>
    )
  }
  return (
    <>
      <StatusScreen game={game} status={connected ? (game.status as ShownStatus) : (held as ShownStatus)} />
      {connected ? null : (
        <div className="overlay reconnect-overlay" role="alertdialog" aria-label="Reconnecting">
          <div className="overlay-box">
            <h2>Reconnecting…</h2>
            <p className="muted">Lost the connection to the room server — retrying automatically.</p>
            <button type="button" onClick={game.reconnect} disabled={game.status === 'connecting'}>
              Retry now
            </button>
          </div>
        </div>
      )}
    </>
  )
}

/** The screen for a connected status (or the last one, while reconnecting). */
function StatusScreen({ game, status }: { readonly game: NetworkGame; readonly status: ShownStatus }) {
  if (status === 'room-not-found') {
    return <LandingScreen game={game} notFound />
  }
  if (status === 'no-room') {
    return <LandingScreen game={game} />
  }
  if (status === 'choosing-seat') {
    return <SeatPickerScreen game={game} />
  }
  if (status === 'waiting-for-players') {
    return <WaitingForPlayersScreen game={game} />
  }
  // Keyed on the game, so a rematch starts the screen afresh: its playback
  // seeded from the new game's first frame rather than animating it as what
  // the old one did next, and none of the old game's panels left open.
  return <GameScreen key={game.gameNumber} game={game} />
}

function CenteredScreen({
  title,
  children,
}: {
  readonly title: string
  readonly children?: ReactNode
}) {
  return (
    <div className="overlay">
      <div className="overlay-box">
        <h2>{title}</h2>
        {children}
      </div>
    </div>
  )
}

/** How long an error sits on screen before clearing itself. Long enough to
 * read a sentence twice; short enough that a rejected click doesn't leave a
 * red bar over the board for the rest of the turn. */
/** How long a toast (a refusal, the highroll's news) stays up. App.css's
 * `.toast` fades it out over the last half second. */
const TOAST_LINGER_MS = 6000

/**
 * A rejected action, as a toast floating over the board rather than a bar in
 * the layout. Rendered inside a `.toast-stack`.
 *
 * It used to take its own row in normal flow, which meant every refused click
 * shoved the whole table down a line and left the message there until someone
 * clicked it. Now it hovers above everything, fades out on its own after
 * {@link TOAST_LINGER_MS}, and is still dismissible by clicking it.
 *
 * The timer and the node are both keyed on `errorSeq` as well as the
 * message, so the same error twice in a row restarts the clock and replays
 * the fade, rather than inheriting whatever the first one had left.
 */
function ErrorLine({ game }: { readonly game: NetworkGame }) {
  const { error, errorSeq, clearError } = game
  useEffect(() => {
    if (!error) return
    const t = window.setTimeout(clearError, TOAST_LINGER_MS)
    return () => window.clearTimeout(t)
  }, [error, errorSeq, clearError])
  if (!error) return null
  return (
    <div
      key={errorSeq}
      className="toast bad"
      onClick={clearError}
      role="alert"
      title="Click to dismiss"
    >
      ⚠ {withNames(error, game.seats, game.nameOf)}
    </div>
  )
}

/** How many stand-ins a blitz's notice names before "and N more". */
const BLITZ_REPORT_SHOWN = 6

/** How long a blitz's notice stays up: twice a toast's, for a list to read.
 * App.css's `.toast-long` fades it over the last half second. */
const BLITZ_REPORT_LINGER_MS = 12000

/**
 * What a blitz changed in the pasted list — the stand-ins for cards the
 * engine doesn't have yet, and any card with none — over the board as the
 * game opens, since a player should know they're not playing exactly their
 * list. It clears itself after {@link BLITZ_REPORT_LINGER_MS}, or on a click;
 * it used to stay until clicked, over the top of the board (a bug report,
 * 2026-10-21).
 */
function BlitzReportToast({ report, onDismiss }: { readonly report: BlitzReport; readonly onDismiss: () => void }) {
  useEffect(() => {
    const t = window.setTimeout(onDismiss, BLITZ_REPORT_LINGER_MS)
    return () => window.clearTimeout(t)
  }, [report, onDismiss])
  const { substituted, dropped } = report
  const shown = substituted.slice(0, BLITZ_REPORT_SHOWN)
  const more = substituted.length - shown.length
  const counts = [
    substituted.length > 0 ? `${substituted.length} stand-in${substituted.length === 1 ? '' : 's'}` : null,
    dropped.length > 0 ? `${dropped.length} card${dropped.length === 1 ? '' : 's'} left out` : null,
  ].filter((c) => c !== null)
  return (
    <div className="toast info toast-long blitz-report" role="status" onClick={onDismiss} title="Click to dismiss">
      <div>
        {report.deckName}: {counts.join(', ')}. Change them in the deck builder.
      </div>
      {shown.length > 0 ? (
        <div className="blitz-report-list">
          {shown.map((s) => `${s.from} → ${s.to}`).join(' · ')}
          {more > 0 ? ` · and ${more} more` : ''}
        </div>
      ) : null}
      {dropped.length > 0 ? <div className="blitz-report-list">No match: {dropped.join(', ')}</div> : null}
    </div>
  )
}

/** Who won the highroll (or who the host picked to go first), as the same toast a refusal is (in the accent
 * colours rather than the error's): over the board while the opening hands
 * are decided, gone on its own after {@link TOAST_LINGER_MS} or on a click. */
function HighrollToast({ onDismiss, children }: { readonly onDismiss: () => void; readonly children: ReactNode }) {
  useEffect(() => {
    const t = window.setTimeout(onDismiss, TOAST_LINGER_MS)
    return () => window.clearTimeout(t)
  }, [onDismiss])
  return (
    <div className="toast info" onClick={onDismiss} role="status" title="Click to dismiss">
      {children}
    </div>
  )
}

/**
 * The end of the game, as its own panel over the final board: who won and
 * how, and what next. It used to be one line in the bottom-right corner
 * ("Bob wins · last player remaining"), easy to miss after a concede, with
 * nowhere to go from it. The way on is the main menu, or a rematch in the
 * same room (`rematchOffer`): the host deals it, and everyone else is carried
 * into it, told meanwhile who they're waiting on.
 */
function GameResultPanel({
  view,
  seat,
  seats,
  onDismiss,
  offer,
  onRematch,
  rematchAsked,
}: {
  readonly view: PlayerView
  readonly seat: PlayerId
  readonly seats: readonly SeatStatus[]
  readonly onDismiss: () => void
  readonly offer: RematchOffer | null
  readonly onRematch: () => void
  /** Asked, and neither dealt nor refused yet: one click deals one game. */
  readonly rematchAsked: boolean
}) {
  useEscape(onDismiss)
  const { winner, reason } = view.result
  const headline = winner === null ? 'Draw' : winner === seat ? 'You win!' : `${playerLabel(winner, seats)} wins`
  const seatClass = winner !== null && view.turnOrder.includes(winner) ? seatClassOf(view.turnOrder, winner) : ''
  const stats = useMemo(() => gameStats(view), [view])
  return (
    <div className="result-overlay" onClick={onDismiss}>
      <div className="result-box" role="dialog" aria-label="Game over" onClick={(e) => e.stopPropagation()}>
        <p className="result-kicker">Game over</p>
        <h2 className={`result-headline ${seatClass}`}>{headline}</h2>
        <p className="muted">
          {reason ? `${reason[0].toUpperCase()}${reason.slice(1)} · ` : ''}
          {stats.rounds !== undefined ? `${stats.rounds} round${stats.rounds === 1 ? '' : 's'}, ` : ''}
          {stats.turns} turn{stats.turns === 1 ? '' : 's'}
        </p>
        {/* Each player's game, winner first (game/gameStats.ts). */}
        <table className="result-stats">
          <thead>
            <tr>
              <th scope="col">Player</th>
              <th scope="col">Result</th>
              <th scope="col">Life</th>
              <th scope="col" title="Damage dealt to other players">Damage dealt</th>
              <th scope="col" title="Damage dealt to this player">Damage taken</th>
              <th scope="col">Life gained</th>
              <th scope="col">Spells cast</th>
              <th scope="col" title="Not counting the opening hand">Cards drawn</th>
            </tr>
          </thead>
          <tbody>
            {stats.players.map((p) => (
              <tr key={p.player} className={p.player === winner ? 'is-winner' : undefined}>
                <th scope="row" className={`result-player ${seatClassOf(view.turnOrder, p.player)}`}>
                  {playerLabel(p.player, seats)}
                  {p.player === seat ? <span className="muted"> (you)</span> : null}
                </th>
                <td title={p.out ? `${p.out.reason} (turn ${p.out.turn})` : undefined}>
                  {p.player === winner
                    ? 'Winner'
                    : p.out
                      ? p.out.round !== undefined
                        ? `Out, round ${p.out.round}`
                        : `Out, turn ${p.out.turn}`
                      : '—'}
                </td>
                <td>{p.life}</td>
                <td>{p.damageDealt}</td>
                <td>{p.damageTaken}</td>
                <td>{p.lifeGained}</td>
                <td>{p.spellsCast}</td>
                <td>{p.cardsDrawn}</td>
              </tr>
            ))}
          </tbody>
        </table>
        {offer?.kind === 'waiting' ? (
          <p className="muted result-waiting" role="status">
            Waiting for {offer.host === null ? 'the host' : playerLabel(offer.host, seats)} to rematch…
          </p>
        ) : null}
        <div className="result-actions">
          <button type="button" onClick={onDismiss}>
            View the board
          </button>
          <button
            type="button"
            className={offer?.kind === 'button' ? undefined : 'result-primary'}
            onClick={() => window.location.assign('/')}
          >
            Main menu
          </button>
          {offer?.kind === 'button' ? (
            <button type="button" className="result-primary" disabled={rematchAsked} onClick={onRematch}>
              {offer.label}
            </button>
          ) : null}
        </div>
      </div>
    </div>
  )
}

/** How long the end-of-game tune is taken to last before its recording has
 * loaded (the defeat sting runs 3.7 seconds, the victory tune 5.4). */
const TUNE_FALLBACK_MS = 4000

/** Leaves the waiting room for the landing page, giving up my seat so the
 * table isn't left waiting on someone who has gone. */
function BackToMenu({ game }: { readonly game: NetworkGame }) {
  return (
    <button type="button" className="link-button seat-board-back" onClick={game.leaveRoom}>
      ← Main menu
    </button>
  )
}

function SeatPickerScreen({ game }: { readonly game: NetworkGame }) {
  const roomFull = game.seats.every((s) => s.claimed || s.isBot)
  return (
    <div className="overlay">
      <SeatBoard game={game}>
        <BackToMenu game={game} />
        <h2>Room {game.roomId ?? ''}</h2>
        <p className="muted">Share this room code, then everyone joins.</p>
        {game.roomId !== null ? <InviteLink roomId={game.roomId} /> : null}
        <div className="toast-stack">
          <ErrorLine game={game} />
        </div>
        {/* A full table can still be watched: every hand hidden, nothing
            to do (`spectate-room`). */}
        {roomFull ? (
          <p className="muted room-full">
            Room is full.{' '}
            <button type="button" onClick={game.spectate}>
              Spectate
            </button>
          </p>
        ) : null}
      </SeatBoard>
      <CornerToolbar />
    </div>
  )
}

/** Shown once my own seat is claimed but the room's `Game` hasn't started
 * yet — see `ConnectionStatus`'s `waiting-for-players`. `SeatBoard`'s own
 * footer already reports the precise status (seats still open vs. everyone
 * in but not all readied up), so there's no separate line to duplicate it
 * here. */
function WaitingForPlayersScreen({ game }: { readonly game: NetworkGame }) {
  return (
    <div className="overlay">
      <SeatBoard game={game}>
        <BackToMenu game={game} />
        <h2>Room {game.roomId ?? ''}</h2>
        {game.spectating ? (
          <p className="muted">You're spectating: you'll watch the game when it starts, every hand hidden.</p>
        ) : null}
        {game.roomId !== null ? <InviteLink roomId={game.roomId} /> : null}
        <div className="toast-stack">
          <ErrorLine game={game} />
        </div>
      </SeatBoard>
      <CornerToolbar />
    </div>
  )
}

/**
 * Renders once `useNetworkGame` has a claimed seat and a pushed frame.
 *
 * Everything on screen is drawn from `shown` — the frame playback has
 * actually finished animating — not from the newest push. The two differ
 * for as long as an animation is running, and mixing them is what used to
 * put a card's arrival animation over a board that already had the card on
 * it. `game.view` is only for bookkeeping that has to be current, like
 * resolving a card name in the history popup.
 */
function GameScreen({ game }: { readonly game: NetworkGame }) {
  const { seat } = game
  const [showHistory, setShowHistory] = useState(false)
  const [showCapture, setShowCapture] = useState(false)
  const [dismissedHighroll, setDismissedHighroll] = useState(false)
  const dismissHighroll = useCallback(() => setDismissedHighroll(true), [])
  const closeHistory = useCallback(() => setShowHistory(false), [])
  // The end-of-game panel, put aside to look at the final board.
  const [resultDismissed, setResultDismissed] = useState(false)
  const dismissResult = useCallback(() => setResultDismissed(true), [])
  const showResult = useCallback(() => setResultDismissed(false), [])
  // The error count when the rematch was asked for: the button stays down
  // until the new game replaces this screen, or a refusal comes back.
  const [rematchAskedAt, setRematchAskedAt] = useState<number | null>(null)
  const { rematch, errorSeq } = game
  const askRematch = useCallback(() => {
    setRematchAskedAt(errorSeq)
    rematch()
  }, [rematch, errorSeq])
  useEscape(showHistory ? closeHistory : undefined)
  // One bus per screen, carrying each frame's cues from playback across to
  // the overlay layer (they're siblings — see AnimationLayer's own comment).
  const [bus] = useState(() => new AnimationBus())
  // Lives here rather than in `Table`, which remounts every frame: playing a
  // card would otherwise drop the hand tray shut under a cursor still resting
  // on it. Held in one object so `Table`'s prop identity is stable.
  const [handRaised, setHandRaised] = useState(false)
  // The full-hand grid. Lives up here for exactly the reason `handRaised`
  // does: `Table` remounts every frame, so grid state held down there would
  // close itself the moment anything happened — including the card you just
  // played from inside it.
  const [handGrid, setHandGrid] = useState(false)
  const hand = useMemo(
    () => ({ handRaised, setHandRaised, handGrid, setHandGrid }),
    [handRaised, handGrid],
  )
  // The order you've dragged your own permanents into, and the drag under
  // way. Up here so a frame arriving mid-drag doesn't drop the tile.
  const boardDrag = useBoardDrag(game.roomId)
  // A fast sweep across the hand fan fills in between the pointer's move
  // events, so every card it crossed rises (`ui/handSweep.ts`).
  useEffect(() => watchHandSweep(), [])
  // Called unconditionally (before the loading-guard below) per the rules of
  // hooks. `ackFrame` is what lets the server pace its bots against these
  // animations rather than racing ahead of them.
  const shown = usePlayback(game.frame, bus, game.ackFrame, game.spectating ? null : game.seat)
  const view = shown.view
  // The seats around me as the frame being *shown* has them, not the newest
  // one: a scenario builder can change how many players there are between
  // frames, and the table must only ask the board it's drawing about the
  // players on it.
  const opponents = useMemo(() => {
    if (view === null || seat === null) return game.opponents
    const order = view.turnOrder
    const i = order.indexOf(seat)
    return i < 0 ? game.opponents.filter((p) => order.includes(p)) : [...order.slice(i + 1), ...order.slice(0, i)]
  }, [view, seat, game.opponents])
  const botPlaying = game.seats.find((s) => s.player === seat)?.isBot === true
  // My passing preferences live on this device and the server does the
  // passing: sent when the game screen opens and whenever they change.
  const passSettings = usePassSettings()
  const { sendPassSettings, status, spectating } = game
  useEffect(() => {
    // A spectator has no seat to pass for.
    if (status === 'playing' && !spectating) sendPassSettings(passSettings)
  }, [passSettings, sendPassSettings, status, spectating])
  // The winner hears a tune as the game ends: with the result panel, once the
  // last frame has played. Not someone watching.
  const won = view !== null && seat !== null && !spectating && view.result.over && view.result.winner === seat
  useEffect(() => {
    if (won) playSound('victory')
  }, [won])
  // And a loser a sting, the moment they're out: the game's end, or knocked
  // out of a table that plays on without them.
  const lost = view !== null && seat !== null && !spectating && view.players[seat]?.hasLost === true
  useEffect(() => {
    if (lost) playSound('defeat')
  }, [lost])
  // Music through the game, fading out as it ends — or as I'm knocked out —
  // under the tune, and back in once the tune has played. Someone watching
  // hears no tune, and the music back after a short pause.
  const ended = view !== null && (view.result.over || lost)
  const tune = won ? 'victory' : lost ? 'defeat' : null
  const backAfterMs = !ended
    ? null
    : tune !== null && motionPrefs().soundVolume > 0
      ? (cueLengthMs(tune) ?? TUNE_FALLBACK_MS)
      : TUNE_FALLBACK_MS / 2
  useMusic(view !== null && !ended, backAfterMs)
  // What the table may act on: the mulligan stays up through a frame playing
  // out, its buttons locked (`locked` below) — see `tableActions`.
  const latestActions = game.frame?.actions ?? EMPTY_ACTIONS
  const actionsOnTable = useMemo(
    () => tableActions(shown.actions, latestActions, shown.busy, botPlaying),
    [shown.actions, latestActions, shown.busy, botPlaying],
  )
  // Its buttons stay live through another player's mulligan, which leaves the
  // viewer's own decision as it was (`mulliganLive`).
  const tableLocked = shown.busy && !mulliganLive(shown.actions, latestActions, shown.busy)
  // A tutorial room's lesson on the coach overlay: the card the frame on
  // screen carries (never a newer frame's, which would describe a board
  // that hasn't played out yet), its anchor found on that same board.
  const shownViewRef = useRef(view)
  useLayoutEffect(() => {
    shownViewRef.current = view
  }, [view])
  const anchorFor = useCallback(
    (anchor: string | undefined) => lessonAnchor(anchor, () => shownViewRef.current, seat),
    [seat],
  )
  const { tutorialNext, tutorialRetry } = game
  const lessonControls = useMemo<LessonControls>(
    () => ({
      next: tutorialNext,
      retry: tutorialRetry,
      // Out of the room the way the Game menu's "Leave the room" goes.
      exit: () => window.location.assign('/'),
      again: (lesson) => window.location.assign(lessonUrl(lesson)),
    }),
    [tutorialNext, tutorialRetry],
  )
  useLessonCoach(spectating ? null : shown.tutorial, anchorFor, lessonControls)
  if (view === null || seat === null || opponents.length === 0) {
    return <CenteredScreen title="Loading…" />
  }
  const over = view.result.over
  const activeSeatClass = seatClassOf(view.turnOrder, view.activePlayer)
  const showHighroll = view.turn.number === 0 && !dismissedHighroll

  return (
    <div className={`app active-${activeSeatClass}`}>
      {/* One slim row replaces the old topbar + seat-banner + per-layout
          pinned PhaseTrack/TurnBanner — room code, whose-turn (spelled out),
          the step pips, who's actually waiting to act, and the menu, all in
          one place instead of stacked as separate banners. */}
      <header className="top-strip">
        <span className="ts-room">
          room {game.roomId}
          {game.spectating ? <span className="ts-spectating"> · spectating</span> : null}
        </span>
        <TurnBanner view={view} seats={game.seats} />
        <PhaseTrack view={view} seat={seat} />
        <span className="ts-acting">
          {over
            ? 'Game over'
            : shown.busy
              ? 'Resolving…'
              : `${playerLabel(actingPlayer(view) ?? seat, game.seats)} to act`}
        </span>
        <div className="ts-menu">
          {/* The host can stop the bots to look at something, and let them
              go a move at a time; everyone else sees that they're stopped.
              Icons rather than words: the strip has no room to spare, and
              words here squeezed the phase track down to four steps at
              1366px. */}
          {game.isHost && game.seats.some((s) => s.isBot) && !over ? (
            <>
              {/* Left of the pause button, so its appearing on a pause doesn't
                  push that button along under the cursor (the menu is
                  right-anchored); the phase track's free space takes it. */}
              {game.botsPaused ? (
                <button
                  type="button"
                  className="ts-icon"
                  aria-label="Let the bots make one move"
                  title="Let the bots make one move"
                  onClick={game.stepBots}
                >
                  ⏭
                </button>
              ) : null}
              <button
                type="button"
                className={`ts-icon${game.botsPaused ? ' ts-paused' : ''}`}
                aria-pressed={game.botsPaused}
                aria-label={game.botsPaused ? 'Resume the bots' : 'Pause the bots'}
                title={game.botsPaused ? 'Resume the bots' : 'Pause the bots'}
                onClick={() => game.setBotsPaused(!game.botsPaused)}
              >
                {game.botsPaused ? '▶' : '⏸'}
              </button>

            </>
          ) : game.botsPaused ? (
            <span className="ts-paused-badge">Bots paused</span>
          ) : null}
          {/* The bots' speed is in Settings: only the host sets it, and only a
              table with bots needs it. */}
          <MotionControl
            botSpeed={
              game.isHost && game.seats.some((s) => s.isBot)
                ? { speed: game.botSpeed, onChange: game.setBotSpeed }
                : undefined
            }
          />
          <button type="button" data-tour="game-history" onClick={() => setShowHistory(true)}>
            History
          </button>
          {/* A developer's server only (`--capture`), and only its host. */}
          {game.captureEnabled && game.isHost ? (
            <button type="button" onClick={() => setShowCapture(true)}>
              Capture
            </button>
          ) : null}
          <SeatMenu game={game} view={view} onShowResult={over && resultDismissed ? showResult : undefined} />
        </div>
      </header>

      <div className="toast-stack">
        {game.stopped !== null ? (
          // Not dismissible and never gone: nothing can be played here now.
          <div className="toast bad" role="alert">
            ⚠ This game has stopped: the engine hit an error, and nothing more can be played in this room.{' '}
            <span className="muted">({game.stopped})</span>
          </div>
        ) : null}
        {game.blitzReport !== null ? <BlitzReportToast report={game.blitzReport} onDismiss={game.dismissBlitzReport} /> : null}
        {game.restarted && !game.isHost ? (
          <HighrollToast onDismiss={game.dismissRestarted}>
            {(() => {
              const host = game.seats.find((s) => s.isHost)
              return `${host ? playerLabel(host.player, game.seats) : 'The host'} restarted the game`
            })()}
          </HighrollToast>
        ) : null}
        {showHighroll ? (
          <HighrollToast onDismiss={dismissHighroll}>
            {game.firstPlayerChosen
              ? `${playerLabel(view.startingPlayer, game.seats)} goes first, the host's pick`
              : `🎲 ${playerLabel(view.startingPlayer, game.seats)} won the highroll and goes first`}
          </HighrollToast>
        ) : null}
        {/* Last: an error comes and goes, and above the notices that stay it
            pushed them down a line each time (the jitter sweep, 2026-10-10). */}
        <ErrorLine game={game} />
      </div>

      {/* A sibling of <Table>, not a child: Table remounts on every frame
          it's keyed on, which would tear down anything animating inside it.
          Its cues come off the bus, each carrying the board it belongs to. */}
      <AnimationLayer bus={bus} seat={seat} seats={game.seats} />

      <Table
        key={shown.revision}
        view={view}
        seat={seat}
        opponents={opponents}
        game={game}
        // Emptied while a frame is still playing out: those actions belong
        // to a board the player can't see yet, and taking one now would race
        // the animation showing how the game got there. The server holds its
        // bots to the same rule — see `ackFrame`.
        // And while a bot plays this seat (the seat menu's "Let a bot play
        // for me"), whose moves the server makes and whose answers it would
        // refuse from here. The mulligan alone stays up, locked (see
        // `tableActions`) — unless the frame is another player's mulligan,
        // which leaves this seat's own as it was (`mulliganLive`).
        actions={actionsOnTable}
        locked={tableLocked}
        hand={hand}
        previousView={shown.previousView}
        answered={shown.answered}
        boardDrag={boardDrag}
        aims={bus.aims}
      />

      {showHistory ? (
        <div className="zone-viewer-overlay" onClick={() => setShowHistory(false)}>
          <div
            className="zone-viewer-box history-box"
            onClick={(e) => e.stopPropagation()}
            role="dialog"
            aria-label="History"
          >
            <div className="zone-viewer-head">
              <h2>History</h2>
              {/* Here rather than as a ↺ in the top strip, which read as a
                  restart beside the Game menu's real one (the user,
                  2026-10-07): this is where a player comes having missed
                  something. It closes the log, so the board is in view. */}
              <button
                type="button"
                disabled={shown.busy || !shown.replayable}
                title="Play the last update's animations again"
                onClick={() => {
                  setShowHistory(false)
                  shown.replay()
                }}
              >
                Replay last move
              </button>
              <button type="button" onClick={() => setShowHistory(false)}>
                Close
              </button>
            </div>
            <EventLog
              events={view.events}
              nameAt={(id, seq) => publicNameAt(view.publicStints, id, seq) ?? game.nameOf(id)}
              seats={game.seats}
              onSelect={(event) => {
                // Close the log so the board is in view, then point the
                // entry's cards and players out on it once it's drawn.
                setShowHistory(false)
                window.setTimeout(() => highlightEvent(event), 50)
              }}
            />
          </div>
        </div>
      ) : null}

      {over && !resultDismissed ? (
        <GameResultPanel
          view={view}
          seat={seat}
          seats={game.seats}
          onDismiss={dismissResult}
          offer={rematchOffer({
            canRematch: game.canRematch,
            isHost: game.isHost,
            blitz: game.blitzRoom,
            seats: game.seats,
          })}
          onRematch={askRematch}
          rematchAsked={rematchAskedAt === game.errorSeq}
        />
      ) : null}

      {showCapture ? <CapturePanel game={game} onClose={() => setShowCapture(false)} /> : null}
      {BuilderPanel !== null && game.builder !== null ? (
        <Suspense fallback={null}>
          <BuilderPanel game={game} />
        </Suspense>
      ) : null}
    </div>
  )
}

/** The scenario builder's drawer: a dev build only. In a production build
 * `import.meta.env.DEV` is `false`, so the import is dead code and the
 * builder isn't in the bundle at all. */
const BuilderPanel = import.meta.env.DEV ? lazy(() => import('./builder/BuilderPanel.tsx')) : null

interface TableProps {
  readonly view: PlayerView
  readonly seat: PlayerId
  readonly opponents: readonly PlayerId[]
  readonly game: NetworkGame
  /** `usePlayback`'s held-back list, matching the held-back `view` above
   * — never `game.actions` directly, which is already ahead of what's drawn
   * on screen (see GameScreen's own comment). */
  readonly actions: readonly LegalAction[]
  /** A frame is still playing out: what `actions` holds anyway (the
   * mulligan) is shown but can't be answered yet. */
  readonly locked: boolean
  /** The peekable hand tray's raised state, owned by `GameScreen` so it
   * survives this component's per-frame remount. */
  readonly hand: {
    readonly handRaised: boolean
    readonly setHandRaised: (raised: boolean) => void
    /** Whether the whole hand is open as a wrapped grid — the way to pick a
     * card out of a hand too big to fan (see `HAND_GRID_THRESHOLD`). */
    readonly handGrid: boolean
    readonly setHandGrid: (open: boolean) => void
  }
  /** The board shown before this one: what `Stack` needs to animate only its
   * new arrivals, and `ArrowLayer` only its new arrows. */
  readonly previousView: PlayerView | null
  /** A later frame is playing over this board, so its pending decision has
   * been answered (`Playback.answered`): the stack draws no "prompted by". */
  readonly answered: boolean
  /** Your own permanents' dragged order and the drag in progress, owned by
   * `GameScreen` so a drag survives this component's per-frame remount. */
  readonly boardDrag: BoardDragControls
  /** What is resolving over this board while a frame's first half plays on
   * it, for the targeted marks (`aim`) and `ArrowLayer` (owned by the
   * animation bus, which outlives this component's per-frame remount). */
  readonly aims: ResolveAims
}

/**
 * Everything interactive. Keyed on the parent's played-back revision, so
 * every in-progress selection resets in step with the board the player can
 * see, not with every raw network push (see usePlayback). State that should
 * *not* reset per frame — the hand tray being raised — lives in `GameScreen`
 * and arrives through props.
 */
function Table({
  view,
  seat,
  opponents,
  game,
  actions,
  locked,
  hand,
  previousView,
  answered,
  boardDrag,
  aims,
}: TableProps) {

  const [targeting, setTargeting] = useState<Targeting | null>(null)
  // Whether the collapsed hand tray (priority mode only -- see .hand-strip's
  // peekable variant) is raised. Hover/focus raises it; a two-zone hitbox
  // (a small .hand-trigger vs. the whole peekable strip) means raising it
  // needs less precision than keeping it raised does, so idle mouse movement
  // doesn't summon it but browsing it tolerates real cursor drift.
  //
  // Owned by `GameScreen`, not by this component: `Table` remounts on every
  // frame it's keyed on, and a local `useState` here dropped the hand back
  // into its tray the instant you played a card -- out from under a cursor
  // that was still sitting on it, mid-reach for the next one.
  const { handRaised, setHandRaised, handGrid, setHandGrid } = hand
  // Measured (not guessed) hand-row layout, recomputed whenever the row's
  // real rendered width changes (viewport resize, peekable<->in-flow mode
  // switch) or the hand's card count changes -- see HAND_CARD_GAP's comment.
  const handRowRef = useRef<HTMLDivElement>(null)
  const [handCardGap, setHandCardGap] = useState(HAND_CARD_GAP)
  // Per-player board elements (keyed by seat, since up to 4 boards each need
  // independent handling), each with its tiles sized to fill the height its
  // quadrant gives it.
  // A Map + shared observers rather than one ref/effect per player, since
  // `renderBoard` runs in a loop/JSX map and hooks can't be called
  // conditionally or a variable number of times per render. See
  // `registerBoardEl`/`recomputeBoardMiniW` below.
  const boardElsRef = useRef<Map<PlayerId, HTMLDivElement>>(new Map())
  const boardResizeObserverRef = useRef<ResizeObserver | null>(null)
  const boardMutationObserverRef = useRef<MutationObserver | null>(null)
  // Set while an `{X}` cost is being chosen, before target selection — for an
  // X spell (`CastAction`) or an X activated ability (`AbilityAction`, EG-3).
  const [pendingX, setPendingX] = useState<
    | ({
        readonly action: CastAction | AbilityAction
        readonly value: number
      } & CastPicks)
    | null
  >(null)
  // Set while a targeted modal spell's modes are being chosen (Phase 11 EG-2),
  // before target selection.
  const [pendingModes, setPendingModes] = useState<
    | ({
        readonly cast: CastAction
        readonly picked: readonly number[]
      } & CastPicks)
    | null
  >(null)
  // Set while choosing which creature to sacrifice for an ability's cost.
  const [pendingSac, setPendingSac] = useState<AbilityAction | CastAction | null>(null)
  /** An escape cast waiting on which other graveyard cards it exiles (rule
   * 702.139a), asked in a `ZoneViewer` before its modes / X / targets.
   * `sacrifice` is an additional cost already picked, if it had one. */
  const [pendingEscape, setPendingEscape] = useState<
    | ({
        readonly cast: CastAction
        readonly offer: NonNullable<CastAction['escapeExile']>
      } & Pick<CastPicks, 'sacrifice'>)
    | null
  >(null)
  /** A delve cast waiting on which graveyard cards it exiles (rule 702.66a),
   * asked in a `ZoneViewer` after any escape choice and before modes / X /
   * targets, carrying the costs already picked. */
  const [pendingDelve, setPendingDelve] = useState<
    | ({
        readonly cast: CastAction
        readonly offer: NonNullable<CastAction['delve']>
        /** An {X} spell's X, chosen first: its range is the offer's
         * `byX` at that X, and targeting carries on from here. */
        readonly xValue?: number
      } & Omit<CastPicks, 'delve'>)
    | null
  >(null)
  const [selectedSource, setSelectedSource] = useState<ObjectId | null>(null)
  // What a spell or ability on the stack is aimed at, marked on the board:
  // the top of the stack's targets, or those of the entry the pointer is on
  // (Stack's `onFocusEntry`). A bot's Swords to Plowshares shows what it's
  // about to exile before anyone lets it resolve, instead of in the History.
  // While a frame plays out over this board, whatever resolves in it is
  // marked instead, and an entry that has resolved is marked no more
  // (`aimedEntry`; the bus's `aims`, played by usePlayback).
  const [stackFocus, setStackFocus] = useState<ObjectId | null>(null)
  const resolve = useResolveState(aims)
  const aimId: ObjectId | null = useMemo(
    () => aimedEntry(view.zones.stack, stackFocus, resolve),
    [view, stackFocus, resolve],
  )
  const aim = useMemo(() => {
    const id = aimId
    const source = id === null ? undefined : view.objects[id]
    const targets = source?.targets ?? []
    if (source === undefined || targets.length === 0) return null
    const by =
      source.kind === 'ability'
        ? `${(source.sourceObjectId ? view.objects[source.sourceObjectId]?.cardName : undefined) ?? source.cardName}'s ability`
        : source.cardName
    return {
      by,
      objects: new Set(targets.flatMap((t) => (t.kind === 'object' ? [t.object] : []))),
      players: new Set(targets.flatMap((t) => (t.kind === 'player' ? [t.player] : []))),
    }
  }, [view, aimId])
  // Attacker -> chosen defender. A creature that must attack (rule 508.1d)
  // and has only one defender it may attack starts out assigned to it, as a
  // click on it would; one with a choice waits for the player to make it.
  const [attackAssignments, setAttackAssignments] = useState<
    Record<string, PlayerId | ObjectId>
  >(() => {
    const raw = actions.find((a): a is AttackAction => a.kind === 'declare-attackers')
    // In members, as the bar works (game/stackMembers.ts).
    const offer = raw
      ? expandAttackOffer(raw, (id) => view.objects[id]?.stackCount ?? 1).offer
      : undefined
    const start: Record<string, PlayerId | ObjectId> = {}
    for (const id of offer?.mustAttack ?? []) {
      const defenders = offer?.defendersFor[id] ?? []
      if (defenders.length === 1) start[id] = defenders[0]
    }
    return start
  })
  /**
   * Attackers picked but not yet pointed at anyone — the pending group.
   *
   * Declaring an attack is two facts, not one: *which* creatures attack, and
   * *who each one attacks*. At two players the second is free (there is one
   * opponent), which is why this used to be a single focused attacker and a
   * one-button "attack with all". At three or four it is the whole decision,
   * and a button that sends every creature at `defendersFor(id)[0]` is
   * picking an opponent for you at random.
   *
   * So: click creatures to build this group, click a player or planeswalker
   * to send the group there. A creature with only one legal defender skips
   * the group entirely and is assigned on click, which keeps a two-player
   * board at one click per attacker exactly as before.
   */
  const [attackPicks, setAttackPicks] = useState<readonly ObjectId[]>([])
  /**
   * Bands declared with the attack (rule 702.22c), each a list of attacking
   * objects (a token stack's whole entry joins as one). `bandDraft` is the
   * band being built — while it isn't null, a click on an attacking creature
   * adds or drops it instead of taking it out of the attack. Which bands are
   * legal is the engine's call (`combat/banding.ts`): a refusal comes back
   * as the error banner, as any declaration's does.
   */
  const [attackBands, setAttackBands] = useState<readonly (readonly ObjectId[])[]>([])
  const [bandDraft, setBandDraft] = useState<readonly ObjectId[] | null>(null)
  const [blockAssign, setBlockAssign] = useState<Record<string, ObjectId>>({})
  // The further attackers a creature that can block additional creatures
  // blocks beside its `blockAssign` one (the offer's `maxBlocks`), by blocker.
  const [blockExtra, setBlockExtra] = useState<Record<string, ObjectId[]>>({})
  // How many blockers share each token of an attacking token stack, by
  // attacker (`stackMembers.ts`'s `PerToken`; 1 when absent), and which
  // stack's popup is open to set it (`renderBlockSplitMenu`).
  const [blockPerToken, setBlockPerToken] = useState<Record<string, number>>({})
  const [blockSplit, setBlockSplit] = useState<ObjectId | null>(null)
  const [blockFocus, setBlockFocus] = useState<ObjectId | null>(null)
  const [discardPicks, setDiscardPicks] = useState<readonly ObjectId[]>([])
  const [revealPick, setRevealPick] = useState<ObjectId | null>(null)
  const [bottomPicks, setBottomPicks] = useState<readonly ObjectId[]>([])
  // Per-blocker combat-damage amounts (EG-4a), in the offer's order: null
  // until the player edits one, meaning the engine's standard split.
  const [damagePicks, setDamagePicks] = useState<readonly number[] | null>(null)
  const [modePicks, setModePicks] = useState<readonly number[]>([])
  const [sacrificePicks, setSacrificePicks] = useState<readonly ObjectId[]>([])
  const [permanentPicks, setPermanentPicks] = useState<readonly ObjectId[]>([])
  // The permanents put into the first pile so far, separating on the board.
  const [pilePicks, setPilePicks] = useState<readonly ObjectId[]>([])
  /** A cast or activation whose targets are in, waiting on which permanents
   * its "tap N untapped … you control" cost taps (rule 601.2h — costs are
   * paid last). `picks` names a stack once per token. */
  const [pendingTap, setPendingTap] = useState<{
    readonly action: Action
    readonly offer: TapCostOffer
    readonly picks: readonly ObjectId[]
  } | null>(null)
  /** A convoke spell whose targets are in, waiting on which creatures help
   * pay for it (rule 702.51) — none at all is paying with mana. The engine
   * works out what each one pays. */
  // A cast whose targets are in, waiting on how its divided damage is split
  // among them (Magma Opus). `shares` follows `targets`; `resume` carries the
  // cast on from there — convoke, a tap cost, or straight out.
  const [pendingDivision, setPendingDivision] = useState<{
    readonly total: number
    /** What's divided — damage, or "+1/+1 counters" (`divide.of`). */
    readonly of: string
    /** "Distribute **up to** that many" (Lathiel): less than all may go out. */
    readonly upTo?: boolean
    readonly targets: readonly TargetRef[]
    readonly shares: readonly number[]
    readonly resume: (division: readonly number[]) => void
  } | null>(null)
  // A cast or ability whose targets are in, waiting on how many of its
  // Phyrexian pips the player pays with life (rule 107.4f).
  const [pendingPhyrexian, setPendingPhyrexian] = useState<{
    readonly pips: number
    readonly resume: (life: number) => void
  } | null>(null)
  const [pendingConvoke, setPendingConvoke] = useState<{
    readonly action: Action
    readonly offer: ConvokeOffer
    readonly picks: readonly ObjectId[]
  } | null>(null)
  /** A spell or ability with a waterbend cost whose targets (and X) are in,
   * waiting on which artifacts and creatures tap to pay for it (rule
   * 701.67a): up to `max`, each paying {1}; none at all is paying with mana.
   * `least` is how many the mana can't do without — the offer's proof at
   * this X, which `picks` starts from. A stack is named once per token. */
  const [pendingWaterbend, setPendingWaterbend] = useState<{
    readonly action: Action
    readonly offer: WaterbendOffer
    readonly max: number
    readonly least: number
    readonly picks: readonly ObjectId[]
  } | null>(null)
  /** The token stack whose "how many of these?" menu is open, if any. */
  const [stackMenu, setStackMenu] = useState<ObjectId | null>(null)
  // A tile of several attackers clicked while declaring attacks: the popup
  // that sets how many of them attack each defender (`renderAttackSplitMenu`).
  // `anchor` is the tile's id, `members` every creature it stands for.
  const [attackSplit, setAttackSplit] = useState<{
    readonly anchor: ObjectId
    readonly members: readonly ObjectId[]
  } | null>(null)
  // Proliferate picks are `TargetRef`s, not ids: rule 701.27 lets you choose
  // players as well as permanents (a player with energy, poison or experience
  // counters).
  const [proliferatePicks, setProliferatePicks] = useState<readonly TargetRef[]>([])
  // "N mana in any combination of …": how many of each colour so far.
  // Cleared once sent, so the next split starts from nothing.
  const [manaSplit, setManaSplit] = useState<Readonly<Record<string, number>>>({})
  // A mana ability activated by hand whose split is the player's to pick
  // (`manaSplit` on the offer: "X mana in any combination" with too many
  // splits to list), asked in the same strip as the engine's own.
  const [pendingManaSplit, setPendingManaSplit] = useState<AbilityAction | null>(null)
  // Time travel's answer as it's built: +1 or -1 per object, absent = neither;
  // and which way a click on a permanent goes.
  const [timeTravelPicks, setTimeTravelPicks] = useState<Readonly<Record<string, 1 | -1>>>({})
  const [timeTravelBrush, setTimeTravelBrush] = useState<1 | -1>(1)
  // How many of each kind come off each object, keyed `${object}|${kind}`.
  const [counterPicks, setCounterPicks] = useState<Readonly<Record<string, number>>>({})
  // Whose dungeon map is open (their progress chip), or nobody's.
  const [dungeonViewOf, setDungeonViewOf] = useState<PlayerId | null>(null)
  const [zoneView, setZoneView] = useState<{
    readonly title: string
    readonly ids: readonly ObjectId[]
    /** Draws what isn't in `view.objects` (emblems); the view's objects otherwise. */
    readonly resolve?: (id: ObjectId) => VisibleObject | undefined
  } | null>(null)
  // A forced-decision popup (choose-from-zone, scry/surveil, the creature-type
  // picker) hidden via its "View board" button so the board can be read before
  // answering. The way back is a "Show choices" button in the decision strip.
  // Table remounts per frame, but no frame arrives while the game waits on
  // this seat's answer, so this outlives exactly the decision it belongs to.
  const [decisionCollapsed, setDecisionCollapsed] = useState(false)
  // The card picked from a `cast-now` offer of several (or of cards looked
  // at first — the top of a library), whose ways to cast it the decision
  // strip then offers. Per frame, like `decisionCollapsed`.
  const [castNowPick, setCastNowPick] = useState<ObjectId | null>(null)
  // The same for the popup a graveyard or exile target is picked from, by the
  // slot it was hidden for (`zoneTargetKey`): the next slot, or a targeting
  // backed out of and begun again, starts shown.
  const [zoneTargetHidden, setZoneTargetHidden] = useState<string | null>(null)

  // --- classify the legal actions ------------------------------------
  const landByCard = useMemo(() => {
    const m = new Map<ObjectId, LandAction>()
    for (const a of actions) if (a.kind === 'play-land') m.set(a.card, a)
    return m
  }, [actions])
  const castByCard = useMemo(() => {
    const m = new Map<ObjectId, CastAction>()
    // First entry wins: a kickable spell is enumerated unkicked then kicked
    // (P8), and this map backs the "just cast it" shortcuts, which mean the
    // plain cast. The per-variant buttons come from `playFacesByCard`.
    for (const a of actions) if (a.kind === 'cast-spell' && !m.has(a.card)) m.set(a.card, a)
    return m
  }, [actions])
  /** Every playable face of a card (a multi-face card has 2+). */
  const playFacesByCard = useMemo(() => {
    const m = new Map<ObjectId, (CastAction | LandAction)[]>()
    for (const a of actions) {
      if (a.kind !== 'cast-spell' && a.kind !== 'play-land') continue
      const list = m.get(a.card) ?? []
      list.push(a)
      m.set(a.card, list)
    }
    return m
  }, [actions])
  const suspendByCard = useMemo(() => {
    const m = new Map<ObjectId, SuspendAction>()
    for (const a of actions) if (a.kind === 'suspend') m.set(a.card, a)
    return m
  }, [actions])
  const cycleByCard = useMemo(() => {
    const m = new Map<ObjectId, CycleAction>()
    for (const a of actions) if (a.kind === 'cycle') m.set(a.card, a)
    return m
  }, [actions])
  const foretellByCard = useMemo(() => {
    const m = new Map<ObjectId, ForetellAction>()
    for (const a of actions) if (a.kind === 'foretell') m.set(a.card, a)
    return m
  }, [actions])
  const plotByCard = useMemo(() => {
    const m = new Map<ObjectId, PlotAction>()
    for (const a of actions) if (a.kind === 'plot') m.set(a.card, a)
    return m
  }, [actions])
  // A face-down permanent that can be turned face up (rule 701.40b): the
  // offer sits in the permanent's own ability menu, as its abilities do.
  // A Room's locked doors that can be unlocked (rule 709.5e): a special
  // action, offered in the Room's own ability menu, as turning face up is.
  const unlockBySource = useMemo(() => {
    const m = new Map<ObjectId, Extract<LegalAction, { kind: 'unlock-door' }>[]>()
    for (const a of actions) {
      if (a.kind !== 'unlock-door') continue
      m.set(a.permanent, [...(m.get(a.permanent) ?? []), a])
    }
    return m
  }, [actions])
  // A prepared permanent's copy of its prepare spell (rule 722.3c), cast
  // from exile: offered in the permanent's own ability menu, since the copy
  // belongs to it (`VisibleObject.preparedBy`).
  const preparedCastsBySource = useMemo(() => {
    const m = new Map<ObjectId, CastAction[]>()
    for (const a of actions) {
      if (a.kind !== 'cast-spell') continue
      const by = view.objects[a.card]?.preparedBy
      if (by === undefined) continue
      m.set(by, [...(m.get(by) ?? []), a])
    }
    return m
  }, [actions, view.objects])
  // A Licid's Aura effect its player may end (rule 116.2c): a special
  // action, offered in the Aura's own ability menu.
  const licidEndBySource = useMemo(() => {
    const m = new Map<ObjectId, Extract<LegalAction, { kind: 'end-licid-effect' }>>()
    for (const a of actions) if (a.kind === 'end-licid-effect') m.set(a.permanent, a)
    return m
  }, [actions])
  // Every way to turn each face-down permanent face up: its mana cost, its
  // morph or disguise cost, or both (a manifested card with morph).
  const faceUpBySource = useMemo(() => {
    const m = new Map<ObjectId, Extract<LegalAction, { kind: 'turn-face-up' }>[]>()
    for (const a of actions) if (a.kind === 'turn-face-up') m.set(a.permanent, [...(m.get(a.permanent) ?? []), a])
    return m
  }, [actions])
  // One of each set of interchangeable "{T}: Add {W}"s (`abilityMenu.ts`).
  const abilitiesBySource = useMemo(() => abilitiesBySourceOf(actions), [actions])

  // The offer with each compacted token stack as one member per token
  // (game/stackMembers.ts): the bar picks and counts creatures, and
  // `confirmAttackers` folds the members back into counted entries.
  //
  // Creatures put onto the battlefield attacking, with a choice of what each
  // attacks (rule 508.4 — the `enter-attacking` decision), are answered with
  // the same bar: its offer, reshaped as an attack in which every one of them
  // must be sent somewhere (`mustAttack`), and `confirmAttackers` sends the
  // answer as that decision's instead.
  const enterAttackingAction = actions.find(
    (a): a is EnterAttackingAction => a.kind === 'enter-attacking',
  )
  const rawAttackAction = useMemo((): AttackAction | undefined => {
    const declared = actions.find((a): a is AttackAction => a.kind === 'declare-attackers')
    if (declared !== undefined || enterAttackingAction === undefined) return declared
    const ids = enterAttackingAction.creatures.map((c) => c.object)
    const defenders = [...new Set(enterAttackingAction.creatures.flatMap((c) => c.options))]
    return {
      kind: 'declare-attackers',
      eligible: ids,
      defenders,
      defendersFor: Object.fromEntries(enterAttackingAction.creatures.map((c) => [c.object, c.options])),
      mustAttack: ids,
    }
  }, [actions, enterAttackingAction])
  const attackExpansion = useMemo(
    () =>
      rawAttackAction
        ? expandAttackOffer(rawAttackAction, (id) => view.objects[id]?.stackCount ?? 1)
        : null,
    [rawAttackAction, view],
  )
  const attackAction = attackExpansion?.offer
  // Which defenders *this* attacker may legally be sent at. Not the same as
  // `attackAction.defenders`, which is the union across every attacker: a
  // goaded creature has to attack someone other than its goader when it can
  // (rule 701.38b), and picking from the union builds a declaration the
  // server rejects.
  const defendersFor = useCallback(
    (attacker: ObjectId): readonly (PlayerId | ObjectId)[] =>
      attackAction?.defendersFor[attacker] ?? [],
    [attackAction],
  )
  /**
   * May the pending group be pointed at this defender?
   *
   * **All of them or none** — a defender every selected creature may legally
   * attack. Assigning just the ones that can and leaving the rest behind
   * would quietly split an attack the player thought they were sending one
   * way, which is the same silent split the old "Attack with all" button
   * caused by sending each creature at its own `defendersFor(id)[0]`.
   *
   * The check is **per attacker, never off the offer's `defenders` union** —
   * that union says who may be attacked *at all*, and a declaration built
   * from it is one the engine refuses (both `actions.ts` and
   * `decisions/attackers.ts` warn about exactly this, and a refusal surfaces
   * as a red error banner rather than a partial attack). Goad (rule 701.38b)
   * and Vow of Duty are what make the legal set differ per creature.
   */
  const canSendPicksAt = useCallback(
    (defender: PlayerId | ObjectId): boolean =>
      attackPicks.length > 0 &&
      attackPicks.every((p) => defendersFor(p).includes(defender)),
    [attackPicks, defendersFor],
  )
  const sendPicksAt = useCallback(
    (defender: PlayerId | ObjectId) => {
      if (!canSendPicksAt(defender)) return
      // Two plain updaters rather than one nested inside the other: a
      // `setState` updater has to stay pure (see the note on `setTargeting`).
      setAttackAssignments((cur) => ({
        ...cur,
        ...Object.fromEntries(attackPicks.map((p) => [p, defender])),
      }))
      setAttackPicks([])
    },
    [attackPicks, canSendPicksAt],
  )
  // As with attacks: a compacted stack blocks as its members, one per token.
  const rawBlockAction = actions.find(
    (a): a is BlockAction => a.kind === 'declare-blockers',
  )
  const blockExpansion = useMemo(
    () => (rawBlockAction ? expandBlockOffer(rawBlockAction) : null),
    [rawBlockAction],
  )
  const blockAction = blockExpansion?.offer
  /** The members of whichever combat declaration is being built. */
  const stackMembers: Members = useMemo(
    () => attackExpansion?.members ?? blockExpansion?.members ?? new Map(),
    [attackExpansion, blockExpansion],
  )
  /** Every member of the board tile an id is drawn in — several when
   * identical tokens fold into one (`computeBoardEntries`), itself alone
   * otherwise. The block bar counts and spreads blocks over a whole tile. */
  const tileMembers = useMemo(() => {
    const out = new Map<ObjectId, readonly ObjectId[]>()
    for (const pid of view.turnOrder) {
      for (const entry of computeBoardEntries(view, pid)) {
        // A compacted stack's members are members of its tile too.
        const members = expandIds(entry.ids, stackMembers)
        for (const id of members) out.set(id, members)
        for (const id of entry.ids) out.set(id, members)
      }
    }
    return out
  }, [view, stackMembers])
  const tileOf = useCallback(
    (id: ObjectId): readonly ObjectId[] => tileMembers.get(id) ?? [id],
    [tileMembers],
  )
  const discardAction = actions.find(
    (a): a is DiscardAction => a.kind === 'discard',
  )
  const zoneChoiceAction = actions.find(
    (a): a is ZoneChoiceAction => a.kind === 'choose-from-zone',
  )
  const mulliganAction = actions.find(
    (a): a is MulliganAction => a.kind === 'mulligan',
  )
  const bottomAction = actions.find(
    (a): a is BottomAction => a.kind === 'put-on-bottom',
  )
  const commanderChoiceAction = actions.find(
    (a): a is CommanderChoiceAction => a.kind === 'commander-replacement',
  )
  const shockChoiceAction = actions.find(
    (a): a is ShockChoiceAction => a.kind === 'pay-life-for-untapped',
  )
  const miracleChoiceAction = actions.find(
    (a): a is MiracleChoiceAction => a.kind === 'miracle-reveal',
  )
  const revealChoiceAction = actions.find(
    (a): a is RevealChoiceAction => a.kind === 'reveal-for-untapped',
  )
  const copyChoiceAction = actions.find(
    (a): a is CopyChoiceAction => a.kind === 'choose-copy',
  )
  const enchantAction = actions.find(
    (a): a is EnchantChoiceAction => a.kind === 'choose-enchant',
  )
  const legendAction = actions.find((a): a is LegendRuleAction => a.kind === 'legend-rule')
  const triggerOrderAction = actions.find((a): a is TriggerOrderAction => a.kind === 'order-triggers')
  const cardNameChoiceAction = actions.find(
    (a): a is CardNameChoiceAction => a.kind === 'choose-card-name',
  )
  const creatureTypeChoiceAction = actions.find(
    (a): a is CreatureTypeChoiceAction => a.kind === 'choose-creature-type',
  )
  const modesChoiceAction = actions.find(
    (a): a is ModesChoiceAction => a.kind === 'choose-modes',
  )
  const sacrificeAction = actions.find(
    (a): a is SacrificeAction => a.kind === 'sacrifice',
  )
  const choosePermanentsAction = actions.find(
    (a): a is ChoosePermanentsAction => a.kind === 'choose-permanents',
  )
  const separatePilesAction = actions.find((a): a is SeparatePilesAction => a.kind === 'separate-piles')
  const choosePileAction = actions.find((a): a is ChoosePileAction => a.kind === 'choose-pile')
  // Piles of permanents (Liliana of the Veil) are made and shown on the
  // board; piles of cards (Fact or Fiction) in a popup.
  const pilesOnBoard = useMemo(() => {
    const objects = separatePilesAction?.objects ?? choosePileAction?.piles.flat() ?? []
    return objects.length > 0 && objects.every((id) => view.objects[id]?.zone === 'battlefield')
  }, [separatePilesAction, choosePileAction, view.objects])
  const pileLabels: readonly [string, string] =
    (separatePilesAction ?? choosePileAction)?.faceDown === true
      ? ['Pile 1 (face down)', 'Pile 2 (face up)']
      : ['Pile 1', 'Pile 2']
  const proliferateAction = actions.find(
    (a): a is ProliferateAction => a.kind === 'proliferate',
  )
  const splitManaAction = actions.find((a): a is SplitManaAction => a.kind === 'split-mana')
  // The split to ask: the engine's, or a hand activation's (`pendingManaSplit`).
  const manaSplitAsk = splitManaAction ?? pendingManaSplit?.manaSplit
  const timeTravelAction = actions.find((a): a is TimeTravelAction => a.kind === 'time-travel')
  const removeCountersAction = actions.find((a): a is RemoveCountersAction => a.kind === 'remove-counters')
  const ventureAction = actions.find((a): a is VentureAction => a.kind === 'venture')
  const scryAction = actions.find((a): a is ScryAction => a.kind === 'scry')
  const castNowAction = actions.find((a): a is CastNowAction => a.kind === 'cast-now')
  // "You may cast a spell from your hand" and the like: more than one card on
  // offer, or cards to look at first, so the card is picked from a popup.
  const castNowPicking =
    castNowAction !== undefined && (castNowAction.cards.length > 1 || castNowAction.looked !== undefined)
  const assignDamageAction = actions.find(
    (a): a is AssignDamageAction => a.kind === 'assign-combat-damage',
  )
  // The split as it stands, which the board draws as well as the bar (a
  // badge on each blocker), so it's worked out up here: the engine's
  // standard split until the player changes it.
  const damageAnswer = useMemo(
    () =>
      assignDamageAction ? (damagePicks ?? defaultAssignment(assignDamageAction)) : null,
    [assignDamageAction, damagePicks],
  )
  const damageGroups = useMemo(
    () => (assignDamageAction ? groupBlockers(assignDamageAction, view) : []),
    [assignDamageAction, view],
  )
  /** Each blocker's position in the offer, which is where its amount goes. */
  const damageIndex = useMemo(
    () => new Map(assignDamageAction?.blockers.map((id, i) => [id, i]) ?? []),
    [assignDamageAction],
  )
  /** The blockers a board tile stands for, as offer positions: every one of
   * them, since a folded token stack is one tile and several blockers. */
  const damageMembersOf = useCallback(
    (ids: readonly ObjectId[]): number[] =>
      ids.flatMap((i) => {
        const at = damageIndex.get(i)
        return at === undefined ? [] : [at]
      }),
    [damageIndex],
  )
  const damageSurvivors = useMemo(
    () => (assignDamageAction ? survivorsOf(assignDamageAction) : new Set<number>()),
    [assignDamageAction],
  )
  const chooseTargetsAction = actions.find(
    (a): a is ChooseTargetsAction => a.kind === 'choose-targets',
  )
  // A `choose-targets` decision (a triggered ability / a suspended spell —
  // ROADMAP Phase 11 EG-1) drives the same targeting flow as a cast, but it's
  // *derived* from the decision rather than stored — only the running picks
  // live in state — so a state refresh mid-choice just re-derives it.
  const [ctPicks, setCtPicks] = useState<readonly (TargetRef | null)[]>([])
  const activeTargeting: Targeting | null = useMemo(
    () =>
      targeting ??
      (chooseTargetsAction
        ? {
            kind: 'choose-targets',
            source: chooseTargetsAction.source,
            abilityIndex: 0,
            label:
              chooseTargetsAction.prompt ??
              (chooseTargetsAction.current !== undefined
                ? `Choose new targets for the copy of ${chooseTargetsAction.cardName}`
                : `Choose targets for ${chooseTargetsAction.cardName}`),
            specs: chooseTargetsAction.specs,
            options: chooseTargetsAction.options,
            picked: ctPicks,
            ...(chooseTargetsAction.current !== undefined ? { current: chooseTargetsAction.current } : {}),
            ...(chooseTargetsAction.divide !== undefined ? { divide: chooseTargetsAction.divide } : {}),
            facts: viewTargetFacts(view),
          }
        : null),
    [targeting, chooseTargetsAction, ctPicks, view],
  )
  const canPass = actions.some((a) => a.kind === 'pass-priority')
  // Only the active player may skip the rest of their own turn — a defender
  // holding priority to respond during it shouldn't get this button.
  const canPassTurn = canPass && seat === view.activePlayer

  const mode:
    | 'discard'
    | 'attackers'
    | 'blockers'
    | 'choose-from-zone'
    | 'mulligan'
    | 'put-on-bottom'
    | 'commander-replacement'
    | 'pay-life-for-untapped'
    | 'miracle-reveal'
    | 'reveal-for-untapped'
    | 'choose-copy'
    | 'choose-enchant'
    | 'legend-rule'
    | 'order-triggers'
    | 'choose-creature-type'
    | 'choose-card-name'
    | 'separate-piles'
    | 'choose-pile'
    | 'choose-modes'
    | 'sacrifice'
    | 'proliferate'
    | 'split-mana'
    | 'time-travel'
    | 'remove-counters'
    | 'venture'
    | 'choose-permanents'
    | 'scry'
    | 'choose-x'
    | 'choose-cast-modes'
    | 'choose-escape-exile'
    | 'choose-delve'
    | 'choose-sacrifice'
    | 'choose-tap'
    | 'choose-convoke'
    | 'choose-waterbend'
    | 'choose-division'
    | 'choose-phyrexian'
    | 'assign-combat-damage'
    | 'targeting'
    | 'cast-now'
    | 'priority' = mulliganAction
    ? 'mulligan'
    : commanderChoiceAction
      ? 'commander-replacement'
    : shockChoiceAction
      ? 'pay-life-for-untapped'
    : miracleChoiceAction
      ? 'miracle-reveal'
    : revealChoiceAction
      ? 'reveal-for-untapped'
      : copyChoiceAction
        ? 'choose-copy'
        : enchantAction
          ? 'choose-enchant'
        : legendAction
          ? 'legend-rule'
        : triggerOrderAction
          ? 'order-triggers'
        : creatureTypeChoiceAction
          ? 'choose-creature-type'
        : cardNameChoiceAction
          ? 'choose-card-name'
        : separatePilesAction
          ? 'separate-piles'
        : choosePileAction
          ? 'choose-pile'
        : modesChoiceAction
          ? 'choose-modes'
        : sacrificeAction
          ? 'sacrifice'
        : proliferateAction
          ? 'proliferate'
        : splitManaAction
          ? 'split-mana'
        : timeTravelAction
          ? 'time-travel'
        : removeCountersAction
          ? 'remove-counters'
        : ventureAction
          ? 'venture'
        : choosePermanentsAction
          ? 'choose-permanents'
        : scryAction
          ? 'scry'
        : assignDamageAction
          ? 'assign-combat-damage'
        : bottomAction
          ? 'put-on-bottom'
      : discardAction
        ? 'discard'
          : attackAction
            ? 'attackers'
            : blockAction
              ? 'blockers'
              : zoneChoiceAction
                ? 'choose-from-zone'
                : pendingEscape
                  ? 'choose-escape-exile'
                : pendingDelve
                  ? 'choose-delve'
                : pendingModes
                  ? 'choose-cast-modes'
                : pendingX
                  ? 'choose-x'
                  : pendingSac
                    ? 'choose-sacrifice'
                    : pendingTap
                      ? 'choose-tap'
                    : pendingConvoke
                      ? 'choose-convoke'
                    : pendingWaterbend
                      ? 'choose-waterbend'
                    : pendingDivision
                      ? 'choose-division'
                    : pendingPhyrexian
                      ? 'choose-phyrexian'
                    : pendingManaSplit
                      ? 'split-mana'
                    : activeTargeting
                      ? 'targeting'
                    // Last: once a variant is picked, its X / modes / targets
                    // steps above take over until the cast goes out.
                    : castNowAction
                      ? 'cast-now'
                      : 'priority'

  // Every mode but the mulligan keeps the hand in its fixed tray (mulligan
  // shows the hand in its own centered popup instead -- see
  // renderMulliganModal). This is what keeps .quadrant-grid from losing
  // height (and recomputeBoardMiniW crushing the board's mini tiles to
  // compensate) every time a decision comes up -- see renderHandStrip/the
  // .decision-banner CSS. A decision that picks cards out of the hand
  // (discard, put-on-bottom, a reveal land's reveal) holds the tray open instead (`handForcedOpen`)
  // and asks in the same bottom-right banner as every other decision: docking
  // its controls beside the hand used to pull the whole strip out of the tray
  // and squash the board for as long as it was up.
  const peekable = mode !== 'mulligan'
  const handForcedOpen =
    mode === 'discard' || mode === 'put-on-bottom' || mode === 'reveal-for-untapped'

  // --- dispatch helpers --------------------------------------------
  const pass = useCallback(() => {
    if (canPass) game.dispatch({ type: 'pass-priority', player: seat })
  }, [canPass, game, seat])

  const finishTargets = useCallback(
    // Named, so the division step's `resume` can call back into it.
    function finish(
      t: Pick<
        Targeting,
        | 'kind'
        | 'source'
        | 'abilityIndex'
        | 'xValue'
        | 'sacrifice'
        | 'escapeExile'
        | 'delve'
        | 'via'
        | 'face'
        | 'modes'
        | 'kicked'
        | 'kickCount'
        | 'prototype'
        | 'offspring'
        | 'evoke'
        | 'evokeCost'
        | 'overload'
        | 'free'
        | 'manaColors'
        | 'altCost'
        | 'costOption'
        | 'splice'
        | 'graveyardGrant'
        | 'tapCost'
        | 'tap'
        | 'sneakReturn'
        | 'webSlingingReturn'
        | 'convokeOffer'
        | 'waterbendOffer'
        | 'divide'
        | 'phyrexianPips'
      >,
      targets: readonly (TargetRef | null)[],
      division?: readonly number[],
      phyrexianLife?: number,
    ): void {
      const action: Action =
        t.kind === 'choose-targets'
          ? {
              type: 'choose-targets',
              player: seat,
              targets: [...targets],
              ...(division !== undefined ? { division: [...division] } : {}),
            }
          : t.kind === 'cast'
            ? {
                type: 'cast-spell',
                player: seat,
                card: t.source,
                targets: [...targets],
                ...(t.modes !== undefined ? { modes: [...t.modes] } : {}),
                ...(t.xValue !== undefined ? { xValue: t.xValue } : {}),
                ...(t.via !== undefined ? { via: t.via } : {}),
                ...(t.face !== undefined ? { face: t.face } : {}),
                ...(t.kicked === true ? { kicked: true } : {}),
                ...(t.kickCount !== undefined ? { kickCount: t.kickCount } : {}),
                ...(t.prototype === true ? { prototype: true } : {}),
                ...(t.offspring === true ? { offspring: true } : {}),
                ...(t.evoke === true ? { evoke: true, evokeCost: t.evokeCost } : {}),
                ...(t.overload === true ? { overload: true } : {}),
                ...(t.free === true ? { free: true } : {}),
                ...(t.altCost === true ? { altCost: true } : {}),
                ...(t.costOption !== undefined ? { costOption: t.costOption } : {}),
                ...(t.splice !== undefined ? { splice: [...t.splice] } : {}),
                ...(t.graveyardGrant !== undefined ? { graveyardGrant: t.graveyardGrant } : {}),
                ...(t.sacrifice !== undefined ? { sacrifice: t.sacrifice } : {}),
                ...(t.escapeExile !== undefined ? { escapeExile: [...t.escapeExile] } : {}),
                ...(t.delve !== undefined && t.delve.length > 0 ? { delve: [...t.delve] } : {}),
                ...(t.tap !== undefined ? { tap: [...t.tap] } : {}),
                ...(t.sneakReturn !== undefined ? { sneakReturn: t.sneakReturn } : {}),
                ...(t.webSlingingReturn !== undefined ? { webSlingingReturn: t.webSlingingReturn } : {}),
                ...(division !== undefined ? { division: [...division] } : {}),
                ...(phyrexianLife !== undefined && phyrexianLife > 0 ? { phyrexianLife } : {}),
              }
            : {
                type: 'activate-ability',
                player: seat,
                source: t.source,
                abilityIndex: t.abilityIndex,
                targets: [...targets],
                ...(t.modes !== undefined ? { modes: [...t.modes] } : {}),
                ...(t.sacrifice !== undefined ? { sacrifice: t.sacrifice } : {}),
                ...(t.xValue !== undefined ? { xValue: t.xValue } : {}),
                ...(t.manaColors !== undefined ? { manaColors: t.manaColors } : {}),
                ...(division !== undefined ? { division: [...division] } : {}),
                ...(phyrexianLife !== undefined && phyrexianLife > 0 ? { phyrexianLife } : {}),
              }
      // Two or more targets to divide among: ask how, then carry on from here
      // with the answer. One takes it all, which the engine works out itself.
      const members =
        t.divide === undefined
          ? []
          : targets.slice(t.divide.slot).filter((r): r is TargetRef => r !== null)
      if (t.divide !== undefined && division === undefined && members.length >= 2) {
        // "X damage divided" (Fire Covenant): the X just chosen.
        const total = t.divide.x === true ? (t.xValue ?? 0) : t.divide.total
        const base = Math.floor(total / members.length)
        setPendingDivision({
          total,
          of: t.divide.of ?? 'damage',
          upTo: t.divide.upTo === true,
          targets: members,
          shares: members.map((_m, i) => base + (i < total % members.length ? 1 : 0)),
          // Back into this with the split: everything it needs is in the
          // arguments, so an earlier render's copy does as well.
          resume: (chosen) => finish(t, targets, chosen),
        })
        return
      }
      // Phyrexian mana (rule 107.4f): how many pips to pay with life, the
      // caster's call. Asked once, then on with the answer.
      if (
        t.phyrexianPips !== undefined &&
        t.phyrexianPips > 0 &&
        phyrexianLife === undefined &&
        action.type !== 'choose-targets'
      ) {
        setPendingPhyrexian({
          pips: t.phyrexianPips,
          resume: (n) => finish(t, targets, division, n),
        })
        return
      }
      const convoke = t.convokeOffer
      if (convoke !== undefined && action.type === 'cast-spell') {
        setPendingConvoke({
          action,
          offer: convoke,
          // A spell mana alone can't pay starts from a set known to work.
          picks: convoke.manaAffordable ? [] : convoke.proof.map((p) => p.creature),
        })
        return
      }
      // Waterbend (rule 701.67a): which artifacts and creatures tap for the
      // waterbend part, at the X chosen. Nothing to tap for at this X (X=0)
      // asks nothing; mana pays it.
      const bend = t.waterbendOffer
      if (bend !== undefined && action.type !== 'choose-targets') {
        const at = waterbendAt(bend, t.xValue ?? 0)
        if (at.max > 0) {
          setPendingWaterbend({ action, offer: bend, max: at.max, least: at.proof.length, picks: [...at.proof] })
          return
        }
      }
      const offer = t.tapCost
      if (offer === undefined || action.type === 'choose-targets') {
        game.dispatch(action)
        return
      }
      // Exactly as much as the cost needs leaves nothing to choose. (Crew
      // always asks: which creatures crew is the player's call.)
      const every = allTapChoices(offer)
      if (offer.totalPower === undefined && every.length === offer.count) {
        game.dispatch({ ...action, tap: every })
        return
      }
      setPendingTap({ action, offer, picks: [] })
    },
    [game, seat],
  )

  const beginTargeting = useCallback(
    (t: Omit<Targeting, 'picked'>) => {
      // Nothing to choose — no slots, or only an "any number of" group with
      // no candidates, whose empty choice is the only one.
      if (t.specs.length === 0 || (anyNumberSlot(t.specs) === 0 && slotOptions(t.specs, t.options, 0, []).length === 0)) {
        finishTargets(t, [])
        return
      }
      setTargeting({ ...t, picked: [], facts: viewTargetFacts(view) })
    },
    [finishTargets, view],
  )

  /** Cast, past the additional-cost step — `chosen` holds the costs picked so
   * far: the permanent a `CardDefinition.additionalCost` sacrifices (Harrow:
   * "sacrifice a land") and, once asked, the cards an escape cast exiles. */
  const startCast = useCallback(
    (cast: CastAction, chosen: CastPicks = {}) => {
      // Escape (rule 702.139a): which other graveyard cards pay the exile
      // half of the cost is the caster's choice. Asked next, before modes / X
      // / targets — unless the graveyard holds exactly as many as the cost
      // needs, which leaves nothing to choose.
      const escape = cast.escapeExile
      if (
        escape !== undefined &&
        chosen.escapeExile === undefined &&
        escape.choices.length !== escape.count
      ) {
        setPendingEscape({
          cast,
          offer: escape,
          ...(chosen.sacrifice !== undefined ? { sacrifice: chosen.sacrifice } : {}),
        })
        return
      }
      const paid: Omit<CastPicks, 'delve'> = {
        ...(chosen.sacrifice !== undefined ? { sacrifice: chosen.sacrifice } : {}),
        ...(chosen.escapeExile !== undefined
          ? { escapeExile: chosen.escapeExile }
          : escape !== undefined
            ? { escapeExile: escape.choices }
            : {}),
      }
      // Delve (rule 702.66a): which graveyard cards pay generic mana, and how
      // many. Asked next, unless there's no choice: every card it may exile,
      // all of them needed.
      const delve = cast.delve
      const noDelveChoice =
        delve !== undefined &&
        delve.minCards === delve.maxCards &&
        delve.choices.length === delve.maxCards
      // An {X} spell asks after X, whose range it depends on (`confirmX`).
      const delveAfterX = delve?.byX !== undefined
      if (delve !== undefined && chosen.delve === undefined && !noDelveChoice && !delveAfterX) {
        setPendingDelve({ cast, offer: delve, ...paid })
        return
      }
      const delved = chosen.delve ?? (noDelveChoice && !delveAfterX ? delve?.choices : undefined)
      const picks: CastPicks = { ...paid, ...(delved !== undefined ? { delve: delved } : {}) }
      if (cast.castModal) {
        setPendingModes({ cast, picked: [], ...picks })
        return
      }
      // An offer whose targets fix X (Stolen by the Fae's "mana value X")
      // has nothing to ask.
      const fixedX =
        cast.xCost?.minX !== undefined && cast.xCost.minX === cast.xCost.maxX ? cast.xCost.maxX : undefined
      if (cast.xCost && fixedX === undefined) {
        setPendingX({ action: cast, value: cast.xCost.maxX, ...picks })
        return
      }
      beginTargeting({
        kind: 'cast',
        source: cast.card,
        abilityIndex: 0,
        label: `Cast ${cast.cardName}`,
        specs: cast.targetSpecs,
        options: cast.targetOptions,
        ...(fixedX !== undefined ? { xValue: fixedX } : {}),
        ...castExtras(cast),
        ...picks,
      })
    },
    [beginTargeting],
  )

  /** A cast's targeting, at the X chosen, with the costs picked so far. */
  const castAtX = useCallback(
    (action: CastAction, value: number, picks: CastPicks) => {
      // Where X and the number of targets trade off (Fireball's "{1} more
      // for each target beyond the first"), the X chosen leaves only some
      // counts payable.
      const atX = action.targetCount === undefined ? null : targetCountAtX(action.targetCount, action.xCost, value)
      // A modal spell's targets are its chosen modes', in order (rule 700.2).
      const chosen = picks.modes?.map((i) => action.castModal?.modes[i]).filter((m) => m !== undefined)
      beginTargeting({
        kind: 'cast',
        source: action.card,
        abilityIndex: 0,
        label: `Cast ${action.cardName}`,
        // A target count tied to X (Curse of the Swine, Heliod's
        // Intervention's "X target artifacts") is fixed by it.
        // Each mode's slot relations are its own: moved to where its slots sit.
        specs: specsAtX(chosen ? concatModeSpecs(chosen.map((m) => m.targetSpecs)) : action.targetSpecs, value),
        options: chosen ? chosen.flatMap((m) => m.targetOptions) : action.targetOptions,
        xValue: value,
        ...castExtras(action),
        ...(atX !== null ? { targetCount: atX } : {}),
        ...picks,
      })
    },
    [beginTargeting],
  )

  /** The delve choice's Confirm: carry on casting with those cards. */
  const confirmDelve = useCallback(
    (delve: readonly ObjectId[]) => {
      if (!pendingDelve) return
      const { cast, offer: _offer, xValue, ...picks } = pendingDelve
      setPendingDelve(null)
      if (xValue !== undefined) castAtX(cast, xValue, { ...picks, delve })
      else startCast(cast, { ...picks, delve })
    },
    [pendingDelve, startCast, castAtX],
  )

  /** The escape choice's Confirm: carry on casting with those cards. */
  const confirmEscapeExile = useCallback(
    (escapeExile: readonly ObjectId[]) => {
      if (!pendingEscape) return
      const { cast, sacrifice } = pendingEscape
      setPendingEscape(null)
      startCast(cast, { ...(sacrifice !== undefined ? { sacrifice } : {}), escapeExile })
    },
    [pendingEscape, startCast],
  )

  const beginCast = useCallback(
    (cast: CastAction) => {
      // An additional sacrifice cost (rule 601.2f) is chosen first, before
      // modes / X / targets — same order the rules announce costs in.
      if (cast.sacrifice) {
        if (cast.sacrifice.choices.length === 0) return
        if (cast.sacrifice.choices.length === 1) {
          startCast(cast, { sacrifice: cast.sacrifice.choices[0] })
        } else {
          setPendingSac(cast)
        }
        return
      }
      startCast(cast)
    },
    [startCast],
  )

  // Confirm the chosen modes for a targeted modal spell (Phase 11 EG-2) →
  // proceed to targeting over the union of those modes' target specs.
  const confirmModes = useCallback(() => {
    if (!pendingModes?.cast.castModal) return
    const { cast, picked, ...picks } = pendingModes
    const modes = [...picked].sort((a, b) => a - b)
    setPendingModes(null)
    // A modal spell with {X} (Clan Defiance) announces X after its modes
    // (rule 601.2b), then its targets at that X.
    const fixedX =
      cast.xCost?.minX !== undefined && cast.xCost.minX === cast.xCost.maxX ? cast.xCost.maxX : undefined
    if (cast.xCost && fixedX === undefined) {
      setPendingX({ action: cast, value: cast.xCost.maxX, ...picks, modes })
      return
    }
    const chosen = modes.map((i) => cast.castModal!.modes[i])
    beginTargeting({
      kind: 'cast',
      source: cast.card,
      abilityIndex: 0,
      label: `Cast ${cast.cardName}`,
      // No {X} to pay is X of 0 (rule 107.3b), or the one X its targets fix.
      specs: specsAtX(concatModeSpecs(chosen.map((m) => m.targetSpecs)), fixedX ?? 0),
      options: chosen.flatMap((m) => m.targetOptions),
      modes,
      ...(fixedX !== undefined ? { xValue: fixedX } : {}),
      ...castExtras(cast),
      ...picks,
    })
  }, [beginTargeting, pendingModes])

  /** Dispatch / begin one playable face of a hand card. */
  const playFace = useCallback(
    (a: CastAction | LandAction) => {
      if (a.kind === 'play-land') {
        game.dispatch({
          type: 'play-land',
          player: seat,
          card: a.card,
          ...(a.face !== undefined ? { face: a.face } : {}),
          ...(a.graveyardGrant !== undefined ? { graveyardGrant: a.graveyardGrant } : {}),
        })
      } else {
        beginCast(a)
      }
    },
    [beginCast, game, seat],
  )

  const startAbilityAtX = useCallback(
    (action: AbilityAction, value: number) => {
      beginTargeting({
        kind: 'activate',
        source: action.source,
        abilityIndex: action.abilityIndex,
        label: action.text || `${action.cardName} ability`,
        specs: action.targetSpecs,
        options: action.targetOptions,
        xValue: value,
        ...(action.modes !== undefined ? { modes: action.modes } : {}),
        ...(action.tapCost !== undefined ? { tapCost: action.tapCost } : {}),
        ...(action.waterbend !== undefined && action.waterbend.choices.length > 0
          ? { waterbendOffer: action.waterbend }
          : {}),
        ...(action.divide !== undefined ? { divide: action.divide } : {}),
        ...(action.phyrexianPips !== undefined ? { phyrexianPips: action.phyrexianPips } : {}),
      })
    },
    [beginTargeting],
  )

  const confirmX = useCallback(() => {
    if (!pendingX) return
    const { action, value, ...picks } = pendingX
    setPendingX(null)
    if (action.kind === 'activate-ability') {
      startAbilityAtX(action, value)
      return
    }
    // Delve on an {X} spell (rule 702.66a): its range at this X, asked now.
    const range = action.delve?.byX?.[value]
    if (action.delve !== undefined && range !== undefined && picks.delve === undefined && range.maxCards > 0) {
      const { choices } = action.delve
      if (range.minCards === range.maxCards && choices.length === range.maxCards) {
        castAtX(action, value, { ...picks, delve: choices })
        return
      }
      setPendingDelve({
        cast: action,
        offer: { choices, minCards: range.minCards, maxCards: range.maxCards },
        xValue: value,
        ...picks,
      })
      return
    }
    castAtX(action, value, picks)
  }, [castAtX, pendingX, startAbilityAtX])

  const startAbility = useCallback(
    (ab: AbilityAction, sacrifice?: ObjectId) => {
      beginTargeting({
        kind: 'activate',
        source: ab.source,
        abilityIndex: ab.abilityIndex,
        label: ab.text || `${ab.cardName} ability`,
        specs: ab.targetSpecs,
        options: ab.targetOptions,
        ...(sacrifice !== undefined ? { sacrifice } : {}),
        ...(ab.manaColors !== undefined ? { manaColors: ab.manaColors } : {}),
        // A modal ability is offered once per mode (rule 700.2b).
        ...(ab.modes !== undefined ? { modes: ab.modes } : {}),
        ...(ab.tapCost !== undefined ? { tapCost: ab.tapCost } : {}),
        ...(ab.waterbend !== undefined && ab.waterbend.choices.length > 0 ? { waterbendOffer: ab.waterbend } : {}),
        ...(ab.divide !== undefined ? { divide: ab.divide } : {}),
        ...(ab.phyrexianPips !== undefined ? { phyrexianPips: ab.phyrexianPips } : {}),
      })
    },
    [beginTargeting],
  )

  const clickAbility = useCallback(
    (ab: AbilityAction) => {
      if (ab.xCost) {
        // An offer whose targets fix X (Rydia's "Saga card with mana value
        // X") has nothing to ask.
        if (ab.xCost.minX === ab.xCost.maxX) {
          startAbilityAtX(ab, ab.xCost.maxX)
          return
        }
        setPendingX({ action: ab, value: ab.xCost.maxX })
        return
      }
      if (ab.manaSplit) {
        setManaSplit({})
        setPendingManaSplit(ab)
        return
      }
      if (ab.sacrifice) {
        if (ab.sacrifice.choices.length === 0) return
        if (ab.sacrifice.choices.length === 1) {
          startAbility(ab, ab.sacrifice.choices[0])
        } else {
          setPendingSac(ab)
        }
        return
      }
      startAbility(ab)
    },
    [startAbility, startAbilityAtX],
  )

  const pickTarget = useCallback(
    // `null` skips the current slot, which is legal only for an optional one
    // — the Skip button is only rendered for those.
    (ref: TargetRef | null) => {
      const t = activeTargeting
      if (!t) return
      const derived = t.kind === 'choose-targets'
      const commit = (picked: readonly (TargetRef | null)[]): void => {
        if (derived) setCtPicks(picked)
        else setTargeting({ ...t, picked })
      }
      // Dispatch outside any state updater (updaters must be pure; React
      // double-invokes them in dev).
      const finish = (picked: readonly (TargetRef | null)[]): void => {
        if (derived) setCtPicks([])
        else setTargeting(null)
        finishTargets(t, picked)
      }
      const group = anyNumberSlot(t.specs)
      if (inTargetGroup(t)) {
        // Another member of an "any number of" group — or `null`, Done.
        if (ref === null) {
          if (!mayFinishGroup(t)) return
          finish(t.picked)
          return
        }
        const picked = [...t.picked, ref]
        // Every candidate taken leaves nothing to add.
        if (slotOptions(t.specs, t.options, picked.length, picked, t.facts).length === 0) finish(picked)
        else commit(picked)
        return
      }
      const picked = [...t.picked, ref]
      // The fixed slots are done and the group has no candidates: none it is.
      if (group >= 0 && picked.length === group && (t.options[group] ?? []).length === 0) {
        finish(picked)
        return
      }
      if (picked.length < t.specs.length) {
        commit(picked)
        return
      }
      finish(picked)
    },
    [activeTargeting, finishTargets],
  )

  /** An "any number of" group's members picked from a popup at once, which
   * ends the group. */
  const pickTargetGroup = useCallback(
    (refs: readonly TargetRef[]) => {
      const t = activeTargeting
      if (!t) return
      if (t.kind === 'choose-targets') setCtPicks([])
      else setTargeting(null)
      finishTargets(t, [...t.picked, ...refs])
    },
    [activeTargeting, finishTargets],
  )

  /** Take a member already picked back out of an "any number of" group. */
  const unpickTarget = useCallback(
    (ref: TargetRef): boolean => {
      const t = activeTargeting
      if (!t || !inTargetGroup(t)) return false
      const group = anyNumberSlot(t.specs)
      const same = (r: TargetRef | null): boolean =>
        r !== null &&
        (r.kind === 'player'
          ? ref.kind === 'player' && r.player === ref.player
          : ref.kind === 'object' && r.object === ref.object)
      if (!t.picked.slice(group).some(same)) return false
      const picked = [...t.picked.slice(0, group), ...t.picked.slice(group).filter((r) => !same(r))]
      if (t.kind === 'choose-targets') setCtPicks(picked)
      else setTargeting({ ...t, picked })
      return true
    },
    [activeTargeting],
  )

  const clickHandCard = useCallback(
    (id: ObjectId) => {
      if (mode === 'discard') {
        if (!discardAction) return
        // A cost can name a kind of card ("Discard a creature card"): only
        // the offered ones can be picked.
        if (!discardAction.from.includes(id)) return
        setDiscardPicks((cur) => {
          if (cur.includes(id)) return cur.filter((x) => x !== id)
          if (cur.length >= discardAction.count) return cur
          return [...cur, id]
        })
        return
      }
      if (mode === 'reveal-for-untapped') {
        // One card, of the kinds the land names: clicking it again unpicks it.
        if (!revealChoiceAction?.options.includes(id)) return
        setRevealPick((cur) => (cur === id ? null : id))
        return
      }
      if (mode === 'put-on-bottom') {
        if (!bottomAction) return
        setBottomPicks((cur) => {
          if (cur.includes(id)) return cur.filter((x) => x !== id)
          if (cur.length >= bottomAction.count) return cur
          return [...cur, id]
        })
        return
      }
      if (mode !== 'priority') return
      const opts = playFacesByCard.get(id) ?? []
      // A multi-face card shows a button per face (below the tile) — a bare
      // click does nothing so the choice stays explicit.
      if (opts.length === 1) playFace(opts[0])
    },
    [bottomAction, discardAction, revealChoiceAction, mode, playFace, playFacesByCard],
  )

  /** Which id a click on a (possibly stacked) tile should act on. */
  const pickIdForClick = useCallback(
    (ids: readonly ObjectId[]): ObjectId => {
      if (mode === 'targeting' && activeTargeting) {
        const slot = currentSlotOptions(activeTargeting)
        const found = ids.find((i) =>
          slot.some((o) => o.kind === 'object' && o.object === i),
        )
        if (found) return found
      }
      if (mode === 'choose-sacrifice' && pendingSac?.sacrifice !== undefined) {
        const choices = pendingSac.sacrifice.choices
        const found = ids.find((i) => choices.includes(i))
        if (found) return found
      }
      if (mode === 'choose-copy' && copyChoiceAction) {
        const found = ids.find((i) => copyChoiceAction.options.includes(i))
        if (found) return found
      }
      // A tile standing for several identical permanents: take a member not
      // already picked, so a second click picks the next one rather than
      // un-picking the first.
      const picking =
        mode === 'choose-tap'
          ? pendingTap
          : mode === 'choose-convoke'
            ? pendingConvoke
            : mode === 'choose-waterbend'
              ? pendingWaterbend
            : mode === 'choose-permanents'
              ? { picks: permanentPicks }
              : mode === 'separate-piles'
                ? { picks: pilePicks }
                : null
      if (picking) {
        const fresh = ids.find((i) => !picking.picks.includes(i))
        if (fresh !== undefined) return fresh
      }
      return ids[0]
    },
    [mode, activeTargeting, pendingSac, copyChoiceAction, pendingTap, pendingConvoke, pendingWaterbend, permanentPicks, pilePicks],
  )

  const clickPermanent = useCallback(
    (ids: readonly ObjectId[]) => {
      const id = pickIdForClick(ids)
      if (mode === 'choose-sacrifice' && pendingSac?.sacrifice !== undefined) {
        // One click is the whole answer: the cost names one permanent.
        if (!pendingSac.sacrifice.choices.includes(id)) return
        const sacChoice = pendingSac
        setPendingSac(null)
        if (sacChoice.kind === 'cast-spell') startCast(sacChoice, { sacrifice: id })
        else startAbility(sacChoice, id)
        return
      }
      if (mode === 'targeting' && activeTargeting) {
        const slot = currentSlotOptions(activeTargeting)
        if (slot.some((o) => o.kind === 'object' && o.object === id)) {
          pickTarget({ kind: 'object', object: id })
        } else {
          unpickTarget({ kind: 'object', object: id })
        }
        return
      }
      if (mode === 'attackers' && attackAction) {
        // An opponent's planeswalker is a defender, not an attacker, so a
        // click on one sends the pending group at it (the same thing
        // clicking a seat panel does).
        // Over the whole tile — several folded tokens, or a compacted
        // stack's members (game/stackMembers.ts) — and a click takes one
        // that isn't attacking yet (game/attackGroups.ts).
        const members = expandIds(ids, stackMembers)
        // Building a band: an attacking creature goes in or out of it.
        if (bandDraft !== null) {
          const attackingReal = [...new Set(members.filter((m) => attackAssignments[m] !== undefined).map(realId))]
          if (attackingReal.length === 0) return
          setBandDraft((cur) => {
            const now = cur ?? []
            return attackingReal.every((r) => now.includes(r))
              ? now.filter((r) => !attackingReal.includes(r))
              : [...now, ...attackingReal.filter((r) => !now.includes(r))]
          })
          return
        }
        if (!members.some((i) => attackAction.eligible.includes(i))) {
          sendPicksAt(id)
          return
        }
        // A tile of several — a token stack, or identical tokens folded
        // together — asks how many attack each defender, in a popup beside
        // it (the user's ask, 2026-10-07), rather than taking one a click.
        if (members.filter((i) => attackAction.eligible.includes(i)).length > 1) {
          setAttackSplit((cur) => (cur?.anchor === id ? null : { anchor: id, members }))
          return
        }
        const fresh = freeAttacker(members, attackAction.eligible, attackAssignments, attackPicks)
        if (fresh === null) {
          // Every member is attacking or waiting already: take the tile back
          // out of the attack. One creature's tile toggles, as it always
          // did; a stack's count row in the bar takes out fewer.
          setAttackAssignments((cur) => {
            const next = { ...cur }
            for (const i of members) delete next[i]
            return next
          })
          setAttackPicks((cur) => cur.filter((x) => !members.includes(x)))
          return
        }
        const myDefenders = defendersFor(fresh)
        // No choice to make, so don't make the player make one: a creature
        // with exactly one legal defender is assigned outright. That is what
        // keeps a two-player board at one click per attacker, and it also
        // covers a goaded creature whose goader is its only legal target.
        if (myDefenders.length === 1) {
          setAttackAssignments((cur) => ({ ...cur, [fresh]: myDefenders[0] }))
          return
        }
        setAttackPicks((cur) => [...cur, fresh])
        return
      }
      if (mode === 'assign-combat-damage' && assignDamageAction && damageAnswer) {
        // All of them, not just the one `pickIdForClick` picked.
        const members = damageMembersOf(ids)
        if (members.length > 0) {
          setDamagePicks(clickMembers(assignDamageAction, members, damageAnswer))
        }
        return
      }
      if (mode === 'choose-tap' && pendingTap) {
        const { offer } = pendingTap
        if (!offer.choices.includes(id)) return
        if ((offer.copies?.[id] ?? 1) > 1) {
          setStackMenu((cur) => (cur === id ? null : id))
          return
        }
        setPendingTap((cur) =>
          cur === null
            ? cur
            : {
                ...cur,
                picks: cur.picks.includes(id)
                  ? cur.picks.filter((x) => x !== id)
                  : // Crew taps any number; a count-based cost swaps out its oldest pick.
                    offer.totalPower === undefined && cur.picks.length >= offer.count
                    ? [...cur.picks.slice(1), id]
                    : [...cur.picks, id],
              },
        )
        return
      }
      if (mode === 'choose-convoke' && pendingConvoke) {
        const { offer } = pendingConvoke
        if (!offer.candidates.includes(id)) return
        if ((offer.copies?.[id] ?? 1) > 1) {
          setStackMenu((cur) => (cur === id ? null : id))
          return
        }
        setPendingConvoke((cur) =>
          cur === null
            ? cur
            : {
                ...cur,
                picks: cur.picks.includes(id)
                  ? cur.picks.filter((x) => x !== id)
                  : cur.picks.length >= offer.maxCreatures
                    ? cur.picks
                    : [...cur.picks, id],
              },
        )
        return
      }
      if (mode === 'choose-waterbend' && pendingWaterbend) {
        const { offer } = pendingWaterbend
        if (!offer.choices.includes(id)) return
        if ((offer.copies?.[id] ?? 1) > 1) {
          setStackMenu((cur) => (cur === id ? null : id))
          return
        }
        setPendingWaterbend((cur) =>
          cur === null
            ? cur
            : {
                ...cur,
                picks: cur.picks.includes(id)
                  ? cur.picks.filter((x) => x !== id)
                  : cur.picks.length >= cur.max
                    ? cur.picks
                    : [...cur.picks, id],
              },
        )
        return
      }
      if (mode === 'choose-enchant' && enchantAction) {
        if (enchantAction.options.includes(id)) {
          game.dispatch({ type: 'choose-enchant', player: seat, enchant: id })
        }
        return
      }
      if (mode === 'choose-copy' && copyChoiceAction) {
        if (copyChoiceAction.options.includes(id)) {
          game.dispatch({ type: 'choose-copy', player: seat, copy: id })
        }
        return
      }
      if (mode === 'legend-rule' && legendAction) {
        if (legendAction.options.includes(id)) {
          game.dispatch({ type: 'legend-rule', player: seat, keep: id })
        }
        return
      }
      if (mode === 'sacrifice' && sacrificeAction) {
        if (!sacrificeAction.eligible.includes(id)) return
        // A compacted token stack is one tile standing for several tokens, so
        // how many of it to give up is a choice, not a toggle — it gets the
        // count menu instead.
        if ((sacrificeAction.copies?.[id] ?? 1) > 1) {
          setStackMenu((cur) => (cur === id ? null : id))
          return
        }
        setSacrificePicks((cur) =>
          cur.includes(id)
            ? cur.filter((x) => x !== id)
            : cur.length >= sacrificeAction.count
              ? [...cur.slice(1), id]
              : [...cur, id],
        )
        return
      }
      if (mode === 'choose-permanents' && choosePermanentsAction) {
        if (!choosePermanentsAction.eligible.includes(id)) return
        // A token stack is one tile for several tokens: how many of it is a
        // count, as for a sacrifice.
        if ((choosePermanentsAction.copies?.[id] ?? 1) > 1) {
          setStackMenu((cur) => (cur === id ? null : id))
          return
        }
        setPermanentPicks((cur) =>
          cur.includes(id)
            ? cur.filter((x) => x !== id)
            : cur.length >= choosePermanentsAction.max
              ? [...cur.slice(1), id]
              : [...cur, id],
        )
        return
      }
      if (mode === 'remove-counters' && removeCountersAction) {
        setCounterPicks((cur) => nextCounterPick(removeCountersAction, cur, id))
        return
      }
      // Separating permanents (rule 700.3): a click moves one between the
      // piles — into the first, or back out of it.
      if (mode === 'separate-piles' && separatePilesAction && pilesOnBoard) {
        if (!separatePilesAction.objects.includes(id)) return
        setPilePicks((cur) => (cur.includes(id) ? cur.filter((x) => x !== id) : [...cur, id]))
        return
      }
      if (mode === 'time-travel' && timeTravelAction) {
        if (!timeTravelAction.eligible.includes(id)) return
        // The brush says which way a click goes; clicking the same way again
        // leaves it be.
        setTimeTravelPicks((cur) => {
          const next = { ...cur }
          if (next[id] === timeTravelBrush) delete next[id]
          else next[id] = timeTravelBrush
          return next
        })
        return
      }
      if (mode === 'proliferate' && proliferateAction) {
        if (!eligibleToProliferate(proliferateAction, id)) return
        // A plain toggle, with no cap: "any number" has no count to enforce,
        // which is the one thing that makes this different from every other
        // multi-select decision on the board.
        setProliferatePicks((cur) =>
          cur.some((t) => t.kind === 'object' && t.object === id)
            ? cur.filter((t) => !(t.kind === 'object' && t.object === id))
            : [...cur, { kind: 'object', object: id }],
        )
        return
      }
      if (mode === 'blockers' && blockAction) {
        // Over the whole tile, not `id`: a folded tile is several creatures,
        // and a click takes one that fits (game/blockGroups.ts). A compacted
        // stack is its members here (game/stackMembers.ts).
        const members = expandIds(ids, stackMembers)
        // A creature that can block more than one attacker, already blocking
        // and with room left: a click picks it up for one more (Two-Headed
        // Giant of Foriys); full, it comes out of every block.
        const multi = members.length === 1 ? blockAction.eligible.find((e) => e.blocker === members[0]) : undefined
        if (multi?.maxBlocks !== undefined && blockAssign[multi.blocker] !== undefined) {
          const held = 1 + (blockExtra[multi.blocker]?.length ?? 0)
          if (held < multi.maxBlocks && blockFocus !== multi.blocker) {
            setBlockFocus(multi.blocker)
            return
          }
          setBlockAssign((cur) => {
            const next = { ...cur }
            delete next[multi.blocker]
            return next
          })
          setBlockExtra((cur) => {
            const next = { ...cur }
            delete next[multi.blocker]
            return next
          })
          setBlockFocus(null)
          return
        }
        if (members.some((i) => blockAction.eligible.some((e) => e.blocker === i))) {
          const fresh = freeBlocker(members, blockAction, blockAssign, blockFocus)
          if (fresh === null) {
            // Every member is blocking or waiting for an attacker already:
            // the click takes the tile back out of the block. One creature's
            // tile toggles, as it always did; a stack's count row in the bar
            // is how to take out fewer than all of it.
            setBlockAssign((cur) => {
              const next = { ...cur }
              for (const i of members) delete next[i]
              return next
            })
            setBlockFocus(null)
            return
          }
          const canBlock = blockAction.eligible.find((e) => e.blocker === fresh)?.canBlock ?? []
          if (canBlock.length === 1) {
            setBlockAssign((cur) => ({ ...cur, [fresh]: canBlock[0] }))
          } else {
            setBlockFocus(fresh)
          }
          return
        }
        if (blockFocus && blockAssign[blockFocus] !== undefined) {
          // One more attacker for a creature already blocking (`maxBlocks`),
          // or, clicking one it blocks, that one taken back.
          const focus = blockFocus
          const canBlock = blockAction.eligible.find((e) => e.blocker === focus)?.canBlock ?? []
          const at = ids.find((i) => canBlock.includes(i))
          if (at === undefined) return
          const extra = blockExtra[focus] ?? []
          if (blockAssign[focus] === at) {
            setBlockAssign((cur) => {
              const next = { ...cur }
              if (extra.length > 0) next[focus] = extra[0]
              else delete next[focus]
              return next
            })
            setBlockExtra((cur) => ({ ...cur, [focus]: extra.slice(1) }))
          } else if (extra.includes(at)) {
            setBlockExtra((cur) => ({ ...cur, [focus]: extra.filter((a) => a !== at) }))
          } else {
            setBlockExtra((cur) => ({ ...cur, [focus]: [...extra, at] }))
          }
          setBlockFocus(null)
          return
        }
        if (blockFocus) {
          const at = leastBlocked(ids, blockFocus, blockAction, blockAssign)
          if (at !== null) {
            setBlockAssign((cur) => {
              const next = { ...cur, [blockFocus]: at }
              // A stack (or folded tile) of blockers onto a stack of
              // attackers blocks one for one, as far as it goes — 100 of
              // 200 Soldiers on 100 Zombies — rather than a single blocker
              // to count up from; the bar's row sets any other number.
              const pair = blockPairs(blockAction, next, tileOf).find(
                (p) => p.blockers.includes(blockFocus) && p.attackers.includes(at),
              )
              return pair !== undefined && pair.attackers.length > 1
                ? setPairCount(pair, Math.min(pair.max, pair.attackers.length), blockAction, next)
                : next
            })
            setBlockFocus(null)
          }
          return
        }
        // An attacking token stack with no blocker waiting: how many of the
        // blockers on it share each token (`renderBlockSplitMenu`).
        const stack = ids.find((i) => (blockAction.attackerTokens?.[i] ?? 1) > 1)
        if (stack !== undefined) setBlockSplit((cur) => (cur === stack ? null : stack))
        return
      }
      if (
        mode === 'priority' &&
        (abilitiesBySource.has(id) ||
          faceUpBySource.has(id) ||
          unlockBySource.has(id) ||
          licidEndBySource.has(id) ||
          preparedCastsBySource.has(id))
      ) {
        setSelectedSource((cur) => (cur === id ? null : id))
      }
    },
    [
      abilitiesBySource,
      faceUpBySource,
      unlockBySource,
      licidEndBySource,
      preparedCastsBySource,
      assignDamageAction,
      attackAction,
      attackAssignments,
      attackPicks,
      bandDraft,
      damageAnswer,
      damageMembersOf,
      sendPicksAt,
      blockAction,
      blockAssign,
      blockExtra,
      blockFocus,
      stackMembers,
      tileOf,
      mode,
      pickIdForClick,
      pickTarget,
      unpickTarget,
      sacrificeAction,
      choosePermanentsAction,
      separatePilesAction,
      pilesOnBoard,
      pendingSac,
      startCast,
      startAbility,
      pendingTap,
      pendingConvoke,
      pendingWaterbend,
      proliferateAction,
      timeTravelAction,
      timeTravelBrush,
      removeCountersAction,
      activeTargeting,
      defendersFor,
      enchantAction,
      copyChoiceAction,
      legendAction,
      game,
      seat,
    ],
  )

  const clickPlayerTarget = useCallback(
    (pid: PlayerId) => {
      const playerMode = modePlayerIndex(modesChoiceAction, mode, pid)
      if (playerMode !== null) {
        game.dispatch({ type: 'choose-modes', player: seat, modes: [playerMode] })
        return
      }
      if (mode === 'choose-enchant' && enchantAction) {
        if ((enchantAction.players ?? []).includes(pid)) {
          game.dispatch({ type: 'choose-enchant', player: seat, enchant: pid })
        }
        return
      }
      if (mode === 'attackers' && attackAction) {
        sendPicksAt(pid)
        return
      }
      if (mode === 'proliferate' && proliferateAction) {
        if (!proliferateAction.eligible.some((t) => t.kind === 'player' && t.player === pid)) return
        setProliferatePicks((cur) =>
          cur.some((t) => t.kind === 'player' && t.player === pid)
            ? cur.filter((t) => !(t.kind === 'player' && t.player === pid))
            : [...cur, { kind: 'player', player: pid }],
        )
        return
      }
      if (mode !== 'targeting' || !activeTargeting) return
      const slot = currentSlotOptions(activeTargeting)
      if (slot.some((o) => o.kind === 'player' && o.player === pid)) {
        pickTarget({ kind: 'player', player: pid })
      } else {
        unpickTarget({ kind: 'player', player: pid })
      }
    },
    [attackAction, mode, pickTarget, unpickTarget, activeTargeting, sendPicksAt, proliferateAction, enchantAction, modesChoiceAction, game, seat],
  )

  const confirmAttackers = useCallback(() => {
    if (enterAttackingAction !== undefined) {
      game.dispatch({
        type: 'enter-attacking',
        player: seat,
        assignments: Object.entries(attackAssignments).map(([object, target]) => ({
          object: object as ObjectId,
          target,
        })),
      })
      return
    }
    // Each band's entries share its number (`AttackerDeclaration.band`).
    const bandOf = new Map<ObjectId, number>()
    attackBands.forEach((band, i) => {
      for (const id of band) bandOf.set(id, i + 1)
    })
    game.dispatch({
      type: 'declare-attackers',
      player: seat,
      attackers: collapseAttacks(attackAssignments, stackMembers).map((d) => {
        const band = bandOf.get(d.attacker)
        return band === undefined ? d : { ...d, band }
      }),
    })
  }, [attackAssignments, attackBands, enterAttackingAction, game, seat, stackMembers])

  const confirmBlockers = useCallback(() => {
    game.dispatch({
      type: 'declare-blockers',
      player: seat,
      blocks: [...collapseBlocks(blockAssign, stackMembers, blockPerToken), ...extraBlocks(blockExtra, blockAssign)],
    })
  }, [blockAssign, blockExtra, blockPerToken, game, seat, stackMembers])

  const confirmDiscard = useCallback(() => {
    game.dispatch({ type: 'discard', player: seat, cards: [...discardPicks] })
  }, [discardPicks, game, seat])

  const confirmZoneChoice = useCallback(
    (chosen: readonly ObjectId[]) => {
      game.dispatch({ type: 'choose-from-zone', player: seat, chosen: [...chosen] })
    },
    [game, seat],
  )

  const confirmScry = useCallback(
    (away: readonly ObjectId[]) => {
      game.dispatch({ type: 'scry', player: seat, away: [...away] })
    },
    [game, seat],
  )

  const confirmMulligan = useCallback(
    (keep: boolean) => {
      game.dispatch({ type: 'mulligan', player: seat, keep })
    },
    [game, seat],
  )

  const confirmBottom = useCallback(() => {
    game.dispatch({ type: 'put-on-bottom', player: seat, cards: [...bottomPicks] })
  }, [bottomPicks, game, seat])

  // --- keyboard ----------------------------------------------------
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      // Typing in a text field (the capture panel's note, a bug report) is
      // text, not a pass.
      const t = e.target
      const typing =
        t instanceof HTMLElement &&
        (t instanceof HTMLInputElement || t instanceof HTMLTextAreaElement || t.isContentEditable)
      // Nor is Space behind a popup (History, a graveyard): it's the page,
      // not a pass the player can see the board for.
      const behindPopup = document.querySelector('.zone-viewer-overlay') !== null
      if (e.key === ' ' && mode === 'priority' && !typing && !behindPopup) {
        e.preventDefault()
        pass()
      } else if (e.key === 'Escape') {
        setTargeting(null)
        setSelectedSource(null)
        setBlockFocus(null)
      }
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [mode, pass])

  // --- render ----------------------------------------------------
  // "Another target" leaves out what an earlier slot already took, and a
  // "for each target" cost what it couldn't pay for.
  const targetSlot = activeTargeting ? currentSlotOptions(activeTargeting) : []
  // A slot's options that nothing on the board stands for — a card in a
  // graveyard (Regrowth, Rydia's Summon) or in exile. They're picked from a
  // popup of just those cards.
  const zoneTargetIds = targetSlot.flatMap((o) =>
    o.kind === 'object' &&
    !view.zones.battlefield.includes(o.object) &&
    !view.zones.stack.includes(o.object)
      ? [o.object]
      : [],
  )
  const zoneTargetKey = activeTargeting
    ? `${activeTargeting.kind}:${activeTargeting.source}:${activeTargeting.abilityIndex}:${activeTargeting.picked.length}`
    : null
  const zoneTargetCollapsed = zoneTargetKey !== null && zoneTargetHidden === zoneTargetKey
  const pickedObjKeys = new Set(
    (activeTargeting?.picked ?? [])
      .filter((r) => r?.kind === 'object')
      .map((r) => (r?.kind === 'object' ? r.object : '')),
  )
  /**
   * The seat-colour class of whoever an attack is aimed at — the defending
   * player, or the controller of the defending planeswalker. Drives the
   * attacking tile's outline, which is the readable half of "who is this
   * creature hitting": the ⚔ badge is four characters over art, at a tile
   * size where that is regularly illegible.
   */
  const attackSeatClass = (t: PlayerId | ObjectId): string | null => {
    const pw = view.objects[t as ObjectId]
    // A battle's attacker is aimed at its protector (rule 310.9d).
    const pid = pw ? (pw.protector ?? pw.controller) : (t as PlayerId)
    // Turn-order position, not table position — the same rule every other
    // seat colour in the client follows, so the outline matches the panel.
    return view.turnOrder.includes(pid) ? seatClassOf(view.turnOrder, pid) : null
  }

  /** Label for an attack target — a player, or an opponent's planeswalker. */
  const attackTargetLabel = (t: PlayerId | ObjectId): string =>
    view.objects[t as ObjectId]
      ? game.nameOf(t as ObjectId)
      : playerLabel(t as PlayerId, game.seats)

  const playerIsTargetable = (pid: PlayerId): boolean => {
    if (modePlayerIndex(modesChoiceAction, mode, pid) !== null) return true
    if (mode === 'choose-enchant' && enchantAction) {
      return (enchantAction.players ?? []).includes(pid)
    }
    if (mode === 'attackers' && attackAction) {
      return canSendPicksAt(pid)
    }
    if (mode === 'proliferate' && proliferateAction) {
      return proliferateAction.eligible.some((t) => t.kind === 'player' && t.player === pid)
    }
    return (
      mode === 'targeting' &&
      targetSlot.some((o) => o.kind === 'player' && o.player === pid)
    )
  }

  const tileFor = (
    obj: VisibleObject,
    ownerSeat: PlayerId,
    ids: readonly ObjectId[] = [obj.id],
    opts: { stackCount?: number; mini?: boolean } = {},
  ) => {
    const id = obj.id
    let highlight = false
    let selected = false
    let activatable = false
    let badge: string | null = null
    // Both halves of "is this attacking someone": a declaration this seat is
    // still building (`attackAssignments`, mine only) and an attack already
    // on the board (`obj.attacking`, which every seat sees).
    // Every creature the tile stands for, a compacted stack as its members
    // (game/stackMembers.ts) while a combat declaration is being built.
    const members = expandIds(ids, stackMembers)
    const assignedAt = members.map((m) => attackAssignments[m]).find((d) => d !== undefined)
    // A creature entering attacking whose target is still being chosen
    // (rule 508.4) attacks its first option meanwhile, as far as the view
    // says — that's a placeholder, not a choice, so the tile shows none.
    const choosingTarget =
      enterAttackingAction?.creatures.some((c) => members.includes(c.object)) ?? false
    const aimedAt = assignedAt ?? (choosingTarget ? null : obj.attacking) ?? null
    const attackSeat = aimedAt === null ? null : attackSeatClass(aimedAt)

    // An attacker in a band says so (rule 702.22c); a blocker of a band,
    // how many more of it it blocks (702.22h).
    if (obj.attacking && !choosingTarget) badge = `⚔ ${attackTargetLabel(obj.attacking)}${obj.band !== undefined ? ' · banded' : ''}`
    // Named off the board shown, as the tile is: the game may already have
    // moved on past this combat, the attacker gone (a raw id read in its place).
    else if (obj.blocking)
      badge = `\u{1F6E1} ${view.objects[obj.blocking]?.name ?? game.nameOf(obj.blocking)}${
        obj.blockingAlso !== undefined ? ` +${obj.blockingAlso.length}` : ''
      }`
    else if (obj.isCommander) badge = 'Commander'

    if (mode === 'targeting') {
      highlight = ids.some((i) =>
        targetSlot.some((o) => o.kind === 'object' && o.object === i),
      )
      selected = ids.some((i) => pickedObjKeys.has(i))
    } else if (mode === 'attackers' && attackAction) {
      // An opponent's planeswalker is a legal defender: highlight it once a
      // group is waiting, so it can be clicked as the attack target.
      const isDefenderPw = Boolean(view.objects[id]) && canSendPicksAt(id)
      const free = freeAttacker(members, attackAction.eligible, attackAssignments, attackPicks)
      const attacking = members.filter((m) => attackAssignments[m] !== undefined)
      const picked = members.filter((m) => attackPicks.includes(m))
      highlight = free !== null || isDefenderPw
      selected = attacking.length > 0 || picked.length > 0
      // Building a band: what's attacking can join it; what's in it is picked.
      if (bandDraft !== null) {
        highlight = attacking.length > 0
        selected = ids.some((i) => bandDraft.includes(i))
      }
      // A tile of several: how many of them attack, its count row in the
      // bar says whom. One creature: whom it attacks.
      if (attacking.length > 0) {
        badge =
          members.length > 1
            ? `⚔ ${attacking.length}/${members.length}`
            : `⚔ ${attackTargetLabel(attackAssignments[attacking[0]])}`
      }
      // A selected-but-unpointed attacker is a distinct state from an
      // assigned one, and the board has to say which is which.
      else if (picked.length > 0) badge = members.length > 1 ? `⚔ ? ×${picked.length}` : '⚔ ?'
      const band = attackBands.findIndex((b) => ids.some((i) => b.includes(i)))
      if (band >= 0 && badge !== null) badge = `${badge} · band ${band + 1}`
    } else if (mode === 'blockers' && blockAction) {
      // Over every creature the tile stands for (folded tokens, or a
      // compacted stack's members).
      const isBlocker = members.some((i) => blockAction.eligible.some((e) => e.blocker === i))
      const blocking = members.filter((i) => blockAssign[i] !== undefined)
      const focusedCanHit =
        blockFocus !== null && leastBlocked(members, blockFocus, blockAction, blockAssign) !== null
      // An attacking token stack opens its "blockers per token" popup on a
      // click (`renderBlockSplitMenu`), so it's always clickable.
      const splittable = ids.some((i) => (blockAction.attackerTokens?.[i] ?? 1) > 1)
      highlight = isBlocker || focusedCanHit || splittable
      selected = blocking.length > 0 || (blockFocus !== null && members.includes(blockFocus))
      if (blocking.length > 0) {
        badge =
          members.length > 1
            ? `\u{1F6E1} ${blocking.length}/${members.length}`
            : `\u{1F6E1} ${game.nameOf(blockAssign[blocking[0]])}${
                (blockExtra[blocking[0]]?.length ?? 0) > 0 ? ` +${blockExtra[blocking[0]].length}` : ''
              }`
      }
    } else if (mode === 'assign-combat-damage' && assignDamageAction && damageAnswer) {
      const members = damageMembersOf(ids)
      if (members.length > 0) {
        const dmg = totalOf(members, damageAnswer)
        const dead = deathCount(assignDamageAction, members, damageAnswer, damageSurvivors)
        highlight = true
        selected = lethalCount(assignDamageAction, members, damageAnswer) > 0
        // The amount, on the creature it's going to: with a crowd blocking,
        // the board is where you can see which one is which. A folded token
        // stack says how many of it die, the way a sacrifice does.
        if (members.length > 1 && dead > 0) badge = `☠ ${dead}/${members.length}`
        else if (dmg > 0) badge = `${dmg} dmg${dead > 0 ? ' ☠' : ''}`
      }
    } else if (mode === 'choose-sacrifice' && pendingSac?.sacrifice !== undefined) {
      const choices = pendingSac.sacrifice.choices
      highlight = ids.some((i) => choices.includes(i))
    } else if (mode === 'choose-tap' && pendingTap) {
      // Over every permanent the tile stands for: several identical ones
      // folded together, or one of the engine's token stacks.
      const { offer, picks } = pendingTap
      const members = ids.filter((i) => offer.choices.includes(i))
      const taken = picks.filter((x) => members.includes(x)).length
      const of = members.reduce((n, i) => n + (offer.copies?.[i] ?? 1), 0)
      highlight = of > taken
      selected = taken > 0
      if (of > 1 && taken > 0) badge = `↷ ${taken}/${of}`
    } else if (mode === 'choose-convoke' && pendingConvoke) {
      const { offer, picks } = pendingConvoke
      const members = ids.filter((i) => offer.candidates.includes(i))
      const taken = picks.filter((x) => members.includes(x)).length
      const of = members.reduce((n, i) => n + (offer.copies?.[i] ?? 1), 0)
      highlight = of > taken && picks.length < offer.maxCreatures
      selected = taken > 0
      if (of > 1 && taken > 0) badge = `↷ ${taken}/${of}`
    } else if (mode === 'choose-waterbend' && pendingWaterbend) {
      const { offer, picks, max } = pendingWaterbend
      const members = ids.filter((i) => offer.choices.includes(i))
      const taken = picks.filter((x) => members.includes(x)).length
      const of = members.reduce((n, i) => n + (offer.copies?.[i] ?? 1), 0)
      highlight = of > taken && picks.length < max
      selected = taken > 0
      if (of > 1 && taken > 0) badge = `↷ ${taken}/${of}`
    } else if (mode === 'choose-enchant' && enchantAction) {
      highlight = enchantAction.options.includes(id)
    } else if (mode === 'choose-copy' && copyChoiceAction) {
      highlight = ids.some((i) => copyChoiceAction.options.includes(i))
    } else if (mode === 'legend-rule' && legendAction) {
      highlight = legendAction.options.includes(id)
    } else if (mode === 'sacrifice' && sacrificeAction) {
      const taken = sacrificePicks.filter((x) => x === id).length
      const of = sacrificeAction.copies?.[id] ?? 1
      highlight = sacrificeAction.eligible.includes(id) && taken === 0
      selected = taken > 0
      // A stack gives up some of itself, so the tile has to say how many —
      // "selected" alone can't tell three of nine from nine of nine.
      if (of > 1 && taken > 0) badge = `☠ ${taken}/${of}`
    } else if (mode === 'separate-piles' && separatePilesAction && pilesOnBoard) {
      const members = ids.filter((i) => separatePilesAction.objects.includes(i))
      const first = members.filter((i) => pilePicks.includes(i)).length
      highlight = members.length > first
      selected = first > 0
      if (members.length > 0) {
        badge =
          members.length === 1
            ? first > 0
              ? 'Pile 1'
              : 'Pile 2'
            : `Pile 1: ${first} · Pile 2: ${members.length - first}`
      }
    } else if (mode === 'choose-pile' && choosePileAction && pilesOnBoard) {
      const inPile = (p: number) => ids.filter((i) => choosePileAction.piles[p]?.includes(i)).length
      const one = inPile(0)
      const two = inPile(1)
      highlight = one + two > 0
      if (one > 0 && two > 0) badge = `Pile 1: ${one} · Pile 2: ${two}`
      else if (one > 0) badge = 'Pile 1'
      else if (two > 0) badge = 'Pile 2'
    } else if (mode === 'choose-permanents' && choosePermanentsAction) {
      const taken = permanentPicks.filter((x) => x === id).length
      const of = choosePermanentsAction.copies?.[id] ?? 1
      highlight = choosePermanentsAction.eligible.includes(id) && taken === 0
      selected = taken > 0
      if (of > 1 && taken > 0) badge = `✓ ${taken}/${of}`
    } else if (mode === 'remove-counters' && removeCountersAction) {
      const entry = removeCountersAction.eligible.find((e) => e.object === id)
      const taken = Object.entries(counterPicks)
        .filter(([key]) => key.startsWith(`${id}|`))
        .reduce((n, [, count]) => n + count, 0)
      highlight = entry !== undefined && taken === 0
      selected = taken > 0
      if (taken > 0) badge = `−${taken}`
    } else if (mode === 'time-travel' && timeTravelAction) {
      const pick = timeTravelPicks[id]
      highlight = timeTravelAction.eligible.includes(id) && pick === undefined
      selected = pick !== undefined
      if (pick !== undefined) badge = pick === 1 ? '+1 time' : '−1 time'
    } else if (mode === 'proliferate' && proliferateAction) {
      const picked = proliferatePicks.some((t) => t.kind === 'object' && t.object === id)
      highlight = eligibleToProliferate(proliferateAction, id) && !picked
      selected = picked
    } else if (mode === 'priority' && ownerSeat === seat) {
      activatable = ids.some(
        (i) =>
          abilitiesBySource.has(i) ||
          faceUpBySource.has(i) ||
          unlockBySource.has(i) ||
          licidEndBySource.has(i) ||
          preparedCastsBySource.has(i),
      )
      selected = selectedSource !== null && ids.includes(selectedSource)
    }
    // A plotted card on its owner's board (rule 702.170): marked, and cast
    // with a click like a hand card once the free cast is on offer — on a
    // later turn, in its owner's main phase (`clickHandCard`).
    const plottedCast = obj.plotted === true && mode === 'priority' && castByCard.has(id)
    if (obj.plotted === true) {
      badge ??= 'Plotted'
      if (plottedCast) highlight = true
    }
    const onTileClick = plottedCast ? () => clickHandCard(id) : () => clickPermanent(ids)

    // Any of the permanents the tile stands for (a folded land stack).
    const aimedBy = aim !== null && ids.some((i) => aim.objects.has(i)) ? aim.by : null
    // A tile of several attacking tokens: how many of them are blocked —
    // declared (`blocked`, which every seat sees, and which stays true once
    // the blockers are gone) or, while this seat is still choosing, picked
    // in its own block bar.
    const pendingBlocked =
      mode === 'blockers'
        ? new Set([...Object.values(blockAssign), ...extraBlocks(blockExtra, blockAssign).map((b) => b.attacker)])
        : null
    const blockedCount =
      obj.attacking !== null && ids.length > 1
        ? ids.filter((i) => view.objects[i]?.blocked || pendingBlocked?.has(i)).length
        : 0
    const goaders = obj.goadedBy
      .filter((p) => view.turnOrder.includes(p))
      .map((p) => ({ seat: seatClassOf(view.turnOrder, p), name: playerLabel(p, game.seats) }))
    const enchanting =
      obj.attachedToPlayer !== null && view.turnOrder.includes(obj.attachedToPlayer)
        ? { seat: seatClassOf(view.turnOrder, obj.attachedToPlayer), name: playerLabel(obj.attachedToPlayer, game.seats) }
        : null
    // A battle's protector (rule 310.9), named on its tile.
    const protectedBy =
      obj.protector !== undefined && view.turnOrder.includes(obj.protector)
        ? { seat: seatClassOf(view.turnOrder, obj.protector), name: playerLabel(obj.protector, game.seats) }
        : null
    // A face-down permanent wears its owner's card back.
    const backSeat = view.turnOrder.includes(obj.owner) ? seatClassOf(view.turnOrder, obj.owner) : null
    if (opts.mini) {
      return (
        <MiniTile
          key={id}
          obj={obj}
          highlight={highlight}
          selected={selected}
          activatable={activatable}
          badge={badge}
          stackCount={opts.stackCount ?? null}
          blockedCount={blockedCount}
          attackSeat={attackSeat}
          aimedBy={aimedBy}
          goaders={goaders}
          enchanting={enchanting}
          protectedBy={protectedBy}
          held={(obj.holding ?? []).map((h) => ({ id: h, obj: view.objects[h] ?? null }))}
          ownerSeat={backSeat}
          onClick={onTileClick}
        />
      )
    }
    return (
      <CardTile
        key={id}
        obj={obj}
        highlight={highlight}
        selected={selected}
        activatable={activatable}
        badge={badge}
        stackCount={opts.stackCount ?? null}
        attackSeat={attackSeat}
        aimedBy={aimedBy}
        goaders={goaders}
        enchanting={enchanting}
        protectedBy={protectedBy}
        ownerSeat={backSeat}
        onClick={onTileClick}
      />
    )
  }

  const renderBoard = (pid: PlayerId, isOpp: boolean, landsBelow: boolean) => {
    // Your own board is in the order you've dragged it into; everyone
    // else's is as the board lays it out (`computeBoardEntries`).
    const own = pid === seat
    const entries = own
      ? applyBoardOrder(computeBoardEntries(view, pid), boardDrag.order)
      : computeBoardEntries(view, pid)
    const lands = entries.filter((e) => e.bucket === 'land')
    // Creatures, artifacts, and enchantments all share one area — no
    // per-type labels or sub-columns, just "everything that isn't a land".
    const permanents = entries.filter((e) => e.bucket !== 'land')

    const { drag } = boardDrag
    const renderEntries = (list: readonly BoardEntry[], row: 'lands' | 'permanents') => (
      <div className="board-row-cards" data-drag-row={own ? row : undefined}>
        {list.map((entry) => {
          const dragged = own && drag !== null && entry.ids.includes(drag.key)
          const dropSide =
            own && drag?.drop && entry.ids.includes(drag.drop.key)
              ? drag.drop.after
                ? ' drop-after'
                : ' drop-before'
              : ''
          return (
          <div
            // A phased-out permanent (rule 702.26) is drawn dimmed: there,
            // but treated as though it doesn't exist until it phases in.
            // A plotted card (rule 702.170) is in exile, not on the
            // battlefield: drawn apart from the permanents beside it.
            className={`board-entry${own ? ' draggable' : ''}${dragged ? ' dragging' : ''}${dropSide}${entry.sample.phasedOut === true ? ' phased-out' : ''}${entry.sample.plotted === true ? ' plotted' : ''}`}
            title={
              entry.sample.phasedOut === true
                ? 'Phased out — treated as though it doesn’t exist until it phases in'
                : entry.sample.plotted === true
                  ? 'Plotted — in exile; its owner may cast it without paying its mana cost on a later turn, as a sorcery'
                  : undefined
            }
            key={entry.ids[0]}
            data-obj-ids={entry.ids.join(' ')}
            // How many permanents the tile stands for, which a leave reads to
            // tell part of a stack going from the whole of it (`runLeaves`).
            data-count={entry.count}
            style={dragged ? { translate: `${drag.dx}px ${drag.dy}px` } : undefined}
            onPointerDown={own ? (e) => boardDrag.start(e, entry.ids[0]) : undefined}
            // The art is an image the browser would drag natively, which
            // cancels the pointer stream this drag runs on.
            onDragStart={own ? (e) => e.preventDefault() : undefined}
          >
            {tileFor(entry.sample, pid, entry.ids, {
              // Identical permanents folded here in the client, each of which
              // may itself be one of the engine's compacted token stacks —
              // see `BoardEntry.count`.
              stackCount: entry.count,
              mini: true,
            })}
            {entry.attachments.length > 0 ? (
              <div className="attachments">
                {entry.attachments.map((a, i) => (
                  <div
                    key={a.id}
                    // Back to front: the first attachment sits directly
                    // behind the host and each later one further back, so
                    // every strip stays visible instead of being covered by
                    // the attachment peeking out below it. Read via var()
                    // in App.css (same reason as the hand fan's own --z) so
                    // the plain :hover rule there can still win over it.
                    style={
                      { '--att-z': entry.attachments.length - i } as CSSProperties
                    }
                  >
                    {tileFor(a, pid, [a.id], { mini: true })}
                  </div>
                ))}
              </div>
            ) : null}
          </div>
          )
        })}
      </div>
    )

    // Lands and permanents each always reserve their row, even empty, so the
    // board doesn't resize/jump around as things come and go. Lands get
    // their own row, like a physical Commander table's mana base — kept
    // nearest this seat's own edge of the table, so creatures from every
    // side meet toward the middle of the screen. Which edge that is depends
    // on the seat's row in the quadrant grid, not on whether it's an
    // opponent: in the 2x2 grid the bottom-right seat is an opponent sitting
    // along the *bottom* edge, so its lands belong under its creatures just
    // like your own. (Keying this off `isOpp` is a leftover from the layout
    // where every opponent stacked above you, and left that one seat
    // mirrored the wrong way.)
    const landRow = (
      <div className="board-row" key="lands">
        {renderEntries(lands, 'lands')}
      </div>
    )
    const permanentRow = (
      <div className="board-row" key="permanents">
        {renderEntries(permanents, 'permanents')}
      </div>
    )
    const rows = landsBelow ? [permanentRow, landRow] : [landRow, permanentRow]

    // Drawn at the width it last settled on, so a remounted board's first
    // layout is already the right one (`recomputeBoardMiniW`).
    const fitted = boardFitWidths.get(pid)
    return (
      <div
        className={`board ${isOpp ? 'opp' : 'you'} ${seatClassOf(view.turnOrder, pid)}`}
        ref={registerBoardEl(pid)}
        style={fitted === undefined ? undefined : ({ '--mini-w-fit': `${fitted}px` } as CSSProperties)}
      >
        {rows}
      </div>
    )
  }

  /** Command zone (above) + library (below), to the right of a player's
   * board. The library shows a face-down back by default — the count is
   * still public — unless something that player controls (e.g. Oracle of
   * Mul Daya) makes its top card public knowledge, in which case that card
   * renders face-up in its place. */
  /** A commander in the command zone isn't a battlefield permanent, so it
   * doesn't go through `tileFor` (targeting/attacking/blocking don't apply)
   * — it's castable like a hand card instead, via the same `castByCard`
   * map and `clickHandCard` dispatch (which only ever consults that map,
   * not which zone the card is actually sitting in). Rendered compactly
   * (art and cost, the full card on hover) rather than as a full `CardTile`
   * — see `CommanderTile`. */
  const commandZoneTile = (obj: VisibleObject, paired = false) => {
    const castable = mode === 'priority' && castByCard.has(obj.id)
    // An ability that works from the command zone (commander ninjutsu), or
    // more than one way to cast it (dash, blitz, kicker): the tile opens its
    // ability menu, with each cast in it.
    const usable =
      mode === 'priority' &&
      ((abilitiesBySource.get(obj.id)?.length ?? 0) > 0 || (playFacesByCard.get(obj.id)?.length ?? 0) > 1)
    // What's still owed, from the engine: less than 2 per cast once a
    // reduction has outrun the printed generic part (affinity on a
    // commander), none for a tax paid in life.
    const commanderTax = obj.commanderTax ?? 0
    const fullTax = 2 * (view.players[obj.owner]?.commanderCastCounts?.[obj.cardName] ?? 0)
    return (
      <CommanderTile
        key={obj.id}
        obj={obj}
        highlight={castable || usable}
        extraGenericCost={commanderTax}
        taxReducedFrom={obj.commanderTax !== undefined && commanderTax < fullTax ? fullTax : undefined}
        onClick={usable ? () => setSelectedSource(obj.id) : castable ? () => clickHandCard(obj.id) : undefined}
        paired={paired}
      />
    )
  }

  /** A library's revealed top card (Oracle of Mul Daya's "play with the top
   * card of your library revealed"). Not a permanent, so not `tileFor`: that
   * drew a full-height card in a rail sized for a squat pile, and routed its
   * clicks to the battlefield handler, which knows nothing of playing a card.
   * It's playable the way a hand card is — the engine offers a `play-land`
   * (or `cast-spell`) naming it — so it goes through `clickHandCard`, and is
   * drawn as it would be in the hand, scaled down to the face-down pile's
   * box (`.library-top`), with the card full size on hover
   * (`LibraryTopCard`). A card playable more than one way (a modal
   * double-faced card's two land faces) gets a button per way, as in the
   * hand. */
  const libraryTopTile = (obj: VisibleObject, pid: PlayerId) => {
    const faceOpts = mode === 'priority' ? (playFacesByCard.get(obj.id) ?? []) : []
    // Turned face up as it's revealed: a card the board before didn't show
    // on top (Oracle of Mul Daya arriving, a draw, a shuffle).
    const flipIn = previousView !== null && (previousView.revealedLibraryTop[pid] ?? null) !== obj.id
    return (
      <>
        <LibraryTopCard
          key={obj.id}
          obj={obj}
          highlight={faceOpts.length > 0}
          onClick={() => clickHandCard(obj.id)}
          flipIn={flipIn}
        />
        {faceOpts.length > 1
          ? faceOpts.map((a, i) => (
              <button key={i} type="button" onClick={() => playFace(a)}>
                {a.kind === 'play-land' ? 'Play' : 'Cast'} {a.cardName}
              </button>
            ))
          : null}
      </>
    )
  }

  const renderSideZone = (pid: PlayerId) => {
    const commandIds = view.zones.command.filter((id) => view.objects[id]?.owner === pid)
    const topId = view.revealedLibraryTop[pid] ?? null
    const topObj = topId !== null ? view.objects[topId] : undefined
    const librarySize = view.players[pid].librarySize

    return (
      <div className={`side-zone ${seatClassOf(view.turnOrder, pid)}`}>
        <div className="side-zone-section">
          <div className="side-zone-label">
            Command{commandIds.length > 1 ? ` (${commandIds.length})` : ''}
          </div>
          {/* Partners (rule 702.124) share the one slot as tiles of their
              own, each with a shorter art box so both fit: the rail is a
              single card wide and height-capped, and two full-height tiles
              would push the library off the bottom of the quadrant. */}
          <div className={`side-zone-cards${commandIds.length > 1 ? ' command-stack' : ''}`}>
            {commandIds.length > 0 ? (
              commandIds.map((id) => {
                const obj = view.objects[id]
                return obj ? commandZoneTile(obj, commandIds.length > 1) : null
              })
            ) : (
              <div className="card-slot-empty" title="empty command zone" />
            )}
          </div>
        </div>
        <div className="side-zone-section">
          <div className="side-zone-label">Library ({librarySize})</div>
          {/* `data-library-of` is what the draw animation flies a cardback
              out of — an anchor that survives the top card being revealed
              (which swaps the pile below for a real tile). */}
          <div className="side-zone-cards" data-library-of={pid}>
            {topObj ? (
              libraryTopTile(topObj, pid)
            ) : librarySize > 0 ? (
              <div
                className="card-back"
                title={`${librarySize} card${librarySize === 1 ? '' : 's'} face down`}
              >
                <span className="card-back-count">{librarySize}</span>
              </div>
            ) : (
              // An empty library keeps the pile's place and shape, outlined —
              // drawing from it loses the game (rule 704.5b), so it should be
              // as plain to see as a full one.
              <div className="library-empty" title="No cards left: drawing from an empty library loses the game">
                <span className="library-empty-count">0</span>
                <span className="library-empty-label">empty</span>
              </div>
            )}
          </div>
        </div>
      </div>
    )
  }

  const handIds = view.zones.hands[seat] ?? []
  // A layout effect, not a plain one: `Table` remounts on every frame it's
  // shown, so the spacing starts back at HAND_CARD_GAP each time, and
  // measured after the browser had painted, the hand showed one frame at
  // that default before snapping to its real spacing. During the mulligan,
  // where the hand fills the popup and the bots' decisions arrive as a run
  // of frames, that was the hand jittering each time an opponent chose.
  useLayoutEffect(() => {
    const row = handRowRef.current
    if (!row) return
    const recompute = () => {
      const cardEl = row.querySelector<HTMLElement>('.hand-card .card-tile')
      // offsetWidth, not getBoundingClientRect().width -- the latter is the
      // *visual* (post-transform) bounding box, which for any card past the
      // fan's uncapped range is rotated by up to HAND_FAN_MAX_ROT_DEG and
      // therefore reports a width inflated well past the card's real,
      // unrotated size (a rotated rectangle's axis-aligned bounding box is
      // always wider than the rectangle itself). Since every card shares the
      // same CSS width regardless of its own rotation, offsetWidth (the
      // layout box, untouched by the `rotate`/`translate` CSS properties)
      // gives the true, stable card width no matter which card in the row
      // happens to get queried. Using the rotated bounding width here was
      // the actual cause of a hand's fan looking wrong past ~16 cards (the
      // point the rotation cap engages): an inflated cw overstates how much
      // overlap is needed, so cards get crushed far tighter than the real
      // available width requires.
      const cw = cardEl?.offsetWidth ?? 0
      const n = row.querySelectorAll('.hand-card').length
      if (cw === 0 || n <= 1) {
        setHandCardGap(HAND_CARD_GAP)
        return
      }
      const naturalTotal = n * cw + (n - 1) * HAND_CARD_GAP
      const available = row.clientWidth
      if (naturalTotal <= available) {
        setHandCardGap(HAND_CARD_GAP)
        return
      }
      const overlap = (available - n * cw) / (n - 1)
      setHandCardGap(Math.max(overlap, -cw * HAND_OVERLAP_FLOOR))
    }
    recompute()
    const observer = new ResizeObserver(recompute)
    observer.observe(row)
    return () => observer.disconnect()
  }, [handIds.length])
  // The card under a resting pointer is a new element after this remount:
  // take up its hover as it stood (`hoverCarry.ts`). After the spacing
  // above, which can move the hand under the pointer before it paints.
  const playerColRef = useRef<HTMLDivElement>(null)
  useLayoutEffect(() => {
    const col = playerColRef.current
    return col === null ? undefined : carryHover(col)
  }, [handCardGap])
  // The fan glides from the last board's hand to this one's — closing round
  // a card played, opening for one drawn — rather than jumping at the
  // remount (`handMotion.ts`). Again from the same places while the
  // spacing settles before this board paints; after that, a re-layout (a
  // resize) only records where the cards are.
  const [handBefore] = useState(handPlacesBefore)
  const handPainted = useRef(false)
  useLayoutEffect(() => {
    const id = requestAnimationFrame(() => {
      handPainted.current = true
    })
    return () => cancelAnimationFrame(id)
  }, [])
  useLayoutEffect(() => {
    const row = handRowRef.current
    if (row === null) return
    const prefs = motionPrefs()
    const glide = !handPainted.current && !prefs.reduced && document.visibilityState !== 'hidden'
    return slideHand(row, glide ? handBefore : null, prefs.animScale)
  }, [handCardGap, handIds.length, handBefore])

  /** Sizes `boardEl`'s tiles to the largest width at which its rows still fit
   * the height its quadrant gives it (`.quadrant-body`'s content box),
   * wrapping to however many rows that width needs. A sparse board's tiles
   * grow into the room they have; a crowded one's shrink, down to
   * MINI_SHRINK_FLOOR, past which the board scrolls instead. App.css's
   * `.board` rule caps the result at a card in hand's width, so a lone land
   * on an empty board doesn't balloon to fill it.
   *
   * A binary search over the width (`game/boardFit.ts`'s `fitWidth`), rather
   * than a step loop or a ratio-based guess: reflowed wrap counts don't scale
   * linearly with tile size, but a wider tile never makes the rows any
   * shorter, so "does it fit at w" is monotonic. Each probe is a forced layout
   * (only of the quadrant — `.quadrant-body` is a size container), and boards
   * are searched often: on every frame shown (`Table` remounts) and every
   * change to a board's tiles. A dozen probes each time made this the page's
   * biggest main-thread cost on a slow laptop (2026-10-13), so the search
   * starts from the width this seat's board last settled on
   * (`boardFitWidths`) — two probes when that's still the answer. It lands
   * where a search from scratch would, so a board still grows back as soon as
   * it has room again (a creature dying, say). */
  const recomputeBoardMiniW = (pid: PlayerId, boardEl: HTMLDivElement) => {
    const scrollArea = boardEl.closest<HTMLElement>('.quadrant-body')
    const first = boardEl.firstElementChild
    const last = boardEl.lastElementChild
    if (
      !scrollArea ||
      !(first instanceof HTMLElement) ||
      !(last instanceof HTMLElement)
    ) {
      return
    }
    const area = getComputedStyle(scrollArea)
    const available =
      scrollArea.clientHeight - parseFloat(area.paddingTop) - parseFloat(area.paddingBottom)
    const own = getComputedStyle(boardEl)
    const chrome =
      parseFloat(own.paddingTop) +
      parseFloat(own.paddingBottom) +
      parseFloat(own.borderTopWidth) +
      parseFloat(own.borderBottomWidth)
    // The rows' own extent, not the board's box. The board is stretched to
    // its quadrant's full height (`.quadrant-body .board-with-sidezone`), so
    // its box is as tall as the command/library rail beside it however small
    // the tiles get -- measuring that is what pinned every board at the
    // floor, since a rail a few pixels taller than its quadrant read as a
    // board that no tile size could ever fit. offsetTop/offsetHeight, not
    // getBoundingClientRect: a tapped tile's rotation is visual overflow,
    // which mustn't count as the board needing less room.
    const fits = (width: number): boolean => {
      boardEl.style.setProperty('--mini-w-fit', `${width}px`)
      return last.offsetTop + last.offsetHeight - first.offsetTop + chrome <= available
    }
    // What the fit depends on: the room, and how many tiles each row holds
    // (a land turned creature moves rows) and what's in them (an attachment,
    // a chip). Unchanged since the last search — the usual case, a frame
    // that moved something elsewhere — its width stands without a probe.
    // Each probe restyles every tile under the board (`--mini-w-fit` is
    // inherited), so this is most of what a frame used to cost a slow
    // machine (a performance trace, 2026-10-13).
    const clientWidth = boardEl.clientWidth
    const rows = Array.from(boardEl.children, (row) => row.childElementCount).join(',')
    const key = `${available}|${chrome}|${clientWidth}|${rows}|${boardEl.getElementsByTagName('*').length}`
    const known = boardFitWidths.get(pid)
    const set = (width: number) => {
      // Only a change is written: a write restyles the board.
      if (boardEl.style.getPropertyValue('--mini-w-fit') !== `${width}px`) {
        boardEl.style.setProperty('--mini-w-fit', `${width}px`)
      }
      boardFitWidths.set(pid, width)
      boardFitKeys.set(pid, key)
    }
    if (known !== undefined && boardFitKeys.get(pid) === key) {
      set(known)
      return
    }
    // A tile is never wider than its board, and past App.css's cap every
    // width lays out the same, so the upper bound only has to be big enough.
    // Crowded even at the floor, it stays there and the board scrolls.
    // The last probe may have been another width: `set` puts it right.
    set(fitWidth(fits, MINI_SHRINK_FLOOR, clientWidth, known))
  }
  // Two triggers to recompute a board: its scrollable area resizing (window
  // resize, a layout change) and its own tile count changing (a permanent
  // entering/leaving) -- the latter doesn't necessarily change
  // .quadrant-body's own box size (it's the *content* that grew, and
  // overflow:auto means that alone doesn't resize the scrolling box), so
  // ResizeObserver alone wouldn't catch it; a MutationObserver on each
  // board's subtree does. One shared instance of each rather than one
  // ref/effect per player -- see boardElsRef's comment above.
  useEffect(() => {
    const resizeObserver = new ResizeObserver((entries) => {
      for (const entry of entries) {
        for (const [pid, boardEl] of boardElsRef.current) {
          if (boardEl.closest('.quadrant-body') === entry.target) recomputeBoardMiniW(pid, boardEl)
        }
      }
    })
    const mutationObserver = new MutationObserver((mutations) => {
      const changed = new Set<HTMLDivElement>()
      for (const m of mutations) {
        const boardEl = (m.target as HTMLElement).closest<HTMLDivElement>('.board')
        if (boardEl) changed.add(boardEl)
      }
      for (const [pid, boardEl] of boardElsRef.current) {
        if (changed.has(boardEl)) recomputeBoardMiniW(pid, boardEl)
      }
    })
    boardResizeObserverRef.current = resizeObserver
    boardMutationObserverRef.current = mutationObserver
    for (const [pid, el] of boardElsRef.current) {
      const scrollArea = el.closest('.quadrant-body')
      if (scrollArea) resizeObserver.observe(scrollArea)
      mutationObserver.observe(el, { childList: true, subtree: true })
      recomputeBoardMiniW(pid, el)
    }
    return () => {
      resizeObserver.disconnect()
      mutationObserver.disconnect()
    }
  }, [])
  // One ref callback per seat for this mount: a new function each render
  // would have React detach and reattach the board — and search its fit —
  // on every render, a hover's included.
  const [boardRefs] = useState(() => new Map<PlayerId, (el: HTMLDivElement | null) => void>())
  const registerBoardEl = (pid: PlayerId) => {
    let ref = boardRefs.get(pid)
    if (ref === undefined) {
      ref = attachBoardEl(pid)
      boardRefs.set(pid, ref)
    }
    return ref
  }
  const attachBoardEl = useCallback(
    (pid: PlayerId) => (el: HTMLDivElement | null) => {
      const prev = boardElsRef.current.get(pid)
      if (prev) {
        const prevScrollArea = prev.closest('.quadrant-body')
        if (prevScrollArea) boardResizeObserverRef.current?.unobserve(prevScrollArea)
      }
      if (el) {
        boardElsRef.current.set(pid, el)
        const scrollArea = el.closest('.quadrant-body')
        if (scrollArea) boardResizeObserverRef.current?.observe(scrollArea)
        boardMutationObserverRef.current?.observe(el, { childList: true, subtree: true })
        recomputeBoardMiniW(pid, el)
      } else {
        boardElsRef.current.delete(pid)
      }
    },
    [],
  )
  const onlineOf = (pid: PlayerId): boolean | null =>
    game.seats.find((s) => s.player === pid)?.online ?? null
  // Exile is one shared zone (not per-player) — split it by each object's
  // owner so it can be shown/browsed per player-panel like the graveyard is.
  // By the view's owner list, which a face-down card is on too: it has no
  // object here for any seat that can't look at it.
  const exileOf = (pid: PlayerId): readonly ObjectId[] =>
    view.zones.exile.filter((id) => view.zones.exileOwners[id] === pid)
  const openZone = (title: string, ids: readonly ObjectId[]) =>
    setZoneView({ title, ids })

  let controls: ReactNode
  if (view.result.over) {
    controls = (
      <div className="controls">
        <strong>
          {view.result.winner ? `${playerLabel(view.result.winner, game.seats)} wins` : 'Draw'}
        </strong>
        <span className="muted">{view.result.reason}</span>
        <button type="button" onClick={() => window.location.assign('/')}>
          Main menu
        </button>
      </div>
    )
  } else if (mode === 'choose-enchant' && enchantAction) {
    // The Aura may still be somewhere this seat can't see (a library it's
    // being tutored out of), so its name comes with the decision.
    controls = (
      <div className="controls">
        <span>
          {view.decisionSource?.cardName ?? game.nameOf(enchantAction.source)} is entering the
          battlefield — click {(enchantAction.players ?? []).length > 0 ? 'the player' : 'what'} it enchants.
        </span>
      </div>
    )
  } else if (mode === 'order-triggers' && triggerOrderAction) {
    controls = (
      <TriggerOrder
        triggers={triggerOrderAction.triggers}
        onConfirm={(order) => game.dispatch({ type: 'order-triggers', player: seat, order })}
      />
    )
  } else if (mode === 'legend-rule' && legendAction) {
    // Copies of one legend share a name, so buttons couldn't tell them apart:
    // the choice is made on the board, where each shows its own state.
    controls = (
      <div className="controls">
        <span>
          You control more than one {legendAction.name} — click the one to keep. The rest go to
          the graveyard.
        </span>
        <button
          type="button"
          onClick={() =>
            game.dispatch({ type: 'legend-rule', player: seat, keep: legendAction.options[0] })
          }
        >
          Keep the oldest
        </button>
      </div>
    )
  } else if (mode === 'choose-copy' && copyChoiceAction) {
    // Picked on the board, where each permanent shows what it is (Clone's
    // options are creatures, Vesuva's lands, Sculpting Steel's artifacts): two copies
    // of one card are two buttons with the same name.
    controls = (
      <div className="controls">
        <span>{game.nameOf(copyChoiceAction.source)} — click the permanent to copy</span>
        <button
          type="button"
          onClick={() => game.dispatch({ type: 'choose-copy', player: seat, copy: null })}
        >
          Copy nothing
        </button>
      </div>
    )
  } else if (mode === 'choose-creature-type' && creatureTypeChoiceAction?.catalog) {
    // The full creature-type catalog is far too many buttons for this strip —
    // it's answered in the `CreatureTypePicker` popup rendered below.
    controls = (
      <div className="controls">
        <span>{game.nameOf(creatureTypeChoiceAction.source)} — choosing a creature type</span>
        {decisionCollapsed ? (
          <button type="button" onClick={() => setDecisionCollapsed(false)}>
            Show choices
          </button>
        ) : null}
      </div>
    )
  } else if (mode === 'choose-card-name' && cardNameChoiceAction) {
    // Thousands of names: answered in the `CreatureTypePicker` popup below,
    // as a whole catalogue of creature types is.
    controls = (
      <div className="controls">
        <span>
          {game.nameOf(cardNameChoiceAction.source)} — choosing {cardNameChoiceAction.label}
        </span>
        {decisionCollapsed ? (
          <button type="button" onClick={() => setDecisionCollapsed(false)}>
            Show choices
          </button>
        ) : null}
      </div>
    )
  } else if (mode === 'choose-creature-type' && creatureTypeChoiceAction) {
    // A short fixed menu reusing the same decision (Heraldic Banner's colours,
    // Frontier Siege's Khans/Dragons) — plain buttons still fit.
    controls = (
      <div className="controls">
        <span>
          {game.nameOf(creatureTypeChoiceAction.source)} —{' '}
          {creatureTypeChoiceAction.prompt ??
            (creatureTypeChoiceAction.options.every((t) => view.turnOrder.includes(t as PlayerId))
              ? 'choose its protector'
              : creatureTypeChoiceAction.options.every((t) => t in COLOR_CHOICE_NAMES)
                ? 'choose a color'
                : creatureTypeChoiceAction.options.every((t) => BASIC_LAND_TYPES.has(t))
                  ? 'choose a basic land type'
                  : 'choose one')}
        </span>
        {creatureTypeChoiceAction.options.map((t) => (
          <button
            key={t}
            type="button"
            onClick={() =>
              game.dispatch({ type: 'choose-creature-type', player: seat, creatureType: t })
            }
          >
            {/* A battle's protector is chosen among players (rule 310.9a). */}
            {view.turnOrder.includes(t as PlayerId)
              ? playerLabel(t as PlayerId, game.seats)
              : (COLOR_CHOICE_NAMES[t] ?? t)}
          </button>
        ))}
      </div>
    )
  } else if (mode === 'choose-modes' && modesChoiceAction) {
    const { minModes, maxModes, modeTexts, modePlayers, source, ward, about, sameForAll, orNone } = modesChoiceAction
    // A choice among players (Tasigur's "you choose an opponent") reads with
    // their names; the engine's own text names the seat.
    const modeLabel = (i: number): ReactNode => {
      const player = modePlayers?.[i] ?? null
      if (player === null) return <Symbols text={modeTexts[i]} />
      // A mode naming its player in its own words (a gift's "Promise the
      // gift to …") keeps them; otherwise it's "Choose …".
      return modeTexts[i].includes(player)
        ? withNames(modeTexts[i], game.seats, game.nameOf)
        : `Choose ${playerLabel(player, game.seats)}`
    }
    // A "may" — one mode, yes or no. Up to one of several (an additional
    // vote, "time" or "knowledge" or none) is one button each plus none.
    const optional = minModes === 0 && maxModes === 1 && modeTexts.length === 1
    const oneOrNone = minModes === 0 && maxModes === 1 && modeTexts.length > 1
    const single = (minModes === 1 || oneOrNone) && maxModes === 1
    const toggle = (i: number) =>
      setModePicks((prev) =>
        prev.includes(i)
          ? prev.filter((x) => x !== i)
          : prev.length >= maxModes
            ? [...prev.slice(1), i]
            : [...prev, i],
      )
    controls = (
      <div className="controls">
        <span>
          {game.nameOf(source)} —{' '}
          {optional
            ? <Symbols text={modeTexts[0]} />
            : oneOrNone
              ? 'choose one or none'
              : single
                ? 'choose one'
                : `${orNone ? 'you may choose' : 'choose'} ${minModes === maxModes ? minModes : `${minModes}–${maxModes}`}`}
          {/* The same question once per player (myriad): which one this is. */}
          {about !== undefined ? ` — ${playerLabel(about, game.seats)}` : ''}
        </span>
        {optional ? (
          <>
            <button
              type="button"
              onClick={() => game.dispatch({ type: 'choose-modes', player: seat, modes: [0] })}
            >
              {ward ? 'Pay' : 'Yes'}
            </button>
            <button
              type="button"
              onClick={() => game.dispatch({ type: 'choose-modes', player: seat, modes: [] })}
            >
              {ward ? `Don't pay` : 'No'}
            </button>
            {/* Identical triggers still on the stack under this one: answer
                them all now. Each still resolves on its own. */}
            {sameForAll !== undefined && (
              <>
                <button
                  type="button"
                  title={`The same answer for this trigger and the ${sameForAll} identical ${sameForAll === 1 ? 'one' : 'ones'} under it on the stack`}
                  onClick={() =>
                    game.dispatch({ type: 'choose-modes', player: seat, modes: [0], forAll: true })
                  }
                >
                  Yes to all {sameForAll + 1}
                </button>
                <button
                  type="button"
                  title={`The same answer for this trigger and the ${sameForAll} identical ${sameForAll === 1 ? 'one' : 'ones'} under it on the stack`}
                  onClick={() =>
                    game.dispatch({ type: 'choose-modes', player: seat, modes: [], forAll: true })
                  }
                >
                  No to all {sameForAll + 1}
                </button>
              </>
            )}
          </>
        ) : single ? (
          <>
            {modeTexts.map((_, i) => (
              <button
                key={i}
                type="button"
                onClick={() => game.dispatch({ type: 'choose-modes', player: seat, modes: [i] })}
              >
                {modeLabel(i)}
              </button>
            ))}
            {oneOrNone && (
              <button
                type="button"
                onClick={() => game.dispatch({ type: 'choose-modes', player: seat, modes: [] })}
              >
                Choose none
              </button>
            )}
          </>
        ) : (
          <>
            {modeTexts.map((_, i) => (
              <button
                key={i}
                type="button"
                className={modePicks.includes(i) ? 'selected' : undefined}
                aria-pressed={modePicks.includes(i)}
                onClick={() => toggle(i)}
              >
                {modeLabel(i)}
              </button>
            ))}
            <button
              type="button"
              disabled={modePicks.length < minModes || modePicks.length > maxModes}
              onClick={() =>
                game.dispatch({ type: 'choose-modes', player: seat, modes: [...modePicks] })
              }
            >
              Confirm
            </button>
            {/* "You may choose two" (Shadrix Silverquill): none at all is an
                answer too, never just one. */}
            {orNone && (
              <button
                type="button"
                onClick={() => game.dispatch({ type: 'choose-modes', player: seat, modes: [] })}
              >
                Choose none
              </button>
            )}
          </>
        )}
      </div>
    )
  } else if (mode === 'choose-cast-modes' && pendingModes?.cast.castModal) {
    const cm = pendingModes.cast.castModal
    const picked = pendingModes.picked
    const uncastable = (i: number) =>
      cm.modes[i].targetOptions.some((o) => o.length === 0)
    // Spree (rule 702.172a): each mode adds its own cost, so only some sets
    // of modes can be paid for together — the offer's `modeSets`. A mode is
    // open while some payable set holds it beside what's picked, and Confirm
    // waits for picks that are one of those sets.
    const sets = cm.modeSets
    const fits = (picks: readonly number[]) =>
      sets === undefined || sets.some((s) => picks.every((p) => s.includes(p)))
    const complete =
      sets === undefined
        ? picked.length >= cm.minModes && picked.length <= cm.maxModes
        : sets.some((s) => s.length === picked.length && picked.every((p) => s.includes(p)))
    const toggle = (i: number) =>
      setPendingModes((prev) =>
        prev === null
          ? prev
          : {
              ...prev,
              picked: prev.picked.includes(i)
                ? prev.picked.filter((x) => x !== i)
                : prev.picked.length >= cm.maxModes
                  ? [...prev.picked.slice(1), i]
                  : [...prev.picked, i],
            },
      )
    controls = (
      <div className="controls">
        <span>
          {pendingModes.cast.cardName} — choose{' '}
          {cm.minModes === cm.maxModes ? cm.minModes : `${cm.minModes}–${cm.maxModes}`}
        </span>
        {cm.modes.map((m, i) => (
          <button
            key={i}
            type="button"
            className={picked.includes(i) ? 'selected' : undefined}
            aria-pressed={picked.includes(i)}
            disabled={(uncastable(i) || !fits([...picked, i])) && !picked.includes(i)}
            onClick={() => toggle(i)}
          >
            <Symbols text={m.text} />
          </button>
        ))}
        <button
          type="button"
          disabled={!complete}
          onClick={confirmModes}
        >
          Confirm
        </button>
        <button type="button" onClick={() => setPendingModes(null)}>
          Cancel
        </button>
      </div>
    )
  } else if (mode === 'choose-tap' && pendingTap) {
    const { action, offer, picks } = pendingTap
    const what =
      action.type === 'cast-spell' || action.type === 'activate-ability'
        ? game.nameOf(action.type === 'cast-spell' ? action.card : action.source)
        : ''
    // Crew (rule 702.122a): any number of creatures, their powers adding up
    // to at least N.
    const power = tapPicksPower(offer, picks)
    controls = (
      <div className="controls">
        <span>
          {offer.totalPower !== undefined
            ? `${what}: tap creatures with total power ${offer.totalPower} — power ${power}/${offer.totalPower}`
            : `${what}: tap ${offer.count} — ${picks.length}/${offer.count} chosen`}
        </span>
        <button
          type="button"
          disabled={offer.totalPower !== undefined ? power < offer.totalPower : picks.length !== offer.count}
          onClick={() => {
            setPendingTap(null)
            game.dispatch({ ...action, tap: [...picks] } as Action)
          }}
        >
          Confirm
        </button>
        <button type="button" onClick={() => setPendingTap(null)}>
          Cancel
        </button>
      </div>
    )
  } else if (mode === 'split-mana' && manaSplitAsk) {
    // "N mana in any combination of …", how many of each colour, as one
    // answer — the engine used to ask each unit's colour in turn, fifty times
    // for a big Klauth attack (a live report, 2026-10-08). The same strip
    // asks for a mana ability activated by hand with too many splits to list.
    const byHand = splitManaAction ? null : pendingManaSplit
    const { colors, amount } = manaSplitAsk
    const sum = colors.reduce((n, c) => n + (manaSplit[c] ?? 0), 0)
    controls = (
      <div className="controls">
        <span>
          Add {amount} mana in any combination — {sum}/{amount}
        </span>
        <span className="stack-counts">
          {colors.map((color) => {
            const count = manaSplit[color] ?? 0
            return (
              <CountStepper
                key={color}
                label={`{${color}}`}
                symbol={<Symbols text={`{${color}}`} />}
                count={count}
                max={count + (amount - sum)}
                showMax={false}
                maxButton
                onChange={(n) => setManaSplit((cur) => ({ ...cur, [color]: n }))}
              />
            )
          })}
        </span>
        <button
          type="button"
          disabled={sum !== amount}
          onClick={() => {
            const counts = Object.fromEntries(
              colors.flatMap((c): [string, number][] => ((manaSplit[c] ?? 0) > 0 ? [[c, manaSplit[c] ?? 0]] : [])),
            )
            setManaSplit({})
            if (byHand) {
              // The split's picks first, then any after them as the offer
              // has them (a triggered mana ability's).
              const picks = colors.flatMap((c) => Array<ManaType>(manaSplit[c] ?? 0).fill(c))
              setPendingManaSplit(null)
              startAbility({ ...byHand, manaColors: [...picks, ...(byHand.manaColors ?? []).slice(amount)] })
            } else game.dispatch({ type: 'split-mana', player: seat, counts } as Action)
          }}
        >
          Add mana
        </button>
        {byHand ? (
          <button
            type="button"
            onClick={() => {
              setManaSplit({})
              setPendingManaSplit(null)
            }}
          >
            Cancel
          </button>
        ) : null}
      </div>
    )
  } else if (mode === 'venture' && ventureAction) {
    // Rule 701.49: the room at a fork (or the dungeon to enter) is picked on
    // the map, in the popup below; the strip only says so, with the way back
    // to it once "View board" has hidden it. The initiative's venture comes
    // from no card (rule 726.2), so its source isn't in the view: no prefix.
    const what =
      ventureAction.dungeons !== undefined
        ? 'venture into the dungeon: choose a dungeon'
        : `venture into ${ventureAction.maps[0]?.name ?? 'the dungeon'}: choose the next room`
    controls = (
      <div className="controls">
        <span>
          {view.objects[ventureAction.source] !== undefined
            ? `${game.nameOf(ventureAction.source)} — ${what}`
            : what.charAt(0).toUpperCase() + what.slice(1)}
        </span>
        {decisionCollapsed ? (
          <button type="button" onClick={() => setDecisionCollapsed(false)}>
            Show choices
          </button>
        ) : null}
      </div>
    )
  } else if (mode === 'remove-counters' && removeCountersAction) {
    // "Remove a +1/+1 counter from a creature you control", "three counters
    // from among creatures you control", "up to four charge counters": how
    // many of each kind from each, between the offer's min and max in all.
    const offer = removeCountersAction
    const key = (object: string, kind: string): string => `${object}|${kind}`
    const removals = offer.eligible.flatMap((e) =>
      Object.keys(e.counters).flatMap((kind) => {
        const count = counterPicks[key(e.object, kind)] ?? 0
        return count > 0 ? [{ object: e.object, kind, count }] : []
      }),
    )
    const sum = removals.reduce((n, r) => n + r.count, 0)
    const fromObjects = new Set(removals.map((r) => r.object))
    const shareOf = (object: string): number =>
      removals.filter((r) => r.object === object).reduce((n, r) => n + r.count, 0)
    const valid =
      sum >= offer.min && sum <= offer.max && (offer.single !== true || fromObjects.size <= 1)
    controls = (
      <div className="controls">
        <span>
          {view.decisionSource ? `${view.decisionSource.cardName}: ` : ''}
          {offer.prompt} — {sum}
          {offer.min === offer.max ? `/${offer.max}` : ` (${offer.min}–${offer.max})`}
        </span>
        <span className="stack-counts">
          {offer.eligible.flatMap((e) =>
            Object.entries(e.counters).map(([kind, has]) => {
              const count = counterPicks[key(e.object, kind)] ?? 0
              // All from one permanent: another's are closed once one is picked.
              const closed = offer.single === true && fromObjects.size > 0 && !fromObjects.has(e.object)
              const room = Math.min(
                has,
                count + (offer.max - sum),
                offer.perObject === undefined ? has : count + (offer.perObject - shareOf(e.object)),
              )
              return (
                <CountStepper
                  key={key(e.object, kind)}
                  label={`${game.nameOf(e.object)}: ${kind} (${has})`}
                  count={count}
                  max={closed ? count : room}
                  showMax={false}
                  onChange={(n) => setCounterPicks((cur) => ({ ...cur, [key(e.object, kind)]: n }))}
                />
              )
            }),
          )}
        </span>
        <button type="button" disabled={sum === 0} onClick={() => setCounterPicks({})}>
          Clear
        </button>
        <button
          type="button"
          disabled={!valid}
          onClick={() => {
            setCounterPicks({})
            game.dispatch({ type: 'remove-counters', player: seat, removals } as Action)
          }}
        >
          Remove
        </button>
      </div>
    )
  } else if (mode === 'time-travel' && timeTravelAction) {
    // Rule 701.56a: for each permanent you control with a time counter and
    // each suspended card you own, add one, remove one, or neither — all at
    // once, so one answer for the lot. Permanents are clicked on the board,
    // the brush saying which way; a suspended card is in exile, off the
    // board, so it alone gets a row here.
    const pickFor = (id: string): 1 | -1 | 0 => timeTravelPicks[id] ?? 0
    const setPick = (id: string, delta: 1 | -1 | 0) =>
      setTimeTravelPicks((cur) => {
        const next = { ...cur }
        if (delta === 0) delete next[id]
        else next[id] = delta
        return next
      })
    const suspendedHere = timeTravelAction.eligible.filter((id) => view.objects[id]?.zone === 'exile')
    const onBoard = timeTravelAction.eligible.length - suspendedHere.length
    const adding = timeTravelAction.eligible.filter((id) => pickFor(id) === 1).length
    const removing = timeTravelAction.eligible.filter((id) => pickFor(id) === -1).length
    controls = (
      <div className="controls">
        <span>
          {view.decisionSource ? `${view.decisionSource.cardName}: ` : ''}
          Time travel · +{adding} / −{removing}
          {onBoard > 0 ? ' — click your permanents to add or remove a time counter' : ''}
        </span>
        {onBoard > 0 &&
          ([1, -1] as const).map((brush) => (
            <button
              key={brush}
              type="button"
              className={timeTravelBrush === brush ? 'selected' : undefined}
              aria-pressed={timeTravelBrush === brush}
              onClick={() => setTimeTravelBrush(brush)}
            >
              {brush === 1 ? 'Add a counter' : 'Remove a counter'}
            </button>
          ))}
        {suspendedHere.map((id) => (
          <span key={id} className="stack-counts">
            <span>
              {game.nameOf(id)} (suspended, {(view.objects[id]?.counters?.time ?? 0) + pickFor(id)} time)
            </span>
            {([-1, 0, 1] as const).map((delta) => (
              <button
                key={delta}
                type="button"
                className={pickFor(id) === delta ? 'selected' : undefined}
                aria-pressed={pickFor(id) === delta}
                onClick={() => setPick(id, delta)}
              >
                {delta === -1 ? '−1' : delta === 1 ? '+1' : 'Leave'}
              </button>
            ))}
          </span>
        ))}
        <button type="button" disabled={adding + removing === 0} onClick={() => setTimeTravelPicks({})}>
          Clear
        </button>
        {/* Never disabled: leaving everything as it is is an answer too. */}
        <button
          type="button"
          onClick={() => {
            const ids = timeTravelAction.eligible
            const add = ids.filter((id) => pickFor(id) === 1)
            const remove = ids.filter((id) => pickFor(id) === -1)
            setTimeTravelPicks({})
            game.dispatch({ type: 'time-travel', player: seat, add, remove } as Action)
          }}
        >
          Confirm
        </button>
      </div>
    )
  } else if (mode === 'choose-division' && pendingDivision) {
    // At least 1 each, all of it (rule 601.2d): a share can grow only by what
    // the others can spare (game/divideShares.ts).
    const { total, of: dividing, upTo, targets: divTargets, shares, resume } = pendingDivision
    const sum = shares.reduce((a, b) => a + b, 0)
    controls = (
      <div className="controls">
        <span>
          Divide {upTo ? 'up to ' : ''}
          {total} {dividing} — {sum}/{total}
        </span>
        <span className="stack-counts">
          {divTargets.map((ref, i) => (
            <CountStepper
              key={ref.kind === 'player' ? ref.player : ref.object}
              label={ref.kind === 'player' ? playerLabel(ref.player, game.seats) : game.nameOf(ref.object)}
              count={shares[i]}
              min={1}
              max={total - (divTargets.length - 1)}
              onChange={(n) =>
                setPendingDivision((cur) =>
                  cur === null ? cur : { ...cur, shares: setShare(cur.shares, i, n, cur.total) },
                )
              }
            />
          ))}
        </span>
        <button
          type="button"
          disabled={upTo ? sum > total : sum !== total}
          onClick={() => {
            setPendingDivision(null)
            resume(shares)
          }}
        >
          Cast
        </button>
        <button type="button" onClick={() => setPendingDivision(null)}>
          Cancel
        </button>
      </div>
    )
  } else if (mode === 'choose-phyrexian' && pendingPhyrexian) {
    // Each Phyrexian pip: its colour, or 2 life (rule 107.4f). Paying with
    // mana still pays life for a pip mana can't cover.
    const { pips, resume } = pendingPhyrexian
    controls = (
      <div className="controls">
        <span>Phyrexian mana — pay with life?</span>
        {Array.from({ length: pips + 1 }, (_unused, n) => (
          <button
            key={n}
            type="button"
            onClick={() => {
              setPendingPhyrexian(null)
              resume(n)
            }}
          >
            {n === 0 ? 'Mana' : `${n} with life (${2 * n} life)`}
          </button>
        ))}
        <button type="button" onClick={() => setPendingPhyrexian(null)}>
          Cancel
        </button>
      </div>
    )
  } else if (mode === 'choose-convoke' && pendingConvoke) {
    const { action, offer, picks } = pendingConvoke
    const name = action.type === 'cast-spell' ? game.nameOf(action.card) : ''
    // Improvise (rule 702.126a) rides the same offer: artifacts, generic only.
    const verb = offer.improvise === true ? 'improvise' : 'convoke'
    const what = offer.improvise === true ? 'artifact' : 'creature'
    controls = (
      <div className="controls">
        <span>
          {name}: {verb} — tap up to {offer.maxCreatures} {what}
          {offer.maxCreatures === 1 ? '' : 's'} to help pay ({picks.length} chosen)
        </span>
        <button
          type="button"
          disabled={!offer.manaAffordable && picks.length === 0}
          onClick={() => {
            setPendingConvoke(null)
            game.dispatch(
              picks.length === 0
                ? action
                : ({ ...action, convoke: picks.map((creature) => ({ creature })) } as Action),
            )
          }}
        >
          {picks.length === 0 ? 'Pay with mana' : `${offer.improvise === true ? 'Improvise' : 'Convoke'} ${picks.length}`}
        </button>
        <button type="button" onClick={() => setPendingConvoke(null)}>
          Cancel
        </button>
      </div>
    )
  } else if (mode === 'choose-waterbend' && pendingWaterbend) {
    const { action, max, least, picks } = pendingWaterbend
    const name =
      action.type === 'cast-spell'
        ? game.nameOf(action.card)
        : action.type === 'activate-ability'
          ? game.nameOf(action.source)
          : ''
    controls = (
      <div className="controls">
        <span>
          {name}: waterbend — tap up to {max} artifact{max === 1 ? '' : 's'} or creature
          {max === 1 ? '' : 's'} to pay <Symbols text="{1}" /> each
          {least > 0 ? `, at least ${least}` : ''} ({picks.length} chosen)
        </span>
        <button
          type="button"
          disabled={picks.length < least}
          onClick={() => {
            setPendingWaterbend(null)
            game.dispatch({ ...action, waterbend: [...picks] } as Action)
          }}
        >
          {picks.length === 0 ? 'Pay with mana' : `Waterbend ${picks.length}`}
        </button>
        <button type="button" onClick={() => setPendingWaterbend(null)}>
          Cancel
        </button>
      </div>
    )
  } else if (mode === 'sacrifice' && sacrificeAction) {
    controls = (
      <div className="controls">
        <span>
          {view.decisionSource ? `${view.decisionSource.cardName}: ` : ''}
          Sacrifice {sacrificeAction.count} — {sacrificePicks.length}/
          {sacrificeAction.count} chosen
        </span>
        <button
          type="button"
          disabled={sacrificePicks.length !== sacrificeAction.count}
          onClick={() =>
            game.dispatch({ type: 'sacrifice', player: seat, permanents: [...sacrificePicks] })
          }
        >
          Confirm
        </button>
      </div>
    )
  } else if (mode === 'separate-piles' && separatePilesAction) {
    const source = view.decisionSource ? `${view.decisionSource.cardName}: ` : ''
    const chooser = separatePilesAction.chooser === seat ? 'you choose' : `${playerLabel(separatePilesAction.chooser, game.seats)} chooses`
    if (pilesOnBoard) {
      const first = pilePicks.length
      const second = separatePilesAction.objects.length - first
      controls = (
        <div className="controls">
          <span>
            {source}separate into two piles — {chooser} one; {pileFatesText(separatePilesAction.fates)}.
            <span className="muted">
              {' '}
              Click a permanent to move it to pile 1 · pile 1: {first} · pile 2: {second}
            </span>
          </span>
          <button type="button" disabled={first === 0} onClick={() => setPilePicks([])}>
            Clear
          </button>
          <button
            type="button"
            onClick={() =>
              game.dispatch({
                type: 'separate-piles',
                player: seat,
                piles: [[...pilePicks], separatePilesAction.objects.filter((id) => !pilePicks.includes(id))],
              })
            }
          >
            Confirm piles
          </button>
        </div>
      )
    } else {
      controls = (
        <div className="controls">
          <span className="muted">
            {decisionCollapsed ? `${source}separating cards into two piles` : 'Look at the popup to separate the cards'}
          </span>
          {decisionCollapsed ? (
            <button type="button" onClick={() => setDecisionCollapsed(false)}>
              Show choices
            </button>
          ) : null}
        </div>
      )
    }
  } else if (mode === 'choose-pile' && choosePileAction) {
    const source = view.decisionSource ? `${view.decisionSource.cardName}: ` : ''
    if (pilesOnBoard) {
      controls = (
        <div className="controls">
          <span>
            {source}choose a pile — {pileFatesText(choosePileAction.fates)}.
          </span>
          {choosePileAction.piles.map((pile, i) => (
            <button
              key={i}
              type="button"
              onClick={() => game.dispatch({ type: 'choose-pile', player: seat, pile: i })}
            >
              {pileLabels[i]} ({pile.length})
            </button>
          ))}
        </div>
      )
    } else {
      controls = (
        <div className="controls">
          <span className="muted">
            {decisionCollapsed ? `${source}choosing a pile` : 'Look at the popup to choose a pile'}
          </span>
          {decisionCollapsed ? (
            <button type="button" onClick={() => setDecisionCollapsed(false)}>
              Show choices
            </button>
          ) : null}
        </div>
      )
    }
  } else if (mode === 'choose-permanents' && choosePermanentsAction) {
    const { min, max, maxTotalPower, powers } = choosePermanentsAction
    // Kept under a total-power cap (Slaughter the Strong): the running total
    // against it, a negative power subtracting, as the engine counts it.
    const totalPower =
      maxTotalPower === undefined ? 0 : permanentPicks.reduce((n, id) => n + (powers?.[id] ?? 0), 0)
    const overCap = maxTotalPower !== undefined && totalPower > maxTotalPower
    controls = (
      <div className="controls">
        <span>
          {view.decisionSource ? `${view.decisionSource.cardName}: ` : ''}
          {choosePermanentsAction.prompt} —{' '}
          {maxTotalPower !== undefined
            ? `total power ${totalPower}/${maxTotalPower}`
            : `${permanentPicks.length}/${max} chosen`}
        </span>
        <button
          type="button"
          disabled={permanentPicks.length === 0}
          onClick={() => setPermanentPicks([])}
        >
          Clear
        </button>
        <button
          type="button"
          disabled={permanentPicks.length < min || permanentPicks.length > max || overCap}
          onClick={() =>
            game.dispatch({ type: 'choose-permanents', player: seat, permanents: [...permanentPicks] })
          }
        >
          Confirm
        </button>
      </div>
    )
  } else if (mode === 'proliferate' && proliferateAction) {
    // A player's own counters are theirs to want, poison aside.
    const mine = proliferateAction.eligible.filter((t) =>
      t.kind === 'player'
        ? t.player === seat && (view.players[seat]?.counters.poison ?? 0) === 0
        : view.objects[t.object]?.controller === seat,
    )
    // Permanents and players alike are picked on the board: a player's
    // panel shows the counters they have.
    controls = (
      <div className="controls">
        <span>
          {view.decisionSource ? `${view.decisionSource.cardName}: ` : ''}
          Proliferate — click the permanents and players to add counters to ·{' '}
          {proliferatePicks.length} chosen
        </span>
        {/* Atraxa asks this every end step, and the answer is nearly always
            "everything of mine" — so that has to be one click, not five. */}
        <button type="button" onClick={() => setProliferatePicks(mine)}>
          All mine
        </button>
        <button
          type="button"
          disabled={proliferatePicks.length === 0}
          onClick={() => setProliferatePicks([])}
        >
          Clear
        </button>
        {/* Never disabled: choosing nothing is a legal answer (rule 701.27a). */}
        <button
          type="button"
          onClick={() =>
            game.dispatch({
              type: 'proliferate',
              player: seat,
              chosen: [...proliferatePicks],
            })
          }
        >
          Confirm
        </button>
      </div>
    )
  } else if (mode === 'commander-replacement' && commanderChoiceAction) {
    // A commander in a graveyard or exile is already there (rule 903.9a); one
    // headed for a hand or library hasn't moved yet (903.9b).
    const cmdZone = commanderChoiceAction.intendedZone
    const cmdThere = cmdZone === 'graveyard' || cmdZone === 'exile'
    const cmdZoneName = cmdZone === 'exile' ? 'exile' : `your ${cmdZone}`
    controls = (
      <div className="controls">
        <span>
          {game.nameOf(commanderChoiceAction.commander)}{' '}
          {cmdThere
            ? `is in ${cmdZoneName} — move it to the command zone?`
            : `would go to ${cmdZoneName} — move it to the command zone instead?`}
        </span>
        <button
          type="button"
          onClick={() =>
            game.dispatch({ type: 'commander-replacement', player: seat, toCommandZone: true })
          }
        >
          Command zone
        </button>
        <button
          type="button"
          onClick={() =>
            game.dispatch({ type: 'commander-replacement', player: seat, toCommandZone: false })
          }
        >
          {cmdThere ? `Leave in ${cmdZone}` : `Put into ${cmdZone}`}
        </button>
      </div>
    )
  } else if (mode === 'cast-now' && castNowAction) {
    // "You may cast [a card]" while something resolves: each way to cast it
    // runs the ordinary cast steps, and the finished cast goes out as the
    // decision's answer (`useNetworkGame`'s `dispatch` wraps it). With
    // several cards on offer the card is picked in the popup first.
    const card = castNowPicking ? castNowPick : (castNowAction.cards[0] ?? null)
    const ways = card === null ? [] : castNowAction.casts.filter((c) => c.card === card)
    // "You may play the exiled card" (hideaway): a land is played, not cast.
    const landWays = card === null ? [] : (castNowAction.lands ?? []).filter((l) => l.card === card)
    const verb = landWays.length > 0 ? 'Play' : 'Cast'
    controls = card === null ? (
      <div className="controls">
        <span className="muted">
          {decisionCollapsed ? 'Choosing a spell to cast' : 'Look at the popup to choose'}
        </span>
        {decisionCollapsed ? (
          <button type="button" onClick={() => setDecisionCollapsed(false)}>
            Show choices
          </button>
        ) : null}
      </div>
    ) : (
      <div className="controls">
        <span>
          {verb} {ways[0]?.cardName ?? landWays[0]?.cardName ?? game.nameOf(card)}
          {castNowAction.miracle !== undefined && ways.length > 0 ? (
            <> for its miracle cost, <Symbols text={castNowAction.miracle} /></>
          ) : null}
          {castNowAction.madness !== undefined && ways.length > 0 ? (
            <> for its madness cost, <Symbols text={castNowAction.madness} /></>
          ) : castNowAction.byDiscarding === true && ways.length > 0
            ? ' by discarding a card rather than paying its mana cost'
            : castNowAction.free && ways.length > 0
              ? ' without paying its mana cost'
              : ' now'}
          ?
        </span>
        {landWays.map((l, i) => (
          <button
            key={`land-${i}`}
            type="button"
            onClick={() =>
              game.dispatch({
                type: 'cast-now',
                player: seat,
                cast: { type: 'play-land', player: seat, card: l.card, ...(l.face !== undefined ? { face: l.face } : {}) },
              })
            }
          >
            Play {l.cardName}
          </button>
        ))}
        {ways.map((c, i) => (
          <button key={i} type="button" onClick={() => beginCast(c)}>
            Cast {c.cardName}
            {/* A gift costs no mana: "(gift)", nothing after it. */}
            {c.kicked ? (
              <>
                {' '}({c.kickerKeyword ?? 'kicked'}
                {c.kickerCost ? <> <Symbols text={c.kickerCost} /></> : null})
              </>
            ) : null}
            {c.costOptionText ? <> (<Symbols text={c.costOptionText} />)</> : null}
            {castNowAction.miracle !== undefined ? (
              <> (miracle <Symbols text={castNowAction.miracle} />)</>
            ) : null}
            {castNowAction.madness !== undefined ? (
              <> (madness <Symbols text={castNowAction.madness} />)</>
            ) : castNowAction.byDiscarding === true ? ' (discard a card)' : c.free ? ' (free)' : ''}
            {c.prototype ? <> (prototype <Symbols text={c.prototypeCost ?? ''} />)</> : null}
            {c.offspring ? <> (offspring <Symbols text={c.offspringCost ?? ''} />)</> : null}
            {c.evoke ? <> (evoke <Symbols text={c.evokeCost ?? ''} />)</> : null}
            {c.splice?.map((s) => (
              <span key={s.object}> (splicing {s.cardName} <Symbols text={s.cost} />)</span>
            ))}
          </button>
        ))}
        {castNowPicking ? (
          <button type="button" onClick={() => setCastNowPick(null)}>
            Back
          </button>
        ) : null}
        <button type="button" onClick={() => game.dispatch({ type: 'cast-now', player: seat, cast: null })}>
          {verb === 'Play' ? "Don't play" : "Don't cast"}
        </button>
      </div>
    )
  } else if (mode === 'pay-life-for-untapped' && shockChoiceAction) {
    controls = (
      <div className="controls">
        <span>
          {game.nameOf(shockChoiceAction.source)} — pay {shockChoiceAction.life} life to have
          it enter untapped?
        </span>
        <button
          type="button"
          onClick={() =>
            game.dispatch({ type: 'pay-life-for-untapped', player: seat, pay: true })
          }
        >
          Pay {shockChoiceAction.life} life
        </button>
        <button
          type="button"
          onClick={() =>
            game.dispatch({ type: 'pay-life-for-untapped', player: seat, pay: false })
          }
        >
          Enter tapped
        </button>
      </div>
    )
  } else if (mode === 'miracle-reveal' && miracleChoiceAction) {
    // Rule 702.94a: revealing puts the miracle trigger on the stack, which
    // offers the cast as it resolves.
    controls = (
      <div className="controls">
        <span>
          Miracle — reveal {game.nameOf(miracleChoiceAction.source)} to cast it for{' '}
          <Symbols text={miracleChoiceAction.cost} />?
        </span>
        <button
          type="button"
          onClick={() => game.dispatch({ type: 'miracle-reveal', player: seat, reveal: true })}
        >
          Reveal
        </button>
        <button
          type="button"
          onClick={() => game.dispatch({ type: 'miracle-reveal', player: seat, reveal: false })}
        >
          Keep hidden
        </button>
      </div>
    )
  } else if (mode === 'reveal-for-untapped' && revealChoiceAction) {
    // Picked in the hand, as a discard is: the cards it could show are lit.
    controls = (
      <div className="controls">
        <span>
          {game.nameOf(revealChoiceAction.source)} — click a card in your hand to reveal it, and
          it enters untapped
        </span>
        <button
          type="button"
          disabled={revealPick === null}
          onClick={() => game.dispatch({ type: 'reveal-for-untapped', player: seat, reveal: revealPick })}
        >
          Reveal
        </button>
        <button
          type="button"
          onClick={() => game.dispatch({ type: 'reveal-for-untapped', player: seat, reveal: null })}
        >
          Enter tapped
        </button>
      </div>
    )
  } else if (mode === 'put-on-bottom' && bottomAction) {
    controls = (
      <div className="controls">
        <span>
          Put {bottomAction.count} card(s) on the bottom of your library — click cards in your
          hand · {bottomPicks.length}/{bottomAction.count}
        </span>
        <button
          type="button"
          disabled={bottomPicks.length !== bottomAction.count}
          onClick={confirmBottom}
        >
          Confirm
        </button>
      </div>
    )
  } else if (mode === 'targeting' && activeTargeting) {
    // A slot whose only legal options are spells on the stack (Counterspell
    // and the like) needs no banner at all -- the stack itself is directly
    // clickable/highlighted now (see Stack.tsx's targetSlot/onTargetClick
    // wiring), so the player picks a target by clicking the actual card
    // instead of a text-button duplicate of it. Escape still cancels (see
    // the global keydown handler above) even with no visible Cancel button.
    const allStackTargets =
      targetSlot.length > 0 &&
      targetSlot.every((o) => o.kind === 'object' && view.zones.stack.includes(o.object))
    // An "any number of" group keeps its prompt even over stack targets:
    // Done is how it ends.
    const grouped = inTargetGroup(activeTargeting)
    const groupPicked = grouped ? activeTargeting.picked.length - anyNumberSlot(activeTargeting.specs) : 0
    const slotSpec = currentSpec(activeTargeting)
    // A copy's target can always be kept, whether or not it's still there to
    // click — and so can a spell's whose targets an effect lets its player
    // choose again, but not one that must change ("change the target of …":
    // its own target isn't among the slot's options).
    const slotIndex = activeTargeting.picked.length
    const nowTarget = activeTargeting.current?.[slotIndex]
    const keep =
      nowTarget !== undefined &&
      (activeTargeting.options?.[slotIndex] ?? []).some((o) =>
        o.kind === 'player'
          ? nowTarget.kind === 'player' && o.player === nowTarget.player
          : nowTarget.kind === 'object' && o.object === nowTarget.object,
      )
        ? nowTarget
        : undefined
    const keepLabel =
      keep === undefined
        ? ''
        : keep.kind === 'player'
          ? playerLabel(keep.player, game.seats)
          : view.objects[keep.object]
            ? game.nameOf(keep.object)
            : 'its target'
    controls = allStackTargets && !grouped && keep === undefined ? null : (
      <div className="controls">
        <span>
          {activeTargeting.label}: choose {slotSpec === undefined ? 'a target' : describeTargetSpec(slotSpec)}{' '}
          {grouped
            ? `— ${groupPicked} chosen`
            : `(${activeTargeting.picked.length + 1}/${activeTargeting.specs.length})`}
        </span>
        {zoneTargetIds.length > 0 && zoneTargetCollapsed ? (
          <button type="button" onClick={() => setZoneTargetHidden(null)}>
            Show choices
          </button>
        ) : null}
        {keep !== undefined ? (
          <button type="button" onClick={() => pickTarget(keep)}>
            Keep {keepLabel}
          </button>
        ) : null}
        {grouped ? (
          <button type="button" disabled={!mayFinishGroup(activeTargeting)} onClick={() => pickTarget(null)}>
            Done
          </button>
        ) : slotSpec !== undefined && isOptionalSpec(slotSpec) ? (
          <button
            type="button"
            disabled={!maySkipSlot(activeTargeting)}
            onClick={() => pickTarget(null)}
          >
            Skip
          </button>
        ) : null}
        {activeTargeting.kind === 'choose-targets' ? null : (
          <button type="button" onClick={() => setTargeting(null)}>
            Cancel
          </button>
        )}
      </div>
    )
  } else if (
    mode === 'choose-sacrifice' &&
    pendingSac !== null &&
    pendingSac.sacrifice !== undefined
  ) {
    // Either an activated ability's sacrifice cost, or a spell's additional
    // cost to cast (rule 601.2f — Harrow "sacrifice a land"). P8.
    // The choices are picked on the board, where each one is highlighted —
    // a list of names can't tell two Forests apart.
    const noun = sacrificeNoun(pendingSac, view, pendingSac.sacrifice.choices)
    controls = (
      <div className="controls">
        <span>
          {pendingSac.cardName} — choose {/^[aeiou]/i.test(noun) ? 'an' : 'a'} {noun} to sacrifice
        </span>
        <button type="button" onClick={() => setPendingSac(null)}>
          Cancel
        </button>
      </div>
    )
  } else if (mode === 'choose-escape-exile' && pendingEscape) {
    // The choice itself is the ZoneViewer popup below; this strip is what
    // shows under it.
    const n = pendingEscape.offer.count
    controls = (
      <div className="controls">
        <span className="muted">
          {pendingEscape.cast.via === 'escape' ? 'Escape' : 'Cast'} {pendingEscape.cast.cardName} — choose{' '}
          {n} other card{n === 1 ? '' : 's'} to exile
        </span>
        <button type="button" onClick={() => setPendingEscape(null)}>
          Cancel
        </button>
      </div>
    )
  } else if (mode === 'choose-delve' && pendingDelve) {
    // The choice itself is the ZoneViewer popup below.
    const { minCards, maxCards } = pendingDelve.offer
    controls = (
      <div className="controls">
        <span className="muted">
          Delve {pendingDelve.cast.cardName} — exile{' '}
          {minCards === maxCards ? maxCards : `${minCards}–${maxCards}`} card
          {maxCards === 1 ? '' : 's'} from your graveyard, each paying <Symbols text="{1}" />
        </span>
        <button type="button" onClick={() => setPendingDelve(null)}>
          Cancel
        </button>
      </div>
    )
  } else if (mode === 'choose-x' && pendingX) {
    const pxMax = pendingX.action.xCost?.maxX ?? 0
    const pxMin = pendingX.action.xCost?.minX ?? 0
    const pxVerb = pendingX.action.kind === 'activate-ability' ? 'Activate' : 'Cast'
    controls = (
      <div className="controls">
        <span>
          {pxVerb} {pendingX.action.cardName} —{' '}
          {pendingX.action.kind === 'cast-spell' && pendingX.action.xCost?.sacrifice === true
            ? 'how many to sacrifice'
            : 'choose X'}
        </span>
        <input
          type="number"
          min={pxMin}
          max={pxMax}
          value={pendingX.value}
          onChange={(e) => {
            const n = Math.max(pxMin, Math.min(pxMax, Math.floor(Number(e.target.value) || 0)))
            setPendingX({ ...pendingX, value: n })
          }}
          style={{ width: '4rem' }}
        />
        <span>(max {pxMax})</span>
        <button type="button" onClick={confirmX}>
          Confirm
        </button>
        <button type="button" onClick={() => setPendingX(null)}>
          Cancel
        </button>
      </div>
    )
  } else if (mode === 'attackers' && attackAction) {
    const assignedCount = Object.keys(attackAssignments).length
    // Everything not already pointed at someone, and not already waiting.
    const unpicked = attackAction.eligible.filter(
      (id) => attackAssignments[id] === undefined && !attackPicks.includes(id),
    )
    // Where the current group could be sent: a defender every one of them may
    // legally attack. Empty means the selection has no common target — a
    // goaded creature mixed in with ordinary ones does this — and the player
    // has to narrow it rather than have the attack split for them.
    const groupTargets =
      attackPicks.length === 0
        ? []
        : (attackAction.defenders ?? []).filter((d) => canSendPicksAt(d))
    // Creatures that must attack and aren't yet pointed at anyone — the
    // engine's own check against this offer, so Confirm can't disagree with
    // the validator.
    const unmetMusts = attackingViolations(
      Object.entries(attackAssignments).map(([attacker, defender]) => ({
        attacker: attacker as ObjectId,
        defender,
      })),
      attackAction,
    ).map((v) => v.attacker)
    // A tile of several with some attacking: a count per defender, rather
    // than a click per creature (game/attackGroups.ts).
    const pairs = attackPairs(attackAssignments, attackPicks, defendersFor, tileOf)
    // What attacking costs (Ghostly Prison, Propaganda): each creature sent
    // at a taxing player, at that player's rate. Past the budget the engine
    // checks the payment exactly, so this warns rather than blocks.
    const taxRates = attackAction.attackTax?.perCreature as Readonly<Record<string, number>> | undefined
    const attackTax = Object.values(attackAssignments).reduce((n, d) => n + (taxRates?.[d] ?? 0), 0)
    const overBudget = attackTax > (attackAction.attackTax?.budget ?? 0)
    // Picking attackers to aim says so ("2 selected · click who they
    // attack"). With more than one defender to aim at, that has a line of its
    // own from the start, so picking doesn't wrap the prompt and grow the
    // panel a line (the jitter sweep, 2026-10-10).
    const pickHint =
      attackPicks.length > 0
        ? `${attackPicks.length} selected · ${
            groupTargets.length > 0 ? 'click who they attack' : 'no one legal for all of them — narrow the selection'
          }`
        : ''
    const hintLine = attackAction.defenders.length > 1
    controls = (
      <div className="controls">
        <span>
          {enterAttackingAction !== undefined
            ? // Rule 508.4: each creature put onto the battlefield attacking
              // needs a target, so the count is out of all of them.
              `${view.decisionSource ? `${view.decisionSource.cardName}: ` : ''}choose what each attacks — ${assignedCount} of ${attackAction.eligible.length}`
            : `Declare attackers — ${assignedCount} attacking`}
          {!hintLine && pickHint ? `, ${pickHint}` : ''}
          {unmetMusts.length > 0 && enterAttackingAction === undefined
            ? ` · ${unmetMusts.map((id) => game.nameOf(id)).join(', ')} must attack`
            : ''}
          {attackTax > 0 ? (
            <>
              {' '}
              · costs <Symbols text={`{${attackTax}}`} /> to attack
              {overBudget ? ' — more than you can surely pay' : ''}
            </>
          ) : null}
          {hintLine ? <span className="decision-hint">{pickHint || ' '}</span> : null}
        </span>
        {pairs.length > 0 ? (
          <span className="stack-counts">
            {pairs.map((p) => (
              <CountStepper
                key={`${p.attackers[0]}>${p.defender}`}
                label={`${game.nameOf(p.attackers[0])} → ${attackTargetLabel(p.defender)}`}
                count={p.count}
                max={p.max}
                onChange={(n) =>
                  setAttackAssignments((cur) => setAttackPairCount(p, n, attackPicks, defendersFor, cur))
                }
              />
            ))}
          </span>
        ) : null}
        {/* Bands (rule 702.22c), when something attacking can lead one: a
            chip per band formed, and "Band…" to build another by clicking
            attacking creatures on the board. */}
        {attackAction.banding !== undefined && enterAttackingAction === undefined ? (
          <span className="attack-bands">
            {attackBands.map((band, i) => (
              <button
                key={band.join(',')}
                type="button"
                className="attack-band-chip"
                title="Break up this band"
                onClick={() => setAttackBands((cur) => cur.filter((_, k) => k !== i))}
              >
                Band {i + 1}: {band.map((id) => game.nameOf(id)).join(' + ')} ✕
              </button>
            ))}
            {bandDraft === null ? (
              <button
                type="button"
                disabled={!Object.keys(attackAssignments).some((m) => (attackAction.banding ?? {})[realId(m as ObjectId)] !== undefined)}
                title="Click attacking creatures to put them in one band"
                onClick={() => setBandDraft([])}
              >
                Band…
              </button>
            ) : (
              <>
                <span className="decision-hint">
                  {bandDraft.length === 0
                    ? 'click attackers to band together'
                    : bandDraft.map((id) => game.nameOf(id)).join(' + ')}
                </span>
                <button
                  type="button"
                  disabled={bandDraft.length < 2}
                  onClick={() => {
                    const draft = bandDraft
                    setAttackBands((cur) => [...cur.map((b) => b.filter((id) => !draft.includes(id))).filter((b) => b.length > 1), draft])
                    setBandDraft(null)
                  }}
                >
                  Make band
                </button>
                <button type="button" onClick={() => setBandDraft(null)}>
                  Cancel
                </button>
              </>
            )}
          </span>
        ) : null}
        {/* "All attack" and Clear stay, disabled while there's nothing for
            them to do: coming and going, they moved Confirm's neighbours on
            every click. */}
        <button
          type="button"
          disabled={unpicked.length === 0}
          onClick={() => {
            // As a click on each would: a creature with only one legal
            // defender (every one, at a two-player table without a
            // planeswalker) is sent there outright, and only those with a
            // real choice wait in the group for the player to point.
            const single = unpicked.filter((id) => defendersFor(id).length === 1)
            const choosing = unpicked.filter((id) => defendersFor(id).length !== 1)
            if (single.length > 0) {
              setAttackAssignments((cur) => ({
                ...cur,
                ...Object.fromEntries(single.map((id) => [id, defendersFor(id)[0]])),
              }))
            }
            if (choosing.length > 0) setAttackPicks((cur) => [...cur, ...choosing])
          }}
        >
          <StableLabel widest={['All attack', 'Select all']}>
            {unpicked.length > 0 && unpicked.some((id) => defendersFor(id).length !== 1) ? 'Select all' : 'All attack'}
          </StableLabel>
        </button>
        <button type="button" disabled={attackPicks.length === 0} onClick={() => setAttackPicks([])}>
          Clear
        </button>
        <button type="button" disabled={unmetMusts.length > 0} onClick={confirmAttackers}>
          {enterAttackingAction !== undefined ? (
            'Confirm'
          ) : (
            <StableLabel widest={['No attacks', `Attack with ${attackAction.eligible.length}`]}>
              {assignedCount === 0 ? 'No attacks' : `Attack with ${assignedCount}`}
            </StableLabel>
          )}
        </button>
      </div>
    )
  } else if (mode === 'blockers' && blockAction) {
    const n = Object.keys(blockAssign).length
    // The set-level rules (menace, Lure) are the engine's own check against
    // this same offer, so Confirm can't disagree with the validator.
    const violations = blockingViolations(
      [...blockEntries(blockAssign, blockPerToken), ...extraBlocks(blockExtra, blockAssign)],
      blockAction,
    )
    const loneMenace = violations.flatMap((v) => (v.kind === 'menace' ? [v.attacker] : []))
    const unforcedBlockers = violations.flatMap((v) =>
      v.kind === 'must-be-blocked' ? [v.blocker] : [],
    )
    const unblockedMusts = violations.flatMap((v) =>
      v.kind === 'must-be-blocked-if-able' ? [v.attacker] : [],
    )
    const overBlocked = violations.flatMap((v) => (v.kind === 'single-blocker' ? [v.attacker] : []))
    // A creature that has to block if able (provoke) and isn't.
    const requiredBlockers = violations.flatMap((v) => (v.kind === 'block-requirement' ? [v.blocker] : []))
    // A folded tile of yours with blocks out: a count to set, rather than a
    // click per creature (game/blockGroups.ts).
    const pairs = blockPairs(blockAction, blockAssign, tileOf)
    controls = (
      <div className="controls">
        <span>
          Declare blockers — {n} assigned
          {blockFocus
            ? ` · pick an attacker for ${game.nameOf(blockFocus)}`
            : ''}
          {loneMenace.length > 0
            ? ` · ${loneMenace
                .map((id) => game.nameOf(id))
                .join(', ')} has menace (needs 2+ blockers)`
            : ''}
          {unforcedBlockers.length > 0
            ? ` · ${unforcedBlockers
                .map((id) => game.nameOf(id))
                .join(', ')} must block (Lure)`
            : ''}
          {requiredBlockers.length > 0
            ? ` · ${requiredBlockers
                .map((id) => game.nameOf(id))
                .join(', ')} must block if able`
            : ''}
          {unblockedMusts.length > 0
            ? ` · ${unblockedMusts
                .map((id) => game.nameOf(id))
                .join(', ')} must be blocked if able`
            : ''}
          {overBlocked.length > 0
            ? ` · ${overBlocked
                .map((id) => game.nameOf(id))
                .join(', ')} can't be blocked by more than one creature`
            : ''}
        </span>
        {pairs.length > 0 ? (
          <span className="stack-counts">
            {pairs.map((p) => (
              <CountStepper
                key={`${p.blockers[0]}>${p.attackers[0]}`}
                label={`${game.nameOf(p.blockers[0])} → ${game.nameOf(p.attackers[0])}${
                  p.attackers.length > 1 ? ` ×${p.attackers.length}` : ''
                }`}
                count={p.count}
                max={p.max}
                maxButton
                onChange={(n) => setBlockAssign((cur) => setPairCount(p, n, blockAction, cur))}
              />
            ))}
          </span>
        ) : null}
        {/* A stack blocking a stack: how the blockers spread over the
            attackers, and one click to a block of 1, 2 or 3 on each (the
            user, 2026-10-22: 200 Soldiers on 100 Zombies). */}
        {pairs
          .filter((p) => p.attackers.length > 1)
          .map((p) => {
            const per = p.attackers.length
            const each = Array.from({ length: Math.min(3, Math.floor(p.max / per)) }, (_, i) => i + 1)
            const low = Math.floor(p.count / per)
            const extra = p.count % per
            return (
              <span key={`each-${p.blockers[0]}>${p.attackers[0]}`} className="block-pair-each">
                <span className="block-pair-summary">
                  {p.count === 0
                    ? 'none blocked'
                    : p.count < per
                      ? `${p.count} of ${per} blocked, 1 on each`
                      : extra === 0
                        ? `every one blocked, ${low} on each`
                        : `every one blocked, ${low}–${low + 1} on each`}
                </span>
                {each.map((k) => (
                  <button
                    key={k}
                    type="button"
                    className={p.count === k * per ? 'selected' : undefined}
                    aria-pressed={p.count === k * per}
                    onClick={() => setBlockAssign((cur) => setPairCount(p, k * per, blockAction, cur))}
                  >
                    {k} each
                  </button>
                ))}
              </span>
            )
          })}
        <button
          type="button"
          onClick={() => {
            setBlockAssign({})
            setBlockExtra({})
            setBlockFocus(null)
          }}
        >
          Clear
        </button>
        <button
          type="button"
          disabled={
            loneMenace.length > 0 ||
            unforcedBlockers.length > 0 ||
            requiredBlockers.length > 0 ||
            unblockedMusts.length > 0 ||
            overBlocked.length > 0
          }
          onClick={confirmBlockers}
        >
          <StableLabel widest={['No blocks', `Block (${blockAction.eligible.length})`]}>
            {n === 0 ? 'No blocks' : `Block (${n})`}
          </StableLabel>
        </button>
      </div>
    )
  } else if (mode === 'discard' && discardAction) {
    const fromEffect =
      view.awaiting?.kind === 'discard' && view.awaiting.fromEffect === true
    controls = (
      <div className="controls">
        <span>
          {fromEffect
            ? `${view.decisionSource ? `${view.decisionSource.cardName}: ` : ''}Discard ${
                discardAction.upTo === true ? 'any number of cards' : discardAction.count
              }${discardAction.upTo === true ? '' : ` card${discardAction.count === 1 ? '' : 's'}`}`
            : 'Discard to hand size'}
          {discardAction.orOneOf !== undefined ? ', or one land card' : ''}{' '}
          — click cards in your hand · {discardPicks.length}/{discardAction.count}
        </span>
        <button
          type="button"
          disabled={
            // "Any number": none up to the hand.
            (discardAction.upTo === true ? discardPicks.length > discardAction.count : discardPicks.length !== discardAction.count) &&
            !(discardPicks.length === 1 && (discardAction.orOneOf ?? []).includes(discardPicks[0]))
          }
          onClick={confirmDiscard}
        >
          Discard
        </button>
      </div>
    )
  } else if (mode === 'choose-from-zone' && zoneChoiceAction) {
    controls = (
      <div className="controls">
        <span className="muted">
          {decisionCollapsed ? 'Choosing from a set of cards' : 'Look at the popup to choose'}
        </span>
        {decisionCollapsed ? (
          <button type="button" onClick={() => setDecisionCollapsed(false)}>
            Show choices
          </button>
        ) : null}
      </div>
    )
  } else if (mode === 'scry' && scryAction) {
    controls = (
      <div className="controls">
        <span className="muted">
          {scryAction.mode === 'surveil' ? 'Surveil' : 'Scry'} — pick cards to
          move {scryAction.mode === 'surveil' ? 'to your graveyard' : 'to the bottom'}
        </span>
        {decisionCollapsed ? (
          <button type="button" onClick={() => setDecisionCollapsed(false)}>
            Show choices
          </button>
        ) : null}
      </div>
    )
  } else if (mode === 'assign-combat-damage' && assignDamageAction && damageAnswer) {
    // Starts at the engine's standard split: kill as many blockers as
    // possible, the cheapest first, then trample the rest over or leave it on
    // a blocker. Any split is legal (there's no damage assignment order since
    // Foundations); only trampling over needs lethal on every blocker.
    //
    // A row per group of interchangeable blockers rather than per blocker
    // (see game/damageAssignment.ts), scrolling past a few, with the board
    // taking clicks for the same choice. One input per blocker made a token
    // stack of twenty blocking into a panel taller than the quadrant under it.
    const offer = assignDamageAction
    const picks = damageAnswer
    const free = unassigned(offer, picks)
    const everyone = offer.blockers.map((_, i) => i)
    const allLethal = lethalCount(offer, everyone, picks) === offer.blockers.length
    const dead = deathCount(offer, everyone, picks, damageSurvivors)
    // Rule 510.1c, from the engine. Its `whyCannot` runs the same function on
    // the same offer, so a split this button enables is one the server takes.
    const valid = damageAssignmentViolations(offer, picks) === null
    const attacked = view.objects[offer.attacker]?.attacking ?? null
    const overTo = attacked === null ? 'the defender' : attackTargetLabel(attacked)
    const status =
      free > 0
        ? offer.trample
          ? allLethal
            ? `→ ${overTo}: ${free}`
            : `${free} left · trample needs lethal on all`
          : `${free} left to assign`
        : offer.trample
          ? `→ ${overTo}: 0`
          : null
    controls = (
      <div className="controls damage-assign">
        <span>
          {/* Banding hands the division to the other side (rules
              702.22j-k): it's the opponent's creature's damage being split,
              and a blocker's among the band it blocks. */}
          {offer.forOpponent === true ? 'Banding: you divide ' : 'Assign '}
          {game.nameOf(offer.attacker)}&rsquo;s {offer.power} damage
          {offer.trample ? ' (trample)' : ''}
          <span className="muted">
            {' '}
            · click {offer.blocking === true ? 'an attacker' : 'a blocker'} to kill or spare it
          </span>
        </span>
        <div className="damage-rows">
          {damageGroups.map((g) => {
            const total = totalOf(g.members, picks)
            const killed = deathCount(offer, g.members, picks, damageSurvivors)
            // Lethal on an indestructible blocker, which it survives.
            const shrugged = killed === 0 && lethalCount(offer, g.members, picks) > 0
            const size = g.members.length
            const fewer = spareOne(g.members, picks)
            const more = addToGroup(offer, g.members, picks)
            return (
              <div key={g.members[0]} className="damage-row">
                <span className="damage-name" title={`${g.label} · ${g.detail}`}>
                  {g.label} <span className="muted">{g.detail}</span>
                </span>
                <button
                  type="button"
                  className="damage-step"
                  aria-label={`Spare one of ${g.label}`}
                  disabled={!fewer}
                  onClick={() => fewer && setDamagePicks(fewer)}
                >
                  −
                </button>
                <input
                  type="number"
                  min={0}
                  max={total + Math.max(0, free)}
                  value={total}
                  aria-label={`Damage to ${g.label}`}
                  onChange={(e) =>
                    setDamagePicks(setGroupTotal(offer, g, picks, Number(e.target.value) || 0))
                  }
                />
                <button
                  type="button"
                  className="damage-step"
                  aria-label={`More damage to ${g.label}`}
                  disabled={!more}
                  onClick={() => more && setDamagePicks(more)}
                >
                  +
                </button>
                <span className="damage-dead">
                  {killed > 0 ? (size > 1 ? `☠ ${killed}/${size}` : '☠') : shrugged ? 'lethal' : ''}
                </span>
              </div>
            )
          })}
        </div>
        {status !== null ? (
          <span className={valid ? '' : 'damage-short'}>{status}</span>
        ) : null}
        <span className="muted">
          ☠ {dead}/{offer.blockers.length}
        </span>
        <button type="button" disabled={damagePicks === null} onClick={() => setDamagePicks(null)}>
          Reset
        </button>
        <button
          type="button"
          disabled={!valid}
          onClick={() =>
            game.dispatch({
              type: 'assign-combat-damage',
              player: seat,
              assignment: [...picks],
            })
          }
        >
          Confirm
        </button>
        {/* Attackers still to assign that are in the same situation as this
            one (a stack of tokens each blocked alike): the same split for
            all of them, rather than a prompt per token (the user,
            2026-10-22). */}
        {offer.alike !== undefined && offer.alike > 0 ? (
          <button
            type="button"
            disabled={!valid}
            title={`This split for this attacker and the ${offer.alike} others blocked the same way`}
            onClick={() =>
              game.dispatch({
                type: 'assign-combat-damage',
                player: seat,
                assignment: [...picks],
                forAll: true,
              })
            }
          >
            Same for all {offer.alike + 1}
          </button>
        ) : null}
      </div>
    )
  } else {
    // Reaching this fallback with `awaiting` set always means it's someone
    // else's declaration pending (a decision of ours would have matched one
    // of the branches above) — that's a "waiting on them", not a priority
    // window of our own.
    const who = actingPlayer(view) ?? seat
    const awaiting = view.awaiting
    controls = (
      <div className="controls">
        {/* Only the "waiting on someone else" line — what they're deciding
            isn't shown anywhere else. The other case this used to render
            ("X has priority · <step>") is already in the top strip, spelled
            out, as "X to act" plus the full phase name; repeating it here
            was what pushed these four buttons onto a second row and made
            this corner tall enough to cover a whole quadrant's rail. */}
        {/* A row of its own above the buttons (`.priority-waiting`), so its
            coming and going moves none of them. */}
        {awaiting !== null ? (
          <span className="muted priority-waiting">
            {`Waiting for ${playerLabel(who, game.seats)} to ${AWAITING_LABEL[awaiting.kind]}…`}
          </span>
        ) : null}
        {/* A spectator only watches: no passing of any kind. */}
        {game.spectating ? null : (
          <>
            {/* Only while something is actually on the stack: with an empty one
                there is nothing to resolve, and the button would read as a
                second, vaguer "Pass". First in the row, so the right-anchored
                buttons after it stay where they are as it comes and goes. */}
            {view.zones.stack.length > 0 ? (
              <button
                type="button"
                data-tour="game-resolve-stack"
                onClick={game.resolveAll}
                disabled={!canPass}
                title="Keep passing until the stack has resolved — stops if anything needs you"
              >
                Resolve stack (
                {/* An entry standing for several identical triggers is that many. */}
                {view.zones.stack.reduce((n, id) => n + (view.objects[id]?.stackCount ?? 1), 0)})
              </button>
            ) : null}
            <button type="button" data-tour="game-pass" onClick={pass} disabled={!canPass}>
              Pass (space)
            </button>
            <button type="button" data-tour="game-pass-turn" onClick={game.passTurn} disabled={!canPassTurn}>
              Pass Turn
            </button>
            {/* Short labels so all four fit one row; `title` carries the full
                sentence, since that's the part that actually explains them. */}
            <button
              type="button"
              data-tour="game-auto-pass"
              onClick={game.autoPass}
              title={
                game.autoPassPaused
                  ? 'Paused so you can respond — resumes by itself once the stack is clear. Click to turn it off.'
                  : game.autoPassing
                    ? 'Stop passing automatically'
                    : 'Pass automatically until my own turn comes round again'
              }
            >
              {/* Paused is still on: say so, or a button that reads "Stop
                  auto-pass" while the game waits on you looks like it broke. */}
              <StableLabel widest={['Auto-pass paused', 'Stop auto-pass', 'Auto-pass']}>
                {game.autoPassPaused ? 'Auto-pass paused' : game.autoPassing ? 'Stop auto-pass' : 'Auto-pass'}
              </StableLabel>
            </button>
          </>
        )}
      </div>
    )
  }

  const selectedAbilities = selectedSource
    ? (abilitiesBySource.get(selectedSource) ?? [])
    : []
  const selectedFaceUp = selectedSource ? faceUpBySource.get(selectedSource) : undefined
  const selectedUnlocks = selectedSource ? (unlockBySource.get(selectedSource) ?? []) : []
  const selectedLicidEnd = selectedSource ? licidEndBySource.get(selectedSource) : undefined
  const selectedPreparedCasts = selectedSource ? (preparedCastsBySource.get(selectedSource) ?? []) : []
  // A commander whose tile opened the menu (it has an ability that works from
  // the command zone) is still cast from it.
  const selectedCast =
    selectedSource !== null && view.objects[selectedSource]?.zone === 'command' && castByCard.has(selectedSource)
  const selectedCastOpts = selectedCast ? (playFacesByCard.get(selectedSource) ?? []) : []

  const renderPlayerPanel = (pid: PlayerId) => (
    <PlayerPanel
      key={pid}
      info={view.players[pid]}
      seatClass={seatClassOf(view.turnOrder, pid)}
      seatClassOf={(player) => seatClassOf(view.turnOrder, player)}
      isActive={view.activePlayer === pid}
      hasPriority={view.priority.holder === pid}
      waiting={
        // Someone else the game is waiting on. Your own turn to act is said
        // by the decision banner; this is for watching everyone else's.
        pid !== seat && !view.result.over && actingPlayer(view) === pid
          ? waitingLabel(view, pid, game.seats.find((s) => s.player === pid)?.isBot === true)
          : null
      }
      online={onlineOf(pid)}
      bot={game.seats.find((s) => s.player === pid)?.isBot === true}
      seats={game.seats}
      exileSize={exileOf(pid).length}
      wentFirst={pid === view.startingPlayer}
      isMonarch={view.monarch === pid}
      hasInitiative={view.initiative === pid}
      onOpenDungeon={() => setDungeonViewOf(pid)}
      emblemCount={view.emblems.filter((e) => e.owner === pid).length}
      curses={view.zones.battlefield.flatMap((id) => {
        const o = view.objects[id]
        return o !== undefined && o.attachedToPlayer === pid
          ? [
              {
                id,
                name: o.cardName,
                art: o.art,
                controllerClass: seatClassOf(view.turnOrder, o.controller),
                controllerLabel: playerLabel(o.controller, game.seats),
              },
            ]
          : []
      })}
      onOpenEmblems={() => {
        const cards = view.emblems.flatMap((e, i) => (e.owner === pid ? [emblemToVisible(e, i)] : []))
        const byId = new Map(cards.map((c) => [c.id, c]))
        setZoneView({
          title: `${playerLabel(pid, game.seats)}'s emblems`,
          ids: cards.map((c) => c.id),
          resolve: (id) => byId.get(id),
        })
      }}
      onOpenGraveyard={() =>
        openZone(`${playerLabel(pid, game.seats)}'s graveyard`, view.zones.graveyards[pid] ?? [])
      }
      onOpenExile={() => openZone(`${playerLabel(pid, game.seats)}'s exile`, exileOf(pid))}
      onOpenHand={
        pid === seat
          ? undefined
          : () => openZone(`${playerLabel(pid, game.seats)}'s hand`, view.zones.hands[pid] ?? [])
      }
      targetable={playerIsTargetable(pid)}
      selected={
        mode === 'proliferate' && proliferatePicks.some((t) => t.kind === 'player' && t.player === pid)
      }
      aimedBy={aim !== null && aim.players.has(pid) ? aim.by : null}
      onTargetClick={() => clickPlayerTarget(pid)}
    />
  )

  /** The mulligan keep/decide prompt as its own centered popup instead of an
   * inline banner at the bottom of the screen -- it's the one forced
   * decision that blocks the whole game for every player still deciding, so
   * it gets an attention-grabbing placement of its own rather than sharing
   * the hand-strip's `.controls` slot with every other forced decision. The
   * hand itself renders inside the popup (via `renderHand`, the same one
   * every other mode uses) rather than separately below it, so the whole
   * decision -- what's in your hand and whether to keep it -- lives in one
   * place instead of split across a banner and a strip. */
  /**
   * "How many of these?" for a compacted token stack — the same menu shape a
   * permanent's activated abilities get, hung off the same tile, because the
   * question is the same kind of question: this one tile can do more than one
   * thing and you have to say which.
   *
   * A stack is a single entry in the offer standing for `copies` permanents
   * (see the engine's `sacrifice` LegalAction), and the answer names it once
   * per token given up. Without this the tile could only be picked or not,
   * and a demand for three against a stack of nine had no answer the Confirm
   * button would ever accept.
   */
  const renderStackCountMenu = () => {
    if (stackMenu === null) return null
    // The same menu answers two questions: how many of a stack to sacrifice,
    // and how many of it to tap for a cost.
    const pick =
      mode === 'sacrifice' && sacrificeAction
        ? {
            verb: 'Sacrifice',
            count: sacrificeAction.count,
            of: sacrificeAction.copies?.[stackMenu] ?? 1,
            picks: sacrificePicks,
            set: (next: readonly ObjectId[]) => setSacrificePicks(next),
          }
        : mode === 'choose-permanents' && choosePermanentsAction
          ? {
              verb: 'Choose',
              count: choosePermanentsAction.max,
              of: choosePermanentsAction.copies?.[stackMenu] ?? 1,
              picks: permanentPicks,
              set: (next: readonly ObjectId[]) => setPermanentPicks(next),
            }
        : mode === 'choose-tap' && pendingTap
          ? {
              verb: 'Tap',
              // Crew has no count: every token on offer could be tapped.
              count:
                pendingTap.offer.totalPower !== undefined
                  ? allTapChoices(pendingTap.offer).length
                  : pendingTap.offer.count,
              of: pendingTap.offer.copies?.[stackMenu] ?? 1,
              picks: pendingTap.picks,
              set: (next: readonly ObjectId[]) =>
                setPendingTap((cur) => (cur === null ? cur : { ...cur, picks: next })),
            }
          : mode === 'choose-convoke' && pendingConvoke
            ? {
                verb: pendingConvoke.offer.improvise === true ? 'Improvise' : 'Convoke',
                count: pendingConvoke.offer.maxCreatures,
                of: pendingConvoke.offer.copies?.[stackMenu] ?? 1,
                picks: pendingConvoke.picks,
                set: (next: readonly ObjectId[]) =>
                  setPendingConvoke((cur) => (cur === null ? cur : { ...cur, picks: next })),
              }
            : mode === 'choose-waterbend' && pendingWaterbend
              ? {
                  verb: 'Waterbend',
                  count: pendingWaterbend.max,
                  of: pendingWaterbend.offer.copies?.[stackMenu] ?? 1,
                  picks: pendingWaterbend.picks,
                  set: (next: readonly ObjectId[]) =>
                    setPendingWaterbend((cur) => (cur === null ? cur : { ...cur, picks: next })),
                }
              : null
    if (pick === null) return null
    const taken = pick.picks.filter((x) => x === stackMenu).length
    // What this stack could be raised to: everything not already promised to
    // some *other* entry, capped at the stack's own size.
    const most = Math.min(pick.of, pick.count - (pick.picks.length - taken))
    const setTo = (n: number) => {
      pick.set([...pick.picks.filter((x) => x !== stackMenu), ...Array<ObjectId>(n).fill(stackMenu)])
      setStackMenu(null)
    }
    return (
      <AbilityMenu
        source={stackMenu}
        title={`${game.nameOf(stackMenu)} ×${pick.of}`}
        ariaLabel={`How many to ${pick.verb.toLowerCase()}`}
        items={Array.from({ length: most + 1 }, (_unused, n) => ({
          key: String(n),
          label: n === 0 ? 'None' : `${pick.verb} ${n}`,
          onSelect: () => setTo(n),
        }))}
        onClose={() => setStackMenu(null)}
      />
    )
  }

  /**
   * How many of a tile of attackers attack each defender: a row per defender
   * any of them may attack, each a count (`CountStepper`) and "All", over
   * the same assignments the bar's count rows set (`setAttackPairCount`).
   * Opened by clicking the tile in the attack declaration; Done, Escape or a
   * click elsewhere closes it, keeping what's set.
   */
  const renderAttackSplitMenu = () => {
    if (attackSplit === null || mode !== 'attackers' || !attackAction) return null
    const members = attackSplit.members.filter((m) => attackAction.eligible.includes(m))
    if (members.length === 0) return null
    const defenders = [...new Set(members.flatMap((m) => defendersFor(m)))]
    const rows = defenders.map((defender) => {
      const count = members.filter((m) => attackAssignments[m] === defender).length
      const free = members.filter(
        (m) => attackAssignments[m] === undefined && !attackPicks.includes(m) && defendersFor(m).includes(defender),
      ).length
      return { attackers: members, defender, count, max: count + free }
    })
    const attacking = rows.reduce((n, r) => n + r.count, 0)
    const set = (row: (typeof rows)[number], n: number) =>
      setAttackAssignments((cur) => setAttackPairCount(row, n, attackPicks, defendersFor, cur))
    return (
      <AbilityMenu
        source={attackSplit.anchor}
        title={`${game.nameOf(members[0])} ×${members.length} — ${attacking} attacking`}
        ariaLabel="How many attack each defender"
        items={[]}
        onClose={() => setAttackSplit(null)}
      >
        <div className="attack-split">
          {rows.map((row) => (
            <div key={row.defender} className="attack-split-row">
              <CountStepper
                label={`→ ${attackTargetLabel(row.defender)}`}
                count={row.count}
                max={row.max}
                onChange={(n) => set(row, n)}
              />
              <button type="button" disabled={row.count === row.max} onClick={() => set(row, row.max)}>
                All
              </button>
            </div>
          ))}
        </div>
        <button type="button" className="attack-split-done" onClick={() => setAttackSplit(null)}>
          Done
        </button>
      </AbilityMenu>
    )
  }

  /**
   * How many of the blockers on an attacking token stack share each of its
   * tokens (the offer's `attackerTokens`; the engine's `attackerMember`): 1,
   * the default, a token each; 2 pairs them, which a stack with menace needs;
   * and so on, the blockers going to tokens in the order they were assigned.
   * Opened by clicking the stack with no blocker of yours waiting.
   */
  const renderBlockSplitMenu = () => {
    if (blockSplit === null || mode !== 'blockers' || !blockAction) return null
    const tokens = blockAction.attackerTokens?.[blockSplit] ?? 1
    if (tokens <= 1) return null
    const blockers = Object.values(blockAssign).filter((a) => a === blockSplit).length
    const k = blockPerToken[blockSplit] ?? 1
    const blocked = blockers === 0 ? 0 : Math.ceil(blockers / k)
    const last = blockers % k
    return (
      <AbilityMenu
        source={blockSplit}
        title={`${game.nameOf(blockSplit)} ×${tokens} — ${blockers} blocking`}
        ariaLabel="How many blockers share each token"
        items={[]}
        onClose={() => setBlockSplit(null)}
      >
        <div className="attack-split">
          <div className="attack-split-row">
            <CountStepper
              label="Blockers per token"
              count={k}
              max={Math.max(1, blockers)}
              onChange={(n) => setBlockPerToken((cur) => ({ ...cur, [blockSplit]: Math.max(1, n) }))}
            />
            <span />
          </div>
        </div>
        <p className="block-split-summary">
          {blockers === 0
            ? 'Pick a creature of yours to block with, then click this stack.'
            : `${blockers} blocking ${blocked} token${blocked === 1 ? '' : 's'}, ${k} on each${
                last > 0 && blocked > 1 ? ` (${last} on the last)` : ''
              }.`}
        </p>
        <button type="button" className="attack-split-done" onClick={() => setBlockSplit(null)}>
          Done
        </button>
      </AbilityMenu>
    )
  }

  const renderMulliganModal = () => {
    if (mode !== 'mulligan' || !mulliganAction) return null
    return (
      <div className="mulligan-modal">
        <span>
          {mulliganAction.count === 0
            ? 'Keep your opening hand?'
            : `Mulligan #${mulliganAction.count} taken — keep this hand?`}
        </span>
        {renderHand()}
        <div className="mulligan-modal-actions">
          <button type="button" disabled={locked} onClick={() => confirmMulligan(true)}>
            Keep
          </button>
          <button type="button" disabled={locked} onClick={() => confirmMulligan(false)}>
            Mulligan
          </button>
        </div>
      </div>
    )
  }

  /** Wraps `renderHandAndControls` with the collapsed-peek tray behavior —
   * every mode except the mulligan popup (see `peekable`'s own comment
   * above, by the `mode` computation); a decision on the hand itself
   * (discard, put-on-bottom) holds it raised. A two-zone hitbox: a small
   * `.hand-trigger` hugging the bottom edge is what raises it, but the whole
   * (much larger) `.hand-strip` has to be left before it lowers again --
   * easier to leave up than to summon by accident. */
  const renderHandStrip = () => {
    return (
      <div
        // Empty in the mulligan (the popup holds the hand), and out of the
        // layout then: in flow, it took the board's height on top of the
        // band the board keeps for the tray.
        className={`hand-strip ${peekable ? 'peekable' : 'idle'} ${handRaised || handForcedOpen ? 'raised' : ''} ${
          handForcedOpen ? 'hand-decision' : ''
        }`}
        onMouseLeave={() => setHandRaised(false)}
      >
        {peekable ? (
          <div className="hand-trigger" onMouseEnter={() => setHandRaised(true)} />
        ) : null}
        <div
          className="hand-strip-inner"
          onMouseEnter={peekable ? () => setHandRaised(true) : undefined}
        >
          {renderHandAndControls()}
        </div>
      </div>
    )
  }

  /** The ability menu (for a selected permanent with 2+ activated
   * abilities), the priority/attack/block/etc. controls, and your own hand
   * — the interactive strip below the quadrant grid, shared by every player
   * count (2-4). */
  /** Your hand, fanned (see HAND_FAN_STEP_DEG/HAND_FAN_STEP_Y) -- always,
   * including the collapsed peek and the mulligan popup, not just while
   * actively raised/browsing. Shared between `renderHandAndControls` (every
   * mode except mulligan, which shows it inside its own popup instead --
   * see `renderMulliganModal`) so the hand only has one render path. */
  const renderHand = (layout: 'fan' | 'grid' = 'fan') => {
    const grid = layout === 'grid'
    // Only ever compresses the per-card step below the tuned default above
    // (never exceeds it), so an ordinary-sized hand renders identically to
    // before -- see HAND_FAN_MAX_ROT_DEG/HAND_FAN_MAX_LIFT_PX's comment.
    const maxFanOffset = (handIds.length - 1) / 2
    const fanStepDeg =
      maxFanOffset > 0
        ? Math.min(HAND_FAN_STEP_DEG, HAND_FAN_MAX_ROT_DEG / maxFanOffset)
        : HAND_FAN_STEP_DEG
    const fanStepY =
      maxFanOffset > 0
        ? Math.min(HAND_FAN_STEP_Y, HAND_FAN_MAX_LIFT_PX / maxFanOffset)
        : HAND_FAN_STEP_Y
    return (
    <div className="hand">
      <h3>
        {playerLabel(seat, game.seats)}'s hand ({handIds.length})
        {!grid && handIds.length > HAND_GRID_THRESHOLD ? (
          <button
            type="button"
            className="hand-grid-open"
            onClick={() => setHandGrid(true)}
            title="Show every card at full size — the fan gets too tight to pick from"
          >
            All cards
          </button>
        ) : null}
      </h3>
      <div className={grid ? 'hand-grid' : 'hand-cards'} ref={grid ? undefined : handRowRef}>
        {handIds.map((id, i) => {
          const obj = view.objects[id]
          if (!obj) return null
          const fanOffset = i - (handIds.length - 1) / 2
          const fanStyle: CSSProperties = {
            '--r': `${fanOffset * fanStepDeg}deg`,
            '--y': `${Math.abs(fanOffset) * fanStepY}px`,
            // Baseline stacking order, read via var(--z) in App.css so a
            // plain stylesheet :hover rule can still win over it (same
            // reason --r/--y are custom properties feeding a real `rotate`/
            // `translate` property instead of baking straight into an
            // inline transform -- see that comment below). Highest at the
            // center and falling off toward both edges, so the hand reads as
            // a fan opening outward from the middle: each card is overlapped
            // by its more-central neighbour and reveals its own outer edge,
            // symmetrically on both sides. Deliberately not plain DOM order
            // (where the last card would always win and the whole hand would
            // shingle one way), and deliberately not the reverse of this
            // either -- edges-in-front puts the outermost, most-rotated
            // cards on top of everything, which reads as the fan being in
            // front of itself rather than fanning out.
            '--z': Math.round((maxFanOffset - Math.abs(fanOffset)) * 10),
            // Never wraps to a second row and never shrinks the card
            // itself -- past a natural fit, cards overlap (a shrinking,
            // even negative, gap) instead. See HAND_CARD_GAP's comment.
            marginLeft: i === 0 ? 0 : `${handCardGap}px`,
          } as CSSProperties
          // The grid exists to undo exactly what the fan does, so it takes
          // none of it: no rotation, no lift, no stacking order and — the
          // one that matters — no negative margin. Every card gets its own
          // full width and is a full-size click target.
          const slotStyle: CSSProperties = grid ? {} : fanStyle
          let highlight = false
          let selected = false
          if (mode === 'discard') {
            highlight = discardAction?.from.includes(id) ?? false
            selected = discardPicks.includes(id)
          } else if (mode === 'put-on-bottom') {
            highlight = bottomAction?.from.includes(id) ?? false
            selected = bottomPicks.includes(id)
          } else if (mode === 'reveal-for-untapped') {
            highlight = revealChoiceAction?.options.includes(id) ?? false
            selected = revealPick === id
          } else if (mode === 'priority') {
            highlight = landByCard.has(id) || castByCard.has(id)
          }
          const suspend = mode === 'priority' ? suspendByCard.get(id) : undefined
          const foretell = mode === 'priority' ? foretellByCard.get(id) : undefined
          const plot = mode === 'priority' ? plotByCard.get(id) : undefined
          const cycle = mode === 'priority' ? cycleByCard.get(id) : undefined
          // Abilities that work from the hand (ninjutsu, channel): a button
          // each, as cycling's.
          const handAbilities = mode === 'priority' ? (abilitiesBySource.get(id) ?? []) : []
          const faceOpts =
            mode === 'priority' ? (playFacesByCard.get(id) ?? []) : []
          // More than one way to play this card: a multi-face card's sides,
          // or a kickable spell's kicked / unkicked casts (P8). An emerge
          // cast sacrifices a creature, so even alone it's a button that
          // names it — never a click on the card that sacrifices silently.
          const multiFace =
            faceOpts.length > 1 || faceOpts.some((a) => a.kind === 'cast-spell' && a.emergeSacrifice !== undefined)
          return (
            <div key={id} className="hand-card" data-obj-id={id} style={slotStyle}>
              <CardTile
                obj={obj}
                highlight={highlight || Boolean(suspend) || Boolean(foretell) || Boolean(plot) || Boolean(cycle) || handAbilities.length > 0}
                selected={selected}
                layout="art-first"
                onClick={() => clickHandCard(id)}
              />
              {/* Beside the card once it has grown under the pointer, on the
                  side facing the middle of the hand (App.css): a double-faced
                  card's other face, then the keyword tips. */}
              <OtherFace
                obj={obj}
                layout="art-first"
                className={`hand-other-face${fanOffset > 0 ? ' to-left' : ''}`}
              />
              <KeywordTips obj={obj} className={`hand-kw-tips${fanOffset > 0 ? ' to-left' : ''}`} />
              {multiFace
                ? faceOpts.map((a, i) => (
                    <button key={i} type="button" onClick={() => playFace(a)}>
                      {a.kind === 'play-land' ? 'Play' : 'Cast'} {a.cardName}
                      {a.kind === 'cast-spell' && a.kicked ? (
                        <>
                          {' '}({a.kickerKeyword ?? 'kicked'}
                          {a.kickerCost ? <> <Symbols text={a.kickerCost} /></> : null})
                        </>
                      ) : null}
                      {a.kind === 'cast-spell' && a.overload ? (
                        <> ({a.overloadKeyword ?? 'overload'} <Symbols text={a.overloadCost ?? ''} />)</>
                      ) : null}
                      {a.kind === 'cast-spell' && a.free ? ' (free)' : ''}
                      {a.kind === 'cast-spell' && a.xCost?.minX !== undefined && a.xCost.minX === a.xCost.maxX
                        ? ` (X=${a.xCost.maxX})`
                        : ''}
                      {a.kind === 'cast-spell' && a.via === 'warp' ? ' (warp)' : ''}
                      {a.kind === 'cast-spell' && a.via === 'face-down' ? (
                        <> face down (a 2/2 for <Symbols text="{3}" />)</>
                      ) : null}
                      {a.kind === 'cast-spell' && a.via === 'blitz' ? ' (blitz)' : ''}
                      {a.kind === 'cast-spell' && a.via === 'dash' ? ' (dash)' : ''}
                      {a.kind === 'cast-spell' && a.via === 'impending' ? ' (impending)' : ''}
                      {a.kind === 'cast-spell' && a.via === 'freerunning' ? ' (freerunning)' : ''}
                      {a.kind === 'cast-spell' && a.offspring ? (
                        <> (offspring <Symbols text={a.offspringCost ?? ''} />)</>
                      ) : null}
                      {a.kind === 'cast-spell' && a.evoke ? (
                        a.altCostText !== undefined ? (
                          ` (evoke: ${a.altCostText})`
                        ) : (
                          <> (evoke <Symbols text={a.evokeCost ?? ''} />)</>
                        )
                      ) : null}
                      {a.kind === 'cast-spell' && a.prototype ? (
                        <> (prototype <Symbols text={a.prototypeCost ?? ''} />)</>
                      ) : null}
                      {a.kind === 'cast-spell' && a.altCost ? ` (${a.altCostText ?? 'alternative cost'})` : ''}
                      {a.kind === 'cast-spell' && a.via === 'harmonize'
                        ? a.harmonizeTap
                          ? ` (harmonize, tapping ${a.harmonizeTap.cardName}: −${a.harmonizeTap.power})`
                          : ' (harmonize)'
                        : ''}
                      {a.kind === 'cast-spell' && a.via === 'sneak' && a.sneakReturn
                        ? ` (sneak, returning ${a.sneakReturn.cardName})`
                        : ''}
                      {a.kind === 'cast-spell' && a.via === 'web-slinging' && a.webSlingingReturn
                        ? ` (web-slinging, returning ${a.webSlingingReturn.cardName})`
                        : ''}
                      {a.kind === 'cast-spell' && a.via === 'emerge' && a.emergeSacrifice
                        ? ` (emerge, sacrificing ${a.emergeSacrifice.cardName}: −${a.emergeSacrifice.manaValue})`
                        : ''}
                      {a.kind === 'cast-spell' && a.costOptionText ? (
                        <> (<Symbols text={a.costOptionText} />)</>
                      ) : null}
                      {a.kind === 'cast-spell'
                        ? a.splice?.map((s) => (
                            <span key={s.object}> (splicing {s.cardName} <Symbols text={s.cost} />)</span>
                          ))
                        : null}
                    </button>
                  ))
                : null}
              {suspend ? (
                <button
                  type="button"
                  onClick={() => game.dispatch({ type: 'suspend', player: seat, card: id })}
                >
                  Suspend <Symbols text={suspend.cost} />
                </button>
              ) : null}
              {foretell ? (
                <button
                  type="button"
                  onClick={() => game.dispatch({ type: 'foretell', player: seat, card: id })}
                >
                  Foretell
                </button>
              ) : null}
              {plot ? (
                <button
                  type="button"
                  onClick={() => game.dispatch({ type: 'plot', player: seat, card: id })}
                >
                  Plot <Symbols text={plot.cost} />
                </button>
              ) : null}
              {cycle ? (
                <button
                  type="button"
                  onClick={() => game.dispatch({ type: 'cycle', player: seat, card: id })}
                >
                  Cycle <Symbols text={cycle.cost} />
                </button>
              ) : null}
              {handAbilities.map((ab) => (
                <button key={`ab-${ab.abilityIndex}`} type="button" onClick={() => clickAbility(ab)}>
                  <Symbols text={handAbilityLabel(ab.text)} />
                </button>
              ))}
            </div>
          )
        })}
        {handIds.length === 0 ? <span className="muted">empty</span> : null}
      </div>
    </div>
    )
  }

  const renderHandAndControls = () => (
    <>
      {/* An activated ability's menu used to dock here, a whole screen away
          from the permanent it belonged to; it's a popover beside the tile
          now (see `AbilityMenu`, rendered near the other floating overlays
          below).

          priority mode's controls (Pass/Pass Turn/Auto-pass/Skip-mana) render
          in a fixed bottom-right bar instead (see .priority-actions below),
          mulligan's Keep/Mulligan choice (with the hand itself) renders as
          its own centered popup (see .mulligan-modal below), and every other
          mode floats its controls in a fixed .decision-banner (see the return
          below) -- docking them here would force this whole strip out of its
          peekable/fixed tray and into normal layout flow, which used to steal
          height from .quadrant-grid (and the board's own mini tiles) every
          time one of those decisions came up. Discard and put-on-bottom were
          the last to dock here, and squashed the board while they were up. */}

      {/* mulligan shows the hand inside its own popup instead (see
          renderMulliganModal) -- rendering it here too would show it twice */}
      {mode === 'mulligan' ? null : renderHand()}
    </>
  )

  // Every player count uses the same quadrant-cell frame (one bordered,
  // rounded-rect box per seat: a head with that seat's PlayerPanel, a body
  // with their board + command/library rail, internally scrolling on its
  // own) -- there's no separate "classic" layout for 2 players anymore. 1
  // opponent (2-player) is a single-column, 2-row grid (opponent on top, you
  // on the bottom); 2-3 opponents (3-4 players) is the 2x2 grid, per-cell
  // order [opponents[0], opponents[1], you, opponents[2]] — top-left,
  // top-right, bottom-left (always you), bottom-right, with a 3-player game
  // simply leaving the 4th cell blank.
  const quadrantCells: readonly PlayerId[] =
    opponents.length === 1
      ? [opponents[0], seat]
      : [opponents[0], opponents[1], seat, opponents[2]].filter(
          (pid): pid is PlayerId => pid !== undefined,
        )
  // Mirrors .quadrant-grid / .quadrant-grid.two-player's grid-template-columns
  // in App.css — the only thing the cell order needs it for is telling a
  // top-row cell from a bottom-row one.
  const quadrantColumns = opponents.length === 1 ? 1 : 2

  return (
    <div className="player-col" ref={playerColRef}>
      {/* The band under the board the hand's tray and the priority controls
          are drawn over. Reserved in the mulligan too, where neither is
          drawn: the board was the band's height taller behind the mulligan
          popup and shrank as the game began, every library column with it
          (found 2026-10-10). */}
      <main className="table bottom-band">
        <div className={`quadrant-grid ${opponents.length === 1 ? 'two-player' : ''}`}>
          {quadrantCells.map((pid, i) => (
            <div
              className={`quadrant-cell ${seatClassOf(view.turnOrder, pid)} ${
                pid === seat ? 'self' : ''
              } ${
                view.activePlayer === pid ? 'active-turn' : ''
              } ${view.players[pid]?.hasLost ? 'eliminated' : ''}`}
              key={pid}
            >
              <div className="quadrant-head">{renderPlayerPanel(pid)}</div>
              <div className="quadrant-body">
                <div className="board-with-sidezone">
                  {/* a cell past the first row sits along the bottom edge of
                      the table, so its lands go under its creatures — see
                      renderBoard. The grid is one column for 2 players and
                      two for 3-4, so that's just the cell's index against
                      the column count. */}
                  {renderBoard(pid, pid !== seat, i >= quadrantColumns)}
                  {renderSideZone(pid)}
                </div>
              </div>
            </div>
          ))}
          {/* a 3-player game leaves the 4th cell blank rather than switching
              grid shapes */}
          {opponents.length === 2 ? <div className="quadrant-blank" /> : null}
        </div>
      </main>

      {renderHandStrip()}

      {mode === 'priority' ? (
        <div className="priority-actions" data-tour="game-priority">{controls}</div>
      ) : peekable ? (
        <div className="decision-banner" data-tour="game-decision-banner">{controls}</div>
      ) : null}

      {/* The selected permanent's activated abilities, beside the permanent
          itself rather than in a bar at the bottom of the screen. Picking
          one hands off to `clickAbility` (targeting, an {X} prompt, a
          sacrifice choice), so the menu closes either way. */}
      {selectedSource !== null &&
      (selectedAbilities.length > 0 ||
        selectedCastOpts.length > 1 ||
        selectedFaceUp !== undefined ||
        selectedUnlocks.length > 0 ||
        selectedLicidEnd !== undefined ||
        selectedPreparedCasts.length > 0) ? (
        <AbilityMenu
          source={selectedSource}
          title={game.nameOf(selectedSource)}
          items={[
            // More than one way to cast it: an item each, named as a
            // graveyard card's ways are (`graveyardVariantLabel`).
            ...(selectedCastOpts.length > 1
              ? selectedCastOpts.map((a, i) => {
                  const variant = graveyardVariantLabel(a, view, false)
                  const space = variant.indexOf(' ')
                  return {
                    key: `cast:${i}`,
                    label: `Cast ${a.cardName}${space < 0 ? '' : ` (${variant.slice(space + 1)})`}`,
                    onSelect: () => {
                      setSelectedSource(null)
                      playFace(a)
                    },
                  }
                })
              : selectedCast
              ? [
                  {
                    key: 'cast',
                    label: `Cast ${game.nameOf(selectedSource)}`,
                    onSelect: () => {
                      setSelectedSource(null)
                      clickHandCard(selectedSource)
                    },
                  },
                ]
              : []),
            // Its prepare spell's copy (rule 722.3c), cast as a hand card is
            // (`playFace`): the same targeting, {X} and payment flow.
            ...selectedPreparedCasts.slice(0, 1).map((c) => ({
              key: `prepared:${c.card}`,
              label: `Cast ${c.cardName} (prepared)`,
              onSelect: () => {
                setSelectedSource(null)
                playFace(c)
              },
            })),
            ...selectedUnlocks.map((u) => ({
              key: `unlock:${u.door}`,
              label: `Unlock ${u.doorName} — pay ${u.cost}`,
              onSelect: () => {
                setSelectedSource(null)
                game.dispatch({ type: 'unlock-door', player: seat, permanent: u.permanent, door: u.door })
              },
            })),
            ...(selectedLicidEnd !== undefined
              ? [
                  {
                    key: 'end-licid-effect',
                    label: `End the effect — pay ${selectedLicidEnd.cost}`,
                    onSelect: () => {
                      setSelectedSource(null)
                      game.dispatch({ type: 'end-licid-effect', player: seat, permanent: selectedLicidEnd.permanent })
                    },
                  },
                ]
              : []),
            ...(selectedFaceUp ?? []).map((up) => ({
              key: `turn-face-up:${up.morph ?? 'cost'}`,
              label: `Turn face up — ${up.cardName}, ${up.morph !== undefined ? `${up.morph} ` : ''}${up.cost}`,
              onSelect: () => {
                setSelectedSource(null)
                game.dispatch({
                  type: 'turn-face-up',
                  player: seat,
                  permanent: up.permanent,
                  ...(up.morph !== undefined ? { morph: true } : {}),
                })
              },
            })),
            ...selectedAbilities.map((ab) => ({
            // An "add one mana of any color" ability is listed once per
            // colour, all sharing an index -- the colours are what tell them
            // apart, so they belong in the key too.
            // So is a modal ability, once per mode.
            key: `${ab.abilityIndex}:${ab.manaColors?.join('') ?? ''}:${ab.modes?.join(',') ?? ''}`,
            label: ab.text || `Ability ${ab.abilityIndex + 1}`,
            onSelect: () => {
              setSelectedSource(null)
              clickAbility(ab)
            },
          })),
          ]}
          onClose={() => setSelectedSource(null)}
        />
      ) : null}

      {renderStackCountMenu()}
      {renderAttackSplitMenu()}
      {renderBlockSplitMenu()}

      {renderMulliganModal()}
      {/* moved here (from GameScreen, a sibling of Table) so it can reuse
          Table's own targeting state/handlers -- a spell on the stack is
          just another legal-target object (e.g. a counterspell targeting
          "spell"), the same architecture tileFor already uses for
          battlefield permanents. */}
      {stackShowsSomething(view, answered) ? (
        <Stack
          view={view}
          answered={answered}
          targetSlot={
            // A source of damage may be a spell on the stack (rule 609.7a —
            // Circle of Protection): it's picked there, as a target is.
            mode === 'choose-permanents' && choosePermanentsAction
              ? choosePermanentsAction.eligible.map((object) => ({ kind: 'object' as const, object }))
              : targetSlot
          }
          pickedIds={mode === 'choose-permanents' ? new Set<string>(permanentPicks) : pickedObjKeys}
          onTargetClick={(id) => clickPermanent([id])}
          pickSources={mode === 'choose-permanents'}
          aimed={aim}
          onFocusEntry={setStackFocus}
          seats={game.seats}
          previousStack={previousView?.zones.stack ?? null}
        />
      ) : null}
      {/* What points at what: the aimed stack entry's targets (or what's
          resolving's, as it does), attackers, blockers. Inside Table so it
          re-measures against each board. */}
      <ArrowLayer view={view} previousView={previousView} aimId={aimId} resolve={resolve} />

      {/* The whole hand at full size, for a hand too big to pick out of the
          fan. Deliberately the *same* card renderer the fan uses, so every
          action a card has there — cast, play, a second face, Foretell,
          Suspend, Cycle — comes along unchanged; only the layout differs. */}
      {handGrid ? (
        <div
          className="hand-grid-overlay"
          role="dialog"
          aria-label="Your hand"
          onClick={(e) => {
            // Click the backdrop to close, but not a click that landed on a
            // card: playing one from in here shouldn't also dismiss it.
            if (e.target === e.currentTarget) setHandGrid(false)
          }}
        >
          <div className="hand-grid-box">
            <div className="hand-grid-head">
              <button type="button" onClick={() => setHandGrid(false)}>
                Close
              </button>
            </div>
            {renderHand('grid')}
          </div>
        </div>
      ) : null}

      {zoneView ? (
        <ZoneViewer
          title={zoneView.title}
          ids={zoneView.ids}
          resolve={zoneView.resolve ?? ((id) => view.objects[id])}
          onClose={() => setZoneView(null)}
          castable={{
            // Flashback/escape/… casts from the graveyard (Phase 6), plus a
            // land playable from the graveyard (Ramunap Excavator — P2B), and
            // an ability that works from here (a graveyard ability, or one of
            // a suspended card's — Greater Gargadon), which opens its menu.
            ids: zoneView.ids.filter(
              (id) => castByCard.get(id)?.via !== undefined || landByCard.has(id) || abilitiesBySource.has(id),
            ),
            label: (id) => {
              const c = castByCard.get(id)
              if (c?.via === undefined && !landByCard.has(id) && abilitiesBySource.has(id)) return 'Activate'
              // Most routes read fine as their own name ("flashback", "escape");
              // a permission granted by another permanent doesn't.
              if (c?.via === 'graveyard-permission') return 'Cast from graveyard'
              if (c?.via) return `Cast (${c.via})`
              if (landByCard.has(id)) return 'Play land'
              return 'Cast'
            },
            onCast: (id) => {
              const land = landByCard.get(id)
              const c = castByCard.get(id)
              setZoneView(null)
              if (land) playFace(land)
              else if (c?.via !== undefined) beginCast(c)
              else if (abilitiesBySource.has(id)) setSelectedSource(id)
              else if (c) beginCast(c)
            },
            // Several ways to play one card from here: which Muldrotha type
            // it spends, which permission pays, which face.
            variants: (id) => {
              const ways = playFacesByCard.get(id) ?? []
              // Name the granting permanent only when two of them grant this
              // card — not when the other way is its own flashback or escape.
              const sources = new Set(ways.flatMap((a) => (a.graveyardGrant ? [a.graveyardGrant.source] : [])))
              return ways.map((a) => ({
                label: graveyardVariantLabel(a, view, sources.size > 1),
                onChoose: () => {
                  setZoneView(null)
                  playFace(a)
                },
              }))
            },
          }}
        />
      ) : null}

      {mode === 'cast-now' && castNowAction && castNowPicking && castNowPick === null ? (
        <ZoneViewer
          title={`${game.nameOf(castNowAction.source)} — you may cast ${
            castNowAction.cards.length === 1 ? 'this spell' : 'one of these'
          }${castNowAction.free ? ' without paying its mana cost' : ''}`}
          ids={castNowAction.looked ?? castNowAction.cards}
          resolve={(id) => view.objects[id]}
          selection={{
            min: 0,
            max: 1,
            eligible: castNowAction.cards,
            noneLabel: "Don't cast",
            onConfirm: (chosen) => {
              const card = chosen[0]
              if (card === undefined) {
                game.dispatch({ type: 'cast-now', player: seat, cast: null })
                return
              }
              // One way to cast it goes straight into the cast steps; more
              // (kicked or not, a face) are offered as buttons.
              const ways = castNowAction.casts.filter((c) => c.card === card)
              const lands = (castNowAction.lands ?? []).filter((l) => l.card === card)
              if (ways.length === 1 && lands.length === 0) beginCast(ways[0])
              else setCastNowPick(card)
            },
          }}
          collapsed={decisionCollapsed}
          onCollapse={() => setDecisionCollapsed(true)}
        />
      ) : null}

      {mode === 'separate-piles' && separatePilesAction && !pilesOnBoard ? (
        <PileViewer
          title={`${view.decisionSource?.cardName ?? 'Piles'} — separate into two piles: ${
            separatePilesAction.chooser === seat ? 'you choose' : `${playerLabel(separatePilesAction.chooser, game.seats)} chooses`
          } one, and ${pileFatesText(separatePilesAction.fates)}`}
          resolve={(id) => view.objects[id]}
          labels={pileLabels}
          separate={{
            objects: separatePilesAction.objects,
            onConfirm: (piles) => game.dispatch({ type: 'separate-piles', player: seat, piles: piles.map((p) => [...p]) }),
          }}
          collapsed={decisionCollapsed}
          onCollapse={() => setDecisionCollapsed(true)}
        />
      ) : null}

      {mode === 'choose-pile' && choosePileAction && !pilesOnBoard ? (
        <PileViewer
          title={`${view.decisionSource?.cardName ?? 'Piles'} — ${playerLabel(choosePileAction.separator, game.seats)} separated these: choose a pile; ${pileFatesText(choosePileAction.fates)}`}
          resolve={(id) => view.objects[id]}
          labels={pileLabels}
          choose={{
            piles: choosePileAction.piles,
            onChoose: (pile) => game.dispatch({ type: 'choose-pile', player: seat, pile }),
          }}
          collapsed={decisionCollapsed}
          onCollapse={() => setDecisionCollapsed(true)}
        />
      ) : null}

      {mode === 'choose-from-zone' && zoneChoiceAction ? (
        <ZoneViewer
          title={zoneChoiceTitle(zoneChoiceAction, (p) => playerLabel(p, game.seats))}
          ids={zoneChoiceAction.ids}
          resolve={(id) => view.objects[id]}
          selection={{
            min: zoneChoiceAction.min,
            max: zoneChoiceAction.max,
            eligible: zoneChoiceAction.eligible,
            onConfirm: confirmZoneChoice,
            // An optional behold (Theorist's Sanctum): declining it isn't "putting" anything.
            ...(zoneChoiceAction.behold === true ? { noneLabel: "Don't behold" } : {}),
            ...(zoneChoiceAction.destination === 'reveal' ? { noneLabel: 'Reveal none' } : {}),
            ...(zoneChoiceAction.openingHand === true && zoneChoiceAction.destination !== 'reveal' ? { noneLabel: 'Keep them in hand' } : {}),
            // A look alone (Glasses of Urza): closing it is the answer.
            ...(zoneChoiceAction.max === 0 ? { noneLabel: 'Done' } : {}),
            ...(zoneChoiceAction.together
              ? { fits: (picked: readonly ObjectId[]) => fitsTogether(zoneChoiceAction.together!, picked) }
              : {}),
            ...(zoneChoiceAction.destination === 'library-top' || zoneChoiceAction.destination === 'library-bottom'
              ? { ordered: true }
              : {}),
          }}
          collapsed={decisionCollapsed}
          onCollapse={() => setDecisionCollapsed(true)}
        />
      ) : null}

      {mode === 'targeting' && activeTargeting && zoneTargetIds.length > 0 ? (
        <ZoneViewer
          // One popup per slot, so a pick made for the last one doesn't
          // carry over.
          key={zoneTargetKey ?? ''}
          title={`${game.nameOf(activeTargeting.source)} — target ${describeTargetSpec(currentSpec(activeTargeting) ?? 'card')}`}
          ids={zoneTargetIds}
          resolve={(id) => view.objects[id]}
          selection={
            inTargetGroup(activeTargeting)
              ? {
                  // An "any number of" group: every member at once, up to
                  // its most ("up to three target creature cards").
                  min: 0,
                  max: Math.min(
                    zoneTargetIds.length,
                    groupBounds(activeTargeting.specs[anyNumberSlot(activeTargeting.specs)] ?? 'card').max -
                      (activeTargeting.picked.length - anyNumberSlot(activeTargeting.specs)),
                  ),
                  eligible: zoneTargetIds,
                  noneLabel: 'Choose none',
                  onConfirm: (chosen) =>
                    pickTargetGroup(chosen.map((object) => ({ kind: 'object', object }))),
                  // "With total power 10 or less" (Reunion of the House),
                  // "total mana value 3 or less" (Patch Up): Confirm waits
                  // until the picks obey it.
                  fits: (chosen: readonly ObjectId[]) =>
                    !groupPowerExceeded(
                      activeTargeting.specs,
                      [...activeTargeting.picked, ...chosen.map((object) => ({ kind: 'object' as const, object }))],
                      activeTargeting.facts,
                    ),
                  ...(activeTargeting.kind === 'choose-targets'
                    ? {}
                    : { onCancel: () => setTargeting(null) }),
                }
              : {
            min:
              isOptionalSpec(currentSpec(activeTargeting) ?? 'creature') &&
              maySkipSlot(activeTargeting)
                ? 0
                : 1,
            max: 1,
            eligible: zoneTargetIds,
            noneLabel: 'Skip',
            onConfirm: (chosen) =>
              pickTarget(chosen[0] === undefined ? null : { kind: 'object', object: chosen[0] }),
            ...(activeTargeting.kind === 'choose-targets'
              ? {}
              : { onCancel: () => setTargeting(null) }),
          }}
          collapsed={zoneTargetCollapsed}
          onCollapse={() => setZoneTargetHidden(zoneTargetKey)}
        />
      ) : null}

      {mode === 'choose-escape-exile' && pendingEscape ? (
        <ZoneViewer
          title={`Exile ${pendingEscape.offer.count} other card${
            pendingEscape.offer.count === 1 ? '' : 's'
          } to ${pendingEscape.cast.via === 'escape' ? 'escape' : 'cast'} ${pendingEscape.cast.cardName}`}
          ids={pendingEscape.offer.choices}
          resolve={(id) => view.objects[id]}
          selection={{
            min: pendingEscape.offer.count,
            max: pendingEscape.offer.count,
            eligible: pendingEscape.offer.choices,
            onConfirm: confirmEscapeExile,
            // Nothing is committed yet: backing out just drops the cast.
            onCancel: () => setPendingEscape(null),
          }}
        />
      ) : null}

      {mode === 'choose-delve' && pendingDelve ? (
        <ZoneViewer
          title={`Delve ${pendingDelve.cast.cardName}: exile up to ${pendingDelve.offer.maxCards}${
            pendingDelve.offer.minCards > 0 ? ` (at least ${pendingDelve.offer.minCards})` : ''
          }, each paying one generic mana`}
          ids={pendingDelve.offer.choices}
          resolve={(id) => view.objects[id]}
          selection={{
            min: pendingDelve.offer.minCards,
            max: pendingDelve.offer.maxCards,
            eligible: pendingDelve.offer.choices,
            onConfirm: confirmDelve,
            // Nothing exiled: mana pays it all.
            noneLabel: 'Exile none',
            onCancel: () => setPendingDelve(null),
          }}
        />
      ) : null}

      {mode === 'venture' && ventureAction ? (
        ventureAction.dungeons !== undefined ? (
          <DungeonViewer
            kind="dungeon"
            title="Venture into the dungeon — choose a dungeon"
            maps={ventureAction.maps}
            onPick={(dungeon) => game.dispatch({ type: 'venture', player: seat, dungeon } as Action)}
            collapsed={decisionCollapsed}
            onCollapse={() => setDecisionCollapsed(true)}
          />
        ) : ventureAction.maps[0] !== undefined ? (
          <DungeonViewer
            kind="room"
            title={`Venture into ${ventureAction.maps[0].name} — choose the next room`}
            map={ventureAction.maps[0]}
            marker={ventureAction.from ?? 0}
            rooms={ventureAction.rooms ?? []}
            onPick={(room) => game.dispatch({ type: 'venture', player: seat, room } as Action)}
            collapsed={decisionCollapsed}
            onCollapse={() => setDecisionCollapsed(true)}
          />
        ) : null
      ) : null}

      {dungeonViewOf !== null ? (
        <DungeonViewer
          kind="view"
          title={`${playerLabel(dungeonViewOf, game.seats)}'s dungeon${
            view.players[dungeonViewOf]?.dungeon ? ` — ${view.players[dungeonViewOf]?.dungeon?.name}` : ''
          }`}
          map={view.players[dungeonViewOf]?.dungeon?.map ?? null}
          marker={view.players[dungeonViewOf]?.dungeon?.room ?? null}
          completed={view.players[dungeonViewOf]?.completedDungeons ?? []}
          onClose={() => setDungeonViewOf(null)}
        />
      ) : null}

      {mode === 'choose-creature-type' && creatureTypeChoiceAction?.catalog ? (
        <CreatureTypePicker
          // Remount per decision, so a previous search doesn't carry over.
          key={creatureTypeChoiceAction.source}
          sourceName={game.nameOf(creatureTypeChoiceAction.source)}
          options={creatureTypeChoiceAction.options}
          suggested={creatureTypeChoiceAction.suggested}
          onPick={(creatureType) =>
            game.dispatch({ type: 'choose-creature-type', player: seat, creatureType })
          }
          collapsed={decisionCollapsed}
          onCollapse={() => setDecisionCollapsed(true)}
        />
      ) : null}

      {mode === 'choose-card-name' && cardNameChoiceAction ? (
        <CreatureTypePicker
          // Remount per decision, so a previous search doesn't carry over.
          key={cardNameChoiceAction.source}
          sourceName={game.nameOf(cardNameChoiceAction.source)}
          options={cardNameChoiceAction.options}
          suggested={cardNameChoiceAction.suggested}
          noun={{ one: cardNameChoiceAction.label, many: 'card names' }}
          suggestedLabel="Suggested"
          seen={
            cardNameChoiceAction.looked !== undefined
              ? {
                  label: 'In the hand you looked at',
                  names: cardNameChoiceAction.looked.map((id) => game.nameOf(id)),
                }
              : undefined
          }
          maxShown={300}
          onPick={(name) => game.dispatch({ type: 'choose-card-name', player: seat, name })}
          collapsed={decisionCollapsed}
          onCollapse={() => setDecisionCollapsed(true)}
        />
      ) : null}

      {mode === 'scry' && scryAction ? (
        <ZoneViewer
          title={
            scryAction.mode === 'surveil'
              ? 'Surveil — pick cards to put in your graveyard'
              : 'Scry — pick cards to put on the bottom'
          }
          ids={scryAction.cards}
          resolve={(id) => view.objects[id]}
          selection={{
            min: 0,
            max: scryAction.cards.length,
            eligible: scryAction.cards,
            onConfirm: confirmScry,
          }}
          collapsed={decisionCollapsed}
          onCollapse={() => setDecisionCollapsed(true)}
        />
      ) : null}
    </div>
  )
}
