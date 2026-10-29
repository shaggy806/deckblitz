/**
 * Batch B250, damage-modification group D: prevention and redirection over
 * sources, recipients and durations (rules 614.9, 615), on the cards
 * themselves.
 */
import { describe, expect, it } from "vitest";

import type { Game } from "../game.js";
import type { ObjectId, PlayerId } from "../primitives.js";
import type { TargetRef } from "../target.js";
import type { ScriptedController } from "../controller.js";
import {
  A,
  B,
  activate,
  attack,
  cast,
  destroy,
  enter,
  keywords,
  lands,
  life,
  nextTurn,
  pickModes,
  pickTargets,
  ref,
  settle,
  spawn,
  table,
  toHand,
  tokensNamed,
  zone,
} from "./harness.js";

/** `source` deals `amount` noncombat damage to `to`. */
const hit = (game: Game, source: ObjectId, to: TargetRef, amount: number): void =>
  game.debugApplyEffect(game.state.objects[source].controller, { kind: "damage", amount, target: 0 }, [to], { source });
const damage = (game: Game, id: ObjectId): number => game.state.objects[id].damageMarked;
const attach = (game: Game, aura: ObjectId, to: ObjectId): void => {
  game.state.objects[aura].attachedTo = to;
};
/** Bob's turn: `attackers` attack alice, and alice has priority in the
 * declare blockers step (no blocks). */
const bobAttacks = (game: Game, b: ScriptedController, attackers: readonly ObjectId[], defender: PlayerId = A): void => {
  nextTurn(game);
  b.declareAttackersFn = () => attackers.map((attacker) => ({ attacker, defender }));
  game.advanceUntil((s) => s.turn.step === "declare-blockers" && s.priority.holder === A && s.awaiting === null);
};

describe("one-shot prevention over sources and recipients", () => {
  it("Galadhrim Ambush makes an Elf Warrior per attacker and stops only non-Elf combat damage", () => {
    const { game, b } = table();
    lands(game, "Forest", 4);
    const bears = spawn(game, "Grizzly Bears", B);
    const elves = spawn(game, "Llanowar Elves", B);
    bobAttacks(game, b, [bears, elves]);
    cast(game, toHand(game, "Galadhrim Ambush"));
    expect(tokensNamed(game, "Elf Warrior Token", A)).toBe(2);
    attack(game, b, [bears, elves], A);
    expect(life(game, A)).toBe(19);
  });

  it("Surge of Salvation stops black and red sources' damage to your creatures, not green", () => {
    const { game } = table();
    lands(game, "Plains", 1);
    const mine = spawn(game, "Grizzly Bears");
    const goblin = spawn(game, "Raging Goblin", B);
    const theirBears = spawn(game, "Grizzly Bears", B);
    cast(game, toHand(game, "Surge of Salvation"));
    expect(keywords(game, mine).has("hexproof")).toBe(true);
    hit(game, goblin, ref(mine), 1);
    expect(damage(game, mine)).toBe(0);
    hit(game, goblin, ref(A), 1);
    expect(life(game, A)).toBe(19);
    hit(game, theirBears, ref(mine), 1);
    expect(damage(game, mine)).toBe(1);
  });

  it("Druid's Deliverance stops combat damage to you and populates", () => {
    const { game, a, b } = table();
    lands(game, "Forest", 2);
    game.debugApplyEffect(A, { kind: "create-token", token: "Elf Warrior Token", count: 1 }, []);
    const bears = spawn(game, "Grizzly Bears", B);
    bobAttacks(game, b, [bears]);
    a.choosePermanentsFn = (_view, eligible) => eligible.slice(0, 1);
    cast(game, toHand(game, "Druid's Deliverance"));
    expect(tokensNamed(game, "Elf Warrior Token", A)).toBe(2);
    attack(game, b, [bears], A);
    expect(life(game, A)).toBe(20);
  });

  it("Ethereal Haze stops creatures' noncombat damage, not a land's", () => {
    const { game } = table();
    lands(game, "Plains", 1);
    const goblin = spawn(game, "Raging Goblin", B);
    const [mountain] = lands(game, "Mountain", 1, B);
    cast(game, toHand(game, "Ethereal Haze"));
    hit(game, goblin, ref(A), 1);
    expect(life(game, A)).toBe(20);
    hit(game, mountain, ref(A), 2);
    expect(life(game, A)).toBe(18);
  });

  it("Boros Fury-Shield deals the creature's power to its controller only if {R} was spent", () => {
    for (const [mountains, bobLife] of [
      [2, 18],
      [0, 20],
    ] as const) {
      const { game, b } = table();
      lands(game, "Plains", 3 - mountains);
      lands(game, "Mountain", mountains);
      const bears = spawn(game, "Grizzly Bears", B);
      bobAttacks(game, b, [bears]);
      cast(game, toHand(game, "Boros Fury-Shield"), { targets: [ref(bears)] });
      attack(game, b, [bears], A);
      expect(life(game, A)).toBe(20);
      expect(life(game, B)).toBe(bobLife);
    }
  });
});

