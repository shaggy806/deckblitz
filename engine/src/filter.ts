/**
 * `CardFilter` — a pure predicate over a game object and its *computed*
 * characteristics (rule 613 layers baked in via `computeCharacteristics`).
 *
 * Every clause that is present must match (logical AND). It is the shared
 * vocabulary for "which objects does this effect / trigger / target / search
 * apply to", generalizing the old `{ type?, subtype? }` `ZoneChoiceFilter`.
 * Introduced in ROADMAP Phase 2; reused by every later phase.
 *
 * Off the battlefield (a library / graveyard card) `computeCharacteristics`
 * degrades to printed values, which is what a library search / graveyard
 * filter wants. A permanent that has *left* the battlefield is matched as it
 * last existed there only when the caller asks (`FilterContext.lastKnown` /
 * `.snapshot` — a dies trigger's filter, a resolving ability's "if it was …").
 */

import { JOURNAL_VIEWS, entriesThisTurn, journalEntries, type JournalWhat, type JournalWindow } from "./journal.js";
import {
  computeCharacteristics,
  effectiveColors,
  effectiveSubtypes,
  effectiveSupertypes,
  effectiveTypes,
  hasAnyAbility,
  hasLostAbilities,
  hasActivatedAbilityOf,
  hasManaAbility,
  journalCount,
  journalReader,
  pairedPartner,
  turnStatOf,
} from "./characteristics.js";
import type { CastVia } from "./actions.js";
import type { CardRegistry, CardType, Keyword, Supertype } from "./cards.js";
import type { EffectAmount, ThisWayKind } from "./effects.js";
import type { CardDefinition, TurnDid } from "./cards/define.js";
import { goadersOf, isGoaded } from "./goad.js";
import { hasRingBearerDesignation, isRingBearer } from "./ring.js";
import type { Color, ManaCost, ManaOrigin, ManaSpentQuery } from "./mana.js";
import { COLORS, colorSymbols, manaValue, parseManaCost, spentManaCount } from "./mana.js";
import type { ObjectId, PlayerId } from "./primitives.js";
import { spellCaster, activePlayerOf, blockedAttackersOf, controllersLastTurn, isTokenNow, manaCostOverride, nameOf, permanentCount, printedCardName, rulesTextName } from "./state.js";
import type { AttachmentRecord, GameObject, GameState, LastKnownInfo, ZoneType } from "./state.js";
import { CREATURE_TYPES } from "./creature-types.js";
import { EVERY_CREATURE_TYPE, EVERY_LAND_TYPE, hasSubtype, isCreatureType, isLandType, isTypeMarker } from "./subtypes.js";
import { lastKnownNames, namesOf } from "./card-names.js";
import type { TargetRef } from "./target.js";
import { thisWayEntries, votesThisWay } from "./this-way.js";
import { isObjectSetRef, staticSetMembers, type ObjectSetRef } from "./object-sets.js";
import type { ObjectRef, PlayerRef } from "./refs.js";

/**
 * A numeric comparison clause, e.g. `{ op: "lte", n: 2 }` = "≤ 2".
 *
 * `n: "x"` reads the `{X}` chosen for the spell or ability that's applying
 * the filter (Steel Hellkite: "each nonland permanent with mana value X").
 * It needs `FilterContext.x`; without one it compares against 0.
 *
 * `n` may also be a {@link DynamicOperand}: a number that isn't printed on the
 * card but read off the game when the filter is evaluated.
 */
export interface NumCompare {
  readonly op: "eq" | "ne" | "lt" | "lte" | "gt" | "gte";
  readonly n: number | "x" | DynamicOperand;
}

/**
 * Which numbers a parity clause of a filter takes:
 * - `"odd"` / `"even"`, printed, or a resolving "choose odd or even" answered
 *   through `$chosen` (`CHOSEN_CREATURE_TYPE`, substituted into the rest of the
 *   effect before it applies, so a `$chosen` left unanswered matches nothing);
 * - `"chosen"`, the quality chosen as the permanent applying the filter entered
 *   (its `chosenOnEnter`, from `chooseOnEnter: ODD_OR_EVEN`, via
 *   `FilterContext.source`): a source that has left reads what it had (rule
 *   608.2h). With no source, or no quality chosen for it, nothing matches, and
 *   "without mana value of the chosen quality" is a `not` of the clause.
 */
export type ParityClause = "odd" | "even" | "chosen" | "$chosen";

/** The menu of a "choose odd or even", for `chooseOnEnter` or a
 * `choose-creature-type`'s `options`: the words {@link ParityClause} reads. */
export const ODD_OR_EVEN = ["odd", "even"] as const;

/**
 * The right-hand side of a {@link NumCompare} that is read when the filter is
 * evaluated rather than written down.
 *
 * - `{ amount }` is any {@link EffectAmount}, evaluated in the context of the
 *   spell or ability applying the filter — Clement, the Worrywort's "target
 *   creature you control **with lesser mana value**" is
 *   `{ op: "lt", n: { amount: { manaValueOf: "trigger-object" } } }`. It is
 *   answered by `FilterContext.amount`; where nothing supplies one (a static
 *   ability's condition, which has no triggering object or resolution) the
 *   comparison **fails closed** — the object doesn't match. Nothing freezes
 *   it: a target filter is re-read when the target is rechecked on
 *   resolution, and an effect's filter when that effect applies.
 * - `{ own }` is a characteristic of the very object being matched — "each
 *   creature spell with toughness **greater than its power**" is
 *   `toughness: { op: "gt", n: { own: "power" } }`; Kutzil, Malamet
 *   Exemplar's "each with power greater than its base power" is `power: {
 *   op: "gt", n: { own: "basePower" } }`. Needs no context.
 * - `{ chosenThisWay: "power" }` is the greatest power among the permanents
 *   chosen so far in this resolution (`thisWay: "chosen"`) still on the
 *   battlefield — Sculpted Sunburst's "each opponent chooses a creature they
 *   control **with equal or lesser power**", beside the creature you chose.
 *   Not an amount, since an amount can't be below 0 (rule 107.1b) and a power
 *   can. With nothing chosen, the comparison fails closed.
 * - `{ amount, forItsController: true }` reads the amount's `"each"` as the
 *   controller of the very object being matched — Drown in the Loch's "target
 *   spell with mana value less than or equal to the number of cards in **its
 *   controller's** graveyard" is `manaValue: { op: "lte", n: { amount: {
 *   graveyardSize: "each" }, forItsController: true } }`.
 */
export type DynamicOperand =
  | { readonly amount: EffectAmount; readonly forItsController?: true }
  | { readonly chosenThisWay: "power" }
  | { readonly own: "power" | "toughness" | "basePower" | "baseToughness" | "manaValue" };

/**
 * Does any clause of `filter` compare against `{X}` — `n: "x"`, or an
 * `{ amount: "x" }` operand? A target filter that does (Rydia, Summoner of
 * Mist's "target Saga card with mana value X") has no fixed set of options
 * until X is chosen.
 */
export function filterReadsX(filter: CardFilter): boolean {
  // "Mana value X plus 1" (Sidisi, Regent of the Mire) is a sum on X.
  const amountReadsX = (amount: EffectAmount): boolean =>
    amount === "x" ||
    (typeof amount === "object" &&
      amount !== null &&
      (("sum" in amount && amount.sum.some(amountReadsX)) || ("product" in amount && amount.product.some(amountReadsX))));
  const readsX = (cmp: NumCompare | undefined): boolean =>
    cmp !== undefined &&
    (cmp.n === "x" || (isDynamicOperand(cmp.n) && "amount" in cmp.n && amountReadsX(cmp.n.amount)));
  return (
    readsX(filter.manaValue) ||
    (filter.manaSpent ?? []).some((clause) => readsX(clause.amount)) ||
    readsX(filter.counters?.compare) ||
    readsX(filter.power) ||
    readsX(filter.toughness) ||
    readsX(filter.basePower) ||
    readsX(filter.baseToughness) ||
    readsX(filter.equipmentAttached) ||
    readsX(filter.coloredManaSymbols) ||
    readsX(filter.cardTypeCount) ||
    (filter.nameDiffersFromEach !== undefined && filterReadsX(filter.nameDiffersFromEach)) ||
    (filter.anyOf ?? []).some(filterReadsX) ||
    (filter.not !== undefined && filterReadsX(filter.not))
  );
}

/**
 * `filter` with every bare `n: "x"` of {@link filterReadsX}'s clauses read as
 * `x`: for a filter judged after its spell or ability's `{X}` is no longer at
 * hand — a `look-and-choose`'s, matched as the choice is offered and answered
 * (Evershrike's "an Aura card with mana value X or less"). The same object
 * when nothing in it reads a bare X.
 */
export function filterAtX(filter: CardFilter, x: number): CardFilter {
  const at = (cmp: NumCompare | undefined): NumCompare | undefined =>
    cmp !== undefined && cmp.n === "x" ? { ...cmp, n: x } : cmp;
  const keys = [
    "manaValue",
    "power",
    "toughness",
    "basePower",
    "baseToughness",
    "equipmentAttached",
    "coloredManaSymbols",
    "cardTypeCount",
  ] as const;
  let out: CardFilter = filter;
  const set = (patch: Partial<CardFilter>): void => {
    out = { ...out, ...patch };
  };
  for (const key of keys) {
    const cmp = filter[key];
    if (cmp !== undefined && cmp.n === "x") set({ [key]: at(cmp) });
  }
  if (filter.manaSpent?.some((clause) => clause.amount?.n === "x")) {
    set({ manaSpent: filter.manaSpent.map((clause) => (clause.amount === undefined ? clause : { ...clause, amount: at(clause.amount) })) });
  }
  if (filter.counters?.compare?.n === "x") set({ counters: { ...filter.counters, compare: at(filter.counters.compare)! } });
  if (filter.nameDiffersFromEach !== undefined) {
    const inner = filterAtX(filter.nameDiffersFromEach, x);
    if (inner !== filter.nameDiffersFromEach) set({ nameDiffersFromEach: inner });
  }
  if (filter.anyOf !== undefined) {
    const inner = filter.anyOf.map((f) => filterAtX(f, x));
    if (inner.some((f, i) => f !== filter.anyOf![i])) set({ anyOf: inner });
  }
  if (filter.not !== undefined) {
    const inner = filterAtX(filter.not, x);
    if (inner !== filter.not) set({ not: inner });
  }
  return out;
}

/** One condition on the mana spent on something: {@link ManaSpentQuery} says
 * what to count, `amount` how much must be there (absent, at least one). */
export interface ManaSpentClause extends ManaSpentQuery {
  readonly amount?: NumCompare;
}

/** Does a `NumCompare` carry a {@link DynamicOperand}? */
export function isDynamicOperand(n: NumCompare["n"]): n is DynamicOperand {
  return typeof n === "object" && n !== null;
}

/**
 * `value <op> n`. `dynamic` answers a {@link DynamicOperand}; one it can't
 * answer (`undefined`, or no `dynamic` at all) makes the comparison false.
 */
export function compareNum(
  value: number,
  cmp: NumCompare,
  x = 0,
  dynamic?: (operand: DynamicOperand) => number | undefined,
): boolean {
  const n = cmp.n === "x" ? x : isDynamicOperand(cmp.n) ? dynamic?.(cmp.n) : cmp.n;
  if (n === undefined) return false;
  switch (cmp.op) {
    case "eq":
      return value === n;
    case "ne":
      return value !== n;
    case "lt":
      return value < n;
    case "lte":
      return value <= n;
    case "gt":
      return value > n;
    case "gte":
      return value >= n;
    default:
      return false;
  }
}

/**
 * An object's supertypes: its card's, as its copy exceptions change them —
 * "it's legendary in addition to its other types" (Sakashima the Impostor),
 * "it isn't legendary" (Spark Double; a token copy's `notLegendary` —
 * Miirym, Irenicus's Vile Duplication), both part of what the copy is (rule
 * 707.9b) — and less "legendary" for a token on the battlefield with "this
 * isn't legendary if it's a token" (Aeve, Progenitor Ooze: layer 4, so a
 * later loss of its abilities doesn't undo it). No filter, snapshot, mana
 * origin or legend rule sees past this.
 */
export function supertypesOf(registry: CardRegistry, object: GameObject): readonly Supertype[] {
  const def = registry.get(printedCardName(object));
  let out: readonly Supertype[] = def.supertypes;
  const withoutLegendary = (): void => {
    if (out.includes("legendary")) out = out.filter((s) => s !== "legendary");
  };
  // The copy exceptions in the order they were applied (rule 707.9b): a copy
  // of a copy made "not legendary" that says "legendary in addition" is.
  for (const m of object.modifiers) {
    if (m.copiable !== true) continue;
    for (const s of m.addSupertypes ?? []) if (!out.includes(s)) out = [...out, s];
    if (m.removeSupertypes !== undefined) out = out.filter((s) => !m.removeSupertypes!.includes(s));
  }
  if (
    isTokenNow(object) &&
    object.zone === "battlefield" &&
    def.static.some((ability) => ability.notLegendaryIfToken === true)
  ) {
    withoutLegendary();
  }
  // The Ring emblem's "your Ring-bearer is legendary" (rule 701.54c) — the
  // designation is only ever made under a Ring emblem.
  if (hasRingBearerDesignation(object) && !out.includes("legendary")) out = [...out, "legendary"];
  return out;
}

/**
 * The object (or objects) a `CardFilter` "shares a … type with it" clause
 * compares with, read in the resolving spell or ability:
 *
 * - `"trigger-object"` — the trigger object;
 * - `"source"` — the resolving spell's or ability's source;
 * - an {@link ObjectSetRef} — every member of that set, each as it was if it
 *   has moved since ("shares a creature type with **a member of**" it):
 *   `{ paid: "sacrificed" }` the permanent sacrificed to pay its cost (or by
 *   an earlier step), `{ thisWay: "exiled" }` the card exiled this way
 *   (Resplendent Marshal's "shares a creature type with the exiled card"),
 *   `"exiled-with-source"` the cards in exile linked to the source's
 *   battlefield stint (rule 607.2a, `GameObject.exiledWith`) or exiled until
 *   it leaves (610.3, `exiledUntil`): "the exiled card", "a card exiled with
 *   this" (Exclusion Ritual, Ixalan's Binding);
 * - `"attached"` — what the source is attached to ("enchanted creature"),
 *   or was last attached to when the source has gone (as `ObjectRef`'s
 *   `"attached"`);
 * - `"chosen"` — the permanent chosen as the source entered;
 * - a number — the object in that target slot, as it last existed if it has
 *   moved since (Reality Scramble's permanent put on the bottom of the
 *   library); an illegal or empty slot is nothing;
 * - `{ controlled }` — every permanent the effect's controller controls
 *   that matches the filter: "a land you control" (Hiveheart Shaman);
 * - `{ permanents }` — every permanent on the battlefield that matches it,
 *   whoever controls it: "a nontoken permanent" (Cornered Market);
 * - `{ graveyard }` — every card in a graveyard that matches it: "a card in
 *   a graveyard" (Bazaar of Wonders) with `{}`, "a card in your graveyard"
 *   (Pyromancer Ascension) with `ownedBy: "you"`; `itsController: true` only
 *   looks in the graveyard of the controller of the object being asked
 *   about — "a creature spell with the same name as a card in **their**
 *   graveyard" (Dragonlord Kolaghan), which only a live read can answer.
 *
 * Nothing to compare with: nothing shares a type with it.
 */
export type ShareReference =
  | ObjectRef
  | { readonly controlled: CardFilter }
  | { readonly permanents: CardFilter }
  | { readonly graveyard: CardFilter; readonly itsController?: true };

/**
 * What a `shares…TypeWith` clause compares with. A bare `ShareReference`
 * keeps its reference objects in whatever their types — "target creature and
 * each other creature that shares a creature type with it" (Killer), the
 * Crowns' host. `{ typesOf }` is the plain words, by types alone: a reference
 * object is in only if it has a type of that kind in common with one of them,
 * itself included, so a creature with no creature type shares none, even
 * with itself (rule 205.3m) — Everything Comes to Dust's "except those that
 * share a creature type with a creature that convoked this spell", whose
 * convokers are among what it exiles. `each: true` asks for a type in common
 * with **each** of them rather than any one — Cryptic Gateway's "a creature
 * card … that shares a creature type with each creature tapped this way"
 * (its ruling: an Elf Warrior for an Elf Wizard and a Human Warrior). With no
 * reference objects, `each` holds (nothing to fail) and the plain reading
 * doesn't (nothing to share with).
 */
export type TypeShareReference =
  | ShareReference
  | { readonly typesOf: ShareReference; readonly each?: true };

/** `reference` as its objects' reference and how it reads them — see
 * `TypeShareReference`. */
export function typeShareParts(reference: TypeShareReference): {
  readonly reference: ShareReference;
  readonly strict: boolean;
  readonly each: boolean;
} {
  if (typeof reference === "object" && reference !== null && "typesOf" in reference) {
    return { reference: reference.typesOf, strict: true, each: reference.each === true };
  }
  return { reference, strict: false, each: false };
}

/** One bound `shares…TypeWith` clause: the reference objects themselves
 * (each always matches — "target creature and each other creature that
 * shares a creature type with it") and the types they had of that `kind`,
 * changeling's every-creature-type marker included. */
export interface SharedTypes {
  readonly kind: "card" | "permanent" | "creature" | "land";
  readonly objects: readonly ObjectId[];
  readonly types: readonly string[];
}

/** Which sources of damage dealt this turn count, as they were as they dealt it
 * (`{ damageDealtThisTurn }`'s `by`): "by artifacts" (Reverse Polarity), "by other
 * sources named Blazing Effigy" (`other`: not the effect's own source). */
export interface DamageSourceClause {
  readonly type?: CardType;
  readonly name?: string;
  readonly other?: true;
}

