/**
 * Replacement effects — rule 614 / 616. A replacement watches for a particular
 * event and modifies (or cancels) it *before* it happens, rather than reacting
 * after like a triggered ability.
 *
 * Modeled as an optional `replacement` field on a `StaticAbility` (rule 614.1 —
 * a replacement is a kind of static ability), applied by `game.ts`.
 *
 * **Phase 1a** covered only `enters-battlefield` *self*-replacements. **Phase 1b**
 * adds the first *external* replacements — a permanent replacing an event that
 * happens elsewhere:
 *   - `would-create-token` — a token *multiplier* (Doubling Season, Parallel
 *     Lives): "twice that many are created instead".
 *   - `would-add-counter` — a counter *multiplier* (Doubling Season): "twice
 *     that many counters are put on instead".
 *   - `would-be-put-into-graveyard` — graveyard hate (Rest in Peace): "exile it
 *     instead".
 * Fog-style one-shot combat-damage prevention is a turn-scoped `GameState` flag,
 * not a static (rule 614 calls it a replacement, but there's no permanent to
 * hang it on). See ROADMAP.md Phase 1.
 *
 * **Phase 11 EG-6** adds `would-draw` (Notion Thief) and an optional
 * `CardFilter` on `would-be-put-into-graveyard` (Anafenza). One-shot
 * damage-prevention shields (Healing Salve) live on `GameState.preventionShields`
 * rather than here (no permanent to hang them on, like Fog). Still not modeled:
 * multi-replacement ordering, damage *redirection* to a third object (Harm's Way).
 *
 * `others-enter-battlefield` is the external form of the enters-battlefield
 * replacement: how *other* permanents enter (Giada's extra counters, Thalia's
 * "enter tapped", The Wandering Minstrel's "enter untapped").
 */

import type { StaticCondition } from "./cards/define.js";
import type { BeholdSpec, EffectAmount, EffectSpec } from "./effects.js";
import type { CardFilter } from "./filter.js";
import type { CardType } from "./cards.js";

/** A single replacement clause on a `StaticAbility`. Discriminated by `event`. */
export type ReplacementSpec =
  | TurnBeginReplacement
  | EntersBattlefieldReplacement
  | OthersEnterReplacement
  | TokenMultiplierReplacement
  | CounterMultiplierReplacement
  | GraveyardExileReplacement
  | CounterExileReplacement
  | DiscardToLibraryReplacement
  | DrawRedirectReplacement
  | DamageMultiplierReplacement
  | MillMultiplierReplacement
  | LifeGainReplacement
  | LifeLossReplacement
  | TapManaMultiplierReplacement
  | ProliferateReplacement;

/**
 * "If you would proliferate, proliferate twice instead" (Tekuthal, Inquiry
 * Dominus): this permanent's controller proliferates `times` times rather than
 * once, each its own choice over the board as the last one left it and its own
 * "whenever you proliferate" (rule 701.34). Several multiply, each applying to
 * what the others made of it (rule 614.5). Applied by `Game.beginProliferate`.
 */
export interface ProliferateReplacement {
  readonly event: "would-proliferate";
  readonly times: number;
}

/**
 * "If you tap a permanent for mana, it produces twice as much of that mana
 * instead" (Mana Reflection; Nyxbloom Ancient's three times) — a replacement
 * that modifies the mana production event (rule 106.12b) of a mana ability
 * with `{T}` in its cost (rule 106.12), activated by this permanent's
 * controller. Several multiply (the ruling). Only the tapped permanent's own
 * mana is multiplied, never what a triggered mana ability adds as it's tapped
 * (the ruling), and whatever the mana carries — a restriction, a rider — all
 * of it carries (rule 106.6a). Applied by a hand activation and by the
 * auto-payer's options (`multipliedManaOption`).
 */
export interface TapManaMultiplierReplacement {
  readonly event: "tap-for-mana";
  readonly multiplier: number;
}

/**
 * "If this land would enter, sacrifice a Swamp instead. If you do, put this
 * land onto the battlefield. If you don't, put it into its owner's graveyard"
 * (Lake of the Dead), "… you may discard a land card instead" (Mox Diamond):
 * what its controller does as it's about to enter, however it's entering
 * (rule 614.12 — asked by `Game.askEnterChoice`, before it moves), which
 * decides whether it enters at all. One that doesn't never entered: no enters
 * trigger sees it, and it goes to its owner's graveyard from wherever it was.
 * A copy of it does this too, as what it's becoming; a token copy, which is
 * never asked an "as this enters" choice, doesn't (`docs/engine-gaps.md`).
 */
export interface EnterInstead {
  /**
   * The permanents the entering permanent's controller sacrifices, matching
   * this from their side — never itself, nor one entering at the same time. A
   * `count` of them, chosen, as much as possible (rule 609.3: all that are
   * there, if fewer); "If you do" needs the whole number, so Lotus Vale with
   * one untapped land still loses it and goes to the graveyard. `"all"` is
   * every one, as one event, and it enters whatever there was: Sheltered
   * Valley's "instead sacrifice each other permanent named Sheltered Valley
   * you control, then put this land onto the battlefield", Overlaid Terrain's
   * "As this enchantment enters, sacrifice all lands you control". Neither
   * has an "if you don't".
   */
  readonly sacrifice?: { readonly filter: CardFilter; readonly count: number | "all" };
  /** "You **may** discard a land card instead" (Mox Diamond): one card from
   * its controller's hand matching this; choosing none is declining. */
  readonly discard?: { readonly filter: CardFilter };
  /** "If this creature would enter and it wasn't cast or no mana was spent to
   * cast it, **exile it instead**" (Primeval Spawn, `{ manaSpent: { op: "gte",
   * n: 1 } }`): nothing to choose. It enters if it matches this as it's about
   * to, and otherwise goes to exile from wherever it was. A token copy is never
   * cast, so none is made (`Game.createTokenCopy`, rule 111.7). */
  readonly exileUnless?: CardFilter;
}

