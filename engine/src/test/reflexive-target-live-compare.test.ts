/**
 * A reflexive ability's target filter comparing with its source's power
 * (rule 603.12): Auron, Venerated Guardian's "put a +1/+1 counter on it. When
 * you do, exile target creature defending player controls with power less
 * than Auron's power". The target is chosen as the reflexive ability is put
 * on the stack, after the counter, so against Auron's power with it; and it's
 * rechecked as the ability resolves (rule 608.2b), against Auron's power then.
 */
import { describe, expect, it } from "vitest";

import { A, B, pickTargets, ref, settle, spawn, table, toStep, watchTargets, zone } from "./harness.js";

const AURON = "Auron, Venerated Guardian";

describe("Auron, Venerated Guardian: a reflexive target read against the source's power now", () => {
  it("offers what's smaller than Auron with the counter, and exiles it until Auron leaves", () => {
    const { game, a } = table();
    const auron = spawn(game, AURON, A);
    const bears = spawn(game, "Grizzly Bears", B);
    const giant = spawn(game, "Hill Giant", B);
    const elves = spawn(game, "Llanowar Elves", B);
    const seen = watchTargets(a, (offered) => [offered[0]?.includes(bears) === true ? bears : null]);
    a.declareAttackersFn = () => [{ attacker: auron, defender: B }];
    toStep(game, "declare-blockers");
    expect(seen.asked).toBe(1);
    // Auron is 3/6 now: a 2/2 is smaller (as Auron was 2, it wasn't), a 3/3
    // isn't.
    expect([...seen.offered[0]].sort()).toEqual([bears, elves].sort());
    expect(zone(game, giant)).toBe("battlefield");
    expect(zone(game, bears)).toBe("exile");
    expect(game.state.objects[auron].counters["+1/+1"]).toBe(1);
    // Auron leaves: the Bears come back.
    game.debugMove(auron, "graveyard");
    settle(game);
    expect(zone(game, bears)).toBe("battlefield");
  });

  it("rechecks the target against Auron's power as it resolves (608.2b)", () => {
    const { game, a } = table();
    const auron = spawn(game, AURON, A);
    const bears = spawn(game, "Grizzly Bears", B);
    pickTargets(a, bears);
    a.declareAttackersFn = () => [{ attacker: auron, defender: B }];
    // Up to the reflexive ability on the stack, its target chosen.
    game.advanceUntil((s) => s.zones.shared.stack.some((id) => s.objects[id]?.reflexiveTrigger !== undefined));
    expect(game.state.objects[game.state.zones.shared.stack.at(-1)!].targets).toEqual([ref(bears)]);
    // Before it resolves, Auron loses 2 power: the Bears (2) are no longer
    // smaller than Auron (1).
    game.debugApplyEffect(A, { kind: "modify-pt", target: 0, power: -2, toughness: 0, duration: "end-of-turn" }, [ref(auron)]);
    toStep(game, "declare-blockers");
    expect(zone(game, bears)).toBe("battlefield");
  });
});
