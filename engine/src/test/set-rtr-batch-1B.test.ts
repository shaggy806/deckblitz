/**
 * Return to Ravnica (B179) — group b: Niv-Mizzet, the Keyrunes, scavenge and
 * the rest of the group's commons and uncommons.
 */
import { describe, expect, it } from "vitest";

import {
  A,
  B,
  activate,
  cast,
  counters,
  destroy,
  enter,
  hand,
  keywords,
  lands,
  life,
  nextTurn,
  pickModes,
  pickPermanents,
  pickTargets,
  pt,
  ref,
  settle,
  spawn,
  table,
  toGraveyard,
  toHand,
  toLibrary,
  tokensNamed,
  types,
  zone,
} from "./harness.js";

describe("Niv-Mizzet, Dracogenius", () => {
  it("draws when its own ping deals damage to a player", () => {
    const { game, a } = table();
    const niv = spawn(game, "Niv-Mizzet, Dracogenius");
    lands(game, "Island", 1);
    lands(game, "Mountain", 1);
    const before = hand(game).length;
    pickModes(a, 0);
    activate(game, niv, 0, { targets: [ref(B)] });
    expect(life(game, B)).toBe(19);
    expect(hand(game).length).toBe(before + 1);
  });
});

describe("Treasured Find", () => {
  it("returns a card from your graveyard and exiles itself", () => {
    const { game } = table();
    lands(game, "Swamp", 1);
    lands(game, "Forest", 1);
    const bears = toGraveyard(game, "Grizzly Bears");
    const find = toHand(game, "Treasured Find");
    cast(game, find, { targets: [ref(bears)] });
    expect(zone(game, bears)).toBe("hand");
    expect(zone(game, find)).toBe("exile");
  });
});

describe("Firemind's Foresight", () => {
  it("finds an instant of mana value 3, then 2, then 1", () => {
    const { game, a } = table();
    lands(game, "Island", 6);
    lands(game, "Mountain", 1);
    const bolt = toLibrary(game, "Lightning Bolt");
    const counter = toLibrary(game, "Counterspell");
    const cancel = toLibrary(game, "Cancel");
    a.chooseFromZoneFn = (_view, eligible) => eligible.slice(0, 1);
    cast(game, toHand(game, "Firemind's Foresight"));
    expect([zone(game, cancel), zone(game, counter), zone(game, bolt)]).toEqual(["hand", "hand", "hand"]);
  });
});

describe("Drainpipe Vermin", () => {
  it("dies, pays {B} and makes the target player discard", () => {
    const { game, a } = table();
    const vermin = spawn(game, "Drainpipe Vermin");
    lands(game, "Swamp", 1);
    const before = hand(game, B).length;
    pickTargets(a, B);
    pickModes(a, 0);
    destroy(game, vermin);
    expect(hand(game, B).length).toBe(before - 1);
  });
});

describe("Rakdos Keyrune", () => {
  it("becomes a 3/1 Devil artifact creature with first strike", () => {
    const { game } = table();
    const keyrune = spawn(game, "Rakdos Keyrune");
    lands(game, "Swamp", 1);
    lands(game, "Mountain", 1);
    activate(game, keyrune, 1);
    expect(types(game, keyrune)).toEqual(expect.arrayContaining(["artifact", "creature"]));
    expect(pt(game, keyrune)).toEqual({ power: 3, toughness: 1 });
    expect(keywords(game, keyrune).has("first-strike")).toBe(true);
  });
});

describe("Faerie Impostor", () => {
  it("stays if another creature is returned", () => {
    const { game, a } = table();
    const bears = spawn(game, "Grizzly Bears");
    pickPermanents(a, bears);
    const impostor = enter(game, "Faerie Impostor");
    expect(zone(game, bears)).toBe("hand");
    expect(zone(game, impostor)).toBe("battlefield");
  });

  it("is sacrificed if nothing is returned", () => {
    const { game, a } = table();
    spawn(game, "Grizzly Bears");
    pickPermanents(a);
    const impostor = enter(game, "Faerie Impostor");
    expect(zone(game, impostor)).toBe("graveyard");
  });
});

describe("Oak Street Innkeeper", () => {
  it("gives tapped creatures you control hexproof only on other players' turns", () => {
    const { game } = table();
    spawn(game, "Oak Street Innkeeper");
    const tapped = spawn(game, "Grizzly Bears", A, { tapped: true });
    const untapped = spawn(game, "Grizzly Bears");
    expect(keywords(game, tapped).has("hexproof")).toBe(false);
    nextTurn(game);
    expect(keywords(game, tapped).has("hexproof")).toBe(true);
    expect(keywords(game, untapped).has("hexproof")).toBe(false);
  });
});

describe("Volatile Rig", () => {
  it("on a lost flip as it dies deals 4 to each creature and each player, else nothing", () => {
    for (const seed of [1, 2, 3, 4]) {
      const { game } = table({ seed });
      const rig = spawn(game, "Volatile Rig");
      const bears = spawn(game, "Grizzly Bears", B);
      destroy(game, rig);
      settle(game);
      const lost = life(game, B) === 16;
      expect(life(game, A)).toBe(lost ? 16 : 20);
      expect(zone(game, bears)).toBe(lost ? "graveyard" : "battlefield");
    }
  });
});

describe("Soul Tithe", () => {
  it("makes the enchanted permanent's controller pay its mana value at their upkeep or sacrifice it", () => {
    const { game, b } = table();
    lands(game, "Plains", 2);
    const bears = spawn(game, "Grizzly Bears", B);
    const elves = spawn(game, "Llanowar Elves", B);
    cast(game, toHand(game, "Soul Tithe"), { targets: [ref(bears)] });
    pickModes(b);
    nextTurn(game, "draw");
    expect(zone(game, bears)).toBe("graveyard");
    expect(zone(game, elves)).toBe("battlefield");
  });

  it("keeps the permanent when they pay", () => {
    const { game, b } = table();
    lands(game, "Plains", 2);
    lands(game, "Wastes", 2, B);
    const bears = spawn(game, "Grizzly Bears", B);
    cast(game, toHand(game, "Soul Tithe"), { targets: [ref(bears)] });
    pickModes(b, 0);
    nextTurn(game, "draw");
    expect(zone(game, bears)).toBe("battlefield");
  });
});

describe("Horncaller's Chant", () => {
  it("makes a Rhino, then populates it", () => {
    const { game, a } = table();
    lands(game, "Forest", 8);
    a.choosePermanentsFn = (_view, eligible) => eligible.slice(0, 1);
    cast(game, toHand(game, "Horncaller's Chant"));
    expect(tokensNamed(game, "Rhino Token", A)).toBe(2);
  });
});

describe("Korozda Monitor", () => {
  it("scavenges from the graveyard for counters equal to its power", () => {
    const { game } = table();
    lands(game, "Forest", 7);
    const bears = spawn(game, "Grizzly Bears");
    const monitor = toGraveyard(game, "Korozda Monitor");
    activate(game, monitor, 0, { targets: [ref(bears)] });
    expect(counters(game, bears)).toBe(3);
    expect(zone(game, monitor)).toBe("exile");
  });
});
