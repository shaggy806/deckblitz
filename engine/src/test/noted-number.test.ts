/**
 * A number a permanent notes (Sigarda's Splendor): "As this enchantment
 * enters, note your life total" is part of its entering (rule 614.1c — an
 * `enters-battlefield` replacement's `notes`), "Then note your life total" is
 * the `note` effect, and "the last noted life total" reads it back as
 * `{ chosenNumber: true }`.
 */
import { describe, expect, it } from "vitest";
import { A, cast, lands, settle, spawn, table, toHand, toStep } from "./harness.js";
import type { Game } from "../game.js";
import type { ObjectId } from "../primitives.js";

const noted = (game: Game, id: ObjectId): string | null | undefined => game.state.objects[id].chosenOnEnter;
const hand = (game: Game): number => game.state.zones.perPlayer[A].hand.length;
const life = (game: Game): number => game.state.players[A].life;

function castSplendor(game: Game): ObjectId {
  lands(game, "Plains", 4);
  const card = toHand(game, "Sigarda's Splendor");
  cast(game, card);
  return card;
}

/** Alice's next upkeep with the trigger resolved: how many cards it drew. */
function upkeepDraws(game: Game): number {
  toStep(game, "upkeep");
  const before = hand(game);
  settle(game);
  expect(game.state.turn.step).toBe("upkeep");
  return hand(game) - before;
}

describe("Sigarda's Splendor", () => {
  it("notes its controller's life total as it enters, with no trigger", () => {
    const { game } = table({ life: 23 });
    lands(game, "Plains", 4);
    const card = toHand(game, "Sigarda's Splendor");
    cast(game, card, { settle: false });
    // It resolves, and the number is there with nothing else on the stack.
    game.dispatch({ type: "pass-priority", player: game.state.priority.holder! });
    game.dispatch({ type: "pass-priority", player: game.state.priority.holder! });
    expect(game.state.objects[card].zone).toBe("battlefield");
    expect(game.state.zones.shared.stack).toHaveLength(0);
    expect(noted(game, card)).toBe("23");
  });

  it("draws at upkeep only with at least the last noted life total, then notes it again", () => {
    const { game } = table();
    const card = castSplendor(game);
    expect(noted(game, card)).toBe("20");
    // Below the noted total: no card, and the lower total is noted all the
    // same (the ruling: noted even if no card is drawn).
    game.debugApplyEffect(A, { kind: "lose-life", who: "you", amount: 3 });
    expect(upkeepDraws(game)).toBe(0);
    expect(noted(game, card)).toBe("17");
    // Equal to it: "greater than or equal to".
    expect(upkeepDraws(game)).toBe(1);
    expect(noted(game, card)).toBe("17");
    // Above the last noted total, which is now 17 and not the first 20.
    game.debugApplyEffect(A, { kind: "gain-life", amount: 1 });
    expect(upkeepDraws(game)).toBe(1);
    expect(noted(game, card)).toBe("18");
    game.debugApplyEffect(A, { kind: "lose-life", who: "you", amount: 1 });
    expect(upkeepDraws(game)).toBe(0);
  });

  it("notes afresh as a new object when it comes back", () => {
    const { game } = table();
    const card = castSplendor(game);
    game.debugApplyEffect(A, { kind: "lose-life", who: "you", amount: 5 });
    game.debugApplyEffect(A, { kind: "flicker", target: 0 }, [{ kind: "object", object: card }]);
    settle(game);
    expect(game.state.objects[card].zone).toBe("battlefield");
    expect(noted(game, card)).toBe("15");
  });

  it("gains 1 life whenever its controller casts a white spell, and not for another colour", () => {
    const { game } = table();
    spawn(game, "Sigarda's Splendor");
    lands(game, "Plains", 2);
    lands(game, "Forest", 2);
    cast(game, toHand(game, "Savannah Lions"));
    expect(life(game)).toBe(21);
    cast(game, toHand(game, "Grizzly Bears"));
    expect(life(game)).toBe(21);
  });
});
