/**
 * Set walk batch 91, part f (2026-10-16): the collect evidence and Case cards of Murders at Karlov Manor (MKM, MKC), and older Cases.
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
  enter,
  hand,
  keywords,
  lands,
  life,
  named,
  nextTurn,
  pickFromZone,
  pickTargets,
  pt,
  ref,
  settle,
  spawn,
  subtypes,
  table,
  toGraveyard,
  toHand,
  toLibrary,
  toStep,
  tokensNamed,
  types,
  zone,
} from "./harness.js";

const solved = (game: Game, id: ObjectId): boolean => game.state.objects[id].solved === true;
/** On to alice's end step, its triggers resolved. */
const endStep = (game: Game): void => {
  toStep(game, "end");
  settle(game);
};
/** From alice's end step to her next turn's precombat main. */
const aliceAgain = (game: Game): void => {
  nextTurn(game);
  nextTurn(game);
};
const kickedOffers = (game: Game, card: ObjectId) =>
  game.legalActions(A).filter((l) => l.kind === "cast-spell" && l.card === card && l.kicked === true);
const SPIDER = "2/1 Black Green Spider Token (Menace, Reach)";

describe("Case of the Shifting Visage", () => {
  it("solves at fifteen cards in the graveyard, not fourteen", () => {
    const { game } = table();
    const visage = spawn(game, "Case of the Shifting Visage");
    for (let i = 0; i < 14; i++) toGraveyard(game, "Wastes");
    endStep(game);
    expect(solved(game, visage)).toBe(false);
    toGraveyard(game, "Wastes");
    aliceAgain(game);
    endStep(game);
    expect(solved(game, visage)).toBe(true);
  });

  it("solved, copies a nonlegendary creature spell (the copy is a token), not a legendary one", () => {
    const { game, a } = table();
    const visage = spawn(game, "Case of the Shifting Visage");
    lands(game, "Forest", 2);
    lands(game, "Plains", 2);
    // Unsolved: no copy.
    cast(game, toHand(game, "Grizzly Bears"));
    expect(named(game, "Grizzly Bears", A)).toHaveLength(1);
    for (let i = 0; i < 15; i++) toGraveyard(game, "Wastes");
    endStep(game);
    expect(solved(game, visage)).toBe(true);
    aliceAgain(game);
    cast(game, toHand(game, "Grizzly Bears"));
    expect(named(game, "Grizzly Bears", A)).toHaveLength(3);
    expect(tokensNamed(game, "Grizzly Bears", A)).toBe(1);
    // A copy of Isamaru would meet the legend rule; keeping the copy would
    // put the card itself into the graveyard.
    const isamaru = toHand(game, "Isamaru, Hound of Konda");
    a.chooseLegendToKeepFn = (_view, _name, options) => options.find((id) => id !== isamaru) ?? options[0];
    cast(game, isamaru);
    expect(zone(game, isamaru)).toBe("battlefield");
    expect(tokensNamed(game, "Isamaru, Hound of Konda")).toBe(0);
  });
});

describe("Analyze the Pollen", () => {
  it("without evidence, only a basic land card", () => {
    const { game, a } = table();
    lands(game, "Forest", 1);
    const bears = toLibrary(game, "Grizzly Bears");
    const forest = toLibrary(game, "Forest");
    const seen = pickFromZone(a, forest);
    cast(game, toHand(game, "Analyze the Pollen"));
    expect(seen.offered).toContain(forest);
    expect(seen.offered).not.toContain(bears);
    expect(zone(game, forest)).toBe("hand");
  });

  it("collecting evidence 8 (offered only with 8 mana value in the graveyard) finds a creature or any land", () => {
    const { game, a } = table();
    lands(game, "Forest", 1);
    const bears = toLibrary(game, "Grizzly Bears");
    const pollen = toHand(game, "Analyze the Pollen");
    const giants = [toGraveyard(game, "Hill Giant")];
    expect(kickedOffers(game, pollen)).toHaveLength(0);
    giants.push(toGraveyard(game, "Hill Giant"));
    expect(kickedOffers(game, pollen)).toHaveLength(1);
    let searched: readonly ObjectId[] = [];
    a.chooseFromZoneFn = (_view, eligible) => {
      if (eligible.includes(giants[0])) return giants;
      searched = eligible;
      return [bears];
    };
    cast(game, pollen, { kicked: true });
    expect(giants.map((id) => zone(game, id))).toEqual(["exile", "exile"]);
    expect(searched).toContain(bears);
    expect(zone(game, bears)).toBe("hand");
  });
});

