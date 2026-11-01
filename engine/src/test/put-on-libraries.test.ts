/**
 * `put-on-libraries`: several cards put into their owners' libraries at
 * once, each owner arranging their own on each end (rule 401.4), the active
 * player first (rule 101.4) — Plow Under, Forever Young, Harmonic
 * Convergence — and "its owner puts it on their choice of the top or bottom"
 * for several at once, the choices first and the moves together (Aetherspouts).
 */
import { describe, expect, it } from "vitest";

import { A, B, C, D, cast, lands, ref, settle, spawn, table, toGraveyard, toHand, toStep, zone } from "./harness.js";
import type { Game } from "../game.js";
import type { ObjectId, PlayerId } from "../primitives.js";

const library = (game: Game, player: PlayerId = A): readonly ObjectId[] => game.state.zones.perPlayer[player].library;
const hand = (game: Game, player: PlayerId = A): readonly ObjectId[] => game.state.zones.perPlayer[player].hand;

/** Record every order the seat is asked for (a choose-from-zone whose
 * eligible cards are all to be picked), answering with `answer`. */
function recordOrders(
  seat: { chooseFromZoneFn: (view: never, eligible: readonly ObjectId[], min: number, max: number) => readonly ObjectId[] },
  answer: (eligible: readonly ObjectId[]) => readonly ObjectId[] = (e) => e,
): (readonly ObjectId[])[] {
  const asked: (readonly ObjectId[])[] = [];
  seat.chooseFromZoneFn = (_view, eligible) => {
    asked.push(eligible);
    return answer(eligible);
  };
  return asked;
}

describe("Plow Under: two lands at once, their owners arranging them", () => {
  it("asks the owner of both the order they go on top, and puts them there so", () => {
    const { game, a, b } = table();
    lands(game, "Forest", 5);
    const island = spawn(game, "Island", B);
    const swamp = spawn(game, "Swamp", B);
    const aOrders = recordOrders(a as never);
    const bOrders = recordOrders(b as never, () => [swamp, island]);
    cast(game, toHand(game, "Plow Under"), { targets: [ref(island), ref(swamp)] });
    expect(aOrders).toEqual([]);
    expect(bOrders).toHaveLength(1);
    expect([...bOrders[0]].sort()).toEqual([island, swamp].sort());
    expect(library(game, B).slice(0, 2)).toEqual([swamp, island]);
  });

  it("puts each land on top of its own owner's library, nobody asked", () => {
    const { game, a, b } = table();
    const forests = lands(game, "Forest", 5);
    const island = spawn(game, "Island", B);
    const aOrders = recordOrders(a as never);
    const bOrders = recordOrders(b as never);
    cast(game, toHand(game, "Plow Under"), { targets: [ref(forests[0]), ref(island)] });
    expect(aOrders).toEqual([]);
    expect(bOrders).toEqual([]);
    expect(library(game, A)[0]).toBe(forests[0]);
    expect(library(game, B)[0]).toBe(island);
  });

  it("doesn't ask the order of two copies of one card", () => {
    const { game, a, b } = table();
    lands(game, "Forest", 5);
    const first = spawn(game, "Island", B);
    const second = spawn(game, "Island", B);
    recordOrders(a as never);
    const bOrders = recordOrders(b as never);
    cast(game, toHand(game, "Plow Under"), { targets: [ref(first), ref(second)] });
    expect(bOrders).toEqual([]);
    expect([...library(game, B).slice(0, 2)].sort()).toEqual([first, second].sort());
  });
});

describe("Forever Young: the creature cards on top in the caster's order, then the draw", () => {
  it("draws the card its owner put on top", () => {
    const { game, a } = table();
    lands(game, "Swamp", 2);
    const bears = toGraveyard(game, "Grizzly Bears");
    const giant = toGraveyard(game, "Hill Giant");
    const orders = recordOrders(a as never, () => [giant, bears]);
    cast(game, toHand(game, "Forever Young"), { targets: [ref(bears), ref(giant)] });
    expect(orders).toHaveLength(1);
    expect(hand(game)).toContain(giant);
    expect(library(game)[0]).toBe(bears);
  });

  it("with the order the other way, draws the other", () => {
    const { game, a } = table();
    lands(game, "Swamp", 2);
    const bears = toGraveyard(game, "Grizzly Bears");
    const giant = toGraveyard(game, "Hill Giant");
    recordOrders(a as never, () => [bears, giant]);
    cast(game, toHand(game, "Forever Young"), { targets: [ref(bears), ref(giant)] });
    expect(hand(game)).toContain(bears);
    expect(library(game)[0]).toBe(giant);
  });

  it("with no targets, just draws", () => {
    const { game } = table();
    lands(game, "Swamp", 2);
    const top = library(game)[0];
    cast(game, toHand(game, "Forever Young"), { targets: [] });
    expect(hand(game)).toContain(top);
  });
});

