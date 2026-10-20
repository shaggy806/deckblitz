/**
 * Worldspine Wurm: dying makes three 5/5 trample Wurms and shuffles it back into its owner's
 * library (its own "put into a graveyard from anywhere" trigger, working from the graveyard —
 * `who: "self"` reaches only this card); discarded, it's shuffled in too.
 */
import { describe, expect, it } from "vitest";

import { A, destroy, settle, spawn, table, toGraveyard, toHand, zone } from "./harness.js";

const wurms = (game: ReturnType<typeof table>["game"]): number =>
  game.state.zones.shared.battlefield
    .filter((id) => game.state.objects[id].cardName === "Wurm Token (Trample)")
    .reduce((n, id) => n + (game.state.objects[id].stackCount ?? 1), 0);

describe("Worldspine Wurm", () => {
  it("dies: three Wurms, and back into the library", () => {
    const { game } = table();
    const worldspine = spawn(game, "Worldspine Wurm");
    destroy(game, worldspine);
    settle(game);
    expect(wurms(game)).toBe(3);
    expect(zone(game, worldspine)).toBe("library");
  });

  it("discarded: shuffled in, no Wurms", () => {
    const { game, a } = table();
    const worldspine = toHand(game, "Worldspine Wurm");
    a.chooseDiscardsFn = () => [worldspine];
    game.debugApplyEffect(A, { kind: "discard", target: "you", amount: 1 });
    settle(game);
    expect(zone(game, worldspine)).toBe("library");
    expect(wurms(game)).toBe(0);
  });

  it("another card put into the graveyard doesn't trigger it", () => {
    const { game, a } = table();
    // Its own arrival triggers it once (not yet resolved)…
    const worldspine = toGraveyard(game, "Worldspine Wurm");
    const bears = toHand(game, "Grizzly Bears");
    a.chooseDiscardsFn = () => [bears];
    // …and the Bears' arrival doesn't again.
    game.debugApplyEffect(A, { kind: "discard", target: "you", amount: 1 });
    const pending = game.state.pendingTriggers.filter((t) => t.sourceObjectId === worldspine).length;
    const stacked = game.state.zones.shared.stack.filter((id) => game.state.objects[id].sourceObjectId === worldspine).length;
    expect(pending + stacked).toBe(1);
  });
});
