/**
 * "Target … chosen at random" (`targetsAtRandom`): real targets the game picks
 * as the ability goes on the stack, from the seeded randomness. Scab-Clan Giant,
 * Witch Hunt, Knight Rampager and Power Pack by trigger, Goblin Test Pilot by
 * activation, and Capricious Efreet's chosen targets of which one is destroyed
 * at random, which is the resolution-time pick Wild Swing has.
 */
import { describe, expect, it } from "vitest";

import type { ObjectId, PlayerId } from "../primitives.js";
import { A, B, C, D, activate, attack, controller, destroy, life, nextTurn, ref, settle, spawn, table, toGraveyard, toStep, zone } from "./harness.js";

type Game = ReturnType<typeof table>["game"];

/** The targets of the ability on top of the stack. */
const topTargets = (game: Game) => {
  const stack = game.state.zones.shared.stack;
  return game.state.objects[stack[stack.length - 1]]?.targets ?? [];
};

const seeds = (n: number): number[] => Array.from({ length: n }, (_, i) => i + 1);

describe("Scab-Clan Giant", () => {
  /** Who it fought on this seed, the answer never being asked for. */
  function fought(seed: number, setUp: (game: Game) => void = () => {}): ObjectId | "fizzled" {
    const { game, a } = table({ seed });
    a.chooseTargetsFn = () => {
      throw new Error("nobody chooses a random target");
    };
    setUp(game);
    const giant = game.debugSpawn("Scab-Clan Giant", A, "battlefield", { announceEntry: true });
    game.advanceUntil((s) => s.pendingTriggers.length === 0 && s.zones.shared.stack.length > 0);
    const target = topTargets(game)[0];
    settle(game);
    expect(zone(game, giant)).toBe("battlefield");
    return target?.kind === "object" ? target.object : "fizzled";
  }

  it("fights an opponent's creature nobody chose, each equally able to be picked", () => {
    const hit = new Set<string>();
    for (const seed of seeds(24)) {
      let names: Record<string, string> = {};
      const target = fought(seed, (game) => {
        const bears = spawn(game, "Grizzly Bears", B);
        const elves = spawn(game, "Llanowar Elves", B);
        spawn(game, "Savannah Lions", A);
        names = { [bears]: "bears", [elves]: "elves" };
      });
      hit.add(names[target] ?? "other");
    }
    expect([...hit].sort()).toEqual(["bears", "elves"]);
  });

  it("deals and takes the fight's damage", () => {
    const { game } = table();
    const bears = spawn(game, "Grizzly Bears", B);
    const giant = game.debugSpawn("Scab-Clan Giant", A, "battlefield", { announceEntry: true });
    settle(game);
    expect(zone(game, bears)).toBe("graveyard");
    expect(game.state.objects[giant].damageMarked).toBe(2);
  });

  it("leaves a creature it can't target out of the running", () => {
    for (const seed of seeds(12)) {
      let bears = "" as ObjectId;
      const target = fought(seed, (game) => {
        // Hexproof: not a legal target, so never picked.
        spawn(game, "Gladecover Scout", B);
        bears = spawn(game, "Grizzly Bears", B);
      });
      expect(target).toBe(bears);
    }
  });

  it("does nothing with no creature to target", () => {
    const { game } = table();
    const giant = game.debugSpawn("Scab-Clan Giant", A, "battlefield", { announceEntry: true });
    settle(game);
    expect(game.state.zones.shared.stack).toEqual([]);
    expect(game.state.objects[giant].damageMarked ?? 0).toBe(0);
  });

  it("makes each token of a stack as likely as any other permanent", () => {
    let tokens = 0;
    let other = 0;
    const runs = 120;
    for (const seed of seeds(runs)) {
      let elves = "" as ObjectId;
      const target = fought(seed, (game) => {
        const stack = spawn(game, "Grizzly Bears", B);
        game.state.objects[stack].isToken = true;
        game.state.objects[stack].stackCount = 9;
        elves = spawn(game, "Llanowar Elves", B);
      });
      // A chosen token is split off its stack, so it's any id but the Elves'.
      if (target === elves) other += 1;
      else tokens += 1;
    }
    // One in ten for the Elves: far from the even split one per object would be.
    expect(other).toBeGreaterThan(0);
    expect(tokens).toBeGreaterThan(other * 3);
  });

  it("answers ward, as a target would", () => {
    const { game } = table();
    const miirym = spawn(game, "Miirym, Sentinel Wyrm", B);
    game.debugSpawn("Scab-Clan Giant", A, "battlefield", { announceEntry: true });
    settle(game);
    // No mana to pay {2} for: countered, so no fight.
    expect(game.state.objects[miirym].damageMarked ?? 0).toBe(0);
  });

  it("replays the same pick from the same seed", () => {
    const run = (): string => {
      const { game } = table({ seed: 7, players: 4 });
      spawn(game, "Grizzly Bears", B);
      spawn(game, "Grizzly Bears", C);
      spawn(game, "Grizzly Bears", D);
      game.debugSpawn("Scab-Clan Giant", A, "battlefield", { announceEntry: true });
      settle(game);
      return JSON.stringify([B, C, D].map((p) => game.state.zones.perPlayer[p].graveyard.length));
    };
    expect(run()).toBe(run());
  });
});

