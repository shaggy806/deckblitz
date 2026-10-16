/**
 * Set walk batch 86, part i (2026-10-15): cards blocked on expend, freerunning, forage and valiant, authored now they're built.
 * Written on the shared table in `harness.ts`.
 */
import { describe, expect, it } from "vitest";

import type { Game } from "../game.js";
import type { ObjectId } from "../primitives.js";

import {
  A,
  B,
  attack,
  cast,
  destroy,
  enter,
  grant,
  hand,
  keywords,
  lands,
  life,
  pt,
  ref,
  spawn,
  table,
  toGraveyard,
  toHand,
  toLibrary,
  tokensNamed,
  named,
  zone,
} from "./harness.js";

const freerunningOffers = (game: Game, card: ObjectId) =>
  game.legalActions(A).filter((a) => a.kind === "cast-spell" && a.card === card && a.via === "freerunning");
const castOffers = (game: Game, card: ObjectId) =>
  game.legalActions(A).filter((a) => a.kind === "cast-spell" && a.card === card);
const exiled = (game: Game): readonly ObjectId[] => game.state.zones.shared.exile;
const isTapped = (game: Game, id: ObjectId): boolean => game.state.objects[id].tapped === true;

/** Alice's Hired Blade (an Assassin) hits bob; the game is at her postcombat main. */
function assassinHit(game: Game, seat: Parameters<typeof attack>[1]): ObjectId {
  const blade = spawn(game, "Hired Blade");
  attack(game, seat, [blade]);
  return blade;
}

describe("Achilles Davenport", () => {
  it("other Assassins you control get +1/+1, not itself or an opponent's; menace", () => {
    const { game } = table();
    const achilles = spawn(game, "Achilles Davenport");
    const blade = spawn(game, "Hired Blade");
    const theirs = spawn(game, "Hired Blade", B);
    const bears = spawn(game, "Grizzly Bears");
    const base = pt(game, theirs);
    expect(pt(game, achilles)).toEqual({ power: 3, toughness: 3 });
    expect(pt(game, blade)).toEqual({ power: base.power + 1, toughness: base.toughness + 1 });
    expect(pt(game, bears)).toEqual({ power: 2, toughness: 2 });
    expect(keywords(game, achilles).has("menace")).toBe(true);
  });

  it("is cast for {U}{B} once an Assassin dealt combat damage this turn", () => {
    const { game, a } = table();
    lands(game, "Underground Sea", 2);
    const achilles = toHand(game, "Achilles Davenport");
    expect(freerunningOffers(game, achilles)).toHaveLength(0);
    assassinHit(game, a);
    expect(freerunningOffers(game, achilles)).toHaveLength(1);
    cast(game, achilles, { via: "freerunning" });
    expect(zone(game, achilles)).toBe("battlefield");
  });
});

describe("Brotherhood Ambushers", () => {
  it("a 6/3 cast for {3}{B} by freerunning, which four lands pay where its {4}{B} wouldn't", () => {
    const { game, a } = table();
    lands(game, "Swamp", 4);
    const ambushers = toHand(game, "Brotherhood Ambushers");
    expect(castOffers(game, ambushers)).toHaveLength(0);
    assassinHit(game, a);
    cast(game, ambushers, { via: "freerunning" });
    expect(zone(game, ambushers)).toBe("battlefield");
    expect(pt(game, ambushers)).toEqual({ power: 6, toughness: 3 });
  });
});

describe("Chain Assassination", () => {
  it("destroys the target, and draws nothing when no other creature died this turn", () => {
    const { game } = table();
    lands(game, "Swamp", 4);
    const victim = spawn(game, "Grizzly Bears", B);
    const spell = toHand(game, "Chain Assassination");
    const before = hand(game).length;
    cast(game, spell, { targets: [ref(victim)] });
    expect(zone(game, victim)).toBe("graveyard");
    expect(hand(game).length).toBe(before - 1);
  });

  it("draws when another creature died this turn too", () => {
    const { game } = table();
    lands(game, "Swamp", 4);
    destroy(game, spawn(game, "Grizzly Bears"));
    const victim = spawn(game, "Grizzly Bears", B);
    const spell = toHand(game, "Chain Assassination");
    const before = hand(game).length;
    cast(game, spell, { targets: [ref(victim)] });
    expect(zone(game, victim)).toBe("graveyard");
    expect(hand(game).length).toBe(before - 1 + 1);
  });

  it("an indestructible target survives, and one other death this turn still draws (the ruling)", () => {
    const { game } = table();
    lands(game, "Swamp", 4);
    destroy(game, spawn(game, "Grizzly Bears", B));
    const victim = spawn(game, "Grizzly Bears", B);
    grant(game, victim, "indestructible");
    const spell = toHand(game, "Chain Assassination");
    const before = hand(game).length;
    cast(game, spell, { targets: [ref(victim)] });
    expect(zone(game, victim)).toBe("battlefield");
    expect(hand(game).length).toBe(before - 1 + 1);
  });

  it("an indestructible target with no death this turn draws nothing", () => {
    const { game } = table();
    lands(game, "Swamp", 4);
    const victim = spawn(game, "Grizzly Bears", B);
    grant(game, victim, "indestructible");
    const spell = toHand(game, "Chain Assassination");
    const before = hand(game).length;
    cast(game, spell, { targets: [ref(victim)] });
    expect(hand(game).length).toBe(before - 1);
  });

  it("is cast for {1}{B} by freerunning", () => {
    const { game, a } = table();
    lands(game, "Swamp", 2);
    const victim = spawn(game, "Grizzly Bears", B);
    const spell = toHand(game, "Chain Assassination");
    assassinHit(game, a);
    cast(game, spell, { via: "freerunning", targets: [ref(victim)] });
    expect(zone(game, victim)).toBe("graveyard");
  });
});

