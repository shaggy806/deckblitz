/**
 * "Each creature without flanking blocking this creature gets -1/-1 until end
 * of turn" (Knight of Valor): `modify-pt-all` over `blockingRelation:
 * "blocking"` (bound to the source as it resolves) and `notKeyword:
 * "flanking"`, activated only once each turn.
 */
import { describe, expect, it } from "vitest";

import { A, B, activate, lands, pt, spawn, table } from "./harness.js";

describe("each creature blocking the source", () => {
  it("Knight of Valor: flanking, then {1}{W} shrinks each blocker without flanking, once a turn", () => {
    const { game, a, b } = table();
    const knight = spawn(game, "Knight of Valor");
    const giant = spawn(game, "Hill Giant", B);
    const cavalry = spawn(game, "Benalish Cavalry", B);
    const bystander = spawn(game, "Grizzly Bears", B);
    lands(game, "Plains", 4);
    a.declareAttackersFn = () => [{ attacker: knight, defender: B }];
    b.declareBlockersFn = () => [
      { blocker: giant, attacker: knight },
      { blocker: cavalry, attacker: knight },
    ];
    game.advanceUntil((s) => s.awaiting?.kind === "blockers");
    game.advanceUntil(
      (s) =>
        s.turn.step === "declare-blockers" &&
        s.awaiting === null &&
        s.zones.shared.stack.length === 0 &&
        s.pendingTriggers.length === 0 &&
        s.priority.holder === A,
    );
    // Flanking: the Giant only.
    expect(pt(game, giant)).toEqual({ power: 2, toughness: 2 });
    expect(pt(game, cavalry)).toEqual({ power: 2, toughness: 2 });
    activate(game, knight, 0);
    expect(pt(game, giant)).toEqual({ power: 1, toughness: 1 });
    expect(pt(game, cavalry)).toEqual({ power: 2, toughness: 2 });
    expect(pt(game, bystander)).toEqual({ power: 2, toughness: 2 });
    expect(() => activate(game, knight, 0)).toThrow();
    a.declareAttackersFn = () => [];
  });
});
