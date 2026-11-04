/**
 * Wedding Ring and the two other cards that hand a token copy to someone else:
 * a copy under a target opponent or under each player of a `for-each-player`
 * (`create-token-copy`'s `who`), and a trigger condition about the player its
 * event named (`whileCondition` read with `"that-player"`, rule 603.1).
 */

import { describe, expect, it } from "vitest";

import { goadersOf } from "../goad.js";
import {
  A,
  B,
  C,
  D,
  attack,
  cast,
  counters,
  destroy,
  enter,
  hand,
  lands,
  life,
  named,
  nextTurn,
  pickTargets,
  ref,
  settle,
  spawn,
  table,
  toHand,
  zone,
} from "./harness.js";

describe("Wedding Ring", () => {
  it("gives the target opponent a token copy if it was cast, and the token gives none", () => {
    const { game, a } = table({ players: 3 });
    lands(game, "Plains", 4);
    pickTargets(a, B);
    cast(game, toHand(game, "Wedding Ring"));
    expect(named(game, "Wedding Ring", A)).toHaveLength(1);
    const bobs = named(game, "Wedding Ring", B);
    expect(bobs).toHaveLength(1);
    expect(game.state.objects[bobs[0]].isToken).toBe(true);
    expect(named(game, "Wedding Ring", C)).toHaveLength(0);
  });

  it("makes nothing when it wasn't cast", () => {
    const { game, a } = table();
    let asked = false;
    a.chooseTargetsFn = () => {
      asked = true;
      return [];
    };
    enter(game, "Wedding Ring", A);
    expect(asked).toBe(false);
    expect(named(game, "Wedding Ring", B)).toHaveLength(0);
  });

  it("copies the Ring as it last existed if it's gone by then", () => {
    const { game, a } = table();
    lands(game, "Plains", 4);
    pickTargets(a, B);
    const ring = toHand(game, "Wedding Ring");
    cast(game, ring, { settle: false });
    game.advanceUntil((s) => s.zones.shared.stack.some((id) => s.objects[id].kind !== "card"));
    destroy(game, ring);
    expect(zone(game, ring)).toBe("graveyard");
    expect(named(game, "Wedding Ring", B)).toHaveLength(1);
  });

  it("draws when the Ring's other holder draws on their own turn, and only then", () => {
    const { game } = table({ deck: "Wastes" });
    spawn(game, "Wedding Ring", A);
    spawn(game, "Wedding Ring", B);
    // Bob draws on Alice's turn: not his turn. Alice's own draw triggers nothing either.
    const aliceBefore = hand(game, A).length;
    game.debugApplyEffect(B, { kind: "draw", amount: 1 }, []);
    settle(game);
    game.debugApplyEffect(A, { kind: "draw", amount: 1 }, []);
    settle(game);
    expect(hand(game, A).length).toBe(aliceBefore + 1);
    // Bob's turn: his draw step's card is one for Alice too.
    const onBobsTurn = hand(game, A).length;
    nextTurn(game);
    settle(game);
    expect(hand(game, A).length).toBe(onBobsTurn + 1);
    // On Bob's turn, Alice's draw doesn't count for Bob: it isn't her turn.
    const bobBefore = hand(game, B).length;
    game.debugApplyEffect(A, { kind: "draw", amount: 1 }, []);
    settle(game);
    expect(hand(game, B).length).toBe(bobBefore);
  });

  it("reads only the player who drew: another holder's Ring doesn't make it trigger", () => {
    const { game } = table({ players: 3 });
    spawn(game, "Wedding Ring", A);
    spawn(game, "Wedding Ring", C);
    // Bob is next and holds no Ring, though Alice and Carol do.
    const aliceBefore = hand(game, A).length;
    const carolBefore = hand(game, C).length;
    nextTurn(game);
    settle(game);
    expect(hand(game, A).length).toBe(aliceBefore);
    expect(hand(game, C).length).toBe(carolBefore);
    // Carol's turn: she holds one, so Alice draws, and Carol's own Ring doesn't care.
    nextTurn(game);
    settle(game);
    expect(hand(game, A).length).toBe(aliceBefore + 1);
    expect(hand(game, C).length).toBe(carolBefore + 1);
  });

  it("gains what the holder gains on their turn", () => {
    const { game } = table();
    spawn(game, "Wedding Ring", A);
    spawn(game, "Wedding Ring", B);
    game.debugApplyEffect(B, { kind: "gain-life", amount: 3 }, []);
    settle(game);
    expect(life(game, A)).toBe(20);
    nextTurn(game);
    game.debugApplyEffect(B, { kind: "gain-life", amount: 3 }, []);
    settle(game);
    expect(life(game, B)).toBe(26);
    expect(life(game, A)).toBe(23);
  });
});

describe("Fractured Identity", () => {
  it("exiles it, and each other player gets a copy, its controller none", () => {
    const { game, a } = table({ players: 4 });
    const bears = spawn(game, "Grizzly Bears", B);
    lands(game, "Tundra", 5);
    pickTargets(a, bears);
    cast(game, toHand(game, "Fractured Identity"), { targets: [ref(bears)] });
    expect(zone(game, bears)).toBe("exile");
    expect(named(game, "Grizzly Bears", B)).toHaveLength(0);
    for (const p of [A, C, D]) {
      const tokens = named(game, "Grizzly Bears", p);
      expect(tokens).toHaveLength(1);
      expect(game.state.objects[tokens[0]].isToken).toBe(true);
    }
  });

  it("gives its caster none of their own permanent, and the copies have no counters", () => {
    const { game, a } = table({ players: 3 });
    const bears = spawn(game, "Grizzly Bears", A);
    game.state.objects[bears].counters = { "+1/+1": 2 };
    lands(game, "Tundra", 5);
    pickTargets(a, bears);
    cast(game, toHand(game, "Fractured Identity"), { targets: [ref(bears)] });
    expect(named(game, "Grizzly Bears", A)).toHaveLength(0);
    const bobs = named(game, "Grizzly Bears", B)[0];
    expect(bobs).toBeDefined();
    // Counters aren't copied (the card's ruling).
    expect(counters(game, bobs)).toBe(0);
    expect(named(game, "Grizzly Bears", C)).toHaveLength(1);
  });
});

describe("Life of the Party", () => {
  it("gives each opponent a copy goaded by its controller, and a token gives none", () => {
    const { game } = table({ players: 4 });
    lands(game, "Mountain", 4);
    cast(game, toHand(game, "Life of the Party"));
    expect(named(game, "Life of the Party", A)).toHaveLength(1);
    for (const p of [B, C, D]) {
      const tokens = named(game, "Life of the Party", p);
      expect(tokens).toHaveLength(1);
      expect(game.state.objects[tokens[0]].isToken).toBe(true);
      expect(goadersOf(game.state, game.registry, tokens[0])).toEqual([A]);
    }
  });

  it("gets +X/+0 for the creatures you control as it attacks", () => {
    const { game, a } = table();
    const party = spawn(game, "Life of the Party", A);
    spawn(game, "Grizzly Bears", A);
    attack(game, a, [party]);
    expect(life(game, B)).toBe(18);
  });
});
