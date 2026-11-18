/**
 * "Whenever a face-down creature you control dies, exile it if it's an
 * instant or sorcery card": asked of the card in the graveyard as the ability
 * resolves (`object-matches` with `now`) — the face-down creature as it last
 * existed has no types (rule 708.2), the card it became does (708.9). Cryptic
 * Pursuit, which manifests (701.40) the top card of your library whenever you
 * cast an instant or sorcery spell from your hand.
 */
import { describe, expect, it } from "vitest";

import type { Game } from "../game.js";
import type { ObjectId } from "../primitives.js";
import { A, B, cast, destroy, lands, ref, spawn, table, toHand, toLibrary, zone } from "./harness.js";

/** Whether alice is offered a cast of `card`. */
const castable = (game: Game, card: ObjectId): boolean =>
  game.legalActions(A).some((o) => o.kind === "cast-spell" && o.card === card);

/** Alice's Cryptic Pursuit; `top` on top of her library, manifested as she casts a Lightning Bolt from her hand. */
function manifestOnCast(top: string): { game: Game; hidden: ObjectId } {
  const { game } = table();
  spawn(game, "Cryptic Pursuit");
  lands(game, "Mountain", 2);
  const hidden = toLibrary(game, top);
  cast(game, toHand(game, "Lightning Bolt"), { targets: [ref(B)] });
  expect(game.state.objects[hidden]).toMatchObject({ zone: "battlefield", faceDown: { kind: "manifest" } });
  return { game, hidden };
}

describe("Cryptic Pursuit", () => {
  it("a manifested instant that dies is exiled, castable until the end of your next turn", () => {
    const { game, hidden } = manifestOnCast("Lightning Bolt");
    destroy(game, hidden, B);
    expect(zone(game, hidden)).toBe("exile");
    expect(castable(game, hidden)).toBe(true);
    // Bob's turn, then alice's next: still hers to cast.
    game.advanceUntil((s) => s.turn.number === 3 && s.turn.step === "precombat-main" && s.priority.holder === A);
    expect(castable(game, hidden)).toBe(true);
    cast(game, hidden, { targets: [ref(B)], via: "impulse" });
    expect(zone(game, hidden)).toBe("graveyard");
  });

  it("a manifested creature card that dies stays in the graveyard", () => {
    const { game, hidden } = manifestOnCast("Grizzly Bears");
    destroy(game, hidden, B);
    expect(zone(game, hidden)).toBe("graveyard");
  });

  it("an opponent's face-down instant that dies stays in their graveyard", () => {
    const { game } = table();
    spawn(game, "Cryptic Pursuit");
    const theirs = toLibrary(game, "Lightning Bolt", B);
    game.debugApplyEffect(B, { kind: "manifest", who: "you" });
    expect(game.state.objects[theirs]).toMatchObject({ zone: "battlefield", controller: B, faceDown: { kind: "manifest" } });
    destroy(game, theirs, A);
    expect(zone(game, theirs)).toBe("graveyard");
  });
});
