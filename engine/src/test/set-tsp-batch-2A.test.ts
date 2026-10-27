/**
 * Time Spiral (TSP; B228) — group A: Quilled Sliver, Pit Keeper, Nantuko
 * Shaman, Phantom Wurm, Icatian Crier, Flowstone Channeler, Ironclaw
 * Buzzardiers.
 */
import { describe, expect, it } from "vitest";

import {
  A,
  B,
  activate,
  counters,
  enter,
  hand,
  keywords,
  lands,
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
  tokensNamed,
  zone,
} from "./harness.js";

describe("Quilled Sliver", () => {
  it("has the granted {T} ability, which hits an attacking creature", () => {
    const { game, a } = table();
    const sliver = spawn(game, "Quilled Sliver");
    const lions = spawn(game, "Savannah Lions");
    a.declareAttackersFn = () => [{ attacker: lions, defender: B }];
    toStep(game, "declare-blockers");
    activate(game, sliver, 0, { targets: [ref(lions)] });
    expect(zone(game, lions)).toBe("graveyard");
  });
});

describe("Pit Keeper", () => {
  it("returns a creature card only with four or more creature cards in the graveyard", () => {
    const { game, a } = table();
    pickModes(a, 0);
    for (let i = 0; i < 3; i += 1) toGraveyard(game, "Grizzly Bears");
    const bears = (): number => hand(game, A).filter((id) => game.state.objects[id].cardName === "Grizzly Bears").length;
    enter(game, "Pit Keeper");
    expect(bears()).toBe(0);
    pickTargets(a, toGraveyard(game, "Grizzly Bears"));
    enter(game, "Pit Keeper");
    expect(bears()).toBe(1);
  });
});

describe("Nantuko Shaman", () => {
  it("draws only if you control no tapped lands", () => {
    const { game } = table();
    lands(game, "Forest", 1);
    const before = hand(game, A).length;
    enter(game, "Nantuko Shaman");
    expect(hand(game, A)).toHaveLength(before + 1);
    spawn(game, "Forest", A, { tapped: true });
    enter(game, "Nantuko Shaman");
    expect(hand(game, A)).toHaveLength(before + 1);
  });
});

describe("Phantom Wurm", () => {
  it("enters as a 6/4 and loses one counter instead of being dealt damage", () => {
    const { game } = table();
    const wurm = enter(game, "Phantom Wurm");
    expect(pt(game, wurm)).toEqual({ power: 6, toughness: 4 });
    game.debugApplyEffect(A, { kind: "damage", amount: 5, target: 0 }, [ref(wurm)]);
    settle(game);
    expect(zone(game, wurm)).toBe("battlefield");
    expect(counters(game, wurm)).toBe(3);
    expect(game.state.objects[wurm].damageMarked).toBe(0);
  });
});

describe("Icatian Crier", () => {
  it("discards a card to make two Citizens", () => {
    const { game } = table();
    lands(game, "Plains", 2);
    const crier = spawn(game, "Icatian Crier");
    toHand(game, "Grizzly Bears");
    const before = hand(game, A).length;
    activate(game, crier, 0);
    expect(hand(game, A)).toHaveLength(before - 1);
    expect(tokensNamed(game, "White Citizen Token", A)).toBe(2);
  });
});

describe("Flowstone Channeler", () => {
  it("gives +1/-1 and haste", () => {
    const { game } = table();
    lands(game, "Mountain", 2);
    const channeler = spawn(game, "Flowstone Channeler");
    const bears = spawn(game, "Grizzly Bears");
    toHand(game, "Grizzly Bears");
    activate(game, channeler, 0, { targets: [ref(bears)] });
    expect(pt(game, bears)).toEqual({ power: 3, toughness: 1 });
    expect(keywords(game, bears).has("haste")).toBe(true);
  });
});

describe("Ironclaw Buzzardiers", () => {
  it("gains flying for {R}", () => {
    const { game } = table();
    lands(game, "Mountain", 1);
    const orc = spawn(game, "Ironclaw Buzzardiers");
    activate(game, orc, 0);
    expect(keywords(game, orc).has("flying")).toBe(true);
  });
});
