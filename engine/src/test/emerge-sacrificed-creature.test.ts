/**
 * "The sacrificed creature" in a permanent's own enters trigger: the one its
 * spell's emerge cost took (rule 702.119a — `GameObject.enteredPaid`), read
 * as it last existed on the battlefield (Adipose Offspring's ruling); "if
 * its emerge cost was paid" is its entry's `castVia` (gaps key
 * `amount:emerge-sacrificed-creature`).
 */
import { describe, expect, it } from "vitest";

import { A, cast, lands, spawn, table, toHand, tokensNamed, zone } from "./harness.js";

const ALIEN = "Alien Token (Adipose Offspring)";

describe("Adipose Offspring", () => {
  it("makes one Alien when cast for its mana cost", () => {
    const { game } = table();
    lands(game, "Plains", 4);
    const offspring = toHand(game, "Adipose Offspring");
    cast(game, offspring);
    expect(zone(game, offspring)).toBe("battlefield");
    expect(tokensNamed(game, ALIEN, A)).toBe(1);
  });

  it("makes as many as the emerge sacrifice's toughness", () => {
    const { game } = table();
    lands(game, "Plains", 2);
    // Hill Giant, a 3/3 of mana value 4: {5}{W} less 4.
    const giant = spawn(game, "Hill Giant");
    const offspring = toHand(game, "Adipose Offspring");
    cast(game, offspring, { via: "emerge", sacrifice: giant });
    expect(zone(game, giant)).toBe("graveyard");
    expect(tokensNamed(game, ALIEN, A)).toBe(3);
  });

  it("reads that toughness as the creature last was on the battlefield", () => {
    const { game } = table();
    lands(game, "Plains", 4);
    const bears = spawn(game, "Grizzly Bears");
    // +1/+1 from the anthem there, a 2/2 card in the graveyard.
    spawn(game, "Glorious Anthem");
    const offspring = toHand(game, "Adipose Offspring");
    cast(game, offspring, { via: "emerge", sacrifice: bears });
    expect(tokensNamed(game, ALIEN, A)).toBe(3);
  });

  it("forgets the sacrifice once it leaves and comes back", () => {
    const { game } = table();
    lands(game, "Plains", 2);
    const giant = spawn(game, "Hill Giant");
    const offspring = toHand(game, "Adipose Offspring");
    cast(game, offspring, { via: "emerge", sacrifice: giant });
    game.debugMove(offspring, "hand");
    expect(game.state.objects[offspring].enteredPaid).toBeUndefined();
  });
});
