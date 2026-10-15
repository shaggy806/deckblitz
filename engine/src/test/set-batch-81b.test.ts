/**
 * Set walk batch 81, part b (2026-10-15): Edge of Eternities (EOE), the rest of the set.
 * Written on the shared table in `harness.ts`.
 */
import { describe, expect, it } from "vitest";

import type { Game } from "../game.js";
import type { ObjectId } from "../primitives.js";

import {
  A,
  B,
  activate,
  attack,
  cast,
  counters,
  destroy,
  enter,
  graveyard,
  hand,
  keywords,
  lands,
  life,
  named,
  pickFromZone,
  pickModes,
  pickTargets,
  pt,
  ref,
  settle,
  spawn,
  table,
  toGraveyard,
  toHand,
  toLibrary,
  toStep,
  tokensNamed,
  types,
  watchTargets,
  zone,
} from "./harness.js";

/** `id` is dealt `n` damage by one of bob's creatures, settled. */
function damage(game: Game, id: ObjectId, n: number): void {
  const source = spawn(game, "Grizzly Bears", B);
  game.debugApplyEffect(B, { kind: "damage", amount: n, target: 0 }, [ref(id)], { source });
  settle(game);
}

/** `id` becomes tapped by bob's effect, settled. */
function tap(game: Game, id: ObjectId): void {
  game.debugApplyEffect(B, { kind: "tap", target: 0 }, [ref(id)]);
  settle(game);
}

/** What alice may target in `card`'s first slot, cast from her hand now. */
function castTargets(game: Game, card: ObjectId): readonly string[] {
  const offer = game.legalActions(A).find((o) => o.kind === "cast-spell" && o.card === card);
  if (offer === undefined || offer.kind !== "cast-spell") throw new Error("not castable");
  return offer.targetOptions[0].map((t) => (t.kind === "object" ? t.object : t.player));
}

/** Alice stations `ship` by tapping `crew`, settled. */
function stationWith(game: Game, ship: ObjectId, crew: ObjectId): void {
  game.dispatch({ type: "activate-ability", player: A, source: ship, abilityIndex: 0, tap: [crew] });
  settle(game);
}

describe("Cryoshatter", () => {
  it("gives -5/-0, and destroys the creature when it becomes tapped", () => {
    const { game } = table();
    lands(game, "Island", 1);
    const giant = spawn(game, "Hill Giant", B);
    cast(game, toHand(game, "Cryoshatter"), { targets: [ref(giant)] });
    expect(pt(game, giant)).toEqual({ power: -2, toughness: 3 });
    expect(zone(game, giant)).toBe("battlefield");
    tap(game, giant);
    expect(zone(game, giant)).toBe("graveyard");
  });

  it("destroys the creature when it's dealt damage", () => {
    const { game } = table();
    lands(game, "Island", 1);
    const giant = spawn(game, "Hill Giant", B);
    cast(game, toHand(game, "Cryoshatter"), { targets: [ref(giant)] });
    damage(game, giant, 1);
    expect(zone(game, giant)).toBe("graveyard");
  });

  it("does nothing for a creature it doesn't enchant", () => {
    const { game } = table();
    lands(game, "Island", 1);
    const giant = spawn(game, "Hill Giant", B);
    const bears = spawn(game, "Grizzly Bears", B);
    cast(game, toHand(game, "Cryoshatter"), { targets: [ref(giant)] });
    tap(game, bears);
    damage(game, bears, 1);
    expect(zone(game, bears)).toBe("battlefield");
  });
});

