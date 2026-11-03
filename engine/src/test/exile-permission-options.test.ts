/**
 * Permissions over exiled cards, the options on them.
 *
 * Over the cards a source has linked to itself (rule 607.2a): a static one
 * (Nightveil Specter, Intellect Devourer), and a resolved one that reads them
 * live (rule 611.2c — Raphael, `allow-cast-linked-exile`'s `play`, `anyNumber`
 * and `reduce`).
 *
 * On the card an effect exiled: its owner's rather than its controller's
 * (Soul Partition, Release to the Wind, Suspend Aggression), taxed (Elite
 * Spellbinder), its lands entering tapped (Lightstall Inquisitor).
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
  cast,
  enter,
  hand,
  lands,
  nextTurn,
  pickFromZone,
  pickModes,
  pickTargets,
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

/** The active player's next turn, precombat main, with their priority. */
const toTurnOf = (game: Game, player: PlayerId): void => toStep(game, "precombat-main", player);

describe("Nightveil Specter: a static permission over the cards exiled with it", () => {
  it("plays a land and casts a spell the damaged player's library gave up, and only those", () => {
    const { game, a } = table();
    const specter = spawn(game, "Nightveil Specter");
    const land = toLibrary(game, "Forest", B);
    const unlinked = game.debugSpawn("Grizzly Bears", A, "exile");
    attack(game, a, [specter]);
    expect(zone(game, land)).toBe("exile");
    expect(game.state.objects[land].exiledWith?.source).toBe(specter);
    expect(offers(game, land).map((o) => o.kind)).toEqual(["play-land"]);
    expect(offers(game, unlinked)).toEqual([]);
    game.dispatch({ type: "play-land", player: A, card: land });
    expect(zone(game, land)).toBe("battlefield");
    expect(game.state.objects[land].controller).toBe(A);
  });

  it("casts an opponent's card for its ordinary cost, and it's gone once the Specter is", () => {
    const { game, a } = table();
    const specter = spawn(game, "Nightveil Specter");
    lands(game, "Forest", 2);
    const bears = toLibrary(game, "Grizzly Bears", B);
    attack(game, a, [specter]);
    expect(offers(game, bears)).toHaveLength(1);
    game.debugApplyEffect(A, { kind: "destroy", target: 0 }, [ref(specter)]);
    settle(game);
    expect(zone(game, specter)).toBe("graveyard");
    expect(offers(game, bears)).toEqual([]);
  });

  it("is the ability of whoever controls it now (a thief may use it), of that stint alone", () => {
    const { game, a } = table();
    const specter = spawn(game, "Nightveil Specter");
    const bears = toLibrary(game, "Grizzly Bears", B);
    attack(game, a, [specter]);
    lands(game, "Forest", 2, B);
    game.debugApplyEffect(B, { kind: "gain-control", target: 0, untilEndOfTurn: false }, [ref(specter)]);
    settle(game);
    expect(offers(game, bears, A)).toEqual([]);
    toTurnOf(game, B);
    expect(offers(game, bears, B)).toHaveLength(1);
    // Blinked: a new object with no memory of it (rule 400.7).
    game.debugApplyEffect(B, { kind: "flicker", target: 0 }, [ref(specter)]);
    settle(game);
    expect(zone(game, specter)).toBe("battlefield");
    expect(offers(game, bears, B)).toEqual([]);
  });
});

describe("Intellect Devourer: each opponent's own choice, until it leaves", () => {
  it("spends mana as though it were any colour on the exiled card, and the card returns with it gone", () => {
    const { game, b, c } = table({ players: 3 });
    const bolt = toHand(game, "Lightning Bolt", B);
    const bears = toHand(game, "Grizzly Bears", C);
    pickFromZone(b, bolt);
    pickFromZone(c, bears);
    const devourer = enter(game, "Intellect Devourer");
    expect(zone(game, bolt)).toBe("exile");
    expect(zone(game, bears)).toBe("exile");
    // Plains make {R}: "as though it were mana of any color".
    lands(game, "Plains", 1);
    expect(offers(game, bolt)).toHaveLength(1);
    // A spell's cost is still paid in full: Bears needs {1}{G}.
    expect(offers(game, bears)).toEqual([]);
    lands(game, "Plains", 1);
    expect(offers(game, bears)).toHaveLength(1);
    game.debugApplyEffect(A, { kind: "destroy", target: 0 }, [ref(devourer)]);
    settle(game);
    expect(hand(game, B)).toContain(bolt);
    expect(hand(game, C)).toContain(bears);
  });
});

