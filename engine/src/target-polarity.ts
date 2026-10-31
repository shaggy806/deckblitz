/**
 * Which side of the table a target belongs on — what a bot needs to know
 * before it can aim anything.
 *
 * Every other MTG AI has this layer and ours didn't. Forge's AI is ~150
 * per-effect classes, each deciding whom its effect should hit; our bots took
 * the first legal target (v1) or simulated the first eight combinations in
 * that same order (v2). `legalTargets` lists the players in turn order and
 * then the battlefield oldest-first, so "first" was the bot itself or its own
 * oldest permanent: v1 pacified its own creatures, Murdered its own Bears and
 * countered its own spells, and on a four-player board v2 never saw a threat
 * newer than the turn-one lands. See `docs/plans/bot-effect-knowledge.md`.
 *
 * A target slot is **harm** (bad for whoever controls the target — aim it at
 * an opponent), **help** (aim it at your own), **take** (good for you
 * whoever's it is — reanimating onto your side, copying a spell) or
 * **either** (the board decides — a blink, a transform, anything the
 * vocabulary can't read). It is derived from the declarative effect tree, so
 * it covers every card without a list of cards, through a rule per effect kind
 * that is total over `EffectSpec["kind"]`: a new kind fails the build here
 * until someone says which side of the table it belongs on.
 *
 * The strongest effect on a slot decides it. Removal and theft are decisive —
 * whatever rides along with them is a consolation to the victim (Swords to
 * Plowshares' life, Generous Gift's Elephant) — and a major effect outranks a
 * minor one (Sign in Blood's two cards outrank its two life). Effects of one
 * strength that disagree leave the slot to the board: `either`.
 *
 * Pure over card definitions and a `GameState`, with no `bot/` import, so the
 * decision modules may use it too.
 */

import type { ActivatedAbility, TriggeredAbility } from "./abilities.js";
import type { LegalAction } from "./actions.js";
import type { CardRegistry } from "./cards.js";
import type { CardDefinition } from "./cards/define.js";
import { bestowedDefinition, licidDefinition } from "./cards/define.js";
import { computeCharacteristics, playerCantLoseGame, playerCantLoseLife } from "./characteristics.js";
import { matchesFilter } from "./filter.js";
import type { CardFilter } from "./filter.js";
import type { EffectAmount, EffectSpec } from "./effects.js";
import { manaValue, parseManaCost } from "./mana.js";
import type { ObjectId, PlayerId } from "./primitives.js";
import type { GameObject, GameState } from "./state.js";
import { printedCardName } from "./state.js";
import type { TargetRef, TargetSpec } from "./target.js";

export type Polarity = "harm" | "help" | "take" | "either";

/**
 * A deck's own reading of some effect kinds, overriding the table below for
 * every slot those kinds touch — a self-mill deck's `mill: "help"`. The
 * table says which side an effect belongs on for a deck with no plan for it;
 * `deck-bias.ts` holds the decks that have one.
 */
export type PolarityBias = Readonly<Partial<Record<EffectSpec["kind"], Polarity>>>;

/** How much one effect says about a slot — see the module comment. */
const MINOR = 0;
const MAJOR = 1;
const DECISIVE = 2;

interface Touch {
  readonly polarity: Polarity;
  readonly weight: number;
}

interface Visit {
  /** This effect does `polarity` to whatever `ref` names, if it names a
   * target slot. */
  touch(ref: unknown, polarity: Polarity, weight: number): void;
  /** An effect nested inside this one that reads the same target slots. */
  child(effect: EffectSpec | null | undefined): void;
}

type Kind = EffectSpec["kind"];
type Of<K extends Kind> = Extract<EffectSpec, { readonly kind: K }>;
type Rule<K extends Kind> = (node: Of<K>, visit: Visit) => void;

/** Touches no target slot, and holds no effect that does. */
const none = (): void => {};

/** Counters that are bad to have. Everything else a targeted `add-counter`
 * puts in the pool is `+1/+1`, loyalty, a keyword counter or a resource. */
const HARMFUL_COUNTERS: ReadonlySet<string> = new Set(["-1/-1", "blight", "flood", "stun"]);

/** The sign of an amount: a live count is never negative unless it is scaled
 * by a negative `times`, or is a `product` with a negative factor — "-X/-X"
 * is written `{ product: ["x", -1] }` (Necropolis Fiend, Grim Hireling,
 * Defile), and read as a pump until that was handled, so those aimed their
 * shrink at their own creatures. */
function amountSign(amount: EffectAmount): number {
  if (typeof amount === "number") return Math.sign(amount);
  if (typeof amount === "object" && amount !== null && "product" in amount) {
    return amount.product.reduce<number>((sign, factor) => sign * amountSign(factor), 1);
  }
  if (typeof amount === "object" && amount !== null && "times" in amount) {
    const times = (amount as { readonly times?: number }).times;
    if (typeof times === "number" && times < 0) return -1;
  }
  return 1;
}

/**
 * One rule per effect kind: which target slots it touches and how, and which
 * nested effects share its targets.
 *
 * Nested effects that **rebind** target 0 are deliberately not visited:
 * `look-and-choose`, `reveal-top`, `reveal-until` and `choose-permanents`
 * apply `then` to what they found or chose as target 0, a `reflexive-trigger`
 * chooses targets of its own, and a granted ability is a different ability
 * altogether. Reading their slots as the enclosing ability's would aim the
 * wrong way.
 */
