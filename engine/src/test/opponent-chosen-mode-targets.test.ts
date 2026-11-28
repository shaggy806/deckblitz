/**
 * "**An opponent chooses** one —" with a mode that takes targets (Fatal
 * Lore): the opponent the caster names chooses the mode as it's cast (rule
 * 700.2e), then the caster chooses that mode's targets (601.2c follows
 * 601.2b) — "up to two target creatures **that player** controls", a
 * filter's `controlledBy: "chooser"` reading the opponent who chose.
 */

import { describe, expect, it } from "vitest";

import {
  A,
  B,
  C,
  cast,
  hand,
  lands,
  ref,
  spawn,
  table,
  toHand,
  zone,
} from "./harness.js";

describe("an opponent chooses a mode whose targets the caster chooses", () => {
  it("Fatal Lore: the caster draws three when the opponent picks the first mode, and is asked no targets", () => {
    const { game, a, b } = table();
    lands(game, "Swamp", 4);
    let asked = 0;
    a.chooseTargetsFn = () => {
      asked += 1;
      return [];
    };
    b.chooseModesFn = () => [0];
    const card = toHand(game, "Fatal Lore");
    const before = hand(game, A).length;
    cast(game, card, { otherChooser: B });
    expect(asked).toBe(0);
    expect(hand(game, A).length).toBe(before - 1 + 3);
  });

  it("Fatal Lore: the second mode — the caster picks two of the chooser's creatures, they're destroyed past regeneration, and that player draws up to three", () => {
    const { game, a, b } = table({ players: 3 });
    lands(game, "Swamp", 4);
    const bobs1 = spawn(game, "Grizzly Bears", B);
    const bobs2 = spawn(game, "Hill Giant", B);
    const bobs3 = spawn(game, "Hill Giant", B);
    const carols = spawn(game, "Grizzly Bears", C);
    const mine = spawn(game, "Grizzly Bears", A);
    let offered: readonly (readonly unknown[])[] = [];
    a.chooseTargetsFn = (_view, _name, _specs, options) => {
      offered = options;
      return [ref(bobs1), ref(bobs2)];
    };
    b.chooseModesFn = () => [1];
    b.chooseNumberFn = () => 2;
    const bobHand = hand(game, B).length;
    const card = toHand(game, "Fatal Lore");
    cast(game, card, { otherChooser: B });
    // Only the chooser's creatures were offered — not Carol's, not the caster's.
    const flat = offered.flat().map((t) => (t as { object?: string }).object);
    expect(flat).toContain(bobs1);
    expect(flat).not.toContain(carols);
    expect(flat).not.toContain(mine);
    expect(zone(game, bobs1)).toBe("graveyard");
    expect(zone(game, bobs2)).toBe("graveyard");
    expect(zone(game, bobs3)).toBe("battlefield");
    expect(hand(game, B).length).toBe(bobHand + 2);
  });

  it("Fatal Lore: the caster's targets are asked of the caster, after the opponent's mode, and the spell waits on the stack-to-be", () => {
    const { game, b } = table();
    lands(game, "Swamp", 4);
    const bobs = spawn(game, "Grizzly Bears", B);
    b.chooseModesFn = () => [1];
    const card = toHand(game, "Fatal Lore");
    game.dispatch({ type: "cast-spell", player: A, card, targets: [], otherChooser: B });
    expect(game.state.awaiting?.kind === "choose-modes" && game.state.awaiting.player).toBe(B);
    game.dispatch({ type: "choose-modes", player: B, modes: [1] });
    const awaiting = game.state.awaiting;
    expect(awaiting?.kind).toBe("choose-targets");
    if (awaiting?.kind !== "choose-targets") throw new Error("no targets asked");
    expect(awaiting.player).toBe(A);
    // The opponent can't answer the caster's targets.
    expect(game.canDispatch({ type: "choose-targets", player: B, targets: [ref(bobs)] })).not.toBeNull();
    // Nor can the caster name a creature the chooser doesn't control.
    const mine = spawn(game, "Grizzly Bears", A);
    expect(game.canDispatch({ type: "choose-targets", player: A, targets: [ref(mine)] })).not.toBeNull();
    game.dispatch({ type: "choose-targets", player: A, targets: [ref(bobs)] });
    expect(game.state.objects[card].zone).toBe("stack");
    expect(game.state.objects[card].chosenModes).toEqual([1]);
  });

  it("Fatal Lore: the second mode with no targets chosen still lets that player draw", () => {
    const { game, a, b } = table();
    lands(game, "Swamp", 4);
    const bobs = spawn(game, "Grizzly Bears", B);
    a.chooseTargetsFn = () => [];
    b.chooseModesFn = () => [1];
    b.chooseNumberFn = () => 3;
    const bobHand = hand(game, B).length;
    cast(game, toHand(game, "Fatal Lore"), { otherChooser: B });
    expect(zone(game, bobs)).toBe("battlefield");
    expect(hand(game, B).length).toBe(bobHand + 3);
  });
});