describe("Harmonic Convergence: every enchantment, each owner ordering theirs", () => {
  it("asks the active player first, then the next, each about their own", () => {
    const { game, a, b } = table();
    lands(game, "Forest", 3);
    const asked: PlayerId[] = [];
    const ward = spawn(game, "Bad Moon");
    const anthem = spawn(game, "Glorious Anthem");
    const theirWard = spawn(game, "Bad Moon", B);
    const theirAnthem = spawn(game, "Glorious Anthem", B);
    a.chooseFromZoneFn = (_view, eligible) => {
      asked.push(A);
      expect([...eligible].sort()).toEqual([ward, anthem].sort());
      return [anthem, ward];
    };
    b.chooseFromZoneFn = (_view, eligible) => {
      asked.push(B);
      expect([...eligible].sort()).toEqual([theirWard, theirAnthem].sort());
      return [theirWard, theirAnthem];
    };
    cast(game, toHand(game, "Harmonic Convergence"));
    expect(asked).toEqual([A, B]);
    expect(library(game, A).slice(0, 2)).toEqual([anthem, ward]);
    expect(library(game, B).slice(0, 2)).toEqual([theirWard, theirAnthem]);
  });

  it("orders in turn order from the active player at four seats, skipping owners with one", () => {
    const { game, a, b, c, d } = table({ players: 4 });
    lands(game, "Forest", 3);
    const asked: PlayerId[] = [];
    for (const [seat, player] of [[a, A], [b, B], [c, C], [d, D]] as const) {
      seat.chooseFromZoneFn = (_view, eligible) => {
        asked.push(player);
        return eligible;
      };
    }
    spawn(game, "Bad Moon", B);
    spawn(game, "Bad Moon", C);
    spawn(game, "Glorious Anthem", C);
    spawn(game, "Bad Moon", D);
    spawn(game, "Glorious Anthem", D);
    cast(game, toHand(game, "Harmonic Convergence"));
    expect(asked).toEqual([C, D]);
    expect(game.state.zones.perPlayer[B].library[0]).toBeDefined();
    expect(game.state.zones.shared.stack).toEqual([]);
  });
});

describe("Aetherspouts: each owner chooses an end for each attacker, then they all move", () => {
  const atBlocks = (): { game: Game; a: ReturnType<typeof table>["a"]; b: ReturnType<typeof table>["b"]; attackers: ObjectId[] } => {
    const t = table();
    const attackers = [spawn(t.game, "Grizzly Bears"), spawn(t.game, "Hill Giant"), spawn(t.game, "Craw Wurm")];
    lands(t.game, "Island", 5);
    t.a.declareAttackersFn = () => attackers.map((attacker) => ({ attacker, defender: B }));
    toStep(t.game, "declare-blockers", A);
    return { game: t.game, a: t.a, b: t.b, attackers };
  };

  it("asks which go on the bottom, then the order of each end", () => {
    const { game, a, attackers } = atBlocks();
    const [bears, giant, wurm] = attackers;
    const offered: (readonly ObjectId[])[] = [];
    a.choosePermanentsFn = (_view, eligible) => {
      offered.push(eligible);
      // Every attacker is still on the battlefield as the choice is made.
      expect(attackers.every((id) => zone(game, id) === "battlefield")).toBe(true);
      return [wurm];
    };
    const orders = recordOrders(a as never, () => [giant, bears]);
    cast(game, toHand(game, "Aetherspouts"));
    settle(game);
    expect(offered).toHaveLength(1);
    expect([...offered[0]].sort()).toEqual([...attackers].sort());
    expect(orders).toHaveLength(1);
    expect(library(game).slice(0, 2)).toEqual([giant, bears]);
    expect(library(game)[library(game).length - 1]).toBe(wurm);
  });

  it("puts them all on top when none is chosen", () => {
    const { game, a, attackers } = atBlocks();
    a.choosePermanentsFn = () => [];
    recordOrders(a as never);
    cast(game, toHand(game, "Aetherspouts"));
    settle(game);
    expect([...library(game).slice(0, 3)].sort()).toEqual([...attackers].sort());
  });

  it("asks only the attackers' owner; all on the bottom, in the order asked", () => {
    const { game, a, b, attackers } = atBlocks();
    let bAsked = 0;
    b.choosePermanentsFn = () => {
      bAsked += 1;
      return [];
    };
    a.choosePermanentsFn = () => attackers;
    recordOrders(a as never);
    cast(game, toHand(game, "Aetherspouts"));
    settle(game);
    expect(bAsked).toBe(0);
    expect(attackers.every((id) => zone(game, id) === "library")).toBe(true);
  });
});
