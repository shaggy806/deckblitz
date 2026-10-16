/**
 * Set walk batch 87, part e (2026-10-15): Modern Horizons 3 (MH3) and Modern Horizons 3 Commander (M3C), the rest of the sets.
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
  hand,
  graveyard,
  keywords,
  lands,
  life,
  named,
  pickModes,
  pickTargets,
  pt,
  ref,
  settle,
  spawn,
  table,
  toHand,
  tokensNamed,
  watchTargets,
  zone,
} from "./harness.js";

const energy = (game: Game, player = A): number => game.state.players[player].energy ?? 0;
const damageOn = (game: Game, id: ObjectId): number => game.state.objects[id].damageMarked ?? 0;
/** Alice plays a Mountain from her hand, its landfall triggers resolved. */
function playLand(game: Game): void {
  game.dispatch({ type: "play-land", player: A, card: toHand(game, "Mountain") });
  settle(game);
}
const activateOffers = (game: Game, source: ObjectId) =>
  game.legalActions(A).filter((a) => a.kind === "activate-ability" && a.source === source);

describe("Fetid Gargantua", () => {
  it("adapts, and the counters let you draw two and lose 2 life", () => {
    const { game, a } = table();
    const garg = spawn(game, "Fetid Gargantua");
    lands(game, "Swamp", 6);
    const before = hand(game).length;
    pickModes(a, 0);
    activate(game, garg);
    expect(counters(game, garg)).toBe(2);
    expect(hand(game).length).toBe(before + 2);
    expect(life(game, A)).toBe(18);
    // With counters on it, adapting again puts none, so nothing triggers.
    activate(game, garg);
    expect(counters(game, garg)).toBe(2);
    expect(hand(game).length).toBe(before + 2);
    expect(life(game, A)).toBe(18);
  });

  it("declining the draw loses no life", () => {
    const { game, a } = table();
    const garg = spawn(game, "Fetid Gargantua");
    lands(game, "Swamp", 3);
    const before = hand(game).length;
    pickModes(a);
    activate(game, garg);
    expect(counters(game, garg)).toBe(2);
    expect(hand(game).length).toBe(before);
    expect(life(game, A)).toBe(20);
  });
});

describe("Mogg Mob", () => {
  it("sacrifices itself to divide 3 damage among three targets", () => {
    const { game } = table();
    const mob = spawn(game, "Mogg Mob");
    const bear1 = spawn(game, "Grizzly Bears", B);
    const giant = spawn(game, "Hill Giant", B);
    game.dispatch({
      type: "activate-ability",
      player: A,
      source: mob,
      abilityIndex: 0,
      targets: [ref(bear1), ref(giant), ref(B)],
      division: [1, 1, 1],
    });
    settle(game);
    expect(zone(game, mob)).toBe("graveyard");
    expect(damageOn(game, bear1)).toBe(1);
    expect(damageOn(game, giant)).toBe(1);
    expect(life(game, B)).toBe(19);
  });

  it("can put all 3 on one target", () => {
    const { game } = table();
    const mob = spawn(game, "Mogg Mob");
    const giant = spawn(game, "Hill Giant", B);
    game.dispatch({
      type: "activate-ability",
      player: A,
      source: mob,
      abilityIndex: 0,
      targets: [ref(giant)],
      division: [3],
    });
    settle(game);
    expect(zone(game, giant)).toBe("graveyard");
  });
});

