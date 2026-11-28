/**
 * "Discards all cards of each of the sacrificed creature's colors" (Mind
 * Extraction): a `discard-hand` filter of `sharesColorWith: { paid:
 * "sacrificed" }`, bound as the spell resolves to the colors the creature
 * sacrificed to cast it last had (rule 608.2h). A colorless one shares none
 * (rule 105.2c), so nothing is discarded.
 */
import { describe, expect, it } from "vitest";

import type { Game } from "../game.js";
import type { ObjectId } from "../primitives.js";
import { B, cast, lands, ref, spawn, table, toHand } from "./harness.js";

const handOf = (game: Game, player = B): readonly string[] =>
  game.state.zones.perPlayer[player].hand.map((id: ObjectId) => game.state.objects[id].cardName);

const stock = (game: Game): void => {
  for (const name of ["Lightning Bolt", "Boros Charm", "Giant Growth", "Forest", "Ornithopter"]) {
    game.debugSpawn(name, B, "hand");
  }
};

describe("shares a color with the sacrificed creature", () => {
  it("Mind Extraction: a red creature sacrificed discards every red card, a multicolored one included", () => {
    const { game } = table();
    const giant = spawn(game, "Hill Giant");
    spawn(game, "Grizzly Bears");
    lands(game, "Swamp", 3);
    stock(game);
    const before = handOf(game).length;
    cast(game, toHand(game, "Mind Extraction"), { targets: [ref(B)], sacrifice: giant });
    expect(game.state.objects[giant].zone).toBe("graveyard");
    const left = handOf(game);
    expect(left).not.toContain("Lightning Bolt");
    expect(left).not.toContain("Boros Charm");
    expect(left).toContain("Giant Growth");
    expect(left).toContain("Forest");
    expect(left).toContain("Ornithopter");
    expect(left.length).toBe(before - 2);
  });

  it("Mind Extraction: a colorless creature sacrificed discards nothing", () => {
    const { game } = table();
    const thopter = spawn(game, "Ornithopter");
    spawn(game, "Hill Giant");
    lands(game, "Swamp", 3);
    stock(game);
    const before = handOf(game).length;
    cast(game, toHand(game, "Mind Extraction"), { targets: [ref(B)], sacrifice: thopter });
    expect(game.state.objects[thopter].zone).toBe("graveyard");
    expect(handOf(game).length).toBe(before);
  });
});
