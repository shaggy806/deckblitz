/**
 * `CardFilter.sameNameAsTriggerObject`: "the number of cards in all graveyards with the same name
 * as that spell" (Odyssey's Shrines, rule 201.2a) — a `countInGraveyard` bound, as the effect
 * applies, to the name of the spell whose casting fired the trigger.
 */
import { describe, expect, it } from "vitest";

import { A, B, cast, graveyard, hand, lands, life, ref, settle, spawn, table, toGraveyard, toHand, tokensNamed, zone } from "./harness.js";

describe("the Shrines count graveyard cards named like the spell", () => {
  it("Aven Shrine: the caster gains 1 life per same-named card in every graveyard, none for others", () => {
    const { game } = table();
    spawn(game, "Aven Shrine", B);
    toGraveyard(game, "Grizzly Bears", A);
    toGraveyard(game, "Grizzly Bears", B);
    toGraveyard(game, "Llanowar Elves", B);
    lands(game, "Forest", 2);
    cast(game, toHand(game, "Grizzly Bears"));
    expect(life(game, A)).toBe(22);
    expect(life(game, B)).toBe(20);
  });

  it("Nantuko Shrine: the caster makes that many Squirrels; nothing when no card shares the name", () => {
    const { game } = table();
    spawn(game, "Nantuko Shrine", B);
    toGraveyard(game, "Lightning Bolt", B);
    toGraveyard(game, "Lightning Bolt", B);
    lands(game, "Mountain", 1);
    cast(game, toHand(game, "Lightning Bolt"), { targets: [ref(B)] });
    expect(tokensNamed(game, "Squirrel Token", A)).toBe(2);
    expect(tokensNamed(game, "Squirrel Token", B)).toBe(0);
    lands(game, "Forest", 2);
    cast(game, toHand(game, "Grizzly Bears"));
    expect(tokensNamed(game, "Squirrel Token", A)).toBe(2);
  });

  it("Cabal Shrine: the caster discards X; a countered spell in the graveyard counts itself", () => {
    const { game } = table();
    spawn(game, "Cabal Shrine", B);
    lands(game, "Mountain", 1);
    const bolt = toHand(game, "Lightning Bolt");
    toGraveyard(game, "Lightning Bolt", B);
    const before = hand(game, A).length;
    cast(game, bolt, { targets: [ref(B)], settle: false });
    // Countered in response: it's in the graveyard as the trigger resolves, a second Bolt there.
    game.debugApplyEffect(B, { kind: "counter", target: 0 }, [ref(bolt)]);
    expect(zone(game, bolt)).toBe("graveyard");
    settle(game);
    // The cast took Bolt from a hand of `before`; two Bolts in graveyards, so two discards.
    expect(hand(game, A).length).toBe(before - 1 - 2);
  });

  it("Cephalid Shrine counters a spell its caster can't pay X for, and not one with X = 0", () => {
    const { game, a } = table();
    // Alice pays whenever she's asked: {0} first, then a {1} she has no mana left for.
    a.chooseModesFn = () => [0];
    spawn(game, "Cephalid Shrine", B);
    lands(game, "Forest", 2);
    const free = toHand(game, "Grizzly Bears");
    cast(game, free);
    expect(zone(game, free)).toBe("battlefield");
    lands(game, "Forest", 2);
    const second = toHand(game, "Grizzly Bears");
    toGraveyard(game, "Grizzly Bears", B);
    cast(game, second);
    expect(zone(game, second)).toBe("graveyard");
  });

  it("Dwarven Shrine deals twice the count to the caster", () => {
    const { game } = table();
    spawn(game, "Dwarven Shrine", B);
    toGraveyard(game, "Grizzly Bears", B);
    toGraveyard(game, "Grizzly Bears", A);
    toGraveyard(game, "Grizzly Bears", A);
    lands(game, "Forest", 2);
    cast(game, toHand(game, "Grizzly Bears"));
    expect(life(game, A)).toBe(14);
    expect(graveyard(game, A).length).toBe(2);
  });
});