const RULES: { readonly [K in Kind]: Rule<K> } = {
  // A rummage or a loot — the same player discarding and drawing the same
  // number, one straight after the other — is card filtering, leaving that
  // player's hand the size it was: it takes neither side, and what else the
  // ability does decides the slot (Memory Worm's 2 damage, then "that player
  // discards a card, then draws a card").
  sequence: (n, v) => {
    const filtering = new Set<number>();
    n.effects.forEach((e, i) => {
      const next = n.effects[i + 1];
      if (next === undefined || filtering.has(i)) return;
      const pair =
        (e.kind === "discard" && next.kind === "draw") || (e.kind === "draw" && next.kind === "discard");
      if (
        pair &&
        "target" in e &&
        "target" in next &&
        e.target !== undefined &&
        e.target === next.target &&
        typeof e.amount === "number" &&
        e.amount === next.amount
      ) {
        filtering.add(i).add(i + 1);
      }
    });
    n.effects.forEach((e, i) => {
      if (!filtering.has(i)) v.child(e);
    });
  },
  "for-each-target": (n, v) => v.child(n.effect),
  "for-each-player": (n, v) => v.child(n.effect),
  // A vote names no target; a `for-each-voted`'s slot 0 is a permanent voted
  // for, not the spell's target 0.
  vote: none,
  "cast-vote": none,
  "for-each-vote": (n, v) => v.child(n.effect),
  "with-choices": (n, v) => v.child(n.effect),
  repeat: (n, v) => v.child(n.effect),
  "for-each-voted": none,
  "for-target": (n, v) => v.child(n.effect),
  // Their slot 0 is a convoking creature, not the spell's target 0.
  "for-each-convoker": none,
  "for-convoker": none,
  "choose-opponent": (n, v) => v.child(n.then),
  "about-player": (n, v) => v.child(n.effect),
  "choose-permanents": none,
  // Its `then` reads the blighted creature as target 0. "Target opponent
  // blights 2" harms the player in that slot.
  blight: (n, v) => {
    if (typeof n.who === "object") v.touch(n.who.target, "harm", MAJOR);
  },
  // Its `then` reads the beheld card or permanent as target 0.
  behold: none,
  bolster: none,
  // Its `then` reads the card it picked as target 0. A card taken from a
  // targeted player's graveyard onto your battlefield costs that player it —
  // Tariel, Reckoner of Souls.
  "choose-random-card": (n, v) => {
    if (typeof n.whose === "number" && n.then.kind === "put-onto-battlefield" && n.then.underYourControl === true) {
      v.touch(n.whose, "harm", MINOR);
    }
  },
  "empower-jace": none,
  damage: (n, v) => {
    v.touch(n.target, "harm", MAJOR);
    v.touch(n.toControllerOfTarget, "harm", MINOR);
    // "Target creature you control deals damage" — the dealer is yours.
    // Not when it deals that damage to its own controller (Traitor's Roar,
    // Ana Battlemage): then the dealer is the opponent's.
    const toOwnController = typeof n.from === "object" && n.from.target === n.toControllerOfTarget;
    if (!toOwnController) v.touch(n.from, "help", MINOR);
  },
  "damage-divided-evenly": (n, v) => v.touch(n.from, "harm", MAJOR),
  "add-mana": none,
  draw: (n, v) => v.touch(n.target, "help", MAJOR),
  "discard-hand": (n, v) => v.touch(n.who, "harm", MAJOR),
  "gain-life": (n, v) => v.touch(n.toControllerOfTarget, "help", MINOR),
  "lose-life": (n, v) => {
    v.touch(n.target, "harm", MINOR);
    v.touch(n.toControllerOfTarget, "harm", MINOR);
  },
  tap: (n, v) => v.touch(n.target, "harm", MINOR),
  untap: (n, v) => v.touch(n.target, "help", MINOR),
  "become-prepared": (n, v) => v.touch(n.target, "help", MINOR),
  destroy: (n, v) => v.touch(n.target, "harm", DECISIVE),
  "put-on-bottom-of-library": (n, v) => v.touch(n.target, "harm", DECISIVE),
  "exile-if-dies-this-turn": (n, v) => v.touch(n.target, "harm", MINOR),
  "shuffle-into-library": (n, v) => v.touch(n.target, "harm", DECISIVE),
  // "… target player controls": that player is the one hurt. "Target X and
  // all other Xs with the same name" (`sameNameAsTarget`), or radiance's
  // "and each other X that shares a color with it" (`sharesColorWithTarget`):
  // the target is.
  "destroy-all": (n, v) => {
    v.touch(n.controlledByTarget, "harm", MAJOR);
    v.touch(n.filter.sameNameAsTarget, "harm", DECISIVE);
    v.touch(n.filter.sharesColorWithTarget, "harm", DECISIVE);
  },
  regenerate: (n, v) => v.touch(n.target, "help", MINOR),
  "regenerate-all": none,
  "damage-all": (n, v) => {
    v.touch(n.from, "help", MINOR);
    // "Each creature target player controls": that player is the one hurt.
    v.touch(n.controlledByTarget, "harm", MAJOR);
    v.touch(n.filter.sameNameAsTarget, "harm", MAJOR);
    v.touch(n.filter.sharesColorWithTarget, "harm", MAJOR);
  },
  "creatures-damage-controllers": none,
  // An edict: the targeted player picks what goes, so it is major rather
  // than decisive — nothing in particular is removed.
  sacrifice: (n, v) => v.touch(n.who === "target" ? 0 : undefined, "harm", MAJOR),
  "sacrifice-target": (n, v) => v.touch(n.target, "harm", DECISIVE),
  "sacrifice-source": (n, v) => v.child(n.then),
  // "Target creature you control fights target creature you don't control":
  // the fighter is the best creature you have, the victim theirs.
  fight: (n, v) => {
    v.touch(n.a, "help", MINOR);
    v.touch(n.b, "harm", MAJOR);
  },
  "return-to-hand": (n, v) => {
    const from = n.from ?? "battlefield";
    // A bounce or a spell sent back is removal; a card back from a
    // graveyard or exile is recursion for its owner.
    if (from === "battlefield" || from === "stack") v.touch(n.target, "harm", DECISIVE);
    else v.touch(n.target, "help", MAJOR);
  },
  "return-to-hand-all": (n, v) => {
    v.touch(n.controlledByTarget, "harm", MAJOR);
    v.touch(n.filter.sameNameAsTarget, "harm", DECISIVE);
    v.touch(n.filter.sharesColorWithTarget, "harm", DECISIVE);
  },
  "exile-all": (n, v) => {
    v.touch(n.controlledByTarget, "harm", MAJOR);
    v.touch(n.filter.sameNameAsTarget, "harm", DECISIVE);
    v.touch(n.filter.sharesColorWithTarget, "harm", DECISIVE);
  },
  exile: (n, v) => {
    v.touch(n.target, "harm", DECISIVE);
    // Haunt (rule 702.55): the creature haunted is the one whose death
    // fires the card again — best an opponent's, the one likelier to die.
    if (n.haunting !== undefined) v.touch(n.haunting, "harm", MINOR);
  },
  "choose-creature-type": (n, v) => v.child(n.then),
  "choose-card-name": (n, v) => {
    if (n.then !== undefined) v.child(n.then);
  },
  // The choice itself touches nothing: what `then` does with it does.
  "choose-value": (n, v) => v.child(n.then),
  "return-exiled-by-source": none,
  "put-onto-battlefield": (n, v) => {
    if (n.underYourControl === true) v.touch(n.target, "take", MAJOR);
    else if (n.under !== undefined && n.under !== "you") v.touch(n.target, "either", MAJOR);
    else v.touch(n.target, "help", MAJOR);
    if (n.under !== undefined && typeof n.under === "object") v.touch(n.under, "help", MINOR);
  },
  "exile-graveyard": (n, v) => v.touch(n.target, "harm", MINOR),
  flicker: (n, v) => v.touch(n.target, "help", MINOR),
  "return-flickered": none,
  counter: (n, v) => v.touch(n.target, "harm", DECISIVE),
  "gain-control": (n, v) => {
    v.touch(n.target, "harm", DECISIVE);
    // "Target opponent gains control of target permanent you control"
    // (Zedruu): the player slot is the one getting something.
    if (n.who !== undefined && typeof n.who === "object") v.touch(n.who, "help", MINOR);
  },
  // "Gain control of all creatures target player controls" (Call for Aid).
  "gain-control-all": (n, v) => v.touch(n.controlledByTarget, "harm", DECISIVE),
  "rotate-control": none,
  // Each one leaves its controller, as `gain-control`'s target does: the
  // permanent of yours you give up and the one of theirs you take.
  "exchange-control": (n, v) => {
    v.touch(n.objects[0], "harm", DECISIVE);
    v.touch(n.objects[1], "harm", DECISIVE);
    v.child(n.then);
    v.child(n.otherwise);
  },
  "exchange-control-all": (n, v) => v.touch(n.with, "harm", DECISIVE),
  "cant-be-sacrificed": (n, v) => v.touch(n.target, "help", MINOR),
  "block-additional": (n, v) => v.touch(n.target, "help", MINOR),
  "attack-despite-defender": (n, v) => {
    if (n.target !== undefined) v.touch(n.target, "help", MINOR);
  },
  "damage-by-toughness": (n, v) => v.touch(n.target, "help", MINOR),
  // Its damage gets past its blockers (Outmaneuver).
  "assign-as-though-unblocked": (n, v) => {
    if (n.target !== undefined) v.touch(n.target, "help", MINOR);
  },
  // Usually the price of an "if you do" (Farrel's Zealot): a cost to the
  // creature's own controller.
  "assigns-no-combat-damage": (n, v) => v.touch(n.target, "harm", MINOR),
  "attack-random-opponent": (n, v) => {
    v.touch(n.target, "either", MINOR);
    v.child(n.else);
  },
  // A commander a delayed trigger takes home (Hellkite Courser): the
  // controller's own, sent back as the card says, never a choice to weigh.
  "put-in-command-zone": (n, v) => v.touch(n.target, "either", MINOR),
  // Its own source in print (Tree of Redemption); which way it cuts turns
  // on the numbers, not the side of the table.
  "exchange-life-toughness": (n, v) => {
    v.touch(n.target, "either", MINOR);
    // Tree of Perdition's target opponent: a life total of 13 is a cut
    // from 40 and a gift at 5.
    if (n.player !== undefined && typeof n.player === "object") v.touch(n.player, "either", MAJOR);
  },
  mill: (n, v) => v.touch(n.target, "harm", MINOR),
  // A refill for a self-mill deck, an answer to a graveyard deck: either way.
  "shuffle-graveyard-into-library": (n, v) => v.touch(n.target, "either", MINOR),
  "skip-next-untap": (n, v) => v.touch(n.who, "harm", MINOR),
  "skip-untap-step": (n, v) => v.touch(n.who, "harm", MINOR),
  "skip-step": (n, v) => v.touch(n.who, "harm", MINOR),
  "exile-from-library": (n, v) => v.touch(n.whose, "harm", MINOR),
  "return-from-graveyard": none,
  // A delayed ability acts on the targets its creator chose (rule 603.7c): it
  // has none of its own, its text not saying "target" (115.10a).
  // One watching a target leave and bringing it back ("when that creature
  // dies this turn, return that card to the battlefield" — Graceful
  // Reprieve) is a save for that slot.
  "delayed-trigger": (n, v) => {
    const at = n.at;
    if (typeof at === "object" && "leaves" in at && typeof at.leaves === "number") {
      const back = n.effect.kind === "put-onto-battlefield" || n.effect.kind === "return-to-hand";
      if (back) v.touch(at.leaves, "help", MAJOR);
    }
    v.child(n.effect);
  },
  "enters-with-counters": (n, v) => v.touch(n.target, "help", MINOR),
  "allow-cast-from-exile": (n, v) => v.touch(n.target, "take", MAJOR),
  "cast-now": (n, v) => {
    v.touch(n.from === "targets" ? EVERY_SLOT : n.target, "take", MAJOR);
    v.child(n.then);
    v.child(n.else);
  },
  earthbend: (n, v) => v.touch(n.target, "help", MAJOR),
  ninjutsu: none,
  "gain-class-level": none,
  "unlock-door": (n, v) => v.touch(n.target, "help", MINOR),
  "set-door": none,
  "reflexive-trigger": none,
  "put-on-library": (n, v) => v.touch(n.target, "help", MINOR),
  discard: (n, v) => v.touch(n.target, "harm", MAJOR),
  "discard-chosen": (n, v) => v.touch(n.target, "harm", MAJOR),
  // Seeing a hidden hand: point it at an opponent.
  "look-at-hand": (n, v) => v.touch(n.target, "harm", MINOR),
  // Showing everyone a hidden hand, as `look-at-hand`.
  "reveal-hand": (n, v) => v.touch(n.who, "harm", MINOR),
  "modify-pt": (n, v) => {
    const power = amountSign(n.power);
    const toughness = amountSign(n.toughness);
    if (toughness < 0) v.touch(n.target, "harm", MAJOR);
    else if (power < 0) v.touch(n.target, "harm", MINOR);
    else if (power > 0 || toughness > 0) v.touch(n.target, "help", MAJOR);
  },
  "modify-pt-all": (n, v) => {
    const shrinks = amountSign(n.toughness) < 0 || amountSign(n.power) < 0;
    v.touch(n.controlledByTarget, shrinks ? "harm" : "help", MINOR);
    v.touch(n.filter.sameNameAsTarget, shrinks ? "harm" : "help", MAJOR);
    v.touch(n.filter.sharesColorWithTarget, shrinks ? "harm" : "help", MAJOR);
  },
  "double-pt-all": none,
  // A switch kills a 0-power wall or lets a 1/4 hit for 4: which side it
  // belongs on is the creature's.
  "switch-pt": (n, v) => v.touch(n.target, "either", MAJOR),
  "double-counters-all": none,
  "double-counters": (n, v) => v.touch(n.target, "help", MAJOR),
  // Radiance's "target creature and each other creature that shares a color
  // with it gain haste" (Surge of Zeal) leans as `grant-keyword` does.
  "grant-keyword-all": (n, v) => {
    const lean = n.keyword === "defender" ? "harm" : "help";
    v.touch(n.filter.sameNameAsTarget, lean, MAJOR);
    v.touch(n.filter.sharesColorWithTarget, lean, MAJOR);
    v.touch(n.controlledByTarget, lean, MINOR);
  },
  "add-counter": (n, v) =>
    v.touch(n.target, HARMFUL_COUNTERS.has(n.counter) ? "harm" : "help", MAJOR),
  // "On each creature target player controls" (Meadowboon): that player's.
  "add-counter-all": (n, v) =>
    v.touch(n.controlledByTarget, HARMFUL_COUNTERS.has(n.counter) ? "harm" : "help", MINOR),
  // The reverse of `add-counter`: losing a harmful counter helps.
  // Every kind at once (`"any"` — Vampire Hexmage) reads as the loyalty and
  // +1/+1 counters it nearly always takes: a harm, like a good kind's.
  "remove-counter": (n, v) =>
    v.touch(n.target, n.counter !== "any" && HARMFUL_COUNTERS.has(n.counter) ? "help" : "harm", MAJOR),
  "remove-counter-all": none,
  // Chosen counters off a target (Gremlin Mine): the same lean.
  "remove-counters": (n, v) => {
    if (n.target !== undefined) v.touch(n.target, HARMFUL_COUNTERS.has(n.counter) ? "help" : "harm", MAJOR);
  },
  // A counter taken from one onto the other: the kind chosen as it resolves
  // when unnamed, read as a good one.
  "move-counters": (n, v) => {
    const harmful = n.counter !== undefined && HARMFUL_COUNTERS.has(n.counter);
    v.touch(n.from, harmful ? "help" : "harm", MINOR);
    v.touch(n.to, harmful ? "harm" : "help", MAJOR);
    v.child(n.ifMoved);
  },
  // Whatever it had — read as the +1/+1 counters it nearly always is.
  "put-counters-of": (n, v) => v.touch(n.target, "help", MAJOR),
  // Card selection and maybe a counter, for the conniving permanent's side.
  connive: (n, v) => v.touch(n.target, "help", MAJOR),
  // A land to its controller's hand or a +1/+1 counter on it: theirs.
  explore: (n, v) => v.touch(n.target, "help", MAJOR),
  "grant-player-hexproof": none,
  "grant-spells-this-turn": none,
  populate: none,
  amass: none,
  monstrosity: none,
  renown: none,
  // It won't untap: a cost when it's your own, a drawback on someone else's.
  exert: (n, v) => v.touch(n.target, "harm", MINOR),
  proliferate: (n, v) => v.child(n.then),
  "time-travel": none,
  // Its card is never a target: a card found, the spell itself, or the
  // cards exiled this way.
  "give-suspend": none,
  "grant-keyword": (n, v) =>
    n.keyword === "defender"
      ? v.touch(n.target, "harm", MINOR)
      : v.touch(n.target, "help", MAJOR),
  "grant-toxic": (n, v) => v.touch(n.target, "help", MINOR),
  "grant-protection": (n, v) => v.touch(n.target, "help", MAJOR),
  incubate: none,
  // Out of combat: an opponent's attacker or blocker, or one's own attacker
  // saved from a block — the board's call, or the card's own `whose`.
  "remove-from-combat": none,
  // Losing a keyword hurts — but losing defender helps (Jaded Analyst).
  "lose-keywords": (n, v) => {
    const side = n.keywords.every((k) => k === "defender") ? "help" : "harm";
    if (n.target !== undefined) v.touch(n.target, side, MINOR);
    // "Creatures target opponent controls lose first strike" (Quick Draw).
    if (n.controlledByTarget !== undefined) v.touch(n.controlledByTarget, side, MINOR);
  },
  "player-effect": none,
  // "You win" has no target; "target opponent loses the game" harms it.
  "win-game": none,
  "lose-game": (n, v) => v.touch(n.target, "harm", MAJOR),
  "roll-dice": (n, v) => {
    for (const row of n.table ?? []) v.child(row.effect);
    if (n.then) v.child(n.then);
  },
  "flip-coin": (n, v) => {
    v.child(n.won);
    v.child(n.lost);
  },
  clash: (n, v) => {
    v.child(n.won);
    v.child(n.lost);
    v.child(n.repeat);
  },
  prohibit: (n, v) => {
    v.touch(n.target, "harm", MINOR);
    v.touch(n.who, "harm", MINOR);
  },
  detain: (n, v) => v.touch(n.target, "harm", MINOR),
  // Bound to block: a provoked creature is usually walked into a bad block.
  "block-if-able": (n, v) => v.touch(n.target, "harm", MINOR),
  restrict: (n, v) => {
    const lure = (r: string): boolean => r === "must-be-blocked" || r === "must-be-blocked-if-able";
    const helps = n.restrictions.some(lure) || n.cantBeBlockedBy !== undefined;
    const hurts = n.restrictions.some((r) => !lure(r));
    v.touch(n.target, helps && hurts ? "either" : helps ? "help" : "harm", MINOR);
  },
  "grant-flashback": (n, v) => v.touch(n.target, "help", MAJOR),
  "grant-flashback-all": none,
  "grant-graveyard-cast": (n, v) => v.touch(n.target, "help", MAJOR),
  "grant-triggered": (n, v) => v.touch(n.target, "help", MAJOR),
  "lose-abilities": (n, v) => v.touch(n.target, "harm", MAJOR),
  "lose-abilities-all": none,
  gift: none,
  "grant-activated": (n, v) => v.touch(n.target, "help", MAJOR),
  // A gained static is a gift ("can't be blocked by more than one creature")
  // unless it ties the creature down ("doesn't untap", "loses flying").
  "grant-static": (n, v) => {
    const a = n.ability;
    const lure = (r: string): boolean => r === "must-be-blocked" || r === "must-be-blocked-if-able";
    const harms =
      (a.restrictions ?? []).some((r) => !lure(r)) || (a.loseKeywords ?? []).length > 0 || a.doesntUntap === true;
    v.touch(n.target, harms ? "harm" : "help", MAJOR);
  },
  "grant-activated-all": none,
  "grant-triggered-all": none,
  "take-extra-turn": (n, v) => v.touch(n.target, "help", MAJOR),
  storm: none,
  cascade: none,
  discover: none,
  "craft-return": none,
  // Its `then` sees the card found as target 0, not the enclosing slot 0.
  "reveal-until": (n, v) => v.touch(n.whose, "harm", MINOR),
  // The copy is yours whoever cast the original. A copy aimed at a target
  // slot (Zada's order) aims it at your own permanent.
  "copy-spell": (n, v) => {
    v.touch(n.target, "take", MAJOR);
    if (typeof n.retargetTo === "number") v.touch(n.retargetTo, "help", MAJOR);
  },
  // An ability you'd want twice is yours: every card copying one says "you
  // control".
  "copy-ability": (n, v) => v.touch(n.target, "help", MAJOR),
  // Turning a spell or ability aside is done to someone else's — the removal
  // aimed at your creature (Bolt Bend, Deflecting Swat, Spellskite).
  "change-targets": (n, v) => v.touch(n.target, "harm", MAJOR),
  "exile-spell-as-it-resolves": none,
  // A plotted card is its owner's to cast free: always one's own card.
  "become-plotted": (n, v) => v.touch(n.target, "help", MINOR),
  // Its `then` names the exiled cards, never a target.
  "collect-evidence": none,
  solve: none,
  "additional-combat": none,
  "additional-upkeep-steps": none,
  "additional-land-drop": none,
  "shuffle-library": none,
  foraged: none,
  // The split's targets take the damage (Inferno Titan, Electrolyze).
  "damage-divided": (n, v) => v.touch(n.from, "harm", MAJOR),
  // +1/+1 counters help; a stun counter (Crashing Wave) harms.
  "counters-divided": (n, v) => v.touch(n.from, n.counter === "+1/+1" ? "help" : "harm", MAJOR),
  "untap-all": (n, v) => {
    v.touch(n.controlledByTarget, "help", MINOR);
    v.touch(n.filter.sharesColorWithTarget, "help", MINOR);
  },
  "tap-all": (n, v) => {
    v.touch(n.controlledByTarget, "harm", MINOR);
    v.touch(n.filter.sharesColorWithTarget, "harm", MINOR);
  },
  // Phasing out is a blocker gone for a turn when it's theirs (rule
  // 702.26b) — read as that, a minor harm; one that can only be yours says
  // so in its spec (Guardian of Faith, Haystack), and a counter put on first
  // outranks it (Slip Out the Back). "Each creature target player
  // controls": theirs.
  "phase-out": (n, v) => {
    v.touch(n.target, "harm", MINOR);
    v.touch(n.controlledByTarget, "harm", MINOR);
  },
  // Turn to Frog is removal; a man-land, Suit Up or Water Wings a boost. What
  // says which: losing abilities or a tiny base (Multiply by Zero's 0/0) is
  // harm; keywords, a big base or becoming a creature is help. A middling
  // base on a creature (Fractalize's X+1) is still the board's call.
  animate: (n, v) => v.touch(n.target, animatePolarity(n), MAJOR),
  "add-types": (n, v) => v.touch(n.target, "either", MINOR),
  "animate-all": none,
  // "Its controller creates a 3/3 Beast" rides on the removal it follows.
  // Reality Shift's manifest is the consolation for the creature exiled: it
  // aims at nothing.
  manifest: none,
  "manifest-dread": none,
  "create-token": (n, v) => v.touch(n.who === "target-controller" ? 0 : undefined, "help", MINOR),
  // A copy goes to the copied permanent's controller unless the card says
  // it's yours (Hate Mirage).
  "create-token-copy": (n, v) => v.touch(n.of, n.who === "you" ? "take" : "help", MAJOR),
  // The Aura or Equipment moved is put to work for whoever it ends up on
  // (Swordsman, Sharp Scoundrel's "attach target Equipment you control").
  attach: (n, v) => {
    v.touch(n.target, "help", MINOR);
    v.touch(n.attachment, "help", MINOR);
  },
  // Reconfigure's unattach is its own source: no target to place.
  unattach: none,
  // A Licid's: which way depends on what the Aura does — `offerPolarities`
  // reads its statics for that (`auraPolarity`).
  "become-licid-aura": (n, v) => v.touch(n.target, "either", MINOR),
  transform: (n, v) => v.touch(n.target, "either", MINOR),
  flip: (n, v) => v.touch(n.target, "either", MINOR),
  // What becomes the copy, and what it copies: either may be anyone's
  // (Mirage Mirror copies an opponent's best; Shuri, two of your own). What
  // the source itself becomes a copy of is the best of anyone's (Muddle).
  "become-copy": (n, v) => {
    v.touch(n.target, "either", MINOR);
    v.touch(n.of, n.target === "source" ? "take" : "either", MINOR);
  },
  "day-night": none,
  "become-monarch": none,
  "take-initiative": none,
  "mutate-merge": none,
  venture: none,
  // Its controller's own speed: no slot.
  "increase-speed": none,
  "the-ring-tempts-you": none,
  // Slot 0 is the creature chosen, not the enclosing ability's target.
  "become-ring-bearer": none,
  pair: none,
  "ring-tempted": none,
  // Poison and rad counters hurt their player (rad mills and drains, rule
  // 728.1); experience helps.
  "add-player-counters": (n, v) =>
    n.counter === "poison" || n.counter === "rad"
      ? v.touch(n.target, "harm", MAJOR)
      : v.touch(n.target, "help", MINOR),
  "remove-player-counters": (n, v) =>
    n.counter === "experience" ? v.touch(n.target, "harm", MINOR) : v.touch(n.target, "help", MINOR),
  "get-energy": none,
  "create-emblem": none,
  epic: none,
  "prevent-all-combat-damage": none,
  "prevent-damage-to-you": none,
  // The damage prevented is dealt to `redirectTo` instead (Nomads en-Kor,
  // Outrider en-Kor): that slot takes the hit.
  "prevent-damage": (n, v) => {
    v.touch(n.target, "help", MINOR);
    if (n.redirectTo !== undefined) v.touch(n.redirectTo, "harm", MINOR);
  },
  "prevent-damage-from-chosen-source": (n, v) => {
    if (typeof n.to === "number") v.touch(n.to, "help", MINOR);
  },
  "damage-cant-be-prevented": none,
  // Damage kept off a target helps it; damage a target would deal, stopped,
  // hurts it (Kor Haven's attacker); where a redirection sends it takes the
  // hit.
  "damage-rule": (n, v) => {
    if (n.redirectTo !== undefined) {
      if (n.redirectTo !== "source-controller" && n.redirectTo !== "source-itself") v.touch(n.redirectTo, "harm", MINOR);
    } else if (n.to?.target !== undefined) {
      v.touch(n.to.target, "help", MINOR);
    }
    if (n.by?.target !== undefined) v.touch(n.by.target, "harm", MINOR);
    v.child(n.then);
  },
  // A colour isn't good or bad by itself: what it's for (dodging a Circle of
  // Protection, or walking into one) decides.
  "become-color": none,
  // An announced modal ability's modes bring targets of their own, known
  // only once chosen — see `pendingTargetPolarities`.
  modal: (n, v) => {
    if (n.announced === true) return;
    n.modes.forEach((mode) => v.child(mode.effect));
  },
  conditional: (n, v) => {
    v.child(n.then);
    v.child(n.else);
  },
  may: (n, v) => {
    v.child(n.effect);
    v.child(n.then);
    v.child(n.else);
  },
  // A punisher: whoever chooses pays or suffers.
  unless: (n, v) => {
    v.touch(typeof n.chooser === "number" ? n.chooser : undefined, "harm", MINOR);
    v.child(n.otherwise);
  },
  "each-player-may": (n, v) => {
    // "Target player may …" (partner with's search): the choice is theirs,
    // so being offered it is help — minor, so a punisher in `ifDidnt`
    // outranks it.
    if (typeof n.who === "object" && "controllerOfTarget" in n.who) v.touch(n.who.controllerOfTarget, "help", MINOR);
    v.child(n.effect);
    v.child(n.ifDid);
    v.child(n.ifDidnt);
    (n.choices ?? []).forEach((choice) => v.child(choice.effect));
  },
  ward: none,
  "sacrifice-all-but": none,
  "keep-total-power": none,
  // Separating a targeted player's permanents (Liliana of the Veil) takes
  // from them; a targeted separator or chooser (Fortune's Favor's opponent)
  // is only asked.
  "separate-into-piles": (n, v) => {
    if (typeof n.objects === "object" && "whose" in n.objects && typeof n.objects.whose === "object" && "target" in n.objects.whose) {
      v.touch(n.objects.whose.target, "harm", MAJOR);
    }
    if (n.objects === "targets") v.touch(EVERY_SLOT, "help", MINOR);
    if (typeof n.chosen === "object") v.child(n.chosen.effect);
    if (typeof n.rest === "object") v.child(n.rest.effect);
  },
  "sacrifice-all": none,
  "choose-exiled-to-play": none,
  "put-exiled-this-way-onto-battlefield": none,
  "put-arrived-onto-battlefield": none,
  "reveal-until-count": none,
  encore: none,
  goad: (n, v) => v.touch(n.target, "harm", MINOR),
  // Menace and can't block: a drawback on a blocker, a boon on an attacker.
  suspect: (n, v) => v.touch(n.target, "either", MINOR),
  unsuspect: (n, v) => v.touch(n.target, "either", MINOR),
  // Saddled only switches on its own Mount's "while saddled" abilities.
  "become-saddled": (n, v) => v.touch(n.target, "help", MINOR),
  "attack-requirement": none,
  // Exiling the top of a targeted player's library (Rashmi and Ragavan) is
  // taken from them.
  "impulse-exile": (n, v) => v.touch(n.whose, "harm", MINOR),
  scry: (n, v) => v.child(n.then),
  "reveal-top": none,
  "reveal-drawn": none,
  "put-into-graveyard": none,
  surveil: (n, v) => v.child(n.then),
  // "Its controller may search their library for a basic land" (Path to
  // Exile) — a consolation, like the life of Swords to Plowshares.
  // Searching a targeted player's library, or the zones of a target's owner
  // or controller (Extract, Surgical Extraction), takes from them.
  "search-library": (n, v) => {
    v.touch(n.who?.controllerOfTarget, "help", MINOR);
    const whose = n.whose;
    if (typeof whose !== "object") return;
    v.touch("target" in whose ? whose.target : "controllerOfTarget" in whose ? whose.controllerOfTarget : whose.ownerOfTarget, "harm", MINOR);
  },
  // Choosing among its own targets (Sepulchral Primordial's cards from
  // opponents' graveyards, put onto the battlefield under your control).
  "look-and-choose": (n, v) => {
    if (n.zone === "targets") v.touch(EVERY_SLOT, "take", MAJOR);
    // Another player's library: what's taken from it ("put one of them into
    // their graveyard", "exile one of them") is a loss for them; a look or
    // reorder alone (Portent) is anyone's to use.
    if (n.from !== undefined && (n.destination === "graveyard" || n.destination.startsWith("exile"))) {
      v.touch(n.from, "harm", MAJOR);
    }
  },
};