describe("Witch Hunt", () => {
  it("passes to an opponent at random at your end step, who then takes its 4 damage", () => {
    const owners = new Set<PlayerId>();
    for (const seed of seeds(24)) {
      const { game } = table({ seed, players: 4 });
      const hunt = spawn(game, "Witch Hunt");
      nextTurn(game);
      const owner = controller(game, hunt);
      expect(owner).not.toBe(A);
      owners.add(owner);
    }
    expect([...owners].sort()).toEqual([B, C, D].sort());
  });

  it("never passes to an opponent who has hexproof", () => {
    for (const seed of seeds(12)) {
      const { game } = table({ seed, players: 3 });
      const hunt = spawn(game, "Witch Hunt");
      spawn(game, "Leyline of Sanctity", B);
      nextTurn(game);
      expect(controller(game, hunt)).toBe(C);
    }
  });

  it("deals 4 to whoever controls it in their upkeep, and stops life gain", () => {
    const { game } = table();
    const hunt = spawn(game, "Witch Hunt");
    nextTurn(game);
    expect(controller(game, hunt)).toBe(B);
    expect(life(game, B)).toBe(16);
    expect(life(game, A)).toBe(20);
    spawn(game, "Soul Warden", A);
    game.debugSpawn("Grizzly Bears", A, "battlefield", { announceEntry: true });
    settle(game);
    expect(life(game, A)).toBe(20);
  });
});

describe("Knight Rampager", () => {
  it("deals 4 to an opponent at random as it dies", () => {
    const hit = new Set<PlayerId>();
    for (const seed of seeds(24)) {
      const { game } = table({ seed, players: 3 });
      const knight = spawn(game, "Knight Rampager");
      destroy(game, knight);
      settle(game);
      const lost = [B, C].filter((p) => life(game, p) === 16);
      expect(lost).toHaveLength(1);
      hit.add(lost[0]);
      expect(life(game, A)).toBe(20);
    }
    expect([...hit].sort()).toEqual([B, C].sort());
  });

  it("has to attack the opponent it chose at the beginning of combat", () => {
    const { game } = table({ players: 3 });
    const knight = spawn(game, "Knight Rampager", A, { sick: false });
    toStep(game, "declare-attackers", A);
    expect([B, C]).toContain(game.state.objects[knight].mustAttackPlayer);
  });
});

describe("Goblin Test Pilot", () => {
  it("offers no choice of target, and refuses one named", () => {
    const { game } = table();
    const pilot = spawn(game, "Goblin Test Pilot", A, { sick: false });
    const offer = game.legalActions(A).find((o) => o.kind === "activate-ability" && o.source === pilot);
    expect(offer?.kind === "activate-ability" && offer.targetOptions).toEqual([]);
    expect(() => activate(game, pilot, 0, { targets: [ref(B)] })).toThrow(/chosen at random/);
    expect(game.state.objects[pilot].tapped).toBeFalsy();
  });

  it("deals 2 to any legal target at random, itself and you included", () => {
    const hit = new Set<string>();
    for (const seed of seeds(40)) {
      const { game } = table({ seed });
      const pilot = spawn(game, "Goblin Test Pilot", A, { sick: false });
      activate(game, pilot, 0);
      if (life(game, A) === 18) hit.add("you");
      else if (life(game, B) === 18) hit.add("them");
      else {
        expect(zone(game, pilot)).toBe("graveyard");
        hit.add("itself");
      }
      if (zone(game, pilot) === "battlefield") expect(game.state.objects[pilot].tapped).toBe(true);
    }
    expect([...hit].sort()).toEqual(["itself", "them", "you"]);
  });
});

