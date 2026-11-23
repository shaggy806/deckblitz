/**
 * Every spell in the pool whose targets read X is offered with room for
 * them: where there is something to target, some cast names a target at an
 * X of 1 or more, and the engine takes it.
 *
 * The page and the bots cast from the offer (`legalActions`), not from the
 * card. Three cards were offered at no target only while a cast written by
 * hand, as the cards' own tests wrote theirs, went through (2026-11-22):
 * Fire Covenant (an X paid in life was no X to the offer, so its "any number
 * of target creatures" was a group of none), Dance of the Manse (offered X
 * by X, each offer kept the count worked out for no X in particular) and
 * Nahiri's Sacrifice (its specs fixed at X = 0). This asks the offer itself,
 * for all of them and for whatever is authored next.
 *
 * A card with nothing to target on these boards is not a failure: the
 * signature is an offer with candidates in every slot and no cast that
 * names one.
 */
import { describe, expect, it } from "vitest";

import type { Action, LegalAction } from "../actions.js";
import { candidateActions } from "../bot/candidates.js";
import { withDivisions } from "../bot/divisions.js";
import type { CardDefinition } from "../cards.js";
import { Game } from "../game.js";
import type { ObjectId } from "../primitives.js";
import { A, B, cast, lands, spawn, table, toGraveyard, toHand, toStep } from "./harness.js";

type CastOffer = Extract<LegalAction, { kind: "cast-spell" }>;
type CastAction = Extract<Action, { type: "cast-spell" }>;

const BOARD = ["Grizzly Bears", "Hill Giant", "Craw Wurm", "Llanowar Elves", "Sol Ring", "Glorious Anthem", "Ornithopter", "Serra Angel", "Snow-Covered Forest", "Snow-Covered Island", "Jace Beleren"];
const YARD = ["Grizzly Bears", "Hill Giant", "Shock", "Opt", "Sol Ring", "Forest", "Glorious Anthem", "Craw Wurm", "Counterspell", "Divination", "Dire Fleet Daredevil"];
const HAND = ["Opt", "Shock", "Duress", "Giant Growth", "Healing Salve", "Grizzly Bears", "Forest"];

/** Whether anything in a spell's targets or its divided amount reads X. */
function targetsReadX(def: CardDefinition): boolean {
  const read = JSON.stringify([def.targets ?? null, def.castModal?.modes.map((mode) => mode.targets) ?? null, def.divided ?? null]);
  return /"x"|"xPlus"|"x":/.test(read);
}

/** Alice with eight of each basic land and 40 life; both players with
 * creatures, an artifact, an enchantment, a planeswalker and snow lands in
 * play and cards of each kind in their graveyards; three of each colour's
 * cards, creature cards and land cards in Alice's hand, for costs paid in
 * cards. */
function board(): Game {
  const { game } = table({ life: 40 });
  for (const land of ["Plains", "Island", "Swamp", "Mountain", "Forest"]) lands(game, land, 8);
  for (const player of [A, B]) {
    for (const name of BOARD) spawn(game, name, player);
    for (const name of YARD) toGraveyard(game, name, player);
  }
  for (const name of HAND) for (let i = 0; i < 3; i += 1) toHand(game, name);
  return game;
}

/** The same, in combat on Bob's turn with Alice to act: his Bears, Giant and
 * Wurm attacking her, and at `step` "declare-blockers" her own Giant and
 * Wurm blocking two of them. */
function combatBoard(step: "declare-attackers" | "declare-blockers"): Game {
  const { game, a, b } = table({ life: 40 });
  for (const land of ["Plains", "Island", "Swamp", "Mountain", "Forest"]) lands(game, land, 8);
  lands(game, "Snow-Covered Forest", 3);
  const attackers = ["Grizzly Bears", "Hill Giant", "Craw Wurm"].map((name) => spawn(game, name, B));
  const blockers = ["Hill Giant", "Craw Wurm"].map((name) => spawn(game, name, A));
  for (const name of YARD) toGraveyard(game, name, A);
  for (const name of HAND) for (let i = 0; i < 3; i += 1) toHand(game, name);
  b.declareAttackersFn = () => attackers.map((attacker) => ({ attacker, defender: A }));
  a.declareBlockersFn = () => blockers.map((blocker, i) => ({ blocker, attacker: attackers[i] }));
  toStep(game, "declare-attackers", B);
  // Past the declaration itself: nothing can be cast while one is pending.
  game.advanceUntil((s) => s.turn.step === step && s.priority.holder === A && s.awaiting === null);
  return game;
}

