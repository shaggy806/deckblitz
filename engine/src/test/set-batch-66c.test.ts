/**
 * The set walk, batch 66, part c (2026-10-12): Edge of Eternities and Final
 * Fantasy. Written on the shared table in `harness.ts`.
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
  controller,
  counters,
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
  watchTargets,
  zone,
} from "./harness.js";

const damage = (game: Game, id: ObjectId): number => game.state.objects[id].damageMarked;

/** Run until `A` has priority with exactly `n` things on the stack. */
const untilStack = (game: Game, n: number): void =>
  game.advanceUntil(
    (s) => s.zones.shared.stack.length === n && s.priority.holder === A && s.pendingTriggers.length === 0 && s.awaiting === null,
  );

describe("Scrounge for Eternity", () => {
  it("returns a noncreature Spacecraft card, not one over mana value 5, and makes a Lander", () => {
    const { game } = table();
    lands(game, "Swamp", 3);
    const fodder = spawn(game, "Grizzly Bears");
    const sweeper = toGraveyard(game, "Wurmwall Sweeper");
    const big = toGraveyard(game, "Colossal Dreadmaw");
    const scrounge = toHand(game, "Scrounge for Eternity");
    expect(() => cast(game, scrounge, { targets: [ref(big)] })).toThrow();
    cast(game, scrounge, { targets: [ref(sweeper)] });
    expect(zone(game, fodder)).toBe("graveyard");
    expect(zone(game, sweeper)).toBe("battlefield");
    expect(tokensNamed(game, "Lander Token", A)).toBe(1);
  });
});

describe("Drill Too Deep", () => {
  it("puts five charge counters on a Planet you control", () => {
    const { game } = table();
    lands(game, "Mountain", 2);
    const planet = spawn(game, "Evendo, Waking Haven");
    cast(game, toHand(game, "Drill Too Deep"), { modes: [0], targets: [ref(planet)] });
    expect(counters(game, planet, "charge")).toBe(5);
  });
});

describe("Rescue Skiff", () => {
  it("returns an enchantment card on entering, and is a 5/6 flier at 10 charge counters", () => {
    const { game, a } = table();
    const relic = toGraveyard(game, "Pacifism");
    const bear = spawn(game, "Grizzly Bears", B);
    pickTargets(a, relic);
    a.chooseEnchantFn = () => bear;
    const skiff = enter(game, "Rescue Skiff");
    expect(zone(game, relic)).toBe("battlefield");
    expect(game.state.objects[relic].attachedTo).toBe(bear);
    expect(game.state.objects[skiff].counters.charge ?? 0).toBe(0);
    game.state.objects[skiff].counters.charge = 10;
    expect(pt(game, skiff)).toEqual({ power: 5, toughness: 6 });
    expect(keywords(game, skiff).has("flying")).toBe(true);
  });
});

describe("Cut Propulsion", () => {
  it("has the creature deal its power to itself, twice that with flying", () => {
    const { game } = table();
    lands(game, "Mountain", 6);
    const spider = spawn(game, "Giant Spider", B);
    cast(game, toHand(game, "Cut Propulsion"), { targets: [ref(spider)] });
    expect(damage(game, spider)).toBe(2);
    // Storm Crow, 1/2 flying: 1 damage alone wouldn't kill it, 2 does.
    const crow = spawn(game, "Storm Crow", B);
    cast(game, toHand(game, "Cut Propulsion"), { targets: [ref(crow)] });
    expect(zone(game, crow)).toBe("graveyard");
  });
});

describe("Nanoform Sentinel", () => {
  it("untaps another target permanent when it becomes tapped, once each turn", () => {
    const { game, a } = table();
    const sentinel = spawn(game, "Nanoform Sentinel");
    const land = spawn(game, "Island", A, { tapped: true });
    const theirs = spawn(game, "Grizzly Bears", B, { tapped: true });
    const seen = watchTargets(a, () => [land]);
    attack(game, a, [sentinel]);
    expect(seen.offered[0]).toContain(theirs);
    expect(seen.offered[0]).not.toContain(sentinel);
    expect(game.state.objects[land].tapped).toBe(false);
    // Tapped again this turn: no second trigger.
    game.state.objects[sentinel].tapped = false;
    game.state.objects[land].tapped = true;
    game.debugApplyEffect(A, { kind: "tap", target: 0 }, [ref(sentinel)]);
    settle(game);
    expect(seen.asked).toBe(1);
    expect(game.state.objects[land].tapped).toBe(true);
  });
});

