/**
 * What an unattach cost took the Equipment off (`{ paid: "unattached-from" }`,
 * rule 701.3d), kept as that permanent was as it was unattached — Shuriken's
 * "That creature's controller gains control of Shuriken unless it was
 * unattached from a Ninja", an `object-matches` over it.
 */
import { describe, expect, it } from "vitest";

import type { LegalAction } from "../actions.js";
import type { Game } from "../game.js";
import type { ObjectId } from "../primitives.js";
import { A, B, activate, controller, ref, spawn, table } from "./harness.js";

type Offer = Extract<LegalAction, { kind: "activate-ability" }>;
const grantedIndex = (game: Game, source: ObjectId): number => {
  const offers = game.legalActions(A).filter((x): x is Offer => x.kind === "activate-ability" && x.source === source);
  expect(offers).toHaveLength(1);
  return offers[0].abilityIndex;
};

function equipped(holder: string) {
  const { game } = table();
  const creature = spawn(game, holder);
  const shuriken = spawn(game, "Shuriken");
  game.state.objects[shuriken].attachedTo = creature;
  const giant = spawn(game, "Hill Giant", B);
  return { game, creature, shuriken, giant };
}

describe("Shuriken", () => {
  it("unattached from a non-Ninja: 2 damage, and the target's controller gains control of it", () => {
    const { game, creature, shuriken, giant } = equipped("Grizzly Bears");
    activate(game, creature, grantedIndex(game, creature), { targets: [ref(giant)] });
    expect(game.state.objects[giant].damageMarked).toBe(2);
    expect(game.state.objects[shuriken].attachedTo).toBeNull();
    expect(controller(game, shuriken)).toBe(B);
  });

  it("unattached from a Ninja: you keep it", () => {
    const { game, creature, shuriken, giant } = equipped("Ninja of the Deep Hours");
    activate(game, creature, grantedIndex(game, creature), { targets: [ref(giant)] });
    expect(game.state.objects[giant].damageMarked).toBe(2);
    expect(controller(game, shuriken)).toBe(A);
  });

  it("reads the creature as it was unattached, though it stops being a Ninja in response", () => {
    const { game, creature, shuriken, giant } = equipped("Ninja of the Deep Hours");
    activate(game, creature, grantedIndex(game, creature), { targets: [ref(giant)], settle: false });
    // Before it resolves, the Ninja becomes a plain Frog.
    game.debugApplyEffect(
      A,
      { kind: "become", target: 0, setSubtypes: ["Frog"], duration: "end-of-turn" },
      [ref(creature)],
    );
    game.dispatch({ type: "pass-priority", player: A });
    game.dispatch({ type: "pass-priority", player: B });
    expect(game.state.objects[giant].damageMarked).toBe(2);
    expect(controller(game, shuriken)).toBe(A);
  });

  it("aimed at your own creature, it stays yours", () => {
    const { game, creature, shuriken } = equipped("Grizzly Bears");
    const mine = spawn(game, "Hill Giant");
    activate(game, creature, grantedIndex(game, creature), { targets: [ref(mine)] });
    expect(game.state.objects[mine].damageMarked).toBe(2);
    expect(controller(game, shuriken)).toBe(A);
  });
});
