/**
 * A prevention's additional effect (rule 615.5) only for some sources: "If
 * damage from a red source is prevented this way, Honorable Passage deals
 * that much damage to the source's controller" — a `conditional` on the
 * damage's source (`trigger-object`) inside the shield's `then`.
 */
import { describe, expect, it } from "vitest";

import type { Game } from "../game.js";
import type { ObjectId } from "../primitives.js";
import type { TargetRef } from "../target.js";
import { A, B, cast, lands, life, pickPermanents, ref, spawn, table, toHand } from "./harness.js";

/** `source` deals `amount` damage to `to`. */
const hit = (game: Game, source: ObjectId, to: TargetRef, amount = 2): void => {
  game.debugApplyEffect(game.state.objects[source].controller, { kind: "damage", amount, target: 0 }, [to], { source });
};

describe("Honorable Passage", () => {
  it("prevents a red source's next damage to the target and deals that much to its controller", () => {
    const { game, a } = table();
    lands(game, "Plains", 2);
    const bears = spawn(game, "Grizzly Bears", A);
    const goblin = spawn(game, "Raging Goblin", B);
    pickPermanents(a, goblin);
    cast(game, toHand(game, "Honorable Passage"), { targets: [ref(bears)] });
    hit(game, goblin, ref(bears), 3);
    expect(game.state.objects[bears].damageMarked).toBe(0);
    expect(life(game, B)).toBe(17);
    // Only the next time.
    hit(game, goblin, ref(bears), 1);
    expect(game.state.objects[bears].damageMarked).toBe(1);
    expect(life(game, B)).toBe(17);
  });

  it("prevents a green source's damage to a player and deals none back", () => {
    const { game, a } = table();
    lands(game, "Plains", 2);
    const theirBears = spawn(game, "Grizzly Bears", B);
    pickPermanents(a, theirBears);
    cast(game, toHand(game, "Honorable Passage"), { targets: [ref(A)] });
    hit(game, theirBears, ref(A), 2);
    expect(life(game, A)).toBe(20);
    expect(life(game, B)).toBe(20);
  });

  it("a red source's damage to something else isn't prevented", () => {
    const { game, a } = table();
    lands(game, "Plains", 2);
    const bears = spawn(game, "Grizzly Bears", A);
    const goblin = spawn(game, "Raging Goblin", B);
    pickPermanents(a, goblin);
    cast(game, toHand(game, "Honorable Passage"), { targets: [ref(bears)] });
    hit(game, goblin, ref(A), 2);
    expect(life(game, A)).toBe(18);
    expect(life(game, B)).toBe(20);
  });
});
