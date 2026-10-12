/**
 * The set walk, batch 57, part b (2026-10-11): Marvel Super Heroes Commander,
 * and rebound cards. Written on the shared table in `harness.ts`.
 */
import { describe, expect, it } from "vitest";

import { computeCharacteristics } from "../characteristics.js";
import type { Game } from "../game.js";
import type { ObjectId, PlayerId } from "../primitives.js";

import {
  A,
  B,
  C,
  attack,
  cast,
  counters,
  enter,
  graveyard,
  hand,
  lands,
  life,
  pickModes,
  pickTargets,
  pt,
  ref,
  registryOf,
  settle,
  spawn,
  subtypes,
  table,
  toHand,
  toLibrary,
  toStep,
  zone,
} from "./harness.js";

const colorsOf = (game: Game, id: ObjectId): string[] =>
  [...computeCharacteristics(game.state, registryOf(game), id).colors];

/** Whether `player` may play the land card `card` right now. */
const canPlay = (game: Game, card: ObjectId, player: PlayerId = A): boolean =>
  game.canDispatch({ type: "play-land", player, card }) === null;

describe("Abomination, Irradiated Brute", () => {
  it("grows by the combat damage a Villain deals, not by a creature that's neither Gamma nor Villain", () => {
    const { game, a } = table();
    const abom = spawn(game, "Abomination, Irradiated Brute");
    const robot = spawn(game, "Robot Villain Token"); // 2/2 Robot Villain
    const bears = spawn(game, "Grizzly Bears");
    attack(game, a, [robot, bears]);
    settle(game);
    expect(life(game, B)).toBe(16);
    expect(counters(game, abom)).toBe(2);
  });
});

describe("Sauron, Dino Devotee", () => {
  it("makes another creature a green 5/5 Dinosaur only while it has a saurian counter", () => {
    const { game, a } = table();
    const giant = spawn(game, "Hill Giant", B); // red 3/3 Giant
    pickModes(a, 1);
    pickTargets(a, giant);
    enter(game, "Sauron, Dino Devotee");
    expect(counters(game, giant, "saurian")).toBe(1);
    expect(pt(game, giant)).toEqual({ power: 5, toughness: 5 });
    expect(subtypes(game, giant)).toEqual(["Dinosaur"]);
    expect(colorsOf(game, giant)).toEqual(["G"]);

    game.debugApplyEffect(A, { kind: "remove-counter", target: 0, counter: "saurian", amount: 1 }, [ref(giant)]);
    settle(game);
    expect(pt(game, giant)).toEqual({ power: 3, toughness: 3 });
    expect(subtypes(game, giant)).toEqual(["Giant"]);
    expect(colorsOf(game, giant)).toEqual(["R"]);
  });

  it("Cure Cancer gains 3 life and puts no counter anywhere", () => {
    const { game, a } = table();
    pickModes(a, 0);
    const sauron = enter(game, "Sauron, Dino Devotee");
    expect(life(game, A)).toBe(23);
    expect(counters(game, sauron, "saurian")).toBe(0);
  });
});

describe("Green Goblin, Back for More", () => {
  it("at the beginning of your combat, a discard makes each opponent discard; declining does nothing", () => {
    const { game, a } = table({ players: 3 });
    spawn(game, "Green Goblin, Back for More");
    toHand(game, "Wastes");
    toHand(game, "Wastes", B);
    toHand(game, "Wastes", C);
    const before = [hand(game, A).length, hand(game, B).length, hand(game, C).length];
    pickModes(a, 0);
    toStep(game, "begin-combat");
    settle(game);
    expect([hand(game, A).length, hand(game, B).length, hand(game, C).length]).toEqual(before.map((n) => n - 1));
  });

  it("with no card discarded, no opponent discards", () => {
    const { game, a } = table();
    spawn(game, "Green Goblin, Back for More");
    game.state.zones.perPlayer[A].hand.splice(0);
    toHand(game, "Wastes", B);
    const theirs = hand(game, B).length;
    pickModes(a, 0);
    toStep(game, "begin-combat");
    settle(game);
    expect(hand(game, B).length).toBe(theirs);
  });
});

describe("Wiccan, Young Avenger", () => {
  it("cast on an opponent's turn, the exiled card stays playable through your next turn, then lapses at your end step", () => {
    const { game } = table();
    spawn(game, "Wiccan, Young Avenger");
    lands(game, "Mountain", 1);
    const shock = toHand(game, "Shock");
    toStep(game, "precombat-main", B);
    // Bob passes; alice gets priority in his main phase.
    game.advanceUntil((s) => s.turn.step === "precombat-main" && s.priority.holder === A);
    const top = toLibrary(game, "Mountain");
    cast(game, shock, { targets: [ref(B)] });
    expect(zone(game, top)).toBe("exile");

    toStep(game, "precombat-main", A);
    expect(canPlay(game, top)).toBe(true);
    toStep(game, "precombat-main", B);
    toStep(game, "precombat-main", A);
    expect(zone(game, top)).toBe("exile");
    expect(canPlay(game, top)).toBe(false);
  });
});

