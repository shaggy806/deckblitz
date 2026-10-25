/**
 * Zendikar (ZEN; B165), group D. One test per card whose behaviour is more
 * than a stat line, on the clause most likely to be wrong.
 */
import { describe, expect, it } from "vitest";

import {
  A,
  B,
  type BlockOffer,
  activate,
  blockOffer,
  cast,
  counters,
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
  pickPermanents,
  pickTargets,
  pt,
  ref,
  settle,
  spawn,
  table,
  toHand,
  toLibrary,
  tokensNamed,
  zone,
} from "./harness.js";

describe("Highland Berserker / Oran-Rief Survivalist / Kazandu Blademaster", () => {
  it("another Ally entering gives Allies first strike and each counts itself", () => {
    const { game, a } = table();
    pickModes(a, 0);
    const berserker = spawn(game, "Highland Berserker");
    const blademaster = spawn(game, "Kazandu Blademaster");
    const bears = spawn(game, "Grizzly Bears");
    const survivalist = enter(game, "Oran-Rief Survivalist");
    expect(keywords(game, survivalist).has("first-strike")).toBe(true);
    expect(keywords(game, berserker).has("first-strike")).toBe(true);
    expect(keywords(game, bears).has("first-strike")).toBe(false);
    expect(counters(game, survivalist)).toBe(1);
    expect(counters(game, blademaster)).toBe(1);
  });
});

describe("Feast of Blood", () => {
  it("needs two Vampires to cast", () => {
    const { game } = table();
    lands(game, "Swamp", 2);
    spawn(game, "Vampire Nighthawk");
    const bears = spawn(game, "Grizzly Bears", B);
    const feast = toHand(game, "Feast of Blood");
    expect(() => cast(game, feast, { targets: [ref(bears)], settle: false })).toThrow();
    spawn(game, "Vampire Interloper");
    cast(game, feast, { targets: [ref(bears)] });
    expect(zone(game, bears)).toBe("graveyard");
    expect(life(game)).toBe(24);
  });
});

describe("Khalni Gem", () => {
  it("returns exactly two lands", () => {
    const { game, a } = table();
    const [l1, l2, l3] = lands(game, "Forest", 3);
    const seen = pickPermanents(a, l1, l3);
    enter(game, "Khalni Gem");
    expect(seen.offered).toHaveLength(3);
    expect(zone(game, l1)).toBe("hand");
    expect(zone(game, l3)).toBe("hand");
    expect(zone(game, l2)).toBe("battlefield");
  });
});

describe("Mold Shambler", () => {
  it("kicked, destroys a noncreature permanent", () => {
    const { game, a } = table();
    lands(game, "Forest", 6);
    const anthem = spawn(game, "Glorious Anthem", B);
    pickTargets(a, anthem);
    cast(game, toHand(game, "Mold Shambler"), { kicked: true });
    expect(zone(game, anthem)).toBe("graveyard");
  });
});

describe("Quest for Ancient Secrets", () => {
  it("counts cards put into your graveyard and shuffles a graveyard away", () => {
    const { game, a } = table();
    pickModes(a, 0);
    const quest = spawn(game, "Quest for Ancient Secrets");
    game.debugApplyEffect(A, { kind: "mill", target: "you", amount: 5 }, []);
    settle(game);
    expect(counters(game, quest, "quest")).toBe(5);
    activate(game, quest, 0, { targets: [ref(A)] });
    // Sacrificed as the cost, so it's shuffled in with the rest.
    expect(zone(game, quest)).toBe("library");
    expect(graveyard(game).length).toBe(0);
  });
});

describe("Zektar Shrine Expedition", () => {
  it("makes a 7/1 that's exiled at the next end step", () => {
    const { game, a } = table();
    pickModes(a, 0);
    const exp = spawn(game, "Zektar Shrine Expedition");
    enter(game, "Mountain");
    expect(counters(game, exp, "quest")).toBe(1);
    game.state.objects[exp].counters.quest = 3;
    activate(game, exp);
    expect(tokensNamed(game, "Elemental Token 7/1 (Trample, Haste)")).toBe(1);
    nextTurn(game);
    expect(tokensNamed(game, "Elemental Token 7/1 (Trample, Haste)")).toBe(0);
  });
});

describe("Predatory Urge", () => {
  it("the enchanted creature deals and is dealt damage", () => {
    const { game } = table();
    lands(game, "Forest", 4);
    const giant = spawn(game, "Hill Giant");
    const bears = spawn(game, "Grizzly Bears", B);
    cast(game, toHand(game, "Predatory Urge"), { targets: [ref(giant)] });
    activate(game, giant, 0, { targets: [ref(bears)] });
    expect(zone(game, bears)).toBe("graveyard");
    expect(game.state.objects[giant].damageMarked).toBe(2);
  });
});

