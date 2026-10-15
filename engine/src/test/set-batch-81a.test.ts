/**
 * Set walk batch 81, part a (2026-10-15): Edge of Eternities (EOE), the rest of the set.
 * Written on the shared table in `harness.ts`.
 */
import { describe, expect, it } from "vitest";

import type { ScriptedController } from "../controller.js";
import type { Game } from "../game.js";
import type { ObjectId } from "../primitives.js";

import {
  A,
  B,
  C,
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
  pickFromZone,
  pickTargets,
  pt,
  quiet,
  ref,
  settle,
  spawn,
  table,
  toHand,
  toLibrary,
  toStep,
  tokensNamed,
  types,
  watchTargets,
  zone,
} from "./harness.js";

/** `attackers` (alice's) attack bob, `blocks` declared by bob; the game runs
 * to the declare-blockers step with alice's priority. */
function intoBlocks(
  game: Game,
  a: ScriptedController,
  b: ScriptedController,
  attackers: readonly ObjectId[],
  blocks: readonly { blocker: ObjectId; attacker: ObjectId }[] = [],
): void {
  a.declareAttackersFn = () => attackers.map((attacker) => ({ attacker, defender: B }));
  b.declareBlockersFn = () => [...blocks];
  game.advanceUntil((s) => s.turn.step === "declare-blockers" && quiet(s) && s.priority.holder === A);
}

/** Give a Spacecraft `n` charge counters. */
function charge(game: Game, id: ObjectId, n: number): void {
  game.state.objects[id].counters.charge = n;
}

const library = (game: Game, player = A): number => game.state.zones.perPlayer[player].library.length;

describe("Perigee Beckoner", () => {
  it("pumps another creature you control, which comes back tapped when it dies this turn", () => {
    const { game } = table();
    const bears = spawn(game, "Grizzly Bears");
    const beckoner = enter(game, "Perigee Beckoner");
    expect(pt(game, bears)).toEqual({ power: 4, toughness: 2 });
    expect(pt(game, beckoner)).toEqual({ power: 4, toughness: 5 });
    destroy(game, bears);
    const back = game.battlefield.find((id) => game.state.objects[id].cardName === "Grizzly Bears");
    expect(back).toBeDefined();
    expect(game.state.objects[back!].tapped).toBe(true);
    expect(game.state.objects[back!].controller).toBe(A);
  });

  it("can be cast for its warp cost", () => {
    const { game } = table();
    lands(game, "Swamp", 2);
    const card = toHand(game, "Perigee Beckoner");
    cast(game, card, { via: "warp" });
    expect(zone(game, card)).toBe("battlefield");
  });
});

describe("Fell Gravship", () => {
  it("mills three, then returns a creature or Spacecraft card from the graveyard to hand", () => {
    const { game, a } = table();
    toLibrary(game, "Wastes");
    const bears = toLibrary(game, "Grizzly Bears");
    toLibrary(game, "Wastes");
    const seen = pickFromZone(a, bears);
    enter(game, "Fell Gravship");
    expect(seen.offered).toEqual([bears]);
    expect(zone(game, bears)).toBe("hand");
    expect(graveyard(game)).toHaveLength(2);
  });

  it("offers a Spacecraft card already in the graveyard, and with none returns nothing", () => {
    const { game, a } = table();
    const ship = game.debugSpawn("Uthros Scanship", A, "graveyard");
    const seen = pickFromZone(a, ship);
    enter(game, "Fell Gravship");
    expect(seen.offered).toEqual([ship]);
    expect(zone(game, ship)).toBe("hand");

    pickFromZone(a);
    const before = hand(game).length;
    enter(game, "Fell Gravship");
    expect(hand(game)).toHaveLength(before);
    expect(graveyard(game)).toHaveLength(6);
  });

  it("is a 3/2 flier with lifelink at 8 charge counters", () => {
    const { game } = table();
    const ship = spawn(game, "Fell Gravship");
    charge(game, ship, 7);
    expect(types(game, ship)).not.toContain("creature");
    charge(game, ship, 8);
    expect(types(game, ship)).toContain("creature");
    expect(pt(game, ship)).toEqual({ power: 3, toughness: 2 });
    expect(keywords(game, ship).has("flying")).toBe(true);
    expect(keywords(game, ship).has("lifelink")).toBe(true);
  });
});

