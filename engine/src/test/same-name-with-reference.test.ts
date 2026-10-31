/**
 * "Has the same name as" a reference object — `CardFilter.sameNameWith`,
 * taking the `ShareReference` the shared-type clauses take (rule 201.2a: one
 * name in common is enough). In an effect every reference is bound to
 * `sameNameAsAny` as it applies; a static's prohibition reads the source, the
 * cards exiled with it (rule 607.2a), the permanents you control or every
 * permanent matching a filter live.
 */
import { describe, expect, it } from "vitest";

import { bindDynamicCompares } from "../effects.js";
import type { EffectSpec, ResolutionContext } from "../effects.js";
import type { Game } from "../game.js";
import { asObjectId } from "../primitives.js";
import type { ObjectId, PlayerId } from "../primitives.js";
import {
  A,
  B,
  activate,
  cast,
  enter,
  lands,
  nextTurn,
  pickFromZone,
  pickModes,
  pickTargets,
  pt,
  ref,
  spawn,
  table,
  toHand,
  toLibrary,
  zone,
} from "./harness.js";

const castRefusal = (game: Game, player: PlayerId, card: ObjectId): string | null =>
  game.canDispatch({ type: "cast-spell", player, card, targets: [] });

describe("sameNameWith: \"exiled-with-source\" — a lock on the exiled card's name", () => {
  it("Ixalan's Binding: its opponents can't cast a spell named like the exiled card; its controller can", () => {
    const { game, a } = table();
    lands(game, "Plains", 4);
    lands(game, "Forest", 4, B);
    const bears = spawn(game, "Grizzly Bears", B);
    pickTargets(a, bears);
    const binding = toHand(game, "Ixalan's Binding");
    cast(game, binding);
    expect(zone(game, bears)).toBe("exile");
    lands(game, "Forest", 2);
    expect(castRefusal(game, A, toHand(game, "Grizzly Bears"))).toBeNull();

    nextTurn(game);
    const theirs = toHand(game, "Grizzly Bears", B);
    expect(castRefusal(game, B, theirs)).toMatch(/can't cast Grizzly Bears \(Ixalan's Binding\)/);
    expect(castRefusal(game, B, toHand(game, "Llanowar Elves", B))).toBeNull();
  });

  it("the lock ends with the link: once Ixalan's Binding leaves and the card returns, it can be cast", () => {
    const { game, a } = table();
    lands(game, "Plains", 4);
    lands(game, "Forest", 4, B);
    const bears = spawn(game, "Grizzly Bears", B);
    pickTargets(a, bears);
    const binding = toHand(game, "Ixalan's Binding");
    cast(game, binding);
    game.debugMove(binding, "graveyard");
    nextTurn(game);
    expect(zone(game, bears)).toBe("battlefield");
    expect(castRefusal(game, B, toHand(game, "Grizzly Bears", B))).toBeNull();
  });

  it("Exclusion Ritual locks every player, its controller too", () => {
    const { game, a } = table();
    lands(game, "Plains", 8);
    const giant = spawn(game, "Hill Giant", B);
    pickTargets(a, giant);
    cast(game, toHand(game, "Exclusion Ritual"));
    expect(zone(game, giant)).toBe("exile");
    lands(game, "Mountain", 4);
    lands(game, "Forest", 2);
    expect(castRefusal(game, A, toHand(game, "Hill Giant"))).toMatch(/Exclusion Ritual/);
    expect(castRefusal(game, A, toHand(game, "Grizzly Bears"))).toBeNull();
  });
});

