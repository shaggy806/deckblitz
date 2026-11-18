/**
 * Rule 613.7g: a double-faced permanent receives a new timestamp each time it
 * transforms or converts. Its own static abilities then apply after whatever
 * was already there in the same layer (613.7a), and it is still the same
 * object (rule 712.10): what asks "is this the permanent that put the ability
 * on the stack" reads its stint, not the timestamp.
 *
 * Proving cards: Docent of Perfection // Final Iteration ("Wizards you control
 * get +2/+1 and have flying"), Gravity Sphere ("All creatures lose flying").
 */

import { describe, expect, it } from "vitest";

import { A, keywords, pt, ref, spawn, table } from "./harness.js";

describe("a transformed permanent has a new timestamp (rule 613.7g)", () => {
  it("Final Iteration's flying applies after a Gravity Sphere that entered before the transform", () => {
    const { game } = table();
    const docent = spawn(game, "Docent of Perfection");
    const wizard = spawn(game, "Fugitive Wizard");
    spawn(game, "Gravity Sphere");
    expect(keywords(game, docent).has("flying")).toBe(false);

    game.debugApplyEffect(A, { kind: "transform", target: 0 }, [ref(docent)]);
    expect(game.state.objects[docent].face).toBe(1);
    // Layer 6 in timestamp order: the Sphere's "lose flying", then the
    // Iteration's "have flying". Its own printed flying is still lost.
    expect(pt(game, wizard)).toEqual({ power: 3, toughness: 2 });
    expect(keywords(game, wizard).has("flying")).toBe(true);
    expect(keywords(game, docent).has("flying")).toBe(false);
  });

  it("a Gravity Sphere that enters after the transform still takes the flying away", () => {
    const { game } = table();
    const docent = spawn(game, "Docent of Perfection");
    const wizard = spawn(game, "Fugitive Wizard");
    game.debugApplyEffect(A, { kind: "transform", target: 0 }, [ref(docent)]);
    expect(keywords(game, wizard).has("flying")).toBe(true);
    spawn(game, "Gravity Sphere");
    expect(keywords(game, wizard).has("flying")).toBe(false);
  });

  it("transforming back renews it again", () => {
    const { game } = table();
    const docent = spawn(game, "Docent of Perfection");
    const first = game.state.objects[docent].timestamp;
    const stint = game.state.objects[docent].zoneChangeCount ?? 0;
    game.debugApplyEffect(A, { kind: "transform", target: 0 }, [ref(docent)]);
    const second = game.state.objects[docent].timestamp;
    game.debugApplyEffect(A, { kind: "transform", target: 0 }, [ref(docent)]);
    expect(second).toBeGreaterThan(first);
    expect(game.state.objects[docent].timestamp).toBeGreaterThan(second);
    // The same object throughout (rule 712.10).
    expect(game.state.objects[docent].zoneChangeCount ?? 0).toBe(stint);
  });
});

describe("a permanent turned face down or face up has a new timestamp (rule 613.7f)", () => {
  it("each turn renews it, and it stays the same object", () => {
    const { game } = table();
    const bears = spawn(game, "Grizzly Bears");
    const entered = game.state.objects[bears].timestamp;
    const stint = game.state.objects[bears].zoneChangeCount ?? 0;
    game.debugApplyEffect(A, { kind: "turn-face-down", target: 0 }, [ref(bears)]);
    expect(game.state.objects[bears].faceDown).toBeDefined();
    const down = game.state.objects[bears].timestamp;
    expect(down).toBeGreaterThan(entered);
    game.debugApplyEffect(A, { kind: "turn-face-up", target: 0 }, [ref(bears)]);
    expect(game.state.objects[bears].faceDown).toBeUndefined();
    expect(game.state.objects[bears].timestamp).toBeGreaterThan(down);
    expect(game.state.objects[bears].zoneChangeCount ?? 0).toBe(stint);
  });

  it("Levitation turned face up applies after a Gravity Sphere that entered while it was face down", () => {
    const { game } = table();
    const levitation = spawn(game, "Levitation");
    const bears = spawn(game, "Grizzly Bears");
    expect(keywords(game, bears).has("flying")).toBe(true);
    game.debugApplyEffect(A, { kind: "turn-face-down", target: 0 }, [ref(levitation)]);
    expect(keywords(game, bears).has("flying")).toBe(false);
    spawn(game, "Gravity Sphere");
    game.debugApplyEffect(A, { kind: "turn-face-up", target: 0 }, [ref(levitation)]);
    // Layer 6 in timestamp order: the Sphere's "lose flying", then
    // Levitation's "have flying", its timestamp the later one now.
    expect(keywords(game, bears).has("flying")).toBe(true);
  });
});
