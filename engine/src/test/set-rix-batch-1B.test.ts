/**
 * Rivals of Ixalan, group B (B129): the clause most likely to be wrong on each
 * card that's more than a stat line or an already-tested shape.
 */
import { describe, expect, it } from "vitest";

import type { Game } from "../game.js";
import type { ObjectId } from "../primitives.js";

import type { Table } from "./harness.js";
import {
  A,
  B,
  activate,
  attack,
  cast,
  counters,
  destroy,
  graveyard,
  hand,
  keywords,
  lands,
  life,
  loyalty,
  nextTurn,
  pickTargets,
  pt,
  quiet,
  ref,
  spawn,
  table,
  toHand,
  toLibrary,
  toStep,
  tokensNamed,
  zone,
} from "./harness.js";

const blessed = (game: Game): boolean => game.state.players[A].citysBlessing === true;
const check = (game: Game): void => toStep(game, "begin-combat");

describe("Tilonalli's Summoner", () => {
  /** Attack with the Summoner, pay {X}{R} with X = 2, run to postcombat main. */
  function attackPaying(game: Game, a: Table["a"], summoner: ObjectId): void {
    a.declareAttackersFn = () => [{ attacker: summoner, defender: B }];
    game.advanceUntil((s) => s.awaiting?.kind === "choose-modes");
    game.dispatch({ type: "choose-modes", player: A, modes: [0], xValue: 2 });
    toStep(game, "postcombat-main");
  }

  it("pays {X}{R} for X tapped and attacking Elementals, exiled at the end step without the blessing", () => {
    const { game, a } = table();
    const summoner = spawn(game, "Tilonalli's Summoner");
    lands(game, "Mountain", 3);
    attackPaying(game, a, summoner);
    expect(tokensNamed(game, "1/1 Red Elemental Token", A)).toBe(2);
    expect(life(game, B)).toBe(20 - 1 - 2);
    expect(blessed(game)).toBe(false);
    nextTurn(game);
    expect(tokensNamed(game, "1/1 Red Elemental Token", A)).toBe(0);
  });

  it("with the city's blessing as the delayed ability resolves, the tokens stay", () => {
    const { game, a } = table();
    const summoner = spawn(game, "Tilonalli's Summoner");
    lands(game, "Mountain", 9);
    attackPaying(game, a, summoner);
    expect(blessed(game)).toBe(true);
    nextTurn(game);
    expect(tokensNamed(game, "1/1 Red Elemental Token", A)).toBe(2);
  });
});

describe("Rekindling Phoenix", () => {
  it("dies into an Elemental, which at your upkeep is sacrificed to return the Phoenix with haste", () => {
    const { game, a } = table();
    const phoenix = spawn(game, "Rekindling Phoenix");
    destroy(game, phoenix);
    expect(tokensNamed(game, "Elemental Token (Rekindling Phoenix)", A)).toBe(1);
    // Bob's upkeep: not "your" upkeep, so nothing happens.
    nextTurn(game);
    expect(tokensNamed(game, "Elemental Token (Rekindling Phoenix)", A)).toBe(1);
    const card = graveyard(game).find((id) => game.state.objects[id].cardName === "Rekindling Phoenix");
    expect(card).toBeDefined();
    pickTargets(a, card!);
    toStep(game, "draw");
    expect(tokensNamed(game, "Elemental Token (Rekindling Phoenix)", A)).toBe(0);
    const back = game.battlefield.find((id) => game.state.objects[id].cardName === "Rekindling Phoenix");
    expect(back).toBeDefined();
    expect(keywords(game, back!).has("haste")).toBe(true);
  });

  it("with no Phoenix in the graveyard, the Elemental isn't sacrificed", () => {
    const { game } = table();
    game.debugApplyEffect(A, { kind: "create-token", token: "Elemental Token (Rekindling Phoenix)", count: 1 });
    expect(tokensNamed(game, "Elemental Token (Rekindling Phoenix)", A)).toBe(1);
    toStep(game, "draw");
    expect(tokensNamed(game, "Elemental Token (Rekindling Phoenix)", A)).toBe(1);
  });
});

describe("Vraska, Scheming Gorgon", () => {
  it("−10: a creature you control dealing damage to an opponent makes them lose, noncombat too", () => {
    const { game } = table();
    const vraska = spawn(game, "Vraska, Scheming Gorgon");
    const bears = spawn(game, "Grizzly Bears");
    loyalty(game, vraska, -10, { atLeast: 10 });
    expect(keywords(game, bears).has("deathtouch")).toBe(true);
    game.debugApplyEffect(A, { kind: "damage", amount: 1, target: 0 }, [ref(B)], { source: bears });
    game.advanceUntil((s) => quiet(s) || s.result.over);
    expect(game.state.result.winner).toBe(A);
  });

  it("−10 reaches only the creatures you control as it resolves", () => {
    const { game } = table();
    const vraska = spawn(game, "Vraska, Scheming Gorgon");
    loyalty(game, vraska, -10, { atLeast: 10 });
    const later = spawn(game, "Grizzly Bears");
    expect(keywords(game, later).has("deathtouch")).toBe(false);
  });
});

