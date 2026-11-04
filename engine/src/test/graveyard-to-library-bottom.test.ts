/**
 * `put-on-libraries` of a whole graveyard, "on the bottom of their library in a
 * random order": one move, nothing shuffled and nothing to arrange, since the
 * effect fixes the order rule 401.4 would have left to the owner.
 *
 * Proving card: Endurance.
 */

import { describe, expect, it } from "vitest";

import type { Game } from "../game.js";
import type { ObjectId, PlayerId } from "../primitives.js";
import {
  A,
  B,
  cast,
  lands,
  named,
  pickFromZone,
  pickTargets,
  quiet,
  settle,
  spawn,
  table,
  toGraveyard,
  toHand,
  zone,
  type Table,
} from "./harness.js";

const library = (game: Game, player: PlayerId = A): readonly ObjectId[] => game.state.zones.perPlayer[player].library;
const graveyard = (game: Game, player: PlayerId = A): readonly ObjectId[] => game.state.zones.perPlayer[player].graveyard;
const NAMES = ["Grizzly Bears", "Llanowar Elves", "Opt", "Forest", "Island"];

function endurance(t: Table, target: PlayerId | null): ObjectId {
  lands(t.game, "Forest", 3);
  const card = toHand(t.game, "Endurance");
  pickTargets(t.a, target);
  cast(t.game, card);
  return card;
}

/** The order `seed` gives Bob's five graveyard cards under his library. */
function orderWith(seed: number): string[] {
  const t = table({ seed });
  const cards = NAMES.map((name) => toGraveyard(t.game, name, B));
  const before = library(t.game, B).length;
  endurance(t, B);
  const bottom = library(t.game, B).slice(before);
  expect([...bottom].sort()).toEqual([...cards].sort());
  return bottom.map((id) => NAMES[cards.indexOf(id)]);
}

describe("Endurance", () => {
  it("the target player's whole graveyard goes under their library, what was there still on top", () => {
    const t = table();
    const { game } = t;
    const mine = toGraveyard(game, "Opt");
    const cards = NAMES.map((name) => toGraveyard(game, name, B));
    const top = [...library(game, B)];
    endurance(t, B);

    expect(graveyard(game, B)).toEqual([]);
    expect(library(game, B).slice(0, top.length)).toEqual(top);
    expect(library(game, B).slice(top.length).sort()).toEqual([...cards].sort());
    // Only that player's.
    expect(zone(game, mine)).toBe("graveyard");
  });

  it("is no shuffle, and no one is asked the order (rule 401.4 gives way to the effect)", () => {
    const t = table();
    const { game } = t;
    NAMES.forEach((name) => toGraveyard(game, name, B));
    const asked: unknown[] = [];
    t.b.chooseFromZoneFn = (_view, eligible) => {
      asked.push(eligible);
      return eligible;
    };
    endurance(t, B);
    expect(asked).toEqual([]);
    expect(game.state.eventLog.filter((e) => e.type === "library-shuffled")).toEqual([]);
    expect(game.state.eventLog.filter((e) => e.type === "cards-shuffled-into-library")).toEqual([]);
  });

  it("the order is random, and the same seed gives the same one", () => {
    expect(orderWith(7)).toEqual(orderWith(7));
    const orders = new Set(Array.from({ length: 12 }, (_, seed) => orderWith(seed + 1).join()));
    expect(orders.size).toBeGreaterThan(3);
    // Any card can end up at the very bottom, the last moved or not.
    const last = new Set(Array.from({ length: 24 }, (_, seed) => orderWith(seed + 1).at(-1)));
    expect(last.size).toBeGreaterThan(2);
  });

  it("up to one: with no target, nothing happens", () => {
    const t = table();
    const { game } = t;
    const card = toGraveyard(game, "Opt");
    const before = library(game).length;
    endurance(t, null);
    expect(zone(game, card)).toBe("graveyard");
    expect(library(game)).toHaveLength(before);
    expect(zone(game, named(game, "Endurance", A)[0])).toBe("battlefield");
  });

  it("an empty graveyard is nothing, and its creature stays", () => {
    const t = table();
    const before = library(t.game, B).length;
    endurance(t, B);
    expect(library(t.game, B)).toHaveLength(before);
  });

  it("the cards leave as one event: one 'one or more cards leave your graveyard' trigger", () => {
    const t = table();
    const { game } = t;
    spawn(game, "Tormod, the Desecrator");
    NAMES.forEach((name) => toGraveyard(game, name));
    endurance(t, A);
    expect(graveyard(game)).toEqual([]);
    expect(game.state.zones.shared.battlefield.filter((id) => game.state.objects[id].isToken === true)).toHaveLength(1);
  });

  it("evoked by exiling a green card: its trigger resolves first if you like, and it goes to the graveyard after", () => {
    const t = table();
    const { game, a } = t;
    const old = toGraveyard(game, "Opt");
    const pitched = toHand(game, "Llanowar Elves");
    const card = toHand(game, "Endurance");
    pickFromZone(a, pitched);
    pickTargets(a, A);
    cast(game, card, { evoke: true, settle: false });
    settle(game);
    expect(zone(game, pitched)).toBe("exile");
    expect(zone(game, old)).toBe("library");
    // Evoked, it's sacrificed once its trigger has resolved, so it stays behind.
    expect(graveyard(game)).toEqual([card]);
  });

  it("each player's graveyard, read as a scope, into each of their own libraries", () => {
    const t = table();
    const { game } = t;
    const mine = toGraveyard(game, "Opt");
    const theirs = toGraveyard(game, "Forest", B);
    game.debugApplyEffect(A, { kind: "put-on-libraries", what: { graveyardOf: "each-player" }, position: "bottom-random" }, []);
    settle(game);
    expect(library(game).at(-1)).toBe(mine);
    expect(library(game, B).at(-1)).toBe(theirs);
  });
});

describe("a commander in that graveyard (rule 903.9b)", () => {
  /** Alice's commander and four others under her library; her answer to go to the library or not. */
  function commanderIn(seed: number, toCommandZone: boolean): { game: Game; general: ObjectId; others: ObjectId[]; before: number } {
    const t = table({ seed });
    const { game } = t;
    const general = toGraveyard(game, "Grizzly Bears");
    game.state.objects[general].isCommander = true;
    const others = NAMES.slice(1).map((name) => toGraveyard(game, name));
    const before = library(game).length;
    lands(game, "Forest", 3);
    pickTargets(t.a, A);
    cast(game, toHand(game, "Endurance"), { settle: false });
    game.advanceUntil((s) => s.awaiting?.kind === "commander-replacement" || quiet(s));
    expect(game.state.awaiting?.kind).toBe("commander-replacement");
    game.dispatch({ type: "commander-replacement", player: A, toCommandZone });
    game.advanceUntil(quiet);
    return { game, general, others, before };
  }

  it("sent to the command zone, the rest go without it", () => {
    const { game, general, others, before } = commanderIn(3, true);
    expect(zone(game, general)).toBe("command");
    expect(library(game).slice(before).sort()).toEqual([...others].sort());
  });

  it("declined, it lands among them at random, not always last for answering last", () => {
    const places = new Set<number>();
    for (let seed = 1; seed <= 24; seed += 1) {
      const { game, general, others, before } = commanderIn(seed, false);
      const bottom = library(game).slice(before);
      expect([...bottom].sort()).toEqual([...others, general].sort());
      places.add(bottom.indexOf(general));
    }
    expect(places.size).toBeGreaterThan(2);
  });
});
