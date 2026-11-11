/**
 * "As an additional cost to cast this spell, blight X. X can't be greater
 * than the greatest toughness among creatures you control" (Soul Immolation):
 * an act as a spell's additional cost that reads X (`additionalCost.also.do`
 * with an `"x"` amount) makes it an X spell without an {X} in its mana cost.
 * X is announced as it's cast (rules 107.3a, 601.2b), capped by the card's
 * `maxX`, and the blight paid at it once the spell is on the stack (601.2h,
 * 701.68a); with no creature there's no blighting (701.68b).
 */

import { describe, expect, it } from "vitest";

import { A, B, C, cast, counters, lands, life, pickPermanents, spawn, table, toHand, zone } from "./harness.js";

const offerOf = (game: ReturnType<typeof table>["game"], name: string) => {
  const offer = game.legalActions(A).find((la) => la.kind === "cast-spell" && la.cardName === name);
  return offer?.kind === "cast-spell" ? offer : undefined;
};

describe("additional cost — blight X (Soul Immolation)", () => {
  it("offers X up to the greatest toughness among the caster's creatures, and refuses more", () => {
    const { game } = table();
    lands(game, "Mountain", 5);
    spawn(game, "Grizzly Bears");
    spawn(game, "Siege Mastodon");
    // An opponent's tougher creature doesn't count.
    spawn(game, "Wall of Stone", B);
    const spell = toHand(game, "Soul Immolation");
    expect(offerOf(game, "Soul Immolation")?.xCost?.maxX).toBe(5);
    expect(game.canDispatch({ type: "cast-spell", player: A, card: spell, targets: [], xValue: 5 })).toBeNull();
    expect(game.canDispatch({ type: "cast-spell", player: A, card: spell, targets: [], xValue: 6 })).not.toBeNull();
  });

  it("can't be cast with no creature to blight (rule 701.68b)", () => {
    const { game } = table();
    lands(game, "Mountain", 5);
    spawn(game, "Grizzly Bears", B);
    const spell = toHand(game, "Soul Immolation");
    expect(offerOf(game, "Soul Immolation")).toBeUndefined();
    expect(game.canDispatch({ type: "cast-spell", player: A, card: spell, targets: [], xValue: 0 })).not.toBeNull();
  });

  it("puts X counters on the creature chosen and deals X to each opponent and their creatures", () => {
    const { game, a } = table({ players: 3 });
    lands(game, "Mountain", 5);
    const bears = spawn(game, "Grizzly Bears");
    const mastodon = spawn(game, "Siege Mastodon");
    const theirBears = spawn(game, "Grizzly Bears", B);
    const theirWall = spawn(game, "Wall of Stone", C);
    const spell = toHand(game, "Soul Immolation");
    // Any creature of the caster's may take them, not only the toughest.
    const seen = pickPermanents(a, mastodon);
    cast(game, spell, { x: 3 });
    expect(seen.offered).toEqual([bears, mastodon]);
    expect(counters(game, mastodon, "-1/-1")).toBe(3);
    expect(counters(game, bears, "-1/-1")).toBe(0);
    expect(life(game, A)).toBe(20);
    expect(life(game, B)).toBe(17);
    expect(life(game, C)).toBe(17);
    expect(zone(game, theirBears)).toBe("graveyard");
    expect(zone(game, theirWall)).toBe("battlefield");
    expect(zone(game, bears)).toBe("battlefield");
    expect(zone(game, spell)).toBe("graveyard");
  });

  it("the blighted creature needn't survive: the cost is paid before the spell resolves", () => {
    const { game, a } = table();
    lands(game, "Mountain", 5);
    const bears = spawn(game, "Grizzly Bears");
    const mastodon = spawn(game, "Siege Mastodon");
    pickPermanents(a, bears);
    cast(game, toHand(game, "Soul Immolation"), { x: 5 });
    expect(zone(game, bears)).toBe("graveyard");
    expect(zone(game, mastodon)).toBe("battlefield");
    expect(life(game, B)).toBe(15);
  });

  it("X may be 0: no counters, no damage, nothing asked", () => {
    const { game, a } = table();
    lands(game, "Mountain", 5);
    const bears = spawn(game, "Grizzly Bears");
    spawn(game, "Siege Mastodon");
    const spell = toHand(game, "Soul Immolation");
    const seen = pickPermanents(a, bears);
    cast(game, spell, { x: 0 });
    expect(seen.offered).toEqual([]);
    expect(counters(game, bears, "-1/-1")).toBe(0);
    expect(life(game, B)).toBe(20);
    expect(zone(game, spell)).toBe("graveyard");
  });
});
