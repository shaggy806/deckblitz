/**
 * "Target activated ability with a single target" (Reroute): the `ability`
 * target spec's `singleTarget` — an activated ability with exactly one target
 * chosen as it went on the stack (rule 115.9a), never a triggered ability or
 * one with two targets — and its target changed to another legal one (rule
 * 115.7a).
 */
import { describe, expect, it } from "vitest";

import type { Game } from "../game.js";
import type { ObjectId } from "../primitives.js";
import { A, B, C, activate, cast, hand, lands, life, loyalty, ref, spawn, table, toHand, watchTargets } from "./harness.js";

const abilityOnStack = (game: Game): ObjectId => {
  const id = game.state.zones.shared.stack.find((s) => game.state.objects[s].kind === "ability");
  if (id === undefined) throw new Error("no ability on the stack");
  return id;
};

describe("Reroute", () => {
  it("changes the target of an activated ability with a single target, then draws", () => {
    const { game, a } = table({ players: 3 });
    lands(game, "Mountain", 2);
    const sorcerer = spawn(game, "Prodigal Sorcerer");
    const reroute = toHand(game, "Reroute");
    activate(game, sorcerer, 0, { targets: [ref(B)], settle: false });
    const ability = abilityOnStack(game);
    const before = hand(game).length;
    const seen = watchTargets(a, () => [C]);
    cast(game, reroute, { targets: [ref(ability)] });
    expect(seen.asked).toBe(1);
    expect(seen.offered[0]).not.toContain(B);
    expect(life(game, C)).toBe(19);
    expect(life(game, B)).toBe(20);
    // Reroute left the hand; the card drawn came in.
    expect(hand(game).length).toBe(before);
  });

  it("isn't aimed at an activated ability with two targets", () => {
    const { game } = table();
    lands(game, "Mountain", 2);
    const domri = spawn(game, "Domri Rade");
    const mine = spawn(game, "Grizzly Bears");
    const theirs = spawn(game, "Grizzly Bears", B);
    const reroute = toHand(game, "Reroute");
    loyalty(game, domri, -2, { targets: [ref(mine), ref(theirs)], settle: false });
    const fight = abilityOnStack(game);
    expect(game.canDispatch({ type: "cast-spell", player: A, card: reroute, targets: [ref(fight)] })).toMatch(/target/i);
  });
});
