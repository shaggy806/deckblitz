/**
 * Mirrodin, group B.
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
  enter,
  hand,
  lands,
  life,
  nextTurn,
  pickFromZone,
  pickModes,
  pickTargets,
  pt,
  ref,
  settle,
  spawn,
  table,
  toHand,
  toLibrary,
  toStep,
  zone,
} from "./harness.js";

describe("Jinxed Choker", () => {
  it("passes to the target opponent with a charge counter, then deals its new controller damage at their upkeep", () => {
    const { game, a } = table();
    const choker = spawn(game, "Jinxed Choker");
    pickTargets(a, B);
    toStep(game, "end");
    settle(game);
    expect(controller(game, choker)).toBe(B);
    expect(counters(game, choker, "charge")).toBe(1);
    const before = life(game, B);
    nextTurn(game);
    expect(life(game, B)).toBe(before - 1);
    expect(life(game, A)).toBe(20);
  });

  it("{3}: the choice to remove a counter is made as it resolves", () => {
    const { game, a } = table();
    const choker = spawn(game, "Jinxed Choker");
    game.state.objects[choker].counters.charge = 2;
    lands(game, "Wastes", 3);
    pickModes(a, 1);
    activate(game, choker);
    expect(counters(game, choker, "charge")).toBe(1);
  });
});

describe("War Elemental", () => {
  it("is sacrificed as it enters if no opponent was dealt damage this turn", () => {
    const { game } = table();
    const elemental = enter(game, "War Elemental");
    expect(zone(game, elemental)).toBe("graveyard");
  });

  it("stays after an opponent was dealt damage, and grows by the damage opponents are dealt", () => {
    const { game } = table();
    game.debugApplyEffect(A, { kind: "damage", amount: 1, target: 0 }, [ref(B)]);
    settle(game);
    const elemental = enter(game, "War Elemental");
    expect(zone(game, elemental)).toBe("battlefield");
    // The first damage was dealt before it was on the battlefield.
    expect(counters(game, elemental)).toBe(0);
    game.debugApplyEffect(A, { kind: "damage", amount: 3, target: 0 }, [ref(B)]);
    settle(game);
    expect(counters(game, elemental)).toBe(3);
    game.debugApplyEffect(B, { kind: "damage", amount: 2, target: 0 }, [ref(A)]);
    settle(game);
    expect(counters(game, elemental)).toBe(3);
  });
});

describe("Flayed Nim", () => {
  it("the blocking creature's controller loses as much life as the combat damage dealt to it", () => {
    const { game, a, b } = table();
    const nim = spawn(game, "Flayed Nim");
    const blocker = spawn(game, "Hill Giant", B);
    b.declareBlockersFn = () => [{ blocker, attacker: nim }];
    attack(game, a, [nim]);
    expect(life(game, B)).toBe(18);
  });
});

describe("Lumengrid Augur", () => {
  it("untaps when the target player discards an artifact card", () => {
    const { game, b } = table();
    const augur = spawn(game, "Lumengrid Augur");
    lands(game, "Wastes", 1);
    const thopter = toLibrary(game, "Ornithopter", B);
    b.chooseDiscardsFn = () => [thopter];
    activate(game, augur, 0, { targets: [ref(B)] });
    expect(zone(game, thopter)).toBe("graveyard");
    expect(game.state.objects[augur].tapped).toBe(false);
  });

  it("stays tapped when the discarded card isn't an artifact", () => {
    const { game } = table();
    const augur = spawn(game, "Lumengrid Augur");
    lands(game, "Wastes", 1);
    activate(game, augur, 0, { targets: [ref(B)] });
    expect(game.state.objects[augur].tapped).toBe(true);
  });
});

describe("Dross Scorpion", () => {
  it("another player's artifact creature dying lets you untap target artifact", () => {
    const { game, a } = table();
    spawn(game, "Dross Scorpion");
    const thopter = spawn(game, "Ornithopter", B);
    const choker = spawn(game, "Jinxed Choker", A, { tapped: true });
    pickTargets(a, choker);
    pickModes(a, 0);
    game.debugApplyEffect(A, { kind: "destroy", target: 0 }, [ref(thopter)]);
    settle(game);
    expect(game.state.objects[choker].tapped).toBe(false);
  });
});

describe("Clockwork Condor", () => {
  it("enters with three counters and loses one at end of combat after attacking", () => {
    const { game, a } = table();
    const condor = enter(game, "Clockwork Condor");
    expect(pt(game, condor)).toEqual({ power: 3, toughness: 3 });
    attack(game, a, [condor]);
    expect(life(game, B)).toBe(17);
    expect(counters(game, condor)).toBe(2);
  });
});

describe("Journey of Discovery", () => {
  it("entwined: finds two basic lands and gives two extra land drops", () => {
    const { game, a } = table();
    lands(game, "Forest", 6);
    const forests = [toLibrary(game, "Forest"), toLibrary(game, "Forest")];
    pickFromZone(a, ...forests);
    const journey = toHand(game, "Journey of Discovery");
    const before = hand(game).length;
    cast(game, journey, { kicked: true, modes: [0, 1] });
    for (const id of forests) expect(zone(game, id)).toBe("hand");
    expect(hand(game).length).toBe(before - 1 + 2);
  });
});

describe("Nuisance Engine", () => {
  it("makes a 0/1 colorless Pest artifact creature", () => {
    const { game } = table();
    const engine = spawn(game, "Nuisance Engine");
    lands(game, "Wastes", 2);
    activate(game, engine);
    const pest = game.battlefield.find((id) => game.state.objects[id].cardName === "Pest Token (Colorless Artifact, 0/1)");
    expect(pest).toBeDefined();
    expect(pt(game, pest!)).toEqual({ power: 0, toughness: 1 });
  });
});

describe("Leonin Abunas", () => {
  it("an opponent can't target your artifacts", () => {
    const { game } = table();
    spawn(game, "Leonin Abunas");
    const thopter = spawn(game, "Ornithopter");
    lands(game, "Mountain", 2, B);
    const shatter = toHand(game, "Shatter", B);
    toStep(game, "upkeep", B);
    expect(() => cast(game, shatter, { player: B, targets: [ref(thopter)] })).toThrow();
    expect(zone(game, thopter)).toBe("battlefield");
  });
});
