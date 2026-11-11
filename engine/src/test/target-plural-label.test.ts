/** A target group's prompt names several of a thing in the plural: "choose 3
 * creatures", "any number of creatures you control" (found 2026-11-04). */
import { describe, expect, it } from "vitest";

import { describeTargetSpec, pluralTargetLabel } from "../target.js";

describe("pluralTargetLabel", () => {
  it.each([
    ["creature", "creatures"],
    ["creature you control", "creatures you control"],
    ["nonland permanent an opponent controls", "nonland permanents an opponent controls"],
    ["artifact or creature", "artifacts or creatures"],
    ["instant or sorcery spell", "instant or sorcery spells"],
    ["creature or planeswalker an opponent controls", "creatures or planeswalkers an opponent controls"],
    ["card in a graveyard", "cards in a graveyard"],
    ["another creature", "other creatures"],
    ["activated ability you control", "activated abilities you control"],
    ["player", "players"],
  ])("%s -> %s", (one, many) => {
    expect(pluralTargetLabel(one)).toBe(many);
  });
});

describe("a target group's label", () => {
  it("is plural past one, singular at one", () => {
    expect(describeTargetSpec({ kind: "any-number", of: "creature", min: 3, max: 3 })).toBe("3 creatures");
    expect(describeTargetSpec({ kind: "any-number", of: "creature-you-control" })).toBe("any number of creatures you control");
    expect(describeTargetSpec({ kind: "any-number", of: "creature", min: 0, max: "x" })).toBe("up to X creatures");
    expect(describeTargetSpec({ kind: "any-number", of: "creature", min: 0, max: 1 })).toBe("up to 1 creature");
    expect(describeTargetSpec({ kind: "any-number", of: "creature", min: 1, max: 1 })).toBe("1 creature");
  });
});
