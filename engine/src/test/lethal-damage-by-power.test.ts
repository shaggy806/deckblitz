/**
 * Lethal damage, and Zilortha, Strength Incarnate's "Lethal damage dealt to
 * creatures you control is determined by their power rather than their
 * toughness" (`StaticAbility.lethalDamageByPower`). Every reading of lethal
 * damage goes through `lethalDamageOf` / `lethalDamageLeft`
 * (`characteristics.ts`); see `docs/plans/lethal-damage-by-power.md`.
 */

import { describe, expect, it } from "vitest";

import { combatCreatures } from "../bot/combat-math.js";
import { computeCharacteristics, invalidateComputedCache, lethalDamageLeft, lethalDamageOf } from "../characteristics.js";
import { damageAssignmentViolations, lethalFor } from "../combat/damage.js";
import type { DamageAssignmentAsk } from "../controller.js";
import type { Game } from "../game.js";
import type { ObjectId, PlayerId } from "../primitives.js";
import { damageLands } from "../target-polarity.js";
import {
  A,
  B,
  attack,
  cast,
  destroy,
  enter,
  grant,
  lands,
  life,
  ref,
  registryOf,
  spawn,
  table,
  toHand,
  zone,
} from "./harness.js";

const ZILORTHA = "Zilortha, Strength Incarnate";

const markDamage = (game: Game, id: ObjectId, amount: number): void => {
  game.state.objects[id].damageMarked = amount;
  invalidateComputedCache();
};

/** State-based actions now, as before a player gets priority (rule 704.3). */
const checkStateBasedActions = (game: Game): void => {
  const holder = game.state.priority.holder as PlayerId;
  (game as unknown as { prepareForPriority(player: PlayerId): void }).prepareForPriority(holder);
};

/** `amount` damage to `id` from a source `by` controls (`source`, if given). */
const damage = (game: Game, id: ObjectId, amount: number, by: PlayerId = B, source?: ObjectId): void => {
  game.debugApplyEffect(by, { kind: "damage", amount, target: 0 }, [ref(id)], source === undefined ? {} : { source });
  checkStateBasedActions(game);
};

const lethal = (game: Game, id: ObjectId): number => lethalDamageOf(computeCharacteristics(game.state, registryOf(game), id));

describe("Zilortha, Strength Incarnate: the card", () => {
  it("is a 7/3 trampler whose static reaches only its controller's creatures", () => {
    const { game } = table();
    const zil = spawn(game, ZILORTHA, A);
    const wurm = spawn(game, "Craw Wurm", A); // 6/4
    const theirs = spawn(game, "Craw Wurm", B);
    const c = computeCharacteristics(game.state, registryOf(game), zil);
    expect([c.power, c.toughness, c.keywords.has("trample")]).toEqual([7, 3, true]);
    expect(lethal(game, zil)).toBe(7);
    expect(lethal(game, wurm)).toBe(6);
    expect(lethal(game, theirs)).toBe(4);
  });
});

