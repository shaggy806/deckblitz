/**
 * "After this main phase, there is an additional combat phase. Only the
 * chosen creatures can attack during that combat phase" (Last Night
 * Together): `additional-combat`'s `afterThisPhase` from a main phase (rule
 * 500.8: no main phase added after it) with `onlyAttackers` naming the
 * spell's two targets (`inSet: { targets }`, bound as it resolves) — a
 * restriction for that combat phase alone (rule 508.1c).
 */
import { describe, expect, it } from "vitest";

import { whyCannotAttack } from "../combat/eligibility.js";
import type { Game } from "../game.js";
import type { ObjectId } from "../primitives.js";
import { A, B, cast, counters, grant, keywords, lands, life, pickTargets, ref, registryOf, spawn, table, toHand, toStep } from "./harness.js";

const why = (game: Game, id: ObjectId): string | null => whyCannotAttack(game.state, registryOf(game), A, id, B);

function setUp(step: "precombat-main" | "postcombat-main") {
  const { game, a } = table({ step });
  lands(game, "Mountain", 3);
  lands(game, "Forest", 2);
  const bears = spawn(game, "Grizzly Bears", A, { tapped: true });
  const giant = spawn(game, "Hill Giant");
  const elves = spawn(game, "Llanowar Elves");
  const spell = toHand(game, "Last Night Together");
  return { game, a, bears, giant, elves, spell };
}

describe("Last Night Together — only the chosen creatures attack in the added combat", () => {
  it("cast before combat: untaps and grows the two, then a combat only they may attack in, then the turn's own", () => {
    const { game, a, bears, giant, elves, spell } = setUp("precombat-main");
    pickTargets(a, bears, giant);
    cast(game, spell, { targets: [ref(bears), ref(giant)] });
    expect(game.state.objects[bears].tapped).toBe(false);
    expect(counters(game, bears)).toBe(2);
    expect(counters(game, giant)).toBe(2);
    for (const id of [bears, giant]) {
      expect([...keywords(game, id)]).toEqual(expect.arrayContaining(["vigilance", "indestructible", "haste"]));
    }
    expect(keywords(game, elves).has("haste")).toBe(false);
    const seen: Record<string, string | null>[] = [];
    let declarations = 0;
    a.declareAttackersFn = () => {
      declarations += 1;
      seen.push({ bears: why(game, bears), giant: why(game, giant), elves: why(game, elves) });
      if (declarations === 1) return [bears, giant].map((attacker) => ({ attacker, defender: B }));
      if (declarations === 2) return [{ attacker: elves, defender: B }];
      return [];
    };
    toStep(game, "end");
    // The added combat, straight after this main phase: the elves can't.
    expect(seen[0].bears).toBeNull();
    expect(seen[0].giant).toBeNull();
    expect(seen[0].elves).toMatch(/can't attack/);
    // The turn's own combat after it: anything may (vigilance kept the two untapped).
    expect(seen[1]).toEqual({ bears: null, giant: null, elves: null });
    expect(declarations).toBe(2);
    // 4 + 5, then the elves' 1.
    expect(life(game, B)).toBe(20 - 9 - 1);
  });

  it("cast after combat: one more combat, and no main phase after it", () => {
    const { game, a, bears, giant, elves, spell } = setUp("postcombat-main");
    pickTargets(a, bears, giant);
    cast(game, spell, { targets: [ref(bears), ref(giant)] });
    const seen: (string | null)[] = [];
    a.declareAttackersFn = () => {
      seen.push(why(game, elves));
      return [{ attacker: giant, defender: B }];
    };
    const steps: string[] = [];
    game.advanceUntil((s) => {
      if (steps.at(-1) !== s.turn.step) steps.push(s.turn.step);
      return s.turn.step === "end";
    });
    expect(seen.length).toBe(1);
    expect(seen[0]).toMatch(/can't attack/);
    expect(life(game, B)).toBe(20 - 5);
    // Straight from the end of that combat to the end step.
    expect(steps.indexOf("postcombat-main")).toBe(0);
    expect(steps.slice(steps.indexOf("end-combat"))).toEqual(["end-combat", "end"]);
  });

  it("a chosen creature that has left and come back isn't the chosen one any more (rule 400.7)", () => {
    const { game, a, bears, giant, spell } = setUp("precombat-main");
    pickTargets(a, bears, giant);
    cast(game, spell, { targets: [ref(bears), ref(giant)] });
    // Flickered: a new object.
    game.debugApplyEffect(A, { kind: "flicker", target: 0 }, [ref(giant)]);
    const back = game.battlefield.find((id) => game.state.objects[id].cardName === "Hill Giant")!;
    // Haste, so only the restriction can stop it.
    grant(game, back, "haste");
    const seen: (string | null)[] = [];
    a.declareAttackersFn = () => {
      seen.push(why(game, back));
      return [];
    };
    toStep(game, "begin-combat");
    game.advanceUntil((s) => s.turn.step === "declare-blockers" || s.turn.step === "end-combat");
    expect(seen[0]).toMatch(/can't attack/);
  });
});
