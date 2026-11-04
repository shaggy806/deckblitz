import { describe, expect, it } from "vitest";
import type { ScriptedController } from "../controller.js";
import type { Game } from "../game.js";
import type { ObjectId } from "../primitives.js";
import type { TargetRef } from "../target.js";
import { A, B, cast, counters, destroy, hand, keywords, lands, life, ref, settle, spawn, table, toHand, zone } from "./harness.js";

/**
 * "If you would proliferate, proliferate twice instead" (Tekuthal, Inquiry
 * Dominus; rule 701.34a): the `would-proliferate` replacement. Each time is its
 * own choice, over the board as the last one left it.
 */

/** Put counters on a permanent. */
function withCounters(game: Game, id: ObjectId, kind: string, amount: number): ObjectId {
  game.debugApplyEffect(game.state.objects[id].controller, { kind: "add-counter", target: 0, counter: kind, amount }, [ref(id)]);
  return id;
}

/** Each question answers with what `answers` holds next, and logs what it offered. */
function answering(seat: ScriptedController, ...answers: readonly (readonly ObjectId[])[]): { offered: (readonly TargetRef[])[] } {
  const seen = { offered: [] as (readonly TargetRef[])[] };
  let next = 0;
  seat.chooseProliferateFn = (_view, eligible) => {
    seen.offered.push(eligible);
    const pick = answers[next] ?? [];
    next += 1;
    return pick.map((id) => ref(id));
  };
  return seen;
}

describe("Tekuthal: if you would proliferate, proliferate twice instead", () => {
  it("two questions, two counters of the kind on each chosen both times", () => {
    const { game, a } = table();
    spawn(game, "Tekuthal, Inquiry Dominus");
    const bears = withCounters(game, spawn(game, "Grizzly Bears"), "+1/+1", 1);
    const seen = answering(a, [bears], [bears]);
    lands(game, "Mountain", 3);
    cast(game, toHand(game, "Volt Charge"), { targets: [ref(B)] });
    expect(seen.offered).toHaveLength(2);
    expect(counters(game, bears)).toBe(3);
  });

  it("the second choice is its own: not the first's, and over what the first left", () => {
    const { game, a } = table();
    spawn(game, "Tekuthal, Inquiry Dominus");
    const bears = withCounters(game, spawn(game, "Grizzly Bears"), "+1/+1", 1);
    const giant = withCounters(game, spawn(game, "Hill Giant", B), "-1/-1", 1);
    const seen = answering(a, [bears], [giant]);
    lands(game, "Mountain", 3);
    cast(game, toHand(game, "Volt Charge"), { targets: [ref(B)] });
    expect(seen.offered).toHaveLength(2);
    expect(counters(game, bears)).toBe(2);
    expect(counters(game, giant, "-1/-1")).toBe(2);
  });

  it("only yours: an opponent's proliferate is once", () => {
    const { game, b } = table();
    spawn(game, "Tekuthal, Inquiry Dominus");
    const bears = withCounters(game, spawn(game, "Grizzly Bears"), "+1/+1", 1);
    const seen = answering(b, [bears], [bears]);
    game.debugApplyEffect(B, { kind: "proliferate" }, []);
    settle(game);
    expect(seen.offered).toHaveLength(1);
    expect(counters(game, bears)).toBe(2);
  });

  it("two of them, the legend rule aside: four times (rule 614.5)", () => {
    const { game, a } = table();
    spawn(game, "Mirror Gallery");
    spawn(game, "Tekuthal, Inquiry Dominus");
    spawn(game, "Tekuthal, Inquiry Dominus");
    const bears = withCounters(game, spawn(game, "Grizzly Bears"), "+1/+1", 1);
    const seen = answering(a, [bears], [bears], [bears], [bears]);
    game.debugApplyEffect(A, { kind: "proliferate" }, []);
    settle(game);
    expect(seen.offered).toHaveLength(4);
    expect(counters(game, bears)).toBe(5);
  });

  it("nothing to choose: no question, and nothing stops", () => {
    const { game, a } = table();
    spawn(game, "Tekuthal, Inquiry Dominus");
    const seen = answering(a);
    const before = hand(game).length;
    game.debugApplyEffect(A, { kind: "proliferate", then: { kind: "draw", amount: 1 } }, []);
    settle(game);
    expect(seen.offered).toHaveLength(0);
    expect(hand(game).length).toBe(before + 1);
  });

  it("then waits until the last of them (Contentious Plan's draw)", () => {
    const { game, a } = table();
    spawn(game, "Tekuthal, Inquiry Dominus");
    const bears = withCounters(game, spawn(game, "Grizzly Bears"), "+1/+1", 1);
    const before = hand(game).length;
    let handAtSecond = -1;
    let question = 0;
    a.chooseProliferateFn = () => {
      question += 1;
      if (question === 2) handAtSecond = hand(game).length;
      return [ref(bears)];
    };
    game.debugApplyEffect(A, { kind: "proliferate", then: { kind: "draw", amount: 1 } }, []);
    settle(game);
    expect(question).toBe(2);
    expect(handAtSecond).toBe(before);
    expect(hand(game).length).toBe(before + 1);
  });

  it("gone, and it's once again", () => {
    const { game, a } = table();
    const tekuthal = spawn(game, "Tekuthal, Inquiry Dominus");
    const bears = withCounters(game, spawn(game, "Grizzly Bears"), "+1/+1", 1);
    destroy(game, tekuthal);
    const seen = answering(a, [bears]);
    game.debugApplyEffect(A, { kind: "proliferate" }, []);
    settle(game);
    expect(seen.offered).toHaveLength(1);
  });
});

