/**
 * Cards whose triage named a need key the vocabulary already covered: the key's note had
 * gone stale, or a composition hadn't been tried (the 2026-11-02 pilot). Each is pinned on
 * real behaviour, so a key marked built on this evidence stays honest.
 */
import { describe, expect, it } from "vitest";

import type { Game } from "../game.js";
import type { ObjectId } from "../primitives.js";
import type { LegalAction } from "../actions.js";
import { activePlayerOf } from "../state.js";
import {
  A,
  B,
  activate,
  cast,
  graveyard,
  hand,
  lands,
  life,
  nextTurn,
  pickFromZone,
  pickModes,
  ref,
  spawn,
  table,
  toGraveyard,
  toHand,
  toLibrary,
  zone,
} from "./harness.js";

const libraryOf = (game: Game, who = A): readonly ObjectId[] => game.state.zones.perPlayer[who].library;

describe("search-library's exile destination (effect:search-library-to-exile)", () => {
  it("Selective Memory exiles any number of nonland cards", () => {
    const { game, a } = table();
    const land = toLibrary(game, "Forest");
    const bears = toLibrary(game, "Grizzly Bears");
    const spell = toLibrary(game, "Divination");
    lands(game, "Island", 4);
    const seen = pickFromZone(a, bears, spell);
    cast(game, toHand(game, "Selective Memory"));
    expect(seen.offered).not.toContain(land);
    expect(zone(game, bears)).toBe("exile");
    expect(zone(game, spell)).toBe("exile");
    expect(zone(game, land)).toBe("library");
  });

  it("Foresight exiles three, and its controller draws at the next turn's upkeep", () => {
    const { game, a } = table();
    const cards = [toLibrary(game, "Forest"), toLibrary(game, "Grizzly Bears"), toLibrary(game, "Divination")];
    for (let i = 0; i < 4; i += 1) toLibrary(game, "Island");
    lands(game, "Island", 2);
    pickFromZone(a, ...cards);
    cast(game, toHand(game, "Foresight"));
    for (const card of cards) expect(zone(game, card)).toBe("exile");
    const before = hand(game).length;
    nextTurn(game, "draw");
    expect(activePlayerOf(game.state)).toBe(B);
    expect(hand(game).length).toBe(before + 1);
  });
});

describe("shuffle-library's target (effect:shuffle-library)", () => {
  it("Lantern of Insight shuffles the target player's library, and is sacrificed to", () => {
    const { game } = table();
    for (let i = 0; i < 40; i += 1) toLibrary(game, i % 2 === 0 ? "Forest" : "Island", B);
    const order = [...libraryOf(game, B)];
    const lantern = spawn(game, "Lantern of Insight");
    activate(game, lantern, 0, { targets: [ref(B)] });
    expect(zone(game, lantern)).toBe("graveyard");
    expect(libraryOf(game, B)).not.toEqual(order);
    expect([...libraryOf(game, B)].sort()).toEqual([...order].sort());
  });

  it("Natural Selection reorders the target's top three, and may have them shuffle", () => {
    const { game, a } = table();
    for (let i = 0; i < 20; i += 1) toLibrary(game, "Island", B);
    const top = [toLibrary(game, "Forest", B), toLibrary(game, "Swamp", B), toLibrary(game, "Mountain", B)];
    const before = [...libraryOf(game, B)];
    lands(game, "Forest", 1);
    const seen = pickFromZone(a, ...top);
    pickModes(a);
    cast(game, toHand(game, "Natural Selection"), { targets: [ref(B)] });
    expect(seen.offered.length).toBe(3);
    expect(libraryOf(game, B).length).toBe(before.length);
    for (const card of top) expect(libraryOf(game, B)).toContain(card);
  });

  it("Natural Selection's shuffle, when you have them", () => {
    const { game, a } = table();
    for (let i = 0; i < 40; i += 1) toLibrary(game, i % 2 === 0 ? "Forest" : "Island", B);
    const order = [...libraryOf(game, B)];
    lands(game, "Forest", 1);
    a.chooseFromZoneFn = (_view, eligible) => eligible;
    pickModes(a, 0);
    cast(game, toHand(game, "Natural Selection"), { targets: [ref(B)] });
    expect(libraryOf(game, B)).not.toEqual(order);
  });
});

describe("delayed-trigger's whenever (effect:delayed-life-gain-trigger)", () => {
  it("Vizkopa Guildmage: each opponent loses what you gain, this turn only", () => {
    const { game } = table({ players: 4 });
    const mage = spawn(game, "Vizkopa Guildmage");
    lands(game, "Plains", 2);
    lands(game, "Swamp", 1);
    activate(game, mage, 1);
    const bob = life(game, B);
    lands(game, "Plains", 5);
    cast(game, toHand(game, "Angel's Mercy"));
    expect(life(game, B)).toBe(bob - 7);
    const turn = game.state.turn.number;
    while (game.state.turn.number < turn + 4) nextTurn(game);
    expect(activePlayerOf(game.state)).toBe(A);
    const after = life(game, B);
    lands(game, "Plains", 5);
    cast(game, toHand(game, "Angel's Mercy"));
    expect(life(game, B)).toBe(after);
  });
});

describe("for-each-player with look-and-choose (effect:target-player-exiles-from-graveyard)", () => {
  it("Merrow Bonegnawer: the target player chooses, from their own graveyard", () => {
    const { game, a, b } = table();
    const merrow = spawn(game, "Merrow Bonegnawer");
    const mine = toGraveyard(game, "Swamp", A);
    const one = toGraveyard(game, "Forest", B);
    const two = toGraveyard(game, "Island", B);
    a.chooseFromZoneFn = () => {
      throw new Error("the target player chooses, not the controller");
    };
    const seen = pickFromZone(b, one);
    activate(game, merrow, 0, { targets: [ref(B)] });
    expect(zone(game, one)).toBe("exile");
    expect(graveyard(game, B)).toEqual([two]);
    expect(seen.offered).not.toContain(mine);
  });
});

describe("not plus anyOf (condition:cant-be-blocked-except-by-flying-or-reach)", () => {
  it("Signal Pest: blocked only by flying or reach", () => {
    const { game, a } = table();
    const pest = spawn(game, "Signal Pest");
    const bears = spawn(game, "Grizzly Bears", B);
    const angel = spawn(game, "Serra Angel", B);
    const spider = spawn(game, "Giant Spider", B);
    a.declareAttackersFn = () => [{ attacker: pest, defender: B }];
    game.advanceUntil((s) => s.awaiting?.kind === "blockers");
    const offer = game
      .legalActions(B)
      .find((o): o is Extract<LegalAction, { kind: "declare-blockers" }> => o.kind === "declare-blockers");
    const canBlock = (id: ObjectId): readonly ObjectId[] => offer?.eligible.find((e) => e.blocker === id)?.canBlock ?? [];
    expect(canBlock(bears)).not.toContain(pest);
    expect(canBlock(angel)).toContain(pest);
    expect(canBlock(spider)).toContain(pest);
  });
});
