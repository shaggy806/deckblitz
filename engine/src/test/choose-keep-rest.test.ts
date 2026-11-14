/**
 * Choosing what each player keeps, then losing the rest — Unstable
 * Glyphbridge's "for each player, choose a creature with power 2 or less that
 * player controls. Then destroy all creatures except creatures chosen this
 * way" (Stick Together's party is `choose-party.test.ts`) — and Sandswirl
 * Wanderglyph's two prohibitions: "they can't attack you or planeswalkers you
 * control this turn" and "each opponent who attacked you or a planeswalker
 * you control this turn can't cast spells". Written from the cards' Oracle
 * text and rulings.
 */
import { describe, expect, it } from "vitest";

import { whyCannotAttack } from "../combat/eligibility.js";
import type { ScriptedController } from "../controller.js";
import type { Game } from "../game.js";
import type { ObjectId, PlayerId } from "../primitives.js";
import {
  A,
  B,
  C,
  attack,
  cast,
  lands,
  nextTurn,
  ref,
  registryOf,
  spawn,
  table,
  toHand,
  zone,
} from "./harness.js";

/** The seat answers each choose-permanents with those of `ids` it's offered;
 * records each offer. */
function keep(seat: ScriptedController, ...ids: readonly ObjectId[]): { offers: (readonly ObjectId[])[]; maxes: number[] } {
  const seen = { offers: [] as (readonly ObjectId[])[], maxes: [] as number[] };
  seat.choosePermanentsFn = (_view, eligible, _min, max) => {
    seen.offers.push(eligible);
    seen.maxes.push(max);
    return ids.filter((id) => eligible.includes(id));
  };
  return seen;
}

const canAttack = (game: Game, player: PlayerId, creature: ObjectId, target: PlayerId | ObjectId): boolean =>
  whyCannotAttack(game.state, registryOf(game), player, creature, target) === null;

/** The Wanderglyph on alice's side, transformed in from her hand. */
function wanderglyph(game: Game): ObjectId {
  const card = toHand(game, "Unstable Glyphbridge");
  game.debugApplyEffect(A, { kind: "put-onto-battlefield", target: 0, transformed: true }, [ref(card)]);
  return card;
}

describe("Unstable Glyphbridge", () => {
  it("cast: for each player you choose a creature with power 2 or less; the rest are destroyed", () => {
    const { game, a, b } = table();
    const myBears = spawn(game, "Grizzly Bears", A);
    const myGiant = spawn(game, "Hill Giant", A);
    const elves = spawn(game, "Llanowar Elves", B);
    const theirBears = spawn(game, "Grizzly Bears", B);
    const theirGiant = spawn(game, "Hill Giant", B);
    lands(game, "Plains", 5);
    const seen = keep(a, myBears, elves);
    b.choosePermanentsFn = () => {
      throw new Error("bob doesn't choose");
    };
    cast(game, toHand(game, "Unstable Glyphbridge"));
    // Alice was asked about bob's creatures (her own Bears were the only
    // one of hers with power 2 or less: nothing to ask).
    expect(seen.offers.map((o) => [...o].sort())).toEqual([[elves, theirBears].sort()]);
    expect(zone(game, myBears)).toBe("battlefield");
    expect(zone(game, elves)).toBe("battlefield");
    expect(zone(game, myGiant)).toBe("graveyard");
    expect(zone(game, theirBears)).toBe("graveyard");
    expect(zone(game, theirGiant)).toBe("graveyard");
  });

  it("a player with no creature of power 2 or less keeps none", () => {
    const { game } = table();
    const giant = spawn(game, "Hill Giant", B);
    lands(game, "Plains", 5);
    cast(game, toHand(game, "Unstable Glyphbridge"));
    expect(zone(game, giant)).toBe("graveyard");
  });

  it("not cast, it does nothing", () => {
    const { game } = table();
    const giant = spawn(game, "Hill Giant", B);
    const card = toHand(game, "Unstable Glyphbridge");
    game.debugApplyEffect(A, { kind: "put-onto-battlefield", target: 0 }, [ref(card)]);
    expect(zone(game, card)).toBe("battlefield");
    expect(zone(game, giant)).toBe("battlefield");
  });
});

describe("Sandswirl Wanderglyph", () => {
  it("an opponent who casts a spell during their turn can't attack you or your planeswalkers this turn", () => {
    const { game } = table({ players: 3 });
    wanderglyph(game);
    const bears = spawn(game, "Grizzly Bears", B);
    nextTurn(game);
    expect(game.state.turn.activePlayerIndex).toBe(game.state.turnOrder.indexOf(B));
    expect(canAttack(game, B, bears, A)).toBe(true);
    lands(game, "Island", 3, B);
    cast(game, toHand(game, "Divination", B), { player: B });
    expect(canAttack(game, B, bears, A)).toBe(false);
    // Another player is still fair game.
    expect(canAttack(game, B, bears, C)).toBe(true);
    // A creature arriving later is bound too.
    const later = spawn(game, "Hill Giant", B);
    expect(canAttack(game, B, later, A)).toBe(false);
    // It lasts the turn though the Wanderglyph leaves (the ruling).
    game.debugMove(game.state.zones.shared.battlefield.find((id) => game.state.objects[id]?.cardName === "Unstable Glyphbridge")!, "graveyard");
    expect(canAttack(game, B, bears, A)).toBe(false);
    nextTurn(game);
    nextTurn(game);
    expect(canAttack(game, B, bears, A)).toBe(true);
  });

  it("a spell cast on another player's turn doesn't trigger it", () => {
    const { game } = table();
    wanderglyph(game);
    const bears = spawn(game, "Grizzly Bears", B);
    lands(game, "Island", 1, B);
    // Alice's turn: bob casts an instant.
    while (game.state.priority.holder !== B) game.dispatch({ type: "pass-priority", player: game.state.priority.holder! });
    cast(game, toHand(game, "Opt", B), { player: B });
    nextTurn(game);
    expect(canAttack(game, B, bears, A)).toBe(true);
  });

  it("an opponent who attacked you this turn can't cast spells; one who attacked another player can", () => {
    const { game, b } = table({ players: 3 });
    wanderglyph(game);
    const bears = spawn(game, "Grizzly Bears", B);
    lands(game, "Island", 1, B);
    const opt = toHand(game, "Opt", B);
    nextTurn(game);
    expect(game.canDispatch({ type: "cast-spell", player: B, card: opt, targets: [] })).toBeNull();
    attack(game, b, [bears], A);
    expect(game.canDispatch({ type: "cast-spell", player: B, card: opt, targets: [] })).not.toBeNull();
  });

  it("attacking a planeswalker you control counts; attacking another player doesn't", () => {
    const { game, b } = table({ players: 3 });
    wanderglyph(game);
    const jace = spawn(game, "Jace Beleren", A);
    const bears = spawn(game, "Grizzly Bears", B);
    lands(game, "Island", 1, B);
    const opt = toHand(game, "Opt", B);
    nextTurn(game);
    attack(game, b, [bears], jace);
    expect(game.canDispatch({ type: "cast-spell", player: B, card: opt, targets: [] })).not.toBeNull();
  });

  it("attacking another player leaves them free to cast", () => {
    const { game, b } = table({ players: 3 });
    wanderglyph(game);
    const bears = spawn(game, "Grizzly Bears", B);
    lands(game, "Island", 1, B);
    const opt = toHand(game, "Opt", B);
    nextTurn(game);
    attack(game, b, [bears], C);
    expect(game.canDispatch({ type: "cast-spell", player: B, card: opt, targets: [] })).toBeNull();
  });
});
