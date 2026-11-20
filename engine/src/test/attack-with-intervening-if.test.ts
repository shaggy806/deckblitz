/**
 * "Whenever one or more creatures attack one of your opponents, **if any of
 * those creatures** have power or toughness equal to the chosen number, …"
 * (Squall, Gunblade Duelist): an `attacks-player` trigger's intervening-if
 * (rule 603.4) read over its batch — an `amounts` condition counting
 * `inSet: "trigger-batch"` — once for each opponent attacked (rule 508.3d),
 * "defending player" being that opponent (`"trigger-player"`).
 */
import { describe, expect, it } from "vitest";

import type { Game } from "../game.js";
import type { ObjectId, PlayerId } from "../primitives.js";
import type { ScriptedController } from "../controller.js";
import { A, B, cast, lands, life, ref, settle, spawn, table, toHand, toStep, zone } from "./harness.js";

/** Declare these attacks and stop as the declare blockers step begins, before
 * any combat damage. */
const declare = (game: Game, seat: ScriptedController, attacks: readonly [ObjectId, PlayerId][]): void => {
  seat.declareAttackersFn = () => attacks.map(([attacker, defender]) => ({ attacker, defender }));
  toStep(game, "declare-blockers", seat.playerId);
  settle(game);
};

const squall = (game: Game, n: number): ObjectId => {
  const id = spawn(game, "Squall, Gunblade Duelist");
  game.state.objects[id].chosenOnEnter = String(n);
  return id;
};

describe("Squall, Gunblade Duelist", () => {
  it("asks for a number as it enters and deals its power to the defending player when an attacker matches", () => {
    const { game, a } = table();
    lands(game, "Mountain", 1);
    lands(game, "Plains", 1);
    lands(game, "Swamp", 1);
    a.chooseNumberFn = () => 2;
    const card = toHand(game, "Squall, Gunblade Duelist");
    cast(game, card);
    expect(zone(game, card)).toBe("battlefield");
    expect(game.state.objects[card].chosenOnEnter).toBe("2");
    const bears = spawn(game, "Grizzly Bears");
    declare(game, a, [[bears, B]]);
    expect(life(game, B)).toBe(17);
  });

  it("doesn't trigger when no attacker's power or toughness is the number", () => {
    const { game, a } = table();
    squall(game, 5);
    const bears = spawn(game, "Grizzly Bears");
    declare(game, a, [[bears, B]]);
    expect(life(game, B)).toBe(20);
  });

  it("a toughness match counts: Squall attacking itself, 3/2 with 2 chosen", () => {
    const { game, a } = table();
    const id = squall(game, 2);
    declare(game, a, [[id, B]]);
    expect(life(game, B)).toBe(17);
  });

  it("once for each opponent attacked, each over the creatures attacking that player", () => {
    const { game, a } = table({ players: 4 });
    const [, , C, D] = game.state.turnOrder;
    const start = life(game, B);
    squall(game, 2);
    const bears = spawn(game, "Grizzly Bears");
    const giant = spawn(game, "Hill Giant");
    const other = spawn(game, "Grizzly Bears");
    declare(game, a, [
      [bears, B],
      [giant, C],
      [other, C],
    ]);
    expect(life(game, B)).toBe(start - 3);
    expect(life(game, C)).toBe(start - 3);
    expect(life(game, D)).toBe(start);
  });

  it("asks again as it resolves: a matching attacker shrunk in response stops it", () => {
    const { game, a } = table();
    squall(game, 2);
    const bears = spawn(game, "Grizzly Bears");
    a.declareAttackersFn = () => [{ attacker: bears, defender: B }];
    // The trigger waits on the stack; pump the Bears before it resolves.
    game.advanceUntil((s) => s.zones.shared.stack.length > 0);
    expect(game.state.zones.shared.stack).toHaveLength(1);
    game.debugApplyEffect(A, { kind: "modify-pt", target: 0, power: 1, toughness: 1, duration: "end-of-turn" }, [ref(bears)]);
    settle(game);
    expect(life(game, B)).toBe(20);
  });
});
