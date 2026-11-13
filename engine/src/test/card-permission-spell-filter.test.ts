/**
 * A permission kept on the card (`GameObject.playPermission`) with a `spell`
 * filter reaches only spells matching it, judged as the face cast (rule
 * 601.3e) — it was offered for every card it covered: an impulse exile's "you
 * may cast an artifact spell from among them" offered the Lightning Bolt too.
 */
import { describe, expect, it } from "vitest";

import type { Game } from "../game.js";
import type { ObjectId } from "../primitives.js";
import { A, lands, table, toLibrary } from "./harness.js";

const castable = (game: Game, card: ObjectId): boolean =>
  game.legalActions(A).some((a) => a.kind === "cast-spell" && a.card === card);

describe("a card permission's spell filter", () => {
  it("offers only the matching spells", () => {
    const { game } = table();
    lands(game, "Mountain", 2);
    const bolt = toLibrary(game, "Lightning Bolt");
    const bonesplitter = toLibrary(game, "Bonesplitter");
    game.debugApplyEffect(A, { kind: "impulse-exile", amount: 2, duration: "end-of-turn", spell: { type: "artifact" } });
    expect(game.state.objects[bolt].zone).toBe("exile");
    expect(castable(game, bonesplitter)).toBe(true);
    expect(castable(game, bolt)).toBe(false);
  });
});
