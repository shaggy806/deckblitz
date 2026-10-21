/**
 * Rampage N (rule 702.23): "Whenever this creature becomes blocked, it gets
 * +N/+N until end of turn for each creature blocking it beyond the first" —
 * counted as the trigger resolves (702.23b). Legends' Aerathi Berserker.
 */
import { describe, expect, it } from "vitest";

import { B, attack, pt, spawn, table } from "./harness.js";

describe("rampage", () => {
  it("gets +N/+N for each blocker beyond the first", () => {
    const { game, a, b } = table();
    const berserker = spawn(game, "Aerathi Berserker");
    const one = spawn(game, "Grizzly Bears", B);
    const two = spawn(game, "Grizzly Bears", B);
    const three = spawn(game, "Grizzly Bears", B);
    b.declareBlockersFn = () => [
      { blocker: one, attacker: berserker },
      { blocker: two, attacker: berserker },
      { blocker: three, attacker: berserker },
    ];
    attack(game, a, [berserker]);
    // Two beyond the first: +6/+6, a 8/10 that survives the Bears' 6.
    expect(pt(game, berserker)).toEqual({ power: 8, toughness: 10 });
    expect(game.state.objects[berserker].zone).toBe("battlefield");
  });

  it("one blocker gives nothing", () => {
    const { game, a, b } = table();
    const berserker = spawn(game, "Aerathi Berserker");
    const one = spawn(game, "Grizzly Bears", B);
    b.declareBlockersFn = () => [{ blocker: one, attacker: berserker }];
    attack(game, a, [berserker]);
    expect(pt(game, berserker)).toEqual({ power: 2, toughness: 4 });
  });
});
