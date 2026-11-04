/**
 * "Exile ~, then return it to the battlefield transformed under its owner's
 * control", and a Saga back face's "Exile this Saga, then return it to the
 * battlefield (front face up)" — March of the Machine's Praetors, Urabrask //
 * The Great Work and Sheoldred // The True Scriptures. A `flicker` of the
 * source both ways: back face up when `transformed` (rule 712.14a), front face
 * up by default (712.14), each a new object (400.7).
 */
import { describe, expect, it } from "vitest";

import type { Game } from "../game.js";
import type { ObjectId, PlayerId } from "../primitives.js";
import { printedCardName } from "../state.js";
import {
  A,
  B,
  C,
  activate,
  cast,
  controller,
  counters,
  graveyard,
  keywords,
  lands,
  life,
  nextTurn,
  pickTargets,
  ref,
  settle,
  spawn,
  table,
  toGraveyard,
  toHand,
  tokensNamed,
  types,
  zone,
} from "./harness.js";

const faceOf = (game: Game, id: ObjectId): string => printedCardName(game.state.objects[id]);
const stint = (game: Game, id: ObjectId): number => game.state.objects[id].zoneChangeCount ?? 0;
const graveyardCasts = (game: Game, card: ObjectId, player: PlayerId = A) =>
  game
    .legalActions(player)
    .filter((a) => a.kind === "cast-spell" && a.card === card && a.via === "graveyard-permission");
const canActivate = (game: Game, source: ObjectId): boolean =>
  game.legalActions(A).some((a) => a.kind === "activate-ability" && a.source === source);

/** `n` spells cast and resolved by Alice this turn. */
function castOpts(game: Game, n: number): void {
  for (let i = 0; i < n; i += 1) {
    lands(game, "Island", 1);
    cast(game, toHand(game, "Opt"));
  }
}

/** `front`'s back face, a Saga on the battlefield with `lore` lore counters. */
function sagaOf(game: Game, front: string, lore: number, player: PlayerId = A): ObjectId {
  const saga = spawn(game, front, player);
  game.state.objects[saga].face = 1;
  game.state.objects[saga].counters.lore = lore;
  return saga;
}

/** Alice's next turn's precombat main, a Saga's next lore counter (rule 714.3c)
 * and the chapter it set off resolved. */
function nextChapter(game: Game): void {
  do nextTurn(game);
  while (game.state.turnOrder[game.state.turn.activePlayerIndex] !== A);
  settle(game);
}

describe("Urabrask", () => {
  it("deals 1 damage to the target opponent and adds {R} as you cast an instant or sorcery", () => {
    const { game, a } = table({ players: 3 });
    spawn(game, "Urabrask");
    lands(game, "Island", 1);
    pickTargets(a, C);
    cast(game, toHand(game, "Opt"));
    expect(life(game, C)).toBe(19);
    expect(life(game, B)).toBe(20);
    expect(game.state.players[A].manaPool.map((unit) => unit.type)).toEqual(["R"]);
  });

  it("only flips as a sorcery, once you've cast three instants and/or sorceries this turn", () => {
    const { game } = table();
    const urabrask = spawn(game, "Urabrask");
    lands(game, "Mountain", 1);
    castOpts(game, 2);
    expect(canActivate(game, urabrask)).toBe(false);
    lands(game, "Island", 1);
    // The third: while it's on the stack the count is met, but not the timing.
    cast(game, toHand(game, "Opt"), { settle: false });
    expect(canActivate(game, urabrask)).toBe(false);
    settle(game);
    expect(canActivate(game, urabrask)).toBe(true);
  });

  it("comes back as The Great Work, a new object with a lore counter, its chapter I hitting that opponent and their creatures", () => {
    const { game, a } = table({ players: 3 });
    const urabrask = spawn(game, "Urabrask");
    const bBears = spawn(game, "Grizzly Bears", B);
    const cBears = spawn(game, "Grizzly Bears", C);
    const mine = spawn(game, "Grizzly Bears");
    pickTargets(a, C);
    castOpts(game, 3);
    expect(life(game, C)).toBe(17);
    lands(game, "Mountain", 1);
    pickTargets(a, B);
    const before = stint(game, urabrask);
    activate(game, urabrask, 0);
    expect(zone(game, urabrask)).toBe("battlefield");
    expect(stint(game, urabrask)).toBeGreaterThan(before);
    expect(faceOf(game, urabrask)).toBe("The Great Work");
    expect(types(game, urabrask)).toEqual(["enchantment"]);
    expect(counters(game, urabrask, "lore")).toBe(1);
    expect(life(game, B)).toBe(17);
    expect(life(game, C)).toBe(17);
    expect(zone(game, bBears)).toBe("graveyard");
    expect(zone(game, cBears)).toBe("battlefield");
    expect(zone(game, mine)).toBe("battlefield");
  });

  it("returns under its owner's control, though it was stolen", () => {
    const { game, b } = table();
    const urabrask = spawn(game, "Urabrask", B);
    game.debugApplyEffect(A, { kind: "gain-control", target: 0, untilEndOfTurn: false }, [ref(urabrask)]);
    settle(game);
    expect(controller(game, urabrask)).toBe(A);
    castOpts(game, 3);
    lands(game, "Mountain", 1);
    pickTargets(b, A);
    activate(game, urabrask, 0);
    expect(faceOf(game, urabrask)).toBe("The Great Work");
    expect(controller(game, urabrask)).toBe(B);
    expect(life(game, A)).toBe(17);
  });
});

