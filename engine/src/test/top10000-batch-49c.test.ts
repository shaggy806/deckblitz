/**
 * Card batch 49, part c (2026-10-11): ranks 6866–6886. Written on the shared
 * table in `harness.ts`.
 */
import { describe, expect, it } from "vitest";

import { printedCardName } from "../state.js";
import {
  A,
  B,
  C,
  activate,
  cast,
  controller,
  counters,
  destroy,
  enter,
  graveyard,
  hand,
  keywords,
  lands,
  nextTurn,
  pickModes,
  pickTargets,
  pt,
  ref,
  settle,
  spawn,
  table,
  toGraveyard,
  toHand,
  toStep,
  tokensNamed,
  watchTargets,
  zone,
} from "./harness.js";

describe("Claim the Firstborn", () => {
  it("steals, untaps and hastes a creature with mana value 3 or less, and can't target a bigger one", () => {
    const { game } = table();
    lands(game, "Mountain", 2);
    const bears = spawn(game, "Grizzly Bears", B, { tapped: true, sick: true });
    const giant = spawn(game, "Hill Giant", B);
    expect(() => cast(game, toHand(game, "Claim the Firstborn"), { targets: [ref(giant)] })).toThrow();
    cast(game, toHand(game, "Claim the Firstborn"), { targets: [ref(bears)] });
    expect(controller(game, bears)).toBe(A);
    expect(game.state.objects[bears].tapped).toBe(false);
    expect(keywords(game, bears).has("haste")).toBe(true);
    nextTurn(game);
    expect(controller(game, bears)).toBe(B);
  });
});

describe("Werefox Bodyguard", () => {
  it("exiles another non-Fox creature until it leaves the battlefield", () => {
    const { game, a } = table();
    const bears = spawn(game, "Grizzly Bears", B);
    const fox = spawn(game, "Werefox Bodyguard", B);
    const seen = watchTargets(a, () => [bears]);
    const bodyguard = enter(game, "Werefox Bodyguard");
    expect(seen.asked).toBe(1);
    expect(seen.offered[0]).toContain(bears);
    expect(seen.offered[0]).not.toContain(fox);
    expect(seen.offered[0]).not.toContain(bodyguard);
    expect(zone(game, bears)).toBe("exile");
    destroy(game, bodyguard);
    settle(game);
    const back = game.battlefield.filter((id) => game.state.objects[id].cardName === "Grizzly Bears");
    expect(back).toHaveLength(1);
  });
});

describe("Zimone, Quandrix Prodigy", () => {
  it("draws two with eight or more lands as it resolves, one with fewer", () => {
    const { game } = table();
    const zimone = spawn(game, "Zimone, Quandrix Prodigy");
    lands(game, "Forest", 7);
    let before = hand(game).length;
    activate(game, zimone, 1);
    expect(hand(game).length).toBe(before + 1);
    nextTurn(game);
    nextTurn(game);
    lands(game, "Forest", 1);
    before = hand(game).length;
    activate(game, zimone, 1);
    expect(hand(game).length).toBe(before + 2);
  });
});

describe("Cryptic Trilobite", () => {
  it("enters with X counters for {X}{X}, and its mana pays for abilities but not spells", () => {
    const { game } = table();
    lands(game, "Wastes", 4);
    const trilobite = toHand(game, "Cryptic Trilobite");
    cast(game, trilobite, { x: 2 });
    expect(zone(game, trilobite)).toBe("battlefield");
    expect(counters(game, trilobite)).toBe(2);
    game.state.objects[trilobite].summoningSick = false;

    activate(game, trilobite, 0);
    expect(counters(game, trilobite)).toBe(1);
    expect(game.state.players[A].manaPool).toHaveLength(2);
    // Sol Ring's {1} can't be paid with it.
    expect(() => cast(game, toHand(game, "Sol Ring"))).toThrow();
    // Its own {1}, {T} can.
    activate(game, trilobite, 1);
    expect(counters(game, trilobite)).toBe(2);
    expect(game.state.players[A].manaPool).toHaveLength(1);
  });
});

