/**
 * "The discarded card": a card discarded to pay a spell's or an ability's
 * cost, remembered on it (`LastKnownRefs.discarded`) and read by its effect
 * as it resolves — the `"discarded"` amount ref (Volrath the Fallen's "where
 * X is the discarded card's mana value") and the `discarded` condition (Moria
 * Scavenger's "if the discarded card was a creature card", Grab the Prize's
 * "wasn't a land card", Stormscale Anarch's "was multicolored"). Recorded as
 * the cost is paid (rule 602.2b, 601.2h): once a chosen discard is answered,
 * at once for a forced or random one.
 */
import { describe, expect, it } from "vitest";

import { A, B, activate, cast, counters, graveyard, hand, lands, life, pt, quiet, ref, spawn, subtypes, table, toHand, zone } from "./harness.js";
import type { Game } from "../game.js";
import type { ObjectId } from "../primitives.js";

/** Alice's opening Wastes back into her library, so a test's hand is its own. */
const emptyHand = (game: Game): void => {
  for (const id of [...hand(game)]) game.debugMove(id, "library");
};
/** The +1/+1 counters on alice's Army, -1 for none. */
const army = (game: Game): number => {
  const id = game.battlefield.find((o) => game.state.objects[o].controller === A && subtypes(game, o).includes("Army"));
  return id === undefined ? -1 : counters(game, id);
};
const discard = (game: Game, ...cards: ObjectId[]): void => {
  expect(game.state.awaiting?.kind).toBe("discard");
  game.dispatch({ type: "discard", player: A, cards });
};

describe("the card discarded to pay a cost", () => {
  it("Volrath the Fallen gets +X/+X for the chosen creature card's mana value", () => {
    const { game } = table();
    emptyHand(game);
    lands(game, "Swamp", 2);
    const volrath = spawn(game, "Volrath the Fallen");
    const giant = toHand(game, "Hill Giant");
    toHand(game, "Llanowar Elves");
    activate(game, volrath, 0, { settle: false });
    // The ability waits on the stack for its cost.
    expect(game.state.zones.shared.stack.length).toBe(1);
    discard(game, giant);
    game.advanceUntil(quiet);
    expect(zone(game, giant)).toBe("graveyard");
    expect(pt(game, volrath)).toEqual({ power: 10, toughness: 8 });
  });

  it("reads each activation's own card", () => {
    const { game } = table();
    emptyHand(game);
    lands(game, "Swamp", 4);
    const volrath = spawn(game, "Volrath the Fallen");
    const giant = toHand(game, "Hill Giant");
    const elves = toHand(game, "Llanowar Elves");
    activate(game, volrath, 0, { settle: false });
    discard(game, giant);
    // A second activation in response, with the other card: the only one
    // left, discarded at once.
    activate(game, volrath, 0, { settle: false });
    expect(game.state.awaiting).toBeNull();
    game.advanceUntil(quiet);
    expect(graveyard(game)).toContain(elves);
    expect(pt(game, volrath)).toEqual({ power: 6 + 4 + 1, toughness: 4 + 4 + 1 });
  });

  it("Moria Scavenger amasses only when the discarded card was a creature card", () => {
    const { game } = table();
    emptyHand(game);
    const scavenger = spawn(game, "Moria Scavenger");
    const swamp = toHand(game, "Swamp");
    const giant = toHand(game, "Hill Giant");
    activate(game, scavenger, 0, { settle: false });
    discard(game, swamp);
    game.advanceUntil(quiet);
    expect(army(game)).toBe(-1);
    game.state.objects[scavenger].tapped = false;
    activate(game, scavenger, 0, { settle: false });
    discard(game, giant);
    game.advanceUntil(quiet);
    expect(army(game)).toBe(1);
  });

  it("a forced discard (the only card) is remembered too", () => {
    const { game } = table();
    emptyHand(game);
    const scavenger = spawn(game, "Moria Scavenger");
    const giant = toHand(game, "Hill Giant");
    activate(game, scavenger, 0);
    expect(zone(game, giant)).toBe("graveyard");
    expect(army(game)).toBe(1);
  });

  it("Grab the Prize reads the card discarded as its additional cost", () => {
    const { game } = table();
    emptyHand(game);
    lands(game, "Mountain", 4);
    const first = toHand(game, "Grab the Prize");
    const swamp = toHand(game, "Swamp");
    const giant = toHand(game, "Hill Giant");
    cast(game, first, { settle: false });
    discard(game, swamp);
    game.advanceUntil(quiet);
    expect(life(game, B)).toBe(20);
    const second = toHand(game, "Grab the Prize");
    cast(game, second, { settle: false });
    discard(game, giant);
    game.advanceUntil(quiet);
    expect(life(game, B)).toBe(18);
  });

  it("a madness card discarded for the cost is read in exile", () => {
    const { game } = table();
    emptyHand(game);
    lands(game, "Mountain", 2);
    const grab = toHand(game, "Grab the Prize");
    const temper = toHand(game, "Fiery Temper");
    // The only other card: discarded at once, into exile (rule 702.35a).
    cast(game, grab);
    expect(zone(game, temper)).not.toBe("hand");
    expect(life(game, B)).toBe(18);
  });

  it("Stormscale Anarch deals 4 for a multicolored card discarded at random, 2 otherwise", () => {
    const { game } = table();
    emptyHand(game);
    lands(game, "Mountain", 6);
    const anarch = spawn(game, "Stormscale Anarch");
    toHand(game, "Lightning Helix");
    activate(game, anarch, 0, { targets: [ref(B)] });
    expect(life(game, B)).toBe(16);
    toHand(game, "Hill Giant");
    activate(game, anarch, 0, { targets: [ref(B)] });
    expect(life(game, B)).toBe(14);
  });
});
