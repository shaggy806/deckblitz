/**
 * A spell's additional cost that's an act reading X, each one taking some of
 * the cost off (`additionalCost.reducesPerX`): Hierophant Bio-Titan's "you may
 * remove any number of +1/+1 counters from among creatures you control. This
 * spell costs {2} less to cast for each counter removed this way". How many is
 * announced as it's cast (rule 601.2b), the reduction is on the generic part
 * only (601.2f), and which creatures give them is chosen as it's paid (601.2h).
 */
import { describe, expect, it } from "vitest";

import type { LegalAction } from "../actions.js";
import { HeuristicBotController } from "../controller.js";
import type { Game } from "../game.js";
import type { ObjectId } from "../primitives.js";
import { A, B, cast, counters, lands, spawn, table, toHand, zone } from "./harness.js";

type CastOffer = Extract<LegalAction, { kind: "cast-spell" }>;
const castOffers = (game: Game, card: ObjectId): CastOffer[] =>
  game.legalActions(A).filter((x): x is CastOffer => x.kind === "cast-spell" && x.card === card);
const setCounters = (game: Game, id: ObjectId, n: number): void => {
  game.state.objects[id].counters["+1/+1"] = n;
};

describe("Hierophant Bio-Titan", () => {
  it("the fewest and most counters that pay; each takes {2} off; the creatures giving them are chosen", () => {
    const { game, a } = table();
    lands(game, "Forest", 4);
    const bear = spawn(game, "Grizzly Bears");
    const elf = spawn(game, "Llanowar Elves");
    setCounters(game, bear, 3);
    setCounters(game, elf, 2);
    // An opponent's counters can't pay.
    setCounters(game, spawn(game, "Hill Giant", B), 4);
    const titan = toHand(game, "Hierophant Bio-Titan");
    const [offer] = castOffers(game, titan);
    // {10}{G}{G} with four Forests: four counters leave {2}{G}{G}; all five, {G}{G}.
    expect(offer?.xCost).toEqual({ maxX: 5, minX: 4, removesCounters: true });
    expect(() => cast(game, titan, { x: 3 })).toThrow(/cannot pay/);
    let asked: { min: number; max: number; eligible: readonly ObjectId[] } | undefined;
    a.chooseCounterRemovalsFn = (_view, removal) => {
      asked = { min: removal.min, max: removal.max, eligible: removal.eligible.map((e) => e.object) };
      return [
        { object: bear, kind: "+1/+1", count: 2 },
        { object: elf, kind: "+1/+1", count: 2 },
      ];
    };
    cast(game, titan, { x: 4 });
    expect(asked?.min).toBe(4);
    expect(asked?.max).toBe(4);
    expect([...(asked?.eligible ?? [])].sort()).toEqual([bear, elf].sort());
    expect(counters(game, bear)).toBe(1);
    expect(counters(game, elf)).toBe(0);
    expect(zone(game, titan)).toBe("battlefield");
  });

  it("any number may be removed, even past what lowers the cost further — never below {G}{G}", () => {
    const { game, a } = table();
    lands(game, "Forest", 2);
    const bear = spawn(game, "Grizzly Bears");
    setCounters(game, bear, 7);
    const titan = toHand(game, "Hierophant Bio-Titan");
    const [offer] = castOffers(game, titan);
    expect(offer?.xCost).toEqual({ maxX: 7, minX: 5, removesCounters: true });
    a.chooseCounterRemovalsFn = (_view, removal) => [{ object: bear, kind: "+1/+1", count: removal.max }];
    cast(game, titan, { x: 7 });
    expect(counters(game, bear)).toBe(0);
    expect(zone(game, titan)).toBe("battlefield");
  });

  it("with mana enough, none need go", () => {
    const { game } = table();
    lands(game, "Forest", 12);
    const bear = spawn(game, "Grizzly Bears");
    setCounters(game, bear, 2);
    const titan = toHand(game, "Hierophant Bio-Titan");
    const [offer] = castOffers(game, titan);
    expect(offer?.xCost).toEqual({ maxX: 2, removesCounters: true });
    cast(game, titan, { x: 0 });
    expect(counters(game, bear)).toBe(2);
    expect(zone(game, titan)).toBe("battlefield");
  });

  it("isn't offered when no number of counters pays", () => {
    const { game } = table();
    lands(game, "Forest", 3);
    setCounters(game, spawn(game, "Grizzly Bears"), 3);
    const titan = toHand(game, "Hierophant Bio-Titan");
    expect(castOffers(game, titan)).toHaveLength(0);
  });

  it("v1 casts it removing only as many counters as it takes", () => {
    const { game } = table();
    lands(game, "Forest", 4);
    setCounters(game, spawn(game, "Grizzly Bears"), 6);
    const titan = toHand(game, "Hierophant Bio-Titan");
    const bot = new HeuristicBotController(A, game.registry);
    // The titan's offer alone: the drawn Wastes would be played first.
    const action = bot.act({ state: game.state, player: A, legalActions: () => castOffers(game, titan) });
    expect(action).toMatchObject({ type: "cast-spell", card: titan, xValue: 4 });
  });
});