/** Every target slot an effect over "its targets" can name — more than any
 * card has. */
const EVERY_SLOT: readonly number[] = Array.from({ length: 8 }, (_, i) => i);

/** The target slots `ref` names: a slot index, several, an "any number of"
 * group's first slot, a player slot (`{ target }`), or an edict's
 * `"target"`, which is its one player slot. */
function slotsOf(ref: unknown): readonly number[] {
  if (typeof ref === "number") return [ref];
  if (Array.isArray(ref)) return ref.filter((x): x is number => typeof x === "number");
  if (typeof ref === "object" && ref !== null) {
    const slot = (ref as { readonly from?: unknown; readonly target?: unknown }).from ??
      (ref as { readonly target?: unknown }).target;
    return typeof slot === "number" ? [slot] : [];
  }
  return [];
}

function resolveSlot(touches: readonly Touch[]): Polarity {
  if (touches.length === 0) return "either";
  const top = Math.max(...touches.map((t) => t.weight));
  const agreed = new Set(touches.filter((t) => t.weight === top).map((t) => t.polarity));
  return agreed.size === 1 ? [...agreed][0] : "either";
}

/**
 * The polarity of each of `count` target slots of `effect`, by slot index.
 * A slot no effect touches is `either`.
 */
export function slotPolarities(
  effect: EffectSpec | null | undefined,
  count: number,
  bias?: PolarityBias,
): readonly Polarity[] {
  return slotTouches(effect, count, bias).map(resolveSlot);
}

