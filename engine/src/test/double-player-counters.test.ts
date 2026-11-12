/**
 * `double-counters` with `target: "you"` — Aetheric Amplifier's "double the
 * number of each kind of counter you have": each kind as it is now, energy
 * included (rule 122.1), and its permanent mode as before.
 */
import { describe, expect, it } from "vitest";

import { A, B, activate, counters, lands, ref, settle, spawn, table } from "./harness.js";

describe("double-counters on you — Aetheric Amplifier", () => {
  it("doubles each kind of counter you have, and not an opponent's", () => {
    const { game } = table();
    lands(game, "Wastes", 4);
    const amp = spawn(game, "Aetheric Amplifier");
    game.debugApplyEffect(A, { kind: "add-player-counters", counter: "experience", amount: 2 }, []);
    game.debugApplyEffect(A, { kind: "add-player-counters", counter: "poison", amount: 3 }, []);
    game.debugApplyEffect(A, { kind: "get-energy", amount: 4 }, []);
    game.debugApplyEffect(B, { kind: "add-player-counters", counter: "poison", amount: 1 }, []);
    settle(game);
    activate(game, amp, 1, { modes: [1] });
    settle(game);
    const alice = game.state.players[A];
    expect([alice.counters.experience, alice.counters.poison, alice.energy]).toEqual([4, 6, 8]);
    expect(game.state.players[B].counters.poison).toBe(1);
  });

  it("doubles each kind of counter on target permanent", () => {
    const { game } = table();
    lands(game, "Wastes", 4);
    const amp = spawn(game, "Aetheric Amplifier");
    const bears = spawn(game, "Grizzly Bears", B);
    game.debugApplyEffect(A, { kind: "add-counter", target: 0, counter: "+1/+1", amount: 2 }, [ref(bears)]);
    game.debugApplyEffect(A, { kind: "add-counter", target: 0, counter: "stun", amount: 1 }, [ref(bears)]);
    activate(game, amp, 1, { modes: [0], targets: [ref(bears)] });
    settle(game);
    expect([counters(game, bears, "+1/+1"), counters(game, bears, "stun")]).toEqual([4, 2]);
  });
});
