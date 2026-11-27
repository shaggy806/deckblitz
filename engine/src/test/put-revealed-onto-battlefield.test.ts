import { describe, expect, it } from "vitest";

import { A, B, C, spawn, table, toLibrary, toStep, zone } from "./harness.js";

// "Each player reveals the top card of their library. If all cards revealed
// this way are creature cards, put those cards onto the battlefield under
// their owners' control": `reveal-top` `who: "each-player"`, then a
// `conditional` on no non-creature card revealed around
// `put-exiled-this-way-onto-battlefield` `revealed` — Game Preserve.

describe("Game Preserve", () => {
  it("puts every revealed card onto the battlefield, under its owner's control, when all are creatures", () => {
    const { game } = table({ players: 3 });
    spawn(game, "Game Preserve");
    // On the stack as the upkeep begins; the libraries are read as it resolves.
    toStep(game, "upkeep");
    const giant = toLibrary(game, "Hill Giant", A);
    const bears = toLibrary(game, "Grizzly Bears", B);
    const ogre = toLibrary(game, "Gray Ogre", C);
    toStep(game, "draw");
    for (const [id, owner] of [[giant, A], [bears, B], [ogre, C]] as const) {
      expect(zone(game, id)).toBe("battlefield");
      expect(game.state.objects[id].controller).toBe(owner);
    }
  });

  it("puts none of them onto the battlefield when one revealed card isn't a creature", () => {
    const { game } = table({ players: 3 });
    spawn(game, "Game Preserve");
    toStep(game, "upkeep");
    toLibrary(game, "Hill Giant", A);
    const bears = toLibrary(game, "Grizzly Bears", B);
    const bolt = toLibrary(game, "Lightning Bolt", C);
    toStep(game, "draw");
    expect(zone(game, bears)).toBe("library");
    expect(game.state.zones.perPlayer[B].library[0]).toBe(bears);
    expect(game.state.zones.perPlayer[C].library[0]).toBe(bolt);
  });
});