describe("Syr Vondam, the Lucent", () => {
  it("gives the other creatures you control +1/+0 and deathtouch as it enters, not itself or an opponent's", () => {
    const { game } = table();
    const bear = spawn(game, "Grizzly Bears");
    const theirs = spawn(game, "Grizzly Bears", B);
    const vondam = enter(game, "Syr Vondam, the Lucent");
    expect(pt(game, bear)).toEqual({ power: 3, toughness: 2 });
    expect(keywords(game, bear).has("deathtouch")).toBe(true);
    expect(pt(game, vondam)).toEqual({ power: 4, toughness: 4 });
    expect(pt(game, theirs)).toEqual({ power: 2, toughness: 2 });
    expect(keywords(game, theirs).has("deathtouch")).toBe(false);
  });

  it("does it again when it attacks", () => {
    const { game, a } = table();
    const bear = spawn(game, "Grizzly Bears");
    const vondam = spawn(game, "Syr Vondam, the Lucent");
    attack(game, a, [vondam]);
    expect(pt(game, bear)).toEqual({ power: 3, toughness: 2 });
  });
});

describe("Hardlight Containment", () => {
  it("exiles an opponent's creature until it leaves, and gives the artifact ward {1}", () => {
    const { game, a } = table();
    lands(game, "Plains", 1);
    const relic = spawn(game, "Darksteel Relic");
    const bear = spawn(game, "Grizzly Bears", B);
    pickTargets(a, bear);
    const aura = toHand(game, "Hardlight Containment");
    cast(game, aura, { targets: [ref(relic)] });
    expect(zone(game, bear)).toBe("exile");
    expect(game.state.objects[aura].attachedTo).toBe(relic);
    game.debugApplyEffect(B, { kind: "destroy", target: 0 }, [ref(aura)]);
    settle(game);
    expect(named(game, "Grizzly Bears", B)).toHaveLength(1);
  });

  it("exiles nothing if it has left before its trigger resolves (the ruling)", () => {
    const { game, a } = table();
    lands(game, "Plains", 1);
    const relic = spawn(game, "Darksteel Relic");
    const bear = spawn(game, "Grizzly Bears", B);
    pickTargets(a, bear);
    const aura = toHand(game, "Hardlight Containment");
    cast(game, aura, { targets: [ref(relic)], settle: false });
    game.advanceUntil(
      (s) =>
        s.zones.shared.stack.length === 1 &&
        s.objects[aura].zone === "battlefield" &&
        s.priority.holder === A &&
        s.awaiting === null &&
        s.pendingTriggers.length === 0,
    );
    game.debugApplyEffect(B, { kind: "destroy", target: 0 }, [ref(aura)]);
    settle(game);
    expect(zone(game, bear)).toBe("battlefield");
  });
});

describe("Sami, Ship's Engineer", () => {
  it("makes a tapped Robot at your end step only with two or more tapped creatures", () => {
    const { game } = table();
    spawn(game, "Sami, Ship's Engineer");
    spawn(game, "Grizzly Bears", A, { tapped: true });
    toStep(game, "end");
    settle(game);
    expect(tokensNamed(game, "Robot Token", A)).toBe(0);

    toStep(game, "precombat-main");
    spawn(game, "Grizzly Bears", A, { tapped: true });
    spawn(game, "Grizzly Bears", B, { tapped: true }); // not yours
    // Next turn's untap step untapped the first Bear: two tapped of yours now.
    spawn(game, "Grizzly Bears", A, { tapped: true });
    toStep(game, "end");
    settle(game);
    const [robot] = named(game, "Robot Token", A);
    expect(robot).toBeDefined();
    expect(game.state.objects[robot].tapped).toBe(true);
  });
});

