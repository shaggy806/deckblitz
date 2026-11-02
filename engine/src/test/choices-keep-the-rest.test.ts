/**
 * "Each player chooses …. Destroy the rest": a `vote` with `choose`, then a
 * mass effect whose filter reads what was chosen (`notThisWay: "chosen"`) —
 * Divine Reckoning, Duneblast, Mount Doom, Fall of the First Civilization,
 * Fortunate Few — and "destroy each permanent chosen this way" (`thisWay` —
 * Druid of Purification). Choices go one at a time, each player knowing those
 * before theirs (rule 101.4), and the destruction waits for them all.
 */
import { describe, expect, it } from "vitest";
import type { Game } from "../game.js";
import type { ObjectId, PlayerId } from "../primitives.js";
import {
  A,
  activate,
  B,
  C,
  cast,
  D,
  enter,
  lands,
  nextTurn,
  pickPermanents,
  settle,
  spawn,
  table,
  toHand,
  zone,
} from "./harness.js";

const BEARS = "Grizzly Bears";
const ARTIFACT = "Chromatic Lantern";
const LEGENDARY_ARTIFACT = "Mox Amber";
const TOKEN = "Soldier Token";
const onField = (game: Game, id: ObjectId): boolean => zone(game, id) === "battlefield";

/** A compacted stack of real tokens: a batch of eight or more. */
function stackOf(game: Game, player: PlayerId, count: number): ObjectId {
  game.debugApplyEffect(player, { kind: "create-token", token: TOKEN, count });
  const stack = game.state.zones.shared.battlefield.find(
    (id) => game.state.objects[id].cardName === TOKEN && game.state.objects[id].controller === player,
  );
  if (stack === undefined || (game.state.objects[stack].stackCount ?? 1) !== count) {
    throw new Error(`expected one stack of ${count}`);
  }
  return stack;
}

const tokensLeft = (game: Game): number =>
  game.state.zones.shared.battlefield
    .map((id) => game.state.objects[id])
    .filter((o) => o.cardName === TOKEN)
    .reduce((n, o) => n + (o.stackCount ?? 1), 0);

