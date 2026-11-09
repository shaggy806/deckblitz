/**
 * An optional additional cost of life a permanent gives other spells (the
 * Defilers — "As an additional cost to cast green permanent spells, you may
 * pay 2 life. Those spells cost {G} less to cast if you paid life this way.
 * This effect reduces only the amount of green mana you pay."): announced as
 * the spell is cast (rule 601.2b), each way its own offer; the reduction only
 * with it paid (601.2f); payable only with the life (rules 118.3, 119.4); once
 * a spell for each Defiler (its rulings).
 */
import { describe, expect, it } from "vitest";
import type { LegalAction } from "../actions.js";
import type { Game } from "../game.js";
import type { ObjectId, PlayerId } from "../primitives.js";
import { A, B, cast, counters, hand, lands, life, settle, spawn, table, toHand, toLibrary, zone } from "./harness.js";

type CastOffer = Extract<LegalAction, { kind: "cast-spell" }>;
const offers = (game: Game, card: ObjectId, player: PlayerId = A): CastOffer[] =>
  game.legalActions(player).filter((a): a is CastOffer => a.kind === "cast-spell" && a.card === card);
const paying = (game: Game, card: ObjectId): (readonly ObjectId[] | undefined)[] =>
  offers(game, card).map((o) => o.optionalLife);
const untapped = (game: Game, ids: readonly ObjectId[]): number => ids.filter((id) => game.state.objects[id].tapped !== true).length;

describe("the Defilers' optional life on a spell cast by an effect (rule 601.2b)", () => {
  it("a cast-now offers it, paying it costs the life and takes {G} off", () => {
    const { game, a } = table();
    const defiler = spawn(game, "Defiler of Vigor");
    lands(game, "Forest", 1);
    const bears = toHand(game, "Grizzly Bears");
    const seen: (readonly ObjectId[] | undefined)[] = [];
    a.chooseCastNowFn = (_view, offer) => {
      seen.push(...offer.casts.map((c) => c.optionalLife));
      const way = offer.casts.find((c) => c.optionalLife !== undefined)!;
      return { type: "cast-spell", player: A, card: bears, targets: [], via: way.via, optionalLife: way.optionalLife! };
    };
    game.debugApplyEffect(A, { kind: "cast-now", from: "hand", filter: { name: "Grizzly Bears" } });
    settle(game);
    expect(seen).toContainEqual([defiler]);
    expect(life(game, A)).toBe(18);
    expect(zone(game, bears)).toBe("battlefield");
  });

  it("offered without paying its mana cost too (Defiler's life, still announced)", () => {
    const { game, a } = table();
    const defiler = spawn(game, "Defiler of Vigor");
    const bears = toHand(game, "Grizzly Bears");
    a.chooseCastNowFn = (_view, offer) => {
      const way = offer.casts.find((c) => c.optionalLife !== undefined)!;
      expect(way.optionalLife).toEqual([defiler]);
      return { type: "cast-spell", player: A, card: bears, targets: [], via: way.via, free: true, optionalLife: way.optionalLife! };
    };
    game.debugApplyEffect(A, { kind: "cast-now", from: "hand", filter: { name: "Grizzly Bears" }, free: true });
    settle(game);
    expect(life(game, A)).toBe(18);
    expect(zone(game, bears)).toBe("battlefield");
  });
});

