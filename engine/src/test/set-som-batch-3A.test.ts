/**
 * Scars of Mirrodin (SOM) — batch 3, group A: metalcraft, the artificers'
 * "whenever you cast an artifact spell", and spells that return themselves.
 */
import { describe, expect, it } from "vitest";

import { invalidateComputedCache } from "../characteristics.js";

import {
  A,
  B,
  activate,
  cast,
  enter,
  graveyard,
  hand,
  keywords,
  lands,
  life,
  pickModes,
  pickTargets,
  pt,
  ref,
  settle,
  spawn,
  subtypes,
  table,
  toHand,
  toLibrary,
  types,
  zone,
} from "./harness.js";

describe("Shape Anew", () => {
  it("the artifact's controller sacrifices it and puts the first artifact revealed onto the battlefield", () => {
    const { game } = table();
    lands(game, "Island", 4);
    const ring = spawn(game, "Sol Ring", B);
    const thopter = toLibrary(game, "Ornithopter", B);
    const wastes = toLibrary(game, "Wastes", B);
    cast(game, toHand(game, "Shape Anew"), { targets: [ref(ring)] });
    expect(zone(game, ring)).toBe("graveyard");
    expect(zone(game, thopter)).toBe("battlefield");
    expect(game.state.objects[thopter].controller).toBe(B);
    expect(zone(game, wastes)).toBe("library");
  });
});

describe("Psychic Miasma", () => {
  it("returns to its owner's hand when a land is discarded", () => {
    const { game } = table();
    lands(game, "Swamp", 2);
    const miasma = toHand(game, "Psychic Miasma");
    const before = hand(game, B).length;
    cast(game, miasma, { targets: [ref(B)] });
    expect(hand(game, B).length).toBe(before - 1);
    expect(zone(game, miasma)).toBe("hand");
  });

  it("goes to the graveyard when a nonland card is discarded", () => {
    const { game } = table({ deck: "Grizzly Bears" });
    lands(game, "Swamp", 2);
    const miasma = toHand(game, "Psychic Miasma");
    cast(game, miasma, { targets: [ref(B)] });
    expect(graveyard(game, B).length).toBe(1);
    expect(zone(game, miasma)).toBe("graveyard");
  });
});

describe("Rusted Relic", () => {
  it("is a 5/5 Golem artifact creature only with metalcraft", () => {
    const { game } = table();
    const relic = spawn(game, "Rusted Relic");
    spawn(game, "Memnite");
    expect(types(game, relic)).not.toContain("creature");
    spawn(game, "Memnite");
    invalidateComputedCache(); // a silent spawn mutates outside dispatch
    expect(types(game, relic)).toContain("creature");
    expect(subtypes(game, relic)).toContain("Golem");
    expect(pt(game, relic)).toEqual({ power: 5, toughness: 5 });
  });
});

describe("Vedalken Certarch", () => {
  it("taps a target only with three or more artifacts", () => {
    const { game } = table();
    const certarch = spawn(game, "Vedalken Certarch");
    const bears = spawn(game, "Grizzly Bears", B);
    spawn(game, "Memnite");
    spawn(game, "Memnite");
    const action = { type: "activate-ability", player: A, source: certarch, abilityIndex: 0, targets: [ref(bears)] } as const;
    expect(game.canDispatch(action)).not.toBeNull();
    spawn(game, "Memnite");
    activate(game, certarch, 0, { targets: [ref(bears)] });
    expect(game.state.objects[bears].tapped).toBe(true);
  });
});

describe("Vigil for the Lost", () => {
  it("pays X to gain X life when a creature you control dies", () => {
    const { game } = table();
    spawn(game, "Vigil for the Lost");
    lands(game, "Plains", 3);
    const bears = spawn(game, "Grizzly Bears");
    game.debugApplyEffect(B, { kind: "destroy", target: 0 }, [ref(bears)]);
    game.advanceUntil((s) => s.awaiting?.kind === "choose-modes");
    game.dispatch({ type: "choose-modes", player: A, modes: [0], xValue: 3 });
    settle(game);
    expect(life(game, A)).toBe(23);
  });
});

describe("Snapsail Glider", () => {
  it("has flying only with metalcraft", () => {
    const { game } = table();
    const glider = spawn(game, "Snapsail Glider");
    spawn(game, "Memnite");
    expect(keywords(game, glider).has("flying")).toBe(false);
    spawn(game, "Memnite");
    invalidateComputedCache();
    expect(keywords(game, glider).has("flying")).toBe(true);
  });
});

describe("Embersmith", () => {
  it("paying {1} on an artifact cast deals 1 damage to the chosen target", () => {
    const { game, a } = table();
    spawn(game, "Embersmith");
    lands(game, "Mountain", 1);
    pickTargets(a, B);
    pickModes(a, 0);
    cast(game, toHand(game, "Ornithopter"));
    expect(life(game, B)).toBe(19);
  });
});

describe("Glint Hawk Idol", () => {
  it("another artifact entering may make it a 2/2 flying Bird artifact creature", () => {
    const { game, a } = table();
    const idol = spawn(game, "Glint Hawk Idol");
    pickModes(a, 0);
    enter(game, "Memnite");
    expect(types(game, idol)).toEqual(expect.arrayContaining(["artifact", "creature"]));
    expect(subtypes(game, idol)).toContain("Bird");
    expect(pt(game, idol)).toEqual({ power: 2, toughness: 2 });
    expect(keywords(game, idol).has("flying")).toBe(true);
  });
});

describe("Lifesmith", () => {
  it("paying {1} on an artifact cast gains 3 life", () => {
    const { game, a } = table();
    spawn(game, "Lifesmith");
    lands(game, "Forest", 1);
    pickModes(a, 0);
    cast(game, toHand(game, "Ornithopter"));
    expect(life(game, A)).toBe(23);
  });
});

describe("Trigon of Corruption", () => {
  it("enters with three charge counters and spends one for a -1/-1 counter", () => {
    const { game } = table();
    const trigon = enter(game, "Trigon of Corruption");
    expect(game.state.objects[trigon].counters.charge).toBe(3);
    lands(game, "Wastes", 2);
    const bears = spawn(game, "Grizzly Bears", B);
    activate(game, trigon, 1, { targets: [ref(bears)] });
    expect(game.state.objects[trigon].counters.charge).toBe(2);
    expect(pt(game, bears)).toEqual({ power: 1, toughness: 1 });
  });
});
