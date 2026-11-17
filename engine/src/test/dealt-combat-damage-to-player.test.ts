/**
 * The journal word `dealt-combat-damage-to-player`: each source that dealt
 * combat damage to a player this turn, once however often it did, in the list
 * of whoever controlled it then and read as it was — Excess's "a Treasure
 * token for each creature you controlled that dealt combat damage to a player
 * this turn". With Indulge, its other half: a delayed triggered ability for
 * the rest of the turn (rule 603.7) making a Citizen that's tapped and
 * attacking (rule 508.4) for each creature you control that attacks.
 */
import { describe, expect, it } from "vitest";

import { journalCount } from "../characteristics.js";

import {
  A,
  B,
  attack,
  cast,
  destroy,
  grant,
  lands,
  life,
  nextTurn,
  settle,
  spawn,
  table,
  toGraveyard,
  toHand,
  tokensNamed,
} from "./harness.js";

describe("dealt-combat-damage-to-player", () => {
  it("counts each creature once, double strike or not, and leaves out one that only hit a creature", () => {
    const { game, a, b } = table();
    const [bears, striker, blocked] = ["Grizzly Bears", "Grizzly Bears", "Grizzly Bears"].map((n) => spawn(game, n));
    grant(game, striker, "double-strike");
    const wall = spawn(game, "Wall of Wood", B);
    b.declareBlockersFn = () => [{ blocker: wall, attacker: blocked }];
    attack(game, a, [bears, striker, blocked]);
    expect(life(game, B)).toBe(14);
    expect(journalCount(game.state, game.registry, [A], "dealt-combat-damage-to-player", { type: "creature" }, A)).toBe(2);
    expect(journalCount(game.state, game.registry, [B], "dealt-combat-damage-to-player", undefined, B)).toBe(0);
  });
});

describe("Indulge // Excess", () => {
  it("Indulge: each creature you control that attacks this turn brings a Citizen tapped and attacking", () => {
    const { game, a } = table();
    lands(game, "Mountain", 3);
    const bears = [spawn(game, "Grizzly Bears"), spawn(game, "Grizzly Bears")];
    cast(game, toHand(game, "Indulge // Excess"), { face: 1 });
    attack(game, a, bears);
    expect(tokensNamed(game, "Citizen Token", A)).toBe(2);
    // Two Bears and two Citizens.
    expect(life(game, B)).toBe(14);
  });

  it("Indulge lasts only this turn", () => {
    const { game, a } = table();
    lands(game, "Mountain", 3);
    const bears = spawn(game, "Grizzly Bears");
    cast(game, toHand(game, "Indulge // Excess"), { face: 1 });
    nextTurn(game);
    attack(game, a, [bears]);
    expect(tokensNamed(game, "Citizen Token", A)).toBe(0);
    expect(life(game, B)).toBe(18);
  });

  it("Excess: a Treasure for each creature you controlled that dealt combat damage to a player, gone since or not", () => {
    const { game, a } = table();
    lands(game, "Mountain", 2);
    const bears = [spawn(game, "Grizzly Bears"), spawn(game, "Grizzly Bears"), spawn(game, "Grizzly Bears")];
    grant(game, bears[0], "double-strike");
    attack(game, a, bears.slice(0, 2));
    destroy(game, bears[1]);
    settle(game);
    cast(game, toGraveyard(game, "Indulge // Excess"), { face: 2, via: "aftermath" });
    expect(tokensNamed(game, "Treasure Token", A)).toBe(2);
  });
});
