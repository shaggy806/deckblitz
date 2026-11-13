/**
 * The `loses-life` trigger's `batched` with `exactly` — "whenever one or more
 * opponents each lose exactly 1 life" (Ob Nixilis, Captive Kingpin): once per
 * simultaneous loss (rule 603.2c) in which some opponent lost exactly 1 in
 * all. Its ruling: three 1/1s' combat damage to one player is 3 life lost,
 * and it doesn't trigger.
 */
import { describe, expect, it } from "vitest";

import { A, B, C, attack, cast, lands, pt, ref, spawn, table, toHand, toLibrary, toStep, zone } from "./harness.js";

function setUp(players: 2 | 4 = 2) {
  const seats = table({ players });
  const { game } = seats;
  const ob = spawn(game, "Ob Nixilis, Captive Kingpin");
  const top = toLibrary(game, "Grizzly Bears");
  return { seats, game, ob, top };
}

describe("Ob Nixilis, Captive Kingpin", () => {
  it("one 1/1 connecting is exactly 1 life: a counter and the top card exiled", () => {
    const { seats, game, ob, top } = setUp();
    const elf = spawn(game, "Llanowar Elves");
    attack(game, seats.a, [elf]);
    expect(game.state.players[B].life).toBe(19);
    expect(pt(game, ob).power).toBe(5);
    expect(zone(game, top)).toBe("exile");
  });

  it("two 1/1s connecting together are 2 life: no trigger", () => {
    const { seats, game, ob, top } = setUp();
    const elves = [spawn(game, "Llanowar Elves"), spawn(game, "Llanowar Elves")];
    attack(game, seats.a, elves);
    expect(game.state.players[B].life).toBe(18);
    expect(pt(game, ob).power).toBe(4);
    expect(zone(game, top)).toBe("library");
  });

  it("1 to one opponent and 2 to another at once: one trigger", () => {
    const { seats, game, ob } = setUp(4);
    const elf = spawn(game, "Llanowar Elves");
    const bears = spawn(game, "Grizzly Bears");
    seats.a.declareAttackersFn = () => [
      { attacker: elf, defender: B },
      { attacker: bears, defender: C },
    ];
    toStep(game, "postcombat-main", A);
    expect(game.state.players[B].life).toBe(19);
    expect(game.state.players[C].life).toBe(18);
    expect(pt(game, ob).power).toBe(5);
  });

  it("a spell's 2 damage to an opponent doesn't trigger", () => {
    const { game, ob } = setUp();
    lands(game, "Mountain", 1);
    cast(game, toHand(game, "Shock"), { targets: [ref(B)] });
    expect(game.state.players[B].life).toBe(18);
    expect(pt(game, ob).power).toBe(4);
  });
});
