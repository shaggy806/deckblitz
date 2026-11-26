/**
 * A spell's own activated ability that works while it's on the stack
 * (`ActivatedAbility.zone: "stack"`, rule 113.6), any player's to activate
 * with `anyPlayer` (602.2): Lightning Storm's "Discard a land card: Put two
 * charge counters on Lightning Storm. You may choose a new target for it."
 * The counters are on the spell (rule 122.1), read as it resolves; the new
 * target is the activator's choice (`change-targets` of `"source"`, 115.7d).
 */
import { describe, expect, it } from "vitest";

import { A, B, activate, cast, graveyard, hand, lands, life, pickTargets, ref, settle, table, toHand } from "./harness.js";

const stormOffers = (game: ReturnType<typeof table>["game"], player: typeof A, storm: string): number =>
  game.legalActions(player).filter((x) => x.kind === "activate-ability" && x.source === storm).length;

describe("Lightning Storm", () => {
  it("any player may discard a land to add two charge counters and choose a new target", () => {
    const { game, b } = table();
    game.state.zones.perPlayer[B].hand = [];
    const mountain = toHand(game, "Mountain", B);
    lands(game, "Mountain", 3);
    const storm = toHand(game, "Lightning Storm");
    cast(game, storm, { targets: [ref(B)], settle: false });
    game.advanceUntil((s) => s.priority.holder === B);
    expect(stormOffers(game, B, storm)).toBe(1);
    pickTargets(b, A);
    activate(game, storm, 0, { player: B, settle: false });
    expect(graveyard(game, B)).toContain(mountain);
    settle(game);
    expect(life(game, A)).toBe(15);
    expect(life(game, B)).toBe(20);
    expect(game.state.objects[storm].counters.charge ?? 0).toBe(0);
  });

  it("stacks its counters, the target kept by choice; not offered off the stack or without a land", () => {
    const { game, a } = table();
    game.state.zones.perPlayer[A].hand = [];
    game.state.zones.perPlayer[B].hand = [];
    lands(game, "Mountain", 3);
    const storm = toHand(game, "Lightning Storm");
    toHand(game, "Forest");
    toHand(game, "Forest");
    // In the hand it's no spell: the ability doesn't work there.
    expect(stormOffers(game, A, storm)).toBe(0);
    cast(game, storm, { targets: [ref(B)], settle: false });
    pickTargets(a, B);
    activate(game, storm, 0, { settle: false });
    game.advanceUntil((s) => s.zones.shared.stack.length === 1 && s.priority.holder === A);
    expect(game.state.objects[storm].counters.charge).toBe(2);
    activate(game, storm, 0, { settle: false });
    game.advanceUntil((s) => s.zones.shared.stack.length === 1 && s.priority.holder === A);
    expect(game.state.objects[storm].counters.charge).toBe(4);
    expect(hand(game, A)).toEqual([]);
    // Bob has no land card to discard.
    game.advanceUntil((s) => s.priority.holder === B);
    expect(game.state.zones.shared.stack).toEqual([storm]);
    expect(stormOffers(game, B, storm)).toBe(0);
    settle(game);
    expect(life(game, B)).toBe(13);
    expect(stormOffers(game, A, storm)).toBe(0);
  });
});
