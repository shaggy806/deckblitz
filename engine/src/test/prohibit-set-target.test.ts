/**
 * "Until the end of your next turn, they can't phase in": a `prohibit` of
 * `phase-in` whose `target` is a set (`{ thisWay: "phased-out" }`), each
 * member bound as it is (rule 400.7). The permanents skip their controller's
 * untap steps (rule 502.1) until the effect's controller's next turn has
 * ended (611.2a), whatever becomes of the source, then phase in at the next
 * one. A player who has left ends it as their turn would have begun
 * (800.4m). Teferi, Timeless Voyager.
 */
import { describe, expect, it } from "vitest";

import type { Game } from "../game.js";
import type { ObjectId, PlayerId } from "../primitives.js";

import { A, B, activate, destroy, nextTurn, ref, settle, spawn, table, zone } from "./harness.js";

/** Alice's Teferi, with loyalty enough for its −8, used on `opponent`. */
function ultimate(game: Game, opponent: PlayerId): ObjectId {
  const teferi = spawn(game, "Teferi, Timeless Voyager", A);
  game.debugApplyEffect(A, { kind: "add-counter", target: 0, counter: "loyalty", amount: 4 }, [ref(teferi)]);
  settle(game);
  activate(game, teferi, 2, { targets: [{ kind: "player", player: opponent }] });
  return teferi;
}

describe("Teferi, Timeless Voyager's −8", () => {
  it("phases out each creature the target opponent controls, and only theirs", () => {
    const { game } = table();
    const bears = spawn(game, "Grizzly Bears", B);
    const ogre = spawn(game, "Gray Ogre", B);
    const mine = spawn(game, "Grizzly Bears", A);
    ultimate(game, B);
    expect(zone(game, bears)).toBe("phased-out");
    expect(zone(game, ogre)).toBe("phased-out");
    expect(zone(game, mine)).toBe("battlefield");
  });

  it("they stay out through their controller's next untap step and alice's next turn, then phase in", () => {
    const { game } = table();
    const bears = spawn(game, "Grizzly Bears", B);
    ultimate(game, B);
    nextTurn(game); // bob's turn: no phasing in
    expect(zone(game, bears)).toBe("phased-out");
    nextTurn(game); // alice's next turn
    expect(zone(game, bears)).toBe("phased-out");
    nextTurn(game); // bob's turn after that: they phase in
    expect(zone(game, bears)).toBe("battlefield");
  });

  it("the hold outlasts Teferi", () => {
    const { game } = table();
    const bears = spawn(game, "Grizzly Bears", B);
    const teferi = ultimate(game, B);
    if (zone(game, teferi) === "battlefield") destroy(game, teferi);
    nextTurn(game);
    expect(zone(game, bears)).toBe("phased-out");
    nextTurn(game);
    nextTurn(game);
    expect(zone(game, bears)).toBe("battlefield");
  });

  it("at three players, they wait through the other opponent's turn too", () => {
    const { game } = table({ players: 3 });
    const bears = spawn(game, "Grizzly Bears", B);
    ultimate(game, B);
    nextTurn(game); // bob
    nextTurn(game); // carol
    nextTurn(game); // alice's next turn
    expect(zone(game, bears)).toBe("phased-out");
    nextTurn(game); // bob again
    expect(zone(game, bears)).toBe("battlefield");
  });

  it("if alice leaves the game, the hold ends as her turn would have begun (rule 800.4m)", () => {
    const { game } = table({ players: 3 });
    const bears = spawn(game, "Grizzly Bears", B);
    ultimate(game, B);
    nextTurn(game); // bob
    game.concede(A);
    settle(game);
    nextTurn(game); // carol
    expect(zone(game, bears)).toBe("phased-out");
    nextTurn(game); // bob: alice's turn would have begun before this one
    expect(zone(game, bears)).toBe("battlefield");
  });
});
