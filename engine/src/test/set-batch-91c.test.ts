/**
 * Set walk batch 91, part c (2026-10-16): Murders at Karlov Manor (MKM) and Murders at Karlov Manor Commander (MKC), the rest of the sets.
 * Written on the shared table in `harness.ts`.
 */
import { describe, expect, it } from "vitest";

import type { Action } from "../actions.js";
import type { Game } from "../game.js";
import type { ObjectId, PlayerId } from "../primitives.js";

import {
  A,
  B,
  activate,
  attack,
  blockOffer,
  cast,
  controller,
  counters,
  destroy,
  enter,
  graveyard,
  hand,
  keywords,
  lands,
  life,
  named,
  nextTurn,
  pickFromZone,
  pickModes,
  pickPermanents,
  pickTargets,
  pt,
  quiet,
  ref,
  settle,
  spawn,
  subtypes,
  table,
  toHand,
  toLibrary,
  toStep,
  tokensNamed,
  watchTargets,
  zone,
} from "./harness.js";

const isTapped = (game: Game, id: ObjectId): boolean => game.state.objects[id].tapped === true;
const canCast = (game: Game, card: ObjectId): boolean =>
  game.legalActions(A).some((a) => a.kind === "cast-spell" && a.card === card);
const makeToken = (game: Game, name: string, player: PlayerId = A): void =>
  game.debugApplyEffect(player, { kind: "create-token", token: name, count: 1 });
const tokensOf = (game: Game, name: string, player: PlayerId = A): ObjectId[] =>
  named(game, name, player).filter((id) => game.state.objects[id].isToken === true);
const suspected = (game: Game, id: ObjectId): boolean => game.state.objects[id].suspectedAt !== undefined;
const faceDownCast = (game: Game, card: ObjectId): void => cast(game, card, { via: "face-down" });
const turnUp = (game: Game, permanent: ObjectId): void => {
  game.dispatch({ type: "turn-face-up", player: A, permanent, morph: true } as Action);
  settle(game);
};
const drawOne = (game: Game, player: PlayerId = A): void => {
  game.debugApplyEffect(player, { kind: "draw", amount: 1 });
  settle(game);
};

describe("Exit Specialist", () => {
  it("cast face down, turned up for {1}{U}, returns another target creature to its owner's hand", () => {
    const { game, a } = table();
    const bears = spawn(game, "Grizzly Bears", B);
    const mine = spawn(game, "Savannah Lions");
    lands(game, "Island", 5);
    const card = toHand(game, "Exit Specialist");
    faceDownCast(game, card);
    expect(game.state.objects[card].faceDown?.kind).toBe("disguise");
    const seen = watchTargets(a, () => [bears]);
    turnUp(game, card);
    expect(seen.asked).toBe(1);
    expect([...seen.offered[0]].sort()).toEqual([bears, mine].sort());
    expect(zone(game, bears)).toBe("hand");
    expect(game.state.objects[card].faceDown).toBeUndefined();
  });

  it("can't be blocked by creatures with power 3 or greater", () => {
    const { game, a } = table();
    const specialist = spawn(game, "Exit Specialist");
    const giant = spawn(game, "Hill Giant", B);
    const bears = spawn(game, "Grizzly Bears", B);
    const offer = blockOffer(game, a, [specialist]);
    expect(offer.eligible.find((e) => e.blocker === giant)?.canBlock ?? []).not.toContain(specialist);
    expect(offer.eligible.find((e) => e.blocker === bears)?.canBlock).toContain(specialist);
  });
});

