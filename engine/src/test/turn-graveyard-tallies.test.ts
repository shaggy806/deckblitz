/**
 * The turn history's graveyard tallies (`TurnHistory.discarded` and
 * `TurnHistory["to-graveyard"]`): the cards a player discarded this turn
 * (rule 701.9a — a madness card's discard into exile too, 702.35a), and
 * everything put into a player's graveyard this turn with the zone it came
 * from — cards from a library, a hand or the stack, permanents from the
 * battlefield with tokens (111.7), each read as it last existed there
 * (603.10a). Proved on Change of Fortune, Gilt-Blade Prowler, Recalibrate,
 * Cruel Calculations, Fraying Sanity, Structural Assault, Ichor Shade and
 * Shadow of the Grave (the `discardedThisTurn` filter).
 */
import { describe, expect, it } from "vitest";

import type { Game } from "../game.js";
import type { ObjectId, PlayerId } from "../primitives.js";

import { staticConditionMet, turnHistoryCount } from "../characteristics.js";
import {
  A,
  B,
  activate,
  cast,
  counters,
  graveyard,
  hand,
  lands,
  named,
  nextTurn,
  ref,
  settle,
  spawn,
  table,
  toHand,
  toStep,
  zone,
} from "./harness.js";

const discardHand = (game: Game, player: PlayerId = A): void => {
  game.debugApplyEffect(player, { kind: "discard-hand", who: "you" });
  settle(game);
};
const mill = (game: Game, player: PlayerId, n: number): void => {
  game.debugApplyEffect(player, { kind: "mill", target: "you", amount: n });
  settle(game);
};
const destroy = (game: Game, id: ObjectId): void => {
  game.debugApplyEffect(B, { kind: "destroy", target: 0 }, [ref(id)]);
  settle(game);
};
const exile = (game: Game, id: ObjectId): void => {
  game.debugApplyEffect(B, { kind: "exile", target: 0 }, [ref(id)]);
  settle(game);
};
const library = (game: Game, player: PlayerId = A): number => game.state.zones.perPlayer[player].library.length;
/** A real token (`spawn` makes a card of that name). */
const token = (game: Game, name: string, player: PlayerId): ObjectId => {
  const before = new Set(named(game, name, player));
  game.debugApplyEffect(player, { kind: "create-token", token: name, count: 1 });
  settle(game);
  return named(game, name, player).find((id) => !before.has(id))!;
};
/** A table with both opening hands put back into the libraries, unannounced. */
const board = (): ReturnType<typeof table> => {
  const t = table();
  for (const player of [A, B]) for (const id of [...hand(t.game, player)]) t.game.debugMove(id, "library");
  return t;
};

describe("cards discarded this turn (TurnHistory.discarded)", () => {
  it("Change of Fortune draws a card for every card you discarded this turn, this discard included", () => {
    const { game } = board();
    toHand(game, "Grizzly Bears");
    toHand(game, "Grizzly Bears");
    discardHand(game);
    // Neither a milled card nor an opponent's discard is one of yours.
    mill(game, A, 2);
    toHand(game, "Grizzly Bears", B);
    discardHand(game, B);
    lands(game, "Mountain", 4);
    const change = toHand(game, "Change of Fortune");
    for (let i = 0; i < 3; i += 1) toHand(game, "Wastes");
    cast(game, change);
    expect(hand(game)).toHaveLength(5);
  });

  it("Gilt-Blade Prowler's draw can be activated only after you've discarded this turn, and not next turn", () => {
    const { game } = board();
    const prowler = spawn(game, "Gilt-Blade Prowler");
    lands(game, "Swamp", 1);
    expect(() => activate(game, prowler)).toThrow(/refused/);
    toHand(game, "Grizzly Bears");
    discardHand(game);
    activate(game, prowler);
    expect(hand(game)).toHaveLength(1);
    nextTurn(game);
    nextTurn(game);
    game.state.objects[prowler].tapped = false;
    expect(() => activate(game, prowler)).toThrow(/refused/);
  });

  it("Recalibrate draws only if you've discarded a card this turn", () => {
    const { game } = board();
    lands(game, "Island", 4);
    const first = spawn(game, "Grizzly Bears", B);
    cast(game, toHand(game, "Recalibrate"), { targets: [ref(first)] });
    expect(zone(game, first)).toBe("hand");
    expect(hand(game)).toHaveLength(0);
    toHand(game, "Grizzly Bears");
    discardHand(game);
    const second = spawn(game, "Grizzly Bears", B);
    cast(game, toHand(game, "Recalibrate"), { targets: [ref(second)] });
    expect(hand(game)).toHaveLength(1);
  });

  it("a madness card discarded into exile is a discard, and declined it's still one Shadow of the Grave returns", () => {
    const { game, a } = board();
    const greeting = toHand(game, "Alchemist's Greeting");
    a.chooseCastNowFn = () => null;
    discardHand(game);
    expect(zone(game, greeting)).toBe("graveyard");
    expect(turnHistoryCount(game.state, game.registry, [A], "discarded", undefined, A)).toBe(1);
    lands(game, "Swamp", 2);
    cast(game, toHand(game, "Shadow of the Grave"));
    expect(zone(game, greeting)).toBe("hand");
  });
});

