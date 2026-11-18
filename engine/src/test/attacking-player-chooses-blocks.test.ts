/**
 * "All creatures block each combat if able. The attacking player chooses how
 * each creature blocks each combat." (Invasion Plans): Grand Melee's
 * `must-block`, and `StaticAbility.attackingPlayerChoosesBlocks` — each
 * defending player's declare-blockers decision (still theirs, rule 509.1a)
 * named on it as made by the attacking player (`chosenBy`, the active
 * player — rule 506.2), which `player-control.ts`'s `answeringPlayer` reads.
 * A "you choose how those creatures block" effect created after it entered
 * works instead.
 */
import { describe, expect, it } from "vitest";

import { ScriptedController } from "../controller.js";
import type { Game } from "../game.js";
import { answeringPlayer } from "../player-control.js";
import type { ObjectId, PlayerId } from "../primitives.js";
import { viewFor } from "../view.js";
import { A, B, C, D, cast, lands, nextTurn, spawn, table, toHand, toStep } from "./harness.js";

/** Alice attacks with `attackers`, each at the player beside it, and the game
 * runs to the first blockers decision (or past the step, with none). */
function attackWith(game: Game, attackers: readonly (readonly [ObjectId, PlayerId])[]): void {
  game.advanceUntil((s) => s.awaiting?.kind === "attackers");
  game.dispatch({ type: "declare-attackers", player: A, attackers: attackers.map(([attacker, defender]) => ({ attacker, defender })) });
  game.advanceUntil((s) => s.awaiting?.kind === "blockers" || (s.turn.step === "declare-blockers" && s.awaiting === null));
}

