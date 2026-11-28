/**
 * The `{ untilSpellCast }` duration: "until a player casts a creature spell"
 * (Soul Sculptor) — an effect on a permanent that ends as any player's spell
 * matching the filter becomes cast (rule 601.2i), and not for another spell.
 */
import { describe, expect, it } from "vitest";

import { B, activate, cast, keywords, lands, ref, spawn, table, toHand, types } from "./harness.js";

const sculpted = () => {
  const t = table();
  const { game } = t;
  const sculptor = spawn(game, "Soul Sculptor");
  const angel = spawn(game, "Serra Angel", B);
  lands(game, "Plains", 2);
  activate(game, sculptor, 0, { targets: [ref(angel)] });
  return { ...t, angel };
};

describe("Soul Sculptor", () => {
  it("makes the creature an enchantment with no abilities", () => {
    const { game, angel } = sculpted();
    expect(types(game, angel)).toEqual(["enchantment"]);
    expect(keywords(game, angel).has("flying")).toBe(false);
  });

  it("a noncreature spell doesn't end it; your creature spell does", () => {
    const { game, angel } = sculpted();
    lands(game, "Mountain", 1);
    cast(game, toHand(game, "Lightning Bolt"), { targets: [ref(B)] });
    expect(types(game, angel)).toEqual(["enchantment"]);
    lands(game, "Forest", 2);
    cast(game, toHand(game, "Grizzly Bears"), { settle: false });
    expect(types(game, angel)).toContain("creature");
    expect(keywords(game, angel).has("flying")).toBe(true);
  });

  it("an opponent's creature spell ends it too", () => {
    const { game, angel } = sculpted();
    lands(game, "Forest", 2, B);
    const bears = toHand(game, "Grizzly Bears", B);
    game.advanceUntil((s) => s.turn.number === 2 && s.turn.step === "precombat-main" && s.priority.holder === B);
    expect(types(game, angel)).toEqual(["enchantment"]);
    cast(game, bears, { player: B, settle: false });
    expect(types(game, angel)).toContain("creature");
    expect(game.state.objects[angel].modifiers.some((m) => m.untilSpellCast !== undefined)).toBe(false);
  });
});