/** How much a slot's deciding effect weighs: 0 minor (a tap, two life), 1
 * major (a card, a pump), 2 decisive (removal, theft). */
export type SlotStrength = 0 | 1 | 2;

/**
 * Each slot's polarity with the weight of the effects that decided it, or
 * `null` for a slot no effect touches — what `effect-worth.ts` needs to say
 * how much a target on the wrong side costs, not just which side it is.
 */
export function slotStrengths(
  effect: EffectSpec | null | undefined,
  count: number,
  bias?: PolarityBias,
): readonly ({ readonly polarity: Polarity; readonly weight: SlotStrength } | null)[] {
  return slotTouches(effect, count, bias).map((touches) =>
    touches.length === 0
      ? null
      : {
          polarity: resolveSlot(touches),
          weight: Math.max(...touches.map((t) => t.weight)) as SlotStrength,
        },
  );
}

function slotTouches(
  effect: EffectSpec | null | undefined,
  count: number,
  bias?: PolarityBias,
): Touch[][] {
  const touches: Touch[][] = Array.from({ length: count }, () => []);
  // The kind whose rule is touching right now, for `bias`. A child's walk
  // sets its own and puts this one back.
  let kind: Kind | null = null;
  const visit: Visit = {
    touch(ref, polarity, weight) {
      const side = (kind !== null ? bias?.[kind] : undefined) ?? polarity;
      for (const slot of slotsOf(ref)) {
        if (slot >= 0 && slot < count) touches[slot].push({ polarity: side, weight });
      }
    },
    child(nested) {
      if (nested !== null && nested !== undefined) walk(nested);
    },
  };
  const walk = (node: EffectSpec): void => {
    const outer = kind;
    kind = node.kind;
    (RULES[node.kind] as (n: EffectSpec, v: Visit) => void)(node, visit);
    kind = outer;
  };
  if (effect !== null && effect !== undefined && count > 0) walk(effect);
  return touches;
}

