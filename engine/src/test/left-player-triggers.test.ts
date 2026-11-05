// What triggers for a player in the same event they leave the game in ceases to
// exist with them (rule 800.4a): it never goes on the stack, and nothing asks
// them anything. Found by the situation fuzzer on Valentin, Dean of the Vein
// (batch 265): alice lost to combat damage while a creature of carol's died in
// the same state-based actions, Valentin exiled it instead, and its "when you
// do" went on the stack for alice and asked her to pay {2} — a decision nobody
// could answer.
import { describe, expect, it } from "vitest";
import { A, B, named, settle, spawn, table, zone } from "./harness.js";

describe("a trigger for a player who left in the same event", () => {
  it("never goes on the stack (Valentin's 'when you do' as its controller loses)", () => {
    const { game } = table({ players: 3 });
    spawn(game, "Valentin, Dean of the Vein", A);
    spawn(game, "Island", A);
    spawn(game, "Island", A);
    const bears = spawn(game, "Grizzly Bears", B);
    // Both at once, by one check of state-based actions (rule 704.3).
    game.state.players[A].life = 0;
    game.state.objects[bears].damageMarked = 2;
    game.tick();
    settle(game);
    expect(game.state.players[A].hasLost).toBe(true);
    // Valentin was there as the bears died, so its replacement exiled them.
    expect(zone(game, bears)).toBe("exile");
    expect(game.state.awaiting).toBeNull();
    expect(game.state.zones.shared.stack).toEqual([]);
    expect(named(game, "Pest Token")).toEqual([]);
  });
});
