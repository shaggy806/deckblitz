/**
 * Innistrad: Midnight Hunt.
 *
 * Coven: "if you control three or more creatures with different powers" — the `coven` condition,
 * three distinct powers among the creatures you control as it's checked.
 *
 * Day and night (rule 731): "whenever day becomes night or night becomes day" is the
 * `day-night-changes` trigger, which the first "it becomes day" (from neither) doesn't fire
 * (731.1a); "if it's neither day nor night, it becomes day as this creature enters" is
 * `becomesDayAsEnters`; "if it's night" is the `day-night` condition.
 */
import { describe, expect, it } from "vitest";

import { A, activate, cast, hand, keywords, lands, settle, spawn, table, toHand, toStep } from "./harness.js";

describe("coven", () => {
  it("counts distinct powers, not creatures", () => {
    const { game } = table();
    const witch = spawn(game, "Candlegrove Witch"); // 2/2
    spawn(game, "Grizzly Bears"); // 2/2
    spawn(game, "Grizzly Bears"); // 2/2 — the same power
    toStep(game, "postcombat-main");
    expect(keywords(game, witch).has("flying")).toBe(false);

    const { game: g2 } = table();
    const w2 = spawn(g2, "Candlegrove Witch");
    spawn(g2, "Hill Giant"); // 3/3
    spawn(g2, "Memnite"); // 1/1
    toStep(g2, "postcombat-main");
    expect(keywords(g2, w2).has("flying")).toBe(true);
  });

  it("gates an activated ability (Ambitious Farmhand's transform)", () => {
    const { game } = table();
    lands(game, "Plains", 6);
    const farmhand = spawn(game, "Ambitious Farmhand"); // 1/1
    spawn(game, "Memnite"); // 1/1
    expect(() => activate(game, farmhand, 0)).toThrow();
    spawn(game, "Grizzly Bears");
    spawn(game, "Hill Giant");
    activate(game, farmhand, 0);
    expect(game.state.objects[farmhand].face).toBe(1);
  });
});

describe("day and night (rule 731)", () => {
  it("becomes day as such a creature enters, and that first day isn't a change", () => {
    const { game } = table();
    lands(game, "Island", 4);
    expect(game.state.dayNight).toBeNull();
    const before = hand(game).length;
    cast(game, toHand(game, "Firmament Sage"));
    expect(game.state.dayNight).toBe("day");
    expect(hand(game).length).toBe(before);
  });

  it("'whenever day becomes night or night becomes day' fires each way", () => {
    const { game } = table();
    spawn(game, "Firmament Sage");
    game.debugApplyEffect(A, { kind: "day-night", value: "day" });
    let before = hand(game).length;
    game.debugApplyEffect(A, { kind: "day-night", value: "night" });
    toStep(game, "postcombat-main");
    expect(hand(game).length).toBe(before + 1);
    before = hand(game).length;
    game.debugApplyEffect(A, { kind: "day-night", value: "day" });
    settle(game);
    expect(hand(game).length).toBe(before + 1);
  });
});
