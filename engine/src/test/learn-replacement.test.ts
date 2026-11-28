/**
 * A `would-learn` replacement (`LearnReplacement`): learn (rule 701.48a, the
 * `learn()` sequence) replaced whole by an effect — Retriever Phoenix's "as
 * long as this card is in your graveyard, if you would learn, you may instead
 * return this card to the battlefield" (rule 113.6b). The learner chooses
 * one of the replacements or, each being a "you may", learning (rule 616.1).
 */
import { describe, expect, it } from "vitest";

import type { ScriptedController } from "../controller.js";
import { A, B, cast, hand, lands, pickFromZone, table, toGraveyard, toHand, zone } from "./harness.js";

/** The seat answers each choose-modes in turn, and records what each offered. */
function answerModes(seat: ScriptedController, ...answers: (readonly number[])[]): (readonly string[])[] {
  const offered: (readonly string[])[] = [];
  seat.chooseModesFn = (_view, _min, _max, texts) => {
    offered.push([...(texts ?? [])]);
    return [...(answers.shift() ?? [])];
  };
  return offered;
}

describe("Retriever Phoenix", () => {
  it("returns from its owner's graveyard in place of a learn", () => {
    const { game, a } = table({ sideboard: ["Academic Probation"] });
    lands(game, "Plains", 2);
    const phoenix = toGraveyard(game, "Retriever Phoenix", A);
    const offered = answerModes(a, [1]);
    let lessonAsked = false;
    a.chooseFromZoneFn = () => {
      lessonAsked = true;
      return [];
    };
    cast(game, toHand(game, "Study Break"), { targets: [null, null] });
    expect(offered[0]).toEqual(["Learn", "Return Retriever Phoenix to the battlefield instead"]);
    expect(zone(game, phoenix)).toBe("battlefield");
    expect(game.state.objects[phoenix].controller).toBe(A);
    // The learn was replaced: neither its rummage nor its Lesson happened.
    expect(offered).toHaveLength(1);
    expect(lessonAsked).toBe(false);
  });

  it("the learner may learn instead, and the Phoenix stays", () => {
    const { game, a } = table();
    lands(game, "Plains", 2);
    const phoenix = toGraveyard(game, "Retriever Phoenix", A);
    toHand(game, "Wastes");
    // Learn, then the rummage's "may": yes.
    const offered = answerModes(a, [0], [0]);
    const before = hand(game, A).length;
    cast(game, toHand(game, "Study Break"), { targets: [null, null] });
    expect(offered).toHaveLength(2);
    expect(zone(game, phoenix)).toBe("graveyard");
    // Discarded the Wastes, drew one.
    expect(hand(game, A).length).toBe(before);
  });

  it("with two in the graveyard, one learn returns only one", () => {
    const { game, a } = table();
    lands(game, "Plains", 2);
    const first = toGraveyard(game, "Retriever Phoenix", A);
    const second = toGraveyard(game, "Retriever Phoenix", A);
    const offered = answerModes(a, [2]);
    cast(game, toHand(game, "Study Break"), { targets: [null, null] });
    expect(offered[0]).toHaveLength(3);
    expect([zone(game, first), zone(game, second)].sort()).toEqual(["battlefield", "graveyard"]);
  });

  it("isn't offered for another player's learn", () => {
    const { game, b } = table();
    toGraveyard(game, "Retriever Phoenix", A);
    lands(game, "Plains", 2, B);
    const offered = answerModes(b, []);
    pickFromZone(b);
    game.debugApplyEffect(B, { kind: "sequence", learn: true, effects: [{ kind: "gain-life", amount: 1 }] });
    expect(offered).toHaveLength(0);
    expect(game.state.players[B].life).toBe(21);
  });

  it("its own enters trigger, when cast, may return another Phoenix", () => {
    const { game, a } = table();
    lands(game, "Mountain", 4);
    const old = toGraveyard(game, "Retriever Phoenix", A);
    answerModes(a, [1]);
    cast(game, toHand(game, "Retriever Phoenix"));
    expect(zone(game, old)).toBe("battlefield");
  });
});
