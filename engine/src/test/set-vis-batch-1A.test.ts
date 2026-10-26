/**
 * Visions (VIS), batch 1, group A.
 */
import { describe, expect, it } from "vitest";
import {
  A,
  B,
  activate,
  attack,
  cast,
  graveyard,
  hand,
  lands,
  life,
  pickModes,
  pickTargets,
  ref,
  settle,
  spawn,
  table,
  toGraveyard,
  toHand,
  toStep,
  zone,
  enter,
} from "./harness.js";

describe("Vanishing", () => {
  it("the enchanted creature phases out, and the Aura with it", () => {
    const { game } = table();
    const bears = spawn(game, "Grizzly Bears");
    lands(game, "Island", 3);
    const aura = toHand(game, "Vanishing");
    cast(game, aura, { targets: [ref(bears)] });
    expect(game.state.objects[aura].attachedTo).toBe(bears);
    activate(game, aura);
    expect(zone(game, bears)).toBe("phased-out");
    expect(zone(game, aura)).toBe("phased-out");
  });
});

describe("Betrayal", () => {
  it("you draw when the enchanted opponent's creature becomes tapped", () => {
    const { game, b } = table();
    const bears = spawn(game, "Grizzly Bears", B);
    lands(game, "Island", 1);
    cast(game, toHand(game, "Betrayal"), { targets: [ref(bears)] });
    const before = hand(game, A).length;
    attack(game, b, [bears], A);
    expect(hand(game, A).length).toBe(before + 1);
  });

  it("can't enchant a creature you control", () => {
    const { game } = table();
    const bears = spawn(game, "Grizzly Bears");
    lands(game, "Island", 1);
    expect(() => cast(game, toHand(game, "Betrayal"), { targets: [ref(bears)] })).toThrow();
  });
});

describe("Necrosavant", () => {
  it("returns from the graveyard during your upkeep, sacrificing a creature", () => {
    const { game } = table();
    const savant = toGraveyard(game, "Necrosavant");
    const bears = spawn(game, "Grizzly Bears");
    lands(game, "Swamp", 5);
    toStep(game, "upkeep");
    settle(game);
    game.dispatch({ type: "activate-ability", player: A, source: savant, abilityIndex: 0, targets: [], sacrifice: bears });
    settle(game);
    expect(zone(game, savant)).toBe("battlefield");
    expect(zone(game, bears)).toBe("graveyard");
  });

  it("can't be activated in a main phase", () => {
    const { game } = table();
    const savant = toGraveyard(game, "Necrosavant");
    const bears = spawn(game, "Grizzly Bears");
    lands(game, "Swamp", 5);
    expect(
      game.canDispatch({ type: "activate-ability", player: A, source: savant, abilityIndex: 0, targets: [], sacrifice: bears }),
    ).not.toBeNull();
  });
});

describe("Dwarven Vigilantes", () => {
  it("unblocked, it deals its power to a creature and no combat damage", () => {
    const { game, a } = table();
    const dwarf = spawn(game, "Dwarven Vigilantes");
    const bears = spawn(game, "Grizzly Bears", B);
    pickTargets(a, bears);
    pickModes(a, 0);
    attack(game, a, [dwarf]);
    expect(zone(game, bears)).toBe("graveyard");
    expect(life(game, B)).toBe(20);
  });
});

describe("Rock Slide", () => {
  it("divides X among attacking creatures without flying, never a flier", () => {
    const { game, b } = table();
    const bears = spawn(game, "Grizzly Bears", B);
    const giant = spawn(game, "Hill Giant", B);
    const angel = spawn(game, "Serra Angel", B);
    lands(game, "Mountain", 5);
    b.declareAttackersFn = () => [bears, giant, angel].map((attacker) => ({ attacker, defender: A }));
    game.advanceUntil((s) => s.turn.number === 2 && s.turn.step === "declare-blockers" && s.priority.holder === A);
    expect(() =>
      cast(game, toHand(game, "Rock Slide"), { x: 4, targets: [ref(bears), ref(angel)], division: [2, 2], settle: false }),
    ).toThrow();
    cast(game, toHand(game, "Rock Slide"), { x: 4, targets: [ref(bears), ref(giant)], division: [2, 2] });
    expect(zone(game, bears)).toBe("graveyard");
    expect(game.state.objects[giant].damageMarked).toBe(2);
  });
});

describe("Knight of the Mists", () => {
  it("unpaid, the targeted Knight is destroyed", () => {
    const { game, a } = table();
    const other = spawn(game, "Knight of the Mists", B);
    pickTargets(a, other);
    pickModes(a);
    enter(game, "Knight of the Mists");
    expect(zone(game, other)).toBe("graveyard");
  });
});

describe("Kookus", () => {
  it("deals 3 damage to you at your upkeep without a Keeper of Kookus", () => {
    const { game } = table();
    spawn(game, "Kookus");
    toStep(game, "upkeep");
    settle(game);
    expect(life(game, A)).toBe(17);
  });
});

describe("Flooded Shoreline", () => {
  it("returning two Islands bounces a creature", () => {
    const { game } = table();
    const shoreline = spawn(game, "Flooded Shoreline");
    const islands = lands(game, "Island", 2);
    const bears = spawn(game, "Grizzly Bears", B);
    activate(game, shoreline, 0, { targets: [ref(bears)] });
    expect(zone(game, bears)).toBe("hand");
    expect(islands.every((id) => zone(game, id) === "hand")).toBe(true);
    expect(graveyard(game, B)).toHaveLength(0);
  });
});
