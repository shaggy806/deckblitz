/**
 * Lorwyn (LRW; B189), group D. One test per card whose behaviour is more
 * than a stat line or an exact copy of an already-tested pattern, on the clause
 * most likely to be wrong.
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
  subtypes,
  table,
  toGraveyard,
  toHand,
  zone,
} from "./harness.js";

describe("Surgespanner", () => {
  it("attacking taps it; paying {1}{U} bounces the target permanent", () => {
    const { game, a } = table();
    const spanner = spawn(game, "Surgespanner");
    lands(game, "Island", 2);
    const bears = spawn(game, "Grizzly Bears", B);
    pickTargets(a, bears);
    pickModes(a, 0);
    attack(game, a, [spanner]);
    settle(game);
    expect(zone(game, bears)).toBe("hand");
  });
});

describe("Shapesharer", () => {
  it("makes a Shapeshifter a copy of a creature until its controller's next turn", () => {
    const { game } = table();
    const sharer = spawn(game, "Shapesharer");
    lands(game, "Island", 3);
    const giant = spawn(game, "Hill Giant", B);
    activate(game, sharer, 0, { targets: [ref(sharer), ref(giant)] });
    expect(pt(game, sharer)).toEqual({ power: 3, toughness: 3 });
    expect(subtypes(game, sharer)).toContain("Giant");
    nextTurn(game); // bob's turn: still a copy
    expect(pt(game, sharer)).toEqual({ power: 3, toughness: 3 });
    nextTurn(game); // alice's next turn: it wore off
    expect(pt(game, sharer)).toEqual({ power: 1, toughness: 1 });
  });
});

describe("Mad Auntie", () => {
  it("pumps other Goblins and regenerates another Goblin", () => {
    const { game } = table();
    const auntie = spawn(game, "Mad Auntie");
    const goblin = spawn(game, "Raging Goblin");
    expect(pt(game, auntie)).toEqual({ power: 2, toughness: 2 });
    expect(pt(game, goblin)).toEqual({ power: 2, toughness: 2 });
    expect(() => activate(game, auntie, 0, { targets: [ref(auntie)] })).toThrow();
    activate(game, auntie, 0, { targets: [ref(goblin)] });
    destroy(game, goblin);
    expect(zone(game, goblin)).toBe("battlefield");
  });
});

describe("Faerie Trickery", () => {
  it("counters a non-Faerie spell into exile, and can't target a Faerie spell", () => {
    const { game } = table();
    lands(game, "Island", 12);
    lands(game, "Forest", 2);
    const bears = toHand(game, "Grizzly Bears");
    cast(game, bears, { settle: false });
    cast(game, toHand(game, "Faerie Trickery"), { targets: [ref(bears)] });
    expect(zone(game, bears)).toBe("exile");

    const sprite = toHand(game, "Spellstutter Sprite");
    cast(game, sprite, { settle: false });
    expect(() => cast(game, toHand(game, "Faerie Trickery"), { targets: [ref(sprite)], settle: false })).toThrow(/refused/);
  });
});

describe("Brigid, Hero of Kinsbaile", () => {
  it("deals 2 to each attacking creature the target player controls, not their others", () => {
    const { game, b } = table();
    const brigid = spawn(game, "Brigid, Hero of Kinsbaile", A);
    const attacker = spawn(game, "Grizzly Bears", B);
    const home = spawn(game, "Grizzly Bears", B);
    nextTurn(game, "precombat-main"); // bob's turn
    b.declareAttackersFn = () => [{ attacker, defender: A }];
    game.advanceUntil((s) => s.turn.step === "declare-attackers" && s.priority.holder === A && s.awaiting === null);
    activate(game, brigid, 0, { targets: [ref(B)] });
    expect(zone(game, attacker)).toBe("graveyard");
    expect(zone(game, home)).toBe("battlefield");
  });
});

describe("Wings of Velis Vel", () => {
  it("makes the target a 4/4 flier of every creature type until end of turn", () => {
    const { game } = table();
    lands(game, "Island", 2);
    const bears = spawn(game, "Grizzly Bears");
    cast(game, toHand(game, "Wings of Velis Vel"), { targets: [ref(bears)] });
    expect(pt(game, bears)).toEqual({ power: 4, toughness: 4 });
    expect(keywords(game, bears).has("flying")).toBe(true);
    nextTurn(game);
    expect(pt(game, bears)).toEqual({ power: 2, toughness: 2 });
  });
});

describe("Thundercloud Shaman", () => {
  it("deals damage equal to the Giants you control to each non-Giant creature", () => {
    const { game } = table();
    spawn(game, "Hill Giant");
    const bears = spawn(game, "Grizzly Bears", B);
    const goblin = spawn(game, "Mad Auntie", B);
    const giantB = spawn(game, "Hill Giant", B);
    const shaman = enter(game, "Thundercloud Shaman");
    // Two Giants you control: 2 damage.
    expect(zone(game, bears)).toBe("graveyard");
    expect(zone(game, goblin)).toBe("graveyard");
    expect(game.state.objects[giantB].damageMarked).toBe(0);
    expect(game.state.objects[shaman].damageMarked).toBe(0);
  });
});

describe("Knucklebone Witch", () => {
  it("may get a counter when another Goblin you control dies", () => {
    const { game, a } = table();
    const witch = spawn(game, "Knucklebone Witch");
    const goblin = spawn(game, "Raging Goblin");
    pickModes(a, 0);
    destroy(game, goblin);
    settle(game);
    expect(counters(game, witch)).toBe(1);
  });
});

describe("Purity", () => {
  it("prevents noncombat damage to you and gains that much life", () => {
    const { game } = table();
    spawn(game, "Purity");
    lands(game, "Mountain", 1, B);
    nextTurn(game); // bob's turn
    cast(game, toHand(game, "Shock", B), { player: B, targets: [ref(A)] });
    expect(life(game, A)).toBe(22);
  });

  it("doesn't prevent combat damage", () => {
    const { game, b } = table();
    spawn(game, "Purity");
    const bears = spawn(game, "Grizzly Bears", B);
    nextTurn(game);
    attack(game, b, [bears], A);
    expect(life(game, A)).toBe(18);
  });

  it("is shuffled into its owner's library from the graveyard", () => {
    const { game } = table();
    const purity = spawn(game, "Purity");
    destroy(game, purity);
    settle(game);
    expect(graveyard(game)).not.toContain(purity);
    expect(zone(game, purity)).toBe("library");
  });
});

describe("Summon the School", () => {
  it("makes two Merfolk Wizards, and four untapped Merfolk return it from the graveyard", () => {
    const { game } = table();
    lands(game, "Plains", 4);
    const card = toHand(game, "Summon the School");
    cast(game, card);
    expect(zone(game, card)).toBe("graveyard");
    spawn(game, "Merfolk of the Pearl Trident");
    spawn(game, "Merfolk of the Pearl Trident");
    const before = hand(game).length;
    activate(game, card, 0);
    expect(zone(game, card)).toBe("hand");
    expect(hand(game).length).toBe(before + 1);
  });

  it("can't be returned with only three Merfolk", () => {
    const { game } = table();
    const card = toGraveyard(game, "Summon the School");
    spawn(game, "Merfolk of the Pearl Trident");
    spawn(game, "Merfolk of the Pearl Trident");
    spawn(game, "Merfolk of the Pearl Trident");
    expect(() => activate(game, card, 0)).toThrow(/refused/);
  });
});