describe("The Circle of Loyalty", () => {
  it("costs {1} less per Knight you control, and makes a Knight whenever you cast a legendary spell", () => {
    const { game } = table();
    lands(game, "Plains", 4);
    spawn(game, "Werefox Bodyguard"); // a Knight
    spawn(game, "Werefox Bodyguard");
    spawn(game, "Werefox Bodyguard", B); // not yours
    const circle = toHand(game, "The Circle of Loyalty");
    cast(game, circle);
    expect(zone(game, circle)).toBe("battlefield");
    expect(tokensNamed(game, "Knight Token", A)).toBe(0);

    lands(game, "Plains", 1);
    cast(game, toHand(game, "Isamaru, Hound of Konda"));
    expect(tokensNamed(game, "Knight Token", A)).toBe(1);
    lands(game, "Forest", 2);
    cast(game, toHand(game, "Grizzly Bears"));
    expect(tokensNamed(game, "Knight Token", A)).toBe(1);
  });

  it("doesn't reduce its coloured mana: one Plains isn't enough with four Knights", () => {
    const { game } = table();
    lands(game, "Plains", 1);
    for (let i = 0; i < 4; i++) spawn(game, "Werefox Bodyguard");
    expect(() => cast(game, toHand(game, "The Circle of Loyalty"))).toThrow();
  });
});

describe("Old One Eye", () => {
  it("makes a 5/5 Tyranid as it enters, and other creatures you control have trample", () => {
    const { game } = table();
    const bears = spawn(game, "Grizzly Bears");
    const theirs = spawn(game, "Grizzly Bears", B);
    enter(game, "Old One Eye");
    expect(tokensNamed(game, "5/5 Tyranid Token", A)).toBe(1);
    expect(keywords(game, bears).has("trample")).toBe(true);
    expect(keywords(game, theirs).has("trample")).toBe(false);
  });

  it("returns from your graveyard at your first main phase if you discard two cards", () => {
    const { game, a } = table();
    const eye = toGraveyard(game, "Old One Eye");
    const fodder = [toHand(game, "Grizzly Bears"), toHand(game, "Hill Giant")];
    a.chooseDiscardsFn = () => fodder;
    pickModes(a, 0);
    nextTurn(game); // bob's turn: not "your" main phase
    settle(game);
    expect(zone(game, eye)).toBe("graveyard");
    toStep(game, "precombat-main");
    settle(game);
    expect(zone(game, eye)).toBe("hand");
    expect(graveyard(game)).toEqual(expect.arrayContaining(fodder));
  });

  it("isn't returned with fewer than two cards to discard", () => {
    const { game, a } = table();
    const eye = toGraveyard(game, "Old One Eye");
    pickModes(a, 0);
    // Alice's hand is the one card she draws next turn.
    for (const id of [...hand(game)]) game.debugMove(id, "library");
    toStep(game, "precombat-main");
    settle(game);
    expect(hand(game)).toHaveLength(1);
    expect(zone(game, eye)).toBe("graveyard");
  });
});

describe("Elminster's Simulacrum", () => {
  it("makes you a token copy of up to one creature each opponent controls", () => {
    const { game } = table({ players: 3 });
    lands(game, "Island", 6);
    const giant = spawn(game, "Hill Giant", B);
    const angel = spawn(game, "Serra Angel", C);
    cast(game, toHand(game, "Elminster's Simulacrum"), { targets: [ref(giant), ref(angel), null] });
    expect(tokensNamed(game, "Hill Giant", A)).toBe(1);
    expect(tokensNamed(game, "Serra Angel", A)).toBe(1);
    expect(tokensNamed(game, "Hill Giant", B)).toBe(0);
  });

  it("takes no target from your own creatures", () => {
    const { game } = table();
    lands(game, "Island", 12);
    const mine = spawn(game, "Hill Giant");
    const theirs = spawn(game, "Grizzly Bears", B);
    expect(() => cast(game, toHand(game, "Elminster's Simulacrum"), { targets: [ref(mine), null, null] })).toThrow();
    cast(game, toHand(game, "Elminster's Simulacrum"), { targets: [ref(theirs), null, null] });
    expect(tokensNamed(game, "Grizzly Bears", A)).toBe(1);
    expect(tokensNamed(game, "Hill Giant", A)).toBe(0);
  });
});

describe("Cephalid Facetaker", () => {
  it("becomes a 1/4 unblockable copy of another creature until end of turn", () => {
    const { game, a } = table();
    const facetaker = spawn(game, "Cephalid Facetaker");
    const angel = spawn(game, "Serra Angel", B);
    pickTargets(a, angel);
    pickModes(a, 0);
    toStep(game, "begin-combat");
    settle(game);
    const name = (): string => printedCardName(game.state.objects[facetaker]);
    expect(name()).toBe("Serra Angel");
    expect(pt(game, facetaker)).toEqual({ power: 1, toughness: 4 });
    expect(keywords(game, facetaker).has("flying")).toBe(true);
    expect(keywords(game, facetaker).has("unblockable")).toBe(true);
    nextTurn(game);
    expect(name()).toBe("Cephalid Facetaker");
    expect(keywords(game, facetaker).has("flying")).toBe(false);
    expect(keywords(game, facetaker).has("unblockable")).toBe(true);
  });
});