export interface CardFilter {
  /** Must have ALL of these card types. */
  readonly types?: readonly CardType[];
  /** Convenience for a single required type. */
  readonly type?: CardType;
  /** Must have NONE of these card types. */
  readonly notTypes?: readonly CardType[];
  /** Must have AT LEAST ONE of these card types — an OR (Takenuma, Abandoned
   * Mire's Channel: "a creature or planeswalker card" — needed-cards-adjacent,
   * mirrors `subtypes`' OR semantics). */
  readonly typesAnyOf?: readonly CardType[];
  /** Must have this subtype (creature type, land type, …). */
  readonly subtype?: string;
  /** Must have AT LEAST ONE of these subtypes — an OR (Farseek: "a Plains,
   * Island, Swamp, or Mountain card"; a checkland's "a Mountain or a Forest"). */
  readonly subtypes?: readonly string[];
  /** Must have NONE of these subtypes — Cruel Revival's "target **non-Zombie**
   * creature", Crippling Fear's "creatures that aren't of the chosen type". */
  readonly notSubtypes?: readonly string[];
  /** Must have this supertype (`"legendary"`, `"basic"`, …). */
  readonly supertype?: Supertype;
  /** Exact true printed card name. */
  readonly name?: string;
  /** Current colours must include ALL of these. */
  readonly colors?: readonly Color[];
  /** Current colours must include NONE of these (Doom Blade: `["B"]`). */
  readonly notColors?: readonly Color[];
  /** Must be colourless; `false` must have one or more colours. */
  readonly colorless?: boolean;
  /** Must be multicoloured — two or more colours (rule 105.4). `false` matches
   * mono-coloured *and* colourless, which is what "nonmulticolored" means.
   * Not expressible as `colors`, which asks for specific ones. */
  readonly multicolored?: boolean;
  /** Exactly this many colours ("exactly three colors", Threefold Signal). */
  readonly colorCount?: number;
  readonly manaValue?: NumCompare;
  /** The value chosen for its `{X}` (rule 107.3): a spell or ability on the
   * stack's, 0 anywhere else — Banefire's "if X is 5 or more, this spell
   * can't be countered" (`cantBeCountered: { kind: "source", filter: {
   * xValue: { op: "gte", n: 5 } } }`), the number chosen, not the mana
   * spent (its ruling). */
  readonly xValue?: NumCompare;
  /** Has an odd or even mana value (zero is even): Void Winnower's "spells with
   * even mana values", Extinction Event's "each creature with mana value of the
   * chosen quality" (see {@link ParityClause}). */
  readonly manaValueParity?: ParityClause;
  /** Has odd or even power (Zimone's Hypothesis; Kianne's "as long as Kianne's
   * power is even"), read like `power`: not inside the layer fold. */
  readonly powerParity?: ParityClause;
  /**
   * What was spent to cast it (`GameObject.manaSpent`, `spentManaCount`): each
   * clause holds. `[{ amount: { op: "gte", n: 4 } }]` is "if at least four mana
   * was spent to cast it" (The Emperor of Palamecia); adamant is `[{ type: "W",
   * amount: { op: "gte", n: 3 } }]`; "if {U}{B} was spent" two clauses;
   * `[{ from: { subtype: "Treasure" } }]` "if mana from a Treasure was spent";
   * `[{ type: "C", amount: { op: "eq", n: 0 } }]` "if {C} wasn't spent"; Henge
   * Walker's "at least three mana of the same color" `count:
   * "most-of-one-color"`. Something that wasn't cast has none spent.
   */
  readonly manaSpent?: readonly ManaSpentClause[];
  /**
   * How many counters of a given kind are on the object — Rishkar's "each
   * creature you control **with a counter on it**", Undying's "if it had no
   * +1/+1 counters on it".
   *
   * `kind` omitted counts every counter of every kind, which is what a bare
   * "with a counter on it" means.
   */
  readonly counters?: { readonly kind?: string; readonly compare: NumCompare };
  /** Currently attacking (Kangee's Lieutenant: "attacking creatures with
   * flying get +1/+1"). */
  readonly attacking?: boolean;
  /** Attacking a player, not a planeswalker or a battle (rule 506.3) —
   * Master of Cruelties' "whenever this creature attacks **a player** and
   * isn't blocked". A permanent on the battlefield only. */
  readonly attackingPlayer?: true;
  /** Controlled by a defending player, for a spell with no attacker to read one
   * from (False Orders' "target creature defending player controls"): any player
   * an attacker is attacking, or whose planeswalker or battle it is; a player
   * chooses among several (rule 802.2a). */
  readonly controlledByDefendingPlayer?: true;
  /** Attacking a battle (Rampaging Geoderm's "if it's **attacking a
   * battle**"). */
  readonly attackingBattle?: boolean;
  /** Attacking the filtering player — the player, not a planeswalker or
   * battle of theirs (Blessed Reversal's "each creature **attacking you**").
   * Off the battlefield nothing is attacking anyone. */
  readonly attackingYou?: boolean;
  /** Attacking an opponent of the filtering player — the player, not a
   * planeswalker or battle of theirs: Blast-Furnace Hellkite's "creatures
   * **attacking your opponents** have double strike", whoever controls them.
   * `"or-their-planeswalkers"` adds a planeswalker an opponent controls
   * (rule 506.2), never a battle one protects: Roar of Resistance's
   * "creatures attacking your opponents **and/or planeswalkers they
   * control**". */
  readonly attackingOpponent?: true | "or-their-planeswalkers";
  /** Attacking the filtering source's **chosen player** (`GameObject.
   * chosenPlayer`) — the player, not a planeswalker or battle of theirs:
   * Triarch Stalker's "creatures attacking **the last chosen player** have
   * menace". With no source, or nobody chosen, nothing matches. */
  readonly attackingChosenPlayer?: true;
  /** Currently blocking — the mirror of `attacking` (Kangee, Sky Warden's
   * "blocking creatures with flying get +0/+2"). */
  readonly blocking?: boolean;
  /**
   * An **unblocked** attacking creature (rule 509.1h): attacking, with
   * blockers already declared this combat and none declared for it — or put
   * onto the battlefield attacking since (508.4d). Before blockers are
   * declared an attacker is neither blocked nor unblocked. Blockers are
   * declared as the declare blockers step begins, before anyone gets
   * priority (509.1), so from then to the end of combat. Ninjutsu's "return
   * an unblocked attacker you control" (702.49a).
   */
  readonly unblocked?: boolean;
  /** A **blocked** creature (rule 509.1h): attacking, and blocked this
   * combat — by a creature, or made blocked by an effect — and stays so
   * through the end of combat though its blockers leave (Outmaneuver's "X
   * target blocked creatures"; Smite's ruling). Not before blockers are
   * declared, where `unblocked: false` would match any attacker. */
  readonly blocked?: boolean;
  /**
   * Is (or isn't) **goaded** (rule 701.15b), by anyone and whichever way — a
   * one-shot goad, one for the rest of the game, or a static one (`goadersOf`
   * in `goad.ts`). One that has left the battlefield is asked as it last was:
   * Baeloth Barrityl's "whenever a goaded attacking or blocking creature
   * dies". Matched from inside the layer fold (a static's scope), a static
   * goad whose own scope reads power or toughness can't be seen.
   */
  readonly goaded?: boolean;
  /** Is (or isn't) goaded **by you**, whichever way (`goadersOf`). Goading
   * a creature you've already goaded has no effect (rule 701.15d), so this is
   * how "each creature goaded this way" leaves those out — Kaima, the
   * Fractured Calm counts the ones not yet goaded by you before it goads. */
  readonly goadedByYou?: boolean;
  /** Is (or isn't) **suspected** (rule 701.60 — `GameObject.suspectedAt`):
   * Nelly Borca's "goad all suspected creatures". One that has left the
   * battlefield is asked as it last was. */
  readonly suspected?: boolean;
  /** Is (or isn't) **saddled** (rule 702.171b — `GameObject.saddled`):
   * "whenever this creature attacks while saddled" (a `whileCondition` on
   * the source), "if this creature is saddled". One that has left the
   * battlefield is asked as it last was (Caustic Bronco's ruling). */
  readonly saddled?: boolean;
  /** Is (or isn't) **monstrous** (rule 701.37b — `GameObject.monstrous`):
   * "as long as this creature is monstrous, it has trample" (a static's
   * `condition: { kind: "source", filter: { monstrous: true } }`). One that
   * has left the battlefield is asked as it last was. */
  readonly monstrous?: boolean;
  /** Is (or isn't) **harnessed** (rule 701.64b — `GameObject.harnessed`):
   * "∞ — [ability]" (rule 702.186b, the `infinity` helper's condition). One
   * that has left the battlefield is asked as it last was. */
  readonly harnessed?: boolean;
  /**
   * It **saddled** the permanent applying the filter this turn (rule
   * 702.171c — `GameObject.saddledThisTurn`): Giant Beaver's "target
   * creature that saddled it this turn", The Gitrog's "sacrifice a creature
   * that saddled it this turn". "It" is the permanent as it is now, or —
   * once it has left — as it last was on the battlefield, so its records
   * outlast it (Fortune, Loyal Steed's ruling). Read against
   * `FilterContext.source` where the filter is matched with one (a target
   * or trigger filter); in an effect, `bindDynamicCompares` binds it to
   * `saddledBy` first. Without a source, nothing saddled it.
   */
  readonly saddledSource?: boolean;
  /**
   * It **crewed** the permanent applying the filter this turn (rule
   * 702.122b-c — `GameObject.crewedThisTurn`): Subterranean Schooner's
   * "target creature that crewed it this turn", Getaway Car's. Read as
   * `saddledSource` is: against `FilterContext.source` where the filter is
   * matched with one, bound to `crewedBy` in an effect's filter. A creature
   * that left the battlefield is a new object and crewed nothing.
   */
  readonly crewedSource?: boolean;
  /** `crewedSource` bound to the permanent it means — written by
   * `bindDynamicCompares`, never authored. */
  readonly crewedBy?: ObjectId;
  /** It was **crewed by** the permanent applying the filter this turn (rule
   * 702.122c — that permanent's `GameObject.crewedThisTurn`): Balthier and
   * Fran's "whenever a Vehicle crewed by Balthier and Fran this turn
   * attacks" (a trigger filter, read while the source is on the
   * battlefield). The Vehicle has to be the same object it was crewed as
   * (rule 400.7). */
  readonly crewedBySource?: boolean;
  /** It **enlisted** a creature this combat (rule 702.154c —
   * `GameObject.enlistedIn`): Aradesh, the Founder's "whenever a creature
   * you control attacks, if it enlisted a creature this combat" (an
   * intervening-if on the trigger object). One that has left the
   * battlefield is a new object and enlisted nothing. */
  readonly enlistedThisCombat?: boolean;
  /** `saddledSource` bound to the permanent it means — written by
   * `bindDynamicCompares`, never authored. */
  readonly saddledBy?: ObjectId;
  /**
   * It's an attacking creature **banded with** the permanent applying the
   * filter (rule 702.22 — `GameObject.band`): Icatian Skirmishers' "all
   * creatures banded with it gain first strike", Camel's "creatures banded
   * with this creature". Never the permanent itself. Read against
   * `FilterContext.source`; in an effect, `bindDynamicCompares` binds it to
   * `bandedWith` first.
   */
  readonly bandedWithSource?: boolean;
  /** `bandedWithSource` bound to the permanent it means — written by
   * `bindDynamicCompares`, never authored. */
  readonly bandedWith?: ObjectId;
  /**
   * It's in a **blocking relation** with the permanent applying the filter,
   * with the permanent that one is attached to (`of: "host"`), or with the
   * object its trigger names (`of: "trigger-object"`) — the partner:
   * - `"blocking"`: it's blocking the partner (Goblin Javelineer's "target
   *   creature blocking it", Plasma Caster's "target creature that's blocking
   *   equipped creature", Battle-Scarred Goblin's "each creature blocking
   *   it");
   * - `"blocked-by"`: the partner is blocking it (Tinder Wall's "target
   *   creature it's blocking", Wall of Nets' "all creatures blocked by this
   *   creature");
   * - `"either"`: Kjeldoran Frostbeast's "all creatures blocking or blocked
   *   by this creature".
   *
   * Read through `blockedAttackersOf` (a band blocked is blocked whole, rule
   * 702.22h): a creature removed from combat is in no relation (rule 506.4),
   * and an attacker stays blocked by a blocker that left — the blocker's
   * relations are then read off its last-known information (rules 608.2b,
   * 608.2h): Tinder Wall sacrificed to its own ability still finds the
   * creature it was blocking. The matched creature itself must be on the
   * battlefield and still in combat. Read against `FilterContext.source`; in
   * an effect, `bindDynamicCompares` binds the partner to `with` first.
   */
  readonly blockingRelation?: {
    readonly relation: "blocking" | "blocked-by" | "either";
    /** Whose relation: the source itself (the default), its host — the
     * permanent it's attached to now, or was as it left — or the trigger
     * object: Trailblazer's Torch's "whenever equipped creature becomes
     * blocked, it deals 2 damage to each creature blocking it", Ib Halfheart's
     * sacrificed Goblin (read as it last was, rule 608.2h), Labyrinth Raptor's
     * "a creature of their choice that's blocking it". `"trigger-object"` is
     * an effect's filter alone: only a resolving ability has a trigger object
     * to bind, so anywhere else (a target slot's filter) it matches nothing. */
    readonly of?: "source" | "host" | "trigger-object";
    /** The partner, bound by `bindDynamicCompares` — never authored. */
    readonly with?: ObjectId;
  };
  /**
   * How many creatures are **blocking it** now, each token of a blocking stack
   * counting (`creaturesBlocking`) — Rampaging Cyclops's "as long as two or
   * more creatures are blocking it", Grizzled Wolverine's "only if at least
   * one creature is blocking this creature", as `{ kind: "source", filter }`.
   * Not `blocked`, which stays true once its blockers have gone (rule 509.1h).
   */
  readonly blockerCount?: NumCompare;
  /**
   * It **blocked**, or **was blocked**, this turn (rules 509.1g-h) — the
   * look-back `blockingRelation` can't give, kept in
   * `TurnHistory.blocks`, so it holds after combat, after a creature is removed
   * from combat (506.4) and after the other creature has gone:
   * - `relation`: `"blocked"` (Sizzling Barrage's "creature that blocked this
   *   turn"), `"blocked-by"` (Glyph of Doom's "creatures that were blocked by
   *   that creature"), or `"either"`;
   * - `partner`: the other creature matched this filter **as it was at the
   *   block** — You Cannot Pass!'s "a legendary creature", Time to Reflect's "a
   *   Zombie", Sea Troll's "a blue creature" — as a journal entry's `was`
   *   reads what entered;
   * - `of`: the other creature was this one — a target slot (Venomous Breath's
   *   "that blocked or were blocked by it"), `"each-target"` (Triton Tactics'
   *   "one of those creatures") or `"source"` (Joven's Ferrets' "that blocked
   *   this creature"). `bindDynamicCompares` binds it to `with` as the effect
   *   applies; a `delayed-trigger` binds it as it's set up, so "it" stays the
   *   object meant though it has left since (rule 400.7), and the delayed
   *   ability, having no target of its own, can't fizzle for that. Unbound it
   *   matches nothing;
   * - `thisCombat`: only this combat phase's blocks (Ride Down).
   *
   * Each side of a block is the object it was then: one that left the
   * battlefield and came back never blocked (400.7). A creature put onto the
   * battlefield blocking never "blocked" (509.4). A band blocked is blocked
   * whole (702.22h).
   */
  readonly blockedThisTurn?: {
    readonly relation: "blocked" | "blocked-by" | "either";
    readonly partner?: CardFilter;
    readonly of?: number | "each-target" | "source";
    /** The objects `of` means, bound by `bindDynamicCompares` — never authored. */
    readonly with?: readonly { readonly object: ObjectId; readonly stint: number }[];
    readonly thisCombat?: boolean;
  };
  /**
   * It's (or isn't) the permanent the one applying the filter is **attached
   * to** — an Aura's "enchanted creature", an Equipment's "equipped
   * creature": Arrest's "its activated abilities can't be activated" is a
   * `prohibits.abilitiesOf` of `{ hostOfSource: true }`, which no other Aura
   * the same player controls matches (as `enchantedBy` would). Read against
   * `FilterContext.source` as it is now; without a source, or one attached to
   * nothing, nothing matches.
   */
  readonly hostOfSource?: boolean;
  /**
   * It is (or isn't) the one applying the filter itself — `FilterContext.
   * source`. Mostly inside `attachedTo`: Goblin Gaveleer's "+2/+0 for each
   * Equipment **attached to it**" counts `{ subtype: "Equipment",
   * attachedTo: { isSource: true } }`, Kemba, Kha Regent's upkeep trigger the
   * same. Without a source, nothing is it.
   */
  readonly isSource?: boolean;
  /** The object `isSource` and `sameNameAsSource` mean, in an effect's
   * filter, however that filter is then matched: bound by
   * `bindDynamicCompares`, never authored. */
  readonly appliedBy?: ObjectId;
  /**
   * With `sameNameAsTarget`: the namesakes must be tokens, the target itself
   * needn't be — Legions to Ashes' "exile target nonland permanent an opponent
   * controls **and all tokens** that player controls with the same name as
   * that permanent", one `exile-all`.
   */
  readonly sameNameTokensOnly?: true;
  /**
   * It's a double-faced card or token (rule 712.1: nonmodal, modal or a meld
   * card), asked of what physically represents it, whichever face is up —
   * Overgrown Pest's "a land **or double-faced card**", Nick Fury's "if it's a
   * double-faced card, you may transform it". A permanent that's a copy of one
   * isn't, unless it's a token copy (707.8a), which is made with its faces.
   */
  readonly doubleFaced?: true;
  /** `sameNameAsTarget` / `sameNameAsTriggerObject` bound — written by `bindDynamicCompares`, never
   * authored: the target itself, and the name it has (`null` for none — a
   * face-down permanent, rule 708.2a — which nothing else shares, 201.2a). */
  readonly sameNameAs?: { readonly object: ObjectId; readonly names: readonly string[] };
  /**
   * Has (`true`) or doesn't have (`false`) the same name as the object
   * applying the filter — `FilterContext.source`, as it is now (rule 201.2a)
   * — Marvin, Murderous Mimic's "creatures you control **that don't have the
   * same name as this creature**". A nameless object (face down, rule 708.2a)
   * shares a name with nothing; without a source, nothing has its name.
   */
  readonly sameNameAsSource?: boolean;
  /**
   * Has the same name as one of the objects a `ShareReference` names (rule
   * 201.2a: one name in common is enough — a split card's either half; an
   * object with no name shares it with nothing) — a reference object itself
   * included: Cylian Sunsinger's "this creature and each other creature with
   * the same name as it" is `{ type: "creature", sameNameWith: "source" }`;
   * "another" goes in the reference's filter (Pattern Matcher's "a card with
   * the same name as another creature you control" is `{ controlled: { type:
   * "creature", isSource: false } }`). In an effect every reference is bound
   * to `sameNameAsAny` as it applies (`bindDynamicCompares`); elsewhere — a
   * static's prohibition, a trigger's filter — `"source"`,
   * `"exiled-with-source"` (Ixalan's Binding's "your opponents can't cast
   * spells with the same name as the exiled card"), `{ controlled }`, `{
   * permanents }` (Cornered Market's "a nontoken permanent") and `{ graveyard
   * }` (Pyromancer Ascension's "a card in your graveyard") are read live off
   * `FilterContext.source` and `.you`, and the others match nothing. Fails
   * closed inside the layer fold, but a static's count isn't in the fold:
   * Strata Scythe's "+1/+1 for each land on the battlefield with the same name
   * as the exiled card" reads it live.
   */
  readonly sameNameWith?: ShareReference;
  /**
   * Has the same name as **another** permanent matching this filter (`{}` for
   * any) — Eye of Singularity's "destroy each permanent with the same name as
   * another permanent" (rule 201.2a). Read live against the battlefield, so
   * a mass effect asks it of everything before anything moves. The tokens of
   * one stack are each their own permanent (rule 111.1), so a stack of two has
   * the same name as another permanent. Fails closed inside the layer fold.
   */
  readonly sameNameAsAnother?: CardFilter;
  /** `sameNameWith` bound — the names, never authored. (Haunting Echoes'
   * "for each card exiled this way, search … for all cards with the same name
   * as that card" is `sameNameWith: { thisWay: "exiled" }`: one search for
   * every such name, rule 701.23h.) */
  readonly sameNameAsAny?: readonly string[];
  /** `sharesColorWithTarget` bound — written by `bindDynamicCompares`, never
   * authored: the target itself, and its colors. */
  readonly sharesColorBound?: { readonly objects: readonly ObjectId[]; readonly colors: readonly Color[] };
  /**
   * Shares a color with the objects a reference names (rule 105.2): Spreading
   * Plague's "all other creatures that share a color with it" is
   * `sharesColorWith: "trigger-object"`, radiance's "and each other creature
   * that shares a color with it" `sharesColorWith: 0`, Konda's Banner's
   * "creatures that share a color with equipped creature" `sharesColorWith:
   * "attached"`. The reference objects match themselves. A resolution binds it
   * as it applies (`sharesColorBound`); a static reads `"source"` and
   * `"attached"` live.
   */
  readonly sharesColorWith?: ShareReference;
  /**
   * It has the greatest `of` among the battlefield permanents **its
   * controller** controls that match `among` — ties all count: "each
   * opponent sacrifices a creature with the greatest power among creatures
   * that player controls" (Crackling Doom, Will of the Abzan) is a
   * `sacrifice` of `{ type: "creature", greatestAmongItsController: { of:
   * "power", among: { type: "creature" } } }`, the controller choosing among
   * the tied. A per-player maximum, so it's asked of each permanent against
   * its own controller's, live; an object that isn't on the battlefield
   * never matches.
   */
  readonly greatestAmongItsController?: { readonly of: AggregateOf; readonly among: CardFilter; readonly least?: true };
  /**
   * It has the greatest `of` of everything in **its zone** that matches
   * `among`, ties all counted: no other has more. On the battlefield that's
   * one comparison over every permanent, whoever controls it — Topple's
   * "target creature with the greatest power among creatures on the
   * battlefield", Getaway Glamer's "if no other creature has greater power",
   * Favor of the Mighty's "each creature with the greatest mana value" — and
   * in a graveyard, over that graveyard — Desecrator Hag's "the creature card
   * in your graveyard with the greatest power". The object itself needn't
   * match `among`, so say what it is beside this clause; anything in another
   * zone never matches.
   *
   * Something that has left the battlefield is read as it last existed there
   * (rule 608.2h) against the battlefield as it is now. Inside the layer fold
   * only mana value and counters can be compared: P/T isn't known there, so
   * `power` and `toughness` don't match, and a static needs a condition or an
   * effect's filter for those.
   */
  readonly greatestInZone?: {
    readonly of: AggregateOf;
    readonly among: CardFilter;
    /** "Greater than each other creature's power" (Selvala, Heart of the
     * Wilds): a tie doesn't count, nor does another token of its stack. */
    readonly strictly?: true;
    /** The **least** instead: nothing else in its zone that matches has less
     * (Witch-king's "least power among creatures they control", Porphyry
     * Nodes' "the creature with the least power"). */
    readonly least?: true;
  };
  readonly power?: NumCompare;
  readonly toughness?: NumCompare;
  /** Its power plus its toughness — "creature with total power and
   * toughness 5 or less" (Cut Down), read as `power` and `toughness` are. */
  readonly totalPowerToughness?: NumCompare;
  /**
   * Base power / base toughness (rule 613.4b) — Duskana, the Rage Mother's
   * "each creature you control with base power and toughness 2/2" is both,
   * `{ op: "eq", n: 2 }`. The printed values, or what a characteristic-
   * defining ability or an effect that sets them made them ("becomes a 4/4",
   * "has base power and toughness 2/2"), before counters and every "+N/+N" —
   * see `Characteristics.basePower`. Like `power`, can't be answered from
   * inside the layer fold (a static's scope) and fails closed there.
   */
  readonly basePower?: NumCompare;
  readonly baseToughness?: NumCompare;
  /**
   * Has (or hasn't) a mana ability (rule 605.1) — activated or triggered, its
   * own or granted: Raggadragga, Goreguts Boss's "each creature you control
   * **with a mana ability** gets +2/+2". See `characteristics.ts`'s
   * `hasManaAbility`. Answered inside the layer fold too, so a static may be
   * scoped by it.
   */
  readonly hasManaAbility?: boolean;
  /**
   * Has any ability at all (rule 113) — `false` is "with **no abilities**"
   * (Jasmine Boreal of the Seven): no keyword, ability or spell instructions
   * of its own (unless it lost them) and none granted to it. See
   * `characteristics.ts`'s `hasAnyAbility`. A granted keyword can come from
   * any static, so this can't be answered from inside the layer fold and
   * fails closed there.
   */
  readonly hasAbilities?: boolean;
  /**
   * Has (or hasn't) `{X}` in its mana cost — Zaxara, the Exemplary's "a spell
   * **with {X} in its mana cost**". The mana cost of what it is now: a copy's
   * is the copied card's, and the back face of a transformed permanent has
   * none (rule 712.8e — only its mana *value* comes from the front).
   */
  readonly xInManaCost?: boolean;
  /** Its mana cost is exactly one of these, as printed — Urza's Saga's "an
   * artifact card with mana cost {0} or {1}" is `["{0}", "{1}"]`: not {U},
   * not {X}, not no mana cost at all (its ruling), whatever the mana value.
   * Read from the same mana cost as `xInManaCost`. */
  readonly manaCost?: readonly string[];
  /**
   * How many coloured mana symbols are in its mana cost — Omnath, Locus of
   * All's "three or more colored mana symbols in its mana cost" is `{ op:
   * "gte", n: 3 }`. A hybrid or Phyrexian symbol is one coloured symbol
   * (rules 107.4e–f), `{2/W}` included; `{C}`, `{X}`, generic and snow
   * symbols aren't coloured. Read from the same mana cost as `xInManaCost`.
   */
  readonly coloredManaSymbols?: NumCompare;
  /**
   * How many card types it has — Rendmaw, Creaking Nest's "a card with **two
   * or more card types**" is `{ op: "gte", n: 2 }`: an artifact creature, an
   * enchantment creature, a land creature. Its current types, like `type`.
   */
  readonly cardTypeCount?: NumCompare;
  /**
   * Its name is different from the name of every battlefield permanent
   * matching this filter (rule 201.2c) — Light-Paws, Emperor's Voice's "an
   * Aura card … **with a different name than each Aura you control**" is `{
   * subtype: "Aura", controlledBy: "you" }`, matched from the same "you".
   * True when nothing matches. A permanent that matches it itself shares its
   * own name, so never qualifies. Can't be answered from inside the layer fold
   * and fails closed there.
   */
  readonly nameDiffersFromEach?: CardFilter;
  /**
   * Its name is different from each *other* battlefield permanent matching
   * `others` and each card in a graveyard matching `graveyard` (rule
   * 201.2c) — Guardian Project's "if it doesn't have the same name as
   * another creature you control or a creature card in your graveyard" is `{
   * others: { type: "creature", controlledBy: "you" }, graveyard: { type:
   * "creature", ownedBy: "you" } }`. Unlike `nameDiffersFromEach`, the
   * object itself is never one of the others. Fails closed inside the layer
   * fold.
   */
  readonly nameUnlike?: { readonly others?: CardFilter; readonly graveyard?: CardFilter };
  /**
   * Is of the creature type chosen for the permanent applying the filter (its
   * `chosenCreatureType`, via `FilterContext.source`) — Morophon, the
   * Boundless's "other creatures you control **of the chosen type** get
   * +1/+1". A changeling is of whatever type was chosen. With no source, or
   * nothing chosen for it yet, nothing matches.
   */
  readonly ofChosenType?: true;
  /**
   * Is of the colour chosen for the permanent applying the filter (its
   * `chosenOnEnter`, when that is a colour — `chooseOnEnter` over the
   * colours, via `FilterContext.source`): Pentarch Paladin's "target
   * permanent **of the chosen color**", Curse of Wizardry's "a spell of the
   * chosen color", Psychic Allergy's "nontoken permanents of the chosen
   * color". A source that has left the battlefield reads the colour it had
   * (rule 608.2h). With no source, or no colour chosen for it, nothing
   * matches — a colourless object never does (rule 105.2c).
   */
  readonly ofChosenColor?: true;
  /**
   * It's **only the color its controller chose** in this resolution's
   * `vote` (with `choose`) — Selective Obliteration's "exile each permanent
   * unless it's colorless or it's only the color its controller chose": one
   * colour, and the one whose option its controller picked, option `i`
   * being colour `i` of this list. A multicoloured or colourless object, or
   * one whose controller chose nothing, doesn't match.
   */
  readonly onlyColorItsControllerChose?: readonly Color[];
  /**
   * Has this name (rule 201.2) — one of its names, so either half of a split
   * card (709.4a). What a chosen name becomes in a resolving effect: `{
   * hasName: CHOSEN_CARD_NAME }` in a `choose-card-name`'s `then` is "a card
   * with the chosen name" (Memoricide). A face-down object has no name and
   * never matches.
   */
  readonly hasName?: string;
  /**
   * Has a name chosen for the permanent applying the filter (its
   * `chosenNames`, via `FilterContext.source`) — Pithing Needle's "sources
   * with the chosen name", Day of the Moon's "a name chosen for this
   * enchantment". A source that has left reads the names it had (rule
   * 608.2h). With no source, or nothing chosen yet, nothing matches.
   */
  readonly chosenName?: true;
  /** Controlled by the filtering player (`"you"`), anyone else
   * (`"opponent"`), or whoever's turn it is (`"active-player"` — "creatures
   * **the active player** controls", "each creature attacking player
   * controls" outside combat). The active player is read off the state, so
   * it is the same answer whoever is asking. `"chooser"`: the player
   * choosing the target this filter is on, when that isn't the filtering
   * player (rule 601.2c) — "target creature of an opponent's choice **they
   * control**" (Evangelize, `CardDefinition.opponentChoosesTargets`); with
   * no such chooser (`FilterContext.chooser`), nothing matches.
   * `"enchanted-player"`: the player the filter's source, an Aura, is attached
   * to (a Curse's "creatures **enchanted player controls**" — Curse of Death's
   * Hold); with no such source, nothing matches. `"chosen-player"`: the
   * filter's source's chosen player (`GameObject.chosenPlayer`, as it last
   * existed if it has left — rule 608.2h): Stalking Leonin's "if it's
   * controlled by the chosen player". `"monarch"`: the monarch (rule 725),
   * nobody's while there is none: Fall from Favor's "unless that player is the
   * monarch", about the enchanted creature's controller. */
  readonly controlledBy?: "you" | "opponent" | "active-player" | "chooser" | "enchanted-player" | "chosen-player" | "monarch";
  /** Controlled by one of these players — set by the engine, never authored:
   * a protection grant's "creatures **your opponents** control" fixed to the
   * players they were as it resolved (`grant-protection`). */
  readonly controllerIn?: readonly PlayerId[];
  /** In a delayed ability's effect: controlled by this player **as the
   * delayed ability is set up**, whoever that is by the time it resolves —
   * Siren's Call's "that player", the active player then, though the next end
   * step may fall on another's turn. Bound to `controllerIn` at setup
   * (`bindSetUpPlayers`); unbound it matches nothing. */
  readonly controlledByAsSetUp?: "active-player";
  /** "A creature **whose controller has eight or more cards in their
   * graveyard**" (Lullmage's Domination's `targetCostReduction`). */
  readonly controllerGraveyardAtLeast?: number;
  /** Its controller's running total of a {@link TurnStat} this turn is at
   * least `atLeast` (1): the creatures of "each opponent **who cast a spell
   * this turn** can't attack with creatures" (Angelic Arbiter). Read from the
   * journal, so what the player did before the asking permanent arrived
   * counts (its ruling). */
  readonly controllerThisTurn?: TurnDid;
  /** Its controller has at least `atLeast` (1) things in one of their journal
   * lists (`JournalWhat`; `window` default this turn), each matching `filter`
   * as it was then, from the filtering player's side — "target nonland
   * permanent controlled by **a player who was dealt combat damage by three
   * or more Pirates this turn**" is `{ what: "combat-damaged-by", filter: {
   * subtype: "Pirate" }, atLeast: 3 }` (Admiral Beckett Brass). The count is
   * the `turn-history` condition's (`journalCount`), asked of that one
   * player: what happened before the asking permanent arrived counts, and so
   * does a source that has since left or changed (its ruling). */
  readonly controllerTurnHistory?: {
    readonly what: JournalWhat;
    readonly filter?: CardFilter;
    readonly atLeast?: number;
    readonly window?: JournalWindow;
  };
  /** A battle protected by the filtering player / anyone else (rule 310.8) —
   * Portent Tracker's "if **an opponent protects** it". Nothing that has no
   * protector matches either. */
  readonly protectedBy?: "you" | "opponent";
  /** Owned by the filtering player / anyone else (zone-agnostic, for graveyards). */
  readonly ownedBy?: "you" | "opponent";
  /** Owned by the one player a {@link PlayerRef} names, whoever chooses —
   * Expropriate's "for each money vote, choose a permanent **owned by the
   * voter**" (`"that-player"` in a `for-each-vote`). Bound to `ownerIn` as an
   * effect applies, as `controlledByRef` is; unbound, it matches nothing. */
  readonly ownedByRef?: PlayerRef;
  /** Owned by one of these players — `ownedByRef` bound, never authored. */
  readonly ownerIn?: readonly PlayerId[];
  /** Its controller isn't its owner (rule 108.4) — read from the object's
   * side, not the filtering player's: Gonti, Night Minister's "whenever a
   * player casts **a spell they don't own**". */
  readonly notOwnedByController?: true;
  readonly keyword?: Keyword;
  /** Must NOT have this keyword (Magmaquake: "each creature without flying" —
   * needed-cards P13). */
  readonly notKeyword?: Keyword;
  readonly tapped?: boolean;
  readonly token?: boolean;
  /** Is (or isn't) a commander (rule 903.3) — Fierce Guardianship's "if you
   * control a commander" gate. */
  readonly isCommander?: boolean;
  /** Must NOT have this supertype — "nonlegendary", "nonbasic". */
  readonly notSupertype?: Supertype;
  /** Must NOT be this card — "a card not named …". */
  readonly notName?: string;
  /** Is (or isn't) face down (rule 708) — manifested, cloaked, or cast face
   * down with morph or disguise: "whenever a face-down creature you control
   * enters" (Kadena, Trail of Mystery) is `{ type: "creature", faceDown:
   * true }`. A face-down spell on the stack counts too, and a snapshot says
   * whether it was face down — a spell as cast (Kadena's "the first
   * face-down creature spell you cast each turn"), a permanent as it left. */
  readonly faceDown?: boolean;
  /** Has an Equipment attached to it, whoever controls the Equipment (rule
   * 301.5). */
  readonly equipped?: boolean;
  /** How many Equipment are attached to it, whoever controls them — Balan,
   * Wandering Knight's "as long as **two or more Equipment are attached to
   * it**" is `{ op: "gte", n: 2 }` (a `source` condition). Read on the
   * battlefield only: off it (a last-known snapshot) it fails closed. */
  readonly equipmentAttached?: NumCompare;
  /** Is (or isn't) the filtering player's **Ring-bearer** (rule 701.54e) —
   * "if Frodo is your Ring-bearer", "unless Sauron is your Ring-bearer".
   * `"any"` is any player's Ring-bearer — Lord of the Nazgûl's "protection
   * from **Ring-bearers**". */
  readonly ringBearer?: boolean | "any";
  /** Is (or isn't) paired with another creature by soulbond (rule 702.95b) —
   * soulbond's "if … both are **unpaired**" is `paired: false`. Read on the
   * battlefield only: off it, never paired. */
  readonly paired?: boolean;
  /** Is (or isn't) prepared (rule 722.3a) — Woodwork Prodigy's "if this
   * creature isn't prepared". Read on the battlefield only: off it, never. */
  readonly prepared?: boolean;
  /** Is (or isn't) a spell cast as a prepared permanent's copy of its prepare
   * spell (rule 722.3c, `GameObject.preparedSpell`) — "whenever you cast a
   * prepared spell" (Codie, Ravenous Codex). */
  readonly preparedSpell?: boolean;
  /** Is (or isn't) a card that has an Adventure (rule 715.2a) — Edgewall
   * Inn's "target card that has an Adventure", Howling Galefang's "a card in
   * exile that has an Adventure". */
  readonly hasAdventure?: boolean;
  /** Is (or isn't) a suspended card (rule 702.62b: in exile, with suspend, with
   * a time counter on it) — Shivan Sand-Mage's "target permanent or suspended
   * card", Amy Pond's "a suspended card you own". */
  readonly suspended?: boolean;
  /** Is (or isn't) a spell: on the stack as a card or a copy, or being cast
   * (`FilterContext.asSpell`). A protection's "from instant spells" (rule
   * 702.16a — Devoted Caretaker) is not "from instants": a permanent, even
   * one that was cast, and an ability aren't spells (the Emrakul, the Aeons
   * Torn ruling), nor is an Aura put onto the battlefield. */
  readonly isSpell?: boolean;
  /** A spell on the stack that was kicked (rule 702.33d — its kicker cost was
   * paid as it was cast; a copy of it is kicked too, 707.10): "whenever you
   * cast a kicked spell" (Roost of Drakes). Nothing off the stack is a kicked
   * spell. */
  readonly kicked?: boolean;
  /** Has (or hasn't) toxic (rule 702.164) — printed or granted: "another
   * creature you control with toxic" (Slaughter Singer), "if that creature
   * has toxic" (Hexgold Slash). Read on the battlefield; not on a snapshot. */
  readonly hasToxic?: boolean;
  /** Has this keyword in any of its variants, printed or granted — "if it
   * has hexproof … protection" (Akroma, Vision of Ixidor), where `keyword`
   * asks for the plain ability alone: `"hexproof"` is hexproof or any
   * "hexproof from [quality]" (rule 702.11d: a hexproof ability),
   * `"protection"` any "protection from [quality]" (rule 702.16a). Read on
   * the battlefield; a snapshot keeps only its plain keywords. */
  readonly keywordVariant?: "hexproof" | "protection";
  /** Has an Aura attached to it, whoever controls the Aura (rule 303.4). */
  readonly enchanted?: boolean;
  /** Is itself attached to a permanent matching this filter — an Aura or
   * Equipment on something: Conqueror's Flail's "as long as this Equipment
   * is attached to a creature" is `{ attachedTo: { type: "creature" } }`
   * (a `source` condition). The host is matched as it is now. */
  readonly attachedTo?: CardFilter;
  /**
   * Has permanents attached to it: at least `atLeast` (one) matching `filter`,
   * whoever controls them. Daybreak Coronet's "enchant creature with **another
   * Aura attached to it**" and Face of Divinity's "as long as another Aura is
   * attached to enchanted creature" are `otherThanSource` (the one applying the
   * filter doesn't count itself); Bride's Gown's "an Equipment named Groom's
   * Finery is attached to a creature you control" a `controls` of a creature
   * with this. Read as it is now: one that has left has nothing attached.
   */
  readonly attachments?: {
    readonly filter?: CardFilter;
    readonly atLeast?: number;
    readonly otherThanSource?: true;
  };
  /**
   * Is attached to the object or player in this target slot — "return target
   * creature and all Auras attached to it" (Hubris), "destroy all Equipment
   * attached to that creature" (Blastfire Bolt), "all Auras attached to
   * target land" (Street Sweeper). An effect's filter only: bound to
   * `attachedToRef` as the effect applies (`bindDynamicCompares`), to the
   * target as it is then — a slot illegal as it resolves (rule 608.2b) or
   * left empty matches nothing. Write the attachments' step before the one
   * that moves the target in a simultaneous `sequence` ("… and all Auras
   * attached to it"), so they're read while still attached. Unbound,
   * anywhere nothing could answer it, it matches nothing.
   */
  readonly attachedToObject?: ObjectRef;
  /** `attachedToTarget` bound — written by `bindDynamicCompares`, never
   * authored; `null` matches nothing. Matched on the battlefield, against
   * `GameObject.attachedTo` / `attachedToPlayer`. */
  readonly attachedToRef?: TargetRef | null;
  /** Controlled by the one player a {@link PlayerRef} names: "all lands **that
   * player** controls", "the number of Swamps target player controls". Bound
   * to `controllerIn` as an effect applies; unbound, it matches nothing. */
  readonly controlledByRef?: PlayerRef;
  /**
   * Has a keyword ability, read off its text box (rule 702): the abilities a
   * definition holds in fields of their own, not the ones the layers compute
   * (`keyword`). `"morph"` is morph or megamorph; one row of
   * `CARD_KEYWORD_READS` each, so a new keyword is a row.
   */
  readonly hasKeyword?: CardKeyword;
  /**
   * Has an activated ability (rule 602): with `mana: false`, one that isn't a
   * mana ability (rule 605.1a) — Ravager Wurm's "target land with an activated
   * ability that isn't a mana ability"; `mana: true`, one that is. With
   * `tapCost: true`, one with the {T} symbol in its cost (rule 107.5) —
   * Magewright's Stone's "a creature that has an activated ability with {T} in
   * its cost"; a cost that taps other permanents ("tap an untapped creature
   * you control") doesn't count, per its ruling.
   */
  readonly hasActivatedAbility?: { readonly mana?: boolean; readonly tapCost?: boolean };
  /** Above the applying permanent in its owner's graveyard (rule 404.2: a
   * graveyard keeps its order): Nether Shadow's "with three or more creature
   * cards above it". The top is the card put there last. */
  readonly aboveSourceInGraveyard?: true;
  /**
   * Was attached to this object — the ability's source, or the object its
   * trigger fired on — as it is now, or as it last existed on the
   * battlefield once it has left (rule 608.2h; `LastKnownInfo.attachments`):
   * Zack Fair's "attach an Equipment **that was attached to Zack Fair**" (he
   * was sacrificed to pay for it), Rhuk, Hexgold Nabber's "all Equipment
   * attached to **that creature**" when it dies. Only the same objects still
   * on the battlefield (rule 400.7) — an Equipment that has left and come
   * back is a new one. An effect's filter only: bound to `wasAttachedToAny`
   * as the effect applies (`bindDynamicCompares`); unbound, it matches
   * nothing.
   */
  readonly wasAttachedTo?: "source" | "trigger-object";
  /** `wasAttachedTo` bound — written by `bindDynamicCompares`, never
   * authored: each object attached, in the stint it was attached in. */
  readonly wasAttachedToAny?: readonly AttachmentRecord[];
  /** Is an Aura attached to a **player** (rule 303.4) — `"you"` the
   * filter's `you` (Witchbane Orb's "all Curses attached to you"),
   * `"opponent"` one of their opponents. */
  readonly attachedToPlayer?: "you" | "opponent";
  /** Has an Aura attached to it that **you** control — Eriette of the
   * Charmed Apple's "each creature that's enchanted by an Aura you
   * control". */
  readonly enchantedBy?: "you";
  /**
   * Is **modified** (rule 700.9): has a counter of any kind on it, is
   * equipped, or is enchanted by an Aura its *own controller* controls
   * (Chishiro, the Shattered Blade). An opponent's Aura doesn't count; an
   * opponent's Equipment does.
   */
  readonly modified?: boolean;
  /**
   * Is (or isn't) a card in a graveyard that was put there **from a library
   * this turn** — Captain N'ghathrod's "target artifact or creature card in an
   * opponent's graveyard that was put there from a library this turn". Milling
   * is the usual way; surveil and other library-to-graveyard moves count too,
   * and a discarded or destroyed card never does. See
   * `GameObject.putIntoGraveyardOn`.
   */
  readonly putIntoGraveyardFromLibraryThisTurn?: boolean;
  /**
   * Is a card in a graveyard that was put there **this turn**, from one of
   * `from`'s zones or (without `from`) from anywhere — "creature cards in
   * your graveyard that were put there from the battlefield this turn"
   * (Grim Return, Thrilling Encore, Wreck Hunter: `{ from: ["battlefield"]
   * }`), "a permanent card in your graveyard that was put there from
   * anywhere this turn" (Night Nurse: `{}`). A card that died this turn and
   * was put back into the graveyard from somewhere else since is a new object
   * (rule 400.7), put there from that zone. A permanent that left the
   * battlefield is asked as a card in its graveyard; one read through a
   * snapshot (it has left the graveyard too) never matches. See
   * `GameObject.putIntoGraveyardOn`.
   */
  readonly putIntoGraveyardThisTurn?: { readonly from?: readonly ZoneType[] };
  /**
   * Is (or isn't) a card that was discarded this turn and hasn't changed
   * zones since — Shadow of the Grave's "all cards in your graveyard that you
   * cycled or discarded this turn" (cycling discards, rule 702.29a), Ghost of
   * Ramirez DePietro's "a card in a graveyard that was discarded or put there
   * from a library this turn" (`anyOf` with the field above). A card that
   * leaves its graveyard and comes back is a new object (rule 400.7) and
   * wasn't. See `GameObject.discardedOnTurn`.
   */
  readonly discardedThisTurn?: boolean;
  /** Is (or isn't) a card that was **milled** this turn and hasn't changed
   * zones since — Tato Farmer's "target land card in a graveyard that was
   * milled this turn". Narrower than `putIntoGraveyardFromLibraryThisTurn`:
   * a surveilled card wasn't milled. See `GameObject.milledOnTurn`. */
  readonly milledThisTurn?: boolean;
  /** Drawn this turn (or not), and where the draw put it since: Sylvan
   * Library's "cards in your hand drawn this turn" (`GameObject.drawnOnTurn`). */
  readonly drawnThisTurn?: boolean;
  /** Entered the battlefield this turn (or didn't) — "creatures that entered
   * this turn", "a creature that didn't enter this turn". A card anywhere
   * but the battlefield hasn't; one that has left is asked as it last was. */
  readonly enteredThisTurn?: boolean;
  /** Was turned face up this turn, by anyone (rule 701.40b) — Kaust, Eyes of
   * the Glade's "a creature you control that was turned face up this turn". */
  readonly turnedFaceUpThisTurn?: boolean;
  /** Its controller has (or hasn't) controlled it continuously since their
   * most recent turn began — rule 302.6's test, read of a permanent of any
   * type and whether or not it has haste: Rocket Launcher's "you've
   * controlled this artifact continuously since the beginning of your most
   * recent turn". With `controlledBy: "active-player"` that turn is this one:
   * Nettling Imp's "creature the active player has controlled continuously
   * since the beginning of the turn". Battlefield only: off it (a last-known
   * snapshot) nothing has been. */
  readonly controlledContinuously?: boolean;
  /** Its controller has (or hasn't) controlled it continuously since **this
   * turn** began, whoever's turn it is — Siren's Call's "didn't control
   * continuously since the beginning of the turn". On the controller's own
   * turn it's `controlledContinuously`; on another's, one they gained during
   * their last turn has been theirs since this one began. Battlefield only. */
  readonly controlledSinceTurnBegan?: boolean;
  /** Is (or isn't) renowned (rule 702.112b) — renown's "if it isn't
   * renowned", "as long as this creature is renowned" (Goblin Glory Chaser),
   * "if it's renowned" (Consul's Lieutenant). Asked like `monstrous`. */
  readonly renowned?: boolean;
  /** Was declared as an attacker this turn (or wasn't) — Kratos, God of
   * War's "creatures that player controls that didn't attack this turn". A
   * permanent that left the battlefield and came back is a new object that
   * hasn't; one that has left is asked as it last was. */
  readonly attackedThisTurn?: boolean;
  /**
   * It appears in the journal (`journal.ts`) — this object, in the stint it's
   * in now (or last had): "each creature you control that you've put one or
   * more +1/+1 counters on this turn" (Kid Loki: `{ what: "counters-put", by:
   * "you", counter: "+1/+1" }`), "all creature cards in your graveyard that
   * were put there from anywhere this turn" (Garna, the Bloodflame: `{ what:
   * "to-graveyard" }`), "the first time that creature has become tapped this
   * turn" (Captain America: `{ what: "tapped", atMost: 1 }`). A card a move
   * put where it is now is the object that arrived (rule 400.7), so a card
   * put into a graveyard, returned and put there again counts once. `by`
   * narrows to the entries in its controller's own record ("you've put"),
   * the filter's `you`; `atLeast` (default 1) and `atMost` count entries.
   * `thisCombat` keeps only the entries of the combat phase under way (an
   * attack's or a block's, rule 506.1): "if that creature had to attack this
   * combat" (Firkraag, Cunning Instigator: `{ what: "had-to-attack",
   * thisCombat: true }`).
   */
  readonly journaled?: {
    readonly what: JournalWhat;
    readonly window?: JournalWindow;
    readonly by?: "you";
    readonly counter?: string;
    readonly thisCombat?: true;
    readonly atLeast?: number;
    readonly atMost?: number;
  };
  /** Was declared as an attacker in this combat phase (or wasn't): the
   * Clockwork creatures' "if this creature attacked or blocked this combat",
   * an `anyOf` with `blockedThisTurn`'s `{ relation: "blocked", thisCombat:
   * true }`. It stays so though it has since left combat (rule 506.4), and a
   * creature put onto the battlefield attacking never did (508.4). One that
   * has left is asked as it last was. */
  readonly attackedThisCombat?: boolean;
  /** Was declared as an attacker attacking the filtering player this turn —
   * the player, not a planeswalker or battle of theirs (the O-Kagachi,
   * Vengeful Kami ruling on "attacked you"): Jabari's Influence's "target
   * nonartifact, nonblack creature that attacked you this turn". One that has
   * left is asked as it last was. */
  readonly attackedYouThisTurn?: boolean;
  /** Was declared as an attacker during its controller's last turn — the most
   * recent turn they've finished, not the one under way, and whoever
   * controlled it then: Halls of Mist's "creatures that attacked during their
   * controller's last turn can't attack". See `controllersLastTurn`. */
  readonly attackedDuringControllersLastTurn?: boolean;
  /** Was declared as an attacker attacking a battle this turn (or wasn't) —
   * War Historian's "as long as it attacked a battle this turn" (rule
   * 506.3). Holds from that declaration whatever then happens to the
   * battle; one that has left is asked as it last was. */
  readonly attackedBattleThisTurn?: boolean;
  /** Was dealt damage this turn by a source matching this, as that source
   * was then (`DamageHistory`) — Shelob, Child of Ungoliant's "dealt
   * damage this turn by a Spider **you controlled**": `controlledBy` from
   * this filter's "you". One that has left is asked as it last was. */
  readonly damagedThisTurnBy?: {
    readonly subtype?: string;
    readonly type?: CardType;
    readonly controlledBy?: "you" | "opponent";
    /** The source was a spell as it dealt the damage — Aegar, the Freezing
     * Flame's "a Giant, Wizard, or **spell** you controlled" (`anyOf` over
     * the clause for the rest). An ability's damage comes from its source
     * permanent, so it's never this. */
    readonly spell?: true;
    /** One source: `"this"`, the permanent applying the filter — "a creature
     * dealt damage by this creature this turn" (Sengir Vampire); `"host"`,
     * the permanent it's attached to — "… by enchanted creature" (Vampiric
     * Embrace), "… by equipped creature" (Unscythe). Either in its stint on
     * the battlefield now, or the one it just left in the same event (rule
     * 603.10a: a creature dying beside Sengir Vampire still triggers it).
     * Needs `FilterContext.source`. */
    readonly source?: "this" | "host";
  };
  /** Was dealt excess damage this turn (rule 120.4a) — Maarika, Brutal
   * Gladiator's "if that creature was dealt excess damage this turn". */
  readonly excessDamageThisTurn?: boolean;
  /** Dealt damage to another creature this turn. */
  readonly dealtDamageToCreatureThisTurn?: boolean;
  /** Dealt damage this turn (`GameObject.dealtDamage`): `true` to anything
   * (Red Guardian, Restore the Peace); `to: "you"`, to the player whose
   * filter it is (Spear of Heliod, Retaliate), and `combat`, combat damage
   * (Witch-king of Angmar). `{ player }` is "you" bound to one player, where
   * the player choosing isn't the "you" of the text. */
  readonly dealtDamageThisTurn?:
    | true
    | { readonly to: "you" | { readonly player: PlayerId }; readonly combat?: true };
  /** It entered the battlefield (this stint) as a spell that was cast and
   * resolved — "if it was cast" (see `GameObject.entry`). */
  readonly cast?: boolean;
  /** Another player helped pay for it through assist (rule 702.132a,
   * `GameObject.assistedBy`): "if another player spent mana to cast it"
   * (Yume, Chronicler of Valor). As it was last cast. */
  readonly assisted?: boolean;
  /** …cast by **you** — "if you cast it" (Anti-Venom, Rocco, Tiamat). */
  readonly castBy?: "you";
  /** …cast from this zone — "if it was cast from a graveyard". Asked of a
   * spell still on the stack, where it was cast from: Delayed Blast
   * Fireball's "if this spell was cast from exile". */
  readonly castFrom?: ZoneType | { readonly not: ZoneType };
  /** …cast under this permission — Uro, Titan of Nature's Wrath's "sacrifice
   * it unless it escaped" is `{ castVia: "escape" }` under a `not`. A spell
   * cast from the graveyard some other way (Muldrotha, flashback granted by
   * another card) didn't escape (its ruling). */
  readonly castVia?: CastVia;
  /** It entered the battlefield from this zone — "enters from exile" (Fire
   * Lord Zuko), "came from a graveyard" (a spell's entry comes from the
   * stack; `castFrom` says where it was cast). */
  readonly enteredFrom?: ZoneType;
  /** It's a land that entered by being played (rule 305.1), this stint
   * (`EntryRecord.played`) — Deep Gnome Terramancer's "lands enter … without
   * being played" is `played: false`; a land an effect put there wasn't
   * played. */
  readonly played?: boolean;
  /** It was (or wasn't) put onto the battlefield by an ability of the
   * permanent applying the filter, this stint of it — Kodama of the East
   * Tree's "if it wasn't put onto the battlefield with this ability". Needs
   * `FilterContext.source`; without one, nothing was. */
  readonly putThereBySource?: boolean;
  /**
   * What a **spell** targets — see {@link SpellTargetsFilter}: Feather, the
   * Redeemed's "an instant or sorcery spell that targets a creature you
   * control", Zada, Hedron Grinder's "that targets only Zada", Rebuff the
   * Wicked's "target spell that targets a permanent you control". Matches
   * only a spell on the stack; anything else has no targets to ask about.
   */
  readonly targets?: SpellTargetsFilter;
  /** `targets`, for an activated or triggered ability on the stack as well as
   * a spell: Emissary of Grudges's "target spell or ability … if it targets
   * you or a permanent you control". */
  readonly stackObjectTargets?: SpellTargetsFilter;
  /**
   * It is the reference object (see `ShareReference`), or shares at least
   * one **card type** (rule 205.2a) with it — "a permanent that shares a
   * card type with it" (Braids, Arisen Nightmare: the sacrificed permanent),
   * "a spell … that shares a card type with it" (Baral and Kari Zev: the
   * trigger object), "a spell that shares a card type with it" (Counterlash:
   * the countered spell in target slot 0). The reference is read as it last
   * existed if it has left since (rule 608.2h). Bound to `sharesTypeWith`
   * as the effect applies (`bindDynamicCompares`); unbound, anywhere
   * nothing could answer it, it matches nothing. `{ typesOf }` reads the
   * reference by its types alone, and `each` asks for each of them (see
   * `TypeShareReference`), for all four clauses.
   */
  readonly sharesCardTypeWith?: TypeShareReference;
  /**
   * As `sharesCardTypeWith`, but only the **permanent types** count (rule
   * 110.4: artifact, battle, creature, enchantment, land, planeswalker — not
   * kindred) — Cloudstone Curio's "another permanent you control that shares
   * a permanent type with it".
   */
  readonly sharesPermanentTypeWith?: TypeShareReference;
  /**
   * It is the reference object, or shares at least one **creature type**
   * (rule 205.3m) with it — Heirloom Blade's "a creature card that shares a
   * creature type with it" (its rulings: the dead creature as it last
   * existed, and one with no creature type shares none), kinship's "if it
   * shares a creature type with this creature" (`"source"`), the Crowns'
   * "enchanted creature and other creatures that share a creature type with
   * it" (`"attached"`: the host is in even with no creature type), Endemic
   * Plague's sacrificed creature, Killer's "target creature and each other
   * creature that shares a creature type with it" (slot 0). A changeling on
   * either side (rule 702.73a) shares one with anything that has a creature
   * type (`hasSubtype`). Bound to `sharesTypeWith` as the effect applies.
   * `{ typesOf: "convokers" }` is Everything Comes to Dust's "a creature that
   * convoked this spell"; `{ typesOf: { paid: "tapped" }, each: true }`
   * Cryptic Gateway's "each creature tapped this way".
   */
  readonly sharesCreatureTypeWith?: TypeShareReference;
  /**
   * As `sharesCreatureTypeWith`, for **land types** (rule 205.3i) — Hiveheart
   * Shaman's "a basic land card that **doesn't** share a land type with a
   * land you control" is `{ not: { sharesLandTypeWith: { controlled: { type:
   * "land" } } } }`.
   */
  readonly sharesLandTypeWith?: TypeShareReference;
  /** The `shares…TypeWith` clauses bound — written by `bindDynamicCompares`,
   * never authored. Every entry must hold. */
  readonly sharesTypeWith?: readonly SharedTypes[];
  /**
   * One of the objects the spell or ability now resolving has done this to
   * (see `ThisWayKind`) — choosing among the cards just moved: "you may put
   * a creature card milled this way into your hand", "put a permanent card
   * from among them onto the battlefield" after an exile. Between
   * resolutions nothing matches.
   */
  readonly thisWay?: ThisWayKind;
  /** It's in this zone now: "return that card **from your graveyard**"
   * (Sivriss, Nightmare Speaker), where a milled card a replacement exiled
   * instead (Rest in Peace) isn't to be found — unlike "from among the milled
   * cards" (rule 701.17c), which finds it there. */
  readonly inZone?: ZoneType;
  /**
   * None of the objects the resolving spell or ability has done this to —
   * Martial Coup's "create X 1/1 white Soldier creature tokens … destroy all
   * **other** creatures" is `{ type: "creature", notThisWay: "created" }`.
   * Between resolutions nothing has been done this way, so it excludes
   * nothing.
   */
  readonly notThisWay?: ThisWayKind;
  /**
   * Narrows `thisWay` and `notThisWay` to what **you** did this way — the
   * entries whose player (`ThisWayEntry.player`: who sacrificed, discarded,
   * milled it…) is the filter's "you". Rise of the Witch-king's "you may
   * return **another** permanent card" after "each player sacrifices" bars
   * only the card you sacrificed (its ruling), not one you own that an
   * opponent sacrificed: `{ notThisWay: "sacrificed", thisWayBy: "you" }`.
   */
  readonly thisWayBy?: "you";
  /**
   * One of the members of a set (`object-sets.ts`), in the stint the set
   * found it in (rule 400.7), whatever it has become since: `"trigger-batch"`
   * is "those creatures", "each of them" — the attackers that counted for an
   * `attacks-batch`, `attack-with` or `attacks-player` trigger (Sabotage
   * Strategist's "those creatures get -1/-0 until end of turn"), the
   * permanents of a batched entry, the cards of a batched arrival in a
   * graveyard, the sources of a batched damage trigger (Tamiyo, Upriser
   * Crowned) — one no longer attacking is still one of them, one that left
   * isn't. `{ remembered }` is what a delayed ability was made to remember. An
   * effect's filter only, `delayed-trigger`'s `at` included, so that one keeps
   * the objects meant ("whenever either of those creatures deals combat
   * damage"): `bindDynamicCompares` binds it to `amongObjects`. Unbound it
   * matches nothing.
   */
  readonly inSet?: ObjectSetRef;
  /** `inSet` bound — written by `bindDynamicCompares`, never authored. */
  readonly amongObjects?: readonly { readonly object: ObjectId; readonly stint: number }[];
  /**
   * "Tokens **created with this**" (`GameObject.createdWith`): the effect's
   * source, in the stint the resolving ability refers to, so a permanent that
   * left and came back is a new object with none of the old one's tokens (rule
   * 400.7), and two of a card each mean their own (Arcane Artisan's and Faerie
   * Artisans's rulings). An effect's filter only: `bindDynamicCompares` binds it
   * to `createdWith`, in a `delayed-trigger`'s effect as that's created, since
   * "exile all tokens created with it at the beginning of the next end step"
   * means the permanent that left. Unbound it matches nothing.
   */
  readonly createdWithSource?: true;
  /** `createdWithSource` bound — written by `bindDynamicCompares`, never authored. */
  readonly createdWith?: { readonly source: ObjectId; readonly stint: number };
  /**
   * At least one of these filters must match, as well as every other clause
   * here — the "or" a flat clause list can't say: historic ("artifact,
   * legendary, or Saga"), "enchanted or equipped", "black and/or red".
   */
  readonly anyOf?: readonly CardFilter[];
  /**
   * Must NOT match this filter — the negation a flat clause list can't say
   * when it spans several clauses: "can't be blocked except by creatures
   * with flying or reach" (Tatsunari, Toad Rider) is a `cantBeBlockedBy`
   * of `{ not: { anyOf: [{ keyword: "flying" }, { keyword: "reach" }] } }`.
   */
  readonly not?: CardFilter;
}

