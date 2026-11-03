import { describe, expect, it } from "vitest";

import { chooseModes } from "../decisions/choose-modes.js";
import { repeatedManaCost, parseManaCost } from "../mana.js";
import type { Game } from "../game.js";
import { A, B, cast, counters, enter, graveyard, keywords, lands, life, pickModes, pt, spawn, table, toGraveyard, toHand, types, subtypes, zone } from "./harness.js";

// A `may` whose `cost` can be paid several times over (`costTimes`): "you may
// pay {1}{G} any number of times", "up to three times". One question, how many
// times, on the `choose-modes` decision's `xCost`; that number is the X the
// effect, and a reflexive ability's targets and modes, read.

const offerOf = (game: Game) => {
  const offer = game.legalActions(A).find((a) => a.kind === "choose-modes");
  return offer?.kind === "choose-modes" ? offer : undefined;
};

/** Up to the question. */
const toQuestion = (game: Game): void =>
  game.advanceUntil((s) => s.awaiting?.kind === "choose-modes" || (s.zones.shared.stack.length === 0 && s.awaiting === null));

const untappedLands = (game: Game): number =>
  game.state.zones.shared.battlefield.filter((id) => {
    const object = game.state.objects[id];
    return types(game, id).includes("land") && !object.tapped && object.controller === A;
  }).length;

describe("repeatedManaCost", () => {
  it("multiplies every symbol, hybrid ones too", () => {
    const cost = repeatedManaCost(parseManaCost("{1}{G}{G/W}{C}"), 3);
    expect(cost.generic).toBe(3);
    expect(cost.colored.G).toBe(3);
    expect(cost.colorless).toBe(3);
    expect(cost.hybrid.length).toBe(3);
  });
});

describe("Intrepid Adversary: any number of times", () => {
  it("offers as many times as can be paid, from one, naming what each costs", () => {
    const { game } = table();
    lands(game, "Plains", 5);
    enter(game, "Intrepid Adversary", A, { settle: false });
    toQuestion(game);
    expect(offerOf(game)?.xCost).toEqual({ maxX: 2, minX: 1, times: "{1}{W}" });
  });

  it("pays it that many times over in one payment, and the reflexive ability brings that many counters", () => {
    const { game } = table();
    lands(game, "Plains", 5);
    const scout = enter(game, "Intrepid Adversary", A, { settle: false });
    const bear = spawn(game, "Grizzly Bears", A);
    toQuestion(game);
    game.dispatch({ type: "choose-modes", player: A, modes: [0], xValue: 2 });
    expect(untappedLands(game)).toBe(1);
    // Nothing yet: "when you pay" is its own ability, on the stack.
    expect(counters(game, scout, "valor")).toBe(0);
    expect(game.state.pendingTriggers.length + game.state.zones.shared.stack.length).toBeGreaterThan(0);
    game.advanceUntil((s) => s.zones.shared.stack.length === 0 && s.awaiting === null && s.pendingTriggers.length === 0);
    expect(counters(game, scout, "valor")).toBe(2);
    expect(pt(game, bear)).toEqual({ power: 4, toughness: 4 });
    expect(pt(game, scout)).toEqual({ power: 5, toughness: 3 });
  });

  it("saying yes pays at least once", () => {
    const { game } = table();
    lands(game, "Plains", 2);
    enter(game, "Intrepid Adversary", A, { settle: false });
    toQuestion(game);
    expect(() => game.dispatch({ type: "choose-modes", player: A, modes: [0], xValue: 0 })).toThrow(/at least once/);
    expect(() => game.dispatch({ type: "choose-modes", player: A, modes: [0] })).toThrow(/at least once/);
    game.dispatch({ type: "choose-modes", player: A, modes: [0], xValue: 1 });
    expect(untappedLands(game)).toBe(0);
  });

  it("declining pays nothing and triggers nothing", () => {
    const { game } = table();
    lands(game, "Plains", 4);
    const scout = enter(game, "Intrepid Adversary", A, { settle: false });
    toQuestion(game);
    game.dispatch({ type: "choose-modes", player: A, modes: [] });
    game.advanceUntil((s) => s.zones.shared.stack.length === 0 && s.awaiting === null && s.pendingTriggers.length === 0);
    expect(untappedLands(game)).toBe(4);
    expect(counters(game, scout, "valor")).toBe(0);
  });

  it("isn't asked when the cost can't be paid once", () => {
    const { game } = table();
    lands(game, "Plains", 1);
    enter(game, "Intrepid Adversary", A, { settle: false });
    toQuestion(game);
    expect(game.state.awaiting).toBeNull();
    expect(offerOf(game)).toBeUndefined();
  });

  it("needs each time's coloured mana: {1}{W} twice needs two white", () => {
    const { game } = table();
    lands(game, "Plains", 1);
    lands(game, "Forest", 4);
    enter(game, "Intrepid Adversary", A, { settle: false });
    toQuestion(game);
    expect(offerOf(game)?.xCost?.maxX).toBe(1);
  });

  it("a number it can't pay falls back to declining, since the payment fails", () => {
    const { game } = table();
    lands(game, "Plains", 3);
    const scout = enter(game, "Intrepid Adversary", A, { settle: false });
    toQuestion(game);
    game.dispatch({ type: "choose-modes", player: A, modes: [0], xValue: 5 });
    game.advanceUntil((s) => s.zones.shared.stack.length === 0 && s.awaiting === null && s.pendingTriggers.length === 0);
    expect(untappedLands(game)).toBe(3);
    expect(counters(game, scout, "valor")).toBe(0);
  });
});

