/**
 * "After this phase, there is an additional combat phase. Only land
 * creatures can attack during that combat phase" (Bumi, Unleashed):
 * `additional-combat`'s `onlyAttackers`, a restriction (rule 508.1c) for the
 * added combat phase alone — not any other combat that turn (its ruling).
 */
import { describe, expect, it } from "vitest";

import { whyCannotAttack } from "../combat/eligibility.js";
import type { Game } from "../game.js";
import type { ObjectId } from "../primitives.js";
import { A, B, enter, grant, life, pickTargets, registryOf, spawn, table, toStep, types } from "./harness.js";

const why = (game: Game, id: ObjectId): string | null => whyCannotAttack(game.state, registryOf(game), A, id, B);

describe("Bumi, Unleashed — only land creatures attack in the added combat", () => {
  it("earthbends 4, untaps the lands, and lets only the land creature attack again", () => {
    const { game, a } = table();
    const forest = spawn(game, "Forest");
    const mountain = spawn(game, "Mountain", A, { tapped: true });
    pickTargets(a, forest);
    const bumi = enter(game, "Bumi, Unleashed");
    expect(types(game, forest)).toEqual(expect.arrayContaining(["land", "creature"]));
    const bears = spawn(game, "Grizzly Bears");
    // Vigilance, so they're still untapped for the added combat: what stops
    // them there is the restriction alone.
    grant(game, bumi, "vigilance");
    grant(game, bears, "vigilance");
    const seen: Record<string, string | null>[] = [];
    let declarations = 0;
    a.declareAttackersFn = () => {
      declarations += 1;
      seen.push({ bumi: why(game, bumi), bears: why(game, bears), forest: why(game, forest) });
      if (declarations === 1) return [bumi, bears].map((attacker) => ({ attacker, defender: B }));
      if (declarations === 2) return [{ attacker: forest, defender: B }];
      return [];
    };
    toStep(game, "end");
    // The first combat: anything may attack.
    expect(seen[0]).toEqual({ bumi: null, bears: null, forest: null });
    // Bumi's trigger untapped the lands (the tapped Mountain too) and added a
    // combat in which only the Forest, a land creature, may attack.
    expect(game.state.objects[mountain].tapped).toBe(false);
    expect(seen[1].forest).toBeNull();
    expect(seen[1].bumi).toMatch(/can't attack this combat/);
    expect(seen[1].bears).toMatch(/can't attack this combat/);
    // 5 + 2, then the Forest's 4.
    expect(life(game, B)).toBe(20 - 7 - 4);
    expect(declarations).toBe(2);
    // Gone with that combat phase.
    expect(game.state.playerEffects?.some((e) => e.onlyAttackers !== undefined) ?? false).toBe(false);
  });

  it("the restriction is that phase's alone: a later added combat lets anything attack", () => {
    const { game, a } = table();
    const bumi = spawn(game, "Bumi, Unleashed");
    const bears = spawn(game, "Grizzly Bears");
    // A land creature, so a declaration is asked in Bumi's combat too.
    spawn(game, "Dryad Arbor");
    // Relentless Assault-style: an added combat after the second main phase too.
    game.debugApplyEffect(A, { kind: "additional-combat" }, []);
    const seen: (string | null)[] = [];
    let declarations = 0;
    a.declareAttackersFn = () => {
      declarations += 1;
      seen.push(why(game, bears));
      if (declarations === 1) return [{ attacker: bumi, defender: B }];
      return [];
    };
    toStep(game, "end");
    // First combat, Bumi's added one, then the one after the second main.
    expect(declarations).toBe(3);
    expect(seen[0]).toBeNull();
    expect(seen[1]).toMatch(/can't attack this combat/);
    expect(seen[2]).toBeNull();
  });
});
