/**
 * "Reveal any number of green cards in your hand" — `look-and-choose`'s
 * `"reveal"` destination (rule 701.20a): the chosen cards are revealed and
 * stay in the hand, and `{ thisWay: "revealed" }` counts them for the rest of
 * the resolution. The Urza's Destiny Scents, Rofellos's Gift and Brine Seer.
 */

import { describe, expect, it } from "vitest";

import { A, cast, hand, lands, life, pickFromZone, pt, ref, spawn, table, toGraveyard, toHand, zone } from "./harness.js";

describe("reveal any number of cards from your hand", () => {
  it("Scent of Jasmine gains 2 life per white card revealed, offering only white cards, which stay in hand", () => {
    const { game, a } = table();
    lands(game, "Plains", 1);
    const scent = toHand(game, "Scent of Jasmine");
    const lions = toHand(game, "Savannah Lions");
    const swords = toHand(game, "Swords to Plowshares");
    toHand(game, "Grizzly Bears");
    const seen = pickFromZone(a, lions, swords);
    const before = life(game);
    cast(game, scent);
    expect([...seen.offered].sort()).toEqual([lions, swords].sort());
    expect(life(game)).toBe(before + 4);
    expect(zone(game, lions)).toBe("hand");
    expect(zone(game, swords)).toBe("hand");
    expect(game.state.revealedThisTurn).toContain(lions);
  });

  it("revealing none gains nothing, and with no white card in hand nothing is asked", () => {
    const { game, a } = table();
    lands(game, "Plains", 2);
    toHand(game, "Savannah Lions");
    pickFromZone(a);
    const before = life(game);
    cast(game, toHand(game, "Scent of Jasmine"));
    expect(life(game)).toBe(before);
    // Only a green card left in hand: no choice is offered at all.
    const { game: g2, a: a2 } = table();
    lands(g2, "Plains", 1);
    toHand(g2, "Grizzly Bears");
    let asked = false;
    a2.chooseFromZoneFn = () => {
      asked = true;
      return [];
    };
    cast(g2, toHand(g2, "Scent of Jasmine"));
    expect(asked).toBe(false);
  });

  it("Scent of Ivy gives +X/+X for the green cards revealed", () => {
    const { game, a } = table();
    lands(game, "Forest", 1);
    const bears = spawn(game, "Grizzly Bears");
    const elves = toHand(game, "Llanowar Elves");
    const growth = toHand(game, "Giant Growth");
    pickFromZone(a, elves, growth);
    cast(game, toHand(game, "Scent of Ivy"), { targets: [ref(bears)] });
    expect(pt(game, bears)).toEqual({ power: 4, toughness: 4 });
  });

  it("Scent of Brine counters a spell whose controller can't pay {1} per blue card revealed", () => {
    const { game, a } = table();
    lands(game, "Island", 2);
    lands(game, "Forest", 2);
    const blue = [toHand(game, "Counterspell"), toHand(game, "Brainstorm")];
    const bears = toHand(game, "Grizzly Bears");
    cast(game, bears, { settle: false });
    pickFromZone(a, ...blue);
    cast(game, toHand(game, "Scent of Brine"), { targets: [ref(bears)] });
    // Every land spent: {2} can't be paid.
    expect(zone(game, bears)).toBe("graveyard");
  });

  it("Rofellos's Gift returns one enchantment card per green card revealed, chosen as it resolves", () => {
    const { game, a } = table();
    lands(game, "Forest", 1);
    const pacifism = toGraveyard(game, "Pacifism");
    const rancor = toGraveyard(game, "Rancor");
    const third = toGraveyard(game, "Pacifism");
    const elves = toHand(game, "Llanowar Elves");
    const growth = toHand(game, "Giant Growth");
    let offeredMax = -1;
    let call = 0;
    a.chooseFromZoneFn = (_view, eligible, _min, max) => {
      call += 1;
      if (call === 1) return [elves, growth];
      offeredMax = max;
      expect(eligible).toHaveLength(3);
      return [pacifism, rancor];
    };
    cast(game, toHand(game, "Rofellos's Gift"));
    expect(offeredMax).toBe(2);
    expect(hand(game, A)).toEqual(expect.arrayContaining([pacifism, rancor, elves, growth]));
    expect(zone(game, third)).toBe("graveyard");
  });
});
