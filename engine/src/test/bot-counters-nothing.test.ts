/**
 * A counter is never aimed at a spell it can't counter (rule 701.6a: the
 * spell is a legal target, and the counter does nothing to it) —
 * `HeuristicBotController.countersNothing`, v1's own cast and v2's fallback
 * when its clock runs out. A live game, 2026-11-24: the strong Y'shtola
 * deck's bot exiled a blue card to Force of Will a Dragonlord Dromoka
 * (`docs/bot-misplays.md`).
 */
import { describe, expect, it } from "vitest";
import type { Action } from "../actions.js";
import { createDefaultRegistry } from "../cards.js";
import { HeuristicBotController } from "../controller.js";
import { Game } from "../game.js";
import { asPlayerId } from "../primitives.js";
import type { ObjectId } from "../primitives.js";

const [A, B] = ["alice", "bob"].map(asPlayerId);
const registry = createDefaultRegistry();

/** Bob, the active player, has cast `spell`; alice holds priority with
 * `counter` in hand, five Islands, and nothing else. */
function facing(spell: string, counter: string, mark?: (game: Game, id: ObjectId) => void): { game: Game; cast: ObjectId } {
  const game = Game.create({
    seed: 1,
    shuffle: false,
    registry,
    startingPlayer: B,
    decks: [A, B].map((player) => ({ player, cards: Array(40).fill("Forest") })),
  });
  game.advanceUntil((s) => s.turn.step === "precombat-main" && s.priority.holder === B);
  game.state.turn.number = 20;
  for (const player of [A, B]) game.state.zones.perPlayer[player].hand = [];
  for (let i = 0; i < 5; i += 1) game.debugSpawn("Island", A, "battlefield", { summoningSick: false });
  for (const land of ["Forest", "Forest", "Forest", "Plains", "Plains", "Plains"]) {
    game.debugSpawn(land, B, "battlefield", { summoningSick: false });
  }
  game.debugSpawn(counter, A, "hand");
  const cast = game.debugSpawn(spell, B, "hand");
  game.dispatch({ type: "cast-spell", player: B, card: cast, targets: [] });
  mark?.(game, cast);
  game.advanceUntil((s) => s.priority.holder === A);
  expect(game.state.objects[cast]?.zone).toBe("stack");
  return { game, cast };
}

const countersIt = (action: Action, cast: ObjectId): boolean =>
  action.type === "cast-spell" && (action.targets ?? []).some((t) => t?.kind === "object" && t.object === cast);

const v1 = (game: Game): Action => new HeuristicBotController(A, registry).act(game.controllerView(A));

describe("a counter at a spell that can't be countered", () => {
  it("isn't cast at a spell whose own text says it can't be countered", () => {
    const { game, cast } = facing("Dragonlord Dromoka", "Counterspell");
    expect(countersIt(v1(game), cast)).toBe(false);
  });

  it("is cast at the same sort of spell when it can be countered", () => {
    const { game, cast } = facing("Craw Wurm", "Counterspell");
    expect(countersIt(v1(game), cast)).toBe(true);
  });

  it("isn't cast at a spell paid for with Cavern of Souls' mana", () => {
    const { game, cast } = facing("Craw Wurm", "Counterspell", (g, id) => {
      g.state.objects[id]!.uncounterable = true;
    });
    expect(countersIt(v1(game), cast)).toBe(false);
  });
});