/**
 * "As this enters, exile … from your graveyard" (Living Lore), "As this
 * creature enters, you may return a nonland permanent you control to its
 * owner's hand" (Rescuer Sphinx): something its controller does as it's about
 * to enter, part of the replacement (rule 614.1c), so nobody can respond, and
 * chosen before it moves (rule 614.12). What it enters with is `counters`'
 * `"done-as-enters"`: how many cards this exiled or returned.
 */
export interface AsEntersAction {
  /**
   * Cards exiled from a graveyard, and so linked to the permanent for its stint
   * on the battlefield (rule 607.2a): its "the exiled card" and "cards exiled
   * with it" (`exiled-with-source`, `exiledWith`). Never itself, nor a card
   * entering with it.
   */
  readonly exile?: {
    readonly filter: CardFilter;
    /** `"x"` is the {X} it was cast with (0 otherwise), `"any"` any number. */
    readonly count: number | "x" | "any";
    /** "**Up to** X creature cards" (Mimeoplasm, Revered One). */
    readonly upTo?: true;
    /** "From **a** graveyard" (Dermotaxi); its controller's by default. */
    readonly anyGraveyard?: true;
    /** "If you can't, put this creature into its owner's graveyard instead of
     * onto the battlefield" (Frankenstein's Monster): with fewer than `count`
     * there, nothing is exiled and it doesn't enter. */
    readonly orToGraveyard?: true;
    /** "For each creature card exiled this way, this creature enters with a
     * +2/+0, +1/+1, or +0/+2 counter on it" (Frankenstein's Monster): its
     * controller picks one of these kinds for each. */
    readonly counterForEach?: readonly string[];
  };
  /** "You may return [filter] you control to its owner's hand": up to one,
   * already on the battlefield under its controller. */
  readonly returnPermanent?: { readonly filter: CardFilter };
}

/** As the source permanent enters the battlefield (rule 614.1c). A self-
 * replacement — printed on the card, applies only to it. */
export interface EntersBattlefieldReplacement {
  readonly event: "enters-battlefield";
  /** See {@link EnterInstead}. */
  readonly instead?: EnterInstead;
  /** See {@link AsEntersAction}. */
  readonly asEnters?: AsEntersAction;
  /** It enters tapped (every "enters the battlefield tapped" land / creature). */
  readonly tapped?: boolean;
  /** It enters tapped *unless* this condition holds when it enters — the
   * "check land" cycle (Rootbound Crag: "enters tapped unless you control a
   * Mountain or a Forest"), and the count-based version (Cinder Glade: "unless
   * you control two or more basic lands"). Evaluated once, as it enters. */
  readonly tappedUnless?: StaticCondition;
  /**
   * It enters tapped unless its controller reveals a card with one of these
   * subtypes from their hand — the Shadows over Innistrad "reveal land" cycle
   * (Port Town: "As this land enters, you may reveal a Plains or Island card
   * from your hand. If you don't, this land enters tapped").
   *
   * Distinct from `tappedUnless`, which is a `StaticCondition` over the
   * *battlefield*; this one reads the hand, which no `StaticCondition` can.
   *
   * The "you **may** reveal" is a `reveal-for-untapped` decision, asked
   * before it moves (`Game.askEnterChoice`). Entering some way that never
   * asks (a token copy), it reveals whenever it can.
   */
  readonly tappedUnlessRevealFromHand?: readonly string[];
  /**
   * It enters tapped unless its controller beholds (rule 701.4a) — reveals a
   * matching card from their hand or chooses a matching permanent they
   * control: Theorist's Sanctum's "As this land enters, you may behold a
   * Jace. If you don't, this land enters tapped." The "you may" is a
   * `choose-from-zone` with the awaiting's `behold` set (none chosen is
   * declining), asked before it moves (`Game.askEnterChoice`, rule 614.12),
   * and the land itself is never a candidate. Entering some way that never
   * asks (a token copy), it beholds whenever it can.
   */
  readonly tappedUnlessBehold?: BeholdSpec;
  /** With both `tappedUnless` and `tappedUnlessRevealFromHand`: either one
   * spares it — Temple of the Dragon Queen's "enters tapped unless you
   * revealed a Dragon card this way **or** you control a Dragon". Without
   * it, each one it fails taps it. */
  readonly revealOrCondition?: true;
  /** If it ends up entering *untapped*, it deals this much damage to its
   * controller (Rockfall Vale: "When Rockfall Vale enters untapped, it deals
   * 1 damage to you"). */
  readonly painIfUntapped?: number;
  /** A "shock land" (rule 614.13): as it enters, its controller may pay this
   * much life to have it enter untapped; otherwise it enters tapped. Raised
   * as a `pay-life-for-untapped` decision. */
  readonly mayPayLife?: number;
  /** It enters with these counters already on it. `amount: "x"` reads the
   * `{X}` chosen when it was cast (Walking Ballista); `"times-kicked"` the
   * number of times its multikicker was paid (Everflowing Chalice's "a
   * charge counter on it for each time it was kicked" — rule 702.33c), 0
   * when it wasn't cast; `"web-slinging-mana-value"` the mana value of the
   * creature returned to pay its web-slinging cost, as that creature last
   * existed on the battlefield (rule 702.188a — Scarlet Spider, Ben
   * Reilly's "X is the mana value of the returned creature"), 0 when it
   * wasn't cast using web-slinging. `"removed-as-enters"` is the number of
   * counters its `removeAllCountersFrom` took off as it entered (Thief of
   * Blood's "a +1/+1 counter on it for each counter removed this way").
   * `"done-as-enters"` is how many cards its `asEnters` exiled or returned, times
   * `eachDone`: Mimeoplasm's "three +1/+1 counters on it for each creature card
   * exiled this way". */
  readonly counters?: {
    readonly kind: string;
    readonly amount: EffectAmount | "times-kicked" | "web-slinging-mana-value" | "removed-as-enters" | "done-as-enters";
    readonly eachDone?: number;
  };
  /**
   * "As this creature enters, remove all counters from all permanents"
   * (Thief of Blood): as it enters (rule 614.1c — part of the replacement, so
   * nothing can respond between), every counter of every kind comes off each
   * permanent already on the battlefield matching this filter, read from its
   * controller's side — never itself, nor anything entering with it (614.12).
   * A token stack loses them token by token, all at once. A player's counters
   * aren't a permanent's (its ruling: experience counters stay). How many came
   * off is `counters`' `"removed-as-enters"`.
   */
  readonly removeAllCountersFrom?: CardFilter;
  /**
   * Sunburst (rule 702.44a): it enters with a counter for each colour of mana
   * spent to cast it — +1/+1 counters if it's entering as a creature, ignoring
   * type-changing effects (so by its copiable types, layer 1: March of the
   * Machines doesn't make Engineered Explosives' counters +1/+1), charge
   * counters otherwise. None unless it's entering from the stack as a
   * resolving spell (702.44b: the colours spent are cleared by any other zone
   * change). The `sunburst()` helper. "Modular—Sunburst" is always +1/+1
   * (702.44c) and is `counters` with `{ colorsSpentOf: "source" }` instead.
   */
  readonly sunburst?: true;
  /** It enters transformed — a transforming DFC that says "enters the
   * battlefield transformed" unconditionally (rule 712.10 — ROADMAP Phase
   * 10b). Daybound's conditional "if it's night" is handled by the engine,
   * not this flag. */
  readonly transformed?: boolean;
  /** It enters prepared — "This creature enters prepared" (rule 722.3a): it
   * gains the designation as it enters, making its prepare spell's copy in
   * exile (`Game.becomePrepared`). */
  readonly prepared?: boolean;
}