describe("Systems Override", () => {
  it("steals, untaps and hastes a creature until end of turn, without counters", () => {
    const { game } = table();
    lands(game, "Mountain", 3);
    const giant = spawn(game, "Hill Giant", B, { tapped: true, sick: true });
    cast(game, toHand(game, "Systems Override"), { targets: [ref(giant)] });
    expect(game.state.objects[giant].controller).toBe(A);
    expect(game.state.objects[giant].tapped).toBe(false);
    expect(keywords(game, giant).has("haste")).toBe(true);
    expect(counters(game, giant, "charge")).toBe(0);
    toStep(game, "end");
    settle(game);
    expect(zone(game, giant)).toBe("battlefield");
  });

  it("puts ten charge counters on a Spacecraft, and removes ten at the next end step", () => {
    const { game } = table();
    lands(game, "Mountain", 3);
    const ship = spawn(game, "Susurian Dirgecraft", B);
    game.state.objects[ship].counters.charge = 2;
    expect(types(game, ship)).not.toContain("creature");
    cast(game, toHand(game, "Systems Override"), { targets: [ref(ship)] });
    expect(game.state.objects[ship].controller).toBe(A);
    expect(counters(game, ship, "charge")).toBe(12);
    expect(types(game, ship)).toContain("creature");
    expect(keywords(game, ship).has("flying")).toBe(true);
    expect(keywords(game, ship).has("haste")).toBe(true);
    toStep(game, "end");
    settle(game);
    expect(counters(game, ship, "charge")).toBe(2);
    expect(types(game, ship)).not.toContain("creature");
  });
});

describe("Rayblade Trooper", () => {
  it("puts a +1/+1 counter on target creature you control as it enters", () => {
    const { game, a } = table();
    lands(game, "Plains", 3);
    const bears = spawn(game, "Grizzly Bears");
    pickTargets(a, bears);
    cast(game, toHand(game, "Rayblade Trooper"));
    expect(counters(game, bears)).toBe(1);
  });

  it("makes a Human Soldier when a nontoken creature of yours with a +1/+1 counter dies", () => {
    const { game } = table();
    spawn(game, "Rayblade Trooper");
    const countered = spawn(game, "Grizzly Bears");
    game.state.objects[countered].counters["+1/+1"] = 1;
    const plain = spawn(game, "Grizzly Bears");
    const theirs = spawn(game, "Grizzly Bears", B);
    game.state.objects[theirs].counters["+1/+1"] = 1;
    destroy(game, plain);
    destroy(game, theirs);
    expect(tokensNamed(game, "Human Soldier Token", A)).toBe(0);
    destroy(game, countered);
    expect(tokensNamed(game, "Human Soldier Token", A)).toBe(1);
  });

  it("ignores a token with a counter, and sees itself die with one", () => {
    const { game } = table();
    const trooper = spawn(game, "Rayblade Trooper");
    game.debugApplyEffect(A, { kind: "create-token", token: "Human Soldier Token", count: 1 });
    settle(game);
    const [token] = named(game, "Human Soldier Token", A);
    game.state.objects[token].counters["+1/+1"] = 1;
    destroy(game, token);
    expect(tokensNamed(game, "Human Soldier Token", A)).toBe(0);
    game.state.objects[trooper].counters["+1/+1"] = 1;
    destroy(game, trooper);
    expect(tokensNamed(game, "Human Soldier Token", A)).toBe(1);
  });

  it("warps for {1}{W}, exiled at the next end step", () => {
    const { game, a } = table();
    lands(game, "Plains", 2);
    const bears = spawn(game, "Grizzly Bears");
    pickTargets(a, bears);
    const trooper = toHand(game, "Rayblade Trooper");
    cast(game, trooper, { via: "warp" });
    expect(zone(game, trooper)).toBe("battlefield");
    toStep(game, "end");
    settle(game);
    expect(zone(game, trooper)).toBe("exile");
  });
});

