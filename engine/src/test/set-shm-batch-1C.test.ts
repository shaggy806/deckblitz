/**
 * Shadowmoor (SHM; B180) — group C: Scarecrows, a Liege, a Puca and hybrid spells.
 */
import { describe, expect, it } from "vitest";

import {
  A,
  B,
  activate,
  attack,
  cast,
  counters,
  destroy,
  enter,
  hand,
  keywords,
  lands,
  life,
  named,
  nextTurn,
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
  zone,
} from "./harness.js";

describe("Grim Poppet", () => {
  it("enters with three -1/-1 counters and moves one onto another creature", () => {
    const { game } = table();
    const poppet = enter(game, "Grim Poppet");
    expect(pt(game, poppet)).toEqual({ power: 1, toughness: 1 });
    const angel = spawn(game, "Serra Angel", B);
    activate(game, poppet, 0, { targets: [ref(angel)] });
    expect(counters(game, angel, "-1/-1")).toBe(1);
    expect(pt(game, poppet)).toEqual({ power: 2, toughness: 2 });
  });
});

describe("Wingrattle Scarecrow", () => {
  it("has flying with a blue creature", () => {
    const { game } = table();
    const crow = spawn(game, "Wingrattle Scarecrow");
    expect(keywords(game, crow).has("flying")).toBe(false);
    spawn(game, "Merfolk of the Pearl Trident");
    expect(keywords(game, crow).has("flying")).toBe(true);
  });

  it("persists only while you control a black creature", () => {
    const { game } = table();
    const crow = spawn(game, "Wingrattle Scarecrow");
    destroy(game, crow);
    expect(zone(game, crow)).toBe("graveyard");

    const again = spawn(game, "Wingrattle Scarecrow");
    spawn(game, "Walking Corpse");
    destroy(game, again);
    const back = named(game, "Wingrattle Scarecrow");
    expect(back).toHaveLength(1);
    expect(counters(game, back[0], "-1/-1")).toBe(1);
  });

  it("persists when the black creature dies at the same time", () => {
    const { game } = table();
    spawn(game, "Wingrattle Scarecrow");
    spawn(game, "Walking Corpse");
    game.debugApplyEffect(B, { kind: "destroy-all", filter: { type: "creature" } }, []);
    settle(game);
    expect(named(game, "Wingrattle Scarecrow")).toHaveLength(1);
    expect(named(game, "Walking Corpse")).toHaveLength(0);
  });
});

describe("Rattleblaze Scarecrow", () => {
  it("persists when the black creature dies alongside it, and has haste only beside a red creature", () => {
    const { game } = table();
    const crow = spawn(game, "Rattleblaze Scarecrow");
    expect(keywords(game, crow).has("haste")).toBe(false);
    spawn(game, "Raging Goblin");
    expect(keywords(game, crow).has("haste")).toBe(true);
    spawn(game, "Walking Corpse");
    game.debugApplyEffect(B, { kind: "destroy-all", filter: { type: "creature" } }, []);
    settle(game);
    const back = named(game, "Rattleblaze Scarecrow");
    expect(back).toHaveLength(1);
    expect(counters(game, back[0], "-1/-1")).toBe(1);
  });
});

describe("Smash to Smithereens", () => {
  it("destroys the artifact and deals 3 to its controller", () => {
    const { game } = table();
    lands(game, "Mountain", 2);
    const ring = spawn(game, "Sol Ring", B);
    cast(game, toHand(game, "Smash to Smithereens"), { targets: [ref(ring)] });
    expect(zone(game, ring)).toBe("graveyard");
    expect(life(game, B)).toBe(17);
  });
});

describe("Spawnwrithe", () => {
  it("makes a token copy of itself on combat damage", () => {
    const { game, a } = table();
    const writhe = spawn(game, "Spawnwrithe");
    attack(game, a, [writhe]);
    expect(named(game, "Spawnwrithe")).toHaveLength(2);
  });
});

describe("Order of Whiteclay", () => {
  it("untaps to return a creature card with mana value 3 or less", () => {
    const { game } = table();
    lands(game, "Plains", 3);
    const order = spawn(game, "Order of Whiteclay", A, { tapped: true });
    const bears = toGraveyard(game, "Grizzly Bears");
    activate(game, order, 0, { targets: [ref(bears)] });
    expect(zone(game, bears)).toBe("battlefield");
    expect(game.state.objects[order].tapped).toBe(false);
  });
});

describe("Dire Undercurrents", () => {
  it("a blue creature entering draws for the target player, a black one discards", () => {
    const { game, a } = table();
    spawn(game, "Dire Undercurrents");
    pickTargets(a, B);
    pickModes(a, 0);
    const before = hand(game, B).length;
    enter(game, "Merfolk of the Pearl Trident");
    expect(hand(game, B).length).toBe(before + 1);
    enter(game, "Walking Corpse");
    expect(hand(game, B).length).toBe(before);
  });
});

