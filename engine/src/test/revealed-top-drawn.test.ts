/**
 * The top card of a library played revealed (rule 401.5: Courser of Kruphix,
 * Lantern of Insight), once it is drawn: every player saw it, so the other
 * seats' views keep it face up in the hand it went to for the rest of the
 * turn, as they do a card an effect revealed and then put there
 * (`GameState.revealedThisTurn`). It turned face down as it was drawn (a bug
 * report, 2026-11-22).
 */
import { describe, expect, it } from "vitest";

import type { Game } from "../game.js";
import type { ObjectId, PlayerId } from "../primitives.js";
import { viewFor } from "../view.js";
import { A, B, cast, lands, nextTurn, spawn, table, toHand, toLibrary, zone } from "./harness.js";

/** The name `viewer` sees for `card`, `null` when it's a hidden card to them. */
const seenBy = (game: Game, viewer: PlayerId, card: ObjectId): string | null =>
  viewFor(game.state, game.registry, viewer).objects[card]?.cardName ?? null;

/** Alice draws two with Divination: `second` then `first` on top of her library. */
function drawTwo(game: Game): { first: ObjectId; second: ObjectId } {
  const second = toLibrary(game, "Hill Giant");
  const first = toLibrary(game, "Grizzly Bears");
  lands(game, "Island", 3);
  cast(game, toHand(game, "Divination"));
  expect(zone(game, first)).toBe("hand");
  expect(zone(game, second)).toBe("hand");
  return { first, second };
}

describe("a revealed top card of a library, drawn", () => {
  it("stays seen in its owner's hand for the turn (Courser of Kruphix), each card as it was drawn", () => {
    const { game } = table();
    spawn(game, "Courser of Kruphix");
    const { first, second } = drawTwo(game);
    // Both were the revealed top card as they were drawn.
    expect(seenBy(game, B, first)).toBe("Grizzly Bears");
    expect(seenBy(game, B, second)).toBe("Hill Giant");
    // A reveal lasts the turn, and no longer.
    nextTurn(game);
    expect(zone(game, first)).toBe("hand");
    expect(seenBy(game, B, first)).toBeNull();
    expect(seenBy(game, B, second)).toBeNull();
  });

  it("is seen by every player when each plays with it revealed (Lantern of Insight)", () => {
    const { game } = table({ players: 3 });
    spawn(game, "Lantern of Insight", B);
    const { first } = drawTwo(game);
    for (const viewer of game.state.turnOrder) expect(seenBy(game, viewer, first)).toBe("Grizzly Bears");
  });

  it("is seen when an opponent's draw step takes it", () => {
    const { game } = table();
    spawn(game, "Lantern of Insight");
    const top = toLibrary(game, "Grizzly Bears", B);
    expect(seenBy(game, A, top)).toBe("Grizzly Bears");
    nextTurn(game);
    expect(zone(game, top)).toBe("hand");
    expect(seenBy(game, A, top)).toBe("Grizzly Bears");
  });

  it("stays hidden with nothing revealing it, or with a card only its owner may look at", () => {
    const plain = table();
    const drawn = drawTwo(plain.game);
    expect(seenBy(plain.game, B, drawn.first)).toBeNull();
    expect(plain.game.state.revealedThisTurn).not.toContain(drawn.first);

    // "You may look at the top card of your library any time" (Augur of Autumn).
    const looking = table();
    spawn(looking.game, "Augur of Autumn");
    const looked = drawTwo(looking.game);
    expect(seenBy(looking.game, B, looked.first)).toBeNull();
    expect(seenBy(looking.game, A, looked.first)).toBe("Grizzly Bears");
  });
});
