/**
 * Epic (rule 702.50): as an epic spell resolves, its controller can't cast
 * spells for the rest of the game, and at the beginning of each of their
 * upkeeps a copy of it, without its epic ability, goes on the stack — the
 * `epic` effect, its upkeep trigger riding an emblem.
 */
import { describe, expect, it } from "vitest";

import { A, B, cast, hand, lands, nextTurn, settle, table, toHand, toLibrary, toStep, tokensNamed, zone } from "./harness.js";

describe("Epic", () => {
  it("Endless Swarm: Snakes for the hand now and again each upkeep, one emblem, and no more spells", () => {
    const { game } = table();
    lands(game, "Forest", 8);
    const swarm = toHand(game, "Endless Swarm");
    const held = toHand(game, "Grizzly Bears");
    const inHand = hand(game).length - 1;
    cast(game, swarm);
    expect(zone(game, swarm)).toBe("graveyard");
    expect(tokensNamed(game, "Snake Token", A)).toBe(inHand);
    expect(game.state.emblems.filter((e) => e.owner === A)).toHaveLength(1);
    expect(game.state.players[A].cantCastSpellsForGame).toBe(true);
    expect(game.canDispatch({ type: "cast-spell", player: A, card: held, targets: [] })).toMatch(/rest of the game/);

    // Bob's turn: no copy on his upkeep.
    nextTurn(game);
    expect(tokensNamed(game, "Snake Token", A)).toBe(inHand);
    // Alice's upkeep: the copy counts her hand as it resolves (before her draw).
    const before = hand(game, A).length;
    toStep(game, "upkeep");
    settle(game);
    expect(tokensNamed(game, "Snake Token", A)).toBe(inHand + before);
    // The copy has no epic ability: still the one emblem.
    expect(game.state.emblems.filter((e) => e.owner === A)).toHaveLength(1);
    toStep(game, "upkeep");
    settle(game);
    expect(game.state.emblems.filter((e) => e.owner === A)).toHaveLength(1);
  });

  it("Enduring Ideal: each upkeep's copy searches for another enchantment", () => {
    const { game, a } = table();
    lands(game, "Plains", 7);
    const first = toLibrary(game, "Glorious Anthem");
    const second = toLibrary(game, "Glorious Anthem");
    a.chooseFromZoneFn = (_view, eligible) => eligible.slice(0, 1);
    cast(game, toHand(game, "Enduring Ideal"));
    const onField = [first, second].filter((id) => zone(game, id) === "battlefield");
    expect(onField).toHaveLength(1);
    toStep(game, "upkeep");
    settle(game);
    expect([first, second].every((id) => zone(game, id) === "battlefield")).toBe(true);
    expect(game.state.players[B].cantCastSpellsForGame).toBeUndefined();
  });
});
