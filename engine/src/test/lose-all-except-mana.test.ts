/**
 * `StaticAbility.exceptManaAbilities` beside `loseAllAbilities` — Blood Sun's
 * "All lands lose all abilities except mana abilities" (layer 6, rule
 * 613.1f): each land keeps its mana abilities (rule 605.1a), printed or
 * granted, and loses every other one, its "enters tapped" too (614.12).
 */
import { describe, expect, it } from "vitest";

import { hasAnyAbility, hasManaAbility } from "../characteristics.js";
import { A, B, enter, hand, lands, registryOf, settle, spawn, table, toHand } from "./harness.js";
import type { Game } from "../game.js";
import type { ObjectId } from "../primitives.js";

/** The texts of the abilities `id`'s controller (alice) may activate now. */
const activatable = (game: Game, id: ObjectId): string[] => [
  ...new Set(
    game
      .legalActions(A)
      .flatMap((action) =>
        action.kind === "activate-ability" && action.source === id ? [action.text.replace(/ \(add \{.\}\)$/, "")] : [],
      ),
  ),
];

describe("Blood Sun", () => {
  it("draws a card as it enters", () => {
    const { game } = table();
    const before = hand(game).length;
    enter(game, "Blood Sun", A);
    expect(hand(game).length).toBe(before + 1);
  });

  it("a land keeps its mana abilities and loses the rest", () => {
    const { game } = table();
    const vault = spawn(game, "Mutavault", A);
    const strip = spawn(game, "Strip Mine", A);
    expect(activatable(game, vault)).toHaveLength(2);
    expect(activatable(game, strip)).toHaveLength(2);
    spawn(game, "Blood Sun", B);
    expect(activatable(game, vault)).toEqual(["{T}: Add {C}."]);
    expect(activatable(game, strip)).toEqual(["{T}: Add {C}."]);
    expect(hasManaAbility(game.state, registryOf(game), game.state.objects[strip])).toBe(true);
    expect(hasAnyAbility(game.state, registryOf(game), game.state.objects[strip])).toBe(true);
  });

  it("a basic land still taps for its colour, and pays for a spell", () => {
    const { game } = table();
    spawn(game, "Blood Sun", B);
    const [mountain] = lands(game, "Mountain", 1);
    expect(activatable(game, mountain)).toEqual(["{T}: Add {R}."]);
    const bolt = toHand(game, "Lightning Bolt");
    expect(game.legalActions(A).some((a) => a.kind === "cast-spell" && a.card === bolt)).toBe(true);
  });

  it("a mana ability granted before Blood Sun stays", () => {
    const { game } = table();
    const strip = spawn(game, "Strip Mine", A);
    spawn(game, "Chromatic Lantern", A);
    spawn(game, "Blood Sun", B);
    expect(activatable(game, strip)).toEqual(["{T}: Add {C}.", "{T}: Add one mana of any color."]);
  });

  it("a tapland played under it enters untapped", () => {
    const { game } = table();
    spawn(game, "Blood Sun", B);
    const gate = toHand(game, "Azorius Guildgate");
    game.dispatch({ type: "play-land", player: A, card: gate });
    settle(game);
    expect(game.state.objects[gate].tapped).toBe(false);
    expect(activatable(game, gate)).toEqual(["{T}: Add {W} or {U}."]);
  });

  it("a full loss beside it still takes the mana abilities (Toxicrene's grant stays)", () => {
    const { game } = table();
    const strip = spawn(game, "Strip Mine", A);
    spawn(game, "Blood Sun", B);
    spawn(game, "Toxicrene", B);
    expect(activatable(game, strip)).toEqual(["{T}: Add one mana of any color."]);
  });
});
