/**
 * An activated ability's own cost increase (`ActivatedAbility.costIncrease`):
 * Loreseeker's Stone's "This ability costs {1} more to activate for each card
 * in your hand" — the cards counted as the cost is totalled, before the
 * ability draws (its ruling; rules 601.2f, 602.2b), and added before any
 * reduction.
 */
import { describe, expect, it } from "vitest";
import type { Game } from "../game.js";
import type { ObjectId } from "../primitives.js";
import { A, activate, hand, lands, spawn, table, toHand } from "./harness.js";

const can = (game: Game, stone: ObjectId): string | null =>
  game.canDispatch({ type: "activate-ability", player: A, source: stone, abilityIndex: 0, targets: [] });
const offered = (game: Game, stone: ObjectId): boolean =>
  game.legalActions(A).some((a) => a.kind === "activate-ability" && a.source === stone);

describe("Loreseeker's Stone", () => {
  it("costs {3} and {1} more for each card in hand, and draws three", () => {
    const { game } = table({ openingHandSize: 0 });
    // The turn's draw: one card in hand.
    expect(hand(game, A).length).toBe(1);
    const wastes = lands(game, "Wastes", 3);
    const stone = spawn(game, "Loreseeker's Stone", A);
    expect(can(game, stone)).not.toBeNull();
    expect(offered(game, stone)).toBe(false);
    wastes.push(...lands(game, "Wastes", 1));
    expect(offered(game, stone)).toBe(true);
    activate(game, stone, 0);
    expect(hand(game, A).length).toBe(4);
    expect(wastes.every((id) => game.state.objects[id].tapped)).toBe(true);
  });

  it("counts the cards in hand as it's activated, before it draws", () => {
    const { game } = table({ openingHandSize: 0 });
    const wastes = lands(game, "Wastes", 5);
    const stone = spawn(game, "Loreseeker's Stone", A);
    toHand(game, "Grizzly Bears");
    toHand(game, "Grizzly Bears");
    // Three cards in hand: {6}, and five lands can't pay it.
    expect(can(game, stone)).not.toBeNull();
    wastes.push(...lands(game, "Wastes", 1));
    expect(can(game, stone)).toBeNull();
    activate(game, stone, 0);
    expect(hand(game, A).length).toBe(6);
    expect(wastes.every((id) => game.state.objects[id].tapped)).toBe(true);
  });
});