describe("Desculpting Blast", () => {
  it("bounces an attacking creature and makes a Drone", () => {
    const { game, a, b } = table();
    const bears = spawn(game, "Grizzly Bears");
    lands(game, "Island", 2);
    intoBlocks(game, a, b, [bears]);
    cast(game, toHand(game, "Desculpting Blast"), { targets: [ref(bears)] });
    expect(zone(game, bears)).toBe("hand");
    expect(tokensNamed(game, "Drone Token", A)).toBe(1);
  });

  it("makes no Drone for a permanent that wasn't attacking", () => {
    const { game } = table();
    const ring = spawn(game, "Sol Ring", B);
    lands(game, "Island", 2);
    cast(game, toHand(game, "Desculpting Blast"), { targets: [ref(ring)] });
    expect(zone(game, ring)).toBe("hand");
    expect(tokensNamed(game, "Drone Token")).toBe(0);
  });
});

describe("Illvoi Light Jammer", () => {
  it("attaches itself as it enters and gives hexproof until end of turn", () => {
    const { game } = table();
    const bears = spawn(game, "Grizzly Bears");
    const jammer = enter(game, "Illvoi Light Jammer");
    expect(game.state.objects[jammer].attachedTo).toBe(bears);
    expect(pt(game, bears)).toEqual({ power: 3, toughness: 4 });
    expect(keywords(game, bears).has("hexproof")).toBe(true);
    toStep(game, "upkeep", B);
    expect(keywords(game, bears).has("hexproof")).toBe(false);
    expect(pt(game, bears)).toEqual({ power: 3, toughness: 4 });
  });
});

describe("Cerebral Download", () => {
  it("surveils once per artifact you control, then draws three", () => {
    const { game, a } = table();
    spawn(game, "Sol Ring");
    spawn(game, "Mind Stone");
    spawn(game, "Sol Ring", B);
    lands(game, "Island", 5);
    let looked = 0;
    a.chooseScryFn = (_view, cards) => {
      looked = cards.length;
      return [...cards];
    };
    const before = hand(game).length;
    cast(game, toHand(game, "Cerebral Download"));
    expect(looked).toBe(2);
    expect(hand(game)).toHaveLength(before + 3);
    expect(graveyard(game).filter((id) => game.state.objects[id].cardName === "Wastes")).toHaveLength(2);
  });
});

describe("Dawnstrike Vanguard", () => {
  it("puts a counter on each other creature you control with two tapped creatures", () => {
    const { game } = table();
    const vanguard = spawn(game, "Dawnstrike Vanguard");
    const one = spawn(game, "Grizzly Bears", A, { tapped: true });
    const two = spawn(game, "Grizzly Bears", A, { tapped: true });
    const theirs = spawn(game, "Grizzly Bears", B);
    toStep(game, "cleanup");
    expect(counters(game, one)).toBe(1);
    expect(counters(game, two)).toBe(1);
    expect(counters(game, vanguard)).toBe(0);
    expect(counters(game, theirs)).toBe(0);
  });

  it("doesn't trigger with only one tapped creature", () => {
    const { game } = table();
    spawn(game, "Dawnstrike Vanguard", A, { tapped: true });
    const bears = spawn(game, "Grizzly Bears");
    toStep(game, "cleanup");
    expect(counters(game, bears)).toBe(0);
  });
});

describe("Luxknight Breacher", () => {
  it("enters with a counter for each other creature and/or artifact you control", () => {
    const { game } = table();
    spawn(game, "Grizzly Bears");
    spawn(game, "Sol Ring");
    spawn(game, "Ornithopter");
    spawn(game, "Grizzly Bears", B);
    lands(game, "Plains", 4);
    const knight = toHand(game, "Luxknight Breacher");
    cast(game, knight);
    expect(counters(game, knight)).toBe(3);
    expect(pt(game, knight)).toEqual({ power: 5, toughness: 5 });
  });
});

describe("Unravel", () => {
  it("counters a spell, drawing a card when less mana than its mana value was spent", () => {
    const { game } = table();
    lands(game, "Swamp", 2);
    lands(game, "Island", 3);
    const beckoner = toHand(game, "Perigee Beckoner");
    cast(game, beckoner, { via: "warp", settle: false });
    const before = hand(game).length;
    cast(game, toHand(game, "Unravel"), { targets: [ref(beckoner)] });
    expect(zone(game, beckoner)).toBe("graveyard");
    expect(hand(game)).toHaveLength(before + 1);
  });

  it("draws nothing when the spell was cast for its full mana value", () => {
    const { game } = table();
    lands(game, "Forest", 2);
    lands(game, "Island", 3);
    const bears = toHand(game, "Grizzly Bears");
    cast(game, bears, { settle: false });
    const before = hand(game).length;
    cast(game, toHand(game, "Unravel"), { targets: [ref(bears)] });
    expect(zone(game, bears)).toBe("graveyard");
    expect(hand(game)).toHaveLength(before);
  });
});