describe("Extract a Confession", () => {
  it("without evidence, each opponent sacrifices a creature of their choice", () => {
    const { game, b } = table();
    lands(game, "Swamp", 2);
    const bears = spawn(game, "Grizzly Bears", B);
    const giant = spawn(game, "Hill Giant", B);
    b.chooseSacrificesFn = (_view, eligible) => (eligible.includes(bears) ? [bears] : [eligible[0]]);
    cast(game, toHand(game, "Extract a Confession"));
    expect(zone(game, bears)).toBe("graveyard");
    expect(zone(game, giant)).toBe("battlefield");
  });

  it("with evidence, the one with the greatest power", () => {
    const { game, a, b } = table();
    lands(game, "Swamp", 2);
    const bears = spawn(game, "Grizzly Bears", B);
    const giant = spawn(game, "Hill Giant", B);
    const evidence = [toGraveyard(game, "Hill Giant"), toGraveyard(game, "Grizzly Bears")];
    pickFromZone(a, ...evidence);
    b.chooseSacrificesFn = (_view, eligible) => (eligible.includes(bears) ? [bears] : [eligible[0]]);
    cast(game, toHand(game, "Extract a Confession"), { kicked: true });
    expect(evidence.map((id) => zone(game, id))).toEqual(["exile", "exile"]);
    expect(zone(game, giant)).toBe("graveyard");
    expect(zone(game, bears)).toBe("battlefield");
  });
});

describe("Behind the Mask", () => {
  it("a creature becomes a base 4/3 artifact creature until end of turn, counters still on top", () => {
    const { game } = table();
    lands(game, "Island", 1);
    const bears = spawn(game, "Grizzly Bears");
    game.state.objects[bears].counters["+1/+1"] = 1;
    cast(game, toHand(game, "Behind the Mask"), { targets: [ref(bears)] });
    expect(pt(game, bears)).toEqual({ power: 5, toughness: 4 });
    expect(types(game, bears)).toEqual(expect.arrayContaining(["artifact", "creature"]));
    nextTurn(game);
    expect(pt(game, bears)).toEqual({ power: 3, toughness: 3 });
    expect(types(game, bears)).not.toContain("artifact");
  });

  it("with evidence, a noncreature artifact becomes a 1/1 artifact creature instead", () => {
    const { game, a } = table();
    lands(game, "Island", 1);
    const stone = spawn(game, "Mind Stone");
    const evidence = [toGraveyard(game, "Hill Giant"), toGraveyard(game, "Grizzly Bears")];
    pickFromZone(a, ...evidence);
    cast(game, toHand(game, "Behind the Mask"), { kicked: true, targets: [ref(stone)] });
    expect(evidence.map((id) => zone(game, id))).toEqual(["exile", "exile"]);
    expect(pt(game, stone)).toEqual({ power: 1, toughness: 1 });
    expect(types(game, stone)).toEqual(expect.arrayContaining(["artifact", "creature"]));
  });
});

describe("Case of the Trampled Garden", () => {
  it("enters: one counter on each of two targets, or both on one", () => {
    const { game, a } = table();
    const bears = spawn(game, "Grizzly Bears");
    const lions = spawn(game, "Savannah Lions");
    pickTargets(a, bears, lions);
    enter(game, "Case of the Trampled Garden");
    expect([counters(game, bears), counters(game, lions)]).toEqual([1, 1]);
    pickTargets(a, lions, null);
    enter(game, "Case of the Trampled Garden");
    expect([counters(game, bears), counters(game, lions)]).toEqual([1, 3]);
  });

  it("solves at total power 8, not 7", () => {
    const { game, a } = table();
    const giant = spawn(game, "Hill Giant");
    const bears = spawn(game, "Grizzly Bears");
    pickTargets(a, giant, null);
    const garden = enter(game, "Case of the Trampled Garden"); // 5 + 2 = 7
    endStep(game);
    expect(solved(game, garden)).toBe(false);
    game.state.objects[bears].counters["+1/+1"] = 1; // 8
    aliceAgain(game);
    endStep(game);
    expect(solved(game, garden)).toBe(true);
  });

  it("solved: whenever you attack, a counter and trample for an attacking creature", () => {
    const { game, a } = table();
    const giants = [spawn(game, "Hill Giant"), spawn(game, "Hill Giant")];
    pickTargets(a, giants[0], giants[1]);
    const garden = enter(game, "Case of the Trampled Garden"); // 4 + 4
    // Unsolved, attacking does nothing.
    attack(game, a, [giants[0]]);
    expect(counters(game, giants[0])).toBe(1);
    endStep(game);
    expect(solved(game, garden)).toBe(true);
    aliceAgain(game);
    attack(game, a, [giants[0]]);
    expect(counters(game, giants[0])).toBe(2);
    expect(keywords(game, giants[0]).has("trample")).toBe(true);
    nextTurn(game);
    expect(keywords(game, giants[0]).has("trample")).toBe(false);
  });
});

