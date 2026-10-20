/**
 * A spell cast this turn remembers where it was cast from: `castRecordOf` writes the cast's zone
 * into the record's `entry.cast`, so a `cast-this-turn` condition whose filter has `castFrom`
 * ("spells you've cast this turn from your graveyard") counts it.
 */
import { describe, expect, it } from "vitest";

import type { EffectSpec } from "../effects.js";

import { A, cast, hand, lands, life, nextTurn, settle, spawn, table, toGraveyard, toHand } from "./harness.js";

const gainIfCastFrom = (zone: "graveyard" | "hand"): EffectSpec => ({
  kind: "conditional",
  condition: { kind: "cast-this-turn", filter: { castFrom: zone } },
  then: { kind: "gain-life", amount: 5 },
});

describe("cast-this-turn reads where a spell was cast from", () => {
  it("counts a flashback cast from the graveyard", () => {
    const { game } = table();
    lands(game, "Island", 3);
    const think = toGraveyard(game, "Think Twice");
    const flashback = game.legalActions(A).find((l) => l.kind === "cast-spell" && l.card === think);
    if (flashback?.kind !== "cast-spell") throw new Error("no flashback offered");
    game.dispatch({ type: "cast-spell", player: A, card: think, targets: [], via: flashback.via });
    settle(game);
    // A conditional asks about a real source.
    const source = spawn(game, "Grizzly Bears");
    game.debugApplyEffect(A, gainIfCastFrom("graveyard"), [], { source });
    expect(life(game)).toBe(25);
    game.debugApplyEffect(A, gainIfCastFrom("hand"), [], { source });
    expect(life(game)).toBe(25);
  });

  it("and a spell cast from the hand as from the hand", () => {
    const { game } = table();
    lands(game, "Island", 2);
    cast(game, toHand(game, "Think Twice"));
    const source = spawn(game, "Grizzly Bears");
    game.debugApplyEffect(A, gainIfCastFrom("hand"), [], { source });
    expect(life(game)).toBe(25);
    game.debugApplyEffect(A, gainIfCastFrom("graveyard"), [], { source });
    expect(life(game)).toBe(25);
  });

  it("Surge of Brilliance counts the spells cast from anywhere but the hand — itself, foretold, too", () => {
    const { game } = table();
    lands(game, "Island", 6);
    const surge = toHand(game, "Surge of Brilliance");
    game.dispatch({ type: "foretell", player: A, card: surge });
    settle(game);
    // Alice's next turn, her lands untapped.
    nextTurn(game);
    nextTurn(game);
    // A flashback from the graveyard, then Surge from exile: two spells not cast from the hand.
    const think = toGraveyard(game, "Think Twice");
    const flashback = game.legalActions(A).find((l) => l.kind === "cast-spell" && l.card === think);
    if (flashback?.kind !== "cast-spell") throw new Error("no flashback offered");
    game.dispatch({ type: "cast-spell", player: A, card: think, targets: [], via: flashback.via });
    settle(game);
    cast(game, toHand(game, "Opt"), { settle: true });
    const before = hand(game).length;
    game.dispatch({ type: "cast-spell", player: A, card: surge, targets: [], via: "foretell" });
    settle(game);
    expect(hand(game).length).toBe(before + 2);
  });
});
