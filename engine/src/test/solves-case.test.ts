/**
 * "Whenever you solve a Case" (the `solves-case` trigger event, rule 719.3a):
 * a Case you control becoming solved — Case File Auditor, whose "you may
 * spend mana as though it were mana of any color to cast Case spells" is
 * Oath of Nissa's `spendManaAs` narrowed to Cases.
 */
import { describe, expect, it } from "vitest";

import { A, B, cast, enter, hand, lands, settle, spawn, table, toHand, toLibrary, toStep } from "./harness.js";

describe("Case File Auditor", () => {
  it("as it enters: an enchantment from the top six into your hand", () => {
    const { game, a } = table();
    const ench = toLibrary(game, "Pacifism", A);
    a.chooseFromZoneFn = (_view, eligible) => eligible.slice(0, 1);
    enter(game, "Case File Auditor", A);
    expect(hand(game, A)).toContain(ench);
  });

  it("whenever you solve a Case: the look again", () => {
    const { game, a } = table();
    spawn(game, "Case File Auditor", A);
    const hothouse = spawn(game, "Case of the Locked Hothouse", A);
    lands(game, "Forest", 7, A);
    const ench = toLibrary(game, "Pacifism", A);
    a.chooseFromZoneFn = (_view, eligible) => eligible.slice(0, 1);
    toStep(game, "end", A);
    settle(game);
    expect(game.state.objects[hothouse].solved).toBe(true);
    expect(hand(game, A)).toContain(ench);
  });

  it("an opponent solving a Case doesn't trigger it", () => {
    const { game, a } = table();
    spawn(game, "Case File Auditor", A);
    const hothouse = spawn(game, "Case of the Locked Hothouse", B);
    lands(game, "Forest", 7, B);
    const ench = toLibrary(game, "Pacifism", A);
    a.chooseFromZoneFn = (_view, eligible) => eligible.slice(0, 1);
    toStep(game, "end", B);
    settle(game);
    expect(game.state.objects[hothouse].solved).toBe(true);
    expect(hand(game, A)).not.toContain(ench);
  });

  it("its mana may be spent as though any color on Case spells only", () => {
    const { game } = table();
    spawn(game, "Case File Auditor", A);
    lands(game, "Plains", 6, A);
    cast(game, toHand(game, "Case of the Locked Hothouse", A));
    expect(game.battlefield.some((id) => game.state.objects[id].cardName === "Case of the Locked Hothouse")).toBe(true);
    expect(() => cast(game, toHand(game, "Grizzly Bears", A))).toThrow();
  });
});
