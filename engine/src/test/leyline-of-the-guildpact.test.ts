/**
 * Leyline of the Guildpact — "each nonland permanent you control is all
 * colors" is `setColors` over a filter, in layer 5 (rule 613.1e); "lands you
 * control are every basic land type in addition to their other types" is
 * `addSubtypes` (rule 305.7), and the opening hand is `beginsOnBattlefield`.
 */
import { describe, expect, it } from "vitest";

import { effectiveColors } from "../characteristics.js";
import { Game } from "../game.js";
import { asPlayerId } from "../primitives.js";
import type { ObjectId } from "../primitives.js";
import { A, B, cast, lands, registryOf, spawn, subtypes, table, toHand, zone } from "./harness.js";

const colorsOf = (game: Game, id: ObjectId): string[] =>
  [...effectiveColors(game.state, registryOf(game), game.state.objects[id])].sort();
const ALL = ["B", "G", "R", "U", "W"];

describe("Leyline of the Guildpact", () => {
  it("makes each nonland permanent you control all colors, itself too, and no land or opponent's", () => {
    const { game } = table();
    const leyline = spawn(game, "Leyline of the Guildpact");
    const bear = spawn(game, "Grizzly Bears");
    const staff = spawn(game, "Sol Ring");
    const forest = spawn(game, "Forest");
    const theirs = spawn(game, "Grizzly Bears", B);
    expect(colorsOf(game, leyline)).toEqual(ALL);
    expect(colorsOf(game, bear)).toEqual(ALL);
    expect(colorsOf(game, staff)).toEqual(ALL);
    expect(colorsOf(game, forest)).toEqual([]);
    expect(colorsOf(game, theirs)).toEqual(["G"]);
  });

  it("is read as all colors by what asks: Iridian Maelstrom spares yours", () => {
    const { game } = table();
    spawn(game, "Leyline of the Guildpact");
    const bear = spawn(game, "Grizzly Bears");
    const theirs = spawn(game, "Grizzly Bears", B);
    lands(game, "Plains", 1);
    lands(game, "Island", 1);
    lands(game, "Swamp", 1);
    lands(game, "Mountain", 1);
    lands(game, "Forest", 1);
    lands(game, "Wastes", 1);
    cast(game, toHand(game, "Iridian Maelstrom"));
    expect(zone(game, bear)).toBe("battlefield");
    expect(zone(game, theirs)).toBe("graveyard");
  });

  it("gives your lands every basic land type on top of their own, and their mana", () => {
    const { game } = table();
    spawn(game, "Leyline of the Guildpact");
    const wastes = spawn(game, "Wastes");
    const theirs = spawn(game, "Wastes", B);
    expect(subtypes(game, wastes)).toEqual(expect.arrayContaining(["Plains", "Island", "Swamp", "Mountain", "Forest"]));
    expect(subtypes(game, theirs)).toEqual([]);
    // Wastes taps for {U} now, so Opt's single blue is paid by it alone.
    const opt = toHand(game, "Opt");
    cast(game, opt);
    expect(zone(game, opt)).toBe("graveyard");
  });

  it("can begin the game on the battlefield from your opening hand", () => {
    const game = Game.create({
      seed: 7,
      shuffle: false,
      startingPlayer: A,
      decks: [
        { player: asPlayerId("alice"), cards: ["Leyline of the Guildpact", ...Array<string>(39).fill("Forest")] },
        { player: asPlayerId("bob"), cards: Array<string>(40).fill("Forest") },
      ],
    });
    const awaiting = game.state.awaiting;
    if (awaiting?.kind !== "choose-from-zone") throw new Error(`expected a zone choice, got ${awaiting?.kind}`);
    expect(awaiting.destination).toBe("battlefield");
    game.dispatch({ type: "choose-from-zone", player: A, chosen: [...awaiting.eligible] });
    const leyline = game.state.zones.shared.battlefield.find((id) => game.state.objects[id].cardName === "Leyline of the Guildpact");
    expect(leyline).toBeDefined();
  });
});