/**
 * What an Aura does to the permanent (or player) it enchants — slot 0 of
 * casting it. Read off its `attached` statics: a combat restriction, a
 * shrink, a lost untap step or "defender" hurts; a pump, a keyword or a
 * granted ability helps. A Curse enchants the player it punishes, and an Aura
 * that steals what it enchants (Mind Control) is theft.
 */
/** Which way an `animate` points at its target — see the table's entry. */
function animatePolarity(n: Extract<EffectSpec, { kind: "animate" }>): Polarity {
  if (n.loseAbilities === true) return "harm";
  const fixed = (a: unknown): number | null => (typeof a === "number" ? a : null);
  const power = fixed(n.power);
  const toughness = fixed(n.toughness);
  const keywords = (n.keywords ?? []).filter((k) => k !== "defender");
  if (power !== null && toughness !== null && power + toughness <= 2 && keywords.length === 0) return "harm";
  if (keywords.length > 0) return "help";
  if (power !== null && power >= 4) return "help";
  if ((n.addTypes ?? []).includes("creature")) return "help";
  return "either";
}

/** A granted triggered ability that costs the creature's controller — Clawing
 * Torment's "at the beginning of your upkeep, you lose 1 life". */
function grantedTriggerHarms(ability: { readonly effect: EffectSpec | null }): boolean {
  const e = ability.effect;
  if (e === null) return false;
  if (e.kind === "lose-life") return !("target" in e) || e.target === undefined;
  return e.kind === "damage" && (e as { who?: unknown }).who === "you";
}

export function auraPolarity(def: CardDefinition): Polarity {
  if (def.controlEnchanted) return "harm";
  if ((def.subtypes ?? []).includes("Curse")) return "harm";
  let harm = false;
  let help = false;
  for (const ability of def.static ?? []) {
    // The Magemarks' "creatures you control that are enchanted get …": the
    // Aura's own creature is one of them only while it's yours, so it reads
    // as an Aura on what it enchants.
    const ownEnchanted =
      ability.affects.scope === "filter" &&
      ability.affects.filter.enchanted === true &&
      ability.affects.filter.controlledBy === "you";
    if (ability.affects.scope !== "attached" && !ownEnchanted) continue;
    // Goad is the point of an Aura that goads: its pump is the consolation
    // that sends the creature at someone else (Psychic Impetus).
    if (ability.goads === true) return "harm";
    // "Enchanted creature loses all abilities and is a 1/1 Frog" (Frogify,
    // Lignify): whatever it gets beside, the loss is the point — even a 3/3
    // Elk (Kenrith's Transformation) is a lock on a commander.
    if (ability.loseAllAbilities === true) return "harm";
    // A Zendikon's "enchanted land is a 3/3 black Ooze creature": a land
    // made a creature fights for its controller, whatever it can't do —
    // Guardian Zendikon's defender is a wall's, not a penalty.
    if ((ability.addTypes ?? []).includes("creature") && ability.setBasePt !== undefined) return "help";
    // "Gets +2/+2 and can't block" (Maniacal Rage): an attacker's Aura — the
    // pump is the point, the lost block its price.
    const pumped = ability.grantPt !== undefined && ability.grantPt[0] + ability.grantPt[1] > 0;
    for (const restriction of ability.restrictions ?? []) {
      if (restriction === "must-be-blocked" || restriction === "must-be-blocked-if-able") help = true;
      else if (!(restriction === "cant-block" && pumped)) harm = true;
    }
    if (ability.grantPt !== undefined) {
      const sum = ability.grantPt[0] + ability.grantPt[1];
      if (sum < 0) harm = true;
      else if (sum > 0) help = true;
    }
    for (const keyword of ability.grantKeywords ?? []) {
      if (keyword === "defender") harm = true;
      else help = true;
    }
    // "Enchanted creature loses flying" (Grounded).
    if ((ability.loseKeywords ?? []).length > 0) harm = true;
    // A granted "untap this permanent" is the way out of the Aura's own lock
    // (Psychic Overload's "discard two artifact cards: untap this"), not a gift.
    const escapes = (ability.grantsActivated ?? []).every(
      (granted) => granted.effect?.kind === "untap" && granted.effect.target === "source",
    );
    if ((ability.grantsActivated ?? []).length > 0 && !escapes) help = true;
    for (const granted of ability.grantsTriggered ?? []) {
      if (grantedTriggerHarms(granted)) harm = true;
      else help = true;
    }
    if (ability.grantPtPerCount !== undefined) help = true;
    if (ability.protection !== undefined || ability.cantBeSacrificed === true) help = true;
    if (ability.doesntUntap === true || ability.cantAttackController === true) harm = true;
    if (ability.prohibits !== undefined) harm = true;
  }
  // Nothing in its statics: what its own "enchanted creature" triggers do to
  // that creature — Bestial Fury's "+4/+0 and trample when it becomes
  // blocked", False Demise's "return that card under your control".
  if (!harm && !help) {
    for (const ability of def.triggered ?? []) {
      // Any trigger that destroys what it enchants — Yoke of the Damned's
      // "when a creature dies, destroy enchanted creature" — or has its
      // controller sacrifice it, among other things: Parasitic Implant's upkeep
      // "enchanted creature's controller sacrifices it and you create a Myr".
      const steps = ability.effect?.kind === "sequence" ? ability.effect.effects : ability.effect ? [ability.effect] : [];
      if (steps.some((e) => (e.kind === "destroy" || e.kind === "sacrifice-target") && e.target === "attached")) harm = true;
      // Or offers to, as one mode — Quiet Disrepair's upkeep "destroy
      // enchanted permanent; or you gain 2 life".
      if (
        ability.effect?.kind === "modal" &&
        ability.effect.modes.some((m) => m.effect.kind === "destroy" && m.effect.target === "attached")
      ) {
        harm = true;
      }
      // Each upkeep of the enchanted permanent's controller, that player is
      // hurt — Parasitic Bond's 2 damage, Power Taint's "loses 2 life unless
      // they pay {2}".
      if (enchantedControllersTurn(ability.whileCondition) && hurtsActivePlayer(ability.effect)) harm = true;
      if (!("who" in ability.trigger) || ability.trigger.who !== "attached") continue;
      // "Whenever enchanted creature deals damage to a creature, destroy
      // that creature" (Venomous Fangs), or tap or exile it: a weapon for it.
      if (
        (ability.effect?.kind === "destroy" || ability.effect?.kind === "tap" || ability.effect?.kind === "exile") &&
        ability.effect.target === "trigger-recipient"
      ) {
        help = true;
      }
      // The enchanted permanent's controller pays — Corrupted Roots' "whenever
      // enchanted land becomes tapped, its controller loses 2 life".
      if (ability.effect?.kind === "lose-life" && ability.effect.who === "trigger-controller") harm = true;
      // The enchanted creature changes hands — Fractured Loyalty's "whenever
      // enchanted creature becomes the target of a spell or ability, that
      // spell or ability's controller gains control of that creature": its
      // controller is the one who stands to lose it.
      if (
        ability.effect?.kind === "gain-control" &&
        (ability.effect.target === "attached" || ability.effect.target === "trigger-object")
      ) {
        harm = true;
      }
      const lean = attachedTriggerLean(ability.effect);
      if (lean === "help") help = true;
      else if (lean === "harm") harm = true;
      // Otherwise a reward for the enchanted creature connecting — Necromantic
      // Thirst's "whenever enchanted creature deals combat damage to a player,
      // you may return target creature card": an attacker's Aura.
      else if (ability.trigger.on === "deals-combat-damage-to-player") help = true;
    }
  }
  // Still nothing: what its triggers give the enchanted permanent whatever
  // sets them off — Forced Adaptation's upkeep +1/+1 counter, Verdant
  // Haven's extra mana — and, failing that, an Aura that may enchant only
  // its caster's own permanent (Dying Wish, Murder Investigation).
  if (!harm && !help) {
    for (const ability of def.triggered ?? []) {
      const effect = ability.effect;
      if (effect?.kind === "add-counter" && effect.target === "attached" && effect.counter === "+1/+1") help = true;
      if (effect?.kind === "add-mana" && "who" in ability.trigger && ability.trigger.who === "attached") help = true;
    }
    const slot = def.targets[0];
    if (slot === "creature-you-control" || (typeof slot === "object" && "whose" in slot && slot.whose === "you")) help = true;
  }
  // Still nothing: what its activated abilities and other triggers do to "enchanted creature" —
  // Crown of Flames' "{R}: enchanted creature gets +1/+0", Sadistic Glee's
  // "whenever a creature dies, put a +1/+1 counter on enchanted creature".
  if (!harm && !help) {
    for (const ability of [...(def.activated ?? []), ...(def.triggered ?? [])]) {
      const lean = enchantedLean(ability.effect);
      if (lean === "help") help = true;
      else if (lean === "harm") harm = true;
    }
  }
  return harm === help ? "either" : harm ? "harm" : "help";
}

/** A trigger condition that holds only on the turn of whoever controls what
 * the source enchants: "the upkeep of enchanted creature's controller". */
function enchantedControllersTurn(condition: TriggeredAbility["whileCondition"]): boolean {
  if (condition === undefined || condition.kind !== "source") return false;
  const host = condition.filter.attachedTo;
  return typeof host === "object" && host !== null && "controlledBy" in host && host.controlledBy === "active-player";
}

/** Damage to, or life lost by, the active player — paid off or not. */
function hurtsActivePlayer(effect: EffectSpec | null): boolean {
  if (effect === null) return false;
  if (effect.kind === "unless") return hurtsActivePlayer(effect.otherwise);
  return (effect.kind === "damage" || effect.kind === "lose-life") && "who" in effect && effect.who === "active-player";
}

/** Which way an effect aimed at the Aura's `attached` permanent leans, or
 * null when it doesn't touch it (a pump or a +1/+1 counter helps, a shrink
 * or a -1/-1 counter harms). */
