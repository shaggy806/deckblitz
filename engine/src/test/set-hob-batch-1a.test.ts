/**
 * The Hobbit (HOB), batch 72, part a (2026-10-14): the bottom half of the set.
 * Written on the shared table in `harness.ts`.
 */
import { describe, expect, it } from "vitest";

import type { Game } from "../game.js";
import type { ObjectId } from "../primitives.js";

import {
  A,
  B,
  attack,
  blockOffer,
  cast,
  counters,
  destroy,
  enter,
  graveyard,
  hand,
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
  toGraveyard,
  toHand,
  toLibrary,
  toStep,
  tokensNamed,
  zone,
} from "./harness.js";

/** Activate `source`'s first ability, sacrificing `victim` for its cost — then settle. */
function sacrificeFor(game: Game, source: ObjectId, victim: ObjectId): void {
  game.dispatch({ type: "activate-ability", player: A, source, abilityIndex: 0, targets: [], sacrifice: victim });
  settle(game);
}

const activateOffers = (game: Game, source: ObjectId) =>
  game.legalActions(A).filter((o) => o.kind === "activate-ability" && o.source === source);

describe("Rhovanion Rampager", () => {
  it("grows by the sacrificed creature's power, then amasses Goblins equal to the power it died with", () => {
    const { game, a } = table();
    const rampager = spawn(game, "Rhovanion Rampager");
    const giant = spawn(game, "Hill Giant");
    pickModes(a, 0);
    attack(game, a, [rampager]);
    expect(zone(game, giant)).toBe("graveyard");
    expect(counters(game, rampager)).toBe(3);
    expect(pt(game, rampager)).toEqual({ power: 6, toughness: 5 });
    destroy(game, rampager);
    const [army] = named(game, "Army Token", A);
    expect(army).toBeDefined();
    expect(counters(game, army)).toBe(6);
    expect(pt(game, army).power).toBe(6);
  });
});

describe("Wilderland Scrounger", () => {
  it("puts a counter on each creature you control only while you control a creature with power 4 or greater", () => {
    const { game, a } = table();
    const scrounger = spawn(game, "Wilderland Scrounger");
    const bears = spawn(game, "Grizzly Bears");
    attack(game, a, [scrounger]);
    expect(counters(game, bears)).toBe(0);

    toStep(game, "precombat-main");
    const angel = spawn(game, "Serra Angel");
    attack(game, a, [scrounger]);
    expect(counters(game, bears)).toBe(1);
    expect(counters(game, angel)).toBe(1);
    expect(counters(game, scrounger)).toBe(1);
  });
});

describe("Cantankerous Keepers", () => {
  it("mills four and must put every Elf card among them into your hand", () => {
    const { game, a } = table();
    toLibrary(game, "Wastes");
    const elfA = toLibrary(game, "Llanowar Elves");
    toLibrary(game, "Wastes");
    const elfB = toLibrary(game, "Llanowar Elves");
    let asked: { min: number; eligible: number } | undefined;
    a.chooseFromZoneFn = (_view, eligible, min) => {
      asked = { min, eligible: eligible.length };
      return eligible.slice(0, min);
    };
    enter(game, "Cantankerous Keepers");
    expect(asked).toEqual({ min: 2, eligible: 2 });
    expect(zone(game, elfA)).toBe("hand");
    expect(zone(game, elfB)).toBe("hand");
    expect(graveyard(game).filter((id) => game.state.objects[id].cardName === "Wastes")).toHaveLength(2);
  });

  it("costs {1} less for each Elf you control", () => {
    const { game } = table();
    spawn(game, "Llanowar Elves");
    spawn(game, "Llanowar Elves");
    lands(game, "Forest", 4);
    cast(game, toHand(game, "Cantankerous Keepers"));
    expect(named(game, "Cantankerous Keepers")).toHaveLength(1);
  });
});

