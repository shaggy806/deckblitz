/**
 * B338, combat-targeting lane: Artificer's Hex — "at the beginning of your
 * upkeep, if enchanted Equipment is attached to a creature, destroy that
 * creature", checked as the upkeep begins and on resolution (603.4), the
 * creature destroyed being whatever the Equipment is attached to then (the
 * ruling).
 */
import { describe, expect, it } from "vitest";

import type { Game } from "../game.js";
import type { ObjectId } from "../primitives.js";
import { A, B, nextTurn, ref, settle, spawn, table, zone } from "./harness.js";

function attach(game: Game, attachment: ObjectId, host: ObjectId): void {
  game.debugApplyEffect(A, { kind: "attach", attachment: 0, target: 1 }, [ref(attachment), ref(host)]);
  expect(game.state.objects[attachment].attachedTo).toBe(host);
}

/** Bob's Bears equipped with his Bonesplitter, which Alice's Hex enchants. */
function board(): { game: Game; bears: ObjectId; sword: ObjectId; hex: ObjectId } {
  const { game } = table();
  const bears = spawn(game, "Grizzly Bears", B);
  const sword = spawn(game, "Bonesplitter", B);
  attach(game, sword, bears);
  const hex = spawn(game, "Artificer's Hex");
  attach(game, hex, sword);
  return { game, bears, sword, hex };
}

describe("Artificer's Hex", () => {
  it("destroys the creature the enchanted Equipment is attached to at its controller's upkeep", () => {
    const { game, bears, sword, hex } = board();
    nextTurn(game);
    // Bob's upkeep: not the Hex controller's.
    expect(zone(game, bears)).toBe("battlefield");
    nextTurn(game);
    expect(zone(game, bears)).toBe("graveyard");
    expect(zone(game, sword)).toBe("battlefield");
    expect(zone(game, hex)).toBe("battlefield");
  });

  it("destroys the creature the Equipment is attached to as it resolves, not as it triggered", () => {
    const { game, bears, sword } = board();
    const elf = spawn(game, "Llanowar Elves", B);
    nextTurn(game);
    game.advanceUntil((s) => s.turn.step === "upkeep" && s.zones.shared.stack.length > 0);
    attach(game, sword, elf);
    settle(game);
    expect(zone(game, bears)).toBe("battlefield");
    expect(zone(game, elf)).toBe("graveyard");
  });

  it("does nothing if the Equipment was unattached before it resolves", () => {
    const { game, bears, sword } = board();
    nextTurn(game);
    game.advanceUntil((s) => s.turn.step === "upkeep" && s.zones.shared.stack.length > 0);
    game.debugApplyEffect(B, { kind: "unattach", target: 0 }, [ref(sword)]);
    expect(game.state.objects[sword].attachedTo).toBeNull();
    settle(game);
    expect(zone(game, bears)).toBe("battlefield");
  });

  it("doesn't trigger while the Equipment is unattached", () => {
    const { game } = table();
    const bears = spawn(game, "Grizzly Bears", B);
    const sword = spawn(game, "Bonesplitter", B);
    const hex = spawn(game, "Artificer's Hex");
    attach(game, hex, sword);
    nextTurn(game);
    game.advanceUntil((s) => s.turn.step === "draw");
    expect(game.state.zones.shared.stack).toHaveLength(0);
    nextTurn(game);
    expect(zone(game, bears)).toBe("battlefield");
  });
});
