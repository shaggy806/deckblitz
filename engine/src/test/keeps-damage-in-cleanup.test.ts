/**
 * "Damage isn't removed from this creature during cleanup steps" (Ancient
 * Adamantoise — `StaticAbility.keepsDamageInCleanup`): the cleanup step's
 * removal of marked damage (rule 514.2) passes it by, so damage builds up over
 * turns. Not while it's phased out (rule 702.26b; the ruling), and
 * regeneration still removes it (rule 701.19a; the ruling).
 */
import { describe, expect, it } from "vitest";

import type { Game } from "../game.js";
import type { ObjectId } from "../primitives.js";
import { A, B, nextTurn, ref, settle, spawn, table, toStep, tokensNamed, zone } from "./harness.js";

const damage = (game: Game, id: ObjectId): number => game.state.objects[id].damageMarked;

/** Bob's Grizzly Bears deals `amount` to `to` (a player or permanent). */
function hit(game: Game, by: ObjectId, to: ObjectId | typeof A, amount: number): void {
  game.debugApplyEffect(B, { kind: "damage", amount, target: 0 }, [ref(to)], { source: by });
  settle(game);
}

describe("Ancient Adamantoise", () => {
  it("keeps its damage through the cleanup step, turn after turn", () => {
    const { game } = table();
    const turtle = spawn(game, "Ancient Adamantoise");
    const bears = spawn(game, "Grizzly Bears", B);
    hit(game, bears, turtle, 5);
    expect(damage(game, turtle)).toBe(5);
    nextTurn(game);
    expect(damage(game, turtle)).toBe(5);
    // Bob's own creature's damage still goes at cleanup.
    const other = spawn(game, "Hill Giant", B);
    hit(game, bears, other, 2);
    nextTurn(game);
    expect(damage(game, other)).toBe(0);
    hit(game, bears, turtle, 4);
    expect(damage(game, turtle)).toBe(9);
  });

  it("takes the damage that would be dealt to you and your other permanents", () => {
    const { game } = table();
    const turtle = spawn(game, "Ancient Adamantoise");
    const mine = spawn(game, "Grizzly Bears");
    const bears = spawn(game, "Grizzly Bears", B);
    hit(game, bears, A, 3);
    hit(game, bears, mine, 2);
    expect(game.state.players[A].life).toBe(20);
    expect(damage(game, mine)).toBe(0);
    expect(damage(game, turtle)).toBe(5);
  });

  it("dies once its kept damage reaches 20: exiled, and ten tapped Treasures", () => {
    const { game } = table();
    const turtle = spawn(game, "Ancient Adamantoise");
    const bears = spawn(game, "Grizzly Bears", B);
    hit(game, bears, turtle, 15);
    nextTurn(game);
    hit(game, bears, turtle, 5);
    // State-based actions are checked as a player next gets priority (rule
    // 704.3): on into combat.
    toStep(game, "begin-combat", B);
    settle(game);
    expect(zone(game, turtle)).toBe("exile");
    expect(tokensNamed(game, "Treasure Token", A)).toBe(10);
    const treasures = game.state.zones.shared.battlefield.filter(
      (id) => game.state.objects[id].controller === A && game.state.objects[id].isToken,
    );
    expect(treasures.every((id) => game.state.objects[id].tapped)).toBe(true);
  });

  it("loses its damage at cleanup while phased out (the ruling)", () => {
    const { game } = table();
    const turtle = spawn(game, "Ancient Adamantoise");
    const bears = spawn(game, "Grizzly Bears", B);
    hit(game, bears, turtle, 6);
    game.debugApplyEffect(A, { kind: "phase-out", target: 0 }, [ref(turtle)]);
    settle(game);
    nextTurn(game);
    nextTurn(game);
    expect(game.state.zones.shared.battlefield).toContain(turtle);
    expect(damage(game, turtle)).toBe(0);
  });
});