describe("Sound the Trumpets", () => {
  it("recruits when the countered spell's mana value was 2 or less", () => {
    const { game, a } = table();
    lands(game, "Forest", 1);
    lands(game, "Island", 4);
    const bears = toHand(game, "Grizzly Bears");
    cast(game, bears, { settle: false });
    const discard = toHand(game, "Hill Giant");
    a.chooseDiscardsFn = () => [discard];
    cast(game, toHand(game, "Sound the Trumpets"), { targets: [ref(bears)] });
    expect(zone(game, bears)).toBe("graveyard");
    expect(zone(game, discard)).toBe("graveyard");
    expect(tokensNamed(game, "Human Soldier Token", A)).toBe(1);
  });

  it("reads the mana value the spell had on the stack, {X} included", () => {
    const { game, a } = table();
    lands(game, "Island", 6);
    const serpent = toHand(game, "Stonecoil Serpent");
    cast(game, serpent, { x: 3, settle: false });
    const giant = toHand(game, "Hill Giant");
    a.chooseDiscardsFn = () => [giant];
    const handBefore = hand(game).length;
    cast(game, toHand(game, "Sound the Trumpets"), { targets: [ref(serpent)] });
    expect(zone(game, serpent)).toBe("graveyard");
    // Mana value 3 on the stack (0 in the graveyard): no recruit — no draw, no discard.
    expect(zone(game, giant)).toBe("hand");
    expect(hand(game).length).toBe(handBefore);
    expect(tokensNamed(game, "Human Soldier Token", A)).toBe(0);
  });
});

describe("Patient Instructor", () => {
  it("recruits: a token only when the discarded card was a nonland card", () => {
    const { game, a } = table();
    a.chooseDiscardsFn = (h) => [h.find((o) => o.cardName === "Wastes")!.id];
    enter(game, "Patient Instructor");
    expect(tokensNamed(game, "Human Soldier Token", A)).toBe(0);

    const bears = toHand(game, "Grizzly Bears");
    a.chooseDiscardsFn = () => [bears];
    enter(game, "Patient Instructor");
    expect(zone(game, bears)).toBe("graveyard");
    expect(tokensNamed(game, "Human Soldier Token", A)).toBe(1);
  });
});

describe("Snowslope Hunter", () => {
  it("activates only during your turn and only once each turn", () => {
    const { game } = table();
    const hunter = spawn(game, "Snowslope Hunter");
    const fodder = spawn(game, "Grizzly Bears");
    spawn(game, "Grizzly Bears");
    const top = toLibrary(game, "Lightning Bolt");
    expect(activateOffers(game, hunter).length).toBeGreaterThan(0);
    sacrificeFor(game, hunter, fodder);
    expect(zone(game, fodder)).toBe("graveyard");
    expect(zone(game, top)).toBe("exile");
    expect(activateOffers(game, hunter)).toHaveLength(0);
    // Bob's turn: still a sacrifice to make, but not alice's turn.
    game.advanceUntil((s) => s.turn.number === 2 && s.turn.step === "precombat-main" && s.priority.holder === A);
    expect(activateOffers(game, hunter)).toHaveLength(0);
  });
});

describe("Moment of Glory", () => {
  it("from the hand, only the target gets a counter", () => {
    const { game } = table();
    lands(game, "Plains", 1);
    const bears = spawn(game, "Grizzly Bears");
    const other = spawn(game, "Grizzly Bears");
    cast(game, toHand(game, "Moment of Glory"), { targets: [ref(bears)] });
    expect(counters(game, bears)).toBe(1);
    expect(counters(game, other)).toBe(0);
  });

  it("flashed back, every other creature you control gets one too — the target still only one", () => {
    const { game } = table();
    lands(game, "Plains", 5);
    const bears = spawn(game, "Grizzly Bears");
    const other = spawn(game, "Grizzly Bears");
    const theirs = spawn(game, "Grizzly Bears", B);
    const moment = toGraveyard(game, "Moment of Glory");
    cast(game, moment, { targets: [ref(bears)], via: "flashback" });
    expect(counters(game, bears)).toBe(1);
    expect(counters(game, other)).toBe(1);
    expect(counters(game, theirs)).toBe(0);
    expect(zone(game, moment)).toBe("exile");
  });
});