describe("Tekuthal's ability: remove three counters from among others for an indestructible counter", () => {
  /** The ability activated, its Phyrexian pips in mana, the counters chosen. */
  function activateFor(game: Game, a: ScriptedController, tekuthal: ObjectId, picks: readonly ObjectId[], phyrexianLife?: number): void {
    a.chooseCounterRemovalsFn = () =>
      [...new Set(picks)].map((object) => ({
        object,
        kind: Object.keys(game.state.objects[object].counters)[0],
        count: picks.filter((id) => id === object).length,
      }));
    game.dispatch({ type: "activate-ability", player: A, source: tekuthal, abilityIndex: 0, targets: [], ...(phyrexianLife !== undefined ? { phyrexianLife } : {}) });
    settle(game);
  }

  it("from among other artifacts, creatures and planeswalkers you control, by mana or life", () => {
    const { game, a } = table();
    const tekuthal = spawn(game, "Tekuthal, Inquiry Dominus");
    const bears = withCounters(game, spawn(game, "Grizzly Bears"), "+1/+1", 2);
    const ring = withCounters(game, spawn(game, "Sol Ring"), "charge", 1);
    lands(game, "Island", 1);
    activateFor(game, a, tekuthal, [bears, bears, ring], 2);
    expect(life(game, A)).toBe(16);
    expect(counters(game, tekuthal, "indestructible")).toBe(1);
    expect(counters(game, bears)).toBe(0);
    expect(counters(game, ring, "charge")).toBe(0);
    expect(keywords(game, tekuthal).has("indestructible")).toBe(true);
    destroy(game, tekuthal);
    expect(zone(game, tekuthal)).toBe("battlefield");
  });

  it("not with three counters unless they're on others: its own don't count, an opponent's don't", () => {
    const { game } = table();
    const tekuthal = withCounters(game, spawn(game, "Tekuthal, Inquiry Dominus"), "+1/+1", 3);
    withCounters(game, spawn(game, "Grizzly Bears", B), "+1/+1", 3);
    lands(game, "Island", 3);
    expect(game.legalActions(A).some((o) => o.kind === "activate-ability" && o.source === tekuthal)).toBe(false);
  });
});
