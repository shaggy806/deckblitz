/**
 * The set walk, batch 62, part b (2026-10-12): Teenage Mutant Ninja Turtles
 * — artifacts, Mutagens and a Class. Written on the shared table in
 * `harness.ts`.
 */
import { describe, expect, it } from "vitest";

import type { Game } from "../game.js";
import type { ObjectId } from "../primitives.js";

import {
  A,
  B,
  activate,
  blockOffer,
  cast,
  counters,
  enter,
  graveyard,
  hand,
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
  subtypes,
  table,
  toGraveyard,
  toHand,
  toStep,
  tokensNamed,
  types,
  zone,
} from "./harness.js";

const MUTAGEN = "Mutagen Token";

/** Who may attack, as the attack is declared. */
const eligibleAttackers = (game: Game): readonly ObjectId[] => {
  game.advanceUntil((s) => s.awaiting?.kind === "attackers" || s.result.over);
  const offer = game.legalActions(A).find((x) => x.kind === "declare-attackers");
  return offer?.kind === "declare-attackers" ? offer.eligible : [];
};

describe("Does Machines", () => {
  it("mills, draws and discards two as it enters", () => {
    const { game } = table();
    const handBefore = hand(game, A).length;
    enter(game, "Does Machines");
    expect(hand(game, A).length).toBe(handBefore); // +2 −2
    expect(graveyard(game, A).length).toBe(4); // two milled, two discarded
  });

  it("level 2 returns up to two target artifact cards from your graveyard", () => {
    const { game, a } = table();
    const ring = toGraveyard(game, "Sol Ring");
    const stone = toGraveyard(game, "Mind Stone");
    const machines = spawn(game, "Does Machines");
    lands(game, "Island", 2);
    pickTargets(a, ring, stone);
    activate(game, machines, 0);
    expect([zone(game, ring), zone(game, stone)]).toEqual(["hand", "hand"]);
  });

  it("level 3 makes a noncreature artifact a 0/0 Robot creature with three counters, for good", () => {
    const { game, a } = table();
    const machines = spawn(game, "Does Machines");
    const ring = spawn(game, "Sol Ring");
    lands(game, "Island", 2 + 5);
    activate(game, machines, 0);
    activate(game, machines, 1);
    pickTargets(a, ring);
    toStep(game, "begin-combat");
    settle(game);
    expect(counters(game, ring)).toBe(3);
    expect(types(game, ring)).toEqual(expect.arrayContaining(["artifact", "creature"]));
    expect(subtypes(game, ring)).toContain("Robot");
    expect(pt(game, ring)).toEqual({ power: 3, toughness: 3 });
    // Still a creature next turn: no duration.
    toStep(game, "precombat-main", B);
    expect(types(game, ring)).toContain("creature");
  });

  it("level 3 on an artifact creature only adds the counters — its printed P/T stays", () => {
    const { game, a } = table();
    const machines = spawn(game, "Does Machines");
    const thopter = spawn(game, "Ornithopter");
    lands(game, "Island", 7);
    activate(game, machines, 0);
    activate(game, machines, 1);
    pickTargets(a, thopter);
    toStep(game, "begin-combat");
    settle(game);
    expect(pt(game, thopter)).toEqual({ power: 3, toughness: 5 });
    expect(subtypes(game, thopter)).not.toContain("Robot");
  });
});

describe("Everything Pizza", () => {
  it("target player gains 3 and draws, each opponent discards, 3 damage to any target, counters on up to one creature", () => {
    const { game } = table();
    for (const land of ["Plains", "Island", "Swamp", "Mountain", "Forest", "Wastes", "Wastes"]) lands(game, land, 1);
    const pizza = spawn(game, "Everything Pizza");
    const giant = spawn(game, "Hill Giant", B);
    const bears = spawn(game, "Grizzly Bears");
    const [aHand, bHand] = [hand(game, A).length, hand(game, B).length];
    activate(game, pizza, 0, { targets: [ref(A), ref(giant), ref(bears)] });
    expect(life(game, A)).toBe(23);
    expect(hand(game, A).length).toBe(aHand + 1);
    expect(hand(game, B).length).toBe(bHand - 1);
    expect(zone(game, giant)).toBe("graveyard");
    expect(counters(game, bears)).toBe(3);
    expect(zone(game, pizza)).toBe("graveyard");
  });
});

