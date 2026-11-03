/**
 * Exiled face down and linked to the source (rules 406.3, 607.2a), with no
 * permission to play: `exile-from-library`'s `faceDown` and `search-library`'s
 * `"exile-face-down"` with `linked`, then what the source's other abilities do
 * with those cards, and `turn-exiled-face-up`.
 */

import { describe, expect, it } from "vitest";

import type { Game } from "../game.js";
import type { ObjectId, PlayerId } from "../primitives.js";
import {
  A,
  B,
  C,
  activate,
  attack,
  destroy,
  enter,
  hand,
  graveyard,
  lands,
  life,
  pickFromZone,
  pickModes,
  ref,
  settle,
  spawn,
  table,
  toHand,
  toLibrary,
  toStep,
  zone,
} from "./harness.js";

const offers = (game: Game, card: ObjectId, player: PlayerId = A) =>
  game.legalActions(player).filter((a) => (a.kind === "cast-spell" || a.kind === "play-land") && a.card === card);

/** Whether `viewer` is shown what `card` is. */
const sees = (game: Game, viewer: PlayerId, card: ObjectId): boolean => game.viewFor(viewer).objects[card] !== undefined;

describe("Bomat Courier: face down, nobody may look, and back to hand", () => {
  it("exiles one for each attack, hidden from every player, then all of them come to hand", () => {
    const { game, a } = table();
    const bomat = spawn(game, "Bomat Courier");
    const first = toLibrary(game, "Grizzly Bears");
    attack(game, a, [bomat]);
    expect(zone(game, first)).toBe("exile");
    expect(game.state.objects[first].exiledFaceDown?.lookers).toEqual([]);
    expect(game.state.objects[first].exiledWith?.source).toBe(bomat);
    expect(sees(game, A, first)).toBe(false);
    expect(sees(game, B, first)).toBe(false);
    expect(offers(game, first)).toEqual([]);

    lands(game, "Mountain", 1);
    const kept = toHand(game, "Lightning Bolt");
    activate(game, bomat, 0);
    expect(zone(game, kept)).toBe("graveyard");
    expect(zone(game, bomat)).toBe("graveyard");
    expect(hand(game)).toContain(first);
    expect(game.state.objects[first].exiledFaceDown).toBeUndefined();
  });

  it("if it leaves first the cards stay exiled for good, with no link to a later one", () => {
    const { game, a } = table();
    const bomat = spawn(game, "Bomat Courier");
    const first = toLibrary(game, "Grizzly Bears");
    attack(game, a, [bomat]);
    destroy(game, bomat);
    settle(game);
    expect(zone(game, first)).toBe("exile");
    expect(game.state.objects[first].exiledFaceDown).toBeDefined();
    const second = spawn(game, "Bomat Courier");
    lands(game, "Mountain", 1);
    activate(game, second, 0);
    expect(zone(game, first)).toBe("exile");
  });

  it("each Courier has its own cache", () => {
    const { game, a } = table();
    const one = spawn(game, "Bomat Courier");
    const two = spawn(game, "Bomat Courier");
    const firstCard = toLibrary(game, "Grizzly Bears");
    attack(game, a, [one]);
    const secondCard = toLibrary(game, "Elvish Mystic");
    game.debugApplyEffect(A, { kind: "exile-from-library", amount: 1, faceDown: true, linked: true }, [], { source: two });
    lands(game, "Mountain", 1);
    activate(game, two, 0);
    expect(zone(game, secondCard)).toBe("hand");
    expect(zone(game, firstCard)).toBe("exile");
  });

  it("a thief who takes it gets no look at what's already exiled", () => {
    const { game, a } = table();
    const bomat = spawn(game, "Bomat Courier");
    const first = toLibrary(game, "Grizzly Bears");
    attack(game, a, [bomat]);
    game.debugApplyEffect(B, { kind: "gain-control", target: 0, untilEndOfTurn: false }, [ref(bomat)]);
    settle(game);
    expect(game.state.objects[first].exiledFaceDown?.lookers).toEqual([]);
  });
});