describe("Ezrim, Agency Chief", () => {
  it("investigates twice as it enters, and sacrifices an artifact for the chosen keyword", () => {
    const { game, a } = table();
    const ezrim = enter(game, "Ezrim, Agency Chief");
    const clues = tokensOf(game, "Clue Token");
    expect(tokensNamed(game, "Clue Token", A)).toBe(2);
    lands(game, "Plains", 1);
    pickModes(a, 2);
    game.dispatch({
      type: "activate-ability",
      player: A,
      source: ezrim,
      abilityIndex: 0,
      targets: [],
      sacrifice: clues[0],
    } as Action);
    settle(game);
    expect(tokensNamed(game, "Clue Token", A)).toBe(1);
    expect(keywords(game, ezrim).has("hexproof")).toBe(true);
    expect(keywords(game, ezrim).has("lifelink")).toBe(false);
    expect(keywords(game, ezrim).has("vigilance")).toBe(false);
  });
});

describe("Rope", () => {
  it("gives +1/+2 and reach, and the equipped creature can be blocked by at most one creature", () => {
    const { game, a } = table();
    const rope = spawn(game, "Rope");
    const bears = spawn(game, "Grizzly Bears");
    spawn(game, "Hill Giant", B);
    spawn(game, "Savannah Lions", B);
    lands(game, "Forest", 3);
    activate(game, rope, 1, { targets: [ref(bears)] });
    expect(pt(game, bears)).toEqual({ power: 3, toughness: 4 });
    expect(keywords(game, bears).has("reach")).toBe(true);
    const offer = blockOffer(game, a, [bears]);
    expect(offer.singleBlockerAttackers).toContain(bears);
  });

  it("is a Clue: {2}, sacrifice it, draw a card", () => {
    const { game } = table();
    const rope = spawn(game, "Rope");
    lands(game, "Forest", 2);
    const before = hand(game).length;
    activate(game, rope, 0);
    expect(zone(game, rope)).toBe("graveyard");
    expect(hand(game)).toHaveLength(before + 1);
  });
});

describe("Homicide Investigator", () => {
  it("investigates once when nontoken creatures you control die, only once each turn", () => {
    const { game } = table();
    spawn(game, "Homicide Investigator");
    spawn(game, "Grizzly Bears");
    spawn(game, "Grizzly Bears");
    const giant = spawn(game, "Hill Giant");
    game.debugApplyEffect(B, { kind: "destroy-all", filter: { subtype: "Bear" } });
    settle(game);
    expect(tokensNamed(game, "Clue Token", A)).toBe(1);
    destroy(game, giant);
    expect(tokensNamed(game, "Clue Token", A)).toBe(1);
  });

  it("ignores a token dying and an opponent's creature, and sees its own death", () => {
    const { game } = table();
    const investigator = spawn(game, "Homicide Investigator");
    makeToken(game, "Thopter Token");
    const [thopter] = tokensOf(game, "Thopter Token");
    destroy(game, thopter);
    destroy(game, spawn(game, "Grizzly Bears", B));
    expect(tokensNamed(game, "Clue Token", A)).toBe(0);
    destroy(game, investigator);
    expect(tokensNamed(game, "Clue Token", A)).toBe(1);
  });
});

describe("Greenbelt Radical", () => {
  it("turned face up: a +1/+1 counter on each creature you control, and they gain trample", () => {
    const { game } = table();
    const bears = spawn(game, "Grizzly Bears");
    const theirs = spawn(game, "Hill Giant", B);
    lands(game, "Forest", 10);
    const radical = toHand(game, "Greenbelt Radical");
    faceDownCast(game, radical);
    turnUp(game, radical);
    expect(pt(game, radical)).toEqual({ power: 5, toughness: 5 });
    expect(pt(game, bears)).toEqual({ power: 3, toughness: 3 });
    expect(keywords(game, bears).has("trample")).toBe(true);
    expect(keywords(game, radical).has("trample")).toBe(true);
    expect(counters(game, theirs)).toBe(0);
    expect(keywords(game, theirs).has("trample")).toBe(false);
    nextTurn(game);
    expect(keywords(game, bears).has("trample")).toBe(false);
    expect(counters(game, bears)).toBe(1);
  });
});