describe("the state-based action (rule 704.5g)", () => {
  it("destroys a creature you control at damage equal to its power, not its toughness", () => {
    const { game } = table();
    const zil = spawn(game, ZILORTHA, A);
    const wurm = spawn(game, "Craw Wurm", A); // 6/4
    damage(game, wurm, 4);
    expect(zone(game, wurm)).toBe("battlefield");
    damage(game, zil, 3);
    expect(zone(game, zil)).toBe("battlefield");
    damage(game, wurm, 2);
    expect(zone(game, wurm)).toBe("graveyard");
  });

  it("leaves an opponent's creatures on their toughness", () => {
    const { game } = table();
    spawn(game, ZILORTHA, A);
    const wall = spawn(game, "Wall of Stone", B); // 0/8
    const wurm = spawn(game, "Craw Wurm", B);
    damage(game, wall, 1, A);
    damage(game, wurm, 4, A);
    expect(zone(game, wall)).toBe("battlefield");
    expect(zone(game, wurm)).toBe("graveyard");
  });

  it("destroys a 0-power creature only once it has damage marked (the ruling)", () => {
    const { game } = table();
    spawn(game, ZILORTHA, A);
    const wall = spawn(game, "Wall of Stone", A); // 0/8
    expect(lethal(game, wall)).toBe(1);
    checkStateBasedActions(game);
    expect(zone(game, wall)).toBe("battlefield");
    damage(game, wall, 1);
    expect(zone(game, wall)).toBe("graveyard");
  });

  it("makes damage already marked lethal as Zilortha enters, and as it leaves (the ruling)", () => {
    const { game } = table();
    const wall = spawn(game, "Wall of Stone", A);
    const wurm = spawn(game, "Craw Wurm", A);
    damage(game, wall, 1);
    expect(zone(game, wall)).toBe("battlefield");
    const zil = enter(game, ZILORTHA, A);
    checkStateBasedActions(game);
    expect(zone(game, wall)).toBe("graveyard");
    damage(game, wurm, 4);
    expect(zone(game, wurm)).toBe("battlefield");
    destroy(game, zil);
    checkStateBasedActions(game);
    expect(zone(game, zil)).toBe("graveyard");
    expect(zone(game, wurm)).toBe("graveyard");
  });

  it("changes nothing about toughness 0 (704.5f), indestructible or deathtouch (704.5h)", () => {
    const { game } = table();
    spawn(game, ZILORTHA, A);
    const myr = spawn(game, "Darksteel Myr", A); // 0/1 indestructible
    damage(game, myr, 3);
    expect(zone(game, myr)).toBe("battlefield");
    // Toughness 0 isn't a consequence of damage (the ruling): it still dies,
    // indestructible or not.
    game.debugApplyEffect(B, { kind: "modify-pt", target: 0, power: 2, toughness: -1, duration: "end-of-turn" }, [ref(myr)]);
    checkStateBasedActions(game);
    expect(zone(game, myr)).toBe("graveyard");
    const wurm = spawn(game, "Craw Wurm", A);
    const rats = spawn(game, "Typhoid Rats", B); // deathtouch
    damage(game, wurm, 1, B, rats);
    expect(zone(game, wurm)).toBe("graveyard");
  });
});

describe("combat damage assignment and trample (rule 702.19b — the ruling)", () => {
  it("an opponent's trampler needs only 1 on your 0-power blocker before the rest goes over", () => {
    const { game, a, b } = table();
    spawn(game, ZILORTHA, B);
    const wall = spawn(game, "Wall of Stone", B);
    const wurm = spawn(game, "Colossal Dreadmaw", A); // 6/6 trample
    expect(lethalFor(game.state, registryOf(game), wurm, wall)).toBe(1);
    let asked: DamageAssignmentAsk | null = null;
    b.declareBlockersFn = () => [{ blocker: wall, attacker: wurm }];
    a.assignCombatDamageFn = (_view, ask) => {
      asked = ask;
      return [1];
    };
    attack(game, a, [wurm]);
    expect(asked!.lethal).toEqual([1]);
    expect(life(game, B)).toBe(15);
    expect(zone(game, wall)).toBe("graveyard");
  });

  it("a blocker you control holds a trampler back by its power, and lives through less", () => {
    const { game, a, b } = table();
    const zil = spawn(game, ZILORTHA, B); // 7/3
    const wurm = spawn(game, "Colossal Dreadmaw", A); // 6/6 trample
    let asked = false;
    b.declareBlockersFn = () => [{ blocker: zil, attacker: wurm }];
    a.assignCombatDamageFn = () => {
      asked = true;
      return [6];
    };
    expect(lethalFor(game.state, registryOf(game), wurm, zil)).toBe(7);
    attack(game, a, [wurm]);
    // 7 is lethal and the trampler has 6: nothing can go over, so there's
    // no split to ask for.
    expect(asked).toBe(false);
    expect(life(game, B)).toBe(20);
    expect(zone(game, zil)).toBe("battlefield");
    expect(zone(game, wurm)).toBe("graveyard");
  });

  it("refuses a trample over that gives a blocker its toughness but not its power", () => {
    const { game } = table();
    spawn(game, ZILORTHA, B);
    const wurm = spawn(game, "Craw Wurm", B); // 6/4: lethal 6
    const hydra = spawn(game, "Colossal Dreadmaw", A); // 6/6 trample
    game.debugApplyEffect(A, { kind: "modify-pt", target: 0, power: 3, toughness: 0, duration: "end-of-turn" }, [ref(hydra)]);
    const offer = {
      blockers: [wurm],
      power: 9,
      lethal: [lethalFor(game.state, registryOf(game), hydra, wurm)],
      trample: true,
    };
    expect(offer.lethal).toEqual([6]);
    expect(damageAssignmentViolations(offer, [4])).toMatch(/lethal/);
    expect(damageAssignmentViolations(offer, [6])).toBeNull();
  });

  it("Zilortha's own trample is judged against a blocker's toughness when its controller has no Zilortha", () => {
    const { game, a, b } = table();
    const zil = spawn(game, ZILORTHA, A);
    const bears = spawn(game, "Grizzly Bears", B);
    b.declareBlockersFn = () => [{ blocker: bears, attacker: zil }];
    attack(game, a, [zil]);
    expect(life(game, B)).toBe(15);
    expect(zone(game, bears)).toBe("graveyard");
  });
});