describe("Self-Destruct", () => {
  it("has your creature deal its power to another target and to itself", () => {
    const { game } = table();
    lands(game, "Mountain", 2);
    const spider = spawn(game, "Giant Spider");
    const card = toHand(game, "Self-Destruct");
    // "Any other target": not the creature itself.
    expect(() => cast(game, card, { targets: [ref(spider), ref(spider)] })).toThrow();
    cast(game, card, { targets: [ref(spider), ref(B)] });
    expect(life(game, B)).toBe(18);
    expect(damage(game, spider)).toBe(2);
  });

  it("still deals the damage to itself when the other target is gone (the ruling)", () => {
    const { game } = table();
    lands(game, "Mountain", 2);
    const spider = spawn(game, "Giant Spider");
    const bear = spawn(game, "Grizzly Bears", B);
    cast(game, toHand(game, "Self-Destruct"), { targets: [ref(spider), ref(bear)], settle: false });
    untilStack(game, 1);
    game.debugApplyEffect(B, { kind: "exile", target: 0 }, [ref(bear)]);
    settle(game);
    expect(damage(game, spider)).toBe(2);
  });
});

describe("Summon: Choco/Mog", () => {
  it("gives the other creatures you control +1/+0 at each chapter, not itself", () => {
    const { game } = table();
    const bear = spawn(game, "Grizzly Bears");
    const saga = enter(game, "Summon: Choco/Mog");
    expect(pt(game, bear)).toEqual({ power: 3, toughness: 2 });
    expect(pt(game, saga)).toEqual({ power: 3, toughness: 3 });
  });
});

describe("Stiltzkin, Moogle Merchant", () => {
  it("gives an opponent another permanent you control and draws you a card", () => {
    const { game } = table();
    lands(game, "Plains", 2);
    const stiltzkin = spawn(game, "Stiltzkin, Moogle Merchant");
    const relic = spawn(game, "Darksteel Relic");
    const before = hand(game).length;
    activate(game, stiltzkin, 0, { targets: [ref(B), ref(relic)] });
    expect(controller(game, relic)).toBe(B);
    expect(hand(game).length).toBe(before + 1);
  });

  it("draws nothing when the permanent is gone as it resolves", () => {
    const { game } = table();
    lands(game, "Plains", 2);
    const stiltzkin = spawn(game, "Stiltzkin, Moogle Merchant");
    const bear = spawn(game, "Grizzly Bears");
    const before = hand(game).length;
    activate(game, stiltzkin, 0, { targets: [ref(B), ref(bear)], settle: false });
    untilStack(game, 1);
    game.debugApplyEffect(B, { kind: "destroy", target: 0 }, [ref(bear)]);
    settle(game);
    expect(hand(game).length).toBe(before);
  });

  it("draws nothing when the opponent can't be targeted as it resolves: they didn't gain control", () => {
    const { game } = table();
    lands(game, "Plains", 2);
    const stiltzkin = spawn(game, "Stiltzkin, Moogle Merchant");
    const relic = spawn(game, "Darksteel Relic");
    const before = hand(game).length;
    activate(game, stiltzkin, 0, { targets: [ref(B), ref(relic)], settle: false });
    untilStack(game, 1);
    spawn(game, "Shalai, Voice of Plenty", B); // bob has hexproof
    settle(game);
    expect(controller(game, relic)).toBe(A);
    expect(hand(game).length).toBe(before);
  });
});

describe("Gladiolus Amicitia", () => {
  it("fetches a land tapped, and that landfall pumps another creature you control", () => {
    const { game, a } = table();
    const bear = spawn(game, "Grizzly Bears");
    const other = spawn(game, "Hill Giant");
    const forest = toLibrary(game, "Forest");
    pickFromZone(a, forest);
    const seen = watchTargets(a, () => [bear]);
    const glad = enter(game, "Gladiolus Amicitia");
    expect(zone(game, forest)).toBe("battlefield");
    expect(game.state.objects[forest].tapped).toBe(true);
    expect(seen.offered[0]).toContain(other);
    expect(seen.offered[0]).not.toContain(glad);
    expect(pt(game, bear)).toEqual({ power: 4, toughness: 4 });
    expect(keywords(game, bear).has("trample")).toBe(true);
  });
});

describe("Delivery Moogle", () => {
  it("can find the artifact in your graveyard", () => {
    const { game, a } = table();
    const ring = toGraveyard(game, "Sol Ring");
    const stone = toGraveyard(game, "Mind Stone");
    pickModes(a, 2);
    const seen = pickFromZone(a, stone);
    enter(game, "Delivery Moogle");
    expect(seen.offered).toContain(stone);
    expect(seen.offered).toContain(ring);
    expect(hand(game)).toContain(stone);
    expect(graveyard(game)).toContain(ring);
  });
});
