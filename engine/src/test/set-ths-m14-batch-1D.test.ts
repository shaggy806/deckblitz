/**
 * Theros and Magic 2014, group D: heroic restrictions, taps and land
 * animation, Peak Eruption's damage to the destroyed land's controller, the
 * Magus staffs' two-event trigger, Liliana's Reaver, Devout Invocation's
 * tapped-this-way count, Hunt the Weak, Voracious Wurm and Battle Sliver.
 */
import { describe, expect, it } from "vitest";

import type { ObjectId } from "../primitives.js";
import {
  A,
  B,
  type BlockOffer,
  attack,
  blockOffer,
  cast,
  counters,
  enter,
  hand,
  lands,
  life,
  nextTurn,
  pickPermanents,
  pickTargets,
  pt,
  ref,
  settle,
  spawn,
  table,
  toHand,
  tokensNamed,
  types,
  zone,
} from "./harness.js";

const canBlock = (offer: BlockOffer, blocker: ObjectId): readonly ObjectId[] =>
  offer.eligible.find((e) => e.blocker === blocker)?.canBlock ?? [];

describe("Arena Athlete", () => {
  it("heroic stops the targeted opponent's creature from blocking", () => {
    const { game, a } = table();
    const athlete = spawn(game, "Arena Athlete");
    const stopped = spawn(game, "Grizzly Bears", B);
    const free = spawn(game, "Grizzly Bears", B);
    lands(game, "Forest", 1);
    pickTargets(a, stopped);
    cast(game, toHand(game, "Giant Growth"), { targets: [ref(athlete)] });
    const offer = blockOffer(game, a, [athlete]);
    expect(canBlock(offer, stopped)).toEqual([]);
    expect(canBlock(offer, free)).toEqual([athlete]);
  });
});

describe("Wavecrash Triton", () => {
  it("heroic taps the target, which stays tapped through its controller's next untap step", () => {
    const { game, a } = table();
    const triton = spawn(game, "Wavecrash Triton");
    const bears = spawn(game, "Grizzly Bears", B);
    lands(game, "Forest", 1);
    pickTargets(a, bears);
    cast(game, toHand(game, "Giant Growth"), { targets: [ref(triton)] });
    expect(game.state.objects[bears].tapped).toBe(true);
    nextTurn(game);
    expect(game.state.objects[bears].tapped).toBe(true);
  });
});

describe("Anthousa, Setessan Hero", () => {
  it("heroic turns up to three target lands into 2/2 Warrior creatures that are still lands", () => {
    const { game, a } = table();
    const anthousa = spawn(game, "Anthousa, Setessan Hero");
    const [pay, f1, f2, f3] = lands(game, "Forest", 4);
    pickTargets(a, f1, f2, f3);
    cast(game, toHand(game, "Giant Growth"), { targets: [ref(anthousa)] });
    for (const f of [f1, f2, f3]) {
      expect(types(game, f)).toEqual(expect.arrayContaining(["land", "creature"]));
      expect(pt(game, f)).toEqual({ power: 2, toughness: 2 });
    }
    expect(types(game, pay)).not.toContain("creature");
  });
});

describe("Peak Eruption", () => {
  it("destroys the Mountain and deals 3 damage to its controller", () => {
    const { game } = table();
    const theirs = spawn(game, "Mountain", B);
    lands(game, "Mountain", 3);
    cast(game, toHand(game, "Peak Eruption"), { targets: [ref(theirs)] });
    expect(zone(game, theirs)).toBe("graveyard");
    expect(life(game, B)).toBe(17);
    expect(life(game, A)).toBe(20);
  });
});

describe("Staff of the Death Magus", () => {
  it("gains 1 life for a black spell you cast and for a Swamp entering under your control", () => {
    const { game } = table();
    spawn(game, "Staff of the Death Magus");
    const bears = spawn(game, "Grizzly Bears", B);
    lands(game, "Swamp", 1);
    lands(game, "Mountain", 1);
    cast(game, toHand(game, "Disfigure"), { targets: [ref(bears)] });
    expect(life(game, A)).toBe(21);
    cast(game, toHand(game, "Lightning Bolt"), { targets: [ref(B)] });
    expect(life(game, A)).toBe(21);
    enter(game, "Swamp");
    expect(life(game, A)).toBe(22);
    enter(game, "Swamp", B);
    expect(life(game, A)).toBe(22);
  });
});

describe("Liliana's Reaver", () => {
  it("combat damage to a player makes them discard and you create a tapped Zombie", () => {
    const { game, a } = table();
    const reaver = spawn(game, "Liliana's Reaver");
    const before = hand(game, B).length;
    attack(game, a, [reaver]);
    expect(hand(game, B).length).toBe(before - 1);
    expect(tokensNamed(game, "Zombie Token", A)).toBe(1);
    const zombie = game.battlefield.find((id) => game.state.objects[id].cardName === "Zombie Token")!;
    expect(game.state.objects[zombie].tapped).toBe(true);
  });
});

describe("Devout Invocation", () => {
  it("creates a 4/4 flying Angel for each creature tapped this way", () => {
    const { game, a } = table();
    const [b1, b2] = [spawn(game, "Grizzly Bears"), spawn(game, "Grizzly Bears")];
    const kept = spawn(game, "Grizzly Bears");
    lands(game, "Plains", 7);
    pickPermanents(a, b1, b2);
    cast(game, toHand(game, "Devout Invocation"));
    expect(tokensNamed(game, "4/4 Angel Token", A)).toBe(2);
    expect(game.state.objects[kept].tapped).toBe(false);
  });
});

describe("Hunt the Weak", () => {
  it("puts a counter on your creature, then it fights the other target", () => {
    const { game } = table();
    const mine = spawn(game, "Grizzly Bears");
    const theirs = spawn(game, "Grizzly Bears", B);
    lands(game, "Forest", 4);
    cast(game, toHand(game, "Hunt the Weak"), { targets: [ref(mine), ref(theirs)] });
    expect(counters(game, mine)).toBe(1);
    expect(zone(game, mine)).toBe("battlefield");
    expect(zone(game, theirs)).toBe("graveyard");
  });
});

describe("Voracious Wurm", () => {
  it("enters with a +1/+1 counter for each life gained this turn", () => {
    const { game } = table();
    game.debugApplyEffect(A, { kind: "gain-life", amount: 3 }, []);
    settle(game);
    game.debugApplyEffect(A, { kind: "lose-life", amount: 3 }, []);
    settle(game);
    const wurm = enter(game, "Voracious Wurm");
    expect(counters(game, wurm)).toBe(3);
  });
});

describe("Battle Sliver", () => {
  it("pumps only the Slivers you control", () => {
    const { game } = table();
    const mine = spawn(game, "Battle Sliver");
    const theirs = spawn(game, "Battle Sliver", B);
    expect(pt(game, mine)).toEqual({ power: 5, toughness: 3 });
    expect(pt(game, theirs)).toEqual({ power: 5, toughness: 3 });
  });
});
