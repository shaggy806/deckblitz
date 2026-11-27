/**
 * A `player-effect`'s `whileOnTop` and `libraryTopRevealed`: "until end of
 * turn, for as long as that card remains on top of your library, play with
 * the top card of your library revealed and you may play that card without
 * paying its mana cost" (Temporal Aperture). The effect ends for good the
 * moment that card isn't on top — played, covered, or the library shuffled
 * (the rulings) — and the next top card isn't reached.
 */
import { describe, expect, it } from "vitest";
import type { LegalAction } from "../actions.js";
import type { Game } from "../game.js";
import type { ObjectId } from "../primitives.js";
import { A, B, activate, cast, lands, spawn, table, toHand, zone } from "./harness.js";

type CastOffer = Extract<LegalAction, { kind: "cast-spell" }>;
const topOf = (game: Game): ObjectId => game.state.zones.perPlayer[A].library[0];
const offers = (game: Game, card: ObjectId): CastOffer[] =>
  game.legalActions(A).filter((a): a is CastOffer => a.kind === "cast-spell" && a.card === card);
const watches = (game: Game): number => (game.state.playerEffects ?? []).filter((e) => e.whileOnTop !== undefined).length;

describe("Temporal Aperture", () => {
  it("reveals the top card and lets it be cast free, then ends once it's gone", () => {
    const { game } = table({ deck: "Grizzly Bears" });
    const aperture = spawn(game, "Temporal Aperture");
    lands(game, "Wastes", 5);
    activate(game, aperture);
    const top = topOf(game);
    expect(game.viewFor(B).revealedLibraryTop[A]).toBe(top);
    // Every land is tapped for the ability: the Bears costs nothing.
    expect(offers(game, top).map((o) => o.via)).toEqual(["library-top"]);
    const [offer] = offers(game, top);
    cast(game, top, {
      via: offer.via,
      ...(offer.free === true ? { free: true } : {}),
      ...(offer.altCost === true ? { altCost: true } : {}),
    });
    expect(zone(game, top)).toBe("battlefield");
    expect(watches(game)).toBe(0);
    const next = topOf(game);
    expect(offers(game, next)).toEqual([]);
    expect(game.viewFor(B).revealedLibraryTop[A]).toBeNull();
  });

  it("ends when another card is put on top of it", () => {
    const { game, a } = table({ deck: "Grizzly Bears" });
    const aperture = spawn(game, "Temporal Aperture");
    const leashling = spawn(game, "Leashling");
    lands(game, "Wastes", 5);
    activate(game, aperture);
    const top = topOf(game);
    expect(watches(game)).toBe(1);
    const wastes = toHand(game, "Wastes");
    a.chooseFromZoneFn = ((_v: unknown, eligible: readonly string[]) => eligible.filter((id) => id === wastes)) as never;
    activate(game, leashling);
    expect(topOf(game)).toBe(wastes);
    expect(watches(game)).toBe(0);
    expect(offers(game, top)).toEqual([]);
    expect(game.viewFor(B).revealedLibraryTop[A]).toBeNull();
  });

  it("a shuffle ends it, even one that leaves the card on top", () => {
    const { game } = table({ deck: "Grizzly Bears" });
    const first = spawn(game, "Temporal Aperture");
    const second = spawn(game, "Temporal Aperture");
    lands(game, "Wastes", 10);
    activate(game, first);
    activate(game, second);
    // The second's shuffle ended the first's; only its own is left.
    expect(watches(game)).toBe(1);
    expect(game.state.playerEffects?.find((e) => e.whileOnTop !== undefined)?.whileOnTop?.card).toBe(topOf(game));
  });
});
