/**
 * `grant-spells-this-turn`'s `cantBeCounteredBy` — Autumn's Veil: "spells you
 * control can't be countered by blue or black spells this turn, and creatures
 * you control can't be the targets of blue or black spells this turn".
 */
import { describe, expect, it } from "vitest";

import { A, B, activate, cast, lands, ref, spawn, table, toHand, zone } from "./harness.js";
import type { Game } from "../game.js";

const veil = (game: Game): void => {
  lands(game, "Forest", 1);
  cast(game, toHand(game, "Autumn's Veil"));
};

/** Alice casts Grizzly Bears and passes, leaving it on the stack for Bob. */
const bearsOnStack = (game: Game) => {
  lands(game, "Forest", 2);
  const bears = toHand(game, "Grizzly Bears");
  cast(game, bears, { settle: false });
  game.dispatch({ type: "pass-priority", player: A });
  return bears;
};

describe("Autumn's Veil", () => {
  it("a blue counterspell can't counter your spell", () => {
    const { game } = table();
    veil(game);
    const bears = bearsOnStack(game);
    lands(game, "Island", 2, B);
    cast(game, toHand(game, "Counterspell", B), { player: B, targets: [ref(bears)] });
    expect(zone(game, bears)).toBe("battlefield");
  });

  it("a red one still can", () => {
    const { game } = table();
    veil(game);
    const bears = bearsOnStack(game);
    lands(game, "Mountain", 3, B);
    cast(game, toHand(game, "Tibalt's Trickery", B), { player: B, targets: [ref(bears)] });
    expect(zone(game, bears)).not.toBe("battlefield");
    expect(zone(game, bears)).not.toBe("stack");
  });

  it("an ability from a blue source still can (no effect on abilities)", () => {
    const { game } = table();
    veil(game);
    const prodigy = spawn(game, "Voidmage Prodigy", B);
    lands(game, "Island", 2, B);
    const bears = bearsOnStack(game);
    activate(game, prodigy, 0, { player: B, targets: [ref(bears)], sacrifice: prodigy });
    expect(zone(game, bears)).toBe("graveyard");
  });

  it("without it, the blue counterspell counters", () => {
    const { game } = table();
    const bears = bearsOnStack(game);
    lands(game, "Island", 2, B);
    cast(game, toHand(game, "Counterspell", B), { player: B, targets: [ref(bears)] });
    expect(zone(game, bears)).toBe("graveyard");
  });

  it("your creatures, even one that arrives later, can't be targeted by a black spell (anyone's); a red one can", () => {
    const { game } = table();
    veil(game);
    const later = spawn(game, "Grizzly Bears");
    lands(game, "Swamp", 2);
    const blade = toHand(game, "Doom Blade");
    expect(() => cast(game, blade, { targets: [ref(later)] })).toThrow(/target/i);
    lands(game, "Mountain", 1);
    cast(game, toHand(game, "Lightning Bolt"), { targets: [ref(later)] });
    expect(zone(game, later)).toBe("graveyard");
  });

  it("without it, the black spell can target them", () => {
    const { game } = table();
    const bears = spawn(game, "Grizzly Bears");
    lands(game, "Swamp", 2);
    cast(game, toHand(game, "Doom Blade"), { targets: [ref(bears)] });
    expect(zone(game, bears)).toBe("graveyard");
  });
});
