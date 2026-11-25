/**
 * Deck biases: what a deck wants that a bot with no plan for it would get
 * backwards.
 *
 * The bots' card knowledge is generic. `target-polarity.ts` says milling a
 * player harms them, so a mill trigger goes at an opponent; the evaluation
 * prices a graveyard card at a twentieth of a card in hand, for everyone
 * alike. That's right for most decks and wrong for a few: Teval, the Balanced
 * Scale's deck mills itself to return lands and make Zombies, and wants every
 * mill it controls pointed at its own library. A bias is that deck's
 * correction, read wherever the generic rule is read — never a script of
 * plays, only a different idea of which side an effect belongs on and what
 * its own board is worth.
 *
 * ## Keyed by commander
 *
 * A bot doesn't know its deck's name — the game only knows its cards — but
 * a commander is public, fixed for the game, and the one card that says what
 * a Commander deck is for. So the table is keyed by commander name and read
 * off the `GameState` (`deckBias`), which means everything that asks the
 * question gets the same answer without being told: v1, v2, the v1 that
 * plays every seat in v2's rollouts (an opponent's Teval mills itself there
 * too), and a deck a person built around Teval as much as the precon.
 *
 * ## What a bias may say
 *
 * - **`polarity`**: effect kinds whose target slots this deck reads the
 *   other way round (`mill: "help"`), handed to every `target-polarity.ts`
 *   question. It moves v1's targeting, v2's target ranking, the slots v2
 *   simulates first, and `effect-worth.ts`' reading of a "you may".
 * - **`ownWeights`**: evaluation weights for the bot's *own* features only
 *   (`bot/evaluate.ts`, `outcomeOf`). The evaluation is symmetric — an
 *   opponent's graveyard is priced as ours is — and a bias mustn't make the
 *   bot think an opponent's graveyard matters to *them* the way Teval's does
 *   to Teval. Opponents are still scored on the shared weights.
 * - **`cardWorth`**: what a named card of the deck is worth to it by the
 *   zone it is in, in evaluation points beside what the shared evaluation
 *   already counts (`ownCardWorth`, added to the bot's own score in
 *   `scoreOutcome`). The card a deck is built round is worth far more on its
 *   battlefield than a permanent of its cost, and something in its library
 *   (where the commander's cascade finds it) that it isn't in its graveyard;
 *   a card that brings it back is worth holding. Only the deck's own cards,
 *   and on the battlefield only under its control.
 * - **`mulligan`**: the opening hands the deck keeps, where the shared
 *   policy (`bot/mulligan.ts`) reads them wrong: `minLands` is a hand's
 *   least lands, and a hand with that many is kept whatever its spells cost.
 *
 * Each entry says why. Add one when a deck's bot is seen playing against its
 * own plan; pin it with a gate scenario that fails without the entry
 * (`bot/scenarios.ts`). Design record: `docs/plans/deck-biases.md`.
 */

import type { EvalWeights } from "./bot/evaluate.js";
import type { ObjectId, PlayerId } from "./primitives.js";
import type { GameState } from "./state.js";
import type { PolarityBias } from "./target-polarity.js";

export interface DeckBias {
  /** What the deck wants, in a line — for the record, and for a reader
   * wondering why the bot did it. */
  readonly why: string;
  /** Effect kinds whose slots this deck aims the other way. */
  readonly polarity?: PolarityBias;
  /** Weights for this player's own features. Keys left out keep the
   * shared weight; opponents are always scored on the shared ones. */
  readonly ownWeights?: Readonly<Partial<EvalWeights>>;
  /** What named cards of the deck are worth to it, by zone: points added to
   * its own score for each (`ownCardWorth`). */
  readonly cardWorth?: Readonly<Record<string, CardWorth>>;
  /** Life totals the deck plays toward while a card of its own is out:
   * points added to its own score as its life nears each (`ownCardWorth`). */
  readonly lifeGoals?: readonly LifeGoal[];
  /** Which opening hands the deck keeps (`bot/mulligan.ts`). */
  readonly mulligan?: MulliganBias;
}

/**
 * A life total that wins the deck the game while `card` is on its
 * battlefield (Test of Endurance's 50): worth `worth` points at `life` or
 * more, and less in a line down to nothing {@link LIFE_GOAL_SPAN} below it.
 * The shared evaluation prices life as a buffer against dying, which at 40
 * and above is next to nothing; to such a deck the last few points are the
 * game, and the card that reads them is worth casting for what its life
 * already is.
 */
