/**
 * The set walk, batch 59, part d (2026-10-11): what the lead's fixes needed —
 * the mana spent on a spell, read after it was countered in response (rule
 * 608.2h — Aetherflux Conduit), and an "enters with" amount that reads X
 * anywhere in it (Primo, the Unbounded, in part b).
 */
import { describe, expect, it } from "vitest";

import { A, B, cast, lands, ref, settle, spawn, table, toHand } from "./harness.js";

describe("Aetherflux Conduit", () => {
  it("a spell countered before the cast trigger resolves still gives energy for the mana spent on it", () => {
    const { game } = table();
    spawn(game, "Aetherflux Conduit");
    lands(game, "Island", 4);
    const divination = toHand(game, "Divination");
    cast(game, divination, { settle: false });
    game.debugApplyEffect(B, { kind: "counter", target: 0 }, [ref(divination)]);
    settle(game);
    expect(game.state.objects[divination].zone).toBe("graveyard");
    expect(game.state.players[A].energy).toBe(3);
  });
});
