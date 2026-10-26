/**
 * Saviors of Kamigawa / Betrayers of Kamigawa (B202) — group C.
 */
import { describe, expect, it } from "vitest";

import { poolCounts } from "../mana.js";
import type { ObjectId } from "../primitives.js";
import {
  A,
  B,
  activate,
  attack,
  blockOffer,
  cast,
  destroy,
  graveyard,
  hand,
  keywords,
  lands,
  nextTurn,
  pickModes,
  pt,
  ref,
  spawn,
  table,
  toGraveyard,
  toHand,
  tokensNamed,
  types,
  zone,
} from "./harness.js";

describe("Feral Lightning", () => {
  it("makes three hasty 3/1 Elementals that are exiled at the next end step", () => {
    const { game } = table();
    lands(game, "Mountain", 6);
    cast(game, toHand(game, "Feral Lightning"));
    expect(tokensNamed(game, "3/1 Red Elemental Token (Haste)", A)).toBe(3);
    nextTurn(game);
    expect(tokensNamed(game, "3/1 Red Elemental Token (Haste)")).toBe(0);
  });
});

describe("Razorjaw Oni", () => {
  it("stops black creatures — any player's — from blocking", () => {
    const { game, a } = table();
    spawn(game, "Razorjaw Oni", A);
    const theirOni = spawn(game, "Razorjaw Oni", B);
    const theirBears = spawn(game, "Grizzly Bears", B);
    const attacker = spawn(game, "Grizzly Bears", A);
    const offer = blockOffer(game, a, [attacker]);
    const canBlock = (id: ObjectId): readonly ObjectId[] => offer.eligible.find((e) => e.blocker === id)?.canBlock ?? [];
    expect(canBlock(theirOni)).toEqual([]);
    expect(canBlock(theirBears)).toEqual([attacker]);
  });
});

describe("Mark of Sakiko", () => {
  it("adds {G} equal to the combat damage dealt, kept through the end of combat", () => {
    const { game, a } = table();
    const bears = spawn(game, "Grizzly Bears", A);
    lands(game, "Forest", 2);
    cast(game, toHand(game, "Mark of Sakiko"), { targets: [ref(bears)] });
    attack(game, a, [bears]);
    expect(poolCounts(game.state.players[A].manaPool).G).toBe(2);
  });
});

describe("Traproot Kami", () => {
  it("counts every Forest on the battlefield, not just its controller's", () => {
    const { game } = table();
    const kami = spawn(game, "Traproot Kami");
    lands(game, "Forest", 2, A);
    lands(game, "Forest", 3, B);
    expect(pt(game, kami)).toEqual({ power: 0, toughness: 5 });
  });
});

describe("In the Web of War", () => {
  it("gives each creature entering under its controller +2/+0 and haste", () => {
    const { game } = table();
    spawn(game, "In the Web of War");
    lands(game, "Forest", 2);
    const card = toHand(game, "Grizzly Bears");
    cast(game, card);
    expect(pt(game, card)).toEqual({ power: 4, toughness: 2 });
    expect(keywords(game, card).has("haste")).toBe(true);
  });
});

describe("Stir the Grave", () => {
  it("returns a creature card with mana value X or less", () => {
    const { game } = table();
    lands(game, "Swamp", 3);
    const bears = toGraveyard(game, "Grizzly Bears");
    const giant = toGraveyard(game, "Hill Giant");
    const spell = toHand(game, "Stir the Grave");
    cast(game, spell, { x: 2, targets: [ref(bears)] });
    expect(zone(game, bears)).toBe("battlefield");
    expect(zone(game, giant)).toBe("graveyard");
  });
});

describe("Ronin Cliffrider", () => {
  it("may deal 1 damage to each creature the defending player controls as it attacks", () => {
    const { game, a } = table();
    const ronin = spawn(game, "Ronin Cliffrider");
    const mine = spawn(game, "Llanowar Elves", A);
    const elves = spawn(game, "Llanowar Elves", B);
    const bears = spawn(game, "Grizzly Bears", B);
    pickModes(a, 0);
    attack(game, a, [ronin]);
    expect(zone(game, elves)).toBe("graveyard");
    expect(zone(game, bears)).toBe("battlefield");
    expect(zone(game, mine)).toBe("battlefield");
  });
});

describe("Isao, Enlightened Bushi", () => {
  it("regenerates only a Samurai", () => {
    const { game } = table();
    const isao = spawn(game, "Isao, Enlightened Bushi");
    const bears = spawn(game, "Grizzly Bears");
    lands(game, "Forest", 2);
    expect(
      game.canDispatch({ type: "activate-ability", player: A, source: isao, abilityIndex: 0, targets: [ref(bears)] }),
    ).not.toBeNull();
    activate(game, isao, 0, { targets: [ref(isao)] });
    destroy(game, isao);
    expect(zone(game, isao)).toBe("battlefield");
  });
});

describe("Genju of the Spires", () => {
  it("animates the enchanted Mountain, and returns to hand when that Mountain goes to the graveyard", () => {
    const { game, a } = table();
    const mountain = spawn(game, "Mountain");
    lands(game, "Mountain", 3);
    const genju = toHand(game, "Genju of the Spires");
    cast(game, genju, { targets: [ref(mountain)] });
    expect(zone(game, genju)).toBe("battlefield");
    activate(game, genju);
    expect(pt(game, mountain)).toEqual({ power: 6, toughness: 1 });
    expect(types(game, mountain)).toEqual(expect.arrayContaining(["land", "creature"]));
    pickModes(a, 0);
    destroy(game, mountain);
    expect(graveyard(game, A)).toContain(mountain);
    expect(hand(game, A)).toContain(genju);
  });
});