function enchantedLean(effect: EffectSpec | null): "help" | "harm" | null {
  if (effect === null) return null;
  if (effect.kind === "sequence") {
    // Taking the enchanted permanent is the point, whatever comes with it —
    // Frenzied Fugue's and Wellspring's "untap it" serve the thief.
    if (effect.effects.some((e) => e.kind === "gain-control" && e.target === "attached")) return "harm";
    const leans = effect.effects.map(enchantedLean).filter((l) => l !== null);
    return leans.length > 0 && leans.every((l) => l === leans[0]) ? leans[0] : null;
  }
  if (!("target" in effect) || effect.target !== "attached") return null;
  switch (effect.kind) {
    case "modify-pt": {
      const sum = (typeof effect.power === "number" ? effect.power : 0) + (typeof effect.toughness === "number" ? effect.toughness : 0);
      return sum > 0 ? "help" : sum < 0 ? "harm" : null;
    }
    case "add-counter":
      return effect.counter === "+1/+1" ? "help" : effect.counter === "-1/-1" ? "harm" : null;
    case "destroy":
      return "harm";
    // Narcolepsy's upkeep "tap enchanted creature"; an Aura that can do both
    // (Second Wind) stays the board's call.
    case "tap":
      return "harm";
    case "untap":
      return "help";
    // Strands of Undeath's "{B}: regenerate enchanted creature".
    case "regenerate":
      return "help";
    default:
      return null;
  }
}

/** Which way an Aura's `who: "attached"` trigger leans on the enchanted
 * creature (its trigger object), or null when it doesn't touch it. */
function attachedTriggerLean(effect: EffectSpec | null): "help" | "harm" | null {
  if (effect === null) return null;
  if (effect.kind === "sequence") {
    const leans = effect.effects.map(attachedTriggerLean).filter((l) => l !== null);
    return leans.length > 0 && leans.every((l) => l === leans[0]) ? leans[0] : null;
  }
  // Its controller pays, inside a sequence too — Death Watch's "its
  // controller loses life equal to its power, and you gain life …".
  if (effect.kind === "lose-life" && (effect as { who?: unknown }).who === "trigger-controller") return "harm";
  if (!("target" in effect) || effect.target !== "trigger-object") return null;
  switch (effect.kind) {
    case "modify-pt": {
      const sum = (typeof effect.power === "number" ? effect.power : 0) + (typeof effect.toughness === "number" ? effect.toughness : 0);
      return sum > 0 ? "help" : sum < 0 ? "harm" : null;
    }
    case "grant-keyword":
      return effect.keyword === "defender" ? "harm" : "help";
    case "grant-protection":
      return "help";
    // The Ordeals' "whenever enchanted creature attacks, put a +1/+1 counter
    // on it".
    case "add-counter":
      return effect.counter === "+1/+1" ? "help" : effect.counter === "-1/-1" ? "harm" : null;
    case "put-onto-battlefield":
      return "help";
    case "destroy":
    case "tap":
      return "harm";
    default:
      return null;
  }
}

/** Memos for one bias (or none): every definition reads the same under it,
 * and the biases are a fixed table, so there are only ever a handful. */
interface Memos {
  readonly cast: WeakMap<CardDefinition, readonly Polarity[]>;
  readonly ability: WeakMap<object, readonly Polarity[]>;
  readonly mode: WeakMap<object, readonly Polarity[]>;
}

const UNBIASED: PolarityBias = {};
const memosByBias = new WeakMap<PolarityBias, Memos>();

function memosFor(bias: PolarityBias = UNBIASED): Memos {
  let memos = memosByBias.get(bias);
  if (memos === undefined) {
    memos = { cast: new WeakMap(), ability: new WeakMap(), mode: new WeakMap() };
    memosByBias.set(bias, memos);
  }
  return memos;
}

/** The polarity of each target slot of casting `def` — an Aura's slot 0
 * from its statics, the rest from its effect. */
export function castPolarities(def: CardDefinition, bias?: PolarityBias): readonly Polarity[] {
  const memo = memosFor(bias).cast;
  let found = memo.get(def);
  if (found === undefined) {
    const slots = slotPolarities(def.effect, def.targets.length, bias);
    found = (def.subtypes ?? []).includes("Aura") && slots.length > 0
      ? [auraPolarity(def), ...slots.slice(1)]
      : slots;
    memo.set(def, found);
  }
  return found;
}

/** A slot nothing touches whose spec is only a gate on which opponent may
 * be chosen — the Keepers' "target opponent who has more life than you do"
 * — reads as aimed at that opponent: the card picked the side. */
function gatedOpponents(specs: readonly TargetSpec[], polarities: readonly Polarity[]): readonly Polarity[] {
  return polarities.map((p, i) => {
    const spec = specs[i];
    return p === "either" && typeof spec === "object" && spec.kind === "opponent-compared" ? "harm" : p;
  });
}

/** The polarity of each target slot of an activated or triggered ability. */
export function abilityPolarities(
  ability: Pick<ActivatedAbility | TriggeredAbility, "targets" | "effect">,
  bias?: PolarityBias,
): readonly Polarity[] {
  const memo = memosFor(bias).ability;
  let found = memo.get(ability);
  if (found === undefined) {
    found = gatedOpponents(ability.targets, slotPolarities(ability.effect, ability.targets.length, bias));
    memo.set(ability, found);
  }
  return found;
}

type CastOffer = Extract<LegalAction, { kind: "cast-spell" }>;
type ActivateOffer = Extract<LegalAction, { kind: "activate-ability" }>;

/**
 * The polarity of each target slot of a cast or activation `legalActions`
 * offered, or `null` when there's no telling: a targeted modal spell (its
 * slots depend on the modes picked), an ability that isn't printed on the card
 * (granted — the grant isn't in the definition), a card the registry doesn't
 * know.
 */
export function offerPolarities(
  registry: CardRegistry,
  offer: CastOffer | ActivateOffer,
  bias?: PolarityBias,
): readonly Polarity[] | null {
  if (!registry.has(offer.cardName)) return null;
  const def = registry.get(offer.cardName);
  if (offer.kind === "activate-ability") {
    const ability = def.activated[offer.abilityIndex];
    if (ability === undefined) return null;
    // A Licid's ability makes it the Aura on its target: that slot leans as
    // the Aura's "enchanted creature" abilities do.
    if (ability.licid === true) return [auraPolarity(licidDefinition(def))];
    // A modal ability's slots are its chosen modes' targets, in listed order
    // (rule 700.2b), as an announced trigger's are.
    const modal = ability.effect?.kind === "modal" ? ability.effect : null;
    if (modal !== null && modal.announced === true && offer.modes !== undefined) {
      return offer.modes.flatMap((index) => {
        const mode = modal.modes[index];
        return mode === undefined ? [] : [...slotPolarities(mode.effect, mode.targets?.length ?? 0, bias)];
      });
    }
    return abilityPolarities(ability, bias);
  }
  if (offer.castModal !== undefined) return null;
  // Cast bestowed, it's an Aura with enchant creature (rule 702.103b): its
  // one slot's polarity is its "enchanted creature" statics'.
  if (offer.overload === true && def.overload?.keyword === "bestow") return castPolarities(bestowedDefinition(def), bias);
  const face = offer.face !== undefined ? def.faces?.[offer.face] : undefined;
  if (face !== undefined && face !== def.name) {
    return registry.has(face) ? castPolarities(registry.get(face), bias) : null;
  }
  return castPolarities(def, bias);
}

/**
 * For a targeted modal spell `legalActions` offered (`castModal` — "choose one
 * or more —", each mode with targets of its own): the polarity of each target
 * slot of each mode, in the offer's mode order. `null` when the definition
 * can't be matched to the offer.
 */
export function modalPolarities(
  registry: CardRegistry,
  offer: CastOffer,
  bias?: PolarityBias,
): readonly (readonly Polarity[])[] | null {
  if (offer.castModal === undefined || !registry.has(offer.cardName)) return null;
  let def = registry.get(offer.cardName);
  const face = offer.face !== undefined ? def.faces?.[offer.face] : undefined;
  if (face !== undefined && face !== def.name) {
    if (!registry.has(face)) return null;
    def = registry.get(face);
  }
  const modes = def.castModal?.modes;
  if (modes === undefined || modes.length !== offer.castModal.modes.length) return null;
  const memo = memosFor(bias).mode;
  return modes.map((mode) => {
    let found = memo.get(mode);
    if (found === undefined) {
      found = slotPolarities(mode.effect, mode.targets?.length ?? 0, bias);
      memo.set(mode, found);
    }
    return found;
  });
}

/**
 * The polarity of each slot a pending `choose-targets` decision asks about,
 * in answer order — a triggered ability's (or its reflexive trigger's, or a
 * Saga chapter's), or a spell being cast for free. Slots filled automatically
 * (a saboteur's victim) come first and aren't asked, so they're dropped.
 */
export function pendingTargetPolarities(
  state: GameState,
  registry: CardRegistry,
  bias?: PolarityBias,
): readonly Polarity[] | null {
  const pending = state.pendingTargetedTrigger;
  if (pending === null) return null;
  let all: readonly Polarity[] | null = null;
  if (pending.reflexive !== undefined) {
    all = slotPolarities(pending.reflexive.effect, pending.reflexive.targets.length, bias);
  } else if (pending.grantedAbility === undefined && registry.has(pending.cardName)) {
    const def = registry.get(pending.cardName);
    if (pending.abilityKind === "chapter") {
      const chapter = def.chapters?.[pending.abilityIndex];
      all = chapter === undefined ? null : slotPolarities(chapter.effect, chapter.targets.length, bias);
    } else {
      const ability = def.triggered[pending.abilityIndex];
      const modal = ability?.effect?.kind === "modal" ? ability.effect : null;
      if (modal !== null && modal.announced === true && pending.modes !== undefined) {
        // An announced modal ability's slots are its chosen modes' targets,
        // in the order the modes are listed (rules 603.3c, 700.2b).
        all = pending.modes.flatMap((index) => {
          const mode = modal.modes[index];
          return mode === undefined ? [] : [...slotPolarities(mode.effect, mode.targets?.length ?? 0, bias)];
        });
      } else if (ability !== undefined) {
        all = abilityPolarities(ability, bias);
      }
    }
  }
  if (all === null) return null;
  const asked: Polarity[] = [];
  pending.slots.forEach((slot, index) => {
    if ("spec" in slot) asked.push(all[index] ?? "either");
  });
  return asked;
}