export interface LifeGoal {
  readonly card: string;
  readonly life: number;
  readonly worth: number;
}

/** How far below a {@link LifeGoal}'s life its worth starts to count. */
export const LIFE_GOAL_SPAN = 15;

/** What one of a deck's own cards is worth to it in each zone, in evaluation
 * points; a zone left out is worth nothing more than the shared evaluation
 * says (exile always is). */
export interface CardWorth {
  /** On the battlefield under the deck's control. */
  readonly battlefield?: number;
  readonly hand?: number;
  readonly library?: number;
  readonly graveyard?: number;
}

export interface MulliganBias {
  /** A hand with fewer lands goes back; one with this many is kept. */
  readonly minLands: number;
}

/**
 * The biases, by commander name. A deck with two commanders (Partner, a
 * Background) takes both entries, the second's keys over the first's.
 */
export const COMMANDER_BIASES: Readonly<Record<string, DeckBias>> = {
  // Sultai Arisen (`SAMPLE_DECKS`): "mill yourself, bring lands and
  // creatures back, and make Zombies as cards leave the graveyard". Hedron
  // Crab and Mindscour Dragon say "target player mills"; generic polarity
  // aims both at an opponent. The deck's graveyard is its second hand —
  // Teval returns its lands, recursion and reanimation take its creatures
  // back, and every card that leaves makes a Zombie — so its own graveyard
  // cards are worth five times the shared
  // 0.05: milling itself three is +0.6 rather than nothing. `libraryDanger`
  // (0 for everyone else) keeps v2 from milling itself out: below 15 cards
  // each card off the top costs a point, so it stops at about 18.
  "Teval, the Balanced Scale": {
    why: "Self-mill: its own graveyard is a resource, so it mills itself, never an opponent.",
    polarity: { mill: "help" },
    ownWeights: { graveyard: 0.25, libraryDanger: 1 },
  },
  // pbToast's "Prince Rupert's Packed Penthouse" (`STRONG_DECKS`), from its
  // builder's own guide (2026-11-24). Nearly every spell in it is a creature
  // of power 5 or more, most at mana value 5, and none below it but Monstrous
  // Vortex, the only card the commander's cascade can hit (his third list's
  // Magma Opus, an instant discarded for a Treasure, is at 8). With the Vortex out, one
  // creature spell discovers another, which is cast and discovers the next:
  // the whole library's creatures for one spell. So the plan is five lands,
  // the commander, and then anything.
  //
  // - **Hands**: 55 lands and no ramp, and nothing to cast before the fifth
  //   land, so a hand is its lands. The shared policy threw back four lands
  //   and three five-drops (no early plays) in the first game watched.
  // - **The Vortex** is the deck: 20 on the battlefield, and where it lies
  //   otherwise is how near that is. In the library (4) the commander's
  //   cascade finds it; in hand (10) it is four mana away; in the graveyard
  //   (1.5) something has to fetch it first. That ladder is what makes
  //   Mistveil Plains put it back under the library, Colossal Skyturtle's
  //   channel return it to hand and Astelli Reclaimer to the battlefield.
  // - **The commander is cast for the cascade, not the body**: `commanderTax`
  //   at 12 is more than a 7/7 is worth, so a cast that finds no Vortex (it
  //   is out already, or in hand) loses to any other spell and to keeping
  //   the tax down, and one that finds it is worth 16 more.
  // - **What brings the Vortex back is kept**: Astelli Reclaimer and Colossal
  //   Skyturtle in hand (3 each: another creature is cast ahead of them, and
  //   the last creature in hand is still cast for the chain), Mistveil
  //   Plains on the battlefield (1.5: a fetch land finds it unless the land
  //   entering tapped costs a spell this turn).
  // - **Mill** is aimed at itself (Necron Deathmark): Anti-Venom, Kenrith,
  //   Junji and Titania bring back what lands in its graveyard. The polarity
  //   is v1's aim; `graveyard` at four times the shared 0.05 is what makes
  //   v2, which scores every player it could mill, agree (at the shared
  //   weight an opponent scored a hundredth higher).
  "The First Sliver": {
    why: "Cascade into Monstrous Vortex, then every creature spell casts the next: lands first, the commander once, the Vortex kept and brought back.",
    polarity: { mill: "help" },
    ownWeights: { commanderTax: 12, graveyard: 0.2 },
    cardWorth: {
      "Monstrous Vortex": { battlefield: 20, hand: 10, library: 4, graveyard: 1.5 },
      "Astelli Reclaimer": { hand: 3 },
      "Colossal Skyturtle": { hand: 3 },
      "Mistveil Plains": { battlefield: 1.5 },
    },
    mulligan: { minLands: 4 },
  },
  // SmokyCashew01's "Miku Angelic Life Gain" (`STRONG_DECKS`), from its
  // builder's guide (`docs/plans/deck-guides.md`, 2026-11-24): the life
  // total is how the deck wins. The rest of the guide the bots already
  // played when it was tried on boards (Aetherflux Reservoir's 50 at a
  // player it kills, Angel of Destiny's attack from 55 life, a wipe or
  // Armageddon behind Avacyn, Worldslayer onto Avacyn and the attack), so
  // the entry is what they didn't, all of it Test of Endurance:
  //
  // - **Cast it for the life it would read.** It wins at the next upkeep
  //   from 50 life, and at 52 the bot cast a Baneslayer Angel beside it in
  //   hand: a four-mana enchantment that does nothing this turn. The goal
  //   prices it at 40 points from 50 life, a third of that at 40.
  // - **Out, the life above 50 is not to spend.** With the Test and the
  //   Reservoir out at 95 life the bot paid 50 to kill one player of three
  //   and sat at 45; the same 40 points are lost under 50.
  // - **In the graveyard** it is one Hall of Heliod's Generosity from the
  //   top of the library (3 there, nothing in the graveyard), as The First
  //   Sliver's Vortex is one Mistveil Plains from its cascade.
  "Giada, Font of Hope": {
    why: "Its life total is its win: Test of Endurance is worth what the life already is, the life over 50 is kept for it, and a Test in the graveyard is fetched back.",
    cardWorth: {
      "Test of Endurance": { battlefield: 4, hand: 4, library: 3 },
    },
    lifeGoals: [{ card: "Test of Endurance", life: 50, worth: 40 }],
  },
  // Ozymandias-'s "High Power Aristocrats" (`STRONG_DECKS`), from its
  // builder's guide (`docs/plans/deck-guides.md`, 2026-11-24): an
  // aristocrats deck that wins slowly, not an aggro one. Tried on boards,
  // the bots already played most of it: they keep the tokens home from an
  // attack that loses them, feed Skullclamp, the Priest and Yawgmoth, dig
  // with Necropotence and Bolas's Citadel, and cast Bloodthirsty Conqueror
  // beside Vito and win with the two. What they didn't, and is here:
  //
  // - **The pieces that hold the table come before another body.** The
  //   guide: Bloodchief Ascension on turn one to three, Impact Tremors early,
  //   and the board controlled with Grave Pact, Dictate of Erebos and
  //   Authority of the Consuls (and Priest of Forgotten Gods, a creature
  //   the bots cast and use as it is). The shared evaluation floors an
  //   enchantment at a creature of its cost and then cast the creature: a
  //   one-drop over the Ascension, Legion Lieutenant over the Tremors,
  //   Sanctum Seeker over Grave Pact. Each is worth enough more to go
  //   first by about two points, and no more. Benched, the order is worth
  //   nothing either way (10 wins of 48 with it, 10 and 12 without): it is
  //   here as the builder's order, at no cost.
  //
  // And what was built and taken out, for costing the deck games: **the
  // guide's opening hand**, "at least two lands and a piece of card draw".
  // Two lands kept (the shared policy wants three or four sources) won 4
  // and 6 games of 48; a free mulligan spent looking for card draw, the
  // shared policy otherwise, 8. A bot on two lands doesn't dig out as its
  // builder does (`docs/plans/deck-biases.md`).
  "Edgar Markov": {
    why: "Aristocrats, not aggro: the enchantments that hold the table are cast before another Vampire.",
    cardWorth: {
      "Bloodchief Ascension": { battlefield: 6 },
      "Authority of the Consuls": { battlefield: 6 },
      "Impact Tremors": { battlefield: 5 },
      "Grave Pact": { battlefield: 6 },
      "Dictate of Erebos": { battlefield: 5 },
    },
  },
};