describe("Avacyn, Guardian Angel", () => {
  it("prevents damage to another creature from sources of the colour chosen as it resolves", () => {
    const { game, a } = table();
    lands(game, "Plains", 2);
    const avacyn = spawn(game, "Avacyn, Guardian Angel");
    const bears = spawn(game, "Grizzly Bears");
    const goblin = spawn(game, "Raging Goblin", B);
    const theirBears = spawn(game, "Grizzly Bears", B);
    expect(() => activate(game, avacyn, 0, { targets: [ref(avacyn)] })).toThrow();
    pickModes(a, 3); // red
    activate(game, avacyn, 0, { targets: [ref(bears)] });
    hit(game, goblin, ref(bears), 1);
    expect(damage(game, bears)).toBe(0);
    hit(game, theirBears, ref(bears), 1);
    expect(damage(game, bears)).toBe(1);
  });
});

describe("redirection (rule 614.9)", () => {
  it("Protector of the Crown takes the damage dealt to you", () => {
    const { game } = table();
    const protector = spawn(game, "Protector of the Crown");
    const goblin = spawn(game, "Raging Goblin", B);
    hit(game, goblin, ref(A), 2);
    expect(life(game, A)).toBe(20);
    expect(damage(game, protector)).toBe(2);
  });

  it("Sivvi's Valor sends the target creature's damage to you", () => {
    const { game } = table();
    lands(game, "Plains", 3);
    const bears = spawn(game, "Grizzly Bears");
    const goblin = spawn(game, "Raging Goblin", B);
    cast(game, toHand(game, "Sivvi's Valor"), { targets: [ref(bears)] });
    hit(game, goblin, ref(bears), 2);
    expect(damage(game, bears)).toBe(0);
    expect(life(game, A)).toBe(18);
  });

  it("Shimian Night Stalker takes the target attacker's damage to you", () => {
    const { game, b } = table();
    lands(game, "Swamp", 1);
    const stalker = spawn(game, "Shimian Night Stalker");
    const bears = spawn(game, "Grizzly Bears", B);
    const goblin = spawn(game, "Raging Goblin", B);
    bobAttacks(game, b, [bears, goblin]);
    activate(game, stalker, 0, { targets: [ref(bears)] });
    attack(game, b, [bears, goblin], A);
    expect(damage(game, stalker)).toBe(2);
    expect(life(game, A)).toBe(19);
  });
});

