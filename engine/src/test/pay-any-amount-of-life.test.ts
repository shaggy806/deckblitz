/**
 * "Pay any amount of life" by the effect's controller alone — the
 * `players-pay-any-amount` of `who: "you"` (rules 107.1c, 119.4, 119.4b):
 * Plunge into Darkness's "pay any amount of life, then look at that many cards
 * from the top of your library. Put one of those cards into your hand and
 * exile the rest", and its other mode, "sacrifice any number of creatures. You
 * gain 3 life for each creature sacrificed this way", both with entwine.
 */

import { describe, expect, it } from "vitest";

import type { Game } from "../game.js";
import type { PlayerId } from "../primitives.js";
import {
  A,
  B,
  cast,
  counters,
  graveyard,
  hand,
  lands,
  life,
  pickFromZone,
  pickPermanents,
  settle,
  spawn,
  table,
  toHand,
  toLibrary,
  zone,
} from "./harness.js";

/** `player`, asked how much life to pay, answers `n`. */
const payLife = (game: Game, player: PlayerId, n: number): void => {
  game.advanceUntil((s) => s.awaiting?.kind === "choose-number");
  expect(game.state.awaiting).toMatchObject({ kind: "choose-number", player });
  game.dispatch({ type: "choose-number", player, number: n });
};

describe("Plunge into Darkness", () => {
  it("pays the life chosen, then one of that many cards into the hand and the rest exiled", () => {
    const { game, a } = table();
    lands(game, "Swamp", 2);
    const bottom = toLibrary(game, "Island");
    const third = toLibrary(game, "Forest");
    const second = toLibrary(game, "Mountain");
    const top = toLibrary(game, "Plains");
    pickFromZone(a, second);
    cast(game, toHand(game, "Plunge into Darkness"), { modes: [1], settle: false });
    payLife(game, A, 3);
    // Its caster alone pays: nobody else is asked.
    expect(game.state.awaiting?.kind).not.toBe("choose-number");
    settle(game);
    expect(life(game, A)).toBe(17);
    expect(life(game, B)).toBe(20);
    expect(zone(game, second)).toBe("hand");
    expect(zone(game, top)).toBe("exile");
    expect(zone(game, third)).toBe("exile");
    expect(zone(game, bottom)).toBe("library");
  });

  it("the life is paid, for 'whenever you pay life' (Font of Agonies)", () => {
    const { game } = table();
    lands(game, "Swamp", 2);
    const font = spawn(game, "Font of Agonies");
    cast(game, toHand(game, "Plunge into Darkness"), { modes: [1], settle: false });
    payLife(game, A, 3);
    settle(game);
    expect(counters(game, font, "blood")).toBe(3);
  });

  it("paying 0 looks at nothing", () => {
    const { game } = table();
    lands(game, "Swamp", 2);
    const top = toLibrary(game, "Plains");
    const before = hand(game, A).length;
    cast(game, toHand(game, "Plunge into Darkness"), { modes: [1], settle: false });
    payLife(game, A, 0);
    settle(game);
    expect(life(game, A)).toBe(20);
    expect(zone(game, top)).toBe("library");
    expect(hand(game, A).length).toBe(before);
  });

  it("asks no more than the life its caster has", () => {
    const { game } = table();
    lands(game, "Swamp", 2);
    game.state.players[A].life = 4;
    cast(game, toHand(game, "Plunge into Darkness"), { modes: [1], settle: false });
    game.advanceUntil((s) => s.awaiting?.kind === "choose-number");
    expect(game.state.awaiting).toMatchObject({ kind: "choose-number", player: A, max: 4 });
    expect(() => game.dispatch({ type: "choose-number", player: A, number: 5 })).toThrow();
  });

  it("sacrifices any number of creatures, 3 life for each", () => {
    const { game, a } = table();
    lands(game, "Swamp", 2);
    const bears = spawn(game, "Grizzly Bears");
    const elves = spawn(game, "Llanowar Elves");
    const kept = spawn(game, "Grizzly Bears");
    spawn(game, "Grizzly Bears", B);
    const seen = pickPermanents(a, bears, elves);
    cast(game, toHand(game, "Plunge into Darkness"), { modes: [0] });
    expect([...seen.offered].sort()).toEqual([bears, elves, kept].sort());
    expect(graveyard(game, A)).toEqual(expect.arrayContaining([bears, elves]));
    expect(zone(game, kept)).toBe("battlefield");
    expect(life(game, A)).toBe(26);
  });

  it("entwined: both, the sacrifice and its life first", () => {
    const { game, a } = table();
    lands(game, "Swamp", 3);
    const bears = spawn(game, "Grizzly Bears");
    const second = toLibrary(game, "Mountain");
    const top = toLibrary(game, "Plains");
    pickPermanents(a, bears);
    pickFromZone(a, top);
    cast(game, toHand(game, "Plunge into Darkness"), { modes: [0, 1], kicked: true, settle: false });
    payLife(game, A, 2);
    settle(game);
    expect(zone(game, bears)).toBe("graveyard");
    expect(life(game, A)).toBe(21);
    expect(zone(game, top)).toBe("hand");
    expect(zone(game, second)).toBe("exile");
  });
});
