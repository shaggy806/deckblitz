import { describe, expect, it } from "vitest";
import {
  A,
  B,
  activate,
  cast,
  destroy,
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
  toStep,
  zone,
} from "./harness.js";

// Exodus (EXO), batch B187 group A.

describe("Sphere of Resistance", () => {
  it("makes its controller's spells cost {1} more", () => {
    const { game } = table();
    spawn(game, "Sphere of Resistance", B);
    lands(game, "Forest", 2);
    const bears = toHand(game, "Grizzly Bears");
    expect(() => cast(game, bears)).toThrow(/refused/);
    lands(game, "Forest", 1);
    cast(game, bears);
    expect(zone(game, bears)).toBe("battlefield");
  });
});

describe("Equilibrium", () => {
  it("pays {1} on a creature cast to bounce a target creature", () => {
    const { game, a } = table();
    spawn(game, "Equilibrium");
    const theirs = spawn(game, "Grizzly Bears", B);
    lands(game, "Forest", 3);
    const bears = toHand(game, "Grizzly Bears");
    pickModes(a, 0);
    pickTargets(a, theirs);
    cast(game, bears);
    expect(zone(game, theirs)).toBe("hand");
    expect(zone(game, bears)).toBe("battlefield");
  });
});

describe("Manabond", () => {
  it("puts every land card from hand onto the battlefield, then discards the rest", () => {
    const { game, a } = table();
    spawn(game, "Manabond");
    const forest = toHand(game, "Forest");
    const bears = toHand(game, "Grizzly Bears");
    const before = hand(game).length;
    pickModes(a, 0);
    toStep(game, "end");
    toStep(game, "cleanup");
    expect(before).toBe(10);
    expect(hand(game)).toHaveLength(0);
    expect(zone(game, forest)).toBe("battlefield");
    expect(zone(game, bears)).toBe("graveyard");
  });
});

describe("Thrull Surgeon", () => {
  it("sacrifices itself to make a target player discard the card its controller chose", () => {
    const { game, a } = table();
    const surgeon = spawn(game, "Thrull Surgeon");
    lands(game, "Swamp", 2);
    const bears = toHand(game, "Grizzly Bears", B);
    pickFromZone(a, bears);
    activate(game, surgeon, 0, { targets: [ref(B)] });
    expect(zone(game, surgeon)).toBe("graveyard");
    expect(graveyard(game, B)).toContain(bears);
  });
});

describe("Skyshroud Elite", () => {
  it("is 2/3 only while an opponent controls a nonbasic land", () => {
    const { game } = table();
    const elite = spawn(game, "Skyshroud Elite");
    spawn(game, "Command Tower", A);
    expect(pt(game, elite)).toEqual({ power: 1, toughness: 1 });
    spawn(game, "Command Tower", B);
    expect(pt(game, elite)).toEqual({ power: 2, toughness: 3 });
  });
});

describe("Jackalope Herd", () => {
  it("returns to its owner's hand when its controller casts a spell", () => {
    const { game } = table();
    const herd = spawn(game, "Jackalope Herd");
    lands(game, "Forest", 2);
    cast(game, toHand(game, "Grizzly Bears"));
    expect(zone(game, herd)).toBe("hand");
  });
});

describe("Ephemeron and Thalakos Drifters", () => {
  it("discard a card to bounce itself / to gain shadow", () => {
    const { game } = table();
    const eph = spawn(game, "Ephemeron");
    const drifters = spawn(game, "Thalakos Drifters");
    const before = hand(game).length;
    activate(game, drifters, 0);
    expect(keywords(game, drifters).has("shadow")).toBe(true);
    expect(hand(game)).toHaveLength(before - 1);
    activate(game, eph, 0);
    expect(zone(game, eph)).toBe("hand");
    expect(hand(game)).toHaveLength(before - 1);
  });
});

describe("Bequeathal", () => {
  it("draws two when the enchanted creature dies", () => {
    const { game } = table();
    const bears = spawn(game, "Grizzly Bears");
    lands(game, "Forest", 1);
    cast(game, toHand(game, "Bequeathal"), { targets: [ref(bears)] });
    const before = hand(game).length;
    destroy(game, bears);
    expect(hand(game)).toHaveLength(before + 2);
  });
});