/** The first board, with Alice's own Grizzly Bears on the stack and her
 * priority: a spell with mana value 2 to counter. */
function stackBoard(): Game {
  const game = board();
  cast(game, toHand(game, "Grizzly Bears"), { settle: false });
  return game;
}

/** The cards that can't be cast on the first board, each with the one it
 * can: a card with a timing of its own goes here. */
const BOARDS: Readonly<Record<string, () => Game>> = {
  "Choking Vines": () => combatBoard("declare-blockers"),
  "Hail of Arrows": () => combatBoard("declare-attackers"),
  "Rock Slide": () => combatBoard("declare-attackers"),
  Outmaneuver: () => combatBoard("declare-blockers"),
  "Vengeful Dreams": () => combatBoard("declare-attackers"),
  "Wake the Dead": () => combatBoard("declare-attackers"),
  "Winter's Chill": () => combatBoard("declare-attackers"),
  "Spell Blast": stackBoard,
  "Spell Burst": stackBoard,
};

const targetsNamed = (action: CastAction): number => (action.targets ?? []).filter((t) => t !== null && t !== undefined).length;

/** What is wrong with `card`'s offers on `game`, or `null`: `"no-offer"`,
 * `"nothing-to-target"`, or the failure this test is for. */
function check(game: Game, card: ObjectId): string | null {
  const offers = game.legalActions(A).filter((o): o is CastOffer => o.kind === "cast-spell" && o.card === card);
  if (offers.length === 0) return "no-offer";
  const slots = (offer: CastOffer): readonly (readonly unknown[])[] =>
    offer.castModal !== undefined ? offer.castModal.modes.flatMap((mode) => mode.targetOptions) : offer.targetOptions;
  if (!offers.some((offer) => slots(offer).some((options) => options.length > 0))) return "nothing-to-target";
  const candidates = offers
    .flatMap((offer) =>
      (withDivisions(game.state, game.registry, offer, candidateActions(offer, A)) as CastAction[]).filter(
        // A cast with no X to choose (Avacyn's Judgment for its mana cost,
        // 2 damage divided) names its targets all the same.
        (action) => targetsNamed(action) > 0 && (offer.xCost === undefined || (action.xValue ?? 0) > 0),
      ),
    )
    // The fewest targets first, at the largest X: the cast likeliest to be
    // legal whatever the targets must have in common.
    .sort((x, y) => targetsNamed(x) - targetsNamed(y) || (y.xValue ?? 0) - (x.xValue ?? 0));
  if (candidates.length === 0) return "offered at no target, or at X = 0 only";
  let refusal = "";
  for (const action of candidates.slice(0, 12)) {
    const copy = Game.fromSnapshot(game.state, { registry: game.registry });
    try {
      copy.dispatch(action);
      return null;
    } catch (error) {
      refusal ||= error instanceof Error ? error.message : String(error);
    }
  }
  return `no offered cast with a target is taken: ${refusal}`;
}

describe("spells whose targets read X", () => {
  it("are each offered with a target to name at an X above 0", () => {
    const base = board();
    const names: string[] = [];
    for (const def of base.registry.definitions()) {
      if (!def.types.includes("land") && targetsReadX(def)) names.push(def.name);
    }
    // The pool has over a hundred; fewer means the scan above has gone blind.
    expect(names.length).toBeGreaterThan(100);
    const failures: string[] = [];
    const untested: string[] = [];
    for (const name of names) {
      const game = BOARDS[name] !== undefined ? BOARDS[name]() : Game.fromSnapshot(base.state, { registry: base.registry });
      const result = check(game, game.debugSpawn(name, A, "hand"));
      if (result === null) continue;
      if (result === "no-offer" || result === "nothing-to-target") untested.push(`${name}: ${result}`);
      else failures.push(`${name}: ${result}`);
    }
    expect(failures).toEqual([]);
    // Every one of them is cast today. A card these boards can't cast or
    // find a target for gets a board of its own in `BOARDS`, or its name
    // here with why not.
    expect(untested).toEqual([]);
  });
});
