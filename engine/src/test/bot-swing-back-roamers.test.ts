/**
 * The crackback as the turns to come find the board (`bot/combat-math.ts`'s
 * `swingBack`): a creature handed round the table attacks on every
 * opponent's turn, and one borrowed until end of turn is no blocker.
 */
import { describe, expect, it } from "vitest";
import { crackback, opponentsLethalAlone } from "../bot/combat-math.js";
import { invalidateComputedCache } from "../characteristics.js";
import { A, B, C, D, spawn, table } from "./harness.js";

const KILL_SHOT = { weight: 1, margin: 2 };

/** The commander damage the crackback counts from `commander`. */
const from = (
  game: ReturnType<typeof table>["game"],
  commander: ReturnType<typeof spawn>,
  lost?: "all",
): number => crackback(game.state, game.registry, A, 0.5, lost, KILL_SHOT).commanderDamage.get(commander) ?? 0;

describe("a creature handed round the table, in the crackback", () => {
  it("counts Slicer in the swing of every opponent to act, not only its owner's", () => {
    const { game } = table({ players: 4 });
    const slicer = spawn(game, "Slicer, Hired Muscle", B);
    game.state.objects[slicer].isCommander = true;
    // Bob's own attack in full (3 double strike), then Carol's and Dave's
    // with it borrowed, each at the paranoia share: 6 + 3 + 3.
    expect(from(game, slicer)).toBe(12);
    // At 9 already taken, the two borrowed attacks are the difference
    // between 15 and 21.
    game.state.players[A].commanderDamageTaken = { [slicer]: 9 };
    expect(opponentsLethalAlone(game.state, game.registry, A)).toEqual([]);
    const through = crackback(game.state, game.registry, A, 0.5, undefined, KILL_SHOT);
    expect(9 + (through.commanderDamage.get(slicer) ?? 0)).toBeGreaterThanOrEqual(21);
  });

  it("never counts it against its owner, and never as its owner's blocker", () => {
    const { game } = table({ players: 4 });
    const slicer = spawn(game, "Slicer, Hired Muscle", A);
    game.state.objects[slicer].isCommander = true;
    for (let i = 0; i < 2; i += 1) spawn(game, "Hill Giant", B);
    // Goaded by its owner, it attacks someone else (rule 701.15b); and by
    // Bob's turn it has been handed on or has converted: no blocker.
    const through = crackback(game.state, game.registry, A, 0.5, undefined, KILL_SHOT);
    expect(through.commanderDamage.size).toBe(0);
    expect(through.damage).toBe(6);
  });

  it("counts Alexios, whoever holds it now, under each opponent in turn", () => {
    const { game } = table({ players: 4 });
    // Carol's creature, sitting with Dave: Bob, Carol and Dave each get it
    // at their own upkeep (4 trample; the counters it grows by aren't read).
    const alexios = spawn(game, "Alexios, Deimos of Kosmos", C);
    game.state.objects[alexios].controller = D;
    invalidateComputedCache();
    const through = crackback(game.state, game.registry, A, 0.5, undefined, KILL_SHOT);
    expect(through.damage).toBe(4 + 2 + 2);
  });

  it("leaves an ordinary creature where it stands", () => {
    const { game } = table({ players: 4 });
    spawn(game, "Hill Giant", C);
    expect(crackback(game.state, game.registry, A, 0.5, undefined, KILL_SHOT).damage).toBe(1.5);
  });
});

describe("a creature controlled until end of turn, in the crackback", () => {
  it("is no blocker on our own turn, and is back in its owner's swing", () => {
    const { game } = table({ players: 4 });
    // Bob's Craw Wurm, ours by an Act of Treason this turn.
    const wurm = spawn(game, "Craw Wurm", B);
    game.state.objects[wurm].controller = A;
    game.state.objects[wurm].controlEndsAtCleanup = true;
    invalidateComputedCache();
    spawn(game, "Hill Giant", C);
    // Bob's Wurm (6, next to act, in full) and Carol's Giant at the share,
    // with nothing of ours home to block either.
    expect(crackback(game.state, game.registry, A, 0.5, undefined, KILL_SHOT).damage).toBe(6 + 1.5);
  });

  it("still blocks while its control lasts, on another player's turn", () => {
    const { game } = table({ players: 4 });
    const wurm = spawn(game, "Craw Wurm", C);
    game.state.objects[wurm].controller = A;
    game.state.objects[wurm].controlEndsAtCleanup = true;
    spawn(game, "Hill Giant", B);
    // Bob's turn, his attack still to come.
    game.state.turn.activePlayerIndex = game.state.turnOrder.indexOf(B);
    invalidateComputedCache();
    expect(crackback(game.state, game.registry, A, 0.5, undefined, KILL_SHOT).damage).toBe(0);
  });
});