/**
 * A clause on a spell's targets (rule 115.1) — the objects and players it
 * targets as it is on the stack, the slots its own rules filled
 * automatically left out (those aren't targets, 115.1). A spell with none
 * never matches.
 *
 * Each target is asked whether it's **such a one**: a player (`player`), or a
 * permanent — an object on the battlefield, since "a creature" or "a
 * permanent" with no "card" or "spell" means one there (rule 109.2) —
 * matching `permanent` from the filter's side, and being or not being the
 * permanent applying the filter (`source`). Without `only`, one such target
 * is enough ("a spell that targets a creature you control"; the spell may
 * target other things too — Feather's ruling). With `only`, every target
 * must be one ("targets only Zada" — the same object in two slots still
 * counts, the Zada ruling). `single` adds that its targets are all one and
 * the same object or player ("a spell that targets only a single creature
 * other than Ivy" — two slots aimed at the same creature count, the Ivy
 * ruling).
 */
export interface SpellTargetsFilter {
  readonly only?: boolean;
  readonly single?: boolean;
  /** A target is a permanent matching this ("a creature you control"). */
  readonly permanent?: CardFilter;
  /** A target is (`true`) or isn't (`false`) the permanent applying the
   * filter (`FilterContext.source`) — "only Zada", "other than Ivy". A
   * target that isn't a permanent is neither. */
  readonly source?: boolean;
  /** A target is a player: `"you"`, the filter's side — "a spell that
   * targets you" (Dawn Charm); `"opponent"`, one of the filter's side's
   * opponents — "a spell that targets an opponent" (Danitha, Spear of Agony).
   * With `permanent`, a target may be either: "a spell or ability that targets
   * **you or a creature you control**" (Siren Stormtamer). */
  readonly player?: "you" | "opponent" | "any";
}

