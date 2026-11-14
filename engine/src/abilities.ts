/**
 * Abilities printed on a permanent.
 *
 * - Activated: `[cost]: [effect]`. A *mana ability* ({@link isManaAbility})
 *   produces mana, targets nothing, and resolves immediately without the stack.
 * - Triggered: "when/whenever/at ...". Detected after game events and put on the
 *   stack the next time a player would receive priority (rule 603).
 *
 * Costs and effects reuse the spell vocabulary.
 */

import type { KeywordAbilityName } from "./characteristics-patch.js";
import type { StaticCondition, TurnStat } from "./cards/define.js";
import type { EffectAmount, EffectSpec, SpellResolver } from "./effects.js";
import { costActLosesSource, costActMovesLibrary, costActReadsX } from "./cost-acts.js";
import type { GameState, ZoneType } from "./state.js";
import type { ObjectId, PlayerId } from "./primitives.js";
import type { ObjectRef } from "./refs.js";
import type { SetMember } from "./object-sets.js";
import type { CardFilter, SpellTargetsFilter } from "./filter.js";
import { filterReadsX } from "./filter.js";
import type { TargetSpec } from "./target.js";
import type { Step } from "./turn.js";
import type { DieTest } from "./random-results.js";
import type { TriggerEventName } from "./trigger-events.js";

/** A non-mana, non-tap component of an ability cost that sacrifices a permanent. */
export type SacrificeCost =
  /** Sacrifice the permanent whose ability this is. */
  | "self"
  /** Sacrifice the permanent whose static granted this ability — "Equipped
   * creature has '{1}, {T}, Sacrifice Ninja's Kunai: …'" (rule 201.5a: the
   * granting Equipment, not one of the same name). Payable only while the
   * activating player controls it and it can be sacrificed (701.21a); on an
   * ability nothing granted, never. */
  | "granter"
  /** Sacrifice a creature the activating player controls (their choice; may be
   * the source itself). */
  | "creature-you-control"
  /** Sacrifice a permanent the activating player controls matching `filter`
   * (their choice — Zuran Orb "Sacrifice a land", Orcish Lumberjack "Sacrifice
   * a Forest"). needed-cards P6.
   *
   * With `count`, several of them: "Sacrifice two artifacts" (Sai, Master
   * Thopterist) is `count: 2`, "Sacrifice X Treasures" (Grim Hireling) is
   * `count: "x"` — the X announced for the activation (rules 107.3a, 602.2b),
   * which `"x"` in the effect then reads. Which ones is chosen as the cost is
   * paid (rule 601.2h), with the ordinary `sacrifice` decision, after the
   * ability is on the stack and its mana paid — never for the player — and a
   * compacted token stack counts as every token in it. All of them are
   * sacrificed at once. Without `count` it's one permanent, named on the
   * `activate-ability` action as before.
   *
   * "Sacrifice any number of …" is `count: "x"` too, "one or more" with the
   * ability's `minX: 1` (Radiant Lotus): the number sacrificed is the X the
   * effect reads ("for each artifact sacrificed this way"), announced as it's
   * activated and paid to the permanent. A mana ability may take it (Springjack
   * Pasture's "Sacrifice X Goats: Add X mana of any one color"): activated by
   * hand only, its mana added once the last is chosen, still never on the
   * stack (rule 605.3b).
   *
   * `differentNames` is the cost's total constraint — Transmutation Font's
   * "three artifact tokens with different names": asked one at a time, each
   * offering only names not yet chosen. */
  | { readonly filter: CardFilter; readonly count?: number | "x"; readonly differentNames?: true }
  /** Several kinds, each with a number of its own, every one a different
   * permanent — the `each` form with counts: Glass-Cast Heart's "Sacrifice
   * this artifact and thirteen Blood tokens" is `{ isSource: true }` × 1 and
   * Blood × 13; Emrakul's Evangel's "this creature and any number of other
   * non-Eldrazi creatures" has an `"x"` count on its second part, which reads
   * as `count: "x"` does above. */
  | { readonly parts: readonly { readonly filter: CardFilter; readonly count: number | "x" }[] }
  /** One permanent for each filter, every one a different permanent —
   * Jarad, Golgari Lich Lord's "Sacrifice a Swamp and a Forest" (a land that
   * is both still pays only one of them: its ruling). Asked one filter at a
   * time, each offering only what leaves the rest payable. "Sacrifice this
   * creature and another green creature" (Magus of the Order) is an `each`
   * whose first filter is `{ isSource: true }`, which nothing but the source
   * pays; Sandstone Deadfall's "two lands and this artifact" three filters.
   *
   * Every filter here — a `filter` and each of an `each`'s — is matched
   * against the ability's source (`FilterContext.source`), so a clause about
   * it reads it: `isSource` ("another creature or an artifact" is an `anyOf`
   * with `isSource: false` on its creature branch — Mold Folk; `otherOnly`
   * would keep the source out of both), `hostOfSource` ("Sacrifice enchanted
   * creature" — Betrothed of Fire, payable only while you control it,
   * 701.21a), `ofChosenType` ("a creature of the chosen type" — Doom
   * Cannon). */
  | { readonly each: readonly CardFilter[] };

/** One kind of permanent a sacrifice cost takes, and how many of it. */
export interface SacrificeCostPart {
  readonly filter: CardFilter;
  readonly count: number;
  /** "With different names": no two of the part's share a name. */
  readonly differentNames?: true;
}

/**
 * The parts of a sacrifice cost that is chosen as it's paid rather than on
 * the action — a `count` or an `each` (see {@link SacrificeCost}) — with an
 * `"x"` count read at `x`. `null` for a cost that names its one permanent on
 * the action (`"self"`, `"creature-you-control"`, a bare `{ filter }`) or no
 * sacrifice at all.
 */
export function sacrificeCostParts(
  sacrifice: SacrificeCost | undefined,
  x: number,
): readonly SacrificeCostPart[] | null {
  if (sacrifice === undefined || typeof sacrifice === "string") return null;
  const at = (count: number | "x"): number => (count === "x" ? Math.max(0, Math.floor(x)) : count);
  if ("each" in sacrifice) return sacrifice.each.map((filter) => ({ filter, count: 1 }));
  if ("parts" in sacrifice) return sacrifice.parts.map((part) => ({ filter: part.filter, count: at(part.count) }));
  if (sacrifice.count === undefined) return null;
  return [
    {
      filter: sacrifice.filter,
      count: at(sacrifice.count),
      ...(sacrifice.differentNames === true ? { differentNames: true as const } : {}),
    },
  ];
}

/** Does this cost sacrifice X permanents — an `{X}` the mana cost needn't
 * have (Grim Hireling's "{B}, Sacrifice X Treasures")? */
export function sacrificeCostReadsX(cost: { readonly sacrifice?: SacrificeCost }): boolean {
  const sacrifice = cost.sacrifice;
  if (typeof sacrifice !== "object") return false;
  if ("parts" in sacrifice) return sacrifice.parts.some((part) => part.count === "x");
  return "filter" in sacrifice && sacrifice.count === "x";
}

/** Is this cost one permanent to sacrifice, named on the action, whose
 * filter reads X — "Sacrifice a creature you control with mana value X"
 * (Sidisi, Regent of the Mire)? X is announced as the ability is activated
 * (rules 602.2b, 601.2b) though the mana cost has no `{X}`, and only a
 * permanent matching at that X pays. */
export function sacrificeCostFilterReadsX(cost: { readonly sacrifice?: SacrificeCost }): boolean {
  const sacrifice = cost.sacrifice;
  if (typeof sacrifice !== "object" || "parts" in sacrifice || "each" in sacrifice) return false;
  return sacrifice.count === undefined && filterReadsX(sacrifice.filter);
}

/** Whether a cost's `removeCounter` is chosen as it's paid — from a
 * permanent other than the source, of any kind or several, or a suspended
 * card's — rather than a fixed number of one kind off the source. */
export function chosenCounterCost(cost: AbilityCost): boolean {
  const c = cost.removeCounter;
  return (
    c !== undefined &&
    (c.from !== undefined || c.kind === "any" || c.orKinds !== undefined || c.orSuspended === true || c.among === true)
  );
}

/** The loyalty counters a loyalty ability's cost puts on its source at this
 * X (negative removes them, rule 606.4) — a "−X" cost's X announced as it's
 * activated (107.3a); `undefined` for an ability that isn't a loyalty one. */
export function loyaltyDelta(ability: ActivatedAbility, x: number | undefined): number | undefined {
  const cost = ability.loyaltyCost;
  if (cost === "-x") return 0 - Math.max(0, Math.floor(x ?? 0));
  return cost;
}

/** Does any part of this cost besides its mana take X — so X is announced
 * though the mana cost needn't have `{X}` (Grim Hireling's "Sacrifice X
 * Treasures", Gix, Yawgmoth Praetor's "Discard X cards")? */
export function costAnnouncesX(cost: AbilityCost): boolean {
  return (
    sacrificeCostReadsX(cost) ||
    sacrificeCostFilterReadsX(cost) ||
    cost.tapOthers?.count === "x" ||
    cost.discard?.count === "x" ||
    cost.discard?.manaValueX === true ||
    cost.exileFromGraveyard?.count === "x" ||
    cost.reveal?.count === "x" ||
    cost.removeCounter?.count === "x" ||
    cost.payLife === "x" ||
    (cost.do !== undefined && costActReadsX(cost.do))
  );
}

/** Whether paying `cost` takes the ability's own source away for good. */
export function costLosesSource(cost: AbilityCost): boolean {
  return cost.sacrifice === "self" || (cost.do !== undefined && costActLosesSource(cost.do));
}

/** What a `discard` cost may discard at this X: "a card with mana value X"
 * has its filter pinned to that X, the way a Shoal's pitched card is. */
export function discardCostFilterAtX(
  discard: NonNullable<AbilityCost["discard"]>,
  x: number,
): CardFilter | undefined {
  return discard.manaValueX === true
    ? { ...discard.filter, manaValue: { op: "eq", n: Math.max(0, Math.floor(x)) } }
    : discard.filter;
}

/** A `tapOthers` cost with its count read at `x` ("Tap X untapped artifacts"). */
export function tapOthersAtX<T extends { readonly count: number | "x" }>(spec: T, x: number): T & { readonly count: number } {
  return { ...spec, count: spec.count === "x" ? Math.max(0, Math.floor(x)) : spec.count };
}

/**
 * Can every part be paid at once, each with its own permanents? `eligible` is
 * what may pay a part, `capacity` how many each permanent can give (a token
 * stack as many as it has tokens; anything absent gives none). One permanent
 * never pays two parts — Jarad's Swamp that is also a Forest pays one of
 * "a Swamp and a Forest", not both. A search, but over a cost's few parts.
 */
export function sacrificePartsFillable(
  parts: readonly { readonly eligible: readonly ObjectId[]; readonly count: number }[],
  capacity: ReadonlyMap<ObjectId, number>,
): boolean {
  const left = new Map(capacity);
  const fill = (part: number, need: number, from: number): boolean => {
    if (part === parts.length) return true;
    const { eligible } = parts[part];
    if (need === 0) return fill(part + 1, parts[part + 1]?.count ?? 0, 0);
    // The last part has no one after it to leave anything for.
    if (part === parts.length - 1) {
      let n = 0;
      for (const id of eligible.slice(from)) n += left.get(id) ?? 0;
      return n >= need;
    }
    for (let i = from; i < eligible.length; i += 1) {
      const id = eligible[i];
      const has = left.get(id) ?? 0;
      if (has <= 0) continue;
      left.set(id, has - 1);
      const ok = fill(part, need - 1, i);
      left.set(id, has);
      if (ok) return true;
    }
    return false;
  };
  return fill(0, parts[0]?.count ?? 0, 0);
}

/** Every filter a sacrifice cost's choice can be made from — one for the
 * forms that have one, each of an `each`'s. */
export function sacrificeCostFilters(sacrifice: Exclude<SacrificeCost, "self" | "granter" | "creature-you-control">): readonly CardFilter[] {
  if ("parts" in sacrifice) return sacrifice.parts.map((part) => part.filter);
  return "each" in sacrifice ? sacrifice.each : [sacrifice.filter];
}

/**
 * How much life an activated ability's cost pays: a fixed number, or
 * `"commander-identity-colors"` — "Pay life equal to the number of colors in
 * your commanders' color identity" (War Room), read off
 * `PlayerState.commanderIdentity` (rule 903.4: fixed before the game begins,
 * both commanders' for a pair). A player with no commander can't pay it at
 * all (War Room's ruling), while a colourless commander makes it 0.
 */
export type AbilityLifeCost =
  | number
  | "commander-identity-colors"
  /** "Pay half your life, rounded up" (Lurking Evil): nothing at 0 or less
   * life (its ruling). */
  | "half-rounded-up"
  /** "Pay X life" (Krumar Initiate): the X announced, up to their life. */
  | "x"
  /** "Pay 3 life for each velocity counter on this enchantment" (Tornado),
   * "pay 1 life for each card in your hand" (Hand of Vecna). */
  | { readonly each: number; readonly per: { readonly countersOnSource: string } | "card-in-hand" };

/**
 * The life `cost` pays when `player` activates it now: `0` for none, `null`
 * when it can't be paid at all (a commander-identity cost with no commander).
 * Read as the cost is paid (rule 602.2b), with the X announced and the ability's
 * source. Rule 118.4's "can't pay more life than you have" is the caller's check.
 */
export function abilityLifeCost(
  state: GameState,
  player: PlayerId,
  cost: AbilityCost,
  x?: number,
  source?: ObjectId,
): number | null {
  const life = cost.payLife;
  if (life === undefined) return 0;
  if (typeof life === "number") return life;
  if (life === "x") return x ?? 0;
  if (life === "half-rounded-up") return Math.max(0, Math.ceil((state.players[player]?.life ?? 0) / 2));
  if (typeof life === "object") {
    const count =
      life.per === "card-in-hand"
        ? (state.zones.perPlayer[player]?.hand.length ?? 0)
        : source === undefined
          ? 0
          : (state.objects[source]?.counters[life.per.countersOnSource] ?? 0);
    return life.each * count;
  }
  const hasCommander = Object.values(state.objects).some(
    (o) => o.isCommander && o.owner === player,
  );
  if (!hasCommander) return null;
  return state.players[player]?.commanderIdentity?.length ?? 0;
}

/** The printed form of an ability's life cost ("Pay 2 life"). */
export function abilityLifeCostText(life: AbilityLifeCost): string {
  if (typeof life === "number") return `Pay ${life} life`;
  if (life === "x") return "Pay X life";
  if (life === "half-rounded-up") return "Pay half your life, rounded up";
  if (typeof life === "object") {
    return `Pay ${life.each} life for each ${life.per === "card-in-hand" ? "card in your hand" : `${life.per.countersOnSource} counter on this permanent`}`;
  }
  return "Pay life equal to the number of colors in your commanders' color identity";
}

/**
 * What a craft ability exiles (rule 702.167a): `count` of them (`orMore`: that
 * many or more — "one or more creatures"), each matching `filter`. A type or
 * subtype without "card" means a permanent or a card in the graveyard
 * (702.167b); `cardsOnly` is "… cards", from the graveyard alone. `share`:
 * they share a card type ("two that share a card type"); `oneEach`: one per
 * filter ("a Dinosaur, a Merfolk, a Pirate, and a Vampire"), `count` being
 * how many filters there are.
 *
 * `permanentsOnly` is the same cost on the battlefield alone, and no craft:
 * Mechtitan Core's "{5}, Exile this Vehicle and four other artifact creatures
 * and/or Vehicles you control" (its self-exile the cost's `do`), the four
 * linked to it (rule 607.2a) for its token's "return all cards exiled with
 * this Vehicle".
 */
export interface CraftMaterials {
  readonly count: number;
  readonly orMore?: boolean;
  readonly filter?: CardFilter;
  readonly cardsOnly?: boolean;
  readonly permanentsOnly?: boolean;
  readonly share?: "card-type";
  readonly oneEach?: readonly CardFilter[];
  /** "two that share a card type" — what the choice tells the player. */
  readonly text: string;
}

/** {@link AbilityCost.putFromExile}: how many cards an opponent owns, or how
 * many of the cards exiled with the source (`linked`). */
export type PutFromExileCost =
  | number
  | { readonly count: number; readonly linked: true; readonly filter?: CardFilter };

