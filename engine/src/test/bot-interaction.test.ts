/**
 * An interaction is scored on the opponent it hits (`bot/interaction.ts`,
 * `aimedOutcome` and `scoreOutcome` in `bot/evaluate.ts`; the bot audit's
 * Q4): what a counterspell, removal or a wipe takes from the player it was
 * aimed at counts in full, wherever that player stands.
 */
import { describe, expect, it } from "vitest";
import { DEFAULT_WEIGHTS, aimedOutcome, normalizeWeights, outcomeOf, scoreFeatures, scoreOutcome } from "../bot/evaluate.js";
import { aimedAt, aimedByLine } from "../bot/interaction.js";
import { createDefaultRegistry } from "../cards.js";
import { Game } from "../game.js";
import { asPlayerId } from "../primitives.js";

const [A, B, C, D] = ["alice", "bob", "carol", "dave"].map(asPlayerId);
const registry = createDefaultRegistry();
const weights = normalizeWeights(DEFAULT_WEIGHTS);

/** Four players, carol ahead with two Craw Wurms, and `extra` on the
 * battlefield, each for the player named. */
function table(extra: readonly (readonly [string, typeof A])[] = []): Game {
  const game = Game.create({
    seed: 1,
    shuffle: false,
    registry,
    startingPlayer: A,
    decks: [A, B, C, D].map((player) => ({ player, cards: Array(40).fill("Forest") })),
  });
  game.advanceUntil((s) => s.turn.number === 1 && s.turn.step === "precombat-main" && s.priority.holder === A);
  for (const [name, player] of [["Craw Wurm", C], ["Craw Wurm", C], ...extra] as const) {
    game.debugSpawn(name, player, "battlefield", { summoningSick: false });
  }
  return game;
}

const outcome = (game: Game) => outcomeOf(game.state, registry, A, weights.landCap);
const of = (game: Game, player: typeof A) => {
  const o = outcome(game);
  return scoreFeatures(o.theirs[o.players!.indexOf(player)]!, weights);
};

describe("an interaction's score", () => {
  it("counts what a trailing player lost in full, where standings count a quarter", () => {
    const passed = table([["Craw Wurm", B]]);
    const after = table();
    const lost = of(passed, B) - of(after, B);
    expect(lost).toBeGreaterThan(5);
    // By standings bob is one of two players averaged at `otherOpponents`;
    // aimed at, he counts at `opponent`. (Our own score moves too, by the
    // Wurm no longer pointed at us, the same either way.)
    const plain = scoreOutcome(outcome(after), weights);
    const aimed = scoreOutcome(aimedOutcome(outcome(after), outcome(passed), [B]), weights);
    expect(aimed - plain).toBeCloseTo((weights.opponent - weights.otherOpponents / 2) * lost);
  });

  it("is the plain score when the player aimed at lost nothing, or wasn't the one who did", () => {
    const passed = table([["Craw Wurm", B]]);
    const after = table();
    const plain = scoreOutcome(outcome(after), weights);
    expect(scoreOutcome(aimedOutcome(outcome(after), outcome(passed), [D]), weights)).toBeCloseTo(plain);
    expect(scoreOutcome(aimedOutcome(outcome(passed), outcome(passed), [B]), weights)).toBeCloseTo(
      scoreOutcome(outcome(passed), weights),
    );
  });

  it("counts one board in full for a wipe: the one it took the most from", () => {
    const passed = table([["Craw Wurm", B], ["Grizzly Bears", D]]);
    const after = table();
    const wurm = of(passed, B) - of(after, B);
    const bears = of(passed, D) - of(after, D);
    expect(wurm).toBeGreaterThan(bears);
    const aimed = scoreOutcome(aimedOutcome(outcome(after), outcome(passed), "all"), weights);
    expect(aimed - scoreOutcome(outcome(after), weights)).toBeCloseTo(
      (weights.opponent - weights.otherOpponents / 2) * wurm,
    );
  });
});

describe("whom an action is aimed at", () => {
  it("is the controller of an opponent's permanent it targets, and nobody for a player or our own", () => {
    const game = table();
    const wurm = game.state.zones.shared.battlefield.find((id) => game.state.objects[id]?.cardName === "Craw Wurm")!;
    const murder = game.debugSpawn("Murder", A, "hand");
    const bolt = game.debugSpawn("Lightning Bolt", A, "hand");
    const mine = game.debugSpawn("Grizzly Bears", A, "battlefield");
    const cast = (card: typeof murder, target: Parameters<typeof aimedAt>[3] extends infer _ ? unknown : never) =>
      ({ type: "cast-spell", player: A, card, targets: [target] }) as Parameters<typeof aimedAt>[3];
    expect(aimedAt(game.state, registry, A, cast(murder, { kind: "object", object: wurm }))).toEqual([C]);
    expect(aimedAt(game.state, registry, A, cast(bolt, { kind: "player", player: C }))).toBeNull();
    expect(aimedAt(game.state, registry, A, cast(murder, { kind: "object", object: mine }))).toBeNull();
  });

  it("is everyone for a wipe, and a line's steps together", () => {
    const game = table();
    const wrath = game.debugSpawn("Wrath of God", A, "hand");
    const signet = game.debugSpawn("Arcane Signet", A, "hand");
    const wipe = { type: "cast-spell", player: A, card: wrath } as const;
    const rock = { type: "cast-spell", player: A, card: signet } as const;
    expect(aimedAt(game.state, registry, A, wipe)).toBe("all");
    expect(aimedAt(game.state, registry, A, rock)).toBeNull();
    expect(aimedByLine(registry, A, [rock, "combat"], [game.state, game.state])).toBeNull();
    expect(aimedByLine(registry, A, [rock, wipe], [game.state, game.state])).toBe("all");
  });
});
