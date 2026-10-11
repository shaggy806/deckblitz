/**
 * The set walk, batch 56, part c (2026-10-11): Marvel Super Heroes Commander.
 * Written on the shared table in `harness.ts`.
 */
import { describe, expect, it } from "vitest";

import {
  A,
  B,
  attack,
  blockOffer,
  cast,
  counters,
  keywords,
  lands,
  life,
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
  zone,
} from "./harness.js";

describe("Lockjaw, Slobbering Teleporter", () => {
  it("after a noncreature spell, grows and makes itself and one other creature unblockable", () => {
    const { game, a } = table();
    const lockjaw = spawn(game, "Lockjaw, Slobbering Teleporter");
    const bears = spawn(game, "Grizzly Bears");
    const giant = spawn(game, "Hill Giant");
    const wall = spawn(game, "Hill Giant", B);
    lands(game, "Mountain", 1);
    cast(game, toHand(game, "Lightning Bolt"), { targets: [ref(B)] });
    pickTargets(a, bears);
    const offer = blockOffer(game, a, [lockjaw, bears, giant]);
    expect(counters(game, lockjaw)).toBe(1);
    expect(keywords(game, lockjaw).has("unblockable")).toBe(true);
    expect(keywords(game, bears).has("unblockable")).toBe(true);
    expect(keywords(game, giant).has("unblockable")).toBe(false);
    expect(offer.eligible.find((e) => e.blocker === wall)?.canBlock).toEqual([giant]);
  });

  it("declining the other target still makes Lockjaw unblockable", () => {
    const { game, a } = table();
    const lockjaw = spawn(game, "Lockjaw, Slobbering Teleporter");
    lands(game, "Mountain", 1);
    pickTargets(a, B);
    cast(game, toHand(game, "Lightning Bolt"), { targets: [ref(B)] });
    pickTargets(a, null);
    toStep(game, "declare-attackers");
    expect(counters(game, lockjaw)).toBe(1);
    expect(keywords(game, lockjaw).has("unblockable")).toBe(true);
  });

  it("does nothing on a turn with only a creature spell cast", () => {
    const { game } = table();
    const lockjaw = spawn(game, "Lockjaw, Slobbering Teleporter");
    lands(game, "Forest", 2);
    cast(game, toHand(game, "Grizzly Bears"));
    toStep(game, "declare-attackers");
    expect(counters(game, lockjaw)).toBe(0);
    expect(keywords(game, lockjaw).has("unblockable")).toBe(false);
  });
});

describe("Absorbing Man and Titania", () => {
  it("doubles a creature source's damage, not a noncreature source's", () => {
    const { game, a } = table();
    spawn(game, "Absorbing Man and Titania");
    const bears = spawn(game, "Grizzly Bears");
    attack(game, a, [bears]);
    expect(life(game, B)).toBe(16);
    lands(game, "Mountain", 1);
    cast(game, toHand(game, "Lightning Bolt"), { targets: [ref(B)] });
    expect(life(game, B)).toBe(13);
  });
});

describe("Ancestral Communion", () => {
  it("copies itself while you control your commander, the copy taking a new target", () => {
    const { game, a } = table();
    const commander = spawn(game, "Grizzly Bears");
    game.state.objects[commander].isCommander = true;
    lands(game, "Forest", 2);
    const first = toGraveyard(game, "Hill Giant");
    const second = toGraveyard(game, "Forest");
    pickTargets(a, second);
    cast(game, toHand(game, "Ancestral Communion"), { targets: [ref(first)] });
    expect(zone(game, first)).toBe("hand");
    expect(zone(game, second)).toBe("hand");
  });

  it("isn't copied without your commander — an opponent's you control doesn't count", () => {
    const { game, a } = table();
    const theirs = spawn(game, "Grizzly Bears", B);
    game.state.objects[theirs].isCommander = true;
    game.state.objects[theirs].controller = A;
    lands(game, "Forest", 2);
    const first = toGraveyard(game, "Hill Giant");
    const second = toGraveyard(game, "Forest");
    pickTargets(a, second);
    cast(game, toHand(game, "Ancestral Communion"), { targets: [ref(first)] });
    expect(zone(game, first)).toBe("hand");
    expect(zone(game, second)).toBe("graveyard");
  });
});

