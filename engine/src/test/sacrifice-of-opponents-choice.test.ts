/**
 * "Sacrifice a land of an opponent's choice" (Demonic Hordes): an opponent
 * picks among the lands you control (`choose-opponent` then `choose-permanents`
 * `chooser: "that-player"`, `controlledByPlayer: "you"`), and you sacrifice
 * it — `sacrifice-target` `byItsController`, since only a permanent's
 * controller can sacrifice it (rule 701.21a).
 */
import { describe, expect, it } from "vitest";

import { A, B, C, activate, graveyard, lands, pickModes, pickPermanents, ref, spawn, table, toStep, zone } from "./harness.js";

describe("Demonic Hordes", () => {
  it("unpaid, it's tapped and you sacrifice the land your opponent picks", () => {
    const { game, a, b } = table();
    const hordes = spawn(game, "Demonic Hordes");
    const [forest, mountain] = [...lands(game, "Forest", 1), ...lands(game, "Mountain", 1)];
    const theirs = lands(game, "Swamp", 1, B);
    pickModes(a); // decline to pay
    const seen = pickPermanents(b, mountain);
    toStep(game, "draw");
    expect([...seen.offered].sort()).toEqual([forest, mountain].sort());
    expect(seen.offered).not.toContain(theirs[0]);
    expect(game.state.objects[hordes].tapped).toBe(true);
    expect(zone(game, mountain)).toBe("graveyard");
    expect(graveyard(game, A)).toContain(mountain);
    expect(zone(game, forest)).toBe("battlefield");
  });

  it("paid, nothing happens", () => {
    const { game, a } = table();
    const hordes = spawn(game, "Demonic Hordes");
    const swamps = lands(game, "Swamp", 3);
    pickModes(a, 0);
    toStep(game, "draw");
    expect(game.state.objects[hordes].tapped).toBe(false);
    expect(swamps.every((id) => zone(game, id) === "battlefield")).toBe(true);
    expect(swamps.every((id) => game.state.objects[id].tapped)).toBe(true);
  });

  it("at three players its controller picks which opponent chooses", () => {
    const { game, a, b, c } = table({ players: 3 });
    spawn(game, "Demonic Hordes");
    const [forest, mountain] = [...lands(game, "Forest", 1), ...lands(game, "Mountain", 1)];
    lands(game, "Swamp", 3); // so the payment is asked
    // Decline to pay, then name the second opponent in turn order: Carol.
    const answers = [[], [1]];
    a.chooseModesFn = () => answers.shift() ?? [];
    pickPermanents(b, forest);
    pickPermanents(c, mountain);
    toStep(game, "draw");
    expect(zone(game, mountain)).toBe("graveyard");
    expect(zone(game, forest)).toBe("battlefield");
    expect(C).toBe("carol");
  });

  it("taps to destroy target land", () => {
    const { game, a } = table();
    const hordes = spawn(game, "Demonic Hordes");
    game.state.objects[hordes].summoningSick = false;
    const [island] = lands(game, "Island", 1, B);
    lands(game, "Swamp", 3);
    pickModes(a, 0);
    toStep(game, "precombat-main");
    activate(game, hordes, 0, { targets: [ref(island)] });
    expect(zone(game, island)).toBe("graveyard");
  });
});