/**
 * How *other* permanents enter (rule 614.1c) — the external counterpart of
 * {@link EntersBattlefieldReplacement}, applied by `Game.moveObject` and the
 * token minter to every permanent entering while this one is on the
 * battlefield:
 *   - "Each other Angel you control enters with an additional +1/+1 counter on
 *     it for each Angel you already control" (Giada, Font of Hope);
 *   - "Creatures and nonbasic lands your opponents control enter tapped"
 *     (Thalia, Heretic Cathar);
 *   - "Lands you control enter untapped" (The Wandering Minstrel, Spelunking).
 *
 * **Never applies to its own source**, "other" printed or not: a permanent's
 * ability that affects a general set of permanents doesn't modify how that
 * permanent itself enters (rule 614.12). Nor does it apply to anything
 * entering *at the same time* as its source, which isn't on the battlefield
 * yet (the Thalia / Minstrel / Metallic Mimic rulings) — the engine's
 * simultaneous-entry batch (`Game.withEnterBatch`) is what says so.
 */
export interface OthersEnterReplacement {
  readonly event: "others-enter-battlefield";
  /** Which entering permanents it applies to, matched against each one as it
   * would exist on the battlefield (rule 614.12) — its computed types, and the
   * player it's entering under — from this permanent's controller's
   * perspective: `controlledBy: "you"` is "you control", `"opponent"` is
   * "your opponents control". */
  readonly filter: CardFilter;
  /** It enters tapped, whatever would otherwise untap it on the way in: a
   * land that "enters tapped unless …" enters tapped even when the condition
   * holds (the Thalia, Heretic Cathar ruling). */
  readonly tapped?: boolean;
  /**
   * It enters untapped — beating every "enters tapped", its own ("this land
   * enters tapped"), another permanent's (`tapped` above) and an effect's
   * ("put it onto the battlefield tapped"). Rule 616.1 lets the entering
   * permanent's controller order the replacements, so they can always apply
   * this one last, and the card only reaches permanents its controller
   * controls; a shock land isn't offered its life payment at all (the
   * Wandering Minstrel and Spelunking rulings).
   */
  readonly untapped?: boolean;
  /**
   * It enters with this many additional counters of `kind`. `amount` is read
   * as it enters, from this permanent's perspective (so `countOf` counts what
   * *its* controller controls), and **never counts the permanent entering, or
   * anything entering alongside it** — Giada's "for each Angel you already
   * control". `"trigger-object"` in an amount names the entering permanent.
   * A `would-add-counter` multiplier (Doubling Season) applies on top, as it
   * does to any enters-with-counters.
   */
  readonly counters?: { readonly kind: string; readonly amount: EffectAmount };
}

