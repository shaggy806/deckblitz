/**
 * "Choose a land you control. Then search your library for up to two basic
 * land cards which have the same name as the chosen land" (Canoptek Wraith):
 * a `choose-permanents` that remembers its pick for the resolution, then a
 * search whose filter is `sameNameWith: { thisWay: "chosen" }` (rule 201.2a).
 */
import { describe, expect, it } from "vitest";
import { B, attack, lands, pickModes, pickPermanents, spawn, table, toLibrary, zone } from "./harness.js";
import type { Game } from "../game.js";
import type { ObjectId } from "../primitives.js";
import type { ScriptedController } from "../controller.js";

const nameOf = (game: Game, id: ObjectId): string => game.state.objects[id].cardName;

/** The seat takes up to two of whatever a search offers, and says what that was. */
function takeTwo(seat: ScriptedController): { offered: readonly ObjectId[] | null } {
  const seen: { offered: readonly ObjectId[] | null } = { offered: null };
  seat.chooseFromZoneFn = (_view, eligible) => {
    seen.offered = eligible;
    return eligible.slice(0, 2);
  };
  return seen;
}

const onBattlefield = (game: Game, name: string): ObjectId[] =>
  game.state.zones.shared.battlefield.filter((id) => game.state.objects[id].cardName === name);

describe("Canoptek Wraith", () => {
  it("can't be blocked, and for {3} and itself fetches two basics named as the chosen land, tapped", () => {
    const { game, a } = table();
    const wraith = spawn(game, "Canoptek Wraith");
    lands(game, "Wastes", 3);
    const forest = spawn(game, "Forest");
    const inLibrary = [toLibrary(game, "Forest"), toLibrary(game, "Island"), toLibrary(game, "Forest")];
    pickModes(a, 0);
    const lands_ = pickPermanents(a, forest);
    const search = takeTwo(a);
    attack(game, a, [wraith]);
    expect(game.state.players[B].life).toBe(18);
    expect(zone(game, wraith)).toBe("graveyard");
    // Any land of hers could be chosen, with no targeting.
    expect(lands_.offered.map((id) => nameOf(game, id)).sort()).toEqual(["Forest", "Wastes", "Wastes", "Wastes"]);
    // Only the Forests are found: not the Island, not the library's Wastes.
    expect(search.offered?.map((id) => nameOf(game, id))).toEqual(["Forest", "Forest"]);
    expect(zone(game, inLibrary[0])).toBe("battlefield");
    expect(zone(game, inLibrary[2])).toBe("battlefield");
    expect(game.state.objects[inLibrary[0]].tapped).toBe(true);
    expect(game.state.objects[inLibrary[2]].tapped).toBe(true);
    expect(zone(game, inLibrary[1])).toBe("library");
    expect(onBattlefield(game, "Forest")).toHaveLength(3);
  });

  it("finds nothing for a nonbasic land's name", () => {
    const { game, a } = table();
    const wraith = spawn(game, "Canoptek Wraith");
    lands(game, "Wastes", 3);
    const tower = spawn(game, "Command Tower");
    toLibrary(game, "Command Tower");
    toLibrary(game, "Forest");
    pickModes(a, 0);
    pickPermanents(a, tower);
    const search = takeTwo(a);
    const before = game.state.zones.shared.battlefield.length;
    attack(game, a, [wraith]);
    expect(zone(game, wraith)).toBe("graveyard");
    expect(search.offered ?? []).toEqual([]);
    expect(game.state.zones.shared.battlefield.length).toBe(before - 1);
  });

  it("does nothing when declined, and isn't offered without {3}", () => {
    const { game, a } = table();
    const wraith = spawn(game, "Canoptek Wraith");
    lands(game, "Wastes", 3);
    pickModes(a);
    attack(game, a, [wraith]);
    expect(zone(game, wraith)).toBe("battlefield");

    const poor = table();
    const second = spawn(poor.game, "Canoptek Wraith");
    lands(poor.game, "Wastes", 2);
    let asked = false;
    poor.a.chooseModesFn = () => {
      asked = true;
      return [0];
    };
    attack(poor.game, poor.a, [second]);
    expect(asked).toBe(false);
    expect(zone(poor.game, second)).toBe("battlefield");
    expect(poor.game.state.players[B].life).toBe(18);
  });
});