describe("Raphael, Most Attitude: a resolved permission over the cards linked to it", () => {
  /** Raphael, with `count` of `names` exiled by the alliance trigger. */
  const withExiled = (game: Game, names: readonly string[]): { raphael: ObjectId; exiled: ObjectId[] } => {
    const raphael = spawn(game, "Raphael, Most Attitude");
    const exiled = names.map((name) => {
      const card = toLibrary(game, name);
      game.debugApplyEffect(A, { kind: "exile-from-library", amount: 1, linked: true }, [], { source: raphael });
      return card;
    });
    return { raphael, exiled };
  };

  it("offers nothing until it attacks, then one card and no more", () => {
    const { game, a } = table();
    const { raphael, exiled } = withExiled(game, ["Grizzly Bears", "Elvish Mystic"]);
    lands(game, "Forest", 3);
    expect(offers(game, exiled[0])).toEqual([]);
    attack(game, a, [raphael]);
    expect(offers(game, exiled[0])).toHaveLength(1);
    expect(offers(game, exiled[1])).toHaveLength(1);
    cast(game, exiled[0], { via: "impulse" });
    expect(zone(game, exiled[0])).toBe("battlefield");
    expect(offers(game, exiled[1])).toEqual([]);
  });

  it("a land spends the one play too, at a land's timing", () => {
    const { game, a } = table();
    const { raphael, exiled } = withExiled(game, ["Forest", "Grizzly Bears"]);
    lands(game, "Forest", 2);
    attack(game, a, [raphael]);
    expect(offers(game, exiled[0]).map((o) => o.kind)).toEqual(["play-land"]);
    game.dispatch({ type: "play-land", player: A, card: exiled[0] });
    expect(zone(game, exiled[0])).toBe("battlefield");
    expect(offers(game, exiled[1])).toEqual([]);
  });

  it("two attacks' permissions are two plays, and they end with the turn", () => {
    const { game, a } = table();
    const { raphael, exiled } = withExiled(game, ["Grizzly Bears", "Elvish Mystic", "Llanowar Elves"]);
    lands(game, "Forest", 4);
    // A second resolved permission, as a copied trigger would be.
    game.debugApplyEffect(A, { kind: "allow-cast-linked-exile", play: true }, [], { source: raphael });
    attack(game, a, [raphael]);
    cast(game, exiled[0], { via: "impulse" });
    expect(offers(game, exiled[1])).toHaveLength(1);
    cast(game, exiled[1], { via: "impulse" });
    expect(offers(game, exiled[2])).toEqual([]);
    nextTurn(game);
    expect(offers(game, exiled[2])).toEqual([]);
  });

  it("reads the linked cards live, so a card exiled after it resolved counts (rule 611.2c)", () => {
    const { game, a } = table();
    const { raphael } = withExiled(game, []);
    lands(game, "Forest", 2);
    attack(game, a, [raphael]);
    const later = toLibrary(game, "Grizzly Bears");
    game.debugApplyEffect(A, { kind: "exile-from-library", amount: 1, linked: true }, [], { source: raphael });
    expect(offers(game, later)).toHaveLength(1);
  });

  it("`anyNumber` isn't spent; `reduce` takes generic mana off, not coloured; `spell` limits the cards", () => {
    const { game } = table();
    const { raphael, exiled } = withExiled(game, ["Grizzly Bears", "Elvish Mystic", "Forest"]);
    lands(game, "Forest", 2);
    game.debugApplyEffect(
      A,
      { kind: "allow-cast-linked-exile", play: true, anyNumber: true, reduce: 2, spell: { ownedBy: "you" } },
      [],
      { source: raphael },
    );
    expect(offers(game, exiled[2]).map((o) => o.kind)).toEqual(["play-land"]);
    game.dispatch({ type: "play-land", player: A, card: exiled[2] });
    // {1}{G} less {2} is {G}: the land is still there to pay with.
    game.state.objects[exiled[2]].tapped = true;
    cast(game, exiled[0], { via: "impulse" });
    expect(zone(game, exiled[0])).toBe("battlefield");
    cast(game, exiled[1], { via: "impulse" });
    expect(zone(game, exiled[1])).toBe("battlefield");
    // Not a card someone else owns.
    const theirs = toLibrary(game, "Grizzly Bears", B);
    game.debugApplyEffect(A, { kind: "exile-from-library", whose: "each-opponent", amount: 1, linked: true }, [], {
      source: raphael,
    });
    expect(zone(game, theirs)).toBe("exile");
    expect(offers(game, theirs)).toEqual([]);
  });
});

