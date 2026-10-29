/**
 * B253's lead cards, one per feature built: Ghirapur Guide ("can't be blocked
 * by [filter] this turn"), Full Steam Ahead (a granted static), Blood Moon and
 * Tideshaper Mystic (rule 305.7's land-type setting, fixed and chosen on
 * resolution), Switcheroo (exchange of control, rule 701.12).
 */

import { describe, expect, it } from "vitest";

import { intrinsicManaColors } from "../characteristics.js";
import { A, B, activate, blockOffer, cast, controller, pt, ref, registryOf, spawn, subtypes, table, toHand } from "./harness.js";

describe("B253 lead cards", () => {
  it("Ghirapur Guide: target creature can't be blocked by power 2 or less this turn", () => {
    const { game, a } = table();
    const guide = spawn(game, "Ghirapur Guide", A);
    spawn(game, "Forest", A);
    spawn(game, "Forest", A);
    spawn(game, "Forest", A);
    const bears = spawn(game, "Grizzly Bears", B);
    const giant = spawn(game, "Hill Giant", B);
    activate(game, guide, 0, { targets: [ref(guide)] });
    const offer = blockOffer(game, a, [guide]);
    const eligible = (id: string) => offer.eligible.find((e) => e.blocker === id)?.canBlock ?? [];
    expect(eligible(bears)).toEqual([]);
    expect(eligible(giant)).toEqual([guide]);
  });

  it("Full Steam Ahead: +2/+2, trample, and no more than one blocker each", () => {
    const { game, a } = table();
    const bears = spawn(game, "Grizzly Bears", A);
    for (let i = 0; i < 5; i++) spawn(game, "Forest", A);
    cast(game, toHand(game, "Full Steam Ahead"));
    expect(pt(game, bears)).toEqual({ power: 4, toughness: 4 });
    const b1 = spawn(game, "Grizzly Bears", B);
    const b2 = spawn(game, "Grizzly Bears", B);
    blockOffer(game, a, [bears]);
    expect(() =>
      game.dispatch({
        type: "declare-blockers",
        player: B,
        blocks: [
          { blocker: b1, attacker: bears },
          { blocker: b2, attacker: bears },
        ],
      }),
    ).toThrow();
  });

  it("Blood Moon: a nonbasic land is a Mountain that taps only for {R}", () => {
    const { game } = table();
    const coast = spawn(game, "Yavimaya Coast", A);
    for (let i = 0; i < 3; i++) spawn(game, "Mountain", A);
    cast(game, toHand(game, "Blood Moon"));
    expect(subtypes(game, coast)).toEqual(["Mountain"]);
    expect(intrinsicManaColors(game.state, registryOf(game), game.state.objects[coast])).toEqual(["R"]);
    const coastAbilities = game
      .legalActions(A)
      .filter((action) => action.kind === "activate-ability" && action.source === coast);
    expect(coastAbilities.length).toBe(1);
  });

  it("Tideshaper Mystic: the land becomes the chosen basic type until end of turn", () => {
    const { game, a } = table();
    const mystic = spawn(game, "Tideshaper Mystic", A);
    const coast = spawn(game, "Yavimaya Coast", B);
    a.chooseCreatureTypeFn = (_view, _source, options) => (options.includes("Swamp") ? "Swamp" : options[0]);
    activate(game, mystic, 0, { targets: [ref(coast)] });
    expect(subtypes(game, coast)).toEqual(["Swamp"]);
    game.advanceUntil((s) => s.turn.number === 2);
    expect(subtypes(game, coast)).toEqual([]);
  });

  it("Switcheroo: two creatures change hands", () => {
    const { game } = table();
    const mine = spawn(game, "Grizzly Bears", A);
    const theirs = spawn(game, "Hill Giant", B);
    for (let i = 0; i < 5; i++) spawn(game, "Island", A);
    cast(game, toHand(game, "Switcheroo"), { targets: [ref(mine), ref(theirs)] });
    expect(controller(game, mine)).toBe(B);
    expect(controller(game, theirs)).toBe(A);
  });
});
