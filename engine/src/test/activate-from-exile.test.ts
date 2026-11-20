/**
 * Torrent Elemental: "Flying. Whenever this creature attacks, tap all
 * creatures defending player controls. {3}{B/G}{B/G}: Put this card from exile
 * onto the battlefield tapped. Activate only as a sorcery."
 *
 * An ability that moves its card out of exile works only there (rule 113.6m):
 * `zone: "exile"`, its owner's to activate (rule 602.2). A card exiled face
 * down has no characteristics (rule 406.3a), so no ability to activate.
 */

import { describe, expect, it } from "vitest";

import type { Game } from "../game.js";
import type { ObjectId } from "../primitives.js";
import { A, B, C, activate, attack, lands, spawn, table, toExile, toLibrary, toStep, zone } from "./harness.js";

const activatable = (game: Game, card: ObjectId, player = A): boolean =>
  game.legalActions(player).some((a) => a.kind === "activate-ability" && a.source === card);

describe("Torrent Elemental", () => {
  it("taps every creature the defending player controls when it attacks, and no one else's", () => {
    const { game, a } = table({ players: 3 });
    const torrent = spawn(game, "Torrent Elemental");
    const bobs = [spawn(game, "Grizzly Bears", B), spawn(game, "Hill Giant", B)];
    const carols = spawn(game, "Grizzly Bears", C);
    const mine = spawn(game, "Grizzly Bears");
    attack(game, a, [torrent], B);
    for (const id of bobs) expect(game.state.objects[id].tapped).toBe(true);
    expect(game.state.objects[carols].tapped).toBe(false);
    expect(game.state.objects[mine].tapped).toBe(false);
  });

  it("puts itself from exile onto the battlefield tapped, as a sorcery, by its owner", () => {
    const { game } = table();
    const torrent = toExile(game, "Torrent Elemental");
    lands(game, "Swamp", 2);
    lands(game, "Forest", 3);
    expect(activatable(game, torrent)).toBe(true);
    expect(activatable(game, torrent, B)).toBe(false);
    activate(game, torrent);
    expect(zone(game, torrent)).toBe("battlefield");
    expect(game.state.objects[torrent].tapped).toBe(true);
  });

  it("can't be activated outside a main phase with the stack empty", () => {
    const { game } = table();
    const torrent = toExile(game, "Torrent Elemental");
    lands(game, "Swamp", 5);
    toStep(game, "end");
    expect(activatable(game, torrent)).toBe(false);
  });

  it("has no ability while exiled face down", () => {
    const { game } = table();
    const torrent = toLibrary(game, "Torrent Elemental");
    game.debugApplyEffect(A, { kind: "exile-from-library", amount: 1, faceDown: true }, []);
    expect(zone(game, torrent)).toBe("exile");
    lands(game, "Swamp", 5);
    expect(activatable(game, torrent)).toBe(false);
    expect(() => activate(game, torrent)).toThrow();
  });
});