describe("the Defilers' optional life (Defiler of Vigor)", () => {
  it("pays 2 life for {G} off a green permanent spell, the rest still paid", () => {
    const { game } = table();
    const defiler = spawn(game, "Defiler of Vigor");
    const forests = lands(game, "Forest", 1);
    const bears = toHand(game, "Grizzly Bears");
    // {1}{G} on one Forest: only by paying the life.
    const [offer, ...rest] = offers(game, bears);
    expect(rest).toEqual([]);
    expect(offer.optionalLife).toEqual([defiler]);
    expect(offer.optionalLifeText).toBe("paying 2 life for Defiler of Vigor");
    cast(game, bears, { optionalLife: [defiler] });
    expect(life(game, A)).toBe(18);
    expect(untapped(game, forests)).toBe(0);
    expect(zone(game, bears)).toBe("battlefield");
    // The cast trigger resolved before the Bears did.
    expect(counters(game, defiler)).toBe(1);
    expect(counters(game, bears)).toBe(0);
  });

  it("may go unpaid: the spell then costs its full cost", () => {
    const { game } = table();
    const defiler = spawn(game, "Defiler of Vigor");
    const forests = lands(game, "Forest", 2);
    const bears = toHand(game, "Grizzly Bears");
    expect(paying(game, bears)).toEqual([undefined, [defiler]]);
    cast(game, bears);
    expect(life(game, A)).toBe(20);
    expect(untapped(game, forests)).toBe(0);
    expect(counters(game, defiler)).toBe(1);
  });

  it("takes only green off: a {G} spell is free, the generic part never is", () => {
    const { game } = table();
    const defiler = spawn(game, "Defiler of Vigor");
    const elves = toHand(game, "Llanowar Elves");
    const bears = toHand(game, "Grizzly Bears");
    expect(paying(game, elves)).toEqual([[defiler]]);
    // {1}{G} less {G} is {1}, and there's no mana.
    expect(offers(game, bears)).toEqual([]);
    cast(game, elves, { optionalLife: [defiler] });
    expect(zone(game, elves)).toBe("battlefield");
    expect(life(game, A)).toBe(18);
  });

  it("asks nothing of an instant, another colour's spell, or an opponent's spell", () => {
    const { game } = table();
    spawn(game, "Defiler of Vigor");
    lands(game, "Forest", 1);
    lands(game, "Island", 2);
    const growth = toHand(game, "Giant Growth");
    spawn(game, "Grizzly Bears");
    expect(paying(game, growth)).toEqual([undefined]);
    const wall = toHand(game, "Wall of Air");
    expect(paying(game, wall)).toEqual([undefined]);
    const theirs = toHand(game, "Llanowar Elves", B);
    expect(game.state.objects[theirs].zone).toBe("hand");
    expect(game.legalActions(B).some((a) => a.kind === "cast-spell" && a.optionalLife !== undefined)).toBe(false);
  });

  it("needs the life (rules 118.3, 119.4), and names a Defiler that reaches the spell", () => {
    const { game } = table();
    const defiler = spawn(game, "Defiler of Vigor");
    lands(game, "Forest", 2);
    const bears = toHand(game, "Grizzly Bears");
    game.state.players[A].life = 1;
    expect(paying(game, bears)).toEqual([undefined]);
    expect(() => cast(game, bears, { optionalLife: [defiler] })).toThrow(/life/);
    game.state.players[A].life = 2;
    expect(paying(game, bears)).toEqual([undefined, [defiler]]);
    const forest = lands(game, "Forest", 1)[0];
    expect(() => cast(game, bears, { optionalLife: [forest] })).toThrow(/no life to pay/);
    expect(() => cast(game, bears, { optionalLife: [defiler, defiler] })).toThrow(/no life to pay/);
    cast(game, bears, { optionalLife: [defiler] });
    expect(life(game, A)).toBe(0);
  });

  it("is paid once a spell for each Defiler, each taking its own reduction", () => {
    const { game } = table();
    const one = spawn(game, "Defiler of Vigor");
    const two = spawn(game, "Defiler of Vigor");
    const forests = lands(game, "Forest", 3);
    const third = toHand(game, "Defiler of Vigor");
    // {3}{G}{G}: neither, either, or both.
    expect(paying(game, third)).toEqual([[one, two]]);
    lands(game, "Forest", 1);
    expect(paying(game, third)).toEqual([[one], [two], [one, two]]);
    cast(game, third, { optionalLife: [one, two] });
    expect(life(game, A)).toBe(16);
    expect(untapped(game, forests)).toBe(0);
    expect(zone(game, third)).toBe("battlefield");
  });
});

describe("Defilers of two colours on one spell (Defiler of Dreams)", () => {
  it("pays for each colour the spell has: a {G}{U} creature for 4 life and no mana, both triggers", () => {
    const { game } = table();
    const vigor = spawn(game, "Defiler of Vigor");
    const dreams = spawn(game, "Defiler of Dreams");
    toLibrary(game, "Island");
    toLibrary(game, "Island");
    const oracle = toHand(game, "Coiling Oracle");
    expect(paying(game, oracle)).toEqual([[vigor, dreams]]);
    const before = hand(game).length;
    cast(game, oracle, { optionalLife: [vigor, dreams] });
    expect(life(game, A)).toBe(16);
    expect(counters(game, vigor)).toBe(1);
    expect(zone(game, oracle)).toBe("battlefield");
    // Drew a card for Dreams as the Oracle left the hand.
    expect(hand(game).length).toBe(before);
  });

  it("Dreams draws for a blue permanent spell paid either way", () => {
    const { game } = table();
    const dreams = spawn(game, "Defiler of Dreams");
    const islands = lands(game, "Island", 3);
    toLibrary(game, "Island");
    const wall = toHand(game, "Wall of Air");
    expect(paying(game, wall)).toEqual([undefined, [dreams]]);
    const before = hand(game).length;
    cast(game, wall, { optionalLife: [dreams] });
    expect(life(game, A)).toBe(18);
    expect(untapped(game, islands)).toBe(1);
    expect(hand(game).length).toBe(before);
  });
});