describe("combat prevention by a target", () => {
  it("Gossamer Chains returns to hand to stop an unblocked creature's combat damage", () => {
    const { game, b } = table();
    const chains = spawn(game, "Gossamer Chains");
    const bears = spawn(game, "Grizzly Bears", B);
    bobAttacks(game, b, [bears]);
    activate(game, chains, 0, { targets: [ref(bears)] });
    expect(zone(game, chains)).toBe("hand");
    attack(game, b, [bears], A);
    expect(life(game, A)).toBe(20);
  });

  it("Maze of Ith untaps the attacker and stops its combat damage", () => {
    const { game, b } = table();
    const maze = spawn(game, "Maze of Ith");
    const bears = spawn(game, "Grizzly Bears", B);
    bobAttacks(game, b, [bears]);
    expect(game.state.objects[bears].tapped).toBe(true);
    activate(game, maze, 0, { targets: [ref(bears)] });
    expect(game.state.objects[bears].tapped).toBe(false);
    attack(game, b, [bears], A);
    expect(life(game, A)).toBe(20);
  });

  it("Falling Timber, kicked by sacrificing a land, stops two attackers' combat damage", () => {
    const { game, b } = table();
    const forests = lands(game, "Forest", 4);
    const bears = spawn(game, "Grizzly Bears", B);
    const goblin = spawn(game, "Raging Goblin", B);
    bobAttacks(game, b, [bears, goblin]);
    cast(game, toHand(game, "Falling Timber"), { kicked: true, targets: [ref(bears), ref(goblin)] });
    expect(forests.filter((id) => zone(game, id) === "graveyard")).toHaveLength(1);
    attack(game, b, [bears, goblin], A);
    expect(life(game, A)).toBe(20);
  });
});

describe("Auras naming their host", () => {
  it("Sandskin stops combat damage to and by the enchanted creature, not noncombat damage", () => {
    const { game, a, b } = table();
    const bears = spawn(game, "Grizzly Bears");
    const sandskin = spawn(game, "Sandskin");
    attach(game, sandskin, bears);
    const blocker = spawn(game, "Grizzly Bears", B);
    b.declareBlockersFn = () => [{ blocker, attacker: bears }];
    attack(game, a, [bears], B);
    expect(damage(game, bears)).toBe(0);
    expect(damage(game, blocker)).toBe(0);
    const goblin = spawn(game, "Raging Goblin", B);
    hit(game, goblin, ref(bears), 1);
    expect(damage(game, bears)).toBe(1);
  });

  it("Armament of Nyx: double strike on an enchantment creature, prevention on any other", () => {
    const { game } = table();
    const eidolon = spawn(game, "Eidolon of Blossoms", B);
    const bears = spawn(game, "Grizzly Bears", B);
    const one = spawn(game, "Armament of Nyx");
    const two = spawn(game, "Armament of Nyx");
    attach(game, one, eidolon);
    attach(game, two, bears);
    expect(keywords(game, eidolon).has("double-strike")).toBe(true);
    expect(keywords(game, bears).has("double-strike")).toBe(false);
    hit(game, bears, ref(A), 2);
    expect(life(game, A)).toBe(20);
    hit(game, eidolon, ref(A), 2);
    expect(life(game, A)).toBe(18);
  });
});

describe("damage that can't be prevented", () => {
  it("Unstable Footing, kicked, deals 5 through a prevention shield", () => {
    const { game } = table();
    lands(game, "Mountain", 5);
    game.debugApplyEffect(B, { kind: "prevent-damage", target: 0, amount: 5 }, [ref(B)]);
    cast(game, toHand(game, "Unstable Footing"), { kicked: true, targets: [ref(B)] });
    expect(life(game, B)).toBe(15);
    expect(game.state.damageUnpreventableThisTurn).toBe(true);
  });
});

describe("Old Fat Spider Can't See Me", () => {
  it("chapter I's hexproof and chapter II's prevention last while the Saga remains", () => {
    const { game, a } = table();
    const bears = spawn(game, "Grizzly Bears");
    const goblin = spawn(game, "Raging Goblin", B);
    pickTargets(a, bears);
    const saga = enter(game, "Old Fat Spider Can't See Me");
    expect(keywords(game, bears).has("hexproof")).toBe(true);
    pickTargets(a, goblin);
    nextTurn(game);
    nextTurn(game);
    settle(game);
    expect(keywords(game, bears).has("hexproof")).toBe(true);
    hit(game, goblin, ref(A), 1);
    expect(life(game, A)).toBe(20);
    destroy(game, saga);
    expect(keywords(game, bears).has("hexproof")).toBe(false);
    hit(game, goblin, ref(A), 1);
    expect(life(game, A)).toBe(19);
  });
});
