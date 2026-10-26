/**
 * Urza's Saga (USG; B193), group B. One test per card whose behaviour is
 * more than a stat line, on the clause most likely to be wrong.
 */
import { describe, expect, it } from "vitest";

import {
  A,
  B,
  activate,
  cast,
  controller,
  counters,
  enter,
  graveyard,
  hand,
  keywords,
  lands,
  life,
  nextTurn,
  pickModes,
  pickTargets,
  pt,
  ref,
  settle,
  spawn,
  table,
  toHand,
  types,
  subtypes,
  zone,
  destroy,
} from "./harness.js";

describe("Corrupt", () => {
  it("deals damage equal to your Swamps and gains that much life", () => {
    const { game } = table();
    lands(game, "Swamp", 6);
    spawn(game, "Swamp", B);
    const before = life(game, A);
    cast(game, toHand(game, "Corrupt"), { targets: [ref(B)] });
    expect(life(game, B)).toBe(14);
    expect(life(game, A)).toBe(before + 6);
  });
});

describe("Lotus Blossom", () => {
  it("adds mana equal to the petal counters on the sacrificed artifact", () => {
    const { game } = table();
    const blossom = spawn(game, "Lotus Blossom");
    game.state.objects[blossom].counters.petal = 3;
    activate(game, blossom);
    expect(zone(game, blossom)).toBe("graveyard");
    const pool = game.state.players[A].manaPool;
    expect(pool.length).toBe(3);
    expect(new Set(pool.map((u) => u.type)).size).toBe(1);
  });
});

describe("Catastrophe", () => {
  it("destroys all creatures (not lands) when that is chosen on resolution", () => {
    const { game, a } = table();
    const bears = spawn(game, "Grizzly Bears", B);
    const land = spawn(game, "Plains", B);
    lands(game, "Plains", 6);
    pickModes(a, 1);
    cast(game, toHand(game, "Catastrophe"));
    expect(zone(game, bears)).toBe("graveyard");
    expect(zone(game, land)).toBe("battlefield");
  });
});

describe("Energy Field", () => {
  it("prevents damage from opponents' sources only, and is sacrificed when a card hits your graveyard", () => {
    const { game } = table();
    const field = enter(game, "Energy Field");
    const theirs = spawn(game, "Grizzly Bears", B);
    const mine = spawn(game, "Grizzly Bears", A);
    game.debugApplyEffect(B, { kind: "damage", amount: 3, target: 0 }, [ref(A)], { source: theirs });
    settle(game);
    expect(life(game, A)).toBe(20);
    game.debugApplyEffect(A, { kind: "damage", amount: 2, target: 0 }, [ref(A)], { source: mine });
    settle(game);
    expect(life(game, A)).toBe(18);
    expect(zone(game, field)).toBe("battlefield");
    destroy(game, mine);
    settle(game);
    expect(zone(game, field)).toBe("graveyard");
  });
});

describe("Titania's Chosen", () => {
  it("grows when any player casts a green spell", () => {
    const { game } = table();
    const chosen = spawn(game, "Titania's Chosen");
    lands(game, "Forest", 2);
    cast(game, toHand(game, "Grizzly Bears"));
    expect(counters(game, chosen)).toBe(1);
  });
});

describe("Absolute Law", () => {
  it("gives every creature protection from red", () => {
    const { game } = table();
    spawn(game, "Absolute Law");
    const bears = spawn(game, "Grizzly Bears", B);
    lands(game, "Mountain", 1);
    expect(() => cast(game, toHand(game, "Shock"), { targets: [ref(bears)] })).toThrow();
  });
});

describe("Fiery Mantle", () => {
  it("returns to its owner's hand when put into a graveyard from the battlefield", () => {
    const { game, a } = table();
    const bears = spawn(game, "Grizzly Bears");
    lands(game, "Mountain", 4);
    const mantle = toHand(game, "Fiery Mantle");
    pickTargets(a, bears);
    cast(game, mantle, { targets: [ref(bears)] });
    activate(game, mantle);
    expect(pt(game, bears)).toEqual({ power: 3, toughness: 2 });
    cast(game, toHand(game, "Shock"), { targets: [ref(bears)] });
    expect(zone(game, bears)).toBe("graveyard");
    expect(hand(game).map((id) => game.state.objects[id].cardName)).toContain("Fiery Mantle");
    expect(graveyard(game).map((id) => game.state.objects[id].cardName)).not.toContain("Fiery Mantle");
  });
});

describe("Hidden Spider", () => {
  it("becomes a 3/5 Spider creature with reach, no longer an enchantment, when an opponent casts a flier", () => {
    const { game } = table();
    const spider = spawn(game, "Hidden Spider");
    lands(game, "Island", 3, B);
    nextTurn(game);
    cast(game, toHand(game, "Wind Drake", B), { player: B });
    expect(types(game, spider)).toEqual(["creature"]);
    expect(subtypes(game, spider)).toEqual(["Spider"]);
    expect(pt(game, spider)).toEqual({ power: 3, toughness: 5 });
    expect(keywords(game, spider).has("reach")).toBe(true);
  });
});

describe("Witch Engine", () => {
  it("adds {B}{B}{B}{B} and gives itself to the target opponent", () => {
    const { game } = table();
    const engine = spawn(game, "Witch Engine");
    activate(game, engine, 0, { targets: [ref(B)] });
    expect(controller(game, engine)).toBe(B);
    expect(game.state.players[A].manaPool.filter((u) => u.type === "B").length).toBe(4);
  });
});

describe("Confiscate", () => {
  it("takes control of a noncreature permanent", () => {
    const { game } = table();
    const land = spawn(game, "Forest", B);
    lands(game, "Island", 6);
    cast(game, toHand(game, "Confiscate"), { targets: [ref(land)] });
    expect(controller(game, land)).toBe(A);
    expect(graveyard(game).length).toBe(0);
  });
});
