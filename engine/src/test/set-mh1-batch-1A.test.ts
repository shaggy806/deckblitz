/**
 * Modern Horizons, batch 1, group A.
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
  pickFromZone,
  pickModes,
  pickTargets,
  pt,
  ref,
  spawn,
  table,
  toGraveyard,
  toHand,
  toLibrary,
  toStep,
  tokensNamed,
  zone,
} from "./harness.js";

describe("Seasoned Pyromancer", () => {
  it("discards two, draws two, and makes an Elemental only for the nonland card discarded", () => {
    const { game, a } = table();
    const bolt = toHand(game, "Lightning Bolt");
    const wastes = hand(game).find((id) => game.state.objects[id].cardName === "Wastes")!;
    a.chooseDiscardsFn = () => [bolt, wastes];
    const before = hand(game).length;
    enter(game, "Seasoned Pyromancer");
    expect(zone(game, bolt)).toBe("graveyard");
    expect(zone(game, wastes)).toBe("graveyard");
    expect(hand(game).length).toBe(before);
    expect(tokensNamed(game, "1/1 Red Elemental Token", A)).toBe(1);
  });

  it("from the graveyard, exiles itself for two Elementals", () => {
    const { game } = table();
    lands(game, "Mountain", 5);
    const pyro = toGraveyard(game, "Seasoned Pyromancer");
    activate(game, pyro, 0);
    expect(zone(game, pyro)).toBe("exile");
    expect(tokensNamed(game, "1/1 Red Elemental Token", A)).toBe(2);
  });
});

describe("Marit Lage's Slumber", () => {
  it("with ten snow permanents at upkeep, is sacrificed for Marit Lage", () => {
    const { game } = table();
    const slumber = spawn(game, "Marit Lage's Slumber");
    lands(game, "Snow-Covered Island", 9);
    toStep(game, "precombat-main");
    expect(zone(game, slumber)).toBe("graveyard");
    expect(tokensNamed(game, "Marit Lage Token", A)).toBe(1);
  });

  it("with nine, nothing happens", () => {
    const { game } = table();
    const slumber = spawn(game, "Marit Lage's Slumber");
    lands(game, "Snow-Covered Island", 8);
    toStep(game, "precombat-main");
    expect(zone(game, slumber)).toBe("battlefield");
    expect(tokensNamed(game, "Marit Lage Token", A)).toBe(0);
  });
});

describe("Mind Rake", () => {
  it("overloaded, every player discards two — the caster too", () => {
    const { game } = table();
    lands(game, "Swamp", 2);
    const rake = toHand(game, "Mind Rake");
    const beforeA = hand(game, A).length;
    const beforeB = hand(game, B).length;
    cast(game, rake, { overload: true });
    expect(hand(game, A).length).toBe(beforeA - 3);
    expect(hand(game, B).length).toBe(beforeB - 2);
  });
});

describe("Savage Swipe", () => {
  it("a power-2 creature gets +2/+2 and wins the fight", () => {
    const { game } = table();
    lands(game, "Forest", 1);
    const mine = spawn(game, "Grizzly Bears");
    const theirs = spawn(game, "Grizzly Bears", B);
    cast(game, toHand(game, "Savage Swipe"), { targets: [ref(mine), ref(theirs)] });
    expect(pt(game, mine)).toEqual({ power: 4, toughness: 4 });
    expect(zone(game, mine)).toBe("battlefield");
    expect(zone(game, theirs)).toBe("graveyard");
  });

  it("a power-3 creature gets nothing but still fights", () => {
    const { game } = table();
    lands(game, "Forest", 1);
    const mine = spawn(game, "Hill Giant");
    const theirs = spawn(game, "Grizzly Bears", B);
    cast(game, toHand(game, "Savage Swipe"), { targets: [ref(mine), ref(theirs)] });
    expect(pt(game, mine)).toEqual({ power: 3, toughness: 3 });
    expect(zone(game, theirs)).toBe("graveyard");
  });
});

describe("Spell Snuff", () => {
  it("counters, and draws at 5 or less life", () => {
    const { game } = table();
    lands(game, "Forest", 2);
    lands(game, "Island", 3);
    game.state.players[A].life = 5;
    const bears = toHand(game, "Grizzly Bears");
    cast(game, bears, { settle: false });
    const snuff = toHand(game, "Spell Snuff");
    const before = hand(game).length;
    cast(game, snuff, { targets: [ref(bears)] });
    expect(zone(game, bears)).toBe("graveyard");
    expect(hand(game).length).toBe(before - 1 + 1);
  });
});

describe("Thundering Djinn", () => {
  it("attacking, deals damage equal to the cards drawn this turn", () => {
    const { game, a } = table();
    const djinn = spawn(game, "Thundering Djinn");
    game.debugApplyEffect(A, { kind: "draw", amount: 2 }, []);
    pickTargets(a, B);
    attack(game, a, [djinn]);
    // 3 drawn — the draw step's card and the two above — plus 3 combat.
    expect(life(game, B)).toBe(20 - 3 - 3);
  });
});

describe("Enduring Sliver and Hollowhead Sliver", () => {
  it("another Sliver gains outlast {2}", () => {
    const { game } = table();
    spawn(game, "Enduring Sliver");
    const cleaving = spawn(game, "Cleaving Sliver");
    lands(game, "Plains", 2);
    activate(game, cleaving, 0);
    expect(counters(game, cleaving)).toBe(1);
    expect(game.state.objects[cleaving].tapped).toBe(true);
  });

  it("Hollowhead's Slivers loot", () => {
    const { game, a } = table();
    const hollow = spawn(game, "Hollowhead Sliver");
    const card = hand(game)[0];
    a.chooseDiscardsFn = () => [card];
    const before = hand(game).length;
    activate(game, hollow, 0);
    expect(zone(game, card)).toBe("graveyard");
    expect(hand(game).length).toBe(before);
    expect(game.state.objects[hollow].tapped).toBe(true);
  });
});

describe("Vengeful Devil", () => {
  it("activates only once a creature has died this turn", () => {
    const { game } = table();
    const devil = spawn(game, "Vengeful Devil");
    expect(() => activate(game, devil, 0, { targets: [ref(B)] })).toThrow();
    destroy(game, spawn(game, "Grizzly Bears", B));
    activate(game, devil, 0, { targets: [ref(B)] });
    expect(life(game, B)).toBe(19);
  });
});

describe("Ruination Rioter", () => {
  it("dying, may deal damage equal to the land cards in your graveyard", () => {
    const { game, a } = table();
    toGraveyard(game, "Forest");
    toGraveyard(game, "Forest");
    toGraveyard(game, "Lightning Bolt");
    const rioter = spawn(game, "Ruination Rioter");
    pickTargets(a, B);
    pickModes(a, 0);
    destroy(game, rioter);
    expect(life(game, B)).toBe(18);
  });
});

describe("Igneous Elemental", () => {
  it("costs {2} less with a land card in the graveyard, and may deal 2 to a creature", () => {
    const { game, a } = table();
    lands(game, "Mountain", 4);
    toGraveyard(game, "Forest");
    const bears = spawn(game, "Grizzly Bears", B);
    pickTargets(a, bears);
    pickModes(a, 0);
    const igneous = toHand(game, "Igneous Elemental");
    cast(game, igneous);
    expect(zone(game, igneous)).toBe("battlefield");
    expect(zone(game, bears)).toBe("graveyard");
  });

  it("costs full price with no land card in the graveyard", () => {
    const { game } = table();
    lands(game, "Mountain", 4);
    expect(() => cast(game, toHand(game, "Igneous Elemental"))).toThrow();
  });
});

describe("Trustworthy Scout", () => {
  it("exiles itself from the graveyard to find another Trustworthy Scout", () => {
    const { game, a } = table();
    lands(game, "Plains", 2);
    const dead = toGraveyard(game, "Trustworthy Scout");
    const next = toLibrary(game, "Trustworthy Scout");
    pickFromZone(a, next);
    activate(game, dead, 0);
    expect(zone(game, dead)).toBe("exile");
    expect(zone(game, next)).toBe("hand");
  });
});

describe("Soul-Strike Technique", () => {
  it("gives +1/+1 and vigilance, and manifests when the creature dies", () => {
    const { game } = table();
    lands(game, "Plains", 2);
    const bears = spawn(game, "Grizzly Bears");
    cast(game, toHand(game, "Soul-Strike Technique"), { targets: [ref(bears)] });
    expect(pt(game, bears)).toEqual({ power: 3, toughness: 3 });
    const faceDownBefore = Object.values(game.state.objects).filter(
      (o) => o.zone === "battlefield" && o.faceDown !== undefined && o.controller === A,
    ).length;
    destroy(game, bears);
    expect(graveyard(game).includes(bears)).toBe(true);
    const faceDownAfter = Object.values(game.state.objects).filter(
      (o) => o.zone === "battlefield" && o.faceDown !== undefined && o.controller === A,
    ).length;
    expect(faceDownAfter).toBe(faceDownBefore + 1);
  });
});
