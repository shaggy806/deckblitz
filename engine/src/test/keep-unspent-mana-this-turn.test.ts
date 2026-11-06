/**
 * "Until end of turn, you don't lose unspent red mana as steps and phases
 * end" (The Last Agni Kai): a `player-effect`'s `keepsUnspentMana`, read by
 * `Game.keptManaTypes` beside the `keepsUnspentMana` statics. All the
 * controller's red mana stays through the turn's steps, whenever it was made;
 * the rest empties as usual, and the red goes too once the turn is over
 * (rule 500.5). With the fight's excess damage to the opponent's creature
 * added as {R} (rule 120.4a).
 */
import { describe, expect, it } from "vitest";
import type { Game } from "../game.js";
import type { PlayerId } from "../primitives.js";
import { A, B, cast, lands, nextTurn, ref, spawn, table, toHand, toStep, zone } from "./harness.js";

const pool = (game: Game, player: PlayerId = A): string[] => game.state.players[player].manaPool.map((u) => u.type);

describe("The Last Agni Kai", () => {
  it("adds the excess as {R}, keeps every red mana through the turn's steps but not the rest, and empties at the turn's end", () => {
    const { game } = table();
    lands(game, "Mountain", 2);
    const dreadmaw = spawn(game, "Colossal Dreadmaw");
    const bears = spawn(game, "Grizzly Bears", B);
    cast(game, toHand(game, "The Last Agni Kai"), { targets: [ref(dreadmaw), ref(bears)] });
    expect(zone(game, bears)).toBe("graveyard");
    // 6 damage to a 2/2: 4 past lethal.
    expect(pool(game)).toEqual(["R", "R", "R", "R"]);
    // Red made before or after it stays too; green doesn't.
    game.state.players[A].manaPool = [...game.state.players[A].manaPool, { type: "R" }, { type: "G" }];
    toStep(game, "postcombat-main");
    expect(pool(game)).toEqual(["R", "R", "R", "R", "R"]);
    nextTurn(game);
    expect(pool(game)).toEqual([]);
  });

  it("deathtouch makes anything past 1 excess (the ruling)", () => {
    const { game } = table();
    lands(game, "Mountain", 2);
    const nighthawk = spawn(game, "Vampire Nighthawk");
    const giant = spawn(game, "Hill Giant", B);
    cast(game, toHand(game, "The Last Agni Kai"), { targets: [ref(nighthawk), ref(giant)] });
    expect(zone(game, giant)).toBe("graveyard");
    expect(pool(game)).toEqual(["R"]);
  });

  it("with no excess, adds nothing, and still keeps red mana; an opponent's isn't kept", () => {
    const { game } = table();
    lands(game, "Mountain", 2);
    const bears = spawn(game, "Grizzly Bears");
    const giant = spawn(game, "Hill Giant", B);
    cast(game, toHand(game, "The Last Agni Kai"), { targets: [ref(bears), ref(giant)] });
    expect(zone(game, giant)).toBe("battlefield");
    expect(pool(game)).toEqual([]);
    game.state.players[A].manaPool = [{ type: "R" }];
    game.state.players[B].manaPool = [{ type: "R" }];
    toStep(game, "postcombat-main");
    expect(pool(game)).toEqual(["R"]);
    expect(pool(game, B)).toEqual([]);
  });
});
