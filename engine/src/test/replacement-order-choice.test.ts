/**
 * The `replacement-order` decision (rule 616.1): the affected player, or the
 * affected object's controller, chooses which of several replacement or
 * prevention effects applies first — asked only when the order can change
 * what happens, and left to the best order for them by a bot.
 */

import { describe, expect, it } from "vitest";

import type { ReplacementOrderOffer, ScriptedController } from "../controller.js";
import type { Game } from "../game.js";
import type { ObjectId, PlayerId } from "../primitives.js";
import { A, B, attack, cast, lands, ref, spawn, table, toHand } from "./harness.js";

/** Answers each question with the option whose name is `pick`, noting them. */
function answering(seat: ScriptedController, pick: string): ReplacementOrderOffer[] {
  const asked: ReplacementOrderOffer[] = [];
  seat.chooseReplacementOrderFn = (_view, offer) => {
    asked.push(offer);
    return Math.max(0, offer.options.findIndex((o) => o.name === pick));
  };
  return asked;
}

const bolt = (game: Game, target: PlayerId | ObjectId): void => {
  lands(game, "Mountain", 1);
  cast(game, toHand(game, "Lightning Bolt"), { targets: [ref(target)] });
};

/** Alice's Heal: the next 1 damage to `target` is prevented. */
const heal = (game: Game, target: PlayerId | ObjectId): void => {
  lands(game, "Plains", 1);
  cast(game, toHand(game, "Heal"), { targets: [ref(target)] });
};

describe("damage: the affected player chooses the order (616.1)", () => {
  it("the permanent's controller is asked, named by the cards, and can take the worse order", () => {
    const { game, b } = table();
    spawn(game, "Furnace of Rath", A);
    const dreadmaw = spawn(game, "Colossal Dreadmaw", B);
    heal(game, dreadmaw);
    const asked = answering(b, "Furnace of Rath");
    bolt(game, dreadmaw);
    expect(asked).toHaveLength(1);
    expect(asked[0].options.map((o) => o.name).sort()).toEqual(["Furnace of Rath", "Heal"]);
    // 3 doubled, less the shield's 1.
    expect(game.state.objects[dreadmaw].damageMarked).toBe(5);
    expect(game.state.replacementAnswers).toBeUndefined();
  });

  it("left alone, the answer is the best order for them", () => {
    const { game, b } = table();
    spawn(game, "Furnace of Rath", A);
    const dreadmaw = spawn(game, "Colossal Dreadmaw", B);
    heal(game, dreadmaw);
    const asked: ReplacementOrderOffer[] = [];
    b.chooseReplacementOrderFn = (_view, offer) => {
      asked.push(offer);
      return offer.best;
    };
    bolt(game, dreadmaw);
    expect(asked).toHaveLength(1);
    expect(asked[0].options[asked[0].best].name).toBe("Heal");
    expect(game.state.objects[dreadmaw].damageMarked).toBe(4);
  });

  it("no question when the order changes nothing that matters", () => {
    const { game, b } = table();
    spawn(game, "Furnace of Rath", A);
    spawn(game, "Furnace of Rath", A);
    const asked = answering(b, "Furnace of Rath");
    bolt(game, B);
    expect(asked).toHaveLength(0);
    expect(game.state.players[B].life).toBe(20 - 12);
  });

  it("combat damage asks before any is dealt, one question for the hits sharing its effects", () => {
    const { game, a, b } = table();
    spawn(game, "Furnace of Rath", A);
    const one = spawn(game, "Grizzly Bears", A, { sick: false });
    const two = spawn(game, "Grizzly Bears", A, { sick: false });
    heal(game, B);
    const asked = answering(b, "Furnace of Rath");
    attack(game, a, [one, two]);
    expect(asked).toHaveLength(1);
    // Furnace first on each: 4 and 4, the shield taking 1 of the first.
    expect(game.state.players[B].life).toBe(20 - 7);
  });
});