describe("Inventor's Axe", () => {
  it("enters for two energy, attaches itself, and equips for {E}{E}", () => {
    const { game, a } = table();
    const bear = spawn(game, "Grizzly Bears");
    const other = spawn(game, "Hill Giant");
    spawn(game, "Mountain");
    pickTargets(a, bear);
    const axe = toHand(game, "Inventor's Axe");
    cast(game, axe);
    expect(energy(game)).toBe(2);
    expect(game.state.objects[axe].attachedTo).toBe(bear);
    expect(pt(game, bear)).toEqual({ power: 4, toughness: 2 });
    activate(game, axe, 0, { targets: [ref(other)] });
    expect(energy(game)).toBe(0);
    expect(game.state.objects[axe].attachedTo).toBe(other);
    expect(pt(game, other)).toEqual({ power: 5, toughness: 3 });
    expect(pt(game, bear)).toEqual({ power: 2, toughness: 2 });
    // No energy left: equip can't be paid.
    expect(activateOffers(game, axe)).toEqual([]);
  });

  it("has flash", () => {
    const { game } = table();
    spawn(game, "Mountain");
    game.advanceUntil((s) => s.turn.number === 2 && s.turn.step === "upkeep" && s.priority.holder === A);
    const axe = toHand(game, "Inventor's Axe");
    cast(game, axe);
    expect(zone(game, axe)).toBe("battlefield");
    expect(energy(game)).toBe(2);
  });
});

describe("Tempest Harvester", () => {
  it("enters for two energy and loots for {T} and one energy", () => {
    const { game } = table();
    const harvester = enter(game, "Tempest Harvester");
    expect(energy(game)).toBe(2);
    const handBefore = hand(game).length;
    const yardBefore = graveyard(game).length;
    activate(game, harvester);
    expect(energy(game)).toBe(1);
    expect(hand(game).length).toBe(handBefore);
    expect(graveyard(game).length).toBe(yardBefore + 1);
    expect(game.state.objects[harvester].tapped).toBe(true);
  });

  it("can't loot without energy", () => {
    const { game } = table();
    const harvester = spawn(game, "Tempest Harvester");
    expect(energy(game)).toBe(0);
    expect(activateOffers(game, harvester)).toEqual([]);
  });
});

describe("Cyclops Superconductor", () => {
  it("dies, pays {E}{E}{E}, and deals damage equal to its last power to the target chosen then", () => {
    const { game, a } = table();
    const cyclops = enter(game, "Cyclops Superconductor");
    expect(energy(game)).toBe(3);
    game.debugApplyEffect(A, { kind: "modify-pt", target: 0, power: 3, toughness: 0, duration: "end-of-turn" }, [
      ref(cyclops),
    ]);
    pickModes(a, 0);
    pickTargets(a, B);
    destroy(game, cyclops);
    expect(energy(game)).toBe(0);
    expect(life(game, B)).toBe(15);
  });

  it("without three energy, nothing is paid and no damage is dealt", () => {
    const { game, a } = table();
    const cyclops = spawn(game, "Cyclops Superconductor");
    game.state.players[A].energy = 2;
    pickModes(a, 0);
    pickTargets(a, B);
    destroy(game, cyclops);
    expect(energy(game)).toBe(2);
    expect(life(game, B)).toBe(20);
  });

  it("has prowess", () => {
    const { game } = table();
    const cyclops = spawn(game, "Cyclops Superconductor");
    spawn(game, "Mountain");
    cast(game, toHand(game, "Lightning Bolt"), { targets: [ref(B)] });
    expect(pt(game, cyclops)).toEqual({ power: 3, toughness: 3 });
  });
});

describe("Reckless Pyrosurfer", () => {
  it("each landfall gives it another battle cry until end of turn", () => {
    const { game, a } = table();
    const surfer = spawn(game, "Reckless Pyrosurfer");
    const bear = spawn(game, "Grizzly Bears");
    playLand(game);
    playLand(game);
    attack(game, a, [surfer, bear]);
    // Two instances, each triggering separately: +2/+0 on the other attacker.
    expect(pt(game, bear)).toEqual({ power: 4, toughness: 2 });
    expect(pt(game, surfer)).toEqual({ power: 2, toughness: 2 });
    expect(life(game, B)).toBe(14);
  });

  it("without a landfall it has no battle cry", () => {
    const { game, a } = table();
    const surfer = spawn(game, "Reckless Pyrosurfer");
    const bear = spawn(game, "Grizzly Bears");
    attack(game, a, [surfer, bear]);
    expect(pt(game, bear)).toEqual({ power: 2, toughness: 2 });
    expect(life(game, B)).toBe(16);
  });
});