describe("Shadow of the Grave (the discardedThisTurn filter)", () => {
  it("returns the cards you cycled or discarded this turn still in your graveyard, and nothing else", () => {
    const { game } = board();
    lands(game, "Swamp", 4);
    const cycled = toHand(game, "Angelsong");
    game.dispatch({ type: "cycle", player: A, card: cycled });
    settle(game);
    const kept = toHand(game, "Grizzly Bears");
    const left = toHand(game, "Hill Giant");
    discardHand(game);
    // Discarded, then exiled and back: a new object (rule 400.7).
    game.debugMove(left, "exile");
    game.debugMove(left, "graveyard");
    const milled = game.state.zones.perPlayer[A].library[0]!;
    mill(game, A, 1);
    const shadow = toHand(game, "Shadow of the Grave");
    cast(game, shadow);
    expect(zone(game, cycled)).toBe("hand");
    expect(zone(game, kept)).toBe("hand");
    expect(zone(game, left)).toBe("graveyard");
    expect(zone(game, milled)).toBe("graveyard");
  });
});

describe("cards put into a graveyard this turn, by origin (TurnHistory['to-graveyard'])", () => {
  it("Cruel Calculations counts the cards put into its target's graveyard from their library, though they left", () => {
    const { game } = board();
    mill(game, B, 3);
    mill(game, A, 1);
    toHand(game, "Grizzly Bears", B);
    discardHand(game, B);
    game.debugMove(graveyard(game, B)[0]!, "exile");
    lands(game, "Island", 6);
    cast(game, toHand(game, "Cruel Calculations"), { targets: [ref(B)] });
    expect(hand(game)).toHaveLength(3);
    cast(game, toHand(game, "Cruel Calculations"), { targets: [ref(A)] });
    expect(hand(game)).toHaveLength(4);
  });

  it("from the battlefield: tokens counted, each as it last existed there; exile and other origins aren't", () => {
    const { game } = board();
    const bears = spawn(game, "Grizzly Bears", B);
    const treasure = token(game, "Treasure Token", B);
    const exiled = spawn(game, "Hill Giant", B);
    destroy(game, bears);
    destroy(game, treasure);
    exile(game, exiled);
    mill(game, B, 2);
    const count = (filter?: object, origin?: object): number =>
      turnHistoryCount(game.state, game.registry, [A, B], "to-graveyard", filter, A, undefined, origin);
    expect(count(undefined, { from: ["battlefield"] })).toBe(2);
    expect(count({ type: "artifact" }, { from: ["battlefield"] })).toBe(1);
    expect(count({ token: false })).toBe(3);
    // Dimir Strandcatcher's "from anywhere other than the battlefield".
    expect(count(undefined, { notFrom: ["battlefield"] })).toBe(2);
    const strandcatcher = {
      kind: "turn-history",
      what: "to-graveyard",
      who: "any-player",
      notFrom: ["battlefield"],
      atLeast: 3,
    } as const;
    const source = spawn(game, "Ornithopter", A);
    const met = (): boolean => staticConditionMet(game.state, game.registry, game.state.objects[source]!, strandcatcher);
    expect(met()).toBe(false);
    mill(game, A, 1);
    expect(met()).toBe(true);
    // A new turn starts a new tally.
    nextTurn(game);
    expect(count()).toBe(0);
  });

  it("Fraying Sanity mills the enchanted player X each end step, X read as each trigger resolves", () => {
    const { game } = board();
    lands(game, "Island", 6);
    cast(game, toHand(game, "Fraying Sanity"), { targets: [ref(B)] });
    cast(game, toHand(game, "Fraying Sanity"), { targets: [ref(B)] });
    mill(game, B, 2);
    toHand(game, "Grizzly Bears", B);
    discardHand(game, B);
    destroy(game, spawn(game, "Grizzly Bears", B));
    // A token isn't a card; Alice's own cards aren't Bob's.
    destroy(game, token(game, "Treasure Token", B));
    mill(game, A, 3);
    const before = library(game, B);
    toStep(game, "end");
    settle(game);
    // 4, then 4 + 4.
    expect(before - library(game, B)).toBe(12);
    expect(graveyard(game, B)).toHaveLength(16);
  });

  it("Structural Assault counts every artifact put into a graveyard from the battlefield this turn", () => {
    const { game } = board();
    destroy(game, spawn(game, "Sol Ring", A));
    spawn(game, "Ornithopter", B);
    token(game, "Treasure Token", B);
    spawn(game, "Darksteel Ingot", B);
    // An artifact milled from a library came from elsewhere.
    mill(game, B, 1);
    const giant = spawn(game, "Hill Giant", B);
    const wall = spawn(game, "Wall of Stone", B);
    lands(game, "Mountain", 5);
    cast(game, toHand(game, "Structural Assault"));
    // Sol Ring earlier, Ornithopter and the Treasure now: 3; the Ingot survives.
    expect(zone(game, giant)).toBe("graveyard");
    expect(game.state.objects[wall].damageMarked).toBe(3);
  });

  it("Ichor Shade: no counter on a quiet turn, one after a token creature dies, none for an exiled one", () => {
    const { game } = board();
    const shade = spawn(game, "Ichor Shade");
    exile(game, spawn(game, "Grizzly Bears", B));
    destroy(game, spawn(game, "Pacifism", B));
    toStep(game, "end");
    settle(game);
    expect(counters(game, shade)).toBe(0);
    nextTurn(game);
    nextTurn(game);
    destroy(game, token(game, "Soldier Token", B));
    toStep(game, "end");
    settle(game);
    expect(counters(game, shade)).toBe(1);
  });
});
