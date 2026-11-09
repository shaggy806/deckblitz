/**
 * A split card has both names (rule 709.4a), and two objects have the same
 * name if they have one in common (201.2a): "with the same name as that card",
 * of Wear // Tear, matches a card named Tear as well as one named Wear.
 */

import { describe, expect, it } from "vitest";

import { defineCard } from "../cards/define.js";
import { createDefaultRegistry } from "../cards/registry.js";
import type { Game } from "../game.js";
import type { ObjectId } from "../primitives.js";
import { A, cast, lands, ref, settle, table, toGraveyard, toHand } from "./harness.js";

const TEXT = "You gain 1 life for each card in your graveyard with the same name as target card in your graveyard.";
const counter = defineCard({
  name: "Test Name Counter",
  manaCost: "{1}",
  types: ["sorcery"],
  text: TEXT,
  targets: [{ kind: "card-in-graveyard", whose: "you" }],
  effect: { kind: "gain-life", amount: { countInGraveyard: { sameNameWith: 0 } } },
});

function namesakes(game: Game, target: ObjectId): number {
  lands(game, "Wastes", 1);
  const before = game.state.players[A].life;
  cast(game, toHand(game, "Test Name Counter"), { targets: [ref(target)] });
  settle(game);
  return game.state.players[A].life - before;
}

describe("a split card's two names", () => {
  it("target the split card: a card with either of its names matches", () => {
    const { game } = table({ registry: createDefaultRegistry().register(counter) });
    const split = toGraveyard(game, "Wear // Tear");
    toGraveyard(game, "Wear");
    toGraveyard(game, "Tear");
    toGraveyard(game, "Fire // Ice");
    expect(namesakes(game, split)).toBe(3);
  });

  it("target a card with one of its names: the split card matches", () => {
    const { game } = table({ registry: createDefaultRegistry().register(counter) });
    toGraveyard(game, "Wear // Tear");
    const tear = toGraveyard(game, "Tear");
    toGraveyard(game, "Fire // Ice");
    expect(namesakes(game, tear)).toBe(2);
  });
});
