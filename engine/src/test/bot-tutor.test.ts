/**
 * What the bots take from a library search. v1 used to take library order
 * for anything but lands, so a tutor found whatever card came next, and v2
 * kept that answer (its rollouts can't tell one card in hand from another).
 */

import { describe, expect, it } from "vitest";

import { EvalBotController } from "../bot/eval-bot.js";
import { createDefaultRegistry } from "../cards.js";
import { HeuristicBotController } from "../controller.js";
import { Game } from "../game.js";
import { asPlayerId } from "../primitives.js";

const registry = createDefaultRegistry();
const A = asPlayerId("alice");
const B = asPlayerId("bob");

function boardWithLands(lands: number): Game {
  const game = Game.create({
    seed: 3,
    registry,
    decks: [A, B].map((player) => ({ player, cards: Array<string>(40).fill("Forest") })),
  });
  game.advanceUntil((s) => s.priority.holder === A && s.turn.step === "precombat-main");
  for (let i = 0; i < lands; i += 1) game.debugSpawn("Forest", A, "battlefield");
  return game;
}

describe("v2 casts a tutor when it has nothing better", () => {
  // A tutor swaps one card in hand for another, which the evaluation used to
  // score as passing, so a rule cast it (`isCantripDue`'s tutor branch). It's
  // priced now: 0.85 of the best card its filter finds (`bot/hand-worth.ts`),
  // so finding that card is a gain and the search casts it itself.
  it.each(["Demonic Tutor", "Diabolic Tutor"])("casts %s in its main phase", (tutor) => {
    const game = boardWithLands(2);
    game.debugSpawn("Swamp", A, "battlefield");
    game.debugSpawn("Swamp", A, "battlefield");
    game.state.zones.perPlayer[A].hand = [];
    game.debugSpawn(tutor, A, "hand");
    game.debugSpawn("Craw Wurm", A, "library");
    const action = new EvalBotController(A, registry).act(game.controllerView(A));
    expect(action.type === "cast-spell" ? game.state.objects[action.card]?.cardName : action.type).toBe(tutor);
  });
});

describe("the card a tutor finds", () => {
  /** Alice's Demonic Tutor resolving with `lands` Swamps out and `hand`
   * beside it: what the bot takes of `library`'s cards. */
  function found(lands: number, hand: readonly string[], library: readonly string[]): string | undefined {
    const game = boardWithLands(0);
    for (let i = 0; i < lands; i += 1) game.debugSpawn("Swamp", A, "battlefield");
    game.state.zones.perPlayer[A].hand = [];
    for (const name of hand) game.debugSpawn(name, A, "hand");
    for (const name of library) game.debugSpawn(name, A, "library");
    const tutor = game.debugSpawn("Demonic Tutor", A, "hand");
    game.dispatch({ type: "cast-spell", player: A, card: tutor, targets: [] });
    for (let i = 0; i < 4 && game.state.awaiting === null; i += 1) {
      game.dispatch({ type: "pass-priority", player: game.state.priority.holder! });
    }
    const awaiting = game.state.awaiting;
    if (awaiting?.kind !== "choose-from-zone") throw new Error(`no search: ${awaiting?.kind}`);
    const [pick] = new EvalBotController(A, registry).chooseFromZone(
      game.controllerView(A),
      awaiting.eligible,
      awaiting.min,
      awaiting.max,
    );
    return pick === undefined ? undefined : game.state.objects[pick]?.cardName;
  }

  // Ranked as the evaluation prices a hand (`handCardQuality`), so the card
  // a rollout finds is the one the tutor in hand was priced on.
  it("is the land drop a hand without a land is missing", () => {
    expect(found(3, [], ["Craw Wurm"])).toBe("Forest");
  });

  it("is a spell, not a second land, when the hand has its land drop", () => {
    // v1's hand ranking kept every land the board was short of ahead of any
    // spell, so a tutor at five lands found a second Forest.
    expect(found(5, ["Forest"], ["Craw Wurm"])).toBe("Craw Wurm");
  });

  it("is the spell within reach, not the dearest", () => {
    expect(found(3, ["Forest"], ["Craw Wurm", "Hill Giant"])).toBe("Hill Giant");
  });
});

describe("v1's pick from a library search", () => {
  it("takes the dear spell the board can cast over the one that comes first", () => {
    const game = boardWithLands(5);
    const bears = game.debugSpawn("Grizzly Bears", A, "library");
    const wurm = game.debugSpawn("Craw Wurm", A, "library");
    const pick = new HeuristicBotController(A, registry).chooseFromZone(game.controllerView(A), [bears, wurm], 1, 1);
    expect(pick).toEqual([wurm]);
  });

  it("leaves a spell still out of reach for one it can cast soon", () => {
    const game = boardWithLands(2);
    const wurm = game.debugSpawn("Craw Wurm", A, "library");
    const bears = game.debugSpawn("Grizzly Bears", A, "library");
    const pick = new HeuristicBotController(A, registry).chooseFromZone(game.controllerView(A), [wurm, bears], 1, 1);
    expect(pick).toEqual([bears]);
  });
});
