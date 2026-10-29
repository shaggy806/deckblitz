/**
 * A count read from one player's side (the need-keys
 * `amount:count-for-chosen-player` group): a `countOf`'s `forPlayer` — the
 * chosen player, a target's controller, the player a trigger names — and a
 * characteristic-defining ability or count-scaled bonus counted for the
 * chosen player (`forChosenPlayer`), with "each opponent … that player
 * controls" read once per player (`forEachPlayer`).
 */
import { describe, expect, it } from "vitest";

import type { Game } from "../game.js";
import type { ObjectId } from "../primitives.js";

import {
  A,
  B,
  C,
  attack,
  cast,
  hand,
  lands,
  life,
  pt,
  ref,
  settle,
  spawn,
  table,
  toGraveyard,
  toHand,
} from "./harness.js";

/** Cast `name` from A's hand and let it resolve: its enter choice is made. */
function castIn(game: Game, name: string): ObjectId {
  const card = toHand(game, name);
  cast(game, card);
  settle(game);
  return card;
}

describe("counted for the chosen player", () => {
  it("Lost Order of Jarkeld counts the chosen opponent's creatures, not the others'", () => {
    const { game, a } = table({ players: 3 });
    a.chooseCreatureTypeFn = () => C;
    spawn(game, "Grizzly Bears", A);
    spawn(game, "Grizzly Bears", B);
    for (let i = 0; i < 3; i++) spawn(game, "Grizzly Bears", C);
    lands(game, "Plains", 4);
    const order = castIn(game, "Lost Order of Jarkeld");
    expect(game.state.objects[order].chosenPlayer).toBe(C);
    expect(pt(game, order)).toEqual({ power: 4, toughness: 4 });
    spawn(game, "Grizzly Bears", C);
    expect(pt(game, order)).toEqual({ power: 5, toughness: 5 });
  });

  it("is 1/1 with nobody chosen, and once the chosen player has left the game", () => {
    const { game } = table({ players: 3 });
    spawn(game, "Grizzly Bears", B);
    const loose = spawn(game, "Lost Order of Jarkeld");
    expect(pt(game, loose)).toEqual({ power: 1, toughness: 1 });
    lands(game, "Plains", 4);
    const order = castIn(game, "Lost Order of Jarkeld");
    expect(pt(game, order).power).toBeGreaterThan(1);
    game.concede(game.state.objects[order].chosenPlayer!);
    settle(game);
    expect(pt(game, order)).toEqual({ power: 1, toughness: 1 });
  });

  it("Entropic Specter is as big as the chosen player's hand", () => {
    const { game } = table();
    const before = hand(game, B).length;
    for (let i = 0; i < 3; i++) toHand(game, "Wastes", B);
    toHand(game, "Wastes", A);
    lands(game, "Swamp", 5);
    const specter = castIn(game, "Entropic Specter");
    expect(pt(game, specter)).toEqual({ power: before + 3, toughness: before + 3 });
  });

  it("Nyxathid gets -1/-1 for each card in the chosen player's hand, live", () => {
    const { game } = table();
    for (const card of [...hand(game, B)]) game.debugMove(card, "library");
    for (let i = 0; i < 2; i++) toHand(game, "Wastes", B);
    toHand(game, "Wastes", A);
    lands(game, "Swamp", 3);
    const nyx = castIn(game, "Nyxathid");
    expect(pt(game, nyx)).toEqual({ power: 5, toughness: 5 });
    toHand(game, "Wastes", B);
    expect(pt(game, nyx)).toEqual({ power: 4, toughness: 4 });
  });
});

describe("counted for one named player", () => {
  it("Weight of Spires counts the nonbasic lands of the creature's controller", () => {
    const { game } = table();
    lands(game, "Mountain", 1);
    lands(game, "Ancient Tomb", 4);
    lands(game, "Ancient Tomb", 2, B);
    lands(game, "Wastes", 3, B);
    // Hill Giant is 3/3: B's two nonbasic lands, not A's four.
    const giant = spawn(game, "Hill Giant", B);
    cast(game, toHand(game, "Weight of Spires"), { targets: [ref(giant)] });
    settle(game);
    expect(game.state.objects[giant].zone).toBe("battlefield");
    expect(game.state.objects[giant].damageMarked).toBe(2);
  });

  it("Emissary of Hope gains life for the artifacts of the player it hit", () => {
    const { game, a } = table();
    for (let i = 0; i < 3; i++) spawn(game, "Sol Ring", B);
    spawn(game, "Sol Ring", A);
    const emissary = spawn(game, "Emissary of Hope");
    attack(game, a, [emissary]);
    settle(game);
    expect(life(game, B)).toBe(18);
    expect(life(game, A)).toBe(23);
  });

  it("Nature's Resurgence draws each player their own graveyard's creature cards", () => {
    const { game } = table();
    lands(game, "Forest", 4);
    toGraveyard(game, "Grizzly Bears", A);
    for (let i = 0; i < 3; i++) toGraveyard(game, "Grizzly Bears", B);
    toGraveyard(game, "Forest", B);
    const handA = hand(game, A).length;
    const handB = hand(game, B).length;
    cast(game, toHand(game, "Nature's Resurgence"));
    settle(game);
    expect(hand(game, A).length).toBe(handA + 1);
    expect(hand(game, B).length).toBe(handB + 3);
  });

  it("Typhoon deals each opponent damage by their own Islands", () => {
    const { game } = table({ players: 3 });
    lands(game, "Forest", 3);
    lands(game, "Island", 4);
    lands(game, "Island", 2, B);
    lands(game, "Island", 5, C);
    cast(game, toHand(game, "Typhoon"));
    settle(game);
    expect(life(game, A)).toBe(20);
    expect(life(game, B)).toBe(18);
    expect(life(game, C)).toBe(15);
  });
});
