/**
 * Fires of Mount Doom: "{2}{R}: Exile the top card of your library. You may
 * play that card this turn. When you play a card this way, Fires of Mount
 * Doom deals 2 damage to each player." An `impulse-exile`'s `whenCast` with
 * `lands`: the effect's delayed triggered ability (rule 603.7) finds the card
 * only when it's played under this permission — a land as it's played
 * (305.1), a spell as it's cast — and nothing triggers if it isn't played.
 */
import { describe, expect, it } from "vitest";

import { A, B, activate, cast, enter, lands, life, pickTargets, ref, settle, spawn, table, toLibrary, zone } from "./harness.js";

describe("Fires of Mount Doom", () => {
  it("enters dealing 2 damage to an opponent's creature and destroying the Equipment attached to it", () => {
    const { game, a } = table();
    const giant = spawn(game, "Hill Giant", B);
    const sword = spawn(game, "Bonesplitter", B);
    game.debugApplyEffect(B, { kind: "attach", target: 0, attachment: 1 }, [ref(giant), ref(sword)]);
    const loose = spawn(game, "Bonesplitter", B);
    pickTargets(a, giant);
    enter(game, "Fires of Mount Doom");
    expect(game.state.objects[giant].damageMarked).toBe(2);
    expect(zone(game, sword)).toBe("graveyard");
    expect(zone(game, loose)).toBe("battlefield");
  });

  it("a land played this way deals 2 damage to each player", () => {
    const { game } = table();
    const fires = spawn(game, "Fires of Mount Doom");
    lands(game, "Mountain", 3);
    const forest = toLibrary(game, "Forest");
    activate(game, fires);
    expect(zone(game, forest)).toBe("exile");
    expect([life(game, A), life(game, B)]).toEqual([20, 20]);
    game.dispatch({ type: "play-land", player: A, card: forest });
    settle(game);
    expect(zone(game, forest)).toBe("battlefield");
    expect([life(game, A), life(game, B)]).toEqual([18, 18]);
  });

  it("a spell cast this way deals 2 damage to each player as it's cast; one not played deals none", () => {
    const { game } = table();
    const fires = spawn(game, "Fires of Mount Doom");
    lands(game, "Mountain", 7);
    const bolt = toLibrary(game, "Lightning Bolt");
    activate(game, fires);
    expect(zone(game, bolt)).toBe("exile");
    cast(game, bolt, { via: "impulse", targets: [ref(B)] });
    expect([life(game, A), life(game, B)]).toEqual([18, 15]);
    // A second activation, its card left in exile: nothing more.
    const bears = toLibrary(game, "Grizzly Bears");
    activate(game, fires);
    expect(zone(game, bears)).toBe("exile");
    settle(game);
    expect([life(game, A), life(game, B)]).toEqual([18, 15]);
  });
});
