/**
 * Taking cards a player owns from exile: Battle for Zendikar's processors'
 * "put a card an opponent owns from exile into that player's graveyard" — as
 * an effect (`look-and-choose`'s `"exile"` zone), an activation cost
 * (`AbilityCost.putFromExile`) and a spell's additional cost
 * (`additionalCost.putFromExile`) — and Oblivion Sower's "land cards that
 * player owns from exile onto the battlefield under your control".
 */
import { describe, expect, it } from "vitest";

import type { Game } from "../game.js";
import type { ObjectId, PlayerId } from "../primitives.js";
import { viewFor } from "../view.js";
import {
  A,
  B,
  C,
  activate,
  cast,
  controller,
  enter,
  graveyard,
  lands,
  pickFromZone,
  pickModes,
  pickTargets,
  pt,
  ref,
  settle,
  spawn,
  table,
  toExile,
  toHand,
  toLibrary,
  tokensNamed,
  zone,
} from "./harness.js";

/** Exile `name` for `owner` face down, in face-down group `group` (as one
 * instruction would at one time). */
function faceDown(game: Game, name: string, owner: PlayerId, group: number): ObjectId {
  const id = toExile(game, name, owner);
  game.state.objects[id].exiledFaceDown = { lookers: [owner], group };
  return id;
}

describe("a processor's effect: you may put a card an opponent owns from exile into that player's graveyard", () => {
  it("offers only the opponents' exiled cards; the card goes to its owner's graveyard and the 'if you do' happens", () => {
    const { game, a } = table();
    const bears = spawn(game, "Grizzly Bears", B);
    const theirs = toExile(game, "Hill Giant", B);
    const mine = toExile(game, "Hill Giant", A);
    pickModes(a, 0);
    pickTargets(a, bears);
    const seen = pickFromZone(a, theirs);
    enter(game, "Wasteland Strangler");
    expect(seen.offered).toEqual([theirs]);
    expect(seen.offered).not.toContain(mine);
    expect(graveyard(game, B)).toContain(theirs);
    expect(zone(game, mine)).toBe("exile");
    expect(zone(game, bears)).toBe("graveyard");
  });

  it("declined, or with nothing to put, the 'if you do' doesn't happen", () => {
    const { game, a } = table();
    const giant = spawn(game, "Hill Giant", B);
    toExile(game, "Hill Giant", A);
    pickModes(a, 0);
    pickTargets(a, giant);
    enter(game, "Wasteland Strangler");
    expect(pt(game, giant)).toEqual({ power: 3, toughness: 3 });
    // Declined with one there: it stays, and nothing happens.
    const theirs = toExile(game, "Grizzly Bears", B);
    pickModes(a);
    pickTargets(a, giant);
    enter(game, "Wasteland Strangler");
    expect(zone(game, theirs)).toBe("exile");
    expect(pt(game, giant)).toEqual({ power: 3, toughness: 3 });
  });

  it("under Rest in Peace the card is exiled again, and 'if you do' still holds (the ruling)", () => {
    const { game, a } = table();
    spawn(game, "Rest in Peace", B);
    const giant = spawn(game, "Hill Giant", B);
    const theirs = toExile(game, "Grizzly Bears", B);
    pickModes(a, 0);
    pickTargets(a, giant);
    pickFromZone(a, theirs);
    enter(game, "Wasteland Strangler");
    expect(graveyard(game, B)).toHaveLength(0);
    // A 0/0 now: Rest in Peace exiles it too.
    expect(zone(game, giant)).toBe("exile");
  });

  it("two cards or nothing: with one there, none is put and nothing is countered (rule 118.3)", () => {
    const { game, a } = table();
    lands(game, "Forest", 2);
    const theirs = toExile(game, "Hill Giant", B);
    const bears = toHand(game, "Grizzly Bears");
    cast(game, bears, { settle: false });
    pickModes(a, 0);
    pickTargets(a, bears);
    enter(game, "Ulamog's Nullifier", A, { settle: false });
    settle(game);
    expect(zone(game, theirs)).toBe("exile");
    expect(zone(game, bears)).toBe("battlefield");
  });

  it("two cards of different opponents, each to its owner's graveyard, counter target spell", () => {
    const { game, a } = table({ players: 3 });
    lands(game, "Forest", 2);
    const bobs = toExile(game, "Hill Giant", B);
    const carols = toExile(game, "Hill Giant", C);
    const bears = toHand(game, "Grizzly Bears");
    cast(game, bears, { settle: false });
    pickModes(a, 0);
    pickTargets(a, bears);
    pickFromZone(a, bobs, carols);
    enter(game, "Ulamog's Nullifier", A, { settle: false });
    settle(game);
    expect(graveyard(game, B)).toContain(bobs);
    expect(graveyard(game, C)).toContain(carols);
    expect(zone(game, bears)).toBe("graveyard");
  });

  it("a face-down card is chosen by its group, hidden from the chooser, and taken from it at random (the ruling)", () => {
    const { game, a } = table();
    const giant = spawn(game, "Hill Giant", B);
    const first = faceDown(game, "Grizzly Bears", B, 1);
    const second = faceDown(game, "Lightning Bolt", B, 1);
    const faceUp = toExile(game, "Hill Giant", B);
    pickModes(a, 0);
    pickTargets(a, giant);
    let hiddenFromChooser = false;
    let offered: readonly ObjectId[] = [];
    a.chooseFromZoneFn = (view, eligible) => {
      offered = eligible;
      const seen = viewFor(view.state, game.registry, A);
      hiddenFromChooser = seen.objects[first] === undefined && seen.objects[second] === undefined && seen.objects[faceUp] !== undefined;
      return [second];
    };
    enter(game, "Wasteland Strangler");
    expect(offered).toEqual(expect.arrayContaining([first, second, faceUp]));
    expect(hiddenFromChooser).toBe(true);
    const went = [first, second].filter((id) => zone(game, id) === "graveyard");
    expect(went).toHaveLength(1);
    expect(zone(game, faceUp)).toBe("exile");
    expect(zone(game, giant)).toBe("graveyard");
  });

  it("from the target opponent's exiled cards only, by a filter a face-down card never matches (Memory Theft)", () => {
    const { game, a } = table();
    lands(game, "Swamp", 3);
    toHand(game, "Hill Giant", B);
    const adventurer = toExile(game, "Bonecrusher Giant", B);
    const hidden = toExile(game, "Bonecrusher Giant", B);
    game.state.objects[hidden].exiledFaceDown = { lookers: [B], group: 7 };
    const plain = toExile(game, "Grizzly Bears", B);
    const theft = toHand(game, "Memory Theft");
    let offered: readonly ObjectId[] = [];
    a.chooseFromZoneFn = (_view, eligible) => {
      offered = eligible;
      return eligible.includes(adventurer) ? [adventurer] : eligible.slice(0, 1);
    };
    cast(game, theft, { targets: [ref(B)] });
    expect(offered).toEqual([adventurer]);
    expect(graveyard(game, B)).toContain(adventurer);
    expect(zone(game, hidden)).toBe("exile");
    expect(zone(game, plain)).toBe("exile");
  });
});

