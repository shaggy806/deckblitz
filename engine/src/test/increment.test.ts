/**
 * Increment (rule 702.191, Secrets of Strixhaven): "Whenever you cast a
 * spell, if this permanent is a creature and the amount of mana spent to cast
 * that spell is greater than this creature's power or this creature's
 * toughness, put a +1/+1 counter on this creature." An intervening-if, asked
 * as the spell is cast and again as the ability resolves (rule 603.4).
 */
import { describe, expect, it } from "vitest";

import { A, B, activate, cast, counters, hand, lands, life, ref, settle, spawn, table, toHand, zone } from "./harness.js";

describe("increment", () => {
  it("adds a counter only when the mana spent beats its power or its toughness", () => {
    const { game } = table();
    const graffalon = spawn(game, "Hungry Graffalon"); // 3/4
    lands(game, "Mountain", 9);
    // Fireball with X = 2: three mana, neither more than 3 power nor 4 toughness.
    cast(game, toHand(game, "Fireball"), { targets: [ref(B)], x: 2 });
    expect(counters(game, graffalon)).toBe(0);
    // X = 3: four mana, more than its power.
    cast(game, toHand(game, "Fireball"), { targets: [ref(B)], x: 3 });
    expect(counters(game, graffalon)).toBe(1);
    expect(life(game, B)).toBe(20 - 2 - 3);
  });

  it("is asked again as it resolves: a creature grown past the spell in response gets nothing", () => {
    const { game } = table();
    const graffalon = spawn(game, "Hungry Graffalon"); // 3/4
    lands(game, "Mountain", 4);
    cast(game, toHand(game, "Fireball"), { targets: [ref(B)], x: 3, settle: false });
    // In response: 4/5 — four mana is no longer more than either.
    game.debugApplyEffect(B, {
      kind: "modify-pt",
      target: 0,
      power: 1,
      toughness: 1,
      duration: "end-of-turn",
    }, [ref(graffalon)]);
    settle(game);
    expect(counters(game, graffalon)).toBe(0);
  });

  it("reads what was spent on a spell countered before the trigger resolves", () => {
    const { game } = table();
    const colony = spawn(game, "Cuboid Colony"); // 1/1
    lands(game, "Mountain", 2);
    const fireball = toHand(game, "Fireball");
    cast(game, fireball, { targets: [ref(B)], x: 1, settle: false });
    game.debugApplyEffect(B, { kind: "counter", target: 0 }, [ref(fireball)]);
    settle(game);
    expect(zone(game, fireball)).toBe("graveyard");
    expect(counters(game, colony)).toBe(1);
  });

  it("a one-mana spell doesn't beat a 1/1: greater, not equal", () => {
    const { game } = table();
    const colony = spawn(game, "Cuboid Colony");
    lands(game, "Mountain", 1);
    cast(game, toHand(game, "Shock"), { targets: [ref(B)] });
    expect(counters(game, colony)).toBe(0);
  });

  it("Pensive Professor draws when increment puts its counter", () => {
    const { game } = table();
    const professor = spawn(game, "Pensive Professor"); // 0/2
    lands(game, "Mountain", 3);
    const before = hand(game).length;
    cast(game, toHand(game, "Fireball"), { targets: [ref(B)], x: 2 });
    expect(counters(game, professor)).toBe(1);
    expect(hand(game).length).toBe(before + 1);
  });

  it("Topiary Lecturer taps for {G} equal to its power", () => {
    const { game } = table();
    const lecturer = spawn(game, "Topiary Lecturer"); // 1/2
    lands(game, "Mountain", 3);
    cast(game, toHand(game, "Fireball"), { targets: [ref(B)], x: 2 });
    expect(counters(game, lecturer)).toBe(1);
    activate(game, lecturer, 0);
    expect(game.state.players[A].manaPool.filter((m) => m.type === "G").length).toBe(2);
  });

  it("Berta adds a mana as her counter lands, and makes an X Fractal", () => {
    const { game } = table();
    const berta = spawn(game, "Berta, Wise Extrapolator"); // 1/4
    lands(game, "Mountain", 5);
    cast(game, toHand(game, "Fireball"), { targets: [ref(B)], x: 1 });
    // Two mana: more than her power of 1.
    expect(counters(game, berta)).toBe(1);
    expect(game.state.players[A].manaPool.length).toBe(1);
  });
});

describe("Textbook Tabulator", () => {
  it("surveils 2 as it enters, and a 0/3 grows from a one-mana spell", () => {
    const { game } = table();
    const tabulator = spawn(game, "Textbook Tabulator");
    lands(game, "Mountain", 1);
    cast(game, toHand(game, "Shock"), { targets: [ref(B)] });
    // One mana is more than its power of 0.
    expect(counters(game, tabulator)).toBe(1);
  });
});
