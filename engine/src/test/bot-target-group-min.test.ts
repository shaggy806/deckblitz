// An "any number of" target group with a `min` above one, as the bots fill
// it: Reckless Spite's "Destroy two target nonblack creatures" is a group of
// exactly two, so a cast naming one is refused (rule 601.2c). The situation
// fuzzer found a bot casting it at none under Hinata, Dawn-Crowned's
// per-target tax (2026-10-31): the offer's target range counted every member
// optional (`targetCountBoundsFor`). And `firstOfEach` and the heuristic's
// ranked pick took a single member of a group whatever its `min`.

import { describe, expect, it } from "vitest";

import type { Action, LegalAction } from "../actions.js";
import { HeuristicBotController, RandomController } from "../controller.js";
import type { Game } from "../game.js";
import type { ObjectId, PlayerId } from "../primitives.js";
import { A, B, lands, settle, spawn, table, toHand, zone } from "./harness.js";

const castOffers = (game: Game, player: PlayerId, card: ObjectId): LegalAction[] =>
  game.legalActions(player).filter((a) => a.kind === "cast-spell" && a.card === card);

function board() {
  const { game } = table();
  lands(game, "Swamp", 3);
  const bears = spawn(game, "Grizzly Bears", B);
  const giant = spawn(game, "Hill Giant", B);
  const spite = toHand(game, "Reckless Spite");
  return { game, bears, giant, spite };
}

const castWith = (game: Game, spite: ObjectId, act: (view: never) => Action): Action => {
  const offers = castOffers(game, A, spite);
  expect(offers).toHaveLength(1);
  return act({ player: A, state: game.state, legalActions: () => offers } as never);
};

describe("a bot fills a target group up to its min", () => {
  it("the heuristic bot casts Reckless Spite at both creatures", () => {
    const { game, bears, giant, spite } = board();
    const bot = new HeuristicBotController(A, game.registry);
    const action = castWith(game, spite, (view) => bot.act(view));
    expect(action).toMatchObject({ type: "cast-spell", card: spite });
    game.dispatch(action);
    expect(zone(game, spite)).toBe("stack");
    settle(game);
    expect(zone(game, bears)).toBe("graveyard");
    expect(zone(game, giant)).toBe("graveyard");
  });

  it("a per-target tax prices the group at its min, not at none", () => {
    // Hinata's "{1} more for each target": Reckless Spite at its two targets
    // costs five. The offer's target range used to be every member optional,
    // so with three lands it was offered at zero targets — no legal cast.
    const { game } = table();
    spawn(game, "Hinata, Dawn-Crowned", B);
    lands(game, "Swamp", 3);
    spawn(game, "Grizzly Bears", B);
    spawn(game, "Hill Giant", B);
    const spite = toHand(game, "Reckless Spite");
    expect(castOffers(game, A, spite)).toHaveLength(0);
    lands(game, "Swamp", 2);
    const offers = castOffers(game, A, spite);
    expect(offers).toHaveLength(1);
    expect(offers[0]).toMatchObject({ targetCount: { min: 2, max: 2 } });
  });

  it("the fuzzer's controller names two targets, never one", () => {
    for (const seed of [0, 0.3, 0.6, 0.99]) {
      const { game, spite } = board();
      const action = castWith(game, spite, (view) => new RandomController(A, () => seed).act(view));
      expect(action).toMatchObject({ type: "cast-spell", card: spite });
      expect(() => game.dispatch(action)).not.toThrow();
      expect(zone(game, spite)).toBe("stack");
    }
  });
});