describe("excess damage (rule 120.4a — Flame Spill, the ruling)", () => {
  it("is what's past the power of a creature its controller's Zilortha covers", () => {
    const { game } = table();
    spawn(game, ZILORTHA, B);
    const wall = spawn(game, "Wall of Stone", B);
    lands(game, "Mountain", 3);
    cast(game, toHand(game, "Flame Spill"), { targets: [ref(wall)] });
    // Lethal is 1 for a 0-power creature: 1 to the wall, 3 to bob.
    expect(zone(game, wall)).toBe("graveyard");
    expect(life(game, B)).toBe(17);
  });

  it("is none for a creature whose power the damage doesn't reach", () => {
    const { game } = table();
    spawn(game, ZILORTHA, B);
    const wurm = spawn(game, "Craw Wurm", B); // 6/4
    lands(game, "Mountain", 3);
    cast(game, toHand(game, "Flame Spill"), { targets: [ref(wurm)] });
    expect(zone(game, wurm)).toBe("battlefield");
    expect(game.state.objects[wurm].damageMarked).toBe(4);
    expect(life(game, B)).toBe(20);
  });
});

describe("the bots' arithmetic", () => {
  it("reads what kills a creature through the same rule", () => {
    const { game } = table();
    spawn(game, ZILORTHA, A);
    const wall = spawn(game, "Wall of Stone", A);
    const theirs = spawn(game, "Wall of Stone", B);
    const registry = registryOf(game);
    const mine = combatCreatures(game.state, registry, A, false).find((c) => c.id === wall);
    const other = combatCreatures(game.state, registry, B, false).find((c) => c.id === theirs);
    expect(mine?.lethal).toBe(1);
    expect(other?.lethal).toBe(8);
    expect(damageLands(game.state, registry, ref(wall), 1)).toBe(true);
    expect(damageLands(game.state, registry, ref(theirs), 1)).toBe(false);
    expect(lethalDamageLeft(computeCharacteristics(game.state, registry, wall), 0)).toBe(1);
    expect(lethalDamageLeft(computeCharacteristics(game.state, registry, theirs), 3)).toBe(5);
  });
});

describe("lethal damage already marked (rule 702.19b)", () => {
  it("a deathtouch trampler owes nothing to a blocker that already has lethal damage marked", () => {
    const { game, a, b } = table();
    const wurm = spawn(game, "Colossal Dreadmaw", A); // 6/6 trample
    grant(game, wurm, "deathtouch");
    const myr = spawn(game, "Darksteel Myr", B); // 0/1 indestructible
    markDamage(game, myr, 1);
    expect(lethalFor(game.state, registryOf(game), wurm, myr)).toBe(0);
    let asked: DamageAssignmentAsk | null = null;
    b.declareBlockersFn = () => [{ blocker: myr, attacker: wurm }];
    a.assignCombatDamageFn = (_view, ask) => {
      asked = ask;
      return [0];
    };
    attack(game, a, [wurm]);
    expect(asked!.lethal).toEqual([0]);
    expect(life(game, B)).toBe(14);
    expect(zone(game, myr)).toBe("battlefield");
  });

  it("one with no damage marked still needs only 1 from deathtouch (702.2c)", () => {
    const { game } = table();
    const wurm = spawn(game, "Colossal Dreadmaw", A);
    grant(game, wurm, "deathtouch");
    const bears = spawn(game, "Grizzly Bears", B);
    expect(lethalFor(game.state, registryOf(game), wurm, bears)).toBe(1);
  });
});