describe("Memorial Vault", () => {
  it("sacrifices another artifact to exile one plus its mana value, playable this turn", () => {
    const { game } = table();
    const vault = spawn(game, "Memorial Vault");
    const stone = spawn(game, "Mind Stone");
    const ring = spawn(game, "Sol Ring");
    const second = toLibrary(game, "Grizzly Bears");
    const first = toLibrary(game, "Lightning Bolt");
    const third = toLibrary(game, "Hill Giant");
    const exileBefore = game.state.zones.shared.exile.length;
    const offer = game.legalActions(A).find((o) => o.kind === "activate-ability" && o.source === vault);
    expect(offer?.kind === "activate-ability" ? [...(offer.sacrifice?.choices ?? [])].sort() : []).toEqual(
      [stone, ring].sort(),
    );
    game.dispatch({ type: "activate-ability", player: A, source: vault, abilityIndex: 0, sacrifice: stone });
    settle(game);
    expect(zone(game, stone)).toBe("graveyard");
    expect(zone(game, ring)).toBe("battlefield");
    expect(game.state.zones.shared.exile.length).toBe(exileBefore + 3);
    for (const id of [first, second, third]) {
      expect(zone(game, id)).toBe("exile");
      expect(game.state.objects[id].impulse).toBeDefined();
    }
  });
});

describe("Susurian Dirgecraft", () => {
  it("makes each opponent sacrifice a nontoken creature as it enters", () => {
    const { game } = table();
    const bears = spawn(game, "Grizzly Bears", B);
    game.debugApplyEffect(B, { kind: "create-token", token: "Human Soldier Token", count: 1 });
    settle(game);
    enter(game, "Susurian Dirgecraft");
    expect(zone(game, bears)).toBe("graveyard");
    expect(tokensNamed(game, "Human Soldier Token", B)).toBe(1);
  });

  it("is a 4/3 flying artifact creature at 7+ charge counters", () => {
    const { game } = table();
    const ship = spawn(game, "Susurian Dirgecraft");
    const giant = spawn(game, "Hill Giant");
    stationWith(game, ship, giant);
    expect(counters(game, ship, "charge")).toBe(3);
    expect(types(game, ship)).not.toContain("creature");
    game.state.objects[ship].counters.charge = 7;
    expect(types(game, ship)).toContain("creature");
    expect(pt(game, ship)).toEqual({ power: 4, toughness: 3 });
    expect(keywords(game, ship).has("flying")).toBe(true);
  });
});

describe("Lithobraking", () => {
  it("makes a Lander, then may sacrifice an artifact to deal 2 damage to each creature", () => {
    const { game, a } = table();
    lands(game, "Mountain", 3);
    const bears = spawn(game, "Grizzly Bears", B);
    const giant = spawn(game, "Hill Giant");
    const ring = spawn(game, "Sol Ring");
    let offered: readonly ObjectId[] = [];
    pickModes(a, 0);
    a.chooseSacrificesFn = (_view, eligible) => {
      offered = eligible;
      return eligible.filter((id) => game.state.objects[id].cardName === "Lander Token");
    };
    cast(game, toHand(game, "Lithobraking"));
    // The Lander it just made is among the artifacts it may sacrifice.
    expect(offered).toHaveLength(2);
    expect(offered).toContain(ring);
    expect(tokensNamed(game, "Lander Token", A)).toBe(0);
    expect(zone(game, ring)).toBe("battlefield");
    expect(zone(game, bears)).toBe("graveyard");
    expect(zone(game, giant)).toBe("battlefield");
    expect(game.state.objects[giant].damageMarked).toBe(2);
  });

  it("keeps the Lander and deals no damage when you don't sacrifice", () => {
    const { game, a } = table();
    lands(game, "Mountain", 3);
    const bears = spawn(game, "Grizzly Bears", B);
    pickModes(a);
    cast(game, toHand(game, "Lithobraking"));
    expect(tokensNamed(game, "Lander Token", A)).toBe(1);
    expect(zone(game, bears)).toBe("battlefield");
  });
});