describe("Invasion Plans", () => {
  it("the attacking player answers the defending player's declaration of blockers", () => {
    const { game } = table();
    spawn(game, "Invasion Plans", B);
    const bears = spawn(game, "Grizzly Bears");
    spawn(game, "Grizzly Bears", B);
    toStep(game, "declare-attackers");
    attackWith(game, [[bears, B]]);
    expect(game.state.awaiting).toMatchObject({ kind: "blockers", player: B, chosenBy: A });
    expect(answeringPlayer(game.state, B)).toBe(A);
    // Alice's seat is shown the table as Bob, answering for him; Bob's isn't.
    expect(viewFor(game.state, game.registry, A)).toMatchObject({ perspective: B, answering: A });
    expect(viewFor(game.state, game.registry, B)).toMatchObject({ answering: A });
    expect(viewFor(game.state, game.registry, B)).not.toHaveProperty("perspective");
  });

  it("the attacker's seat declares, through its stand-in, and must have every creature block if able", () => {
    const { game, a, b } = table();
    spawn(game, "Invasion Plans");
    const giant = spawn(game, "Hill Giant");
    const bears = spawn(game, "Grizzly Bears");
    const elf = spawn(game, "Llanowar Elves", B);
    const wall = spawn(game, "Grizzly Bears", B);
    let bobAsked = 0;
    b.declareBlockersFn = () => {
      bobAsked += 1;
      return [];
    };
    const asBob = new ScriptedController(B);
    let aliceAsked = 0;
    // Alice puts both of Bob's creatures in front of her Hill Giant.
    asBob.declareBlockersFn = () => {
      aliceAsked += 1;
      return [
        { blocker: elf, attacker: giant },
        { blocker: wall, attacker: giant },
      ];
    };
    a.standInFn = () => asBob;
    toStep(game, "declare-attackers");
    attackWith(game, [
      [giant, B],
      [bears, B],
    ]);
    // Blocking nothing isn't a legal declaration: each must block if able.
    expect(game.canDispatch({ type: "declare-blockers", player: B, blocks: [] })).not.toBeNull();
    game.advanceUntil((s) => s.awaiting?.kind !== "blockers");
    expect(aliceAsked).toBe(1);
    expect(bobAsked).toBe(0);
    expect(game.state.objects[elf].blocking).toBeDefined();
    expect(game.state.objects[wall].blocking).toBeDefined();
    expect(game.state.objects[bears].blocked).toBe(false);
  });

  it("at four players, the attacking player answers each defending player's declaration", () => {
    const { game } = table({ players: 4 });
    spawn(game, "Invasion Plans", C);
    const one = spawn(game, "Grizzly Bears");
    const two = spawn(game, "Grizzly Bears");
    spawn(game, "Grizzly Bears", B);
    spawn(game, "Grizzly Bears", D);
    toStep(game, "declare-attackers");
    attackWith(game, [
      [one, B],
      [two, D],
    ]);
    const asked: PlayerId[] = [];
    while (game.state.awaiting?.kind === "blockers") {
      const defender = game.state.awaiting.player;
      asked.push(defender);
      expect(answeringPlayer(game.state, defender)).toBe(A);
      game.advanceUntil((s) => s.awaiting?.kind !== "blockers" || s.awaiting.player !== defender);
    }
    expect(asked).toEqual([B, D]);
  });

  it("on another player's turn, that player chooses — not the controller of Invasion Plans", () => {
    const { game } = table();
    spawn(game, "Invasion Plans");
    spawn(game, "Grizzly Bears");
    nextTurn(game);
    const bears = spawn(game, "Grizzly Bears", B);
    toStep(game, "declare-attackers", B);
    game.advanceUntil((s) => s.awaiting?.kind === "attackers");
    game.dispatch({ type: "declare-attackers", player: B, attackers: [{ attacker: bears, defender: A }] });
    game.advanceUntil((s) => s.awaiting?.kind === "blockers" || (s.turn.step === "declare-blockers" && s.awaiting === null));
    expect(game.state.awaiting).toMatchObject({ kind: "blockers", player: A, chosenBy: B });
    expect(answeringPlayer(game.state, A)).toBe(B);
  });

  it("gone, or without its abilities, nobody else chooses", () => {
    const { game } = table();
    const plans = spawn(game, "Invasion Plans", B);
    const bears = spawn(game, "Grizzly Bears");
    spawn(game, "Grizzly Bears", B);
    game.debugMove(plans, "graveyard");
    toStep(game, "declare-attackers");
    attackWith(game, [[bears, B]]);
    expect(game.state.awaiting).toMatchObject({ kind: "blockers", player: B });
    expect(game.state.awaiting).not.toHaveProperty("chosenBy");
    expect(answeringPlayer(game.state, B)).toBe(B);
  });

  it("a Master Warcraft resolved after it entered works instead: its caster chooses", () => {
    const { game } = table({ players: 3 });
    spawn(game, "Invasion Plans", B);
    const bears = spawn(game, "Grizzly Bears");
    spawn(game, "Grizzly Bears", B);
    lands(game, "Mountain", 4, C);
    game.state.priority.holder = C;
    cast(game, toHand(game, "Master Warcraft", C), { player: C });
    toStep(game, "declare-attackers");
    // Master Warcraft's caster names the attackers too: Carol's stand-in.
    game.dispatch({ type: "declare-attackers", player: A, attackers: [{ attacker: bears, defender: B }] });
    game.advanceUntil((s) => s.awaiting?.kind === "blockers" || (s.turn.step === "declare-blockers" && s.awaiting === null));
    expect(game.state.awaiting).toMatchObject({ kind: "blockers", player: B, chosenBy: A });
    expect(answeringPlayer(game.state, B)).toBe(C);
  });

  it("one that entered after the Master Warcraft resolved works: the attacking player chooses", () => {
    const { game } = table({ players: 3 });
    const bears = spawn(game, "Grizzly Bears");
    spawn(game, "Grizzly Bears", B);
    lands(game, "Mountain", 4, C);
    game.state.priority.holder = C;
    cast(game, toHand(game, "Master Warcraft", C), { player: C });
    spawn(game, "Invasion Plans", B);
    toStep(game, "declare-attackers");
    game.dispatch({ type: "declare-attackers", player: A, attackers: [{ attacker: bears, defender: B }] });
    game.advanceUntil((s) => s.awaiting?.kind === "blockers" || (s.turn.step === "declare-blockers" && s.awaiting === null));
    expect(answeringPlayer(game.state, B)).toBe(A);
  });
});
