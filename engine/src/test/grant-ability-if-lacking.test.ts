/**
 * "If it doesn't have '…,' it gains that ability" (`grant-triggered`'s
 * `unlessHas`): a permanent that already has an ability of that text gains
 * no second one — Musician's music counters, more from each Musician, one
 * upkeep trigger (the ruling), kept with Musician gone.
 */
import { describe, expect, it } from "vitest";

import type { Game } from "../game.js";
import type { ObjectId } from "../primitives.js";

import { B, activate, counters, destroy, lands, nextTurn, pickModes, ref, spawn, table, zone } from "./harness.js";

/** How many granted triggered abilities `id` carries. */
const grants = (game: Game, id: ObjectId): number =>
  game.state.objects[id].modifiers.reduce((n, m) => n + (m.grantsTriggered?.length ?? 0), 0);

describe("Musician", () => {
  it("two Musicians: two music counters, one upkeep trigger; unpaid, the creature is destroyed", () => {
    const { game } = table();
    const musicians = [spawn(game, "Musician"), spawn(game, "Musician")];
    const bears = spawn(game, "Grizzly Bears", B);
    for (const m of musicians) activate(game, m, 0, { targets: [ref(bears)] });
    expect(counters(game, bears, "music")).toBe(2);
    expect(grants(game, bears)).toBe(1);
    // Musician gone, the ability stays (the ruling).
    for (const m of musicians) destroy(game, m);
    nextTurn(game); // bob's upkeep: nothing to pay with
    expect(zone(game, bears)).toBe("graveyard");
  });

  it("paid for each music counter, it stays", () => {
    const { game, b } = table();
    const musician = spawn(game, "Musician");
    const bears = spawn(game, "Grizzly Bears", B);
    lands(game, "Forest", 2, B);
    activate(game, musician, 0, { targets: [ref(bears)] });
    pickModes(b, 0);
    nextTurn(game);
    expect(zone(game, bears)).toBe("battlefield");
    expect(counters(game, bears, "music")).toBe(1);
  });

  it("one Musician twice on its own creature: still one ability, two counters", () => {
    const { game } = table();
    const musician = spawn(game, "Musician");
    const other = spawn(game, "Grizzly Bears");
    activate(game, musician, 0, { targets: [ref(other)] });
    expect(grants(game, other)).toBe(1);
    // Granted again to the one that has it: still one.
    game.state.objects[musician].tapped = false;    activate(game, musician, 0, { targets: [ref(other)] });
    expect(grants(game, other)).toBe(1);
    expect(counters(game, other, "music")).toBe(2);
  });
});