describe("each player chooses, destroy the rest (Divine Reckoning)", () => {
  it("each player keeps the creature they chose, and the rest are destroyed at once", () => {
    const { game, a, b } = table();
    const keptA = spawn(game, BEARS, A);
    const lostA = spawn(game, BEARS, A);
    const keptB = spawn(game, BEARS, B);
    const lostB = spawn(game, "Savannah Lions", B);
    const askedA = pickPermanents(a, keptA);
    const askedB = pickPermanents(b, keptB);
    lands(game, "Plains", 4);
    cast(game, toHand(game, "Divine Reckoning"));
    expect(askedA.offered).toEqual(expect.arrayContaining([keptA, lostA]));
    expect(askedA.offered).not.toContain(keptB);
    expect(askedB.offered).toEqual(expect.arrayContaining([keptB, lostB]));
    expect(onField(game, keptA)).toBe(true);
    expect(onField(game, keptB)).toBe(true);
    expect(zone(game, lostA)).toBe("graveyard");
    expect(zone(game, lostB)).toBe("graveyard");
  });

  it("asks the active player first, and a player with nothing to choose isn't asked", () => {
    const { game, a, b } = table({ players: 3 });
    const order: string[] = [];
    const mine = spawn(game, BEARS, A);
    const other = spawn(game, BEARS, A);
    const theirs = spawn(game, BEARS, B);
    const second = spawn(game, BEARS, B);
    a.choosePermanentsFn = () => {
      order.push("a");
      return [mine];
    };
    b.choosePermanentsFn = () => {
      order.push("b");
      return [theirs];
    };
    lands(game, "Plains", 4);
    cast(game, toHand(game, "Divine Reckoning"));
    expect(order).toEqual(["a", "b"]);
    expect(onField(game, mine)).toBe(true);
    expect(zone(game, other)).toBe("graveyard");
    expect(zone(game, second)).toBe("graveyard");
  });

  it("one creature kept without being asked: nothing to choose", () => {
    const { game, a, b } = table();
    const only = spawn(game, BEARS, A);
    const keptB = spawn(game, BEARS, B);
    const lostB = spawn(game, BEARS, B);
    let aAsked = false;
    a.choosePermanentsFn = () => {
      aAsked = true;
      return [];
    };
    pickPermanents(b, keptB);
    lands(game, "Plains", 4);
    cast(game, toHand(game, "Divine Reckoning"));
    expect(aAsked).toBe(false);
    expect(onField(game, only)).toBe(true);
    expect(zone(game, lostB)).toBe("graveyard");
  });

  it("one token of a stack kept: only that token stays", () => {
    const { game, a } = table();
    const stack = stackOf(game, A, 9);
    pickPermanents(a, stack);
    lands(game, "Plains", 4);
    cast(game, toHand(game, "Divine Reckoning"));
    expect(tokensLeft(game)).toBe(1);
  });

  it("flashback casts it again from the graveyard", () => {
    const { game, a } = table();
    const card = toHand(game, "Divine Reckoning");
    const keptA = spawn(game, BEARS, A);
    const lostA = spawn(game, BEARS, A);
    const keptB = spawn(game, BEARS, B);
    pickPermanents(a, keptA);
    lands(game, "Plains", 11);
    cast(game, card);
    expect(zone(game, lostA)).toBe("graveyard");
    const more = spawn(game, BEARS, A);
    pickPermanents(a, more);
    cast(game, card, { via: "flashback" });
    expect(zone(game, keptA)).toBe("graveyard");
    expect(onField(game, keptB)).toBe(true);
    expect(zone(game, card)).toBe("exile");
  });
});

describe("the controller chooses (Duneblast, Mount Doom)", () => {
  it("Duneblast spares the one creature chosen, whoever controls it, untargeted", () => {
    const { game, a } = table();
    const mine = spawn(game, BEARS, A);
    const theirs = spawn(game, BEARS, B);
    const asked = pickPermanents(a, theirs);
    lands(game, "Plains", 5);
    lands(game, "Swamp", 1);
    lands(game, "Forest", 1);
    cast(game, toHand(game, "Duneblast"));
    expect(asked.offered).toEqual(expect.arrayContaining([mine, theirs]));
    expect(onField(game, theirs)).toBe(true);
    expect(zone(game, mine)).toBe("graveyard");
  });

  it("Duneblast with none chosen destroys every creature (the ruling)", () => {
    const { game, a } = table();
    const mine = spawn(game, BEARS, A);
    const theirs = spawn(game, BEARS, B);
    pickPermanents(a);
    lands(game, "Plains", 5);
    lands(game, "Swamp", 1);
    lands(game, "Forest", 1);
    cast(game, toHand(game, "Duneblast"));
    expect(zone(game, mine)).toBe("graveyard");
    expect(zone(game, theirs)).toBe("graveyard");
  });

  it("Mount Doom's sacrifice and up to two creatures spared", () => {
    const { game, a } = table();
    const doom = spawn(game, "Mount Doom", A);
    const artifact = spawn(game, LEGENDARY_ARTIFACT, A);
    const one = spawn(game, BEARS, A);
    const two = spawn(game, BEARS, B);
    const three = spawn(game, BEARS, B);
    lands(game, "Swamp", 6);
    lands(game, "Mountain", 1);
    pickPermanents(a, one, two);
    activate(game, doom, 3);
    expect(zone(game, doom)).toBe("graveyard");
    expect(zone(game, artifact)).toBe("graveyard");
    expect(onField(game, one)).toBe(true);
    expect(onField(game, two)).toBe(true);
    expect(zone(game, three)).toBe("graveyard");
  });
});

