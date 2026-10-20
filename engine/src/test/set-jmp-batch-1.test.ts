/**
 * Jumpstart (JMP; B115) — the set's last 12 cards, authored by the lead.
 */
import { describe, expect, it } from "vitest";

import type { ScriptedController } from "../controller.js";
import type { Game } from "../game.js";
import type { ObjectId } from "../primitives.js";
import {
  A,
  B,
  cast,
  enter,
  hand,
  life,
  pickModes,
  pickTargets,
  pt,
  quiet,
  ref,
  settle,
  spawn,
  table,
  toGraveyard,
  toHand,
  toStep,
  tokensNamed,
  zone,
} from "./harness.js";

/** The seat casts `card` free when offered. */
const castWhenOffered = (seat: ScriptedController, card: ObjectId): void => {
  seat.chooseCastNowFn = (_view, offer) => {
    const way = offer.casts.find((c) => c.card === card);
    if (way === undefined) return null;
    return { type: "cast-spell", player: seat.playerId, card, targets: [], via: way.via, ...(offer.free ? { free: true } : {}) };
  };
};

describe("Scholar of the Lost Trove", () => {
  it("casts an instant or sorcery free and exiles it after", () => {
    const { game, a } = table();
    const divination = toGraveyard(game, "Divination");
    const before = hand(game).length;
    pickTargets(a, divination);
    castWhenOffered(a, divination);
    enter(game, "Scholar of the Lost Trove");
    expect(hand(game).length).toBe(before + 2);
    expect(zone(game, divination)).toBe("exile");
  });

  it("doesn't mark an artifact spell cast this way for exile (its ruling)", () => {
    const { game, a } = table();
    const stone = toGraveyard(game, "Mind Stone");
    pickTargets(a, stone);
    castWhenOffered(a, stone);
    enter(game, "Scholar of the Lost Trove", A, { settle: false });
    game.advanceUntil((s) => s.objects[stone].zone === "stack" || quiet(s));
    expect(zone(game, stone)).toBe("stack");
    expect(game.state.objects[stone].exileIfWouldGoToGraveyard).not.toBe(true);
  });
});

describe("Immolating Gyre", () => {
  it("deals X to each creature and planeswalker you don't control", () => {
    const { game } = table();
    for (let i = 0; i < 3; i++) toGraveyard(game, "Shock");
    const mine = spawn(game, "Grizzly Bears");
    const theirs = spawn(game, "Hill Giant", B);
    const lands = ["Mountain", "Mountain", "Mountain", "Mountain", "Mountain", "Mountain"];
    for (const l of lands) spawn(game, l);
    cast(game, toHand(game, "Immolating Gyre"));
    expect(zone(game, theirs)).toBe("graveyard");
    expect(zone(game, mine)).toBe("battlefield");
  });
});

describe("Brightmare", () => {
  it("taps a creature and gains life equal to its power", () => {
    const { game, a } = table();
    const giant = spawn(game, "Hill Giant", B);
    pickTargets(a, giant);
    enter(game, "Brightmare");
    expect(game.state.objects[giant].tapped).toBe(true);
    expect(life(game, A)).toBe(23);
  });
});

describe("Lightning Phoenix", () => {
  const phoenixAtEnd = (game: Game): ObjectId => {
    const phoenix = toGraveyard(game, "Lightning Phoenix");
    spawn(game, "Mountain");
    return phoenix;
  };

  it("returns at your end step only if an opponent was dealt 3 or more damage", () => {
    const { game, a } = table();
    const phoenix = phoenixAtEnd(game);
    pickModes(a, 0);
    toStep(game, "end");
    settle(game);
    expect(zone(game, phoenix)).toBe("graveyard");
    toStep(game, "precombat-main");
    spawn(game, "Mountain");
    cast(game, toHand(game, "Lightning Bolt"), { targets: [ref(B)] });
    pickModes(a, 0);
    toStep(game, "end");
    settle(game);
    expect(zone(game, phoenix)).toBe("battlefield");
  });
});

describe("Sethron, Hurloon General", () => {
  it("makes a Minotaur for itself and for another nontoken Minotaur, not for the tokens", () => {
    const { game } = table();
    enter(game, "Sethron, Hurloon General");
    expect(tokensNamed(game, "Minotaur Token", A)).toBe(1);
    enter(game, "Sethron, Hurloon General", B);
    enter(game, "Shatterskull Minotaur");
    expect(tokensNamed(game, "Minotaur Token", A)).toBe(2);
  });
});

describe("Kels, Fight Fixer", () => {
  it("draws on a sacrifice when {U/B} is paid", () => {
    const { game, a } = table();
    const kels = spawn(game, "Kels, Fight Fixer");
    const bears = spawn(game, "Grizzly Bears");
    spawn(game, "Swamp");
    spawn(game, "Swamp");
    const before = hand(game).length;
    pickModes(a, 0);
    game.dispatch({ type: "activate-ability", player: A, source: kels, abilityIndex: 0, targets: [], sacrifice: bears });
    settle(game);
    expect(hand(game).length).toBe(before + 1);
    expect(game.characteristics(kels).keywords.has("indestructible")).toBe(true);
  });
});

describe("Chained Brute", () => {
  it("untaps by sacrificing another creature, only during your turn", () => {
    const { game } = table();
    const brute = spawn(game, "Chained Brute", A, { tapped: true });
    const bears = spawn(game, "Grizzly Bears");
    spawn(game, "Mountain");
    game.dispatch({ type: "activate-ability", player: A, source: brute, abilityIndex: 0, targets: [], sacrifice: bears });
    settle(game);
    expect(game.state.objects[brute].tapped).toBe(false);
    expect(pt(game, brute)).toEqual({ power: 4, toughness: 3 });
  });
});
