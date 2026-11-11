/**
 * "Exile a face-down permanent you control face up: You may play that card
 * this turn" (Primordial Mist): the cost exiles one chosen face-down permanent
 * (`exilesSacrifice` over a `faceDown` filter — no sacrifice), the card lies
 * face up in exile, and its owner's controller may play it this turn at its
 * own timing and for its own costs (the rulings); unplayed, it stays exiled.
 */

import { describe, expect, it } from "vitest";

import { A, activate, cast, lands, nextTurn, pickModes, spawn, table, toLibrary, toStep, zone } from "./harness.js";
import type { LegalAction } from "../actions.js";
import type { Game } from "../game.js";
import type { ObjectId } from "../primitives.js";

const faceDown = (game: Game): ObjectId[] =>
  game.state.zones.shared.battlefield.filter((id) => game.state.objects[id].faceDown !== undefined);

/** What alice is offered for `card`: casting it, or playing it as a land. */
const playOffers = (game: Game, card: ObjectId): LegalAction[] =>
  game.legalActions(A).filter((o) => (o.kind === "cast-spell" || o.kind === "play-land") && o.card === card);

/** Alice's Primordial Mist and one manifested `card`. */
function manifested(card: string): { game: Game; mist: ObjectId; hidden: ObjectId } {
  const { game, a } = table();
  const mist = spawn(game, "Primordial Mist");
  toLibrary(game, card);
  pickModes(a, 0);
  toStep(game, "end");
  game.advanceUntil((s) => s.zones.shared.stack.length === 0 && s.awaiting === null);
  const [hidden] = faceDown(game);
  nextTurn(game); // bob's
  nextTurn(game); // alice's main phase
  return { game, mist, hidden };
}

describe("Primordial Mist", () => {
  it("may manifest the top card of the library at its controller's end step", () => {
    const { game, hidden } = manifested("Grizzly Bears");
    expect(hidden).toBeDefined();
    expect(game.state.objects[hidden].controller).toBe(A);
  });

  it("declining manifests nothing", () => {
    const { game, a } = table();
    spawn(game, "Primordial Mist");
    toLibrary(game, "Grizzly Bears");
    pickModes(a);
    toStep(game, "end");
    game.advanceUntil((s) => s.zones.shared.stack.length === 0 && s.awaiting === null);
    expect(faceDown(game)).toHaveLength(0);
  });

  it("exiles the face-down permanent face up as the cost, and the card can be cast this turn for its cost", () => {
    const { game, mist, hidden } = manifested("Grizzly Bears");
    lands(game, "Forest", 2);
    activate(game, mist, 0, { sacrifice: hidden });
    const card = game.state.objects[hidden];
    expect(card.zone).toBe("exile");
    expect(card.faceDown).toBeUndefined();
    expect(card.exiledFaceDown).toBeUndefined();
    const [offer] = playOffers(game, hidden);
    expect(offer?.kind).toBe("cast-spell");
    cast(game, hidden, { via: offer?.kind === "cast-spell" ? offer.via : undefined });
    expect(zone(game, hidden)).toBe("battlefield");
    expect(game.state.objects[hidden].faceDown).toBeUndefined();
    // Its cost was paid.
    expect(game.state.zones.shared.battlefield.filter((id) => game.state.objects[id].tapped)).toHaveLength(2);
  });

  it("the card can't be cast without paying for it", () => {
    const { game, mist, hidden } = manifested("Grizzly Bears");
    activate(game, mist, 0, { sacrifice: hidden });
    expect(playOffers(game, hidden)).toHaveLength(0);
  });

  it("a land exiled this way is played as the turn's land play", () => {
    const { game, mist, hidden } = manifested("Forest");
    activate(game, mist, 0, { sacrifice: hidden });
    expect(zone(game, hidden)).toBe("exile");
    const [offer] = playOffers(game, hidden);
    expect(offer?.kind).toBe("play-land");
    game.dispatch({ type: "play-land", player: A, card: hidden });
    expect(zone(game, hidden)).toBe("battlefield");
    expect(game.state.objects[hidden].faceDown).toBeUndefined();
  });

  it("timing rules still apply: a creature card can't be cast in the end step", () => {
    const { game, mist, hidden } = manifested("Grizzly Bears");
    lands(game, "Forest", 2);
    toStep(game, "end");
    // The Mist's own end-step trigger resolves first (it manifests again).
    game.advanceUntil((s) => s.zones.shared.stack.length === 0 && s.awaiting === null && s.priority.holder === A);
    activate(game, mist, 0, { sacrifice: hidden, settle: false });
    game.advanceUntil((s) => s.zones.shared.stack.length === 0 && s.awaiting === null && s.priority.holder === A);
    expect(game.state.turn.step).toBe("end");
    expect(zone(game, hidden)).toBe("exile");
    expect(playOffers(game, hidden)).toHaveLength(0);
  });

  it("unplayed, the card stays in exile and the permission ends with the turn", () => {
    const { game, mist, hidden } = manifested("Grizzly Bears");
    activate(game, mist, 0, { sacrifice: hidden });
    nextTurn(game); // bob's
    nextTurn(game); // alice's
    lands(game, "Forest", 2);
    expect(zone(game, hidden)).toBe("exile");
    expect(playOffers(game, hidden)).toHaveLength(0);
  });

  it("can't be activated with no face-down permanent, nor by exiling a face-up one", () => {
    const { game } = table();
    const mist = spawn(game, "Primordial Mist");
    const bears = spawn(game, "Grizzly Bears");
    expect(
      game.canDispatch({ type: "activate-ability", player: A, source: mist, abilityIndex: 0, targets: [], sacrifice: bears }),
    ).not.toBeNull();
    expect(game.canDispatch({ type: "activate-ability", player: A, source: mist, abilityIndex: 0, targets: [] })).not.toBeNull();
  });
});
