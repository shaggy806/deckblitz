/**
 * One choice of cards drawn from several zones, or a choice whose chosen set
 * must fill one slot each:
 *
 * - `look-and-choose`'s `together` (`oneEach`): Atraxa, Grand Unifier's "for
 *   each card type, you may put a card of that type" — a card of two types
 *   fills either slot (its ruling) — and Harper Recruiter's "a Cleric card, a
 *   Rogue card, a Warrior card, and/or a Wizard card".
 * - `discard-chosen`'s `alsoFrom`: Agonizing Remorse's "a nonland card from
 *   it or a card from their graveyard", Psychotic Episode's "their hand and
 *   the top card of their library … You choose a card revealed this way".
 * - `return-from-graveyard`'s `count` as an amount: Worldsoul's Rage's "up to
 *   X land cards from your hand and/or graveyard".
 */
import { describe, expect, it } from "vitest";

import { A, B, attack, cast, enter, hand, graveyard, lands, life, pickFromZone, ref, settle, spawn, table, toGraveyard, toHand, toLibrary, zone } from "./harness.js";
import type { Game } from "../game.js";
import type { ObjectId, PlayerId } from "../primitives.js";
import type { AwaitingDecision } from "../state.js";

const library = (game: Game, player: PlayerId = A): readonly ObjectId[] => game.state.zones.perPlayer[player].library;
/** `names` on top of `player`'s library, the first on top; their ids in that order. */
const onTop = (game: Game, names: readonly string[], player: PlayerId = A): ObjectId[] =>
  [...names]
    .reverse()
    .map((name) => toLibrary(game, name, player))
    .reverse();
const zoneChoice = (game: Game): Extract<AwaitingDecision, { kind: "choose-from-zone" }> => {
  game.advanceUntil((s) => s.awaiting?.kind === "choose-from-zone");
  const awaiting = game.state.awaiting;
  if (awaiting?.kind !== "choose-from-zone") throw new Error("no zone choice");
  return awaiting;
};
const answer = (game: Game, chosen: readonly ObjectId[], player: PlayerId = A): string | null =>
  game.canDispatch({ type: "choose-from-zone", player, chosen });

describe("Atraxa, Grand Unifier: a card of each card type from the top ten", () => {
  const board = () => {
    const t = table();
    const ids = onTop(t.game, [
      "Ornithopter",
      "Grizzly Bears",
      "Sol Ring",
      "Lightning Bolt",
      "Divination",
      "Pacifism",
      "Llanowar Elves",
      "Hill Giant",
      "Wastes",
      "Wastes",
    ]);
    enter(t.game, "Atraxa, Grand Unifier", A, { settle: false });
    return { ...t, ids };
  };

  it("offers all ten, up to one a card type, and checks the set as a matching", () => {
    const { game, ids } = board();
    const [ornithopter, bears, solRing, bolt, divination, pacifism, elves] = ids;
    const awaiting = zoneChoice(game);
    expect(awaiting.min).toBe(0);
    expect(awaiting.max).toBe(9);
    expect(awaiting.together?.rule).toBe("one-each");
    expect([...awaiting.eligible].sort()).toEqual([...ids].sort());
    // An artifact creature is the artifact card or the creature card, so
    // beside a creature it's the artifact — and then no other artifact fits.
    expect(answer(game, [ornithopter, bears])).toBeNull();
    expect(answer(game, [ornithopter, bears, solRing])).not.toBeNull();
    // Two creatures and nothing else to be: one of them is too many.
    expect(answer(game, [bears, elves])).not.toBeNull();
    expect(answer(game, [ornithopter, bears, bolt, divination, pacifism, ids[8]])).toBeNull();
  });

  it("puts the chosen cards into the hand and the rest on the bottom", () => {
    const { game, ids } = board();
    const [ornithopter, bears, , bolt, , , , , wastes] = ids;
    zoneChoice(game);
    game.dispatch({ type: "choose-from-zone", player: A, chosen: [ornithopter, bears, bolt, wastes] });
    settle(game);
    for (const id of [ornithopter, bears, bolt, wastes]) expect(zone(game, id)).toBe("hand");
    const rest = ids.filter((id) => ![ornithopter, bears, bolt, wastes].includes(id));
    expect([...library(game).slice(-rest.length)].sort()).toEqual([...rest].sort());
  });
});

describe("Harper Recruiter: a Cleric, a Rogue, a Warrior and/or a Wizard card", () => {
  it("offers only the cards of those types, one a type", () => {
    const { game, a } = table();
    const recruiter = spawn(game, "Harper Recruiter");
    const [warden, priest, looter, bears] = onTop(game, ["Soul Warden", "Suture Priest", "Merfolk Looter", "Grizzly Bears"]);
    const seen = pickFromZone(a, warden, looter);
    attack(game, a, [recruiter]);
    expect([...seen.offered].sort()).toEqual([warden, priest, looter].sort());
    expect(zone(game, warden)).toBe("hand");
    expect(zone(game, looter)).toBe("hand");
    expect(library(game).slice(-2).sort()).toEqual([priest, bears].sort());
  });

  it("refuses two Clerics", () => {
    const { game, a } = table();
    const recruiter = spawn(game, "Harper Recruiter");
    const [warden, priest] = onTop(game, ["Soul Warden", "Suture Priest", "Elvish Warrior", "Prodigal Sorcerer"]);
    a.declareAttackersFn = () => [{ attacker: recruiter, defender: B }];
    const awaiting = zoneChoice(game);
    expect(awaiting.max).toBe(4);
    expect(answer(game, [warden, priest])).not.toBeNull();
    expect(answer(game, [warden, ...library(game).slice(2, 4)])).toBeNull();
  });
});