describe("Rust Harvester", () => {
  it("exiles an artifact card from your graveyard to grow, then deals damage equal to its power", () => {
    const { game } = table();
    const harvester = spawn(game, "Rust Harvester");
    lands(game, "Wastes", 2);
    const ring = toGraveyard(game, "Sol Ring");
    toGraveyard(game, "Grizzly Bears");
    activate(game, harvester, 0, { targets: [ref(B)] });
    expect(zone(game, ring)).toBe("exile");
    expect(counters(game, harvester)).toBe(1);
    expect(life(game, B)).toBe(18);
  });

  it("can't be activated without an artifact card in your graveyard", () => {
    const { game } = table();
    const harvester = spawn(game, "Rust Harvester");
    lands(game, "Wastes", 2);
    toGraveyard(game, "Grizzly Bears");
    toGraveyard(game, "Sol Ring", B);
    expect(() => activate(game, harvester, 0, { targets: [ref(B)] })).toThrow();
  });
});

describe("Biomechan Engineer", () => {
  it("makes a Lander as it enters, and {8} draws two and makes a 2/2 Robot", () => {
    const { game } = table();
    const engineer = enter(game, "Biomechan Engineer");
    expect(tokensNamed(game, "Lander Token", A)).toBe(1);
    lands(game, "Wastes", 8);
    const before = hand(game).length;
    activate(game, engineer);
    expect(hand(game)).toHaveLength(before + 2);
    expect(tokensNamed(game, "Robot Token", A)).toBe(1);
  });
});

describe("Gravkill", () => {
  it("exiles a creature or a Spacecraft that isn't a creature, not another artifact", () => {
    const { game } = table();
    lands(game, "Swamp", 4);
    const ship = spawn(game, "Susurian Dirgecraft", B);
    const bears = spawn(game, "Grizzly Bears", B);
    const ring = spawn(game, "Sol Ring", B);
    const gravkill = toHand(game, "Gravkill");
    const offered = castTargets(game, gravkill);
    expect(offered).toContain(ship);
    expect(offered).toContain(bears);
    expect(offered).not.toContain(ring);
    cast(game, gravkill, { targets: [ref(ship)] });
    expect(zone(game, ship)).toBe("exile");
  });
});

describe("Terminal Velocity", () => {
  it("puts a creature from your hand onto the battlefield with haste; sacrificed at your end step, it deals its mana value to each creature", () => {
    const { game, a } = table();
    lands(game, "Mountain", 6);
    const giant = toHand(game, "Hill Giant");
    const ogre = spawn(game, "Gray Ogre", B);
    const seen = pickFromZone(a, giant);
    cast(game, toHand(game, "Terminal Velocity"));
    expect(seen.offered).toContain(giant);
    expect(zone(game, giant)).toBe("battlefield");
    expect(keywords(game, giant).has("haste")).toBe(true);
    toStep(game, "end");
    settle(game);
    expect(zone(game, giant)).toBe("graveyard");
    // Hill Giant's mana value is 4.
    expect(zone(game, ogre)).toBe("graveyard");
  });

  it("deals the damage however the permanent leaves, and keeps haste past the turn", () => {
    const { game, a } = table();
    lands(game, "Mountain", 6);
    const ring = toHand(game, "Sol Ring");
    const bears = spawn(game, "Grizzly Bears", B);
    const giant = spawn(game, "Hill Giant", B);
    pickFromZone(a, ring);
    cast(game, toHand(game, "Terminal Velocity"));
    expect(zone(game, ring)).toBe("battlefield");
    destroy(game, ring);
    // Sol Ring's mana value is 1.
    expect(game.state.objects[bears].damageMarked).toBe(1);
    expect(game.state.objects[giant].damageMarked).toBe(1);
  });

  it("puts nothing onto the battlefield when you choose nothing", () => {
    const { game, a } = table();
    lands(game, "Mountain", 6);
    const giant = toHand(game, "Hill Giant");
    pickFromZone(a);
    cast(game, toHand(game, "Terminal Velocity"));
    expect(zone(game, giant)).toBe("hand");
  });
});

