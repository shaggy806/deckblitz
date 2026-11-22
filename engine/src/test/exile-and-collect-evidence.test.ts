/**
 * "You may exile it and collect evidence 4. If you do, return this card to the
 * battlefield tapped" (Lamplight Phoenix): the `collect-evidence` effect's
 * `exiling` — one action, offered only while the card is still in its owner's
 * graveyard and the rest of the graveyard holds the total (rule 701.59b); the
 * card itself is never evidence (the ruling), and once chosen the collecting
 * can't be declined.
 */
import { describe, expect, it } from "vitest";

import { A, B, destroy, pickFromZone, ref, spawn, table, toGraveyard, zone } from "./harness.js";

describe("exile it and collect evidence (Lamplight Phoenix)", () => {
  it("exiles the Phoenix and the evidence, then returns it tapped", () => {
    const { game, a } = table();
    const phoenix = spawn(game, "Lamplight Phoenix");
    const giant = toGraveyard(game, "Hill Giant"); // mana value 4
    const seen = pickFromZone(a, giant);
    a.chooseModesFn = () => [0];
    destroy(game, phoenix);
    expect(zone(game, giant)).toBe("exile");
    expect(seen.offered).not.toContain(phoenix);
    expect(zone(game, phoenix)).toBe("battlefield");
    expect(game.state.objects[phoenix].tapped).toBe(true);
    expect(game.state.objects[phoenix].controller).toBe(A);
  });

  it("isn't offered when only the Phoenix itself would make the total", () => {
    const { game, a } = table();
    const phoenix = spawn(game, "Lamplight Phoenix");
    const bear = toGraveyard(game, "Grizzly Bears"); // 2, +3 for the Phoenix would be 5
    const seen = pickFromZone(a, bear);
    let asked = 0;
    a.chooseModesFn = () => {
      asked += 1;
      return [0];
    };
    destroy(game, phoenix);
    expect(asked).toBe(0);
    expect(seen.offered).toEqual([]);
    expect(zone(game, phoenix)).toBe("graveyard");
    expect(zone(game, bear)).toBe("graveyard");
  });

  it("declined: the Phoenix stays in the graveyard and nothing is exiled", () => {
    const { game, a } = table();
    const phoenix = spawn(game, "Lamplight Phoenix");
    const giant = toGraveyard(game, "Hill Giant");
    a.chooseModesFn = () => [];
    destroy(game, phoenix);
    expect(zone(game, phoenix)).toBe("graveyard");
    expect(zone(game, giant)).toBe("graveyard");
  });

  it("stolen: its controller collects from their own graveyard and gets it back under their control (rule 110.2a)", () => {
    const { game, a, b } = table();
    const phoenix = spawn(game, "Lamplight Phoenix");
    game.debugApplyEffect(B, { kind: "gain-control", target: 0, untilEndOfTurn: false }, [ref(phoenix)]);
    const aliceGiant = toGraveyard(game, "Hill Giant", A);
    const bobGiant = toGraveyard(game, "Hill Giant", B);
    let aliceAsked = 0;
    a.chooseModesFn = () => {
      aliceAsked += 1;
      return [0];
    };
    const seen = pickFromZone(b, bobGiant);
    b.chooseModesFn = () => [0];
    destroy(game, phoenix, A);
    expect(aliceAsked).toBe(0);
    expect(seen.offered).not.toContain(aliceGiant);
    expect(zone(game, bobGiant)).toBe("exile");
    expect(zone(game, aliceGiant)).toBe("graveyard");
    expect(zone(game, phoenix)).toBe("battlefield");
    expect(game.state.objects[phoenix].controller).toBe(B);
    expect(game.state.objects[phoenix].owner).toBe(A);
    expect(game.state.objects[phoenix].tapped).toBe(true);
  });

  it("stolen: the owner's graveyard isn't the thief's evidence", () => {
    const { game, b } = table();
    const phoenix = spawn(game, "Lamplight Phoenix");
    game.debugApplyEffect(B, { kind: "gain-control", target: 0, untilEndOfTurn: false }, [ref(phoenix)]);
    toGraveyard(game, "Hill Giant", A);
    let asked = 0;
    b.chooseModesFn = () => {
      asked += 1;
      return [0];
    };
    destroy(game, phoenix, A);
    expect(asked).toBe(0);
    expect(zone(game, phoenix)).toBe("graveyard");
    expect(game.state.zones.perPlayer[A].graveyard).toContain(phoenix);
  });
});
