/**
 * What left the battlefield this turn (`TurnHistory.left`), and a spell
 * warped this turn (a cast record's `castVia`): revolt's "if a permanent you
 * controlled left the battlefield this turn" (`{ kind: "turn-history", what:
 * "left" }`) and void's "if a nonland permanent left the battlefield this
 * turn or a spell was warped this turn" (an `any` of a `turn-history` over
 * every player and a `cast-this-turn` `{ castVia: "warp" }` — rule
 * 702.185c). Each leave is recorded against its controller as it left, for
 * any zone, a token too (rules 603.10a, 111.7), and read as it was in the
 * stint it left.
 */
import { describe, expect, it } from "vitest";

import { REVOLT_CONDITION, VOID_CONDITION } from "../cards/helpers.js";
import type { StaticCondition } from "../cards/define.js";
import { staticConditionMet, turnHistoryCount } from "../characteristics.js";
import type { Game } from "../game.js";
import type { ObjectId, PlayerId } from "../primitives.js";

import {
  A,
  B,
  cast,
  counters,
  destroy,
  lands,
  nextTurn,
  ref,
  settle,
  spawn,
  table,
  toGraveyard,
  toHand,
  toStep,
  zone,
} from "./harness.js";

/** Whether `condition` holds for `source` (its controller's side). */
const met = (game: Game, source: ObjectId, condition: StaticCondition): boolean =>
  staticConditionMet(game.state, game.registry, game.state.objects[source], condition);

const bounce = (game: Game, id: ObjectId, by: PlayerId = A): void => {
  game.debugApplyEffect(by, { kind: "return-to-hand", target: 0 }, [ref(id)]);
  settle(game);
};

const exile = (game: Game, id: ObjectId, by: PlayerId = A): void => {
  game.debugApplyEffect(by, { kind: "exile", target: 0 }, [ref(id)]);
  settle(game);
};

const makeServo = (game: Game, player: PlayerId): ObjectId => {
  game.debugApplyEffect(player, { kind: "create-token", token: "Servo Token", count: 1 });
  settle(game);
  return game.battlefield.find((id) => game.state.objects[id].cardName === "Servo Token")!;
};

describe("revolt — a permanent you controlled left the battlefield this turn", () => {
  it("holds once one of yours leaves for anywhere — returned to your hand too", () => {
    const { game } = table();
    const source = spawn(game, "Grizzly Bears");
    const ring = spawn(game, "Sol Ring");
    expect(met(game, source, REVOLT_CONDITION)).toBe(false);
    bounce(game, ring);
    expect(zone(game, ring)).toBe("hand");
    expect(met(game, source, REVOLT_CONDITION)).toBe(true);
    // A land counts for revolt: any permanent.
    const { game: g2 } = table();
    const src2 = spawn(g2, "Grizzly Bears");
    const [wastes] = lands(g2, "Wastes", 1);
    exile(g2, wastes);
    expect(met(g2, src2, REVOLT_CONDITION)).toBe(true);
  });

  it("counts a token, which ceases to exist once it has left (rule 111.7)", () => {
    const { game } = table();
    const source = spawn(game, "Grizzly Bears");
    const servo = makeServo(game, A);
    destroy(game, servo);
    expect(game.battlefield).not.toContain(servo);
    expect(met(game, source, REVOLT_CONDITION)).toBe(true);
    // Still there next priority, the token long gone.
    toStep(game, "end");
    expect(met(game, source, REVOLT_CONDITION)).toBe(true);
  });

  it("is about your permanents: an opponent's leaving doesn't count for you", () => {
    const { game } = table();
    const mine = spawn(game, "Grizzly Bears");
    const theirs = spawn(game, "Grizzly Bears", B);
    const bobsSource = spawn(game, "Hill Giant", B);
    destroy(game, theirs, A);
    expect(met(game, mine, REVOLT_CONDITION)).toBe(false);
    expect(met(game, bobsSource, REVOLT_CONDITION)).toBe(true);
  });

  it("reads the controller as it left (rule 603.10a): a creature taken from an opponent is yours", () => {
    const { game } = table();
    const mine = spawn(game, "Grizzly Bears");
    const bobsSource = spawn(game, "Hill Giant", B);
    const stolen = spawn(game, "Grizzly Bears", B);
    game.debugApplyEffect(A, { kind: "gain-control", target: 0, untilEndOfTurn: false }, [ref(stolen)]);
    settle(game);
    expect(game.state.objects[stolen].controller).toBe(A);
    destroy(game, stolen);
    // Bob owns it and it's in his graveyard, but Alice controlled it.
    expect(game.state.zones.perPlayer[B].graveyard).toContain(stolen);
    expect(met(game, mine, REVOLT_CONDITION)).toBe(true);
    expect(met(game, bobsSource, REVOLT_CONDITION)).toBe(false);
  });

  it("forgets a permanent that left during an earlier turn", () => {
    const { game } = table();
    const source = spawn(game, "Grizzly Bears");
    bounce(game, spawn(game, "Sol Ring"));
    expect(met(game, source, REVOLT_CONDITION)).toBe(true);
    nextTurn(game);
    expect(met(game, source, REVOLT_CONDITION)).toBe(false);
    nextTurn(game);
    expect(met(game, source, REVOLT_CONDITION)).toBe(false);
  });
});

