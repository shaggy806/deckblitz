/**
 * Revealing from a hand (rule 701.20a), every shape of it: the whole hand
 * (`reveal-hand`: Thoughtcutter Agent, Search Warrant), a card at random
 * (`choose-random-card`'s `show: "reveal"`: Merfolk Spy, Planeswalker's Fury),
 * and up to N cards the player chooses (`look-and-choose`'s `destination:
 * "reveal"`: Armored Kincaller, Vault 21: House Gambit) with a count over the
 * revealed set (`thisWay: "revealed"`, `sharingManaValue`).
 */
import { describe, expect, it } from "vitest";

import type { Game } from "../game.js";
import type { ObjectId, PlayerId } from "../primitives.js";
import {
  A,
  B,
  activate,
  attack,
  cast,
  enter,
  hand,
  life,
  lands,
  nextTurn,
  pickFromZone,
  ref,
  settle,
  spawn,
  table,
  toHand,
  tokensNamed,
  zone,
} from "./harness.js";

/** What this game has revealed from a hand, oldest first. */
const revealed = (game: Game): readonly { readonly player: PlayerId; readonly objects: readonly ObjectId[] }[] =>
  game.eventsOfType("cards-revealed").filter((e) => e.from === "hand");

describe("a whole hand revealed", () => {
  it("Thoughtcutter Agent: the life is lost and every card shown, and they stay in the hand", () => {
    const { game } = table();
    const agent = spawn(game, "Thoughtcutter Agent");
    lands(game, "Underground Sea", 2);
    const one = toHand(game, "Lightning Bolt", B);
    const two = toHand(game, "Mountain", B);
    activate(game, agent, 0, { targets: [ref(B)] });
    expect(life(game, B)).toBe(19);
    expect(revealed(game).at(-1)?.objects).toEqual(expect.arrayContaining([one, two]));
    expect(hand(game, B)).toContain(one);
    expect(hand(game, B)).toContain(two);
    expect(game.state.objects[agent].tapped).toBe(true);
  });

  it("Search Warrant: the gain counts that player's hand, not yours", () => {
    const { game } = table();
    lands(game, "Tundra", 2);
    const warrant = toHand(game, "Search Warrant");
    toHand(game, "Lightning Bolt");
    const before = hand(game, B).length;
    toHand(game, "Lightning Bolt", B);
    toHand(game, "Lightning Bolt", B);
    cast(game, warrant, { targets: [ref(B)] });
    expect(life(game)).toBe(20 + before + 2);
    expect(revealed(game)).toHaveLength(1);
    expect(revealed(game)[0].player).toBe(B);
  });
});

describe("a card revealed at random", () => {
  it("Merfolk Spy: the player it hit shows one card, which stays", () => {
    const { game, a } = table();
    const spy = spawn(game, "Merfolk Spy");
    const only = toHand(game, "Lightning Bolt", B);
    const held = new Set(hand(game, B));
    attack(game, a, [spy]);
    settle(game);
    expect(life(game, B)).toBe(19);
    const shown = revealed(game).at(-1);
    expect(shown?.player).toBe(B);
    expect(shown?.objects).toHaveLength(1);
    expect(held.has(shown?.objects[0] as ObjectId)).toBe(true);
    expect(hand(game, B)).toContain(only);
  });

  it("Planeswalker's Fury: damage to that player equal to the card's mana value", () => {
    const { game } = table();
    // Nothing but the one card in the hand, so the random pick is that card.
    for (const id of [...hand(game, B)]) game.state.objects[id].zone = "exile";
    game.state.zones.perPlayer[B].hand = [];
    const fury = spawn(game, "Planeswalker's Fury");
    lands(game, "Mountain", 4);
    const card = toHand(game, "Grizzly Bears", B);
    activate(game, fury, 0, { targets: [ref(B)] });
    expect(revealed(game).at(-1)?.objects).toEqual([card]);
    expect(life(game, B)).toBe(18);
    expect(zone(game, card)).toBe("hand");
  });

  it("Planeswalker's Fury: an empty hand reveals nothing and deals nothing", () => {
    const { game } = table();
    game.state.zones.perPlayer[B].hand = [];
    const fury = spawn(game, "Planeswalker's Fury");
    lands(game, "Mountain", 4);
    const before = revealed(game).length;
    activate(game, fury, 0, { targets: [ref(B)] });
    expect(revealed(game)).toHaveLength(before);
    expect(life(game, B)).toBe(20);
  });

  it("Planeswalker's Fury can't be activated but as a sorcery", () => {
    const { game } = table({ step: "upkeep" });
    const fury = spawn(game, "Planeswalker's Fury");
    lands(game, "Mountain", 4);
    expect(() => activate(game, fury, 0, { targets: [ref(B)] })).toThrow();
  });
});

