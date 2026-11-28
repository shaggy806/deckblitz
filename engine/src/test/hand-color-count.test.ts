/**
 * Scrying Glass: a number and a colour chosen as it resolves, the target
 * opponent's hand revealed, and the revealed cards of that colour counted
 * against the number (`{ thisWay: "revealed", filter: { colors: [CHOSEN_COLOR] } }`).
 */
import { describe, expect, it } from "vitest";

import type { ScriptedController } from "../controller.js";
import type { Game } from "../game.js";
import { activate, B, hand, lands, ref, spawn, table, toHand } from "./harness.js";

function glass(game: Game, a: ScriptedController, number: number, color: string): { drew: boolean; askedMin: number } {
  const glassId = spawn(game, "Scrying Glass");
  lands(game, "Plains", 3);
  let askedMin = -1;
  a.chooseNumberFn = (_view, offer) => {
    askedMin = offer.min;
    return number;
  };
  a.chooseCreatureTypeFn = () => color;
  const before = hand(game).length;
  activate(game, glassId, 0, { targets: [ref(B)] });
  return { drew: hand(game).length === before + 1, askedMin };
}

describe("Scrying Glass", () => {
  it("draws when exactly that many cards of the colour are revealed, multicoloured ones counting", () => {
    const { game, a } = table();
    toHand(game, "Lightning Bolt", B);
    toHand(game, "Lightning Helix", B);
    toHand(game, "Grizzly Bears", B);
    const result = glass(game, a, 2, "R");
    expect(result.askedMin).toBe(1);
    expect(result.drew).toBe(true);
  });

  it("draws nothing for more or fewer", () => {
    const { game, a } = table();
    toHand(game, "Lightning Bolt", B);
    toHand(game, "Lightning Helix", B);
    expect(glass(game, a, 1, "R").drew).toBe(false);
    const { game: g2, a: a2 } = table();
    toHand(g2, "Lightning Bolt", B);
    expect(glass(g2, a2, 2, "R").drew).toBe(false);
  });

  it("draws nothing for a colour with none in hand", () => {
    const { game, a } = table();
    toHand(game, "Lightning Bolt", B);
    expect(glass(game, a, 1, "G").drew).toBe(false);
  });
});