export interface AbilityCost {
  /** Mana portion of the cost, e.g. `"{2}"`; `null` for no mana. */
  readonly mana: string | null;
  /** "Spend only mana of the chosen color to activate this ability" (Throne of
   * Eldraine): the color its permanent's controller chose as it entered
   * (`chooseOnEnter`). With none chosen, no mana can pay. */
  readonly spendOnlyChosenColor?: true;
  /** "Spend only black mana on X" (Crypt Rats, Crimson Hellkite): the part of
   * the cost that is the `{X}` in `mana` is paid with mana of this colour
   * alone — each X one mana of it, as a coloured symbol is (rule 107.4a), so
   * the X offered goes only as high as that mana does. Anything that lowers
   * the cost's generic mana takes the rest of the generic part first, then X
   * (`Game.activatedAbilityManaCost`). A colour word, which a text change
   * reaches (rule 612.2). */
  readonly xSpendOnly?: "W" | "U" | "B" | "R" | "G";
  /** Whether `{T}` (tap this permanent) is part of the cost. */
  readonly tap: boolean;
  /**
   * An action as (part of) the cost, in the effect vocabulary: an `EffectSpec`
   * whose every step has a row in `COST_ACTS` (`cost-acts.ts`). Payable only
   * if all of it can be done (118.3), paid after the cost's other parts once
   * the ability is on the stack (602.2b, 601.2h), any choice in it an ordinary
   * dispatched decision. What it took is read back as `{ paid: … }`. An amount
   * of `"x"` makes X announced as it's activated (601.2b), capped by the row.
   * A mana ability with one is activated by hand; one that moves a card to or
   * from a library isn't a mana ability (605.1a).
   */
  readonly do?: EffectSpec;
  /** Whether `{Q}` (untap this permanent — rule 107.6) is part of the cost:
   * payable only while the source is tapped, and a creature's only once it
   * has been under its controller's control since their most recent turn
   * began (302.6). Not for mana abilities, whose payment never untaps. */
  readonly untap?: boolean;
  /** A sacrifice that is part of the cost, or `undefined` for none. */
  readonly sacrifice?: SacrificeCost;
  /** Life to pay as part of the cost (Greed: "Pay 2 life"). Rule 118.4 — a
   * player can't pay more life than they have. An {@link AbilityLifeCost}
   * other than a number is read as the ability is activated — always through
   * {@link abilityLifeCost}, never directly. */
  readonly payLife?: AbilityLifeCost;
  /** Counters to remove from the source as part of the cost (Walking
   * Ballista: "Remove a +1/+1 counter from ~"). `count: "x"` is "remove X
   * counters" or "remove any number of counters" (Bottomless Vault, the Mana
   * Batteries): X is announced as it's activated (rule 601.2b, via 602.2b),
   * up to the counters it has, 0 allowed, and the effect reads it as `"x"`
   * — "add {B} for each storage counter removed this way". A mana ability
   * with it is activated by hand only (the auto-payer pays no counters).
   *
   * Or counters chosen as the cost is paid (rules 602.2b, 601.2h — the
   * `remove-counters` decision, once the ability is on the stack, as a
   * blight is): `kind: "any"` is "remove a counter" of any kind (Loch Mare's
   * "Remove a counter from this creature"), `orKinds` more kinds besides
   * `kind` (Ion Storm's "a +1/+1 counter or a charge counter"); `from` takes
   * them from a permanent you control matching it, rather than the source
   * ("from a creature you control" — Ghave, Guru of Spores; "another" is
   * `excludeSource`), and `among` spreads them over any of those ("from among
   * creatures you control" — Tayam); `orSuspended` lets a suspended card you
   * own give a time counter too (Rift Elemental). With `count: "x"`, X is
   * announced as it's activated, up to what there is to remove (`minX` 1 for
   * "one or more" — Ooze Flux). Never on a mana ability.
   *
   * `count: "all"` is "Remove all +1/+1 counters from [this]" (Catti-brie of
   * Mithral Hall): every counter of `kind` on the source, however many —
   * none at all is a legal payment (rule 118.3 asks only for what the cost
   * names; its ruling: it can be activated with no counters). The number
   * removed is the ability's X — "where X is the number of counters removed
   * this way" — fixed as the cost is paid (rule 601.2h, via 602.2b), so the
   * effect reads it as `"x"` and a copy keeps it (707.10). Only off the
   * source, of one kind: never with `from`, `among`, `orKinds` or `"any"`.
   */
  readonly removeCounter?: {
    readonly kind: string;
    readonly count: number | "x" | "all";
    readonly orKinds?: readonly string[];
    readonly from?: CardFilter;
    readonly excludeSource?: true;
    readonly among?: true;
    readonly orSuspended?: true;
  };
  /**
   * Counters to put on the source as part of the cost — Wall of Roots' "Put
   * a -0/-1 counter on this creature: Add {G}", Devoted Druid's "Put a -1/-1
   * counter on this creature: Untap this creature". Put on directly as the
   * cost is paid (announced as `counter-added`, so a "whenever counters are
   * put" trigger sees them), with no counter replacement: a cost isn't an
   * effect, so one worded "if an effect would put counters" (Doubling
   * Season) never doubles it, as it never doubles a loyalty cost (its
   * ruling); the pool's others are +1/+1-only (Branching Evolution), which
   * no such cost puts yet — one that did would need them applied, as a
   * -1/-1 one (Vizier of Remedies) would; and a "counters can't be put on
   * it" (Solemnity, none in the pool) would make the cost unpayable (Devoted
   * Druid's rulings). A mana
   * ability with it and no `{T}` (once each turn) is one the auto-payer may
   * use, as a last resort, like a Treasure: the counter stays.
   */
  readonly addCounter?: { readonly kind: string; readonly count: number };
  /** Energy counters to pay ({E} — rule 122 / ROADMAP Phase 10; automatic,
   * like `payLife`). */
  readonly payEnergy?: number;
  /** "Reveal the player you chose" (Stalking Leonin, Guardian Archon), "reveal
   * the creature type you chose" (A Killer Among Us): the secret choice made
   * for this permanent (`GameObject.secretChoice`) is shown to every player,
   * as the cost is paid. Payable only by the player who made it: nobody else
   * has anything to reveal. */
  readonly revealChosen?: true;
  /**
   * Unattach an Equipment as part of the cost (rule 701.3d): it stays on the
   * battlefield, attached to nothing, and it becomes unattached as the cost
   * is paid. Unpayable unless it's attached (Sunforger's ruling; rule 118.3).
   *
   * - `"self"`: the source itself — Sunforger's "Unattach this Equipment".
   * - `"granter"`: the Equipment that grants this ability, from the creature
   *   holding it — Leonin Bola's "{T}, Unattach Leonin Bola". Who controls the
   *   Equipment doesn't matter (its ruling); the creature's controller
   *   activates. Effects read it as `"granter"`, after the grant has gone.
   * - `{ filter }`: one attached to the source that the player chooses,
   *   Captain America's "Unattach an Equipment from Captain America". Offered
   *   and named on the action as a sacrifice is (the offer's `sacrifice`, with
   *   `unattach`), and read back as `{ paid: "unattached" }` for "that Equipment's mana
   *   value". A `divided` total that reads it gets one offer per total, since
   *   the division is announced with the cost's choice (rule 601.2d).
   */
  readonly unattach?: "self" | "granter" | { readonly filter: CardFilter };
  /**
   * Discard `count` cards, matching `filter` if given, as part of the cost —
   * "{B}{B}, Discard a card: Proliferate" (Yawgmoth), "Discard a creature
   * card" (Fauna Shaman, Tortured Existence). The player picks which, with
   * the ordinary `discard` decision, as the ability goes on the stack (the
   * way a spell's `additionalCost.discard` is paid); the source itself never
   * counts. Gates activation on having enough such cards in hand. `count:
   * "x"` is Gix, Yawgmoth Praetor's "Discard X cards": X announced as it's
   * activated, capped by the cards there are to discard. `random` is
   * "Discard a card at random" (Mage il-Vec, Ogre Shaman): the cards are
   * picked at random as the cost is paid, so there is nothing to ask.
   * `manaValueX` is "Discard a card with mana value X" (Kozilek, the Great
   * Distortion; Knollspine Invocation): X is announced as it's activated
   * (rule 107.3a) though the mana cost needn't have `{X}`, the ability is
   * offered once per X with such a card to discard, and only those may pay.
   */
  readonly discard?: {
    readonly count: number | "x";
    readonly filter?: CardFilter;
    readonly random?: boolean;
    readonly manaValueX?: boolean;
  };
  /**
   * Exile `count` cards from your graveyard, matching `filter` if given, as
   * part of the cost — "{2}, Exile two cards from your graveyard" (Varina,
   * Lich Queen), "Exile a creature card from your graveyard" (Moorland
   * Haunt). The player picks which as the ability goes on the stack (rule
   * 602.2b, paying costs as 601.2h does) — a `choose-from-zone` decision
   * with `destination: "exile"`, the way `discard` is paid with the
   * `discard` decision — and gets priority back once it's paid (rule
   * 117.3c). With no more matching cards than that, they're all exiled
   * without asking. Either way they leave the graveyard as one move. The
   * source never counts, wherever it is. Gates activation on having enough
   * such cards. A mana ability's (Molt Tender) waits for the answer and adds
   * its mana then (rule 605.3b), as `exileFromHand`'s does. Not beside a
   * `discard`, a `returnToHand` or a sacrifice of several, which ask too. `count: "x"` is Necropolis Fiend's "{X}, {T}, Exile X cards from your
   * graveyard": the same X as the mana's, capped at the cards there.
   *
   * `fromTop` is "exile **the top** [creature] card of your graveyard" (Alms,
   * Necratog — rule 404.2): no choice, the first `count` matching cards down
   * from the top of the pile. `count: "opponents"` is Araumi of the Dead
   * Tide's "Exile cards from your graveyard equal to the number of opponents
   * you have": the opponents still in the game as it's activated.
   */
  readonly exileFromGraveyard?: {
    readonly count: number | "x" | "opponents";
    readonly filter?: CardFilter;
    readonly fromTop?: true;
    /** "From a single graveyard" (Night Soil's "Exile two creature cards from a
     * single graveyard"): any player's, all `count` from the same one (its
     * ruling: payable only if some graveyard has them). */
    readonly singleGraveyard?: true;
  };
  /**
   * `sacrifice`'s one chosen permanent is **exiled** instead — "Exile a
   * creature you control" (Food Chain, City of Shadows). Offered and named on
   * the action just as a sacrifice is, and read back as `{ paid: "sacrificed" }` (its
   * mana value, "if it was a …") since the effect's "the exiled creature" is
   * the same last-known read. But it's no sacrifice: nothing stops or sees one
   * (rule 701.21a), and it doesn't die. Not with `"self"`, `"granter"` or a
   * cost of several.
   */
  readonly exilesSacrifice?: true;
  /**
   * "Exile a card from your hand" (Cadaverous Bloom, Holistic Wisdom): `count`
   * cards matching `filter`, chosen as it's paid with a `choose-from-zone`
   * (`destination: "exile"`), or taken with no choice to make. A mana ability
   * waits for the answer and adds its mana then (rule 605.3b), as a sacrifice
   * of several does; any other goes on the stack first, as `exileFromGraveyard`.
   */
  readonly exileFromHand?: { readonly count: number; readonly filter?: CardFilter };
  /**
   * "Exile an instant or sorcery spell you control" (Nivmagus Elemental, Synthesis
   * Pod): a spell or a copy on the stack, its controller's, matching `filter`.
   * It's exiled, not countered: one that can't be countered goes as well (the
   * ruling), and it doesn't resolve. Paid as `exileFromGraveyard` is, on the
   * stack, so never on a mana ability.
   */
  readonly exileSpell?: { readonly filter?: CardFilter };
  /**
   * Put `count` cards an opponent owns from exile into their owners'
   * graveyards as part of the cost — a processor's "{2}{U}, Put a card an
   * opponent owns from exile into that player's graveyard: Tap target
   * creature" (Cryptic Cruiser, Void Attendant). Which ones is chosen as the
   * cost is paid, once the ability is on the stack (rules 602.2b, 601.2h —
   * nobody can respond in between, its ruling), with a `choose-from-zone`
   * (`destination: "graveyard"`); cards of different opponents may be
   * chosen, and a face-down one is taken from its group at random (the
   * rulings). Gates activation on there being that many (rule 118.3). Not on
   * a mana ability, nor beside another cost that asks.
   *
   * The record form is the cards **exiled with this permanent** instead
   * (rule 607.2a — `GameObject.exiledWith`, in the stint it's in as the cost
   * is paid), whoever owns them, matching `filter`: Shelob, Dread Weaver's
   * "{2}{B}, Put a creature card exiled with Shelob into its owner's
   * graveyard" is `{ count: 1, linked: true, filter: { type: "creature" } }`.
   * Chosen and gated the same way.
   */
  readonly putFromExile?: PutFromExileCost;
  /**
   * Reveal `count` cards from your hand matching `filter` as part of the
   * cost — the Coldsnap Martyrs' "{1}, Reveal X white cards from your hand,
   * Sacrifice this creature" (rule 701.20a). `count: "x"` is that X,
   * announced as it's activated (601.2b, through 602.2b) and capped by the
   * matching cards there are; the effect reads it as `x`. Which cards is
   * chosen as the cost is paid, once the ability is on the stack (601.2h), a
   * `choose-from-zone` with the `"reveal"` destination — `Game.beginBehold`
   * over a `fromHand` spec — unasked when every matching card is needed.
   * They stay in the hand. Not on a mana ability, nor beside another cost
   * that asks. `shareColor` (a fixed `count` only) is Illuminated Folio's
   * "Reveal two cards from your hand that share a color" (see
   * `BeholdSpec.shareColor`). The effect reads the cards as `{ paid: "revealed" }`
   * ({@link ObjectRef}) when there's one.
   */
  readonly reveal?: {
    readonly count: number | "x";
    readonly filter: CardFilter;
    readonly text: string;
    readonly shareColor?: boolean;
  };
  /**
   * Tap *other* permanents you control as part of the cost — Gravespawn
   * Sovereign's "Tap five untapped Zombies you control". Distinct from
   * `tap`, which taps the source itself.
   *
   * The controller picks which (`tap` on the `activate-ability` action,
   * offered as `tapCost`), because it matters: a creature tapped for the cost
   * can't attack or block this turn. A driver that doesn't choose gets the
   * summoning-sick ones first — they couldn't attack anyway.
   *
   * `count: "x"` is "Tap X untapped artifacts you control" (Secluded
   * Starforge, Aryel): an X announced as it's activated (rule 107.3a), which
   * the effect and a target's filter read. It's offered once per X, each with
   * that many to pick and what's left once that X's mana is paid.
   *
   * `shareCreatureType` is the total constraint "that share a creature type"
   * (Weight of Conscience): the offer's `creatureTypes` says what each choice
   * has, and a choice of creatures with no type in common is refused.
   *
   * A `filter` of `{ hostOfSource: true }` is an Aura's "Tap enchanted
   * creature" (Krovikan Plague): the one permanent it's on, so no choice. It
   * isn't the `{T}` of rule 302.6, so a creature that just arrived may be
   * tapped, and only an untapped one: "activate only if enchanted creature is
   * untapped" says nothing more. Every such Aura enchants something "you
   * control", and leaves as a state-based action if its controller loses it
   * (rule 704.5m), so the one tapped is always the activating player's.
   */
  readonly tapOthers?: {
    readonly count: number | "x";
    readonly shareCreatureType?: true;
    /** Crew's form instead of a count (rule 702.122a): "tap **any number**
     * of other untapped creatures you control with **total power N or
     * greater**". `count` is then 0 and ignored; the tapped creatures'
     * powers as the cost is paid must add up to at least this. The `crew(n)`
     * helper writes it. */
    readonly totalPower?: number;
    readonly filter: CardFilter;
    /** Whether the ability's own source may be one of the permanents tapped.
     * True for Gravespawn Sovereign, which is itself a Zombie and has no
     * `{T}` of its own to conflict with. */
    readonly includeSelf?: boolean;
  };
  /**
   * Return `count` permanents you control matching `filter` to their
   * owner's hand as part of the cost — Quirion Ranger's "Return a Forest you
   * control to its owner's hand", Multani, Yavimaya's Avatar's "Return two
   * lands you control to their owner's hand". Which ones is chosen as the
   * cost is paid (rules 602.2b, 601.2h), once the ability is on the stack
   * and before anyone gets priority, with the `choose-permanents` decision —
   * asked only when there's a choice. Lands tapped for the ability's own
   * mana may be among them. Gates activation on controlling that many. Not
   * on a mana ability, nor beside a sacrifice or discard cost (each asks its
   * own question, and only one can wait at a time).
   */
  readonly returnToHand?: { readonly count: number; readonly filter: CardFilter };
  /**
   * Untap `count` tapped permanents you control matching `filter` as part of
   * the cost (rule 701.26b: only a tapped permanent can be untapped) — Halo
   * Fountain's "Untap two tapped creatures you control". Which ones is chosen
   * as the cost is paid (rules 602.2b, 601.2h), once the ability is on the
   * stack, its mana paid and its `{T}` tapped, and before anyone gets
   * priority, with the `choose-permanents` decision — asked only when there's
   * a choice. So a creature tapped for this ability's own mana may be among
   * them (Halo Fountain's ruling). What's offered waits on the tapped
   * permanents there are as it's activated, its own `{T}` counted, so a
   * creature that would be tapped for the mana is tapped for it first, with
   * the mana floating. A permanent with a stun counter can't pay: the counter
   * would replace the untap (rule 122.1d), as for `{Q}`. Not on a mana
   * ability, nor beside another cost that asks a question.
   */
  readonly untapOthers?: { readonly count: number; readonly filter: CardFilter };
  /**
   * "Blight N" as a cost (rule 701.68a — Gristle Glutton's "{T}, Blight 1:
   * …"): put N -1/-1 counters on a creature you control. The creature is
   * chosen as the cost is paid — once the ability is on the stack and its
   * mana paid, before anyone gets priority (rules 602.2b, 601.2h) — with the
   * `choose-permanents` decision, asked only when there's more than one to
   * choose from. The source itself may be the one. Activatable only while
   * you control a creature (701.68b). Not on a mana ability, nor beside
   * another cost that asks a question (one can wait at a time).
   */
  readonly blight?: number;
  /**
   * "Collect evidence N" (rule 701.59a — Forensic Researcher's "{T}, Collect
   * evidence 3: …"): exile any number of cards from your graveyard with
   * total mana value N or more, chosen as the cost is paid, once the ability
   * is on the stack (the `choose-from-zone` decision). Activatable only while
   * your graveyard holds that much (701.59b). A mana ability's (Cryptex)
   * waits for the answer and adds its mana then (rule 605.3b). Not
   * beside another cost that asks a question.
   *
   * The record is the same payment over some of the cards only, and no
   * collecting of evidence (nothing that watches for one sees it): "Exile any
   * number of historic cards from your graveyard with total mana value 30 or
   * greater" (The Capitoline Triad) is `{ totalManaValue: 30, filter }`.
   * Activatable only while the matching cards there hold that much (rule
   * 602.2b, paid as 601.2h); the source never counts.
   */
  readonly collectEvidence?: number | { readonly totalManaValue: number; readonly filter: CardFilter };
  /**
   * Craft's materials (rule 702.167a — "Craft with [materials] [cost]"): the
   * other half of the cost beside `exileSelf`, exiled from among permanents
   * you control and/or cards in your graveyard, chosen as the cost is paid
   * (the `choose-from-zone` decision, both zones at once) and linked to the
   * card being crafted (702.167c). Built by the `craft` helper.
   */
  readonly craft?: CraftMaterials;
  /**
   * The cost's mana is a **waterbend** cost (rule 701.67a — Geyser Leaper's
   * "Waterbend {4}: Draw a card, then discard a card", Katara, Water Tribe's
   * Hope's "Waterbend {X}: …"): `mana` holds the `{N}` (or `{X}`), and for
   * each generic mana in it the activator may tap an untapped artifact or
   * creature they control instead of paying it — named on the
   * `activate-ability` action's `waterbend`, offered as the offer's
   * `waterbend` (`WaterbendOffer`). Only that much generic may be paid by
   * tapping, whatever increases or reduces the total (701.67b). Any
   * artifact or creature may tap, summoning sick or not (the rulings) and
   * the source too — unless the cost also has `{T}`, which taps it. Not on
   * a mana ability, nor beside `tapOthers`.
   */
  readonly waterbend?: boolean;
}

/** The kinds of activated ability a cost modifier can single out by name (rule
 * 602.2b): `isEquipAbility`, `isManaAbility` (`"mana"`, rule 605.1a), or the
 * ability's own flag. */
export type AbilityKindName = "equip" | "exhaust" | "cycling" | "loyalty" | "power-up" | "mana";