describe("Knowledge Vault: its two ways out", () => {
  it("{0}: sacrificed, the hand discarded, the cards to hand; the trigger then finds nothing", () => {
    const { game } = table();
    const vault = spawn(game, "Knowledge Vault");
    lands(game, "Wastes", 2);
    const card = toLibrary(game, "Grizzly Bears");
    activate(game, vault, 0);
    expect(zone(game, card)).toBe("exile");
    const kept = toHand(game, "Lightning Bolt");
    activate(game, vault, 1);
    settle(game);
    expect(zone(game, vault)).toBe("graveyard");
    expect(zone(game, kept)).toBe("graveyard");
    expect(zone(game, card)).toBe("hand");
  });

  it("leaving any other way, they all go to their owner's graveyard", () => {
    const { game } = table();
    const vault = spawn(game, "Knowledge Vault");
    lands(game, "Wastes", 2);
    const card = toLibrary(game, "Grizzly Bears");
    activate(game, vault, 0);
    destroy(game, vault);
    settle(game);
    expect(zone(game, card)).toBe("graveyard");
    expect(graveyard(game)).toContain(card);
  });
});

describe("Pyxis of Pandemonium: each player's own pile, turned face up", () => {
  it("each player exiles, nobody looks; the permanents enter under their owners, the rest stay face up", () => {
    const { game } = table({ players: 3 });
    const pyxis = spawn(game, "Pyxis of Pandemonium");
    const mine = toLibrary(game, "Grizzly Bears");
    const bobs = toLibrary(game, "Lightning Bolt", B);
    const carols = toLibrary(game, "Forest", C);
    activate(game, pyxis, 0);
    for (const card of [mine, bobs, carols]) {
      expect(zone(game, card)).toBe("exile");
      expect(game.state.objects[card].exiledFaceDown?.lookers).toEqual([]);
    }
    expect(sees(game, B, bobs)).toBe(false);
    game.state.objects[pyxis].tapped = false;
    lands(game, "Wastes", 7);
    activate(game, pyxis, 1);
    settle(game);
    expect(zone(game, pyxis)).toBe("graveyard");
    expect(zone(game, mine)).toBe("battlefield");
    expect(game.state.objects[mine].controller).toBe(A);
    expect(zone(game, carols)).toBe("battlefield");
    expect(game.state.objects[carols].controller).toBe(C);
    expect(zone(game, bobs)).toBe("exile");
    expect(game.state.objects[bobs].exiledFaceDown).toBeUndefined();
    expect(sees(game, A, bobs)).toBe(true);
  });
});

describe("Wall of Mourning: one of them, at random", () => {
  it("one card for each opponent, and at coven one returns, chosen blind", () => {
    const { game, a } = table({ players: 3 });
    const first = toLibrary(game, "Grizzly Bears");
    const second = toLibrary(game, "Lightning Bolt");
    enter(game, "Wall of Mourning");
    expect(zone(game, first)).toBe("exile");
    expect(zone(game, second)).toBe("exile");
    const seen = pickFromZone(a, second);
    spawn(game, "Grizzly Bears");
    spawn(game, "Elvish Mystic");
    toStep(game, "end", A);
    settle(game);
    // Asked of both as one pile: `faceDownGroups`, a card drawn from it.
    expect(seen.offered).toHaveLength(2);
    const backInHand = [first, second].filter((card) => zone(game, card) === "hand");
    expect(backInHand).toHaveLength(1);
  });

  it("no coven, nothing returns", () => {
    const { game } = table();
    const first = toLibrary(game, "Grizzly Bears");
    enter(game, "Wall of Mourning");
    toStep(game, "end", A);
    settle(game);
    expect(zone(game, first)).toBe("exile");
  });
});

