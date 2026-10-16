/**
 * Squad (rule 702.157a): "As an additional cost to cast this spell, you may
 * pay [cost] any number of times" and "When this creature enters, if its
 * squad cost was paid, create a token that's a copy of it for each time its
 * squad cost was paid." Multikicker under its own name (`keyword: "squad"`)
 * with the `squadTrigger` helper.
 */
import { describe, expect, it } from "vitest";

import type { Game } from "../game.js";

import { A, cast, lands, pickTargets, settle, table, toHand } from "./harness.js";

const gangers = (game: Game) =>
  game.state.zones.shared.battlefield.filter((id) => game.state.objects[id].cardName === "Powder Ganger");

describe("squad", () => {
  it("one token copy for each time the squad cost was paid", () => {
    const { game, a } = table();
    lands(game, "Mountain", 7);
    pickTargets(a, null);
    cast(game, toHand(game, "Powder Ganger"), { kicked: true, kickCount: 2 });
    settle(game);
    const all = gangers(game);
    expect(all).toHaveLength(3);
    expect(all.filter((id) => game.state.objects[id].isToken)).toHaveLength(2);
  });

  it("offers each count the mana covers", () => {
    const { game } = table();
    lands(game, "Mountain", 7);
    const card = toHand(game, "Powder Ganger");
    const counts = game
      .legalActions(A)
      .filter((l) => l.kind === "cast-spell" && l.card === card)
      .map((l) => (l.kind === "cast-spell" ? (l.kicked === true ? (l.kickCount ?? 1) : 0) : -1));
    expect(counts.sort()).toEqual([0, 1, 2]);
  });

  it("unpaid, no copies — and the copies, not being cast, make none of their own", () => {
    const { game, a } = table();
    lands(game, "Mountain", 8);
    pickTargets(a, null);
    cast(game, toHand(game, "Powder Ganger"));
    settle(game);
    expect(gangers(game)).toHaveLength(1);
    cast(game, toHand(game, "Powder Ganger"), { kicked: true, kickCount: 1 });
    settle(game);
    // One more cast, one copy of it: three in all, not a cascade of copies.
    expect(gangers(game)).toHaveLength(3);
  });

  it("each copy's own enters trigger destroys an artifact", () => {
    const { game, a } = table();
    lands(game, "Mountain", 7);
    const stones = [0, 1, 2].map(() => game.debugSpawn("Mind Stone", "bob" as never, "battlefield"));
    let next = 0;
    a.chooseTargetsFn = () => [{ kind: "object", object: stones[next++] }];
    cast(game, toHand(game, "Powder Ganger"), { kicked: true, kickCount: 2 });
    settle(game);
    expect(stones.filter((id) => game.state.objects[id].zone === "graveyard")).toHaveLength(3);
  });
});