/** Whose side a target spec already restricts it to, if any. When it does,
 * the card chose the side and a bot shouldn't second-guess it — "target
 * creature you control" with a harmful effect is a cost, not a mistake. */
export type SpecSide = "you" | "opponent" | "any";

export function specSide(spec: TargetSpec): SpecSide {
  if (typeof spec === "object") {
    switch (spec.kind) {
      case "optional":
      case "other":
      case "any-number":
        return specSide(spec.of);
      case "permanent":
        // A seat-bound slot (Dismantling Wave): seat 0 is you, the rest
        // opponents.
        if (typeof spec.whose === "object") return spec.whose.seat === 0 ? "you" : "opponent";
        return spec.whose === "you"
          ? "you"
          : spec.whose === "opponent" || spec.whose === "trigger-player" || spec.whose === "defending-player"
            ? "opponent"
            : "any";
      case "spell":
        return spec.whose === "you" ? "you" : spec.whose === "opponent" ? "opponent" : "any";
      case "ability":
        return spec.whose === "you" ? "you" : "any";
      case "opponent-compared":
        return "opponent";
      case "spell-or-permanent":
        return spec.whose === "you" ? "you" : spec.whose === "opponent" ? "opponent" : "any";
      case "card-in-graveyard":
        if (typeof spec.whose === "object") return spec.whose.seat === 0 ? "you" : "opponent";
        return spec.whose === "you"
          ? "you"
          : spec.whose === "opponent" || spec.whose === "defending-player" || spec.whose === "trigger-player"
            ? "opponent"
            : "any";
    }
  }
  switch (spec) {
    case "creature-you-control":
    case "land-you-control":
    case "instant-or-sorcery-in-your-graveyard":
      return "you";
    case "creature-an-opponent-controls":
    case "opponent":
    case "opponent-whose-turn-it-is":
    case "opponent-or-planeswalker":
    case "artifact-an-opponent-controls":
    case "creature-or-enchantment-an-opponent-controls":
    case "nonland-permanent-an-opponent-controls":
    case "creature-attacking-you":
    case "creature-defending-player-controls":
    case "artifact-enchantment-or-nonbasic-land-an-opponent-controls":
      return "opponent";
    default:
      return "any";
  }
}

/** Whose side a target is on, from `me`'s seat: a permanent or spell by its
 * controller, a card anywhere else by its owner. */
export function sideOf(state: GameState, ref: TargetRef, me: PlayerId): "own" | "opponent" | null {
  if (ref.kind === "player") return ref.player === me ? "own" : "opponent";
  const object = state.objects[ref.object];
  if (object === undefined) return null;
  const whose =
    object.zone === "battlefield" || object.zone === "stack" ? object.controller : object.owner;
  return whose === me ? "own" : "opponent";
}

function printedManaValue(registry: CardRegistry, name: string): number {
  if (!registry.has(name)) return 0;
  const cost = registry.get(name).manaCost;
  return cost === null ? 0 : manaValue(parseManaCost(cost));
}

/**
 * A cheap, static sense of how much a target is worth having — or of taking
 * away. Not the evaluation: it only has to order a handful of options so the
 * obvious one comes first. A creature by its stats (the commander counting
 * extra, as the one card always coming back), a planeswalker by its loyalty,
 * a land barely, anything else by its mana value.
 *
 * A player is worth more the closer they are to losing — the one a burn
 * spell should finish — on a scale that puts a healthy opponent's face below
 * a real creature and a dying one's above it.
 */
export function targetValue(state: GameState, registry: CardRegistry, ref: TargetRef): number {
  if (ref.kind === "player") {
    const life = state.players[ref.player]?.life ?? 0;
    return 3 + Math.max(0, 40 - life) / 4;
  }
  const object = state.objects[ref.object];
  if (object === undefined) return 0;
  const printed = printedManaValue(registry, printedCardName(object));
  if (object.zone !== "battlefield") return printed;
  const c = computeCharacteristics(state, registry, ref.object);
  if (c.types.includes("creature")) {
    return 1.5 * c.power + c.toughness + 0.5 * printed + c.keywords.size + (object.isCommander ? 5 : 0);
  }
  if (c.types.includes("planeswalker")) return 2 * (object.counters.loyalty ?? 0) + printed;
  if (c.types.includes("land")) return 0.5;
  return Math.max(1, printed);
}

/**
 * `options` best-first for a slot of this polarity, from `me`'s seat: the
 * right side first, most valuable first; then the wrong side, least valuable
 * first (the least bad, when only the wrong side is legal). `take` ranks
 * everything by value, whoever's it is; `either` leaves the offer's order
 * alone. Ties keep the offer's order, so a replay is exact. `value` is how
 * an option is priced — {@link targetValue}, or a caller's richer sense of it
 * (v2 adds how much of an engine a permanent is, `bot/features.ts`).
 */
export function rankTargets(
  state: GameState,
  registry: CardRegistry,
  me: PlayerId,
  options: readonly TargetRef[],
  polarity: Polarity,
  value: (state: GameState, registry: CardRegistry, ref: TargetRef) => number = targetValue,
  damage?: number,
): TargetRef[] {
  if (polarity === "either" || options.length < 2) return [...options];
  const want = polarity === "harm" ? "opponent" : "own";
  // Damage that doesn't kill is gone at cleanup (rule 514.2): among the
  // targets a harmful slot's damage is aimed at, what it kills, and players,
  // come before what it only scratches (capture NZP7Q t26: Explosion for 3 at
  // a 6/6 with a 3-loyalty Kiora beside it). The rest stay, just later.
  // Damage already on its way to a permanent (`damageOnStack`) adds to this:
  // a second Terror of the Peaks trigger finishes what the first started, and
  // a permanent already dead to what's coming is a waste (the user,
  // 2026-10-07).
  let pending: ReadonlyMap<ObjectId, number> | undefined;
  const pendingAt = (ref: TargetRef): number =>
    ref.kind === "object" ? ((pending ??= damageOnStack(state, registry)).get(ref.object) ?? 0) : 0;
  const lands = (ref: TargetRef): boolean => {
    if (damage === undefined || polarity !== "harm") return true;
    const already = pendingAt(ref);
    if (already > 0 && ref.kind === "object" && damageLands(state, registry, ref, already)) return false;
    return damageLands(state, registry, ref, damage + already);
  };
  // Damage an opponent's life total meets ends them (rule 704.5a), and their
  // whole board leaves with them (rule 800.4a): no creature of theirs, nor
  // anyone else's, is worth more (a live misplay, 2026-10-14: Terror of the
  // Peaks' 7 at the Avenger of Zendikar of a player on 4).
  const lethal = (ref: TargetRef): boolean =>
    damage !== undefined &&
    polarity === "harm" &&
    ref.kind === "player" &&
    ref.player !== me &&
    (state.players[ref.player]?.life ?? Infinity) <= damage &&
    !playerCantLoseLife(state, ref.player) &&
    !playerCantLoseGame(state, registry, ref.player);
  const scored = options.map((ref, index) => ({
    ref,
    index,
    right: polarity === "take" || sideOf(state, ref, me) === want,
    lethal: lethal(ref),
    lands: lands(ref),
    value: value(state, registry, ref),
  }));
  scored.sort((a, b) => {
    if (a.right !== b.right) return a.right ? -1 : 1;
    if (a.lethal !== b.lethal) return a.lethal ? -1 : 1;
    if (a.right && a.lands !== b.lands) return a.lands ? -1 : 1;
    const byValue = a.right ? b.value - a.value : a.value - b.value;
    return byValue !== 0 ? byValue : a.index - b.index;
  });
  return scored.map((s) => s.ref);
}

/** Whether `amount` damage to `ref` does something that lasts: a player
 * (life lost stays lost), or a permanent it destroys — a creature whose
 * toughness it meets (less damage already marked), not indestructible; a
 * planeswalker's loyalty or a battle's defence it removes. */
export function damageLands(state: GameState, registry: CardRegistry, ref: TargetRef, amount: number): boolean {
  if (ref.kind === "player") return true;
  const object = state.objects[ref.object];
  if (object === undefined || object.zone !== "battlefield") return true;
  const c = computeCharacteristics(state, registry, ref.object);
  if (c.types.includes("planeswalker") && (object.counters.loyalty ?? 0) <= amount) return true;
  if (c.types.includes("battle") && (object.counters.defense ?? 0) <= amount) return true;
  return (
    c.types.includes("creature") &&
    !c.keywords.has("indestructible") &&
    c.toughness - (object.damageMarked ?? 0) <= amount
  );
}

/**
 * The damage each target slot of an offered cast or activation is dealt —
 * a `damage` effect aimed at that slot, at a fixed amount or X at the most
 * the offer can pay — or `undefined` where there's no telling (a live
 * amount, divided damage, no damage at all). Read as `offerPolarities` reads
 * the definition.
 */
export function offerDamage(
  registry: CardRegistry,
  offer: CastOffer | ActivateOffer,
): readonly (number | undefined)[] {
  if (!registry.has(offer.cardName)) return [];
  const def = registry.get(offer.cardName);
  let effect: EffectSpec | null | undefined;
  if (offer.kind === "activate-ability") {
    effect = def.activated[offer.abilityIndex]?.effect;
  } else {
    if (offer.castModal !== undefined) return [];
    const face = offer.face !== undefined ? def.faces?.[offer.face] : undefined;
    effect = face !== undefined && face !== def.name ? (registry.has(face) ? registry.get(face).effect : null) : def.effect;
  }
  return slotDamage(effect, { x: offer.xCost?.maxX });
}

/** What a damage amount reads that can be told without resolving it. */
interface DamageContext {
  readonly x?: number;
  /** A trigger's snapshotted quantity (`{ triggerValue: true }`). */
  readonly triggerValue?: number;
  /** For a `countOf` amount: the board, and whose "you" it counts from. */
  readonly board?: { readonly state: GameState; readonly registry: CardRegistry; readonly you: PlayerId };
}

/** A damage amount, where it can be told: a fixed number, X, a trigger's
 * snapshotted value (Terror of the Peaks: the entering creature's power), or
 * a count of permanents (Scourge of Valkas: the Dragons you control, counted
 * now; it's counted again as it resolves). */