describe("Agonizing Remorse: a nonland card from the hand or any card from the graveyard", () => {
  it("offers the hand's nonland cards and the whole graveyard, a card required", () => {
    const { game, a } = table();
    lands(game, "Swamp", 2);
    const forest = toHand(game, "Forest", B);
    const bears = toHand(game, "Grizzly Bears", B);
    const island = toGraveyard(game, "Island", B);
    const seen = pickFromZone(a, island);
    cast(game, toHand(game, "Agonizing Remorse"), { targets: [ref(B)] });
    expect([...seen.offered].sort()).toEqual([bears, island].sort());
    expect(zone(game, island)).toBe("exile");
    expect(zone(game, forest)).toBe("hand");
    expect(zone(game, bears)).toBe("hand");
    expect(life(game, A)).toBe(19);
  });

  it("must take a card when there's one in either zone", () => {
    const { game } = table();
    lands(game, "Swamp", 2);
    toHand(game, "Forest", B);
    const giant = toGraveyard(game, "Hill Giant", B);
    cast(game, toHand(game, "Agonizing Remorse"), { targets: [ref(B)], settle: false });
    const awaiting = zoneChoice(game);
    expect(awaiting.min).toBe(1);
    expect(awaiting.eligible).toEqual([giant]);
    expect(answer(game, [])).not.toBeNull();
  });

  it("with nothing to take, only the life is lost", () => {
    const { game } = table();
    lands(game, "Swamp", 2);
    const before = hand(game, B).length;
    cast(game, toHand(game, "Agonizing Remorse"), { targets: [ref(B)] });
    // The opening hand is all Wastes: no nonland card, and no graveyard.
    expect(hand(game, B)).toHaveLength(before);
    expect(life(game, A)).toBe(19);
  });
});

describe("Psychotic Episode: the hand and the top card revealed, one chosen to the bottom", () => {
  it("can take the library's top card, which goes to the bottom", () => {
    const { game, a } = table({ deck: "Grizzly Bears" });
    lands(game, "Swamp", 3);
    const bears = toHand(game, "Grizzly Bears", B);
    const [giant] = onTop(game, ["Hill Giant"], B);
    const seen = pickFromZone(a, giant);
    cast(game, toHand(game, "Psychotic Episode"), { targets: [ref(B)] });
    expect([...seen.offered].sort()).toEqual([...hand(game, B), giant].sort());
    expect(seen.offered).toContain(bears);
    expect(library(game, B).at(-1)).toBe(giant);
    expect(library(game, B)[0]).not.toBe(giant);
    expect(zone(game, bears)).toBe("hand");
  });

  it("or a card from the hand, put on the bottom of its owner's library", () => {
    const { game, a } = table();
    lands(game, "Swamp", 3);
    const bears = toHand(game, "Grizzly Bears", B);
    const [giant] = onTop(game, ["Hill Giant"], B);
    pickFromZone(a, bears);
    cast(game, toHand(game, "Psychotic Episode"), { targets: [ref(B)] });
    expect(library(game, B).at(-1)).toBe(bears);
    expect(library(game, B)[0]).toBe(giant);
    expect(hand(game, B)).not.toContain(bears);
  });
});

describe("Worldsoul's Rage: up to X land cards from the hand and/or graveyard", () => {
  it("deals X and puts the chosen lands from both zones onto the battlefield tapped", () => {
    const { game, a } = table({ deck: "Grizzly Bears" });
    lands(game, "Mountain", 2);
    lands(game, "Forest", 2);
    const forest = toHand(game, "Forest");
    const mountain = toGraveyard(game, "Mountain");
    const island = toGraveyard(game, "Island");
    const seen = pickFromZone(a, forest, island);
    cast(game, toHand(game, "Worldsoul's Rage"), { targets: [ref(B)], x: 2 });
    expect(life(game, B)).toBe(18);
    expect([...seen.offered].sort()).toEqual([forest, mountain, island].sort());
    for (const id of [forest, island]) {
      expect(zone(game, id)).toBe("battlefield");
      expect(game.state.objects[id].tapped).toBe(true);
    }
    expect(graveyard(game)).toContain(mountain);
  });

  it("takes no more than X", () => {
    const { game } = table();
    lands(game, "Mountain", 2);
    lands(game, "Forest", 1);
    toHand(game, "Forest");
    toGraveyard(game, "Mountain");
    cast(game, toHand(game, "Worldsoul's Rage"), { targets: [ref(B)], x: 1, settle: false });
    const awaiting = zoneChoice(game);
    expect(awaiting.max).toBe(1);
    expect(awaiting.min).toBe(0);
  });
});