/** "If one or more tokens would be created under your control, twice that many
 * are created instead" (Doubling Season, Parallel Lives, Anointed Procession).
 * Applies to tokens whose controller is this permanent's controller. Multiple
 * such replacements multiply (order-independent).
 *
 * `creatureTokensInstead` is Divine Visitation's "if one or more **creature**
 * tokens would be created under your control, that many 4/4 white Angel
 * creature tokens with flying and vigilance are created instead": the token
 * made instead, by name. Only a token that would be created a creature —
 * not one an effect makes a creature as it enters (the ruling). Its
 * characteristics replace the old token's entirely, copy exceptions and an
 * X/X's size included; everything else the effect said — tapped,
 * attacking, "it gains haste", sacrificed or exiled later, counters put on
 * it — still happens (the ruling). In either order with a multiplier, the
 * result is the same. */
export interface TokenMultiplierReplacement {
  readonly event: "would-create-token";
  readonly multiplier?: number;
  /** "If one or more tokens would be created", with no "under your control"
   * (Primal Vigor): whoever would control them (its ruling). */
  readonly anyController?: true;
  readonly creatureTokensInstead?: string;
  /**
   * "If one or more tokens would be created under your control, **those
   * tokens plus that many** 1/1 green Squirrel creature tokens are created
   * instead" (Chatterfang, Squirrel General): this many more of the named
   * token as well, of any kind of token (the ruling). They have none of
   * the other tokens' own abilities or values, but everything else the
   * effect says — tapped, attacking, "they gain haste", exiled at end of
   * combat — applies to them too (the ruling). Each one counts every token
   * of the event before it, its own included only once (rule 614.5); with
   * a multiplier the order is the controller's (616.1) and comes out the
   * same, and before Divine Visitation, which makes Squirrels Angels too —
   * the order that gives the most.
   */
  readonly plusTokens?: string;
  /**
   * "Those tokens **plus an additional** Food token" (Tippy-Toe, Xorn,
   * Stridehangar Automaton): one more of the named token, however many the
   * event makes, with what the effect does to the tokens and none of what
   * they are (Chatterfang's rulings). One opportunity per event (rule 614.5):
   * a Treasure and a Clue made by one instruction (a `sequence`'s
   * `simultaneous`) get one Food between them. With a doubler its controller
   * orders them (rule 616.1), and the order taken makes the most: the extra
   * one is doubled too (`token-replacements.ts`).
   */
  readonly plusOneToken?: string;
  /**
   * Draconic Visitor's "if one or more artifact tokens would be created under
   * your control, that many 5/5 red Dragons are created instead", and Fisher's
   * Talent's "if you would create a Fish token, create a Shark instead":
   * `creatureTokensInstead` for the tokens `ofTokens` names, and what's said
   * there about what's kept holds here too.
   */
  readonly tokensInstead?: string;
  /**
   * Academy Manufactor's "if you would create a Clue, Food, or Treasure
   * token, instead create one of each": each token `ofTokens` names becomes
   * one of each of these. One opportunity at the event, over every such
   * token in it, so two of them make three of each of a Treasure.
   */
  readonly oneOfEach?: readonly string[];
  /**
   * "One or more **artifact** tokens": applies only when the event would make
   * a token of this kind, and so can start to when another replacement adds
   * one (rule 616.1). A token is what it would be created as, its definition
   * or a copy's copiable values, not what an effect makes it as it enters
   * (the Divine Visitation ruling). `plusOneToken` adds to the whole event;
   * `tokensInstead` and `oneOfEach` replace just the tokens it names, and
   * `multiplier` multiplies just them (Ojer Taq's "three times that many of
   * those tokens").
   */
  readonly ofTokens?: TokenKindFilter;
}

/** Which tokens a {@link TokenMultiplierReplacement} is about. */
export interface TokenKindFilter {
  readonly type?: CardType;
  /** "A Fish token", "a Clue, Food, or Treasure token". */
  readonly subtypesAnyOf?: readonly string[];
}

/** "If one or more counters would be put on a permanent you control, twice that
 * many are put on instead" (Doubling Season). Applies to a permanent whose
 * controller is this permanent's controller. `counterKind` narrows it to one
 * kind (e.g. only `"+1/+1"`); omit for any kind. Multiple such replacements
 * multiply. */
export interface CounterMultiplierReplacement {
  readonly event: "would-add-counter";
  /** "Twice that many … instead" (Doubling Season). */
  readonly multiplier?: number;
  /** "That many plus one … instead" (Hardened Scales, Winding Constrictor):
   * added once to each placement of one or more counters; negative is "that
   * many minus one" (Vizier of Remedies' -1/-1 counters), never below none.
   * With a multiplier as well, the permanent's controller orders them (rule
   * 616.1) — the order that puts the most counters, or for -1/-1 counters
   * the fewest (`Game.counterTotal`). */
  readonly plus?: number;
  /** "Half that many …, rounded down" (Vorinclex, Monstrous Raider). Rounding
   * makes the order matter, so `counterTotalInBestOrder` looks for it. */
  readonly halved?: true;
  /** "If **you** would put" or "if **an opponent** would put": it reads who is
   * putting them (Vorinclex's ruling cares deeply), and whoever controls the
   * permanent they go on. A counter put without a named player is put by the
   * effect's controller, or as a permanent enters by its controller (rule
   * 122.6, the ruling). Unset, the counters go on a permanent this permanent's
   * controller controls. */
  readonly whoPuts?: "you" | "opponent";
  /** "If one or more +1/+1 counters would be put on **a creature**" (Primal
   * Vigor): whoever controls it (its ruling). */
  readonly anyController?: true;
  /** "… or player" (Vorinclex, Innkeeper's Talent) or "or on yourself"
   * (Lae'zel, Vlaakith's Champion): counters put on players too, energy
   * included (rule 107.14). */
  readonly onPlayers?: "any" | "you";
  /** "If **an effect** would put one or more counters" (Doubling Season):
   * not counters put as a cost (Devoted Druid's -1/-1, Wall of Roots'
   * -0/-1), which every other wording ("if one or more counters would be
   * put") reaches too. */
  readonly byEffectOnly?: true;
  /** "…put on **another** creature you control" (Benevolent Hydra): never
   * this permanent itself. */
  readonly other?: true;
  readonly counterKind?: string;
  /** Narrows which of your permanents it applies to — Branching Evolution's
   * "on a **creature** you control" is `{ type: "creature" }`. Matched
   * against the permanent's computed characteristics as the counters are
   * put on it. Omit for any permanent you control. */
  readonly filter?: CardFilter;
}

