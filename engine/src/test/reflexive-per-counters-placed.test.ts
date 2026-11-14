/**
 * A reflexive ability that triggers once for every two counters placed this
 * way (`reflexive-trigger`'s `times` over `thisWay: "counters-placed"`):
 * Craig Boone, Novac Guard's ruling — once normally, twice under Doubling
 * Season. Each is its own ability with its own target (rule 603.12), and the
 * creature's controller chooses where the damage goes.
 */
import { describe, expect, it } from "vitest";

import { A, B, attack, counters, life, spawn, table } from "./harness.js";

describe("Craig Boone, Novac Guard — one reflexive ability per two quest counters", () => {
  it("puts two quest counters on it and triggers once; the controller takes the damage", () => {
    const { game, a, b } = table();
    const craig = spawn(game, "Craig Boone, Novac Guard");
    const bears = spawn(game, "Grizzly Bears");
    const wurm = spawn(game, "Craw Wurm", B);
    let asked = 0;
    a.chooseTargetsFn = () => {
      asked += 1;
      return [{ kind: "object", object: wurm }];
    };
    b.chooseModesFn = () => [0];
    attack(game, a, [craig, bears]);
    expect(counters(game, craig, "quest")).toBe(2);
    expect(asked).toBe(1);
    // 2 from the reflexive ability, 3 + 2 from combat.
    expect(life(game, B)).toBe(20 - 2 - 5);
    expect(game.state.objects[wurm].damageMarked).toBe(0);
    // Lifelink: Craig Boone's combat damage only — the ability's damage too.
    expect(life(game, A)).toBe(20 + 2 + 3);
  });

  it("deals the damage to the creature when its controller won't take it", () => {
    const { game, a, b } = table();
    const craig = spawn(game, "Craig Boone, Novac Guard");
    const bears = spawn(game, "Grizzly Bears");
    const wurm = spawn(game, "Craw Wurm", B);
    a.chooseTargetsFn = () => [{ kind: "object", object: wurm }];
    b.chooseModesFn = () => [1];
    attack(game, a, [craig, bears]);
    expect(life(game, B)).toBe(20 - 5);
    expect(game.state.objects[wurm].damageMarked).toBe(2);
  });

  it("triggers twice under Doubling Season, each for the counters on it as it resolves", () => {
    const { game, a, b } = table();
    spawn(game, "Doubling Season");
    const craig = spawn(game, "Craig Boone, Novac Guard");
    const bears = spawn(game, "Grizzly Bears");
    const wurm = spawn(game, "Craw Wurm", B);
    let asked = 0;
    a.chooseTargetsFn = () => {
      asked += 1;
      return [{ kind: "object", object: wurm }];
    };
    b.chooseModesFn = () => [0];
    attack(game, a, [craig, bears]);
    expect(counters(game, craig, "quest")).toBe(4);
    expect(asked).toBe(2);
    expect(life(game, B)).toBe(20 - 4 - 4 - 5);
  });

  it("doesn't trigger when the counters couldn't be put on it", () => {
    const { game, a } = table();
    const craig = spawn(game, "Craig Boone, Novac Guard");
    const bears = spawn(game, "Grizzly Bears");
    spawn(game, "Craw Wurm", B);
    let asked = 0;
    a.chooseTargetsFn = () => {
      asked += 1;
      return [null];
    };
    // Gone before its trigger resolves: no counters, so no "when you do".
    a.declareAttackersFn = () => [
      { attacker: craig, defender: B },
      { attacker: bears, defender: B },
    ];
    game.advanceUntil((s) => s.turn.step === "declare-attackers" && s.zones.shared.stack.length > 0);
    game.debugMove(craig, "graveyard");
    game.advanceUntil((s) => s.turn.step === "postcombat-main");
    expect(asked).toBe(0);
  });
});