describe("Inspired Inventor", () => {
  it("chooses energy", () => {
    const { game, a } = table();
    pickModes(a, 0);
    enter(game, "Inspired Inventor");
    expect(energy(game)).toBe(3);
  });

  it("chooses a +1/+1 counter on target creature", () => {
    const { game, a } = table();
    const bear = spawn(game, "Grizzly Bears", B);
    pickModes(a, 1);
    pickTargets(a, bear);
    enter(game, "Inspired Inventor");
    expect(counters(game, bear)).toBe(1);
    expect(energy(game)).toBe(0);
  });

  it("chooses a Servo", () => {
    const { game, a } = table();
    pickModes(a, 2);
    enter(game, "Inspired Inventor");
    expect(tokensNamed(game, "Servo Token", A)).toBe(1);
  });
});

describe("Expanding Ooze", () => {
  it("attacking, counters a modified creature you control — not an unmodified one or an opponent's", () => {
    const { game, a } = table();
    const ooze = spawn(game, "Expanding Ooze");
    const modified = spawn(game, "Grizzly Bears");
    const plain = spawn(game, "Grizzly Bears");
    const equipped = spawn(game, "Hill Giant");
    const theirs = spawn(game, "Grizzly Bears", B);
    // An Equipment anyone controls makes it modified (the ruling).
    const axe = spawn(game, "Inventor's Axe", B);
    game.state.objects[axe].attachedTo = equipped;
    game.debugApplyEffect(A, { kind: "add-counter", target: 0, counter: "+1/+1", amount: 1 }, [ref(modified)]);
    game.debugApplyEffect(B, { kind: "add-counter", target: 0, counter: "+1/+1", amount: 1 }, [ref(theirs)]);
    const seen = watchTargets(a, () => [modified]);
    attack(game, a, [ooze]);
    expect([...seen.offered[0]].sort()).toEqual([modified, equipped].sort());
    expect(counters(game, modified)).toBe(2);
    expect(counters(game, plain)).toBe(0);
  });

  it("adapts 1 for {B}{G}", () => {
    const { game } = table();
    const ooze = spawn(game, "Expanding Ooze");
    spawn(game, "Swamp");
    spawn(game, "Forest");
    activate(game, ooze);
    expect(counters(game, ooze)).toBe(1);
  });
});

describe("Dreamdrinker Vampire", () => {
  it("adapting gives it menace until end of turn", () => {
    const { game } = table();
    const vampire = spawn(game, "Dreamdrinker Vampire");
    lands(game, "Swamp", 2);
    expect(keywords(game, vampire).has("menace")).toBe(false);
    activate(game, vampire);
    expect(counters(game, vampire)).toBe(1);
    expect(keywords(game, vampire).has("menace")).toBe(true);
    expect(keywords(game, vampire).has("lifelink")).toBe(true);
  });
});

describe("Aerie Auxiliary", () => {
  it("supports two other creatures, never itself", () => {
    const { game, a } = table();
    const bear = spawn(game, "Grizzly Bears");
    const theirs = spawn(game, "Grizzly Bears", B);
    const seen = watchTargets(a, () => [bear, theirs]);
    const aux = enter(game, "Aerie Auxiliary");
    expect(seen.offered[0]).not.toContain(aux);
    expect(counters(game, bear)).toBe(1);
    expect(counters(game, theirs)).toBe(1);
    expect(counters(game, aux)).toBe(0);
  });
});

