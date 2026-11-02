/**
 * `damage`'s `target: "source"`: untargeted damage to the ability's own source, "this creature
 * deals 3 damage to itself" (Psionic Entity, Psionic Sliver, Goblin Bangchuckers), or dealt to it
 * by something else (Goblin Tinkerer, `from: { target: 0 }`).
 */
import { describe, expect, it } from "vitest";

import type { Game } from "../game.js";
import type { ObjectId } from "../primitives.js";
import { A, B, activate, grant, lands, life, named, ref, settle, spawn, table, tokensNamed, zone } from "./harness.js";

const marked = (game: Game, id: ObjectId): number => game.state.objects[id].damageMarked;

describe("Psionic Entity: 2 damage to any target and 3 to itself", () => {
  it("deals both, killing itself", () => {
    const { game } = table();
    const entity = spawn(game, "Psionic Entity");
    activate(game, entity, 0, { targets: [ref(B)] });
    expect(life(game, B)).toBe(18);
    expect(zone(game, entity)).toBe("graveyard");
  });

  it("deals its 3 to itself alone: a target creature takes only the 2", () => {
    const { game } = table();
    const entity = spawn(game, "Psionic Entity");
    const giant = spawn(game, "Hill Giant", B);
    activate(game, entity, 0, { targets: [ref(giant)] });
    expect(marked(game, giant)).toBe(2);
    expect(zone(game, entity)).toBe("graveyard");
  });

  it("can target itself: 5 in all", () => {
    const { game } = table();
    const entity = spawn(game, "Psionic Entity");
    activate(game, entity, 0, { targets: [ref(entity)] });
    expect(zone(game, entity)).toBe("graveyard");
    const log = game.state.eventLog.filter((e) => e.type === "damage-dealt" && e.target.kind === "object" && e.target.object === entity);
    expect(log.map((e) => (e.type === "damage-dealt" ? e.amount : 0))).toEqual([2, 3]);
  });

  it("a target killed by the 2 and itself killed by the 3 both die", () => {
    const { game } = table();
    const entity = spawn(game, "Psionic Entity");
    const elves = spawn(game, "Llanowar Elves", B);
    activate(game, entity, 0, { targets: [ref(elves)] });
    expect(zone(game, elves)).toBe("graveyard");
    expect(zone(game, entity)).toBe("graveyard");
  });

  it("gone in response, the 2 is still dealt and nothing else happens", () => {
    const { game } = table();
    const entity = spawn(game, "Psionic Entity");
    activate(game, entity, 0, { targets: [ref(B)], settle: false });
    game.debugMove(entity, "graveyard");
    settle(game);
    expect(life(game, B)).toBe(18);
    expect(zone(game, entity)).toBe("graveyard");
  });

  it("gone and back in response is a new object (rule 400.7), dealt nothing", () => {
    const { game } = table();
    const entity = spawn(game, "Psionic Entity");
    activate(game, entity, 0, { targets: [ref(B)], settle: false });
    game.debugMove(entity, "exile");
    game.debugMove(entity, "battlefield");
    settle(game);
    expect(zone(game, entity)).toBe("battlefield");
    expect(marked(game, entity)).toBe(0);
  });

  it("the source's lifelink applies to each, and it isn't targeted by the 3", () => {
    const { game } = table();
    const entity = spawn(game, "Psionic Entity");
    grant(game, entity, "lifelink");
    grant(game, entity, "hexproof");
    activate(game, entity, 0, { targets: [ref(B)] });
    expect(life(game, A)).toBe(25);
    expect(zone(game, entity)).toBe("graveyard");
  });
});

describe("Psionic Sliver: the Sliver with the ability is the one hit", () => {
  it("another Sliver activating it damages itself, not the Psionic Sliver", () => {
    const { game } = table();
    const psionic = spawn(game, "Psionic Sliver");
    const other = spawn(game, "Winged Sliver");
    activate(game, other, 0, { targets: [ref(B)] });
    expect(life(game, B)).toBe(18);
    expect(zone(game, other)).toBe("graveyard");
    expect(marked(game, psionic)).toBe(0);
  });

  it("a nonsliver has nothing to activate", () => {
    const { game } = table();
    spawn(game, "Psionic Sliver");
    const bears = spawn(game, "Grizzly Bears");
    expect(game.canDispatch({ type: "activate-ability", player: A, source: bears, abilityIndex: 0, targets: [ref(B)] })).not.toBeNull();
  });
});

