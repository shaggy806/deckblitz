/**
 * Blitz with a cost that isn't only mana, and from the graveyard (rule
 * 702.152a; `keyword:blitz-extensions`): `blitz.also` — "Blitz—{2}{R}{R},
 * Discard a card" (Sabin, Master Monk), "Blitz—{2}{B}{B}, Pay 2 life"
 * (Tenacious Underdog), paid with the mana as the spell is cast (rule 601.2h)
 * and gating the cast (119.4) — and `blitz.fromGraveyard`, "you may cast this
 * card from your graveyard using its blitz ability": its blitz cost alone, a
 * spell cast from a graveyard in every way.
 */
import { describe, expect, it } from "vitest";

import type { Game } from "../game.js";
import type { ObjectId } from "../primitives.js";
import { A, cast, graveyard, hand, keywords, lands, life, nextTurn, spawn, table, toGraveyard, toHand, zone } from "./harness.js";

const casts = (game: Game, card: ObjectId) =>
  game.legalActions(A).filter((a) => a.kind === "cast-spell" && a.card === card) as readonly { readonly via?: string }[];

describe("Tenacious Underdog: Blitz—{2}{B}{B}, Pay 2 life, from the hand or the graveyard", () => {
  it("from the hand: its mana cost or its blitz cost, the blitz paying 2 life", () => {
    const { game } = table();
    lands(game, "Swamp", 4);
    const underdog = toHand(game, "Tenacious Underdog");
    expect(casts(game, underdog).map((a) => a.via).sort()).toEqual(["blitz", undefined]);
    cast(game, underdog, { via: "blitz" });
    expect(zone(game, underdog)).toBe("battlefield");
    expect(life(game)).toBe(18);
    expect([...keywords(game, underdog)]).toContain("haste");
  });

  it("from the graveyard: only for its blitz cost, then sacrificed at the end step and a card drawn", () => {
    const { game } = table();
    lands(game, "Swamp", 4);
    const underdog = toGraveyard(game, "Tenacious Underdog");
    expect(casts(game, underdog).map((a) => a.via)).toEqual(["blitz"]);
    // Its mana cost isn't a way out of the graveyard.
    expect(game.canDispatch({ type: "cast-spell", player: A, card: underdog, targets: [] })).not.toBeNull();
    cast(game, underdog, { via: "blitz" });
    expect(zone(game, underdog)).toBe("battlefield");
    expect(life(game)).toBe(18);
    expect(game.state.objects[underdog].castVia).toBe("blitz");
    // A spell cast from a graveyard, for what counts those (Laboratory Drudge).
    expect(game.state.players[A].usedGraveyardThisTurn).toBe(true);
    const before = hand(game).length;
    nextTurn(game);
    expect(zone(game, underdog)).toBe("graveyard");
    // Its "when this creature dies, draw a card".
    expect(hand(game).length).toBe(before + 1);
  });

  it("can't be blitzed without 2 life to pay (rule 119.4)", () => {
    const { game } = table({ life: 1 });
    lands(game, "Swamp", 4);
    const underdog = toGraveyard(game, "Tenacious Underdog");
    expect(casts(game, underdog)).toHaveLength(0);
    expect(game.canDispatch({ type: "cast-spell", player: A, card: underdog, targets: [], via: "blitz" })).toMatch(/life/);
  });

  it("Grafdigger's Cage stops the graveyard cast", () => {
    const { game } = table();
    lands(game, "Swamp", 4);
    spawn(game, "Grafdigger's Cage");
    const underdog = toGraveyard(game, "Tenacious Underdog");
    expect(casts(game, underdog)).toHaveLength(0);
  });
});

describe("Sabin, Master Monk: Blitz—{2}{R}{R}, Discard a card, from the hand or the graveyard", () => {
  it("from the graveyard: the discard is chosen and paid as it's cast", () => {
    const { game, a } = table();
    lands(game, "Mountain", 4);
    const sabin = toGraveyard(game, "Sabin, Master Monk");
    const keep = toHand(game, "Grizzly Bears");
    const pitch = toHand(game, "Lightning Bolt");
    a.chooseDiscardsFn = (cards) => cards.filter((card) => card.id === pitch).map((card) => card.id);
    expect(casts(game, sabin).map((a) => a.via)).toEqual(["blitz"]);
    cast(game, sabin, { via: "blitz" });
    expect(zone(game, sabin)).toBe("battlefield");
    expect(graveyard(game)).toContain(pitch);
    expect(hand(game)).toContain(keep);
    expect([...keywords(game, sabin)]).toEqual(expect.arrayContaining(["haste", "double-strike"]));
  });

  it("isn't offered with no other card to discard", () => {
    const { game } = table({ openingHandSize: 0 });
    // The turn's draw: discarded first, so the hand is empty but for Sabin.
    for (const card of [...hand(game)]) game.debugMove(card, "graveyard");
    lands(game, "Mountain", 5);
    // In hand alone: its mana cost, not its blitz cost (it can't discard itself).
    const sabin = toHand(game, "Sabin, Master Monk");
    expect(casts(game, sabin).map((a) => a.via)).toEqual([undefined]);
    // In the graveyard with an empty hand: nothing.
    game.debugMove(sabin, "graveyard");
    expect(hand(game)).toHaveLength(0);
    expect(casts(game, sabin)).toHaveLength(0);
    expect(game.canDispatch({ type: "cast-spell", player: A, card: sabin, targets: [], via: "blitz" })).toMatch(
      /too few cards in hand/,
    );
  });

  it("from the hand, it discards another card, not itself", () => {
    const { game } = table();
    lands(game, "Mountain", 4);
    const sabin = toHand(game, "Sabin, Master Monk");
    const handBefore = hand(game).length;
    cast(game, sabin, { via: "blitz" });
    expect(zone(game, sabin)).toBe("battlefield");
    expect(hand(game).length).toBe(handBefore - 2);
  });
});