/** Whether the spell `spell` meets `clause` (see {@link SpellTargetsFilter}):
 * its targets as it is on the stack now. */
function spellTargetsMatch(
  state: GameState,
  registry: CardRegistry,
  spell: GameObject,
  clause: SpellTargetsFilter,
  ctx: FilterContext,
): boolean {
  return spell.kind === "card" && stackObjectTargetsMatch(state, registry, spell, clause, ctx);
}

/** {@link spellTargetsMatch} for an ability on the stack as well: "target spell
 * or ability … that targets a land you control" (Teferi's Response). */
export function stackObjectTargetsMatch(
  state: GameState,
  registry: CardRegistry,
  spell: GameObject,
  clause: SpellTargetsFilter,
  ctx: FilterContext,
): boolean {
  if (spell.zone !== "stack") return false;
  const auto = new Set(spell.autoTargetSlots ?? []);
  // A target that has changed zones since it was targeted is a new object
  // (rule 400.7) the spell doesn't target — the Rebuff the Wicked ruling.
  const gone = (i: number): boolean => {
    const t = spell.targets?.[i];
    const stint = spell.targetStints?.[i];
    if (t?.kind !== "object" || stint === undefined || stint === null) return false;
    return (state.objects[t.object]?.zoneChangeCount ?? 0) !== stint;
  };
  type Aimed = TargetRef | { readonly kind: "gone" };
  const targets = (spell.targets ?? []).flatMap((t, i): Aimed[] =>
    t === undefined || t === null || auto.has(i) ? [] : gone(i) ? [{ kind: "gone" }] : [t],
  );
  if (targets.length === 0) return false;
  if (clause.single === true) {
    const first = targets[0];
    const same = targets.every((t) =>
      t.kind === "player"
        ? first.kind === "player" && first.player === t.player
        : t.kind === "object" && first.kind === "object" && first.object === t.object,
    );
    if (!same) return false;
  }
  const inner: FilterContext = {
    you: ctx.you,
    ...(ctx.x !== undefined ? { x: ctx.x } : {}),
    ...(ctx.amount !== undefined ? { amount: ctx.amount } : {}),
    ...(ctx.source !== undefined ? { source: ctx.source } : {}),
  };
  const suchAOne = (t: (typeof targets)[number]): boolean => {
    if (t.kind === "gone") return false;
    if (t.kind === "player") {
      if (clause.player === undefined || clause.source === true) return false;
      return clause.player === "any" || (t.player === ctx.you) === (clause.player === "you");
    }
    // `player` alone is about a player; with `permanent`, either will do.
    if (clause.player !== undefined && clause.permanent === undefined) return false;
    const object = state.objects[t.object];
    if (object === undefined || object.zone !== "battlefield") return false;
    if (clause.source !== undefined && (t.object === ctx.source) !== clause.source) return false;
    return clause.permanent === undefined || matchesFilter(state, registry, t.object, clause.permanent, inner);
  };
  return clause.only === true ? targets.every(suchAOne) : targets.some(suchAOne);
}

export interface FilterContext {
  /** Whose perspective `"you"` / `"opponent"` are evaluated from. */
  readonly you: PlayerId;
  /** About to enter the battlefield under this player: what `controlledBy`
   * reads for it (rule 614.12), who may not control it now. */
  readonly enteringUnder?: PlayerId;
  /** The player choosing the target being judged, when another than `you`
   * chooses it — what `controlledBy: "chooser"` reads. */
  readonly chooser?: PlayerId;
  /** The `{X}` of the spell or ability applying this filter, for a
   * `NumCompare` written as `{ n: "x" }`. Defaults to 0. */
  readonly x?: number;
  /**
   * Judge a card that isn't on the stack as the spell it would be with its
   * `{X}` announced as this (rules 601.3e, 202.3e): its mana value counts
   * this X, as it would on the stack. A cast permission's filter reads it
   * — Glarb, Calamity's Augur's "spells with mana value 4 or greater" on an
   * X spell (its ruling). Ignored for an object on the stack, which has its
   * own X.
   */
  readonly castX?: number;
  /**
   * Read an object that has just left the battlefield as it last existed
   * there (rule 603.10a) — for a trigger filter matched against the permanent
   * whose leaving fired it, as the event happens. Every clause then reads its
   * `GameObject.lastKnown` snapshot: the controller it had, the types and
   * subtypes an effect had given it, its counters, keywords, power. No effect
   * on an object that is on the battlefield.
   */
  readonly lastKnown?: boolean;
  /**
   * Match this snapshot of the object instead of the object as it is now —
   * last-known information the caller has already picked out for a
   * particular departure from the battlefield (a resolving ability's "if it
   * was a Saproling", "if the sacrificed creature was a commander"). Wins
   * over `lastKnown`, and answers even for a token that has ceased to exist.
   */
  readonly snapshot?: LastKnownInfo;
  /** Evaluates a `NumCompare`'s `{ amount }` operand in the context of
   * whatever is applying the filter (its source, controller, triggering
   * object, {X}, targets). Absent ⇒ such a comparison fails closed. `each` is
   * the player an amount's `"each"` means (`forItsController`). */
  readonly amount?: (amount: EffectAmount, each?: PlayerId) => number;
  /** For `hasAbilities` on a spell: `amount` as each `grantsToSpells` static reads
   * it, from its own source (Abaddon the Despoiler's "mana value X or less").
   * Absent ⇒ such a grant doesn't reach the spell here. */
  readonly spellGrantAmount?: (source: GameObject) => (amount: EffectAmount) => number;
  /** The object behind the trigger applying the filter: what a filter's
   * `"trigger-object"` reference reads when it's a target's. */
  readonly triggerObject?: ObjectId;
  /** The permanent whose trigger or ability is applying the filter — what
   * `putThereBySource` compares against. */
  readonly source?: ObjectId;
  /** The object is a spell being cast, still in the zone it's cast from (a
   * targeting spell's `TargetSource.spell`): what `isSpell` reads then. */
  readonly asSpell?: true;
  /**
   * The object is being matched from *inside* the layer fold that computes
   * its characteristics — a static ability's `filter` scope (see
   * `AffectSpec`). Nothing here may fold them again, so a type or subtype
   * clause reads `types` / `subtypes` when given (the types granted so far,
   * inside layer 4) and a keyword clause reads `keywords` (printed ones, less
   * ability loss, when absent). A power or toughness clause, or an `{ own }`
   * power or toughness operand, can't be answered and fails closed.
   */
  readonly layered?: {
    readonly types?: readonly CardType[] | undefined;
    readonly subtypes?: readonly string[] | undefined;
    readonly supertypes?: readonly Supertype[] | undefined;
    readonly keywords?: (() => ReadonlySet<Keyword>) | undefined;
    /** Its total toxic as the fold has it so far, for a `hasToxic` clause;
     * absent, printed toxic (less ability loss). */
    readonly toxic?: (() => number) | undefined;
    readonly hasProtection?: (() => boolean) | undefined;
  };
}

/**
 * Whether `creature` saddled `mount` this turn (rule 702.171c) — the `mount`
 * as it is on the battlefield now or, once it has left, as it last was there
 * (its `lastKnown` stint), so a delayed trigger of a Mount that has gone
 * still finds the creatures that saddled it (Fortune, Loyal Steed's ruling).
 */
export function saddledMount(state: GameState, creature: GameObject, mount: ObjectId): boolean {
  return tappedForThisTurn(state, (creature.saddledThisTurn ?? []).map((r) => ({ permanent: r.mount, stint: r.stint })), mount);
}

/**
 * Whether `creature` crewed `vehicle` this turn (rule 702.122b-c) — the
 * Vehicle as it is on the battlefield now or, once it has left, as it last
 * was there, as {@link saddledMount} reads a Mount.
 */
export function crewedVehicle(state: GameState, creature: GameObject, vehicle: ObjectId): boolean {
  return tappedForThisTurn(
    state,
    (creature.crewedThisTurn ?? []).map((r) => ({ permanent: r.vehicle, stint: r.stint })),
    vehicle,
  );
}

/** Whether `records` (a creature's crew or saddle records) name `permanent`
 * in its stint on the battlefield now, or its last one there. */
function tappedForThisTurn(
  state: GameState,
  records: readonly { readonly permanent: ObjectId; readonly stint: number }[],
  permanent: ObjectId,
): boolean {
  if (records.length === 0) return false;
  const object = state.objects[permanent];
  const stint =
    object === undefined
      ? state.ceasedTokens?.[permanent]?.zoneChangeCount
      : object.zone === "battlefield"
        ? (object.zoneChangeCount ?? 0)
        : object.lastKnown?.zoneChangeCount;
  return stint !== undefined && records.some((r) => r.permanent === permanent && r.stint === stint);
}

/** The partner of a `blockingRelation` clause: `source` itself, or the
 * permanent it's attached to — now, or as it last was on the battlefield.
 * Nothing for `"trigger-object"`, which only `bindDynamicCompares` can bind. */
export function blockingPartnerOf(
  state: GameState,
  of: "source" | "host" | "trigger-object",
  source: ObjectId | undefined,
): ObjectId | undefined {
  if (of === "trigger-object") return undefined;
  if (source === undefined || of === "source") return source;
  const object = state.objects[source];
  if (object === undefined) return undefined;
  const host = object.zone === "battlefield" ? object.attachedTo : object.lastKnown?.attachedTo;
  return host ?? undefined;
}

/**
 * Whether `creature` (on the battlefield) is blocking `partner`, is blocked by
 * it, or either (rules 509.1g-h) — `CardFilter.blockingRelation`. A partner
 * that has left the battlefield is read as it last was there: the attackers
 * it was blocking and the blockers it had as it left (rules 608.2b, 608.2h),
 * with `creature` still a blocker, or still a blocked attacker (509.1h).
 */
export function inBlockingRelation(
  state: GameState,
  creature: GameObject,
  partner: ObjectId,
  relation: "blocking" | "blocked-by" | "either",
): boolean {
  if (creature.zone !== "battlefield" || creature.id === partner) return false;
  const other = state.objects[partner];
  if (other === undefined) return false;
  const here = other.zone === "battlefield";
  const blocking = (): boolean =>
    creature.blocking !== null &&
    (here
      ? blockedAttackersOf(state, creature.id).includes(partner)
      : (other.lastKnown?.blockers ?? []).includes(creature.id));
  const blockedBy = (): boolean =>
    creature.attacking !== null &&
    creature.blocked &&
    (here
      ? blockedAttackersOf(state, partner).includes(creature.id)
      : (other.lastKnown?.blockedAttackers ?? []).includes(creature.id));
  if (relation === "blocking") return blocking();
  if (relation === "blocked-by") return blockedBy();
  return blocking() || blockedBy();
}

/**
 * How many creatures are blocking `attacker`, each token of a stack counting,
 * a blocker of the band it's in too (rule 702.22h), as it last was if it has
 * left — `{ blockersOf }` and `CardFilter.blockerCount`.
 */
export function creaturesBlocking(state: GameState, attacker: ObjectId): number {
  return permanentCount(
    state,
    state.zones.shared.battlefield.filter((id) => inBlockingRelation(state, state.objects[id], attacker, "blocking")),
  );
}

/** Whether object `id`, in its stint `stint`, blocked or was blocked this turn
 * as `CardFilter.blockedThisTurn` asks, every player's `TurnHistory.blocks`
 * read. */
/** Whether object `id`, in stint `stint`, has as many entries as `clause`
 * asks in the journal's `clause.what` (see `CardFilter.journaled`). */
function journaledMatches(
  state: GameState,
  registry: CardRegistry,
  id: ObjectId,
  stint: number,
  clause: NonNullable<CardFilter["journaled"]>,
  you: PlayerId,
): boolean {
  const players = clause.by === "you" ? [you] : state.turnOrder;
  let n = 0;
  for (const e of journalEntries(journalReader(state, registry), JOURNAL_VIEWS[clause.what], players, clause.window ?? "this-turn", you)) {
    if (e.object !== id || (e.arrived ?? e.stint) !== stint) continue;
    if (clause.counter !== undefined && e.counter !== clause.counter) continue;
    if (clause.thisCombat === true && (e.combat === undefined || e.combat !== (state.turn.combatPhases ?? 1))) continue;
    n += 1;
  }
  return n >= (clause.atLeast ?? 1) && (clause.atMost === undefined || n <= clause.atMost);
}

function blockedThisTurnMatches(
  state: GameState,
  registry: CardRegistry,
  id: ObjectId,
  stint: number,
  clause: NonNullable<CardFilter["blockedThisTurn"]>,
  ctx: FilterContext,
): boolean {
  // A partner that was to be bound and wasn't: nothing could answer it.
  if (clause.of !== undefined && clause.with === undefined) return false;
  const partnerMatches = (partner: ObjectId, was: LastKnownInfo): boolean =>
    (clause.with === undefined ||
      clause.with.some((w) => w.object === partner && w.stint === was.zoneChangeCount)) &&
    (clause.partner === undefined || matchesFilter(state, registry, partner, clause.partner, { ...ctx, snapshot: was }));
  for (const block of entriesThisTurn(state, "blocked")) {
    if (clause.thisCombat === true && block.combat !== state.turn.combatPhases) continue;
    const blocker = block.object;
    const blockerWas = block.was;
    const attacker = block.target?.kind === "object" ? block.target.object : undefined;
    const attackerWas = block.targetWas;
    if (blocker === undefined || blockerWas === undefined || attacker === undefined || attackerWas === undefined) continue;
    if (
      clause.relation !== "blocked-by" &&
      blocker === id &&
      blockerWas.zoneChangeCount === stint &&
      partnerMatches(attacker, attackerWas)
    ) {
      return true;
    }
    if (
      clause.relation !== "blocked" &&
      attacker === id &&
      attackerWas.zoneChangeCount === stint &&
      partnerMatches(blocker, blockerWas)
    ) {
      return true;
    }
  }
  return false;
}

/** What is attached to `id` on the battlefield, for the attachment clauses.
 * Attachments leave with the permanent, so off the battlefield it's none —
 * which is why a leaving permanent's snapshot records them first
 * (`LastKnownInfo.equipped`). */
