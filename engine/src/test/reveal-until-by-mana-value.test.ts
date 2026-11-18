/**
 * Where a revealed card goes, by a compare on it: `reveal-until` with no
 * fixed `put`, its `then` a `conditional` on the card found — Part in
 * Friendship's "reveal cards from the top of your library until you reveal a
 * creature card. If its mana value is less than or equal to the number of
 * lands you control, put it onto the battlefield. Otherwise, put it into your
 * hand. Put the rest on the bottom of your library in a random order. This
 * ability triggers only once each turn."
 */
import { describe, expect, it } from "vitest";

import type { Game } from "../game.js";
import type { ObjectId } from "../primitives.js";
import { A, destroy, hand, lands, named, spawn, table, toLibrary, tokensNamed } from "./harness.js";

const library = (game: Game): readonly ObjectId[] => game.state.zones.perPlayer[A].library;

describe("Part in Friendship", () => {
  it("a creature card with mana value at most your lands goes onto the battlefield, the rest to the bottom", () => {
    const { game } = table();
    spawn(game, "Part in Friendship");
    lands(game, "Forest", 2);
    const bears = toLibrary(game, "Grizzly Bears");
    const bolt = toLibrary(game, "Lightning Bolt");
    const forest = toLibrary(game, "Forest");
    const giant = spawn(game, "Hill Giant");
    destroy(game, giant);
    expect(game.state.objects[bears].zone).toBe("battlefield");
    expect(game.state.objects[bears].controller).toBe(A);
    // The two cards revealed before it are now the bottom two, in some order.
    expect([...library(game).slice(-2)].sort()).toEqual([bolt, forest].sort());
    expect(hand(game)).not.toContain(bears);
  });

  it("one with greater mana value goes into your hand instead", () => {
    const { game } = table();
    spawn(game, "Part in Friendship");
    lands(game, "Forest", 2);
    const wurm = toLibrary(game, "Craw Wurm");
    const bolt = toLibrary(game, "Lightning Bolt");
    const before = hand(game).length;
    const giant = spawn(game, "Hill Giant");
    destroy(game, giant);
    expect(game.state.objects[wurm].zone).toBe("hand");
    expect(hand(game)).toHaveLength(before + 1);
    expect(library(game).at(-1)).toBe(bolt);
    // Put, not drawn.
    expect(game.state.eventLog.some((e) => e.type === "card-drawn" && e.object === wurm)).toBe(false);
  });

  it("the lands are counted as it resolves: equal mana value still goes onto the battlefield", () => {
    const { game } = table();
    spawn(game, "Part in Friendship");
    lands(game, "Forest", 6);
    const wurm = toLibrary(game, "Craw Wurm");
    const giant = spawn(game, "Hill Giant");
    destroy(game, giant);
    expect(game.state.objects[wurm].zone).toBe("battlefield");
  });

  it("a token creature dying doesn't trigger it", () => {
    const { game } = table();
    spawn(game, "Part in Friendship");
    lands(game, "Forest", 2);
    const bears = toLibrary(game, "Grizzly Bears");
    game.debugApplyEffect(A, { kind: "create-token", token: "Soldier Token", count: 1 }, []);
    expect(tokensNamed(game, "Soldier Token")).toBe(1);
    destroy(game, named(game, "Soldier Token")[0]);
    expect(game.state.objects[bears].zone).toBe("library");
    expect(library(game)[0]).toBe(bears);
  });

  it("triggers only once each turn", () => {
    const { game } = table();
    spawn(game, "Part in Friendship");
    lands(game, "Forest", 2);
    const second = toLibrary(game, "Grizzly Bears");
    const first = toLibrary(game, "Grizzly Bears");
    destroy(game, spawn(game, "Hill Giant"));
    expect(game.state.objects[first].zone).toBe("battlefield");
    destroy(game, spawn(game, "Hill Giant"));
    expect(game.state.objects[second].zone).toBe("library");
  });
});
