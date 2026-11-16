/**
 * `bot/divisions.ts`: the shares a bot's candidate gives a divided amount.
 * A bot named its targets and never the shares, so the engine split evenly
 * and Dragonlord Atarka's 5 went on one creature (a live game, 2026-11-15).
 */

import { describe, expect, it } from "vitest";

import type { Action, LegalAction } from "../actions.js";
import { withDivisions } from "../bot/divisions.js";
import { createDefaultRegistry } from "../cards.js";
import { Game } from "../game.js";
import { asPlayerId } from "../primitives.js";
import type { ObjectId } from "../primitives.js";
import type { TargetRef } from "../target.js";

const A = asPlayerId("alice");
const B = asPlayerId("bob");
const registry = createDefaultRegistry();

const deck = (player: typeof A) => ({ player, cards: Array<string>(40).fill("Forest") });

/** A game with Bob's creatures on the battlefield, and Atarka's offer over them. */
function board(names: readonly string[]): { game: Game; ids: ObjectId[] } {
  const game = Game.create({ seed: 3, registry, decks: [deck(A), deck(B)] });
  game.advanceUntil((s) => s.priority.holder !== null);
  const ids = names.map((name) => game.debugSpawn(name, B, "battlefield", { summoningSick: false }));
  return { game, ids };
}

const obj = (id: ObjectId): TargetRef => ({ kind: "object", object: id });
const offer = (total: number, upTo = false): LegalAction =>
  ({ kind: "choose-targets", source: "x", cardName: "Dragonlord Atarka", specs: [], options: [], divide: { total, slot: 0, ...(upTo ? { upTo: true } : {}) } }) as unknown as LegalAction;
const aim = (targets: readonly (TargetRef | null)[]): Action => ({ type: "choose-targets", player: A, targets });
const divisions = (game: Game, legal: LegalAction, action: Action): (readonly number[] | undefined)[] =>
  withDivisions(game.state, registry, legal, [action]).map((a) => (a.type === "choose-targets" ? a.division : undefined));

describe("withDivisions", () => {
  it("gives each target what kills it", () => {
    // Gisa and Geralf is a 4/4, Llanowar Elves a 1/1: 4 and 1, not 3 and 2.
    const { game, ids } = board(["Gisa and Geralf", "Llanowar Elves"]);
    expect(divisions(game, offer(5), aim(ids.map(obj)))).toEqual([[4, 1]]);
  });

  it("offers the cheapest kills first and the dearest first where they differ", () => {
    // 5 over a 4/4 and a 2/2: the 2/2 dead and 3 on the 4/4, or the 4/4 dead
    // and 1 on the 2/2. The search chooses.
    const { game, ids } = board(["Gisa and Geralf", "Grizzly Bears"]);
    expect(divisions(game, offer(5), aim(ids.map(obj)))).toEqual([
      [3, 2],
      [4, 1],
    ]);
  });

  it("counts the damage a creature has already taken", () => {
    const { game, ids } = board(["Gisa and Geralf", "Grizzly Bears"]);
    game.state.objects[ids[0]].damageMarked = 3;
    // 1 finishes the 4/4, 2 the Bears, and the 2 over go where nothing is left to kill.
    expect(divisions(game, offer(5), aim(ids.map(obj)))[0]).toEqual([3, 2]);
  });

  it("puts what is over on a player among the targets", () => {
    const { game, ids } = board(["Grizzly Bears"]);
    expect(divisions(game, offer(5), aim([obj(ids[0]), { kind: "player", player: B }]))).toEqual([[2, 3]]);
  });

  it("leaves an 'up to' amount undealt rather than waste it", () => {
    const { game, ids } = board(["Llanowar Elves", "Llanowar Elves"]);
    expect(divisions(game, offer(5, true), aim(ids.map(obj)))).toEqual([[1, 1]]);
  });

  it("gives an indestructible creature the least it must", () => {
    const { game, ids } = board(["Darksteel Colossus", "Grizzly Bears"]);
    expect(divisions(game, offer(5), aim(ids.map(obj)))[0]).toEqual([3, 2]);
  });

  it("leaves one target, an action already divided and an offer that divides nothing alone", () => {
    const { game, ids } = board(["Gisa and Geralf", "Llanowar Elves"]);
    expect(divisions(game, offer(5), aim([obj(ids[0])]))).toEqual([undefined]);
    const divided: Action = { type: "choose-targets", player: A, targets: ids.map(obj), division: [3, 2] };
    expect(divisions(game, offer(5), divided)).toEqual([[3, 2]]);
    const plain = { kind: "choose-targets", source: "x", cardName: "Murder", specs: [], options: [] } as unknown as LegalAction;
    expect(divisions(game, plain, aim(ids.map(obj)))).toEqual([undefined]);
  });
});