describe("Primal Adversary: up to that many targets", () => {
  it("puts that many counters on it and makes up to that many lands 3/3 Wolves with haste, still lands", () => {
    const { game } = table();
    const forests = lands(game, "Forest", 6);
    const hydra = enter(game, "Primal Adversary", A, { settle: false });
    toQuestion(game);
    game.dispatch({ type: "choose-modes", player: A, modes: [0], xValue: 2 });
    game.advanceUntil((s) => s.awaiting?.kind === "choose-targets");
    const asked = game.legalActions(A).find((a) => a.kind === "choose-targets");
    expect(asked?.kind).toBe("choose-targets");
    // Three is over the two paid for.
    const ref = (object: number) => ({ kind: "object" as const, object: forests[object] });
    expect(() =>
      game.dispatch({ type: "choose-targets", player: A, targets: [ref(4), ref(5), ref(0)] }),
    ).toThrow();
    game.dispatch({ type: "choose-targets", player: A, targets: [ref(4), ref(5)] });
    game.advanceUntil((s) => s.zones.shared.stack.length === 0 && s.awaiting === null && s.pendingTriggers.length === 0);
    expect(counters(game, hydra)).toBe(2);
    expect(pt(game, hydra)).toEqual({ power: 6, toughness: 5 });
    for (const land of [forests[4], forests[5]]) {
      expect(pt(game, land)).toEqual({ power: 3, toughness: 3 });
      expect(types(game, land)).toEqual(expect.arrayContaining(["land", "creature"]));
      expect(subtypes(game, land)).toEqual(expect.arrayContaining(["Forest", "Wolf"]));
      expect(keywords(game, land).has("haste")).toBe(true);
    }
    expect(types(game, forests[0])).not.toContain("creature");
    // And stays one: no duration to end it.
    game.advanceUntil((s) => s.turn.number === 2);
    expect(types(game, forests[4])).toContain("creature");
  });

  it("may target fewer than it paid for", () => {
    const { game } = table();
    const forests = lands(game, "Forest", 6);
    const hydra = enter(game, "Primal Adversary", A, { settle: false });
    toQuestion(game);
    game.dispatch({ type: "choose-modes", player: A, modes: [0], xValue: 3 });
    game.advanceUntil((s) => s.awaiting?.kind === "choose-targets");
    game.dispatch({ type: "choose-targets", player: A, targets: [] });
    game.advanceUntil((s) => s.zones.shared.stack.length === 0 && s.awaiting === null && s.pendingTriggers.length === 0);
    expect(counters(game, hydra)).toBe(3);
    expect(types(game, forests[0])).not.toContain("creature");
  });
});

