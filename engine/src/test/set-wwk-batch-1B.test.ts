/**
 * Worldwake (WWK), group B. One test per card whose behaviour is more than a
 * stat line, on the clause most likely to be wrong.
 */
import { describe, expect, it } from "vitest";

import {
  A,
  B,
  cast,
  counters,
  destroy,
  enter,
  graveyard,
  keywords,
  lands,
  life,
  pickModes,
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
} from "./harness.js";

describe("Groundswell", () => {
  it("gives +2/+2, or +4/+4 instead once a land entered under your control this turn", () => {
    const { game } = table();
    spawn(game, "Forest");
    const bears = spawn(game, "Grizzly Bears");
    cast(game, toHand(game, "Groundswell"), { targets: [ref(bears)] });
    expect(pt(game, bears)).toEqual({ power: 4, toughness: 4 });

    enter(game, "Forest");
    const other = spawn(game, "Grizzly Bears");
    cast(game, toHand(game, "Groundswell"), { targets: [ref(other)] });
    expect(pt(game, other)).toEqual({ power: 6, toughness: 6 });
  });
});

describe("Tuktuk Scrapper", () => {
  it("destroys an artifact and deals its controller damage equal to your Allies", () => {
    const { game, a } = table();
    spawn(game, "Ondu Cleric");
    const ring = spawn(game, "Sol Ring", B);
    pickModes(a, 0);
    pickTargets(a, ring);
    enter(game, "Tuktuk Scrapper");
    expect(zone(game, ring)).toBe("graveyard");
    expect(life(game, B)).toBe(18);
  });

  it("deals no damage when the artifact isn't destroyed (indestructible)", () => {
    const { game, a } = table();
    const ingot = spawn(game, "Darksteel Ingot", B);
    pickModes(a, 0);
    pickTargets(a, ingot);
    enter(game, "Tuktuk Scrapper");
    expect(zone(game, ingot)).toBe("battlefield");
    expect(life(game, B)).toBe(20);
  });
});

describe("Kalastria Highborn", () => {
  it("when another Vampire you control dies, {B} drains the target player for 2", () => {
    const { game, a } = table();
    lands(game, "Swamp", 1);
    spawn(game, "Kalastria Highborn");
    const vampire = spawn(game, "Quag Vampires");
    pickModes(a, 0);
    pickTargets(a, B);
    destroy(game, vampire);
    settle(game);
    expect(life(game, B)).toBe(18);
    expect(life(game, A)).toBe(22);
  });
});

describe("Halimar Excavator", () => {
  it("mills the target player once per Ally you control", () => {
    const { game, a } = table();
    spawn(game, "Ondu Cleric");
    const before = graveyard(game, B).length;
    pickTargets(a, B);
    enter(game, "Halimar Excavator");
    expect(graveyard(game, B).length).toBe(before + 2);
  });
});

describe("Quag Vampires", () => {
  it("enters with a +1/+1 counter for each time it was kicked, and has swampwalk", () => {
    const { game } = table();
    lands(game, "Swamp", 5);
    const card = toHand(game, "Quag Vampires");
    cast(game, card, { kicked: true, kickCount: 2 });
    expect(counters(game, card)).toBe(2);
    expect(keywords(game, card).has("swampwalk")).toBe(true);
  });
});

describe("Stone Idol Trap", () => {
  it("makes a 6/12 trampling Construct that is exiled at your end step", () => {
    const { game } = table();
    lands(game, "Mountain", 6);
    cast(game, toHand(game, "Stone Idol Trap"));
    expect(tokensNamed(game, "Construct Token (Ancient Stone Idol)", A)).toBe(1);
    toStep(game, "end");
    settle(game);
    expect(tokensNamed(game, "Construct Token (Ancient Stone Idol)", A)).toBe(0);
  });
});

describe("Permafrost Trap", () => {
  it("costs {U} once an opponent had a green creature enter this turn", () => {
    const { game } = table();
    lands(game, "Island", 1);
    const target = spawn(game, "Grizzly Bears", B);
    const card = toHand(game, "Permafrost Trap");
    expect(() => cast(game, card, { targets: [ref(target), null], altCost: true })).toThrow();
    enter(game, "Grizzly Bears", B);
    cast(game, card, { targets: [ref(target), null], altCost: true });
    expect(game.state.objects[target].tapped).toBe(true);
  });
});

describe("Sejiri Merfolk", () => {
  it("has first strike and lifelink only while you control a Plains", () => {
    const { game } = table();
    const merfolk = spawn(game, "Sejiri Merfolk");
    expect(keywords(game, merfolk).has("lifelink")).toBe(false);
    spawn(game, "Plains");
    expect(keywords(game, merfolk).has("first-strike")).toBe(true);
    expect(keywords(game, merfolk).has("lifelink")).toBe(true);
  });
});
