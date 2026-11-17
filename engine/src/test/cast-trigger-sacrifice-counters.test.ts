/**
 * "When you cast this spell, each player sacrifices X creatures. This
 * creature enters with two +1/+1 counters on it for each creature sacrificed
 * this way" (Gluttonous Hellkite): the cast trigger counts what was actually
 * sacrificed and leaves the spell the counters to enter with (the
 * `enters-with-counters` effect, Naya Soulbeast's shape). The trigger
 * resolves before the spell does, and still resolves if the spell has left
 * the stack.
 */
import { describe, expect, it } from "vitest";

import { B, cast, counters, keywords, lands, pt, settle, spawn, table, toHand, tokensNamed, zone } from "./harness.js";

const manaFor = (game: ReturnType<typeof table>["game"], generic: number): void => {
  lands(game, "Swamp", 1);
  lands(game, "Mountain", 1);
  lands(game, "Forest", 1 + generic);
};

describe("Gluttonous Hellkite", () => {
  it("enters with two counters for each creature actually sacrificed, not for X", () => {
    const { game } = table();
    manaFor(game, 4);
    const mine = [spawn(game, "Grizzly Bears"), spawn(game, "Grizzly Bears")];
    const theirs = spawn(game, "Grizzly Bears", B);
    const hellkite = toHand(game, "Gluttonous Hellkite");
    cast(game, hellkite, { x: 2 });
    // Alice sacrifices both her Bears, Bob his only one: three in all.
    for (const id of [...mine, theirs]) expect(zone(game, id)).toBe("graveyard");
    expect(zone(game, hellkite)).toBe("battlefield");
    expect(counters(game, hellkite)).toBe(6);
    expect(pt(game, hellkite)).toEqual({ power: 9, toughness: 9 });
    expect(keywords(game, hellkite).has("flying")).toBe(true);
    expect(keywords(game, hellkite).has("trample")).toBe(true);
  });

  it("counts each token sacrificed from a stack of them", () => {
    const { game } = table();
    manaFor(game, 2);
    game.debugApplyEffect(B, { kind: "create-token", token: "Soldier Token", count: 3 }, []);
    const hellkite = toHand(game, "Gluttonous Hellkite");
    cast(game, hellkite, { x: 1 });
    // Bob sacrifices one Soldier, Alice has no creature to sacrifice.
    expect(tokensNamed(game, "Soldier Token", B)).toBe(2);
    expect(counters(game, hellkite)).toBe(2);
  });

  it("with X of 0 nothing is sacrificed and it enters with no counters", () => {
    const { game } = table();
    manaFor(game, 0);
    const bears = spawn(game, "Grizzly Bears", B);
    const hellkite = toHand(game, "Gluttonous Hellkite");
    cast(game, hellkite, { x: 0 });
    expect(zone(game, bears)).toBe("battlefield");
    expect(zone(game, hellkite)).toBe("battlefield");
    expect(counters(game, hellkite)).toBe(0);
  });

  it("the trigger still makes each player sacrifice if the spell left the stack first", () => {
    const { game } = table();
    manaFor(game, 2);
    const theirs = spawn(game, "Grizzly Bears", B);
    const hellkite = toHand(game, "Gluttonous Hellkite");
    cast(game, hellkite, { x: 1, settle: false });
    // Countered in response (as a counterspell would put it there).
    game.debugMove(hellkite, "graveyard");
    settle(game);
    expect(zone(game, theirs)).toBe("graveyard");
    expect(zone(game, hellkite)).toBe("graveyard");
    expect(game.state.objects[hellkite].entersWithCounters).toBeUndefined();
  });
});
