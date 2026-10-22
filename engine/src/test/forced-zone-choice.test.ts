/**
 * `forcedZoneChoice` (auto-settle.ts): a `choose-from-zone` with only one
 * answer — every card shown taken, nothing to order — is answered by the
 * drivers (`autoSettle`, the server room's `autoAdvanceHumanSeat`) rather than
 * opening a one-card picker. Dark Confidant's revealed card is the case; a
 * look at several where only some are taken still asks.
 */
import { describe, expect, it } from "vitest";

import { autoSettle, forcedZoneChoice } from "../auto-settle.js";
import type { Game } from "../game.js";
import type { GameState } from "../state.js";

import { A, cast, hand, lands, spawn, table, toHand, toLibrary } from "./harness.js";

const toZoneChoice = (game: Game): void => game.advanceUntil((s) => s.awaiting?.kind === "choose-from-zone");

describe("forcedZoneChoice", () => {
  it("answers Dark Confidant's revealed card for its controller", () => {
    const { game } = table({ step: "end" });
    spawn(game, "Dark Confidant");
    const top = toLibrary(game, "Grizzly Bears");
    toZoneChoice(game);
    expect(game.state.turn.step).toBe("upkeep");
    expect(forcedZoneChoice(game.state)).toEqual({ player: A, chosen: [top] });

    autoSettle(game);
    expect(hand(game)).toContain(top);
    expect(game.state.players[A].life).toBe(18);
  });

  it("still asks when only some of the cards looked at are taken (Impulse)", () => {
    const { game } = table();
    for (const name of ["Grizzly Bears", "Wastes", "Wastes", "Wastes"]) toLibrary(game, name);
    lands(game, "Island", 2);
    cast(game, toHand(game, "Impulse"), { settle: false });
    toZoneChoice(game);
    expect(game.state.awaiting?.kind === "choose-from-zone" ? game.state.awaiting.ids.length : 0).toBe(4);
    expect(forcedZoneChoice(game.state)).toBeNull();
  });

  it("leaves an order, a split or a choice for another player to the picker", () => {
    const base = {
      kind: "choose-from-zone",
      player: A,
      ids: ["o1"],
      eligible: ["o1"],
      min: 1,
      max: 1,
      destination: "hand",
      leftover: "stay",
    } as const;
    const at = (awaiting: object): GameState => ({ awaiting }) as unknown as GameState;
    expect(forcedZoneChoice(at(base))).toEqual({ player: A, chosen: ["o1"] });
    expect(forcedZoneChoice(at({ ...base, min: 0 }))).toBeNull();
    expect(forcedZoneChoice(at({ ...base, ids: ["o1", "o2"] }))).toBeNull();
    expect(forcedZoneChoice(at({ ...base, order: true }))).toBeNull();
    expect(forcedZoneChoice(at({ ...base, destination: "library-top" }))).toBeNull();
    expect(forcedZoneChoice(at({ ...base, destination: "exile-face-down" }))).toBeNull();
    expect(forcedZoneChoice(at({ ...base, forPlayer: "bob" }))).toBeNull();
    expect(forcedZoneChoice(at({ ...base, restDestination: "hand" }))).toBeNull();
  });
});
