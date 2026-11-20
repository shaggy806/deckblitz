/**
 * Two creatures exchanging power (rule 701.12g): the `exchange-stat` effect,
 * each one's power set (layer 7b) to the other's previous power, for a
 * duration — proven on Serene Master, "Whenever this creature blocks,
 * exchange its power and the power of target creature it's blocking until
 * end of combat."
 */
import { describe, expect, it } from "vitest";

import type { Game } from "../game.js";
import { A, B, life, pt, ref, spawn, table, toStep, zone } from "./harness.js";

/** Run until the block trigger has been put on the stack and resolved. */
const resolveBlockTrigger = (game: Game): void => {
  game.advanceUntil((s) => s.turn.step === "declare-blockers" && s.zones.shared.stack.length > 0);
  game.advanceUntil((s) => s.zones.shared.stack.length === 0);
};

describe("Serene Master", () => {
  it("takes the attacker's power for the combat, and gives it its own", () => {
    const { game, a, b } = table();
    const wurm = spawn(game, "Craw Wurm"); // 6/4
    const master = spawn(game, "Serene Master", B); // 0/2
    a.declareAttackersFn = () => [{ attacker: wurm, defender: B }];
    b.declareBlockersFn = () => [{ blocker: master, attacker: wurm }];
    resolveBlockTrigger(game);
    expect(pt(game, master)).toEqual({ power: 6, toughness: 2 });
    expect(pt(game, wurm)).toEqual({ power: 0, toughness: 4 });
    toStep(game, "postcombat-main");
    expect(zone(game, wurm)).toBe("graveyard");
    expect(zone(game, master)).toBe("battlefield");
    // Until end of combat only.
    expect(pt(game, master)).toEqual({ power: 0, toughness: 2 });
    expect(life(game, B)).toBe(20);
  });

  it("keeps bonuses on top of the exchanged power (the ruling's Lightning Talons)", () => {
    const { game, a, b } = table();
    const wurm = spawn(game, "Craw Wurm");
    const master = spawn(game, "Serene Master", B);
    game.debugApplyEffect(B, { kind: "modify-pt", target: 0, power: 3, toughness: 0, duration: "end-of-turn" }, [ref(master)]);
    expect(pt(game, master).power).toBe(3);
    a.declareAttackersFn = () => [{ attacker: wurm, defender: B }];
    b.declareBlockersFn = () => [{ blocker: master, attacker: wurm }];
    resolveBlockTrigger(game);
    expect(pt(game, master)).toEqual({ power: 9, toughness: 2 });
    expect(pt(game, wurm).power).toBe(3);
    toStep(game, "postcombat-main");
    // 9 damage to the 6/4, 3 to the 3/2.
    expect(zone(game, wurm)).toBe("graveyard");
    expect(zone(game, master)).toBe("graveyard");
  });

  it("does nothing if the target has left before it resolves (701.12a)", () => {
    const { game, a, b } = table();
    const wurm = spawn(game, "Craw Wurm");
    const master = spawn(game, "Serene Master", B);
    a.declareAttackersFn = () => [{ attacker: wurm, defender: B }];
    b.declareBlockersFn = () => [{ blocker: master, attacker: wurm }];
    game.advanceUntil((s) => s.turn.step === "declare-blockers" && s.zones.shared.stack.length > 0);
    game.debugMove(wurm, "graveyard");
    game.advanceUntil((s) => s.zones.shared.stack.length === 0);
    expect(pt(game, master)).toEqual({ power: 0, toughness: 2 });
    expect(life(game, A)).toBe(20);
  });
});
