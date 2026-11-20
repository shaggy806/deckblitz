/**
 * A resolved "the next time one or more … enter this turn, each enters with N
 * additional counters" — `replacement-effect` with `next: true` over
 * `others-enter-battlefield`'s `counters` (rules 614.1c, 615.8's "next
 * time"): everything entering in that one event gets them, then it's spent.
 * Storyweave.
 */
import { describe, expect, it } from "vitest";

import { A, B, cast, counters, lands, ref, spawn, table, toGraveyard, toHand, zone } from "./harness.js";
import type { Game } from "../game.js";

function weave(game: Game): void {
  const saga = spawn(game, "The Eldest Reborn", A);
  expect(counters(game, saga, "lore")).toBe(1);
  lands(game, "Forest", 3);
  cast(game, toHand(game, "Storyweave"), { modes: [1], targets: [ref(saga)] });
  // Two more lore counters: chapters II and III, and the Saga is sacrificed (714.4).
  expect(zone(game, saga)).toBe("graveyard");
}

describe("Storyweave", () => {
  it("mode one: two +1/+1 counters on a creature you control", () => {
    const { game } = table();
    const bears = spawn(game, "Grizzly Bears", A);
    lands(game, "Forest", 3);
    cast(game, toHand(game, "Storyweave"), { modes: [0], targets: [ref(bears)] });
    expect(counters(game, bears)).toBe(2);
  });

  it("mode two: lore counters on the Saga, and the next enchantment creature enters with two counters", () => {
    const { game } = table();
    weave(game);
    expect(game.state.activeReplacements).toHaveLength(1);
    const bears = spawn(game, "Grizzly Bears", A); // not an enchantment: the shield waits
    expect(counters(game, bears)).toBe(0);
    const opponents = spawn(game, "Nyxborn Courser", B); // not yours
    expect(counters(game, opponents)).toBe(0);
    const eidolon = spawn(game, "Eidolon of Blossoms", A);
    expect(counters(game, eidolon)).toBe(2);
    expect(game.state.activeReplacements).toHaveLength(0);
    const courser = spawn(game, "Nyxborn Courser", A);
    expect(counters(game, courser)).toBe(0);
  });

  it("everything entering in that one event gets them", () => {
    const { game } = table();
    weave(game);
    const one = toGraveyard(game, "Eidolon of Blossoms", A);
    const two = toGraveyard(game, "Nyxborn Courser", A);
    game.debugApplyEffect(A, {
      kind: "return-from-graveyard",
      filter: { types: ["enchantment", "creature"] },
      destination: "battlefield",
      count: "all",
    }, []);
    expect(counters(game, one)).toBe(2);
    expect(counters(game, two)).toBe(2);
    expect(game.state.activeReplacements).toHaveLength(0);
  });
});