describe("Undercity Eliminator", () => {
  it("may sacrifice an artifact to exile a creature an opponent controls", () => {
    const { game, a } = table();
    const ring = spawn(game, "Sol Ring");
    const giant = spawn(game, "Hill Giant", B);
    pickModes(a, 0);
    a.chooseSacrificesFn = (_view, eligible) => {
      expect(eligible).toContain(ring);
      return [ring];
    };
    pickTargets(a, giant);
    enter(game, "Undercity Eliminator");
    expect(zone(game, ring)).toBe("graveyard");
    expect(zone(game, giant)).toBe("exile");
  });

  it("exiles nothing when you decline", () => {
    const { game, a } = table();
    const bears = spawn(game, "Grizzly Bears");
    const giant = spawn(game, "Hill Giant", B);
    pickModes(a);
    enter(game, "Undercity Eliminator");
    expect(zone(game, bears)).toBe("battlefield");
    expect(zone(game, giant)).toBe("battlefield");
  });
});

describe("Macabre Reconstruction", () => {
  it("costs {2} less once a creature card was put into your graveyard this turn, and returns up to two", () => {
    const { game } = table();
    lands(game, "Swamp", 2);
    const card = toHand(game, "Macabre Reconstruction");
    expect(canCast(game, card)).toBe(false);
    // A token creature dying isn't a creature card.
    makeToken(game, "Thopter Token");
    destroy(game, tokensOf(game, "Thopter Token")[0]);
    expect(canCast(game, card)).toBe(false);
    const milled = toLibrary(game, "Grizzly Bears");
    game.debugApplyEffect(A, { kind: "mill", target: "you", amount: 1 });
    settle(game);
    expect(zone(game, milled)).toBe("graveyard");
    expect(canCast(game, card)).toBe(true);
    const giant = game.debugSpawn("Hill Giant", A, "graveyard");
    cast(game, card, { targets: [ref(milled), ref(giant)] });
    expect(zone(game, milled)).toBe("hand");
    expect(zone(game, giant)).toBe("hand");
  });
});

describe("Harried Dronesmith", () => {
  it("makes a hasty Thopter at the beginning of combat, sacrificed at your end step", () => {
    const { game } = table();
    spawn(game, "Harried Dronesmith");
    toStep(game, "begin-combat");
    settle(game);
    const [thopter] = tokensOf(game, "Thopter Token");
    expect(thopter).toBeDefined();
    expect(keywords(game, thopter).has("haste")).toBe(true);
    toStep(game, "postcombat-main");
    expect(tokensNamed(game, "Thopter Token", A)).toBe(1);
    toStep(game, "end");
    settle(game);
    expect(tokensNamed(game, "Thopter Token", A)).toBe(0);
  });
});

describe("Tunnel Tipster", () => {
  it("grows at your end step after a face-down creature entered, even one turned face up since", () => {
    const { game } = table();
    const tipster = spawn(game, "Tunnel Tipster");
    lands(game, "Swamp", 5);
    const brute = toHand(game, "Hunted Bonebrute");
    faceDownCast(game, brute);
    turnUp(game, brute);
    toStep(game, "end");
    settle(game);
    expect(counters(game, tipster)).toBe(1);
  });

  it("doesn't grow when only face-up creatures entered", () => {
    const { game } = table();
    const tipster = spawn(game, "Tunnel Tipster");
    enter(game, "Grizzly Bears");
    toStep(game, "end");
    settle(game);
    expect(counters(game, tipster)).toBe(0);
  });

  it("taps for {G}", () => {
    const { game } = table();
    const tipster = spawn(game, "Tunnel Tipster");
    activate(game, tipster, 0);
    expect(game.state.players[A].manaPool.map((u) => u.type)).toEqual(["G"]);
  });
});