export interface ActivatedAbility {
  readonly cost: AbilityCost;
  readonly targets: readonly TargetSpec[];
  /**
   * The target slots **an opponent** chooses, as for a spell's
   * (`CardDefinition.opponentChoosesTargets`): "tap target creature you
   * control and target creature **of an opponent's choice they control**"
   * (Magus of the Arena: `[1]`). The activator names the opponent (the
   * action's `otherChooser`), who answers a `choose-targets` as it's
   * activated (rules 602.2b, 601.2c).
   */
  readonly opponentChoosesTargets?: readonly number[];
  /** "This creature deals 2 damage to any target **chosen at random**" (Goblin
   * Test Pilot). See `TriggeredAbility.targetsAtRandom`. Nothing is offered to
   * choose: the action names no targets, and they're picked as it's activated. */
  readonly targetsAtRandom?: true;
  readonly effect: EffectSpec | null;
  readonly resolve: SpellResolver | null;
  readonly text: string;
  /** "This ability can't be copied" (Gogo, Master of Mimicry): an effect
   * that would copy it on the stack (rule 707.10) makes nothing — the
   * ability is still a legal target for one. A spell's is
   * `CardDefinition.cantBeCopied`. */
  readonly cantBeCopied?: true;
  /** True for abilities like Equip that function only as a sorcery (rule 602.3). */
  readonly sorcerySpeed?: boolean;
  /** "Any player may activate this ability" (rule 602.2 — "unless the object
   * specifically says otherwise"; Glittering Lion, Excavation): a battlefield
   * ability any player with priority may activate, not only the permanent's
   * controller. Whoever activates it controls it (602.2a) and pays its costs,
   * so "you" in it is them. With `sorcerySpeed`, "but only as a sorcery" — the
   * activator's main phase. */
  readonly anyPlayer?: true;
  /** "**Only your opponents** may activate this ability" (Detention Vortex,
   * Oft-Nabbed Goat): an opponent of the permanent's controller may, as with
   * `anyPlayer`, and its controller may not. */
  readonly onlyOpponents?: true;
  /** One of reconfigure's two abilities (rule 702.151a — the `reconfigure`
   * helper): what lets an Equipment that's a creature equip (301.5c). */
  readonly reconfigure?: "attach" | "unattach";
  /** A Licid's "~ loses this ability and becomes an Aura enchantment with
   * enchant creature" ability (`licid: true`): while the effect lasts
   * (`GameObject.licid`) the permanent doesn't have it. */
  readonly licid?: true;
  /** This is a station ability (rule 702.184a — `cards/helpers.ts`'s
   * `station()`), which makes its card a station card (702.184b): one whose
   * printed power and toughness belong to a station symbol (721.2b). */
  readonly station?: boolean;
  /** This is a saddle ability (rule 702.171a — `cards/helpers.ts`'s
   * `saddle()`): each creature tapped for its `tapOthers` cost **saddles** its
   * source as it's tapped (702.171c), which the creature remembers for the
   * rest of the turn (`GameObject.saddledThisTurn`) — "a creature that
   * saddled it this turn" (`CardFilter.saddledSource`). */
  readonly saddle?: true;
  /** This is a crew ability (rule 702.122a — `cards/helpers.ts`'s `crew()`):
   * each creature tapped for its `tapOthers` cost **crews** its source
   * (702.122b). What marks the cost as crew's for a creature that "crews
   * Vehicles as though its power were 2 greater" or "using its toughness
   * rather than its power" (`StaticAbility.crewsAs`), which a saddle cost
   * reaches only when it says "saddles Mounts" and teamwork's never does. */
  readonly crew?: true;
  /**
   * A loyalty ability (rule 606) — present ⇒ this ability's cost is "add
   * `loyaltyCost` loyalty counters to the source" (negative removes them),
   * it functions only as a sorcery, and only one loyalty ability of a given
   * permanent may be activated each turn. `cost.mana` / `cost.tap` are
   * ignored; a loyalty ability with a target is fine ("+1: Untap two target
   * lands"). Uses the stack like any other activated ability.
   *
   * `"-x"` is a "−X" cost (Chandra Nalaar's "−X: … deals X damage to target
   * creature"): its controller announces X as it's activated (rule 107.3a,
   * the `xValue` an `{X}` mana cost takes, offered as the `xCost` range up
   * to the loyalty it has, 606.6), and that many loyalty counters are
   * removed. The ability's X is that value (107.3k), read as `ctx.x` /
   * amount `"x"` like any activated ability's.
   */
  readonly loyaltyCost?: number | "-x";
  /** "Sacrifice **another** black creature" (Ayara, First of Locthwain) —
   * keeps the source out of its own **sacrifice cost**; without it Ayara
   * could eat herself to draw. Targets are another matter: "another target
   * artifact" (Manifold Key) is an `other` target spec on that slot. */
  readonly otherOnly?: boolean;
  /** "Activate only if …" (rule 602.5, e.g. Ferocious — Fanatic of Rhonas:
   * "{T}: Add {G}{G}{G}{G}. Activate only if you control a creature with
   * power 4 or greater"). Mirrors `StaticAbility.condition` /
   * `TriggeredAbility.condition` — checked live, from the source's
   * controller's perspective. A mana ability gated this way is also excluded
   * from `Game.manaSources()`'s auto-payment scan while the condition is
   * false, not just from manual activation. needed-cards P19. */
  readonly condition?: StaticCondition;
  /**
   * Activatable from a zone other than the battlefield. The card leaving that
   * zone is an implicit, unconditional part of the cost (there's no `{T}` and
   * nothing to sacrifice), and the ability still goes on the stack like any
   * other activated ability.
   *
   * - `"hand"` — a Channel ability (rule 702.51a): "Channel — [cost], Discard
   *   this card: [effect]". Pays by **discarding** the source.
   * - `"graveyard"` — Runehorn Hellkite's "{5}{R}, Exile this card from your
   *   graveyard: …", and the shape Encore is built on. Pays by **exiling**
   *   the source, unless `staysInZone` says the cost doesn't move it.
   * - `"command"` — Derevi, Empyrial Tactician's "{1}{G}{W}{U}: Put Derevi
   *   onto the battlefield from the command zone." No zone-change cost: the
   *   card stays where it is until the ability resolves.
   *
   * Only the card's owner may activate it (a card in a hand, graveyard or the
   * command zone is controlled by nobody else). It may be a mana ability
   * (rule 605.1a — Elvish Spirit Guide, Jack-o'-Lantern), which never uses the
   * stack; auto-payment never reaches into another zone (`Game.manaSources`),
   * so it's activated by hand, before the cast it pays for.
   *
   * An ability whose source stays put (`"command"`, or `staysInZone`) and
   * whose effect names `"source"` finds it only if it is still the same object
   * when the ability resolves (rule 400.7): the card leaving that zone —
   * Derevi cast in response, say, even if she comes back — makes `"source"`
   * name nothing, so the effect does nothing. See
   * `GameObject.zoneChangeCount`.
   *
   * - `"suspended"` — Greater Gargadon's "Sacrifice an artifact, creature, or
   *   land: Remove a time counter from this card. Activate only if this card
   *   is suspended." Activatable by its owner only while the card is suspended
   *   (in exile, with suspend and a time counter — rule 702.62b); the cost
   *   doesn't move it, so `"source"` finds it as with `"command"`.
   */
  readonly zone?: "hand" | "graveyard" | "command" | "suspended";
  /**
   * A `zone: "graveyard"` ability whose cost *doesn't* exile the card
   * (Reassembling Skeleton: "{1}{B}: Return this card from your graveyard to
   * the battlefield tapped."). The card stays in the graveyard while the
   * ability is on the stack, so it can be activated again in response, and
   * the effect finds it only if it's still there (see `zone`). With `zone:
   * "hand"`, a hand ability that isn't channel: the card isn't discarded
   * (ninjutsu).
   */
  readonly staysInZone?: boolean;
  /** A `zone: "hand"` ability whose cost **exiles** the card rather than
   * discarding it: "Exile this card from your hand" (Simian Spirit Guide). */
  readonly exilesFromHand?: true;
  /** A ninjutsu ability (rule 702.49), as the `ninjutsu()` helper writes it:
   * the card is revealed from the hand as it's activated (702.49b). What "a
   * ninjutsu ability" names. */
  readonly ninjutsu?: true;
  /** A cycling ability (rule 702.29a, typecycling 702.29e–f too), as
   * `Game.cyclingAbilityOf` builds it from `CardDefinition.cycling`: what
   * "cycling abilities you activate" (Fluctuator) names. */
  readonly cycling?: true;
  /** "Activate only once each turn" (rule 602.5g — Steel Hellkite). Tracked
   * per ability in the journal (`activated` entries), so a permanent
   * with two such abilities limits each separately. */
  readonly oncePerTurn?: boolean;
  /** "Activate no more than **twice** each turn" (Pit Imp — `2`; rule
   * 602.5b), or a count read as it would be activated — Withering Wisps'
   * "no more times each turn than the number of snow Swamps you control" (`{
   * countOf: … }`, from the activating player's side). Kept per ability
   * in the journal with `oncePerTurn`'s, one
   * entry an activation, so the restriction stays with the object through a
   * change of control (602.5b). A mana ability with it isn't offered to the
   * auto-payer: activated by hand. */
  readonly timesEachTurn?: EffectAmount;
  /** Exhaust — "Activate each exhaust ability only once": once for as long
   * as the object exists, rather than once each turn (Loot, the
   * Pathfinder). Tracked per ability index on
   * `GameObject.exhaustedAbilities`, which a zone change clears — the
   * permanent that comes back is a new object (rule 400.7). */
  readonly exhaust?: boolean;
  /** "Activate only once" on an ability that isn't an exhaust ability (rule
   * 702.177a says the two limit it alike): tracked as `exhaust` is, but nothing
   * that reads "exhaust abilities" (702.177b, Boom Scholar) counts it —
   * Stalking Leonin, Guardian Archon. */
  readonly onlyOnce?: true;
  /** Power-up (rule 702.193a): "Activate this ability only once", tracked as
   * `exhaust` is — and while its permanent is on the battlefield the turn it
   * entered, the ability costs less by that permanent's mana cost (702.193b,
   * rule 118.7 — see `Game.poweredUp`). */
  readonly powerUp?: boolean;
  /** This is the ability at this index in its permanent's list at another
   * cost (`alternativeAbilityCost`): activating it uses that one up. */
  readonly altCostOf?: number;
  /** Boast (rule 702.142a — Dragonkin Berserker): activatable only if this
   * creature attacked this turn, and only once each turn. Implies
   * `oncePerTurn`; the "attacked this turn" half reads
   * `GameObject.attackedThisTurn`. */
  readonly boast?: boolean;
  /** A live cost reduction printed on the ability itself, mirroring
   * `CardDefinition.selfCostReduction` for a spell — the Kamigawa Channel
   * lands' "This ability costs {1} less to activate for each legendary
   * creature you control." `condition` gates it, read from the source's
   * side as `selfCostReduction`'s is — Sewer Crocodile's "costs {3} less to
   * activate **if** there are five or more mana values among cards in your
   * graveyard". `reduceColored` is the coloured part of what it takes off, as
   * a spell's: Flying Drone's "costs {1}{U} less" is `reduceGeneric: 1`,
   * `reduceColored: "{U}"`. A symbol the cost hasn't comes off its generic
   * part (rule 118.7c). */
  readonly costReduction?: {
    readonly reduceGeneric: EffectAmount;
    readonly reduceColored?: string;
    readonly condition?: StaticCondition;
  };
  /**
   * "This ability costs {N} less to activate if it targets [`count` objects
   * matching `filter`]" — Wayta, Trainer Prodigy's "{2} less … if it targets
   * two creatures you control" (`count: 2`; one when absent). The spell's
   * `CardDefinition.targetCostReduction` for an ability: the total cost is
   * fixed once the targets are chosen (rules 602.2b, 601.2c, 601.2f), so the
   * activation pays less when that many distinct chosen targets match, from
   * the activator's side — and a target that stops matching later changes
   * nothing. An offer only affordable with it offers only the targets that
   * earn it.
   */
  readonly targetCostReduction?: {
    readonly filter: CardFilter;
    /** `"target-colors"`: "{1} less for each color of the creature it
     * targets" (Dragonfire Blade), read as the targets are chosen; offered
     * for the targets it's affordable with. `"target-power"`: "{X} less,
     * where X is the power of the creature it targets" (Belt of Giant
     * Strength), the same way; a power below 0 takes nothing off. */
    readonly reduceGeneric: number | "target-colors" | "target-power";
    readonly count?: number;
  };
  /** The least X the ability may be activated with — Ruthless Technomancer's
   * "Sacrifice X artifacts: … X can't be 0." Absent: 0. The offer's
   * `xCost.minX` says it, and an activation below it is refused. */
  readonly minX?: number;
  /** The most X may be — "Sacrifice **up to three** permanents" (Baba
   * Lysaga, Night Witch) is a sacrifice of `count: "x"` with `maxX: 3`: how
   * many, 0 to 3, announced as it's activated and that many chosen as the
   * cost is paid (601.2h). The offer's `xCost.maxX` is never above it, and an
   * activation above it is refused. Not an {X} in the cost: nothing that
   * asks for one (Magus Lucea Kane) sees it. */
  readonly maxX?: number;
  /** The cost's X is **defined by the ability's own text**, not chosen (rule
   * 107.3c): Prototype Portal's "{X}, {T}: Create a token that's a copy of
   * the exiled card. X is the mana value of that card." is `xIs: {
   * manaValueOf: "exiled-with-source" }` — the mana value of what the ref
   * reads as the ability is activated (an {X} in that card's own cost is 0
   * off the stack, rule 202.3e). The one X it's offered at (`xCost.minX ===
   * maxX`), and any other is refused; while the ref reads nothing (no card
   * exiled with it) X is undefined and the ability can't be activated (the
   * card's ruling). The effect reads it as `"x"` like any other. */
  readonly xIs?: { readonly manaValueOf: ObjectRef };
  /** "N damage divided as you choose among one or two targets" (Skarrgan
   * Hellkite): the targets from `slot` on — an `any-number` group — share
   * `total`, split as the ability is activated (rules 602.2b, 601.2d: the
   * `activate-ability` action's `division`, at least 1 each) and dealt by a
   * `damage-divided` effect. A target gone illegal loses its share. A
   * `total` that is an amount is read as it's activated, when the division
   * is announced — "where X is the greatest power among creatures you
   * control as you activate this ability" (Lukka, Bound to Ruin) — and caps
   * its group (at least 1 each), so give the group no `max`. */
  readonly divided?: { readonly total: EffectAmount; readonly slot: number; readonly of?: string };
}

/**
 * How an attacked player's life total compares with the other players', for
 * an `attacks` or `attacks-player` trigger. Only a *player* ranks: a
 * creature attacking a planeswalker is attacking that planeswalker (rule
 * 508.3a), so it never meets one of these. Players who have left the game
 * aren't compared.
 */
export type DefenderLife =
  /** Dethrone (rule 702.105a): "attacks the player with the most life or
   * tied for most life" — among every player in the game, this permanent's
   * controller included, so attacking an opponent while you have the most
   * life doesn't count unless they're tied with you. A trigger condition,
   * not an intervening-if: asked as the attack is declared and never again,
   * so the counter still goes on if life totals change before it resolves. */
  | "most"
  /** "…, if that opponent has more life than another of your opponents"
   * (Breena, the Demagogue): more than at least one *other* opponent of this
   * permanent's controller. An intervening-if (rule 603.4), so it's asked
   * again as the ability resolves, of the same attacked player. */
  | "more-than-another-opponent"
  /** "…, **if it's attacking** the player with the most life or tied for
   * most life" (Scourge of the Throne): `"most"` as an intervening-if (rule
   * 603.4), asked again as the ability resolves of the player the attacker
   * is attacking then — as it last existed if it has left the battlefield,
   * and nobody if it has been removed from combat (the ruling: unlike
   * dethrone, it must hold at both times). */
  | "most-still-attacking";

/** Who the triggering object must be relative to the ability's source. */
export type TriggerWho =
  | "self"
  | "you-control"
  | "any"
  | "you"
  /** An opponent of this permanent's controller. Where the subject is a
   * *player*, that player is an opponent — a `step-begins` trigger's "each
   * opponent's end step" (Archfiend of Depravity), which fires once per
   * opponent's turn rather than once per opponent. Where it is an *object*,
   * an opponent controls it ("whenever a creature an opponent controls
   * dies"), read as it last existed on the battlefield if it has left. */
  | "opponent"
  /**
   * The permanent this one is attached to — "**equipped** creature",
   * "**enchanted** creature / land / permanent" (Skullclamp, Wild Growth, the
   * Swords): the Equipment's or Aura's host as the event happened, whoever
   * controls it. The trigger is still the Equipment's or Aura's, and its
   * controller's. A host that has left ("equipped creature dies") is matched
   * by the host its source had then — remembered by a source that left at
   * the same time (`LastKnownInfo.attachedTo`). On a Curse (an Aura on a
   * player) it is the **enchanted player**: "whenever enchanted player is
   * attacked", and a `step-begins` trigger's "at the beginning of enchanted
   * player's upkeep" (Curse of the Bloody Tome), whose step belongs to them —
   * that player is then the `"active-player"`.
   */
  | "attached"
  /** A permanent the player this Aura is attached to controls — a Curse's
   * "Whenever a creature **enchanted player controls** enters" (Trespasser's
   * Curse), read as it last existed if it has left. The trigger is the
   * Curse's, and its controller's. */
  | "enchanted-player-controls"
  /** "**The chosen player**" — the player chosen for this permanent
   * (`GameObject.chosenPlayer`, as it last existed if it has left): a
   * `step-begins` trigger's "at the beginning of the chosen player's upkeep"
   * (Black Vise), whose step belongs to them — that player is then the
   * `"active-player"`. Where the subject is an object, nothing matches. */
  | "chosen-player"
  /** "**The chosen creature**" — the permanent chosen for this one
   * (`GameObject.chosenPermanent`, as this one last existed if it has left),
   * in the stint it was chosen in: "when the chosen creature leaves the
   * battlefield, transform Zenos yae Galvus". Once that permanent has left
   * it's a new object the choice no longer names (rule 400.7), so a later
   * entry of the same card doesn't match. Where the subject is a player,
   * nothing matches. */
  | "chosen"
  /** This ability's controller's **Ring-bearer** (rule 701.54a) — the Ring
   * emblem's "whenever your Ring-bearer attacks". */
  | "ring-bearer";

