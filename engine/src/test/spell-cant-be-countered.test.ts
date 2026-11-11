/**
 * "Target spell can't be countered" (the `spell-cant-be-countered` effect —
 * Vexing Shusher): the spell is marked for as long as it's on the stack. A
 * counterspell may still target it, and does the rest of what it says (its
 * ruling); only the countering (rule 701.6a) can't happen (rule 101.2).
 */
import { describe, expect, it } from "vitest";

import type { Game } from "../game.js";
import type { ObjectId } from "../primitives.js";
import { A, B, activate, cast, lands, spawn, table, toHand, zone } from "./harness.js";

const obj = (id: ObjectId) => ({ kind: "object" as const, object: id });
const pass = (game: Game, player = A): void => {
  game.dispatch({ type: "pass-priority", player });
};

/** Alice's Bears on the stack, her Shusher out, Bob with islands. */
const setUp = () => {
  const t = table();
  const shusher = spawn(t.game, "Vexing Shusher");
  lands(t.game, "Taiga", 4);
  lands(t.game, "Island", 2, B);
  const bears = toHand(t.game, "Grizzly Bears");
  cast(t.game, bears, { settle: false });
  return { ...t, shusher, bears };
};

/** The Shusher's ability on `spell`, resolved, the spell still on the stack. */
const shush = (game: Game, shusher: ObjectId, spell: ObjectId): void => {
  activate(game, shusher, 0, { targets: [obj(spell)], settle: false });
  pass(game, A);
  pass(game, B);
  expect(zone(game, spell)).toBe("stack");
};

describe("Vexing Shusher", () => {
  it("without it, the spell is countered", () => {
    const { game, bears } = setUp();
    pass(game, A);
    cast(game, toHand(game, "Counterspell", B), { player: B, targets: [obj(bears)] });
    expect(zone(game, bears)).toBe("graveyard");
  });

  it("a shushed spell can still be targeted by a counterspell, and resolves", () => {
    const { game, shusher, bears } = setUp();
    shush(game, shusher, bears);
    expect(game.state.objects[bears].uncounterable).toBe(true);
    pass(game, A);
    const counterspell = toHand(game, "Counterspell", B);
    cast(game, counterspell, { player: B, targets: [obj(bears)] });
    expect(zone(game, counterspell)).toBe("graveyard");
    expect(zone(game, bears)).toBe("battlefield");
    // Off the stack, it's a new object with no mark (rule 400.7).
    expect(game.state.objects[bears].uncounterable).toBeUndefined();
  });

  it("the rest of the counterspell still happens: Remand draws", () => {
    const { game, shusher, bears } = setUp();
    shush(game, shusher, bears);
    pass(game, A);
    const before = game.state.zones.perPlayer[B].hand.length;
    cast(game, toHand(game, "Remand", B), { player: B, targets: [obj(bears)] });
    expect(zone(game, bears)).toBe("battlefield");
    // Remand left the hand, a card came in.
    expect(game.state.zones.perPlayer[B].hand.length).toBe(before + 1);
  });

  it("shushes an opponent's spell too, and does nothing to an ability", () => {
    const { game, shusher, bears } = setUp();
    pass(game, A);
    const opt = toHand(game, "Counterspell", B);
    cast(game, opt, { player: B, targets: [obj(bears)], settle: false });
    pass(game, B);
    // Alice shushes Bob's Counterspell: legal, pointless, and it still
    // counters the Bears.
    activate(game, shusher, 0, { targets: [obj(opt)], settle: false });
    const ability = game.state.zones.shared.stack.at(-1)!;
    expect(() => activate(game, shusher, 0, { targets: [obj(ability)], settle: false })).toThrow(/target/i);
    pass(game, A);
    pass(game, B);
    expect(game.state.objects[opt].uncounterable).toBe(true);
    pass(game, A);
    pass(game, B);
    expect(zone(game, bears)).toBe("graveyard");
  });

  // Rule 707.10: a copy has the spell's characteristics and the decisions made
  // for it, not an effect applied to it or what was spent on it.
  describe("a copy of the spell", () => {
    /** Alice's Double Major on her creature `spell`, resolved; Bob then
     * counters the copy. How many of `name` she ends with. */
    const copyThenCounterTheCopy = (game: Game, spell: ObjectId, name: string): { marked: boolean | undefined; count: number } => {
      lands(game, "Tropical Island", 2);
      cast(game, toHand(game, "Double Major"), { targets: [obj(spell)], settle: false });
      pass(game, A);
      pass(game, B);
      const copy = game.state.zones.shared.stack.at(-1)!;
      expect(copy).not.toBe(spell);
      const marked = game.state.objects[copy].uncounterable;
      pass(game, A);
      cast(game, toHand(game, "Counterspell", B), { player: B, targets: [obj(copy)] });
      const count = game.state.zones.shared.battlefield.filter((id) => game.state.objects[id].cardName === name).length;
      return { marked, count };
    };

    it("isn't shushed with it: the copy is countered, the spell resolves", () => {
      const { game, shusher, bears } = setUp();
      shush(game, shusher, bears);
      expect(copyThenCounterTheCopy(game, bears, "Grizzly Bears")).toEqual({ marked: undefined, count: 1 });
    });

    it("doesn't have Cavern of Souls' mana behind it either", () => {
      const { game } = table();
      lands(game, "Island", 2, B);
      const cavern = toHand(game, "Cavern of Souls");
      game.dispatch({ type: "play-land", player: A, card: cavern });
      game.dispatch({ type: "choose-creature-type", player: A, creatureType: "Bear" });
      spawn(game, "Plains");
      const bears = toHand(game, "Grizzly Bears");
      cast(game, bears, { settle: false });
      expect(game.state.objects[bears].uncounterable).toBe(true);
      expect(copyThenCounterTheCopy(game, bears, "Grizzly Bears")).toEqual({ marked: undefined, count: 1 });
    });

    it("keeps a printed \"this spell can't be countered\"", () => {
      const { game } = table();
      lands(game, "Taiga", 2);
      lands(game, "Island", 2, B);
      const shusher = toHand(game, "Vexing Shusher");
      cast(game, shusher, { settle: false });
      expect(copyThenCounterTheCopy(game, shusher, "Vexing Shusher")).toEqual({ marked: undefined, count: 2 });
    });
  });

  it("can't itself be countered", () => {
    const { game } = table();
    lands(game, "Taiga", 2);
    lands(game, "Island", 2, B);
    const shusher = toHand(game, "Vexing Shusher");
    cast(game, shusher, { settle: false });
    pass(game, A);
    cast(game, toHand(game, "Counterspell", B), { player: B, targets: [obj(shusher)] });
    expect(zone(game, shusher)).toBe("battlefield");
  });
});
