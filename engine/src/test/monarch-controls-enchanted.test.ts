/**
 * An Aura giving the enchanted creature to the monarch (`controlEnchanted:
 * "monarch"`, rules 613.1b and 725): Fealty to the Realm's "The monarch
 * controls enchanted creature", read each time control is recomputed, the
 * effect's timestamp still the Aura's; and "Enchanted creature attacks each
 * combat if able and can't attack you", "you" its controller.
 */
import { describe, expect, it } from "vitest";

import type { LegalAction } from "../actions.js";
import type { Game } from "../game.js";
import type { ObjectId, PlayerId } from "../primitives.js";
import { A, B, C, cast, controller, lands, ref, spawn, table, toHand } from "./harness.js";

type AttackOffer = Extract<LegalAction, { kind: "declare-attackers" }>;

/** State-based actions and layer 2 recomputed, as before any priority. */
function check(game: Game): void {
  (game as unknown as { prepareForPriority(player: PlayerId): void }).prepareForPriority(A);
}

function attackOffer(game: Game, player: PlayerId): AttackOffer {
  game.advanceUntil((s) => s.awaiting?.kind === "attackers" && s.awaiting.player === player);
  const offer = game.legalActions(player).find((o): o is AttackOffer => o.kind === "declare-attackers");
  if (offer === undefined) throw new Error(`${player} wasn't asked to attack`);
  return offer;
}

function fealty(game: Game, on: ObjectId): ObjectId {
  lands(game, "Island", 5);
  const aura = toHand(game, "Fealty to the Realm");
  cast(game, aura, { targets: [ref(on)] });
  return aura;
}

describe("Fealty to the Realm", () => {
  it("makes you the monarch, so you control the creature; it follows the monarchy", () => {
    const { game } = table({ players: 3 });
    const bears = spawn(game, "Grizzly Bears", B);
    fealty(game, bears);
    expect(game.state.monarch).toBe(A);
    expect(controller(game, bears)).toBe(A);
    game.debugApplyEffect(C, { kind: "become-monarch" }, []);
    check(game);
    expect(controller(game, bears)).toBe(C);
    game.debugApplyEffect(B, { kind: "become-monarch" }, []);
    check(game);
    expect(controller(game, bears)).toBe(B);
  });

  it("keeps its timestamp: a newer control effect outlasts a change of monarch (its ruling)", () => {
    const { game } = table({ players: 3 });
    const bears = spawn(game, "Grizzly Bears", B);
    fealty(game, bears);
    game.debugApplyEffect(B, { kind: "gain-control", target: 0, untilEndOfTurn: false }, [ref(bears)]);
    check(game);
    expect(controller(game, bears)).toBe(B);
    game.debugApplyEffect(C, { kind: "become-monarch" }, []);
    check(game);
    expect(controller(game, bears)).toBe(B);
  });

  it("the creature must attack, and not the Aura's controller", () => {
    const { game } = table({ players: 3 });
    const bears = spawn(game, "Grizzly Bears", B);
    fealty(game, bears);
    game.debugApplyEffect(C, { kind: "become-monarch" }, []);
    check(game);
    expect(controller(game, bears)).toBe(C);
    const offer = attackOffer(game, C);
    expect(offer.mustAttack).toContain(bears);
    expect(offer.defendersFor[bears]).toEqual([B]);
  });

  it("when the monarch leaves the game, the next monarch gains control (its ruling)", () => {
    const { game } = table({ players: 3 });
    const bears = spawn(game, "Grizzly Bears", B);
    fealty(game, bears);
    game.debugApplyEffect(C, { kind: "become-monarch" }, []);
    check(game);
    expect(controller(game, bears)).toBe(C);
    game.state.players[C].life = 0;
    check(game);
    expect(game.state.players[C].hasLost).toBe(true);
    // Alice's turn: she, the active player, is the monarch now.
    expect(game.state.monarch).toBe(A);
    expect(game.state.objects[bears].zone).toBe("battlefield");
    expect(controller(game, bears)).toBe(A);
  });

  it("when the monarch who owns the Aura leaves, it goes with them and control reverts (its ruling)", () => {
    const { game } = table({ players: 3 });
    const bears = spawn(game, "Grizzly Bears", C);
    const aura = fealty(game, bears);
    game.state.players[A].life = 0;
    check(game);
    expect(game.state.players[A].hasLost).toBe(true);
    // The Aura left with its owner (rule 800.4a; the engine keeps what a
    // departed player owns on view, inert), so its effect has ended: bob, the
    // next player, is the monarch now, and the creature goes back to carol.
    expect(game.state.objects[aura].owner).toBe(A);
    expect(game.state.monarch).toBe(B);
    expect(controller(game, bears)).toBe(C);
  });
});
