/**
 * War of the Spark, batch 1, group A.
 */
import { describe, expect, it } from "vitest";

import {
  A,
  B,
  activate,
  cast,
  controller,
  counters,
  destroy,
  enter,
  graveyard,
  hand,
  lands,
  life,
  named,
  nextTurn,
  pickTargets,
  ref,
  settle,
  spawn,
  table,
  toHand,
  toStep,
  attack,
  zone,
} from "./harness.js";

describe("Commence the Endgame", () => {
  it("draws two, then amasses the hand size counted after the draw", () => {
    const { game } = table();
    lands(game, "Island", 6);
    const spell = toHand(game, "Commence the Endgame");
    const before = hand(game).length;
    cast(game, spell);
    expect(hand(game).length).toBe(before - 1 + 2);
    const [army] = named(game, "Army Token", A);
    expect(army).toBeDefined();
    expect(counters(game, army)).toBe(before + 1);
  });
});

describe("Fblthp, the Lost", () => {
  it("draws one when cast from hand, and shuffles itself away when a spell targets it", () => {
    const { game } = table();
    lands(game, "Island", 2);
    lands(game, "Forest", 1);
    const fblthp = toHand(game, "Fblthp, the Lost");
    const before = hand(game).length;
    cast(game, fblthp);
    expect(hand(game).length).toBe(before - 1 + 1);
    expect(zone(game, fblthp)).toBe("battlefield");
    cast(game, toHand(game, "Giant Growth"), { targets: [ref(fblthp)] });
    expect(game.state.objects[fblthp]?.zone ?? "library").not.toBe("battlefield");
    expect(named(game, "Fblthp, the Lost").length).toBe(0);
  });
});

describe("Roalesk, Apex Hybrid", () => {
  it("puts two counters on another creature, then proliferates twice as it dies", () => {
    const { game, a } = table();
    const bears = spawn(game, "Grizzly Bears");
    pickTargets(a, bears);
    const roalesk = enter(game, "Roalesk, Apex Hybrid");
    expect(counters(game, bears)).toBe(2);
    destroy(game, roalesk);
    expect(counters(game, bears)).toBe(4);
  });
});

describe("Ugin's Conjurant", () => {
  it("enters with X counters and loses counters instead of taking damage", () => {
    const { game } = table();
    lands(game, "Wastes", 3);
    const conjurant = toHand(game, "Ugin's Conjurant");
    cast(game, conjurant, { x: 3 });
    expect(counters(game, conjurant)).toBe(3);
    game.debugApplyEffect(B, { kind: "damage", amount: 2, target: 0 }, [ref(conjurant)]);
    settle(game);
    expect(zone(game, conjurant)).toBe("battlefield");
    expect(counters(game, conjurant)).toBe(1);
  });
});

describe("Band Together", () => {
  it("has two of your creatures each deal damage equal to their power to another creature", () => {
    const { game } = table();
    lands(game, "Forest", 3);
    const one = spawn(game, "Grizzly Bears");
    const two = spawn(game, "Grizzly Bears");
    const giant = spawn(game, "Hill Giant", B);
    cast(game, toHand(game, "Band Together"), { targets: [ref(one), ref(two), ref(giant)] });
    expect(zone(game, giant)).toBe("graveyard");
    expect(zone(game, one)).toBe("battlefield");
    expect(zone(game, two)).toBe("battlefield");
  });
});

describe("Dreadhorde Butcher", () => {
  it("grows on combat damage to a player and deals its power when it dies", () => {
    const { game, a } = table();
    const butcher = spawn(game, "Dreadhorde Butcher");
    attack(game, a, [butcher]);
    expect(life(game, B)).toBe(19);
    expect(counters(game, butcher)).toBe(1);
    pickTargets(a, B);
    destroy(game, butcher);
    expect(life(game, B)).toBe(17);
  });
});

describe("Snarespinner", () => {
  it("gets +2/+0 blocking a flier, and not blocking a creature without flying", () => {
    const { game, a, b } = table();
    const spinner = spawn(game, "Snarespinner");
    const drake = spawn(game, "Wind Drake", B);
    const bears = spawn(game, "Grizzly Bears", B);
    nextTurn(game);
    b.declareAttackersFn = () => [{ attacker: drake, defender: A }];
    a.declareBlockersFn = () => [{ blocker: spinner, attacker: drake }];
    toStep(game, "postcombat-main", B);
    expect(zone(game, drake)).toBe("graveyard");

    nextTurn(game);
    nextTurn(game);
    b.declareAttackersFn = () => [{ attacker: bears, defender: A }];
    a.declareBlockersFn = () => [{ blocker: spinner, attacker: bears }];
    toStep(game, "postcombat-main", B);
    expect(zone(game, bears)).toBe("battlefield");
  });
});

describe("Chandra's Triumph", () => {
  it("deals 3, or 5 with a Chandra planeswalker", () => {
    const { game } = table();
    lands(game, "Mountain", 4);
    const first = spawn(game, "Roalesk, Apex Hybrid", B);
    cast(game, toHand(game, "Chandra's Triumph"), { targets: [ref(first)] });
    expect(zone(game, first)).toBe("battlefield");
    spawn(game, "Chandra, Torch of Defiance");
    cast(game, toHand(game, "Chandra's Triumph"), { targets: [ref(first)] });
    expect(zone(game, first)).toBe("graveyard");
  });
});

describe("Charmed Stray", () => {
  it("counters only the other Charmed Strays", () => {
    const { game } = table();
    lands(game, "Plains", 1);
    const first = spawn(game, "Charmed Stray");
    const bears = spawn(game, "Grizzly Bears");
    const second = toHand(game, "Charmed Stray");
    cast(game, second);
    expect(counters(game, first)).toBe(1);
    expect(counters(game, second)).toBe(0);
    expect(counters(game, bears)).toBe(0);
  });
});

describe("Gideon's Company", () => {
  it("gets two counters per life gain, and can't add loyalty to a non-Gideon", () => {
    const { game } = table();
    lands(game, "Plains", 4);
    const company = spawn(game, "Gideon's Company");
    game.debugApplyEffect(A, { kind: "gain-life", amount: 3 }, []);
    settle(game);
    expect(counters(game, company)).toBe(2);
    const chandra = spawn(game, "Chandra, Torch of Defiance");
    expect(() => activate(game, company, 0, { targets: [ref(chandra)] })).toThrow();
  });
});

describe("Bond of Passion", () => {
  it("steals and untaps a creature and deals 2 damage to another target", () => {
    const { game } = table();
    lands(game, "Mountain", 6);
    const bears = spawn(game, "Grizzly Bears", B, { tapped: true });
    cast(game, toHand(game, "Bond of Passion"), { targets: [ref(bears), ref(B)] });
    expect(controller(game, bears)).toBe(A);
    expect(game.state.objects[bears].tapped).toBe(false);
    expect(life(game, B)).toBe(18);
  });
});

describe("Ral's Outburst", () => {
  it("deals 3 and puts one of the top two into hand, the other into the graveyard", () => {
    const { game } = table();
    lands(game, "Island", 2);
    lands(game, "Mountain", 2);
    const spell = toHand(game, "Ral's Outburst");
    const handBefore = hand(game).length;
    const graveBefore = graveyard(game).length;
    cast(game, spell, { targets: [ref(B)] });
    expect(life(game, B)).toBe(17);
    expect(hand(game).length).toBe(handBefore - 1 + 1);
    expect(graveyard(game).length).toBe(graveBefore + 2);
  });
});
