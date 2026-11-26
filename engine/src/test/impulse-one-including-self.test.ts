/**
 * Flameskull's Rejuvenation: "When this creature dies, exile it. If you do,
 * exile the top card of your library. Until the end of your next turn, you
 * may play one of those cards. (If you cast Flameskull this way, you can't
 * play the other card, and vice versa.)"
 *
 * One `grant-play` over every card exiled this way, Flameskull included, with
 * `upTo: 1`: the two share one play (a permission group).
 */

import { describe, expect, it } from "vitest";

import type { Game } from "../game.js";
import type { ObjectId } from "../primitives.js";
import { A, B, cast, destroy, lands, nextTurn, ref, settle, spawn, table, toLibrary, zone } from "./harness.js";

const castable = (game: Game, card: ObjectId): boolean =>
  game.legalActions(A).some((a) => a.kind === "cast-spell" && a.card === card);

/** Flameskull dead, with Lightning Bolt the top card of the library. */
function killed(game: Game): { skull: ObjectId; bolt: ObjectId } {
  const skull = spawn(game, "Flameskull");
  const bolt = toLibrary(game, "Lightning Bolt");
  destroy(game, skull);
  settle(game);
  return { skull, bolt };
}

describe("Flameskull", () => {
  it("exiles itself and the top card when it dies, and either may be cast", () => {
    const { game } = table();
    const { skull, bolt } = killed(game);
    expect(zone(game, skull)).toBe("exile");
    expect(zone(game, bolt)).toBe("exile");
    lands(game, "Mountain", 3);
    expect(castable(game, skull)).toBe(true);
    expect(castable(game, bolt)).toBe(true);
  });

  it("casting Flameskull this way ends the other card's permission", () => {
    const { game } = table();
    const { skull, bolt } = killed(game);
    lands(game, "Mountain", 4);
    cast(game, skull, { via: "impulse" });
    expect(zone(game, skull)).toBe("battlefield");
    expect(zone(game, bolt)).toBe("exile");
    expect(castable(game, bolt)).toBe(false);
  });

  it("casting the other card ends Flameskull's permission", () => {
    const { game } = table();
    const { skull, bolt } = killed(game);
    lands(game, "Mountain", 4);
    cast(game, bolt, { via: "impulse", targets: [ref(B)] });
    expect(zone(game, bolt)).toBe("graveyard");
    expect(castable(game, skull)).toBe(false);
  });

  it("lasts through the controller's next turn and no longer", () => {
    const { game } = table();
    const { skull } = killed(game);
    lands(game, "Mountain", 3);
    nextTurn(game); // bob's
    nextTurn(game); // alice's next
    expect(castable(game, skull)).toBe(true);
    nextTurn(game); // bob's again
    nextTurn(game);
    expect(castable(game, skull)).toBe(false);
    expect(zone(game, skull)).toBe("exile");
  });

  it("exiles nothing from the library when it has already left the graveyard", () => {
    const { game } = table();
    const skull = spawn(game, "Flameskull");
    const bolt = toLibrary(game, "Lightning Bolt");
    game.debugApplyEffect(B, { kind: "destroy", target: 0 }, [ref(skull)]);
    // Its dies trigger is waiting: the card leaves the graveyard first, so
    // "exile it" does nothing, and "if you do" fails.
    expect(zone(game, skull)).toBe("graveyard");
    game.debugMove(skull, "hand");
    settle(game);
    expect(zone(game, skull)).toBe("hand");
    expect(zone(game, bolt)).toBe("library");
  });
});
