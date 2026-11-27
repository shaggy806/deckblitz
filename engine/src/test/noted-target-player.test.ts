/**
 * Linked abilities (rule 607.1): "When this creature enters, target player
 * loses 6 life. When this creature leaves the battlefield, **that player**
 * gains 6 life." The enters ability notes its target as it goes on the stack
 * (`notesTarget`, `GameObject.notedTarget`), and the leaves ability reads it
 * through the `"noted-target-player"` scope — the player it targeted, even
 * while that ability is still on the stack (the card's ruling). Laquatus's
 * Champion, Soul Scourge.
 */
import { describe, expect, it } from "vitest";

import { A, B, C, destroy, enter, life, pickTargets, settle, table } from "./harness.js";

describe("noted-target-player", () => {
  it("gives the life back to the player the enters ability targeted", () => {
    const { game, a } = table();
    pickTargets(a, B);
    const champion = enter(game, "Laquatus's Champion");
    expect(life(game, B)).toBe(14);
    destroy(game, champion, B);
    expect(life(game, B)).toBe(20);
    expect(life(game, A)).toBe(20);
  });

  it("reads the target of an enters ability still on the stack", () => {
    const { game, a } = table();
    pickTargets(a, B);
    const champion = enter(game, "Laquatus's Champion", A, { settle: false });
    game.advanceUntil((s) => s.zones.shared.stack.length > 0);
    expect(game.state.objects[champion].notedTarget?.player).toBe(B);
    game.debugApplyEffect(B, { kind: "return-to-hand", target: 0 }, [{ kind: "object", object: champion }]);
    // The leaves ability resolves first: bob gains 6, then loses 6.
    game.advanceUntil((s) => s.players[B].life !== 20);
    expect(life(game, B)).toBe(26);
    settle(game);
    expect(life(game, B)).toBe(20);
    expect(life(game, A)).toBe(20);
  });

  it("names the target of the stint it left, not an earlier one", () => {
    const { game, a } = table({ players: 3 });
    pickTargets(a, B);
    const first = enter(game, "Soul Scourge");
    expect(life(game, B)).toBe(17);
    game.debugMove(first, "hand");
    settle(game);
    expect(life(game, B)).toBe(20);
    pickTargets(a, C);
    const again = enter(game, "Soul Scourge");
    expect(life(game, C)).toBe(17);
    destroy(game, again, B);
    expect(life(game, C)).toBe(20);
    expect(life(game, B)).toBe(20);
  });

  it("gives nothing when no enters ability targeted anyone in this stint", () => {
    const { game } = table();
    const scourge = game.debugSpawn("Soul Scourge", A, "battlefield", { summoningSick: false });
    destroy(game, scourge, B);
    expect(life(game, A)).toBe(20);
    expect(life(game, B)).toBe(20);
  });
});