describe("its owner's permission", () => {
  it("Soul Partition: an opponent's permanent, playable by them at {2} more, for good", () => {
    const { game } = table();
    lands(game, "Plains", 2);
    const bears = spawn(game, "Grizzly Bears", B);
    cast(game, toHand(game, "Soul Partition"), { targets: [ref(bears)] });
    expect(zone(game, bears)).toBe("exile");
    expect(offers(game, bears, A)).toEqual([]);
    lands(game, "Forest", 3, B);
    toTurnOf(game, B);
    // Three mana can't pay {1}{G} and {2}.
    expect(offers(game, bears, B)).toEqual([]);
    lands(game, "Forest", 1, B);
    expect(offers(game, bears, B)).toHaveLength(1);
    game.dispatch({ type: "cast-spell", player: B, card: bears, targets: [], via: "impulse" });
    settle(game);
    expect(zone(game, bears)).toBe("battlefield");
    expect(game.state.objects[bears].controller).toBe(B);
    const tappedForests = game.state.zones.shared.battlefield.filter(
      (id) => game.state.objects[id].controller === B && game.state.objects[id].tapped,
    );
    expect(tappedForests).toHaveLength(4);
  });

  it("Soul Partition: your own permanent comes back untaxed, by an opponent's only", () => {
    const { game } = table();
    lands(game, "Plains", 2);
    const mine = spawn(game, "Grizzly Bears");
    lands(game, "Forest", 2);
    cast(game, toHand(game, "Soul Partition"), { targets: [ref(mine)] });
    // The Plains are tapped: two Forests are {1}{G}, with no {2} on top.
    expect(offers(game, mine)).toHaveLength(1);
    expect(game.state.objects[mine].impulse?.tax?.exempt).toBe(A);
  });

  it("Release to the Wind: its owner casts it free, and only free", () => {
    const { game } = table();
    lands(game, "Island", 3);
    const bears = spawn(game, "Grizzly Bears", B);
    cast(game, toHand(game, "Release to the Wind"), { targets: [ref(bears)] });
    expect(offers(game, bears, A)).toEqual([]);
    toTurnOf(game, B);
    const offered = offers(game, bears, B);
    expect(offered).toHaveLength(1);
    expect(offered[0].kind === "cast-spell" && offered[0].free).toBe(true);
    game.dispatch({ type: "cast-spell", player: B, card: bears, targets: [], via: "impulse", free: true });
    settle(game);
    expect(zone(game, bears)).toBe("battlefield");
  });

  it("Suspend Aggression: each card its own owner's, until the end of that player's next turn", () => {
    const { game } = table();
    lands(game, "Plains", 2);
    lands(game, "Mountain", 1);
    const bears = spawn(game, "Grizzly Bears", B);
    const top = toLibrary(game, "Forest");
    cast(game, toHand(game, "Suspend Aggression"), { targets: [ref(bears)] });
    expect(zone(game, bears)).toBe("exile");
    expect(zone(game, top)).toBe("exile");
    expect(offers(game, top, A).map((o) => o.kind)).toEqual(["play-land"]);
    lands(game, "Forest", 2, B);
    toTurnOf(game, B);
    expect(offers(game, bears, B)).toHaveLength(1);
    expect(offers(game, top, B)).toEqual([]);
    // Alice's turn after: hers ended with the permission still on it…
    toTurnOf(game, A);
    expect(offers(game, top, A).map((o) => o.kind)).toEqual(["play-land"]);
    expect(game.state.objects[bears].impulse).toBeUndefined();
    // …and the end of this turn is the end of "her next turn".
    toTurnOf(game, B);
    expect(game.state.objects[top].impulse).toBeUndefined();
  });
});

