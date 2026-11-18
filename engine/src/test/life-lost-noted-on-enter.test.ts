/**
 * "When this creature leaves the battlefield, you gain life equal to the life
 * you lost when it entered": the enters ability notes the life it took (the
 * `note` effect of `{ lifeLostThisWay }`), and the leaves ability reads it
 * back off the creature as it last existed (`{ chosenNumber: true }`, rule
 * 608.2h). Nothing noted — it left before its enters ability resolved —
 * gains nothing (`Game.changeLife` ignores a NaN amount). Soulgorger Orgg.
 */
import { describe, expect, it } from "vitest";

import { A, B, destroy, enter, life, settle, table } from "./harness.js";

describe("Soulgorger Orgg", () => {
  it("takes all but 1 life as it enters and gives it back as it leaves", () => {
    const { game } = table();
    const orgg = enter(game, "Soulgorger Orgg");
    expect(life(game, A)).toBe(1);
    expect(game.state.objects[orgg].chosenOnEnter).toBe("19");
    destroy(game, orgg, B);
    expect(life(game, A)).toBe(20);
  });

  it("gives back only what its enters ability took, not life lost otherwise", () => {
    const { game } = table({ life: 30 });
    const orgg = enter(game, "Soulgorger Orgg");
    expect(life(game, A)).toBe(1);
    game.debugApplyEffect(A, { kind: "gain-life", amount: 10 });
    settle(game);
    game.debugApplyEffect(B, { kind: "lose-life", amount: 5, target: 0 }, [{ kind: "player", player: A }]);
    settle(game);
    expect(life(game, A)).toBe(6);
    destroy(game, orgg, B);
    expect(life(game, A)).toBe(35);
  });

  it("gains nothing if it leaves before its enters ability resolves, which still takes the life", () => {
    const { game } = table();
    const orgg = enter(game, "Soulgorger Orgg", A, { settle: false });
    game.debugMove(orgg, "hand");
    settle(game);
    expect(life(game, A)).toBe(1);
    expect(Number.isFinite(game.state.players[A].life)).toBe(true);
  });

  it("with 1 life it takes none and gives none back", () => {
    const { game } = table({ life: 1 });
    const orgg = enter(game, "Soulgorger Orgg");
    expect(life(game, A)).toBe(1);
    destroy(game, orgg, B);
    expect(life(game, A)).toBe(1);
  });
});