describe("three chosen, a different set destroyed (Fall of the First Civilization)", () => {
  it("chapter III keeps three of each player's nonland permanents and leaves lands alone", () => {
    const { game, a, b } = table();
    const saga = spawn(game, "Fall of the First Civilization", A);
    game.state.objects[saga].counters.lore = 2;
    const kept = [spawn(game, BEARS, A), spawn(game, BEARS, A), spawn(game, ARTIFACT, A)];
    const lost = spawn(game, BEARS, A);
    const land = spawn(game, "Plains", A);
    const theirs = [spawn(game, BEARS, B), spawn(game, ARTIFACT, B)];
    const asked = pickPermanents(a, ...kept);
    let bAsked = false;
    b.choosePermanentsFn = () => {
      bAsked = true;
      return [];
    };
    nextTurn(game);
    nextTurn(game);
    settle(game);
    expect(asked.offered).not.toContain(land);
    for (const id of kept) expect(onField(game, id)).toBe(true);
    expect(zone(game, lost)).toBe("graveyard");
    expect(onField(game, land)).toBe(true);
    // Two of theirs, three to choose: nothing to choose.
    expect(bAsked).toBe(false);
    for (const id of theirs) expect(onField(game, id)).toBe(true);
  });

  it("a stack named for two of its tokens keeps two of them", () => {
    const { game, a } = table();
    const saga = spawn(game, "Fall of the First Civilization", A);
    game.state.objects[saga].counters.lore = 2;
    const stack = stackOf(game, A, 9);
    const ring = spawn(game, ARTIFACT, A);
    pickPermanents(a, stack, stack, ring);
    nextTurn(game);
    nextTurn(game);
    settle(game);
    expect(tokensLeft(game)).toBe(2);
    expect(onField(game, ring)).toBe(true);
  });
});

describe("they don't control, not chosen before (Fortunate Few)", () => {
  it("you first, then from the active player, each offered only what's unchosen and not their own", () => {
    const { game, a, b, c, d } = table({ players: 4 });
    const ofA = spawn(game, BEARS, A);
    const ofB = spawn(game, BEARS, B);
    const ofC = spawn(game, BEARS, C);
    const ofD = spawn(game, BEARS, D);
    const extra = spawn(game, BEARS, D);
    const land = spawn(game, "Plains", D);
    const askedA = pickPermanents(a, ofB);
    const askedB = pickPermanents(b, ofC);
    const askedC = pickPermanents(c, ofD);
    const askedD = pickPermanents(d, ofA);
    lands(game, "Plains", 5);
    cast(game, toHand(game, "Fortunate Few"));
    expect(askedA.offered).not.toContain(ofA);
    expect(askedA.offered).not.toContain(land);
    expect(askedB.offered).not.toContain(ofB);
    expect(askedC.offered).not.toContain(ofB);
    expect(askedC.offered).not.toContain(ofC);
    // One left to choose: nothing to ask.
    expect(askedD.offered).toEqual([]);
    for (const id of [ofA, ofB, ofC, ofD]) expect(onField(game, id)).toBe(true);
    expect(zone(game, extra)).toBe("graveyard");
    expect(onField(game, land)).toBe(true);
  });
});

describe("destroy each permanent chosen (Druid of Purification)", () => {
  it("each player may choose, the same one twice is fine, and they go at once", () => {
    const { game, a, b } = table();
    const ring = spawn(game, ARTIFACT, B);
    const relic = spawn(game, LEGENDARY_ARTIFACT, B);
    const mine = spawn(game, ARTIFACT, A);
    const asked = pickPermanents(a, ring);
    pickPermanents(b);
    enter(game, "Druid of Purification", A);
    expect(asked.offered).not.toContain(mine);
    expect(zone(game, ring)).toBe("graveyard");
    expect(onField(game, relic)).toBe(true);
    expect(onField(game, mine)).toBe(true);
  });
});
