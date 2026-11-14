/**
 * The `this-way` condition's `sharing: "all-card-types"`: "if two cards that
 * share all their card types were milled this way" (Demonic Covenant) — the
 * same combination of card types exactly, so an artifact creature and a
 * creature don't (the ruling; rule 205.2a).
 */

import { describe, expect, it } from "vitest";

import { A, attack, hand, life, settle, spawn, table, toLibrary, toStep, tokensNamed, zone } from "./harness.js";

describe("Demonic Covenant", () => {
  it("makes a Demon and mills two; two creature cards sacrifice it", () => {
    const { game } = table();
    const covenant = spawn(game, "Demonic Covenant");
    toLibrary(game, "Grizzly Bears");
    toLibrary(game, "Llanowar Elves");
    toStep(game, "end");
    settle(game);
    expect(tokensNamed(game, "5/5 Demon Token", A)).toBe(1);
    expect(zone(game, covenant)).toBe("graveyard");
  });

  it("an artifact creature and a creature don't share all their card types", () => {
    const { game } = table();
    const covenant = spawn(game, "Demonic Covenant");
    toLibrary(game, "Grizzly Bears");
    toLibrary(game, "Ornithopter");
    toStep(game, "end");
    settle(game);
    expect(tokensNamed(game, "5/5 Demon Token", A)).toBe(1);
    expect(zone(game, covenant)).toBe("battlefield");
  });

  it("two lands do, whatever their supertypes", () => {
    const { game } = table();
    const covenant = spawn(game, "Demonic Covenant");
    toLibrary(game, "Forest");
    toLibrary(game, "Command Tower");
    toStep(game, "end");
    settle(game);
    expect(zone(game, covenant)).toBe("graveyard");
  });

  it("a Demon attacking a player: you draw a card and lose 1 life", () => {
    const { game, a } = table();
    spawn(game, "Demonic Covenant");
    const demon = spawn(game, "Archfiend of Despair");
    const bears = spawn(game, "Grizzly Bears");
    const before = hand(game, A).length;
    attack(game, a, [demon, bears]);
    expect(hand(game, A).length).toBe(before + 1);
    expect(life(game, A)).toBe(19);
  });

  it("no Demon attacking, no trigger", () => {
    const { game, a } = table();
    spawn(game, "Demonic Covenant");
    const bears = spawn(game, "Grizzly Bears");
    const before = hand(game, A).length;
    attack(game, a, [bears]);
    expect(hand(game, A).length).toBe(before);
    expect(life(game, A)).toBe(20);
  });
});
