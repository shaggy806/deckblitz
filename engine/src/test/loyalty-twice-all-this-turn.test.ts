/**
 * "You may activate the loyalty abilities of planeswalkers you control twice
 * this turn rather than only once" (Urza Assembles the Titans' chapter III):
 * Oath of Teferi's static (rule 606.3's exception) as a `timed-static` on its
 * controller for the turn. It changes no object's characteristics, so it's a
 * rule for the turn that reaches a planeswalker arriving later (rule 611.2c),
 * read by `controlsActiveStatic` off the emblem it rides. Twice is still twice
 * beside Oath of Teferi (the card's ruling). Its other chapters: scry 4 and a
 * revealed planeswalker into the hand, and a planeswalker of mana value 6 or
 * less put from the hand onto the battlefield.
 */

import { describe, expect, it } from "vitest";

import type { ScriptedController } from "../controller.js";
import type { Game } from "../game.js";
import type { ObjectId } from "../primitives.js";
import { A, hand, lands, loyalty, nextTurn, pickFromZone, pickModes, settle, spawn, table, toHand, toLibrary, zone } from "./harness.js";

const SAGA = "Urza Assembles the Titans";

/** Cast the Saga, answering read ahead with `chapter`. */
function castSaga(game: Game, a: ScriptedController, chapter: "1" | "2" | "3"): ObjectId {
  lands(game, "Plains", 5);
  a.chooseCreatureTypeFn = () => chapter;
  const card = toHand(game, SAGA);
  game.dispatch({ type: "cast-spell", player: A, card, targets: [] });
  settle(game);
  return card;
}

describe("Urza Assembles the Titans — chapter III", () => {
  it("each planeswalker you control may activate twice this turn, the Saga gone or not", () => {
    const { game, a } = table();
    for (let i = 0; i < 6; i++) toLibrary(game, "Wastes");
    const jace = spawn(game, "Jace Beleren");
    const saga = castSaga(game, a, "3");
    // Sacrificed after its final chapter (rule 714.4); the turn's rule stays.
    expect(zone(game, saga)).toBe("graveyard");
    const cards = hand(game).length;
    loyalty(game, jace, 2);
    loyalty(game, jace, 2);
    expect(hand(game).length).toBe(cards + 2);
    expect(() => loyalty(game, jace, 2)).toThrow(/loyalty|activat/i);
  });

  it("reaches a planeswalker that arrives after it resolved", () => {
    const { game, a } = table();
    for (let i = 0; i < 6; i++) toLibrary(game, "Wastes");
    castSaga(game, a, "3");
    const jace = spawn(game, "Jace Beleren");
    loyalty(game, jace, 2);
    loyalty(game, jace, 2);
    expect(() => loyalty(game, jace, 2)).toThrow(/loyalty|activat/i);
  });

  it("lasts this turn only", () => {
    const { game, a } = table();
    for (let i = 0; i < 10; i++) toLibrary(game, "Wastes");
    const jace = spawn(game, "Jace Beleren");
    castSaga(game, a, "3");
    nextTurn(game);
    nextTurn(game);
    loyalty(game, jace, 2);
    expect(() => loyalty(game, jace, 2)).toThrow(/loyalty|activat/i);
  });

  it("isn't additive with Oath of Teferi", () => {
    const { game, a } = table();
    for (let i = 0; i < 6; i++) toLibrary(game, "Wastes");
    spawn(game, "Oath of Teferi");
    const jace = spawn(game, "Jace Beleren");
    castSaga(game, a, "3");
    loyalty(game, jace, 2);
    loyalty(game, jace, 2);
    expect(() => loyalty(game, jace, 2)).toThrow(/loyalty|activat/i);
  });

  it("without it, rule 606.3's once", () => {
    const { game } = table();
    for (let i = 0; i < 6; i++) toLibrary(game, "Wastes");
    const jace = spawn(game, "Jace Beleren");
    loyalty(game, jace, 2);
    expect(() => loyalty(game, jace, 2)).toThrow(/loyalty|activat/i);
  });
});

describe("Urza Assembles the Titans — chapters I and II", () => {
  it("I: scry 4, then a revealed planeswalker card goes to the hand", () => {
    const { game, a } = table();
    const walker = toLibrary(game, "Jace Beleren");
    pickModes(a, 0);
    castSaga(game, a, "1");
    expect(zone(game, walker)).toBe("hand");
  });

  it("I: a revealed card that isn't a planeswalker stays on top", () => {
    const { game, a } = table();
    const land = toLibrary(game, "Forest");
    pickModes(a, 0);
    castSaga(game, a, "1");
    expect(zone(game, land)).toBe("library");
    expect(game.state.zones.perPlayer[A].library[0]).toBe(land);
  });

  it("II: a planeswalker card of mana value 6 or less from the hand onto the battlefield", () => {
    const { game, a } = table();
    const jace = toHand(game, "Jace Beleren");
    const ugin = toHand(game, "Ugin, the Spirit Dragon");
    const offer = pickFromZone(a, jace);
    castSaga(game, a, "2");
    expect(offer.offered).toContain(jace);
    expect(offer.offered).not.toContain(ugin);
    expect(zone(game, jace)).toBe("battlefield");
    expect(zone(game, ugin)).toBe("hand");
  });
});