describe("Unyielding Gatekeeper", () => {
  const faceUp = (game: Game): ObjectId => {
    lands(game, "Plains", 5);
    const gatekeeper = toHand(game, "Unyielding Gatekeeper");
    faceDownCast(game, gatekeeper);
    return gatekeeper;
  };

  it("blinks a permanent you controlled back tapped, with no Detective", () => {
    const { game, a } = table();
    const bears = spawn(game, "Grizzly Bears");
    const gatekeeper = faceUp(game);
    pickTargets(a, bears);
    turnUp(game, gatekeeper);
    const [back] = named(game, "Grizzly Bears", A);
    expect(back).toBeDefined();
    expect(isTapped(game, back)).toBe(true);
    expect(tokensNamed(game, "Detective Token")).toBe(0);
  });

  it("exiles an opponent's permanent for good, and its controller creates a Detective", () => {
    const { game, a } = table();
    const giant = spawn(game, "Hill Giant", B);
    const gatekeeper = faceUp(game);
    pickTargets(a, giant);
    turnUp(game, gatekeeper);
    expect(zone(game, giant)).toBe("exile");
    expect(tokensNamed(game, "Detective Token", B)).toBe(1);
    expect(tokensNamed(game, "Detective Token", A)).toBe(0);
    const [detective] = tokensOf(game, "Detective Token", B);
    expect(pt(game, detective)).toEqual({ power: 2, toughness: 2 });
    expect(subtypes(game, detective)).toContain("Detective");
  });
});

describe("Makeshift Binding", () => {
  it("exiles a creature an opponent controls until it leaves, and gains 2 life", () => {
    const { game, a } = table();
    const giant = spawn(game, "Hill Giant", B);
    pickTargets(a, giant);
    const binding = enter(game, "Makeshift Binding");
    expect(zone(game, giant)).toBe("exile");
    expect(life(game)).toBe(22);
    destroy(game, binding);
    expect(named(game, "Hill Giant", B)).toHaveLength(1);
  });

  it("gone before its trigger resolves: nothing is exiled, but the life is gained", () => {
    const { game, a } = table();
    const giant = spawn(game, "Hill Giant", B);
    pickTargets(a, giant);
    const binding = enter(game, "Makeshift Binding", A, { settle: false });
    game.debugApplyEffect(B, { kind: "destroy", target: 0 }, [ref(binding)]);
    settle(game);
    expect(zone(game, binding)).toBe("graveyard");
    expect(zone(game, giant)).toBe("battlefield");
    expect(life(game)).toBe(22);
  });
});

describe("Vengeful Creeper", () => {
  it("turned face up, destroys an artifact or enchantment an opponent controls", () => {
    const { game, a } = table();
    const theirs = spawn(game, "Sol Ring", B);
    const other = spawn(game, "Mind Stone", B);
    spawn(game, "Mind Stone");
    spawn(game, "Grizzly Bears", B);
    lands(game, "Forest", 9);
    const creeper = toHand(game, "Vengeful Creeper");
    faceDownCast(game, creeper);
    const seen = watchTargets(a, () => [theirs]);
    turnUp(game, creeper);
    expect([...seen.offered[0]].sort()).toEqual([theirs, other].sort());
    expect(zone(game, theirs)).toBe("graveyard");
    expect(pt(game, creeper)).toEqual({ power: 5, toughness: 5 });
  });
});

describe("Reasonable Doubt", () => {
  it("counters a spell whose controller doesn't pay {2}, and suspects up to one creature", () => {
    const { game } = table();
    const giant = spawn(game, "Hill Giant", B);
    lands(game, "Forest", 2);
    lands(game, "Island", 2);
    const bears = toHand(game, "Grizzly Bears");
    cast(game, bears, { settle: false });
    cast(game, toHand(game, "Reasonable Doubt"), { targets: [ref(bears), ref(giant)] });
    expect(zone(game, bears)).toBe("graveyard");
    expect(suspected(game, giant)).toBe(true);
    expect(keywords(game, giant).has("menace")).toBe(true);
  });

  it("can leave the creature slot empty", () => {
    const { game } = table();
    lands(game, "Forest", 2);
    lands(game, "Island", 2);
    const bears = toHand(game, "Grizzly Bears");
    cast(game, bears, { settle: false });
    cast(game, toHand(game, "Reasonable Doubt"), { targets: [ref(bears), null] });
    expect(zone(game, bears)).toBe("graveyard");
  });
});