/** The trigger event of a {@link TriggerSpec}, one member per kind. */
export type TriggerKind =
  | {
      /**
       * "When you lose control of this permanent" (Khârn the Betrayer): another
       * player gains control of it, or it leaves the battlefield (Khârn's
       * 2022-10-07 ruling, Gustha's Scepter's 2004-10-04 one). Looks back in
       * time (rule 603.10d): "you" is whoever controlled
       * it just before, and the ability is that player's. Its one permanent is
       * the trigger object.
       */
      readonly on: "loses-control";
      readonly who: "self";
    }
  | {
      /**
       * "When you gain control of this enchantment from another player" (Risky
       * Move): "you" is who has it now. Entering the battlefield under your
       * control isn't gaining control of it from anyone.
       */
      readonly on: "gains-control";
      readonly who: "self";
    }
  | {
      /**
       * "Whenever an opponent gains control of a permanent from you" (Zidane,
       * Tantalus Thief). Looks back in time (rule 603.10d): this permanent
       * going too sees it, its ability its former controller's, and permanents
       * changing hands at once are each seen by a watcher that went among them.
       * The permanent that changed hands is the trigger object; a token stack
       * handed over whole is a permanent per token. `filter` narrows it.
       */
      readonly on: "control-taken";
      readonly filter?: CardFilter;
    }
  | {
      /**
       * "Whenever the Ring tempts you" (rule 701.54d): once the player has
       * chosen a Ring-bearer, or found no creature to choose. The creature
       * chosen is the trigger object (Gandalf, Friend of the Shire's "if you
       * chose a creature other than Gandalf"); with `chosen`, only a
       * temptation that chose one fires it — Call of the Ring's "whenever
       * you choose a creature as your Ring-bearer", the same creature again
       * included. `"other"` is "if you chose a creature **other than** ~ as
       * your Ring-bearer" (Galadriel of Lothlórien): one chosen, and not this
       * permanent — an intervening "if" (rule 603.4) about a choice already
       * made, so it reads the same as the ability resolves. `who` is the
       * tempted player.
       */
      readonly on: "ring-tempts";
      readonly who: TriggerWho;
      readonly chosen?: boolean | "other";
    }
  | {
      /** "When this Class becomes level `level`" (rule 716.2a): `who: "self"`. */
      readonly on: "class-level-gained";
      readonly who: TriggerWho;
      readonly level: number;
    }
  | {
      /**
       * A Room's door was unlocked (rule 709.5h) — the `door-unlocked` event.
       * "When you unlock this door" is `who: "self"` with `door` the half
       * that prints it (the `room()` helper writes it), and it triggers as
       * that door unlocks however it does: entering with it unlocked (the
       * half cast), its unlock cost, or an effect. "Whenever you fully unlock
       * a Room" (Entity Tracker's eerie) is `fully: true` (709.5i), `who` the
       * Room's controller. `filter` narrows the Room.
       */
      readonly on: "door-unlocked";
      readonly who: TriggerWho;
      readonly door?: "left" | "right";
      readonly fully?: boolean;
      readonly filter?: CardFilter;
    }
  | {
      /**
       * A face-down permanent was turned face up (rule 708.8) — the
       * `permanent-turned-face-up` event, however it was turned (its cost, or
       * an effect). "When this creature is turned face up" (Den Protector,
       * Rattleclaw Mystic) is `who: "self"`: the permanent has its abilities
       * from then on, so this one triggers. "Whenever a permanent you control
       * is turned face up" (Trail of Mystery) is `who: "you-control"`, its
       * trigger object the permanent; `filter` narrows it, as it is now.
       */
      readonly on: "turned-face-up";
      readonly who: TriggerWho;
      readonly filter?: CardFilter;
    }
  | {
      readonly on: "enters-battlefield";
      readonly who: TriggerWho;
      /** Narrow which entering permanent counts (Soul Warden: a creature;
       * landfall: a land). */
      readonly filter?: CardFilter;
      /** "another …" — the source permanent entering doesn't count. */
      readonly otherOnly?: boolean;
      /** "Whenever **one or more** … enter" (Marneus Calgar's tokens): once
       * per simultaneous entry, however many of its permanents match — a
       * batch of tokens, a mass reanimation. Its trigger object is the first
       * of them to match; don't read it. */
      readonly batched?: boolean;
      /** "Whenever you create one or more tokens **for the first time each
       * turn**" (Akim, the Soaring Wind — `who: "you-control"`, `filter: {
       * token: true }`, `batched`): only the entry with this permanent's
       * controller's first tokens of the turn, whether or not this ability
       * was there for an earlier one. A token enters under the control of the
       * player who creates it (rule 111.2), so a token entering under you is
       * one you created. */
      readonly firstCreationEachTurn?: true;
    }
  | {
      readonly on: "dies";
      readonly who: TriggerWho;
      readonly filter?: CardFilter;
      readonly otherOnly?: boolean;
      /** "Whenever **one or more** creatures die" (Great Fierce Bee, Seer of
       * Stolen Sight, Rinoa, Angel Wing): once per simultaneous event, however
       * many of its permanents match — off `permanents-died`, so it fires once
       * the whole wrath or state-based sweep is done. Each is read as it last
       * existed (rule 603.10a), and a permanent that left in that event sees
       * it too (Rinoa's ruling). `{ triggerValue: true }` is how many matched,
       * a token stack counting as each of its tokens, and
       * `put-arrived-onto-battlefield` takes "one of them" from the cards among
       * them. Without "this ability triggers only once each turn", which is a
       * plain `dies` with `oncePerTurn`. */
      readonly batched?: boolean;
      /** A `batched` trigger's `{ triggerValue: true }`, in place of how many:
       * `"total-power"` is their total power, each as it last existed (rule
       * 603.10a; The Skullspore Nexus's "the total power of those creatures"),
       * a negative one subtracting (rule 107.1b). Fixed as it triggers. */
      readonly batchValue?: "total-power";
    }
  | {
      /** "Whenever this Equipment becomes unattached from a permanent"
       * (Grafted Exoskeleton, Captain's Hook): attached to something else,
       * unattached by an effect or a state-based action, what it was attached
       * to leaving the battlefield — or this leaving while attached, read as
       * it last existed (rule 603.10a). Its trigger object is the permanent
       * it was attached to: "sacrifice that permanent" is a `sacrifice-target`
       * of `"trigger-object"`. */
      readonly on: "becomes-unattached";
      readonly who: "self";
    }
  | {
      /** "Whenever this Equipment becomes attached to a creature" (Blade of
       * Shared Souls, Assimilation Aegis): moved from one to another counts,
       * on the one it's moved to. Its trigger object is what it's attached to. */
      readonly on: "becomes-attached";
      /** `"self"`: this permanent is what became attached. */
      readonly who?: "self";
      /** `"self"`: "whenever an Aura becomes attached **to this creature**"
       * (Brood Keeper), a move from elsewhere or an Aura entering attached
       * alike (the ruling). */
      readonly onto?: "self";
      /** What became attached: "an **Aura you control** becomes attached"
       * (Siona), read from this ability's controller's side. */
      readonly attachment?: CardFilter;
      /** What it became attached to. */
      readonly filter?: CardFilter;
    }
  | {
      /** A permanent left the battlefield — for any destination (graveyard,
       * exile, hand, library, command zone). Broader than `"dies"`, which
       * only fires for a move to a graveyard. Rule 603.6d / 700.4. */
      readonly on: "leaves-battlefield";
      readonly who: TriggerWho;
      /** Matched against the permanent as it last existed on the battlefield
       * — "a creature you control", "if it had one or more +1/+1 counters on
       * it" (a `counters` clause). */
      readonly filter?: CardFilter;
      /** "Another …" — not this permanent itself. */
      readonly otherOnly?: boolean;
      /** Only for these destinations — Reyhan, Last of the Abzan's "dies or
       * is put into the command zone" is `["graveyard", "command"]`. */
      readonly to?: readonly ("graveyard" | "exile" | "hand" | "library" | "command")[];
      /** "Whenever **one or more** … leave the battlefield" (Dour Port-Mage,
       * Aang, Airbending Master, Nefarious Imp): once per simultaneous event,
       * however many of them match, off `permanents-left`; as `dies`'s, each
       * read as it last existed and a permanent leaving in that event seeing it
       * too (rule 603.10a). `{ triggerValue: true }` is how many. */
      readonly batched?: true;
    }
  | {
      /** A player gained life (Ajani's Pridemate). `who` is whose life.
       * `{ triggerValue: true }` is how much ("that much" — Sanguine Bond).
       * Once per life-gain event: lifelink damage one source deals to several
       * things at once is one event. */
      readonly on: "gains-life";
      readonly who: TriggerWho;
    }
  | {
      /** "Whenever you expend N" (rule 700.14): paying for a spell took the
       * mana the player has spent on spells this turn from below `amount` to
       * `amount` or more — once a turn, the payment that crosses it. */
      readonly on: "expend";
      readonly who: TriggerWho;
      readonly amount: number;
    }
  | {
      /** A player lost life. `who` is whose life, `{ triggerValue: true }`
       * how much (Exquisite Blood). */
      readonly on: "loses-life";
      readonly who: TriggerWho;
      /** Only a loss an effect caused (rule 119.3) — not damage's, nor a
       * cost's — of a spell or ability this player controls, relative to this
       * permanent: Sahir, Visitor in Darkness's "whenever a spell or ability
       * **you control** causes you to lose exactly 1 life" is `"you"`. */
      readonly byEffectOf?: "you";
      /** Only exactly this much lost at once ("exactly 1 life"). With
       * `batched`, each player's whole loss in the batch (Ob Nixilis, Captive
       * Kingpin: "one or more opponents each lose exactly 1 life"). */
      readonly exactly?: number;
      /** "…loses life … **during each of their turns**" (Valgavoth,
       * Harrower of Souls, with `firstTimeEachTurn`): only while that player
       * is the active player. */
      readonly duringTheirTurn?: true;
      /** "Whenever **one or more** opponents lose life" (Emet-Selch of the
       * Third Seat): once per simultaneous loss, however many of `who` lost
       * life in it (rule 603.2c) — damage dealt at once (a combat damage
       * step, "each opponent"), or an effect's "each opponent loses N life".
       * No trigger player; `{ triggerValue: true }` is the total lost. */
      readonly batched?: true;
    }
  | {
      /**
       * A player **played** a land (Flubs, the Fool; Burgeoning; Fastbond) —
       * the special action of rule 305.1, off `land-played`. Not landfall: a
       * land put onto the battlefield by an effect wasn't played (116.2a),
       * which is exactly the difference from an `enters-battlefield` trigger
       * filtered to lands.
       */
      readonly on: "plays-land";
      readonly who: TriggerWho;
      /** "When you play **another** land" (City of Traitors): playing this
       * land itself doesn't count — it's on the battlefield by the time its
       * own play is announced. */
      readonly otherOnly?: boolean;
    }
  | {
      /**
       * A player **played a card** — played a land *or* cast a spell, since
       * "play" covers both (rule 601.2 / 305.1). `from` narrows it to the
       * zone the card was played from: Prosper, Tome-Bound's "whenever you
       * play a card **from exile**" fires on a land played off an impulse
       * exile as well as on a foretold, suspended, cascaded or adventure card
       * cast from there. Reads the `from` recorded on `land-played` and
       * `spell-cast` (a copy of a spell is never *cast* here, so it never
       * counts — rule 707.10).
       */
      readonly on: "plays-card";
      readonly who: TriggerWho;
      readonly from?: ZoneType;
      /** A filter on the card played — the land on the battlefield, the
       * spell on the stack: Rendmaw, Creaking Nest's "a card with two or
       * more card types". */
      readonly filter?: CardFilter;
      /** Only a card played under this permanent's own permission, in its
       * present stint — Share the Spoils' "that player may play a land or
       * cast a spell from among cards exiled with this enchantment … When
       * they do, exile the top card of their library" (the event's
       * `permission`). The player who played it is `"trigger-player"`. */
      readonly underThis?: true;
    }
  | {
      /**
       * One or more counters were put on a permanent (rule 122.6, which
       * includes the counters it entered with) — Shalai and Hallar's
       * "whenever one or more +1/+1 counters are put on a creature you
       * control". Fires once per permanent per event, so counters put on two
       * creatures at once trigger twice (Hapatra's ruling). `who` / `filter`
       * are about the permanent, `counter` narrows the kind, and `byYou` is
       * "whenever **you** put …". `{ triggerValue: true }` is how many; the
       * permanent is the trigger object.
       */
      readonly on: "counters-put";
      readonly who: TriggerWho;
      readonly counter?: string;
      readonly filter?: CardFilter;
      readonly byYou?: boolean;
      /** "When the Nth [`counter`] counter is put on this" (Midnight Clock,
       * the Plans): only the placement that takes that kind from fewer than
       * N to N or more — several at once past N count, and later ones don't
       * fire it again until it has dropped back below N. */
      readonly nth?: number;
      /** "Whenever **a** +1/+1 counter is put on" (Fathom Mage, Flourishing
       * Defenses): once per counter, each its own trigger (rule 603.2c and
       * those cards' rulings), `{ triggerValue: true }` being 1. */
      readonly perCounter?: true;
      /** "Whenever one or more counters are put on **one or more** …"
       * (Invisible Woman, Sue Storm; Bioessence Hydra): once for a simultaneous
       * placement, however many permanents got counters, with
       * `{ triggerValue: true }` the total (`withCounterBatch`). Its trigger
       * object is the first of them to match; don't read it. */
      readonly batched?: true;
      /** "… on **another** / **other** [permanent]": not this one. */
      readonly otherOnly?: true;
      /** "… on a permanent **or player**" (All Will Be One): a player's
       * counters fire it too (rule 122.1), energy included (rule 107.14), once
       * per player for a simultaneous placement, with `{ triggerValue: true }`
       * how many (toxic's ruling); `filter` asks only of a permanent, `who`
       * of the player too (`"any"` for every player's; `"you"` is "whenever
       * you get one or more {E}" — Territorial Gorger, with `counter:
       * "energy"`). There's no trigger object for a player's. */
      readonly orPlayer?: true;
    }
  | {
      /**
       * One or more counters were removed from a permanent — Regenerations
       * Restored's "whenever one or more time counters are removed from this
       * enchantment". Fires once per removal event, whatever was removed by
       * (an upkeep trigger, a cost, time travel, an effect). `counter`
       * narrows the kind; `{ triggerValue: true }` is how many.
       *
       * `last` is vanishing's "when the **last** time counter is removed
       * from this permanent" (rule 702.63a): only a removal that leaves it
       * with none of that kind — not a permanent that never had one, which
       * no removal reaches.
       */
      readonly on: "counters-removed";
      readonly who: TriggerWho;
      readonly counter?: string;
      readonly filter?: CardFilter;
      readonly last?: boolean;
      /** "Whenever **a** +1/+1 counter is removed from this creature"
       * (Protean Hydra): once per counter, each its own trigger (rule 603.2c
       * and its ruling), `{ triggerValue: true }` being 1 — like
       * `counters-put`'s `perCounter`. */
      readonly perCounter?: true;
    }
  | {
      /**
       * A player drew a card (Nekusar, the Mindrazer; Niv-Mizzet, Parun;
       * Consecrated Sphinx; Smothering Tithe). `who` is who drew.
       *
       * Fires **once per card**, off `card-drawn`, so "draw three" triggers
       * three times, as the printed "whenever … draws a card" does. A draw
       * from an empty library draws nothing and doesn't fire it. The drawn
       * card is the trigger object, so "that player" is the
       * `"trigger-controller"` player scope (Nekusar: "deals 1 damage to that
       * player") — not a target, and not slot 0, which stays the ability's
       * own (Niv-Mizzet, Parun: "1 damage to any target").
       */
      readonly on: "draws";
      readonly who: TriggerWho;
      /** Only a drawn card matching this, as it is in the hand it was drawn
       * into — Keranos, God of Storms' "whenever you reveal a **land** card
       * this way" (the first card drawn on each of your turns). */
      readonly filter?: CardFilter;
      /** Not the first card they draw in their own draw step — Xyris, the
       * Writhing Storm's "except the first one they draw in each of their
       * draw steps". A draw in someone else's draw step still counts. */
      readonly exceptFirstInDrawStep?: boolean;
    }
  | {
      /**
       * A permanent became the target of a spell or ability (rule 115.7 /
       * 603.2) — Thunderbreak Regent's "Whenever a Dragon you control becomes
       * the target of a spell or ability an opponent controls".
       *
       * The triggering *player* (whoever targeted it) fills the ability's
       * first target slot automatically, the same way
       * `deals-combat-damage-to-player` fills it with the damaged player.
       */
      readonly on: "becomes-target";
      readonly who: TriggerWho;
      /** Narrow which targeted permanent counts (Thunderbreak Regent: "a
       * Dragon you control"). */
      readonly filter?: CardFilter;
      /** "Another …" — this permanent itself becoming a target doesn't count
       * (Monk Gyatso). */
      readonly otherOnly?: boolean;
      /** Spells on the stack count beside permanents, read by the same `who`
       * and `filter`: "a creature you control **or a creature spell you
       * control** becomes the target" (Surrak, Elusive Hunter). A spell is an
       * object a spell or ability can target (rule 115.1); an ability on the
       * stack never counts. */
      readonly orSpell?: true;
      /** Only when the spell or ability belongs to an opponent of this
       * permanent's controller — which is how every printed card of this
       * shape words it. */
      readonly byOpponentOnly?: boolean;
      /** Only a spell or ability this permanent's controller controls —
       * valiant's "a spell or ability you control" (rule 207.2c). */
      readonly byControllerOnly?: boolean;
      /** Only a *spell* targeting it counts, not an activated ability —
       * "becomes the target of a spell" (Gargos, Vicious Watcher; Tectonic
       * Giant). */
      readonly spellOnly?: boolean;
      /** The ability's targets are all its controller's choice: the
       * targeting player never fills its first slot — Venerated Rotpriest's
       * "target opponent gets a poison counter" may name any opponent, not
       * only the one whose spell it was. */
      readonly targeterNotTarget?: boolean;
      /** Players count too: "whenever **you** or a permanent you control
       * becomes the target" (Unsettled Mariner — `"you"`, this permanent's
       * controller), "whenever a **player** or permanent becomes the target"
       * (Loki, God of Mischief — `"any"`). Once per player a spell or ability
       * targets, beside once per permanent; `who` and `filter` are about
       * permanents only. */
      readonly player?: "you" | "any";
      /** With `player`: players alone, no permanent — "whenever you become
       * the target of a spell" (Dormant Gomazoa, Amulet of Safekeeping). */
      readonly playerOnly?: true;
      /** Only an *ability* targeting it, not a spell — "becomes the target of
       * an ability you control" (Loki, God of Mischief). `"activated"` is
       * only an activated ability, never a triggered one: "become the target
       * of an activated ability" (Professor Hojo). */
      readonly abilityOnly?: true | "activated";
    }
  | {
      /**
       * A **batched** attack trigger: "whenever one or more Dragons you
       * control attack" (The Ur-Dragon). Fires **once** per declaration
       * however many creatures matched, and supplies that count as the
       * trigger value, so "draw that many cards" is
       * `{ amount: { triggerValue: true } }`.
       *
       * Distinct from `attacks`, which fires once *per attacker* — the two
       * are not interchangeable and a card written with the wrong one either
       * over-triggers or loses its count. Hooks the `attackers-declared`
       * event, which is emitted once with the whole list, rather than the
       * per-attacker `attacker-declared`.
       *
       * The batched shape is a family, not a one-off: 28 of the 484
       * unimplemented top-500 commanders have a "whenever one or more …"
       * clause, across attacking, entering, being milled, dealing combat
       * damage and leaving a graveyard. This is the first of those event
       * types; the rest are the same idea against a different event.
       */
      readonly on: "attacks-batch";
      readonly who: TriggerWho;
      /** Narrow which attackers count toward the batch (Ur-Dragon: Dragons
       * you control). A declaration with no match doesn't fire at all. */
      readonly filter?: CardFilter;
    }
  | {
      /**
       * A creature was declared as an attacker (rule 508.3a) — once per
       * attacker. The attacker is the trigger object ("it gets +X/+X") and
       * the player it attacks, or the controller of the planeswalker it
       * attacks, is the `"trigger-player"` ("defending player", "that
       * opponent"). Triggers see the whole declaration: every attacker is
       * attacking before the first of these fires (rule 508.3 — triggers on
       * attackers being declared trigger once they all have been). A
       * creature put onto the battlefield attacking was never declared and
       * doesn't fire it.
       */
      readonly on: "attacks";
      readonly who: TriggerWho;
      /** Narrow which attacker counts (Utvara Hellkite / Atarka, World
       * Render: "a Dragon you control"). needed-cards P11. */
      readonly filter?: CardFilter;
      /** "Whenever **another** Cat you control attacks" (Arahbo, Roar of the
       * World) — this permanent attacking doesn't count. */
      readonly otherOnly?: boolean;
      /**
       * Only when the attack is aimed at *this* permanent's controller or a
       * planeswalker they control — Isperia, Supreme Judge's "Whenever a
       * creature attacks you or a planeswalker you control". Not a battle
       * they protect, though that makes them the defending player (rule
       * 508.5): that's `youDefend`. With `defender: "player"`, "attacks
       * **you**" alone (MacCready, Lamplight Mayor).
       */
      readonly attackingYou?: boolean;
      /**
       * Only when this permanent's controller is the attack's defending
       * player — Kazuul, Tyrant of the Cliffs' "if you're the defending
       * player": attacked themselves, or a planeswalker they control, or a
       * battle they protect (rule 508.5).
       *
       * This also covers "a creature an opponent controls", the other half of
       * that card's wording: nobody can attack themselves, so an attacker
       * pointed at you is necessarily an opponent's.
       */
      readonly youDefend?: boolean;
      /**
       * What it must be attacking: `"player"` is "attacks **a player**" /
       * "attacks **an opponent**" (Kaalia of the Vast) — a creature attacking
       * a planeswalker is attacking that planeswalker, not its controller
       * (rule 508.3a), so that doesn't fire it; `"planeswalker"` is the
       * reverse; `"battle"` is "attacks **a battle**" (War-Trained Slasher,
       * Thrashing Frontliner).
       */
      readonly defender?: "player" | "planeswalker" | "battle";
      /**
       * Which player it must be attacking, relative to this permanent —
       * Curse of Predation's "whenever a creature attacks **enchanted
       * player**" is `"attached"`. Never a creature attacking that player's
       * planeswalker (rule 508.3a).
       */
      readonly attackedPlayer?: TriggerWho;
      /**
       * Which player it must be attacking, or whose planeswalker: Gahiji,
       * Honored One's "attacks one of your opponents **or a planeswalker an
       * opponent controls**" is `"opponent"`. Never a battle.
       */
      readonly attackedPlayerOrPlaneswalker?: TriggerWho;
      /** "Whenever equipped creature attacks **the monarch**" (The Spear of
       * Bashenga): the player who is the monarch as it's declared, never a
       * planeswalker of theirs (rule 508.3a). */
      readonly attackedMonarch?: true;
      /**
       * "…, **if no other creatures are attacking that player**" — an
       * intervening-if (rule 603.4) over the declaration: no other creature
       * is attacking the player or planeswalker this one attacks. Checked
       * again as the ability resolves, so a creature put onto the
       * battlefield attacking that player in the meantime stops it.
       */
      readonly aloneAgainstDefender?: boolean;
      /** How the attacked player's life total ranks — dethrone's "attacks
       * the player with the most life or tied for most life". See
       * {@link DefenderLife}. */
      readonly defenderLife?: DefenderLife;
      /** Training (rule 702.149a — the `training()` helper): "whenever this
       * creature **and at least one other creature with power greater than
       * this creature's power** attack" — another attacker of the
       * declaration has greater power as it triggers. */
      readonly withGreaterPower?: true;
    }
  | {
      /**
       * "Whenever this creature trains" (rule 702.149c): a resolving
       * training ability put one or more +1/+1 counters on it — the
       * `add-counter` with `training: true` that `training()` writes. Savior
       * of Ollenbock.
       */
      readonly on: "trains";
      readonly who: TriggerWho;
    }
  | {
      /**
       * "Whenever this creature evolves" (rule 702.100b): a resolving evolve
       * ability put one or more +1/+1 counters on it — the `add-counter`
       * with `evolve: true` that `evolve()` writes. Once per evolve ability
       * that puts any, however many a replacement makes of its one (Watchful
       * Radstag's ruling); none put (the creature gone, or counters that
       * can't be put on it), no trigger. Watchful Radstag.
       */
      readonly on: "evolves";
      readonly who: TriggerWho;
    }
  | {
      /**
       * "Whenever day becomes night or night becomes day" (rule 731.1a): the
       * game lost one designation and gained the other. The first "it
       * becomes day" (from neither) isn't one. `becomes` narrows it to one
       * direction ("whenever night becomes day"). Sourceless of any player:
       * it fires for every permanent with it, whoever's turn it is.
       */
      readonly on: "day-night-changes";
      readonly becomes?: "day" | "night";
    }
  | {
      /**
       * "When this creature exploits a creature" (rule 702.110b): its
       * exploit ability's controller sacrificed a creature as that ability
       * resolved (the `sacrifice` with `exploit: true` that `exploit()`
       * writes). `who` names the creature that exploited — `"self"`, or
       * `"you-control"` for Skull Skaab's "whenever a creature you control
       * exploits a nontoken creature" — and `filter` the creature exploited,
       * as it last existed. A creature that exploits itself still triggers
       * its own (it's the sacrifice's subject, rule 603.10a).
       */
      readonly on: "exploits";
      readonly who: TriggerWho;
      readonly filter?: CardFilter;
    }
  | {
      /**
       * "Whenever a player attacks one of your opponents" (Breena, the
       * Demagogue); "whenever an opponent attacks you". Fires **once per
       * player attacked** — a declaration with creatures attacking two of
       * your opponents triggers it twice, and one with ten creatures attacking
       * one of them once — off `player-attacked`. A creature attacking a
       * planeswalker attacks that planeswalker, not its controller (rule
       * 508.3a), so it counts for nobody here.
       *
       * `who` is the attacking player and `defender` the attacked one, each
       * relative to this permanent's controller (`"you"`, `"opponent"`,
       * `"any"`). The attacked player is the `"trigger-player"` ("that
       * opponent"); the attacking player is the active player, which is the
       * `"active-player"` scope ("that attacking player draws a card").
       * `{ triggerValue: true }` is how many creatures attack that player.
       */
      readonly on: "attacks-player";
      readonly who: TriggerWho;
      readonly defender: TriggerWho;
      /** "… attack you **and aren't blocked**" (Coveted Jewel): once per
       * player attacked, as blockers are declared, off
       * `player-attacked-unblocked`, however many of them are unblocked and
       * whatever became of the others. `{ triggerValue: true }` and "those
       * creatures" are the unblocked ones. */
      readonly unblocked?: true;
      /** "… attack one of your opponents **or a planeswalker they
       * control**" (Frontier Warmonger): still once per player, the
       * creatures attacking their planeswalkers counted with those
       * attacking them (and "those creatures" both). Not with `unblocked`. */
      readonly orTheirPlaneswalkers?: true;
      /** Narrow which attackers count: "whenever one or more Merfolk you
       * control attack a player" (Attuma, Atlantean Warlord), still once per
       * player attacked by at least one of them, and `{ triggerValue: true }`
       * counts only them. */
      readonly filter?: CardFilter;
      /** At least this many of them attack that player: Landroval, Horizon
       * Witness's "whenever **two or more** creatures you control attack a
       * player". Each player attacked is judged alone, so two creatures split
       * across two players don't fire it. */
      readonly atLeast?: number;
      /** How the attacked player's life total ranks — Breena's "if that
       * opponent has more life than another of your opponents". See
       * {@link DefenderLife}. */
      readonly defenderLife?: DefenderLife;
      /** The attacked player has the initiative as the attack is declared
       * (rule 726) — Loot Dispute's "whenever you attack the player who has
       * the initiative". Not asked again on resolution. */
      readonly defenderHasInitiative?: boolean;
    }
  | {
      /** Exalted (rule 702.111a — needed-cards P15): a creature you control
       * attacked alone this combat — exactly one attacker was declared.
       * `who: "you-control"` = the lone attacker is yours. The attacker isn't
       * a target; an effect reads it via `ResolutionContext.triggerObject`
       * (a `modify-pt` with `target: "trigger-object"`). The defending
       * player — the one it attacks, or the controller of the planeswalker
       * it attacks (rule 506.2) — is `"trigger-player"`: Strategic
       * Intervention's "tap up to one target creature defending player
       * controls" (`whose: "trigger-player"`). `filter` narrows the lone
       * attacker, checked as it triggers: "whenever a Samurai or Warrior you
       * control attacks alone" (Neon Dynasty's Samurai) is `who: "you-control"`
       * with `{ subtypes: ["Samurai", "Warrior"] }`. */
      readonly on: "attacks-alone";
      readonly who: TriggerWho;
      readonly filter?: CardFilter;
      /** `"player"`: "attacks **a player** alone" (Yuriko, Blade of the
       * Mighty): a lone attack on a planeswalker or a battle doesn't fire it
       * (rule 508.3a). */
      readonly defender?: "player";
    }
  | {
      /** A player sacrificed a permanent (Korvold, Mayhem Devil — rule 701.21).
       * `who` is relative to the sacrificing player: `"you"` = this permanent's
       * controller sacrificed one, `"any"` = anyone did. needed-cards P6.
       * `filter` narrows it ("whenever you sacrifice a **nontoken**
       * permanent", "…a Food"), matched against the permanent as it last
       * existed on the battlefield; `otherOnly` is "another". The sacrificed
       * permanent is the trigger object ("its power", "that creature").
       * `selfOnly` is "when you sacrifice **this** permanent" (the Theros
       * Ordeals): it fires however its own source was sacrificed, looking
       * back in time to it (rule 603.10a). */
      readonly on: "sacrifice";
      readonly who: TriggerWho;
      readonly filter?: CardFilter;
      readonly otherOnly?: boolean;
      readonly selfOnly?: boolean;
      /** "Whenever you sacrifice **one or more** Foods" (Camellia, the
       * Seedmiser — rule 603.2c): once per simultaneous event, however many
       * of its sacrifices match. Its trigger object is the first; don't read
       * it. */
      readonly batched?: boolean;
    }
  | {
      /** A permanent was destroyed (rule 701.8): by an effect that says
       * "destroy", or by the state-based actions for lethal damage and
       * deathtouch damage (701.8b, 704.5g-h) — not a sacrifice, 0 toughness,
       * the legend rule or any other way into a graveyard, and not a destroy
       * that regeneration or indestructible stopped. Wherever it went: a
       * destroyed commander moved to the command zone was still destroyed.
       * `who` is the destroyed permanent's controller as it left
       * (`"you-control"`, `"opponent"`, `"any"`, `"self"`); `filter` is
       * matched against it as it last existed on the battlefield, and it is
       * the trigger object. A leaves-the-battlefield ability, so it looks
       * back in time (603.10a): its source destroyed alongside sees the
       * others. Jaws, Relentless Predator's "whenever a noncreature artifact
       * is sacrificed or destroyed" is this beside a `sacrifice` trigger. */
      readonly on: "destroyed";
      readonly who: TriggerWho;
      readonly filter?: CardFilter;
      readonly otherOnly?: boolean;
      /** "Whenever **a spell or ability an opponent controls destroys** …"
       * (Karmic Justice): only an effect's destruction (never the damage
       * checks', 704.5g-h), by a spell or ability an opponent of this
       * ability's controller controls. "That opponent" is then
       * `"trigger-player"`. */
      readonly byOpponent?: true;
    }
  | {
      /** A permanent turned over to its other face (rule 712.10 — ROADMAP
       * Phase 10b). `who: "self"` = this permanent transformed; `"you-control"`
       * = one you control did. `intoFront` narrows to a transform *into* the
       * front (`true`) or back (`false`) face. */
      readonly on: "transforms";
      readonly who: TriggerWho;
      readonly intoFront?: boolean;
      readonly filter?: CardFilter;
    }
  | {
      /** A mutating creature spell merged with a permanent (rule 702.140d).
       * `who: "self"` is "whenever this creature mutates" — every
       * component's such ability fires, the merged permanent having them all
       * (702.140e); `"you-control"` is "whenever a creature you control
       * mutates" (Essence Symbiote), the mutated permanent the trigger
       * object. */
      readonly on: "mutates";
      readonly who: TriggerWho;
      readonly filter?: CardFilter;
    }
  | {
      /** A permanent became saddled (rule 702.171b — the `become-saddled`
       * effect, a saddle ability's or another's: "whenever this creature
       * becomes saddled" is `who: "self"`). Fires again for one already
       * saddled that becomes saddled again (a second saddle activation — the
       * rulings let it). Stubborn Burrowfiend's "for the first time each
       * turn" is the wrapper's `firstTimeEachTurn`, counted per object. The
       * permanent is the trigger object. */
      readonly on: "becomes-saddled";
      readonly who: TriggerWho;
      readonly filter?: CardFilter;
    }
  | {
      /** A permanent was exerted (rule 701.43). `asItAttacks` is the "when
       * you do" linked to a creature's own "you may exert this creature as it
       * attacks" (rule 607.2h — Glorybringer, Combat Celebrant): only that
       * exert fires it, not one some other effect makes. The permanent is the
       * trigger object. */
      readonly on: "exerted";
      readonly who: TriggerWho;
      readonly asItAttacks?: boolean;
    }
  | {
      /** A creature crewed a Vehicle or saddled a Mount (rules 702.122b,
       * 702.171c): it was tapped to pay that permanent's crew or saddle
       * cost, as the cost was paid — whether or not the ability goes on to
       * resolve. `as` is which: Speedway Fanatic's "whenever this creature
       * crews a Vehicle" is `["crew"]`, Canyon Vaulter's "saddles a Mount
       * or crews a Vehicle" both. `who` is asked of the creature tapped;
       * the trigger object is the Vehicle or Mount ("that Vehicle"). "During
       * your main phase" is a `condition` (turn-structure and your-turn). */
      readonly on: "crews-or-saddles";
      readonly who: TriggerWho;
      readonly as: readonly ("crew" | "saddle")[];
    }
  | {
      /**
       * A permanent was tapped for mana — its mana ability with `{T}` in the
       * cost resolved (Roxanne, Starfall Savant's "whenever you tap an
       * artifact token for mana, add one mana of any type that artifact
       * token produced"; Crypt Ghast's "whenever you tap a Swamp for mana,
       * add an additional {B}"). A **triggered mana ability** (rule 605.1b):
       * it never uses the stack, but is applied at once, as the mana is
       * made — and the auto-payer counts it, so the extra mana pays too. Its
       * effect is an `add-mana`, whose `mana: "produced"` is "one mana of any
       * type that permanent produced". `who` is about the tapped permanent
       * (`"you-control"`: "whenever you tap …").
       *
       * All of the ability happens at once (rule 605.4a), so whatever else it
       * does is that `add-mana`'s `also`, with `"trigger-object"` the tapped
       * permanent and `"trigger-player"` the player who tapped it, and no
       * decision in it: "and this enchantment deals 1 damage to the player"
       * (Overabundance), "that land doesn't untap …" (Winter's Night). Its
       * `condition` is read as it's made: "while you're the monarch" (Regal
       * Behemoth), "if this creature is tapped" (Barbflare Gremlin).
       *
       * **Adding no mana, or a target, and it isn't a mana ability**: it
       * triggers as the mana ability resolves and produces mana (rule 106.12a)
       * and goes on the stack the next time a player would receive priority
       * (rule 603.3), above a spell the mana is paying for (Burning Earth's
       * "whenever a player taps a nonbasic land for mana, this enchantment
       * deals 1 damage to that player", Zhur-Taa Druid, Forbidden Orchard).
       * The tapped permanent is the trigger object, and the player who
       * activated its ability the `"trigger-player"`.
       */
      readonly on: "tapped-for-mana";
      readonly who: TriggerWho;
      readonly filter?: CardFilter;
      /** "Whenever you tap a land **for {C}**" (Ultima, Origin of
       * Oblivion): only when what it made includes colorless mana — once,
       * however much. `"chosen"` is "of the chosen color" (Gauntlet of Power,
       * `GameObject.chosenOnEnter`): with none chosen, it never triggers. */
      readonly producing?: "C" | "chosen";
      /** "Whenever a land's **ability causes you to add** one or more mana of
       * the chosen color" (Caged Sun): whichever ability of the permanent made
       * it — one with no {T} in its cost, or a trigger's on the stack
       * (Crumbling Vestige) — rather than its being tapped for mana. Only as
       * a triggered mana ability: `add-mana` and nothing else. */
      readonly anyAbility?: true;
    }
  | {
      /** A Saga's chapter ability resolved — `finalOnly` is "whenever the
       * **final chapter ability** of a Saga you control resolves" (Tom
       * Bombadil, Narci, Fable Singer). `who` is about the Saga (`"self"`: a
       * Saga's own). The Saga is the trigger object: "that Saga's mana value"
       * is a `{ manaValueOf: "trigger-object" }`, read as it last existed if
       * the final chapter has sacrificed it by then. */
      readonly on: "chapter-resolves";
      readonly who: TriggerWho;
      readonly finalOnly?: boolean;
      readonly filter?: CardFilter;
    }
  | {
      /** This creature dealt combat damage to a player — "that player" is
       * the `"trigger-player"` scope (Xyris, Captain N'ghathrod); a target
       * slot is always the controller's choice (Mindscour Dragon's "target
       * player mills four", Sword of Fire and Ice's "any target"). The
       * creature is the trigger object — "you gain life
       * equal to **that creature's** toughness" (Ikra Shidiqi), read as it
       * last existed on the battlefield if the same damage killed it — and
       * `{ triggerValue: true }` is how much it dealt. */
      readonly on: "deals-combat-damage-to-player";
      readonly who: TriggerWho;
      /** "…to a player **who doesn't have a contract counter**" (Miss
       * Highwater): asked of the player dealt the damage as `"that-player"`,
       * as it triggers. */
      readonly toPlayerIf?: StaticCondition;
      /** A filter on the creature that dealt the damage — Sharding Sphinx's
       * "whenever an **artifact** creature you control deals combat damage to
       * a player". */
      readonly filter?: CardFilter;
      /** "Whenever **another** creature you control deals combat damage to
       * a player". */
      readonly otherOnly?: boolean;
      /** "…to a player **who controls more lands than you**" (Cartographer's
       * Hawk): the player dealt damage controls more permanents matching
       * this than this permanent's controller does, counted as the damage is
       * dealt. Part of the trigger event, not an intervening-if (rule 603.4):
       * it isn't asked again as the ability resolves. */
      readonly toPlayerControlsMore?: CardFilter;
      /** "…deals combat damage to **one of your opponents**" (Gix, Yawgmoth
       * Praetor, with `who: "any"`): the player dealt damage is an opponent
       * of this permanent's controller, whoever's creature dealt it. */
      readonly toOpponent?: boolean;
      /** "Whenever a creature deals combat damage to **enchanted player**"
       * (Curse of Hospitality, Curse of Stalked Prey, with `who: "any"`): the
       * player dealt damage is the one this Curse enchants as the damage is
       * dealt — once for each creature that dealt it (the ruling). */
      readonly toEnchantedPlayer?: true;
      /** "…deals combat damage to a player **or battle**" (Furnace Reins,
       * Beamtown Beatstick): combat damage to a battle triggers it too. A
       * battle has no "that player" — use it only where the ability doesn't
       * name one. */
      readonly orBattle?: boolean;
    }
  | {
      /**
       * A **batched** damage trigger: "whenever one or more creatures you
       * control deal combat damage to a player" (Goro-Goro and Satoru,
       * Alela, Anowon, Professional Face-Breaker) — **once per player**
       * dealt damage by at least one matching source in one simultaneous
       * damage event (a combat damage step; first-strike and regular damage
       * are two, rule 510.4), however many sources dealt it. It is settled
       * as that event's damage is, like enrage.
       *
       * `who` / `filter` are about the sources ("one or more **Pirates** you
       * control"); `to: "opponent"` narrows the players; `combat` is `true`
       * for combat damage only ("deal combat damage") or `false` for
       * noncombat, and left off for any. The player is the
       * `"trigger-player"` ("that player"), and `{ triggerValue: true }` is
       * the total those sources dealt them ("mills a card for each 1 damage
       * dealt to them"). `once: "per-event"` fires once for the whole event
       * instead, with `{ triggerValue: true }` the number of players dealt
       * damage and no trigger player — Malcolm, Keen-Eyed Navigator's "you
       * create a Treasure token for each opponent dealt damage".
       */
      readonly on: "deals-damage-batch";
      readonly who: TriggerWho;
      readonly filter?: CardFilter;
      /** `"you"`: only damage to the ability's controller — the initiative's
       * "whenever one or more creatures a player controls deal combat damage
       * to you" (rule 726.2, `cards/initiative.ts`). `"enchanted-player"`: to
       * the player this Aura is attached to (Grievous Wound). */
      readonly to?: "player" | "opponent" | "you" | "enchanted-player";
      readonly combat?: boolean;
      readonly once?: "per-player" | "per-event";
    }
  | {
      /** This creature was declared as a blocker — the mirror of `attacks`
       * (Kangee, Sky Warden's second half). Once per blocker, which is the
       * trigger object ("whenever a creature you control attacks or blocks,
       * **it** gets +X/+X" — Doran, Besieged by Time). */
      readonly on: "blocks";
      readonly who: TriggerWho;
      readonly filter?: CardFilter;
      readonly otherOnly?: boolean;
      /** `"blocked"`: "whenever this creature blocks **a creature**, … **that
       * creature**" (Wall of Frost, Wall of Tears) — the trigger object is
       * the creature it blocks, not the blocker. */
      readonly object?: "blocked";
      /** "Whenever this creature blocks **one or more black creatures**"
       * (Serra Inquisitors): once however many it blocks (rule 509.3a), if at
       * least one of them matches. */
      readonly blocking?: CardFilter;
    }
  | {
      /**
       * "Whenever one or more creatures you control **become blocked**"
       * (Hezrou): once per combat as the last defending player's declaration
       * completes, if any creature matching `who` and `filter` became blocked,
       * off `attackers-blocked` — never once for each (rule 603.2c).
       */
      readonly on: "become-blocked-batch";
      readonly who: TriggerWho;
      readonly filter?: CardFilter;
    }
  | {
      /**
       * An attacking creature **became blocked** (rules 509.1h, 509.3c) —
       * "whenever Anzrag becomes blocked". Once per attacker, however many
       * creatures block it, as its defending player's declaration completes,
       * off `attacker-blocked`. The attacker is the trigger object, and its
       * defending player (the one who blocked) the `"trigger-player"`. A
       * creature nobody blocks doesn't fire it, and one whose blockers are
       * all removed from combat afterward is still blocked (rule 509.1h)
       * without firing again.
       */
      readonly on: "becomes-blocked";
      readonly who: TriggerWho;
      readonly filter?: CardFilter;
      readonly otherOnly?: boolean;
      /** Becomes blocked **by** so many creatures, or by at least one matching
       * `filter`: Seifer, Balamb Rival's "by two or more creatures" (`atLeast:
       * 2`), Serra Inquisitors' "by one or more black creatures" (`filter`).
       * Read as the declaration completes, every blocker in. */
      readonly blockers?: { readonly atLeast?: number; readonly filter?: CardFilter };
      /** The player the attacker must be attacking, relative to this permanent
       * — Seifer's "a creature attacking **one of your opponents**". Never a
       * creature attacking that player's planeswalker (rule 508.3a). */
      readonly attackedPlayer?: TriggerWho;
    }
  | {
      /**
       * "Whenever ~ attacks and isn't blocked" (rule 509.3g; Farrel's
       * Zealot, Ophidian): an attacking creature with no creatures declared
       * as blockers for it, once per attacker as blockers are declared, off
       * `attacker-unblocked` — even one that entered the battlefield
       * attacking before then, never one blocked and then left with no
       * blockers. The attacker is the trigger object, and the player it
       * attacks (or who protects what it attacks) the `"trigger-player"` —
       * the defending player. With nothing able to block, no player declares,
       * and it still triggers.
       */
      readonly on: "attacks-unblocked";
      readonly who: TriggerWho;
      readonly filter?: CardFilter;
    }
  | {
      /**
       * A **state trigger** (rule 603.8): "When you control no Islands,
       * sacrifice ~" (Seasinger), "Whenever there are four or more tide
       * counters on ~, remove all tide counters from it" (Homarid). It
       * triggers as soon as `state` is true of the permanent — no event —
       * and doesn't trigger again until that instance has resolved, been
       * countered or otherwise left the stack; then, if `state` is still
       * true, it triggers again. Looked for whenever state-based actions are
       * (and as zones, counters and control change), from the battlefield.
       */
      readonly on: "state";
      readonly state: StaticCondition;
    }
  | {
      /**
       * An attacking creature became blocked **by a creature** — once per
       * blocker, as the declaration completes, off `blocker-declared`
       * (flanking, rule 702.25a: "whenever this creature becomes blocked by a
       * creature without flanking, the blocking creature gets -1/-1 until end
       * of turn" — the `flanking()` helper). `who` / `filter` are about the
       * attacker, `blocker` about the blocking creature, asked as the block
       * is declared; the blocker is the trigger object.
       */
      readonly on: "blocked-by";
      readonly who: TriggerWho;
      readonly filter?: CardFilter;
      readonly blocker?: CardFilter;
    }
  | {
      /**
       * A **batched** graveyard trigger: "whenever one or more cards leave
       * your graveyard" (Teval, the Balanced Scale; Tormod, the Desecrator),
       * narrowed by `filter` for "one or more **artifact** cards" (Imotekh
       * the Stormlord). Fires **once per simultaneous move**, however many
       * cards it took — exiling a whole graveyard, returning several cards
       * at once, an escape cost's exile — off the `cards-left-graveyard`
       * event. Separate moves are separate triggers, including the two halves
       * of an escape cast: the card moving to the stack (rule 601.2a) and the
       * cards exiled to pay for it (601.2h).
       *
       * `who` is whose graveyard: `"you"` (this permanent's controller's),
       * `"opponent"`, `"any"`. `filter` is matched against each card as it
       * was in the graveyard (rule 603.10a — these abilities look back in
       * time), so a card that became an artifact on its way to the
       * battlefield doesn't count, and a multi-face card is its front face
       * (rule 712.8a — a creature // land played as its land left as a
       * creature card); a move with nothing matching doesn't fire. A
       * commander returned to hand leaves with the rest of its move whether
       * its owner sends it to the command zone instead or not (rule 903.9b).
       * `{ triggerValue: true }` is how many cards counted. A permanent that
       * was itself one of the cards (a reanimated Teval) wasn't on the
       * battlefield to see them leave, and doesn't trigger.
       *
       * `perCard` is the per-card form — "whenever a creature card leaves
       * your graveyard" (Syr Konrad, the Grim): once per matching card,
       * however many left together, each card the trigger object.
       */
      readonly on: "leaves-graveyard";
      readonly who: TriggerWho;
      readonly filter?: CardFilter;
      readonly perCard?: boolean;
      /** The batched form's `{ triggerValue: true }`, in place of how many:
       * `"greatest-mana-value"` is the greatest mana value among the cards
       * that counted, each as it was in the graveyard (rule 603.10a; Amzu,
       * Swarm's Hunger's "the greatest mana value among those cards"), 0 if
       * none has one. Fixed as it triggers, so it reads a card that's since
       * gone to a hand or a library. */
      readonly batchValue?: "greatest-mana-value";
    }
  | {
      /**
       * Cards were put into a graveyard — "whenever one or more land cards
       * are put into your graveyard from anywhere" (The Gitrog Monster:
       * `batched`), "…creature cards … from your library" (Sidisi, Brood
       * Tyrant: `from: "library"`), "whenever a creature card is put into a
       * graveyard from anywhere other than the battlefield" (Syr Konrad, the
       * Grim: `notFrom: "battlefield"`), "whenever a Lhurgoyf permanent card
       * is put into your graveyard from anywhere other than the battlefield,
       * put it onto the battlefield" (Disa the Restless). Off
       * `cards-put-into-graveyard`, which groups what one simultaneous move
       * put there: a wrath or a state-based sweep, one mill, discard or
       * surveil. Tokens aren't cards and never count.
       *
       * `who` is whose graveyard (the card's owner); `filter` is matched
       * against each card as it is there; `from` / `notFrom` are the zone it
       * came from. `batched` ("one or more") fires once per move, with
       * `{ triggerValue: true }` how many counted; otherwise once per card,
       * that card the trigger object — "put **it** onto the battlefield",
       * which finds it in that graveyard and nowhere else (rule 400.7). This
       * permanent dying along with them doesn't see them (it's in the
       * graveyard too by then).
       */
      readonly on: "put-into-graveyard";
      readonly who: TriggerWho;
      readonly filter?: CardFilter;
      readonly from?: ZoneType;
      readonly notFrom?: ZoneType;
      readonly batched?: boolean;
    }
  | {
      /** Cards were milled (rule 701.17) — "whenever one or more nonland
       * cards are milled" (Mirelurk Queen, The Wise Mothman: `who: "any"`,
       * `filter: { notTypes: ["land"] }`). Off `cards-milled`: once per mill,
       * however many cards, when at least one matches; `{ triggerValue: true
       * }` is how many matched ("where X is the number of nonland cards
       * milled this way"). `who` is the player who milled; `who: "any"` fires
       * once for a mill several players do at once, for the total (rule
       * 603.2c, `withMillBatch`). A milled card a
       * replacement sent elsewhere (Rest in Peace) was still milled and is
       * read where it went (701.17c). A surveil or a discard isn't a mill.
       *
       * `perCard` is "whenever a player mills **a** nonland card" (Glowing
       * One): once per matching card milled, each its own trigger object
       * (rule 603.2c — the card's ruling: four nonland cards milled at once
       * trigger it four times), whoever milled with `who: "any"`. */
      readonly on: "mills";
      readonly who: TriggerWho;
      readonly filter?: CardFilter;
      readonly perCard?: true;
    }
  | {
      /** A player faced a dilemma — Elim Garak, Simple Tailor's "whenever
       * you face a dilemma" (Star Trek: "you face a dilemma as you choose
       * one or more modes for a spell or ability"). Once per choice of a
       * modal spell's or ability's modes (rule 700.2) by that player — as
       * it's cast (601.2b), activated (602.2b) or put on the stack as a
       * trigger (603.3c), whoever's it is (an opponent choosing your spell's
       * modes faces it, 700.2e) — however many modes. Not modes chosen at
       * random (nobody chose), a copy's (copied, not chosen — 707.10), or a
       * choice made as an effect resolves ("create a Food or a Treasure"). */
      readonly on: "faces-dilemma";
      readonly who: TriggerWho;
    }
  | {
      /** A player scried (rule 701.22) — "whenever you scry"; with
       * `orSurveil`, "whenever you scry or surveil" (Denzilore Fatehold).
       * Once per scry, however many cards, and after it's done (701.22d) —
       * a scry of one or more into an empty library still counts, a scry 0
       * doesn't (701.22b). `{ triggerValue: true }` is the number of cards
       * looked at ("where X is the number of cards looked at while scrying
       * this way"). */
      readonly on: "scries";
      readonly who: TriggerWho;
      readonly orSurveil?: true;
    }
  | {
      /** A spell was countered (rule 701.6a), not an ability, and not a spell
       * that merely failed to resolve: "whenever a spell or ability you control
       * counters a spell" (Baral, Chief of Compliance; Lullmage Mentor) is
       * `who: "you"`, `who` being who controls what countered it. Once per spell
       * countered; ward's counter is an ability like any other. */
      readonly on: "counters-spell";
      readonly who: TriggerWho;
    }
  | {
      /** A spell the player cast was countered (rule 701.6a), a copy not
       * being cast (rule 707.10): "whenever a spell you've cast is countered"
       * (Multani's Presence) is `who: "you"`. */
      readonly on: "spell-countered";
      readonly who: TriggerWho;
    }
  | {
      /** A player clashed (rule 701.30) — "whenever you clash" (Rebellion
       * of the Flamekin, Entangling Trap), "whenever you clash and win"
       * (Sylvan Echoes: `won: true`). Either clashing player clashes,
       * whoever's spell or ability started it. The trigger's value is 1 if
       * that player won, else 0 — "if you won" is a `trigger-value`
       * condition `{ op: "gte", n: 1 }`. */
      readonly on: "clashes";
      readonly who: TriggerWho;
      readonly won?: true;
    }
  | {
      /**
       * One or more cards were put into exile at once — Ketramose, the New
       * Dawn's "whenever one or more cards are put into exile from
       * graveyards and/or the battlefield during your turn" (`from:
       * ["graveyard", "battlefield"]`, with a `your-turn` condition). Once
       * per simultaneous move (`cards-put-into-exile`), `who` being whose
       * cards they are and `filter` asked of them in exile. Tokens aren't
       * cards. `{ triggerValue: true }` is how many.
       */
      readonly on: "put-into-exile";
      readonly who: TriggerWho;
      readonly filter?: CardFilter;
      readonly from?: readonly ZoneType[];
      /** "Whenever a spell or ability **you control** causes one or more
       * cards to be exiled from an opponent's library" (The Madcap Jester):
       * only an exile a resolving spell or ability of this permanent's
       * controller did (`cards-put-into-exile`'s `byEffectOf`). The cards
       * are the trigger's batch (`"trigger-batch"`, "those cards"). */
      readonly byEffectOf?: "you";
    }
  | {
      /**
       * A player discarded one or more cards — "whenever you discard one or
       * more cards" (Captain Howler, Sea Scourge), once per discard event,
       * with `{ triggerValue: true }` how many matched. `filter` narrows the
       * cards, as they are in the graveyard. `perCard` is "whenever an
       * opponent discards a card" — once per card, each its trigger object,
       * followed to the graveyard and no further (Tergrid, God of Fright's
       * "you may put that card onto the battlefield under your control" is
       * `filter: { typesAnyOf: [<the permanent types>] }` and a
       * `put-onto-battlefield` of `"trigger-object"`).
       */
      readonly on: "discards";
      readonly who: TriggerWho;
      readonly filter?: CardFilter;
      readonly perCard?: boolean;
      /** "Whenever a spell or ability an opponent controls causes you to
       * discard a card" (Spiritual Focus): the discard's `cause` was an
       * opponent of the discarding player, as `this-discarded`'s is. */
      readonly byOpponent?: true;
    }
  | {
      /**
       * A player declared an attack with at least `atLeast` creatures matching
       * `filter` — Overwhelming Instinct's "whenever you attack with three or
       * more creatures", Tide Skimmer's "two or more creatures with flying".
       *
       * Fires once per declaration, off the whole attacker list, which is why
       * it can't be spelled as an `attacks` trigger: that one fires per
       * attacker and can't see how many there are in total.
       */
      readonly on: "attack-with";
      readonly who: TriggerWho;
      /** How many must count; 1 when absent ("whenever you attack with
       * creatures with total power 12 or greater"). */
      readonly atLeast?: number;
      /** Exactly this many, in place of `atLeast`: Alluring Suitor's "when you
       * attack with **exactly two** creatures". */
      readonly exactly?: number;
      /** "Creatures with total power 12 or greater" (Desert Were-Worm): the
       * whole declaration's total power as it was declared (rule 508.1k —
       * the journal's `attacked` entries), `filter` or none. "… for the first
       * time each turn" is the wrapper's `firstTimeEachTurn`: no earlier
       * declaration of theirs this turn reached it. */
      readonly totalPower?: { readonly atLeast: number };
      /** This permanent is one of those counted: Creepy Puppeteer's "whenever
       * **this creature** attacks, if you attacked with exactly one other
       * creature this combat" is `exactly: 2` with this. */
      readonly includingThis?: true;
      readonly filter?: CardFilter;
      /** Count only this permanent and your commanders — "whenever you
       * attack with this creature **and/or your commander**" (Ainok Strike
       * Leader). Your commander is one you own (rule 903.3), whoever's
       * creature it was before. */
      readonly thisOrYourCommander?: boolean;
      /** Only count attackers aimed at *this* permanent's controller or a
       * planeswalker they control — Ever-Watching Threshold's "whenever an
       * opponent attacks, **if they attacked you and/or a planeswalker you
       * control**". Not a battle, whether they control it or protect it. */
      readonly attackingYou?: boolean;
      /** Only count attackers aimed at *this* permanent's controller, the
       * player: Everett K. Ross's "whenever an opponent attacks **you** with
       * two or more creatures" — one attacking your planeswalker attacks that
       * planeswalker (rule 508.3a). */
      readonly attackingYouDirectly?: true;
      /** Only count attackers aimed at a planeswalker *this* permanent's
       * controller controls as they're declared (rule 508.1b) — Mila, Crafty
       * Companion's "whenever an opponent attacks **one or more planeswalkers
       * you control**", once per declaration however many are attacked (the
       * ruling); one attacking you, the player, doesn't count. */
      readonly attackingYourPlaneswalkers?: true;
      /** The declaration holds at least one attacker matching each of these,
       * the same creature allowed: Fearless Swashbuckler's "if a Pirate **and**
       * a Vehicle attacked this combat". */
      readonly eachOf?: readonly CardFilter[];
      /**
       * "Whenever a player attacks, **if they aren't attacking you**"
       * (Mirkwood Trapper): no creature of the declaration attacks this
       * permanent's controller — the player; attacking a planeswalker they
       * control or a battle they protect still fires it (the ruling). An
       * intervening if (rule 603.4), so it's asked again as the ability
       * resolves: by then no creature the attacking player controls may be
       * attacking you, one put onto the battlefield attacking included.
       */
      readonly notAttackingYou?: true;
      /**
       * The count is an intervening if in the present tense — Mangara, the
       * Diplomat's "if two or more of those creatures **are** attacking you
       * and/or planeswalkers you control" — so it's asked again as the
       * ability resolves (rule 603.4): a creature removed from combat no
       * longer counts, one that has left the battlefield counts by what it
       * was attacking (the rulings).
       */
      readonly stillAttacking?: boolean;
    }
  | {
      /**
       * This permanent *was dealt* damage — the receiving end, as opposed to
       * `deals-combat-damage-to-player`'s dealing end (Brash Taunter, Hornet
       * Nest). Combat and non-combat damage alike, which is the whole point
       * of the cards that carry it.
       *
       * `{ triggerValue: true }` is how much was dealt ("it deals **that
       * much** damage", "create **that many** tokens").
       */
      readonly on: "dealt-damage";
      readonly who: TriggerWho;
      /** Narrow which permanent dealt damage counts — Sonic the Hedgehog's
       * "a creature you control **with flash or haste**". Read as the damage
       * is dealt, before state-based actions can have killed it. */
      readonly filter?: CardFilter;
      /** `true`: combat damage only; `false`: noncombat damage only. */
      readonly combat?: boolean;
      /** Only `N` or more dealt at once (Innocent Bystander's "is dealt 3 or
       * more damage"): everything this permanent is dealt in one simultaneous
       * damage event, whatever its sources, and never a total added up over
       * separate events (the ruling). */
      readonly atLeast?: number;
      /** Only excess damage (rule 120.4a), and "that much" is the excess, not
       * all that was dealt: "whenever a creature an opponent controls is dealt
       * excess noncombat damage, amass Orcs X, where X is that excess damage"
       * (Fall of Cair Andros). Sources hitting it at once share the event, so
       * it's what they dealt together past lethal damage. */
      readonly excess?: true;
      /** "Whenever **one or more** creatures … are dealt …" (Magmatic Galleon):
       * once for the simultaneous event, however many permanents matched,
       * with `{ triggerValue: true }` the total. Its trigger object is the
       * first of them to match; don't read it. */
      readonly batched?: true;
    }
  | {
      /**
       * A source *dealt* damage — the dealing end, for any recipient and any
       * kind of damage (rule 120.1). Ghyrson Starn's "whenever another source
       * you control deals exactly 1 damage to a permanent or player",
       * Niv-Mizzet, Visionary's "whenever a source you control deals
       * noncombat damage to an opponent", Kediss's "whenever a commander you
       * control deals combat damage to an opponent".
       *
       * With a recipient named (`to`, `toFilter`, `exactly`, `toItsTarget`)
       * it fires once per damage event per recipient: a source that deals
       * damage to three things at once (a `damage-all`, "each opponent", a
       * trampler and its blocker) triggers three times, each with the amount
       * *that* recipient was dealt. With none — "whenever this deals damage"
       * — it fires once per simultaneous damage event, for the total (rule
       * 603.2c, Armadillo Cloak's ruling). That amount is after prevention and doubling —
       * damage that was prevented was never dealt (rule 615.1), so it doesn't
       * trigger at all, and 2 damage prevented down to 1 is "exactly 1".
       *
       * `{ triggerValue: true }` is the amount dealt; the source is the
       * trigger object ("it deals that much damage"); the recipient is what
       * a `damage` effect's `toTriggerRecipient` hits, and a player
       * recipient (or a permanent recipient's controller) is the
       * `"trigger-player"` scope — "that player", "each **other** opponent".
       */
      readonly on: "deals-damage";
      /** Whose the *source* is, relative to this permanent: `"self"` (this
       * deals damage), `"you-control"` (a source you control — a spell, a
       * permanent, or the source of an ability), `"opponent"`, `"any"`. A
       * source that has left the battlefield is judged as it last existed
       * there. */
      readonly who: TriggerWho;
      /** A filter on the source ("a commander you control", "an instant or
       * sorcery spell you control"). */
      readonly filter?: CardFilter;
      /** "**another** source" — this permanent's own damage doesn't count. */
      readonly otherOnly?: boolean;
      /** What the damage was dealt to. Omitted: any permanent or player.
       * `"you"` is this permanent's controller — Mikaeus, the Unhallowed's
       * "whenever a Human deals damage to you". `"self"` is this permanent
       * itself — Vraska the Unseen's "whenever a creature deals combat damage
       * to Vraska". `"spell-caster"`, on an ability a spell grants, is the
       * player who cast that spell — Hellish Rebuke's "deals damage to the
       * player who cast Hellish Rebuke": the grant writes that player into
       * `spellCaster` as the spell resolves. `"chosen-players"` is either of
       * the two players chosen as this entered (`chosenPlayer`,
       * `otherChosenPlayer` — Sower of Discord's "damage is dealt to one of
       * the chosen players"). */
      readonly to?:
        | "player"
        | "opponent"
        | "you"
        | "permanent"
        | "creature"
        | "planeswalker"
        | "self"
        | "spell-caster"
        | "chosen-players";
      /** With `to: "spell-caster"`, who cast the granting spell. Written by
       * `grant-triggered` and `grant-triggered-all` as they resolve, never by
       * a card: the caster stays that player though another came to control
       * the spell (rule 112.2), and a copy that wasn't cast (rule 707.10)
       * has none, so its ability never triggers (the rulings). */
      readonly spellCaster?: PlayerId;
      /** A filter on a *permanent* recipient ("deals damage to a creature an
       * opponent controls"). Never matches a player. */
      readonly toFilter?: CardFilter;
      /** `true`: combat damage only; `false`: noncombat damage only. */
      readonly combat?: boolean;
      /** Only exactly this much damage to that recipient (Ghyrson Starn's
       * "exactly 1 damage"). */
      readonly exactly?: number;
      /** With no recipient named, once per damage event as ever, but only if
       * at least one permanent or player was dealt exactly this much of it —
       * Matoc, Lavamancer's "whenever a source you control deals damage, if at
       * least one permanent or player was dealt exactly 2 of that damage".
       * Unlike `exactly`, three recipients each dealt 2 trigger it once. */
      readonly anyRecipientExactly?: number;
      /** Only `N` or more dealt by one source at once, never a total added up
       * over separate events (the Deus of Calamity and Dragonborn Champion
       * rulings). With a recipient named, what that recipient was dealt: "deals
       * 6 or more damage to an opponent", once per opponent so dealt (Pain
       * Magnification's ruling). With none, the whole event's total ("whenever
       * Spinneret and Spiderling deals 4 or more damage"). */
      readonly atLeast?: number;
      /** Only damage a *spell* deals to one of its own targets — "an instant
       * or sorcery spell you control deals damage to a permanent or player it
       * targets". A source that isn't a spell on the stack never matches (an
       * ability's damage is dealt by its source permanent, which has no
       * targets of its own). */
      readonly toItsTarget?: boolean;
    }
  | {
      /** A permanent became tapped (rule 701.21a — City of Brass, Grand
       * Coliseum: "Whenever this land becomes tapped, it deals 1 damage to
       * you"). Fires for *any* tapping — paying a cost, a mana ability, or an
       * opponent's tap effect — which is why this can't be a `painToController`
       * mana ability instead: that only charges the mana-ability path. */
      readonly on: "becomes-tapped";
      readonly who: TriggerWho;
      readonly filter?: CardFilter;
      /** "Whenever **one or more** … become tapped" (Deeproot Pilgrimage, Rewrite
       * History): once per tapping at the same time, however many matched —
       * a whole attack declaration, a `tap-all`, one cost. Its trigger object
       * is the first of them to match; don't read it. */
      readonly batched?: true;
      /** Who tapped it, relative to this ability's controller: "whenever
       * **you** tap an untapped creature an opponent controls" (Hylda of the
       * Icy Crown) is `who: "opponent", by: "you"`. The tapper is the
       * controller of the spell or ability whose effect or cost tapped it,
       * the attacking player for an attack (508.1f), the payer for a cost
       * (`permanent-tapped`'s `by`). */
      readonly by?: TriggerWho;
      /** "… if it isn't being declared as an attacker" (Verity Circle): not the
       * tapping of an attack declaration (rule 508.1f). */
      readonly notAttacking?: true;
    }
  | { readonly on: "step-begins"; readonly step: Step; readonly who: TriggerWho }
  | {
      /** A spell was cast. `who` is relative to the caster: `"you"` = this
       * permanent's controller cast it, `"opponent"` = anyone else did
       * (Kaervek the Merciless). `noncreatureOnly` narrows to a noncreature
       * spell (prowess, rule 702.108). The wrapper's `firstTimeEachTurn` is
       * the caster's first spell of the turn — or, with a `filter`, their
       * first *matching* spell ("your first enchantment spell each turn"),
       * which needn't be the first spell they cast; `nthEachTurn: 2` their
       * second (Kraum, Ludevic's Opus). A copy is never counted. */
      readonly on: "cast-spell";
      readonly who: TriggerWho;
      /**
       * Also fire when the player **copies** a spell (rule 707.10 — a copy
       * isn't cast): Magecraft's "whenever you cast **or copy** an instant or
       * sorcery spell" (Archmage Emeritus). `who` is who controls the copy,
       * `filter` asks about the copy, and the copy is the trigger object. The
       * cast-only narrowings (`from`, `notFrom`, the timing wrapper) never
       * match a copy.
       */
      readonly orCopy?: boolean;
      /** Fire **only** when the player copies a spell — Kalamax, the
       * Stormsire's "whenever you copy an instant spell". As `orCopy`
       * otherwise. */
      readonly copyOnly?: boolean;
      /**
       * "…another Vampire spell" (Edgar Markov) — the source's own cast
       * doesn't count. Needed because the card on the stack is itself in the
       * trigger scan (that is how cascade and storm see their own cast), so
       * without this Edgar's Eminence fires as Edgar is cast.
       */
      readonly otherOnly?: boolean;
      /** Only a spell cast **from** this zone ("whenever you cast a spell
       * from exile") — the `from` recorded on the `spell-cast` event. */
      readonly from?: ZoneType;
      /** Only a spell cast from anywhere **but** this zone ("whenever you
       * cast a spell from anywhere other than your hand"). */
      readonly notFrom?: ZoneType;
      readonly noncreatureOnly?: boolean;
      /**
       * A filter on the *spell* (Guttersnipe, Thermo-Alchemist: "whenever you
       * cast an instant or sorcery spell"). The general form of
       * `noncreatureOnly`, which predates it and is kept for the cards that
       * already use it — prowess is printed as its own word, not as a filter.
       */
      readonly filter?: CardFilter;
      /** Only a **modal** spell — one whose modes were chosen as it was cast
       * (rule 700.2; a `castModal` card): Riku of Many Paths' "whenever you
       * cast a modal spell". `{ triggerValue: true }` is then the number of
       * times a mode was chosen for it. */
      readonly modal?: boolean;
      /** Only a spell with one or more targets — Voracious Bibliophile's
       * "whenever you cast a spell with one or more targets". `{ triggerValue:
       * true }` is then how many targets it has ("draw that many cards"). */
      readonly withTargets?: boolean;
      /** Only a spell with this "when you cast this spell" keyword ability as
       * it's cast, printed or granted — Aurora Phoenix's "whenever you cast a
       * spell **with cascade**" (rule 702.85a). Read off the abilities the
       * spell has on the stack, so "spells you cast have cascade" (Maelstrom
       * Nexus, The First Sliver, Yidris's grant) counts and a card that only
       * was cast *by* a cascade doesn't. */
      readonly spellHas?: "cascade";
      /**
       * Make `{ triggerValue: true }` the number of spells matching this
       * filter that the caster cast this turn **before** this one — read as
       * it triggers, so a spell cast in response doesn't change it, and each
       * earlier spell read as it was cast. Thousand-Year Storm's "copy it for
       * each other instant and sorcery spell you've cast before it this
       * turn" (countered spells were still cast — its ruling).
       */
      readonly countCastBefore?: CardFilter;
      /** Only a spell that shares no creature type with a creature its
       * caster controls or a creature card in their graveyard — Volo, Guide
       * to Monsters. A changeling on either side shares every type (rule
       * 702.73a); a spell with no creature type shares none. */
      readonly sharesNoCreatureType?: boolean;
      /** "…if it isn't that player's turn" (Vision, Synthezoid Avenger): only
       * a spell cast by someone other than the active player. An intervening
       * "if" (rule 603.4) that can't change before the ability resolves. */
      readonly offTurn?: boolean;
    }
  | {
      /**
       * An ability was activated — one that uses the stack, so never a mana
       * ability (rule 605.3b): "whenever an ability of **equipped creature**
       * is activated, if it isn't a mana ability" (Illusionist's Bracers,
       * `who: "attached"` — the ability's source is the host, still attached
       * once its costs are paid: a host sacrificed to pay them isn't). The
       * trigger object is the ability on the stack, which a `copy-ability`
       * of `"trigger-ability"` copies.
       *
       * `who: "you"` / `"opponent"` is an ability this permanent's controller
       * (or an opponent of theirs) activates, wherever its source is, and
       * `"trigger-player"` is that player. Narrowed by `ninjutsu` to a
       * ninjutsu ability (rule 702.49 — Satoru Umezawa's "whenever you
       * activate a ninjutsu ability", which resolves before the ninjutsu
       * does), by `loyalty` to a loyalty ability (rule 606 — Ajani
       * Unrelenting; Gideon the Oathless's "whenever an opponent activates a
       * loyalty ability"), and by `source` to an ability of a permanent on
       * the battlefield matching it as the ability is activated (Harsh
       * Mentor's "an ability of an artifact, creature, or land on the
       * battlefield"; a card's in a hand or graveyard never counts, nor a
       * Vehicle crewed by it, which isn't a creature yet — the Runic Armasaur
       * rulings). Unnarrowed it sees every ability that uses the stack, from
       * any zone — cycling's too (rule 702.29a), whose draw goes on the stack
       * sourced from the cycled card. A mana ability only with `orMana`.
       * `sacrificedToActivate`: "if one or more
       * permanents were sacrificed to activate it" (Ashnod the Uncaring): by
       * the ability's own cost, whenever in paying it they're chosen, and
       * never by a mana ability that helped pay it (the ruling).
       */
      readonly on: "activates-ability";
      readonly who: "attached" | "you" | "opponent";
      /** Mana abilities too (rule 605): every card that doesn't say "if it
       * isn't a mana ability" — Elrond, Moon-Reader's "whenever you activate
       * an ability of a creature", Avalanche of Sector 7's "an ability of an
       * artifact they control". One activated while paying a cost is
       * announced then (`Game.useManaSource`), so long as a printed trigger
       * on the battlefield asks (`Game.manaActivationWatched`). Its trigger
       * object is nothing: a mana ability is never on the stack (605.3b). */
      readonly orMana?: true;
      readonly ninjutsu?: true;
      readonly loyalty?: true;
      /** With `loyalty`: "if you removed two or more loyalty counters to
       * activate it" (Way of the Mind Sculptor) — its cost removed at least
       * this many (a [−X] one, the X chosen). The cost is paid and fixed as
       * it triggers, so asked once (rule 603.4 can't change the answer). */
      readonly removedAtLeast?: number;
      /** An exhaust ability (rule 702.177 — Rangers' Refueler, Adrenaline
       * Jockey), a granted one included. "Activate only once" alone isn't one
       * (`ActivatedAbility.onlyOnce`). */
      readonly exhaust?: true;
      /** A power-up ability (rule 702.193 — Marvel Boy, Noh-Varr). */
      readonly powerUp?: true;
      /** "If that ability's activation cost contains {X}" (Unbound
       * Flourishing): the mana symbol in its activation cost, not an X
       * elsewhere (the rulings). */
      readonly xInCost?: true;
      readonly source?: CardFilter;
      /** "An ability of **a card in your graveyard**" (Neerdiv, Devious
       * Diver): one activated from the graveyard (`ActivatedAbility.zone` —
       * an unearth, an embalm, a scavenge), the card owned by this
       * permanent's controller, read where it was as it was activated however
       * its cost moved it (the event's `fromZone`). */
      readonly sourceZone?: "graveyard";
      readonly sacrificedToActivate?: true;
      /** "An ability that **targets a creature or player**" (Ertha Jo,
       * Frontier Mentor): what the ability on the stack targets, as its
       * targets were chosen (rule 602.2b) — the same clause a spell's
       * `CardFilter.targets` takes, so one such target is enough. Never a
       * mana ability (it has no targets on the stack). */
      readonly targets?: SpellTargetsFilter;
    }
  | {
      /** *This* spell (the one carrying the ability) was cast — a triggered
       * ability that lives on the card on the stack, not a permanent (cascade,
       * storm — rules 702.85 / 702.40). ROADMAP Phase 8. */
      readonly on: "this-cast";
      /** Not when it was cast from this zone — Rory Williams' "when you cast
       * this spell from anywhere other than exile". */
      readonly notFrom?: ZoneType;
    }
  | {
      /** "When you cycle this card" (rule 702.29c: "when you discard this
       * card to pay an activation cost of a cycling ability") — Dismantling
       * Wave. It triggers from whatever
       * zone the card ends up in, usually the graveyard, and only for this
       * card, and goes on the stack above the cycling ability — so it
       * resolves before the draw (the rulings). */
      readonly on: "this-cycled";
    }
  | {
      /** "When you discard this card" (Bartered Cow, Titanbones) — like
       * cycling's, it can't trigger from the battlefield, so it triggers
       * from whatever zone the discard put the card in (rule 113.6k): the
       * graveyard, or exile for a madness card (702.35a). Only this card's,
       * once per discard. `byOpponent` is "when a spell or ability an
       * opponent controls causes you to discard this card" (Psychic Purge,
       * Metrognome): the discard's `cause` was an opponent — an effect's, or
       * a cost's — never the cleanup step's (rule 514.1) nor your own. The
       * ability's "that player" (`"trigger-player"`) is the player whose
       * spell or ability caused the discard. */
      readonly on: "this-discarded";
      readonly byOpponent?: true;
    }
  | {
      /** "Whenever you cycle a card" (rule 702.29 — Snare Tactician): a
       * player cycled a card, `who` relative to this permanent's controller
       * (`"you"`, `"opponent"`, `"any"`); `otherOnly` is "another card"
       * (Drannith Healer). The cycled card is the trigger object. The
       * trigger goes on the stack above the cycling ability, so it resolves
       * before the draw. */
      readonly on: "cycles";
      readonly who: "you" | "opponent" | "any";
      readonly otherOnly?: boolean;
    }
  | {
      /** "Whenever this creature explores" (`self`) / "whenever a creature
       * you control explores" (`you`, the explorer matching `filter` as it
       * explored — Merfolk Cave-Diver) — rule 701.44b: whatever the
       * exploration could do. `revealed`: "explores a land card" / "a nonland
       * card" (Nicanzil, Current Conductor). The explorer is the trigger
       * object. */
      readonly on: "explores";
      readonly who: "self" | "you";
      readonly filter?: CardFilter;
      readonly revealed?: "land" | "nonland";
    }
  | {
      /** "When this card becomes plotted" (rule 702.170) — it triggers from
       * exile, where plotting put it, and only for this card. */
      readonly on: "this-plotted";
    }
  | {
      /** Haunt (rule 702.55): "when **the creature it haunts** dies" — the
       * creature this card was exiled haunting (`GameObject.haunting`), put
       * into a graveyard from the battlefield in that stint, whether or not
       * it's still a creature (702.55b). It triggers from exile, and only
       * there (702.55c); a card of this kind contributes nothing else from
       * exile. */
      readonly on: "haunted-dies";
    }
  | {
      /** Haunt on an instant or sorcery (rule 702.55a): "when this spell is
       * put into a graveyard during its resolution" — not when it's
       * countered or fizzles. Never matched off an event: the engine queues
       * it as the resolved spell lands in its owner's graveyard. The
       * `hauntSpell()` helper. */
      readonly on: "this-resolved-into-graveyard";
    }
  | {
      /**
       * A trigger event named by a word of `TRIGGER_EVENTS`
       * (trigger-events.ts): "whenever you proliferate" (`"proliferates"`),
       * "whenever you become the monarch", "whenever this creature phases
       * in". `who` relates the event's subject to this ability's controller
       * as every kind's does — its object where the row names one (`"self"`,
       * `"you-control"`, `"opponent"`), otherwise its player (`"you"`,
       * `"opponent"`, `"any"`); absent is `"any"`. `filter` asks about the
       * object. An event with several objects (phasing) triggers once per
       * matching object (rule 603.2c), each the trigger object, unless
       * `batched` ("one or more"): once, its value the count. The row's
       * amount is the trigger value ("that much"). See
       * docs/plans/need-key-themes.md, theme 2's design note.
       */
      readonly on: "event";
      readonly event: TriggerEventName;
      readonly who?: TriggerWho;
      readonly filter?: CardFilter;
      /** Who did it, as the row names them, relative to this ability's
       * controller ("you" — "whenever **you** …"). */
      readonly by?: TriggerWho;
      readonly batched?: true;
      /** With `rolls-die`: which dice. Absent, every one. */
      readonly die?: DieTest;
    };

