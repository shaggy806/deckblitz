/**
 * "Becomes the target of an Aura spell" — `becomes-target` with a
 * `spellFilter` of `{ subtype: "Aura" }` (the spell as it is on the stack,
 * whoever controls it; never an ability), on the permanent itself (`who:
 * "self"`) or the one its Aura enchants (`who: "attached"`). Brine Comber //
 * Brinebound Gift, Fugitive Druid.
 */
import { describe, expect, it } from "vitest";

import { A, B, activate, cast, destroy, enter, hand, lands, nextTurn, ref, spawn, table, tokensNamed, toGraveyard, toHand, zone } from "./harness.js";

describe("Brine Comber", () => {
  it("entering makes a Spirit, and so does becoming the target of an Aura spell", () => {
    const { game } = table();
    const comber = enter(game, "Brine Comber", A);
    expect(tokensNamed(game, "Spirit Token", A)).toBe(1);
    lands(game, "Forest", 1);
    cast(game, toHand(game, "Rancor"), { targets: [ref(comber)] });
    expect(tokensNamed(game, "Spirit Token", A)).toBe(2);
  });

  it("an instant or an ability targeting it makes none", () => {
    const { game } = table();
    const comber = spawn(game, "Brine Comber", A);
    lands(game, "Forest", 1);
    cast(game, toHand(game, "Giant Growth"), { targets: [ref(comber)] });
    activate(game, spawn(game, "Prodigal Sorcerer", A), 0, { targets: [ref(comber)] });
    expect(tokensNamed(game, "Spirit Token", A)).toBe(0);
  });

  it("an opponent's Aura spell counts too", () => {
    const { game } = table();
    const comber = spawn(game, "Brine Comber", A);
    nextTurn(game);
    lands(game, "Plains", 2, B);
    cast(game, toHand(game, "Pacifism", B), { player: B, targets: [ref(comber)] });
    expect(tokensNamed(game, "Spirit Token", A)).toBe(1);
  });

  it("disturbed, Brinebound Gift makes a Spirit as it enters, another when its creature becomes an Aura spell's target, and is exiled", () => {
    const { game } = table();
    const bears = spawn(game, "Grizzly Bears", A);
    const card = toGraveyard(game, "Brine Comber", A);
    lands(game, "Plains", 1);
    lands(game, "Island", 1);
    // Its own Aura spell targets the creature before the Gift is on the
    // battlefield: only the enters half triggers.
    cast(game, card, { targets: [ref(bears)], via: "disturb", face: 1 });
    expect(zone(game, card)).toBe("battlefield");
    expect(game.state.objects[card].attachedTo).toBe(bears);
    expect(tokensNamed(game, "Spirit Token", A)).toBe(1);
    lands(game, "Forest", 1);
    cast(game, toHand(game, "Rancor"), { targets: [ref(bears)] });
    expect(tokensNamed(game, "Spirit Token", A)).toBe(2);
    // Another creature targeted by an Aura spell isn't the enchanted one.
    const other = spawn(game, "Grizzly Bears", A);
    lands(game, "Forest", 1);
    cast(game, toHand(game, "Rancor"), { targets: [ref(other)] });
    expect(tokensNamed(game, "Spirit Token", A)).toBe(2);
    destroy(game, card);
    expect(zone(game, card)).toBe("exile");
  });
});

describe("Fugitive Druid", () => {
  it("draws a card when it becomes the target of an Aura spell, not of an instant", () => {
    const { game } = table();
    const druid = spawn(game, "Fugitive Druid", A);
    lands(game, "Forest", 2);
    const growth = toHand(game, "Giant Growth");
    const rancor = toHand(game, "Rancor");
    const before = hand(game, A).length;
    cast(game, growth, { targets: [ref(druid)] });
    expect(hand(game, A).length).toBe(before - 1);
    cast(game, rancor, { targets: [ref(druid)] });
    expect(hand(game, A).length).toBe(before - 1);
  });
});
