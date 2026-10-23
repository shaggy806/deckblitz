/**
 * Batch 141, group B: the cards whose behaviour is more than a stat line —
 * each test pins the clause most likely to be wrong.
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
  named,
  nextTurn,
  pickFromZone,
  pickModes,
  pickTargets,
  pt,
  ref,
  spawn,
  subtypes,
  table,
  toGraveyard,
  toHand,
  toLibrary,
  types,
} from "./harness.js";

describe("Kappa Cannoneer", () => {
  it("grows and turns unblockable when another artifact enters, not a nonartifact", () => {
    const { game } = table();
    const kappa = spawn(game, "Kappa Cannoneer");
    enter(game, "Grizzly Bears");
    expect(counters(game, kappa)).toBe(0);
    enter(game, "Darksteel Relic");
    expect(counters(game, kappa)).toBe(1);
    expect(keywords(game, kappa).has("unblockable")).toBe(true);
  });

  it("triggers once for its own entry", () => {
    const { game } = table();
    const kappa = enter(game, "Kappa Cannoneer");
    expect(counters(game, kappa)).toBe(1);
  });
});

describe("Synth Infiltrator", () => {
  it("enters as a copy that is also a Synth artifact creature", () => {
    const { game, a } = table();
    lands(game, "Island", 5);
    spawn(game, "Serra Angel", B);
    a.chooseCopyFn = (_view, _source, options) => options[0] ?? null;
    const synth = toHand(game, "Synth Infiltrator");
    cast(game, synth);
    expect(game.state.objects[synth].copyOf).toBe("Serra Angel");
    expect(types(game, synth)).toEqual(expect.arrayContaining(["artifact", "creature"]));
    expect(subtypes(game, synth)).toEqual(expect.arrayContaining(["Angel", "Synth"]));
    expect(keywords(game, synth).has("flying")).toBe(true);
  });
});

describe("Whir of Invention", () => {
  it("finds an artifact of mana value X or less, with improvise paying the X", () => {
    const { game, a } = table();
    lands(game, "Island", 3);
    const memnite = spawn(game, "Memnite");
    toLibrary(game, "Lodestone Golem");
    const thopter = toLibrary(game, "Ornithopter");
    const seen = pickFromZone(a, thopter);
    cast(game, toHand(game, "Whir of Invention"), { x: 1, convoke: [{ creature: memnite }] });
    expect(game.state.objects[memnite].tapped).toBe(true);
    expect(seen.offered).toContain(thopter);
    expect(seen.offered.some((id) => game.state.objects[id].cardName === "Lodestone Golem")).toBe(false);
    expect(named(game, "Ornithopter")).toHaveLength(1);
  });
});

describe("Leonin Relic-Warder", () => {
  it("exiles an artifact and returns it under its owner's control when it leaves", () => {
    const { game, a } = table();
    const ring = spawn(game, "Sol Ring", B);
    pickTargets(a, ring);
    pickModes(a, 0);
    const warder = enter(game, "Leonin Relic-Warder");
    expect(named(game, "Sol Ring")).toHaveLength(0);
    destroy(game, warder);
    expect(named(game, "Sol Ring", B)).toHaveLength(1);
  });
});

describe("Icy Blast", () => {
  it("with ferocious, the tapped creatures skip their controller's next untap", () => {
    const { game } = table();
    lands(game, "Island", 3);
    spawn(game, "Craw Wurm");
    const bears = [spawn(game, "Grizzly Bears", B), spawn(game, "Grizzly Bears", B)];
    cast(game, toHand(game, "Icy Blast"), { x: 2, targets: bears.map(ref) });
    expect(bears.map((id) => game.state.objects[id].tapped)).toEqual([true, true]);
    nextTurn(game);
    expect(bears.map((id) => game.state.objects[id].tapped)).toEqual([true, true]);
  });

  it("without ferocious, they only tap", () => {
    const { game } = table();
    lands(game, "Island", 2);
    const bear = spawn(game, "Grizzly Bears", B);
    cast(game, toHand(game, "Icy Blast"), { x: 1, targets: [ref(bear)] });
    expect(game.state.objects[bear].tapped).toBe(true);
    nextTurn(game);
    expect(game.state.objects[bear].tapped).toBe(false);
  });
});

describe("Lodestone Golem", () => {
  it("taxes every player's nonartifact spells, not artifact ones", () => {
    const { game } = table();
    spawn(game, "Lodestone Golem", B);
    lands(game, "Island", 3);
    const divination = toHand(game, "Divination");
    expect(() => cast(game, divination)).toThrow();
    cast(game, toHand(game, "Ornithopter"));
    expect(named(game, "Ornithopter")).toHaveLength(1);
    lands(game, "Island", 1);
    cast(game, divination);
    expect(graveyard(game)).toContain(divination);
  });
});

describe("Split Decision", () => {
  const setUp = (aVote: number, bVote: number) => {
    const t = table();
    pickModes(t.a, aVote);
    pickModes(t.b, bVote);
    lands(t.game, "Island", 5);
    const divination = toHand(t.game, "Divination");
    const split = toHand(t.game, "Split Decision");
    const before = hand(t.game).length;
    cast(t.game, divination, { settle: false });
    cast(t.game, split, { targets: [ref(divination)] });
    return { ...t, before, divination };
  };

  it("denial with more votes counters the spell", () => {
    const { game, before, divination } = setUp(0, 0);
    expect(hand(game).length).toBe(before - 2);
    expect(graveyard(game)).toContain(divination);
  });

  it("a tied vote copies it", () => {
    const { game, before } = setUp(0, 1);
    expect(hand(game).length).toBe(before - 2 + 4);
  });
});

describe("Raphael, the Muscle", () => {
  it("doubles damage from creatures you control with counters, not from those without", () => {
    const { game, a } = table();
    spawn(game, "Raphael, the Muscle");
    const strong = spawn(game, "Grizzly Bears");
    const plain = spawn(game, "Grizzly Bears");
    game.debugApplyEffect(A, { kind: "add-counter", target: 0, counter: "+1/+1", amount: 1 }, [ref(strong)]);
    attack(game, a, [strong, plain]);
    expect(life(game, B)).toBe(20 - 6 - 2);
  });
});

describe("Sword of the Meek", () => {
  it("returns from the graveyard attached to an entering 1/1, not a 2/2", () => {
    const { game, a } = table();
    toGraveyard(game, "Sword of the Meek");
    pickModes(a, 0);
    enter(game, "Grizzly Bears");
    expect(named(game, "Sword of the Meek")).toHaveLength(0);
    const memnite = enter(game, "Memnite");
    expect(named(game, "Sword of the Meek")).toHaveLength(1);
    expect(pt(game, memnite)).toEqual({ power: 2, toughness: 3 });
  });
});

describe("Haunted Fengraf", () => {
  it("returns a creature card from the graveyard to hand", () => {
    const { game } = table();
    const fengraf = spawn(game, "Haunted Fengraf");
    lands(game, "Wastes", 3);
    toGraveyard(game, "Island");
    toGraveyard(game, "Grizzly Bears");
    const before = hand(game).length;
    activate(game, fengraf, 1);
    expect(hand(game).length).toBe(before + 1);
    const names = graveyard(game).map((id) => game.state.objects[id].cardName);
    expect(names).toEqual(expect.arrayContaining(["Island", "Haunted Fengraf"]));
    expect(names).not.toContain("Grizzly Bears");
  });
});
