/**
 * A player choosing a card from a set as an effect resolves, then moving it or
 * acting on it: one card from a hand or a graveyard (`discard-chosen`'s
 * `alsoFrom`, with `mayCast` — Memory Leak, Psychic Intrusion), and one or some
 * of the cards exiled with the source (rule 607.2a — `look-and-choose`'s `zone:
 * "exiled-with-source"` with `destination: "stay"` and `under: "owners"`,
 * `choose-exiled-to-play`'s `linked` — Muse Vessel, Purgatory, Bag of
 * Devouring, Lazav).
 */
import { describe, expect, it } from "vitest";

import type { Game } from "../game.js";
import type { ObjectId } from "../primitives.js";
import {
  A,
  B,
  activate,
  attack,
  cast,
  controller,
  destroy,
  hand,
  lands,
  life,
  named,
  nextTurn,
  pickFromZone,
  pickModes,
  pickTargets,
  pt,
  ref,
  settle,
  spawn,
  table,
  toExile,
  toGraveyard,
  toHand,
  zone,
} from "./harness.js";

const canCast = (game: Game, card: ObjectId, player = A): boolean =>
  game.legalActions(player).some((a) => a.kind === "cast-spell" && a.card === card);

describe("a card chosen from a hand or a graveyard", () => {
  it("Memory Leak: nonland cards of both zones are offered, and the hand is revealed", () => {
    const { game, a } = table();
    lands(game, "Swamp", 3);
    const fromHand = toHand(game, "Lightning Bolt", B);
    const fromGraveyard = toGraveyard(game, "Grizzly Bears", B);
    const landInGraveyard = toGraveyard(game, "Mountain", B);
    const seen = pickFromZone(a, fromGraveyard);
    cast(game, toHand(game, "Memory Leak"), { targets: [ref(B)] });
    expect(seen.offered).toContain(fromHand);
    expect(seen.offered).toContain(fromGraveyard);
    expect(seen.offered).not.toContain(landInGraveyard);
    expect(seen.offered.every((id) => game.state.objects[id].owner === B)).toBe(true);
    expect(zone(game, fromGraveyard)).toBe("exile");
    expect(zone(game, fromHand)).toBe("hand");
    expect(game.eventsOfType("cards-revealed").at(-1)?.player).toBe(B);
  });

  it("Memory Leak: a card from the hand is exiled, and one must be chosen if any may be", () => {
    const { game, a } = table();
    lands(game, "Swamp", 3);
    const bolt = toHand(game, "Lightning Bolt", B);
    a.chooseFromZoneFn = (_view, eligible, min, max) => {
      expect(min).toBe(1);
      expect(max).toBe(1);
      return [eligible[0]];
    };
    cast(game, toHand(game, "Memory Leak"), { targets: [ref(B)] });
    expect(zone(game, bolt)).toBe("exile");
  });

  it("Psychic Intrusion: you may cast it for as long as it stays exiled, with mana of any color", () => {
    const { game, a } = table();
    lands(game, "Underground Sea", 6);
    const bolt = toHand(game, "Lightning Bolt", B);
    pickFromZone(a, bolt);
    cast(game, toHand(game, "Psychic Intrusion"), { targets: [ref(B)] });
    expect(zone(game, bolt)).toBe("exile");
    expect(canCast(game, bolt, B)).toBe(false);
    // Not only this turn: still there on your next one.
    nextTurn(game);
    nextTurn(game);
    cast(game, bolt, { targets: [ref(B)], via: "impulse" });
    expect(life(game, B)).toBe(17);
    // It's its owner's card, wherever it goes (rule 108.3).
    expect(game.state.zones.perPlayer[B].graveyard).toContain(bolt);
  });

  it("Psychic Intrusion: nothing to choose, nothing asked", () => {
    const { game, a } = table();
    lands(game, "Underground Sea", 5);
    let asked = false;
    a.chooseFromZoneFn = () => {
      asked = true;
      return [];
    };
    cast(game, toHand(game, "Psychic Intrusion"), { targets: [ref(B)] });
    expect(asked).toBe(false);
  });
});

