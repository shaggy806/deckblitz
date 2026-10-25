/**
 * Batch 142, the lead's card — Dark Salvation, whose blocker (an illegal
 * player target's information) turned out not to be one: rule 608.2b says
 * that information can't be determined, so the part that needs it doesn't
 * happen.
 */
import { describe, expect, it } from "vitest";

import { A, B, cast, lands, pt, ref, spawn, table, toHand, tokensNamed } from "./harness.js";

describe("Dark Salvation", () => {
  it("gives the target player X Zombies, then shrinks the creature by every Zombie that player controls", () => {
    const { game } = table();
    lands(game, "Swamp", 5);
    spawn(game, "Zombie Token", B); // a Zombie B already controls
    const wurm = spawn(game, "Craw Wurm", A);
    cast(game, toHand(game, "Dark Salvation"), { targets: [ref(B), ref(wurm)], x: 2 });
    expect(tokensNamed(game, "Zombie Token", B)).toBe(2); // the debug-spawned one isn't a token
    expect(tokensNamed(game, "Zombie Token", A)).toBe(0);
    // Craw Wurm is 6/4: B's three Zombies give it -3/-3.
    expect(pt(game, wurm)).toEqual({ power: 3, toughness: 1 });
  });

  it("can be cast with no creature, just for the Zombies", () => {
    const { game } = table();
    lands(game, "Swamp", 3);
    cast(game, toHand(game, "Dark Salvation"), { targets: [ref(A), null], x: 1 });
    expect(tokensNamed(game, "Zombie Token", A)).toBe(1);
  });
});
