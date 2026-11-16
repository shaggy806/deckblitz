/**
 * "Whenever a spell or ability is put onto the stack" — the `put-on-stack`
 * row of `TRIGGER_EVENTS`, one trigger event over the engine's cast,
 * activation, trigger and copy events (rules 405.1, 707.10), its subject the
 * spell or ability. Grip of Chaos: "… if it has a single target (115.9a),
 * reselect its target at random" — `change-targets`' `"random"` on the
 * trigger object, drawn as it resolves from every legal target, the current
 * one included; with none other, it keeps its target (the rulings).
 */
import { describe, expect, it } from "vitest";

import type { Game } from "../game.js";
import type { ObjectId } from "../primitives.js";
import { A, B, activate, cast, lands, life, pickTargets, pt, ref, settle, spawn, table, toHand } from "./harness.js";

/** The Grip of Chaos triggers that have gone on the stack so far. */
const gripFired = (game: Game, grip: ObjectId): number =>
  game.eventsOfType("ability-triggered").filter((e) => e.source === grip).length;

/** The Grip triggers on the stack now, with the object each is about. */
const gripOnStack = (game: Game, grip: ObjectId): (ObjectId | undefined)[] =>
  game.state.zones.shared.stack
    .map((id) => game.state.objects[id])
    .filter((o) => o.kind === "ability" && o.sourceObjectId === grip)
    .map((o) => o.triggerObject);

describe("Grip of Chaos — whenever a spell or ability is put onto the stack", () => {
  it("a spell with a single target: its target is drawn again from every legal one, anyone's spell", () => {
    const seen = new Set<string>();
    for (let seed = 1; seed <= 16; seed += 1) {
      const { game } = table({ seed });
      const grip = spawn(game, "Grip of Chaos", B);
      spawn(game, "Grizzly Bears", B);
      spawn(game, "Hill Giant", A);
      lands(game, "Mountain", 1);
      const shock = toHand(game, "Shock");
      cast(game, shock, { settle: false, targets: [ref(B)] });
      // On the stack above the Shock, about it; Shock still at Bob.
      expect(gripOnStack(game, grip)).toEqual([shock]);
      expect(game.state.objects[shock].targets?.[0]).toEqual(ref(B));
      settle(game);
      expect(gripFired(game, grip)).toBe(1);
      if (life(game, A) === 18) seen.add("alice");
      if (life(game, B) === 18) seen.add("bob");
      if (game.state.zones.perPlayer[B].graveyard.some((id) => game.state.objects[id].cardName === "Grizzly Bears")) seen.add("bears");
      const giant = game.state.zones.shared.battlefield.find((id) => game.state.objects[id].cardName === "Hill Giant");
      if (giant !== undefined && game.state.objects[giant].damageMarked === 2) seen.add("giant");
    }
    // Every legal target was drawn at some point, the original one included.
    expect(seen).toEqual(new Set(["alice", "bob", "bears", "giant"]));
  });

  it("not a spell with no target or with two", () => {
    const { game } = table();
    const grip = spawn(game, "Grip of Chaos", B);
    spawn(game, "Grizzly Bears", B);
    lands(game, "Island", 3);
    lands(game, "Mountain", 2);
    cast(game, toHand(game, "Divination"));
    const bears = game.state.zones.shared.battlefield.find((id) => game.state.objects[id].cardName === "Grizzly Bears")!;
    cast(game, toHand(game, "Arc Trail"), { settle: false, targets: [ref(bears), ref(B)] });
    expect(gripOnStack(game, grip)).toEqual([]);
    settle(game);
    expect(gripFired(game, grip)).toBe(0);
    expect(life(game, B)).toBe(19);
  });

  it("an activated ability with a single target; a mana ability never", () => {
    const { game } = table();
    const grip = spawn(game, "Grip of Chaos", B);
    const elves = spawn(game, "Llanowar Elves");
    activate(game, elves);
    expect(gripFired(game, grip)).toBe(0);
    const pyromancer = spawn(game, "Prodigal Pyromancer");
    activate(game, pyromancer, 0, { settle: false, targets: [ref(B)] });
    const ability = game.state.zones.shared.stack[0];
    expect(gripOnStack(game, grip)).toEqual([ability]);
    settle(game);
    // Its own trigger has no target, so it never triggers itself.
    expect(gripFired(game, grip)).toBe(1);
  });

  it("a triggered ability with a single target", () => {
    const { game, a } = table();
    const grip = spawn(game, "Grip of Chaos", B);
    const bears = spawn(game, "Grizzly Bears", B);
    lands(game, "Mountain", 4);
    pickTargets(a, bears);
    const kavu = toHand(game, "Flametongue Kavu");
    cast(game, kavu, { settle: false });
    // The creature spell has no target.
    expect(gripOnStack(game, grip)).toEqual([]);
    game.dispatch({ type: "pass-priority", player: A });
    game.dispatch({ type: "pass-priority", player: B });
    // Its enters trigger asks for its target (the seat's hook answers).
    expect(game.state.awaiting?.kind).toBe("choose-targets");
    game.advanceUntil((s) => s.awaiting === null);
    const kavuTrigger = game.state.zones.shared.stack.find((id) => game.state.objects[id].sourceObjectId === kavu);
    expect(kavuTrigger).toBeDefined();
    expect(gripOnStack(game, grip)).toEqual([kavuTrigger]);
    settle(game);
    expect(gripFired(game, grip)).toBe(1);
  });

  it("a copy put onto the stack", () => {
    const { game } = table();
    const grip = spawn(game, "Grip of Chaos", B);
    lands(game, "Mountain", 1);
    lands(game, "Island", 2);
    const shock = toHand(game, "Shock");
    cast(game, shock, { settle: false, targets: [ref(B)] });
    cast(game, toHand(game, "Twincast"), { settle: false, targets: [ref(shock)] });
    settle(game);
    // The Shock, the Twincast (its one target the Shock, the only spell it
    // could have) and the copy of the Shock.
    expect(gripFired(game, grip)).toBe(3);
    expect(game.eventsOfType("spell-copied")).toHaveLength(1);
  });

  it("with no other legal target, it keeps its target", () => {
    const { game } = table();
    spawn(game, "Grip of Chaos", B);
    const bears = spawn(game, "Grizzly Bears");
    lands(game, "Forest", 1);
    cast(game, toHand(game, "Giant Growth"), { targets: [ref(bears)] });
    expect(pt(game, bears)).toEqual({ power: 5, toughness: 5 });
  });
});
