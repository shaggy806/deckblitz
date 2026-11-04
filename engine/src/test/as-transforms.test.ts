/**
 * "As this permanent transforms into [this face], …" (rule 712.20):
 * `asTransformsInto` on the face named, applied while the permanent is
 * transforming, not afterward. Sephiroth, Fabled SOLDIER // Sephiroth,
 * One-Winged Angel, whose whole text is run here.
 */
import { describe, expect, it } from "vitest";

import type { Game } from "../game.js";
import type { ObjectId } from "../primitives.js";

import {
  A,
  B,
  attack,
  destroy,
  enter,
  hand,
  life,
  pickPermanents,
  pickTargets,
  ref,
  settle,
  spawn,
  table,
  zone,
} from "./harness.js";

const emblems = (game: Game): number => game.state.emblems.filter((e) => e.owner === A).length;

const transform = (game: Game, id: ObjectId): void => {
  game.debugApplyEffect(A, { kind: "transform", target: 0 }, [ref(id)]);
};

describe("Sephiroth, Fabled SOLDIER", () => {
  it("drains on each other creature's death, and the fourth resolution turns it over with the emblem", () => {
    const { game, a } = table();
    const sephiroth = spawn(game, "Sephiroth, Fabled SOLDIER", A);
    pickTargets(a, B);
    for (let n = 1; n <= 3; n++) {
      destroy(game, spawn(game, "Grizzly Bears", B));
      expect(life(game, B)).toBe(20 - n);
      expect(life(game, A)).toBe(20 + n);
      expect(game.state.objects[sephiroth].face ?? 0).toBe(0);
      expect(emblems(game)).toBe(0);
    }
    destroy(game, spawn(game, "Grizzly Bears", A));
    expect(life(game, B)).toBe(16);
    expect(game.state.objects[sephiroth].face).toBe(1);
    expect(emblems(game)).toBe(1);
  });

  it("doesn't drain on its own death", () => {
    const { game } = table();
    const sephiroth = spawn(game, "Sephiroth, Fabled SOLDIER", A);
    destroy(game, sephiroth);
    expect(life(game, B)).toBe(20);
  });

  it("may sacrifice another creature as it enters, drawing a card", () => {
    const { game, a } = table();
    const bears = spawn(game, "Grizzly Bears", A);
    const before = hand(game, A).length;
    a.chooseModesFn = () => [0];
    a.chooseSacrificesFn = () => [bears];
    pickTargets(a, B);
    const sephiroth = enter(game, "Sephiroth, Fabled SOLDIER", A);
    settle(game);
    expect(zone(game, bears)).toBe("graveyard");
    expect(zone(game, sephiroth)).toBe("battlefield");
    expect(hand(game, A).length).toBe(before + 1);
  });
});

describe("as this creature transforms (rule 712.20)", () => {
  it("is applied as part of the transform: nothing on the stack, the emblem there at once", () => {
    const { game } = table();
    const sephiroth = spawn(game, "Sephiroth, Fabled SOLDIER", A);
    transform(game, sephiroth);
    expect(emblems(game)).toBe(1);
    expect(game.state.zones.shared.stack.length).toBe(0);
  });

  it("the emblem drains on any creature's death, Sephiroth's own included", () => {
    const { game, a } = table();
    const sephiroth = spawn(game, "Sephiroth, Fabled SOLDIER", A);
    transform(game, sephiroth);
    pickTargets(a, B);
    destroy(game, spawn(game, "Grizzly Bears", A));
    expect(life(game, B)).toBe(19);
    expect(life(game, A)).toBe(21);
    destroy(game, sephiroth);
    expect(life(game, B)).toBe(18);
  });

  it("only turning into that face applies it, each time", () => {
    const { game } = table();
    const sephiroth = spawn(game, "Sephiroth, Fabled SOLDIER", A);
    transform(game, sephiroth);
    expect(emblems(game)).toBe(1);
    transform(game, sephiroth);
    expect(game.state.objects[sephiroth].face).toBe(0);
    expect(emblems(game)).toBe(1);
    transform(game, sephiroth);
    expect(emblems(game)).toBe(2);
  });

  it("doesn't apply to a permanent that enters already showing the face", () => {
    const { game } = table();
    const card = game.debugSpawn("Sephiroth, Fabled SOLDIER", A, "graveyard");
    game.debugApplyEffect(A, { kind: "put-onto-battlefield", target: 0, transformed: true }, [ref(card)]);
    settle(game);
    const onto = game.state.zones.shared.battlefield.find((id) => game.state.objects[id].cardName === "Sephiroth, Fabled SOLDIER");
    expect(onto).toBeDefined();
    expect(game.state.objects[onto as ObjectId].face).toBe(1);
    expect(emblems(game)).toBe(0);
  });
});

describe("Sephiroth, One-Winged Angel", () => {
  it("attacking, sacrifices any number of other creatures and draws that many", () => {
    const { game, a } = table();
    const sephiroth = spawn(game, "Sephiroth, Fabled SOLDIER", A);
    transform(game, sephiroth);
    const fed = [spawn(game, "Grizzly Bears", A), spawn(game, "Llanowar Elves", A)];
    const kept = spawn(game, "Grizzly Bears", A);
    const asked = pickPermanents(a, ...fed);
    pickTargets(a, B);
    const before = hand(game, A).length;
    attack(game, a, [sephiroth]);
    expect(asked.offered).not.toContain(sephiroth);
    expect(asked.offered).toContain(kept);
    expect(fed.map((id) => zone(game, id))).toEqual(["graveyard", "graveyard"]);
    expect(zone(game, kept)).toBe("battlefield");
    expect(hand(game, A).length).toBe(before + 2);
    // Two deaths to the emblem, then 5 flying in the air.
    expect(life(game, B)).toBe(20 - 2 - 5);
  });
});
