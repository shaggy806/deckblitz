import { describe, expect, it } from "vitest";

import type { Game } from "../game.js";
import { cast, destroy, lands, ref, settle, spawn, table, toHand, zone } from "./harness.js";

/**
 * A rules audit (2026-11-26): an Aura's trigger on its creature leaving
 * finds the new object only where that creature went (rule 603.6e, 400.7).
 */
const named = (game: Game, name: string) =>
  game.state.zones.shared.battlefield.filter((id) => game.state.objects[id].cardName === name);

describe("an Aura's leave trigger, audited", () => {
  it("Kaya's Ghostform on a blinked creature: it's back already, a new object, and the Ghostform returns nothing more (rules 603.6e, 400.7)", () => {
    const { game } = table();
    const bears = spawn(game, "Grizzly Bears");
    lands(game, "Swamp", 1);
    const ghost = toHand(game, "Kaya's Ghostform");
    cast(game, ghost, { targets: [ref(bears)] });
    lands(game, "Plains", 1);
    cast(game, toHand(game, "Cloudshift"), { targets: [ref(bears)] });
    settle(game);
    expect(named(game, "Grizzly Bears")).toEqual([bears]);
    expect(zone(game, ghost)).toBe("graveyard");
  });

  it("Kaya's Ghostform on a token: the token can't come back (rule 111.8)", () => {
    const { game } = table();
    game.debugApplyEffect(game.state.turnOrder[0], { kind: "create-token", token: "Spirit Token", count: 1 });
    settle(game);
    const [spirit] = named(game, "Spirit Token");
    lands(game, "Swamp", 1);
    cast(game, toHand(game, "Kaya's Ghostform"), { targets: [ref(spirit)] });
    destroy(game, spirit);
    settle(game);
    expect(named(game, "Spirit Token")).toEqual([]);
  });
});
