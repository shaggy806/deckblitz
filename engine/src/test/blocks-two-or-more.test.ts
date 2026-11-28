/**
 * "Whenever this creature blocks two or more creatures" (Lairwatch Giant):
 * the `blocks` trigger's `atLeast` — once, as the declaration completes,
 * if it blocks that many (rule 509.3a), and once when an effect first takes
 * it there, never again after (the card's ruling; gaps key
 * `trigger:blocks-two-or-more`).
 */
import { describe, expect, it } from "vitest";

import type { Game } from "../game.js";
import type { ObjectId } from "../primitives.js";
import { A, B, activate, keywords, ref, settle, spawn, table } from "./harness.js";

/** Alice attacks Bob with `attackers`; Bob blocks as `blocks` says. */
const combat = (
  attackerNames: readonly string[],
  blockerNames: readonly string[],
  blocks: readonly (readonly [number, number])[],
) => {
  const t = table();
  const { game, a, b } = t;
  const attackers = attackerNames.map((name) => spawn(game, name, A));
  const blockers = blockerNames.map((name) => spawn(game, name, B));
  a.declareAttackersFn = () => attackers.map((attacker) => ({ attacker, defender: B }));
  b.declareBlockersFn = () => blocks.map(([blocker, attacker]) => ({ blocker: blockers[blocker], attacker: attackers[attacker] }));
  game.advanceUntil((s) => s.turn.step === "declare-blockers" && s.priority.holder === A && s.awaiting === null);
  return { ...t, attackers, blockers };
};

const firstStrike = (game: Game, id: ObjectId): boolean => keywords(game, id).has("first-strike");

describe("Lairwatch Giant", () => {
  it("gains first strike when it blocks two creatures", () => {
    const { game, blockers } = combat(["Grizzly Bears", "Grizzly Bears"], ["Lairwatch Giant"], [[0, 0], [0, 1]]);
    settle(game);
    expect(firstStrike(game, blockers[0])).toBe(true);
  });

  it("doesn't when it blocks one", () => {
    const { game, blockers } = combat(["Grizzly Bears", "Grizzly Bears"], ["Lairwatch Giant"], [[0, 0]]);
    settle(game);
    expect(firstStrike(game, blockers[0])).toBe(false);
  });

  it("gains it when an effect first makes it block two (Sorrow's Path)", () => {
    const { game, blockers } = combat(
      ["Hill Giant", "Craw Wurm", "Grizzly Bears"],
      ["Lairwatch Giant", "Lairwatch Giant"],
      [[0, 0], [0, 1], [1, 2]],
    );
    const [two, one] = blockers;
    const path = spawn(game, "Sorrow's Path", A);
    settle(game);
    expect(firstStrike(game, two)).toBe(true);
    expect(firstStrike(game, one)).toBe(false);
    activate(game, path, 0, { targets: [ref(two), ref(one)] });
    settle(game);
    expect(game.state.objects[one].blockingAlso?.length).toBe(1);
    expect(firstStrike(game, one)).toBe(true);
  });
});
