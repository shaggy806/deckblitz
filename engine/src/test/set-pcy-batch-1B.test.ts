/**
 * Prophecy (PCY), group B: Avatar of Fury's conditional cost reduction,
 * Alexi's X targets behind a discard cost, Copper-Leaf Angel's "Sacrifice X
 * lands", Excise's punisher read as it resolves, and the "no untapped lands"
 * cycle (Well of Life, Fen Stalker) with Troublesome Spirit tapping them.
 */
import { describe, expect, it } from "vitest";

import { A, B, activate, cast, counters, hand, keywords, lands, life, ref, settle, spawn, table, toHand, toStep, zone } from "./harness.js";

describe("Avatar of Fury", () => {
  it("costs {R}{R} while an opponent controls seven lands, and full price otherwise", () => {
    const { game } = table();
    lands(game, "Mountain", 2);
    const avatar = toHand(game, "Avatar of Fury");
    lands(game, "Forest", 6, B);
    expect(() => cast(game, avatar)).toThrow();
    lands(game, "Forest", 1, B);
    cast(game, avatar);
    expect(zone(game, avatar)).toBe("battlefield");
  });
});

describe("Alexi, Zephyr Mage", () => {
  it("{X}{U}, {T}, discard two: returns X target creatures", () => {
    const { game } = table();
    lands(game, "Island", 3);
    const alexi = spawn(game, "Alexi, Zephyr Mage");
    const one = spawn(game, "Grizzly Bears", B);
    const two = spawn(game, "Hill Giant", B);
    const before = hand(game, A).length;
    activate(game, alexi, 0, { x: 2, targets: [ref(one), ref(two)] });
    expect(zone(game, one)).toBe("hand");
    expect(zone(game, two)).toBe("hand");
    expect(hand(game, A).length).toBe(before - 2);
  });
});

describe("Copper-Leaf Angel", () => {
  it("{T}, Sacrifice X lands: X +1/+1 counters", () => {
    const { game } = table();
    const angel = spawn(game, "Copper-Leaf Angel");
    const plains = lands(game, "Plains", 3);
    activate(game, angel, 0, { x: 2, settle: false });
    const awaiting = game.state.awaiting;
    if (awaiting?.kind === "sacrifice") {
      game.dispatch({ type: "sacrifice", player: A, permanents: plains.slice(0, 2) });
    }
    settle(game);
    expect(plains.filter((id) => zone(game, id) === "graveyard")).toHaveLength(2);
    expect(counters(game, angel)).toBe(2);
  });
});

describe("Excise", () => {
  const attackingBears = () => {
    const t = table();
    const { game, b } = t;
    const bears = spawn(game, "Grizzly Bears", B);
    lands(game, "Plains", 3, B);
    lands(game, "Plains", 3, A);
    b.declareAttackersFn = () => [{ attacker: bears, defender: A }];
    game.advanceUntil((s) => s.turn.number === 2 && s.turn.step === "declare-attackers" && s.priority.holder === A);
    return { ...t, bears };
  };

  it("exiles the attacker when its controller doesn't pay {X}", () => {
    const { game, bears } = attackingBears();
    cast(game, toHand(game, "Excise"), { x: 2, targets: [ref(bears)] });
    expect(zone(game, bears)).toBe("exile");
  });

  it("spares it when its controller pays {X}", () => {
    const { game, b, bears } = attackingBears();
    b.chooseModesFn = () => [0];
    cast(game, toHand(game, "Excise"), { x: 2, targets: [ref(bears)] });
    expect(zone(game, bears)).toBe("battlefield");
    expect(game.state.zones.shared.battlefield.filter((id) => game.state.objects[id].controller === B && game.state.objects[id].tapped && game.state.objects[id].cardName === "Plains")).toHaveLength(2);
  });
});

describe("the no-untapped-lands cycle", () => {
  it("Well of Life gains 2 only with every land tapped", () => {
    const { game } = table();
    spawn(game, "Well of Life");
    const plains = spawn(game, "Plains", A, { tapped: true });
    toStep(game, "end");
    settle(game);
    expect(life(game, A)).toBe(22);
    game.state.objects[plains].tapped = false;
    toStep(game, "end");
    settle(game);
    expect(life(game, A)).toBe(22);
  });

  it("Fen Stalker has fear only while you control no untapped lands", () => {
    const { game } = table();
    const stalker = spawn(game, "Fen Stalker");
    expect(keywords(game, stalker).has("fear")).toBe(true);
    const swamp = spawn(game, "Swamp");
    expect(keywords(game, stalker).has("fear")).toBe(false);
    game.state.objects[swamp].tapped = true;
    expect(keywords(game, stalker).has("fear")).toBe(true);
  });

  it("Troublesome Spirit taps all your lands at your end step, not an opponent's", () => {
    const { game } = table();
    spawn(game, "Troublesome Spirit");
    const mine = lands(game, "Island", 2);
    const theirs = lands(game, "Island", 1, B);
    toStep(game, "end");
    settle(game);
    for (const id of mine) expect(game.state.objects[id].tapped).toBe(true);
    expect(game.state.objects[theirs[0]].tapped).toBe(false);
  });
});
