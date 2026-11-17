/**
 * The Pandorica: "Untap another target nonland permanent, then it phases out.
 * It can't phase in for as long as The Pandorica remains tapped. When The
 * Pandorica becomes untapped or leaves the battlefield, that permanent phases
 * in." `phase-out`'s `cantPhaseIn: "while-source-tapped"` holds it through its
 * controller's untap steps (rules 502.1, 611.2b); the delayed trigger's
 * `orLeaves` fires on the source leaving the battlefield (not on a change of
 * control), and the `phase-in` effect brings it back (rule 702.26c).
 */
import { describe, expect, it } from "vitest";

import { A, B, activate, controller, destroy, lands, nextTurn, pickPermanents, ref, settle, spawn, table, zone } from "./harness.js";

function sealed() {
  const seats = table();
  lands(seats.game, "Plains", 2);
  const pandorica = spawn(seats.game, "The Pandorica");
  const bears = spawn(seats.game, "Grizzly Bears", B);
  seats.game.debugApplyEffect(B, { kind: "tap", target: 0 }, [ref(bears)]);
  expect(seats.game.state.objects[bears].tapped).toBe(true);
  activate(seats.game, pandorica, 0, { targets: [ref(bears)] });
  expect(zone(seats.game, bears)).toBe("phased-out");
  expect(seats.game.state.objects[bears].tapped).toBe(false);
  return { ...seats, pandorica, bears };
}

describe("The Pandorica", () => {
  it("the permanent stays out while The Pandorica stays tapped, and phases in when it untaps", () => {
    const { game, a, pandorica, bears } = sealed();
    pickPermanents(a, pandorica); // kept tapped through alice's untap step
    nextTurn(game); // bob's untap step: held
    expect(zone(game, bears)).toBe("phased-out");
    nextTurn(game);
    nextTurn(game);
    expect(zone(game, bears)).toBe("phased-out");
    expect(game.state.objects[pandorica].tapped).toBe(true);
    pickPermanents(a); // let it untap
    nextTurn(game); // alice's turn: it untaps, the trigger phases the Bears in
    settle(game);
    expect(game.state.objects[pandorica].tapped).toBe(false);
    expect(zone(game, bears)).toBe("battlefield");
    expect(controller(game, bears)).toBe(B);
    expect(game.state.delayedTriggers).toHaveLength(0);
  });

  it("any untap fires it at once", () => {
    const { game, pandorica, bears } = sealed();
    game.debugApplyEffect(A, { kind: "untap", target: 0 }, [ref(pandorica)]);
    settle(game);
    expect(zone(game, bears)).toBe("battlefield");
    expect(game.state.delayedTriggers).toHaveLength(0);
  });

  it("The Pandorica leaving the battlefield phases it in", () => {
    const { game, pandorica, bears } = sealed();
    destroy(game, pandorica);
    settle(game);
    expect(zone(game, bears)).toBe("battlefield");
    expect(game.state.delayedTriggers).toHaveLength(0);
  });

  it("a change of control doesn't fire it, and the hold goes on while it stays tapped", () => {
    const { game, pandorica, bears } = sealed();
    game.debugApplyEffect(B, { kind: "gain-control", target: 0, untilEndOfTurn: false }, [ref(pandorica)]);
    settle(game);
    expect(controller(game, pandorica)).toBe(B);
    expect(zone(game, bears)).toBe("phased-out");
    expect(game.state.delayedTriggers).toHaveLength(1);
  });

  it("untapped in response, nothing holds it: it phases in at bob's untap step", () => {
    const { game, a } = table();
    lands(game, "Plains", 2);
    const pandorica = spawn(game, "The Pandorica");
    const bears = spawn(game, "Grizzly Bears", B);
    activate(game, pandorica, 0, { targets: [ref(bears)], settle: false });
    game.debugApplyEffect(A, { kind: "untap", target: 0 }, [ref(pandorica)]);
    settle(game);
    expect(zone(game, bears)).toBe("phased-out");
    pickPermanents(a);
    nextTurn(game);
    expect(zone(game, bears)).toBe("battlefield");
  });
});
