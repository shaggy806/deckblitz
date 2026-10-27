/**
 * Mirrodin (MRD; B215), group A. One test per card whose behaviour is more
 * than a stat line, on the clause most likely to be wrong.
 */
import { describe, expect, it } from "vitest";

import {
  A,
  B,
  activate,
  attack,
  cast,
  counters,
  graveyard,
  lands,
  life,
  named,
  nextTurn,
  pickModes,
  pickPermanents,
  pt,
  ref,
  settle,
  spawn,
  table,
  toGraveyard,
  toHand,
  toStep,
  tokensNamed,
  zone,
} from "./harness.js";

describe("Sun Droplet", () => {
  it("takes charge counters for damage dealt to you, and trades one for 1 life on an opponent's upkeep", () => {
    const { game, a } = table();
    const droplet = spawn(game, "Sun Droplet");
    game.debugApplyEffect(B, { kind: "damage", amount: 3, target: 0 }, [ref(A)]);
    settle(game);
    expect(counters(game, droplet, "charge")).toBe(3);
    expect(life(game)).toBe(17);
    pickModes(a, 0);
    nextTurn(game);
    expect(counters(game, droplet, "charge")).toBe(2);
    expect(life(game)).toBe(18);
  });
});

describe("Living Hive", () => {
  it("makes an Insect for each point of combat damage it deals a player", () => {
    const { game, a } = table();
    const hive = spawn(game, "Living Hive");
    attack(game, a, [hive]);
    expect(life(game, B)).toBe(14);
    expect(tokensNamed(game, "Insect Token", A)).toBe(6);
  });
});

describe("One Dozen Eyes", () => {
  it("entwined, makes the 5/5 Beast and five Insects", () => {
    const { game } = table();
    lands(game, "Forest", 9);
    cast(game, toHand(game, "One Dozen Eyes"), { kicked: true, modes: [0, 1] });
    const [beast] = named(game, "5/5 Beast Token", A);
    expect(pt(game, beast)).toEqual({ power: 5, toughness: 5 });
    expect(tokensNamed(game, "Insect Token", A)).toBe(5);
  });
});

describe("Electrostatic Bolt", () => {
  it("deals 4 to an artifact creature and 2 to any other", () => {
    const { game } = table();
    lands(game, "Mountain", 2);
    const suChi = spawn(game, "Su-Chi", B);
    const giant = spawn(game, "Hill Giant", B);
    cast(game, toHand(game, "Electrostatic Bolt"), { targets: [ref(suChi)] });
    expect(zone(game, suChi)).toBe("graveyard");
    cast(game, toHand(game, "Electrostatic Bolt"), { targets: [ref(giant)] });
    expect(zone(game, giant)).toBe("battlefield");
  });
});

describe("Nim Devourer", () => {
  it("returns from the graveyard during your upkeep, then you sacrifice a creature", () => {
    const { game, a } = table();
    lands(game, "Swamp", 2);
    const bears = spawn(game, "Grizzly Bears");
    const devourer = toGraveyard(game, "Nim Devourer");
    spawn(game, "Ornithopter");
    toStep(game, "upkeep");
    pickPermanents(a, bears);
    activate(game, devourer);
    const [back] = named(game, "Nim Devourer", A);
    expect(back).toBeDefined();
    expect(zone(game, bears)).toBe("graveyard");
    expect(graveyard(game)).toContain(bears);
    expect(pt(game, back)).toEqual({ power: 5, toughness: 1 });
  });
});
