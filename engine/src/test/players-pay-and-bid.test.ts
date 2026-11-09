/**
 * Each player in turn order pays or bids an amount of their choosing.
 *
 * `players-pay-any-amount`: join forces' "starting with you, each player may
 * pay any amount of mana", the total read as X by everything after it (Minds
 * Aglow, Alliance of Arms, Mana-Charged Dragon); what each paid, read for each
 * (Liege of the Hollows, from the active player); and life, repeated until a
 * whole round pays nothing (Plague of Vermin).
 *
 * `bid-life`: "you start the bidding with a bid of 0", each other player
 * topping or not, until the turn comes back to the high bidder (Illicit
 * Auction, Pain's Reward's bid of any number, Mages' Contest's two bidders).
 */

import { describe, expect, it } from "vitest";

import type { Game } from "../game.js";
import type { ObjectId, PlayerId } from "../primitives.js";
import { decisionCandidates } from "../bot/decisions.js";
import {
  A,
  B,
  C,
  D,
  cast,
  controller,
  graveyard,
  hand,
  lands,
  life,
  nextTurn,
  pt,
  ref,
  settle,
  spawn,
  table,
  toHand,
  tokensNamed,
  zone,
} from "./harness.js";

/** Whoever's being asked now, as `quiet` runs up to the next question. */
const asked = (game: Game): { readonly player: PlayerId; readonly kind: string } => {
  game.advanceUntil((s) => s.awaiting?.kind === "choose-modes" || s.awaiting?.kind === "choose-number");
  const awaiting = game.state.awaiting;
  if (awaiting === null) throw new Error("nothing was asked");
  return { player: (awaiting as { player: PlayerId }).player, kind: awaiting.kind };
};

/** `player`, asked to pay any amount of mana, pays `amount` (0: declines). */
const pay = (game: Game, player: PlayerId, amount: number): void => {
  expect(asked(game)).toEqual({ player, kind: "choose-modes" });
  game.dispatch({ type: "choose-modes", player, modes: amount > 0 ? [0] : [], ...(amount > 0 ? { xValue: amount } : {}) });
};

/** `player` answers a number. */
const number = (game: Game, player: PlayerId, n: number): void => {
  expect(asked(game)).toEqual({ player, kind: "choose-number" });
  game.dispatch({ type: "choose-number", player, number: n });
};

/** `player`, asked to top the high bid, declines — or bids `amount`. */
const bid = (game: Game, player: PlayerId, amount?: number): void => {
  expect(asked(game)).toEqual({ player, kind: "choose-modes" });
  game.dispatch({ type: "choose-modes", player, modes: amount === undefined ? [] : [0] });
  if (amount !== undefined) number(game, player, amount);
};