/** What the `would-add-counter` replacements that reach one placement do, one
 * entry per replacement (a token stack of them is that many). */
export interface CounterReplacementSteps {
  readonly multipliers: readonly number[];
  readonly plus: readonly number[];
  readonly halved: number;
}

/**
 * How many `kind` counters a placement of `amount` comes to under `steps`. The
 * permanent's controller or the player orders them (rule 616.1), and the order
 * taken is the one best for them, worked out rather than asked (the user's
 * call, 2026-10-14): the most counters, or the fewest of a kind nobody wants.
 * Once none would be put, nothing more applies ("one or more").
 */
export function counterTotalInBestOrder(kind: string, amount: number, steps: CounterReplacementSteps): number {
  const fewest = kind === "-1/-1" || kind === "poison" || kind === "rad";
  const { multipliers, plus, halved } = steps;
  if (halved === 0) {
    const mult = multipliers.reduce((all, m) => all * m, 1);
    const up = plus.filter((p) => p >= 0).reduce((all, p) => all + p, 0);
    const down = plus.filter((p) => p < 0).reduce((all, p) => all + p, 0);
    if (fewest) {
      const base = Math.max(0, amount + down);
      return base === 0 ? 0 : base * mult + up;
    }
    return Math.max(0, (amount + up) * mult + down);
  }
  // Halving rounds down, so no one order is best every time: 4 with two "plus
  // one"s and a halving is 3 adding first and 4 adding last.
  const seen = new Map<string, number>();
  const best = (value: number, nextPlus: number, nextMultiplier: number, halvesLeft: number): number => {
    if (value <= 0) return 0;
    if (nextPlus === plus.length && nextMultiplier === multipliers.length && halvesLeft === 0) return value;
    const key = `${value}/${nextPlus}/${nextMultiplier}/${halvesLeft}`;
    const known = seen.get(key);
    if (known !== undefined) return known;
    const options: number[] = [];
    if (nextPlus < plus.length) options.push(best(Math.max(0, value + plus[nextPlus]), nextPlus + 1, nextMultiplier, halvesLeft));
    if (nextMultiplier < multipliers.length) options.push(best(value * multipliers[nextMultiplier], nextPlus, nextMultiplier + 1, halvesLeft));
    if (halvesLeft > 0) options.push(best(Math.floor(value / 2), nextPlus, nextMultiplier, halvesLeft - 1));
    const result = fewest ? Math.min(...options) : Math.max(...options);
    seen.set(key, result);
    return result;
  };
  return best(amount, 0, 0, halved);
}

/** "If a card would be put into a graveyard from anywhere, exile it instead"
 * (Rest in Peace, Leyline of the Void). An external replacement. Applies to
 * real cards only, not tokens (a token would just cease to exist either way).
 * `filter` (ROADMAP Phase 11 EG-6) narrows which cards it catches — omit for
 * "every card" (Rest in Peace); `{ type: "creature", ownedBy: "opponent" }`
 * for Anafenza-style graveyard hate. The filter is evaluated from the
 * replacement source's controller's perspective, against the card's *printed*
 * characteristics (it's off the battlefield by the time it would be put into a
 * graveyard) — except with `from: "battlefield"`, where it's still a
 * permanent and the filter reads its computed characteristics and current
 * controller.
 *
 * `from: "battlefield"` is the **dies-only** form (rule 700.4 — "dies" means
 * put into a graveyard from the battlefield): "If a nontoken creature an
 * opponent controls would die, exile it instead". It doesn't catch a card
 * discarded, milled, or countered, which the unqualified form does. Omit for
 * "from anywhere".
 *
 * Finality counters (rule 122 — "if a permanent with a finality counter on it
 * would be put into a graveyard from the battlefield, exile it instead") and
 * the per-object "if it would leave the battlefield, exile it instead of
 * putting it anywhere else" (`GameObject.exileIfItWouldLeave`) are the same
 * redirect, but belong to the moving object rather than to a static, so
 * they're applied by `moveObject` directly rather than through this spec. */
