/**
 * What a resolution did with counters, read "this way": the permanents it
 * put counters on (`thisWay: "counters-put"` as a filter — Fangs of
 * Kalonia's doubling, Spectacular Showdown's goad, each half and overloaded),
 * and the counters it removed (`thisWay: "counters-removed"` as an amount) —
 * off a permanent (Take's "draw that many"), off a player (Leeches' poison,
 * rule 122.1), as an ability's cost ("Remove all +1/+1 counters from
 * Catti-brie: … X is the number of counters removed this way", rule 601.2h
 * via 602.2b) and as a permanent enters (Thief of Blood, rule 614.1c).
 */

import { describe, expect, it } from "vitest";

import type { ObjectId } from "../primitives.js";
import { A, B, activate, cast, counters, enter, hand, lands, life, ref, settle, spawn, table, toHand } from "./harness.js";
import type { Game } from "../game.js";

/** Enough of each colour for any of these spells. */
const mana = (game: Game): void => {
  for (const land of ["Forest", "Mountain", "Plains", "Island"]) lands(game, land, 4);
};

const give = (game: Game, id: ObjectId, kinds: Record<string, number>): void => {
  game.state.objects[id].counters = { ...game.state.objects[id].counters, ...kinds };
};

describe("counters put this way", () => {
  it("Fangs of Kalonia: one counter on the target, then its +1/+1 counters doubled — no one else's", () => {
    const { game } = table();
    mana(game);
    const bears = spawn(game, "Grizzly Bears");
    const other = spawn(game, "Grizzly Bears");
    give(game, bears, { "+1/+1": 2 });
    give(game, other, { "+1/+1": 2 });
    cast(game, toHand(game, "Fangs of Kalonia"), { targets: [ref(bears)] });
    expect(counters(game, bears)).toBe(6);
    expect(counters(game, other)).toBe(2);
  });

  it("Fangs of Kalonia overloaded: each creature you control gets one, then each of those doubles; an opponent's is untouched", () => {
    const { game } = table();
    mana(game);
    const bears = spawn(game, "Grizzly Bears");
    const plain = spawn(game, "Grizzly Bears");
    const theirs = spawn(game, "Grizzly Bears", B);
    give(game, bears, { "+1/+1": 1 });
    give(game, theirs, { "+1/+1": 1 });
    cast(game, toHand(game, "Fangs of Kalonia"), { overload: true });
    expect(counters(game, bears)).toBe(4);
    expect(counters(game, plain)).toBe(2);
    expect(counters(game, theirs)).toBe(1);
  });

  it("Spectacular Showdown: a double strike counter on the target, which is goaded; others aren't", () => {
    const { game } = table();
    mana(game);
    const bears = spawn(game, "Grizzly Bears", B);
    const other = spawn(game, "Grizzly Bears", B);
    cast(game, toHand(game, "Spectacular Showdown"), { targets: [ref(bears)] });
    expect(counters(game, bears, "double-strike")).toBe(1);
    expect(game.state.objects[bears].goadedBy).toEqual([A]);
    expect(game.state.objects[other].goadedBy ?? []).toEqual([]);
  });

  it("Spectacular Showdown overloaded: every creature gets the counter and is goaded", () => {
    const { game } = table();
    mana(game);
    const mine = spawn(game, "Grizzly Bears");
    const theirs = spawn(game, "Grizzly Bears", B);
    cast(game, toHand(game, "Spectacular Showdown"), { overload: true });
    for (const id of [mine, theirs]) {
      expect(counters(game, id, "double-strike")).toBe(1);
      expect(game.state.objects[id].goadedBy).toEqual([A]);
    }
  });
});