describe("join forces: each player may pay any amount of mana", () => {
  it("Minds Aglow: starting with you, whoever's turn it is, and everyone draws the total", () => {
    const { game } = table({ players: 3, deck: "Swamp" });
    lands(game, "Island", 3);
    lands(game, "Swamp", 2, B);
    const aglow = toHand(game, "Minds Aglow");
    const before = [A, B, C].map((p) => hand(game, p).length);
    cast(game, aglow, { settle: false });
    // The third player, with no mana, isn't asked.
    pay(game, A, 2);
    pay(game, B, 2);
    settle(game);
    expect([A, B, C].map((p) => hand(game, p).length)).toEqual([before[0] - 1 + 4, before[1] + 4, before[2] + 4]);
    expect(zone(game, aglow)).toBe("graveyard");
    // What each paid came off their own lands.
    const tapped = (p: PlayerId): number =>
      game.state.zones.shared.battlefield.filter((id) => game.state.objects[id].controller === p && game.state.objects[id].tapped).length;
    expect(tapped(A)).toBe(3);
    expect(tapped(B)).toBe(2);
  });

  it("starts with the caster and goes on in turn order, on another player's turn too", () => {
    const { game } = table({ players: 4, deck: "Swamp" });
    for (const player of [A, B, C, D]) lands(game, "Island", 1, player);
    const trigger = { kind: "players-pay-any-amount", resource: "mana", startingWithYou: true } as const;
    game.debugApplyEffect(C, trigger, []);
    pay(game, C, 0);
    pay(game, D, 0);
    pay(game, A, 0);
    pay(game, B, 0);
    settle(game);
  });

  it("nobody paying is a total of 0, and the offer's most is what they can pay", () => {
    const { game } = table({ deck: "Swamp" });
    lands(game, "Island", 3);
    lands(game, "Plains", 1, B);
    const before = hand(game, B).length;
    cast(game, toHand(game, "Minds Aglow"), { settle: false });
    expect(asked(game).player).toBe(A);
    const offer = game.legalActions(A).find((a) => a.kind === "choose-modes");
    expect(offer?.kind === "choose-modes" && offer.xCost?.maxX).toBe(2);
    pay(game, A, 0);
    pay(game, B, 0);
    settle(game);
    expect(hand(game, B).length).toBe(before);
  });

  it("Alliance of Arms: each player makes the total, not what they paid", () => {
    const { game } = table({ deck: "Swamp" });
    lands(game, "Plains", 1);
    lands(game, "Plains", 3, B);
    cast(game, toHand(game, "Alliance of Arms"), { settle: false });
    pay(game, B, 3);
    settle(game);
    expect(tokensNamed(game, "Soldier Token", A)).toBe(3);
    expect(tokensNamed(game, "Soldier Token", B)).toBe(3);
  });

  it("Mana-Charged Dragon: +X/+0 from everyone's mana, when it attacks and when it blocks", () => {
    const { game, a } = table({ deck: "Swamp" });
    const dragon = spawn(game, "Mana-Charged Dragon");
    lands(game, "Mountain", 2);
    lands(game, "Island", 1, B);
    a.declareAttackersFn = () => [{ attacker: dragon, defender: B }];
    pay(game, A, 2);
    pay(game, B, 1);
    game.advanceUntil((s) => s.turn.step === "declare-blockers" || s.awaiting !== null);
    expect(pt(game, dragon)).toEqual({ power: 8, toughness: 5 });
    settle(game);
  });

  it("Mana-Charged Dragon's block: each player from its controller", () => {
    const { game, a, b } = table({ deck: "Swamp" });
    const bear = spawn(game, "Grizzly Bears");
    const dragon = spawn(game, "Mana-Charged Dragon", B);
    lands(game, "Island", 2, B);
    a.declareAttackersFn = () => [{ attacker: bear, defender: B }];
    b.declareBlockersFn = () => [{ blocker: dragon, attacker: bear }];
    pay(game, B, 2);
    game.advanceUntil((s) => s.turn.step === "combat-damage" || s.awaiting !== null);
    expect(pt(game, dragon).power).toBe(7);
    settle(game);
  });

  it("Liege of the Hollows: from the active player, each makes what they alone paid", () => {
    const { game } = table({ deck: "Swamp" });
    const liege = spawn(game, "Liege of the Hollows", B);
    lands(game, "Forest", 1);
    lands(game, "Forest", 2, B);
    game.debugApplyEffect(A, { kind: "destroy", target: 0 }, [ref(liege)]);
    pay(game, A, 1);
    pay(game, B, 2);
    settle(game);
    expect(tokensNamed(game, "Squirrel Token", A)).toBe(1);
    expect(tokensNamed(game, "Squirrel Token", B)).toBe(2);
  });

  it("a bot's search tries paying its most and nothing", () => {
    const { game } = table({ deck: "Swamp" });
    lands(game, "Island", 3);
    cast(game, toHand(game, "Minds Aglow"), { settle: false });
    expect(asked(game).player).toBe(A);
    const offer = game.legalActions(A).find((a) => a.kind === "choose-modes");
    if (offer === undefined) throw new Error("no offer");
    const xs = (decisionCandidates(offer, A) ?? []).flatMap((c) => (c.type === "choose-modes" && c.modes.length > 0 ? [c.xValue] : []));
    expect(new Set(xs)).toEqual(new Set([2, 0]));
    pay(game, A, 2);
    settle(game);
  });
});