describe("void — a nonland permanent left the battlefield this turn, or a spell was warped", () => {
  it("doesn't count a land; counts any player's nonland permanent", () => {
    const { game } = table();
    const source = spawn(game, "Grizzly Bears");
    const [wastes] = lands(game, "Wastes", 1, B);
    destroy(game, wastes);
    expect(met(game, source, VOID_CONDITION)).toBe(false);
    // An opponent's creature, which left by its own controller's hand.
    bounce(game, spawn(game, "Grizzly Bears", B), B);
    expect(met(game, source, VOID_CONDITION)).toBe(true);
  });

  it("counts a token", () => {
    const { game } = table();
    const source = spawn(game, "Grizzly Bears");
    exile(game, makeServo(game, B));
    expect(met(game, source, VOID_CONDITION)).toBe(true);
  });

  it("counts a spell any player cast for its warp cost, countered or not — not one cast for its mana cost", () => {
    const { game } = table();
    const source = spawn(game, "Grizzly Bears", B);
    lands(game, "Island", 6);
    // For its mana cost: not warped.
    cast(game, toHand(game, "Starfield Vocalist"));
    expect(met(game, source, VOID_CONDITION)).toBe(false);
    // Alice warps one (from Bob's side: anyone's spell) and it's countered:
    // still warped (the ruling).
    const warped = toHand(game, "Starfield Vocalist");
    cast(game, warped, { via: "warp", settle: false });
    game.debugApplyEffect(B, { kind: "counter", target: 0 }, [ref(warped)]);
    settle(game);
    expect(zone(game, warped)).toBe("graveyard");
    expect(met(game, source, VOID_CONDITION)).toBe(true);
    // Not next turn.
    nextTurn(game);
    expect(met(game, source, VOID_CONDITION)).toBe(false);
  });

  it("forgets a nonland permanent that left during an earlier turn", () => {
    const { game } = table();
    const source = spawn(game, "Grizzly Bears");
    destroy(game, spawn(game, "Hill Giant", B));
    expect(met(game, source, VOID_CONDITION)).toBe(true);
    nextTurn(game);
    expect(met(game, source, VOID_CONDITION)).toBe(false);
  });

  it("triggers an intervening if only when it holds (rule 603.4)", () => {
    const { game } = table();
    const skittermaw = spawn(game, "Insatiable Skittermaw");
    toStep(game, "end");
    settle(game);
    expect(counters(game, skittermaw)).toBe(0);
    nextTurn(game);
    toStep(game, "precombat-main");
    destroy(game, spawn(game, "Grizzly Bears", B));
    toStep(game, "end");
    settle(game);
    expect(counters(game, skittermaw)).toBe(1);
  });
});

describe("the left list reads each permanent as it was in the stint it left (rule 603.10a)", () => {
  it("counts an animated artifact as the creature it was, though it came back and left again as an artifact", () => {
    const { game } = table();
    const ring = spawn(game, "Sol Ring");
    game.debugApplyEffect(
      A,
      { kind: "animate", target: 0, power: 2, toughness: 2, addTypes: ["creature"], addSubtypes: [], duration: "end-of-turn" },
      [ref(ring)],
    );
    destroy(game, ring);
    const creatures = (): number => turnHistoryCount(game.state, game.registry, [A], "left", { type: "creature" }, A);
    expect(creatures()).toBe(1);
    // Back as a plain artifact, and gone again.
    game.debugApplyEffect(A, { kind: "put-onto-battlefield", target: 0 }, [ref(ring)]);
    settle(game);
    expect(zone(game, ring)).toBe("battlefield");
    destroy(game, ring);
    expect(turnHistoryCount(game.state, game.registry, [A], "left", undefined, A)).toBe(2);
    expect(creatures()).toBe(1);
  });

  it("counts a creature that left and came back while it's on the battlefield again", () => {
    const { game } = table();
    const bears = spawn(game, "Grizzly Bears");
    bounce(game, bears);
    expect(zone(game, bears)).toBe("hand");
    lands(game, "Forest", 2);
    cast(game, bears);
    expect(zone(game, bears)).toBe("battlefield");
    expect(turnHistoryCount(game.state, game.registry, [A], "left", { type: "creature" }, A)).toBe(1);
    // A card put into a graveyard from anywhere else never left the battlefield.
    toGraveyard(game, "Hill Giant");
    expect(turnHistoryCount(game.state, game.registry, [A], "left", undefined, A)).toBe(1);
  });
});
