/**
 * Who creates a token, and what reads it. A token enters under the control of
 * the player who creates it (rule 111.2), so "whenever you create a token" is a
 * token entering under you (Mirkwood Bats, Akim, the Soaring Wind) — and Crafty
 * Cutpurse's "each token that would be created under an opponent's control this
 * turn is created under your control instead" changes who that is (rule 614.1a).
 */
import { describe, expect, it } from "vitest";

import {
  A,
  B,
  C,
  D,
  attack,
  enter,
  keywords,
  life,
  lands,
  named,
  nextTurn,
  activate,
  ref,
  settle,
  spawn,
  table,
  tokensNamed,
} from "./harness.js";
import type { Game } from "../game.js";
import type { PlayerId } from "../primitives.js";

const soldiers = (game: Game, player: PlayerId, count = 1): void => {
  game.debugApplyEffect(player, { kind: "create-token", token: "Soldier Token", count }, []);
  settle(game);
};

describe("Crafty Cutpurse", () => {
  it("takes an opponent's tokens for the rest of the turn, and no longer", () => {
    const { game } = table();
    soldiers(game, B);
    expect(tokensNamed(game, "Soldier Token", B)).toBe(1);
    enter(game, "Crafty Cutpurse", A);
    soldiers(game, B, 2);
    expect(tokensNamed(game, "Soldier Token", B)).toBe(1); // it doesn't take what's there
    expect(tokensNamed(game, "Soldier Token", A)).toBe(2);
    // Its controller's own are unchanged.
    soldiers(game, A);
    expect(tokensNamed(game, "Soldier Token", A)).toBe(3);

    nextTurn(game);
    soldiers(game, B);
    expect(tokensNamed(game, "Soldier Token", B)).toBe(2);
  });

  it("applies first: the token's new controller's doublers count, and not the old one's", () => {
    const { game } = table();
    spawn(game, "Anointed Procession", B);
    enter(game, "Crafty Cutpurse", A);
    soldiers(game, B);
    expect(tokensNamed(game, "Soldier Token", A)).toBe(1);
    spawn(game, "Anointed Procession", A);
    soldiers(game, B);
    expect(tokensNamed(game, "Soldier Token", A)).toBe(3);
    expect(tokensNamed(game, "Soldier Token", B)).toBe(0);
  });

  it("with one on each side, each applies once and the token stays with who'd have created it", () => {
    const { game } = table();
    enter(game, "Crafty Cutpurse", A);
    enter(game, "Crafty Cutpurse", B);
    soldiers(game, A);
    expect(tokensNamed(game, "Soldier Token", A)).toBe(1);
    soldiers(game, B);
    expect(tokensNamed(game, "Soldier Token", B)).toBe(1);
  });

  it("two of one player's are no more than one", () => {
    const { game } = table();
    enter(game, "Crafty Cutpurse", A);
    enter(game, "Crafty Cutpurse", A);
    soldiers(game, B);
    expect(tokensNamed(game, "Soldier Token", A)).toBe(1);
  });

  it("in a four-player game, ends with the last of them", () => {
    const { game } = table({ players: 4 });
    enter(game, "Crafty Cutpurse", B);
    enter(game, "Crafty Cutpurse", C);
    soldiers(game, D);
    // Dave's goes to the first after him in turn order (alice has none, so
    // bob), then on to carol, whose opponent bob now is. Carol's is used up.
    expect(tokensNamed(game, "Soldier Token", D)).toBe(0);
    expect(tokensNamed(game, "Soldier Token", B) + tokensNamed(game, "Soldier Token", C)).toBe(1);
    expect(tokensNamed(game, "Soldier Token", C)).toBe(1);
  });

  it("makes a token created attacking only tapped, under a player who isn't attacking", () => {
    const { game, a } = table();
    const garrison = spawn(game, "Hanweir Garrison", A);
    enter(game, "Crafty Cutpurse", B);
    attack(game, a, [garrison]);
    const humans = named(game, "Red Human Token", B);
    expect(humans.length).toBeGreaterThan(0);
    expect(game.state.objects[humans[0]].tapped).toBe(true);
    expect(game.state.objects[humans[0]].attacking).toBeNull();
    expect(life(game, B)).toBe(20 - 2);
  });

  it("a token copy is redirected too", () => {
    const { game } = table();
    const bears = spawn(game, "Grizzly Bears", B);
    enter(game, "Crafty Cutpurse", A);
    game.debugApplyEffect(B, { kind: "create-token-copy", of: 0, count: 1 }, [ref(bears)]);
    settle(game);
    expect(named(game, "Grizzly Bears", A).length).toBe(1);
    expect(named(game, "Grizzly Bears", B).length).toBe(1);
  });
});

describe("whenever you create or sacrifice a token (Mirkwood Bats)", () => {
  it("loses each opponent 1 per token created, and per token sacrificed; not an opponent's", () => {
    const { game } = table({ players: 3 });
    spawn(game, "Mirkwood Bats", A);
    soldiers(game, A, 2);
    expect(life(game, B)).toBe(life(game, A) - 2);
    expect(life(game, C)).toBe(life(game, A) - 2);
    const before = life(game, B);
    soldiers(game, B);
    expect(life(game, B)).toBe(before);
    game.debugApplyEffect(A, { kind: "sacrifice-target", target: 0 }, [ref(named(game, "Soldier Token", A)[0])]);
    settle(game);
    expect(life(game, B)).toBe(before - 1);
  });

  it("counts a token Crafty Cutpurse brought over: its controller created it", () => {
    const { game } = table();
    spawn(game, "Mirkwood Bats", A);
    enter(game, "Crafty Cutpurse", A);
    const before = life(game, B);
    soldiers(game, B);
    expect(life(game, B)).toBe(before - 1);
  });
});

describe("whenever you create one or more tokens for the first time each turn (Akim, the Soaring Wind)", () => {
  it("fires for the first creation of the turn only, however many tokens it made", () => {
    const { game } = table();
    spawn(game, "Akim, the Soaring Wind", A);
    soldiers(game, A, 2);
    expect(tokensNamed(game, "Bird Token", A)).toBe(1); // the Bird is a later creation: it doesn't fire again
    soldiers(game, A);
    expect(tokensNamed(game, "Bird Token", A)).toBe(1);
    soldiers(game, B);
    expect(tokensNamed(game, "Bird Token", A)).toBe(1);

    nextTurn(game);
    soldiers(game, A);
    expect(tokensNamed(game, "Bird Token", A)).toBe(2);
  });

  it("an earlier creation this turn uses it up, Akim there or not", () => {
    const { game } = table();
    soldiers(game, A);
    spawn(game, "Akim, the Soaring Wind", A);
    soldiers(game, A);
    expect(tokensNamed(game, "Bird Token", A)).toBe(0);
  });

  it("its activated ability gives creature tokens double strike, and nothing else", () => {
    const { game } = table();
    const akim = spawn(game, "Akim, the Soaring Wind", A);
    soldiers(game, A);
    lands(game, "Island", 1);
    lands(game, "Mountain", 1);
    lands(game, "Plains", 4);
    activate(game, akim);
    expect(keywords(game, named(game, "Soldier Token", A)[0]).has("double-strike")).toBe(true);
    expect(keywords(game, akim).has("double-strike")).toBe(false);
  });
});
