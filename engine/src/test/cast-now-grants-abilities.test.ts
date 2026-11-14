/**
 * "You may cast that card without paying its mana cost. If you cast a
 * creature spell this way, it gains haste and 'At the beginning of the end
 * step, sacrifice this creature.'" — Strago and Relm: a `cast-now`'s
 * `gainsHaste: "indefinitely"` and `gainsTriggered`, only for a spell matching
 * its `gainsIf` as it's cast (rule 400.7h). Written from the Oracle text.
 */
import { describe, expect, it } from "vitest";

import { A, B, activate, keywords, lands, life, ref, settle, spawn, table, toLibrary, toStep, zone } from "./harness.js";

describe("Strago and Relm", () => {
  it("a creature cast this way has haste and is sacrificed at the end step; the cards before it stay exiled", () => {
    const { game, a } = table();
    const strago = spawn(game, "Strago and Relm");
    lands(game, "Mountain", 3);
    const bears = toLibrary(game, "Grizzly Bears", B);
    const island = toLibrary(game, "Island", B);
    let offered: readonly string[] = [];
    a.chooseCastNowFn = (_game, ask) => {
      offered = ask.cards;
      return { type: "cast-spell", player: A, card: bears, targets: [], via: "effect", free: true };
    };
    activate(game, strago, 0, { targets: [ref(B)] });
    expect(offered).toEqual([bears]);
    expect(zone(game, island)).toBe("exile");
    expect(zone(game, bears)).toBe("battlefield");
    expect(game.state.objects[bears].controller).toBe(A);
    expect(keywords(game, bears)).toContain("haste");
    // "It gains haste" states no duration (rule 611.2a).
    const haste = game.state.objects[bears].modifiers.find((m) => m.keywords.includes("haste"));
    expect(haste?.untilEndOfTurn).toBe(false);
    toStep(game, "end");
    settle(game);
    // Sacrificed: into its owner's graveyard.
    expect(zone(game, bears)).toBe("graveyard");
  });

  it("an instant cast this way just resolves, gaining nothing", () => {
    const { game, a } = table();
    const strago = spawn(game, "Strago and Relm");
    lands(game, "Mountain", 3);
    const bolt = toLibrary(game, "Lightning Bolt", B);
    a.chooseCastNowFn = () => ({ type: "cast-spell", player: A, card: bolt, targets: [ref(B)], via: "effect", free: true });
    activate(game, strago, 0, { targets: [ref(B)] });
    expect(life(game, B)).toBe(17);
    expect(zone(game, bolt)).toBe("graveyard");
  });

  it("declining leaves the card exiled", () => {
    const { game } = table();
    const strago = spawn(game, "Strago and Relm");
    lands(game, "Mountain", 3);
    const bears = toLibrary(game, "Grizzly Bears", B);
    activate(game, strago, 0, { targets: [ref(B)] });
    expect(zone(game, bears)).toBe("exile");
  });

  it("a creature card cast as its noncreature face isn't a creature spell: it gains neither", () => {
    const { game, a } = table();
    const strago = spawn(game, "Strago and Relm");
    lands(game, "Mountain", 3);
    const tergrid = toLibrary(game, "Tergrid, God of Fright", B);
    a.chooseCastNowFn = () => ({ type: "cast-spell", player: A, card: tergrid, targets: [], via: "effect", free: true, face: 1 });
    activate(game, strago, 0, { targets: [ref(B)] });
    expect(zone(game, tergrid)).toBe("battlefield");
    expect(keywords(game, tergrid)).not.toContain("haste");
    expect(game.state.objects[tergrid].modifiers.some((m) => m.grantsTriggered !== undefined)).toBe(false);
    toStep(game, "end");
    settle(game);
    expect(zone(game, tergrid)).toBe("battlefield");
  });

  it("is activated only as a sorcery", () => {
    const { game } = table();
    const strago = spawn(game, "Strago and Relm");
    lands(game, "Mountain", 3);
    toLibrary(game, "Grizzly Bears", B);
    toStep(game, "upkeep");
    expect(() => activate(game, strago, 0, { targets: [ref(B)] })).toThrow(/main phase/i);
  });
});
