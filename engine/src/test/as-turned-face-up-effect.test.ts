/**
 * "As this Aura is turned face up, you may attach it to a creature" (Gift of
 * Doom — `CardDefinition.asTurnedFaceUp`'s `effect`): done by its controller
 * as it's turned, nothing targeted, before any state-based action is checked
 * (rule 704.3) — so the Aura, on the battlefield attached to nothing, isn't
 * put into a graveyard (704.5m) unless it's left unattached.
 *
 * - its morph cost ("Sacrifice another creature") is paid first, its choice
 *   answered while it's still face down (702.37e), so what's sacrificed is
 *   never offered as a host;
 * - a hexproof creature may be chosen (not targeted), one with protection
 *   from black may not (the rulings);
 * - declined, or with no creature to go on, it's put into the graveyard;
 * - turned up by an effect, the same choice;
 * - the player who turned it has priority afterward (116.3), on any turn.
 */
import { describe, expect, it } from "vitest";

import type { Action } from "../actions.js";
import type { Game } from "../game.js";
import type { ObjectId } from "../primitives.js";
import { activePlayerOf } from "../state.js";
import { A, B, activate, cast, enter, keywords, lands, nextTurn, pickPermanents, ref, settle, spawn, table, toHand, zone } from "./harness.js";

/** Gift of Doom cast face down for {3}: a 2/2 creature, nothing targeted. */
function faceDownGift(game: Game): ObjectId {
  lands(game, "Wastes", 3);
  const gift = toHand(game, "Gift of Doom");
  cast(game, gift, { via: "face-down", settle: true });
  expect(game.state.objects[gift].faceDown).toBeDefined();
  expect(zone(game, gift)).toBe("battlefield");
  return gift;
}

const offered = (game: Game, gift: ObjectId): boolean =>
  game.legalActions(A).some((a) => a.kind === "turn-face-up" && a.permanent === gift);

const turnUp = (game: Game, gift: ObjectId): void => {
  game.dispatch({ type: "turn-face-up", player: A, permanent: gift, morph: true } as Action);
};

describe("Gift of Doom", () => {
  it("is turned up for another creature, then attached to a creature of its controller's choice", () => {
    const { game, a } = table();
    const gift = faceDownGift(game);
    // Itself, face down, is a creature — and never pays its own cost.
    expect(offered(game, gift)).toBe(false);
    const fodder = enter(game, "Grizzly Bears");
    const bears = enter(game, "Grizzly Bears");
    const scout = enter(game, "Gladecover Scout", B);
    const knight = enter(game, "White Knight", B);
    expect(offered(game, gift)).toBe(true);
    a.chooseSacrificesFn = () => [fodder];
    const seen = pickPermanents(a, bears);
    turnUp(game, gift);
    settle(game);
    expect(zone(game, fodder)).toBe("graveyard");
    // The hexproof Scout may be chosen; the Knight (protection from black)
    // and the creature sacrificed may not.
    expect([...seen.offered].sort()).toEqual([bears, scout].sort());
    expect(seen.offered).not.toContain(knight);
    expect(zone(game, gift)).toBe("battlefield");
    expect(game.state.objects[gift].faceDown).toBeUndefined();
    expect(game.state.objects[gift].attachedTo).toBe(bears);
    expect(keywords(game, bears).has("deathtouch")).toBe(true);
    expect(keywords(game, bears).has("indestructible")).toBe(true);
  });

  it("stays face down, on the battlefield, while its cost's choice is being answered", () => {
    const { game, a } = table();
    const gift = faceDownGift(game);
    const fodder = enter(game, "Grizzly Bears");
    const bears = enter(game, "Grizzly Bears");
    turnUp(game, gift);
    // Two creatures could pay: asked, with nothing turned yet.
    expect(game.state.awaiting?.kind).toBe("sacrifice");
    expect(game.state.objects[gift].faceDown).toBeDefined();
    game.dispatch({ type: "sacrifice", player: A, permanents: [fodder] } as Action);
    // Now it's face up and the host is asked, before any state-based action.
    expect(game.state.awaiting?.kind).toBe("choose-permanents");
    expect(game.state.objects[gift].faceDown).toBeUndefined();
    expect(zone(game, gift)).toBe("battlefield");
    pickPermanents(a, bears);
    settle(game);
    expect(game.state.objects[gift].attachedTo).toBe(bears);
  });

  it("can go on an opponent's hexproof creature", () => {
    const { game, a } = table();
    const gift = faceDownGift(game);
    enter(game, "Grizzly Bears");
    const scout = enter(game, "Gladecover Scout", B);
    pickPermanents(a, scout);
    turnUp(game, gift);
    settle(game);
    expect(game.state.objects[gift].attachedTo).toBe(scout);
    expect(keywords(game, scout).has("indestructible")).toBe(true);
  });

  it("is put into its owner's graveyard if it's attached to nothing", () => {
    const { game, a } = table();
    const gift = faceDownGift(game);
    enter(game, "Grizzly Bears");
    enter(game, "Hill Giant", B);
    pickPermanents(a);
    turnUp(game, gift);
    settle(game);
    expect(zone(game, gift)).toBe("graveyard");
  });

  it("with no creature left to go on, nothing is asked and it's put into the graveyard", () => {
    const { game, a } = table();
    const gift = faceDownGift(game);
    const fodder = enter(game, "Grizzly Bears");
    const seen = pickPermanents(a);
    turnUp(game, gift);
    settle(game);
    expect(zone(game, fodder)).toBe("graveyard");
    expect(seen.offered).toEqual([]);
    expect(zone(game, gift)).toBe("graveyard");
  });

  it("turned face up by an effect, is attached the same way", () => {
    const { game, a } = table();
    const gift = faceDownGift(game);
    const bears = enter(game, "Grizzly Bears");
    // "{2}{U}: Turn target face-down creature face up": nothing sacrificed.
    const ixidor = spawn(game, "Ixidor, Reality Sculptor");
    lands(game, "Island", 3);
    const seen = pickPermanents(a, bears);
    activate(game, ixidor, 0, { targets: [ref(gift)] });
    expect([...seen.offered].sort()).toEqual([bears, ixidor].sort());
    expect(zone(game, bears)).toBe("battlefield");
    expect(game.state.objects[gift].attachedTo).toBe(bears);
  });

  it("leaves priority with the player who turned it, on another player's turn", () => {
    const { game } = table();
    const gift = faceDownGift(game);
    const fodder = enter(game, "Grizzly Bears");
    const bears = enter(game, "Grizzly Bears");
    nextTurn(game);
    expect(activePlayerOf(game.state)).toBe(B);
    // B passes; A has priority in B's upkeep or later.
    while (game.state.priority.holder !== A) game.dispatch({ type: "pass-priority", player: B } as Action);
    turnUp(game, gift);
    game.dispatch({ type: "sacrifice", player: A, permanents: [fodder] } as Action);
    expect(game.state.awaiting?.kind).toBe("choose-permanents");
    game.dispatch({ type: "choose-permanents", player: A, permanents: [bears] } as Action);
    expect(game.state.awaiting).toBeNull();
    expect(game.state.objects[gift].attachedTo).toBe(bears);
    expect(game.state.priority.holder).toBe(A);
  });
});
