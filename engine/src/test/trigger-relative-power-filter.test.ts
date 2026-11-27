/**
 * A block trigger's filter compared against the other creature of the block
 * (No Quarter): `blocked-by`'s attacker `filter` reads the blocker — the
 * trigger object — as `"trigger-object"`, and `blocks` with `object:
 * "blocked"` has its blocker `filter` read the creature it blocks. Each pair
 * is its own trigger (rules 509.3b, 509.3c), its powers compared as the block
 * is declared.
 */
import { describe, expect, it } from "vitest";

import { B, blockOffer, life, spawn, table, toStep, zone } from "./harness.js";

describe("No Quarter", () => {
  it("destroys a blocker with lesser power than the creature it blocks", () => {
    const { game, a, b } = table();
    spawn(game, "No Quarter", B);
    const giant = spawn(game, "Hill Giant"); // 3/3
    const bears = spawn(game, "Grizzly Bears", B); // 2/2
    blockOffer(game, a, [giant]);
    b.declareBlockersFn = () => [{ blocker: bears, attacker: giant }];
    toStep(game, "postcombat-main");
    expect(zone(game, bears)).toBe("graveyard");
    expect(zone(game, giant)).toBe("battlefield");
    expect(game.state.objects[giant].damageMarked).toBe(0); // destroyed before damage
    expect(life(game, B)).toBe(20); // the Giant stays blocked
  });

  it("destroys an attacker with lesser power than its blocker", () => {
    const { game, a, b } = table();
    spawn(game, "No Quarter");
    const bears = spawn(game, "Grizzly Bears"); // 2/2
    const giant = spawn(game, "Hill Giant", B); // 3/3
    blockOffer(game, a, [bears]);
    b.declareBlockersFn = () => [{ blocker: giant, attacker: bears }];
    toStep(game, "postcombat-main");
    expect(zone(game, bears)).toBe("graveyard");
    expect(zone(game, giant)).toBe("battlefield");
    expect(game.state.objects[giant].damageMarked).toBe(0);
  });

  it("judges each pair of a double block, and leaves equal powers alone", () => {
    const { game, a, b } = table();
    spawn(game, "No Quarter");
    const giant = spawn(game, "Hill Giant"); // 3/3
    const other = spawn(game, "Hill Giant", B); // 3/3, equal
    const bears = spawn(game, "Grizzly Bears", B); // 2/2, lesser
    blockOffer(game, a, [giant]);
    b.declareBlockersFn = () => [
      { blocker: other, attacker: giant },
      { blocker: bears, attacker: giant },
    ];
    // Every No Quarter trigger put on the stack, by the creature it names:
    // the Bears' alone (combat damage then trades the two Giants).
    const named = new Set<string>();
    game.advanceUntil((s) => {
      for (const id of s.zones.shared.stack) {
        const named_ = s.objects[id]?.triggerObject;
        if (named_ !== undefined) named.add(named_);
      }
      return s.turn.step === "postcombat-main";
    });
    expect([...named]).toEqual([bears]);
    expect(zone(game, bears)).toBe("graveyard");
    expect(zone(game, other)).toBe("graveyard");
  });
});
