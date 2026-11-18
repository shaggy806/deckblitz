/**
 * "Whenever an opponent puts one or more counters on a creature they
 * control": a `counters-put` trigger's `byItsController` (only counters the
 * permanent's own controller put there), and "they put the same number and
 * kind of counters on this creature" — `as-player` the trigger player (who
 * put them, rule 122.6's placement) over `put-counters-of`'s
 * `"trigger-placement"`. Bold Plagiarist.
 */
import { describe, expect, it } from "vitest";

import { A, B, C, counters, ref, settle, spawn, table } from "./harness.js";

describe("Bold Plagiarist", () => {
  it("copies the counters an opponent puts on their own creature, every kind put at once", () => {
    const { game } = table();
    const plagiarist = spawn(game, "Bold Plagiarist");
    const theirs = spawn(game, "Grizzly Bears", B);
    game.debugApplyEffect(B, { kind: "add-counter", target: 0, counter: "+1/+1", amount: 2 }, [ref(theirs)]);
    settle(game);
    expect(counters(game, plagiarist)).toBe(2);
    // Two kinds in one instruction: one placement, one trigger, both kinds.
    game.debugApplyEffect(
      B,
      {
        kind: "sequence",
        simultaneous: true,
        effects: [
          { kind: "add-counter", target: 0, counter: "+1/+1", amount: 1 },
          { kind: "add-counter", target: 0, counter: "flying", amount: 1 },
        ],
      },
      [ref(theirs)],
    );
    settle(game);
    expect(counters(game, plagiarist)).toBe(3);
    expect(counters(game, plagiarist, "flying")).toBe(1);
  });

  it("the opponent puts them: their own Bold Plagiarist doesn't trigger on it (the ruling)", () => {
    const { game } = table();
    const mine = spawn(game, "Bold Plagiarist");
    const yours = spawn(game, "Bold Plagiarist", B);
    const theirs = spawn(game, "Grizzly Bears", B);
    game.debugApplyEffect(B, { kind: "add-counter", target: 0, counter: "+1/+1", amount: 1 }, [ref(theirs)]);
    settle(game);
    expect(counters(game, mine)).toBe(1);
    expect(counters(game, yours)).toBe(0);
    // The counter on mine was put there by bob, so bob's Plagiarist didn't
    // copy it back: an opponent of bob's put none on a creature they control.
    expect(game.state.journal?.entries.filter((e) => e.kind === "counters-put" && e.object === mine).map((e) => e.player)).toEqual([B]);
  });

  it("doesn't trigger on your counters, counters on your creatures, or one opponent's counters on another's creature", () => {
    const { game } = table({ players: 3 });
    const plagiarist = spawn(game, "Bold Plagiarist");
    const bobs = spawn(game, "Grizzly Bears", B);
    const mine = spawn(game, "Grizzly Bears");
    // You on an opponent's creature.
    game.debugApplyEffect(A, { kind: "add-counter", target: 0, counter: "+1/+1", amount: 1 }, [ref(bobs)]);
    settle(game);
    // An opponent on your creature.
    game.debugApplyEffect(B, { kind: "add-counter", target: 0, counter: "+1/+1", amount: 1 }, [ref(mine)]);
    settle(game);
    // Carol on bob's creature: not a creature she controls.
    game.debugApplyEffect(C, { kind: "add-counter", target: 0, counter: "+1/+1", amount: 1 }, [ref(bobs)]);
    settle(game);
    expect(counters(game, plagiarist)).toBe(0);
    // Carol on her own: it triggers.
    const carols = spawn(game, "Grizzly Bears", C);
    game.debugApplyEffect(C, { kind: "add-counter", target: 0, counter: "-1/-1", amount: 1 }, [ref(carols)]);
    settle(game);
    expect(counters(game, plagiarist, "-1/-1")).toBe(1);
  });

  it("a creature an opponent's spell puts onto the battlefield with counters triggers it (rule 122.6)", () => {
    const { game } = table();
    const plagiarist = spawn(game, "Bold Plagiarist");
    game.debugApplyEffect(B, { kind: "create-token", token: "Soldier Token", count: 1, withCounters: { kind: "+1/+1", amount: 2 } }, []);
    settle(game);
    expect(counters(game, plagiarist)).toBe(2);
  });
});
