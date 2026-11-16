/**
 * A `for-each-target` handled in turn order, the controller ordering each
 * player's group as it resolves (`turnOrder`), and each member's turn its own
 * "this way" (`ownThisWay`) — Soulfire Eruption's and Kaboom!'s rulings:
 * "those targets will be handled one at a time in turn order. Start with
 * targets that are either the player whose turn it is … or permanents that
 * player controls. You choose the relative order of targets within that
 * group." The pick is the `choose-permanent-or-player` decision, its answer
 * only recorded.
 */
import { describe, expect, it } from "vitest";

import type { EffectSpec } from "../effects.js";
import type { Game } from "../game.js";
import type { ObjectId, PlayerId } from "../primitives.js";
import type { TargetRef } from "../target.js";
import type { ChoosePermanentOrPlayerOffer, ScriptedController } from "../controller.js";

import { A, B, C, D, cast, destroy, lands, life, ref, settle, spawn, table, toHand, toLibrary, zone } from "./harness.js";

const library = (game: Game, player: PlayerId = A): readonly ObjectId[] => game.state.zones.perPlayer[player].library;

/** Stack the top of `player`'s library: first name on top. */
const stack = (game: Game, names: readonly string[], player: PlayerId = A): ObjectId[] =>
  [...names].reverse().map((name) => toLibrary(game, name, player)).reverse();

const damageOn = (game: Game, id: ObjectId): number => game.state.objects[id].damageMarked;

const exiled = (game: Game): number => game.state.zones.shared.exile.length;

interface Asked {
  readonly offers: ChoosePermanentOrPlayerOffer[];
  /** Cards in exile as each pick was asked. */
  readonly exileAt: number[];
}

/** Answer each pick with the first of `picks` the offer holds. */
function pickInOrder(game: Game, seat: ScriptedController, ...picks: readonly (PlayerId | ObjectId)[]): Asked {
  const asked: Asked = { offers: [], exileAt: [] };
  seat.choosePermanentOrPlayerFn = (_view, offer) => {
    asked.offers.push(offer);
    asked.exileAt.push(exiled(game));
    const want = picks.map(ref).find((r) => offer.eligible.some((e) => sameRef(e, r)));
    return want ?? offer.eligible[0];
  };
  return asked;
}

const sameRef = (a: TargetRef, b: TargetRef): boolean =>
  a.kind === "player" ? b.kind === "player" && a.player === b.player : b.kind === "object" && a.object === b.object;

describe("Soulfire Eruption", () => {
  it("the active player's group first, then the next player's in the order chosen, each its own card's mana value", () => {
    const { game, a } = table();
    lands(game, "Mountain", 9);
    const mine = spawn(game, "Ancient Brontodon");
    const theirs = spawn(game, "Ancient Brontodon", B);
    // Hill Giant 4, Lightning Bolt 1, Grizzly Bears 2.
    stack(game, ["Hill Giant", "Lightning Bolt", "Grizzly Bears"]);
    const asked = pickInOrder(game, a, theirs);
    // Targeted bob first: the order chosen as it resolves isn't the targets'.
    cast(game, toHand(game, "Soulfire Eruption"), { targets: [ref(B), ref(theirs), ref(mine)] });
    // Alice's group (her own creature) takes the top card.
    expect(damageOn(game, mine)).toBe(4);
    // Bob's group: his creature picked first takes the Bolt, then bob the Bears
    // — that card's mana value alone, not the cards exiled before it.
    expect(damageOn(game, theirs)).toBe(1);
    expect(life(game, B)).toBe(18);
    // One pick, over bob's group alone, after alice's card was exiled.
    expect(asked.offers).toHaveLength(1);
    expect(asked.offers[0].eligible).toHaveLength(2);
    expect(asked.offers[0].eligible).toEqual(expect.arrayContaining([ref(B), ref(theirs)]));
    expect(asked.offers[0].polarity).toBe("harm");
    expect(asked.exileAt[0]).toBe(1);
    expect(exiled(game)).toBe(3);
  });

  it("the other order of the same group: bob takes the Bolt, his creature the Bears", () => {
    const { game, a } = table();
    lands(game, "Mountain", 9);
    const theirs = spawn(game, "Ancient Brontodon", B);
    stack(game, ["Lightning Bolt", "Grizzly Bears"]);
    pickInOrder(game, a, B);
    cast(game, toHand(game, "Soulfire Eruption"), { targets: [ref(theirs), ref(B)] });
    expect(life(game, B)).toBe(19);
    expect(damageOn(game, theirs)).toBe(2);
  });

  it("one at a time: each pick in a group is asked after the target before it is done", () => {
    const { game, a } = table();
    lands(game, "Mountain", 9);
    const bront = spawn(game, "Ancient Brontodon", B);
    const dreadmaw = spawn(game, "Colossal Dreadmaw", B);
    stack(game, ["Lightning Bolt", "Grizzly Bears", "Hill Giant"]);
    const asked = pickInOrder(game, a, dreadmaw, B);
    cast(game, toHand(game, "Soulfire Eruption"), { targets: [ref(B), ref(bront), ref(dreadmaw)] });
    // Three in bob's group: two picks (the last is what's left), the second
    // over the two left, with one more card exiled than at the first.
    expect(asked.offers.map((o) => o.eligible.length)).toEqual([3, 2]);
    expect(asked.exileAt).toEqual([0, 1]);
    expect(damageOn(game, dreadmaw)).toBe(1);
    expect(life(game, B)).toBe(18);
    expect(damageOn(game, bront)).toBe(4);
  });

  it("four players: groups from the active player in turn order, whatever order they were targeted in", () => {
    const { game, a } = table({ players: 4 });
    lands(game, "Mountain", 9);
    const carols = spawn(game, "Ancient Brontodon", C);
    stack(game, ["Lightning Bolt", "Grizzly Bears", "Hill Giant", "Craw Wurm"]);
    const asked = pickInOrder(game, a, C);
    cast(game, toHand(game, "Soulfire Eruption"), { targets: [ref(D), ref(carols), ref(B), ref(C)] });
    expect(life(game, B)).toBe(19);
    expect(life(game, C)).toBe(18);
    expect(damageOn(game, carols)).toBe(4);
    expect(life(game, D)).toBe(14);
    expect(asked.offers).toHaveLength(1);
    expect(asked.offers[0].eligible).toEqual(expect.arrayContaining([ref(C), ref(carols)]));
  });

  it("a target gone before it resolves gets no card (rule 608.2b), and a lone member nothing to pick", () => {
    const { game, a } = table();
    lands(game, "Mountain", 9);
    const bears = spawn(game, "Grizzly Bears", B);
    stack(game, ["Hill Giant", "Lightning Bolt"]);
    const asked = pickInOrder(game, a);
    cast(game, toHand(game, "Soulfire Eruption"), { targets: [ref(bears), ref(B)], settle: false });
    destroy(game, bears);
    settle(game);
    expect(asked.offers).toHaveLength(0);
    expect(life(game, B)).toBe(16);
    expect(exiled(game)).toBe(1);
  });

  it("a land exiled deals nothing; the exiled cards can be played until the end of your next turn", () => {
    const { game, a } = table();
    lands(game, "Mountain", 10);
    const [bolt] = stack(game, ["Lightning Bolt", "Wastes"]);
    pickInOrder(game, a, B);
    const bears = spawn(game, "Grizzly Bears", B);
    cast(game, toHand(game, "Soulfire Eruption"), { targets: [ref(B), ref(bears)] });
    expect(life(game, B)).toBe(19);
    expect(damageOn(game, bears)).toBe(0);
    expect(zone(game, bolt)).toBe("exile");
    cast(game, bolt, { targets: [ref(bears)], via: "impulse" });
    expect(zone(game, bears)).toBe("graveyard");
  });
});

