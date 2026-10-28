/**
 * Need-keys recheck R7, group F (batch B241): Inspiring Refrain, Not Dead
 * After All and Struggle for Project Purity, on the shared table in
 * `harness.ts`.
 */
import { describe, expect, it } from "vitest";

import {
  A,
  B,
  attack,
  cast,
  hand,
  lands,
  named,
  pt,
  ref,
  settle,
  spawn,
  table,
  toHand,
  toStep,
  tokensNamed,
  zone,
} from "./harness.js";

describe("Inspiring Refrain", () => {
  it("draws two, then exiles itself with three time counters, suspended", () => {
    const { game } = table();
    lands(game, "Island", 6);
    const card = toHand(game, "Inspiring Refrain");
    const before = hand(game).length;
    cast(game, card);
    expect(hand(game).length).toBe(before - 1 + 2);
    expect(zone(game, card)).toBe("exile");
    expect(game.state.objects[card].counters.time).toBe(3);
  });
});

describe("Not Dead After All", () => {
  it("returns the creature tapped with a Wicked Role attached", () => {
    const { game } = table();
    lands(game, "Swamp", 1);
    const bears = spawn(game, "Grizzly Bears");
    cast(game, toHand(game, "Not Dead After All"), { targets: [ref(bears)] });
    game.debugApplyEffect(B, { kind: "destroy", target: 0 }, [ref(bears)]);
    settle(game);
    const [back] = named(game, "Grizzly Bears", A);
    expect(back).toBeDefined();
    expect(game.state.objects[back].tapped).toBe(true);
    const [role] = named(game, "Wicked Role Token", A);
    expect(role).toBeDefined();
    expect(game.state.objects[role].attachedTo).toBe(back);
    expect(pt(game, back)).toEqual({ power: 3, toughness: 3 });
  });

  it("makes no Role when the card left the graveyard before the trigger resolved", () => {
    const { game } = table();
    lands(game, "Swamp", 1);
    const bears = spawn(game, "Grizzly Bears");
    cast(game, toHand(game, "Not Dead After All"), { targets: [ref(bears)] });
    game.debugApplyEffect(B, { kind: "destroy", target: 0 }, [ref(bears)]);
    expect(zone(game, bears)).toBe("graveyard");
    game.debugApplyEffect(B, { kind: "exile", target: 0 }, [ref(bears)]);
    expect(zone(game, bears)).toBe("exile");
    settle(game);
    expect(named(game, "Grizzly Bears").length).toBe(0);
    expect(tokensNamed(game, "Wicked Role Token")).toBe(0);
  });
});

describe("Struggle for Project Purity", () => {
  it("Enclave: a player attacking you gets twice as many rad counters as attackers", () => {
    const t = table();
    const { game } = t;
    t.a.chooseCreatureTypeFn = () => "Enclave";
    lands(game, "Island", 4);
    cast(game, toHand(game, "Struggle for Project Purity"));
    const x = spawn(game, "Grizzly Bears", B);
    const y = spawn(game, "Grizzly Bears", B);
    attack(game, t.b, [x, y], A);
    expect(game.state.players[B].counters.rad).toBe(4);
    expect(game.state.players[A].counters.rad ?? 0).toBe(0);
  });

  it("Brotherhood: each opponent draws a card, then you draw one for each", () => {
    const t = table({ players: 3 });
    const { game } = t;
    t.a.chooseCreatureTypeFn = () => "Brotherhood";
    lands(game, "Island", 4);
    cast(game, toHand(game, "Struggle for Project Purity"));
    toStep(game, "upkeep");
    const mine = hand(game).length;
    const bobs = hand(game, B).length;
    settle(game);
    expect(hand(game, B).length).toBe(bobs + 1);
    expect(hand(game).length).toBe(mine + 2);
  });

  it("Enclave alone: no upkeep draws", () => {
    const t = table();
    const { game } = t;
    t.a.chooseCreatureTypeFn = () => "Enclave";
    lands(game, "Island", 4);
    cast(game, toHand(game, "Struggle for Project Purity"));
    toStep(game, "upkeep");
    const bobs = hand(game, B).length;
    settle(game);
    expect(hand(game, B).length).toBe(bobs);
  });
});
