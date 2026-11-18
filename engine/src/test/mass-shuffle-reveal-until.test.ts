/**
 * Collision of Realms: "Each player shuffles all creatures they own into their
 * library. Each player who shuffled a nontoken creature into their library
 * this way reveals cards from the top of their library until they reveal a
 * creature card, then puts that card onto the battlefield and the rest on the
 * bottom of their library in a random order."
 *
 * `shuffle-graveyard-into-library`'s `filter` now reaches the permanents of
 * `zones: ["permanents"]`, and those permanents are `{ thisWay:
 * "shuffled-into-library" }` (a token too, until the next state-based check,
 * rule 111.7), read per player by a `for-each-player`'s `whoseAmount`. The
 * finds are held (rule 101.4) and enter together (the card's ruling). A
 * commander whose owner declines the command zone (rule 903.9b) goes in at
 * random after the shuffle, and counts as shuffled in.
 */

import { describe, expect, it } from "vitest";

import type { Game } from "../game.js";
import type { ObjectId, PlayerId } from "../primitives.js";
import { A, B, activate, cast, lands, named, quiet, spawn, table, toHand, types, zone } from "./harness.js";

const library = (game: Game, player: PlayerId = A): readonly ObjectId[] => game.state.zones.perPlayer[player].library;
const creaturesOf = (game: Game, player: PlayerId): string[] =>
  game.state.zones.shared.battlefield
    .filter((id) => game.state.objects[id].controller === player && game.state.objects[id].cardName !== "Mountain")
    .map((id) => game.state.objects[id].cardName);

/** A real 1/1 Soldier token for `player` (a spawned token card isn't one). */
function soldierToken(game: Game, player: PlayerId): ObjectId {
  game.debugApplyEffect(player, { kind: "create-token", token: "Soldier Token", count: 1 }, []);
  const made = named(game, "Soldier Token", player).find((id) => game.state.objects[id].isToken === true);
  if (made === undefined) throw new Error("no Soldier token");
  return made;
}

function castCollision(game: Game, settle = true): void {
  lands(game, "Mountain", 7);
  cast(game, toHand(game, "Collision of Realms"), { settle });
}

describe("Collision of Realms", () => {
  it("each player's creatures go in; a player who shuffled a nontoken one puts the first creature card revealed onto the battlefield", () => {
    const { game } = table();
    const bears = spawn(game, "Grizzly Bears");
    soldierToken(game, A);
    // Bob has only a token: his library is shuffled, but he reveals nothing.
    const bobToken = soldierToken(game, B);
    const before = { a: library(game).length, b: library(game, B).length };
    const since = game.state.eventLog.length;
    castCollision(game);
    // The Bears were the only creature card in Alice's library.
    expect(zone(game, bears)).toBe("battlefield");
    expect(creaturesOf(game, A)).toEqual(["Grizzly Bears"]);
    // Every revealed card but the Bears went back, to the bottom.
    expect(library(game).length).toBe(before.a);
    expect(game.state.objects[bobToken]?.zone ?? "gone").not.toBe("battlefield");
    expect(library(game, B)).not.toContain(bobToken);
    expect(creaturesOf(game, B)).toEqual([]);
    expect(library(game, B).length).toBe(before.b);
    const events = game.state.eventLog.slice(since);
    expect(events.some((e) => e.type === "library-shuffled" && e.player === B)).toBe(true);
    expect(events.filter((e) => e.type === "cards-revealed").map((e) => (e as { player: PlayerId }).player)).toEqual([A]);
  });

  it("every player reveals before any of the cards found enters, and each enters under its owner", () => {
    const { game } = table();
    spawn(game, "Grizzly Bears");
    spawn(game, "Hill Giant", B);
    const since = game.state.eventLog.length;
    castCollision(game);
    expect(creaturesOf(game, A)).toEqual(["Grizzly Bears"]);
    expect(creaturesOf(game, B)).toEqual(["Hill Giant"]);
    const events = game.state.eventLog.slice(since);
    const lastReveal = events.findLastIndex((e) => e.type === "cards-revealed");
    const firstEntry = events.findIndex(
      (e) => e.type === "permanent-entered-battlefield" && game.state.objects[e.object]?.cardName !== "Collision of Realms",
    );
    expect(events.filter((e) => e.type === "cards-revealed")).toHaveLength(2);
    expect(lastReveal).toBeLessThan(firstEntry);
  });

  it("a creature is judged as the permanent: an animated land goes in, and with no creature card there the whole library is revealed and kept", () => {
    const { game } = table();
    const vault = spawn(game, "Mutavault");
    spawn(game, "Wastes");
    activate(game, vault, 1);
    expect(types(game, vault)).toContain("creature");
    const bears = spawn(game, "Grizzly Bears", B);
    const before = library(game).length;
    const since = game.state.eventLog.length;
    castCollision(game);
    expect(zone(game, vault)).toBe("library");
    expect(creaturesOf(game, A)).toEqual(["Wastes"]);
    expect(library(game).length).toBe(before + 1);
    const reveals = game.state.eventLog.slice(since).filter((e) => e.type === "cards-revealed" && e.player === A);
    expect(reveals.flatMap((e) => (e as { objects: readonly ObjectId[] }).objects)).toHaveLength(before + 1);
    expect(zone(game, bears)).toBe("battlefield");
  });

  for (const toCommandZone of [false, true]) {
    it(`a commander whose owner ${toCommandZone ? "takes" : "declines"} the command zone ${toCommandZone ? "isn't" : "is"} shuffled in`, () => {
      const { game } = table();
      const general = spawn(game, "Grizzly Bears");
      game.state.objects[general].isCommander = true;
      const before = library(game).length;
      castCollision(game, false);
      game.advanceUntil((s) => s.awaiting?.kind === "commander-replacement" || quiet(s));
      const awaiting = game.state.awaiting;
      expect(awaiting?.kind === "commander-replacement" && awaiting.intendedZone).toBe("library");
      game.dispatch({ type: "commander-replacement", player: A, toCommandZone });
      game.advanceUntil(quiet);
      if (toCommandZone) {
        // Nothing of Alice's went in, so she reveals nothing.
        expect(zone(game, general)).toBe("command");
        expect(library(game).length).toBe(before);
      } else {
        // Shuffled in after all, and the only creature card there: found.
        expect(zone(game, general)).toBe("battlefield");
        expect(library(game).length).toBe(before);
      }
    });
  }
});