describe("a card exiled with the source, chosen as an ability resolves", () => {
  it("Muse Vessel: the target player picks what's exiled; you may play it this turn", () => {
    const { game, a, b } = table();
    const vessel = spawn(game, "Muse Vessel");
    lands(game, "Mountain", 6);
    const bolt = toHand(game, "Lightning Bolt", B);
    const seen = pickFromZone(b, bolt);
    activate(game, vessel, 0, { targets: [ref(B)] });
    expect(seen.offered).toContain(bolt);
    expect(zone(game, bolt)).toBe("exile");
    expect(canCast(game, bolt)).toBe(false);
    pickFromZone(a, bolt);
    activate(game, vessel, 1);
    expect(canCast(game, bolt)).toBe(true);
    cast(game, bolt, { targets: [ref(B)], via: "impulse" });
    expect(life(game, B)).toBe(17);
  });

  it("Muse Vessel: the permission lasts the turn, a second card waits on a second choice, a land is played", () => {
    const { game, a, b } = table();
    const vessel = spawn(game, "Muse Vessel");
    game.state.objects[vessel].tapped = false;
    lands(game, "Mountain", 10);
    const bolt = toHand(game, "Lightning Bolt", B);
    const mountain = toHand(game, "Mountain", B);
    pickFromZone(b, bolt);
    activate(game, vessel, 0, { targets: [ref(B)] });
    game.state.objects[vessel].tapped = false;
    pickFromZone(b, mountain);
    activate(game, vessel, 0, { targets: [ref(B)] });
    const seen = pickFromZone(a, mountain);
    activate(game, vessel, 1);
    expect(seen.offered).toEqual(expect.arrayContaining([bolt, mountain]));
    expect(canCast(game, bolt)).toBe(false);
    expect(game.legalActions(A).some((x) => x.kind === "play-land" && x.card === mountain)).toBe(true);
    nextTurn(game);
    nextTurn(game);
    expect(game.legalActions(A).some((x) => x.kind === "play-land" && x.card === mountain)).toBe(false);
  });

  it("Muse Vessel: no card of another's reaches it, and another Vessel's isn't its own", () => {
    const { game, a, b } = table();
    const first = spawn(game, "Muse Vessel");
    const second = spawn(game, "Muse Vessel");
    lands(game, "Mountain", 8);
    const bolt = toHand(game, "Lightning Bolt", B);
    pickFromZone(b, bolt);
    activate(game, first, 0, { targets: [ref(B)] });
    const elsewhere = toExile(game, "Lightning Bolt");
    let asked = false;
    a.chooseFromZoneFn = () => {
      asked = true;
      return [];
    };
    activate(game, second, 1);
    expect(asked).toBe(false);
    expect(canCast(game, bolt)).toBe(false);
    expect(canCast(game, elsewhere)).toBe(false);
  });

  it("Purgatory: your creature dying is exiled with it; another's isn't", () => {
    const { game } = table();
    spawn(game, "Purgatory");
    const mine = spawn(game, "Grizzly Bears");
    const theirs = spawn(game, "Grizzly Bears", B);
    destroy(game, mine);
    destroy(game, theirs);
    settle(game);
    expect(zone(game, mine)).toBe("exile");
    expect(zone(game, theirs)).toBe("graveyard");
  });

  it("Purgatory: {4} and 2 life at your upkeep return the card you choose", () => {
    const { game, a } = table();
    spawn(game, "Purgatory");
    lands(game, "Swamp", 4);
    const bears = spawn(game, "Grizzly Bears");
    const spy = spawn(game, "Merfolk Spy");
    destroy(game, bears);
    destroy(game, spy);
    settle(game);
    pickModes(a, 0);
    const seen = pickFromZone(a, spy);
    nextTurn(game);
    nextTurn(game);
    expect(seen.offered).toEqual(expect.arrayContaining([bears, spy]));
    expect(zone(game, spy)).toBe("battlefield");
    expect(zone(game, bears)).toBe("exile");
    expect(life(game)).toBe(18);
  });

  it("Purgatory: declined, nothing is paid or returned", () => {
    const { game, a } = table();
    spawn(game, "Purgatory");
    lands(game, "Swamp", 4);
    const bears = spawn(game, "Grizzly Bears");
    destroy(game, bears);
    settle(game);
    pickModes(a);
    nextTurn(game);
    nextTurn(game);
    expect(zone(game, bears)).toBe("exile");
    expect(life(game)).toBe(20);
  });

  it("Purgatory: it returns under its owner's control, whoever controls Purgatory now", () => {
    const { game, b } = table();
    const purgatory = spawn(game, "Purgatory");
    const bears = spawn(game, "Grizzly Bears");
    destroy(game, bears);
    settle(game);
    expect(zone(game, bears)).toBe("exile");
    nextTurn(game);
    lands(game, "Island", 2, B);
    cast(game, toHand(game, "Steal Enchantment", B), { player: B, targets: [ref(purgatory)] });
    expect(controller(game, purgatory)).toBe(B);
    lands(game, "Swamp", 4, B);
    pickModes(b, 0);
    pickFromZone(b, bears);
    nextTurn(game);
    nextTurn(game);
    expect(zone(game, bears)).toBe("battlefield");
    expect(controller(game, bears)).toBe(A);
    expect(life(game, B)).toBe(18);
  });

  /** Pay Bag of Devouring's draw, sacrificing `victim`. */
  const feed = (game: Game, bag: ObjectId, victim: ObjectId): void => {
    game.dispatch({ type: "activate-ability", player: A, source: bag, abilityIndex: 0, targets: [], sacrifice: victim });
    game.state.objects[bag].tapped = false;
    settle(game);
  };

  it("Bag of Devouring: another nontoken artifact or creature you sacrifice is exiled with it, and draws", () => {
    const { game } = table();
    const bag = spawn(game, "Bag of Devouring");
    lands(game, "Swamp", 4);
    const bears = spawn(game, "Grizzly Bears");
    const before = hand(game).length;
    feed(game, bag, bears);
    expect(zone(game, bears)).toBe("exile");
    expect(hand(game).length).toBe(before + 1);
    expect(game.state.objects[bears].exiledWith?.source).toBe(bag);
  });

  it("Bag of Devouring: sacrificed itself, up to the roll's cards come back, to their owners' hands", () => {
    const { game, a } = table({ seed: 3 });
    const bag = spawn(game, "Bag of Devouring");
    lands(game, "Swamp", 7);
    const bears = spawn(game, "Grizzly Bears");
    feed(game, bag, bears);
    // One that belongs to someone else (a creature of theirs you controlled)
    // goes to their hand.
    const spy = toExile(game, "Merfolk Spy", B);
    game.state.objects[spy].exiledWith = game.state.objects[bears].exiledWith;
    let most = -1;
    a.chooseFromZoneFn = (_view, eligible, _min, max) => {
      most = max;
      return [...eligible];
    };
    activate(game, bag, 1);
    const rolled = game.eventsOfType("dice-rolled").at(-1);
    expect(rolled?.sides).toBe(10);
    expect(zone(game, bag)).toBe("graveyard");
    // This seed rolls more than the two cards there are.
    expect(rolled?.results[0]).toBeGreaterThan(2);
    expect(most).toBe(2);
    expect(game.state.zones.perPlayer[A].hand).toContain(bears);
    expect(game.state.zones.perPlayer[B].hand).toContain(spy);
  });

  it("Bag of Devouring: a low roll caps the cards offered", () => {
    const rollOf = (seed: number): { readonly most: number; readonly rolled: number } => {
      const { game, a } = table({ seed });
      const bag = spawn(game, "Bag of Devouring");
      lands(game, "Swamp", 7);
      for (let i = 0; i < 2; i += 1) feed(game, bag, spawn(game, "Grizzly Bears"));
      let most = -1;
      a.chooseFromZoneFn = (_view, _eligible, _min, max) => {
        most = max;
        return [];
      };
      activate(game, bag, 1);
      return { most, rolled: game.eventsOfType("dice-rolled").at(-1)?.results[0] ?? 0 };
    };
    // Seeds until a 1 comes up: the choice goes no higher than the result.
    const low = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16, 17, 18, 19, 20, 21, 22, 23, 24, 25, 26, 27, 28, 29, 30]
      .map(rollOf)
      .find((r) => r.rolled === 1);
    expect(low?.most).toBe(1);
  });

  it("Lazav: exiles and investigates as it attacks, then becomes a copy of a creature exiled with it, until end of turn", () => {
    const { game, a } = table();
    const lazav = spawn(game, "Lazav, Wearer of Faces");
    lands(game, "Swamp", 4);
    const bears = toGraveyard(game, "Grizzly Bears", B);
    pickTargets(a, bears);
    attack(game, a, [lazav]);
    expect(zone(game, bears)).toBe("exile");
    expect(life(game, B)).toBe(18);
    const clue = named(game, "Clue Token", A)[0];
    expect(pt(game, lazav)).toEqual({ power: 2, toughness: 3 });
    pickModes(a, 0);
    const seen = pickFromZone(a, bears);
    activate(game, clue);
    expect(seen.offered).toEqual([bears]);
    expect(pt(game, lazav)).toEqual({ power: 2, toughness: 2 });
    // Its link stays: the same permanent (rule 707.4), and the card hasn't moved.
    expect(zone(game, bears)).toBe("exile");
    nextTurn(game);
    expect(pt(game, lazav)).toEqual({ power: 2, toughness: 3 });
  });

  it("Lazav: only creature cards exiled with it are offered; declining copies nothing", () => {
    const { game, a } = table();
    const lazav = spawn(game, "Lazav, Wearer of Faces");
    lands(game, "Swamp", 6);
    const bolt = toGraveyard(game, "Lightning Bolt", B);
    pickTargets(a, bolt);
    attack(game, a, [lazav]);
    expect(zone(game, bolt)).toBe("exile");
    toExile(game, "Grizzly Bears");
    const clue = named(game, "Clue Token", A)[0];
    pickModes(a, 0);
    let asked = false;
    a.chooseFromZoneFn = () => {
      asked = true;
      return [];
    };
    activate(game, clue);
    expect(asked).toBe(false);
    expect(pt(game, lazav)).toEqual({ power: 2, toughness: 3 });
  });
});
