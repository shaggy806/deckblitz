/**
 * Spark of Creativity: "Choose target creature. Exile the top card of your
 * library. You may have Spark of Creativity deal damage to that creature
 * equal to the exiled card's mana value. If you don't, you may play that card
 * until end of turn."
 *
 * No new vocabulary: `exile-from-library`, then a `may` whose `else` is a
 * `grant-play` over the card exiled this way with `play: true` (a land too) —
 * Synth Eradicator's shape — the damage counted with `{ aggregate: "sum", of:
 * "mana-value", in: { thisWay: "exiled" } }`.
 */
import { describe, expect, it } from "vitest";

import type { Game } from "../game.js";
import type { ObjectId } from "../primitives.js";
import { A, B, cast, lands, pickModes, ref, settle, spawn, table, toHand, toLibrary, toStep, zone } from "./harness.js";

const offered = (game: Game, card: ObjectId): boolean =>
  game.legalActions(A).some((o) => (o.kind === "cast-spell" || o.kind === "play-land") && o.card === card);

describe("Spark of Creativity", () => {
  it("deals damage equal to the exiled card's mana value, and the card can't be played", () => {
    const { game, a } = table();
    const bears = spawn(game, "Grizzly Bears", B);
    lands(game, "Mountain", 1);
    const giant = toLibrary(game, "Hill Giant");
    const spark = toHand(game, "Spark of Creativity");
    pickModes(a, 0);
    cast(game, spark, { targets: [ref(bears)] });
    expect(zone(game, giant)).toBe("exile");
    expect(zone(game, bears)).toBe("graveyard");
    lands(game, "Mountain", 4);
    expect(offered(game, giant)).toBe(false);
  });

  it("declining the damage lets you cast the exiled card until end of turn", () => {
    const { game, a } = table();
    const giant = spawn(game, "Hill Giant", B);
    lands(game, "Mountain", 1);
    const bears = toLibrary(game, "Grizzly Bears");
    const spark = toHand(game, "Spark of Creativity");
    pickModes(a);
    cast(game, spark, { targets: [ref(giant)] });
    expect(zone(game, bears)).toBe("exile");
    expect(game.state.objects[giant].damageMarked).toBe(0);
    lands(game, "Forest", 2);
    expect(offered(game, bears)).toBe(true);
    // Alice's next main phase: the permission ended with the turn.
    toStep(game, "precombat-main");
    expect(offered(game, bears)).toBe(false);
  });

  it("declining lets you play an exiled land", () => {
    const { game, a } = table();
    const giant = spawn(game, "Hill Giant", B);
    lands(game, "Mountain", 1);
    const forest = toLibrary(game, "Forest");
    const spark = toHand(game, "Spark of Creativity");
    pickModes(a);
    cast(game, spark, { targets: [ref(giant)] });
    expect(zone(game, forest)).toBe("exile");
    game.dispatch({ type: "play-land", player: A, card: forest });
    expect(zone(game, forest)).toBe("battlefield");
  });

  it("with its target gone, nothing happens: the top card stays", () => {
    const { game, a } = table();
    const bears = spawn(game, "Grizzly Bears", B);
    lands(game, "Mountain", 1);
    const giant = toLibrary(game, "Hill Giant");
    const spark = toHand(game, "Spark of Creativity");
    pickModes(a, 0);
    cast(game, spark, { targets: [ref(bears)], settle: false });
    game.debugMove(bears, "graveyard");
    settle(game);
    expect(zone(game, spark)).toBe("graveyard");
    expect(zone(game, giant)).toBe("library");
  });
});