describe("Vraska's Conquistador", () => {
  it("drains 2 on attack only while you control a Vraska planeswalker", () => {
    const { game, a } = table();
    const conquistador = spawn(game, "Vraska's Conquistador");
    attack(game, a, [conquistador]);
    expect(life(game, B)).toBe(18);
    expect(life(game, A)).toBe(20);

    const second = table();
    const other = spawn(second.game, "Vraska's Conquistador");
    spawn(second.game, "Vraska, Scheming Gorgon");
    pickTargets(second.a, B);
    attack(second.game, second.a, [other]);
    expect(life(second.game, B)).toBe(16);
    expect(life(second.game, A)).toBe(22);
  });
});

describe("Needletooth Raptor", () => {
  it("being dealt damage deals 5 to target creature an opponent controls", () => {
    const { game, a } = table();
    const raptor = spawn(game, "Needletooth Raptor");
    const theirs = spawn(game, "Hill Giant", B);
    pickTargets(a, theirs);
    game.debugApplyEffect(B, { kind: "damage", amount: 1, target: 0 }, [ref(raptor)], { source: theirs });
    game.advanceUntil(quiet);
    expect(zone(game, theirs)).toBe("graveyard");
    expect(zone(game, raptor)).toBe("battlefield");
  });
});

describe("Tendershoot Dryad", () => {
  it("Saprolings you control get +2/+2 only with the city's blessing", () => {
    const { game } = table();
    spawn(game, "Tendershoot Dryad");
    lands(game, "Forest", 7);
    game.debugApplyEffect(A, { kind: "create-token", token: "Saproling Token", count: 1 });
    check(game);
    const saproling = game.battlefield.find((id) => game.state.objects[id].cardName === "Saproling Token")!;
    expect(blessed(game)).toBe(false);
    expect(pt(game, saproling)).toEqual({ power: 1, toughness: 1 });
    lands(game, "Forest", 1);
    toStep(game, "declare-attackers");
    expect(blessed(game)).toBe(true);
    expect(pt(game, saproling)).toEqual({ power: 3, toughness: 3 });
  });
});

describe("Andúril, Narsil Reforged", () => {
  it("equipped creature attacking puts a +1/+1 counter on each creature you control, two with the blessing", () => {
    const { game, a } = table();
    const anduril = spawn(game, "Andúril, Narsil Reforged");
    const bears = spawn(game, "Grizzly Bears");
    const other = spawn(game, "Grizzly Bears");
    const theirs = spawn(game, "Grizzly Bears", B);
    lands(game, "Wastes", 3);
    activate(game, anduril, 0, { targets: [ref(bears)] });
    attack(game, a, [bears]);
    expect(counters(game, bears)).toBe(1);
    expect(counters(game, other)).toBe(1);
    expect(counters(game, theirs)).toBe(0);

    const second = table();
    const sword = spawn(second.game, "Andúril, Narsil Reforged");
    const wielder = spawn(second.game, "Grizzly Bears");
    lands(second.game, "Wastes", 9);
    activate(second.game, sword, 0, { targets: [ref(wielder)] });
    attack(second.game, second.a, [wielder]);
    expect(second.game.state.players[A].citysBlessing).toBe(true);
    expect(counters(second.game, wielder)).toBe(2);
  });
});

describe("Pride of Conquerors", () => {
  it("+2/+2 when its own ascend gives the blessing, +1/+1 otherwise", () => {
    const { game } = table();
    lands(game, "Plains", 8);
    const bears = spawn(game, "Grizzly Bears");
    cast(game, toHand(game, "Pride of Conquerors"));
    expect(pt(game, bears)).toEqual({ power: 3, toughness: 3 });

    const second = table();
    lands(second.game, "Plains", 9);
    const wielder = spawn(second.game, "Grizzly Bears");
    cast(second.game, toHand(second.game, "Pride of Conquerors"));
    expect(second.game.state.players[A].citysBlessing).toBe(true);
    expect(pt(second.game, wielder)).toEqual({ power: 4, toughness: 4 });
  });
});

describe("Tomb Robber", () => {
  it("{1}, discard a card: it explores", () => {
    const { game } = table();
    const robber = spawn(game, "Tomb Robber");
    lands(game, "Wastes", 1);
    toLibrary(game, "Grizzly Bears");
    const before = hand(game).length;
    activate(game, robber);
    expect(hand(game).length).toBe(before - 1);
    expect(counters(game, robber)).toBe(1);
  });
});

describe("Fanatical Firebrand", () => {
  it("{T}, sacrifice it: 1 damage to any target", () => {
    const { game } = table();
    const firebrand = spawn(game, "Fanatical Firebrand");
    activate(game, firebrand, 0, { targets: [ref(B)] });
    expect(life(game, B)).toBe(19);
    expect(zone(game, firebrand)).toBe("graveyard");
  });
});