describe("Duskwatch Hunter", () => {
  it("can't be blocked by tokens", () => {
    const { game, a } = table();
    const hunter = spawn(game, "Duskwatch Hunter");
    const bears = spawn(game, "Grizzly Bears", B);
    game.debugApplyEffect(B, { kind: "create-token", token: "Soldier Token", count: 1 }, []);
    const [soldier] = named(game, "Soldier Token", B);
    const offer = blockOffer(game, a, [hunter]);
    const canBlock = (blocker: ObjectId) => offer.eligible.find((e) => e.blocker === blocker)?.canBlock ?? [];
    expect(canBlock(bears)).toEqual([hunter]);
    expect(canBlock(soldier)).toEqual([]);
  });
});

describe("Gollum the Abandoned", () => {
  it("drains each opponent even with no card chosen to exile", () => {
    const { game, a } = table();
    const card = toGraveyard(game, "Grizzly Bears", B);
    pickTargets(a, null);
    enter(game, "Gollum the Abandoned");
    expect(life(game, B)).toBe(18);
    expect(zone(game, card)).toBe("graveyard");
  });

  it("returns from your graveyard to your hand for {2} and a sacrifice", () => {
    const { game } = table();
    const gollum = toGraveyard(game, "Gollum the Abandoned");
    const relic = spawn(game, "Sol Ring");
    lands(game, "Swamp", 2);
    sacrificeFor(game, gollum, relic);
    expect(zone(game, gollum)).toBe("hand");
    expect(zone(game, relic)).toBe("graveyard");
  });
});

describe("Galion, Elvenking's Butler", () => {
  it("sets another creature's base power and toughness to Galion's actual power and toughness", () => {
    const { game, a } = table();
    const galion = spawn(game, "Galion, Elvenking's Butler");
    game.state.objects[galion].counters["+1/+1"] = 1;
    const bears = spawn(game, "Grizzly Bears");
    game.state.objects[bears].counters["+1/+1"] = 1;
    pickTargets(a, bears);
    attack(game, a, [galion]);
    // Base 5/5 from Galion's 5/5, then its own counter on top.
    expect(pt(game, bears)).toEqual({ power: 6, toughness: 6 });
  });
});

describe("Mirkwood Meditator", () => {
  it("may become a 4/2 until end of turn when a land enters under your control", () => {
    const { game, a } = table();
    const meditator = spawn(game, "Mirkwood Meditator");
    pickModes(a, 0);
    enter(game, "Island");
    expect(pt(game, meditator)).toEqual({ power: 4, toughness: 2 });
  });
});

describe("Speak Secrets", () => {
  it("mills four and puts an instant or sorcery card from among them into your hand", () => {
    const { game } = table();
    lands(game, "Island", 2);
    toLibrary(game, "Grizzly Bears");
    const bolt = toLibrary(game, "Lightning Bolt");
    toLibrary(game, "Wastes");
    toLibrary(game, "Wastes");
    const bird = toHand(game, "Most Decrepit Old Bird");
    cast(game, bird, { face: 1 });
    expect(zone(game, bolt)).toBe("hand");
    expect(zone(game, bird)).toBe("exile");
  });
});

describe("Roll-Roll-Roll-Roll", () => {
  it("flickers up to one creature or land you control at the next end step", () => {
    const { game, a } = table();
    lands(game, "Island", 3);
    const bears = spawn(game, "Grizzly Bears");
    pickTargets(a, bears);
    cast(game, toHand(game, "Roll-Roll-Roll-Roll"));
    expect(zone(game, bears)).toBe("exile");
    toStep(game, "end");
    settle(game);
    expect(named(game, "Grizzly Bears", A)).toHaveLength(1);
  });
});
