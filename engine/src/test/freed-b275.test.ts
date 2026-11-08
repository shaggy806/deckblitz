/**
 * Batch 275, the lead's cards (need-key themes step 1: keys that were
 * probably expressible): Bilbo, Thief in the Night and Advanced
 * Reconstruction (`costModification.notFromCastersHand`), Territorial Gorger
 * (a `counters-put` `orPlayer` trigger's `who` reads the player) and Protean
 * Hydra (`counters-removed`'s `perCounter`).
 */
import { describe, expect, it } from "vitest";
import { A, B, cast, counters, lands, nextTurn, pt, ref, settle, spawn, table, toHand, toStep, zone } from "./harness.js";

describe("spells cast from anywhere other than your hand cost less (notFromCastersHand)", () => {
  it("Bilbo: a flashback cast from the graveyard costs {1} less", () => {
    const { game } = table({ deck: "Island" });
    spawn(game, "Bilbo, Thief in the Night");
    lands(game, "Island", 2);
    const twice = game.debugSpawn("Think Twice", A, "graveyard");
    cast(game, twice, { via: "flashback" });
    expect(zone(game, twice)).toBe("exile");
  });

  it("Bilbo: a spell cast from your hand costs what it says", () => {
    const { game } = table({ deck: "Island" });
    spawn(game, "Bilbo, Thief in the Night");
    lands(game, "Island", 2);
    expect(() => cast(game, toHand(game, "Divination"))).toThrow();
  });

  it("Bilbo: an opponent's spell from their graveyard isn't reduced", () => {
    const { game } = table({ deck: "Island" });
    spawn(game, "Bilbo, Thief in the Night");
    nextTurn(game);
    lands(game, "Island", 2, B);
    const twice = game.debugSpawn("Think Twice", B, "graveyard");
    expect(() => cast(game, twice, { player: B, via: "flashback" })).toThrow();
  });

  it("Advanced Reconstruction: only at level 3, and {2} less", () => {
    const { game } = table({ deck: "Island" });
    const cls = spawn(game, "Advanced Reconstruction");
    game.state.objects[cls].classLevel = 3;
    lands(game, "Island", 1);
    const twice = game.debugSpawn("Think Twice", A, "graveyard");
    cast(game, twice, { via: "flashback" });
    expect(zone(game, twice)).toBe("exile");
  });

  it("Advanced Reconstruction: level 1 mills a card and exiles one at random to play this turn", () => {
    const { game } = table({ deck: "Mountain" });
    spawn(game, "Advanced Reconstruction");
    nextTurn(game);
    nextTurn(game);
    settle(game);
    const exiled = Object.values(game.state.objects).filter((o) => o.zone === "exile" && o.owner === A);
    expect(exiled).toHaveLength(1);
    game.dispatch({ type: "play-land", player: A, card: exiled[0].id });
    settle(game);
    expect(zone(game, exiled[0].id)).toBe("battlefield");
  });
});

describe("Territorial Gorger: whenever you get one or more {E}", () => {
  it("gets +2/+2 once for your energy, not for an opponent's", () => {
    const { game } = table();
    const gorger = spawn(game, "Territorial Gorger");
    game.debugApplyEffect(A, { kind: "get-energy", amount: 3 });
    settle(game);
    expect(pt(game, gorger)).toEqual({ power: 4, toughness: 4 });
    game.debugApplyEffect(B, { kind: "get-energy", amount: 2 });
    settle(game);
    expect(pt(game, gorger)).toEqual({ power: 4, toughness: 4 });
  });
});

describe("Protean Hydra: once per +1/+1 counter removed", () => {
  it("prevents damage, loses that many counters, and gets two back for each at the next end step", () => {
    const { game } = table({ deck: "Forest" });
    lands(game, "Forest", 4);
    const hydra = toHand(game, "Protean Hydra");
    cast(game, hydra, { x: 3 });
    expect(counters(game, hydra)).toBe(3);
    const source = spawn(game, "Grizzly Bears", B);
    game.debugApplyEffect(B, { kind: "damage", amount: 2, target: 0 }, [ref(hydra)], { source });
    settle(game);
    expect(zone(game, hydra)).toBe("battlefield");
    expect(counters(game, hydra)).toBe(1);
    expect(game.state.objects[hydra].damageMarked).toBe(0);
    toStep(game, "end");
    settle(game);
    expect(counters(game, hydra)).toBe(5);
  });

  it("a Hydra that left and came back is a new object: the delayed counters don't follow it (rule 400.7)", () => {
    const { game } = table({ deck: "Forest" });
    lands(game, "Forest", 4);
    const hydra = toHand(game, "Protean Hydra");
    cast(game, hydra, { x: 3 });
    // An anthem keeps the counterless Hydra alive once it's back.
    spawn(game, "Glorious Anthem");
    const source = spawn(game, "Grizzly Bears", B);
    game.debugApplyEffect(B, { kind: "damage", amount: 1, target: 0 }, [ref(hydra)], { source });
    settle(game);
    game.debugApplyEffect(A, { kind: "flicker", target: 0 }, [ref(hydra)]);
    settle(game);
    expect(zone(game, hydra)).toBe("battlefield");
    toStep(game, "end");
    settle(game);
    expect(zone(game, hydra)).toBe("battlefield");
    expect(counters(game, hydra)).toBe(0);
  });
});
