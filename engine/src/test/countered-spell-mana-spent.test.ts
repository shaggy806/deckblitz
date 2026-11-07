/**
 * "The amount of mana spent to cast that spell" for a spell target that has
 * left the stack since (the need key `stat:countered-spell-mana-spent`):
 * `{ manaSpentOf }` (and `{ colorsSpentOf }`) of a target that was a spell
 * when targeted reads it as it last existed on the stack (rule 608.2h) —
 * the mana spent is cleared as it leaves, so it read 0 before. Mana Sculpt's
 * delayed mana, read at your next main phase.
 */
import { describe, expect, it } from "vitest";

import { poolCounts } from "../mana.js";
import type { Game } from "../game.js";
import type { GameState } from "../state.js";
import { A, B, cast, life, ref, spawn, table, toHand, zone } from "./harness.js";

const colorless = (game: Game): number => poolCounts(game.state.players[A].manaPool).C;
const quiet = (s: GameState): boolean =>
  s.zones.shared.stack.length === 0 && s.awaiting === null && s.pendingTriggers.length === 0;
const toPostcombatMain = (game: Game): void =>
  game.advanceUntil((s) => s.turn.step === "postcombat-main" && quiet(s));

const lands = (game: Game, names: readonly string[]): void => {
  for (const name of names) spawn(game, name);
};

describe("Mana Sculpt", () => {
  it("with a Wizard, adds {C} equal to the mana spent on the countered spell, X included", () => {
    const { game } = table();
    spawn(game, "Prodigal Sorcerer");
    lands(game, ["Mountain", "Mountain", "Mountain", "Mountain", "Island", "Island", "Island"]);
    const fireball = toHand(game, "Fireball");
    cast(game, fireball, { targets: [ref(B)], x: 3, settle: false });
    cast(game, toHand(game, "Mana Sculpt"), { targets: [ref(fireball)] });
    expect(zone(game, fireball)).toBe("graveyard");
    expect(life(game, B)).toBe(20);
    // Cast in alice's precombat main: her next main phase is this turn's
    // postcombat main.
    toPostcombatMain(game);
    expect(game.state.turn.number).toBe(1);
    expect(colorless(game)).toBe(4);
  });

  it("reads the mana spent, not the mana value: a kicked Burst Lightning is 5", () => {
    const { game } = table();
    spawn(game, "Prodigal Sorcerer");
    lands(game, ["Mountain", "Mountain", "Mountain", "Mountain", "Mountain", "Island", "Island", "Island"]);
    const burst = toHand(game, "Burst Lightning");
    cast(game, burst, { targets: [ref(B)], kicked: true, settle: false });
    cast(game, toHand(game, "Mana Sculpt"), { targets: [ref(burst)] });
    expect(life(game, B)).toBe(20);
    toPostcombatMain(game);
    expect(colorless(game)).toBe(5);
  });

  it("without a Wizard as it resolves, counters and adds nothing", () => {
    const { game } = table();
    lands(game, ["Forest", "Forest", "Island", "Island", "Island"]);
    const bears = toHand(game, "Grizzly Bears");
    cast(game, bears, { settle: false });
    cast(game, toHand(game, "Mana Sculpt"), { targets: [ref(bears)] });
    expect(zone(game, bears)).toBe("graveyard");
    toPostcombatMain(game);
    expect(colorless(game)).toBe(0);
  });

  it("a spell that can't be countered still pays out (the ruling)", () => {
    const { game } = table();
    spawn(game, "Prodigal Sorcerer");
    lands(game, ["Forest", "Forest", "Forest", "Forest", "Forest", "Forest", "Island", "Island", "Island"]);
    const tyrant = toHand(game, "Carnage Tyrant");
    cast(game, tyrant, { settle: false });
    cast(game, toHand(game, "Mana Sculpt"), { targets: [ref(tyrant)] });
    expect(zone(game, tyrant)).toBe("battlefield");
    toPostcombatMain(game);
    expect(colorless(game)).toBe(6);
  });
});
