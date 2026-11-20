/**
 * Vanish into Memory: a delayed flicker whose `returnThen` reads the object
 * that came back — "if you do, discard cards equal to that creature's
 * toughness" counts the returned creature's toughness (its rulings), while the
 * draw counts the exiled creature's power as it last existed (rule 608.2h).
 */

import { describe, expect, it } from "vitest";

import { A, B, cast, hand, lands, ref, settle, spawn, table, toHand, toStep, zone } from "./harness.js";
import type { ObjectId } from "../primitives.js";

type G = ReturnType<typeof table>["game"];

function setUp(): { game: G; spell: ObjectId } {
  const { game } = table();
  lands(game, "Plains", 2);
  lands(game, "Island", 2);
  const spell = toHand(game, "Vanish into Memory");
  for (let i = 0; i < 6; i++) toHand(game, "Grizzly Bears");
  return { game, spell };
}

const pump = (game: G, id: ObjectId, n: number): void => {
  game.debugApplyEffect(A, { kind: "add-counter", target: 0, counter: "+1/+1", amount: n }, [ref(id)]);
  settle(game);
};

describe("Vanish into Memory", () => {
  it("draws by the exiled creature's power, then discards by the returned creature's toughness", () => {
    const { game, spell } = setUp();
    const bears = spawn(game, "Grizzly Bears", B);
    pump(game, bears, 2);
    const before = hand(game).length;
    cast(game, spell, { targets: [ref(bears)] });
    expect(zone(game, bears)).toBe("exile");
    // Cast one card, drew four (a 4/4 as it left).
    expect(hand(game).length).toBe(before - 1 + 4);
    toStep(game, "upkeep");
    const atUpkeep = hand(game).length;
    settle(game);
    const back = game.battlefield.find((id) => game.state.objects[id].cardName === "Grizzly Bears");
    expect(back).toBeDefined();
    expect(game.state.objects[back!].controller).toBe(B);
    // Back as a plain 2/2: two discarded, not four.
    expect(hand(game).length).toBe(atUpkeep - 2);
  });

  it("a token never comes back, so nothing is discarded", () => {
    const { game, spell } = setUp();
    game.debugApplyEffect(B, { kind: "create-token", token: "Soldier Token", count: 1 }, []);
    settle(game);
    const token = game.battlefield.find((id) => game.state.objects[id].isToken);
    if (token === undefined) throw new Error("no token");
    const before = hand(game).length;
    cast(game, spell, { targets: [ref(token)] });
    expect(hand(game).length).toBe(before - 1 + 1);
    toStep(game, "upkeep");
    const atUpkeep = hand(game).length;
    settle(game);
    expect(hand(game).length).toBe(atUpkeep);
  });

  it("waits for its caster's next upkeep, not the opponent's", () => {
    const { game, spell } = setUp();
    const bears = spawn(game, "Grizzly Bears", B);
    cast(game, spell, { targets: [ref(bears)] });
    toStep(game, "upkeep", B);
    settle(game);
    expect(zone(game, bears)).toBe("exile");
    expect(game.battlefield.some((id) => game.state.objects[id].cardName === "Grizzly Bears")).toBe(false);
  });
});