export interface GraveyardExileReplacement {
  readonly event: "would-be-put-into-graveyard";
  /** `"library-top"`: "if this creature would die, put it on top of its owner's
   * library instead" (Gravebane Zombie). Only with `self`. */
  readonly instead: "exile" | "library-top";
  readonly filter?: CardFilter;
  readonly from?: "battlefield";
  /** "… **and it wasn't cycled**, exile it instead" (Abandoned Sarcophagus):
   * the discard that pays a cycling cost, any variant of it (rule 702.29a, e),
   * goes to the graveyard. */
  readonly notCycled?: true;
  /** "…instead exile it **with a void counter on it**" (Dauthi
   * Voidwalker): counters the card has in exile, put on as it arrives
   * there — not an effect putting counters, so a doubler doesn't touch
   * them. */
  readonly withCounters?: { readonly kind: string; readonly amount: number };
  /** Something this exile does beside it, run by this permanent's controller
   * once the card is in exile, once for each token of a stack. An instruction
   * of the replacement itself — "instead exile that card and create a 2/2 black
   * Zombie creature token" (Kalitas, Traitor of Ghet) — or `{ kind:
   * "reflexive-trigger" }` for "exile it instead. **When you do**, create …"
   * (Head of the Hunt, rule 603.12). Given up, as a void counter is, when the
   * moving object's controller picks another exile that could apply (rule
   * 616.1). Not with `self`. */
  readonly then?: EffectSpec;
  /** "If **this** would be put into a graveyard from anywhere, exile it
   * instead" — a disturb back face's (Hook-Haunt Drifter, rule 702.146):
   * the object's own ability, not an external one, so it catches only the
   * object it's on — tokens included — from whatever zone it has the
   * ability in (the battlefield, the stack). Being an ability of the face,
   * it goes wherever the face's text goes: a Clone of the face has it (rule
   * 707.2), and the face that lost its abilities doesn't. Applied by
   * `Game.moveObject` to the moving object, never by the external scan.
   * With `from: "battlefield"`, "if **this creature would die**, exile it
   * instead" (Wildwood Escort — rule 700.4): countered or discarded, it goes
   * to its graveyard. */
  readonly self?: true;
}

/** A discarded card its owner may put on top of their library instead of anywhere
 * else: still a discard, to everything watching for one. `"effect"`: "if an effect
 * causes you to discard a card, discard it, but you may put it on top of your
 * library instead of into your graveyard" (Library of Leng: any spell's or
 * ability's, a cost's never, since a cost isn't an effect). `"opponent"`: "if a
 * spell or ability an opponent controls causes you to discard a card, you may
 * reveal that card and put it on top of your library instead of putting it anywhere
 * else" (Nephalia Academy, with `reveal`). Asked of the whole discard at once as
 * a `choose-from-zone`, which cards and in what order (rule 401.4); a card put
 * there escapes madness (rule 616.1, Nephalia Academy's ruling). Applied by
 * `Game.discardCards`. */
export interface DiscardToLibraryReplacement {
  readonly event: "would-discard";
  readonly causedBy: "effect" | "opponent";
  readonly reveal?: true;
}

/** "If a spell or ability you control would counter a spell, instead exile that
 * spell and you may play that card without paying its mana cost" (Guile). This
 * permanent's controller's `counter` effects, on a spell that could be countered
 * (one that can't wouldn't be, its ruling); never an ability. The spell was never
 * countered, so what a counterspell does "if countered this way" doesn't happen.
 * Applied by `Game.counterSpellByEffect`; the offer is the `counter` effect's. */
export interface CounterExileReplacement {
  readonly event: "would-counter-spell";
}

/** "If a player [who] would draw a card, [this permanent's controller] draws a
 * card instead" (Notion Thief — ROADMAP Phase 11 EG-6). Applied in
 * `Game.drawCard`. */
export interface DrawRedirectReplacement {
  readonly event: "would-draw";
  /** Whose draw is replaced, relative to this permanent's controller. */
  readonly who: "opponent" | "you";
  /** The replacement: the source's controller draws instead (Notion Thief —
   * `who: "opponent"`: "instead that player skips that draw and you draw a
   * card"), or that player draws `draws` cards instead ("if you would draw a
   * card, draw two cards instead" — gate it with the static's `condition`).
   * Neither replacement applies again to the draws it makes (rule 614.5).
   *
   * Several `"you-draw"` redirects pass one draw along between them, each
   * applying once (the Notion Thief rulings): the draw an opponent's Thief
   * hands its controller can be handed on by a Thief of one of *their*
   * opponents, so two players each with one in a duel leave the draw where it
   * began. A token stack of them is that many effects.
   *
   * `"win-game"` is Laboratory Maniac's and Jace, Wielder of Mysteries's
   * "if you would draw a card while your library has no cards in it, you
   * win the game instead": `who: "you"` with `whileLibraryEmpty`. It applies
   * even though no card could be drawn (rule 614.11), and replaces the draw
   * whether or not the player can win — one who can't (an opponent's
   * Platinum Angel) neither wins nor loses for it (the rulings). */
  readonly instead: "you-draw" | { readonly draws: number } | "win-game" | DrawReplacedByEffect;
  /** Only a draw while the drawing player's library has no cards in it. */
  readonly whileLibraryEmpty?: boolean;
  /** "…except the first one they draw in each of their draw steps" (Notion
   * Thief; Teferi's Ageless Insight's and Bard, King of Dale's "draw two
   * cards instead"): not the first card a player draws during their own
   * turn's draw step, the turn-based draw or not — if that one was skipped,
   * the next card they draw in the step is the first. With `who: "you"`
   * (`draws` or `effect`) only. */
  readonly exceptFirstInDrawStep?: boolean;
  /** "The first time you would draw a card each turn" (Reed Richards,
   * Smartest Man; Scion of Halaster): only the player's first draw event of
   * the turn — with `exceptFirstInDrawStep`, the first one that isn't
   * exempted. Read from the turn's history
   * (`PlayerState.wouldDrawThisTurn`), so a permanent that arrives after that
   * draw doesn't apply until the next turn. With `who: "you"` only. */
  readonly firstEachTurn?: boolean;
}

