/**
 * Freerunning (rule 702.173a): an alternative cost a player may pay once a
 * player was dealt combat damage this turn by a creature that, as it dealt
 * it, was an Assassin creature or a commander under their control — and for
 * the rest of that turn, whatever happens to that creature (the ruling).
 */
import { describe, expect, it } from "vitest";

import type { Game } from "../game.js";
import type { ObjectId } from "../primitives.js";
import { A, B, attack, cast, destroy, hand, lands, pickPermanents, ref, spawn, table, toHand, zone } from "./harness.js";

const offers = (game: Game, card: ObjectId) =>
  game.legalActions(A).filter((a) => a.kind === "cast-spell" && a.card === card && a.via === "freerunning");

describe("freerunning", () => {
  it("Eagle Vision for {1}{U} after an Assassin dealt a player combat damage, not before", () => {
    const { game, a } = table();
    lands(game, "Island", 2);
    const vision = toHand(game, "Eagle Vision");
    expect(offers(game, vision)).toHaveLength(0);
    const blade = spawn(game, "Hired Blade");
    attack(game, a, [blade]);
    // Gone since: it doesn't matter (the ruling).
    destroy(game, blade);
    expect(offers(game, vision)).toHaveLength(1);
    const before = hand(game, A).length;
    cast(game, vision, { via: "freerunning" });
    expect(zone(game, vision)).toBe("graveyard");
    expect(hand(game, A).length).toBe(before - 1 + 3);
  });

  it("a non-Assassin's combat damage doesn't, nor an opponent's Assassin's", () => {
    const { game, a } = table();
    lands(game, "Island", 2);
    const vision = toHand(game, "Eagle Vision");
    attack(game, a, [spawn(game, "Grizzly Bears")]);
    expect(offers(game, vision)).toHaveLength(0);
    spawn(game, "Hired Blade", B);
    expect(offers(game, vision)).toHaveLength(0);
  });

  it("a commander's combat damage does", () => {
    const { game, a } = table();
    lands(game, "Island", 2);
    const vision = toHand(game, "Eagle Vision");
    const bears = spawn(game, "Grizzly Bears");
    game.state.objects[bears].isCommander = true;
    attack(game, a, [bears]);
    expect(offers(game, vision)).toHaveLength(1);
  });
});

describe("a freerunning cost that isn't mana (`freerunning.also`) — Escape Detection", () => {
  it("returns a blue creature you control as its cost: no mana spent, the target bounced, a card drawn", () => {
    const { game, a } = table();
    const looter = spawn(game, "Merfolk Looter");
    const bears = spawn(game, "Grizzly Bears", B);
    const escape = toHand(game, "Escape Detection");
    attack(game, a, [spawn(game, "Hired Blade")]);
    expect(offers(game, escape)).toHaveLength(1);
    const before = hand(game, A).length;
    cast(game, escape, { via: "freerunning", targets: [ref(bears)] });
    expect(zone(game, looter)).toBe("hand");
    expect(zone(game, bears)).toBe("hand");
    expect(zone(game, escape)).toBe("graveyard");
    // The spell left the hand, the Looter came back, a card drawn.
    expect(hand(game, A).length).toBe(before - 1 + 1 + 1);
  });

  it("isn't offered without a blue creature to return, nor before an Assassin's combat damage", () => {
    const { game, a } = table();
    spawn(game, "Grizzly Bears", B);
    const escape = toHand(game, "Escape Detection");
    spawn(game, "Merfolk Looter", B); // an opponent's: not one you control
    attack(game, a, [spawn(game, "Hired Blade")]);
    expect(offers(game, escape)).toHaveLength(0);

    const second = table();
    spawn(second.game, "Merfolk Looter");
    spawn(second.game, "Grizzly Bears", B);
    const other = toHand(second.game, "Escape Detection");
    expect(offers(second.game, other)).toHaveLength(0);
  });

  it("with two blue creatures, which one is chosen as the cost is paid", () => {
    const { game, a } = table();
    const looter = spawn(game, "Merfolk Looter");
    const warrior = spawn(game, "Phantom Warrior");
    const bears = spawn(game, "Grizzly Bears", B);
    const escape = toHand(game, "Escape Detection");
    attack(game, a, [spawn(game, "Hired Blade")]);
    const seen = pickPermanents(a, warrior);
    cast(game, escape, { via: "freerunning", targets: [ref(bears)] });
    expect(seen.offered).toEqual(expect.arrayContaining([looter, warrior]));
    expect(zone(game, warrior)).toBe("hand");
    expect(zone(game, looter)).toBe("battlefield");
    expect(zone(game, bears)).toBe("hand");
  });

  it("returning its own target as the cost leaves it no legal target: no card drawn", () => {
    const { game, a } = table();
    const looter = spawn(game, "Merfolk Looter");
    const escape = toHand(game, "Escape Detection");
    attack(game, a, [spawn(game, "Hired Blade")]);
    const before = hand(game, A).length;
    cast(game, escape, { via: "freerunning", targets: [ref(looter)] });
    expect(zone(game, looter)).toBe("hand");
    expect(hand(game, A).length).toBe(before - 1 + 1);
  });

  it("cast for its mana cost, nothing is returned", () => {
    const { game } = table();
    const looter = spawn(game, "Merfolk Looter");
    const bears = spawn(game, "Grizzly Bears", B);
    lands(game, "Island", 3);
    cast(game, toHand(game, "Escape Detection"), { targets: [ref(bears)] });
    expect(zone(game, looter)).toBe("battlefield");
    expect(zone(game, bears)).toBe("hand");
  });
});
