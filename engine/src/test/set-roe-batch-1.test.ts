/**
 * Rise of the Eldrazi, batch 1 (B159): the lead's cards — the set's last
 * few by rank. The levelers and umbras are in `level-up-umbra-armor.test.ts`
 * and the agents' `set-roe-batch-1A`…`1E`.
 */
import { describe, expect, it } from "vitest";

import { A, B, activate, attack, lands, pt, ref, spawn, table } from "./harness.js";

describe("Rise of the Eldrazi, batch 1", () => {
  it("Arrogant Bloodlord is destroyed at end of combat when a 1-power creature blocks it", () => {
    const { game, a, b } = table();
    const lord = spawn(game, "Arrogant Bloodlord");
    const elves = spawn(game, "Llanowar Elves", B);
    b.declareBlockersFn = () => [{ blocker: elves, attacker: lord }];
    attack(game, a, [lord]);
    expect(game.state.objects[lord].zone).toBe("graveyard");
  });

  it("Arrogant Bloodlord survives a 2-power blocker", () => {
    const { game, a, b } = table();
    const lord = spawn(game, "Arrogant Bloodlord");
    const bears = spawn(game, "Grizzly Bears", B);
    b.declareBlockersFn = () => [{ blocker: bears, attacker: lord }];
    attack(game, a, [lord]);
    expect(game.state.objects[lord].zone).toBe("battlefield");
  });

  it("Champion's Drake gets +3/+3 once a creature you control has three level counters", () => {
    const { game } = table();
    const drake = spawn(game, "Champion's Drake");
    const student = spawn(game, "Student of Warfare");
    game.debugApplyEffect(A, { kind: "add-counter", target: 0, counter: "level", amount: 2 }, [ref(student)]);
    expect(pt(game, drake)).toEqual({ power: 1, toughness: 1 });
    game.debugApplyEffect(A, { kind: "add-counter", target: 0, counter: "level", amount: 1 }, [ref(student)]);
    expect(pt(game, drake)).toEqual({ power: 4, toughness: 4 });
  });

  it("Grotag Siege-Runner destroys a creature with defender and deals 2 to its controller", () => {
    const { game } = table();
    lands(game, "Mountain", 1);
    const goblin = spawn(game, "Grotag Siege-Runner");
    const wall = spawn(game, "Wall of Omens", B);
    activate(game, goblin, 0, { targets: [ref(wall)] });
    expect(game.state.objects[wall].zone).toBe("graveyard");
    expect(game.state.players[B].life).toBe(18);
  });

  it("Soulsurge Elemental's power counts the creatures you control, itself included", () => {
    const { game } = table();
    const elemental = spawn(game, "Soulsurge Elemental");
    spawn(game, "Grizzly Bears");
    expect(pt(game, elemental)).toEqual({ power: 2, toughness: 1 });
  });
});
