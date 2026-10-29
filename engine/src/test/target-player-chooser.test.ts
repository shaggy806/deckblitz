/**
 * A chooser named by a target slot (`ChosenPlayerRef`): a `for-each-player`
 * about one targeted player — "target opponent exiles a card from their
 * hand" (Skullcap Snail), where the `look-and-choose` inside is theirs — and
 * a `vote`'s `choose` asked of one targeted player — "target opponent
 * chooses a creature they control. Destroy that creature" (Imperial Edict).
 * Rule 608.2b: with the target gone illegal, nobody chooses.
 */

import { describe, expect, it } from "vitest";

import { A, B, C, cast, enter, hand, lands, pickFromZone, pickPermanents, pickTargets, ref, spawn, table, toHand, zone } from "./harness.js";

describe("a targeted player chooses", () => {
  it("Skullcap Snail: the target opponent picks the card from their own hand", () => {
    const { game, a, b, c } = table({ players: 3 });
    const keep = toHand(game, "Grizzly Bears", B);
    const lose = toHand(game, "Hill Giant", B);
    const carols = toHand(game, "Hill Giant", C);
    const carolHand = hand(game, C).length;
    pickTargets(a, B);
    const seen = pickFromZone(b, lose);
    let carolAsked = false;
    c.chooseFromZoneFn = () => {
      carolAsked = true;
      return [];
    };
    enter(game, "Skullcap Snail", A);
    // Bob's own hand, every card of it, and nobody else's.
    expect(seen.offered).toEqual(expect.arrayContaining([keep, lose]));
    expect(seen.offered).not.toContain(carols);
    expect(seen.offered.length).toBe(hand(game, B).length + 1);
    expect(zone(game, lose)).toBe("exile");
    expect(zone(game, keep)).toBe("hand");
    expect(carolAsked).toBe(false);
    expect(zone(game, carols)).toBe("hand");
    expect(hand(game, C).length).toBe(carolHand);
  });

  it("Imperial Edict: the target opponent chooses which of their creatures is destroyed", () => {
    const { game, b } = table({ players: 3 });
    const bears = spawn(game, "Grizzly Bears", B);
    const giant = spawn(game, "Hill Giant", B);
    const carols = spawn(game, "Hill Giant", C);
    const seen = pickPermanents(b, bears);
    lands(game, "Swamp", 2);
    cast(game, toHand(game, "Imperial Edict"), { targets: [ref(B)] });
    expect(seen.offered).toEqual([bears, giant]);
    expect([zone(game, bears), zone(game, giant), zone(game, carols)]).toEqual(["graveyard", "battlefield", "battlefield"]);
  });
});