export function attachmentsOf(
  state: GameState,
  registry: CardRegistry,
  id: ObjectId,
): {
  equipped: boolean;
  equipment: number;
  enchanted: boolean;
  enchantedByController: boolean;
  enchantedBy: PlayerId[];
} {
  const out = {
    equipped: false,
    equipment: 0,
    enchanted: false,
    enchantedByController: false,
    enchantedBy: [] as PlayerId[],
  };
  const host = state.objects[id];
  if (host === undefined || host.zone !== "battlefield") return out;
  for (const other of state.zones.shared.battlefield) {
    const o = state.objects[other];
    if (o === undefined || o.attachedTo !== id) continue;
    const subtypes = effectiveSubtypes(state, registry, o);
    if (subtypes.includes("Equipment")) {
      out.equipped = true;
      out.equipment += 1;
    }
    if (subtypes.includes("Aura")) {
      out.enchanted = true;
      if (o.controller === host.controller) out.enchantedByController = true;
      if (!out.enchantedBy.includes(o.controller)) out.enchantedBy.push(o.controller);
    }
  }
  return out;
}

/**
 * The mana cost an object's mana value is read from: the face that's up,
 * except that a transforming double-faced permanent with its back face up
 * uses its **front** face's (rule 712.8e — a flipped Bloodline Keeper is
 * still mana value 4, though Lord of Lineage prints no cost). A modal DFC's
 * back face is a card face you cast or play, and uses its own.
 */
export function printedManaCost(registry: CardRegistry, object: GameObject): string | null {
  const override = manaCostOverride(object);
  if (override !== undefined) return override;
  const def = registry.get(printedCardName(object));
  // A melded permanent: the combined mana cost of its cards' front faces
  // (rules 202.3c, 712.8g) — but a copy of one (whose copy effect reads
  // before its melded face) has its combined face's, none (202.3c).
  const melded = object.melded;
  if (melded !== undefined && def.name === melded.into) {
    const costs = [object.cardName, ...melded.with.map((card) => card.cardName)]
      .map((name) => (registry.has(name) ? registry.get(name).manaCost : null))
      .filter((cost): cost is string => cost !== null);
    return costs.length > 0 ? costs.join("") : null;
  }
  const front = def.faces?.[0];
  if (def.transform === true && front !== undefined && front !== def.name && registry.has(front)) {
    return registry.get(front).manaCost;
  }
  return def.manaCost;
}

/** A permanent's mana cost itself, which an offering's reduction reads (rule
 * 702.48a): a token's or a face-down permanent's none, a copy's what it copies,
 * and, unlike {@link printedManaCost}, a transformed back face's or a melded
 * permanent's none, whatever its mana value (rules 712.8e, 712.8g). */
export function ownManaCostOf(registry: CardRegistry, object: GameObject): string | null {
  const override = manaCostOverride(object);
  return override !== undefined ? override : registry.get(printedCardName(object)).manaCost;
}

/** The mana cost the face named `name` prints — what "{X} in its mana cost"
 * and "colored mana symbols in its mana cost" read. Unlike
 * {@link printedManaCost}, which is for mana value, a transformed back face's
 * own: it has none (rule 712.8e). */
function ownManaCost(registry: CardRegistry, name: string): ManaCost {
  return parseManaCost(registry.has(name) ? registry.get(name).manaCost : null);
}

/** How many coloured mana symbols a cost has (rule 107.4): each coloured pip,
 * and each hybrid or Phyrexian symbol once (107.4e–f — every one has a
 * colour, `{2/W}` included). */
export function coloredManaSymbolsIn(cost: ManaCost): number {
  return (
    COLORS.reduce((n, color) => n + cost.colored[color], 0) +
    cost.hybrid.filter((pip) => pip.some((option) => option.kind === "color")).length
  );
}

/** An object's mana value. On the stack, {X} counts as the value chosen for
 * it (rule 202.3e) — a Fireball cast for 5 is a mana value 6 spell.
 * Everywhere else it's 0, unless the card is being judged as the spell it
 * would be with X announced as `castX` (`FilterContext.castX`). */
export function manaValueOfObject(registry: CardRegistry, object: GameObject, castX?: number): number {
  const cost = parseManaCost(printedManaCost(registry, object));
  const x = object.zone === "stack" ? (object.xValue ?? castX ?? 0) : (castX ?? 0);
  return manaValue(cost) + cost.x * Math.max(0, x);
}

/** The one source `damagedThisTurnBy.source` names, with the battlefield
 * stint it means (rule 400.7): `asker` itself, or what it's attached to —
 * on the battlefield now, or as it last was there if it left in the event
 * being asked about (603.10a). */
function damagingStint(
  state: GameState,
  which: "this" | "host",
  asker: ObjectId | undefined,
): { readonly id: ObjectId; readonly zoneChangeCount: number } | undefined {
  const stint = (id: ObjectId | undefined): { readonly id: ObjectId; readonly zoneChangeCount: number } | undefined => {
    const object = id === undefined ? undefined : state.objects[id];
    if (object === undefined) return undefined;
    if (object.zone === "battlefield") return { id: object.id, zoneChangeCount: object.zoneChangeCount ?? 0 };
    const last = object.lastKnown?.zoneChangeCount;
    return last === undefined ? undefined : { id: object.id, zoneChangeCount: last };
  };
  if (which === "this") return stint(asker);
  const source = asker === undefined ? undefined : state.objects[asker];
  if (source === undefined) return undefined;
  const host = source.zone === "battlefield" ? source.attachedTo : source.lastKnown?.attachedTo;
  return stint(host ?? undefined);
}

/**
 * The objects a `ShareReference` names, read from the state and the filter's
 * context alone — `undefined` for a reference only a resolving effect can
 * read (`bindDynamicCompares` binds those). `"exiled-with-source"` is the
 * cards in exile linked to the source's battlefield stint (rule 607.2a): the
 * one it's in, or the last one it had if it has left (Mindreaver,
 * sacrificed).
 */
export function liveReferenceObjects(
  state: GameState,
  registry: CardRegistry,
  reference: ShareReference,
  ctx: FilterContext,
  /** The controller of the object being asked about, for a `{ graveyard }` of
   * `itsController`. */
  itsController?: PlayerId,
): readonly ObjectId[] | undefined {
  if (reference === "source") return ctx.source === undefined ? [] : [ctx.source];
  if (reference === "trigger-object") return ctx.triggerObject === undefined ? undefined : [ctx.triggerObject];
  if (reference === "attached") {
    const on = ctx.source === undefined ? undefined : state.objects[ctx.source];
    const host = on?.zone === "battlefield" ? on.attachedTo : null;
    return host === null || host === undefined ? [] : [host];
  }
  if (reference === "exiled-with-source") {
    const source = ctx.source === undefined ? undefined : state.objects[ctx.source];
    if (source === undefined) return [];
    const stint = source.zone === "battlefield" ? (source.zoneChangeCount ?? 0) : source.lastKnown?.zoneChangeCount;
    if (stint === undefined) return [];
    // Linked (`exiledWith`), or exiled until it leaves (`exiledUntil`, rule
    // 610.3) — both "the exiled card" to an ability of it.
    const linked = (link: { readonly source: ObjectId; readonly zoneChangeCount: number } | undefined): boolean =>
      link !== undefined && link.source === source.id && link.zoneChangeCount === stint;
    return state.zones.shared.exile.filter((card) => {
      const object = state.objects[card];
      return linked(object?.exiledWith) || linked(object?.exiledUntil);
    });
  }
  // A static's other sets: its source's own (what's attached to it); a
  // resolution's sets name nothing here.
  if (isObjectSetRef(reference)) return staticSetMembers(state, reference, ctx.source).map((m) => m.object);
  if (typeof reference !== "object") return undefined;
  const innerCtx: FilterContext = {
    you: ctx.you,
    ...(ctx.x !== undefined ? { x: ctx.x } : {}),
    ...(ctx.amount !== undefined ? { amount: ctx.amount } : {}),
    ...(ctx.source !== undefined ? { source: ctx.source } : {}),
  };
  if ("hostOf" in reference || "pairedWith" in reference) return undefined;
  if ("graveyard" in reference) {
    const players = reference.itsController === true ? (itsController === undefined ? [] : [itsController]) : state.turnOrder;
    return players.flatMap((player) =>
      (state.zones.perPlayer[player]?.graveyard ?? []).filter((card) =>
        matchesFilter(state, registry, card, reference.graveyard, innerCtx),
      ),
    );
  }
  const inner: CardFilter = "controlled" in reference ? { ...reference.controlled, controlledBy: "you" } : reference.permanents;
  return state.zones.shared.battlefield.filter((other) => matchesFilter(state, registry, other, inner, innerCtx));
}

/** `filter` with its `ofChosenColor` read now, off `source`, into a fixed
 * colour — for a filter kept past the resolution that applied it (a
 * prevention shield's "a source of your choice of the chosen color"), which
 * uses the colour chosen as the ability resolved (rule 608.2h), not one a
 * later return of its source chooses. With no colour chosen, the clause is
 * kept and, read with no source, matches nothing. */
export function fixChosenColor(state: GameState, filter: CardFilter, source: ObjectId | undefined): CardFilter {
  if (filter.ofChosenColor !== true || source === undefined) return filter;
  const from = state.objects[source];
  const chosen = from?.chosenOnEnter ?? (from?.zone === "battlefield" ? null : from?.lastKnown?.chosenOnEnter);
  if (chosen == null || !(COLORS as readonly string[]).includes(chosen)) return filter;
  const { ofChosenColor: _read, ...rest } = filter;
  return { ...rest, colors: [...(filter.colors ?? []), chosen as Color] };
}

/** Is `value` of the quality `clause` asks for? A negative number has a parity
 * too: -1 is odd. */
function hasParity(state: GameState, value: number, clause: ParityClause, source: ObjectId | undefined): boolean {
  let quality: string | null | undefined = clause;
  if (clause === "chosen") {
    const from = source === undefined ? undefined : state.objects[source];
    quality = from?.chosenOnEnter ?? (from?.zone === "battlefield" ? null : from?.lastKnown?.chosenOnEnter);
  }
  if (quality === "odd") return Math.abs(value) % 2 === 1;
  if (quality === "even") return value % 2 === 0;
  return false;
}

/** The keyword abilities a definition holds in fields of its own: what
 * `CardFilter.hasKeyword` can ask. */
export type CardKeyword =
  | "convoke" | "cycling" | "disguise" | "flashback" | "kicker" | "morph" | "mutate" | "suspend"
  | "awaken" | "madness" | "warp" | "disturb" | "freerunning" | "fading" | "modular" | "unearth"
  | "partner" | "devoid";

/** Whether a printed line of `def`'s text is this keyword ability: for the
 * keywords a card authors as their parts, with no field of their own. */
function hasKeywordLine(def: CardDefinition, keyword: string): boolean {
  return new RegExp(`(^|\\n)${keyword}( |\\n|$)`).test(def.text);
}

/** One row per keyword, so a new one is a row: `live` is there for what a
 * permanent can be granted (flashback, on a card in a graveyard). */
const CARD_KEYWORD_READS = {
  // A `kicker` with a `keyword` is another optional additional cost (buyback,
  // entwine, bargain...) the engine models the same way: not a kicker ability
  // (rule 702.33; multikicker has no `keyword` and counts).
  kicker: (def) => def.kicker !== null && def.kicker.keyword === undefined,
  convoke: (def) => def.convoke,
  cycling: (def) => def.cycling !== null,
  suspend: (def) => def.suspend !== null,
  mutate: (def) => def.overload?.keyword === "mutate",
  awaken: (def) => def.overload?.keyword === "awaken",
  disguise: (def) => def.morph?.keyword === "disguise",
  morph: (def) => def.morph !== null && def.morph.keyword !== "disguise",
  flashback: (def, live) => live?.grantedFlashback != null || def.flashback !== null,
  madness: (def) => def.madness !== null,
  warp: (def) => def.warp !== null,
  disturb: (def) => def.disturb !== null,
  freerunning: (def) => def.freerunning !== null,
  fading: (def) => hasKeywordLine(def, "Fading"),
  modular: (def) => hasKeywordLine(def, "Modular"),
  unearth: (def) => hasKeywordLine(def, "Unearth"),
  // "Partner" or "partner with [name]", not the other partner abilities —
  // friends forever, choose a Background and the rest (rule 702.124f; Akroma,
  // Vision of Ixidor's ruling).
  partner: (def) => def.pairing?.kind === "partner" || def.pairing?.kind === "partner-with",
  // Devoid (rule 702.114a) is authored as its colours alone (`colors: []`), so
  // its printed line is what tells a spell with devoid from any other
  // colorless one (Corrupted Crossroads's ruling).
  devoid: (def) => hasKeywordLine(def, "Devoid"),
} as const satisfies Record<CardKeyword, (def: CardDefinition, live: GameObject | undefined) => boolean>;

/** Does object `id` satisfy every clause of `filter`?
 *
 * With a snapshot in play (`FilterContext.lastKnown` / `.snapshot`) every
 * clause reads it instead of the object: one code path, so no clause can be
 * answered from the snapshot in one place and from the card in the
 * graveyard in another. */
