/**
 * "Create a token that's a copy of target nonlegendary enchantment you
 * control. It gains haste. If it's a Saga, put up to three lore counters on
 * it. Sacrifice it at the beginning of your next end step" — Esper Terra's
 * chapters I-III: a `create-token-copy`, then, only when the token made is a
 * Saga, a number chosen as the chapter resolves (rule 608.2d, `choose-value`)
 * and that many lore counters put on it, each able to trigger its chapters
 * (714.2b). And the rest of Terra, Magical Adept // Esper Terra: the enters
 * mill, Trance, and chapter IV's mana and return front face up (712.14).
 */

import { describe, expect, it } from "vitest";

import { nameOf } from "../state.js";
import {
  A,
  activate,
  counters,
  enter,
  graveyard,
  hand,
  keywords,
  lands,
  named,
  pickFromZone,
  pickTargets,
  ref,
  settle,
  spawn,
  table,
  tokensNamed,
  toLibrary,
  toStep,
  zone,
} from "./harness.js";
import type { Game } from "../game.js";
import type { ObjectId } from "../primitives.js";

const trance = (game: Game): ObjectId => {
  const terra = spawn(game, "Terra, Magical Adept");
  lands(game, "Mountain", 5);
  lands(game, "Forest", 1);
  activate(game, terra, 0);
  return terra;
};

const copies = (game: Game, name: string): ObjectId[] =>
  named(game, name).filter((id) => game.state.objects[id].isToken);

describe("Terra, Magical Adept", () => {
  it("mills five and may put an enchantment card milled this way into hand", () => {
    const { game, a } = table();
    const anthem = toLibrary(game, "Glorious Anthem");
    for (let i = 0; i < 4; i += 1) toLibrary(game, "Wastes");
    const seen = pickFromZone(a, anthem);
    enter(game, "Terra, Magical Adept");
    expect(seen.offered).toEqual([anthem]);
    expect(hand(game)).toContain(anthem);
    expect(graveyard(game).length).toBe(4);
  });

  it("may put none", () => {
    const { game, a } = table();
    const anthem = toLibrary(game, "Glorious Anthem");
    pickFromZone(a);
    enter(game, "Terra, Magical Adept");
    expect(zone(game, anthem)).toBe("graveyard");
  });

  it("Trance exiles it and returns it as Esper Terra, whose chapter I triggers", () => {
    const { game, a } = table();
    const anthem = spawn(game, "Glorious Anthem");
    pickTargets(a, anthem);
    const terra = trance(game);
    expect(nameOf(game.state.objects[terra])).toBe("Esper Terra");
    expect(counters(game, terra, "lore")).toBe(1);
    expect(copies(game, "Glorious Anthem").length).toBe(1);
  });
});

describe("Esper Terra", () => {
  it("copies a non-Saga enchantment with haste and asks no number; the copy goes at your next end step", () => {
    const { game, a } = table();
    const anthem = spawn(game, "Glorious Anthem");
    pickTargets(a, anthem);
    a.chooseNumberFn = () => {
      throw new Error("no number is asked for a token that isn't a Saga");
    };
    trance(game);
    const [token] = copies(game, "Glorious Anthem");
    expect(token).toBeDefined();
    expect(keywords(game, token).has("haste")).toBe(true);
    toStep(game, "end");
    settle(game);
    expect(copies(game, "Glorious Anthem")).toEqual([]);
  });

  it("puts up to three lore counters on a Saga copy, which trigger its chapters", () => {
    const { game, a } = table();
    const benalia = spawn(game, "History of Benalia");
    // The spawned Saga came with a lore counter: its own chapter I makes one.
    const before = 1;
    pickTargets(a, benalia);
    let offered: { min: number; max: number | undefined } | undefined;
    a.chooseNumberFn = (_view, offer) => {
      offered = { min: offer.min, max: offer.max };
      return 3;
    };
    trance(game);
    expect(offered).toEqual({ min: 0, max: 3 });
    // Chapter I as the copy entered, then II and III from the three counters;
    // its final chapter reached, the copy is sacrificed (714.4).
    expect(tokensNamed(game, "Knight Token")).toBe(before + 2);
    expect(copies(game, "History of Benalia")).toEqual([]);
  });

  it("with none chosen, the Saga copy stays at one lore counter", () => {
    const { game, a } = table();
    const benalia = spawn(game, "History of Benalia");
    const before = 1; // the spawned Saga's own chapter I
    pickTargets(a, benalia);
    a.chooseNumberFn = () => 0;
    trance(game);
    const [token] = copies(game, "History of Benalia");
    expect(counters(game, token, "lore")).toBe(1);
    expect(tokensNamed(game, "Knight Token")).toBe(before + 1);
  });

  it("IV adds ten mana and returns it front face up, its enters trigger again", () => {
    const { game, a } = table();
    const anthem = spawn(game, "Glorious Anthem");
    pickTargets(a, anthem);
    const terra = trance(game);
    pickFromZone(a);
    game.debugApplyEffect(A, { kind: "add-counter", target: 0, counter: "lore", amount: 3 }, [ref(terra)]);
    settle(game);
    const front = named(game, "Terra, Magical Adept");
    expect(front.length).toBe(1);
    expect(zone(game, front[0])).toBe("battlefield");
    const pool = game.state.players[A].manaPool.map((u) => u.type).sort();
    expect(pool).toEqual(["B", "B", "G", "G", "R", "R", "U", "U", "W", "W"]);
    // Its enters trigger milled five on the way back.
    expect(graveyard(game).length).toBe(5);
  });
});