describe("the options again, on other printings", () => {
  it("Rona: casts spells from among its cards, and a land among them stays exiled", () => {
    const { game, a } = table();
    const artifact = game.debugSpawn("Sol Ring", A, "graveyard");
    pickTargets(a, artifact);
    pickModes(a, 0);
    const rona = enter(game, "Rona, Disciple of Gix");
    expect(zone(game, artifact)).toBe("exile");
    expect(game.state.objects[artifact].exiledWith?.source).toBe(rona);
    lands(game, "Island", 5);
    expect(offers(game, artifact)).toHaveLength(1);
    const land = toLibrary(game, "Forest");
    activate(game, rona, 0);
    expect(zone(game, land)).toBe("exile");
    expect(offers(game, land)).toEqual([]);
    cast(game, artifact, { via: "impulse" });
    expect(zone(game, artifact)).toBe("battlefield");
  });

  it("Serpent's Soul-Jar: an Elf that died, cast once, and only after the permission", () => {
    const { game } = table();
    const jar = spawn(game, "Serpent's Soul-Jar");
    const elf = spawn(game, "Elvish Mystic");
    const other = spawn(game, "Llanowar Elves");
    lands(game, "Forest", 2);
    game.debugApplyEffect(A, { kind: "destroy", target: 0 }, [ref(elf)]);
    settle(game);
    game.debugApplyEffect(A, { kind: "destroy", target: 0 }, [ref(other)]);
    settle(game);
    expect(zone(game, elf)).toBe("exile");
    expect(offers(game, elf)).toEqual([]);
    activate(game, jar, 0);
    expect(game.state.players[A].life).toBe(18);
    expect(offers(game, elf)).toHaveLength(1);
    cast(game, elf, { via: "impulse" });
    expect(offers(game, other)).toEqual([]);
  });

  it("Null Summoner: the exiled card, only at threshold, with mana of any type", () => {
    const { game, a } = table();
    const bolt = toHand(game, "Lightning Bolt", B);
    const summoner = toHand(game, "Null Summoner");
    lands(game, "Swamp", 2);
    lands(game, "Island", 2);
    pickTargets(a, B);
    pickFromZone(a, bolt);
    cast(game, summoner);
    expect(zone(game, summoner)).toBe("battlefield");
    expect(zone(game, bolt)).toBe("exile");
    lands(game, "Swamp", 1);
    expect(offers(game, bolt)).toEqual([]);
    for (let i = 0; i < 7; i += 1) game.debugSpawn("Wastes", A, "graveyard");
    expect(offers(game, bolt)).toHaveLength(1);
  });

  it("Null Summoner: not cast, it exiles nothing", () => {
    const { game } = table();
    const bolt = toHand(game, "Lightning Bolt", B);
    enter(game, "Null Summoner");
    expect(zone(game, bolt)).toBe("hand");
  });

  it("Court of Locthwain: plays the card for good; the monarch casts one of them free this turn", () => {
    const { game, a } = table();
    const court = enter(game, "Court of Locthwain");
    const first = toLibrary(game, "Lightning Bolt", B);
    toLibrary(game, "Wastes", B); // What Bob draws on his turn.
    pickTargets(a, B);
    toStep(game, "upkeep", A);
    settle(game);
    expect(zone(game, first)).toBe("exile");
    toStep(game, "precombat-main", A);
    // Free: with no lands, the monarch's permission is all there is to pay with.
    const free = offers(game, first).filter((o) => o.kind === "cast-spell" && o.free === true);
    expect(free).toHaveLength(1);
    pickTargets(a, B);
    expect(game.state.objects[court].linkedCastGrants).toHaveLength(1);
    cast(game, first, { via: "impulse", free: true, targets: [ref(B)] });
    expect(zone(game, first)).toBe("graveyard");
    expect(game.state.players[B].life).toBe(17);
    // That free cast was the one the monarch's permission allowed.
    expect(game.state.objects[court].linkedCastGrants).toHaveLength(0);
  });

  it("Court of Locthwain: without the monarchy, no free cast, the mana cost in any type", () => {
    const { game, a } = table();
    enter(game, "Court of Locthwain");
    game.debugApplyEffect(B, { kind: "become-monarch" });
    settle(game);
    const card = toLibrary(game, "Lightning Bolt", B);
    // Bob's draw and his monarch's draw.
    toLibrary(game, "Wastes", B);
    toLibrary(game, "Wastes", B);
    pickTargets(a, B);
    toStep(game, "upkeep", A);
    settle(game);
    toStep(game, "precombat-main", A);
    expect(offers(game, card)).toEqual([]);
    lands(game, "Swamp", 1);
    expect(offers(game, card)).toHaveLength(1);
  });

  it("Gonti: exile one of four face down; the card is yours to cast, in any type, not to play", () => {
    const { game, a, b } = table();
    const land = toLibrary(game, "Forest", B);
    const bolt = toLibrary(game, "Lightning Bolt", B);
    pickTargets(a, B);
    pickFromZone(a, bolt);
    enter(game, "Gonti, Lord of Luxury");
    expect(zone(game, bolt)).toBe("exile");
    expect(game.state.objects[bolt].exiledFaceDown?.lookers).toEqual([A]);
    expect(b).toBeDefined();
    lands(game, "Swamp", 1);
    expect(offers(game, bolt)).toHaveLength(1);
    expect(offers(game, bolt, B)).toEqual([]);
    expect(game.state.objects[land].zone).toBe("library");
  });

  it("Gonti: a land it exiles stays exiled, cast only", () => {
    const { game, a } = table();
    const land = toLibrary(game, "Forest", B);
    pickTargets(a, B);
    pickFromZone(a, land);
    enter(game, "Gonti, Lord of Luxury");
    expect(zone(game, land)).toBe("exile");
    expect(offers(game, land)).toEqual([]);
  });

  it("Norin: a blocked creature of yours may be exiled and played this turn, its land too", () => {
    const { game, a, b } = table();
    spawn(game, "Norin, Swift Survivalist");
    const bears = spawn(game, "Grizzly Bears");
    const blocker = spawn(game, "Grizzly Bears", B);
    lands(game, "Forest", 2);
    b.declareBlockersFn = () => [{ blocker, attacker: bears }];
    pickModes(a, 0);
    attack(game, a, [bears]);
    expect(zone(game, bears)).toBe("exile");
    expect(offers(game, bears)).toHaveLength(1);
    nextTurn(game);
    expect(offers(game, bears)).toEqual([]);
  });
});

