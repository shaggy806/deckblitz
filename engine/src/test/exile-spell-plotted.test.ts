/**
 * Exiling a target spell and plotting it (rule 702.170 — Aven Interrupter's
 * "exile target spell. It becomes plotted"): the spell leaves the stack
 * without resolving, its owner may cast the card free from exile as a sorcery
 * on a later turn (702.170d) — and a cost increase still applies to that free
 * cast (rule 601.2f: Aven Interrupter's own "spells your opponents cast from
 * exile cost {2} more").
 */
import { describe, expect, it } from "vitest";
import type { LegalAction } from "../actions.js";
import type { Game } from "../game.js";
import type { ObjectId, PlayerId } from "../primitives.js";
import { activePlayerOf } from "../state.js";
import { A, B, cast, destroy, lands, nextTurn, table, toHand, zone } from "./harness.js";

type CastOffer = Extract<LegalAction, { kind: "cast-spell" }>;
const plotOffers = (game: Game, card: ObjectId, player: PlayerId): CastOffer[] =>
  game.legalActions(player).filter((a): a is CastOffer => a.kind === "cast-spell" && a.card === card && a.via === "plot");

const tapAll = (game: Game, player: PlayerId): void => {
  for (const id of game.state.zones.shared.battlefield) {
    if (game.state.objects[id].controller === player) game.state.objects[id].tapped = true;
  }
};

/** Bob casts `name` on his turn; Alice flashes in Aven Interrupter on it. */
const interrupted = (game: Game, name: string): { spell: ObjectId; aven: ObjectId } => {
  lands(game, "Plains", 3);
  nextTurn(game);
  lands(game, "Forest", 2, B);
  const spell = toHand(game, name, B);
  cast(game, spell, { player: B, settle: false });
  game.dispatch({ type: "pass-priority", player: B });
  const aven = toHand(game, "Aven Interrupter");
  cast(game, aven);
  return { spell, aven };
};

describe("Aven Interrupter", () => {
  it("exiles the spell, plotted, and it doesn't resolve", () => {
    const { game } = table();
    const { spell, aven } = interrupted(game, "Grizzly Bears");
    expect(zone(game, aven)).toBe("battlefield");
    expect(zone(game, spell)).toBe("exile");
    expect(game.state.objects[spell].plottedOnTurn).toBe(game.state.turn.number);
    expect(game.state.zones.shared.stack).toEqual([]);
    // Not this turn (the rulings).
    expect(plotOffers(game, spell, B)).toEqual([]);
  });

  it("lets its owner cast it free on a later turn — with the Interrupter's {2} on top", () => {
    const { game } = table();
    const { spell } = interrupted(game, "Grizzly Bears");
    nextTurn(game);
    nextTurn(game);
    expect(activePlayerOf(game.state)).toBe(B);
    // Bob's two Forests pay the {2} the Interrupter adds to a cast from exile.
    const [offer] = plotOffers(game, spell, B);
    expect(offer).toBeDefined();
    cast(game, spell, { player: B, via: "plot", free: true });
    expect(zone(game, spell)).toBe("battlefield");
    expect(game.state.objects[spell].controller).toBe(B);
  });

  it("without the mana for the tax, the plotted card can't be cast; with the Interrupter gone it's free", () => {
    const { game } = table();
    const { spell, aven } = interrupted(game, "Grizzly Bears");
    nextTurn(game);
    nextTurn(game);
    tapAll(game, B);
    expect(plotOffers(game, spell, B)).toEqual([]);
    destroy(game, aven, B);
    expect(zone(game, aven)).toBe("graveyard");
    expect(plotOffers(game, spell, B).length).toBe(1);
    cast(game, spell, { player: B, via: "plot", free: true });
    expect(zone(game, spell)).toBe("battlefield");
  });

  it("an Interrupter's own spell is exiled and plotted for its owner too", () => {
    const { game } = table();
    lands(game, "Plains", 3);
    lands(game, "Forest", 1);
    const bears = toHand(game, "Llanowar Elves");
    cast(game, bears, { settle: false });
    const aven = toHand(game, "Aven Interrupter");
    cast(game, aven);
    expect(zone(game, aven)).toBe("battlefield");
    expect(zone(game, bears)).toBe("exile");
    nextTurn(game);
    nextTurn(game);
    expect(activePlayerOf(game.state)).toBe(A);
    // Alice is no opponent of her own Interrupter: free, no tax.
    tapAll(game, A);
    expect(plotOffers(game, bears, A).length).toBe(1);
    expect(plotOffers(game, bears, B)).toEqual([]);
  });
});
