/**
 * A play permission's `gainsExileIfLeaves` — The Eighth Doctor: "once during
 * each of your turns, you may play a historic land or cast a historic
 * permanent spell from your graveyard. If you do, it gains 'If this permanent
 * would leave the battlefield, exile it instead of putting it anywhere
 * else.'" The spell and the permanent it becomes, or the land as it enters,
 * have the ability (a layer-6 grant, rule 613.1f), whatever becomes of the
 * Doctor; historic is artifact, legendary or Saga (rule 700.6).
 */
import { describe, expect, it } from "vitest";

import { A, B, cast, destroy, enter, graveyard, lands, ref, spawn, table, toGraveyard, toHand, zone } from "./harness.js";

describe("The Eighth Doctor", () => {
  it("mills three cards as it enters", () => {
    const { game } = table();
    const before = graveyard(game).length;
    enter(game, "The Eighth Doctor");
    expect(graveyard(game).length).toBe(before + 3);
  });

  it("a historic permanent cast from the graveyard is exiled when it would leave, even to a hand", () => {
    const { game } = table();
    const doctor = spawn(game, "The Eighth Doctor");
    const thopter = toGraveyard(game, "Ornithopter");
    cast(game, thopter, { via: "graveyard-permission" });
    expect(zone(game, thopter)).toBe("battlefield");
    destroy(game, doctor);
    lands(game, "Island", 1);
    cast(game, toHand(game, "Unsummon"), { targets: [ref(thopter)] });
    expect(zone(game, thopter)).toBe("exile");
  });

  it("a historic land played from the graveyard gains it too", () => {
    const { game } = table();
    spawn(game, "The Eighth Doctor");
    const citadel = toGraveyard(game, "Darksteel Citadel");
    game.dispatch({ type: "play-land", player: A, card: citadel });
    expect(zone(game, citadel)).toBe("battlefield");
    game.debugMove(citadel, "graveyard");
    expect(zone(game, citadel)).toBe("exile");
  });

  it("only historic cards: not a plain creature, not a basic land", () => {
    const { game } = table();
    spawn(game, "The Eighth Doctor");
    lands(game, "Forest", 2);
    const bears = toGraveyard(game, "Grizzly Bears");
    const forest = toGraveyard(game, "Forest");
    expect(() => cast(game, bears, { via: "graveyard-permission" })).toThrow();
    expect(() => game.dispatch({ type: "play-land", player: A, card: forest })).toThrow();
    expect(zone(game, bears)).toBe("graveyard");
    expect(zone(game, forest)).toBe("graveyard");
  });

  it("once a turn, shared between the land and the spell", () => {
    const { game } = table();
    spawn(game, "The Eighth Doctor");
    const citadel = toGraveyard(game, "Darksteel Citadel");
    const thopter = toGraveyard(game, "Ornithopter");
    game.dispatch({ type: "play-land", player: A, card: citadel });
    expect(() => cast(game, thopter, { via: "graveyard-permission" })).toThrow();
    expect(zone(game, thopter)).toBe("graveyard");
  });

  it("the same card cast from the hand gains nothing", () => {
    const { game } = table();
    spawn(game, "The Eighth Doctor");
    const thopter = toHand(game, "Ornithopter");
    cast(game, thopter);
    lands(game, "Island", 1);
    cast(game, toHand(game, "Unsummon"), { targets: [ref(thopter)] });
    expect(zone(game, thopter)).toBe("hand");
  });

  it("an opponent's Doctor gives you nothing", () => {
    const { game } = table();
    spawn(game, "The Eighth Doctor", B);
    const thopter = toGraveyard(game, "Ornithopter");
    expect(() => cast(game, thopter, { via: "graveyard-permission" })).toThrow();
  });
});
