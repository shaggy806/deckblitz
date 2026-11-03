/**
 * One count of the different mana values or mana costs among a zone's cards,
 * as an amount and as a threshold: the `distinct` aggregate's `"mana-cost"`
 * (Embodiment of Agonies), and Murders at Karlov Manor's "five or more mana
 * values among cards in your graveyard" as a conditional flash (Graveyard
 * Shift), an intervening if (Sanguine Spy) and a spell's "unless" (Tainted
 * Indulgence).
 */
import { describe, expect, it } from "vitest";

import { A, B, cast, counters, enter, graveyard, hand, lands, life, nextTurn, pickModes, ref, settle, spawn, table, toGraveyard, toHand, toStep, zone } from "./harness.js";
import type { Game } from "../game.js";
import type { PlayerId } from "../primitives.js";

/** Cards of mana values 0 (a land), 1, 2, 3 and 6 for `player`'s graveyard:
 * five mana values, the last left out with `n` of them. */
const manaValues = (game: Game, n: number, player: PlayerId = A): void => {
  for (const name of ["Wastes", "Lightning Bolt", "Grizzly Bears", "Murder", "Craw Wurm"].slice(0, n)) {
    toGraveyard(game, name, player);
  }
};

describe("each different mana cost among nonland cards in your graveyard", () => {
  it("tells costs apart by their symbols, not their total, each once", () => {
    const { game } = table();
    // {1}{B}{B} and {2}{B}: the same mana value, two mana costs. A second
    // {1}{B}{B} under another name adds nothing.
    toGraveyard(game, "Murder");
    toGraveyard(game, "Sanguine Spy");
    toGraveyard(game, "Embodiment of Agonies");
    const embodiment = enter(game, "Embodiment of Agonies");
    expect(counters(game, embodiment)).toBe(2);
  });

  it("leaves out lands, a card with no mana cost, and other players' graveyards", () => {
    const { game } = table();
    toGraveyard(game, "Wastes");
    toGraveyard(game, "Ancestral Vision");
    toGraveyard(game, "Murder", B);
    toGraveyard(game, "Grizzly Bears");
    const embodiment = enter(game, "Embodiment of Agonies");
    expect(counters(game, embodiment)).toBe(1);
  });

  it("reads a split card's combined cost as one mana cost", () => {
    const { game } = table();
    toGraveyard(game, "Fire // Ice");
    // {1}{R} on its own isn't the {1}{R}{1}{U} a graveyard's Fire // Ice has.
    toGraveyard(game, "Lightning Strike");
    const embodiment = enter(game, "Embodiment of Agonies");
    expect(counters(game, embodiment)).toBe(2);
  });

  it("with no such card enters with nothing and dies as a 0/0", () => {
    const { game } = table();
    toGraveyard(game, "Wastes");
    lands(game, "Swamp", 3);
    const embodiment = toHand(game, "Embodiment of Agonies");
    cast(game, embodiment);
    expect(zone(game, embodiment)).toBe("graveyard");
  });

  it("entering from your graveyard, it still counts itself (rule 614.12)", () => {
    const { game } = table();
    manaValues(game, 5);
    const embodiment = toGraveyard(game, "Embodiment of Agonies");
    lands(game, "Swamp", 5);
    cast(game, toHand(game, "Graveyard Shift"), { targets: [ref(embodiment)] });
    expect(zone(game, embodiment)).toBe("battlefield");
    // Bolt, Bears, Murder, Craw Wurm and itself ({1}{B}{B} once, with Murder):
    // its own cost is Murder's, so four costs; the land adds none.
    expect(counters(game, embodiment)).toBe(4);
  });
});

