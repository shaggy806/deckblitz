/**
 * Rule 615.7: a shield of an amount over damage dealt at the same time to two
 * or more things it covers, more than it has left — its player chooses which
 * damage it prevents (`Game.shieldSharesAsked`, a `choose-number` of
 * `shieldShare` per hit, players' hits first). Divine Deflection (prevention,
 * "you and/or permanents you control") and Harm's Way (redirection, from a
 * source of your choice), in combat and from a resolving effect.
 */
import { describe, expect, it } from "vitest";

import { A, B, activate, cast, lands, life, ref, spawn, table, toHand, zone } from "./harness.js";

describe("Divine Deflection", () => {
  it("an effect's damage to you and your creature: you choose which the shield prevents", () => {
    const { game, a } = table();
    lands(game, "Plains", 3);
    // Enough that paying Divine Deflection's X with them leaves Earthquake's.
    lands(game, "Mountain", 8);
    const bears = spawn(game, "Grizzly Bears");
    cast(game, toHand(game, "Divine Deflection"), { x: 2, targets: [ref(B)] });
    const prompts: string[] = [];
    a.chooseNumberFn = (_view, offer) => {
      prompts.push(offer.prompt ?? "");
      // Your own hit first: none of the shield on you, so all of it on the Bears.
      expect(offer.min).toBe(0);
      expect(offer.max).toBe(2);
      return 0;
    };
    cast(game, toHand(game, "Earthquake"), { x: 2 });
    expect(prompts).toHaveLength(1);
    expect(prompts[0]).toContain("you");
    expect(zone(game, bears)).toBe("battlefield");
    expect(game.state.objects[bears].damageMarked ?? 0).toBe(0);
    expect(life(game, A)).toBe(18);
    // Earthquake's 2, then Divine Deflection's 2 — what it prevented.
    expect(life(game, B)).toBe(16);
  });

  it("all of the shield on you lets the creature die", () => {
    const { game, a } = table();
    lands(game, "Plains", 3);
    // Enough that paying Divine Deflection's X with them leaves Earthquake's.
    lands(game, "Mountain", 8);
    const bears = spawn(game, "Grizzly Bears");
    cast(game, toHand(game, "Divine Deflection"), { x: 2, targets: [ref(B)] });
    a.chooseNumberFn = (_view, offer) => offer.max ?? offer.min;
    cast(game, toHand(game, "Earthquake"), { x: 2 });
    expect(zone(game, bears)).toBe("graveyard");
    expect(life(game, A)).toBe(20);
    expect(life(game, B)).toBe(16);
  });

  it("a shield big enough for all of it asks nothing", () => {
    const { game, a } = table();
    lands(game, "Plains", 5);
    // Enough that paying Divine Deflection's X with them leaves Earthquake's.
    lands(game, "Mountain", 8);
    const bears = spawn(game, "Grizzly Bears");
    cast(game, toHand(game, "Divine Deflection"), { x: 4, targets: [ref(B)] });
    a.chooseNumberFn = () => {
      throw new Error("nothing to share out");
    };
    cast(game, toHand(game, "Earthquake"), { x: 2 });
    expect(zone(game, bears)).toBe("battlefield");
    expect(life(game, A)).toBe(20);
    expect(life(game, B)).toBe(14);
  });

  it("combat: a trampler's damage to your blocker and you, shared as you choose", () => {
    const { game, a, b } = table();
    lands(game, "Plains", 3);
    const bears = spawn(game, "Grizzly Bears");
    const dreadmaw = spawn(game, "Colossal Dreadmaw", B);
    // Bob's turn: the Dreadmaw attacks, the Bears block.
    game.advanceUntil((s) => s.turn.number === 2 && s.turn.step === "precombat-main");
    b.declareAttackersFn = () => [{ attacker: dreadmaw, defender: A }];
    a.declareBlockersFn = () => [{ blocker: bears, attacker: dreadmaw }];
    game.advanceUntil((s) => s.turn.step === "declare-blockers" && s.priority.holder === A && s.awaiting === null);
    cast(game, toHand(game, "Divine Deflection"), { x: 2, targets: [ref(B)], settle: false });
    game.advanceUntil((s) => s.zones.shared.stack.length === 0 && s.priority.holder !== null);
    const offers: { min: number; max?: number }[] = [];
    a.chooseNumberFn = (_view, offer) => {
      offers.push({ min: offer.min, ...(offer.max !== undefined ? { max: offer.max } : {}) });
      return 0;
    };
    game.advanceUntil((s) => s.turn.step === "postcombat-main");
    // 2 to the Bears (lethal), 4 tramples over to Alice: the shield of 2 is
    // Alice's to share; none on her, all on the Bears.
    expect(offers).toEqual([{ min: 0, max: 2 }]);
    expect(zone(game, bears)).toBe("battlefield");
    expect(life(game, A)).toBe(16);
    expect(life(game, B)).toBe(18);
  });
});

describe("Harm's Way", () => {
  it("one source's damage to you and two creatures: you choose which 2 is redirected", () => {
    const { game, a } = table();
    lands(game, "Plains", 1);
    lands(game, "Swamp", 1);
    const pestilence = spawn(game, "Pestilence");
    const bears = spawn(game, "Grizzly Bears");
    const elves = spawn(game, "Llanowar Elves");
    a.choosePermanentsFn = (_view, eligible) => eligible.filter((id) => id === pestilence);
    cast(game, toHand(game, "Harm's Way"), { targets: [ref(B)] });
    const asked: number[] = [];
    // One on you, then one of the two creatures; the last gets what's left.
    a.chooseNumberFn = (_view, offer) => {
      asked.push(offer.max ?? -1);
      return asked.length === 1 ? 1 : 0;
    };
    activate(game, pestilence, 0);
    expect(asked).toEqual([1, 1]);
    expect(life(game, A)).toBe(20);
    // Pestilence's 1, then the 2 redirected to Bob.
    expect(life(game, B)).toBe(17);
    const hurt = [bears, elves].filter((id) => zone(game, id) !== "battlefield" || (game.state.objects[id].damageMarked ?? 0) > 0);
    expect(hurt).toHaveLength(1);
  });
});