describe("counters removed this way", () => {
  it("Take: every +1/+1 counter off the target, then that many cards", () => {
    const { game } = table();
    mana(game);
    const bears = spawn(game, "Grizzly Bears");
    give(game, bears, { "+1/+1": 3, stun: 1 });
    const before = hand(game).length;
    cast(game, toHand(game, "Give // Take"), { face: 2, targets: [ref(bears)] });
    expect(counters(game, bears)).toBe(0);
    expect(counters(game, bears, "stun")).toBe(1);
    expect(hand(game).length).toBe(before + 3);
  });

  it("Give // Take fused on one creature: Give's three counters come off too, and draw them", () => {
    const { game } = table();
    mana(game);
    const bears = spawn(game, "Grizzly Bears");
    give(game, bears, { "+1/+1": 1 });
    const card = toHand(game, "Give // Take");
    const before = hand(game).length;
    cast(game, card, { face: 0, targets: [ref(bears), ref(bears)] });
    expect(counters(game, bears)).toBe(0);
    // The fused card left the hand; four drawn.
    expect(hand(game).length).toBe(before - 1 + 4);
  });

  it("Leeches: a player's poison counters come off, and that much damage is dealt to them", () => {
    const { game } = table();
    mana(game);
    game.state.players[B].counters = { ...game.state.players[B].counters, poison: 4 };
    const before = life(game, B);
    cast(game, toHand(game, "Leeches"), { targets: [ref(B)] });
    expect(game.state.players[B].counters.poison ?? 0).toBe(0);
    expect(life(game, B)).toBe(before - 4);
  });

  it("Leeches with no poison counters deals no damage", () => {
    const { game } = table();
    mana(game);
    const before = life(game, B);
    cast(game, toHand(game, "Leeches"), { targets: [ref(B)] });
    expect(life(game, B)).toBe(before);
  });

  it("Catti-brie: the counters its cost removed are X — and it can be activated with none (its ruling)", () => {
    const { game, a, b } = table();
    const catti = spawn(game, "Catti-brie of Mithral Hall");
    const ogre = spawn(game, "Hill Giant", B);
    const second = spawn(game, "Hill Giant", B);
    spawn(game, "Wastes");
    spawn(game, "Wastes");
    give(game, catti, { "+1/+1": 3 });
    a.declareAttackersFn = () => [{ attacker: catti, defender: B }];
    b.declareBlockersFn = () => [{ blocker: ogre, attacker: catti }];
    game.advanceUntil((s) => s.turn.step === "declare-blockers" && s.priority.holder === A);
    activate(game, catti, 0, { targets: [ref(ogre)], settle: false });
    // Paid at once: the counters are gone before it resolves.
    expect(counters(game, catti)).toBe(0);
    settle(game);
    expect(game.state.objects[ogre].zone).toBe("graveyard");
    // A creature that isn't attacking or blocking can't be its target.
    expect(() => activate(game, catti, 0, { targets: [ref(second)] })).toThrow();
  });

  it("Catti-brie's target is an attacking or blocking creature an opponent controls, and none removed deals 0", () => {
    const { game, a, b } = table();
    const catti = spawn(game, "Catti-brie of Mithral Hall");
    const bears = spawn(game, "Grizzly Bears", B);
    spawn(game, "Wastes");
    a.declareAttackersFn = () => [{ attacker: catti, defender: B }];
    b.declareBlockersFn = () => [{ blocker: bears, attacker: catti }];
    game.advanceUntil((s) => s.turn.step === "declare-blockers" && s.priority.holder === A);
    activate(game, catti, 0, { targets: [ref(bears)] });
    expect(game.state.objects[bears].damageMarked).toBe(0);
    expect(game.state.objects[bears].zone).toBe("battlefield");
  });

  it("Thief of Blood: every counter off every other permanent, and a +1/+1 counter for each — a player's stay", () => {
    const { game } = table();
    mana(game);
    const bears = spawn(game, "Grizzly Bears", B);
    const mine = spawn(game, "Grizzly Bears");
    give(game, bears, { "+1/+1": 2, stun: 1 });
    give(game, mine, { "-1/-1": 1 });
    game.state.players[B].counters = { ...game.state.players[B].counters, poison: 3 };
    const thief = enter(game, "Thief of Blood");
    expect(game.state.objects[bears].counters).toEqual({});
    expect(game.state.objects[mine].counters).toEqual({});
    expect(counters(game, thief)).toBe(4);
    expect(game.state.players[B].counters.poison).toBe(3);
  });

  it("Thief of Blood with no counters anywhere enters a 1/1", () => {
    const { game } = table();
    mana(game);
    const thief = enter(game, "Thief of Blood");
    expect(counters(game, thief)).toBe(0);
  });
});
