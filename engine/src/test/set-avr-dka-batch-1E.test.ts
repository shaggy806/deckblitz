/**
 * Avacyn Restored and Dark Ascension (B185), group E. One test per card
 * whose behaviour is more than a stat line, on the clause most likely to be
 * wrong.
 */
import { describe, expect, it } from "vitest";

import {
  A,
  B,
  cast,
  controller,
  enter,
  keywords,
  lands,
  life,
  named,
  nextTurn,
  pickModes,
  pickTargets,
  pt,
  ref,
  spawn,
  table,
  toHand,
  zone,
} from "./harness.js";

describe("Afflicted Deserter // Werewolf Ransacker", () => {
  it("transforms with no spells cast last turn, destroys an artifact and deals 3 to its controller", () => {
    const { game, a } = table();
    const wolf = spawn(game, "Afflicted Deserter");
    const thopter = spawn(game, "Ornithopter", B);
    pickTargets(a, thopter);
    pickModes(a, 0);
    nextTurn(game);
    expect(pt(game, wolf)).toEqual({ power: 5, toughness: 4 });
    expect(zone(game, thopter)).toBe("graveyard");
    expect(life(game, B)).toBe(17);
  });
});

describe("Thraben Doomsayer", () => {
  it("gives other creatures +2/+2 only at 5 or less life", () => {
    const { game } = table();
    const doomsayer = spawn(game, "Thraben Doomsayer");
    const bears = spawn(game, "Grizzly Bears");
    game.state.players[A].life = 6;
    expect(pt(game, bears)).toEqual({ power: 2, toughness: 2 });
    game.state.players[A].life = 5;
    expect(pt(game, bears)).toEqual({ power: 4, toughness: 4 });
    expect(pt(game, doomsayer)).toEqual({ power: 2, toughness: 2 });
  });
});

describe("Dungeon Geists", () => {
  it("keeps the tapped creature from untapping while you control it", () => {
    const { game, a } = table();
    const bears = spawn(game, "Grizzly Bears", B);
    pickTargets(a, bears);
    enter(game, "Dungeon Geists");
    expect(game.state.objects[bears].tapped).toBe(true);
    nextTurn(game);
    expect(game.state.objects[bears].tapped).toBe(true);
  });
});

describe("Spirit Away", () => {
  it("takes control of the creature and gives it +2/+2 and flying", () => {
    const { game } = table();
    const bears = spawn(game, "Grizzly Bears", B);
    lands(game, "Island", 7);
    cast(game, toHand(game, "Spirit Away"), { targets: [ref(bears)] });
    expect(controller(game, bears)).toBe(A);
    expect(pt(game, bears)).toEqual({ power: 4, toughness: 4 });
    expect(keywords(game, bears).has("flying")).toBe(true);
  });
});

describe("Rite of Ruin", () => {
  it("each player sacrifices one, two, then three in the chosen order", () => {
    const { game, a } = table();
    lands(game, "Mountain", 7);
    lands(game, "Sol Ring", 2);
    lands(game, "Grizzly Bears", 3);
    lands(game, "Mountain", 2, B);
    lands(game, "Sol Ring", 3, B);
    lands(game, "Grizzly Bears", 4, B);
    // Lands first, then artifacts, then creatures.
    pickModes(a, 4);
    cast(game, toHand(game, "Rite of Ruin"));
    expect(named(game, "Mountain", A)).toHaveLength(6);
    expect(named(game, "Sol Ring", A)).toHaveLength(0);
    expect(named(game, "Grizzly Bears", A)).toHaveLength(0);
    expect(named(game, "Mountain", B)).toHaveLength(1);
    expect(named(game, "Sol Ring", B)).toHaveLength(1);
    expect(named(game, "Grizzly Bears", B)).toHaveLength(1);
  });
});
