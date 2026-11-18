/**
 * "Separate all creatures that player controls into two piles. Only creatures in the pile of
 * their choice can attack this turn" (Fight or Flight): the chosen pile's fate is a turn-wide
 * restriction over everything else that player controls (`restrict`'s `exceptTargets`, rule
 * 611.2c), so a creature arriving later can't attack either (the ruling); `always` applies it
 * to an empty pile, and with nothing to separate (rule 700.3d). Two of them: only creatures in
 * both chosen piles can attack (the ruling).
 */
import { describe, expect, it } from "vitest";

import { restrictionsOf } from "../characteristics.js";
import type { Game } from "../game.js";
import type { GameState } from "../state.js";
import { activePlayerOf } from "../state.js";
import type { ObjectId, PlayerId } from "../primitives.js";
import { A, B, registryOf, spawn, table } from "./harness.js";

const FIGHT = "Fight or Flight";

const cantAttack = (game: Game, id: ObjectId): boolean => restrictionsOf(game.state, registryOf(game), id).has("cant-attack");

/** Bob's beginning of combat, once everything there has resolved. */
const toBobsCombat = (game: Game): void =>
  game.advanceUntil(
    (s: GameState) =>
      s.turn.step === "begin-combat" &&
      activePlayerOf(s) === B &&
      s.zones.shared.stack.length === 0 &&
      s.awaiting === null &&
      s.pendingTriggers.length === 0,
  );

describe("Fight or Flight", () => {
  it("only the pile Bob chooses can attack; a creature arriving later can't either", () => {
    const { game, a, b } = table();
    spawn(game, FIGHT, A);
    const bear = spawn(game, "Grizzly Bears", B, { sick: false });
    const giant = spawn(game, "Hill Giant", B, { sick: false });
    const lions = spawn(game, "Savannah Lions", B, { sick: false });
    let separated: readonly ObjectId[] = [];
    let fateWord: string | undefined;
    a.separatePilesFn = (_view, offer) => {
      separated = offer.objects;
      fateWord = offer.fates.chosen;
      return [[bear], [giant, lions]];
    };
    let chooser: PlayerId | undefined;
    b.choosePileFn = (view) => {
      chooser = view.player;
      return 1;
    };
    toBobsCombat(game);
    expect([...separated].sort()).toEqual([bear, giant, lions].sort());
    expect(fateWord).toBe("can-attack");
    expect(chooser).toBe(B);
    expect(cantAttack(game, bear)).toBe(true);
    expect(cantAttack(game, giant)).toBe(false);
    expect(cantAttack(game, lions)).toBe(false);
    const later = spawn(game, "Grizzly Bears", B, { sick: false });
    expect(cantAttack(game, later)).toBe(true);
    // Alice's own creatures aren't bound.
    const mine = spawn(game, "Grizzly Bears", A, { sick: false });
    expect(cantAttack(game, mine)).toBe(false);
  });

  it("an empty chosen pile: none of them can attack", () => {
    const { game, a, b } = table();
    spawn(game, FIGHT, A);
    const bear = spawn(game, "Grizzly Bears", B, { sick: false });
    const giant = spawn(game, "Hill Giant", B, { sick: false });
    a.separatePilesFn = () => [[], [bear, giant]];
    b.choosePileFn = () => 0;
    toBobsCombat(game);
    expect(cantAttack(game, bear)).toBe(true);
    expect(cantAttack(game, giant)).toBe(true);
  });

  it("with no creatures to separate, one arriving later still can't attack", () => {
    const { game, a, b } = table();
    spawn(game, FIGHT, A);
    let asked = false;
    a.separatePilesFn = (_view, offer) => {
      asked = true;
      return [offer.objects, []];
    };
    b.choosePileFn = () => 0;
    toBobsCombat(game);
    expect(asked).toBe(false);
    const later = spawn(game, "Grizzly Bears", B, { sick: false });
    expect(cantAttack(game, later)).toBe(true);
  });

  it("it doesn't trigger on its controller's own turn", () => {
    const { game, a } = table();
    spawn(game, FIGHT, A);
    const bear = spawn(game, "Grizzly Bears", A, { sick: false });
    let asked = false;
    a.separatePilesFn = (_view, offer) => {
      asked = true;
      return [offer.objects, []];
    };
    game.advanceUntil((s) => s.turn.step === "declare-attackers" && activePlayerOf(s) === A);
    expect(asked).toBe(false);
    expect(cantAttack(game, bear)).toBe(false);
  });

  it("two of them: only creatures in both chosen piles can attack", () => {
    const { game, a, b } = table();
    spawn(game, FIGHT, A);
    spawn(game, FIGHT, A);
    const bear = spawn(game, "Grizzly Bears", B, { sick: false });
    const giant = spawn(game, "Hill Giant", B, { sick: false });
    const lions = spawn(game, "Savannah Lions", B, { sick: false });
    let round = 0;
    a.separatePilesFn = () => (round++ === 0 ? [[bear, giant], [lions]] : [[giant, lions], [bear]]);
    b.choosePileFn = () => 0;
    toBobsCombat(game);
    expect(cantAttack(game, giant)).toBe(false);
    expect(cantAttack(game, bear)).toBe(true);
    expect(cantAttack(game, lions)).toBe(true);
  });

  it("a creature in the chosen pile that leaves and returns is a new object, and can't attack", () => {
    const { game, a, b } = table();
    spawn(game, FIGHT, A);
    const bear = spawn(game, "Grizzly Bears", B, { sick: false });
    const giant = spawn(game, "Hill Giant", B, { sick: false });
    a.separatePilesFn = () => [[bear], [giant]];
    b.choosePileFn = () => 0;
    toBobsCombat(game);
    expect(cantAttack(game, bear)).toBe(false);
    game.debugMove(bear, "exile");
    game.debugMove(bear, "battlefield");
    expect(cantAttack(game, bear)).toBe(true);
  });
});
