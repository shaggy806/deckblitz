/**
 * "You may look at the top card of your library any time" that only holds
 * sometimes (rule 401.5): a `visibility: { looksAtOwnLibraryTop }` static with a
 * `condition`, beside the permissions it comes with. Case of the Locked
 * Hothouse's "Solved —" and Ranger Class's level 3.
 */
import { describe, expect, it } from "vitest";

import type { Game } from "../game.js";
import type { ObjectId } from "../primitives.js";
import { A, activate, attack, B, cast, counters, destroy, lands, nextTurn, pickTargets, settle, spawn, table, tokensNamed, toHand, toLibrary, toStep, zone } from "./harness.js";

const CASE = "Case of the Locked Hothouse";
const CLASS = "Ranger Class";

const seesTop = (game: Game): ObjectId | null => game.viewFor(A).revealedLibraryTop[A];
const solve = (game: Game): void => {
  lands(game, "Forest", 7);
  toStep(game, "end");
  settle(game);
};

describe("Case of the Locked Hothouse", () => {
  it("gives the extra land drop unsolved, and nothing from the top", () => {
    const { game } = table();
    game.state.rules.maxLandsPerTurn = 1;
    spawn(game, CASE);
    game.dispatch({ type: "play-land", player: A, card: toHand(game, "Forest") });
    game.dispatch({ type: "play-land", player: A, card: toHand(game, "Forest") });
    expect(game.canDispatch({ type: "play-land", player: A, card: toHand(game, "Forest") })).not.toBeNull();

    const top = toLibrary(game, "Forest");
    expect(seesTop(game)).toBeNull();
    expect(game.canDispatch({ type: "play-land", player: A, card: top })).not.toBeNull();
  });

  it("stays unsolved with six lands, and solves at the end step with seven", () => {
    const { game } = table();
    const hothouse = spawn(game, CASE);
    lands(game, "Forest", 6);
    toStep(game, "end");
    settle(game);
    expect(game.state.objects[hothouse].solved).toBeFalsy();
    nextTurn(game);
    nextTurn(game);
    lands(game, "Forest", 1);
    toStep(game, "end");
    settle(game);
    expect(game.state.objects[hothouse].solved).toBe(true);
  });

  it("solved: its controller sees the top card, and no one else", () => {
    const { game } = table();
    spawn(game, CASE);
    const top = toLibrary(game, "Island");
    expect(seesTop(game)).toBeNull();
    solve(game);
    expect(seesTop(game)).toBe(top);
    expect(game.viewFor(B).revealedLibraryTop[A]).toBeNull();
  });

  it("solved: plays a land off the top", () => {
    const { game } = table();
    spawn(game, CASE);
    solve(game);
    nextTurn(game);
    nextTurn(game);
    const top = toLibrary(game, "Island");
    game.dispatch({ type: "play-land", player: A, card: top });
    expect(zone(game, top)).toBe("battlefield");
  });

  it("solved: casts creature and enchantment spells off the top, not others", () => {
    const { game } = table();
    spawn(game, CASE);
    solve(game);
    nextTurn(game);
    nextTurn(game);
    const bears = toLibrary(game, "Grizzly Bears");
    cast(game, bears, { via: "library-top" });
    expect(zone(game, bears)).toBe("battlefield");
    const enchantment = toLibrary(game, "Rancor");
    expect(game.canDispatch({ type: "cast-spell", player: A, card: enchantment, targets: [{ kind: "object", object: bears }], via: "library-top" })).toBeNull();
    cast(game, enchantment, { via: "library-top", targets: [{ kind: "object", object: bears }] });
    expect(zone(game, enchantment)).toBe("battlefield");
    const sorcery = toLibrary(game, "Divination");
    expect(() => cast(game, sorcery, { via: "library-top" })).toThrow();
  });

  it("the look goes when the Case does", () => {
    const { game } = table();
    const hothouse = spawn(game, CASE);
    const top = toLibrary(game, "Island");
    solve(game);
    expect(seesTop(game)).toBe(top);
    destroy(game, hothouse);
    expect(seesTop(game)).toBeNull();
  });
});

describe("Ranger Class", () => {
  it("makes a Wolf on entering", () => {
    const { game } = table();
    lands(game, "Forest", 2);
    cast(game, toHand(game, CLASS));
    expect(tokensNamed(game, "Wolf Token", A)).toBe(1);
  });

  it("looks and casts creature spells from the top at level 3 only", () => {
    const { game } = table();
    const cls = spawn(game, CLASS);
    lands(game, "Forest", 8);
    const top = toLibrary(game, "Grizzly Bears");
    expect(seesTop(game)).toBeNull();
    activate(game, cls, 0);
    expect(game.state.objects[cls].classLevel).toBe(2);
    expect(seesTop(game)).toBeNull();
    expect(() => cast(game, top, { via: "library-top" })).toThrow();
    activate(game, cls, 1);
    expect(game.state.objects[cls].classLevel).toBe(3);
    expect(seesTop(game)).toBe(top);
    expect(game.viewFor(B).revealedLibraryTop[A]).toBeNull();
    cast(game, top, { via: "library-top" });
    expect(zone(game, top)).toBe("battlefield");
  });

  it("level 2's attack trigger puts a counter on an attacker", () => {
    const { game, a } = table();
    const cls = spawn(game, CLASS);
    lands(game, "Forest", 2);
    activate(game, cls, 0);
    const bears = spawn(game, "Grizzly Bears");
    pickTargets(a, bears);
    attack(game, a, [bears], B);
    expect(counters(game, bears)).toBe(1);
  });
});
