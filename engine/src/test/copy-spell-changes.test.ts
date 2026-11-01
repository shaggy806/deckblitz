/**
 * A spell's copy that differs from the spell (`copy-spell`'s `except` and
 * `gains`): exceptions to the copying — "except the copy isn't legendary"
 * (Double Major), "an artifact in addition to its other types" (Tawnos, the
 * Toymaker), "a 1/1 Spirit in addition to its other types" (Donal, Herald of
 * Wings) — are copiable values (rule 707.9b) that the token it becomes
 * keeps (707.10f); "the copy gains haste and 'At the beginning of the end
 * step, sacrifice this permanent'" (Nalfeshnee) is an effect on the copy
 * that goes on applying to that token (400.7a), and only to a permanent
 * spell's copy when the card says so (110.4b).
 */

import { describe, expect, it } from "vitest";

import type { Game } from "../game.js";
import type { ObjectId } from "../primitives.js";
import {
  A,
  B,
  cast,
  keywords,
  lands,
  life,
  named,
  pt,
  ref,
  settle,
  spawn,
  subtypes,
  supertypes,
  table,
  toHand,
  toLibrary,
  toStep,
  types,
  zone,
} from "./harness.js";

const tokenNamed = (game: Game, name: string): ObjectId | undefined =>
  named(game, name, A).find((id) => game.state.objects[id].isToken);
const originalNamed = (game: Game, name: string): ObjectId | undefined =>
  named(game, name, A).find((id) => !game.state.objects[id].isToken);

describe("Double Major — except it isn't legendary", () => {
  it("copies a legendary creature spell into a nonlegendary token, so the legend rule leaves both", () => {
    const { game } = table();
    lands(game, "Plains", 1);
    lands(game, "Forest", 1);
    lands(game, "Island", 1);
    const isamaru = toHand(game, "Isamaru, Hound of Konda");
    cast(game, isamaru, { settle: false });
    cast(game, toHand(game, "Double Major"), { targets: [ref(isamaru)] });
    expect(zone(game, isamaru)).toBe("battlefield");
    const token = tokenNamed(game, "Isamaru, Hound of Konda");
    expect(token).toBeDefined();
    expect(supertypes(game, token!)).not.toContain("legendary");
    expect(supertypes(game, isamaru)).toContain("legendary");
    expect(pt(game, token!)).toEqual({ power: 2, toughness: 2 });
  });
});

describe("Tawnos, the Toymaker — an extra card type", () => {
  it("copies a Beast creature spell as an artifact creature token; the original stays as it is", () => {
    const { game, a } = table();
    spawn(game, "Tawnos, the Toymaker");
    lands(game, "Forest", 5);
    a.chooseModesFn = () => [0];
    const before = life(game);
    cast(game, toHand(game, "Thragtusk"));
    const token = tokenNamed(game, "Thragtusk");
    const original = originalNamed(game, "Thragtusk");
    expect(token).toBeDefined();
    expect(types(game, token!)).toEqual(expect.arrayContaining(["artifact", "creature"]));
    expect(types(game, original!)).not.toContain("artifact");
    // Both entered: two "you gain 5 life".
    expect(life(game)).toBe(before + 10);
  });

  it("doesn't copy a creature spell that is neither a Beast nor a Bird", () => {
    const { game, a } = table();
    spawn(game, "Tawnos, the Toymaker");
    lands(game, "Forest", 2);
    a.chooseModesFn = () => [0];
    cast(game, toHand(game, "Grizzly Bears"));
    expect(tokenNamed(game, "Grizzly Bears")).toBeUndefined();
  });
});

describe("Donal, Herald of Wings — base P/T and a subtype, once each turn", () => {
  it("copies a nonlegendary flier as a 1/1 Spirit in addition, only the first time each turn", () => {
    const { game, a } = table();
    spawn(game, "Donal, Herald of Wings");
    lands(game, "Forest", 2);
    a.chooseModesFn = () => [0];
    cast(game, toHand(game, "Birds of Paradise"));
    const token = tokenNamed(game, "Birds of Paradise");
    expect(token).toBeDefined();
    expect(pt(game, token!)).toEqual({ power: 1, toughness: 1 });
    expect(subtypes(game, token!)).toEqual(expect.arrayContaining(["Bird", "Spirit"]));
    expect(keywords(game, token!).has("flying")).toBe(true);
    const original = originalNamed(game, "Birds of Paradise")!;
    expect(pt(game, original)).toEqual({ power: 0, toughness: 1 });
    expect(subtypes(game, original)).not.toContain("Spirit");
    // A second one this turn isn't copied.
    cast(game, toHand(game, "Birds of Paradise"));
    expect(named(game, "Birds of Paradise", A).filter((id) => game.state.objects[id].isToken)).toHaveLength(1);
  });
});

describe("Nalfeshnee — the copy gains haste and an end-step sacrifice", () => {
  const castFromExile = (game: Game, name: string): ObjectId => {
    const card = toLibrary(game, name);
    game.debugApplyEffect(A, { kind: "impulse-exile", amount: 1, duration: "end-of-turn" });
    expect(zone(game, card)).toBe("exile");
    return card;
  };

  it("gives a permanent spell's copy haste and a sacrifice at the end step, which the token keeps", () => {
    const { game } = table();
    spawn(game, "Nalfeshnee");
    lands(game, "Forest", 2);
    const bears = castFromExile(game, "Grizzly Bears");
    cast(game, bears, { via: "impulse" });
    const token = tokenNamed(game, "Grizzly Bears");
    expect(token).toBeDefined();
    expect(keywords(game, token!).has("haste")).toBe(true);
    // The original gained nothing.
    expect(keywords(game, bears).has("haste")).toBe(false);
    toStep(game, "end");
    settle(game);
    expect(game.state.objects[token!]?.zone ?? "gone").not.toBe("battlefield");
    expect(zone(game, bears)).toBe("battlefield");
  });

  it("gives an instant's copy nothing", () => {
    const { game } = table();
    spawn(game, "Nalfeshnee");
    lands(game, "Mountain", 1);
    const bolt = castFromExile(game, "Lightning Bolt");
    cast(game, bolt, { via: "impulse", targets: [ref(B)], settle: false });
    // The copy, read as it sits on the stack above the Bolt.
    game.advanceUntil(
      (s) => s.zones.shared.stack.some((id) => s.objects[id].isCopy === true) || s.zones.shared.stack.length === 0,
    );
    const copy = game.state.zones.shared.stack.find((id) => game.state.objects[id].isCopy === true);
    expect(copy).toBeDefined();
    expect(keywords(game, copy!).has("haste")).toBe(false);
    expect(game.state.objects[copy!].modifiers.some((m) => m.castRider === true)).toBe(false);
    settle(game);
    expect(life(game, B)).toBe(14);
  });
});
