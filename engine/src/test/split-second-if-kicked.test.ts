/**
 * A printed split second with a condition (rule 702.61a): Molten Disaster's
 * "if this spell was kicked, it has split second" — `splitSecond: { kind:
 * "self-kicked" }`, read from the spell's side wherever split second is
 * asked, as a conditional "this spell can't be countered" is.
 */

import { describe, expect, it } from "vitest";

import type { Game } from "../game.js";
import type { ObjectId, PlayerId } from "../primitives.js";
import { A, B, cast, lands, life, settle, spawn, table, toHand, zone } from "./harness.js";

const castable = (game: Game, player: PlayerId, card: ObjectId): boolean =>
  game.legalActions(player).some((o) => o.kind === "cast-spell" && o.card === card);

function setUp(): { game: Game; disaster: ObjectId; bolt: ObjectId } {
  const { game } = table();
  lands(game, "Mountain", 5);
  lands(game, "Mountain", 1, B);
  const disaster = toHand(game, "Molten Disaster");
  const bolt = toHand(game, "Lightning Bolt", B);
  return { game, disaster, bolt };
}

describe("Molten Disaster", () => {
  it("kicked, it has split second: no one casts a spell while it's on the stack", () => {
    const { game, disaster, bolt } = setUp();
    cast(game, disaster, { x: 1, kicked: true, settle: false });
    expect(zone(game, disaster)).toBe("stack");
    game.dispatch({ type: "pass-priority", player: A });
    expect(game.state.priority.holder).toBe(B);
    expect(castable(game, B, bolt)).toBe(false);
    expect(() => cast(game, bolt, { player: B, targets: [{ kind: "player", player: A }], settle: false })).toThrow();
    // Mana abilities are still fine (rule 702.61b).
    expect(game.legalActions(B).some((o) => o.kind === "activate-ability")).toBe(true);
  });

  it("unkicked, it has no split second", () => {
    const { game, disaster, bolt } = setUp();
    cast(game, disaster, { x: 1, settle: false });
    game.dispatch({ type: "pass-priority", player: A });
    expect(game.state.priority.holder).toBe(B);
    expect(castable(game, B, bolt)).toBe(true);
  });

  it("deals X damage to each creature without flying and each player", () => {
    const { game, disaster } = setUp();
    const bears = spawn(game, "Grizzly Bears", B);
    const crow = spawn(game, "Storm Crow", B);
    cast(game, disaster, { x: 2, kicked: true });
    settle(game);
    expect(zone(game, bears)).toBe("graveyard");
    expect(zone(game, crow)).toBe("battlefield");
    expect(life(game, A)).toBe(18);
    expect(life(game, B)).toBe(18);
  });
});
