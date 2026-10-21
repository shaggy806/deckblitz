/**
 * Commander 2020 + Theros Beyond Death, group B: the clause most likely to be
 * wrong on each card with more than a stat line.
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
  lands,
  life,
  named,
  nextTurn,
  pickModes,
  pickTargets,
  pt,
  settle,
  spawn,
  table,
  toGraveyard,
  toHand,
  toLibrary,
  toStep,
  keywords,
  types,
  zone,
} from "./harness.js";

describe("Jirina Kudro", () => {
  it("makes no token without a commander cast, and pumps only other Humans", () => {
    const { game } = table();
    const soldier = spawn(game, "Human Soldier Token");
    const bears = spawn(game, "Grizzly Bears");
    const jirina = enter(game, "Jirina Kudro");
    expect(named(game, "Human Soldier Token", A)).toEqual([soldier]);
    expect(pt(game, soldier)).toEqual({ power: 3, toughness: 1 });
    expect(pt(game, bears)).toEqual({ power: 2, toughness: 2 });
    expect(pt(game, jirina)).toEqual({ power: 3, toughness: 3 });
  });
});

describe("Nikara, Lair Scavenger", () => {
  it("draws and loses 1 life only for a creature that had a counter", () => {
    const { game } = table();
    spawn(game, "Nikara, Lair Scavenger");
    const marked = spawn(game, "Grizzly Bears");
    const plain = spawn(game, "Grizzly Bears");
    game.state.objects[marked].counters["+1/+1"] = 1;
    const before = hand(game).length;
    destroy(game, marked);
    expect(hand(game).length).toBe(before + 1);
    expect(life(game)).toBe(19);
    destroy(game, plain);
    expect(hand(game).length).toBe(before + 1);
    expect(life(game)).toBe(19);
  });
});

describe("Crystalline Resonance", () => {
  it("becomes a copy of another permanent when you cycle, until your next turn", () => {
    const { game, a } = table();
    const resonance = spawn(game, "Crystalline Resonance");
    const bears = spawn(game, "Grizzly Bears", B);
    lands(game, "Island", 1);
    pickTargets(a, bears);
    pickModes(a, 0);
    game.dispatch({ type: "cycle", player: A, card: toHand(game, "Lonely Sandbar") });
    settle(game);
    expect(types(game, resonance)).toContain("creature");
    expect(pt(game, resonance)).toEqual({ power: 2, toughness: 2 });
    nextTurn(game); // bob's turn: still a copy
    expect(types(game, resonance)).toContain("creature");
    nextTurn(game); // alice's next turn: it wears off
    expect(types(game, resonance)).toEqual(["enchantment"]);
  });
});

describe("Ironscale Hydra", () => {
  it("prevents each blocker's combat damage and gets one counter per creature", () => {
    const { game, a, b } = table();
    const hydra = spawn(game, "Ironscale Hydra");
    const one = spawn(game, "Grizzly Bears", B);
    const two = spawn(game, "Grizzly Bears", B);
    b.declareBlockersFn = () => [
      { blocker: one, attacker: hydra },
      { blocker: two, attacker: hydra },
    ];
    attack(game, a, [hydra]);
    expect(zone(game, hydra)).toBe("battlefield");
    expect(counters(game, hydra)).toBe(2);
    expect(game.state.objects[hydra].damageMarked).toBe(0);
  });
});

describe("Polukranos, Unchained", () => {
  it("enters with six counters cast from hand; damage removes that many instead", () => {
    const { game } = table();
    lands(game, "Swamp", 2);
    lands(game, "Forest", 2);
    const polukranos = toHand(game, "Polukranos, Unchained");
    cast(game, polukranos);
    expect(counters(game, polukranos)).toBe(6);
    lands(game, "Swamp", 1);
    lands(game, "Forest", 1);
    lands(game, "Wastes", 1);
    const bears = spawn(game, "Grizzly Bears", B);
    activate(game, polukranos, 0, { targets: [{ kind: "object", object: bears }] });
    expect(zone(game, bears)).toBe("graveyard");
    expect(counters(game, polukranos)).toBe(4);
    expect(game.state.objects[polukranos].damageMarked).toBe(0);
  });

  it("escapes with twelve counters, not eighteen", () => {
    const { game } = table();
    lands(game, "Swamp", 1);
    lands(game, "Forest", 1);
    lands(game, "Wastes", 4);
    for (let i = 0; i < 6; i++) toGraveyard(game, "Wastes");
    const polukranos = toGraveyard(game, "Polukranos, Unchained");
    cast(game, polukranos, { via: "escape" });
    expect(zone(game, polukranos)).toBe("battlefield");
    expect(counters(game, polukranos)).toBe(12);
    expect(graveyard(game).length).toBe(0);
  });
});

describe("Elspeth, Sun's Nemesis", () => {
  it("escapes from the graveyard as a planeswalker with her loyalty", () => {
    const { game } = table();
    lands(game, "Plains", 2);
    lands(game, "Wastes", 4);
    for (let i = 0; i < 4; i++) toGraveyard(game, "Wastes");
    const elspeth = toGraveyard(game, "Elspeth, Sun's Nemesis");
    cast(game, elspeth, { via: "escape" });
    expect(zone(game, elspeth)).toBe("battlefield");
    expect(counters(game, elspeth, "loyalty")).toBe(5);
  });
});

describe("Dreamshaper Shaman", () => {
  it("pays {2}{R}, sacrifices a nonland permanent, and puts the next nonland permanent card onto the battlefield", () => {
    const { game, a } = table();
    spawn(game, "Dreamshaper Shaman");
    const fodder = spawn(game, "Grizzly Bears");
    lands(game, "Mountain", 3);
    toLibrary(game, "Treeshaker Chimera");
    toLibrary(game, "Wastes"); // on top: revealed first, goes to the bottom
    a.chooseSacrificesFn = () => [fodder];
    pickModes(a, 0);
    toStep(game, "end");
    settle(game);
    expect(zone(game, fodder)).toBe("graveyard");
    expect(named(game, "Treeshaker Chimera", A)).toHaveLength(1);
  });
});

describe("Hero of the Nyxborn", () => {
  it("makes a Soldier, and a spell you cast targeting it pumps your creatures", () => {
    const { game } = table();
    const hero = enter(game, "Hero of the Nyxborn");
    const soldier = named(game, "Human Soldier Token", A)[0];
    lands(game, "Forest", 1);
    cast(game, toHand(game, "Giant Growth"), { targets: [{ kind: "object", object: hero }] });
    expect(pt(game, hero)).toEqual({ power: 6, toughness: 5 });
    expect(pt(game, soldier)).toEqual({ power: 2, toughness: 1 });
  });
});

describe("Skola Grovedancer", () => {
  it("gains 1 life when it mills a land card", () => {
    const { game } = table();
    const skola = spawn(game, "Skola Grovedancer");
    lands(game, "Forest", 3);
    activate(game, skola, 0);
    expect(life(game)).toBe(21);
  });
});

describe("Slaughter-Priest of Mogis", () => {
  it("sacrificing for first strike also triggers its +2/+0", () => {
    const { game } = table();
    const priest = spawn(game, "Slaughter-Priest of Mogis");
    const bears = spawn(game, "Grizzly Bears");
    lands(game, "Wastes", 2);
    game.dispatch({ type: "activate-ability", player: A, source: priest, abilityIndex: 0, targets: [], sacrifice: bears });
    settle(game);
    expect(keywords(game, priest).has("first-strike")).toBe(true);
    expect(zone(game, bears)).toBe("graveyard");
    expect(pt(game, priest)).toEqual({ power: 4, toughness: 2 });
  });
});
