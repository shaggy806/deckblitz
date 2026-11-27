/**
 * "Spend this mana only to cast face-down spells or to turn creatures face
 * up" (Tin Street Gossip): `ManaSpendPurpose` `"face-down-spell"`, a cast
 * with `via: "face-down"` (rule 708.4, the cast purpose's `faceDown`), beside
 * `"turn-face-up"` (116.2b).
 */
import { describe, expect, it } from "vitest";

import type { Game } from "../game.js";
import type { ObjectId } from "../primitives.js";
import { A, cast, lands, settle, spawn, table, toHand } from "./harness.js";

const castable = (game: Game, card: ObjectId, via?: string): boolean =>
  game.legalActions(A).some((a) => a.kind === "cast-spell" && a.card === card && (via === undefined ? a.via === undefined : a.via === via));

describe("Tin Street Gossip", () => {
  it("its {R}{G} and one more land cast a morph face down", () => {
    const { game } = table();
    const gossip = spawn(game, "Tin Street Gossip");
    lands(game, "Wastes", 1);
    const den = toHand(game, "Den Protector");
    expect(castable(game, den, "face-down")).toBe(true);
    cast(game, den, { via: "face-down" });
    expect(game.state.objects[den].faceDown).toBeDefined();
    expect(game.state.objects[gossip].tapped).toBe(true);
  });

  it("its mana doesn't cast a spell face up", () => {
    const { game } = table();
    spawn(game, "Tin Street Gossip");
    const bears = toHand(game, "Grizzly Bears");
    expect(castable(game, bears)).toBe(false);
    // The same card face down is a spell its mana pays for, the {3} short by one.
    const den = toHand(game, "Den Protector");
    expect(castable(game, den, "face-down")).toBe(false);
    lands(game, "Wastes", 1);
    expect(castable(game, den, "face-down")).toBe(true);
    expect(castable(game, bears)).toBe(false);
  });

  it("its mana turns a face-down creature face up (Den Protector's megamorph {1}{G})", () => {
    const { game } = table();
    lands(game, "Wastes", 3);
    const den = toHand(game, "Den Protector");
    cast(game, den, { via: "face-down" });
    const gossip = spawn(game, "Tin Street Gossip");
    expect(game.legalActions(A).some((a) => a.kind === "turn-face-up" && a.permanent === den)).toBe(true);
    game.dispatch({ type: "turn-face-up", player: A, permanent: den, morph: true });
    settle(game);
    expect(game.state.objects[den].faceDown).toBeUndefined();
    expect(game.state.objects[gossip].tapped).toBe(true);
  });
});
