/**
 * What a resolution phased out, read "this way" (`thisWay: "phased-out"`,
 * rule 702.26): Out of Time's "untap all creatures, then those creatures
 * phase out until this enchantment leaves the battlefield. Put a time counter
 * on this enchantment for each creature that phased out this way." — each
 * creature as it last was on the battlefield, a token stack as every token
 * in it, what phased out with them (702.26g) not a creature.
 */
import { describe, expect, it } from "vitest";

import type { Game } from "../game.js";
import type { ObjectId } from "../primitives.js";

import { A, B, enter, nextTurn, settle, spawn, table, toStep } from "./harness.js";

const timeCounters = (game: Game, id: ObjectId): number => game.state.objects[id].counters.time ?? 0;
const out = (game: Game, id: ObjectId): boolean => game.state.objects[id].zone === "phased-out";

describe("phased out this way", () => {
  it("Out of Time: every creature untaps and phases out, a time counter for each — not for the Equipment that went with one", () => {
    const { game } = table();
    const mine = spawn(game, "Grizzly Bears", A, { tapped: true });
    const theirs = spawn(game, "Grizzly Bears", B);
    const sword = spawn(game, "Bonesplitter", B);
    game.state.objects[sword].attachedTo = theirs;
    const land = spawn(game, "Forest", B);
    const enchantment = enter(game, "Out of Time");
    expect(out(game, mine)).toBe(true);
    expect(out(game, theirs)).toBe(true);
    expect(out(game, sword)).toBe(true);
    expect(out(game, land)).toBe(false);
    expect(game.state.objects[mine].tapped).toBe(false);
    expect(timeCounters(game, enchantment)).toBe(2);
  });

  it("counts each token of a stack", () => {
    const { game } = table();
    game.debugApplyEffect(B, { kind: "create-token", token: "Clown Robot Token", count: 3 });
    settle(game);
    spawn(game, "Grizzly Bears", A);
    const enchantment = enter(game, "Out of Time");
    expect(game.battlefield.filter((id) => game.state.objects[id].cardName === "Clown Robot Token")).toHaveLength(0);
    expect(timeCounters(game, enchantment)).toBe(4);
  });

  it("holds them through untap steps, and they phase in when vanishing takes it away", () => {
    const { game } = table();
    const mine = spawn(game, "Grizzly Bears", A);
    const theirs = spawn(game, "Grizzly Bears", B);
    const enchantment = enter(game, "Out of Time");
    expect(timeCounters(game, enchantment)).toBe(2);
    // B's turn: their Bears stay out through their untap step.
    nextTurn(game);
    expect(out(game, theirs)).toBe(true);
    // A's upkeep: one counter off.
    nextTurn(game);
    expect(timeCounters(game, enchantment)).toBe(1);
    expect(out(game, mine)).toBe(true);
    nextTurn(game);
    // A's next upkeep: the last one off, sacrificed, and everything returns.
    nextTurn(game);
    expect(game.state.objects[enchantment].zone).toBe("graveyard");
    expect(out(game, mine)).toBe(false);
    expect(out(game, theirs)).toBe(false);
    expect(game.battlefield).toContain(mine);
    expect(game.battlefield).toContain(theirs);
  });

  it("with no creatures it gets no counters and stays (its ruling)", () => {
    const { game } = table();
    const enchantment = enter(game, "Out of Time");
    expect(timeCounters(game, enchantment)).toBe(0);
    nextTurn(game);
    nextTurn(game);
    toStep(game, "precombat-main");
    expect(game.state.objects[enchantment].zone).toBe("battlefield");
  });
});