describe("up to N chosen cards revealed", () => {
  it("Armored Kincaller: a revealed Dinosaur gains 3, and it stays in the hand", () => {
    const { game, a } = table();
    const dinosaur = toHand(game, "Armored Kincaller");
    toHand(game, "Lightning Bolt");
    const seen = pickFromZone(a, dinosaur);
    enter(game, "Armored Kincaller");
    expect(seen.offered).toEqual([dinosaur]);
    expect(life(game)).toBe(23);
    expect(revealed(game).at(-1)?.objects).toEqual([dinosaur]);
    expect(zone(game, dinosaur)).toBe("hand");
  });

  it("Armored Kincaller: declined with no other Dinosaur, nothing; itself isn't another", () => {
    const { game, a } = table();
    toHand(game, "Armored Kincaller");
    pickFromZone(a);
    enter(game, "Armored Kincaller");
    expect(life(game)).toBe(20);
  });

  it("Armored Kincaller: declined with another Dinosaur out, 3 all the same, and only once for both", () => {
    const { game, a } = table();
    spawn(game, "Armored Kincaller");
    const dinosaur = toHand(game, "Armored Kincaller");
    pickFromZone(a);
    enter(game, "Armored Kincaller");
    expect(life(game)).toBe(23);
    pickFromZone(a, dinosaur);
    enter(game, "Armored Kincaller");
    expect(life(game)).toBe(26);
  });

  /** Vault 21 at its third chapter, with `picks` chosen from the hand. */
  const chapterThree = (game: Game, seat: ReturnType<typeof table>["a"], picks: readonly ObjectId[]): void => {
    const saga = spawn(game, "Vault 21: House Gambit");
    game.state.objects[saga].counters = { lore: 2 };
    pickFromZone(seat, ...picks);
    nextTurn(game);
    nextTurn(game);
    settle(game);
  };

  it("Vault 21: a Treasure for each revealed card sharing a mana value with another", () => {
    const { game, a } = table();
    const twoA = toHand(game, "Grizzly Bears");
    const twoB = toHand(game, "Grizzly Bears");
    const one = toHand(game, "Lightning Bolt");
    chapterThree(game, a, [twoA, twoB, one]);
    expect(tokensNamed(game, "Treasure Token", A)).toBe(2);
    expect(zone(game, twoA)).toBe("hand");
    expect(zone(game, one)).toBe("hand");
  });

  it("Vault 21: three of a mana value make three, and different mana values make none", () => {
    const three = table();
    const trio = [0, 1, 2].map(() => toHand(three.game, "Grizzly Bears"));
    chapterThree(three.game, three.a, trio);
    expect(tokensNamed(three.game, "Treasure Token", A)).toBe(3);

    const mixed = table();
    const apart = [toHand(mixed.game, "Lightning Bolt"), toHand(mixed.game, "Grizzly Bears")];
    chapterThree(mixed.game, mixed.a, apart);
    expect(tokensNamed(mixed.game, "Treasure Token", A)).toBe(0);
  });

  it("Vault 21: only nonland cards are offered, at most five", () => {
    const { game, a } = table();
    const land = toHand(game, "Mountain");
    const bears = [0, 1, 2, 3, 4, 5].map(() => toHand(game, "Grizzly Bears"));
    const saga = spawn(game, "Vault 21: House Gambit");
    game.state.objects[saga].counters = { lore: 2 };
    let offered: readonly ObjectId[] = [];
    let most = 0;
    a.chooseFromZoneFn = (_view, eligible, _min, max) => {
      offered = eligible;
      most = max;
      return bears.slice(0, 5);
    };
    nextTurn(game);
    nextTurn(game);
    settle(game);
    expect(offered).not.toContain(land);
    expect(most).toBe(5);
    expect(tokensNamed(game, "Treasure Token", A)).toBe(5);
  });

  it("Vault 21: chapters I and II discard, then draw", () => {
    const { game, a } = table();
    const bolt = toHand(game, "Lightning Bolt");
    a.chooseDiscardsFn = () => [bolt];
    lands(game, "Mountain", 2);
    const size = hand(game).length;
    cast(game, toHand(game, "Vault 21: House Gambit"));
    settle(game);
    expect(zone(game, bolt)).toBe("graveyard");
    // The hand it had, less the bolt, plus the card drawn.
    expect(hand(game).length).toBe(size);
  });
});
