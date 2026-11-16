/**
 * "You may spend mana from snow sources as though it were mana of any color
 * to cast those spells" (`SpendUnitAs`'s `unit: "snow"`, rule 609.4b): each
 * coloured pip of a spell cast under the permission may be paid by one mana a
 * snow source made, whatever its type — planned as an `{S}` pip is (rule
 * 107.4h). Draugr Necromancer: opponents' nontoken creatures that would die
 * are exiled with an ice counter instead, and its controller may cast spells
 * from among opponent-owned cards in exile with ice counters on them.
 */
import { describe, expect, it } from "vitest";

import type { Game } from "../game.js";
import type { ObjectId } from "../primitives.js";

import { A, B, counters, destroy, lands, ref, settle, spawn, table, zone } from "./harness.js";

const castable = (game: Game, card: ObjectId): boolean =>
  game.legalActions(A).some((a) => a.kind === "cast-spell" && a.card === card);

/** Bob's Grizzly Bears, killed under Draugr Necromancer: exiled, iced. */
function icedBears(game: Game): ObjectId {
  const bears = spawn(game, "Grizzly Bears", B);
  destroy(game, bears);
  expect(zone(game, bears)).toBe("exile");
  expect(counters(game, bears, "ice")).toBe(1);
  return bears;
}

describe("Draugr Necromancer", () => {
  it("exiles an opponent's nontoken creature that would die, with an ice counter, and not its own", () => {
    const { game } = table();
    spawn(game, "Draugr Necromancer");
    icedBears(game);
    const mine = spawn(game, "Grizzly Bears");
    destroy(game, mine);
    expect(zone(game, mine)).toBe("graveyard");
  });

  it("casts an iced card with mana from snow sources spent as though it were any color", () => {
    const { game } = table();
    spawn(game, "Draugr Necromancer");
    const bears = icedBears(game);
    lands(game, "Snow-Covered Swamp", 2);
    expect(castable(game, bears)).toBe(true);
    const offer = game.legalActions(A).find((a) => a.kind === "cast-spell" && a.card === bears);
    if (offer?.kind !== "cast-spell") throw new Error("not offered");
    game.dispatch({ type: "cast-spell", player: A, card: bears, targets: [], ...(offer.via !== undefined ? { via: offer.via } : {}) });
    settle(game);
    expect(zone(game, bears)).toBe("battlefield");
    expect(game.state.objects[bears].controller).toBe(A);
  });

  it("a snow source's mana pays the coloured pip beside a non-snow source on the generic", () => {
    const { game } = table();
    spawn(game, "Draugr Necromancer");
    const bears = icedBears(game);
    lands(game, "Snow-Covered Swamp", 1);
    lands(game, "Plains", 1);
    expect(castable(game, bears)).toBe(true);
  });

  it("mana from a source that isn't snow isn't spent as any color", () => {
    const { game } = table();
    spawn(game, "Draugr Necromancer");
    const bears = icedBears(game);
    lands(game, "Swamp", 2);
    expect(castable(game, bears)).toBe(false);
  });

  it("only for spells cast this way: a spell from the hand pays its colours as ever", () => {
    const { game } = table();
    spawn(game, "Draugr Necromancer");
    lands(game, "Snow-Covered Swamp", 2);
    const inHand = game.debugSpawn("Grizzly Bears", A, "hand");
    expect(castable(game, inHand)).toBe(false);
  });

  it("not a card in exile without an ice counter, nor one it owns", () => {
    const { game } = table();
    spawn(game, "Draugr Necromancer");
    lands(game, "Snow-Covered Swamp", 2);
    lands(game, "Forest", 2);
    const plain = game.debugSpawn("Grizzly Bears", B, "exile");
    expect(castable(game, plain)).toBe(false);
    // Alice's own creature, controlled by Bob, dies: iced, but hers.
    const hers = spawn(game, "Grizzly Bears");
    game.debugApplyEffect(B, { kind: "gain-control", target: 0, untilEndOfTurn: false }, [ref(hers)]);
    expect(game.state.objects[hers].controller).toBe(B);
    destroy(game, hers);
    expect(counters(game, hers, "ice")).toBe(1);
    expect(castable(game, hers)).toBe(false);
  });
});
