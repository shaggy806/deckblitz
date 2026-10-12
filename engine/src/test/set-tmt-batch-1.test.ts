/**
 * Teenage Mutant Ninja Turtles (TMT), batch 61's first ten: the clauses of
 * its sneak cards that the mechanic's own file (sneak.test.ts) doesn't cover.
 */
import { describe, expect, it } from "vitest";

import { A, B, attack, keywords, life, lands, settle, spawn, table, toHand, toStep, tokensNamed, watchTargets, zone } from "./harness.js";

describe("Dark Leo & Shredder", () => {
  it("makes a Ninja, then with five Ninjas the player hit loses half their life, rounded up", () => {
    const g = table();
    const { game } = g;
    const leo = spawn(game, "Dark Leo & Shredder");
    for (let i = 0; i < 3; i++) spawn(game, "Ninja Token (Dark Leo & Shredder)");
    // Alice's own life differs, so reading hers instead of bob's would show.
    game.state.players[A].life = 30;
    attack(game, g.a, [leo]);
    // (The three spawned here are cards, not tokens: only the new one counts.)
    // 1 combat damage (19), a fifth Ninja, then half of 19 rounded up: 10.
    expect(tokensNamed(game, "Ninja Token (Dark Leo & Shredder)", A)).toBe(1);
    expect(life(game, B)).toBe(9);
    expect(life(game, A)).toBe(30);
  });

  it("with four Ninjas after the token, no life loss; attacking Ninjas have deathtouch", () => {
    const g = table();
    const { game } = g;
    const leo = spawn(game, "Dark Leo & Shredder");
    const ninja = spawn(game, "Ninja Token (Dark Leo & Shredder)");
    spawn(game, "Ninja Token (Dark Leo & Shredder)");
    expect(keywords(game, ninja).has("deathtouch")).toBe(false);
    g.a.declareAttackersFn = () => [{ attacker: leo, defender: B }];
    toStep(game, "declare-blockers");
    expect(keywords(game, leo).has("deathtouch")).toBe(true);
    expect(keywords(game, ninja).has("deathtouch")).toBe(false);
    toStep(game, "postcombat-main");
    expect(life(game, B)).toBe(19);
  });
});

describe("Elektra, Daughter of the Hand", () => {
  it("destroys an opponent's creature with power 3 or less, not a bigger one", () => {
    const g = table();
    const { game } = g;
    lands(game, "Swamp", 4);
    const bears = spawn(game, "Grizzly Bears", B);
    const giant = spawn(game, "Hill Giant", B);
    const wurm = spawn(game, "Craw Wurm", B);
    const elektra = toHand(game, "Elektra, Daughter of the Hand");
    const seen = watchTargets(g.a, () => [giant]);
    game.dispatch({ type: "cast-spell", player: A, card: elektra, targets: [] });
    settle(game);
    expect(seen.offered[0]).toContain(bears);
    expect(seen.offered[0]).toContain(giant);
    expect(seen.offered[0]).not.toContain(wurm);
    expect(zone(game, giant)).toBe("graveyard");
  });
});
