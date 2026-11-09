/**
 * The last two places a compacted token stack was one thing when the rules
 * say it is many: choosing which of it proliferate reaches (701.34a), and
 * naming two of it for one "target" (601.2c).
 */
import { describe, expect, it } from "vitest";

import type { Game } from "../game.js";
import type { ObjectId, PlayerId } from "../primitives.js";
import { A, ref, settle, table } from "./harness.js";

const GOBLIN = "Goblin Token";

function stackOf(game: Game, player: PlayerId, count: number, plusOnes = 0): ObjectId {
  game.debugApplyEffect(player, { kind: "create-token", token: GOBLIN, count });
  const stack = game.state.zones.shared.battlefield.find(
    (id) => game.state.objects[id].cardName === GOBLIN && (game.state.objects[id].stackCount ?? 1) === count,
  );
  if (stack === undefined) throw new Error(`expected one stack of ${count}`);
  if (plusOnes > 0) game.state.objects[stack].counters = { "+1/+1": plusOnes };
  return stack;
}

/** Each pile of Goblins on the battlefield, as "tokens x counters". */
const piles = (game: Game): readonly string[] =>
  game.state.zones.shared.battlefield
    .map((id) => game.state.objects[id])
    .filter((o) => o.cardName === GOBLIN)
    .map((o) => `${o.stackCount ?? 1}x${o.counters["+1/+1"] ?? 0}`)
    .sort();

describe("proliferate over a token stack (701.34a)", () => {
  it("offers a stack with its size", () => {
    const { game } = table();
    const stack = stackOf(game, A, 8, 1);
    game.debugApplyEffect(A, { kind: "proliferate" });
    const offer = game.legalActions(A).find((l) => l.kind === "proliferate");
    expect(offer).toMatchObject({ copies: { [stack]: 8 } });
  });

  it("reaches only as many tokens of a stack as it is named", () => {
    const { game, a } = table();
    const stack = stackOf(game, A, 8, 1);
    a.chooseProliferateFn = () => [ref(stack), ref(stack), ref(stack)];
    game.debugApplyEffect(A, { kind: "proliferate" });
    settle(game);
    expect(piles(game)).toEqual(["3x2", "5x1"]);
  });

  it("reaches every token when each is named, and stays one stack", () => {
    const { game, a } = table();
    const stack = stackOf(game, A, 8, 1);
    a.chooseProliferateFn = (_v, eligible) => eligible;
    game.debugApplyEffect(A, { kind: "proliferate" });
    settle(game);
    expect(piles(game)).toEqual(["8x2"]);
    expect(game.state.objects[stack].counters["+1/+1"]).toBe(2);
  });

  it("refuses more of a stack than it holds", () => {
    const { game } = table();
    const stack = stackOf(game, A, 8, 1);
    game.debugApplyEffect(A, { kind: "proliferate" });
    const chosen = Array.from({ length: 9 }, () => ref(stack));
    expect(game.canDispatch({ type: "proliferate", player: A, chosen })).toMatch(/only 8/);
  });

  it("gives the default answer every token of your own stack", () => {
    const { game } = table();
    stackOf(game, A, 8, 1);
    game.debugApplyEffect(A, { kind: "proliferate" });
    settle(game);
    expect(piles(game)).toEqual(["8x2"]);
  });
});
