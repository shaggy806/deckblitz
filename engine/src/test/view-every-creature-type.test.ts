import { describe, expect, it } from "vitest";

import { A, spawn, table } from "./harness.js";

// The view's `subtypes` are the printed words, so "is every creature type"
// (rule 702.73a, or an effect saying so) is a flag of its own: a client
// narrowing "shares a creature type" between targets reads it.

describe("the view's everyCreatureType", () => {
  it("is set for a changeling, and not for anything else", () => {
    const { game } = table();
    const changeling = spawn(game, "Changeling Outcast");
    const bears = spawn(game, "Grizzly Bears");
    const view = game.viewFor(A);
    expect(view.objects[changeling].everyCreatureType).toBe(true);
    expect(view.objects[changeling].subtypes).toEqual(["Shapeshifter"]);
    expect(view.objects[bears].everyCreatureType).toBeUndefined();
  });

  it("is set by an effect that makes a creature every type (Maskwood Nexus)", () => {
    const { game } = table();
    const bears = spawn(game, "Grizzly Bears");
    spawn(game, "Maskwood Nexus");
    expect(game.viewFor(A).objects[bears].everyCreatureType).toBe(true);
  });
});