/** One merged bias per set of commanders, so a merge is done once and the
 * polarity memos (keyed by the bias object) are shared. */
const merged = new Map<string, DeckBias | null>();

/**
 * The bias of `player`'s deck: their commanders' entries, merged, or `null`
 * when none has one (or they have no commander). Read from the commanders
 * they *own*, wherever those are — a stolen commander doesn't change whose
 * deck it leads.
 */
export function deckBias(state: GameState, player: PlayerId): DeckBias | null {
  // Asked at every targeting question and every evaluation, so the scan is
  // done once per objects table — once per game, and once per clone a
  // search makes. Commanders are fixed from the game's setup on, so a table
  // mutated in place never changes the answer.
  let byPlayer = byObjects.get(state.objects);
  if (byPlayer === undefined) {
    byPlayer = new Map();
    byObjects.set(state.objects, byPlayer);
  }
  let found = byPlayer.get(player);
  if (found === undefined) {
    found = scanBias(state, player);
    byPlayer.set(player, found);
  }
  return found;
}

const byObjects = new WeakMap<object, Map<PlayerId, DeckBias | null>>();

function scanBias(state: GameState, player: PlayerId): DeckBias | null {
  const names: string[] = [];
  for (const object of Object.values(state.objects)) {
    if (object.isCommander && object.owner === player) names.push(object.cardName);
  }
  if (names.length === 0) return null;
  names.sort();
  const key = names.join("\n");
  let found = merged.get(key);
  if (found === undefined) {
    const entries = names.map((name) => COMMANDER_BIASES[name]).filter((b) => b !== undefined);
    found =
      entries.length === 0
        ? null
        : entries.length === 1
          ? entries[0]
          : {
              why: entries.map((b) => b.why).join(" "),
              polarity: Object.assign({}, ...entries.map((b) => b.polarity ?? {})),
              ownWeights: Object.assign({}, ...entries.map((b) => b.ownWeights ?? {})),
              cardWorth: Object.assign({}, ...entries.map((b) => b.cardWorth ?? {})),
              lifeGoals: entries.flatMap((b) => b.lifeGoals ?? []),
              ...mulliganOf(entries),
            };
    merged.set(key, found);
  }
  return found;
}

