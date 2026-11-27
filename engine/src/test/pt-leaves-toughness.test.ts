/**
 * "Gets -X/-Y … Y is equal to X or to enchanted creature's toughness minus 1,
 * whichever is smaller" (Snowblind — `grantPtPerCount.leavesToughness`): the
 * toughness taken is capped so 1 is left, read after every other P/T change
 * (it depends on them, rule 613.8a); and `forDefendingPlayer: "affected"`
 * counts the enchanted creature's defending player's snow lands while it
 * attacks, its controller's otherwise.
 */
import { describe, expect, it } from "vitest";

import { B, cast, lands, pt, ref, spawn, table, toHand, toStep } from "./harness.js";

describe("Snowblind", () => {
  it("not attacking: its controller's snow lands, toughness never below 1", () => {
    const { game } = table();
    lands(game, "Forest", 5);
    lands(game, "Snow-Covered Forest", 3); // alice's: not counted
    lands(game, "Snow-Covered Forest", 1, B);
    const bears = spawn(game, "Grizzly Bears", B);
    cast(game, toHand(game, "Snowblind"), { targets: [ref(bears)] });
    expect(pt(game, bears)).toEqual({ power: 1, toughness: 1 });
    lands(game, "Snow-Covered Forest", 2, B);
    // X = 3; Y = min(3, 2 - 1) = 1.
    expect(pt(game, bears)).toEqual({ power: -1, toughness: 1 });
  });

  it("reads the toughness after a later pump, which it depends on", () => {
    const { game } = table();
    lands(game, "Forest", 5);
    lands(game, "Snow-Covered Forest", 3, B);
    const bears = spawn(game, "Grizzly Bears", B);
    cast(game, toHand(game, "Snowblind"), { targets: [ref(bears)] });
    expect(pt(game, bears)).toEqual({ power: -1, toughness: 1 });
    cast(game, toHand(game, "Giant Growth"), { targets: [ref(bears)] });
    // 5/5 after Giant Growth, then -3/-min(3, 4).
    expect(pt(game, bears)).toEqual({ power: 2, toughness: 2 });
  });

  it("attacking: the defending player's snow lands", () => {
    const t = table();
    const { game } = t;
    lands(game, "Forest", 4);
    lands(game, "Snow-Covered Forest", 2, B);
    const wurm = spawn(game, "Craw Wurm");
    cast(game, toHand(game, "Snowblind"), { targets: [ref(wurm)] });
    expect(pt(game, wurm)).toEqual({ power: 6, toughness: 4 });
    t.a.declareAttackersFn = () => [{ attacker: wurm, defender: B }];
    toStep(game, "declare-blockers");
    expect(game.state.objects[wurm].attacking).toBe(B);
    expect(pt(game, wurm)).toEqual({ power: 4, toughness: 2 });
  });
});
