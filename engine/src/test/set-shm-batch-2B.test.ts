// Shadowmoor (SHM), batch 2 group B: the clause of each card most likely to be wrong.
import { describe, expect, it } from "vitest";
import {
  A,
  B,
  activate,
  cast,
  counters,
  graveyard,
  hand,
  keywords,
  lands,
  pickFromZone,
  pickModes,
  pickTargets,
  pt,
  ref,
  spawn,
  table,
  toHand,
  toLibrary,
  toStep,
  tokensNamed,
  zone,
} from "./harness.js";

describe("SHM batch 2 group B", () => {
  it("Puncture Bolt deals 1 damage and puts a -1/-1 counter on the creature", () => {
    const { game } = table();
    lands(game, "Mountain", 2);
    const giant = spawn(game, "Hill Giant", B);
    cast(game, toHand(game, "Puncture Bolt"), { targets: [ref(giant)] });
    expect(counters(game, giant, "-1/-1")).toBe(1);
    expect(pt(game, giant)).toEqual({ power: 2, toughness: 2 });
    expect(zone(game, giant)).toBe("battlefield");
    lands(game, "Mountain", 2);
    const bears = spawn(game, "Grizzly Bears", B);
    cast(game, toHand(game, "Puncture Bolt"), { targets: [ref(bears)] });
    expect(zone(game, bears)).toBe("graveyard");
  });

  it("Ballynock Cohort gets +1/+1 only with another white creature", () => {
    const { game } = table();
    const cohort = spawn(game, "Ballynock Cohort");
    expect(pt(game, cohort)).toEqual({ power: 2, toughness: 2 });
    spawn(game, "Grizzly Bears");
    expect(pt(game, cohort)).toEqual({ power: 2, toughness: 2 });
    spawn(game, "Savannah Lions");
    expect(pt(game, cohort)).toEqual({ power: 3, toughness: 3 });
  });

  it("Gloomwidow's Feast makes a Spider only when the flier was blue or black", () => {
    const { game } = table();
    lands(game, "Forest", 8);
    const drake = spawn(game, "Wind Drake", B);
    cast(game, toHand(game, "Gloomwidow's Feast"), { targets: [ref(drake)] });
    expect(zone(game, drake)).toBe("graveyard");
    expect(tokensNamed(game, "1/2 Green Spider Token (Reach)", A)).toBe(1);
    const angel = spawn(game, "Serra Angel", B);
    cast(game, toHand(game, "Gloomwidow's Feast"), { targets: [ref(angel)] });
    expect(zone(game, angel)).toBe("graveyard");
    expect(tokensNamed(game, "1/2 Green Spider Token (Reach)", A)).toBe(1);
  });

  it("Tattermunge Witch pumps blocked attackers only, and gives them trample", () => {
    const { game, a, b } = table();
    const witch = spawn(game, "Tattermunge Witch");
    lands(game, "Mountain", 1);
    lands(game, "Forest", 1);
    const blocked = spawn(game, "Grizzly Bears");
    const free = spawn(game, "Savannah Lions");
    const blocker = spawn(game, "Grizzly Bears", B);
    a.declareAttackersFn = () => [blocked, free].map((attacker) => ({ attacker, defender: B }));
    b.declareBlockersFn = () => [{ blocker, attacker: blocked }];
    game.advanceUntil((s) => s.turn.step === "declare-blockers" && s.priority.holder === A);
    activate(game, witch, 0, { settle: false });
    game.advanceUntil((s) => s.zones.shared.stack.length === 0 && s.priority.holder === A);
    expect(pt(game, blocked)).toEqual({ power: 3, toughness: 2 });
    expect(keywords(game, blocked).has("trample")).toBe(true);
    expect(pt(game, free)).toEqual({ power: 2, toughness: 1 });
    expect(keywords(game, free).has("trample")).toBe(false);
    expect(pt(game, blocker)).toEqual({ power: 2, toughness: 2 });
  });

  it("Hollowsage untapping in the untap step makes the target player discard", () => {
    const { game, a } = table();
    spawn(game, "Hollowsage", A, { tapped: true });
    pickTargets(a, B);
    pickModes(a, 0);
    expect(graveyard(game, B).length).toBe(0);
    toStep(game, "precombat-main");
    expect(graveyard(game, B).length).toBe(1);
  });

  it("Impromptu Raid puts a revealed creature onto the battlefield with haste, then sacrifices it", () => {
    const { game, a } = table();
    const raid = spawn(game, "Impromptu Raid");
    lands(game, "Mountain", 6);
    const land = toLibrary(game, "Wastes");
    activate(game, raid, 0);
    expect(zone(game, land)).toBe("graveyard");
    const ogre = toLibrary(game, "Gray Ogre");
    pickFromZone(a, ogre);
    activate(game, raid, 0);
    expect(zone(game, ogre)).toBe("battlefield");
    expect(keywords(game, ogre).has("haste")).toBe(true);
    toStep(game, "precombat-main");
    expect(zone(game, ogre)).toBe("graveyard");
  });

  it("River's Grasp does only the half whose colour was spent", () => {
    const { game, a } = table();
    lands(game, "Island", 4);
    const bears = spawn(game, "Grizzly Bears", B);
    const bolt = toHand(game, "Lightning Bolt", B);
    cast(game, toHand(game, "River's Grasp"), { targets: [ref(bears), ref(B)] });
    expect(zone(game, bears)).toBe("hand");
    expect(hand(game, B)).toContain(bolt);
    lands(game, "Swamp", 4);
    pickFromZone(a, bolt);
    cast(game, toHand(game, "River's Grasp"), { targets: [null, ref(B)] });
    expect(graveyard(game, B)).toContain(bolt);
    expect(hand(game, B)).toContain(bears);
  });

  it("Splitting Headache's second mode discards the card you choose", () => {
    const { game, a } = table();
    lands(game, "Swamp", 4);
    const bears = toHand(game, "Grizzly Bears", B);
    pickFromZone(a, bears);
    cast(game, toHand(game, "Splitting Headache"), { modes: [1], targets: [ref(B)] });
    expect(graveyard(game, B)).toEqual([bears]);
  });

  it("Slinking Giant gets -3/-0 when it blocks", () => {
    const { game, a, b } = table();
    const giant = spawn(game, "Slinking Giant");
    const bears = spawn(game, "Grizzly Bears", B);
    b.declareAttackersFn = () => [{ attacker: bears, defender: A }];
    a.declareBlockersFn = () => [{ blocker: giant, attacker: bears }];
    toStep(game, "postcombat-main", B);
    expect(pt(game, giant)).toEqual({ power: 1, toughness: 4 });
    expect(counters(game, bears, "-1/-1")).toBe(1);
    expect(zone(game, bears)).toBe("battlefield");
  });
});