describe("Fracturing Gust", () => {
  it("gains 2 life per permanent actually destroyed", () => {
    const { game } = table();
    lands(game, "Forest", 5);
    spawn(game, "Sol Ring");
    spawn(game, "Sol Ring", B);
    spawn(game, "Glorious Anthem", B);
    const ingot = spawn(game, "Darksteel Ingot", B);
    cast(game, toHand(game, "Fracturing Gust"));
    expect(zone(game, ingot)).toBe("battlefield");
    expect(life(game, A)).toBe(26);
  });
});

describe("Lockjaw Snapper", () => {
  it("dying puts a -1/-1 counter on each creature that has one", () => {
    const { game } = table();
    const snapper = spawn(game, "Lockjaw Snapper");
    const angel = spawn(game, "Serra Angel", B);
    game.state.objects[angel].counters["-1/-1"] = 1;
    const elves = spawn(game, "Llanowar Elves", B);
    destroy(game, snapper);
    expect(counters(game, angel, "-1/-1")).toBe(2);
    expect(counters(game, elves, "-1/-1")).toBe(0);
  });
});

describe("Ashenmoor Liege", () => {
  it("pumps other black and other red creatures", () => {
    const { game } = table();
    const liege = spawn(game, "Ashenmoor Liege");
    const corpse = spawn(game, "Walking Corpse");
    const piker = spawn(game, "Goblin Piker");
    expect(pt(game, corpse)).toEqual({ power: 3, toughness: 3 });
    expect(pt(game, piker)).toEqual({ power: 3, toughness: 2 });
    expect(pt(game, liege)).toEqual({ power: 4, toughness: 1 });
  });

  it("an opponent targeting it loses 4 life", () => {
    const { game } = table();
    const liege = spawn(game, "Ashenmoor Liege");
    lands(game, "Mountain", 1, B);
    nextTurn(game);
    cast(game, toHand(game, "Shock", B), { player: B, targets: [ref(liege)] });
    expect(life(game, B)).toBe(16);
    expect(life(game, A)).toBe(20);
  });
});

describe("Safewright Quest", () => {
  it("finds a nonbasic Forest or Plains card", () => {
    const { game, a } = table();
    lands(game, "Forest", 1);
    const garden = toLibrary(game, "Temple Garden");
    pickFromZone(a, garden);
    cast(game, toHand(game, "Safewright Quest"));
    expect(zone(game, garden)).toBe("hand");
  });
});

describe("Chainbreaker", () => {
  it("enters as a 1/1 and removes a -1/-1 counter from a target creature", () => {
    const { game } = table();
    lands(game, "Wastes", 3);
    const breaker = enter(game, "Chainbreaker");
    expect(pt(game, breaker)).toEqual({ power: 1, toughness: 1 });
    activate(game, breaker, 0, { targets: [ref(breaker)] });
    expect(pt(game, breaker)).toEqual({ power: 2, toughness: 2 });
  });
});

describe("Cemetery Puca", () => {
  it("pays {1} to become a copy of a creature that died, and keeps the ability", () => {
    const { game, a } = table();
    lands(game, "Wastes", 2);
    const puca = spawn(game, "Cemetery Puca");
    pickModes(a, 0);
    destroy(game, spawn(game, "Serra Angel", B));
    expect(pt(game, puca)).toEqual({ power: 4, toughness: 4 });
    expect(keywords(game, puca).has("flying")).toBe(true);
    destroy(game, spawn(game, "Grizzly Bears", B));
    expect(pt(game, puca)).toEqual({ power: 2, toughness: 2 });
    expect(keywords(game, puca).has("flying")).toBe(false);
  });

  it("declining leaves it as it is", () => {
    const { game } = table();
    lands(game, "Wastes", 1);
    const puca = spawn(game, "Cemetery Puca");
    destroy(game, spawn(game, "Serra Angel", B));
    expect(pt(game, puca)).toEqual({ power: 1, toughness: 2 });
  });
});

describe("Blazethorn Scarecrow", () => {
  it("has haste with a red creature and wither with a green one", () => {
    const { game } = table();
    const crow = spawn(game, "Blazethorn Scarecrow");
    expect(keywords(game, crow).has("haste")).toBe(false);
    spawn(game, "Goblin Piker");
    expect(keywords(game, crow).has("haste")).toBe(true);
    expect(keywords(game, crow).has("wither")).toBe(false);
    spawn(game, "Llanowar Elves");
    expect(keywords(game, crow).has("wither")).toBe(true);
  });
});

describe("Power of Fire", () => {
  it("gives the enchanted creature a pinging ability", () => {
    const { game } = table();
    lands(game, "Mountain", 2);
    const bears = spawn(game, "Grizzly Bears");
    cast(game, toHand(game, "Power of Fire"), { targets: [ref(bears)] });
    activate(game, bears, 0, { targets: [ref(B)] });
    expect(life(game, B)).toBe(19);
  });
});

describe("Puresight Merrow", () => {
  it("looks at the top card and may exile it", () => {
    const { game, a } = table();
    lands(game, "Plains", 2);
    const merrow = spawn(game, "Puresight Merrow", A, { tapped: true });
    const top = toLibrary(game, "Grizzly Bears");
    activate(game, merrow);
    expect(zone(game, top)).toBe("library");
    game.state.objects[merrow].tapped = true;
    pickFromZone(a, top);
    activate(game, merrow);
    expect(zone(game, top)).toBe("exile");
  });
});
