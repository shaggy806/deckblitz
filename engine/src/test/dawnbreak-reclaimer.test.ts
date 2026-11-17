import { describe, expect, it } from "vitest";
import type { ObjectId } from "../primitives.js";
import type { ScriptedController } from "../controller.js";
import { A, B, C, controller, settle, spawn, table, toGraveyard, toStep, zone } from "./harness.js";

/**
 * Dawnbreak Reclaimer: "At the beginning of your end step, choose a creature
 * card in an opponent's graveyard, then that player chooses a creature card
 * in your graveyard. You may return those cards to the battlefield under
 * their owners' control." — and its rulings: an opponent's creature card
 * must be chosen if there is one, and with none, the controller chooses which
 * opponent chooses from their graveyard.
 */

/** The seat answers its choose-from-zone decisions in turn, recording each
 * one's eligible cards. */
function zoneAnswers(seat: ScriptedController, ...answers: readonly (readonly ObjectId[])[]): (readonly ObjectId[])[] {
  const offered: (readonly ObjectId[])[] = [];
  let next = 0;
  seat.chooseFromZoneFn = (_view, eligible) => {
    offered.push(eligible);
    const answer = answers[next] ?? [];
    next += 1;
    return answer;
  };
  return offered;
}

/** The seat answers its choose-modes questions in turn. */
function modeAnswers(seat: ScriptedController, ...answers: readonly (readonly number[])[]): void {
  let next = 0;
  seat.chooseModesFn = () => {
    const answer = answers[next] ?? [];
    next += 1;
    return [...answer];
  };
}

function toEndStep(game: ReturnType<typeof table>["game"]): void {
  toStep(game, "end");
  settle(game);
}

describe("Dawnbreak Reclaimer", () => {
  it("you choose an opponent's creature card, they choose one of yours, and both return under their owners' control", () => {
    const { game, a, b } = table();
    spawn(game, "Dawnbreak Reclaimer");
    const theirs = toGraveyard(game, "Hill Giant", B);
    toGraveyard(game, "Lightning Bolt", B);
    const mine = toGraveyard(game, "Grizzly Bears");
    const other = toGraveyard(game, "Llanowar Elves");
    const mineOffered = zoneAnswers(a, [theirs]);
    const theirsOffered = zoneAnswers(b, [other]);
    modeAnswers(a, [0]);
    toEndStep(game);
    // Only creature cards, only an opponent's.
    expect(mineOffered[0]).toEqual([theirs]);
    expect([...theirsOffered[0]].sort()).toEqual([mine, other].sort());
    expect(zone(game, theirs)).toBe("battlefield");
    expect(controller(game, theirs)).toBe(B);
    expect(zone(game, other)).toBe("battlefield");
    expect(controller(game, other)).toBe(A);
    expect(zone(game, mine)).toBe("graveyard");
  });

  it("declining the return leaves both cards where they are", () => {
    const { game, a, b } = table();
    spawn(game, "Dawnbreak Reclaimer");
    const theirs = toGraveyard(game, "Hill Giant", B);
    const mine = toGraveyard(game, "Grizzly Bears");
    zoneAnswers(a, [theirs]);
    zoneAnswers(b, [mine]);
    modeAnswers(a, []);
    toEndStep(game);
    expect(zone(game, theirs)).toBe("graveyard");
    expect(zone(game, mine)).toBe("graveyard");
  });

  it("the owner of the card you chose is the one who chooses from your graveyard", () => {
    const { game, a, b, c } = table({ players: 3 });
    spawn(game, "Dawnbreak Reclaimer");
    toGraveyard(game, "Shivan Dragon", B);
    const carols = toGraveyard(game, "Hill Giant", C);
    const mine = toGraveyard(game, "Grizzly Bears");
    const aliceOffered = zoneAnswers(a, [carols]);
    const bobAsked = zoneAnswers(b);
    const carolOffered = zoneAnswers(c, [mine]);
    modeAnswers(a, [0]);
    toEndStep(game);
    // Every opponent's creature cards.
    expect(aliceOffered[0]).toHaveLength(2);
    expect(bobAsked).toHaveLength(0);
    expect(carolOffered).toHaveLength(1);
    expect(controller(game, carols)).toBe(C);
    expect(zone(game, mine)).toBe("battlefield");
    expect(controller(game, mine)).toBe(A);
  });

  it("with no creature card in any opponent's graveyard, you choose the opponent who chooses, and may return yours", () => {
    const { game, a, b, c } = table({ players: 3 });
    spawn(game, "Dawnbreak Reclaimer");
    toGraveyard(game, "Lightning Bolt", B);
    const mine = toGraveyard(game, "Grizzly Bears");
    const bobAsked = zoneAnswers(b);
    const carolOffered = zoneAnswers(c, [mine]);
    // Carol (the second opponent), then yes.
    modeAnswers(a, [1], [0]);
    toEndStep(game);
    expect(bobAsked).toHaveLength(0);
    expect(carolOffered).toEqual([[mine]]);
    expect(zone(game, mine)).toBe("battlefield");
    expect(controller(game, mine)).toBe(A);
  });

  it("with no creature card in any graveyard, nothing is asked — not even which opponent", () => {
    const { game, a } = table({ players: 3 });
    spawn(game, "Dawnbreak Reclaimer");
    let asked = 0;
    a.chooseModesFn = () => {
      asked += 1;
      return [0];
    };
    toEndStep(game);
    expect(asked).toBe(0);
  });
});
