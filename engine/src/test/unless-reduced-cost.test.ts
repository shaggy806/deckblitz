import { describe, expect, it } from "vitest";

import type { ScriptedController } from "../controller.js";
import type { Game } from "../game.js";
import { A, cast, lands, named, nextTurn, pickFromZone, settle, spawn, table as openTable, toHand, zone } from "./harness.js";

// An `unless` whose mana cost is reduced (rules 118.7, 118.7a): a printed
// cost less an amount (`payReduced`, Draco) and an object's mana cost less an
// amount (`payManaCostOf` with `reducedBy`, Flash). Generic mana only comes
// off; the coloured symbols stay.

/** A table whose opening hands are gone: what's in hand is what a test put there. */
function table(): ReturnType<typeof openTable> {
  const seated = openTable();
  for (const player of seated.players) seated.game.state.zones.perPlayer[player].hand = [];
  return seated;
}

/** The seat answers every `choose-modes` with these, recording the texts offered. */
function answer(seat: ScriptedController, ...modes: readonly number[]): { texts: string[] } {
  const seen = { texts: [] as string[] };
  seat.chooseModesFn = (_view, _min, _max, texts) => {
    seen.texts.push(...(texts ?? []));
    return [...modes];
  };
  return seen;
}

const tapped = (game: Game, name: string): number => named(game, name, A).filter((id) => game.state.objects[id].tapped).length;

describe("Draco: domain reduces its cast and its upkeep cost", () => {
  it("costs {2} less to cast for each basic land type", () => {
    const { game } = table();
    for (const land of ["Plains", "Island", "Swamp", "Mountain", "Forest"]) lands(game, land, 1);
    lands(game, "Wastes", 1);
    // Five types: {16} less {10} is {6}, and six lands pay it.
    const draco = toHand(game, "Draco");
    cast(game, draco);
    expect(zone(game, draco)).toBe("battlefield");
  });

  it("upkeep: {10} less {2} a type, paid, and it stays", () => {
    const { game, a } = table();
    const draco = spawn(game, "Draco");
    lands(game, "Plains", 2);
    lands(game, "Island", 1);
    lands(game, "Swamp", 1);
    lands(game, "Wastes", 2);
    // Three types: {10} less {6} is {4}.
    const seen = answer(a, 0);
    nextTurn(game, "upkeep");
    nextTurn(game, "upkeep");
    settle(game);
    expect(seen.texts).toEqual(["Pay {4}"]);
    expect(zone(game, draco)).toBe("battlefield");
    const total = ["Plains", "Island", "Swamp", "Wastes"].reduce((n, land) => n + tapped(game, land), 0);
    expect(total).toBe(4);
  });

  it("upkeep: declined, it's sacrificed; with every type the cost is {0}", () => {
    const { game, a } = table();
    const draco = spawn(game, "Draco");
    for (const land of ["Plains", "Island", "Swamp", "Mountain", "Forest"]) lands(game, land, 1);
    const seen = answer(a, 0);
    nextTurn(game, "upkeep");
    nextTurn(game, "upkeep");
    settle(game);
    expect(seen.texts).toEqual(["Pay {0}"]);
    expect(zone(game, draco)).toBe("battlefield");

    answer(a);
    nextTurn(game, "upkeep");
    nextTurn(game, "upkeep");
    settle(game);
    expect(zone(game, draco)).toBe("graveyard");
  });
});

describe("Flash: its mana cost reduced by {2}, generic only", () => {
  it("Grizzly Bears' {1}{G} becomes {G}: paid, it stays", () => {
    const { game, a } = table();
    lands(game, "Island", 2);
    lands(game, "Forest", 1);
    const bears = toHand(game, "Grizzly Bears");
    pickFromZone(a, bears);
    const seen = answer(a, 0);
    cast(game, toHand(game, "Flash"));
    expect(seen.texts).toEqual(["Pay {G}"]);
    expect(zone(game, bears)).toBe("battlefield");
    expect(tapped(game, "Forest")).toBe(1);
  });

  it("not paid: the creature is sacrificed", () => {
    const { game, a } = table();
    lands(game, "Island", 2);
    lands(game, "Forest", 4);
    const dreadmaw = toHand(game, "Colossal Dreadmaw");
    pickFromZone(a, dreadmaw);
    const seen = answer(a);
    cast(game, toHand(game, "Flash"));
    // {4}{G}{G} less {2}.
    expect(seen.texts).toEqual(["Pay {2}{G}{G}"]);
    expect(zone(game, dreadmaw)).toBe("graveyard");
    expect(tapped(game, "Forest")).toBe(0);
  });

  it("nothing put: nothing is asked", () => {
    const { game, a } = table();
    lands(game, "Island", 2);
    pickFromZone(a);
    const seen = answer(a, 0);
    cast(game, toHand(game, "Flash"));
    expect(seen.texts).toEqual([]);
  });
});
