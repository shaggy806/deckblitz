/**
 * A permanent's play permission that every player holds (`StaticPlay`'s
 * `eachPlayer`), and a trigger on a play made under it (`plays-card`'s
 * `underThis`, read from the `spell-cast` / `land-played` events'
 * `permission`) — the need key `zone:shared-impulse-pool-each-player`. Share
 * the Spoils: "When this enchantment enters and whenever an opponent loses the
 * game, exile the top card of each player's library. During each player's
 * turn, that player may play a land or cast a spell from among cards exiled
 * with this enchantment, and they may spend mana as though it were mana of any
 * color to cast that spell. When they do, exile the top card of their library."
 */
import { describe, expect, it } from "vitest";

import type { Game } from "../game.js";
import type { ObjectId, PlayerId } from "../primitives.js";
import { A, B, C, cast, enter, lands, life, ref, settle, table, toLibrary, toStep, zone } from "./harness.js";

const castable = (game: Game, player: PlayerId, card: ObjectId): boolean =>
  game.legalActions(player).some((a) => a.kind === "cast-spell" && a.card === card);
const playable = (game: Game, player: PlayerId, card: ObjectId): boolean =>
  game.legalActions(player).some((a) => a.kind === "play-land" && a.card === card);
const linkedTo = (game: Game, source: ObjectId): ObjectId[] =>
  game.state.zones.shared.exile.filter((id) => game.state.objects[id].exiledWith?.source === source);

describe("Share the Spoils", () => {
  it("each player, on their own turn, one play a turn from the pool, any color; each play exiles that player's top card", () => {
    const { game } = table();
    lands(game, "Mountain", 2);
    lands(game, "Forest", 1, B);
    const bolt = toLibrary(game, "Lightning Bolt", A);
    const bears = toLibrary(game, "Grizzly Bears", B);
    const spoils = enter(game, "Share the Spoils");
    expect(zone(game, bolt)).toBe("exile");
    expect(zone(game, bears)).toBe("exile");
    expect(linkedTo(game, spoils)).toHaveLength(2);

    // Not bob's turn: nothing for him, not even an instant.
    expect(castable(game, B, bolt)).toBe(false);
    // Alice casts bob's Grizzly Bears with two Mountains (any color).
    expect(castable(game, A, bears)).toBe(true);
    const aliceTop = game.state.zones.perPlayer[A].library[0];
    cast(game, bears, { via: "impulse" });
    expect(zone(game, bears)).toBe("battlefield");
    expect(game.state.objects[bears].controller).toBe(A);
    // When she did, her top card was exiled with it.
    expect(game.state.objects[aliceTop].zone).toBe("exile");
    expect(linkedTo(game, spoils)).toEqual(expect.arrayContaining([bolt, aliceTop]));
    // One play a turn.
    lands(game, "Mountain", 1);
    expect(castable(game, A, bolt)).toBe(false);

    // Bob's turn: he casts the Bolt with his Forest; his top card follows.
    toStep(game, "precombat-main", B);
    expect(castable(game, B, bolt)).toBe(true);
    const bobTop = game.state.zones.perPlayer[B].library[0];
    cast(game, bolt, { player: B, via: "impulse", targets: [ref(A)] });
    expect(life(game, A)).toBe(17);
    expect(game.state.objects[bobTop].zone).toBe("exile");
    expect(linkedTo(game, spoils)).toContain(bobTop);
  });

  it("a land from the pool is played by whoever's turn it is, and fires the trigger too", () => {
    const { game } = table();
    const forest = toLibrary(game, "Forest", B);
    const spoils = enter(game, "Share the Spoils");
    expect(playable(game, A, forest)).toBe(true);
    const aliceTop = game.state.zones.perPlayer[A].library[0];
    game.dispatch({ type: "play-land", player: A, card: forest });
    settle(game);
    expect(game.state.objects[forest].controller).toBe(A);
    expect(game.state.objects[aliceTop].zone).toBe("exile");
    expect(linkedTo(game, spoils)).toContain(aliceTop);
  });

  it("a card cast some other way doesn't fire its trigger", () => {
    const { game } = table();
    lands(game, "Mountain", 1);
    enter(game, "Share the Spoils");
    const exiledBefore = game.state.zones.shared.exile.length;
    const top = game.state.zones.perPlayer[A].library[0];
    cast(game, game.debugSpawn("Lightning Bolt", A, "hand"), { targets: [ref(B)] });
    expect(game.state.objects[top].zone).toBe("library");
    expect(game.state.zones.shared.exile.length).toBe(exiledBefore);
  });

  it("whenever an opponent loses the game, the top card of each remaining library", () => {
    const { game } = table({ players: 3 });
    const spoils = enter(game, "Share the Spoils");
    expect(linkedTo(game, spoils)).toHaveLength(3);
    game.debugApplyEffect(C, { kind: "lose-life", amount: 30, who: "you" });
    // State-based actions (704.5a) as a player next gets priority.
    game.advanceUntil((s) => s.players[C].hasLost);
    settle(game);
    expect(game.state.players[C].hasLost).toBe(true);
    // Alice's and bob's tops; carol's cards left the game with her.
    expect(linkedTo(game, spoils).filter((id) => game.state.objects[id].owner !== C)).toHaveLength(4);
  });
});
