/**
 * Ashling, Flame Dancer: no engine code, the keys it was filed under were built
 * as they came (`keepsUnspentMana`, magecraft's `orCopy`, `resolved-this-turn`).
 */

import { describe, expect, it } from "vitest";

import { A, B, cast, graveyard, hand, lands, life, spawn, table, toHand, toStep, zone } from "./harness.js";

type G = ReturnType<typeof table>["game"];
const pool = (game: G): string[] => game.state.players[A].manaPool.map((m) => m.type);
const atBob = [{ kind: "player" as const, player: B }];
const shock = (game: G): void => cast(game, toHand(game, "Shock"), { targets: atBob });

describe("Ashling, Flame Dancer", () => {
  it("keeps red mana through steps and turns, and no other", () => {
    const { game } = table();
    spawn(game, "Ashling, Flame Dancer", A);
    game.state.players[A].manaPool = [{ type: "R" }, { type: "G" }];
    toStep(game, "postcombat-main");
    expect(pool(game)).toEqual(["R"]);
    game.advanceUntil((s) => s.turn.number === 2);
    expect(pool(game)).toEqual(["R"]);
  });

  it("loots each time; its second resolution burns each opponent and their creatures, its third adds {R}{R}{R}{R}", () => {
    const { game } = table();
    const ashling = spawn(game, "Ashling, Flame Dancer", A);
    const mine = spawn(game, "Grizzly Bears", A);
    const theirs = spawn(game, "Grizzly Bears", B);
    lands(game, "Mountain", 4);

    const before = hand(game).length;
    const buried = graveyard(game).length;
    shock(game);
    // A card discarded and a card drawn; the Shock's gone too.
    expect(hand(game).length).toBe(before);
    expect(graveyard(game).length).toBe(buried + 2);
    expect(life(game, B)).toBe(18);
    expect(zone(game, theirs)).toBe("battlefield");
    expect(pool(game)).toEqual([]);

    shock(game);
    // 2 from the trigger, 2 from the Shock.
    expect(life(game, B)).toBe(14);
    expect(zone(game, theirs)).toBe("graveyard");
    expect(zone(game, mine)).toBe("battlefield");
    expect(game.state.objects[ashling].damageMarked).toBe(0);
    expect(life(game, A)).toBe(20);
    expect(pool(game)).toEqual([]);

    shock(game);
    expect(life(game, B)).toBe(12);
    expect(pool(game)).toEqual(["R", "R", "R", "R"]);

    // A fourth does neither.
    shock(game);
    expect(life(game, B)).toBe(10);
    expect(pool(game).length).toBeLessThanOrEqual(4);
  });

  it("triggers on a copy of a spell as well as on a cast", () => {
    const { game } = table();
    spawn(game, "Ashling, Flame Dancer", A);
    lands(game, "Mountain", 1);
    lands(game, "Island", 2);
    const first = toHand(game, "Shock");
    cast(game, first, { targets: atBob, settle: false });
    const twincast = toHand(game, "Twincast");
    cast(game, twincast, { targets: [{ kind: "object", object: first }] });
    // Three resolutions: the Shock's cast, the Twincast's, the copy. The second
    // burned Bob for 2; the Shock and its copy for 2 each.
    expect(life(game, B)).toBe(14);
    expect(pool(game)).toEqual(["R", "R", "R", "R"]);
  });
});