describe("Baloth Cage Trap", () => {
  it("costs {1}{G} after an opponent's artifact entered", () => {
    const { game } = table();
    lands(game, "Forest", 2);
    const trap = toHand(game, "Baloth Cage Trap");
    expect(() => cast(game, trap, { altCost: true, settle: false })).toThrow();
    enter(game, "Ornithopter", B);
    cast(game, trap, { altCost: true });
    expect(tokensNamed(game, "Beast Token", A)).toBe(1);
  });
});

describe("Merfolk Wayfinder", () => {
  it("puts revealed Islands into your hand", () => {
    const { game } = table();
    const island = toLibrary(game, "Island");
    const before = hand(game).length;
    enter(game, "Merfolk Wayfinder");
    expect(zone(game, island)).toBe("hand");
    expect(hand(game).length).toBe(before + 1);
  });
});

describe("Gigantiform", () => {
  it("sets base 8/8 with trample, and kicked fetches another", () => {
    const { game, a } = table();
    lands(game, "Forest", 9);
    const bears = spawn(game, "Grizzly Bears");
    const second = toLibrary(game, "Gigantiform");
    pickModes(a, 0);
    pickFromZone(a, second);
    cast(game, toHand(game, "Gigantiform"), { targets: [ref(bears)], kicked: true });
    expect(pt(game, bears)).toEqual({ power: 8, toughness: 8 });
    expect(keywords(game, bears).has("trample")).toBe(true);
    expect(zone(game, second)).toBe("battlefield");
    expect(named(game, "Gigantiform")).toHaveLength(2);
  });
});

describe("Pitfall Trap", () => {
  it("costs {W} only while exactly one creature attacks", () => {
    const { game, a } = table();
    lands(game, "Plains", 1);
    const bears = spawn(game, "Grizzly Bears");
    a.declareAttackersFn = () => [{ attacker: bears, defender: B }];
    game.advanceUntil((s) => s.turn.step === "declare-attackers" && s.priority.holder === A && s.awaiting === null);
    cast(game, toHand(game, "Pitfall Trap"), { targets: [ref(bears)], altCost: true });
    expect(zone(game, bears)).toBe("graveyard");
  });

  it("can't be cast for {W} with two attackers", () => {
    const { game, a } = table();
    lands(game, "Plains", 1);
    const bears = spawn(game, "Grizzly Bears");
    const giant = spawn(game, "Hill Giant");
    a.declareAttackersFn = () => [
      { attacker: bears, defender: B },
      { attacker: giant, defender: B },
    ];
    game.advanceUntil((s) => s.turn.step === "declare-attackers" && s.priority.holder === A && s.awaiting === null);
    expect(() =>
      cast(game, toHand(game, "Pitfall Trap"), { targets: [ref(bears)], altCost: true, settle: false }),
    ).toThrow();
  });
});

describe("Shoal Serpent", () => {
  it("loses defender after landfall", () => {
    const { game } = table();
    const serpent = spawn(game, "Shoal Serpent");
    expect(keywords(game, serpent).has("defender")).toBe(true);
    enter(game, "Island");
    expect(keywords(game, serpent).has("defender")).toBe(false);
  });
});

describe("Tempest Owl", () => {
  it("kicked, taps three permanents", () => {
    const { game, a } = table();
    lands(game, "Island", 7);
    const x = spawn(game, "Grizzly Bears", B);
    const y = spawn(game, "Hill Giant", B);
    const z = spawn(game, "Glorious Anthem", B);
    pickTargets(a, x, y, z);
    cast(game, toHand(game, "Tempest Owl"), { kicked: true });
    for (const id of [x, y, z]) expect(game.state.objects[id].tapped).toBe(true);
  });
});

describe("Mindless Null", () => {
  it("can't block without a Vampire", () => {
    const { game, a } = table();
    const nul = spawn(game, "Mindless Null", B);
    const bears = spawn(game, "Grizzly Bears");
    a.declareAttackersFn = () => [{ attacker: bears, defender: B }];
    game.advanceUntil((s) => s.turn.step === "declare-blockers" || s.awaiting?.kind === "blockers");
    const offer = game.legalActions(B).find((o): o is BlockOffer => o.kind === "declare-blockers");
    expect(offer?.eligible.find((e) => e.blocker === nul)?.canBlock ?? []).toEqual([]);
  });

  it("can block with one", () => {
    const { game, a } = table();
    const nul = spawn(game, "Mindless Null", B);
    spawn(game, "Vampire Interloper", B);
    const bears = spawn(game, "Grizzly Bears");
    const offer = blockOffer(game, a, [bears]);
    expect(offer.eligible.find((e) => e.blocker === nul)?.canBlock ?? []).toEqual([bears]);
  });
});
