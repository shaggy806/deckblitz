// Mana that gives what it's spent on something: Arena of Glory's "If any of that
// mana is spent on a creature spell, it gains haste until end of turn" (rule
// 106.6, `add-mana`'s `spellGains` on each unit made), and Jade Orb of Dragonkind's
// triggered "When you spend this mana to cast a Dragon creature spell, it enters
// with an additional +1/+1 counter on it and gains hexproof until your next turn"
// (`whenSpent`, on the spell and so on the permanent it becomes).

import { describe, expect, it } from "vitest";

import { poolCounts } from "../mana.js";
import type { Game } from "../game.js";
import type { ObjectId } from "../primitives.js";
import { A, activate, cast, counters, enter, keywords, lands, ref, settle, spawn, table, toHand, zone, B } from "./harness.js";

/** Alice with an untapped Arena and a Mountain, the Arena's second ability
 * activated by hand: {R}{R} floating, the Mountain's {R} paid for it. */
function exerted(): { game: Game; arena: ObjectId } {
  const { game } = table();
  const [mountain] = lands(game, "Mountain", 1);
  const arena = spawn(game, "Arena of Glory");
  activate(game, arena, 1);
  expect(game.state.objects[mountain].tapped).toBe(true);
  expect(poolCounts(game.state.players[A].manaPool)).toMatchObject({ R: 2 });
  return { game, arena };
}

describe("Arena of Glory", () => {
  it("enters tapped with no Mountain, untapped beside one", () => {
    const { game } = table();
    const tapped = enter(game, "Arena of Glory");
    expect(game.state.objects[tapped].tapped).toBe(true);
    lands(game, "Mountain", 1);
    const untapped = enter(game, "Arena of Glory");
    expect(game.state.objects[untapped].tapped).toBe(false);
  });

  it("taps for {R} on its own", () => {
    const { game } = table();
    lands(game, "Mountain", 1);
    const arena = spawn(game, "Arena of Glory");
    activate(game, arena, 0);
    expect(poolCounts(game.state.players[A].manaPool)).toMatchObject({ R: 1 });
    expect(game.state.objects[arena].tapped).toBe(true);
  });

  it("needs {R} for its second ability, and exerts: it stays tapped through the next untap step", () => {
    const { game, arena } = exerted();
    expect(game.state.objects[arena].tapped).toBe(true);
    game.advanceUntil((s) => s.turn.number === 3 && s.turn.step === "upkeep");
    expect(game.state.objects[arena].tapped).toBe(true);
    game.advanceUntil((s) => s.turn.number === 5 && s.turn.step === "upkeep");
    expect(game.state.objects[arena].tapped).toBe(false);

    const none = table().game;
    const alone = spawn(none, "Arena of Glory");
    expect(() => activate(none, alone, 1)).toThrow();
  });

  it("gives a creature spell haste until end of turn, and the creature it becomes", () => {
    const { game } = exerted();
    const piker = toHand(game, "Goblin Piker");
    cast(game, piker);
    expect(zone(game, piker)).toBe("battlefield");
    expect(keywords(game, piker).has("haste")).toBe(true);
    game.advanceUntil((s) => s.turn.number === 2 && s.turn.step === "upkeep");
    expect(keywords(game, piker).has("haste")).toBe(false);
  });

  it("spent on two creature spells, each gains haste (the ruling)", () => {
    const { game } = exerted();
    const first = toHand(game, "Mons's Goblin Raiders");
    const second = toHand(game, "Mons's Goblin Raiders");
    cast(game, first);
    expect(keywords(game, first).has("haste")).toBe(true);
    cast(game, second);
    expect(keywords(game, second).has("haste")).toBe(true);
  });

  it("any of that mana will do: one unit toward a creature spell's cost is enough", () => {
    const { game } = exerted();
    // One {R} goes on Shock; what's left pays part of the Piker's cost.
    const shock = toHand(game, "Shock");
    cast(game, shock, { targets: [ref(B)] });
    lands(game, "Wastes", 1);
    const piker = toHand(game, "Goblin Piker");
    cast(game, piker);
    expect(keywords(game, piker).has("haste")).toBe(true);
  });

  it("gives a noncreature spell nothing, and it can still be spent on one (the rulings)", () => {
    const { game } = exerted();
    const shock = toHand(game, "Shock");
    cast(game, shock, { targets: [ref(B)] });
    expect(game.state.players[B].life).toBe(18);
    expect(poolCounts(game.state.players[A].manaPool)).toMatchObject({ R: 1 });
  });

  it("its {T}: Add {R} gives nothing", () => {
    const { game } = table();
    lands(game, "Mountain", 1);
    const arena = spawn(game, "Arena of Glory");
    activate(game, arena, 0);
    const piker = toHand(game, "Goblin Piker");
    cast(game, piker);
    expect(keywords(game, piker).has("haste")).toBe(false);
  });
});

describe("Jade Orb of Dragonkind", () => {
  it("on a Dragon creature spell: a counter and hexproof, until its controller's next turn", () => {
    const { game } = table();
    const orb = spawn(game, "Jade Orb of Dragonkind");
    lands(game, "Mountain", 2);
    activate(game, orb, 0);
    const whelp = toHand(game, "Firespitter Whelp");
    cast(game, whelp);
    settle(game);
    expect(zone(game, whelp)).toBe("battlefield");
    expect(counters(game, whelp)).toBe(1);
    expect(keywords(game, whelp).has("hexproof")).toBe(true);
    // Through bob's turn and the end of alice's…
    game.advanceUntil((s) => s.turn.number === 2 && s.turn.step === "precombat-main");
    expect(keywords(game, whelp).has("hexproof")).toBe(true);
    // …and gone as her next turn begins.
    game.advanceUntil((s) => s.turn.number === 3 && s.turn.step === "upkeep");
    expect(keywords(game, whelp).has("hexproof")).toBe(false);
    expect(counters(game, whelp)).toBe(1);
  });

  it("on anything else: nothing", () => {
    const { game } = table();
    const orb = spawn(game, "Jade Orb of Dragonkind");
    lands(game, "Mountain", 1);
    activate(game, orb, 0);
    const bears = toHand(game, "Grizzly Bears");
    cast(game, bears);
    settle(game);
    expect(counters(game, bears)).toBe(0);
    expect(keywords(game, bears).has("hexproof")).toBe(false);
  });
});
