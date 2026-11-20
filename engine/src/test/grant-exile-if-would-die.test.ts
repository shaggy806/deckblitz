/**
 * A granted "If this creature would die, exile it instead" — a `grant-static`
 * of a self `would-be-put-into-graveyard` exile replacement, read through the
 * permanent's granted statics as its own (`Game.ownExileReplacements`): Can't
 * Stay Away.
 */
import { describe, expect, it } from "vitest";

import { A, cast, destroy, lands, ref, spawn, table, toGraveyard, toHand, zone } from "./harness.js";

describe("Can't Stay Away", () => {
  it("returns the creature, which is exiled instead of dying", () => {
    const { game } = table();
    const bears = toGraveyard(game, "Grizzly Bears", A);
    lands(game, "Plains", 1);
    lands(game, "Swamp", 1);
    cast(game, toHand(game, "Can't Stay Away"), { targets: [ref(bears)] });
    expect(zone(game, bears)).toBe("battlefield");
    destroy(game, bears);
    expect(zone(game, bears)).toBe("exile");
  });

  it("another creature without the grant still dies", () => {
    const { game } = table();
    const bears = toGraveyard(game, "Grizzly Bears", A);
    const other = spawn(game, "Grizzly Bears", A);
    lands(game, "Plains", 1);
    lands(game, "Swamp", 1);
    cast(game, toHand(game, "Can't Stay Away"), { targets: [ref(bears)] });
    destroy(game, other);
    expect(zone(game, other)).toBe("graveyard");
  });

  it("can be cast again with flashback, then is exiled", () => {
    const { game } = table();
    const bears = toGraveyard(game, "Grizzly Bears", A);
    lands(game, "Plains", 2);
    lands(game, "Swamp", 3);
    const spell = toGraveyard(game, "Can't Stay Away", A);
    cast(game, spell, { targets: [ref(bears)], via: "flashback" });
    expect(zone(game, bears)).toBe("battlefield");
    expect(zone(game, spell)).toBe("exile");
  });
});
