/**
 * `{ paid: "returned" }` — what a "return a permanent you control to its
 * owner's hand" cost took, read as it last existed on the battlefield (rule
 * 608.2h) — Wonderscape Sage's "Then discard a card unless that land had a
 * nonbasic land type", by its land types then, not whether it was nonbasic
 * (the rulings).
 */
import { describe, expect, it } from "vitest";

import type { ObjectId } from "../primitives.js";
import { A, activate, hand, pickPermanents, ref, settle, spawn, table, zone } from "./harness.js";
import type { Game } from "../game.js";

/** Activate the Sage and let it resolve: how many cards were discarded. */
function loot(game: Game, sage: ObjectId): number {
  let discards = 0;
  const before = game.state.eventLog.length;
  activate(game, sage);
  for (const e of game.state.eventLog.slice(before)) if (e.type === "cards-discarded") discards += e.objects.length;
  return discards;
}

describe("returned for a cost, as it last existed — Wonderscape Sage", () => {
  it("a basic land returned: draw, then discard", () => {
    const { game, a } = table();
    const sage = spawn(game, "Wonderscape Sage");
    const forest = spawn(game, "Forest");
    a.chooseDiscardsFn = (cards) => [cards[0].id];
    const held = hand(game).length;
    expect(loot(game, sage)).toBe(1);
    expect(zone(game, forest)).toBe("hand");
    // The Forest back, a card drawn, a card discarded.
    expect(hand(game).length).toBe(held + 1);
  });

  it("a land with a nonbasic land type returned: draw, no discard", () => {
    const { game } = table();
    const sage = spawn(game, "Wonderscape Sage");
    const gate = spawn(game, "Azorius Guildgate");
    const held = hand(game).length;
    expect(loot(game, sage)).toBe(0);
    expect(zone(game, gate)).toBe("hand");
    expect(hand(game).length).toBe(held + 2);
  });

  it("a nonbasic land with no land type still means a discard", () => {
    const { game, a } = table();
    const sage = spawn(game, "Wonderscape Sage");
    spawn(game, "Command Tower");
    a.chooseDiscardsFn = (cards) => [cards[0].id];
    expect(loot(game, sage)).toBe(1);
  });

  it("reads the land as it was on the battlefield: a Forest with an everything counter", () => {
    const { game, a } = table();
    const sage = spawn(game, "Wonderscape Sage");
    spawn(game, "Omo, Queen of Vesuva");
    const forest = spawn(game, "Forest");
    game.debugApplyEffect(A, { kind: "add-counter", target: 0, counter: "everything", amount: 1 }, [ref(forest)]);
    settle(game);
    a.chooseDiscardsFn = (cards) => [cards[0].id];
    expect(loot(game, sage)).toBe(0);
    expect(zone(game, forest)).toBe("hand");
  });

  it("the land chosen of several is the one read", () => {
    const { game, a } = table();
    const sage = spawn(game, "Wonderscape Sage");
    const forest = spawn(game, "Forest");
    const gate = spawn(game, "Azorius Guildgate");
    a.chooseDiscardsFn = (cards) => [cards[0].id];
    pickPermanents(a, gate);
    expect(loot(game, sage)).toBe(0);
    expect(zone(game, gate)).toBe("hand");
    expect(zone(game, forest)).toBe("battlefield");
    // Untap it and return the Forest this time.
    game.debugApplyEffect(A, { kind: "untap", target: 0 }, [ref(sage)]);
    settle(game);
    pickPermanents(a, forest);
    expect(loot(game, sage)).toBe(1);
    expect(zone(game, forest)).toBe("hand");
  });
});