describe("Steamcore Scholar", () => {
  it("draws two, then discards a creature card with flying instead of two cards", () => {
    const { game, a } = table();
    const angel = toHand(game, "Serra Angel");
    const before = hand(game).length;
    a.chooseDiscardsFn = () => [angel];
    enter(game, "Steamcore Scholar");
    expect(hand(game)).toHaveLength(before + 2 - 1);
    expect(zone(game, angel)).toBe("graveyard");
  });

  it("offers an instant, a sorcery or a flier as the one card, never a creature without flying", () => {
    const { game } = table();
    const angel = toHand(game, "Serra Angel");
    const opt = toHand(game, "Opt");
    const divination = toHand(game, "Divination");
    const bears = toHand(game, "Grizzly Bears");
    enter(game, "Steamcore Scholar", A, { settle: false });
    game.advanceUntil((s) => s.awaiting !== null || quiet(s));
    const awaiting = game.state.awaiting;
    expect(awaiting?.kind).toBe("discard");
    if (awaiting?.kind !== "discard") return;
    expect(awaiting.orOneOf).toEqual(expect.arrayContaining([angel, opt, divination]));
    expect(awaiting.orOneOf?.includes(bears)).toBe(false);
  });
});

describe("Cerebral Confiscation", () => {
  it("first mode: target opponent discards two cards", () => {
    const { game } = table();
    lands(game, "Swamp", 3);
    const before = hand(game, B).length;
    cast(game, toHand(game, "Cerebral Confiscation"), { modes: [0], targets: [ref(B)] });
    expect(hand(game, B)).toHaveLength(before - 2);
  });

  it("second mode: you choose a nonland card from their revealed hand", () => {
    const { game, a } = table();
    lands(game, "Swamp", 3);
    const bolt = toHand(game, "Lightning Bolt", B);
    const seen = pickFromZone(a, bolt);
    cast(game, toHand(game, "Cerebral Confiscation"), { modes: [1], targets: [ref(B)] });
    expect(seen.offered).toEqual([bolt]);
    expect(zone(game, bolt)).toBe("graveyard");
  });
});

describe("Torch the Witness", () => {
  it("deals twice X, and investigates on excess damage", () => {
    const { game } = table();
    const giant = spawn(game, "Hill Giant", B);
    lands(game, "Mountain", 3);
    cast(game, toHand(game, "Torch the Witness"), { x: 2, targets: [ref(giant)] });
    expect(zone(game, giant)).toBe("graveyard");
    expect(tokensNamed(game, "Clue Token", A)).toBe(1);
  });

  it("no excess, no Clue", () => {
    const { game } = table();
    const bears = spawn(game, "Grizzly Bears", B);
    lands(game, "Mountain", 2);
    cast(game, toHand(game, "Torch the Witness"), { x: 1, targets: [ref(bears)] });
    expect(zone(game, bears)).toBe("graveyard");
    expect(tokensNamed(game, "Clue Token", A)).toBe(0);
  });
});

describe("Sharp-Eyed Rookie", () => {
  it("grows and investigates when a bigger creature enters, by power or by toughness", () => {
    const { game } = table();
    const rookie = spawn(game, "Sharp-Eyed Rookie");
    enter(game, "Hill Giant");
    expect(counters(game, rookie)).toBe(1);
    expect(tokensNamed(game, "Clue Token", A)).toBe(1);
    // Now a 3/3: a 2/2 isn't bigger; a 1/4 is, by toughness.
    enter(game, "Grizzly Bears");
    expect(counters(game, rookie)).toBe(1);
    enter(game, "Horned Turtle");
    expect(counters(game, rookie)).toBe(2);
    expect(tokensNamed(game, "Clue Token", A)).toBe(2);
  });

  it("an opponent's creature doesn't count", () => {
    const { game } = table();
    const rookie = spawn(game, "Sharp-Eyed Rookie");
    enter(game, "Hill Giant", B);
    expect(counters(game, rookie)).toBe(0);
  });
});

