/**
 * Counters of a player-chosen kind removed, any number, as an effect or as a
 * cost (need-keys family cost:remove-any-counter-cost): the `remove-counters`
 * effect with `counter: "any"` off a permanent, off a targeted player (a
 * target slot's `orPlayer`, rule 122.1 — kind by kind), and from among
 * anyone's permanents (`anyController`); the bots' plain answer taking an
 * opponent's best counters; the "remove a counter from this creature" cost.
 */

import { describe, expect, it } from "vitest";

import type { LegalAction } from "../actions.js";
import { defaultCounterRemovals } from "../decisions/remove-counters.js";
import type { ObjectId } from "../primitives.js";
import { A, B, activate, cast, counters, enter, graveyard, hand, lands, life, pt, ref, spawn, table, toHand } from "./harness.js";

type RemovalOffer = Extract<LegalAction, { kind: "remove-counters" }>;

describe("Price of Betrayal", () => {
  it("removes up to five counters of the kinds chosen from an opponent, kind by kind", () => {
    const { game, a } = table();
    lands(game, "Swamp", 1);
    game.state.players[B].energy = 4;
    game.state.players[B].counters.poison = 3;
    const asked: (readonly string[])[] = [];
    // Energy: 0–4, take 2; then poison: 0–3 (three left of the five), take 3.
    const answers = [2, 3];
    a.chooseModesFn = (_view, _min, _max, texts) => {
      asked.push(texts);
      return [answers[asked.length - 1]];
    };
    cast(game, toHand(game, "Price of Betrayal"), { targets: [ref(B)] });
    expect(asked).toEqual([
      ["Remove no energy counters", "Remove an energy counter", "Remove 2 energy counters", "Remove 3 energy counters", "Remove 4 energy counters"],
      ["Remove no poison counters", "Remove a poison counter", "Remove 2 poison counters", "Remove 3 poison counters"],
    ]);
    expect(game.state.players[B].energy).toBe(2);
    expect(game.state.players[B].counters.poison).toBeUndefined();
  });

  it("caps the later kinds by what's left of the five", () => {
    const { game, a } = table();
    lands(game, "Swamp", 1);
    game.state.players[B].energy = 4;
    game.state.players[B].counters.poison = 3;
    const asked: (readonly string[])[] = [];
    a.chooseModesFn = (_view, _min, _max, texts) => {
      asked.push(texts);
      return [texts.length - 1];
    };
    cast(game, toHand(game, "Price of Betrayal"), { targets: [ref(B)] });
    // All four energy, then at most one poison.
    expect(asked[1]).toEqual(["Remove no poison counters", "Remove a poison counter"]);
    expect(game.state.players[B].energy).toBe(0);
    expect(game.state.players[B].counters.poison).toBe(2);
  });

  it("targets an opponent but not its caster, and not a land", () => {
    const { game } = table();
    lands(game, "Swamp", 1);
    const land = spawn(game, "Swamp", B);
    const card = toHand(game, "Price of Betrayal");
    const offer = game.legalActions(A).find((o) => o.kind === "cast-spell" && o.card === card);
    expect(offer).toBeDefined();
    expect(game.canDispatch({ type: "cast-spell", player: A, card, targets: [ref(A)] })).not.toBeNull();
    expect(game.canDispatch({ type: "cast-spell", player: A, card, targets: [ref(land)] })).not.toBeNull();
    expect(game.canDispatch({ type: "cast-spell", player: A, card, targets: [ref(B)] })).toBeNull();
  });

  it("removes the chosen counters from a creature, up to five", () => {
    const { game, a } = table();
    lands(game, "Swamp", 1);
    const bears = spawn(game, "Grizzly Bears", B);
    game.state.objects[bears].counters["+1/+1"] = 4;
    game.state.objects[bears].counters.shield = 2;
    let offered: RemovalOffer | undefined;
    a.chooseCounterRemovalsFn = (_view, offer) => {
      offered = offer;
      return [
        { object: bears, kind: "+1/+1", count: 4 },
        { object: bears, kind: "shield", count: 1 },
      ];
    };
    cast(game, toHand(game, "Price of Betrayal"), { targets: [ref(bears)] });
    expect(offered?.min).toBe(0);
    expect(offered?.max).toBe(5);
    expect(counters(game, bears)).toBe(0);
    expect(counters(game, bears, "shield")).toBe(1);
  });
});

