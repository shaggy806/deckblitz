/**
 * Oko, the Ringleader: "for each other nonland permanent you control, create a
 * token that's a copy of that permanent" is a `create-token-copy` of `{ each }`
 * whose filter leaves the source out with `isSource: false` — not by name, so a
 * second Oko would still be copied. Also his combat copy (until end of turn,
 * with hexproof) and his +1's crime branch.
 */
import { describe, expect, it } from "vitest";

import {
  A,
  B,
  activate,
  hand,
  keywords,
  nextTurn,
  pickTargets,
  setTurnTotal,
  spawn,
  table,
  toHand,
  toStep,
  types,
} from "./harness.js";
import type { Game } from "../game.js";
import type { ObjectId } from "../primitives.js";

const tokenCopies = (game: Game, name: string): ObjectId[] =>
  game.battlefield.filter((id) => game.state.objects[id].isToken === true && game.state.objects[id].cardName === name);

describe("Oko, the Ringleader", () => {
  it("−5: a token copy of each other nonland permanent you control, not of Oko, a land or theirs", () => {
    const { game } = table();
    const oko = spawn(game, "Oko, the Ringleader");
    game.state.objects[oko].counters.loyalty = 5;
    spawn(game, "Grizzly Bears");
    spawn(game, "Sol Ring");
    spawn(game, "Forest");
    spawn(game, "Llanowar Elves", B);
    activate(game, oko, 2);
    expect(tokenCopies(game, "Grizzly Bears")).toHaveLength(1);
    expect(tokenCopies(game, "Sol Ring")).toHaveLength(1);
    expect(tokenCopies(game, "Forest")).toHaveLength(0);
    expect(tokenCopies(game, "Llanowar Elves")).toHaveLength(0);
    expect(tokenCopies(game, "Oko, the Ringleader")).toHaveLength(0);
    expect(tokenCopies(game, "Grizzly Bears").every((id) => game.state.objects[id].controller === A)).toBe(true);
  });

  it("at the beginning of combat becomes a copy of your creature with hexproof until end of turn", () => {
    const { game, a } = table();
    const oko = spawn(game, "Oko, the Ringleader");
    const bears = spawn(game, "Grizzly Bears");
    pickTargets(a, bears);
    toStep(game, "declare-attackers");
    expect(types(game, oko)).toEqual(["creature"]);
    expect(keywords(game, oko).has("hexproof")).toBe(true);
    nextTurn(game);
    expect(types(game, oko)).toEqual(["planeswalker"]);
  });

  it("+1: draw two, then discard two — or one once you've committed a crime this turn", () => {
    const { game } = table();
    const oko = spawn(game, "Oko, the Ringleader");
    toHand(game, "Grizzly Bears");
    toHand(game, "Grizzly Bears");
    const before = hand(game).length;
    activate(game, oko, 0);
    expect(hand(game).length).toBe(before);
    toStep(game, "precombat-main");
    setTurnTotal(game.state, A, "crime", 1);
    const now = hand(game).length;
    activate(game, oko, 0);
    expect(hand(game).length).toBe(now + 1);
  });
});