describe("Smelted Chargebug", () => {
  it("paying {E} gives another attacking creature +1/+0 and menace", () => {
    const { game, a } = table();
    const bug = enter(game, "Smelted Chargebug");
    expect(energy(game)).toBe(2);
    const bear = spawn(game, "Grizzly Bears");
    const giant = spawn(game, "Hill Giant");
    spawn(game, "Grizzly Bears");
    const seen = watchTargets(a, () => [bear]);
    pickModes(a, 0);
    attack(game, a, [bug, bear, giant]);
    // Another attacking creature: not the Chargebug, not one at home.
    expect([...seen.offered[0]].sort()).toEqual([bear, giant].sort());
    expect(energy(game)).toBe(1);
    expect(pt(game, bear)).toEqual({ power: 3, toughness: 2 });
    expect(keywords(game, bear).has("menace")).toBe(true);
  });

  it("declining pays nothing and pumps nothing", () => {
    const { game, a } = table();
    const bug = enter(game, "Smelted Chargebug");
    const bear = spawn(game, "Grizzly Bears");
    pickTargets(a, bear);
    pickModes(a);
    attack(game, a, [bug, bear]);
    expect(energy(game)).toBe(2);
    expect(pt(game, bear)).toEqual({ power: 2, toughness: 2 });
  });
});

describe("Depth Defiler", () => {
  it("unkicked, its cast trigger chooses one mode", () => {
    const { game, a } = table();
    lands(game, "Island", 2);
    lands(game, "Wastes", 3);
    const bear = spawn(game, "Grizzly Bears", B);
    const before = hand(game, B).length;
    pickModes(a, 0);
    pickTargets(a, bear);
    const defiler = toHand(game, "Depth Defiler");
    cast(game, defiler);
    expect(zone(game, bear)).toBe("hand");
    // Only one mode: bob drew nothing.
    expect(hand(game, B).length).toBe(before + 1);
    expect(zone(game, defiler)).toBe("battlefield");
  });

  it("kicked, it does both", () => {
    const { game, a } = table();
    lands(game, "Island", 2);
    lands(game, "Wastes", 4);
    const bear = spawn(game, "Grizzly Bears", B);
    const before = hand(game, B).length;
    pickModes(a, 0, 1);
    pickTargets(a, bear, B);
    cast(game, toHand(game, "Depth Defiler"), { kicked: true });
    expect(zone(game, bear)).toBe("hand");
    // The bear back, two drawn, one discarded.
    expect(hand(game, B).length).toBe(before + 1 + 2 - 1);
  });

  it("kicked and countered in response, the trigger still does both (the ruling)", () => {
    const { game, a } = table();
    lands(game, "Island", 2);
    lands(game, "Wastes", 4);
    const bear = spawn(game, "Grizzly Bears", B);
    const before = hand(game, B).length;
    pickModes(a, 0, 1);
    pickTargets(a, bear, B);
    const defiler = toHand(game, "Depth Defiler");
    cast(game, defiler, { kicked: true, settle: false });
    game.advanceUntil((s) => s.zones.shared.stack.length === 2 && s.awaiting === null);
    game.debugApplyEffect(B, { kind: "counter", target: 0 }, [ref(defiler)]);
    expect(zone(game, defiler)).toBe("graveyard");
    settle(game);
    expect(zone(game, bear)).toBe("hand");
    expect(hand(game, B).length).toBe(before + 1 + 2 - 1);
  });

  it("an unkicked one countered in response still does its one mode", () => {
    const { game, a } = table();
    lands(game, "Island", 2);
    lands(game, "Wastes", 3);
    const bear = spawn(game, "Grizzly Bears", B);
    pickModes(a, 0);
    pickTargets(a, bear);
    const defiler = toHand(game, "Depth Defiler");
    cast(game, defiler, { settle: false });
    game.advanceUntil((s) => s.zones.shared.stack.length === 2 && s.awaiting === null);
    game.debugApplyEffect(B, { kind: "counter", target: 0 }, [ref(defiler)]);
    settle(game);
    expect(zone(game, bear)).toBe("hand");
    expect(named(game, "Depth Defiler")).toEqual([]);
  });
});
