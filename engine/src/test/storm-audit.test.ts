import { describe, expect, it } from "vitest";

import { B, cast, lands, life, table, toHand } from "./harness.js";

/**
 * A rules audit (2026-11-26): storm (rule 702.40a) counts the spells cast
 * before it this turn; its copies aren't cast (707.10), so they don't count
 * toward a later storm.
 */
describe("storm, audited", () => {
  it("Opt, Opt, Grapeshot: three instances; a second Grapeshot then has four, the first's copies not counted", () => {
    const { game, a } = table();
    a.chooseTargetsFn = () => [{ kind: "player", player: B }];
    lands(game, "Island", 2);
    lands(game, "Mountain", 4);
    const before = life(game, B);
    cast(game, toHand(game, "Opt"));
    cast(game, toHand(game, "Opt"));
    cast(game, toHand(game, "Grapeshot"), { targets: [{ kind: "player", player: B }] });
    expect(life(game, B)).toBe(before - 3);
    cast(game, toHand(game, "Grapeshot"), { targets: [{ kind: "player", player: B }] });
    expect(life(game, B)).toBe(before - 3 - 4);
  });
});
