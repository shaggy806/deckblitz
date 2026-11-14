/**
 * "For each spell and ability your opponents control, counter it unless its
 * controller pays {4}" (Whirlwind Denial): `for-each-unless` over the stack
 * (`of: { stack }`), each declined one countered with the others once the
 * last has answered (`counter`'s `atRelease` — the card's ruling).
 */
import { describe, expect, it } from "vitest";

import { invalidateComputedCache } from "../characteristics.js";
import type { Game } from "../game.js";
import type { ObjectId } from "../primitives.js";
import { A, B, activate, cast, lands, life, ref, settle, spawn, table, toHand, zone } from "./harness.js";

const question = (game: Game) => {
  game.advanceUntil((s) => s.awaiting !== null);
  return game.state.awaiting;
};

const answer = (game: Game, pay: boolean): void => {
  const awaiting = game.state.awaiting;
  if (awaiting?.kind !== "choose-modes") throw new Error(`expected a question, got ${awaiting?.kind}`);
  game.dispatch({ type: "choose-modes", player: awaiting.player, modes: pay ? [0] : [] });
};

/** Alice's Shock at Bob, then Bob's spells at Alice, then her Denial. */
function setUp(bobs: readonly string[]): { game: Game; shock: ObjectId; theirs: ObjectId[] } {
  const { game } = table();
  lands(game, "Mountain", 1);
  lands(game, "Island", 3);
  lands(game, "Mountain", 6, B);
  const shock = toHand(game, "Shock");
  cast(game, shock, { settle: false, targets: [ref(B)] });
  game.dispatch({ type: "pass-priority", player: A });
  const theirs = bobs.map((name) => {
    const card = toHand(game, name, B);
    cast(game, card, { player: B, settle: false, targets: [ref(A)] });
    return card;
  });
  game.dispatch({ type: "pass-priority", player: B });
  cast(game, toHand(game, "Whirlwind Denial"), { settle: false });
  return { game, shock, theirs };
}

describe("Whirlwind Denial", () => {
  it("counters an opponent's spell they don't pay for, and never asks about yours", () => {
    const { game, shock, theirs } = setUp(["Lightning Bolt"]);
    const asked = question(game);
    expect(asked?.player).toBe(B);
    answer(game, false);
    settle(game);
    expect(zone(game, theirs[0])).toBe("graveyard");
    expect(life(game, A)).toBe(20);
    // Alice's own Shock resolved.
    expect(zone(game, shock)).toBe("graveyard");
    expect(life(game, B)).toBe(18);
  });

  it("paying {4} keeps it; the declined ones go together once the last has answered", () => {
    const { game, theirs } = setUp(["Lightning Bolt", "Shock"]);
    const [bolt, bobShock] = theirs;
    question(game);
    answer(game, false);
    // Nothing countered before the last answer (the ruling).
    expect(zone(game, bolt)).toBe("stack");
    question(game);
    answer(game, true);
    settle(game);
    expect(zone(game, bolt)).toBe("graveyard");
    expect(zone(game, bobShock)).toBe("graveyard");
    // Only the Shock he paid for hit.
    expect(life(game, A)).toBe(18);
  });

  it("an object standing for two identical abilities is two: paid for one, the other countered", () => {
    const { game } = table();
    lands(game, "Island", 3);
    // Enough for both, so each is asked about.
    lands(game, "Mountain", 8, B);
    const sorcerer = spawn(game, "Prodigal Sorcerer", B);
    // Alice holds priority on a spell of her own, so Bob can respond.
    const shock = toHand(game, "Shock");
    lands(game, "Mountain", 1);
    cast(game, shock, { settle: false, targets: [ref(B)] });
    game.dispatch({ type: "pass-priority", player: A });
    activate(game, sorcerer, 0, { player: B, targets: [ref(A)], settle: false });
    const ping = game.state.zones.shared.stack.at(-1)!;
    // Two identical abilities on the stack as one object (`PendingTrigger.copies`).
    game.state.objects[ping].stackCount = 2;
    invalidateComputedCache();
    game.dispatch({ type: "pass-priority", player: B });
    cast(game, toHand(game, "Whirlwind Denial"), { settle: false });
    question(game);
    answer(game, true);
    question(game);
    answer(game, false);
    settle(game);
    // One ping resolved, the other countered.
    expect(life(game, A)).toBe(19);
    expect(life(game, B)).toBe(18);
  });
});