/**
 * The timing wrapper every trigger takes, whatever its kind (theme 2's
 * design note): "for the first time each turn", "your second … each turn".
 *
 * `nthEachTurn: N` — only when this is the Nth time this turn that this
 * trigger's event, as this trigger reads it (the spec without this wrapper),
 * has happened **for the same subject**: the same player for a player's act
 * ("your second spell", "you lose life for the first time"), the same object
 * in the same stint for an object's ("this creature attacks for the first
 * time", "counters are put on that creature for the first time"). Counted
 * whether or not this ability triggered then, and before its source existed
 * (the rulings for every such card). The spec's own narrowing narrows what
 * counts: valiant's "a spell or ability you control" counts only yours, a
 * `counter` kind or a `filter` only those (U.S.S. Enterprise-D's charge
 * counters, "your first enchantment spell"). Answered from the journal
 * (`Game.timingCount`); a kind it can't answer for is refused by
 * `test/trigger-timing.test.ts`. `firstTimeEachTurn` is `nthEachTurn: 1`.
 */
export interface TriggerTiming {
  readonly firstTimeEachTurn?: boolean;
  readonly nthEachTurn?: number;
}

/** A triggered ability's trigger: its event ({@link TriggerKind}) and its
 * timing ({@link TriggerTiming}). */
