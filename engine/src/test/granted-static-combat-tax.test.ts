/**
 * A cost to attack or block granted by an ability (rules 508.1h, 509.1d):
 * Whipgrass Entangler's "target creature gains 'This creature can't attack or
 * block unless its controller pays {1} for each Cleric on the battlefield'".
 * A `combatTax` a `grant-static` gives is read where a printed one is
 * (`combat/tax.ts`), and two grants add up (the card's ruling).
 */

import { describe, expect, it } from "vitest";

import type { LegalAction } from "../actions.js";
import { creatureAttackTax } from "../combat/tax.js";
import type { Game } from "../game.js";
import type { ObjectId } from "../primitives.js";
import { A, B, activate, lands, ref, spawn, table } from "./harness.js";

type AttackOffer = Extract<LegalAction, { kind: "declare-attackers" }>;
type BlockOffer = Extract<LegalAction, { kind: "declare-blockers" }>;

const ready = (game: Game, name: string, player = A): ObjectId => {
  const id = spawn(game, name, player);
  game.state.objects[id].summoningSick = false;
  game.state.objects[id].tapped = false;
  return id;
};
const toAttackers = (game: Game): AttackOffer => {
  game.advanceUntil((s) => s.awaiting?.kind === "attackers" || s.result.over);
  return game.legalActions(A).find((a): a is AttackOffer => a.kind === "declare-attackers")!;
};
const untappedWastes = (game: Game, player = A): number =>
  game.state.zones.shared.battlefield.filter((id) => {
    const o = game.state.objects[id];
    return o.controller === player && (o.cardName === "Wastes" || o.cardName === "Plains") && !o.tapped;
  }).length;

describe("Whipgrass Entangler: a granted cost to attack or block", () => {
  it("taxes the creature's attack {1} a Cleric, and two grants add up", () => {
    const { game } = table();
    const entangler = ready(game, "Whipgrass Entangler");
    ready(game, "Whipgrass Entangler", B); // a second Cleric, the other side's
    const bears = ready(game, "Grizzly Bears");
    lands(game, "Plains", 4);
    lands(game, "Wastes", 5);
    activate(game, entangler, 0, { targets: [ref(bears)] });
    expect(creatureAttackTax(game.state, game.registry, bears, B)).toEqual({ generic: 2, life: 0 });
    activate(game, entangler, 0, { targets: [ref(bears)] });
    const offer = toAttackers(game);
    expect(offer.attackTax?.perAttacker?.[bears]?.[B]).toEqual({ generic: 4, life: 0 });
    // Nothing else is taxed: the Entangler attacks free.
    expect(offer.attackTax?.perAttacker?.[entangler]).toBeUndefined();
    const before = untappedWastes(game);
    game.dispatch({ type: "declare-attackers", player: A, attackers: [{ attacker: bears, defender: B }] });
    expect(game.state.objects[bears].attacking).toBe(B);
    expect(untappedWastes(game)).toBe(before - 4);
  });

  it("is refused unpaid", () => {
    const { game } = table();
    const entangler = ready(game, "Whipgrass Entangler");
    const attacker = ready(game, "Grizzly Bears");
    lands(game, "Plains", 2);
    activate(game, entangler, 0, { targets: [ref(attacker)] });
    toAttackers(game);
    // A's lands are spent: the Bears can't pay its {1}.
    expect(() =>
      game.dispatch({ type: "declare-attackers", player: A, attackers: [{ attacker, defender: B }] }),
    ).toThrow(/can't pay/);
  });

  it("taxes a block the same way", () => {
    const { game } = table();
    const entangler = ready(game, "Whipgrass Entangler");
    const attacker = ready(game, "Grizzly Bears");
    const blocker = ready(game, "Grizzly Bears", B);
    lands(game, "Plains", 2);
    activate(game, entangler, 0, { targets: [ref(blocker)] });
    toAttackers(game);
    game.dispatch({ type: "declare-attackers", player: A, attackers: [{ attacker, defender: B }] });
    game.advanceUntil((s) => s.awaiting?.kind === "blockers" || s.result.over);
    const offer = game.legalActions(B).find((a): a is BlockOffer => a.kind === "declare-blockers")!;
    expect(offer.blockTax?.onBlocker?.[blocker]?.[0]?.generic).toBe(1);
  });

  it("ends with the turn", () => {
    const { game } = table();
    const entangler = ready(game, "Whipgrass Entangler");
    const bears = ready(game, "Grizzly Bears");
    lands(game, "Plains", 2);
    activate(game, entangler, 0, { targets: [ref(bears)] });
    expect(toAttackers(game).attackTax?.perAttacker?.[bears]?.[B]?.generic).toBe(1);
    game.dispatch({ type: "declare-attackers", player: A, attackers: [] });
    game.advanceUntil((s) => s.turn.number === 2 && s.turn.step === "precombat-main");
    expect(game.state.turn.number).toBe(2);
    expect(game.state.objects[bears].modifiers.some((m) => m.grantsStatic !== undefined)).toBe(false);
  });
});