/** A `would-draw` replacement whose draw becomes an effect instead (rule
 * 614.1a) — Underrealm Lich's "if you would draw a card, instead look at the
 * top three cards of your library, then put one into your hand and the rest
 * into your graveyard", Sages of the Anima's reveal-three, Tomorrow, Azami's
 * Familiar's look-three-keep-one. `who: "you"`: the effect is its
 * controller's ("you" in it is them — the drawing player). It applies though
 * the library is empty (rule 614.11), and the card isn't drawn: no draw
 * trigger, nothing counted as drawn. In a draw of several cards it's
 * finished, any choice in it answered, before the next card is drawn (rule
 * 614.11a). Applied in `Game.drawCard` instead of any `draws` multiplier on
 * the same draw — of the orders the drawing player could pick (rule 616.1),
 * the engine takes the effect first (AUTHORING §15, "Replacement ordering").
 * The effect mustn't draw a card unless the replacement is `firstEachTurn`
 * (which its own draw then can't meet again). */
export interface DrawReplacedByEffect {
  readonly effect: EffectSpec;
}

/**
 * A mill, made bigger (rule 614.1a) — Bruvac the Grandiloquent's "if an
 * opponent would mill one or more cards, they mill twice that many cards
 * instead" (`who: "opponent"`, `multiplier: 2`), The Water Crystal's "…they
 * mill that many cards plus four instead" (`plus: 4`). `who` is whose mill,
 * relative to this permanent's controller. Several multiply together, then
 * every `plus` adds up, the way `Game.dealDamage` orders damage's (rule 616.1
 * would let the milled player choose, and that order mills fewer).
 */
export interface MillMultiplierReplacement {
  readonly event: "would-mill";
  readonly who: "opponent" | "you" | "any-player" | "enchanted-player";
  readonly multiplier?: number;
  readonly plus?: number;
}

/**
 * Life about to be gained, changed — Bilbo, Birthday Celebrant's "if you
 * would gain life, you gain that much life plus 1 instead" (`who: "you"`,
 * `plus: 1`), and "your opponents can't gain life" (The Lord of Pain —
 * `who: "opponent"`, `prevent: true`; strictly a prohibition, but it stops
 * the same event, lifelink's included). Every `plus` adds up; one `prevent`
 * wins over all of them.
 */
export interface TurnBeginReplacement {
  /**
   * "If [a player] would begin [a turn], that player skips that turn instead"
   * (rules 500.11, 614.1b, 614.10): the turn passes as though it didn't exist,
   * and what waits for "their next turn" goes on waiting (614.10a). Whose it
   * is, read from this permanent's controller: `who`. `extraOnly` is "an extra
   * turn" (Stranglehold). A static's `condition` is "while this artifact is
   * tapped" (Time Vault).
   */
  readonly event: "would-begin-turn";
  readonly who: "you" | "opponent" | "any";
  readonly extraOnly?: true;
  /** "…you may skip that turn instead", asked of that player as it would
   * begin. */
  readonly may?: true;
  /** "If you do, untap this artifact": the first thing that happens in the
   * next turn to actually occur (rule 614.10b, Time Vault's ruling). */
  readonly thenUntapSource?: true;
}

export interface LifeGainReplacement {
  readonly event: "would-gain-life";
  readonly who: "opponent" | "you" | "any-player" | "enchanted-player";
  readonly plus?: number;
  /** "…you gain twice that much life instead" (Rhox Faithmender, Boon
   * Reflection) — applied after every `plus`, the order that gains most. */
  readonly multiplier?: number;
  readonly prevent?: boolean;
  /** With `prevent`, the wording is a replacement — "if a player would gain
   * life, that player gains no life instead" (Sulfuric Vortex) — and not "can't
   * gain life": the gain is still attempted, so an exchange of life totals
   * happens (rule 119.7) and a cost of having them gain life can be paid
   * (Invigorate's rulings). */
  readonly gainsNoLifeInstead?: true;
  /** "…that player loses that much life instead" (Tainted Remedy). The
   * player gaining orders it among the others (rule 616.1) and takes the
   * order best for them: a `prevent` first (nothing happens), else this
   * first — so no `plus` or `multiplier` changes the gain it becomes. */
  readonly becomesLoss?: true;
}

/**
 * Life about to be lost, changed (rule 614.1a) — "if an opponent would lose life
 * during your turn, they lose twice that much life instead" (Bloodletter of
 * Aclazotz: a `your-turn` static `condition`). Every loss is one: from an
 * effect, from damage (rule 119.2, though the damage dealt doesn't change:
 * lifelink reads what was dealt, the card's ruling), a life payment (rule 119.4,
 * and they need only have the amount paid), a life total set lower (119.5), an
 * exchange (701.12c).
 */
export interface LifeLossReplacement {
  readonly event: "would-lose-life";
  readonly who: "opponent" | "you" | "any-player" | "enchanted-player";
  readonly multiplier: number;
}

/**
 * Damage about to be dealt, changed (rule 614.1a) — "if a source would deal
 * damage to a permanent or player, it deals double that damage … instead"
 * (Dictate of the Twin Gods: `multiplier: 2`, any source, any recipient),
 * "if a creature you control that entered this turn would deal damage, it
 * deals twice that much damage instead" (Neriv: `source`), "…it deals that
 * much damage plus 2 instead" (Torbran: `plus`), "…prevent that damage and
 * each opponent mills that many cards" (The Mindskinner: `prevent` + `then`).
 *
 * `source` is a filter on the source of the damage, from this permanent's
 * controller's side (a departed source as it last existed); `to` narrows
 * the recipient: `"opponent"` (an opponent), `"opponent-side"` (an opponent
 * or a permanent an opponent controls), `"you"`, `"player"` (any player —
 * Tok-Tok, Volcano Born), `"self"` (this permanent).
 * Omitted: anyone's damage, to anything.
 *
 * Applied in `Game.dealDamage` in a fixed order — every multiplier, then
 * every `plus`, then the first `prevent` that applies, then prevention
 * shields — where rule 616.1 would let the affected player order them.
 * A `prevent` stops all of it, and `then` is applied as this permanent's
 * controller's effect with `"x"` the damage prevented, `"trigger-object"` the
 * damage's source and `"trigger-recipient"` the one it would have been dealt
 * to (Vigor's "put a +1/+1 counter on that creature").
 */
