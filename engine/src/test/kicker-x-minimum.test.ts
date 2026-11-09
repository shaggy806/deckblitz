/**
 * "Kicker {X}. X can't be 0" (Thieving Skydiver): a kick at X 0 isn't legal
 * (rule 107.3a), and the X it's kicked with is the X its enters trigger reads.
 */

import { describe, expect, it } from "vitest";

import type { LegalAction } from "../actions.js";
import { A, B, cast, controller, lands, named, pickTargets, spawn, table, toHand, watchTargets } from "./harness.js";

describe("Thieving Skydiver: Kicker {X}. X can't be 0", () => {
  it("is offered kicked only with X at least 1, and unkicked", () => {
    const { game } = table();
    const skydiver = toHand(game, "Thieving Skydiver");
    lands(game, "Island", 5);
    const offers = game
      .legalActions(A)
      .filter((a): a is Extract<LegalAction, { kind: "cast-spell" }> => a.kind === "cast-spell" && a.card === skydiver);
    expect(offers.find((o) => o.kicked === true || o.kickerCost !== undefined)?.xCost?.minX).toBe(1);
  });

  it("refuses a kick at X 0", () => {
    const { game } = table();
    const skydiver = toHand(game, "Thieving Skydiver");
    lands(game, "Island", 2);
    expect(() => cast(game, skydiver, { x: 0, kicked: true })).toThrow(/can't be kicked with X less than 1/);
  });

  it("kicked with X 2 steals an artifact of mana value 2 or less, and attaches an Equipment", () => {
    const { game, a } = table();
    const sword = spawn(game, "Bonesplitter", B); // mana value 1, an Equipment
    const skydiver = toHand(game, "Thieving Skydiver");
    lands(game, "Island", 4);
    pickTargets(a, sword);
    cast(game, skydiver, { x: 2, kicked: true });
    expect(controller(game, sword)).toBe(A);
    expect(game.state.objects[sword].attachedTo).toBe(named(game, "Thieving Skydiver")[0]);
  });

  it("kicked with X 1 can't reach mana value 2; unkicked nothing triggers", () => {
    const { game, a } = table();
    const big = spawn(game, "Mind Stone", B); // mana value 2
    const small = spawn(game, "Bonesplitter", B);
    const other = spawn(game, "Bonesplitter", B);
    const watched = watchTargets(a, (offered) => [offered[0][0]]);
    lands(game, "Island", 3);
    cast(game, toHand(game, "Thieving Skydiver"), { x: 1, kicked: true });
    expect(watched.offered[0]).toEqual(expect.arrayContaining([small, other]));
    expect(watched.offered[0]).not.toContain(big);

    const unkicked = table();
    spawn(unkicked.game, "Bonesplitter", B);
    lands(unkicked.game, "Island", 2);
    const seen = watchTargets(unkicked.a);
    cast(unkicked.game, toHand(unkicked.game, "Thieving Skydiver"));
    expect(seen.asked).toBe(0);
  });
});