describe("Neighborhood Guardian", () => {
  it("another creature you control with power 2 or less entering pumps a creature you control", () => {
    const { game, a } = table();
    const guardian = spawn(game, "Neighborhood Guardian");
    pickTargets(a, guardian);
    enter(game, "Savannah Lions");
    expect(pt(game, guardian)).toEqual({ power: 3, toughness: 3 });
    enter(game, "Hill Giant");
    expect(pt(game, guardian)).toEqual({ power: 3, toughness: 3 });
    enter(game, "Savannah Lions", B);
    expect(pt(game, guardian)).toEqual({ power: 3, toughness: 3 });
  });
});

describe("Kraul Whipcracker", () => {
  it("destroys a token an opponent controls, never a nontoken or your own", () => {
    const { game, a } = table();
    makeToken(game, "Thopter Token", B);
    makeToken(game, "Clue Token", B);
    makeToken(game, "Thopter Token", A);
    const [theirs] = tokensOf(game, "Thopter Token", B);
    const [clue] = tokensOf(game, "Clue Token", B);
    const bears = spawn(game, "Grizzly Bears", B);
    const seen = watchTargets(a, () => [theirs]);
    enter(game, "Kraul Whipcracker");
    expect([...seen.offered[0]].sort()).toEqual([theirs, clue].sort());
    expect(tokensNamed(game, "Thopter Token", B)).toBe(0);
    expect(tokensNamed(game, "Clue Token", B)).toBe(1);
    expect(tokensNamed(game, "Thopter Token", A)).toBe(1);
    expect(zone(game, bears)).toBe("battlefield");
  });
});

describe("Krovod Haunch", () => {
  it("equips for +2/+0, and sacrificed as a Food gains 3 life and may pay {1}{W} for two Dogs", () => {
    const { game, a } = table();
    const haunch = spawn(game, "Krovod Haunch");
    const bears = spawn(game, "Grizzly Bears");
    lands(game, "Plains", 6);
    activate(game, haunch, 1, { targets: [ref(bears)] });
    expect(pt(game, bears)).toEqual({ power: 4, toughness: 2 });
    pickModes(a, 0);
    activate(game, haunch, 0);
    expect(life(game)).toBe(23);
    expect(tokensNamed(game, "1/1 White Dog Token", A)).toBe(2);
  });

  it("makes no Dogs when you decline to pay", () => {
    const { game, a } = table();
    const haunch = spawn(game, "Krovod Haunch");
    lands(game, "Plains", 2);
    pickModes(a);
    destroy(game, haunch);
    expect(tokensNamed(game, "1/1 White Dog Token", A)).toBe(0);
  });
});

describe("Caught Red-Handed", () => {
  it("steals, untaps and hastes a creature, which stays suspected after control returns", () => {
    const { game } = table();
    const giant = spawn(game, "Hill Giant", B, { tapped: true });
    lands(game, "Mountain", 5);
    cast(game, toHand(game, "Caught Red-Handed"), { targets: [ref(giant)] });
    expect(controller(game, giant)).toBe(A);
    expect(isTapped(game, giant)).toBe(false);
    expect(keywords(game, giant).has("haste")).toBe(true);
    expect(suspected(game, giant)).toBe(true);
    nextTurn(game);
    expect(controller(game, giant)).toBe(B);
    expect(suspected(game, giant)).toBe(true);
    expect(keywords(game, giant).has("menace")).toBe(true);
  });

  it("can't be countered", () => {
    const { game } = table();
    const card = toHand(game, "Caught Red-Handed");
    expect(game.registry.get(game.state.objects[card].cardName).cantBeCountered).toBe(true);
  });
});

