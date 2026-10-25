/**
 * Zendikar (ZEN; B165), group A. One test per card whose behaviour is more
 * than a stat line or an already-tested shape, on the clause most likely to
 * be wrong.
 */
import { describe, expect, it } from "vitest";

import {
  A,
  B,
  activate,
  attack,
  cast,
  counters,
  enter,
  graveyard,
  hand,
  keywords,
  lands,
  life,
  pickModes,
  pickTargets,
  pt,
  ref,
  settle,
  spawn,
  table,
  toGraveyard,
  toHand,
  zone,
} from "./harness.js";

describe("Punishing Fire", () => {
  it("returns from the graveyard for {R} when an opponent gains life", () => {
    const { game, a } = table();
    const fire = toGraveyard(game, "Punishing Fire");
    lands(game, "Mountain", 1);
    pickModes(a, 0);
    game.debugApplyEffect(B, { kind: "gain-life", amount: 2 }, []);
    settle(game);
    expect(zone(game, fire)).toBe("hand");
  });

  it("doesn't trigger when you gain life", () => {
    const { game, a } = table();
    const fire = toGraveyard(game, "Punishing Fire");
    lands(game, "Mountain", 1);
    pickModes(a, 0);
    game.debugApplyEffect(A, { kind: "gain-life", amount: 2 }, []);
    settle(game);
    expect(zone(game, fire)).toBe("graveyard");
  });
});

describe("Needlebite Trap", () => {
  it("costs {B} once an opponent gained life this turn, and drains 5", () => {
    const { game } = table();
    lands(game, "Swamp", 1);
    const trap = toHand(game, "Needlebite Trap");
    expect(() => cast(game, trap, { targets: [ref(B)], altCost: true, settle: false })).toThrow();
    game.debugApplyEffect(B, { kind: "gain-life", amount: 1 }, []);
    settle(game);
    cast(game, trap, { targets: [ref(B)], altCost: true });
    expect(life(game, B)).toBe(16);
    expect(life(game, A)).toBe(25);
  });
});

describe("Sphinx of Lost Truths", () => {
  it("unkicked, draws three then discards three", () => {
    const { game } = table();
    lands(game, "Island", 5);
    const sphinx = toHand(game, "Sphinx of Lost Truths");
    const before = hand(game).length;
    cast(game, sphinx);
    expect(zone(game, sphinx)).toBe("battlefield");
    expect(hand(game).length).toBe(before - 1);
  });

  it("kicked, only draws three", () => {
    const { game } = table();
    lands(game, "Island", 7);
    const sphinx = toHand(game, "Sphinx of Lost Truths");
    const before = hand(game).length;
    cast(game, sphinx, { kicked: true });
    expect(zone(game, sphinx)).toBe("battlefield");
    expect(hand(game).length).toBe(before - 1 + 3);
  });
});

describe("Aether Figment", () => {
  it("kicked, enters with two +1/+1 counters", () => {
    const { game } = table();
    lands(game, "Island", 5);
    const figment = toHand(game, "Aether Figment");
    cast(game, figment, { kicked: true });
    expect(counters(game, figment)).toBe(2);
    expect(pt(game, figment)).toEqual({ power: 3, toughness: 3 });
  });
});

describe("Tanglesap", () => {
  it("prevents combat damage from creatures without trample only", () => {
    const { game, a } = table();
    const bears = spawn(game, "Grizzly Bears");
    const trampler = spawn(game, "Grizzly Bears");
    game.debugApplyEffect(A, { kind: "grant-keyword", target: 0, keyword: "trample", duration: "end-of-turn" }, [ref(trampler)]);
    settle(game);
    lands(game, "Forest", 2);
    cast(game, toHand(game, "Tanglesap"));
    attack(game, a, [bears, trampler]);
    expect(life(game, B)).toBe(18);
  });
});

describe("Electropotence", () => {
  it("for {2}{R}, the entering creature deals damage equal to its power", () => {
    const { game, a } = table();
    spawn(game, "Electropotence");
    lands(game, "Mountain", 3);
    pickTargets(a, B);
    pickModes(a, 0);
    enter(game, "Grizzly Bears");
    expect(life(game, B)).toBe(18);
  });
});

describe("Murasa Pyromancer", () => {
  it("deals damage equal to the Allies you control when another Ally enters", () => {
    const { game, a } = table();
    spawn(game, "Murasa Pyromancer");
    const target = spawn(game, "Hill Giant", B);
    pickTargets(a, target);
    pickModes(a, 0);
    enter(game, "Seascape Aerialist");
    expect(zone(game, target)).toBe("battlefield");
    expect(game.state.objects[target].damageMarked).toBe(2);
  });
});

describe("Seascape Aerialist", () => {
  it("gives Allies you control flying, not other creatures", () => {
    const { game, a } = table();
    const ally = spawn(game, "Murasa Pyromancer");
    const bears = spawn(game, "Hill Giant");
    pickTargets(a, bears);
    pickModes(a, 0);
    const aerialist = enter(game, "Seascape Aerialist");
    expect(keywords(game, aerialist).has("flying")).toBe(true);
    expect(keywords(game, ally).has("flying")).toBe(true);
    expect(keywords(game, bears).has("flying")).toBe(false);
  });
});

describe("Scythe Tiger", () => {
  it("is sacrificed with no land to sacrifice", () => {
    const { game } = table();
    const tiger = enter(game, "Scythe Tiger");
    expect(zone(game, tiger)).toBe("graveyard");
  });
});

describe("Ior Ruin Expedition", () => {
  it("gathers quest counters on landfall and cashes three in for two cards", () => {
    const { game, a } = table();
    const expedition = spawn(game, "Ior Ruin Expedition");
    pickModes(a, 0);
    enter(game, "Island");
    enter(game, "Island");
    enter(game, "Island");
    expect(counters(game, expedition, "quest")).toBe(3);
    const before = hand(game).length;
    activate(game, expedition);
    expect(zone(game, expedition)).toBe("graveyard");
    expect(hand(game).length).toBe(before + 2);
  });
});

describe("Soul Stair Expedition", () => {
  it("returns up to two creature cards from your graveyard", () => {
    const { game } = table();
    const expedition = spawn(game, "Soul Stair Expedition");
    game.state.objects[expedition].counters.quest = 3;
    const one = toGraveyard(game, "Grizzly Bears");
    const two = toGraveyard(game, "Hill Giant");
    activate(game, expedition, 0, { targets: [ref(one), ref(two)] });
    expect(zone(game, one)).toBe("hand");
    expect(zone(game, two)).toBe("hand");
    expect(graveyard(game)).toContain(expedition);
  });
});

describe("Magma Rift", () => {
  it("sacrifices a land as it's cast and deals 5", () => {
    const { game } = table();
    const [, , , extra] = lands(game, "Mountain", 4);
    const giant = spawn(game, "Hill Giant", B);
    cast(game, toHand(game, "Magma Rift"), { targets: [ref(giant)], sacrifice: extra });
    expect(zone(game, extra)).toBe("graveyard");
    expect(zone(game, giant)).toBe("graveyard");
  });
});
