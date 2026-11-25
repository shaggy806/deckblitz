/**
 * `PlayerView.delayedTriggers`: the delayed triggered abilities waiting to
 * trigger (rule 603.7), which the client lists beside each player's emblems
 * so a table can see what comes back or gets cast later.
 */
import { describe, expect, it } from "vitest";
import { A, B, cast, lands, pickTargets, ref, spawn, table, toHand, zone } from "./harness.js";

describe("the view's delayed triggers", () => {
  it("shows a rebound card's cast at its controller's next upkeep to every player, naming the card", () => {
    const { game } = table({ openingHandSize: 0 });
    lands(game, "Island", 6);
    const insight = toHand(game, "Recurring Insight");
    expect(game.viewFor(B).delayedTriggers).toEqual([]);
    cast(game, insight, { targets: [ref(B)] });
    expect(zone(game, insight)).toBe("exile");
    for (const viewer of [A, B]) {
      expect(game.viewFor(viewer).delayedTriggers).toEqual([
        {
          controller: A,
          source: "Recurring Insight",
          text: "Rebound — you may cast this card from exile without paying its mana cost.",
          at: { step: "upkeep", whose: A, which: "next" },
          objects: [insight],
        },
      ]);
    }
  });

  it("names the card a flicker returns at the next end step, though it's a new object in exile", () => {
    const { game, a } = table({ openingHandSize: 0 });
    lands(game, "Plains", 3);
    const bears = spawn(game, "Grizzly Bears", B);
    pickTargets(a, bears);
    cast(game, toHand(game, "Flickerwisp"));
    expect(zone(game, bears)).toBe("exile");
    const [delayed] = game.viewFor(B).delayedTriggers ?? [];
    expect(delayed).toMatchObject({ controller: A, source: "Flickerwisp", at: { step: "end", whose: "any", which: "next" } });
    expect(delayed.objects).toEqual([bears]);
  });
});