describe("Capricious Efreet", () => {
  /** Alice's upkeep with an Efreet out and what it targets. */
  function upkeep(seed: number): { game: Game; mine: ObjectId; bear: ObjectId; elves: ObjectId } {
    const { game, a } = table({ seed });
    const mine = spawn(game, "Savannah Lions");
    spawn(game, "Capricious Efreet");
    const bear = spawn(game, "Grizzly Bears", B);
    const elves = spawn(game, "Llanowar Elves", B);
    a.chooseTargetsFn = () => [ref(mine), ref(bear), ref(elves)];
    return { game, mine, bear, elves };
  }

  it("destroys exactly one of them at random, yours among them", () => {
    const hit = new Set<ObjectId>();
    for (const seed of seeds(24)) {
      const { game, mine, bear, elves } = upkeep(seed);
      game.advanceUntil((s) => s.turn.number === 3 && s.turn.step === "draw");
      settle(game);
      const dead = [mine, bear, elves].filter((id) => zone(game, id) === "graveyard");
      expect(dead).toHaveLength(1);
      hit.add(dead[0] === mine ? ("mine" as ObjectId) : dead[0] === bear ? ("bear" as ObjectId) : ("elves" as ObjectId));
    }
    expect(hit.size).toBe(3);
  });

  it("takes only your own when you target none of theirs", () => {
    const { game, a } = table();
    const mine = spawn(game, "Savannah Lions");
    spawn(game, "Capricious Efreet");
    const bear = spawn(game, "Grizzly Bears", B);
    a.chooseTargetsFn = () => [ref(mine), null, null];
    game.advanceUntil((s) => s.turn.number === 3 && s.turn.step === "draw");
    settle(game);
    expect(zone(game, mine)).toBe("graveyard");
    expect(zone(game, bear)).toBe("battlefield");
  });
});

describe("Power Pack", () => {
  it("exiles a random instant or sorcery, castable free next upkeep and exiled after", () => {
    const { game, a } = table();
    const pack = spawn(game, "Power Pack", A, { sick: false });
    const bolt = toGraveyard(game, "Lightning Bolt");
    toGraveyard(game, "Grizzly Bears");
    let offeredFree: boolean | undefined;
    a.chooseCastNowFn = (_view, offer) => {
      offeredFree = offer.free;
      return { type: "cast-spell", player: A, card: bolt, targets: [ref(B)], via: "effect", free: true };
    };
    attack(game, a, [pack], B);
    expect(life(game, B)).toBe(16);
    expect(zone(game, bolt)).toBe("exile");
    // Not until your next upkeep.
    expect(offeredFree).toBeUndefined();
    game.advanceUntil((s) => s.turn.number === 3 && s.turn.step === "draw");
    settle(game);
    expect(offeredFree).toBe(true);
    expect(life(game, B)).toBe(13);
    expect(zone(game, bolt)).toBe("exile");
  });

  it("picks between two cards by the seed, leaving the other", () => {
    const hit = new Set<string>();
    for (const seed of seeds(24)) {
      const { game, a } = table({ seed });
      const pack = spawn(game, "Power Pack", A, { sick: false });
      const bolt = toGraveyard(game, "Lightning Bolt");
      const shock = toGraveyard(game, "Shock");
      attack(game, a, [pack], B);
      const gone = [bolt, shock].filter((id) => zone(game, id) === "exile");
      expect(gone).toHaveLength(1);
      hit.add(gone[0] === bolt ? "bolt" : "shock");
    }
    expect(hit.size).toBe(2);
  });
});
