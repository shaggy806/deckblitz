/**
 * Impending (rule 702.176a): cast for its impending cost — an alternative
 * cost — the permanent enters with N time counters and isn't a creature
 * while it has one, and at the beginning of its controller's end step a time
 * counter is removed. The Overlords of Duskmourn.
 */
import { describe, expect, it } from "vitest";

import type { Game } from "../game.js";
import type { ObjectId } from "../primitives.js";
import { A, B, cast, counters, destroy, lands, life, pickTargets, ref, settle, spawn, table, toHand, toStep, tokensNamed, types, zone } from "./harness.js";

const INSECT = "Insect Token (Overlord of the Mistmoors)";

const offers = (game: Game, card: ObjectId) =>
  game.legalActions(A).filter((a) => a.kind === "cast-spell" && a.card === card && a.via === "impending");

describe("impending", () => {
  it("Overlord of the Mistmoors for {2}{W}{W}: four time counters, not a creature, its enters trigger still fires", () => {
    const { game } = table();
    lands(game, "Plains", 4);
    const overlord = toHand(game, "Overlord of the Mistmoors");
    expect(offers(game, overlord)).toHaveLength(1);
    cast(game, overlord, { via: "impending" });
    expect(zone(game, overlord)).toBe("battlefield");
    expect(counters(game, overlord, "time")).toBe(4);
    expect(types(game, overlord)).toEqual(["enchantment"]);
    expect(tokensNamed(game, INSECT, A)).toBe(2);
  });

  it("enters already a noncreature: a 'whenever another creature enters' trigger doesn't see it", () => {
    const { game } = table();
    spawn(game, "Soul Warden");
    lands(game, "Plains", 4);
    const before = life(game, A);
    cast(game, toHand(game, "Overlord of the Mistmoors"), { via: "impending" });
    // The two Insects only.
    expect(life(game, A)).toBe(before + 2);
  });

  it("loses a time counter at each of its controller's end steps only, then is a creature", () => {
    const { game } = table();
    lands(game, "Plains", 4);
    const overlord = toHand(game, "Overlord of the Mistmoors");
    cast(game, overlord, { via: "impending" });
    toStep(game, "end");
    settle(game);
    expect(counters(game, overlord, "time")).toBe(3);
    // Through bob's turn (his end step removes nothing) to alice's next.
    toStep(game, "end");
    settle(game);
    expect(counters(game, overlord, "time")).toBe(2);
    toStep(game, "end");
    settle(game);
    toStep(game, "end");
    settle(game);
    expect(counters(game, overlord, "time")).toBe(0);
    expect(types(game, overlord)).toContain("creature");
  });

  it("cast for its mana cost, it's a creature with no time counters", () => {
    const { game } = table();
    lands(game, "Plains", 7);
    const overlord = toHand(game, "Overlord of the Mistmoors");
    cast(game, overlord);
    expect(counters(game, overlord, "time")).toBe(0);
    expect(types(game, overlord)).toContain("creature");
  });

  it("time counters from elsewhere don't stop a permanent that wasn't cast for impending", () => {
    const { game } = table();
    const overlord = spawn(game, "Overlord of the Mistmoors");
    game.debugApplyEffect(A, { kind: "add-counter", target: 0, counter: "time", amount: 2 }, [ref(overlord)]);
    expect(types(game, overlord)).toContain("creature");
  });

  it("Overlord of the Boilerbilges deals 4 damage as it enters, and it can be destroyed as an enchantment", () => {
    const { game, a } = table();
    lands(game, "Mountain", 4);
    const overlord = toHand(game, "Overlord of the Boilerbilges");
    pickTargets(a, B);
    cast(game, overlord, { via: "impending" });
    expect(life(game, B)).toBe(16);
    expect(types(game, overlord)).toEqual(["enchantment"]);
    destroy(game, overlord);
    expect(zone(game, overlord)).toBe("graveyard");
  });

  it("Overlord of the Hauntwoods makes a tapped Everywhere that taps for any color", () => {
    const { game } = table();
    lands(game, "Forest", 3);
    cast(game, toHand(game, "Overlord of the Hauntwoods"), { via: "impending" });
    const everywhere = game.state.zones.shared.battlefield.find((id) => game.state.objects[id].cardName === "Everywhere Token");
    expect(everywhere).toBeDefined();
    expect(game.state.objects[everywhere!].tapped).toBe(true);
    expect(types(game, everywhere!)).toEqual(["land"]);
  });
});
