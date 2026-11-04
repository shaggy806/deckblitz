/**
 * "Each spell costs {3} more to cast except during its controller's turn"
 * (Defense Grid) — `costModification.exceptOnCastersTurn`.
 */
import { describe, expect, it } from "vitest";

import { A, B, C, cast, lands, ref, spawn, table, toHand, zone } from "./harness.js";
import type { Game } from "../game.js";
import type { ObjectId, PlayerId } from "../primitives.js";

const shockAt = (game: Game, card: ObjectId, player: PlayerId, target: PlayerId): string | null =>
  game.canDispatch({ type: "cast-spell", player, card, targets: [ref(target)] });

const tappedLands = (game: Game, ids: readonly ObjectId[]): number => ids.filter((id) => game.state.objects[id].tapped).length;

/** Alice's main phase, with nothing on the stack: she passes, and so on round
 * to `player`, who may cast an instant on her turn. */
function priorityTo(game: Game, ...passing: readonly PlayerId[]): void {
  for (const player of passing) game.dispatch({ type: "pass-priority", player });
}

describe("Defense Grid", () => {
  it("adds nothing during its caster's own turn, whoever controls the Grid", () => {
    const { game } = table();
    spawn(game, "Defense Grid", B);
    const mountains = lands(game, "Mountain", 1);
    const shock = toHand(game, "Shock");
    cast(game, shock, { targets: [ref(B)] });
    expect(tappedLands(game, mountains)).toBe(1);
  });

  it("adds {3} on anyone else's turn, its own controller's spells included", () => {
    const { game } = table();
    spawn(game, "Defense Grid", B);
    const shock = toHand(game, "Shock", B);
    const mountains = lands(game, "Mountain", 3, B);
    priorityTo(game, A);
    expect(shockAt(game, shock, B, A)).not.toBeNull();
    mountains.push(...lands(game, "Mountain", 1, B));
    cast(game, shock, { player: B, targets: [ref(A)], settle: false });
    expect(zone(game, shock)).toBe("stack");
    expect(tappedLands(game, mountains)).toBe(4);
  });

  it("reaches every player on someone else's turn in a multiplayer game", () => {
    const { game } = table({ players: 3 });
    spawn(game, "Defense Grid", A);
    const shock = toHand(game, "Shock", C);
    lands(game, "Mountain", 3, C);
    priorityTo(game, A, B);
    expect(shockAt(game, shock, C, A)).not.toBeNull();
  });

  it("two add {6}", () => {
    const { game } = table();
    spawn(game, "Defense Grid", A);
    spawn(game, "Defense Grid", B);
    const shock = toHand(game, "Shock", B);
    lands(game, "Mountain", 6, B);
    priorityTo(game, A);
    expect(shockAt(game, shock, B, A)).not.toBeNull();
    lands(game, "Mountain", 1, B);
    expect(shockAt(game, shock, B, A)).toBeNull();
  });

  it("can be reduced by what reduces costs (its ruling)", () => {
    const { game } = table();
    spawn(game, "Defense Grid", A);
    spawn(game, "Sapphire Medallion", B);
    const unsummon = toHand(game, "Unsummon", B);
    const bear = spawn(game, "Grizzly Bears", A);
    lands(game, "Island", 3, B);
    priorityTo(game, A);
    // {U} + {3} - {1}.
    expect(game.canDispatch({ type: "cast-spell", player: B, card: unsummon, targets: [ref(bear)] })).toBeNull();
  });
});
