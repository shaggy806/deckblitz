/**
 * "Each time target permanent would deal damage to a permanent or player this
 * turn, it deals double that damage to that permanent or player instead"
 * (Overblaze): a resolved `would-deal-damage` replacement (rule 614.1a) on
 * the target's damage alone (`fromObject`), every time this turn, in the
 * stint it has now (rule 400.7). Splice onto Arcane (rule 702.47) adds it to
 * another Arcane spell, its target after that spell's own.
 */
import { describe, expect, it } from "vitest";

import { A, B, activate, cast, hand, lands, life, nextTurn, ref, spawn, table, toHand } from "./harness.js";

describe("double the damage a target permanent deals this turn (Overblaze)", () => {
  it("doubles each time the target deals damage this turn, to players and permanents", () => {
    const { game } = table();
    const pyro = spawn(game, "Prodigal Pyromancer");
    const other = spawn(game, "Prodigal Sorcerer");
    const bears = spawn(game, "Grizzly Bears", B);
    lands(game, "Mountain", 4);
    cast(game, toHand(game, "Overblaze"), { targets: [ref(pyro)] });
    activate(game, pyro, 0, { targets: [ref(B)] });
    expect(life(game, B)).toBe(18);
    // Each time, not only the next.
    game.debugApplyEffect(A, { kind: "untap", target: 0 }, [ref(pyro)]);
    activate(game, pyro, 0, { targets: [ref(B)] });
    expect(life(game, B)).toBe(16);
    // Another permanent's damage isn't doubled.
    activate(game, other, 0, { targets: [ref(bears)] });
    expect(game.state.objects[bears].damageMarked).toBe(1);
  });

  it("doubles damage to a permanent too, killing a 2/2 with a 1-damage ping", () => {
    const { game } = table();
    const pyro = spawn(game, "Prodigal Pyromancer");
    const bears = spawn(game, "Grizzly Bears", B);
    lands(game, "Mountain", 4);
    cast(game, toHand(game, "Overblaze"), { targets: [ref(pyro)] });
    activate(game, pyro, 0, { targets: [ref(bears)] });
    expect(game.state.objects[bears].zone).toBe("graveyard");
  });

  it("ends with the turn", () => {
    const { game } = table();
    const pyro = spawn(game, "Prodigal Pyromancer");
    lands(game, "Mountain", 4);
    cast(game, toHand(game, "Overblaze"), { targets: [ref(pyro)] });
    nextTurn(game);
    nextTurn(game);
    activate(game, pyro, 0, { targets: [ref(B)] });
    expect(life(game, B)).toBe(19);
  });

  it("spliced onto an Arcane spell: that spell's effect, then Overblaze's on its own target", () => {
    const { game } = table();
    const pyro = spawn(game, "Prodigal Pyromancer");
    lands(game, "Mountain", 6);
    const ray = toHand(game, "Glacial Ray");
    const blaze = toHand(game, "Overblaze");
    cast(game, ray, { targets: [ref(B), ref(pyro)], splice: [blaze] });
    // Glacial Ray's 2 to bob; Overblaze is revealed and stays in hand.
    expect(life(game, B)).toBe(18);
    expect(hand(game, A)).toContain(blaze);
    activate(game, pyro, 0, { targets: [ref(B)] });
    expect(life(game, B)).toBe(16);
  });
});
