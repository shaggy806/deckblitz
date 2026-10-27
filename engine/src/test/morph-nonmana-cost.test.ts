import { describe, expect, it } from "vitest";

import type { Action } from "../actions.js";
import type { Game } from "../game.js";
import type { ObjectId } from "../primitives.js";
import {
  A,
  B,
  cast,
  enter,
  graveyard,
  hand,
  lands,
  life,
  pickPermanents,
  pickTargets,
  pt,
  settle,
  table,
  toHand,
  zone,
} from "./harness.js";

/**
 * Morph costs that aren't mana (`MorphCost.also` — rule 702.37e): "Morph—Pay
 * 5 life", "Morph—Sacrifice two Mountains", "Morph—Discard a card",
 * "Morph—Return a Bird you control to its owner's hand". Paid as the
 * permanent is turned face up, its choices made while it's still face down
 * (so a face-down permanent, with no subtypes, never pays its own cost); a
 * cost that can't be paid isn't offered.
 */

const faceDownCast = (game: Game, card: ObjectId): void => cast(game, card, { via: "face-down", settle: true });

const ups = (game: Game, permanent: ObjectId) =>
  game.legalActions(A).filter((a) => a.kind === "turn-face-up" && a.permanent === permanent);

const turnUp = (game: Game, permanent: ObjectId): void => {
  game.dispatch({ type: "turn-face-up", player: A, permanent, morph: true } as Action);
};

describe("a morph cost that isn't mana", () => {
  it("Zombie Cutthroat is turned face up for 5 life, and not without 5 life to pay", () => {
    const { game } = table();
    lands(game, "Wastes", 3);
    const cutthroat = toHand(game, "Zombie Cutthroat");
    faceDownCast(game, cutthroat);
    expect(ups(game, cutthroat).map((a) => (a.kind === "turn-face-up" ? a.cost : ""))).toEqual(["Pay 5 life"]);
    game.state.players[A].life = 4;
    expect(ups(game, cutthroat)).toHaveLength(0);
    game.state.players[A].life = 20;
    turnUp(game, cutthroat);
    settle(game);
    expect(life(game)).toBe(15);
    expect(game.state.objects[cutthroat].faceDown).toBeUndefined();
    expect(pt(game, cutthroat)).toEqual({ power: 3, toughness: 4 });
  });

  it("Skirk Volcanist sacrifices two Mountains, chosen, and its trigger divides 3 damage", () => {
    const { game, a } = table();
    lands(game, "Wastes", 3);
    const mountains = lands(game, "Mountain", 3);
    const volcanist = toHand(game, "Skirk Volcanist");
    faceDownCast(game, volcanist);
    const bears = enter(game, "Grizzly Bears", B);
    a.chooseSacrificesFn = () => [mountains[0], mountains[2]];
    pickTargets(a, bears);
    turnUp(game, volcanist);
    settle(game);
    expect(zone(game, mountains[0])).toBe("graveyard");
    expect(zone(game, mountains[2])).toBe("graveyard");
    expect(zone(game, mountains[1])).toBe("battlefield");
    expect(zone(game, bears)).toBe("graveyard");
    expect(game.state.objects[volcanist].faceDown).toBeUndefined();
  });

  it("isn't offered with too few permanents to sacrifice", () => {
    const { game } = table();
    lands(game, "Wastes", 3);
    lands(game, "Mountain", 1);
    const volcanist = toHand(game, "Skirk Volcanist");
    faceDownCast(game, volcanist);
    expect(ups(game, volcanist)).toHaveLength(0);
  });

  it("Putrid Raptor discards a Zombie card, never another card", () => {
    const { game } = table();
    lands(game, "Wastes", 3);
    const raptor = toHand(game, "Putrid Raptor");
    faceDownCast(game, raptor);
    // Only non-Zombies in hand: no way to pay.
    expect(ups(game, raptor)).toHaveLength(0);
    const zombie = toHand(game, "Gravecrawler");
    const others = hand(game).filter((id) => id !== zombie);
    // The one Zombie card is the only way to pay: discarded without asking.
    turnUp(game, raptor);
    settle(game);
    expect(graveyard(game)).toEqual([zombie]);
    expect(hand(game)).toEqual(others);
    expect(game.state.objects[raptor].faceDown).toBeUndefined();
  });

  it("Raven Guild Initiate returns a Bird you control, never itself", () => {
    const { game, a } = table();
    lands(game, "Wastes", 3);
    const initiate = toHand(game, "Raven Guild Initiate");
    faceDownCast(game, initiate);
    expect(ups(game, initiate)).toHaveLength(0);
    const birds = [enter(game, "Birds of Paradise"), enter(game, "Suntail Hawk")];
    const seen = pickPermanents(a, birds[1]);
    turnUp(game, initiate);
    settle(game);
    expect([...seen.offered].sort()).toEqual([...birds].sort());
    expect(hand(game)).toContain(birds[1]);
    expect(zone(game, birds[0])).toBe("battlefield");
    expect(zone(game, initiate)).toBe("battlefield");
    expect(game.state.objects[initiate].faceDown).toBeUndefined();
  });

  it("Fathom Seer returns two Islands and draws two as it's turned face up", () => {
    const { game } = table();
    lands(game, "Wastes", 3);
    const islands = lands(game, "Island", 2);
    const seer = toHand(game, "Fathom Seer");
    faceDownCast(game, seer);
    const before = hand(game).length;
    turnUp(game, seer);
    settle(game);
    for (const island of islands) expect(hand(game)).toContain(island);
    expect(hand(game).length).toBe(before + 4);
  });

  it("Gathan Raiders discards the card its controller picks to turn face up", () => {
    const { game, a } = table();
    lands(game, "Wastes", 3);
    const raiders = toHand(game, "Gathan Raiders");
    faceDownCast(game, raiders);
    const picked = hand(game)[2];
    const before = hand(game).length;
    a.chooseDiscardsFn = () => [picked];
    turnUp(game, raiders);
    settle(game);
    expect(graveyard(game)).toContain(picked);
    expect(hand(game).length).toBe(before - 1);
    // Not hellbent while cards are left in hand.
    expect(pt(game, raiders)).toEqual({ power: 3, toughness: 3 });
  });
});