export function matchesFilter(
  state: GameState,
  registry: CardRegistry,
  id: ObjectId,
  filter: CardFilter,
  ctx: FilterContext,
): boolean {
  const object: GameObject | undefined = state.objects[id];
  const lki: LastKnownInfo | undefined =
    ctx.snapshot ??
    (ctx.lastKnown !== true
      ? undefined
      : object === undefined
        ? state.ceasedTokens?.[id]
        : object.zone !== "battlefield"
          ? object.lastKnown
          : undefined);
  // Exactly one of the two describes the object from here on.
  const live = lki === undefined ? object : undefined;
  if (live === undefined && lki === undefined) return false;

  // What a player who has left the game owns, anywhere, and a permanent
  // they control, takes no further part in it: nothing counts it, targets
  // it, returns it or sweeps it up.
  //
  // Rule 800.4a removes a departing player's objects from the game. Here they
  // stay where they are — an eliminated player's battlefield sits there for
  // everyone to read, as it would at a table — but they are gone, which is
  // the half the rules are about (`Game.leaveGame`, `Game.inGame`); the
  // client tints the quadrant so nobody mistakes them for live.
  if (
    live !== undefined &&
    (state.players[live.owner]?.hasLost === true ||
      (live.zone === "battlefield" && state.players[live.controller]?.hasLost === true))
  ) {
    return false;
  }
  // "Shares a card type with the sacrificed creature" (or the trigger object)
  // is bound to plain types by the effect applying it
  // (`bindDynamicCompares`). Left unbound, it's answered here if this context
  // can name what it means — a trigger's "a spell that shares a creature type
  // with this creature" (Folk Hero) — and otherwise matches nothing.
  if (
    filter.sharesCardTypeWith !== undefined ||
    filter.sharesPermanentTypeWith !== undefined ||
    filter.sharesCreatureTypeWith !== undefined ||
    filter.sharesLandTypeWith !== undefined
  ) {
    const shares = (clause: TypeShareReference, kind: SharedTypes["kind"]): boolean => {
      const { reference, strict, each } = typeShareParts(clause);
      // Inside the layer fold only what the static's own host is can be read
      // without folding again (Konda's Banner, in layer 7).
      if (ctx.layered !== undefined && reference !== "attached") return false;
      const objects = liveReferenceObjects(state, registry, reference, ctx, live?.controller ?? lki?.controller);
      if (objects === undefined) return false;
      if (!strict && objects.includes(id)) return true;
      // "With each of them" (`each`), or with any one.
      const ofThem = (test: (other: ObjectId) => boolean): boolean => (each ? objects.every(test) : objects.some(test));
      if (kind === "card" || kind === "permanent") {
        const mine = live !== undefined ? effectiveTypes(state, registry, live) : lki!.types;
        return ofThem((other) => {
          const object = state.objects[other];
          if (object === undefined) return false;
          return effectiveTypes(state, registry, object).some(
            (t) => mine.includes(t) && (kind === "card" || PERMANENT_TYPES.includes(t)),
          );
        });
      }
      const mine = live !== undefined ? (ctx.layered?.subtypes ?? effectiveSubtypes(state, registry, live)) : lki!.subtypes;
      return ofThem((other) => {
        const object = state.objects[other];
        if (object === undefined) return false;
        return effectiveSubtypes(state, registry, object).some((s) =>
          kind === "creature"
            ? (s === EVERY_CREATURE_TYPE || isCreatureType(s)) && hasSubtype(mine, s)
            : (s === EVERY_LAND_TYPE || isLandType(s)) && hasSubtype(mine, s),
        );
      });
    };
    if (filter.sharesCardTypeWith !== undefined && !shares(filter.sharesCardTypeWith, "card")) return false;
    if (filter.sharesPermanentTypeWith !== undefined && !shares(filter.sharesPermanentTypeWith, "permanent")) return false;
    if (filter.sharesCreatureTypeWith !== undefined && !shares(filter.sharesCreatureTypeWith, "creature")) return false;
    if (filter.sharesLandTypeWith !== undefined && !shares(filter.sharesLandTypeWith, "land")) return false;
  }
  if (
    filter.isSpell !== undefined &&
    (ctx.asSpell === true || (live !== undefined && live.zone === "stack" && live.kind === "card")) !== filter.isSpell
  ) {
    return false;
  }
  if (filter.inZone !== undefined && state.objects[id]?.zone !== filter.inZone) return false;
  const byScope = (e: { readonly player: PlayerId }): boolean => filter.thisWayBy !== "you" || e.player === ctx.you;
  if (filter.thisWay !== undefined && !thisWayEntries(state, filter.thisWay).some((e) => e.object === id && byScope(e))) {
    return false;
  }
  if (
    filter.notThisWay !== undefined &&
    thisWayEntries(state, filter.notThisWay).some((e) => e.object === id && byScope(e))
  ) {
    return false;
  }
  if (filter.inSet !== undefined) return false;
  if (filter.createdWithSource !== undefined) return false;
  if (filter.createdWith !== undefined) {
    const link = live?.createdWith;
    if (link?.source !== filter.createdWith.source || link.zoneChangeCount !== filter.createdWith.stint) return false;
  }
  if (filter.amongObjects !== undefined) {
    const stint = live !== undefined ? (live.zoneChangeCount ?? 0) : lki!.zoneChangeCount;
    if (!filter.amongObjects.some((one) => one.object === id && one.stint === stint)) return false;
  }

  // Types, subtypes and colours are self-contained (layers 4 / 3 / 5 come only
  // from the object's own modifiers), so they're answered without the layer
  // fold. Only `keyword` / `power` / `toughness` need external statics — and
  // the fold is expensive enough that it's worth deferring: a static
  // ability's condition (Kird Ape's "you control a Forest") runs this over the
  // whole battlefield every time anything reads its characteristics.
  const layered = live !== undefined ? ctx.layered : undefined;
  // Read only when a clause asks: a filter with no type clause ("your
  // commander") would otherwise run the layer-4 fold over every object it
  // scans, uncached under a static condition — Tyrant's Familiar's "as long
  // as you control your commander", asked on every event, was a quarter of a
  // bot's turn on seed 50's 73 permanents.
  let typesRead: readonly CardType[] | undefined;
  const types = (): readonly CardType[] =>
    (typesRead ??=
      live !== undefined
        ? (layered?.types ?? effectiveTypes(state, registry, live))
        : lki!.types);
  if (filter.type !== undefined && !types().includes(filter.type)) return false;
  if (filter.types !== undefined && !filter.types.every((t) => types().includes(t))) {
    return false;
  }
  if (filter.notTypes !== undefined && filter.notTypes.some((t) => types().includes(t))) {
    return false;
  }
  if (filter.typesAnyOf !== undefined && !filter.typesAnyOf.some((t) => types().includes(t))) {
    return false;
  }
  if (
    filter.subtype !== undefined ||
    filter.subtypes !== undefined ||
    filter.notSubtypes !== undefined ||
    filter.ofChosenType !== undefined
  ) {
    // Through `hasSubtype`, never `includes`: a changeling's list carries one
    // marker for every creature type (see `subtypes.ts`).
    const subtypes =
      live !== undefined
        ? (layered?.subtypes ?? effectiveSubtypes(state, registry, live))
        : lki!.subtypes;
    if (filter.subtype !== undefined && !hasSubtype(subtypes, filter.subtype)) return false;
    if (
      filter.subtypes !== undefined &&
      !filter.subtypes.some((s) => hasSubtype(subtypes, s))
    ) {
      return false;
    }
    if (
      filter.notSubtypes !== undefined &&
      filter.notSubtypes.some((s) => hasSubtype(subtypes, s))
    ) {
      return false;
    }
    if (filter.ofChosenType === true) {
      // A source that has left the battlefield lost its choice as it moved:
      // what its ability reads now is the type it had (rule 608.2h).
      const from = ctx.source === undefined ? undefined : state.objects[ctx.source];
      const chosen =
        from?.chosenCreatureType ?? (from?.zone === "battlefield" ? null : from?.lastKnown?.chosenCreatureType);
      if (chosen == null || !hasSubtype(subtypes, chosen)) return false;
    }
  }
  if (filter.sharesTypeWith !== undefined) {
    // Each bound "shares a … type with it": the reference objects are in
    // whatever their types; anything else needs one of theirs — card and
    // permanent types (rule 205.2a, 110.4) among its card types, creature
    // and land types (205.3m, 205.3i) through `hasSubtype`, so a changeling
    // on either side shares (702.73a).
    for (const shared of filter.sharesTypeWith) {
      if (shared.objects.includes(id)) continue;
      if (shared.kind === "card" || shared.kind === "permanent") {
        if (!shared.types.some((t) => types().includes(t as CardType))) return false;
        continue;
      }
      const subtypes =
        live !== undefined
          ? (layered?.subtypes ?? effectiveSubtypes(state, registry, live))
          : lki!.subtypes;
      if (!shared.types.some((t) => hasSubtype(subtypes, t))) return false;
    }
  }
  const name = live !== undefined ? printedCardName(live) : lki!.name;
  if (filter.supertype !== undefined || filter.notSupertype !== undefined) {
    const supertypes =
      live !== undefined ? (layered?.supertypes ?? effectiveSupertypes(state, registry, live)) : lki!.supertypes;
    if (filter.supertype !== undefined && !supertypes.includes(filter.supertype)) return false;
    if (filter.notSupertype !== undefined && supertypes.includes(filter.notSupertype)) {
      return false;
    }
  }
  // The name it has — a copy exception's, if one renamed it (`nameOf`).
  const named = live !== undefined ? nameOf(live) : (lki!.renamed ?? lki!.name);
  if (filter.name !== undefined && named !== filter.name) return false;
  if (filter.sameNameAsAny !== undefined) {
    // A nameless object (face down, rule 708.2a) shares a name with nothing;
    // one name in common is enough — a split card's either half (201.2a).
    const names = live !== undefined ? namesOf(registry, live) : lastKnownNames(registry, lki!);
    if (!names.some((n) => filter.sameNameAsAny!.includes(n))) return false;
  }
  if (filter.sameNameAs !== undefined && id !== filter.sameNameAs.object) {
    // Rule 201.2a: an object with no name shares it with nothing — a
    // face-down permanent, or a Room with both doors locked (709.5) — and
    // one name in common is enough.
    const names = live !== undefined ? namesOf(registry, live) : lastKnownNames(registry, lki!);
    if (!names.some((n) => filter.sameNameAs!.names.includes(n))) return false;
    if (filter.sameNameTokensOnly === true && !(live !== undefined ? isTokenNow(live) : lki!.isToken)) return false;
  }
  if (filter.doubleFaced === true) {
    const card = object;
    const isOne =
      card !== undefined &&
      ((card.faces?.length ?? 0) > 1 ||
        card.melded !== undefined ||
        (registry.has(card.cardName) && registry.get(card.cardName).meldCard));
    if (!isOne) return false;
  }
  if (filter.sameNameAsSource !== undefined) {
    const applying = filter.appliedBy ?? ctx.source;
    const from = applying === undefined ? undefined : state.objects[applying];
    const names = live !== undefined ? namesOf(registry, live) : lastKnownNames(registry, lki!);
    // A source that has left the battlefield goes by the name it last had
    // there (rules 113.7a, 608.2h): a Clone's ability doesn't start asking
    // for "Clone" because the Clone died in response.
    const gone =
      applying === undefined
        ? undefined
        : from === undefined
          ? state.ceasedTokens?.[applying]
          : from.zone !== "battlefield" && from.zone !== "stack"
            ? from.lastKnown
            : undefined;
    const sourceNames = gone !== undefined ? lastKnownNames(registry, gone) : from !== undefined ? namesOf(registry, from) : [];
    const same = sourceNames.some((n) => names.includes(n));
    if (same !== filter.sameNameAsSource) return false;
  }
  if (filter.sameNameWith !== undefined) {
    // Rule 201.2a over the objects the reference names now. A reference
    // only an effect can read is bound before it gets here; one left
    // unbound, or asked inside the layer fold, matches nothing.
    if (layered !== undefined) return false;
    const others = liveReferenceObjects(state, registry, filter.sameNameWith, ctx, live?.controller ?? lki?.controller);
    if (others === undefined) return false;
    const names = live !== undefined ? namesOf(registry, live) : lastKnownNames(registry, lki!);
    const shared = others.some((other) => {
      const object = state.objects[other];
      // A card exiled face down has no name to share (rule 406.3a).
      if (object === undefined || object.exiledFaceDown !== undefined || object.foretold === true) return false;
      // The source gone: as it last existed (rules 113.7a, 608.2h), so a copy
      // that's died is read by the name it was copying (Evil Twin).
      if (other === ctx.source && object.zone !== "battlefield" && object.lastKnown !== undefined) {
        return lastKnownNames(registry, object.lastKnown).some((n) => names.includes(n));
      }
      return namesOf(registry, object).some((n) => names.includes(n));
    });
    if (!shared) return false;
  }
  if (filter.sameNameAsAnother !== undefined) {
    if (layered !== undefined) return false;
    const inner = filter.sameNameAsAnother;
    const innerCtx: FilterContext = { you: ctx.you, ...(ctx.source !== undefined ? { source: ctx.source } : {}) };
    const names = live !== undefined ? namesOf(registry, live) : lastKnownNames(registry, lki!);
    if (names.length === 0) return false;
    const fellowToken = (live?.stackCount ?? 1) > 1 && matchesFilter(state, registry, id, inner, innerCtx);
    const another = (): boolean =>
      state.zones.shared.battlefield.some((other) => {
        if (other === id) return false;
        const object = state.objects[other];
        return (
          object !== undefined &&
          namesOf(registry, object).some((n) => names.includes(n)) &&
          matchesFilter(state, registry, other, inner, innerCtx)
        );
      });
    if (!fellowToken && !another()) return false;
  }
  if (filter.notName !== undefined && named === filter.notName) return false;
  if (filter.hasName !== undefined || filter.chosenName === true) {
    const names = live !== undefined ? namesOf(registry, live) : lastKnownNames(registry, lki!);
    if (filter.hasName !== undefined && !names.includes(filter.hasName)) return false;
    if (filter.chosenName === true) {
      const from = ctx.source === undefined ? undefined : state.objects[ctx.source];
      const chosen =
        from?.zone === "battlefield" || from?.zone === "phased-out"
          ? (from.chosenNames ?? [])
          : (from?.chosenNames ?? from?.lastKnown?.chosenNames ?? []);
      if (!names.some((n) => chosen.includes(n))) return false;
    }
  }
  if (filter.sharesColorBound !== undefined && !filter.sharesColorBound.objects.includes(id)) {
    const colors: ReadonlySet<Color> =
      live !== undefined ? effectiveColors(state, registry, live) : new Set(lki!.colors);
    if (!filter.sharesColorBound.colors.some((col) => colors.has(col))) return false;
  }
  if (filter.sharesColorWith !== undefined) {
    const others = liveReferenceObjects(state, registry, filter.sharesColorWith, ctx, live?.controller ?? lki?.controller);
    if (others === undefined || (ctx.layered !== undefined && filter.sharesColorWith !== "attached")) return false;
    if (!others.includes(id)) {
      const colors: ReadonlySet<Color> =
        live !== undefined ? effectiveColors(state, registry, live) : new Set(lki!.colors);
      const shared = others.some((other) => {
        const object = state.objects[other];
        return object !== undefined && [...effectiveColors(state, registry, object)].some((color) => colors.has(color));
      });
      if (!shared) return false;
    }
  }

  if (
    filter.colors !== undefined ||
    filter.notColors !== undefined ||
    filter.colorless !== undefined ||
    filter.multicolored !== undefined ||
    filter.colorCount !== undefined ||
    filter.ofChosenColor !== undefined ||
    filter.onlyColorItsControllerChose !== undefined
  ) {
    const colors: ReadonlySet<Color> =
      live !== undefined ? effectiveColors(state, registry, live) : new Set(lki!.colors);
    if (filter.ofChosenColor === true) {
      // As `ofChosenType`: a source that has left reads its last choice.
      const from = ctx.source === undefined ? undefined : state.objects[ctx.source];
      const chosen = from?.chosenOnEnter ?? (from?.zone === "battlefield" ? null : from?.lastKnown?.chosenOnEnter);
      if (chosen == null || !colors.has(chosen as Color)) return false;
    }
    if (filter.colors !== undefined && !filter.colors.every((col) => colors.has(col))) {
      return false;
    }
    if (filter.notColors !== undefined && filter.notColors.some((col) => colors.has(col))) {
      return false;
    }
    if (filter.colorless !== undefined && (colors.size === 0) !== filter.colorless) return false;
    if (filter.multicolored !== undefined && colors.size >= 2 !== filter.multicolored) {
      return false;
    }
    if (filter.colorCount !== undefined && colors.size !== filter.colorCount) return false;
    if (filter.onlyColorItsControllerChose !== undefined) {
      const controller = live !== undefined ? live.controller : lki!.controller;
      const vote = votesThisWay(state).find((v) => v.voter === controller && "option" in v.choice);
      const chosen =
        vote !== undefined && "option" in vote.choice ? filter.onlyColorItsControllerChose[vote.choice.option] : undefined;
      if (chosen === undefined || colors.size !== 1 || !colors.has(chosen)) return false;
    }
  }

  if (filter.blocking !== undefined) {
    const blocking = live !== undefined ? live.blocking !== null : lki!.blocking;
    if (blocking !== filter.blocking) return false;
  }
  if (filter.attacking !== undefined) {
    // Off the battlefield `attacking` has been cleared by the move, and only
    // a snapshot still knows (Kardur's "whenever an attacking creature dies").
    const attacking = live !== undefined ? live.attacking !== null : lki!.attacking;
    if (attacking !== filter.attacking) return false;
  }
  if (filter.attackingPlayer === true) {
    const at = live?.attacking;
    if (at === undefined || at === null || state.players[at as PlayerId] === undefined) return false;
  }
  if (filter.controlledByDefendingPlayer === true) {
    const controller = live?.controller;
    const defending = state.zones.shared.battlefield.some((id) => {
      const attacked = state.objects[id]?.attacking;
      if (attacked === null || attacked === undefined) return false;
      if (state.players[attacked as PlayerId] !== undefined) return attacked === controller;
      const defender = state.objects[attacked as ObjectId];
      return (defender?.protector ?? defender?.controller) === controller;
    });
    if (controller === undefined || !defending) return false;
  }
  if (filter.attackingBattle !== undefined) {
    // Only a battle has a protector (rule 310.8).
    const defender = live?.attacking;
    const battle =
      defender !== null && defender !== undefined && state.objects[defender as ObjectId]?.protector !== undefined;
    if (battle !== filter.attackingBattle) return false;
  }
  if (filter.attackingYou !== undefined) {
    const attackingYou = live?.zone === "battlefield" && live.attacking === ctx.you;
    if (attackingYou !== filter.attackingYou) return false;
  }
  if (filter.attackingOpponent !== undefined) {
    const attacked = live?.zone === "battlefield" ? live.attacking : null;
    if (attacked === null || attacked === ctx.you) return false;
    if (state.players[attacked as PlayerId] === undefined) {
      // A planeswalker or a battle (rule 506.2): only a battle has a
      // protector (310.9), and a planeswalker is its controller's.
      const permanent = filter.attackingOpponent === true ? undefined : state.objects[attacked as ObjectId];
      if (permanent === undefined || permanent.protector !== undefined || permanent.controller === ctx.you) return false;
    }
  }
  if (filter.attackingChosenPlayer === true) {
    const from = ctx.source === undefined ? undefined : state.objects[ctx.source];
    const chosen = from?.zone === "battlefield" ? from.chosenPlayer : undefined;
    if (chosen === undefined || live?.zone !== "battlefield" || live.attacking !== chosen) return false;
  }
  if (filter.unblocked !== undefined) {
    const step = state.turn.step;
    const unblocked =
      live !== undefined &&
      live.zone === "battlefield" &&
      live.attacking !== null &&
      !live.blocked &&
      (step === "declare-blockers" || step === "combat-damage" || step === "end-combat");
    if (unblocked !== filter.unblocked) return false;
  }
  if (filter.blocked !== undefined) {
    const blocked = live !== undefined && live.zone === "battlefield" && live.attacking !== null && live.blocked;
    if (blocked !== filter.blocked) return false;
  }
  if (filter.suspected !== undefined) {
    const suspected =
      live !== undefined ? live.zone === "battlefield" && live.suspectedAt !== undefined : lki!.suspected === true;
    if (suspected !== filter.suspected) return false;
  }
  if (filter.saddled !== undefined) {
    const saddled = live !== undefined ? live.zone === "battlefield" && live.saddled === true : lki!.saddled === true;
    if (saddled !== filter.saddled) return false;
  }
  if (filter.monstrous !== undefined) {
    const monstrous = live !== undefined ? live.zone === "battlefield" && live.monstrous === true : lki!.monstrous === true;
    if (monstrous !== filter.monstrous) return false;
  }
  if (filter.harnessed !== undefined) {
    const harnessed = live !== undefined ? live.zone === "battlefield" && live.harnessed === true : lki!.harnessed === true;
    if (harnessed !== filter.harnessed) return false;
  }
  if (filter.enlistedThisCombat !== undefined) {
    // Rule 702.154c, in the combat under way: the mark is the combat's. A
    // creature off the battlefield enlisted nothing (400.7), unless it's
    // read as it last existed there (608.2h).
    const mark = live !== undefined ? (live.zone === "battlefield" ? live.enlistedIn : undefined) : lki!.enlistedIn;
    const enlisted =
      mark !== undefined &&
      mark.turn === state.turn.number &&
      mark.phase === (state.turn.combatPhases ?? 1) &&
      (state.turn.step === "declare-attackers" ||
        state.turn.step === "declare-blockers" ||
        state.turn.step === "combat-damage" ||
        state.turn.step === "end-combat");
    if (enlisted !== filter.enlistedThisCombat) return false;
  }
  if (filter.bandedWithSource !== undefined || filter.bandedWith !== undefined) {
    const with_ = filter.bandedWith ?? ctx.source;
    const other = with_ === undefined ? undefined : state.objects[with_];
    const banded =
      live !== undefined &&
      other !== undefined &&
      live.id !== other.id &&
      live.band !== undefined &&
      live.band === other.band &&
      live.attacking !== null &&
      other.attacking !== null;
    if (filter.bandedWithSource !== undefined && banded !== filter.bandedWithSource) return false;
    if (filter.bandedWith !== undefined && !banded) return false;
  }
  if (filter.blockingRelation !== undefined) {
    const { relation, of, with: bound } = filter.blockingRelation;
    const partner = bound ?? blockingPartnerOf(state, of ?? "source", ctx.source);
    if (live === undefined || partner === undefined || !inBlockingRelation(state, live, partner, relation)) return false;
  }
  if (filter.blockerCount !== undefined) {
    if (live === undefined || !compareNum(creaturesBlocking(state, id), filter.blockerCount, ctx.x)) return false;
  }
  if (filter.blockedThisTurn !== undefined) {
    const stint = live !== undefined ? (live.zoneChangeCount ?? 0) : lki!.zoneChangeCount;
    if (!blockedThisTurnMatches(state, registry, id, stint, filter.blockedThisTurn, ctx)) return false;
  }
  if (filter.isSource !== undefined) {
    const applying = filter.appliedBy ?? ctx.source;
    if ((applying !== undefined && applying === id) !== filter.isSource) return false;
  }
  if (filter.hostOfSource !== undefined) {
    const by = ctx.source === undefined ? undefined : state.objects[ctx.source];
    const host =
      live !== undefined &&
      live.zone === "battlefield" &&
      by !== undefined &&
      by.zone === "battlefield" &&
      by.attachedTo === live.id;
    if (host !== filter.hostOfSource) return false;
  }
  if (filter.saddledSource !== undefined || filter.saddledBy !== undefined) {
    // Rule 702.171c: only a creature on the battlefield now can have saddled
    // anything this turn — one that left is a new object (400.7).
    const mount = filter.saddledBy ?? ctx.source;
    const did = live !== undefined && mount !== undefined && saddledMount(state, live, mount);
    if (filter.saddledSource !== undefined && did !== filter.saddledSource) return false;
    if (filter.saddledBy !== undefined && !did) return false;
  }
  if (filter.crewedSource !== undefined || filter.crewedBy !== undefined) {
    // Rule 702.122b-c, as saddle's: only a creature on the battlefield now.
    const vehicle = filter.crewedBy ?? ctx.source;
    const did = live?.zone === "battlefield" && vehicle !== undefined && crewedVehicle(state, live, vehicle);
    if (filter.crewedSource !== undefined && did !== filter.crewedSource) return false;
    if (filter.crewedBy !== undefined && !did) return false;
  }
  if (filter.crewedBySource !== undefined) {
    // Rule 702.122c: the source crewed this very permanent this turn.
    const by = ctx.source === undefined ? undefined : state.objects[ctx.source];
    const crewed =
      live?.zone === "battlefield" &&
      by?.zone === "battlefield" &&
      (by.crewedThisTurn ?? []).some((r) => r.vehicle === live.id && r.stint === (live.zoneChangeCount ?? 0));
    if (crewed !== filter.crewedBySource) return false;
  }
  if (filter.goaded !== undefined) {
    // Goaded is a designation of a permanent (rule 701.15b): nothing off the
    // battlefield is, bar what a snapshot says it was as it left.
    const goaded =
      live !== undefined
        ? isGoaded(
            state,
            registry,
            id,
            layered === undefined
              ? {}
              : { inFold: true, types: layered.types, subtypes: layered.subtypes, supertypes: layered.supertypes, keywords: layered.keywords },
          )
        : (lki!.goaders?.length ?? 0) > 0;
    if (goaded !== filter.goaded) return false;
  }
  if (filter.goadedByYou !== undefined) {
    const goaders = live !== undefined ? goadersOf(state, registry, id) : (lki!.goaders ?? []);
    if (goaders.includes(ctx.you) !== filter.goadedByYou) return false;
  }
  // A `NumCompare` operand read off the game: `{ own }` from this object,
  // `{ amount }` from whoever is applying the filter.
  let own:
    | {
        readonly power: number;
        readonly toughness: number;
        readonly basePower: number;
        readonly baseToughness: number;
      }
    | undefined = lki;
  const manaValueNow = (): number =>
    live !== undefined ? manaValueOfObject(registry, live, ctx.castX) : lki!.manaValue;
  const dynamic = (operand: DynamicOperand): number | undefined => {
    if ("amount" in operand) {
      if (operand.forItsController !== true) return ctx.amount?.(operand.amount);
      return ctx.amount?.(operand.amount, live !== undefined ? live.controller : lki!.controller);
    }
    if ("chosenThisWay" in operand) {
      if (layered !== undefined) return undefined;
      const powers = thisWayEntries(state, "chosen").flatMap((entry) =>
        state.objects[entry.object]?.zone === "battlefield"
          ? [computeCharacteristics(state, registry, entry.object).power]
          : [],
      );
      return powers.length === 0 ? undefined : Math.max(...powers);
    }
    if (operand.own === "manaValue") return manaValueNow();
    if (own === undefined && layered !== undefined) return undefined;
    own ??= computeCharacteristics(state, registry, id);
    return own[operand.own];
  };
  const counters = live !== undefined ? live.counters : lki!.counters;
  if (filter.counters !== undefined) {
    const held = filter.counters.kind === undefined
      ? Object.values(counters).reduce((n, v) => n + (v ?? 0), 0)
      : (counters[filter.counters.kind] ?? 0);
    if (!compareNum(held, filter.counters.compare, ctx.x, dynamic)) return false;
  }
  if (filter.manaValue !== undefined) {
    if (!compareNum(manaValueNow(), filter.manaValue, ctx.x, dynamic)) return false;
  }
  if (filter.xValue !== undefined) {
    const chosen = live !== undefined && live.zone === "stack" ? (live.xValue ?? 0) : 0;
    if (!compareNum(chosen, filter.xValue, ctx.x, dynamic)) return false;
  }
  if (filter.manaValueParity !== undefined && !hasParity(state, manaValueNow(), filter.manaValueParity, ctx.source)) {
    return false;
  }
  if (filter.manaCost !== undefined) {
    const name = live !== undefined ? printedCardName(live) : lki!.name;
    const override = live === undefined ? undefined : manaCostOverride(live);
    const cost = override !== undefined ? override : registry.has(name) ? registry.get(name).manaCost : null;
    if (cost === null || !filter.manaCost.includes(cost)) return false;
  }
  if (filter.xInManaCost !== undefined || filter.coloredManaSymbols !== undefined) {
    const cost = ownManaCost(registry, live !== undefined ? printedCardName(live) : lki!.name);
    if (filter.xInManaCost !== undefined && cost.x > 0 !== filter.xInManaCost) return false;
    if (
      filter.coloredManaSymbols !== undefined &&
      !compareNum(coloredManaSymbolsIn(cost), filter.coloredManaSymbols, ctx.x, dynamic)
    ) {
      return false;
    }
  }
  if (
    filter.cardTypeCount !== undefined &&
    !compareNum(types().length, filter.cardTypeCount, ctx.x, dynamic)
  ) {
    return false;
  }
  if (filter.manaSpent !== undefined) {
    const spent = (live !== undefined ? live.manaSpent : lki!.manaSpent) ?? [];
    // "Using mana produced by Barracks of the Thousand": this permanent, in
    // this stint on the battlefield.
    const source = ctx.source === undefined ? undefined : state.objects[ctx.source];
    const isFromSource = (origin: ManaOrigin): boolean =>
      source !== undefined && origin.object === ctx.source && origin.stint === (source.zoneChangeCount ?? 0);
    for (const clause of filter.manaSpent) {
      const n = spentManaCount(spent, clause, isFromSource);
      if (clause.amount === undefined ? n < 1 : !compareNum(n, clause.amount, ctx.x, dynamic)) return false;
    }
  }
  // Cheap, purely-positional clauses before the expensive fold below.
  const controller = ctx.enteringUnder ?? (live !== undefined ? live.controller : lki!.controller);
  const owner = live !== undefined ? live.owner : lki!.owner;
  if (filter.controlledBy === "you" && controller !== ctx.you) return false;
  if (filter.controlledBy === "opponent" && controller === ctx.you) return false;
  if (filter.controlledBy === "active-player" && controller !== activePlayerOf(state)) return false;
  if (filter.controlledBy === "monarch" && controller !== state.monarch) return false;
  if (filter.controlledBy === "chooser" && (ctx.chooser === undefined || controller !== ctx.chooser)) return false;
  if (filter.controlledBy === "enchanted-player") {
    const aura = ctx.source === undefined ? undefined : state.objects[ctx.source];
    if (aura?.attachedToPlayer === undefined || controller !== aura.attachedToPlayer) return false;
  }
  if (filter.controlledBy === "chosen-player") {
    const from = ctx.source === undefined ? undefined : state.objects[ctx.source];
    const chosen = from?.zone === "battlefield" ? from.chosenPlayer : from?.lastKnown?.chosenPlayer;
    if (chosen === undefined || controller !== chosen) return false;
  }
  if (filter.controllerIn !== undefined && !filter.controllerIn.includes(controller)) return false;
  if (filter.controlledByAsSetUp !== undefined) return false;
  if (
    filter.controllerGraveyardAtLeast !== undefined &&
    (state.zones.perPlayer[controller]?.graveyard.length ?? 0) < filter.controllerGraveyardAtLeast
  ) {
    return false;
  }
  if (
    filter.controllerThisTurn !== undefined &&
    turnStatOf(state, controller, filter.controllerThisTurn.stat) < (filter.controllerThisTurn.atLeast ?? 1)
  ) {
    return false;
  }
  if (filter.controllerTurnHistory !== undefined) {
    const asked = filter.controllerTurnHistory;
    const n = journalCount(state, registry, [controller], asked.what, asked.filter, ctx.you, undefined, {
      ...(asked.window !== undefined ? { window: asked.window } : {}),
    });
    if (n < (asked.atLeast ?? 1)) return false;
  }
  if (filter.ownedBy === "you" && owner !== ctx.you) return false;
  if (filter.ownedBy === "opponent" && owner === ctx.you) return false;
  if (filter.ownerIn !== undefined && !filter.ownerIn.includes(owner)) return false;
  if (filter.ownedByRef !== undefined) return false;
  if (filter.notOwnedByController === true && owner === controller) return false;
  if (filter.protectedBy !== undefined) {
    // A battle stops having a protector as it leaves the battlefield.
    const protector = live?.zone === "battlefield" ? live.protector : undefined;
    if (protector === undefined || (protector === ctx.you) !== (filter.protectedBy === "you")) return false;
  }
  if (filter.tapped !== undefined) {
    const tapped = live !== undefined ? live.tapped : lki!.tapped;
    if (tapped !== filter.tapped) return false;
  }
  if (filter.token !== undefined) {
    const token = live !== undefined ? isTokenNow(live) : lki!.isToken;
    if (token !== filter.token) return false;
  }
  if (filter.isCommander !== undefined) {
    const commander = live !== undefined ? live.isCommander : lki!.isCommander;
    if (commander !== filter.isCommander) return false;
  }
  if (filter.renowned !== undefined) {
    const renowned = live !== undefined ? live.zone === "battlefield" && live.renowned === true : lki!.renowned === true;
    if (renowned !== filter.renowned) return false;
  }
  if (filter.enteredThisTurn !== undefined) {
    const turn = live !== undefined ? live.enteredBattlefieldOnTurn : (lki!.enteredOnTurn ?? null);
    if ((turn === state.turn.number) !== filter.enteredThisTurn) return false;
  }
  if (filter.controlledSinceTurnBegan !== undefined) {
    const held =
      live !== undefined &&
      live.zone === "battlefield" &&
      (live.controlSinceSeq ?? 0) < (state.turn.beganAtSeq ?? 0);
    if (held !== filter.controlledSinceTurnBegan) return false;
  }
  if (filter.controlledContinuously !== undefined) {
    const held = live !== undefined && live.zone === "battlefield" && !live.summoningSick;
    if (held !== filter.controlledContinuously) return false;
  }
  if (
    filter.cast !== undefined ||
    filter.castBy !== undefined ||
    filter.castFrom !== undefined ||
    filter.castVia !== undefined ||
    filter.enteredFrom !== undefined ||
    filter.played !== undefined ||
    filter.putThereBySource !== undefined
  ) {
    const entry = live !== undefined ? (live.zone === "battlefield" ? live.entry : undefined) : lki!.entry;
    // A spell still on the stack: how it was cast, as its move onto the
    // battlefield would record it — Delayed Blast Fireball's "if this spell
    // was cast from exile". A copy was never cast.
    const cast =
      live !== undefined && live.zone === "stack"
        ? live.kind === "card" && live.castFrom !== undefined
          ? { by: spellCaster(live), from: live.castFrom, via: live.castVia ?? undefined }
          : undefined
        : entry?.cast;
    if (filter.cast !== undefined && (cast !== undefined) !== filter.cast) return false;
    if (filter.castBy === "you" && cast?.by !== ctx.you) return false;
    if (filter.castFrom !== undefined) {
      if (typeof filter.castFrom === "object" ? cast === undefined || cast.from === filter.castFrom.not : cast?.from !== filter.castFrom) return false;
    }
    // A foretold card cast for a cost it was given was foretold all the same (702.143c).
    if (filter.castVia !== undefined && (cast?.via === "foretell-given" ? "foretell" : cast?.via) !== filter.castVia) return false;
    if (filter.enteredFrom !== undefined && entry?.from !== filter.enteredFrom) return false;
    if (filter.played !== undefined && (entry?.played === true) !== filter.played) return false;
    if (filter.putThereBySource !== undefined) {
      const by = entry?.by;
      const asker = ctx.source === undefined ? undefined : state.objects[ctx.source];
      const byIt = by !== undefined && asker !== undefined && by.source === asker.id && by.timestamp === asker.timestamp;
      if (byIt !== filter.putThereBySource) return false;
    }
  }
  // A spell's targets, as it is on the stack: a snapshot is of a permanent,
  // which has none.
  if (
    filter.stackObjectTargets !== undefined &&
    (live === undefined || !stackObjectTargetsMatch(state, registry, live, filter.stackObjectTargets, ctx))
  ) {
    return false;
  }
  if (filter.targets !== undefined && (live === undefined || !spellTargetsMatch(state, registry, live, filter.targets, ctx))) {
    return false;
  }
  if (filter.assisted !== undefined && (state.objects[id]?.assistedBy !== undefined) !== filter.assisted) return false;
  if (
    filter.damagedThisTurnBy !== undefined ||
    filter.excessDamageThisTurn !== undefined ||
    filter.dealtDamageToCreatureThisTurn !== undefined
  ) {
    const onBattlefield = live === undefined || live.zone === "battlefield";
    const record = live !== undefined ? live.damageThisTurn : lki!.damageThisTurn;
    const history = onBattlefield && record?.turn === state.turn.number ? record : undefined;
    if (filter.excessDamageThisTurn !== undefined && (history?.excess === true) !== filter.excessDamageThisTurn) {
      return false;
    }
    const by = filter.damagedThisTurnBy;
    const one = by?.source === undefined ? undefined : damagingStint(state, by.source, ctx.source);
    if (
      by !== undefined &&
      ((by.source !== undefined && one === undefined) ||
      !(history?.by ?? []).some(
        (source) =>
          (one === undefined ||
            (source.source === one.id && source.sourceZoneChangeCount === one.zoneChangeCount)) &&
          (by.subtype === undefined || hasSubtype(source.subtypes, by.subtype)) &&
          (by.type === undefined || source.types.includes(by.type)) &&
          (by.spell !== true || source.spell === true) &&
          (by.controlledBy === undefined ||
            (by.controlledBy === "you" ? source.controller === ctx.you : source.controller !== ctx.you)),
      ))
    ) {
      return false;
    }
    if (filter.dealtDamageToCreatureThisTurn !== undefined) {
      const turn = live !== undefined ? live.dealtDamageToCreatureOnTurn : lki!.dealtDamageToCreatureOnTurn;
      if ((onBattlefield && turn === state.turn.number) !== filter.dealtDamageToCreatureThisTurn) return false;
    }
  }
  if (filter.dealtDamageThisTurn !== undefined) {
    const onBattlefield = live === undefined || live.zone === "battlefield";
    const record = live !== undefined ? live.dealtDamage : lki!.dealtDamage;
    const now = onBattlefield && record?.thisTurn?.turn === state.turn.number ? record.thisTurn : undefined;
    if (now === undefined) return false;
    const clause = filter.dealtDamageThisTurn;
    if (clause !== true) {
      const player = clause.to === "you" ? ctx.you : clause.to.player;
      if (!(clause.combat === true ? now.combatPlayers : now.players).includes(player)) return false;
    }
  }
  if (filter.turnedFaceUpThisTurn !== undefined) {
    const turned = (live !== undefined ? live.turnedFaceUpOnTurn : lki!.turnedFaceUpOnTurn) === state.turn.number;
    if (turned !== filter.turnedFaceUpThisTurn) return false;
  }
  if (filter.journaled !== undefined) {
    const stint = live !== undefined ? (live.zoneChangeCount ?? 0) : lki!.zoneChangeCount;
    if (!journaledMatches(state, registry, id, stint, filter.journaled, ctx.you)) return false;
  }
  if (filter.attackedThisTurn !== undefined) {
    const attacked =
      live !== undefined
        ? live.zone === "battlefield" && live.attackedThisTurn === true
        : lki!.attackedOnTurn === state.turn.number;
    if (attacked !== filter.attackedThisTurn) return false;
  }
  if (filter.attackedThisCombat !== undefined) {
    const record = live !== undefined ? (live.zone === "battlefield" ? live.lastAttack : undefined) : lki!.lastAttack;
    const attacked =
      record !== undefined &&
      record.combat.turn === state.turn.number &&
      record.combat.phase === (state.turn.combatPhases ?? 1);
    if (attacked !== filter.attackedThisCombat) return false;
  }
  if (filter.attackedYouThisTurn !== undefined) {
    const attacked =
      live !== undefined
        ? live.zone === "battlefield" && live.attackedPlayersThisTurn?.includes(ctx.you) === true
        : lki!.attackedOnTurn === state.turn.number && lki!.attackedPlayers?.includes(ctx.you) === true;
    if (attacked !== filter.attackedYouThisTurn) return false;
  }
  if (filter.attackedDuringControllersLastTurn !== undefined) {
    const was = live ?? lki!;
    const last = controllersLastTurn(state, was.controller);
    const attacked =
      last !== undefined &&
      (live === undefined || live.zone === "battlefield") &&
      was.attackedOnTurns?.includes(last) === true;
    if (attacked !== filter.attackedDuringControllersLastTurn) return false;
  }
  if (filter.attackedBattleThisTurn !== undefined) {
    const attacked =
      live !== undefined
        ? live.zone === "battlefield" && live.attackedBattleThisTurn === true
        : lki!.attackedBattleOnTurn === state.turn.number;
    if (attacked !== filter.attackedBattleThisTurn) return false;
  }
  if (filter.putIntoGraveyardFromLibraryThisTurn !== undefined) {
    // A snapshot is of a permanent, which didn't come from a library.
    const milled =
      live !== undefined &&
      live.zone === "graveyard" &&
      live.putIntoGraveyardOn?.from === "library" &&
      live.putIntoGraveyardOn.turn === state.turn.number;
    if (milled !== filter.putIntoGraveyardFromLibraryThisTurn) return false;
  }
  if (filter.putIntoGraveyardThisTurn !== undefined) {
    const arrival = live !== undefined && live.zone === "graveyard" ? live.putIntoGraveyardOn : undefined;
    if (arrival === undefined || arrival.turn !== state.turn.number) return false;
    const from = filter.putIntoGraveyardThisTurn.from;
    if (from !== undefined && !from.includes(arrival.from)) return false;
  }
  if (filter.discardedThisTurn !== undefined) {
    // A snapshot is of a permanent, which wasn't discarded.
    const discarded = live !== undefined && live.discardedOnTurn === state.turn.number;
    if (discarded !== filter.discardedThisTurn) return false;
  }
  if (filter.milledThisTurn !== undefined) {
    // A snapshot is of a permanent, which wasn't milled.
    const milled = live !== undefined && live.milledOnTurn === state.turn.number;
    if (milled !== filter.milledThisTurn) return false;
  }
  if (filter.drawnThisTurn !== undefined) {
    const drawn = live !== undefined && live.drawnOnTurn === state.turn.number;
    if (drawn !== filter.drawnThisTurn) return false;
  }
  // "Your Ring-bearer" (rule 701.54e) — the filtering player's, on the
  // battlefield now; "Ring-bearers" (`"any"`), anyone's.
  if (filter.ringBearer === "any") {
    if (live === undefined || live.zone !== "battlefield" || !hasRingBearerDesignation(live)) return false;
  } else if (
    filter.ringBearer !== undefined &&
    (live !== undefined && isRingBearer(state, ctx.you, id)) !== filter.ringBearer
  ) {
    return false;
  }
  if (filter.paired !== undefined) {
    const paired = live !== undefined && pairedPartner(state, live) !== undefined;
    if (paired !== filter.paired) return false;
  }
  if (filter.prepared !== undefined) {
    const prepared = live !== undefined && live.zone === "battlefield" && live.prepared !== undefined;
    if (prepared !== filter.prepared) return false;
  }
  if (filter.preparedSpell !== undefined && (live?.preparedSpell === true) !== filter.preparedSpell) return false;
  if (filter.hasAdventure !== undefined) {
    // "A card that has an Adventure" (rule 715.2a): an adventurer card, in any
    // zone, by its printed definition — but not a spell cast as the Adventure,
    // which has only the Adventure's characteristics (715.3b — the rulings: it
    // "won't find an instant or sorcery spell on the stack that's been cast as
    // an Adventure"). Both faces carry `adventure`; the Adventure's is subtyped.
    const name = live !== undefined ? printedCardName(live) : lki?.name;
    const def = name !== undefined && registry.has(name) ? registry.get(name) : undefined;
    // A card exiled face down has no characteristics (rule 406.3a).
    const faceDown = live?.exiledFaceDown !== undefined;
    const has = !faceDown && def !== undefined && def.adventure && !def.subtypes.includes("Adventure");
    if (has !== filter.hasAdventure) return false;
  }
  if (filter.hasKeyword !== undefined) {
    const textName = live !== undefined ? rulesTextName(live) : lki?.name;
    const def = textName !== undefined && registry.has(textName) ? registry.get(textName) : undefined;
    if (def === undefined || !CARD_KEYWORD_READS[filter.hasKeyword](def, live)) return false;
    // A permanent that lost its abilities has none of these (Abandoned Sarcophagus's ruling).
    if (live?.zone === "battlefield" && hasLostAbilities(state, registry, live)) return false;
  }
  if (filter.hasActivatedAbility !== undefined) {
    if (live === undefined) return false;
    if (!hasActivatedAbilityOf(state, registry, live, filter.hasActivatedAbility, layered !== undefined ? { inFold: true, types: layered.types, subtypes: layered.subtypes, supertypes: layered.supertypes, keywords: layered.keywords } : {})) return false;
  }
  if (filter.suspended !== undefined) {
    const suspended = live !== undefined && live.zone === "exile" && live.suspended === true && (live.counters.time ?? 0) > 0;
    if (suspended !== filter.suspended) return false;
  }
  if (filter.kicked !== undefined) {
    // Only a kicker (rule 702.33): a spell whose "kicker" is entwine, gift,
    // bargain or another keyword paid that cost, but wasn't kicked.
    const name = live !== undefined ? rulesTextName(live) : undefined;
    const kicker = name !== undefined && registry.has(name) ? registry.get(name).kicker : null;
    const kicked = live !== undefined && live.zone === "stack" && live.kicked === true && kicker?.keyword === undefined;
    if (kicked !== filter.kicked) return false;
  }
  if (filter.faceDown !== undefined) {
    const down = live !== undefined ? live.faceDown !== undefined : lki?.faceDown === true;
    if (down !== filter.faceDown) return false;
  }
  if (filter.attachedTo !== undefined) {
    const host = live !== undefined ? live.attachedTo : lki!.attachedTo;
    // The host is read as it is now, not through this object's snapshot: an
    // Equipment that has left still asks whether the creature it equipped is
    // a Vampire (Blade of the Bloodchief) — and that creature in the stint it
    // was attached in (rule 400.7).
    const { snapshot: _snapshot, lastKnown: _lastKnown, ...hostCtx } = ctx;
    if (
      host === null ||
      host === undefined ||
      state.objects[host]?.zone !== "battlefield" ||
      (lki?.attachedToStint !== undefined && state.objects[host].zoneChangeCount !== lki.attachedToStint) ||
      !matchesFilter(state, registry, host, filter.attachedTo, hostCtx)
    ) {
      return false;
    }
  }
  if (filter.attachments !== undefined) {
    if (live === undefined || live.zone !== "battlefield") return false;
    const { filter: of, atLeast = 1, otherThanSource } = filter.attachments;
    const { snapshot: _snapshot, lastKnown: _lastKnown, layered: _layered, ...attachedCtx } = ctx;
    let attached = 0;
    for (const other of state.zones.shared.battlefield) {
      if (state.objects[other].attachedTo !== live.id) continue;
      if (otherThanSource === true && other === ctx.source) continue;
      if (of === undefined || matchesFilter(state, registry, other, of, attachedCtx)) attached += 1;
    }
    if (attached < atLeast) return false;
  }
  // "Attached to it / that creature" (an effect's bound target slot) and
  // "attached to you" (rule 303.4): on the battlefield, as it is now.
  if (filter.attachedToObject !== undefined && filter.attachedToRef === undefined) return false;
  if (filter.controlledByRef !== undefined) return false;
  if (filter.aboveSourceInGraveyard === true) {
    const from = ctx.source === undefined ? undefined : state.objects[ctx.source];
    if (live === undefined || live.zone !== "graveyard" || from?.zone !== "graveyard" || from.owner !== live.owner) return false;
    const pile = state.zones.perPlayer[live.owner]?.graveyard ?? [];
    if (pile.indexOf(id) <= pile.indexOf(from.id)) return false;
  }
  // "That was attached to it" (an effect's bound `wasAttachedTo`): the same
  // object, still on the battlefield (rule 400.7).
  if (filter.wasAttachedTo !== undefined && filter.wasAttachedToAny === undefined) return false;
  if (filter.wasAttachedToAny !== undefined) {
    if (live === undefined || live.zone !== "battlefield") return false;
    const stint = live.zoneChangeCount ?? 0;
    if (!filter.wasAttachedToAny.some((a) => a.object === id && a.stint === stint)) return false;
  }
  if (filter.attachedToRef !== undefined || filter.attachedToPlayer !== undefined) {
    if (live === undefined || live.zone !== "battlefield") return false;
    const to = filter.attachedToRef;
    if (to === null) return false;
    if (to !== undefined) {
      const attached = to.kind === "object" ? live.attachedTo === to.object : live.attachedToPlayer === to.player;
      if (!attached) return false;
    }
    if (filter.attachedToPlayer !== undefined) {
      const player = live.attachedToPlayer;
      if (player === undefined) return false;
      if (filter.attachedToPlayer === "you" ? player !== ctx.you : player === ctx.you) return false;
    }
  }
  if (
    filter.equipped !== undefined ||
    filter.equipmentAttached !== undefined ||
    filter.enchanted !== undefined ||
    filter.enchantedBy !== undefined ||
    filter.modified !== undefined
  ) {
    const attached = live !== undefined ? attachmentsOf(state, registry, id) : lki!;
    if (filter.equipped !== undefined && attached.equipped !== filter.equipped) return false;
    if (
      filter.equipmentAttached !== undefined &&
      (live === undefined || !compareNum(attachmentsOf(state, registry, id).equipment, filter.equipmentAttached, ctx.x))
    ) {
      return false;
    }
    if (filter.enchanted !== undefined && attached.enchanted !== filter.enchanted) return false;
    if (filter.enchantedBy === "you" && !(attached.enchantedBy ?? []).includes(ctx.you)) return false;
    if (filter.modified !== undefined) {
      const modified =
        Object.values(counters).some((n) => (n ?? 0) > 0) ||
        attached.equipped ||
        attached.enchantedByController;
      if (modified !== filter.modified) return false;
    }
  }
  if (
    filter.anyOf !== undefined &&
    !filter.anyOf.some((each) =>
      matchesFilter(state, registry, id, each, lki === undefined ? ctx : { ...ctx, snapshot: lki }),
    )
  ) {
    return false;
  }
  if (
    filter.not !== undefined &&
    matchesFilter(state, registry, id, filter.not, lki === undefined ? ctx : { ...ctx, snapshot: lki })
  ) {
    return false;
  }
  if (filter.hasManaAbility !== undefined) {
    const has =
      live !== undefined
        ? hasManaAbility(
            state,
            registry,
            live,
            layered !== undefined
              ? { inFold: true, types: layered.types, subtypes: layered.subtypes, supertypes: layered.supertypes, keywords: layered.keywords }
              : {},
          )
        : lki!.hasManaAbility;
    if (has !== filter.hasManaAbility) return false;
  }
  // These can't be answered from inside the layer fold (see each clause).
  if (layered !== undefined && (filter.nameDiffersFromEach !== undefined || filter.nameUnlike !== undefined)) {
    return false;
  }
  if (filter.hasAbilities !== undefined) {
    const has =
      live !== undefined
        ? hasAnyAbility(
            state,
            registry,
            live,
            layered !== undefined
              ? { inFold: true, types: layered.types, subtypes: layered.subtypes, supertypes: layered.supertypes, keywords: layered.keywords, hasProtection: layered.hasProtection }
              : ctx.spellGrantAmount !== undefined
                ? { spellGrantAmount: ctx.spellGrantAmount }
                : {},
          )
        : lki!.hasAbilities;
    if (has !== filter.hasAbilities) return false;
  }
  if (filter.nameDiffersFromEach !== undefined) {
    // Rule 201.2c, against every battlefield permanent the inner filter
    // finds — from the same side, but as each permanent is now.
    const inner = filter.nameDiffersFromEach;
    const innerCtx: FilterContext = {
      you: ctx.you,
      ...(ctx.x !== undefined ? { x: ctx.x } : {}),
      ...(ctx.amount !== undefined ? { amount: ctx.amount } : {}),
      ...(ctx.source !== undefined ? { source: ctx.source } : {}),
    };
    // Any name in common: a Room card in a library has both its doors' names,
    // a Room on the battlefield only its unlocked ones'. No name of its own,
    // and it has no different name from anything.
    const mine = live !== undefined ? namesOf(registry, live) : lastKnownNames(registry, lki!);
    if (mine.length === 0) return false;
    const shared = state.zones.shared.battlefield.some((other) => {
      const object = state.objects[other];
      return (
        object !== undefined &&
        namesOf(registry, object).some((name) => mine.includes(name)) &&
        matchesFilter(state, registry, other, inner, innerCtx)
      );
    });
    if (shared) return false;
  }
  if (filter.nameUnlike !== undefined) {
    const { others, graveyard } = filter.nameUnlike;
    const innerCtx: FilterContext = {
      you: ctx.you,
      ...(ctx.x !== undefined ? { x: ctx.x } : {}),
      ...(ctx.amount !== undefined ? { amount: ctx.amount } : {}),
      ...(ctx.source !== undefined ? { source: ctx.source } : {}),
    };
    const sameName = (other: ObjectId): boolean => {
      const object = state.objects[other];
      return object !== undefined && nameOf(object) === named;
    };
    if (
      others !== undefined &&
      state.zones.shared.battlefield.some(
        // The object itself isn't "another" — but asked about as it last
        // existed, whatever now has its id is a new object (rule 400.7).
        (other) => (live === undefined || other !== id) && sameName(other) && matchesFilter(state, registry, other, others, innerCtx),
      )
    ) {
      return false;
    }
    if (
      graveyard !== undefined &&
      state.turnOrder.some((player) =>
        state.zones.perPlayer[player].graveyard.some(
          (card) => sameName(card) && matchesFilter(state, registry, card, graveyard, innerCtx),
        ),
      )
    ) {
      return false;
    }
  }

  // Only these need the layer fold (external anthems / keyword grants).
  if (
    filter.power !== undefined ||
    filter.powerParity !== undefined ||
    filter.toughness !== undefined ||
    filter.totalPowerToughness !== undefined ||
    filter.basePower !== undefined ||
    filter.baseToughness !== undefined ||
    filter.keyword !== undefined ||
    filter.notKeyword !== undefined
  ) {
    if (layered !== undefined) {
      // Inside the fold: keywords as far as it has got, P/T not at all.
      if (
        filter.power !== undefined ||
        filter.powerParity !== undefined ||
        filter.toughness !== undefined ||
        filter.totalPowerToughness !== undefined ||
        filter.basePower !== undefined ||
        filter.baseToughness !== undefined ||
        filter.greatestAmongItsController !== undefined
      ) {
        return false;
      }
      const keywords =
        layered.keywords?.() ??
        new Set(hasLostAbilities(state, registry, live!) ? [] : registry.get(name).keywords);
      if (filter.keyword !== undefined && !keywords.has(filter.keyword)) return false;
      if (filter.notKeyword !== undefined && keywords.has(filter.notKeyword)) return false;
      return true;
    }
    const c: {
      readonly power: number;
      readonly toughness: number;
      readonly basePower: number;
      readonly baseToughness: number;
      readonly keywords: ReadonlySet<Keyword>;
    } =
      lki !== undefined
        ? {
            power: lki.power,
            toughness: lki.toughness,
            basePower: lki.basePower,
            baseToughness: lki.baseToughness,
            keywords: new Set(lki.keywords),
          }
        : computeCharacteristics(state, registry, id);
    own = c;
    if (filter.powerParity !== undefined && !hasParity(state, c.power, filter.powerParity, ctx.source)) {
      return false;
    }
    if (filter.power !== undefined && !compareNum(c.power, filter.power, ctx.x, dynamic)) {
      return false;
    }
    if (filter.toughness !== undefined && !compareNum(c.toughness, filter.toughness, ctx.x, dynamic)) {
      return false;
    }
    if (
      filter.totalPowerToughness !== undefined &&
      !compareNum(c.power + c.toughness, filter.totalPowerToughness, ctx.x, dynamic)
    ) {
      return false;
    }
    if (filter.basePower !== undefined && !compareNum(c.basePower, filter.basePower, ctx.x, dynamic)) {
      return false;
    }
    if (
      filter.baseToughness !== undefined &&
      !compareNum(c.baseToughness, filter.baseToughness, ctx.x, dynamic)
    ) {
      return false;
    }
    if (filter.keyword !== undefined && !c.keywords.has(filter.keyword)) return false;
    if (filter.notKeyword !== undefined && c.keywords.has(filter.notKeyword)) return false;
  }

  if (filter.hasToxic !== undefined) {
    // Its total toxic value (rule 702.164b) above 0 — printed or granted.
    // Inside the layer fold, as far as the fold has got (a keyword-scoped
    // static's second pass — Skrelv's Hive), else only what it prints (no fold
    // within the fold); something that has left isn't asked (its snapshot
    // keeps no toxic).
    const has =
      live === undefined
        ? false
        : layered !== undefined
          ? layered.toxic !== undefined
            ? layered.toxic() > 0
            : !hasLostAbilities(state, registry, live) && registry.get(rulesTextName(live)).toxic > 0
          : computeCharacteristics(state, registry, id).toxic > 0;
    if (has !== filter.hasToxic) return false;
  }

  if (filter.keywordVariant !== undefined) {
    // Inside the layer fold, as far as the fold has got (no fold within the
    // fold); a snapshot keeps the plain keyword and no "from [quality]".
    let has: boolean;
    if (live === undefined) {
      has = filter.keywordVariant === "hexproof" && (lki?.keywords.includes("hexproof") ?? false);
    } else if (layered !== undefined) {
      has =
        filter.keywordVariant === "protection"
          ? layered.hasProtection?.() === true
          : (layered.keywords?.().has("hexproof") ??
            (!hasLostAbilities(state, registry, live) && registry.get(rulesTextName(live)).keywords.includes("hexproof")));
    } else if (live.zone !== "battlefield") {
      has = false;
    } else {
      const c = computeCharacteristics(state, registry, id);
      const from = filter.keywordVariant === "protection" ? c.protectionFrom : c.hexproofFrom;
      has =
        (filter.keywordVariant === "hexproof" && c.keywords.has("hexproof")) ||
        from.colors.size > 0 ||
        from.types.size > 0 ||
        from.filters.length > 0 ||
        (filter.keywordVariant === "protection" &&
          (c.protectionFrom.boundFilters.length > 0 || c.protectionFrom.players.size > 0));
    }
    if (!has) return false;
  }


  // "With the greatest power among creatures that player controls": none of
  // its controller's other matching permanents has more.
  const greatest = filter.greatestAmongItsController;
  if (greatest !== undefined) {
    // Not inside the layer fold, which can't read other permanents' P/T.
    if (layered !== undefined || live === undefined || live.zone !== "battlefield") return false;
    const mine = aggregateValueOf(state, registry, id, greatest.of);
    for (const other of state.zones.shared.battlefield) {
      if (other === id || state.objects[other]?.controller !== live.controller) continue;
      if (!matchesFilter(state, registry, other, greatest.among, { you: live.controller })) continue;
      const theirs = aggregateValueOf(state, registry, other, greatest.of);
      if (greatest.least === true ? theirs < mine : theirs > mine) return false;
    }
  }

  // "With the greatest power among creatures on the battlefield": nothing else
  // in its zone that matches has more, whoever controls it.
  const greatestInZone = filter.greatestInZone;
  if (greatestInZone !== undefined) {
    const { of, among, strictly, least } = greatestInZone;
    if (layered !== undefined && (of === "power" || of === "toughness")) return false;
    if (strictly === true && live?.zone === "battlefield" && (live.stackCount ?? 1) > 1) return false;
    const zone =
      live === undefined || live.zone === "battlefield"
        ? state.zones.shared.battlefield
        : live.zone === "graveyard"
          ? state.zones.perPlayer[live.owner]?.graveyard
          : undefined;
    if (zone === undefined) return false;
    const mine =
      live !== undefined
        ? aggregateValueOf(state, registry, id, of)
        : matchValueOf(state, registry, { id, weight: 1, lastKnown: lki }, of);
    for (const other of zone) {
      if (other === id || !matchesFilter(state, registry, other, among, { you: ctx.you })) continue;
      const theirs = aggregateValueOf(state, registry, other, of);
      if (least === true) {
        if (strictly === true ? theirs <= mine : theirs < mine) return false;
      } else if (strictly === true ? theirs >= mine : theirs > mine) {
        return false;
      }
    }
  }

  return true;
}

