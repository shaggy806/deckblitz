/**
 * B338 (author-top-cards overnight), combat-targeting lane: Thraben Exorcism
 * and Shipwreck Sifters, "a creature/card with disturb" through
 * `hasKeyword: "disturb"`, with no engine code of their own.
 */
import { describe, expect, it } from "vitest";

import { A, B, attack, cast, counters, enter, lands, nextTurn, ref, spawn, table, toHand, toLibrary, zone } from "./harness.js";

describe("Thraben Exorcism", () => {
  it("exiles a non-Spirit creature with disturb, a Spirit or an enchantment, not a plain creature", () => {
    const { game } = table();
    lands(game, "Plains", 6);
    const beggar = spawn(game, "Beloved Beggar");
    const bears = spawn(game, "Grizzly Bears");
    const sailor = spawn(game, "Spectral Sailor");
    const first = toHand(game, "Thraben Exorcism");
    expect(
      game.canDispatch({ type: "cast-spell", player: A, card: first, targets: [ref(bears)] }),
    ).not.toBeNull();
    cast(game, first, { targets: [ref(beggar)] });
    expect(zone(game, beggar)).toBe("exile");
    cast(game, toHand(game, "Thraben Exorcism"), { targets: [ref(sailor)] });
    expect(zone(game, sailor)).toBe("exile");
    const anthem = spawn(game, "Glorious Anthem");
    cast(game, toHand(game, "Thraben Exorcism"), { targets: [ref(anthem)] });
    expect(zone(game, anthem)).toBe("exile");
    expect(zone(game, bears)).toBe("battlefield");
  });
});

describe("Shipwreck Sifters", () => {
  it("grows when you discard a card with disturb", () => {
    const { game, a } = table();
    toLibrary(game, "Island");
    const beggar = toHand(game, "Beloved Beggar");
    toHand(game, "Grizzly Bears");
    a.chooseDiscardsFn = () => [beggar];
    const sifters = enter(game, "Shipwreck Sifters");
    expect(zone(game, beggar)).toBe("graveyard");
    expect(counters(game, sifters)).toBe(1);
  });

  it("grows when you discard a Spirit card", () => {
    const { game, a } = table();
    toLibrary(game, "Island");
    const sailor = toHand(game, "Spectral Sailor");
    toHand(game, "Grizzly Bears");
    a.chooseDiscardsFn = () => [sailor];
    const sifters = enter(game, "Shipwreck Sifters");
    expect(zone(game, sailor)).toBe("graveyard");
    expect(counters(game, sifters)).toBe(1);
  });

  it("doesn't grow for another card", () => {
    const { game, a } = table();
    toLibrary(game, "Island");
    toHand(game, "Beloved Beggar");
    const bears = toHand(game, "Grizzly Bears");
    a.chooseDiscardsFn = () => [bears];
    const sifters = enter(game, "Shipwreck Sifters");
    expect(zone(game, bears)).toBe("graveyard");
    expect(counters(game, sifters)).toBe(0);
  });
});

describe("Total War", () => {
  it("destroys the attacker's untapped non-Wall creatures that didn't attack, but not new ones", () => {
    const { game, a } = table();
    spawn(game, "Total War", B);
    const attacker = spawn(game, "Grizzly Bears");
    const angel = spawn(game, "Serra Angel");
    const stayedHome = spawn(game, "Llanowar Elves");
    const wall = spawn(game, "Wall of Wood");
    const tapped = spawn(game, "Grizzly Bears", A, { tapped: true });
    const theirs = spawn(game, "Grizzly Bears", B);
    nextTurn(game);
    nextTurn(game);
    expect(game.state.turn.number).toBe(3);
    // Untap step untapped it; tap it again before combat.
    game.state.objects[tapped].tapped = true;
    const fresh = spawn(game, "Llanowar Elves");
    attack(game, a, [attacker, angel]);
    expect(zone(game, stayedHome)).toBe("graveyard");
    // Vigilance: attacked, so spared though untapped.
    expect(zone(game, angel)).toBe("battlefield");
    expect(zone(game, attacker)).toBe("battlefield");
    expect(zone(game, wall)).toBe("battlefield");
    expect(zone(game, tapped)).toBe("battlefield");
    expect(zone(game, fresh)).toBe("battlefield");
    expect(zone(game, theirs)).toBe("battlefield");
  });

  it("does nothing when no creature attacks", () => {
    const { game, a } = table();
    spawn(game, "Total War");
    const elves = spawn(game, "Llanowar Elves");
    nextTurn(game);
    nextTurn(game);
    attack(game, a, []);
    expect(zone(game, elves)).toBe("battlefield");
  });
});
