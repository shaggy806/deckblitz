/**
 * The effect layer: a small declarative vocabulary that the engine interprets,
 * plus the `ResolutionContext` API that both declarative effects and imperative
 * `resolve` scripts (the escape hatch) call into.
 *
 * The engine ({@link Game}) supplies the concrete {@link EffectApi} implementation
 * — these functions just describe *what* to do. A `target` field is an index
 * into the spell's or ability's chosen targets, or the literal `"source"`.
 */

import type { ActivatedAbility, TriggeredAbility, TriggerSpec } from "./abilities.js";
import type {
  AffectSpec,
  CardType,
  CombatRestriction,
  Keyword,
  StaticAbility,
  StaticCondition,
  Supertype,
  CountersPutSpec,
  TurnStat,
} from "./cards.js";
import type { AggregateSpec, CardFilter, ShareReference, SharedTypes } from "./filter.js";
import type { CardNameAim, CardNameFilter } from "./card-names.js";
import { manaOriginMatches, type Color, type ManaFromSpec, type ManaOrigin, type ManaSpendPurpose, type ManaType, type SpendAs } from "./mana.js";
import type { ObjectId, PlayerId } from "./primitives.js";
import { EVERY_CREATURE_TYPE, EVERY_LAND_TYPE, isCreatureType, isLandType } from "./subtypes.js";
import { sameVoteChoice } from "./events.js";
import type { RandomPick, Vote, VoteChoice } from "./events.js";
import type { ThisWayEntry } from "./this-way.js";
import { textWordKind, type TextChange } from "./text-change.js";
import type {
  AwaitingDecision,
  DelayedTriggerTiming,
  EnterAttachHost,
  FaceDownAs,
  LeaveDestination,
  HeldPlayerCounter,
  PlayerCounterKind,
  CombatChoice,
  PlayerEffect,
  SpellGrantThisTurn,
  SpellSnapshot,
  TurnHistoryKind,
  TurnHistoryOrigin,
  ZoneType,
} from "./state.js";
import type { ResolvedTargets, TargetRef, TargetSpec } from "./target.js";

/** `"trigger-object"` reads `ResolutionContext.triggerObject` (needed-cards
 * P15 — Exalted's "that creature gets +1/+1", the lone attacker rather than
 * a target or the ability's own source). `"attached"` is the permanent the
 * effect's source — an Aura, Equipment or Fortification — is attached to as
 * this resolves: "enchanted creature", "equipped creature". With the source
 * gone from the battlefield, the permanent it was last attached to, if that
 * one is still there as the same object (the rulings of Starlit Mantle and
 * Wings of Hubris; rule 400.7); nothing once the host has left or the source
 * was attached to nothing. Not a target. `"chosen"` is "the chosen
 * creature": the permanent chosen as the source entered
 * (`CardDefinition.choosePermanentOnEnter` — rule 607.2d), read as the source
 * last existed if it has left; nothing once the chosen one has left the
 * battlefield (rule 400.7). Not a target. `"granter"` is the permanent
 * whose static granted this ability to its source — the Equipment or Aura
 * named in "Equipped creature has '{1}, {T}: Tap target creature. Return
 * Trusty Boomerang to its owner's hand'" (rule 201.5a: that name means only
 * the granting object), fixed as the ability was activated or triggered
 * (`LastKnownRefs.granter`). Acted on only while it's still that object on
 * the battlefield; read (its counters, its power) as it last existed there
 * once it has left (608.2h). Nothing on an ability no static granted. Not a
 * target. `"trigger-recipient"` is what the triggering event was aimed at
 * (`LastKnownRefs.recipient`): the permanent or player a `deals-damage`
 * trigger's damage was dealt to ("whenever this creature deals combat damage
 * to a creature, put a -1/-1 counter on **that creature**"), the player or
 * planeswalker an attacker is attacking. A delayed trigger such an ability
 * makes carries it ("destroy that creature at end of combat", 603.7c). Acted
 * on only while it's still the same permanent (rule 400.7); read as it last
 * existed once it has left (608.2h). Nothing on a trigger whose event has no
 * recipient. Not a target. `"tapped"` is the one permanent tapped to pay the
 * spell's or ability's cost (`LastKnownRefs.tapped`): "put a +1/+1 counter on
 * the creature tapped to pay this spell's additional cost" (Swallow Whole),
 * still the same one on a copy. Acted on only while it's still that permanent
 * (rule 400.7). Nothing when no one permanent was tapped. Not a target. */
export type EffectTargetRef = number | "source" | "trigger-object" | "attached" | "chosen" | "granter" | "trigger-recipient" | "tapped";
/**
 * What a card put onto the battlefield "attached to" something enters
 * attached to — an effect's `attachedTo`:
 *
 * - an {@link EffectTargetRef}: the permanent it names — a target slot (or a
 *   **player** in that slot: Bitterheart Witch's "a Curse card … attached to
 *   target player", rule 303.4), the source, the trigger object, or what the
 *   source is attached to ("attached to enchanted creature" — Mantle of the
 *   Ancients);
 * - `{ among }`: a permanent matching this filter, read from the side of the
 *   player it enters under, chosen **as it enters** rather than targeted —
 *   One Last Job's "return target Aura or Equipment card from your graveyard
 *   to the battlefield attached to a creature you control", Nomad
 *   Mythmaker's. An Aura's choice is the one rule 303.4f has its controller
 *   make, limited to these (none it can enchant, and it stays where it is —
 *   303.4g); an Equipment's is among those it could equip (none, and it
 *   enters unattached — 301.5e).
 *
 * See {@link EnterAttachHost} for what happens when it can't be attached.
 */
export type AttachHostRef = EffectTargetRef | { readonly among: CardFilter };
/**
 * What an `attach` acts on — the attachment, or what it's attached to:
 * an {@link EffectTargetRef}, or
 *
 * - `"created"`: the token an earlier step of this resolution created (living
 *   weapon's "create a 0/0 black Phyrexian Germ creature token, then attach
 *   this to it" — rule 702.92a);
 * - `"put-this-way"`: the card an earlier step of this resolution put onto
 *   the battlefield (the `"put-onto-battlefield"` this-way kind) — Pre-War
 *   Formalwear's "return target creature card … to the battlefield and
 *   attach this Equipment to **it**", Stonehewer Giant's "search your library
 *   for an Equipment card, put it onto the battlefield, attach **it** to a
 *   creature you control". The first of them still on the battlefield, as
 *   the same object (rule 400.7).
 */
export type AttachRef = EffectTargetRef | "created" | "put-this-way";
/** A `look-and-choose`'s zone as `ResolutionContext.lookAndChoose` takes it:
 * its `"targets"` resolved to `{ cards }`, its `"exiled-with-source"` to the
 * linked cards in exile, `{ exiled }`. */
export type LookAndChooseZone =
  | "library"
  | "graveyard"
  | "hand"
  | "graveyards"
  | "command"
  | "exile"
  | { readonly cards: readonly ObjectId[] }
  | { readonly exiled: readonly ObjectId[] };
/** What a `search-library` searches — see its `zones`. */
export type SearchZones =
  | "library"
  | "graveyard"
  | "hand"
  | "library-and-graveyard"
  | "graveyard-and-hand"
  | "hand-and-library"
  | "graveyard-hand-library";
/** Which zones each {@link SearchZones} takes in. */
export const SEARCHED_ZONES = {
  library: { library: true, graveyard: false, hand: false },
  graveyard: { library: false, graveyard: true, hand: false },
  hand: { library: false, graveyard: false, hand: true },
  "library-and-graveyard": { library: true, graveyard: true, hand: false },
  "graveyard-and-hand": { library: false, graveyard: true, hand: true },
  "hand-and-library": { library: true, graveyard: false, hand: true },
  "graveyard-hand-library": { library: true, graveyard: true, hand: true },
} as const satisfies Record<SearchZones, { readonly library: boolean; readonly graveyard: boolean; readonly hand: boolean }>;
/** A `search-library`'s other player's zones and what follows the finds, as
 * `ResolutionContext.searchLibrary` takes them — see the effect's `whose`,
 * `all`, `playable` and `then`. */
export interface SearchMore {
  readonly owner?: PlayerId;
  readonly all?: boolean;
  readonly playable?: "while-exiled";
  /** Its `linked`. */
  readonly linked?: true;
  readonly then?: EffectSpec;
  readonly outside?: true | "only";
  readonly faceUpExile?: true;
  /** Its `exileRest`. */
  readonly exileRest?: true;
  /** Its `inAnyOrder`. */
  readonly inAnyOrder?: true;
  /** Its `upTo`. */
  readonly upTo?: true;
  /** Its `instead`, its `condition` already read (one that didn't hold is no
   * `instead` at all) and its `under` named. */
  readonly instead?: ResolvedSearchInstead;
  /** Its `withCounters`, the amount read. */
  readonly withCounters?: { readonly kind: string; readonly amount: number };
}
/**
 * A `search-library`'s finds sent somewhere other than its `destination`,
 * card by card (rule 701.23 leaves where a find goes to the instruction): the
 * ones this picks go to **its** `destination` and every other find to the
 * search's own. Picked once the finds are chosen and revealed, before
 * anything moves; the library is shuffled after both moves.
 *
 * - `filter`: only finds matching it may go — Archdruid's Charm's "put it onto
 *   the battlefield tapped **if it's a land card**. Otherwise, put it into
 *   your hand", Guidelight Pathmaker's "if its mana value is 2 or less".
 * - `condition`: only while this holds, read as the search resolves (nothing
 *   happens between the search and the put that could change it) — Ruin in
 *   Their Wake's "if you control a land named Wastes", Caravan Vigil's morbid.
 * - `pick`: `"all"` — every find that qualifies, no choice (Archdruid's
 *   Charm); `"any"` — the searcher picks any number of them, a "you may put"
 *   (Ruin in Their Wake, Treasure Chest) or a choice between two places (Dina's
 *   Guidance's "put it into your hand **or** graveyard"); `"one"` — exactly
 *   one of the finds, the rest going to the search's `destination` (Jarad's
 *   Orders' "put one into your hand and the other into your graveyard";
 *   Rootweaver Druid's "one … under your control and the rest … under
 *   their control"). A single find is that one: the instruction for "the
 *   other" can't be followed, so it does only as much as it can (rule 609.3).
 *   `{ exactly: n }` — that many of the finds, every find when there are no
 *   more than that: Gifts Ungiven's "target opponent chooses two of those
 *   cards" ("if you find one or two cards, your opponent must choose them",
 *   its ruling).
 * - `destination: "library"`: those picked go back into the library the search
 *   then shuffles — Threats Undetected's "shuffle the chosen cards into your
 *   library and put the rest into your hand".
 * - `chooser`: **another player** picks them from the revealed finds, once
 *   they're chosen and revealed — a target (`{ target: 0 }`, Intuition's
 *   "target opponent chooses one"), or `"an-opponent"`: "an opponent chooses"
 *   (Realms Uncharted), the opponent being the effect's controller's choice as
 *   that instruction is followed, so with the finds in view. Nobody is asked
 *   who when there's one opponent, nor anything at all when every find must
 *   go.
 * - `under: "you"`: those picked enter under the **effect's controller's**
 *   control while the rest enter under the searcher's (Rootweaver Druid's
 *   opponent searching, in an `each-player-may`'s `ifDid`).
 *
 * Not combined with the search's `then`, `restDestination`,
 * `all`, `attachedToSource` or a library-top / exile destination.
 */
export interface SearchInstead {
  readonly destination: "battlefield" | "hand" | "graveyard" | "library";
  readonly enterTapped?: true;
  readonly filter?: CardFilter;
  readonly condition?: StaticCondition;
  readonly pick: "all" | "any" | "one" | { readonly exactly: number };
  readonly chooser?: EffectPlayerRef | "an-opponent";
  readonly under?: "you";
}
/** A {@link SearchInstead} as `beginLibrarySearch` takes it. */
export interface ResolvedSearchInstead {
  readonly destination: "battlefield" | "hand" | "graveyard" | "library";
  readonly enterTapped?: true;
  readonly filter?: CardFilter;
  readonly pick: "all" | "any" | "one" | { readonly exactly: number };
  readonly chooser?: PlayerId | "an-opponent";
  readonly under?: PlayerId;
}
/**
 * What a `search-library`'s finds must be *together* — see its `together`.
 *
 * - `{ share: "land-type" }`: "…that **share a land type**" (Myriad
 *   Landscape): every find has a land type (rule 205.3i) in common with every
 *   other.
 * - `{ oneEach }`: "a Forest card **and** a Plains card" (Krosan Verge): one
 *   find per slot, each matching its slot's filter. The effect's own `filter`
 *   should admit exactly the cards some slot does, and its `max` be the
 *   number of slots.
 */
export type SearchTogether =
  | { readonly share: "land-type" }
  /** "…that each have different names" (Tiamat): no two finds share a name,
   * and a card with no name can't be one of them (rule 201.2b). */
  | { readonly distinctNames: true }
  /** "…with different powers" (Rip, Spawn Hunter; Threats Undetected): no two
   * share a power, read as the choice is raised. */
  | { readonly distinctPowers: true }
  | {
      readonly oneEach: readonly {
        /** How the client names the slot: "a Forest card". */
        readonly label: string;
        readonly filter: CardFilter;
      }[];
      /** How the client names the whole set, instead of the slots' labels
       * joined by "and" — "a card of each card type" (Atraxa, Grand
       * Unifier's nine slots), "a Cleric card, a Rogue card, a Warrior card,
       * and/or a Wizard card" (Harper Recruiter). */
      readonly text?: string;
    }
  /** One slot a card type, the types being only those among the spells the
   * chooser's side has cast this turn that match the filter, read as the
   * choice is raised — Hurkyl, Master Wizard's "for each card type among
   * noncreature spells you've cast this turn, you may put a card of that
   * type". Each type once however many spells had it (the slots of a
   * `oneEach`, rule 205.2a). */
  | { readonly oneEachTypeAmong: { readonly spellsYouCastThisTurn: CardFilter } }
  /** The chosen cards' mana values add up to this or less, choosing none also
   * allowed — Ao, the Dawn Sky's "any number of nonland permanent cards with
   * total mana value 4 or less". An amount on a `look-and-choose`, read as it
   * resolves (Smelting Vat's "the sacrificed artifact's mana value"). */
  | { readonly totalManaValueAtMost: EffectAmount };

/** A {@link SearchTogether} as `Game` raises it: its amount read. */
export type ResolvedSearchTogether =
  | Exclude<SearchTogether, { readonly totalManaValueAtMost: EffectAmount }>
  | { readonly totalManaValueAtMost: number };

/**
 * Where each chosen card of a `look-and-choose` goes when that depends on the
 * card: the first case whose `filter` it matches, in order — Zimone's
 * Experiment's "Put all land cards revealed this way onto the battlefield
 * tapped and put all creature cards revealed this way into your hand". Its
 * instructions are followed in the order written (rule 608.2c), so a land
 * creature (Dryad Arbor) is already on the battlefield when "all creature
 * cards" is read. A card matching no case goes to the effect's `destination`.
 * Each case is read as the cards move, in one move.
 */
export interface ZoneChoiceSplitCase {
  /** How a client names these cards: "land cards". */
  readonly label: string;
  readonly filter: CardFilter;
  readonly destination: "battlefield" | "hand" | "graveyard";
  readonly enterTapped?: true;
}
/**
 * What an amount that reads an object (`powerOf`, `toughnessOf`,
 * `manaValueOf`, `manaSpentOf`) may point at: anything an
 * {@link EffectTargetRef} can, plus `"sacrificed"` — the permanent sacrificed
 * to pay the spell's or ability's cost, or by a `sacrifice-source` step
 * before this one ("where X is the sacrificed creature's power" — Dina, Soul
 * Steeper) — and `"tapped"`, the one permanent tapped to pay the ability's
 * cost ("equal to the tapped creature's power" — station) — and
 * `"discarded"`, the one card discarded to pay the cost ("where X is the
 * discarded card's mana value" — Volrath the Fallen), read where the discard
 * put it — and `"revealed"`, the one card revealed from the hand to pay the
 * cost ("where X is the revealed card's mana value" — Induce Despair), read
 * in the hand while it's still there and as it last existed there once it
 * has left (the rulings) — and `"exiled-as-cost"`, the one card exiled from a
 * graveyard to pay it ("damage equal to the exiled card's power" — Corpse
 * Explosion). Nothing sacrificed, tapped, discarded, revealed or exiled reads 0.
 *
 * An object that was a permanent when the spell or ability referred to it
 * and has left the battlefield since is read as it last existed there (rule
 * 608.2h — see `LastKnownRefs`): "When Juri dies, it deals damage equal to
 * its power" counts the counters Juri died with.
 */
export type AmountRef = EffectTargetRef | "sacrificed" | "tapped" | "discarded" | "revealed" | "exiled-as-cost";
/** Where a `return-to-hand` effect takes its object from. */
export type ReturnToHandZone = "battlefield" | "graveyard" | "exile" | "stack" | "library";
/**
 * How long an effect on a permanent lasts (rule 611.2a): until end of turn;
 * for as long as the permanent stays on the battlefield (`"permanent"`);
 * "until your next turn" — the effect's controller's, ending as that turn
 * begins, or as it would have begun once they've left the game (rule
 * 800.4m); or "for as long as it has a [kind] counter on it" (Ultima,
 * Origin of Oblivion's blight — rule 611.2b), which does nothing if it has
 * none as the effect would begin, ends as the last one is removed, and
 * isn't brought back by a new one.
 */
export type PtDuration =
  | "end-of-turn"
  | "permanent"
  | "until-your-next-turn"
  | UntilPointDuration
  | { readonly whileCounter: string }
  /** "For as long as [this] remains on the battlefield" — the effect's own
   * source, in the stint the resolving ability refers to (Opportunistic
   * Dragon): it ends as that leaves, and does nothing if it already has
   * (rule 611.2b). */
  | "while-source"
  /** "For as long as [this] remains tapped" (Ashnod's Battle Gear, Phyrexian
   * Gremlins): the source, in that stint, staying on the battlefield and
   * tapped — it ends as the source untaps or leaves, and does nothing if the
   * source is already untapped or gone (rule 611.2b). Usually beside a
   * `mayChooseNotToUntap` static. */
  | "while-source-tapped"
  /** "For as long as you control [this]" (Aegis Angel, Aladdin): the source, in that stint, staying on the battlefield
   * under the effect's controller — it ends as the source leaves or changes
   * hands, and does nothing if they don't control it as it would begin
   * (rule 611.2b). */
  | "while-you-control-source"
  /** Both: "for as long as you control ~ and ~ remains tapped" (Rubinia
   * Soulsinger, Willow Satyr). */
  | "while-you-control-source-tapped";

/**
 * A duration ending at a point in a later turn, beyond that turn's beginning.
 * `"you"` is the effect's controller. Each is a {@link PtDuration}, and
 * `gain-control` takes them too.
 *
 * - `"until-your-next-upkeep"`: as it begins (Xenic Poltergeist).
 * - `"until-end-of-your-next-upkeep"`: as it ends (Halfdane).
 * - `"until-end-of-your-next-turn"`: its cleanup step (Stilt-Man, Towering
 *   Terror).
 * - `"until-its-controllers-next-untap-step"`: as the next untap step of the
 *   permanent's controller then begins (Orcish Farmer). A skipped one doesn't
 *   count (rule 614.10a), which is where it differs from "until your next
 *   turn".
 */
export type UntilPointDuration =
  | "until-your-next-upkeep"
  | "until-end-of-your-next-upkeep"
  | "until-end-of-your-next-turn"
  | "until-its-controllers-next-untap-step";

/**
 * A "spend this mana only to …" clause on a mana ability (rule 106.6b).
 *
 * `spell` is the ordinary case: only spells matching this filter. `abilityOf`
 * adds "…or activate abilities of [X]" (Eldrazi Temple, Castle Garenbrig).
 * `chosenType` means the filter's subtype comes from the source's own
 * `chosenCreatureType`, named as it entered rather than printed (Cavern of
 * Souls, Unclaimed Territory, Secluded Courtyard) — it is resolved at
 * activation time and folded into `spell`.
 */
export interface ManaSpendOnly {
  readonly spell?: CardFilter;
  /** "This mana can't be spent to cast [these] spells" — Karn, Legacy
   * Reforged's `{ notTypes: ["artifact"] }`: anything else may use it,
   * abilities and ward costs included. Set alone. See `ManaRestriction`. */
  readonly notSpell?: CardFilter;
  /** "…or activate abilities of [X]": abilities of permanents on the
   * battlefield matching this — "abilities of creatures" means creature
   * permanents (rule 109.2; Castle Garenbrig's ruling). */
  readonly abilityOf?: CardFilter;
  /** `abilityOf` covers a card's abilities in any zone too — "an ability of
   * a creature **source**" (Secluded Courtyard), which names a source rather
   * than a permanent (rule 109.2a). */
  readonly abilityOfAnyZone?: true;
  readonly chosenType?: boolean;
  /** "…and that spell can't be countered" (Cavern of Souls, Delighted
   * Halfling). A property of the spell this mana pays for, not of the land. */
  readonly uncounterable?: boolean;
  /** "Spend this mana only to cast a spell from your graveyard" (Lord of the
   * Forsaken). Set alone. See `ManaRestriction.fromYourGraveyard`. */
  readonly fromYourGraveyard?: true;
  /** What else it may pay for, beside `spell` and `abilityOf` or on their own:
   * "to turn permanents face up", "to pay a disturb cost", "on costs that
   * contain {X}". See `ManaSpendPurpose`. */
  readonly purposes?: readonly ManaSpendPurpose[];
  /** The card's own wording, for the log and the mana display. */
  readonly text: string;
}

/**
 * Counters a blinked permanent gets as it comes back — Essence Flux's "If
 * it's a Spirit, put a +1/+1 counter on it". `onlyIf` is checked against the
 * *returned* permanent, which is a new object (rule 400.7) wearing its
 * printed characteristics with none of the type or ability changes the old
 * one was carrying.
 */
export interface FlickerCounters {
  readonly kind: string;
  readonly amount: number;
  readonly onlyIf?: CardFilter;
  /** The permanent comes back **with** them — Planar Incision's "return it
   * to the battlefield … with a +1/+1 counter on it": on it as it enters
   * (rule 122.6), so its enters triggers see them. Without it they're put
   * on after it has returned, as Essence Flux's are. */
  readonly entering?: boolean;
}

/**
 * A `delayed-trigger` keyed to one permanent leaving the battlefield rather
 * than to a step: "when **that creature** dies this turn" (Kelsien, the
 * Plague), earthbend's "when **it** dies or is exiled". `leaves` is a target
 * slot, `"source"` or `"trigger-object"`, and must name a permanent on the
 * battlefield as the effect applies (otherwise there is nothing to watch, and
 * no trigger is made). When it fires, that permanent — now wherever it went —
 * is the ability's trigger object, so "return it to the battlefield" is
 * `put-onto-battlefield` with `target: "trigger-object"`; the creating
 * effect's targets still ride along by slot. See `DelayedLeaveWatch`.
 */
export interface DelayedLeaves {
  /** `"created"` is "**that token**": every token this resolution has made,
   * each woken out of any stack and watched on its own (Ugin, the Ineffable's
   * ruling: "the first time that either of the tokens leaves"). With `about`,
   * the delayed ability's targets are what this resolution did that to
   * instead: "put **the exiled card** into your hand" is `about: "exiled"` and
   * a slot 0 that stays with the card; Stangg's "exile **that token** when
   * Stangg leaves" is `leaves: "source"`, `about: "created"`. */
  readonly leaves: EffectTargetRef | "created";
  /** `["graveyard"]` is "dies", `["graveyard", "exile"]` "dies or is
   * exiled". */
  readonly to: readonly LeaveDestination[];
  /** "…this turn". */
  readonly thisTurn?: boolean;
}

/**
 * A `delayed-trigger` keyed to its controller losing control of one permanent:
 * "When you lose control of **the creature**, tap it" (Ray of Command) — for any
 * reason, its own "until end of turn" ending in the cleanup step, another
 * player gaining control of it (Ray of Command's and Ogre Geargrabber's
 * rulings), or it leaving the battlefield (Khârn the Betrayer's 2022-10-07
 * ruling, Gustha's Scepter's 2004-10-04 one). `losesControl` is a
 * target slot, `"source"` or `"trigger-object"`, and must name a permanent on
 * the battlefield as the effect applies (otherwise there is nothing to watch,
 * and no trigger is made). When it fires, that permanent is the ability's
 * trigger object; the creating effect's targets ride along by slot.
 * It triggers once (rule 603.7b), unless it's `thisTurn`.
 */
export interface DelayedLosesControl {
  readonly losesControl: EffectTargetRef;
  /** "…this turn" (Stolen Uniform): a stated duration, so every time, until
   * the next turn begins — past the cleanup step that ends "until end of
   * turn" control. */
  readonly thisTurn?: true;
  /** "…, if it's attached to a creature you control" (Stolen Uniform): an
   * intervening "if" (rule 603.4) over the creating effect's targets. Asked as
   * it would trigger; the effect asks it again as it resolves. */
  readonly onlyIf?: StaticCondition;
}

/** "When you next cast a [filter] spell this turn" (Yuna, Grand Summoner;
 * Codie, Vociferous Codex) — a delayed trigger keyed to its controller's next
 * spell matching `nextSpell` (`{}` for any), once, and this turn only. That
 * spell is its trigger object. */
export interface DelayedNextSpell {
  readonly nextSpell: CardFilter;
  /** "…**or activate an ability with {X} in its activation cost** this
   * turn" (Magus Lucea Kane): whichever comes first fires it, and that
   * ability is the trigger object (a `copy-ability` of `"trigger-ability"`
   * copies it). An activated ability only, never a mana ability — one that
   * uses the stack (the rulings: a triggered ability asking for {X} isn't
   * one, nor is a cost that says X without the {X} symbol). */
  readonly orNextAbility?: { readonly xInCost: true };
}

/** "This turn, when **target creature you control** attacks and isn't
 * blocked" (Delif's Cone, rule 509.3g) — keyed to the permanent in
 * `attacksUnblocked`'s slot, for this stint of it. With a stated duration it
 * fires each time this turn (rule 603.7c: a second combat), and lapses as
 * the turn ends. That permanent is its trigger object, and its defending
 * player the trigger player. */
export interface DelayedUnblocked {
  readonly attacksUnblocked: EffectTargetRef;
}

/**
 * "Until end of turn, whenever [event], [effect]" — and "whenever [event]
 * this turn", and a planeswalker's "until your next turn, whenever …" (rule
 * 603.7c): a delayed triggered ability with a duration, matched like any
 * triggered ability's `whenever` — "you" is its controller, `"self"` the
 * object that set it up, in the stint it was in then — and firing each time
 * until the duration ends. It belongs to no permanent, so nothing that
 * happens to its source (leaving, losing its abilities, changing hands) ends
 * it. Its trigger object is the event's (`"trigger-object"` is "it"), and
 * `"source"` is still the card that set it up (Mountain Titan's "put a
 * +1/+1 counter on this creature").
 *
 * With no `targets` its effect reads the creating ability's targets by slot
 * (Jaya, Fiery Negotiator's "to that creature"). With `targets` it chooses
 * its own each time it triggers, as a printed trigger does, and its slots
 * are those (Origin of Thor's "put a +1/+1 counter on target creature you
 * control").
 */
export interface DelayedWhenever {
  readonly whenever: TriggerSpec;
  /** How long it lasts, if not just this turn: `"your-next-turn"` until its
   * controller's next turn begins; `"end-of-combat"` "…this combat" (Love on the
   * Battlefield), lapsing as this combat's end of combat step ends; `"game"` for
   * as long as the game does — "at the beginning of each of your upkeeps for the
   * rest of the game", and a delayed "when" with no duration of its own (`once`,
   * Coffin Queen). */
  readonly until?: "your-next-turn" | "end-of-combat" | "game";
  readonly targets?: readonly TargetSpec[];
  /** "…deals combat damage to **that player** this turn" (Great Train
   * Heist): a target slot holding a player, fixed as this resolves; only
   * damage dealt to them fires it. */
  readonly toPlayer?: number;
  /**
   * "Whenever **target creature** deals damage this turn" (Paladin of Prahv),
   * "whenever **either of those creatures** deals combat damage" (Tamiyo,
   * Field Researcher): what `"self"` in `whenever` reads as, fixed as this
   * resolves, instead of the object that set it up. Any trigger that can say
   * "self" can be watched this way. A slot, `"source"` or `"trigger-object"`,
   * or `"targets"` for every permanent among the creating ability's targets
   * that's still legal. Each is watched for this stint on the battlefield
   * (rule 400.7); with none on the battlefield there's nothing to watch, and
   * no trigger is made. "You" is still this ability's controller, who needn't
   * control them. A source that's left since is judged as it last existed.
   */
  readonly watching?: EffectTargetRef | "targets";
  /** "**When** …" rather than "whenever": it triggers only once (rule 603.7b),
   * however long it could have waited. */
  readonly once?: true;
  /**
   * "When this creature becomes untapped **or you lose control of this
   * creature**" (Coffin Queen): this permanent — a slot, `"source"` or
   * `"trigger-object"`, on the battlefield as this resolves — leaving its
   * controller's control fires it too (see {@link DelayedLosesControl}).
   * With `once`, whichever comes first uses it up.
   */
  readonly orLosesControl?: EffectTargetRef;
}

/** A {@link DelayedWhenever} with what it names read as it's set up. */
export type DelayedWheneverAt = Omit<DelayedWhenever, "watching" | "orLosesControl"> & {
  readonly player?: PlayerId;
  readonly watched?: readonly ObjectId[];
  readonly orLosesControlOf?: ObjectId;
};

/** How a `flicker` returns what it exiled — the non-target half of its
 * {@link EffectSpec}. */
export interface FlickerOptions {
  readonly thenCounters?: FlickerCounters;
  readonly underYourControl?: boolean;
  /** It returns transformed (Clive, Ifrit's Dominant). */
  readonly transformed?: boolean;
  /** It returns tapped (Nezahal, Primal Tide). */
  readonly tapped?: boolean;
  readonly returnAt?: DelayedTriggerTiming;
  readonly returnText?: string;
  /** The effect named its own source (`target: "source"`). */
  readonly fromSource?: boolean;
}
/** A numeric amount in an effect: a literal, `"x"` for the value chosen for
 * `{X}` when the spell/ability was put on the stack (`ResolutionContext.x`),
 * or a live count of battlefield permanents matching a filter, evaluated from
 * the effect's controller's perspective (Scourge of Valkas: `{ countOf:
 * { subtype: "Dragon", controlledBy: "you" } }`; Craterhoof Behemoth:
 * `{ countOf: { type: "creature", controlledBy: "you" } }`). */
export type EffectAmount =
  | number
  | "x"
  | {
      readonly countOf: CardFilter;
      /** Multiply the count (Shamanic Revelation: "you gain **4 life for
       * each** creature you control with power 4 or greater"). Defaults to 1,
       * which is the plain "one per" every other user of `countOf` wants. */
      readonly times?: number;
      /** Leave the effect's own source out — "for each **other** creature
       * you control". One permanent, not one object: a source that is a
       * member of a token stack leaves the rest of the stack counted. */
      readonly excludeSelf?: boolean;
      /** Leave out whatever target slot `excludeTarget` names — "for each
       * creature you control **other than that creature**". */
      readonly excludeTarget?: number;
      /** Read the filter from the side of the player in this target slot
       * rather than the effect's controller's — "the number of creatures
       * **target player** controls" (Will of the Mardu) is `{ countOf: {
       * type: "creature", controlledBy: "you" }, forTarget: 0 }`. 0 when the
       * slot holds no player, or one gone illegal. */
      readonly forTarget?: number;
      /** Read the filter from the side of the one player this names —
       * "equal to the number of nonbasic lands **that creature's
       * controller** controls" (Weight of Spires: `{ controllerOfTarget: 0
       * }`), "for each artifact **that player** controls" in a trigger
       * (Emissary of Hope: `"trigger-player"`), "the creatures **the chosen
       * player** controls" (`"chosen-player"`). 0 when it names nobody (an
       * illegal slot, a player who has left the game). */
      readonly forPlayer?: EffectPlayerRef;
      /** Read the filter from the side of **each player** a scoped effect
       * acts on, once for each — "each player sacrifices half the creatures
       * **they** control" (Zodiark, Umbral God: a `sacrifice` of `who:
       * "each-player"` counting `{ countOf: { type: "creature",
       * controlledBy: "you" }, forEachPlayer: true }` halved). Outside a
       * scoped effect, the controller's side. */
      readonly forEachPlayer?: true;
    }
  /** A sum, maximum or count over a set of objects — "X is the **total
   * power** of creatures you control", "the **greatest mana value** among
   * cards in your graveyard", "the greatest power among them" (the
   * attackers that fired the trigger), "the number of counters among
   * creatures target player controls". A token stack counts once per token
   * in a sum. Clamped at 0 (rule 107.1b), so a board of negative-power
   * creatures deals no damage rather than a negative amount. See
   * {@link AggregateSpec}. */
  | AggregateSpec
  /** A numeric quantity the triggering event supplies (ROADMAP P4b): the power
   * of the entering creature (Terror of the Peaks) or, for a "deals combat
   * damage to a player" trigger, the damage dealt (Old Gnawbone — "create that
   * many Treasure tokens"). Snapshotted when the trigger is detected; `0`
   * outside a triggered-ability resolution. */
  | { readonly triggerValue: true }
  /** The number chosen as the source entered — Talion, the Kindly Lord's "the
   * chosen number" (a `chooseOnEnter` of "1"…"10"). `NaN` while none was
   * chosen, so a comparison with it never holds: like Pramikon's direction,
   * a choice that was never made has no effect. */
  | { readonly chosenNumber: true }
  /**
   * The mana value of whatever a target slot (or `"source"` /
   * `"trigger-object"` / `"sacrificed"`) points at — Feed the Swarm's "you
   * lose life equal to that permanent's mana value", Hoard-Smelter Dragon,
   * Aura Mutation.
   *
   * A permanent that has left the battlefield since is read as it last
   * existed there (rule 608.2h — last known information, see
   * {@link AmountRef}). That matters because every card printed this way
   * destroys the permanent *first* and then reads its mana value. `0` for a
   * player target or an object that no longer exists at all.
   */
  | { readonly manaValueOf: AmountRef }
  /**
   * How much mana was actually spent to cast the object (Prossh, Skyraider of
   * Kher: "where X is the amount of mana spent to cast it"). Commander tax,
   * {X} and additional mana costs count; a free cast is 0, and so is mana a
   * creature paid for by convoke, which isn't mana (rule 702.51a). `0` for
   * anything that wasn't cast.
   *
   * `from` counts only the mana made by matching sources: "the amount of {S}
   * spent to cast this spell" (Graven Lore — rule 107.4h, mana from a snow
   * source) is `{ manaSpentOf: "source", from: { supertype: "snow" } }`.
   */
  | { readonly manaSpentOf: AmountRef; readonly from?: ManaFromSpec }
  /**
   * How many **colours** of mana were spent to cast the object — converge
   * (an ability word, rule 207.2c: Painful Truths' "where X is the number of
   * colors of mana spent to cast this spell"). Colourless isn't a colour, so
   * at most 5; mana spent on additional costs and cost increases counts. A
   * copy of a spell wasn't cast and reads 0, as does a free cast (the
   * converge rulings). Kept by the permanent a spell becomes, like
   * `manaSpentOf`; `0` for anything that wasn't cast.
   */
  | { readonly colorsSpentOf: AmountRef }
  /**
   * How many creatures convoked it (rule 702.51a): the resolving spell's, or
   * — for the permanent a spell became — its spell's: Ancient Imperiosaur's
   * "enters with two +1/+1 counters on it for each creature that convoked
   * it", Knight-Errant of Eos's "X is the number of creatures that convoked
   * this creature". `0` for anything not convoked.
   */
  | { readonly convokers: true }
  /**
   * How many Phyrexian mana symbols its caster paid life for (rule
   * 702.150a): the resolving spell's, or — for the permanent a spell
   * became — its spell's. Compleated's "two fewer loyalty counters for
   * each" (`CardDraft.compleated`). `0` for anything not cast.
   */
  | { readonly phyrexianPaidWithLife: true }
  /**
   * How many times the commander behind an {@link AmountRef} has been cast
   * from the command zone this game (rule 903.8's count — the same one the
   * commander tax reads), by its owner. Study Hall's "scry X, where X is the
   * number of times it's been cast from the command zone this game", in a
   * `whenSpent` rider whose slot 0 is the spell: that cast already counts. `0`
   * for anything that isn't a card.
   */
  | { readonly commanderCastsOf: AmountRef }
  /**
   * How many times the effect's controller has cast **their commanders** from
   * the command zone this game, all of them together (rule 903.8's counts,
   * added up) — Thunderclap Drake's "for each time you've cast your commander
   * from the command zone this game", whose ruling adds both of a pair's
   * casts. 0 for a player with no commander.
   */
  | { readonly commanderCasts: "you" }
  /** The last die roll this effect's controller made (rule 706 — a
   * `roll-dice`'s `then` or table row): `"total"`, the result (natural
   * results plus the roll's modifier); `"odd"` / `"even"`, how many dice came
   * up odd / even ("for each odd result" — Clown Car); `{ equals: N }`, how
   * many came up exactly N. 0 before any roll. */
  | { readonly roll: "total" | "odd" | "even" | { readonly equals: number } }
  /** The total mana value of the cards in exile linked to this effect's
   * source (rule 607.2a — `exile`'s `linked`), in the stint the resolving
   * ability refers to: Skyclave Apparition's "where X is the mana value of
   * the exiled card" (its ruling: several exiled cards add up). Printed
   * costs, an {X} counting 0. 0 when there are none. */
  | { readonly exiledWithSourceManaValue: true }
  /** Their total power, as above: Redemptor Dreadnought's "where X is the
   * power of the exiled card". 0 when there are none. */
  | { readonly exiledWithSourcePower: true }
  /** A current life total: the effect controller's (`"you"` — Ajani, Caller
   * of the Pride's ultimate: "create X 2/2 white Cat creature tokens, where X
   * is your life total"), or `"each"`, the life of **each player the effect
   * is applied to** — "each opponent loses half **their** life" is a
   * scoped `lose-life` whose amount is read once per player. Outside a
   * scoped effect `"each"` reads the controller's. */
  | { readonly lifeTotal: "you" | "each" }
  /** The difference between the life totals of the players in these two
   * target slots, as this is read — Profane Transfusion's "where X is the
   * difference between those players' life totals". Read even of one that's
   * an illegal target: it isn't affected, only asked about (rule 608.2b). */
  | { readonly lifeDifference: readonly [number, number] }
  /** The game's starting life total (rule 119.1): 20, or 40 in Commander —
   * "your life total becomes equal to your starting life total" (Oketra's
   * Last Mercy), and half of it with `half` (The Endstone). */
  | { readonly startingLifeTotal: true }
  /** "The lowest life total among all players" still in the game (Repay in
   * Kind). */
  | { readonly lowestLifeTotal: true }
  /** Half of an amount, rounded up or down (rule 107.1a says which the card
   * must say) — "half their life, rounded up". `fraction` is another part
   * than a half: Legate Lanius's decimate, "a tenth of the creatures they
   * control, rounded up", is `fraction: 10`. */
  | { readonly half: EffectAmount; readonly round: "up" | "down"; readonly fraction?: number }
  /** Two to the power of an amount — Mathemagics' "target player draws 2ˣ
   * cards" (`{ powerOfTwo: "x" }`; 2⁰ = 1). The exponent is at most 52, past
   * which a number isn't exact any more: every use draws or counts far more
   * than a game holds by then (a draw stops at an empty library). */
  | { readonly powerOfTwo: EffectAmount }
  /** How many cards in **graveyards** match a filter — Undergrowth's "for
   * each creature card in your graveyard" (Lotleth Giant). Distinct from
   * `countOf`, which only ever counts battlefield permanents. The filter's
   * `ownedBy: "you"` is what restricts it to your own graveyard. */
  | {
      readonly countInGraveyard: CardFilter;
      /** Read the filter from the side of each player a scoped effect acts
       * on — "each player draws a card for each creature card in **their**
       * graveyard" (Nature's Resurgence). As `countOf`'s. */
      readonly forEachPlayer?: true;
      /** Read the filter from the side of the player in this target slot —
       * "the number of creature cards in **target player's** graveyard"
       * (Corpse Augur: `{ countInGraveyard: { type: "creature", ownedBy:
       * "you" }, forTarget: 0 }`). 0 when the slot holds no player, or one
       * gone illegal. As `countOf`'s. */
      readonly forTarget?: number;
      /** Read the filter from the side of the one player this names — "land
       * cards in **that player's** graveyard" after destroying their land
       * (Roiling Terrain: `{ controllerOfTarget: 0 }`). 0 when it names
       * nobody. As `countOf`'s. */
      readonly forPlayer?: EffectPlayerRef;
    }
  /** How many suspended cards the effect's controller owns (rule 702.62b —
   * in exile, with suspend, with a time counter): Rose Tyler's "a time
   * counter on it for each suspended card you own". */
  | { readonly suspendedCardsYouOwn: true }
  /** How many times the source's spell was kicked, for a multikicker spell
   * (rule 702.33c): "draw a card for each time Spell Contortion was kicked"
   * as the spell resolves, and a permanent's "when this enters, … for each
   * time it was kicked" (Wolfbriar Elemental) as it entered — as it last
   * existed if it has left. 0 when it wasn't kicked or wasn't cast. */
  | { readonly timesKicked: "source" }
  /** The current power of whatever an {@link AmountRef} points at — Unleash
   * Fury's "double the power of target creature" is a `modify-pt` that adds
   * this; "it deals damage equal to its power" from a dies trigger reads the
   * power it died with, and `{ powerOf: "sacrificed" }` is the Fling family's
   * "the sacrificed creature's power". `doubling` marks a "double its power"
   * P/T change, the one place a power below 0 is used as it is (see
   * {@link ptChangeValue}). */
  | { readonly powerOf: AmountRef; readonly doubling?: true }
  /** The current toughness of whatever an {@link AmountRef} points at —
   * Condemn's "its controller gains life equal to its toughness", read as
   * the creature last existed on the battlefield. `doubling` as for
   * `powerOf`. */
  | { readonly toughnessOf: AmountRef; readonly doubling?: true }
  /** How many counters of one kind are on whatever an {@link AmountRef}
   * points at — Black Market's "{B} for each charge counter on this
   * enchantment", Chasm Skulker's "X is the number of +1/+1 counters on this
   * creature" from its own dies trigger, which reads the counters it died
   * with (last-known information, rule 608.2h). `0` for a player. */
  | {
      readonly countersOn: AmountRef;
      /** One kind; omitted, every counter of every kind — "the number of
       * counters on it". */
      readonly counter?: string;
    }
  /** Your **devotion** to a colour (rule 700.5): every mana symbol of that
   * colour in the mana costs of permanents you control, hybrid pips included.
   * Gray Merchant of Asphodel's "each opponent loses X life, where X is your
   * devotion to black".
   *
   * `"that-color"` is the colour an `add-mana` of `"any-color"` is making —
   * Nykthos, Shrine to Nyx's "Choose a color. Add an amount of mana of that
   * color equal to your devotion to that color": the colour is chosen first,
   * then the amount read for it. 0 anywhere else.
   *
   * A list is "your devotion to [colour] and [colour]" (rule 700.5): every
   * symbol that's either colour, a `{W/B}` counted once. `characteristics.ts`'s
   * `devotionOf`, which the `devotion` condition and CDA count read too. */
  | { readonly devotionTo: Color | readonly Color[] | "that-color" }
  /** The greatest mana value among the effect's controller's commanders,
   * wherever each one is, as it is now (Cactus Preserve's "an X/X … where X
   * is the greatest mana value among your commanders" — its ruling); 0 with
   * none. `characteristics.ts`'s `greatestCommanderManaValue`. */
  | { readonly greatestCommanderManaValue: true }
  /** Domain (an ability word, rule 207.2c): the number of basic land types
   * among lands the effect's controller controls, 0 to 5, as it resolves —
   * Meria's Outrider, Herd Migration, Shadow Prophecy's "look at the top X
   * cards … where X is the number of basic land types among lands you
   * control". `characteristics.ts`'s `basicLandTypesAmong`; a cost reduction
   * and a CDA count have the same form. */
  | { readonly basicLandTypes: "you" }
  /** The number of creatures in the effect's controller's party, 0 to 4 (rule
   * 700.8), as it resolves — Malakir Blood-Priest's "each opponent loses X
   * life and you gain X life, where X is the number of creatures in your
   * party".
   * `characteristics.ts`'s `partySizeOf`; a cost reduction and a CDA count
   * have the same form. */
  | { readonly partySize: "you" }
  /** "The number of times this creature has mutated" (rule 702.140 —
   * Archipelagore, Porcuparrot): the mutating spells merged with the source
   * since it became this object (`GameObject.merged.timesMutated`), 0 for
   * one that never mutated; as it last existed if it has left. */
  | { readonly timesMutated: "source" }
  /** How many creatures are blocking the source now, or the object its
   * trigger names — each token of a blocking stack counting (rampage's "for
   * each creature blocking it beyond the first", rule 702.23, read as the
   * trigger resolves, 702.23b; General Marhault Elsdragon's "whenever a
   * creature you control becomes blocked, it gets +3/+3 … for each creature
   * blocking it", She-Hulk's counters). 0 when nothing blocks it. Read as it
   * last was if it has left (`inBlockingRelation`). A static's condition asks
   * the same through `CardFilter.blockerCount`. */
  | { readonly blockersOf: "source" | "trigger-object" }
  /** How many creatures died under the effect controller's control this turn
   * — Liliana's Standard Bearer. Reads `PlayerState.creaturesDiedThisTurn`.
   * `anyController`: every creature that died this turn, whoever controlled
   * it (Spymaster's Vault). */
  | { readonly creaturesDiedThisTurn: true; readonly anyController?: true }
  /** The product of several amounts — Gray Merchant of Asphodel gains "life
   * equal to the life lost this way", which is its devotion to black times
   * the number of opponents who lost that much. Composes, so it stays out of
   * the individual amount shapes. */
  | { readonly product: readonly EffectAmount[] }
  /** How many opponents control *fewer* permanents matching `filter` than the
   * effect's controller does — Voice of Many's "draw a card for each opponent
   * who controls fewer creatures than you". A comparison per player, which no
   * single `CardFilter` can express. */
  | { readonly opponentsControllingFewer: CardFilter }
  /** How many players a `PlayerScope` covers — Inspired Sphinx's "draw cards
   * equal to **the number of opponents you have**". Counts living players, so
   * it shrinks as a multiplayer game does.
   *
   * `where` counts only the players it holds for, each read as a
   * `for-each-player`'s `whoIf` is — "you" still the controller, the player
   * asked about `"that-player"` (an `of-player` reads that player's own
   * state): Oreskos Explorer's "the number of players who control more lands
   * than you" is `{ countPlayers: "each-player", where: { kind:
   * "player-compare", stat: { controls: { type: "land" } }, compare:
   * "fewer", than: "that-player" } }`; The Master of Lake-town's "each
   * graveyard with seven or more cards in it" is an `of-player` over
   * `cards-in-graveyard`. */
  | { readonly countPlayers: PlayerScope; readonly where?: StaticCondition }
  /** How much life the players `who` names (default everyone) have lost so
   * far in the resolution under way — "each opponent loses 1 life and you
   * gain **that much** life" (extort), "you gain life equal to the life lost
   * this way" (Gray Merchant of Asphodel). The life actually lost, read off
   * the resolution's own life changes, so an opponent whose loss is changed
   * or who can't lose life counts for what they lost. */
  | { readonly lifeLostThisWay: true; readonly who?: PlayerScope }
  /** The excess damage dealt so far in the resolution under way (rule
   * 120.4a): past lethal damage for a creature — its toughness less damage
   * already marked, or 1 from a deathtouch source — past its loyalty for a
   * planeswalker. Hell to Pay's "Treasure tokens equal to the amount of
   * excess damage dealt to that creature this way", Razor Rings' "you gain
   * life equal to the excess damage dealt this way". `to` counts only what
   * was dealt to that target slot's object — a fight's "excess damage dealt
   * to the creature an opponent controls" (Rhino's Rampage). */
  | { readonly excessDamageThisWay: true; readonly to?: number }
  /** The damage dealt so far in the resolution under way — "you gain life
   * equal to the damage dealt this way" (Creeping Bloodsucker). Damage
   * prevented was never dealt, so it doesn't count. `to` counts only what was
   * dealt to that target slot's player or object. */
  | { readonly damageDealtThisWay: true; readonly to?: number }
  /** The damage prevented so far by the shields this effect's resolution made
   * — read in the delayed ability it set up too, whose text is the same
   * sentence: Sacred Boon's "at the beginning of the next end step, put a
   * +0/+1 counter on that creature for each 1 damage prevented this way", read
   * as that ability resolves. Prevention's immediate additional effect (rule
   * 615.5 — Temper, right after each hit) is a `then` with `"x"` instead. */
  | { readonly damagePreventedThisWay: true }
  /** The cards a scry or surveil of this resolution left on top of the
   * library — Starving Revenant's "surveil 2. Then for each card you put on
   * top of your library, …". A count: which cards they are stays hidden. */
  | { readonly keptOnTopThisWay: true }
  /**
   * A per-player running total for this turn ({@link TurnStat}), summed over
   * the players `who` names (default `"you"`) — Kydele's "{C} for each card
   * you've drawn this turn", or "the total life your opponents lost this
   * turn" as `who: "each-opponent"`. A player who has left the game is no
   * longer in any scope, so their total drops out. `target` reads the player
   * in that target slot instead — Astarion, the Decadent's "target opponent
   * loses life equal to the amount of life **they** lost this turn".
   */
  | { readonly turnStat: TurnStat; readonly who?: PlayerScope | "each"; readonly target?: number }
  /** The spells `who` (you by default) cast this turn that match the
   * filter, each read as it was cast (`PlayerState.spellsCastThisTurnAs`):
   * how many, or with `greatest: "mana-value"` the greatest mana value
   * among them, its {X} counted (Rootha, Mastering the Moment's "the greatest
   * mana value among instant and sorcery spells you've cast this turn"), or with
   * `total: "mana-value"` the sum of them. `other` leaves out the spell this is
   * reading from: Call Forth the Tempest's "the total mana value of other spells
   * you've cast this turn" is `{ castThisTurn: {}, total: "mana-value", other:
   * true }`. 0 with none. */
  | {
      readonly castThisTurn: CardFilter;
      readonly who?: PlayerScope;
      readonly greatest?: "mana-value";
      readonly total?: "mana-value";
      readonly other?: true;
    }
  /** How many counters were put on permanents this turn, as
   * {@link CountersPutSpec} narrows them, whoever or wherever they are now —
   * Iridescent Hornbeetle's "for each +1/+1 counter you've put on creatures
   * under your control this turn". */
  | { readonly countersPutThisTurn: CountersPutSpec }
  /**
   * How many of the players `who` names have a nonzero {@link TurnStat} this
   * turn — "for each opponent who lost life this turn". Counts players, not
   * the amount: an opponent who lost 10 counts once.
   */
  | { readonly playersWithTurnStat: TurnStat; readonly who: PlayerScope }
  /**
   * How many counters of one kind the players `who` names have, summed —
   * "where X is the number of **experience counters you have**" (Ezuri, Claw
   * of Progress). `who` defaults to `"you"`. See `PlayerState.counters`.
   */
  | { readonly playerCounters: HeldPlayerCounter; readonly who?: PlayerScope }
  /**
   * The effect's controller's speed (rule 702.179) — "where X is your
   * speed" (The Speed Demon, Point the Way, Momentum Breaker's "life equal
   * to your speed"). 0 while they have none (702.179f).
   */
  | { readonly speed: "you" }
  /** The sum of several amounts — "N plus an amount": a mana value "1
   * greater than the sacrificed creature's" is `{ sum: [{ manaValueOf:
   * "sacrificed" }, 1] }`, in a filter's `{ amount }` operand as much as in
   * an effect. */
  | { readonly sum: readonly EffectAmount[] }
  /**
   * The first amount minus the second, never below 0 (rule 107.1b) — Mr.
   * Foxglove's "the number of cards in defending player's hand minus the
   * number of cards in your hand". `absolute` makes it the larger minus the
   * smaller: Doran, Besieged by Time's "the difference between its power and
   * toughness".
   */
  | { readonly difference: readonly [EffectAmount, EffectAmount]; readonly absolute?: boolean }
  /** The smallest of these — "put up to X counters … can't cause the total
   * … to be greater than four" (Clockwork Beast) as a number's `max`: the
   * lesser of X and the room left. */
  | { readonly leastOf: readonly EffectAmount[] }
  /** How many cards are in the hands of the players a scope names, summed —
   * "the number of cards in **defending player's** hand" is `{ cardsInHand:
   * "trigger-player" }` in an attack trigger. `"each"` is the hand of the
   * player a per-player effect is acting on: Stormbreath Dragon's "deals
   * damage to each opponent equal to the number of cards in **that player's**
   * hand" is a `damage` to `who: "each-opponent"` of `{ cardsInHand: "each"
   * }`. `{ target: n }` is the hand of the player in target slot `n`, for an
   * effect that doesn't act on them — Jeska's Will's "add {R} for each card
   * in target opponent's hand" (nothing, with that target illegal). */
  | { readonly cardsInHand: PlayerScope | "each" | { readonly target: number } }
  /** How many cards are in a library or graveyard — yours, or with
   * `"each"` the player a per-player effect is acting on: "any number of
   * target players each mill half **their** library" (Singularity Rupture)
   * is a `mill` of `{ half: { librarySize: "each" }, round: "down" }`,
   * "…cards equal to the number of cards in **their** graveyard" (Riverchurn
   * Monument) `{ graveyardSize: "each" }`. */
  | { readonly librarySize: "you" | "each" }
  | { readonly graveyardSize: "you" | "each" }
  /** How many colours what an {@link AmountRef} points at has — Ramos,
   * Dragon Engine's "a +1/+1 counter on Ramos for each of **that spell's
   * colors**" (`"trigger-object"` in a cast trigger). A permanent that has
   * left is read as it last existed there; colourless is 0. */
  | { readonly colorsOf: AmountRef }
  /** How many colours there are **among** battlefield permanents matching a
   * filter, each counted once however many permanents have it — "for each
   * color among other legendary permanents you control" (Sisay, Weatherlight
   * Captain). `excludeSelf` leaves the effect's own source out ("other"). */
  | { readonly colorsAmong: CardFilter; readonly excludeSelf?: boolean }
  /** How many **differently named** tokens among the battlefield permanents
   * matching a filter — Neriv, Crackling Vanguard's "the number of
   * differently named tokens you control" (`{ token: true, controlledBy:
   * "you" }`): each name once. A token's name is the one the effect that
   * made it gave it, or its subtypes plus "Token" (rule 111.4) — "Elf
   * Token" — whatever its registry key; a copy's is what it copies. */
  | { readonly distinctTokenNames: CardFilter }
  /** How many votes the option at this index got in the `vote` this
   * resolution held (rule 701.38): Selvala's Stampede's "a creature card for
   * each wild vote". In a "whenever players finish voting" trigger, the
   * votes of the vote that fired it. */
  | { readonly votesFor: number }
  /** How many votes a player or permanent received in the `vote` this
   * resolution held — `"that-player"` (Círdan the Shipwright's "each player
   * draws a card for each vote they received", under a `for-each-voted`),
   * or the permanent in a target slot (Trap the Trespassers' "put that many
   * stun counters on it"). */
  | { readonly votesReceived: "that-player" | number }
  /**
   * A number chosen in the `vote` of `for: { number }` this resolution held:
   * the `"highest"` or `"lowest"` of them all (Wheel of Misfortune's "damage
   * equal to the highest number"), or one player's own — `"that-player"`, or
   * the player in a target slot (Choice of Damnations' "that much"). 0 with
   * no such number: nobody chose, or that player didn't.
   */
  | { readonly votedNumber: "highest" | "lowest" | "that-player" | number }
  /** "The number of opponents who voted for a choice you didn't vote for"
   * (Erestor of the Council): each opponent with a vote for a choice none of
   * the effect's controller's votes was for, counted once. */
  | { readonly opponentsVotedOtherwise: true }
  /** How many card types there are among cards in graveyards matching a
   * filter — each type once, however many cards have it, and a card with two
   * types gives both (Tarmogoyf's "card types among cards in all graveyards"
   * is `{}`; delirium's "in your graveyard" is `{ ownedBy: "you" }`). A
   * multi-face card has its front face's types there (rule 712.8a). */
  | { readonly cardTypesInGraveyard: CardFilter }
  /**
   * How many cards the resolving spell or ability has made players
   * **discard, draw or mill**, or permanents **sacrifice**, so far — "draw a
   * card for each card discarded this way", "that many cards plus one". Every
   * step before this one counts, including one that waited on a player's
   * choice. `who` narrows whose (default: everyone's); `filter` narrows the
   * cards, as they are now (a discarded card in the graveyard it went to), a
   * sacrificed permanent as it last existed; `cardTypes` counts the card
   * types among them instead, each once (Kefka, Court Mage's "a card for each
   * card type among cards discarded this way").
   */
  /**
   * How many things of one of a player's this-turn lists there are — "for
   * each creature that died under your control this turn" (`"died"`), "the
   * number of times you descended this turn" (`"descended"`), permanents that
   * entered under your control (`"entered"`), permanents you sacrificed.
   * `who` is whose (default `"you"`); `filter` narrows them as the
   * `turn-history` condition does. See `TurnHistory`. `"discarded"` counts
   * the cards a player discarded ("draw a card for each card you've
   * discarded this turn" — Change of Fortune); `"to-graveyard"` what was put
   * into a player's graveyard, `from` / `notFrom` narrowing it by the zone it
   * came from ("the number of artifacts that were put into graveyards from
   * the battlefield this turn" — Structural Assault: `who: "each-player",
   * from: ["battlefield"], filter: { types: ["artifact"] }`). `target` reads
   * a player target slot's list instead of `who`'s ("cards that were put
   * into target player's graveyard from their library this turn" — Cruel
   * Calculations: `{ turnHistory: "to-graveyard", target: 0, from:
   * ["library"] }`).
   */
  | {
      readonly turnHistory: TurnHistoryKind;
      readonly who?: PlayerScope;
      readonly target?: number;
      readonly filter?: CardFilter;
      readonly from?: readonly ZoneType[];
      readonly notFrom?: readonly ZoneType[];
    }
  /** How many opponents the controller attacked with creatures this combat
   * — melee's "+1/+1 for each opponent you attacked with a creature this
   * combat" (rule 702.121): the players attackers were declared at
   * (`PlayerState.attackedThisCombat`), whether or not those creatures still
   * attack, and never one put onto the battlefield attacking (the
   * rulings). A planeswalker attacked isn't its controller. */
  | { readonly opponentsAttacked: true }
  /** How many creatures are attacking the player a per-player effect is
   * acting on — that player, not a planeswalker of theirs (rule 506.3):
   * Within Range's "each opponent loses life equal to the number of
   * creatures attacking **them**" is a `lose-life` to `"each-opponent"` of
   * this. Read as it resolves; a token stack counts as every token in it. */
  | { readonly attackingPlayer: "each" }
  /** How much damage sources the scope's players controlled dealt this turn
   * — see the `damage-dealt-this-turn` condition. */
  | {
      readonly damageDealtThisTurn: true;
      readonly who?: PlayerScope;
      readonly combat?: boolean;
      readonly colors?: readonly Color[];
    }
  | {
      readonly thisWay: ThisWayKind;
      /** Whose (see `ThisWayEntry.player`): a scope, or `"each"` — the
       * player a scoped effect is applied to, read once for each ("its
       * controller creates a token for each creature destroyed this way" is a
       * `create-token` with `who: "each-player"` and this). */
      readonly who?: PlayerScope | "each";
      readonly filter?: CardFilter;
      readonly cardTypes?: boolean;
      /** The **greatest** of the players' own counts rather than their sum
       * — Windfall's "draws cards equal to the greatest number of cards **a
       * player** discarded this way" (each player's entries summed, then the
       * largest; 0 with none). */
      readonly perPlayer?: "greatest";
      /** Add up this characteristic of the objects instead of counting them
       * — Reign of the Pit's "X is the **total power** of the creatures
       * sacrificed this way", Tip the Scales' "the sacrificed creature's
       * **toughness**". A permanent that left doing it is read as it last
       * existed on the battlefield (its ruling: a negative power counts as
       * negative), and a token stack that went whole counts once per
       * token. `"mana-value"` is Combustible Gearhulk's "the **total mana
       * value** of those cards" (milled): a card read where it went, if
       * that's a public zone (rule 701.17c), {X} counting 0 (rule 202.3e). */
      readonly sumOf?: "power" | "toughness" | "mana-value";
      /** The **greatest** of this characteristic among the objects instead
       * of their total, read as `sumOf` reads each — Heretic's Punishment's
       * "the greatest mana value among the milled cards", Ill-Timed
       * Explosion's "the greatest mana value among cards discarded this
       * way". 0 with none. */
      readonly greatestOf?: "power" | "toughness" | "mana-value";
      /** Only the objects sharing a mana value with **another** of them —
       * Vault 21: House Gambit's "for each of those cards that has the same
       * mana value as another card revealed this way". Each is read where it
       * is (a card revealed stays in its hand, shown; rule 701.20a), one
       * apiece, {X} as 0 (rule 202.3e). */
      readonly sharingManaValue?: true;
    }
  /**
   * One amount or another, by a condition read as the amount is — Urza's
   * Tower's "{T}: Add {C}. If you control an Urza's Mine and an Urza's
   * Power-Plant, add {C}{C}{C} instead" is `{ ifCondition: <both>, then: 3,
   * else: 1 }`. Asked from the effect's controller's side, as a
   * `conditional` effect's condition is (the source counts itself), so it
   * suits a mana ability, which can't be a `conditional`: the auto-payer and
   * a hand activation size it against the board as it stands.
   */
  | {
      readonly ifCondition: StaticCondition;
      readonly then: EffectAmount;
      readonly else: EffectAmount;
    };

/**
 * A ward cost (rule 702.21a) — "Ward {2}", "Ward—Pay 2 life.", "Ward—{2},
 * Pay 2 life.", "Ward—Sacrifice a Food.", "Ward—Discard a card.". **One**
 * compound cost: every part that is set is paid together, and the targeting
 * player either pays all of it or none (unlike an `"unless"` clause's
 * options, which are alternatives). See the `"ward"` {@link EffectSpec}.
 */
export interface WardCost {
  readonly mana?: string;
  readonly payLife?: number;
  /** "Sacrifice a legendary artifact or legendary creature" (Sauron),
   * "Sacrifice a Food" (Ygra). The payer picks which. `text` is the clause
   * as printed, without a trailing period ("Sacrifice a Food"). */
  readonly sacrifice?: {
    readonly filter: CardFilter;
    readonly count?: number;
    readonly text: string;
  };
  /** "Discard a card" (Arna Kenneruud): how many; the payer picks which. */
  readonly discard?: number;
  /** With `discard`: "Discard a card **at random**" (Alpharael,
   * Stonechosen) — no one picks which. */
  readonly discardAtRandom?: boolean;
  /** "Ward—Blight 2" (Auntie Ool): the payer puts two -1/-1 counters on a
   * creature they control (rule 701.68a), choosing which as they pay — the
   * `blight` effect. Payable only while they control a creature (701.68b). */
  readonly blight?: number;
}

/**
 * "Behold a [quality]" (rule 701.4a): "reveal a [quality] card from your hand
 * or choose a [quality] permanent you control on the battlefield". `filter`
 * is the quality, matched against the card in hand or the permanent —
 * `{ subtype: "Dragon" }` for "a Dragon" (a Dragon card, or a Dragon you
 * control: a kindred Dragon too), `{ type: "creature", subtype: "Gamma" }`
 * for "a Gamma creature". `text` is what's beheld, for prompts and labels:
 * `"a Dragon"`, `"three Elementals"`.
 *
 * `count` (default 1) is "behold three Elementals": that many **different**
 * objects, any mix of revealed cards and chosen permanents (the Kindle the
 * Inner Flame ruling) — a token stack is that many permanents.
 *
 * `exile` is "behold an Elf **and exile it**" (the Champions): the beheld
 * card or permanent is exiled as the cost is paid; a spell's is linked to the
 * permanent that spell becomes (rule 607.2q), whose "return the exiled card"
 * is `return-exiled-by-source { linked: "hand" }`. A token beheld this way
 * ceases to exist in exile (rule 111.7), so nothing comes back.
 *
 * Which object is asked with the `choose-from-zone` decision (its
 * `behold` set): its candidates are both zones' at once. With exactly as many
 * candidates as it takes, nothing is asked. A revealed card is shown to every
 * player (701.4a, rule 701.20a — `cards-revealed`). Whatever offers a
 * behold checks first that it can be done (`Game.canBehold`).
 */
export interface BeholdSpec {
  readonly filter: CardFilter;
  readonly text: string;
  readonly count?: number;
  readonly exile?: boolean;
  /** Not a behold at all but the same choice from the hand alone. With
   * `exile`, the pitch spells' "exile a blue card from your hand"
   * (`CardDefinition.alternativeCost.exileFromHand`, an evoke's): no reveal,
   * the card is simply exiled. Without, "reveal a Kithkin card from your
   * hand" as a cost (Lorwyn's "… or pay {3}", Dragons of Tarkir's "you may
   * reveal a Dragon card", the Martyrs' "Reveal X white cards" — rule
   * 701.20a): the cards are revealed and stay in the hand, asked with the
   * `choose-from-zone` decision's `"reveal"` destination. */
  readonly fromHand?: boolean;
  /** With `fromHand` and a `count`: the cards share a colour — Illuminated
   * Folio's "Reveal two cards from your hand that share a color". Only a
   * card with a colour that `count` of the matching cards have is offered
   * (colourless shares none — its ruling), and the choice is the
   * `choose-from-zone` decision's `together` rule `"share"` over each card's
   * colours, which the client already reads. */
  readonly shareColor?: boolean;
}

/** A ward cost as printed after "Ward" — "{2}" or "—{2}, Pay 2 life." — so a
 * card's ability text and the payment prompt read the same. */
export function wardCostText(cost: WardCost): string {
  const parts: string[] = [];
  if (cost.mana !== undefined) parts.push(cost.mana);
  if (cost.payLife !== undefined) parts.push(`Pay ${cost.payLife} life`);
  if (cost.sacrifice !== undefined) parts.push(cost.sacrifice.text);
  if (cost.discard !== undefined) {
    const random = cost.discardAtRandom === true ? " at random" : "";
    parts.push(cost.discard === 1 ? `Discard a card${random}` : `Discard ${cost.discard} cards${random}`);
  }
  if (cost.blight !== undefined) parts.push(`Blight ${cost.blight}`);
  const onlyMana = cost.mana !== undefined && parts.length === 1;
  return onlyMana ? ` ${cost.mana}` : `—${parts.join(", ")}.`;
}

/** One way out of an `"unless"` clause, or one thing an `"each-player-may"`
 * player may do. Exactly one field is set. Each is offered only to a player
 * who can do all of it (rule 118.3): mana they can pay, at least that much
 * life, a permanent to sacrifice, enough cards in hand, a matching card in
 * hand. */
/**
 * `times` on an {@link UnlessOption}: that cost paid this many times over,
 * read as the effect applies — cumulative upkeep's "pay [cost] for each age
 * counter on it" (rule 702.24a): the mana repeated, the life multiplied, that
 * many more to sacrifice. One when absent. Fixed into the bound option, whose
 * `text` then shows the total.
 */
export type UnlessTimes = { readonly times?: EffectAmount };

export type UnlessOption =
  | ({
      readonly pay: string;
      readonly text: string;
      /** Written with `{X}` (a bound `payGeneric`): "spend this mana only on
       * costs that contain {X}" pays it, though the X is a number by now
       * (Rosheen Meanderer's ruling). Never authored. */
      readonly paysX?: true;
      /** "…unless its controller pays {1} **and 1 life**" (Mundungu): life as
       * part of the same payment, all of it or none (rule 118.3). */
      readonly andLife?: number;
      /** "…unless you pay {G} for each wind counter on it. **If you pay**, …"
       * (Cyclone): what taking this option also does, as the chooser's effect
       * like the payment. */
      readonly ifPaid?: EffectSpec;
    } & UnlessTimes)
  /** "…unless that player pays {X}, where X is this creature's power"
   * (Esper Sentinel): that much generic mana, read as the effect applies —
   * `{X}` in `text` shows the amount. A mana option like `pay`. */
  | { readonly payGeneric: EffectAmount; readonly text: string }
  /** "…unless they pay **that creature's mana cost**" (Tariff), "any other
   * player may pay **that spell's mana cost**. If a player does, counter the
   * spell" (Ice Cave, with `ifPaid`): the mana cost of the object this names,
   * read as the effect applies, a mana option like `pay`. An {X} in it is the
   * value chosen for a spell on the stack and 0 for anything else (rule
   * 107.3h). No mana cost is an unpayable cost (rules 118.6, 202.1b), and
   * isn't offered. `{X}` in `text` shows the cost. */
  | { readonly payManaCostOf: EffectTargetRef; readonly text: string; readonly ifPaid?: EffectSpec }
  /** Any effect, done by the chooser — "you" in it is them: "…unless its
   * controller **exiles all cards from their graveyard**" (Grip of Amnesia),
   * "**discards their hand**" (Perplex), "**discards a land card**" (Cursed
   * Monstrosity), "**puts a card from their hand on top of their library**"
   * (Tainted Specter). Offered as a `may` of it would be (`mayBeDone`): an
   * instruction that can be done as far as it goes, with nothing to do
   * included (exiling an empty graveyard), but not "a card" with none. */
  | { readonly doing: EffectSpec; readonly text: string }
  | ({ readonly payLife: number; readonly text: string } & UnlessTimes)
  /** "…unless its controller pays life **equal to its toughness**" (Essence
   * Vortex): that much life, read as the effect applies — `{X}` in `text` shows
   * the amount. A life option like `payLife`. */
  | { readonly payLifeAmount: EffectAmount; readonly text: string }
  /** "…unless you pay {E}{E}" (Rush of Inspiration): that much energy (rule
   * 107.14), offered only with that much. */
  | { readonly payEnergy: number; readonly text: string }
  /** "…unless the player puts a -1/-1 counter on a creature they control"
   * (Thelon's Chant): one counter of the kind `putCounter` names, on a
   * permanent of the chooser's matching `on`, their choice of which. "You" in
   * `on` is the chooser. */
  | { readonly putCounter: string; readonly on: CardFilter; readonly text: string }
  /** "…unless you return an untapped Plains you control to its owner's hand"
   * (Karoo): a permanent matching this, the chooser's choice of which. "You" is
   * the chooser. */
  | { readonly returnToHand: CardFilter; readonly text: string }
  /** "…unless you tap an untapped permanent you control" (Command Bridge):
   * a permanent matching this (so with `tapped: false`), the chooser's choice
   * of which. "You" is the chooser. */
  | { readonly tapPermanent: CardFilter; readonly text: string }
  /** "…unless that player sacrifices **it**" (Enchanter's Bane), "**that
   * artifact**" (Curse Artifact): a given permanent, offered only while the
   * chooser controls it (rule 701.21a). No choice of which. */
  | { readonly sacrificeThat: EffectTargetRef; readonly text: string }
  /** `exceptSource`: "sacrifice **another** creature" (Ziatora, the
   * Incinerator) — never the effect's own source. `count`: "sacrifice **two**
   * Blood tokens" (Strefan, Maurer Progenitor; Rakdos, Patron of Chaos) —
   * offered only to a player with that many to sacrifice (rule 118.3), who
   * then chooses which. One when absent. */
  | ({
      readonly sacrifice: CardFilter;
      readonly count?: number;
      readonly exceptSource?: boolean;
      /** "Its controller loses 3 life unless they sacrifice **another** nonland
       * permanent" (Torment of Venom): never the object in this target slot. */
      readonly exceptTarget?: number;
      /** One of forage's two ways (rule 701.61a) — see `forageOptions()`. */
      readonly forage?: true;
      readonly text: string;
    } & UnlessTimes)
  /** "Exile N cards from your graveyard", the player's choice of which —
   * forage's other way (rule 701.61a), offered only with that many there.
   * `forage` marks it as foraging, which "whenever you forage" sees. */
  | { readonly exileFromGraveyard: number; readonly forage?: true; readonly text: string }
  /** "…or discard a card" (Tergrid's Lantern, Torment of Hailfire). */
  | { readonly discard: number; readonly text: string }
  /** "Put a land card from your hand onto the battlefield" (Kynaios and
   * Tiro of Meletis). */
  | { readonly putFromHand: CardFilter; readonly text: string }
  /** "Any player may have Browbeat **deal 5 damage to them**": the effect's
   * source deals that much damage to the player who takes it. Always open —
   * being dealt damage needs nothing (prevented, it was still chosen). */
  | { readonly takeDamage: number; readonly text: string };

/** Which permanents a `copy-spell`'s `forEachItCouldTarget` makes a copy for.
 * `chooseAndPayEach`: "you may choose any number of other creatures that spell
 * could target and pay {2} for each of those creatures. If you do, for each of
 * those creatures, copy that spell" (Feather, Radiant Arbiter): the copier picks
 * as many as they can pay for, in the order the copies go on the stack. */
export interface CopyForEach {
  readonly filter: CardFilter;
  readonly other?: true | "targeted";
  readonly chooseAndPayEach?: string;
}

/** An {@link UnlessOption} with any generic or life amount fixed — what the
 * engine offers. `"each-player-may"`'s options are these already. */
export type BoundUnlessOption = Exclude<
  UnlessOption,
  | { readonly payGeneric: EffectAmount }
  | { readonly payLifeAmount: EffectAmount }
  | { readonly payManaCostOf: EffectTargetRef }
>;

/**
 * How far an `"each-player-may"` has got — set by the engine on the copy it
 * parks between one player's answer and the next question. Never authored.
 */
/** A `put-on-libraries` parked between its questions: the cards, fixed as
 * it began, each as the object it was then (rule 400.7); the owners still to
 * choose which of theirs go on the bottom, and what those before them chose;
 * and, once everything has moved, the orders still to ask. */
export interface PutOnLibrariesProgress {
  readonly cards: readonly { readonly object: ObjectId; readonly zoneChangeCount: number }[];
  readonly toAsk: readonly PlayerId[];
  readonly bottom: readonly ObjectId[];
  /** Whether an owner's choice is waiting for `takeKept`. */
  readonly asked?: true;
  readonly orders?: readonly LibraryOrderStep[];
}
/** One owner's cards to order on one end of their library (rule 401.4). */
export interface LibraryOrderStep {
  readonly player: PlayerId;
  readonly cards: readonly ObjectId[];
  readonly position: "top" | "bottom";
}

export interface EachPlayerMayProgress {
  /** The `eventSeq` it began at: a player's answer is the first
   * `modes-chosen` event by them for this source since. */
  readonly since: number;
  /** Asked so far, in the order asked. */
  readonly asked: readonly PlayerId[];
  /** Still to ask. */
  readonly toAsk: readonly PlayerId[];
  /** Once everyone has answered: the follow-ups still to apply. */
  readonly results?: readonly { readonly player: PlayerId; readonly did: boolean }[];
}

/** A `move-counters` end chosen as it resolves — see that effect. */
export interface MoveCountersChooser {
  /** Permanents matching this from the controller's side. */
  readonly choose: CardFilter;
  /** What the `choose-permanents` decision says. */
  readonly prompt: string;
}

/**
 * How far an `"any"` `move-counters` has got — set by the engine on the copy
 * each of its decisions carries on with. Never authored. The ends are object
 * ids: nothing else happens while the effect resolves (rule 608.2), so
 * neither can change zones in between, and each was singled out of a token
 * stack as it was fixed.
 */
export interface MoveCountersProgress {
  readonly from?: ObjectId;
  readonly to?: ObjectId;
  /** Permanents already chosen for the chosen end, not offered again. */
  readonly used: readonly ObjectId[];
  /** Counters moved so far — `ifMoved`, `"one-or-more"`. */
  readonly moved: number;
  /** The kinds still to ask about for the current pair of ends. */
  readonly kinds?: readonly string[];
  /** The move the answer to the last question asked for. */
  readonly pending?: { readonly counter: string; readonly amount: number };
  /** The `choose-permanents` answer is this copy's target 0. */
  readonly picking?: true;
}

/**
 * How far a `remove-counters` from a targeted **player** has got — set by
 * the engine on the copy each `choose-modes` answer carries on with. Never
 * authored. The player was the target as it began; nothing else happens
 * while the effect resolves (rule 608.2), so their counters don't change in
 * between.
 */
export interface PlayerCounterRemovalProgress {
  readonly player: PlayerId;
  /** Counters still to be chosen at most (`null`: any number). */
  readonly left: number | null;
  /** Counters that must still be chosen (0 with "up to"). */
  readonly least: number;
  /** The kinds still to ask about, each with how many the player has. */
  readonly kinds: readonly { readonly kind: string; readonly n: number }[];
  /** What's been chosen so far, removed together once every kind is asked. */
  readonly chosen: Readonly<Record<string, number>>;
}

/** @deprecated Use {@link CardFilter} directly — kept as an alias so existing
 * `look-and-choose` / `matchesZoneChoiceFilter` call sites still type-check. */
export type ZoneChoiceFilter = CardFilter;

/**
 * The placeholder a `choose-creature-type` effect's `then` uses for the type
 * that ends up chosen — e.g. `{ notSubtypes: [CHOSEN_CREATURE_TYPE] }` for
 * Crippling Fear's "creatures that aren't of the chosen type". Substituted
 * into `then` by value (see `substituteChosenCreatureType`) before it applies.
 */
export const CHOSEN_CREATURE_TYPE = "$chosen";

/** The first of two nested choices' placeholder — see `choose-creature-type`'s
 * `sentinel`. */
export const FIRST_CHOSEN_TYPE = "$chosenFirst";

/**
 * A copy of `spec` with every string exactly equal to `CHOSEN_CREATURE_TYPE`
 * replaced by `creatureType`. `EffectSpec` is plain data, so a structural walk
 * reaches every filter, subtype list and nested effect without the individual
 * effects needing to know a choice is involved.
 */
export function substituteChosenCreatureType(spec: EffectSpec, creatureType: string): EffectSpec {
  return substituteChosen(spec, CHOSEN_CREATURE_TYPE, creatureType);
}

/**
 * The placeholders a `choose-value` effect's `then` uses for the value that
 * ends up chosen, substituted by value (`substituteChosen`) before it applies:
 * Persecute's `{ colors: [CHOSEN_COLOR] }`, Blood Oath's `{ type:
 * CHOSEN_CARD_TYPE }`, Ichormoon Gauntlet's `add-counter` of `counter:
 * CHOSEN_COUNTER`. Typed as what they stand in for, so a card can write them
 * where a colour or card type goes; nothing reads one unsubstituted but a
 * spec that never resolved (a bot's look at the text), where it matches
 * nothing. A chosen number needs none: `then` reads it as `"x"`.
 */
export const CHOSEN_COLOR = "$chosenColor" as Color;
export const CHOSEN_CARD_TYPE = "$chosenCardType" as CardType;
export const CHOSEN_COUNTER = "$chosenCounter";
/** A `change-text`'s word, as each of its two choices is answered. */
export const CHOSEN_TEXT_WORD = "$chosenTextWord";

/** The card types a "choose a card type" offers (rule 205.2a), in the
 * rule's order. */
export const CARD_TYPE_CHOICES: readonly CardType[] = [
  "artifact",
  "battle",
  "creature",
  "enchantment",
  "instant",
  "kindred",
  "land",
  "planeswalker",
  "sorcery",
];

/**
 * A copy of `spec` with every string exactly equal to `sentinel` replaced by
 * `value`. `EffectSpec` is plain data, so a structural walk reaches every
 * filter, subtype list and nested effect without the individual effects
 * needing to know a choice is involved.
 */
export function substituteChosen(spec: EffectSpec, sentinel: string, chosen: string): EffectSpec {
  const walk = (value: unknown): unknown => {
    if (value === sentinel) return chosen;
    if (Array.isArray(value)) return value.map(walk);
    if (value !== null && typeof value === "object") {
      return Object.fromEntries(Object.entries(value).map(([k, v]) => [k, walk(v)]));
    }
    return value;
  };
  return walk(spec) as EffectSpec;
}

/**
 * The placeholder a `choose-card-name` effect's `then` uses for the name
 * that ends up chosen — `{ hasName: CHOSEN_CARD_NAME }` is "a card with the
 * chosen name" (Memoricide's search, Brain Pry's discard). Substituted into
 * `then` by value (`substituteChosenCardName`) before it applies.
 */
export const CHOSEN_CARD_NAME = "$chosenName";

/**
 * The placeholder for what a `vote` or `choose` was for — see the
 * `"with-choices"` {@link EffectSpec}. In a list it stands for every option
 * chosen; on its own, for one.
 */
export const CHOSEN_THIS_WAY = "$chosenThisWay";

/** A copy of `spec` with `CHOSEN_THIS_WAY` replaced by `chosen`: spread into
 * a list it's in, the first of them anywhere else (an empty string when
 * nothing was chosen, which matches nothing). */
export function substituteChosenThisWay(spec: EffectSpec, chosen: readonly string[]): EffectSpec {
  const walk = (value: unknown): unknown => {
    if (value === CHOSEN_THIS_WAY) return chosen[0] ?? "";
    if (Array.isArray(value)) return value.flatMap((v) => (v === CHOSEN_THIS_WAY ? [...chosen] : [walk(v)]));
    if (value !== null && typeof value === "object") {
      return Object.fromEntries(Object.entries(value).map(([k, v]) => [k, walk(v)]));
    }
    return value;
  };
  return walk(spec) as EffectSpec;
}

/** What `CHOSEN_THIS_WAY` stands for, for one vote or choice: a named
 * option's (or a creature type's) text, a player's id. A permanent has no
 * text to substitute, and a number is read as `{ votedNumber }`. */
function voteChoiceText(choice: VoteChoice): string {
  if ("option" in choice) return choice.text;
  if ("player" in choice) return choice.player;
  return "";
}

/** The number `player` chose in the `vote` this resolution held. */
function votedNumberOf(votes: readonly Vote[], player: PlayerId | undefined): number | undefined {
  for (const { voter, choice } of votes) if (voter === player && "number" in choice) return choice.number;
  return undefined;
}

/** See the `{ votedNumber }` {@link EffectAmount}. */
function votedNumberAmount(
  which: Extract<EffectAmount, { votedNumber: unknown }>["votedNumber"],
  ctx: ResolutionContext,
): number {
  const votes = ctx.votes();
  if (which === "highest" || which === "lowest") {
    const numbers = votes.flatMap(({ choice }) => ("number" in choice ? [choice.number] : []));
    if (numbers.length === 0) return 0;
    return which === "highest" ? Math.max(...numbers) : Math.min(...numbers);
  }
  if (which === "that-player") return votedNumberOf(votes, ctx.playersInScope("that-player")[0]) ?? 0;
  const ref = ctx.targets[which];
  return (ref?.kind === "player" ? votedNumberOf(votes, ref.player) : undefined) ?? 0;
}

/** Does `spec` read `CHOSEN_THIS_WAY` anywhere? */
function readsChosenThisWay(spec: EffectSpec): boolean {
  return JSON.stringify(spec).includes(CHOSEN_THIS_WAY);
}

/** A copy of `spec` with every string exactly equal to `CHOSEN_CARD_NAME`
 * replaced by `name` — the same structural walk as the creature type's. */
export function substituteChosenCardName(spec: EffectSpec, name: string): EffectSpec {
  const walk = (value: unknown): unknown => {
    if (value === CHOSEN_CARD_NAME) return name;
    if (Array.isArray(value)) return value.map(walk);
    if (value !== null && typeof value === "object") {
      return Object.fromEntries(Object.entries(value).map(([k, v]) => [k, walk(v)]));
    }
    return value;
  };
  return walk(spec) as EffectSpec;
}

/**
 * Where a `reveal-until`'s revealed cards go: `"bottom-random"` (the bottom of
 * the library in a random order), `"bottom-any-order"` (in the order its owner
 * chooses, rule 401.4 — Erratic Explosion), `"graveyard"`, `"hand"` (Treasure
 * Hunt's "put all cards revealed this way into your hand"), `"exile"` (Sacred
 * Guide), `"shuffle"` (into the library, which is shuffled — "then shuffle") or
 * `"stay"` (exiled cards stay exiled; revealed ones stay on top).
 */
export type RevealedCardsGo = "bottom-random" | "bottom-any-order" | "graveyard" | "hand" | "exile" | "shuffle" | "stay";

/** A `reveal-until` waiting on a decision — see its `progress`. */
export interface RevealUntilProgress {
  readonly owner: PlayerId;
  readonly revealed: readonly ObjectId[];
  /** The card found, or `null` for none. */
  readonly hit: ObjectId | null;
  /** Whether the card found has been put where `put` says, and `then`
   * applied: the decision waited on is `then`'s, rather than the "as this
   * enters" choice of the card being put onto the battlefield. */
  readonly placed: boolean;
}

/**
 * What a gift gives (rules 702.174d–i): "Gift a Food" — the chosen player
 * creates a Food token; "a card" — they draw a card; "a tapped Fish" — they
 * create a tapped 1/1 blue Fish creature token; "an extra turn" — they take
 * an extra turn after this one; "a Treasure"; "an Octopus" — an 8/8 blue
 * Octopus creature token.
 */
export type GiftKind = "food" | "card" | "tapped-fish" | "extra-turn" | "treasure" | "octopus";

/** Which players an "each" / mass effect reaches. */
/**
 * What a spell or ability did "this way" — the cards it made players
 * discard, draw or mill, the permanents it made them sacrifice, and what it
 * destroyed (a destroy effect, not a creature dying of damage), exiled
 * (permanents and cards alike), returned to a hand, put into a graveyard
 * (cards — tokens aren't) or put onto the battlefield from a zone (not a
 * token created) — read off the events of the resolution so far (see
 * `GameState.resolutionSince` and `this-way.ts`). The `thisWay`
 * {@link EffectAmount} counts them, the `this-way` condition asks about them
 * and the `thisWay` filter clause picks among them.
 */
/**
 * What deals an effect's damage when it isn't the effect's own source:
 * `"trigger-object"`, the object that fired the trigger, or `{ target }`, a
 * target slot's permanent — Chandra's Ignition's "**target creature you
 * control** deals damage equal to its power to each other creature and each
 * opponent" (that creature is the source, not the spell: its colours count
 * for protection, its lifelink and deathtouch apply — the rulings). Read as
 * it last existed on the battlefield if it has left (rule 608.2h); a blank
 * slot (an illegal target, rule 608.2b) deals nothing. `"granter"`: the
 * permanent whose static granted this ability (see {@link EffectTargetRef})
 * — Ninja's Kunai's granted "Sacrifice Ninja's Kunai: Ninja's Kunai deals 3
 * damage to any target", dealt by the Equipment as it last existed.
 */
export type DamageFrom = "trigger-object" | "granter" | "attached" | { readonly target: number };

/**
 * A one-shot prevention or redirection effect over a set of damage events
 * for a duration (rules 614.9, 615) — "prevent all combat damage that would
 * be dealt by target creature this turn" (Kor Haven: `{ by: { target: 0 },
 * combat: true }`), "prevent all damage that would be dealt to you and
 * creatures you control this turn by creatures" (Eerie Interference: `{ to:
 * { players: "you", permanents: { type: "creature", controlledBy: "you" } },
 * by: { filter: { type: "creature" } } }`), "until your next turn, prevent
 * all damage that would be dealt to and dealt by target permanent" (two
 * rules, Dovin's −1), "all combat damage that would be dealt to you this
 * turn is dealt to target attacking creature instead" (Turn the Tables:
 * `redirectTo: 0`). Which damage it covers is asked as the damage would be
 * dealt (615.1), so a creature that arrives later is covered.
 */
export interface DamageRuleSpec {
  readonly kind: "damage-rule";
  /** The recipients: one target (a slot, `"source"`, `"trigger-object"`,
   * `"attached"`), and/or `players` ("you", "each", "opponents") and/or
   * permanents matching `permanents` from the controller's side — any of
   * them counts ("this creature and/or you" — Glarecaster) — but not
   * `exceptTarget`. Omitted: any recipient. */
  readonly to?: {
    readonly target?: EffectTargetRef;
    readonly players?: "you" | "each" | "opponents";
    readonly permanents?: CardFilter;
    readonly exceptTarget?: EffectTargetRef;
  };
  /** The sources: one object (a creature, or a spell on the stack —
   * Reverberation), or those matching `filter` from the controller's side,
   * but not `exceptTarget` (Terrifying Presence). Omitted: any source. */
  readonly by?: {
    readonly target?: EffectTargetRef;
    readonly filter?: CardFilter;
    readonly exceptTarget?: EffectTargetRef;
  };
  /** Only combat (`true`) or noncombat (`false`) damage. */
  readonly combat?: boolean;
  /** `"all"` (the default) for every such damage event while it lasts;
   * `"next-time"`, the whole of the next one (615.8); an amount, the next
   * that much damage in all (615.7 — Festival of the Guildpact's X). */
  readonly amount?: "all" | "next-time" | EffectAmount;
  /** `"end-of-turn"` (the default); `"until-your-next-turn"`; `"while-source"`
   * — for as long as the source stays on the battlefield (Old Fat Spider
   * Can't See Me). */
  readonly duration?: "end-of-turn" | "until-your-next-turn" | "while-source";
  /** A redirection instead (614.9): dealt by the same source to this target
   * slot, `"source"` or `"you"`; `"source-controller"` (Mirror Strike) or
   * `"source-itself"` (Shield Dancer) are worked out as the damage would be
   * dealt. */
  readonly redirectTo?: EffectTargetRef | "you" | "source-controller" | "source-itself";
  /** Prevention's additional effect (615.5), right after: `"x"` is the
   * damage it prevented, the spell's targets are its own, and the damage's
   * source is `"trigger-object"` (its controller `who: "trigger-controller"`)
   * — Temper's "for each 1 damage prevented this way, put a +1/+1 counter on
   * that creature", Comeuppance's damage back. Once per damage event. */
  readonly then?: EffectSpec;
  /** "You gain life equal to the damage prevented this way". */
  readonly gainLifePrevented?: true;
}

/** A `damage-rule` with its references resolved, as `EffectApi.addDamageRule`
 * takes it. */
export interface ResolvedDamageRule {
  readonly target?: TargetRef;
  readonly players?: "you" | "each" | "opponents";
  readonly permanents?: CardFilter;
  readonly exceptRecipient?: ObjectId;
  readonly from?: ObjectId;
  readonly byFilter?: CardFilter;
  readonly exceptSource?: ObjectId;
  readonly combat?: boolean;
  readonly amount: "all" | "next-time" | number;
  readonly duration: "end-of-turn" | "until-your-next-turn" | "while-source";
  readonly redirect?: TargetRef;
  readonly redirectToSource?: "itself" | "controller";
  readonly then?: EffectSpec;
  readonly gainLifePrevented?: true;
}

export type ThisWayKind =
  | "discarded"
  | "drawn"
  | "milled"
  | "sacrificed"
  | "destroyed"
  /** Destroyed and put into a graveyard: "if that creature dies this way". */
  | "died"
  | "exiled"
  /** Cards it exiled from a hand — Lost Legacy's "that player shuffles, then
   * draws a card **for each card exiled from their hand this way**" after a
   * search of their graveyard, hand and library. Counted by the card's
   * owner. */
  | "exiled-from-hand"
  | "returned-to-hand"
  /** Cards it put into a hand from any other zone, not by drawing them — a
   * library search's find (Courier of Comestibles' "if you don't put a card
   * into your hand this way"), a look's pick (Adventure Awaits' "if you
   * didn't put a card into your hand this way, draw a card"), a milled
   * card taken back (Cache Grab's "returned a Squirrel card to your hand
   * this way"), a return. Only a card still in that hand
   * (`GameObject.handArrivalSeq`), counted by its owner, whose hand it is
   * (rule 400.3). */
  | "put-into-hand"
  | "put-into-graveyard"
  | "put-onto-battlefield"
  /** Tokens it created (a compacted stack as each of its tokens). */
  | "created"
  /** Cards it had a player put from their hand on the bottom of their
   * library — Valakut Awakening's "then draw **that many** cards plus one",
   * Teferi's Puzzle Box's "then draws that many cards". Counted by the
   * player whose hand they left. */
  | "put-on-bottom"
  /** Cards it shuffled into a library — Elixir's "you gain life equal to
   * the number of cards shuffled into your library this way" (a
   * `shuffle-graveyard-into-library`, or `put-on-libraries`' `"shuffle"`).
   * Counted by the library's owner. */
  | "shuffled-into-library"
  /** Permanents it gave a new controller (`control-changed`) — Coveted
   * Falcon's "for each one they gained control of this way", Kain's "If they
   * do". Counted by the new controller; a stack changes hands whole. A player
   * who already controlled it didn't gain it. */
  | "gained-control"
  /** Permanents a control-changing effect of this resolution applied to,
   * whether or not they changed hands — "Untap them", "Untap those creatures"
   * (Broadcast Takeover; Mob Rule, whose ruling says they include the ones you
   * already controlled, whatever their power has become by then). Counted by
   * the controller now. */
  | "control-effect"
  /** Permanents it tapped — Myr Battlesphere's "you may tap X untapped Myr
   * you control. If you do, this creature gets +X/+0": a `choose-permanents`
   * tapping them, then this. One already tapped isn't tapped again, and so
   * isn't counted. */
  | "tapped"
  /** Counters it removed, counted one by one — Garnet, Princess of
   * Alexandria's "for each lore counter removed this way", Mister Hyde's "If
   * you do" (a `remove-counters` effect's, or a `remove-counter`'s). As an
   * amount with no `filter` or `sumOf`, the counters a player lost count too
   * (a `remove-player-counters` — rule 122.1): Leeches' "loses all poison
   * counters … deals that much damage". */
  | "counters-removed"
  /** Permanents it put a counter on — Ripples of Potential's "permanents you
   * control that had a counter put on them this way", after a proliferate.
   * A player isn't one. */
  | "counters-put"
  /** Cards it revealed from a library or a hand — parley's "for each nonland card
   * revealed this way" (an ability word, rule 207.2c), a `reveal-top` with
   * `who` and this
   * with `filter: { notTypes: ["land"] }`. Counted by the player who
   * revealed them. */
  | "revealed"
  /** Cards a player picked in a choice from a zone (a `look-and-choose`'s
   * picks — the `cards-chosen-from-zone` event), wherever they then went:
   * a processor's "you may put a card an opponent owns from exile into that
   * player's graveyard. **If you do**, …" holds though a replacement exiled
   * the card again instead (Rest in Peace — the processors' ruling: "you can
   * still put an exiled card into its opponent's graveyard"). Counted by the
   * player who chose.
   *
   * And permanents chosen or voted for in a `vote` it held, each counted
   * once, read from the moment they're chosen: Divine Reckoning's "each
   * player chooses a creature they control. Destroy the rest" (`notThisWay`),
   * Fortunate Few's "that hasn't been chosen this way", Druid of
   * Purification's "destroy each permanent chosen this way" (`thisWay`). One
   * token of a stack is its own object here, singled out as it's chosen. */
  | "chosen";

export type PlayerScope =
  | "each-player"
  | "each-opponent"
  | "you"
  /** Whoever's turn it is — "that player" in a trigger that fires on someone
   * else's step (Archfiend of Depravity). */
  | "active-player"
  /** The controller of the object behind the trigger — "that player" when
   * the event is about something they did: the player who drew the card
   * (Nekusar, the Mindrazer), the player who cast the spell. Not a target,
   * so a hexproof player is still reached. */
  | "trigger-controller"
  /** The owner of the object behind the trigger — "that player" where the
   * event is about a card's own zones: "whenever a permanent is returned to a
   * player's hand, **that player** discards a card" (Warped Devotion), "put
   * into a player's graveyard from the battlefield" (Liability). Not its last
   * controller; an owner never changes (rule 108.3), and a token's is known
   * as it last existed. Not a target. */
  | "trigger-owner"
  /** The player the triggering event names — "that player" / "defending
   * player": the player dealt damage (or the controller of the permanent
   * dealt damage), the defending player of an attack. See
   * `LastKnownRefs.player`. Nobody outside such a trigger. Not a target. */
  | "trigger-player"
  /** Each opponent of the effect's controller **other than** the
   * `"trigger-player"` — Kediss, Emberclaw Familiar's "it deals that much
   * damage to each other opponent". Every opponent when the trigger names
   * nobody. */
  | "each-other-opponent"
  /** The effect's controller, then each of their opponents attacking the
   * `"trigger-player"` — a Curse's "Whenever enchanted player is attacked,
   * create a Gold token. **Each opponent attacking that player does the
   * same**" (Curse of Opulence). A player is attacking another if they
   * control a creature attacking them (the Curses' ruling), read as it
   * resolves: with none attacking them any more, only the controller. */
  | "you-and-opponents-attacking-trigger-player"
  /** "Each opponent who voted for a choice you voted for" (Erestor of the
   * Council): each opponent with a vote for a choice one of the effect's
   * controller's votes was for, in turn order — read off the `vote` this
   * resolution held, or the one that fired a "whenever players finish
   * voting" trigger. Nobody, with no vote. */
  | "opponents-who-voted-with-you"
  /** "**You and** each opponent who voted for a choice you voted for" (Model
   * of Unity): the effect's controller with those opponents, in turn order
   * from the active player. */
  | "you-and-opponents-who-voted-with-you"
  /** "**The chosen player**": the player chosen for the effect's source — as
   * it entered (`CardDefinition.choosePlayerOnEnter`: Black Vise, Saskia the
   * Unyielding) or the last one an ability of it chose and kept
   * (`choose-opponent { remember }`) — `GameObject.chosenPlayer`, read as
   * the source last existed if it has left (rule 608.2h). Nobody when none
   * was chosen or they've left the game. Not a target. Only a resolution
   * knows its source, so elsewhere it names nobody. */
  | "chosen-player"
  /** "**Enchanted creature's controller**": whoever controls the permanent the
   * effect's source is attached to as this resolves (Gremlin Infestation). The
   * source and its host gone together, the host as it last existed (rule
   * 608.2h); an Aura left behind first last existed attached to nothing, and
   * names nobody. A sentence that goes on once the host may have left names
   * the player first, a `for-each-player` of this with `"that-player"` inside:
   * Strangling Grasp's "enchanted permanent's controller sacrifices …, then
   * that player loses 1 life". On a Curse it's the enchanted player. Not a
   * target. Only a resolution knows its source, so elsewhere it names nobody. */
  | "attached-controller"
  /** "**Each of that player's opponents**" / "each other player", of the
   * `"trigger-controller"`: the opponents of the player who cast the spell
   * (Standstill, Heartwood Storyteller; every other player is an opponent,
   * rule 102.2) or who last controlled the permanent the event is about
   * (Bounty Board's "each of its controller's opponents"). The effect's own
   * controller is one of them unless they're that player. Nobody when the
   * trigger is about no one. Not a target. */
  | "opponents-of-trigger-controller"
  /** "That player" in an `"each-player-may"`'s `ifDid` / `ifDidnt`: the
   * player the follow-up is about. Elsewhere, the same as
   * `"trigger-player"`. Not a target. */
  | "that-player";

/**
 * One player an effect names as the one who does something — who gains
 * control (`gain-control`), under whose control a card is put onto the
 * battlefield (`put-onto-battlefield`), who puts the counters (`add-counter`)
 * or untaps it (`untap`):
 * the effect's controller (`"you"`), a player target slot (`{ target: n }`),
 * or one of the single-player {@link PlayerScope}s the event names. Naming
 * nobody — an empty or illegal slot (rule 608.2b), a player who has left the
 * game — the effect does nothing.
 */
export type EffectPlayerRef =
  | "you"
  | "active-player"
  | "trigger-controller"
  | "trigger-owner"
  /** The owner of the effect's source, wherever it is now — "Gandalf's owner
   * shuffles him into their library and draws three cards". */
  | "source-owner"
  | "trigger-player"
  | "that-player"
  /** The player chosen for the effect's source — see the `"chosen-player"`
   * {@link PlayerScope}. */
  | "chosen-player"
  /** The controller of what the source is attached to — see the
   * `"attached-controller"` {@link PlayerScope}. */
  | "attached-controller"
  | { readonly target: number }
  /** The controller of the permanent in this target slot, as it last existed
   * on the battlefield if it has left — "**its controller** exiles cards …,
   * then **they** may cast that card" (Transforming Flourish, after
   * destroying it). Not a target. A spell that has left the stack (countered)
   * is read as it last was there: its controller then, not its owner
   * (Counterbore's ruling). */
  | { readonly controllerOfTarget: number }
  /** The owner of the object in this target slot — never changes (rules
   * 108.3, 111.2), so it's known once the object has moved: "choose target
   * card in a graveyard … search **its owner's** graveyard, hand, and
   * library" (Surgical Extraction). Not a target. */
  | { readonly ownerOfTarget: number };

/** One player a target slot names, as a `for-each-player` or a `vote`'s
 * chooser: the player in it ("target opponent exiles …"), or the controller
 * or owner of the object in it ("its controller chooses …"). Nobody when the
 * slot is illegal (rule 608.2b) or the player has left the game. */
export type ChosenPlayerRef = Extract<EffectPlayerRef, object>;

/**
 * What a creature put onto the battlefield attacking attacks (rule 508.4).
 * `"choose"`: its controller chooses a defending player or a planeswalker one
 * controls, for each creature — asked only when there's more than one
 * (`enter-attacking` decision). `{ player }`: the effect names the player
 * ("tapped and attacking that player" — Ainok Strike Leader), and with
 * `orTheirPlaneswalker` their planeswalkers are options too ("…that player or
 * a planeswalker they control" — Adeline, myriad).
 *
 * Only a creature controlled by the attacking player, during combat, ever
 * ends up attacking (rule 506.3a-c): anything else just enters. It was never
 * declared, so it never "attacked" (508.3a) and no attack requirement or
 * restriction applies to it (508.4c). Entering after blockers are declared,
 * it's unblocked (508.4d).
 */
export type EnterAttacking =
  | "choose"
  | { readonly player: EffectPlayerRef; readonly orTheirPlaneswalker?: boolean };

/** {@link EnterAttacking} with its player resolved, as `Game` takes it —
 * or `defender`, one exact player, planeswalker or battle (ninjutsu's "the
 * same … as the creature that was returned", rule 702.49c), attacked only
 * if it can still be (508.4a). */
export type ResolvedEnterAttacking =
  | "choose"
  | { readonly player: PlayerId | undefined; readonly orTheirPlaneswalker: boolean }
  | { readonly defender: PlayerId | ObjectId };

/**
 * How long a permission to play an exiled card lasts, whatever it's over — an
 * `impulse-exile`'s cards or an `exile`'s `mayCast` — see `GameObject.impulse`:
 *
 * - `"end-of-turn"`: this turn.
 * - `"your-next-turn"`: "until the end of your next turn" (Tectonic Giant).
 * - `"your-next-turn-only"`: "during your next turn" (Galvanic Relay): not
 *   before it either, this turn if it's yours included.
 * - `"your-next-end-step"`: "until your next end step" (Rocco, Street Chef),
 *   ending as that step begins.
 * - `"until-end-of-combat-your-next-turn"`: Brazen Cannonade's.
 * - `"until-next-exile"`: "until you exile another card with this" (Unstable
 *   Amulet), ending when this stint of the source next does. Its leaving
 *   doesn't end it (the ruling).
 * - `"while-source"`: for as long as the permanent is on the battlefield
 *   (Theater of Horrors).
 * - `"while-you-control"`: "for as long as you control this" (Lightning,
 *   Security Sergeant), over for good once you don't (the ruling).
 * - `"while-exiled"`: "for as long as it remains exiled".
 * - `"until-your-next-turn"`: "until your next turn", over as that turn begins
 *   (Nivix, Aerie of the Firemind), where `"your-next-turn"` runs to its end.
 * - `"until-your-next-upkeep"`: "until the beginning of your next upkeep"
 *   (Elkin Bottle).
 */
export type ImpulseDuration =
  | "end-of-turn"
  | "until-your-next-turn"
  | "until-your-next-upkeep"
  | "your-next-turn"
  | "your-next-turn-only"
  | "your-next-end-step"
  | "until-end-of-combat-your-next-turn"
  | "until-next-exile"
  | "while-source"
  | "while-you-control"
  | "while-exiled";

/**
 * A permission over a card an effect has just put into exile — `exile`'s and
 * `discard-chosen`'s `mayCast`, `look-and-choose`'s `playable`. It rides on
 * the card (`GameObject.impulse`) and ends with any move.
 *
 * - `duration`: how long, see {@link ImpulseDuration}, read from the side of
 *   the player it's given to ("until the end of **their** next turn").
 * - `spendAs`: the spending rule for that cast alone (rule 118.14).
 * - `play`: on `mayCast`, "you may **play** it", a land too (rule 305.1), not
 *   only cast it. A `playable` plays unless `castOnly`: "you may **cast** that
 *   card" (Gonti, Lord of Luxury), a land staying where it is.
 * - `byOwner`: "**its owner** may play it" (Soul Partition, Elite Spellbinder),
 *   not the effect's controller. On a `look-and-choose`, the chooser, who owns
 *   what's in their own hand (rule 400.3).
 * - `free`: "… may cast it **without paying its mana cost**" (Release to the
 *   Wind), and only that way.
 * - `tax`: "a spell cast this way costs {N} more to cast" (Elite Spellbinder),
 *   an increase, so before any reduction (rule 601.2f); `opponentsOnly`: "a
 *   spell cast **by an opponent** this way" (Soul Partition), of the effect's
 *   controller.
 * - `landsEnterTapped`: "each land played this way enters tapped" (Lightstall
 *   Inquisitor).
 */
export interface ExilePermission {
  readonly duration: ImpulseDuration;
  readonly spendAs?: SpendAs;
  readonly play?: true;
  readonly castOnly?: true;
  readonly byOwner?: true;
  readonly free?: true;
  readonly tax?: { readonly generic: number; readonly opponentsOnly?: true };
  readonly landsEnterTapped?: true;
}

/** One row of a die roll's results table (rule 706.3a): a result from `min`
 * to `max` (any result from `min` up, without one) gets `effect`. */
export interface DieResultRow {
  readonly min: number;
  readonly max?: number;
  readonly effect: EffectSpec;
}

/** See the `take-extra-turn` {@link EffectSpec}'s `thatTurn`. */
export interface ExtraTurnScope {
  readonly damageCantBePrevented?: true;
  readonly atEndStep?: { readonly effect: EffectSpec; readonly text: string };
}

/** A declarative effect. Grows as milestones add vocabulary. */
/** What cascade found: the card it may cast, its name, and everything it
 * exiled on the way (the card included). */
export interface CascadeFound {
  readonly hit: ObjectId;
  readonly name: string;
  readonly exiled: readonly ObjectId[];
  /** The cascade spell's mana value: the spell cast must have less (rule
   * 702.85a — "the resulting spell's mana value"). */
  readonly threshold: number;
}

/** One exploration (rule 701.44): who explored, whose library revealed what
 * — `null` from an empty library — and whether it was a land card. */
export interface ExploreResult {
  readonly explorer: ObjectId;
  readonly player: PlayerId;
  readonly revealed: ObjectId | null;
  readonly land: boolean;
  /** The revealed card's name, for the "put it into your graveyard?" question. */
  readonly revealedName?: string;
}

/** What discover found and exiled (rule 701.57a): `hit` is the discovered
 * card (701.57c), `null` when the library ran out first; `exiled` is every
 * card exiled, the hit included; `amount` is N. */
export interface DiscoverFound {
  readonly hit: ObjectId | null;
  readonly exiled: readonly ObjectId[];
  readonly amount: number;
}

/** The answer to cascade's "you may cast it" — see `EffectSpec` `cascade`. */
export interface CascadeFinish {
  readonly hit: ObjectId;
  readonly exiled: readonly ObjectId[];
  readonly cast: boolean;
}

/** How a `cast-now` offers its cards — see that {@link EffectSpec}. */
export interface CastNowOptions {
  /** Who is offered the cast — the effect's controller when omitted. */
  readonly by?: PlayerId;
  readonly free: boolean;
  /** "By discarding a card rather than paying its mana cost" — with `free`;
   * see the `cast-now` effect's `byDiscarding`. */
  readonly byDiscarding?: boolean;
  /** "By paying an amount of {E} equal to its mana value rather than paying
   * its mana cost" — with `free`; see the `cast-now` effect's
   * `byPayingEnergy`. */
  readonly byPayingEnergy?: boolean;
  /** Paying the card's madness cost rather than its mana cost — see the
   * `cast-now` effect's `madness`. */
  readonly madness?: boolean;
  /** Paying the card's miracle cost rather than its mana cost — see the
   * `cast-now` effect's `miracle`. */
  readonly miracle?: boolean;
  readonly exileAfter: boolean | "instants-and-sorceries";
  readonly spell?: CardFilter;
  /** The library cards the player looks at to choose among, shown to them
   * castable or not. */
  readonly looked?: readonly ObjectId[];
  /** "You may **play**": a land card on offer may be played, too — see the
   * `cast-now` effect's `play`. */
  readonly play?: boolean;
  /** A free cast an ability of the card itself allows — cascade's (rule
   * 702.85a) or suspend's (702.62a): recorded as the spell's `castVia`, and
   * suspend's creature spell gains haste (`hastyUntilItLeaves`). A suspended
   * card not cast stays exiled, no longer suspended. */
  readonly freeCastOf?: "cascade" | "suspend";
  /** Cast it **transformed** — a transforming double-faced card with its back
   * face up on the stack (rule 712.11a); see the `cast-now` effect's
   * `transformed`. */
  readonly transformed?: boolean;
  /** How many more spells an "up to N" allows — the `cast-now` effect's
   * `upTo`, for the offer to say. */
  readonly castsLeft?: number;
  /** How much mana value a "total mana value N or less" has left — the
   * effect's `totalManaValue`, for the offer to say (`spell` holds it to it). */
  readonly manaValueLeft?: number;
}

/** A `cast-now` parked across its decision: the event it asked at and the
 * cards it offered — "if you do" is whether one of them was cast since
 * (`ResolutionContext.castSince`) — and the library cards it looked at, for
 * `rest`. `followed` once `then` or `else` is done and only `rest` is left. */
export interface CastNowProgress {
  readonly since: number;
  readonly cards: readonly ObjectId[];
  readonly looked: readonly ObjectId[];
  readonly followed?: boolean;
  /** `upTo`, less the spells cast so far. */
  readonly castsLeft?: number;
  /** `totalManaValue`, less the mana values of the spells cast so far. */
  readonly manaValueLeft?: number;
}

/**
 * The `add-mana` lists read off the board rather than printed — what they
 * name shrinks and grows with the board, and an empty one makes no mana at
 * all (rule 106.5). The engine resolves one wherever the spec is read: the
 * payment planner, the hand-activation menu and the mana being added
 * (`EffectApi.manaTypesOf`).
 */
export type BoardManaList =
  /**
   * "…of any color that a land an opponent controls could produce" (Exotic
   * Orchard, Fellwar Stone): a `oneOf` over those colours.
   *
   * `"your-lands"` is "…that a land **you** control could produce"
   * (Reflecting Pool), `filter` narrows which lands (Gond Gate's "a Gate you
   * control"), and `anyType` is "any **type**" rather than "any color" —
   * colorless included (rule 106.1b). What a land could produce is rule
   * 106.7's: every type one of its mana abilities would make if it resolved
   * now, its costs ignored (a tapped land counts), read through other "could
   * produce" lands without looping (two Reflecting Pools don't help each
   * other — the ruling).
   */
  | {
      readonly producedBy: "opponents-lands" | "your-lands";
      readonly filter?: CardFilter;
      readonly anyType?: true;
      /** `amount` mana all of **one** of the types — Incubation Druid's "add
       * three mana of that type instead" — as `oneOf`'s `same`. */
      readonly same?: true;
    }
  /**
   * "One mana of any color among legendary creatures and planeswalkers you
   * control" (Mox Amber): a `oneOf` over the colours of the objects matching
   * `colorAmong`, read as the mana is made — battlefield permanents, from
   * the controller's side (put `controlledBy: "you"` in the filter for "you
   * control"); with `zone: "graveyard"` the cards in the controller's
   * graveyard (The Grey Havens' "legendary creature cards in your
   * graveyard"); with `"exiled-with-source"` the cards linked to this
   * permanent (rule 607.2a — Chrome Mox's "the exiled card's colors").
   * Colourless isn't a colour, so none of them coloured makes no mana (the
   * Mox Amber ruling).
   */
  | {
      readonly colorAmong: CardFilter;
      readonly zone?: "graveyard" | "exiled-with-source";
      readonly same?: true;
    }
  /**
   * "For each color among permanents you control, add one mana of that
   * color" (Bloom Tender, Faeburrow Elder): an `all` over the colours among
   * the battlefield permanents matching the filter, each colour once however
   * many have it (the rulings) — `amount` times over.
   */
  | { readonly eachColorAmong: CardFilter };

/** "A Jace planeswalker token you control" (rule 701.71a). */
const JACE_TOKEN: CardFilter = { type: "planeswalker", subtype: "Jace", token: true, controlledBy: "you" };

export type EffectSpec =
  | {
      /** Apply several effects in order, sharing the same targets and X.
       * (e.g. Blightning: 3 damage to target player *and* that player
       * discards two cards.) */
      readonly kind: "sequence";
      readonly effects: readonly EffectSpec[];
      /**
       * The steps are **one instruction** acting on several objects, written
       * as one step per target slot — Victimize's "return the chosen cards to
       * the battlefield tapped" — so what they move, moves at the same time
       * (rule 608.2c reads instructions one at a time, but one instruction is
       * one event). Cards they take out of graveyards leave together, which
       * a "whenever one or more cards leave your graveyard" trigger sees as
       * one move; permanents they take off the battlefield leave together too
       * (rule 603.10a), permanents they put onto the battlefield enter
       * together, each seeing the others enter (rule 603.6a — the Elas il-Kor
       * ruling), and the damage they deal is one damage event, a lifelink
       * source's one life gain (rule 702.15e — Chandra's Ignition). Leave it
       * off a sequence of separate sentences
       * ("Destroy target creature. Return target card from your graveyard to
       * your hand."), which really are separate events.
       */
      readonly simultaneous?: boolean;
    }
  | {
      /**
       * `effect` once for each member of an "any number of target …" group
       * (the `any-number` `TargetSpec`) — the targets in slot `from` on,
       * in the order they were chosen, each bound in turn to slot `from` of
       * `effect`, which is written as for one target there. Mindbreak
       * Trap's "exile any number of target spells" is `{ kind:
       * "for-each-target", from: 0, effect: { kind: "exile", target: 0 } }`.
       * A member found illegal as it resolved is left out (rule 608.2b).
       * `simultaneous` makes the members one instruction, as a `sequence`'s
       * does: "any number of target players each mill two cards" mills them
       * at once.
       */
      readonly kind: "for-each-target";
      readonly from: number;
      readonly effect: EffectSpec;
      readonly simultaneous?: boolean;
    }
  | {
      /**
       * Choose permanents as this resolves, with no targeting — "untap up to
       * two lands" is `{ kind: "choose-permanents", filter: { type: "land" },
       * upTo: 2, then: { kind: "untap", target: 0 }, prompt: "Untap up to two
       * lands" }` (Snap). The effect's controller picks from `min` (default
       * 0) to `upTo` of the battlefield permanents matching `filter` from
       * their side, and `then` applies to each one picked as target 0. Not a
       * target: a hexproof land can be chosen, and nothing chosen makes the
       * spell fizzle. Nothing is asked when nothing matches. `then` shouldn't
       * itself stop to ask anything.
       */
      readonly kind: "choose-permanents";
      readonly filter: CardFilter;
      readonly upTo: EffectAmount;
      /** An amount too: Tangle Wire's "taps an untapped artifact, creature,
       * or land they control **for each** fade counter" is `min` and `upTo`
       * the same count — all of them, or every one there is. */
      readonly min?: EffectAmount;
      readonly then: EffectSpec;
      readonly prompt: string;
      /** "Any number of **other** nonland permanents you control" (Abdel
       * Adrian, Gorion's Ward): never the effect's own source. */
      readonly exceptSource?: boolean;
      /** "…return **another** permanent you control that shares a permanent
       * type with it" (Cloudstone Curio), "a permanent **other than that
       * creature**" (Saw): never the trigger's object. */
      readonly exceptTriggerObject?: boolean;
      /**
       * Who chooses, when it isn't the effect's controller: "at the
       * beginning of each player's upkeep, **that player** untaps a land
       * they control" (Hokori, Dust Drinker — `"active-player"`), "**defending
       * player** chooses an untapped creature they control" (Crashing Boars
       * — `"trigger-player"`). One player; `filter` is read from their side
       * (`controlledBy: "you"` is the chooser), and `then` applies with them
       * as its controller — they're the one doing it. Nobody named, and
       * nothing happens. Several players each choosing is a `vote` with
       * `choose` (rule 101.4).
       */
      readonly chooser?: EffectPlayerRef;
      /** "A creature an opponent controls **chosen at random**" (Cinderheart
       * Giant): nobody is asked, one of the matches is picked, and `then` runs
       * with it at slot 0. `upTo` isn't read: it's one permanent. */
      readonly random?: true;
      /** What the chosen permanents must be as a set: "choose any number of
       * creatures **with different powers**" (Sigarda's Vanguard), "tokens you
       * control **with different names**" (Battle for Bretagard). A token
       * stack's tokens share both, so one of a stack at most; a permanent with
       * no name can't be chosen for different names (rule 201.2b). */
      readonly together?: { readonly distinctNames: true } | { readonly distinctPowers: true };
    }
  | {
      /**
       * Bolster N (rule 701.39a): the effect's controller chooses a creature
       * they control with the least toughness, or tied for it, among
       * creatures they control, and puts `amount` +1/+1 counters on it. The
       * choice is made as this resolves — not a target — with the
       * `choose-permanents` decision, asked only when creatures are tied
       * (a token stack's tokens are one choice). Nothing, if they control no
       * creature.
       */
      readonly kind: "bolster";
      readonly amount: EffectAmount;
    }
  | {
      /**
       * Blight N (rule 701.68a): each player in `who` (default `"you"`) puts
       * `amount` -1/-1 counters on a creature they control, which they choose
       * as this resolves — not a target — with the `choose-permanents`
       * decision (asked only when there's more than one to choose from). All
       * of them on one creature; it needn't survive them (the rulings). A
       * player who controls no creature can't, and does nothing (701.68b) —
       * so "you may blight 1. If you do, …" is a `may` of this with `then`,
       * not offered at all without a creature (`mayBeDone`).
       *
       * Several players blight one at a time from the active player (rule
       * 101.4 — High Perfect Morcant's "each opponent blights 1"), each
       * choosing their own creature.
       *
       * `then` applies right after a player's counters go on, with **the
       * blighted creature** (701.68c) as its target 0 and that player as its
       * controller: Grub, Notorious Auntie's "create a token that's a copy of
       * the blighted creature" is `then: { kind: "create-token-copy", of: 0,
       * … }`. Like a `choose-permanents`' `then`, it shouldn't itself stop to
       * ask anything.
       *
       * `who: { target: n }` is "**target opponent** blights 2" (Champion of
       * the Weird): the player in that slot, nobody if it's illegal (608.2b).
       */
      readonly kind: "blight";
      readonly amount: number;
      readonly who?: PlayerScope | { readonly target: number };
      readonly then?: EffectSpec;
      /** Set by the engine on the copy it parks when one player's choice is
       * asked: the players still to blight. */
      readonly remaining?: readonly PlayerId[];
    }
  | {
      /**
       * Behold (rule 701.4a — {@link BeholdSpec}) as an effect: the
       * controller reveals a card matching `filter` from their hand or
       * chooses a permanent they control matching it, as this resolves — not
       * a target — with the `choose-from-zone` decision (asked only when
       * there's a choice to make). One who can't does nothing, so "you may
       * behold a Dragon. If you do, …" is a `may` of this with the rest as
       * the may's `then` (Sarkhan, Dragon Ascendant), not offered at all when
       * nothing qualifies (`mayBeDone`).
       *
       * `then` applies right after, with the beheld object as its target 0
       * — what "the beheld card" would read. Like a blight's `then`, it
       * shouldn't itself stop to ask anything.
       */
      readonly kind: "behold";
      readonly filter: CardFilter;
      readonly text: string;
      readonly count?: number;
      readonly then?: EffectSpec;
    }
  | {
      /**
       * `effect` done by `who` instead of the effect's controller: inside it
       * "you" is them, what it asks is theirs to answer, and what it makes is
       * theirs — "target player scries 2, then draws a card", "its controller
       * incubates X" (Excise the Imperfect), "Gandalf's owner … draws three
       * cards". For an effect with no `who` of its own, or whose `who` takes only
       * a scope. Its targets stay the spell's. Nothing happens if `who` names
       * nobody, or a player who has left the game. The spell's controller is
       * still who controls it for anything outside `effect`.
       */
      readonly kind: "as-player";
      readonly who: EffectPlayerRef;
      readonly effect: EffectSpec;
    }
  | {
      /**
       * `effect` once for each battlefield permanent `filter` matches as this
       * begins, nobody choosing — "tap all other creatures" (Thundermare), or
       * any effect that names one object done to all of them. Each is bound in
       * turn to target slot `as` (default 0) of `effect`, written as for one
       * target there, so the other slots stay the spell's: "each other creature
       * gets -1/-1" beside a target is `as: 1` with `exceptTarget: 0`. A token
       * stack is woken first, each token its own object (rule 700.3b), so an
       * effect done to "each" reaches every one. A permanent that's gone by its
       * turn, or back as a new object (400.7), is skipped.
       *
       * `simultaneous` makes it one instruction, as a `sequence`'s does: what
       * leaves leaves in one event, and `effect` mustn't stop to ask anything.
       * Say it for a mass effect ("tap all", "return all", "transform all");
       * without it the permanents take turns, and a `may` or a choice in `effect`
       * is answered before the next ("for each creature, you may …").
       */
      readonly kind: "for-each-permanent";
      readonly filter: CardFilter;
      readonly effect: EffectSpec;
      readonly as?: number;
      /** "All **other** creatures": never the effect's own source. */
      readonly exceptSource?: true;
      /** "…and each other creature": never the trigger's object. */
      readonly exceptTriggerObject?: true;
      /** "…other than **target** creature": never what this target slot holds. */
      readonly exceptTarget?: number;
      /** "All lands **target player controls**": the filter's `controlledBy`
       * reads this slot's player, or the controller of what it holds. */
      readonly controlledByTarget?: number;
      readonly simultaneous?: true;
    }
  | {
      /** One permanent's turn of a `for-each-permanent`: `object`, in the stint
       * it was found in, bound to slot `as`. Built by the engine as it applies
       * one — never authored. */
      readonly kind: "for-permanent";
      readonly object: ObjectId;
      readonly stint: number;
      readonly as: number;
      readonly effect: EffectSpec;
    }
  | {
      /** One member's turn of a `for-each-target`: target `index` bound to
       * slot `from`. Built by the engine as it applies one — never
       * authored. */
      readonly kind: "for-target";
      readonly from: number;
      readonly index: number;
      readonly effect: EffectSpec;
    }
  | {
      /**
       * `effect` once for each creature that convoked the resolving spell
       * (rule 702.51c) — a copy's are the original's (rule 707.10) — each
       * bound to target slot 0: Lethal Scheme's "each creature that
       * convoked this spell connives" is `{ kind: "for-each-convoker",
       * effect: { kind: "connive", target: 0 } }`. As a `sequence`'s steps,
       * so one that stops to ask (a connive's discard) is answered before
       * the next. A creature that has left the battlefield since — or come
       * back as a new object (rule 400.7) — is read as it last existed and
       * not acted on: it still connives, its last controller drawing and
       * discarding, but gets no counter (rule 701.50b). They go one at a
       * time in the order the spell's controller chooses (rule 701.50c,
       * Lethal Scheme's ruling): with more than one left, a `choose-modes`
       * asks which is next.
       */
      readonly kind: "for-each-convoker";
      readonly effect: EffectSpec;
      /** Set only by the engine: the convokers (by index) still to go. */
      readonly remaining?: readonly number[];
    }
  | {
      /** One convoker's turn of a `for-each-convoker`. Built by the engine
       * as it applies one — never authored. */
      readonly kind: "for-convoker";
      readonly index: number;
      readonly effect: EffectSpec;
    }
  | {
      /**
       * "**You choose an opponent**" as this resolves — Tasigur, the Golden
       * Fang's "…a nonland card of an opponent's choice", where you choose
       * the opponent and then they choose the card (the ruling): `then`,
       * with the `"that-player"` scope naming the one chosen. Not a target.
       * Among the opponents still in the game; with one, nobody is asked,
       * and with none nothing happens. Asked as a `choose-modes`.
       */
      readonly kind: "choose-opponent";
      readonly then: EffectSpec;
      /** "Choose an opponent **at random**" (Vial Smasher the Fierce): nobody
       * is asked — the game picks among them with its seeded randomness,
       * announced as a `chosen-at-random` event. */
      readonly random?: true;
      /** "Choose a **player**": among every player still in the game, the
       * effect's controller included — at random (Wildfire Devils), or by
       * the effect's controller, asked only among two or more (Multiple
       * Choice's "you may choose a player. They return a creature …"). */
      readonly anyPlayer?: true;
      /** "Choose an opponent **with the most life** among your opponents"
       * (The Master, Gallifrey's End), "a player with the most life or tied
       * for most life" (The Black Gate): only those of the candidates whose
       * life total is the greatest among them, read as this resolves. */
      readonly mostLife?: true;
      /** The one chosen is kept on the effect's source as "the chosen
       * player" (`GameObject.chosenPlayer`), replacing any earlier one —
       * Triarch Stalker's "at the beginning of combat on your turn, choose
       * an opponent. Creatures attacking **the last chosen player** have
       * menace". Nothing is kept once the source has left the battlefield. */
      readonly remember?: true;
      /** "**Secretly** choose an opponent" (Stalking Leonin), only with
       * `remember`: kept hidden as `GameObject.secretChoice` until a
       * `revealChosen` cost shows it. Asked as a `choose-creature-type` menu of
       * players, whose answer stays out of the log. */
      readonly secret?: true;
    }
  | {
      /**
       * "Choose a card **at random** in your graveyard" (Deadbridge Chant),
       * "return an instant or sorcery card at random from your graveyard"
       * (Exalted Flamer of Tzeentch): as this resolves, one of the cards in
       * `whose` graveyard matching `filter` (read from the effect's
       * controller's side) is picked with the game's seeded randomness —
       * each with an equal chance (the Deadbridge Chant ruling) — and `then`
       * applies to it as target 0. Not a target: it's picked from whatever
       * is there as this resolves, a card put there in response included
       * (the ruling). Nothing happens when nothing matches. Announced as a
       * `chosen-at-random` event.
       *
       * `zone: "hand"` picks from a **hand**, a hidden zone (rule 400.2):
       * "target player reveals a card at random from their hand" (Hired
       * Torturer, Singe-Mind Ogre — `show: "reveal"`, shown to every player,
       * rule 701.20a), "look at a card at random in target player's hand"
       * (Urza's Bauble — `show: "look"`, seen by the effect's controller
       * alone, who closes the look; nothing follows it, so no `then`), or
       * "exiles a card at random from their hand" (Crabomination — no
       * `show`: `then`'s move shows it). `zone: "exiled-with-source"` picks
       * from the cards in exile linked to this effect's source (rule 607.2a
       * — `GameObject.exiledWith`), in the stint the resolving ability
       * refers to, `whose` unread: Skyship Weatherlight's "choose a card at
       * random that was exiled with Skyship Weatherlight", Cosmium
       * Catalyst's "an exiled card used to craft this artifact" (702.167c).
       * A face-down one is picked like any other; the event names it to
       * those who may look at it.
       */
      readonly kind: "choose-random-card";
      readonly zone: "graveyard" | "hand" | "exiled-with-source";
      /** Whose graveyard or hand: the effect's controller's (the default),
       * `"that-player"`, a target slot holding a player, or a player named
       * through a target ("target creature's controller reveals a card at
       * random from their hand" — Friendly Fire: `{ controllerOfTarget: 0
       * }`). */
      readonly whose?: "you" | "that-player" | number | ChosenPlayerRef;
      readonly filter?: CardFilter;
      /** How a card picked from a hand is shown — see `zone`. */
      readonly show?: "reveal" | "look";
      /** The picked card goes in this target slot, **beside** the effect's
       * own targets, rather than replacing them all as target 0 — Cursed
       * Scroll's "reveal a card at random from your hand. If that card has
       * the chosen name, this artifact deals 2 damage to **any target**"
       * (`slot: 1`, the damage still at target 0), Singe-Mind Ogre's "target
       * player … then loses life equal to that card's mana value". */
      readonly slot?: number;
      /** What's done with the picked card; nothing for a bare reveal or
       * look. */
      readonly then?: EffectSpec;
    }
  | {
      /**
       * The top card of a graveyard, by the pile's order (rules 404.1, 404.2 —
       * the list's end is the top), going to `then` as target 0: nothing
       * targets it and nobody chooses it. Soldevi Digger's "put the top card of
       * your graveyard on the bottom of your library". `filter` is "the top
       * **creature** card" (Corpse Dance), the first match down from the top;
       * `ifIt` is "**if** the top card … is a creature card" (Guiding Spirit),
       * read on the top card itself, with nothing done otherwise; `bottom` is
       * the bottom card instead (Phyrexian Furnace). `whose` as
       * `choose-random-card`'s, a slot holding a player included.
       */
      readonly kind: "top-of-graveyard";
      readonly whose?: "you" | "that-player" | number | ChosenPlayerRef;
      readonly filter?: CardFilter;
      readonly ifIt?: CardFilter;
      readonly bottom?: true;
      readonly then: EffectSpec;
    }
  | {
      /** "Then reorder your graveyard as you choose" (Fossil Find): the
       * effect's controller arranges their whole pile. Asked only while
       * something in the game reads a graveyard's order; otherwise it's a
       * choice nothing could tell apart. */
      readonly kind: "reorder-graveyard";
    }
  | {
      /** A `choose-from-zone` waiting for the question of who answers it —
       * the mode of "an opponent chooses" (`SearchInstead`'s and
       * `look-and-choose`'s `chooser: "an-opponent"`). Built by the engine —
       * never authored. */
      readonly kind: "offer-zone-choice";
      readonly decision: Extract<AwaitingDecision, { kind: "choose-from-zone" }>;
    }
  | {
      /** `effect` with `"that-player"` naming `player` — the mode a
       * `choose-opponent` answer applies. Built by the engine — never
       * authored. Nothing, once `player` has left the game. */
      readonly kind: "about-player";
      readonly player: PlayerId;
      readonly effect: EffectSpec;
      /** `choose-opponent`'s `remember`: keep `player` on the source first. */
      readonly remember?: true;
      /** `choose-opponent`'s `secret`, with `remember`. */
      readonly secret?: true;
    }
  | {
      /**
       * "Deals X damage **divided evenly, rounded down**, among any number of
       * targets" (Fireball): the targets from slot `from` on — an
       * `any-number` group — each dealt `amount` divided by how many of them
       * are still legal as it resolves (the ruling), all at once. More legal
       * targets than damage deals none to any.
       */
      readonly kind: "damage-divided-evenly";
      readonly amount: EffectAmount;
      readonly from: number;
    }
  | {
      readonly kind: "damage";
      readonly amount: EffectAmount;
      /** "The damage can't be prevented" (rule 615.12 — Combust, Pinpoint
       * Avalanche): prevention effects prevent none of it. */
      readonly cantBePrevented?: true;
      /** A target slot index — omit when `who` is set instead. Or
       * `"trigger-object"`, untargeted: "whenever this creature blocks or
       * becomes blocked by a creature, this creature deals 1 damage to **that
       * creature**" (Ornery Goblin — `blocks` with `object: "blocked"`, and
       * `blocked-by`, whose trigger object is the blocker). One that has left
       * the battlefield since is dealt nothing. Or `"attached"`: an Aura's
       * "deals 2 damage to that creature" (Earthbind) — what it enchants. Or
       * `"source"`, untargeted: "this creature deals 3 damage to **itself**"
       * (Psionic Entity), "that artifact deals damage … to **this creature**"
       * (Goblin Tinkerer, with `from: { target: 0 }`). A source that has left
       * since, even if it's back, is a new object and is dealt nothing (rule
       * 400.7). */
      readonly target?: number | "trigger-object" | "attached" | "source";
      /** Untargeted damage to a whole scope of players (Sabotender / Tannuk:
       * "deals 1 damage to each opponent" — needed-cards P16), instead of a
       * chosen target. A per-player `amount` (`lifeTotal: "each"`) is read
       * for each of them. Or one player named through a target (`{
       * ownerOfTarget: 0 }`), or `"attached-owner"`: the owner of what the
       * source is attached to — Enslave's "enchanted creature deals 1 damage
       * to **its owner**", with `from: "attached"`. Nobody, with nothing
       * attached to. */
      readonly who?: PlayerScope | ChosenPlayerRef | "attached-owner";
      /** With `who`: only the players of it this holds for, asked about each
       * (`"that-player"` names them) — Outpace Oblivion's "2 damage to each
       * player **who doesn't have max speed**" is `{ kind: "speed", who:
       * "that-player", atMost: 3 }`. Dealt to them all at once, as `who`'s
       * damage is. */
      readonly whoseIf?: StaticCondition;
      /** Untargeted damage to whatever the triggering event was aimed at —
       * "deals 2 damage to **that permanent or player**" (Ghyrson Starn), or
       * "the player or planeswalker **it's attacking**" (Mage Slayer).
       * See `LastKnownRefs.recipient`: a permanent that has left the
       * battlefield since is not dealt anything. */
      readonly toTriggerRecipient?: true;
      /** Who deals it, when that isn't the effect's own source: `"trigger-
       * object"` is the object that fired the trigger — "**it** deals damage
       * equal to its power to any target" (Be'lakor, the Dark Master: the
       * entering Demon), "**it** deals that much damage to each other
       * opponent" (Kediss: the commander that dealt combat damage). Its
       * lifelink, deathtouch and colours (for protection) apply, as it last
       * existed on the battlefield if it has left (rule 608.2h). See
       * {@link DamageFrom} for a target slot. */
      readonly from?: DamageFrom;
      /**
       * Damage aimed at the *controller* of whatever a target slot points at
       * — Unlicensed Disintegration's "deals 3 damage to **that creature's**
       * controller", where the targeted thing is the creature, not a player.
       * Mirrors `create-token`'s `who: "target-controller"`.
       *
       * Rule 111.11 / 608.2h: read as last-known information, so a creature
       * destroyed by the same spell still names whoever controlled it — which
       * is exactly the order every card printed this way resolves in.
       */
      readonly toControllerOfTarget?: number;
      /**
       * "Excess damage is dealt to that creature's controller instead" (Ram
       * Through — rule 120.4a): of the damage to a target creature, what's
       * beyond lethal (`lethalDamageTo`: toughness less damage marked, 1 from
       * deathtouch) goes to its controller, both dealt at once. `ifSourceHas`
       * makes it conditional on the source's keyword ("if the creature you
       * control has trample").
       */
      readonly excessToController?: { readonly ifSourceHas?: Keyword };
    }
  | {
      /** `mana: "any-color"` — one mana of any of the five colours, the
       * player's choice (Arcane Signet, Command Tower, Treasure). With an
       * `amount` above 1 it is that much mana of any **one** colour (Gilded
       * Lotus: "three mana of any one color"), never a mix. During
       * cost payment the planner picks the colour it needs; a mana ability
       * activated on its own makes the colour the player picked (the
       * action's `manaColors`). Anywhere else — a spell or a triggered
       * ability resolving — nothing is asked and it makes white, so a card
       * that adds "one mana of any color" as it resolves spells the choice
       * out as a `modal` over the five (Lotus Cobra, Manamorphose).
       * `mana: { oneOf: [...] }` — `amount` mana in any combination of the
       * listed colours, each unit independently chosen (Orcish Lumberjack:
       * "three mana in any combination of {R} and/or {G}" —
       * `{ oneOf: ["R", "G"] }`, `amount: 3`). During cost payment the planner
       * enumerates every achievable combination as a separate option and
       * picks whichever pays the cost; activated on its own, each unit is
       * the player's pick, as it is when a resolving effect adds them
       * (rule 608.2d — `addManaChoice`: Realm-Scorcher Hellkite, Klauth).
       * needed-cards P20. With `same: true` every unit is the
       * same one of the listed types — Brigid, Doun's Mind's "Add X {G} or X
       * {W}" — never a mix, as `any-color` is over all five. */
      readonly kind: "add-mana";
      /** `"chosen"` is the colour this permanent's controller named as it
       * entered (Heraldic Banner's "{T}: Add one mana of the chosen color") —
       * see `GameObject.chosenOnEnter`. */
      readonly mana:
        | ManaType
        | "any-color"
        | "chosen"
        /** "One mana of any color in your commander's color identity" (Command
         * Tower, Arcane Signet): one of `PlayerState.commanderIdentity`'s
         * colours, the payer's choice — nothing at all for a player with no
         * commander or a colourless one (the rulings). */
        | "commander-identity"
        /** "One mana of any type that [permanent] produced" — only in a
         * `tapped-for-mana` triggered mana ability, where it's what the
         * permanent tapped for mana made (Roxanne, Starfall Savant; Mana
         * Flare). Anywhere else it makes nothing. */
        | "produced"
        | { readonly oneOf: readonly ManaType[]; readonly same?: true }
        /**
         * One of each listed type, all together, `amount` times over:
         * "Add {W}{U}" (a Signet, a Karoo land) is `{ all: ["W", "U"] }` with
         * `amount: 1`. Not a `oneOf` × 2, which could make {W}{W}.
         */
        | { readonly all: readonly ManaType[] }
        | BoardManaList;
      /** An `EffectAmount` so a ritual can scale off the board — Mana Geyser's
       * "{R} for each tapped land your opponents control" — and a mana
       * ability can make a live amount (Marwyn's power, Kydele's cards drawn
       * this turn). `manaSources()` sizes a live amount against the board as
       * it stands, where `"x"` and `triggerValue` read 0. */
      readonly amount: EffectAmount;
      /** Damage this mana ability deals to its controller when it's used (a
       * painland's coloured tap — Karplusan Forest: "{T}: Add {R} or {G}.
       * Karplusan Forest deals 1 damage to you."). The auto-payer prefers a
       * painless option and only reaches for this when it must. */
      readonly painToController?: number;
      /**
       * "Spend this mana only to cast a creature spell of the chosen type"
       * (Cavern of Souls, Unclaimed Territory) and its relatives — rule
       * 106.6b. The restriction rides on each unit produced, so it survives
       * the mana sitting in the pool, and the payment planner also refuses to
       * tap this source for a purpose the restriction forbids.
       *
       * `"chosen-creature-type"` reads `GameObject.chosenCreatureType` off
       * the source at activation time, since that is named as the permanent
       * enters rather than printed.
       */
      readonly spendOnly?: ManaSpendOnly;
      /** "If that mana is spent on a Dragon creature spell, it gains haste
       * until end of turn" (Carnelian Orb of Dragonkind): an additional effect
       * on the spell the mana is spent on (rule 106.6) — not a trigger, so it
       * can't be responded to and happens with its source gone. The spell
       * (matched by `spell`, as it is on the stack) gains `keywords` until end
       * of turn, and so does the permanent it becomes (a `castRider`). */
      readonly spellGains?: {
        readonly spell?: CardFilter;
        readonly keywords: readonly Keyword[];
        /** "It gains riot" (Domri, Chaos Bringer): with no end. */
        readonly lasting?: true;
      };
      /** "When that mana is spent to cast …, [effect]" — Path of Ancestry's
       * scry. Rides on each unit produced and fires as it is spent. */
      readonly whenSpent?: {
        readonly spell?: CardFilter | "shares-type-with-commander";
        readonly effect: EffectSpec;
        readonly text: string;
      };
      /** "You don't lose this mana as steps and phases end" (Savage
       * Ventmaw). Still emptied at cleanup. */
      readonly persists?: boolean;
      /** "This mana lasts until end of combat" — firebending's (the
       * `firebending` helper). */
      readonly untilEndOfCombat?: boolean;
      /** What else the mana ability does, as part of it — Kibo, Uktabi
       * Prince's Banana: "{T}, Sacrifice this artifact: Add {R} or {G}. **You
       * gain 2 life.**" Applied right after the mana is added, and still
       * without using the stack; the auto-payer applies it too when it uses
       * the ability to pay a cost. */
      readonly also?: EffectSpec;
      /** Who adds it, when that isn't the effect's controller — "each
       * player adds {B}{R}{G}" (Yurlok of Scorch Thrash). For mana with no
       * choice in it only (a choice is its controller's to make). A mana
       * ability's own part for its controller stays unscoped — that is what
       * the auto-payer counts — and the rest rides on `also` with
       * `who: "each-opponent"`. */
      readonly who?: PlayerScope;
    }
  | {
      readonly kind: "draw";
      readonly amount: EffectAmount;
      /**
       * Who draws. Defaults to the effect's controller. `who` is a scope
       * (Stormfist Crusader: "each player draws a card"); `target` is a
       * target-slot index holding a player (Deep Analysis: "target player
       * draws two cards"). Mutually exclusive — `target` wins if both are set.
       * A {@link ChosenPlayerRef} is one player named through a target — "its
       * controller draws a card" (`{ controllerOfTarget: 0 }`), read as the
       * permanent last existed if it has left.
       */
      readonly who?: PlayerScope | ChosenPlayerRef;
      readonly target?: number;
    }
  | {
      /**
       * "Each player discards their hand" (Dragon Mage, Runehorn Hellkite) —
       * a whole hand at once, with no choice to make, so it's distinct from
       * `discard`'s "choose N cards" and never raises a decision.
       *
       * With `filter`, "discards **all** [filter] cards" (rule 701.9a):
       * every card in that hand matching it, still with nothing to choose —
       * Amnesia's "all nonland cards", Trapfinder's Trick's "all Trap
       * cards", Cabal Therapist's `{ hasName: CHOSEN_CARD_NAME }`. The filter
       * reads printed characteristics with "you" as the discarding player.
       */
      readonly kind: "discard-hand";
      /** A scope, a player target slot ("**target player** reveals their
       * hand and discards…"), or one player named through a target or
       * the event ("**that player**"). */
      readonly who: PlayerScope | number | ChosenPlayerRef;
      readonly filter?: CardFilter;
      /** "Reveals their hand and discards…": the whole hand is revealed to
       * everyone first (rule 701.20a), matching or not. */
      readonly reveal?: true;
    }
  | {
      readonly kind: "gain-life";
      /** An `EffectAmount` so it can scale off the board — Shamanic
       * Revelation's "4 life for each creature you control with power 4 or
       * greater" is a `{ countOf, times: 4 }`. */
      readonly amount: EffectAmount;
      /** Who gains — the effect's controller (default), a scope, or one player
       * named through a target: Path of Peace's "**its owner** gains 4 life"
       * (`{ ownerOfTarget: 0 }`). */
      readonly who?: PlayerScope | ChosenPlayerRef;
      /** The *controller* of whatever a target slot points at — Swords to
       * Plowshares' "**its controller** gains life equal to its power". Same
       * shape as `damage`'s field of the same name; see that one for the
       * last-known-information caveat. */
      readonly toControllerOfTarget?: number;
    }
  | {
      /**
       * "**Your life total becomes** 4" (Captive Audience), "**target player's
       * life total becomes** 10" (Magister Sphinx), "**each player's life
       * total becomes** the number of creatures they control" (Biorhythm).
       * The player gains or loses the difference (rule 119.5), so it is a
       * real gain or loss: "whenever you gain life" sees it, a doubling
       * doubles it (the rulings on Alhammarret's Archive), "can't gain life"
       * stops it, and no difference is no event. `amount` is read per player,
       * all of them before any life moves (Repay in Kind's "the lowest life
       * total among all players").
       */
      readonly kind: "set-life-total";
      /** A player target slot, a scope, or one player named through a target. */
      readonly who: number | PlayerScope | ChosenPlayerRef;
      readonly amount: EffectAmount;
    }
  | {
      /** Life loss (Zulaport Cutthroat: "each opponent loses 1 life"). An
       * `EffectAmount` so it can scale — Feed the Swarm loses life equal to
       * the destroyed permanent's mana value. */
      readonly kind: "lose-life";
      readonly amount: EffectAmount;
      /** A scope, or one player named through a target ("**its owner** loses
       * 2 life": `{ ownerOfTarget: 0 }`). */
      readonly who?: PlayerScope | ChosenPlayerRef;
      /** A single *targeted* player instead of a scope (Ob Nixilis, the
       * Fallen: "target player loses 3 life") — a target-slot index holding
       * a player. Mutually exclusive with `who`. needed-cards P19. */
      readonly target?: number;
      /** The *controller* of whatever a target slot points at — Undermine's
       * "**its controller** loses 3 life", where the target is the countered
       * spell. Same shape as `damage`/`gain-life`'s field of the same name. */
      readonly toControllerOfTarget?: number;
    }
  | {
      /** Tap `target` — a slot, or `"source"` for the effect's own
       * permanent with no target at all (Territorial Hellkite's "tap this
       * creature"), only while it's still that object (rule 400.7). */
      readonly kind: "tap";
      /** A target slot or a reference — `"trigger-recipient"` as `destroy`
       * reads it: "whenever this creature deals combat damage to a creature,
       * tap **that creature**" (Kashi-Tribe Warriors, Matsu-Tribe Sniper). */
      readonly target: EffectTargetRef;
      /** "**It doesn't untap during its controller's next untap step**"
       * (Junk Winder) — whoever controls it then; tapped by this or already
       * (`GameObject.skipsNextUntap`). */
      readonly doesntUntapNext?: boolean;
      /** With `doesntUntapNext`: **only** that — "target creature doesn't
       * untap during its controller's next untap step" with no "tap it"
       * (Kefnet's Monument, Wall of Frost, Ajani Vengeant's +1): it stays
       * tapped or untapped as it is. */
      readonly onlyDoesntUntap?: boolean;
      /** With `doesntUntapNext`: how many untap steps it stays down for, 1 by
       * default — "**next two untap steps**" (Telekinesis). */
      readonly doesntUntapSteps?: number;
      /** With `doesntUntapNext`: whose untap step — `"you"` is "doesn't untap
       * during **your** next untap step" (Reveka, Arbalest Elite, Samite
       * Alchemist): the effect's controller's, not whoever controls the
       * permanent then, so it comes back under someone else without a pause
       * (`GameObject.skipsUntapOf`). */
      readonly untapStepOf?: "you";
    }
  | {
      /** `target` accepts `"trigger-object"` for an untargeted "untap it"
       * off a trigger (Amulet of Vigor: untap the permanent that just
       * entered tapped). needed-cards P17. */
      readonly kind: "untap";
      readonly target: EffectTargetRef;
      /** Who untaps it, when the card says a player does — "that player …
       * untaps it" (Alexios, Deimos of Kosmos: `"active-player"`). Naming
       * nobody — a player who has left the game — nothing is untapped. */
      readonly by?: EffectPlayerRef;
    }
  | {
      readonly kind: "destroy";
      /** A target slot, or a reference to the object the ability is about —
       * "destroy it" of a trigger (Mikaeus, the Unhallowed: the Human that
       * dealt you damage, `"trigger-object"`). `"trigger-recipient"` is
       * what a `deals-damage` trigger's damage was dealt to — Stinkweed
       * Imp's "whenever this creature deals combat damage to a creature,
       * destroy **that creature**" — untargeted, and only while it's still
       * the same permanent (rule 400.7; `damage`'s `toTriggerRecipient`). */
      readonly target: EffectTargetRef;
      /** "It can't be regenerated" (rule 701.15c — Terminate): a
       * regeneration shield doesn't replace this destruction. */
      readonly cantBeRegenerated?: boolean;
    }
  | {
      /**
       * Regenerate a permanent (rule 701.15a — "{B}: Regenerate this
       * creature", "Regenerate target creature"): it gets a shield that
       * replaces the next time it would be destroyed this turn with removing
       * all damage from it, tapping it and removing it from combat. The shield
       * lasts until used or the turn ends; each regeneration is one more.
       */
      readonly kind: "regenerate";
      readonly target: EffectTargetRef;
    }
  | {
      /** Regenerate every battlefield permanent matching `filter` (Wrap in
       * Vigor: "Regenerate each creature you control"). */
      readonly kind: "regenerate-all";
      readonly filter: CardFilter;
    }
  | {
      /** Put a permanent on the bottom of its **owner's** library (Condemn).
       * Not a shuffle and not a bounce: the card is buried, which is why this
       * is its own effect rather than a `return-to-hand` variant. */
      readonly kind: "put-on-bottom-of-library";
      readonly target: number;
    }
  | {
      /** "If that creature would die this turn, exile it instead" (Lava Coil,
       * Scorching Dragonfire — rule 614.1a): a replacement that follows the
       * permanent in `target` until the turn ends or it leaves the
       * battlefield (`GameObject.exileIfDiesTurn`). It applies whether or
       * not the spell's damage was dealt, and whatever kills it this turn
       * (the rulings); a target that isn't a permanent (a player, through
       * "any target") is left alone. */
      readonly kind: "exile-if-dies-this-turn";
      readonly target?: EffectTargetRef;
      /** Instead of `target`: "If a creature **dealt damage this way** would
       * die this turn, exile it instead" (Anger of the Gods, Incendiary
       * Flow) — every permanent the resolution under way has dealt damage to
       * so far, so put it after the damage. A target whose damage was
       * prevented isn't covered (rule 615.1, the rulings). `"creature"`
       * covers only the creatures among them (Incendiary Flow's any target
       * leaves a planeswalker out), `"permanent"` creatures and planeswalkers
       * (Underworld Fires). */
      readonly dealtDamageThisWay?: "creature" | "permanent";
    }
  | {
      /** Destroy every battlefield permanent matching `filter` (Wrath of God:
       * `{ type: "creature" }`). Indestructible / 903.9a handled per-permanent
       * downstream. */
      readonly kind: "destroy-all";
      readonly filter: CardFilter;
      /** "… **target player** controls" (Sleep, Ajani Vengeant's −7, Settle
       * the Wreckage): `filter` read from the side of whoever the permanent
       * or player in this target slot is — its `controlledBy: "you"` is
       * them. Nothing happens once that target is illegal. */
      readonly controlledByTarget?: number;
      /** Narrow to permanents whose *controller* was dealt combat damage by
       * this effect's source this turn — Steel Hellkite. Not a `CardFilter`
       * clause because it's a fact about the source, not about the permanent
       * being matched. */
      readonly onlyControllersDamagedBySource?: boolean;
      /** "They can't be regenerated" (rule 701.15c — Wrath of God). */
      readonly cantBeRegenerated?: boolean;
      /** "Destroy all **other** creatures" (Novablast Wurm), "all permanents
       * **other than this Equipment**" (Worldslayer): the effect's source is
       * left out, whatever `filter` says of it. One token of a stack is the
       * source; the rest of the stack goes. */
      readonly exceptSource?: boolean;
      /** "Destroy all **other** permanents with that name" (Eye of
       * Singularity): the trigger object is left out, while it's still the
       * object that fired the trigger (rule 400.7). One token of a stack is
       * that object, as for `exceptSource`. */
      readonly exceptTriggerObject?: boolean;
    }
  | {
      /** Deal `amount` damage to every battlefield permanent matching `filter`
       * (Pyroclasm: 2 to each creature). The source of the damage is the
       * resolving spell/ability. */
      readonly kind: "damage-all";
      readonly filter: CardFilter;
      readonly amount: EffectAmount;
      /** Only permanents these players control — Balefire Dragon's "it deals
       * that much damage to each creature **that player** controls" is
       * `"trigger-player"`, the player it dealt combat damage to. */
      readonly whose?: PlayerScope;
      /** Only permanents the player in this target slot controls — Ashling's
       * Command's "deals 2 damage to each creature **target player**
       * controls" (as `modify-pt-all`'s). Nothing when that target has gone
       * illegal (rule 608.2b). */
      readonly controlledByTarget?: number;
      /** Spare the effect's own source — "each **other** creature with
       * flying" (Harbinger of the Hunt). A `CardFilter` can't say this: it
       * describes the permanent being matched, not its relationship to the
       * thing dealing the damage. With `from`, it spares what deals it
       * instead (Chandra's Ignition's "each **other** creature"). */
      readonly exceptSource?: boolean;
      /** Who deals it, when that isn't the effect's own source — see
       * {@link DamageFrom}. */
      readonly from?: DamageFrom;
    }
  | {
      /** Every permanent matching `filter` deals `amount` damage to its own
       * controller (Rakdos Charm: "each creature deals 1 damage to its
       * controller") — the reverse direction from `damage-all` (which deals
       * damage FROM the effect's source TO matching permanents; here each
       * matching permanent is its own damage source, and the target is
       * always its controller, never the effect's caster). needed-cards P20. */
      readonly kind: "creatures-damage-controllers";
      readonly filter: CardFilter;
      readonly amount: EffectAmount;
    }
  | {
      /** Each battlefield permanent matching `filter` deals damage — its own
       * power (`"its-power"`), or a fixed amount — to `to`, each permanent a
       * source of its own (rule 120.1): its lifelink, deathtouch, infect and
       * colours apply to what it deals, and a lifelinker's life is a gain of
       * its own (702.15e). Who deals what is read once, before any of it is
       * dealt (608.2h), and it is all dealt at once — one damage event, so a
       * wither creature's -1/-1 counters can't shrink another's power first,
       * and a creature dealt damage by three of them is dealt damage once.
       *
       * `to` is:
       * - `"itself"` — "each creature deals damage to itself equal to its
       *   power" (Solar Blaze; The Akroan War's "each **tapped** creature");
       * - a target slot — "choose target creature you don't control. Each
       *   creature you control that's a Wolf or a Werewolf deals damage equal
       *   to its power to that creature" (Moonlight Hunt; Bartz and Boko's
       *   "each **other** Bird", with `exceptSource`). Nothing is dealt when
       *   the target has gone illegal (608.2b);
       * - `"trigger-object"` — "each Dragon you control deals 1 damage to
       *   **that creature**" (Sarkhan the Masterless's attacker), nothing
       *   once it has left the battlefield;
       * - `{ who }` — "each creature you control deals damage equal to its
       *   power to **each opponent**" (Lukka, Coppercoat Outcast);
       * - `"host"` — "each Aura attached to a creature deals 2 damage to **the
       *   creature it's attached to**" (Aura Barbs), each to its own, nothing
       *   for one attached to nothing.
       *
       * A token stack deals its damage once per token: to itself, each
       * token to itself; to anything else, as that many identical sources
       * (`Game.dealDamage`'s `sources`). */
      readonly kind: "each-deals-damage";
      readonly filter: CardFilter;
      readonly amount: EffectAmount | "its-power";
      readonly to: "itself" | "host" | number | "trigger-object" | { readonly who: PlayerScope };
      /** Only permanents the player in this target slot controls — or that
       * permanent's controller: Alpha Brawl's "each of those creatures" (each
       * other creature **that player** controls). Nothing when that target
       * has gone illegal. */
      readonly controlledByTarget?: number;
      /** Not the effect's own source — Bartz and Boko's "each **other** Bird
       * you control". */
      readonly exceptSource?: true;
      /** Not the permanent in this target slot — Alpha Brawl's "each
       * **other** creature that player controls … deals damage equal to its
       * power to that creature". */
      readonly exceptTarget?: number;
    }
  | {
      /** Each affected player sacrifices `count` permanents matching `filter`
       * that they control (Diabolic Edict — `who: "target"`; Fleshbag
       * Marauder — `who: "each-player"`). Raises a `sacrifice` decision per
       * player who has a real choice; auto-resolves otherwise. */
      readonly kind: "sacrifice";
      readonly who: PlayerScope | "target";
      readonly filter: CardFilter;
      /** An amount: "each player sacrifices **X** lands" (Devastating
       * Dreams) reads the spell's X, as it resolves. */
      readonly count: EffectAmount;
      /** Exclude the effect's own source ("sacrifice **another** permanent" —
       * Korvold). needed-cards P6. */
      readonly exceptSource?: boolean;
      /** Exclude what the source is attached to, or was last — "a creature of
       * their choice **other than enchanted creature**" (Sporogenic Infection). */
      readonly exceptHost?: true;
      /** Exclude the object in this target slot — "**another** nonland
       * permanent" beside a target (Torment of Venom). */
      readonly exceptTarget?: number;
      /** Exploit's sacrifice (rule 702.110 — the `exploit()` helper): the
       * effect's source "exploits" what's sacrificed (702.110b), which an
       * `exploits` trigger watches (`permanent-sacrificed`'s `exploitedBy`). */
      readonly exploit?: true;
      /** "Sacrifice a creature, **an artifact, and a land**" (Tomb of
       * Annihilation's Oubliette): one more permanent for each filter here,
       * each a different permanent from `filter`'s and the others' — one
       * artifact creature never counts twice, as for a cost of several parts
       * (`SacrificeCostPart`). Each is chosen in turn, offering only what
       * leaves the most of the rest still sacrificeable, and then all of them
       * are sacrificed at once (rule 603.10a). `count` stays 1 with these. */
      readonly andEach?: readonly CardFilter[];
    }
  | {
      /**
       * "They put this card into their graveyard" (rule 702.35a — the
       * madness trigger's card, not cast): `target`, a card in exile, is put
       * into its owner's graveyard — only while it's still the object the
       * ability refers to (rule 400.7), never a permanent or a spell. Or a
       * card in a library, as a `look-and-choose`'s `then` has it with
       * `destination: "stay"`: "if it's a nonland card, you may pay 2 life.
       * If you do, **put it into that player's graveyard**" (Wand of Denial).
       */
      readonly kind: "put-into-graveyard";
      readonly target: EffectTargetRef;
    }
  | {
      /**
       * "Draw three cards **and reveal them**" (Dungeon of the Mad Mage's
       * Mad Wizard's Lair): every player is shown the cards this resolution
       * has had each player draw, those still in their hand (rule 701.16).
       * A step of its own after the `draw`, so a draw waiting behind a
       * dredge question is drawn before anything is revealed.
       */
      readonly kind: "reveal-drawn";
    }
  | {
      /**
       * Sacrifice one named permanent — "**sacrifice the creature** at the
       * beginning of the next end step" (Sneak Attack). Unlike `sacrifice`,
       * which is an edict its victim's controller answers, this one already
       * knows which permanent, so there is no decision at all. The effect's
       * controller sacrifices it, so only while they control it (rule
       * 701.21a): one someone else has taken by the end step stays. "Its
       * controller may sacrifice it" (Star Athlete) is an `each-player-may`
       * asking that controller, whose effect this then is.
       */
      readonly kind: "sacrifice-target";
      readonly target: EffectTargetRef;
      /** "**Its controller** sacrifices it" — whoever controls it then, not
       * the effect's controller (the Ring's "the blocking creature's
       * controller sacrifices it at end of combat"). */
      readonly byItsController?: boolean;
    }
  | {
      /** Sacrifice the permanent this effect's own source is (Defense of the
       * Heart: "sacrifice ~. If you do, …"). No choice and no decision — rule
       * 701.17. `then` is the "if you do" tail: applied only when the
       * sacrifice actually happened, so a source that already left the
       * battlefield in response does nothing at all. needed-cards P7. */
      readonly kind: "sacrifice-source";
      readonly then?: EffectSpec;
    }
  | {
      /** The player foraged (rule 701.61a) — announced after one of
       * `forageOptions()`'s ways was done, for "whenever you forage"
       * (Corpseberry Cultivator). Only as the tail of those options. */
      readonly kind: "foraged";
    }
  | {
      /** `targets[a]` and `targets[b]` each deal damage equal to their power
       * to the other (rule 701.12). With `oneSided`, only `a` deals to `b`
       * (Rabid Bite) — and `b` may be any permanent that can be dealt damage,
       * a planeswalker too (Stump Stomp's "to target creature or
       * planeswalker"). */
      readonly kind: "fight";
      /** `EffectTargetRef`s, so `"trigger-object"` works — Frontier Siege's
       * "you may have **it** fight target creature", where "it" is the
       * creature that just entered rather than a chosen target. */
      readonly a: EffectTargetRef;
      readonly b: EffectTargetRef;
      readonly oneSided?: boolean;
    }
  | {
      /** Return a target permanent to its owner's hand (rule 614-style
       * bounce). `target: "source"` bounces the effect's own permanent, with
       * no target at all (Encroaching Dragonstorm — needed-cards P16). */
      readonly kind: "return-to-hand";
      readonly target: EffectTargetRef;
      /**
       * The zone the object is returned **from** — `"battlefield"` (a bounce)
       * when omitted. The object has to be in that zone as the effect
       * applies, or nothing happens: "return target creature card from your
       * graveyard to your hand" does nothing to a card that has since been
       * exiled, and a bounce does nothing to a permanent that already left.
       *
       * - `"graveyard"` / `"exile"` — a card (Golbez, Crystal Collector;
       *   Regrowth), or with `"source"` / `"trigger-object"` the card behind
       *   the ability ("return it to its owner's hand" off a dies trigger, now
       *   or inside a `delayed-trigger`).
       * - `"library"` — a card a `reveal-top` has in its slot, still there:
       *   "otherwise, put that card into your hand" (Sin Prodder). Put, not
       *   drawn, and not "returned" for anything watching for that.
       * - `"stack"` — a **spell** to its owner's hand (Unsubstantiate,
       *   Venser, Shaper Savant — not Remand, which counters the spell and
       *   is the `counter` effect's `into: "hand"`). Not a counter
       *   (rule 701.5): "can't be countered" doesn't stop it, and nothing
       *   that watches for a spell being countered sees it. A copy of a spell
       *   ceases to exist instead (rule 707.10c); an ability on the stack
       *   isn't a card and is left alone. With `"source"`, the spell that is
       *   itself resolving — "return Release the Ants to its owner's hand"
       *   — goes to its owner's hand instead of their graveyard as the final
       *   part of its resolution (rule 608.2n), as a bought-back spell does
       *   (exiled instead if it was cast with flashback).
       *
       * A commander returned to hand from any of these may go to the command
       * zone instead (rule 903.9b), exactly like a bounced one.
       *
       * `"where-discarded"`, with `"source"` off a `this-discarded` trigger:
       * from the graveyard or the exile the discard put it in, still there as
       * the same object (Quagnoth's rulings).
       */
      readonly from?: ReturnToHandZone | "where-discarded";
    }
  | {
      /** Return every battlefield permanent matching `filter` to its owner's
       * hand (Cyclonic Rift, overloaded: "Return each nonland permanent you
       * don't control to its owner's hand"). Mirrors `destroy-all`. */
      readonly kind: "return-to-hand-all";
      readonly filter: CardFilter;
      /** "… **target player** controls" (Sleep, Ajani Vengeant's −7, Settle
       * the Wreckage): `filter` read from the side of whoever the permanent
       * or player in this target slot is — its `controlledBy: "you"` is
       * them. Nothing happens once that target is illegal. */
      readonly controlledByTarget?: number;
    }
  | {
      /** Exile every battlefield permanent matching `filter`, as one event
       * (rule 603.10a — each one's leaves-the-battlefield ability sees the
       * rest go too). Farewell's "Exile all artifacts". A token stack goes
       * whole. The mass form of `exile`, as `destroy-all` is of `destroy`. */
      readonly kind: "exile-all";
      readonly filter: CardFilter;
      /** "… **target player** controls" (Sleep, Ajani Vengeant's −7, Settle
       * the Wreckage): `filter` read from the side of whoever the permanent
       * or player in this target slot is — its `controlledBy: "you"` is
       * them. Nothing happens once that target is illegal. */
      readonly controlledByTarget?: number;
      /** "Airbend all other creatures" (rule 701.65a — Avatar's Wrath): each
       * card exiled this way may be cast by its owner for {2}, as the
       * `exile` effect's `airbend`. */
      readonly airbend?: boolean;
      /** Not the permanent in this target slot — "choose up to one target
       * creature, then airbend all **other** creatures" (Avatar's Wrath). An
       * empty slot spares nothing; a lone target gone illegal has the spell
       * not resolve at all (608.2b). */
      readonly exceptTarget?: number;
      /** "Exile each nonland permanent with mana value 2 or less **until
       * this enchantment leaves the battlefield**" (Temporary Lockdown): as
       * `exile`'s `untilSourceLeaves` (rule 610.3), for every card this
       * exiles — nothing at all if the source has already left (610.3a). */
      readonly untilSourceLeaves?: boolean;
      /** "Exile all **other** permanents you control" (Worldgorger Dragon):
       * never the effect's own source. */
      readonly exceptSource?: boolean;
      /** Exile them **with this source** (rule 607.2a), as `exile`'s
       * `linked`: a later ability of it reaches "the exiled cards" —
       * Worldgorger Dragon's leaves trigger, a `return-exiled-by-source` of
       * `linked: "battlefield"`. */
      readonly linked?: boolean;
    }
  | {
      /** "This Case becomes solved" (rule 719.3a) — a Case's "To solve —"
       * trigger (the `caseToSolve` helper): the source gets the solved
       * designation, if it's still the same object on the battlefield. */
      readonly kind: "solve";
    }
  | {
      /** "You may collect evidence N" (rule 701.59a — Surveillance Monitor,
       * Izoni): the controller may exile any number of cards from their
       * graveyard with total mana value N or more — offered only while it
       * holds that much (701.59b), and declining is choosing none. "If you
       * do" / "when you do" is `then`, with the exiled cards as its targets,
       * run only when evidence was collected. */
      readonly kind: "collect-evidence";
      readonly amount: number;
      readonly then?: EffectSpec;
    }
  | {
      /** "If you do, it becomes plotted" (rule 702.170c): a card an
       * instruction just exiled is plotted — its owner may cast it from exile
       * without paying its mana cost, as a sorcery, on a later turn. The `then`
       * of a `look-and-choose` that exiles ("you may exile a nonland card …
       * from your hand", Kellan Joins Up; "… from among them", Make Your Own
       * Luck), whose chosen card is its target 0. Nothing for a card no
       * longer in exile, a token, or one already plotted. */
      readonly kind: "become-plotted";
      readonly target: EffectTargetRef;
    }
  | {
      /** Put a target permanent into exile — or, with `"trigger-object"`,
       * the card a dies trigger is about, only while it's still that object
       * in the graveyard it went to (rule 400.7 — "you may exile it", Myrkul,
       * Lord of Bones). A `this-way` `"exiled"` condition is "if you do". */
      readonly kind: "exile";
      /** A target slot or a reference — `"trigger-recipient"` as `destroy`
       * reads it: "whenever this creature deals damage to a creature, exile
       * **that creature**" (Pit Spawn). */
      readonly target: EffectTargetRef;
      /** "Exile it **with a croak counter on it**": counters the card gets
       * as it's exiled, there. */
      readonly withCounters?: { readonly kind: string; readonly amount: number };
      /**
       * Haunt (rule 702.55a): "exile it **haunting target creature**" — the
       * creature in this target slot, which the exiled card then haunts
       * (702.55b — `GameObject.haunting`, read by its `haunted-dies`
       * trigger). With `"trigger-object"` (a creature's dies trigger, the
       * `haunt()` helper) or the resolved spell card (`hauntSpell()`).
       */
      readonly haunting?: number;
      /**
       * Exile **until this source leaves the battlefield** (Banishing Light,
       * Conclave Tribunal — rule 610.3): the card returns, under its owner's
       * control, as a one-shot effect right after the source leaves — no
       * triggered ability, so the card carries none (`GameObject.exiledUntil`,
       * the source's stint; `exiledBy` for "cards exiled with it").
       *
       * If the source has left before the exile happens (or is back as a new
       * object), nothing is exiled at all (rule 610.3a/b); if the exiled card
       * moves on to somewhere else, nothing comes back.
       */
      readonly untilSourceLeaves?: boolean;
      /**
       * Exile until something other than this source (rule 610.3), the same
       * way: `{ targetLeaves: N }` — "exile target creature or enchantment you
       * don't control **until target enchantment you control leaves the
       * battlefield**" (Calix, Destiny's Hand), nothing exiled once target
       * slot N is illegal or gone; `"opponent-becomes-monarch"` — "**until an
       * opponent becomes the monarch**" (Palace Jailer), any opponent of the
       * effect's controller, the next time one does (`GameObject.exiledUntilMonarch`).
       */
      readonly until?: { readonly targetLeaves: number } | "opponent-becomes-monarch";
      /**
       * "You may cast that card for as long as it remains exiled, and mana of
       * any type can be spent to cast that spell" (Hostage Taker): the
       * effect's controller gets an impulse permission to *cast* the card
       * this put into exile (a land stays put) — `"while-exiled"`, or
       * `"end-of-turn"` for "this turn", or any other
       * {@link ImpulseDuration}: Scholar of Combustion's "until the end of
       * your next turn" — with `spendAs` for that cast alone (rule 118.14).
       * `play`: "you may **play** it" — a land too (rule 305.1), Victor
       * Mancha's. A token exiled ceases to exist (rule 111.7), so there's
       * nothing to cast. The rest is {@link ExilePermission}: `byOwner`,
       * `free`, `tax` and `landsEnterTapped`.
       */
      readonly mayCast?: ExilePermission;
      /** The card is in a hand, a `choose-random-card`'s find there: "reveals
       * a card at random from their hand … exile it" (Planeswalker's
       * Mischief). Only with this does `exile` reach a hand, so a target that
       * has been bounced in response stays where it went. */
      readonly fromHand?: true;
      /**
       * **Airbend** it (rule 701.65a): exile it, and for as long as the card
       * remains exiled its *owner* may cast it by paying {2} rather than its
       * mana cost (`GameObject.airbended`, the `"airbend"` cast). A token
       * exiled ceases to exist (111.7), so there's nothing to cast; a land
       * card can't be cast at all.
       */
      readonly airbend?: boolean;
      /**
       * Exile it **with this source** (rule 607.2a): the card is linked to the
       * source's battlefield stint (`GameObject.exiledWith`), so a later
       * ability of that object reaches "the cards exiled with" it — Colfenor's
       * Urn's "return those cards" (`return-exiled-by-source`'s `linked`) —
       * and the source counts it for good (`exiled-with-source`), even once it
       * has left exile again. Nothing is linked when the source isn't a
       * permanent.
       */
      readonly linked?: boolean;
    }
  | {
      /**
       * "Choose a creature type", then do `then` with it — as a spell or
       * ability *resolves* (Crippling Fear, Distant Melody), as opposed to
       * `CardDefinition.chooseCreatureTypeOnEnter`, which asks as a permanent
       * enters.
       *
       * Raises a `choose-creature-type` decision over every creature type
       * (rule 205.3m); resolution resumes from the decision once it's
       * answered, with `CHOSEN_CREATURE_TYPE` substituted into `then`. The
       * enclosing ability's targets and X carry across.
       */
      readonly kind: "choose-creature-type";
      readonly then: EffectSpec;
      /** Types that can't be chosen — "choose a creature type other than
       * Wall" (Imagecrafter, Standardize). */
      readonly exclude?: readonly string[];
      /** A fixed list to choose among instead of the creature types, as
       * buttons — "the basic land type of your choice" (Tideshaper Mystic:
       * `BASIC_LAND_TYPE_CHOICES`, with `prompt: "Choose a basic land
       * type"`), substituted into `then` the same way. */
      readonly options?: readonly string[];
      readonly prompt?: string;
      /** The answer is kept on this effect's source as its chosen creature
       * type (`GameObject.chosenCreatureType`, which `ofChosenType` reads),
       * while it's still the permanent it was (rule 400.7). */
      readonly remember?: true;
      /** "**Secretly** choose Human, Merfolk, or Goblin" (A Killer Among Us),
       * only with `remember`: the answer stays out of the log and is kept
       * hidden as `GameObject.secretChoice` until a `revealChosen` cost shows
       * it. */
      readonly secret?: true;
      /** The placeholder this answer goes into in `then`, in place of
       * `CHOSEN_CREATURE_TYPE`: what lets a second choice nest inside the
       * first — Vision Charm's "choose a land type and a basic land type.
       * Each land of the first chosen type becomes the second chosen type"
       * (`FIRST_CHOSEN_TYPE` here, `CHOSEN_CREATURE_TYPE` under it). */
      readonly sentinel?: string;
    }
  | {
      /**
       * "Choose a card name" (rule 201.4) as a spell or ability *resolves*
       * (Memoricide, Wood Sage, Cursed Scroll), then do `then` with it —
       * as opposed to `CardDefinition.chooseCardNameOnEnter`, which asks as a
       * permanent enters. Raises a `choose-card-name` decision over every name
       * `filter` allows ("a nonland card name"); resolution resumes from the
       * answer with `CHOSEN_CARD_NAME` substituted into `then` — `{ hasName:
       * CHOSEN_CARD_NAME }` is "a card with the chosen name". The enclosing
       * ability's targets and X carry across.
       *
       * `chooser` is a target slot holding the player who names it, when that
       * isn't the controller (Vexing Arcanix's "target player chooses a card
       * name"). `remember` keeps the name on this effect's source permanent,
       * for its other abilities' "the chosen name" (`CardFilter.chosenName`):
       * Petrified Hamlet's "when this land enters, choose a land card name",
       * Medomai's Prophecy's chapter II, Day of the Moon's "a name chosen for
       * this enchantment" — kept only while the source is still the permanent
       * it was (rule 400.7).
       */
      readonly kind: "choose-card-name";
      readonly filter?: CardNameFilter;
      readonly aim?: CardNameAim;
      readonly chooser?: number;
      readonly remember?: true;
      readonly then?: EffectSpec;
    }
  | {
      /**
       * "Choose a colour / a card type / a number / a counter on …" as a
       * spell or ability *resolves*, then do `then` with it — the controller
       * chooses, and nobody can respond knowing the answer (Dromar's ruling:
       * "you choose the color during resolution"). Unlike a resolution-time
       * `modal` with one mode per value, the value can be any number, or one
       * read off the game, and `then` is written once.
       *
       * - `"color"`: one of the five (rule 105.1), `CHOSEN_COLOR` in `then` —
       *   Persecute's `discard-hand` of `{ colors: [CHOSEN_COLOR] }`.
       * - `"card-type"`: one of rule 205.2a's (`CARD_TYPE_CHOICES`),
       *   `CHOSEN_CARD_TYPE` in `then` — Blood Oath.
       * - `"counter-kind"`: a kind of counter on the object in target slot
       *   `on` ("choose a counter on target permanent" — Ichormoon Gauntlet),
       *   or on any permanent its controller controls matching `among`;
       *   `CHOSEN_COUNTER` in `then`. With no counter there, nothing is
       *   chosen and `then` doesn't happen (Clockspinning's ruling: "nothing
       *   happens").
       * - `"number"`: a whole number from `min` (default 0), up to `max` when
       *   the card bounds it — the `choose-number` decision. `then` reads it
       *   as `"x"`, so `then` can't also read the spell's own {X} — but `max`
       *   can: "put **up to X** +1/+0 counters on this creature" is read
       *   before the answer replaces it. `who` is who chooses, when that
       *   isn't the effect's controller: Diminishing Returns' "each player
       *   draws **up to seven** cards" is a `for-each-player` of this with
       *   `"that-player"`. `remember` keeps the answer on the source as the
       *   number it chose (`GameObject.chosenOnEnter`, read as `{ chosenNumber
       *   }`), the last one replacing any before it: Shapeshifter's "you may
       *   choose a number" at each upkeep. Several players choosing one number
       *   each, kept for later steps or kept secret, is a `vote`'s
       *   `for: { number }`.
       *
       * The colour, card type and counter kind are asked as a short menu
       * (the `choose-creature-type` decision with `options`). The enclosing
       * ability's targets and X carry across.
       */
      readonly kind: "choose-value";
      readonly value: "color" | "card-type" | "counter-kind" | "number" | "text-word";
      readonly then: EffectSpec;
      /** With `"text-word"` (a `change-text`'s words, `CHOSEN_TEXT_WORD` in
       * `then`): the colour words, the basic land types, or both
       * (`text-change.ts`'s `textWords`), less `except`. */
      readonly words?: "color" | "land-type" | "color-or-land-type";
      readonly except?: string;
      readonly on?: number;
      readonly among?: CardFilter;
      readonly min?: number;
      readonly max?: EffectAmount;
      /** A number's question, when it isn't "Choose a number" — a
       * `counters-distributed` share's "How many +1/+1 counters on …?". */
      readonly prompt?: string;
      /** A number's chooser — see `"number"` above. Naming nobody, nothing is
       * asked and `then` doesn't happen. */
      readonly who?: EffectPlayerRef;
      /** See `"number"` above. */
      readonly remember?: true;
    }
  | {
      /**
       * "Target player reveals their hand" (rule 701.20a): every card in it
       * is shown to every player and stays there. A later effect of the same
       * `sequence` counts them as `{ thisWay: "revealed" }` — Blood Oath's
       * "for each card of the chosen type revealed this way". `who` as
       * `discard-hand`'s: a target slot, a scope, or one player named.
       */
      readonly kind: "reveal-hand";
      readonly who: PlayerScope | number | ChosenPlayerRef;
    }
  | {
      /** Return everything this effect's source exiled with
       * `exile { untilSourceLeaves }`, to the battlefield under its owner's
       * control. The other half of an O-Ring. */
      readonly kind: "return-exiled-by-source";
      /** `"hand"`: instead, put the cards linked to this source (rule
       * 607.2a — hideaway's, `GameObject.exiledWith`) into their owners'
       * hands — Watcher for Tomorrow's "When this creature leaves the
       * battlefield, put the exiled card into its owner's hand", which
       * reaches the cards exiled by the stint that left. `"battlefield"`: put
       * those linked cards onto the battlefield under their owners' control,
       * together — Colfenor's Urn's "return those cards to the battlefield",
       * the cards its `exile { linked }` put there, found though the Urn has
       * just been sacrificed. `"graveyard"`: into their owners' graveyards —
       * with `others`, Mimic Vat's "return each other card exiled with this
       * artifact to its owner's graveyard". */
      readonly linked?: "hand" | "battlefield" | "graveyard";
      /** With `linked: "battlefield"`: "**put** all cards exiled with it
       * onto the battlefield" (Underworld Sentinel) — under the control of
       * the player putting them there, the effect's controller (rule
       * 110.2a), not their owners' as a "return" is (610.3c). */
      readonly under?: "you";
      /** With `linked`: only the **other** cards exiled with
       * it — not the ones this resolution has just exiled (Mirror of Life
       * Trapping's "exile it, then return all other permanent cards exiled
       * with this artifact", Mysterious Limousine's "return each other card
       * exiled with this Vehicle", Moonring Mirror's into a hand). */
      readonly others?: true;
      /** With `linked: "battlefield"` or `"hand"`: only the linked cards this
       * takes ("all other **permanent** cards" — rule 110.4b; Bottled
       * Cloister's "all cards **you own** exiled with this artifact"), read in
       * exile. The rest stay exiled with it. */
      readonly filter?: CardFilter;
      /** With `linked: "battlefield"`: they enter tapped (Timothar, Baron of
       * Bats's Bat). */
      readonly enterTapped?: true;
    }
  | {
      /** "The exiled card" of a token's own ability (Hofri Ghostforge's "it
       * has 'When this token leaves the battlefield, return the exiled card to
       * its owner's graveyard'"; Timothar, Baron of Bats's "it gains …"): each
       * token this resolution created holds what it exiled, in
       * `GameObject.linkedExile`, and that token's `return-exiled-by-source`
       * of `linked` then reaches those cards alone, however many others the
       * card that made it has exiled (rule 607.2a). A copy of the token isn't
       * linked (the rulings). Goes after the `exile` and the `create-token`.
       * `gains` is abilities the tokens gain with no end, an effect on them
       * and so not copiable (rule 707.2): Hofri's "it has" is a copy exception
       * (`exceptions.triggered`) instead. */
      readonly kind: "link-exiled-to-created";
      readonly gains?: readonly TriggeredAbility[];
    }
  | {
      /**
       * Put a targeted card onto the battlefield — reanimation that names a
       * specific card, as opposed to `return-from-graveyard`'s filter over
       * your own graveyard. With `underYourControl` the card enters under the
       * *resolving* player's control even though its owner is someone else
       * (Gravespawn Sovereign: "put target creature card from a graveyard
       * onto the battlefield under your control").
       */
      readonly kind: "put-onto-battlefield";
      /** An `EffectTargetRef` so it can also name the object that fired the
       * trigger — Undying returns *itself*, which is never a chosen target. */
      readonly target: EffectTargetRef;
      readonly underYourControl?: boolean;
      /** Under someone else's control — "target opponent … puts target
       * creature card from your graveyard onto the battlefield under their
       * control" (The Beamtown Bullies: `{ target: 0 }`). Their default
       * control, like `underYourControl`'s (rule 110.2 — the permanent is
       * exiled if they leave the game, rule 800.4a). Naming nobody (an
       * illegal or empty slot, a player who has left) puts nothing anywhere
       * (rules 608.2b, 800.4b). */
      readonly under?: EffectPlayerRef;
      readonly enterTapped?: boolean;
      /** Counters it enters with (Undying: "with a +1/+1 counter on it";
       * Admiral Brass, Unsinkable: "with a finality counter on it" — a
       * finality counter needs nothing more, since `moveObject` reads it). */
      readonly withCounters?: { readonly kind: string; readonly amount: number };
      /** "If it would leave the battlefield, exile it instead of putting it
       * anywhere else" (Whip of Erebos) — sets
       * `GameObject.exileIfItWouldLeave` on the permanent it becomes: a
       * replacement effect of this resolution, which nothing that removes
       * abilities touches. `"ability"` is "it **gains** 'If this creature
       * would leave the battlefield, exile it …'" (Geth, Thane of Contracts):
       * an ability, granted in layer 6 on a modifier, so losing all
       * abilities afterwards takes it away (rule 613.1f, Humility). */
      readonly exileIfItWouldLeave?: boolean | "ability";
      /** "…onto the battlefield **transformed**" (Ojer Axonil's "return it
       * to the battlefield tapped and transformed") — a transforming
       * double-faced card enters with its back face up. */
      readonly transformed?: boolean;
      /** "…return it to the battlefield **flipped**" (Homura, Human
       * Ascendant) — it enters with the flipped status (rule 710), so a flip
       * card is its alternative half from the moment it enters. */
      readonly flipped?: true;
      /** The card types it has, replacing its own, for as long as it stays
       * on the battlefield — the Enduring cycle's "return it to the
       * battlefield under its owner's control. It's an enchantment. (It's
       * not a creature.)" is `setTypes: ["enchantment"]`. In place as it
       * enters (rule 614.12), so it enters as an enchantment: a "whenever a
       * creature enters" doesn't see it and an enchantment's enters trigger
       * does. The subtypes that went only with the lost types go too (rule
       * 205.1a — no Sheep, no Glimmer); supertypes stay. */
      readonly setTypes?: readonly CardType[];
      /** Subtypes it has **in addition to its other types**, for as long as
       * it stays on the battlefield — Portal to Phyrexia's "put target
       * creature card from a graveyard onto the battlefield under your
       * control. It's a Phyrexian in addition to its other types." In place
       * as it enters, as `setTypes` is: "whenever a Phyrexian enters" sees
       * it arrive as one. */
      readonly addSubtypes?: readonly string[];
      /** The rest of what it is as it enters, in addition to its own — see
       * {@link EnterTypes}: Rise from the Grave's "That creature is a black
       * Zombie in addition to its other colors and types" (`addColors`,
       * `addSubtypes`), Excava's "It's a 1/1 Spirit creature with flying in
       * addition to its other types", Lim-Dûl's "If it's a creature, …"
       * (`ifCreature`). Joined with `setTypes` and `addSubtypes` above. */
      readonly enterAs?: EnterTypes;
      /** "…onto the battlefield under your control **tapped and attacking**"
       * (Chorale of the Void, rule 508.4) — see {@link EnterAttacking}.
       * Pair it with `enterTapped`. */
      readonly attacking?: EnterAttacking;
      /** "…onto the battlefield **attached to** this creature / that
       * creature / target creature" (Magnetic Snuffler, Smoke Shroud,
       * Unfinished Business): the permanent this names — a slot,
       * `"source"`, `"trigger-object"` — and it enters attached to that permanent (rules 303.4i, 301.5e, 303.4h): an Aura that
       * can't legally enchant it — or with nothing there, the permanent
       * having left (rule 400.7) — stays where it is; an Equipment that
       * can't equip it, and anything else, enters unattached. A player in
       * the slot, or a permanent chosen as it enters (`{ among }` — Nomad
       * Mythmaker's "attached to a creature you control"): see
       * {@link AttachHostRef}. */
      readonly attachedTo?: AttachHostRef;
      /** "…onto the battlefield **face down**" — see {@link EnterTypes}'
       * `faceDown`: Missy's "return it to the battlefield under your control
       * face down and tapped. It's a 2/2 Cyberman artifact creature" is
       * `faceDown: "2/2 Cyberman artifact creature"`. */
      readonly faceDown?: true | FaceDownAs;
    }
  | {
      /** Exile every card in a target *player's* graveyard (rule 406 — Bojuka
       * Bog). `target` is a target-slot index holding a player, `"you"` for
       * the effect's own controller with no slot, or `"each-player"` for every
       * graveyard at once (Rest in Peace). needed-cards P8. */
      readonly kind: "exile-graveyard";
      /** `"each-opponent"`: Soul-Guide Lantern's "exile each opponent's
       * graveyard", one move like `"each-player"`. A {@link ChosenPlayerRef}
       * is one player named through a target: Nurgle's Conscription's "exile
       * **that player's** graveyard", the owner of the card it put onto the
       * battlefield (`{ ownerOfTarget: 0 }`). */
      readonly target: number | "you" | "each-player" | "each-opponent" | ChosenPlayerRef;
      /** Only the cards matching this — Living Death's "each player exiles
       * all **creature cards** from their graveyard". */
      readonly filter?: CardFilter;
      /** Exiled **with this source** (rule 607.2a), as `exile`'s `linked`:
       * Nautiloid Ship's "exile target player's graveyard", whose "a
       * creature card exiled with this Vehicle" reads them. Nothing is
       * linked when the source isn't a permanent. */
      readonly linked?: true;
      /** From that player's hand too, in the same move — "exile all noncreature,
       * nonland cards from that player's **hand and graveyard**" (Thought
       * Distortion, Legion's End) — or (`"only"`) from it instead: "exiles all
       * cards from it" (Hour of Glory). A hand holds no public cards, so a
       * `reveal-hand` goes before it. Every match goes: no search, no choice. */
      readonly fromHand?: "also" | "only";
      /** With `fromHand`: **face down** (rule 406.3), nobody may look, their
       * owner included: "target player exiles all cards from their hand face
       * down" (Suppress). `linked` is "the exiled cards" of Induced Amnesia's
       * other ability; a `delayed-trigger`'s `about: "exiled"` is "those
       * cards" (Ignorant Bliss). They have no characteristics there (406.3a). */
      readonly faceDown?: true;
      /** "…**until this artifact leaves the battlefield**" (Idol of Endurance
       * — rule 610.3): nothing is exiled if the source has already left
       * (610.3b); when it leaves, each card goes back to its owner's graveyard,
       * its previous zone, at once. A later ability of the source reaches them
       * as its "cards exiled with" it, as `exile`'s `untilSourceLeaves` does. */
      readonly untilSourceLeaves?: true;
    }
  | {
      /** Each player in `who` sacrifices every permanent matching `filter`
       * they control — Living Death's "then sacrifices all creatures they
       * control": nobody chooses anything, and they all go at once (one
       * event, rule 603.10a). One that can't be sacrificed stays. */
      readonly kind: "sacrifice-all";
      readonly who: PlayerScope;
      readonly filter: CardFilter;
    }
  | {
      /** Reveal cards from the top of a library until `count` cards matching
       * `filter` are revealed — all of it if there aren't that many — put
       * those where `put` says, and the rest where `rest` says: Selvala's
       * Stampede's "reveal cards from the top of your library until you
       * reveal a creature card for each wild vote. Put those creature cards
       * onto the battlefield, then shuffle the rest into your library".
       * Nothing is revealed for a count of 0.
       *
       * `whose` as `reveal-until`'s; the controller's when absent. `exile`:
       * each card exiled, face up, as it goes, rather than revealed
       * (Auspicious Starrix). `put`: `"battlefield"` (absent;
       * together, under their owner's control, each card's "as this enters"
       * choices asked first, rule 614.12 — `tapped` enters them tapped),
       * `"hand"` (Fathom Trawl), or `"with-rest"`, going where the rest goes
       * in one event (Mind Funeral). `rest` is `reveal-until`'s. */
      readonly kind: "reveal-until-count";
      readonly filter: CardFilter;
      readonly count: EffectAmount;
      readonly rest: RevealedCardsGo;
      readonly whose?: number | "that-player" | { readonly controllerOfTarget: number };
      readonly exile?: boolean;
      readonly put?: "battlefield" | "hand" | "with-rest";
      readonly tapped?: boolean;
      /** Set only on the copy parked across an "as this enters" choice. */
      readonly progress?: {
        readonly owner: PlayerId;
        readonly revealed: readonly ObjectId[];
        readonly found: readonly ObjectId[];
      };
    }
  | {
      /** Put `count` of the cards a batched `put-into-graveyard` trigger
       * fired on onto the battlefield under the effect's controller's
       * control — Colossal Grave-Reaver's "whenever one or more creature
       * cards are put into your graveyard from your library, **put one of
       * them onto the battlefield**". Only those still in that graveyard as
       * the same objects (rule 400.7); the controller chooses which when
       * more are left than it takes, and must take that many. A batched
       * `dies` trigger's cards work the same: Rinoa, Angel Wing's "return one
       * of them to the battlefield **tapped under its owner's control with a
       * flying counter on it**" (`enterTapped`, `underOwner`, `withCounters`).
       * A `may` over it isn't offered with none left. */
      readonly kind: "put-arrived-onto-battlefield";
      readonly count: number;
      readonly enterTapped?: true;
      readonly underOwner?: true;
      readonly withCounters?: { readonly kind: string; readonly amount: number };
    }
  | {
      /** Put every card this resolution has exiled so far — from anywhere
       * but the battlefield — onto the battlefield under its owner's
       * control, all at once (Living Death's "then puts all cards they
       * exiled this way onto the battlefield"). A permanent exiled from the
       * battlefield, by a replacement say (Leyline of the Void's), isn't
       * among them (the ruling), nor a card that has left exile since. Each
       * one's "as this enters" choices are asked first (rule 614.12). */
      readonly kind: "put-exiled-this-way-onto-battlefield";
    }
  | {
      /** Put the cards this resolution has exiled so far — each still in
       * exile as the same object (rule 400.7), a permanent it exiled from the
       * battlefield included; a token there has ceased to exist — `to` its
       * owner's zone: `"hand"` is Worlds Within Worlds' "then put all cards
       * exiled this way into their owners' hands". `filter` narrows them
       * (read from the effect's controller's side). A card cast from among
       * them has left exile, so isn't one — Muse Vortex's "the exiled
       * instant and sorcery cards that weren't cast this way". */
      readonly kind: "move-exiled-this-way";
      /** `"library-bottom"` is "put the rest on the bottom of your library
       * in a random order" after exiling them (Herald of Amity, Muse
       * Vortex): each owner's on the bottom of their library, in a random
       * order. */
      readonly to: "hand" | "library-bottom";
      readonly filter?: CardFilter;
    }
  | {
      /** Exile a target permanent, then immediately return it to the
       * battlefield under its owner's control (rule 400.7 — a "blink": the
       * returning permanent is a brand-new object with no memory of the old
       * one, so counters, Auras/Equipment, tapped status, and effects like
       * stolen control all fall off). A token exiled this way ceases to exist
       * and never returns (rule 111.7 / 704.5d). needed-cards P9 — Essence Flux. */
      readonly kind: "flicker";
      /**
       * What is exiled: a target slot, `"source"` (the ability's own
       * permanent — Norin the Wary's "exile Norin"), `"trigger-object"`, or
       * several target slots at once (Ghostly Flicker's "two target …"),
       * which are exiled together and return together — every one is on the
       * battlefield before any of their enters triggers is looked at. `{
       * from }` is every slot from that one on: an "any number of target …"
       * group's members, all at once (Eerie Interlude).
       *
       * `"source"` names the permanent the ability came from *as it was when
       * the ability was put on the stack*: one that has since left and come
       * back is a new object (rule 400.7), and is left alone.
       */
      readonly target: EffectTargetRef | readonly number[] | { readonly from: number };
      /** See {@link FlickerCounters} — Essence Flux's Spirit clause. */
      readonly thenCounters?: FlickerCounters;
      /** Return under the effect's controller's control rather than the
       * owner's (Ghostly Flicker's "under your control"). */
      readonly underYourControl?: boolean;
      /**
       * Return later rather than at once: a delayed triggered ability (rule
       * 603.7) at this step — Norin's "at the beginning of the next end
       * step". The return is *linked* to this exile (rule 610.3): a card that
       * leaves exile in the meantime, even to come straight back, is a new
       * object and stays where it is, and nothing is set up at all when
       * nothing was exiled.
       */
      readonly returnAt?: DelayedTriggerTiming;
      /** "…return it to the battlefield **transformed**" (Clive, Ifrit's
       * Dominant) — a transforming double-faced card comes back with its
       * back face up (rule 712.14); anything else returns as usual. */
      readonly transformed?: boolean;
      /** "Return it to the battlefield **tapped**" (Nezahal, Primal Tide):
       * it enters tapped, as it enters (rule 614.1c). */
      readonly tapped?: boolean;
      /** The delayed return's text, for the log and the stack. */
      readonly returnText?: string;
    }
  | {
      /**
       * The delayed half of a `flicker` with `returnAt` — never authored on a
       * card: the flicker builds it as it resolves, since `link` only exists
       * once something has been exiled. Returns every card still in exile
       * carrying `GameObject.flickerLink === link`.
       */
      readonly kind: "return-flickered";
      readonly link: string;
      readonly thenCounters?: FlickerCounters;
      readonly underYourControl?: boolean;
      readonly transformed?: boolean;
      readonly tapped?: boolean;
    }
  | {
      /**
       * A meld card's "if you both own and control ~ and a [type] named
       * [its counterpart], exile them, then meld them into [the combined
       * back face]" (rules 701.42, 712.4a — Graf Rats, Hanweir Battlements).
       * As it resolves: if the source is still the permanent it was (rule
       * 400.7) and its controller owns and controls it and a permanent
       * matching `partner` (`{ name, type }`), both are exiled — one event —
       * and then put onto the battlefield as one melded permanent with
       * `into`'s characteristics (`GameObject.melded`, 712.14c). With more
       * than one such partner, the controller chooses which (the
       * `choose-permanents` decision). Cards that can't be melded — a token,
       * a card that isn't of `into`'s pair — stay in exile (701.42b–c).
       */
      readonly kind: "meld";
      readonly partner: CardFilter;
      /** The combined back face: a definition whose `meldOf` is the pair. */
      readonly into: string;
      /** Never authored: the partner already chosen, in target slot 0 —
       * the `choose-permanents` answer's `then`. */
      readonly chosen?: true;
    }
  | {
      /** Counter a target spell on the stack — it moves to its owner's
       * graveyard without resolving (rule 701.5). A spell that can't be
       * countered stays on the stack and resolves, and a copy of a spell
       * ceases to exist rather than going anywhere (rule 707.10c). */
      readonly kind: "counter";
      /** A target slot, or `"trigger-object"` — the spell whose casting
       * fired this trigger, untargeted: Vexing Bauble's "whenever a player
       * casts a spell, if no mana was spent to cast it, counter that spell". */
      readonly target: EffectTargetRef;
      /**
       * `"hand"`: if the spell is countered this way, put it into its
       * owner's hand instead of into their graveyard (Remand). Still a
       * counter — it does nothing to a spell that can't be countered — unlike
       * `return-to-hand` with `from: "stack"`, which isn't one. `"exile"`:
       * "exile it instead of putting it into its owner's graveyard"
       * (Transcendent Dragon, whose `cast-now` of the same slot then finds it
       * there — a spell that wasn't countered is still on the stack, where
       * nothing is cast from).
       */
      readonly into?: "hand" | "exile";
      /** "If a permanent's ability is countered this way, activated
       * abilities of that permanent can't be activated this turn"
       * (Trickbind, Interdict): an ability countered by this effect locks its
       * source for the rest of the turn — only while the source is still the
       * permanent it was as the ability was put on the stack (rule 400.7),
       * and not at all when nothing was countered. */
      readonly lockSource?: true;
      /** "If a permanent's ability is countered this way, destroy that
       * permanent" (Green Slime, Teferi's Response): `effect` with **the
       * ability's source** as its target 0 — only while the source is still
       * the permanent it was as the ability was put on the stack (rule 400.7),
       * and only when the ability was countered. `filter`: "if an ability of an
       * artifact, creature, or planeswalker is countered this way" (Tishana's
       * Tidebinder). `evenIfNotCountered`: "counter … and destroy that artifact
       * if it's on the battlefield" (Ouphe Vandals), no "this way" about it. */
      readonly thenSource?: {
        readonly effect: EffectSpec;
        readonly filter?: CardFilter;
        readonly evenIfNotCountered?: true;
      };
    }
  | {
      /**
       * `effect` once for each spell and/or ability on the stack as this begins,
       * nobody choosing, each bound in turn to target slot 0 — "counter all
       * abilities your opponents control" (Kadena's Silencer: `abilities: true`,
       * `whose: "opponent"`, `effect: { kind: "counter", target: 0 }`), "exile all
       * other spells" (Summary Dismissal: `spells: true`). Never what's resolving
       * (it is still on the stack, rule 608.2n), which is why "other" needs no
       * field. A mana ability is never on the stack (rule 605.3b). An ability
       * object standing for several copies is that many turns. `effect` mustn't
       * stop to ask anything.
       */
      readonly kind: "for-each-on-stack";
      readonly spells?: true;
      readonly abilities?: true;
      /** Only those this player controls, the effect's controller's side. */
      readonly whose?: "you" | "opponent";
      readonly effect: EffectSpec;
    }
  | {
      /** A player gains control of a permanent (rule 613.1b, layer 2): a
       * control effect timestamped as it resolves, recorded on
       * `GameObject.controlEffects`; the latest one on the permanent wins
       * (rule 613.7). `untilEndOfTurn` ends it in the cleanup step (Act of
       * Treason); otherwise it lasts until the permanent changes zones, or
       * until the player it gives control to leaves the game (rule 800.4a),
       * when the latest effect still standing applies again.
       *
       * `who` gains control: the effect's controller by default ("gain
       * control of target …"); a player slot — "target opponent gains control
       * of target permanent you control" (Zedruu the Greathearted's
       * `{ target: 0 }`); or a player the event names — "that player gains
       * control of ~" at the beginning of each player's upkeep (Alexios,
       * Deimos of Kosmos's `"active-player"`, with `target: "source"`). A
       * target found illegal as the spell or ability began to resolve —
       * the permanent's slot or the player's — makes it do nothing (rule
       * 608.2b; `ResolutionContext.illegalTargets`). */
      readonly kind: "gain-control";
      readonly target: EffectTargetRef;
      readonly untilEndOfTurn: boolean;
      readonly who?: EffectPlayerRef;
      /** "**For as long as this creature remains on the battlefield**, gain
       * control of that permanent" (Opportunistic Dragon): the control
       * effect ends as the effect's source leaves — nothing at all if it
       * already has (rule 611.2b). Not with `untilEndOfTurn`. */
      readonly whileSource?: boolean;
      /** "…for as long as ~ remains tapped": it ends as the source untaps or
       * leaves — nothing if it's already untapped. Not "for as long as you
       * control ~ and ~ remains tapped" (Rubinia Soulsinger): that's this
       * with `whileYouControlSource`. */
      readonly whileSourceTapped?: boolean;
      /** "For as long as you control ~" (Aladdin): it ends as the source
       * leaves or changes hands — nothing if you don't control it as it
       * would begin. With `whileSourceTapped`, both (Rubinia Soulsinger). */
      readonly whileYouControlSource?: boolean;
      /** "Gain control of that permanent **until the end of your next turn**"
       * (Stilt-Man, Towering Terror). With `untilEndOfTurn: false`. */
      readonly until?: UntilPointDuration;
    }
  | {
      /**
       * Exchange control of two permanents (rule 701.12b): each one's
       * controller gains control of the other at once, as one lasting effect
       * with one timestamp — Switcheroo's "two target creatures", Avarice
       * Totem's "this artifact and target nonland permanent" (`"source"`).
       * All or nothing (701.12a): if either has left the battlefield or is
       * an illegal target now (608.2b), or one player controls both, nothing
       * changes hands. `then` is done if they were exchanged (Volatile
       * Stormdrake's "If you do"), `otherwise` if not (Gilded Drake's "If you
       * don't or can't make an exchange, sacrifice this creature").
       */
      readonly kind: "exchange-control";
      readonly objects: readonly [EffectTargetRef, EffectTargetRef];
      readonly then?: EffectSpec;
      readonly otherwise?: EffectSpec;
    }
  | {
      /**
       * "You and target opponent each gain control of all creatures the other
       * controls until end of turn" (Reins of Power, Twist Allegiance): every
       * permanent matching `filter` that you control goes to `with`, and
       * every one `with` controls comes to you, both sets fixed before
       * anything moves (rule 611.2c) and changing hands at once with one
       * timestamp (613.7b). Not worded as an exchange, so one side having
       * none doesn't stop the other (701.12a doesn't apply). Nothing if
       * `with` is no longer in the game or an illegal target (608.2b).
       */
      readonly kind: "exchange-control-all";
      readonly filter: CardFilter;
      readonly with: EffectPlayerRef;
      readonly untilEndOfTurn: boolean;
    }
  | {
      /** Every battlefield permanent matching `filter` (read from the
       * effect's controller's side) changes control at once — one effect, so
       * one timestamp (rule 613.7b): "gain control of all nonland permanents
       * until end of turn" (Dihada, Binder of Wills), "gain control of all
       * commanders" (Tevesh Szat, Doom of Fools). `who` is `gain-control`'s,
       * plus `"owner"` — "each player gains control of all creatures they
       * own" (Homeward Path). A token stack changes hands whole.
       * `exceptSource` spares the effect's own source. `controlledBy:
       * "trigger-player"` keeps only the permanents the player the trigger
       * names controls — Hellkite Tyrant's "gain control of all artifacts
       * **that player** controls" — and does nothing once they've left the
       * game. (A `CardFilter`'s own `controlledBy` can't name one seat at a
       * 3-4 player table.) */
      readonly kind: "gain-control-all";
      readonly filter: CardFilter;
      readonly untilEndOfTurn: boolean;
      readonly who?: EffectPlayerRef | "owner";
      readonly exceptSource?: boolean;
      readonly controlledBy?: "trigger-player";
      /** Only what the player in this target slot controls (or the
       * controller of the permanent there) — Call for Aid's "gain control of
       * all creatures **target player** controls" (as `destroy-all`'s).
       * Nothing once that target is illegal (rule 608.2b). */
      readonly controlledByTarget?: number;
    }
  | {
      /** "Each player gains control of all [`filter`] controlled by the next
       * player in the chosen direction" (Aminatou, the Fateshifter's −6).
       * `"left"` is the next player in turn order (rule 101.4: turn order
       * passes to the left) and `"right"` the one before, skipping anyone
       * who has left the game. What each player gets is fixed first, then
       * every change happens at once, as one lasting effect with one
       * timestamp (rule 613.7b) — in a two-player game the boards simply
       * swap, whichever way was chosen. `exceptSource` spares the effect's
       * own source ("other than Aminatou"). "Choose left or right" as it
       * resolves is a `modal` with one of these per mode. */
      readonly kind: "rotate-control";
      readonly direction: "left" | "right";
      readonly filter: CardFilter;
      readonly exceptSource?: boolean;
    }
  | {
      /** `target` gains "This creature can't be sacrificed" (Jon Irenicus,
       * Shattered One) — until end of turn, or (`"permanent"`) for as long
       * as it stays on the battlefield. A modifier, like a keyword grant;
       * the static form is `StaticAbility.cantBeSacrificed`, which says what
       * it stops (rule 701.21a). */
      readonly kind: "cant-be-sacrificed";
      readonly target: EffectTargetRef;
      readonly duration: PtDuration;
    }
  | {
      /** `target` "can block an additional creature this turn" (Act of
       * Heroism) — `amount` more attackers than the one rule 509.1a allows,
       * or `"any"` number (Give No Ground). A modifier like a keyword grant;
       * the static form is `StaticAbility.blockAdditional`. */
      readonly kind: "block-additional";
      readonly target: EffectTargetRef;
      readonly amount: number | "any";
      readonly duration: PtDuration;
    }
  | {
      /** Target player puts the top `amount` cards of their library into
       * their graveyard. `target: "you"` = the effect's controller, with no
       * target slot (Aftermath Analyst's "mill three cards"). */
      readonly kind: "mill";
      /** A target slot holding a player, or a scope — `"you"` (Aftermath
       * Analyst) or `"each-opponent"` (Hope Estheim: "each opponent mills X
       * cards"), a per-player amount read for each. A slot holding an
       * object is "**its controller** mills …" (Broken Ambitions' "that
       * spell's controller mills four cards"): whoever controls it, or did
       * as it last existed (rule 608.2h). A {@link ChosenPlayerRef} is one
       * player named through a target whichever it is — Geth's "**that
       * player** mills X cards", the owner of the card it took
       * (`{ ownerOfTarget: 0 }`), whoever controls it now. */
      readonly target: number | PlayerScope | ChosenPlayerRef;
      readonly amount: EffectAmount;
    }
  | {
      /** Exile cards from the top of a library, face up, with no permission
       * to play them (`impulse-exile` is that): "exile the top three cards
       * of target player's library" (`amount`), or all but the bottom few —
       * Nicol Bolas, the Arisen's "exile all but the bottom card of target
       * player's library" (`allBut: 1`, in place of `amount`). `whose` is a
       * target slot holding a player, or a scope (`"you"`, the default). */
      readonly kind: "exile-from-library";
      readonly whose?: number | PlayerScope;
      readonly amount?: EffectAmount;
      readonly allBut?: number;
      /** "…and put a fetch counter on each of them" (Pako, Arcane
       * Retriever): counters each card gets in exile. */
      readonly withCounters?: { readonly kind: string; readonly amount: number };
      /** Exiled **with this source** (rule 607.2a — `GameObject.exiledWith`),
       * as `exile`'s `linked`, for its "cards exiled with this": Nightveil
       * Specter's "that player exiles the top card of their library". */
      readonly linked?: true;
      /** **Face down** (rule 406.3), with no permission to play them: `true`
       * is "exile the top card of your library face down. (You can't look at
       * it.)" (Bomat Courier), nobody may look, its owner included; `"looked"`
       * is "look at the top card of your library, then exile it face down"
       * (Kayla's Music Box), and only the effect's controller may, even if
       * another player gains control of a linked source (their rulings). */
      readonly faceDown?: true | "looked";
    }
  | {
      /** "**Turn** the exiled card / all cards exiled with this **face up**"
       * (The Creation of Avacyn, Pyxis of Pandemonium): every card in exile
       * linked to this source (rule 607.2a) is face up from here on, its
       * characteristics back (rule 406.3a), for every player to see. */
      readonly kind: "turn-exiled-face-up";
    }
  | {
      /** Return every card matching `filter` from the effect's controller's
       * graveyard to `destination` (Splendid Reclamation: all land cards to
       * the battlefield tapped — rule 608). `count: "all"` moves every match
       * with no decision; a number raises a `choose-from-zone` decision when
       * there are more matches than that, the rest staying in the graveyard. */
      readonly kind: "return-from-graveyard";
      readonly filter: CardFilter;
      readonly destination: "battlefield" | "hand";
      /** How many, read as it resolves — Worldsoul's Rage's "put **up to X**
       * land cards from your hand and/or graveyard" is `"x"` with `upTo`. */
      readonly count: EffectAmount | "all";
      /** "Return **up to** `count`": fewer may be chosen, so it's always
       * asked. */
      readonly upTo?: boolean;
      /** "…with **total mana value N or less**" (Lively Dirge): the chosen
       * cards' mana values may add up to no more than this, so it's always
       * asked. */
      readonly totalManaValueAtMost?: number;
      /** Battlefield-bound cards enter tapped (Splendid Reclamation). */
      readonly enterTapped?: boolean;
      /** …"with a finality counter on it" (Shilgengar, Sire of Famine) —
       * counters each battlefield-bound card enters with. */
      readonly withCounters?: { readonly kind: string; readonly amount: number };
      /** Every player's graveyard, not only the controller's — Grimoire of
       * the Dead's "put all creature cards from **all graveyards** onto the
       * battlefield under your control": a card someone else owns enters
       * under the effect's controller's control, kept there by a control
       * effect (rule 110.2; it's exiled if they leave the game, 800.4a).
       * With `count: "all"`; with `destination: "hand"` it's Infernal
       * Caretaker's "return all Zombie cards from all graveyards to their
       * owners' hands", each to its owner's (rule 400.3).
       * `"hand-or-graveyard"`: the controller's hand and graveyard together,
       * one choice over both — Kastral, the Windcrested's "a Bird creature
       * card from your hand or graveyard". `"each-graveyard"`: every
       * graveyard, each card under its owner's control — "each player
       * returns all creature cards … from their graveyard to the
       * battlefield" (Patriarch's Bidding), "return all artifact and
       * enchantment cards from all graveyards to the battlefield under their
       * owners' control" (Open the Vaults), all at once. With `count: "all"`
       * only. */
      readonly from?: "all-graveyards" | "hand-or-graveyard" | "each-graveyard";
      /** …with these types and colours in addition to their own, in place
       * as they enter (rule 614.12) — Grimoire of the Dead's "They're black
       * Zombies in addition to their other colors and types". */
      readonly enterAs?: EnterTypes;
      /** "…to the battlefield **attached to** ~" (Danitha, Benalia's Hope's
       * "an Aura or Equipment card from your hand or graveyard"): the
       * permanent this names, and each card enters attached to that permanent (rules 303.4i, 301.5e, 303.4h): an Aura that
       * can't legally enchant it — or with nothing there, the permanent
       * having left (rule 400.7) — stays where it is; an Equipment that
       * can't equip it, and anything else, enters unattached. `{ among }`:
       * each one's host chosen as it enters — see {@link AttachHostRef}. */
      readonly attachedTo?: AttachHostRef;
    }
  | {
      /**
       * Set up a delayed triggered ability (rule 603.7) — "at the beginning of
       * the next end step, <do this>". Whip of Erebos's "exile it at the
       * beginning of the next end step", Arcane Denial's upkeep draws.
       *
       * `effect` is applied when it fires, against the targets the *creating*
       * effect had (a delayed ability's text doesn't say "target", so it
       * chooses none of its own — rules 115.1d, 115.10a, 603.7c),
       * so it refers to them by slot index like any other effect and
       * `"source"` still means the card that set it up.
       */
      readonly kind: "delayed-trigger";
      /** A step ("at the beginning of the next end step"), a permanent
       * leaving the battlefield ("when it dies" — see {@link DelayedLeaves}),
       * the controller's next spell this turn ({@link DelayedNextSpell}), or
       * any event a trigger can name, until end of turn or until your next
       * turn ({@link DelayedWhenever}).
       * Whatever the creating ability's trigger object was ("return **that
       * card** to the battlefield at the beginning of the next end step" —
       * Shirei, Shizo's Caretaker) is the delayed ability's too, unless the
       * spell it waits for is. */
      readonly at:
        | DelayedTriggerTiming
        | DelayedLeaves
        | DelayedNextSpell
        | DelayedUnblocked
        | DelayedWhenever
        | DelayedLosesControl;
      readonly effect: EffectSpec;
      /** Text for the log and the stack. */
      readonly text: string;
      /** Who controls it when it fires — the effect's own controller by
       * default, or the controller of a target slot (Arcane Denial hands its
       * "may draw two cards" to the player whose spell was countered). */
      readonly controller?: { readonly controllerOfTarget: number };
      /** "At the beginning of the next end step, sacrifice **that token**"
       * (Satya, Aetherflux Genius): the delayed ability's targets are what
       * this resolution did this to so far — the token it just created —
       * in place of the creating ability's own. With nothing done, no delayed
       * ability is set up. `"attached"`: its one target is the permanent the
       * source is attached to as this resolves (see {@link EffectTargetRef}) —
       * Wings of Hubris's "sacrifice **it** at the beginning of the next end
       * step", the creature it equipped. */
      readonly about?: ThisWayKind | "attached";
      /** With `about`: set up with nothing done too, for an ability with more
       * to do than act on those cards: Ignorant Bliss's "return those cards to
       * your hand, **then draw a card**" with an empty hand. */
      readonly orNone?: true;
      /** With a `"your-…"` step timing: **that player's** turn, not the
       * controller's, whose ability it stays (rule 603.7d): Suppress's "the end
       * step of that player's next turn". Fixed as this resolves. */
      readonly turnOf?: ChosenPlayerRef;
    }
  | {
      /** "That creature enters with two additional +1/+1 counters on it"
       * (Yuna, Grand Summoner): a spell on the stack — usually the trigger
       * object of a `nextSpell` delayed trigger — enters the battlefield with
       * these counters as it resolves (rule 614.1c: an ETB trigger sees
       * them). Nothing for anything else.
       *
       * `counter: "sunburst"` is "that spell **gains sunburst**" (Solar
       * Array, rule 702.44a): `amount` is ignored, and the spell enters with
       * a counter for each color of mana spent to cast it — +1/+1 counters if
       * it enters as a creature (its copiable types, as a printed sunburst
       * reads them), else charge counters. */
      readonly kind: "enters-with-counters";
      readonly target: EffectTargetRef;
      readonly counter: string;
      readonly amount: EffectAmount;
      /** Only if this holds as it enters, read from the permanent's side: "it
       * gains bloodthirst 3" (Bloodlord of Vaasgoth, rule 702.54a). `amount` is
       * fixed as this resolves. */
      readonly ifAsItEnters?: StaticCondition;
    }
  | {
      /**
       * "You may cast [a card]" while this resolves (rule 608.2g): the
       * effect's controller casts one card now, from wherever it is, by the
       * ordinary casting rules — modes, X, kicker, targets, costs — with
       * timing ignored, or declines. Raised as a `cast-now` decision; a
       * `sequence` step after it waits for the answer. Nothing is asked when
       * nothing can be cast (no legal targets, no way to pay), which is a
       * "don't" for `else`.
       *
       * The card is `target` — "you may cast target instant or sorcery card
       * with mana value 3 or less from your graveyard" (Chandra, Acolyte of
       * Flame's −2), the card a `reveal-until` found (Breaching Dragonstorm),
       * the spell a `counter` just exiled (Transcendent Dragon) — or, with
       * `from`, whichever card the player picks from a zone of theirs: "you
       * may cast a spell with mana value 4 or less from your hand" (Baral's
       * Expertise).
       */
      readonly kind: "cast-now";
      /** The card, when it's one card; absent with `from`. */
      readonly target?: EffectTargetRef;
      /** Who may cast it, when that isn't the effect's controller — "then
       * **they** may cast that card without paying its mana cost"
       * (Transforming Flourish: `{ controllerOfTarget: 0 }`). Nobody, and so
       * nothing offered, once that player has left the game. With `target`
       * only. */
      readonly by?: EffectPlayerRef;
      /**
       * Where the player picks the card from, when it's any of several:
       * their hand, their graveyard ("an instant or sorcery spell from your
       * graveyard" — Diviner of Mist), or "from among" the top `libraryTop`
       * cards of their library, which they look at (Velomachus Lorehold's top
       * seven — see `rest`). An amount, read as this applies: Sunbird's
       * Invocation's "the top X cards, where X is that spell's mana value".
       *
       * `"exiled-with-source"` is "the exiled card" of a linked ability
       * (rule 607.2a): the cards in exile this effect's source exiled, in
       * the battlefield stint the resolving ability refers to — hideaway's
       * (rule 702.75, `GameObject.exiledWith`). The source needn't still be
       * on the battlefield (the ability exists independently of it, rule
       * 113.7a), but a source that has left and come back is a new object
       * whose abilities never reach them (rule 400.7).
       *
       * `"targets"` is the resolving spell's or ability's own target cards
       * still legal — with `repeat`, Diluvian Primordial's "for each
       * opponent, you may cast up to one target instant or sorcery card from
       * that player's graveyard": one at a time, in the order the player
       * chooses, each a "may" of its own (its rulings).
       */
      readonly from?:
        | "hand"
        | "graveyard"
        /** Every player's graveyard — Spectral Arcanist's "you may cast an
         * instant or sorcery spell … **from a graveyard**". A spell cast from
         * another player's graveyard is the caster's to control and its
         * owner's still (rule 108.3). */
        | "any-graveyard"
        | "exiled-with-source"
        | "exiled-this-way"
        /** The cards this resolution has had the effect's controller draw,
         * still in their hand — the Mad Wizard's Lair's "draw three cards
         * and reveal them. You may cast one of them". */
        | "drawn-this-way"
        /** The ability's own source, if this resolution exiled it from the
         * battlefield and it's still in exile — a Siege's "exile it, then
         * you may cast it transformed" (rule 310.12b). */
        | "source-exiled-this-way"
        | "targets"
        /** Ashiok, Nightmare Muse's "from among **face-up cards your
         * opponents own from exile**": every such card as this applies. */
        | "face-up-exile-opponents-own"
        /** The engine's own, before a search of the caster's library goes on
         * (`castWhileSearchingLibrary` — Panglacial Wurm): the cards that may
         * be cast from there, the library looked at. Not for card
         * definitions; `search-library` asks it. */
        | "while-searching"
        | {
            readonly libraryTop: EffectAmount;
            /** "**Reveal** the top X cards" (Sunbird's Invocation): every
             * player sees them (rule 701.16), not only their owner. */
            readonly reveal?: true;
          }
        /** Another player's hand, a hidden zone the caster gets to see whole:
         * "look at that player's hand. You may cast a spell from among those
         * cards without paying its mana cost" (Silent-Blade Oni). The caster
         * controls the spell and its owner still owns it (rule 108.3). A land
         * card is never offered, by `play` alone. `look`: the looking is part
         * of the instruction, so with nothing to cast the hand is still shown
         * and closed; without it the looking came earlier, in a `reveal-hand`
         * (Mindclaw Shaman). */
        | { readonly handOf: EffectPlayerRef; readonly look?: true };
      /**
       * "You may play lands and cast spells **from among** cards exiled this
       * way" — any number of them, one after another while this resolves
       * (Gix, Yawgmoth Praetor: "you must play the cards as you resolve the
       * last ability", its ruling): after each one cast or played, the rest
       * of the cards first offered are offered again, until the player
       * declines or none is left. With `from: "exiled-this-way"` — the cards
       * this resolution exiled before the first offer, still in exile (not
       * one exiled later, as a cost of casting one was paid) — or
       * `"targets"`. Or `libraryTop` with `rest` — ripple (rule 702.60a):
       * "you may cast any of those cards with the same name as this spell
       * without paying their mana costs, then put all revealed cards not
       * cast this way on the bottom of your library in any order", the rest
       * placed once the player declines or nothing is left to cast. Not with
       * `then` or `else`.
       */
      readonly repeat?: boolean;
      /**
       * With `repeat`: "you may cast **up to two** spells from among them"
       * (Collected Conjuring): the offers stop after this many spells cast.
       * Read once, as the first offer is made (rule 608.2h). Not with `play`:
       * a land isn't a spell cast.
       */
      readonly upTo?: EffectAmount;
      /**
       * With `repeat`: "you may cast any number of spells **with total mana
       * value 10 or less** from among them" (Primeval Spawn): a running total
       * — only a spell whose mana value (at X = 0, rule 107.3b, as the spell
       * it would be, rule 202.3) fits what's left is offered, and each one
       * cast spends its own. Read once, as `upTo` is. With `spell`, which then
       * mustn't compare `manaValue` itself.
       */
      readonly totalManaValue?: EffectAmount;
      /**
       * "You may **play** the card", not only cast it: a land card on offer
       * may be played as part of the resolution — only during its player's
       * own turn and with a land play left, which it uses up (rules 305.2a,
       * 305.2b, 305.3); it ignores timing otherwise. A land is never cast
       * (rule 305.9). Without `play` a land card is never offered.
       */
      readonly play?: boolean;
      /**
       * Suspend's own "when the last time counter is removed from this card,
       * if it's exiled, you may play it without paying its mana cost if
       * able" (rule 702.62a) — the engine sets it on the trigger it makes
       * (`Game.suspendTrigger`), with `target: "source"`, `free` and `play`:
       * a creature cast this way has haste, and a card not cast stays
       * exiled, no longer suspended. Not for card definitions.
       */
      readonly suspend?: true;
      /**
       * What the spell cast must be — "an instant or sorcery spell with mana
       * value 4 or less", "if that spell's mana value is 8 or less" —
       * matched against the card as the spell it would be (rule 601.3e): the
       * face being cast (a modal double-faced card's back, an adventure), or
       * its prototype. An `{ amount }` compare is bound as this applies
       * ("mana value X or less" — Electrodominance). The card is judged at
       * X = 0, which is a free cast's X (rule 107.3b), so a mana-value clause
       * goes with `free`.
       */
      readonly spell?: CardFilter;
      /**
       * "…without paying its mana cost" — the only way the card is offered.
       * An alternative cost (rule 118.9), so no other one goes with it
       * (118.9a) and X is 0 (107.3b); additional costs such as kicker may
       * still be paid, and cost increases apply (118.9d).
       */
      readonly free?: boolean;
      /**
       * "You may cast that card **by discarding a card rather than paying
       * its mana cost**" (The Infamous Cruelclaw): an alternative cost
       * (rule 118.9) of one card from the caster's hand, so it's `free` with
       * a discard on top — X is 0, additional costs may still be paid and
       * cost increases apply (118.9d). Not offered with an empty hand.
       */
      readonly byDiscarding?: boolean;
      /**
       * "You may cast that card **by paying an amount of {E} equal to its
       * mana value rather than paying its mana cost**" (Amped Raptor): an
       * alternative cost (rule 118.9) of that much energy (107.14) — `free`
       * with the energy on top, the mana value the spell's as it's cast (its
       * face's, X 0 — 107.3b). Not offered without that much energy.
       */
      readonly byPayingEnergy?: boolean;
      /** "Its owner may cast it **by paying [its madness cost]** rather
       * than paying its mana cost" (rule 702.35a): the card's own madness
       * cost as an alternative cost (702.35b), the only way offered — the
       * madness trigger's cast (`cards/madness.ts`). */
      readonly madness?: boolean;
      /** "You may cast it **by paying [its miracle cost]** rather than its
       * mana cost" (rule 702.94a): the card's own miracle cost as an
       * alternative cost, the only way offered, and only while the card is
       * still in its owner's hand — the miracle trigger's cast
       * (`cards/miracle.ts`). */
      readonly miracle?: boolean;
      /** "If that spell would be put into your graveyard, exile it instead."
       * `"instants-and-sorceries"` is Scholar of the Lost Trove's "if an
       * instant or sorcery spell cast this way would be put into your
       * graveyard": an artifact spell cast this way isn't exiled (its
       * ruling). */
      readonly exileAfter?: boolean | "instants-and-sorceries";
      /** "Cast it **transformed**" (rule 712.11a — a Siege's 310.12b): a
       * transforming double-faced card, cast with its back face up, which
       * enters the battlefield that way (712.13); a card without a back face
       * can't be cast this way. */
      readonly transformed?: true;
      /**
       * Cast **copies** of the card rather than the card (rule 707.12): "copy
       * it, and you may cast the copy" (Narset, Enlightened Exile; Isochron
       * Scepter), "copy that card three times. You may cast the copies"
       * (Mnemonic Deluge). This many copies of each card are created in the
       * card's zone, owned by the caster, and offered in its place, each its
       * own "may" (707.12a — one after another, as `repeat` offers them); the
       * card itself stays where it is. A copy not cast ceases to exist (rule
       * 704.5e), and one cast is a copy of a spell (it ceases to exist leaving
       * the stack, and becomes a token as a permanent spell resolves, 608.3f).
       */
      readonly copies?: EffectAmount;
      /** The encoded card (rule 702.99a — cipher), in the exile stint it was
       * encoded in: the card offered, while it's still that card in exile.
       * Set by the engine on the trigger an encoded card gives its creature
       * (`Game.effectiveTriggeredEntries`), never by a card definition. */
      readonly encoded?: { readonly card: ObjectId; readonly zoneChangeCount: number };
      /** "If you do, …" — a spell was cast this way (Conduit of Worlds: "you
       * can't cast additional spells this turn"). */
      readonly then?: EffectSpec;
      /** "If you don't, …" — nothing was cast, declined or not castable:
       * Breaching Dragonstorm's "put that card into your hand", Baral and
       * Kari Zev's First Mate Ragavan. */
      readonly else?: EffectSpec;
      /** With `libraryTop`: "put the rest on the bottom of your library in a
       * random order" — every card looked at and not cast, once `then` or
       * `else` is done (or, with `repeat`, once nothing more is cast).
       * `"bottom-any-order"` is "…in any order" (ripple, rule 702.60a): the
       * player orders them (rule 401.4), asked only when the order is a
       * choice. Without it they stay where they are. */
      readonly rest?: "bottom-random" | "bottom-any-order";
      /** Set only on the copy parked across the decision. */
      readonly progress?: CastNowProgress;
    }
  | {
      /** "**Choose an exiled card** an opponent owns with a void counter on
       * it. **You may play it this turn** without paying its mana cost"
       * (Dauthi Voidwalker): the effect's controller picks one face-up card
       * in exile matching `filter` (from their side) — nothing is targeted —
       * and may play it this turn: a land as their land play, a spell at its
       * normal timing (the rulings), with `free` only without paying its
       * mana cost. Nothing happens with none to choose. With `linked`, only
       * the cards exiled with this effect's source (rule 607.2a), in the stint
       * the resolving ability refers to: Muse Vessel's "choose a card exiled
       * with this artifact. You may play that card this turn". */
      readonly kind: "choose-exiled-to-play";
      readonly filter?: CardFilter;
      readonly linked?: true;
      readonly free?: boolean;
    }
  | {
      /** "Until end of turn, you may cast that card" — a card in exile
       * (Codie, Vociferous Codex's, found by a `reveal-until`): cast only,
       * this turn, by the effect's controller; with `free`, only "without
       * paying its mana cost". The permission rides on the card as an impulse
       * one (`GameObject.impulse`). */
      readonly kind: "allow-cast-from-exile";
      readonly target: EffectTargetRef;
      readonly free?: boolean;
      /** Warp's "its owner may cast this card **after the current turn has
       * ended** for as long as it remains exiled" (rule 702.185a): the card's
       * owner, not the effect's controller; from the next turn on; with no
       * end but its leaving exile. */
      readonly laterTurns?: boolean;
      /** "**For as long as that card remains exiled**, you may cast it"
       * (Durnan of the Yawning Portal): the effect's controller, with no end
       * but its leaving exile, rather than this turn. */
      readonly whileExiled?: true;
      /** "That spell has **undaunted**" (rule 702.125 — Durnan): cast this
       * way, it costs {1} less for each of its caster's opponents. */
      readonly undaunted?: true;
      /** "…and mana of any type can be spent to cast that spell" (Black Widow,
       * Super Spy): for that cast alone (rule 118.14). */
      readonly spendAs?: SpendAs;
    }
  | {
      /**
       * "Until end of turn, you may cast **a** creature spell **from among
       * cards exiled with this artifact** without paying its mana cost" (Idol
       * of Endurance, rule 607.2a): one spell for each time this resolves,
       * by the effect's controller, keeping its timing and any additional
       * costs. Read over the linked cards as they are when it's cast, so one
       * exiled later this turn counts. `spell` is the spell it may be, judged
       * as the face being cast (an adventure's instant half isn't a creature
       * spell). `free` permits only the free cast.
       *
       * The rest are the same permission's other printings, rule 611.2c's
       * "modifies the rules of the game" all of them, so all read live:
       * `play`: "you may **play** a card" (Raphael, Most Attitude), a land as
       * well, at a land's timing and with a land drop (the rulings), and it
       * spends the permission as a spell would. `anyNumber`: "you may play
       * **cards**" (Kayla's Music Box), which nothing spends — `spell`'s
       * `{ ownedBy: "you" }` is its "cards you own". `reduce`: "spells you cast
       * this way cost {2} less" (generic only — Urianger Augurelt's ruling).
       * A face-down card (rule 406.3a) is reached only by a player who may
       * look at it.
       */
      readonly kind: "allow-cast-linked-exile";
      readonly spell?: CardFilter;
      readonly free?: true;
      readonly play?: true;
      readonly anyNumber?: true;
      readonly reduce?: number;
    }
  | {
      /**
       * Earthbend N, a keyword action: "Target land you control becomes a 0/0
       * creature with haste that's still a land. Put N +1/+1 counters on it.
       * When it dies or is exiled, return it to the battlefield tapped." —
       * Toph, the First Metalbender's "at the beginning of your end step,
       * earthbend 2". `target` is the land — a slot whose spec is a land you
       * control, `"source"` or `"trigger-object"`. Permanent, not until end of
       * turn: it stays a creature for as long as it stays on the battlefield.
       * The return is a delayed triggered ability (rule 603.7), so it
       * survives the land losing its abilities; it returns the card under its
       * owner's control, and only from the graveyard or exile it went to.
       */
      readonly kind: "earthbend";
      readonly target: EffectTargetRef;
      readonly amount: EffectAmount;
    }
  | {
      /**
       * Ninjutsu's effect (rule 702.49a): "put this card onto the battlefield
       * from your hand tapped and attacking" — from the command zone too, for
       * commander ninjutsu (702.49d). It attacks the player, planeswalker or
       * battle the creature returned for its cost was attacking (702.49c,
       * recorded as that cost was paid), and nothing at all if that's gone
       * (508.4a): it still enters, just not attacking. Entering during the
       * declare blockers step or later it's unblocked (508.4d). The card must
       * still be the same object in that zone (rule 400.7), or nothing
       * happens. Written by the `ninjutsu()` helper; nothing else uses it.
       */
      readonly kind: "ninjutsu";
    }
  | {
      /** A Class level bar's effect (rule 716.2a): "this Class's level
       * becomes `level`" — the source's, if it's still the same permanent
       * (rule 400.7). "When this Class becomes level N" triggers on it.
       * Written by the `classLevel()` helper. */
      readonly kind: "gain-class-level";
      readonly level: number;
    }
  | {
      /**
       * Unlock a door of a Room (rule 709.5f) — "unlock a locked door of a
       * Room you control" (Ghostly Dancers): the effect's controller picks
       * one locked door among the Rooms they control, or of the Room in
       * `target` (a slot, `"source"`). `orLock` is Marina Vendrell's "lock or
       * unlock a door of target Room": any door of it, locking an unlocked
       * one (709.5g). With more than one door to choose from the choice is a
       * `choose-modes` as it resolves, one mode per door; with one there's
       * nothing to ask. A door unlocked this way triggers "when you unlock
       * this door" (709.5h).
       */
      readonly kind: "unlock-door";
      readonly target?: EffectTargetRef;
      readonly orLock?: boolean;
    }
  | {
      /** One door's change as an `unlock-door` choice settled it — written by
       * that effect for its modes, never by a card. */
      readonly kind: "set-door";
      readonly object: ObjectId;
      readonly door: "left" | "right";
      readonly lock: boolean;
    }
  | {
      /**
       * "**When you do**, [effect]" — a reflexive triggered ability (rule
       * 603.12): Terra, Herald of Hope's "you may pay {2}. When you do,
       * return target creature card with power 3 or less from your graveyard
       * to the battlefield tapped" is a `may` with `cost: "{2}"` whose
       * `effect` is this. Applying it doesn't do `effect`: it triggers an
       * ability that goes on the stack the next time a player would receive
       * priority, once the spell or ability that made it has finished
       * resolving, and chooses `targets` then — so, unlike a `may`'s `then`,
       * it can target, and players can respond to it. `effect` refers to
       * those targets by slot as any ability does; `"source"`, X and the
       * triggering event are the creating spell's or ability's. Put it where
       * the action has certainly happened: a `may`'s effect (after its cost is
       * paid), a `sacrifice-source`'s `then`.
       */
      readonly kind: "reflexive-trigger";
      readonly targets: readonly TargetSpec[];
      readonly effect: EffectSpec;
      readonly text: string;
      /**
       * A number the creating resolution knows and the reflexive ability
       * needs — read as it triggers, and `{ triggerValue: true }` in
       * `effect`. Tip the Scales: "Sacrifice a creature. When you do, all
       * creatures get -X/-X until end of turn, where X is the sacrificed
       * creature's toughness" — the sacrifice is the spell's, not the
       * ability's, so only the spell's resolution can say what it was
       * (`{ thisWay: "sacrificed", sumOf: "toughness" }`), and players
       * respond to the ability knowing X (its ruling). Without it the
       * reflexive ability carries the creating one's own trigger value.
       */
      readonly value?: EffectAmount;
      /**
       * What "it", "that token" or "that creature" names in `effect`, when
       * that's something the creating resolution knows and the reflexive
       * ability doesn't target: the token it created (`"created"` — Dáin
       * Ironfoot's "create … Axe. When you do, attach it to target creature
       * you control"), the card it put onto the battlefield (`"put-this-way"`
       * — Back for More's "when you do, it fights up to one target creature
       * you don't control"), or its own target (a slot — Curse of the
       * Werefox's "that creature", Behemoth of Vault 0's "that permanent").
       * Read as it triggers, and `"trigger-object"` in `effect` and in
       * amounts: one object, followed as any trigger object is, so one that
       * has left by the time the ability resolves isn't acted on (rule 400.7)
       * though it's still read as it last existed (608.2h). Naming nothing,
       * the action didn't happen, so nothing triggers (rule 603.12) — a
       * Back for More whose card couldn't return.
       */
      readonly about?: AttachRef;
      /**
       * "When you do, it deals 7 damage divided as you choose among one or
       * two targets" (Death to Our Enemies): the reflexive ability divides an
       * amount among its `any-number` group, as a triggered ability's
       * `divided` does — `{ total, slot }`, with `effect` a `damage-divided`
       * (or `counters-divided`). The number of targets and the split are
       * announced as it's put on the stack (rules 603.12, 603.3d, 601.2d),
       * and a `total` that is an amount is read then.
       */
      readonly divided?: TriggeredAbility["divided"];
    }
  | {
      /**
       * Put a targeted card on top of (or on the bottom of) its owner's
       * library — Academy Ruins, Mortuary Mire, Hall of Heliod's Generosity,
       * all of which recur a graveyard card by putting it back on the deck
       * rather than into a hand.
       *
       * Distinct from `return-from-graveyard`, which is filter-driven and
       * only reaches the effect's own controller's graveyard: this takes a
       * chosen target, so the card and its owner are whatever was targeted.
       */
      readonly kind: "put-on-library";
      /** A target slot, or `"trigger-object"` — Murderous Rider's "when this
       * creature dies, put it on the bottom of its owner's library", found in
       * the graveyard it went to and only there (rule 400.7) — or
       * `"source"`, a spell putting itself there as it resolves (Approach of
       * the Second Sun); a copy of a spell can't go, and ceases to exist as
       * it leaves the stack (rule 707.10a). */
      readonly target: EffectTargetRef;
      /** `{ fromTop: 7 }` is "seventh from the top": under the top six, or
       * on the bottom of a library with fewer than six (the Approach of the
       * Second Sun ruling). `{ ownerChooses }` is "**its owner** puts it on
       * their choice of the top or bottom of their library" (Misleading
       * Motes — `["top", "bottom"]`; Lost Days' "second from the top or on
       * the bottom" — `[{ fromTop: 2 }, "bottom"]`): the owner of what's in
       * target slot `target` (a number) picks one as this resolves.
       * `{ beneathTop }` is "just beneath the top X cards of that library"
       * (Unexpectedly Absent's X, Quarry Colossus's "the number of Plains you
       * control"), read as it resolves: X+1th from the top, or the bottom of
       * a library with X or fewer (as `fromTop`). */
      readonly position:
        | LibraryPosition
        | { readonly ownerChooses: readonly LibraryPosition[] }
        | { readonly beneathTop: EffectAmount };
    }
  | {
      /**
       * Several cards put into their owners' libraries **at once**, as one
       * instruction — Plow Under's "put two target lands on top of their
       * owners' libraries", Forever Young's "put any number of target
       * creature cards from your graveyard on top of your library",
       * Harmonic Convergence's "put all enchantments on top of their owners'
       * libraries". They leave together (one leave event, one graveyard
       * leave), and then each owner, the active player first (rule 101.4),
       * arranges their own cards going to each end in any order (rule 401.4:
       * "the owner of those cards may arrange them in any order") — a
       * `choose-from-zone` order, asked only when the order is a choice
       * (copies of one card aren't). A token goes too, and ceases to exist
       * there (rule 111.8), never ordered.
       *
       * `"owner-chooses"` is "its owner puts it on **their choice of the top
       * or bottom** of their library" (Aetherspouts, Tolarian Contempt):
       * each owner, the active player first, knowing the choices before
       * theirs (the Aetherspouts ruling), chooses which of their own cards
       * go on the bottom — the rest go on top — then everything moves at
       * once and the orders are asked. Battlefield permanents only.
       * A single card "on their choice of …" is `put-on-library`'s
       * `ownerChooses`.
       *
       * `"shuffle"` is "**the owners of those cards shuffle them into their
       * libraries**" (Turn the Earth, Serene Remembrance): the cards go in
       * together and each library a card went into is shuffled (rule
       * 701.24a) — nothing to order, and nobody shuffles with nothing put
       * in. "Shuffle any number of target cards from your graveyard into
       * your library", one library, is Piper's Melody's `for-each-target` of
       * `put-on-library` then `shuffle-library` (Perpetual Timepiece);
       * "target player shuffles up to four target cards from their
       * graveyard into their library", where that player shuffles even with
       * every card gone, is Witness the Future's `put-on-library` and
       * `shuffle-library` with its `target`. The cards count as
       * `"shuffled-into-library"` this way.
       */
      readonly kind: "put-on-libraries";
      /** `{ targetsFrom }`: the target cards in slot `from` on that are still
       * legal (rule 608.2b) — an `any-number` group, or several slots
       * ("two target lands"). `{ all }`: every permanent matching the filter
       * as this resolves, read from the effect's controller's side. */
      readonly what: { readonly targetsFrom: number } | { readonly all: CardFilter };
      readonly position: "top" | "bottom" | "owner-chooses" | "shuffle";
      /** The resolving spell goes with them — "shuffle **Serene Remembrance
       * and** up to three target cards from a single graveyard into their
       * owners' libraries". A copy of a spell can't, and ceases to exist
       * (rule 707.10a). Not with `"owner-chooses"`. */
      readonly withSource?: true;
      /** Set by the engine on the copy it parks between questions. */
      readonly progress?: PutOnLibrariesProgress;
    }
  | {
      /**
       * "Target opponent reveals their hand. You choose a noncreature,
       * nonland card from it. That player discards that card" (Duress,
       * Thoughtseize): the player in slot `target` reveals their whole hand
       * to everyone (rule 701.20), the effect's controller chooses one card
       * matching `filter`, and that player discards it (rule 701.9a — so
       * "whenever a player discards" sees it, and it's `"discarded"` this
       * way). "You choose" isn't optional: with a matching card there, one is
       * chosen; with none, nothing happens. `optional` is "you **may**
       * choose" (Oildeep Gearhulk). `lookOnly` is "look at target player's
       * hand": nothing is revealed, and only the chooser sees it.
       */
      readonly kind: "discard-chosen";
      /** A player target slot, or a player the event names — "**that
       * player** reveals their hand" (Ghastlord of Fugue's
       * `"trigger-player"`). */
      readonly target: number | EffectPlayerRef;
      readonly filter?: CardFilter;
      readonly lookOnly?: true;
      readonly optional?: true;
      /** "Choose **up to X** cards from it" (Discordant Dirge): any number
       * from none to this many, read as it resolves, instead of one. */
      readonly upTo?: EffectAmount;
      /**
       * The player shows only this many cards, not their hand: "target player
       * reveals **three cards from their hand** and you choose one of them"
       * (Blackmail), "**a number of cards** from their hand equal to the
       * number of Swamps you control" (Mire's Toll), read as it resolves.
       * **The hand's owner picks which** (an existing `choose-from-zone`,
       * exactly that many), and those are revealed (rule 701.20a); holding
       * that many or fewer they reveal them all, nothing asked; 0 reveals
       * nothing and nothing is chosen. The choice that follows is over the
       * revealed cards alone. Not with `lookOnly`, `upTo` or `alsoFrom`.
       */
      readonly reveals?: EffectAmount;
      /** How many of the `reveals` cards are chosen: "you choose **two** of
       * them. That player discards those cards" (Noggin Whack). As many as
       * there are, if fewer were revealed. One, when absent. */
      readonly picks?: EffectAmount;
      /**
       * Where the chosen card goes instead of being discarded: `"exile"` —
       * "you choose a nonland card from it and **exile that card**"
       * (Thought-Knot Seer), linked to this permanent's stint (rule 607.2a)
       * unless `unlinked`, for "return the exiled card" (Tidehollow
       * Sculler); `"library-top"` — "put that card on top of that player's
       * library" (Painful Memories); `"battlefield"` — "you may put a
       * creature card from it onto the battlefield **under your control**"
       * (Treacherous Urge). Not a discard, so nothing that looks for one
       * sees it. `"library-bottom"` — "that player puts the chosen card on
       * the bottom of their library" (Psychotic Episode).
       */
      readonly destination?: "exile" | "library-top" | "library-bottom" | "battlefield";
      /** **Another player** chooses from the revealed hand: Rakdos Augermage's
       * "reveal your hand and discard a card **of target opponent's choice**"
       * (`target: "you"`, `chooser: { target: 0 }`). The hand's owner still
       * discards it (rule 701.9a). The effect's controller, when absent. */
      readonly chooser?: EffectPlayerRef;
      readonly unlinked?: true;
      /**
       * With `destination: "exile"`: "exile that card **until this creature
       * leaves the battlefield**" (Kitesail Freebooter, Brain Maggot,
       * Deep-Cavern Bat — rule 610.3): the card goes back to its owner's hand
       * as a one-shot effect right after the source leaves, no trigger to
       * respond to. With the source gone already, the hand is still revealed
       * or looked at, and no card is chosen or exiled (610.3b, their rulings).
       */
      readonly untilSourceLeaves?: true;
      /**
       * One choice over the hand **and** another of that player's zones at
       * once: `{ zone: "graveyard", filter }` — "you choose a nonland card
       * from it **or a card from their graveyard**. Exile that card"
       * (Agonizing Remorse: the hand's cards by the effect's `filter`, the
       * graveyard's by this one, any card when omitted); `{ zone:
       * "library-top" }` — "reveals their hand **and the top card of their
       * library**. You choose a card revealed this way" (Psychotic Episode:
       * the top card revealed with the hand, and choosable whatever
       * `filter` says of the hand). A card must be chosen if any may be,
       * from either zone (Agonizing Remorse's ruling); with nothing in
       * either, nothing is asked. Not with a discard: only `destination`
       * moves a graveyard's or library's card.
       */
      readonly alsoFrom?:
        | { readonly zone: "graveyard"; readonly filter?: CardFilter }
        | { readonly zone: "library-top" };
      /**
       * With `destination: "exile"`, what the effect's controller may do with
       * the card chosen, as `exile`'s `mayCast`: Psychic Intrusion's "you may
       * cast that card for as long as it remains exiled, and you may spend
       * mana as though it were mana of any color to cast that spell"
       * (`{ duration: "while-exiled", spendAs: "any-color" }`). Not with
       * `reveals`. Elite Spellbinder's "its owner may play it. A spell cast
       * this way costs {2} more" is `{ duration: "while-exiled", play: true,
       * byOwner: true, tax: { generic: 2 } }`.
       */
      readonly mayCast?: ExilePermission;
    }
  | {
      /**
       * "Look at target player's hand" (Glasses of Urza, Sorcerous Sight,
       * Ingenious Thief): the effect's controller sees the hand of the player
       * in slot `target` and nothing else happens — nothing is revealed to
       * anyone else. Asked as a `choose-from-zone` with nothing to pick
       * (`max: 0`), so the look waits for its viewer to close it.
       */
      readonly kind: "look-at-hand";
      readonly target: number;
    }
  | {
      /** "**Look at the top card of target player's library**" (Mishra's
       * Bauble, Merfolk Observer): the effect's controller sees it, and it
       * stays where it is, hidden from everyone else (rule 401.2). Asked as
       * `look-at-hand` is, a `choose-from-zone` with nothing to pick. An empty
       * library shows nothing and asks nothing. */
      readonly kind: "look-at-library-top";
      readonly target: number;
    }
  | {
      /** Target player discards `amount` cards (their choice, unless it's the
       * effect's own controller). Discards their whole hand if it's smaller.
       * `target: "you"` = the effect's controller, with no target slot
       * (Faithless Looting's "then discard two cards"). */
      readonly kind: "discard";
      /** A target slot holding a player, or a scope ("each opponent discards
       * a card"), or one player named through a target ("its controller
       * discards a card": `{ controllerOfTarget: 0 }`). Each player with a
       * real choice is asked in turn — see `GameState.pendingDiscards`. */
      readonly target: number | PlayerScope | ChosenPlayerRef;
      readonly amount: EffectAmount;
      /** "Discards a card at random" (Hypnotic Specter): nobody chooses —
       * the game picks, with its seeded shuffle. */
      readonly random?: boolean;
      /** "…unless they discard a [land] card" (Compulsive Research): one card
       * matching this is a whole answer by itself, instead of `amount`. */
      readonly unlessOne?: CardFilter;
      /** "Discard **any number of** cards" (Chance, Neheb's "discard any
       * number of cards, then draw that many"): the player picks how many,
       * from none to their whole hand; `amount` is ignored. "That many" after
       * it is `{ thisWay: "discarded" }`. */
      readonly anyNumber?: true;
      /** With `anyNumber`, at most this many, chosen as it resolves: "discard
       * **up to three** cards" (Jaya Ballard). */
      readonly atMost?: EffectAmount;
      /** Only cards matching this can be discarded — "discard **a creature
       * card**" (Hidden Horror, Pack Guardian), "discard any number of
       * **land** cards" (Nantuko Cultivator, with `anyNumber`). With fewer
       * matching cards than `amount`, all of them; with none, nothing. A
       * `may` over it can't be chosen without enough matching cards (Pack
       * Guardian with no land in hand), as `mayBeDone` says. */
      readonly filter?: CardFilter;
      /** Engine-built, never authored: every player of a scoped discard has
       * chosen, so what they chose is discarded now, at once (rule 101.4). */
      readonly release?: true;
    }
  | {
      readonly kind: "modify-pt";
      readonly target: EffectTargetRef;
      readonly power: EffectAmount;
      readonly toughness: EffectAmount;
      readonly duration: PtDuration;
    }
  | {
      /** "Switch target creature's power and toughness until end of turn"
       * (Twisted Image; rule 613.4d — `PtModifier.switchPt`, layer 7d). With
       * `all` instead of a target, each battlefield permanent matching it —
       * Mannichi, the Fevered Dream's "switch each creature's power and
       * toughness". */
      readonly kind: "switch-pt";
      readonly target?: EffectTargetRef;
      readonly all?: CardFilter;
      readonly duration: PtDuration;
    }
  | {
      /** Every battlefield permanent matching `filter` gets +power/+toughness
       * (Garruk Wildspeaker's ult / Overrun: `{ type: "creature",
       * controlledBy: "you" }`, `+3/+3`, `end-of-turn`; Craterhoof Behemoth:
       * `power`/`toughness` `{ countOf: … }` — a live count). */
      readonly kind: "modify-pt-all";
      readonly filter: CardFilter;
      readonly power: EffectAmount;
      readonly toughness: EffectAmount;
      readonly duration: PtDuration;
      /** Spare the effect's own source — "**other** attacking creatures you
       * control with flying" (Steel-Plume Marshal), which is itself an
       * attacking creature with flying. Same clause `damage-all` carries, and
       * for the same reason: a `CardFilter` describes the permanent matched,
       * not its relationship to the source. */
      readonly exceptSource?: boolean;
      /** Scope the filter to a *targeted* player's permanents — Great Oak
       * Guardian's "creatures **target player** controls get +2/+2". A
       * `CardFilter`'s `controlledBy` only knows "you" and "opponent", which
       * can't name one seat at a 3-4 player table, so this makes the filter's
       * "you" mean that player: **pair it with `controlledBy: "you"`** —
       * without it the filter matches every player's creatures. */
      readonly controlledByTarget?: number;
      /** The same scope, for a player the event names rather than a target:
       * "creatures **defending player** controls get -1/-1 until end of turn"
       * (Silumgar, the Drifting Death: `"trigger-player"`, on a
       * `creature-attacks`). Nothing when it names nobody. */
      readonly controlledByPlayer?: EffectPlayerRef;
    }
  | {
      /** Double each matching permanent's *current* power and toughness
       * (Unnatural Growth: "double the power and toughness of each creature
       * you control until end of turn"). Reads each one's own computed P/T
       * individually and adds that much again, unlike `modify-pt-all`'s
       * single shared amount — a 2/2 and a 5/5 both matching become a 4/4
       * and a 10/10, not identical stat lines. */
      readonly kind: "double-pt-all";
      readonly filter: CardFilter;
      readonly duration: PtDuration;
      /** "Double the **power** of each …" (God-Eternal Rhonas): +X/+0 only,
       * X each one's own power as it begins to apply (its ruling). */
      readonly powerOnly?: boolean;
      /** "… each **other** creature you control" — spare the effect's own
       * source, as `modify-pt-all`'s clause does. */
      readonly exceptSource?: boolean;
    }
  | {
      /** Double the number of a specific counter kind on each matching
       * permanent (Kalonian Hydra / Bristly Bill: "double the number of
       * +1/+1 counters on each creature you control") — adds a counter count
       * equal to what's already there. Routes through the same `addCounter`
       * a targeted `add-counter` effect uses, so Doubling Season's
       * replacement still folds in on top (rule ruling: doubling an existing
       * count via an effect and Doubling Season compose to 3x, not 4x). A
       * permanent with none of `counterKind` is untouched. */
      readonly kind: "double-counters-all";
      readonly filter: CardFilter;
      readonly counterKind: string;
    }
  | {
      /** "Double the number of each kind of counter on" one permanent
       * (Deepglow Skate): another counter of each kind for each one already
       * there, put on the way a targeted `add-counter` puts them, so a
       * Doubling Season applies. A permanent with no counters is untouched.
       * `counter` doubles just that kind — Voracious Hydra's "double the
       * number of +1/+1 counters on this creature". */
      readonly kind: "double-counters";
      readonly target: EffectTargetRef;
      readonly counter?: string;
    }
  | {
      /** "For each kind of counter on target permanent or player, give that
       * permanent or player another counter of that kind" (Powerful Broker) —
       * proliferate's own step (rule 701.34a) on one thing, with nothing to
       * choose. Each kind is read before any is added, and each counter is
       * put on as any effect's is, so a Doubling Season applies. A player's
       * energy is a kind of counter too (rule 107.14). With nothing on it,
       * nothing happens.
       *
       * `orRemove`: "…put another counter of that kind on it **or remove one
       * from it**" (Quarry Hauler) — for a permanent, the effect's controller
       * chooses per kind as it resolves (rule 608.2d's choice made on
       * resolution, one `choose-modes` a kind). */
      readonly kind: "another-counter-of-each-kind";
      readonly target: EffectTargetRef;
      readonly orRemove?: true;
    }
  | {
      /** Every battlefield permanent matching `filter` gains `keyword` (Overrun:
       * trample until end of turn). */
      readonly kind: "grant-keyword-all";
      readonly filter: CardFilter;
      readonly keyword: Keyword;
      readonly duration: PtDuration;
      /** Spare the effect's own source — "**other** Spiders you control
       * gain flying" (Cosmic Spider-Man). Same clause as `modify-pt-all`. */
      readonly exceptSource?: boolean;
      /** `filter` read from the side of the player in this target slot (or
       * that permanent's controller) — its `controlledBy: "you"` is them, as
       * `destroy-all`'s: Reins of Power's "those creatures gain haste" for
       * the target opponent's side. Nothing once that target is illegal. */
      readonly controlledByTarget?: number;
    }
  | {
      /**
       * "Gains toxic N" (rule 702.164): one more instance of toxic, adding N
       * to its total toxic value (702.164b) for `duration` — the target's
       * (Aspirant's Ascent: "gains flying and toxic 1 until end of turn"), or
       * every permanent matching `filter` as it resolves, all with one
       * timestamp (Plague Nurse: "each other creature you control with toxic
       * gains toxic 1 until end of turn", `exceptSource`). A loss of all
       * abilities after it takes it away, like a granted keyword (613.7).
       */
      readonly kind: "grant-toxic";
      readonly target?: EffectTargetRef;
      readonly filter?: CardFilter;
      readonly exceptSource?: boolean;
      readonly amount: number;
      readonly duration: PtDuration;
    }
  | {
      /**
       * "Gains protection from [quality]" for a duration (rule 702.16): the
       * target's (Gods Willing: "target creature you control gains protection
       * from the color of your choice until end of turn"), and every other
       * permanent matching `filter` as it resolves (rule 611.2c), all with one
       * timestamp — Brave the Elements' "white creatures you control", Bathe
       * in Light's "target creature and each other creature that shares a
       * color with it". A layer-6 grant (613.1f): a loss of all abilities
       * after it takes it away, like a granted keyword (613.7).
       *
       * `from` is the quality, fixed (`{ colors: ["R"] }`, `{ types:
       * ["artifact"] }`, a `filter` for anything else — "from creatures your
       * opponents control", read from the effect's controller's side and fixed
       * as it resolves), or a {@link ProtectionChoice} made as it resolves,
       * before anything is granted — "the color of your choice", "the card
       * type of your choice" — asked as a `choose-modes` decision, one mode
       * per quality.
       */
      readonly kind: "grant-protection";
      readonly target?: EffectTargetRef;
      readonly filter?: CardFilter;
      readonly exceptSource?: boolean;
      readonly from: ProtectionQualities | ProtectionChoice;
      readonly duration: PtDuration;
    }
  | {
      /**
       * Connive (rule 701.50): the permanent's controller draws `amount`
       * cards (1 by default — "connives X" is an amount), then discards that
       * many, then puts a +1/+1 counter on it for each nonland card
       * discarded. A permanent that has left is still connived with — its
       * last controller draws and discards — but gets no counter (701.50b).
       */
      readonly kind: "connive";
      readonly target: EffectTargetRef;
      readonly amount?: EffectAmount;
      /** Set by the engine on the part it parks while the discard is being
       * chosen: the event the connive's draw began at. Never authored. */
      readonly discardsSince?: number;
    }
  | {
      /**
       * Explore (rule 701.44): the permanent's controller reveals the top
       * card of their library. A land card goes to their hand; otherwise the
       * permanent gets a +1/+1 counter and they may put the revealed card into
       * their graveyard (it stays on top if not). With an empty library
       * nothing is revealed and the counter is still put (the rulings). A
       * permanent that has left still explores as it last existed (701.44c):
       * its last controller reveals, nothing gets a counter, and the card may
       * still go to the graveyard. Then it has explored (701.44b — an
       * `explored` event, whatever was possible). `times` explores again
       * after each one is done ("explores X times" — Jadelight Spelunker); the
       * same card is revealed again if it was left on top. The may is the
       * effect's controller's, so the explorer must be theirs.
       */
      readonly kind: "explore";
      readonly target: EffectTargetRef;
      readonly times?: EffectAmount;
      /** "Each [filter] you control explores" (Hakbal of the Surging Soul's
       * Merfolk): every permanent of the effect's controller matching it as
       * this resolves — a token stack's tokens one by one — explores, one at a
       * time, the controller choosing which goes next (rule 701.44d). `target`
       * is ignored. */
      readonly each?: CardFilter;
      /** Engine-built, never authored: the explorers still to go, and the
       * one exploring now. */
      readonly remaining?: readonly ObjectId[];
      readonly object?: ObjectId;
      /** Engine-built steps, never authored: the revealed card the player
       * chose to put into their graveyard, and the finished exploration. */
      readonly toGraveyard?: ObjectId;
      readonly done?: ExploreResult;
    }
  | {
      readonly kind: "add-counter";
      readonly target: EffectTargetRef;
      readonly counter: string;
      /** A fixed amount, `"x"`, or a live count (Will of the Sultai: "X
       * +1/+1 counters, where X is the number of lands you control" —
       * needed-cards P16). */
      readonly amount: EffectAmount;
      /** Who puts them, when the card says someone else does — "that player
       * … puts a +1/+1 counter on it" (Alexios, Deimos of Kosmos:
       * `"active-player"`). What a "whenever you put … counters" trigger
       * asks (`counter-added`'s `by`). The effect's controller by default. */
      readonly by?: EffectPlayerRef;
      /** The training ability's counter (rule 702.149 — the `training()`
       * helper): putting one or more makes the creature "train" (702.149c),
       * which a `trains` trigger watches for (`counter-added`'s `training`). */
      readonly training?: true;
    }
  | {
      /**
       * Remove `amount` counters of kind `counter` from a permanent — the
       * reverse of `add-counter`: Unbreathing Horde's "prevent that damage
       * and remove a +1/+1 counter from it". Removes as many as there are,
       * up to `amount` (none at all from one with none — its ruling), and
       * announces what it removed (`counter-removed`). Only a permanent
       * still on the battlefield as the same object (rule 400.7) loses any:
       * counters on a card that has left simply ceased to exist (rule 122.2).
       *
       * `amount: "all"` removes every counter of that kind it has — Relic
       * Amulet's kin "remove all +1/+1 counters from it" — and with
       * `counter: "any"`, every counter of every kind: Vampire Hexmage's
       * "remove all counters from target permanent", Blitz Leech's "remove
       * all counters from that creature". `"any"` means nothing with a
       * number (which kind would be the player's choice: that's
       * `remove-counters`). How many came off is the resolution's `thisWay:
       * "counters-removed"` (Nexus Mentality's "draw a card for each counter
       * removed this way").
       */
      readonly kind: "remove-counter";
      readonly target: EffectTargetRef;
      readonly counter: string;
      readonly amount: EffectAmount | "all";
    }
  | {
      /**
       * Remove counters from **every** battlefield permanent matching
       * `filter` — the untargeted, mass form of `remove-counter`: Oblivion
       * Stone's "then remove all fate counters from all permanents" (`amount:
       * "all"`), Aether Snap's "remove all counters from all permanents"
       * (`counter: "any"` too), Pestilent Haze's "remove two loyalty
       * counters from each planeswalker", Heartmender's "remove a -1/-1
       * counter from each creature you control". Which permanents match is
       * read once, before any counter comes off (a "with a fate counter"
       * filter isn't emptied as it goes); each loses as many as it has, up
       * to `amount`. A token stack loses them token by token, all at once —
       * one `counter-removed` with its `tokens`.
       */
      readonly kind: "remove-counter-all";
      readonly filter: CardFilter;
      readonly counter: string;
      readonly amount: EffectAmount | "all";
    }
  | {
      /**
       * Remove counters the effect's controller **chooses** (the
       * `remove-counters` decision, rule 608.2c): "remove a counter from a
       * creature you control. If you do, draw a card" (Mister Hyde, Monster
       * Within — a `this-way` condition on `"counters-removed"` after it),
       * "you may remove three quest counters from among permanents you
       * control" (Overseer of Vault 76 — `among`, `upTo`), "remove a lore
       * counter from each of any number of Sagas you control" (Garnet —
       * `count: "any"`, `perObject: 1`), "remove up to four charge counters
       * from target noncreature artifact" (Gremlin Mine — `target`, `upTo`).
       *
       * From the permanents the controller controls matching `from`, or the
       * one in `target`; `counter` is a kind or `"any"`, `orKinds` more.
       * `count` counters in all — all from one permanent unless `among` —
       * or, `"any"`, as many as the player likes; `upTo` lets fewer (none
       * included) be removed. Fewer than `count` there to remove: as many as
       * there are, the rest of the instruction still done. What came off is
       * the resolution's `thisWay: "counters-removed"`.
       *
       * `counter: "any"` is counters of whatever kinds the player chooses
       * (rule 122.1): Render Inert's "remove up to five counters from target
       * permanent", Thornmantle Striker's "remove X counters from target
       * permanent", Rhys, the Evermore's "remove any number of counters from
       * target creature you control". `anyController` lets `from` reach
       * every permanent on the battlefield, not only the controller's —
       * Eventide's Shadow's "remove any number of counters from among
       * permanents on the battlefield".
       *
       * A **player** as the target (a slot with `orPlayer` — Price of
       * Betrayal's "target artifact, creature, planeswalker, or opponent")
       * gives up their own counters (rule 122.1: poison, energy, experience,
       * rad): how many of each kind is asked kind by kind (a `choose-modes`,
       * only where there's a choice), and all of them come off together once
       * every kind is answered. A player's counters aren't counted "this way"
       * (no card reads it).
       */
      readonly kind: "remove-counters";
      readonly from?: CardFilter;
      readonly anyController?: true;
      readonly target?: EffectTargetRef;
      readonly counter: string;
      readonly orKinds?: readonly string[];
      readonly count: EffectAmount | "any";
      readonly among?: true;
      readonly perObject?: number;
      readonly upTo?: true;
      /** Set by the engine as a player's counters are asked kind by kind
       * (see above). Never authored. */
      readonly playerProgress?: PlayerCounterRemovalProgress;
    }
  | {
      /**
       * **Move** counters from one permanent onto another (rule 122.5): each
       * is removed from `from` (a `counter-removed`) and put onto `to` (a
       * `counter-added` by the effect's controller) — so "whenever one or
       * more counters are put on" triggers and a counter replacement
       * (Doubling Season) apply to the put, and "whenever a counter is
       * removed" to the removal (the rulings on Nesting Grounds, Tidus). If
       * either half isn't possible, neither happens: nothing moves between
       * an object and itself, from one without that kind, or when either
       * has left the battlefield (122.5). Not "put its counters on" — that's
       * `put-counters-of` (122.8, 122.9).
       *
       * - `amount` 1 (the default): "move **a** counter". With `counter`,
       *   one of that kind (Costume Closet's "a +1/+1 counter", graft);
       *   without, of a kind the controller chooses among those on `from`
       *   as this resolves (the Nesting Grounds ruling) — a `choose-modes`
       *   decision, asked only when there are two or more kinds.
       * - `"all"`: every counter on `from` (of `counter`, if given) — The
       *   Ozolith's "move all counters from The Ozolith onto target
       *   creature" (never only some — its ruling).
       * - `"each-kind-missing"`: one of each kind on `from` that `to` has
       *   none of (Goldberry, River-Daughter's "a counter of each kind not on
       *   Goldberry").
       * - `"any"`: "any number of counters" — kind by kind, how many of
       *   each (a `choose-modes`, from none to all of them); `"one-or-more"`
       *   the same, but not none at all (Goldberry's second ability).
       *
       * With `"any"`, one end may be chosen as this resolves instead of
       * named — `{ choose: filter }`, permanents matching it from the
       * controller's side (a `choose-permanents` decision, one at a time,
       * none to stop), never the other end nor one already chosen:
       * Forgotten Ancient's "move any number of +1/+1 counters from this
       * creature onto other creatures" (`to`, with `counter`: how many onto
       * each one chosen, at least one), Slippery Bogbonder's "from among
       * creatures you control onto that creature" (`from`: each one's kinds
       * in turn). Not targets (the Forgotten Ancient ruling).
       */
      readonly kind: "move-counters";
      readonly from: EffectTargetRef | MoveCountersChooser;
      readonly to: EffectTargetRef | MoveCountersChooser;
      readonly counter?: string;
      readonly amount?: 1 | "all" | "each-kind-missing" | "any" | "one-or-more";
      /** "If you do, draw a card" (Goldberry): after the moves, if any
       * counter moved. Not with a chosen end. */
      readonly ifMoved?: EffectSpec;
      /** Set by the engine as an `"any"` move goes on across its decisions.
       * Never authored. */
      readonly progress?: MoveCountersProgress;
    }
  | {
      /**
       * "Put its counters on target creature you control" (Essence
       * Channeler), "put those counters on The Ozolith": the same number of
       * each kind of counter `of` had — read as it last existed on the
       * battlefield (rule 608.2h) — put onto `target`. Not a move (rules
       * 122.8, 122.9, and every such card's ruling): nothing is removed,
       * and two such abilities each put the full set (The Ozolith and a
       * dying Iron Apprentice). Each kind is put as `add-counter` puts it,
       * so a doubler applies, and -1/-1 counters go too (the rulings).
       */
      readonly kind: "put-counters-of";
      readonly of: AmountRef;
      readonly target: EffectTargetRef;
    }
  | {
      /**
       * Put counters on **every** battlefield permanent matching `filter`
       * (Loyal Guardian: "put a +1/+1 counter on each creature you control").
       * The untargeted, mass form of `add-counter`; routes through the same
       * per-permanent path, so a `would-add-counter` replacement (Doubling
       * Season) still composes.
       */
      readonly kind: "add-counter-all";
      readonly filter: CardFilter;
      readonly counter: string;
      /** `"own-toughness"`: each permanent gets as many as its own
       * toughness — Canopy Gargantuan's "a number of +1/+1 counters on each
       * other creature you control equal to **that creature's** toughness".
       * Every permanent's toughness is read before any counter goes on, so
       * none is sized by another's new counters. */
      readonly amount: EffectAmount | "own-toughness";
      /** Spare the effect's own source — "put a +1/+1 counter on each
       * **other** creature you control" (Finneas, Ace Archer). */
      readonly exceptSource?: boolean;
      /** Spare the object in this target slot — "put a +1/+1 counter on
       * target creature you control … also put a +1/+1 counter on each
       * **other** creature you control" (Moment of Glory). */
      readonly exceptTarget?: number;
      /** As on `modify-pt-all`: the filter is read from the side of the
       * player in this target slot — Requisition Raid's "each creature
       * **target player** controls" is `{ type: "creature", controlledBy:
       * "you" }` with slot 0. That player gone (an illegal target), it puts
       * none (rule 608.2b). */
      readonly controlledByTarget?: number;
      /** The filter read from the side of "that player" instead — Misfortune's
       * "each creature **that player** controls", the opponent who chose its
       * mode (`CastModalSpec.chosenBy`). Nobody there, and it puts none. */
      readonly controlledByPlayer?: "that-player";
      /** With `controlledByTarget`: that player is the one who puts them —
       * Shadrix Silverquill's "target player **puts** a +1/+1 counter on
       * each creature they control" — for "whenever you put" (Hapatra). */
      readonly putByTarget?: true;
    }
  | {
      /** "You gain hexproof until end of turn" (Lazotep Plating). A *player*
       * can't be targeted by opponents' spells or abilities; permanents
       * gaining hexproof is `grant-keyword-all` instead. */
      readonly kind: "grant-player-hexproof";
      readonly who?: PlayerScope;
    }
  | {
      /**
       * "As you cast spells from your hand this turn, they gain cascade"
       * (Yidris, Maelstrom Wielder): the spells the effect's controller casts
       * for the rest of the turn — from `castFrom`, when given — have
       * `triggered` (a `this-cast` cascade) as they're cast, whatever happens
       * to the source. Each resolution adds its own (the ruling: twice is
       * cascade twice). Ends with the turn (rule 514.2).
       *
       * With `next`, only **the next** spell matching `filter` (and
       * `castFrom`) the controller casts this turn: "the next noncreature
       * spell you cast this turn has cascade" (Dark Apostle), "the next
       * instant or sorcery spell you cast this turn can't be countered"
       * (Overmaster), "the next spell you cast this turn has convoke" (Wand
       * of the Worldsoul). The first such spell cast after this resolves
       * uses it up as it becomes cast (rule 601.2i), whatever else it has —
       * and the grant is then that spell's alone, for as long as it's on the
       * stack; a later spell, or one already on the stack, never has it.
       * `convoke` is judged as the spell is being cast (rule 702.51a — its
       * costs are paid before 601.2i), by the spell that would use the grant
       * up. Without `next`, every matching spell cast this turn has it.
       */
      readonly kind: "grant-spells-this-turn";
      readonly castFrom?: readonly ZoneType[];
      /** Which spells, read from the controller's side as each is cast
       * ("noncreature", "creature", "instant or sorcery"). */
      readonly filter?: CardFilter;
      /** Only the next matching spell this turn (see above). */
      readonly next?: true;
      readonly triggered?: readonly TriggeredAbility[];
      /** The spell **can't be countered** (rule 701.5f) — read as
       * `grantsToSpells.cantBeCountered` is. */
      readonly cantBeCountered?: true;
      /** The spell has **convoke** (rule 702.51). */
      readonly convoke?: true;
      /** "That creature enters with an additional +1/+1 counter on it"
       * (Savage Summoning): the spell enters the battlefield with these
       * counters as it resolves, as `enters-with-counters` gives. */
      readonly entersWithCounters?: { readonly counter: string; readonly amount: number };
      /** "The next spell you cast this turn **costs {1} less to cast**"
       * (Hardened Berserker), "{X} less, where X is the number of Wizards you
       * control as this ability resolves" (Kaza, Roil Chaser): generic mana
       * off the spell's total cost (rule 601.2f), read as this resolves and
       * fixed from then on, and never its colored requirements or its mana
       * value (the rulings). Several grants all reach the one next spell. */
      readonly reduceGeneric?: EffectAmount;
      /** "The next noncreature spell you cast this turn **has affinity for
       * artifacts**" (Don & Raph, Saheeli): {1} less for each permanent
       * matching this that its caster controls as the spell is cast (rule
       * 702.41a), so nothing's fixed as this resolves. Several are cumulative
       * (the Don & Raph ruling). */
      readonly affinityFor?: CardFilter;
      /** "Rather than pay the mana cost of the next spell you cast this turn,
       * you may pay life equal to that spell's mana value" (Marshland
       * Bloodcaster, with `next`): an alternative cost the spell may be cast
       * for (rule 118.9), X 0 (107.3b). Casting it for anything else still
       * uses the grant up (the rulings). */
      readonly payLifeManaValue?: true;
    }
  | {
      /**
       * Populate (rule 701.36a) — choose a creature token you control and
       * create a token that's a copy of it (Rootborn Defenses). With two or
       * more to choose from, the controller picks one on the board (a
       * `choose-permanents`); with one, it's copied without asking.
       */
      readonly kind: "populate";
    }
  | {
      /**
       * Amass N (rule 701.47a) — "Amass Zombies 2": put N +1/+1 counters on
       * an Army you control; it's also a `creatureType`. If you control no
       * Army, create a 0/0 black Army creature token first. With two or more
       * Army creatures (a changeling is one too, rule 702.73a), the controller
       * chooses which (a `choose-permanents`).
       *
       * One effect rather than a `conditional` + `create-token` +
       * `add-counter` sequence, because "an Army you control" has to be the
       * *same* Army across the create and the counters — the whole point of
       * the mechanic is that repeated amassing grows one creature.
       */
      readonly kind: "amass";
      readonly amount: EffectAmount;
      /** The creature type amass names; the Army gains it (701.47a). */
      readonly creatureType: string;
      /** Who amasses, when that isn't the effect's controller — Azog, Moria's
       * Ruin's "**its controller** amasses Goblins X" (`{ controllerOfTarget:
       * 0 }`, as the creature last existed): their Army, their choice among
       * several, their token. */
      readonly who?: EffectPlayerRef;
      /** Set only by the engine: the Army chosen, as the target slot a
       * `choose-permanents` binds it to — never authored. */
      readonly onto?: number;
    }
  | {
      /**
       * Monstrosity N (rule 701.37a): "If this permanent isn't monstrous, put
       * N +1/+1 counters on it and it becomes monstrous." Always about the
       * ability's own source ("this permanent"), and only while it's the same
       * object on the battlefield (rule 400.7): one that has left, or that is
       * monstrous already, has nothing happen to it, and fires no
       * `becomes-monstrous` trigger (the rulings). `amount` may be `"x"` for
       * "Monstrosity X" (701.37c).
       */
      readonly kind: "monstrosity";
      readonly amount: EffectAmount;
    }
  | {
      /**
       * Renown N's effect (rule 702.112a): "if it isn't renowned, put N +1/+1
       * counters on it and it becomes renowned." Always about the ability's
       * own source, and only while it's the same object on the battlefield
       * (rule 400.7): one that has left, or is renowned already (a second
       * instance of renown, 702.112c), has nothing happen to it and fires no
       * `becomes-renowned` trigger. The `renown()` helper's trigger.
       */
      readonly kind: "renown";
      readonly amount: EffectAmount;
    }
  | {
      /**
       * Proliferate (rule 701.27): choose any number of permanents and/or
       * players with counters on them, then give each another counter of each
       * kind already there. Raises a `proliferate` decision — the choice is
       * the card, and choosing nothing is legal.
       */
      readonly kind: "proliferate";
      /** Applied once the choice is answered — Contentious Plan's
       * "Proliferate. Draw a card." Predates a `sequence` waiting for a
       * decision one of its steps raises, which now does the same. */
      readonly then?: EffectSpec;
    }
  | {
      /**
       * Time travel (rule 701.56a — Wibbly-wobbly, Timey-wimey): for each
       * permanent its controller controls with a time counter on it and each
       * suspended card they own with one, they may put a time counter on it
       * or remove one, all at once (the rulings). Raises a `time-travel`
       * decision; with nothing eligible, nothing happens. A suspended card
       * whose last time counter comes off is cast as suspend says (rule
       * 702.62a), and a permanent's last coming off fires its
       * `counters-removed` triggers (vanishing's sacrifice). The rest of a
       * `sequence` waits for the answer.
       */
      readonly kind: "time-travel";
    }
  | {
      /**
       * Time counters on exiled cards, which then have suspend (rule
       * 702.62b — a card is suspended if it's in exile, has suspend, and has
       * a time counter on it). Two forms:
       *
       * - Without `target`, the cards this resolution exiled this way that
       *   are still in exile and match `filter` each get `timeCounters` —
       *   "for each nonland card exiled this way, put a number of time
       *   counters on that card equal to its mana value. If it doesn't have
       *   suspend, it gains suspend" (The Parting of the Ways).
       * - With `target`, that one card is exiled from wherever it is (a
       *   library, the stack) with them — "exile that card with three time
       *   counters on it. If it doesn't have suspend, it gains suspend"
       *   (Sibylline Soothsayer's card found; Rory Williams' own spell).
       *
       * `"mana-value"` is each card's own mana value. A card given no time
       * counter (a mana value of 0) isn't suspended — 702.62b wants one —
       * and stays in exile as an ordinary exiled card. With
       * `onlyWithSuspend`, only cards with suspend printed get counters and
       * none gains it (Ecstatic Beauty: "put four time counters on each of
       * those cards that has suspend").
       */
      readonly kind: "give-suspend";
      readonly timeCounters: EffectAmount | "mana-value";
      readonly target?: EffectTargetRef;
      readonly filter?: CardFilter;
      readonly onlyWithSuspend?: true;
    }
  | {
      readonly kind: "grant-keyword";
      readonly target: EffectTargetRef;
      readonly keyword: Keyword;
      readonly duration: PtDuration;
    }
  | {
      /**
       * Incubate N (rule 701.53a): create an Incubator token (rule 111.10i —
       * a double-faced artifact token, "{2}: Transform this token.", whose
       * back is a 0/0 Phyrexian artifact creature) that **enters with** N
       * +1/+1 counters — as it enters, so what changes how counters are put
       * (Doubling Season, Hardened Scales) applies.
       */
      readonly kind: "incubate";
      readonly amount: EffectAmount;
    }
  | {
      /**
       * "Remove target attacking or blocking creature from combat" (rule
       * 506.4 — Labyrinth of Skophos): it stops being an attacking,
       * blocking, blocked or unblocked creature; a creature it was blocking
       * stays blocked (509.1h). Nothing for one not in combat.
       */
      readonly kind: "remove-from-combat";
      readonly target: EffectTargetRef;
    }
  | {
      /**
       * "Target creature **loses flying** until end of turn" (Emerald Charm):
       * the keywords are taken away in layer 6 at this effect's timestamp
       * (rule 613.7) — from what had them before, printed or granted earlier;
       * a grant after it gives one back. `target` is one permanent; `filter`
       * instead is each permanent matching it as this resolves (rule 611.2c
       * — "permanents your opponents control lose hexproof and
       * indestructible until end of turn", Shadowspear), all with one
       * timestamp.
       */
      readonly kind: "lose-keywords";
      readonly target?: EffectTargetRef;
      readonly filter?: CardFilter;
      /** With `filter`: read from the side of the player in this target slot
       * — Quick Draw's "creatures **target opponent** controls" is `{ type:
       * "creature", controlledBy: "you" }` here. Nothing when that target
       * has gone illegal (rule 608.2b). */
      readonly controlledByTarget?: number;
      readonly keywords: readonly Keyword[];
      readonly duration: PtDuration;
      /** "… and can't have hexproof or shroud" (Arcane Lighthouse): for the
       * duration, what it reached can't have these at all, whatever gives
       * them and whatever the timestamps (`PtModifier.cantHaveKeywords`). */
      readonly cantHave?: boolean;
    }
  | {
      /**
       * A continuous effect for the controller, for a while — an emblem that
       * expires, at this turn's cleanup (`"end-of-turn"`) or as their next
       * turn begins (`"until-your-next-turn"`). `reduceSpells` is "spells you
       * cast this turn that are black and/or red cost {X} less to cast, where
       * X is the amount of life you lost this turn" (Rowan, Scion of War —
       * `applies` a filter, `reduceGeneric` an amount read as this resolves
       * and fixed from then on, rule 611.2b); `castFromHandFree` is "you may
       * cast spells from your hand this turn without paying their mana costs"
       * (Yusri, Fortune's Flame), `filter` narrowing which. `damageTo` is
       * "until your next turn, if a source would deal damage to that player
       * or a permanent that player controls, it deals double that damage
       * instead" (`who: "trigger-player"`, `multiplier: 2`, `permanentsToo`)
       * — the players fixed as it resolves; the effect is still the
       * controller's, and ends with it.
       *
       * The game-outcome locks, each over the players a scope names as it
       * resolves: `cantLoseGame` ("you can't lose the game this turn"),
       * `cantWinGame` ("your opponents can't win the game this turn" —
       * `"each-opponent"`), `cantLoseLife` ("players can't lose life this
       * turn", rule 119.8), and `damageLifeFloor` ("until end of turn, damage
       * that would reduce your life total to less than 1 reduces it to 1
       * instead" — `floor: 1`). Angel's Grace, Everybody Lives!.
       */
      readonly kind: "player-effect";
      /** `"this-combat"`: gone as the combat phase ends (rule 500.5a, 506.1) —
       * "they can't attack you this combat" (Champions of Minas Tirith). */
      readonly duration:
        | "end-of-turn"
        | "this-combat"
        | "until-your-next-turn"
        | "until-end-of-your-next-turn"
        | "rest-of-game";
      /** "You have no maximum hand size until your next turn" (Enter the
       * Infinite), "… for the rest of the game" (Praetor's Counsel). */
      readonly noMaxHandSize?: PlayerScope;
      /** `allCasters`: every player's matching spells, not only the
       * controller's — Cheering Fanatic's "spells with the chosen name cost
       * {1} less to cast this turn". */
      readonly reduceSpells?: {
        readonly applies: CardFilter;
        readonly reduceGeneric: EffectAmount;
        readonly allCasters?: true;
      };
      /** "Until your next turn, **your opponents can't cast spells** with the
       * chosen name" (Academic Probation, Comply): the players `who` names as
       * this resolves can't cast spells matching `filter` (from the
       * controller's side); `lands` — "and lands with the chosen name can't be
       * played" (Conjurer's Ban, rule 305.2). `label` names them in the log.
       * `from`: only cards cast or played from these zones — Memory Vessel's
       * "until your next turn, … they can't play cards from their hand"
       * (`filter: {}`, `lands`, `from: ["hand"]`), judged where the card is
       * as the cast or play begins (601.2a). */
      readonly cantCast?: {
        /** `{ ownerOfTarget }`: "that creature's owner" (Reflector Mage). */
        readonly who: PlayerScope | { readonly ownerOfTarget: number };
        readonly filter: CardFilter;
        readonly label: string;
        readonly lands?: true;
        readonly from?: readonly ZoneType[];
      };
      readonly castFromHandFree?: { readonly filter?: CardFilter };
      /** "You can cast **only one more spell** this turn" (Irencrag Feat):
       * the players `who` names (default you) may cast `count` more spells
       * while this lasts, whatever they've cast so far — counted from this
       * resolving, so the spell doing it isn't one of them. A prohibition
       * (rules 101.2, 601.3): it stops a cast another effect allows or
       * instructs, it permits nothing, and it leaves lands and abilities
       * alone (the rulings). */
      readonly castsLeft?: { readonly who?: PlayerScope; readonly count: number };
      /** "You may cast spells this turn as though they had flash" (Borne
       * Upon a Wind, Emergence Zone; Winding Canyons' `filter` "creature
       * spells") — rule 601.3b; with `next`, "**the next** sorcery spell you
       * cast this turn can be cast as though it had flash" (Quicken): the
       * next matching spell the controller casts uses it up, whenever it's
       * cast. A filter's `ofChosenType` is the source's chosen creature type
       * as this resolves, fixed from then on (Progenitor's Icon — nothing
       * chosen, no effect). */
      readonly castAsThoughFlash?: { readonly filter?: CardFilter; readonly next?: true };
      /** "You may cast Zombie spells from your graveyard this turn"
       * (Liliana, Untouched by Death's −3): a permission over the
       * controller's graveyard cards matching `filter`, the ones that reach
       * it later this turn included (its ruling), each cast following its
       * own timing and costs — the same graveyard-permission cast a
       * `castFromGraveyard` static offers, never used up.
       *
       * The rest widen it (rule 601.3: an effect that allows a player to
       * cast a spell from a zone other than their hand):
       * - `whose`: whose graveyards it reaches, fixed as this resolves —
       *   `"each-player"` is The Great Work's "from any graveyard",
       *   `"trigger-player"` Whispersteel Dagger's "from that player's
       *   graveyard". The caster controls a spell cast from another
       *   player's graveyard; its owner still owns it (rule 108.3).
       * - `once`: "you may cast **a** creature spell from that player's
       *   graveyard this turn" (Whispersteel Dagger) — one cast, then it's
       *   used up.
       * - `spendAs`: "…and you may spend mana as though it were mana of any
       *   color to cast that spell" (rule 609.4b), only for a spell cast
       *   under this permission.
       * - `exileAfterwards`: "if a spell cast this way would be put into a
       *   graveyard, exile it instead" (The Great Work's chapter III). */
      readonly castFromGraveyard?: {
        readonly filter: CardFilter;
        readonly whose?: PlayerScope;
        readonly once?: true;
        readonly spendAs?: SpendAs;
        readonly exileAfterwards?: true;
      };
      /** "You may play lands and cast spells **from that player's hand** this
       * turn" (Sen Triplets — rule 601.3): the player in this target slot,
       * for the effect's controller, by the ordinary rules for timing, costs
       * and the land drop (rule 305). The caster controls what they cast, its
       * owner still owns it (rule 108.3). A `via: "other-hand"` cast. */
      readonly playFromHandOf?: number;
      /** "…and plays with their hand revealed" (Sen Triplets): the player in
       * this target slot, to every player, while this lasts. */
      readonly handRevealed?: number;
      readonly damageTo?: {
        readonly who: PlayerScope;
        readonly multiplier: number;
        readonly permanentsToo?: boolean;
      };
      /**
       * A would-deal-damage replacement for a duration, made by a spell or an
       * ability (rule 614.1a): "if a red source you control would deal damage
       * to a permanent or player this turn, it deals that much damage plus 2"
       * (The Flame of Keld: `plus`, `source`), "if a source would deal damage to
       * a player or battle this turn, … plus 2" (Rankle and Torbran: `to`), "if
       * any source would deal 1 or more damage … this turn, it deals 2 damage"
       * (Equal Treatment: `setTo`). `plus` is fixed as this resolves (`"x"`
       * reads the ability's X); `source` is asked from your side as the damage
       * would be dealt, so a source that arrives later counts.
       */
      readonly damageReplacement?: {
        readonly plus?: EffectAmount;
        readonly setTo?: number;
        readonly source?: CardFilter;
        readonly combat?: boolean;
        readonly to?: "player-or-battle";
      };
      readonly cantLoseGame?: PlayerScope;
      readonly cantWinGame?: PlayerScope;
      readonly cantLoseLife?: PlayerScope;
      /** "Until your next turn, your opponents can't cast spells from
       * anywhere other than their hands" (Avatar's Wrath — `"each-opponent"`,
       * fixed as it resolves): a rule about casting (101.2), so no
       * permission gets past it — a commander, a flashback, an airbended or
       * impulse-exiled card, a copy cast from exile, all barred. */
      readonly castOnlyFromHand?: PlayerScope;
      readonly damageLifeFloor?: { readonly who: PlayerScope; readonly floor: number };
      /** "Until end of turn, if one or more tokens would be created under
       * your control, twice that many of those tokens are created instead"
       * (Kaya, Geist Hunter's −2) — `2`. Compounds with a Doubling Season. */
      readonly tokenMultiplier?: number;
      /** "Your life total can't change" (Teferi's Protection — rules 119.7,
       * 119.8): no gain and no loss, from damage or an effect; no life paid
       * but 0; no exchange of life totals. */
      readonly lifeCantChange?: PlayerScope;
      /** "You gain protection from everything" (rule 702.16j): not a target
       * of spells or abilities, not enchanted by Auras, all damage to them
       * prevented. */
      readonly protectionFromEverything?: PlayerScope;
      /** "You … gain protection from the chosen player" (rule 702.16k —
       * Guardian Archon): `who` from `from`, both fixed as this resolves. */
      readonly protectionFromPlayers?: { readonly who: PlayerScope; readonly from: PlayerScope };
      /** "Until your next turn, creatures can't attack you or planeswalkers
       * you control unless their controller pays {2} for each of those
       * creatures" (Forbidding Spirit): the `attackTax` static's cost to
       * attack (rule 508.1h) for a while. `generic` and `life` are read as this
       * resolves (rule 611.2b), a creature; `covers` as on the static, or
       * `"all"`: "this turn, creatures can't attack unless their controller
       * pays {X} for each attacking creature they control" (War Tax), every
       * attack by anyone on anything, its controller's included. */
      readonly attackTax?: {
        readonly generic?: EffectAmount;
        readonly life?: EffectAmount;
        readonly covers?: "you" | "you-and-planeswalkers" | "planeswalkers" | "all";
      };
      /** "This turn, creatures can't block unless their controller pays {X}
       * for each blocking creature they control" (War Cadence): a cost on
       * every block by anyone (rule 509.1d). `generic` and `life` are read as
       * this resolves (rule 611.2b), a creature. */
      readonly blockTax?: { readonly generic?: EffectAmount; readonly life?: EffectAmount };
      /** "Until your next turn, creatures can't attack you" (Chronomantic
       * Escape): every creature, entering later too; `"you-and-planeswalkers"`
       * if the text also names planeswalkers; `"all"`: "creatures can't attack
       * this combat" (Overencumbered); `{ planeswalkers }`: only planeswalkers
       * matching this from the controller's side, "can't attack **Jaces you
       * control**" (Jace, Multiverse Architect). */
      readonly cantAttack?: "you" | "you-and-planeswalkers" | "all" | { readonly planeswalkers: CardFilter };
      /** With `cantAttack`: only the creatures this player controls, whoever
       * that is as the attack is declared — "**they** can't attack you this
       * combat" (Champions of Minas Tirith). Naming nobody, nothing is made. */
      readonly cantAttackBy?: EffectPlayerRef;
    }
  | {
      /**
       * "You win the game" (rule 104.2b): the effect's controller wins, and
       * the game ends at once (104.1) — unless they can't win
       * (`playerCantWinGame`: Platinum Angel's "your opponents can't win the
       * game"), when nothing happens. Wrap it in a `conditional` for the
       * card's "if …" (Thassa's Oracle, Jace's −8), or put that on the
       * trigger as an intervening-if (Felidar Sovereign's upkeep). The
       * draw-from-an-empty-library form (Laboratory Maniac) is a `would-draw`
       * replacement, not this.
       */
      readonly kind: "win-game";
    }
  | {
      /**
       * "You lose the game" / "that player loses the game" (rule 104.3e):
       * each player `who` names (default `"you"`) loses and leaves the game
       * at once (104.5, 800.4a) — unless they can't lose
       * (`playerCantLoseGame`). Players a scope names lose at the same time;
       * if that leaves one player, they win (104.2a), and if it leaves none,
       * the game is a draw (104.4a). `target` is the player in that slot
       * instead — Mirrodin Besieged's "target opponent loses the game" —
       * and nobody, once that target has become illegal.
       */
      readonly kind: "lose-game";
      readonly who?: PlayerScope;
      readonly target?: number;
    }
  | {
      /**
       * "Flip a coin. If you win the flip, [won]. If you lose the flip,
       * [lost]." (rule 705) — the effect's controller flips, on the game's
       * seeded random stream, and `won` / `lost` are their effect after it.
       * `untilLose` is "flip a coin until you lose a flip" (Okaun, Eye of
       * Chaos; Zndrsplt, Eye of Wisdom): every flip won is its own
       * `coin-flipped` event, which a `wins-coin-flip` trigger fires on, and
       * `won` applies once per win.
       */
      readonly kind: "flip-coin";
      readonly won?: EffectSpec;
      readonly lost?: EffectSpec;
      readonly untilLose?: boolean;
    }
  | {
      /**
       * "…, then repeat this process" (rule 608.2c — the instructions in
       * order, again): `effect` once, then again as long as `times`,
       * `again` and `mayAgain` allow, each pass its own "this way" — so
       * "if an Insect card was milled this way" asks about this pass's mill
       * only. A pass that stops to ask something is answered before the
       * next begins. At most `MAX_REPEATS` passes, a guard: a library runs
       * out long before.
       */
      readonly kind: "repeat";
      /** The process — one pass of it. */
      readonly effect: EffectSpec;
      /** How many passes in all: "proliferate X times" (Expansion
       * Algorithm), "repeat the following process X times" (Torment of
       * Hailfire), "repeat this process six more times" (Professor Onyx's
       * 7). Read once, as the first pass begins. With `again` or
       * `mayAgain`, the most there may be — Claim Jumper's "repeat this
       * process once" is 2. */
      readonly times?: EffectAmount;
      /** "If [this] … , repeat this process": after a pass, another only if
       * this holds — read over that pass alone, whose "this way" it is
       * (Grist's "if an Insect card was milled this way", Grindstone's "if
       * two cards that share a color were milled this way", Primal Surge's
       * "if you do"). */
      readonly again?: StaticCondition;
      /** "You may repeat this process any number of times" (Ad Nauseam,
       * Forbidden Ritual): after a pass (and `again`, if it holds), its
       * controller is asked whether to go again — `cost` is "you may pay
       * {G}. If you do, repeat" (Forgotten Lore). */
      readonly mayAgain?: true | { readonly cost: string };
      /** Engine-built, never authored: passes done, the resolution's own
       * "this way" start (restored once the last pass is done, so what
       * follows reads every pass — Demonlord Belzenlok's "for each card put
       * into your hand this way"), the pass count fixed from `times`, and
       * whether the pass just done has been judged. */
      readonly progress?: {
        readonly round: number;
        readonly outer: number;
        readonly total?: number;
        readonly stop?: true;
        readonly judged?: true;
      };
    }
  | {
      /**
       * "Clash with an opponent. If you win, [won]" (rule 701.30, Lorwyn
       * block): the effect's controller chooses an opponent (701.30b — not a
       * target; with one opponent nobody is asked), then both reveal the top
       * card of their library (701.30c), and each, in APNAP order, chooses
       * to leave it on top or put it on the bottom. You win if you revealed
       * a card with a greater mana value than theirs (701.30d) — an empty
       * library reveals nothing, which can't win, and loses to any card.
       * `won` / `lost` apply after both cards have moved, with the
       * `"that-player"` scope naming the opponent clashed with (Captivating
       * Glance's "Otherwise, that player gains control of enchanted
       * creature"). Once both cards have moved, each clashing player has
       * clashed (a `clashed` event apiece, won or not), which a `clashes`
       * trigger fires on — Sylvan Echoes, Entangling Trap.
       *
       * `repeat` is "if you win, repeat this process" (Hoarder's Greed:
       * "You lose 2 life and draw two cards, then clash with an opponent"):
       * on a win, `repeat` (the rest of the process) applies and then the
       * clash again, until a clash is lost.
       */
      readonly kind: "clash";
      readonly won?: EffectSpec;
      readonly lost?: EffectSpec;
      readonly repeat?: EffectSpec;
      /** Engine-built, never authored: the opponent chosen, and — once the
       * cards are revealed — whether you won and who is still to choose
       * where their card goes. */
      readonly opponent?: PlayerId;
      readonly progress?: {
        readonly won: boolean;
        /** Whether the opponent won it: a card of greater mana value than
         * yours (701.30d — either player can win). */
        readonly theyWon?: boolean;
        readonly toAsk: readonly { readonly player: PlayerId; readonly card: ObjectId }[];
      };
      /** Engine-built: how many clashes `repeat` has already made. */
      readonly round?: number;
    }
  | {
      /**
       * "Roll a d20", "roll X six-sided dice" (rule 706): the effect's
       * controller rolls `count` dice (1 when absent; none at all for 0) of
       * `sides` sides on the game's seeded random stream, as one roll — one
       * `dice-rolled` event, which a `rolls-dice` trigger fires on. The
       * result is the natural results' total plus `modifier` (706.2: "roll a
       * d20 and add the greatest power among creatures you control").
       *
       * `table` is a results table (706.3a): the first row whose range holds
       * the result applies — `{ min: 1, max: 9 }` is "1—9", `{ min: 20 }`
       * with no `max` is "20+", or exactly 20 when nothing rolls higher.
       * `then` follows any row, reading the roll through `{ roll }` amounts
       * ("create a number of Treasure tokens equal to the result" is a
       * `create-token` of `{ roll: "total" }`). The roll is kept on
       * `GameState.lastRoll`, so a step after a decision still reads it.
       */
      readonly kind: "roll-dice";
      readonly sides: number;
      readonly count?: EffectAmount;
      readonly modifier?: EffectAmount;
      readonly table?: readonly DieResultRow[];
      readonly then?: EffectSpec;
    }
  | {
      /**
       * Prohibitions until end of turn: "this turn, that player can't cast
       * spells or activate abilities" (Sen Triplets — `who`, a target slot
       * holding a player or a scope, default you, with `spells` and/or
       * `abilities`), "its activated abilities can't be activated this turn"
       * (Koma, Cosmos Serpent — `target`, a permanent, this stint of it).
       * Mana abilities are activated abilities too. `spells` may name only
       * some spells: Ranger-Captain of Eos's "your opponents can't cast
       * **noncreature** spells this turn" is `{ filter: { notTypes:
       * ["creature"] }, label: "noncreature spells" }` — the filter matched
       * against the card as it would be cast, from this effect's controller's
       * side; `label` is how the log names them.
       *
       * The forbidden action can also be:
       * - `regeneration`: "target creature can't be regenerated this turn"
       *   (Hurr Jackal — rule 701.19c: its regeneration shields aren't
       *   applied; activating or casting a regeneration effect still works).
       *   On `target`, or with `dealtDamageThisWay: "creature"` on every
       *   creature the resolution under way has dealt damage to so far
       *   ("creatures dealt damage this way can't be regenerated this turn"
       *   — Flamebreak; damage prevented was never dealt, rule 615.1). Not
       *   an ability the creature has: it follows the permanent through a
       *   loss of abilities and ends with the turn or a zone change (400.7).
       * - `monarch`: "you can't become the monarch this turn" (Jared
       *   Carthalion, True Heir — rule 725.4's "a player who can become the
       *   monarch"): on the `who` players.
       * - `lands`: "target player can't play lands this turn" (Turf Wound,
       *   Pardic Miner — rule 305.2): on the `who` players, a land from any
       *   zone, whatever permission offers it. Moonhold's two halves are each
       *   a `conditional` on the mana spent, one `lands`, one `spells`.
       * On `target`, `abilities` is the default when neither is named.
       * `duration: "until-your-next-turn"` makes a `target`'s abilities
       * prohibition last until this effect's controller's next turn (Dovin
       * Baan's +1) instead of this turn.
       */
      readonly kind: "prohibit";
      readonly who?: number | PlayerScope;
      readonly target?: EffectTargetRef;
      readonly spells?: boolean | { readonly filter: CardFilter; readonly label: string };
      readonly abilities?: boolean;
      readonly lands?: boolean;
      readonly regeneration?: boolean;
      readonly monarch?: boolean;
      readonly dealtDamageThisWay?: "creature";
      readonly duration?: "until-your-next-turn";
    }
  | {
      /**
       * Combat restrictions until end of turn — "target creature can't block
       * this turn", "~ must be blocked each combat this turn if able"
       * (Anzrag, the Quake-Mole: `target: "source"`, `restrictions:
       * ["must-be-blocked-if-able"]`): on `target`, as a modifier the way a
       * keyword grant is. With `filter` instead, a rule for the rest of the
       * turn over every permanent matching it from the controller's side —
       * "creatures your opponents control can't block this turn" binds a
       * creature that enters later too (rule 611.2c).
       */
      readonly kind: "restrict";
      readonly target?: EffectTargetRef;
      readonly filter?: CardFilter;
      readonly restrictions: readonly CombatRestriction[];
      /** With `filter`: "creatures **target player** controls can't attack
       * this turn" (Oriss, Samite Guardian), "… controlled by that player or
       * by that planeswalker's controller" (Concussive Bolt), "other
       * creatures **that player** controls" (Mark for Death — the target
       * creature's controller): `filter` read from the side of whoever the
       * permanent or player in this target slot is, as it resolves — its
       * `controlledBy: "you"` is them. Nothing happens once that target is
       * illegal. */
      readonly controlledByTarget?: number;
      /** With `filter`: the permanent in this target slot is left out —
       * Mark for Death's "**other** creatures that player controls" (the
       * object it is as this resolves, rule 400.7). */
      readonly exceptTarget?: number;
      /** With `filter`: the permanents matching it **as this resolves**, each
       * given the restrictions as a modifier until end of turn, rather than a
       * rule binding later arrivals — where the sentence also changes their
       * characteristics, which fixes the set (rule 611.2c): Joraga
       * Invocation's "each creature you control gets +3/+3 until end of turn
       * and must be blocked this turn if able", Suicidal Charge's "those
       * creatures attack this turn if able". A token stack is bound whole. */
      readonly asItResolves?: true;
      /** "Can't be blocked by [this] this turn" (rule 509.1b): no creature
       * matching it, from this effect's controller's side, can block —
       * Ghirapur Guide's `{ types: ["creature"], power: { lte: 2 } }`;
       * "except by creatures with haste" is `{ not: … }` (Run for Your
       * Life). Not an ability the creature gains, so it outlasts a loss of
       * abilities; with `filter`, a turn-wide rule like the rest (Dread
       * Charge). `restrictions` may then be empty. */
      readonly cantBeBlockedBy?: CardFilter;
      /** "Target creature can't block **this creature** this turn" (Kozilek's
       * Pathfinder — rule 509.1b): `target` can't block this one creature,
       * usually `"source"`, the object it is as this resolves (rule 400.7).
       * A `target` form only; `restrictions` may then be empty. */
      readonly cantBlockAttacker?: EffectTargetRef;
      /** How long a `target`'s restrictions last — this turn when omitted;
       * `"while-source"` is Opportunistic Dragon's "for as long as this
       * creature remains on the battlefield, … it can't attack or block". */
      readonly duration?: PtDuration;
    }
  | {
      /**
       * Detain (rule 701.35a): until the next turn of this effect's
       * controller, `target` can't attack or block and its activated
       * abilities — mana abilities included — can't be activated. Static
       * abilities still apply and triggered ones still trigger; a creature
       * already attacking or blocking stays in combat; a noncreature
       * permanent that becomes a creature later still can't attack or block;
       * an ability already on the stack is unaffected (the rulings).
       */
      readonly kind: "detain";
      readonly target: EffectTargetRef;
    }
  | {
      /**
       * "`target` blocks this turn if able", or "blocks `attacker` this turn
       * if able" — a blocking requirement (rule 509.1c) on that one
       * creature, held in `GameState.blockRequirements`: when its controller
       * declares blockers it has to block (that attacker) whenever it can,
       * as many requirements obeyed as can be without breaking a
       * restriction. Not a characteristic: a creature that can't block, or
       * can't block that attacker (flying, tapped), simply doesn't, and one
       * that's left the battlefield (or an attacker that has) is free of it
       * (rule 400.7). Provoke (rule 702.39a) is `attacker: "source"` after
       * an `untap` (`provoke()` in `cards/helpers.ts`); Hunt Down's "target
       * creature blocks target creature" is `attacker: 1`. `thisCombat`:
       * "this combat" (Avalanche Tusker) — ends with the combat phase.
       */
      readonly kind: "block-if-able";
      readonly target: EffectTargetRef;
      readonly attacker?: EffectTargetRef;
      readonly thisCombat?: boolean;
    }
  | {
      /**
       * "Can attack this turn as though it didn't have defender" (rule
       * 702.3b): `target` until end of turn, as a modifier (Assault
       * Formation); or with `filter`, a rule for the rest of the turn over
       * every permanent matching it from the controller's side, one that
       * comes under their control later too (Wakestone Gargoyle's ruling).
       * Not an ability the creature gains, so losing its abilities doesn't
       * end it. The static form is `StaticAbility.canAttackAsThoughNoDefender`.
       */
      readonly kind: "attack-despite-defender";
      readonly target?: EffectTargetRef;
      readonly filter?: CardFilter;
    }
  | {
      /**
       * Territorial Hellkite's "choose an opponent at random **that this
       * creature didn't attack during your last combat**. This creature
       * attacks that player this combat if able. If you can't choose an
       * opponent this way, tap this creature": the game picks among the
       * effect's controller's opponents still in the game — with
       * `notAttackedLastCombat`, not the one `target` attacked in its
       * controller's combat before this one (any, if it didn't attack then)
       * — and `target` must attack that player this combat if able (rule
       * 508.1d; not a planeswalker of theirs, and no cost need be paid). A
       * player who can't be attacked may still be picked (the rulings).
       * With nobody to pick, `else` happens instead.
       */
      readonly kind: "attack-random-opponent";
      readonly target: EffectTargetRef;
      readonly notAttackedLastCombat?: boolean;
      readonly else?: EffectSpec;
    }
  | {
      /** `target` assigns combat damage equal to its toughness rather than
       * its power until end of turn (rule 510.1a — Walking Bulwark). Its
       * power is unchanged for everything else. The static form is
       * `StaticAbility.combatDamageByToughness`. */
      readonly kind: "damage-by-toughness";
      readonly target: EffectTargetRef;
    }
  | {
      /** `target` assigns no combat damage this turn (rule 510.1a — Farrel's
       * Zealot, Ophidian: "if you do, this creature assigns no combat damage
       * this turn"). An unblocked one deals the player nothing, and a
       * blocked one nothing to its blockers; it's still attacking, blocked
       * or not, and its power is unchanged for everything else. */
      readonly kind: "assigns-no-combat-damage";
      readonly target: EffectTargetRef;
    }
  | {
      /**
       * "[It] assign[s] its combat damage this turn as though it weren't
       * blocked": as combat damage is assigned, a blocked creature assigns
       * all of it to the player, planeswalker or battle it's attacking (rule
       * 510.1b) rather than to its blockers (510.1c). `target` until end of
       * turn, as a modifier (Gurzigost's `"source"`, Outmaneuver's targets);
       * or with `filter`, a rule for the rest of the turn over every
       * permanent matching it from the controller's side, one that arrives
       * later too (Predatory Focus's "creatures you control" — it changes no
       * characteristic, so 611.2c doesn't lock the set in). `optional`: "you
       * may have …", the creature's controller choosing as damage is
       * assigned; without it there's no choice (Outmaneuver). Not an ability
       * the creature gains. The static form is
       * `StaticAbility.assignAsThoughUnblocked`.
       */
      readonly kind: "assign-as-though-unblocked";
      readonly target?: EffectTargetRef;
      readonly filter?: CardFilter;
      readonly optional?: boolean;
    }
  | {
      /**
       * "Return it to the command zone" (Hellkite Courser's delayed
       * trigger): a commander still on the battlefield as the same object
       * (rule 400.7 — its ruling: "only if it's still on the battlefield")
       * goes to the command zone, leaving the battlefield as any permanent
       * does. Anything that isn't a commander stays put.
       */
      readonly kind: "put-in-command-zone";
      readonly target: EffectTargetRef;
    }
  | {
      /**
       * "Exchange your life total with this creature's toughness" (Tree of
       * Redemption — rule 701.12g), or "with Evra's power" (Evra, Halcyon
       * Witness): the permanent's `stat` becomes the effect controller's life
       * total, a layer-7b effect with no end (`PtModifier.setToughness`,
       * `setPower` — counters and bonuses still apply on top, the ruling),
       * and the player gains or loses the life it takes to reach what it was,
       * so a life-gain replacement or a "whenever you gain life" trigger sees
       * it (701.12c): a power of 0 or less, and they lose the game (Evra's
       * ruling). If either half can't happen — the permanent isn't there as
       * the same object any more (the ruling), it isn't a creature so has no
       * such number (rule 208.3), or the player can't gain, or can't lose,
       * the life it would take (rules 119.7–8) — none of it does (701.12a).
       */
      readonly kind: "exchange-life-stat";
      readonly stat: "power" | "toughness";
      readonly target: EffectTargetRef;
      /** Whose life total — the effect's controller's by default; Tree of
       * Perdition's "exchange **target opponent's** life total" is `{ target:
       * 0 }`. Naming nobody (an illegal or empty slot), nothing happens. */
      readonly player?: EffectPlayerRef;
    }
  | {
      /**
       * "Exchange life totals with target opponent" (Mirror Universe), "two
       * target players exchange life totals" (Soul Conduit — rule 701.12c):
       * each player gains or loses the life it takes to reach the other's
       * previous life total, so replacement effects may change those amounts
       * and triggers see them. A player who can't gain life can't be given a
       * higher life total, nor one who can't lose life a lower one (rules
       * 119.7–8), and then neither changes (701.12a). Nor does either when
       * one of the two is an illegal target, or has left the game (the
       * rulings) — or they're the same player.
       */
      readonly kind: "exchange-life-totals";
      /** The controller of the effect when absent. */
      readonly first?: EffectPlayerRef;
      readonly second: EffectPlayerRef;
    }
  | {
      /** `target` (an instant/sorcery card in a graveyard, via the
       * `"instant-or-sorcery-in-your-graveyard"` target spec) gains flashback
       * until end of turn for a cost equal to its mana cost — Snapcaster Mage
       * (ROADMAP Phase 6b). `cost` gives it that flashback cost instead —
       * Archmage's Newt's "flashback {0}", which a card with no mana cost
       * gains too. */
      readonly kind: "grant-flashback";
      readonly target: number;
      readonly cost?: string;
    }
  | {
      /** The mass form of `grant-flashback`: each card in your graveyard
       * matching `filter` gains flashback until end of turn, at a cost equal
       * to its mana cost — Past in Flames' "each instant and sorcery card in
       * your graveyard". The cards are fixed as it resolves (rule 611.2c):
       * one put there later this turn doesn't gain it. */
      readonly kind: "grant-flashback-all";
      readonly filter: CardFilter;
    }
  | {
      /** A card in a graveyard gains a keyword ability until end of turn,
       * with its cost (rule 611.2c: the cards are fixed as it resolves, so
       * one put there later this turn doesn't gain it): `target` for one
       * card ("target creature card in your graveyard gains embalm until end
       * of turn. The embalm cost is equal to its mana cost" — Cursecloth
       * Wrappings), or `filter` for each card in your graveyard that matches
       * ("each artifact creature card in your graveyard gains unearth {3}
       * until end of turn" — Ghost Ark). See {@link GraveyardKeywordGrant}. */
      readonly kind: "grant-graveyard-keyword";
      readonly target?: number;
      readonly filter?: CardFilter;
      readonly grant: GraveyardKeywordGrant;
    }
  | {
      /** "Choose target artifact card in your graveyard. You may cast that
       * card this turn" (Silas Renn, Emry) — `target` (a card in a graveyard,
       * via a `card-in-graveyard` spec) gets a one-shot permission for the
       * ability's controller to cast it, for its ordinary cost, until end of
       * turn. The permission lives on the card (`GameObject
       * .graveyardCastPermission`) and ends if the card leaves the graveyard.
       * Casts only: a land can't be cast. */
      readonly kind: "grant-graveyard-cast";
      readonly target: number;
    }
  | {
      /**
       * Give a permanent a triggered ability — "gains 'Whenever this creature
       * deals combat damage to a player, draw that many cards'" (Hunter's
       * Prowess, Hunter's Insight).
       *
       * The one-shot counterpart of `StaticAbility.grantsTriggered`: it rides
       * on the target's own modifiers, so an `"end-of-turn"` grant expires
       * with every other until-end-of-turn modifier.
       */
      readonly kind: "grant-triggered";
      readonly target: EffectTargetRef;
      readonly ability: TriggeredAbility;
      readonly duration: PtDuration;
    }
  | {
      /**
       * `target` loses all its abilities (layer 6) — with `loseLandTypes`,
       * its land types too (layer 4; its other types and supertypes stay) —
       * and has `activated` besides, granted by the same effect so they
       * aren't lost with the rest (rule 613.7): Ultima, Origin of Oblivion's
       * "it loses all land types and abilities and has '{T}: Add {C}.'"
       */
      readonly kind: "lose-abilities";
      readonly target: EffectTargetRef;
      readonly loseLandTypes?: boolean;
      readonly activated?: readonly ActivatedAbility[];
      readonly duration: PtDuration;
    }
  | {
      /**
       * Every battlefield permanent matching `filter` loses all its
       * abilities (layer 6) — Final Showdown's "all creatures lose all
       * abilities until end of turn". The mass form of `lose-abilities`:
       * the permanents are the ones that match as it applies (rule 611.2c),
       * under one effect with one timestamp, so an ability an effect grants
       * one of them afterwards isn't lost (rule 613.7 — the ruling), and a
       * creature that arrives later keeps its own.
       */
      readonly kind: "lose-abilities-all";
      readonly filter: CardFilter;
      readonly duration: PtDuration;
    }
  | {
      /**
       * Give a permanent an activated ability — the one-shot counterpart of
       * `StaticAbility.grantsActivated`, riding on the target's own modifiers
       * like `grant-triggered`. A mana ability is seen by the mana payer, or
       * activated by hand where the payer can't use it (see `manaSources`).
       */
      readonly kind: "grant-activated";
      readonly target: EffectTargetRef;
      readonly ability: ActivatedAbility;
      readonly duration: PtDuration;
    }
  | {
      /**
       * Give a permanent a static ability: "it gains 'This creature attacks
       * each combat if able'" (Carnage, Crimson Chaos — `duration:
       * "permanent"`), Earthbind's "this Aura gains 'Enchanted creature
       * loses flying'" (`target: "source"`), Iron Man Armor's "and 'This
       * creature gets +1/+1 for each artifact you control'". The ability
       * works from that permanent as its own static would (`affects` read
       * from there; "self" is it), with its effects timestamped by the later
       * of the permanent and the grant (rule 613.7a); like any granted
       * ability, a later loss of all abilities takes it away (613.7). With
       * `filter` instead, every permanent matching it as it resolves (rule
       * 611.2c: granting an ability changes characteristics, so the set is
       * fixed then) — Full Steam Ahead's "each creature you control … gains
       * 'This creature can't be blocked by more than one creature'". Read
       * by the layer fold's contributing statics, the block filters, the
       * ability grants, the untap step's and the game-loss statics, and a
       * base-P/T set (not a CDA once granted — rule 604.3a(2): layer 7b at
       * the grant's timestamp). A layer-4 part isn't applied.
       */
      readonly kind: "grant-static";
      readonly target?: EffectTargetRef;
      readonly filter?: CardFilter;
      readonly ability: StaticAbility;
      readonly duration: PtDuration;
    }
  | {
      /** The mass form of `grant-activated`: Rain of Filth's "until end of
       * turn, lands you control gain 'Sacrifice this land: Add {B}.'" Matches
       * are fixed as it resolves (rule 611.2c), and a token stack gains it
       * whole. */
      readonly kind: "grant-activated-all";
      readonly filter: CardFilter;
      readonly ability: ActivatedAbility;
      readonly duration: PtDuration;
    }
  | {
      /** The mass form of `grant-triggered`: every battlefield permanent
       * matching `filter` (from the effect's controller's side) gains the
       * ability — Azlask, the Swelling Scourge's "Scions and Spawns you
       * control gain … annihilator 1 until end of turn". Matches are fixed as
       * it resolves (rule 611.2c), and a token stack gains it whole. */
      readonly kind: "grant-triggered-all";
      readonly filter: CardFilter;
      readonly ability: TriggeredAbility;
      readonly duration: PtDuration;
    }
  | {
      /** The effect's controller takes an extra turn after this one (rule
       * 500.7 — ROADMAP Phase 7), or with `target` the player in that slot
       * (Time Warp: "target player takes an extra turn after this one"). */
      readonly kind: "take-extra-turn";
      readonly target?: number;
      /** "Skip the untap step of that turn" (Savor the Moment — rule
       * 614.10): that extra turn's untap step, and no other, is skipped. */
      readonly skipUntapStep?: true;
      /** What the effect says about that turn alone, taken up as it begins
       * and lost with it if it's skipped or never begins (rule 614.10a):
       * "during that turn, damage can't be prevented" (Alchemist's Gambit —
       * rule 615.12), and "at the beginning of that turn's end step, you lose
       * the game" (Warrior's Oath), a delayed ability (rule 603.7) of this
       * effect's controller that lapses unfired if that end step never comes. */
      readonly thatTurn?: ExtraTurnScope;
    }
  | {
      /**
       * "You skip your next turn" (Meditate — rules 500.11, 614.10): `who`'s
       * next `count` turns (one by default) pass as though they didn't exist,
       * an extra turn among them as much as one in the rotation. Nothing
       * happens in them, and anything waiting for "their next turn" waits for
       * the first that isn't skipped; two effects skip the next two
       * (614.10a). The turn under way can't be skipped (614.10). `who` is a
       * player slot or a scope, `"you"` by default.
       */
      readonly kind: "skip-turn";
      readonly who?: number | PlayerScope;
      readonly count?: EffectAmount;
    }
  | {
      /**
       * "You control target player during that player's next turn" (rule
       * 723): `target`, the slot of the player controlled; `controller`, the
       * slot of the player controlling them when it isn't this effect's
       * controller (Cruel Entertainment). The next turn they actually take,
       * and all of it (723.1); or with `during: "next-combat"`, their next
       * combat phase (Secret of Bloodbending). `extraTurnAfter`: "after that
       * turn, that player takes an extra turn" (Emrakul).
       */
      readonly kind: "control-player";
      readonly target: number;
      readonly controller?: number;
      readonly during?: "next-turn" | "next-combat";
      readonly extraTurnAfter?: true;
    }
  | {
      /**
       * "You choose which creatures attack this turn" (`attackers`) and "you
       * choose which creatures block this turn and how those creatures block"
       * (`blocks: "all"` — Master Warcraft; `"opponents"`, those your opponents
       * control — Brutal Hordechief, with `blockIfAble`: "creatures your
       * opponents control block this turn if able"). A rule over the rest of
       * the turn: a creature arriving later is covered too.
       */
      readonly kind: "choose-combat";
      readonly attackers?: true;
      readonly blocks?: "all" | "opponents";
      readonly blockIfAble?: true;
    }
  | {
      /**
       * Gift (rule 702.174): the gift given to the opponent it was promised
       * to — the spell's, or for a permanent, its spell's as it entered
       * (`GameObject.giftTo` / `enteredGiftTo`, read as it last existed if
       * it has left). Nothing when no gift was promised, or that player has
       * left the game. An instant or sorcery gives it before its other
       * effects (702.174j): the first step of its kicker `effect` (a gift
       * is the kicker machinery under the keyword `gift`); a permanent, in
       * "when this permanent enters, if its gift cost was paid" (702.174b —
       * the `giftTrigger` helper).
       */
      readonly kind: "gift";
      readonly gift: GiftKind;
    }
  | {
      /** Storm (rule 702.40 — ROADMAP Phase 8): put a copy of the spell this
       * ability is on onto the stack for each other spell its controller cast
       * before it this turn. Copies keep the original's targets. With
       * `of: "trigger-object"`, the spell is the trigger's instead: a
       * delayed "the next instant or sorcery spell you cast this turn has
       * storm" (Storm, Force of Nature), which triggers on that spell's cast
       * as its own storm would. */
      readonly kind: "storm";
      readonly of?: "trigger-object";
    }
  | {
      /** Cascade (rule 702.85 — ROADMAP Phase 8): exile cards off the top of
       * the controller's library until a nonland card with lesser mana value
       * is exiled; its controller may cast that card for free (702.85a), and
       * the rest go to the bottom. */
      readonly kind: "cascade";
      /** The card found, offered as a full free cast (a `cast-now`: modes,
       * kicker, targets and the rest, or decline). Only the engine builds
       * this and `finish`; a card is authored as a bare `{ kind: "cascade" }`. */
      readonly offer?: { readonly hit: ObjectId; readonly threshold: number };
      /** The second half, once the offer is answered: everything it exiled
       * that's still in exile goes to the bottom in a random order. */
      readonly finish?: CascadeFinish;
    }
  | {
      /**
       * Craft's effect (rule 702.167a): "Return this card to the battlefield
       * transformed under its owner's control" — the card the ability's
       * cost exiled, if it's still in exile from that move (rule 400.7). The
       * cards exiled with it as materials stay linked to it (702.167c). Built
       * by the `craft` helper.
       */
      readonly kind: "craft-return";
    }
  | {
      /**
       * Discover N (rule 701.57a): exile cards from the top of the
       * controller's library until a nonland card with mana value N or less
       * is exiled; they may cast it without paying its mana cost if the
       * resulting spell's mana value is N or less, and if they don't, it goes
       * to their hand. The rest go to the bottom in a random order. They have
       * discovered whatever was possible (701.57b — a `discovered` event).
       */
      readonly kind: "discover";
      readonly amount: EffectAmount;
      /** Engine-built halves, never authored: the free cast offered, then the
       * rest once it's answered. */
      readonly offer?: { readonly hit: ObjectId; readonly amount: number };
      readonly finish?: DiscoverFound;
    }
  | {
      /**
       * Reveal cards from the top of a library until one matches `filter` —
       * a generalised cascade (rule 701.16): The Prismatic Bridge's "reveal
       * cards from the top of your library until you reveal a creature or
       * planeswalker card. Put that card onto the battlefield and the rest on
       * the bottom of your library in a random order", Umbris's "target
       * opponent exiles cards from the top of their library until they exile
       * a land card". With nothing matching, every card is revealed and all
       * of them are "the rest".
       */
      readonly kind: "reveal-until";
      /** Whose library: the effect's controller's (default), the player in
       * this target slot, or `"that-player"` — each one a `for-each-player`
       * names (Consuming Aberration's "each opponent reveals cards from the
       * top of their library until they reveal a land card"). */
      readonly whose?: number | "that-player" | { readonly controllerOfTarget: number };
      /** What stops it, matched against each card as it's revealed — an `{
       * amount }` compare is bound as the effect applies ("a nonland card
       * with lesser mana value"). */
      readonly filter: CardFilter;
      /** Exile each card, face up, as it goes, rather than reveal it. */
      readonly exile?: boolean;
      /** Where the card found goes. Omitted, it stays with the rest — unless
       * `then` moves it. */
      readonly put?: "battlefield" | "hand" | "graveyard";
      /** A card put onto the battlefield enters tapped. */
      readonly tapped?: boolean;
      /** A card put onto the battlefield enters under the effect's
       * controller's control rather than its owner's — Sméagol, Helpful
       * Guide's "put that card onto the battlefield tapped **under your
       * control**" from an opponent's library. */
      readonly underYourControl?: boolean;
      /** …and attacking (rule 508.4) — Raph & Mikey, Troublemakers' "put
       * that card onto the battlefield tapped and attacking". See
       * {@link EnterAttacking}. */
      readonly attacking?: EnterAttacking;
      /** Applied once the card found is placed, with it as target 0 — "you
       * may put that card onto the battlefield" is a `may` of a
       * `put-onto-battlefield` of 0. Skipped when nothing matched. */
      readonly then?: EffectSpec;
      /** `then` reads the resolution's own targets too, each a slot up from
       * where it was, target 0 still the card found: Erratic Explosion's
       * "choose any target … deals damage equal to that card's mana value to
       * that permanent or player" is `then: { kind: "damage", target: 1,
       * amount: { manaValueOf: 0 } }`. */
      readonly thenKeepsTargets?: boolean;
      /**
       * What happens to every revealed card still where it was revealed —
       * the rest, and the card found if nothing moved it. See
       * {@link RevealedCardsGo}.
       */
      readonly rest: RevealedCardsGo;
      /** The card found isn't one of the rest, whatever became of it — Codie,
       * Vociferous Codex's "put each **other** card exiled this way on the
       * bottom", which leaves it in exile to be cast. */
      readonly keepFound?: boolean;
      /** Set only on the copy parked across a decision — the "as this
       * enters" choice of the card found, or one `then` raised: what was
       * revealed and found, so it isn't revealed again. */
      readonly progress?: RevealUntilProgress;
    }
  | {
      /**
       * Copy a spell (rule 707.10): the one in target slot `target` (Twincast)
       * or, with `"trigger-spell"`, the spell whose casting fired this
       * triggered ability — as it last was on the stack if it has left since
       * (Shiko and Narset, Unified's copy happens even after the spell was
       * countered in response). The copy has the original's modes, targets,
       * {X} and the costs paid for it; a copy of a permanent spell becomes a
       * token as it resolves.
       */
      readonly kind: "copy-spell";
      /** A target slot, `"trigger-spell"`, or `"source"`: this spell, while
       * it resolves — Sevinne's Reclamation's "you may copy this spell and
       * may choose a new target for the copy". The copy goes on the stack
       * above it; one that is itself a copy was never cast. */
      readonly target: number | "trigger-spell" | "source";
      /** "You may choose new targets for the copy" (rule 707.10c). */
      readonly newTargets?: true;
      /**
       * "Copy it, **except** the copy isn't legendary" (Iron Man, Bleeding
       * Edge; Double Major's "except it isn't legendary if the spell is
       * legendary" is the same), "except the copy is an artifact in addition
       * to its other types" (Tawnos, the Toymaker), "except the copy is a 1/1
       * Spirit in addition to its other types" (Donal, Herald of Wings):
       * exceptions to the copying (rule 707.9), part of the copy's copiable
       * values (707.9b) — every other effect applies over them, they stay
       * with the token a permanent spell's copy becomes (707.10f), and
       * anything that copies the copy copies them. See {@link CopyExceptions}.
       * Not with `forEachItCouldTarget` (nor `gains`).
       */
      readonly except?: CopyExceptions;
      /**
       * "The copy **gains** haste and 'At the beginning of the end step,
       * sacrifice this token'" (Choreographed Sparks), "if the copy is a
       * permanent spell, it gains haste and …" (Nalfeshnee, Mizzix — with
       * `ifPermanent`): an effect of this resolution on the copy, not a copy
       * exception, so it goes on applying to the permanent the copy becomes
       * (rule 400.7a) and a copy of it has none of it. With no end.
       */
      readonly gains?: SpellCopyGains;
      /** Who controls the copy, when that isn't the effect's controller —
       * demonstrate's "choose an opponent. That player copies the spell and
       * may choose new targets for that copy" (rule 702.144a: `"that-player"`
       * under a `choose-opponent`). They choose its new targets. Naming
       * nobody — a player who has left the game — nothing is copied. Not with
       * `retargetTo`. */
      readonly controller?: EffectPlayerRef;
      /** "Copy that spell if it targets a permanent or player" — any of its
       * targets was, when chosen. Otherwise it isn't copied. */
      readonly ifTargets?: "permanent-or-player";
      /** "If you don't copy a spell this way, [this]" (Shiko and Narset's
       * "draw a card"). */
      readonly otherwise?: EffectSpec;
      /**
       * "The copy targets Ivy" (rule 707.10e — Ivy, Gleeful Spellthief): each
       * of the copy's targets is this one instead of the original's —
       * `"source"`, the effect's own permanent, or the object in this target
       * slot of the effect. A slot the spell's own rules filled isn't a
       * target, and keeps what it had. If that one isn't a legal target for
       * each of them, as the copy's controller would choose it, the copy
       * isn't created (and `otherwise` applies). With `"trigger-spell"` only.
       */
      readonly retargetTo?: "source" | number;
      /**
       * "Copy that spell for each other creature you control that the spell
       * could target. Each copy targets a different one of those creatures"
       * (rule 707.10d — Zada, Hedron Grinder): one copy per battlefield
       * permanent matching `filter` from the effect's side (`other` leaves
       * the effect's own permanent out) that is a legal target for each of
       * the spell's targets, every target of a copy being that one. A token
       * stack is that many permanents, each its own copy. With two or more,
       * their controller puts them on the stack in the order they choose — a
       * `choose-permanents` decision naming them all, in order. With
       * `"trigger-spell"` only.
       *
       * With `controller`: "**that player** copies that spell for each other
       * creature they control …" (Mirrorwing Dragon's `"trigger-controller"`),
       * they choosing the order and `filter` read from their side. "Could
       * target" is always the spell's as its caster cast it, even when someone
       * else copies it; the copies then resolve as their controller's, so one
       * aimed at what its controller couldn't target doesn't (Ink-Treader
       * Nephilim's ruling). `other: "targeted"` leaves out what the spell
       * targets instead of the effect's own permanent: "each **other** Golem"
       * (Precursor Golem). See {@link CopyForEach} for `chooseAndPayEach`.
       */
      readonly forEachItCouldTarget?: CopyForEach;
      /**
       * "Copy it **for each** …": how many copies, read as the effect
       * applies — Thousand-Year Storm's "for each other instant and sorcery
       * spell you've cast before it this turn" (`{ triggerValue: true }`
       * off a cast trigger's `countCastBefore`), Thunderclap Drake's "for
       * each time you've cast your commander from the command zone this
       * game" (`{ commanderCasts: "you" }`). One copy when omitted; none at
       * 0. With `newTargets`, each copy is asked about in turn, as storm's
       * are. Not with `forEachItCouldTarget`.
       */
      readonly count?: EffectAmount;
      /** The spell to copy, captured: only the engine sets this, on the copy
       * that a `forEachItCouldTarget` hands its `choose-permanents` decision
       * (which applies it once per permanent chosen, with that one as target
       * 0, outside the triggered ability that knew the spell). `caster`: whose
       * side "could target" is judged from. `payEach`: what this copy costs. */
      readonly spell?: {
        readonly snapshot: SpellSnapshot;
        readonly original: ObjectId;
        readonly caster?: PlayerId;
        readonly payEach?: string;
      };
    }
  | {
      /**
       * Copy an activated or triggered ability on the stack (rule 707.10):
       * the one in target slot `target` (Lithoform Engine, Vantress Visions,
       * Weaver of Harmony — an `{ kind: "ability" }` target), or with
       * `"trigger-ability"` the one whose activation fired this triggered
       * ability (Illusionist's Bracers' "copy that ability", an
       * `activates-ability` trigger) — as it last was on the stack if it
       * has gone since. The copy has the original's source (707.10b), modes,
       * targets, X and what was paid for it (the creature sacrificed, the
       * permanent tapped), counts as the same ability for "the Nth time this
       * ability has resolved", and is controlled by this effect's controller;
       * choices made as it resolves are made again (707.10). It isn't
       * activated, so nothing watching activations sees it.
       */
      readonly kind: "copy-ability";
      readonly target: number | "trigger-ability";
      /** "You may choose new targets for the copy" (rule 707.10c). */
      readonly newTargets?: true;
    }
  | {
      /**
       * Change the targets of the spell or ability in target slot `target`
       * (rule 115.7), this effect's controller choosing, each new target one
       * that spell or ability could legally have as its controller would
       * choose it (never itself — rule 115.5), its division of damage or
       * counters kept slot for slot (115.7f), and each new target "becomes
       * the target" of it (ward, Phantasmal Image). Nothing happens if it
       * has left the stack.
       *
       * - `"change"` — "change the target(s)" (115.7a): every target to
       *   another legal one, and if any can't be, none is; it must change if
       *   it can (Bolt Bend's rulings).
       * - `"change-one"` — "change a target" (115.7b): one of them.
       * - `"choose-new"` — "you may choose new targets" (115.7d): any number,
       *   each kept even if it's no longer legal (Deflecting Swat).
       */
      readonly kind: "change-targets";
      readonly target: number;
      readonly how: "change" | "change-one" | "choose-new";
      /** "…to this creature": the one new target there is is this effect's
       * own permanent (Spellskite, Hydroelectric Specimen). */
      readonly to?: "source";
      /** "You may change…" (Hydroelectric Specimen): keeping it is a choice. */
      readonly optional?: true;
    }
  | {
      /**
       * "Exile that card instead of putting it into your graveyard as it
       * resolves. If you do, return it to your hand at the beginning of the
       * next end step" (Feather, the Redeemed). Marks the spell whose casting
       * fired this triggered ability, as long as it's still that spell on
       * the stack (`GameObject.exileAsItResolves`). The replacement waits on
       * the spell: only resolving puts it to use (a spell countered or
       * fizzling goes to the graveyard as usual), only a card its owner — this
       * effect's controller — would put into their own graveyard (a spell
       * you don't own, a copy, and one whose own text moves it never do), and
       * it applies even if this effect's source has left by then (the
       * rulings). Another replacement that would exile it instead (flashback,
       * Rest in Peace, an Adventure) leaves its owner the choice of which
       * applies first (rule 616.1); only Feather's brings it back.
       */
      readonly kind: "exile-spell-as-it-resolves";
      /** "Return it to your hand at the beginning of the next end step." */
      readonly returnAtNextEndStep?: true;
      /** "If you do, it becomes plotted" (rule 702.170 — Lilah, Undefeated
       * Slickshot): the card this exiles is plotted. */
      readonly plotted?: true;
      /** Only the engine sets this: the answer to that rule 616.1 choice,
       * applied to the spell `spell` that has just resolved — `true` to
       * apply this replacement first, `false` to let the other. */
      readonly applyFirst?: { readonly spell: ObjectId; readonly feather: boolean };
    }
  | {
      /** After this (post-combat) main phase there is an additional combat
       * phase then an additional main phase (Aggravated Assault — rule 500.8 /
       * ROADMAP Phase 7). With `afterThisPhase`, the additional combat phase
       * comes **straight after the combat phase under way** instead
       * (Karlach, Fury of Avernus; Anzrag: "after this phase, there is an
       * additional combat phase"), and `withMain` adds "followed by an
       * additional main phase" (Najeela, the Blade-Blossom) — one more main
       * phase before the rest of the turn. */
      readonly kind: "additional-combat";
      readonly afterThisPhase?: boolean;
      readonly withMain?: boolean;
    }
  | {
      /**
       * "End the turn" (rule 724.1 — Time Stop, Sundial of the Infinite) and
       * "end the combat phase" (724.2 — Mandate of Peace, the one card). Every
       * trigger waiting ceases to exist and every spell and ability on the
       * stack is exiled, this one included, none of them countered; then
       * state-based actions, with no one getting priority; then the game skips
       * to the cleanup step, or to the next phase with everything removed
       * from combat. Nothing skipped happens: "at the beginning of the end
       * step" and "at end of combat" don't trigger, and a phase the turn was
       * owed is gone with the turn (it isn't with the combat phase, whose next
       * phase it may be). What triggers from here on goes on the stack in the
       * cleanup step, with another one after it, or in the next phase. Whatever
       * the same spell says after this still happens (Glorious End). "End the
       * combat phase" outside a combat phase does nothing at all (724.2g).
       */
      readonly kind: "end-the-turn" | "end-the-combat-phase";
    }
  | {
      /** "Each opponent can't block with more than one creature this combat"
       * (Mirri, Weatherlight Duelist — rule 509.1b, `combat/limits.ts`). */
      readonly kind: "limit-blockers";
      readonly who: PlayerScope;
      readonly most: number;
    }
  | {
      /** "You get that many additional upkeep steps after this phase" (Obeka,
       * Splitter of Seconds, whose `amount` is `{ triggerValue: true }`, the
       * combat damage it dealt): an upkeep step belongs to a beginning phase,
       * so this adds `amount` beginning phases, each holding only an upkeep
       * step — their untap and draw steps are skipped (rules 500.10, 500.11)
       * — straight after the combat phase under way, ahead of any phase added
       * after it earlier (500.8). "At the beginning of your upkeep" triggers
       * in each. Only on its controller's own turn ("you get" — 500.10a), and
       * only from a combat phase, which is where its one card resolves it. */
      readonly kind: "additional-upkeep-steps";
      readonly amount: EffectAmount;
    }
  | {
      /** "N damage divided as you choose among any number of targets"
       * (Magma Opus): each target of the group starting at slot `from` is
       * dealt its share of the spell's `division`. A target that has become
       * illegal is dealt nothing, and its share goes nowhere (rule 608.2b). */
      readonly kind: "damage-divided";
      readonly from: number;
    }
  | {
      /** "Distribute three +1/+1 counters among one, two, or three target
       * creatures" (rule 601.2d — Armament Dragon): each target of the group
       * starting at slot `from` gets its share of the `divided` total as
       * counters of `counter`, at least one each. A target gone illegal gets
       * none, and its share goes nowhere (608.2b). The `divided`'s `of` names
       * them for the division prompt ("+1/+1 counters"). */
      readonly kind: "counters-divided";
      readonly from: number;
      readonly counter: string;
    }
  | {
      /**
       * "Distribute N +1/+1 counters among any number of creatures you
       * control" with **no targets** (rule 608.2d — Vastwood Hydra, Feast of
       * the Victorious Dead, Blessing of Frost): the division is chosen as
       * this resolves, not as the spell is cast. `total` is read as it
       * begins; then the effect's controller chooses which of the
       * battlefield permanents matching `filter` (from their side, or from
       * the side of the player in target slot `controlledByTarget` — Invoke
       * Justice's "creatures and/or Vehicles target player controls") get
       * any — none, or as many as the total, a token stack's tokens each one
       * (the `choose-permanents` decision) — and then how many each chosen
       * one gets, at least one each and all of the total among them (a
       * `choose-number` per chosen one but the last, which takes the rest).
       * Not targeted: a hexproof creature can get them (Blessing of Frost's
       * ruling). The counters go on once every share is chosen.
       */
      readonly kind: "counters-distributed";
      readonly counter: string;
      readonly total: EffectAmount;
      readonly filter: CardFilter;
      readonly controlledByTarget?: number;
      /** What they're distributed among, for the prompts ("creatures you
       * control"). */
      readonly among?: string;
      /** Engine-built, never authored: the total read as it began, the
       * permanents chosen (a token stack once per token), and the shares
       * chosen so far, in that order. */
      readonly progress?: {
        readonly total: number;
        readonly picked?: readonly ObjectId[];
        readonly shares?: readonly number[];
      };
    }
  | {
      /** "Prevent the next N damage that would be dealt this turn to any
       * number of targets, divided as you choose" (Remedy, Embolden — rules
       * 601.2d, 615.7): each target of the group starting at slot `from`
       * gets a shield of its share of the `divided` total, at least 1 each
       * (`prevent-damage`'s, on `GameState.preventionShields`). A target gone
       * illegal gets none, and its share goes nowhere (608.2b). Give the
       * `divided` `of: "damage to prevent"` for the division prompt. */
      readonly kind: "prevent-damage-divided";
      readonly from: number;
      readonly combatOnly?: boolean;
    }
  | {
      /** "Shuffle your library" on its own (Ponder's "You may shuffle", inside
       * a `may`): the effect's controller shuffles (rule 701.24). */
      readonly kind: "shuffle-library";
      /** Whose: a target slot holding a player — "target player shuffles up
       * to four target cards from their graveyard into their library"
       * (Witness the Future) — the effect's controller's when absent. */
      readonly target?: number;
    }
  | {
      /** "You may play an additional land this turn" (Explore) — `amount`
       * more land drops for the effect's controller, this turn only. */
      readonly kind: "additional-land-drop";
      readonly amount: number;
    }
  | {
      /** Untap every battlefield permanent matching `filter` (Aggravated
       * Assault: `{ type: "creature", controlledBy: "you" }`). */
      readonly kind: "untap-all";
      readonly filter: CardFilter;
      /** Each of these players untaps the permanents matching `filter`,
       * read from their own side ("you" is each of them in turn) — Curse of
       * Bounty's "untap all nonland permanents you control. Each opponent
       * attacking that player untaps all nonland permanents they control". */
      readonly who?: PlayerScope;
      /** As on `modify-pt-all` — "untap them" after pumping a targeted
       * player's creatures (Great Oak Guardian). */
      readonly controlledByTarget?: number;
      /** "Untap all **other** creatures you control" (Combat Celebrant):
       * the effect's own source stays as it is. */
      readonly exceptSource?: boolean;
    }
  | {
      /**
       * Exert a permanent (rule 701.43a): it won't untap during its exerter's
       * next untap step — this effect's controller's. It can be exerted
       * tapped or untapped, or exerted again (701.43b), but only on the
       * battlefield (701.43c). Emits `permanent-exerted`, which an `exerted`
       * trigger watches. `asItAttacks` marks the exert a creature's own "you
       * may exert this creature as it attacks" made — set by the engine as
       * it asks, and what that ability's linked "when you do" reads (rule
       * 607.2h).
       */
      readonly kind: "exert";
      readonly target: EffectTargetRef;
      readonly asItAttacks?: true;
    }
  | {
      /** Tap every battlefield permanent matching `filter` — Thundermaw
       * Hellkite's "Tap those creatures", which follows a `damage-all` over
       * the same filter. The mirror of `untap-all`; `tap` only ever takes a
       * single chosen target. */
      readonly kind: "tap-all";
      readonly filter: CardFilter;
      /** "… **target player** controls" (Sleep, Ajani Vengeant's −7, Settle
       * the Wreckage): `filter` read from the side of whoever the permanent
       * or player in this target slot is — its `controlledBy: "you"` is
       * them. Nothing happens once that target is illegal. */
      readonly controlledByTarget?: number;
      /** As `tap`'s: "they don't untap during their controller's next untap
       * step" — and with `onlyDoesntUntap` only that, none tapped (Tangle's
       * "each attacking creature doesn't untap …"). */
      readonly doesntUntapNext?: boolean;
      readonly onlyDoesntUntap?: boolean;
      /** With `doesntUntapNext` and `controlledByTarget`: "during **that
       * player's** next untap step" (Sleep), tied to that player's untap step
       * rather than to whoever controls each permanent then
       * (`GameObject.skipsUntapOf`). */
      readonly untapStepOfTarget?: boolean;
      /** As `tap`'s: "their controllers' next **two** untap steps" (Cone of
       * Cold's top roll), 1 by default. */
      readonly doesntUntapSteps?: number;
    }
  | {
      /**
       * "Lands you control don't untap during your next untap step" (Kefnet's
       * Last Word, the Gods' Last cards): during that player's next untap
       * step, no permanent they control matching `filter` untaps — read then,
       * so one that came under their control since is held too (the rulings),
       * unlike `tap-all`'s `doesntUntapNext`, which marks what's there now.
       * `who` is a player slot or a scope, `"you"` by default.
       */
      readonly kind: "skip-next-untap";
      readonly filter: CardFilter;
      readonly who?: number | PlayerScope;
    }
  | {
      /**
       * "[That player] **skips their next untap step**" (Brine Elemental,
       * Shisato, Dovin, Architect of Law's −9, Avizoa — rule 614.10): the
       * whole step, as though it didn't exist (500.11) — no phasing (502.1),
       * no day/night check (502.2), nothing untapping, Seedborn Muse's
       * included. Two such effects skip the next two (614.10a), and what was
       * waiting for "their next untap step" (`skip-next-untap`, a "doesn't
       * untap during its controller's next untap step", an exert) waits for
       * the first one that isn't skipped. One already under way can't be
       * skipped (614.10) — none is, since nobody gets priority in it. `who`
       * is a player slot or a scope, `"you"` by default — unlike
       * `skip-next-untap`, which only keeps permanents tapped.
       */
      readonly kind: "skip-untap-step";
      readonly who?: number | PlayerScope;
    }
  | {
      /**
       * "[That player] **skips their next draw step**" (Fatigue, Molten
       * Firebird) or upkeep step — rule 614.10, as `skip-untap-step` is for
       * an untap step (which `step: "untap"` is): the whole step passed as
       * though it didn't exist (500.11), with no triggers "at the beginning
       * of" it and no priority. Two skip the next two (614.10a); a step a
       * static already skips (`skipsSteps`) doesn't use one up. `thisTurn`:
       * "you skip your draw step **this turn**" (Elfhame Sanctuary) — only
       * the active player's, this turn's, and nothing later. `who` is a
       * player slot or a scope, `"you"` by default.
       *
       * `"combat"` is a whole phase, by the same rule (500.11, 614.10): "skips
       * their next combat phase" (Stonehorn Dignitary) waits for that player's
       * turn, and one under way can't be skipped, so it's the next. `thisTurn`
       * is "their next combat phase **this turn**" (Moment of Silence).
       */
      readonly kind: "skip-step";
      readonly step: "untap" | "upkeep" | "draw" | "combat";
      readonly who?: number | PlayerScope;
      readonly thisTurn?: true;
      /** With `"combat"`: "skips **all** combat phases of their next turn"
       * (False Peace), additional ones too. Two of these are still one turn. */
      readonly allOfNextTurn?: true;
    }
  | {
      /**
       * Phase out (rule 702.26b): the permanent `target` names (a slot,
       * `"source"` — "he phases out" — or `"trigger-object"`), the one the
       * effect's source is attached to as this resolves (`attachedToSource` —
       * Robe of Stars' "equipped creature phases out"), or every permanent
       * matching `filter` from the controller's side at once ("all permanents
       * you control phase out" — Teferi's Protection; with
       * `controlledByTarget`, "each creature target player controls" —
       * Galadriel's Dismissal kicked). What's attached to each phases out with
       * it, indirectly (702.26g, 702.26h). Treated as though it doesn't exist
       * until it phases in (702.26b–d): during the untap step of the player
       * who controlled it as it phased out (502.1), or —
       * `untilSourceLeaves` — only as the effect's source leaves the
       * battlefield (610.4 — Oubliette), and not at all if the source has
       * already left, or is back as a new object, as this resolves (610.4b-c).
       * `tappedOnReturn`: "tap that creature as it phases in this way".
       */
      readonly kind: "phase-out";
      readonly target?: EffectTargetRef;
      readonly attachedToSource?: boolean;
      readonly filter?: CardFilter;
      readonly controlledByTarget?: number;
      readonly untilSourceLeaves?: boolean;
      readonly tappedOnReturn?: boolean;
    }
  | {
      /** `target` becomes a creature (rule 613 layer 4 for the added/set
       * types + subtypes, layer 5 for `setColors`, layer 6 for `keywords` /
       * `loseAbilities`, layer 7b for the set P/T). Printed types are kept —
       * a man-land is "still a land". `"source"` is the usual target
       * (man-lands animate themselves); Turn to Frog targets a creature. */
      readonly kind: "animate";
      readonly target: EffectTargetRef;
      /** Its base P/T. A live amount is read once, as the effect applies
       * (rule 608.2h — Zur, Eternal Schemer's "base power and base
       * toughness each equal to its mana value"), and stays that.
       *
       * Either alone sets **base power or base toughness alone** in layer
       * 7b (rule 613.4b), the other left as it is: Island of Wak-Wak's
       * "target creature with flying has base power 0 until end of turn" is
       * `{ power: 0, addTypes: [], addSubtypes: [] }`, Riptide Mangler's
       * "this creature's base power becomes equal to target creature's
       * power" `power: { powerOf: 0 }` with `duration: "permanent"`, Chariot
       * of the Sun's "has base toughness 1" `toughness: 1`. With no
       * `addTypes` nothing becomes a creature; it only sets the value. With
       * neither, its P/T is what it was, or what a `grant-static`'s
       * `setBasePtFromCount` beside it says: "becomes a Monk Avatar creature
       * … and gains 'This creature's power and toughness are each equal to
       * the number of lore counters on it'" (Myth Realized), read live.
       * Any other whole ability it becomes a creature "with" goes the same way,
       * a grant beside it in one `sequence`: `grant-triggered` (Raging Ravine),
       * `grant-static` (Restless Spire), `grant-protection` (Opal Guardian). */
      readonly power?: EffectAmount;
      readonly toughness?: EffectAmount;
      readonly addTypes: readonly CardType[];
      /** "Becomes a [type]" with no "in addition" and no "it's still a …":
       * these card types *replace* its others (rule 205.1a), and a subtype
       * that went only with a lost type goes too — Sarkhan, the
       * Dragonspeaker's +1, "becomes a legendary 4/4 red Dragon creature",
       * stops being a planeswalker (no Sarkhan type, no loyalty lost while
       * it isn't one). Supertypes stay. */
      readonly setTypes?: readonly CardType[];
      readonly addSubtypes: readonly string[];
      /** Replace its subtypes of the same kind (Turn to Frog: "a … Frog" —
       * its creature types; rule 205.1a). */
      readonly setSubtypes?: readonly string[];
      /** Set the colours (Turn to Frog: "blue"). */
      readonly setColors?: readonly Color[];
      /** Colours **in addition to its other colors** (layer 5, rule 105.3 —
       * Phantasmal Form's "become blue Illusions in addition to their other
       * colors and types", Halsin's "a green Bear creature … in addition"). */
      readonly addColors?: readonly Color[];
      /** The permanent loses all of its own abilities (Turn to Frog). */
      readonly loseAbilities?: boolean;
      readonly keywords?: readonly Keyword[];
      readonly duration: PtDuration;
    }
  | {
      /**
       * "[It] becomes a Demon **in addition to its other types**" (Clavileño,
       * First of the Blessed; Jenova, Ancient Calamity's "that creature
       * becomes a Mutant"): types and/or subtypes added in layer 4, and
       * nothing else — its P/T, colours and abilities are left alone, unlike
       * `animate`. `"end-of-turn"` or `"permanent"` (for as long as it's on
       * the battlefield). `target` is a slot, `"source"` or
       * `"trigger-object"`; a card returned to the battlefield earlier in the
       * same resolution keeps its id, so its slot still reaches it there.
       */
      readonly kind: "add-types";
      readonly target: EffectTargetRef;
      readonly addTypes?: readonly CardType[];
      readonly addSubtypes?: readonly string[];
      /**
       * "Becomes a [type]" with no "in addition": these **replace** its card
       * types (rule 205.1a — Opal Acrolith's "it becomes an enchantment", no
       * longer a creature; its subtypes that went only with a lost type go
       * too, its supertypes stay), applied before `addTypes`.
       */
      readonly setTypes?: readonly CardType[];
      /**
       * "**Isn't** a creature until end of turn" (Blink's Alien Angel), "isn't
       * an artifact" (Neurok Transmuter): these card types go, its others stay,
       * and a subtype that went only with them goes too (rule 205.1a's reading
       * of a lost type, Weeping Angel's ruling). An attacker or blocker is
       * removed from combat (rule 506.4).
       */
      readonly removeTypes?: readonly CardType[];
      /**
       * "It **isn't an Equipment**" (Dancing Sword): these subtypes go, its
       * types stay.
       */
      readonly removeSubtypes?: readonly string[];
      /**
       * "Becomes a Coward" / "becomes the creature type of your choice"
       * (Boldwyr Intimidator, the Mistforms — `CHOSEN_CREATURE_TYPE` under a
       * `choose-creature-type`): these replace its subtypes of the same kind
       * (205.1a — every creature type goes), applied before `addSubtypes`.
       */
      readonly setSubtypes?: readonly string[];
      /** Colours in addition to its others (layer 5, rule 105.3) — Unctus,
       * Grand Metatect's "becomes a blue artifact in addition to its other
       * colors and types", Possessed Goat's "a black Demon in addition". */
      readonly addColors?: readonly Color[];
      readonly duration: PtDuration;
    }
  | {
      /**
       * Every battlefield permanent matching `filter` (from the effect's
       * controller's perspective) becomes an N/N at once — Vihaan's "have
       * Treasures you control become 3/3 Construct Assassin artifact creatures
       * in addition to their other types until end of turn". The mass form of
       * `animate`, with the same layers: types and subtypes added in layer 4,
       * keywords in 6, base P/T set in 7b. With no `addTypes` it only sets
       * base P/T ("creatures your opponents control have base power and
       * toughness 1/1 until end of turn").
       *
       * The matches are fixed as the effect begins, and a token stack is
       * animated whole rather than split. The P/T may be a live amount, read
       * once as the effect applies and fixed from then on (rule 608.2h) —
       * Mirror Entity's "{X}: … creatures you control have base power and
       * toughness X/X" is `"x"`.
       */
      readonly kind: "animate-all";
      readonly filter: CardFilter;
      readonly power: EffectAmount;
      readonly toughness: EffectAmount;
      readonly addTypes?: readonly CardType[];
      readonly addSubtypes?: readonly string[];
      readonly keywords?: readonly Keyword[];
      readonly duration: PtDuration;
      /** "Each **other** creature" — not the effect's own permanent (Graven
       * Dominator). Read from exile (a haunt trigger), nothing is left out. */
      readonly exceptSource?: boolean;
      /** "Creatures **target player** controls have base power and toughness
       * 1/1" (Mass Diminish): `filter` read from the side of the player in
       * this target slot, as `modify-pt-all`'s. Nothing when that target has
       * gone illegal (rule 608.2b). */
      readonly controlledByTarget?: number;
    }
  | {
      /** "Manifest the top card of your library" (rule 701.40), or cloak it
       * (701.58): it goes onto the battlefield face down as a 2/2 — with ward
       * {2} if cloaked — under the manifesting player, from their own library.
       * Reality Shift's "its controller manifests" is `{ controllerOfTarget: 0 }`,
       * as the target last existed. Several are manifested one at a time
       * (701.40e). */
      readonly kind: "manifest";
      readonly who: PlayerScope | { readonly controllerOfTarget: number };
      /** How many — 1 by default, or an amount read as it resolves
       * (Omarthis, Ghostfire Initiate's "equal to the number of counters on
       * it"), each one a manifest of its own. */
      readonly count?: EffectAmount;
      readonly cloak?: true;
      /** Whose library the card comes from, when it isn't the manifesting
       * player's own: "you manifest the top card of **that player's**
       * library" (Thieving Amalgam: `"active-player"`; Orochi Soul-Reaver:
       * `"trigger-player"`). It enters under the manifesting player's
       * control (rule 110.2a); its owner can't look at it (708.5). Nothing
       * when that player has left the game or the slot is illegal. */
      readonly from?: EffectPlayerRef;
    }
  | {
      /**
       * "Turn target creature face down" (rule 708.2a): the same permanent,
       * now a face-down 2/2 with no name, text, subtypes or mana cost — or
       * with the characteristics `as` lists (708.2: Cyber Conversion's "It's
       * a 2/2 Cyberman artifact creature"). Its counters, attachments and
       * the effects on it stay; it doesn't leave the battlefield. Only its
       * controller may look at it (708.5), and it's turned face up only by
       * its morph or disguise cost (702.37e — Backslide's "turn target
       * creature with a morph ability face down"). Nothing happens to one
       * already face down (708.2b) or to a double-faced permanent (712.16).
       * `target` may be `"source"` (Wall of Deceit's "{3}: Turn this
       * creature face down"); Weaver of Lies' "any number of target
       * creatures" wraps it in a `for-each-target`.
       */
      readonly kind: "turn-face-down";
      readonly target: EffectTargetRef;
      readonly as?: FaceDownAs;
    }
  | {
      /**
       * "Turn target face-down creature face up" (Ixidor, Reality Sculptor's
       * ability, Break Open, Skirk Alarmist): by an effect, no cost paid, and
       * however it came to be face down (rule 708.7). The same permanent, its
       * counters and the effects on it staying (708.8); a "when this is
       * turned face up" triggers, a megamorph gets no counter (its cost wasn't
       * paid, 702.37b), and "as this is turned face up" still applies.
       * Nothing happens to one that isn't face down — Showstopping Surprise's
       * "turn it face up if it's face down" — or that can't be turned face up
       * (`cant-turn-face-up`). An instant or sorcery card is revealed and
       * stays face down, with nothing triggering (701.40g, 701.58g). "You may
       * turn a face-down creature you control face up" (Ugin's Mastery) is a
       * `choose-permanents` over `faceDown` with this as its `then`.
       */
      readonly kind: "turn-face-up";
      readonly target: EffectTargetRef;
    }
  | {
      /** Manifest dread (rule 701.62a): the player looks at the top two cards
       * of their library, manifests one of them (their choice, seen by no one
       * else), then puts the rest into their graveyard — the
       * `look-and-choose` with `destination: "manifest"`, `leftover:
       * "graveyard"`. `who` is the effect's controller (`"you"`, the
       * default) or a target's controller as it last existed — Unwanted
       * Remake's "its controller manifests dread" is `{ controllerOfTarget:
       * 0 }`. `count` manifests dread that many times, each finished before
       * the next (They Came from the Pipes' "twice"). */
      readonly kind: "manifest-dread";
      readonly who?: "you" | { readonly controllerOfTarget: number };
      readonly count?: number;
    }
  | {
      readonly kind: "create-token";
      /** Name of a token definition in the {@link CardRegistry}. */
      readonly token: string;
      readonly count: EffectAmount;
      /** Who the tokens are created under the control of — the effect's
       * controller (default), or the controller of `targets[0]` (Beast Within:
       * "its controller creates a 3/3 Beast"; An Offer You Can't Refuse: the
       * countered spell's controller). Rule 111.11 — for a destroyed /
       * countered target this is its last-known controller. A
       * {@link PlayerScope} has each of those players create `count` tokens
       * ("each opponent creates a Treasure token"). */
      readonly who?: "target-controller" | PlayerScope;
      /** The tokens enter **tapped** (Army of the Damned, Necrotic Hex,
       * Overseer of the Damned). These are never folded into a token stack —
       * see `mintTokenBatch`. */
      readonly tapped?: boolean;
      /** "Sacrifice them at the beginning of the next end step" (Chandra,
       * Acolyte of Flame). Sacrificed rather than exiled, so dies-triggers
       * see them go — the same per-object flag Encore uses. */
      readonly sacrificeAtEndStep?: boolean;
      /** "Exile that token at the beginning of the next end step" (Manaform
       * Hellkite): exiled, not sacrificed, so nothing sees it die — the
       * per-object flag a token copy's `exileAtEndStep` sets. */
      readonly exileAtEndStep?: boolean;
      /** "**They gain haste until end of turn**" (Ovika, Enigma Goliath): the
       * tokens this creates get these keywords until the turn ends — the
       * tokens just made and no others, since the grant is part of making
       * them (they fold into a token stack only with ones made the same way). */
      readonly gainUntilEndOfTurn?: readonly Keyword[];
      /** "**They gain haste**" with no duration (Chandra, Acolyte of Flame):
       * keywords the tokens gain for as long as they last — part of making
       * them, as `gainUntilEndOfTurn` is, but not copiable (rule 707.2), so
       * a copy of one doesn't have them, unlike a printed keyword. */
      readonly gainKeywords?: readonly Keyword[];
      /**
       * "Create a Monster Role token **attached to target creature**" (rule
       * 303.7 — the Roles of Wilds of Eldraine; The Rani's Mark of the
       * Rani): an Aura token created attached to the permanent this names
       * — a slot, `"source"`, `"trigger-object"` — as it enters. Enchanting
       * isn't targeting, so hexproof doesn't stop it, but protection does;
       * one that can't legally enchant that permanent, or with nothing
       * there, **isn't created** (the Role rulings). Each token is its own
       * object (never a stack), and two of one player's Roles on one
       * permanent leave only the newest (rule 704.5z).
       */
      readonly attachedTo?: EffectTargetRef;
      /** "**The tokens are goaded for the rest of the game**" (Rendmaw,
       * Creaking Nest; Nettling Nuisance) — by this effect's controller,
       * whoever creates them: a token of their own must attack each combat
       * too (rule 701.15b). Part of making them, like `gainUntilEndOfTurn`. */
      readonly goadedForGame?: boolean;
      /** "…**then put N counters on it**" (Zaxara, the Exemplary's "create a
       * 0/0 green Hydra creature token, then put X +1/+1 counters on it"):
       * the effect's controller puts them on each token this made, once it
       * has entered. It entered without them, and state-based actions don't
       * look at a 0/0 until the effect is done. Such tokens are always made
       * as separate objects, never folded into a token stack as they're made. */
      readonly thenCounters?: { readonly kind: string; readonly amount: EffectAmount };
      /** "Create an **X/X** … token": its base power and toughness, set as
       * it's made — part of what the token is, so every other P/T effect
       * applies over them (Rootha, Mastering the Moment's Elemental, the
       * token's printed P/T being 0/0). Read once, as the effect resolves. */
      readonly basePt?: { readonly power: EffectAmount; readonly toughness: EffectAmount };
      /** The tokens enter **attacking** (rule 508.4) — "create two 1/1 white
       * Soldier creature tokens that are tapped and attacking" (Hero of
       * Bladehold) is this with `tapped`. See {@link EnterAttacking}. */
      readonly attacking?: EnterAttacking;
      /** Each token made its own object, never folded into a token stack —
       * for an effect that goes on to tell the tokens it made from older
       * ones: Martial Coup's "create X 1/1 white Soldier creature tokens …
       * destroy all **other** creatures" (`notThisWay: "created"`), where a
       * stack of Soldiers the new ones joined would be spared with them. */
      readonly separate?: boolean;
      /** "That token gains haste until end of turn and **attacks this combat
       * if able**" (Legion Warboss): a requirement on the tokens made (rule
       * 508.1d) that ends with this combat (rule 500.5a), not the turn — a
       * later combat phase doesn't bind them. With `gainUntilEndOfTurn:
       * ["haste"]` for the haste. */
      readonly attacksThisCombat?: boolean;
    }
  | {
      /**
       * Do `effect` once for each player in `who`, in turn order, as this
       * effect's controller, with the `"that-player"` scope naming that
       * player: Adeline, Resplendent Cathar's "for each opponent, create a
       * 1/1 white Human creature token that's tapped and attacking that
       * player or a planeswalker they control". Unlike `each-player-may`,
       * nobody is asked anything; and unlike a `create-token`'s `who`, it's
       * this effect's controller doing it, about each of them.
       */
      readonly kind: "for-each-player";
      /** `"owners-of-exiled-with-source"`: each owner of a card in exile
       * linked to this source (rule 607.2a), in turn order — Skyclave
       * Apparition's "the exiled card's owner creates …". Nobody, with none.
       * A {@link ChosenPlayerRef} is one player — "**target opponent** exiles
       * a card from their hand" (Skullcap Snail): a `look-and-choose` with
       * `player: "that-player"` inside is theirs to choose. */
      readonly who: PlayerScope | "owners-of-exiled-with-source" | ChosenPlayerRef;
      readonly effect: EffectSpec;
      /** "Each player **who** …": only the players in `who` for whom this
       * holds, read with that player as `"that-player"` (an `of-player`) —
       * Depopulate's "each player who controls a multicolored creature draws
       * a card". All of them are found as it begins, before any of them acts
       * (Tectonic Hellion's "each player who controls the most lands
       * sacrifices two lands": a tied player still sacrifices after the first
       * has). */
      readonly whoIf?: StaticCondition;
      /** With `whoIf`: the instruction those players are found **before** —
       * "each opponent discards a card. **Each opponent who can't** loses 3
       * life" (Entropic Battlecruiser), "for each opponent who can't, you gain
       * 4 life" (Cruel Grimnarch), "each player sacrifices a creature or
       * planeswalker of their choice. Each player who can't discards a card"
       * (Plaguecrafter). `whoIf` says who can't as this begins, then this is
       * done, then `effect` for each of them: a player who discards their last
       * card could, and isn't one. */
      readonly before?: EffectSpec;
      /** Set by the engine once `before` has been done: the players found. */
      readonly found?: readonly PlayerId[];
      /** One instruction, one event, as a `sequence`'s `simultaneous` is:
       * Adeline's Humans, one per opponent, enter together, so "whenever one
       * or more tokens enter" sees them once. Only where nothing in `effect`
       * stops to ask. */
      readonly simultaneous?: boolean;
      /** "**Each opponent chooses** a creature card in their graveyard. Put
       * those cards onto the battlefield under your control" (Dredge the
       * Mire): the players choose in turn, each knowing the choices before
       * theirs, and only then do the chosen cards enter, all at once (rule
       * 101.4, the ruling). A card already chosen can't be chosen again:
       * Rejoin the Fight's "that hasn't been chosen". For a `look-and-choose`
       * onto the battlefield from a hand or a graveyard. */
      readonly choicesHeld?: true;
      /** Set by the engine on the copy it parks when one player's `effect`
       * stops to ask something (myriad's "you may"): the players still to
       * go, fixed when it began. */
      readonly remaining?: readonly PlayerId[];
    }
  | {
      /**
       * A vote (rule 701.38): each player still in the game votes for one of
       * `for`'s choices, starting with this effect's controller and going on
       * in turn order (701.38a) — "Will of the council — Starting with you,
       * each player votes for time or knowledge" (Plea for Power). A player
       * who controls a "while voting, you may vote an additional time"
       * (`StaticAbility.votesAdditionalTime`) may cast one more vote for each,
       * asked straight after their first (701.38d).
       *
       * Every vote is in by the time the next step of the effect happens,
       * which reads them: `{ votesFor }`, `{ votesReceived }`, the `vote-won`
       * and `votes-cast` conditions, `for-each-vote` and `for-each-voted`.
       * Once everyone has voted a `votes-finished` event fires "whenever
       * players finish voting" (Erestor of the Council).
       *
       * `secret` is secret council's "each player secretly votes …, then
       * those votes are revealed" (Mob Verdict): nobody sees a vote until
       * they're all cast, and then all at once.
       */
      readonly kind: "vote";
      readonly for:
        /** Named options — "votes for fellowship or aid". */
        | { readonly options: readonly string[] }
        /** A permanent matching `permanent`, read from the effect's
         * controller's side — Council's Judgment's "a nonland permanent you
         * don't control". `upTo` is Vault 11's "votes for **up to one**
         * creature": a player may cast no vote, or Mount Doom's "choose **up
         * to two** creatures" — one vote a permanent. A player with nothing
         * to vote for casts none. */
        | {
            readonly permanent: CardFilter;
            readonly upTo?: number;
            /** Only with `choose`: "each player chooses **three** nonland
             * permanents they control" (Fall of the First Civilization) —
             * one vote a permanent, and as many as there are with fewer
             * (rule 609.3). One when absent. */
            readonly count?: number;
            /** Read from the chooser's side instead — Agitator Ant's "each
             * player may put two +1/+1 counters on a creature **they**
             * control" (`controlledBy: "you"` is the chooser). */
            readonly own?: true;
            /** Only with `choose`: what's chosen is what's spared ("each
             * player chooses a creature they control. Destroy the rest" —
             * Divine Reckoning; the next step's filter says `notThisWay:
             * "chosen"`). It only changes how it's asked: "… to keep", the
             * strongest first, and nothing asked when exactly `count` is all
             * there is. */
            readonly keep?: true;
          }
        /** A player still in the game — `"another"`: other than the voter
         * (Mob Verdict's "votes for another player"). */
        | { readonly player: "any" | "another" }
        /** A creature type (rule 205.3m) — only with `choose`: Harsh
         * Mercy's "each player chooses a creature type". The type is the
         * vote's `text`; `CHOSEN_THIS_WAY` reads it back. */
        | { readonly creatureType: true }
        /** A whole number from `min` (default 0), up to `max` when the card
         * bounds it — only with `choose`, asked as the `choose-number`
         * decision. Wheel of Misfortune's "each player secretly chooses a
         * number 0 or greater", Choice of Damnations' "target opponent
         * chooses a number". `{ votedNumber }` and the `voted-number`
         * condition read them. */
        | { readonly number: { readonly min?: number; readonly max?: number } };
      readonly secret?: boolean;
      /**
       * "Each player chooses …" rather than "votes" — the same questions
       * (rule 101.4: one player at a time, each knowing the choices before
       * theirs, 101.4b), but not a vote (701.38): no additional votes, and
       * nothing that triggers on voting sees it. What the next steps read is
       * the same — `for-each-vote`, `for-each-voted`, `{ votesFor }` —
       * and `with-choices` substitutes the choices into a step. Eye of
       * Doom's "each player chooses a nonland permanent", Harsh Mercy's
       * creature types, Master of Ceremonies' "each opponent chooses money,
       * friends, or secrets".
       */
      readonly choose?: true;
      /** Who chooses — only with `choose`; every player when absent. A
       * {@link ChosenPlayerRef} is one player: "**target opponent** chooses a
       * creature they control" (Imperial Edict). */
      readonly who?: PlayerScope | ChosenPlayerRef;
      /** Who chooses first, the rest following in turn order: the effect's
       * controller (a vote's "starting with you", 701.38a — a vote always
       * starts there), the active player (rule 101.4 — a choice's default),
       * or the next opponent in turn order after the controller (Sadistic
       * Shell Game's "starting with the next opponent in turn order").
       * `"you-then-active-player"` is the controller, then everyone else from
       * the active player (Fortunate Few's "choose …, then each other player
       * chooses …", by its ruling). */
      readonly startingWith?: "you" | "active-player" | "next-opponent" | "you-then-active-player";
      /** Set by the engine on the copy it parks between one vote and the
       * next: the votes still to ask for, each with whether it's an
       * additional, optional one. */
      readonly toAsk?: readonly { readonly player: PlayerId; readonly extra: boolean }[];
    }
  | {
      /** One vote being cast — the effect of the option a voter picks. Built
       * by the engine, never authored. `choice` `"target"` is the permanent
       * in target slot 0 (a `vote` for a permanent). */
      readonly kind: "cast-vote";
      readonly voter: PlayerId;
      /** The `vote`'s `keep`, for a default answer: what's chosen is spared. */
      readonly keep?: true;
      /** `"creature-type"`: the creature type just chosen, substituted in
       * as the vote's option (`castCreatureTypeVote`). `"number"`: the
       * `choose-number` just answered, read as `"x"`. */
      readonly choice: VoteChoice | "target" | "creature-type" | "number";
    }
  | {
      /**
       * `effect` with what the `vote` (or `choose`) this resolution held was
       * for substituted in: every `CHOSEN_THIS_WAY` in a list becomes every
       * option chosen, once each — Harsh Mercy's "destroy all creatures that
       * aren't of a type chosen this way" (`notSubtypes:
       * [CHOSEN_THIS_WAY]`), Patriarch's Bidding's "returns all creature
       * cards of a type chosen this way". A `CHOSEN_THIS_WAY` on its own is
       * the first one chosen. Inside `for-each-vote`, it is that vote's own
       * choice instead (Grave Sifter's "cards of that type").
       */
      readonly kind: "with-choices";
      readonly effect: EffectSpec;
    }
  | {
      /**
       * Do `effect` once for each vote cast in the `vote` this resolution
       * held — or only each vote for option `option` — in turn order from
       * the active player, each voter's votes together (rule 101.4), with
       * `"that-player"` naming the voter: Expropriate's "for each money
       * vote, choose a permanent owned by the voter and gain control of it",
       * Tivit's "for each evidence vote, investigate". As `for-each-player`
       * does, one stopping to ask is answered before the next goes on.
       */
      readonly kind: "for-each-vote";
      readonly option?: number;
      readonly effect: EffectSpec;
    }
  | {
      /**
       * Do `effect` for each player or permanent that the `vote` this
       * resolution held was for: `"most"` — "each permanent with the most
       * votes or tied for most votes" (Council's Judgment); `"voted"` —
       * "for each creature with one or more votes" (Trap the Trespassers);
       * `"unvoted"` — "each player who received no votes" (Círdan the
       * Shipwright; players only). A player is `"that-player"` in `effect`,
       * in turn order; a permanent is target slot 0, still on the
       * battlefield as the object voted for, in the order first voted for.
       * `{ votesReceived }` reads how many it got.
       *
       * `simultaneous` makes it one instruction, as a `sequence`'s does —
       * Council's Judgment exiles them all at once. Only where nothing in
       * `effect` stops to ask.
       */
      readonly kind: "for-each-voted";
      readonly which: "most" | "voted" | "unvoted";
      readonly effect: EffectSpec;
      /** Players only: just those in this scope — Mob Verdict's "for each
       * vote **an opponent** received" (`"each-opponent"`) and "for each
       * vote **you** received" (`"you"`). */
      readonly who?: PlayerScope;
      readonly simultaneous?: boolean;
    }
  | {
      /** Create `count` token(s) that are copies of a permanent (rule 707.10 —
       * needed-cards P5b). `of` names what to copy: `"source"` (Scute Swarm —
       * the ability's own permanent), `"trigger-object"` (Miirym — the
       * permanent whose entering fired the trigger), or a target-slot index.
       * The tokens enter under the copied permanent's controller (rule 111.11 /
       * "its controller creates" — for a destroyed target its last-known
       * controller). */
      readonly kind: "create-token-copy";
      /** `"entered-together"` is "for each of them": a copy (`count`) of
       * each permanent of the entry a batched `enters-battlefield` trigger
       * fired on — Kambal, Profiteering Mayor. `{ each }` is a copy of each
       * permanent matching the filter as this resolves, a token stack once
       * per token in it — Redoubled Stormsinger's "for each creature token
       * you control that entered this turn, create … a copy of that token".
       * `"equipped"` is the creature the source is attached to — Helm of the
       * Host's "a copy of equipped creature": as this resolves, or, if the
       * source has left, the one it was last attached to (its last-known
       * information if that's gone too); nothing if it equips nothing (the
       * Helm's rulings). `"enchanted"` is the same for an Aura — Followed
       * Footsteps's "a copy of enchanted creature".
       *
       * The rest are copies of **cards**, each read as the card it is rather
       * than as what it last was on the battlefield (as `asCard`), and each
       * entering under the effect's controller ("create a token"); a copy of
       * an instant or sorcery card is no token at all (rule 111.5):
       * `"exiled-with-source"` is "the exiled card" of a linked ability
       * (rule 607.2a): a copy of each card in exile this source exiled, in
       * the stint the resolving ability refers to, an "until this leaves the
       * battlefield" exile's included (rule 610.3) — Mardu Siegebreaker, or
       * with `chooseOne` Mimic Vat's "a card exiled with this artifact".
       * `"exiled-as-cost"` is what was exiled to pay this spell's or
       * ability's cost — Dollhouse of Horrors. `"exiled-this-way"` is each
       * card this resolution has exiled so far — Foggy Swamp Visions.
       * `{ eachExiled }` is each face-up card in exile matching the filter,
       * from this effect's controller's side — Altaïr Ibn-La'Ahad. */
      readonly of:
        | "source"
        | "trigger-object"
        | "entered-together"
        | "equipped"
        | "enchanted"
        | "exiled-with-source"
        | "exiled-as-cost"
        | "exiled-this-way"
        | number
        | { readonly each: CardFilter }
        | { readonly eachExiled: CardFilter };
      /** How many, read as this applies: Rionya, Fire Dancer's "create X
       * tokens that are copies of …, where X is one plus the number of
       * instant and sorcery spells you've cast this turn". */
      readonly count: EffectAmount;
      /** With `of: "exiled-with-source"`: "a card exiled with this" — one
       * of them, chosen as this resolves if there's more than one (Mimic
       * Vat's melded-pair ruling), rather than a copy of each. */
      readonly chooseOne?: true;
      /** `count` copies **for each time its squad cost was paid** (rule
       * 702.157a — the `squadTrigger` helper): times the number of times
       * the source's spell paid its squad (a multikicker-style) cost, read
       * from it as it last existed if it has left. */
      readonly perTimeKicked?: true;
      /** The token copies have haste — a copy exception ("except it has
       * haste" — Kiki-Jiki), which lasts as long as they do. */
      readonly gainsHaste?: boolean;
      /** "**It gains haste until end of turn**" (Mishra, Eminent One): the
       * keywords last only this turn, unlike `gainsHaste`. */
      readonly gainUntilEndOfTurn?: readonly Keyword[];
      /** "It **gains** haste and 'When this token dies, draw a card'" (Jaxis,
       * the Troublemaker): abilities the copies gain with no end, an effect
       * on them rather than a copy exception — so a copy of one of them has
       * none of it (the rulings). */
      readonly gains?: { readonly keywords?: readonly Keyword[]; readonly triggered?: readonly TriggeredAbility[] };
      /** Exile the token copies at the beginning of the next end step (Miirym). */
      readonly exileAtEndStep?: boolean;
      /** "Exile the tokens at end of combat" (myriad, rule 702.116a; Delina,
       * Wild Mage): a delayed triggered ability over the copies made, at the
       * beginning of the end of combat step — on the stack, like any. */
      readonly exileAtEndOfCombat?: boolean;
      /** "Sacrifice that token at end of combat" (Phantom Steed): as
       * `exileAtEndOfCombat`, but dies-triggers see it go. */
      readonly sacrificeAtEndOfCombat?: boolean;
      /** With `exileAtEndStep` or `sacrificeAtEndStep`: at the beginning of
       * **your** next end step rather than the next one, whoever's turn that
       * is — Foggy Swamp Visions's "at the beginning of your next end step,
       * sacrifice those tokens" (a difference once it's cast with flash on
       * another player's turn). */
      readonly atYourNextEndStep?: true;
      /** The copies enter **tapped** — with `attacking`, "a token copy that's
       * tapped and attacking" (myriad). */
      readonly tapped?: boolean;
      /** …and **attacking** (rule 508.4) — see {@link EnterAttacking}. */
      readonly attacking?: EnterAttacking;
      /** *Sacrifice* them at the beginning of the next end step instead
       * (Kiki-Jiki, Mirror Breaker) — the difference is whether dies-triggers
       * see them go. */
      readonly sacrificeAtEndStep?: boolean;
      /** The copies are not legendary (Miirym — "except it's not legendary"). */
      readonly notLegendary?: boolean;
      /** Who the token enters under. Default is the *copied* permanent's own
       * controller (Miirym copying your own Dragons); `"you"` puts it under
       * the effect's controller instead, which is what a card that copies
       * something an opponent controls means (Hate Mirage). */
      readonly who?: "you";
      /** Override the copies' base power/toughness, as part of their copiable
       * values (rule 707.9b), so counters and anthems still apply: "except
       * it's 1/1", or Saw in Half's "except their power is half that
       * creature's power …" — `{ half: { powerOf: 0 }, round: "up" }`, read
       * as the destroyed creature last existed (its ruling). Read signed: a
       * value that *sets* power or toughness may be negative (rule 107.1b). */
      readonly basePt?: readonly [EffectAmount, EffectAmount];
      /** The rest of a copy's exceptions — see {@link CopyExceptions}. */
      readonly exceptions?: CopyExceptions;
      /** A copy of **the card as it is now**, where the default copies a
       * permanent that has left as it last existed on the battlefield
       * (rule 608.2h): Myrkul, Lord of Bones's "a copy of that card", the
       * one it just exiled — "not of the creature as it last existed on the
       * battlefield" (its ruling). */
      readonly asCard?: boolean;
    }
  | {
      /** Attach an Aura or Equipment to a target permanent: the source (an
       * Equip ability), or with `attachment` another one — Hammer of
       * Nazahn's and Sigarda's Aid's "you may attach **that Equipment** to
       * target creature you control" is `attachment: "trigger-object"`, the
       * Equipment whose entering fired the trigger. Only the same object
       * that did (rule 400.7), and only onto something it could legally be
       * attached to (rule 301.5c); otherwise nothing moves.
       *
       * `target: "created"` is the token an earlier step of this resolution
       * created, rather than a target — living weapon's "create a 0/0 black
       * Phyrexian Germ creature token, then attach this to it" (rule
       * 702.92a), with `attachment: "source"`. With several made (Doubling
       * Season), it goes onto one of them (the rulings).
       *
       * `target` may also name an object without targeting it:
       * `"trigger-object"`, the permanent whose entering fired the trigger —
       * Hero's Blade's "whenever a legendary creature you control enters, you
       * may attach this Equipment to **it**", Shielded by Faith's "attach this
       * Aura to **that creature**" — or `"source"`, the ability's own
       * permanent — Cloud, Ex-SOLDIER's "attach up to one target Equipment
       * you control **to it**" (with `attachment: 0`). Each only while it is
       * still the object it was (rule 400.7).
       *
       * `attachments` attaches **every** permanent matching the filter, each
       * in turn, rather than one — Balan, Wandering Knight's "attach all
       * Equipment you control to Balan" (`{ subtype: "Equipment",
       * controlledBy: "you" }`, `target: "source"`). Each one that can't
       * legally go there stays where it is (rule 701.3b).
       *
       * `choose` attaches **any number** of the permanents matching its
       * filter, chosen as this resolves (not targeted) — Ardenn, Intrepid
       * Archaeologist's "you may attach any number of Auras and Equipment
       * you control to target permanent or player". A player is enchanted
       * only by an Aura that can enchant them (a Curse — rule 303.4); one
       * that can't go there stays where it is (701.3b). */
      readonly kind: "attach";
      /** What it's attached to — see {@link AttachRef} (`"put-this-way"`:
       * Pre-War Formalwear's "return target creature card … and attach this
       * Equipment to it"). Ignored with `ontoChosen`. */
      readonly target: AttachRef;
      /** What's attached, when it isn't the source — see {@link AttachRef}
       * (`"put-this-way"`: Stonehewer Giant's found Equipment). */
      readonly attachment?: AttachRef;
      /** "Equip planeswalker" (rule 702.6e, Luxior, Giada's Gift): this
       * Equipment goes on a planeswalker "as though that planeswalker were a
       * creature". */
      readonly planeswalkerToo?: true;
      readonly attachments?: CardFilter;
      /** `upTo`: at most that many — Vow to Erebor's "you may attach **an**
       * Equipment you control to it" is `upTo: 1`. */
      readonly choose?: { readonly filter: CardFilter; readonly prompt: string; readonly upTo?: number };
      /** Attach it to **a permanent chosen as this resolves**, not targeted
       * (rule 608.2c): Stonehewer Giant's "attach it to a creature you
       * control", Aura Graft's "attach it to another permanent it can
       * enchant". The choice is the effect's controller's, among the
       * permanents matching `filter` (read from their side) that the
       * attachment could legally be attached to now (rules 301.5, 303.4,
       * 701.3a) — `another`: not the one it's attached to already. Exactly
       * one, or with `optional` none ("you may attach it"); with none it
       * could go on, nothing happens. */
      readonly ontoChosen?: {
        readonly filter: CardFilter;
        readonly prompt: string;
        readonly optional?: true;
        readonly another?: true;
      };
      /** Engine-built: where a `choose`'s picks go, carried past the choice
       * (which rebinds target 0 to each pick). */
      readonly onto?: TargetRef;
      /** Engine-built: what an `ontoChosen` attaches, carried past the
       * choice (which rebinds target 0 to the permanent chosen). */
      readonly attaching?: TargetRef;
    }
  | {
      /** Unattach `target` (an Aura or Equipment) from whatever it's attached
       * to — reconfigure's second ability (rule 702.151a), "Unattach this
       * permanent"; it stays on the battlefield. Nothing for one that isn't
       * attached or has left (rule 400.7). */
      readonly kind: "unattach";
      readonly target: EffectTargetRef;
    }
  | {
      /** A Licid's ability (`licid: true` on it): "~ loses this ability and
       * becomes an Aura enchantment with enchant creature. Attach it to
       * target creature. You may pay `endCost` to end this effect." The
       * source becomes the Aura (`GameObject.licid`), then is attached to
       * `target` — or, if it can't enchant that, stays an unattached Aura and
       * goes to the graveyard (rule 704.5m). Nothing once the source has left
       * (rule 400.7). */
      readonly kind: "become-licid-aura";
      readonly target: EffectTargetRef;
      readonly endCost: string;
    }
  | {
      /** Transform `target` — turn a transforming double-faced permanent over
       * to its other face (rule 701.28 / 712.10 — ROADMAP Phase 10b). No-op
       * for a permanent that isn't a transforming DFC. `"source"` transforms
       * the ability's own permanent (a werewolf, "sacrifice …: transform ~"). */
      readonly kind: "transform";
      readonly target: EffectTargetRef;
    }
  | {
      /** Flip `target` (rule 710 — "flip this creature"): it gets the flipped
       * status, one way, and a flip card shows its alternative half from then
       * on. Only a permanent flips; an already flipped one stays as it is. */
      readonly kind: "flip";
      readonly target: EffectTargetRef;
    }
  | {
      /**
       * An existing permanent becomes a copy of `of` (rules 707.2, 613.2 —
       * layer 1), with `exceptions` — Sarkhan, Soul Aflame's "you may have
       * Sarkhan become a copy of it until end of turn, except its name is
       * Sarkhan, Soul Aflame and it's legendary in addition to its other
       * types". Which: `target` — a slot, `"source"`, `"trigger-object"` —
       * or every permanent `filter` matches as the effect begins ("each
       * other creature", Nanogene Conversion; "Shards you control", Niko,
       * Light of Hope), less `of` itself with `exceptOf` ("each **other**
       * creature"). They change at once, and all copy `of` as it was before
       * any of them did (Mirrorform's target may be one of them).
       *
       * It copies `of`'s copiable values as they are now — what that is
       * copying, if anything, with that copy's exceptions (rule 707.9b) — or
       * as it last existed if it has left the battlefield (rule 608.2h); not
       * its counters, tapped state or other effects on it. A *card* — one
       * in a graveyard, exile or a library (Likeness Looter's "target
       * creature card in your graveyard", Taskmaster's "or creature card in
       * a graveyard") — has only its printed values, front face up (rule
       * 712.8a); `ofCard` says `of` means the card even where it was a
       * permanent until it got there (Lazav, Dimir Mastermind's "that card",
       * whose ruling: "copy effects that applied to the creature card when
       * it was on the battlefield won't be copied"). A spell on the stack
       * has its card's values and its own copy exceptions (The Myriad
       * Pools).
       *
       * The permanent stays the same object: its counters, tapped and
       * summoning-sick status, attachments and every non-copy effect on it
       * stay, and nothing enters or leaves (rule 707.4), so no "enters"
       * ability or "as this enters" replacement of what it copies applies.
       * It is that copy until `until`: `"end-of-turn"` (the cleanup step,
       * rule 514.2), `"next-end-step"` (as the next end step begins — Niko),
       * `"your-next-turn"` (as the effect's controller's next turn begins —
       * Taskmaster), or, absent, for as long as it is that object (rule
       * 611.2a — Thespian's Stage, Mirrorform). Then it is what it was before
       * again — see `GameObject.temporaryCopies`.
       */
      readonly kind: "become-copy";
      readonly target?: EffectTargetRef;
      readonly filter?: CardFilter;
      readonly exceptOf?: true;
      readonly of: EffectTargetRef;
      readonly ofCard?: true;
      readonly until?: "end-of-turn" | "next-end-step" | "your-next-turn";
      readonly exceptions?: CopyExceptions;
    }
  | {
      /** The game becomes day or night (rule 726 — ROADMAP Phase 10b). All
       * daybound/nightbound permanents transform to match. */
      readonly kind: "day-night";
      readonly value: "day" | "night";
    }
  | {
      /**
       * "… becomes prepared" (rule 722.3a): `target` — a slot, or
       * `"source"` (Emeritus of Woe's "this creature becomes prepared") — or
       * every permanent `filter` matches (Codie, Ravenous Codex: "each
       * creature you control"). Only a permanent with a prepare spell that
       * isn't prepared already does; each makes its spell's copy in exile
       * (722.3c — `Game.becomePrepared`).
       */
      readonly kind: "become-prepared";
      readonly target?: EffectTargetRef;
      readonly filter?: CardFilter;
    }
  | {
      /**
       * Empower Jace N (rule 701.71a): "If you don't control a Jace
       * planeswalker token, create a blue Jace planeswalker token with 0
       * loyalty, '[−1]: Surveil 1,' and '[−3]: Draw a card.' Choose a Jace
       * planeswalker token you control. Put N loyalty counters on it." Only a
       * Jace planeswalker *token* counts — never a nontoken Jace, but a copy
       * token does (the rulings); with one, nothing is asked; with several
       * (a Doubling Season made two), the effect's controller chooses (a
       * `choose-permanents`). The counters are `add-counter`'s, so a counter
       * replacement applies.
       */
      readonly kind: "empower-jace";
      readonly amount: EffectAmount;
    }
  | {
      /** A player becomes the monarch (rule 725 — ROADMAP Phase 10). `who`
       * defaults to the effect's controller. `via: "combat-damage"` is the
       * monarch's own steal ability (725.2 — `cards/monarch.ts`), so the
       * event says how. A number is a target slot holding a player: "target
       * opponent becomes the monarch" (Jared Carthalion, True Heir). */
      readonly kind: "become-monarch";
      readonly who?: PlayerScope | number;
      readonly via?: "combat-damage";
    }
  | {
      /** A player takes the initiative (rule 726) — `who` defaults to the
       * effect's controller ("you take the initiative"). One who already has
       * it takes it again (726.5: the venture still triggers). `via:
       * "combat-damage"` is the initiative's own steal ability
       * (`cards/initiative.ts`), so the event says how. */
      readonly kind: "take-initiative";
      readonly who?: PlayerScope;
      readonly via?: "combat-damage";
    }
  | {
      /** Engine-internal: the resolving mutating creature spell merges with
       * its target (rule 702.140c), on top of it or underneath — the two
       * modes `Game` offers its controller as it resolves. Not for a card's
       * own text. */
      readonly kind: "mutate-merge";
      readonly onTop: boolean;
    }
  | {
      /** The effect's controller ventures into the dungeon (rule 701.49):
       * enter a dungeon if they're in none (choosing which, 701.49a), move to
       * the next room (choosing at a fork, 701.49b), or complete it from the
       * bottommost room and enter another (701.49c). `into: "undercity"` is
       * "venture into Undercity" (701.49d — the initiative's): entering, it's
       * Undercity; already in a dungeon, it advances there as usual.
       * `cards/dungeons.ts`. */
      readonly kind: "venture";
      readonly into?: "undercity";
    }
  | {
      /** The effect's controller's speed increases by `amount` (rule
       * 702.179): with no speed, it becomes `amount` (702.179c). What the
       * inherent triggered ability of a player with speed does (702.179d —
       * `cards/speed.ts`, whose "if your speed is less than 4" is its
       * intervening-if, so this never takes it past max speed); no printed
       * card says it yet. */
      readonly kind: "increase-speed";
      readonly amount: number;
    }
  | {
      /**
       * **The Ring tempts you** (rule 701.54): the effect's controller gets the
       * Ring emblem if they have none (701.54c — before choosing), chooses a
       * creature they control to be their Ring-bearer (`choose-permanents`,
       * one, never declined), and is then tempted: the count goes up and
       * "whenever the Ring tempts you" triggers, with no creature to choose
       * too (701.54d). Its `become-ring-bearer` and `ring-tempted` steps are
       * the engine's, never authored.
       */
      readonly kind: "the-ring-tempts-you";
    }
  | {
      /** The chosen creature becomes the effect's controller's Ring-bearer
       * (rule 701.54a) — a step of `the-ring-tempts-you`. */
      readonly kind: "become-ring-bearer";
      readonly target: EffectTargetRef;
    }
  | {
      /**
       * Soulbond's pairing (rule 702.95a): the effect's source becomes paired
       * with `target` — the creature chosen, or the one that entered. Built
       * by `soulbond()`; never author it. Neither becomes paired unless both
       * are still creatures on the battlefield under the ability's
       * controller (702.95c), different, and both unpaired (702.95d).
       */
      readonly kind: "pair";
      readonly target: EffectTargetRef;
    }
  | {
      /** The temptation completes (rule 701.54d) — the last step of
       * `the-ring-tempts-you`. */
      readonly kind: "ring-tempted";
    }
  | {
      /**
       * A player gets `amount` counters of a kind (rule 122.1) — "you get an
       * experience counter" (Ezuri, Claw of Progress), "that player gets two
       * poison counters" (Fynn, the Fangbearer: `who: "trigger-player"`). To
       * the effect's controller by default, a `PlayerScope`, or the player in
       * target slot `target`. Ten poison counters lose the game (rule
       * 704.5c). Energy has its own `get-energy`.
       */
      readonly kind: "add-player-counters";
      readonly counter: PlayerCounterKind;
      readonly amount: EffectAmount;
      /** A scope, or one player named through a target — "its controller
       * gets two poison counters" (`{ controllerOfTarget: 0 }`). */
      readonly who?: PlayerScope | ChosenPlayerRef;
      readonly target?: number;
    }
  | {
      /** A player removes `amount` counters of a kind from themselves (rule
       * 122.8), or every one with `"all"` — the rad counters' own "removes
       * one rad counter from themselves" (rule 728.1), Survivor's Med Kit's
       * "target player loses all rad counters". Never below none. To the
       * effect's controller by default, a `PlayerScope`, or the player in
       * target slot `target`. */
      readonly kind: "remove-player-counters";
      readonly counter: PlayerCounterKind;
      readonly amount: EffectAmount | "all";
      readonly who?: PlayerScope;
      readonly target?: number;
    }
  | {
      /** A player gets `amount` energy counters ({E} — rule 122 / ROADMAP
       * Phase 10). `who` defaults to the effect's controller. An amount:
       * Aetherflux Conduit's "equal to the amount of mana spent to cast that
       * spell" is `manaSpentOf`. */
      readonly kind: "get-energy";
      readonly amount: EffectAmount;
      readonly who?: PlayerScope;
    }
  | {
      /** The effect's controller pays this much energy (rule 107.14): an
       * `unless`'s `payEnergy` option, offered only with that much. Never
       * authored. */
      readonly kind: "pay-energy";
      readonly amount: number;
    }
  | {
      /** The effect's controller gets an emblem (rule 114 — ROADMAP Phase 10).
       * `static` is its static ability, as a permanent's is written, working
       * from the command zone with "you" its owner (rules 113.6p, 114.4): an
       * anthem of any scope in the layer system (Elspeth, Knight-Errant's
       * "Artifacts, creatures, enchantments, and lands you control have
       * indestructible"), and "you have no maximum hand size", a cast or
       * cost rule, a damage replacement, "you can't lose the game", a cast
       * permission from the graveyard, `loyaltyAtInstantSpeed` for every
       * planeswalker its owner controls (Teferi, Temporal Archmage). Only the
       * fields `test/emblem-statics.test.ts` lists are read off an emblem.
       * `moreStatics` are the others, when it has several (Saheeli, Filigree
       * Master's).
       *
       * `triggered` are its triggered abilities (Ob Nixilis Reignited's
       * "Whenever a player draws a card, you lose 2 life"): an emblem
       * object in the command zone, owned and controlled by whoever gets it
       * (rules 114.2, 114.4), whose abilities trigger and resolve as any
       * permanent's do — "you" is its controller, and "this emblem deals 5
       * damage" is damage from it (a colorless source with no types).
       *
       * `to` is a target slot holding the player who gets it — "target
       * opponent gets an emblem with …" (Ob Nixilis Reignited's −8);
       * the effect's controller when absent. */
      readonly kind: "create-emblem";
      readonly text: string;
      readonly static?: StaticAbility;
      readonly moreStatics?: readonly StaticAbility[];
      readonly triggered?: readonly TriggeredAbility[];
      readonly to?: number;
    }
  | {
      /**
       * Epic (rule 702.50a), the last part of the spell's effect: "For the
       * rest of the game, you can't cast spells" and "at the beginning of
       * each of your upkeeps for the rest of the game, copy this spell except
       * for its epic ability. If the spell has any targets, you may choose new
       * targets for the copy." The spell is captured as it resolves — its
       * targets, {X} and choices — and its controller gets an emblem holding
       * the upkeep trigger, so the delayed ability shows on the table. A copy
       * made that way has no epic ability, so this does nothing on it; a copy
       * made otherwise (Twincast) has it, as part of the copied text (rule
       * 707.2), and sets up its own.
       */
      readonly kind: "epic";
    }
  | {
      /** Prevent all combat damage that would be dealt this turn (Fog). A
       * rule-614 replacement, tracked as a turn-scoped `GameState` flag. */
      readonly kind: "prevent-all-combat-damage";
      /** Only the combat damage sources matching this would deal —
       * Arachnogenesis's "prevent all combat damage that would be dealt this
       * turn **by non-Spider creatures**" (`{ type: "creature", notSubtypes:
       * ["Spider"] }`). Asked of each source as its damage would be dealt —
       * prevention isn't locked in ahead of time (rule 615.1), so a creature
       * that becomes a Spider later in the turn isn't stopped — from the
       * effect's controller's side. A rule for the turn
       * (`GameState.combatDamagePreventedBy`). */
      readonly by?: CardFilter;
    }
  | {
      /** "Prevent all damage that would be dealt to you this turn by
       * attacking creatures" (Deep Wood; Scarecrow's "by creatures with
       * flying", Al-abara's Carpet's "by attacking creatures without
       * flying"): combat and noncombat damage to the effect's controller —
       * the player, not their permanents — from sources matching `by`, each
       * asked as its damage would be dealt (rule 615.1), from the
       * controller's side. A rule for the turn, beside Fog's
       * (`GameState.combatDamagePreventedBy`, `toYou`). */
      readonly kind: "prevent-damage-to-you";
      readonly by: CardFilter;
    }
  | {
      /** "Damage can't be prevented this turn" (rule 615.12 — Skullcrack,
       * Flaring Pain): for the rest of the turn, prevention effects prevent
       * no damage (their other effects still happen, shields aren't used
       * up). */
      readonly kind: "damage-cant-be-prevented";
    }
  | DamageRuleSpec
  | {
      /** "Prevent the next `amount` damage that would be dealt to `target`
       * this turn" (Healing Salve — rule 614.9 / ROADMAP Phase 11 EG-6). A
       * one-shot prevention *shield* on `GameState.preventionShields`, consumed
       * in `dealDamage`. `combatOnly` narrows it to combat damage. `amount:
       * "all"` is "prevent all damage that would be dealt to [it] this turn",
       * never used up — Gideon Jura's 0, `target: "source"`. A shield on an
       * object covers only that object (rule 400.7): one that changes zones
       * is a new object without it. */
      readonly kind: "prevent-damage";
      readonly target: EffectTargetRef;
      readonly amount: EffectAmount | "all";
      readonly combatOnly?: boolean;
      /** A redirection instead (rule 614.9): "The next 1 damage that would
       * be dealt to this creature this turn is dealt to target creature you
       * control instead" (Warrior en-Kor) is `{ target: "source", amount: 1,
       * redirectTo: 0 }`; Daughter of Autumn's "… to target white creature
       * … is dealt to this creature instead", `{ target: 0, redirectTo:
       * "source" }`. The damage is dealt to `redirectTo` by the same source
       * (`"you"`: the controller). While `redirectTo` is off the
       * battlefield, no longer a creature, planeswalker or battle, or a
       * player who has left, the shield does nothing (614.9). Not with
       * `"all"`. */
      readonly redirectTo?: EffectTargetRef | "you";
    }
  | {
      /** Damage from a source of your choice (rule 609.7): "The next time a
       * red source of your choice would deal damage to you this turn,
       * prevent that damage" (Circle of Protection: Red) is `{ filter: {
       * colors: ["R"] }, to: "you", amount: "next-time" }`; "Prevent the next
       * 3 damage that would be dealt to any target this turn by a source of
       * your choice" (Healing Grace) is `{ to: 0, amount: 3 }`. As it
       * resolves its controller chooses the source — a permanent or a spell
       * on the stack matching `filter`, from their side (609.7a; a permanent
       * spell's shield covers the permanent it becomes) — with the
       * `choose-permanents` decision, and a one-shot prevention shield for
       * this turn goes on what `to` names (`"you"`, or a target slot).
       * `"next-time"` prevents all of the next damage event from that source
       * to it; a number, that much damage in all. The shield rechecks
       * `filter` when the damage would be dealt, and isn't used up if it
       * prevents nothing (609.7b). `gainLifePrevented` is Reverse Damage's
       * "you gain life equal to the damage prevented this way". Nothing
       * happens with no source to choose. */
      readonly kind: "prevent-damage-from-chosen-source";
      readonly filter?: CardFilter;
      /** Also `"your-side"` — "you and/or permanents you control" (Harm's
       * Way, one shield over them all) — `"your-side-creatures"`, "you and/or
       * creatures you control" (Shadowbane), and `"any"`, any recipient
       * (Reflect Damage's, Pilgrim of Virtue's "would deal damage this
       * turn"). */
      readonly to: "you" | number | "your-side" | "your-side-creatures" | "any";
      /** `"all"`: all the damage that source would deal it this turn, never
       * used up (Kor Chant; Prahv's and Burrenton Forge-Tender's are `to:
       * "any"`, Auriok Replica's `to: "you"`). */
      readonly amount: "next-time" | number | "all";
      /** Only the damage prevented from a source that matches this, as the
       * damage would be dealt, gains life: "If damage from a black source is
       * prevented this way, you gain that much life" (Shadowbane); needs
       * `gainLifePrevented`. */
      readonly gainLifeFrom?: CardFilter;
      readonly gainLifePrevented?: true;
      /** Prevention's additional effect (rule 615.5), with `"x"` what the
       * shield prevented — see `damage-rule`'s `then`. */
      readonly then?: EffectSpec;
      /** A redirection to that source's controller (`"controller"` —
       * Reflect Damage) or itself (`"itself"`), instead of `redirectTo`. */
      readonly redirectToSource?: "itself" | "controller";
      /** A redirection instead (rule 614.9): "The next time a source of your
       * choice would deal damage to target creature this turn, that damage
       * is dealt to this creature instead" (Shaman en-Kor) is `{ to: 0,
       * amount: "next-time", redirectTo: "source" }`; Jade Monolith's "that
       * source deals that damage to you instead", `redirectTo: "you"`. As
       * `prevent-damage`'s `redirectTo`. */
      readonly redirectTo?: EffectTargetRef | "you";
      /** Set by the engine on the copy the choice's answer applies: what the
       * shield protects, with target 0 the source chosen. */
      readonly protect?: TargetRef | "your-side" | "your-side-creatures" | "any";
      /** Set by the engine beside `protect`: where `redirectTo` sends it. */
      readonly redirect?: TargetRef;
      /** Set by the engine beside `protect`: the spell's own targets, which
       * `then` reads (Refraction Trap's "deals that much damage to any
       * target") — the answer's copy has the source chosen as target 0. */
      readonly ownTargets?: readonly (TargetRef | null)[];
    }
  | {
      /** "Target spell or permanent becomes black" (Deathlace — rule 613.1e,
       * layer 5): its colours become `colors`, replacing its others, for
       * `duration` — for good (`"permanent"`) for the Laces, `"end-of-turn"`
       * for Crimson Wisps. A spell keeps it while on the stack; the
       * permanent it becomes is a new object with its own colours (rule
       * 400.7). Mana symbols in its cost don't change. */
      readonly kind: "become-color";
      readonly target: EffectTargetRef;
      readonly colors: readonly Color[];
      readonly duration: PtDuration;
      /** "Becomes blue **in addition to its other colors**" (Indigo
       * Faerie — rule 105.3): `colors` are added to its others instead of
       * replacing them, in timestamp order with the rest of layer 5. */
      readonly inAddition?: true;
    }
  | {
      /**
       * "Change the text of target spell or permanent by replacing all
       * instances of one color word with another" (Sleight of Mind), "one
       * basic land type with another" (Magical Hack), or either (Mind Bend's
       * "one color word with another or one basic land type with another") —
       * a text-changing effect (rule 612, layer 3), for `duration`: for good
       * (`"permanent"`, "this effect lasts indefinitely") or `"end-of-turn"`.
       * As it resolves its controller chooses the word to replace out of
       * `words` (a `choose-value` of `"text-word"`), then a different word
       * of the same kind to put in its place — any word, there or not.
       * `from` and `to` are filled in by those answers; a card leaves them
       * out. What changes is every instance in the object's own text
       * (`text-change.ts`), its type line's land types included; a spell
       * keeps the change as the permanent it becomes (400.7a).
       */
      readonly kind: "change-text";
      readonly target: EffectTargetRef;
      readonly words: "color" | "land-type" | "color-or-land-type";
      readonly duration: PtDuration;
      readonly from?: string;
      readonly to?: string;
    }
  | {
      /** A modal spell/ability (rule 700.2): as it resolves, its controller
       * chooses between `minModes` and `maxModes` of `modes` (usually 1 and 1
       * — "choose one"; 1 and 2 for "choose one or both") and the chosen
       * modes' effects apply in listed order. Raised as a `choose-modes`
       * decision. **Modes must be non-targeted** for now (targeted modal
       * spells need cast-time mode selection — see ROADMAP Phase 1c / 6).
       * A `sequence` step after it waits for the choice. */
      readonly kind: "modal";
      /**
       * A modal **ability** — a triggered ability printed "Choose one —" with
       * bullets (rule 700.2): its modes are chosen as it's put on the stack
       * (rules 603.3c, 700.2b), before its targets, not as it resolves; with
       * none chosen it's removed from the stack. Or an activated one
       * ("{1}, Sacrifice this creature: Choose one —" — Cankerbloom, Umezawa's
       * Jitte): chosen as it's activated (rules 602.2b, 601.2b), each choice
       * offered as an `activate-ability` of its own with those modes' targets
       * (the action's `modes`). Only as the ability's whole effect. Left off, the choice is made as the effect
       * applies, which is right for a choice the text makes on resolution
       * ("create a Food token or a Treasure token", fabricate, "tap or
       * untap").
       */
      readonly announced?: true;
      readonly minModes: number;
      /** At most this many; a live amount is read as the modes are chosen
       * (Riku of Many Paths' "choose up to X, where X is the number of times
       * you chose a mode for that spell" — its trigger value). */
      readonly maxModes: EffectAmount;
      readonly modes: readonly ModeOption[];
      /** "Choose one **that hasn't been chosen this turn**" (Galadriel,
       * Light of Valinor): only the modes this ability of this object hasn't
       * had chosen yet this turn are offered, and nothing happens once every
       * one has been. Counted per ability, like `resolved-this-turn`, so a
       * permanent that leaves and comes back starts again (rule 400.7). */
      readonly notChosenThisTurn?: boolean;
      /** "Choose one **that hasn't been chosen**" (Silent Hallcreeper): the
       * same, but over this object's whole time on the battlefield — "refers
       * only to that specific Silent Hallcreeper", and one that leaves and
       * returns is a new object with no memory of its modes (its ruling,
       * rule 400.7). */
      readonly notChosenBefore?: boolean;
      /** "You **may** choose two" (Shadrix Silverquill): no mode at all is
       * also an answer, removing the ability — but never fewer than
       * `minModes` otherwise (the ruling: zero or two, not one). Only with
       * `announced`. */
      readonly optional?: true;
      /** "Each mode must target a different player" (Shadrix Silverquill):
       * each chosen mode's target slots must name a different target from
       * every earlier chosen mode's — built, as the modes are announced, as
       * an `other` relation on the earlier slots (`triggerTargetSpecs`).
       * Only with `announced`. */
      readonly eachTargetsDifferentPlayer?: true;
      /**
       * "Choose one **at random**" as the effect applies: nobody chooses —
       * one mode is picked with the game's seeded randomness, each equally
       * likely, among the modes whose `onlyIf` holds ("choose a kind of
       * counter at random that this creature doesn't have on it" —
       * Crystalline Giant). With none eligible, nothing happens. Only with
       * `minModes` and `maxModes` 1, and not with `announced`: an ability
       * that picks its mode at random as it goes on the stack, before its
       * targets (Summon: Magus Sisters), isn't built. Announced as a
       * `chosen-at-random` event.
       */
      readonly random?: true;
    }
  | {
      /** Apply `then` if `condition` holds at resolution, otherwise `else`
       * (rule 608.2 — an "if … then … otherwise …" clause). `condition` is
       * evaluated from the effect's source's controller's perspective, reusing
       * the static-ability {@link StaticCondition} union. needed-cards P5b —
       * Scute Swarm ("if you control six or more lands"). */
      readonly kind: "conditional";
      readonly condition: StaticCondition;
      readonly then: EffectSpec;
      readonly else?: EffectSpec;
    }
  | {
      /** "You may [effect]" (rule 601.3e / 608.2). Resolves via the same
       * `choose-modes` decision — one optional mode. Same non-targeted
       * restriction as `modal`. */
      readonly kind: "may";
      readonly effect: EffectSpec;
      /** The yes/no prompt, e.g. "Draw a card?". */
      readonly prompt: string;
      /** The question is about `"that-player"` — asked once per player
       * inside a `for-each-player` (myriad: "for each opponent other than
       * defending player, you may …"). The offer names them (`about`), since
       * the same prompt comes up once for each. */
      readonly aboutThatPlayer?: boolean;
      /**
       * An optional *cost* to say yes — "you may pay {B}. If you do, draw a
       * card" (Nihil Spellbomb, Dawn of Hope, Mentor of the Meek).
       *
       * The choice is only offered when the player could actually pay, so
       * declining for lack of mana and declining by choice both land on
       * `else`. Paid as the choice is answered, not when the effect resolves.
       */
      readonly cost?: string;
      /** With an `{X}` in `cost`: X is paid in mana of this colour — "you
       * may pay **any amount of {R}**" (Leyline Tyrant) is `cost: "{X}"`
       * with `xColor: "R"`, each X one {R}. */
      readonly xColor?: Color;
      /** With an `{X}` in `cost`: "X can't be greater than …" (Shanna,
       * Purifying Blade's "the amount of life you gained this turn"), read
       * as the `may` applies. */
      readonly maxX?: EffectAmount;
      /**
       * `cost` may be paid more than once, in one payment as the `may`
       * applies — "you may pay {1}{G} **any number of times**. When you pay
       * this cost one or more times, put that many +1/+1 counters on this
       * creature" (Intrepid Adversary), and with `maxX`, "you may pay {G}
       * **up to three times**" (Tranquil Frillback). The question is the
       * `choose-modes` decision's, its offer's `xCost` naming the cost in
       * `times`: how many times, from 1, and declining is paying none. Not
       * offered when it can't be paid once. The number of times is the X
       * `effect` reads ("that many"), carried into a `reflexive-trigger`
       * there, which triggers once however many times it was paid (rule
       * 603.12a), as `any-number`'s `max: "x"` or an announced `modal`'s
       * `maxModes: "x"` too. No `{X}` in `cost`.
       */
      readonly costTimes?: true;
      /**
       * Life to pay as part of that cost (with `cost`, or on its own) —
       * Zoraline, Cosmos Caller's "you may pay {W}{B} and 2 life", Tymna the
       * Weaver's "you may pay X life". Read as the `may` applies. Payable only
       * with at least that much life (rule 119.4); paying 0 is always
       * possible. Paying it is losing life.
       */
      readonly costLife?: EffectAmount;
      /** Energy to pay as part of that cost — "you may pay {E}{E}". Read as
       * the `may` applies (so "an amount of {E} equal to its mana value" is an
       * amount); payable only with that much energy. */
      readonly costEnergy?: EffectAmount;
      /**
       * Energy paid in an amount the player chooses (rule 107.14: each {E}
       * one energy counter removed), up to the energy they have (and `maxX`,
       * if any); the amount paid is the X `effect` reads ("that much",
       * "that many", "for each {E} paid this way"):
       *
       * - `"one-or-more"` — "you may pay one or more {E}. If you do, …"
       *   (Territorial Aetherkite, Rampaging Aetherhood): X from 1, not
       *   offered with no energy; declining lands on `else`.
       * - `"any"` — "you may pay any amount of {E}. [It] deals that much
       *   damage …" (Harnessed Lightning, Die Young, Wrath of the Skies): X
       *   from 0 (rule 107.1c), and `effect` happens whatever was paid —
       *   declining is paying 0, so `effect` applies with X = 0 (Wrath of the
       *   Skies still destroys what has mana value 0). Not asked with no
       *   energy at all.
       *
       * The question is the `choose-modes` decision's, its offer's `xCost`
       * marked `energy`; X is that payment alone, never the spell's own X
       * ("you get X {E}, then you may pay any amount of {E}").
       */
      readonly costEnergyX?: "one-or-more" | "any";
      /** "If you do, [effect]" (rule 608.2h) — applied only when `effect` was
       * actually chosen (Ob Nixilis, the Fallen: "you may have target player
       * lose 3 life. If you do, put three +1/+1 counters on Ob Nixilis.").
       * needed-cards P19. */
      readonly then?: EffectSpec;
      /** "If you don't, [effect]" — applied only when `effect` was declined
       * (Springheart Nantuko: "…if you do, create a token copy… If you
       * didn't create a token this way, create a 1/1 Insect instead."; The
       * Gitrog Monster's "sacrifice ~ unless you sacrifice a land" is the
       * same shape with `effect` framed as the *unless* clause). needed-cards
       * P19. */
      readonly else?: EffectSpec;
      /** "You may [effect]. **Do this only once each turn.**" (Pantlaza,
       * Sun-Favored): once this ability of this object has done it this
       * turn, it isn't offered again — `else`, if any, applies instead. A
       * turn when it was declined doesn't count, so a later resolution may
       * still do it. Counted per ability, as `modal`'s `notChosenThisTurn`
       * is: a `may` is a choice of one mode. */
      readonly oncePerTurn?: boolean;
    }
  | {
      /**
       * A "punisher" clause — *someone else* chooses whether to pay, and the
       * effect only happens if they don't. "…deals 5 damage to target
       * opponent **unless that player sacrifices a creature of their
       * choice**" (Demanding Dragon), "…**unless that creature's controller
       * pays {3}**" (Kazuul), "draw a card **unless target opponent
       * sacrifices a creature or pays 3 life**" (Indulgent Tormentor).
       *
       * The decision belongs to `chooser`, not to the effect's controller —
       * which is what makes this its own shape rather than a `may`. Options
       * the chooser can't take aren't offered, so "couldn't" and "wouldn't"
       * both land on `otherwise`.
       */
      readonly kind: "unless";
      /** Who decides: a target-slot index holding a player — or an object,
       * whose controller decides (Spell Pierce's "counter target noncreature
       * spell unless **its controller** pays {2}") — the controller
       * of the permanent whose event fired this trigger (Kazuul's attacker),
       * the player the triggering event names, the effect's own controller
       * (The Gitrog Monster's "sacrifice ~ unless **you** sacrifice a land"),
       * or the player whose turn it is. `"any-player"` is "unless **any
       * player** pays {2}" (the rhystic cards — Rhystic Tutor, Icy Prison):
       * each player still in the game is asked in turn order from the active
       * player (rule 101.4), the next only once the one before declines, and
       * `otherwise` happens only if none of them took an option.
       * `{ anyOf }` is the same over a scope: "**any other player** may pay
       * that spell's mana cost" (Ice Cave's `"opponents-of-trigger-controller"`).
       * Any other {@link EffectPlayerRef} is one player named as this applies:
       * "unless **that player** pays 3 life" in a `for-each-player` (Sivriss,
       * Lim-Dûl's Hex), "**the chosen player**" (Energy Vortex). Naming nobody,
       * `otherwise` happens.
       * `{ player }` is the engine's own, naming one of them as it asks in
       * turn — never authored. */
      readonly chooser:
        | number
        | EffectPlayerRef
        | "any-player"
        | { readonly anyOf: PlayerScope }
        | { readonly player: PlayerId };
      /** What they may do to avoid `otherwise`. At most one mana option, since
       * the mana cost rides on the decision itself. */
      readonly options: readonly UnlessOption[];
      /** What happens if they take none of the options. */
      readonly otherwise: EffectSpec;
    }
  | {
      /**
       * "Each player may pay any amount of mana" as this resolves, one player
       * at a time, each knowing what those before them paid: join forces
       * (`startingWithYou` — Minds Aglow, Mana-Charged Dragon), and the same
       * shape without the name (Liege of the Hollows, from the active player:
       * its ruling). Mana is the `choose-modes` decision with an `{X}` cost,
       * as a `may`'s; life is a `choose-number` up to what the player can pay
       * (rule 119.4), paid at once (Plague of Vermin's rulings). Nobody who
       * can pay nothing is asked: the answer could only be 0.
       *
       * Once the last has answered, `then` happens with the total as `"x"`
       * ("each player draws X cards, where X is the total amount of mana paid
       * this way"); and `each`, all at once (Liege's ruling), for every player
       * who paid, about them (`"that-player"`), with what they alone paid as
       * `"x"`. A resolving spell's own X isn't read.
       *
       * `untilNoOnePays`: "Repeat this process until no one pays life" — a
       * whole round in which nobody pays ends it, and one player declining
       * doesn't (Plague of Vermin's ruling).
       */
      readonly kind: "players-pay-any-amount";
      readonly resource: "mana" | "life";
      readonly startingWithYou?: true;
      readonly untilNoOnePays?: true;
      readonly then?: EffectSpec;
      readonly each?: EffectSpec;
      /** Set only by the engine on the copy each answer resumes. `paying`:
       * the player whose payment arrives as `"x"`. */
      readonly progress?: {
        readonly toAsk: readonly PlayerId[];
        readonly paid: readonly { readonly player: PlayerId; readonly amount: number }[];
        readonly anyPaid: boolean;
        readonly paying?: PlayerId;
      };
    }
  | {
      /**
       * "Each player may bid life": the effect's controller opens at `opening`
       * — a number, or `"any"` for "a bid of any number" (Pain's Reward, asked
       * as a `choose-number`) — then in turn order each other bidder may top
       * the high bid, until it comes back round to the high bidder ("The
       * bidding ends if the high bid stands" — "until all players except the
       * one with the current high bid have declined to top that bid", the
       * ruling). A bid isn't a payment: nothing is lost until the end, and a
       * player may bid more life than they have (the rulings), so no answer
       * has an upper bound. Each top is a yes or no, then how much.
       *
       * `who` is who bids: everyone still in the game, or "you and target
       * spell's controller" (Mages' Contest: `{ youAndControllerOfTarget: 0 }`,
       * just you if that's you).
       *
       * Once it ends, `then` happens with the high bidder as `"that-player"`
       * and the high bid as `"x"`: "the high bidder loses life equal to the
       * high bid" is a `lose-life` of `who: "that-player"` in it. `ifYouWin`
       * follows, the same way, if that's the effect's controller ("if you win
       * the bidding").
       */
      readonly kind: "bid-life";
      readonly who: "each-player" | { readonly youAndControllerOfTarget: number };
      readonly opening: number | "any";
      readonly then?: EffectSpec;
      readonly ifYouWin?: EffectSpec;
      /** Set only by the engine on the copy each answer resumes. `at`: the
       * last bidder asked, an index in `bidders`. `topping`: they've said yes,
       * and how much is next. `bidding`: their bid arrives as `"x"`. */
      readonly progress?: {
        readonly bidders: readonly PlayerId[];
        readonly high: number;
        readonly highBidder: PlayerId;
        readonly at: number;
        readonly topping?: PlayerId;
        readonly bidding?: PlayerId;
      };
    }
  | {
      /**
       * "Each player may …", "each opponent may …", "its controller may …",
       * "the player whose turn it is may …" — a choice that belongs to
       * players other than the effect's controller, or to several of them.
       * Each player in `who` is asked in turn, from the active player (rule
       * 101.4), with a `choose-modes` decision of their own — each question
       * waits for the answer before it, and what one player does is done
       * before the next is asked. What they may do is `effect` (asked with
       * `prompt`: Kwain, Itinerant Meddler's "each player may draw a card",
       * Wernog's "each opponent may investigate") or one of `options`, each
       * offered only to a player who can take it (Kynaios and Tiro's "put a
       * land card from their hand onto the battlefield"; "sacrifice a
       * nonland permanent or discard a card"). Either way it is **that
       * player's** effect: "you" in it is them.
       *
       * Once everyone has answered, `ifDid` / `ifDidnt` apply once for each
       * player who did / didn't, in turn order, as the **effect's
       * controller's** effect, with the `"that-player"` scope naming the
       * player it's about: Kwain's "each player who drew a card this way
       * gains 1 life" (`ifDid: { kind: "gain-life", amount: 1, who:
       * "that-player" }`), Wernog's "each opponent who doesn't loses 1 life.
       * You investigate for each opponent who investigated this way"
       * (`ifDidnt` a `lose-life` of `"that-player"`, `ifDid` an investigate),
       * a punisher asked of each opponent ("each opponent loses 3 life
       * unless that player sacrifices a nonland permanent or discards a
       * card" — `options`, and the life in `ifDidnt`). `resultsFor` narrows
       * the follow-ups to players in a scope: Kynaios and Tiro's "then each
       * **opponent** who didn't draws a card" is `who: "each-player"`,
       * `resultsFor: "each-opponent"`. A player never asked (nothing they
       * could take) didn't.
       */
      readonly kind: "each-player-may";
      /** A scope, or `{ controllerOfTarget }` — "**that permanent's
       * controller** may sacrifice a land" (Chain of Vapor): whoever
       * controls what the target slot points at, as it last existed if it
       * has left (rule 608.2h) — or `{ ownerOfTarget }`, whoever owns it
       * (a `put-on-library`'s "its owner puts it on their choice of …"). */
      readonly who:
        | PlayerScope
        | { readonly controllerOfTarget: number }
        | { readonly ownerOfTarget: number };
      readonly prompt?: string;
      readonly effect?: EffectSpec;
      readonly options?: readonly BoundUnlessOption[];
      /**
       * Instead of a "may": a choice each of them **must** make between
       * these — "each opponent faces a villainous choice — [one], or
       * [other]" (rule 701.56). Unlike `effect` and `options`, the chosen one
       * is the **effect's controller's** effect, with `"that-player"` naming
       * the player who chose ("you draw a card" is the villain's; "that
       * player discards a card" the chooser's). `ifDid` / `ifDidnt` don't
       * apply — everyone chooses.
       */
      readonly choices?: readonly ModeOption[];
      /** Ask them in turn order **starting with the effect's controller**
       * rather than the active player. (A vote — "starting with you, each
       * player votes …" — is the `vote` effect.) */
      readonly startingWithYou?: boolean;
      readonly ifDid?: EffectSpec;
      readonly ifDidnt?: EffectSpec;
      readonly resultsFor?: PlayerScope;
      /** Set by the engine on the copy it parks between questions. */
      readonly progress?: EachPlayerMayProgress;
    }
  | {
      /**
       * Ward's own effect (rule 702.21a): "counter that spell or ability
       * unless that player pays [cost]". Only meaningful as the effect of a
       * `becomes-target` trigger (the `ward` card helper builds the whole
       * ability), which records the spell or ability that did the targeting
       * and who controls it (`GameObject.targetedBy`). That player chooses
       * whether to pay, as a `choose-modes` decision; declining, or being
       * unable to pay, counters it. A spell that can't be countered resolves
       * anyway. Does nothing once that spell or ability has left the stack.
       */
      readonly kind: "ward";
      readonly cost: WardCost;
    }
  | {
      /**
       * "Each player chooses six lands they control, then sacrifices the
       * rest" (Planetary Annihilation) — the inverse of `sacrifice`, which
       * names how many to *give up* rather than how many to keep. Each
       * player in `who` chooses in turn from the active player, knowing the
       * choices before theirs, then every one not chosen is sacrificed at
       * once. Exactly `keep` (all of them with no more than that, unasked);
       * `upTo` is "chooses **up to** two creatures" (Archfiend of Depravity),
       * where fewer may be kept, so it's always asked. `keep` is read as the
       * effect applies, `who` one player named through a target when that's
       * who it is: Choice of Damnations' "that player sacrifices all but that
       * many permanents of their choice" (`{ votedNumber: 0 }`).
       */
      readonly kind: "sacrifice-all-but";
      readonly who: PlayerScope | ChosenPlayerRef;
      readonly keep: EffectAmount;
      readonly filter: CardFilter;
      readonly upTo?: boolean;
      /** Set only by the engine: the players still to choose, and what those
       * before them kept. */
      readonly progress?: { readonly toAsk: readonly PlayerId[]; readonly kept: readonly ObjectId[] };
    }
  | {
      /**
       * "Each player chooses any number of creatures they control with total
       * power 4 or less, then sacrifices all other creatures they control"
       * (Slaughter the Strong): each player in `who`, in turn order from the
       * active player and knowing the choices before theirs, chooses any of
       * their permanents matching `filter` whose total power is at most
       * `maxTotalPower` (a negative power subtracting — the ruling); then
       * every one not chosen is sacrificed at once (one event, rule 603.10a).
       */
      readonly kind: "keep-total-power";
      readonly who: PlayerScope;
      readonly filter: CardFilter;
      readonly maxTotalPower: number;
      readonly prompt: string;
      /** Set only by the engine: the players still to choose, and what those
       * before them kept. */
      readonly progress?: { readonly toAsk: readonly PlayerId[]; readonly kept: readonly ObjectId[] };
    }
  | {
      /**
       * "Separate [these objects] into two piles" (rule 700.3) — then one
       * player chooses a pile, and each pile has its fate: Fact or Fiction's
       * "An opponent separates those cards into two piles. Put one pile into
       * your hand and the other into your graveyard", Liliana of the Veil's
       * "Separate all permanents target player controls into two piles. That
       * player sacrifices all permanents in the pile of their choice".
       *
       * `separator` puts each object into exactly one pile, either of which
       * may be empty (700.3a, 700.3d); then `chooser` chooses one, knowing
       * what's in it. The objects never leave their zone while they're
       * separated (700.3c) — a revealed card is still in the library until
       * its pile's fate moves it. "An opponent separates" / "an opponent
       * chooses" is a `choose-opponent` around this, naming `"that-player"`.
       */
      readonly kind: "separate-into-piles";
      readonly objects: PileObjects;
      /** Who separates: the effect's controller when absent. */
      readonly separator?: EffectPlayerRef;
      /** Who chooses one of the piles. */
      readonly chooser: EffectPlayerRef;
      /**
       * "Separate them into **a face-down pile and a face-up pile**" (Curator
       * of Destinies, Fortune's Favor): the first pile stays hidden from all
       * but the players who looked at the cards, and the second is revealed
       * to everyone as the piles are made. The chooser picks a face-down
       * pile without seeing it (unless they looked). Only for `libraryTop`.
       */
      readonly faceDown?: true;
      /** What happens to the chosen pile's objects. */
      readonly chosen: PileFate;
      /** What happens to the other pile's — nothing when absent (Liliana's
       * other pile stays). */
      readonly rest?: PileFate;
      /** Set only by the engine, between the separation and the choice. */
      readonly progress?: {
        readonly objects: readonly ObjectId[];
        readonly separator: PlayerId;
        readonly chooser: PlayerId;
        readonly lookers: readonly PlayerId[];
        readonly piles?: readonly (readonly ObjectId[])[];
      };
    }
  | {
      /**
       * A player chooses among the resolving spell's or ability's own targets
       * — "Choose two target creatures controlled by the same player. **Their
       * controller chooses and sacrifices one of them.** Return the other to
       * its owner's hand" (Barrin's Spite), "Choose up to two target creature
       * cards in your graveyard. **An opponent chooses one of them.** Return
       * that card to your hand. Return the other to the battlefield" (Wake to
       * Slaughter). The choice is made as it resolves, among the target
       * objects still legal (rule 608.2b) — not a target itself, so nothing
       * chosen can make it fizzle — and `chosen` is done to the `count`
       * picked, then `rest` to the others, each as one instruction: the fates
       * a `separate-into-piles` pile has (`PileFate`), a zone or `{ effect }`
       * with each object as its target 0. With `count` or fewer still legal,
       * every one of them is chosen, unasked: if only one of Barrin's Spite's
       * creatures is still legal, that one is sacrificed (the rulings).
       *
       * `chooser` is `"their-controller"` for "their controller" / "that
       * player" of targets an earlier relation ties to one controller (a
       * `sameController` slot), read off the first still legal; "an opponent
       * chooses" is a `choose-opponent` around this naming `"that-player"`.
       * Nothing is chosen, and nothing done, when the chooser has left the
       * game.
       */
      readonly kind: "choose-among-targets";
      readonly chooser: EffectPlayerRef | "their-controller";
      readonly count: number;
      /** What happens to the chosen objects — nothing when absent (Deliver
       * Unto Evil's "leave the chosen cards in your graveyard"). */
      readonly chosen?: PileFate;
      /** What happens to the others — nothing when absent (Incriminate). */
      readonly rest?: PileFate;
      /** What the choice is for, as the chooser's prompt. */
      readonly prompt?: string;
      /** Set only by the engine, while the choice is asked. */
      readonly progress?: { readonly objects: readonly ObjectId[] };
    }
  | {
      /**
       * Encore (rule 702.141) — "For each opponent, create a token copy of
       * this card that attacks that opponent this turn if able. They gain
       * haste. Sacrifice them at the beginning of the next end step."
       *
       * One effect because the per-opponent loop, the attack requirement
       * aimed at *that* opponent, and the end-step sacrifice are one
       * instruction — and the copies are of a card in exile (the Encore cost
       * exiled it), which nothing else does.
       */
      readonly kind: "encore";
    }
  | {
      /**
       * Goad (rule 701.15): until the goader's — this effect's controller's —
       * next turn, each creature goaded "attacks each combat if able and
       * attacks a player other than [the goader] if able". Which creatures,
       * exactly one of:
       * - `target` — a slot holding a **creature** ("goad target creature",
       *   Killian, Decisive Mentor's "tap up to one target creature and goad
       *   it"), or a **player**, whose every creature is goaded ("goad each
       *   creature target player controls" — Geode Rager). An empty optional
       *   slot goads nothing.
       * - `who` — every creature each player in a scope controls (Marisi,
       *   Breaker of the Coil's `"trigger-player"`).
       * - `filter` — every creature matching it, from the controller's side,
       *   whoever controls it (Nelly Borca's "goad all suspected creatures";
       *   "goad all creatures your opponents control" is `controlledBy:
       *   "opponent"`).
       *
       * `forGame` is "**it's goaded for the rest of the game**" (Jon Irenicus):
       * a goad that never lapses. Goading a creature it has already goaded
       * adds nothing (701.15d), though a goad for the rest of the game still
       * outlasts one that was until their next turn.
       */
      readonly kind: "goad";
      readonly target?: number;
      readonly who?: PlayerScope;
      readonly filter?: CardFilter;
      readonly forGame?: boolean;
    }
  | {
      /**
       * Suspect a creature (rule 701.60): it becomes **suspected**, and has
       * menace and "This creature can't block" for as long as it is (701.60c)
       * — until it leaves the battlefield or is no longer suspected. One
       * already suspected can't become suspected again, so nothing changes
       * (701.60d). `target` is a slot ("suspect target creature" — Nelly
       * Borca, Impulsive Accuser), `"source"` ("suspect it" on an enters
       * trigger) or `"trigger-object"`.
       */
      readonly kind: "suspect";
      readonly target: EffectTargetRef;
    }
  | {
      /**
       * A permanent is **no longer suspected** (rule 701.60a — Airtight
       * Alibi's "if it's suspected, it's no longer suspected"): `target` (a
       * slot, `"source"` or `"trigger-object"`), or every permanent matching
       * `filter` from the controller's side (Absolving Lammasu's "all
       * suspected creatures are no longer suspected"). Exactly one of the two.
       */
      readonly kind: "unsuspect";
      readonly target?: EffectTargetRef;
      readonly filter?: CardFilter;
    }
  | {
      /**
       * A permanent **becomes saddled** until end of turn (rule 702.171a-b):
       * a saddle ability's own effect (`"source"` — the `saddle()` helper),
       * Guidelight Matrix's "target Mount you control" (a slot), Kolodin,
       * Triumph Caster's "it" (`"trigger-object"`). Only a permanent can
       * (702.171b); one already saddled becomes saddled again (a second
       * activation is allowed — the rulings), firing `becomes-saddled`
       * triggers but not a "for the first time each turn" one.
       */
      readonly kind: "become-saddled";
      readonly target: EffectTargetRef;
    }
  | {
      /**
       * "Until your next turn, creatures your opponents control attack each
       * combat if able **and attack a player other than you if able**"
       * (Kardur, Doomscourge): goad's requirements imposed as a rule of the
       * game rather than goading anything. So it binds every creature
       * matching `filter` (from the controller's side) until the controller's
       * next turn — including one that comes under an opponent's control
       * after this resolved (rule 611.2c) — and none of them is *goaded*: a
       * `goaded` filter doesn't see them. `otherThanYou: false` is the bare
       * "attack each combat if able". See `AttackRequirementRule`.
       *
       * The same requirement, narrowed (rule 508.1d):
       * - `target`: only that creature, as the object it is now (400.7) —
       *   "target creature an opponent controls attacks you this turn if
       *   able" (Alluring Siren);
       * - `controlledByTarget`: only creatures the player in that slot
       *   controls as attackers are declared — "creatures target player
       *   controls attack you if able" (Taunt, Imaginary Threats);
       * - `attacks`: obeyed only by attacking that one — `"you"`, the
       *   `"source"` (Gideon Jura's "attack Gideon Jura"), or the player in
       *   a target slot (Ravener's "attacks target opponent");
       * - `duration`: until your next turn (absent — Kardur), `"this-turn"`,
       *   `"that-players-next-turn"` (during the `controlledByTarget`
       *   player's next turn — Taunt), `"controllers-next-combat"` (the
       *   `target`'s controller's next combat phase — Trench Behemoth),
       *   `"controllers-next-turn"` (their next turn — Gideon,
       *   Battle-Forged).
       *
       * An illegal or missing target leaves nothing to require (608.2b).
       */
      readonly kind: "attack-requirement";
      readonly filter?: CardFilter;
      readonly otherThanYou?: boolean;
      readonly target?: EffectTargetRef;
      readonly controlledByTarget?: number;
      readonly attacks?: "you" | "source" | number;
      readonly duration?: "this-turn" | "that-players-next-turn" | "controllers-next-combat" | "controllers-next-turn";
    }
  | {
      /**
       * "Impulse draw" — exile the top `amount` cards of your library face-up
       * and let yourself play them (Dream Pillager, Tectonic Giant, Theater
       * of Horrors).
       *
       * `duration: "end-of-turn"` is the common shape; `"while-source"` keeps
       * the permission for as long as the permanent that exiled them is on
       * the battlefield. `castOnly` is "you may **cast spells** from among
       * them" (no lands) rather than "you may **play** them".
       */
      readonly kind: "impulse-exile";
      readonly amount: EffectAmount;
      /** See {@link ImpulseDuration}. */
      readonly duration: ImpulseDuration;
      /** Only during a turn the permission's player did this with this
       * source, in this stint of it, whatever has become of it since: "During
       * any turn you attacked with this creature, you may play that card"
       * (`"attacked"` — Goblin Researcher, with `duration: "while-exiled"`);
       * "during any turn you put a lore counter on this Saga"
       * (`"lore-counter"` — Summon: Brynhildr). */
      readonly sourceDid?: "attacked" | "lore-counter";
      /** Whose libraries: the controller's (the default), or each player's in
       * a scope, the top `amount` of each exiled at once — "each player
       * exiles the top card of their library" (Rocco) — or a target slot
       * holding a player (Maralen, Fae Ascendant's "target opponent's
       * library"). The permission is the controller's unless `playedBy`
       * says otherwise, whoever owns the cards: a spell cast from them is
       * its caster's, and so is the permanent it becomes (rule 601.2a,
       * 608.3a). */
      readonly whose?: number | PlayerScope;
      /** Only those of `whose`'s players this holds for, each asked about
       * as `"that-player"` as the effect applies — Ixhel, Scion of Atraxa's
       * "each opponent **who has three or more poison counters** exiles the
       * top card of their library face down" (`{ kind: "player-counters",
       * counter: "poison", who: "that-player", atLeast: 3 }`). The rest
       * exile nothing; those it holds for still exile at once. */
      readonly whoseIf?: StaticCondition;
      /** "Each player may play the card they exiled this way": the
       * permission goes to each card's owner, not to the controller. */
      readonly playedBy?: "owner";
      readonly castOnly?: boolean;
      /** Which of the exiled cards may be played — Narset, Enlightened
       * Master's "noncreature, nonland cards exiled with Narset". */
      readonly filter?: CardFilter;
      /** "…without paying their mana costs": for every card the permission
       * covers, or those matching `filter` (Nahiri, Forged in Fury's
       * Equipment spells); `only` when paying isn't allowed at all (Narset's
       * "you may cast … without paying their mana costs"). */
      readonly free?: { readonly filter?: CardFilter; readonly only?: boolean };
      /** "If you cast a spell this way, pay life equal to its mana value
       * rather than pay its mana cost" (Inside Information): the only way a
       * spell may be cast under this permission, X 0 (rules 118.9b, 107.3b);
       * additional costs are paid on top (the rulings). */
      readonly payLifeManaValue?: true;
      /** Grant the permission to only this many of the exiled cards, chosen
       * by the controller — Tectonic Giant's "exile the top two cards of your
       * library. **Choose one of them.**" The rest stay exiled with no
       * permission. Omit to grant it to all of them. */
      readonly choose?: number;
      /** Gates on *using* the permission (Theater of Horrors), as opposed to
       * `duration`, which is when it lapses for good. */
      readonly yourTurnOnly?: boolean;
      readonly gate?: StaticCondition;
      /** "From among cards exiled with [this permanent]" as a static ability
       * of it: usable only while this source stays on the battlefield as the
       * same object, on top of `duration` (Maralen, Fae Ascendant). With it,
       * a `filter`'s `{ amount }` operand is counted live from the source's
       * side — "mana value less than or equal to the number of Elves and
       * Faeries you control". */
      readonly whileSource?: boolean;
      /** "Once each turn, you may cast a spell … from among" them: one cast
       * a turn across every card this source exiled with the permission. */
      readonly oncePerTurn?: boolean;
      /** "Look at the top card of that player's library, then exile it
       * **face down**" (Edward Kenway): the cards are exiled face down
       * (rule 406.3), and only the controller may look at them. */
      readonly faceDown?: boolean;
      /** "…and mana of any type can be spent to cast that spell" (Gonti,
       * Canny Acquisitor: `"any-type"`) / "…you may spend mana as though it
       * were mana of any color to cast that spell" (Grenzo, Havoc Raiser:
       * `"any-color"`) — only for a spell cast under this permission (rule
       * 118.14). */
      readonly spendAs?: SpendAs;
      /** The cards are also exiled **with this source** (rule 607.2a), for an
       * `allow-cast-linked-exile` of its: Court of Locthwain's "You may play
       * that card … you may cast a spell from among cards exiled with this
       * enchantment". */
      readonly linked?: true;
    }
  | {
      /** Scry `amount` (rule 701.18) — look at the top N, put any number on
       * the bottom, keep the rest on top. `then` (Preordain: draw a card) is
       * applied after. */
      readonly kind: "scry";
      /** How many; a live amount is read as the effect applies (The Scarab
       * God's "you scry X, where X is the number of Zombies you control"). */
      readonly amount: EffectAmount;
      readonly then?: EffectSpec;
    }
  | {
      /**
       * Reveal the top card of your library to every player (rule 701.16),
       * then apply `then` with **that card as target 0** — the same way
       * `look-and-choose`'s `then` sees the cards it chose. Thrasios, Triton
       * Hero: "reveal the top card of your library. If it's a land card, put
       * it onto the battlefield tapped. Otherwise, draw a card" is a
       * `conditional` on `{ kind: "target", index: 0, filter: { type: "land" } }`
       * inside `then`.
       *
       * The card stays where it is; only `then` moves it. With an empty
       * library nothing is revealed and `then` runs with no target, so a
       * target condition reads false and an "otherwise, draw" draws (and
       * fails) as the card says.
       *
       * `of: { ownerOfTarget }` reveals the top of **another** library: that
       * of the owner of the object in a target slot (Chaos Warp's "the owner
       * of target permanent … reveals the top card of their library"). The
       * owner never changes (rules 108.3, 111.2), so it is still known once the
       * object has moved or a token has ceased to exist. That player is the
       * one who reveals, and a `put-onto-battlefield` in `then` puts the
       * card onto the battlefield under its owner's control — them.
       */
      readonly kind: "reveal-top";
      readonly then: EffectSpec;
      readonly of?: { readonly ownerOfTarget: number };
      /**
       * **Each player in this scope** reveals the top card of their library
       * (rule 701.20a), all of them before `then`, which runs once with no
       * targets and reads the cards through the `{ thisWay: "revealed" }`
       * amount — parley's "each player reveals the top card of their
       * library. For each nonland card revealed this way, …": `then` is a
       * `sequence` of that effect (its amount `{ thisWay: "revealed", filter:
       * { notTypes: ["land"] } }`) and `{ kind: "draw", amount: 1, who:
       * "each-player" }`. A player with an empty library reveals nothing.
       */
      readonly who?: PlayerScope;
    }
  | {
      /**
       * "The owner of target permanent **shuffles it into their library**"
       * (Chaos Warp): the permanent is put into its owner's library and that
       * library is shuffled (rule 701.24a). A token goes too and ceases to
       * exist there (rule 111.7), and the library is still shuffled (Chaos
       * Warp's ruling); so is it when a replacement sends the permanent
       * somewhere else (a commander to the command zone, rule 903.9b). Does
       * nothing to an object that isn't on the battlefield any more.
       */
      readonly kind: "shuffle-into-library";
      readonly target: EffectTargetRef;
    }
  | {
      /**
       * "Target player **shuffles their graveyard into their library**"
       * (Reminisce), or a scope — Survive's "each player …", Feldon's Cane's
       * "shuffle your graveyard into your library": every card in that
       * player's graveyard goes into their library, one move, and the library
       * is shuffled (rule 701.24a) — even with an empty graveyard (Survive's
       * ruling). "Each player" moves every graveyard at once.
       */
      readonly kind: "shuffle-graveyard-into-library";
      readonly target: number | PlayerScope;
      /** Which of the player's zones go in, all in one move (default
       * `["graveyard"]`): Timetwister's "shuffles their hand and graveyard
       * into their library" is `["hand", "graveyard"]`, Winds of Change's
       * "the cards from their hand" `["hand"]`, and Sway of the Stars' "all
       * permanents they own" adds `"permanents"` — every permanent on the
       * battlefield the player owns, whoever controls it (a token ceases to
       * exist in the library, rule 111.7; a phased-out one isn't there,
       * 702.26b). */
      readonly zones?: readonly ("hand" | "graveyard" | "permanents")[];
      /** Only the graveyard's cards matching this — "shuffle all **creature
       * cards** from your graveyard into your library" (Barishi, Rooting
       * Kavu), "all **nonland** cards" (Elixir), Repopulate's "all creature
       * cards from target player's graveyard into that player's library" —
       * read from the effect's controller's side; the library is shuffled
       * whether any matched or not. With `zones` of the graveyard only. */
      readonly filter?: CardFilter;
      /** "…then draws that many cards" (Winds of Change, The Great
       * Aurora): once every library is shuffled, each player draws as many
       * cards as they put into their library this way — a token counting
       * (The Great Aurora's ruling), each player in turn order. */
      readonly drawThatMany?: true;
    }
  | {
      /** Surveil `amount` (rule 701.43) — look at the top N, put any number
       * into the graveyard, keep the rest on top. `then` applied after. */
      readonly kind: "surveil";
      /** How many; a live amount is read as the effect applies. */
      readonly amount: EffectAmount;
      readonly then?: EffectSpec;
    }
  | {
      /** Search the controller's library for up to `max` (at least `min`)
       * cards matching `filter`, move them to `destination`, then shuffle.
       * Raised as a `choose-from-zone` decision listing only the matching
       * cards. `min` is 0 for a search with a stated quality ("a creature
       * card"), which may fail to find (rule 701.23b), and the count for one
       * that is simply for a quantity ("a card": Demonic Tutor's `min: 1`),
       * which must find that many while the library has them (701.23d) — the
       * search clamps `min` to what's there. A "you may search" is a `may`
       * around the search, so declining doesn't search or shuffle at all. */
      readonly kind: "search-library";
      /** The engine's own: the cards this search lets its player cast
       * (`castWhileSearchingLibrary`) have been offered. Not for card
       * definitions. */
      readonly castsWhileSearchingAsked?: true;
      readonly filter: CardFilter;
      /** `"library-top"` is the tutor-to-top family (Vampiric Tutor, Mystical
       * Tutor): the find never leaves the library, it is just moved to the top
       * *after* the shuffle the search itself causes (rule 701.24b — the
       * shuffle comes first, or the card wouldn't stay on top).
       *
       * `"exile"` / `"exile-face-down"`: "search target opponent's library for
       * a card and exile it [face down]" (Extract, Praetor's Grasp) — face
       * down (rule 406.3), only the searcher may look at it. `"stay"`: the
       * find doesn't move; `then` does something with it where it is —
       * Knowledge Exploitation's "you may cast that card without paying its
       * mana cost", cast from the library (its ruling). */
      readonly destination: "hand" | "battlefield" | "library-top" | "graveyard" | "exile" | "exile-face-down" | "stay";
      /** An amount: "search your library for **X** cards" (Insidious Dreams)
       * must find X while there are X (rule 701.23d — no quality named). */
      readonly min: EffectAmount;
      /** An `EffectAmount` so a tutor can find "up to X" where X is a live
       * count — Harvest Season's "up to X basic land cards, where X is the
       * number of tapped creatures you control". */
      readonly max: EffectAmount;
      /** Put battlefield-bound cards in tapped (Rampant Growth). */
      readonly enterTapped?: boolean;
      /** "…, **reveal it**, …" (Enlightened Tutor, Kodama's Reach): show the
       * find to every player (rule 701.16). Off by default — a plain "search
       * your library for a card" (Vampiric Tutor) reveals nothing. */
      readonly reveal?: boolean;
      /** Where chosen cards after the first go, for a tutor that splits its
       * finds (Cultivate: "put one onto the battlefield tapped and the other
       * into your hand"). Omit when every find goes to `destination`. */
      readonly restDestination?: "hand" | "battlefield";
      /**
       * Whose library is searched — the effect's controller by default, or
       * the controller of a target slot, for a search they must make. A
       * search they **may** make ("its controller may search their library
       * for a basic land card" — Path to Exile) is theirs to decline: an
       * `each-player-may` of `who: { controllerOfTarget }` around a search
       * with no `who`, since `min: 0` alone still searches and shuffles.
       * `"that-player"`: the player an `each-player-may`'s `ifDid` is about,
       * the effect's controller still "you" — Rootweaver Druid's "each
       * opponent may search … under your control" (with `instead`'s
       * `under: "you"`).
       */
      readonly who?: { readonly controllerOfTarget: number } | "that-player";
      /**
       * Which zones are searched: the library (the default), the graveyard,
       * the hand, or any of them together — "search your library **and/or
       * graveyard**" (Finale of Devastation) is a resolution-time `modal` over
       * the three, so the player says which, and "your graveyard, hand,
       * **and/or** library" (Boonweaver Giant) the same over all seven: the
       * `searchZonesAndOr` helper writes it. "Your graveyard, hand, **and**
       * library" (Kassandra) is just `"graveyard-hand-library"`. Only a search
       * that includes the library shuffles it ("if you search your library
       * this way, shuffle"). A graveyard is public, so a matching card there
       * can't be missed: failing to find is allowed only in a hidden zone
       * (rule 701.23b) — unless the card says `upTo`.
       */
      readonly zones?: SearchZones;
      /**
       * The count is printed "**up to** N": finding fewer, none included, is
       * the card's own choice, so it holds in a public zone too. "Search your
       * library and/or graveyard for up to five Doctor cards" (The Five
       * Doctors), with the graveyard alone chosen, may find none of the Doctors
       * there. Without it `min: 0` is only 701.23b's leave to miss in a hidden
       * zone, so "a card" still must be found in a graveyard searched alone.
       */
      readonly upTo?: true;
      /**
       * "Search your library and graveyard for five cards **and exile the
       * rest**" (Doomsday): every card searched and not found is exiled face
       * up in the move that takes the finds, and the library isn't shuffled —
       * the card says nothing of shuffling, and the rest of it is gone.
       */
      readonly exileRest?: true;
      /**
       * With `destination: "library-top"`, "put the chosen cards on top of
       * your library **in any order**" (Doomsday): the order is asked once
       * they're there, as a `choose-from-zone` of `order`. Without it a
       * multi-card find lands in the order it was picked.
       */
      readonly inAnyOrder?: true;
      /**
       * Outside the game too (rule 701.23j: "may choose an appropriate card
       * they own from outside the game") — the cards in the searcher's
       * sideboard (400.11a, `DeckList.sideboard`; none in a Commander game,
       * 903.5e). `"only"` searches nothing else: the wishes' "you may reveal a
       * sorcery card you own from outside the game and put it into your
       * hand" (Burning Wish) — `min: 0`, `reveal` when the card says so, and
       * the library isn't shuffled. `true` adds it to `zones`: "search your
       * library, graveyard, **and/or outside the game**" (Invasion of
       * Arcavios). Outside the game is hidden, so a search may fail to find
       * there (701.23b); the cards not taken stay outside.
       */
      readonly outside?: true | "only";
      /**
       * "…or choose **a face-up** [artifact] **card you own in exile**"
       * (Karn, the Great Creator; Coax from the Blind Eternities): the
       * searcher's own face-up exiled cards matching `filter` are among the
       * choices as well.
       */
      readonly faceUpExile?: true;
      /**
       * Whose zones are searched, when they aren't the searcher's own —
       * "search **target opponent's** library" (`{ target: 0 }`), "**its
       * controller's** graveyard, hand, and library" (`{ controllerOfTarget }`
       * — the extract family: Splinter, Counterbore), "**its owner's**"
       * (`{ ownerOfTarget }` — Surgical Extraction), "**that player's**"
       * (`"trigger-player"` — Rootwater Thief). The searcher is still `who`'s
       * (the controller by default); the cards stay theirs, so a find put
       * into a graveyard or a hand goes to its owner's, and one put onto the
       * battlefield enters under the **searcher's** control ("put that card
       * onto the battlefield under your control" — Bribery). That player
       * shuffles their library (rule 701.24a — "then that player shuffles").
       * Naming nobody (an illegal slot, a player who has left), nothing is
       * searched. With `zones: "graveyard-hand-library"` their hand is
       * searched too: a hidden zone, so the searcher sees it while searching.
       */
      readonly whose?: EffectPlayerRef;
      /**
       * "Search … for **all** cards with that name" (Cranial Extraction,
       * Extirpate): every match in a graveyard is found — a public zone, where
       * a card with a stated quality can't be missed — and goes with whatever
       * the searcher picks among the matches in the hidden zones (hand,
       * library), which they may leave (rule 701.23b; Counterbore's ruling).
       * `max` is ignored. "**Any number of** cards with that name" (Memoricide)
       * is no `all`, with `min: 0` and a large `max`: the graveyard's may be
       * left too (Surgical Extraction's ruling).
       */
      readonly all?: true;
      /** "You may play that card for as long as it remains exiled" (Praetor's
       * Grasp): with an exile destination, the searcher may play the finds
       * (rule 305.1 for a land) while they stay in exile. */
      readonly playable?: "while-exiled";
      /** With an exile destination, the finds are exiled **with this
       * source** (rule 607.2a — `GameObject.exiledWith`), as `exile`'s
       * `linked`: Skyship Weatherlight's "search your library for any number
       * of artifact and/or creature cards, exile them", which its "a card at
       * random that was exiled with Skyship Weatherlight" reads. Nothing is
       * linked when the source isn't a permanent. */
      readonly linked?: true;
      /** Applied once the finds have moved and the library is shuffled, with
       * **the finds as its targets** — `target: 0` is the first, as
       * `look-and-choose`'s `then` sees its chosen cards; `"that-player"` is
       * the player whose zones were searched (`whose`). Seek's "you gain life
       * equal to its mana value"; the extract family's "that player shuffles,
       * then draws a card for each card exiled from their hand this way"
       * (the `"exiled-from-hand"` this-way kind). Not applied when nothing
       * was found. */
      readonly then?: EffectSpec;
      /** A rule over the finds as a set, which `filter` (one card at a
       * time) can't express — Myriad Landscape's "that share a land type",
       * Krosan Verge's "a Forest card and a Plains card". The search offers
       * every card `filter` admits and accepts only a set that obeys this. */
      readonly together?: SearchTogether;
      /** With `destination: "battlefield"`: the find enters attached to the
       * ability's own permanent — Light-Paws, Emperor's Voice's "put that
       * card onto the battlefield attached to Light-Paws". One that can't be
       * attached to it for any reason (not an Aura that can enchant it, or
       * it has left — rule 400.7) stays in the library (the ruling). */
      readonly attachedToSource?: boolean;
      /** Each find sent to a destination of its own — by a condition on the
       * card or the game, by the searcher's choice, or a split with the rest
       * going elsewhere or to another controller. See {@link SearchInstead}. */
      readonly instead?: SearchInstead;
      /** Battlefield-bound finds enter **with these counters** on them (rule
       * 122.6): Neoform's "with an additional +1/+1 counter on it", Vision
       * Quest's "X additional +1/+1 counters" (a live amount), Magmatic
       * Hellkite's "tapped with a stun counter on it". */
      readonly withCounters?: { readonly kind: string; readonly amount: EffectAmount };
      /** With `destination: "battlefield"`: the find enters attached to what
       * this names — see {@link AttachHostRef}: Arachnus Spinner's "put it
       * onto the battlefield attached to target creature", Bitterheart
       * Witch's "a Curse card … attached to target player". An Aura that
       * can't be attached there stays where it was found (rule 303.4i); an
       * Equipment enters unattached (301.5e). */
      readonly attachedTo?: AttachHostRef;
    }
  | {
      /** Reveal `count` cards from the top of the controller's library (or
       * their whole graveyard — already public, so `count` is ignored) and
       * await a bounded choice of which to move to `destination`. The spell
       * or ability itself still resolves and leaves the stack immediately,
       * same as any other effect — this just leaves the game waiting on the
       * controller's own `choose-from-zone` action before granting anyone
       * priority again. */
      readonly kind: "look-and-choose";
      /** Whose zone, who looks and who chooses: `"that-player"` is the
       * player a `for-each-player` is about — "each player looks at the top
       * five cards of **their** library and may reveal …" (Explore the
       * Vastlands); the cards they take are theirs. Default: the effect's
       * controller. */
      readonly player?: "that-player";
      /** Someone else makes the choice from that zone: `"that-player"` is
       * the opponent a `choose-opponent` chose — Tasigur, the Golden Fang's
       * "return a nonland card **of an opponent's choice** from your
       * graveyard to your hand" — or a library, which they look at:
       * Tahngarth's Glare's "**that player** looks at the top three cards of
       * **your** library, then puts them back in any order" (inside a
       * `for-each-player` of the target), the cards seen only by them and
       * staying yours. `"an-opponent"` is "reveal the cards in your library.
       * **An opponent** chooses from among them …" (Guided Passage): which
       * opponent is the effect's controller's choice once the cards are
       * revealed (Plargg and Nassari's ruling), asked only among two or
       * more. */
      readonly chooser?: "that-player" | "an-opponent";
      /** Chosen cards bound for the battlefield enter under the **effect's
       * controller's** control, whoever's zone or choice it was: Scrounge's
       * "target opponent chooses an artifact card in their graveyard. Put that
       * card onto the battlefield **under your control**". `"owners"`: under
       * their owners', as a "return" is (610.3c), where `zone:
       * "exiled-with-source"` is otherwise a "put", the chooser's (110.2a) —
       * Purgatory's "return a card exiled with this enchantment to the
       * battlefield". */
      readonly under?: "you" | "owners";
      /** Another player's library, the effect's controller still looking
       * and choosing: "look at the top three cards of **target player's**
       * library" (Architects of Will: `{ target: 0 }`), "**that player**
       * reveals the top two cards of their library. You choose one…"
       * (Balshan Beguiler: `"that-player"`). The chosen cards go to that
       * player's zones — "into their graveyard" is `"graveyard"`, "back on
       * top" `"library-top"` — and `reveal` shows them as theirs. Or that
       * player's graveyard — Grime Gorger's "exile up to one card of each card
       * type from **defending player's** graveyard" (`"trigger-player"`).
       * Nothing at all with that player gone or the slot illegal. */
      readonly from?: EffectPlayerRef;
      /** `"hand"` is the "you may put a land card **from your hand** onto the
       * battlefield" family (Growth Spiral, Ghalta) — nothing is revealed
       * there, the chooser is looking at their own hand, and `leftover` is
       * always `"stay"` because the cards not chosen simply stay in it.
       * `"graveyards"` is every player's graveyard (all public), in turn
       * order: a card from another player's that goes to the battlefield goes
       * under the chooser's control — Necromantic Selection's "return a
       * creature card put into a graveyard this way to the battlefield under
       * your control". `"command"` is the chooser's own commanders in the
       * command zone — Command Beacon's "put your commander into your hand
       * from the command zone" (one of their choice with two — its ruling),
       * Hellkite Courser's "you may put a commander you own from the command
       * zone onto the battlefield". `"graveyard"` with a `thisWay: "milled"`
       * filter ("from among the milled cards") also offers the milled cards
       * a replacement exiled instead (Rest in Peace): a milled card is found
       * in whatever public zone it went to (rule 701.17c).
       *
       * `"targets"` is the resolving spell's or ability's own target cards
       * still legal (a graveyard's, all public): which of them the effect
       * does it to is chosen as it resolves, and they all go at once —
       * Sepulchral Primordial's "for each opponent, you may put up to one
       * target creature card from that player's graveyard onto the
       * battlefield under your control" (they enter simultaneously, its
       * ruling). Ones from another player's graveyard enter under the
       * chooser's control, as `"graveyards"`' do.
       * `"exile"` is the exile zone, every player's cards in it — or, with
       * `from`, only the cards that player owns (rule 108.3): the processors'
       * "put a card an opponent owns from exile into that player's
       * graveyard" (`filter: { ownedBy: "opponent" }`, `destination:
       * "graveyard"` — each card to its owner's), Oblivion Sower's "put any
       * number of land cards that player owns from exile onto the
       * battlefield under your control" (`from: { target: 0 }`; under the
       * chooser's control, as `"graveyards"`' are). Only the cards that may
       * be chosen are shown. A face-down card there has no characteristics
       * (rule 406.3a), so it's choosable only when `filter` asks nothing
       * but its owner, and then by its group, at random (the
       * `choose-from-zone` decision's `faceDownGroups`).
       * `"exiled-with-source"` is only the cards in exile linked to this
       * effect's source (rule 607.2a — `GameObject.exiledWith`), in the
       * stint the resolving ability refers to — "put a creature card exiled
       * with ~ onto the battlefield under your control" (Nautiloid Ship,
       * Yggdrasil, Rebirth Engine: `filter: { type: "creature" }`,
       * `destination: "battlefield"`), its riders the usual ones:
       * `withCounters` (Chaos Shrine's Black Crystal's finality counter),
       * `enterTapped`, `enterAs` (Ashiok's "is a Nightmare in addition to
       * its other types"), `attacking`, `then` (Yggdrasil's "it gains haste
       * until end of turn"). Under the chooser's control (rule 110.2a), as
       * `"exile"`'s are. */
      readonly zone: "library" | "graveyard" | "hand" | "graveyards" | "command" | "targets" | "exile" | "exiled-with-source";
      /** All of `min` or nothing: with fewer than `min` cards that may be
       * chosen, nothing is asked and nothing moves — a cost can't be paid in
       * part (rule 118.3), so "you may put **two** cards your opponents own
       * from exile into their owners' graveyards. If you do, …" (Ulamog's
       * Nullifier) with only one there puts none. */
      readonly needsMin?: true;
      /** How deep into a library to look. An amount, so it can be read at
       * resolution: Gishath, Sun's Avatar's "reveal **that many** cards" is
       * `{ triggerValue: true }`, the combat damage it dealt. */
      readonly count?: EffectAmount;
      /** The looked-at library cards are **revealed** to every player (rule
       * 701.16), not just seen by the chooser: Gishath's "reveal that many
       * cards". `"chosen"` reveals only the cards taken, as they're taken —
       * "look at the top five cards … You may **reveal** a historic card from
       * among them and put it into your hand" (Monumental Henge, Adaptive
       * Omnitool): the rest are seen by the chooser alone. */
      readonly reveal?: boolean | "chosen";
      /** At least this many; a live amount is read as the effect applies —
       * Teferi's Puzzle Box's "puts **the cards in their hand**" is every
       * one, `{ cardsInHand: "that-player" }`. */
      readonly min: EffectAmount;
      /** At most this many; a live amount is read as the effect applies. */
      readonly max: EffectAmount;
      /** `"library-top"` with `zone: "hand"` is Brainstorm's "put two cards
       * from your hand on top of your library" — the chosen cards go back on
       * the deck rather than anywhere visible. Either way the chosen cards
       * go on top in the order they're picked, the first on top: Ponder's
       * "put them back in any order" is every looked-at card taken.
       *
       * `"library-bottom"` puts the chosen cards on the bottom, in the order
       * picked — the first highest, the last on the very bottom: Valakut
       * Awakening's "put any number of cards from your hand on the bottom of
       * your library" (rule 401.4: the owner arranges cards put into a
       * library together, and doesn't reveal the order). Moved from a hand,
       * they're `"put-on-bottom"` this way.
       *
       * `"exile-face-down"` is hideaway's "exile one of them face down"
       * (rule 702.75a): the chosen cards are exiled face down (rule 406.3),
       * linked to this effect's source as "the exiled card" of its other
       * abilities (rule 607.2a — `GameObject.exiledWith`), and only the
       * chooser — and whoever controls that source — may look at them.
       *
       * `"exile"` is the same link, face up — imprint's "you may exile a
       * nonartifact, nonland card from your hand" (Chrome Mox), whose "the
       * exiled card" is every player's to see.
       *
       * `"reveal"` with `zone: "hand"` moves nothing: the chosen cards are
       * revealed to every player (rule 701.20a) and stay in the hand — the
       * Urza's Destiny Scents' "reveal any number of green cards in your
       * hand" (`min: 0`, `max: { cardsInHand: "you" }`, the colour as
       * `filter`), whose "for each card revealed this way" a later effect of
       * the same `sequence` reads as `{ thisWay: "revealed" }`. With nothing
       * in the hand matching, nothing is asked. */
      readonly destination:
        | "battlefield"
        | "hand"
        | "library-top"
        | "library-bottom"
        | "graveyard"
        | "exile-face-down"
        | "exile"
        | "manifest"
        | "reveal"
        /** Nothing moves: the card is only chosen, and `then` acts on it as
         * its target 0 — Lazav, Wearer of Faces' "become a copy of a creature
         * card exiled with it" (`zone: "exiled-with-source"`, `then` a
         * `become-copy` with `of: 0`, `ofCard`). */
        | "stay";
      /** `"exile"` without the link (rule 607.2a): a card exiled by an effect
       * that isn't one of a linked pair — Shadow Kin's "you may exile a
       * creature card from among them", which no "the exiled card" of its
       * (or of a creature it copies) refers to. */
      readonly unlinked?: true;
      /** Chosen cards bound for the battlefield enter **tapped** (Terrain
       * Generator). */
      readonly enterTapped?: boolean;
      /** …and **with these counters** on them (rule 122.6 — Undercity's Throne
       * of the Dead Three: "put a creature card from among them onto the
       * battlefield with three +1/+1 counters on it"), as
       * `put-onto-battlefield`'s `withCounters` are. */
      readonly withCounters?: { readonly kind: string; readonly amount: number };
      /** …and with these types and colours in addition to their own, in
       * place as they enter (as `put-onto-battlefield`'s are — rule 614.12):
       * Necromantic Selection's "It's a black Zombie in addition to its other
       * colors and types". */
      readonly enterAs?: EnterTypes;
      /** …and **attacking** (rule 508.4) — Kaalia of the Vast's "onto the
       * battlefield tapped and attacking that opponent", Winota's. See
       * {@link EnterAttacking}. */
      readonly attacking?: EnterAttacking;
      /** …and **attached to** what this names (see {@link AttachHostRef}) —
       * Academy Researchers' "you may put an Aura card from your hand onto
       * the battlefield attached to this creature". An Aura that can't be
       * attached there stays where it is (rule 303.4i); an Equipment enters
       * unattached (301.5e). */
      readonly attachedTo?: AttachHostRef;
      /** `"hand"` (needed-cards P19 — Genesis Ultimatum: "…and the rest into
       * your hand") puts every non-chosen looked-at card into the chooser's
       * hand, regardless of `filter`; `"graveyard"` ("…put the rest into your
       * graveyard") into their graveyard, in the same move as the chosen
       * ones.
       *
       * `"bottom-any-order"` is "…and the rest on the bottom of your library
       * **in any order**" (Stock Up, Dig Through Time): once the chosen cards
       * have moved, the chooser orders the rest — a second `choose-from-zone`
       * over every one of them, whose picks are the order (see
       * `"library-bottom"` above), asked only when there are two or more
       * cards that aren't all the same card. `"bottom-random"` is "in a
       * random order".
       *
       * `"exile"` is "…and exiles the rest" (Clear the Land: "puts all land
       * cards revealed this way onto the battlefield tapped, and exiles the
       * rest"), face up, linked to nothing, with the chosen ones' move. */
      readonly leftover:
        | "bottom-random"
        | "bottom-any-order"
        | "top-any-order"
        | "stay"
        | "hand"
        | "graveyard"
        | "exile"
        | "exile-playable";
      /** With `destination: "exile"` or `"exile-face-down"`: the effect's
       * controller may play the chosen cards — a land as their land play, a
       * spell at its normal timing — `"end-of-turn"` this turn only
       * (Florian, Voldaren Scion's "exile one of those cards … You may play
       * the exiled card this turn"), `"while-exiled"` for as long as they
       * remain exiled (Black Cat, Cunning Thief). `spendAs` is "mana of any
       * type can be spent to cast spells this way" (rule 118.14). The
       * permission rides on the card (`GameObject.impulse`) and ends with any
       * move. Lightstall Inquisitor's "each opponent exiles a card from their
       * hand and may play that card for as long as it remains exiled. Each
       * spell cast this way costs {1} more to cast. Each land played this way
       * enters tapped" is a `for-each-player`'s look-and-choose with `byOwner`,
       * `tax` and `landsEnterTapped` ({@link ExilePermission}). */
      readonly playable?: ExilePermission;
      /**
       * A leftover destination that depends on how things stand once the
       * chosen cards are where they're going — Nine-Fingers Keene's "you may
       * put a Gate card from among them onto the battlefield. Then if you
       * control nine or more Gates, put the rest into your graveyard.
       * Otherwise, put the rest on the bottom of your library in a random
       * order": when `condition` holds, asked after the chosen cards have
       * moved (a Gate just put onto the battlefield counts), the rest go to
       * `leftover` here; otherwise to the effect's own `leftover`.
       */
      readonly leftoverIf?: LookAndChooseLeftoverIf;
      /**
       * A second choice over the looked-at cards the first left, before
       * `leftover` takes the rest — Choco, Seeker of Paradise's "You may put
       * one of them into your hand. **Then put any number of land cards from
       * among them onto the battlefield tapped** and the rest into your
       * graveyard." The first choice's cards move first; the second's move
       * together with the rest, as one instruction says.
       */
      readonly secondPick?: {
        readonly filter?: ZoneChoiceFilter;
        readonly min: number;
        readonly max: EffectAmount;
        readonly destination: "battlefield" | "hand" | "graveyard" | "library-bottom";
        readonly enterTapped?: boolean;
        /** Only when the first choice took nothing — Planar Genesis's "You
         * may put a land card from among them onto the battlefield tapped.
         * **If you don't**, put a card from among them into your hand." */
        readonly ifNoneChosen?: boolean;
      };
      /** Narrows which revealed candidates can be chosen (e.g. Ureni of the
       * Unwritten: only a Dragon card). Everything is still revealed either
       * way — omit for "any of them". */
      readonly filter?: ZoneChoiceFilter;
      /**
       * What the chosen cards must be *as a set*, as a `search-library`'s
       * `together` is (`zone-choice-together.ts`) — "for each card type, you
       * may put a card of that type from among the revealed cards into your
       * hand" (Atraxa, Grand Unifier: one `oneEach` slot a card type), "you
       * may reveal a Cleric card, a Rogue card, a Warrior card, and/or a
       * Wizard card from among them" (Harper Recruiter). A `oneEach` card
       * may fill any slot it matches, one card a slot — an artifact creature
       * is the artifact card or the creature card (Atraxa's ruling) — and
       * only a card that fits some slot may be chosen; at most one card a
       * slot is taken.
       */
      readonly together?: SearchTogether;
      /** Each chosen card sent where its own kind says, one choice over all
       * of them — see {@link ZoneChoiceSplitCase}. */
      readonly split?: readonly ZoneChoiceSplitCase[];
      /**
       * Applied once the choice is made, with the **chosen cards** as its
       * targets — `target: 0` is the first one taken. Sneak Attack's "that
       * creature gains haste. Sacrifice it at the beginning of the next end
       * step" is the shape: the card put onto the battlefield isn't a target
       * of the spell, so nothing downstream could otherwise refer to it.
       *
       * Skipped entirely when nothing was chosen.
       */
      readonly then?: EffectSpec;
    };

/** The types a `put-onto-battlefield` says the permanent has, in place as it
 * enters (rule 614.12): its card types instead of its own (`setTypes` — the
 * Enduring cycle), and subtypes in addition to its own (`addSubtypes` —
 * Portal to Phyrexia's Phyrexian), with the rest below. Every part is one
 * lasting effect of the resolution on the permanent it becomes (rule
 * 611.2c), in its layer — types 4, colours 5, abilities 6, base P/T 7b
 * (613.1d–f, 613.4b) — and in place from the moment it enters, so "whenever
 * a Zombie / an artifact / a creature enters" sees it arrive as one. */
export interface EnterTypes {
  readonly setTypes?: readonly CardType[];
  /** Card types **in addition to its other types** — The War in Heaven's
   * "They're artifacts in addition to their other types", Relive the Past's
   * "They are 5/5 Elemental creatures in addition to their other types"
   * (`addTypes: ["creature"]` with `basePt` and `addSubtypes`). */
  readonly addTypes?: readonly CardType[];
  readonly addSubtypes?: readonly string[];
  /** Its colours instead of its own (layer 5) — Chainer, Dementia Master's
   * "That creature is black and is a Nightmare in addition to its other
   * creature types": "is black", with no "in addition", sets them. */
  readonly setColors?: readonly Color[];
  /** Its base power and toughness (layer 7b — rule 613.4b): Relive the
   * Past's "5/5", Excava's "It's a 1/1 Spirit creature". Counters and other
   * P/T changes apply over it. */
  readonly basePt?: readonly [number, number];
  /** Keywords it has (layer 6) — Excava's "a 1/1 Spirit creature **with
   * flying**". */
  readonly keywords?: readonly Keyword[];
  /** "**If it's a creature**, it's a Zombie in addition to its other
   * creature types" (Lim-Dûl the Necromancer): every part applies only if
   * the permanent is a creature as it enters — judged on the battlefield
   * with every other effect applying (rule 614.12's "as it would exist on
   * the battlefield"), its face down or transformed face included. Not with
   * `faceDown`. */
  readonly ifCreature?: true;
  /** Colours in addition to its own (Necromantic Selection's "It's a black
   * Zombie in addition to its other colors and types" — a colourless card
   * is then simply black, its ruling). */
  readonly addColors?: readonly Color[];
  /** It enters **face down** (rule 708.3 — turned face down before it
   * enters, so it has no "as this enters" choices and its enters abilities
   * neither trigger nor apply): `true` as a 2/2 with no name, text,
   * subtypes or mana cost (708.2a — Ashcloud Phoenix's "return it to the
   * battlefield face down under your control"), or with the characteristics
   * the effect lists (708.2 — Missy's "face down and tapped. It's a 2/2
   * Cyberman artifact creature", Tezzeret's "They're 5/5 artifact
   * creatures", Yedora's "It's a Forest land"). Neither manifested nor
   * cloaked (the `"effect"` face-down kind): it's turned face up only by its
   * morph or disguise cost (702.37e). Any card may enter so, an instant or
   * sorcery too. */
  readonly faceDown?: true | FaceDownAs;
}

/** What a spell's copy gains — see `copy-spell`'s `gains`. */
export interface SpellCopyGains {
  readonly keywords?: readonly Keyword[];
  /** Triggered abilities it gains — "At the beginning of the end step,
   * sacrifice this token" (a battlefield ability, so it does something only
   * once the copy is a permanent). */
  readonly triggered?: readonly TriggeredAbility[];
  /** "If the copy is a permanent spell, it gains …" (rule 110.4b): a copy of
   * an instant or sorcery gains nothing. */
  readonly ifPermanent?: true;
}

/** How a spell's copy differs from the spell — `copy-spell`'s `except` and
 * `gains`, as `Game` puts the copy on the stack. */
export interface SpellCopyChange {
  readonly except?: CopyExceptions;
  readonly gains?: SpellCopyGains;
}

/**
 * What a copy effect makes different about its copy — "except it's a 3/3
 * black Zombie creature in addition to its other types" (Anikthea, Hand of
 * Erebos), "except its name is Mishra's Warform" (Mishra, Eminent One).
 * Exceptions are part of the copy's copiable values (rule 707.9b): every
 * other effect applies over them, and anything that copies the copy copies
 * them too. `setColors` replaces its colours ("it's black"); `addColors`,
 * `addTypes` and `addSubtypes` are "in addition to its other …";
 * `keywords` are abilities it has ("and it has flying and haste").
 */
export interface CopyExceptions {
  readonly name?: string;
  /** "It's an enchantment and loses all other card types" (Myrkul). */
  readonly setTypes?: readonly CardType[];
  /** Subtypes it has instead of its own — Shelob, Child of Ungoliant's "a
   * Food artifact … and it loses all other card types" loses every other
   * subtype too (its ruling). */
  readonly setSubtypes?: readonly string[];
  readonly addTypes?: readonly CardType[];
  readonly addSubtypes?: readonly string[];
  readonly setColors?: readonly Color[];
  readonly addColors?: readonly Color[];
  readonly basePt?: readonly [number, number];
  /** "…with no mana cost" (eternalize, embalm): its mana value is 0. */
  readonly noManaCost?: boolean;
  readonly keywords?: readonly Keyword[];
  /** Activated abilities it has — "and it has '{2}, {T}, Sacrifice this
   * token: You gain 3 life.'" (Brenard, Ginger Sculptor). */
  readonly activated?: readonly ActivatedAbility[];
  /** Triggered abilities it has — Phantasmal Image's "and it has 'When this
   * creature becomes the target of a spell or ability, sacrifice it.'" (rule
   * 707.9a: a copiable value, so a copy of the copy has it too). */
  readonly triggered?: readonly TriggeredAbility[];
  /** Static abilities it has — Dollhouse of Horrors's "and it has 'This
   * token gets +1/+1 for each Construct you control.'" (rule 707.9a, as
   * `triggered`). */
  readonly static?: readonly StaticAbility[];
  /** "…except it has **this ability**" (Thespian's Stage, Court of Vantress,
   * Irma, Part-Time Mutant): the ability of `card`'s definition at that
   * index of its `activated` or `triggered` list — the very ability making
   * the copy, named by its card rather than by the object, which by then may
   * be a copy of something else that has it only this way. Looked up as the
   * copy is made, and from then on it's like `activated` / `triggered`: a
   * copiable value (rule 707.9a), so a copy of the copy has it too (Court of
   * Vantress's ruling). */
  readonly thisAbility?: {
    readonly card: string;
    readonly activated?: number;
    readonly triggered?: number;
  };
  /** "…and it isn't legendary" (Spark Double, Auton Soldier) — copiable, so
   * a later copy of it isn't either (Spark Double's ruling). Read through
   * `supertypesOf`. */
  readonly notLegendary?: true;
  /** Supertypes it has in addition to its own — Sakashima the Impostor's
   * "it's legendary in addition to its other types". */
  readonly addSupertypes?: readonly Supertype[];
  /** "The 'legend rule' doesn't apply to [these permanents]" as an ability
   * it has — Sakashima of a Thousand Faces' "except it has Sakashima's other
   * abilities", which are that static and partner (a deck-construction
   * ability that does nothing once the game has begun — rule 702.124a). The
   * scope is read from the copy's own side, as the static's `affects` is
   * (see `StaticAbility.legendRuleOff`). */
  readonly legendRuleOff?: AffectSpec;
}

/**
 * What a `separate-into-piles` separates:
 *
 * - `{ libraryTop }`: the top cards of the effect's controller's library —
 *   revealed to everyone with `reveal` (Fact or Fiction's "Reveal the top
 *   five cards"); otherwise looked at only by the separator (Curator of
 *   Destinies' "look at the top five cards", Fortune's Favor's "target
 *   opponent looks at").
 * - `{ permanents, whose }`: every permanent matching `permanents` (read from
 *   the effect controller's side) that `whose` controls — Liliana of the
 *   Veil's "all permanents target player controls". A token stack is
 *   separated token by token.
 * - `{ graveyard }`: every card in the effect's controller's graveyard
 *   matching it — Death or Glory's "all creature cards in your graveyard".
 * - `"targets"`: the resolving spell's own target cards still legal, in a
 *   graveyard (Split the Spoils' "up to five target permanent cards from
 *   your graveyard").
 */
export type PileObjects =
  | { readonly libraryTop: EffectAmount; readonly reveal?: true }
  | { readonly permanents: CardFilter; readonly whose: EffectPlayerRef }
  | { readonly graveyard: CardFilter }
  | "targets";

/**
 * What happens to one pile of a `separate-into-piles`. A zone moves its cards
 * there, together: `"hand"`, `"graveyard"` and `"exile"` are their owners';
 * `"battlefield"` puts them there under the effect's controller's control
 * (Death or Glory's "return the other to the battlefield"). `{ effect }`
 * applies `effect` to each object of the pile as target 0, all as one
 * instruction (one event) — Liliana of the Veil's "sacrifices all permanents
 * in the pile" is `{ effect: { kind: "sacrifice-target", target: 0,
 * byItsController: true } }`.
 */
export type PileFate =
  | "hand"
  | "graveyard"
  | "exile"
  | "battlefield"
  | { readonly effect: EffectSpec };

/**
 * A `PileFate` in one word, for whoever is asked to separate or choose: where
 * the cards go, or `"lose"` for an effect that takes the objects away (a
 * sacrifice, destruction, exile, a bounce) and `"other"` for anything else
 * (Fight or Flight's "only creatures in the chosen pile can attack").
 */
export type PileFateWord = "hand" | "graveyard" | "exile" | "battlefield" | "lose" | "other";

/**
 * A keyword ability given to a card in a graveyard (rule 604.1 — a static's
 * `grantsToGraveyard.keywords`; a one-shot's `grant-graveyard-keyword`), each
 * working exactly as a printed one does: unearth (rule 702.84), encore
 * (702.141) and embalm (702.128) as activated abilities of the card, harmonize
 * (702.180), retrace (702.81) and sneak (702.190) as ways to cast it.
 *
 * `cost` is the keyword's own: a fixed one ("unearth {1}{B}{R}"), or
 * `"mana-cost"`, the default — the card's own mana cost ("the embalm cost is
 * equal to its mana cost"), so a card with none gets nothing — or
 * `"mana-value"`, generic mana equal to its mana value ("encore {X}, where X
 * is its mana value"). Retrace has no cost of its own: it pays the mana cost.
 * A card with the keyword of its own has both, and either may be used.
 */
export interface GraveyardKeywordGrant {
  readonly keyword: GraveyardKeyword;
  readonly cost?: string;
}

/** See {@link GraveyardKeywordGrant}. */
export type GraveyardKeyword = "unearth" | "encore" | "embalm" | "harmonize" | "retrace" | "sneak";

/** See {@link PileFateWord}. */
export function pileFateWord(fate: PileFate): PileFateWord {
  if (typeof fate === "string") return fate;
  switch (fate.effect.kind) {
    case "sacrifice-target":
    case "destroy":
    case "exile":
    case "return-to-hand":
    case "put-into-graveyard":
      return "lose";
    default:
      return "other";
  }
}

/** A `separate-into-piles`'s objects as `ResolutionContext.beginPiles` takes
 * them, every amount and player resolved. */
export type ResolvedPileObjects =
  | { readonly libraryTop: number; readonly reveal: boolean }
  | { readonly permanents: CardFilter; readonly whose: PlayerId | undefined }
  | { readonly graveyard: CardFilter }
  | { readonly cards: readonly ObjectId[] };

/** See the `look-and-choose` effect's `leftoverIf`. */
export interface LookAndChooseLeftoverIf {
  readonly condition: StaticCondition;
  readonly leftover: "bottom-random" | "hand" | "graveyard";
}

/** The `look-and-choose` effect's `secondPick`, its `max` read as the
 * effect applies. */
export interface ZoneSecondPick {
  readonly filter?: ZoneChoiceFilter;
  readonly min: number;
  readonly max: number;
  /** `"library-bottom"`: Expressive Iteration's "put one of them on the
   * bottom of your library". */
  readonly destination: "battlefield" | "hand" | "graveyard" | "library-bottom";
  readonly enterTapped?: boolean;
  readonly ifNoneChosen?: boolean;
}

/** One selectable mode of a `modal` effect (rule 700.2) or a `castModal` card
 * (ROADMAP Phase 11 EG-2). */
/** The qualities a protection grant names, ORed (rule 702.16g): colours,
 * card types, and a filter for anything else (multicoloured, a subtype,
 * `{ colorless: true }`, `{}` for everything). As `StaticAbility.protection`. */
export interface ProtectionQualities {
  readonly colors?: readonly Color[];
  readonly types?: readonly CardType[];
  readonly filter?: CardFilter;
  /** Protection from players (rule 702.16k): `"opponents"` is "each of your
   * opponents", fixed to those players as the effect resolves (Cliffside
   * Rescuer's ruling) — a new controller doesn't change them. */
  readonly fromPlayers?: "opponents" | readonly PlayerId[];
  /** "Protection from **the chosen player**" (Guardian Archon): the effect's
   * source's (`"chosen-player"`), fixed to that player as the effect resolves. */
  readonly fromChosenPlayer?: true;
}

/** A protection quality chosen as the effect resolves (a `grant-protection`'s
 * `from`): `"color"` offers the five colours, `"card-type"` every card type
 * (Pippin, Guard of the Citadel); `or` adds named alternatives — Giver of
 * Runes' "from colorless or from the color of your choice" is `or: [{ text:
 * "colorless", from: { filter: { colorless: true } } }]`. `optional` is "you
 * **may** choose a color. If you do, …" (Kabira Evangel): no choice, nothing
 * granted. */
export interface ProtectionChoice {
  readonly choose: "color" | "card-type";
  readonly or?: readonly { readonly text: string; readonly from: ProtectionQualities }[];
  readonly optional?: true;
}

export interface ModeOption {
  /** Rules text of this mode, shown in the chooser. */
  readonly text: string;
  readonly effect: EffectSpec;
  /** Target specs this mode needs — a `castModal` spell's (ROADMAP Phase 11
   * EG-2), or an `announced` modal triggered ability's, whose chosen modes
   * bring their targets as it goes on the stack (rules 603.3c, 700.2). The
   * mode's `effect` reads them as slots `0..n-1` of the resolution context's
   * targets. Omitted / empty for a non-targeted mode. A resolution-time
   * `modal` / `may` effect (not announced) requires *non*-targeted modes and
   * ignores this. */
  readonly targets?: readonly TargetSpec[];
  /**
   * Spree (rule 702.172a): this mode's own additional cost — "+ {1} —" —
   * paid as the spell is cast if the mode is chosen, on top of whatever else
   * is paid, an alternative cost or a free cast included (rule 118.9d; the
   * rulings). Only on a `castModal` card, whose every mode has one, with
   * `minModes: 1` and `maxModes` all of them. Its mana value is still its
   * mana cost's alone.
   */
  readonly spreeCost?: string;
  /** A resolution-time `random` modal's eligibility: the mode can be picked
   * only while this holds, read as the effect applies (Crystalline Giant's
   * "a kind of counter … that this creature doesn't have on it"). */
  readonly onlyIf?: StaticCondition;
}

/** Primitive mutations an effect can perform. Implemented by the engine. */
export interface EffectApi {
  /** `from`: the triggering object, or a target, deals it, not the effect's
   * source — see {@link DamageFrom}. */
  dealDamage(target: TargetRef, amount: number, from?: DamageFrom): void;
  /** Run `fn` with every damage it deals unpreventable (rule 615.12 — a
   * `damage` effect's `cantBePrevented`). */
  unpreventably(fn: () => void): void;
  /** "Damage can't be prevented this turn" (Skullcrack). */
  damageUnpreventableThisTurn(): void;
  /** Set up a `damage-rule`, its references resolved (see that effect). */
  addDamageRule(rule: ResolvedDamageRule): void;
  /** Deal damage to a whole scope of players, untargeted (Sabotender /
   * Tannuk: "deals 1 damage to each opponent" — needed-cards P16), all at
   * once. `amountFor` is asked per player, for a per-player amount. */
  /** Deal `amount` to each of `targets`, as one event. */
  dealDamageToEach(targets: readonly TargetRef[], amount: number): void;
  dealDamageScoped(
    who: PlayerScope,
    amountFor: (player: PlayerId) => number,
    from?: DamageFrom,
  ): void;
  /** What the triggering event was aimed at, if it still is what it was —
   * see `LastKnownRefs.recipient`. `undefined` outside such a trigger, for a
   * permanent that has left the battlefield since, or a player who has lost.
   * `read`: for reading rather than acting on it, a permanent that has left
   * still answers, to be read as it last existed there (rule 608.2h). */
  triggerRecipient(read?: boolean): TargetRef | undefined;
  draw(player: PlayerId, count: number): void;
  /** The mana value of the card behind `target`, from its printed cost — see
   * the `{ manaValueOf }` {@link EffectAmount}. `0` for a player target or an
   * object that no longer exists. */
  manaValueOf(target: TargetRef): number;
  /** See the `{ manaSpentOf }` {@link EffectAmount}. */
  manaSpentOf(target: TargetRef): number;
  /** Where the mana spent to cast `target` came from, one entry per unit
   * (`GameObject.manaSpentFrom`) — `manaSpentOf`'s `from`. */
  manaSpentFromOf(target: TargetRef): readonly ManaOrigin[];
  /** See the `{ colorsSpentOf }` {@link EffectAmount}. */
  colorsSpentOf(target: TargetRef): number;
  /** See the `{ commanderCastsOf }` {@link EffectAmount}. */
  commanderCastsOf(target: TargetRef): number;
  /** See the `{ commanderCasts }` {@link EffectAmount}: `player`'s casts of
   * their commanders from the command zone this game, added up. */
  commanderCastsBy(player: PlayerId): number;
  /** A player's current life total — see the `{ lifeTotal }` {@link EffectAmount}. */
  lifeTotalOf(player: PlayerId): number;
  /** The game's starting life total (rule 119.1) — see the `{ startingLifeTotal }`
   * {@link EffectAmount}. */
  startingLifeTotal(): number;
  /** One player's running total for `stat` this turn — see the `turnStat`
   * {@link EffectAmount}. */
  turnStatOf(player: PlayerId, stat: TurnStat): number;
  /** How many of the spells `player` cast this turn match `filter`, as
   * they were cast — or the greatest mana value among them. See the
   * `castThisTurn` {@link EffectAmount}. */
  castThisTurnOf(
    player: PlayerId,
    filter: CardFilter,
    read?: { readonly greatest?: "mana-value"; readonly total?: "mana-value"; readonly other?: true },
  ): number;
  /** See the `{ countersPutThisTurn }` {@link EffectAmount}. */
  countersPutThisTurn(spec: CountersPutSpec): number;
  /** See the `{ countInGraveyard }` {@link EffectAmount}; `you` reads the
   * filter from that player's side (the effect's controller's otherwise). */
  countInGraveyard(filter: CardFilter, you?: PlayerId): number;
  /** See the `{ suspendedCardsYouOwn }` {@link EffectAmount}. */
  suspendedCardsYouOwn?(): number;
  /** How many cards are in `player`'s hand — see `{ cardsInHand }`. With
   * `filter`, only those matching it (printed characteristics, "you" as
   * that player) — the cards a filtered `discard` could take. */
  handSizeOf(player: PlayerId, filter?: CardFilter): number;
  /** How many cards are in `player`'s library. */
  librarySizeOf(player: PlayerId): number;
  /** How many cards are in `player`'s graveyard — see `{ graveyardSize }`. */
  graveyardSizeOf(player: PlayerId): number;
  /** See the `"double-counters"` {@link EffectSpec}. */
  doubleCounters(target: TargetRef, counter?: string): void;
  /** See the `"another-counter-of-each-kind"` {@link EffectSpec}. */
  anotherCounterOfEachKind(target: TargetRef): void;
  /** The colours of what `target` points at, as it last existed on the
   * battlefield if it has left — see `{ colorsOf }`. */
  colorsOf(target: TargetRef): readonly Color[];
  /** See the `{ colorsAmong }` {@link EffectAmount}. */
  colorsAmong(filter: CardFilter, except: readonly ObjectId[]): number;
  /** See the `{ distinctTokenNames }` {@link EffectAmount}. */
  distinctTokenNames(filter: CardFilter): number;
  /** The votes of the `vote` this resolution held, in the order cast — or,
   * in a "whenever players finish voting" trigger, of the vote that fired
   * it. None, with neither. */
  votes(): readonly Vote[];
  /** A `vote` begins: votes cast from now are kept (out of sight, for a
   * secret one) until `finishVoting`. */
  beginVoting(secret: boolean, choice?: boolean): void;
  /** Ask `player` for one vote in `spec` — `extra` an additional, optional
   * one (rule 701.38d). Nothing, for a player out of the game or with
   * nothing to vote for. */
  askVote(player: PlayerId, spec: Extract<EffectSpec, { kind: "vote" }>, extra: boolean): void;
  /** Record `voter`'s vote — a `permanent` being one on the battlefield. */
  castVote(voter: PlayerId, choice: VoteChoice | { readonly permanent: ObjectId }): void;
  /** Every vote is in: reveal them (a secret vote's) and fire "whenever
   * players finish voting". */
  finishVoting(): void;
  /** How many additional votes `player` may cast — the
   * `votesAdditionalTime` statics they control. */
  additionalVotes(player: PlayerId): number;
  /** Whether a permanent voted for is still on the battlefield as the same
   * object (rule 400.7). */
  votedPermanentHere(object: ObjectId, zoneChangeCount: number): boolean;
  /** Reveal from the top of `owner`'s library until `count` cards matching
   * `filter` are revealed — see `"reveal-until-count"`. */
  revealUntilCount(
    owner: PlayerId,
    filter: CardFilter,
    count: number,
    exile: boolean,
  ): { readonly revealed: readonly ObjectId[]; readonly found: readonly ObjectId[] };
  /** Put these cards onto the battlefield together, each under its owner's
   * control. `true` when it stopped first to ask an "as this enters"
   * choice (nothing has moved; do it again once that's answered). */
  putOntoBattlefieldTogether(cards: readonly ObjectId[], tapped?: boolean): boolean;
  /** The permanents matching `filter` (from the effect's controller's
   * side, with the source as `FilterContext.source`), each with how many
   * tokens it stands for — a token stack is one
   * object for every token in it. */
  permanentsMatching(filter: CardFilter): readonly { readonly object: ObjectId; readonly count: number }[];
  /** The cards in every graveyard matching `filter`, read as the effect's
   * controller — `ShareReference`'s `{ graveyard }`. */
  graveyardCardsMatching(filter: CardFilter): readonly ObjectId[];
  /** See the `{ cardTypesInGraveyard }` {@link EffectAmount}. */
  cardTypesInGraveyard(filter: CardFilter): number;
  /** What this resolution has done `what` to so far, whose it was among
   * `players` (everyone's when absent) and matching `filter` — see the
   * `thisWay` {@link EffectAmount}. */
  thisWay(
    what: ThisWayKind,
    players?: readonly PlayerId[],
    filter?: CardFilter,
    /** From this event on instead of the resolution's start (a connive's
     * own discards). */
    since?: number,
  ): readonly ThisWayEntry[];
  /** How much life `players` (everyone when absent) have lost so far in
   * this resolution — see the `lifeLostThisWay` {@link EffectAmount}. */
  lifeLostThisWay(players?: readonly PlayerId[]): number;
  /** How many counters `players` (everyone when absent) have had removed
   * from themselves so far in this resolution — part of the `thisWay:
   * "counters-removed"` amount (rule 122.1). */
  playerCountersRemovedThisWay(players?: readonly PlayerId[]): number;
  /** See the `excessDamageThisWay` {@link EffectAmount}: dealt to `to`'s
   * object only, when given. */
  excessDamageThisWay(to?: ObjectId): number;
  /** See the `damageDealtThisWay` {@link EffectAmount}: dealt to `to` only,
   * when given. */
  damageDealtThisWay(to?: TargetRef): number;
  /** See the `damagePreventedThisWay` {@link EffectAmount}. */
  damagePreventedThisWay(): number;
  /** See the `keptOnTopThisWay` {@link EffectAmount}. */
  keptOnTopThisWay(): number;
  /** Announce that the effect's controller foraged — see the `foraged`
   * {@link EffectSpec}. */
  foraged(): void;
  /** Explore's reveal (rule 701.44a): `explorer`'s controller — its last,
   * if it has left — reveals the top card of their library, and a land card
   * goes to their hand. `null` when there's no such player any more. */
  exploreReveal(explorer: ObjectId): Omit<ExploreResult, "explorer"> | null;
  /** The explore's "may put it into your graveyard": `card`, if it's still
   * on top of its owner's library. */
  exploreToGraveyard(card: ObjectId): void;
  /** Announce a finished exploration (rule 701.44b). */
  explored(result: ExploreResult): void;
  /** The permanents `filter` names that "each … explores" sends, the effect
   * controller's, a token stack split into its tokens, each with its name. */
  exploreCandidates(filter: CardFilter): readonly { readonly object: ObjectId; readonly name: string }[];
  /** Whether `object` is on the battlefield. */
  onBattlefield(object: ObjectId): boolean;
  /** `object`'s name, as a player sees it (a choice's text). */
  objectName(object: ObjectId): string;
  /** `object`'s name as rule 201.2a compares names — a copy's, if one renamed
   * it — or `null` when it has none (a face-down permanent, a Room with both
   * doors locked). See `CardFilter.sameNameAsTarget`. */
  nameForMatching(object: ObjectId): string | null;
  /** See the `{ opponentsAttacked }` {@link EffectAmount}. */
  opponentsAttacked(): number;
  /** See the `{ attackingPlayer }` {@link EffectAmount}: creatures
   * attacking `player` (not their planeswalkers), a stack as its tokens. */
  creaturesAttacking(player: PlayerId): number;
  /** See the `{ damageDealtThisTurn }` {@link EffectAmount}. */
  damageDealtThisTurn(players: readonly PlayerId[], combat?: boolean, colors?: readonly Color[]): number;
  /** See the `{ turnHistory }` {@link EffectAmount}. */
  turnHistoryCount(
    what: TurnHistoryKind,
    players: readonly PlayerId[],
    filter?: CardFilter,
    origin?: TurnHistoryOrigin,
  ): number;
  /** How many card types there are among `objects`, each once — as they
   * last existed on the battlefield if `departed` (a sacrificed or
   * destroyed permanent), else as they are now. */
  cardTypesAmong(
    objects: readonly { readonly object: ObjectId; readonly departed: boolean }[],
  ): number;
  /** The total power (or `of` toughness, or mana value) of `entries`,
   * signed — each as it last existed on the battlefield if `departed`, else
   * as it is now, a stack that went whole once per token. See the `thisWay`
   * amount's `sumOf`. */
  powerAmong(entries: readonly ThisWayEntry[], of?: "power" | "toughness" | "mana-value"): number;
  /**
   * Who controls what `ref` points at — the player itself for a player ref,
   * else the object's controller.
   *
   * Rule 111.11 / 608.2h — *last-known* information for a permanent that
   * has left the battlefield since the spell or ability referred to it,
   * which is the usual case for the cards that ask (they destroy the
   * permanent first): whoever controlled it as it left, though `moveObject`
   * has handed it back to its owner.
   */
  controllerOf(ref: TargetRef): PlayerId | undefined;
  /** Which of `id`'s stints on the battlefield it's in, or last was: its
   * `zoneChangeCount` then (`LastKnownInfo.zoneChangeCount`). */
  battlefieldStintOf(id: ObjectId): number;
  /** See the `{ devotionTo }` {@link EffectAmount}. */
  devotionTo(colors: readonly Color[]): number;
  /** See the `{ greatestCommanderManaValue }` {@link EffectAmount}. */
  greatestCommanderManaValue(): number;
  /** See the `{ basicLandTypes }` {@link EffectAmount}. */
  basicLandTypes(): number;
  /** See the `{ partySize }` {@link EffectAmount}. */
  partySize(): number;
  /** See the `{ timesMutated }` {@link EffectAmount}. */
  timesMutated(): number;
  /** How many creatures are blocking `object` — see `{ blockersOf }`. */
  creaturesBlocking(object: ObjectId): number;
  /** See the `{ opponentsControllingFewer }` {@link EffectAmount}. */
  opponentsControllingFewer(filter: CardFilter): number;
  /** See the `{ creaturesDiedThisTurn }` {@link EffectAmount}. */
  creaturesDiedThisTurn(anyController?: boolean): number;
  /** See the `{ powerOf }` / `{ toughnessOf }` {@link EffectAmount}s — a
   * permanent that has left the battlefield since the spell or ability
   * referred to it reads as it last existed there. */
  powerOf(target: TargetRef): number;
  toughnessOf(target: TargetRef): number;
  /** See the `{ countersOn }` {@link EffectAmount}. */
  countersOf(target: TargetRef, counter: string | undefined): number;
  /** See the `"put-on-bottom-of-library"` {@link EffectSpec}. */
  putOnBottomOfLibrary(target: TargetRef): void;
  /** See the `"exile-if-dies-this-turn"` {@link EffectSpec}. */
  exileIfDiesThisTurn(target: TargetRef): void;
  /** See the `"exile-if-dies-this-turn"` {@link EffectSpec}'s
   * `dealtDamageThisWay`. */
  exileDamagedThisWayIfTheyDie(creaturesOnly: boolean): void;
  /** Every player a `PlayerScope` names, in APNAP order and skipping anyone
   * who has already lost. The shared scope resolution behind `draw`'s `who`,
   * `discard-hand`, and anything else that acts on a scope one player at a
   * time rather than in one call. */
  playersInScope(who: PlayerScope): readonly PlayerId[];
  /** {@link playersInScope}, but keeping each player who has left the game —
   * "each opponent who lost life this turn" still counts one who then lost
   * (Tymna the Weaver's, Teysa, Opulent Oligarch's rulings). */
  playersCountedInScope(who: PlayerScope): readonly PlayerId[];
  /** Discard a player's whole hand at once (rule 701.9a) — no choice, so this
   * never raises a `discard` decision the way `discardCards` does. With
   * `filter`, every card in it matching that; with `reveal`, the whole hand
   * is revealed first (rule 701.20a). */
  discardHand(player: PlayerId, filter?: CardFilter, reveal?: boolean): void;
  /** `player` reveals their whole hand (rule 701.20a) — `reveal-hand`. */
  revealHand(player: PlayerId): void;
  gainLife(player: PlayerId, amount: number): void;
  loseLife(player: PlayerId, amount: number): void;
  /** Change life for a whole scope (`gain-life` / `lose-life` with `who`). */
  changeLifeScoped(who: PlayerScope, delta: number): void;
  /** The concrete types a {@link BoardManaList} names right now, read from
   * this effect's source and controller. */
  manaTypesOf(mana: BoardManaList): readonly ManaType[];
  addMana(
    player: PlayerId,
    mana:
      | ManaType
      | "any-color"
      | { readonly oneOf: readonly ManaType[]; readonly same?: true }
      | Exclude<BoardManaList, { readonly eachColorAmong: CardFilter }>,
    amount: number,
    /** The whole `add-mana` spec, so the engine can stamp this mana's
     * provenance (a spend restriction, a spend rider, a "doesn't empty"
     * permission) on the units it makes. Needed here as well as in the
     * payment planner: activating a mana ability *by hand* floats the mana,
     * and that is exactly where an untagged pool loses the restriction. */
    spec?: Extract<EffectSpec, { kind: "add-mana" }>,
  ): void;
  /** `doesntUntapNext`: see the `tap` {@link EffectSpec}. */
  tapPermanent(
    target: TargetRef,
    doesntUntapNext?: boolean,
    onlyDoesntUntap?: boolean,
    doesntUntapSteps?: number,
    untapStepOf?: PlayerId,
  ): void;
  /** `id` becomes prepared (rule 722.3a — `Game.becomePrepared`): each
   * token of a compacted stack, singly. */
  becomePrepared(id: ObjectId): void;
  untapPermanent(target: TargetRef): void;
  /** `cantBeRegenerated`: rule 701.15c. */
  destroyPermanent(target: TargetRef, cantBeRegenerated?: boolean): void;
  /** Destroy every battlefield permanent matching `filter`. With
   * `onlyControllersDamagedBySource`, restricted to those whose controller
   * this effect's source dealt combat damage to this turn. */
  destroyAll(
    filter: CardFilter,
    onlyControllersDamagedBySource?: boolean,
    cantBeRegenerated?: boolean,
    scopeTo?: PlayerId,
    exceptSource?: boolean,
    /** Left out, whatever `filter` says of it — one token of a stack. */
    except?: ObjectId,
  ): void;
  /** Give a permanent a regeneration shield (rule 701.15a). */
  regenerate(target: TargetRef): void;
  /** Give every battlefield permanent matching `filter` one. */
  regenerateAll(filter: CardFilter): void;
  /** Return every battlefield permanent matching `filter` to its owner's hand. */
  returnToHandAll(filter: CardFilter, scopeTo?: PlayerId): void;
  /** Exile every battlefield permanent matching `filter` but `except` — see
   * `exile-all`; `airbend` airbends them (rule 701.65a), `untilSourceLeaves`
   * exiles them until the source leaves the battlefield (610.3). */
  exileAll(
    filter: CardFilter,
    airbend?: boolean,
    except?: ObjectId,
    untilSourceLeaves?: boolean,
    linked?: boolean,
    scopeTo?: PlayerId,
  ): void;
  /** Deal `amount` damage to every battlefield permanent matching `filter`. */
  damageAll(
    filter: CardFilter,
    amount: number,
    exceptSource?: boolean,
    whose?: readonly PlayerId[],
    from?: DamageFrom,
  ): void;
  /** Every battlefield permanent matching `filter` deals `amount` damage to
   * its own controller — see the `"creatures-damage-controllers"`
   * {@link EffectSpec}. */
  creaturesDamageControllers(filter: CardFilter, amount: number): void;
  /** Every battlefield permanent matching `filter` (`whose` controls it, not
   * the effect's source with `exceptSource`, not `except`) deals `amount` —
   * or its own power — damage to itself or to each of `to`, all at once —
   * see the `"each-deals-damage"` {@link EffectSpec}. */
  eachDealsDamage(
    dealers: {
      readonly filter: CardFilter;
      readonly exceptSource: boolean;
      readonly except?: ObjectId;
      readonly whose?: PlayerId;
    },
    amount: number | "its-power",
    to: "itself" | "host" | readonly TargetRef[],
  ): void;
  /** Each of `who` (a scope, or `{ player }` for a targeted edict) sacrifices
   * `count` permanents matching `filter`. */
  sacrificePermanents(
    who: PlayerScope | { readonly player: PlayerId },
    filter: CardFilter,
    /** A number, or one for each player sacrificing (a per-player amount). */
    count: number | ((player: PlayerId) => number),
    exceptId?: ObjectId,
    exploit?: boolean,
    andEach?: readonly CardFilter[],
  ): void;
  /** Sacrifice this effect's own source. Returns whether it actually happened
   * (false if the source has already left the battlefield) — the "if you do"
   * gate on a `sacrifice-source` effect's `then`. */
  sacrificeSource(): boolean;
  /** This context, with `object` — a permanent the effect has just
   * sacrificed — as its `"sacrificed"` ({@link AmountRef}), read as it last
   * existed on the battlefield. */
  withSacrificed(object: ObjectId): ResolutionContext;
  /** This context with target `index` in slot `from` and nothing after it
   * — one member of an "any number of target …" group, bound where its
   * effect expects it (see `for-each-target`). What was known about it —
   * where it was when targeted, whether it was found illegal — moves with
   * it. */
  withTargetAt(from: number, index: number): ResolutionContext;
  /** The permanents a `for-each-permanent` reaches now, a token stack as each
   * of its tokens, with the stint each was found in. */
  eachPermanentMatching(
    filter: CardFilter,
    exceptSource: boolean,
    except: readonly ObjectId[],
    scopeTo: PlayerId | undefined,
  ): readonly { readonly object: ObjectId; readonly stint: number }[];
  /** Whether `object` is still on the battlefield as the same object (400.7). */
  stillOnBattlefield(object: ObjectId, stint: number): boolean;
  /** This context with `player` as its controller — see `as-player`. */
  asPlayer(player: PlayerId): ResolutionContext;
  /** This context with `card`, which the resolution found rather than
   * chose, in slot `slot` — every other target, and what was known about
   * it, kept as it is (`choose-random-card`'s `slot`). */
  withFoundAt(slot: number, card: ObjectId): ResolutionContext;
  /** How many creatures convoked the resolving spell (its `convokedBy`). */
  convokerCount(): number;
  /** See the `{ phyrexianPaidWithLife }` {@link EffectAmount}. */
  phyrexianPaidWithLife(): number;
  /** Convoker `index`, named for a choice among them: its name as it is
   * now, or as it last existed on the battlefield, and when it tapped. */
  convokerLabel(index: number): string;
  /** This context with convoker `index` of the resolving spell as target 0 —
   * see `for-each-convoker`: acted on only while it's the same object on
   * the battlefield that tapped (rule 400.7), read as it last existed there
   * otherwise. */
  withConvoker(index: number): ResolutionContext;
  /** This context with only targets `offset`…`offset + count - 1`, as
   * slots 0… — one announced mode's own targets (see the `"modal"`
   * {@link EffectSpec}), with what was known about each moving with it. */
  withTargetSlice(offset: number, count: number): ResolutionContext;
  /** See the `"choose-permanents"` {@link EffectSpec}: raise the choice. */
  choosePermanents(
    filter: CardFilter,
    min: number,
    max: number,
    then: EffectSpec,
    prompt: string,
    exceptSource?: boolean,
    /** Never these (a `move-counters`' other end, and those chosen already). */
    except?: readonly ObjectId[],
    /** Who chooses — the effect's controller when absent. */
    chooser?: PlayerId,
    /** What the chosen ones must be as a set — the effect's `together`. */
    together?: { readonly distinctNames: true } | { readonly distinctPowers: true },
  ): void;
  /** See the `"blight"` {@link EffectSpec}: `player` blights `amount` — the
   * creature chosen now, or asked for — then `then` with it as target 0.
   * Nothing, if they control no creature (rule 701.68b). */
  blight(player: PlayerId, amount: number, then?: EffectSpec): void;
  /** See the `"bolster"` {@link EffectSpec}: the controller bolsters
   * `amount` — the creature chosen now, or asked for. */
  bolster(amount: number): void;
  /** See the `"behold"` {@link EffectSpec}: the controller beholds (rule
   * 701.4a) — the object chosen now, or asked for — then `then` with it as
   * target 0. Nothing, if nothing qualifies. */
  behold(spec: BeholdSpec, then?: EffectSpec): void;
  /** Whether the controller could behold `spec` right now (rule 701.4a): as
   * many cards in hand and permanents they control matching it as it takes. */
  canBehold(spec: BeholdSpec): boolean;
  /** Whether `player` could blight right now (rule 701.68b): they control a
   * creature -1/-1 counters can be put on. */
  canBlight(player: PlayerId): boolean;
  /** This context, about `player`: the `"that-player"` scope names them —
   * an `"each-player-may"`'s follow-ups. */
  aboutPlayer(player: PlayerId): ResolutionContext;
  /** This context with `"x"` read as `x` — an amount a later step of the
   * effect found: the total a `"players-pay-any-amount"` was paid. */
  withX(x: number): ResolutionContext;
  /** Ask `player` a yes or no as this resolves — `yes` or `no` is then this
   * effect's own (its controller stays this context's), not `player`'s. With
   * `cost` (an `{X}`), saying yes pays it, the X paid arriving as `yes`'s
   * `"x"`: 0 if none. See `"players-pay-any-amount"`, `"bid-life"`. */
  askPlayerAboutEffect(player: PlayerId, prompt: string, yes: EffectSpec, no: EffectSpec, cost?: string): void;
  /** The most of `resource` that `player` could pay right now (rule 119.4:
   * no more life than they have, and none if they can't lose life). */
  mostPayable(player: PlayerId, resource: "mana" | "life"): number;
  /** Keep `player` as the effect's source's "chosen player"
   * (`choose-opponent { remember }`) — nothing once it has left the
   * battlefield. */
  rememberChosenPlayer(player: PlayerId, secret?: true): void;
  /** An index in `0…count-1` (`count` > 0) picked with the game's seeded
   * randomness, and announced as a `chosen-at-random` event naming what
   * `pick` says the index stands for — a `random` choice: `choose-opponent`,
   * `choose-random-card`, a `modal`'s mode. */
  pickAtRandom(count: number, pick: (index: number) => RandomPick): number;
  /** Whether the card `id` matches `filter`, read from the effect's
   * controller's side — `choose-random-card`'s filter over a hand or the
   * cards exiled with the source. */
  cardMatches(id: ObjectId, filter: CardFilter): boolean;
  /** Show `card`, in `owner`'s hand, as `choose-random-card`'s `show` says:
   * `"reveal"` to every player (rule 701.20a), `"look"` to the effect's
   * controller alone — a look they close, as `look-at-hand`'s is. */
  showCardFromHand(owner: PlayerId, card: ObjectId, how: "reveal" | "look"): void;
  /** The effect's controller looks at the top card of `owner`'s library — a
   * look they close, as `look-at-hand`'s is. */
  lookAtLibraryTop(owner: PlayerId): void;
  /** The cards in `owner`'s graveyard matching `filter`, read from the
   * effect's controller's side, in graveyard order. */
  graveyardMatching(owner: PlayerId, filter: CardFilter): readonly ObjectId[];
  /** The card types of what `target` points at — as it last existed on the
   * battlefield if it has left since the effect referred to it. For binding
   * `CardFilter.sharesCardTypeWith`. */
  cardTypesOf(target: TargetRef): readonly CardType[];
  /** The subtypes of what `target` points at, the same way — a changeling's
   * with its every-creature-type marker. For binding
   * `CardFilter.sharesCreatureTypeWith`. */
  subtypesOf(target: TargetRef): readonly string[];
  /** See the `"return-to-hand"` {@link EffectSpec} — `from` defaults to the
   * battlefield. */
  returnToHand(target: TargetRef, from?: ReturnToHandZone | "where-discarded"): void;
  /** `withCounters`: counters the card gets there ("exile it with a croak
   * counter on it"). */
  exileObject(
    target: TargetRef,
    untilSourceLeaves?: boolean,
    withCounters?: { readonly kind: string; readonly amount: number },
    mayCast?: ExilePermission,
    linked?: boolean,
    /** Airbend it (rule 701.65a) — see the `exile` effect's `airbend`. */
    airbend?: boolean,
    /** See the `exile` effect's `until`, with its slot read. */
    until?: { readonly leaves: ObjectId } | "opponent-becomes-monarch",
  ): void;
  /** Haunt (rule 702.55b): `card`, just exiled by this effect, haunts
   * `creature` — in the battlefield stint it's in now. Nothing unless the
   * card is in exile. */
  markHaunting(card: ObjectId, creature: ObjectId): void;
  /** See the `"return-exiled-by-source"` {@link EffectSpec}.
   * Returns `true` when it stopped to ask an "as this enters" choice first
   * (rule 614.12 — a Clone's copy): nothing has moved, and the step runs
   * again once it's answered. */
  returnExiledBySource(
    linked?: boolean,
    /** The linked return's `under`, `others`, `filter` and `enterTapped`. */
    options?: {
      readonly underYou?: boolean;
      readonly others?: boolean;
      readonly filter?: CardFilter;
      readonly enterTapped?: boolean;
    },
  ): boolean;
  /** The tokens this resolution has created, one object per token: a stack
   * woken, and of a stack they joined only the ones made. */
  createdTokensApart(): readonly ObjectId[];
  /** `tokens` hold the cards this resolution has exiled — see
   * `link-exiled-to-created`. */
  linkExiledTo(tokens: readonly ObjectId[]): void;
  /** Sacrifice one named permanent — see the `"sacrifice-target"`
   * {@link EffectSpec}. */
  sacrificeTarget(target: TargetRef, byItsController?: boolean): void;
  /** Put `target` on top of / on the bottom of / Nth from the top of its
   * owner's library — see the `"put-on-library"` {@link EffectSpec}. */
  putOnLibrary(target: TargetRef, position: LibraryPosition): void;
  /** Set up a delayed triggered ability — see the `"delayed-trigger"`
   * {@link EffectSpec}. `controller` is who will control it when it fires. */
  delayTrigger(
    at:
      | DelayedTriggerTiming
      | {
          readonly leaves: ObjectId;
          readonly to: readonly LeaveDestination[];
          readonly thisTurn?: boolean;
        }
      | DelayedNextSpell
      | { readonly attacksUnblocked: ObjectId }
      | DelayedWheneverAt
      | { readonly losesControl: ObjectId; readonly thisTurn?: true; readonly onlyIf?: StaticCondition },
    effect: EffectSpec,
    text: string,
    controller: PlayerId,
    /** Its targets, in place of the creating ability's (`about`). */
    targets?: readonly TargetRef[],
    /** Whose turn a `"your-…"` timing waits for, if not `controller`'s. */
    turnOf?: PlayerId,
  ): void;
  /** See the `"enters-with-counters"` {@link EffectSpec}. */
  entersWithCounters(target: TargetRef, counter: string, amount: number, condition?: StaticCondition): void;
  /** See the `"allow-cast-from-exile"` {@link EffectSpec}. */
  allowCastFromExile(
    target: TargetRef,
    free: boolean,
    laterTurns?: boolean,
    opts?: { readonly whileExiled?: boolean; readonly undaunted?: boolean; readonly spendAs?: SpendAs },
  ): void;
  /** See the `"choose-exiled-to-play"` {@link EffectSpec}. */
  chooseExiledToPlay(filter: CardFilter | undefined, free: boolean, among?: readonly ObjectId[]): void;
  /** See the `"cast-now"` {@link EffectSpec}: offer the effect's
   * controller the cast of one of `cards`, as a `cast-now` decision — or
   * nothing, when none of them can be cast. */
  castNow(cards: readonly ObjectId[], options: CastNowOptions): void;
  /** Whether the effect's controller has cast (or played, a land) one of
   * `cards` at a `cast-now`'s offer since event `since`. */
  castSince(cards: readonly ObjectId[], since: number, by?: PlayerId): boolean;
  /** The total mana value of the spells among `cards` cast off a `cast-now`
   * offer since event `since` (rule 202.3e, X as chosen). */
  manaValueCastSince(cards: readonly ObjectId[], since: number): number;
  /** "Face-up cards your opponents own" in exile — see the `cast-now`
   * effect's `from`. */
  faceUpExileOpponentsOwn(): readonly ObjectId[];
  /** The cards in `player`'s hand or graveyard. */
  cardsIn(player: PlayerId, zone: "hand" | "graveyard" | "library"): readonly ObjectId[];
  /** The cards in `player`'s library they may cast while searching it
   * (`CardDefinition.castWhileSearchingLibrary`). */
  castableWhileSearching(player: PlayerId): readonly ObjectId[];
  /** See the `"allow-cast-linked-exile"` {@link EffectSpec}. */
  allowCastLinkedExile(
    spell: CardFilter | undefined,
    free: boolean,
    more?: { readonly play?: true; readonly anyNumber?: true; readonly reduce?: number },
  ): void;
  /** The cards this resolution has exiled so far from a library, a hand or
   * a graveyard, still in exile — a `cast-now`'s `"exiled-this-way"`. */
  cardsExiledThisWay(): readonly ObjectId[];
  /** `card`, if it's still in exile in the stint `zoneChangeCount` names —
   * a `cast-now`'s `encoded` card (rule 702.99c). */
  stillExiled(card: ObjectId, zoneChangeCount: number): readonly ObjectId[];
  /** The cards this resolution has had the effect's controller draw, still
   * in their hand — a `cast-now`'s `"drawn-this-way"`. */
  cardsDrawnThisWay(): readonly ObjectId[];
  /** Show every player the cards this resolution has had each player draw,
   * those still in their hand — the `reveal-drawn` effect. */
  revealDrawn(): void;
  /** Put `card`, if it's in exile, into its owner's graveyard — the
   * `put-into-graveyard` effect. */
  putExiledIntoGraveyard(card: ObjectId): void;
  /** The source, if this resolution exiled it (from the battlefield too) and
   * it's still in exile — a `cast-now`'s `"source-exiled-this-way"`. */
  sourceExiledThisWay(): readonly ObjectId[];
  /** The cards in exile linked to this effect's source (rule 607.2a — see
   * `GameObject.exiledWith`), in the battlefield stint the resolving spell
   * or ability refers to. `orUntil`: the cards it exiled "until [it] leaves
   * the battlefield" too (`GameObject.exiledUntil` — rule 610.3), which an
   * ability of it also calls "the exiled card". */
  cardsExiledWithSource(orUntil?: boolean): readonly ObjectId[];
  /** The face-up cards in exile matching `filter`, read from this effect's
   * controller's side — a `create-token-copy`'s `{ eachExiled }`. */
  exiledCardsMatching(filter: CardFilter): readonly ObjectId[];
  /** See the `"ninjutsu"` {@link EffectSpec}: whether it stopped to ask an
   * "as this enters" choice, after which it's applied again. */
  ninjutsu(): boolean;
  /** See the `"gain-class-level"` {@link EffectSpec}. */
  setClassLevel(level: number): void;
  /** The doors of `room`, or of every Room the effect's controller controls:
   * each with its half's name, its Room's, and whether it's unlocked. */
  roomDoors(room?: ObjectId): readonly {
    readonly object: ObjectId;
    readonly door: "left" | "right";
    readonly name: string;
    readonly roomName: string;
    readonly unlocked: boolean;
  }[];
  /** Unlock (or `lock`) a door of the Room `object` (rule 709.5f, g), by
   * the effect's controller. */
  setDoor(object: ObjectId, door: "left" | "right", lock: boolean): void;
  /** The top `count` cards of `player`'s library, top first. */
  libraryTop(player: PlayerId, count: number, reveal?: boolean): readonly ObjectId[];
  /** `times` copies of each of `cards` (rule 707.12), made in the card's
   * zone and owned by the controller, for casting; the new objects' ids. */
  copyCards(cards: readonly ObjectId[], times: number): readonly ObjectId[];
  /** See the `"choose-creature-type"` {@link EffectSpec}. */
  chooseCreatureType(
    then: EffectSpec,
    exclude?: readonly string[],
    options?: { readonly options: readonly string[]; readonly prompt?: string; readonly sentinel?: string },
    /** What to keep of the answer on the source, and whether it's secret. */
    keep?: { readonly remember?: "player" | "creature-type"; readonly secret?: true },
  ): void;
  /** See the `"choose-card-name"` {@link EffectSpec}. */
  chooseCardName(spec: Extract<EffectSpec, { kind: "choose-card-name" }>): void;
  /** See the `"choose-value"` {@link EffectSpec}. */
  chooseValue(
    spec: Extract<EffectSpec, { kind: "choose-value" }>,
    /** A number's `max` and `who`, read as the effect applies. */
    asked?: { readonly max?: number; readonly chooser?: PlayerId },
  ): void;
  /** Trigger a reflexive ability — see the `"reflexive-trigger"`
   * {@link EffectSpec}. */
  /** `value`: the reflexive ability's trigger value, when the spec sets one
   * (see its `value`); `divided`, what it divides among its group (see its
   * `divided`); `about`, the object it reads as its trigger object (see its
   * `about`). */
  reflexiveTrigger(
    targets: readonly TargetSpec[],
    effect: EffectSpec,
    text: string,
    value?: number,
    divided?: TriggeredAbility["divided"],
    about?: ObjectId,
  ): void;
  /** Exile every card in `target`'s graveyard (a player — Bojuka Bog), as
   * one move. */
  exileGraveyard(target: TargetRef, filter?: CardFilter, linked?: boolean, fromHand?: "also" | "only", untilSourceLeaves?: boolean, faceDown?: true): void;
  /** See `exile`'s `fromHand`. */
  exileFromHand(card: ObjectId): void;
  /** Each of `players` sacrifices every permanent matching `filter` they
   * control, at once — see the `"sacrifice-all"` {@link EffectSpec}. */
  sacrificeAll(players: readonly PlayerId[], filter: CardFilter): void;
  /** See the `"put-exiled-this-way-onto-battlefield"` {@link EffectSpec}.
   * `true` when it stopped first to ask an "as this enters" choice (nothing
   * has moved; apply it again once that's answered). */
  putExiledThisWayOntoBattlefield(): boolean;
  /** See the `"move-exiled-this-way"` {@link EffectSpec}. */
  moveExiledThisWay(to: Extract<EffectSpec, { kind: "move-exiled-this-way" }>["to"], filter?: CardFilter): void;
  /** See the `"put-arrived-onto-battlefield"` {@link EffectSpec}. `true`
   * when it stopped first to ask an "as this enters" choice. */
  putArrivedOntoBattlefield(spec: Extract<EffectSpec, { kind: "put-arrived-onto-battlefield" }>): boolean;
  /** How many of those cards are still in that graveyard as the same objects
   * (rule 400.7). */
  arrivedStillThere(): number;
  /** Carry out `fn` as one simultaneous event: the cards it takes out of
   * graveyards leave together (one `cards-left-graveyard`), the permanents
   * it takes off the battlefield leave together (rule 603.10a), and the ones
   * it puts onto the battlefield enter together, each seeing the others
   * enter (rule 603.6a). See the `sequence` {@link EffectSpec}'s
   * `simultaneous`. */
  simultaneously(fn: () => void): void;
  /** Carry out `fn` as one token-creation event: a replacement that adds one
   * token to an event gets one opportunity at all of it (rule 614.5). */
  oneTokenEvent(fn: () => void): void;
  /** The creature this effect's source equips — see `create-token-copy`'s
   * `of: "equipped"`. */
  equippedCreature(): ObjectId | undefined;
  /** The permanent an {@link EffectTargetRef} `"attached"` names: what the
   * source is attached to now, or — the source gone — what it was last
   * attached to, while that is still on the battlefield as the same object. */
  attachedHost(): ObjectId | undefined;
  /** The owner of what the source is or was last attached to, as it last
   * existed if it has left the battlefield (rule 608.2h). */
  attachedOwner(): PlayerId | undefined;
  /** The permanent an {@link EffectTargetRef} `"chosen"` names: the source's
   * chosen permanent (`GameObject.chosenPermanent`) — as the source last
   * existed, if it has left (rule 608.2h) — while that one is still on the
   * battlefield as the object that was chosen (rule 400.7). */
  chosenPermanent(): ObjectId | undefined;
  /** How much damage from the effect's damage source (`from`) is lethal to
   * the creature `target` now — see the `damage` effect's
   * `excessToController`. */
  lethalDamageTo(target: ObjectId, from: DamageFrom | undefined): number;
  /** Whether the effect's damage source (`from`) has `keyword` — as it last
   * existed, if it has left. */
  damageSourceHas(keyword: Keyword, from: DamageFrom | undefined): boolean;
  /** Whether something the resolution has done so far is still waiting on a
   * player — a decision on `awaiting`, or a queued discard, sacrifice,
   * destruction or 903.9a choice not yet asked. */
  decisionPending(): boolean;
  /** Park `rest` — the steps of a `sequence` after the one that raised a
   * decision — to be applied with this same context once every decision
   * now pending has been answered. See `GameState.suspendedResolutions`.
   * `below` is {@link parkedCount} as the step began: what the step parked
   * of its own (a nested `sequence`'s remainder) is part of it, so it goes
   * on first, and `rest` waits beneath it. */
  resumeAfterDecisions(rest: EffectSpec, below?: number): void;
  /** How many resolutions are parked right now — see
   * {@link resumeAfterDecisions}. */
  parkedCount(): number;
  /** Reveal (or, with `exile`, exile) the top of `owner`'s library until a
   * card matches `filter` — see the `"reveal-until"` {@link EffectSpec}.
   * Returns every card revealed, in order, and the card found (the last of
   * them), or `null`. */
  revealUntil(
    owner: PlayerId,
    spec: Extract<EffectSpec, { kind: "reveal-until" }>,
  ): { readonly revealed: readonly ObjectId[]; readonly hit: ObjectId | null };
  /** Put the card a `reveal-until` found where its `put` says. Returns
   * `true` when it stopped first to ask an "as this enters" choice, having
   * moved nothing — try again once that's answered. */
  placeFound(
    hit: ObjectId,
    put: "battlefield" | "hand" | "graveyard",
    tapped: boolean,
    attacking?: ResolvedEnterAttacking,
    underYourControl?: boolean,
  ): boolean;
  /** Place what a `reveal-until` revealed that is still where it was
   * revealed — see its `rest`. */
  placeRevealed(
    owner: PlayerId,
    revealed: readonly ObjectId[],
    rest: RevealedCardsGo,
    exiled: boolean,
  ): void;
  /** This context with other targets — a step applied to cards the
   * resolution found rather than chose (a `reveal-until`'s `then`). */
  withTargets(targets: readonly TargetRef[]): ResolutionContext;
  /** This context with `found` as target 0 and its own targets after it, each
   * a slot up — see `reveal-until`'s `thenKeepsTargets`. */
  withFoundBeforeTargets(found: TargetRef): ResolutionContext;
  /** Exile `targets`, then return them to the battlefield together — at once,
   * or linked to a delayed return — see the `"flicker"` {@link EffectSpec}.
   * `fromSource` marks a target that is the ability's own source, which is
   * skipped if it has become a new object since. Returns the return, as a
   * `return-flickered` step to run once answered, when one coming back has
   * an "as this enters" choice to ask first (rule 614.12); else `null`. */
  flicker(targets: readonly TargetRef[], options: FlickerOptions): EffectSpec | null;
  /** See the `"return-flickered"` {@link EffectSpec}.
   * Returns `true` when it stopped to ask an "as this enters" choice first
   * (rule 614.12 — a Clone's copy): nothing has moved, and the step runs
   * again once it's answered. */
  returnFlickered(
    link: string,
    thenCounters: FlickerCounters | undefined,
    underYourControl: boolean,
    transformed: boolean,
    tapped: boolean,
  ): boolean;
  /** See the `"meld"` {@link EffectSpec}: `partner` is the counterpart
   * already chosen (`null`: chosen, and gone since), else it's found (and
   * asked for, among several). The source is the resolving ability's own,
   * `undefined` if it has become a new object since (rule 400.7). */
  meld(source: ObjectId | undefined, partnerFilter: CardFilter, into: string, partner?: ObjectId | null): void;
  /** Grant flashback to `target` (an instant/sorcery card in a graveyard) for
   * the rest of the turn, at a flashback cost equal to its mana cost
   * (Snapcaster Mage), or at `cost` when given (Archmage's Newt's {0}). */
  grantFlashback(target: TargetRef, cost?: string): void;
  /** See the `"grant-flashback-all"` {@link EffectSpec}. */
  grantFlashbackAll(filter: CardFilter): void;
  /** See the `"grant-graveyard-keyword"` {@link EffectSpec}: `target` when
   * given, else each card in your graveyard matching `filter`. */
  grantGraveyardKeyword(target: TargetRef | undefined, filter: CardFilter | undefined, grant: GraveyardKeywordGrant): void;
  /** Let this effect's controller cast `target` (a card in a graveyard)
   * from there this turn — see the `grant-graveyard-cast` effect. */
  grantGraveyardCast(target: TargetRef): void;
  /** `a` and `b` (both creatures) fight; with `oneSided` only `a` deals,
   * to a creature or a planeswalker. */
  fight(a: TargetRef, b: TargetRef, oneSided: boolean): void;
  /** Counter a target spell on the stack — into its owner's hand instead
   * of their graveyard with `into: "hand"`. */
  counterSpell(
    target: TargetRef,
    into?: "hand" | "exile",
    lockSource?: boolean,
  ): {
    readonly countered: boolean;
    /** The ability's source, still the permanent it was as the ability went
     * on the stack (rule 400.7). */
    readonly sourcePermanent?: ObjectId;
  };
  /** What a `for-each-on-stack` goes over, bottom to top: an object once per
   * copy it stands for, what's resolving left out. */
  onTheStack(spells: boolean, abilities: boolean, whose: "you" | "opponent" | undefined): readonly ObjectId[];
  /** `player` gains control of `target` — see the `"gain-control"`
   * {@link EffectSpec}. */
  gainControl(
    target: TargetRef,
    untilEndOfTurn: boolean,
    player: PlayerId,
    whileSource?: boolean,
    whileSourceTapped?: boolean,
    whileYouControlSource?: boolean,
    until?: UntilPointDuration,
  ): void;
  /** See the `"gain-control-all"` {@link EffectSpec}: `who` a player, or
   * each permanent's own owner; `controlledBy` keeps only what that player
   * controls. */
  gainControlAll(
    filter: CardFilter,
    untilEndOfTurn: boolean,
    who: PlayerId | "owner",
    exceptSource: boolean,
    controlledBy?: PlayerId,
  ): void;
  /** See the `"rotate-control"` {@link EffectSpec}. */
  rotateControl(filter: CardFilter, direction: "left" | "right", exceptSource: boolean): void;
  /** See the `"exchange-control"` {@link EffectSpec}: whether they were
   * exchanged. */
  exchangeControl(first: TargetRef, second: TargetRef): boolean;
  /** See the `"exchange-control-all"` {@link EffectSpec}. */
  exchangeControlAll(filter: CardFilter, other: PlayerId, untilEndOfTurn: boolean): void;
  /** `target` gains "This creature can't be sacrificed" — see the
   * `"cant-be-sacrificed"` {@link EffectSpec}. */
  grantCantBeSacrificed(target: TargetRef, duration: PtDuration): void;
  /** See the `"block-additional"` {@link EffectSpec}. */
  grantBlockAdditional(target: TargetRef, amount: number | "any", duration: PtDuration): void;
  /** `target` (a player) mills `amount` cards. */
  mill(target: TargetRef, amount: number): void;
  /** See the `"shuffle-graveyard-into-library"` {@link EffectSpec}: how
   * many objects the player put into their library (a token stack each
   * token in it). */
  shuffleZonesIntoLibrary(
    target: TargetRef,
    zones: readonly ("hand" | "graveyard" | "permanents")[],
    filter?: CardFilter,
  ): number;
  /** See the `"skip-next-untap"` {@link EffectSpec}. */
  skipNextUntap(target: TargetRef, filter: CardFilter): void;
  /** See the `"skip-untap-step"` {@link EffectSpec}: one more of `player`'s
   * untap steps to skip. */
  skipUntapStep(player: PlayerId): void;
  /** See the `"skip-step"` {@link EffectSpec}: one more of `player`'s steps
   * of this kind to skip, or — `thisTurn` — this turn's, if they're active. */
  skipStep(player: PlayerId, step: "untap" | "upkeep" | "draw" | "combat", thisTurn: boolean, allOfNextTurn?: boolean): void;
  /** See the `"exile-from-library"` {@link EffectSpec}: the top `top` cards
   * of `target`'s library, or all of it but the bottom `allBut`. */
  exileFromLibrary(
    target: TargetRef,
    count: { readonly top: number } | { readonly allBut: number },
    withCounters?: { readonly kind: string; readonly amount: number },
    linked?: boolean,
    faceDown?: true | "looked",
  ): void;
  /** See the `"turn-exiled-face-up"` {@link EffectSpec}. */
  turnExiledFaceUp(): void;
  /** Number of battlefield permanents matching `filter`, evaluated with the
   * effect's controller as "you" (for an `EffectAmount` `{ countOf }`) —
   * or `you`, given one (a `countOf`'s `forTarget`). */
  countMatching(filter: CardFilter, except?: readonly ObjectId[], you?: PlayerId): number;
  /** See the aggregate {@link EffectAmount}: the raw sum, maximum or count,
   * with `except` left out one permanent apiece, from the effect's
   * controller's side — or `you`'s, given one (its `forTarget`). */
  aggregate(spec: AggregateSpec, except: readonly ObjectId[], you?: PlayerId): number;
  /** See the `"return-from-graveyard"` {@link EffectSpec} — from the effect's
   * controller's graveyard.
   * Returns `true` when it stopped to ask an "as this enters" choice first
   * (rule 614.12 — a Clone's copy): nothing has moved, and the step runs
   * again once it's answered. */
  returnFromGraveyard(
    filter: CardFilter,
    destination: "battlefield" | "hand",
    count: number | "all",
    enterTapped: boolean,
    withCounters?: { readonly kind: string; readonly amount: number },
    /** Every graveyard, and how the cards enter — the spec's `from` and
     * `enterAs`. */
    opts?: {
      readonly allGraveyards?: boolean;
      /** Each card under its owner's control, not the controller's. */
      readonly underOwners?: boolean;
      readonly handToo?: boolean;
      readonly enterAs?: EnterTypes;
      /** See the spec's `attachedTo`; `null` for nothing there. */
      readonly attachTo?: EnterAttachHost;
      /** See the spec's `upTo` and `totalManaValueAtMost`. */
      readonly upTo?: boolean;
      readonly totalManaValueAtMost?: number;
    },
  ): boolean;
  /** `target` (a player) discards `amount` cards — only cards matching
   * `filter`, when there is one. */
  discardCards(
    target: TargetRef,
    amount: number,
    random?: boolean,
    unlessOne?: CardFilter,
    anyNumber?: boolean,
    filter?: CardFilter,
  ): void;
  /** See the `discard-chosen` {@link EffectSpec}: `target` (a player) reveals
   * their hand (or the controller looks at it), the controller chooses, and
   * that player discards the card chosen. `upTo` is "up to that many" (0:
   * only a look — the `look-at-hand` spec). */
  discardChosen(
    target: TargetRef,
    filter: CardFilter | undefined,
    lookOnly: boolean,
    optional: boolean,
    upTo?: number,
    /** See the effect's `chooser`, `destination`, `unlinked` and `alsoFrom`. */
    to?: {
      readonly chooser?: PlayerId;
      readonly destination?: "exile" | "library-top" | "library-bottom" | "battlefield";
      readonly unlinked?: true;
      readonly untilSourceLeaves?: true;
      readonly alsoFrom?:
        | { readonly zone: "graveyard"; readonly filter?: CardFilter }
        | { readonly zone: "library-top" };
      readonly mayCast?: ExilePermission;
      /** See the effect's `reveals` and `picks`, read as it resolves. */
      readonly reveals?: { readonly count: number; readonly picks: number };
    },
  ): void;
  modifyPt(
    target: TargetRef,
    power: number,
    toughness: number,
    duration: PtDuration,
  ): void;
  /** See the `grant-protection` {@link EffectSpec}: the target, and every
   * other battlefield permanent matching `filter` as it resolves (from the
   * controller's side), all with one timestamp. `from` is fixed already. */
  grantProtection(
    on: { readonly target?: TargetRef; readonly filter?: CardFilter; readonly exceptSource?: true },
    from: ProtectionQualities,
    duration: PtDuration,
  ): void;
  /** See the `grant-toxic` {@link EffectSpec}: `on` is the target, or a
   * filter over the battlefield read as it resolves. */
  grantToxic(on: TargetRef | CardFilter, amount: number, duration: PtDuration, exceptSource?: boolean): void;
  /** +power/+toughness to every battlefield permanent matching `filter`. */
  modifyPtAll(
    filter: CardFilter,
    power: number,
    toughness: number,
    duration: PtDuration,
    exceptSource?: boolean,
    scopeTo?: PlayerId,
  ): void;
  /** Grant `keyword` to every battlefield permanent matching `filter`. */
  grantKeywordAll(
    filter: CardFilter,
    keyword: Keyword,
    duration: PtDuration,
    exceptSource?: boolean,
    /** `filter` read from this player's side (`controlledByTarget`). */
    scopeTo?: PlayerId,
  ): void;
  /** See the `"double-pt-all"` {@link EffectSpec}. */
  doublePtAll(filter: CardFilter, duration: PtDuration, powerOnly: boolean, exceptSource: boolean): void;
  /** See the `"switch-pt"` {@link EffectSpec}: one permanent, or each
   * matching a filter. */
  switchPt(what: TargetRef | CardFilter, duration: PtDuration): void;
  /** See the `"grant-player-hexproof"` {@link EffectSpec}. */
  grantPlayerHexproof(who: PlayerScope): void;
  /** See the `"grant-spells-this-turn"` {@link EffectSpec}. */
  grantSpellsThisTurn(grant: Omit<SpellGrantThisTurn, "player" | "usedBy">): void;
  /** See the `"keep-total-power"` {@link EffectSpec}: ask `player` which of
   * their permanents matching `filter` to keep, total power at most `max`.
   * `false` when they control none, and nothing was asked. */
  askKeepTotalPower(player: PlayerId, filter: CardFilter, max: number, prompt: string): boolean;
  /** `sacrifice-all-but`'s choice: `player` keeps `keep` of the permanents
   * matching `filter` they control (`upTo`: as many as `keep`). `true` when
   * it asked; otherwise what's kept — all of them, when there's no choice —
   * is waiting for `takeKept`. */
  askKeep(player: PlayerId, filter: CardFilter, keep: number, upTo: boolean): boolean;
  /** What the last `askKeepTotalPower` answer kept, taken (and cleared). */
  takeKept(): readonly ObjectId[];
  /** See the `"keep-total-power"` {@link EffectSpec}: each of `players`
   * sacrifices every permanent matching `filter` they control but `kept` (a
   * token stack once per member kept), at once. */
  sacrificeAllExcept(players: readonly PlayerId[], filter: CardFilter, kept: readonly ObjectId[]): void;
  /** See the `"separate-into-piles"` {@link EffectSpec}: the objects to
   * separate, as they're gathered (a library's revealed, a token stack's
   * tokens singled out), and who has seen them all — everyone for a reveal,
   * the separator for a look. */
  beginPiles(
    objects: ResolvedPileObjects,
    separator: PlayerId,
  ): { readonly objects: readonly ObjectId[]; readonly lookers: readonly PlayerId[] };
  /** Ask `separator` to separate `objects` into two piles. `false` when
   * they've left the game, and nothing was asked. */
  askSeparatePiles(
    separator: PlayerId,
    objects: readonly ObjectId[],
    chooser: PlayerId,
    faceDown: boolean,
    fates: { readonly chosen: PileFateWord; readonly rest?: PileFateWord },
  ): boolean;
  /** The piles the last `askSeparatePiles` answer made, taken (and cleared). */
  takePiles(): readonly (readonly ObjectId[])[] | undefined;
  /** Show the piles (a face-up pile revealed) and ask `chooser` to choose
   * one. `false` when they've left the game, and nothing was asked. */
  askChoosePile(
    chooser: PlayerId,
    separator: PlayerId,
    piles: readonly (readonly ObjectId[])[],
    faceDown: boolean,
    lookers: readonly PlayerId[],
    fates: { readonly chosen: PileFateWord; readonly rest?: PileFateWord },
  ): boolean;
  /** The pile the last `askChoosePile` answer chose, taken (and cleared). */
  takeChosenPile(): number | undefined;
  /** Carry out the piles' fates: `chosen`'s on the chosen pile, then
   * `rest`'s on the other — each as one instruction, still only on objects
   * where they were separated (rule 400.7). */
  finishPiles(chosenPile: readonly ObjectId[], otherPile: readonly ObjectId[], chosen: PileFate | undefined, rest: PileFate | undefined): void;
  /** See the `"choose-among-targets"` {@link EffectSpec}: ask `chooser` to
   * pick exactly `count` of `objects` (more than `count` of them, all
   * targets still legal), the answer waiting for `takeKept`. `false` when
   * they've left the game, and nothing was asked. */
  askChooseAmong(chooser: PlayerId, objects: readonly ObjectId[], count: number, prompt: string): boolean;
  /** `put-on-libraries`' `"owner-chooses"`: ask `owner` which of the
   * permanents among `objects` they own (tokens aside, which cease to exist
   * in a library — rule 111.8) go on the bottom of their library, the rest
   * on top; the answer waits for `takeKept`. `false` when they own none of
   * them, and nothing was asked. */
  askLibraryEnds(owner: PlayerId, objects: readonly ObjectId[]): boolean;
  /** See the `"put-on-libraries"` {@link EffectSpec}: put each card on the
   * top or bottom of its owner's library, all at once (one leave event),
   * in the order given — then the orders still to ask (rule 401.4): each
   * owner's cards now on one end of their library, in turn order from the
   * active player, top before bottom, only where the order is a choice. */
  putOnLibrariesTogether(
    placements: readonly { readonly object: ObjectId; readonly position: "top" | "bottom" | "shuffle" }[],
  ): readonly LibraryOrderStep[];
  /** Ask `step.player` the order of `step.cards` on that end of their
   * library — those still there. `false` when there was nothing to ask. */
  askLibraryOrder(step: LibraryOrderStep): boolean;
  /** Ask `player` to arrange their whole graveyard (`reorder-graveyard`). */
  reorderGraveyard(player: PlayerId): void;
  /** Where an object is now: its zone change count (rule 400.7), or
   * `undefined` once it has ceased to exist. */
  zoneChangeCountOf(object: ObjectId): number | undefined;
  /** See the `"counters-distributed"` {@link EffectSpec}: ask the effect's
   * controller to choose up to `max` of the battlefield permanents matching
   * `filter` from `side`'s side (the controller's when absent) — a token
   * stack up to once per token — the answer waiting for `takeKept`. `false`
   * when nothing matches (or they've left the game), and nothing was asked. */
  askChoosePermanentsKept(filter: CardFilter, max: number, prompt: string, side?: PlayerId): boolean;
  /** `players` in turn order from the active player (rule 101.4). */
  apnap(players: readonly PlayerId[]): readonly PlayerId[];
  /** See the `"encore"` {@link EffectSpec}. */
  encore(): void;
  /** The colour this effect's source named as it entered, or `undefined` —
   * see `GameObject.chosenOnEnter` and `add-mana`'s `"chosen"`. */
  chosenColorOfSource(): ManaType | undefined;
  /** The number chosen as the source entered, if one was — see the
   * `chosenNumber` {@link EffectAmount}. */
  chosenNumberOfSource(): number | undefined;
  /** The colours in the effect's controller's commanders' colour identity —
   * see `PlayerState.commanderIdentity`. */
  commanderColors(): readonly ManaType[];
  /** See the `"goad"` {@link EffectSpec}: goad each creature `player`
   * controls. */
  goadCreaturesOf(player: PlayerId, forGame: boolean): void;
  /** See the `"goad"` {@link EffectSpec}: goad one creature — nothing, if
   * `target` isn't a creature on the battlefield. */
  goadCreature(target: TargetRef, forGame: boolean): void;
  /** See the `"goad"` {@link EffectSpec}: goad every creature matching
   * `filter`, from the effect's controller's side. */
  goadMatching(filter: CardFilter, forGame: boolean): void;
  /** See the `"suspect"` {@link EffectSpec}. */
  suspect(target: TargetRef): void;
  /** See the `"unsuspect"` {@link EffectSpec}: `target`, or every permanent
   * matching `filter`. */
  unsuspect(target: TargetRef | { readonly filter: CardFilter }): void;
  /** See the `"become-saddled"` {@link EffectSpec}. */
  becomeSaddled(target: TargetRef): void;
  /** See the `"attack-requirement"` {@link EffectSpec}: the rule, its
   * targets resolved. */
  addAttackRequirement(rule: {
    readonly filter: CardFilter;
    readonly otherThanYou: boolean;
    readonly object?: ObjectId;
    readonly controlledBy?: PlayerId;
    readonly attacks?: PlayerId | ObjectId;
    readonly duration?: "this-turn" | "that-players-next-turn" | "controllers-next-combat" | "controllers-next-turn";
  }): void;
  /** See the `"impulse-exile"` {@link EffectSpec}. */
  impulseExile(
    amount: number,
    duration: ImpulseDuration,
    castOnly: boolean,
    opts?: {
      /** Whose libraries (the controller's alone when absent). */
      readonly players?: readonly PlayerId[];
      /** Each card's owner may play it, rather than the controller. */
      readonly ownerPlays?: boolean;
      readonly choose?: number;
      readonly yourTurnOnly?: boolean;
      readonly gate?: StaticCondition;
      readonly filter?: CardFilter;
      readonly free?: { readonly filter?: CardFilter; readonly only?: boolean };
      readonly payLifeManaValue?: true;
      readonly whileSource?: boolean;
      readonly oncePerTurn?: boolean;
      /** Exiled face down, for the controller's eyes only (rule 406.3). */
      readonly faceDown?: boolean;
      readonly spendAs?: SpendAs;
      /** See the effect's `linked`. */
      readonly linked?: boolean;
    },
  ): void;
  /** See the `"ward"` {@link EffectSpec}. */
  ward(cost: WardCost): void;
  /** See the `"player-effect"` {@link EffectSpec}. */
  addPlayerEffect(effect: PlayerEffect): void;
  /** How many spells `player` has cast this turn so far (`castsLeft`). */
  spellsCastThisTurn(player: PlayerId): number;
  /** Flip a coin for this effect's controller (see the `"flip-coin"`
   * {@link EffectSpec}): `true` if they won the flip. */
  flipCoin(): boolean;
  /** A clash is over (see the `"clash"` {@link EffectSpec}): a `clashed`
   * event for each player who clashed, saying whether they won. */
  clashed(results: readonly { readonly player: PlayerId; readonly won: boolean }[]): void;
  /** Roll `count` `sides`-sided dice for the controller (rule 706), on the
   * seeded stream; returns the result — the natural total plus `modifier` —
   * and keeps the roll for `lastRoll`. */
  rollDice(sides: number, count: number, modifier: number): number;
  /** The controller's last roll: each die's natural result, and the total. */
  lastRoll(): { readonly results: readonly number[]; readonly total: number } | undefined;
  /** See the `"prohibit"` {@link EffectSpec}: `players` can't cast spells
   * (every one, or those matching a filter) and/or activate abilities this
   * turn, or `object`'s activated abilities can't be activated. */
  prohibit(
    players: readonly PlayerId[],
    object: TargetRef | undefined,
    spells: boolean | { readonly filter: CardFilter; readonly label: string; readonly you: PlayerId },
    abilities: boolean,
    /** An `object`'s abilities prohibition until the controller's next turn
     * rather than this turn. */
    untilYourNextTurn?: boolean,
  ): void;
  /** See the `"prohibit"` {@link EffectSpec}'s `regeneration`: `target`, or
   * every creature this resolution has dealt damage to so far, can't be
   * regenerated this turn (rule 701.19c). */
  prohibitRegeneration(target: TargetRef | "dealt-damage-this-way"): void;
  /** See the `"prohibit"` {@link EffectSpec}'s `lands`: `players` can't play
   * lands this turn (rule 305.2). */
  prohibitLandPlays(players: readonly PlayerId[]): void;
  /** See the `"prohibit"` {@link EffectSpec}'s `monarch`: `players` can't
   * become the monarch this turn. */
  prohibitMonarch(players: readonly PlayerId[]): void;
  /** See the `"restrict"` {@link EffectSpec}: `target`'s restrictions until
   * end of turn, or with `filter` a turn-wide rule. */
  restrict(
    target: TargetRef | undefined,
    filter: CardFilter | undefined,
    restrictions: readonly CombatRestriction[],
    /** A `target`'s: this turn when omitted. */
    duration?: PtDuration,
    cantBeBlockedBy?: CardFilter,
    /** The one attacker `target` can't block (`cantBlockAttacker`). */
    cantBlock?: TargetRef,
    /** A `filter`'s scope: read from `scopeTo`'s side (`controlledByTarget`),
     * leaving out `except` (`exceptTarget`), or fixed `asItResolves`. */
    scope?: { readonly scopeTo?: PlayerId; readonly except?: ObjectId; readonly asItResolves?: boolean },
  ): void;
  /** See the `"grant-static"` {@link EffectSpec}: `target`, or with `filter`
   * every permanent matching it now. */
  grantStatic(
    target: TargetRef | undefined,
    filter: CardFilter | undefined,
    ability: StaticAbility,
    duration: PtDuration,
  ): void;
  /** See the `"detain"` {@link EffectSpec}. */
  detain(target: TargetRef): void;
  /** See the `"block-if-able"` {@link EffectSpec}: `attacker` undefined is
   * "blocks this turn if able" (any attacker). */
  blockIfAble(target: TargetRef, attacker: TargetRef | undefined, thisCombat: boolean): void;
  /** See the `"attack-despite-defender"` {@link EffectSpec}. */
  attackDespiteDefender(target: TargetRef | undefined, filter: CardFilter | undefined): void;
  /** See the `"damage-by-toughness"` {@link EffectSpec}. */
  damageByToughness(target: TargetRef): void;
  /** See the `"assigns-no-combat-damage"` {@link EffectSpec}. */
  assignsNoCombatDamage(target: TargetRef): void;
  /** See the `"assign-as-though-unblocked"` {@link EffectSpec}. */
  assignAsThoughUnblocked(target: TargetRef | undefined, filter: CardFilter | undefined, must: boolean): void;
  /** See the `"put-in-command-zone"` {@link EffectSpec}. */
  putInCommandZone(target: TargetRef): void;
  /** See the `"exchange-life-stat"` {@link EffectSpec}. */
  exchangeLifeStat(target: TargetRef, player: PlayerId, stat: "power" | "toughness"): void;
  /** See the `"exchange-life-totals"` {@link EffectSpec}. */
  exchangeLifeTotals(first: PlayerId, second: PlayerId): void;
  /** See the `"unless"` {@link EffectSpec}. */
  unless(
    chooser:
      | number
      | "trigger-controller"
      | "trigger-player"
      | "you"
      | "active-player"
      | "any-player"
      | { readonly player: PlayerId },
    options: readonly BoundUnlessOption[],
    otherwise: EffectSpec,
  ): void;
  /** The mana cost an effect telling a player to pay `ref`'s would have them
   * pay (rule 107.3h), or `null` for an object with none (rule 118.6). */
  manaCostToPay(ref: TargetRef): string | null;
  /** Ask `player` an `"each-player-may"`'s question: a `choose-modes`
   * decision of theirs, or nothing at all when there's nothing they could
   * take. */
  askEachPlayerMay(
    player: PlayerId,
    spec: Extract<EffectSpec, { kind: "each-player-may" }>,
    /** Only ask: the answer is recorded and the effect done later, by
     * {@link applyEachPlayerMayAs} (rule 101.4). */
    askOnly?: boolean,
  ): void;
  /** `effect` as `player`'s own — what they said yes to in an
   * `"each-player-may"` asked with `askOnly`. */
  applyEachPlayerMayAs(player: PlayerId, effect: EffectSpec): void;
  /** Rule 101.4: hold the discards and sacrifices the players of an
   * `"each-player-may"` choose until every one of them has chosen
   * (`GameState.heldChoices`) — a no-op when already held. */
  holdChoices(): void;
  /** Whether choices are held right now — by an enclosing `"each-player-may"`
   * or scoped discard, which releases them itself. */
  choicesHeld(): boolean;
  /** Every player has chosen: do what they chose, at once. */
  releaseHeldChoices(): void;
  /** Whether `player` took what an `"each-player-may"` that began at event
   * `since` offered them — their first answer for this source since. */
  tookEachPlayerMay(player: PlayerId, since: number): boolean;
  /** The permanent `player` sacrificed in answer to an `"each-player-may"`
   * begun at event `since` — the first they sacrificed after their answer —
   * or `undefined` when they sacrificed none. */
  sacrificedForEachPlayerMay(player: PlayerId, since: number): ObjectId | undefined;
  /** The sequence number the next event will have. */
  nextEventSeq(): number;
  /** Where this context's "this way" begins: the event sequence number
   * every `thisWay` read counts from. */
  thisWaySince(): number;
  /** Begin "this way" at event `at` for the rest of the resolution — a
   * `repeat`'s pass (`GameState.resolutionSince`, which every context made
   * from here on, a resumed one too, reads) — and this context, reading
   * from there. */
  scopeThisWay(at: number): ResolutionContext;
  /** See the `"populate"` {@link EffectSpec}. */
  populate(): void;
  /** See the `"amass"` {@link EffectSpec}. `onto`: the Army already
   * chosen. */
  amass(amount: number, creatureType: string, onto?: ObjectId, player?: PlayerId): void;
  /** See the `"monstrosity"` {@link EffectSpec}. */
  monstrosity(amount: number): void;
  /** See the `"renown"` {@link EffectSpec}. */
  renown(amount: number): void;
  /** See the `"add-counter-all"` {@link EffectSpec}. */
  addCounterAll(
    filter: CardFilter,
    counter: string,
    amount: number | "own-toughness",
    exceptSource?: boolean,
    /** Whose side `filter` is read from — see `controlledByTarget`. */
    scopeTo?: PlayerId,
    /** Who puts them — the effect's controller when absent. */
    by?: PlayerId,
    /** One object spared — see `exceptTarget`. */
    except?: ObjectId,
  ): void;
  /** See the `"double-counters-all"` {@link EffectSpec}. */
  doubleCountersAll(filter: CardFilter, counterKind: string): void;
  /** `by` is who puts them — the effect's controller when absent;
   * `training` marks training's counter (702.149c). */
  addCounter(target: TargetRef, counter: string, amount: number, by?: PlayerId, training?: boolean): void;
  /** Proliferate — see the `"proliferate"` {@link EffectSpec}. */
  proliferate(then: EffectSpec | null): void;
  /** Time travel — see the `"time-travel"` {@link EffectSpec}. */
  timeTravel?(): void;
  /** Time counters on exiled cards, which have suspend — see the
   * `"give-suspend"` {@link EffectSpec}. `target` is the card the spec's
   * `target` names, resolved; absent for the "exiled this way" form. */
  giveSuspend?(
    counters: number | "mana-value",
    options: { readonly filter?: CardFilter; readonly onlyWithSuspend?: true; readonly target?: TargetRef },
  ): void;
  /** "N mana in any combination of …" with too many splits to list as
   * modes: the controller says how many of each colour, as one decision
   * (`addManaChoice`). Absent on a bare context, which asks unit by unit. */
  splitMana?(ask: ManaSplitAsk): void;
  grantKeyword(target: TargetRef, keyword: Keyword, duration: PtDuration): void;
  /** See the `"incubate"` {@link EffectSpec}. */
  incubate(amount: number): void;
  /** See the `"remove-from-combat"` {@link EffectSpec}. */
  removeFromCombat(target: TargetRef): void;
  /** See the `"lose-keywords"` {@link EffectSpec}: one permanent, or every
   * one matching `filter`. */
  loseKeywords(
    on: TargetRef | CardFilter,
    keywords: readonly Keyword[],
    duration: PtDuration,
    scopeTo?: PlayerId,
    cantHave?: boolean,
  ): void;
  /** See the `"grant-triggered"` {@link EffectSpec}. */
  grantTriggered(
    target: TargetRef,
    ability: TriggeredAbility,
    duration: PtDuration,
  ): void;
  /** See the `"grant-triggered-all"` {@link EffectSpec}. */
  grantTriggeredAll(filter: CardFilter, ability: TriggeredAbility, duration: PtDuration): void;
  /** See the `"grant-activated"` {@link EffectSpec}. */
  grantActivated(target: TargetRef, ability: ActivatedAbility, duration: PtDuration): void;
  /** See the `"lose-abilities"` {@link EffectSpec}. */
  loseAbilities(
    target: TargetRef,
    opts: {
      readonly loseLandTypes: boolean;
      readonly activated: readonly ActivatedAbility[];
      readonly duration: PtDuration;
    },
  ): void;
  /** See the `"lose-abilities-all"` {@link EffectSpec}. */
  loseAbilitiesAll(filter: CardFilter, duration: PtDuration): void;
  /** See the `"grant-activated-all"` {@link EffectSpec}. */
  grantActivatedAll(filter: CardFilter, ability: ActivatedAbility, duration: PtDuration): void;
  /** `player` takes an extra turn after this one (Time Warp). */
  takeExtraTurn(player: PlayerId, skipUntapStep?: boolean, thatTurn?: ExtraTurnScope): void;
  /** `player` skips their next `count` turns (the `skip-turn` effect). */
  skipTurn(player: PlayerId, count: number): void;
  /** See the `"control-player"` {@link EffectSpec}. */
  controlPlayer(
    controlled: PlayerId,
    controller: PlayerId,
    during: "next-turn" | "next-combat",
    extraTurnAfter: boolean,
  ): void;
  /** See the `"choose-combat"` {@link EffectSpec}. */
  chooseCombat(choice: Omit<CombatChoice, "chooser">): void;
  /** See the `"gift"` {@link EffectSpec}. */
  giveGift(gift: GiftKind): void;
  /** `player` wins the game, unless they can't — see the `"win-game"`
   * {@link EffectSpec}. */
  winGame(player: PlayerId): void;
  /** Each of `players` loses the game, at once, unless they can't — see the
   * `"lose-game"` {@link EffectSpec}. */
  loseGame(players: readonly PlayerId[]): void;
  /** Whether the game has ended — once it has, nothing more of a resolution
   * happens (rule 104.1). */
  gameOver(): boolean;
  /** Storm — copy the spell `sourceId` for each earlier spell its controller
   * cast this turn. */
  storm(sourceId: ObjectId): void;
  /** Cascade off `sourceId` (the cascade spell) for `controller`. */
  /** Exile off the top until a card cascade may cast (rule 702.85a) — `null`,
   * with everything already on the bottom, when there's none it could cast. */
  cascade(controller: PlayerId, sourceId: ObjectId): CascadeFound | null;
  /** Cast what cascade found, or not, and put the rest on the bottom. */
  finishCascade(finish: CascadeFinish): void;
  /** Craft's return (rule 702.167a) — see the `craft-return` effect.
   * `true` when it stopped first to ask an "as this enters" choice, having
   * moved nothing — try again once that's answered. */
  craftReturn(): boolean;
  /** Discover's exiling (rule 701.57a): until a nonland card with mana value
   * `amount` or less, or the library runs out. */
  discover(amount: number): DiscoverFound;
  /** Discover's tail: the discovered card to hand if it wasn't cast, the
   * rest to the bottom in a random order, then `discovered` (701.57b). */
  finishDiscover(found: DiscoverFound): void;
  /** Copy the spell at `TargetRef` on the stack — see the `copy-spell`
   * {@link EffectSpec}. */
  copySpell(target: TargetRef, newTargets: boolean, controller?: PlayerId, change?: SpellCopyChange): void;
  /** Change the targets of the spell or ability at `TargetRef` on the stack,
   * this effect's controller choosing — see the `change-targets`
   * {@link EffectSpec}. */
  changeTargets(target: TargetRef, how: "change" | "change-one" | "choose-new", toSource: boolean, optional: boolean): void;
  /** The spell whose casting fired this triggered ability, as it is on the
   * stack or as it last was there (rule 608.2h); `null` if nothing cast one. */
  triggerSpell(): SpellSnapshot | null;
  /** Put a copy of `spell`, the trigger's spell (or `original`, when the
   * engine captured it — see `copy-spell`'s `spell`), onto the stack —
   * every target of it `retargetTo` if given (rule 707.10e). `false` when
   * nothing was copied: `retargetTo` isn't a legal target for each of its
   * targets. */
  copyTriggerSpell(
    spell: SpellSnapshot,
    opts: {
      readonly newTargets: boolean;
      readonly retargetTo?: TargetRef;
      readonly original?: ObjectId;
      /** Who controls the copy — the effect's controller when omitted. */
      readonly controller?: PlayerId;
      /** Its exceptions and what it gains (`copy-spell`'s `except`, `gains`). */
      readonly change?: SpellCopyChange;
      /** Whose side `retargetTo` is judged legal from — the copy's controller
       * when omitted. */
      readonly caster?: PlayerId;
      /** Paid first, or there's no copy. */
      readonly payEach?: string;
    },
  ): boolean;
  /** See the `copy-ability` {@link EffectSpec}: copy the ability object
   * `target` names, or with `"trigger-ability"` the one whose activation
   * fired this trigger. */
  copyAbility(target: TargetRef | "trigger-ability", newTargets: boolean): void;
  /** See `copy-spell`'s `forEachItCouldTarget`: copy `spell` once for each
   * permanent it could target, in the order its controller chooses. */
  copyTriggerSpellForEach(spell: SpellSnapshot, each: CopyForEach, copier: PlayerId): void;
  /** See the `exile-spell-as-it-resolves` {@link EffectSpec}: mark the
   * trigger's spell. */
  exileTriggerSpellAsItResolves(returnAtNextEndStep: boolean, plotted: boolean): void;
  /** The controller may collect evidence `amount` — see the
   * `collect-evidence` effect. */
  collectEvidence(amount: number, then: EffectSpec | undefined): void;
  /** The source, a Case, becomes solved — see the `solve` effect. */
  solveSource(): void;
  /** A card in exile becomes plotted — see the `become-plotted` effect. */
  becomePlotted(card: ObjectId): void;
  /** How many times the source's spell paid its multikicker or squad cost
   * (rule 702.157a), as it entered — as it last existed there if it has
   * left; a spell on the stack (resolving, or a copy of one) reads its own
   * count; 0 for one not cast that way. */
  sourceTimesKicked(): number;
  /** The answer to its rule 616.1 choice — see `applyFirst` there. */
  finishExiledAsItResolves(spell: ObjectId, feather: boolean): void;
  /** Shuffle the controller's library — or `player`'s — see the
   * `shuffle-library` {@link EffectSpec}. */
  shuffleLibrary(player?: PlayerId): void;
  /** The resolving spell's division of a divided amount — see
   * `GameObject.division`. Empty outside one. */
  readonly division: readonly number[];
  /** Queue an additional combat + main phase after this main phase (Aggravated
   * Assault). */
  additionalCombat(afterThisPhase?: { readonly withMain: boolean }): void;
  /** See the `end-the-turn` {@link EffectSpec}. */
  endTurnOrCombat(what: "turn" | "combat"): void;
  /** See the `limit-blockers` {@link EffectSpec}. */
  limitBlockers(players: readonly PlayerId[], most: number): void;
  /** See the `additional-upkeep-steps` {@link EffectSpec}. */
  additionalUpkeeps(count: number): void;
  /** See the `additional-land-drop` {@link EffectSpec}. */
  additionalLandDrops(amount: number): void;
  /** Untap every battlefield permanent matching `filter`. */
  untapAll(filter: CardFilter, scopeTo?: PlayerId, exceptSource?: boolean): void;
  /** See the `"exert"` {@link EffectSpec}. */
  exert(target: TargetRef, asItAttacks: boolean): void;
  tapAll(
    filter: CardFilter,
    doesntUntapNext?: boolean,
    onlyDoesntUntap?: boolean,
    scopeTo?: PlayerId,
    untapStepOfScope?: boolean,
    doesntUntapSteps?: number,
  ): void;
  /** See the `"phase-out"` {@link EffectSpec}: `target` (an object ref), or
   * the permanent the source is attached to, or every permanent matching
   * `filter` — at once. */
  phaseOut(what: {
    readonly target?: TargetRef;
    readonly attachedToSource?: boolean;
    readonly filter?: CardFilter;
    readonly scopeTo?: PlayerId;
    readonly untilSourceLeaves?: boolean;
    readonly tappedOnReturn?: boolean;
  }): void;
  /** `target` becomes a creature — see the `"animate"` {@link EffectSpec}.
   * A `power` or `toughness` left out is left as it is. */
  animate(
    target: TargetRef,
    opts: {
      readonly power?: number;
      readonly toughness?: number;
      readonly addTypes: readonly CardType[];
      readonly setTypes?: readonly CardType[];
      readonly addSubtypes: readonly string[];
      readonly setSubtypes?: readonly string[];
      readonly setColors?: readonly Color[];
      readonly addColors?: readonly Color[];
      readonly loseAbilities?: boolean;
      readonly keywords: readonly Keyword[];
      readonly duration: PtDuration;
    },
  ): void;
  /** `target` gains types and subtypes — see the `"add-types"`
   * {@link EffectSpec}. */
  addTypes(
    target: TargetRef,
    types: readonly CardType[],
    subtypes: readonly string[],
    duration: PtDuration,
    set?: {
      readonly setTypes?: readonly CardType[];
      readonly removeTypes?: readonly CardType[];
      readonly removeSubtypes?: readonly string[];
      readonly setSubtypes?: readonly string[];
      readonly addColors?: readonly Color[];
    },
  ): void;
  /** Every permanent matching `filter` becomes a creature (or just has its
   * base P/T set) — see the `"animate-all"` {@link EffectSpec}. */
  animateAll(
    filter: CardFilter,
    opts: {
      readonly power: number;
      readonly toughness: number;
      readonly addTypes: readonly CardType[];
      readonly addSubtypes: readonly string[];
      readonly keywords: readonly Keyword[];
      readonly duration: PtDuration;
      readonly exceptSource?: boolean;
      readonly scopeTo?: PlayerId;
    },
  ): void;
  /** `player` manifests (or cloaks) the top card of their library — see the
   * `"manifest"` {@link EffectSpec}; `library` is another player's library
   * it comes from (its `from`). */
  manifestTop(player: PlayerId, kind: "manifest" | "cloak", library?: PlayerId): void;
  /** Turn the permanent `target` face down — see the `"turn-face-down"`
   * {@link EffectSpec}. */
  turnFaceDown(target: TargetRef, as?: FaceDownAs): void;
  /** Turn the face-down permanent `target` face up — see the `"turn-face-up"`
   * {@link EffectSpec}. */
  turnFaceUp(target: TargetRef): void;
  /** Create `count` copies of the named token, controlled by `ctx.controller`. */
  createToken(
    token: string,
    count: number,
    who?: "target-controller" | PlayerScope,
    tapped?: boolean,
    sacrificeAtEndStep?: boolean,
    /** Keywords the new tokens gain until end of turn. */
    gainUntilEndOfTurn?: readonly Keyword[],
    /** The new tokens are goaded by the effect's controller for the rest of
     * the game. */
    goadedForGame?: boolean,
    /** Counters the effect's controller then puts on each new token. */
    thenCounters?: { readonly kind: string; readonly amount: number },
    /** The new tokens' base power and toughness, for an X/X token. */
    basePt?: readonly [number, number],
    /** The new tokens enter attacking (rule 508.4). */
    attacking?: ResolvedEnterAttacking,
    /** Each new token its own object, never folded into a token stack. */
    separate?: boolean,
    /** Exile them at the beginning of the next end step. */
    exileAtEndStep?: boolean,
    /** They attack this combat if able (until end of combat). */
    attacksThisCombat?: boolean,
    /** Keywords the new tokens gain with no end (not copiable). */
    gainKeywords?: readonly Keyword[],
    /** Each new token is created attached to this permanent — see the
     * effect's `attachedTo`; `null` for nothing there (none is created). */
    attachTo?: ObjectId | null,
  ): void;
  /** Create `count` token(s) that are copies of the permanent `of` — see the
   * `"create-token-copy"` {@link EffectSpec}. */
  createTokenCopy(
    of: ObjectId,
    count: number,
    opts: {
      /** Controller for the new token; defaults to the copied permanent's. */
      readonly under?: PlayerId;
      gainsHaste: boolean;
      exileAtEndStep: boolean;
      /** "Sacrifice it at the beginning of the next end step" (Kiki-Jiki) —
       * sacrificed rather than exiled, so dies-triggers see it go. */
      sacrificeAtEndStep?: boolean;
      notLegendary: boolean;
      basePt?: readonly [number, number];
      /** Keywords the copies gain until end of turn. */
      gainUntilEndOfTurn?: readonly Keyword[];
      /** Keywords and triggered abilities they gain with no end (not
       * copiable — see the effect's `gains`). */
      gainKeywords?: readonly Keyword[];
      gainTriggered?: readonly TriggeredAbility[];
      exceptions?: CopyExceptions;
      /** Copy the object as it is now, never as it last existed elsewhere. */
      asCard?: boolean;
      tapped?: boolean;
      attacking?: ResolvedEnterAttacking;
      exileAtEndOfCombat?: boolean;
      sacrificeAtEndOfCombat?: boolean;
      atYourNextEndStep?: boolean;
    },
  ): void;
  /** True if `condition` holds from the effect source's controller's
   * perspective — see the `"conditional"` {@link EffectSpec}. */
  conditionMet(condition: StaticCondition): boolean;
  /** Attach `attachment` (an Aura/Equipment) to `target` — `ctx.source`
   * when it's omitted. See the `"attach"` {@link EffectSpec}. */
  attach(target: TargetRef, attachment?: TargetRef, planeswalkerToo?: boolean): void;
  /** Unattach `target` — see the `"unattach"` {@link EffectSpec}. */
  unattach(target: TargetRef): void;
  /** The source becomes a Licid's Aura and is attached to `target` — see
   * the `"become-licid-aura"` {@link EffectSpec}. */
  becomeLicidAura(target: TargetRef, endCost: string): void;
  /** Attach every permanent matching `filter` (from the source's
   * controller's view) to `target`, each in turn — the `"attach"`
   * {@link EffectSpec}'s `attachments`. */
  attachAll(target: TargetRef, filter: CardFilter): void;
  /** The permanents matching `filter` (from the controller's side) that the
   * Aura or Equipment `attachment` could legally be attached to now (rules
   * 301.5, 303.4, 701.3a) — `another`: not the one it's attached to. See the
   * `attach` effect's `ontoChosen`. */
  attachableHosts(attachment: ObjectId, filter: CardFilter, another: boolean): readonly ObjectId[];
  /** Transform `target` (a transforming DFC permanent) — see the `"transform"`
   * {@link EffectSpec}. */
  transform(target: TargetRef): void;
  /** Flip `target` — see the `"flip"` {@link EffectSpec}. */
  flip(target: TargetRef): void;
  /** The permanents `targets` become copies of `of` — see the
   * `"become-copy"` {@link EffectSpec}, whose `ofCard`, `until` and
   * `exceptions` `opts` carries. */
  becomeCopy(
    targets: readonly ObjectId[],
    of: ObjectId,
    opts: {
      readonly ofCard?: boolean;
      readonly until?: "end-of-turn" | "next-end-step" | "your-next-turn";
      readonly exceptions?: CopyExceptions;
    },
  ): void;
  /** Pick an opponent at random for creature `target` to attack this combat
   * — see the `"attack-random-opponent"` {@link EffectSpec}. `false` when
   * there was nobody to pick; `true` otherwise, `target` gone included. */
  attackRandomOpponent(target: ObjectId, notAttackedLastCombat: boolean): boolean;
  /** The game becomes day or night (rule 726). */
  setDayNight(value: "day" | "night"): void;
  /** `who` becomes the monarch (rule 720). */
  becomeMonarch(who: PlayerScope | undefined, via?: "combat-damage"): void;
  /** One player becomes the monarch — a `become-monarch`'s target slot's. */
  becomeMonarchPlayer(player: PlayerId): void;
  /** See the `"take-initiative"` {@link EffectSpec}. */
  takeInitiative(who: PlayerScope | undefined, via?: "combat-damage"): void;
  /** See the `"mutate-merge"` {@link EffectSpec}: the resolving spell merges
   * with target 0. */
  mergeMutatingSpell(onTop: boolean): void;
  /** See the `"venture"` {@link EffectSpec}: the effect's controller
   * ventures. */
  venture(undercity: boolean): void;
  /** `player`'s speed increases by `amount` — see the `"increase-speed"`
   * {@link EffectSpec}. */
  increaseSpeed(player: PlayerId, amount: number): void;
  /** `player`'s speed, 0 for none — the `speed` {@link EffectAmount}. */
  speedOf(player: PlayerId): number;
  /** The Ring tempts the controller (rule 701.54): the emblem first, if they
   * have none. */
  ringTemptBegin(): void;
  /** `object` becomes the controller's Ring-bearer (rule 701.54a). */
  becomeRingBearer(object: ObjectId): void;
  /** The source and `object` become paired by soulbond (rule 702.95a),
   * if 702.95c and 702.95d allow it. */
  pairWithSource(object: ObjectId): void;
  /** The temptation completes: the count, the emblem's text, the event. */
  ringTemptFinish(): void;
  /** `who` gets `amount` energy counters (rule 122). */
  getEnergy(amount: number, who: PlayerScope | undefined): void;
  /** `player` gets `amount` counters of `counter` — see the
   * `"add-player-counters"` {@link EffectSpec}. */
  addPlayerCounters(player: PlayerId, counter: PlayerCounterKind, amount: number): void;
  /** How many counters of `counter` `player` has — see the `playerCounters`
   * {@link EffectAmount}. */
  playerCountersOf(player: PlayerId, counter: HeldPlayerCounter): number;
  /** Every kind of counter `player` has now (rule 122.1), energy included,
   * each with how many — `{}` for a player who has left the game. */
  playerCounterKinds(player: PlayerId): Readonly<Record<string, number>>;
  /** Take these counters off `player`, all at once (a `remove-counters`
   * effect's, rule 122.1): each kind at most as many as they have. */
  removePlayerCounters(player: PlayerId, counts: Readonly<Record<string, number>>): void;
  /** `owner` (the effect's controller when absent) gets an emblem (rule
   * 114) — see the `create-emblem` {@link EffectSpec}. */
  createEmblem(
    text: string,
    staticAbility: StaticAbility | undefined,
    triggered?: readonly TriggeredAbility[],
    owner?: PlayerId,
    moreStatics?: readonly StaticAbility[],
  ): void;
  /** Epic as the spell resolves — see the `epic` {@link EffectSpec}. */
  epic(): void;
  /** Prevent all combat damage this turn (Fog) — or only what sources
   * matching `by` would deal; with `toYou`, all damage they'd deal to the
   * effect's controller, combat or not (`prevent-damage-to-you`). */
  preventAllCombatDamage(by?: CardFilter, toYou?: boolean): void;
  /** Add a one-shot damage-prevention shield on `target` (a player or object)
   * for `amount` damage this turn — Healing Salve (ROADMAP Phase 11 EG-6). */
  preventDamage(target: TargetRef, amount: number | "all", combatOnly: boolean, redirectTo?: TargetRef): void;
  /** Ask for a source of damage (rule 609.7a) — the permanents and spells
   * on the stack matching `filter` — and apply `then` to it as target 0. See
   * the `"prevent-damage-from-chosen-source"` {@link EffectSpec}. */
  chooseDamageSource(filter: CardFilter, then: EffectSpec): void;
  /** A one-shot shield on `protect` against damage from `source` only — see
   * the `"prevent-damage-from-chosen-source"` {@link EffectSpec}. */
  preventDamageFrom(
    source: TargetRef,
    protect: TargetRef | "your-side" | "your-side-creatures" | "any",
    amount: number | "next-time" | "all",
    filter: CardFilter | undefined,
    gainLifePrevented: boolean,
    redirectTo?: TargetRef,
    more?: {
      readonly then?: EffectSpec;
      /** What `then` reads as its targets: the spell's own. */
      readonly thenTargets?: readonly (TargetRef | null)[];
      readonly redirectToSource?: "itself" | "controller";
      readonly gainLifeFrom?: CardFilter;
    },
  ): void;
  /** `target` becomes `colors` — see the `"become-color"` {@link EffectSpec}. */
  becomeColor(target: TargetRef, colors: readonly Color[], duration: PtDuration, inAddition?: boolean): void;
  /** `target`'s text has every `change.from` replaced by `change.to` — see
   * the `"change-text"` {@link EffectSpec}. */
  changeText(target: TargetRef, change: TextChange, duration: PtDuration): void;
  /** Raise a `choose-modes` decision — see the `modal` / `may` {@link EffectSpec}.
   * The chosen modes' effects are applied after the controller answers.
   * `onDecline` (a `may` effect's `else` only) applies when zero modes end up
   * chosen. */
  chooseModes(
    minModes: number,
    maxModes: number,
    modes: readonly ModeOption[],
    onDecline?: EffectSpec,
    /** A mana cost the chooser must pay to pick a mode — see `may.cost`. */
    cost?: string,
    /** Offer only the modes this ability hasn't had chosen this turn — see
     * `modal`'s `notChosenThisTurn` and `may`'s `oncePerTurn` — or, `"ever"`,
     * as long as its object has been on the battlefield (`notChosenBefore`). */
    notChosenThisTurn?: boolean | "ever",
    /** The rest of a `may`'s cost: life and energy, as numbers, and energy
     * paid in a chosen amount (`may.costEnergyX`). */
    otherCost?: {
      readonly life?: number;
      readonly energy?: number;
      readonly maxX?: number;
      readonly energyX?: "one-or-more" | "any";
      /** `cost` paid a chosen number of times — `may.costTimes`. */
      readonly costTimes?: true;
    },
    /** The player the question is about — see `may`'s `aboutThatPlayer`. */
    about?: PlayerId,
    /** The colour `cost`'s X is paid in — see `may`'s `xColor`. */
    xColor?: Color,
  ): void;
  /** Scry (`surveil: false`) or surveil (`surveil: true`) `amount` cards;
   * apply `then` afterwards. See the `"scry"` / `"surveil"` {@link EffectSpec}. */
  scry(amount: number, surveil: boolean, then: EffectSpec | undefined): void;
  /** See the `"put-onto-battlefield"` {@link EffectSpec}.
   * Returns `true` when it stopped to ask an "as this enters" choice first
   * (rule 614.12 — a Clone's copy): nothing has moved, and the step runs
   * again once it's answered. */
  putOntoBattlefield(
    target: TargetRef,
    /** Whose control it enters under, when that isn't its owner's — the
     * effect's controller for "under your control", or another player. */
    under: PlayerId | undefined,
    enterTapped: boolean,
    withCounters?: { readonly kind: string; readonly amount: number },
    exileIfItWouldLeave?: boolean | "ability",
    /** It enters transformed (`true`), or flipped (`"flipped"` — rule 710). */
    transformed?: boolean | "flipped",
    /** The types it enters with — see the effect's `setTypes` and
     * `addSubtypes`. */
    types?: EnterTypes,
    /** "…tapped and attacking" — see the effect's `attacking`. */
    attacking?: ResolvedEnterAttacking,
    /** What it enters attached to — see the effect's `attachedTo`; `null`
     * for nothing there. */
    attachTo?: EnterAttachHost,
  ): boolean;
  /** See the `"search-library"` {@link EffectSpec}. */
  searchLibrary(
    player: PlayerId | null,
    filter: CardFilter,
    destination: Extract<EffectSpec, { kind: "search-library" }>["destination"],
    min: number,
    max: number,
    enterTapped: boolean,
    restDestination?: "hand" | "battlefield",
    reveal?: boolean,
    zones?: SearchZones,
    together?: ResolvedSearchTogether,
    /** A `search-library`'s `attachedToSource` (the source, or `null` once
     * it has left — nothing can be attached to it) or `attachedTo`. */
    attachTo?: EnterAttachHost,
    /** Its `whose` resolved (`owner`), `all`, `playable` and `then`. */
    more?: SearchMore,
  ): void;
  /** See the `"reveal-top"` {@link EffectSpec}. `player` is whose library
   * (the effect's controller's when omitted). */
  revealTop(then: EffectSpec | null, player?: PlayerId): void;
  /** See the `"shuffle-into-library"` {@link EffectSpec}. `ownerOnly`: the
   * object is gone, so its owner only shuffles their library. */
  shuffleIntoLibrary(target: TargetRef, ownerOnly?: boolean): void;
  /** Who owns the object `target` names — as it last existed, if it has
   * ceased to exist — or the player itself. */
  ownerOf(target: TargetRef): PlayerId | undefined;
  /** See the `"remove-counter"` {@link EffectSpec}. */
  removeCounter(target: TargetRef, counter: string, amount: number | "all"): void;
  /** See the `"remove-counter-all"` {@link EffectSpec}. */
  removeCounterAll(filter: CardFilter, counter: string, amount: number | "all"): void;
  /** See the `"remove-counters"` {@link EffectSpec}: ask the controller which
   * counters to remove, from what — `count` `null` for any number. */
  removeChosenCounters(
    spec: {
      readonly from?: CardFilter;
      readonly anyController?: boolean;
      readonly target?: TargetRef;
      readonly counter: string;
      readonly orKinds?: readonly string[];
      readonly among: boolean;
      readonly perObject?: number;
      readonly upTo: boolean;
    },
    count: number | null,
  ): void;
  /** Move up to `amount` counters of kind `counter` from `from` onto `to`
   * (rule 122.5 — see the `"move-counters"` {@link EffectSpec}), put by the
   * effect's controller; how many moved, 0 when the move isn't possible. */
  moveCounters(from: TargetRef, to: TargetRef, counter: string, amount: number): number;
  /** The counters on a permanent still on the battlefield now, each kind
   * with at least one; `undefined` for anything else. */
  countersHere(target: TargetRef): Readonly<Record<string, number>> | undefined;
  /** Every kind of counter on what `target` names, with how many — read as
   * it last existed on the battlefield if it has left (rule 608.2h), as the
   * `{ countersOn }` amount reads it. */
  counterKindsOf(target: TargetRef): Readonly<Record<string, number>>;
  /** The one permanent of a token stack an effect singles out (split off
   * first — see `Game.splitOneFromStack`); anything else as it is. */
  singleOut(target: TargetRef): TargetRef;
  /** See the `"look-and-choose"` {@link EffectSpec}. */
  lookAndChoose(
    /** `{ cards }` — the look-and-choose's `"targets"`, already resolved;
     * `{ exiled }` — its `"exiled-with-source"`, the linked cards. */
    zone: LookAndChooseZone,
    count: number | undefined,
    min: number,
    max: number,
    destination: "battlefield" | "hand" | "library-top" | "library-bottom" | "graveyard" | "exile-face-down" | "exile" | "manifest" | "reveal" | "stay",
    leftover: "bottom-random" | "bottom-any-order" | "top-any-order" | "stay" | "hand" | "graveyard" | "exile" | "exile-playable",
    filter: ZoneChoiceFilter | undefined,
    enterTapped?: boolean,
    then?: EffectSpec,
    reveal?: boolean | "chosen",
    leftoverIf?: LookAndChooseLeftoverIf,
    secondPick?: ZoneSecondPick,
    attacking?: ResolvedEnterAttacking,
    enterAs?: EnterTypes,
    /** Whose zone and who chooses — see `look-and-choose`'s `player`; the
     * effect's controller when absent. */
    chooser?: PlayerId,
    /** Who chooses instead, the zone still `chooser`'s — see
     * `look-and-choose`'s `chooser`. */
    picker?: PlayerId,
    /** See `look-and-choose`'s `withCounters`. */
    withCounters?: { readonly kind: string; readonly amount: number },
    /** See `look-and-choose`'s `unlinked`. */
    unlinked?: boolean,
    /** See `look-and-choose`'s `needsMin`. */
    needsMin?: boolean,
    /** What battlefield-bound picks enter attached to — see
     * `look-and-choose`'s `attachedTo`. */
    attachTo?: EnterAttachHost,
    /** See `look-and-choose`'s `playable`. */
    playable?: Extract<EffectSpec, { kind: "look-and-choose" }>["playable"],
    /** See `look-and-choose`'s `together`. */
    together?: ResolvedSearchTogether,
    /** See `look-and-choose`'s `split`. */
    split?: readonly ZoneChoiceSplitCase[],
    /** Its `chooser: "an-opponent"` and `under: "you"`. */
    more?: { readonly anOpponent?: true; readonly underYou?: true; readonly underOwners?: true },
  ): void;
  /** A `choose-from-zone` an `offer-zone-choice` carries: ask it now. */
  offerZoneChoice(decision: Extract<AwaitingDecision, { kind: "choose-from-zone" }>): void;
}

export interface ResolutionContext extends EffectApi {
  /** The modes a modal triggered ability announced as it went on the stack
   * (`GameObject.chosenModes` on the ability) — see the `modal` effect's
   * `announced`. */
  readonly announcedModes?: readonly number[];
  readonly controller: PlayerId;
  readonly source: ObjectId;
  /** One entry per declared slot; a hole marks an **optional** slot the
   * player left empty (see `ResolvedTargets`). Reading `ctx.targets[i]` and
   * checking for `undefined` — which effects already do for an out-of-range
   * index — is all a skipped slot needs. */
  readonly targets: ResolvedTargets;
  /** A delayed trigger's targets, every one it carries, for what it reads
   * of them ("that spell's mana value"): `targets` holds only those still
   * the objects they were as it was created, the ones it may act on (rule
   * 400.7). Absent for anything else, whose reads use `targets`. */
  readonly readTargets?: ResolvedTargets;
  /**
   * The slots whose target was found illegal as this spell or ability began
   * to resolve, while another stayed legal so it didn't fizzle (rule
   * 608.2b). Each is already blank in `targets` (`Game.targetLegality`), so
   * no effect acts on it or finds anything out about it; this list is for an
   * effect where an empty slot and an illegal one mean different things —
   * `gain-control`'s `who`, whose absence means "you". Absent when every
   * target was legal.
   */
  readonly illegalTargets?: readonly number[];
  /** The value chosen for `{X}` when this spell/ability was put on the stack,
   * or 0 if its cost had no `{X}`. */
  readonly x: number;
  /** A numeric quantity supplied by the event that fired this triggered
   * ability (the triggering creature's power, or combat damage it dealt), or 0
   * outside a triggered-ability resolution. ROADMAP P4b. */
  readonly triggerValue: number;
  /** The object whose entering / attacking fired this triggered ability, or
   * `undefined` outside such a resolution — for `create-token-copy` with
   * `of: "trigger-object"` (Miirym). needed-cards P5b. */
  readonly triggerObject?: ObjectId;
  /** The trigger object left the battlefield as the ability triggered (a
   * dies trigger's "it") and has changed zones again since: a new object
   * (rule 400.7), so an effect that acts on `"trigger-object"` — "return it
   * to the battlefield" — finds nothing. Reading it ("its power") is
   * last-known information and still works. See `LastKnownRefs
   * .triggerObjectAfterLeaving`. */
  readonly triggerObjectLost?: boolean;
  /** See `LastKnownRefs.enteredTogether`: the permanents a batched entry
   * trigger fired on, and how many tokens each stood for. */
  readonly enteredTogether?: readonly { readonly object: ObjectId; readonly count: number }[];
  /** The objects of the batch the resolving trigger fired on ("those
   * creatures") — what a filter's `triggerBatch` binds to. */
  readonly triggerBatch?: readonly { readonly object: ObjectId; readonly zoneChangeCount: number }[];
  /** How many real, independent firings this resolution stands for — see
   * `GameObject.stackMultiplier`. `1` outside a scaled resolution. Only
   * `create-token` / `create-token-copy` read it (the only effect kinds
   * proven safe to multiply). Pure engine resource-safety optimization. */
  readonly stackMultiplier: number;
  /** Which resolution of this ability this turn is in progress — `1` the
   * first time — for `StaticCondition` `resolved-this-turn`. `0` for a spell,
   * which is not an ability. */
  readonly resolutionCount?: number;
  /** Set while a **mana ability** resolves (rule 605.3b — one activated by
   * hand): its colour choices were made as it was activated (the action's
   * `manaColors`), so an `add-mana` with a choice in it makes what was
   * picked rather than asking. Absent for a spell or an ability on the
   * stack, where the choice is asked as the mana is added (rule 608.2d). */
  readonly manaAbility?: true;
  /** The colour an `add-mana` of `"any-color"` is making in this mana
   * ability — what `{ devotionTo: "that-color" }` reads. */
  readonly manaColor?: ManaType;
  /** The ability's source stayed in a non-battlefield zone while it was on
   * the stack (`ActivatedAbility.zone: "command"`, or `staysInZone`) and has
   * changed zones since: it's a new object (rule 400.7), so an effect naming
   * `"source"` finds nothing. Absent otherwise. */
  readonly sourceLost?: boolean;
  /** The permanent sacrificed to pay this spell's or ability's cost, or by a
   * `sacrifice-source` step before this one — what an {@link AmountRef}
   * `"sacrificed"` reads. Absent when nothing was. */
  readonly sacrificed?: ObjectId;
  /** The cards discarded to pay this spell's or ability's cost
   * (`LastKnownRefs.discarded`) — an {@link AmountRef} `"discarded"` reads
   * the one card when there is exactly one. Absent when none were. */
  readonly discarded?: readonly ObjectId[];
  /** The cards exiled to pay this spell's or ability's cost
   * (`LastKnownRefs.exiledCost`) — a `create-token-copy`'s
   * `"exiled-as-cost"`. Absent when none were. */
  readonly exiledAsCost?: readonly ObjectId[];
  /** The cards revealed from the hand to pay this spell's or ability's cost
   * (`LastKnownRefs.revealed`) — an {@link AmountRef} `"revealed"` reads the
   * one card when there is exactly one. Absent when none were. */
  readonly revealed?: readonly ObjectId[];
  /** The permanent whose static granted this ability (`LastKnownRefs
   * .granter`) — what an {@link EffectTargetRef} `"granter"` names. Absent
   * on an ability nothing granted. */
  readonly granter?: ObjectId;
  /** That granter has left the battlefield, or left and come back, since
   * (rule 400.7): it's read as it last existed but not acted on. */
  readonly granterLost?: boolean;
  /** The one permanent tapped to pay this ability's cost — what an
   * {@link AmountRef} `"tapped"` reads. Absent when nothing was. */
  readonly tapped?: ObjectId;
  /** That permanent has left the battlefield, or left and come back, since
   * (rule 400.7): it's read as it last existed but not acted on. */
  readonly tappedLost?: boolean;
  /** Which ability of which object is resolving, as the per-turn records
   * key it (`resolved-this-turn`, a `may`'s `oncePerTurn`): the source, the
   * timestamp it had when the ability went on the stack, and which of its
   * abilities. Absent for a spell and a delayed trigger. */
  readonly abilityKey?: string;
}

/** Effect kinds safe to fire once with their count/amount multiplied by a
 * stack's size instead of once per real, independent firing — no per-firing
 * choice or target, so N identical simultaneous firings are indistinguishable
 * from one firing scaled by N. Used only to decide whether a `stackCount`
 * object's ability (or a batch-entry event with `count > 1`) can take the
 * cheap path; anything else still fires once per real instance. Pure engine
 * resource-safety optimization (needed-cards P5b/P6 fuzz hardening) — not
 * derived from any rule, and never changes what a card actually does, only
 * how cheaply an exponential/large-batch case is computed. */
export function isCountScalableEffect(effect: EffectSpec): boolean {
  switch (effect.kind) {
    case "create-token":
      return effect.who !== "target-controller"; // that reads targets[0]
    case "create-token-copy":
      // "trigger-object" / a target slot each name a specific instance from
      // *this* firing — not safe to multiply as "N more of the same".
      return effect.of === "source";
    case "sequence":
      return effect.effects.every(isCountScalableEffect);
    case "conditional":
      return (
        isCountScalableEffect(effect.then) &&
        (effect.else === undefined || isCountScalableEffect(effect.else))
      );
    default:
      return false;
  }
}

/** Who an `"each-player-may"` asks: its scope's players, or the one who
 * controls what a target slot points at (nobody, for an empty slot). */
function eachPlayerMayAsks(
  who: Extract<EffectSpec, { kind: "each-player-may" }>["who"],
  ctx: ResolutionContext,
  startingWithYou = false,
): readonly PlayerId[] {
  if (typeof who === "string") {
    const players = ctx.playersInScope(who);
    // "Starting with you, each player votes …" (rule 701.38a): in turn
    // order from the effect's controller, not the active player.
    const at = startingWithYou ? players.indexOf(ctx.controller) : -1;
    return at <= 0 ? players : [...players.slice(at), ...players.slice(0, at)];
  }
  const ref = ctx.targets["ownerOfTarget" in who ? who.ownerOfTarget : who.controllerOfTarget];
  const player = ref === undefined ? undefined : "ownerOfTarget" in who ? ctx.ownerOf(ref) : ctx.controllerOf(ref);
  return player === undefined || !ctx.playersInScope("each-player").includes(player) ? [] : [player];
}

/** Who a `player-effect`'s `cantCast` binds as it resolves: a scope, or the
 * owner of a target, who hasn't left the game. */
function cantCastPlayers(who: PlayerScope | { readonly ownerOfTarget: number }, ctx: ResolutionContext): readonly PlayerId[] {
  if (typeof who !== "object" || !("ownerOfTarget" in who)) return ctx.playersInScope(who);
  const target = ctx.targets[who.ownerOfTarget];
  const owner = target === undefined || target === null ? undefined : ctx.ownerOf(target);
  return owner === undefined || !ctx.playersInScope("each-player").includes(owner) ? [] : [owner];
}

/** Where a card goes in its owner's library — see `put-on-library`. */
export type LibraryPosition = "top" | "bottom" | { readonly fromTop: number };

/** The owner's option for one library position. */
function libraryPositionText(at: LibraryPosition): string {
  if (at === "top") return "Put it on top of your library";
  if (at === "bottom") return "Put it on the bottom of your library";
  return at.fromTop === 2 ? "Put it second from the top of your library" : `Put it ${at.fromTop}th from the top of your library`;
}

/** "a +1/+1 counter", "an energy counter", "2 flying counters". */
function countersText(n: number, kind: string): string {
  return `${n === 1 ? (/^[aeiou]/i.test(kind) ? "an" : "a") : n} ${kind} counter${n === 1 ? "" : "s"}`;
}

function isMoveChooser(end: EffectTargetRef | MoveCountersChooser): end is MoveCountersChooser {
  return typeof end === "object";
}

/** The kinds on a permanent now, in the order it got them — only those of
 * `counter` when it names one. */
function kindsHere(ctx: ResolutionContext, ref: TargetRef, counter: string | undefined): string[] {
  const here = ctx.countersHere(ref) ?? {};
  return Object.keys(here).filter((k) => (here[k] ?? 0) > 0 && (counter === undefined || k === counter));
}

/**
 * A `"move-counters"` (rule 122.5). "A counter", "all" and "a counter of
 * each kind not on it" are one step, with at most a choice of kind; `"any"`
 * goes on across its decisions, the copy each answer applies carrying its
 * `progress`: for the pair of ends it has, one `choose-modes` per kind on
 * `from` (how many of that kind), each answer's move made as the next
 * question is asked; with a chosen end, a `choose-permanents` for it before
 * each pair, until none is chosen or nothing is left to move.
 */
type RemoveCountersSpec = Extract<EffectSpec, { kind: "remove-counters" }>;

/**
 * A `remove-counters` from a targeted player (rule 122.1): kind by kind, how
 * many of it — a `choose-modes` whenever there's more than one answer, the
 * copy each answer applies carrying `p` — never fewer than the kinds still to
 * come leave owed, never more than the count allows; then every chosen
 * counter comes off together.
 */
function applyPlayerCounterRemoval(spec: RemoveCountersSpec, p: PlayerCounterRemovalProgress, ctx: ResolutionContext): void {
  if (p.kinds.length === 0) {
    if (Object.values(p.chosen).some((n) => n > 0)) ctx.removePlayerCounters(p.player, p.chosen);
    return;
  }
  const [{ kind, n }, ...rest] = p.kinds;
  const later = rest.reduce((sum, k) => sum + k.n, 0);
  const most = p.left === null ? n : Math.min(n, p.left);
  const fewest = Math.min(most, Math.max(0, p.least - later));
  const next = (i: number): RemoveCountersSpec => ({
    ...spec,
    playerProgress: {
      player: p.player,
      left: p.left === null ? null : p.left - i,
      least: Math.max(0, p.least - i),
      kinds: rest,
      chosen: i > 0 ? { ...p.chosen, [kind]: i } : p.chosen,
    },
  });
  if (fewest >= most) {
    applyPlayerCounterRemoval(spec, next(most).playerProgress!, ctx);
    return;
  }
  ctx.chooseModes(
    1,
    1,
    Array.from({ length: most - fewest + 1 }, (_unused, k) => fewest + k).map((i) => ({
      text: i === 0 ? `Remove no ${kind} counters` : `Remove ${countersText(i, kind)}`,
      effect: next(i),
    })),
  );
}

type MoveCountersSpec = Extract<EffectSpec, { kind: "move-counters" }>;

function applyMoveCounters(spec: MoveCountersSpec, ctx: ResolutionContext): void {
  const amount = spec.amount ?? 1;
  const p = spec.progress;
  if (p === undefined) {
    const from = isMoveChooser(spec.from) ? undefined : resolveEffectTarget(spec.from, ctx);
    const to = isMoveChooser(spec.to) ? undefined : resolveEffectTarget(spec.to, ctx);
    // A named end that's gone (an illegal target, a source that has left):
    // nothing can move (122.5).
    if (!isMoveChooser(spec.from) && from?.kind !== "object") return;
    if (!isMoveChooser(spec.to) && to?.kind !== "object") return;
    if (amount === "any" || amount === "one-or-more") {
      const fixed = (ref: TargetRef | undefined): ObjectId | undefined => {
        const one = ref === undefined ? undefined : ctx.singleOut(ref);
        return one?.kind === "object" ? one.object : undefined;
      };
      const fromId = fixed(from);
      const toId = fixed(to);
      applyMoveCounters(
        {
          ...spec,
          progress: {
            ...(fromId !== undefined ? { from: fromId } : {}),
            ...(toId !== undefined ? { to: toId } : {}),
            used: [],
            moved: 0,
            ...(fromId !== undefined && toId !== undefined
              ? { kinds: kindsHere(ctx, { kind: "object", object: fromId }, spec.counter) }
              : {}),
          },
        },
        ctx,
      );
      return;
    }
    if (from === undefined || to === undefined) return;
    if (amount === "all" || amount === "each-kind-missing") {
      const onTo = ctx.countersHere(to) ?? {};
      for (const kind of kindsHere(ctx, from, spec.counter)) {
        if (amount === "each-kind-missing" && (onTo[kind] ?? 0) > 0) continue;
        const n = amount === "all" ? (ctx.countersHere(from)?.[kind] ?? 0) : 1;
        ctx.moveCounters(from, to, kind, n);
      }
      return;
    }
    // "A counter": of the named kind, or of one its controller chooses among
    // those there now (the Nesting Grounds ruling) — asked only with two or
    // more to choose between.
    const kinds = kindsHere(ctx, from, spec.counter);
    if (kinds.length === 1) ctx.moveCounters(from, to, kinds[0], 1);
    else if (kinds.length > 1) {
      ctx.chooseModes(
        1,
        1,
        kinds.map((kind) => ({ text: `Move ${countersText(1, kind)}`, effect: { ...spec, counter: kind } })),
      );
    }
    return;
  }

  // The answer to the last question: that many of that kind.
  let moved = p.moved;
  const ref = (id: ObjectId): TargetRef => ({ kind: "object", object: id });
  if (p.pending !== undefined && p.from !== undefined && p.to !== undefined) {
    moved += ctx.moveCounters(ref(p.from), ref(p.to), p.pending.counter, p.pending.amount);
  }
  // This copy carries the permanent just chosen for the open end, as its
  // target 0.
  let from = p.from;
  let to = p.to;
  let kinds = p.kinds;
  if (p.picking === true) {
    const picked = ctx.targets[0];
    if (picked?.kind !== "object") return;
    const one = ctx.singleOut(picked);
    if (one.kind !== "object") return;
    if (from === undefined) from = one.object;
    else to = one.object;
    kinds = kindsHere(ctx, ref(from), spec.counter);
  }
  const chooserFrom = isMoveChooser(spec.from) ? spec.from : undefined;
  const chooserTo = isMoveChooser(spec.to) ? spec.to : undefined;
  const chooser = chooserFrom ?? chooserTo;

  if (from !== undefined && to !== undefined && kinds !== undefined) {
    // The next kind there's any of, and how many to move.
    let rest = kinds;
    while (rest.length > 0) {
      const kind = rest[0];
      rest = rest.slice(1);
      const n = ctx.countersHere(ref(from))?.[kind] ?? 0;
      if (n <= 0) continue;
      // Not none at all: "one or more", or of the one kind onto a creature
      // just chosen for them (Forgotten Ancient — choosing it is choosing to
      // move some).
      const later = rest.some((k) => (ctx.countersHere(ref(from))?.[k] ?? 0) > 0);
      const least =
        (amount === "one-or-more" && moved === 0 && !later) || (chooserTo !== undefined && spec.counter !== undefined)
          ? 1
          : 0;
      const next = (i: number): MoveCountersSpec => ({
        ...spec,
        progress: {
          used: p.used,
          moved,
          from,
          to,
          kinds: rest,
          ...(i > 0 ? { pending: { counter: kind, amount: i } } : {}),
        },
      });
      const options = Array.from({ length: n - least + 1 }, (_unused, k) => least + k);
      if (options.length === 1) {
        applyMoveCounters(next(options[0]), ctx);
        return;
      }
      ctx.chooseModes(
        1,
        1,
        options.map((i) => ({
          text: i === 0 ? `Move no ${kind} counters` : `Move ${countersText(i, kind)}`,
          effect: next(i),
        })),
      );
      return;
    }
    // This pair is done.
    if (chooser === undefined) {
      if (spec.ifMoved !== undefined && moved > 0) applyEffectSpec(spec.ifMoved, ctx);
      return;
    }
    const chosen = chooserFrom !== undefined ? from : to;
    applyMoveCounters(
      {
        ...spec,
        progress: {
          ...(chooserFrom !== undefined ? { to } : { from }),
          used: [...p.used, chosen],
          moved,
        },
      },
      ctx,
    );
    return;
  }

  // Choose the open end: one at a time, none to stop.
  if (chooser === undefined) return;
  const fixedEnd = from ?? to;
  if (fixedEnd === undefined || ctx.countersHere(ref(fixedEnd)) === undefined) return;
  // Onto chosen permanents: only while there's something left to move.
  if (from !== undefined && kindsHere(ctx, ref(from), spec.counter).length === 0) return;
  ctx.choosePermanents(
    chooser.choose,
    0,
    1,
    { ...spec, progress: { ...(from !== undefined ? { from } : { to }), used: p.used, moved, picking: true } },
    chooser.prompt,
    false,
    [fixedEnd, ...p.used],
  );
}

/**
 * An `unless` option's `times` (see {@link UnlessTimes}) fixed as the effect
 * applies: the mana repeated, the life multiplied, that many more to
 * sacrifice — all of it or none (rule 702.24a: no partial payments). Its
 * `text` names the total.
 */
function bindUnlessTimes(option: BoundUnlessOption, ctx: ResolutionContext): BoundUnlessOption {
  if (!("times" in option) || option.times === undefined) return option;
  const n = Math.max(0, Math.floor(amountValue(option.times, ctx)));
  if ("pay" in option) {
    const pay = option.pay.repeat(n);
    return {
      pay,
      text: `Pay ${pay}`,
      ...(option.andLife !== undefined ? { andLife: option.andLife * n } : {}),
      ...(option.ifPaid !== undefined ? { ifPaid: option.ifPaid } : {}),
    };
  }
  if ("payLife" in option) return { payLife: option.payLife * n, text: `Pay ${option.payLife * n} life` };
  if ("sacrifice" in option) {
    const count = (option.count ?? 1) * n;
    return {
      sacrifice: option.sacrifice,
      count,
      ...(option.exceptSource === true ? { exceptSource: true } : {}),
      text: `${option.text} (${count})`,
    };
  }
  return option;
}

/**
 * An `"each-player-may"`: ask each player in turn, then apply the follow-ups
 * player by player. Each question — and each follow-up that stops to ask
 * something — parks the rest as a copy carrying its `progress`, beneath
 * whatever that step parked of its own, so it all happens in order.
 */
/** Effects an `"each-player-may"` can do after everyone has answered: none
 * of them asks the player anything more. */
const ASKS_NOTHING: ReadonlySet<EffectSpec["kind"]> = new Set<EffectSpec["kind"]>([
  "draw",
  "discard-hand",
  "gain-life",
  "lose-life",
]);

function asksNothing(effect: EffectSpec): boolean {
  if (effect.kind === "sequence") return effect.effects.every(asksNothing);
  return ASKS_NOTHING.has(effect.kind);
}

function applyEachPlayerMay(
  spec: Extract<EffectSpec, { kind: "each-player-may" }>,
  ctx: ResolutionContext,
): void {
  const since = spec.progress?.since ?? ctx.nextEventSeq();
  let asked = spec.progress?.asked ?? [];
  let toAsk = spec.progress?.toAsk ?? eachPlayerMayAsks(spec.who, ctx, spec.startingWithYou === true);
  const park = (progress: EachPlayerMayProgress, below: number): void =>
    ctx.resumeAfterDecisions({ ...spec, progress }, below);
  // An effect that asks nothing more of the player — draw, discard their
  // hand, gain life — is only asked about, then done for everyone who said
  // yes at once (rule 101.4): a later player doesn't see an earlier one's
  // discarded hand or drawn cards before choosing (Will of the Jeskai).
  const deferred =
    spec.effect !== undefined && spec.options === undefined && spec.choices === undefined && asksNothing(spec.effect);
  // One question at a time, each answered before the next is asked, and
  // then what they chose happens at once (rule 101.4): a discard or a
  // sacrifice a player chooses waits, the discarded cards hidden in hand
  // (101.4a), until the last player has chosen.
  if (toAsk.length > 0) ctx.holdChoices();
  while (toAsk.length > 0) {
    const player = toAsk[0];
    asked = [...asked, player];
    toAsk = toAsk.slice(1);
    const parked = ctx.parkedCount();
    const pendingBefore = ctx.decisionPending();
    ctx.askEachPlayerMay(player, spec, deferred);
    if (!pendingBefore && ctx.decisionPending()) {
      park({ since, asked, toAsk }, parked);
      return;
    }
  }
  if (spec.progress?.results === undefined) {
    const parked = ctx.parkedCount();
    const pendingBefore = ctx.decisionPending();
    ctx.releaseHeldChoices();
    // A card entering from a hand that stops to ask its "as this enters"
    // choice (Show and Tell's Clone): the follow-ups wait for it. Resumed,
    // there's nothing held left to release.
    if (!pendingBefore && ctx.decisionPending()) {
      park({ since, asked, toAsk: [] }, parked);
      return;
    }
    if (deferred && spec.effect !== undefined) {
      const effect = spec.effect;
      const yes = asked.filter((player) => ctx.tookEachPlayerMay(player, since));
      ctx.simultaneously(() => {
        for (const player of yes) ctx.applyEachPlayerMayAs(player, effect);
      });
    }
  }
  if (spec.ifDid === undefined && spec.ifDidnt === undefined) return;
  let results =
    spec.progress?.results ??
    (() => {
      const counted =
        spec.resultsFor === undefined ? undefined : new Set(ctx.playersInScope(spec.resultsFor));
      return asked
        .filter((player) => counted === undefined || counted.has(player))
        .map((player) => ({ player, did: ctx.tookEachPlayerMay(player, since) }));
    })();
  while (results.length > 0) {
    const { player, did } = results[0];
    results = results.slice(1);
    const followUp = did ? spec.ifDid : spec.ifDidnt;
    if (followUp === undefined) continue;
    const parked = ctx.parkedCount();
    const pendingBefore = ctx.decisionPending();
    // What they sacrificed in answer, if anything, is the follow-up's
    // "sacrificed" — "you may sacrifice an artifact, creature, …. If you do,
    // each opponent may sacrifice a permanent that shares a card type with
    // it" (Braids, Arisen Nightmare).
    const about = ctx.aboutPlayer(player);
    const sacrificed = did ? ctx.sacrificedForEachPlayerMay(player, since) : undefined;
    applyEffectSpec(followUp, sacrificed === undefined ? about : about.withSacrificed(sacrificed));
    if (results.length > 0 && !pendingBefore && ctx.decisionPending()) {
      park({ since, asked, toAsk: [], results }, parked);
      return;
    }
  }
}

/**
 * A `vote` (rule 701.38): one question per vote, each answered before the
 * next is asked, in turn order from the effect's controller, a player's
 * additional votes straight after their first (701.38d). The rest is parked
 * as a copy carrying `toAsk` whenever a question waits for its answer.
 */
function applyVote(spec: Extract<EffectSpec, { kind: "vote" }>, ctx: ResolutionContext): void {
  let toAsk = spec.toAsk;
  if (toAsk === undefined && spec.choose === true) {
    // "Each player chooses …": no additional votes — it isn't a vote.
    ctx.beginVoting(spec.secret === true, true);
    const fromYou =
      typeof spec.who === "object"
        ? ((player) => (player === undefined ? [] : [player]))(effectPlayer(spec.who, ctx))
        : eachPlayerMayAsks(spec.who ?? "each-player", ctx, true);
    const order =
      spec.startingWith === "you"
        ? fromYou
        : spec.startingWith === "next-opponent"
          ? fromYou[0] === ctx.controller
            ? [...fromYou.slice(1), fromYou[0]]
            : fromYou
          : spec.startingWith === "you-then-active-player"
            ? [
                ...fromYou.filter((player) => player === ctx.controller),
                ...ctx.apnap(fromYou.filter((player) => player !== ctx.controller)),
              ]
            : ctx.apnap(fromYou);
    toAsk = order.map((player) => ({ player, extra: false }));
  }
  if (toAsk === undefined) {
    ctx.beginVoting(spec.secret === true);
    toAsk = eachPlayerMayAsks("each-player", ctx, true).flatMap((player) => [
      { player, extra: false },
      ...Array.from({ length: ctx.additionalVotes(player) }, () => ({ player, extra: true })),
    ]);
  }
  while (toAsk.length > 0) {
    const ask = toAsk[0];
    toAsk = toAsk.slice(1);
    const parked = ctx.parkedCount();
    const pendingBefore = ctx.decisionPending();
    ctx.askVote(ask.player, spec, ask.extra);
    if (!pendingBefore && ctx.decisionPending()) {
      ctx.resumeAfterDecisions({ ...spec, toAsk }, parked);
      return;
    }
  }
  ctx.finishVoting();
}

/**
 * A `players-pay-any-amount`: one question at a time, the rest of the round
 * carried on the copy the answer resumes, the payment arriving as its `"x"`.
 */
function applyPlayersPayAnyAmount(
  spec: Extract<EffectSpec, { kind: "players-pay-any-amount" }>,
  ctx: ResolutionContext,
): void {
  const round = (): readonly PlayerId[] => {
    const players = ctx.playersInScope("each-player");
    return spec.startingWithYou === true ? eachPlayerMayAsks("each-player", ctx, true) : ctx.apnap(players);
  };
  let toAsk = spec.progress?.toAsk ?? round();
  let paid = spec.progress?.paid ?? [];
  let anyPaid = spec.progress?.anyPaid ?? false;
  const paying = spec.progress?.paying;
  if (paying !== undefined) {
    const amount = Math.max(0, Math.floor(ctx.x));
    if (amount > 0) {
      // Mana was paid as the question was answered; life is paid here, its
      // answer read only now (rule 119.4: paying it is losing it).
      if (spec.resource === "life") ctx.loseLife(paying, amount);
      paid = [...paid, { player: paying, amount }];
      anyPaid = true;
    }
  }
  for (;;) {
    while (toAsk.length > 0) {
      const player = toAsk[0];
      toAsk = toAsk.slice(1);
      const most = ctx.mostPayable(player, spec.resource);
      if (most <= 0) continue;
      const after = { toAsk, paid, anyPaid };
      const resume: EffectSpec = { ...spec, progress: { ...after, paying: player } };
      if (spec.resource === "life") {
        ctx.chooseValue(
          { kind: "choose-value", value: "number", prompt: "Pay how much life?", then: resume },
          { chooser: player, max: most },
        );
      } else {
        ctx.askPlayerAboutEffect(player, "Pay any amount of mana?", resume, { ...spec, progress: after }, "{X}");
      }
      return;
    }
    if (spec.untilNoOnePays !== true || !anyPaid) break;
    toAsk = round();
    anyPaid = false;
  }
  const total = paid.reduce((n, p) => n + p.amount, 0);
  const each = spec.each;
  if (each !== undefined) {
    const players = [...new Set(paid.map((p) => p.player))];
    ctx.simultaneously(() => {
      for (const player of players) {
        const theirs = paid.filter((p) => p.player === player).reduce((n, p) => n + p.amount, 0);
        applyEffectSpec(each, ctx.aboutPlayer(player).withX(theirs));
      }
    });
  }
  if (spec.then !== undefined) applyEffectSpec(spec.then, ctx.withX(total));
}

/**
 * A `bid-life`: the opening bid, then round the table in turn order from the
 * last bidder asked, each answer resuming a copy carrying the bidding so far,
 * until the turn comes back to the high bidder. A player who has left the
 * game in the meantime isn't asked.
 */
function applyBidLife(spec: Extract<EffectSpec, { kind: "bid-life" }>, ctx: ResolutionContext): void {
  const progress = spec.progress;
  if (progress === undefined) {
    const who = spec.who;
    const inGame = eachPlayerMayAsks("each-player", ctx, true);
    let bidders = inGame;
    if (who !== "each-player") {
      const ref = ctx.targets[who.youAndControllerOfTarget];
      const other = ref === undefined ? undefined : ctx.controllerOf(ref);
      bidders = inGame.filter((player) => player === ctx.controller || player === other);
    }
    const opened = { bidders, highBidder: ctx.controller, at: 0 };
    if (spec.opening === "any") {
      ctx.chooseValue({
        kind: "choose-value",
        value: "number",
        prompt: "Start the bidding: bid how much life?",
        then: { ...spec, progress: { ...opened, high: 0, bidding: ctx.controller } },
      });
      return;
    }
    applyBidLife({ ...spec, progress: { ...opened, high: spec.opening } }, ctx);
    return;
  }
  const { bidders, topping } = progress;
  let { high, highBidder, at } = progress;
  if (topping !== undefined) {
    ctx.chooseValue(
      {
        kind: "choose-value",
        value: "number",
        min: high + 1,
        prompt: `Bid how much life? (More than ${high}.)`,
        then: { ...spec, progress: { bidders, high, highBidder, at, bidding: topping } },
      },
      { chooser: topping },
    );
    return;
  }
  if (progress.bidding !== undefined) {
    high = Math.floor(ctx.x);
    highBidder = progress.bidding;
  }
  const inGame = ctx.playersInScope("each-player");
  for (;;) {
    at = (at + 1) % bidders.length;
    const player = bidders[at];
    if (player === highBidder) break;
    if (!inGame.includes(player)) continue;
    const here = { bidders, high, highBidder, at };
    ctx.askPlayerAboutEffect(
      player,
      `Top the high bid of ${high} life?`,
      { ...spec, progress: { ...here, topping: player } },
      { ...spec, progress: here },
    );
    return;
  }
  const won = ctx.aboutPlayer(highBidder).withX(high);
  if (spec.then !== undefined) applyEffectSpec(spec.then, won);
  if (spec.ifYouWin !== undefined && highBidder === ctx.controller) applyEffectSpec(spec.ifYouWin, won);
}

/** How many passes a `repeat` makes at most — a guard, like `MAX_CLASHES`. */
const MAX_REPEATS = 200;

/**
 * A `repeat`: each pass is `effect` with "this way" begun at the pass
 * (`ctx.scopeThisWay`), so a condition after it reads that pass alone. A
 * pass that stops to ask parks the rest of the process as a copy carrying
 * its `progress`, judged once the pass is over. Once no pass is left, "this
 * way" goes back to the whole resolution's.
 */
/**
 * A `counters-distributed` (rule 608.2d), one step at a time: the total read
 * and the permanents chosen (`askChoosePermanentsKept`, resumed here), then a
 * share asked for each chosen one but the last — a `choose-value` number
 * whose `then` is this effect again, the share arriving as its `"x"` — at
 * least one each and leaving at least one for every one still to come, the
 * last taking what's left; then the counters go on.
 */
function distributeCounters(spec: Extract<EffectSpec, { kind: "counters-distributed" }>, ctx: ResolutionContext): void {
  const progress = spec.progress;
  const kind = `${spec.counter} counter`;
  if (progress === undefined) {
    const total = Math.max(0, Math.floor(amountValue(spec.total, ctx)));
    if (total <= 0) return;
    let side: PlayerId | undefined;
    if (spec.controlledByTarget !== undefined) {
      const ref = ctx.targets[spec.controlledByTarget];
      side = ref === undefined ? undefined : ref.kind === "player" ? ref.player : ctx.controllerOf(ref);
      // That player gone or the target illegal: nobody to distribute among.
      if (side === undefined) return;
    }
    const below = ctx.parkedCount();
    const among = spec.among ?? "permanents";
    const prompt = `Distribute ${total} ${kind}${total === 1 ? "" : "s"} among any number of ${among}: choose which get them`;
    if (ctx.askChoosePermanentsKept(spec.filter, total, prompt, side)) {
      ctx.resumeAfterDecisions({ ...spec, progress: { total } }, below);
    }
    return;
  }
  // Resumed: from the choice of permanents (nothing picked yet), or from a
  // share's number, which arrives as X.
  const picked = progress.picked ?? ctx.takeKept();
  if (picked.length === 0) return;
  const shares = [...(progress.shares ?? [])];
  if (progress.picked !== undefined) shares.push(Math.max(1, Math.floor(ctx.x)));
  let left = progress.total - shares.reduce((n, s) => n + s, 0);
  while (shares.length < picked.length - 1) {
    // At least one for each still to come after this one.
    const most = left - (picked.length - shares.length - 1);
    if (most <= 1) {
      shares.push(1);
      left -= 1;
      continue;
    }
    const name = ctx.objectName(picked[shares.length]);
    ctx.chooseValue({
      kind: "choose-value",
      value: "number",
      min: 1,
      max: most,
      prompt: `How many ${kind}s on ${name}? (${left} left to distribute)`,
      then: { ...spec, progress: { total: progress.total, picked, shares } },
    });
    return;
  }
  shares.push(left);
  // Each pick is one permanent: a token stack's member singled out per pick.
  picked.forEach((object, i) => {
    const amount = shares[i] ?? 0;
    if (amount > 0) ctx.addCounter(ctx.singleOut({ kind: "object", object }), spec.counter, amount);
  });
}

function applyRepeat(spec: Extract<EffectSpec, { kind: "repeat" }>, ctx: ResolutionContext): void {
  let progress = spec.progress;
  const finish = (outer: number): void => {
    ctx.scopeThisWay(outer);
  };
  if (progress?.stop === true) {
    finish(progress.outer);
    return;
  }
  if (progress === undefined) {
    const total = spec.times === undefined ? undefined : Math.max(0, amountValue(spec.times, ctx));
    progress = { round: 0, outer: ctx.thisWaySince(), ...(total !== undefined ? { total } : {}) };
    if (total === 0) return;
  }
  // Resumed after a pass that stopped to ask, `ctx` reads that pass's "this
  // way" already: the resolution's start is still the pass's.
  let pass: ResolutionContext | undefined;
  for (;;) {
    if (progress.round > 0 && progress.judged !== true) {
      // The pass just done is over: does the process go on?
      const judge = pass ?? ctx;
      const more =
        progress.round < MAX_REPEATS &&
        (progress.total === undefined || progress.round < progress.total) &&
        (spec.again === undefined || judge.conditionMet(spec.again)) &&
        (spec.again !== undefined || spec.mayAgain !== undefined || progress.total !== undefined);
      if (!more) {
        finish(progress.outer);
        return;
      }
      if (spec.mayAgain !== undefined) {
        // "You may repeat this process": asked, the next pass its yes.
        const next: EffectSpec = { ...spec, progress: { ...progress, judged: true } };
        const declined: EffectSpec = { ...spec, progress: { ...progress, stop: true } };
        applyEffectSpec(
          {
            kind: "may",
            prompt: "Repeat this process?",
            effect: next,
            else: declined,
            ...(typeof spec.mayAgain === "object" ? { cost: spec.mayAgain.cost } : {}),
          },
          ctx,
        );
        return;
      }
    }
    // A new pass, its own "this way".
    pass = ctx.scopeThisWay(ctx.nextEventSeq());
    const round: number = progress.round + 1;
    const parked = pass.parkedCount();
    const pendingBefore = pass.decisionPending();
    applyEffectSpec(spec.effect, pass);
    progress = { round, outer: progress.outer, ...(progress.total !== undefined ? { total: progress.total } : {}) };
    if (!pendingBefore && pass.decisionPending()) {
      pass.resumeAfterDecisions({ ...spec, progress }, parked);
      return;
    }
  }
}

/** How many times "if you win, repeat this process" clashes at most — a
 * guard, like `MAX_FLIPS`; a library runs out long before. */
const MAX_CLASHES = 200;

/**
 * A `clash` (rule 701.30): choose the opponent, reveal both top cards, then
 * ask each clashing player in APNAP order whether theirs goes on the bottom
 * — each question parks the rest as a copy carrying its `progress` — and
 * apply `won` or `lost` once both have chosen.
 */
function applyClash(spec: Extract<EffectSpec, { kind: "clash" }>, ctx: ResolutionContext): void {
  if (spec.opponent === undefined) {
    // "Choose an opponent" (701.30b): not a target; asked only among several.
    const opponents = ctx.playersInScope("each-opponent");
    if (opponents.length === 0) return;
    if (opponents.length === 1) {
      applyClash({ ...spec, opponent: opponents[0] }, ctx);
      return;
    }
    ctx.chooseModes(
      1,
      1,
      opponents.map((player) => ({
        text: `Clash with ${player.charAt(0).toUpperCase()}${player.slice(1)}`,
        effect: { ...spec, opponent: player },
      })),
    );
    return;
  }
  if (!ctx.playersInScope("each-player").includes(spec.opponent)) return;
  const about = ctx.aboutPlayer(spec.opponent);
  let progress = spec.progress;
  if (progress === undefined) {
    // Both reveal at the same time (701.30c); the higher mana value wins
    // (701.30d) — read now, while the cards are still the revealed ones.
    const clashing = ctx.playersInScope("each-player").filter((p) => p === ctx.controller || p === spec.opponent);
    const revealed = clashing.map((player) => ({ player, card: ctx.libraryTop(player, 1, true)[0] }));
    const valueOf = (player: PlayerId): number | undefined => {
      const card = revealed.find((r) => r.player === player)?.card;
      return card === undefined ? undefined : ctx.manaValueOf({ kind: "object", object: card });
    };
    const mine = valueOf(ctx.controller);
    const theirs = valueOf(spec.opponent);
    progress = {
      won: mine !== undefined && (theirs === undefined || mine > theirs),
      theyWon: theirs !== undefined && (mine === undefined || theirs > mine),
      toAsk: revealed.flatMap((r) => (r.card === undefined ? [] : [{ player: r.player, card: r.card }])),
    };
  }
  let toAsk = progress.toAsk;
  while (toAsk.length > 0) {
    const { card } = toAsk[0];
    toAsk = toAsk.slice(1);
    const parked = about.parkedCount();
    const pendingBefore = about.decisionPending();
    // Its owner chooses: leave it on top, or put it on the bottom (701.30a).
    applyEffectSpec(
      {
        kind: "each-player-may",
        who: { ownerOfTarget: 0 },
        choices: [
          { text: "Leave it on top of your library", effect: { kind: "sequence", effects: [] } },
          { text: "Put it on the bottom of your library", effect: { kind: "put-on-library", target: 0, position: "bottom" } },
        ],
      },
      about.withTargets([{ kind: "object", object: card }]),
    );
    if (!pendingBefore && about.decisionPending()) {
      about.resumeAfterDecisions({ ...spec, progress: { ...progress, toAsk } }, parked);
      return;
    }
  }
  // The clash is over: each of the two has clashed (701.30), for "whenever
  // you clash" — whoever started it, and either can have won.
  ctx.clashed([
    { player: ctx.controller, won: progress.won },
    { player: spec.opponent, won: progress.theyWon === true },
  ]);
  const branch = progress.won ? spec.won : spec.lost;
  // "Repeat this process": the rest of it, then a fresh clash — an opponent
  // chosen again, new cards revealed.
  const { progress: _done, opponent: _with, ...fresh } = spec;
  const round = (spec.round ?? 0) + 1;
  const again: EffectSpec | undefined =
    progress.won && spec.repeat !== undefined && round < MAX_CLASHES
      ? { kind: "sequence", effects: [spec.repeat, { ...fresh, round }] }
      : undefined;
  const steps = [branch, again].filter((s): s is EffectSpec => s !== undefined);
  if (steps.length > 0) applyEffectSpec(steps.length === 1 ? steps[0] : { kind: "sequence", effects: steps }, about);
}

/** A `for-each-voted`: the players or permanents the vote was for, by how
 * many votes each got. */
function applyForEachVoted(spec: Extract<EffectSpec, { kind: "for-each-voted" }>, ctx: ResolutionContext): void {
  const votes = ctx.votes();
  if (spec.which === "unvoted" || votes.some((v) => "player" in v.choice)) {
    const inGame = ctx.playersInScope("each-player");
    const scope = spec.who === undefined ? undefined : ctx.playersInScope(spec.who);
    const received = (player: PlayerId): number =>
      votes.filter((v) => "player" in v.choice && v.choice.player === player).length;
    const most = Math.max(0, ...inGame.map(received));
    const players = inGame.filter((player) => {
      if (scope !== undefined && !scope.includes(player)) return false;
      const n = received(player);
      return spec.which === "unvoted" ? n === 0 : spec.which === "voted" ? n > 0 : n > 0 && n === most;
    });
    applyEffectSpec(
      {
        kind: "for-each-player",
        who: "each-player",
        effect: spec.effect,
        remaining: players,
        ...(spec.simultaneous === true ? { simultaneous: true } : {}),
      },
      ctx,
    );
    return;
  }
  // Permanents, in the order first voted for. "The most votes" is counted
  // over every vote cast, whether or not what got them is still there.
  const tally: { object: ObjectId; zoneChangeCount: number; votes: number }[] = [];
  for (const { choice } of votes) {
    if (!("object" in choice)) continue;
    const entry = tally.find((t) => t.object === choice.object && t.zoneChangeCount === choice.zoneChangeCount);
    if (entry !== undefined) entry.votes += 1;
    else tally.push({ object: choice.object, zoneChangeCount: choice.zoneChangeCount, votes: 1 });
  }
  const most = Math.max(0, ...tally.map((t) => t.votes));
  const picked = tally.filter(
    (t) =>
      (spec.which === "voted" || t.votes === most) && ctx.votedPermanentHere(t.object, t.zoneChangeCount),
  );
  const each = (): void => {
    for (const t of picked) applyEffectSpec(spec.effect, ctx.withTargets([{ kind: "object", object: t.object }]));
  };
  if (spec.simultaneous === true) ctx.simultaneously(each);
  else each();
}

/** The opponents of `you` who voted for a choice one of `you`'s votes was
 * for (`withYou`), or for a choice none of them was — Erestor of the
 * Council. In `opponents`' order, each once. */
export function opponentsVoting(
  votes: readonly Vote[],
  you: PlayerId,
  opponents: readonly PlayerId[],
  withYou: boolean,
): PlayerId[] {
  const mine = votes.filter((v) => v.voter === you).map((v) => v.choice);
  return opponents.filter((player) =>
    votes.some(
      (v) => v.voter === player && mine.some((choice) => sameVoteChoice(choice, v.choice)) === withYou,
    ),
  );
}

/** Whose library a `reveal-until` or a `reveal-until-count` reads: `undefined`
 * when that player isn't there to name. */
function revealingPlayer(
  whose: Extract<EffectSpec, { kind: "reveal-until" }>["whose"],
  ctx: ResolutionContext,
): PlayerId | undefined {
  if (whose === undefined) return ctx.controller;
  if (whose === "that-player" || typeof whose === "object") return effectPlayer(whose, ctx);
  const ref = ctx.targets[whose];
  return ref?.kind === "player" ? ref.player : undefined;
}

/**
 * A `"reveal-until"`: reveal, place the card found, apply `then` to it, then
 * place the rest. Placing it onto the battlefield may stop to ask its "as
 * this enters" choice, and `then` may stop to ask something; either way the
 * rest is parked as a copy carrying `progress`.
 */
function applyRevealUntil(
  spec: Extract<EffectSpec, { kind: "reveal-until" }>,
  ctx: ResolutionContext,
): void {
  let progress = spec.progress;
  if (progress === undefined) {
    const owner = revealingPlayer(spec.whose, ctx);
    if (owner === undefined) return;
    const found = ctx.revealUntil(owner, spec);
    progress = {
      owner,
      revealed: spec.keepFound === true ? found.revealed.filter((id) => id !== found.hit) : found.revealed,
      hit: found.hit,
      placed: false,
    };
  }
  const hit = progress.hit;
  if (!progress.placed && hit !== null) {
    const parked = ctx.parkedCount();
    if (
      spec.put !== undefined &&
      ctx.placeFound(
        hit,
        spec.put,
        spec.tapped === true,
        resolveEnterAttacking(spec.attacking, ctx),
        spec.underYourControl === true,
      )
    ) {
      ctx.resumeAfterDecisions({ ...spec, progress }, parked);
      return;
    }
    progress = { ...progress, placed: true };
    if (spec.then !== undefined) {
      const pendingBefore = ctx.decisionPending();
      const found: TargetRef = { kind: "object", object: hit };
      applyEffectSpec(spec.then, spec.thenKeepsTargets === true ? ctx.withFoundBeforeTargets(found) : ctx.withTargets([found]));
      if (!pendingBefore && ctx.decisionPending()) {
        ctx.resumeAfterDecisions({ ...spec, progress }, parked);
        return;
      }
    }
  }
  ctx.placeRevealed(progress.owner, progress.revealed, spec.rest, spec.exile === true);
}

/**
 * A `"cast-now"`: offer the cast; once it's answered, "if you do" or "if you
 * don't"; then the looked-at cards not cast to the bottom. Waiting on the
 * decision parks the rest as a copy carrying its `progress`, and a follow-up
 * that stops to ask something parks `rest` beneath whatever it parked.
 */
/** Offer a `cast-now`'s `progress.cards`, parking the rest of `spec` across
 * the decision when anything follows it. Whether a decision is now up. */
function offerCastNow(
  spec: Extract<EffectSpec, { kind: "cast-now" }>,
  progress: CastNowProgress,
  ctx: ResolutionContext,
): boolean {
  const { cards, looked, castsLeft, manaValueLeft } = progress;
  if (castsLeft === 0) return false;
  const parked = ctx.parkedCount();
  const pendingBefore = ctx.decisionPending();
  const by = spec.by === undefined ? undefined : effectPlayer(spec.by, ctx);
  if (spec.by !== undefined && by === undefined) return false;
  const spell: CardFilter | undefined =
    manaValueLeft === undefined ? spec.spell : { ...spec.spell, manaValue: { op: "lte", n: manaValueLeft } };
  if (cards.length > 0) {
    ctx.castNow(cards, {
      ...(by !== undefined ? { by } : {}),
      free: spec.free === true || spec.byDiscarding === true || spec.byPayingEnergy === true,
      ...(spec.byDiscarding === true ? { byDiscarding: true } : {}),
      ...(spec.byPayingEnergy === true ? { byPayingEnergy: true } : {}),
      ...(spec.madness === true ? { madness: true } : {}),
      ...(spec.miracle === true ? { miracle: true } : {}),
      exileAfter: spec.exileAfter ?? false,
      ...(spec.play === true ? { play: true } : {}),
      ...(spec.suspend === true ? { freeCastOf: "suspend" as const } : {}),
      ...(spell !== undefined ? { spell } : {}),
      ...(castsLeft !== undefined ? { castsLeft } : {}),
      ...(manaValueLeft !== undefined ? { manaValueLeft } : {}),
      ...(looked.length > 0 ? { looked } : {}),
      ...(spec.transformed === true ? { transformed: true } : {}),
    });
  }
  if (pendingBefore || !ctx.decisionPending()) return false;
  if (spec.then !== undefined || spec.else !== undefined || spec.rest !== undefined || spec.repeat === true) {
    ctx.resumeAfterDecisions({ ...spec, progress }, parked);
  }
  return true;
}

function applyCastNowSpec(spec: Extract<EffectSpec, { kind: "cast-now" }>, ctx: ResolutionContext): void {
  let progress = spec.progress;
  if (progress === undefined) {
    const from = spec.from;
    const handOwner =
      typeof from === "object" && "handOf" in from ? effectPlayer(from.handOf, ctx) : undefined;
    const searcher = from === "while-searching" ? (spec.by === undefined ? ctx.controller : effectPlayer(spec.by, ctx)) : undefined;
    const looked =
      typeof from === "object" && "libraryTop" in from
        ? ctx.libraryTop(ctx.controller, Math.max(0, Math.floor(amountValue(from.libraryTop, ctx))), from.reveal === true)
        : handOwner !== undefined
          ? ctx.cardsIn(handOwner, "hand")
          : searcher !== undefined
            ? ctx.cardsIn(searcher, "library")
            : [];
    let cards: readonly ObjectId[];
    if (typeof from === "object" && "handOf" in from) {
      cards = looked;
    } else if (from === "while-searching") {
      cards = searcher === undefined ? [] : ctx.castableWhileSearching(searcher);
    } else if (spec.encoded !== undefined) {
      cards = ctx.stillExiled(spec.encoded.card, spec.encoded.zoneChangeCount);
    } else if (from === undefined) {
      const target = spec.target === undefined ? undefined : resolveEffectTarget(spec.target, ctx);
      cards = target?.kind === "object" ? [target.object] : [];
    } else if (from === "exiled-with-source") {
      cards = ctx.cardsExiledWithSource();
    } else if (from === "exiled-this-way") {
      cards = ctx.cardsExiledThisWay();
    } else if (from === "drawn-this-way") {
      cards = ctx.cardsDrawnThisWay();
    } else if (from === "source-exiled-this-way") {
      cards = ctx.sourceExiledThisWay();
    } else if (from === "face-up-exile-opponents-own") {
      cards = ctx.faceUpExileOpponentsOwn();
    } else if (from === "any-graveyard") {
      cards = ctx.playersInScope("each-player").flatMap((p) => ctx.cardsIn(p, "graveyard"));
    } else if (from === "targets") {
      // An illegal target's slot is blank (rule 608.2b); one already cast
      // is on the stack now, which the offer passes over.
      cards = ctx.targets.flatMap((t) => (t?.kind === "object" ? [t.object] : []));
    } else {
      cards = typeof from === "object" ? looked : ctx.cardsIn(ctx.controller, from);
    }
    if (spec.copies !== undefined) {
      cards = ctx.copyCards(cards, Math.max(0, Math.floor(amountValue(spec.copies, ctx))));
      // Several copies are each their own "may" (rule 707.12a).
      if (cards.length > 1 && spec.repeat !== true) {
        offerCastNow({ ...spec, copies: undefined, repeat: true }, { since: ctx.nextEventSeq(), cards, looked }, ctx);
        return;
      }
    }
    progress = {
      since: ctx.nextEventSeq(),
      cards,
      looked,
      ...(spec.upTo !== undefined ? { castsLeft: Math.floor(amountValue(spec.upTo, ctx)) } : {}),
      ...(spec.totalManaValue !== undefined ? { manaValueLeft: Math.floor(amountValue(spec.totalManaValue, ctx)) } : {}),
    };
    if (offerCastNow(spec, progress, ctx)) return;
    // "Look at that player's hand": still looked at with nothing to cast.
    if (typeof from === "object" && "handOf" in from && from.look === true && handOwner !== undefined) {
      ctx.discardChosen({ kind: "player", player: handOwner }, undefined, true, true, 0);
      return;
    }
    if (spec.repeat === true) {
      placeCastNowRest(spec, progress, ctx);
      return;
    }
  }
  // "Any number of them": one cast or played, the rest offered again — the
  // cards first offered, less what's on the stack or the battlefield now
  // (`castNow` passes those over). Not whatever else this resolution has
  // exiled since: a card a replacement exiled as a cost of casting one was
  // paid (Rest in Peace and Thrill of Possibility's discard) wasn't exiled
  // "this way".
  if (spec.repeat === true) {
    if (ctx.castSince(progress.cards, progress.since)) {
      const { castsLeft, manaValueLeft } = progress;
      const next: CastNowProgress = {
        since: ctx.nextEventSeq(),
        cards: progress.cards,
        looked: progress.looked,
        ...(castsLeft !== undefined ? { castsLeft: castsLeft - 1 } : {}),
        ...(manaValueLeft !== undefined
          ? { manaValueLeft: manaValueLeft - ctx.manaValueCastSince(progress.cards, progress.since) }
          : {}),
      };
      if (offerCastNow(spec, next, ctx)) return;
    }
    placeCastNowRest(spec, progress, ctx);
    return;
  }
  if (progress.followed !== true) {
    const by = spec.by === undefined ? undefined : effectPlayer(spec.by, ctx);
    const followUp = ctx.castSince(progress.cards, progress.since, by) ? spec.then : spec.else;
    if (followUp !== undefined) {
      const parked = ctx.parkedCount();
      const pendingBefore = ctx.decisionPending();
      applyEffectSpec(followUp, ctx);
      if (spec.rest !== undefined && !pendingBefore && ctx.decisionPending()) {
        ctx.resumeAfterDecisions({ ...spec, progress: { ...progress, followed: true } }, parked);
        return;
      }
    }
  }
  placeCastNowRest(spec, progress, ctx);
}

/** A `cast-now`'s `rest`: the cards it looked at and didn't cast, still in
 * the library, to its bottom. */
function placeCastNowRest(
  spec: Extract<EffectSpec, { kind: "cast-now" }>,
  progress: CastNowProgress,
  ctx: ResolutionContext,
): void {
  if (spec.rest !== undefined && progress.looked.length > 0) {
    ctx.placeRevealed(ctx.controller, progress.looked, spec.rest, false);
  }
}

/** How many flips "flip a coin until you lose a flip" makes at most — a
 * bound the seeded stream practically never reaches, against a loop. */
const MAX_FLIPS = 1000;

/** The most copies one `copy-spell` with a `count` puts on the stack — the
 * same resource bound as `Game.MAX_EFFECT_INSTANCES`, which this module
 * can't import (a real cycle). No real game gets near it. */
const MAX_COPY_COUNT = 1000;

/** Resolve an {@link EffectAmount} against the resolution context. `each`
 * is the player a scoped effect is being applied to right now, for a
 * per-player amount (`lifeTotal: "each"`).
 *
 * Never below 0 (rule 107.1b): a calculation that comes out negative uses 0,
 * so a sacrificed creature's negative power gains no life, adds no counters
 * and draws no cards. The calculation itself is done as written first — the
 * difference between a -1 power and a 3 toughness is 4 — and only its result
 * is clamped. A P/T change reads its amounts through {@link ptChangeValue}
 * instead, which keeps a card's own minus sign. */
export function amountValue(
  amount: EffectAmount,
  ctx: ResolutionContext,
  each?: PlayerId,
): number {
  return Math.max(0, signedAmountValue(amount, ctx, each));
}

/**
 * An amount that *sets* a power or toughness — a token copy's "except its
 * power is half that creature's power". Not clamped: rule 107.1b lets a value
 * that sets power or toughness be negative.
 */
export function ptSetValue(amount: EffectAmount, ctx: ResolutionContext): number {
  return signedAmountValue(amount, ctx);
}

/**
 * The amount a `modify-pt` or `modify-pt-all` adds to power or toughness.
 * Unlike every other amount it may be negative, but only by the card's own
 * sign: "-X/-X" is written `{ product: ["x", -1] }`, and its X is clamped at
 * 0 before the sign applies (rule 107.1b), as is the X of "+X/+X, where X is
 * its power". A doubling (`{ powerOf, doubling: true }`) reads the value as
 * it is: doubling a -2 power makes it -4 (rules 107.1b, 701.10d).
 */
export function ptChangeValue(
  amount: EffectAmount,
  ctx: ResolutionContext,
  each?: PlayerId,
): number {
  if (typeof amount === "number") return amount;
  if (typeof amount === "object" && "product" in amount) {
    const printed = amount.product.filter((a): a is number => typeof a === "number");
    if (printed.some((n) => n < 0)) {
      const rest = amount.product.filter((a) => typeof a !== "number");
      return printed.reduce((n, a) => n * a, 1) * amountValue({ product: rest }, ctx, each);
    }
  }
  if (typeof amount === "object" && ("powerOf" in amount || "toughnessOf" in amount) && amount.doubling === true) {
    return signedAmountValue(amount, ctx, each);
  }
  return amountValue(amount, ctx, each);
}

/** {@link amountValue} before its clamp: the calculation as written. */
function signedAmountValue(
  amount: EffectAmount,
  ctx: ResolutionContext,
  each?: PlayerId,
): number {
  if (amount === "x") return ctx.x;
  if (typeof amount === "number") return amount;
  if ("triggerValue" in amount) return ctx.triggerValue;
  if ("chosenNumber" in amount) return ctx.chosenNumberOfSource() ?? Number.NaN;
  if ("lifeTotal" in amount) {
    return ctx.lifeTotalOf(amount.lifeTotal === "each" ? (each ?? ctx.controller) : ctx.controller);
  }
  if ("lifeDifference" in amount) {
    const [first, second] = amount.lifeDifference.map((slot) => {
      const ref = ctx.targets[slot];
      return ref?.kind === "player" ? ctx.lifeTotalOf(ref.player) : undefined;
    });
    return first === undefined || second === undefined ? 0 : Math.abs(first - second);
  }
  if ("startingLifeTotal" in amount) return ctx.startingLifeTotal();
  if ("lowestLifeTotal" in amount) {
    return Math.min(...ctx.playersInScope("each-player").map((p) => ctx.lifeTotalOf(p)));
  }
  if ("powerOfTwo" in amount) {
    return 2 ** Math.min(52, Math.max(0, Math.floor(signedAmountValue(amount.powerOfTwo, ctx, each))));
  }
  if ("half" in amount) {
    // Signed, like the rest of this function: `amountValue` clamps the
    // result, and a value setting power keeps its sign (rule 107.1b).
    const n = signedAmountValue(amount.half, ctx, each) / (amount.fraction ?? 2);
    return amount.round === "up" ? Math.ceil(n) : Math.floor(n);
  }
  if ("countInGraveyard" in amount) {
    if (amount.forTarget !== undefined) {
      const ref = ctx.targets[amount.forTarget];
      if (ref?.kind !== "player" || illegalSlot(amount.forTarget, ctx)) return 0;
      return ctx.countInGraveyard(amount.countInGraveyard, ref.player);
    }
    if (amount.forPlayer !== undefined) {
      const player = effectPlayer(amount.forPlayer, ctx);
      return player === undefined ? 0 : ctx.countInGraveyard(amount.countInGraveyard, player);
    }
    return ctx.countInGraveyard(amount.countInGraveyard, amount.forEachPlayer === true ? each : undefined);
  }
  if ("suspendedCardsYouOwn" in amount) return ctx.suspendedCardsYouOwn?.() ?? 0;
  if ("timesKicked" in amount) return ctx.sourceTimesKicked();
  if ("ifCondition" in amount) {
    return signedAmountValue(ctx.conditionMet(amount.ifCondition) ? amount.then : amount.else, ctx, each);
  }
  if ("product" in amount) {
    return amount.product.reduce<number>((n, a) => n * signedAmountValue(a, ctx, each), 1);
  }
  if ("sum" in amount) {
    return amount.sum.reduce<number>((n, a) => n + signedAmountValue(a, ctx, each), 0);
  }
  if ("difference" in amount) {
    const a = signedAmountValue(amount.difference[0], ctx, each);
    const b = signedAmountValue(amount.difference[1], ctx, each);
    return amount.absolute === true ? Math.abs(a - b) : Math.max(0, a - b);
  }
  if ("leastOf" in amount) return Math.min(...amount.leastOf.map((a) => signedAmountValue(a, ctx, each)));
  if ("librarySize" in amount) {
    return ctx.librarySizeOf(amount.librarySize === "each" ? (each ?? ctx.controller) : ctx.controller);
  }
  if ("graveyardSize" in amount) {
    return ctx.graveyardSizeOf(amount.graveyardSize === "each" ? (each ?? ctx.controller) : ctx.controller);
  }
  if ("cardsInHand" in amount) {
    if (amount.cardsInHand === "each") return ctx.handSizeOf(each ?? ctx.controller);
    if (typeof amount.cardsInHand === "object") {
      const ref = ctx.targets[amount.cardsInHand.target];
      return ref?.kind === "player" ? ctx.handSizeOf(ref.player) : 0;
    }
    return ctx.playersInScope(amount.cardsInHand).reduce((n, p) => n + ctx.handSizeOf(p), 0);
  }
  if ("colorsOf" in amount) {
    const ref = resolveAmountRef(amount.colorsOf, ctx);
    return ref === undefined ? 0 : ctx.colorsOf(ref).length;
  }
  if ("colorsAmong" in amount) {
    return ctx.colorsAmong(amount.colorsAmong, amount.excludeSelf === true ? [ctx.source] : []);
  }
  if ("distinctTokenNames" in amount) return ctx.distinctTokenNames(amount.distinctTokenNames);
  if ("votesFor" in amount) {
    return ctx.votes().filter((v) => "option" in v.choice && v.choice.option === amount.votesFor).length;
  }
  if ("votesReceived" in amount) {
    const of = amount.votesReceived;
    if (of === "that-player") {
      const player = ctx.playersInScope("that-player")[0];
      return player === undefined
        ? 0
        : ctx.votes().filter((v) => "player" in v.choice && v.choice.player === player).length;
    }
    const ref = ctx.targets[of];
    if (ref?.kind !== "object") return 0;
    return ctx.votes().filter((v) => "object" in v.choice && v.choice.object === ref.object).length;
  }
  if ("votedNumber" in amount) return votedNumberAmount(amount.votedNumber, ctx);
  if ("opponentsVotedOtherwise" in amount) {
    return opponentsVoting(ctx.votes(), ctx.controller, ctx.playersInScope("each-opponent"), false).length;
  }
  if ("cardTypesInGraveyard" in amount) return ctx.cardTypesInGraveyard(amount.cardTypesInGraveyard);
  if ("opponentsAttacked" in amount) return ctx.opponentsAttacked();
  if ("attackingPlayer" in amount) return ctx.creaturesAttacking(each ?? ctx.controller);
  if ("damageDealtThisTurn" in amount) {
    return ctx.damageDealtThisTurn(ctx.playersInScope(amount.who ?? "you"), amount.combat, amount.colors);
  }
  if ("turnHistory" in amount) {
    if (amount.target !== undefined) {
      const ref = ctx.targets[amount.target];
      return ref?.kind === "player" ? ctx.turnHistoryCount(amount.turnHistory, [ref.player], amount.filter, amount) : 0;
    }
    return ctx.turnHistoryCount(amount.turnHistory, ctx.playersInScope(amount.who ?? "you"), amount.filter, amount);
  }
  if ("thisWay" in amount) {
    const players =
      amount.who === undefined
        ? undefined
        : amount.who === "each"
          ? [each ?? ctx.controller]
          : ctx.playersInScope(amount.who);
    const done = ctx.thisWay(amount.thisWay, players, amount.filter);
    if (amount.cardTypes === true) return ctx.cardTypesAmong(done);
    if (amount.sharingManaValue === true) {
      const values = done.map((entry) => ctx.manaValueOf({ kind: "object", object: entry.object }));
      return values.filter((value) => values.filter((other) => other === value).length > 1).length;
    }
    const greatestOf = amount.greatestOf;
    if (greatestOf !== undefined) {
      // Each object once, however many tokens a stack of it stood for.
      return Math.max(0, ...done.map((entry) => ctx.powerAmong([{ ...entry, count: 1 }], greatestOf)));
    }
    const valueOf = (entry: ThisWayEntry): number =>
      amount.sumOf === undefined ? entry.count : ctx.powerAmong([entry], amount.sumOf);
    if (amount.perPlayer === "greatest") {
      const byPlayer = new Map<PlayerId, number>();
      for (const entry of done) byPlayer.set(entry.player, (byPlayer.get(entry.player) ?? 0) + valueOf(entry));
      return Math.max(0, ...byPlayer.values());
    }
    // "The number of counters removed this way" counts a player's too (rule
    // 122.1 — Leeches' "loses all poison counters … that much damage"),
    // unless the amount asks about objects only (a filter or a sum of them).
    const fromPlayers =
      amount.thisWay === "counters-removed" && amount.filter === undefined && amount.sumOf === undefined
        ? ctx.playerCountersRemovedThisWay(players)
        : 0;
    return done.reduce((n, entry) => n + valueOf(entry), fromPlayers);
  }
  if ("countPlayers" in amount) {
    const players = ctx.playersInScope(amount.countPlayers);
    const where = amount.where;
    return where === undefined ? players.length : players.filter((p) => ctx.aboutPlayer(p).conditionMet(where)).length;
  }
  if ("lifeLostThisWay" in amount) {
    return ctx.lifeLostThisWay(amount.who === undefined ? undefined : ctx.playersInScope(amount.who));
  }
  if ("excessDamageThisWay" in amount) {
    if (amount.to === undefined) return ctx.excessDamageThisWay();
    const ref = ctx.targets[amount.to];
    return ref?.kind === "object" ? ctx.excessDamageThisWay(ref.object) : 0;
  }
  if ("damageDealtThisWay" in amount) {
    if (amount.to === undefined) return ctx.damageDealtThisWay();
    const ref = ctx.targets[amount.to];
    return ref === undefined ? 0 : ctx.damageDealtThisWay(ref);
  }
  if ("damagePreventedThisWay" in amount) return ctx.damagePreventedThisWay();
  if ("keptOnTopThisWay" in amount) return ctx.keptOnTopThisWay();
  if ("turnStat" in amount) {
    if (amount.target !== undefined) {
      const ref = ctx.targets[amount.target];
      return ref?.kind === "player" ? ctx.turnStatOf(ref.player, amount.turnStat) : 0;
    }
    // Wound Reflection's "each opponent loses life equal to the life they lost
    // this turn": each one's own, read as the scoped effect reaches them.
    if (amount.who === "each") return ctx.turnStatOf(each ?? ctx.controller, amount.turnStat);
    // What happened this turn stays so after a player leaves: "life your
    // opponents have lost this turn" counts one who has since lost the game
    // (Neheb, the Eternal's ruling).
    return ctx
      .playersCountedInScope(amount.who ?? "you")
      .reduce((n, p) => n + ctx.turnStatOf(p, amount.turnStat), 0);
  }
  if ("castThisTurn" in amount) {
    const cast = ctx.playersInScope(amount.who ?? "you").map((p) => ctx.castThisTurnOf(p, amount.castThisTurn, amount));
    return amount.greatest === undefined ? cast.reduce((n, v) => n + v, 0) : Math.max(0, ...cast);
  }
  if ("countersPutThisTurn" in amount) return ctx.countersPutThisTurn(amount.countersPutThisTurn);
  if ("playerCounters" in amount) {
    return ctx
      .playersInScope(amount.who ?? "you")
      .reduce((n, p) => n + ctx.playerCountersOf(p, amount.playerCounters), 0);
  }
  if ("speed" in amount) return ctx.speedOf(ctx.controller);
  if ("playersWithTurnStat" in amount) {
    return ctx
      .playersCountedInScope(amount.who)
      .filter((p) => ctx.turnStatOf(p, amount.playersWithTurnStat) > 0).length;
  }
  if ("opponentsControllingFewer" in amount) {
    return ctx.opponentsControllingFewer(amount.opponentsControllingFewer);
  }
  if ("devotionTo" in amount) {
    // "Your devotion to that color" — the colour the `add-mana` reading it
    // is making (Nykthos); with none chosen there's no colour to be devoted to.
    if (Array.isArray(amount.devotionTo)) return ctx.devotionTo(amount.devotionTo);
    const color = amount.devotionTo === "that-color" ? ctx.manaColor : amount.devotionTo;
    return color === undefined || color === "C" ? 0 : ctx.devotionTo([color as Color]);
  }
  if ("greatestCommanderManaValue" in amount) return ctx.greatestCommanderManaValue();
  if ("basicLandTypes" in amount) return ctx.basicLandTypes();
  if ("partySize" in amount) return ctx.partySize();
  if ("timesMutated" in amount) return ctx.timesMutated();
  if ("blockersOf" in amount) {
    const object = amount.blockersOf === "trigger-object" ? ctx.triggerObject : ctx.source;
    return object === undefined ? 0 : ctx.creaturesBlocking(object);
  }
  if ("creaturesDiedThisTurn" in amount) return ctx.creaturesDiedThisTurn(amount.anyController === true);
  if ("powerOf" in amount) {
    const ref = resolveAmountRef(amount.powerOf, ctx);
    return ref === undefined ? 0 : ctx.powerOf(ref);
  }
  if ("toughnessOf" in amount) {
    const ref = resolveAmountRef(amount.toughnessOf, ctx);
    return ref === undefined ? 0 : ctx.toughnessOf(ref);
  }
  if ("countersOn" in amount) {
    const ref = resolveAmountRef(amount.countersOn, ctx);
    return ref === undefined ? 0 : ctx.countersOf(ref, amount.counter);
  }
  if ("manaValueOf" in amount) {
    const ref = resolveAmountRef(amount.manaValueOf, ctx);
    return ref === undefined ? 0 : ctx.manaValueOf(ref);
  }
  if ("manaSpentOf" in amount) {
    const ref = resolveAmountRef(amount.manaSpentOf, ctx);
    if (ref === undefined) return 0;
    const from = amount.from;
    if (from === undefined) return ctx.manaSpentOf(ref);
    return ctx.manaSpentFromOf(ref).filter((origin) => manaOriginMatches(origin, from)).length;
  }
  if ("colorsSpentOf" in amount) {
    const ref = resolveAmountRef(amount.colorsSpentOf, ctx);
    return ref === undefined ? 0 : ctx.colorsSpentOf(ref);
  }
  if ("convokers" in amount) return ctx.convokerCount();
  if ("phyrexianPaidWithLife" in amount) return ctx.phyrexianPaidWithLife();
  if ("commanderCasts" in amount) return ctx.commanderCastsBy(ctx.controller);
  if ("roll" in amount) {
    const last = ctx.lastRoll();
    if (last === undefined) return 0;
    if (amount.roll === "total") return last.total;
    if (amount.roll === "odd") return last.results.filter((r) => r % 2 === 1).length;
    if (amount.roll === "even") return last.results.filter((r) => r % 2 === 0).length;
    const n = amount.roll.equals;
    return last.results.filter((r) => r === n).length;
  }
  if ("exiledWithSourceManaValue" in amount) {
    return ctx.cardsExiledWithSource().reduce((n, id) => n + ctx.manaValueOf({ kind: "object", object: id }), 0);
  }
  if ("exiledWithSourcePower" in amount) {
    return ctx.cardsExiledWithSource().reduce((n, id) => n + ctx.powerOf({ kind: "object", object: id }), 0);
  }
  if ("commanderCastsOf" in amount) {
    const ref = resolveAmountRef(amount.commanderCastsOf, ctx);
    return ref === undefined ? 0 : ctx.commanderCastsOf(ref);
  }
  if ("aggregate" in amount) {
    const except = amount.excludeSelf === true ? [ctx.source] : [];
    if (amount.forTarget !== undefined) {
      const ref = ctx.targets[amount.forTarget];
      if (ref?.kind !== "player" || illegalSlot(amount.forTarget, ctx)) return 0;
      return Math.max(0, ctx.aggregate(amount, except, ref.player));
    }
    return Math.max(0, ctx.aggregate(amount, except));
  }
  const except: ObjectId[] = [];
  if (amount.excludeSelf === true) except.push(ctx.source);
  if (amount.excludeTarget !== undefined) {
    const ref = ctx.targets[amount.excludeTarget];
    if (ref?.kind === "object") except.push(ref.object);
  }
  if (amount.forTarget !== undefined) {
    const ref = ctx.targets[amount.forTarget];
    if (ref?.kind !== "player" || illegalSlot(amount.forTarget, ctx)) return 0;
    return ctx.countMatching(amount.countOf, except, ref.player) * (amount.times ?? 1);
  }
  if (amount.forPlayer !== undefined) {
    const player = effectPlayer(amount.forPlayer, ctx);
    if (player === undefined) return 0;
    return ctx.countMatching(amount.countOf, except, player) * (amount.times ?? 1);
  }
  if (amount.forEachPlayer === true && each !== undefined) {
    return ctx.countMatching(amount.countOf, except, each) * (amount.times ?? 1);
  }
  return ctx.countMatching(amount.countOf, except) * (amount.times ?? 1);
}

/** The player a `controlledByTarget` slot points at, or `undefined` when the
 * effect isn't scoped to one — in which case the mass effect keeps reading
 * `controlledBy` from the effect's own controller, as it always has. */
function scopedController(
  slot: number | undefined,
  ctx: ResolutionContext,
): PlayerId | undefined {
  if (slot === undefined) return undefined;
  const ref = ctx.targets[slot];
  return ref === undefined ? undefined : ctx.controllerOf(ref);
}

/** What an `attachedTo` names, for a card put onto the battlefield attached
 * to it (see {@link EnterAttachHost}): the permanent, the player in the slot
 * (rule 303.4), the filter its host is chosen from as it enters, `null` for
 * nothing there (it has left — rule 400.7 — or the slot was found illegal,
 * 608.2b), or `undefined` for no `attachedTo` at all. */
/** A choice's `together` as it's raised: a mana value cap's amount read now. */
function resolvedTogether(
  together: SearchTogether | undefined,
  ctx: ResolutionContext,
): ResolvedSearchTogether | undefined {
  if (together === undefined) return undefined;
  return "totalManaValueAtMost" in together
    ? { totalManaValueAtMost: amountValue(together.totalManaValueAtMost, ctx) }
    : together;
}

function attachHost(ref: AttachHostRef | undefined, ctx: ResolutionContext): EnterAttachHost | undefined {
  if (ref === undefined) return undefined;
  if (typeof ref === "object") return { among: ref.among };
  if (ref === "source" && ctx.sourceLost === true) return null;
  if (illegalSlot(ref, ctx)) return null;
  const target = resolveEffectTarget(ref, ctx);
  if (target?.kind === "player") return { player: target.player };
  return target?.kind === "object" ? target.object : null;
}

/** The first token this resolution has created that is still on the
 * battlefield — living weapon's "then attach this to it". */
function createdThisWay(ctx: ResolutionContext): TargetRef | undefined {
  const made = ctx.thisWay("created").find((entry) => !entry.departed);
  return made === undefined ? undefined : { kind: "object", object: made.object };
}

/** The first card this resolution has put onto the battlefield that is still
 * there as the same object — Pre-War Formalwear's "return target creature
 * card … and attach this Equipment to it". */
function putThisWay(ctx: ResolutionContext): TargetRef | undefined {
  const put = ctx.thisWay("put-onto-battlefield").find((entry) => !entry.departed);
  return put === undefined ? undefined : { kind: "object", object: put.object };
}

/** What an {@link AttachRef} names now. */
function resolveAttachRef(ref: AttachRef, ctx: ResolutionContext): TargetRef | undefined {
  if (ref === "created") return createdThisWay(ctx);
  if (ref === "put-this-way") return putThisWay(ctx);
  return resolveEffectTarget(ref, ctx);
}

/** Imperative escape hatch for a spell or ability the vocab can't express. */
export type SpellResolver = (ctx: ResolutionContext) => void;

function resolveAmountRef(ref: AmountRef, ctx: ResolutionContext): TargetRef | undefined {
  if (ref === "sacrificed") {
    return ctx.sacrificed === undefined ? undefined : { kind: "object", object: ctx.sacrificed };
  }
  if (ref === "tapped") {
    return ctx.tapped === undefined ? undefined : { kind: "object", object: ctx.tapped };
  }
  // "The discarded card": the cost's one discarded card, where it went.
  if (ref === "discarded") {
    return ctx.discarded?.length === 1 ? { kind: "object", object: ctx.discarded[0] } : undefined;
  }
  // "The revealed card": the cost's one revealed card — the context's reads
  // know to take it as it was in the hand once it has left.
  if (ref === "revealed") {
    return ctx.revealed?.length === 1 ? { kind: "object", object: ctx.revealed[0] } : undefined;
  }
  // "The exiled card": the cost's one card exiled from a graveyard.
  if (ref === "exiled-as-cost") {
    return ctx.exiledAsCost?.length === 1 ? { kind: "object", object: ctx.exiledAsCost[0] } : undefined;
  }
  // A read of the granter: as it last existed once it has left (608.2h) —
  // "the number of arrow counters on Archery Training".
  if (ref === "granter") {
    return ctx.granter === undefined ? undefined : { kind: "object", object: ctx.granter };
  }
  if (ref === "trigger-recipient") return ctx.triggerRecipient(true);
  // A read: a trigger object — or the source — that has moved on since is
  // read as it last existed, which the context's lookups do (rule 608.2h).
  // Only acting on one needs it to be the same object still (`sourceLost`,
  // `triggerObjectLost`): Juri, Master of the Revue reanimated in response
  // still deals the power it died with.
  if (ref === "trigger-object") {
    return ctx.triggerObject === undefined ? undefined : { kind: "object", object: ctx.triggerObject };
  }
  if (ref === "source") return { kind: "object", object: ctx.source };
  // A read, so a delayed trigger's carried target is read even once it has
  // changed zones (by last-known information), though not acted on.
  if (typeof ref === "number" && ctx.readTargets !== undefined) return ctx.readTargets[ref];
  return resolveEffectTarget(ref, ctx);
}

const PROTECTION_COLOR_WORDS: Readonly<Record<Color, string>> = {
  W: "white",
  U: "blue",
  B: "black",
  R: "red",
  G: "green",
};

/** Every card type (rule 300.1), for "the card type of your choice". */
const PROTECTION_CARD_TYPES: readonly CardType[] = [
  "artifact",
  "battle",
  "creature",
  "enchantment",
  "instant",
  "kindred",
  "land",
  "planeswalker",
  "sorcery",
];

/** The qualities a {@link ProtectionChoice} offers, each with its word:
 * its `or` alternatives first, as printed ("from colorless or from the color
 * of your choice"), then the colours or card types. */
export function protectionChoiceOptions(
  choice: ProtectionChoice,
): readonly { readonly text: string; readonly from: ProtectionQualities }[] {
  const listed =
    choice.choose === "color"
      ? (Object.keys(PROTECTION_COLOR_WORDS) as Color[]).map((c) => ({
          text: PROTECTION_COLOR_WORDS[c],
          from: { colors: [c] },
        }))
      : PROTECTION_CARD_TYPES.map((t) => ({ text: `${t}s`, from: { types: [t] } }));
  return [...(choice.or ?? []), ...listed];
}

/** "protection from red and from artifacts" — the log's words for a grant. */
export function protectionLabel(from: ProtectionQualities): string {
  const words = [
    ...(from.colors ?? []).map((c) => PROTECTION_COLOR_WORDS[c]),
    ...(from.types ?? []).map((t) => `${t}s`),
    ...(from.filter === undefined ? [] : protectionFilterWords(from.filter)),
    // Fixed to the players as it resolves, however few are left.
    ...(from.fromPlayers === undefined ? [] : ["each of your opponents"]),
  ];
  return `protection from ${words.length === 0 ? "nothing" : words.join(" and from ")}`;
}

/** A protection filter in words, each `anyOf` its own ("instant spells",
 * "sorcery spells"): "everything", "colorless", "Zombies", "creatures your
 * opponents control". What the shape doesn't say reads as "a quality". */
function protectionFilterWords(filter: CardFilter): readonly string[] {
  if (filter.anyOf !== undefined && Object.keys(filter).length === 1) return filter.anyOf.flatMap(protectionFilterWords);
  if (Object.keys(filter).length === 0) return ["everything"];
  const { colorless, multicolored, not, subtype, type, isSpell, colors, controlledBy, controllerIn, ...rest } = filter;
  if (Object.keys(rest).length > 0) return ["a quality"];
  const adjectives = [
    ...(colorless === true ? ["colorless"] : []),
    ...(multicolored === true ? ["multicolored"] : []),
    ...(colors ?? []).map((c) => PROTECTION_COLOR_WORDS[c]),
    ...(colorless === false ? ["colored"] : []),
    ...(type !== undefined && (isSpell === true || subtype !== undefined) ? [type] : []),
  ];
  if (not !== undefined) return ["a quality"];
  const noun =
    isSpell === true
      ? "spells"
      : subtype !== undefined
        ? `${subtype}s`
        : type !== undefined
          ? `${type}s`
          : adjectives.length === 0
            ? "objects"
            : "";
  const side = controlledBy === "opponent" || controllerIn !== undefined ? " your opponents control" : controlledBy === "you" ? " you control" : "";
  return [`${[...adjectives, noun].filter((w) => w !== "").join(" ")}${side}`];
}

/** A protection filter's "you" and "your opponents" are the effect's
 * controller's, fixed as it resolves ("protection from creatures your
 * opponents control" — Crypsis): the filter is otherwise read from the
 * protected permanent's controller's side, which a later change of control
 * would move. Rewritten to the players themselves (`controllerIn`). */
function fixProtectionSide(from: ProtectionQualities, ctx: ResolutionContext): ProtectionQualities {
  const { fromChosenPlayer, ...named } = from;
  const fixed =
    fromChosenPlayer === true
      ? { ...named, fromPlayers: ctx.playersInScope("chosen-player") }
      : from.fromPlayers === "opponents"
        ? { ...named, fromPlayers: ctx.playersInScope("each-opponent") }
        : named;
  const filter = fixed.filter;
  if (filter?.controlledBy !== "you" && filter?.controlledBy !== "opponent") return fixed;
  const { controlledBy, ...rest } = filter;
  const players = controlledBy === "you" ? [ctx.controller] : ctx.playersInScope("each-opponent");
  return { ...fixed, filter: { ...rest, controllerIn: players } };
}

function resolveEffectTarget(
  ref: EffectTargetRef,
  ctx: ResolutionContext,
): TargetRef | undefined {
  if (ref === "source") {
    return ctx.sourceLost === true ? undefined : { kind: "object", object: ctx.source };
  }
  if (ref === "trigger-object") {
    return ctx.triggerObject !== undefined && ctx.triggerObjectLost !== true
      ? { kind: "object", object: ctx.triggerObject }
      : undefined;
  }
  if (ref === "attached") {
    const host = ctx.attachedHost();
    return host === undefined ? undefined : { kind: "object", object: host };
  }
  if (ref === "chosen") {
    const chosen = ctx.chosenPermanent();
    return chosen === undefined ? undefined : { kind: "object", object: chosen };
  }
  if (ref === "granter") {
    return ctx.granter !== undefined && ctx.granterLost !== true ? { kind: "object", object: ctx.granter } : undefined;
  }
  if (ref === "trigger-recipient") return ctx.triggerRecipient();
  if (ref === "tapped") {
    return ctx.tapped !== undefined && ctx.tappedLost !== true ? { kind: "object", object: ctx.tapped } : undefined;
  }
  return ctx.targets[ref];
}

/** Where a redirection's `redirectTo` sends the damage (rule 614.9), or
 * `undefined` when it names nothing still legal. */
function redirectRef(ref: EffectTargetRef | "you", ctx: ResolutionContext): TargetRef | undefined {
  if (ref === "you") return { kind: "player", player: ctx.controller };
  if (illegalSlot(ref, ctx)) return undefined;
  return resolveEffectTarget(ref, ctx);
}

/** Whether slot `ref` held a target found illegal as the spell or ability
 * began to resolve — see `ResolutionContext.illegalTargets` (rule 608.2b). */
function illegalSlot(ref: EffectTargetRef, ctx: ResolutionContext): boolean {
  return typeof ref === "number" && ctx.illegalTargets?.includes(ref) === true;
}

/** The one player `ref` names, or `undefined` for nobody — see
 * {@link EffectPlayerRef}. */
function resolveEnterAttacking(
  how: EnterAttacking | undefined,
  ctx: ResolutionContext,
): ResolvedEnterAttacking | undefined {
  if (how === undefined || how === "choose") return how;
  return { player: effectPlayer(how.player, ctx), orTheirPlaneswalker: how.orTheirPlaneswalker === true };
}

function effectPlayer(ref: EffectPlayerRef, ctx: ResolutionContext): PlayerId | undefined {
  if (ref === "you") return ctx.controller;
  if (ref === "source-owner") {
    const owner = ctx.ownerOf({ kind: "object", object: ctx.source });
    return owner !== undefined && ctx.playersInScope("each-player").includes(owner) ? owner : undefined;
  }
  if (typeof ref === "object" && "ownerOfTarget" in ref) {
    const target = ctx.targets[ref.ownerOfTarget];
    const player = target === undefined ? undefined : ctx.ownerOf(target);
    return player !== undefined && ctx.playersInScope("each-player").includes(player) ? player : undefined;
  }
  if (typeof ref === "object" && "controllerOfTarget" in ref) {
    const target = ctx.targets[ref.controllerOfTarget];
    const player = target === undefined ? undefined : ctx.controllerOf(target);
    return player !== undefined && ctx.playersInScope("each-player").includes(player) ? player : undefined;
  }
  if (typeof ref === "object") {
    if (illegalSlot(ref.target, ctx)) return undefined;
    const target = ctx.targets[ref.target];
    return target?.kind === "player" ? target.player : undefined;
  }
  return ctx.playersInScope(ref)[0];
}

/** Keys under which an {@link EffectSpec} nests another one. Those are bound
 * when *they* are applied, in the context they're applied in — a delayed
 * trigger's effect when it fires, a `then` after the step before it. */
const NESTED_EFFECT_KEYS: ReadonlySet<string> = new Set([
  "effect",
  "effects",
  "then",
  "else",
  "otherwise",
  "modes",
  // An `each-player-may`'s follow-ups, which apply once everyone has
  // answered — Braids, Arisen Nightmare's "each opponent may sacrifice a
  // permanent that shares a card type with it" reads the permanent its
  // controller sacrificed in answer, which only exists by then.
  "ifDid",
  "ifDidnt",
  // What an `unless` option has its chooser do: "you" in it is them.
  "doing",
  // A `for-each-player`'s instruction to do before its players act.
  "before",
  // A granted ability (`grant-activated`, `grant-triggered`, their `-all`
  // forms) and an emblem's: each is bound when *it* triggers or is
  // activated, against its own source — Guardian Scalelord's "mana value X
  // or less, where X is this creature's power" on the creature backup gave
  // it to reads that creature, not the Scalelord.
  "ability",
  "triggered",
  "activated",
]);

/** Is this a `NumCompare` whose `n` is an `{ amount }` operand? Written out
 * rather than imported from `filter.ts`, which `effects.ts` only ever needs
 * types from. */
function isAmountCompare(value: Record<string, unknown>): boolean {
  const n = value["n"];
  return "op" in value && typeof n === "object" && n !== null && "amount" in n;
}

/** Card data is immutable, so whether a spec holds anything to bind is worth
 * remembering: nearly every resolution asks, and nearly none do. */
const dynamicCompareMemo = new WeakMap<object, boolean>();

function containsDynamicCompare(value: unknown): boolean {
  if (value === null || typeof value !== "object") return false;
  const memo = dynamicCompareMemo.get(value);
  if (memo !== undefined) return memo;
  const found = Array.isArray(value)
    ? value.some(containsDynamicCompare)
    : isAmountCompare(value as Record<string, unknown>) ||
      "sharesCardTypeWith" in value ||
      "sharesPermanentTypeWith" in value ||
      "sharesCreatureTypeWith" in value ||
      "sharesLandTypeWith" in value ||
      "sameNameWith" in value ||
      "saddledSource" in value ||
      "crewedSource" in value ||
      "bandedWithSource" in value ||
      "blockingRelation" in value ||
      "blockedThisTurn" in value ||
      "sameNameAsTarget" in value ||
      "sameNameAsTriggerObject" in value ||
      "sameNameAsThisWay" in value ||
      "sharesColorWithTarget" in value ||
      "attachedToTarget" in value ||
      "triggerBatch" in value ||
      Object.entries(value).some(
        ([key, v]) => !NESTED_EFFECT_KEYS.has(key) && containsDynamicCompare(v),
      );
  dynamicCompareMemo.set(value, found);
  return found;
}

/** The permanent types (rule 110.4) — `sharesPermanentTypeWith`'s. */
const PERMANENT_TYPES: ReadonlySet<CardType> = new Set<CardType>([
  "artifact",
  "battle",
  "creature",
  "enchantment",
  "land",
  "planeswalker",
]);

/**
 * `spec` with every filter comparison's `{ amount }` operand (see
 * `DynamicOperand`) replaced by its value **now**, in this resolution.
 *
 * This is how "with lesser mana value" reaches every filter an effect hands
 * to the engine — a sweep's, a search's, a count's — without each of those
 * growing a context parameter: by the time the filter leaves this function
 * it is plain numbers again. It runs as each effect applies, not once per
 * resolution, so "sacrifice a creature, then search for one with mana value
 * one greater" reads the sacrifice that has just happened. `{ own }` operands
 * are left alone: they're about each object matched, not about the effect.
 *
 * The `CardFilter.shares…TypeWith` clauses are bound the same way, to a
 * `sharesTypeWith` entry holding the reference objects and their types of
 * that kind as the effect applies (as they last existed if they've left).
 */
/** The objects a `CardFilter.blockedThisTurn`'s `of` names, each in the stint
 * it's in or last was on the battlefield. */
function blockPartners(
  of: number | "each-target" | "source",
  ctx: ResolutionContext,
): readonly { readonly object: ObjectId; readonly stint: number }[] {
  const ids =
    of === "source"
      ? [ctx.source]
      : (of === "each-target" ? [...ctx.targets] : [ctx.targets[of]]).map((t) => (t?.kind === "object" ? t.object : undefined));
  return ids.flatMap((id) => (id === undefined ? [] : [{ object: id, stint: ctx.battlefieldStintOf(id) }]));
}

/** `value` with every `blockedThisTurn` clause in it bound to the objects its
 * `of` names now, nested effects included; `value` itself if there's none. For
 * a delayed ability's effect, as it's set up: what it says "it" about is fixed
 * then, and it's no target of its own (rule 603.7c). */
function bindBlockPartners<T>(value: T, ctx: ResolutionContext): T {
  if (value === null || typeof value !== "object") return value;
  if (Array.isArray(value)) {
    const items = value.map((item) => bindBlockPartners(item as unknown, ctx));
    return items.some((item, i) => item !== value[i]) ? (items as T) : value;
  }
  const record = value as Record<string, unknown>;
  const entries = Object.entries(record).map(([key, v]): [string, unknown] => {
    if (key === "blockedThisTurn") {
      const clause = v as NonNullable<CardFilter["blockedThisTurn"]>;
      return [key, clause.of !== undefined && clause.with === undefined ? { ...clause, with: blockPartners(clause.of, ctx) } : v];
    }
    return [key, bindBlockPartners(v, ctx)];
  });
  return entries.some(([key, v]) => v !== record[key]) ? (Object.fromEntries(entries) as T) : value;
}

export function bindDynamicCompares(spec: EffectSpec, ctx: ResolutionContext): EffectSpec {
  if (!containsDynamicCompare(spec)) return spec;
  const walk = (value: unknown): unknown => {
    if (value === null || typeof value !== "object") return value;
    if (Array.isArray(value)) return value.map(walk);
    const record = value as Record<string, unknown>;
    if (isAmountCompare(record)) {
      const operand = record["n"] as { readonly amount: EffectAmount };
      return { ...record, n: amountValue(operand.amount, ctx) };
    }
    // A reflexive ability's targets are bound here, in the creating
    // resolution, but they're its own (rule 603.12): `{ triggerValue: true }`
    // in one reads the value it triggers with (`value`), not the creating
    // ability's.
    if (record["kind"] === "reflexive-trigger" && record["value"] !== undefined) {
      const own = Object.create(ctx, {
        triggerValue: { value: amountValue(record["value"] as EffectAmount, ctx) },
      }) as ResolutionContext;
      const { targets } = bindDynamicCompares({ targets: record["targets"] } as unknown as EffectSpec, own) as unknown as {
        readonly targets: unknown;
      };
      return { ...record, targets };
    }
    // A `whileSource` impulse permission's filter is its source's static
    // ability, read as the card is cast (Maralen's "the number of Elves and
    // Faeries you control"), so it stays unbound — `impulsePlayable` counts it.
    const liveFilter = record["kind"] === "impulse-exile" && record["whileSource"] === true;
    const walked = Object.fromEntries(
      Object.entries(record).map(([key, v]) => [
        key,
        NESTED_EFFECT_KEYS.has(key) || (liveFilter && key === "filter") ? v : walk(v),
      ]),
    );
    return bindShares(walked);
  };
  // "Shares a card / permanent / creature / land type with it": the
  // reference objects (`ShareReference`) and their types of that kind as
  // they are now, or as they last existed if they've left (`cardTypesOf`,
  // `subtypesOf`) — the changeling marker included, which `hasSubtype` reads
  // as "any creature type".
  const bindSharedTypes = (filter: Record<string, unknown>): Record<string, unknown> => {
    let rest = filter;
    const bound: SharedTypes[] = [];
    for (const [key, kind] of SHARE_CLAUSES) {
      if (!(key in rest)) continue;
      const { [key]: reference, ...others } = rest;
      rest = others;
      const objects = shareReferenceObjects(reference as ShareReference, ctx);
      const types = new Set<string>();
      for (const object of objects) {
        const ref: TargetRef = { kind: "object", object };
        if (kind === "card" || kind === "permanent") {
          for (const t of ctx.cardTypesOf(ref)) if (kind === "card" || PERMANENT_TYPES.has(t)) types.add(t);
        } else {
          for (const s of ctx.subtypesOf(ref)) {
            const fits =
              kind === "creature" ? s === EVERY_CREATURE_TYPE || isCreatureType(s) : s === EVERY_LAND_TYPE || isLandType(s);
            if (fits) types.add(s);
          }
        }
      }
      bound.push({ kind, objects, types: [...types] });
    }
    if (bound.length === 0) return filter;
    const already = (rest["sharesTypeWith"] as readonly SharedTypes[] | undefined) ?? [];
    return { ...rest, sharesTypeWith: [...already, ...bound] };
  };
  const bindShares = (unbound: Record<string, unknown>): unknown => {
    // "A creature that saddled it this turn" (rule 702.171c): the resolving
    // ability's source, which the matching then reads by id.
    let walked = bindSharedTypes(unbound);
    if (walked["saddledSource"] === true) {
      const { saddledSource: _saddled, ...rest } = walked;
      walked = { ...rest, saddledBy: ctx.source };
    }
    // "Those creatures", "each of them": the batch the resolving trigger fired
    // on, each in the stint it was in then (rule 400.7).
    if (walked["triggerBatch"] === true) {
      const { triggerBatch: _batch, ...rest } = walked;
      const amongObjects = (ctx.triggerBatch ?? []).map(({ object, zoneChangeCount }) => ({ object, stint: zoneChangeCount }));
      walked = { ...rest, amongObjects };
    }
    // "Each creature that crewed it this turn" (rule 702.122c), likewise.
    if (walked["crewedSource"] === true) {
      const { crewedSource: _crewed, ...rest } = walked;
      walked = { ...rest, crewedBy: ctx.source };
    }
    // "Creatures banded with it" (rule 702.22): the resolving ability's
    // source's band.
    if (walked["bandedWithSource"] === true) {
      const { bandedWithSource: _banded, ...rest } = walked;
      walked = { ...rest, bandedWith: ctx.source };
    }
    // "Each creature blocking it", "creatures blocking enchanted creature":
    // the resolving ability's source, its host — now, or as it left — or the
    // object its trigger names, whatever has happened to it since: only
    // `inBlockingRelation`'s read of it decides what it's still in.
    const relation = walked["blockingRelation"] as CardFilter["blockingRelation"];
    if (relation !== undefined && relation.with === undefined) {
      const partner =
        relation.of === "host" ? ctx.attachedHost() : relation.of === "trigger-object" ? ctx.triggerObject : ctx.source;
      if (partner !== undefined) walked = { ...walked, blockingRelation: { relation: relation.relation, with: partner } };
    }
    // "That blocked or were blocked by it this turn": the objects it names.
    const blocked = walked["blockedThisTurn"] as CardFilter["blockedThisTurn"];
    if (blocked?.of !== undefined && blocked.with === undefined) {
      walked = { ...walked, blockedThisTurn: { ...blocked, with: blockPartners(blocked.of, ctx) } };
    }
    // "And all other permanents with the same name as that permanent": the
    // target itself and its name now (rule 201.2a). A target that's gone
    // leaves the clause matching nothing — the spell has no other target, so
    // it doesn't resolve at all (rule 608.2b).
    if (typeof walked["sameNameAsTarget"] === "number") {
      const { sameNameAsTarget: slot, ...rest } = walked;
      const target = ctx.targets[slot as number];
      walked =
        target?.kind === "object"
          ? { ...rest, sameNameAs: { object: target.object, name: ctx.nameForMatching(target.object) } }
          : walked;
    }
    // "With the same name as that spell" (the Shrines): the trigger object
    // and its name now — `nameForMatching` reads a spell that has since left
    // the stack under the same id, so a countered one still has its name.
    if (walked["sameNameAsTriggerObject"] === true) {
      const { sameNameAsTriggerObject: _trigger, ...rest } = walked;
      const object = ctx.triggerObject;
      walked =
        object !== undefined ? { ...rest, sameNameAs: { object, name: ctx.nameForMatching(object) } } : walked;
    }
    // "With the same name as it / the exiled card / a permanent": the names
    // of what the reference names now (or last had) — every reference, since
    // an effect's matching has no source to read the live ones from.
    if ("sameNameWith" in walked) {
      const { sameNameWith: reference, ...rest } = walked;
      const names = shareReferenceObjects(reference as ShareReference, ctx)
        .map((object) => ctx.nameForMatching(object))
        .filter((name): name is string => name !== null);
      walked = { ...rest, sameNameAsAny: [...new Set(names)] };
    }
    // "For each card exiled this way, … with the same name as that card"
    // (Haunting Echoes): the names of what this resolution has done that to.
    if (typeof walked["sameNameAsThisWay"] === "string") {
      const { sameNameAsThisWay: what, ...rest } = walked;
      const names = ctx
        .thisWay(what as ThisWayKind)
        .map((entry) => ctx.nameForMatching(entry.object))
        .filter((name): name is string => name !== null);
      walked = { ...rest, sameNameAsAny: [...new Set(names)] };
    }
    // Radiance's "and each other … that shares a color with it": the target
    // and its colors now (rule 105.2), as for the name above.
    if (typeof walked["sharesColorWithTarget"] === "number") {
      const { sharesColorWithTarget: slot, ...rest } = walked;
      const target = ctx.targets[slot as number];
      walked =
        target?.kind === "object"
          ? { ...rest, sharesColorWith: { object: target.object, colors: ctx.colorsOf(target) } }
          : walked;
    }
    // "All Auras attached to it", "all Equipment attached to that creature":
    // the target slot's object or player; illegal or empty, nothing (rule
    // 608.2b — `ctx.targets` holds a hole there).
    if (typeof walked["attachedToTarget"] === "number") {
      const { attachedToTarget: slot, ...rest } = walked;
      walked = { ...rest, attachedToRef: ctx.targets[slot as number] ?? null };
    }
    return walked;
  };
  return walk(spec) as EffectSpec;
}

/** The `shares…TypeWith` clauses and the kind of type each compares (rule
 * 205.2a card types, 110.4 permanent types, 205.3m creature types, 205.3i
 * land types). */
const SHARE_CLAUSES = [
  ["sharesCardTypeWith", "card"],
  ["sharesPermanentTypeWith", "permanent"],
  ["sharesCreatureTypeWith", "creature"],
  ["sharesLandTypeWith", "land"],
] as const satisfies readonly (readonly [keyof CardFilter, SharedTypes["kind"]])[];

/** The objects a `ShareReference` names in this resolution — see its doc. */
function shareReferenceObjects(reference: ShareReference, ctx: ResolutionContext): readonly ObjectId[] {
  const one = (object: ObjectId | undefined): readonly ObjectId[] => (object === undefined ? [] : [object]);
  if (reference === "source") return [ctx.source];
  if (reference === "trigger-object") return one(ctx.triggerObject);
  if (reference === "sacrificed") return one(ctx.sacrificed);
  if (reference === "attached") return one(ctx.attachedHost());
  if (reference === "chosen") return one(ctx.chosenPermanent());
  if (reference === "exiled-with-source") return ctx.cardsExiledWithSource(true);
  if (typeof reference === "number") {
    if (illegalSlot(reference, ctx)) return [];
    const target = ctx.targets[reference];
    return target?.kind === "object" ? [target.object] : [];
  }
  // "Their graveyard" asks about the object being matched, which an effect
  // binding its filter ahead of time doesn't have: it names nothing.
  if ("graveyard" in reference) return reference.itsController === true ? [] : ctx.graveyardCardsMatching(reference.graveyard);
  const filter = "controlled" in reference ? { ...reference.controlled, controlledBy: "you" as const } : reference.permanents;
  return ctx.permanentsMatching(filter).map((m) => m.object);
}

/** Does `amount` read a per-player value (`lifeTotal: "each"`, a `thisWay`
 * of `who: "each"`), so a scoped effect has to read it once for each player? */
function readsEachPlayer(amount: EffectAmount): boolean {
  if (typeof amount !== "object") return false;
  if ("lifeTotal" in amount) return amount.lifeTotal === "each";
  if ("librarySize" in amount) return amount.librarySize === "each";
  if ("graveyardSize" in amount) return amount.graveyardSize === "each";
  if ("cardsInHand" in amount) return amount.cardsInHand === "each";
  if ("turnStat" in amount) return amount.who === "each";
  if ("attackingPlayer" in amount) return true;
  if ("countOf" in amount) return amount.forEachPlayer === true;
  if ("countInGraveyard" in amount) return amount.forEachPlayer === true;
  if ("thisWay" in amount) return amount.who === "each";
  if ("half" in amount) return readsEachPlayer(amount.half);
  if ("powerOfTwo" in amount) return readsEachPlayer(amount.powerOfTwo);
  if ("product" in amount) return amount.product.some(readsEachPlayer);
  if ("sum" in amount) return amount.sum.some(readsEachPlayer);
  if ("difference" in amount) return amount.difference.some(readsEachPlayer);
  if ("leastOf" in amount) return amount.leastOf.some(readsEachPlayer);
  if ("ifCondition" in amount) return readsEachPlayer(amount.then) || readsEachPlayer(amount.else);
  return false;
}

/** A `mill` / `discard` `target`: the player in a target slot, or every
 * player a scope names (`"you"` is a scope of one). */
function scopedOrTargetedPlayers(
  target: number | PlayerScope | ChosenPlayerRef,
  ctx: ResolutionContext,
): readonly TargetRef[] {
  if (typeof target === "number") {
    const ref = ctx.targets[target];
    return ref === undefined ? [] : [ref];
  }
  if (typeof target === "object") {
    const player = effectPlayer(target, ctx);
    return player === undefined ? [] : [{ kind: "player", player }];
  }
  if (target === "you") return [{ kind: "player", player: ctx.controller }];
  return ctx.playersInScope(target).map((player) => ({ kind: "player", player }));
}

/**
 * Whether a `may`'s action can be done in full, which is the only way it is
 * offered. A player can't mill more cards than their library holds, and if
 * given the choice can't choose to (rule 701.17b — Daggerfang Duo with one
 * card left can't choose to mill two); "you may discard a card. If you do,
 * draw a card" with an empty hand is the same, or it would draw for nothing
 * (Rydia, Summoner of Mist). Only the action chosen is asked about, a
 * sequence's first step: "draw, then discard" is possible from an empty hand.
 */
export function mayBeDone(effect: EffectSpec, ctx: ResolutionContext): boolean {
  const action = effect.kind === "sequence" ? effect.effects[0] : effect;
  if (action === undefined) return true;
  // "You may put a card from your hand on top of your library": not with none.
  // An amount is "all of them", which none satisfies (Manabond).
  if (action.kind === "look-and-choose" && action.zone === "hand" && action.player === undefined && typeof action.min === "number") {
    return ctx.handSizeOf(ctx.controller, action.filter) >= action.min;
  }
  if (action.kind === "mill" || action.kind === "discard") {
    return scopedOrTargetedPlayers(action.target, ctx).every((ref) => {
      if (ref.kind !== "player") return true;
      const has = action.kind === "mill" ? ctx.librarySizeOf(ref.player) : ctx.handSizeOf(ref.player, action.filter);
      return has >= amountValue(action.amount, ctx, ref.player);
    });
  }
  // "Any opponent may have you put that card into your graveyard" with no such
  // card (an empty library revealed nothing), or "into your hand" with nothing
  // exiled this way: an impossible option isn't one to choose (rule 608.2d).
  if (action.kind === "put-into-graveyard") return resolveEffectTarget(action.target, ctx)?.kind === "object";
  if (action.kind === "move-exiled-this-way" && action.filter === undefined) return ctx.cardsExiledThisWay().length > 0;
  // "You may blight 1": a player who controls no creature the counters can
  // go on can't choose to (rule 701.68b).
  if (action.kind === "blight") return blightingPlayers(action.who, ctx).every((player) => ctx.canBlight(player));
  // "You may behold a Dragon" (rule 701.4a): only with one to behold.
  if (action.kind === "behold") return ctx.canBehold(action);
  // "You may return one of them": not with none of them left, and then it
  // hasn't been done this turn either (Rinoa, Angel Wing).
  if (action.kind === "put-arrived-onto-battlefield") return ctx.arrivedStillThere() > 0;
  // "You may pay {1} and exile it": not once it has gone from where the
  // trigger found it (Timothar, Baron of Bats's ruling).
  if (action.kind === "exile" && action.target === "trigger-object" && ctx.triggerObjectLost === true) return false;
  // "You may move a counter": not when none could move (rule 122.5) — from
  // a permanent with none (of that kind) left, or with either end gone.
  if (action.kind === "move-counters" && !isMoveChooser(action.from) && !isMoveChooser(action.to)) {
    const from = resolveEffectTarget(action.from, ctx);
    const to = resolveEffectTarget(action.to, ctx);
    if (from === undefined || to === undefined || ctx.countersHere(to) === undefined) return false;
    if (from.kind === "object" && to.kind === "object" && from.object === to.object) return false;
    return kindsHere(ctx, from, action.counter).length > 0;
  }
  return true;
}

/** Who a `blight` effect's `who` names: a scope's players, or the player in
 * a target slot — nobody if that slot is illegal (rule 608.2b). */
function blightingPlayers(
  who: PlayerScope | { readonly target: number } | undefined,
  ctx: ResolutionContext,
): readonly PlayerId[] {
  if (typeof who === "object") {
    const player = effectPlayer(who, ctx);
    return player === undefined ? [] : [player];
  }
  return ctx.playersInScope(who ?? "you");
}

/** Whether `spell` targets a permanent or a player — one of its targets was
 * a player or on the battlefield when it was chosen. A slot filled
 * automatically isn't a target (rule 115.1). */
function targetsPermanentOrPlayer(spell: SpellSnapshot): boolean {
  const auto = new Set(spell.autoTargetSlots ?? []);
  return (spell.targets ?? []).some(
    (t, i) =>
      t !== undefined &&
      !auto.has(i) &&
      (t.kind === "player" || spell.targetZones?.[i] === "battlefield"),
  );
}

/** The most splits of "N mana in any combination of …" offered as the modes
 * of one choice; past it, one `split-mana` decision says how many of each
 * colour. */
const MAX_MANA_SPLIT_MODES = 35;

/** What an `add-mana`'s mana carries besides its type and amount — a spend
 * restriction, `persists` — laid on each colour of a split. */
export type ManaSplitRiders = Omit<
  Extract<EffectSpec, { kind: "add-mana" }>,
  "kind" | "mana" | "amount" | "painToController" | "also"
>;

/** A `split-mana` decision to raise: `amount` mana over `colors`, each
 * colour's share added with `riders`, then `then` (the rest of the
 * instruction, if any). */
export interface ManaSplitAsk {
  readonly colors: readonly ManaType[];
  readonly amount: number;
  readonly riders: ManaSplitRiders;
  readonly then: EffectSpec | null;
}

/**
 * An `add-mana` with a choice in it, as a spell or an ability on the stack
 * adds it (rule 608.2d): the choice as `modal` decisions over concrete
 * `add-mana`s, or `null` when there's nothing to choose — a fixed type, one
 * of each (`all`), or a list that names a single type or none.
 *
 * "One mana of any color" and "N mana of any one color" are one choice of
 * colour, for every unit; "N mana in any combination of …" is one choice of
 * split when there are few enough of them (`MAX_MANA_SPLIT_MODES` — a
 * Culling Ritual's ten units over {B} and {G} are eleven; two of any colour
 * are fifteen), and otherwise one `split-mana` decision of how many of each
 * (`ResolutionContext.splitMana`) — before it, each unit's colour in turn,
 * which a big Klauth attack made fifty decisions (a live report, 2026-10-08).
 * A bare context without `splitMana` still asks unit by unit. An amount read for "that color" (`{ devotionTo:
 * "that-color" }`) is read for each colour on offer. What the mana carries
 * (a spend restriction, a rider, `persists`) rides on every mode; the rest of
 * the instruction — damage to its controller, `also` — follows once.
 */
function addManaChoice(spec: Extract<EffectSpec, { kind: "add-mana" }>, ctx: ResolutionContext): EffectSpec | null {
  const mana = spec.mana === "chosen" ? (ctx.chosenColorOfSource() ?? "any-color") : spec.mana;
  let colors: readonly ManaType[];
  let same: boolean;
  if (mana === "any-color") {
    colors = MANA_COLORS;
    same = true;
  } else if (mana === "commander-identity") {
    colors = ctx.commanderColors();
    same = false;
  } else if (typeof mana !== "object" || "all" in mana || "eachColorAmong" in mana) {
    return null;
  } else if ("oneOf" in mana) {
    colors = mana.oneOf;
    same = mana.same === true;
  } else {
    colors = ctx.manaTypesOf(mana);
    same = mana.same === true;
  }
  if (colors.length < 2) return null;
  const { kind: _kind, painToController, also, mana: _mana, amount: _amount, ...carried } = spec;
  const symbols = (types: readonly ManaType[]): string =>
    types.length === 0 ? "no mana" : types.map((t) => `{${t}}`).join("");
  const steps: EffectSpec[] = [];
  if (same) {
    const amounts = colors.map((color) => Math.max(0, amountValue(spec.amount, { ...ctx, manaColor: color })));
    // No mana whichever is chosen: nothing to ask.
    if (amounts.every((n) => n === 0)) return null;
    const modes = colors.map((color, i): ModeOption => {
      const n = amounts[i];
      return {
        text: `Add ${n > 8 ? `${n} {${color}}` : symbols(Array<ManaType>(n).fill(color))}.`,
        effect: { kind: "add-mana", ...carried, mana: color, amount: n },
      };
    });
    steps.push({ kind: "modal", minModes: 1, maxModes: 1, modes });
  } else {
    const n = Math.max(0, amountValue(spec.amount, ctx));
    if (n === 0) return null;
    const splits = splitCountAtMost(colors.length, n, MAX_MANA_SPLIT_MODES + 1);
    if (splits <= MAX_MANA_SPLIT_MODES) {
      const modes = manaSplits(colors, n).map(
        (split): ModeOption => ({
          text: `Add ${symbols(split)}.`,
          effect: { kind: "add-mana", ...carried, mana: { all: split }, amount: 1 },
        }),
      );
      steps.push({ kind: "modal", minModes: 1, maxModes: 1, modes });
    } else if (ctx.splitMana !== undefined) {
      const rest: EffectSpec | null =
        (painToController ?? 0) > 0 || also !== undefined
          ? {
              kind: "add-mana",
              mana: "C",
              amount: 0,
              ...(painToController !== undefined ? { painToController } : {}),
              ...(also !== undefined ? { also } : {}),
            }
          : null;
      ctx.splitMana({ colors, amount: n, riders: carried, then: rest });
      // Asked: the rest of the instruction rides on the decision.
      return { kind: "sequence", effects: [] };
    } else {
      const modes = colors.map(
        (color): ModeOption => ({
          text: `Add {${color}}.`,
          effect: { kind: "add-mana", ...carried, mana: color, amount: 1 },
        }),
      );
      const units = Math.min(n, MAX_ASKED_MANA_UNITS);
      for (let i = 0; i < units; i += 1) steps.push({ kind: "modal", minModes: 1, maxModes: 1, modes });
    }
  }
  if ((painToController ?? 0) > 0 || also !== undefined) {
    // The rest of the instruction, once: no mana of its own.
    steps.push({
      kind: "add-mana",
      mana: "C",
      amount: 0,
      ...(painToController !== undefined ? { painToController } : {}),
      ...(also !== undefined ? { also } : {}),
    });
  }
  return steps.length === 1 ? steps[0] : { kind: "sequence", effects: steps };
}

/** The most units of "N mana in any combination" asked one at a time —
 * `Game.MAX_EFFECT_INSTANCES`, which caps what any one effect mints. */
const MAX_ASKED_MANA_UNITS = 1000;

const MANA_COLORS: readonly ManaType[] = ["W", "U", "B", "R", "G"];

/** How many multisets of `amount` units over `kinds` types there are,
 * stopping at `cap`. */
function splitCountAtMost(kinds: number, amount: number, cap: number): number {
  let n = 1;
  for (let i = 1; i < kinds; i += 1) {
    n = (n * (amount + i)) / i;
    if (n >= cap) return cap;
  }
  return Math.round(n);
}

/** Every multiset of `amount` units drawn from `types`, the first type's
 * share largest first — "three mana in any combination of {R} and/or {G}":
 * RRR, RRG, RGG, GGG. */
function manaSplits(types: readonly ManaType[], amount: number): ManaType[][] {
  if (amount === 0) return [[]];
  const [first, ...rest] = types;
  if (first === undefined) return [];
  if (rest.length === 0) return [Array<ManaType>(amount).fill(first)];
  const out: ManaType[][] = [];
  for (let take = amount; take >= 0; take -= 1) {
    for (const tail of manaSplits(rest, amount - take)) out.push([...Array<ManaType>(take).fill(first), ...tail]);
  }
  return out;
}

export function applyEffectSpec(unbound: EffectSpec, ctx: ResolutionContext): void {
  // A player won mid-resolution (Laboratory Maniac's draw, Thassa's Oracle):
  // the game is over (rule 104.1), and the rest of the instructions with it.
  // (Optional only for the bare contexts some tests hand in.)
  if (ctx.gameOver?.() === true) return;
  const spec = bindDynamicCompares(unbound, ctx);
  switch (spec.kind) {
    case "sequence": {
      // One instruction over several objects: nothing in it stops to ask.
      if (spec.simultaneous === true) {
        ctx.simultaneously(() => {
          for (const step of spec.effects) applyEffectSpec(step, ctx);
        });
        return;
      }
      // Instructions are followed in order (rule 608.2c), so a step that
      // stops to ask someone something — which cards to discard, what to
      // sacrifice, whether to pay — is answered before the next step happens.
      // The steps after it wait in `GameState.suspendedResolutions`. A
      // decision that was already pending when the sequence began isn't one
      // of its steps', and holds nothing up.
      const pendingBefore = ctx.decisionPending();
      const steps = spec.effects;
      for (let i = 0; i < steps.length; i += 1) {
        const parked = ctx.parkedCount();
        applyEffectSpec(steps[i], ctx);
        if (i + 1 < steps.length && !pendingBefore && ctx.decisionPending()) {
          const rest = steps.slice(i + 1);
          // Beneath whatever the step parked of its own — a nested sequence's
          // remainder is still that step, which finishes first.
          ctx.resumeAfterDecisions(
            rest.length === 1 ? rest[0] : { kind: "sequence", effects: rest },
            parked,
          );
          return;
        }
      }
      return;
    }
    case "for-each-target": {
      // One step per member still there, each binding it to slot `from` —
      // as steps of a `sequence`, so a member's effect that stops to ask
      // something holds the rest until it's answered.
      const members: number[] = [];
      for (let index = spec.from; index < ctx.targets.length; index += 1) {
        if (ctx.targets[index] !== undefined) members.push(index);
      }
      if (members.length === 0) return;
      // Target players each told to do the same thing act — and make their
      // choices — in APNAP order, whatever order they were targeted in (rule
      // 101.4): Priest of Forgotten Gods' "any number of target players each
      // … sacrifice a creature" asks the active player first, then the
      // rest in turn order.
      if (members.every((index) => ctx.targets[index]?.kind === "player")) {
        const order = ctx.playersInScope("each-player");
        const rank = (index: number): number => {
          const target = ctx.targets[index];
          const at = target?.kind === "player" ? order.indexOf(target.player) : -1;
          return at < 0 ? order.length : at;
        };
        members.sort((a, b) => rank(a) - rank(b));
      }
      const steps: EffectSpec[] = members.map((index) => ({
        kind: "for-target",
        from: spec.from,
        index,
        effect: spec.effect,
      }));
      applyEffectSpec(
        { kind: "sequence", effects: steps, ...(spec.simultaneous === true ? { simultaneous: true } : {}) },
        ctx,
      );
      return;
    }
    case "for-target": {
      applyEffectSpec(spec.effect, ctx.withTargetAt(spec.from, spec.index));
      return;
    }
    case "as-player": {
      const player = effectPlayer(spec.who, ctx);
      if (player !== undefined && ctx.playersInScope("each-player").includes(player)) {
        applyEffectSpec(spec.effect, ctx.asPlayer(player));
      }
      return;
    }
    case "for-each-permanent": {
      const scopeTo = scopedController(spec.controlledByTarget, ctx);
      if (spec.controlledByTarget !== undefined && scopeTo === undefined) return;
      const except: ObjectId[] = [];
      if (spec.exceptTriggerObject === true && ctx.triggerObject !== undefined) except.push(ctx.triggerObject);
      const left = spec.exceptTarget === undefined ? undefined : ctx.targets[spec.exceptTarget];
      if (left?.kind === "object") except.push(left.object);
      const as = spec.as ?? 0;
      const steps: EffectSpec[] = ctx
        .eachPermanentMatching(spec.filter, spec.exceptSource === true, except, scopeTo)
        .map(({ object, stint }) => ({ kind: "for-permanent", object, stint, as, effect: spec.effect }));
      if (steps.length === 0) return;
      applyEffectSpec(
        { kind: "sequence", effects: steps, ...(spec.simultaneous === true ? { simultaneous: true } : {}) },
        ctx,
      );
      return;
    }
    case "for-permanent": {
      if (ctx.stillOnBattlefield(spec.object, spec.stint)) {
        applyEffectSpec(spec.effect, ctx.withFoundAt(spec.as, spec.object));
      }
      return;
    }
    case "for-each-convoker": {
      const remaining = spec.remaining ?? Array.from({ length: ctx.convokerCount() }, (_, index) => index);
      if (remaining.length === 0) return;
      const one = (index: number): EffectSpec => ({ kind: "for-convoker", index, effect: spec.effect });
      if (remaining.length === 1) {
        applyEffectSpec(one(remaining[0]), ctx);
        return;
      }
      // One at a time, in the order the controller chooses: which next — the
      // rest after it, asked again.
      ctx.chooseModes(
        1,
        1,
        remaining.map((index) => ({
          text: ctx.convokerLabel(index),
          effect: {
            kind: "sequence",
            effects: [one(index), { ...spec, remaining: remaining.filter((i) => i !== index) }],
          },
        })),
      );
      return;
    }
    case "for-convoker":
      applyEffectSpec(spec.effect, ctx.withConvoker(spec.index));
      return;
    case "choose-opponent": {
      let among = ctx.playersInScope(spec.anyPlayer === true ? "each-player" : "each-opponent");
      if (spec.mostLife === true) {
        const most = Math.max(...among.map((p) => ctx.lifeTotalOf(p)));
        among = among.filter((p) => ctx.lifeTotalOf(p) === most);
      }
      if (among.length === 0) return;
      const about = (player: PlayerId): EffectSpec => ({
        kind: "about-player",
        player,
        effect: spec.then,
        ...(spec.remember === true ? { remember: true as const } : {}),
        ...(spec.secret === true ? { secret: true as const } : {}),
      });
      if (spec.secret === true && among.length > 1) {
        // A `choose-modes` would log the answer; this menu is asked the way
        // an "as this enters, secretly choose" is.
        ctx.chooseCreatureType(
          { kind: "about-player", player: CHOSEN_CREATURE_TYPE as PlayerId, effect: spec.then },
          undefined,
          { options: among, prompt: `Secretly choose ${spec.anyPlayer === true ? "a player" : "an opponent"}` },
          { ...(spec.remember === true ? { remember: "player" as const } : {}), secret: true },
        );
        return;
      }
      if (spec.random === true) {
        // Nobody is asked: the game picks, each with an equal chance.
        const chosen = among[ctx.pickAtRandom(among.length, (i) => ({ kind: "player", player: among[i] }))];
        applyEffectSpec(about(chosen), ctx);
        return;
      }
      if (among.length === 1) {
        applyEffectSpec(about(among[0]), ctx);
        return;
      }
      ctx.chooseModes(
        1,
        1,
        among.map((player) => ({
          text: `Choose ${player.charAt(0).toUpperCase()}${player.slice(1)}`,
          effect: about(player),
        })),
      );
      return;
    }
    case "about-player":
      if (!ctx.playersInScope("each-player").includes(spec.player)) return;
      if (spec.remember === true) ctx.rememberChosenPlayer(spec.player, spec.secret);
      applyEffectSpec(spec.effect, ctx.aboutPlayer(spec.player));
      return;
    case "become-prepared": {
      if (spec.filter !== undefined) {
        for (const { object } of ctx.permanentsMatching(spec.filter)) ctx.becomePrepared(object);
        return;
      }
      const target = spec.target === undefined ? undefined : resolveEffectTarget(spec.target, ctx);
      if (target?.kind === "object") ctx.becomePrepared(target.object);
      return;
    }
    case "empower-jace": {
      const amount = amountValue(spec.amount, ctx);
      // No Jace planeswalker token: create one first (it enters with 0
      // loyalty; the counters come in the same resolution, before any
      // state-based check).
      if (ctx.permanentsMatching(JACE_TOKEN).length === 0) {
        applyEffectSpec({ kind: "create-token", token: "Jace Token", count: 1 }, ctx);
      }
      const jaces = ctx.permanentsMatching(JACE_TOKEN);
      const onIt: EffectSpec = { kind: "add-counter", target: 0, counter: "loyalty", amount };
      if (jaces.length === 1 && jaces[0].count === 1) {
        applyEffectSpec(onIt, ctx.withTargets([{ kind: "object", object: jaces[0].object }]));
      } else if (jaces.length > 0) {
        ctx.choosePermanents(JACE_TOKEN, 1, 1, onIt, "Choose a Jace token to empower");
      }
      return;
    }
    case "top-of-graveyard": {
      const whose = spec.whose ?? "you";
      let owner: PlayerId | undefined;
      if (whose === "you") owner = ctx.controller;
      else if (whose === "that-player") owner = effectPlayer("that-player", ctx);
      else if (typeof whose === "object") owner = effectPlayer(whose, ctx);
      else {
        const ref = ctx.targets[whose];
        owner = ref?.kind === "player" ? ref.player : undefined;
      }
      if (owner === undefined) return;
      const cards = ctx.graveyardMatching(owner, spec.filter ?? {});
      const card = spec.bottom === true ? cards[0] : cards.at(-1);
      if (card === undefined) return;
      if (spec.ifIt !== undefined && !ctx.cardMatches(card, spec.ifIt)) return;
      applyEffectSpec(spec.then, ctx.withTargets([{ kind: "object", object: card }]));
      return;
    }
    case "reorder-graveyard":
      ctx.reorderGraveyard(ctx.controller);
      return;
    case "choose-random-card": {
      let cards: readonly ObjectId[];
      let owner: PlayerId | undefined;
      if (spec.zone === "exiled-with-source") {
        // Rule 607.2a: only the cards the linked ability exiled, still there.
        const filter = spec.filter;
        cards = ctx
          .cardsExiledWithSource()
          .filter((id) => filter === undefined || ctx.cardMatches(id, filter));
      } else {
        const whose = spec.whose ?? "you";
        if (whose === "you") owner = ctx.controller;
        else if (whose === "that-player") owner = effectPlayer("that-player", ctx);
        else if (typeof whose === "object") owner = effectPlayer(whose, ctx);
        else {
          const ref = ctx.targets[whose];
          owner = ref?.kind === "player" ? ref.player : undefined;
        }
        if (owner === undefined) return;
        if (spec.zone === "graveyard") cards = ctx.graveyardMatching(owner, spec.filter ?? {});
        else {
          const filter = spec.filter;
          cards = ctx
            .cardsIn(owner, "hand")
            .filter((id) => filter === undefined || ctx.cardMatches(id, filter));
        }
      }
      if (cards.length === 0) return;
      const chosen = cards[ctx.pickAtRandom(cards.length, (i) => ({ kind: "card", object: cards[i] }))];
      if (spec.zone === "hand" && spec.show !== undefined && owner !== undefined) {
        if (spec.show === "look" && spec.then !== undefined) {
          throw new Error("choose-random-card: a look takes no `then` — nothing follows it on the card");
        }
        // Rule 701.20a: a reveal shows it to every player; a look, to the
        // effect's controller alone (it stays hidden to the rest, 400.2).
        ctx.showCardFromHand(owner, chosen, spec.show);
      }
      if (spec.then === undefined) return;
      const picked: TargetRef = { kind: "object", object: chosen };
      if (spec.slot === undefined) applyEffectSpec(spec.then, ctx.withTargets([picked]));
      else applyEffectSpec(spec.then, ctx.withFoundAt(spec.slot, chosen));
      return;
    }
    case "choose-permanents": {
      const chooser = spec.chooser === undefined ? ctx.controller : effectPlayer(spec.chooser, ctx);
      if (chooser === undefined) return;
      const except =
        spec.exceptTriggerObject === true && ctx.triggerObject !== undefined ? [ctx.triggerObject] : [];
      if (spec.random === true) {
        // Nobody is asked: the game picks, each with an equal chance.
        const among = ctx.eachPermanentMatching(spec.filter, spec.exceptSource === true, except, undefined);
        if (among.length === 0) return;
        const picked = among[ctx.pickAtRandom(among.length, (i) => ({ kind: "card", object: among[i].object }))];
        applyEffectSpec(spec.then, ctx.withFoundAt(0, picked.object));
        return;
      }
      ctx.choosePermanents(
        spec.filter,
        Math.max(0, Math.floor(amountValue(spec.min ?? 0, ctx))),
        amountValue(spec.upTo, ctx),
        spec.then,
        spec.prompt,
        spec.exceptSource,
        except,
        chooser,
        spec.together,
      );
      return;
    }
    case "blight": {
      // One player at a time from the active player (rule 101.4), the rest
      // parked while one is asked, as `for-each-player` parks its players.
      const players = spec.remaining ?? ctx.apnap(blightingPlayers(spec.who, ctx));
      const pendingBefore = ctx.decisionPending();
      for (let i = 0; i < players.length; i += 1) {
        const parked = ctx.parkedCount();
        ctx.blight(players[i], spec.amount, spec.then);
        if (i + 1 < players.length && !pendingBefore && ctx.decisionPending()) {
          ctx.resumeAfterDecisions({ ...spec, remaining: players.slice(i + 1) }, parked);
          return;
        }
      }
      return;
    }
    case "bolster":
      // Rule 701.39a: by the effect's controller, chosen as it resolves.
      ctx.bolster(amountValue(spec.amount, ctx));
      return;
    case "behold":
      // Rule 701.4a: by the effect's controller, chosen as it resolves.
      ctx.behold(spec, spec.then);
      return;
    case "damage-divided-evenly": {
      // A member found illegal as it resolved isn't there (rule 608.2b), and
      // doesn't count toward the division.
      const members = ctx.targets.slice(spec.from).filter((t): t is TargetRef => t !== undefined);
      if (members.length === 0) return;
      ctx.dealDamageToEach(members, Math.floor(amountValue(spec.amount, ctx) / members.length));
      return;
    }
    case "damage": {
      if (spec.cantBePrevented === true) {
        const { cantBePrevented: _, ...rest } = spec;
        ctx.unpreventably(() => applyEffectSpec(rest, ctx));
        return;
      }
      if (spec.toControllerOfTarget !== undefined) {
        const of = ctx.targets[spec.toControllerOfTarget];
        const controller = of === undefined ? undefined : ctx.controllerOf(of);
        if (controller !== undefined) {
          ctx.dealDamage(
            { kind: "player", player: controller },
            amountValue(spec.amount, ctx, controller),
            spec.from,
          );
        }
        return;
      }
      if (spec.who === "attached-owner" || typeof spec.who === "object") {
        // One player named: the owner of what the source is attached to
        // (Enslave), or of a target.
        const player = spec.who === "attached-owner" ? ctx.attachedOwner() : effectPlayer(spec.who, ctx);
        if (player !== undefined && ctx.playersInScope("each-player").includes(player)) {
          ctx.dealDamage({ kind: "player", player }, amountValue(spec.amount, ctx, player), spec.from);
        }
        return;
      }
      if (spec.who !== undefined) {
        const whoseIf = spec.whoseIf;
        // A player the condition leaves out is dealt 0, which is dealing
        // nothing (rule 120.8).
        ctx.dealDamageScoped(
          spec.who,
          (player) =>
            whoseIf !== undefined && !ctx.aboutPlayer(player).conditionMet(whoseIf)
              ? 0
              : amountValue(spec.amount, ctx, player),
          spec.from,
        );
        return;
      }
      const target =
        spec.toTriggerRecipient === true
          ? ctx.triggerRecipient()
          : spec.target !== undefined
            ? resolveEffectTarget(spec.target, ctx)
            : undefined;
      if (target !== undefined) {
        const each = target.kind === "player" ? target.player : undefined;
        const amount = amountValue(spec.amount, ctx, each);
        const excess = spec.excessToController;
        const controller = target.kind === "object" ? ctx.controllerOf(target) : undefined;
        if (
          excess !== undefined &&
          target.kind === "object" &&
          controller !== undefined &&
          (excess.ifSourceHas === undefined || ctx.damageSourceHas(excess.ifSourceHas, spec.from))
        ) {
          const lethal = Math.min(amount, ctx.lethalDamageTo(target.object, spec.from));
          if (amount > lethal) {
            ctx.simultaneously(() => {
              if (lethal > 0) ctx.dealDamage(target, lethal, spec.from);
              ctx.dealDamage({ kind: "player", player: controller }, amount - lethal, spec.from);
            });
            return;
          }
        }
        ctx.dealDamage(target, amount, spec.from);
      }
      return;
    }
    case "add-mana": {
      // What a permanent tapped for mana produced is known only to the
      // triggered mana ability the engine applies there (`tapped-for-mana`).
      if (spec.mana === "produced") return;
      // A spell or an ability on the stack adding mana with a choice in it
      // asks as the mana is added (rule 608.2d); a mana ability's choice came
      // with its activation (`ResolutionContext.manaAbility`).
      if (ctx.manaAbility !== true) {
        const asked = addManaChoice(spec, ctx);
        if (asked !== null) {
          applyEffectSpec(asked, ctx);
          return;
        }
      }
      // "Each player adds …" (`who`) — the controller otherwise.
      for (const player of spec.who === undefined ? [ctx.controller] : ctx.playersInScope(spec.who)) {
        // "Any color in your commander's color identity" — nothing at all
        // with no colour there (no commander, or a colourless one).
        if (spec.mana === "commander-identity") {
          const colors = ctx.commanderColors();
          if (colors.length > 0) ctx.addMana(player, { oneOf: colors }, amountValue(spec.amount, ctx), spec);
        } else if (typeof spec.mana === "object" && "all" in spec.mana) {
          const times = amountValue(spec.amount, ctx);
          for (const type of spec.mana.all) ctx.addMana(player, type, times, spec);
        } else if (typeof spec.mana === "object" && "eachColorAmong" in spec.mana) {
          // One of each colour among them, `amount` times over.
          const times = amountValue(spec.amount, ctx);
          for (const type of ctx.manaTypesOf(spec.mana)) ctx.addMana(player, type, times, spec);
        } else ctx.addMana(
          player,
          // "The chosen color" — resolved against the source permanent; falls
          // back to the payer's choice if the label isn't a colour (it always
          // is on the cards that use this).
          spec.mana === "chosen" ? (ctx.chosenColorOfSource() ?? "any-color") : spec.mana,
          amountValue(spec.amount, ctx),
          spec,
        );
      }
      if (spec.painToController !== undefined && spec.painToController > 0) {
        ctx.dealDamage(
          { kind: "player", player: ctx.controller },
          spec.painToController,
        );
      }
      if (spec.also !== undefined) applyEffectSpec(spec.also, ctx);
      return;
    }
    case "draw": {
      if (spec.target !== undefined) {
        const ref = ctx.targets[spec.target];
        if (ref?.kind === "player") ctx.draw(ref.player, amountValue(spec.amount, ctx, ref.player));
        return;
      }
      const drawers =
        typeof spec.who === "object"
          ? ((p) => (p === undefined ? [] : [p]))(effectPlayer(spec.who, ctx))
          : ctx.playersInScope(spec.who ?? "you");
      for (const player of drawers) {
        ctx.draw(player, amountValue(spec.amount, ctx, player));
      }
      return;
    }
    case "discard-hand":
      for (const ref of scopedOrTargetedPlayers(spec.who, ctx)) {
        if (ref.kind === "player") ctx.discardHand(ref.player, spec.filter, spec.reveal === true);
      }
      return;
    case "reveal-hand":
      for (const ref of scopedOrTargetedPlayers(spec.who, ctx)) {
        if (ref.kind === "player") ctx.revealHand(ref.player);
      }
      return;
    case "gain-life": {
      const gained = amountValue(spec.amount, ctx);
      if (spec.toControllerOfTarget !== undefined) {
        const of = ctx.targets[spec.toControllerOfTarget];
        const who = of === undefined ? undefined : ctx.controllerOf(of);
        if (who !== undefined) ctx.gainLife(who, gained);
        return;
      }
      if (typeof spec.who === "object") {
        const who = effectPlayer(spec.who, ctx);
        if (who !== undefined) ctx.gainLife(who, amountValue(spec.amount, ctx, who));
        return;
      }
      if (spec.who === undefined || spec.who === "you") ctx.gainLife(ctx.controller, gained);
      else if (!readsEachPlayer(spec.amount)) ctx.changeLifeScoped(spec.who, gained);
      else {
        for (const p of ctx.playersInScope(spec.who)) ctx.gainLife(p, amountValue(spec.amount, ctx, p));
      }
      return;
    }
    case "lose-life": {
      if (spec.target !== undefined && spec.toControllerOfTarget === undefined) {
        // A per-player amount is the target's own: Peer into the Abyss's
        // "target player … loses half their life".
        const ref = ctx.targets[spec.target];
        if (ref?.kind === "player") ctx.loseLife(ref.player, amountValue(spec.amount, ctx, ref.player));
        return;
      }
      const life = amountValue(spec.amount, ctx);
      if (spec.toControllerOfTarget !== undefined) {
        const of = ctx.targets[spec.toControllerOfTarget];
        const who = of === undefined ? undefined : ctx.controllerOf(of);
        if (who !== undefined) ctx.loseLife(who, life);
        return;
      }
      if (typeof spec.who === "object") {
        const who = effectPlayer(spec.who, ctx);
        if (who !== undefined) ctx.loseLife(who, amountValue(spec.amount, ctx, who));
        return;
      }
      if (spec.who === undefined || spec.who === "you") ctx.loseLife(ctx.controller, life);
      else if (!readsEachPlayer(spec.amount)) ctx.changeLifeScoped(spec.who, -life);
      else {
        // "Each opponent loses half their life": each one's own amount,
        // read as their turn in APNAP order comes.
        for (const p of ctx.playersInScope(spec.who)) ctx.loseLife(p, amountValue(spec.amount, ctx, p));
      }
      return;
    }
    case "set-life-total": {
      // Every new total is read before any life moves (Repay in Kind). An
      // absent "up to one target player" (Torgaar) leaves nobody.
      const totals = scopedOrTargetedPlayers(spec.who, ctx).flatMap((ref) =>
        ref?.kind === "player" ? [{ player: ref.player, total: signedAmountValue(spec.amount, ctx, ref.player) }] : [],
      );
      // Rule 119.5: gains or loses the difference.
      for (const { player, total } of totals) {
        const delta = total - ctx.lifeTotalOf(player);
        if (delta > 0) ctx.gainLife(player, delta);
        else if (delta < 0) ctx.loseLife(player, -delta);
      }
      return;
    }
    case "tap": {
      const target = resolveEffectTarget(spec.target, ctx);
      if (target !== undefined) {
        ctx.tapPermanent(
          target,
          spec.doesntUntapNext === true,
          spec.onlyDoesntUntap === true,
          spec.doesntUntapSteps,
          spec.untapStepOf === "you" ? ctx.controller : undefined,
        );
      }
      return;
    }
    case "untap": {
      const target = resolveEffectTarget(spec.target, ctx);
      if (target === undefined) return;
      // "That player untaps it": no such player, nothing is untapped.
      if (spec.by !== undefined && effectPlayer(spec.by, ctx) === undefined) return;
      ctx.untapPermanent(target);
      return;
    }
    case "exile-if-dies-this-turn": {
      if (spec.dealtDamageThisWay !== undefined) {
        ctx.exileDamagedThisWayIfTheyDie(spec.dealtDamageThisWay === "creature");
        return;
      }
      if (spec.target === undefined) return;
      const target = resolveEffectTarget(spec.target, ctx);
      if (target !== undefined) ctx.exileIfDiesThisTurn(target);
      return;
    }
    case "put-on-bottom-of-library": {
      const target = ctx.targets[spec.target];
      if (target !== undefined) ctx.putOnBottomOfLibrary(target);
      return;
    }
    case "destroy": {
      const target = resolveEffectTarget(spec.target, ctx);
      if (target !== undefined) ctx.destroyPermanent(target, spec.cantBeRegenerated === true);
      return;
    }
    case "destroy-all": {
      const scopeTo = scopedController(spec.controlledByTarget, ctx);
      if (spec.controlledByTarget !== undefined && scopeTo === undefined) return;
      ctx.destroyAll(
        spec.filter,
        spec.onlyControllersDamagedBySource,
        spec.cantBeRegenerated === true,
        scopeTo,
        spec.exceptSource === true,
        spec.exceptTriggerObject === true && ctx.triggerObjectLost !== true ? ctx.triggerObject : undefined,
      );
      return;
    }
    case "regenerate": {
      const target = resolveEffectTarget(spec.target, ctx);
      if (target !== undefined) ctx.regenerate(target);
      return;
    }
    case "regenerate-all":
      ctx.regenerateAll(spec.filter);
      return;
    case "return-to-hand-all": {
      const scopeTo = scopedController(spec.controlledByTarget, ctx);
      if (spec.controlledByTarget !== undefined && scopeTo === undefined) return;
      ctx.returnToHandAll(spec.filter, scopeTo);
      return;
    }
    case "exile-all": {
      const spared = spec.exceptTarget === undefined ? undefined : ctx.targets[spec.exceptTarget];
      const scopeTo = scopedController(spec.controlledByTarget, ctx);
      if (spec.controlledByTarget !== undefined && scopeTo === undefined) return;
      ctx.exileAll(
        spec.filter,
        spec.airbend === true,
        spec.exceptSource === true ? ctx.source : spared?.kind === "object" ? spared.object : undefined,
        spec.untilSourceLeaves === true,
        spec.linked === true,
        scopeTo,
      );
      return;
    }
    case "damage-all": {
      let players = spec.whose === undefined ? undefined : ctx.playersInScope(spec.whose);
      if (spec.controlledByTarget !== undefined) {
        // A player, or a permanent's controller — "each creature that player
        // or that planeswalker's controller controls" (Bonfire of the Damned).
        const scoped = scopedController(spec.controlledByTarget, ctx);
        if (scoped === undefined) return;
        players = [scoped];
      }
      ctx.damageAll(spec.filter, amountValue(spec.amount, ctx), spec.exceptSource === true, players, spec.from);
      return;
    }
    case "creatures-damage-controllers":
      ctx.creaturesDamageControllers(spec.filter, amountValue(spec.amount, ctx));
      return;
    case "each-deals-damage": {
      // "Each of those creatures … that player controls": nothing once that
      // target has gone illegal (rule 608.2b — its slot is blank).
      let whose: PlayerId | undefined;
      if (spec.controlledByTarget !== undefined) {
        whose = scopedController(spec.controlledByTarget, ctx);
        if (whose === undefined) return;
      }
      let to: "itself" | "host" | readonly TargetRef[];
      if (spec.to === "itself" || spec.to === "host") to = spec.to;
      else if (typeof spec.to === "object") {
        to = ctx.playersInScope(spec.to.who).map((player): TargetRef => ({ kind: "player", player }));
      } else {
        // A target gone illegal, or a trigger's object that has left, is
        // dealt nothing — and nothing deals it anything.
        const recipient = resolveEffectTarget(spec.to, ctx);
        if (recipient === undefined) return;
        to = [recipient];
      }
      const except = spec.exceptTarget === undefined ? undefined : ctx.targets[spec.exceptTarget];
      ctx.eachDealsDamage(
        {
          filter: spec.filter,
          exceptSource: spec.exceptSource === true,
          ...(except?.kind === "object" ? { except: except.object } : {}),
          ...(whose !== undefined ? { whose } : {}),
        },
        spec.amount === "its-power" ? "its-power" : amountValue(spec.amount, ctx),
        to,
      );
      return;
    }
    case "sacrifice": {
      const spared = spec.exceptTarget === undefined ? undefined : ctx.targets[spec.exceptTarget];
      const exceptId = spec.exceptSource
        ? ctx.source
        : spec.exceptHost === true
          ? ctx.attachedHost()
          : spared?.kind === "object"
            ? spared.object
            : undefined;
      if (spec.who === "target") {
        const target = ctx.targets[0];
        if (target?.kind === "player") {
          ctx.sacrificePermanents(
            { player: target.player },
            spec.filter,
            amountValue(spec.count, ctx),
            exceptId,
            spec.exploit === true,
            spec.andEach,
          );
        }
      } else {
        // "Each player sacrifices half the creatures they control": read for
        // each player sacrificing.
        const count = readsEachPlayer(spec.count)
          ? (player: PlayerId) => amountValue(spec.count, ctx, player)
          : amountValue(spec.count, ctx);
        ctx.sacrificePermanents(spec.who, spec.filter, count, exceptId, spec.exploit === true, spec.andEach);
      }
      return;
    }
    case "reveal-drawn":
      ctx.revealDrawn();
      return;
    case "put-into-graveyard": {
      const target = resolveEffectTarget(spec.target, ctx);
      if (target?.kind === "object") ctx.putExiledIntoGraveyard(target.object);
      return;
    }
    case "foraged":
      ctx.foraged();
      return;
    case "sacrifice-source": {
      // "Sacrifice ~. If you do, …" — the tail only applies when the sacrifice
      // actually happened (rule 603.4-adjacent: the source may have been
      // removed in response).
      const sacrificed = ctx.sacrificeSource();
      if (sacrificed && spec.then !== undefined) {
        // "The sacrificed creature" in the tail is the source, as it was.
        applyEffectSpec(spec.then, ctx.withSacrificed(ctx.source));
      }
      return;
    }
    case "fight": {
      const a = resolveEffectTarget(spec.a, ctx);
      const b = resolveEffectTarget(spec.b, ctx);
      if (a !== undefined && b !== undefined) ctx.fight(a, b, spec.oneSided === true);
      return;
    }
    case "counter": {
      const target = resolveEffectTarget(spec.target, ctx);
      if (target === undefined) return;
      const { countered, sourcePermanent } = ctx.counterSpell(target, spec.into, spec.lockSource === true);
      const then = spec.thenSource;
      if (then === undefined || sourcePermanent === undefined) return;
      if (!countered && then.evenIfNotCountered !== true) return;
      if (then.filter !== undefined && !ctx.cardMatches(sourcePermanent, then.filter)) return;
      applyEffectSpec(then.effect, ctx.withFoundAt(0, sourcePermanent));
      return;
    }
    case "for-each-on-stack": {
      for (const object of ctx.onTheStack(spec.spells === true, spec.abilities === true, spec.whose)) {
        applyEffectSpec(spec.effect, ctx.withFoundAt(0, object));
      }
      return;
    }
    case "gain-control": {
      // Rule 608.2b: nothing is done to an illegal target, and an illegal
      // player target does nothing — so either one stops the whole change.
      const target = resolveEffectTarget(spec.target, ctx);
      if (target === undefined || illegalSlot(spec.target, ctx)) return;
      const player = effectPlayer(spec.who ?? "you", ctx);
      if (player !== undefined) {
        ctx.gainControl(
          target,
          spec.untilEndOfTurn,
          player,
          spec.whileSource === true,
          spec.whileSourceTapped === true,
          spec.whileYouControlSource === true,
          spec.until,
        );
      }
      return;
    }
    case "gain-control-all": {
      const who = spec.who === "owner" ? "owner" : effectPlayer(spec.who ?? "you", ctx);
      if (who === undefined) return;
      if (spec.controlledByTarget !== undefined) {
        if (illegalSlot(spec.controlledByTarget, ctx)) return;
        const from = scopedController(spec.controlledByTarget, ctx);
        if (from === undefined) return;
        ctx.gainControlAll(spec.filter, spec.untilEndOfTurn, who, spec.exceptSource === true, from);
        return;
      }
      if (spec.controlledBy !== undefined) {
        const from = ctx.playersInScope(spec.controlledBy)[0];
        if (from === undefined) return;
        ctx.gainControlAll(spec.filter, spec.untilEndOfTurn, who, spec.exceptSource === true, from);
        return;
      }
      ctx.gainControlAll(spec.filter, spec.untilEndOfTurn, who, spec.exceptSource === true);
      return;
    }
    case "rotate-control":
      ctx.rotateControl(spec.filter, spec.direction, spec.exceptSource === true);
      return;
    case "exchange-control": {
      const [a, b] = spec.objects;
      const first = resolveEffectTarget(a, ctx);
      const second = resolveEffectTarget(b, ctx);
      const exchanged =
        first !== undefined &&
        second !== undefined &&
        !illegalSlot(a, ctx) &&
        !illegalSlot(b, ctx) &&
        ctx.exchangeControl(first, second);
      const next = exchanged ? spec.then : spec.otherwise;
      if (next !== undefined) applyEffectSpec(next, ctx);
      return;
    }
    case "exchange-control-all": {
      if (typeof spec.with === "object" && "target" in spec.with && illegalSlot(spec.with.target, ctx)) return;
      const other = effectPlayer(spec.with, ctx);
      if (other !== undefined) ctx.exchangeControlAll(spec.filter, other, spec.untilEndOfTurn);
      return;
    }
    case "cant-be-sacrificed": {
      const target = resolveEffectTarget(spec.target, ctx);
      if (target !== undefined) ctx.grantCantBeSacrificed(target, spec.duration);
      return;
    }
    case "block-additional": {
      const target = resolveEffectTarget(spec.target, ctx);
      if (target !== undefined) ctx.grantBlockAdditional(target, spec.amount, spec.duration);
      return;
    }
    case "return-to-hand": {
      const target = resolveEffectTarget(spec.target, ctx);
      if (target !== undefined) ctx.returnToHand(target, spec.from);
      return;
    }
    case "manifest-dread": {
      // Several times: one after another, each choice made before the next
      // look — a sequence parks its later steps behind a pending choice.
      const times = spec.count ?? 1;
      if (times > 1) {
        applyEffectSpec({ kind: "sequence", effects: Array.from({ length: times }, () => ({ ...spec, count: 1 })) }, ctx);
        return;
      }
      const who = spec.who ?? "you";
      let player: PlayerId | undefined = ctx.controller;
      if (who !== "you") {
        const ref = ctx.targets[who.controllerOfTarget];
        player = ref === undefined ? undefined : ctx.controllerOf(ref);
      }
      if (player === undefined) return;
      ctx.lookAndChoose("library", 2, 1, 1, "manifest", "graveyard", undefined, false, undefined, false,
        undefined, undefined, undefined, undefined, player);
      return;
    }
    case "manifest": {
      const who = spec.who;
      let players: readonly PlayerId[];
      if (typeof who === "string") {
        players = ctx.playersInScope(who);
      } else {
        const ref = ctx.targets[who.controllerOfTarget];
        const player = ref === undefined ? undefined : ctx.controllerOf(ref);
        players = player === undefined ? [] : [player];
      }
      // "The top card of that player's library": theirs, nobody's if
      // they've gone (or the slot is illegal — rule 608.2b).
      const library = spec.from === undefined ? undefined : effectPlayer(spec.from, ctx);
      if (spec.from !== undefined && library === undefined) return;
      const count = spec.count === undefined ? 1 : Math.min(amountValue(spec.count, ctx), MAX_COPY_COUNT);
      for (const player of players) {
        for (let i = 0; i < count; i += 1) ctx.manifestTop(player, spec.cloak === true ? "cloak" : "manifest", library);
      }
      return;
    }
    case "turn-face-down": {
      const target = resolveEffectTarget(spec.target, ctx);
      if (target !== undefined) ctx.turnFaceDown(target, spec.as);
      return;
    }
    case "turn-face-up": {
      const target = resolveEffectTarget(spec.target, ctx);
      if (target !== undefined) ctx.turnFaceUp(target);
      return;
    }
    case "exile": {
      const target = resolveEffectTarget(spec.target, ctx);
      if (spec.fromHand === true) {
        if (target?.kind === "object") ctx.exileFromHand(target.object);
        return;
      }
      if (target !== undefined) {
        // Rule 610.3a: until a target leaves, and that target is gone or
        // illegal already: it doesn't move (Calix's ruling).
        const leaves = typeof spec.until === "object" ? ctx.targets[spec.until.targetLeaves] : undefined;
        if (typeof spec.until === "object" && leaves?.kind !== "object") return;
        ctx.exileObject(target, spec.untilSourceLeaves === true, spec.withCounters, spec.mayCast, spec.linked === true,
          spec.airbend === true, leaves?.kind === "object" ? { leaves: leaves.object } : spec.until === "opponent-becomes-monarch" ? spec.until : undefined);
        const haunted = spec.haunting === undefined ? undefined : ctx.targets[spec.haunting];
        if (haunted?.kind === "object" && target.kind === "object") ctx.markHaunting(target.object, haunted.object);
      }
      return;
    }
    case "collect-evidence":
      ctx.collectEvidence(spec.amount, spec.then);
      return;
    case "solve":
      ctx.solveSource();
      return;
    case "become-plotted": {
      const target = resolveEffectTarget(spec.target, ctx);
      if (target !== undefined && target.kind === "object") ctx.becomePlotted(target.object);
      return;
    }
    case "return-exiled-by-source": {
      if (spec.linked === "hand") {
        const justExiled = spec.others === true ? ctx.cardsExiledThisWay() : [];
        for (const card of ctx.cardsExiledWithSource()) {
          if (justExiled.includes(card) || (spec.filter !== undefined && !ctx.cardMatches(card, spec.filter))) continue;
          ctx.returnToHand({ kind: "object", object: card }, "exile");
        }
        return;
      }
      if (spec.linked === "graveyard") {
        const justExiled = spec.others === true ? ctx.cardsExiledThisWay() : [];
        for (const card of ctx.cardsExiledWithSource()) {
          if (!justExiled.includes(card)) ctx.putExiledIntoGraveyard(card);
        }
        return;
      }
      // Each case below that puts something onto the battlefield may stop
      // first to ask an "as this enters" choice (a Clone's copy — rule
      // 614.12); it moved nothing, and runs again once that's answered.
      const parked = ctx.parkedCount();
      const linkedOptions =
        spec.linked === "battlefield"
          ? {
              ...(spec.under === "you" ? { underYou: true } : {}),
              ...(spec.others === true ? { others: true } : {}),
              ...(spec.filter !== undefined ? { filter: spec.filter } : {}),
              ...(spec.enterTapped === true ? { enterTapped: true } : {}),
            }
          : undefined;
      if (ctx.returnExiledBySource(spec.linked === "battlefield", linkedOptions)) ctx.resumeAfterDecisions(spec, parked);
      return;
    }
    case "link-exiled-to-created": {
      const tokens = ctx.createdTokensApart();
      ctx.linkExiledTo(tokens);
      for (const object of tokens) {
        for (const ability of spec.gains ?? []) ctx.grantTriggered({ kind: "object", object }, ability, "permanent");
      }
      return;
    }
    case "choose-creature-type":
      ctx.chooseCreatureType(
        spec.then,
        spec.exclude,
        spec.options === undefined
          ? undefined
          : {
              options: spec.options,
              ...(spec.prompt !== undefined ? { prompt: spec.prompt } : {}),
              ...(spec.sentinel !== undefined ? { sentinel: spec.sentinel } : {}),
            },
        {
          ...(spec.remember === true ? { remember: "creature-type" as const } : {}),
          ...(spec.secret === true ? { secret: true as const } : {}),
        },
      );
      return;
    case "choose-card-name":
      ctx.chooseCardName(spec);
      return;
    case "players-pay-any-amount":
      applyPlayersPayAnyAmount(spec, ctx);
      return;
    case "bid-life":
      applyBidLife(spec, ctx);
      return;
    case "choose-value": {
      const chooser = spec.who === undefined ? undefined : effectPlayer(spec.who, ctx);
      if (spec.who !== undefined && chooser === undefined) return;
      ctx.chooseValue(spec, {
        ...(spec.max !== undefined ? { max: amountValue(spec.max, ctx) } : {}),
        ...(chooser !== undefined ? { chooser } : {}),
      });
      return;
    }
    case "put-onto-battlefield": {
      const target = resolveEffectTarget(spec.target, ctx);
      const parked = ctx.parkedCount();
      if (target !== undefined) {
        let under = spec.underYourControl === true ? ctx.controller : undefined;
        if (spec.under !== undefined) {
          // Someone else puts it there, under their control: an illegal
          // target — the card or that player — and nothing moves (608.2b).
          if (illegalSlot(spec.target, ctx)) return;
          under = effectPlayer(spec.under, ctx);
          if (under === undefined) return;
        }
        const asked = ctx.putOntoBattlefield(
          target,
          under,
          spec.enterTapped === true,
          spec.withCounters,
          spec.exileIfItWouldLeave,
          spec.flipped === true ? "flipped" : spec.transformed === true,
          spec.setTypes !== undefined ||
            spec.addSubtypes !== undefined ||
            spec.faceDown !== undefined ||
            spec.enterAs !== undefined
            ? {
                ...spec.enterAs,
                ...(spec.setTypes !== undefined ? { setTypes: spec.setTypes } : {}),
                ...(spec.addSubtypes !== undefined || spec.enterAs?.addSubtypes !== undefined
                  ? { addSubtypes: [...(spec.addSubtypes ?? []), ...(spec.enterAs?.addSubtypes ?? [])] }
                  : {}),
                ...(spec.faceDown !== undefined ? { faceDown: spec.faceDown } : {}),
              }
            : undefined,
          resolveEnterAttacking(spec.attacking, ctx),
          attachHost(spec.attachedTo, ctx),
        );
        if (asked) ctx.resumeAfterDecisions(spec, parked);
      }
      return;
    }
    case "exile-graveyard": {
      if (spec.target === "each-player" || spec.target === "each-opponent") {
        // "Exile all graveyards" is one move, not one per player.
        const scope = spec.target;
        ctx.simultaneously(() => {
          for (const player of ctx.playersInScope(scope)) {
            ctx.exileGraveyard({ kind: "player", player }, spec.filter, spec.linked === true, spec.fromHand, undefined, spec.faceDown);
          }
        });
        return;
      }
      let target: TargetRef | undefined;
      if (spec.target === "you") {
        target = { kind: "player", player: ctx.controller };
      } else if (typeof spec.target === "object") {
        const player = effectPlayer(spec.target, ctx);
        target = player === undefined ? undefined : { kind: "player", player };
      } else {
        target = ctx.targets[spec.target];
      }
      if (target !== undefined) ctx.exileGraveyard(target, spec.filter, spec.linked === true, spec.fromHand, spec.untilSourceLeaves === true, spec.faceDown);
      return;
    }
    case "sacrifice-all":
      ctx.sacrificeAll(ctx.playersInScope(spec.who), spec.filter);
      return;
    case "put-exiled-this-way-onto-battlefield": {
      const parked = ctx.parkedCount();
      if (ctx.putExiledThisWayOntoBattlefield()) ctx.resumeAfterDecisions(spec, parked);
      return;
    }
    case "move-exiled-this-way":
      ctx.moveExiledThisWay(spec.to, spec.filter);
      return;
    case "put-arrived-onto-battlefield": {
      const parked = ctx.parkedCount();
      if (ctx.putArrivedOntoBattlefield(spec)) ctx.resumeAfterDecisions(spec, parked);
      return;
    }
    case "reveal-until-count": {
      let progress = spec.progress;
      if (progress === undefined) {
        const n = amountValue(spec.count, ctx);
        if (n <= 0) return;
        const owner = revealingPlayer(spec.whose, ctx);
        if (owner === undefined) return;
        progress = { owner, ...ctx.revealUntilCount(owner, spec.filter, n, spec.exile === true) };
      }
      const put = spec.put ?? "battlefield";
      const exiled = spec.exile === true;
      if (put === "battlefield") {
        const parked = ctx.parkedCount();
        if (ctx.putOntoBattlefieldTogether(progress.found, spec.tapped === true)) {
          ctx.resumeAfterDecisions({ ...spec, progress }, parked);
          return;
        }
      } else if (put === "hand") {
        ctx.placeRevealed(progress.owner, progress.found, "hand", exiled);
      }
      if (put === "with-rest") {
        ctx.placeRevealed(progress.owner, progress.revealed, spec.rest, exiled);
        return;
      }
      const found = new Set(progress.found);
      ctx.placeRevealed(
        progress.owner,
        progress.revealed.filter((id) => !found.has(id)),
        spec.rest,
        exiled,
      );
      return;
    }
    case "flicker": {
      const target = spec.target;
      const refs: EffectTargetRef[] =
        typeof target !== "object"
          ? [target]
          : "from" in target
            ? Array.from({ length: Math.max(0, ctx.targets.length - target.from) }, (_unused, i) => target.from + i)
            : [...target];
      const targets: TargetRef[] = [];
      for (const ref of refs) {
        const target = resolveEffectTarget(ref, ctx);
        if (target !== undefined) targets.push(target);
      }
      const parked = ctx.parkedCount();
      const returning = ctx.flicker(targets, {
        ...(spec.thenCounters !== undefined ? { thenCounters: spec.thenCounters } : {}),
        ...(spec.underYourControl === true ? { underYourControl: true } : {}),
        ...(spec.returnAt !== undefined ? { returnAt: spec.returnAt } : {}),
        ...(spec.returnText !== undefined ? { returnText: spec.returnText } : {}),
        ...(spec.transformed === true ? { transformed: true } : {}),
        ...(spec.tapped === true ? { tapped: true } : {}),
        ...(spec.target === "source" ? { fromSource: true } : {}),
      });
      if (returning !== null) ctx.resumeAfterDecisions(returning, parked);
      return;
    }
    case "return-flickered": {
      const parked = ctx.parkedCount();
      const asked = ctx.returnFlickered(
        spec.link,
        spec.thenCounters,
        spec.underYourControl === true,
        spec.transformed === true,
        spec.tapped === true,
      );
      if (asked) ctx.resumeAfterDecisions(spec, parked);
      return;
    }
    case "meld": {
      const source = resolveEffectTarget("source", ctx);
      const chosen = spec.chosen === true ? ctx.targets[0] : undefined;
      ctx.meld(
        source?.kind === "object" ? source.object : undefined,
        spec.partner,
        spec.into,
        spec.chosen !== true ? undefined : chosen?.kind === "object" ? chosen.object : null,
      );
      return;
    }
    case "grant-flashback": {
      const target = ctx.targets[spec.target];
      if (target !== undefined) ctx.grantFlashback(target, spec.cost);
      return;
    }
    case "grant-flashback-all":
      ctx.grantFlashbackAll(spec.filter);
      return;
    case "grant-graveyard-keyword": {
      if (spec.target !== undefined) {
        const target = ctx.targets[spec.target];
        if (target !== undefined) ctx.grantGraveyardKeyword(target, undefined, spec.grant);
      } else {
        ctx.grantGraveyardKeyword(undefined, spec.filter, spec.grant);
      }
      return;
    }
    case "grant-graveyard-cast": {
      const target = ctx.targets[spec.target];
      if (target !== undefined) ctx.grantGraveyardCast(target);
      return;
    }
    case "mill": {
      for (const slot of scopedOrTargetedPlayers(spec.target, ctx)) {
        const who = slot.kind === "player" ? slot.player : ctx.controllerOf(slot);
        if (who === undefined) continue;
        const target: TargetRef = { kind: "player", player: who };
        ctx.mill(target, amountValue(spec.amount, ctx, who));
      }
      return;
    }
    case "skip-next-untap": {
      for (const target of scopedOrTargetedPlayers(spec.who ?? "you", ctx)) ctx.skipNextUntap(target, spec.filter);
      return;
    }
    case "skip-untap-step": {
      for (const target of scopedOrTargetedPlayers(spec.who ?? "you", ctx)) {
        if (target.kind === "player") ctx.skipUntapStep(target.player);
      }
      return;
    }
    case "skip-step": {
      for (const target of scopedOrTargetedPlayers(spec.who ?? "you", ctx)) {
        if (target.kind !== "player") continue;
        if (spec.step === "untap" && spec.thisTurn !== true) ctx.skipUntapStep(target.player);
        else ctx.skipStep(target.player, spec.step, spec.thisTurn === true, spec.allOfNextTurn === true);
      }
      return;
    }
    case "shuffle-graveyard-into-library": {
      const players = scopedOrTargetedPlayers(spec.target, ctx);
      const moved = new Map<PlayerId, number>();
      ctx.simultaneously(() => {
        for (const target of players) {
          const n = ctx.shuffleZonesIntoLibrary(target, spec.zones ?? ["graveyard"], spec.filter);
          if (target.kind === "player") moved.set(target.player, n);
        }
      });
      if (spec.drawThatMany === true) {
        for (const [player, n] of moved) if (n > 0) ctx.draw(player, n);
      }
      return;
    }
    case "exile-from-library": {
      // One instruction, so one move: "exile the top three cards" — or the
      // top card of each player's library (Pako) — puts them all into exile
      // at once, a single event for "whenever one or more cards are put into
      // exile" (rule 603.2c). Each count is read before anything moves.
      const plan = scopedOrTargetedPlayers(spec.whose ?? "you", ctx).map((target) => ({
        target,
        count:
          spec.allBut !== undefined
            ? { allBut: spec.allBut }
            : {
                top: amountValue(
                  spec.amount ?? 1,
                  ctx,
                  target.kind === "player" ? target.player : undefined,
                ),
              },
      }));
      ctx.simultaneously(() => {
        for (const { target, count } of plan) ctx.exileFromLibrary(target, count, spec.withCounters, spec.linked === true, spec.faceDown);
      });
      return;
    }
    case "turn-exiled-face-up":
      ctx.turnExiledFaceUp();
      return;
    case "delayed-trigger": {
      let controller = ctx.controller;
      if (spec.controller !== undefined) {
        const of = ctx.targets[spec.controller.controllerOfTarget];
        // The target may already be gone (Arcane Denial counters first);
        // `controllerOf` reads last-known information for exactly this.
        const who = of === undefined ? undefined : ctx.controllerOf(of);
        if (who === undefined) return;
        controller = who;
      }
      if (typeof spec.at === "object" && "attacksUnblocked" in spec.at) {
        const watched = resolveEffectTarget(spec.at.attacksUnblocked, ctx);
        if (watched?.kind !== "object") return;
        ctx.delayTrigger({ attacksUnblocked: watched.object }, spec.effect, spec.text, controller);
        return;
      }
      if (typeof spec.at === "object" && "losesControl" in spec.at) {
        const watched = resolveEffectTarget(spec.at.losesControl, ctx);
        if (watched?.kind !== "object") return;
        // "Sacrifice the creature": what this resolution put there (Seraph).
        const about =
          spec.about === undefined || spec.about === "attached"
            ? undefined
            : ctx.thisWay(spec.about).map((e) => ({ kind: "object", object: e.object }) as const);
        if (about?.length === 0) return;
        ctx.delayTrigger(
          {
            losesControl: watched.object,
            ...(spec.at.thisTurn === true ? { thisTurn: true as const } : {}),
            ...(spec.at.onlyIf !== undefined ? { onlyIf: spec.at.onlyIf } : {}),
          },
          spec.effect,
          spec.text,
          controller,
          about,
        );
        return;
      }
      if (typeof spec.at === "object" && "whenever" in spec.at) {
        // "…to that player this turn" (Great Train Heist): the player the
        // slot holds as this resolves.
        let player: PlayerId | undefined;
        if (spec.at.toPlayer !== undefined) {
          if (illegalSlot(spec.at.toPlayer, ctx)) return;
          const target = ctx.targets[spec.at.toPlayer];
          if (target?.kind !== "player") return;
          player = target.player;
        }
        const { watching, orLosesControl, ...at } = spec.at;
        // "Target creature", "those creatures": the permanents `"self"` reads
        // as, fixed now. `delayTrigger` drops any no longer on the battlefield.
        let watched: readonly ObjectId[] | undefined;
        if (watching === "targets") {
          watched = ctx.targets.flatMap((t, slot) =>
            t?.kind === "object" && !illegalSlot(slot, ctx) ? [t.object] : [],
          );
        } else if (watching !== undefined) {
          const one = illegalSlot(watching, ctx) ? undefined : resolveEffectTarget(watching, ctx);
          watched = one?.kind === "object" ? [one.object] : [];
        }
        const losing = orLosesControl === undefined ? undefined : resolveEffectTarget(orLosesControl, ctx);
        if (orLosesControl !== undefined && losing?.kind !== "object") return;
        // "Exile that creature": what this resolution put there (Coffin Queen).
        const about =
          spec.about === undefined || spec.about === "attached"
            ? undefined
            : ctx.thisWay(spec.about).map((e) => ({ kind: "object", object: e.object }) as const);
        if (about?.length === 0 && spec.orNone !== true) return;
        ctx.delayTrigger(
          {
            ...at,
            ...(player !== undefined ? { player } : {}),
            ...(watched !== undefined ? { watched } : {}),
            ...(losing?.kind === "object" ? { orLosesControlOf: losing.object } : {}),
          },
          spec.effect,
          spec.text,
          controller,
          about,
        );
        return;
      }
      if (typeof spec.at === "object" && "nextSpell" in spec.at) {
        ctx.delayTrigger(
          {
            nextSpell: spec.at.nextSpell,
            ...(spec.at.orNextAbility !== undefined ? { orNextAbility: spec.at.orNextAbility } : {}),
          },
          spec.effect,
          spec.text,
          controller,
        );
        return;
      }
      if (typeof spec.at === "object") {
        // "Exile that token", "put the exiled card into your hand": what this
        // resolution did that to, in place of the creating ability's targets.
        const about =
          spec.about === undefined || spec.about === "attached"
            ? undefined
            : spec.about === "created"
              ? ctx.createdTokensApart().map((object) => ({ kind: "object", object }) as const)
              : ctx.thisWay(spec.about).map((e) => ({ kind: "object", object: e.object }) as const);
        if (about?.length === 0 && spec.orNone !== true) return;
        const { leaves, to, thisTurn } = spec.at;
        const watch = (object: ObjectId): void =>
          ctx.delayTrigger(
            { leaves: object, to, ...(thisTurn === true ? { thisTurn: true } : {}) },
            spec.effect,
            spec.text,
            controller,
            about,
          );
        if (leaves === "created") {
          ctx.createdTokensApart().forEach(watch);
          return;
        }
        // "When it dies": only a permanent can die, so there must be one to
        // watch as this applies.
        const watched = resolveEffectTarget(leaves, ctx);
        if (watched?.kind !== "object") return;
        watch(watched.object);
        return;
      }
      // "At this turn's next end of combat, destroy all creatures that blocked
      // or were blocked by it this turn" (Venomous Breath): "it" is fixed now,
      // and the delayed ability has no target to lose if it has left by then.
      const aboutBlocks = bindBlockPartners(spec.effect, ctx);
      if (aboutBlocks !== spec.effect) {
        ctx.delayTrigger(spec.at, aboutBlocks, spec.text, controller, []);
        return;
      }
      if (spec.about === "attached") {
        const host = resolveEffectTarget("attached", ctx);
        if (host !== undefined) ctx.delayTrigger(spec.at, spec.effect, spec.text, controller, [host]);
        return;
      }
      const turnOf = spec.turnOf === undefined ? undefined : effectPlayer(spec.turnOf, ctx);
      if (spec.turnOf !== undefined && turnOf === undefined) return;
      if (spec.about !== undefined) {
        const done = ctx.thisWay(spec.about).map((e) => ({ kind: "object", object: e.object }) as const);
        if (done.length > 0 || spec.orNone === true) ctx.delayTrigger(spec.at, spec.effect, spec.text, controller, done, turnOf);
        return;
      }
      ctx.delayTrigger(spec.at, spec.effect, spec.text, controller, undefined, turnOf);
      return;
    }
    case "enters-with-counters": {
      const target = resolveEffectTarget(spec.target, ctx);
      if (target !== undefined) ctx.entersWithCounters(target, spec.counter, amountValue(spec.amount, ctx), spec.ifAsItEnters);
      return;
    }
    case "cast-now":
      applyCastNowSpec(spec, ctx);
      return;
    case "choose-exiled-to-play":
      ctx.chooseExiledToPlay(spec.filter, spec.free === true, spec.linked === true ? ctx.cardsExiledWithSource(true) : undefined);
      return;
    case "allow-cast-linked-exile":
      ctx.allowCastLinkedExile(spec.spell, spec.free === true, {
        ...(spec.play === true ? { play: true } : {}),
        ...(spec.anyNumber === true ? { anyNumber: true } : {}),
        ...(spec.reduce !== undefined ? { reduce: spec.reduce } : {}),
      });
      return;
    case "allow-cast-from-exile": {
      const target = resolveEffectTarget(spec.target, ctx);
      if (target !== undefined) {
        ctx.allowCastFromExile(target, spec.free === true, spec.laterTurns === true, {
          whileExiled: spec.whileExiled === true,
          undaunted: spec.undaunted === true,
          ...(spec.spendAs !== undefined ? { spendAs: spec.spendAs } : {}),
        });
      }
      return;
    }
    case "unlock-door": {
      const target = spec.target === undefined ? undefined : resolveEffectTarget(spec.target, ctx);
      if (spec.target !== undefined && target?.kind !== "object") return;
      const options = ctx
        .roomDoors(target?.kind === "object" ? target.object : undefined)
        .filter((d) => !d.unlocked || spec.orLock === true);
      if (options.length === 0) return;
      const modes = options.map((d) => ({
        text: `${d.unlocked ? "Lock" : "Unlock"} ${d.name}${target === undefined ? ` (${d.roomName})` : ""}`,
        effect: { kind: "set-door", object: d.object, door: d.door, lock: d.unlocked } as const,
      }));
      if (modes.length === 1) applyEffectSpec(modes[0].effect, ctx);
      else applyEffectSpec({ kind: "modal", minModes: 1, maxModes: 1, modes }, ctx);
      return;
    }
    case "set-door":
      ctx.setDoor(spec.object, spec.door, spec.lock);
      return;
    case "gain-class-level":
      ctx.setClassLevel(spec.level);
      return;
    case "ninjutsu": {
      const parked = ctx.parkedCount();
      // Its "as this enters" choices first (Sakashima's Student's copy),
      // then this again to put it there.
      if (ctx.ninjutsu()) ctx.resumeAfterDecisions(spec, parked);
      return;
    }
    case "earthbend": {
      // Earthbend N: "Target land you control becomes a 0/0 creature with
      // haste that's still a land. Put N +1/+1 counters on it. When it dies
      // or is exiled, return it to the battlefield tapped." The steps are
      // applied in that order within one resolution, so the 0/0 never faces
      // state-based actions before its counters arrive.
      const target = spec.target;
      applyEffectSpec(
        {
          kind: "animate",
          target,
          power: 0,
          toughness: 0,
          addTypes: ["creature"],
          addSubtypes: [],
          keywords: ["haste"],
          duration: "permanent",
        },
        ctx,
      );
      applyEffectSpec({ kind: "add-counter", target, counter: "+1/+1", amount: spec.amount }, ctx);
      applyEffectSpec(
        {
          kind: "delayed-trigger",
          at: { leaves: target, to: ["graveyard", "exile"] },
          effect: { kind: "put-onto-battlefield", target: "trigger-object", enterTapped: true },
          text: "When it dies or is exiled, return it to the battlefield tapped.",
        },
        ctx,
      );
      return;
    }
    case "sacrifice-target": {
      const target =
        spec.target === "source"
          ? ({ kind: "object", object: ctx.source } as const)
          : spec.target === "trigger-object"
            ? ctx.triggerObject === undefined || ctx.triggerObjectLost === true
              ? undefined
              : ({ kind: "object", object: ctx.triggerObject } as const)
            : typeof spec.target !== "number"
              ? resolveEffectTarget(spec.target, ctx)
              : ctx.targets[spec.target];
      if (target !== undefined) ctx.sacrificeTarget(target, spec.byItsController);
      return;
    }
    case "put-on-library": {
      const position = spec.position;
      if (typeof position === "object" && "ownerChooses" in position) {
        // The owner's choice (rule 608.2d — "its owner puts it …"), asked
        // of them as this resolves; the move is still this effect's.
        if (typeof spec.target !== "number" || ctx.targets[spec.target] === undefined) return;
        applyEffectSpec(
          {
            kind: "each-player-may",
            who: { ownerOfTarget: spec.target },
            choices: position.ownerChooses.map((at) => ({
              text: libraryPositionText(at),
              effect: { kind: "put-on-library", target: spec.target, position: at },
            })),
          },
          ctx,
        );
        return;
      }
      const target = resolveEffectTarget(spec.target, ctx);
      if (target === undefined) return;
      ctx.putOnLibrary(
        target,
        typeof position === "object" && "beneathTop" in position
          ? { fromTop: amountValue(position.beneathTop, ctx) + 1 }
          : position,
      );
      return;
    }
    case "put-on-libraries": {
      // The owners' choices of an end first, one owner at a time, each
      // answered before the next is asked; then every card moves at once;
      // then each owner's orders, one at a time (rules 101.4, 401.4).
      const below = ctx.parkedCount();
      let progress = spec.progress;
      if (progress === undefined) {
        const objects =
          "targetsFrom" in spec.what
            ? ctx.targets
                .slice(spec.what.targetsFrom)
                .flatMap((t) => (t?.kind === "object" ? [t.object] : []))
            : ctx.permanentsMatching(spec.what.all).map((p) => p.object);
        if (spec.withSource === true) {
          const self = resolveEffectTarget("source", ctx);
          if (self?.kind === "object") objects.push(self.object);
        }
        const cards = [...new Set(objects)].flatMap((object) => {
          const zoneChangeCount = ctx.zoneChangeCountOf(object);
          return zoneChangeCount === undefined ? [] : [{ object, zoneChangeCount }];
        });
        if (cards.length === 0) return;
        const owners =
          spec.position === "owner-chooses"
            ? ctx.apnap([
                ...new Set(
                  cards.flatMap((c) => {
                    const owner = ctx.ownerOf({ kind: "object", object: c.object });
                    return owner === undefined ? [] : [owner];
                  }),
                ),
              ])
            : [];
        progress = { cards, toAsk: owners, bottom: [] };
      } else if (progress.asked === true) {
        progress = { cards: progress.cards, toAsk: progress.toAsk, bottom: [...progress.bottom, ...ctx.takeKept()] };
      }
      const cards = progress.cards;
      // The same objects they were as this began (rule 400.7).
      const still = (): ObjectId[] =>
        cards.filter((c) => ctx.zoneChangeCountOf(c.object) === c.zoneChangeCount).map((c) => c.object);
      let orders = progress.orders;
      if (orders === undefined) {
        let toAsk = progress.toAsk;
        while (toAsk.length > 0) {
          const owner = toAsk[0];
          toAsk = toAsk.slice(1);
          if (ctx.askLibraryEnds(owner, still())) {
            ctx.resumeAfterDecisions({ ...spec, progress: { ...progress, toAsk, asked: true } }, below);
            return;
          }
        }
        const bottom = new Set(progress.bottom);
        const fixed = spec.position === "bottom" || spec.position === "shuffle" ? spec.position : "top";
        orders = ctx.putOnLibrariesTogether(
          still().map((object) => ({
            object,
            position: spec.position === "owner-chooses" ? (bottom.has(object) ? "bottom" : "top") : fixed,
          })),
        );
      }
      while (orders.length > 0) {
        const step = orders[0];
        orders = orders.slice(1);
        if (ctx.askLibraryOrder(step)) {
          ctx.resumeAfterDecisions({ ...spec, progress: { cards, toAsk: [], bottom: [], orders } }, below);
          return;
        }
      }
      return;
    }
    case "return-from-graveyard": {
      const parked = ctx.parkedCount();
      const count = spec.count === "all" ? "all" : Math.max(0, Math.floor(amountValue(spec.count, ctx)));
      // "Up to X" with X of 0: nothing to put anywhere.
      if (count === 0) return;
      const asked = ctx.returnFromGraveyard(
        spec.filter,
        spec.destination,
        count,
        spec.enterTapped ?? false,
        spec.withCounters,
        {
          ...(spec.from === "all-graveyards" || spec.from === "each-graveyard" ? { allGraveyards: true } : {}),
          ...(spec.from === "each-graveyard" ? { underOwners: true } : {}),
          ...(spec.from === "hand-or-graveyard" ? { handToo: true } : {}),
          ...(spec.enterAs !== undefined ? { enterAs: spec.enterAs } : {}),
          ...(spec.attachedTo !== undefined ? { attachTo: attachHost(spec.attachedTo, ctx) } : {}),
          ...(spec.upTo === true ? { upTo: true } : {}),
          ...(spec.totalManaValueAtMost !== undefined ? { totalManaValueAtMost: spec.totalManaValueAtMost } : {}),
        },
      );
      if (asked) ctx.resumeAfterDecisions(spec, parked);
      return;
    }
    case "discard-chosen": {
      const target =
        typeof spec.target === "number"
          ? ctx.targets[spec.target]
          : ((player) => (player === undefined ? undefined : { kind: "player" as const, player }))(
              effectPlayer(spec.target, ctx),
            );
      if (target !== undefined) {
        const upTo = spec.upTo === undefined ? undefined : Math.max(0, Math.floor(amountValue(spec.upTo, ctx)));
        const chooser = spec.chooser === undefined ? undefined : effectPlayer(spec.chooser, ctx);
        if (spec.chooser !== undefined && chooser === undefined) return;
        ctx.discardChosen(target, spec.filter, spec.lookOnly === true, spec.optional === true, upTo, {
          ...(chooser !== undefined ? { chooser } : {}),
          ...(spec.destination !== undefined ? { destination: spec.destination } : {}),
          ...(spec.unlinked === true ? { unlinked: true } : {}),
          ...(spec.untilSourceLeaves === true ? { untilSourceLeaves: true } : {}),
          ...(spec.alsoFrom !== undefined ? { alsoFrom: spec.alsoFrom } : {}),
          ...(spec.mayCast !== undefined ? { mayCast: spec.mayCast } : {}),
          ...(spec.reveals !== undefined
            ? {
                reveals: {
                  count: Math.max(0, Math.floor(amountValue(spec.reveals, ctx))),
                  picks: spec.picks === undefined ? 1 : Math.max(0, Math.floor(amountValue(spec.picks, ctx))),
                },
              }
            : {}),
        });
      }
      return;
    }
    case "look-at-hand": {
      const target = ctx.targets[spec.target];
      if (target !== undefined) ctx.discardChosen(target, undefined, true, true, 0);
      return;
    }
    case "look-at-library-top": {
      const target = ctx.targets[spec.target];
      if (target?.kind === "player") ctx.lookAtLibraryTop(target.player);
      return;
    }
    case "discard": {
      if (spec.release === true) {
        ctx.releaseHeldChoices();
        return;
      }
      const players = scopedOrTargetedPlayers(spec.target, ctx);
      // "Each player discards a card" (rule 101.4): each chooses in turn
      // from the active player, the chosen cards staying face down in hand
      // (101.4a) so no later player sees an earlier one's discard, and then
      // they're all discarded at once. At random nobody chooses. Already
      // held by an enclosing choice, that one releases them.
      const hold = typeof spec.target !== "number" && players.length > 1 && spec.random !== true && !ctx.choicesHeld();
      if (hold) {
        ctx.holdChoices();
        const parked = ctx.parkedCount();
        const pendingBefore = ctx.decisionPending();
        const ordered = ctx.apnap(players.flatMap((ref) => (ref.kind === "player" ? [ref.player] : [])));
        for (const player of ordered) {
          ctx.discardCards(
            { kind: "player", player },
            amountValue(spec.anyNumber === true ? (spec.atMost ?? 0) : spec.amount, ctx, player),
            false,
            spec.unlessOne,
            spec.anyNumber === true,
            spec.filter,
          );
        }
        if (!pendingBefore && ctx.decisionPending()) {
          ctx.resumeAfterDecisions({ ...spec, release: true }, parked);
        } else {
          ctx.releaseHeldChoices();
        }
        return;
      }
      for (const target of players) {
        ctx.discardCards(
          target,
          amountValue(
            spec.anyNumber === true ? (spec.atMost ?? 0) : spec.amount,
            ctx,
            target.kind === "player" ? target.player : undefined,
          ),
          spec.random === true,
          spec.unlessOne,
          spec.anyNumber === true,
          spec.filter,
        );
      }
      return;
    }
    case "modify-pt": {
      const target = resolveEffectTarget(spec.target, ctx);
      if (target !== undefined) {
        ctx.modifyPt(
          target,
          ptChangeValue(spec.power, ctx),
          ptChangeValue(spec.toughness, ctx),
          spec.duration,
        );
      }
      return;
    }
    case "switch-pt": {
      if (spec.all !== undefined) {
        ctx.switchPt(spec.all, spec.duration);
        return;
      }
      const target = spec.target === undefined ? undefined : resolveEffectTarget(spec.target, ctx);
      if (target !== undefined) ctx.switchPt(target, spec.duration);
      return;
    }
    case "modify-pt-all": {
      const named = spec.controlledByPlayer === undefined ? undefined : effectPlayer(spec.controlledByPlayer, ctx);
      if (spec.controlledByPlayer !== undefined && named === undefined) return;
      ctx.modifyPtAll(
        spec.filter,
        ptChangeValue(spec.power, ctx),
        ptChangeValue(spec.toughness, ctx),
        spec.duration,
        spec.exceptSource === true,
        named ?? scopedController(spec.controlledByTarget, ctx),
      );
      return;
    }
    case "double-pt-all":
      ctx.doublePtAll(spec.filter, spec.duration, spec.powerOnly === true, spec.exceptSource === true);
      return;
    case "grant-player-hexproof":
      ctx.grantPlayerHexproof(spec.who ?? "you");
      return;
    case "grant-spells-this-turn":
      ctx.grantSpellsThisTurn({
        ...(spec.castFrom !== undefined ? { castFrom: spec.castFrom } : {}),
        ...(spec.filter !== undefined ? { filter: spec.filter } : {}),
        ...(spec.next === true ? { next: true } : {}),
        triggered: spec.triggered ?? [],
        ...(spec.cantBeCountered === true ? { cantBeCountered: true } : {}),
        ...(spec.convoke === true ? { convoke: true } : {}),
        ...(spec.entersWithCounters !== undefined ? { entersWithCounters: spec.entersWithCounters } : {}),
        ...(spec.reduceGeneric !== undefined ? { reduceGeneric: amountValue(spec.reduceGeneric, ctx) } : {}),
        ...(spec.affinityFor !== undefined ? { affinityFor: spec.affinityFor } : {}),
        ...(spec.payLifeManaValue === true ? { payLifeManaValue: true as const } : {}),
      });
      return;
    case "populate":
      ctx.populate();
      return;
    case "amass": {
      const chosen = spec.onto === undefined ? undefined : ctx.targets[spec.onto];
      if (spec.onto !== undefined && chosen?.kind !== "object") return;
      const player = spec.who === undefined ? undefined : effectPlayer(spec.who, ctx);
      if (spec.who !== undefined && player === undefined) return;
      ctx.amass(
        amountValue(spec.amount, ctx),
        spec.creatureType,
        chosen?.kind === "object" ? chosen.object : undefined,
        player,
      );
      return;
    }
    case "monstrosity":
      ctx.monstrosity(amountValue(spec.amount, ctx));
      return;
    case "renown":
      ctx.renown(amountValue(spec.amount, ctx));
      return;
    case "add-counter-all": {
      const scopeTo =
        spec.controlledByPlayer !== undefined
          ? effectPlayer(spec.controlledByPlayer, ctx)
          : scopedController(spec.controlledByTarget, ctx);
      if ((spec.controlledByTarget !== undefined || spec.controlledByPlayer !== undefined) && scopeTo === undefined) return;
      const spared = spec.exceptTarget === undefined ? undefined : ctx.targets[spec.exceptTarget];
      ctx.addCounterAll(
        spec.filter,
        spec.counter,
        spec.amount === "own-toughness" ? spec.amount : amountValue(spec.amount, ctx),
        spec.exceptSource === true,
        scopeTo,
        spec.putByTarget === true ? scopeTo : undefined,
        spared?.kind === "object" ? spared.object : undefined,
      );
      return;
    }
    case "double-counters-all":
      ctx.doubleCountersAll(spec.filter, spec.counterKind);
      return;
    case "double-counters": {
      const target = resolveEffectTarget(spec.target, ctx);
      if (target !== undefined) ctx.doubleCounters(target, spec.counter);
      return;
    }
    case "another-counter-of-each-kind": {
      const target = resolveEffectTarget(spec.target, ctx);
      if (target === undefined) return;
      if (spec.orRemove !== true) {
        ctx.anotherCounterOfEachKind(target);
        return;
      }
      // The kinds as they are now: a choice per kind, each carried out before
      // the next is asked, and nothing else can happen in between.
      const kinds = Object.entries(ctx.counterKindsOf(target)).filter(([, n]) => n > 0);
      if (kinds.length === 0) return;
      applyEffectSpec(
        {
          kind: "sequence",
          effects: kinds.map(
            ([counter]): EffectSpec => ({
              kind: "modal",
              minModes: 1,
              maxModes: 1,
              modes: [
                {
                  text: `Put another ${counter} counter on it.`,
                  effect: { kind: "add-counter", target: spec.target, counter, amount: 1 },
                },
                {
                  text: `Remove a ${counter} counter from it.`,
                  effect: { kind: "remove-counter", target: spec.target, counter, amount: 1 },
                },
              ],
            }),
          ),
        },
        ctx,
      );
      return;
    }
    case "grant-keyword-all": {
      if (spec.controlledByTarget !== undefined && illegalSlot(spec.controlledByTarget, ctx)) return;
      const scopeTo = scopedController(spec.controlledByTarget, ctx);
      if (spec.controlledByTarget !== undefined && scopeTo === undefined) return;
      ctx.grantKeywordAll(spec.filter, spec.keyword, spec.duration, spec.exceptSource === true, scopeTo);
      return;
    }
    case "grant-toxic": {
      if (spec.filter !== undefined) {
        ctx.grantToxic(spec.filter, spec.amount, spec.duration, spec.exceptSource === true);
        return;
      }
      const target = spec.target === undefined ? undefined : resolveEffectTarget(spec.target, ctx);
      if (target !== undefined) ctx.grantToxic(target, spec.amount, spec.duration);
      return;
    }
    case "grant-protection": {
      if ("choose" in spec.from) {
        // The quality is chosen as it resolves, before anything gains it:
        // one mode per quality, each the grant with that quality fixed.
        const choice = spec.from;
        const modes: ModeOption[] = protectionChoiceOptions(choice).map((option) => ({
          text: `Protection from ${option.text}`,
          effect: { ...spec, from: option.from },
        }));
        ctx.chooseModes(choice.optional === true ? 0 : 1, 1, modes);
        return;
      }
      const from = fixProtectionSide(spec.from, ctx);
      const target = spec.target === undefined ? undefined : resolveEffectTarget(spec.target, ctx);
      if (spec.target !== undefined && target === undefined && spec.filter === undefined) return;
      ctx.grantProtection(
        {
          ...(target !== undefined ? { target } : {}),
          ...(spec.filter !== undefined ? { filter: spec.filter } : {}),
          ...(spec.exceptSource === true ? { exceptSource: true } : {}),
        },
        from,
        spec.duration,
      );
      return;
    }
    case "incubate":
      ctx.incubate(amountValue(spec.amount, ctx));
      return;
    case "remove-from-combat": {
      const target = resolveEffectTarget(spec.target, ctx);
      if (target !== undefined) ctx.removeFromCombat(target);
      return;
    }
    case "lose-keywords": {
      if (spec.filter !== undefined) {
        const scopeTo = scopedController(spec.controlledByTarget, ctx);
        if (spec.controlledByTarget !== undefined && scopeTo === undefined) return;
        ctx.loseKeywords(spec.filter, spec.keywords, spec.duration, scopeTo, spec.cantHave);
        return;
      }
      const target = spec.target === undefined ? undefined : resolveEffectTarget(spec.target, ctx);
      if (target !== undefined) ctx.loseKeywords(target, spec.keywords, spec.duration, undefined, spec.cantHave);
      return;
    }
    case "connive": {
      const target = resolveEffectTarget(spec.target, ctx);
      // One that has left — or is back as a new object — still connives, as
      // it last existed: its last controller draws and discards, and nothing
      // gets a counter (rule 701.50b). A context that only reads it (a
      // `for-each-convoker`'s) says which it was.
      // A source or trigger object that has left is read the same way (M.O.D.O.K.,
      // killed in response to his own connive).
      const read =
        target ??
        (typeof spec.target === "number"
          ? ctx.readTargets?.[spec.target]
          : spec.target === "source"
            ? { kind: "object" as const, object: ctx.source }
            : ctx.triggerObject !== undefined
              ? { kind: "object" as const, object: ctx.triggerObject }
              : undefined);
      if (read?.kind !== "object") return;
      if (spec.discardsSince === undefined) {
        const player = ctx.controllerOf(read);
        const n = amountValue(spec.amount ?? 1, ctx);
        if (player === undefined || n <= 0) return;
        const since = ctx.nextEventSeq();
        ctx.draw(player, n);
        const parked = ctx.parkedCount();
        const pendingBefore = ctx.decisionPending();
        ctx.discardCards({ kind: "player", player }, n, false);
        const rest = { ...spec, discardsSince: since };
        // No actions happen in between (the ruling): the counters wait only
        // for the discard to be chosen.
        if (!pendingBefore && ctx.decisionPending()) {
          ctx.resumeAfterDecisions(rest, parked);
          return;
        }
        applyEffectSpec(rest, ctx);
        return;
      }
      const nonland = ctx.thisWay("discarded", undefined, { notTypes: ["land"] }, spec.discardsSince);
      const amount = nonland.reduce((n, e) => n + e.count, 0);
      if (amount > 0 && target !== undefined) ctx.addCounter(target, "+1/+1", amount);
      return;
    }
    case "explore": {
      if (spec.toGraveyard !== undefined) {
        ctx.exploreToGraveyard(spec.toGraveyard);
        return;
      }
      if (spec.done !== undefined) {
        ctx.explored(spec.done);
        return;
      }
      // "Each Merfolk creature you control explores" (rule 701.44d): the
      // explorers fixed now, then one at a time, its controller choosing which.
      if (spec.each !== undefined) {
        const explorers = ctx.exploreCandidates(spec.each);
        applyEffectSpec({ kind: "explore", target: spec.target, remaining: explorers.map((e) => e.object) }, ctx);
        return;
      }
      if (spec.remaining !== undefined) {
        const left = spec.remaining;
        if (left.length === 0) return;
        if (left.length === 1) {
          applyEffectSpec({ kind: "explore", target: spec.target, object: left[0] }, ctx);
          return;
        }
        const seen = new Map<string, number>();
        applyEffectSpec(
          {
            kind: "modal",
            minModes: 1,
            maxModes: 1,
            modes: left.map((object) => {
              const name = ctx.objectName(object);
              const n = (seen.get(name) ?? 0) + 1;
              seen.set(name, n);
              return {
                text: `${name}${n > 1 ? ` (${n})` : ""} explores next`,
                effect: {
                  kind: "sequence",
                  effects: [
                    { kind: "explore", target: spec.target, object },
                    { kind: "explore", target: spec.target, remaining: left.filter((id) => id !== object) },
                  ],
                },
              };
            }),
          },
          ctx,
        );
        return;
      }
      // "Explores X times": one whole exploration after another, each choice
      // made before the next reveal.
      const times = spec.times === undefined ? 1 : amountValue(spec.times, ctx);
      if (times !== 1) {
        if (times > 1) {
          const once: EffectSpec = { kind: "explore", target: spec.target };
          applyEffectSpec({ kind: "sequence", effects: Array.from({ length: times }, () => once) }, ctx);
        }
        return;
      }
      const target =
        spec.object !== undefined
          ? ctx.onBattlefield(spec.object)
            ? { kind: "object" as const, object: spec.object }
            : undefined
          : resolveEffectTarget(spec.target, ctx);
      // One that has left — or is back as a new object — still explores as
      // it last existed (rule 701.44c), as a connive is read.
      const read =
        target ??
        (spec.object !== undefined ? { kind: "object" as const, object: spec.object } : undefined) ??
        (typeof spec.target === "number"
          ? ctx.readTargets?.[spec.target]
          : spec.target === "source"
            ? { kind: "object" as const, object: ctx.source }
            : ctx.triggerObject !== undefined
              ? { kind: "object" as const, object: ctx.triggerObject }
              : undefined);
      if (read?.kind !== "object") return;
      const found = ctx.exploreReveal(read.object);
      if (found === null) return;
      const done: EffectSpec = {
        kind: "explore",
        target: spec.target,
        ...(spec.object !== undefined ? { object: spec.object } : {}),
        done: { explorer: read.object, ...found },
      };
      if (found.land) {
        applyEffectSpec(done, ctx);
        return;
      }
      // Not a land card (or nothing revealed): the counter, on it only if
      // it's still here, then the choice.
      if (target !== undefined) ctx.addCounter(target, "+1/+1", 1);
      if (found.revealed === null) {
        applyEffectSpec(done, ctx);
        return;
      }
      applyEffectSpec(
        {
          kind: "sequence",
          effects: [
            {
              kind: "may",
              prompt: `Put ${found.revealedName ?? "the revealed card"} into your graveyard? (Otherwise it stays on top of your library.)`,
              effect: { kind: "explore", target: spec.target, toGraveyard: found.revealed! },
            },
            done,
          ],
        },
        ctx,
      );
      return;
    }
    case "remove-counter": {
      const target = resolveEffectTarget(spec.target, ctx);
      if (target !== undefined) ctx.removeCounter(target, spec.counter, spec.amount === "all" ? "all" : amountValue(spec.amount, ctx));
      return;
    }
    case "remove-counter-all":
      ctx.removeCounterAll(spec.filter, spec.counter, spec.amount === "all" ? "all" : amountValue(spec.amount, ctx));
      return;
    case "remove-counters": {
      if (spec.playerProgress !== undefined) {
        applyPlayerCounterRemoval(spec, spec.playerProgress, ctx);
        return;
      }
      const target = spec.target === undefined ? undefined : resolveEffectTarget(spec.target, ctx);
      if (spec.target !== undefined && (target === undefined || illegalSlot(spec.target, ctx))) return;
      if (target?.kind === "player") {
        // A player's own counters (rule 122.1), of the kinds it allows.
        const has = ctx.playerCounterKinds(target.player);
        const allowed = spec.counter === "any" ? null : [spec.counter, ...(spec.orKinds ?? [])];
        const kinds = Object.entries(has)
          .filter(([kind, n]) => n > 0 && (allowed === null || allowed.includes(kind)))
          .map(([kind, n]) => ({ kind, n }));
        const total = kinds.reduce((sum, k) => sum + k.n, 0);
        const count = spec.count === "any" ? null : Math.max(0, amountValue(spec.count, ctx));
        // Fewer there than it says: as many as there are (rule 609.3).
        const least = spec.upTo === true || count === null ? 0 : Math.min(count, total);
        applyPlayerCounterRemoval(
          spec,
          { player: target.player, left: count === null ? null : Math.min(count, total), least, kinds, chosen: {} },
          ctx,
        );
        return;
      }
      ctx.removeChosenCounters(
        {
          ...(spec.from !== undefined ? { from: spec.from } : {}),
          ...(spec.anyController === true ? { anyController: true } : {}),
          ...(target !== undefined ? { target } : {}),
          counter: spec.counter,
          ...(spec.orKinds !== undefined ? { orKinds: spec.orKinds } : {}),
          among: spec.among === true,
          ...(spec.perObject !== undefined ? { perObject: spec.perObject } : {}),
          upTo: spec.upTo === true,
        },
        spec.count === "any" ? null : amountValue(spec.count, ctx),
      );
      return;
    }
    case "move-counters":
      applyMoveCounters(spec, ctx);
      return;
    case "put-counters-of": {
      const target = resolveEffectTarget(spec.target, ctx);
      const of = resolveAmountRef(spec.of, ctx);
      if (target === undefined || of === undefined) return;
      // The same number of each kind it had (rule 122.8), each put as any
      // counter is — a -1/-1 among them too.
      for (const [kind, n] of Object.entries(ctx.counterKindsOf(of))) {
        if (n > 0) ctx.addCounter(target, kind, n);
      }
      return;
    }
    case "add-counter": {
      const target = resolveEffectTarget(spec.target, ctx);
      if (target === undefined) return;
      // "That player puts a counter on it": no such player, no counter.
      const by = spec.by === undefined ? undefined : effectPlayer(spec.by, ctx);
      if (spec.by !== undefined && by === undefined) return;
      ctx.addCounter(target, spec.counter, amountValue(spec.amount, ctx), by, spec.training === true);
      return;
    }
    case "time-travel":
      ctx.timeTravel?.();
      return;
    case "give-suspend": {
      const counters = spec.timeCounters === "mana-value" ? "mana-value" : amountValue(spec.timeCounters, ctx);
      const options = {
        ...(spec.filter !== undefined ? { filter: spec.filter } : {}),
        ...(spec.onlyWithSuspend === true ? { onlyWithSuspend: true as const } : {}),
      };
      if (spec.target === undefined) {
        ctx.giveSuspend?.(counters, options);
        return;
      }
      const target = resolveEffectTarget(spec.target, ctx);
      if (target !== undefined) ctx.giveSuspend?.(counters, { ...options, target });
      return;
    }
    case "proliferate":
      ctx.proliferate(spec.then ?? null);
      return;
    case "grant-keyword": {
      const target = resolveEffectTarget(spec.target, ctx);
      if (target !== undefined) {
        ctx.grantKeyword(target, spec.keyword, spec.duration);
      }
      return;
    }
    case "player-effect": {
      const attackersOf = spec.cantAttackBy === undefined ? undefined : effectPlayer(spec.cantAttackBy, ctx);
      if (spec.cantAttackBy !== undefined && attackersOf === undefined) return;
      ctx.addPlayerEffect({
        owner: ctx.controller,
        expires:
          spec.duration === "end-of-turn"
            ? { kind: "end-of-turn" }
            : spec.duration === "this-combat"
              ? { kind: "end-of-combat" }
            : spec.duration === "until-end-of-your-next-turn"
              ? { kind: "end-of-your-next-turn" }
              : spec.duration === "rest-of-game"
                ? { kind: "rest-of-game" }
                : { kind: "your-next-turn" },
        ...(spec.noMaxHandSize !== undefined ? { noMaxHandSize: ctx.playersInScope(spec.noMaxHandSize) } : {}),
        ...(spec.reduceSpells !== undefined
          ? {
              reduceSpells: {
                applies: spec.reduceSpells.applies,
                reduceGeneric: amountValue(spec.reduceSpells.reduceGeneric, ctx),
                ...(spec.reduceSpells.allCasters === true ? { allCasters: true as const } : {}),
              },
            }
          : {}),
        ...(spec.castFromHandFree !== undefined ? { castFromHandFree: spec.castFromHandFree } : {}),
        ...(spec.castsLeft !== undefined
          ? {
              castCaps: ctx.playersInScope(spec.castsLeft.who ?? "you").map((player) => ({
                player,
                total: ctx.spellsCastThisTurn(player) + (spec.castsLeft?.count ?? 0),
              })),
            }
          : {}),
        ...(spec.castAsThoughFlash !== undefined ? { castAsThoughFlash: spec.castAsThoughFlash } : {}),
        ...(spec.castFromGraveyard !== undefined
          ? (() => {
              const grant = spec.castFromGraveyard;
              return {
                castFromGraveyard: {
                  filter: grant.filter,
                  source: ctx.source,
                  ...(grant.whose !== undefined ? { graveyards: ctx.playersInScope(grant.whose) } : {}),
                  ...(grant.once === true ? { once: true as const } : {}),
                  ...(grant.spendAs !== undefined ? { spendAs: grant.spendAs } : {}),
                  ...(grant.exileAfterwards === true ? { exileAfterwards: true as const } : {}),
                },
              };
            })()
          : {}),
        ...(spec.playFromHandOf !== undefined && ctx.targets[spec.playFromHandOf]?.kind === "player"
          ? { playFromHandsOf: [(ctx.targets[spec.playFromHandOf] as { readonly player: PlayerId }).player] }
          : {}),
        ...(spec.handRevealed !== undefined && ctx.targets[spec.handRevealed]?.kind === "player"
          ? { handsRevealed: [(ctx.targets[spec.handRevealed] as { readonly player: PlayerId }).player] }
          : {}),
        ...(spec.damageTo !== undefined
          ? {
              damageTo: {
                players: ctx.playersInScope(spec.damageTo.who),
                multiplier: spec.damageTo.multiplier,
                ...(spec.damageTo.permanentsToo === true ? { permanentsToo: true } : {}),
              },
            }
          : {}),
        ...(spec.damageReplacement !== undefined
          ? {
              damageReplacement: {
                ...(spec.damageReplacement.plus !== undefined
                  ? { plus: Math.max(0, amountValue(spec.damageReplacement.plus, ctx)) }
                  : {}),
                ...(spec.damageReplacement.setTo !== undefined ? { setTo: spec.damageReplacement.setTo } : {}),
                ...(spec.damageReplacement.source !== undefined ? { source: spec.damageReplacement.source } : {}),
                ...(spec.damageReplacement.combat !== undefined ? { combat: spec.damageReplacement.combat } : {}),
                ...(spec.damageReplacement.to !== undefined ? { to: spec.damageReplacement.to } : {}),
              },
            }
          : {}),
        ...(spec.cantLoseGame !== undefined ? { cantLoseGame: ctx.playersInScope(spec.cantLoseGame) } : {}),
        ...(spec.cantWinGame !== undefined ? { cantWinGame: ctx.playersInScope(spec.cantWinGame) } : {}),
        ...(spec.cantLoseLife !== undefined ? { cantLoseLife: ctx.playersInScope(spec.cantLoseLife) } : {}),
        ...(spec.castOnlyFromHand !== undefined
          ? { castOnlyFromHand: ctx.playersInScope(spec.castOnlyFromHand) }
          : {}),
        ...(spec.cantCast !== undefined
          ? {
              cantCast: {
                players: cantCastPlayers(spec.cantCast.who, ctx),
                filter: spec.cantCast.filter,
                label: spec.cantCast.label,
                ...(spec.cantCast.lands === true ? { lands: true as const } : {}),
                ...(spec.cantCast.from !== undefined ? { from: spec.cantCast.from } : {}),
              },
            }
          : {}),
        ...(spec.damageLifeFloor !== undefined
          ? {
              damageLifeFloor: {
                players: ctx.playersInScope(spec.damageLifeFloor.who),
                floor: spec.damageLifeFloor.floor,
              },
            }
          : {}),
        ...(spec.tokenMultiplier !== undefined ? { tokenMultiplier: spec.tokenMultiplier } : {}),
        ...(spec.lifeCantChange !== undefined ? { lifeCantChange: ctx.playersInScope(spec.lifeCantChange) } : {}),
        ...(spec.protectionFromEverything !== undefined
          ? { protectionFromEverything: ctx.playersInScope(spec.protectionFromEverything) }
          : {}),
        ...(spec.protectionFromPlayers !== undefined
          ? {
              protectionFromPlayers: {
                who: ctx.playersInScope(spec.protectionFromPlayers.who),
                from: ctx.playersInScope(spec.protectionFromPlayers.from),
              },
            }
          : {}),
        ...(spec.attackTax !== undefined
          ? {
              attackTax: {
                generic: spec.attackTax.generic === undefined ? 0 : amountValue(spec.attackTax.generic, ctx),
                life: spec.attackTax.life === undefined ? 0 : amountValue(spec.attackTax.life, ctx),
                covers: spec.attackTax.covers ?? "you",
              },
            }
          : {}),
        ...(spec.blockTax !== undefined
          ? {
              blockTax: {
                generic: spec.blockTax.generic === undefined ? 0 : amountValue(spec.blockTax.generic, ctx),
                life: spec.blockTax.life === undefined ? 0 : amountValue(spec.blockTax.life, ctx),
              },
            }
          : {}),
        ...(spec.cantAttack !== undefined ? { cantAttack: spec.cantAttack } : {}),
        ...(attackersOf !== undefined ? { cantAttackBy: attackersOf } : {}),
      });
      return;
    }
    case "win-game":
      ctx.winGame(ctx.controller);
      return;
    case "lose-game": {
      if (spec.target !== undefined) {
        const target = ctx.targets[spec.target];
        if (target?.kind === "player") ctx.loseGame([target.player]);
        return;
      }
      ctx.loseGame(ctx.playersInScope(spec.who ?? "you"));
      return;
    }
    case "roll-dice": {
      const count = spec.count === undefined ? 1 : Math.max(0, Math.floor(amountValue(spec.count, ctx)));
      if (count === 0) return;
      const modifier = spec.modifier === undefined ? 0 : amountValue(spec.modifier, ctx);
      const total = ctx.rollDice(spec.sides, count, modifier);
      const row = spec.table?.find((r) => total >= r.min && (r.max === undefined || total <= r.max));
      const steps = [row?.effect, spec.then].filter((s): s is EffectSpec => s !== undefined);
      if (steps.length > 0) applyEffectSpec(steps.length === 1 ? steps[0] : { kind: "sequence", effects: steps }, ctx);
      return;
    }
    case "flip-coin": {
      // One flip, or flips until one is lost — each flip's branch applied as
      // it lands, since what a win does can matter to the next.
      for (let i = 0; i < MAX_FLIPS; i += 1) {
        const won = ctx.flipCoin();
        const branch = won ? spec.won : spec.lost;
        if (branch !== undefined) applyEffectSpec(branch, ctx);
        if (!won || spec.untilLose !== true) return;
      }
      return;
    }
    case "clash":
      applyClash(spec, ctx);
      return;
    case "repeat":
      applyRepeat(spec, ctx);
      return;
    case "prohibit": {
      if (spec.regeneration === true && spec.dealtDamageThisWay !== undefined) {
        ctx.prohibitRegeneration("dealt-damage-this-way");
        return;
      }
      if (spec.target !== undefined) {
        const target = resolveEffectTarget(spec.target, ctx);
        if (target === undefined) return;
        if (spec.regeneration === true) ctx.prohibitRegeneration(target);
        // Abilities: named, or the default when nothing else is.
        if (spec.abilities === true || spec.regeneration !== true) {
          ctx.prohibit([], target, false, true, spec.duration === "until-your-next-turn");
        }
        return;
      }
      const slot = typeof spec.who === "number" ? ctx.targets[spec.who] : undefined;
      const players =
        spec.who === undefined
          ? [ctx.controller]
          : typeof spec.who === "number"
            ? slot?.kind === "player"
              ? [slot.player]
              : []
            : ctx.playersInScope(spec.who);
      if (spec.monarch === true) ctx.prohibitMonarch(players);
      if (spec.lands === true) ctx.prohibitLandPlays(players);
      if ((spec.monarch === true || spec.lands === true) && spec.spells === undefined && spec.abilities === undefined) {
        return;
      }
      ctx.prohibit(
        players,
        undefined,
        typeof spec.spells === "object" ? { ...spec.spells, you: ctx.controller } : spec.spells === true,
        spec.abilities === true,
      );
      return;
    }
    case "restrict": {
      if (spec.filter !== undefined) {
        const scopeTo = scopedController(spec.controlledByTarget, ctx);
        if (spec.controlledByTarget !== undefined && scopeTo === undefined) return;
        const spared = spec.exceptTarget === undefined ? undefined : ctx.targets[spec.exceptTarget];
        ctx.restrict(undefined, spec.filter, spec.restrictions, undefined, spec.cantBeBlockedBy, undefined, {
          ...(scopeTo !== undefined ? { scopeTo } : {}),
          ...(spared?.kind === "object" ? { except: spared.object } : {}),
          ...(spec.asItResolves === true ? { asItResolves: true } : {}),
        });
        return;
      }
      const target = spec.target === undefined ? undefined : resolveEffectTarget(spec.target, ctx);
      const cantBlock = spec.cantBlockAttacker === undefined ? undefined : resolveEffectTarget(spec.cantBlockAttacker, ctx);
      if (target !== undefined) {
        ctx.restrict(target, undefined, spec.restrictions, spec.duration, spec.cantBeBlockedBy, cantBlock);
      }
      return;
    }
    case "grant-static": {
      if (spec.filter !== undefined) {
        ctx.grantStatic(undefined, spec.filter, spec.ability, spec.duration);
        return;
      }
      const target = spec.target === undefined ? undefined : resolveEffectTarget(spec.target, ctx);
      if (target !== undefined) ctx.grantStatic(target, undefined, spec.ability, spec.duration);
      return;
    }
    case "detain": {
      const target = resolveEffectTarget(spec.target, ctx);
      if (target !== undefined) ctx.detain(target);
      return;
    }
    case "block-if-able": {
      const target = resolveEffectTarget(spec.target, ctx);
      if (target === undefined || illegalSlot(spec.target, ctx)) return;
      let attacker: TargetRef | undefined;
      if (spec.attacker !== undefined) {
        attacker = resolveEffectTarget(spec.attacker, ctx);
        // The creature to block is gone (or no longer a legal target): no
        // requirement is left to impose.
        if (attacker === undefined || illegalSlot(spec.attacker, ctx)) return;
      }
      ctx.blockIfAble(target, attacker, spec.thisCombat === true);
      return;
    }
    case "attack-despite-defender": {
      if (spec.filter !== undefined) {
        ctx.attackDespiteDefender(undefined, spec.filter);
        return;
      }
      const target = spec.target === undefined ? undefined : resolveEffectTarget(spec.target, ctx);
      if (target !== undefined) ctx.attackDespiteDefender(target, undefined);
      return;
    }
    case "damage-by-toughness": {
      const target = resolveEffectTarget(spec.target, ctx);
      if (target !== undefined) ctx.damageByToughness(target);
      return;
    }
    case "assigns-no-combat-damage": {
      const target = resolveEffectTarget(spec.target, ctx);
      if (target !== undefined) ctx.assignsNoCombatDamage(target);
      return;
    }
    case "assign-as-though-unblocked": {
      const must = spec.optional !== true;
      if (spec.filter !== undefined) {
        ctx.assignAsThoughUnblocked(undefined, spec.filter, must);
        return;
      }
      const target = spec.target === undefined ? undefined : resolveEffectTarget(spec.target, ctx);
      if (target !== undefined) ctx.assignAsThoughUnblocked(target, undefined, must);
      return;
    }
    case "attack-random-opponent": {
      const target = resolveEffectTarget(spec.target, ctx);
      if (target?.kind !== "object") return;
      const chosen = ctx.attackRandomOpponent(target.object, spec.notAttackedLastCombat === true);
      if (!chosen && spec.else !== undefined) applyEffectSpec(spec.else, ctx);
      return;
    }
    case "put-in-command-zone": {
      const target = resolveEffectTarget(spec.target, ctx);
      if (target !== undefined) ctx.putInCommandZone(target);
      return;
    }
    case "exchange-life-stat": {
      const target = resolveEffectTarget(spec.target, ctx);
      const player = effectPlayer(spec.player ?? "you", ctx);
      if (target !== undefined && player !== undefined) ctx.exchangeLifeStat(target, player, spec.stat);
      return;
    }
    case "exchange-life-totals": {
      const first = effectPlayer(spec.first ?? "you", ctx);
      const second = effectPlayer(spec.second, ctx);
      if (first !== undefined && second !== undefined) ctx.exchangeLifeTotals(first, second);
      return;
    }
    case "grant-triggered": {
      const target = resolveEffectTarget(spec.target, ctx);
      if (target !== undefined) ctx.grantTriggered(target, spec.ability, spec.duration);
      return;
    }
    case "grant-triggered-all":
      ctx.grantTriggeredAll(spec.filter, spec.ability, spec.duration);
      return;
    case "grant-activated": {
      const target = resolveEffectTarget(spec.target, ctx);
      if (target !== undefined) ctx.grantActivated(target, spec.ability, spec.duration);
      return;
    }
    case "grant-activated-all":
      ctx.grantActivatedAll(spec.filter, spec.ability, spec.duration);
      return;
    case "lose-abilities-all":
      ctx.loseAbilitiesAll(spec.filter, spec.duration);
      return;
    case "lose-abilities": {
      const target = resolveEffectTarget(spec.target, ctx);
      if (target !== undefined) {
        ctx.loseAbilities(target, {
          loseLandTypes: spec.loseLandTypes === true,
          activated: spec.activated ?? [],
          duration: spec.duration,
        });
      }
      return;
    }
    case "gift":
      ctx.giveGift(spec.gift);
      return;
    case "take-extra-turn": {
      const target = spec.target === undefined ? undefined : ctx.targets[spec.target];
      if (spec.target !== undefined && target?.kind !== "player") return;
      ctx.takeExtraTurn(target?.kind === "player" ? target.player : ctx.controller, spec.skipUntapStep === true, spec.thatTurn);
      return;
    }
    case "skip-turn": {
      for (const target of scopedOrTargetedPlayers(spec.who ?? "you", ctx)) {
        if (target.kind === "player") ctx.skipTurn(target.player, amountValue(spec.count ?? 1, ctx, target.player));
      }
      return;
    }
    case "control-player": {
      const controlled = ctx.targets[spec.target];
      if (controlled?.kind !== "player" || illegalSlot(spec.target, ctx)) return;
      let controller = ctx.controller;
      if (spec.controller !== undefined) {
        const slot = ctx.targets[spec.controller];
        // An illegal first target of Cruel Entertainment: nobody to control them.
        if (slot?.kind !== "player" || illegalSlot(spec.controller, ctx)) return;
        controller = slot.player;
      }
      ctx.controlPlayer(controlled.player, controller, spec.during ?? "next-turn", spec.extraTurnAfter === true);
      return;
    }
    case "choose-combat": {
      ctx.chooseCombat({
        ...(spec.attackers === true ? { attackers: true } : {}),
        ...(spec.blocks !== undefined ? { blocks: spec.blocks } : {}),
        ...(spec.blockIfAble === true ? { blockIfAble: true } : {}),
      });
      return;
    }
    case "storm": {
      const spell = spec.of === "trigger-object" ? ctx.triggerObject : ctx.source;
      if (spell !== undefined) ctx.storm(spell);
      return;
    }
    case "cascade": {
      if (spec.offer !== undefined) {
        // "You may cast it without paying its mana cost if the resulting
        // spell's mana value is less than this spell's" (rule 702.85a): the
        // whole cast, chosen as any cast is (601.2b–c), or declined.
        ctx.castNow([spec.offer.hit], {
          free: true,
          exileAfter: false,
          spell: { manaValue: { op: "lt", n: spec.offer.threshold } },
          freeCastOf: "cascade",
        });
        return;
      }
      if (spec.finish !== undefined) {
        ctx.finishCascade(spec.finish);
        return;
      }
      const found = ctx.cascade(ctx.controller, ctx.source);
      if (found === null) return;
      applyEffectSpec(
        {
          kind: "sequence",
          effects: [
            { kind: "cascade", offer: { hit: found.hit, threshold: found.threshold } },
            { kind: "cascade", finish: { hit: found.hit, exiled: found.exiled, cast: false } },
          ],
        },
        ctx,
      );
      return;
    }
    case "craft-return": {
      // An "as this enters" choice first (rule 614.12): nothing moved yet,
      // so it runs again once that's answered.
      const parked = ctx.parkedCount();
      if (ctx.craftReturn()) ctx.resumeAfterDecisions(spec, parked);
      return;
    }
    case "discover": {
      if (spec.offer !== undefined) {
        // "If the resulting spell's mana value is less than or equal to N."
        ctx.castNow([spec.offer.hit], {
          free: true,
          exileAfter: false,
          spell: { manaValue: { op: "lte", n: spec.offer.amount } },
        });
        return;
      }
      if (spec.finish !== undefined) {
        ctx.finishDiscover(spec.finish);
        return;
      }
      const found = ctx.discover(Math.max(0, amountValue(spec.amount, ctx)));
      if (found.hit === null) {
        ctx.finishDiscover(found);
        return;
      }
      applyEffectSpec(
        {
          kind: "sequence",
          effects: [
            { kind: "discover", amount: found.amount, offer: { hit: found.hit, amount: found.amount } },
            { kind: "discover", amount: found.amount, finish: found },
          ],
        },
        ctx,
      );
      return;
    }
    case "reveal-until":
      applyRevealUntil(spec, ctx);
      return;
    case "exile-spell-as-it-resolves":
      if (spec.applyFirst !== undefined) ctx.finishExiledAsItResolves(spec.applyFirst.spell, spec.applyFirst.feather);
      else ctx.exileTriggerSpellAsItResolves(spec.returnAtNextEndStep === true, spec.plotted === true);
      return;
    case "copy-spell": {
      const newTargets = spec.newTargets === true;
      // "That player copies the spell" (demonstrate): nobody, once they've gone.
      const copier = spec.controller === undefined ? undefined : effectPlayer(spec.controller, ctx);
      if (spec.controller !== undefined && copier === undefined) {
        if (spec.otherwise !== undefined) applyEffectSpec(spec.otherwise, ctx);
        return;
      }
      // "Copy it for each …": the count, read as this applies.
      const times =
        spec.count === undefined ? 1 : Math.min(Math.max(0, amountValue(spec.count, ctx)), MAX_COPY_COUNT);
      // "Except …" and "the copy gains …".
      const change: SpellCopyChange | undefined =
        spec.except !== undefined || spec.gains !== undefined
          ? {
              ...(spec.except !== undefined ? { except: spec.except } : {}),
              ...(spec.gains !== undefined ? { gains: spec.gains } : {}),
            }
          : undefined;
      let copied = false;
      if (spec.target === "trigger-spell" || spec.spell !== undefined) {
        const spell = spec.spell?.snapshot ?? ctx.triggerSpell();
        if (spell !== null && (spec.ifTargets === undefined || targetsPermanentOrPlayer(spell))) {
          if (spec.forEachItCouldTarget !== undefined) {
            ctx.copyTriggerSpellForEach(spell, spec.forEachItCouldTarget, copier ?? ctx.controller);
            copied = true;
          } else {
            const retargetTo = spec.retargetTo === undefined ? undefined : resolveEffectTarget(spec.retargetTo, ctx);
            // A slot whose target has gone, or a source that has left, has
            // nothing to aim the copy at.
            if (spec.retargetTo === undefined || retargetTo !== undefined) {
              for (let i = 0; i < times; i += 1) {
                const made = ctx.copyTriggerSpell(spell, {
                  newTargets,
                  ...(copier !== undefined ? { controller: copier } : {}),
                  ...(retargetTo !== undefined ? { retargetTo } : {}),
                  ...(spec.spell !== undefined ? { original: spec.spell.original } : {}),
                  ...(spec.spell?.caster !== undefined ? { caster: spec.spell.caster } : {}),
                  ...(spec.spell?.payEach !== undefined ? { payEach: spec.spell.payEach } : {}),
                  ...(change !== undefined ? { change } : {}),
                });
                copied = copied || made;
              }
            }
          }
        }
      } else {
        // "Copy this spell" — the spell now resolving, still on the stack.
        const target =
          spec.target === "source" ? ({ kind: "object", object: ctx.source } as const) : ctx.targets[spec.target];
        if (target !== undefined) {
          for (let i = 0; i < times; i += 1) ctx.copySpell(target, newTargets, copier, change);
          copied = times > 0;
        }
      }
      if (!copied && spec.otherwise !== undefined) applyEffectSpec(spec.otherwise, ctx);
      return;
    }
    case "change-targets": {
      const target = ctx.targets[spec.target];
      if (target !== undefined) ctx.changeTargets(target, spec.how, spec.to === "source", spec.optional === true);
      return;
    }
    case "copy-ability": {
      if (spec.target === "trigger-ability") {
        ctx.copyAbility("trigger-ability", spec.newTargets === true);
        return;
      }
      const target = ctx.targets[spec.target];
      if (target !== undefined) ctx.copyAbility(target, spec.newTargets === true);
      return;
    }
    case "additional-combat":
      ctx.additionalCombat(
        spec.afterThisPhase === true ? { withMain: spec.withMain === true } : undefined,
      );
      return;
    case "end-the-turn":
      ctx.endTurnOrCombat("turn");
      return;
    case "end-the-combat-phase":
      ctx.endTurnOrCombat("combat");
      return;
    case "limit-blockers":
      ctx.limitBlockers(ctx.playersInScope(spec.who), spec.most);
      return;
    case "additional-upkeep-steps":
      ctx.additionalUpkeeps(amountValue(spec.amount, ctx));
      return;
    case "additional-land-drop":
      ctx.additionalLandDrops(spec.amount);
      return;
    case "shuffle-library": {
      if (spec.target === undefined) {
        ctx.shuffleLibrary();
        return;
      }
      const whose = ctx.targets[spec.target];
      if (whose?.kind === "player") ctx.shuffleLibrary(whose.player);
      return;
    }
    case "damage-divided":
      ctx.division.forEach((amount, i) => {
        const target = ctx.targets[spec.from + i];
        if (target !== undefined && amount > 0) ctx.dealDamage(target, amount);
      });
      return;
    case "counters-divided":
      ctx.division.forEach((amount, i) => {
        const target = ctx.targets[spec.from + i];
        if (target !== undefined && amount > 0) ctx.addCounter(target, spec.counter, amount);
      });
      return;
    case "counters-distributed":
      distributeCounters(spec, ctx);
      return;
    case "untap-all":
      if (spec.who !== undefined) {
        for (const player of ctx.playersInScope(spec.who)) ctx.untapAll(spec.filter, player, spec.exceptSource === true);
        return;
      }
      ctx.untapAll(spec.filter, scopedController(spec.controlledByTarget, ctx), spec.exceptSource === true);
      return;
    case "exert": {
      const target = resolveEffectTarget(spec.target, ctx);
      if (target !== undefined) ctx.exert(target, spec.asItAttacks === true);
      return;
    }
    case "tap-all": {
      const scopeTo = scopedController(spec.controlledByTarget, ctx);
      if (spec.controlledByTarget !== undefined && scopeTo === undefined) return;
      ctx.tapAll(
        spec.filter,
        spec.doesntUntapNext === true,
        spec.onlyDoesntUntap === true,
        scopeTo,
        spec.untapStepOfTarget === true,
        spec.doesntUntapSteps,
      );
      return;
    }
    case "phase-out": {
      const until = {
        ...(spec.untilSourceLeaves === true ? { untilSourceLeaves: true } : {}),
        ...(spec.tappedOnReturn === true ? { tappedOnReturn: true } : {}),
      };
      if (spec.filter !== undefined) {
        // "Each creature target player controls": nobody's, once that
        // target is gone (rule 608.2b).
        const scopeTo = scopedController(spec.controlledByTarget, ctx);
        if (spec.controlledByTarget !== undefined && scopeTo === undefined) return;
        ctx.phaseOut({ filter: spec.filter, ...(scopeTo !== undefined ? { scopeTo } : {}), ...until });
        return;
      }
      if (spec.attachedToSource === true) {
        if (ctx.sourceLost !== true) ctx.phaseOut({ attachedToSource: true, ...until });
        return;
      }
      const target = spec.target === undefined ? undefined : resolveEffectTarget(spec.target, ctx);
      if (target !== undefined) ctx.phaseOut({ target, ...until });
      return;
    }
    case "animate": {
      const target = resolveEffectTarget(spec.target, ctx);
      if (target !== undefined) {
        ctx.animate(target, {
          ...(spec.power !== undefined ? { power: amountValue(spec.power, ctx) } : {}),
          ...(spec.toughness !== undefined ? { toughness: amountValue(spec.toughness, ctx) } : {}),
          addTypes: spec.addTypes,
          setTypes: spec.setTypes,
          addSubtypes: spec.addSubtypes,
          setSubtypes: spec.setSubtypes,
          setColors: spec.setColors,
          ...(spec.addColors !== undefined ? { addColors: spec.addColors } : {}),
          loseAbilities: spec.loseAbilities,
          keywords: spec.keywords ?? [],
          duration: spec.duration,
        });
      }
      return;
    }
    case "add-types": {
      const target = resolveEffectTarget(spec.target, ctx);
      if (target !== undefined) {
        ctx.addTypes(target, spec.addTypes ?? [], spec.addSubtypes ?? [], spec.duration, {
          ...(spec.setTypes !== undefined ? { setTypes: spec.setTypes } : {}),
          ...(spec.removeTypes !== undefined ? { removeTypes: spec.removeTypes } : {}),
          ...(spec.removeSubtypes !== undefined ? { removeSubtypes: spec.removeSubtypes } : {}),
          ...(spec.setSubtypes !== undefined ? { setSubtypes: spec.setSubtypes } : {}),
          ...(spec.addColors !== undefined ? { addColors: spec.addColors } : {}),
        });
      }
      return;
    }
    case "animate-all": {
      const scopeTo = scopedController(spec.controlledByTarget, ctx);
      if (spec.controlledByTarget !== undefined && scopeTo === undefined) return;
      ctx.animateAll(spec.filter, {
        power: amountValue(spec.power, ctx),
        toughness: amountValue(spec.toughness, ctx),
        addTypes: spec.addTypes ?? [],
        addSubtypes: spec.addSubtypes ?? [],
        keywords: spec.keywords ?? [],
        duration: spec.duration,
        ...(spec.exceptSource === true ? { exceptSource: true } : {}),
        ...(scopeTo !== undefined ? { scopeTo } : {}),
      });
      return;
    }
    case "create-token":
      // A per-player count ("its controller creates a token for each
      // creature destroyed this way") — or per-player counters on it
      // (Oversimplify) — is read for each player the scope names, each
      // creating their own.
      if (
        spec.who !== undefined &&
        spec.who !== "target-controller" &&
        (readsEachPlayer(spec.count) || (spec.thenCounters !== undefined && readsEachPlayer(spec.thenCounters.amount)))
      ) {
        for (const player of ctx.playersInScope(spec.who)) {
          ctx
            .aboutPlayer(player)
            .createToken(
              spec.token,
              amountValue(spec.count, ctx, player) * ctx.stackMultiplier,
              "that-player",
              spec.tapped === true,
              spec.sacrificeAtEndStep === true,
              spec.gainUntilEndOfTurn,
              spec.goadedForGame === true,
              spec.thenCounters === undefined
                ? undefined
                : { kind: spec.thenCounters.kind, amount: amountValue(spec.thenCounters.amount, ctx, player) },
              spec.basePt === undefined
                ? undefined
                : [amountValue(spec.basePt.power, ctx, player), amountValue(spec.basePt.toughness, ctx, player)],
              resolveEnterAttacking(spec.attacking, ctx.aboutPlayer(player)),
              spec.separate === true,
              spec.exileAtEndStep === true,
              spec.attacksThisCombat === true,
              spec.gainKeywords,
            );
        }
        return;
      }
      ctx.createToken(
        spec.token,
        amountValue(spec.count, ctx) * ctx.stackMultiplier,
        spec.who,
        spec.tapped === true,
        spec.sacrificeAtEndStep === true,
        spec.gainUntilEndOfTurn,
        spec.goadedForGame === true,
        spec.thenCounters === undefined
          ? undefined
          : { kind: spec.thenCounters.kind, amount: amountValue(spec.thenCounters.amount, ctx) },
        spec.basePt === undefined
          ? undefined
          : [amountValue(spec.basePt.power, ctx), amountValue(spec.basePt.toughness, ctx)],
        resolveEnterAttacking(spec.attacking, ctx),
        spec.separate === true,
        spec.exileAtEndStep === true,
        spec.attacksThisCombat === true,
        spec.gainKeywords,
        // Attached to a target found illegal as this resolves (rule 608.2b),
        // or to nothing there, none is created.
        spec.attachedTo === undefined
          ? undefined
          : illegalSlot(spec.attachedTo, ctx)
            ? null
            : ((host) => (host?.kind === "object" ? host.object : null))(resolveEffectTarget(spec.attachedTo, ctx)),
      );
      return;
    case "vote":
      applyVote(spec, ctx);
      return;
    case "cast-vote": {
      // A creature type is substituted in as it's chosen; unsubstituted,
      // nothing was.
      if (spec.choice === "creature-type") return;
      if (spec.choice === "number") {
        ctx.castVote(spec.voter, { number: ctx.x });
        return;
      }
      if (spec.choice !== "target") {
        ctx.castVote(spec.voter, spec.choice);
        return;
      }
      const ref = ctx.targets[0];
      if (ref?.kind === "object") ctx.castVote(spec.voter, { permanent: ref.object });
      return;
    }
    case "for-each-vote": {
      // A voter who has left the game since does nothing (rule 800.4a).
      const inGame = ctx.playersInScope("each-player");
      // In turn order from the active player (rule 101.4), each voter's votes
      // together — Elrond of the White Council's ruling.
      const counted = ctx
        .votes()
        .filter((v) => spec.option === undefined || ("option" in v.choice && v.choice.option === spec.option));
      const voters = inGame.flatMap((player) => counted.filter((v) => v.voter === player).map(() => player));
      if (readsChosenThisWay(spec.effect)) {
        // "…cards of that type": each voter's step with their own choice.
        const steps = inGame.flatMap((player) =>
          counted
            .filter((v) => v.voter === player)
            .map(
              (v): EffectSpec => ({
                kind: "for-each-player",
                who: "each-player",
                effect: substituteChosenThisWay(spec.effect, [voteChoiceText(v.choice)]),
                remaining: [player],
              }),
            ),
        );
        if (steps.length > 0) applyEffectSpec({ kind: "sequence", effects: steps }, ctx);
        return;
      }
      applyEffectSpec({ kind: "for-each-player", who: "each-player", effect: spec.effect, remaining: voters }, ctx);
      return;
    }
    case "with-choices": {
      // Every option chosen once, in the order first chosen.
      const chosen: string[] = [];
      for (const vote of ctx.votes()) {
        const text = voteChoiceText(vote.choice);
        if (!chosen.includes(text)) chosen.push(text);
      }
      applyEffectSpec(substituteChosenThisWay(spec.effect, chosen), ctx);
      return;
    }
    case "for-each-voted":
      applyForEachVoted(spec, ctx);
      return;
    case "for-each-player": {
      // Player by player, as a `sequence`'s steps: one whose effect stops to
      // ask something is answered before the next player's happens, the rest
      // parked with the players fixed as they were when this began.
      const scope =
        spec.remaining ??
        spec.found ??
        (spec.who === "owners-of-exiled-with-source"
          ? ((owners) => ctx.playersInScope("each-player").filter((p) => owners.has(p)))(
              new Set(ctx.cardsExiledWithSource().map((id) => ctx.ownerOf({ kind: "object", object: id }))),
            )
          : typeof spec.who === "object"
            ? ((player) => (player === undefined ? [] : [player]))(effectPlayer(spec.who, ctx))
            : ctx.playersInScope(spec.who));
      // "Each player who …": fixed now, before anyone acts (`remaining` was).
      const whoIf = spec.whoIf;
      const players =
        spec.remaining !== undefined || spec.found !== undefined || whoIf === undefined
          ? scope
          : scope.filter((p) => ctx.aboutPlayer(p).conditionMet(whoIf));
      // "Each player who can't": found already, and the instruction done first.
      if (spec.before !== undefined) {
        const { before, ...rest } = spec;
        applyEffectSpec({ kind: "sequence", effects: [before, { ...rest, found: players }] }, ctx);
        return;
      }
      if (spec.simultaneous === true) {
        ctx.simultaneously(() => {
          for (const player of players) applyEffectSpec(spec.effect, ctx.aboutPlayer(player));
        });
        return;
      }
      const pendingBefore = ctx.decisionPending();
      // "Each opponent chooses …": held until the last has (rule 101.4).
      const holds = spec.choicesHeld === true;
      if (holds && spec.remaining === undefined) ctx.holdChoices();
      for (let i = 0; i < players.length; i += 1) {
        const parked = ctx.parkedCount();
        applyEffectSpec(spec.effect, ctx.aboutPlayer(players[i]));
        if (!pendingBefore && ctx.decisionPending()) {
          // After the last player's answer, what's left is the release: an
          // empty round of the same effect.
          if (i + 1 < players.length || holds) {
            ctx.resumeAfterDecisions({ ...spec, remaining: players.slice(i + 1) }, parked);
            return;
          }
        }
      }
      if (holds) ctx.releaseHeldChoices();
      return;
    }
    case "create-token-copy": {
      // Copies of cards are read as the cards they are, and "create a token"
      // is the effect's controller's: nothing on the battlefield to read a
      // controller from.
      const ofCards =
        spec.of === "exiled-with-source" ||
        spec.of === "exiled-as-cost" ||
        spec.of === "exiled-this-way" ||
        (typeof spec.of === "object" && "eachExiled" in spec.of);
      const copy = (of: ObjectId, count: number): void =>
        ctx.createTokenCopy(of, count, {
          gainsHaste: spec.gainsHaste ?? false,
          sacrificeAtEndStep: spec.sacrificeAtEndStep ?? false,
          exileAtEndStep: spec.exileAtEndStep ?? false,
          notLegendary: spec.notLegendary ?? false,
          under: spec.who === "you" || ofCards ? ctx.controller : undefined,
          ...(spec.basePt
            ? { basePt: [ptSetValue(spec.basePt[0], ctx), ptSetValue(spec.basePt[1], ctx)] as const }
            : {}),
          ...(spec.gainUntilEndOfTurn ? { gainUntilEndOfTurn: spec.gainUntilEndOfTurn } : {}),
          ...(spec.gains?.keywords !== undefined ? { gainKeywords: spec.gains.keywords } : {}),
          ...(spec.gains?.triggered !== undefined ? { gainTriggered: spec.gains.triggered } : {}),
          ...(spec.exceptions ? { exceptions: spec.exceptions } : {}),
          ...(spec.asCard === true || ofCards ? { asCard: true } : {}),
          ...(spec.tapped === true ? { tapped: true } : {}),
          ...(spec.attacking !== undefined ? { attacking: resolveEnterAttacking(spec.attacking, ctx) } : {}),
          ...(spec.exileAtEndOfCombat === true ? { exileAtEndOfCombat: true } : {}),
          ...(spec.sacrificeAtEndOfCombat === true ? { sacrificeAtEndOfCombat: true } : {}),
          ...(spec.atYourNextEndStep === true ? { atYourNextEndStep: true } : {}),
        });
      const specCount = amountValue(spec.count, ctx);
      if (spec.of === "entered-together") {
        ctx.oneTokenEvent(() => {
          for (const { object, count } of ctx.enteredTogether ?? []) copy(object, specCount * count);
        });
        return;
      }
      if (typeof spec.of === "object") {
        // Which ones, fixed before the first copy enters (rule 608.2h): a
        // copy made here doesn't count itself.
        const of = spec.of;
        ctx.oneTokenEvent(() => {
          if ("eachExiled" in of) {
            for (const card of ctx.exiledCardsMatching(of.eachExiled)) copy(card, specCount);
          } else {
            for (const { object, count } of ctx.permanentsMatching(of.each)) copy(object, specCount * count);
          }
        });
        return;
      }
      if (ofCards) {
        const cards =
          spec.of === "exiled-with-source"
            ? ctx.cardsExiledWithSource(true)
            : spec.of === "exiled-as-cost"
              ? (ctx.exiledAsCost ?? [])
              : ctx.cardsExiledThisWay();
        if (spec.chooseOne === true && cards.length > 1) {
          // "A card exiled with this": which is chosen now, and the copy is
          // of that one wherever `then` finds it (it doesn't move).
          const { chooseOne: _chosen, ...rest } = spec;
          ctx.lookAndChoose({ exiled: cards }, undefined, 1, 1, "stay", "stay", undefined, false, {
            ...rest,
            of: 0,
            asCard: true,
            who: "you",
          });
          return;
        }
        ctx.oneTokenEvent(() => {
          for (const card of spec.chooseOne === true ? cards.slice(0, 1) : cards) {
            copy(card, specCount * ctx.stackMultiplier);
          }
        });
        return;
      }
      let of: ObjectId | undefined;
      if (spec.of === "source") of = ctx.source;
      else if (spec.of === "trigger-object") of = ctx.triggerObject;
      else if (spec.of === "equipped" || spec.of === "enchanted") of = ctx.equippedCreature();
      else {
        const ref = ctx.targets[spec.of];
        of = ref?.kind === "object" ? ref.object : undefined;
      }
      const times = spec.perTimeKicked === true ? ctx.sourceTimesKicked() : 1;
      if (of !== undefined) copy(of, specCount * times * ctx.stackMultiplier);
      return;
    }
    case "conditional": {
      const branch = ctx.conditionMet(spec.condition) ? spec.then : spec.else;
      if (branch !== undefined) applyEffectSpec(branch, ctx);
      return;
    }
    case "unattach": {
      const target = resolveEffectTarget(spec.target, ctx);
      if (target !== undefined) ctx.unattach(target);
      return;
    }
    case "become-licid-aura": {
      if (ctx.sourceLost === true) return;
      const target = resolveEffectTarget(spec.target, ctx);
      if (target !== undefined) ctx.becomeLicidAura(target, spec.endCost);
      return;
    }
    case "attach": {
      if (spec.ontoChosen !== undefined && spec.attaching === undefined) {
        // What's attached is settled now; the host is chosen next, among
        // those it could legally go on (rule 701.3a).
        const attaching =
          spec.attachment === undefined
            ? ctx.sourceLost === true
              ? undefined
              : ({ kind: "object", object: ctx.source } as const)
            : resolveAttachRef(spec.attachment, ctx);
        if (attaching?.kind !== "object") return;
        const { filter, prompt, optional, another } = spec.ontoChosen;
        const hosts = ctx.attachableHosts(attaching.object, filter, another === true);
        if (hosts.length === 0) return;
        ctx.choosePermanents(
          filter,
          optional === true ? 0 : 1,
          1,
          { kind: "attach", target: 0, attachment: 0, attaching },
          prompt,
          false,
          ctx.permanentsMatching(filter).flatMap((m) => (hosts.includes(m.object) ? [] : [m.object])),
        );
        return;
      }
      if (spec.attaching !== undefined) {
        // An `ontoChosen`'s answer: target 0 is the permanent chosen.
        const host = ctx.targets[0];
        if (host !== undefined) ctx.attach(host, spec.attaching);
        return;
      }
      const target = spec.onto ?? resolveAttachRef(spec.target, ctx);
      if (target === undefined) return;
      if (spec.choose !== undefined) {
        const count = ctx.permanentsMatching(spec.choose.filter).reduce((n, m) => n + m.count, 0);
        if (count === 0) return;
        ctx.choosePermanents(
          spec.choose.filter,
          0,
          Math.min(count, spec.choose.upTo ?? count),
          { kind: "attach", target: 0, attachment: 0, onto: target },
          spec.choose.prompt,
        );
        return;
      }
      if (spec.attachments !== undefined) {
        ctx.attachAll(target, spec.attachments);
        return;
      }
      if (spec.attachment === undefined) {
        // "Attach this …": not once the source has left and come back as a
        // new object (rule 400.7).
        if (ctx.sourceLost === true) return;
        ctx.attach(target, undefined, spec.planeswalkerToo === true);
        return;
      }
      const attachment = resolveAttachRef(spec.attachment, ctx);
      if (attachment !== undefined) ctx.attach(target, attachment);
      return;
    }
    case "transform": {
      const target = resolveEffectTarget(spec.target, ctx);
      if (target !== undefined) ctx.transform(target);
      return;
    }
    case "flip": {
      const target = resolveEffectTarget(spec.target, ctx);
      if (target !== undefined) ctx.flip(target);
      return;
    }
    case "become-copy": {
      // Acting on `target` needs it to be the same object still (rule
      // 400.7); `of` is only read, so one that has left is read as it last
      // existed (rule 608.2h).
      const of = resolveAmountRef(spec.of, ctx);
      if (of?.kind !== "object") return;
      let targets: readonly ObjectId[];
      if (spec.filter !== undefined) {
        targets = ctx
          .permanentsMatching(spec.filter)
          .map((m) => m.object)
          .filter((id) => spec.exceptOf !== true || id !== of.object);
      } else {
        const target = spec.target === undefined ? undefined : resolveEffectTarget(spec.target, ctx);
        targets = target?.kind === "object" ? [target.object] : [];
      }
      if (targets.length === 0) return;
      ctx.becomeCopy(targets, of.object, {
        ...(spec.ofCard === true ? { ofCard: true } : {}),
        ...(spec.until !== undefined ? { until: spec.until } : {}),
        ...(spec.exceptions !== undefined ? { exceptions: spec.exceptions } : {}),
      });
      return;
    }
    case "day-night":
      ctx.setDayNight(spec.value);
      return;
    case "become-monarch": {
      if (typeof spec.who === "number") {
        // "Target opponent becomes the monarch" (Jared Carthalion).
        const slot = ctx.targets[spec.who];
        if (slot?.kind === "player") ctx.becomeMonarchPlayer(slot.player);
        return;
      }
      ctx.becomeMonarch(spec.who, spec.via);
      return;
    }
    case "take-initiative":
      ctx.takeInitiative(spec.who, spec.via);
      return;
    case "mutate-merge":
      ctx.mergeMutatingSpell(spec.onTop);
      return;
    case "venture":
      ctx.venture(spec.into === "undercity");
      return;
    case "increase-speed":
      ctx.increaseSpeed(ctx.controller, spec.amount);
      return;
    case "the-ring-tempts-you":
      ctx.ringTemptBegin();
      applyEffectSpec(
        {
          kind: "sequence",
          effects: [
            {
              kind: "choose-permanents",
              filter: { type: "creature", controlledBy: "you" },
              min: 1,
              upTo: 1,
              then: { kind: "become-ring-bearer", target: 0 },
              prompt: "The Ring tempts you: choose your Ring-bearer",
            },
            { kind: "ring-tempted" },
          ],
        },
        ctx,
      );
      return;
    case "become-ring-bearer": {
      const target = resolveEffectTarget(spec.target, ctx);
      if (target?.kind === "object") ctx.becomeRingBearer(target.object);
      return;
    }
    case "pair": {
      const target = resolveEffectTarget(spec.target, ctx);
      if (target?.kind === "object") ctx.pairWithSource(target.object);
      return;
    }
    case "ring-tempted":
      ctx.ringTemptFinish();
      return;
    case "get-energy":
      ctx.getEnergy(Math.max(0, Math.floor(amountValue(spec.amount, ctx))), spec.who);
      return;
    case "pay-energy":
      ctx.getEnergy(-spec.amount, "you");
      return;
    case "add-player-counters": {
      const players =
        spec.target !== undefined
          ? scopedOrTargetedPlayers(spec.target, ctx).flatMap((ref) =>
              ref.kind === "player" ? [ref.player] : [],
            )
          : typeof spec.who === "object"
            ? ((p) => (p === undefined ? [] : [p]))(effectPlayer(spec.who, ctx))
            : ctx.playersInScope(spec.who ?? "you");
      for (const player of players) {
        ctx.addPlayerCounters(player, spec.counter, amountValue(spec.amount, ctx, player));
      }
      return;
    }
    case "remove-player-counters": {
      const players =
        spec.target !== undefined
          ? scopedOrTargetedPlayers(spec.target, ctx).flatMap((ref) =>
              ref.kind === "player" ? [ref.player] : [],
            )
          : ctx.playersInScope(spec.who ?? "you");
      for (const player of players) {
        const n =
          spec.amount === "all" ? ctx.playerCountersOf(player, spec.counter) : amountValue(spec.amount, ctx, player);
        if (n > 0) ctx.addPlayerCounters(player, spec.counter, -n);
      }
      return;
    }
    case "epic":
      ctx.epic();
      return;
    case "create-emblem": {
      if (spec.to === undefined) {
        ctx.createEmblem(spec.text, spec.static, spec.triggered, undefined, spec.moreStatics);
        return;
      }
      // "Target opponent gets an emblem": nobody, once that target is gone.
      const to = ctx.targets[spec.to];
      if (to?.kind === "player") ctx.createEmblem(spec.text, spec.static, spec.triggered, to.player, spec.moreStatics);
      return;
    }
    case "prevent-all-combat-damage":
      ctx.preventAllCombatDamage(spec.by);
      return;
    case "prevent-damage-to-you":
      ctx.preventAllCombatDamage(spec.by, true);
      return;
    case "damage-cant-be-prevented":
      ctx.damageUnpreventableThisTurn();
      return;
    case "damage-rule": {
      const objectOf = (ref: EffectTargetRef | undefined): ObjectId | null | undefined => {
        if (ref === undefined) return undefined;
        const t = resolveEffectTarget(ref, ctx);
        return t?.kind === "object" ? t.object : null;
      };
      let target: TargetRef | undefined;
      if (spec.to?.target !== undefined) {
        target = resolveEffectTarget(spec.to.target, ctx);
        // An illegal target: nothing to protect.
        if (target === undefined) return;
      }
      const from = objectOf(spec.by?.target);
      if (from === null) return;
      const exceptRecipient = objectOf(spec.to?.exceptTarget);
      const exceptSource = objectOf(spec.by?.exceptTarget);
      let amount: "all" | "next-time" | number = "all";
      if (spec.amount !== undefined && spec.amount !== "all") {
        amount = spec.amount === "next-time" ? "next-time" : amountValue(spec.amount, ctx);
        if (amount !== "next-time" && amount <= 0) return;
      }
      let redirect: TargetRef | undefined;
      let redirectToSource: "itself" | "controller" | undefined;
      if (spec.redirectTo === "source-controller") redirectToSource = "controller";
      else if (spec.redirectTo === "source-itself") redirectToSource = "itself";
      else if (spec.redirectTo !== undefined) {
        redirect = redirectRef(spec.redirectTo, ctx);
        // Rule 614.9: nowhere legal to send it.
        if (redirect === undefined) return;
      }
      ctx.addDamageRule({
        ...(target !== undefined ? { target } : {}),
        ...(spec.to?.players !== undefined ? { players: spec.to.players } : {}),
        ...(spec.to?.permanents !== undefined ? { permanents: spec.to.permanents } : {}),
        ...(exceptRecipient != null ? { exceptRecipient } : {}),
        ...(from != null ? { from } : {}),
        ...(spec.by?.filter !== undefined ? { byFilter: spec.by.filter } : {}),
        ...(exceptSource != null ? { exceptSource } : {}),
        ...(spec.combat !== undefined ? { combat: spec.combat } : {}),
        amount,
        duration: spec.duration ?? "end-of-turn",
        ...(redirect !== undefined ? { redirect } : {}),
        ...(redirectToSource !== undefined ? { redirectToSource } : {}),
        ...(spec.then !== undefined ? { then: spec.then } : {}),
        ...(spec.gainLifePrevented === true ? { gainLifePrevented: true as const } : {}),
      });
      return;
    }
    case "prevent-damage-divided":
      ctx.division.forEach((amount, i) => {
        const target = ctx.targets[spec.from + i];
        if (target !== undefined && amount > 0) ctx.preventDamage(target, amount, spec.combatOnly ?? false);
      });
      return;
    case "prevent-damage": {
      const ref = resolveEffectTarget(spec.target, ctx);
      if (ref === undefined) return;
      if (spec.redirectTo !== undefined) {
        // Rule 614.9: nowhere to send it (an illegal target), no shield.
        const to = redirectRef(spec.redirectTo, ctx);
        if (to !== undefined && spec.amount !== "all") {
          ctx.preventDamage(ref, amountValue(spec.amount, ctx), spec.combatOnly ?? false, to);
        }
        return;
      }
      ctx.preventDamage(ref, spec.amount === "all" ? "all" : amountValue(spec.amount, ctx), spec.combatOnly ?? false);
      return;
    }
    case "prevent-damage-from-chosen-source": {
      // The answer: target 0 is the source chosen.
      if (spec.protect !== undefined) {
        const source = resolveEffectTarget(0, ctx);
        if (source !== undefined) {
          ctx.preventDamageFrom(
            source,
            spec.protect,
            spec.amount,
            spec.filter,
            spec.gainLifePrevented === true,
            spec.redirect,
            {
              ...(spec.then !== undefined ? { then: spec.then } : {}),
              ...(spec.ownTargets !== undefined ? { thenTargets: spec.ownTargets } : {}),
              ...(spec.redirectToSource !== undefined ? { redirectToSource: spec.redirectToSource } : {}),
              ...(spec.gainLifeFrom !== undefined ? { gainLifeFrom: spec.gainLifeFrom } : {}),
            },
          );
        }
        return;
      }
      const protect: TargetRef | "your-side" | "your-side-creatures" | "any" | undefined =
        spec.to === "you"
          ? { kind: "player", player: ctx.controller }
          : spec.to === "your-side" || spec.to === "your-side-creatures" || spec.to === "any"
            ? spec.to
            : resolveEffectTarget(spec.to, ctx);
      if (protect === undefined) return;
      const redirect = spec.redirectTo === undefined ? undefined : redirectRef(spec.redirectTo, ctx);
      if (spec.redirectTo !== undefined && redirect === undefined) return;
      ctx.chooseDamageSource(spec.filter ?? {}, {
        ...spec,
        protect,
        ...(redirect !== undefined ? { redirect } : {}),
        ...(spec.then !== undefined ? { ownTargets: ctx.targets.map((t) => t ?? null) } : {}),
      });
      return;
    }
    case "become-color": {
      const target = resolveEffectTarget(spec.target, ctx);
      if (target !== undefined) ctx.becomeColor(target, spec.colors, spec.duration, spec.inAddition === true);
      return;
    }
    case "change-text": {
      // The word to replace, then its replacement — of the same kind and
      // not the same word — each asked as it resolves, each answer filled
      // into the spec for the next step.
      if (spec.from === undefined) {
        ctx.chooseValue({
          kind: "choose-value",
          value: "text-word",
          words: spec.words,
          prompt: "Replace which word?",
          then: { ...spec, from: CHOSEN_TEXT_WORD },
        });
        return;
      }
      const kind = textWordKind(spec.from);
      if (kind === undefined) return;
      if (spec.to === undefined) {
        ctx.chooseValue({
          kind: "choose-value",
          value: "text-word",
          words: kind,
          except: spec.from,
          prompt: `Replace "${spec.from}" with which word?`,
          then: { ...spec, to: CHOSEN_TEXT_WORD },
        });
        return;
      }
      if (textWordKind(spec.to) !== kind || spec.to === spec.from) return;
      const target = resolveEffectTarget(spec.target, ctx);
      if (target !== undefined) ctx.changeText(target, { from: spec.from, to: spec.to }, spec.duration);
      return;
    }
    case "modal":
      // Announced as the ability went on the stack: those modes, in printed
      // order.
      if (spec.announced === true && ctx.announcedModes !== undefined) {
        // Each mode with targets of its own reads just those, as slots 0…
        // (rule 700.2): the ability's own targets come first, then each
        // chosen mode's, in listed order — so a mode whose target has gone
        // illegal still does whatever else it says, as a modal spell's does.
        const counts = ctx.announcedModes.map((i) => spec.modes[i]?.targets?.length ?? 0);
        // A mode's "any number of target …" group (Orcus, Prince of Undeath)
        // holds as many targets as were chosen for it, not one: it's the
        // last slot of the list, after the earlier modes' slots, and such an
        // ability has none of its own (`any-number-targets.test.ts`), so it
        // takes every target from its mode's start on.
        const grouped = ctx.announcedModes.findIndex((i) =>
          (spec.modes[i]?.targets ?? []).some((t) => typeof t === "object" && t.kind === "any-number"),
        );
        if (grouped >= 0) {
          const before = counts.slice(0, grouped).reduce((a, b) => a + b, 0);
          counts[grouped] = Math.max(0, ctx.targets.length - before - counts.slice(grouped + 1).reduce((a, b) => a + b, 0));
        }
        let offset = ctx.targets.length - counts.reduce((a, b) => a + b, 0);
        ctx.announcedModes.forEach((i, k) => {
          const mode = spec.modes[i];
          const count = counts[k];
          const modeCtx = count > 0 ? ctx.withTargetSlice(offset, count) : ctx;
          offset += count;
          if (mode !== undefined) applyEffectSpec(mode.effect, modeCtx);
        });
        return;
      }
      if (spec.random === true) {
        // "Choose one at random" as it applies: among the modes that could
        // be chosen now, each with an equal chance.
        const eligible = spec.modes.filter((mode) => mode.onlyIf === undefined || ctx.conditionMet(mode.onlyIf));
        if (eligible.length === 0) return;
        const mode = eligible[ctx.pickAtRandom(eligible.length, (i) => ({ kind: "mode", text: eligible[i].text }))];
        applyEffectSpec(mode.effect, ctx);
        return;
      }
      ctx.chooseModes(
        spec.minModes,
        amountValue(spec.maxModes, ctx),
        spec.modes,
        undefined,
        undefined,
        spec.notChosenBefore === true ? "ever" : spec.notChosenThisTurn === true,
      );
      return;
    case "may": {
      // An action that can't be done in full isn't offered: it is as though
      // the player declined (see `mayBeDone`).
      if (!mayBeDone(spec.effect, ctx)) {
        if (spec.else !== undefined) applyEffectSpec(spec.else, ctx);
        return;
      }
      const chosenEffect: EffectSpec =
        spec.then === undefined
          ? spec.effect
          : { kind: "sequence", effects: [spec.effect, spec.then] };
      ctx.chooseModes(
        0,
        1,
        [{ text: spec.prompt, effect: chosenEffect }],
        spec.else,
        spec.cost,
        spec.oncePerTurn === true,
        spec.costLife === undefined && spec.costEnergy === undefined && spec.maxX === undefined &&
          spec.costEnergyX === undefined && spec.costTimes === undefined
          ? undefined
          : {
              ...(spec.costLife !== undefined ? { life: amountValue(spec.costLife, ctx) } : {}),
              ...(spec.costEnergy !== undefined ? { energy: amountValue(spec.costEnergy, ctx) } : {}),
              ...(spec.maxX !== undefined ? { maxX: amountValue(spec.maxX, ctx) } : {}),
              ...(spec.costEnergyX !== undefined ? { energyX: spec.costEnergyX } : {}),
              ...(spec.costTimes === true ? { costTimes: true as const } : {}),
            },
        spec.aboutThatPlayer === true ? effectPlayer("that-player", ctx) : undefined,
        spec.xColor,
      );
      return;
    }
    case "sacrifice-all-but": {
      // One player at a time, as `keep-total-power` asks; the sacrifice waits
      // for them all.
      const below = ctx.parkedCount();
      const players =
        typeof spec.who === "object"
          ? ((player) => (player === undefined ? [] : [player]))(effectPlayer(spec.who, ctx))
          : ctx.playersInScope(spec.who);
      let toAsk = spec.progress?.toAsk ?? ctx.apnap(players);
      let kept = [...(spec.progress?.kept ?? []), ...ctx.takeKept()];
      const keep = amountValue(spec.keep, ctx);
      while (toAsk.length > 0) {
        const player = toAsk[0];
        toAsk = toAsk.slice(1);
        if (ctx.askKeep(player, spec.filter, keep, spec.upTo === true)) {
          ctx.resumeAfterDecisions({ ...spec, progress: { toAsk, kept } }, below);
          return;
        }
        kept = [...kept, ...ctx.takeKept()];
      }
      ctx.sacrificeAllExcept(players, spec.filter, kept);
      return;
    }
    case "keep-total-power": {
      // One player at a time, each answered before the next is asked (the
      // ruling: the active player first, then the rest in turn order,
      // knowing the choices before them); the sacrifice waits for them all.
      const below = ctx.parkedCount();
      let toAsk = spec.progress?.toAsk ?? ctx.apnap(ctx.playersInScope(spec.who));
      const kept = [...(spec.progress?.kept ?? []), ...(spec.progress !== undefined ? ctx.takeKept() : [])];
      while (toAsk.length > 0) {
        const player = toAsk[0];
        toAsk = toAsk.slice(1);
        if (ctx.askKeepTotalPower(player, spec.filter, spec.maxTotalPower, spec.prompt)) {
          ctx.resumeAfterDecisions({ ...spec, progress: { toAsk, kept } }, below);
          return;
        }
      }
      ctx.sacrificeAllExcept(ctx.playersInScope(spec.who), spec.filter, kept);
      return;
    }
    case "separate-into-piles": {
      // Separated first, then chosen (rule 700.3), each answered before the
      // next is asked; the piles' fates wait for both.
      const below = ctx.parkedCount();
      const faceDown = spec.faceDown === true;
      const progress = spec.progress;
      if (progress === undefined) {
        const separator = effectPlayer(spec.separator ?? "you", ctx);
        const chooser = effectPlayer(spec.chooser, ctx);
        if (separator === undefined || chooser === undefined) return;
        const what = spec.objects;
        const begun = ctx.beginPiles(
          what === "targets"
            ? { cards: ctx.targets.flatMap((t) => (t?.kind === "object" ? [t.object] : [])) }
            : "libraryTop" in what
              ? { libraryTop: amountValue(what.libraryTop, ctx), reveal: what.reveal === true }
              : "permanents" in what
                ? { permanents: what.permanents, whose: effectPlayer(what.whose, ctx) }
                : { graveyard: what.graveyard },
          separator,
        );
        // Nothing to separate: two empty piles, and nothing to do to either.
        if (begun.objects.length === 0) return;
        const fates = { chosen: pileFateWord(spec.chosen), ...(spec.rest !== undefined ? { rest: pileFateWord(spec.rest) } : {}) };
        if (ctx.askSeparatePiles(separator, begun.objects, chooser, faceDown, fates)) {
          ctx.resumeAfterDecisions({ ...spec, progress: { objects: begun.objects, separator, chooser, lookers: begun.lookers } }, below);
        }
        return;
      }
      let piles = progress.piles;
      if (piles === undefined) {
        piles = ctx.takePiles() ?? [[], [...progress.objects]];
        const fates = { chosen: pileFateWord(spec.chosen), ...(spec.rest !== undefined ? { rest: pileFateWord(spec.rest) } : {}) };
        if (ctx.askChoosePile(progress.chooser, progress.separator, piles, faceDown, progress.lookers, fates)) {
          ctx.resumeAfterDecisions({ ...spec, progress: { ...progress, piles } }, below);
        }
        return;
      }
      const chosen = ctx.takeChosenPile();
      if (chosen === undefined) return;
      ctx.finishPiles(
        piles[chosen] ?? [],
        piles.flatMap((pile, i) => (i === chosen ? [] : pile)),
        spec.chosen,
        spec.rest,
      );
      return;
    }
    case "choose-among-targets": {
      // Among the targets still legal (rule 608.2b): an illegal one is
      // blanked in `ctx.targets`, and isn't there to be chosen.
      const below = ctx.parkedCount();
      const objects =
        spec.progress?.objects ?? ctx.targets.flatMap((t) => (t?.kind === "object" ? [t.object] : []));
      if (objects.length === 0) return;
      if (spec.progress === undefined && objects.length > spec.count) {
        const chooser =
          spec.chooser === "their-controller"
            ? ctx.controllerOf({ kind: "object", object: objects[0] })
            : effectPlayer(spec.chooser, ctx);
        if (chooser === undefined) return;
        const prompt = spec.prompt ?? `Choose ${spec.count} of them`;
        if (!ctx.askChooseAmong(chooser, objects, spec.count, prompt)) return;
        ctx.resumeAfterDecisions({ ...spec, progress: { objects } }, below);
        return;
      }
      // With `count` or fewer, every one is chosen, unasked.
      const picked = spec.progress === undefined ? objects : ctx.takeKept();
      const chosen = new Set(picked);
      ctx.finishPiles(
        objects.filter((id) => chosen.has(id)),
        objects.filter((id) => !chosen.has(id)),
        spec.chosen,
        spec.rest,
      );
      return;
    }
    case "encore":
      ctx.encore();
      return;
    case "goad": {
      const forGame = spec.forGame === true;
      if (spec.who !== undefined) {
        for (const player of ctx.playersInScope(spec.who)) ctx.goadCreaturesOf(player, forGame);
        return;
      }
      if (spec.filter !== undefined) {
        ctx.goadMatching(spec.filter, forGame);
        return;
      }
      const ref = spec.target === undefined ? undefined : ctx.targets[spec.target];
      if (ref?.kind === "player") ctx.goadCreaturesOf(ref.player, forGame);
      else if (ref?.kind === "object") ctx.goadCreature(ref, forGame);
      return;
    }
    case "suspect": {
      const target = resolveEffectTarget(spec.target, ctx);
      if (target !== undefined) ctx.suspect(target);
      return;
    }
    case "unsuspect": {
      if (spec.filter !== undefined) {
        ctx.unsuspect({ filter: spec.filter });
        return;
      }
      const target = spec.target === undefined ? undefined : resolveEffectTarget(spec.target, ctx);
      if (target !== undefined) ctx.unsuspect(target);
      return;
    }
    case "become-saddled": {
      const target = resolveEffectTarget(spec.target, ctx);
      if (target !== undefined) ctx.becomeSaddled(target);
      return;
    }
    case "attack-requirement": {
      const slot = (ref: EffectTargetRef): TargetRef | undefined =>
        illegalSlot(ref, ctx) ? undefined : resolveEffectTarget(ref, ctx);
      const object = spec.target === undefined ? undefined : slot(spec.target);
      if (spec.target !== undefined && object?.kind !== "object") return;
      const player = spec.controlledByTarget === undefined ? undefined : slot(spec.controlledByTarget);
      if (spec.controlledByTarget !== undefined && player?.kind !== "player") return;
      const aimed =
        spec.attacks === undefined
          ? undefined
          : spec.attacks === "you"
            ? ({ kind: "player", player: ctx.controller } as const)
            : slot(spec.attacks);
      if (spec.attacks !== undefined && aimed === undefined) return;
      ctx.addAttackRequirement({
        filter: spec.filter ?? {},
        otherThanYou: spec.otherThanYou ?? false,
        ...(object?.kind === "object" ? { object: object.object } : {}),
        ...(player?.kind === "player" ? { controlledBy: player.player } : {}),
        ...(aimed !== undefined ? { attacks: aimed.kind === "player" ? aimed.player : aimed.object } : {}),
        ...(spec.duration !== undefined ? { duration: spec.duration } : {}),
      });
      return;
    }
    case "impulse-exile": {
      const whoseIf = spec.whoseIf;
      const players =
        spec.whose !== undefined && spec.whose !== "you"
          ? scopedOrTargetedPlayers(spec.whose, ctx).flatMap((ref) => (ref?.kind === "player" ? [ref.player] : []))
          : whoseIf !== undefined
            ? [ctx.controller]
            : undefined;
      ctx.impulseExile(amountValue(spec.amount, ctx), spec.duration, spec.castOnly === true, {
        ...(players !== undefined
          ? {
              players:
                whoseIf === undefined ? players : players.filter((p) => ctx.aboutPlayer(p).conditionMet(whoseIf)),
            }
          : {}),
        ...(spec.whileSource === true ? { whileSource: true } : {}),
        ...(spec.oncePerTurn === true ? { oncePerTurn: true } : {}),
        ...(spec.faceDown === true ? { faceDown: true } : {}),
        ...(spec.playedBy === "owner" ? { ownerPlays: true } : {}),
        choose: spec.choose,
        yourTurnOnly: spec.yourTurnOnly,
        gate: spec.gate,
        ...(spec.filter !== undefined ? { filter: spec.filter } : {}),
        ...(spec.free !== undefined ? { free: spec.free } : {}),
        ...(spec.payLifeManaValue === true ? { payLifeManaValue: true as const } : {}),
        ...(spec.spendAs !== undefined ? { spendAs: spec.spendAs } : {}),
        ...(spec.sourceDid !== undefined ? { sourceDid: spec.sourceDid } : {}),
        ...(spec.linked === true ? { linked: true } : {}),
      });
      return;
    }
    case "unless": {
      // A generic amount, and the mana cost of an object, are fixed as the
      // effect applies.
      const options = spec.options.flatMap((option): BoundUnlessOption[] => {
        if ("payGeneric" in option) {
          const n = amountValue(option.payGeneric, ctx);
          return [
            {
              pay: `{${n}}`,
              text: option.text.split("{X}").join(`{${n}}`),
              ...(option.text.includes("{X}") ? { paysX: true as const } : {}),
            },
          ];
        }
        if ("payLifeAmount" in option) {
          const n = Math.max(0, amountValue(option.payLifeAmount, ctx));
          return [{ payLife: n, text: option.text.split("{X}").join(`${n}`) }];
        }
        if ("payManaCostOf" in option) {
          const object = resolveEffectTarget(option.payManaCostOf, ctx);
          const cost = object === undefined ? null : ctx.manaCostToPay(object);
          return cost === null
            ? []
            : [
                {
                  pay: cost,
                  text: option.text.split("{X}").join(cost),
                  ...(option.ifPaid !== undefined ? { ifPaid: option.ifPaid } : {}),
                },
              ];
        }
        return [bindUnlessTimes(option, ctx)];
      });
      const chooser = spec.chooser;
      if (typeof chooser === "object" && "anyOf" in chooser) {
        // "Any other player": as `"any-player"`, each in turn order (rule
        // 101.4), the next only once the one before has declined.
        const [first, ...rest] = ctx.apnap(ctx.playersInScope(chooser.anyOf));
        let otherwise = spec.otherwise;
        for (const player of [...rest].reverse()) {
          otherwise = { kind: "unless", chooser: { player }, options, otherwise };
        }
        ctx.unless(first === undefined ? -1 : { player: first }, options, otherwise);
        return;
      }
      if (
        typeof chooser === "number" ||
        chooser === "any-player" ||
        chooser === "you" ||
        chooser === "active-player" ||
        chooser === "trigger-controller" ||
        chooser === "trigger-player" ||
        (typeof chooser === "object" && "player" in chooser)
      ) {
        ctx.unless(chooser, options, spec.otherwise);
        return;
      }
      // One player named as this applies. Nobody: `otherwise` happens.
      const named = effectPlayer(chooser, ctx);
      ctx.unless(named === undefined ? -1 : { player: named }, options, spec.otherwise);
      return;
    }
    case "each-player-may":
      applyEachPlayerMay(spec, ctx);
      return;
    case "reflexive-trigger": {
      // Naming nothing, the action it reacts to didn't happen (rule 603.12).
      const about =
        spec.about === undefined || (typeof spec.about === "number" && illegalSlot(spec.about, ctx))
          ? undefined
          : resolveAttachRef(spec.about, ctx);
      if (spec.about !== undefined && about?.kind !== "object") return;
      ctx.reflexiveTrigger(
        spec.targets,
        spec.effect,
        spec.text,
        spec.value === undefined ? undefined : amountValue(spec.value, ctx),
        spec.divided,
        about?.kind === "object" ? about.object : undefined,
      );
      return;
    }
    case "ward":
      ctx.ward(spec.cost);
      return;
    case "scry":
      ctx.scry(amountValue(spec.amount, ctx), false, spec.then);
      return;
    case "reveal-top": {
      if (spec.who !== undefined) {
        for (const player of ctx.playersInScope(spec.who)) ctx.revealTop(null, player);
        applyEffectSpec(spec.then, ctx);
        return;
      }
      if (spec.of === undefined) {
        ctx.revealTop(spec.then);
        return;
      }
      const of = ctx.targets[spec.of.ownerOfTarget];
      const owner = of === undefined ? undefined : ctx.ownerOf(of);
      if (owner !== undefined) ctx.revealTop(spec.then, owner);
      return;
    }
    case "shuffle-into-library": {
      const target = resolveEffectTarget(spec.target, ctx);
      if (target !== undefined) ctx.shuffleIntoLibrary(target);
      // "When this creature dies, shuffle it into its owner's library" with
      // the card gone from the graveyard since: it stays where it is, and its
      // owner shuffles all the same (Angel of Fury's ruling).
      else if (spec.target === "trigger-object" && ctx.triggerObject !== undefined) {
        ctx.shuffleIntoLibrary({ kind: "object", object: ctx.triggerObject }, true);
      }
      return;
    }
    case "surveil":
      ctx.scry(amountValue(spec.amount, ctx), true, spec.then);
      return;
    case "search-library": {
      let searcher: PlayerId | null = null;
      if (spec.who === "that-player") {
        // The player an `each-player-may`'s `ifDid` is about: nobody, no search.
        const them = ctx.playersInScope("that-player")[0];
        if (them === undefined) return;
        searcher = them;
      } else if (spec.who !== undefined) {
        const of = ctx.targets[spec.who.controllerOfTarget];
        // A target that has already gone (Path to Exile exiles first) still
        // names its last-known controller; nothing at all means no search.
        const who = of === undefined ? undefined : ctx.controllerOf(of);
        if (who === undefined) return;
        searcher = who;
      }
      // "Search target opponent's library": nobody there, nothing searched.
      const owner = spec.whose === undefined ? undefined : effectPlayer(spec.whose, ctx);
      if (spec.whose !== undefined && owner === undefined) return;
      // "While you're searching your library, you may cast this card from
      // your library" (Panglacial Wurm, rule 601.3): any number of them, as
      // part of the search, before anything is found; the search then goes on
      // and the spell waits on the stack above what's resolving.
      const searching = searcher ?? ctx.controller;
      if (
        spec.castsWhileSearchingAsked !== true &&
        (owner === undefined || owner === searching) &&
        spec.zones !== "graveyard" &&
        spec.outside !== "only" &&
        ctx.castableWhileSearching(searching).length > 0
      ) {
        applyEffectSpec(
          {
            kind: "sequence",
            effects: [
              { kind: "cast-now", from: "while-searching", repeat: true, ...(spec.who !== undefined ? { by: spec.who } : {}) },
              { ...spec, castsWhileSearchingAsked: true },
            ],
          },
          ctx,
        );
        return;
      }
      ctx.searchLibrary(
        searcher,
        spec.filter,
        spec.destination,
        amountValue(spec.min, ctx),
        amountValue(spec.max, ctx),
        spec.enterTapped === true,
        spec.restDestination,
        spec.reveal === true,
        spec.zones,
        resolvedTogether(spec.together, ctx),
        spec.attachedToSource === true ? attachHost("source", ctx) : attachHost(spec.attachedTo, ctx),
        {
          ...(owner !== undefined ? { owner } : {}),
          ...(spec.all === true ? { all: true } : {}),
          ...(spec.playable !== undefined ? { playable: spec.playable } : {}),
          ...(spec.linked === true ? { linked: true } : {}),
          ...(spec.then !== undefined ? { then: spec.then } : {}),
          ...(spec.outside !== undefined ? { outside: spec.outside } : {}),
          ...(spec.faceUpExile === true ? { faceUpExile: true } : {}),
          ...(spec.exileRest === true ? { exileRest: true } : {}),
          ...(spec.inAnyOrder === true ? { inAnyOrder: true } : {}),
          ...(spec.upTo === true ? { upTo: true } : {}),
          // "…if you control a land named Wastes": read now — nothing between
          // the search and the put could change it. Not holding, every find
          // goes to `destination`.
          ...(spec.instead !== undefined &&
          (spec.instead.condition === undefined || ctx.conditionMet(spec.instead.condition))
            ? {
                instead: {
                  destination: spec.instead.destination,
                  pick: spec.instead.pick,
                  ...(spec.instead.enterTapped === true ? { enterTapped: true as const } : {}),
                  ...(spec.instead.filter !== undefined ? { filter: spec.instead.filter } : {}),
                  ...(spec.instead.under === "you" ? { under: ctx.controller } : {}),
                  ...((who) => (who === undefined ? {} : { chooser: who }))(
                    spec.instead.chooser === undefined || spec.instead.chooser === "an-opponent"
                      ? spec.instead.chooser
                      : effectPlayer(spec.instead.chooser, ctx),
                  ),
                },
              }
            : {}),
          ...(spec.withCounters !== undefined
            ? { withCounters: { kind: spec.withCounters.kind, amount: amountValue(spec.withCounters.amount, ctx) } }
            : {}),
        },
      );
      return;
    }
    case "look-and-choose": {
      // "Each player looks at … their library": nobody, once that player has
      // left the game.
      // "The top three cards of target player's library": theirs, you
      // choosing — the zone's owner and the picker of the Tasigur shape.
      const owner = spec.from === undefined ? undefined : effectPlayer(spec.from, ctx);
      if (spec.from !== undefined && (owner === undefined || !ctx.playersInScope("each-player").includes(owner))) return;
      const chooser =
        owner ?? (spec.player === "that-player" ? ctx.playersInScope("that-player")[0] : undefined);
      if (spec.player === "that-player" && chooser === undefined) return;
      // "…of an opponent's choice" (Tasigur): they pick from your zone.
      const picker =
        owner !== undefined
          ? ctx.controller
          : spec.chooser === "that-player"
            ? ctx.playersInScope("that-player")[0]
            : undefined;
      if (spec.chooser === "that-player" && picker === undefined) return;
      // "Up to one target card … for each opponent": the targets still legal
      // (an illegal one's slot is blank — rule 608.2b).
      const zone =
        spec.zone === "targets"
          ? { cards: ctx.targets.flatMap((t) => (t?.kind === "object" ? [t.object] : [])) }
          : spec.zone === "exiled-with-source"
            ? // Rule 607.2a: only what the linked ability exiled.
              { exiled: ctx.cardsExiledWithSource(true) }
            : spec.zone;
      ctx.lookAndChoose(
        zone,
        spec.count === undefined ? undefined : amountValue(spec.count, ctx),
        amountValue(spec.min, ctx),
        amountValue(spec.max, ctx),
        spec.destination,
        spec.leftover,
        spec.filter,
        spec.enterTapped === true,
        spec.then,
        spec.reveal ?? false,
        spec.leftoverIf,
        spec.secondPick === undefined
          ? undefined
          : {
              ...(spec.secondPick.filter !== undefined ? { filter: spec.secondPick.filter } : {}),
              min: spec.secondPick.min,
              max: amountValue(spec.secondPick.max, ctx),
              destination: spec.secondPick.destination,
              ...(spec.secondPick.enterTapped === true ? { enterTapped: true } : {}),
              ...(spec.secondPick.ifNoneChosen === true ? { ifNoneChosen: true } : {}),
            },
        resolveEnterAttacking(spec.attacking, ctx),
        spec.enterAs,
        chooser,
        picker,
        spec.withCounters,
        spec.unlinked === true,
        spec.needsMin === true,
        attachHost(spec.attachedTo, ctx),
        spec.playable,
        resolvedTogether(spec.together, ctx),
        spec.split,
        {
          ...(spec.chooser === "an-opponent" ? { anOpponent: true as const } : {}),
          ...(spec.under === "you" ? { underYou: true as const } : {}),
          ...(spec.under === "owners" ? { underOwners: true as const } : {}),
        },
      );
      return;
    }
    case "offer-zone-choice":
      ctx.offerZoneChoice(spec.decision);
      return;
    default:
      throw new Error(
        `unhandled effect kind: ${(spec as { kind: string }).kind}`,
      );
  }
}