describe("the bots' plain answer", () => {
  it("takes an opponent's best counters and its own worst", () => {
    const offer = (controller: typeof A): RemovalOffer => ({
      kind: "remove-counters",
      prompt: "",
      eligible: [{ object: "o1" as ObjectId, counters: { "+1/+1": 2, "-1/-1": 2 }, controller }],
      min: 0,
      max: 2,
      single: true,
    });
    expect(defaultCounterRemovals(offer(B), A)).toEqual([{ object: "o1", kind: "+1/+1", count: 2 }]);
    expect(defaultCounterRemovals(offer(A), A)).toEqual([{ object: "o1", kind: "-1/-1", count: 2 }]);
  });
});

describe("Eventide's Shadow", () => {
  it("removes counters from among anyone's permanents, then draws and loses that much", () => {
    const { game, a } = table();
    lands(game, "Swamp", 5);
    const mine = spawn(game, "Grizzly Bears");
    const theirs = spawn(game, "Grizzly Bears", B);
    game.state.objects[mine].counters["-1/-1"] = 1;
    game.state.objects[theirs].counters["+1/+1"] = 2;
    let offered: readonly ObjectId[] = [];
    a.chooseCounterRemovalsFn = (_view, offer) => {
      offered = offer.eligible.map((e) => e.object);
      return [
        { object: mine, kind: "-1/-1", count: 1 },
        { object: theirs, kind: "+1/+1", count: 2 },
      ];
    };
    const before = hand(game).length;
    cast(game, toHand(game, "Eventide's Shadow"));
    expect([...offered].sort()).toEqual([mine, theirs].sort());
    expect(counters(game, mine, "-1/-1")).toBe(0);
    expect(counters(game, theirs)).toBe(0);
    expect(hand(game).length).toBe(before + 3);
    expect(life(game)).toBe(17);
  });

  it("may remove none, drawing nothing", () => {
    const { game, a } = table();
    lands(game, "Swamp", 5);
    const theirs = spawn(game, "Grizzly Bears", B);
    game.state.objects[theirs].counters["+1/+1"] = 2;
    a.chooseCounterRemovalsFn = () => [];
    const before = hand(game).length;
    cast(game, toHand(game, "Eventide's Shadow"));
    expect(counters(game, theirs)).toBe(2);
    expect(hand(game).length).toBe(before);
    expect(life(game)).toBe(20);
  });
});

describe("Hex Parasite", () => {
  it("removes up to X counters of any kinds and gets +1/+0 for each", () => {
    const { game, a } = table();
    lands(game, "Swamp", 3);
    const parasite = spawn(game, "Hex Parasite");
    const walker = spawn(game, "Grizzly Bears", B);
    game.state.objects[walker].counters["+1/+1"] = 2;
    game.state.objects[walker].counters.stun = 3;
    let max = -1;
    a.chooseCounterRemovalsFn = (_view, offer) => {
      max = offer.max;
      return [
        { object: walker, kind: "+1/+1", count: 1 },
        { object: walker, kind: "stun", count: 1 },
      ];
    };
    activate(game, parasite, 0, { targets: [ref(walker)], x: 2 });
    expect(max).toBe(2);
    expect(counters(game, walker)).toBe(1);
    expect(counters(game, walker, "stun")).toBe(2);
    expect(pt(game, parasite)).toEqual({ power: 3, toughness: 1 });
  });
});

describe("Glen Elendra Guardian", () => {
  it("enters with a -1/-1 counter, removed to counter a noncreature spell whose controller draws", () => {
    const { game } = table();
    const guardian = enter(game, "Glen Elendra Guardian");
    expect(counters(game, guardian, "-1/-1")).toBe(1);
    expect(pt(game, guardian)).toEqual({ power: 2, toughness: 3 });
    lands(game, "Island", 2);
    lands(game, "Swamp", 1);
    const spell = toHand(game, "Price of Betrayal");
    cast(game, spell, { targets: [ref(B)], settle: false });
    const before = hand(game).length;
    activate(game, guardian, 0, { targets: [ref(spell)] });
    expect(graveyard(game)).toContain(spell);
    expect(hand(game).length).toBe(before + 1);
    expect(counters(game, guardian, "-1/-1")).toBe(0);
    // No counter left to remove: the ability can't be activated again.
    expect(
      game.legalActions(A).some((o) => o.kind === "activate-ability" && o.source === guardian),
    ).toBe(false);
  });
});