describe("a taxed permission from a hand", () => {
  it("Elite Spellbinder: you look and may exile a nonland; its owner pays {2} more", () => {
    const { game, a } = table();
    const land = toHand(game, "Forest", B);
    const bolt = toHand(game, "Lightning Bolt", B);
    pickTargets(a, B);
    const seen = pickFromZone(a, bolt);
    enter(game, "Elite Spellbinder");
    expect(seen.offered).toContain(bolt);
    expect(seen.offered).not.toContain(land);
    expect(zone(game, bolt)).toBe("exile");
    expect(game.state.objects[bolt].impulse?.player).toBe(B);
    lands(game, "Mountain", 2, B);
    toTurnOf(game, B);
    expect(offers(game, bolt, B)).toEqual([]);
    lands(game, "Mountain", 1, B);
    expect(offers(game, bolt, B)).toHaveLength(1);
    expect(offers(game, bolt, A)).toEqual([]);
  });

  it("Elite Spellbinder: it may exile nothing", () => {
    const { game, a } = table();
    const bolt = toHand(game, "Lightning Bolt", B);
    pickTargets(a, B);
    pickFromZone(a);
    enter(game, "Elite Spellbinder");
    expect(zone(game, bolt)).toBe("hand");
  });

  it("Lightstall Inquisitor: each opponent's own card, {1} more, and a land enters tapped", () => {
    const { game, b, c } = table({ players: 3 });
    const bolt = toHand(game, "Lightning Bolt", B);
    const land = toHand(game, "Forest", C);
    toHand(game, "Grizzly Bears", C);
    pickFromZone(b, bolt);
    pickFromZone(c, land);
    enter(game, "Lightstall Inquisitor");
    expect(zone(game, bolt)).toBe("exile");
    expect(zone(game, land)).toBe("exile");
    expect(game.state.objects[bolt].impulse?.player).toBe(B);
    expect(game.state.objects[land].impulse?.player).toBe(C);
    lands(game, "Mountain", 1, B);
    toTurnOf(game, B);
    expect(offers(game, bolt, B)).toEqual([]);
    lands(game, "Mountain", 1, B);
    expect(offers(game, bolt, B)).toHaveLength(1);
    toTurnOf(game, C);
    expect(offers(game, land, C).map((o) => o.kind)).toEqual(["play-land"]);
    game.dispatch({ type: "play-land", player: C, card: land });
    expect(zone(game, land)).toBe("battlefield");
    expect(game.state.objects[land].tapped).toBe(true);
  });
});