describe("Firebird, Blazing Ranger", () => {
  it("gives the other attackers +X/+0, X its power, and not itself", () => {
    const { game, a } = table();
    const firebird = spawn(game, "Firebird, Blazing Ranger");
    game.state.objects[firebird].counters["+1/+1"] = 2;
    const bears = spawn(game, "Grizzly Bears");
    const idle = spawn(game, "Hill Giant");
    a.declareAttackersFn = () => [
      { attacker: firebird, defender: B },
      { attacker: bears, defender: B },
    ];
    toStep(game, "declare-blockers");
    settle(game);
    expect(pt(game, bears)).toEqual({ power: 5, toughness: 2 });
    expect(pt(game, firebird)).toEqual({ power: 3, toughness: 5 });
    expect(pt(game, idle)).toEqual({ power: 3, toughness: 3 });
  });
});

describe("Extract Power", () => {
  it("exiles each player's top card face down, playable by the caster for free while exiled", () => {
    const { game } = table();
    lands(game, "Island", 6);
    const mine = toLibrary(game, "Hill Giant");
    const theirs = toLibrary(game, "Grizzly Bears", B);
    cast(game, toHand(game, "Extract Power"));
    expect(zone(game, mine)).toBe("exile");
    expect(zone(game, theirs)).toBe("exile");
    expect(game.state.objects[theirs].exiledFaceDown?.lookers).toEqual([A]);
    // Every land is tapped: the Bears can only be cast for free.
    game.dispatch({ type: "cast-spell", player: A, card: theirs, targets: [], via: "impulse", free: true });
    settle(game);
    expect(zone(game, theirs)).toBe("battlefield");
    expect(game.state.objects[theirs].controller).toBe(A);
    // A later turn: still exiled, still castable.
    toStep(game, "precombat-main");
    toStep(game, "precombat-main");
    expect(
      game.legalActions(A).some((x) => x.kind === "cast-spell" && x.card === mine),
    ).toBe(true);
  });
});

describe("Lucky the Pizza Dog", () => {
  it("makes Food for a Cat, Dog or Hero spell, not another, and grows at each end step after a life gain", () => {
    const { game } = table();
    const lucky = spawn(game, "Lucky the Pizza Dog");
    lands(game, "Forest", 8);
    lands(game, "Plains", 2);
    lands(game, "Mountain", 2);
    cast(game, toHand(game, "Grizzly Bears"));
    expect(tokensNamed(game, "Food Token", A)).toBe(0);
    cast(game, toHand(game, "Alpine Watchdog"));
    expect(tokensNamed(game, "Food Token", A)).toBe(1);
    cast(game, toHand(game, "Canyon Wildcat"));
    expect(tokensNamed(game, "Food Token", A)).toBe(2);
    cast(game, toHand(game, "Zuri, Warrior of Wakanda"));
    expect(tokensNamed(game, "Food Token", A)).toBe(3);
    toStep(game, "end");
    settle(game);
    expect(counters(game, lucky)).toBe(0);
    // Bob's turn: "each end step", once alice has gained life this turn.
    toStep(game, "precombat-main", B);
    game.debugApplyEffect(A, { kind: "gain-life", amount: 1 }, []);
    toStep(game, "end", B);
    settle(game);
    expect(counters(game, lucky)).toBe(1);
  });
});

describe("Spider-Man, New Champion", () => {
  it("deals as much damage as cards discarded at once, to any target", () => {
    const { game, a } = table();
    spawn(game, "Spider-Man, New Champion");
    toHand(game, "Grizzly Bears");
    toHand(game, "Hill Giant");
    pickTargets(a, B);
    game.debugApplyEffect(A, { kind: "discard", target: "you", amount: 2 }, []);
    settle(game);
    expect(life(game, B)).toBe(18);
  });
});