describe("Knight Luminary", () => {
  it("makes a Human Soldier as it enters, and warps for {1}{W}", () => {
    const { game } = table();
    lands(game, "Plains", 2);
    const knight = toHand(game, "Knight Luminary");
    cast(game, knight, { via: "warp" });
    expect(tokensNamed(game, "Human Soldier Token", A)).toBe(1);
    toStep(game, "end");
    settle(game);
    expect(zone(game, knight)).toBe("exile");
  });
});

describe("Atomic Microsizer", () => {
  it("as the equipped creature attacks, makes up to one target creature unblockable with base 1/1", () => {
    const { game, a } = table();
    const microsizer = spawn(game, "Atomic Microsizer");
    const bears = spawn(game, "Grizzly Bears");
    const giant = spawn(game, "Hill Giant");
    game.state.objects[giant].counters["+1/+1"] = 1;
    lands(game, "Wastes", 2);
    activate(game, microsizer, 0, { targets: [ref(bears)] });
    expect(pt(game, bears)).toEqual({ power: 3, toughness: 2 });
    pickTargets(a, giant);
    a.declareAttackersFn = () => [
      { attacker: bears, defender: B },
      { attacker: giant, defender: B },
    ];
    game.advanceUntil((s) => s.turn.step === "declare-blockers");
    // Base 1/1 under the counter: 2/2.
    expect(pt(game, giant)).toEqual({ power: 2, toughness: 2 });
    expect(keywords(game, giant).has("unblockable")).toBe(true);
    expect(keywords(game, bears).has("unblockable")).toBe(false);
    toStep(game, "end");
    settle(game);
    expect(pt(game, giant)).toEqual({ power: 2, toughness: 2 });
    game.advanceUntil((s) => s.turn.number === 2);
    expect(pt(game, giant)).toEqual({ power: 4, toughness: 4 });
  });

  it("may target nothing", () => {
    const { game, a } = table();
    const microsizer = spawn(game, "Atomic Microsizer");
    const bears = spawn(game, "Grizzly Bears");
    lands(game, "Wastes", 2);
    activate(game, microsizer, 0, { targets: [ref(bears)] });
    pickTargets(a, null);
    attack(game, a, [bears]);
    expect(life(game, B)).toBe(17);
  });
});

describe("Edge Rover", () => {
  it("has each player create a Lander as it dies", () => {
    const { game } = table();
    const rover = spawn(game, "Edge Rover");
    expect(keywords(game, rover).has("reach")).toBe(true);
    destroy(game, rover);
    expect(tokensNamed(game, "Lander Token", A)).toBe(1);
    expect(tokensNamed(game, "Lander Token", B)).toBe(1);
  });
});

describe("Seam Rip", () => {
  it("exiles an opponent's nonland permanent with mana value 2 or less until it leaves", () => {
    const { game, a } = table();
    const ring = spawn(game, "Sol Ring", B);
    const thopter = spawn(game, "Ornithopter", B);
    const giant = spawn(game, "Hill Giant", B);
    const mine = spawn(game, "Grizzly Bears");
    const seen = watchTargets(a, () => [ring]);
    const rip = enter(game, "Seam Rip");
    expect([...seen.offered[0]].sort()).toEqual([ring, thopter].sort());
    expect(seen.offered[0]).not.toContain(giant);
    expect(seen.offered[0]).not.toContain(mine);
    expect(zone(game, ring)).toBe("exile");
    destroy(game, rip);
    expect(named(game, "Sol Ring", B)).toHaveLength(1);
  });
});

describe("Station Monitor", () => {
  it("makes a Drone on your second spell each turn, counting one cast before it arrived", () => {
    const { game } = table();
    cast(game, toHand(game, "Ornithopter"));
    spawn(game, "Station Monitor");
    expect(tokensNamed(game, "Drone Token", A)).toBe(0);
    cast(game, toHand(game, "Ornithopter"));
    expect(tokensNamed(game, "Drone Token", A)).toBe(1);
    cast(game, toHand(game, "Ornithopter"));
    expect(tokensNamed(game, "Drone Token", A)).toBe(1);
  });
});

