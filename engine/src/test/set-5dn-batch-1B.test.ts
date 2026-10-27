/**
 * Fifth Dawn (5DN), batch 213 group B.
 */
import { describe, expect, it } from "vitest";
import {
  A,
  B,
  activate,
  attack,
  cast,
  controller,
  counters,
  destroy,
  graveyard,
  keywords,
  lands,
  life,
  pickFromZone,
  pickModes,
  pickTargets,
  pt,
  ref,
  settle,
  spawn,
  table,
  toGraveyard,
  toHand,
  toStep,
  types,
  zone,
} from "./harness.js";

describe("Energy Chamber", () => {
  it("puts a charge counter on a noncreature artifact at upkeep", () => {
    const { game, a } = table();
    spawn(game, "Energy Chamber");
    const thopter = spawn(game, "Ornithopter");
    const ring = spawn(game, "Sol Ring");
    pickModes(a, 1);
    pickTargets(a, ring);
    toStep(game, "upkeep");
    settle(game);
    expect(counters(game, ring, "charge")).toBe(1);
    expect(counters(game, thopter)).toBe(0);
  });
});

describe("Vedalken Shackles", () => {
  it("steals a creature with power up to its Islands, for as long as it stays tapped", () => {
    const { game } = table();
    const shackles = spawn(game, "Vedalken Shackles");
    lands(game, "Island", 2);
    const bears = spawn(game, "Grizzly Bears", B);
    const giant = spawn(game, "Hill Giant", B);
    // Two Islands: a 3-power Hill Giant isn't a legal target.
    expect(() => activate(game, shackles, 0, { targets: [ref(giant)] })).toThrow();
    activate(game, shackles, 0, { targets: [ref(bears)] });
    expect(controller(game, bears)).toBe(A);
    game.debugApplyEffect(A, { kind: "untap", target: 0 }, [ref(shackles)]);
    settle(game);
    expect(controller(game, bears)).toBe(B);
  });
});

describe("Salvaging Station", () => {
  it("returns a cheap noncreature artifact, and may untap when a creature dies", () => {
    const { game, a } = table();
    const station = spawn(game, "Salvaging Station");
    const ring = toGraveyard(game, "Sol Ring");
    activate(game, station, 0, { targets: [ref(ring)] });
    expect(zone(game, ring)).toBe("battlefield");
    expect(game.state.objects[station].tapped).toBe(true);
    const bears = spawn(game, "Grizzly Bears", B);
    pickModes(a, 0);
    destroy(game, bears);
    expect(game.state.objects[station].tapped).toBe(false);
  });
});

describe("Endless Whispers", () => {
  it("a dead creature returns under the targeted opponent's control at the next end step", () => {
    const { game, b } = table();
    spawn(game, "Endless Whispers");
    const bears = spawn(game, "Grizzly Bears", B);
    pickTargets(b, A);
    destroy(game, bears, A);
    expect(graveyard(game, B)).toContain(bears);
    toStep(game, "end");
    settle(game);
    expect(zone(game, bears)).toBe("battlefield");
    expect(controller(game, bears)).toBe(A);
  });
});

describe("Raksha Golden Cub", () => {
  it("while equipped, Cats you control get +2/+2 and double strike", () => {
    const { game } = table();
    const raksha = spawn(game, "Raksha Golden Cub");
    const lions = spawn(game, "Savannah Lions");
    const helm = spawn(game, "Horned Helm");
    lands(game, "Forest", 2);
    expect(pt(game, lions)).toEqual({ power: 2, toughness: 1 });
    activate(game, helm, 0, { targets: [ref(raksha)] });
    expect(pt(game, lions)).toEqual({ power: 4, toughness: 3 });
    expect(keywords(game, lions).has("double-strike")).toBe(true);
    // Raksha itself: +2/+2 from itself, +1/+1 and trample from the Helm.
    expect(pt(game, raksha)).toEqual({ power: 6, toughness: 7 });
  });
});

