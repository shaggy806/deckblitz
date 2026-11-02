/**
 * An attack trigger narrowed by its attackers and by the player attacked:
 * `attacks-player`'s `filter` ("one or more Merfolk you control attack a
 * player", once per player attacked) and `attacks`' `attackedPlayer` (a Curse's
 * "whenever a creature attacks enchanted player", once per creature).
 */
import { describe, expect, it } from "vitest";
import type { ObjectId, PlayerId } from "../primitives.js";
import { A, B, C, cast, counters, lands, ref, spawn, table, toHand } from "./harness.js";
import type { Table } from "./harness.js";

/** Declare these attacks, and run until they've all resolved. */
const declare = (t: Table, attacks: readonly { attacker: ObjectId; defender: PlayerId | ObjectId }[]): void => {
  t.a.declareAttackersFn = () => attacks;
  t.game.advanceUntil((s) => s.turn.step === "declare-blockers");
};
const hand = (t: Table): number => t.game.state.zones.perPlayer[A].hand.length;

describe("attacks-player's filter (Attuma, Atlantean Warlord)", () => {
  it("draws once for a player attacked by any number of Merfolk", () => {
    const t = table();
    const attuma = spawn(t.game, "Attuma, Atlantean Warlord", A, { sick: false });
    const merfolk = spawn(t.game, "Merfolk of the Pearl Trident", A, { sick: false });
    const before = hand(t);
    declare(t, [
      { attacker: attuma, defender: B },
      { attacker: merfolk, defender: B },
    ]);
    expect(hand(t)).toBe(before + 1);
  });

  it("draws once per player attacked by a Merfolk (its filter sees each player's attackers)", () => {
    const t = table({ players: 3 });
    const attuma = spawn(t.game, "Attuma, Atlantean Warlord", A, { sick: false });
    const merfolk = spawn(t.game, "Merfolk of the Pearl Trident", A, { sick: false });
    const before = hand(t);
    declare(t, [
      { attacker: attuma, defender: B },
      { attacker: merfolk, defender: C },
    ]);
    expect(hand(t)).toBe(before + 2);
  });

  it("doesn't draw for a player attacked only by non-Merfolk", () => {
    const t = table({ players: 3 });
    const attuma = spawn(t.game, "Attuma, Atlantean Warlord", A, { sick: false });
    const bears = spawn(t.game, "Grizzly Bears", A, { sick: false });
    const before = hand(t);
    declare(t, [
      { attacker: attuma, defender: B },
      { attacker: bears, defender: C },
    ]);
    expect(hand(t)).toBe(before + 1);
  });

  it("doesn't draw when no Merfolk attacks", () => {
    const t = table();
    spawn(t.game, "Attuma, Atlantean Warlord", A);
    const bears = spawn(t.game, "Grizzly Bears", A, { sick: false });
    const before = hand(t);
    declare(t, [{ attacker: bears, defender: B }]);
    expect(hand(t)).toBe(before);
  });

  it("doesn't count a Merfolk attacking a planeswalker (rule 508.3a)", () => {
    const t = table();
    const attuma = spawn(t.game, "Attuma, Atlantean Warlord", A, { sick: false });
    const walker = spawn(t.game, "Jace Beleren", B);
    const before = hand(t);
    declare(t, [{ attacker: attuma, defender: walker }]);
    expect(hand(t)).toBe(before);
  });
});

/** A Curse cast by alice on `player`. */
const curse = (t: Table, name: string, player: PlayerId): void => {
  lands(t.game, "Forest", 2);
  lands(t.game, "Plains", 1);
  cast(t.game, toHand(t.game, name), { targets: [ref(player)] });
};

describe("attacks' attackedPlayer (a Curse's 'attacks enchanted player')", () => {
  it("Curse of Predation counters each creature attacking that player, on its own trigger", () => {
    const t = table({ players: 3 });
    curse(t, "Curse of Predation", B);
    const atB = spawn(t.game, "Grizzly Bears", A, { sick: false });
    const atBToo = spawn(t.game, "Grizzly Bears", A, { sick: false });
    const atC = spawn(t.game, "Grizzly Bears", A, { sick: false });
    declare(t, [
      { attacker: atB, defender: B },
      { attacker: atBToo, defender: B },
      { attacker: atC, defender: C },
    ]);
    expect(counters(t.game, atB)).toBe(1);
    expect(counters(t.game, atBToo)).toBe(1);
    expect(counters(t.game, atC)).toBe(0);
  });

  it("Curse of Predation ignores a creature attacking that player's planeswalker (rule 508.3a)", () => {
    const t = table();
    curse(t, "Curse of Predation", B);
    const walker = spawn(t.game, "Jace Beleren", B);
    const bears = spawn(t.game, "Grizzly Bears", A, { sick: false });
    declare(t, [{ attacker: bears, defender: walker }]);
    expect(counters(t.game, bears)).toBe(0);
  });

  it("Curse of the Forsaken gains life for the attacking creature's controller, not the Curse's", () => {
    const t = table({ players: 3 });
    // Carol's Curse on Bob: alice, attacking Bob, gains; Carol doesn't.
    const aura = spawn(t.game, "Curse of the Forsaken", C);
    t.game.state.objects[aura].attachedToPlayer = B;
    const one = spawn(t.game, "Grizzly Bears", A, { sick: false });
    const two = spawn(t.game, "Grizzly Bears", A, { sick: false });
    declare(t, [
      { attacker: one, defender: B },
      { attacker: two, defender: B },
    ]);
    expect(t.game.state.players[A].life).toBe(22);
    expect(t.game.state.players[C].life).toBe(20);
  });
});
