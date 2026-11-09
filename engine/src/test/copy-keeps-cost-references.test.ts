/**
 * A copy of a spell copies the choices made for it, additional costs
 * included (rule 707.10): a copy of Fling deals the sacrificed creature's
 * power, a copy of Induce Despair reads the revealed card, and a copy of a
 * discard-cost spell reads the discarded card.
 */

import { describe, expect, it } from "vitest";

import { defineCard } from "../cards/define.js";
import { createDefaultRegistry } from "../cards/registry.js";
import type { Game } from "../game.js";
import type { ObjectId } from "../primitives.js";
import { A, B, cast, lands, ref, settle, spawn, table, toHand } from "./harness.js";

const discardBolt = defineCard({
  name: "Test Discard Bolt",
  manaCost: "{R}",
  types: ["instant"],
  text: "As an additional cost to cast this spell, discard a card.\nThis spell deals damage equal to the discarded card's mana value to any target.",
  additionalCost: { discard: 1 },
  targets: ["any-target"],
  effect: { kind: "damage", target: 0, amount: { manaValueOf: { paid: "discarded" } } },
});

/** Twincast the spell on top of the stack, until the copy is made. */
function twincast(game: Game, spell: ObjectId): void {
  cast(game, toHand(game, "Twincast"), { targets: [ref(spell)], settle: false });
  game.advanceUntil(
    (s) => s.awaiting === null && s.priority.holder === A && s.zones.shared.stack.some((id) => s.objects[id].isCopy === true),
  );
}

const lifeOf = (game: Game, who: typeof A): number => game.state.players[who].life;

describe("a copy keeps its spell's cost references", () => {
  it("a copy of Fling deals the sacrificed creature's power", () => {
    const { game } = table();
    lands(game, "Mountain", 8);
    lands(game, "Island", 8);
    const giant = spawn(game, "Hill Giant");
    const fling = toHand(game, "Fling");
    cast(game, fling, { targets: [ref(B)], sacrifice: giant, settle: false });
    twincast(game, fling);
    settle(game);
    expect(lifeOf(game, B)).toBe(20 - 3 - 3);
  });

  it("a copy of Induce Despair reads the revealed card", () => {
    const { game } = table();
    lands(game, "Swamp", 8);
    lands(game, "Island", 8);
    toHand(game, "Shivan Dragon");
    const wurm = spawn(game, "Craw Wurm", B);
    const despair = toHand(game, "Induce Despair");
    cast(game, despair, { targets: [ref(wurm)], settle: false });
    twincast(game, despair);
    // Only the copy's -6/-6 so far: the original still waits on the stack.
    game.advanceUntil((s) => s.zones.shared.stack.length === 1 && s.priority.holder === A);
    expect(game.state.objects[wurm].zone).toBe("graveyard");
  });

  it("a copy of a discard-cost spell reads the discarded card", () => {
    const { game, a } = table({ registry: createDefaultRegistry().register(discardBolt) });
    lands(game, "Mountain", 8);
    lands(game, "Island", 8);
    const dragon = toHand(game, "Shivan Dragon");
    a.chooseDiscardsFn = () => [dragon];
    const bolt = toHand(game, "Test Discard Bolt");
    cast(game, bolt, { targets: [ref(B)], settle: false });
    game.advanceUntil((s) => s.awaiting === null && s.zones.shared.stack.includes(bolt));
    twincast(game, bolt);
    settle(game);
    expect(lifeOf(game, B)).toBe(20 - 6 - 6);
  });
});
