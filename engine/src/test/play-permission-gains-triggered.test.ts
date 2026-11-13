/**
 * A play permission's `gainsTriggered` — Serra Paragon: "once during each of
 * your turns, you may play a land from your graveyard or cast a permanent
 * spell with mana value 3 or less from your graveyard. If you do, it gains
 * 'When this permanent is put into a graveyard from the battlefield, exile it
 * and you gain 2 life.'"
 */
import { describe, expect, it } from "vitest";

import { A, cast, destroy, lands, life, spawn, table, toGraveyard, zone } from "./harness.js";

describe("Serra Paragon", () => {
  it("a creature cast from the graveyard dies, is exiled, and you gain 2 life", () => {
    const { game } = table();
    spawn(game, "Serra Paragon");
    lands(game, "Forest", 2);
    const bears = toGraveyard(game, "Grizzly Bears");
    cast(game, bears, { via: "graveyard-permission" });
    expect(zone(game, bears)).toBe("battlefield");
    destroy(game, bears);
    expect(zone(game, bears)).toBe("exile");
    expect(life(game, A)).toBe(22);
  });

  it("a land played from the graveyard gains it too, even with the Paragon gone", () => {
    const { game } = table();
    const paragon = spawn(game, "Serra Paragon");
    const forest = toGraveyard(game, "Forest");
    game.dispatch({ type: "play-land", player: A, card: forest });
    expect(zone(game, forest)).toBe("battlefield");
    destroy(game, paragon);
    destroy(game, forest);
    expect(zone(game, forest)).toBe("exile");
    expect(life(game, A)).toBe(22);
  });

  it("once a turn, shared: after the land, the creature can't be cast from there", () => {
    const { game } = table();
    spawn(game, "Serra Paragon");
    lands(game, "Forest", 2);
    const forest = toGraveyard(game, "Forest");
    const bears = toGraveyard(game, "Grizzly Bears");
    game.dispatch({ type: "play-land", player: A, card: forest });
    expect(() => cast(game, bears, { via: "graveyard-permission" })).toThrow();
  });

  it("the same creature cast from hand gains nothing", () => {
    const { game } = table();
    spawn(game, "Serra Paragon");
    const bears = spawn(game, "Grizzly Bears");
    destroy(game, bears);
    expect(zone(game, bears)).toBe("graveyard");
    expect(life(game, A)).toBe(20);
  });
});
