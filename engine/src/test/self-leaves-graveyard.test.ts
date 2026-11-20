/**
 * A card's own "when this card is put into your hand from your graveyard"
 * (`leaves-graveyard`, `who: "self"`, `to: "hand"`, on a `fromGraveyard`
 * ability): a leaves-the-graveyard trigger, which looks back (rule 603.10a),
 * so it fires from wherever the card went — Golgari Brownscale.
 */
import { describe, expect, it } from "vitest";

import { A, B, life, settle, table, toGraveyard } from "./harness.js";

describe("Golgari Brownscale", () => {
  it("returned to its owner's hand by an effect: they gain 2 life", () => {
    const { game } = table();
    const card = toGraveyard(game, "Golgari Brownscale");
    const start = life(game, A);
    game.debugApplyEffect(A, { kind: "return-from-graveyard", filter: { name: "Golgari Brownscale" }, destination: "hand", count: "all" }, []);
    settle(game);
    expect(game.state.objects[card]?.zone).toBe("hand");
    expect(life(game, A)).toBe(start + 2);
  });

  it("dredged: mills two, returns, and gains 2 life", () => {
    const { game } = table();
    const card = toGraveyard(game, "Golgari Brownscale");
    const start = life(game, A);
    game.debugApplyEffect(A, { kind: "draw", amount: 1 });
    const awaiting = game.state.awaiting;
    expect(awaiting?.kind === "choose-modes" && awaiting.dredgeFor?.cards).toContain(card);
    game.dispatch({ type: "choose-modes", player: A, modes: [1] });
    settle(game);
    expect(game.state.objects[card]?.zone).toBe("hand");
    expect(life(game, A)).toBe(start + 2);
  });

  it("put onto the battlefield or exiled from the graveyard: nothing", () => {
    const { game } = table();
    toGraveyard(game, "Golgari Brownscale");
    toGraveyard(game, "Golgari Brownscale", B);
    const [a, b] = [life(game, A), life(game, B)];
    game.debugApplyEffect(A, { kind: "return-from-graveyard", filter: { name: "Golgari Brownscale" }, destination: "battlefield", count: "all" }, []);
    game.debugApplyEffect(A, { kind: "exile-graveyard", target: "each-player" }, []);
    settle(game);
    expect(life(game, A)).toBe(a);
    expect(life(game, B)).toBe(b);
  });

  it("another card leaving the graveyard doesn't trigger it", () => {
    const { game } = table();
    toGraveyard(game, "Golgari Brownscale");
    toGraveyard(game, "Grizzly Bears");
    const start = life(game, A);
    game.debugApplyEffect(A, { kind: "return-from-graveyard", filter: { name: "Grizzly Bears" }, destination: "hand", count: "all" }, []);
    settle(game);
    expect(life(game, A)).toBe(start);
  });
});