describe("Fugitive Droid", () => {
  it("can't be blocked only once an artifact entered under your control this turn", () => {
    const { game } = table();
    const droid = spawn(game, "Fugitive Droid");
    expect(keywords(game, droid).has("unblockable")).toBe(false);
    enter(game, "Grizzly Bears");
    expect(keywords(game, droid).has("unblockable")).toBe(false);
    enter(game, "Sol Ring", B);
    expect(keywords(game, droid).has("unblockable")).toBe(false);
    enter(game, "Mind Stone");
    expect(keywords(game, droid).has("unblockable")).toBe(true);
  });

  it("counters a spell that targets an artifact or creature you control, and nothing else", () => {
    const { game } = table();
    const droid = spawn(game, "Fugitive Droid");
    const mine = spawn(game, "Grizzly Bears");
    const theirs = spawn(game, "Hill Giant", B);
    lands(game, "Mountain", 1);
    lands(game, "Island", 1);
    const bolt = toHand(game, "Lightning Bolt");
    cast(game, bolt, { targets: [ref(theirs)], settle: false });
    expect(() => activate(game, droid, 0, { targets: [ref(bolt)], settle: false })).toThrow();
    settle(game);
    const growth = toHand(game, "Giant Growth");
    lands(game, "Forest", 1);
    cast(game, growth, { targets: [ref(mine)], settle: false });
    activate(game, droid, 0, { targets: [ref(growth)] });
    expect(zone(game, growth)).toBe("graveyard");
    expect(pt(game, mine)).toEqual({ power: 2, toughness: 2 });
    expect(zone(game, droid)).toBe("graveyard");
  });
});

describe("Genghis Frog", () => {
  it("makes a Mutagen for itself and for each other Mutant you control, not an opponent's or a non-Mutant", () => {
    const { game } = table();
    enter(game, "Genghis Frog");
    expect(tokensNamed(game, MUTAGEN, A)).toBe(1);
    enter(game, "Incurable Ogre");
    expect(tokensNamed(game, MUTAGEN, A)).toBe(2);
    enter(game, "Incurable Ogre", B);
    enter(game, "Grizzly Bears");
    expect(tokensNamed(game, MUTAGEN)).toBe(2);
  });
});

describe("Guac & Marshmallow Pizza", () => {
  it("pumps the target and untaps it", () => {
    const { game, a } = table();
    const bears = spawn(game, "Grizzly Bears", A, { tapped: true });
    pickTargets(a, bears);
    enter(game, "Guac & Marshmallow Pizza");
    expect(pt(game, bears)).toEqual({ power: 4, toughness: 4 });
    expect(game.state.objects[bears].tapped).toBe(false);
  });
});

describe("Improvised Arsenal", () => {
  it("copies itself as a token Equipment that counts as an artifact for both", () => {
    const { game } = table();
    const arsenal = spawn(game, "Improvised Arsenal");
    const bears = spawn(game, "Grizzly Bears");
    lands(game, "Mountain", 6);
    activate(game, arsenal, 1, { targets: [ref(bears)] });
    expect(pt(game, bears)).toEqual({ power: 3, toughness: 2 }); // one artifact
    activate(game, arsenal, 0);
    const copies = named(game, "Improvised Arsenal").filter((id) => id !== arsenal);
    expect(copies).toHaveLength(1);
    expect(game.state.objects[copies[0]].isToken).toBe(true);
    expect(subtypes(game, copies[0])).toContain("Equipment");
    expect(pt(game, bears)).toEqual({ power: 4, toughness: 2 }); // two artifacts
  });
});

describe("Krang, Master Mind", () => {
  it("draws up to four as it enters, gets +1/+0 per other artifact, and doesn't trigger at four cards", () => {
    const { game } = table();
    // Down to one card in hand.
    game.debugApplyEffect(A, { kind: "discard", target: "you", amount: hand(game, A).length - 1 }, []);
    settle(game);
    expect(hand(game, A).length).toBe(1);
    spawn(game, "Sol Ring");
    const krang = enter(game, "Krang, Master Mind");
    expect(hand(game, A).length).toBe(4);
    expect(pt(game, krang)).toEqual({ power: 2, toughness: 4 });
  });

  it("an intervening if: no trigger with four or more cards in hand", () => {
    const { game } = table();
    expect(hand(game, A).length).toBeGreaterThanOrEqual(4);
    const before = hand(game, A).length;
    enter(game, "Krang, Master Mind");
    expect(hand(game, A).length).toBe(before);
  });
});

