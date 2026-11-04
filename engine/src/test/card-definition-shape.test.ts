/**
 * Every card definition must keep sharing a hidden class with the others.
 *
 * `defineCard`'s object literal has a limit on its entries, and passing it costs
 * nothing visible: nothing fails, every definition just gets a shape of its own.
 * One more field took the pool's import from 1.2 s to 5.5 s and made a fuzzer's
 * game about 40% slower per event (2026-11-04, bisected to `maxX`), since every
 * rules read of a definition went megamorphic. See `rareCardFields` in `define.ts`.
 */
import v8 from "node:v8";
import { describe, expect, it } from "vitest";
import { defineCard } from "../cards/define.js";

v8.setFlagsFromString("--allow-natives-syntax");
const haveSameShape = new Function("a", "b", "return %HaveSameMap(a, b)") as (a: unknown, b: unknown) => boolean;
v8.setFlagsFromString("--no-allow-natives-syntax");

describe("card definitions' hidden class", () => {
  it("is shared by two cards that set the same fields", () => {
    const one = defineCard({ name: "Shape Probe One", manaCost: "{1}", types: ["artifact"], text: "" });
    const two = defineCard({ name: "Shape Probe Two", manaCost: "{2}", types: ["artifact"], text: "" });
    expect(haveSameShape(one, two)).toBe(true);
  });

  it("is shared when a rare field is set too", () => {
    const one = defineCard({ name: "Shape Probe One", types: ["artifact"], text: "", tokenName: "One" });
    const two = defineCard({ name: "Shape Probe Two", types: ["artifact"], text: "", tokenName: "Two" });
    expect(haveSameShape(one, two)).toBe(true);
  });
});