describe("Dubious Delicacy", () => {
  it("gives up to one target creature -3/-3 as it enters", () => {
    const { game, a } = table();
    lands(game, "Swamp", 3);
    const bears = spawn(game, "Grizzly Bears", B);
    pickTargets(a, bears);
    cast(game, toHand(game, "Dubious Delicacy"));
    expect(zone(game, bears)).toBe("graveyard");
  });

  it("sacrifices for 3 life, or to make target opponent lose 3", () => {
    const { game } = table();
    const food = spawn(game, "Dubious Delicacy");
    lands(game, "Wastes", 2);
    activate(game, food, 1, { targets: [ref(B)] });
    expect(life(game, B)).toBe(17);
    expect(zone(game, food)).toBe("graveyard");
    const other = spawn(game, "Dubious Delicacy");
    lands(game, "Wastes", 2);
    activate(game, other, 0);
    expect(life(game, A)).toBe(23);
  });
});

describe("Shattered Wings", () => {
  it("destroys an artifact, an enchantment or a flier, then surveils 1", () => {
    const { game, a } = table();
    lands(game, "Forest", 3);
    const ring = spawn(game, "Sol Ring", B);
    const bears = spawn(game, "Grizzly Bears", B);
    const drake = spawn(game, "Wind Drake", B);
    const top = toLibrary(game, "Grizzly Bears");
    const wings = toHand(game, "Shattered Wings");
    const offered = castTargets(game, wings);
    expect(offered).toContain(ring);
    expect(offered).toContain(drake);
    expect(offered).not.toContain(bears);
    let surveilled: readonly ObjectId[] = [];
    a.chooseScryFn = (_view, cards) => {
      surveilled = cards;
      return [...cards];
    };
    cast(game, wings, { targets: [ref(drake)] });
    expect(zone(game, drake)).toBe("graveyard");
    expect(surveilled).toEqual([top]);
    expect(zone(game, top)).toBe("graveyard");
  });
});

describe("Terrapact Intimidator", () => {
  it("the target opponent may have you create two Landers", () => {
    const { game, b } = table();
    lands(game, "Mountain", 2);
    pickModes(b, 0);
    const kavu = toHand(game, "Terrapact Intimidator");
    cast(game, kavu);
    expect(tokensNamed(game, "Lander Token", A)).toBe(2);
    expect(tokensNamed(game, "Lander Token", B)).toBe(0);
    expect(counters(game, kavu)).toBe(0);
  });

  it("if they don't, it gets two +1/+1 counters", () => {
    const { game, b } = table();
    lands(game, "Mountain", 2);
    pickModes(b, 1);
    const kavu = toHand(game, "Terrapact Intimidator");
    cast(game, kavu);
    expect(tokensNamed(game, "Lander Token", A)).toBe(0);
    expect(counters(game, kavu)).toBe(2);
    expect(pt(game, kavu)).toEqual({ power: 4, toughness: 3 });
  });
});

describe("Oreplate Pangolin", () => {
  it("may pay {1} as another artifact of yours enters to get a +1/+1 counter", () => {
    const { game, a } = table();
    const pangolin = spawn(game, "Oreplate Pangolin");
    const [wastes] = lands(game, "Wastes", 1);
    pickModes(a, 0);
    enter(game, "Sol Ring");
    expect(counters(game, pangolin)).toBe(1);
    expect(game.state.objects[wastes].tapped).toBe(true);
    enter(game, "Sol Ring", B);
    enter(game, "Grizzly Bears");
    expect(counters(game, pangolin)).toBe(1);
  });

  it("gets nothing when you don't pay", () => {
    const { game, a } = table();
    const pangolin = spawn(game, "Oreplate Pangolin");
    lands(game, "Wastes", 1);
    pickModes(a);
    enter(game, "Sol Ring");
    expect(counters(game, pangolin)).toBe(0);
  });
});

