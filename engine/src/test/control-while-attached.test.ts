import { describe, expect, it } from "vitest";

import { A, B, cast, controller, lands, ref, settle, spawn, table, toHand, zone } from "./harness.js";

// Control "for as long as that Aura is attached to it" — `gain-control`'s
// `whileAttached`, a `WhileSource` of the Aura with `attachedTo` (rule
// 611.2b) — and a `becomes-attached` trigger whose object is the Aura
// (`object: "attachment"`), what it became attached to the recipient:
// Eriette, the Beguiler.

describe("Eriette, the Beguiler", () => {
  it("an Aura you cast onto an opponent's nonland permanent of no greater mana value takes it, while it stays attached", () => {
    const { game } = table();
    spawn(game, "Eriette, the Beguiler");
    lands(game, "Plains", 2);
    const bears = spawn(game, "Grizzly Bears", B);
    const pacifism = toHand(game, "Pacifism");
    cast(game, pacifism, { targets: [ref(bears)] });
    expect(game.state.objects[pacifism].attachedTo).toBe(bears);
    expect(controller(game, bears)).toBe(A);
    game.debugMove(pacifism, "graveyard");
    settle(game);
    expect(controller(game, bears)).toBe(B);
  });

  it("takes nothing of greater mana value, nor a land", () => {
    const { game } = table();
    spawn(game, "Eriette, the Beguiler");
    lands(game, "Plains", 2);
    lands(game, "Forest", 1);
    const giant = spawn(game, "Hill Giant", B);
    const forest = spawn(game, "Forest", B);
    const pacifism = toHand(game, "Pacifism");
    cast(game, pacifism, { targets: [ref(giant)] });
    expect(controller(game, giant)).toBe(B);
    const growth = toHand(game, "Wild Growth");
    cast(game, growth, { targets: [ref(forest)] });
    expect(game.state.objects[growth].attachedTo).toBe(forest);
    expect(controller(game, forest)).toBe(B);
  });

  it("ends as the Aura moves to another permanent, which it takes in turn", () => {
    const { game } = table();
    spawn(game, "Eriette, the Beguiler");
    lands(game, "Plains", 2);
    const bears = spawn(game, "Grizzly Bears", B);
    const other = spawn(game, "Grizzly Bears", B);
    const pacifism = toHand(game, "Pacifism");
    cast(game, pacifism, { targets: [ref(bears)] });
    expect(controller(game, bears)).toBe(A);
    game.debugApplyEffect(A, { kind: "attach", attachment: 0, target: 1 }, [ref(pacifism), ref(other)]);
    settle(game);
    expect(game.state.objects[pacifism].attachedTo).toBe(other);
    expect(controller(game, bears)).toBe(B);
    expect(controller(game, other)).toBe(A);
  });

  it("takes nothing once the Aura has come off before the ability resolves (the ruling)", () => {
    const { game } = table();
    spawn(game, "Eriette, the Beguiler");
    lands(game, "Plains", 2);
    const bears = spawn(game, "Grizzly Bears", B);
    const pacifism = toHand(game, "Pacifism");
    cast(game, pacifism, { targets: [ref(bears)], settle: false });
    // Pacifism resolves; Eriette's trigger waits on the stack.
    game.advanceUntil((s) => s.zones.shared.stack.length === 1 && s.pendingTriggers.length === 0 && zone(game, pacifism) === "battlefield");
    expect(game.state.zones.shared.stack.length).toBe(1);
    game.debugMove(pacifism, "exile");
    settle(game);
    expect(controller(game, bears)).toBe(B);
  });

  it("takes nothing once the Aura has moved to another permanent before the ability resolves (rule 611.2b)", () => {
    const { game } = table();
    spawn(game, "Eriette, the Beguiler");
    const mine = spawn(game, "Grizzly Bears");
    lands(game, "Plains", 2);
    const bears = spawn(game, "Grizzly Bears", B);
    const pacifism = toHand(game, "Pacifism");
    cast(game, pacifism, { targets: [ref(bears)], settle: false });
    game.advanceUntil((s) => s.zones.shared.stack.length === 1 && s.pendingTriggers.length === 0 && zone(game, pacifism) === "battlefield");
    game.debugApplyEffect(A, { kind: "attach", attachment: 0, target: 1 }, [ref(pacifism), ref(mine)]);
    expect(game.state.objects[pacifism].attachedTo).toBe(mine);
    settle(game);
    expect(controller(game, bears)).toBe(B);
  });
});
