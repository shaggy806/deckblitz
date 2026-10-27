/**
 * Scourge (SCG) — group E of the set walk: Force Bubble's damage replacement,
 * the Dragon Auras' graveyard return, Clutch of Undeath, Metamorphose and the
 * turned-face-up triggers.
 */
import { describe, expect, it } from "vitest";

import type { Action } from "../actions.js";
import {
  A,
  B,
  attack,
  cast,
  counters,
  enter,
  graveyard,
  lands,
  life,
  pickFromZone,
  pickModes,
  pt,
  ref,
  settle,
  spawn,
  table,
  toGraveyard,
  toHand,
  zone,
} from "./harness.js";

describe("Force Bubble", () => {
  it("turns damage to you into depletion counters, and is sacrificed at four", () => {
    const { game } = table();
    lands(game, "Mountain", 2);
    const bubble = spawn(game, "Force Bubble");
    cast(game, toHand(game, "Lightning Bolt"), { targets: [ref(A)] });
    expect(life(game, A)).toBe(20);
    expect(counters(game, bubble, "depletion")).toBe(3);
    cast(game, toHand(game, "Lightning Bolt"), { targets: [ref(A)] });
    expect(life(game, A)).toBe(20);
    expect(zone(game, bubble)).toBe("graveyard");
  });
});

describe("Dragon Fangs", () => {
  it("returns from the graveyard attached to an opponent's creature with mana value 6", () => {
    const { game, a } = table();
    const fangs = toGraveyard(game, "Dragon Fangs");
    pickModes(a, 0);
    const wurm = enter(game, "Craw Wurm", B);
    expect(zone(game, fangs)).toBe("battlefield");
    expect(pt(game, wurm)).toEqual({ power: 7, toughness: 5 });
  });

  it("ignores a creature with smaller mana value", () => {
    const { game, a } = table();
    const fangs = toGraveyard(game, "Dragon Fangs");
    pickModes(a, 0);
    enter(game, "Grizzly Bears", B);
    expect(zone(game, fangs)).toBe("graveyard");
  });
});

describe("Clutch of Undeath", () => {
  it("gives a Zombie +3/+3 and anything else -3/-3", () => {
    const { game } = table();
    lands(game, "Swamp", 10);
    const corpse = spawn(game, "Walking Corpse");
    cast(game, toHand(game, "Clutch of Undeath"), { targets: [ref(corpse)] });
    expect(pt(game, corpse)).toEqual({ power: 5, toughness: 5 });
    const bears = spawn(game, "Grizzly Bears");
    cast(game, toHand(game, "Clutch of Undeath"), { targets: [ref(bears)] });
    expect(graveyard(game, A)).toContain(bears);
  });
});

describe("Metamorphose", () => {
  it("puts the permanent on top of its owner's library; that opponent may put a card from hand onto the battlefield", () => {
    const { game, b } = table();
    lands(game, "Island", 2);
    const bears = spawn(game, "Grizzly Bears", B);
    const wurm = toHand(game, "Craw Wurm", B);
    b.chooseModesFn = () => [0];
    pickFromZone(b, wurm);
    cast(game, toHand(game, "Metamorphose"), { targets: [ref(bears)] });
    expect(zone(game, bears)).toBe("library");
    expect(zone(game, wurm)).toBe("battlefield");
  });
});

describe("Frontline Strategist and Aven Farseer", () => {
  it("turned face up: Farseer grows, and non-Soldier creatures deal no combat damage this turn", () => {
    const { game, a } = table();
    lands(game, "Plains", 4);
    const farseer = spawn(game, "Aven Farseer");
    const bears = spawn(game, "Grizzly Bears");
    const strategist = toHand(game, "Frontline Strategist");
    cast(game, strategist, { via: "face-down" } as never);
    game.dispatch({ type: "turn-face-up", player: A, permanent: strategist, morph: true } as Action);
    settle(game);
    expect(counters(game, farseer)).toBe(1);
    attack(game, a, [bears, farseer]);
    // The Bears (no Soldier) is stopped; the Bird Soldier's 2 gets through.
    expect(life(game, B)).toBe(18);
  });
});
