/**
 * Shadowmoor, batch 1E (B180 group E). One test per card on its riskiest
 * clause; stat lines and exact copies of tested patterns are left to
 * pool.test.
 */
import { describe, expect, it } from "vitest";

import { computeCharacteristics } from "../characteristics.js";

import {
  A,
  B,
  activate,
  cast,
  counters,
  hand,
  keywords,
  lands,
  life,
  pt,
  ref,
  registryOf,
  spawn,
  table,
  toGraveyard,
  toHand,
  zone,
} from "./harness.js";

describe("Guttural Response", () => {
  it("counters a blue instant spell", () => {
    const { game } = table();
    lands(game, "Island", 1);
    lands(game, "Mountain", 1);
    const opt = toHand(game, "Opt");
    const response = toHand(game, "Guttural Response");
    cast(game, opt, { settle: false });
    cast(game, response, { targets: [ref(opt)] });
    expect(zone(game, opt)).toBe("graveyard");
    expect(zone(game, response)).toBe("graveyard");
  });
});

describe("Viridescent Wisps", () => {
  it("makes the creature green only, +1/+0, and draws", () => {
    const { game } = table();
    lands(game, "Forest", 1);
    const wurm = spawn(game, "Wind Drake", B);
    const wisps = toHand(game, "Viridescent Wisps");
    const before = hand(game).length;
    cast(game, wisps, { targets: [ref(wurm)] });
    expect(computeCharacteristics(game.state, registryOf(game), wurm).colors).toEqual(new Set(["G"]));
    expect(pt(game, wurm)).toEqual({ power: 3, toughness: 2 });
    expect(hand(game).length).toBe(before); // the Wisps left, a card came in
  });
});

describe("Faerie Macabre", () => {
  it("is discarded from the hand to exile two cards from graveyards", () => {
    const { game } = table();
    const macabre = toHand(game, "Faerie Macabre");
    const g1 = toGraveyard(game, "Grizzly Bears", B);
    const g2 = toGraveyard(game, "Lightning Bolt", B);
    activate(game, macabre, 0, { targets: [ref(g1), ref(g2)] });
    expect(zone(game, macabre)).toBe("graveyard");
    expect(zone(game, g1)).toBe("exile");
    expect(zone(game, g2)).toBe("exile");
  });
});

describe("Resplendent Mentor", () => {
  it("gives another white creature \"{T}: You gain 1 life\"", () => {
    const { game } = table();
    spawn(game, "Resplendent Mentor");
    const lions = spawn(game, "Savannah Lions");
    activate(game, lions, 0);
    expect(life(game, A)).toBe(21);
  });
});

describe("Barrenton Medic", () => {
  it("untaps itself for a -1/-1 counter", () => {
    const { game } = table();
    const medic = spawn(game, "Barrenton Medic", A, { tapped: true });
    activate(game, medic, 1);
    expect(game.state.objects[medic].tapped).toBe(false);
    expect(counters(game, medic, "-1/-1")).toBe(1);
    expect(pt(game, medic)).toEqual({ power: -1, toughness: 3 });
  });
});

describe("Faerie Swarm", () => {
  it("counts the blue permanents you control, itself included", () => {
    const { game } = table();
    const swarm = spawn(game, "Faerie Swarm");
    spawn(game, "Wind Drake");
    spawn(game, "Wind Drake", B);
    expect(pt(game, swarm)).toEqual({ power: 2, toughness: 2 });
  });
});

describe("Watchwing Scarecrow", () => {
  it("has flying with a blue creature and vigilance only with a white one", () => {
    const { game } = table();
    const crow = spawn(game, "Watchwing Scarecrow");
    expect(keywords(game, crow).has("flying")).toBe(false);
    spawn(game, "Wind Drake");
    expect(keywords(game, crow).has("flying")).toBe(true);
    expect(keywords(game, crow).has("vigilance")).toBe(false);
    spawn(game, "Savannah Lions");
    expect(keywords(game, crow).has("vigilance")).toBe(true);
  });
});

describe("Godhead of Awe", () => {
  it("makes every other creature base 1/1, counters still on top", () => {
    const { game } = table();
    const wurm = spawn(game, "Craw Wurm", B);
    const bears = spawn(game, "Grizzly Bears");
    game.state.objects[bears].counters["+1/+1"] = 1;
    const godhead = spawn(game, "Godhead of Awe");
    expect(pt(game, wurm)).toEqual({ power: 1, toughness: 1 });
    expect(pt(game, bears)).toEqual({ power: 2, toughness: 2 });
    expect(pt(game, godhead)).toEqual({ power: 4, toughness: 4 });
  });
});

describe("Thoughtweft Gambit", () => {
  it("taps the opponents' creatures and untaps yours", () => {
    const { game } = table();
    lands(game, "Plains", 6);
    const theirs = spawn(game, "Grizzly Bears", B);
    const mine = spawn(game, "Grizzly Bears", A, { tapped: true });
    cast(game, toHand(game, "Thoughtweft Gambit"));
    expect(game.state.objects[theirs].tapped).toBe(true);
    expect(game.state.objects[mine].tapped).toBe(false);
  });
});