/**
 * One battlefield permanent a count or an aggregate reads, and how many
 * permanents it stands for: a compacted token stack is every token in it
 * (`GameObject.stackCount`), so anything that counts permanents counts them
 * all.
 */
export interface WeightedMatch {
  readonly id: ObjectId;
  readonly weight: number;
  /** Read it as this snapshot — an aggregate's attacker that has left the
   * battlefield, as it last existed there (rule 608.2h). */
  readonly lastKnown?: LastKnownInfo;
}

/**
 * The permanents among `ids` that `keep` accepts, each weighted by how many
 * permanents it is — less the ones `except` names. "Other" and "except
 * target" leave out *one permanent*, not one object: an excluded member of a
 * stack of five leaves the other four counted, and an excluded ordinary
 * permanent drops out entirely.
 */
export function weightedMatches(
  state: GameState,
  ids: readonly ObjectId[],
  keep: (id: ObjectId) => boolean,
  except: readonly ObjectId[] = [],
): WeightedMatch[] {
  const out: WeightedMatch[] = [];
  for (const id of ids) {
    const object = state.objects[id];
    if (object === undefined || !keep(id)) continue;
    const weight = (object.stackCount ?? 1) - (except.includes(id) ? 1 : 0);
    if (weight > 0) out.push({ id, weight });
  }
  return out;
}