describe("Bringer of the Blue Dawn", () => {
  it("can be cast for {W}{U}{B}{R}{G}", () => {
    const { game } = table();
    for (const land of ["Plains", "Island", "Swamp", "Mountain", "Forest"]) lands(game, land, 1);
    const bringer = toHand(game, "Bringer of the Blue Dawn");
    cast(game, bringer, { altCost: true });
    expect(zone(game, bringer)).toBe("battlefield");
  });
});

describe("Beacon of Destruction", () => {
  it("deals 5 damage and shuffles itself into its owner's library", () => {
    const { game } = table();
    lands(game, "Mountain", 5);
    const beacon = toHand(game, "Beacon of Destruction");
    cast(game, beacon, { targets: [ref(B)] });
    expect(life(game, B)).toBe(15);
    expect(zone(game, beacon)).toBe("library");
  });
});

describe("Tangle Asp", () => {
  it("destroys the creature it blocks at end of combat", () => {
    const { game, a, b } = table();
    const giant = spawn(game, "Hill Giant");
    const asp = spawn(game, "Tangle Asp", B);
    b.declareBlockersFn = () => [{ blocker: asp, attacker: giant }];
    attack(game, a, [giant]);
    expect(zone(game, giant)).toBe("graveyard");
  });
});

describe("Ensouled Scimitar", () => {
  it("becomes a 1/5 flying Spirit artifact creature", () => {
    const { game } = table();
    const scimitar = spawn(game, "Ensouled Scimitar");
    lands(game, "Wastes", 3);
    activate(game, scimitar);
    expect(types(game, scimitar)).toContain("creature");
    expect(pt(game, scimitar)).toEqual({ power: 1, toughness: 5 });
    expect(keywords(game, scimitar).has("flying")).toBe(true);
  });
});

describe("Early Frost", () => {
  it("taps up to three target lands", () => {
    const { game } = table();
    lands(game, "Island", 2);
    const [l1, l2] = lands(game, "Wastes", 2, B);
    cast(game, toHand(game, "Early Frost"), { targets: [ref(l1), ref(l2), null] });
    expect(game.state.objects[l1].tapped).toBe(true);
    expect(game.state.objects[l2].tapped).toBe(true);
  });
});

describe("Vicious Betrayal", () => {
  it("gives +2/+2 for each creature sacrificed as it's cast", () => {
    const { game } = table();
    lands(game, "Swamp", 5);
    const fodder = [spawn(game, "Grizzly Bears"), spawn(game, "Grizzly Bears")];
    const target = spawn(game, "Hill Giant", B);
    cast(game, toHand(game, "Vicious Betrayal"), { x: 2, targets: [ref(target)] });
    expect(fodder.map((id) => zone(game, id))).toEqual(["graveyard", "graveyard"]);
    expect(pt(game, target)).toEqual({ power: 7, toughness: 7 });
  });
});

describe("Shattered Dreams", () => {
  it("offers only artifact cards from the opponent's hand", () => {
    const { game, a } = table();
    lands(game, "Swamp", 1);
    const ring = toHand(game, "Sol Ring", B);
    toHand(game, "Grizzly Bears", B);
    const seen = pickFromZone(a, ring);
    cast(game, toHand(game, "Shattered Dreams"), { targets: [ref(B)] });
    expect(seen.offered).toEqual([ring]);
    expect(zone(game, ring)).toBe("graveyard");
  });
});

describe("Fleshgrafter", () => {
  it("discards an artifact card to get +2/+2", () => {
    const { game, a } = table();
    const grafter = spawn(game, "Fleshgrafter");
    const ring = toHand(game, "Sol Ring");
    a.chooseDiscardsFn = () => [ring];
    activate(game, grafter);
    expect(zone(game, ring)).toBe("graveyard");
    expect(pt(game, grafter)).toEqual({ power: 4, toughness: 4 });
  });
});