describe("Nakia, Wakandan Operative", () => {
  it("makes you the monarch when your commander enters, not when an opponent's does", () => {
    const { game } = table();
    spawn(game, "Nakia, Wakandan Operative");
    const theirs = game.debugSpawn("Grizzly Bears", B, "command");
    game.state.objects[theirs].isCommander = true;
    lands(game, "Forest", 2, B);
    toStep(game, "precombat-main", B);
    cast(game, theirs, { player: B });
    expect(zone(game, theirs)).toBe("battlefield");
    expect(game.state.monarch).toBe(null);

    toStep(game, "precombat-main", A);
    const mine = game.debugSpawn("Grizzly Bears", A, "command");
    game.state.objects[mine].isCommander = true;
    lands(game, "Forest", 2);
    cast(game, mine);
    expect(zone(game, mine)).toBe("battlefield");
    expect(game.state.monarch).toBe(A);
  });
});

describe("Quantum Entanglement", () => {
  it("as it enters, pays {1}{W} to blink a creature you control; at your end step it may again", () => {
    const { game, a } = table();
    const plains = lands(game, "Plains", 4);
    const bears = spawn(game, "Grizzly Bears");
    game.state.objects[bears].counters["+1/+1"] = 1;
    pickModes(a, 0);
    pickTargets(a, bears);
    enter(game, "Quantum Entanglement");
    // Back as a new object (rule 400.7): the counter is gone.
    const [back] = game.state.zones.shared.battlefield.filter((id) => game.state.objects[id].cardName === "Grizzly Bears");
    expect(back).toBeDefined();
    expect(counters(game, back)).toBe(0);
    expect(plains.filter((id) => game.state.objects[id].tapped)).toHaveLength(2);

    game.state.objects[back].counters["+1/+1"] = 1;
    pickTargets(a, back);
    toStep(game, "end");
    settle(game);
    const [again] = game.state.zones.shared.battlefield.filter((id) => game.state.objects[id].cardName === "Grizzly Bears");
    expect(counters(game, again)).toBe(0);
    expect(plains.filter((id) => game.state.objects[id].tapped)).toHaveLength(4);
  });

  it("declined, nothing is paid or blinked", () => {
    const { game, a } = table();
    const plains = lands(game, "Plains", 2);
    const bears = spawn(game, "Grizzly Bears");
    game.state.objects[bears].counters["+1/+1"] = 1;
    pickModes(a);
    enter(game, "Quantum Entanglement");
    expect(counters(game, bears)).toBe(1);
    expect(plains.filter((id) => game.state.objects[id].tapped)).toHaveLength(0);
  });
});

describe("Fevered Suspicion", () => {
  it("each opponent exiles to a nonland card; you cast those free, lands stay exiled, and it rebounds", () => {
    const { game, a } = table({ players: 3 });
    lands(game, "Swamp", 4);
    lands(game, "Mountain", 4);
    const bears = toLibrary(game, "Grizzly Bears", B);
    const wastes = toLibrary(game, "Wastes", B); // on top of Bob's Bears
    const shock = toLibrary(game, "Shock", C);
    const suspicion = toHand(game, "Fevered Suspicion");
    const offered: ObjectId[][] = [];
    a.chooseCastNowFn = (_view, offer) => {
      offered.push([...offer.cards]);
      const pick = offer.casts.find((c) => c.card === bears) ?? offer.casts.find((c) => c.card === shock);
      if (pick === undefined) return null;
      const targets = pick.card === shock ? [ref(B)] : [];
      return { type: "cast-spell", player: A, card: pick.card, targets, via: pick.via, ...(offer.free ? { free: true } : {}) };
    };
    cast(game, suspicion);
    expect(offered[0]).toEqual(expect.arrayContaining([bears, shock]));
    expect(offered[0]).not.toContain(wastes);
    expect(zone(game, bears)).toBe("battlefield");
    expect(game.state.objects[bears].controller).toBe(A);
    expect(life(game, B)).toBe(18);
    expect(zone(game, wastes)).toBe("exile");
    // Cast from the hand: rebound exiles it rather than the graveyard.
    expect(zone(game, suspicion)).toBe("exile");
    expect(graveyard(game)).not.toContain(suspicion);
  });
});
