/**
 * "Becomes a copy of that card" after the card has moved (Shapeshifter's
 * Marrow): a `look-and-choose`'s `then` sees the card where it went as slot
 * 0, and `become-copy` with `ofCard` copies its printed values (rule 707.2)
 * for as long as the permanent is that object (rule 611.2a).
 */
import { describe, expect, it } from "vitest";

import { printedCardName } from "../state.js";
import { A, B, graveyard, pt, spawn, table, toLibrary, toStep, types } from "./harness.js";

describe("Shapeshifter's Marrow", () => {
  it("an opponent's revealed creature card goes to their graveyard and the enchantment becomes a copy of it", () => {
    const { game } = table();
    const marrow = spawn(game, "Shapeshifter's Marrow", A);
    const giant = toLibrary(game, "Hill Giant", B);
    toStep(game, "draw", B);
    expect(graveyard(game, B)).toContain(giant);
    expect(printedCardName(game.state.objects[marrow])).toBe("Hill Giant");
    expect(types(game, marrow)).toEqual(["creature"]);
    expect(pt(game, marrow)).toEqual({ power: 3, toughness: 3 });
    // It lost the ability: the next creature card Bob reveals stays put.
    const bears = toLibrary(game, "Grizzly Bears", B);
    toStep(game, "draw", B);
    expect(game.state.objects[bears].zone).not.toBe("graveyard");
    expect(printedCardName(game.state.objects[marrow])).toBe("Hill Giant");
  });

  it("a noncreature card stays on top and the enchantment stays itself", () => {
    const { game } = table();
    const marrow = spawn(game, "Shapeshifter's Marrow", A);
    const top = toLibrary(game, "Island", B);
    toStep(game, "upkeep", B);
    toStep(game, "draw", B);
    // Bob drew it in his draw step: it was left on top.
    expect(game.state.objects[top].zone).toBe("hand");
    expect(printedCardName(game.state.objects[marrow])).toBe("Shapeshifter's Marrow");
    expect(types(game, marrow)).toEqual(["enchantment"]);
  });

  it("doesn't trigger in its controller's own upkeep", () => {
    const { game } = table();
    const marrow = spawn(game, "Shapeshifter's Marrow", A);
    toLibrary(game, "Hill Giant", A);
    toStep(game, "draw", B);
    toStep(game, "draw", A);
    expect(printedCardName(game.state.objects[marrow])).toBe("Shapeshifter's Marrow");
  });
});