describe("The Great Work", () => {
  it("chapter II makes three Treasures", () => {
    const { game } = table();
    const work = sagaOf(game, "Urabrask", 1);
    nextChapter(game);
    expect(tokensNamed(game, "Treasure Token", A)).toBe(3);
    expect(counters(game, work, "lore")).toBe(2);
  });

  it("chapter III lets you cast from any graveyard this turn, exiling what you cast, and flips the Saga front face up", () => {
    const { game } = table();
    const work = sagaOf(game, "Urabrask", 2);
    const mine = toGraveyard(game, "Opt");
    const theirs = toGraveyard(game, "Divination", B);
    const bears = toGraveyard(game, "Grizzly Bears", B);
    const before = stint(game, work);
    nextChapter(game);
    // Exiled and back, as a new object: never sacrificed (rule 714.4).
    expect(zone(game, work)).toBe("battlefield");
    expect(stint(game, work)).toBeGreaterThan(before);
    expect(graveyard(game, A)).toContain(mine);
    expect(faceOf(game, work)).toBe("Urabrask");
    expect(types(game, work)).toEqual(["creature"]);
    expect(keywords(game, work).has("first-strike")).toBe(true);
    expect(counters(game, work, "lore")).toBe(0);
    lands(game, "Island", 3);
    expect(graveyardCasts(game, mine).length).toBe(1);
    expect(graveyardCasts(game, theirs).length).toBe(1);
    expect(graveyardCasts(game, bears)).toEqual([]);
    cast(game, theirs, { via: "graveyard-permission" });
    // Its owner's card, exiled instead of going back; and Urabrask's cast
    // trigger hit the only opponent there is to aim at.
    expect(zone(game, theirs)).toBe("exile");
    expect(life(game, B)).toBe(19);
    // The permission ends with the turn.
    nextChapter(game);
    expect(graveyardCasts(game, mine)).toEqual([]);
  });

  it("chapter III returns the Saga under the control of whoever controlled the ability, not its owner (rule 110.2a)", () => {
    const { game } = table();
    const work = sagaOf(game, "Urabrask", 2, B);
    game.debugApplyEffect(A, { kind: "gain-control", target: 0, untilEndOfTurn: false }, [ref(work)]);
    settle(game);
    expect(controller(game, work)).toBe(A);
    const before = stint(game, work);
    nextChapter(game);
    expect(stint(game, work)).toBeGreaterThan(before);
    expect(faceOf(game, work)).toBe("Urabrask");
    expect(controller(game, work)).toBe(A);
  });
});