describe("Drag the Canal", () => {
  it("only a Detective when no creature died this turn", () => {
    const { game } = table();
    lands(game, "Island", 1);
    lands(game, "Swamp", 1);
    cast(game, toHand(game, "Drag the Canal"));
    expect(tokensNamed(game, "Detective Token", A)).toBe(1);
    expect(tokensNamed(game, "Clue Token", A)).toBe(0);
    expect(life(game)).toBe(20);
  });

  it("after a creature died: 2 life, surveil 2 and a Clue too", () => {
    const { game, a } = table();
    destroy(game, spawn(game, "Grizzly Bears", B));
    lands(game, "Island", 1);
    lands(game, "Swamp", 1);
    const second = toLibrary(game, "Hill Giant");
    const top = toLibrary(game, "Grizzly Bears");
    let surveilled: readonly ObjectId[] = [];
    a.chooseScryFn = (_view, cards) => {
      surveilled = cards;
      return [...cards];
    };
    cast(game, toHand(game, "Drag the Canal"));
    expect([...surveilled].sort()).toEqual([top, second].sort());
    expect(graveyard(game)).toEqual(expect.arrayContaining([top, second]));
    expect(tokensNamed(game, "Detective Token", A)).toBe(1);
    expect(tokensNamed(game, "Clue Token", A)).toBe(1);
    expect(life(game)).toBe(22);
  });
});

describe("Galvanize", () => {
  it("3 damage, or 5 once you've drawn two cards this turn", () => {
    const { game } = table();
    const wurm = spawn(game, "Craw Wurm", B);
    lands(game, "Mountain", 4);
    // The draw step's card is the first this turn.
    cast(game, toHand(game, "Galvanize"), { targets: [ref(wurm)] });
    expect(zone(game, wurm)).toBe("battlefield");
    expect(game.state.objects[wurm].damageMarked).toBe(3);
    const second = spawn(game, "Craw Wurm", B);
    drawOne(game);
    cast(game, toHand(game, "Galvanize"), { targets: [ref(second)] });
    expect(zone(game, second)).toBe("graveyard");
  });
});

describe("Coerced to Kill", () => {
  it("takes the creature, which is a 1/1 deathtouch Assassin, counters still counting", () => {
    const { game } = table();
    const wurm = spawn(game, "Craw Wurm", B);
    lands(game, "Island", 3);
    lands(game, "Swamp", 2);
    cast(game, toHand(game, "Coerced to Kill"), { targets: [ref(wurm)] });
    expect(controller(game, wurm)).toBe(A);
    expect(pt(game, wurm)).toEqual({ power: 1, toughness: 1 });
    expect(keywords(game, wurm).has("deathtouch")).toBe(true);
    expect(subtypes(game, wurm)).toEqual(expect.arrayContaining(["Wurm", "Assassin"]));
    game.debugApplyEffect(A, { kind: "add-counter", target: 0, counter: "+1/+1", amount: 1 }, [ref(wurm)]);
    expect(pt(game, wurm)).toEqual({ power: 2, toughness: 2 });
  });
});

describe("Sanctuary Wall", () => {
  it("taps a creature, and may stun both it and itself", () => {
    const { game, a } = table();
    const wall = spawn(game, "Sanctuary Wall");
    const giant = spawn(game, "Hill Giant", B);
    lands(game, "Plains", 3);
    pickModes(a, 0);
    activate(game, wall, 0, { targets: [ref(giant)] });
    expect(isTapped(game, giant)).toBe(true);
    expect(counters(game, giant, "stun")).toBe(1);
    expect(counters(game, wall, "stun")).toBe(1);
  });

  it("declining the stun counter puts none on either", () => {
    const { game, a } = table();
    const wall = spawn(game, "Sanctuary Wall");
    const giant = spawn(game, "Hill Giant", B);
    lands(game, "Plains", 3);
    pickModes(a);
    activate(game, wall, 0, { targets: [ref(giant)] });
    expect(isTapped(game, giant)).toBe(true);
    expect(counters(game, giant, "stun")).toBe(0);
    expect(counters(game, wall, "stun")).toBe(0);
  });
});