export type TriggerSpec = TriggerKind & TriggerTiming;

export interface TriggeredAbility {
  /** The keyword this ability is part of (`vanishing()`, `soulbond()`). */
  readonly keywordOf?: KeywordAbilityName;
  /**
   * Who chooses its targets, when not its controller — "target creature **of
   * their choice**" (Ley Line's `"active-player"` in "each player's
   * upkeep"), "of **defending player's** choice" (Erithizon's
   * `"trigger-player"`), "**its controller** chooses target permanent"
   * (Confusion in the Ranks's `"trigger-object-controller"`), "any target **of
   * an opponent's choice**" (Karplusan Minotaur's `"an-opponent"`: its
   * controller names the opponent as it's put on the stack, asked only among
   * two or more — the opponent then chooses, as Cuombajj Witches' activated
   * `opponentChoosesTargets` has it). They choose as
   * it's put on the stack, as its controller otherwise would (rules 603.3d,
   * 700.2e); the targets stay its controller's, legal or not as that player
   * would choose them. Nobody to ask (they've left the game): its controller.
   */
  readonly targetsChosenBy?: "trigger-player" | "active-player" | "trigger-object-controller" | "an-opponent";
  /**
   * "Target opponent **chosen at random**" (Witch Hunt, Knight Rampager, Scab-Clan
   * Giant): the game picks each slot's target as the ability is put on the stack
   * (rule 603.3d), among the targets that are legal for its controller, so they're
   * real targets: hexproof takes one out of the running and ward answers one.
   * Each permanent is equally likely, each token of a stack its own. Unlike
   * `choose-opponent`'s `random` or `choose-permanents`', which pick untargeted as
   * it resolves.
   */
  readonly targetsAtRandom?: true;
  /**
   * "This ability still resolves if its target becomes illegal" (Gilded
   * Drake): with every target illegal it isn't removed from the stack (rule
   * 608.2b's own exception — the ability's text says otherwise); it
   * resolves, and what it would do to an illegal target it doesn't (the
   * exchange fails, so its `otherwise` is done).
   */
  readonly resolvesDespiteIllegalTargets?: true;
  /**
   * Eminence — this ability functions while its card is in the **command
   * zone**, not only on the battlefield, because its text says so (rule
   * 113.6b; Eminence is an ability word, rule 207.2c, with no rules meaning
   * of its own). Edgar Markov: "whenever you cast another Vampire spell, if
   * Edgar Markov is in the command zone or on the battlefield, …".
   *
   * Per *ability*, not per card, and that is the whole point: Edgar's first
   * strike, haste and attack trigger do nothing from the command zone. Only
   * the one clause that says so is marked.
   *
   * The engine's trigger scan and static scan both walk the battlefield, so
   * a marked ability adds its card to those scans from the command zone and
   * an unmarked one on the same card still doesn't appear.
   */
  readonly fromCommandZone?: boolean;
  /**
   * This ability works while its card is in a **graveyard**, and only there
   * (rule 113.6k: an ability that moves its own object out of a zone —
   * "return this card from your graveyard to the battlefield" — functions
   * only in that zone): Bloodghast's "Landfall — … you may return this card
   * from your graveyard to the battlefield", Spit Flame's "… return this
   * card from your graveyard to your hand".
   *
   * The trigger scan adds such cards from every graveyard, for these
   * abilities alone, and never counts them on the battlefield. Its
   * controller is the card's owner. A card that reached the graveyard in the
   * very event being scanned — it left the battlefield together with the
   * creature whose death fired it — wasn't there to see it (Nether Traitor's
   * ruling). `"source"` in the effect finds the card only if it's the same
   * object when the ability resolves (rule 400.7).
   */
  readonly fromGraveyard?: boolean;
  /**
   * This ability works while its card is **in exile**, and only there (rule
   * 113.6k, as `fromGraveyard`): Senu, Keen-Eyed Protector's "when a
   * legendary creature you control attacks and isn't blocked, if this card is
   * exiled, put it onto the battlefield attacking". The trigger scan adds
   * every exiled card with such an ability (face up — a face-down card has
   * no abilities, rule 708.2), contributing those abilities alone; its
   * controller is the card's owner. One exiled in the very event being
   * scanned wasn't there to see it.
   */
  readonly fromExile?: boolean;
  /**
   * This ability works while its card is **suspended** — in exile with suspend
   * and a time counter (rule 702.62b) — and only then (rule 113.6b: it says
   * the zone it functions in): Deep-Sea Kraken's "whenever an opponent casts
   * a spell, if this card is suspended, remove a time counter from it",
   * Riftmarked Knight's "when the last time counter is removed from this card
   * while it's exiled". The trigger scan adds every suspended card with such
   * an ability, contributing those abilities alone, never on the battlefield;
   * its controller is the card's owner. A `counters-removed` trigger of `who:
   * "self"` sees the card's own time counters coming off in exile (`last`:
   * the last one). "If this card is suspended" and "while it's exiled" need
   * nothing more: only a suspended card is scanned, and `"source"` finds it
   * only while it's the same object (rule 400.7).
   */
  readonly whileSuspended?: boolean;
  /**
   * Goes on the stack before its controller's other triggers of the same
   * moment, so it resolves after them. The engine doesn't yet ask a player
   * to order simultaneous triggers (rule 603.3b), so this stands in for the
   * order that's never worse — only evoke's sacrifice trigger sets it, so
   * the creature's own enters abilities resolve first (the evoke rulings).
   */
  readonly stackFirst?: boolean;
  readonly trigger: TriggerSpec;
  /** One ability with two trigger events, "whenever A **and whenever** B"
   * (eerie: "whenever an enchantment you control enters and whenever you
   * fully unlock a Room"), is written as two entries, one per event; this
   * one names the other's index in `triggered`, so they're counted as the
   * one ability they are — Victor, Valgavoth's Seneschal's "if this is the
   * first time this ability has resolved this turn". */
  readonly sameAbilityAs?: number;
  /** Engine-set, never authored: the sets a `grant-triggered`'s `remember`
   * captured as it granted this, given to each firing as `{ remembered }`. */
  readonly remembered?: { readonly [name: string]: readonly SetMember[] };
  readonly targets: readonly TargetSpec[];
  readonly effect: EffectSpec | null;
  readonly resolve: SpellResolver | null;
  /**
   * An *intervening-if* clause (rule 603.4) — "When ~ enters, **if** you
   * control a creature with power 4 or greater, draw a card". The condition is
   * checked twice: as the trigger event happens (a false condition means the
   * ability never triggers at all) and again as the ability resolves (a
   * condition that has since become false removes it from the stack with no
   * effect). Evaluated from the source's controller's perspective, counting
   * the source itself. needed-cards P7.
   */
  readonly condition?: StaticCondition;
  /**
   * A condition that is part of the **trigger condition** — "whenever you
   * cast a spell **while Fire Lord Azula is attacking**" (rule 603.1). Checked
   * only as the event happens: unlike an intervening "if" (`condition`, rule
   * 603.4, which only an "if" right after the trigger event is), it isn't
   * asked again as the ability resolves, so Azula leaving combat in response
   * doesn't stop the copy. Evaluated like `condition`, counting the source.
   */
  readonly whileCondition?: StaticCondition;
  /**
   * "You may reveal the first card you draw each turn as you draw it.
   * Whenever you reveal an instant or sorcery card this way, …" (God-Eternal
   * Kefnet): a `draws` trigger whose drawn card (its trigger object) its
   * controller may reveal, asked through the `miracle-reveal` decision before
   * the trigger is placed, as miracle's is; kept hidden, the trigger is
   * dropped. Each such trigger asks on its own (the ruling: two Kefnets, two
   * reveals). `filter` is "whenever you reveal **an instant or sorcery card**
   * this way": the trigger fires on any first draw, so a question about a
   * land tells no one what was drawn, and is kept only for a revealed card
   * that matches.
   */
  readonly revealsDrawn?: { readonly filter?: CardFilter };
  /**
   * "This ability triggers only once each turn" (rule 603.2 — Morbid
   * Opportunist, Welcoming Vampire). Once it has triggered this turn, further
   * events don't trigger it, whoever's turn it is. That also makes "whenever
   * one or more …" exact on a per-object trigger: the first of a batch
   * triggers it and the rest can't. Tracked per ability of one object, so a
   * permanent that leaves and returns is a new object that may trigger again.
   */
  readonly oncePerTurn?: boolean;
  /** "This ability triggers only once" — ever, for this object (Mystery
   * Booster Commander's Collectors): once it has triggered, it never
   * triggers again; a permanent that leaves and returns is a new object
   * (rule 400.7) that may. Kept for the game in the journal
   * (`triggeredOnceEver`), as `oncePerTurn` is for the turn. */
  readonly triggersOnlyOnce?: true;
  /** A firebending ability (rule 702.189a — the `firebending()` helper): as
   * it resolves, its controller firebends (702.189b — `bent`). */
  readonly firebending?: true;
  /** "N damage divided as you choose among any number of target …"
   * (Dragonlord Atarka, Inferno Titan): the targets from `slot` on — an
   * `any-number` group — share `total`, split as the ability is put on the
   * stack (rule 603.3d: the `choose-targets` answer's `division`, at least 1
   * each) and dealt by a `damage-divided` effect. A target gone illegal loses
   * its share. The total, in place of `total`: `byTriggerValue`, the value
   * it triggered with; `byTurnStat`, its controller's running total of that
   * stat this turn as it goes on the stack (Lathiel's "that many" — the life
   * gained this turn; more gained in response changes nothing, the ruling).
   * `upTo`: "distribute **up to** that many", so the shares may add up to
   * less. A `total` that is an amount is read as it's put on the stack, when
   * the division is announced (rules 603.3d, 601.2d) — "where X is the number
   * of lands you control" (Ureni, the Song Unending), "damage equal to its
   * power" (Orca, Siege Demon, its last-known power once it has died) — and
   * caps its group, so give the group no `max`. */
  readonly divided?: {
    readonly total: EffectAmount;
    readonly slot: number;
    readonly of?: string;
    readonly byTriggerValue?: true;
    readonly byTurnStat?: TurnStat;
    readonly upTo?: true;
  };
  readonly text: string;
}

