/**
 * "Whenever you activate a loyalty ability of enchanted planeswalker" (rule
 * 606.1): an attached `activates-ability` trigger with `loyalty` and
 * `activator: "you"` — Elspeth's Talent beside Rowan's Talent (whose tests are
 * in `top10000-batch-333.test.ts`): the host's printed loyalty abilities and
 * the one the Aura grants it, activated by the Aura's controller only.
 */

import { describe, expect, it } from "vitest";

import { B, activate, cast, keywords, lands, loyalty, nextTurn, pt, ref, spawn, table, toHand, tokensNamed } from "./harness.js";

describe("Elspeth's Talent", () => {
  it("a printed loyalty ability: creatures you control get +2/+2 and vigilance until end of turn", () => {
    const { game } = table();
    const jace = spawn(game, "Jace Beleren");
    game.state.objects[jace].counters.loyalty = 3;
    const bears = spawn(game, "Grizzly Bears");
    const theirs = spawn(game, "Grizzly Bears", B);
    lands(game, "Plains", 4);
    cast(game, toHand(game, "Elspeth's Talent"), { targets: [ref(jace)] });
    loyalty(game, jace, 2);
    expect(pt(game, bears)).toEqual({ power: 4, toughness: 4 });
    expect(keywords(game, bears).has("vigilance")).toBe(true);
    expect(pt(game, theirs)).toEqual({ power: 2, toughness: 2 });
    nextTurn(game);
    expect(pt(game, bears)).toEqual({ power: 2, toughness: 2 });
  });

  it("the granted +1 makes three Soldiers, which arrive after the trigger and aren't pumped (the ruling)", () => {
    const { game } = table();
    const jace = spawn(game, "Jace Beleren");
    game.state.objects[jace].counters.loyalty = 3;
    const bears = spawn(game, "Grizzly Bears");
    lands(game, "Plains", 4);
    cast(game, toHand(game, "Elspeth's Talent"), { targets: [ref(jace)] });
    activate(game, jace, 3); // after Jace's three printed
    expect(game.state.objects[jace].counters.loyalty).toBe(4);
    expect(tokensNamed(game, "Soldier Token")).toBe(3);
    expect(pt(game, bears)).toEqual({ power: 4, toughness: 4 });
    const soldier = game.state.zones.shared.battlefield.find((id) => game.state.objects[id].cardName === "Soldier Token")!;
    expect(pt(game, soldier)).toEqual({ power: 1, toughness: 1 });
  });

  it("on an opponent's planeswalker, their activations pump nobody", () => {
    const { game } = table();
    const jace = spawn(game, "Jace Beleren", B);
    game.state.objects[jace].counters.loyalty = 3;
    lands(game, "Plains", 4);
    cast(game, toHand(game, "Elspeth's Talent"), { targets: [ref(jace)] });
    nextTurn(game);
    const mine = spawn(game, "Grizzly Bears");
    const theirs = spawn(game, "Grizzly Bears", B);
    loyalty(game, jace, 2, { player: B });
    expect(pt(game, mine)).toEqual({ power: 2, toughness: 2 });
    expect(pt(game, theirs)).toEqual({ power: 2, toughness: 2 });
  });
});
