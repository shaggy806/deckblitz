/**
 * "A source of your choice" (rule 609.7) whose shield goes on what the
 * ability's source was attached to (`prevent-damage-from-chosen-source`'s
 * `to: "attached"`), read as the Aura last existed once it's sacrificed for
 * the cost (rule 608.2h). Kithkin Armor.
 */
import { describe, expect, it } from "vitest";

import { invalidateComputedCache } from "../characteristics.js";
import type { Game } from "../game.js";
import type { ObjectId } from "../primitives.js";
import { B, activate, blockOffer, pickPermanents, ref, spawn, table } from "./harness.js";

const hit = (game: Game, source: ObjectId, to: ObjectId, amount = 2): void => {
  game.debugApplyEffect(game.state.objects[source].controller, { kind: "damage", amount, target: 0 }, [ref(to)], { source });
};
const marked = (game: Game, id: ObjectId): number => game.state.objects[id].damageMarked;

function armored(game: Game): { armor: ObjectId; bear: ObjectId } {
  const bear = spawn(game, "Grizzly Bears");
  const armor = spawn(game, "Kithkin Armor");
  game.state.objects[armor].attachedTo = bear;
  invalidateComputedCache();
  return { armor, bear };
}

describe("Kithkin Armor", () => {
  it("sacrificed, prevents the next damage the chosen source deals the creature it enchanted", () => {
    const { game, a } = table();
    const { armor, bear } = armored(game);
    const goblin = spawn(game, "Raging Goblin", B);
    const other = spawn(game, "Raging Goblin", B);
    const seen = pickPermanents(a, goblin);
    activate(game, armor, 0);
    expect(game.state.objects[armor].zone).toBe("graveyard");
    expect(seen.offered).toContain(goblin);
    // Another source's damage isn't prevented.
    hit(game, other, bear, 1);
    expect(marked(game, bear)).toBe(1);
    // The chosen source's next damage is; the time after, it isn't.
    hit(game, goblin, bear, 1);
    expect(marked(game, bear)).toBe(1);
    hit(game, goblin, bear, 1);
    expect(marked(game, bear)).toBe(2);
  });
  it("enchanted creature can't be blocked by creatures with power 3 or greater", () => {
    const { game, a } = table();
    const { bear } = armored(game);
    game.state.objects[bear].summoningSick = false;
    const big = spawn(game, "Hill Giant", B);
    const small = spawn(game, "Grizzly Bears", B);
    const offer = blockOffer(game, a, [bear]);
    const canBlock = (blocker: ObjectId) => offer.eligible.find((e) => e.blocker === blocker)?.canBlock ?? [];
    expect(canBlock(big)).toEqual([]);
    expect(canBlock(small)).toEqual([bear]);
  });
});