describe("Daredevil, Fearless Fighter", () => {
  it("attacks: exiles the top card, takes its mana value, and sends that damage to an opponent", () => {
    const { game, a } = table();
    const daredevil = spawn(game, "Daredevil, Fearless Fighter");
    const giant = toLibrary(game, "Hill Giant");
    pickTargets(a, B);
    attack(game, a, [daredevil]);
    expect(zone(game, giant)).toBe("exile");
    expect(life(game, A)).toBe(16);
    // 4 reflected, then 3 combat damage.
    expect(life(game, B)).toBe(13);
    lands(game, "Mountain", 4);
    expect(game.legalActions(A).some((x) => x.kind === "cast-spell" && x.card === giant)).toBe(true);
  });

  it("reflects damage your own source deals you, not an opponent's source's", () => {
    const { game, a } = table();
    spawn(game, "Daredevil, Fearless Fighter");
    const mine = spawn(game, "Grizzly Bears");
    const theirs = spawn(game, "Grizzly Bears", B);
    pickTargets(a, B);
    game.debugApplyEffect(B, { kind: "damage", amount: 3, who: "each-opponent" }, [], { source: theirs });
    settle(game);
    expect(life(game, A)).toBe(17);
    expect(life(game, B)).toBe(20);
    game.debugApplyEffect(A, { kind: "damage", amount: 2, who: "you" }, [], { source: mine });
    settle(game);
    expect(life(game, A)).toBe(15);
    expect(life(game, B)).toBe(18);
  });
});

describe("Thor, Guardian of Midgard", () => {
  it("may exile that many cards when a source you control deals noncombat damage to an opponent", () => {
    const { game, a } = table();
    spawn(game, "Thor, Guardian of Midgard");
    const top = [toLibrary(game, "Hill Giant"), toLibrary(game, "Grizzly Bears"), toLibrary(game, "Forest"), toLibrary(game, "Forest")];
    lands(game, "Mountain", 1);
    pickModes(a, 0);
    cast(game, toHand(game, "Lightning Bolt"), { targets: [ref(B)] });
    expect(top.filter((id) => zone(game, id) === "exile")).toHaveLength(3);
  });
});

describe("Zuri, Warrior of Wakanda", () => {
  it("puts a counter on each creature you control for an artifact spell of mana value 4 or more only", () => {
    const { game } = table();
    const zuri = spawn(game, "Zuri, Warrior of Wakanda");
    const bears = spawn(game, "Grizzly Bears");
    const theirs = spawn(game, "Grizzly Bears", B);
    lands(game, "Wastes", 7);
    cast(game, toHand(game, "Mind Stone"));
    expect(counters(game, zuri)).toBe(0);
    cast(game, toHand(game, "Hedron Archive"));
    expect(counters(game, zuri)).toBe(1);
    expect(counters(game, bears)).toBe(1);
    expect(counters(game, theirs)).toBe(0);
  });
});

describe("Iron Man, Tony Stark", () => {
  it("makes a Robot Hero for a red spell, and attacking creatures you control get +1/+0", () => {
    const { game, a } = table();
    const ironMan = spawn(game, "Iron Man, Tony Stark");
    const bears = spawn(game, "Grizzly Bears");
    lands(game, "Mountain", 1);
    cast(game, toHand(game, "Lightning Bolt"), { targets: [ref(B)] });
    expect(tokensNamed(game, "Robot Hero Token", A)).toBe(1);
    a.declareAttackersFn = () => [{ attacker: bears, defender: B }];
    toStep(game, "declare-blockers");
    expect(pt(game, bears)).toEqual({ power: 3, toughness: 2 });
    expect(pt(game, ironMan)).toEqual({ power: 3, toughness: 3 });
  });
});
