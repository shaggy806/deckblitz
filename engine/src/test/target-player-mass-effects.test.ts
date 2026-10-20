/**
 * "… all … target player controls" — `controlledByTarget` on `destroy-all`, `return-to-hand-all`,
 * `exile-all` and `tap-all`: the filter is read from the target player's side. River's Rebuke,
 * Overwhelming Forces, Rain of Daggers, Naya Charm.
 */
import { describe, expect, it } from "vitest";

import { A, B, cast, hand, lands, life, loyalty, ref, spawn, table, toHand, zone } from "./harness.js";

describe("mass effects over a target player's permanents", () => {
  it("River's Rebuke returns only that player's nonland permanents", () => {
    const { game } = table();
    lands(game, "Island", 6);
    const mine = spawn(game, "Grizzly Bears");
    const theirs = spawn(game, "Hill Giant", B);
    const theirLand = spawn(game, "Forest", B);
    cast(game, toHand(game, "River's Rebuke"), { targets: [ref(B)] });
    expect(zone(game, theirs)).toBe("hand");
    expect(zone(game, theirLand)).toBe("battlefield");
    expect(zone(game, mine)).toBe("battlefield");
  });

  it("Overwhelming Forces draws for each creature actually destroyed", () => {
    const { game } = table();
    lands(game, "Swamp", 8);
    const mine = spawn(game, "Grizzly Bears");
    const bears = spawn(game, "Grizzly Bears", B);
    const giant = spawn(game, "Hill Giant", B);
    const colossus = spawn(game, "Darksteel Colossus", B);
    const before = hand(game).length;
    cast(game, toHand(game, "Overwhelming Forces"), { targets: [ref(B)] });
    expect(zone(game, bears)).toBe("graveyard");
    expect(zone(game, giant)).toBe("graveyard");
    expect(zone(game, colossus)).toBe("battlefield");
    expect(zone(game, mine)).toBe("battlefield");
    // The spell left the hand; two cards came back in.
    expect(hand(game).length).toBe(before + 2);
  });

  it("Rain of Daggers: 2 life for each creature destroyed", () => {
    const { game } = table();
    lands(game, "Swamp", 6);
    spawn(game, "Grizzly Bears", B);
    spawn(game, "Hill Giant", B);
    cast(game, toHand(game, "Rain of Daggers"), { targets: [ref(B)] });
    expect(life(game, A)).toBe(16);
  });

  it("Naya Charm taps all creatures target player controls", () => {
    const { game } = table();
    for (const land of ["Mountain", "Forest", "Plains"]) spawn(game, land);
    const mine = spawn(game, "Grizzly Bears");
    const theirs = spawn(game, "Hill Giant", B);
    cast(game, toHand(game, "Naya Charm"), { modes: [2], targets: [ref(B)] });
    expect(game.state.objects[theirs].tapped).toBe(true);
    expect(game.state.objects[mine].tapped).toBe(false);
  });
});

describe("Ajani Vengeant", () => {
  it("−7 destroys all lands target player controls", () => {
    const { game } = table();
    const ajani = spawn(game, "Ajani Vengeant");
    const myLand = spawn(game, "Plains");
    const theirLand = spawn(game, "Forest", B);
    loyalty(game, ajani, -7, { atLeast: 7, targets: [ref(B)] });
    expect(zone(game, theirLand)).toBe("graveyard");
    expect(zone(game, myLand)).toBe("battlefield");
  });
});
