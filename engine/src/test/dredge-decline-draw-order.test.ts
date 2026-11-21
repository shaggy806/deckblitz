/**
 * A dredge question declined (rule 702.52a) leaves the draw to go on as
 * drawn, as when nothing was asked: any other replacement of it — Chains of
 * Mephistopheles' "discards a card instead … they draw a card" — is done in
 * full before the next card of a longer draw (rule 614.11a), and the card
 * that replacement draws isn't replaced by it again (614.5).
 */

import { describe, expect, it } from "vitest";

import type { Game } from "../game.js";
import type { ObjectId, PlayerId } from "../primitives.js";
import { A, cast, graveyard, hand, lands, spawn, table, toGraveyard, toHand, toLibrary } from "./harness.js";

const names = (game: Game, ids: readonly ObjectId[]): string[] => ids.map((id) => game.state.objects[id].cardName);

function handOf(game: Game, player: PlayerId, cards: readonly string[]): ObjectId[] {
  for (const id of [...hand(game, player)]) game.debugMove(id, "exile");
  return cards.map((name) => toHand(game, name, player));
}

describe("dredge declined beside Chains of Mephistopheles", () => {
  it("each card of a draw of two is a discard then a draw, the discard answered before the next card", () => {
    const { game, a } = table();
    lands(game, "Island", 3);
    spawn(game, "Chains of Mephistopheles");
    const [spell] = handOf(game, A, ["Divination", "Plains", "Swamp"]);
    toGraveyard(game, "Darkblast");
    toLibrary(game, "Forest");
    toLibrary(game, "Grizzly Bears"); // on top
    let dredgeAsked = 0;
    a.chooseModesFn = () => {
      dredgeAsked += 1;
      return [0]; // "Draw a card": dredge declined
    };
    const offered: string[][] = [];
    a.chooseDiscardsFn = (cards) => {
      offered.push(names(game, cards.map((c) => c.id)).sort());
      const pick = cards.find((c) => c.cardName === (offered.length === 1 ? "Plains" : "Grizzly Bears"));
      return [pick!.id];
    };
    cast(game, spell);
    // Asked of each of the four draws: the spell's two and the two Chains'.
    expect(dredgeAsked).toBe(4);
    // The card Chains has the player draw isn't replaced by it again, its
    // dredge declined (rule 614.5); and the second discard saw that card, all
    // of the first replacement done before the next (614.11a).
    expect(offered).toEqual([
      ["Plains", "Swamp"],
      ["Grizzly Bears", "Swamp"],
    ]);
    expect(names(game, hand(game)).sort()).toEqual(["Forest", "Swamp"]);
    expect(names(game, graveyard(game)).sort()).toEqual(["Darkblast", "Divination", "Grizzly Bears", "Plains"]);
  });
});