describe("Michelangelo, Mutant BFF", () => {
  it("makes a Mutagen as it enters and attacks; creatures you control with a counter can be blocked by one at most", () => {
    const { game, a } = table();
    const mikey = enter(game, "Michelangelo, Mutant BFF");
    expect(tokensNamed(game, MUTAGEN, A)).toBe(1);
    const bears = spawn(game, "Grizzly Bears");
    const giant = spawn(game, "Hill Giant");
    game.state.objects[bears].counters = { ...game.state.objects[bears].counters, charge: 1 };
    spawn(game, "Grizzly Bears", B);
    spawn(game, "Grizzly Bears", B);
    const offer = blockOffer(game, a, [mikey, bears, giant]);
    expect(offer.singleBlockerAttackers ?? []).toEqual([bears]);
    settle(game);
    expect(tokensNamed(game, MUTAGEN, A)).toBe(2);
  });
});

describe("Sewer-veillance Cam", () => {
  it("taps a creature as it leaves the battlefield, when it's sacrificed to draw", () => {
    const { game, a } = table();
    const cam = spawn(game, "Sewer-veillance Cam");
    const giant = spawn(game, "Hill Giant", B);
    lands(game, "Island", 4);
    pickTargets(a, giant);
    pickModes(a, 0);
    const before = hand(game, A).length;
    activate(game, cam, 0);
    expect(hand(game, A).length).toBe(before + 2);
    expect(game.state.objects[giant].tapped).toBe(true);
  });

  it("may do neither as it enters", () => {
    const { game, a } = table();
    const giant = spawn(game, "Hill Giant", B);
    pickTargets(a, giant);
    pickModes(a);
    enter(game, "Sewer-veillance Cam");
    expect(game.state.objects[giant].tapped).toBe(false);
  });
});

describe("Technodrome", () => {
  it("can't attack while its power is under 6", () => {
    const { game } = table();
    const drome = spawn(game, "Technodrome");
    expect(eligibleAttackers(game)).not.toContain(drome);
  });

  it("attacks at power 6", () => {
    const { game } = table();
    const drome = spawn(game, "Technodrome");
    game.state.objects[drome].counters = { ...game.state.objects[drome].counters, "+1/+1": 3 };
    expect(pt(game, drome).power).toBe(6);
    expect(eligibleAttackers(game)).toContain(drome);
  });

  it("can't block under power 6", () => {
    const { game, a } = table();
    const drome = spawn(game, "Technodrome", B);
    const theirBears = spawn(game, "Grizzly Bears", B);
    const bears = spawn(game, "Grizzly Bears");
    const offer = blockOffer(game, a, [bears]);
    expect(offer.eligible.find((e) => e.blocker === theirBears)?.canBlock).toEqual([bears]);
    expect(offer.eligible.find((e) => e.blocker === drome)?.canBlock ?? []).toEqual([]);
  });

  it("{T}, sacrifice another artifact: draw a card and a +1/+1 counter", () => {
    const { game } = table();
    const drome = spawn(game, "Technodrome");
    const ring = spawn(game, "Sol Ring");
    const before = hand(game, A).length;
    game.dispatch({ type: "activate-ability", player: A, source: drome, abilityIndex: 0, targets: [], sacrifice: ring });
    settle(game);
    expect(zone(game, ring)).toBe("graveyard");
    expect(hand(game, A).length).toBe(before + 1);
    expect(counters(game, drome)).toBe(1);
  });
});

describe("Weather Maker", () => {
  it("gets a charge counter per landfall, and three of them deal 3 damage", () => {
    const { game } = table();
    const maker = spawn(game, "Weather Maker");
    for (let i = 0; i < 3; i++) enter(game, "Wastes");
    enter(game, "Wastes", B);
    expect(counters(game, maker, "charge")).toBe(3);
    activate(game, maker, 2, { targets: [ref(B)] });
    expect(life(game, B)).toBe(17);
    expect(counters(game, maker, "charge")).toBe(0);
  });
});