describe("paying life, until no one pays", () => {
  it("Plague of Vermin: paid at once, a round only ends it if nobody pays, tokens for what each paid", () => {
    const { game } = table({ players: 3, deck: "Swamp" });
    lands(game, "Swamp", 7);
    cast(game, toHand(game, "Plague of Vermin"), { settle: false });
    number(game, A, 3);
    expect(life(game, A)).toBe(17);
    number(game, B, 0);
    number(game, C, 1);
    // Bob declined and may pay again: it isn't over until a whole round pays
    // nothing, and the second round's most is what's left.
    expect(asked(game).player).toBe(A);
    expect(game.legalActions(A).find((a) => a.kind === "choose-number")).toMatchObject({ min: 0, max: 17 });
    number(game, A, 0);
    number(game, B, 2);
    number(game, C, 0);
    number(game, A, 0);
    number(game, B, 0);
    number(game, C, 0);
    settle(game);
    expect([life(game, A), life(game, B), life(game, C)]).toEqual([17, 18, 19]);
    expect(tokensNamed(game, "Rat Token", A)).toBe(3);
    expect(tokensNamed(game, "Rat Token", B)).toBe(2);
    expect(tokensNamed(game, "Rat Token", C)).toBe(1);
  });

  it("can't pay more life than you have, and can't pay at all while your life can't change", () => {
    const { game } = table({ deck: "Swamp" });
    game.debugApplyEffect(B, { kind: "prohibit", prohibits: [{ act: "lose-life", who: "you" }], duration: "end-of-turn" }, []);
    lands(game, "Swamp", 7);
    game.state.players[A].life = 2;
    cast(game, toHand(game, "Plague of Vermin"), { settle: false });
    expect(asked(game).player).toBe(A);
    expect(game.canDispatch({ type: "choose-number", player: A, number: 3 })).not.toBeNull();
    number(game, A, 0);
    // Bob, whose life can't go down, is never asked (rule 119.8).
    settle(game);
    expect(tokensNamed(game, "Rat Token")).toBe(0);
  });
});

