/**
 * Linked exile, then a return (rule 607.2a): Sothera, the Supervoid — each
 * opponent chooses a creature they control and exiles it, linked to Sothera;
 * at the beginning of its controller's end step, if a player controls no
 * creatures (an intervening "if", rule 603.4), Sothera is sacrificed, then a
 * creature card exiled with it comes back under its controller's control with
 * two additional +1/+1 counters — found through the stint the ability came
 * from, though Sothera has gone.
 */
import { describe, expect, it } from "vitest";

import { A, B, C, controller, counters, destroy, named, pickFromZone, settle, spawn, table, toStep, zone } from "./harness.js";

describe("Sothera, the Supervoid", () => {
  it("each opponent exiles a creature of their choice when a creature of yours dies", () => {
    const { game, b, c } = table({ players: 3 });
    spawn(game, "Sothera, the Supervoid", A);
    const mine = spawn(game, "Grizzly Bears", A);
    const bobsGiant = spawn(game, "Hill Giant", B);
    const bobsBears = spawn(game, "Grizzly Bears", B);
    const carols = spawn(game, "Hill Giant", C);
    b.choosePermanentsFn = () => [bobsGiant];
    c.choosePermanentsFn = () => [carols];
    destroy(game, mine);
    expect(zone(game, bobsGiant)).toBe("exile");
    expect(zone(game, carols)).toBe("exile");
    expect(zone(game, bobsBears)).toBe("battlefield");
  });

  it("at your end step, with a player creatureless: sacrificed, then a card exiled with it returns with two counters", () => {
    const { game, a, b } = table({ players: 2 });
    const sothera = spawn(game, "Sothera, the Supervoid", A);
    const mine = spawn(game, "Grizzly Bears", A);
    const giant = spawn(game, "Hill Giant", B);
    b.choosePermanentsFn = () => [giant];
    destroy(game, mine);
    expect(zone(game, giant)).toBe("exile");
    // Both players are now creatureless.
    pickFromZone(a, giant);
    toStep(game, "end", A);
    settle(game);
    expect(zone(game, sothera)).toBe("graveyard");
    const [back] = named(game, "Hill Giant");
    expect(back).toBeDefined();
    expect(zone(game, back)).toBe("battlefield");
    expect(controller(game, back)).toBe(A);
    expect(counters(game, back)).toBe(2);
  });

  it("doesn't trigger while every player controls a creature", () => {
    const { game, b } = table({ players: 2 });
    const sothera = spawn(game, "Sothera, the Supervoid", A);
    const mine = spawn(game, "Grizzly Bears", A);
    spawn(game, "Grizzly Bears", A);
    const giant = spawn(game, "Hill Giant", B);
    spawn(game, "Hill Giant", B);
    b.choosePermanentsFn = () => [giant];
    destroy(game, mine);
    toStep(game, "end", A);
    settle(game);
    expect(zone(game, sothera)).toBe("battlefield");
    expect(zone(game, giant)).toBe("exile");
  });

  it("only cards exiled with it come back, not other exiled creature cards", () => {
    const { game, a } = table({ players: 2 });
    const sothera = spawn(game, "Sothera, the Supervoid", A);
    const other = game.debugSpawn("Hill Giant", B, "exile");
    const seen = pickFromZone(a, other);
    toStep(game, "end", A);
    settle(game);
    // Bob controls no creatures: it triggers, is sacrificed, and finds nothing.
    expect(zone(game, sothera)).toBe("graveyard");
    expect(seen.offered).toEqual([]);
    expect(zone(game, other)).toBe("exile");
  });
});
