/**
 * Fifth Dawn (5DN; B213), group D. One test per card whose behaviour is more
 * than a stat line, on the clause most likely to be wrong.
 */
import { describe, expect, it } from "vitest";

import {
  A,
  B,
  activate,
  cast,
  controller,
  destroy,
  graveyard,
  keywords,
  lands,
  life,
  pickFromZone,
  pickModes,
  pickTargets,
  pt,
  ref,
  settle,
  spawn,
  table,
  toGraveyard,
  toHand,
  toLibrary,
  toStep,
  tokensNamed,
  types,
  zone,
  enter,
} from "./harness.js";

describe("Rude Awakening", () => {
  it("entwined, untaps the lands that paid for it and makes them 2/2s — not a land that arrives later", () => {
    const { game } = table();
    const forests = lands(game, "Forest", 8);
    cast(game, toHand(game, "Rude Awakening"), { kicked: true, modes: [0, 1] });
    for (const forest of forests) {
      expect(game.state.objects[forest].tapped).toBe(false);
      expect(types(game, forest)).toContain("creature");
      expect(pt(game, forest)).toEqual({ power: 2, toughness: 2 });
    }
    const late = spawn(game, "Forest");
    expect(types(game, late)).not.toContain("creature");
  });
});

describe("Summoning Station", () => {
  it("makes a 2/2 Pincher, and may untap when an artifact goes to a graveyard", () => {
    const { game, a } = table();
    const station = spawn(game, "Summoning Station");
    const ring = spawn(game, "Sol Ring", B);
    activate(game, station, 0);
    expect(tokensNamed(game, "Pincher Token", A)).toBe(1);
    expect(game.state.objects[station].tapped).toBe(true);
    pickModes(a, 0);
    destroy(game, ring);
    settle(game);
    expect(game.state.objects[station].tapped).toBe(false);
  });
});

describe("Leonin Squire", () => {
  it("returns only an artifact card of mana value 1 or less", () => {
    const { game, a } = table();
    const ring = toGraveyard(game, "Sol Ring");
    const stone = toGraveyard(game, "Mind Stone");
    pickTargets(a, ring);
    enter(game, "Leonin Squire");
    expect(zone(game, ring)).toBe("hand");
    expect(graveyard(game)).toContain(stone);

    // With only a mana value 2 artifact there, nothing comes back.
    const second = table();
    const lone = toGraveyard(second.game, "Mind Stone");
    pickTargets(second.a, lone);
    enter(second.game, "Leonin Squire");
    expect(zone(second.game, lone)).toBe("graveyard");
  });
});

describe("Bringer of the Black Dawn", () => {
  it("is cast for {W}{U}{B}{R}{G}, and pays 2 life at upkeep to put a searched card on top", () => {
    const { game, a } = table();
    for (const land of ["Plains", "Island", "Swamp", "Mountain", "Forest"]) spawn(game, land);
    const bringer = toHand(game, "Bringer of the Black Dawn");
    cast(game, bringer, { altCost: true });
    expect(zone(game, bringer)).toBe("battlefield");

    const wanted = toLibrary(game, "Sol Ring");
    pickModes(a, 0);
    pickFromZone(a, wanted);
    toStep(game, "upkeep");
    settle(game);
    expect(life(game, A)).toBe(18);
    toStep(game, "precombat-main");
    expect(zone(game, wanted)).toBe("hand");
  });
});

describe("Bringer of the Red Dawn", () => {
  it("steals target creature at upkeep until end of turn, with haste", () => {
    const { game, a } = table();
    spawn(game, "Bringer of the Red Dawn");
    const bears = spawn(game, "Grizzly Bears", B);
    pickTargets(a, bears);
    pickModes(a, 0);
    toStep(game, "upkeep");
    settle(game);
    expect(controller(game, bears)).toBe(A);
    expect(keywords(game, bears).has("haste")).toBe(true);
  });
});

describe("Viridian Lorebearers", () => {
  it("gives +X/+X for the artifacts your opponents control", () => {
    const { game } = table();
    const lorebearers = spawn(game, "Viridian Lorebearers");
    lands(game, "Forest", 4);
    spawn(game, "Sol Ring", B);
    spawn(game, "Mind Stone", B);
    spawn(game, "Sol Ring", A); // yours don't count
    const bears = spawn(game, "Grizzly Bears");
    activate(game, lorebearers, 0, { targets: [ref(bears)] });
    expect(pt(game, bears)).toEqual({ power: 4, toughness: 4 });
  });
});

describe("Healer's Headdress", () => {
  it("gives the equipped creature +0/+2 and a {T} prevention ability", () => {
    const { game } = table();
    const headdress = spawn(game, "Healer's Headdress");
    const bears = spawn(game, "Grizzly Bears");
    spawn(game, "Wastes");
    activate(game, headdress, 1, { targets: [ref(bears)] });
    expect(pt(game, bears)).toEqual({ power: 2, toughness: 4 });
    activate(game, bears, 0, { targets: [ref(A)] });
    expect(game.state.objects[bears].tapped).toBe(true);
  });
});