describe("Swarm Culler", () => {
  it("as it becomes tapped, may sacrifice another creature or artifact to draw", () => {
    const { game, a } = table();
    const culler = spawn(game, "Swarm Culler");
    const thopter = spawn(game, "Ornithopter");
    let offered: readonly ObjectId[] = [];
    pickModes(a, 0);
    a.chooseSacrificesFn = (_view, eligible) => {
      offered = eligible;
      return [thopter];
    };
    const before = hand(game).length;
    attack(game, a, [culler]);
    expect(offered).not.toContain(culler);
    expect(zone(game, thopter)).toBe("graveyard");
    expect(hand(game)).toHaveLength(before + 1);
  });

  it("draws nothing when you don't", () => {
    const { game, a } = table();
    const culler = spawn(game, "Swarm Culler");
    const thopter = spawn(game, "Ornithopter");
    pickModes(a);
    const before = hand(game).length;
    tap(game, culler);
    expect(zone(game, thopter)).toBe("battlefield");
    expect(hand(game)).toHaveLength(before);
  });
});

describe("Kavaron Harrier", () => {
  it("may pay {2} as it attacks for a tapped, attacking 2/2 Robot, sacrificed at end of combat", () => {
    const { game, a } = table();
    const harrier = spawn(game, "Kavaron Harrier");
    lands(game, "Wastes", 2);
    pickModes(a, 0);
    a.declareAttackersFn = () => [{ attacker: harrier, defender: B }];
    game.advanceUntil((s) => s.turn.step === "declare-blockers");
    const [robot] = named(game, "Robot Token", A);
    expect(robot).toBeDefined();
    expect(game.state.objects[robot].tapped).toBe(true);
    expect(game.state.objects[robot].attacking).toBe(B);
    toStep(game, "postcombat-main");
    settle(game);
    expect(life(game, B)).toBe(16);
    expect(tokensNamed(game, "Robot Token", A)).toBe(0);
  });

  it("makes nothing when you don't pay", () => {
    const { game, a } = table();
    const harrier = spawn(game, "Kavaron Harrier");
    lands(game, "Wastes", 2);
    pickModes(a);
    attack(game, a, [harrier]);
    expect(life(game, B)).toBe(18);
    expect(tokensNamed(game, "Robot Token", A)).toBe(0);
  });
});

describe("Galvanizing Sawship", () => {
  it("is a 6/5 flying, hasty artifact creature at 3+ charge counters", () => {
    const { game } = table();
    const ship = spawn(game, "Galvanizing Sawship");
    const bears = spawn(game, "Grizzly Bears");
    stationWith(game, ship, bears);
    expect(counters(game, ship, "charge")).toBe(2);
    expect(types(game, ship)).not.toContain("creature");
    const giant = spawn(game, "Hill Giant");
    stationWith(game, ship, giant);
    expect(counters(game, ship, "charge")).toBe(5);
    expect(types(game, ship)).toContain("creature");
    expect(pt(game, ship)).toEqual({ power: 6, toughness: 5 });
    expect(keywords(game, ship).has("flying")).toBe(true);
    expect(keywords(game, ship).has("haste")).toBe(true);
  });
});

describe("Germinating Wurm", () => {
  it("gains 2 life as it enters, cast for warp, and is exiled at the end step", () => {
    const { game } = table();
    lands(game, "Forest", 2);
    const wurm = toHand(game, "Germinating Wurm");
    cast(game, wurm, { via: "warp" });
    expect(life(game, A)).toBe(22);
    toStep(game, "end");
    settle(game);
    expect(zone(game, wurm)).toBe("exile");
    expect(graveyard(game)).not.toContain(wurm);
  });
});
