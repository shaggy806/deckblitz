/**
 * Amonkhet, the lead's cards: embalm (rule 702.128a) through `embalmAbility`.
 */
import { describe, expect, it } from "vitest";

import { A, activate, keywords, lands, life, named, spawn, table, toGraveyard, toStep, zone } from "./harness.js";

describe("embalm", () => {
  it("Sacred Cat: exiled from the graveyard, a white Zombie Cat token copy with no mana cost, lifelink kept", () => {
    const { game } = table();
    lands(game, "Plains", 1);
    const cat = toGraveyard(game, "Sacred Cat");
    activate(game, cat, 0);
    expect(zone(game, cat)).toBe("exile");
    const [token] = named(game, "Sacred Cat", A).filter((id) => game.state.objects[id].zone === "battlefield");
    const view = game.viewFor(A).objects[token];
    expect(view?.isToken).toBe(true);
    expect(view?.colors).toEqual(["W"]);
    expect(view?.subtypes).toEqual(expect.arrayContaining(["Zombie", "Cat"]));
    expect(keywords(game, token).has("lifelink")).toBe(true);
  });

  it("only as a sorcery", () => {
    const { game } = table();
    lands(game, "Plains", 1);
    const cat = toGraveyard(game, "Sacred Cat");
    toStep(game, "begin-combat");
    expect(() => activate(game, cat, 0)).toThrow();
  });

  it("Anointer Priest's embalmed copy gains life for itself entering", () => {
    const { game } = table();
    lands(game, "Plains", 4);
    spawn(game, "Grizzly Bears");
    const priest = toGraveyard(game, "Anointer Priest");
    const before = life(game);
    activate(game, priest, 0);
    expect(life(game)).toBe(before + 1);
  });
});
