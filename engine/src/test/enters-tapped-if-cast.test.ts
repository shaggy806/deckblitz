/**
 * An entering replacement over other permanents that reads how each got
 * there (rule 614.12 — judged as it would exist on the battlefield):
 * "Creatures played by your opponents enter tapped" (Uphill Battle) — a
 * creature spell an opponent cast (`castBy: "opponent"`), or a creature land
 * an opponent played (rule 305.1, `played`). Put there any other way, or
 * cast by you, it enters untapped.
 */
import { describe, expect, it } from "vitest";

import { B, cast, lands, named, nextTurn, spawn, table, toHand } from "./harness.js";

describe("Uphill Battle", () => {
  it("taps a creature spell an opponent casts as it enters, not one you cast", () => {
    const { game } = table();
    spawn(game, "Uphill Battle");
    lands(game, "Forest", 2);
    cast(game, toHand(game, "Grizzly Bears"));
    const [mine] = named(game, "Grizzly Bears");
    expect(game.state.objects[mine].tapped).toBe(false);

    nextTurn(game);
    lands(game, "Forest", 2, B);
    cast(game, toHand(game, "Grizzly Bears", B), { player: B });
    const theirs = named(game, "Grizzly Bears", B)[0];
    expect(game.state.objects[theirs].tapped).toBe(true);
  });

  it("taps a creature land an opponent plays", () => {
    const { game } = table();
    spawn(game, "Uphill Battle");
    nextTurn(game);
    const arbor = toHand(game, "Dryad Arbor", B);
    game.dispatch({ type: "play-land", player: B, card: arbor });
    const [played] = named(game, "Dryad Arbor", B);
    expect(game.state.objects[played].tapped).toBe(true);
  });

  it("leaves untapped a creature an opponent puts onto the battlefield without playing it", () => {
    const { game } = table();
    spawn(game, "Uphill Battle");
    const bears = toHand(game, "Grizzly Bears", B);
    game.debugMove(bears, "battlefield");
    const [put] = named(game, "Grizzly Bears", B);
    expect(game.state.objects[put].tapped).toBe(false);
  });
});