/** What an aggregate reads off each permanent: its power, toughness or mana
 * value, or how many counters of one kind are on it — Tom Bombadil's "four
 * or more **lore counters among Sagas you control**" is a sum of `{
 * counters: "lore" }`. `"counters"` alone is every counter of every kind
 * on it — Hydra Trainer's "the number of **counters** on permanents you
 * control", Backstreet Bruiser's "two or more counters among creatures you
 * control" (rule 122.1: each counter is one, whatever its kind). */
export type AggregateOf =
  | "power"
  | "toughness"
  | "mana-value"
  | "counters"
  | { readonly counters: string }
  /** The chroma read (an ability word, rule 207.2c): that colour's mana symbols
   * in the object's mana cost, a hybrid or Phyrexian one counting once
   * (`colorSymbols`) — Umbra Stalker's "the number of black mana symbols in the
   * mana costs of cards in your graveyard". */
  | { readonly manaSymbols: Color };

/**
 * Where an aggregate's set of objects comes from:
 *
 * - `"battlefield"` (the default): the permanents there, a token stack
 *   counting as every token in it.
 * - `"graveyards"`: the cards in every graveyard (the filter's `ownedBy:
 *   "you"` narrows it to yours). Tokens aren't cards.
 * - `"exile"`: the cards in exile — Crackling Drake's "instant and sorcery
 *   cards you own **in exile** and in your graveyard". A card exiled face
 *   down has no characteristics (rule 406.3a), so it matches only a filter
 *   that asks about nothing but its owner — Kaya, Orzhov Usurper's "the
 *   number of cards that player owns in exile" counts it.
 * - an {@link ObjectSetRef}: the members of that set (`object-sets.ts`) —
 *   `"trigger-batch"` is Aloy, Savior of Meridian's "the greatest power
 *   **among them**" and Vulpine Harvester's "**their** total power" (the
 *   attackers that counted for the trigger), `{ thisWay: "sacrificed" }`
 *   Reign of the Pit's "the total power of the creatures sacrificed this
 *   way", `{ paid: "sacrificed" }` Corpse Cobble's "the total power of the
 *   sacrificed creatures", `"exiled-with-source"` "the number of cards
 *   exiled with it". Each member is read as it is while it's still in the
 *   stint the set found it in, otherwise as it was (rule 608.2h: whatever it
 *   has become — "even if the creature is no longer attacking or no longer a
 *   Phyrexian" — and as it last existed once it has left), weighed by the
 *   tokens it stood for; a card in a hidden zone that wasn't shown is
 *   unknown and left out (701.17c). So the aggregate's own filter is
 *   normally `{}`. Outside a resolution only the source's own sets
 *   (`"exiled-with-source"`, `"attached-to-source"`) name anything.
 */
export type AggregateZone = "battlefield" | "graveyards" | "exile";

/** Where an aggregate's objects come from: a zone or a set. */
export type AggregateIn = AggregateZone | ObjectSetRef;

/** One more set an aggregate folds in, with a filter of its own — see
 * {@link AggregateSpec}'s `plus`. */
export interface AggregateSource {
  readonly filter: CardFilter;
  readonly in?: AggregateIn | readonly AggregateIn[];
}

/**
 * A sum or a maximum over matching battlefield permanents (rule 208 /
 * 202.3): Ghalta's "the **total power** of creatures you control", Finneas's
 * "creatures you control have total power 10 or greater", "the **greatest
 * mana value** among permanents you control".
 *
 * - `sum` counts a token stack once per token in it — twenty 1/1 Goblins in
 *   one stack are 20 power, exactly as twenty separate tokens would be.
 * - `max` is 0 over no permanents at all (there is nothing to have a
 *   greatest value), which is what every printed "greatest … among" means
 *   on an empty board.
 *
 * - `distinct` counts the **different** values of one property among them,
 *   each once however many share it — see {@link DistinctOf}. Lunar
 *   Insight's "a card for each different mana value among nonland
 *   permanents you control", Golden Ratio's "each different power among
 *   creatures you control".
 *
 * - `count` is how many objects there are — the cards of a set no
 *   `countOf` reaches: Serpentine Curve's "the total number of instant and
 *   sorcery cards you own in exile and in your graveyard" is a `count` `in:
 *   ["graveyards", "exile"]`.
 *
 * `filter` is evaluated from the ability's controller's perspective, as
 * `countOf` is. `excludeSelf` is "**other** creatures you control" (the
 * battlefield only). `in` is where the set comes from — see
 * {@link AggregateZone}; a list is their union, each object once. Aven
 * Heartstabber's "five or more mana values among cards in your graveyard"
 * is a `distinct` `"mana-value"` `in: "graveyards"`.
 *
 * `plus` folds in more sets, each with its own filter and zone, when one
 * filter can't say both halves — Ambitious Dragonborn's "the greatest power
 * among creatures **you control** and creature cards **in your graveyard**"
 * is `{ filter: { type: "creature", controlledBy: "you" }, plus: [{ filter:
 * { type: "creature", ownedBy: "you" }, in: "graveyards" }] }`. An object
 * two of the sets reach is counted once.
 *
 * `forTarget` (an effect's amount only) reads the filter from the side of
 * the player in that target slot — Inscription of Abundance's "the greatest
 * power among creatures **target player** controls" is `controlledBy:
 * "you"` with `forTarget`. 0 when the slot holds no player or went illegal.
 */
export type AggregateSpec =
  /** `min` is the least ("the lowest power among them"), 0 over nothing, as
   * `max` is. */
  | (AggregateBase & { readonly aggregate: "sum" | "max" | "min"; readonly of: AggregateOf })
  | (AggregateBase & { readonly aggregate: "distinct"; readonly of: DistinctOf })
  | (AggregateBase & { readonly aggregate: "count"; readonly of?: undefined })
  /** How many of them share the creature type most of them have (rule 205.3m)
   * — Skemfar Shadowsage's "the greatest number of creatures you control that
   * have a creature type in common". A changeling (702.73a) is in every group;
   * an object with no creature type is in none, so a lone one reads 0. As a
   * `kind: "aggregate"` condition, Synchronized Eviction's "at least two
   * creatures that share a creature type". */
  | (AggregateBase & { readonly aggregate: "greatest-shared-creature-type"; readonly of?: undefined });

interface AggregateBase {
  readonly filter: CardFilter;
  readonly excludeSelf?: boolean;
  readonly in?: AggregateIn | readonly AggregateIn[];
  readonly plus?: readonly AggregateSource[];
  readonly forTarget?: number;
}

/** What an aggregate's sets read beyond the board: a resolution's sets, each
 * member already resolved to what it's read as (`members`); the source a
 * static's own sets belong to (`source`); cards that count as being in a
 * graveyard though they are moving out of it (an entering permanent's own
 * replacement, rule 614.12); and the permanents to leave out ("other", "not
 * yet here"). */
export interface AggregateReads {
  readonly except?: readonly ObjectId[];
  /** A resolution's sets, each member as it's read: live (no `lastKnown`)
   * while it's still in its stint, else its snapshot. Absent outside a
   * resolution, where only `source`'s own sets are read. */
  readonly members?: (ref: ObjectSetRef) => readonly WeightedMatch[];
  readonly source?: ObjectId;
  readonly stillInGraveyard?: readonly ObjectId[];
  /** The same from exile: Ulamog, the Defiler's "among cards in exile" sees
   * itself as it enters directly from there (its ruling). */
  readonly stillInExile?: readonly ObjectId[];
  /** Inside the layer fold: battlefield objects are matched by this
   * instead (the fold's own guard against reading itself). */
  readonly battlefieldMatch?: (id: ObjectId, filter: CardFilter) => boolean;
}

/** Whether a filter asks about nothing but whose a card is — what a card
 * exiled face down (no characteristics, rule 406.3a) can still match. */
export function ownerOnly(filter: CardFilter): boolean {
  return Object.keys(filter).every((k) => k === "ownedBy");
}

/**
 * The objects an aggregate folds over — see {@link AggregateSpec} — each
 * weighted by how many permanents it stands for, from `you`'s side. An
 * attacker that has left the battlefield carries the snapshot it is read
 * by (`lastKnown`).
 */
export function aggregateMatches(
  state: GameState,
  registry: CardRegistry,
  spec: AggregateSpec,
  you: PlayerId,
  reads: AggregateReads = {},
): WeightedMatch[] {
  const out: WeightedMatch[] = [];
  const seen = new Set<ObjectId>();
  const push = (m: WeightedMatch): void => {
    if (seen.has(m.id)) return;
    seen.add(m.id);
    out.push(m);
  };
  const zonesOf = (zone: AggregateSource["in"]): readonly AggregateIn[] =>
    zone === undefined ? ["battlefield"] : Array.isArray(zone) ? zone : [zone as AggregateIn];
  const collect = (filter: CardFilter, zones: readonly AggregateIn[], except: readonly ObjectId[]): void => {
    for (const zone of zones) {
      if (isObjectSetRef(zone)) {
        const members = reads.members?.(zone) ?? staticSetMatches(state, zone, reads.source);
        for (const m of members) {
          if (m.lastKnown === undefined && except.includes(m.id)) continue;
          // Face down in exile, foretold cards among them, it has no
          // characteristics (rule 406.3a).
          const live = m.lastKnown === undefined ? state.objects[m.id] : undefined;
          if (live?.zone === "exile" && (live.exiledFaceDown !== undefined || live.foretold === true) && !ownerOnly(filter)) continue;
          const ok =
            m.lastKnown !== undefined
              ? matchesFilter(state, registry, m.id, filter, { you, snapshot: m.lastKnown })
              : matchesFilter(state, registry, m.id, filter, { you });
          if (ok) push(m);
        }
      } else if (zone === "battlefield") {
        const keep = reads.battlefieldMatch ?? ((id: ObjectId, f: CardFilter) => matchesFilter(state, registry, id, f, { you }));
        for (const m of weightedMatches(state, state.zones.shared.battlefield, (id) => keep(id, filter), except)) push(m);
      } else if (zone === "graveyards") {
        for (const m of graveyardMatches(state, registry, filter, you)) push(m);
        for (const id of reads.stillInGraveyard ?? []) {
          const object = state.objects[id];
          if (object === undefined || object.isToken) continue;
          if (matchesFilter(state, registry, id, filter, { you })) push({ id, weight: 1 });
        }
      } else if (zone === "exile") {
        for (const id of state.zones.shared.exile) {
          const object = state.objects[id];
          if (object === undefined || object.isToken) continue;
          // Face down, foretold cards among them, it has no characteristics (rule 406.3a).
          if ((object.exiledFaceDown !== undefined || object.foretold === true) && !ownerOnly(filter)) continue;
          if (matchesFilter(state, registry, id, filter, { you })) push({ id, weight: 1 });
        }
        for (const id of reads.stillInExile ?? []) {
          const object = state.objects[id];
          if (object === undefined || object.isToken) continue;
          if (matchesFilter(state, registry, id, filter, { you })) push({ id, weight: 1 });
        }
      }
    }
  };
  collect(spec.filter, zonesOf(spec.in), reads.except ?? []);
  for (const more of spec.plus ?? []) collect(more.filter, zonesOf(more.in), reads.except ?? []);
  return out;
}

/**
 * What a `distinct` aggregate tells apart:
 *
 * - `"mana-value"`: a land's is 0 and counts as one (rule 202.3a), `{X}` 0
 *   off the stack (202.3e).
 * - `"mana-cost"`: the symbols of its mana cost, not their total — Embodiment
 *   of Agonies' "each different mana cost": {2}{B} and {1}{B}{B} are two. A
 *   card with no mana cost has none and adds nothing (rule 202.1b); a split
 *   card's is its halves' combined (709.4b), a double-faced card's its front
 *   face's off the battlefield (712.8a).
 * - `"power"`: its power now.
 * - `"name"` — "differently named lands" (Awakened Amalgam): a split card's
 *   two names together are one; a face-down permanent has none (rule
 *   708.2a) and adds nothing. See {@link distinctNameOf}.
 * - `"color-pair"`: Niv-Mizzet, Guildpact's "different color pairs among
 *   permanents you control that are exactly two colors" — only a permanent
 *   of exactly two colours has one.
 * - `"permanent-type"`: the permanent types among its card types (rule
 *   110.4 — artifact, battle, creature, enchantment, land, planeswalker):
 *   Korvold, Gleeful Glutton's "permanent types among cards in your
 *   graveyard".
 * - `"card-type"`: every card type among its printed ones, permanent or not:
 *   Omnivorous Flytrap's "six or more card types among cards in your
 *   graveyard" (what delirium, rule 207.2c, asks for at four). Printed: layer
 *   effects don't reach a graveyard.
 * - `"counter-kind"`: each kind of counter on it (rule 122.1), however many:
 *   Hundred-Battle Veteran's "different kinds of counters among creatures you
 *   control".
 * - `{ subtypesOf }`: its subtypes of that card type — "creature types among
 *   creatures you control" (Valiant Changeling, where a changeling is every
 *   one of them, rule 702.73a), "planeswalker types among planeswalkers you
 *   control" (Tam, the Possibility). Only an object of that type has any.
 */
export type DistinctOf =
  | "mana-value"
  | "mana-cost"
  | "power"
  | "name"
  | "color-pair"
  | "permanent-type"
  | "card-type"
  | "counter-kind"
  | { readonly subtypesOf: "creature" | "planeswalker" };

/** The name a "differently named" count tells an object by: its names
 * ({@link namesOf}) as one, a token's the one its maker gave it — a
 * `tokenName` or a copy's — else, where its registry key is a generic "…
 * Token", its subtypes plus "Token" (rule 111.4). `undefined` for none (face
 * down). */
export function distinctNameOf(registry: CardRegistry, object: GameObject): string | undefined {
  const names = namesOf(registry, object);
  if (names.length === 0) return undefined;
  if (!object.isToken) return names.join(" // ");
  const named = nameOf(object);
  const key = printedCardName(object);
  return named !== key || !/\bToken\b/.test(key) || !registry.has(key)
    ? named
    : `${registry.get(key).subtypes.join(" ")} Token`;
}

const PERMANENT_TYPES: readonly CardType[] = ["artifact", "battle", "creature", "enchantment", "land", "planeswalker"];

/** The values one object gives a `distinct` aggregate — none, one, or
 * several (two permanent types, a creature's creature types). */
function distinctValuesOf(
  state: GameState,
  registry: CardRegistry,
  id: ObjectId,
  of: DistinctOf,
): readonly (string | number)[] {
  const object = state.objects[id];
  if (object === undefined) return [];
  if (of === "mana-value") return [aggregateValueOf(state, registry, id, "mana-value")];
  if (of === "mana-cost") {
    const cost = printedManaCost(registry, object);
    return cost === null || cost === "" ? [] : [cost];
  }
  if (of === "name") {
    const name = distinctNameOf(registry, object);
    return name === undefined ? [] : [name];
  }
  if (of === "card-type") return registry.get(printedCardName(object)).types;
  if (of === "counter-kind") return Object.keys(object.counters ?? {}).filter((kind) => (object.counters[kind] ?? 0) > 0);
  const c = computeCharacteristics(state, registry, id);
  if (of === "power") return [c.power];
  if (of === "color-pair") return c.colors.size === 2 ? [[...c.colors].sort().join("")] : [];
  if (of === "permanent-type") return c.types.filter((t) => PERMANENT_TYPES.includes(t));
  if (!c.types.includes(of.subtypesOf)) return [];
  if (of.subtypesOf === "creature") {
    // The marker itself (changeling, rule 702.73a), not `hasSubtype`: asked about
    // the marker, `hasSubtype` means "has any creature type", which every Goblin has.
    return c.subtypes.includes(EVERY_CREATURE_TYPE) ? CREATURE_TYPES : c.subtypes.filter(isCreatureType);
  }
  return c.subtypes.filter((s) => !isTypeMarker(s) && !isCreatureType(s) && !isLandType(s));
}

/** The cards in every graveyard matching `filter` from `you`'s side, one
 * apiece — an aggregate's `in: "graveyards"`. Tokens aren't cards. */
export function graveyardMatches(
  state: GameState,
  registry: CardRegistry,
  filter: CardFilter,
  you: PlayerId,
): WeightedMatch[] {
  const out: WeightedMatch[] = [];
  for (const player of state.turnOrder) {
    for (const id of state.zones.perPlayer[player]?.graveyard ?? []) {
      if (state.objects[id]?.isToken === true) continue;
      if (matchesFilter(state, registry, id, filter, { you })) out.push({ id, weight: 1 });
    }
  }
  return out;
}

/** One permanent's current power, toughness or mana value — computed, so
 * anthems and counters count; mana value from the printed cost, with `{X}`
 * as 0 off the stack (rule 202.3e) — or the counters of a kind on it. */
export function aggregateValueOf(
  state: GameState,
  registry: CardRegistry,
  id: ObjectId,
  of: AggregateOf,
): number {
  if (typeof of === "object" && "manaSymbols" in of) {
    const object = state.objects[id];
    return object === undefined ? 0 : colorSymbols(parseManaCost(printedManaCost(registry, object)), [of.manaSymbols]);
  }
  if (typeof of === "object") return state.objects[id]?.counters[of.counters] ?? 0;
  if (of === "counters") return totalCounters(state.objects[id]?.counters);
  if (of === "mana-value") {
    // On the stack, {X} is the value chosen for it (rule 202.3e): a spell
    // cast this way counts as cast.
    const object = state.objects[id];
    return object === undefined ? 0 : manaValueOfObject(registry, object);
  }
  const c = computeCharacteristics(state, registry, id);
  return of === "power" ? c.power : c.toughness;
}

/** Every counter of every kind in a counters record (rule 122.1). */
function totalCounters(counters: Readonly<Record<string, number>> | undefined): number {
  let n = 0;
  for (const k in counters) n += counters[k] ?? 0;
  return n;
}

/** One match's value: as {@link aggregateValueOf} reads it, or — for an
 * attacker that has left the battlefield — as it last existed there. */
function matchValueOf(state: GameState, registry: CardRegistry, m: WeightedMatch, of: AggregateOf): number {
  const known = m.lastKnown;
  if (known === undefined) return aggregateValueOf(state, registry, m.id, of);
  if (typeof of === "object" && "manaSymbols" in of) {
    return colorSymbols(parseManaCost(known.manaCost ?? null), [of.manaSymbols]);
  }
  if (typeof of === "object") return known.counters[of.counters] ?? 0;
  if (of === "counters") return totalCounters(known.counters);
  if (of === "mana-value") return known.manaValue;
  return of === "power" ? known.power : known.toughness;
}

/** Fold `matches` into one number — see {@link AggregateSpec}. The raw
 * value: a negative power lowers a sum, and callers that need a
 * non-negative amount clamp it themselves. */
export function aggregateOver(
  state: GameState,
  registry: CardRegistry,
  matches: readonly WeightedMatch[],
  spec: AggregateSpec,
): number {
  if (matches.length === 0) return 0;
  if (spec.aggregate === "distinct") {
    const seen = new Set<string | number>();
    for (const m of matches) for (const v of distinctValuesOf(state, registry, m.id, spec.of)) seen.add(v);
    return seen.size;
  }
  if (spec.aggregate === "count") return matches.reduce((n, m) => n + m.weight, 0);
  if (spec.aggregate === "greatest-shared-creature-type") {
    let everyType = 0;
    const groups = new Map<string, number>();
    for (const m of matches) {
      const subtypes = m.lastKnown?.subtypes ?? computeCharacteristics(state, registry, m.id).subtypes;
      if (subtypes.includes(EVERY_CREATURE_TYPE)) {
        everyType += m.weight;
        continue;
      }
      for (const s of subtypes) if (isCreatureType(s)) groups.set(s, (groups.get(s) ?? 0) + m.weight);
    }
    return everyType + Math.max(0, ...groups.values());
  }
  const of = spec.of;
  if (spec.aggregate === "sum") {
    return matches.reduce((n, m) => n + matchValueOf(state, registry, m, of) * m.weight, 0);
  }
  if (spec.aggregate === "min") {
    return matches.reduce((least, m) => Math.min(least, matchValueOf(state, registry, m, of)), Infinity);
  }
  return matches.reduce((best, m) => Math.max(best, matchValueOf(state, registry, m, of)), -Infinity);
}

/** A static's own sets as aggregate matches (`staticSetMembers`): each
 * member as it is now, weighed by its tokens. */
function staticSetMatches(state: GameState, ref: ObjectSetRef, source: ObjectId | undefined): WeightedMatch[] {
  return staticSetMembers(state, ref, source).map((m) => ({ id: m.object, weight: m.count ?? 1 }));
}