describe("Kaboom!", () => {
  it("three players: bob before carol though carol was targeted first, each its own reveal", () => {
    const { game } = table({ players: 3 });
    lands(game, "Mountain", 5);
    stack(game, ["Forest", "Lightning Bolt", "Island", "Hill Giant"]);
    cast(game, toHand(game, "Kaboom!"), { targets: [ref(C), ref(B)] });
    expect(life(game, B)).toBe(19);
    expect(life(game, C)).toBe(16);
    // Every card revealed went to the bottom, in the order chosen.
    expect(library(game).slice(0, 2).map((id) => game.state.objects[id].cardName)).toEqual(["Wastes", "Wastes"]);
  });

  it("a player and their planeswalker in the order chosen; a member's own question (the bottom order) holds the next", () => {
    const { game, a } = table();
    lands(game, "Mountain", 5);
    const jace = spawn(game, "Jace Beleren", B);
    stack(game, ["Forest", "Lightning Bolt", "Hill Giant"]);
    const asked = pickInOrder(game, a, jace);
    let ordered = 0;
    a.chooseFromZoneFn = (_view, eligible) => {
      ordered += 1;
      return [...eligible];
    };
    cast(game, toHand(game, "Kaboom!"), { targets: [ref(B), ref(jace)] });
    expect(asked.offers).toHaveLength(1);
    // Jace first: Forest and the Bolt revealed, 1 damage, both to the bottom
    // as ordered; then bob: the Giant, 4.
    expect(ordered).toBe(1);
    expect(game.state.objects[jace].counters.loyalty).toBe(2);
    expect(life(game, B)).toBe(16);
  });

  it("all lands left: zero damage (its ruling)", () => {
    const { game } = table();
    lands(game, "Mountain", 5);
    cast(game, toHand(game, "Kaboom!"), { targets: [ref(B)] });
    expect(life(game, B)).toBe(20);
  });
});

describe("ownThisWay", () => {
  it("each member reads only its own turn, and what follows reads them all", () => {
    const { game } = table({ players: 3 });
    stack(game, ["Lightning Bolt", "Hill Giant"]);
    const exileTop: EffectSpec = { kind: "impulse-exile", amount: 1, duration: "end-of-turn", play: true };
    const mv = { aggregate: "sum", of: "mana-value", filter: {}, in: { thisWay: "exiled" } } as const;
    game.debugApplyEffect(
      A,
      {
        kind: "sequence",
        effects: [
          {
            kind: "for-each-target",
            from: 0,
            ownThisWay: true,
            effect: { kind: "sequence", effects: [exileTop, { kind: "damage", target: 0, amount: mv }] },
          },
          { kind: "gain-life", amount: mv },
        ],
      },
      [ref(B), ref(C)],
    );
    settle(game);
    expect(life(game, B)).toBe(19);
    expect(life(game, C)).toBe(16);
    expect(life(game, A)).toBe(25);
  });
});
