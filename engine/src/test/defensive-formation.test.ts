/**
 * Defensive Formation — "Rather than the attacking player, you assign the
 * combat damage of each creature attacking you": the defending player makes
 * every choice of rule 510.1c for it (`StaticAbility.assignsAttackersCombatDamage`,
 * `combat/banding.ts`'s `defenderAssignsFor`), trample and "as though it
 * weren't blocked" included (the card's ruling).
 */
import { describe, expect, it } from "vitest";

import type { Game } from "../game.js";

import { A, B, C, life, spawn, table, zone } from "./harness.js";

const assigning = (game: Game) => game.advanceUntil((s) => s.awaiting?.kind === "assign-combat-damage" || s.turn.step === "postcombat-main");
const offer = (game: Game, player = A) => {
  const legal = game.legalActions(player).find((a) => a.kind === "assign-combat-damage");
  return legal?.kind === "assign-combat-damage" ? legal : undefined;
};

describe("Defensive Formation", () => {
  it("has the defending player divide an attacker's damage among its blockers", () => {
    const { game, a, b } = table();
    spawn(game, "Defensive Formation", B);
    const giant = spawn(game, "Hill Giant");
    const bears = spawn(game, "Grizzly Bears", B);
    const elves = spawn(game, "Llanowar Elves", B);
    a.declareAttackersFn = () => [{ attacker: giant, defender: B }];
    b.declareBlockersFn = () => [
      { blocker: bears, attacker: giant },
      { blocker: elves, attacker: giant },
    ];
    assigning(game);
    expect(offer(game, B)).toMatchObject({ attacker: giant, forOpponent: true, blockers: [bears, elves] });
    expect(offer(game, A)).toBeUndefined();
    expect(game.canDispatch({ type: "assign-combat-damage", player: A, assignment: [2, 1] })).not.toBeNull();
    // All 3 on the Elves: the Bears live, though the attacker could have killed both.
    game.dispatch({ type: "assign-combat-damage", player: B, assignment: [0, 3] });
    assigning(game);
    expect(zone(game, bears)).toBe("battlefield");
    expect(zone(game, elves)).toBe("graveyard");
  });

  it("decides how much tramples over", () => {
    const { game, a, b } = table();
    spawn(game, "Defensive Formation", B);
    const dreadmaw = spawn(game, "Colossal Dreadmaw");
    const bears = spawn(game, "Grizzly Bears", B);
    a.declareAttackersFn = () => [{ attacker: dreadmaw, defender: B }];
    b.declareBlockersFn = () => [{ blocker: bears, attacker: dreadmaw }];
    assigning(game);
    expect(offer(game, B)).toMatchObject({ attacker: dreadmaw, forOpponent: true, trample: true });
    game.dispatch({ type: "assign-combat-damage", player: B, assignment: [6] });
    assigning(game);
    expect(life(game, B)).toBe(20);
  });

  it("makes the \"as though it weren't blocked\" choice too", () => {
    const { game, a, b } = table();
    spawn(game, "Defensive Formation", B);
    const thorn = spawn(game, "Thorn Elemental");
    const bears = spawn(game, "Grizzly Bears", B);
    a.declareAttackersFn = () => [{ attacker: thorn, defender: B }];
    b.declareBlockersFn = () => [{ blocker: bears, attacker: thorn }];
    // Alice would send all 7 at Bob; she isn't asked.
    let asked = 0;
    a.assignCombatDamageFn = () => {
      asked += 1;
      return "unblocked";
    };
    assigning(game);
    expect(offer(game, B)).toMatchObject({ attacker: thorn, forOpponent: true, mayUnblocked: true });
    expect(offer(game, B)?.unblockedOnly).toBeUndefined();
    expect(offer(game, A)).toBeUndefined();
    game.dispatch({ type: "assign-combat-damage", player: B, assignment: [7] });
    assigning(game);
    expect(asked).toBe(0);
    expect(life(game, B)).toBe(20);
    expect(zone(game, bears)).toBe("graveyard");
  });

  it("answers by default without sending the damage at its own player", () => {
    const { game, a, b } = table();
    spawn(game, "Defensive Formation", B);
    const thorn = spawn(game, "Thorn Elemental");
    const bears = spawn(game, "Grizzly Bears", B);
    a.declareAttackersFn = () => [{ attacker: thorn, defender: B }];
    b.declareBlockersFn = () => [{ blocker: bears, attacker: thorn }];
    game.advanceUntil((s) => s.turn.step === "postcombat-main");
    expect(life(game, B)).toBe(20);
  });

  it("leaves a creature attacking another player to its controller", () => {
    const { game, a, c } = table({ players: 3 });
    spawn(game, "Defensive Formation", B);
    const giant = spawn(game, "Hill Giant");
    const bears = spawn(game, "Grizzly Bears", C);
    const elves = spawn(game, "Llanowar Elves", C);
    a.declareAttackersFn = () => [{ attacker: giant, defender: C }];
    c.declareBlockersFn = () => [
      { blocker: bears, attacker: giant },
      { blocker: elves, attacker: giant },
    ];
    assigning(game);
    expect(offer(game, A)).toMatchObject({ attacker: giant });
    expect(offer(game, A)?.forOpponent).toBeUndefined();
    expect(offer(game, B)).toBeUndefined();
    expect(offer(game, C)).toBeUndefined();
  });
});
