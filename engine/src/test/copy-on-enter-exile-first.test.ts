/**
 * `CopyOnEnter.exileFirst` (rule 614.1c): "As The Mimeoplasm enters, you may
 * exile two creature cards from graveyards. If you do, it enters as a copy of
 * one of those cards with a number of additional +1/+1 counters on it equal to
 * the power of the other card" — two cards or none, from any graveyards, then
 * which one it copies, both asked before it moves (rule 614.12).
 */
import { describe, expect, it } from "vitest";

import { A, B, cast, counters, hand, keywords, lands, pt, spawn, table, toGraveyard, toHand, zone } from "./harness.js";
import type { Game } from "../game.js";
import type { ObjectId } from "../primitives.js";
import type { ScriptedController } from "../controller.js";
import { nameOf } from "../state.js";

function mana(game: Game): void {
  spawn(game, "Swamp");
  spawn(game, "Forest");
  lands(game, "Island", 3);
}

/** Answers each `choose-from-zone` in turn, recording what each offered. */
function answers(seat: ScriptedController, ...picks: (readonly ObjectId[])[]): (readonly ObjectId[])[] {
  const offered: (readonly ObjectId[])[] = [];
  seat.chooseFromZoneFn = (_view, eligible) => {
    offered.push(eligible);
    return picks[offered.length - 1] ?? [];
  };
  return offered;
}

describe("The Mimeoplasm", () => {
  it("exiles two creature cards from any graveyards, copies the chosen one, and gets the other's power in counters", () => {
    const { game, a } = table();
    mana(game);
    const bears = toGraveyard(game, "Grizzly Bears");
    const angel = toGraveyard(game, "Serra Angel", B);
    toGraveyard(game, "Island");
    const ooze = toHand(game, "The Mimeoplasm");
    const offered = answers(a, [bears, angel], [angel]);
    cast(game, ooze);
    // Both graveyards' creature cards, then just the two it exiled.
    expect(offered).toEqual([
      [bears, angel],
      [bears, angel],
    ]);
    expect(zone(game, bears)).toBe("exile");
    expect(zone(game, angel)).toBe("exile");
    expect(zone(game, ooze)).toBe("battlefield");
    expect(nameOf(game.state.objects[ooze])).toBe("Serra Angel");
    expect(keywords(game, ooze).has("flying")).toBe(true);
    // Serra Angel's 4/4 with the Bears' power, 2, in +1/+1 counters.
    expect(counters(game, ooze)).toBe(2);
    expect(pt(game, ooze)).toEqual({ power: 6, toughness: 6 });
  });

  it("copies the other one if chosen: the counters follow the card not copied", () => {
    const { game, a } = table();
    mana(game);
    const bears = toGraveyard(game, "Grizzly Bears");
    const angel = toGraveyard(game, "Serra Angel");
    const ooze = toHand(game, "The Mimeoplasm");
    answers(a, [bears, angel], [bears]);
    cast(game, ooze);
    expect(nameOf(game.state.objects[ooze])).toBe("Grizzly Bears");
    expect(counters(game, ooze)).toBe(4);
    expect(pt(game, ooze)).toEqual({ power: 6, toughness: 6 });
  });

  it("the copied card's own enters abilities work (its ruling): Mulldrifter draws two", () => {
    const { game, a } = table();
    mana(game);
    const drifter = toGraveyard(game, "Mulldrifter");
    const bears = toGraveyard(game, "Grizzly Bears");
    const ooze = toHand(game, "The Mimeoplasm");
    answers(a, [drifter, bears], [drifter]);
    const before = hand(game, A).length - 1;
    cast(game, ooze);
    expect(nameOf(game.state.objects[ooze])).toBe("Mulldrifter");
    expect(counters(game, ooze)).toBe(2);
    expect(hand(game, A).length).toBe(before + 2);
  });

  it("choosing just one is declining (its ruling): nothing is exiled and it's a 0/0", () => {
    const { game, a } = table();
    mana(game);
    const bears = toGraveyard(game, "Grizzly Bears");
    const angel = toGraveyard(game, "Serra Angel");
    const ooze = toHand(game, "The Mimeoplasm");
    const offered = answers(a, [bears]);
    cast(game, ooze);
    expect(offered).toHaveLength(1);
    expect(zone(game, bears)).toBe("graveyard");
    expect(zone(game, angel)).toBe("graveyard");
    expect(zone(game, ooze)).toBe("graveyard");
  });

  it("with fewer than two creature cards in graveyards it never asks", () => {
    const { game, a } = table();
    mana(game);
    const bears = toGraveyard(game, "Grizzly Bears");
    const ooze = toHand(game, "The Mimeoplasm");
    const offered = answers(a);
    cast(game, ooze);
    expect(offered).toHaveLength(0);
    expect(zone(game, bears)).toBe("graveyard");
    expect(zone(game, ooze)).toBe("graveyard");
  });
});