describe("Tranquil Frillback: up to three times, choose up to that many", () => {
  const paid = (game: Game, times: number): void => {
    toQuestion(game);
    game.dispatch({ type: "choose-modes", player: A, modes: [0], xValue: times });
    game.advanceUntil((s) => s.awaiting !== null && s.awaiting.kind !== "choose-modes" ? true : s.awaiting?.kind === "choose-modes");
  };

  it("caps the times at three, however much mana there is", () => {
    const { game } = table();
    lands(game, "Forest", 6);
    enter(game, "Tranquil Frillback", A, { settle: false });
    toQuestion(game);
    expect(offerOf(game)?.xCost).toEqual({ maxX: 3, minX: 1, times: "{G}" });
    expect(() => game.dispatch({ type: "choose-modes", player: A, modes: [0], xValue: 4 })).toThrow(/greater than 3/);
  });

  it("offers up to the number paid as the reflexive ability goes on the stack, targets following the modes", () => {
    const { game } = table();
    lands(game, "Forest", 2);
    const relic = spawn(game, "Sol Ring", B);
    const dead = toGraveyard(game, "Grizzly Bears", B);
    enter(game, "Tranquil Frillback", A, { settle: false });
    paid(game, 2);
    // The second question: the modes, up to two of them.
    const modes = offerOf(game);
    expect(modes?.minModes).toBe(0);
    expect(modes?.maxModes).toBe(2);
    expect(modes?.xCost).toBeUndefined();
    expect(() => game.dispatch({ type: "choose-modes", player: A, modes: [0, 1, 2] })).toThrow();
    game.dispatch({ type: "choose-modes", player: A, modes: [0, 1] });
    game.advanceUntil((s) => s.awaiting?.kind === "choose-targets");
    game.dispatch({
      type: "choose-targets",
      player: A,
      targets: [
        { kind: "object", object: relic },
        { kind: "player", player: B },
      ],
    });
    game.advanceUntil((s) => s.zones.shared.stack.length === 0 && s.awaiting === null && s.pendingTriggers.length === 0);
    // In listed order: destroyed, then exiled with the rest of Bob's graveyard.
    expect(zone(game, relic)).toBe("exile");
    expect(zone(game, dead)).toBe("exile");
  });

  it("the life mode alone, and paying once offers one mode", () => {
    const { game } = table();
    lands(game, "Forest", 1);
    enter(game, "Tranquil Frillback", A, { settle: false });
    paid(game, 1);
    expect(offerOf(game)?.maxModes).toBe(1);
    // Nothing to destroy: that mode can't be chosen (rule 700.2b).
    expect(offerOf(game)?.modeTexts).toEqual(["Exile target player's graveyard.", "You gain 4 life."]);
    const before = life(game);
    game.dispatch({ type: "choose-modes", player: A, modes: [1] });
    game.advanceUntil((s) => s.zones.shared.stack.length === 0 && s.awaiting === null && s.pendingTriggers.length === 0);
    expect(life(game)).toBe(before + 4);
  });

  it("choosing none removes the ability", () => {
    const { game } = table();
    lands(game, "Forest", 1);
    enter(game, "Tranquil Frillback", A, { settle: false });
    paid(game, 1);
    const before = life(game);
    game.dispatch({ type: "choose-modes", player: A, modes: [] });
    game.advanceUntil((s) => s.zones.shared.stack.length === 0 && s.awaiting === null && s.pendingTriggers.length === 0);
    expect(life(game)).toBe(before);
    expect(graveyard(game, B).length).toBe(0);
  });
});

describe("whoever answers", () => {
  it("a controller answering modes alone pays once", () => {
    const { game, a } = table();
    lands(game, "Plains", 6);
    const scout = enter(game, "Intrepid Adversary", A, { settle: false });
    pickModes(a, 0);
    game.advanceUntil((s) => s.zones.shared.stack.length === 0 && s.awaiting === null && s.pendingTriggers.length === 0);
    expect(counters(game, scout, "valor")).toBe(1);
    expect(untappedLands(game)).toBe(4);
  });

  it("a bot weighs the most it can pay, once, and declining", () => {
    const { game } = table();
    lands(game, "Plains", 6);
    enter(game, "Intrepid Adversary", A, { settle: false });
    toQuestion(game);
    const offer = offerOf(game);
    if (offer === undefined) throw new Error("no offer");
    const answers = chooseModes.candidates?.(offer, A, 8, {} as never) ?? [];
    expect(answers).toContainEqual({ type: "choose-modes", player: A, modes: [0], xValue: 3 });
    expect(answers).toContainEqual({ type: "choose-modes", player: A, modes: [0], xValue: 1 });
    expect(answers.some((answer) => answer.type === "choose-modes" && answer.modes.length === 0)).toBe(true);
  });

  it("the fuzzer's yes names a number it may pay", () => {
    const { game } = table();
    lands(game, "Plains", 6);
    enter(game, "Intrepid Adversary", A, { settle: false });
    toQuestion(game);
    const offer = offerOf(game);
    if (offer === undefined) throw new Error("no offer");
    // Past the "may" (`minModes` 0): a yes among the answers, each within it.
    const rng = { random: () => 0.99, pickIndex: (n: number) => n - 1 };
    const answer = chooseModes.randomAnswer?.(offer, A, rng as never);
    expect(answer).toEqual({ type: "choose-modes", player: A, modes: [0], xValue: 3 });
  });
});

describe("the question as a real spell's", () => {
  it("cast from hand, the mana left after the spell is what it can pay", () => {
    const { game } = table();
    lands(game, "Plains", 6);
    const scout = toHand(game, "Intrepid Adversary");
    cast(game, scout, { settle: false });
    game.advanceUntil((s) => s.awaiting?.kind === "choose-modes");
    expect(offerOf(game)?.xCost?.maxX).toBe(2);
    game.dispatch({ type: "choose-modes", player: A, modes: [0], xValue: 2 });
    game.advanceUntil((s) => s.zones.shared.stack.length === 0 && s.awaiting === null && s.pendingTriggers.length === 0);
    expect(counters(game, scout, "valor")).toBe(2);
    expect(untappedLands(game)).toBe(0);
  });
});