describe("Ruinous Rampage", () => {
  it("deals 3 damage to each opponent", () => {
    const { game } = table({ players: 3 });
    lands(game, "Mountain", 3);
    cast(game, toHand(game, "Ruinous Rampage"), { modes: [0] });
    expect(life(game, B)).toBe(17);
    expect(life(game, C)).toBe(17);
    expect(life(game, A)).toBe(20);
  });

  it("exiles every artifact with mana value 3 or less", () => {
    const { game } = table();
    lands(game, "Mountain", 3);
    const ring = spawn(game, "Sol Ring", B);
    const stone = spawn(game, "Mind Stone");
    const dynamo = spawn(game, "Thran Dynamo", B);
    cast(game, toHand(game, "Ruinous Rampage"), { modes: [1] });
    expect(zone(game, ring)).toBe("exile");
    expect(zone(game, stone)).toBe("exile");
    expect(zone(game, dynamo)).toBe("battlefield");
  });
});

describe("Orbital Plunge", () => {
  /** A Craw Wurm of bob's made 6/6, so 6 damage is exactly lethal. */
  function sixBySix(game: Game): ObjectId {
    const wurm = spawn(game, "Craw Wurm", B);
    game.debugApplyEffect(B, { kind: "modify-pt", target: 0, power: 0, toughness: 2, duration: "end-of-turn" }, [
      ref(wurm),
    ]);
    return wurm;
  }

  it("makes a Lander when the 6 damage is more than lethal", () => {
    const { game } = table();
    lands(game, "Mountain", 4);
    const bears = spawn(game, "Grizzly Bears", B);
    cast(game, toHand(game, "Orbital Plunge"), { targets: [ref(bears)] });
    expect(zone(game, bears)).toBe("graveyard");
    expect(tokensNamed(game, "Lander Token", A)).toBe(1);
  });

  it("makes none when the damage is exactly lethal", () => {
    const { game } = table();
    lands(game, "Mountain", 4);
    const wurm = sixBySix(game);
    cast(game, toHand(game, "Orbital Plunge"), { targets: [ref(wurm)] });
    expect(zone(game, wurm)).toBe("graveyard");
    expect(tokensNamed(game, "Lander Token")).toBe(0);
  });

  it("counts damage already marked toward lethal", () => {
    const { game } = table();
    lands(game, "Mountain", 4);
    const wurm = sixBySix(game);
    const source = spawn(game, "Grizzly Bears");
    game.debugApplyEffect(A, { kind: "damage", amount: 1, target: 0 }, [ref(wurm)], { source });
    cast(game, toHand(game, "Orbital Plunge"), { targets: [ref(wurm)] });
    expect(tokensNamed(game, "Lander Token", A)).toBe(1);
  });
});

describe("Uthros Scanship", () => {
  it("draws two and discards one as it enters, and flies at 8", () => {
    const { game } = table();
    const before = hand(game).length;
    const ship = enter(game, "Uthros Scanship");
    expect(hand(game)).toHaveLength(before + 1);
    expect(graveyard(game)).toHaveLength(1);
    charge(game, ship, 8);
    expect(types(game, ship)).toContain("creature");
    expect(pt(game, ship)).toEqual({ power: 4, toughness: 4 });
    expect(keywords(game, ship).has("flying")).toBe(true);
  });
});

describe("Sunstar Lightsmith", () => {
  it("grows and draws on your second spell each turn, not the first or third", () => {
    const { game } = table();
    const smith = spawn(game, "Sunstar Lightsmith");
    const before = hand(game).length;
    cast(game, toHand(game, "Ornithopter"));
    expect(counters(game, smith)).toBe(0);
    cast(game, toHand(game, "Ornithopter"));
    expect(counters(game, smith)).toBe(1);
    expect(hand(game)).toHaveLength(before + 1);
    cast(game, toHand(game, "Ornithopter"));
    expect(counters(game, smith)).toBe(1);
    expect(hand(game)).toHaveLength(before + 1);
  });
});

describe("Mechan Navigator", () => {
  it("loots whenever it becomes tapped", () => {
    const { game, a } = table();
    const navigator = spawn(game, "Mechan Navigator");
    const before = hand(game).length;
    attack(game, a, [navigator]);
    expect(hand(game)).toHaveLength(before);
    expect(graveyard(game)).toHaveLength(1);
  });
});

