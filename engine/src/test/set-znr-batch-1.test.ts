/**
 * Zendikar Rising and its Commander decks (ZNR, ZNC; B114) — the party cards
 * the lead authored with the feature (rule 700.8).
 */
import { describe, expect, it } from "vitest";

import {
  A,
  B,
  cast,
  keywords,
  lands,
  life,
  pickTargets,
  pt,
  ref,
  settle,
  spawn,
  table,
  toHand,
  toStep,
  tokensNamed,
  zone,
  enter,
} from "./harness.js";

describe("Archpriest of Iona", () => {
  it("has power equal to the party, itself included", () => {
    const { game } = table();
    const archpriest = spawn(game, "Archpriest of Iona");
    expect(pt(game, archpriest)).toEqual({ power: 1, toughness: 2 });
    spawn(game, "Academy Raider");
    spawn(game, "Abbey Matron"); // a second Cleric adds nothing
    expect(pt(game, archpriest)).toEqual({ power: 2, toughness: 2 });
  });

  it("at combat with a full party, gives a creature +1/+1 and flying; without one, nothing", () => {
    const { game, a } = table();
    const archpriest = spawn(game, "Archpriest of Iona");
    spawn(game, "Academy Raider");
    spawn(game, "Aetherblade Agent");
    const bears = spawn(game, "Grizzly Bears", B);
    pickTargets(a, bears);
    toStep(game, "begin-combat");
    settle(game);
    expect(pt(game, bears)).toEqual({ power: 2, toughness: 2 });
    toStep(game, "precombat-main", B);
    spawn(game, "Aether Adept");
    pickTargets(a, bears);
    toStep(game, "begin-combat");
    settle(game);
    expect(pt(game, bears)).toEqual({ power: 3, toughness: 3 });
    expect(keywords(game, bears).has("flying")).toBe(true);
    expect(pt(game, archpriest).power).toBe(4);
  });
});

describe("Ravager's Mace", () => {
  it("attaches as it enters; +1/+0 per party creature, and menace", () => {
    const { game, a } = table();
    const raider = spawn(game, "Academy Raider"); // a 1/1 Warrior
    const base = pt(game, raider);
    pickTargets(a, raider);
    const mace = enter(game, "Ravager's Mace");
    expect(game.state.objects[mace].attachedTo).toBe(raider);
    expect(pt(game, raider)).toEqual({ power: base.power + 1, toughness: base.toughness });
    expect(keywords(game, raider).has("menace")).toBe(true);
    spawn(game, "Aetherblade Agent");
    spawn(game, "Abbey Matron");
    expect(pt(game, raider)).toEqual({ power: base.power + 3, toughness: base.toughness });
  });
});

describe("Squad Commander", () => {
  it("makes a Kor Warrior for each creature in the party, counting itself", () => {
    const { game } = table();
    spawn(game, "Abbey Matron");
    spawn(game, "Academy Raider"); // a second Warrior: Squad Commander fills that role either way
    enter(game, "Squad Commander");
    expect(tokensNamed(game, "Kor Warrior Token", A)).toBe(2);
  });

  it("at combat with a full party, creatures get +1/+0 and indestructible", () => {
    const { game } = table();
    const commander = spawn(game, "Squad Commander");
    spawn(game, "Abbey Matron");
    spawn(game, "Aetherblade Agent");
    spawn(game, "Aether Adept");
    toStep(game, "begin-combat");
    settle(game);
    expect(pt(game, commander)).toEqual({ power: 4, toughness: 3 });
    expect(keywords(game, commander).has("indestructible")).toBe(true);
  });
});

describe("Malakir Blood-Priest", () => {
  it("drains each opponent for the party size", () => {
    const { game } = table({ players: 3 });
    spawn(game, "Academy Raider");
    enter(game, "Malakir Blood-Priest");
    expect(life(game, A)).toBe(22);
    expect(life(game, B)).toBe(18);
  });
});

describe("party cost reductions", () => {
  it("Deadly Alliance costs {1} less per party creature, never below its colored pip", () => {
    const { game } = table();
    spawn(game, "Abbey Matron");
    spawn(game, "Academy Raider");
    spawn(game, "Aetherblade Agent");
    const bears = spawn(game, "Grizzly Bears", B);
    lands(game, "Swamp", 2);
    const alliance = toHand(game, "Deadly Alliance");
    cast(game, alliance, { targets: [ref(bears)] });
    expect(zone(game, bears)).toBe("graveyard");
  });

  it("a creature spell doesn't count itself: Sea Gate Colossus with no party costs seven", () => {
    const { game } = table();
    lands(game, "Wastes", 6);
    const colossus = toHand(game, "Sea Gate Colossus");
    expect(() => cast(game, colossus)).toThrow();
    spawn(game, "Abbey Matron");
    cast(game, colossus);
    expect(zone(game, colossus)).toBe("battlefield");
  });
});