describe("sameNameWith: { permanents } and { controlled }", () => {
  it("Cornered Market: no spell named like a nontoken permanent, and no such nonbasic land; basics are fine", () => {
    const { game } = table();
    lands(game, "Forest", 4);
    spawn(game, "Cornered Market", B);
    spawn(game, "Grizzly Bears", B);
    spawn(game, "Reliquary Tower");
    expect(castRefusal(game, A, toHand(game, "Grizzly Bears"))).toMatch(/Cornered Market/);
    expect(castRefusal(game, A, toHand(game, "Llanowar Elves"))).toBeNull();
    const tower = toHand(game, "Reliquary Tower");
    expect(game.canDispatch({ type: "play-land", player: A, card: tower })).toMatch(/Cornered Market/);
    expect(game.canDispatch({ type: "play-land", player: A, card: toHand(game, "Forest") })).toBeNull();
  });

  it("Mitotic Manipulation offers only the cards named like a permanent", () => {
    const { game, a } = table();
    lands(game, "Island", 3);
    spawn(game, "Grizzly Bears", B);
    const giant = toLibrary(game, "Hill Giant");
    const bears = toLibrary(game, "Grizzly Bears");
    let offered: readonly ObjectId[] = [];
    a.chooseFromZoneFn = (_view, eligible, min) => {
      if (min > 0) return eligible; // the rest, ordered for the bottom
      offered = eligible;
      return [bears];
    };
    cast(game, toHand(game, "Mitotic Manipulation"));
    expect(offered).toEqual([bears]);
    expect(zone(game, bears)).toBe("battlefield");
    expect(zone(game, giant)).toBe("library");
  });

  it("Pattern Matcher finds a card named like another creature you control, not one named like itself", () => {
    const { game, a } = table();
    spawn(game, "Grizzly Bears");
    spawn(game, "Hill Giant", B);
    const bears = toLibrary(game, "Grizzly Bears");
    const giant = toLibrary(game, "Hill Giant");
    const matcher = toLibrary(game, "Pattern Matcher");
    pickModes(a, 0);
    const seen = pickFromZone(a, bears);
    enter(game, "Pattern Matcher");
    expect(seen.offered).toContain(bears);
    expect(seen.offered).not.toContain(giant);
    expect(seen.offered).not.toContain(matcher);
    expect(zone(game, bears)).toBe("hand");
  });
});

describe("sameNameWith: \"source\"", () => {
  it("Cylian Sunsinger pumps itself and each other creature with its name", () => {
    const { game } = table();
    lands(game, "Mountain", 1);
    lands(game, "Forest", 1);
    lands(game, "Plains", 1);
    const singer = spawn(game, "Cylian Sunsinger");
    const other = spawn(game, "Cylian Sunsinger", B);
    const bears = spawn(game, "Grizzly Bears");
    activate(game, singer);
    expect(pt(game, singer)).toEqual({ power: 5, toughness: 5 });
    expect(pt(game, other)).toEqual({ power: 5, toughness: 5 });
    expect(pt(game, bears)).toEqual({ power: 2, toughness: 2 });
  });
});

describe("bindDynamicCompares and sameNameWith", () => {
  const ctx = {
    source: "src",
    controller: A,
    targets: [ref(asObjectId("obj-9")), ref(B)],
    nameForMatching: (object: ObjectId) => (object === "obj-9" ? "Grizzly Bears" : object === "src" ? "Cylian Sunsinger" : null),
    permanentsMatching: () => [{ object: "obj-9", count: 1 }],
  } as unknown as ResolutionContext;

  it("binds a target slot to the target's name, and a player slot to none", () => {
    const at = (reference: number): EffectSpec => ({ kind: "destroy-all", filter: { sameNameWith: reference } });
    expect(bindDynamicCompares(at(0), ctx)).toEqual({ kind: "destroy-all", filter: { sameNameAsAny: ["Grizzly Bears"] } });
    expect(bindDynamicCompares(at(1), ctx)).toEqual({ kind: "destroy-all", filter: { sameNameAsAny: [] } });
  });

  it("binds the live references too — the source, the permanents matching a filter — since an effect's matching has no source", () => {
    const spec = (reference: "source" | { permanents: { token: false } }): EffectSpec => ({
      kind: "destroy-all",
      filter: { sameNameWith: reference },
    });
    expect(bindDynamicCompares(spec("source"), ctx)).toEqual({ kind: "destroy-all", filter: { sameNameAsAny: ["Cylian Sunsinger"] } });
    expect(bindDynamicCompares(spec({ permanents: { token: false } }), ctx)).toEqual({
      kind: "destroy-all",
      filter: { sameNameAsAny: ["Grizzly Bears"] },
    });
  });
});