describe("Specimen Freighter", () => {
  it("returns up to two non-Spacecraft creatures as it enters", () => {
    const { game, a } = table();
    const bears = spawn(game, "Grizzly Bears", B);
    const giant = spawn(game, "Craw Wurm", B);
    const ship = spawn(game, "Uthros Scanship", B);
    charge(game, ship, 8);
    const seen = watchTargets(a, () => [bears, giant]);
    enter(game, "Specimen Freighter");
    expect(seen.offered[0]).toContain(bears);
    expect(seen.offered[0]).not.toContain(ship);
    expect(zone(game, bears)).toBe("hand");
    expect(zone(game, giant)).toBe("hand");
    expect(zone(game, ship)).toBe("battlefield");
  });

  it("is a flier at 9 whose attack mills the defending player four", () => {
    const { game, a } = table();
    const freighter = spawn(game, "Specimen Freighter");
    charge(game, freighter, 9);
    expect(pt(game, freighter)).toEqual({ power: 4, toughness: 7 });
    expect(keywords(game, freighter).has("flying")).toBe(true);
    const before = library(game, B);
    attack(game, a, [freighter]);
    expect(library(game, B)).toBe(before - 4);
    expect(life(game, B)).toBe(16);
  });
});

describe("Dockworker Drone", () => {
  it("enters with a +1/+1 counter and passes its counters on as it dies", () => {
    const { game } = table();
    lands(game, "Plains", 2);
    const bears = spawn(game, "Grizzly Bears");
    const drone = toHand(game, "Dockworker Drone");
    cast(game, drone);
    expect(counters(game, drone)).toBe(1);
    game.state.objects[drone].counters["+1/+1"] = 2;
    destroy(game, drone);
    expect(counters(game, bears)).toBe(2);
  });

  it("passes on -1/-1 counters that killed it along with its +1/+1 counter", () => {
    const { game } = table();
    const giant = spawn(game, "Craw Wurm");
    const drone = enter(game, "Dockworker Drone");
    expect(counters(game, drone)).toBe(1);
    game.debugApplyEffect(B, { kind: "add-counter", target: 0, counter: "-1/-1", amount: 2 }, [ref(drone)]);
    // State-based actions are checked as a player next gets priority.
    toStep(game, "begin-combat");
    settle(game);
    expect(zone(game, drone)).toBe("graveyard");
    // One +1/+1 and two -1/-1 are put on the Wurm; the pair cancels (rule 704.5q).
    expect(counters(game, giant)).toBe(0);
    expect(counters(game, giant, "-1/-1")).toBe(1);
    expect(pt(game, giant)).toEqual({ power: 5, toughness: 3 });
  });
});

describe("Dark Endurance", () => {
  it("costs {1} less on a blocking creature", () => {
    const { game, a, b } = table();
    const bears = spawn(game, "Grizzly Bears");
    const blocker = spawn(game, "Grizzly Bears", B);
    lands(game, "Swamp", 1);
    intoBlocks(game, a, b, [bears], [{ blocker, attacker: bears }]);
    const spell = toHand(game, "Dark Endurance");
    expect(() => cast(game, spell, { targets: [ref(bears)] })).toThrow();
    cast(game, spell, { targets: [ref(blocker)] });
    expect(pt(game, blocker)).toEqual({ power: 4, toughness: 2 });
    expect(keywords(game, blocker).has("indestructible")).toBe(true);
  });

  it("pumps and protects any creature at full cost", () => {
    const { game } = table();
    const bears = spawn(game, "Grizzly Bears");
    lands(game, "Swamp", 2);
    cast(game, toHand(game, "Dark Endurance"), { targets: [ref(bears)] });
    expect(pt(game, bears)).toEqual({ power: 4, toughness: 2 });
    destroy(game, bears);
    expect(zone(game, bears)).toBe("battlefield");
  });
});

describe("Blooming Stinger", () => {
  it("gives another creature you control deathtouch until end of turn", () => {
    const { game } = table();
    const bears = spawn(game, "Grizzly Bears");
    const stinger = enter(game, "Blooming Stinger");
    expect(keywords(game, bears).has("deathtouch")).toBe(true);
    expect(keywords(game, stinger).has("deathtouch")).toBe(true);
    toStep(game, "upkeep", B);
    expect(keywords(game, bears).has("deathtouch")).toBe(false);
  });
});

describe("Genemorph Imago", () => {
  it("makes a creature's base power and toughness 3/3 on landfall", () => {
    const { game, a } = table();
    spawn(game, "Genemorph Imago");
    const bears = spawn(game, "Grizzly Bears", B);
    game.state.objects[bears].counters["+1/+1"] = 1;
    pickTargets(a, bears);
    enter(game, "Forest");
    expect(pt(game, bears)).toEqual({ power: 4, toughness: 4 });
  });

  it("makes it 6/6 instead with six or more lands", () => {
    const { game, a } = table();
    spawn(game, "Genemorph Imago");
    lands(game, "Island", 5);
    const bears = spawn(game, "Grizzly Bears");
    pickTargets(a, bears);
    enter(game, "Forest");
    expect(pt(game, bears)).toEqual({ power: 6, toughness: 6 });
    toStep(game, "upkeep", B);
    expect(pt(game, bears)).toEqual({ power: 2, toughness: 2 });
  });
});

