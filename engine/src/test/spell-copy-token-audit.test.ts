import { describe, expect, it } from "vitest";

import type { Game } from "../game.js";
import { A, cast, lands, ref, spawn, table, toHand } from "./harness.js";

/**
 * A rules audit (2026-11-26): a copy of a permanent spell becomes a token as
 * it resolves, and that token isn't "created" for replacement effects or
 * triggers that refer to creating one (rule 111.13 — uncited before).
 */
const bears = (game: Game) => game.state.zones.shared.battlefield.filter((id) => game.state.objects[id].cardName === "Grizzly Bears");

describe("a copied permanent spell's token, audited", () => {
  it("Parallel Lives doesn't double it: one token, not two (rule 111.13)", () => {
    const { game } = table();
    spawn(game, "Parallel Lives");
    lands(game, "Forest", 3);
    lands(game, "Island", 1);
    const card = toHand(game, "Grizzly Bears");
    cast(game, card, { settle: false });
    cast(game, toHand(game, "Double Major"), { targets: [ref(card)] });
    const all = bears(game);
    const tokens = all.filter((id) => game.state.objects[id].isToken);
    const count = tokens.reduce((n, id) => n + (game.state.objects[id].stackCount ?? 1), 0);
    expect(all.length - tokens.length).toBe(1);
    expect(count).toBe(1);
  });

  it("an effect that does create a token is still doubled (control for the test above)", () => {
    const { game } = table();
    spawn(game, "Parallel Lives");
    game.debugApplyEffect(A, { kind: "create-token", token: "Spirit Token", count: 1 });
    const spirits = game.state.zones.shared.battlefield.filter((id) => game.state.objects[id].cardName === "Spirit Token");
    expect(spirits.reduce((n, id) => n + (game.state.objects[id].stackCount ?? 1), 0)).toBe(2);
  });
});
