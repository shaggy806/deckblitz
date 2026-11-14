/**
 * A graveyard-exile replacement's `then` reading the exiled permanent and its
 * own source (`GraveyardExileReplacement.then`): Ravenous Slime's "If a
 * creature an opponent controls would die, instead exile it and put a number
 * of +1/+1 counters equal to that creature's power on this creature".
 * "That creature" is the permanent as it last existed on the battlefield
 * (`"trigger-object"`, rule 608.2h); "this creature" is the Slime in the stint
 * it replaced from, so a Slime dying beside the creature gets nothing.
 */
import { describe, expect, it } from "vitest";

import { A, B, C, counters, destroy, settle, spawn, table, zone, ref } from "./harness.js";

describe("Ravenous Slime", () => {
  it("exiles an opponent's dying creature and grows by its last-known power", () => {
    const { game } = table();
    const slime = spawn(game, "Ravenous Slime", A);
    const bears = spawn(game, "Grizzly Bears", B);
    // 2/2 with three +1/+1 counters: power 5 on the battlefield, 2 as a card.
    game.debugApplyEffect(B, { kind: "add-counter", target: 0, counter: "+1/+1", amount: 3 }, [ref(bears)]);
    destroy(game, bears);
    expect(zone(game, bears)).toBe("exile");
    expect(counters(game, slime)).toBe(5);
  });

  it("lets its controller's own creature die, and exiles an opponent's token for its power", () => {
    const { game } = table();
    const slime = spawn(game, "Ravenous Slime", A);
    const mine = spawn(game, "Grizzly Bears", A);
    destroy(game, mine);
    expect(zone(game, mine)).toBe("graveyard");
    expect(counters(game, slime)).toBe(0);
    game.debugApplyEffect(B, { kind: "create-token", token: "Zombie Token", count: 1 }, []);
    const zombie = game.state.zones.shared.battlefield.find((id) => game.state.objects[id].cardName === "Zombie Token")!;
    destroy(game, zombie);
    expect(game.state.objects[zombie]?.zone).not.toBe("battlefield");
    expect(counters(game, slime)).toBe(2);
  });

  it("dying beside an opponent's creatures, still exiles them but gets no counters (its ruling)", () => {
    const { game } = table();
    const slime = spawn(game, "Ravenous Slime", A);
    const bears = spawn(game, "Grizzly Bears", B);
    game.debugApplyEffect(B, { kind: "destroy-all", filter: { type: "creature" } }, []);
    settle(game);
    expect(zone(game, bears)).toBe("exile");
    expect(zone(game, slime)).toBe("graveyard");
    expect(counters(game, slime)).toBe(0);
  });

  it("with two Slimes able to apply, one exiles the creature and only that one grows (rule 616.1)", () => {
    const { game } = table({ players: 3 });
    const mine = spawn(game, "Ravenous Slime", A);
    const theirs = spawn(game, "Ravenous Slime", C);
    const giant = spawn(game, "Hill Giant", B);
    destroy(game, giant);
    expect(zone(game, giant)).toBe("exile");
    expect(counters(game, mine) + counters(game, theirs)).toBe(3);
    expect(Math.min(counters(game, mine), counters(game, theirs))).toBe(0);
  });
});
