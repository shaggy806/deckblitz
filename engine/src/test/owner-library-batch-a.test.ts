/**
 * "Its owner puts it on their choice of the top or bottom of their library"
 * — the cards the owner's-choice `put-on-library` unblocked, group a.
 */
import { describe, expect, it } from "vitest";

import {
  A,
  B,
  cast,
  controller,
  counters,
  keywords,
  lands,
  named,
  pickModes,
  ref,
  spawn,
  table,
  toHand,
  tokensNamed,
  zone,
} from "./harness.js";
import type { Game } from "../game.js";
import type { ObjectId, PlayerId } from "../primitives.js";

const library = (game: Game, player: PlayerId): readonly ObjectId[] => game.state.zones.perPlayer[player].library;
const isTapped = (game: Game, id: ObjectId): boolean => game.state.objects[id].tapped;

describe("Unlucky Drop", () => {
  it("a stolen artifact's owner chooses, not its controller", () => {
    const { game, a, b } = table();
    const ring = spawn(game, "Sol Ring", B);
    game.debugApplyEffect(A, { kind: "gain-control", target: 0, untilEndOfTurn: false }, [ref(ring)]);
    expect(controller(game, ring)).toBe(A);
    let aAsked = false;
    a.chooseModesFn = (_view, min) => {
      aAsked = true;
      return min > 0 ? [0] : [];
    };
    pickModes(b, 1);
    lands(game, "Island", 4);
    cast(game, toHand(game, "Unlucky Drop"), { targets: [ref(ring)] });
    expect(aAsked).toBe(false);
    const lib = library(game, B);
    expect(lib[lib.length - 1]).toBe(ring);
  });
});

describe("Trip Up", () => {
  it("puts a nonland permanent on top of its owner's library at the owner's choice", () => {
    const { game, b } = table();
    const angel = spawn(game, "Serra Angel", B);
    pickModes(b, 0);
    lands(game, "Island", 4);
    cast(game, toHand(game, "Trip Up"), { targets: [ref(angel)] });
    expect(library(game, B)[0]).toBe(angel);
  });
});

describe("Lost Days", () => {
  it("the owner picks second from the top or the bottom, and you create a Clue", () => {
    const { game, b } = table();
    const angel = spawn(game, "Serra Angel", B);
    let asked: readonly string[] = [];
    b.chooseModesFn = (_view, _min, _max, texts) => {
      asked = texts;
      return [0];
    };
    lands(game, "Island", 5);
    cast(game, toHand(game, "Lost Days"), { targets: [ref(angel)] });
    expect(asked).toEqual(["Put it second from the top of your library", "Put it on the bottom of your library"]);
    expect(library(game, B)[1]).toBe(angel);
    expect(tokensNamed(game, "Clue Token", A)).toBe(1);
    expect(tokensNamed(game, "Clue Token", B)).toBe(0);
  });
});

describe("Return to the Sewers", () => {
  it("the owner picks the bottom, and you create a Mutagen", () => {
    const { game, b } = table();
    const bears = spawn(game, "Grizzly Bears", B);
    pickModes(b, 1);
    lands(game, "Island", 4);
    cast(game, toHand(game, "Return to the Sewers"), { targets: [ref(bears)] });
    const lib = library(game, B);
    expect(lib[lib.length - 1]).toBe(bears);
    expect(tokensNamed(game, "Mutagen Token", A)).toBe(1);
  });
});

describe("Vanish from Sight", () => {
  it("the owner picks the top; the surveil is yours, of your library", () => {
    const { game, b } = table();
    const angel = spawn(game, "Serra Angel", B);
    pickModes(b, 0);
    lands(game, "Island", 4);
    cast(game, toHand(game, "Vanish from Sight"), { targets: [ref(angel)] });
    expect(library(game, B)[0]).toBe(angel);
  });
});

describe("Trickster's Stratagem", () => {
  it("the owner picks second from the top, then your creature connives", () => {
    const { game, a, b } = table();
    const angel = spawn(game, "Serra Angel", B);
    const bears = spawn(game, "Grizzly Bears", A);
    const giant = toHand(game, "Hill Giant");
    a.chooseDiscardsFn = () => [giant];
    let asked: readonly string[] = [];
    b.chooseModesFn = (_view, _min, _max, texts) => {
      asked = texts;
      return [0];
    };
    lands(game, "Island", 4);
    cast(game, toHand(game, "Trickster's Stratagem"), { targets: [ref(angel), ref(bears)] });
    expect(asked).toEqual(["Put it second from the top of your library", "Put it on the bottom of your library"]);
    expect(library(game, B)[1]).toBe(angel);
    expect(zone(game, giant)).toBe("graveyard");
    expect(counters(game, bears)).toBe(1);
  });

  it("your own creature an opponent controls: you, its owner, choose", () => {
    const { game, a, b } = table();
    const bears = spawn(game, "Grizzly Bears", A);
    game.debugApplyEffect(B, { kind: "gain-control", target: 0, untilEndOfTurn: false }, [ref(bears)]);
    expect(controller(game, bears)).toBe(B);
    let bAsked = false;
    b.chooseModesFn = (_view, min) => {
      bAsked = true;
      return min > 0 ? [0] : [];
    };
    pickModes(a, 1);
    lands(game, "Island", 4);
    cast(game, toHand(game, "Trickster's Stratagem"), { targets: [ref(bears), null] });
    expect(bAsked).toBe(false);
    const lib = library(game, A);
    expect(lib[lib.length - 1]).toBe(bears);
  });
});

describe("Ice Magic", () => {
  it("Blizzara costs {2} more, and the creature's owner picks the bottom", () => {
    const { game, b } = table();
    const angel = spawn(game, "Serra Angel", B);
    pickModes(b, 1);
    const islands = lands(game, "Island", 4);
    cast(game, toHand(game, "Ice Magic"), { modes: [1], targets: [ref(angel)] });
    const lib = library(game, B);
    expect(lib[lib.length - 1]).toBe(angel);
    expect(islands.filter((i) => isTapped(game, i))).toHaveLength(4);
  });

  it("Blizzard returns it to its owner's hand for {1}{U}", () => {
    const { game } = table();
    const angel = spawn(game, "Serra Angel", B);
    const islands = lands(game, "Island", 4);
    cast(game, toHand(game, "Ice Magic"), { modes: [0], targets: [ref(angel)] });
    expect(zone(game, angel)).toBe("hand");
    expect(islands.filter((i) => isTapped(game, i))).toHaveLength(2);
  });
});

describe("Jailbreak Scheme", () => {
  it("both modes: a counter and unblockable on yours, then their artifact's owner picks", () => {
    const { game, b } = table();
    const bears = spawn(game, "Grizzly Bears", A);
    const ring = spawn(game, "Sol Ring", B);
    pickModes(b, 0);
    const islands = lands(game, "Island", 6);
    cast(game, toHand(game, "Jailbreak Scheme"), { modes: [0, 1], targets: [ref(bears), ref(ring)] });
    expect(counters(game, bears)).toBe(1);
    expect(keywords(game, bears).has("unblockable")).toBe(true);
    expect(zone(game, bears)).toBe("battlefield");
    expect(library(game, B)[0]).toBe(ring);
    expect(islands.filter((i) => isTapped(game, i))).toHaveLength(6);
    expect(named(game, "Sol Ring", B)).toHaveLength(0);
  });
});