describe("Kayla's Music Box: looked at, then played", () => {
  it("you may go on looking; {T} lets you play cards you own, any number, this turn", () => {
    const { game } = table();
    const box = spawn(game, "Kayla's Music Box");
    lands(game, "Plains", 1);
    const land = toLibrary(game, "Forest");
    activate(game, box, 0);
    expect(zone(game, land)).toBe("exile");
    expect(game.state.objects[land].exiledFaceDown?.lookers).toEqual([A]);
    expect(sees(game, A, land)).toBe(true);
    expect(sees(game, B, land)).toBe(false);
    expect(offers(game, land)).toEqual([]);

    const bears = toLibrary(game, "Grizzly Bears");
    game.state.objects[box].tapped = false;
    game.debugApplyEffect(A, { kind: "exile-from-library", amount: 1, faceDown: "looked", linked: true }, [], { source: box });
    expect(zone(game, bears)).toBe("exile");
    lands(game, "Forest", 2);
    activate(game, box, 1);
    expect(offers(game, land).map((o) => o.kind)).toEqual(["play-land"]);
    game.dispatch({ type: "play-land", player: A, card: land });
    expect(zone(game, land)).toBe("battlefield");
    // Any number: the land spent nothing.
    expect(offers(game, bears)).toHaveLength(1);
    game.dispatch({ type: "cast-spell", player: A, card: bears, targets: [], via: "impulse" });
    settle(game);
    expect(zone(game, bears)).toBe("battlefield");
  });

  it("a thief can't look at, or play, what the first controller exiled", () => {
    const { game } = table();
    const box = spawn(game, "Kayla's Music Box");
    lands(game, "Plains", 1);
    const bears = toLibrary(game, "Grizzly Bears");
    activate(game, box, 0);
    game.debugApplyEffect(B, { kind: "gain-control", target: 0, untilEndOfTurn: false }, [ref(box)]);
    settle(game);
    expect(game.state.objects[bears].exiledFaceDown?.lookers).toEqual([A]);
    expect(sees(game, B, bears)).toBe(false);
    lands(game, "Forest", 2, B);
    toStep(game, "precombat-main", B);
    activate(game, box, 1, { player: B });
    expect(offers(game, bears, B)).toEqual([]);
  });

  it("the next turn it's over", () => {
    const { game } = table();
    const box = spawn(game, "Kayla's Music Box");
    lands(game, "Plains", 1);
    const land = toLibrary(game, "Forest");
    activate(game, box, 0);
    game.state.objects[box].tapped = false;
    activate(game, box, 1);
    expect(offers(game, land)).toHaveLength(1);
    toStep(game, "precombat-main", B);
    toStep(game, "precombat-main", A);
    expect(offers(game, land)).toEqual([]);
  });
});

describe("The Creation of Avacyn: searched, turned up, then put or taken", () => {
  /** Chapter I resolved over `find`, with the lore counter a Saga starts on. */
  const started = (game: Game, a: Parameters<typeof pickFromZone>[0], find: string): { saga: ObjectId; card: ObjectId } => {
    const card = toLibrary(game, find);
    pickFromZone(a, card);
    const saga = enter(game, "The Creation of Avacyn");
    return { saga, card };
  };

  it("I hides it; II shows it and takes its mana value from a creature; III may put it", () => {
    const { game, a } = table();
    const { saga, card } = started(game, a, "Grizzly Bears");
    expect(zone(game, card)).toBe("exile");
    expect(game.state.objects[card].exiledFaceDown?.lookers).toEqual([A]);
    expect(game.state.objects[card].exiledWith?.source).toBe(saga);
    expect(sees(game, B, card)).toBe(false);

    game.debugApplyEffect(A, { kind: "add-counter", target: "source", counter: "lore", amount: 1 }, [], { source: saga });
    settle(game);
    expect(game.state.objects[card].exiledFaceDown).toBeUndefined();
    expect(sees(game, B, card)).toBe(true);
    expect(life(game)).toBe(18);

    pickModes(a, 0);
    game.debugApplyEffect(A, { kind: "add-counter", target: "source", counter: "lore", amount: 1 }, [], { source: saga });
    settle(game);
    expect(zone(game, card)).toBe("battlefield");
    expect(game.state.objects[card].controller).toBe(A);
    expect(zone(game, saga)).toBe("graveyard");
  });

  it("III declined, the creature goes to hand", () => {
    const { game, a } = table();
    const { saga, card } = started(game, a, "Grizzly Bears");
    game.debugApplyEffect(A, { kind: "add-counter", target: "source", counter: "lore", amount: 2 }, [], { source: saga });
    settle(game);
    expect(zone(game, card)).toBe("hand");
  });

  it("not a creature: no life lost, and it can only go to hand", () => {
    const { game, a } = table();
    const { saga, card } = started(game, a, "Lightning Bolt");
    game.debugApplyEffect(A, { kind: "add-counter", target: "source", counter: "lore", amount: 1 }, [], { source: saga });
    settle(game);
    expect(life(game)).toBe(20);
    pickModes(a, 0);
    game.debugApplyEffect(A, { kind: "add-counter", target: "source", counter: "lore", amount: 1 }, [], { source: saga });
    settle(game);
    expect(zone(game, card)).toBe("hand");
  });
});
