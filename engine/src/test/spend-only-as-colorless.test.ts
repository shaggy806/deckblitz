/**
 * Celestial Dawn: "you may spend white mana as though it were mana of any
 * color; you may spend other mana only as though it were colorless mana"
 * (`spendManaAs.othersOnlyAsColorless`, `mana-payment.ts`'s
 * `costAsOnlyColorless`, rules 118.14, 609.4b, 101.2), its lands made Plains
 * and its nonland cards made white wherever they are (gaps keys
 * `static:spend-mana-only-as-colorless`, `static:color-cards-outside-battlefield`).
 */
import { describe, expect, it } from "vitest";

import { A, B, cast, hand, lands, spawn, subtypes, table, toHand, zone } from "./harness.js";
import type { Game } from "../game.js";
import type { ObjectId } from "../primitives.js";

const colors = (game: Game, id: ObjectId): readonly string[] => [...game.characteristics(id).colors];
const clearHand = (game: Game): void => void game.state.zones.perPlayer[A].hand.splice(0);

describe("Celestial Dawn", () => {
  it("makes your lands Plains that tap for {W}, and leaves the others' alone", () => {
    const { game } = table();
    spawn(game, "Celestial Dawn");
    const [forest] = lands(game, "Forest", 1);
    const [theirs] = lands(game, "Forest", 1, B);
    expect(subtypes(game, forest)).toEqual(["Plains"]);
    expect(subtypes(game, theirs)).toEqual(["Forest"]);
    clearHand(game);
    // A Plains pays the white of a white spell.
    cast(game, toHand(game, "Savannah Lions"));
    expect(game.state.zones.shared.battlefield.some((id) => game.state.objects[id].cardName === "Savannah Lions")).toBe(true);
  });

  it("pays a green pip with white mana, never with green", () => {
    const { game } = table();
    spawn(game, "Celestial Dawn");
    lands(game, "Llanowar Elves", 2);
    clearHand(game);
    const bears = toHand(game, "Grizzly Bears");
    // Two Elves' {G}{G}: the green only as colourless, so {1}{G} can't be paid.
    expect(() => cast(game, bears)).toThrow(/pay/i);
    lands(game, "Forest", 1);
    // A Plains' {W} for the {G}, an Elf's {G} for the {1}.
    cast(game, bears);
    expect(zone(game, bears)).toBe("battlefield");
  });

  it("pays {C} with other mana as though it were colorless, but not with white", () => {
    const { game } = table();
    spawn(game, "Celestial Dawn");
    lands(game, "Forest", 4);
    clearHand(game);
    const seer = toHand(game, "Thought-Knot Seer");
    expect(() => cast(game, seer, { settle: false })).toThrow(/pay/i);
    lands(game, "Llanowar Elves", 1);
    cast(game, seer, { settle: false });
    expect(zone(game, seer)).toBe("stack");
  });

  it("outweighs a permission to spend mana as though it were any color (rule 101.2)", () => {
    const { game } = table();
    spawn(game, "Celestial Dawn");
    spawn(game, "Chromatic Orrery");
    lands(game, "Llanowar Elves", 2);
    clearHand(game);
    expect(() => cast(game, toHand(game, "Grizzly Bears"))).toThrow(/pay/i);
  });

  it("makes your nonland permanents, spells and nonland cards off the battlefield white", () => {
    const { game } = table();
    spawn(game, "Celestial Dawn");
    const elves = spawn(game, "Llanowar Elves");
    const theirs = spawn(game, "Llanowar Elves", B);
    expect(colors(game, elves)).toEqual(["W"]);
    expect(colors(game, theirs)).toEqual(["G"]);
    clearHand(game);
    const bolt = toHand(game, "Lightning Bolt");
    const land = toHand(game, "Forest");
    const theirBolt = toHand(game, "Lightning Bolt", B);
    expect(colors(game, bolt)).toEqual(["W"]);
    expect(colors(game, theirBolt)).toEqual(["R"]);
    // A land card off the battlefield isn't a Plains, nor white (the rulings).
    expect(subtypes(game, land)).toEqual(["Forest"]);
    expect(colors(game, land)).toEqual([]);
    expect(hand(game)).toContain(bolt);
  });
});
