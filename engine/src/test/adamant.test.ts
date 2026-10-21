/**
 * Adamant (Throne of Eldraine): "if at least three [color] mana was spent to
 * cast this spell" — the `manaSpentOfColors` filter clause over
 * `GameObject.manaSpentByColor`, read through a `source` condition.
 */
import { describe, expect, it } from "vitest";

import { cast, keywords, lands, spawn, table, toHand } from "./harness.js";

describe("adamant", () => {
  it("three white mana spent: Silverflame Ritual's creatures gain vigilance", () => {
    const { game } = table();
    const bears = spawn(game, "Grizzly Bears");
    lands(game, "Plains", 4);
    cast(game, toHand(game, "Silverflame Ritual"));
    expect(game.state.objects[bears].counters["+1/+1"]).toBe(1);
    expect(keywords(game, bears).has("vigilance")).toBe(true);
  });

  it("two white and two other: counters only", () => {
    const { game } = table();
    const bears = spawn(game, "Grizzly Bears");
    lands(game, "Plains", 2);
    lands(game, "Wastes", 2);
    cast(game, toHand(game, "Silverflame Ritual"));
    expect(game.state.objects[bears].counters["+1/+1"]).toBe(1);
    expect(keywords(game, bears).has("vigilance")).toBe(false);
  });

  it("a Paladin enters with a counter only when three of its colour paid for it", () => {
    const { game } = table();
    lands(game, "Mountain", 4);
    const rich = toHand(game, "Embereth Paladin");
    cast(game, rich);
    expect(game.state.objects[rich].counters["+1/+1"]).toBe(1);
    lands(game, "Mountain", 2);
    lands(game, "Wastes", 2);
    const poor = toHand(game, "Embereth Paladin");
    cast(game, poor);
    expect(game.state.objects[poor].counters["+1/+1"] ?? 0).toBe(0);
  });

  it("Henge Walker: three of any one colour", () => {
    const { game } = table();
    lands(game, "Swamp", 3);
    const walker = toHand(game, "Henge Walker");
    cast(game, walker);
    expect(game.state.objects[walker].counters["+1/+1"]).toBe(1);
    lands(game, "Swamp", 1);
    lands(game, "Island", 1);
    lands(game, "Wastes", 1);
    const other = toHand(game, "Henge Walker");
    cast(game, other);
    expect(game.state.objects[other].counters["+1/+1"] ?? 0).toBe(0);
  });
});
