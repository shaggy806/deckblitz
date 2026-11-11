import { describe, expect, it } from "vitest";

import { invalidateComputedCache } from "../characteristics.js";
import { bindWardCost, wardCostText } from "../effects.js";
import { A, B, attack, cast, lands, life, named, pickModes, pickTargets, pt, ref, settle, spawn, table, toHand, toStep, zone } from "./harness.js";

// A ward cost whose size is read as the ward ability resolves (rules 702.21a,
// 608.2h): `WardCost.payGeneric` and `payLifeAmount`.

const tappedLands = (game: ReturnType<typeof table>["game"]): number =>
  named(game, "Mountain", A).filter((id) => game.state.objects[id].tapped).length;

describe("Minthara, Merciless Soul — ward {X}, X your experience counters", () => {
  it("asks for {X} as the ward ability resolves", () => {
    const { game, a } = table();
    const minthara = spawn(game, "Minthara, Merciless Soul", B);
    game.state.players[B].counters = { ...game.state.players[B].counters, experience: 2 };
    lands(game, "Mountain", 3);
    pickModes(a, 0);
    cast(game, toHand(game, "Lightning Bolt"), { targets: [ref(minthara)] });
    expect(game.eventsOfType("ward-paid").some((e) => e.object === minthara)).toBe(true);
    expect(tappedLands(game)).toBe(3); // {R} and ward {2}
    expect(zone(game, minthara)).toBe("graveyard");
  });

  it("counts the counters when it resolves, not when Minthara was targeted", () => {
    const { game, a } = table();
    const minthara = spawn(game, "Minthara, Merciless Soul", B);
    game.state.players[B].counters = { ...game.state.players[B].counters, experience: 1 };
    lands(game, "Mountain", 3);
    pickModes(a, 0);
    cast(game, toHand(game, "Lightning Bolt"), { targets: [ref(minthara)], settle: false });
    // The ward trigger is waiting or on the stack: three counters by the time it resolves.
    game.state.players[B].counters = { ...game.state.players[B].counters, experience: 3 };
    invalidateComputedCache();
    settle(game);
    // {3} can't be paid with the two Mountains left: countered.
    expect(game.eventsOfType("ward-unpaid").some((e) => e.object === minthara)).toBe(true);
    expect(zone(game, minthara)).toBe("battlefield");
  });

  it("with no counters it's ward {0}: asked, and declining still counters", () => {
    const paid = table();
    const m1 = spawn(paid.game, "Minthara, Merciless Soul", B);
    lands(paid.game, "Mountain", 1);
    pickModes(paid.a, 0);
    cast(paid.game, toHand(paid.game, "Lightning Bolt"), { targets: [ref(m1)] });
    expect(zone(paid.game, m1)).toBe("graveyard");

    const declined = table();
    const m2 = spawn(declined.game, "Minthara, Merciless Soul", B);
    lands(declined.game, "Mountain", 1);
    pickModes(declined.a);
    cast(declined.game, toHand(declined.game, "Lightning Bolt"), { targets: [ref(m2)] });
    expect(zone(declined.game, m2)).toBe("battlefield");
  });

  it("gets an experience counter at its controller's end step if a permanent of theirs left, and pumps their creatures", () => {
    const { game } = table();
    const minthara = spawn(game, "Minthara, Merciless Soul", A);
    const bear = spawn(game, "Grizzly Bears", A);
    toStep(game, "end");
    settle(game);
    expect(game.state.players[A].counters.experience ?? 0).toBe(0); // nothing left

    const again = table();
    const m = spawn(again.game, "Minthara, Merciless Soul", A);
    const b = spawn(again.game, "Grizzly Bears", A);
    const doomed = spawn(again.game, "Grizzly Bears", A);
    lands(again.game, "Mountain", 1);
    cast(again.game, toHand(again.game, "Lightning Bolt"), { targets: [ref(doomed)] });
    toStep(again.game, "end");
    settle(again.game);
    expect(again.game.state.players[A].counters.experience).toBe(1);
    expect(pt(again.game, b)).toEqual({ power: 3, toughness: 2 });
    expect(pt(again.game, m)).toEqual({ power: 3, toughness: 2 });
    expect(pt(game, bear)).toEqual({ power: 2, toughness: 2 });
    expect(pt(game, minthara)).toEqual({ power: 2, toughness: 2 });
  });
});

describe("Raubahn, Bull of Ala Mhigo — ward, pay life equal to its power", () => {
  it("costs its power as the ward ability resolves", () => {
    const { game, a } = table();
    const raubahn = spawn(game, "Raubahn, Bull of Ala Mhigo", B);
    game.state.objects[raubahn].counters = { "+1/+1": 3 };
    invalidateComputedCache();
    lands(game, "Mountain", 1);
    pickModes(a, 0);
    cast(game, toHand(game, "Shock"), { targets: [ref(raubahn)] });
    expect(life(game, A)).toBe(15); // power 5
    expect(game.state.objects[raubahn].damageMarked).toBe(2);
  });

  it("can't be paid by a player with less life than its power", () => {
    const { game, a } = table({ life: 4 });
    const raubahn = spawn(game, "Raubahn, Bull of Ala Mhigo", B);
    game.state.objects[raubahn].counters = { "+1/+1": 3 };
    invalidateComputedCache();
    lands(game, "Mountain", 1);
    pickModes(a, 0);
    cast(game, toHand(game, "Shock"), { targets: [ref(raubahn)] });
    expect(life(game, A)).toBe(4);
    expect(game.eventsOfType("ward-unpaid").some((e) => e.object === raubahn)).toBe(true);
    expect(game.state.objects[raubahn].damageMarked).toBe(0);
  });

  it("attacking, moves an Equipment its controller controls onto a target attacking creature", () => {
    const { game, a } = table();
    const raubahn = spawn(game, "Raubahn, Bull of Ala Mhigo", A);
    const bear = spawn(game, "Grizzly Bears", A);
    const sword = spawn(game, "Short Sword", A);
    pickTargets(a, sword, bear);
    attack(game, a, [raubahn, bear]);
    expect(game.state.objects[sword].attachedTo).toBe(bear);
  });
});

describe("a ward cost's read amounts", () => {
  it("prints the card's wording until bound, the numbers after", () => {
    const x = { payGeneric: { playerCounters: "experience" }, text: "{X}, where X is the number of experience counters you have" } as const;
    expect(wardCostText(x)).toBe(" {X}, where X is the number of experience counters you have");
    expect(wardCostText(bindWardCost(x, () => 4))).toBe(" {4}");
    const l = { payLifeAmount: { powerOf: "source" }, text: "Pay life equal to Raubahn's power" } as const;
    expect(wardCostText(l)).toBe("—Pay life equal to Raubahn's power.");
    expect(bindWardCost(l, () => -1)).toEqual({ payLife: 0 });
    expect(bindWardCost({ mana: "{2}" }, () => 9)).toEqual({ mana: "{2}" });
  });
});