function knownAmount(amount: unknown, ctx: DamageContext): number | undefined {
  if (typeof amount === "number") return amount;
  if (amount === "x") return ctx.x;
  if (amount === null || typeof amount !== "object") return undefined;
  const live = amount as { readonly triggerValue?: unknown; readonly countOf?: CardFilter };
  if (live.triggerValue === true) return ctx.triggerValue;
  if (live.countOf !== undefined && ctx.board !== undefined) {
    const { state, registry, you } = ctx.board;
    const filter = live.countOf;
    return state.zones.shared.battlefield.filter((id) => matchesFilter(state, registry, id, filter, { you })).length;
  }
  return undefined;
}

/** The damage each target slot of `effect` is dealt (a `damage` effect aimed
 * at that slot, not divided), or `undefined` where there's no telling. */
function slotDamage(effect: unknown, ctx: DamageContext): (number | undefined)[] {
  const out: (number | undefined)[] = [];
  const visit = (node: unknown): void => {
    if (Array.isArray(node)) {
      for (const child of node) visit(child);
      return;
    }
    if (node === null || typeof node !== "object") return;
    const spec = node as { kind?: unknown; target?: unknown; amount?: unknown; divided?: unknown };
    if (spec.kind === "damage" && typeof spec.target === "number" && spec.divided === undefined) {
      const amount = knownAmount(spec.amount, ctx);
      if (amount !== undefined) out[spec.target] = (out[spec.target] ?? 0) + amount;
    }
    for (const child of Object.values(node)) visit(child);
  };
  visit(effect);
  return out;
}

/** What a stack object does, read off its card: a spell's effect, or the
 * activated, triggered or chapter ability it is. */
export function stackEffectOf(registry: CardRegistry, object: GameObject): EffectSpec | undefined {
  if (object.kind === "card") {
    return registry.has(object.cardName) ? (registry.get(object.cardName).effect ?? undefined) : undefined;
  }
  if (object.sourceObjectId === null || object.abilityIndex === null) return undefined;
  if (!registry.has(object.cardName)) return undefined;
  const def = registry.get(object.cardName);
  const index = object.abilityIndex;
  if (object.abilityKind === "activated") return def.activated[index]?.effect ?? undefined;
  if (object.abilityKind === "triggered") return def.triggered[index]?.effect ?? undefined;
  if (object.abilityKind === "chapter") return def.chapters?.[index]?.effect ?? undefined;
  return undefined;
}

/**
 * The damage the spells and abilities on the stack are already sending at
 * each permanent, where it can be told (`slotDamage`): two Terror of the
 * Peaks triggers, or two of Scourge of Valkas's, aimed at one creature add
 * up. Read off each object's card, its X and its trigger's snapshotted value;
 * a delayed or reflexive trigger, or a granted ability, isn't counted.
 */
export function damageOnStack(state: GameState, registry: CardRegistry): Map<ObjectId, number> {
  const out = new Map<ObjectId, number>();
  for (const id of state.zones.shared.stack) {
    const object = state.objects[id];
    if (object === undefined || object.targets === null) continue;
    if (object.delayedTrigger !== undefined || object.reflexiveTrigger !== undefined) continue;
    const effect = stackEffectOf(registry, object);
    if (effect === undefined) continue;
    const damages = slotDamage(effect, {
      x: object.xValue ?? 0,
      triggerValue: object.triggerValue,
      board: { state, registry, you: object.controller },
    });
    damages.forEach((amount, slot) => {
      const target = object.targets?.[slot];
      if (amount !== undefined && amount > 0 && target?.kind === "object") {
        out.set(target.object, (out.get(target.object) ?? 0) + amount);
      }
    });
  }
  return out;
}

/** Most waiting triggers a damage plan weighs (`planDamage` tries every
 * subset of them for each target). */
const MAX_PLANNED_CHUNKS = 8;

/**
 * The damage of each trigger of `controller`'s still waiting to go on the
 * stack (`pendingTriggers`) behind the one being aimed — Terror of the Peaks
 * triggers from creatures that entered together, Scourge of Valkas's from
 * Dragons that did — where it's one target slot dealt damage that can be
 * told. Their targets aren't chosen yet, so the one being aimed can plan for
 * them (`planDamage`).
 */
export function waitingTriggerDamage(state: GameState, registry: CardRegistry, controller: PlayerId): number[] {
  const out: number[] = [];
  for (const trigger of state.pendingTriggers) {
    if (trigger.controller !== controller || trigger.grantedAbility !== undefined) continue;
    if (trigger.autoTargets !== undefined || !registry.has(trigger.cardName)) continue;
    const def = registry.get(trigger.cardName);
    const ability = trigger.chapter === true ? def.chapters?.[trigger.abilityIndex] : def.triggered[trigger.abilityIndex];
    if (ability === undefined || ability.targets.length !== 1) continue;
    const amount = slotDamage(ability.effect, {
      x: trigger.x ?? 0,
      triggerValue: trigger.triggerValue,
      board: { state, registry, you: controller },
    })[0];
    if (amount !== undefined && amount > 0) out.push(amount);
  }
  return out.slice(0, MAX_PLANNED_CHUNKS - 1);
}

/** How much more damage kills `ref` (a creature's toughness less the damage
 * on it and on its way, a planeswalker's loyalty, a battle's defence), or
 * null when damage can't kill it or it's dead already. */
function damageToKill(
  state: GameState,
  registry: CardRegistry,
  ref: TargetRef,
  pending: ReadonlyMap<ObjectId, number>,
): number | null {
  if (ref.kind !== "object") return null;
  const object = state.objects[ref.object];
  if (object === undefined || object.zone !== "battlefield") return null;
  const c = computeCharacteristics(state, registry, ref.object);
  const already = pending.get(ref.object) ?? 0;
  let need: number | null = null;
  if (c.types.includes("creature") && !c.keywords.has("indestructible")) {
    need = c.toughness - (object.damageMarked ?? 0);
  } else if (c.types.includes("planeswalker")) {
    need = object.counters.loyalty ?? 0;
  } else if (c.types.includes("battle")) {
    need = object.counters.defense ?? 0;
  }
  if (need === null) return null;
  need -= already;
  return need > 0 ? need : null;
}

/**
 * Where the first of several damage chunks dealt together should go —
 * `chunks[0]` the trigger being aimed, the rest its siblings still waiting
 * (`waitingTriggerDamage`) — so that between them they kill the most (the
 * user, 2026-10-07: simultaneous damage triggers plan together). Most
 * valuable first, each opposing permanent the chunks left can kill takes the
 * cheapest set of them that does, with the damage already on the stack
 * counted; the first chunk goes where that puts it. Null when the plan
 * leaves the first chunk free, for the usual aim to place. Each later
 * trigger plans again with the damage before it on the stack, so the plan
 * holds as they go on.
 */
export function planDamage(
  state: GameState,
  registry: CardRegistry,
  me: PlayerId,
  options: readonly TargetRef[],
  chunks: readonly number[],
  value: (state: GameState, registry: CardRegistry, ref: TargetRef) => number = targetValue,
): TargetRef | null {
  if (chunks.length < 2) return null;
  const pending = damageOnStack(state, registry);
  const killable = options
    .filter((ref) => sideOf(state, ref, me) === "opponent")
    .map((ref) => ({ ref, need: damageToKill(state, registry, ref, pending), worth: value(state, registry, ref) }))
    .filter((t): t is { ref: TargetRef; need: number; worth: number } => t.need !== null)
    .sort((a, b) => b.worth - a.worth);
  let free = (1 << chunks.length) - 1;
  for (const target of killable) {
    let best = 0;
    let bestSum = Infinity;
    for (let mask = 1; mask < 1 << chunks.length; mask += 1) {
      if ((mask & free) !== mask) continue;
      let sum = 0;
      for (let i = 0; i < chunks.length; i += 1) if (mask & (1 << i)) sum += chunks[i];
      if (sum >= target.need && sum < bestSum) {
        best = mask;
        bestSum = sum;
      }
    }
    if (best === 0) continue;
    if (best & 1) return target.ref;
    free &= ~best;
  }
  return null;
}

/** The damage each asked slot of the trigger being put on the stack
 * (`pendingTargetedTrigger`) deals, in the order its slots are asked, so its
 * target is aimed at what that damage kills as a cast's is (`offerDamage`).
 * Empty when there's no telling. */
export function pendingTargetDamage(state: GameState, registry: CardRegistry): readonly (number | undefined)[] {
  const pending = state.pendingTargetedTrigger;
  if (pending === null || pending.reflexive !== undefined || pending.grantedAbility !== undefined) return [];
  if (!registry.has(pending.cardName)) return [];
  const def = registry.get(pending.cardName);
  const effect =
    pending.abilityKind === "chapter"
      ? def.chapters?.[pending.abilityIndex]?.effect
      : def.triggered[pending.abilityIndex]?.effect;
  if (effect === undefined || effect === null) return [];
  const all = slotDamage(effect, {
    x: pending.x ?? 0,
    triggerValue: pending.triggerValue,
    board: { state, registry, you: pending.controller },
  });
  const asked: (number | undefined)[] = [];
  pending.slots.forEach((slot, index) => {
    if ("spec" in slot) asked.push(all[index]);
  });
  return asked;
}

/**
 * Whether this slot's legal options are all on the side its polarity says to
 * avoid — a Murder with only your own creatures to kill, a counterspell with
 * only your own spell on the stack. Only asked of a slot whose spec leaves
 * the side open: one that names it ("target creature you control") is the
 * card choosing, not the bot.
 */
export function onlyWrongSide(
  state: GameState,
  me: PlayerId,
  options: readonly TargetRef[],
  polarity: Polarity,
  spec: TargetSpec,
): boolean {
  if (polarity !== "harm" && polarity !== "help") return false;
  if (specSide(spec) !== "any" || options.length === 0) return false;
  const want = polarity === "harm" ? "opponent" : "own";
  return options.every((ref) => sideOf(state, ref, me) !== want);
}