describe("Sheoldred", () => {
  it("makes each opponent sacrifice a nontoken creature or planeswalker of their choice as it enters", () => {
    const { game, b, c } = table({ players: 3 });
    const bBears = spawn(game, "Grizzly Bears", B);
    const bElves = spawn(game, "Llanowar Elves", B);
    const cWalker = spawn(game, "Jace Beleren", C);
    const mine = spawn(game, "Grizzly Bears");
    b.chooseSacrificesFn = () => [bElves];
    c.chooseSacrificesFn = () => [cWalker];
    const sheoldred = toHand(game, "Sheoldred");
    lands(game, "Swamp", 5);
    cast(game, sheoldred);
    expect(zone(game, bElves)).toBe("graveyard");
    expect(zone(game, bBears)).toBe("battlefield");
    expect(zone(game, cWalker)).toBe("graveyard");
    expect(zone(game, mine)).toBe("battlefield");
    expect(keywords(game, sheoldred).has("menace")).toBe(true);
  });

  it("flips only as a sorcery with an opponent at eight or more cards in their graveyard", () => {
    const { game, a } = table({ players: 3 });
    const sheoldred = spawn(game, "Sheoldred");
    lands(game, "Swamp", 5);
    for (let i = 0; i < 7; i += 1) toGraveyard(game, "Wastes", B);
    expect(canActivate(game, sheoldred)).toBe(false);
    toGraveyard(game, "Wastes", C);
    // Eight across two graveyards aren't an opponent's eight.
    expect(canActivate(game, sheoldred)).toBe(false);
    toGraveyard(game, "Wastes", B);
    expect(canActivate(game, sheoldred)).toBe(true);
    const walker = spawn(game, "Jace Beleren", C);
    const bears = spawn(game, "Grizzly Bears", B);
    pickTargets(a, bears, walker);
    activate(game, sheoldred, 0);
    expect(faceOf(game, sheoldred)).toBe("The True Scriptures");
    expect(counters(game, sheoldred, "lore")).toBe(1);
    // Chapter I: up to one target per opponent, each that opponent's.
    expect(zone(game, bears)).toBe("graveyard");
    expect(zone(game, walker)).toBe("graveyard");
  });
});

describe("The True Scriptures", () => {
  it("chapter II: each opponent discards three cards, then mills three", () => {
    const { game, b, c } = table({ players: 3 });
    sagaOf(game, "Sheoldred", 1);
    const bBears = toHand(game, "Grizzly Bears", B);
    const bOpt = toHand(game, "Opt", B);
    const bElves = toHand(game, "Llanowar Elves", B);
    const cOpt = toHand(game, "Opt", C);
    b.chooseDiscardsFn = () => [bBears, bOpt, bElves];
    c.chooseDiscardsFn = (hand, count) => [cOpt, ...hand.filter((card) => card.id !== cOpt).map((card) => card.id)].slice(0, count);
    const before = { b: graveyard(game, B).length, c: graveyard(game, C).length };
    nextChapter(game);
    for (const id of [bBears, bOpt, bElves, cOpt]) expect(zone(game, id)).toBe("graveyard");
    expect(graveyard(game, B).length).toBeGreaterThanOrEqual(before.b + 6);
    expect(graveyard(game, C).length).toBeGreaterThanOrEqual(before.c + 4);
  });

  it("chapter III puts every graveyard's creature cards onto the battlefield under your control and flips, Sheoldred's enters ability triggering", () => {
    const { game, b } = table();
    const scriptures = sagaOf(game, "Sheoldred", 2);
    const mine = toGraveyard(game, "Grizzly Bears");
    const theirs = toGraveyard(game, "Grizzly Bears", B);
    const notACreature = toGraveyard(game, "Opt", B);
    const victim = spawn(game, "Llanowar Elves", B);
    b.chooseSacrificesFn = () => [victim];
    nextChapter(game);
    expect(zone(game, mine)).toBe("battlefield");
    expect(controller(game, mine)).toBe(A);
    expect(zone(game, theirs)).toBe("battlefield");
    expect(controller(game, theirs)).toBe(A);
    expect(zone(game, notACreature)).toBe("graveyard");
    expect(faceOf(game, scriptures)).toBe("Sheoldred");
    expect(controller(game, scriptures)).toBe(A);
    expect(zone(game, victim)).toBe("graveyard");
  });
});
