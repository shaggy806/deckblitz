/**
 * Portal and Portal Second Age (POR, P02; B190), group A. One test per card
 * whose behaviour is more than a stat line, on the clause most likely to be
 * wrong.
 */
import { describe, expect, it } from "vitest";

import {
  A,
  B,
  blockOffer,
  cast,
  enter,
  graveyard,
  hand,
  lands,
  life,
  pickPermanents,
  ref,
  settle,
  spawn,
  table,
  toGraveyard,
  toHand,
  toStep,
  nextTurn,
  zone,
} from "./harness.js";

describe("Flux", () => {
  it("each player discards as many as they choose and draws that many; the caster draws one more", () => {
    const { game, a, b } = table();
    const card = toHand(game, "Flux");
    lands(game, "Island", 3);
    a.chooseDiscardsFn = (h) => h.slice(0, 2).map((o) => o.id);
    b.chooseDiscardsFn = () => [];
    const aBefore = hand(game, A).length;
    const bBefore = hand(game, B).length;
    const aGrave = graveyard(game, A).length;
    cast(game, card);
    // Alice: −1 (Flux) −2 discarded +2 drawn +1 drawn.
    expect(hand(game, A).length).toBe(aBefore - 1 - 2 + 2 + 1);
    expect(graveyard(game, A).length).toBe(aGrave + 3);
    expect(hand(game, B).length).toBe(bBefore);
  });
});

describe("Apprentice Sorcerer", () => {
  it("can be activated in your precombat main phase, not in the second main phase or on an opponent's turn", () => {
    const { game } = table();
    const sorcerer = spawn(game, "Apprentice Sorcerer");
    const act = { type: "activate-ability" as const, player: A, source: sorcerer, abilityIndex: 0, targets: [ref(B)] };
    expect(game.canDispatch(act)).toBeNull();
    toStep(game, "postcombat-main");
    expect(game.canDispatch(act)).not.toBeNull();
    nextTurn(game);
    game.advanceUntil((s) => s.priority.holder === A && s.zones.shared.stack.length === 0);
    expect(game.canDispatch(act)).not.toBeNull();
    toStep(game, "precombat-main");
    game.dispatch(act);
    settle(game);
    expect(life(game, B)).toBe(19);
  });
});

describe("Goblin Firestarter", () => {
  it("is sacrificed to deal 1 damage, before attackers are declared", () => {
    const { game } = table();
    const goblin = spawn(game, "Goblin Firestarter");
    const act = { type: "activate-ability" as const, player: A, source: goblin, abilityIndex: 0, targets: [ref(B)] };
    toStep(game, "postcombat-main");
    expect(game.canDispatch(act)).not.toBeNull();
    toStep(game, "precombat-main");
    game.dispatch(act);
    settle(game);
    expect(zone(game, goblin)).toBe("graveyard");
    expect(life(game, B)).toBe(19);
  });
});

describe("Sacred Knight", () => {
  it("can't be blocked by a black or a red creature, but can by a green one", () => {
    const { game, a } = table();
    const knight = spawn(game, "Sacred Knight");
    const zombies = spawn(game, "Scathe Zombies", B);
    const giant = spawn(game, "Hill Giant", B);
    const bears = spawn(game, "Grizzly Bears", B);
    const offer = blockOffer(game, a, [knight]);
    const canBlock = (blocker: string): readonly string[] =>
      offer.eligible.find((e) => e.blocker === blocker)?.canBlock ?? [];
    expect(canBlock(zombies)).toEqual([]);
    expect(canBlock(giant)).toEqual([]);
    expect(canBlock(bears)).toEqual([knight]);
  });
});

describe("Harmony of Nature", () => {
  it("gains 4 life for each creature tapped", () => {
    const { game, a } = table();
    const one = spawn(game, "Grizzly Bears");
    const two = spawn(game, "Grizzly Bears");
    spawn(game, "Grizzly Bears");
    lands(game, "Forest", 3);
    pickPermanents(a, one, two);
    cast(game, toHand(game, "Harmony of Nature"));
    expect(life(game, A)).toBe(28);
    expect(game.state.objects[one].tapped).toBe(true);
  });
});

describe("Righteous Fury", () => {
  it("destroys only tapped creatures, 2 life each", () => {
    const { game } = table();
    const tapped = spawn(game, "Grizzly Bears", B, { tapped: true });
    const mine = spawn(game, "Grizzly Bears", A, { tapped: true });
    const untapped = spawn(game, "Grizzly Bears", B);
    lands(game, "Plains", 6);
    cast(game, toHand(game, "Righteous Fury"));
    expect(zone(game, tapped)).toBe("graveyard");
    expect(zone(game, mine)).toBe("graveyard");
    expect(zone(game, untapped)).toBe("battlefield");
    expect(life(game, A)).toBe(24);
  });
});

describe("Return of the Nightstalkers", () => {
  it("returns Nightstalkers, then destroys only your Swamps", () => {
    const { game } = table();
    const stalker = toGraveyard(game, "Lurking Nightstalker");
    const bears = toGraveyard(game, "Grizzly Bears");
    const swamps = lands(game, "Swamp", 7);
    const theirs = spawn(game, "Swamp", B);
    cast(game, toHand(game, "Return of the Nightstalkers"));
    expect(zone(game, stalker)).toBe("battlefield");
    expect(zone(game, bears)).toBe("graveyard");
    expect(swamps.every((s) => zone(game, s) === "graveyard")).toBe(true);
    expect(zone(game, theirs)).toBe("battlefield");
  });
});

describe("Foul Spirit", () => {
  it("sacrifices a land as it enters", () => {
    const { game, a } = table();
    const [land] = lands(game, "Swamp", 1);
    pickPermanents(a, land);
    enter(game, "Foul Spirit");
    expect(zone(game, land)).toBe("graveyard");
  });
});