describe("a processor's cost", () => {
  it("an activation cost: refused with no card an opponent owns in exile; paid, it's in their graveyard (Void Attendant)", () => {
    const { game, a } = table();
    lands(game, "Forest", 4);
    const attendant = spawn(game, "Void Attendant");
    toExile(game, "Grizzly Bears", A);
    expect(() => activate(game, attendant, 0)).toThrow(/too few cards in exile/);
    const first = toExile(game, "Hill Giant", B);
    const other = toExile(game, "Hill Giant", B);
    pickFromZone(a, other);
    activate(game, attendant, 0);
    expect(graveyard(game, B)).toEqual([other]);
    expect(zone(game, first)).toBe("exile");
    expect(tokensNamed(game, "Eldrazi Scion Token", A)).toBe(1);
  });

  it("a spell's additional cost: uncastable without one, paid as it's cast (Processor Assault)", () => {
    const { game } = table();
    lands(game, "Mountain", 2);
    const giant = spawn(game, "Hill Giant", B);
    const assault = toHand(game, "Processor Assault");
    expect(() => cast(game, assault, { targets: [ref(giant)] })).toThrow(/too few cards in exile/);
    const theirs = toExile(game, "Grizzly Bears", B);
    cast(game, assault, { targets: [ref(giant)] });
    expect(graveyard(game, B)).toEqual(expect.arrayContaining([theirs, giant]));
  });
});

describe("Oblivion Sower: land cards that player owns from exile, onto the battlefield under your control", () => {
  it("every land card the target opponent owns in exile, however exiled — never a face-down one, nor another player's", () => {
    const { game, a } = table({ deck: "Grizzly Bears" });
    lands(game, "Wastes", 6);
    const topLand = toLibrary(game, "Forest", B);
    const earlier = toExile(game, "Mountain", B);
    const hidden = faceDown(game, "Island", B, 3);
    const mine = toExile(game, "Plains", A);
    const sower = toHand(game, "Oblivion Sower");
    let offered: readonly ObjectId[] = [];
    a.chooseFromZoneFn = (_view, eligible) => {
      offered = eligible;
      return eligible;
    };
    pickTargets(a, B);
    cast(game, sower);
    expect(offered).toEqual(expect.arrayContaining([topLand, earlier]));
    expect(offered).toHaveLength(2);
    expect(zone(game, topLand)).toBe("battlefield");
    expect(controller(game, topLand)).toBe(A);
    expect(controller(game, earlier)).toBe(A);
    expect(zone(game, hidden)).toBe("exile");
    expect(zone(game, mine)).toBe("exile");
  });
});