describe("Full Bore", () => {
  it("gives trample and haste too to a creature cast for its warp cost", () => {
    const { game } = table();
    lands(game, "Swamp", 2);
    lands(game, "Mountain", 1);
    const beckoner = toHand(game, "Perigee Beckoner");
    cast(game, beckoner, { via: "warp" });
    cast(game, toHand(game, "Full Bore"), { targets: [ref(beckoner)] });
    expect(pt(game, beckoner)).toEqual({ power: 7, toughness: 7 });
    expect(keywords(game, beckoner).has("trample")).toBe(true);
    expect(keywords(game, beckoner).has("haste")).toBe(true);
  });

  it("only pumps a creature cast normally", () => {
    const { game } = table();
    lands(game, "Forest", 2);
    lands(game, "Mountain", 1);
    const bears = toHand(game, "Grizzly Bears");
    cast(game, bears);
    cast(game, toHand(game, "Full Bore"), { targets: [ref(bears)] });
    expect(pt(game, bears)).toEqual({ power: 5, toughness: 4 });
    expect(keywords(game, bears).has("trample")).toBe(false);
    expect(keywords(game, bears).has("haste")).toBe(false);
  });
});

describe("Mechanozoa", () => {
  it("taps and stuns an opponent's artifact or creature", () => {
    const { game, a } = table();
    const ring = spawn(game, "Sol Ring", B);
    const bears = spawn(game, "Grizzly Bears", B);
    const mine = spawn(game, "Grizzly Bears");
    const seen = watchTargets(a, () => [ring]);
    enter(game, "Mechanozoa");
    expect(seen.offered[0]).toEqual(expect.arrayContaining([ring, bears]));
    expect(seen.offered[0]).not.toContain(mine);
    expect(game.state.objects[ring].tapped).toBe(true);
    expect(counters(game, ring, "stun")).toBe(1);
  });

  it("can be cast for its warp cost", () => {
    const { game } = table();
    lands(game, "Island", 3);
    const card = toHand(game, "Mechanozoa");
    cast(game, card, { via: "warp" });
    expect(zone(game, card)).toBe("battlefield");
  });
});

describe("Focus Fire", () => {
  it("deals 2 plus your creatures and/or Spacecraft, each counted once", () => {
    const { game, a, b } = table();
    const wurm = spawn(game, "Craw Wurm");
    const stationed = spawn(game, "Uthros Scanship");
    charge(game, stationed, 8);
    spawn(game, "Wedgelight Rammer");
    const wall = spawn(game, "Wall of Stone", B);
    spawn(game, "Grizzly Bears", B);
    lands(game, "Plains", 1);
    intoBlocks(game, a, b, [wurm], [{ blocker: wall, attacker: wurm }]);
    cast(game, toHand(game, "Focus Fire"), { targets: [ref(wall)] });
    expect(game.state.objects[wall].damageMarked).toBe(5);
  });
});

describe("Wedgelight Rammer", () => {
  it("makes a 2/2 Robot as it enters, and is a first-striking flier at 9", () => {
    const { game } = table();
    const ship = enter(game, "Wedgelight Rammer");
    expect(tokensNamed(game, "Robot Token", A)).toBe(1);
    charge(game, ship, 8);
    expect(types(game, ship)).not.toContain("creature");
    charge(game, ship, 9);
    expect(pt(game, ship)).toEqual({ power: 3, toughness: 4 });
    expect(keywords(game, ship).has("flying")).toBe(true);
    expect(keywords(game, ship).has("first-strike")).toBe(true);
  });
});

describe("Harmonious Grovestrider", () => {
  it("is as big as the lands you control, and has ward {2}", () => {
    const { game } = table();
    const strider = spawn(game, "Harmonious Grovestrider");
    lands(game, "Forest", 4);
    lands(game, "Forest", 2, B);
    expect(pt(game, strider)).toEqual({ power: 4, toughness: 4 });
    const card = toHand(game, "Harmonious Grovestrider");
    expect(pt(game, card)).toEqual({ power: 4, toughness: 4 });
    expect(game.registry.get("Harmonious Grovestrider").triggered.some((t) => t.effect?.kind === "ward")).toBe(true);
  });
});
