/**
 * `CardFilter.aboveSourceInGraveyard: "directly"` — "with a creature card
 * directly above it" (Death Spark, Krovikan Horror): the card put into the
 * graveyard right after the source, nothing between (the ruling; rule 404.2).
 */
import { describe, expect, it } from "vitest";

import { readsGraveyardOrder } from "../cards/define.js";
import { A, B, nextTurn, pickModes, registryOf, table, toGraveyard, toStep, zone } from "./harness.js";

describe("Death Spark", () => {
  it("is offered the return with a creature card directly above, and pays {1}", () => {
    const { game, a } = table({ openingHandSize: 0 });
    game.debugSpawn("Mountain", A, "battlefield");
    const spark = toGraveyard(game, "Death Spark");
    toGraveyard(game, "Grizzly Bears");
    pickModes(a, 0);
    nextTurn(game);
    nextTurn(game);
    expect(zone(game, spark)).toBe("hand");
  });

  it("stays when the creature card above it isn't directly above", () => {
    const { game, a } = table({ openingHandSize: 0 });
    game.debugSpawn("Mountain", A, "battlefield");
    const spark = toGraveyard(game, "Death Spark");
    toGraveyard(game, "Shock");
    toGraveyard(game, "Grizzly Bears");
    pickModes(a, 0);
    nextTurn(game);
    nextTurn(game);
    expect(zone(game, spark)).toBe("graveyard");
  });

  it("stays when the card directly above isn't a creature card (one below doesn't count)", () => {
    const { game, a } = table({ openingHandSize: 0 });
    game.debugSpawn("Mountain", A, "battlefield");
    toGraveyard(game, "Grizzly Bears");
    const spark = toGraveyard(game, "Death Spark");
    toGraveyard(game, "Shock");
    pickModes(a, 0);
    nextTurn(game);
    nextTurn(game);
    expect(zone(game, spark)).toBe("graveyard");
  });

  it("reads the graveyard's order, so cards arriving together are arranged (rule 404.3)", () => {
    const { game } = table();
    expect(readsGraveyardOrder(registryOf(game).get("Death Spark"))).toBe(true);
    expect(readsGraveyardOrder(registryOf(game).get("Krovikan Horror"))).toBe(true);
  });
});

describe("Krovikan Horror", () => {
  it("returns at the beginning of any end step, an opponent's included", () => {
    const { game, a } = table({ openingHandSize: 0 });
    const horror = toGraveyard(game, "Krovikan Horror");
    toGraveyard(game, "Grizzly Bears");
    pickModes(a, 0);
    nextTurn(game); // bob's turn
    toStep(game, "end", B);
    game.advanceUntil((s) => s.turn.step === "cleanup");
    expect(zone(game, horror)).toBe("hand");
  });

  it("stays without a creature card directly above it", () => {
    const { game, a } = table({ openingHandSize: 0 });
    const horror = toGraveyard(game, "Krovikan Horror");
    pickModes(a, 0);
    toStep(game, "end");
    game.advanceUntil((s) => s.turn.step === "cleanup");
    expect(zone(game, horror)).toBe("graveyard");
  });
});
