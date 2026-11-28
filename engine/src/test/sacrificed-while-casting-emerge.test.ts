/**
 * "When you sacrifice this creature while casting a spell with emerge"
 * (Foul Emissary): a `sacrifice` trigger with `whileCasting: "emerge"`,
 * which fires only for a sacrifice made while its controller is casting a
 * spell that has emerge (rule 702.119a; gaps key
 * `trigger:sacrificed-for-emerge`).
 */
import { describe, expect, it } from "vitest";

import { A, cast, lands, settle, spawn, table, toHand, tokensNamed, zone } from "./harness.js";

const HORROR = "Eldrazi Horror Token";

describe("Foul Emissary", () => {
  it("makes a 3/2 Horror when sacrificed for an emerge cost", () => {
    const { game } = table();
    lands(game, "Island", 3);
    const emissary = spawn(game, "Foul Emissary");
    const gryff = toHand(game, "Wretched Gryff");
    // {5}{U} less Foul Emissary's mana value 3.
    cast(game, gryff, { via: "emerge", sacrifice: emissary });
    settle(game);
    expect(zone(game, emissary)).toBe("graveyard");
    expect(zone(game, gryff)).toBe("battlefield");
    expect(tokensNamed(game, HORROR, A)).toBe(1);
  });

  it("makes nothing when sacrificed casting a spell without emerge", () => {
    const { game } = table();
    lands(game, "Swamp", 1);
    const emissary = spawn(game, "Foul Emissary");
    const rites = toHand(game, "Village Rites");
    cast(game, rites, { sacrifice: emissary });
    settle(game);
    expect(zone(game, emissary)).toBe("graveyard");
    expect(tokensNamed(game, HORROR, A)).toBe(0);
  });

  it("makes nothing when another creature is the one sacrificed", () => {
    const { game } = table();
    lands(game, "Island", 3);
    spawn(game, "Foul Emissary");
    const bears = spawn(game, "Hill Giant");
    const gryff = toHand(game, "Wretched Gryff");
    cast(game, gryff, { via: "emerge", sacrifice: bears });
    settle(game);
    expect(zone(game, bears)).toBe("graveyard");
    expect(tokensNamed(game, HORROR, A)).toBe(0);
  });
});
