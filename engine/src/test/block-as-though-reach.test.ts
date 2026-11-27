/**
 * "This creature can block Dragons as though it had reach" (Dragon Hunter):
 * `StaticAbility.blocksAsThoughReach` lifts flying's "can't be blocked except
 * by creatures with flying and/or reach" (rule 702.9b) for the attackers its
 * filter picks out, and for nothing else. It grants no reach.
 */
import { describe, expect, it } from "vitest";

import { canBlock, combatCreatures } from "../bot/combat-math.js";
import { whyCannotBlock } from "../combat/eligibility.js";
import { A, B, blockOffer, keywords, life, spawn, table, toStep, zone } from "./harness.js";

describe("Dragon Hunter: blocks Dragons as though it had reach", () => {
  it("blocks a flying Dragon, and is offered as its blocker", () => {
    const { game, a, b } = table();
    const dragon = spawn(game, "Shivan Dragon"); // 5/5 flying
    const hunter = spawn(game, "Dragon Hunter", B);
    const offer = blockOffer(game, a, [dragon]);
    expect(offer.eligible.find((x) => x.blocker === hunter)?.canBlock).toEqual([dragon]);
    expect(whyCannotBlock(game.state, game.registry, B, hunter, dragon)).toBeNull();
    expect(keywords(game, hunter).has("reach")).toBe(false);

    b.declareBlockersFn = () => [{ blocker: hunter, attacker: dragon }];
    toStep(game, "postcombat-main");
    // Protection from Dragons prevents the Dragon's damage to it (702.16e).
    expect(zone(game, hunter)).toBe("battlefield");
    expect(life(game, B)).toBe(20);
  });

  it("can't block a flier that isn't a Dragon", () => {
    const { game, a } = table();
    const drake = spawn(game, "Wind Drake"); // 2/2 flying Drake
    const hunter = spawn(game, "Dragon Hunter", B);
    const bears = spawn(game, "Grizzly Bears", B);
    a.declareAttackersFn = () => [{ attacker: drake, defender: B }];
    game.advanceUntil((s) => s.turn.step === "declare-blockers" || s.awaiting?.kind === "blockers");
    expect(whyCannotBlock(game.state, game.registry, B, hunter, drake)).toMatch(/flying/);
    // Its permission is its own: the Bears still can't block a Dragon.
    expect(whyCannotBlock(game.state, game.registry, B, bears, drake)).toMatch(/flying/);
  });

  it("the bots read it the same way", () => {
    const { game } = table();
    const dragon = spawn(game, "Shivan Dragon");
    const drake = spawn(game, "Wind Drake");
    const hunter = spawn(game, "Dragon Hunter", B);
    const bears = spawn(game, "Grizzly Bears", B);
    const attackers = combatCreatures(game.state, game.registry, A, false);
    const blockers = combatCreatures(game.state, game.registry, B, true);
    const of = (list: typeof attackers, id: string) => list.find((c) => c.id === id)!;
    expect(canBlock(of(blockers, hunter), of(attackers, dragon))).toBe(true);
    expect(canBlock(of(blockers, hunter), of(attackers, drake))).toBe(false);
    expect(canBlock(of(blockers, bears), of(attackers, dragon))).toBe(false);
  });
});
