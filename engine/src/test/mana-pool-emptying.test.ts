/**
 * What happens to unspent mana as a step or phase ends (rule 500.4): it
 * becomes another type instead (Horizon Stone's colorless, Omnath, Locus of
 * All's black — `unspentManaBecomes`), every player keeps it (Upwelling —
 * `keepsUnspentManaEachPlayer`), and losing it costs that much life
 * (Yurlok of Scorch Thrash — `manaLossCausesLifeLoss`).
 */

import { describe, expect, it } from "vitest";

import { defineCard } from "../cards/define.js";
import { createDefaultRegistry } from "../cards/registry.js";
import { ScriptedController } from "../controller.js";
import type { ManaType } from "../mana.js";
import { Game } from "../game.js";
import { A, B, activate, life, lands, spawn, table, toStep } from "./harness.js";

const pool = (game: Game, player = A): string =>
  game.state.players[player].manaPool
    .map((u) => u.type)
    .sort()
    .join("");
const add = (game: Game, mana: ManaType, amount: number, player = A): void =>
  game.debugApplyEffect(player, { kind: "add-mana", mana, amount });

describe("unspent mana becomes another type instead", () => {
  it("Horizon Stone: mana you'd lose stays, colorless; an opponent's empties", () => {
    const { game } = table();
    spawn(game, "Horizon Stone");
    add(game, "R", 2);
    add(game, "G", 1, B);
    toStep(game, "begin-combat");
    expect(pool(game)).toBe("CC");
    expect(pool(game, B)).toBe("");
  });

  it("a 'becomes black instead' static: every type but black turns black", () => {
    const OMNATH = "Test Black Locus";
    const registry = createDefaultRegistry().register(
      defineCard({
        name: OMNATH,
        manaCost: "{0}",
        types: ["enchantment"],
        text: "If you would lose unspent mana, that mana becomes black instead.",
        static: [{ affects: { scope: "self" }, unspentManaBecomes: "B", text: "If you would lose unspent mana, that mana becomes black instead." }],
      }),
    );
    const game = Game.create({
      seed: 1,
      shuffle: false,
      registry,
      rules: { skipFirstDraw: false, maxLandsPerTurn: 99, maxHandSize: 99 },
      controllers: { [A]: new ScriptedController(A), [B]: new ScriptedController(B) },
      decks: [
        { player: A, cards: Array<string>(40).fill("Island") },
        { player: B, cards: Array<string>(40).fill("Island") },
      ],
    });
    game.advanceUntil((s) => s.turn.number === 1 && s.turn.step === "precombat-main");
    game.debugSpawn(OMNATH, A, "battlefield");
    add(game, "R", 1);
    add(game, "C", 1);
    add(game, "B", 1);
    game.advanceUntil((s) => s.turn.step === "begin-combat");
    expect(pool(game)).toBe("BBB");
  });
});

describe("players keep unspent mana", () => {
  it("Upwelling: every player keeps every type, into later turns", () => {
    const { game } = table();
    spawn(game, "Upwelling");
    add(game, "R", 1);
    add(game, "C", 1);
    add(game, "U", 2, B);
    toStep(game, "begin-combat");
    expect(pool(game)).toBe("CR");
    expect(pool(game, B)).toBe("UU");
    toStep(game, "upkeep", B); // through alice's cleanup
    expect(pool(game)).toBe("CR");
    expect(pool(game, B)).toBe("UU");
  });
});

describe("losing unspent mana costs life", () => {
  it("Yurlok: each player adds {B}{R}{G} and loses 3 as it empties", () => {
    const { game } = table();
    const yurlok = spawn(game, "Yurlok of Scorch Thrash");
    lands(game, "Wastes", 1);
    activate(game, yurlok);
    expect(pool(game)).toBe("BGR");
    expect(pool(game, B)).toBe("BGR");
    toStep(game, "begin-combat");
    expect(life(game, A)).toBe(17);
    expect(life(game, B)).toBe(17);
  });

  it("Yurlok: no life lost for mana a replacement keeps", () => {
    const { game } = table();
    spawn(game, "Yurlok of Scorch Thrash");
    spawn(game, "Horizon Stone", B);
    add(game, "R", 2);
    add(game, "G", 2, B);
    toStep(game, "begin-combat");
    expect(life(game, A)).toBe(18);
    expect(life(game, B)).toBe(20);
    expect(pool(game, B)).toBe("CC");
  });
});
