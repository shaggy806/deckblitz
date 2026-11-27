/**
 * An alternative cost exiling "the top N [kind of] cards of your graveyard"
 * (`alternativeCost.also.exileFromGraveyard.fromTop` — Spinning Darkness):
 * no choice, the first N matching cards down from the top of the pile
 * (rule 404.2: a graveyard's order can't be changed).
 */
import { describe, expect, it } from "vitest";

import type { LegalAction } from "../actions.js";
import type { Game } from "../game.js";
import type { ObjectId } from "../primitives.js";

import { A, B, cast, life, pickFromZone, ref, spawn, table, toGraveyard, toHand, zone } from "./harness.js";

const altOffer = (game: Game, card: ObjectId): Extract<LegalAction, { kind: "cast-spell" }> | undefined =>
  game
    .legalActions(A)
    .find((a): a is Extract<LegalAction, { kind: "cast-spell" }> => a.kind === "cast-spell" && a.card === card && a.altCost === true);

describe("Spinning Darkness: exile the top three black cards of your graveyard", () => {
  it("exiles the three black cards nearest the top, without asking, and resolves", () => {
    const { game, a } = table();
    const darkness = toHand(game, "Spinning Darkness");
    const bottom = toGraveyard(game, "Doom Blade");
    const second = toGraveyard(game, "Sorin's Thirst");
    const red = toGraveyard(game, "Shock");
    const third = toGraveyard(game, "Doom Blade");
    const top = toGraveyard(game, "Sorin's Thirst");
    const bears = spawn(game, "Grizzly Bears", B);
    const before = life(game, A);

    expect(altOffer(game, darkness)).toBeDefined();
    const seen = pickFromZone(a, bottom, second, third);
    cast(game, darkness, { altCost: true, targets: [ref(bears)] });

    expect(seen.offered).toHaveLength(0);
    expect([second, third, top].map((id) => zone(game, id))).toEqual(["exile", "exile", "exile"]);
    expect(zone(game, bottom)).toBe("graveyard");
    expect(zone(game, red)).toBe("graveyard");
    expect(zone(game, bears)).toBe("graveyard");
    expect(life(game, A)).toBe(before + 3);
  });

  it("isn't offered with fewer than three black cards in the graveyard", () => {
    const { game } = table();
    const darkness = toHand(game, "Spinning Darkness");
    toGraveyard(game, "Doom Blade");
    toGraveyard(game, "Sorin's Thirst");
    toGraveyard(game, "Shock");
    spawn(game, "Grizzly Bears", B);

    expect(altOffer(game, darkness)).toBeUndefined();
  });
});