describe("Distract the Guards", () => {
  it("creates three 1/1 white Human Rogues, for {1}{W} by freerunning", () => {
    const { game, a } = table();
    lands(game, "Plains", 2);
    const spell = toHand(game, "Distract the Guards");
    assassinHit(game, a);
    cast(game, spell, { via: "freerunning" });
    expect(tokensNamed(game, "Human Rogue Token", A)).toBe(3);
    const rogue = named(game, "Human Rogue Token", A)[0];
    expect(pt(game, rogue)).toEqual({ power: 1, toughness: 1 });
    expect([...game.characteristics(rogue).colors]).toEqual(["W"]);
    expect(game.characteristics(rogue).subtypes).toEqual(expect.arrayContaining(["Human", "Rogue"]));
  });
});

describe("Merciless Harlequin", () => {
  it("draws a card and loses 1 life as it enters", () => {
    const { game } = table();
    const before = hand(game).length;
    enter(game, "Merciless Harlequin");
    expect(hand(game).length).toBe(before + 1);
    expect(life(game)).toBe(19);
  });
});

describe("Monastery Raid", () => {
  it("exiles the top two cards, playable", () => {
    const { game } = table();
    lands(game, "Mountain", 3);
    const forest = toLibrary(game, "Forest");
    const raid = toHand(game, "Monastery Raid");
    cast(game, raid);
    expect(exiled(game)).toHaveLength(2);
    expect(zone(game, forest)).toBe("exile");
    expect(game.legalActions(A).some((x) => x.kind === "play-land" && x.card === forest)).toBe(true);
  });

  it("exiles the top X instead when its freerunning cost {X}{R} was paid", () => {
    const { game, a } = table();
    lands(game, "Mountain", 5);
    const raid = toHand(game, "Monastery Raid");
    assassinHit(game, a);
    cast(game, raid, { via: "freerunning", x: 4 });
    expect(exiled(game)).toHaveLength(4);
  });
});

describe("Overpowering Attack", () => {
  it("untaps the creatures you control that attacked, and adds a combat phase and a main phase", () => {
    const { game, a } = table();
    lands(game, "Mountain", 3);
    const bears = spawn(game, "Grizzly Bears");
    const idle = spawn(game, "Grizzly Bears", A, { tapped: true });
    const blade = assassinHit(game, a);
    expect(isTapped(game, blade)).toBe(true);
    const lifeAfterOne = life(game, B);
    const spell = toHand(game, "Overpowering Attack");
    cast(game, spell, { via: "freerunning" });
    expect(isTapped(game, blade)).toBe(false);
    expect(isTapped(game, idle)).toBe(true);
    // The additional combat: the blade and the bears attack again this turn.
    const turn = game.state.turn.number;
    a.declareAttackersFn = () => [blade, bears].map((attacker) => ({ attacker, defender: B }));
    game.advanceUntil((s) => s.turn.step === "end");
    expect(game.state.turn.number).toBe(turn);
    expect(life(game, B)).toBe(lifeAfterOne - pt(game, blade).power - 2);
    // A main phase followed it.
    expect(game.state.turn.combatPhases).toBe(2);
    expect(game.state.turn.mainPhases).toBe(3);
  });
});

describe("Petty Larceny", () => {
  it("exiles target opponent's top two face down for you to play with mana of any type, and makes a Treasure", () => {
    const { game, a } = table();
    lands(game, "Swamp", 2);
    const second = toLibrary(game, "Grizzly Bears", B);
    const top = toLibrary(game, "Forest", B);
    const spell = toHand(game, "Petty Larceny");
    assassinHit(game, a);
    cast(game, spell, { via: "freerunning", targets: [ref(B)] });
    expect(zone(game, top)).toBe("exile");
    expect(zone(game, second)).toBe("exile");
    expect(game.state.objects[second].exiledFaceDown?.lookers).toEqual([A]);
    expect(tokensNamed(game, "Treasure Token", A)).toBe(1);
    // Bob's land is alice's to play, and his Bears hers to cast off Swamps
    // alone (the Treasure gone, so no mana of the right colour is at hand).
    destroy(game, named(game, "Treasure Token", A)[0]);
    lands(game, "Swamp", 2);
    expect(game.legalActions(A).some((x) => x.kind === "play-land" && x.card === top)).toBe(true);
    cast(game, second, { via: "impulse" });
    expect(zone(game, second)).toBe("battlefield");
    expect(game.state.objects[second].controller).toBe(A);
  });
});

describe("Restart Sequence", () => {
  it("returns target creature card from your graveyard to the battlefield, for {1}{B} by freerunning", () => {
    const { game, a } = table();
    lands(game, "Swamp", 2);
    const bears = toGraveyard(game, "Grizzly Bears");
    const spell = toHand(game, "Restart Sequence");
    assassinHit(game, a);
    cast(game, spell, { via: "freerunning", targets: [ref(bears)] });
    expect(zone(game, bears)).toBe("battlefield");
  });
});
