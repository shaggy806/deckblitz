/**
 * "Other players can't gain control of them" (the `gain-control` prohibition)
 * and "can't be enchanted … this effect doesn't remove Auras already
 * attached" (`be-attached`'s `keepsAttached`) — Guardian Beast.
 */

import { describe, expect, it } from "vitest";

import { A, B, cast, controller, destroy, keywords, ref, settle, spawn, table, toHand } from "./harness.js";

describe("Guardian Beast", () => {
  it("while untapped, other players can't gain control of your noncreature artifacts", () => {
    const { game } = table();
    spawn(game, "Guardian Beast", A);
    const ring = spawn(game, "Sol Ring", A);
    game.debugApplyEffect(B, { kind: "gain-control", target: 0, untilEndOfTurn: false }, [ref(ring)]);
    expect(controller(game, ring)).toBe(A);
  });

  it("once tapped, control can be gained", () => {
    const { game } = table();
    const beast = spawn(game, "Guardian Beast", A);
    const ring = spawn(game, "Sol Ring", A);
    game.debugApplyEffect(A, { kind: "tap", target: 0 }, [ref(beast)]);
    game.debugApplyEffect(B, { kind: "gain-control", target: 0, untilEndOfTurn: false }, [ref(ring)]);
    expect(controller(game, ring)).toBe(B);
  });

  it("an exchange including one doesn't happen at all (701.12a)", () => {
    const { game } = table();
    spawn(game, "Guardian Beast", A);
    const ring = spawn(game, "Sol Ring", A);
    const stone = spawn(game, "Mind Stone", B);
    game.debugApplyEffect(B, { kind: "exchange-control", objects: [0, 1] }, [ref(ring), ref(stone)]);
    expect(controller(game, ring)).toBe(A);
    expect(controller(game, stone)).toBe(B);
  });

  it("their indestructible, not an artifact creature's, and not an opponent's", () => {
    const { game } = table();
    spawn(game, "Guardian Beast", A);
    const ring = spawn(game, "Sol Ring", A);
    const theirs = spawn(game, "Mind Stone", B);
    const golem = spawn(game, "Ornithopter", A);
    expect(keywords(game, ring).has("indestructible")).toBe(true);
    expect(keywords(game, theirs).has("indestructible")).toBe(false);
    expect(keywords(game, golem).has("indestructible")).toBe(false);
    destroy(game, ring);
    settle(game);
    expect(game.state.objects[ring].zone).toBe("battlefield");
  });

  it("they can't be enchanted while it's untapped", () => {
    const { game } = table();
    spawn(game, "Guardian Beast", A);
    const ring = spawn(game, "Sol Ring", A);
    spawn(game, "Island", A);
    spawn(game, "Island", A);
    const aura = toHand(game, "Power Artifact");
    cast(game, aura, { targets: [ref(ring)] });
    expect(game.state.objects[aura].attachedTo ?? null).toBe(null);
    expect(game.state.objects[aura].zone).toBe("graveyard");
  });

  it("an Aura already attached stays when it untaps", () => {
    const { game } = table();
    const beast = spawn(game, "Guardian Beast", A, { tapped: true });
    const ring = spawn(game, "Sol Ring", A);
    spawn(game, "Island", A);
    spawn(game, "Island", A);
    const aura = toHand(game, "Power Artifact");
    cast(game, aura, { targets: [ref(ring)] });
    expect(game.state.objects[aura].attachedTo).toBe(ring);
    game.debugApplyEffect(A, { kind: "untap", target: 0 }, [ref(beast)]);
    settle(game);
    // A state-based check runs as priority passes.
    spawn(game, "Forest", A);
    cast(game, toHand(game, "Giant Growth"), { targets: [ref(beast)], settle: true });
    expect(game.state.objects[aura].zone).toBe("battlefield");
    expect(game.state.objects[aura].attachedTo).toBe(ring);
  });
});