describe("Kylox, Visionary Inventor", () => {
  it("attacking, sacrifices other creatures, exiles their total power and casts instants and sorceries free", () => {
    const { game, a } = table();
    const kylox = spawn(game, "Kylox, Visionary Inventor");
    const bears = spawn(game, "Grizzly Bears");
    const giant = spawn(game, "Hill Giant");
    const exiled = ["Grizzly Bears", "Lightning Bolt", "Wastes", "Craw Wurm", "Wastes"].map((n) => toLibrary(game, n));
    const below = toLibrary(game, "Opt");
    // toLibrary puts each on top: move `below` under the five.
    const library = game.state.zones.perPlayer[A].library;
    library.splice(library.indexOf(below), 1);
    library.splice(library.length - 5, 0, below);
    const chosen = pickPermanents(a, bears, giant);
    const bolt = exiled[1];
    let offers = 0;
    a.chooseCastNowFn = (_view, offer) => {
      offers += 1;
      if (offers > 1) return null;
      expect(offer.casts.map((c) => c.card)).toEqual([bolt]);
      const way = offer.casts.find((c) => c.card === bolt)!;
      return { type: "cast-spell", player: A, card: bolt, targets: [ref(B)], via: way.via, ...(offer.free ? { free: true } : {}) };
    };
    attack(game, a, [kylox]);
    expect(chosen.offered).not.toContain(kylox);
    expect(zone(game, bears)).toBe("graveyard");
    expect(zone(game, giant)).toBe("graveyard");
    for (const id of exiled) if (id !== bolt) expect(zone(game, id)).toBe("exile");
    expect(zone(game, below)).toBe("library");
    expect(zone(game, bolt)).toBe("graveyard");
    expect(life(game, B)).toBe(20 - 3 - 4);
  });
});

describe("Private Eye", () => {
  it("pumps other Detectives, and the second card drawn makes a Detective unblockable", () => {
    const { game, a } = table();
    const eye = spawn(game, "Private Eye");
    const investigator = spawn(game, "Homicide Investigator");
    const bears = spawn(game, "Grizzly Bears");
    expect(pt(game, eye)).toEqual({ power: 3, toughness: 3 });
    expect(pt(game, investigator)).toEqual({ power: 3, toughness: 3 });
    expect(pt(game, bears)).toEqual({ power: 2, toughness: 2 });
    const seen = watchTargets(a, () => [investigator]);
    // The draw step's card was the first this turn.
    drawOne(game);
    expect(seen.offered[0]).toEqual(expect.arrayContaining([eye, investigator]));
    expect(seen.offered[0]).not.toContain(bears);
    expect(keywords(game, investigator).has("unblockable")).toBe(true);
    drawOne(game);
    expect(seen.asked).toBe(1);
  });
});

describe("Knife", () => {
  it("during your turn only, equipped creature gets +1/+0 and first strike", () => {
    const { game } = table();
    const knife = spawn(game, "Knife");
    const bears = spawn(game, "Grizzly Bears");
    lands(game, "Mountain", 2);
    activate(game, knife, 1, { targets: [ref(bears)] });
    expect(pt(game, bears)).toEqual({ power: 3, toughness: 2 });
    expect(keywords(game, bears).has("first-strike")).toBe(true);
    nextTurn(game);
    expect(pt(game, bears)).toEqual({ power: 2, toughness: 2 });
    expect(keywords(game, bears).has("first-strike")).toBe(false);
  });
});
