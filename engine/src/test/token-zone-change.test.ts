/**
 * Rule 111.8: "A token that has left the battlefield can't move to another
 * zone or come back onto the battlefield. If such a token would change zones,
 * it remains in its current zone instead." An effect that exiles a permanent
 * and then returns it in the same resolution brings back a card, never a
 * token (The Neutrinos, flicker's "a token exiled this way never comes back").
 */
import { describe, expect, it } from "vitest";

import { A, ref, settle, table } from "./harness.js";

function makeToken(game: ReturnType<typeof table>["game"], name: string) {
  const before = new Set(game.battlefield);
  game.debugApplyEffect(A, { kind: "create-token", token: name, count: 1 });
  settle(game);
  return game.battlefield.find((id) => !before.has(id))!;
}

describe("a token that has left the battlefield (rule 111.8)", () => {
  it("isn't put back onto the battlefield from exile in the same resolution", () => {
    const { game } = table();
    const soldier = makeToken(game, "Soldier Token");
    game.debugApplyEffect(
      A,
      {
        kind: "sequence",
        effects: [
          { kind: "exile", target: 0 },
          { kind: "put-onto-battlefield", target: 0, underYourControl: true },
        ],
      },
      [ref(soldier)],
    );
    settle(game);
    expect(game.battlefield).not.toContain(soldier);
    // It stays in exile until state-based actions end it (rule 111.7).
    expect(game.state.objects[soldier]?.zone ?? "gone").not.toBe("battlefield");
  });

  it("isn't returned to a hand from the graveyard either", () => {
    const { game } = table();
    const soldier = makeToken(game, "Soldier Token");
    game.debugApplyEffect(
      A,
      {
        kind: "sequence",
        effects: [
          { kind: "destroy", target: 0 },
          { kind: "return-to-hand", target: 0, from: "graveyard" },
        ],
      },
      [ref(soldier)],
    );
    settle(game);
    expect(game.state.zones.perPlayer[A].hand).not.toContain(soldier);
    expect(game.state.objects[soldier]?.zone ?? "gone").not.toBe("hand");
  });
});
