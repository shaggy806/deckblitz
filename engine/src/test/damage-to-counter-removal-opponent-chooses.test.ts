/**
 * Soul Echo: at your upkeep, a target opponent may choose that each 1 damage
 * that would be dealt to you until your next upkeep removes an echo counter
 * from it instead (rule 614.1a) — still replacing it once none are left (the
 * ruling) — and with no counters, it's sacrificed. You don't lose for 0 life.
 */
import { describe, expect, it } from "vitest";

import type { Game } from "../game.js";
import type { ObjectId } from "../primitives.js";
import { A, B, cast, lands, life, named, nextTurn, pickModes, ref, spawn, table, toHand, toStep, zone } from "./harness.js";

const hitYou = (game: Game, source: ObjectId, amount: number): void => {
  game.debugApplyEffect(B, { kind: "damage", amount, target: 0 }, [ref(A)], { source });
};
const echoes = (game: Game, id: ObjectId): number => game.state.objects[id].counters.echo ?? 0;
const soulEcho = (game: Game): ObjectId => {
  const found = named(game, "Soul Echo", A).find((id) => zone(game, id) === "battlefield");
  if (found === undefined) throw new Error("no Soul Echo");
  return found;
};
/** To Alice's next upkeep, its trigger resolved. */
const toYourUpkeep = (game: Game): void => {
  nextTurn(game);
  toStep(game, "draw");
};

describe("Soul Echo", () => {
  it("enters with X echo counters; after the opponent's yes, damage to you removes counters instead", () => {
    const { game, b } = table();
    lands(game, "Plains", 5);
    cast(game, toHand(game, "Soul Echo"), { x: 3 });
    const echo = soulEcho(game);
    expect(echoes(game, echo)).toBe(3);
    const goblin = spawn(game, "Raging Goblin", B);
    pickModes(b, 0);
    toYourUpkeep(game);
    hitYou(game, goblin, 2);
    expect(life(game, A)).toBe(20);
    expect(echoes(game, echo)).toBe(1);
    // More than is left: all of it is still replaced.
    hitYou(game, goblin, 4);
    expect(life(game, A)).toBe(20);
    expect(echoes(game, echo)).toBe(0);
    // At the next upkeep, none left: it's sacrificed, and damage hits again.
    toYourUpkeep(game);
    expect(zone(game, echo)).toBe("graveyard");
    hitYou(game, goblin, 2);
    expect(life(game, A)).toBe(18);
  });

  it("the opponent's no leaves damage as it is, and you don't lose at 0 life", () => {
    const { game, b } = table();
    lands(game, "Plains", 3);
    cast(game, toHand(game, "Soul Echo"), { x: 1 });
    const echo = soulEcho(game);
    const goblin = spawn(game, "Raging Goblin", B);
    pickModes(b);
    toYourUpkeep(game);
    hitYou(game, goblin, 25);
    expect(life(game, A)).toBe(-5);
    expect(echoes(game, echo)).toBe(1);
    expect(game.state.players[A].hasLost ?? false).toBe(false);
  });

  it("the replacement ends as your next upkeep begins", () => {
    const { game, b } = table();
    lands(game, "Plains", 7);
    cast(game, toHand(game, "Soul Echo"), { x: 5 });
    const echo = soulEcho(game);
    const goblin = spawn(game, "Raging Goblin", B);
    pickModes(b, 0);
    toYourUpkeep(game);
    // Next upkeep: Bob says no this time.
    pickModes(b);
    toYourUpkeep(game);
    hitYou(game, goblin, 2);
    expect(life(game, A)).toBe(18);
    expect(echoes(game, echo)).toBe(5);
  });
});
