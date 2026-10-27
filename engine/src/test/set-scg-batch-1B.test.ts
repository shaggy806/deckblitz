/**
 * Scourge (SCG; B216), group B. One test per card whose behaviour is more
 * than a stat line or an exact copy of an already-tested pattern, on the
 * clause most likely to be wrong.
 */
import { describe, expect, it } from "vitest";

import type { Action } from "../actions.js";
import type { ObjectId } from "../primitives.js";
import type { Game } from "../game.js";
import {
  A,
  B,
  cast,
  controller,
  enter,
  graveyard,
  hand,
  lands,
  life,
  nextTurn,
  pickFromZone,
  pickModes,
  ref,
  settle,
  spawn,
  table,
  toGraveyard,
  toHand,
  zone,
} from "./harness.js";

/** Cast `name` face down for {3}, then turn it face up for its morph cost. */
function morphUp(game: Game, name: string): ObjectId {
  const card = toHand(game, name);
  cast(game, card, { via: "face-down" });
  game.dispatch({ type: "turn-face-up", player: A, permanent: card, morph: true } as Action);
  settle(game);
  expect(game.state.objects[card].faceDown).toBeFalsy();
  return card;
}

describe("Call to the Grave", () => {
  it("makes the active player sacrifice a non-Zombie creature at their upkeep", () => {
    const { game } = table();
    spawn(game, "Call to the Grave");
    const zombie = spawn(game, "Dregscape Zombie", B);
    const bears = spawn(game, "Grizzly Bears", B);
    nextTurn(game, "draw");
    expect(zone(game, bears)).toBe("graveyard");
    expect(zone(game, zombie)).toBe("battlefield");
  });
});

describe("Root Elemental", () => {
  it("puts a creature card from your hand onto the battlefield when turned face up", () => {
    const { game, a } = table();
    lands(game, "Forest", 10);
    const giant = toHand(game, "Hill Giant");
    pickFromZone(a, giant);
    morphUp(game, "Root Elemental");
    expect(zone(game, giant)).toBe("battlefield");
  });
});

describe("Riptide Survivor", () => {
  it("discards two, then draws three, when turned face up", () => {
    const { game } = table();
    lands(game, "Island", 6);
    const card = toHand(game, "Riptide Survivor");
    const before = hand(game).length;
    cast(game, card, { via: "face-down" });
    const gyBefore = graveyard(game).length;
    game.dispatch({ type: "turn-face-up", player: A, permanent: card, morph: true } as Action);
    settle(game);
    // The Survivor left the hand (-1), then -2 discarded +3 drawn.
    expect(hand(game).length).toBe(before - 1 - 2 + 3);
    expect(graveyard(game).length).toBe(gyBefore + 2);
  });
});

describe("Dragon Breath", () => {
  it("returns from your graveyard attached to any player's entering creature with mana value 6 or greater", () => {
    const { game, a } = table();
    const breath = toGraveyard(game, "Dragon Breath");
    pickModes(a, 0);
    enter(game, "Hill Giant", B);
    expect(zone(game, breath)).toBe("graveyard");
    const tyrant = enter(game, "Dragon Tyrant", B);
    expect(zone(game, breath)).toBe("battlefield");
    expect(game.state.objects[breath].attachedTo).toBe(tyrant);
    expect(controller(game, breath)).toBe(A);
  });
});

describe("Cabal Conditioning", () => {
  it("each target player discards cards equal to the greatest mana value among your permanents", () => {
    const { game } = table();
    lands(game, "Swamp", 7);
    spawn(game, "Hill Giant");
    const bobBefore = hand(game, B).length;
    cast(game, toHand(game, "Cabal Conditioning"), { targets: [ref(B)] });
    expect(hand(game, B).length).toBe(bobBefore - 4);
  });
});

describe("Final Punishment", () => {
  it("target player loses life equal to the damage dealt to them this turn", () => {
    const { game } = table();
    lands(game, "Mountain", 1);
    lands(game, "Swamp", 5);
    cast(game, toHand(game, "Lightning Bolt"), { targets: [ref(B)] });
    expect(life(game, B)).toBe(17);
    cast(game, toHand(game, "Final Punishment"), { targets: [ref(B)] });
    expect(life(game, B)).toBe(14);
  });
});