/** The shape shared by both ability kinds once on the stack. */
export interface StackAbility {
  readonly targets: readonly TargetSpec[];
  readonly effect: EffectSpec | null;
  readonly resolve: SpellResolver | null;
}

/** An equip ability (rule 702.6a, its "Equip [quality]" and "Equip
 * planeswalker" variants 702.6c/e) — the keyword as its text begins it,
 * which the `equip()` helper and every hand-written one (`text: "Equip
 * {1}{W}"`, "Equip—Pay 3 life") do. What "equip abilities you activate"
 * (Bureau Headmaster) names; "Equipped …" isn't one. */
export function isEquipAbility(ability: ActivatedAbility): boolean {
  return /^Equip\b/.test(ability.text);
}

/** An `AbilityCost.collectEvidence` as the total it asks for and, for the
 * record that isn't collecting evidence, the cards it's paid from: those
 * matching its filter, never `source` (the ability's own). */
export function evidenceCostOf(
  cost: NonNullable<AbilityCost["collectEvidence"]>,
  source: ObjectId,
): { readonly amount: number; readonly among?: { readonly filter: CardFilter; readonly except: ObjectId } } {
  return typeof cost === "number"
    ? { amount: cost }
    : { amount: cost.totalManaValue, among: { filter: cost.filter, except: source } };
}

