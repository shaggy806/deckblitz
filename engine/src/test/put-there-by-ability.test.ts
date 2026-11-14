/**
 * "The creature put onto the battlefield with [this]" — the second of a
 * linked pair (rule 607.2c): `putThereBySource: { triggered: n }` reads which
 * ability of the source put it there (`EntrySource.ability`, recorded as the
 * ability resolves), so Havengul Mystery's leaves trigger watches only the
 * creature its transform trigger returned, not a Clue Havengul Laboratory's
 * investigate made (rule 607.1b: both faces' abilities are the object's).
 */

import { describe, expect, it } from "vitest";

import { defineCard } from "../cards/define.js";
import type { Game } from "../game.js";
import type { ObjectId } from "../primitives.js";
import { A, activate, destroy, lands, named, pickTargets, settle, spawn, table, toGraveyard, toStep, tokensNamed, zone } from "./harness.js";

const LAB = "Havengul Laboratory";

const face = (game: Game, id: ObjectId): number => game.state.objects[id].face ?? 0;

/** Transform the land as an effect of its own would. */
function transform(game: Game, lab: ObjectId): void {
  game.debugApplyEffect(A, { kind: "transform", target: "source" }, [], { source: lab });
  settle(game);
}

function clues(game: Game, n: number): void {
  game.debugApplyEffect(A, { kind: "create-token", token: "Clue Token", investigate: true, count: n });
  settle(game);
}

/** Alice sacrifices `n` Clues — asked at the next priority, so they go as
 * the game moves on. */
function sacrificeClues(game: Game, n: number): void {
  game.debugApplyEffect(A, { kind: "sacrifice", who: "you", filter: { subtype: "Clue" }, count: n });
  settle(game);
}

describe("Havengul Laboratory", () => {
  it("transforms at your end step after you sacrificed three Clues this turn", () => {
    const { game } = table();
    const lab = spawn(game, LAB);
    clues(game, 3);
    sacrificeClues(game, 3);
    toStep(game, "end");
    settle(game);
    expect(face(game, lab)).toBe(1);
  });

  it("doesn't after only two", () => {
    const { game } = table();
    const lab = spawn(game, LAB);
    clues(game, 3);
    sacrificeClues(game, 2);
    toStep(game, "end");
    settle(game);
    expect(tokensNamed(game, "Clue Token", A)).toBe(1);
    expect(face(game, lab)).toBe(0);
  });
});

describe("putThereBySource of one ability", () => {
  // Two abilities that each return a creature card; the leaves trigger is
  // linked to the first alone.
  const LINKED = "Test Linked Reanimator";
  const reanimate = (text: string) => ({
    cost: { mana: null, tap: false },
    targets: [{ kind: "card-in-graveyard", whose: "you", filter: { type: "creature" } }] as const,
    effect: { kind: "put-onto-battlefield", target: 0 } as const,
    resolve: null,
    text,
  });
  const board = () => {
    const t = table({ ownRegistry: true });
    t.game.registry.register(
      defineCard({
        name: LINKED,
        manaCost: "{0}",
        types: ["artifact"],
        text: LINKED,
        activated: [reanimate("First"), reanimate("Second")],
        triggered: [
          {
            trigger: { on: "leaves-battlefield", who: "any", filter: { putThereBySource: { activated: 0 } } },
            targets: [],
            effect: { kind: "gain-life", amount: 5 },
            resolve: null,
            text: "When the creature put onto the battlefield with the first ability leaves, gain 5 life.",
          },
        ],
      }),
    );
    return t;
  };

  for (const [index, gained] of [
    [0, 5],
    [1, 0],
  ] as const) {
    it(`a creature the ${index === 0 ? "first" : "second"} ability returned ${gained > 0 ? "fires" : "doesn't fire"} it`, () => {
      const { game } = board();
      const source = spawn(game, LINKED);
      const bears = toGraveyard(game, "Grizzly Bears");
      activate(game, source, index, { targets: [{ kind: "object", object: bears }] });
      expect(zone(game, bears)).toBe("battlefield");
      destroy(game, bears);
      expect(game.state.players[A].life).toBe(20 + gained);
    });
  }
});

describe("Havengul Mystery", () => {
  it("returns a creature card as it transforms, and transforms back when that creature leaves", () => {
    const { game, a } = table();
    const lab = spawn(game, LAB);
    const bears = toGraveyard(game, "Grizzly Bears");
    pickTargets(a, bears);
    transform(game, lab);
    expect(face(game, lab)).toBe(1);
    expect(zone(game, bears)).toBe("battlefield");
    destroy(game, bears);
    expect(face(game, lab)).toBe(0);
  });

  it("ignores another creature leaving", () => {
    const { game, a } = table();
    const lab = spawn(game, LAB);
    const bears = toGraveyard(game, "Grizzly Bears");
    const other = spawn(game, "Grizzly Bears");
    pickTargets(a, bears);
    transform(game, lab);
    destroy(game, other);
    expect(face(game, lab)).toBe(1);
  });

  it("ignores a Clue its Laboratory face made leaving", () => {
    const { game } = table();
    const lab = spawn(game, LAB);
    lands(game, "Wastes", 4);
    activate(game, lab, 1);
    expect(tokensNamed(game, "Clue Token", A)).toBe(1);
    transform(game, lab);
    expect(face(game, lab)).toBe(1);
    destroy(game, named(game, "Clue Token", A)[0]);
    expect(tokensNamed(game, "Clue Token", A)).toBe(0);
    expect(face(game, lab)).toBe(1);
  });
});
