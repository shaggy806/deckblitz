/**
 * "Whenever one or more land cards are put into your graveyard from your
 * library, put them onto the battlefield tapped" — `put-arrived-onto-battlefield`
 * with `count: "all"`: every card the batched trigger fired on that's still
 * there as the same object (rule 400.7), at once, with no choice. Hedge Shredder.
 */
import { describe, expect, it } from "vitest";

import type { Action } from "../actions.js";
import type { Game } from "../game.js";
import type { ObjectId } from "../primitives.js";

import {
  A,
  B,
  attack,
  cast,
  graveyard,
  lands,
  named,
  pickModes,
  ref,
  settle,
  spawn,
  table,
  toHand,
  toLibrary,
  zone,
} from "./harness.js";

const crewWith = (game: Game, vehicle: ObjectId, tap: readonly ObjectId[]): void => {
  const action: Action = { type: "activate-ability", player: A, source: vehicle, abilityIndex: 0, targets: [], tap };
  expect(game.canDispatch(action)).toBeNull();
  game.dispatch(action);
  settle(game);
};

describe("Hedge Shredder", () => {
  it("attacking, it may mill two; the lands milled enter tapped, the others stay", () => {
    const { game, a } = table();
    const shredder = spawn(game, "Hedge Shredder");
    const bears = spawn(game, "Grizzly Bears");
    const giant = toLibrary(game, "Hill Giant");
    const forest = toLibrary(game, "Forest");
    crewWith(game, shredder, [bears]);
    pickModes(a, 0);
    attack(game, a, [shredder]);
    expect(zone(game, forest)).toBe("battlefield");
    expect(game.state.objects[forest].tapped).toBe(true);
    expect(game.state.objects[forest].controller).toBe(A);
    expect(zone(game, giant)).toBe("graveyard");
  });

  it("all the lands of one event come in with nothing asked", () => {
    const { game, a } = table();
    const shredder = spawn(game, "Hedge Shredder");
    const bears = spawn(game, "Grizzly Bears");
    const swamp = toLibrary(game, "Swamp");
    const forest = toLibrary(game, "Forest");
    crewWith(game, shredder, [bears]);
    pickModes(a, 0);
    a.chooseFromZoneFn = () => {
      throw new Error("no choice to make");
    };
    attack(game, a, [shredder]);
    for (const land of [swamp, forest]) {
      expect(zone(game, land)).toBe("battlefield");
      expect(game.state.objects[land].tapped).toBe(true);
    }
  });

  it("the mill is optional", () => {
    const { game, a } = table();
    const shredder = spawn(game, "Hedge Shredder");
    const bears = spawn(game, "Grizzly Bears");
    const forest = toLibrary(game, "Forest");
    crewWith(game, shredder, [bears]);
    pickModes(a);
    attack(game, a, [shredder]);
    expect(zone(game, forest)).toBe("library");
  });

  it("sees any mill of your library, uncrewed, and asks a land's as-enters choice first", () => {
    const { game } = table();
    spawn(game, "Hedge Shredder");
    const forest = toLibrary(game, "Forest");
    const cavern = toLibrary(game, "Cavern of Souls");
    lands(game, "Island", 1);
    cast(game, toHand(game, "Thought Scour"), { targets: [ref(A)] });
    expect(zone(game, cavern)).toBe("battlefield");
    expect(game.state.objects[cavern].tapped).toBe(true);
    expect(game.state.objects[cavern].chosenCreatureType).toBeDefined();
    expect(zone(game, forest)).toBe("battlefield");
    expect(game.state.objects[forest].tapped).toBe(true);
  });

  it("not another player's library", () => {
    const { game } = table();
    spawn(game, "Hedge Shredder");
    const theirs = toLibrary(game, "Forest", B);
    lands(game, "Island", 1);
    cast(game, toHand(game, "Thought Scour"), { targets: [ref(B)] });
    expect(zone(game, theirs)).toBe("graveyard");
    expect(named(game, "Forest", A)).toHaveLength(0);
    expect(graveyard(game, A).some((id) => game.state.objects[id].cardName === "Forest")).toBe(false);
  });

  it("a second Shredder finds the lands already gone", () => {
    const { game } = table();
    spawn(game, "Hedge Shredder");
    spawn(game, "Hedge Shredder");
    const forest = toLibrary(game, "Forest");
    toLibrary(game, "Hill Giant");
    lands(game, "Island", 1);
    cast(game, toHand(game, "Thought Scour"), { targets: [ref(A)] });
    expect(zone(game, forest)).toBe("battlefield");
    expect(game.state.objects[forest].tapped).toBe(true);
  });

  it("with one card left in the library, the may isn't offered (rule 701.17b)", () => {
    const { game, a } = table();
    const shredder = spawn(game, "Hedge Shredder");
    const bears = spawn(game, "Grizzly Bears");
    crewWith(game, shredder, [bears]);
    const library = game.state.zones.perPlayer[A].library;
    const forest = toLibrary(game, "Forest");
    library.splice(1);
    expect(library).toEqual([forest]);
    // Answering yes would mill the Forest and put it onto the battlefield.
    pickModes(a, 0);
    attack(game, a, [shredder]);
    expect(zone(game, forest)).toBe("library");
  });
});
