/**
 * A copy of a spell is a spell with the copied targets (rule 707.10), so a
 * spell filter's `targets` clause reads it as it reads a cast one: Dawn
 * Charm's "counter target spell that targets you" can be aimed at a copy.
 */

import { describe, expect, it } from "vitest";

import type { Game } from "../game.js";
import type { ObjectId, PlayerId } from "../primitives.js";
import { A, B, cast, lands, ref, table, toHand } from "./harness.js";

/** A Lightning Bolt aimed at `at`, and Twincast's copy of it, on the stack,
 * priority alice's. Returns the copy. */
function copyOfBolt(game: Game, at: PlayerId): ObjectId {
  lands(game, "Mountain", 10);
  lands(game, "Island", 10);
  lands(game, "Plains", 10);
  const bolt = toHand(game, "Lightning Bolt");
  cast(game, bolt, { targets: [ref(at)], settle: false });
  cast(game, toHand(game, "Twincast"), { targets: [ref(bolt)], settle: false });
  game.advanceUntil(
    (s) => s.awaiting === null && s.priority.holder === A && s.zones.shared.stack.some((id) => s.objects[id].isCopy === true),
  );
  const copy = game.state.zones.shared.stack.find((id) => game.state.objects[id].isCopy === true);
  if (copy === undefined) throw new Error("no copy on the stack");
  return copy;
}

describe("a spell filter's targets and a copy of a spell", () => {
  it("Dawn Charm can counter a copy that targets you", () => {
    const { game } = table();
    const copy = copyOfBolt(game, A);
    expect(game.state.objects[copy].targets).toEqual([ref(A)]);
    cast(game, toHand(game, "Dawn Charm"), { targets: [ref(copy)], modes: [2], settle: false });
    game.advanceUntil((s) => !s.zones.shared.stack.includes(copy));
    expect(game.state.objects[copy]?.zone ?? "gone").not.toBe("stack");
  });

  it("Dawn Charm can't aim at a copy that targets someone else", () => {
    const { game } = table();
    const copy = copyOfBolt(game, B);
    expect(() => cast(game, toHand(game, "Dawn Charm"), { targets: [ref(copy)], modes: [2], settle: false })).toThrow(/refused/);
  });
});
