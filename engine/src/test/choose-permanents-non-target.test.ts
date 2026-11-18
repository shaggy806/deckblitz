/**
 * "Choose up to three Doctors. You may exile all other creatures. If you do,
 * this Saga deals 13 damage to you." (The Day of the Doctor IV — need key
 * decision:choose-permanents-non-target): no new decision. A
 * `choose-permanents` with `thenTogether` and an empty `then` only chooses —
 * any player's Doctors, none targeted — and records them as "chosen" this way;
 * the `may`'s `exile-all` takes every creature not chosen, even with no Doctor
 * chosen (the ruling), and only then is the damage dealt. I–III: a
 * `reveal-until` exiling to a legendary card, kept in exile and playable for
 * as long as the Saga remains on the battlefield (`grant-play` of
 * `"while-source"`), the rest to the bottom.
 */
import { describe, expect, it } from "vitest";

import type { Game } from "../game.js";
import type { ObjectId } from "../primitives.js";
import { A, B, destroy, enter, life, pickModes, pickPermanents, ref, settle, spawn, table, toLibrary, zone } from "./harness.js";

/** One more lore counter on the Saga, its chapter ability resolved. */
function lore(game: Game, saga: ObjectId, times = 1): void {
  for (let i = 0; i < times; i += 1) {
    game.debugApplyEffect(A, { kind: "add-counter", target: 0, counter: "lore", amount: 1 }, [ref(saga)]);
    settle(game);
  }
}

const library = (game: Game): readonly ObjectId[] => game.state.zones.perPlayer[A].library;
/** Whether Alice is offered a cast or a land play of the card. */
const playable = (game: Game, card: ObjectId): boolean =>
  game.legalActions(A).some((o) => (o.kind === "cast-spell" || o.kind === "play-land") && o.card === card);

describe("The Day of the Doctor", () => {
  it("I exiles to a legendary card, playable while the Saga remains; the rest go to the bottom", () => {
    const { game } = table();
    game.state.zones.perPlayer[A].library = [];
    const bottom = toLibrary(game, "Island");
    const isamaru = toLibrary(game, "Isamaru, Hound of Konda");
    const bears = toLibrary(game, "Grizzly Bears");
    const forest = toLibrary(game, "Forest");
    spawn(game, "Plains");
    const saga = enter(game, "The Day of the Doctor");
    expect(zone(game, isamaru)).toBe("exile");
    // Forest and Bears were exiled on the way, then put on the bottom.
    expect(library(game)[0]).toBe(bottom);
    expect([...library(game).slice(1)].sort()).toEqual([bears, forest].sort());
    expect(playable(game, isamaru)).toBe(true);
    // Gone with the Saga.
    destroy(game, saga);
    expect(zone(game, saga)).toBe("graveyard");
    expect(playable(game, isamaru)).toBe(false);
  });

  it("I's legendary land may be played", () => {
    const { game } = table();
    game.state.zones.perPlayer[A].library = [];
    const cradle = toLibrary(game, "Gaea's Cradle");
    enter(game, "The Day of the Doctor");
    expect(zone(game, cradle)).toBe("exile");
    expect(playable(game, cradle)).toBe(true);
  });

  it("IV keeps the Doctors chosen, any player's, and exiles every other creature; the Saga deals you 13", () => {
    const { game, a } = table();
    const healer = spawn(game, "Cult Healer");
    const gannon = spawn(game, "Arcade Gannon", B);
    const bears = spawn(game, "Grizzly Bears");
    const giant = spawn(game, "Hill Giant", B);
    const theirHealer = spawn(game, "Cult Healer", B);
    game.state.zones.perPlayer[A].library = [];
    const saga = enter(game, "The Day of the Doctor");
    lore(game, saga, 2);
    const offered = pickPermanents(a, healer, gannon);
    pickModes(a, 0);
    const before = life(game);
    lore(game, saga);
    // Only Doctors are offered, whoever controls them.
    expect([...offered.offered].sort()).toEqual([healer, gannon, theirHealer].sort());
    expect(zone(game, healer)).toBe("battlefield");
    expect(zone(game, gannon)).toBe("battlefield");
    expect([bears, giant, theirHealer].map((id) => zone(game, id))).toEqual(["exile", "exile", "exile"]);
    expect(life(game)).toBe(before - 13);
    expect(zone(game, saga)).toBe("graveyard");
  });

  it("IV with no Doctor chosen may still exile every creature", () => {
    const { game, a } = table();
    const bears = spawn(game, "Grizzly Bears");
    const giant = spawn(game, "Hill Giant", B);
    game.state.zones.perPlayer[A].library = [];
    const saga = enter(game, "The Day of the Doctor");
    lore(game, saga, 2);
    pickModes(a, 0);
    const before = life(game);
    lore(game, saga);
    expect([bears, giant].map((id) => zone(game, id))).toEqual(["exile", "exile"]);
    expect(life(game)).toBe(before - 13);
  });

  it("IV, declined: nothing is exiled and no damage is dealt", () => {
    const { game, a } = table();
    const bears = spawn(game, "Grizzly Bears");
    const healer = spawn(game, "Cult Healer");
    game.state.zones.perPlayer[A].library = [];
    const saga = enter(game, "The Day of the Doctor");
    lore(game, saga, 2);
    pickPermanents(a, healer);
    pickModes(a);
    const before = life(game);
    lore(game, saga);
    expect(zone(game, bears)).toBe("battlefield");
    expect(life(game)).toBe(before);
  });
});