describe("bidding life", () => {
  it("Illicit Auction: everyone declining leaves it to you, for 0", () => {
    const { game } = table({ players: 3, deck: "Swamp" });
    lands(game, "Mountain", 5);
    const bear = spawn(game, "Grizzly Bears", B);
    cast(game, toHand(game, "Illicit Auction"), { targets: [ref(bear)], settle: false });
    bid(game, B);
    bid(game, C);
    settle(game);
    expect(controller(game, bear)).toBe(A);
    expect(life(game, A)).toBe(20);
    // It lasts indefinitely.
    nextTurn(game);
    nextTurn(game);
    expect(controller(game, bear)).toBe(A);
  });

  it("topping goes round until it comes back to the high bidder, who alone loses", () => {
    const { game } = table({ players: 3, deck: "Swamp" });
    lands(game, "Mountain", 5);
    const bear = spawn(game, "Grizzly Bears", B);
    cast(game, toHand(game, "Illicit Auction"), { targets: [ref(bear)], settle: false });
    bid(game, B, 2);
    bid(game, C);
    // Round to the caster again: 2 stands only if Alice and Carol both decline.
    bid(game, A, 3);
    bid(game, B);
    bid(game, C, 5);
    bid(game, A);
    bid(game, B);
    settle(game);
    expect(controller(game, bear)).toBe(C);
    expect([life(game, A), life(game, B), life(game, C)]).toEqual([20, 20, 15]);
  });

  it("a top must be higher; a bid may be more life than you have, and all of it is lost", () => {
    const { game } = table({ deck: "Swamp" });
    lands(game, "Mountain", 5);
    const bear = spawn(game, "Grizzly Bears");
    cast(game, toHand(game, "Illicit Auction"), { targets: [ref(bear)], settle: false });
    expect(asked(game).player).toBe(B);
    game.dispatch({ type: "choose-modes", player: B, modes: [0] });
    expect(asked(game)).toEqual({ player: B, kind: "choose-number" });
    expect(game.canDispatch({ type: "choose-number", player: B, number: 0 })).not.toBeNull();
    const offer = game.legalActions(B).find((a) => a.kind === "choose-number");
    expect(offer).toMatchObject({ min: 1 });
    expect(offer).not.toHaveProperty("max");
    game.dispatch({ type: "choose-number", player: B, number: 25 });
    bid(game, A);
    game.advanceUntil((s) => s.result.over || s.awaiting === null);
    expect(life(game, B)).toBe(-5);
    expect(game.state.players[B].hasLost).toBe(true);
  });

  it("Pain's Reward: you open at any number, and the high bidder draws four", () => {
    const { game } = table({ deck: "Swamp" });
    lands(game, "Swamp", 3);
    const reward = toHand(game, "Pain's Reward");
    const before = hand(game, B).length;
    cast(game, reward, { settle: false });
    const mine = hand(game).length;
    number(game, A, 4);
    bid(game, B, 6);
    bid(game, A);
    settle(game);
    expect(life(game, A)).toBe(20);
    expect(life(game, B)).toBe(14);
    expect(hand(game, B).length).toBe(before + 4);
    expect(hand(game).length).toBe(mine);
    expect(graveyard(game)).toContain(reward);
  });

  it("Pain's Reward: your opening bid standing is yours", () => {
    const { game } = table({ deck: "Swamp" });
    lands(game, "Swamp", 3);
    cast(game, toHand(game, "Pain's Reward"), { settle: false });
    const mine = hand(game).length;
    number(game, A, 0);
    bid(game, B);
    settle(game);
    expect(life(game, A)).toBe(20);
    expect(hand(game).length).toBe(mine + 4);
  });

  describe("Mages' Contest", () => {
    const contest = (players: 2 | 3 = 3): { game: Game; bolt: ObjectId; contest: ObjectId } => {
      const { game } = table({ players, deck: "Swamp" });
        lands(game, "Mountain", 1);
      lands(game, "Mountain", 3, B);
      const bolt = toHand(game, "Lightning Bolt");
      const contested = toHand(game, "Mages' Contest", B);
      cast(game, bolt, { targets: [ref(B)], settle: false });
      game.dispatch({ type: "pass-priority", player: A });
      return { game, bolt, contest: contested };
    };

    it("you win: only you and the spell's controller bid, and the spell is countered", () => {
      const { game, bolt, contest: card } = contest();
      cast(game, card, { player: B, targets: [ref(bolt)], settle: false });
      // Alice, the Bolt's controller, tops; Bob tops back; Carol is no bidder.
      bid(game, A, 2);
      bid(game, B, 3);
      bid(game, A);
      settle(game);
      expect(life(game, B)).toBe(17);
      expect(life(game, A)).toBe(20);
      expect(zone(game, bolt)).toBe("graveyard");
      // The Bolt never dealt its 3.
      expect(life(game, B)).toBe(17);
    });

    it("you lose: the other bidder loses their bid, and the spell resolves", () => {
      const { game, bolt, contest: card } = contest();
      cast(game, card, { player: B, targets: [ref(bolt)], settle: false });
      bid(game, A, 2);
      bid(game, B);
      settle(game);
      expect(life(game, A)).toBe(18);
      // Bob lost nothing to the bidding; the Bolt hit him.
      expect(life(game, B)).toBe(17);
    });

    it("on your own spell you alone bid: you lose 1 and counter it", () => {
      const { game } = table({ deck: "Swamp" });
        lands(game, "Mountain", 4);
      const bolt = toHand(game, "Lightning Bolt");
      const card = toHand(game, "Mages' Contest");
      cast(game, bolt, { targets: [ref(B)], settle: false });
      cast(game, card, { targets: [ref(bolt)], settle: false });
      settle(game);
      expect(life(game, A)).toBe(19);
      expect(life(game, B)).toBe(20);
      expect(zone(game, bolt)).toBe("graveyard");
    });
  });
});
