import { describe, expect, it } from "vitest";

import { A, B, attack, destroy, enter, life, settle, spawn, table, tokensNamed, zone } from "./harness.js";

// The `destroyed` trigger (rules 701.8, 603.10a) and Jaws, Relentless
// Predator: "Whenever a noncreature artifact is sacrificed or destroyed, Jaws
// deals 1 damage to each opponent."

describe("Jaws, Relentless Predator", () => {
  it("a destroyed noncreature artifact, anyone's, pings each opponent", () => {
    const { game } = table({ players: 3 });
    spawn(game, "Jaws, Relentless Predator");
    const ring = spawn(game, "Sol Ring", B);
    destroy(game, ring);
    expect(zone(game, ring)).toBe("graveyard");
    expect(life(game, A)).toBe(20);
    expect(life(game, B)).toBe(19);
    expect(life(game, game.state.turnOrder[2])).toBe(19);
  });

  it("a sacrificed one does too, once per artifact", () => {
    const { game } = table();
    spawn(game, "Jaws, Relentless Predator");
    spawn(game, "Sol Ring");
    spawn(game, "Mind Stone");
    game.debugApplyEffect(A, { kind: "sacrifice-all", who: "you", filter: { type: "artifact" } }, []);
    settle(game);
    expect(life(game, B)).toBe(18);
  });

  it("an artifact creature destroyed isn't a noncreature artifact", () => {
    const { game } = table();
    spawn(game, "Jaws, Relentless Predator");
    const thopter = spawn(game, "Ornithopter", B);
    destroy(game, thopter);
    expect(zone(game, thopter)).toBe("graveyard");
    expect(life(game, B)).toBe(20);
  });

  it("the legend rule puts an artifact into a graveyard without destroying it (701.8b)", () => {
    const { game } = table();
    spawn(game, "Jaws, Relentless Predator");
    spawn(game, "Mox Amber", B);
    enter(game, "Mox Amber", B);
    // State-based actions run at the next priority check, which settling
    // skips when nothing else is pending.
    (game as unknown as { prepareForPriority(p: typeof A): void }).prepareForPriority(A);
    settle(game);
    expect(game.battlefield.filter((id) => game.state.objects[id].cardName === "Mox Amber")).toHaveLength(1);
    expect(life(game, B)).toBe(20);
  });

  it("an indestructible artifact isn't destroyed", () => {
    const { game } = table();
    spawn(game, "Jaws, Relentless Predator");
    const forge = spawn(game, "Darksteel Ingot", B);
    destroy(game, forge);
    expect(zone(game, forge)).toBe("battlefield");
    expect(life(game, B)).toBe(20);
  });

  it("destroyed alongside the artifacts, it still sees them (603.10a)", () => {
    const { game } = table();
    const jaws = spawn(game, "Jaws, Relentless Predator");
    spawn(game, "Sol Ring", B);
    spawn(game, "Mind Stone", B);
    game.debugApplyEffect(B, { kind: "destroy-all", filter: { anyOf: [{ type: "artifact" }, { type: "creature" }] } }, []);
    settle(game);
    expect(zone(game, jaws)).toBe("graveyard");
    expect(life(game, B)).toBe(18);
  });

  it("combat damage to a player makes that many Blood tokens", () => {
    const { game, a } = table();
    const jaws = spawn(game, "Jaws, Relentless Predator");
    attack(game, a, [jaws]);
    expect(life(game, B)).toBe(15);
    expect(tokensNamed(game, "Blood Token", A)).toBe(5);
  });
});
