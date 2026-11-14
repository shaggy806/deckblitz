/**
 * "Prevent all combat damage that would be dealt this combat by it and each
 * creature it's blocking" — `blockingRelation`'s `of` as a target slot (the
 * creatures blocked by what the spell targets, found as it resolves, rule
 * 608.2h), each given a `damage-rule` lasting until end of combat (511.2).
 * Sewers of Estark is the proving card; its other half, "if it's attacking,
 * it can't be blocked this turn", and doing nothing to a creature in neither.
 */
import { describe, expect, it } from "vitest";

import type { Game } from "../game.js";
import type { ObjectId } from "../primitives.js";
import { A, B, cast, graveyard, keywords, lands, life, ref, spawn, table, toHand, toStep } from "./harness.js";

const castSewers = (game: Game, on: ObjectId): void => {
  lands(game, "Swamp", 4);
  cast(game, toHand(game, "Sewers of Estark"), { targets: [ref(on)] });
};

describe("Sewers of Estark", () => {
  it("on a blocker: neither it nor the creatures it's blocking deal combat damage this combat", () => {
    const { game, a, b } = table();
    const giant = spawn(game, "Hill Giant", A);
    const bears = spawn(game, "Grizzly Bears", A);
    const wall = spawn(game, "Colossal Dreadmaw", B);
    a.declareAttackersFn = () => [
      { attacker: giant, defender: B },
      { attacker: bears, defender: B },
    ];
    b.declareBlockersFn = () => [{ blocker: wall, attacker: giant }];
    toStep(game, "declare-blockers", A);
    castSewers(game, wall);
    // Two shields: the Dreadmaw's and the Giant's it's blocking, not the Bears'.
    expect(game.state.activeReplacements).toHaveLength(2);
    toStep(game, "postcombat-main", A);
    // The Dreadmaw dealt nothing to the Giant, the Giant nothing to it; the
    // unblocked Bears weren't covered.
    expect(game.state.objects[giant].zone).toBe("battlefield");
    expect(game.state.objects[giant].damageMarked).toBe(0);
    expect(game.state.objects[wall].damageMarked).toBe(0);
    expect(life(game, B)).toBe(18);
    // This combat's only: none is left once combat has ended.
    expect(game.state.activeReplacements).toEqual([]);
  });

  it("on an attacker before blocks: it can't be blocked this turn", () => {
    const { game, a } = table();
    const bears = spawn(game, "Grizzly Bears", A);
    const wall = spawn(game, "Colossal Dreadmaw", B);
    a.declareAttackersFn = () => [{ attacker: bears, defender: B }];
    game.advanceUntil(
      (s) => s.turn.step === "declare-attackers" && s.awaiting === null && s.priority.holder === A && s.objects[bears].attacking != null,
    );
    castSewers(game, bears);
    expect(keywords(game, bears).has("unblockable")).toBe(true);
    // With nothing it could block, bob isn't even asked; the Bears connect.
    let asked = false;
    game.advanceUntil((s) => {
      if (s.awaiting?.kind === "blockers") asked = true;
      return s.turn.step === "postcombat-main" || asked;
    });
    expect(asked).toBe(false);
    expect(game.state.turn.number).toBe(1);
    expect(game.state.objects[wall].zone).toBe("battlefield");
    expect(game.state.objects[bears].zone).toBe("battlefield");
    expect(life(game, B)).toBe(18);
  });

  it("on a creature neither attacking nor blocking: nothing", () => {
    const { game } = table();
    const bears = spawn(game, "Grizzly Bears", B);
    castSewers(game, bears);
    expect(graveyard(game).some((id) => game.state.objects[id].cardName === "Sewers of Estark")).toBe(true);
    expect(game.state.activeReplacements).toEqual([]);
  });
});
