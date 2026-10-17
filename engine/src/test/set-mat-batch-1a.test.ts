/**
 * March of the Machine: The Aftermath (MAT), batch 1, part a (2026-10-17).
 * Written on the shared table in `harness.ts`.
 */
import { describe, expect, it } from "vitest";

import {
  A,
  B,
  cast,
  hand,
  keywords,
  lands,
  life,
  pickTargets,
  pt,
  ref,
  settle,
  spawn,
  table,
  toGraveyard,
  toHand,
  toStep,
  types,
  subtypes,
  zone,
} from "./harness.js";
import { computeCharacteristics } from "../characteristics.js";

describe("Animist's Might", () => {
  it("costs {2} less aimed from a legendary creature you control, and deals twice its power", () => {
    const { game } = table();
    const isamaru = spawn(game, "Isamaru, Hound of Konda");
    const angel = spawn(game, "Serra Angel", B);
    lands(game, "Forest", 1);
    cast(game, toHand(game, "Animist's Might"), { targets: [ref(isamaru), ref(angel)] });
    // 2 × 2 power = 4 damage: the 4/4 dies.
    expect(zone(game, angel)).toBe("graveyard");
  });

  it("isn't discounted by a legendary creature you don't control", () => {
    const { game } = table();
    const bear = spawn(game, "Grizzly Bears");
    const theirs = spawn(game, "Isamaru, Hound of Konda", B);
    lands(game, "Forest", 1);
    const might = toHand(game, "Animist's Might");
    expect(() => cast(game, might, { targets: [ref(bear), ref(theirs)] })).toThrow();
    // At full price the same targets are fine: 2 × 2 power to the 2/2.
    lands(game, "Forest", 2);
    cast(game, might, { targets: [ref(bear), ref(theirs)] });
    expect(zone(game, theirs)).toBe("graveyard");
  });
});

describe("Jolrael, Voice of Zhalfir", () => {
  it("animates a land as an X/X Bird locked to the hand size as it resolves, and draws when a land creature connects", () => {
    const { game, a } = table();
    spawn(game, "Jolrael, Voice of Zhalfir");
    const [forest] = lands(game, "Forest", 1);
    pickTargets(a, forest);
    toStep(game, "begin-combat");
    settle(game);
    const x = hand(game).length;
    expect(x).toBeGreaterThan(0);
    expect(pt(game, forest)).toEqual({ power: x, toughness: x });
    expect(types(game, forest)).toEqual(expect.arrayContaining(["land", "creature"]));
    expect(subtypes(game, forest)).toEqual(expect.arrayContaining(["Forest", "Bird"]));
    expect(keywords(game, forest).has("flying")).toBe(true);
    expect(keywords(game, forest).has("haste")).toBe(true);
    expect([...computeCharacteristics(game.state, game.registry, forest).colors].sort()).toEqual(["G", "U"]);
    // Locked in: a bigger hand later doesn't grow it.
    toHand(game, "Grizzly Bears");
    expect(pt(game, forest)).toEqual({ power: x, toughness: x });
    const before = hand(game).length;
    a.declareAttackersFn = () => [{ attacker: forest, defender: B }];
    toStep(game, "postcombat-main");
    expect(life(game, B)).toBe(20 - x);
    expect(hand(game)).toHaveLength(before + 1);
  });
});

describe("Campus Renovation", () => {
  it("returns an artifact card and exiles the top two cards to play", () => {
    const { game } = table();
    const ring = toGraveyard(game, "Sol Ring");
    lands(game, "Mountain", 4);
    lands(game, "Plains", 1);
    const exileBefore = game.state.zones.shared.exile.length;
    cast(game, toHand(game, "Campus Renovation"), { targets: [ref(ring)] });
    expect(zone(game, ring)).toBe("battlefield");
    expect(game.state.zones.shared.exile.length).toBe(exileBefore + 2);
  });

  it("exiles nothing when the chosen target has left the graveyard (rule 608.2b)", () => {
    const { game } = table();
    const ring = toGraveyard(game, "Sol Ring");
    lands(game, "Mountain", 4);
    lands(game, "Plains", 1);
    const exileBefore = game.state.zones.shared.exile.length;
    const libraryBefore = game.state.zones.perPlayer[A].library.length;
    cast(game, toHand(game, "Campus Renovation"), { targets: [ref(ring)], settle: false });
    game.debugMove(ring, "hand");
    settle(game);
    expect(game.state.zones.shared.exile.length).toBe(exileBefore);
    expect(game.state.zones.perPlayer[A].library.length).toBe(libraryBefore);
  });

  it("still exiles two with no target chosen", () => {
    const { game } = table();
    lands(game, "Mountain", 4);
    lands(game, "Plains", 1);
    const exileBefore = game.state.zones.shared.exile.length;
    cast(game, toHand(game, "Campus Renovation"), { targets: [null] });
    expect(game.state.zones.shared.exile.length).toBe(exileBefore + 2);
  });
});
