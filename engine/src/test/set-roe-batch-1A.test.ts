/**
 * Rise of the Eldrazi, group A: the clauses most likely to go wrong — level
 * bands on activated, triggered and protection abilities, Dog Umbra's
 * control-switched umbra armor, Drana's split X, See Beyond's shuffle,
 * Rapacious One's "that many", Baneful Omen's revealed mana value.
 */
import { describe, expect, it } from "vitest";

import {
  A,
  B,
  activate,
  attack,
  cast,
  destroy,
  graveyard,
  hand,
  keywords,
  lands,
  life,
  pickFromZone,
  pickModes,
  pt,
  ref,
  settle,
  spawn,
  table,
  toHand,
  toLibrary,
  toStep,
  tokensNamed,
  zone,
} from "./harness.js";
import type { Game } from "../game.js";
import type { ObjectId } from "../primitives.js";

const level = (game: Game, id: ObjectId, n: number): void => {
  game.debugApplyEffect(A, { kind: "add-counter", target: 0, counter: "level", amount: n }, [ref(id)]);
};

describe("Rise of the Eldrazi group A", () => {
  it("Guul Draz Assassin: no -2/-2 ability below level 2, -2/-2 at 2-3, -4/-4 at 4+", () => {
    const { game } = table();
    lands(game, "Swamp", 3);
    const assassin = spawn(game, "Guul Draz Assassin");
    const victim = spawn(game, "Hill Giant", B);
    expect(() => activate(game, assassin, 1, { targets: [ref(victim)] })).toThrow();
    level(game, assassin, 2);
    expect(pt(game, assassin)).toEqual({ power: 2, toughness: 2 });
    expect(() => activate(game, assassin, 2, { targets: [ref(victim)] })).toThrow();
    activate(game, assassin, 1, { targets: [ref(victim)] });
    expect(pt(game, victim)).toEqual({ power: 1, toughness: 1 });
  });

  it("Lord of Shatterskull Pass: the attack trigger exists only at level 6+", () => {
    const { game, a } = table();
    const lord = spawn(game, "Lord of Shatterskull Pass");
    const giant = spawn(game, "Hill Giant", B);
    level(game, lord, 5);
    expect(pt(game, lord)).toEqual({ power: 6, toughness: 6 });
    attack(game, a, [lord]);
    expect(zone(game, giant)).toBe("battlefield");
  });

  it("Lord of Shatterskull Pass at level 6 deals 6 to each creature the defending player controls", () => {
    const { game, a } = table();
    const lord = spawn(game, "Lord of Shatterskull Pass");
    const mine = spawn(game, "Hill Giant");
    const giant = spawn(game, "Hill Giant", B);
    level(game, lord, 6);
    attack(game, a, [lord]);
    expect(zone(game, giant)).toBe("graveyard");
    expect(zone(game, mine)).toBe("battlefield");
  });

  it("Hexdrinker at level 3 is 4/4 and an instant can't target it", () => {
    const { game } = table();
    const hex = spawn(game, "Hexdrinker");
    lands(game, "Mountain", 1, B);
    level(game, hex, 3);
    expect(pt(game, hex)).toEqual({ power: 4, toughness: 4 });
    const bolt = toHand(game, "Lightning Bolt", B);
    expect(() => cast(game, bolt, { targets: [ref(hex)] })).toThrow();
  });

  it("Null Champion regenerates only at level 4+", () => {
    const { game } = table();
    lands(game, "Swamp", 2);
    const champ = spawn(game, "Null Champion");
    level(game, champ, 3);
    expect(pt(game, champ)).toEqual({ power: 4, toughness: 2 });
    expect(() => activate(game, champ, 1)).toThrow();
    level(game, champ, 1);
    expect(pt(game, champ)).toEqual({ power: 7, toughness: 3 });
    activate(game, champ, 1);
    destroy(game, champ);
    expect(zone(game, champ)).toBe("battlefield");
  });

  it("Halimar Wavewatch has islandwalk only at level 5+", () => {
    const { game } = table();
    const wave = spawn(game, "Halimar Wavewatch");
    level(game, wave, 4);
    expect(pt(game, wave)).toEqual({ power: 0, toughness: 6 });
    expect(keywords(game, wave).has("islandwalk")).toBe(false);
    level(game, wave, 1);
    expect(pt(game, wave)).toEqual({ power: 6, toughness: 6 });
    expect(keywords(game, wave).has("islandwalk")).toBe(true);
  });

  it("Time of Heroes: +2/+2 to a creature with a level counter, however many", () => {
    const { game } = table();
    spawn(game, "Time of Heroes");
    const student = spawn(game, "Student of Warfare");
    const bears = spawn(game, "Grizzly Bears");
    expect(pt(game, student)).toEqual({ power: 1, toughness: 1 });
    level(game, student, 1);
    expect(pt(game, student)).toEqual({ power: 3, toughness: 3 });
    expect(pt(game, bears)).toEqual({ power: 2, toughness: 2 });
  });

  it("Dog Umbra on your own creature has umbra armor", () => {
    const { game } = table();
    lands(game, "Plains", 2);
    const bears = spawn(game, "Grizzly Bears");
    const umbra = toHand(game, "Dog Umbra");
    cast(game, umbra, { targets: [ref(bears)] });
    expect(keywords(game, umbra).has("umbra-armor")).toBe(true);
    destroy(game, bears);
    expect(zone(game, bears)).toBe("battlefield");
    expect(graveyard(game)).toContain(umbra);
  });

  it("Dog Umbra on an opponent's creature: the Aura has no umbra armor", () => {
    const { game } = table();
    lands(game, "Plains", 2);
    const bears = spawn(game, "Grizzly Bears", B);
    const umbra = toHand(game, "Dog Umbra");
    cast(game, umbra, { targets: [ref(bears)] });
    expect(keywords(game, umbra).has("umbra-armor")).toBe(false);
    destroy(game, bears, A);
    expect(zone(game, bears)).toBe("graveyard");
  });

  it("Drana: -0/-X on the target, +X/+0 on Drana", () => {
    const { game } = table();
    lands(game, "Swamp", 5);
    const drana = spawn(game, "Drana, Kalastria Bloodchief");
    const giant = spawn(game, "Hill Giant", B);
    activate(game, drana, 0, { targets: [ref(giant)], x: 2 });
    expect(pt(game, giant)).toEqual({ power: 3, toughness: 1 });
    expect(pt(game, drana)).toEqual({ power: 6, toughness: 4 });
  });

  it("See Beyond: draws two, then the chosen card goes into the library", () => {
    const { game, a } = table();
    lands(game, "Island", 2);
    for (let i = 0; i < 4; i += 1) toLibrary(game, "Island");
    const spell = toHand(game, "See Beyond");
    const before = hand(game).length;
    const keep = hand(game).find((id) => id !== spell)!;
    pickFromZone(a, keep);
    cast(game, spell);
    settle(game);
    expect(hand(game).length).toBe(before - 1 + 2 - 1);
    expect(zone(game, keep)).toBe("library");
  });

  it("Rapacious One makes a Spawn for each point of combat damage", () => {
    const { game, a } = table();
    const one = spawn(game, "Rapacious One");
    attack(game, a, [one]);
    expect(tokensNamed(game, "Eldrazi Spawn Token", A)).toBe(5);
  });

  it("Baneful Omen: each opponent loses life equal to the revealed card's mana value", () => {
    const { game, a } = table();
    spawn(game, "Baneful Omen");
    toLibrary(game, "Hill Giant");
    pickModes(a, 0);
    const before = life(game, B);
    toStep(game, "end", A);
    settle(game);
    expect(life(game, B)).toBe(before - 4);
  });
});
