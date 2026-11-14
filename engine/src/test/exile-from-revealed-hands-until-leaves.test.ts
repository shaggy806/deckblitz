/**
 * Valki, God of Lies // Tibalt, Cosmic Impostor: each opponent reveals their
 * hand and a creature card from each is exiled until Valki leaves; "{X}:
 * choose a creature card exiled with Valki with mana value X. Valki becomes a
 * copy of that card". And an "as this enters" effect (`asEntersEffect`, rule
 * 614.1c) giving an emblem whose `linked` permission reads the cards exiled
 * with that Tibalt (create-emblem's `linkedToSource`, rule 607.2a), even
 * after it leaves.
 */
import { describe, expect, it } from "vitest";

import type { Game } from "../game.js";
import type { ObjectId } from "../primitives.js";
import { printedCardName } from "../state.js";
import { A, B, C, activate, cast, destroy, enter, hand, lands, nextTurn, pt, ref, settle, spawn, table, toGraveyard, toHand, toLibrary, zone } from "./harness.js";

describe("Valki, God of Lies", () => {
  it("exiles a creature card from each opponent's hand until it leaves", () => {
    const { game } = table({ players: 3 });
    const bears = toHand(game, "Grizzly Bears", B);
    const island = toHand(game, "Island", B);
    const giant = toHand(game, "Hill Giant", C);
    const valki = enter(game, "Valki, God of Lies");
    expect(zone(game, bears)).toBe("exile");
    expect(zone(game, giant)).toBe("exile");
    expect(zone(game, island)).toBe("hand");
    destroy(game, valki);
    settle(game);
    expect(hand(game, B)).toContain(bears);
    expect(hand(game, C)).toContain(giant);
  });

  it("gone before its trigger resolves, it exiles nothing", () => {
    const { game } = table();
    const bears = toHand(game, "Grizzly Bears", B);
    const valki = enter(game, "Valki, God of Lies", A, { settle: false });
    game.debugMove(valki, "graveyard");
    settle(game);
    expect(zone(game, bears)).toBe("hand");
  });

  it("{X}: becomes a copy of an exiled creature card with mana value X, and nothing with none", () => {
    const { game } = table();
    const giant = toHand(game, "Hill Giant", B);
    const valki = enter(game, "Valki, God of Lies");
    expect(zone(game, giant)).toBe("exile");
    lands(game, "Swamp", 6);
    activate(game, valki, 0, { x: 2 });
    expect(printedCardName(game.state.objects[valki])).toBe("Valki, God of Lies");
    activate(game, valki, 0, { x: 4 });
    expect(printedCardName(game.state.objects[valki])).toBe("Hill Giant");
    expect(pt(game, valki)).toEqual({ power: 3, toughness: 3 });
  });
});

/** Tibalt cast as the card's back face (its loyalty abilities by index:
 * the harness's `loyalty` reads the front face's name). */
function castTibalt(game: Game): ObjectId {
  lands(game, "Swamp", 6);
  lands(game, "Mountain", 1);
  const card = toHand(game, "Valki, God of Lies");
  cast(game, card, { face: 1 });
  return card;
}

describe("Tibalt, Cosmic Impostor", () => {
  it("gets its emblem as it enters, and the emblem plays what that Tibalt exiled, after it's gone too", () => {
    const { game } = table();
    const tibalt = castTibalt(game);
    expect(game.state.emblems.filter((e) => e.owner === A)).toHaveLength(1);
    expect(game.state.pendingTriggers).toHaveLength(0);
    const bobsTop = toLibrary(game, "Grizzly Bears", B);
    activate(game, tibalt, 0);
    expect(zone(game, bobsTop)).toBe("exile");
    // Any colour of mana pays for it.
    lands(game, "Mountain", 2);
    const castable = (id: ObjectId) =>
      game.legalActions(A).some((o) => o.kind === "cast-spell" && o.card === id);
    expect(castable(bobsTop)).toBe(true);
    // Tibalt leaves; the emblem still reaches what it exiled.
    destroy(game, tibalt);
    settle(game);
    expect(castable(bobsTop)).toBe(true);
    cast(game, bobsTop, { via: "impulse" });
    expect(zone(game, bobsTop)).toBe("battlefield");
  });

  it("−3 and −8 exile with Tibalt; −8 adds {R}{R}{R}", () => {
    const { game } = table();
    const tibalt = castTibalt(game);
    const bears = spawn(game, "Grizzly Bears", B);
    activate(game, tibalt, 1, { targets: [ref(bears)] });
    expect(zone(game, bears)).toBe("exile");
    const dead = toGraveyard(game, "Hill Giant", B);
    game.state.objects[tibalt].counters.loyalty = 8;
    nextTurn(game);
    nextTurn(game);
    activate(game, tibalt, 2);
    expect(zone(game, dead)).toBe("exile");
    expect(game.state.objects[dead].exiledWith?.source).toBe(tibalt);
    expect(game.state.players[A].manaPool.filter((unit) => unit.type === "R")).toHaveLength(3);
  });

  it("a card exiled with another permanent isn't the emblem's", () => {
    const { game } = table();
    castTibalt(game);
    lands(game, "Mountain", 2);
    const other = spawn(game, "Grizzly Bears", B);
    game.debugApplyEffect(A, { kind: "exile", target: 0 }, [ref(other)]);
    expect(zone(game, other)).toBe("exile");
    expect(game.legalActions(A).some((o) => o.kind === "cast-spell" && o.card === other)).toBe(false);
  });
});