export interface DamageMultiplierReplacement {
  readonly event: "would-deal-damage";
  readonly multiplier?: number;
  readonly plus?: number;
  /** A `plus` read as the damage would be dealt: "plus X, where X is Hawkeye's
   * power" (`"this-power"`, nothing while that's 0 or less), "plus an amount
   * of damage equal to the number of fire counters on this enchantment" (Fated
   * Firepower: `{ countersOnThis: "fire" }`). */
  readonly plusOf?: "this-power" | { readonly countersOnThis: string };
  /** "…would deal an amount of damage **less than ~'s power** …, that
   * source deals damage equal to ~'s power instead" (Ojer Axonil, Deepest
   * Might) — raised to this permanent's power, never lowered. After the
   * multipliers and additions. */
  readonly atLeast?: "this-power";
  /** Only combat (`true`) or only noncombat (`false`) damage. */
  readonly combat?: boolean;
  readonly prevent?: boolean;
  readonly then?: EffectSpec;
  /** With `prevent` and `then`: "if damage **would be dealt to** this
   * creature" — the replacement applies to a simultaneous damage event once
   * (rule 614.5), so in combat its `then` happens once, after all of it, with
   * "that many" the total (Oathsworn Knight's ruling: two blockers, one
   * counter). Without it, "if a creature **would deal** damage to this
   * creature" applies per source (Ironscale Hydra's ruling: a counter per
   * creature). */
  readonly perEvent?: true;
  /** With `prevent` and `then`: `then`'s "that many" is the damage even
   * when it can't be prevented and so isn't (rule 615.12 — Jared Carthalion,
   * True Heir's ruling). Without it, "x" is the damage actually prevented
   * (Swans of Bryn Argoll's "prevented this way"). */
  readonly thenCountsUnprevented?: true;
  readonly source?: CardFilter;
  /** Only damage **this permanent** would deal — Wolverine, Best There
   * Is's "double all damage Wolverine would deal". */
  readonly fromSelf?: boolean;
  /** Not damage this permanent would deal: "**another** source you control"
   * (Thor, Asgard's Avenger; Jaya, Venerated Firemage). This object and not its
   * name, so a namesake's damage still counts. */
  readonly fromOther?: true;
  /** Only damage the permanent this Aura or Equipment is attached to would
   * deal — Muzzle's "prevent all damage that would be dealt by enchanted
   * creature", Inquisitor's Flail's doubling. */
  readonly fromAttached?: true;
  /** `"your-side"`: you, or a permanent you control (`toFilter` narrowing
   * just the permanents — Hyperion, Supreme Hero's "you or a Hero you
   * control"); `"attached"`: the permanent this Aura or Equipment is
   * attached to (Inviolability, Shield of the Realm); `"enchanted-player"`:
   * the player this Aura is attached to (Curse of Bloodletting). */
  readonly to?: "opponent" | "opponent-side" | "you" | "player" | "self" | "your-side" | "attached" | "enchanted-player";
  /** Not this permanent itself — "**other** permanents you control"
   * (Palisade Giant), "another creature you control" (Vigor). */
  readonly toOther?: true;
  /** A redirection (rule 614.9) instead of a change in amount: all of the
   * damage is dealt by the same source to this permanent (`"self"` —
   * Palisade Giant's "all damage that would be dealt to you and other
   * permanents you control is dealt to this creature instead"), to the
   * permanent it's attached to (`"attached"` — Pariah), or to the
   * recipient's controller (`"recipient-controller"` — Treacherous Link).
   * Does nothing while that isn't a creature, planeswalker or battle on the
   * battlefield, or a player in the game, or is the recipient already; and
   * applies to a damage event once (614.5), so two Palisade Giants don't
   * send it back and forth. */
  readonly redirect?: "self" | "attached" | "recipient-controller";
  /** "Prevent N of that damage" (rule 615.10 — Guardian Seraph's 1, Shield
   * of the Realm's 2): that much of each damage event it applies to. */
  readonly preventAmount?: number;
  /** "Prevent all but N of that damage" (Hyperion, Supreme Hero; Temple
   * Altisaur). */
  readonly preventAllBut?: number;
  /** "Prevent half that damage, rounded up" (Gisela, Blade of Goldnight). */
  readonly preventHalf?: "up" | "down";
  /** "It deals half that damage, rounded down, … instead" (Ghosts of the
   * Innocent): a replacement, not prevention — damage that can't be
   * prevented is still halved. */
  readonly halve?: "down" | "up";
  /** Only when the damage is this much or less — Callous Giant's "if a
   * source would deal 3 or less damage to this creature, prevent that
   * damage". */
  readonly ifAtMost?: number;
  /** Only damage to a permanent matching this filter, from this permanent's
   * controller's side, as it is when the damage would be dealt — Iroas, God
   * of Victory's "prevent all damage that would be dealt to attacking
   * creatures you control" is `{ type: "creature", attacking: true,
   * controlledBy: "you" }` with `prevent`. Never a player. */
  readonly toFilter?: CardFilter;
}
