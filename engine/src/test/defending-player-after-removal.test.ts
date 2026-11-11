/**
 * "Target creature defending player controls" chosen after the attacker has
 * left combat (rule 508.5: "if that creature is no longer attacking, the
 * defending player it's referring to is the player that creature was
 * attacking before it was removed from combat") — Armix, Filigree Thrasher's
 * reflexive "when you do", whose target is chosen as the attack trigger
 * resolves, with Armix perhaps already gone. `targeting.ts`'s
 * `defendingPlayerOf` reads this combat's journal entry then.
 */
import { describe, expect, it } from "vitest";

import type { Game } from "../game.js";
import type { ObjectId } from "../primitives.js";
import type { ScriptedController } from "../controller.js";

import { B, C, attack, cast, lands, pickModes, pt, ref, settle, spawn, table, toHand, watchTargets, zone } from "./harness.js";

/** Alice discards this card when asked. */
const discards = (seat: ScriptedController, card: ObjectId): void => {
  seat.chooseDiscardsFn = () => [card];
};

/** Armix is declared attacking `B`; stop with its trigger on the stack and
 * Bob holding priority. */
const attackToBobsPriority = (game: Game, a: ScriptedController, armix: ObjectId): void => {
  a.declareAttackersFn = () => [{ attacker: armix, defender: B }];
  game.advanceUntil((s) => s.turn.step === "declare-attackers" && s.zones.shared.stack.length > 0 && s.priority.holder === B);
};

describe("Armix, Filigree Thrasher", () => {
  it("discard: a creature the defending player controls gets -X/-X, artifacts you control plus those in your graveyard", () => {
    const { game, a } = table({ players: 3 });
    const armix = spawn(game, "Armix, Filigree Thrasher");
    const bobs = spawn(game, "Hill Giant", B);
    const other = spawn(game, "Grizzly Bears", B); // two to choose from, so the seat is asked
    const carols = spawn(game, "Hill Giant", C);
    const thopter = toHand(game, "Ornithopter");
    discards(a, thopter);
    pickModes(a, 0);
    const seen = watchTargets(a, () => [bobs]);
    attack(game, a, [armix]);
    expect(zone(game, thopter)).toBe("graveyard");
    // Bob's creature alone: Carol isn't the defending player.
    expect(seen.asked).toBe(1);
    expect([...seen.offered[0]].sort()).toEqual([bobs, other].sort());
    expect(seen.offered[0]).not.toContain(carols);
  });

  it("reads X as the reflexive ability resolves: Armix and the discarded artifact", () => {
    const { game, a } = table();
    const armix = spawn(game, "Armix, Filigree Thrasher");
    const giant = spawn(game, "Hill Giant", B);
    discards(a, toHand(game, "Ornithopter"));
    pickModes(a, 0);
    watchTargets(a, () => [giant]);
    a.declareAttackersFn = () => [{ attacker: armix, defender: B }];
    game.advanceUntil((s) => s.turn.step === "declare-blockers");
    expect(pt(game, giant)).toEqual({ power: 1, toughness: 1 });
  });

  it("declining the discard makes no reflexive ability", () => {
    const { game, a } = table();
    const armix = spawn(game, "Armix, Filigree Thrasher");
    spawn(game, "Hill Giant", B);
    pickModes(a);
    const seen = watchTargets(a);
    attack(game, a, [armix]);
    expect(seen.asked).toBe(0);
  });

  it("Armix gone before its trigger resolves: still the player it was attacking (rule 508.5)", () => {
    const { game, a } = table({ players: 3 });
    const armix = spawn(game, "Armix, Filigree Thrasher");
    const bobs = spawn(game, "Hill Giant", B);
    const other = spawn(game, "Grizzly Bears", B);
    const carols = spawn(game, "Hill Giant", C);
    lands(game, "Mountain", 1, B);
    discards(a, toHand(game, "Ornithopter"));
    pickModes(a, 0);
    const seen = watchTargets(a, () => [bobs]);
    attackToBobsPriority(game, a, armix);
    cast(game, toHand(game, "Shock", B), { player: B, targets: [ref(armix)], settle: false });
    game.advanceUntil((s) => s.turn.step === "declare-blockers" || s.turn.step === "postcombat-main");
    expect(zone(game, armix)).toBe("graveyard");
    expect(seen.asked).toBe(1);
    expect([...seen.offered[0]].sort()).toEqual([bobs, other].sort());
    expect(seen.offered[0]).not.toContain(carols);
    // X: no artifact left on the battlefield; Armix and the Ornithopter in the graveyard.
    expect(pt(game, bobs)).toEqual({ power: 1, toughness: 1 });
    settle(game);
  });
});
