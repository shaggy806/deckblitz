/**
 * A search's exiled finds castable later, for a window of the card's own
 * (`search-library`'s `playable` as an `ExilePermission`): Ugin, Eye of the
 * Storms' "until end of turn, you may cast those cards without paying their
 * mana costs", Chandra, Heart of Fire's "you may cast them this turn".
 */
import { describe, expect, it } from "vitest";
import type { ObjectId } from "../primitives.js";
import {
  A,
  B,
  cast,
  lands,
  loyalty,
  nextTurn,
  pickFromZone,
  pickTargets,
  ref,
  spawn,
  table,
  toGraveyard,
  toHand,
  toLibrary,
  watchTargets,
  zone,
} from "./harness.js";
import type { Game } from "../game.js";

const castOffers = (game: Game, card: ObjectId) =>
  game.legalActions(A).filter((o) => o.kind === "cast-spell" && o.card === card);

describe("Ugin, Eye of the Storms", () => {
  it("−11: the colorless nonland finds are exiled, free to cast this turn and only this turn", () => {
    const { game, a } = table();
    const ring = toLibrary(game, "Sol Ring");
    const thopter = toLibrary(game, "Ornithopter");
    const wastes = toLibrary(game, "Wastes");
    const bolt = toLibrary(game, "Lightning Bolt");
    const ugin = spawn(game, "Ugin, Eye of the Storms");
    const search = pickFromZone(a, ring, thopter);
    loyalty(game, ugin, -11, { atLeast: 11 });
    expect(search.offered).toContain(ring);
    expect(search.offered).toContain(thopter);
    expect(search.offered).not.toContain(wastes);
    expect(search.offered).not.toContain(bolt);
    expect(zone(game, ring)).toBe("exile");
    expect(zone(game, thopter)).toBe("exile");
    // Cast after the ability has resolved — free, and only free: no land to pay with.
    const offers = castOffers(game, ring);
    expect(offers.length).toBeGreaterThan(0);
    expect(offers.every((o) => o.kind === "cast-spell" && o.free === true)).toBe(true);
    cast(game, ring, { via: "impulse", free: true });
    expect(zone(game, ring)).toBe("battlefield");
    // The other find lapses with the turn.
    expect(castOffers(game, thopter).length).toBeGreaterThan(0);
    nextTurn(game);
    nextTurn(game);
    expect(zone(game, thopter)).toBe("exile");
    expect(castOffers(game, thopter)).toHaveLength(0);
  });

  it("casting it exiles up to one colored permanent; colorless ones aren't offered", () => {
    const { game, a } = table();
    const bears = spawn(game, "Grizzly Bears", B);
    const myr = spawn(game, "Ornithopter", B);
    lands(game, "Wastes", 7);
    const seen = watchTargets(a, () => [bears]);
    cast(game, toHand(game, "Ugin, Eye of the Storms"));
    expect(seen.asked).toBe(1);
    expect(seen.offered[0]).toContain(bears);
    expect(seen.offered[0]).not.toContain(myr);
    expect(zone(game, bears)).toBe("exile");
  });

  it("whenever its controller casts a colorless spell, exiles up to one colored permanent", () => {
    const { game, a } = table();
    const bears = spawn(game, "Grizzly Bears", B);
    spawn(game, "Ugin, Eye of the Storms");
    lands(game, "Wastes", 1);
    pickTargets(a, bears);
    cast(game, toHand(game, "Sol Ring"));
    expect(zone(game, bears)).toBe("exile");
  });
});

describe("Chandra, Heart of Fire", () => {
  it("−9: red instants and sorceries from graveyard and library, castable this turn paying their costs, and six {R}", () => {
    const { game, a } = table();
    const yardBolt = toGraveyard(game, "Lightning Bolt");
    const libBolt = toLibrary(game, "Lightning Bolt");
    const growth = toLibrary(game, "Giant Growth");
    const chandra = spawn(game, "Chandra, Heart of Fire");
    const search = pickFromZone(a, yardBolt, libBolt);
    loyalty(game, chandra, -9, { atLeast: 9 });
    expect(search.offered).toContain(yardBolt);
    expect(search.offered).toContain(libBolt);
    expect(search.offered).not.toContain(growth);
    expect(zone(game, yardBolt)).toBe("exile");
    expect(zone(game, libBolt)).toBe("exile");
    expect(game.state.players[A].manaPool.filter((u) => u.type === "R")).toHaveLength(6);
    // Paid for, from the six {R}.
    cast(game, yardBolt, { via: "impulse", targets: [ref(B)] });
    expect(game.state.players[B].life).toBe(17);
    expect(game.state.players[A].manaPool.filter((u) => u.type === "R")).toHaveLength(5);
    nextTurn(game);
    expect(castOffers(game, libBolt)).toHaveLength(0);
  });
});
