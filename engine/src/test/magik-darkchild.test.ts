/**
 * Magik, Illyana Rasputin // Darkchild, Demon Uncaged (a modal DFC that
 * transforms, rule 701.27a). Darkchild's upkeep exiles down to a nonland card
 * and lets every card exiled that way be played this turn, lands included.
 */
import { describe, expect, it } from "vitest";

import type { Game } from "../game.js";
import type { ObjectId } from "../primitives.js";

import { A, B, activate, life, nextTurn, pickModes, ref, spawn, table, toLibrary, toStep, zone, cast } from "./harness.js";

const playable = (game: Game, id: ObjectId): boolean =>
  game
    .legalActions(A)
    .some((a) => (a.kind === "play-land" || a.kind === "cast-spell") && "card" in a && a.card === id);

function transformedMagik(sacrifices: number): { game: Game; magik: ObjectId; a: ReturnType<typeof table>["a"] } {
  const { game, a } = table();
  const magik = spawn(game, "Magik, Illyana Rasputin");
  const altar = spawn(game, "Ashnod's Altar");
  for (let i = 0; i < sacrifices; i += 1) {
    const bears = spawn(game, "Grizzly Bears");
    activate(game, altar, 0, { sacrifice: bears });
  }
  pickModes(a, 0);
  toStep(game, "end");
  game.advanceUntil((s) => s.turn.step === "cleanup" || s.turn.number > 1);
  return { game, magik, a };
}

describe("Magik, Illyana Rasputin", () => {
  it("transforms at your end step after two sacrifices", () => {
    const { game, magik } = transformedMagik(2);
    expect(game.state.objects[magik].face).toBe(1);
  });

  it("doesn't transform after only one", () => {
    const { game, magik } = transformedMagik(1);
    expect(game.state.objects[magik].face ?? 0).toBe(0);
  });
});

describe("Darkchild, Demon Uncaged", () => {
  it("exiles lands down to a nonland card, and every one of them may be played this turn", () => {
    const { game } = transformedMagik(2);
    const bolt = toLibrary(game, "Lightning Bolt");
    const forest = toLibrary(game, "Forest");
    const mountain = toLibrary(game, "Mountain");
    nextTurn(game); // bob's
    nextTurn(game); // alice's: the upkeep trigger has resolved
    expect([zone(game, mountain), zone(game, forest), zone(game, bolt)]).toEqual(["exile", "exile", "exile"]);
    expect(playable(game, mountain)).toBe(true);
    expect(playable(game, forest)).toBe(true);
    game.dispatch({ type: "play-land", player: A, card: mountain });
    expect(zone(game, mountain)).toBe("battlefield");
    cast(game, bolt, { targets: [ref(B)], via: "impulse" });
    expect(life(game, B)).toBe(17);
    // The permission ends with the turn.
    nextTurn(game);
    nextTurn(game);
    expect(zone(game, forest)).toBe("exile");
    expect(playable(game, forest)).toBe(false);
  });

  it("pays 4 life to gain indestructible, and taps", () => {
    const { game, magik } = transformedMagik(2);
    toLibrary(game, "Grizzly Bears");
    nextTurn(game);
    nextTurn(game);
    const before = life(game, A);
    activate(game, magik, 0);
    expect(life(game, A)).toBe(before - 4);
    expect(game.state.objects[magik].tapped).toBe(true);
  });
});
