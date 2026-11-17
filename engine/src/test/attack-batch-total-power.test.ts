/**
 * "Whenever you attack with one or more Wraiths, exile the top X cards of
 * your library, where X is their total power" (Witch-king, Sky Scourge): an
 * `attack-with` trigger's batch is the attackers that matched, and "their
 * total power" a sum over `"trigger-batch"`, each read as the ability
 * resolves — or as it last existed once it has left (rule 608.2h, the
 * card's ruling). Need key amount:trigger-batch-total-power-last-known: no
 * engine code, Vulpine Harvester's aggregate.
 */

import { describe, expect, it } from "vitest";

import { B, destroy, ref, settle, spawn, table, zone } from "./harness.js";
import type { Game } from "../game.js";
import type { ObjectId } from "../primitives.js";

const exiled = (game: Game): number => game.state.zones.shared.exile.length;

/** Declare `attackers` and stop with the trigger on the stack. */
function declare(game: Game, seat: ReturnType<typeof table>["a"], attackers: readonly ObjectId[]): void {
  seat.declareAttackersFn = () => attackers.map((attacker) => ({ attacker, defender: B }));
  game.advanceUntil((s) => s.zones.shared.stack.length > 0 || s.turn.step === "postcombat-main");
}

describe("Witch-king, Sky Scourge", () => {
  it("exiles as many cards as the attacking Wraiths' total power, and only theirs", () => {
    const { game, a } = table();
    const king = spawn(game, "Witch-king, Sky Scourge");
    const nazgul = spawn(game, "Nazgûl"); // a 1/2 Wraith
    const bears = spawn(game, "Grizzly Bears"); // not a Wraith: not counted
    const before = exiled(game);
    declare(game, a, [king, nazgul, bears]);
    expect(game.state.zones.shared.stack).toHaveLength(1);
    settle(game);
    expect(exiled(game) - before).toBe(6);
  });

  it("reads a Wraith that left as it last existed", () => {
    const { game, a } = table();
    const king = spawn(game, "Witch-king, Sky Scourge");
    const nazgul = spawn(game, "Nazgûl");
    game.debugApplyEffect(
      a.playerId,
      { kind: "modify-pt", target: 0, power: 2, toughness: 0, duration: "end-of-turn" },
      [ref(nazgul)],
    );
    const before = exiled(game);
    declare(game, a, [king, nazgul]);
    // In response, the 3/2 Nazgûl is destroyed: it still counts for 3.
    destroy(game, nazgul);
    expect(zone(game, nazgul)).toBe("graveyard");
    expect(exiled(game) - before).toBe(8);
  });

  it("doesn't trigger on an attack without a Wraith", () => {
    const { game, a } = table();
    spawn(game, "Witch-king, Sky Scourge");
    const bears = spawn(game, "Grizzly Bears");
    const before = exiled(game);
    declare(game, a, [bears]);
    expect(game.state.zones.shared.stack).toHaveLength(0);
    settle(game);
    expect(exiled(game) - before).toBe(0);
  });
});