describe("five or more mana values among cards in your graveyard", () => {
  it("gives a spell flash with five, a land's 0 among them, and not with four", () => {
    const { game } = table({ step: "upkeep" });
    const bears = toGraveyard(game, "Grizzly Bears");
    toGraveyard(game, "Wastes");
    toGraveyard(game, "Lightning Bolt");
    toGraveyard(game, "Murder");
    lands(game, "Swamp", 5);
    const shift = toHand(game, "Graveyard Shift");
    const action = { type: "cast-spell", player: A, card: shift, targets: [ref(bears)] } as const;
    expect(game.canDispatch(action)).not.toBeNull();
    toGraveyard(game, "Craw Wurm");
    expect(game.canDispatch(action)).toBeNull();
    cast(game, shift, { targets: [ref(bears)] });
    expect(zone(game, bears)).toBe("battlefield");
  });

  it("counts one mana value once, however many cards have it", () => {
    const { game } = table({ step: "upkeep" });
    manaValues(game, 4);
    toGraveyard(game, "Murder");
    toGraveyard(game, "Sanguine Spy");
    lands(game, "Swamp", 5);
    const bears = graveyard(game).find((id) => game.state.objects[id].cardName === "Grizzly Bears")!;
    const shift = toHand(game, "Graveyard Shift");
    expect(game.canDispatch({ type: "cast-spell", player: A, card: shift, targets: [ref(bears)] })).not.toBeNull();
  });

  it("is an intervening if: no trigger with four, a may with five", () => {
    const { game, a } = table();
    spawn(game, "Sanguine Spy");
    manaValues(game, 4);
    pickModes(a, 0);
    const before = hand(game).length;
    toStep(game, "end");
    settle(game);
    expect(life(game)).toBe(20);
    expect(hand(game).length).toBe(before);

    manaValues(game, 5);
    nextTurn(game);
    // Bob's turn passes; alice's own end step is the one that asks.
    toStep(game, "precombat-main");
    const held = hand(game).length;
    toStep(game, "end");
    settle(game);
    expect(life(game)).toBe(18);
    expect(hand(game).length).toBe(held + 1);
  });

  it("the may costs nothing when declined", () => {
    const { game, a } = table();
    spawn(game, "Sanguine Spy");
    manaValues(game, 5);
    pickModes(a);
    const before = hand(game).length;
    toStep(game, "end");
    settle(game);
    expect(life(game)).toBe(20);
    expect(hand(game).length).toBe(before);
  });

  it("Sanguine Spy's surveil takes another creature, not itself", () => {
    const { game } = table();
    const spy = spawn(game, "Sanguine Spy");
    lands(game, "Swamp", 1);
    const bears = spawn(game, "Grizzly Bears");
    const refuse = { type: "activate-ability", player: A, source: spy, abilityIndex: 0, targets: [] } as const;
    expect(game.canDispatch({ ...refuse, sacrifice: spy })).not.toBeNull();
    game.dispatch({ ...refuse, sacrifice: bears });
    settle(game);
    expect(zone(game, bears)).toBe("graveyard");
    expect(zone(game, spy)).toBe("battlefield");
  });

  it("an unless: the discard comes with four, and not with five", () => {
    const { game } = table();
    manaValues(game, 4);
    lands(game, "Island", 1);
    lands(game, "Swamp", 1);
    const held = hand(game).length;
    cast(game, toHand(game, "Tainted Indulgence"));
    expect(hand(game).length).toBe(held + 1);

    const { game: game2 } = table();
    manaValues(game2, 5);
    lands(game2, "Island", 1);
    lands(game2, "Swamp", 1);
    const held2 = hand(game2).length;
    cast(game2, toHand(game2, "Tainted Indulgence"));
    expect(hand(game2).length).toBe(held2 + 2);
  });

  it("the unless doesn't count the spell itself, still on the stack as it reads", () => {
    const { game } = table();
    // 0, 1, 3 and 6: its own 2 would make five, once it has resolved.
    for (const name of ["Wastes", "Lightning Bolt", "Murder", "Craw Wurm"]) toGraveyard(game, name);
    lands(game, "Island", 1);
    lands(game, "Swamp", 1);
    const held = hand(game).length;
    cast(game, toHand(game, "Tainted Indulgence"));
    expect(hand(game).length).toBe(held + 1);
    expect(graveyard(game).filter((id) => game.state.objects[id].cardName === "Tainted Indulgence")).toHaveLength(1);
  });
});
