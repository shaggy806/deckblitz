/**
 * "Whenever a player casts a spell, … that player" (`trigger-controller` — Spellshock, Forced
 * Fruition, Ruric Thar, Magebane Lizard) means whoever cast it, fixed as the ability triggers
 * (`LastKnownRefs.triggerSpellController`): a spell cast from someone else's cards and countered
 * in response is in its owner's graveyard, but "that player" is still its caster.
 */
import { describe, expect, it } from "vitest";

import { A, B, cast, lands, life, ref, settle, spawn, table, toHand } from "./harness.js";

describe("a cast trigger's \"that player\" is the caster", () => {
  it("still the caster once the spell, owned by someone else, is countered", () => {
    const { game } = table();
    spawn(game, "Spellshock", B);
    lands(game, "Island", 2);
    // Bob's card in Alice's hand — as though she took it.
    const opt = toHand(game, "Opt");
    game.state.objects[opt].owner = B;
    cast(game, opt, { settle: false });
    // Countered in response, before Spellshock's trigger resolves.
    game.debugApplyEffect(B, { kind: "counter", target: 0 }, [ref(opt)]);
    expect(game.state.objects[opt].zone).toBe("graveyard");
    settle(game);
    expect(life(game, A)).toBe(18);
    expect(life(game, B)).toBe(20);
  });
});