describe("Case of the Shattered Pact", () => {
  it("enters: a basic land card to hand", () => {
    const { game, a } = table();
    const forest = toLibrary(game, "Forest");
    pickFromZone(a, forest);
    enter(game, "Case of the Shattered Pact");
    expect(zone(game, forest)).toBe("hand");
  });

  it("solves with all five colors among your permanents; solved, a creature gains flying, double strike and vigilance at combat", () => {
    const { game, a } = table();
    const pact = spawn(game, "Case of the Shattered Pact");
    const lions = spawn(game, "Savannah Lions");
    spawn(game, "Coral Merfolk");
    spawn(game, "Drudge Skeletons");
    spawn(game, "Hill Giant");
    spawn(game, "Grizzly Bears", B); // an opponent's green doesn't count
    pickTargets(a, lions);
    toStep(game, "postcombat-main");
    expect(keywords(game, lions).has("flying")).toBe(false);
    endStep(game);
    expect(solved(game, pact)).toBe(false);
    spawn(game, "Grizzly Bears");
    aliceAgain(game);
    endStep(game);
    expect(solved(game, pact)).toBe(true);
    aliceAgain(game);
    toStep(game, "postcombat-main");
    for (const k of ["flying", "double-strike", "vigilance"]) expect(keywords(game, lions).has(k)).toBe(true);
  });
});

describe("Case of the Filched Falcon", () => {
  it("investigates; solved with three artifacts, makes a noncreature artifact a 4/4 flying Bird for good", () => {
    const { game } = table();
    lands(game, "Island", 3);
    const falcon = enter(game, "Case of the Filched Falcon");
    expect(tokensNamed(game, "Clue Token", A)).toBe(1);
    const stone = spawn(game, "Mind Stone");
    const thopter = spawn(game, "Ornithopter");
    const offers = () =>
      game.legalActions(A).filter((l) => l.kind === "activate-ability" && l.source === falcon);
    expect(offers()).toHaveLength(0);
    endStep(game);
    expect(solved(game, falcon)).toBe(true);
    aliceAgain(game);
    const [offer] = offers();
    // A noncreature artifact: the Clue or Mind Stone, not Ornithopter.
    const options = offer.kind === "activate-ability" ? (offer.targetOptions?.[0] ?? []) : [];
    expect(options).toContainEqual(ref(stone));
    expect(options).not.toContainEqual(ref(thopter));
    activate(game, falcon, 0, { targets: [ref(stone)] });
    expect(zone(game, falcon)).toBe("graveyard");
    expect(counters(game, stone)).toBe(4);
    expect(pt(game, stone)).toEqual({ power: 4, toughness: 4 });
    expect(types(game, stone)).toEqual(expect.arrayContaining(["artifact", "creature"]));
    expect(subtypes(game, stone)).toContain("Bird");
    expect(keywords(game, stone).has("flying")).toBe(true);
    nextTurn(game);
    expect(pt(game, stone)).toEqual({ power: 4, toughness: 4 });
  });

  it("isn't solved with two artifacts", () => {
    const { game } = table();
    const falcon = enter(game, "Case of the Filched Falcon");
    spawn(game, "Mind Stone");
    endStep(game);
    expect(solved(game, falcon)).toBe(false);
  });
});

describe("Izoni, Center of the Web", () => {
  it("entering, collecting evidence 4 makes two Spiders; declining makes none", () => {
    const { game, a } = table();
    const giant = toGraveyard(game, "Hill Giant");
    pickFromZone(a, giant);
    enter(game, "Izoni, Center of the Web");
    expect(zone(game, giant)).toBe("exile");
    expect(tokensNamed(game, SPIDER, A)).toBe(2);
    const other = toGraveyard(game, "Hill Giant");
    pickFromZone(a);
    enter(game, "Izoni, Center of the Web");
    expect(zone(game, other)).toBe("graveyard");
    expect(tokensNamed(game, SPIDER, A)).toBe(2);
  });

  it("attacking collects too", () => {
    const { game, a } = table();
    const izoni = spawn(game, "Izoni, Center of the Web");
    const giant = toGraveyard(game, "Hill Giant");
    pickFromZone(a, giant);
    attack(game, a, [izoni]);
    expect(zone(game, giant)).toBe("exile");
    expect(tokensNamed(game, SPIDER, A)).toBe(2);
  });

  it("sacrifice four tokens: surveil 2, draw two, gain 2 life", () => {
    const { game } = table();
    const izoni = spawn(game, "Izoni, Center of the Web");
    const before = hand(game).length;
    game.debugApplyEffect(A, { kind: "create-token", token: SPIDER, count: 3 });
    const offers = () =>
      game.legalActions(A).filter((l) => l.kind === "activate-ability" && l.source === izoni);
    expect(offers()).toHaveLength(0);
    game.debugApplyEffect(A, { kind: "create-token", token: "Clue Token", count: 1 });
    expect(offers()).toHaveLength(1);
    activate(game, izoni, 0);
    expect(tokensNamed(game, SPIDER, A) + tokensNamed(game, "Clue Token", A)).toBe(0);
    expect(hand(game).length).toBe(before + 2);
    expect(life(game)).toBe(22);
  });
});