describe("Goblin Bangchuckers: a flip decides which", () => {
  const flipWith = (seed: number) => {
    const { game } = table({ seed });
    const goblin = spawn(game, "Goblin Bangchuckers");
    grant(game, goblin, "indestructible");
    activate(game, goblin, 0, { targets: [ref(B)] });
    return { hitB: life(game, B) === 18, hitSelf: marked(game, goblin) === 2 };
  };

  it("won, the target is hit; lost, itself is; never both or neither", () => {
    const seen = new Set<string>();
    for (let seed = 1; seed <= 24; seed += 1) {
      const { hitB, hitSelf } = flipWith(seed);
      expect(hitB).not.toBe(hitSelf);
      seen.add(hitB ? "won" : "lost");
    }
    expect([...seen].sort()).toEqual(["lost", "won"]);
  });
});

describe("Goblin Tinkerer: the artifact deals its mana value to this creature", () => {
  it("destroyed, the artifact still deals it, as it last existed (rule 608.2h)", () => {
    const { game } = table();
    lands(game, "Mountain", 1);
    const tinkerer = spawn(game, "Goblin Tinkerer");
    const scythe = spawn(game, "Strata Scythe", B);
    activate(game, tinkerer, 0, { targets: [ref(scythe)] });
    expect(zone(game, scythe)).toBe("graveyard");
    expect(zone(game, tinkerer)).toBe("graveyard");
  });

  it("a cheaper one leaves it damaged but alive; the damage has the artifact as its source", () => {
    const { game } = table();
    lands(game, "Mountain", 1);
    const tinkerer = spawn(game, "Goblin Tinkerer");
    const relic = spawn(game, "Sol Ring", B);
    activate(game, tinkerer, 0, { targets: [ref(relic)] });
    expect(zone(game, relic)).toBe("graveyard");
    expect(marked(game, tinkerer)).toBe(1);
    const dealt = game.state.eventLog.filter((e) => e.type === "damage-dealt" && e.source === relic);
    expect(dealt.length).toBe(1);
  });

  it("an indestructible artifact still deals it", () => {
    const { game } = table();
    lands(game, "Mountain", 1);
    const tinkerer = spawn(game, "Goblin Tinkerer");
    const relic = spawn(game, "Sol Ring", B);
    grant(game, relic, "indestructible");
    activate(game, tinkerer, 0, { targets: [ref(relic)] });
    expect(zone(game, relic)).toBe("battlefield");
    expect(marked(game, tinkerer)).toBe(1);
  });

  it("gone in response, the artifact is still destroyed and nothing is dealt to a new object", () => {
    const { game } = table();
    lands(game, "Mountain", 1);
    const tinkerer = spawn(game, "Goblin Tinkerer");
    const relic = spawn(game, "Sol Ring", B);
    activate(game, tinkerer, 0, { targets: [ref(relic)], settle: false });
    game.debugMove(tinkerer, "hand");
    settle(game);
    expect(zone(game, relic)).toBe("graveyard");
    expect(zone(game, tinkerer)).toBe("hand");
    expect(marked(game, tinkerer)).toBe(0);
  });
});

describe("a token source", () => {
  it("one token of a stack is the source: only it is hit, the others stay", () => {
    const { game } = table();
    spawn(game, "Psionic Sliver");
    game.debugApplyEffect(A, { kind: "create-token", token: "Sliver Token", count: 3 }, []);
    settle(game);
    const stack = named(game, "Sliver Token", A)[0];
    game.state.objects[stack].summoningSick = false;
    activate(game, stack, 0, { targets: [ref(B)] });
    expect(life(game, B)).toBe(18);
    expect(tokensNamed(game, "Sliver Token", A)).toBe(2);
  });
});
