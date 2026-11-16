/**
 * Poison in the bots' combat arithmetic (`bot/combat-math.ts`): infect and
 * toxic give counters, ten of which lose the game (rule 704.5c), whatever
 * the life total. Found watching the tooling precons (2026-11-16): a bot on
 * 199 life read sixteen toxic Mites as 15 damage and died on ten poison.
 */
import { describe, expect, it } from "vitest";
import { combatCreatures, crackback, damageThrough, isLethal, opponentsLethalAlone } from "../bot/combat-math.js";
import { A, B, spawn, table } from "./harness.js";

/** Alice on 40 life behind `blockers` Grizzly Bears; Bob with `chorus`
 * Crawling Choruses (1/1, toxic 1). */
function board(blockers: number, chorus: number) {
  const { game } = table({ players: 2 });
  for (let i = 0; i < blockers; i += 1) spawn(game, "Grizzly Bears");
  for (let i = 0; i < chorus; i += 1) spawn(game, "Crawling Chorus", B);
  const through = () =>
    damageThrough(combatCreatures(game.state, game.registry, B, false), combatCreatures(game.state, game.registry, A, true));
  return { game, through };
}

describe("poison in the combat arithmetic", () => {
  it("a toxic attacker gives its toxic value beside its damage", () => {
    const { game, through } = board(2, 12);
    // Two blocked; ten 1/1s through are 10 damage at 40 life, and ten poison.
    expect(through().damage).toBe(10);
    expect(through().poison).toBe(10);
    expect(isLethal(game.state, A, through())).toBe(true);
  });

  it("nine counters are not ten, and the ones a player has count", () => {
    const { game, through } = board(3, 12);
    expect(through().poison).toBe(9);
    expect(isLethal(game.state, A, through())).toBe(false);
    game.state.players[A].counters = { ...game.state.players[A].counters, poison: 1 };
    expect(isLethal(game.state, A, through())).toBe(true);
  });

  it("infect is poison in place of the life (rule 702.90b)", () => {
    const { game } = table({ players: 2 });
    game.state.players[A].life = 1;
    spawn(game, "Glistener Elf", B);
    const through = damageThrough(combatCreatures(game.state, game.registry, B, false), []);
    expect(through.damage).toBe(0);
    expect(through.poison).toBe(1);
    // One point from dead on life, and an infect 1/1 doesn't take it.
    expect(isLethal(game.state, A, through)).toBe(false);
    game.state.players[A].counters = { ...game.state.players[A].counters, poison: 9 };
    expect(isLethal(game.state, A, through)).toBe(true);
  });

  it("the poison count blocks against poison, the damage count against damage", () => {
    const { game } = table({ players: 2 });
    spawn(game, "Grizzly Bears");
    spawn(game, "Craw Wurm", B);
    for (let i = 0; i < 3; i += 1) spawn(game, "Crawling Chorus", B);
    const through = damageThrough(
      combatCreatures(game.state, game.registry, B, false),
      combatCreatures(game.state, game.registry, A, true),
    );
    // The one blocker stops the Wurm for damage (3 through), a Chorus for poison (2).
    expect(through.damage).toBe(3);
    expect(through.poison).toBe(2);
  });

  it("no poison, no field: a plain board reads as it always did", () => {
    const { game } = table({ players: 2 });
    spawn(game, "Craw Wurm", B);
    const through = damageThrough(combatCreatures(game.state, game.registry, B, false), []);
    expect(through).toEqual({ damage: 6, commanderDamage: new Map() });
  });

  it("the swing back is lethal on poison at any life total", () => {
    const { game } = board(2, 12);
    game.state.players[A].life = 199;
    const back = crackback(game.state, game.registry, A, 0.5, undefined, { weight: 1, margin: 2 });
    expect(back.poison).toBe(10);
    expect(isLethal(game.state, A, back, -2)).toBe(true);
    expect(opponentsLethalAlone(game.state, game.registry, A)).toEqual([B]);
    // With two more blockers home it is eight counters, and not.
    spawn(game, "Grizzly Bears");
    spawn(game, "Grizzly Bears");
    expect(opponentsLethalAlone(game.state, game.registry, A)).toEqual([]);
  });
});
