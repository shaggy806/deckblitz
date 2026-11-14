/**
 * "Return two creature cards at random from your graveyard to the
 * battlefield" (Moldgraf Monstrosity), "return X cards at random from your
 * graveyard to your hand" (Reap the Past): `choose-random-card`'s `count` —
 * that many different cards picked at random as it resolves, moved together.
 */

import { describe, expect, it } from "vitest";

import type { Game } from "../game.js";
import type { ObjectId } from "../primitives.js";
import { cast, destroy, graveyard, hand, lands, settle, spawn, table, toGraveyard, toHand, zone } from "./harness.js";

const entries = (game: Game, since: number): ObjectId[] =>
  game.state.eventLog.flatMap((e) => (e.seq >= since && e.type === "permanent-entered-battlefield" ? [e.object] : []));

describe("cards at random from a graveyard", () => {
  it("Moldgraf Monstrosity: exiled, then two different creature cards return at random, together", () => {
    const { game } = table();
    const moldgraf = spawn(game, "Moldgraf Monstrosity");
    const creatures = [toGraveyard(game, "Grizzly Bears"), toGraveyard(game, "Hill Giant"), toGraveyard(game, "Gray Ogre")];
    const bolt = toGraveyard(game, "Lightning Bolt");
    const since = game.state.eventSeq;
    destroy(game, moldgraf);
    settle(game);
    expect(zone(game, moldgraf)).toBe("exile");
    const back = creatures.filter((id) => zone(game, id) === "battlefield");
    expect(back).toHaveLength(2);
    expect(zone(game, bolt)).toBe("graveyard");
    expect(new Set(entries(game, since))).toEqual(new Set(back));
  });

  it("Moldgraf Monstrosity: with one creature card there, that one returns", () => {
    const { game } = table();
    const moldgraf = spawn(game, "Moldgraf Monstrosity");
    const bears = toGraveyard(game, "Grizzly Bears");
    destroy(game, moldgraf);
    settle(game);
    expect(zone(game, bears)).toBe("battlefield");
    expect(zone(game, moldgraf)).toBe("exile");
  });

  it("Moldgraf Monstrosity: the picks vary with the seed, each pair possible", () => {
    const seen = new Set<string>();
    for (let seed = 1; seed <= 24; seed += 1) {
      const { game } = table({ seed });
      const moldgraf = spawn(game, "Moldgraf Monstrosity");
      const names = ["Grizzly Bears", "Hill Giant", "Gray Ogre"];
      for (const name of names) toGraveyard(game, name);
      destroy(game, moldgraf);
      settle(game);
      seen.add(
        game.battlefield
          .map((id) => game.state.objects[id].cardName)
          .filter((n) => names.includes(n))
          .sort()
          .join("+"),
      );
    }
    expect(seen.size).toBe(3);
  });

  it("Reap the Past: X different cards to your hand, then it's exiled", () => {
    const { game } = table();
    lands(game, "Mountain", 2);
    lands(game, "Forest", 2);
    const cards = [toGraveyard(game, "Grizzly Bears"), toGraveyard(game, "Lightning Bolt"), toGraveyard(game, "Shock")];
    const reap = toHand(game, "Reap the Past");
    const before = hand(game).length;
    cast(game, reap, { x: 2 });
    expect(cards.filter((id) => zone(game, id) === "hand")).toHaveLength(2);
    expect(hand(game).length).toBe(before - 1 + 2);
    expect(zone(game, reap)).toBe("exile");
    expect(graveyard(game).filter((id) => cards.includes(id))).toHaveLength(1);
  });
});
