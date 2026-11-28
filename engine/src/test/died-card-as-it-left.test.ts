/**
 * `putIntoGraveyardThisTurn.asItLeft`: a card in a graveyard that died this
 * turn, matched as it last existed on the battlefield (rule 603.10a) —
 * Krovikan Vampire's "if a creature dealt damage by this creature this turn
 * died, put that card onto the battlefield under your control".
 */
import { describe, expect, it } from "vitest";

import type { Game } from "../game.js";
import type { ObjectId } from "../primitives.js";
import { A, B, controller, named, nextTurn, ref, settle, spawn, table, toStep, zone } from "./harness.js";

/** The Vampire deals `amount` noncombat damage to `to`; with `lethal`, the
 * state-based actions then put it into its graveyard. */
function deal(game: Game, vampire: ObjectId, to: ObjectId, amount: number, lethal = true): void {
  game.debugApplyEffect(A, { kind: "damage", target: 0, amount }, [ref(to)], { source: vampire });
  if (lethal) game.advanceUntil((s) => s.objects[to].zone === "graveyard");
  settle(game);
}

function destroy(game: Game, id: ObjectId): void {
  game.debugApplyEffect(B, { kind: "destroy", target: 0 }, [ref(id)]);
  settle(game);
}

describe("Krovikan Vampire", () => {
  it("returns, at the end step, each creature it damaged that died this turn, however it died", () => {
    const { game } = table();
    const vampire = spawn(game, "Krovikan Vampire");
    const bears = spawn(game, "Grizzly Bears", B);
    const giant = spawn(game, "Hill Giant", B);
    const untouched = spawn(game, "Llanowar Elves", B);
    deal(game, vampire, bears, 2); // dies to the damage
    deal(game, vampire, giant, 1, false); // survives it, then is destroyed
    destroy(game, giant);
    destroy(game, untouched);
    expect(zone(game, bears)).toBe("graveyard");
    expect(zone(game, giant)).toBe("graveyard");
    toStep(game, "end");
    settle(game);
    expect(zone(game, bears)).toBe("battlefield");
    expect(controller(game, bears)).toBe(A);
    expect(zone(game, giant)).toBe("battlefield");
    expect(controller(game, giant)).toBe(A);
    expect(zone(game, untouched)).toBe("graveyard");
  });

  it("doesn't trigger with none: a card that left the graveyard and came back is a new object", () => {
    const { game } = table();
    const vampire = spawn(game, "Krovikan Vampire");
    const bears = spawn(game, "Grizzly Bears", B);
    deal(game, vampire, bears, 2);
    game.debugMove(bears, "exile");
    game.debugMove(bears, "graveyard");
    settle(game);
    expect(zone(game, bears)).toBe("graveyard");
    toStep(game, "end");
    expect(game.state.zones.shared.stack).toHaveLength(0);
    settle(game);
    expect(zone(game, bears)).toBe("graveyard");
  });

  it("is only this turn's dead", () => {
    const { game } = table();
    const vampire = spawn(game, "Krovikan Vampire");
    const bears = spawn(game, "Grizzly Bears", B);
    deal(game, vampire, bears, 2);
    game.state.objects[bears].putIntoGraveyardOn = { turn: game.state.turn.number - 1, from: "battlefield" };
    toStep(game, "end");
    expect(game.state.zones.shared.stack).toHaveLength(0);
    nextTurn(game);
    expect(zone(game, bears)).toBe("graveyard");
  });

  it("a Vampire that left and came back dealt none of the damage (rule 400.7)", () => {
    const { game } = table();
    const vampire = spawn(game, "Krovikan Vampire");
    const bears = spawn(game, "Grizzly Bears", B);
    deal(game, vampire, bears, 2);
    game.debugApplyEffect(A, { kind: "flicker", target: 0 }, [ref(vampire)]);
    settle(game);
    expect(zone(game, vampire)).toBe("battlefield");
    toStep(game, "end");
    settle(game);
    expect(zone(game, bears)).toBe("graveyard");
  });

  it("sacrifices each returned creature when you lose control of the Vampire", () => {
    const { game } = table();
    const vampire = spawn(game, "Krovikan Vampire");
    const bears = spawn(game, "Grizzly Bears", B);
    const giant = spawn(game, "Hill Giant", B);
    deal(game, vampire, bears, 2);
    deal(game, vampire, giant, 3);
    toStep(game, "end");
    settle(game);
    expect(zone(game, bears)).toBe("battlefield");
    expect(zone(game, giant)).toBe("battlefield");
    game.debugApplyEffect(B, { kind: "gain-control", target: 0, untilEndOfTurn: false }, [ref(vampire)]);
    settle(game);
    expect(controller(game, vampire)).toBe(B);
    expect(named(game, "Grizzly Bears")).toHaveLength(0);
    expect(named(game, "Hill Giant")).toHaveLength(0);
    expect(zone(game, bears)).toBe("graveyard");
    expect(zone(game, giant)).toBe("graveyard");
  });
});