/** A mana ability adds mana, has no targets, and never uses the stack. A cost
 * that includes a sacrifice disqualifies it (the engine's mana-source machinery
 * only knows how to pay a bare `{T}`). */
export function isManaAbility(ability: ActivatedAbility): boolean {
  return (
    // A loyalty ability uses the stack even if it adds mana (rule 606.3).
    ability.loyaltyCost === undefined &&
    // Wherever it works from: rule 605.1a doesn't ask. Elvish Spirit Guide's
    // "Exile this card from your hand: Add {G}" never uses the stack (605.3b).
    // Rule 605.1a: a cost that moves a card from a library (Millikin's "Mill
    // a card") makes it an ordinary activated ability, on the stack.
    !(ability.cost.do !== undefined && costActMovesLibrary(ability.cost.do)) &&
    // Whatever else it costs (605.1a asks of a cost only that it move no
    // card to or from a library): a sacrifice of itself (Treasure) or of a
    // chosen permanent (Kykar's "Sacrifice a Spirit"), life, counters
    // removed (Ramos), energy. Which of those the
    // auto-payer can pay by itself is `Game.manaSources`' business; the
    // rest are activated by hand, and still never use the stack.
    ability.targets.length === 0 &&
    ability.resolve === null &&
    ability.effect !== null &&
    // One `add-mana`, or several in a row — Ramos, Dragon Engine's "Add
    // {W}{W}{U}{U}{B}{B}{R}{R}{G}{G}" is five of them.
    addsManaOnly(ability.effect)
  );
}

/** An effect that is nothing but adding mana: one `add-mana`, or several in
 * a row. */
function addsManaOnly(effect: EffectSpec): boolean {
  return (
    effect.kind === "add-mana" ||
    (effect.kind === "sequence" &&
      effect.effects.length > 0 &&
      effect.effects.every((step) => step.kind === "add-mana"))
  );
}

/**
 * A triggered mana ability (rule 605.1b): one that triggers from a mana
 * ability resolving or mana being added, adds mana, and doesn't target — in
 * the engine, a `tapped-for-mana` trigger (Crypt Ghast's "whenever you tap a
 * Swamp for mana, add an additional {B}"). Raggadragga, Goreguts Boss's
 * ruling counts these as mana abilities. A trigger that merely adds mana on
 * some other event (Lotus Cobra's landfall, Priest of Urabrask entering) uses
 * the stack and isn't one.
 */
export function isTriggeredManaAbility(ability: TriggeredAbility): boolean {
  return (
    ability.trigger.on === "tapped-for-mana" &&
    ability.targets.length === 0 &&
    ability.resolve === null &&
    ability.effect !== null &&
    addsManaOnly(ability.effect)
  );
}

/**
 * The same for a delayed one (rules 603.7, 605.1b): "until end of turn, whenever
 * a player taps an Island for mana, that player adds an additional {U}" (High
 * Tide) is a triggered mana ability with a duration, and doesn't use the stack
 * either. Its effect is the `add-mana` `Game.tappedForManaExtras` reads.
 */
export function isDelayedManaAbility(
  whenever: TriggerSpec,
  targets: readonly unknown[] | undefined,
  effect: EffectSpec,
): boolean {
  return whenever.on === "tapped-for-mana" && (targets === undefined || targets.length === 0) && effect.kind === "add-mana";
}