/** The last entry's mulligan rule, for a pair of commanders. */
function mulliganOf(entries: readonly DeckBias[]): { readonly mulligan?: MulliganBias } {
  const mulligan = entries.map((b) => b.mulligan).filter((m) => m !== undefined).pop();
  return mulligan === undefined ? {} : { mulligan };
}

/**
 * What `player`'s deck's own named cards are worth to it where they lie
 * (`DeckBias.cardWorth`), in evaluation points: 0 for a deck with no such
 * bias. Counts the cards `player` owns in their hand, library and graveyard,
 * and on the battlefield those they also control. A library is read as a
 * set, never in its order: which of its own cards are still in it is
 * something a player knows.
 */
export function ownCardWorth(state: GameState, player: PlayerId): number {
  const bias = deckBias(state, player);
  const worth = bias?.cardWorth;
  const goals = bias?.lifeGoals;
  if (worth === undefined && goals === undefined) return 0;
  const zones = state.zones.perPlayer[player];
  if (zones === undefined) return 0;
  let total = 0;
  const count = (ids: readonly ObjectId[], zone: keyof CardWorth, held: boolean): void => {
    for (const id of ids) {
      const object = state.objects[id];
      if (object === undefined || object.owner !== player) continue;
      if (held && object.controller !== player) continue;
      if (worth !== undefined) total += worth[object.cardName]?.[zone] ?? 0;
      // A life goal, once for each copy of its card out (a deck has one).
      if (zone === "battlefield" && goals !== undefined) {
        const life = state.players[player]?.life ?? 0;
        for (const goal of goals) {
          if (goal.card !== object.cardName) continue;
          const near = (life - (goal.life - LIFE_GOAL_SPAN)) / LIFE_GOAL_SPAN;
          total += goal.worth * Math.min(1, Math.max(0, near));
        }
      }
    }
  };
  if (worth !== undefined) {
    count(zones.hand, "hand", false);
    count(zones.library, "library", false);
    count(zones.graveyard, "graveyard", false);
  }
  count(state.zones.shared.battlefield, "battlefield", true);
  return total;
}

/** Just the polarity half of {@link deckBias}, for the targeting questions. */
export function polarityBias(state: GameState, player: PlayerId): PolarityBias | undefined {
  return deckBias(state, player)?.polarity;
}
